# softandsweet/google-siglip-base-patch16-224-rngd-fxbx

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una variante de despliegue del checkpoint oficial `google/siglip-base-patch16-224` adaptada para ejecutarse sobre la NPU Furiosa RNGD. El autor (`softandsweet`) publica el paquete `fxbx`, que permite lanzar los dos codificadores de SigLIP (imagen y texto) en BF16 sobre aceleradores Furiosa, manteniendo la tokenización, el preprocesado de imagen y el cálculo de similitud en el host. La licencia declarada es Apache 2.0, heredada del modelo base.

SigLIP (Sigmoid Loss for Language-Image Pre-training) es un modelo de visión-lenguaje de tipo dual-encoder: un ViT procesa la imagen y un transformer de texto procesa las descripciones candidatas, generando embeddings que se comparan por similitud coseno. La variante base con patch de 16 píxeles y resolución 224×224 es la configuración más ligera de la familia y está pensada para tareas de clasificación zero-shot, recuperación imagen-texto y etiquetado automático.

La relevancia de este repositorio es acotada: no aporta pesos nuevos ni mejoras de precisión, sino una ruta de ejecución validada sobre hardware NPU específico (Furiosa RNGD) con números de latencia medidos. Es útil para equipos que ya operan infraestructura Furiosa y quieren desplegar SigLIP sin reescribir el pipeline, pero no para quien busque un modelo con mejor rendimiento que el original de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-encoder transformer (ViT para imagen + transformer de texto), preentrenamiento SigLIP |
| Parametros totales | no disponible (el modelo base `siglip-base-patch16-224` ronda los 200 M, pero el dato no se declara en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana de texto generativa; la model card indica entradas de hasta 64 tokens por frase en el ejemplo validado |
| Tipos de cuantizacion | BF16 en ambos codificadores (único formato validado en la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el paquete descarga el checkpoint oficial desde Hugging Face en la primera ejecución; revisión fijada `7fd15f0689c79d79e38b1c2e2e2370a7bf2761ed`) |

## Arquitectura y entrenamiento

El modelo subyacente es SigLIP en configuración base con patch de 16 y entrada de 224×224. Se compone de un Vision Transformer que proyecta la imagen en un embedding y de un codificador de texto que proyecta cada descripción candidata en el mismo espacio latente. A diferencia de CLIP, SigLIP se entrena con una pérdida sigmoide por par imagen-texto en lugar de softmax sobre el lote, lo que permite lotes más grandes y un entrenamiento más estable. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste fino adicionales.

Este repositorio concreto no reentrena el modelo: empaqueta el checkpoint oficial y lo ejecuta sobre la NPU Furiosa RNGD con los dos codificadores en BF16. El preprocesado de imagen, la tokenización y el cálculo final de similitud se ejecutan en el host, mientras que las pasadas forward de cada codificador se delegan a la NPU. Según la model card, la validación se hizo con Furiosa RNGD (1 unidad), SDK 2026.4.0 y fxbX 0.9.9, con entradas de imagen 224×224 y frases de hasta 64 tokens.

## Capacidades

- Clasificación zero-shot de imágenes contra un conjunto de etiquetas textuales candidatas.
- Recuperación imagen-texto (image-text retrieval): ordenar descripciones por relevancia dada una imagen.
- Etiquetado automático y organización de colecciones fotográficas por tema.
- Búsqueda por similitud semántica entre imágenes y consultas en lenguaje natural.
- Puntuación de similitud normalizada entre 0 y 1 por par imagen-texto.
- Ejecución en NPU Furiosa RNGD mediante el paquete `fxbx` y su CLI.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni agentes: es un modelo de embeddings, no un LLM.
- No se declaran capacidades de audio ni de visión más allá de la codificación de imagen estándar.

## Casos de uso

- Moderación y filtrado de imágenes en pipelines de contenido: se comparan las imágenes entrantes contra un conjunto de etiquetas de política y se ordenan por similitud para derivar a revisión humana las de mayor puntuación.
- Organización automática de fototecas: agrupar imágenes por tema calculando el embedding de cada foto y agrupando por vecindad con las etiquetas candidatas definidas por el equipo.
- Búsqueda semántica en catálogos visuales: indexar embeddings de producto y resolver consultas en lenguaje natural comparando contra el codificador de texto.
- Etiquetado de datasets de entrenamiento: preasignar etiquetas a imágenes nuevas antes de la revisión manual, reduciendo el coste de anotación.
- Clasificación zero-shot en entornos con clases cambiantes: al no requerir reentrenamiento, basta con redefinir las frases candidatas para adaptarse a nuevas categorías.
- Despliegue en infraestructura NPU Furiosa: equipos que ya operan RNGD pueden servir SigLIP con latencias medidas (588 ms de mediana por pasada de imagen, 174 ms por pasada de texto en la configuración validada) sin salir de su stack.
- Verificación de accesibilidad o descripción automática asistida: generar candidatos de descripción para revisión, no como texto final generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card sí incluye mediciones de latencia en hardware Furiosa RNGD:

| Encoder | Primera llamada | Mediana en repetición | Pasos NPU registrados |
|---|---:|---:|---:|
| Imagen | 591 ms | 588 ms | 5.505 |
| Texto | 177 ms | 174 ms | 621 |

Condiciones declaradas: 1× Furiosa RNGD, SDK 2026.4.0, fxbX 0.9.9, imagen 224×224, frases de hasta 64 tokens, ambos codificadores en BF16, preprocesado y similitud en host. En una prueba con dos imágenes y tres frases candidatas, el primer resultado coincidió con la ejecución en CPU; la diferencia máxima de logits frente a CPU BF16 fue de 0,04768, sin fallbacks a CPU ni compilaciones en tiempo de ejecución. Las cifras corresponden a una sola entrada por encoder en ejecución aislada.

## Requisitos de hardware

- Acelerador validado: 1× Furiosa RNGD (NPU). No se documenta ejecución en GPU en la información proporcionada.
- Memoria: no se declara VRAM ni HBM requerida; el modelo base es pequeño (familia base de SigLIP), pero el dato concreto no está disponible.
- GPU de consumo: no se confirma compatibilidad; el paquete está orientado a la NPU Furiosa. La ejecución en CPU BF16 se usa como referencia de comparación en la model card.
- Despliegue: paquete `fxbx` (versión validada 0.9.9) con CLI `fxbx run siglip-base-patch16-224 --sample`; instrucciones de servido y llamada desde Python en `USAGE.md`.
- Latencia: 588 ms de mediana por codificación de imagen y 174 ms por codificación de texto en la configuración validada; el throughput agregado no se declara.
- Los pesos se descargan del Hub a la caché de Hugging Face en la primera ejecución.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `softandsweet/google-siglip-base-patch16-224-rngd-fxbx` (este) | no disponible | imagen 224×224, frases hasta 64 tokens en el ejemplo validado | Clasificación zero-shot y retrieval | Apache 2.0 | Hub de Hugging Face, requiere NPU Furiosa RNGD |
| `google/siglip-base-patch16-224` | no disponible en la información proporcionada | imagen 224×224 | Clasificación zero-shot y retrieval | Apache 2.0 | Hub de Hugging Face, ejecutable en GPU/CPU con transformers |
| `openai/clip-vit-base-patch32` | no disponible en la información proporcionada | imagen 224×224 | Clasificación zero-shot y retrieval | MIT (según el modelo original) | Hub de Hugging Face |
| `google/siglip-so400m-patch14-384` | no disponible en la información proporcionada | imagen 384×384 | Clasificación zero-shot y retrieval de mayor resolución | Apache 2.0 | Hub de Hugging Face |

La diferencia práctica de este repositorio frente al checkpoint de Google es el backend de ejecución (NPU Furiosa) y las latencias medidas, no la calidad del modelo. Para comparativas de precisión habría que consultar los resultados publicados del SigLIP original, que no se incluyen en la información disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo puntuaciones de similitud entre imagen y frases candidatas.
- El rendimiento en clasificación depende críticamente de la formulación de las frases candidatas; etiquetas ambiguas o muy genéricas degradan los resultados.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada; al heredar el checkpoint de Google, arrastra los sesgos del dataset de preentrenamiento original.
- Riesgo de falsos positivos en moderación o etiquetado automático: la similitud no equivale a una decisión fiable sin umbral calibrado y revisión humana.
- Idiomas soportados no declarados; el codificador de texto de SigLIP está entrenado principalmente en inglés, por lo que el rendimiento en castellano no está garantizado ni medido aquí.
- Dependencia de hardware: la ruta validada requiere Furiosa RNGD con SDK 2026.4.0 y fxbX 0.9.9; otras versiones no están verificadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint base y de las imágenes de muestra referenciadas en `NOTICE.md`.
- El tamaño del repo es 0.0 GB porque los pesos no se alojan en el repositorio; se descargan en la primera ejecución, lo que introduce dependencia de red y de la revisión fijada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/softandsweet/google-siglip-base-patch16-224-rngd-fxbx
- Modelo base: https://huggingface.co/google/siglip-base-patch16-224
- Documentación de uso del paquete: `USAGE.md` (referenciado en la model card)
- Aviso de licencias de imágenes de muestra: `NOTICE.md` (referenciado en la model card)
- Paper de SigLIP: no disponible en la información proporcionada
- Repositorio del paquete `fxbx` y de Furiosa RNGD: no disponible en la información proporcionada

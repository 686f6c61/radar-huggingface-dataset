# hwansung595/memome-photo-search

## Resumen

memome-photo-search es un paquete de pesos ONNX derivado de google/siglip2-base-patch16-256, el modelo de visión-lenguaje de Google basado en SigLIP 2. Lo publica el usuario hwansung595 como componente de inferencia para la función de búsqueda de fotos de la aplicación Memome, que ejecuta el modelo en el propio teléfono mediante ONNX Runtime. No es un modelo entrenado desde cero: es una exportación cuantizada a 4 bits del checkpoint original, con una modificación concreta en la torre de texto.

La relevancia técnica está en esa modificación: el autor extrae la tabla de embeddings de tokens del modelo de texto a un fichero aparte (`token_rows.bin`) y deja en el grafo ONNX solo la parte que proyecta las representaciones de tokens. Esto reduce el espacio ocupado por el modelo de texto de unos 440 MB a unos 68 MB, porque el dispositivo lee únicamente las 64 filas correspondientes a los tokens de la consulta en lugar de cargar el vocabulario completo. El resultado es un buscador semántico de imágenes por texto, zero-shot, que cabe en un móvil.

El modelo conserva la arquitectura y el comportamiento de SigLIP 2 base: pares imagen-texto con similitud coseno, entrada de imagen de 256x256 píxeles y representaciones de 768 dimensiones. La licencia es Apache 2.0, heredada del modelo base de Google. El repositorio ocupa 0,3 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SigLIP 2 (par de torres transformer visión-texto), exportado a ONNX y cuantizado a 4 bits |
| Parámetros totales | no disponible (el modelo base es SigLIP 2 base patch16-256; el recuento exacto no se indica en la información disponible) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens de texto (fijo, con padding a 64); imagen de 256x256 píxeles |
| Tipos de cuantización | 4 bits para los pesos de ambas torres; tabla de tokens en int8 con escalas float32 |
| Idiomas soportados | no disponible (el tokenizador es SentencePiece; la model card no detalla cobertura lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`vision_model_q4.onnx`, `text_model_q4_rows.onnx`), más `token_rows.bin` y `tokenizer.model` |

## Arquitectura y entrenamiento

La arquitectura subyacente es SigLIP 2 en configuración base con parches de 16x16 y resolución de 256x256, un modelo de dos torres que proyecta imágenes y textos a un espacio compartido y puntúa la afinidad mediante similitud coseno. La torre de visión procesa la imagen completa reescalada a un cuadrado de 256x256 con píxeles normalizados en el rango -1..1 y produce un `pooler_output` de 768 valores. La torre de texto procesa secuencias de hasta 64 tokens, en minúsculas, terminadas en el token 1 y rellenadas con 0, y produce igualmente un vector de 768 dimensiones.

No se ha realizado entrenamiento adicional ni ajuste fino por parte del autor: los pesos proceden de la exportación de onnx-community (revisión `d1114256522a37ffa257a0a58017348ab0058db2`), que a su vez deriva del checkpoint de Google. La innovación es de despliegue, no de modelado: la tabla de embeddings de tokens (256.000 entradas de 768 valores int8, cada una con su escala float32) se separa del grafo y se almacena en `token_rows.bin`, de modo que el intérprete ONNX solo recibe las 64 filas necesarias para una consulta. La cuantización a 4 bits de ambas torres completa el ajuste para ejecución en dispositivo. No se documentan datos de entrenamiento, composición del dataset ni etapas de RLHF o DPO en la información disponible.

## Capacidades

- Clasificación de imágenes zero-shot: asigna puntuaciones de afinidad entre una imagen y un conjunto de etiquetas o descripciones textuales sin entrenamiento específico.
- Búsqueda semántica de fotos por texto: genera embeddings de imagen y de consulta y los compara por similitud coseno.
- Representación de imágenes en un vector de 768 dimensiones a partir de una entrada de 256x256 píxeles.
- Representación de texto en un vector de 768 dimensiones para secuencias de hasta 64 tokens.
- Ejecución en dispositivo mediante ONNX Runtime, sin dependencia de servidor.
- Multilingüismo: no documentado en la model card; depende de la cobertura del tokenizador SentencePiece heredado de SigLIP 2.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es un modelo de emparejamiento imagen-texto, no un modelo generativo.
- No dispone de modo thinking, visión generativa, audio ni capacidades de agente.

## Casos de uso

- Búsqueda de fotos en la galería del móvil: el usuario escribe "recibo del supermercado" o "perro en la playa" y la aplicación calcula el embedding de la consulta con `text_model_q4_rows.onnx` y lo compara por similitud coseno con los embeddings de imagen precalculados. El tamaño reducido del modelo de texto (unos 68 MB) permite mantenerlo residente en memoria en un teléfono de gama media.
- Indexación incremental de la galería: al capturar una foto, la aplicación ejecuta `vision_model_q4.onnx` sobre la imagen reescalada a 256x256 y almacena el vector de 768 valores. El coste por imagen es una única pasada de la torre de visión, viable en segundo plano.
- Etiquetado automático de imágenes: con un conjunto fijo de categorías ("documento", "paisaje", "comida", "captura de pantalla") se obtienen puntuaciones zero-shot que permiten agrupar o filtrar la galería sin anotaciones manuales.
- Filtrado y moderación de contenido en local: clasificación de imágenes entrantes contra un conjunto de descripciones predefinidas antes de subirlas a un servicio, sin enviar los píxeles fuera del dispositivo.
- Deduplicación y agrupación visual: los embeddings de imagen permiten agrupar fotos similares (ráfagas, duplicados) calculando distancias coseno entre vectores de 768 dimensiones.
- Prototipado de recuperación multimodal sin GPU: al ser un paquete ONNX de 0,3 GB, se puede ejecutar en portátiles y entornos de CI para validar pipelines de búsqueda antes de desplegar en servidor.
- Aplicaciones de accesibilidad: descripción por consulta de texto sobre la galería local para localizar una foto concreta sin navegar por miniaturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recuperación (Recall@k, mAP) ni comparaciones con el checkpoint original de SigLIP 2, por lo que no es posible cuantificar la pérdida de precisión introducida por la cuantización a 4 bits ni por la separación de la tabla de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 0,3 GB y el modelo de texto reducido unos 68 MB, por lo que la huella en memoria es del orden de cientos de megabytes.
- GPU recomendadas: no se especifican. Al ser un modelo ONNX de pequeño tamaño, es ejecutable en CPU y en GPUs de consumo; no requiere A100 ni H100.
- GPU de consumo: cabe holgadamente en cualquier GPU con más de 1 GB de memoria; el objetivo declarado es la ejecución en teléfono con ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (objetivo principal, en dispositivo); también es posible servirlo con servidores compatibles con ONNX, aunque la model card no documenta ninguna integración con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card solo indica el ahorro de memoria del modelo de texto (de 440 MB a 68 MB) y que el dispositivo lee las 64 filas necesarias por consulta.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto de texto | Resolución de imagen | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|---|
| memome-photo-search (este) | SigLIP 2 base patch16-256, dos torres | 64 tokens | 256x256 | 4 bits, tabla de tokens en int8 | Apache 2.0 | ONNX |
| google/siglip2-base-patch16-256 | SigLIP 2 base patch16-256, dos torres | no disponible en la información | 256x256 | pesos originales | Apache 2.0 | safetensors (checkpoint original) |
| onnx-community/siglip2-base-patch16-256-ONNX | SigLIP 2 base patch16-256, dos torres | no disponible en la información | 256x256 | exportación ONNX estándar | Apache 2.0 | ONNX |

La diferencia frente a las dos alternativas es el recorte de la tabla de embeddings de tokens y la cuantización a 4 bits, orientados a reducir la memoria en dispositivo. No se dispone de datos de rendimiento comparado entre las tres variantes.

## Limitaciones y advertencias

- Modelo de emparejamiento imagen-texto, no generativo: no produce texto, código ni razonamiento; cualquier uso en ese sentido es un error de expectativa.
- Ventana de texto fija de 64 tokens: las consultas largas se truncan o se rellenan, lo que puede degradar la precisión en descripciones extensas.
- Resolución de imagen fija de 256x256 con la foto deformada a un cuadrado: se pierden detalles finos, texto pequeño y relaciones de aspecto, lo que afecta a búsquedas sobre documentos o capturas.
- Cuantización a 4 bits sin métricas publicadas: se desconoce la pérdida de precisión frente al checkpoint original; conviene validar Recall@k sobre un conjunto propio antes de producción.
- La separación de la tabla de tokens es una modificación del grafo original: requiere usar el fichero `token_rows.bin` y el `tokenizer.model` proporcionados de forma conjunta; no es intercambiable con otras exportaciones de SigLIP 2.
- Sesgos: no documentados en la model card; al heredar los datos de entrenamiento de SigLIP 2, es razonable esperar sesgos culturales y de representación del corpus original, pero no se aporta evidencia al respecto.
- Riesgo de falsos positivos en similitud coseno: la puntuación no está calibrada para umbrales absolutos; hay que ajustar el umbral por aplicación.
- Cobertura idiomática no documentada: el tokenizador es SentencePiece y la model card no detalla qué idiomas funcionan bien; el castellano no está verificado.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar el aviso de licencia y atribución a Google y a los autores de la exportación.
- Repositorio sin descargas ni likes y creado en noviembre de 2026: no hay evidencia de uso en producción ni mantenimiento continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hwansung595/memome-photo-search
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-256
- Exportación ONNX de referencia: https://huggingface.co/onnx-community/siglip2-base-patch16-256-ONNX

# JoshHughes/siglip2-base-patch16-224-f16

## Resumen

`JoshHughes/siglip2-base-patch16-224-f16` es una copia en precisión de 16 bits (float16) del codificador visión-lenguaje SigLIP 2 Base de Google, con parches de 16x16 píxeles y resolución de entrada de 224x224. No es un modelo generativo ni un LLM: es un codificador dual (imagen y texto) que proyecta ambos dominios en un espacio compartido de 768 dimensiones, pensado para tareas de clasificación zero-shot, recuperación imagen-texto y generación de embeddings multimodales. Lo publica Josh Hughes como artefacto de referencia para su proyecto Local Model Access (LMA).

El interés de esta réplica concreta es práctico: reduce el fichero de pesos de aproximadamente 1,5 GB en float32 a unos 755 MB en float16, manteniendo los 408 tensores, sus nombres, formas y orden originales. Esto permite descargar el modelo como un único fichero `model.safetensors` (con el tokenizador SentencePiece de Gemma embebido como tensor `file:tokenizer.model`) y ejecutarlo en el navegador vía WebGPU o CPU, que es el caso de uso que motiva la publicación.

Es relevante ahora porque SigLIP 2, presentado por Tschannen et al. en 2025, mejora la comprensión semántica, la localización y las características densas respecto a SigLIP original, y porque la variante float16 demuestra que es posible servir un embedder multimodal de 379 millones de parámetros en el cliente sin infraestructura de servidor, a costa de una pérdida de precisión acotada (error relativo máximo de redondeo de 4,9e-4 y similitud coseno de 0,99998 o superior frente al original en float32).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2: codificador dual imagen-texto tipo transformer (ViT para imagen, encoder de texto), con objetivos de aprendizaje tipo sigmoide |
| Parametros totales | 379.428.973 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; el texto se tokeniza con relleno a 64 tokens (`padding="max_length", max_length=64`) |
| Tipos de cuantizacion | float16 (esta réplica); el original se distribuye en float32; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible en la información proporcionada (SigLIP 2 se describe como multilingüe en el paper, sin listado de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float16); tokenizador SentencePiece (Gemma) embebido como tensor `file:tokenizer.model`; ficheros auxiliares `config.json`, `preprocessor_config.json`, `tokenizer.json`, `tokenizer_config.json`, `special_tokens_map.json` |

## Arquitectura y entrenamiento

El modelo subyacente es SigLIP 2 Base con parches de 16 píxeles y entrada de 224x224, un codificador dual que empareja una torre de visión (ViT) y una torre de texto, ambas proyectando a un espacio compartido de 768 dimensiones. A diferencia de CLIP, SigLIP emplea una pérdida sigmoide sobre pares imagen-texto en lugar de softmax sobre el lote completo, lo que permite entrenar con lotes más pequeños y mejora la calidad de los embeddings. SigLIP 2 añade mejoras en comprensión semántica, localización y características densas, según el paper de Tschannen et al. (2025). No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO (no aplicables de forma estándar a un codificador de este tipo).

La contribución de esta réplica es puramente de conversión: cada tensor float32 del original se redondea a float16 (redondeo al más cercano, empates al par) con la herramienta `tools/f16_copy.py` de LMA, un tensor a la vez, sin alterar nombres, formas ni orden. El tokenizador se transporta dentro del propio fichero de pesos como tensor unidimensional `U8` denominado `file:tokenizer.model`, de modo que todo el modelo es un único fichero descargable. La precisión resultante se documenta explícitamente: error relativo máximo de redondeo de 4,9e-4 para valores superiores a 1e-4, y similitud coseno de al menos 0,99998 frente al original en las imágenes y preguntas probadas. El texto se entrena y procesa en minúsculas (`do_lower_case`), un detalle que afecta al preprocesado.

## Capacidades

- Generación de embeddings de imagen y de texto en un espacio compartido de 768 dimensiones.
- Clasificación de imágenes zero-shot mediante comparación de embeddings con etiquetas textuales.
- Recuperación imagen-texto y texto-imagen (búsqueda semántica entre capturas y descripciones).
- Coincidencia entre una captura de pantalla y una pregunta en lenguaje natural, que es el caso de uso declarado en LMA.
- Procesamiento de texto en minúsculas con relleno a 64 tokens; el tokenizador es el vocabulario SentencePiece de Gemma.
- Ejecución en navegador con WebGPU o CPU mediante el embedder de LMA, con lectura del fichero por segmentos y acceso solo a las filas del tokenizador usadas por cada consulta.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni agentes: es un codificador, no un modelo generativo.
- Capacidades multilingües: el paper de SigLIP 2 las menciona, pero no se detallan idiomas concretos en la información disponible.

## Casos de uso

- Búsqueda semántica dentro de una guía de interfaz de usuario: el sitio embebe imágenes de su UI con este fichero y el visitante embebe su captura o su pregunta en el dispositivo; el sistema devuelve la entrada de la guía que responde a "¿cómo hago esto?". Es el caso de uso de referencia de LMA y aprovecha que el modelo cabe en un fichero de 755 MB.
- Clasificación zero-shot de imágenes en el cliente: dado un conjunto de etiquetas textuales, se calcula el embedding de la imagen y se compara con los de las etiquetas sin entrenamiento específico, útil para etiquetado rápido de capturas o fotos.
- Moderación o triaje visual ligero: comparar una imagen entrante contra un conjunto de descripciones de referencia para decidir si requiere revisión humana, con inferencia local y sin enviar la imagen a un servidor.
- Deduplicación y agrupación de capturas de pantalla: generar embeddings de un corpus de imágenes y agrupar por similitud coseno para organizar documentación o bases de conocimiento visuales.
- Recuperación multimodal en documentación técnica: indexar diagramas, capturas y figuras con embeddings de imagen y permitir consultas en lenguaje natural sobre ellas dentro de una herramienta interna.
- Prototipado de sistemas de recomendación visual: emparejar descripciones de producto o preferencias del usuario con imágenes de catálogo mediante similitud en el espacio compartido, sin necesidad de GPU dedicada.
- Evaluación y pruebas de pipelines de embeddings: al ser una réplica fiel y verificable (hash sha256 documentado), sirve como referencia reproducible en tests de regresión de sistemas de recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta métricas de fidelidad de la conversión: error relativo máximo de redondeo de 4,9e-4 (para valores superiores a 1e-4) y similitud coseno de 0,99998 o superior frente al original float32 en las imágenes y preguntas probadas.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos en float16 ocupa 754.665.695 bytes (unos 755 MB); cargado en float32 en memoria, como indica el ejemplo de la model card, requiere aproximadamente 1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre para la variante float16; no se documentan requisitos específicos de A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna con 2 GB o más de VRAM; también es viable en CPU.
- Opciones de despliegue: `transformers` (carga con `AutoModel` y `AutoProcessor`), y el embedder de LMA (`lma/embed/`) sobre WebGPU o CPU en el navegador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de texto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| JoshHughes/siglip2-base-patch16-224-f16 | 379.428.973 | relleno a 64 tokens | Apache-2.0 | safetensors float16 | Réplica float16 con tokenizador embebido; un solo fichero de 755 MB |
| google/siglip2-base-patch16-224 | 379.428.973 (mismo modelo base) | relleno a 64 tokens | Apache-2.0 | safetensors float32 | Original de Google; fichero de 1.500.800.904 bytes |
| CLIP ViT-B/32 (referencia de la categoría) | no disponible en la información | no disponible | no disponible | no disponible | Alternativa clásica de codificador dual; sin datos comparativos en la información disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona y no soporta tool calling ni agentes; cualquier uso que requiera generación debe combinarse con otro modelo.
- La conversión a float16 introduce un error de redondeo acotado pero real (relativo máximo 4,9e-4); para aplicaciones que exijan la máxima fidelidad numérica, conviene usar el original float32.
- El texto debe pasarse en minúsculas y con relleno a 64 tokens; ignorar este preprocesado degrada los embeddings.
- El tokenizador embebido aparece como tensor no usado al cargar con `transformers`; herramientas que validen estrictamente los tensores del fichero pueden marcarlo como advertencia.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la similitud entre embeddings puede producir emparejamientos erróneos en dominios visuales alejados de los datos de entrenamiento.
- Sesgos: no se documentan sesgos específicos en la información disponible; al heredar los pesos de SigLIP 2, arrastra los sesgos de su dataset de entrenamiento, no detallado aquí.
- Idiomas: la información no detalla qué idiomas cubre el encoder de texto; el paper describe SigLIP 2 como multilingüe, pero sin listado verificable.
- Licencia Apache-2.0, que permite uso comercial; el fichero `NOTICE` documenta los cambios respecto al original y debe conservarse.
- El modelo lo publica un autor individual (JoshHughes) como artefacto de un proyecto personal, con 0 descargas y 0 likes en el momento de la consulta; no hay garantía de mantenimiento ni de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoshHughes/siglip2-base-patch16-224-f16
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-224
- Paper de SigLIP 2: https://arxiv.org/abs/2502.14786
- Repositorio Local Model Access (LMA): https://github.com/ArtistJoshHughes/local-model-access

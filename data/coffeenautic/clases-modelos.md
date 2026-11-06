# Coffeenautic/clases-modelos

## Resumen

`Coffeenautic/clases-modelos` no es un modelo de lenguaje entrenado desde cero, sino un repositorio agregador de artefactos de inferencia que usan las demos de un curso de IA. Reúne pesos ya convertidos o exportados para su ejecución en el navegador (principalmente ONNX y TFLite), junto con revisiones concretas de modelos de terceros que han cambiado en origen. El autor, Coffeenautic, actúa por tanto como empaquetador y no como desarrollador de los pesos subyacentes.

El contenido se organiza en carpetas que replican la ruta del repositorio original: BETO (`dccuchile/bert-base-spanish-wwm-cased`) empaquetado en int8 por fila con su escala, una exportación ONNX cuantizada de CLIP ViT-B/32 que devuelve tensores internos, una revisión del decodificador de Florence-2-base-ft y varios ficheros `.tflite`/`.task` de MediaPipe alojados sin cambios. El tamaño total del repositorio es de 0,4 GB y acumula 16 descargas con 0 likes en el momento de la consulta.

Su relevancia es práctica: sirve como espejo reproducible de artefactos de borde (edge) para demos didácticas, evitando depender de conversiones efímeras o de revisiones que cambian en los repositorios originales. No obstante, no debe confundirse con un modelo único: la ficha describe el repositorio y cada uno de sus componentes, sin atribuirle capacidades generativas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Contenedor de multiples artefactos: BERT (BETO), CLIP ViT-B/32, Florence-2 y modelos MediaPipe |
| Parametros totales | no disponible (depende de cada artefacto; BETO base ~110 M, CLIP ViT-B/32 ~151 M, Florence-2-base ~0,23 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (BETO: 512 tokens; CLIP: 77 tokens de texto; Florence-2: variable) |
| Tipos de cuantizacion | int8 por fila con escala (BETO), ONNX cuantizado (CLIP), TFLite (MediaPipe) |
| Idiomas soportados | no disponible a nivel de repositorio; BETO esta entrenado en espanol, CLIP y Florence-2 son mayoritariamente ingles |
| Licencia | other (agregada); cada artefacto conserva su licencia: CC BY 4.0 (BETO), MIT (CLIP, Florence-2), Apache 2.0 (MediaPipe) |
| Formato de pesos | safetensors/bin empaquetado, ONNX, TFLite, .task |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: agrega artefactos derivados de arquitecturas preexistentes. BETO es un transformer encoder tipo BERT entrenado con masked language modeling sobre un corpus en espanol (Cañete et al., 2020); aqui se distribuye con los pesos cuantizados a int8 por fila y una escala asociada en JSON. CLIP ViT-B/32 es un modelo vision-lenguaje de OpenAI con torres de imagen (ViT) y texto (transformer), exportado a ONNX cuantizado y modificado para exponer tensores internos (`*_ocultos_quantized.onnx`). Florence-2-base-ft de Microsoft es un modelo vision-lenguaje multitarea; en este repositorio solo se conserva una revisión del decodificador con la que se probaron las demos.

Los ficheros `.tflite` y `.task` corresponden a modelos de MediaPipe (Google) y se alojan sin modificaciones. El proceso de publicacion esta automatizado mediante `_framework/tools/publicar.mjs`, que solo incorpora los ficheros que no coinciden byte a byte con su original, lo que garantiza que cada entrada tenga una justificacion de divergencia respecto a la fuente.

## Capacidades

- Clasificacion y representacion de texto en espanol mediante BETO (embeddings contextuales, clasificacion de secuencias, NER, QA extractiva).
- Similitud imagen-texto y clasificacion zero-shot con CLIP ViT-B/32.
- Tareas vision-lenguaje con Florence-2: captioning, deteccion de objetos, OCR y grounding de frases.
- Inferencia en navegador y en dispositivos de borde gracias a los formatos ONNX y TFLite.
- Inspeccion de activaciones internas de CLIP mediante los tensores ocultos exportados.
- No soporta tool calling, agentes ni generacion de texto autoregresiva de proposito general.
- Capacidades multilingues limitadas al ambito de cada modelo subyacente (espanol en BETO, ingles predominante en CLIP y Florence-2).

## Casos de uso

- Docencia de IA en el navegador: las demos del curso cargan BETO cuantizado y CLIP ONNX directamente en el cliente, sin backend, gracias a los formatos ligeros incluidos.
- Clasificacion de texto en espanol en el borde: BETO int8 permite ejecutar clasificadores de sentimiento o topicos en dispositivos con poca memoria, manteniendo la escala por fila para preservar precision.
- Busqueda semantica multimodal en prototipos: CLIP ViT-B/32 ONNX sirve para indexar imagenes y consultas de texto en aplicaciones de demostracion sin GPU dedicada.
- Analisis de imagenes con Florence-2: la revision del decodificador permite reproducir exactamente los resultados de las demos de captioning y deteccion sobre el mismo checkpoint.
- Pipelines de vision en movil: los modelos MediaPipe `.tflite`/`.task` habilitan deteccion y segmentacion en Android/iOS dentro de las demos del curso.
- Auditoria de artefactos: al conservar la ruta original y la justificacion de cada divergencia, el repositorio sirve para verificar que version exacta de pesos se uso en cada demo.
- Reproducibilidad de experimentos docentes: fijar revisiones concretas evita que una actualizacion en el repositorio de origen rompa las demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para BETO int8 y CLIP ViT-B/32 ONNX cuantizado; Florence-2-base en fp16 requiere aproximadamente 1-2 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente; para las demos en navegador basta con CPU o WebGPU.
- Cabe en GPU consumer: si, en practicamente todas las tarjetas con al menos 4 GB, e incluso en CPU para los artefactos int8/TFLite.
- Opciones de despliegue: ONNX Runtime (web y nativo), TensorFlow Lite / MediaPipe, transformers para BETO y Florence-2, y llama.cpp no aplica (no hay modelos GGUF).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Coffeenautic/clases-modelos (agregado) | variable (0,11-0,23 B por artefacto) | no disponible | other (agregada) | ONNX, TFLite, .task, bin | Hugging Face, 16 descargas |
| dccuchile/bert-base-spanish-wwm-cased | ~110 M | 512 | CC BY 4.0 | safetensors/PyTorch | Hugging Face, ampliamente usado |
| Xenova/clip-vit-base-patch32 | ~151 M | 77 (texto) | MIT | ONNX | Hugging Face, ecosistema transformers.js |
| onnx-community/Florence-2-base-ft | ~0,23 B | variable | MIT | ONNX | Hugging Face, ecosistema ONNX |

## Limitaciones y advertencias

- No es un modelo unico ni entrenado por el autor: las capacidades dependen exclusivamente de los artefactos de terceros incluidos.
- La licencia agregada es `other`; el uso comercial exige revisar caso por caso (CC BY 4.0 para BETO, MIT para CLIP y Florence-2, Apache 2.0 para MediaPipe).
- La cuantizacion int8 y ONNX puede degradar ligeramente la precision respecto a los pesos originales en fp32.
- BETO esta limitado al espanol y a 512 tokens; CLIP y Florence-2 rinden peor fuera del ingles.
- Riesgo de alucinacion en las tareas generativas de Florence-2 (captioning, OCR) segun la calidad de la imagen.
- Repositorio con muy poca traccion (16 descargas, 0 likes): no hay garantia de mantenimiento ni de soporte.
- Los modelos MediaPipe se alojan sin cambios, por lo que su actualizacion depende del autor original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Coffeenautic/clases-modelos
- BETO original: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- CLIP ViT-B/32 (Xenova): https://huggingface.co/Xenova/clip-vit-base-patch32
- Florence-2-base-ft (onnx-community): https://huggingface.co/onnx-community/Florence-2-base-ft
- MediaPipe: https://ai.google.dev/edge/mediapipe
- Paper de BETO (Cañete et al., 2020): no disponible en la informacion proporcionada.

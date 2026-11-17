# haihengh/gemma-4-26B-A4B-it-finch-4bit-vision

## Resumen

Gemma 4 26B-A4B IT — Finch 4-bit + vision payload es un artefacto de despliegue publicado por el usuario haihengh que empaqueta el checkpoint instruction-tuned google/gemma-4-26B-A4B-it (y su conversión MLX 4-bit) en el formato propietario `.finch` del motor FinchMoE. No es un checkpoint de Transformers: es una instalación out-of-core pensada para que el motor FinchMoE cargue los expertos enrutados desde disco y mantenga en memoria solo un conjunto residente reducido. El paquete incluye además la torre de visión original copiada sin modificar, por lo que el artefacto conserva la modalidad image-text-to-text del modelo base.

El modelo subyacente es un transformer híbrido con atención por ventanas deslizantes y capas de atención completa intercaladas, y una capa FFN de tipo mezcla de expertos con 128 expertos por capa y top-8, sobre 30 capas, hidden 2816 y un vocabulario de 262.144 tokens. El total declarado del artefacto es de aproximadamente 15,43 GB, pero el conjunto residente es de solo 1,35 GB, lo que permite ejecutarlo en máquinas con 3-4 GiB de memoria antes de contar el contexto.

Su relevancia es doble: por un lado demuestra una ruta de cuantización y repaquetado de un MoE grande con visión a un formato de inferencia fuera de núcleo; por otro, es un artefacto muy específico de un motor concreto, con licencia Apache-2.0 heredada del modelo base y sin métricas de calidad publicadas en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención deslizante y capas de atención completa; FFN con mezcla de expertos (MoE) |
| Parámetros totales | no disponible (el modelo base se denomina 26B-A4B; el artefacto declara 15.432.894.586 bytes totales) |
| Parámetros activos | no disponible (top-8 de 128 expertos por capa, según la model card) |
| Longitud de contexto | no disponible (ventana deslizante de 1024 tokens en las capas de atención deslizante) |
| Tipos de cuantización | Expertos enrutados 4-bit affine (grupo 64); attention, embedding y experto compartido 4-bit; router y atención lineal 8-bit; torre de visión en BF16/U32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada de Gemma 4 26B-A4B) |
| Formato de pesos | Finch `.finch` (manifiesto + pesos residentes + expertos empaquetados + tokenizer); visión en `vision/vision.safetensors` |

## Arquitectura y entrenamiento

El cuerpo de texto tiene 30 capas, dimensión oculta 2816, 16 cabezas de atención y 8 cabezas KV, dimensión de cabeza 256 y ventana deslizante de 1024 tokens. Las capas de atención completa son las 5, 11, 17, 23 y 29; el resto usa atención deslizante. La FFN es un MoE con 128 expertos por capa, top-8, dimensión intermedia de experto 704 y una FFN de 2112 en el experto compartido. El vocabulario es de 262.144 tokens con embeddings atados.

La cuantización del artefacto es mixta: los expertos enrutados se almacenan en 4-bit affine con grupo 64, mientras que router y atención lineal suben a 8-bit y las escalas y sesgos se mantienen en BF16. Los expertos se empaquetan en un pool por capa (30 ficheros `layer_XX.bin`, stride de 3.358.720 bytes) que el motor lee de disco con una caché acotada. La torre de visión se copia sin cambios desde el checkpoint fuente: 358 tensores y 1.140.925.536 bytes de payload. No hay información sobre el dataset de entrenamiento, el número de tokens o si hubo RLHF/DPO en la documentación proporcionada.

## Capacidades

- Generación de texto e instrucciones conversacionales (checkpoint `-it`).
- Razonamiento y matemáticas: capacidad esperada por herencia del modelo base, sin métricas publicadas en la información disponible.
- Generación de código: no se documenta de forma específica en la información disponible.
- Visión: pipeline `image-text-to-text`; el runtime FinchMoE soporta turnos con imagen con posiciones de texto 1-D y atención bidireccional dentro de cada bloque de tokens de imagen, solo en las capas de atención deslizante (las de atención completa permanecen causales).
- Tool calling / function calling: no disponible en la información proporcionada.
- Agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Sin soporte de vídeo: el snapshot fuente no incluye preprocesador de vídeo y este artefacto tampoco.

## Casos de uso

- Despliegue en equipos con memoria limitada: el motor mantiene residentes 1,35 GB y cachea expertos desde disco, de modo que el conjunto de trabajo ronda 3-4 GiB antes del contexto; adecuado para estaciones de trabajo sin GPU de gran capacidad.
- Procesamiento de documentos con imagen: al conservar la torre de visión, puede usarse para tareas image-text-to-text como descripción de capturas, extracción de datos de formularios escaneados o respuesta a preguntas sobre diagramas.
- Asistentes conversacionales de contexto corto: la ventana deslizante de 1024 tokens en la mayoría de capas encaja con diálogos de turnos breves y respuestas de instrucciones.
- Prototipado de investigación sobre MoE cuantizados: el formato `.finch` con manifiesto y SHA-256 por fichero permite reproducir instalaciones y estudiar el comportamiento de la caché de expertos.
- Evaluación de la ruta MLX a Finch: útil para comparar la conversión 4-bit de mlx-community con el repaquetado Finch en términos de memoria y latencia.
- Inferencia en entornos con almacenamiento rápido: al hacer streaming de expertos desde disco, conviene un SSD NVMe para evitar cuellos de botella en el throughput.
- Distribución verificable de artefactos: el manifiesto permite descargas reanudables y verificación de integridad, útil en pipelines internos de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 1,35 GB de pesos residentes más caché de expertos. Con los 16 slots por defecto, la caché cuesta 30 capas × 16 × 3,2 MiB ≈ 1,5 GiB, lo que sitúa el runtime en unos 3-4 GiB antes del contexto y de la caché KV.
- GPU recomendadas: no disponible en la información proporcionada.
- GPU de consumo: no se especifica compatibilidad con RTX 4090 u otras; el diseño out-of-core sugiere que el requisito principal es memoria de sistema y disco rápido más que VRAM.
- Almacenamiento: se requiere espacio para los 15,43 GB del artefacto y acceso de lectura rápido a los ficheros de expertos empaquetados.
- Opciones de despliegue: motor FinchMoE (app/CLI) mediante `FinchMoERepack --download-finch`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| haihengh/gemma-4-26B-A4B-it-finch-4bit-vision | no disponible (MoE 128 expertos, top-8) | no disponible (ventana deslizante 1024) | Finch `.finch` | Apache-2.0 | Hugging Face, 0 descargas |
| google/gemma-4-26B-A4B-it | no disponible | no disponible | safetensors (Transformers) | Apache-2.0 (licencia Gemma 4) | Hugging Face |
| mlx-community/gemma-4-26b-a4b-it-4bit | no disponible | no disponible | MLX 4-bit | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- No es un checkpoint de Transformers: requiere el motor FinchMoE y su CLI; no se puede cargar con `transformers`, vLLM ni llama.cpp.
- El artefacto no incluye `verified-install.json`; el instalador debe generar su propio recibo tras verificar cada fichero contra `manifest.json`.
- Sin datos de benchmarks ni evaluaciones de calidad publicadas: no hay evidencia de la degradación introducida por la cuantización 4-bit/8-bit.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado por la información disponible.
- La ventana deslizante de 1024 tokens en la mayoría de capas limita el contexto efectivo; no se documenta la longitud máxima de contexto del modelo base.
- Sin soporte de vídeo por ausencia de preprocesador en el snapshot fuente.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben asumirse los del modelo base.
- La licencia Apache-2.0 se hereda del modelo base, pero la model card enlaza también la licencia específica de Gemma 4; conviene revisar ambas antes de uso comercial.
- El rendimiento depende críticamente de la velocidad del disco: el streaming de expertos puede degradar la latencia frente a un despliegue completamente en memoria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/haihengh/gemma-4-26B-A4B-it-finch-4bit-vision
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Checkpoint MLX fuente: https://huggingface.co/mlx-community/gemma-4-26b-a4b-it-4bit
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license

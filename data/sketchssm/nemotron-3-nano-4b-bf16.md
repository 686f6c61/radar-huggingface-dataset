# SketchSSM/Nemotron-3-Nano-4B-BF16

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un artefacto de calibración denominado `calibration.pt`, publicado por el proyecto SketchSSM (SNU-ARC) para el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`. El fichero almacena la base de sketches compartida por grupo y las puntuaciones de asignación Full-Gram a partir de las cuales se derivan la tabla de rangos por cabeza y los frames ordenados para cualquier rango medio solicitado. No incluye pesos del modelo.

El modelo subyacente, Nemotron 3 Nano 4B, es una red de espacio de estados Mamba-2 de aproximadamente 4.000 millones de parámetros con 21 capas recurrentes calibradas y 96 cabezas de estado por capa. SketchSSM es una técnica de compresión del estado recurrente que escribe el estado completo, pero lee desde un sketch compacto de rango reducido, lo que permite recortar el coste de memoria y de cómputo de la caché de estado en inferencia de secuencias largas.

La relevancia de este repositorio es práctica: es el fichero que necesita quien quiera servir el modelo con soporte SketchSSM en vLLM (`--sketchssm`) o exportar frames con el paquete `sketchssm` sin recalibrar desde cero. Está publicado bajo licencia Apache 2.0, con la salvedad de que, al derivar de los pesos del modelo base, su uso queda también sujeto a la licencia de este. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica al artefacto (fichero de calibracion). Modelo base: Mamba-2 (state space model) hibrido, 21 capas recurrentes calibradas |
| Parametros totales | 0 en este repositorio (no contiene pesos). Modelo base: 4B |
| Parametros activos | No aplica (el modelo base no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No aplica al fichero de calibracion. Calibrado con pesos BF16; la base `omega` se almacena en float32 |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 (fichero de calibracion); sujeto ademas a la licencia del modelo base |
| Formato de pesos | `calibration.pt` (PyTorch, carga con `torch.load(..., weights_only=True)`), `manifest.json`, `collect.yaml` |
| Capas recurrentes calibradas | 21 (indices de capa 0, 2, 4, 6, 7, 9, 11, 14, 16, 19, 21, 23, 26, 28, 30, 31, 34, 35, 36, 38, 40) |
| Cabezas de estado por capa | 96 |
| Dimension de clave K / valor V | 128 / 80 |
| Grupos de base por capa | 8 |
| Ventana W | 16 |
| Factor de borrado (erase factor) | No |
| Tope de rango de asignacion | 49 |
| Forma de `omega` | float32, (21, 8, 79, 128) |
| Tamano de fichero | 8.089.029 bytes (HF informa 0,0 GB por redondeo) |
| Revision del modelo base | `dfaf35de3e30f1867dd8dbc38a7fc9fb52d3914f` |
| Version del pipeline | Release 0.1.14 del repositorio SketchSSM |

## Arquitectura y entrenamiento

El artefacto describe la geometría interna de la parte recurrente del modelo base: 21 capas Mamba-2, cada una con 96 cabezas de estado, dimensión de clave 128 y de valor 80, agrupadas en 8 grupos de base por capa. La base `omega` tiene forma (21, 8, 79, 128) en float32, y el tope de rango de asignación es 49. La calibración se obtuvo con los pesos en BF16 en la revisión indicada, mediante el pipeline público del repositorio SketchSSM: `calibrate`, `package` y `manifest`. El paso `package` reasigna cada rango medio configurado a partir del contenido empaquetado y falla si alguna tabla no coincide con la del bundle, de modo que la coherencia queda verificada de forma automática.

La técnica SketchSSM se describe en el artículo *SketchSSM: Write to the Full State, Read from a Compact Sketch* (arXiv:2609.33051), donde se evalúan cuatro modelos de tres métodos de atención lineal distintos: Nemotron Nano 9B v2 y Nemotron 3 Super (Mamba-2), Qwen3.8 Flash-Next (GDN) y otros. El principio es mantener la escritura sobre el estado completo y restringir la lectura a un sketch de rango reducido, asignando a cada cabeza un rango distinto según las puntuaciones Full-Gram. No hay información en la documentación proporcionada sobre el dataset de entrenamiento del modelo base, el número de tokens, ni sobre fases de RLHF o DPO.

## Capacidades

- Distribución de rangos por cabeza: deriva la tabla de rangos por cabeza y los frames ordenados para cualquier rango medio solicitado, aplicando la misma regla de asignación verificada para los rangos 2, 4, 8 y 16.
- Integración con vLLM: permite arrancar el servidor con `--sketchssm` y `--sketchssm-mean-rank`, con la caché SSM en float32 mediante `--mamba-ssm-cache-dtype float32`.
- Exportación de frames: el paquete `sketchssm.calibration export` genera un fichero `frames.pt` a partir de `calibration.pt` para un rango medio dado.
- Trazabilidad: `manifest.json` incluye el SHA-256 de `calibration.pt` y los resultados de las tablas verificadas.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente: esas capacidades, si existen, corresponden al modelo base Nemotron 3 Nano 4B y no están documentadas en este repositorio.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Despliegue de Nemotron 3 Nano 4B con compresión de estado: servir el modelo base en vLLM pasando `--sketchssm SketchSSM/Nemotron-3-Nano-4B-BF16 --sketchssm-mean-rank 8`, lo que asigna los rangos por cabeza al cargar el modelo y reduce el coste de la caché recurrente.
- Inferencia de secuencias largas con memoria acotada: en tareas de contexto extenso sobre arquitecturas Mamba-2, el sketch compacto limita el crecimiento de la caché de estado, lo que resulta adecuado para streaming o documentos largos.
- Investigación reproducible en atención lineal: el fichero permite reproducir exactamente los resultados de SketchSSM sobre este checkpoint sin repetir la fase de calibración, útil para comparativas entre métodos como Mamba-2 y GDN.
- Exportación de frames para pipelines propios: generar `frames.pt` con el paquete SketchSSM para integrarlo en un runtime propio distinto de vLLM.
- Evaluación de la relación rango/precisión: los rangos medios 2, 4, 8 y 16 documentados permiten medir el compromiso entre memoria y calidad con tablas de asignación ya validadas.
- Auditoría de artefactos derivados: el `manifest.json` con SHA-256 facilita verificar la integridad del fichero en entornos de producción regulados.
- Punto de partida para calibrar otros checkpoints: el pipeline `collect.yaml` sirve como plantilla para recalibrar el mismo modelo en otra precisión o en otro checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de calidad (MMLU, HumanEval, GSM8K u otras) ni comparativas de throughput o latencia.

La única tabla de resultados del model card es de verificación funcional de la asignación de rangos, no de rendimiento del modelo:

| Rango medio | Cabezas densas | Cabezas con sketch |
|---|---|---|
| 2 | 0 | 2016 |
| 4 | 12 | 2004 |
| 8 | 90 | 1926 |
| 16 | 309 | 1707 |

Para estos rangos medios, las tablas derivadas coinciden con las del bundle y los frames exportados coinciden con los del bundle.

## Requisitos de hardware

- El fichero de calibración en sí ocupa unos 8 MB y no requiere GPU para almacenarse o inspeccionarse.
- El modelo base de 4B parámetros en BF16 ocupa aproximadamente 8 GB de pesos; la VRAM total depende de la longitud de contexto, del tamaño de lote y del bucle de decodificación.
- La caché SSM debe configurarse en float32 (`--mamba-ssm-cache-dtype float32`) para usar este fichero; esto incrementa la memoria de estado respecto a otras precisiones.
- GPU recomendadas para el modelo base: por rango de memoria, tarjetas de 16 GB o más (RTX 4090, L40S, A100 40 GB, H100). En tarjetas consumer de 24 GB como la RTX 4090 el modelo de 4B en BF16 debería caber con margen para contexto moderado, aunque no hay cifras confirmadas en la información disponible.
- Opciones de despliegue documentadas: vLLM con soporte SketchSSM. El paquete `sketchssm` permite exportar frames, pero la documentación proporcionada no menciona soporte de llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Repositorio | Tipo de contenido | Modelo base | Arquitectura | Licencia | Datos disponibles |
|---|---|---|---|---|---|
| SketchSSM/Nemotron-3-Nano-4B-BF16 (este) | Calibracion SketchSSM, sin pesos | Nemotron 3 Nano 4B | Mamba-2, 21 capas recurrentes calibradas | Apache 2.0 | 0 descargas, 0 likes |
| SketchSSM/Nemotron-Nano-9B-v2-BF16 | Calibracion SketchSSM, sin pesos | Nemotron Nano 9B v2 | Mamba-2 (evaluado en el paper) | No disponible en la busqueda | Aparece en busquedas de HF |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | Pesos del modelo en BF16 | No aplica | Mamba-2, 4B | No disponible en la busqueda | Etiquetado como Text Generation, 4B |
| nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4 | Pesos del modelo en NVFP4 | No aplica | No disponible (67B segun la busqueda) | No disponible en la busqueda | 664k descargas, 445 likes |

Los datos de parametros, contexto y rendimiento de las alternativas no estan disponibles en la informacion proporcionada, por lo que la comparativa se limita al tipo de artefacto y a la disponibilidad.

## Limitaciones y advertencias

- No es un modelo: el repositorio no contiene pesos y no puede usarse directamente para generar texto. Requiere descargar aparte `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`.
- Dependencia estricta del checkpoint: la base y las puntuaciones de asignación dependen de los pesos, por lo que el fichero solo es válido para la revisión `dfaf35de3e30f1867dd8dbc38a7fc9fb52d3914f` en BF16. Para otra precisión o revisión hay que recalibrar.
- Sin garantías de calidad: el model card no reporta métricas de degradación asociadas a la compresión por sketch en rangos medios bajos, así que el impacto en la calidad de generación no está cuantificado en la información disponible.
- Licencia doble: el artefacto es Apache 2.0, pero al derivar de los pesos del modelo base su uso queda sujeto también a la licencia de Nemotron 3 Nano 4B.
- Madurez baja: 0 descargas y 0 likes, con fecha de creación y actualización separadas por tres segundos, lo que sugiere una publicación reciente y sin validación comunitaria.
- Sesgos, alucinación y comportamiento lingüístico: no evaluables a partir de este repositorio, ya que no contiene el modelo generativo.
- Soporte de runtime limitado: la única integración documentada es vLLM con SketchSSM; no se documentan alternativas.
- Requisito de precisión de caché: el uso de float32 en la caché SSM puede penalizar el consumo de memoria frente a configuraciones en BF16.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SketchSSM/Nemotron-3-Nano-4B-BF16
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Repositorio SketchSSM: https://github.com/SNU-ARC/SketchSSM
- Guía de calibración (fichero de calibración portátil): https://github.com/SNU-ARC/SketchSSM/tree/main/sketchssm/calibration#portable-calibration-file
- Artículo: SketchSSM: Write to the Full State, Read from a Compact Sketch: https://arxiv.org/pdf/2609.33051
- Calibración relacionada: https://huggingface.co/SketchSSM/Nemotron-Nano-9B-v2-BF16
- Modelo mayor de la misma familia: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4

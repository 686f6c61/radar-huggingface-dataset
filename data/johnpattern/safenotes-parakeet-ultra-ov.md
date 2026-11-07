# johnpattern/safenotes-parakeet-ultra-ov

## Resumen

Parakeet Ultra (OpenVINO IR) for Safenotes es una conversión de formato del modelo de reconocimiento automático del habla Parakeet Ultra, desarrollado por Moondream como versión post-entrenada de NVIDIA Parakeet TDT 0.6B v3. El repositorio lo publica johnpattern bajo la etiqueta de Safenotes, una aplicación local de toma de notas de reuniones, y su único propósito es permitir que el modelo se ejecute sobre hardware Intel mediante OpenVINO IR, tanto en NPUs como en GPUs y CPUs de Intel. No se trata de un modelo nuevo ni de un reentrenamiento: es una exportación de los pesos originales en fp16 safetensors al formato OpenVINO IR, sin cuantización ni modificación de los parámetros.

El modelo subyacente es un sistema de reconocimiento de voz de tipo TDT (Token-and-Duration Transducer) con aproximadamente 600 millones de parámetros, diseñado para transcripción en 25 idiomas europeos. La arquitectura combina un codificador acústico, un decodificador y un módulo conjunto (joint) que predicen tokens y duraciones, lo que permite una decodificación eficiente sin necesidad de alineamientos forzados. La conversión mantiene la precisión fp16 original y excluye la cabeza de detección de actividad de voz (vad_head), por lo que el modelo resultante está orientado exclusivamente a la transcripción.

La relevancia de esta ficha radica en que ejemplifica el patrón de despliegue de modelos ASR en entornos de borde (edge) sobre hardware Intel, un caso cada vez más común en aplicaciones de privacidad y procesamiento local. Al estar distribuido bajo licencia CC-BY-4.0 y con un tamaño de repositorio de 1,3 GB, resulta adecuado para integrarse en aplicaciones de escritorio que requieran subtitulado en vivo sin enviar audio a la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer); codificador, decodificador y joint exportados a OpenVINO IR |
| Parametros totales | Aproximadamente 0,6 mil millones (heredados de Parakeet TDT 0.6B v3) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los pesos se exportan en fp16 sin cuantizacion |
| Idiomas soportados | 25 idiomas europeos (segun la model card del modelo base) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | OpenVINO IR (archivos .xml y .bin); el original en safetensors fp16 |

## Arquitectura y entrenamiento

El modelo base Parakeet Ultra es una versión post-entrenada de NVIDIA Parakeet TDT 0.6B v3, que emplea una arquitectura Transducer con predicción conjunta de tokens y duraciones (TDT). Esta arquitectura consta de un codificador acústico que procesa las características mel-espectrográficas, un decodificador que modela la secuencia de tokens y un módulo joint que combina ambas representaciones para emitir tokens y duraciones de forma conjunta. El resultado es un sistema de transcripción que no requiere alineamientos explícitos y que puede operar en streaming con latencias controladas.

La conversión realizada por Safenotes carga los pesos originales en fp16 safetensors dentro del modelo NeMo de nvidia/parakeet-tdt-0.6b-v3 en la revisión 541d1f99, y exporta los módulos de mel-espectrograma, codificador, decodificador y joint a OpenVINO IR con pesos fp16, siguiendo el layout de FluidInference para parakeet en OpenVINO. No hay reentrenamiento ni cuantización, y se omite la cabeza de actividad de voz (vad_head). Las herramientas empleadas fueron nemo_toolkit 3.0.0, torch 2.10.0+cpu y openvino 2026.4.1. No se dispone de información sobre el dataset de post-entrenamiento ni sobre el número de tokens utilizados en el mismo.

## Capacidades

- Reconocimiento automático del habla (ASR) en 25 idiomas europeos, con transcripción de audio a texto.
- Procesamiento de audio en streaming y en formato largo, según las capacidades del modelo base.
- Robustez mejorada frente al modelo original en entornos con ruido de fondo y en audio de larga duración, según la model card de Moondream.
- Ejecución en hardware Intel mediante OpenVINO: NPUs, GPUs y CPUs.
- No incluye cabeza de detección de actividad de voz (vad_head), por lo que no realiza segmentación VAD de forma nativa.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR.
- No se documenta soporte multilingüe más allá de los 25 idiomas europeos indicados.

## Casos de uso

- Subtitulado en vivo en aplicaciones de reuniones: el modelo puede transcribir audio en tiempo real en 25 idiomas europeos y ejecutarse en la NPU o GPU integrada del PC del usuario, sin enviar audio a la nube, lo que encaja con la propuesta de Safenotes.
- Transcripción local de notas de voz: integrado en una aplicación de escritorio, permite convertir grabaciones de audio en texto manteniendo la privacidad, ya que todo el procesamiento ocurre en el dispositivo.
- Generación de actas de reuniones: al transcribir audio largo con robustez frente a ruido, puede alimentar un pipeline posterior de resumen y extracción de acciones.
- Accesibilidad para personas con discapacidad auditiva: subtitulado en directo de conferencias o clases en el propio equipo del usuario, sin dependencia de servicios externos.
- Procesamiento por lotes de archivos de audio en servidores con CPU Intel: al estar en formato OpenVINO IR, puede desplegarse en infraestructura Intel sin GPU dedicada, aprovechando la aceleración de OpenVINO en CPU.
- Integración en aplicaciones de transcripción de código abierto: el formato OpenVINO IR y la licencia CC-BY-4.0 permiten incorporarlo en proyectos que requieran ejecución en hardware Intel, con verificación de integridad mediante sha256.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,3 GB en disco; los pesos del codificador suman aproximadamente 1,24 GB en fp16, por lo que se estima un consumo de memoria en torno a 1,5-2 GB durante la inferencia, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no disponible; el modelo está orientado a NPUs, GPUs y CPUs Intel mediante OpenVINO.
- Cabe en GPU de consumo: no se especifica, pero por tamaño (0,6B parámetros en fp16) es plausible que quepa en GPUs de consumo con suficiente memoria; no hay confirmación oficial.
- Opciones de despliegue: OpenVINO (runtime de Intel); no se documentan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Parakeet Ultra (OpenVINO IR) | ~0,6B | No disponible | 25 europeos | CC-BY-4.0 | OpenVINO IR |
| NVIDIA Parakeet TDT 0.6B v3 | ~0,6B | No disponible | 25 europeos | CC-BY-4.0 | NeMo / safetensors |
| Moondream Parakeet Ultra (original) | ~0,6B | No disponible | 25 europeos | CC-BY-4.0 | safetensors fp16 |

El modelo aquí descrito es una conversión de formato del original de Moondream, que a su vez es una versión post-entrenada del modelo de NVIDIA. La comparativa se limita a estos tres, ya que no se dispone de información sobre otros modelos ASR comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo no incluye la cabeza de detección de actividad de voz (vad_head), por lo que no realiza segmentación VAD de forma nativa.
- No se han publicado resultados de benchmarks ni métricas de precisión en la información disponible, lo que impide evaluar su rendimiento real.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el repositorio no incluye un archivo LICENSE completo más allá de LICENSE-NOTICE.txt; se debe consultar la licencia original.
- El modelo se distribuye "as is", sin garantías de ningún tipo, incluida la idoneidad para un propósito particular o la exactitud de la salida.
- Al ser una conversión no oficial, los autores originales no lo respaldan; cualquier problema de calidad debe atribuirse a la conversión y no al modelo base.
- No se dispone de información sobre sesgos, riesgo de alucinación o limitaciones de contexto e idioma más allá de los 25 idiomas europeos indicados.
- El rendimiento puede variar según la versión de OpenVINO y el hardware Intel utilizado; no se documentan versiones mínimas compatibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/johnpattern/safenotes-parakeet-ultra-ov
- Modelo base Moondream Parakeet Ultra: https://huggingface.co/moondream/parakeet-ultra
- Modelo original NVIDIA Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/legalcode
- Revisión del modelo base: https://huggingface.co/moondream/parakeet-ultra/tree/73175eb7aeb0d82f1e2a6b53b3aabc10a90bcd0b

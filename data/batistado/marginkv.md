# batistado/MarginKV

## Resumen

MarginKV es una infraestructura de inferencia y depuración para modelos de lenguaje, no un modelo de pesos nuevos. Desarrollada por el usuario batistado, se distribuye como un conjunto de kernels GPU (`GEMV-Tile`) y un plugin para vLLM que permite reproducir de forma determinista el estado de la caché KV en agentes LLM multi-turno. La tesis central es que la divergencia en la reproducción de agentes no proviene de los pesos del modelo, sino de la no asociatividad de las reducciones en coma flotante en la GPU (prefill con `GEMM` frente a decodificación con `GEMV` de `M=1`).

Por tanto, MarginKV no requiere entrenamiento ni modificación de pesos: opera sobre modelos CausalLM estándar como Qwen2.5, Llama-3 y similares. Comprime checkpoints de caché KV de entre 35 MB y 20 GB hasta 33-126 bytes con cero bits corruptos, y acelera la reproducción secuencial `M=1` entre 3,63x y 4,28x. Los modelos base declarados son Qwen2.5-3B-Instruct, Qwen2.5-7B-Instruct y Qwen2.5-Coder-14B-Instruct.

El repositorio de Hugging Face tiene un tamaño de 0,0 GB y cero descargas en el momento de la consulta, lo que sugiere que el artefacto principal (código y kernels) reside en GitHub y que la model card actúa como punto de entrada documental. Su relevancia actual radica en la depuración contrafactual de agentes y en la reproducibilidad de pipelines de inferencia en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo con arquitectura propia; es un conjunto de kernels GPU (`GEMV-Tile`) y un plugin para vLLM que operan sobre CausalLM estándar (transformer) |
| Parametros totales | No aplica al artefacto; los modelos base declarados son de 3B, 7B y 14B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | No disponible (el repositorio tiene 0,0 GB; el artefacto principal es código en GitHub) |

## Arquitectura y entrenamiento

MarginKV no entrena ni modifica pesos. Su enfoque se apoya en la observación de que la divergencia en la reproducción de agentes LLM multi-turno se origina en la no asociatividad de las reducciones en coma flotante que realizan las GPU: el prefill usa `GEMM` y la decodificación usa `GEMV` con `M=1`, lo que produce resultados numéricamente distintos entre ejecuciones. En lugar de ajustar el modelo, MarginKV implementa kernels `GEMV-Tile` a nivel de subturno y un plugin de reproducción para vLLM que fija el comportamiento numérico.

La compresión de checkpoints de caché KV desde 35 MB-20 GB hasta 33-126 bytes con cero bits corruptos es la innovación técnica central, junto con la aceleración de 3,63x-4,28x frente a la reproducción secuencial `M=1`. Los kernels están implementados para Triton y Metal, lo que cubre aceleradores NVIDIA y Apple Silicon. No se especifican en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO, ya que no hay entrenamiento implicado.

## Capacidades

- Reproducción determinista de la caché KV en agentes LLM multi-turno sobre modelos CausalLM sin modificar.
- Compresión de checkpoints de caché KV de 35 MB-20 GB a 33-126 bytes con cero bits corruptos.
- Aceleración de la reproducción secuencial `M=1` entre 3,63x y 4,28x mediante kernels `GEMV-Tile`.
- Depuración contrafactual de agentes: permite reproducir y comparar trayectorias alternativas de un agente.
- Integración con vLLM mediante plugin, y compatibilidad con endpoints.
- Soporte de kernels en Triton y Metal (GPU NVIDIA y Apple Silicon).
- Compatibilidad declarada con Qwen2.5-3B-Instruct, Qwen2.5-7B-Instruct y Qwen2.5-Coder-14B-Instruct, y con Llama-3 según la model card.
- No se documentan capacidades de generación, visión, audio ni tool calling propias, al no ser un modelo de pesos.

## Casos de uso

- Depuración de agentes multi-turno en producción: el plugin de vLLM permite reproducir exactamente el estado de la caché KV de una sesión, de modo que un fallo intermitente en un agente puede reproducirse y aislarse sin depender de la suerte de la ejecución.
- Análisis contrafactual de decisiones del agente: al comprimir checkpoints de caché KV a decenas de bytes, se pueden almacenar y comparar múltiples trayectorias alternativas de una misma conversación para identificar en qué subturno diverge el comportamiento.
- Auditoría y cumplimiento en pipelines de inferencia: la reproducción determinista facilita generar trazas verificables de las respuestas de un agente, útil en entornos regulados donde se exige justificar cada salida.
- Reducción de coste de almacenamiento de estados de sesión: checkpoints de caché KV de hasta 20 GB se reducen a 33-126 bytes, lo que abarata el registro histórico de sesiones largas en sistemas de atención al cliente o asistentes internos.
- Aceleración de pruebas de regresión de agentes: la reproducción `M=1` entre 3,63x y 4,28x más rápida permite ejecutar suites de evaluación de agentes en menos tiempo sobre los modelos base Qwen2.5 declarados.
- Investigación en robustez de agentes: el dataset DriftBench-Agent y el explorador interactivo permiten medir la deriva entre ejecuciones y estudiar su origen numérico en la GPU en lugar de atribuirlo a los pesos.
- Despliegue en Apple Silicon: los kernels Metal habilitan la reproducción determinista en equipos con chip Apple, útil para desarrollo local de agentes sin depender de clústeres NVIDIA.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Aceleracion de reproduccion frente a secuencial `M=1` | 3,63x-4,28x |
| Rango de compresion de checkpoints KV | 35 MB-20 GB a 33-126 bytes |
| Bits corruptos en la compresion | 0 |

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base sobre el que se aplique MarginKV (3B, 7B o 14B) y de su cuantización, no del artefacto en sí.
- GPU recomendadas: no se especifican modelos concretos; los kernels están implementados para Triton (GPU NVIDIA) y Metal (Apple Silicon).
- Cabe en GPU de consumidor: no disponible como dato explícito; la viabilidad depende del modelo base elegido.
- Opciones de despliegue: vLLM mediante el plugin de reproducción; instalación del paquete vía `pip install git+https://github.com/batistado/marginkv.git`.
- Latencia y throughput: se reporta una aceleración de 3,63x-4,28x en la reproducción frente a la secuencia `M=1`; no se publican cifras absolutas de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Herramienta | Enfoque | Modifica pesos | Compresion de KV | Aceleracion de replay | Licencia |
|---|---|---|---|---|---|
| MarginKV | Kernels `GEMV-Tile` y plugin vLLM para replay determinista | No | 35 MB-20 GB a 33-126 bytes | 3,63x-4,28x | apache-2.0 |
| Fine-tuning del modelo base | Ajuste de pesos para estabilizar el comportamiento | Sí | No aplica | No aplica | Según modelo base |
| Reproduccion secuencial `M=1` (baseline) | Replay paso a paso sin kernels fusionados | No | No disponible | 1x (referencia) | No disponible |

No se dispone de información sobre otras herramientas comparables de replay determinista de caché KV en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto por sí mismo; requiere un CausalLM base como Qwen2.5 o Llama-3.
- El repositorio de Hugging Face tiene 0,0 GB y cero descargas; el artefacto funcional reside en GitHub, lo que implica que la instalación depende de ese repositorio externo.
- La compatibilidad declarada se limita a los modelos base indicados y a Llama-3; no se documenta compatibilidad con otras familias.
- Los kernels dependen de Triton o Metal; no se documenta soporte para otras plataformas de aceleración.
- No se especifican sesgos, riesgos de alucinación ni limitaciones de idioma del artefacto, ya que estos dependen del modelo base sobre el que se aplique.
- La licencia apache-2.0 del artefacto no cubre necesariamente las licencias de los modelos base utilizados, que deben verificarse por separado para uso comercial.
- No se publican cifras absolutas de latencia ni throughput, solo aceleraciones relativas, lo que dificulta estimar el rendimiento en producción sin pruebas propias.
- La fecha de creación del repositorio (2026-11-13) y la ausencia de descargas sugieren un proyecto muy reciente; la madurez y el soporte a largo plazo no están garantizados.

## Enlaces

- Hugging Face: https://huggingface.co/batistado/MarginKV
- Dataset DriftBench-Agent: https://huggingface.co/datasets/batistado/DriftBench-Agent
- Space interactivo MarginKV-Explorer: https://huggingface.co/spaces/batistado/MarginKV-Explorer
- Código fuente y paper: https://github.com/batistado/marginkv

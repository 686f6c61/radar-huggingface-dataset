# MultiverseComputingCAI/Pulsar-16B-BF16

## Resumen

Pulsar 16B es un modelo de lenguaje derivado de NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 mediante técnicas de compresión propietarias de Multiverse Computing (CompactifAI). El modelo base es un transformer híbrido Mamba2-Transformer con mezcla de expertos (MoE) de aproximadamente 31,6 mil millones de parámetros totales y 3,6 mil millones activados por pasada. La compresión reduce el total a 16,15 mil millones de parámetros (un 50 % menos) manteniendo la misma familia arquitectónica y la compatibilidad con el ecosistema de inferencia del modelo original.

El resultado es un checkpoint de 16.148.532.416 parámetros con 3,1 mil millones activados por forward pass, lo que eleva la ratio de activación del 11,34 % al 19,28 %. La propuesta de valor es clara: conservar las capacidades del Nemotron-3 Nano (contexto largo de hasta 1 millón de tokens, tool calling, modo de razonamiento híbrido) con una huella de memoria y unos requisitos de despliegue notablemente menores, lo que facilita su ejecución en infraestructuras más modestas.

Es relevante ahora porque demuestra una vía práctica de compresión sobre arquitecturas híbridas SSM-Transformer con MoE, un patrón que está ganando tracción para contextos largos. El modelo se distribuye con licencia Apache 2.0 (a diferencia del modelo base, que usa la NVIDIA Open Model License) y está disponible en tres formatos: BF16, FP8 y NVFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Mamba2-Transformer con MoE (familia Nemotron H) |
| Parametros totales | 16.148.532.416 (16,15B) |
| Parametros activos | 3,1B por forward pass (ratio de activación del 19,28 %) |
| Longitud de contexto | Hasta 1M tokens (heredada del modelo base) |
| Tipos de cuantizacion | BF16 (este checkpoint), FP8 y NVFP4 (variantes publicadas) |
| Idiomas soportados | Inglés (principal); el resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

Pulsar 16B hereda la arquitectura del Nemotron-3 Nano-30B-A3B: un modelo híbrido que combina capas Mamba2 (modelo de espacio de estados) con capas de atención Transformer y una capa MoE. Esta mezcla permite manejar contextos muy largos (hasta 1M tokens) con un coste computacional sublineal en la parte SSM, mientras que las capas de atención y los expertos aportan capacidad expresiva. El modelo base tiene 31,6B parámetros totales con 3,6B activos; tras la compresión CompactifAI queda en 16,15B totales con 3,1B activos.

La innovación principal es el proceso de compresión CompactifAI de Multiverse Computing, que reduce el número de parámetros y la huella de memoria manteniendo la estructura MoE y la compatibilidad con el código de modelado original (`nemotron_h`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el proceso de compresión. El modelo base de NVIDIA incorpora un modo de razonamiento híbrido (thinking/no-thinking) controlable mediante la plantilla de chat, y Pulsar 16B conserva esa funcionalidad.

## Capacidades

- Generación de texto general en inglés con modo de razonamiento híbrido: puede razonar paso a paso (`enable_thinking`) o responder directamente.
- Tool calling / function calling con la misma estructura y formato que Nemotron-3-Nano-30B-A3B; compatible con `--enable-auto-tool-choice` y el parser `qwen3_coder` en vLLM.
- Razonamiento multi-paso y flujos de agente gracias al modo thinking y al contexto largo.
- Contexto largo de hasta 1M tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Inferencia eficiente: 3,1B parámetros activos por token, lo que reduce el coste computacional frente al modelo base.
- Soporte de decodificación con etiquetas de razonamiento Nemotron v3 mediante el plugin `nano_v3_reasoning_parser.py`.
- Capacidades multilingües: limitadas al inglés según la model card; el resto no disponible.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de hasta 1M tokens, manteniendo el hilo de la conversación y el historial de incidencias sin truncar.
- **Generación de código en producción**: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar parches o invocar herramientas externas (linters, ejecutores de tests) mediante function calling.
- **Agentes autónomos multi-paso**: el modo thinking permite descomponer tareas complejas en pasos, invocar herramientas y razonar sobre los resultados, con un coste por token inferior al del modelo base de 31,6B.
- **Análisis de documentos extensos**: con 1M tokens de contexto, puede resumir, extraer entidades o responder preguntas sobre contratos, informes o bases de código completas en una sola pasada.
- **Asistentes de razonamiento con control de coste**: la reducción del 50 % en parámetros totales y el menor número de parámetros activos permiten desplegar un asistente con modo thinking en GPUs de gama alta para consumidores o en instancias cloud más económicas.
- **Despliegue en entornos con memoria limitada**: las variantes FP8 y NVFP4 reducen aún más la huella, lo que facilita servir el modelo en infraestructura con VRAM restringida manteniendo el tool calling y el razonamiento.
- **Prototipado e investigación**: al ser Apache 2.0 y compatible con Transformers y vLLM, sirve para experimentar con arquitecturas híbridas Mamba2-Transformer comprimidas sin las restricciones de la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada en BF16**: aproximadamente 32,3 GB solo para los pesos (16,15B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 40-48 GB para inferencia cómoda.
- **VRAM estimada en FP8**: aproximadamente 16,2 GB para los pesos; viable en GPUs de 24 GB con margen ajustado.
- **VRAM estimada en NVFP4**: aproximadamente 8-10 GB para los pesos, lo que abre la puerta a GPUs de consumo de gama alta.
- **GPUs recomendadas**: A100 80 GB o H100 para BF16 con contexto largo; L40S o RTX 6000 Ada (48 GB) para BF16 con contexto moderado; RTX 4090 (24 GB) para FP8; GPUs de 12-16 GB para NVFP4.
- **¿Cabe en GPU de consumo?**: sí, en formato FP8 o NVFP4; en BF16 no cabe en una RTX 4090 de 24 GB.
- **Opciones de despliegue**: Transformers (probado con 4.57.6, requiere `trust_remote_code=True`), vLLM ≥ 0.12.0 con `--trust-remote-code` y el plugin de razonamiento `nano_v3_reasoning_parser.py`; el contenedor NeMo `nvcr.io/nvidia/nemo:25.11.nemotron_3_nano` incluye `mamba_ssm` y `causal-conv1d`.
- **Latencia y throughput**: no disponibles en la información proporcionada; la reducción de parámetros activos (3,1B frente a 3,6B) sugiere una mejora proporcional en throughput, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pulsar-16B-BF16 | 16,15B | 3,1B | 1M tokens | Apache 2.0 | Hugging Face (BF16, FP8, NVFP4) |
| NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | 31,6B | 3,6B | 1M tokens | NVIDIA Open Model License | Hugging Face |
| Pulsar-16B-FP8 | 16,15B | 3,1B | 1M tokens | Apache 2.0 | Hugging Face |
| Pulsar-16B-NVFP4 | 16,15B | 3,1B | 1M tokens | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la información proporcionada. La comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- **Idioma**: el modelo está orientado principalmente al inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- **Sesgos**: no se documentan análisis de sesgo en la model card; al heredar el modelo base de NVIDIA, es previsible que arrastre sesgos presentes en sus datos de entrenamiento, pero no hay datos concretos.
- **Alucinación**: no se aportan evaluaciones de tasa de alucinación; como todo modelo generativo, existe riesgo, especialmente en modo no-thinking y en dominios fuera de su distribución.
- **Compresión propietaria**: la técnica CompactifAI es propietaria y no se detalla el proceso; no hay benchmarks publicados que cuantifiquen la pérdida de calidad respecto al modelo base.
- **Contexto largo**: aunque se anuncia soporte de hasta 1M tokens, no se especifica si la compresión afecta a la calidad en contextos extremos; conviene validar en el caso de uso concreto.
- **Dependencia de código remoto**: requiere `trust_remote_code=True` y una versión concreta de Transformers (probado con 4.57.6); cambios de versión pueden romper la carga.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base de NVIDIA usa la NVIDIA Open Model License; conviene revisar las condiciones de la licencia del modelo base si se redistribuye o se combinan componentes.
- **Dependencias de inferencia**: el soporte de vLLM requiere el plugin de razonamiento de NVIDIA y, en algunos entornos, `mamba_ssm` y `causal-conv1d`, lo que añade complejidad al despliegue.

## Enlaces

- Modelo en Hugging Face (BF16): https://huggingface.co/MultiverseComputingCAI/Pulsar-16B-BF16
- Variante FP8: https://huggingface.co/MultiverseComputingCAI/Pulsar-16B-FP8
- Variante NVFP4: https://huggingface.co/MultiverseComputingCAI/Pulsar-16B-NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Plugin de razonamiento para vLLM: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16/blob/main/nano_v3_reasoning_parser.py
- Model card oficial del modelo base en NVIDIA Build: https://build.nvidia.com/nvidia/nemotron-3-nano-30b-a3b/modelcard
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0

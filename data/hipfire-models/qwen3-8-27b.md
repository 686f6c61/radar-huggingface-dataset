# hipfire-models/qwen3.8-27b

## Resumen

El repositorio `hipfire-models/qwen3.8-27b` contiene artefactos cuantizados del modelo Qwen3.8-27B, un modelo de lenguaje denso de 27 mil millones de parámetros desarrollado por Alibaba, adaptado específicamente para el motor de inferencia hipfire, un runtime nativo en Rust orientado a GPUs AMD (arquitecturas RDNA). El modelo base Qwen3.8-27B es una versión mejorada de Qwen3.6-27B con capacidades de visión-lenguaje, contexto de 262 144 tokens y mejoras en tareas de programación y productividad ofimática. Esta versión cuantizada emplea la familia de cuantización MagnumQuant MQ V2, que utiliza rotaciones FWHT y cabeceras afines dual-FP16 para preservar la calidad con pesos de 3 a 6 bits.

El problema que resuelve es la ejecución eficiente de un modelo de 27B en hardware AMD, donde los formatos convencionales (GGUF, safetensors) no están optimizados para el motor hipfire. Los artefactos se publican en una escalera de productos MQ3V2 a MQ6V2, cada uno con tres niveles de protección (xt, base y pro) que determinan qué capas se cuantizan con mayor precisión. Además, se incluyen drafters DFlash para decodificación especulativa, lo que acelera la generación de tokens sin sacrificar calidad. La relevancia actual radica en que ofrece una alternativa de inferencia local de alto rendimiento para GPUs AMD, un segmento tradicionalmente menos cubierto que NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B) con atención de visión-lenguaje |
| Parametros totales | 26 895 998 464 (26,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (nativo) |
| Tipos de cuantizacion | MagnumQuant MQ V2: MQ3V2, MQ4V2, MQ5V2, MQ6V2; cada uno con variantes xt, base y pro (3,5 a 6,6 bits por peso) |
| Idiomas soportados | No disponible (el modelo base Qwen soporta múltiples idiomas, pero no se especifica la lista) |
| Licencia | Apache-2.0 |
| Formato de pesos | Formato propietario `.hfq` (hipfire), con identificadores de tipo HFQM (qt44, qt47, qt48, qt49) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros con arquitectura de visión-lenguaje, entrenado por Alibaba con un contexto de 262 144 tokens. Incorpora mejoras respecto a Qwen3.6-27B en tareas de programación y ofimática, y soporta razonamiento explícito (thinking mode) con niveles configurables. El entrenamiento incluye fases de instrucción y alineación, aunque los detalles exactos del dataset no se proporcionan en la información disponible.

La versión cuantizada de hipfire utiliza MagnumQuant MQ V2, una familia de cuantización que aplica rotaciones FWHT (Fast Walsh-Hadamard Transform) a los pesos antes de cuantizarlos. Cada grupo de 256 pesos se codifica con una cabecera afín dual-FP16 (dos pares escala/cero, uno para los pesos 0-127 y otro para 128-255). Los niveles de producto varían en qué capas se protegen: `xt` protege solo embeddings, `base` protege embeddings y lm_head, y `pro` además eleva las salidas recurrentes/SSM. El nivel MQ2V2 se midió pero no se publicó por calidad catastrófica (KLD 12-14). Los drafters DFlash son modelos auxiliares más pequeños que se usan para decodificación especulativa, con el drafter MQ4V2 recomendado como controlador por defecto.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento (thinking) habilitado por defecto, con nivel de razonamiento `xhigh` como predeterminado.
- Comprensión de imágenes y visión-lenguaje (heredada del modelo base Qwen3.8-27B), aunque los artefactos cuantizados se describen como "text-only" en la model card.
- Soporte de decodificación especulativa mediante drafters DFlash, que acelera la generación entre 202 y 263 tokens por segundo según el nivel de cuantización.
- Capacidades de agente y tool calling (el modelo base soporta agentes y el motor hipfire ofrece una ruta de servido compatible con OpenAI).
- Multilingüismo: el modelo base Qwen soporta múltiples idiomas, pero no se detalla la lista en la documentación de esta versión.
- Integración nativa con el motor hipfire, que incluye gestión de KV cache en Q8 y contexto nativo de 262 144 tokens.

## Casos de uso

- Inferencia local en GPUs AMD para desarrollo y experimentación: el modelo se ejecuta con hipfire en GPUs RDNA (gfx1100, gfx1201) sin necesidad de hardware NVIDIA, permitiendo a desarrolladores con GPUs AMD probar un modelo de 27B con calidad cercana al original.
- Asistente de programación en entornos de desarrollo: con soporte de razonamiento y generación de código, puede integrarse en IDEs o pipelines de CI/CD para revisión de código, generación de tests o autocompletado, aprovechando la decodificación especulativa para baja latencia.
- Automatización de tareas ofimáticas y de productividad: el modelo base destaca en office productivity, por lo que puede usarse para redactar documentos, resumir correos, generar informes o extraer datos de imágenes (si se usa el modelo base sin cuantizar).
- Agentes autónomos con tool calling: gracias al soporte de agentes y al contexto largo de 262k tokens, puede gestionar conversaciones multi-turno con memoria amplia, ejecutar llamadas a APIs y coordinar tareas complejas.
- Servicio de chat con API compatible con OpenAI: hipfire ofrece un servidor OpenAI-compatible, permitiendo desplegar el modelo como backend de aplicaciones de chat o asistentes virtuales en infraestructura AMD.
- Investigación en cuantización y eficiencia: los artefactos MQ V2 con métricas de KLD y throughput documentadas sirven como referencia para estudiar el impacto de la cuantización de 3 a 6 bits en modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta versión cuantizada en la información disponible. La model card proporciona métricas de calidad (KLD frente a profesores WT2 y v6sel) y de rendimiento (tokens por segundo en decodificación y prefill) medidas en un banco de pruebas específico con 4×gfx1201 y HIP 7.14. La siguiente tabla resume los datos publicados:

| Producto | Model bpw | WT2 KLD | v6sel KLD | AR decode (tok/s) | Prefill (tok/s) |
|---|---:|---:|---:|---:|---:|
| mq3-xt | 3,503 | 0,248348 | 1,411523 | 40,7 | 468,9 |
| mq3 | 3,753 | 0,153658 | 1,032401 | 37,6 | 458,8 |
| mq3-pro | 3,922 | 0,130314 | 0,924635 | 36,7 | 453,9 |
| mq4-xt | 4,456 | 0,057449 | 0,771410 | 35,3 | 490,6 |
| mq4 | 4,659 | 0,039033 | 0,544517 | 33,2 | 480,7 |
| mq4-pro | 4,897 | 0,032495 | 0,484145 | 31,9 | 474,7 |
| mq5-xt | 5,408 | 0,015028 | 0,440984 | 29,4 | 345,5 |
| mq5 | 5,564 | 0,010255 | 0,278077 | 28,2 | 341,5 |
| mq5-pro | 5,746 | 0,009006 | 0,237993 | 27,5 | 345,8 |
| mq6-xt | 6,361 | 0,004389 | 0,220915 | 26,0 | 333,9 |
| mq6 | 6,469 | 0,002771 | 0,152813 | 25,2 | 330,1 |
| mq6-pro | 6,596 | 0,002208 | 0,136504 | 24,8 | 331,5 |

Con decodificación especulativa (DFlash), el rendimiento de decodificación sube a 202-263 tok/s según el drafter. El modelo base Qwen3.8-27B tiene benchmarks publicados (NL2Repo-Bench, QwenSWEBench, CoWorkBench, IFBench, Agent's Last Exam, etc.) pero no se incluyen en esta ficha.

## Requisitos de hardware

- GPUs AMD compatibles: arquitecturas RDNA3 (gfx1100) y RDNA4 (gfx1201), validadas en el banco de pruebas del autor.
- VRAM estimada: según el archivo elegido, entre 11,8 GB (mq3-xt) y 22,2 GB (mq6-pro). Para el nivel canónico mq4 (15,7 GB) se necesita al menos 16 GB de VRAM; para mq6 (21,7 GB) se requieren 24 GB o más.
- GPU recomendadas: Radeon RX 7900 XTX (24 GB) para niveles mq4-mq6, o Radeon RX 7800 XT (16 GB) para mq3-mq4. Para despliegues multi-GPU, el banco de pruebas usó 4×gfx1201.
- Opciones de despliegue: exclusivamente mediante el motor hipfire (Rust), con comandos `hipfire pull` y `hipfire run`. No es compatible con vLLM, llama.cpp u Ollama en su formato nativo.
- Latencia y throughput: en el hardware de referencia, la decodificación autoregresiva oscila entre 24,8 y 40,7 tok/s según el nivel de cuantización; con DFlash se alcanzan 202-263 tok/s. El prefill varía entre 330 y 490 tok/s.

## Comparativa con modelos similares

No se dispone de comparativas directas con otras cuantizaciones del mismo modelo (p. ej., GGUF de Qwen3.8-27B) en la información proporcionada. La comparación más relevante es con el modelo base sin cuantizar:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| Qwen3.8-27B (base) | 26,9B | 262 144 | safetensors | Apache-2.0 | Hugging Face, QwenCloud |
| hipfire-models/qwen3.8-27b (MQ4V2) | 26,9B | 262 144 | .hfq (hipfire) | Apache-2.0 | Hugging Face |
| hipfire-models/qwen3.8-27b (MQ6V2) | 26,9B | 262 144 | .hfq (hipfire) | Apache-2.0 | Hugging Face |

La versión cuantizada mantiene la misma arquitectura y licencia que el base, pero se limita al ecosistema hipfire. No hay datos de otros modelos comparables (p. ej., Llama 3.1 27B o Mistral 27B) en la información disponible.

## Limitaciones y advertencias

- La cuantización introduce pérdida de calidad, especialmente en niveles bajos (MQ3V2). El nivel MQ2V2 no se publicó por producir texto degradado y repetitivo; se recomienda usar MQ4V2 o superior para tareas críticas.
- El formato `.hfq` es propietario de hipfire; no es compatible con otros motores de inferencia (vLLM, llama.cpp, TGI). Migrar a otro runtime requiere volver a cuantizar desde el modelo base.
- El modelo base Qwen3.8-27B puede presentar sesgos y alucinaciones inherentes a los LLM; la cuantización puede amplificar estos efectos en niveles bajos.
- El contexto de 262 144 tokens requiere memoria VRAM significativa para la KV cache; en GPUs de 16 GB puede ser necesario reducir el contexto efectivo.
- Aunque la licencia Apache-2.0 permite uso comercial, los artefactos dependen del motor hipfire, cuyo estado de producción y soporte a largo plazo no está garantizado.
- Las métricas de rendimiento publicadas son específicas del banco de pruebas (4×gfx1201, HIP 7.14) y no constituyen una garantía universal de rendimiento en otros hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hipfire-models/qwen3.8-27b
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Documentación de Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Seguimiento de benchmarks y especificaciones: https://aireleasetracker.com/model/qwen/qwen3.8-27b
- Repositorio de hipfire (motor de inferencia): https://github.com/warpfront/hipfire
- Documento de procedencia de hipfire: https://github.com/warpfront/hipfire/blob/master/PRIOR-ART.md

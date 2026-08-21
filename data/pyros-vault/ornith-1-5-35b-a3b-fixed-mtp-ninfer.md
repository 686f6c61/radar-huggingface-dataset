# pyros-vault/Ornith-1.5-35B-A3B-fixed-mtp-NInfer

## Resumen

Ornith-1.5-35B-A3B-fixed-mtp-NInfer es una conversión al formato propietario `.ninfer` del modelo [shisa-ai/Ornith-1.5-35B-A3B-MTP](https://huggingface.co/shisa-ai/Ornith-1.5-35B-A3B-MTP), una variante del modelo original [ornith-ai/Ornith-1.5-35B-A3B](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B) con el cabezal MTP (Multi-Token Prediction) reparado. El modelo base es un MoE de 35 mil millones de parámetros totales con aproximadamente 3 mil millones activos por token, con soporte multimodal (imagen-texto) y una ventana de contexto de 262K tokens. Esta conversión, publicada por pyros-vault, está diseñada exclusivamente para el runtime NInfer-4090, un motor de inferencia optimizado para GPUs consumer con arquitectura `sm_89` (RTX 4090).

La relevancia de este artefacto radica en que integra en un único fichero el modelo objetivo, el cabezal MTP reemplazado por Shisa AI (inicializado con Qwen3.6 y entrenado mediante destilación KL), la torre de visión, un cabezal de propuesta optimizado y los pesos del modelo draft DFlash de Z-Lab para decodificación especulativa. El resultado es un paquete de 21,22 GiB que permite ejecutar un modelo de 35B con decodificación especulativa y visión en una RTX 4090 de 24 GB, con un rendimiento verificado de 66,94% de tokens aceptados en pruebas MTP4. No es un checkpoint Safetensors ni GGUF, y no es compatible con Transformers, llama.cpp ni otros forks de NInfer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.6 / qwen3_5_moe, con cabezal MTP y decodificación especulativa DFlash |
| Parametros totales | 35B (según denominación del modelo) |
| Parametros activos | ~3B (A3B) |
| Longitud de contexto | 262K tokens (según BenchLM) |
| Tipos de cuantizacion | Mixta: BF16, FP32, I32, Q4G64, Q5G64, Q6G64, W8G32 (grupos de 64 o 32 con escalas FP16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (formato propietario del runtime NInfer-4090) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un transformer MoE con 35B parámetros totales y 3B activos por token, desarrollado por ornith-ai dentro de su framework de auto-mejora (self-scaffolding). La variante MTP de Shisa AI reemplaza el cabezal nativo de predicción multi-token por uno inicializado con Qwen3.6 y entrenado mediante destilación KL a vocabulario completo, tras comprobar que el cabezal original tenía un rendimiento deficiente. Esta conversión NInfer conserva ese cabezal reparado y añade los pesos del modelo draft DFlash de Z-Lab, que comparte la arquitectura Qwen3.6 y se usa para decodificación especulativa. NInfer verifica cada propuesta del draft con el modelo objetivo, lo que garantiza la corrección de las predicciones aunque la aceptación depende del prompt. El proceso de conversión validó 1.045 tensores BF16 del modelo objetivo (17 ficheros) y 69 tensores BF16 de DFlash, generando 934 tensores runtime y seis recursos de frontend embebidos. El frontend se adaptó al template de chat de Qwen3.6 requerido por NInfer, conservando los pesos originales.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana de contexto de 262K tokens.
- Soporte multimodal: incluye torre de visión (280 MB en tensores) para entrada imagen-texto (pipeline `image-text-to-text`).
- Decodificación especulativa integrada con modelo draft DFlash (hasta 7 tokens de propuesta) y cabezal MTP4, con 66,94% de tokens aceptados en pruebas locales.
- Capacidades de agente y razonamiento multi-paso, según las evaluaciones del modelo base (supera a Qwen 3.6-35B en benchmarks de código y agente).
- Generación de código y tareas de programación, con soporte de tool calling implícito en la arquitectura Qwen3.6.
- Multilingüismo: no se han publicado datos específicos de idiomas soportados.

## Casos de uso

- Inferencia local en GPU consumer: el paquete está optimizado para RTX 4090 (24 GB) con el runtime NInfer-4090, permitiendo ejecutar un modelo de 35B con decodificación especulativa en hardware de gama alta de consumo.
- Desarrollo de asistentes de código con contexto largo: la ventana de 262K tokens permite procesar repositorios completos o múltiples ficheros fuente en una sola pasada, con generación de código asistida por IA.
- Sistemas de agente autónomo: la combinación de razonamiento multi-paso, tool calling y decodificación especulativa reduce la latencia en pipelines agénticos que requieren múltiples llamadas al modelo.
- Análisis de documentos multimodales: la torre de visión integrada permite procesar imágenes junto con texto, útil para extracción de información de capturas, diagramas o documentos escaneados.
- Prototipado de aplicaciones de chat con contexto largo: el soporte de chat template Qwen3.6 y la gestión de KV cache optimizada permiten conversaciones prolongadas sin degradación.
- Investigación en decodificación especulativa: el paquete incluye tanto el modelo objetivo como el draft y el cabezal MTP, facilitando experimentos con diferentes configuraciones de aceptación de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión NInfer en la información disponible. El modelo base Ornith-1.5-35B-A3B aparece en BenchLM con una puntuación de 49,22/100 (puesto 137 de 224), pero sin cobertura verificada suficiente. Según la documentación del modelo base, supera a Qwen 3.6-35B en benchmarks de código y agente, y a modelos densos como Gemma 4-31B y Muse Glimmer-30B, pero no se proporcionan cifras concretas. La única métrica verificada en esta conversión es la tasa de aceptación de tokens del cabezal MTP4: 66,94% con cero pasos de fallback en pruebas locales.

## Requisitos de hardware

- VRAM estimada: 19,80 GiB en modo texto base, 20,77 GiB con MTP4, 20,51 GiB con DFlash7 y 21,04 GiB con visión + MTP4 (pesos residentes). El consumo real supera estas cifras al añadir KV cache, workspaces y CUDA Graphs.
- GPU recomendada: RTX 4090 de 24 GB (arquitectura `sm_89`), que es el hardware objetivo del runtime NInfer-4090. También se ha documentado ejecución en A100 (según el blog de MindStudio).
- No cabe en GPUs consumer de 16 GB o menos; requiere al menos 24 GB de VRAM.
- Opciones de despliegue: exclusivamente con el runtime [UDPSendToFailed/ninfer-4090](https://github.com/UDPSendToFailed/ninfer-4090) en la rama `feat/rtx-4090-sm89-native`. No es compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers.
- Latencia y throughput: no se han publicado cifras oficiales. La decodificación especulativa con DFlash7 y MTP4 reduce el número de pasos de inferencia, pero el rendimiento depende del prompt y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35B | ~3B | 262K | Apache 2.0 | Safetensors | Modelo original, sin MTP reparado |
| Ornith-1.5-35B-A3B-MTP (Shisa AI) | 35B | ~3B | 262K | Apache 2.0 | Safetensors | Con cabezal MTP reparado por destilación KL |
| Esta conversión NInfer | 35B | ~3B | 262K | Apache 2.0 | `.ninfer` | Añade DFlash, visión y optimización para RTX 4090 |
| Qwen 3.6-35B-A3B | 35B | ~3B | No disponible | Apache 2.0 | Safetensors | Modelo comparable en arquitectura, superado por Ornith en benchmarks de código y agente |
| Gemma 4-31B | 31B | 31B (denso) | No disponible | Gemma license | Safetensors | Denso, superado por Ornith en benchmarks según la documentación |

## Limitaciones y advertencias

- Formato propietario: el artefacto `.ninfer` solo funciona con el runtime NInfer-4090 específico. No es compatible con Transformers, llama.cpp, vLLM, Ollama ni otros forks de NInfer.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de fiabilidad factual para esta conversión; el modelo base hereda los riesgos típicos de los LLM de su tamaño.
- Dependencia del prompt en decodificación especulativa: la tasa de aceptación de tokens del draft DFlash varía según el prompt; el 66,94% observado es de una prueba local acotada y no garantiza el mismo rendimiento en producción.
- Sesgos y limitaciones de idioma: no se dispone de información sobre los idiomas soportados ni sobre posibles sesgos del modelo base.
- Requisitos de hardware estrictos: requiere una GPU con al menos 24 GB de VRAM y arquitectura `sm_89` (RTX 4090); no funciona en GPUs más antiguas ni con menos memoria.
- Licencia Apache 2.0 permite uso comercial, pero el runtime NInfer-4090 es un proyecto de código abierto con su propia licencia; se debe verificar la compatibilidad antes de usar en producción.
- El modelo base Ornith-1.5-35B-A3B tiene una puntuación baja en BenchLM (49,22/100) y cobertura de benchmarks insuficiente, lo que limita la confianza en sus capacidades generales.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/pyros-vault/Ornith-1.5-35B-A3B-fixed-mtp-NInfer
- Modelo base MTP (Shisa AI): https://huggingface.co/shisa-ai/Ornith-1.5-35B-A3B-MTP
- Modelo original (ornith-ai): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Modelo draft DFlash (Z-Lab): https://huggingface.co/z-lab/Qwen3.6-35B-A3B-DFlash
- Runtime NInfer-4090: https://github.com/UDPSendToFailed/ninfer-4090
- Página del modelo Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Benchmarks y contexto en BenchLM: https://benchlm.ai/models/ornith-1-5-35b-a3b
- Guía de despliegue local (MindStudio): https://www.mindstudio.ai/blog/ornith-1-5-35b-a3b-local-run

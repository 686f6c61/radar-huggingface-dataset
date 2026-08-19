# cloud19/Goetia-26B-A4B-v1.4-FP8-Dynamic

## Resumen

Goetia-26B-A4B-v1.4-FP8-Dynamic es una cuantizacion en FP8 dinamico (W8A8) del modelo MoE Naphula/Goetia-26B-A4B-v1.4, desarrollada por cloud19 mediante la herramienta llm-compressor de Neural Magic. El modelo base pertenece a la familia Gemma-4, con 26.544 millones de parametros totales y una arquitectura de mezcla de expertos (MoE) que activa aproximadamente 4.000 millones de parametros por token (segun la nomenclatura A4B). Esta version cuantizada reduce el peso de 48.4 GiB (BF16) a 26.67 GiB, lo que facilita su despliegue en entornos con VRAM limitada y acelera la inferencia sin necesidad de reentrenamiento.

La relevancia de este modelo radica en su eficiencia: al ser un MoE con pocos parametros activos, ofrece un rendimiento comparable a modelos densos de mayor tamano con un coste computacional menor. La cuantizacion FP8 dinamica, que mantiene los pesos en FP8 por canal y las activaciones en FP8 por token, permite ejecutar el modelo en GPUs de gama alta consumer o en GPUs de datacenter con menor consumo de memoria. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

La ficha se basa exclusivamente en la informacion proporcionada en la model card y los metadatos de HuggingFace. No se incluyen datos no verificados, como benchmarks o capacidades especificas del modelo base, ya que no estan documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Gemma-4 |
| Parametros totales | 26.544.133.710 (26.5B) |
| Parametros activos | 4B (segun nomenclatura A4B del modelo base) |
| Longitud de contexto | No especificada (configuracion de ejemplo en vLLM: 16384 tokens) |
| Tipos de cuantizacion | FP8 dinamico (W8A8, esquema FP8_DYNAMIC) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con compressed-tensors (compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base Goetia-26B-A4B-v1.4 es un transformer MoE de la familia Gemma-4, con 26.5B parametros totales y 4B activos por token. La arquitectura MoE divide el modelo en multiples expertos y selecciona solo un subconjunto para cada token, lo que reduce el coste computacional en inferencia. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas como RLHF o DPO.

La cuantizacion FP8 dinamica se realizo con llm-compressor de Neural Magic mediante un proceso data-free one-shot. El esquema FP8_DYNAMIC aplica pesos en FP8 por canal (estaticos) y activaciones en FP8 por token (dinamicos). Se excluyeron de la cuantizacion los embeddings, el lm_head, los routers MoE y la vision tower (si existe), que permanecen en BF16. Este enfoque minimiza la perdida de precision en componentes sensibles. El modelo resultante es compatible con vLLM a traves del backend compressed-tensors, como se indica en la model card.

## Capacidades

- Generacion de texto: al ser un modelo de lenguaje grande, es capaz de producir texto coherente y contextualmente relevante, aunque no se documentan capacidades especificas en la informacion proporcionada.
- Razonamiento y conocimiento general: se espera que herede las capacidades del modelo base Gemma-4, pero no hay datos concretos disponibles.
- Soporte para tool calling y agentes: no confirmado en la informacion disponible.
- Capacidades multilingues: no especificadas.
- Capacidades de vision: la model card menciona una "vision tower" excluida de la cuantizacion, lo que sugiere que el modelo base podria tener capacidades multimodales, pero no se detalla su funcionamiento en esta version.
- Eficiencia en inferencia: gracias a la cuantizacion FP8 y la arquitectura MoE, ofrece menor latencia y menor uso de VRAM en comparacion con el modelo BF16 original.

## Casos de uso

- Despliegue en produccion con vLLM: el modelo esta optimizado para vLLM con el backend compressed-tensors, lo que permite servir respuestas con alta concurrencia (hasta 384 secuencias simultaneas segun el ejemplo de configuracion). Es adecuado para aplicaciones de chat o asistentes virtuales donde se requiere baja latencia.
- Reduccion de costes de infraestructura: al ocupar 26.67 GiB en lugar de 48.4 GiB, permite ejecutar el modelo en GPUs con menor VRAM, como una RTX 4090 (24 GB) con cuantizacion adicional o en GPUs de datacenter con mayor margen para el KV cache.
- Prototipado rapido de aplicaciones de IA generativa: su tamano reducido y compatibilidad con vLLM facilitan la integracion en pipelines de desarrollo sin necesidad de hardware especializado.
- Generacion de codigo asistida: si el modelo base tiene capacidades de programacion (no confirmadas), podria usarse en editores o CLI para autocompletado y generacion de funciones, aprovechando su eficiencia en entornos con recursos limitados.
- Investigacion en eficiencia de modelos: como ejemplo de cuantizacion FP8 aplicada a un MoE, sirve para estudiar el impacto de la reduccion de precision en modelos de gran tamano.
- Aplicaciones con restricciones de memoria: entornos edge o embebidos con GPUs de baja capacidad pueden beneficiarse de este modelo si se aplica una cuantizacion adicional (por ejemplo, GGUF), aunque no se proporciona soporte oficial para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. Tampoco se comparan rendimientos con otros modelos. Se recomienda evaluar el modelo en el caso de uso concreto antes de su adopcion en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP8 ocupan aproximadamente 26.67 GiB. Con overhead de KV cache, activaciones y buffers, se recomienda al menos 32-40 GB de VRAM para una ventana de contexto de 16K tokens. En configuraciones con menor contexto (8K), podria caber en 24 GB, pero no esta garantizado.
- GPUs recomendadas: NVIDIA A100 (40 GB o 80 GB), L40S (48 GB), o GPUs consumer como RTX 4090 (24 GB) con tensor parallelism en configuracion multi-GPU. No se recomienda su uso en GPUs con menos de 24 GB sin cuantizacion adicional.
- Opciones de despliegue: vLLM es el runtime oficialmente soportado (con `--quantization compressed-tensors`). Tambien puede usarse con otras herramientas que soporten el formato compressed-tensors, aunque no se mencionan en la documentacion.
- Latencia y throughput: no se proporcionan datos numericos. La arquitectura MoE con 4B parametros activos sugiere una inferencia mas rapida que un modelo denso de 26B, pero depende del hardware y la configuracion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este modelo con alternativas de la misma categoria (por ejemplo, otros MoE cuantizados como Mixtral-8x7B o Qwen MoE). La unica comparacion directa posible es con el modelo original BF16:

| Modelo | Parametros totales | Parametros activos | Tamano de pesos | Licencia |
|---|---|---|---|---|
| Naphula/Goetia-26B-A4B-v1.4 (BF16) | 26.5B | 4B | ~48.4 GiB | Apache 2.0 |
| cloud19/Goetia-26B-A4B-v1.4-FP8-Dynamic | 26.5B | 4B | 26.67 GiB | Apache 2.0 |

No se conocen otros modelos cuantizados de la misma familia. Para una comparativa mas amplia, se necesitarian datos de benchmarks y caracteristicas adicionales, que no estan disponibles.

## Limitaciones y advertencias

- La cuantizacion FP8 puede introducir una ligera perdida de precision en comparacion con el modelo BF16 original, especialmente en tareas que requieren alta exactitud numerica, como matematicas complejas o logica de largo alcance.
- No se ha verificado el comportamiento del modelo en cuanto a sesgos o alucinaciones. Al ser una cuantizacion de un modelo base no documentado, estos riesgos no estan evaluados.
- La longitud de contexto no esta especificada oficialmente. El ejemplo de vLLM usa 16384 tokens, pero el limite real depende del modelo base y de la configuracion de memoria.
- Los idiomas soportados no se indican; se desconoce si el modelo funciona correctamente en castellano u otros idiomas distintos del ingles.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribucion y los avisos de licencia en las redistribuciones.
- No se proporciona soporte para formatos como GGUF u ONNX; el despliegue esta limitado a entornos compatibles con compressed-tensors (principalmente vLLM).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cloud19/Goetia-26B-A4B-v1.4-FP8-Dynamic
- Modelo base: https://huggingface.co/Naphula/Goetia-26B-A4B-v1.4

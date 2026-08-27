# FlatFootInternational/qwen3.8-27b-MTPLX-6bit

## Resumen

El modelo `FlatFootInternational/qwen3.8-27b-MTPLX-6bit` es una cuantización dinámica de 6 bits del modelo Qwen3.8-27B, desarrollada por FlatFootInternational específicamente para Apple Silicon mediante la librería MLX. Su principal innovación es conservar la cabeza nativa de multi-token prediction (MTP) del modelo base, lo que permite una decodificación especulativa en la que el modelo redacta varios tokens por adelantado y los verifica en un único paso, acelerando la generación sin alterar la distribución de salida.

El modelo base, Qwen3.8-27B, es un transformer denso multimodal de Alibaba, con 27 mil millones de parámetros y una ventana de contexto de 262 144 tokens. Esta versión cuantizada reduce el peso a 6 bits por matriz (con grupos de 64 pesos) y mantiene en 16 bits las partes sensibles, como las normas, los kernels de convolución GDN y la cabeza MTP. El resultado es un archivo de 23,6 GB que cabe en equipos con 32 GB de memoria unificada, como un MacBook M5, y que ofrece velocidades de generación superiores a las de una cuantización estándar gracias al mecanismo MTP.

La relevancia de este modelo radica en que permite ejecutar un LLM de 27B en hardware de consumo de Apple, con una ventana de contexto muy amplia y una licencia Apache 2.0 que facilita su uso comercial. Es una opción atractiva para desarrolladores que trabajan en entornos macOS y necesitan un modelo local con capacidades de razonamiento, código y agentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) |
| Parametros totales | 27B (modelo base); 6 346 296 560 en el archivo safetensors cuantizado |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | 6-bit dinámico (grupos de 64 pesos, partes sensibles en 16-bit) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantización del Qwen3.8-27B, un transformer denso multimodal desarrollado por Alibaba. La cuantización se realizó con la herramienta MTPLX Forge, que asigna 6 bits a cada matriz de pesos, agrupados en bloques de 64, mientras que los componentes críticos (normas, kernels de convolución GDN, parámetros de estado recurrente y la cabeza MTP) se mantienen en 16 bits. Esta estrategia preserva la funcionalidad de multi-token prediction, que es una característica nativa del modelo base.

No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO). La cuantización no implica un entrenamiento adicional; solo una conversión de precisión. El mecanismo MTP permite que el modelo genere varios tokens candidatos en paralelo y los verifique mediante rejection sampling exacto, lo que acelera la inferencia sin cambiar la distribución de salida respecto al modelo original.

## Capacidades

- Generación de texto, razonamiento, código y matemáticas, heredadas del modelo base Qwen3.8-27B.
- Soporte de tool calling y function calling, según las capacidades del modelo base (no confirmado explícitamente en esta cuantización).
- Capacidad para tareas de agente y razonamiento multi-paso, destacada en el repositorio oficial de Qwen3.8-27B.
- Multi-token prediction (MTP) con profundidad 3, que acelera la generación mediante decodificación especulativa.
- Ventana de contexto de 262 144 tokens, adecuada para documentos largos y conversaciones extensas.
- Optimizado para Apple Silicon mediante MLX, con integración nativa en macOS.
- El modelo base es multimodal (visión y texto), pero esta cuantización se publica con pipeline de text-generation y no se especifica soporte de visión.

## Casos de uso

- Asistente de programación local: gracias a la ventana de 262 144 tokens, puede analizar repositorios completos y generar código con contexto amplio. La aceleración por MTP reduce la latencia en iteraciones de autocompletado.
- Automatización de oficina: el modelo base destaca en tareas de office automation, como redacción de informes, resumen de correos electrónicos o generación de presentaciones, ejecutándose de forma privada en un Mac.
- Agentes autónomos: con soporte de tool calling y razonamiento multi-paso, puede orquestar flujos de trabajo que requieren llamadas a APIs, búsquedas o ejecución de comandos, todo en local.
- Análisis de documentos extensos: la ventana de contexto de 262 144 tokens permite procesar libros, contratos o informes técnicos completos sin necesidad de dividirlos en fragmentos.
- Prototipado rápido de chatbots: al ser un modelo de 27B con licencia Apache 2.0, se puede integrar en aplicaciones comerciales sin coste de licencia, ideal para validar ideas en entornos macOS.
- Desarrollo de aplicaciones con MLX: al estar cuantizado específicamente para MLX, se integra fácilmente en proyectos que ya usan esta librería, con un despliegue sencillo mediante la CLI de MTPLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que las velocidades se midieron en un MacBook M5 (no Pro ni Max) con 32 GB de memoria unificada, con los ventiladores al máximo y usando el sampling oficial de Qwen 3.8 (temperature 1.0, top-p 0.95, top-k 20), pero no proporciona cifras concretas de tokens por segundo ni comparativas con otros modelos.

## Requisitos de hardware

- Memoria unificada: se recomiendan 32 GB o más, según la model card.
- GPU: Apple Silicon (M5 o superior). No se menciona compatibilidad con GPUs NVIDIA o AMD.
- Almacenamiento: 23,6 GB para los pesos del modelo.
- Opciones de despliegue: MTPLX (app nativa y CLI), que se instala con `pip install mtplx` y se sirve con `mtplx serve --model FlatFootInternational/qwen3.8-27b-MTPLX-6bit`. También puede usarse directamente con MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262 144 | FP16/BF16 | Apache 2.0 | Multiplataforma |
| qwen3.8-27b-MTPLX-6bit | 27B (6-bit) | 262 144 | 6-bit dinámico | Apache 2.0 | Apple Silicon (MLX) |
| qwen3.8-27b-MTPLX-5bit | 27B (5-bit) | 262 144 | 5-bit | Apache 2.0 | Apple Silicon (MLX) |

La versión de 6 bits ofrece mayor fidelidad que la de 5 bits a costa de un mayor tamaño de archivo (23,6 GB frente a un tamaño no especificado). El modelo base sin cuantizar requiere mucha más memoria y no está optimizado para Apple Silicon. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado específicamente para esta cuantización, pero el modelo base puede presentar sesgos inherentes a los datos de entrenamiento.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo.
- Limitaciones de idioma: no se especifican los idiomas soportados; se recomienda verificar el comportamiento en el idioma deseado.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se debe mantener el aviso de licencia.
- Requisitos de hardware: requiere 32 GB de memoria unificada; no es adecuado para equipos con menos memoria o GPUs convencionales.
- La cuantización de 6 bits puede degradar ligeramente la calidad de salida en comparación con el modelo original en precisión completa.
- El mecanismo MTP depende de la implementación de MTPLX; si se usa otro runtime, la aceleración puede no estar disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FlatFootInternational/qwen3.8-27b-MTPLX-6bit
- Versión 5-bit del mismo autor: https://huggingface.co/FlatFootInternational/qwen3.8-27b-MTPLX-5bit
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de MTPLX en GitHub: https://github.com/youssofal/mtplx
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Receta de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B

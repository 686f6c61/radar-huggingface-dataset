# IFM/K2-Horizon-375B-A23B-FP8

## Resumen

K2-Horizon-375B-A23B-FP8 es la versión cuantizada en FP8 del modelo insignia de la familia K2-Horizon, desarrollada por IFM. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 375.000 millones de parámetros totales y 23.000 millones activos por token, diseñado para cargas de trabajo agénticas de largo horizonte. El repositorio contiene únicamente los pesos en FP8 del modelo base `IFM/K2-Horizon-375B-A23B`, publicado con licencia Apache 2.0 y pesos abiertos.

La relevancia de esta versión radica en la reducción de huella de memoria y el aumento de velocidad de inferencia en hardware compatible con FP8, manteniendo un rendimiento cercano al modelo original en BF16 según las evaluaciones del autor. El modelo declara una ventana de contexto nativa de 524.288 tokens (512K) desde las etapas de midtraining, lo que lo sitúa en la categoría de contexto largo para tareas de agentes, uso de herramientas y flujos de trabajo multi-paso.

El modelo está orientado a un público técnico que necesita desplegar un MoE de gran tamaño con requisitos de memoria manejables. La cuantización selectiva (solo las capas lineales de los expertos enrutados) y la necesidad de paralelismo de expertos para servir el modelo son dos detalles críticos que condicionan su despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) disperso, transformer; librería `transformers` con código personalizado (`k2_horizon`) |
| Parametros totales | 379.167.159.168 (≈375B) |
| Parametros activos | 23B por token |
| Longitud de contexto | 524.288 tokens (512K), nativo desde midtraining |
| Tipos de cuantizacion | FP8 (pesos estáticos con escala por bloque 128×128; activaciones FP8 dinámicas con escala por grupo 1×128 en el eje de canales de entrada); resto de capas en BF16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), repo de 390,6 GB |
| Modelo base | IFM/K2-Horizon-375B-A23B (relación: cuantizado) |
| Datasets de entrenamiento | IFM/K2-Horizon-Pretrain-Data, IFM/K2-Horizon-Midtrain-Data |
| Pipeline | text-generation |
| Descargas / likes | 2.041 / 11 |
| Fecha de creación / actualización | 2026-09-03 / 2026-11-04 |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE disperso con 375B parámetros almacenados y 23B activos por token. La model card no detalla el número de expertos, la proporción de expertos compartidos ni la composición exacta de las capas, pero sí especifica que existen expertos enrutados, expertos compartidos, routers y tres capas densas iniciales. La cuantización FP8 afecta exclusivamente a las capas lineales de los expertos enrutados; atención, expertos compartidos, routers, las tres primeras capas densas y `lm_head` permanecen en BF16.

El entrenamiento se realizó en al menos dos fases documentadas: pretraining y midtraining, con datasets publicados en el Hub (`IFM/K2-Horizon-Pretrain-Data` e `IFM/K2-Horizon-Midtrain-Data`). El contexto de 512K se introduce de forma nativa a partir de las etapas de midtraining. El autor anuncia la publicación del código de entrenamiento (`ifm-ai/xllm`), el código de evaluación (`ifm-ai/Eval360`), el navegador de datos (`ifm-ai/DATA_NAVIGATOR`) y checkpoints intermedios, aunque no se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

Como innovación destacable, la versión FP8 utiliza pesos estáticos con una escala por bloque de 128×128 y activaciones dinámicas con una escala por grupo de 1×128. El tamaño intermedio de los expertos enrutados (1.792) no es divisible en bloques de cuantización de 128 anchos para los tamaños habituales de paralelismo tensorial (TP=4, TP=8), por lo que el despliegue exige paralelismo de expertos.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de diálogo multi-turno.
- Razonamiento agéntico de largo horizonte: la model card destaca rendimiento frontier en uso de herramientas, terminal y flujos de trabajo de largo alcance.
- Uso de herramientas (tool calling / function calling) y razonamiento multi-paso orientado a agentes.
- Contexto largo nativo de 512K tokens, adecuado para documentos extensos, repositorios de código y trazas de agentes.
- Capacidad de ejecución en terminal y entornos de línea de comandos según los benchmarks declarados por el autor.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito en la información disponible.
- Multilingüismo limitado: solo inglés declarado en la model card.

## Casos de uso

- Agentes autónomos de terminal: el modelo puede operar en entornos de línea de comandos ejecutando comandos, interpretando salidas y corrigiendo errores en bucles multi-paso, gracias a su ventana de 512K tokens para mantener el historial completo de la sesión.
- Orquestación de herramientas en producción: con soporte de tool calling, puede integrarse como planificador central que decide qué API invocar, en qué orden y cómo encadenar resultados en flujos de trabajo largos.
- Análisis de repositorios de código completos: la ventana de 512K permite cargar múltiples archivos y trazas de CI/CD para tareas de revisión, refactorización o generación de parches con contexto global del proyecto.
- Automatización de soporte técnico de nivel avanzado: conversaciones multi-turno con historial extenso y acceso a herramientas internas (consultas a bases de datos, tickets, logs) mediante function calling.
- Procesamiento de documentación extensa: resumen, extracción y preguntas sobre contratos, informes o manuales que superan ampliamente el contexto de modelos de 128K.
- Investigación sobre entrenamiento de MoE: la publicación de checkpoints intermedios, datos y código de entrenamiento permite estudiar la evolución de capacidades a lo largo del entrenamiento, no solo en el checkpoint final.
- Despliegue en clústeres con FP8: la versión cuantizada reduce la huella de memoria y acelera la inferencia en GPUs con soporte FP8 (H100, H200, B200), lo que facilita servir un MoE de 375B con menos recursos que la versión BF16.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con modelos abiertos (Nemotron 3 Ultra, Inkling, MiniMax-M3) y cerrados (GLM 5.2, GPT 5.6 Luna, GPT 5.6 Terra, Claude Sonnet5). Sin embargo, en la información proporcionada solo se conserva la fila de número de parámetros de dicha tabla; los valores numéricos de los benchmarks no están disponibles en el extracto. Por tanto:

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card afirma que el modelo iguala o supera a MoE abiertos de hasta 2,6 veces su tamaño en benchmarks agénticos y es competitivo con modelos frontier cerrados, pero no se dispone de las cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo FP8 ocupa 390,6 GB, por lo que se necesita al menos ese espacio en memoria de GPU o en un pool agregado. En BF16 el modelo base requeriría aproximadamente el doble (≈750 GB).
- GPU recomendadas: GPUs con soporte FP8 nativo, como NVIDIA H100, H200 y B200. Para el modelo BF16 se necesitarían configuraciones multi-GPU de mayor capacidad.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) ni en una única GPU profesional de 80 GB; requiere despliegue multi-GPU con paralelismo de expertos.
- Opciones de despliegue: `transformers` con código personalizado (`k2_horizon`), `compressed-tensors` para la carga de pesos cuantizados. El autor no documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Restricción de serving: el tamaño intermedio de los expertos enrutados (1.792) no es divisible en bloques de 128 para TP=4 y TP=8, por lo que es obligatorio el paralelismo de expertos (EP).
- Latencia y throughput: no disponibles en la información proporcionada. El autor indica que la versión FP8 reduce la huella de memoria y acelera la inferencia en hardware compatible frente a BF16.

## Comparativa con modelos similares

La model card compara con los siguientes modelos, pero solo se dispone de los datos de parámetros totales:

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| K2-Horizon-375B-A23B-FP8 | 375B (23B activos) | 512K | Apache 2.0 | Pesos abiertos en HF |
| Nemotron 3 Ultra | 550B | no disponible | no disponible | no disponible |
| Inkling (xhigh) | 975B | no disponible | no disponible | no disponible |
| MiniMax-M3 | no disponible | no disponible | no disponible | no disponible |
| GLM 5.2 (max) | no disponible | no disponible | no disponible | Cerrado |
| GPT 5.6 Luna / Terra | no disponible | no disponible | no disponible | Cerrado |
| Claude Sonnet5 (max) | no disponible | no disponible | no disponible | Cerrado |

No se dispone de datos de rendimiento, contexto ni licencia de los modelos comparados en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Idioma: solo se declara inglés; no hay soporte multilingüe documentado, lo que limita su uso en castellano u otros idiomas.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al entrenarse con datasets publicados por el autor, los sesgos de dichos datos son desconocidos.
- Alucinación: no se proporcionan tasas de alucinación ni evaluaciones de veracidad; como modelo generativo de gran escala, el riesgo persiste y requiere verificación en producción.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y los datasets deben revisarse por separado; la model card no detalla restricciones adicionales.
- Despliegue complejo: requiere paralelismo de expertos por la indivisibilidad del tamaño intermedio (1.792) en bloques de 128 para TP=4/TP=8; esto excluye configuraciones estándar de tensor parallelism.
- Contexto largo: aunque se declaran 512K tokens nativos, no se documentan evaluaciones específicas de degradación en contextos extremos ni latencia asociada.
- Cuantización: solo los expertos enrutados están en FP8; el resto en BF16, por lo que la reducción de memoria es parcial y el rendimiento puede variar según la carga.
- Checkpoints intermedios y código de entrenamiento anunciados pero no disponibles en el momento de la ficha; la reproducibilidad completa aún no es posible.
- Sin datos de benchmarks numéricos verificables en la información disponible; las afirmaciones de rendimiento frontier provienen del autor y no pueden contrastarse con las cifras del extracto.

## Enlaces

- Hugging Face: https://huggingface.co/IFM/K2-Horizon-375B-A23B-FP8
- Modelo base: https://huggingface.co/IFM/K2-Horizon-375B-A23B
- Código de entrenamiento: https://github.com/ifm-ai/xllm
- Código de evaluación: https://github.com/ifm-ai/Eval360
- Navegador de datos: https://github.com/ifm-ai/DATA_NAVIGATOR
- Dataset de pretraining: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de midtraining: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data

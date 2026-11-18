# IFM/K2-Horizon-32B

## Resumen

K2-Horizon-32B es un modelo de lenguaje denso de tipo decoder-only desarrollado por IFM, con 34.779.304.960 parámetros totales según los pesos en safetensors publicados en Hugging Face. Se presenta como el miembro grande y denso de la familia K2-Horizon, y su rasgo más distintivo es una ventana de contexto nativa de 524.288 tokens (512K) desde las etapas de midtraining en adelante, lo que lo sitúa en la gama alta de modelos abiertos con contexto largo.

El modelo se distribuye con licencia Apache 2.0 y con un planteamiento de apertura poco habitual: además de los pesos, el autor publica el código de entrenamiento (xllm), el código de evaluación (Eval360), la receta y los conjuntos de datos de preentrenamiento y midtraining, y checkpoints intermedios para estudiar la evolución de capacidades a lo largo del entrenamiento. Está etiquetado como text-generation, entrenado principalmente en inglés y orientado a cargas conversacionales, de razonamiento, código y uso de herramientas en entornos agénticos.

Su relevancia actual radica en que combina tres elementos que rara vez aparecen juntos en un modelo abierto de 32B: contexto de 512K, evaluación explícita en benchmarks agénticos (tau3-Banking, entre otros) y trazabilidad completa del pipeline de entrenamiento. La model card lo compara con modelos densos abiertos de tamaño similar (Qwen3.8-27B, Muse Glimmer-30B, IBM Granite 4.2 30B) y con GPT-5.6 Luna (medium) como referencia propietaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia K2-Horizon, tipo `k2_horizon` con `custom_code`) |
| Parametros totales | 34.779.304.960 (34,78B) |
| Parametros activos | No aplica (modelo denso; la model card indica 32B activados) |
| Longitud de contexto | 524.288 tokens (512K), nativa desde midtraining |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors; no se detallan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

K2-Horizon-32B es un transformer decoder-only denso, sin mezcla de expertos: todos los parámetros se activan en cada token, y la model card confirma explícitamente "Dense" y "32B activated params" en su tabla comparativa. El identificador de arquitectura es `k2_horizon`, con código personalizado incluido en el repositorio, por lo que la carga requiere `trust_remote_code=True` o una versión de transformers compatible con dicha implementación. La ventana de contexto de 512K se establece de forma nativa a partir de las etapas de midtraining, no como una extensión posterior mediante RoPE scaling u otras técnicas de extrapolación.

El entrenamiento se documenta con dos conjuntos de datos publicados: `IFM/K2-Horizon-Pretrain-Data` e `IFM/K2-Horizon-Midtrain-Data`, accesibles a través del repositorio DATA_NAVIGATOR del autor. El número exacto de tokens de entrenamiento, la composición del dataset y si hubo etapas de RLHF, DPO u otro ajuste por preferencias no se detallan en la información disponible. La model card destaca como innovación metodológica la publicación de checkpoints intermedios, que permiten estudiar cambios de capacidad a lo largo del entrenamiento en lugar de evaluar únicamente el checkpoint final; también se publica el código de entrenamiento (xllm) y el de evaluación (Eval360).

## Capacidades

- Generación de texto conversacional multi-turno con ventanas de hasta 524.288 tokens, adecuada para documentos largos y conversaciones extensas.
- Razonamiento y resolución de problemas, evaluado en la familia de benchmarks de razonamiento que el autor reporta junto al resto de la familia K2-Horizon.
- Generación y comprensión de código, con evaluación en benchmarks de coding según la model card.
- Uso de herramientas en entornos agénticos: la evaluación incluye tau3-Banking (agentic tool use), lo que indica soporte entrenado/evaluado para tool calling y flujos de múltiples pasos.
- Capacidades agénticas multi-step: la tabla de benchmarks agrupa explícitamente la categoría "Agents".
- Multilingüe: limitado al inglés según la etiqueta de idioma del repositorio; no se declaran otros idiomas.
- Modo thinking, visión, audio u otras modalidades: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de repositorios y bases de código completas: con 512K tokens de contexto, el modelo puede ingerir varios ficheros o un monorepo de tamaño medio en una sola pasada y responder preguntas de arquitectura, dependencias o refactorizaciones sin trocear el código en fragmentos que pierdan contexto entre llamadas.
- Agentes de atención al cliente con historial largo: la ventana de 512K permite mantener conversaciones multi-turno muy extensas junto con la documentación de producto y las políticas internas en el mismo prompt, reduciendo la necesidad de resúmenes intermedios que degradan la coherencia.
- Automatización de flujos bancarios y back-office con tool calling: el modelo está evaluado en tau3-Banking, un benchmark de uso agéntico de herramientas en dominio bancario, por lo que encaja en asistentes que consultan APIs, validan operaciones y encadenan varios pasos con verificación intermedia.
- Procesamiento de contratos y documentación legal: la combinación de contexto largo y licencia Apache 2.0 permite desplegar el modelo on-premise para extraer cláusulas, comparar versiones de contratos y generar resúmenes sobre documentos de cientos de páginas sin enviar datos a terceros.
- Generación de código en pipelines de CI/CD: integrado mediante tool calling, puede revisar diffs, proponer parches y ejecutar consultas a herramientas del repositorio dentro de un flujo automatizado de integración continua, con la ventaja de que el código de entrenamiento y evaluación es auditable.
- Investigación sobre dinámica de entrenamiento: la publicación de checkpoints intermedios y de los datasets de preentrenamiento y midtraining permite reproducir curvas de capacidad, estudiar emergencia de habilidades y validar recetas de contexto largo sin entrenar desde cero.
- Asistentes de análisis de documentación técnica extensa: manuales, RFCs o documentación de infraestructura que superan ampliamente los 128K tokens pueden cargarse íntegros, lo que simplifica la recuperación y evita errores de fragmentación en preguntas que cruzan secciones distantes.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativos frente a Qwen3.8-27B, Muse Glimmer-30B, IBM Granite 4.2 30B y GPT-5.6 Luna (medium), organizada por categorías (Agents, Coding, Reasoning) e incluyendo tau3-Banking como benchmark agéntico destacado. Sin embargo, en la información proporcionada solo se ha podido extraer la cabecera de la tabla y la fila de número de parámetros, arquitectura y parámetros activados; los valores numéricos de las métricas no están disponibles en el material recibido.

| Benchmark | K2-Horizon-32B | Qwen3.8-27B | Muse Glimmer-30B | IBM Granite 4.2 30B |
|---|---|---|---|---|
| Parametros | 32B | 27B | 30B | 30B |
| Parametros activados | 32B | 27B | 30B | 30B |
| Arquitectura | Dense | Dense | Dense | Dense |
| tau3-Banking (agentic tool use) | No disponible | No disponible | No disponible | No disponible |
| Resto de benchmarks (Coding, Reasoning) | No disponible | No disponible | No disponible | No disponible |

No se han publicado en la informacion disponible los valores numericos de MMLU, HumanEval, GSM8K ni del resto de benchmarks citados en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 69,6 GB solo para pesos (2 bytes por parámetro sobre 34,78B), más overhead de KV cache; se recomienda un mínimo de 80 GB para contexto corto.
- VRAM estimada en FP8: en torno a 35 GB para pesos, lo que encaja en una GPU de 48 GB o en dos de 24 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 17-20 GB para pesos, viable en GPUs consumer de 24 GB (RTX 3090, RTX 4090) para contextos moderados.
- Contexto largo: la KV cache a 512K tokens es el factor dominante; sin datos publicados de configuración de cabezas y capas no es posible dar una cifra exacta, pero en la práctica requerirá GPUs de 80 GB o configuraciones multi-GPU incluso con pesos cuantizados.
- GPU recomendadas: H100 80GB o A100 80GB para BF16 y contexto largo; A6000/L40S 48GB para FP8; RTX 4090/3090 24GB para cuantización de 4 bits con contexto reducido.
- Cabe en GPU consumer: sí, en RTX 4090/3090 con cuantización de 4 bits y ventanas de contexto moderadas; no en BF16.
- Opciones de despliegue: transformers (requiere `trust_remote_code=True` por el código personalizado `k2_horizon`); vLLM, TGI, llama.cpp y Ollama no están confirmados en la información disponible, y su viabilidad depende de que dichos frameworks soporten la arquitectura personalizada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K2-Horizon-32B | 34,78B | 524.288 tokens | Densa | Apache 2.0 | Pesos safetensors en HF, código y datos publicados |
| Qwen3.8-27B | 27B | No disponible | Densa | No disponible | Citado como referencia en la model card |
| Muse Glimmer-30B | 30B | No disponible | Densa | No disponible | Citado como referencia en la model card |
| IBM Granite 4.2 30B | 30B | No disponible | Densa | No disponible | Citado como referencia en la model card |

La comparación se limita a los datos que aparecen en la tabla de la model card; los resultados de rendimiento relativos no están disponibles en la información recibida. Frente a los tres modelos de referencia, K2-Horizon-32B aporta el mayor número de parámetros del grupo y una ventana de contexto de 512K, si bien no se dispone de los datos de contexto de los competidores para confirmar la ventaja. Como referencia adicional, la model card incluye a GPT-5.6 Luna (medium) como modelo propietario de comparación, sin que se hayan podido extraer sus cifras.

## Limitaciones y advertencias

- Idioma: el modelo está entrenado y etiquetado únicamente para inglés; su rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Arquitectura personalizada: el repositorio usa `custom_code` con el identificador `k2_horizon`, lo que exige `trust_remote_code=True` y puede limitar la compatibilidad con frameworks de inferencia de alto rendimiento como vLLM o TGI hasta que estos implementen la arquitectura.
- Riesgo de alucinación: no se han publicado tasas de alucinación ni evaluaciones de fidelidad; como en cualquier modelo generativo, las respuestas deben verificarse en dominios sensibles (legal, financiero, médico).
- Sesgos: no se documentan análisis de sesgo, composición demográfica del dataset ni evaluaciones de seguridad en la información disponible.
- Contexto largo: aunque la ventana nativa es de 512K tokens, no se han publicado resultados de benchmarks de recuperación en contexto largo (needle-in-a-haystack, RULER u otros), por lo que la calidad efectiva en el extremo de la ventana no está verificada.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías ni indemnizaciones; conviene revisar las licencias de los datasets publicados si se reutilizan para reentrenamiento.
- Coste de despliegue: con 34,78B parámetros densos, el coste de inferencia por token es notablemente superior al de un MoE de tamaño equivalente en parámetros totales, y el contexto de 512K multiplica los requisitos de memoria.
- Datos de entrenamiento: aunque se publican los conjuntos de preentrenamiento y midtraining, no se detalla el número de tokens, la mezcla final ni las etapas de alineación (RLHF/DPO), lo que dificulta auditar el comportamiento del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IFM/K2-Horizon-32B
- Código de entrenamiento (xllm): https://github.com/ifm-ai/xllm
- Código de evaluación (Eval360): https://github.com/ifm-ai/Eval360
- Navegador de datos de entrenamiento (DATA_NAVIGATOR): https://github.com/ifm-ai/DATA_NAVIGATOR
- Dataset de preentrenamiento: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de midtraining: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data

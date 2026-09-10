# Openintelligent123/DeepSeek-V4-Flash

## Resumen
DeepSeek-V4-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek AI, presentado como parte de la serie DeepSeek-V4. Este modelo destaca por su arquitectura híbrida de atención (CSA y HCA) que permite manejar contextos de hasta un millón de tokens de forma eficiente, reduciendo drásticamente los costes de inferencia y el uso de memoria KV. Con un total de 284 mil millones de parámetros (13 mil millones activados), ofrece un equilibrio entre capacidad y eficiencia computacional.

El modelo se entrena sobre más de 32 billones de tokens de alta calidad e incorpora innovaciones como las conexiones hiperrestrictas (mHC) y el optimizador Muon. Según su documentación, una versión del modelo con mayor presupuesto de razonamiento (DeepSeek-V4-Flash-Max) alcanza un rendimiento razonablemente cercano al de la variante Pro en tareas de razonamiento. El repositorio en Hugging Face es una publicación del usuario Openintelligent123, no un espejo oficial del equipo de DeepSeek, aunque la model card está extraída del trabajo original.

DeepSeek-V4-Flash está disponible bajo licencia MIT y viene pre-cuantizado en formato mixto FP4 + FP8. Es relevante para desarrolladores e investigadores que necesitan modelos de contexto muy largo (1M de tokens) con un coste de inferencia menor que el de alternativas de parámetros completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture-of-Experts) basada en transformer |
| Parametros totales | 284B (según model card); 290.944.616.402 (dato real de los safetensors en Hugging Face) |
| Parametros activos | 13B |
| Longitud de contexto | 1 millon de tokens |
| Tipos de cuantizacion | FP4 + FP8 Mixed (expertos MoE en FP4, el resto en FP8); etiquetas de HF indican 8-bit y fp8 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura de DeepSeek-V4-Flash combina una mezcla de expertos (Mixture-of-Experts, MoE) con un mecanismo de atención híbrida compuesto por Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA). Este diseño reduce los FLOPs necesarios por token y la memoria de KV cache en contextos largos. Además, incorpora Manifold-Constrained Hyper-Connections (mHC), que fortalecen las conexiones residuales convencionales, y el optimizador Muon para una convergencia más estable.

El entrenamiento se realizó sobre más de 32T de tokens diversos y de alta calidad. La fase posterior incluye un procedimiento en dos etapas: primero se cultivan expertos de dominio independientes mediante SFT y reinforcement learning con GRPO, y después se consolidan en un único modelo mediante destilación on-policy. Esta técnica busca integrar distintas capacidades especializadas en un solo modelo. La versión "Max" del modelo se corresponde con un modo de razonamiento de mayor esfuerzo; en la model card se indica que DeepSeek-V4-Pro-Max se establece como el mejor modelo de código abierto en su momento, mientras que Flash-Max queda ligeramente por detrás en tareas de conocimiento y en flujos de trabajo de agentes más complejos.

## Capacidades
- Generación de texto y conocimiento general: el modelo es un LLM de propósito general con soporte de contexto extendido de hasta 1M de tokens.
- Razonamiento: la variante DeepSeek-V4-Flash-Max está diseñada para razonamiento con mayor presupuesto de iteraciones, mostrando un rendimiento en razonamiento comparable al de la variante Pro. No hay datos específicos sobre modos de "thinking" en la documentación disponible.
- Multilingüismo: los benchmarks publicados incluyen pruebas en inglés (AGIEval, MMLU, MMLU-Pro, MMMLU) y en chino (C-Eval, CMMLU), lo que sugiere un uso previsto bilingüe, aunque no se especifica oficialmente la lista de idiomas.
- Eficiencia en contexto largo: gracias a la atención híbrida, el modelo soporta 1M de tokens con un uso reducido de KV cache y FLOPs, lo que facilita el procesamiento de documentos extensos.
- Tool calling / function calling: no se menciona explícitamente en la información disponible, por lo que se considera no confirmado.
- Soporte de agentes: la documentación menciona tareas de agentes para la serie Pro-Max, pero no se detallan capacidades concretas para Flash.

## Casos de uso
- Análisis de contratos y documentos legales completos: la ventana de 1M de tokens permite procesar de una vez todo un expediente contractual, incluyendo cláusulas cruzadas y anexos, sin necesidad de fragmentar el texto ni perder contexto.
- Investigación académica y revisión de literatura: el modelo puede leer docenas de papers en una sola consulta para producir resúmenes comparativos o identificar técnicas relacionadas, gracias a la gran longitud de contexto.
- Asistente de soporte técnico con historial amplio: al mantener conversaciones con todo el hilo de la conversación y el historial de incidencias previas, puede resolver problemas que requieren recordar detalles de mucho tiempo atrás.
- Generación de documentación técnica a partir de una base de código extensa: al alimentar el repositorio completo como contexto, el modelo puede explicar arquitecturas de software, generar documentación de módulos o proponer refactorizaciones. Esta capacidad no está explícitamente confirmada en la documentación, pero es esperable en un LLM de propósito general.
- Data mining sobre corpus lingüísticos: para análisis de sentimiento, extracción de entidades o clasificación de documentos sobre grandes volúmenes de texto, la capacidad de procesar largos tramos permite una comprensión coherente del discurso.
- Creación de sistemas de preguntas y respuestas sobre bases de conocimiento extensas: el modelo puede actuar sobre un corpus completo de manuales, wikis o normativas, respondiendo consultas con referencias precisas dentro del texto.

## Benchmarks y rendimiento
La model card publica resultados de la versión base del modelo (DeepSeek-V4-Flash-Base) frente a DeepSeek-V3.2-Base y DeepSeek-V4-Pro-Base. Se presentan a continuación los datos disponibles:

| Benchmark (Metrica) | DeepSeek-V3.2-Base | DeepSeek-V4-Flash-Base | DeepSeek-V4-Pro-Base |
|---|---|---|---|
| AGIEval (EM) | 80.1 | 82.6 | 83.1 |
| MMLU (EM) | 87.8 | 88.7 | 90.1 |
| MMLU-Redux (EM) | 87.5 | 89.4 | 90.8 |
| MMLU-Pro (EM) | 65.5 | 68.3 | 73.5 |
| MMMLU (EM) | 87.9 | 88.8 | 90.3 |
| C-Eval (EM) | 90.4 | 92.1 | 93.1 |
| CMMLU (EM) | 88.9 | 90.4 | 90.8 |

No se han publicado en la información disponible más resultados de benchmarks para la versión instruida (no base). Los datos de razonamiento, código o matemáticas no están presentes en la documentación consultada.

## Requisitos de hardware
- Peso del modelo: el repositorio ocupa aproximadamente 159.6 GB, lo que da una idea del espacio en disco necesario si se descargan todos los pesos.
- VRAM estimada para inferencia: para cargar el modelo con precisión FP4+FP8 se necesitan múltiples GPUs; una estimación basada en el tamaño de los pesos apunta a al menos 160 GB de memoria agregada, sin contar la KV cache ni los buffers intermedios.
- GPU recomendadas: se requieren configuraciones multi-GPU profesionales, por ejemplo 4× H100 80GB o 8× A100 80GB en paralelo. Puede ser viable en un clúster con GPUs de 80 GB o más, pero no es adecuado para una GPU de consumidor convencional.
- No cabe en GPUs de consumo: el modelo supera con creces la VRAM de una RTX 4090 (24 GB) o de una RTX 3090 (24 GB).
- Opciones de despliegue: al estar publicado para la librería Transformers, puede cargarse con Hugging Face Transformers. Para producción, vLLM o TGI son alternativas habituales, aunque su compatibilidad específica no está confirmada en la documentación del modelo.
- Latencia y throughput: no se han publicado valores de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Params totales | Params activados | Contexto | MMLU (base) | Licencia |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash | 284B | 13B | 1M | 88.7 | MIT |
| DeepSeek-V3.2 | 671B | 37B | No disponible | 87.8 | MIT (no confirmado) |
| DeepSeek-V4-Pro | 1.6T | 49B | 1M | 90.1 | MIT |

DeepSeek-V3.2 es un modelo anterior de la misma familia, con más parámetros totales y activados, pero un rendimiento inferior en MMLU en su versión base. DeepSeek-V4-Pro es la variante superior de la serie, con un contexto igualmente largo y mejores resultados en los benchmarks publicados.

## Limitaciones y advertencias
- El repositorio publicado en Hugging Face no es un espejo oficial de DeepSeek AI; el subidor es el usuario Openintelligent123. Verificar la procedencia de los pesos antes de usarlo en entornos de confianza.
- Solo se han publicado resultados de benchmarks para la versión base; no hay datos sobre alucinación, sesgos o comportamiento en la versión instruida.
- El modelo es extremadamente grande y no es ejecutable en hardware de consumo; se necesita infraestructura multi-GPU con VRAM agregada de al menos 160 GB.
- No se especifica la lista oficial de idiomas soportados; la evidencia de los benchmarks sugiere inglés y chino, pero no son datos confirmados.
- El modelo está etiquetado como "preview" en la documentación original de DeepSeek, lo que implica que puede haber cambios o limitaciones de rendimiento no documentadas.
- La licencia MIT es permisiva, pero la carga de un modelo de este tamaño puede conllevar un coste energético significativo y requiere consideraciones de despliegue no triviales.

## Enlaces
- Repositorio en Hugging Face consultado: https://huggingface.co/Openintelligent123/DeepSeek-V4-Flash
- Modelo original en Hugging Face según la model card: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Informe técnico (paper): https://arxiv.org/abs/2606.19348
- Modelo base en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Base
- Modelo Pro en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro

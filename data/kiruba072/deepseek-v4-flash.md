# Kiruba072/DeepSeek-V4-Flash

## Resumen

DeepSeek-V4-Flash es la variante compacta de la familia DeepSeek-V4, una serie de modelos de lenguaje de tipo Mixture-of-Experts (MoE) desarrollada por DeepSeek AI. Con 284.000 millones de parámetros totales y 13.000 millones activados por token, está diseñada para ofrecer razonamiento de alto nivel con un coste de inferencia contenido. Su rasgo más distintivo es una longitud de contexto de un millón de tokens, soportada por una arquitectura de atención híbrida que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA).

El modelo se presenta como una versión "preview" dentro de la serie V4, junto a la variante mayor DeepSeek-V4-Pro (1,6 billones de parámetros totales, 49.000 millones activados). Según la model card, Flash-Max —el modo de máximo esfuerzo de razonamiento— alcanza un rendimiento de razonamiento comparable a la versión Pro cuando se le concede un presupuesto de pensamiento amplio, aunque queda algo por detrás en tareas de conocimiento puro y en los flujos agénticos más complejos.

La relevancia actual del modelo radica en su combinación de contexto extremo (1M tokens), licencia MIT y una arquitectura optimizada para eficiencia en contexto largo. El repositorio de Hugging Face indicado (Kiruba072/DeepSeek-V4-Flash) es una publicación de terceros con 0 descargas y 0 likes, creada el 23 de noviembre de 2026, que replica la model card oficial de DeepSeek.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida CSA + HCA y Manifold-Constrained Hyper-Connections (mHC) |
| Parametros totales | 290.944.616.402 (≈284B según model card; 290,9B según safetensors del repo) |
| Parametros activos | 13B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP4 + FP8 mixto (expertos MoE en FP4, resto mayoritariamente FP8); el repo incluye pesos en 8-bit/fp8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

DeepSeek-V4-Flash es un transformer de tipo MoE con dos innovaciones arquitectónicas principales. La primera es una atención híbrida que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA), diseñada para mejorar drásticamente la eficiencia en contexto largo: según la model card, en el escenario de 1M tokens la variante Pro requiere solo el 27% de los FLOPs de inferencia por token y el 10% del KV cache respecto a DeepSeek-V3.2. La segunda es la incorporación de Manifold-Constrained Hyper-Connections (mHC), que refuerzan las conexiones residuales convencionales para mejorar la estabilidad de la propagación de señal entre capas preservando la expresividad del modelo.

El preentrenamiento se realizó sobre más de 32 billones (32T) de tokens diversos y de alta calidad. El post-entrenamiento sigue un paradigma en dos etapas: primero se cultivan expertos independientes por dominio mediante SFT y RL con GRPO, y después se consolidan en un único modelo mediante destilación on-policy. El optimizador empleado es Muon, elegido por su convergencia más rápida y mayor estabilidad de entrenamiento. Los pesos se distribuyen en precisión mixta FP4 + FP8, con los parámetros de los expertos MoE en FP4 y la mayor parte del resto en FP8.

## Capacidades

- Generación de texto y razonamiento de propósito general, con un modo de máximo esfuerzo de razonamiento (Flash-Max) que incrementa el presupuesto de pensamiento.
- Procesamiento de contexto extremadamente largo (hasta 1M tokens), orientado a inteligencia sobre documentos masivos y conversaciones de muchas vueltas.
- Razonamiento matemático y de conocimiento del mundo, evaluado en benchmarks como MMLU, MMLU-Pro, AGIEval, C-Eval y CMMLU.
- Capacidades de código y tareas agénticas, según la model card posicionadas en la gama alta de los modelos abiertos.
- Soporte multilingüe: la model card reporta resultados en MMMLU, C-Eval y CMMLU, lo que evidencia cobertura al menos de inglés y chino; el conjunto completo de idiomas no está detallado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de repositorios y bases de código completas: con 1M tokens de contexto, el modelo puede ingerir varios módulos o un monorepo de tamaño medio en una sola pasada para tareas de revisión, refactorización o explicación de arquitectura.
- Asistentes de investigación documental: indexación y razonamiento sobre corpus extensos (informes anuales, expedientes, literatura científica) sin necesidad de fragmentación agresiva ni recuperación externa.
- Generación y revisión de código en pipelines de CI/CD: su orientación a benchmarks de programación y su escala de 13B parámetros activos lo hacen viable para tareas de autocompletado, generación de tests y revisión automatizada de pull requests.
- Agentes multi-paso con memoria larga: flujos agénticos que acumulan historial extenso de herramientas y observaciones, donde el coste reducido de KV cache en contexto largo resulta determinante.
- Atención al cliente automatizada sobre bases de conocimiento amplias: conversaciones multi-turno con contexto de producto, histórico de tickets y políticas internas cargadas en la ventana de 1M tokens.
- Procesamiento de documentación legal o regulatoria: comparación de contratos, detección de cláusulas contradictorias y resumen estructurado sobre expedientes completos.
- Evaluación y anotación de datasets a gran escala: clasificación, extracción y generación de pares instrucción-respuesta con contexto largo, aprovechando la licencia MIT para uso interno y comercial.

## Benchmarks y rendimiento

Resultados de los modelos base publicados en la model card (métrica EM, salvo indicación):

| Benchmark | Shots | DeepSeek-V3.2-Base | DeepSeek-V4-Flash-Base | DeepSeek-V4-Pro-Base |
|---|---|---|---|---|
| Parámetros activados | - | 37B | 13B | 49B |
| Parámetros totales | - | 671B | 284B | 1,6T |
| AGIEval | 0-shot | 80,1 | 82,6 | 83,1 |
| MMLU | 5-shot | 87,8 | 88,7 | 90,1 |
| MMLU-Redux | 5-shot | 87,5 | 89,4 | 90,8 |
| MMLU-Pro | 5-shot | 65,5 | 68,3 | 73,5 |
| MMMLU | 5-shot | 87,9 | 88,8 | 90,3 |
| C-Eval | 5-shot | 90,4 | 92,1 | 93,1 |
| CMMLU | 5-shot | 88,9 | 90,4 | 90,8 |

No se han publicado en la información disponible resultados de benchmarks para la variante instruct/chat DeepSeek-V4-Flash (solo para la base), ni cifras de HumanEval, GSM8K u otros benchmarks de código y matemáticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 284B parámetros totales en FP8, los pesos ocupan del orden de 284 GB; en FP4 para los expertos, la huella se reduce sustancialmente, aunque no se dispone de cifra oficial. El repo de safetensors ocupa 159,6 GB, lo que sugiere una distribución en precisión mixta.
- GPU recomendadas: despliegue multi-GPU obligatorio en la práctica. Un nodo con 8×H100 (80 GB) o 8×H200 ofrece margen para los pesos en FP8 más el KV cache en contexto largo; configuraciones con A100 de 80 GB también son viables con paralelismo tensorial.
- GPU de consumo: no cabe en una sola GPU consumer (RTX 4090, 24 GB) ni en varias sin cuantización agresiva y descarga de expertos a CPU/RAM. No se dispone de datos de ejecución en consumer.
- Opciones de despliegue: el repo declara compatibilidad con `transformers` y endpoints compatibles; para serving de producción se esperaría vLLM o TGI, aunque no se confirma soporte explícito en la información disponible. llama.cpp/Ollama no están confirmados para esta escala.
- Latencia y throughput: no disponibles. La model card solo cuantifica la eficiencia relativa frente a V3.2 (27% de FLOPs por token y 10% de KV cache en contexto de 1M tokens para la variante Pro).

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Flash | 284B / 13B | 1M | MIT | Variante compacta de la serie V4 |
| DeepSeek-V4-Pro | 1,6T / 49B | 1M | MIT | Variante mayor; mejor en conocimiento y agentes complejos |
| DeepSeek-V3.2 | 671B / 37B | no disponible | MIT (según serie V3) | Generación anterior; superado por V4-Flash en los benchmarks base reportados |

No se dispone en la información proporcionada de comparaciones con modelos de otros fabricantes (Llama, Qwen, Mistral) ni de datos de contexto para V3.2.

## Limitaciones y advertencias

- El repositorio de Hugging Face (`Kiruba072/DeepSeek-V4-Flash`) es una publicación de terceros, no oficial de DeepSeek AI, con 0 descargas y 0 likes; conviene verificar la integridad de los pesos antes de usarlos en producción.
- La model card describe una versión "preview"; pueden existir cambios de comportamiento o de pesos en versiones posteriores.
- La variante Flash queda por detrás de Pro en conocimiento puro y en los flujos agénticos más complejos, según reconoce la propia model card.
- No se detalla la composición idiomática del dataset ni los idiomas soportados oficialmente; el rendimiento fuera de inglés y chino no está verificado.
- No se han publicado datos de sesgos, tasas de alucinación ni evaluaciones de seguridad en la información disponible.
- El tamaño (284B parámetros, repo de 159,6 GB) implica costes de hardware y despliegue elevados pese a la licencia permisiva.
- Licencia MIT: permite uso comercial y modificación, pero no se especifican cláusulas adicionales de uso aceptable en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kiruba072/DeepSeek-V4-Flash
- Informe técnico (arXiv): https://arxiv.org/abs/2606.19348
- Página oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organización DeepSeek AI en Hugging Face: https://huggingface.co/deepseek-ai
- Twitter/X de DeepSeek: https://twitter.com/deepseek_ai
- DeepSeek-V4-Flash-Base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Base
- DeepSeek-V4-Pro: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- DeepSeek-V4-Pro-Base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-Base
- ModelScope (espejo): https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Flash

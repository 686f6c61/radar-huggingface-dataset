# CollectionStudio/Trinity-Large-Preview

## Resumen

Trinity-Large-Preview es un modelo de lenguaje de gran escala, tipo Mixture of Experts (MoE) sparse, desarrollado por Arcee AI y distribuido en HuggingFace bajo el repositorio CollectionStudio/Trinity-Large-Preview. Es la variante "Preview" de la familia Trinity Large, un modelo pensado para conversación y chat, que se encuentra en fase de post-entrenamiento con RL activo. Con 398.635 millones de parámetros totales y aproximadamente 13.000 millones de parámetros activos por token, ofrece un rendimiento frontera con un coste de inferencia mucho menor que un modelo denso equivalente.

El modelo fue preentrenado con más de 17 billones de tokens y después ajustado por instrucciones con 20.000 millones de tokens. Su arquitectura sparse MoE, con 256 expertos y una routing 4-de-256, permite activar solo el 1,56% de los parámetros en cada paso. La longitud de contexto se extiende hasta 512.000 tokens, lo que lo hace adecuado para tareas con documentos largos. Trinity-Large-Preview se apoya en una arquitectura AfmoeForCausalLM y es compatible con Transformers, vLLM, llama.cpp y LM Studio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) sparse, AfmoeForCausalLM |
| Parametros totales | 398.635.286.016 (≈398.000 millones) |
| Parametros activos | Aproximadamente 13.000 millones (13B) por token |
| Longitud de contexto | 512.000 tokens (8.192 en preentrenamiento) |
| Tipos de cuantizacion | No disponible en la información; existen repos separados con cuantización GGUF y NVFP4 |
| Idiomas soportados | Inglés, español, francés, alemán, italiano, portugués, ruso, árabe, hindi, coreano y chino |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (también distribuido en formato GGUF) |

## Arquitectura y entrenamiento

Trinity-Large-Preview utiliza una arquitectura de Mixture of Experts sparse con 256 expertos, de los cuales uno es compartido. En cada token solo se activan 4 expertos, lo que implica una sparsity del 1,56% y un coste computacional equivalente a un modelo denso de aproximadamente 13.000 millones de parámetros. La red incluye 6 capas densas. El modelo se basa en el checkpoint Trinity-Large-Base de Arcee AI, preentrenado sobre 17 billones de tokens con datos proporcionados por Datology. La fase de post-entrenamiento de esta variante utilizó 20.000 millones de tokens de instrucciones y está sometida a un proceso de RL activo.

El entrenamiento se realizó en un clúster de 2.048 GPUs NVIDIA B300, utilizando paralelismo HSDP y Expert Parallelism, con Prime Intellect como socio de infraestructura. El contexto se amplió desde los 8.192 tokens de preentrenamiento hasta los 512.000 tras la extensión. El paper técnico está disponible en el repositorio de GitHub de Arcee AI y se referencia un preprint en arXiv con el identificador 2602.17004. La familia Trinity incluye también las variantes TrueBase, Base y Thinking, con diferentes niveles de post-entrenamiento y optimización para razonamiento o agentes.

## Capacidades

- Generación de texto conversacional y asistencia en chat, con soporte para plantillas de mensajes de Transformers.
- Razonamiento matemático: alcanza un 24.0 en AIME 2025, por encima del 19.3 de Llama 4 Maverick.
- Soporte de tool calling y function calling, con integración en vLLM mediante `--enable-auto-tool-choice` y parser hermes.
- Contexto largo de hasta 512.000 tokens, útil para procesar documentos extensos sin fragmentación.
- Multilingüe: 11 idiomas, entre ellos español, inglés, francés, alemán, chino, coreano, árabe, hindi y ruso.
- Despliegue flexible: compatible con Transformers, vLLM 0.11.1+, llama.cpp b7061+ y LM Studio.
- Disponible vía API en OpenRouter con compatibilidad con el protocolo de chat completions de OpenAI.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en 11 idiomas y conservar el contexto de una sesión prolongada gracias a su ventana de 512.000 tokens, lo que evita perder información importante en chats extensos.

- Análisis de contratos y documentos legales: su amplio contexto permite leer documentos completos sin dividirlos en fragmentos; se puede integrar en pipelines de extracción de información para localizar cláusulas, fechas o condiciones relevantes en documentos de gran longitud.

- Generación de código asistida y automatización de revisiones: el soporte de tool calling habilita la integración en flujos de trabajo de CI/CD, por ejemplo para generar parches, ejecutar pruebas o llamar a APIs internas mediante herramientas definidas por el usuario.

- Tutoría matemática personalizada: dado su rendimiento en AIME 2025, el modelo puede resolver problemas de competición y explicar la resolución paso a paso, sirviendo como tutor en plataformas educativas.

- Investigación académica en NLP: es un modelo abierto con pesos en safetensors, paper técnico y variantes de la familia Trinity; resulta útil para estudiar arquitecturas MoE sparse, eficiencia computacional y el impacto del escalado en distintos idiomas.

- Bots de conversación empresarial para entornos multicliente: al estar disponible en OpenRouter, se puede crear una API interna de consulta, traducción y respuesta para equipos distribuidos sin necesidad de desplegar infraestructura propia.

- Traducción y localización de contenido: los 11 idiomas cubren mercados importantes; el modelo puede generar versiones localizadas de productos, manuales o campañas manteniendo una única conversación con contexto compartido.

## Benchmarks y rendimiento

Los únicos benchmarks disponibles en la información proporcionada son los publicados por Arcee AI en la model card, comparando con Llama 4 Maverick. No se han publicado resultados de otras pruebas en la información disponible.

| Benchmark | Llama 4 Maverick | Trinity-Large Preview |
|---|---|---|
| MMLU | 85.5 | 87.2 |
| MMLU-Pro | 80.5 | 75.2 |
| GPQA-Diamond | 69.8 | 63.3 |
| AIME 2025 | 19.3 | 24.0 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 797 GB, por lo que la inferencia completa requiere cerca de 800 GB de VRAM. Con cuantización GGUF en Q4 (estimación no oficial), el modelo podría reducirse a una horquilla de 200 a 250 GB.
- GPU recomendadas: para bfloat16, un clúster de 8× NVIDIA B200 o H100; para cuantización Q4, un sistema con 4× H100 o A100.
- No cabe en GPUs de consumo: una RTX 4090 de 24 GB es claramente insuficiente, incluso con cuantizaciones extremas.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, vLLM desde la versión 0.11.1+, llama.cpp desde la versión b7061+, LM Studio y la API de OpenRouter.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La única comparativa disponible en la información de la model card es con Llama 4 Maverick, limitada a los benchmarks incluidos. No se disponen de datos completos sobre parámetros, contexto o licencia de Llama 4 Maverick.

| Modelo | Parámetros totales | Contexto | MMLU | AIME 2025 | Licencia |
|---|---|---|---|---|---|
| Trinity-Large-Preview | 398.635.286.016 | 512.000 tokens | 87.2 | 24.0 | OpenMDW-1.1 |
| Llama 4 Maverick | No disponible | No disponible | 85.5 | 19.3 | No disponible |

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se han publicado estudios específicos sobre sesgos en la información consultada; al tratarse de un modelo de gran tamaño preentrenado con datos web, es esperable que herede sesgos presentes en el corpus y sea susceptible de generar contenido plausible pero incorrecto.
- Licencia: OpenMDW-1.1 es una licencia poco habitual y debe revisarse con detalle antes de cualquier uso comercial, redistribución o deployment en producción.
- Estado provisional: el sufijo "Preview" indica que el modelo se encuentra en proceso de RL activo; su comportamiento puede variar entre versiones y no se garantiza estabilidad a largo plazo.
- Contexto largo: la extensión de 512.000 tokens puede implicar una degradación en la recuperación de información en las partes más distantes del contexto; es recomendable validar su capacidad de atención a posiciones extremas en casos de uso reales.
- Idiomas limitados: solo cubre 11 idiomas; no ofrece soporte para lenguas no listadas, lo que condiciona su uso en mercados con idiomas minoritarios o dialectos.
- Hardware: la inferencia requiere un clúster de GPUs de datos, lo que excluye su uso en entornos de consumo o pequeños laboratorios sin infraestructura.

## Enlaces

- Repositorio principal: https://huggingface.co/CollectionStudio/Trinity-Large-Preview
- Variante cuantizada: https://huggingface.co/CollectionStudio/Trinity-Large-Preview-NVFP4
- Modelo base: https://huggingface.co/arcee-ai/Trinity-Large-Base
- Variante Thinking: https://huggingface.co/arcee-ai/Trinity-Large-Thinking
- Variante TrueBase: https://huggingface.co/arcee-ai/Trinity-Large-TrueBase
- Technical report: https://github.com/arcee-ai/trinity-large-tech-report/
- Chat demo: http://chat.arcee.ai/
- API OpenRouter: https://openrouter.ai

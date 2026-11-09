# iPwnds/lexeuropa-qwen3b-merged-v4

## Resumen

LexEuropa Qwen3B Merged v4 es un ajuste fino por LoRA fusionado sobre Qwen2.5-3B-Instruct, desarrollado por el usuario iPwnds en el contexto del proyecto LexEuropa (lumenworksco). El modelo está especializado en responder preguntas sobre legislación de la Unión Europea, en particular el RGPD y otra normativa comunitaria, dentro de una arquitectura de generación aumentada por recuperación (RAG). Se trata de un prototipo de investigación orientado a demostrar que un modelo pequeño de 3.085 millones de parámetros, entrenado con un conjunto reducido de 1.402 ejemplos, puede alcanzar una disciplina de citación y una completitud de respuesta competitivas con modelos mucho mayores cuando se combina con una estrategia de recuperación adecuada.

La relevancia del modelo reside en su enfoque: no se busca un modelo jurídico generalista, sino un generador que copie y cite fielmente los pasajes recuperados de un corpus normativo concreto, rechazando preguntas fuera de corpus. El entrenamiento se realizó mediante SFT con TRL sobre preguntas en lenguaje natural con objetivos de artículo completo, preguntas de referencia y ejemplos de rechazo. La ventana de contexto, los idiomas soportados más allá del inglés y los datos de cuantización no están documentados en la información disponible.

El modelo se distribuye con licencia Apache 2.0 y pesos en formato safetensors, con un tamaño de repositorio de 6,2 GB. Su uso previsto es como generador por defecto del pipeline LexEuropa, no como asesor jurídico autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste LoRA fusionado |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only denso de 3.085 millones de parámetros. Sobre él se aplicó un ajuste fino supervisado (SFT) mediante LoRA con rango r=16 y alpha=32, durante 2 épocas y 176 pasos, con una pérdida final de 0,0055. El adaptador resultante se fusionó con los pesos base, dando lugar a este checkpoint "merged". El entrenamiento utilizó el dataset iPwnds/lexeuropa-sft (rama main), compuesto por 1.402 ejemplos que incluyen preguntas de tema en lenguaje natural con objetivos de artículo completo (cada párrafo citado desde su propio identificador de fuente), preguntas de estilo referencia y ejemplos de rechazo.

El corpus de entrenamiento se limita al RGPD, otra legislación de la UE y tres sentencias. No se documentan en la información disponible detalles sobre el volumen total de tokens, la composición exacta del dataset ni el uso de RLHF o DPO. La innovación principal no está en la arquitectura, sino en el protocolo de evaluación y en la estrategia de recuperación asociada: el sistema amplía la recuperación con los párrafos restantes de los artículos principales del mismo instrumento, y el modelo aprende a aprovechar esas fuentes adicionales que la versión anterior ignoraba.

## Capacidades

- Generación de texto conversacional en inglés sobre temática jurídica de la UE.
- Respuesta a preguntas de tema en lenguaje natural con citación de párrafos completos desde identificadores de fuente.
- Respuesta a preguntas de estilo referencia (remisión a artículos o disposiciones concretas).
- Rechazo explícito de preguntas fuera del corpus (4 de 4 preguntas trampa declinadas en la evaluación).
- Disciplina de citación: precisión 0,81 y recall 0,88 en 25 preguntas en lenguaje natural.
- Integración en pipelines RAG con expansión de contexto a nivel de instrumento.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Asistente de consulta normativa interna: el modelo responde preguntas sobre el RGPD y legislación comunitaria citando párrafos concretos, lo que permite a equipos de cumplimiento verificar la fuente de cada afirmación en lugar de confiar en una respuesta sin trazabilidad.
- Generador por defecto en el pipeline LexEuropa: se integra como etapa de generación tras la recuperación documental, con la expansión de párrafos del mismo instrumento que el proyecto aplica para mejorar la completitud (0,70 de media frente a 0,53-0,56 de la versión v1).
- Prototipado de sistemas RAG jurídicos de bajo coste: con 3.085 millones de parámetros, sirve como banco de pruebas para diseñar estrategias de recuperación y evaluación antes de escalar a modelos mayores.
- Filtrado y rechazo de consultas fuera de alcance: los ejemplos de rechazo del entrenamiento permiten usar el modelo como primera barrera que declina preguntas no cubiertas por el corpus normativo.
- Evaluación comparativa de pipelines de recuperación: el protocolo de evaluación del proyecto (25 preguntas con listas de verificación anotadas a mano, más 4 trampas) puede replicarse con este modelo como referencia de disciplina de citación.
- Docencia y divulgación sobre RGPD: respuestas con citas literales de artículos que facilitan la explicación de obligaciones concretas, siempre con revisión humana posterior.

## Benchmarks y rendimiento

Resultados publicados en la model card (conjunto de calidad de respuesta: 25 preguntas con listas de verificación anotadas a mano, calificadas por Qwen2.5-72B, más 4 preguntas trampa fuera de corpus; una ejecución por modelo):

| Modelo | Completitud media | Respuestas 100% completas | Precisión de citación | Recall de citación | Trampas declinadas |
|---|---|---|---|---|---|
| LexEuropa v4 (con expansión) | 0,70 | 52% | 0,81 | 0,88 | 4/4 |
| LexEuropa v4 (sin expansión) | 0,56 | No disponible | No disponible | No disponible | No disponible |
| LexEuropa v1 (con expansión) | 0,53-0,56 | 16% | No disponible | No disponible | No disponible |
| Qwen2.5-72B stock | 0,62 | 16% | No disponible | No disponible | No disponible |

El autor advierte que una cláusula de la regla de promoción (precisión de citación) quedó en el límite, que los resultados deben leerse como mejor completitud y disciplina de citación y no como razonamiento jurídico, y que sin la expansión de recuperación v4 no supera a v1 (0,56). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 8 y 10 GB según longitud de contexto.
- Cuantización a 8 bits: alrededor de 3,5-4 GB de pesos; a 4 bits: alrededor de 2-2,5 GB, aunque el autor no publica variantes GGUF ni cuantizadas.
- GPU recomendadas: A100 o H100 para despliegue en producción con concurrencia; RTX 4090, RTX 3090 o RTX A6000 para desarrollo y evaluación.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en fp16 (RTX 3060 Ti, RTX 3070, RTX 4060 Ti 16 GB, RTX 4070 y superiores); en 4 bits cabría en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp/Ollama solo si se generan conversiones propias, ya que no se publican pesos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LexEuropa Qwen3B Merged v4 | 3.085 M | No disponible | RAG jurídico UE (RGPD), inglés | Apache 2.0 | Hugging Face (2 descargas) |
| Qwen2.5-3B-Instruct | 3.085 M | No disponible en esta ficha | Instrucción generalista multilingüe | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Qwen2.5-72B (stock) | 72.000 M (aprox.) | No disponible en esta ficha | Instrucción generalista | No disponible en esta ficha | Hugging Face |
| LexEuropa v1 | No disponible | No disponible | RAG jurídico UE, versión anterior | No disponible | Uso interno del proyecto |

La comparación relevante es con el modelo base sin ajustar: v4 supera al Qwen2.5-72B stock en completitud (0,70 frente a 0,62) y en porcentaje de respuestas totalmente completas (52% frente a 16%) dentro del pipeline del proyecto, con un modelo 23 veces menor. Frente a v1, la mejora depende de la expansión de recuperación. No se dispone de comparaciones con otros modelos jurídicos especializados.

## Limitaciones y advertencias

- Solo inglés: no hay soporte documentado de castellano ni de otras lenguas de la UE, lo que limita su uso directo en entornos multilingües.
- Corpus restringido: entrenado únicamente con el RGPD, otra legislación de la UE y tres sentencias; no cubre jurisprudencia amplia ni derecho nacional de los Estados miembros.
- Comportamiento de copia: el modelo reproduce los pasajes que recibe, por lo que fuentes irrelevantes pueden filtrarse en las respuestas; el proyecto restringe la expansión a un solo instrumento para mitigarlo.
- Rechazos indebidos: puede declinar preguntas que las fuentes sí responden; el proyecto reintenta esas consultas con un modelo más potente.
- Sin expansión de recuperación, el rendimiento cae a 0,56 de completitud, sin mejora sobre v1: el valor del modelo depende del pipeline completo.
- Riesgo de alucinación no cuantificado fuera del protocolo de evaluación; n=25 y una sola ejecución por modelo, sin intervalos de confianza.
- Prototipo de investigación: no es asesoramiento jurídico y requiere revisión humana en cualquier uso real.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni auditorías de sesgo; el modelo hereda los sesgos de Qwen2.5-3B-Instruct y del corpus de entrenamiento.
- Advertencia de la ficha: una cláusula de la regla de promoción (precisión de citación) quedó en el límite, por lo que la calidad de citación no está plenamente validada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iPwnds/lexeuropa-qwen3b-merged-v4
- Proyecto LexEuropa: https://github.com/lumenworksco/-LexEuropa
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/iPwnds/lexeuropa-sft
- No se han encontrado en la información disponible papers, blogs ni demos adicionales.

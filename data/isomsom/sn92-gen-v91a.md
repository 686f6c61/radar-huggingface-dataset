# isomsom/sn92-gen-v91a

## Resumen

REAX SN92 generalist entry es un modelo de decisión afinado por el usuario isomsom para la pista generalista de REAX (SN92). No es un modelo generativo de propósito general, sino un clasificador de opciones: recibe un elemento en formato de decisión (una pregunta con un conjunto de opciones etiquetadas) y emite una lectura sobre todas las opciones mediante una cabeza de letras y un softmax a temperatura fija 2. Su linaje arranca en Qwen/Qwen3.5-27B (Apache-2.0), pasa por el fine-tune completo de Base Labs (Baseten) baselabs/mammoth-1 (MIT) y por varios merges y LoRAs de la comunidad SN92.

El modelo tiene 26.085.330.160 parámetros en pesos safetensors y un repositorio de 52,2 GB, lo que es coherente con un transformer denso de aproximadamente 27B en precisión de 16 bits. La modificación principal respecto a sus padres es una nueva LoRA de rango 32 (alpha 64) aplicada a todas las capas lineales del modelo de lenguaje, dejando intacta la torre de visión, entrenada en modo conjunto (atención bidireccional completa sobre el prompt, tal como sirve el validador de REAX) durante 300 pasos de una planificación coseno de 600 pasos.

Es relevante ahora porque documenta con detalle un caso de ingeniería de modelos de decisión para competiciones y evaluaciones tipo SN92: re-derivación de filas de lectura más allá de la Z, anclaje por divergencia KL a las respuestas del modelo de partida y un protocolo de lectura fijo. La licencia MIT y el formato safetensors facilitan su reutilización, aunque su naturaleza de clasificador restringe mucho los casos de uso frente a un modelo de chat convencional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3.5-27B) con cabeza de letras sobre 255 códigos de respuesta; LoRA r32 sobre capas lineales del modelo de lenguaje |
| Parámetros totales | 26.085.330.160 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso heredado de Qwen/Qwen3.5-27B, transformado primero en un fine-tune completo para decisiones por Base Labs (baselabs/mammoth-1) y después en una cadena de merges de la comunidad SN92 (danyloooah/sn92-generalist-m1-core2, isomsom/sn92-gen-m87b, xflud/sn92-decider-1 y danyloooah/sn92-generalist-m1-v3a). Sobre esa base se aplica una LoRA nueva de rango 32 y alpha 64 en todas las capas lineales del modelo de lenguaje, sin tocar la torre de visión. El entrenamiento se hace en modo conjunto, con atención bidireccional completa sobre el prompt, replicando cómo sirve el validador de REAX, durante 300 pasos de una planificación coseno de 600, con 32 filas por paso, tasa de aprendizaje 2,5e-5 y semilla 91.

El entrenamiento usa elementos de decisión con opciones: una muestra de los datos de m87b, el replay público de especialistas SN92 (decisionmodels/sn92-specialists, CC-BY-4.0), tasksource/procedural-typed-decisions (Apache-2.0), ítems de selección de herramientas sobre catálogos ficticios, ítems de conocimiento de opción múltiple de los splits TRAIN de CommonsenseQA, OpenBookQA, MathQA y AQuA-RAT, clasificación de intenciones sobre BANKING77, MASSIVE en-US y CLINC150, e ítems multietiqueta sí/no sobre resúmenes de PLOS, arXiv y bancos de etiquetas ficticios. Los ítems generados y parte del resto se anclan por divergencia KL a las respuestas del modelo de partida, sin etiqueta dorada. La innovación técnica destacable es la re-derivación de las filas de lectura más allá de la Z (códigos AA y posteriores) mediante un ajuste por mínimos cuadrados de las filas A..Z sobre las de mammoth-1, y el reescalado y desplazamiento de todas las filas de lectura para la lectura fija a T=2.

## Capacidades

- Clasificación de decisiones: dada una pregunta con opciones etiquetadas, produce una distribución softmax sobre todas las opciones mediante una cabeza de letras.
- Soporte de hasta 255 códigos de respuesta (A..Z y AA, AB, ... para preguntas con más de 26 opciones).
- Clasificación de intenciones sobre conjuntos de etiquetas completos (entrenado con BANKING77, MASSIVE en-US y CLINC150).
- Selección de herramientas sobre catálogos de funciones ficticios.
- Clasificación multietiqueta sí/no sobre textos científicos y metadatos (PLOS, arXiv).
- Clasificación de registros y resultados (discusiones de Wikipedia, avisos de GitHub, registros de EUR-Lex, TED, legislación británica y canadiense).
- Razonamiento de opción múltiple sobre conocimiento general, matemáticas y comprensión lectora (CommonsenseQA, OpenBookQA, MathQA, AQuA-RAT).
- No se documentan capacidades de generación libre de texto, tool calling en sentido agéntico ni modo thinking; el uso previsto es la lectura de decisiones con el prompt fijo del validador.

## Casos de uso

- Evaluación en la pista generalista de REAX (SN92): el modelo se sirve con el prompt fijo del validador y la lectura conjunta a T=2, por lo que es adecuado para reproducir exactamente el protocolo de evaluación de la competición.
- Clasificación de intenciones en asistentes conversacionales: al haberse entrenado sobre los conjuntos completos de etiquetas de BANKING77, MASSIVE en-US y CLINC150, puede mapear una utterance a una intención de un catálogo cerrado en sistemas de enrutamiento.
- Selección de herramientas en pipelines de agentes: los ítems de selección de herramientas sobre catálogos ficticios permiten usar el modelo como clasificador que elige qué función invocar entre un conjunto finito de opciones.
- Triaje de literatura científica: los ítems multietiqueta sobre resúmenes de PLOS y arXiv permiten asignar términos de materia o categorías a un abstract como decisión sí/no por etiqueta.
- Moderación y clasificación de contenido comunitario: los ítems de discusiones de Wikipedia (articles for discussion, requests for adminship) permiten predecir el resultado de una discusión a partir de su texto.
- Clasificación de avisos de seguridad y registros regulatorios: los datos de GitHub Advisory Database, EUR-Lex, TED y legislación británica y canadiense permiten etiquetar registros administrativos o de vulnerabilidades en un catálogo cerrado.
- Investigación sobre modelos de decisión: la model card documenta con precisión el linaje, las LoRAs y el protocolo de lectura, lo que lo convierte en un caso de estudio reproducible para experimentos de merges y anclaje por KL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (26,1B parámetros) se puede estimar en torno a 52 GB en FP16/BF16 y en torno a 14-16 GB en cuantización de 4 bits, aunque estas cifras son estimaciones y no datos publicados.
- GPU recomendadas: no disponible; por tamaño, GPUs de 80 GB (A100, H100) o configuraciones multi-GPU para precisión completa.
- ¿Cabe en GPU de consumo? No hay datos oficiales; en cuantización agresiva podría caber en GPUs de 24 GB, pero no está verificado ni documentado.
- Opciones de despliegue: no disponible; el modelo se sirve con el prompt fijo del validador de REAX y lectura softmax a T=2, sin que se documenten vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| isomsom/sn92-gen-v91a | 26,1B | No disponible | Modelo de decisión (clasificador de opciones) | MIT | Hugging Face |
| baselabs/mammoth-1 | No disponible | No disponible | Fine-tune para decisiones de Qwen3.5-27B | MIT | Hugging Face |
| Qwen/Qwen3.5-27B | ~27B | No disponible | LLM generativo | Apache-2.0 | Hugging Face |
| danyloooah/sn92-generalist-m1-core2 | No disponible | No disponible | Merge de la familia SN92 | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de decisión, no un modelo generativo: no está pensado para chat libre, generación de código ni respuestas abiertas.
- El uso previsto depende del prompt fijo del validador y de la lectura softmax a T=2; fuera de ese protocolo el comportamiento puede degradarse.
- No se documentan idiomas soportados; el entrenamiento cita mayoritariamente datos en inglés (MASSIVE en-US, CLINC150, BANKING77, Wikipedia en inglés), por lo que el rendimiento en castellano es incierto.
- Riesgo de alucinación y de calibración deficiente en opciones fuera de la distribución de entrenamiento, especialmente en los códigos más allá de la Z re-derivados por mínimos cuadrados.
- Los ítems anclados por divergencia KL no tienen etiqueta dorada, lo que puede introducir sesgos heredados del modelo de partida.
- La licencia MIT permite uso comercial, pero los datos de entrenamiento incluyen fuentes con licencias CC BY-SA 4.0, OGL y otras; conviene revisar el fichero NOTICE y las obligaciones de atribución antes de un despliegue comercial.
- No se documentan cuantizaciones oficiales ni recetas de despliegue, lo que complica la puesta en producción.
- El repositorio tiene pocas descargas (15) y ningún like, por lo que no hay validación comunitaria amplia.

## Enlaces

- [Hugging Face: isomsom/sn92-gen-v91a](https://huggingface.co/isomsom/sn92-gen-v91a)
- [Modelo base: baselabs/mammoth-1](https://huggingface.co/baselabs/mammoth-1)
- [Qwen/Qwen3.5-27B](https://huggingface.co/Qwen/Qwen3.5-27B)
- [danyloooah/sn92-generalist-m1-core2](https://huggingface.co/danyloooah/sn92-generalist-m1-core2)
- [isomsom/sn92-gen-m87b](https://huggingface.co/isomsom/sn92-gen-m87b)
- [xflud/sn92-decider-1](https://huggingface.co/xflud/sn92-decider-1)
- [danyloooah/sn92-generalist-m1-v3a](https://huggingface.co/danyloooah/sn92-generalist-m1-v3a)
- [decisionmodels/sn92-specialists](https://huggingface.co/datasets/decisionmodels/sn92-specialists)
- [tasksource/procedural-typed-decisions](https://huggingface.co/datasets/tasksource/procedural-typed-decisions)
- [PolyAI/banking77](https://huggingface.co/datasets/PolyAI/banking77)
- [AmazonScience/massive](https://huggingface.co/datasets/AmazonScience/massive)
- [clinc_oos](https://huggingface.co/datasets/clinc/clinc_oos)

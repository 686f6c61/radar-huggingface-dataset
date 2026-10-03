# cortex-agent-llc/kodiak-v0.2-1b-accuracy

## Resumen

Kodiak-v0.2-1B en modo accuracy es un modelo de decisión (decision model) desarrollado por Cortex Agent LLC. No es un modelo generativo al uso: recibe un estado (texto, una lista de textos o JSON) y una serie de preguntas tipadas, y devuelve respuestas calibradas de tipo elección (choice), puntuación (score) o "no lo sé" (can't tell). Está pensado para automatizar trabajo rutinario de "lee esto y decide": enrutado, triaje, guardarraíles y comprobaciones, derivando a una persona o a un LLM los casos en los que no está seguro.

El modo accuracy es un ensemble de tres modelos Kodiak-v0.2-1B entrenados de forma independiente. Cada uno responde a cada pregunta y sus respuestas calibradas se promedian; como cada miembro es sobreconfiado en sitios distintos, el promedio cancela buena parte de ese sesgo. El coste es aproximadamente 3 veces el de un único modelo.

Cada miembro se construye sobre Ettin-encoder-1B (Johns Hopkins, licencia MIT) y tiene 1.040 millones de parámetros. La relevancia del modelo está en su relación precisión/tamaño: con unos 1B de parámetros por miembro supera a Qwen3-8B en decisiones para las que no fue entrenado (0,706 frente a 0,688) y, cuando responde "no lo sé", acierta el 90,5% de las veces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder (etiquetado como modernbert); ensemble de tres miembros independientes |
| Parametros totales | 1,04B por miembro; 3 miembros en el conjunto (aproximadamente 3,12B en total) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | jhu-clsp/ettin-encoder-1b |
| Libreria | kodiak |
| Tamano del repositorio | 12,5 GB |
| Inferencia | el metadato de la model card marca `inference: false` |

## Arquitectura y entrenamiento

Kodiak-v0.2-1B es un modelo de decisión basado en encoder, construido sobre Ettin-encoder-1B de Johns Hopkins. La variante de modo accuracy agrupa tres ejecuciones de entrenamiento independientes cuyas respuestas calibradas se promedian. El umbral de abstención (0,6) se ajustó únicamente sobre datos de validación, eligiendo el umbral de mayor precisión cuya precisión de abstención en validación fuese al menos 0,90.

En cuanto a los datos, la model card indica que todo el material de entrenamiento es sintético o con licencia permisiva. Los datos sintéticos fueron escritos y revisados por modelos de pesos abiertos (gpt-oss-120b y DeepSeek-V3.2); no se emplearon salidas de modelos cerrados ni datos de evaluación en el entrenamiento. La innovación destacable de la versión 0.2 es que el entrenamiento muestra las opciones de respuesta con redacciones distintas (etiqueta corta, frase completa o paráfrasis), lo que elevó la precisión en tareas nunca vistas en 2,7 puntos y redujo el error de calibración alrededor de un 20%. El mayor incremento se dio en opciones con palabras ambiguas, como el sentimiento de un poema con la etiqueta "mixed" (de 0,54 a 0,70). No se menciona en la información disponible el uso de RLHF ni de DPO.

## Capacidades

- Decisión tipada: devuelve elección entre opciones, puntuación o abstención ("no lo sé") con confianza calibrada.
- Entrada flexible: acepta texto plano, listas de textos o JSON.
- Comprobación de anclaje (groundedness): verifica si una respuesta está respaldada por su fuente y señala qué frase no lo está.
- Selección del siguiente paso para un asistente a partir de especificaciones completas de API: llamar a una herramienta, pedir información que falta o responder directamente.
- Verificación de afirmaciones contra un texto.
- Juicio de relevancia de producto para búsqueda: coincidencia exacta, sustituto, complemento o irrelevante.
- Tool calling / function calling (evaluado en BFCL).
- Detección de alucinaciones y clasificación.
- Calibración y abstención: cuando dice "no lo sé", acierta el 90,5% de las veces.
- Multilingüe: únicamente inglés.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el texto del cliente y varias preguntas de elección (intención, transportista, producto) y devuelve la categoría con una confianza calibrada, permitiendo derivar automáticamente los casos de baja confianza a un agente humano.
- Triaje de bandeja de entrada: clasificación de mensajes entrantes en categorías operativas con abstención cuando el contenido es ambiguo, reduciendo falsos positivos en colas de trabajo.
- Guardarraíles en pipelines LLM: comprobación de anclaje para verificar que la respuesta de un modelo generativo está respaldada por la fuente y detectar la frase concreta que no lo está.
- Verificación de afirmaciones (fact-checking interno): contraste de claims contra documentos de referencia antes de publicarlos, apoyándose en HoVer (Decision Index 0,23).
- Selección de acciones en agentes: dado un catálogo de APIs, decidir si el asistente debe invocar una herramienta, pedir un dato que falta o contestar directamente (BFCL, 0,28).
- Relevancia en motores de búsqueda y catálogos: clasificación de resultados como coincidencia exacta, sustituto, complemento o irrelevante (Amazon ESCI, 0,23).
- Detección de intenciones en asistentes conversacionales: etiquetado de la intención del usuario (CLINC150, 0,86).

## Benchmarks y rendimiento

Conjunto de evaluación congelado v0.2, preguntas de elección:

| Metrica | Kodiak XL v2 preview (1B) | Kodiak-v0.2-1B | v0.2 accuracy mode | Qwen3-8B (LLM) |
|---|---|---|---|---|
| Tareas nunca vistas, precision forzada | 0,659 ± 0,013 | 0,689 ± 0,008 | 0,706 | 0,688 |
| Tareas familiares | 0,881 | 0,877 | 0,889 | 0,710 |
| Ordena sus propios errores al final (nunca vistas) | – | 55,6% | 56,6% | 14,7% |
| Error de calibracion (nunca vistas; menor es mejor) | 0,113 | 0,085 | 0,062 | 0,293 |
| Acierto cuando dice "no lo se" | 0,87 | 0,88 | 0,905 | – |
| Latencia (GPU, una peticion) | 38 ms | 38 ms | ~3x | ~1500 ms |

El ranking de Kodiak-v0.2-1B a lo largo de las tres ejecuciones es 54,8% / 56,1% / 55,9%. La comparación de calibración es en bruto; al aplicar una recalibración isotónica ajustada sobre las otras tareas nunca vistas, Qwen3-8B pasa de 0,293 a 0,178 y Kodiak-v0.2-1B de 0,044 a 0,058. Los números completos están en `reports/v02-release-vs-llm-8b.md` del repositorio.

Decision Index (puntuaciones corregidas por azar, donde 0 equivale a respuesta aleatoria; media de tres ejecuciones sobre una muestra fija de hasta 1.000 preguntas por benchmark):

| Benchmark | XL v2 preview | Kodiak-v0.2-1B |
|---|---|---|
| Amazon ESCI (relevancia de producto) | 0,04 | 0,23 |
| HoVer (verificacion de afirmaciones) | 0,12 | 0,23 |
| BFCL (function calling) | 0,20 | 0,28 |
| ANLI (inferencia adversarial) | 0,01 | 0,10 |
| CLINC150 (intencion) | 0,84 | 0,86 |

En la prueba interna de habilidades retenidas, la puntuación subió de 0,52 a 0,98.

## Requisitos de hardware

- La model card indica una latencia de 38 ms por petición en GPU para el modelo único y de aproximadamente 3 veces ese valor para el modo accuracy.
- No se publican requisitos explícitos de VRAM. A partir del número de parámetros (1,04B por miembro, 3 miembros), una estimación orientativa sería de aproximadamente 2 GB por miembro en fp16/bf16 (unos 6 GB para el ensemble) y de unos 4 GB por miembro en fp32 (unos 12 GB, coherente con el tamaño de repositorio de 12,5 GB).
- Al tratarse de tres encoders de 1B, el ensemble es candidato a ejecutarse en GPU de consumo (por ejemplo, RTX 4090 y similares), aunque no se dispone de confirmación oficial de compatibilidad ni de cifras medidas de VRAM.
- Opciones de despliegue: la vía documentada es la librería `kodiak` (`pip install "kodiak-s1[infer] @ git+https://github.com/grizzlypeaksoftware/kodiak"`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput estimado: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tareas nunca vistas (precision forzada) | Tareas familiares | Error de calibracion (nunca vistas) | Latencia (GPU, una peticion) | Licencia |
|---|---|---|---|---|---|---|
| Kodiak-v0.2-1B (accuracy mode) | 3 miembros de 1,04B | 0,706 | 0,889 | 0,062 | ~3x 38 ms | apache-2.0 |
| Kodiak-v0.2-1B (modelo unico) | 1,04B | 0,689 ± 0,008 | 0,877 | 0,085 | 38 ms | apache-2.0 |
| Kodiak XL v2 preview | 1B | 0,659 ± 0,013 | 0,881 | 0,113 | 38 ms | no disponible |
| Qwen3-8B (LLM) | 8B | 0,688 | 0,710 | 0,293 (0,178 recalibrado) | ~1500 ms | no disponible |

La comparativa directa que ofrece la model card es contra Qwen3-8B como LLM de referencia. Kodiak gana en precisión forzada sobre tareas nunca vistas y en error de calibración, con un coste de latencia muy inferior (decenas de milisegundos frente a ~1,5 s), a cambio de un alcance mucho más estrecho: solo resuelve preguntas de decisión tipadas, no genera texto libre.

## Limitaciones y advertencias

- La redacción de las opciones sigue importando: la misma pregunta con opciones reformuladas obtiene la misma respuesta aproximadamente el 68% de las veces en tareas nunca vistas (frente al 62% anterior).
- Las opciones largas y en forma de frase pueden sesgar la respuesta hacia una etiqueta. En un benchmark de phishing (PhishNChips), con dos descripciones largas etiqueta la mayoría de correos como "phishing" y su puntuación se acerca al azar. La recomendación del autor es mantener opciones cortas y distintas y probar varias redacciones sobre datos propios.
- Trampas de redacción: un mensaje que repita las palabras de una opción dentro de una condición puede arrastrar la respuesta (la model card se corta en este punto de la lista de limitaciones).
- Modelo especializado en decisiones: no es un generador de texto abierto ni un chatbot; solo responde preguntas de elección, puntuación o abstención.
- Idioma: únicamente inglés.
- Longitud de contexto y soporte de cuantización no documentados.
- El metadato de la model card marca `inference: false`, lo que conviene verificar antes de planificar un despliegue.
- Aunque la licencia declarada es apache-2.0, el autor recomienda derivar a una persona o a un LLM los casos de baja confianza para evitar errores en producción.
- Riesgo de alucinación: no disponible como caracterización explícita; el modelo mitiga la incertidumbre mediante abstención calibrada, no mediante generación.

## Enlaces

- HuggingFace (modo accuracy): https://huggingface.co/cortex-agent-llc/kodiak-v0.2-1b-accuracy
- HuggingFace (modelo único, mas rapido): https://huggingface.co/cortex-agent-llc/kodiak-v0.2-1b
- Modelo base Ettin-encoder-1B (Johns Hopkins, MIT): https://huggingface.co/jhu-clsp/ettin-encoder-1b
- Repositorio con codigo, documentacion y build log: https://github.com/grizzlypeaksoftware/kodiak
- Informe de comparacion v0.2 frente al LLM de 8B: `reports/v02-release-vs-llm-8b.md` en el repositorio

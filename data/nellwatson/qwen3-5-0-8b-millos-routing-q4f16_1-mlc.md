# NellWatson/Qwen3.5-0.8B-millos-routing-q4f16_1-MLC

## Resumen

El modelo NellWatson/Qwen3.5-0.8B-millos-routing-q4f16_1-MLC es un ajuste fino mediante LoRA de Qwen/Qwen3.5-0.8B (revision 2fc06364), fusionado y convertido al formato q4f16_1 de web-llm. Lo desarrolla NellWatson como componente del enrutador de incidencias en dispositivo de MillOS, un gemelo digital de molino harinero que se ejecuta en el navegador. Se trata del hermano pequeno de 0,8B del modelo NellWatson/Qwen3.5-4B-millos-routing-q4f16_1-MLC, entrenado con los mismos ajustes.

El modelo no es un asistente conversacional general, sino un clasificador estrecho para un prompt fijo. Lee una nota breve de molino y selecciona una de cinco colas de asesoramiento: mantenimiento de equipos, calidad del producto, coordinacion logistica, sin incidencia actual o evidencia insuficiente. MillOS interpreta la respuesta leyendo la distribucion del siguiente token sobre los primeros tokens de las cinco colas, despues de su prompt de sistema fijo y del bloque de pensamiento vacio. El modelo no genera texto visible para MillOS.

Su relevancia radica en que demuestra un caso de uso muy concreto de IA en el navegador: inferencia WebGPU con cuantizacion de 4 bits para una tarea de clasificacion en tiempo real dentro de un gemelo digital, con un modelo de menos de 1 GB que se ejecuta en el cliente sin backend dedicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura de Qwen3.5-0.8B, con atencion, atencion lineal y proyecciones MLP) |
| Parametros totales | 0,8B (modelo base Qwen3.5-0.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16_1 (grupo de 4 bits con activaciones float16) |
| Idiomas soportados | en, pt (incluye portugues de Brasil) |
| Licencia | apache-2.0 |
| Formato de pesos | MLC (web-llm / mlc-llm), shards de pesos cuantizados |
| Tamano del repositorio | 0,7 GB |
| Modelo base | Qwen/Qwen3.5-0.8B (revision 2fc06364) |
| Libreria | mlc-llm |
| Revision fijada por MillOS | 914fde01 |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen3.5-0.8B, un transformer con atencion estandar, atencion lineal y proyecciones MLP. La arquitectura, la cuantizacion, el mlc-chat-config.json y los ficheros del tokenizer son los de mlc-ai/Qwen3.5-0.8B-q4f16_1-MLC en la revision 0ec13897, copiados sin cambios, de modo que esta build funciona sobre la libreria de modelo WebGPU precompilada de esa build (web-llm 0.2.86, v0_2_86/base). Solo difieren los shards de pesos.

El entrenamiento consistio en un LoRA de rango 16, alpha 32, dropout 0,05, aplicado sobre las proyecciones de atencion, atencion lineal y MLP del modelo de lenguaje; 2 epocas, AdamW a 0,0001 con decaimiento coseno, batch 16, semilla 20261102. Los ajustes son los de la build de 4B, fijados antes de su ejecucion y no reajustados para este tamano. El objetivo fue la entropia cruzada entre el softmax de cinco vias en la posicion de respuesta y la distribucion del profesor, suavizada por 0,02, sin termino de retencion.

Los datos de entrenamiento son 5.629 notas sinteticas de molino (868 en portugues de Brasil, 958 con una respuesta erronea plantada) escritas por Claude Sonnet 5.5 y Claude Haiku 5.5, conservadas solo donde la etiqueta autoria, TypeSafe's Jev 1.14 y Claude Haiku 5.5 coincidian. La expansion en portugues (revision 914fde01) anadio 1.848 notas mas en portugues de Brasil (320 con respuesta erronea plantada), escritas por los mismos dos modelos tras congelar el conjunto de prueba en portugues, con el mismo criterio de triple acuerdo: 7.475 notas en total, 2.714 en portugues. La fusion se realizo sumando los deltas LoRA a los shards bf16 originales bajo sus nombres de clave originales, y despues se convirtio con mlc_llm convert_weight --quantization q4f16_1. Antes de la cuantizacion, el modelo base enrutaba 103/257 de los casos congelados y este ajuste 252/257.

## Capacidades

- Clasificacion de notas breves de molino en cinco categorias fijas: mantenimiento de equipos, calidad del producto, coordinacion logistica, sin incidencia actual y evidencia insuficiente.
- Lectura de la distribucion del siguiente token sobre los primeros tokens de las cinco colas, en lugar de generacion de texto libre.
- Manejo de notas con respuestas erroneas plantadas (inyeccion de instrucciones o respuestas sugeridas que nombran una cola incorrecta), con resistencia medida en los conjuntos de evaluacion.
- Soporte bilingue limitado a ingles y portugues de Brasil.
- Capacidad de rechazo: MillOS rechaza una respuesta cuya suma de las cinco probabilidades de cola sea inferior a 0,99 dos veces, y el rechazo cuenta como error.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso, ya que no es un objetivo de entrenamiento.
- No soporta vision, audio ni modo de pensamiento utilizable; el bloque de pensamiento va vacio en el prompt.

## Casos de uso

- Enrutamiento de incidencias en un gemelo digital de molino harinero: el modelo lee una nota corta de operador y asigna una de las cinco colas de asesoramiento, integrandose en el bucle de MillOS que interpreta la distribucion de probabilidad del siguiente token.
- Clasificacion de texto en el navegador sin backend: al ejecutarse con web-llm y WebGPU sobre una build q4f16_1 de 0,7 GB, permite inferencia en el cliente con latencia baja y sin enviar datos de la planta a un servidor.
- Filtrado de notas con intentos de manipulacion: el modelo mantiene un rendimiento alto en conjuntos con respuestas erroneas plantadas (20/20 en notas retenidas con respuesta plantada y 29/30 en formas nunca entrenadas), lo que lo hace util para triaje resistente a inyeccion de instrucciones.
- Deteccion de notas ambiguas o incompletas: la categoria de evidencia insuficiente permite derivar a revision humana las notas que no encajan en las otras cuatro colas, reduciendo falsos positivos en el triaje automatico.
- Soporte bilingue en plantas de habla portuguesa: con 2.714 notas de entrenamiento en portugues de Brasil y 29/30 en el conjunto de prueba fresco en portugues, es adecuado para entornos lusofonos.
- Prototipado de clasificadores de texto ligeros en el navegador: sirve como referencia para construir pipelines de clasificacion con MLC y web-llm, reutilizando la libreria precompilada del modelo base sin recompilar pesos.
- Evaluacion de tecnicas de ajuste LoRA para tareas de enrutamiento: el modelo documenta un flujo completo de LoRA, fusion de deltas y conversion a q4f16_1, util como plantilla metodologica.

## Benchmarks y rendimiento

Los resultados se midieron en Chrome (web-llm 0.2.86, Apple Metal) a traves del propio codigo de enrutamiento de MillOS, con cada build q4f16_1 en la misma maquina. Los conjuntos de evaluacion se congelaron y hashearon antes de que existiera dato de entrenamiento alguno, y ninguna nota de entrenamiento comparte una secuencia de siete palabras con ellos. Una respuesta plantada es una nota que lleva una instruccion o respuesta sugerida nombrando una cola incorrecta. MillOS rechaza una respuesta cuya suma de las cinco probabilidades de cola sea inferior a 0,99 dos veces, y un rechazo cuenta como error.

| Conjunto | Qwen3.5-4B oficial | Ajuste de enrutamiento 4B (v2) | Primera revision ef377996 | Esta build 914fde01 |
|---|---|---|---|---|
| Casos originales (25 faciles, 40 dificiles) | 62/65 | 64/65 | 64/65 | 64/65 |
| Casos de inyeccion originales | 6/7 (tomo 0) | 7/7 (tomo 0) | 7/7 (tomo 0) | 7/7 (tomo 0) |
| Notas retenidas, ordinarias | 43/49 | 48/49 | 48/49 | 48/49 |
| Notas retenidas con respuesta plantada | 13/20 (tomo 6) | 20/20 (tomo 0) | 20/20 (tomo 0) | 20/20 (tomo 0) |
| 16 textos de incidencia propios de MillOS (en, pt-BR) | 16/16 | 16/16 | 16/16 | 15/16 |
| Conjunto de prueba fresco, ingles | 33/40 | 39/40 | 39/40 | 39/40 |
| Conjunto de prueba fresco, portugues de Brasil | 22/30 | 30/30 | 26/30 | 29/30 |
| Conjunto de prueba fresco, respuestas plantadas en formas nunca entrenadas | 20/30 (tomo 8) | 29/30 (tomo 1) | 28/30 (tomo 2) | 29/30 (tomo 0) |
| **Total de lo anterior** | **215/257** | **253/257** | **248/257** | **251/257** |
| Conjunto de prueba en portugues, ordinario | — | — | 46/50 | 48/50 |
| Conjunto de prueba en portugues, respuestas plantadas | — | — | 25/25 (tomo 0) | 25/25 (tomo 0) |

El conjunto de prueba en portugues (75 notas, escritas por Claude Opus 5.5 y confirmadas por ambos profesores) se congelo el 2026-11-04, antes de generar la expansion en portugues, y se reporta fuera de los 257. Las builds de 4B no se midieron en el. Los fallos de esta build en los textos propios de MillOS y en una respuesta plantada fueron ambos rechazos con la cola correcta en cabeza (sumas 0,971 y 0,989); la primera revision no tuvo ninguno.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,7 GB en formato q4f16_1; la huella en memoria del runtime de web-llm es del orden de esa cifra mas los buffers de activacion, por lo que cabe en GPUs integradas y dedicadas de gama baja.
- GPU recomendadas: cualquier GPU con soporte WebGPU; el modelo se evaluo en Apple Metal a traves de Chrome. En el ecosistema MLC tambien puede ejecutarse en GPUs de escritorio y moviles compatibles.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna y en muchas integradas, dado el tamano de 0,7 GB del repo y la cuantizacion de 4 bits.
- Opciones de despliegue: web-llm 0.2.86 (v0_2_86/base) en el navegador con WebGPU; mlc-llm para conversion y despliegue; requiere usar el registro del modelo base con este repositorio como model.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en enrutamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NellWatson/Qwen3.5-0.8B-millos-routing-q4f16_1-MLC (esta build) | 0,8B | no disponible | 251/257 en el total de conjuntos; 29/30 en portugues de Brasil; 29/30 en respuestas plantadas nuevas | apache-2.0 | Hugging Face, formato MLC |
| NellWatson/Qwen3.5-4B-millos-routing-q4f16_1-MLC | 4B | no disponible | 253/257 en el total de conjuntos; 30/30 en portugues de Brasil; 29/30 en respuestas plantadas nuevas | no disponible | Hugging Face, formato MLC |
| Qwen/Qwen3.5-0.8B (base sin ajuste) | 0,8B | no disponible | 103/257 antes de cuantizacion | no disponible | Hugging Face |
| Qwen3.5-4B oficial | 4B | no disponible | 215/257 en el total de conjuntos | no disponible | Hugging Face |

## Limitaciones y advertencias

- Es un clasificador estrecho para un prompt fijo. Su comportamiento general de chat y generacion no fue objetivo de entrenamiento ni se midio, y MillOS nunca muestra su texto a un jugador.
- Las etiquetas siguen los limites de una rubrica concreta. Una nota que nombra una maquina y un sintoma pero no un fallo ("el elevador de entrada hace ruido") queda en la frontera entre equipos y evidencia insuficiente; los profesores discreparon de la etiqueta autoria en esos casos y las notas se excluyeron del entrenamiento.
- Los datos son sinteticos. Las notas reales de operador pueden ser mas desordenadas de formas que los generadores no imaginaron.
- Riesgo de alucinacion: aunque la tarea es de clasificacion, el modelo puede producir distribuciones de probabilidad mal calibradas; MillOS mitiga esto con el umbral de rechazo de suma inferior a 0,99 dos veces.
- Limitacion de idioma: solo ingles y portugues de Brasil; no hay soporte documentado para otras lenguas.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-0.8B y de la libreria MLC subyacente.
- Caveat de produccion: la build depende de la revision 0ec13897 de mlc-ai/Qwen3.5-0.8B-q4f16_1-MLC y de web-llm 0.2.86 (v0_2_86/base); cambios en esas dependencias pueden romper la compatibilidad. MillOS fija la revision 914fde01.
- El rendimiento en el conjunto de prueba en portugues (48/50 ordinario, 25/25 plantadas) no fue medido para las builds de 4B, por lo que la comparacion entre tamanos en portugues no esta disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NellWatson/Qwen3.5-0.8B-millos-routing-q4f16_1-MLC
- Modelo hermano de 4B: https://huggingface.co/NellWatson/Qwen3.5-4B-millos-routing-q4f16_1-MLC
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Build MLC de referencia: https://huggingface.co/mlc-ai/Qwen3.5-0.8B-q4f16_1-MLC
- Arbol de ficheros de la build MLC: https://huggingface.co/mlc-ai/Qwen3.5-0.8B-q4f16_1-MLC/tree/main

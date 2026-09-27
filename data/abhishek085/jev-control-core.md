# abhishek085/jev-control-core

## Resumen

jev-control-core es un modelo de decisión de un solo paso hacia delante (*single-forward-pass*) desarrollado por el usuario abhishek085 dentro de la familia "open-spark-Jev" (clase System One, la misma a la que pertenece spark-s1). No es un modelo generativo al uso: se trata de una extracción del decodificador solo texto de Qwen/Qwen3.5-0.8B-Base, afinado a parámetro completo para resolver "sitios de decisión" concretos dentro de un *harness* de agentes: puertas antiinyección, enrutado de herramientas, ranking de contexto, suficiencia de respuesta, triaje, moderación, verificación de afirmaciones, selección de siguiente acción, emparejamiento de entidades y escalado a humano.

El modelo parte de un *checkpoint* de 24 capas con atención híbrida (gated-delta-net lineal + atención completa) y tamaño oculto de 1.024. Qwen distribuye ese tamaño únicamente como *checkpoint* visión-lenguaje (`Qwen3_5ForConditionalGeneration`); este repositorio contiene el decodificador solo texto extraído (`Qwen3_5ForCausalLM`, 0,75B) y afinado con todos sus parámetros. El resultado es un clasificador de decisión de 752 millones de parámetros que lee la probabilidad de las letras de opción en una única pasada y devuelve una decisión tipada, sin decodificación ni *parsing* posterior.

Su relevancia práctica radica en la latencia: 18,5 ms por decisión (mediana) en un NVIDIA GB10, muy por debajo de los 32-35 ms de decider-4b y de los 75 ms de spark-s1-4b-v6. El autor lo plantea como el hermano pequeño "drop-in" de spark-s1, servido a través del mismo *gateway* `/v1/systemone`, y lo complementa con jev-control-es (149M, encoder ModernBERT) para presupuestos de latencia aún más ajustados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador Qwen3.5 con atencion hibrida: gated-delta-net lineal + atencion completa (24 capas, hidden size 1.024) |
| Parametros totales | 752.393.024 (aproximadamente 0,75B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (el repo incluye artefactos GGUF; niveles concretos no disponibles); safetensors en precision completa |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |
| Pipeline declarado | text-classification |
| Tarea | Decision tipada de un solo paso (Choice/Score/Noul) sobre listas de opciones explicitas |
| Tamano del repositorio | 3,0 GB |
| Base model | Qwen/Qwen3.5-0.8B-Base |

## Arquitectura y entrenamiento

La arquitectura es un decodificador transformer de 24 capas con esquema de atención híbrido: capas de atención lineal basada en gated-delta-net combinadas con capas de atención completa, con un tamaño oculto de 1.024. El autor extrae la torre solo texto desde el *checkpoint* visión-lenguaje original de Qwen y publica el modelo como `Qwen3_5ForCausalLM`. El mecanismo de inferencia es singular: estado y pregunta tipada (Choice, Score o Noul, cada una con su lista explícita de opciones) se renderizan en un único *prompt*; los logits de las letras del hueco de respuesta se leen de una sola pasada, se restringen a las letras de opción válidas y se normalizan con softmax. No hay decodificación autoregresiva, ni *parsing* de salida, ni posibilidad de emitir algo fuera de las opciones definidas.

El ajuste es a parámetro completo (los 0,75B, sin LoRA) durante 3 épocas sobre 20.000 filas generadas por `os_datagen.control`, repartidas en diez familias de sitios de decisión (2.000 filas por familia). Los datos son generados y verificados por código (gold verificado), con cero solapamiento con cualquier benchmark según `scripts/tools/benchmark_overlap.py` (0 de 26.000 filas marcadas). Hiperparámetros: learning rate 3e-5, batch 16 con acumulación de gradiente 2, schedule coseno y `lambda_brier` 0.5, con la misma pérdida KL + regularización Brier de `sft.py` en spark-s1. Dos decisiones de diseño destacan: la lista de opciones de cada familia de tipo elección se renderiza en orden aleatorio por fila, y cada familia muestrea de pools de *prompts* y temas ampliados en lugar de plantillas fijas. Ambas medidas responden a fallos de transferencia documentados por el autor (véase la sección de limitaciones).

## Capacidades

- Toma de decisión tipada de un solo paso: elección entre 2-5 opciones (Choice), puntuación (Score) y lectura tipo Noul, siempre restringida a la lista de opciones definida por el llamante.
- Clasificación para puertas de guardarraíl y detección de inyección de *prompt* (sitio `injection`).
- Enrutado de herramientas y funciones (`route`): selección de la herramienta o ruta adecuada dado un estado corto.
- Ranking de relevancia de contexto (`relevance`) y evaluación de suficiencia de respuesta (`sufficiency`).
- Moderación de contenido (`moderation_class`), triaje y selección de siguiente acción (`next_action`).
- Verificación de afirmaciones, emparejamiento de entidades (*entity matching*) y decisión de escalado a humano (`escalate_human`).
- Salida estructurada garantizada: no puede generar texto libre fuera de las opciones proporcionadas.
- Calibración explícita: la model card reporta ECE 0.000 en los *splits* internos.
- Idiomas: únicamente inglés.
- Sin soporte declarado de *tool calling* generativo, agentes multi-paso autónomos, visión, audio ni modo "thinking": el modelo es un componente de decisión dentro de un bucle mayor, no un agente completo.

## Casos de uso

- Puertas antiinyección en asistentes: situado antes del *prompt* del LLM principal, el modelo clasifica en una sola pasada si el mensaje entrante intenta secuestrar instrucciones (sitio `injection`, 0,911 de precisión en el *harness* real), con 18,5 ms por decisión.
- Enrutado de herramientas en pipelines agénticos: dado el estado actual y la lista de herramientas disponibles, decide cuál invocar (sitio `route`, 0,988). Encaja en bucles donde la latencia de un LLM generativo como enrutador sería prohibitiva.
- Ranking de contexto en RAG: puntúa la relevancia de los fragmentos recuperados antes de inyectarlos en el contexto, reduciendo tokens y ruido; el sitio `relevance` es el más flojo del modelo (0,770), por lo que conviene combinarlo con umbrales conservadores.
- Comprobación de suficiencia antes de responder: determina si la información recuperada basta para contestar o si hay que recuperar más o escalar. Adecuado como guardarraíl barato en un bucle de recuperación iterativa.
- Moderación y triaje de soporte: clasificación de mensajes de cliente en categorías de moderación o de cola de soporte, con salida restringida al conjunto de etiquetas definido por la aplicación (sitio `moderation_class`).
- Escalado a humano: decisión binaria o de pocas opciones sobre si una conversación debe pasar a un operador, integrable como paso previo a un sistema de *ticketing*.
- Emparejamiento de entidades y verificación de afirmaciones: resolución de si dos menciones se refieren a la misma entidad o si una afirmación está respaldada por el material recuperado, en flujos de datos estructurados.
- Sustitución de un LLM generativo como clasificador en producción: el *harness* real mide 2.933 ms de mediana p50 para Gemma 4 prompteado frente a una alternativa de decisión dedicada, señalando el ahorro potencial en bucles con muchos puntos de decisión por tarea (cuatro sitios por tarea en el *demo* `support_desk`).

## Benchmarks y rendimiento

Evaluación en los *splits* retenidos propios del autor (`test_locked` y `challenge` de `os_datagen.control`, mismas familias que entrenamiento con instancias distintas), medida tanto en el orden de opciones original como promediada sobre 3 repermutaciones aleatorias de ese orden:

| Split | Precision | Precision (media sobre 3 permutaciones de orden) | ECE (calibrado) |
|---|---|---|---|
| test_locked | 1.000 | 1.000 | 0.000 |
| challenge | 1.000 | 1.000 | 0.000 |

Latencia aislada por decisión (backend HF en proceso, una NVIDIA GB10): **18,5 ms** de mediana. Referencia del autor: decider-4b, 32-35 ms; spark-s1-4b-v6, 75 ms.

Evaluación en *harness* real (demo `support_desk` de JevControl, 203 tareas, 4 sitios de decisión por tarea, frente a una línea base Gemma-4-E4B que decide por *prompting*):

| Brazo | Precision | Latencia p50 | Veredicto |
|---|---|---|---|
| Gemma 4 (prompteado) | 0.892 | 2.933 ms | linea base |
| jev-control-core | 0.837 | 4.563 ms (*) | cercano (delta -0.054) |

Desglose por sitio de decisión en el *harness* real: injection 0.911, route 0.988, sufficiency 0.915, relevance 0.770.

(*) El dato de 4.563 ms es el tiempo de pared p50 del *harness* completo, no la latencia del modelo aislado; esa ejecución compartía GPU con otros trabajos. La cifra honesta por llamada es la de 18,5 ms por decisión.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos a partir de los 752M de parámetros, no cifras publicadas por el autor): aproximadamente 1,5 GB en fp16, 0,8 GB en int8, 0,4 GB en int4/GGUF Q4. El repositorio ocupa 3,0 GB porque contiene artefactos safetensors y GGUF.
- GPU recomendadas: cualquier GPU con 2-4 GB de VRAM libre es suficiente; el autor publica medidas sobre una NVIDIA GB10. Cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100, H100 y similares; en la práctica el modelo es lo bastante pequeño como para compartir GPU con el LLM principal del *harness*.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna, incluidas las de gama de entrada con al menos 4 GB de VRAM.
- Opciones de despliegue: el autor sirve el modelo a través del *gateway* `/v1/systemone` de `open_spark_jev.serve.gateway` (mismo stack que spark-s1). El repositorio incluye pesos GGUF, por lo que llama.cpp y Ollama son viables; vLLM o TGI serían utilizables, aunque el *readout* de logits por letra requiere soporte de acceso directo a logits más que decodificación estándar.
- Latencia y *throughput*: 18,5 ms de mediana por decisión en NVIDIA GB10 (backend HF en proceso). El *throughput* explícito no está publicado; de esa mediana se deduce aproximadamente 54 decisiones por segundo en flujo único, aunque el dato no lo proporciona el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Rendimiento / notas |
|---|---|---|---|---|---|
| jev-control-core | 752M (0,75B) | Qwen3.5 hibrida (gated-delta-net + atencion completa) | No disponible | Apache 2.0 | 18,5 ms por decision; 0,837 en harness real (203 tareas) |
| jev-control-es | 149M | Encoder ModernBERT con readout estilo Laya | No disponible | No disponible | Mismo autor y familia; pensado para presupuestos de latencia mas ajustados |
| spark-s1-4b-v6 | 4B (aproximado) | Familia System One, mismo readout | No disponible | No disponible | 75 ms por decision; benchmark general JevBench en lugar de sitios de decision de harness |
| decider-4b | 4B (aproximado) | No disponible | No disponible | No disponible | 32-35 ms por decision |
| Gemma 4 (E4B, prompteado) | No disponible | No disponible | No disponible | No disponible | 0,892 de precision y 2.933 ms p50 como linea base generativa en el harness |

## Limitaciones y advertencias

- Dependencia crítica del orden de opciones si se reentrena: el autor documenta que fijar el orden de las opciones en entrenamiento llevó al modelo a aprender "la respuesta está en la posición N" sin leer el texto; en el *harness* real, el sitio `route` cayó a 0,152 y mostró un desplazamiento posicional limpio (`kb` hacia `orders`, 94/203; `orders` hacia `human`, 48/203). Se corrigió a 0,978 al aleatorizar el orden por fila.
- Brecha de transferencia entre distribución interna y *harness* real: la primera versión del modelo alcanzó 0,956 de precisión en distribución pero solo 0,438 en el *harness*. Las tres correcciones documentadas (estado sintético más realista, aleatorización del orden de opciones y ampliación de plantillas) elevaron la cifra a 0,837.
- Sesgo de dominio e idioma: el modelo está entrenado y evaluado únicamente en inglés y sobre datos generados por `os_datagen.control`; no hay evidencia publicada de comportamiento en otros idiomas ni en dominios fuera de las diez familias de sitios de decisión.
- Riesgo de alucinación: al restringir la salida a las letras de opción válidas, no puede generar texto libre, pero sí puede elegir una opción incorrecta con alta confianza; el autor reporta ECE 0.000 en sus propios *splits*, lo que no garantiza calibración fuera de distribución.
- El sitio `relevance` es el punto débil medido en el *harness* real (0,770), frente a `route` (0,988), `sufficiency` (0,915) e `injection` (0,911). Conviene tratarlo con cautela en producción.
- Licencia Apache 2.0: permite uso comercial, pero el modelo deriva de Qwen/Qwen3.5-0.8B-Base, cuyos términos de uso conviene verificar por separado.
- Datos incompletos en la model card: la sección "Why the real-harness number moved from 0.438 to 0.837" aparece truncada en la información disponible, por lo que el tercer punto (plantillas estrechas dentro de cada familia) no puede detallarse.
- Ausencia de validación externa: 0 descargas y 0 *likes* en el momento de la consulta, sin evaluaciones independientes publicadas; todas las métricas proceden del propio autor.
- La latencia de 4.563 ms p50 del *harness* no es comparable directamente con los 2.933 ms de Gemma 4, ya que la ejecución compartía GPU con otros trabajos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abhishek085/jev-control-core
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Variante pequena de la familia: https://huggingface.co/abhishek085/jev-control-es
- Modelo hermano spark-s1: https://huggingface.co/abhishek085/spark-s1-4b-v6
- Repositorio JevControl: https://github.com/abhishek085/JevControl

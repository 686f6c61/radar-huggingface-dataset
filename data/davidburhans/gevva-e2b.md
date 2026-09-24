# davidburhans/gevva-e2b

## Resumen

Gevva e2b es un cross-encoder de inferencia de lenguaje natural (NLI) y motor de decisión de "Sistema 1" desarrollado por davidburhans, construido mediante fine-tuning completo sobre el modelo multimodal instruction-tuned google/gemma-4-E2B-it. A diferencia de un modelo generativo autoregresivo, que produce texto token a token con latencias declaradas de 500-3.000 ms, Gevva e2b realiza una única pasada forward (~16,5 ms en P50 sobre una NVIDIA RTX 5090) para emitir probabilidades calibradas sobre tres estados semánticos: contradicción (0), implicación o entailment (1) y neutral (2).

El modelo tiene 5.104.303.683 parámetros totales (~5,1 B) y una ventana de contexto nativa de 131.072 tokens (128K), lo que permite ingerir documentos completos sin troceado. Incorpora la torre de visión SigLIP heredada de la base Gemma 4, de modo que puede evaluar relaciones de implicación entre una premisa y una hipótesis cuando una de las dos partes es una imagen (gráficos, capturas de interfaz, PDF diagramáticos).

Su relevancia actual radica en el nicho que ocupa: tareas de decisión binaria o categórica de baja latencia (reranking, enrutado de herramientas, detección de alucinaciones, evaluación con referencia) donde un modelo generativo resulta sobredimensionado y demasiado lento. El autor declara el puesto número 1 global en el benchmark JevBench v1.4.0 con una puntuación de 76,95 armónica (77,54 geométrica en v1.2/v1.3), por delante de APIs comerciales propietarias como Jev 1.13.0 (63,29). La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder multimodal basado en google/gemma-4-E2B-it (transformer con torre de visión SigLIP); cabecera de clasificación de secuencias para NLI de 3 clases |
| Parametros totales | 5.104.303.683 (~5,1 B) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | bfloat16 (pesos originales en safetensors); INT4 W4A16 mencionado por el autor para inferencia cuantizada. No se documentan GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | en, fr, es, de, zh, ar, hi, ru, sw, vi y multilingüe (los declarados por el autor; no se especifican niveles de calidad por idioma) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification (cross-encoder NLI) |
| Modelo base | google/gemma-4-E2B-it (fine-tuning completo, FFT) |
| Tamano del repositorio | 10,2 GB |
| Libreria | transformers |
| Fecha de publicacion | 2026-09-24 (creado y actualizado el mismo dia) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La ficha describe Gevva e2b como un cross-encoder derivado de `google/gemma-4-E2B-it`, un modelo fundacional multimodal instruction-tuned de Google. En lugar de una cabeza de generación de lenguaje, el modelo expone una clasificación sobre tres estados semánticos mutuamente excluyentes —contradicción (0), entailment (1) y neutral (2)— calculada en una sola pasada forward. La entrada se formatea como un par premisa-hipótesis, con la premisa y la hipótesis concatenadas en una plantilla textual (el README muestra el inicio de esa plantilla, `Premi...`, truncado en la información disponible). Al conservar la torre de visión SigLIP de la base, el modelo conserva la capacidad de tratar imágenes como premisa o como hipótesis.

El entrenamiento declarado es un fine-tuning completo (FFT) sobre el modelo base ya instruction-tuned, orientado a calibrar probabilidades y no a generar texto. El autor reporta explícitamente el uso de temperature scaling en inferencia con un valor óptimo T* = 1,60, que reduce el Expected Calibration Error de la capa difícil hasta 0,0655. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u otro alineamiento adicional más allá del propio ajuste supervisado de la cabeza de clasificación.

Como innovaciones destacables, la ficha cita: la evaluación en una única pasada forward frente a la generación autoregresiva (500-3.000 ms), el soporte nativo de 128K de contexto sin troceado, la paridad de API al 100 % con Jev y OpenJEV (sustitución directa de `AlexWortega/openjev` con compatibilidad de firma), y el uso de la ventana completa para ingerir documentos legales o clínicos multipágina.

## Capacidades

- NLI de 3 clases: clasifica pares premisa-hipótesis en contradicción, entailment o neutral, devolviendo un vector de probabilidades calibradas.
- Reranking zero-shot: ordena una lista de candidatos dada una consulta, sin necesidad de entrenamiento específico de la tarea.
- Evaluación con referencia (grading): compara una respuesta candidata contra una referencia y devuelve etiqueta y veredicto de corrección.
- Detección de alucinaciones: verifica si una afirmación se sigue lógicamente de un contexto dado, mediante la clase NLI correspondiente.
- Enrutado de herramientas (tool-routing): selección categórica de la herramienta o ruta adecuada en una sola pasada, en lugar de generación autoregresiva.
- Capacidades multimodales de visión: la torre SigLIP permite evaluar la relación semántica entre imágenes (gráficos, capturas de UI, diagramas) y afirmaciones textuales.
- Contexto largo nativo: 131.072 tokens para ingerir documentos completos sin chunking ni pérdida de fronteras.
- Multilingüe: declarado para en, fr, es, de, zh, ar, hi, ru, sw, vi y multilingüe.
- Latencia ultrabaja: 16,5 ms en P50 (bf16) y 14,3 ms en INT4 W4A16, con throughput declarado superior a 70 decisiones por segundo en modo batch.
- Compatibilidad de despliegue: etiqueta `endpoints_compatible` y paridad de firma con la API Jev/OpenJEV.
- No se declara capacidad de generación de texto libre, de código ni de matemáticas simbólicas; el pipeline es exclusivamente de clasificación.

## Casos de uso

- Verificación factual en pipelines RAG: situar el fragmento recuperado como premisa y la afirmación generada como hipótesis permite descartar respuestas no implicadas por el contexto antes de mostrarlas al usuario, con 16,5 ms por decisión y sin coste de generación.
- Reranking de candidatos en búsqueda semántica: dada una consulta y una lista de pasajes recuperados por un retriever vectorial, el modelo reordena por probabilidad de entailment. La función `rerank` del SDK devuelve el índice ganador y las puntuaciones normalizadas.
- Enrutado de herramientas en agentes: clasificar la intención del usuario en una de N herramientas registradas (búsqueda web, calculadora, base de datos) mediante la cabeza de clasificación, reduciendo la latencia del bucle del agente frente a un modelo generativo y aprovechando la paridad con el protocolo OpenJEV.
- Detección de alucinaciones en producción: comprobar automáticamente cada frase de un resumen contra el documento fuente; con 128K de contexto se puede pasar el documento entero como premisa, evitando los errores de frontera del chunking.
- Moderación y análisis de contradicciones contractuales: ingerir contratos, escritos judiciales o expedientes clínicos completos y detectar afirmaciones mutuamente contradictorias entre cláusulas o secciones, gracias a la ventana de 131.072 tokens.
- Evaluación automática de respuestas en plataformas educativas: usar `grade(question, reference, candidate)` para corregir respuestas abiertas contra una solución de referencia, devolviendo una etiqueta y un booleano de corrección con probabilidad calibrada.
- Clasificación de intenciones en atención al cliente: triaje de tickets en categorías predefinidas con un único forward, escalable a más de 70 decisiones por segundo por GPU para volúmenes altos.
- Verificación de capturas de interfaz contra documentación: comprobar si lo que muestra una captura de UI se corresponde con la afirmación de un manual o de un test de regresión visual, usando la torre de visión.
- Triaje de historiales clínicos: contrastar notas de paciente con afirmaciones derivadas de guías clínicas, marcando contradicciones para revisión humana (siempre como herramienta de apoyo, nunca como decisión clínica autónoma).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (métrica `verified: false` en todos los casos; no han sido verificados de forma independiente):

| Tarea | Metrica | Valor | Verificado |
|---|---|---|---|
| Natural language inference | JevBench Composite Score | 77,54 | No |
| Natural language inference | JevBench Intelligence Score (accuracy) | 73,91 | No |
| Natural language inference | JevBench Calibration Score (ECE) | 86,90 | No |
| Natural language inference | Forward Latency (P50), ms | 16,5 | No |

Datos adicionales declarados en el README:

| Metrica | Valor |
|---|---|
| JevBench v1.4.0 (armonica) | 76,95 |
| JevBench v1.2/v1.3 (geometrica) | 77,54 |
| Hard-tier ECE con temperature scaling (T* = 1,60) | 0,0655 |
| Latencia P50 en RTX 5090 (bf16) | 16,5 ms |
| Latencia en INT4 W4A16 | 14,3 ms |
| Throughput en batch | >70 decisiones/s |
| Coste declarado por 1.000 decisiones | 0,0149 USD |

Tabla comparativa de JevBench v1.4.0 incluida por el autor:

| Puesto | Modelo | Arquitectura | JevBench v1.4 | Intelligence | Calibration | Velocidad (p50) | Coste/1k | Codigo abierto |
|---|---|---|---|---|---|---|---|---|
| 1 | Gevva e2b | Gemma 4 E2B-it (FFT) | 76,95 | 73,91 | 86,90 | 16,5 ms | 0,0149 USD | Si (Apache 2.0) |
| 2 | Jev 1.13.0 | API comercial propietaria | 63,29 | 53,06 | 76,34 | 236,0 ms | 0,0399 USD | No |
| 3 | JevK5 v0.2.0 | Qwen 2.5 7B | 62,04 | 48,89 | 74,53 | 48,0 ms | 0,0210 USD | Si |
| 4 | Hopper | Transformer propio | 59,43 | 48,00 | 79,06 | 62,0 ms | 0,0180 USD | Si |
| 5 | Winnow-12B Q8 | Mistral NeMo 12B | 55,58 | 48,30 | 64,81 | 142,0 ms | 0,0310 USD | Si |
| 6 | reflex 4B | Qwen 2.5 4B | 53,99 | 45,20 | 68,10 | 58,0 ms | 0,0220 USD | Si |

No se han publicado en la informacion disponible resultados de benchmarks estandar de la industria (MMLU, HumanEval, GSM8K, MT-Bench u otros).

## Requisitos de hardware

- VRAM estimada para los pesos en bfloat16: en torno a 10,2 GB, coincidiendo con el tamano del repositorio. Con overhead de activaciones y cache KV para contexto largo, se recomienda un minimo practico de 16 GB.
- VRAM estimada en INT4 W4A16: aproximadamente 2,6-3 GB solo para pesos; con activaciones, cabria en GPUs de 8 GB, aunque el rendimiento con contexto de 128K depende de la gestion de la cache.
- GPU recomendadas: el autor reporta la cifra de 16,5 ms P50 sobre una NVIDIA RTX 5090. Para bf16 son adecuadas RTX 4090/5090 (24/32 GB), A100 40/80 GB, H100 y L40S. Para INT4, GPUs de 8-12 GB como RTX 4060 Ti 16 GB o RTX 3060 12 GB.
- Cabe en GPU de consumo: si. En bf16 en tarjetas de 16 GB o mas (RTX 4080/4090/5080/5090, RTX 4060 Ti 16 GB); en INT4 en tarjetas de 8 GB o mas.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` (soporte oficial declarado), SDK `gevva` (`pip install gevva`), y la etiqueta `endpoints_compatible`. No se documenta en la informacion disponible soporte para vLLM, llama.cpp, Ollama o TGI, ni la existencia de pesos GGUF.
- Latencia y throughput: 16,5 ms P50 en RTX 5090 con bfloat16, 14,3 ms en INT4 W4A16 y mas de 70 decisiones por segundo en modo batch. La latencia crece con la longitud del contexto de entrada, aunque no se proporciona una curva de latencia frente a tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench v1.4 | Latencia p50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Gevva e2b | ~5,1 B | 131.072 tokens | 76,95 | 16,5 ms | Apache 2.0 | HuggingFace + SDK gevva |
| Jev 1.13.0 | No disponible | No disponible | 63,29 | 236,0 ms | Propietaria | Solo API comercial |
| JevK5 v0.2.0 | 7 B (base Qwen 2.5) | No disponible | 62,04 | 48,0 ms | No especificada | Codigo abierto segun el autor |
| Hopper | No disponible | No disponible | 59,43 | 62,0 ms | No especificada | Codigo abierto segun el autor |
| Winnow-12B Q8 | 12 B (base Mistral NeMo) | No disponible | 55,58 | 142,0 ms | No especificada | Codigo abierto segun el autor |
| reflex 4B | 4 B (base Qwen 2.5) | No disponible | 53,99 | 58,0 ms | No especificada | Codigo abierto segun el autor |

Todas las cifras de esta tabla proceden de la tabla comparativa publicada por el propio autor del modelo en su model card, por lo que deben tomarse como datos no verificados de forma independiente. No se dispone de comparativas con modelos de referencia de NLI como DeBERTa-v3 o cross-encoders de reranking convencionales en la informacion proporcionada.

## Limitaciones y advertencias

- Todos los resultados de benchmarks figuran con `verified: false`. La puntuacion de 77,54 y la posicion numero 1 global en JevBench son afirmaciones del autor, no verificadas por terceros.
- El modelo registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion practica nula y ausencia de validacion externa de su comportamiento.
- El benchmark JevBench no es un estandar de la industria reconocido ampliamente; los resultados no son directamente comparables con MMLU, GLUE, SuperGLUE o MTEB.
- No se documentan en la informacion disponible el dataset de entrenamiento, el numero de tokens, la composicion de datos ni los procesos de alineamiento (RLHF/DPO). Esto impide evaluar sesgos sistematicos de la cabeza de clasificacion.
- Al ser un clasificador y no un generador, no puede producir texto explicativo; su salida es un vector de probabilidades de 3 clases. Cualquier sistema que necesite justificacion en lenguaje natural requiere un componente generativo adicional.
- La calibracion reportada (ECE de 0,0655) depende de aplicar temperature scaling con T* = 1,60. Sin ese reescalado en inferencia, las probabilidades brutas no estaran calibradas y el ECE empeorara.
- La ventana de 131.072 tokens es la maxima soportada tecnicamente, pero no se publica ninguna evaluacion de degradacion de la calidad NLI en función de la longitud de entrada; con contextos muy largos la precision puede caer.
- El rendimiento multilingue se declara para 11 idiomas, pero no se aportan metricas por idioma; la calidad puede variar sustancialmente entre el ingles y lenguas de menor representacion en los datos de la base.
- Riesgo de alucinacion: al no generar texto, el modelo no alucina en sentido clasico, pero puede producir falsos positivos de entailment sobre premisas ambiguas, sarcasticas o con negaciones complejas, lo que en un pipeline de verificacion factual se traduce en alucinaciones no detectadas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base es `google/gemma-4-E2B-it`; conviene verificar las condiciones de uso de Gemma de Google, que pueden imponer obligaciones adicionales no cubiertas por la licencia declarada en este repositorio.
- La model card esta truncada en la informacion disponible (la plantilla de formateo de entrada queda incompleta), por lo que no se puede confirmar el formato exacto de prompt recomendado ni los hiperparametros de inferencia.
- El SDK `gevva` y la compatibilidad con OpenJEV los mantiene el mismo autor; es una dependencia de un unico mantenedor, con el riesgo de mantenimiento que ello implica en produccion.
- La fecha de publicacion declarada (2026-09-24) debe contrastarse con el estado real del ecosistema antes de integrar el modelo en un pipeline critico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidburhans/gevva-e2b
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio y benchmark JevBench (GitHub): https://github.com/davidburhans/gevva
- API OpenJEV compatible: https://huggingface.co/AlexWortega/openjev
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0

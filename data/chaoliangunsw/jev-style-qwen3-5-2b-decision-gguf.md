# chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-GGUF

## Resumen

Jev-Style-Qwen3.5-2B-Decision es un modelo de decisión derivado de Qwen/Qwen3.5-2B-Base y publicado por el usuario chaoliangUNSW. No es un modelo de chat: no genera texto libre, sino que recibe un estado (por ejemplo, un titular o una frase), una pregunta tipada y una lista cerrada de opciones, y devuelve una distribución de probabilidad calibrada sobre esas opciones en una única pasada de prefill y desde una única posición de token. Sigue el patrón "System One" descrito por TypeSafe AI (Jev, 2026), aunque el autor indica explícitamente que se trata de una reproducción independiente y no afiliada.

El modelo cubre tres tipos de decisión: Choice (elegir entre N opciones declaradas), Bool (probabilidad de que una proposición sea verdadera) y Score (distribución sobre niveles ordenados y su esperanza como puntuación continua). La aportación principal es la calibración: un temperature ajustado sobre 4.366 ejemplos reservados se pliega en el peso final de RMSNorm, de modo que los logits ya salen calibrados sin ningún post-procesado en inferencia. Con 1.942.653.248 parámetros totales y licencia Apache 2.0, está pensado para integrarse como función de decisión dentro de pipelines, no como asistente conversacional.

Su relevancia práctica está en que mejora de forma sustancial a su modelo base en tareas de clasificación y decisión, y lo hace sin coste de latencia añadido (77 ms frente a 76 ms por decisión en M1 Max con MLX bf16). Se distribuye principalmente en GGUF (Q4_K_M, Q8_0 y BF16) y puede ejecutarse en LM Studio y llama.cpp, lo que lo hace desplegable en hardware de consumo. Existe una versión posterior más pequeña, Jev-Style-0.8B-Decision-v3, que el autor recomienda por encima de esta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen3.5-2B-Base; el autor menciona un forward Gated DeltaNet paralelo por chunks en el pipeline de entrenamiento, pero no se detalla la arquitectura completa |
| Parametros totales | 1.942.653.248 (~1,94B) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (1,3 GB), GGUF Q8_0 (2,1 GB), GGUF BF16 (3,9 GB); MLX bf16 para Apple Silicon |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio principal), safetensors (modelo base), MLX bf16 |
| Modelo base | Qwen/Qwen3.5-2B-Base |
| Tarea | text-generation (en la práctica, función de decisión con clasificación) |
| Descargas / likes | 5.279 descargas, 12 likes |
| Fecha de creación / actualización | 21-09-2026 / 24-09-2026 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B-Base y se adapta mediante LoRA de rango 16 aplicado a todas las capas lineales, con una función de pérdida basada en log-score en lugar de la pérdida de modelado de lenguaje habitual. La decisión se extrae de una única posición de token: el modelo puntúa las letras de las opciones declaradas y el cliente renormaliza esas probabilidades. No hay decodificación de texto ni generación autoregresiva en el uso previsto.

El detalle técnico más destacable es el tratamiento de la calibración y del coste de entrenamiento. Un temperature ajustado sobre 4.366 ejemplos reservados se integra directamente en el peso final de RMSNorm, de forma que toda la distribución de salida ya viene calibrada y no requiere ninguna corrección en tiempo de inferencia. Además, el autor reporta la construcción de un forward diferenciable de Gated DeltaNet, paralelo por chunks, que reproduce la ruta de entrenamiento token a token con un error de 1e-6 (salidas, estado y todos los gradientes) y es 6,5 veces más rápido por paso, medido sobre el modelo hermano de 0,8B. Los datos de entrenamiento concretos (número de tokens, composición exacta del dataset y si hubo RLHF o DPO) no se detallan en la información disponible; sí se listan como datasets asociados nyu-mll/glue, fancyzhx/ag_news, google/boolq y SetFit/sst5.

## Capacidades

- Decisión de tipo Choice: selecciona una opción entre N declaradas y devuelve una probabilidad para cada una. Verificado con listas de opciones sin el límite de 26 letras en la versión v3 (probado con 77 opciones).
- Decisión de tipo Bool: devuelve la probabilidad de que una proposición sea verdadera.
- Decisión de tipo Score: produce una distribución sobre niveles ordenados y su esperanza como puntuación continua.
- Calibración nativa: ECE de 0,017 medido sobre 1.500 ejemplos reservados, sin post-procesado.
- Clasificación de texto: sección de noticias, sentimiento, inferencia de lenguaje natural y preguntas booleanas.
- Funciona como endpoint compatible con la API de OpenAI (`/v1/chat/completions`), solicitando un token con `top_logprobs`.
- No soporta salida fuera de las opciones declaradas: no puede responder a preguntas abiertas ni generar texto.
- No se documentan capacidades de tool calling, uso de agentes, razonamiento multi-paso, visión ni audio en esta ficha.
- Multilingüismo: la ficha de HuggingFace declara únicamente inglés. La cobertura de 51 idiomas corresponde a la versión v3, no a este modelo.

## Casos de uso

- Clasificación de noticias por sección: con AG News alcanza el 87,7% de acierto frente al 84,7% del base en zero-shot; se usaría como paso de enrutamiento que asigna cada titular a una sección declarada.
- Análisis de sentimiento en reseñas: SST-2 pasa del 87,3% al 92,7% y SST-5 del 32,0% al 61,7%, lo que permite clasificar críticas en escalas de cinco niveles con probabilidades calibradas por nivel.
- Enrutamiento y triaje en pipelines: dado un texto y un conjunto de destinos posibles, el modelo devuelve una distribución que puede usarse para decidir la ruta y para medir la confianza antes de escalar a un humano.
- Moderación de contenido con umbral explícito: al ser una decisión de tipo Bool, se puede fijar un umbral sobre la probabilidad de que un contenido viole una política, con la garantía de que un 80% declarado se corresponde con un 80% real.
- Verificación de afirmaciones contra evidencia corta: BoolQ mejora del 73,0% al 82,7%, útil para comprobar si un pasaje respalda una afirmación antes de publicarla o indexarla.
- Puntuación y ranking de candidatos: el tipo Score permite ordenar respuestas, fragmentos o productos y obtener una puntuación continua a partir de la esperanza de la distribución.
- Inferencia de lenguaje natural en validación de datos: MNLI sube del 52,3% al 86,7%, aplicable a comprobar si una premisa implica una hipótesis en procesos de control de calidad de datos sintéticos.
- Señal de confianza en sistemas híbridos: por su ECE de 0,017, puede actuar como cabecera de clasificación calibrada delante de un modelo generativo, decidiendo cuándo responder automáticamente y cuándo derivar.
- Etiquetado a escala en local: con Q4_K_M (1,3 GB) mantiene 82,4% de acierto, lo que permite etiquetar grandes volúmenes en una GPU de consumo o incluso en un portátil con Apple Silicon.

## Benchmarks y rendimiento

Todos los resultados están medidos sobre datos no vistos en entrenamiento y con las probabilidades tal y como las producen los pesos publicados, sin post-procesado.

| Métrica | Qwen3.5-2B-Base, zero-shot | Jev-Style-Qwen3.5-2B-Decision |
|---|---|---|
| Exactitud, 5 tareas de decisión (1.500 ejemplos reservados) | 65,9% | 82,3% |
| Error de calibración (ECE) en esas tareas | 0,065 | 0,017 |
| Log-verosimilitud negativa / Brier score | 0,786 / 0,446 | 0,418 / 0,242 |
| Error de calibración en tipos de tarea nunca vistos en entrenamiento | 0,155 | 0,075 |
| Latencia por decisión (M1 Max, MLX bf16) | 76 ms | 77 ms |

Desglose por tarea:

| Tarea | Qwen3.5-2B-Base, zero-shot | Jev-Style-Qwen3.5-2B-Decision |
|---|---|---|
| MNLI | 52,3% | 86,7% |
| SST-5 | 32,0% | 61,7% |
| BoolQ | 73,0% | 82,7% |
| SST-2 | 87,3% | 92,7% |
| AG News | 84,7% | 87,7% |

Rendimiento por cuantización (exactitud sobre 500 ejemplos reservados) y fidelidad frente a bf16:

| Fichero | Tamaño | Misma decisión que bf16 | Exactitud (500 reservados) |
|---|---|---|---|
| Q4_K_M | 1,3 GB | 94,4% | 82,4% |
| Q8_0 | 2,1 GB | 99,4% | 81,6% |
| BF16 | 3,9 GB | 99,8% | 81,6% |

Verificación de extremo a extremo a través del servidor de LM Studio sobre 500 ejemplos reservados: 81,6% de exactitud, ECE 0,028 y aproximadamente 110 ms por decisión sobre HTTP. En tipos de tarea no vistos (clasificación de emociones y RTE) la calibración mejora de 0,155 a 0,075 con exactitud sin cambios (64,5%). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB para Q4_K_M, 2,1 GB para Q8_0 y 3,9 GB para BF16, sin contar el overhead del runtime ni la caché de contexto.
- GPU recomendadas: al ser un modelo de ~1,94B, cabe holgadamente en cualquier GPU de consumo reciente. No requiere A100 ni H100. Una RTX 4090, RTX 3090, RTX 4080 o incluso GPUs de gama media con 8 GB de VRAM son suficientes para cualquiera de las cuantizaciones publicadas.
- Compatibilidad con GPU de consumo: sí, en todas las cuantizaciones. Q4_K_M entra en GPUs con 4 GB o menos.
- Apple Silicon: existe una build MLX bf16 específica. Las latencias reportadas (76-77 ms por decisión) están medidas en un M1 Max.
- Opciones de despliegue: LM Studio (servidor local en la pestaña Developer), llama.cpp y `llama-server`, y MLX para Apple Silicon. El endpoint es compatible con la API de OpenAI.
- Latencia y throughput: 77 ms por decisión en M1 Max con MLX bf16, prácticamente idéntico a los 76 ms del modelo base en la misma configuración. A través del servidor HTTP de LM Studio, unos 110 ms por decisión. No se publican cifras de throughput en GPUs dedicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Exactitud | Calibración (ECE) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Jev-Style-Qwen3.5-2B-Decision (este modelo) | 1,94B | no disponible | 82,3% en 5 tareas (1.500 ejemplos); 53,4% en las 2.000 decisiones tipadas | 0,017 | Apache 2.0 | GGUF, MLX bf16 |
| Qwen3.5-2B-Base (zero-shot) | 1,94B | no disponible | 65,9% en 5 tareas | 0,065 | Apache 2.0 | safetensors |
| Jev-Style-0.8B-Decision-v3 (sucesor) | 0,8B | 25.600 tokens | 79,2% en las 2.000 decisiones tipadas | no disponible | no disponible | GGUF |
| Jev-Style-Qwen3.5-2B-Decision-v2 | no disponible | no disponible | 73,5% en las 2.000 decisiones tipadas | no disponible | no disponible | GGUF |

Advertencia sobre la comparación: las dos métricas de exactitud de esta tabla no son directamente comparables entre sí. El 82,3% corresponde a 1.500 ejemplos de cinco tareas de decisión, mientras que el 53,4% corresponde a un conjunto distinto de 2.000 decisiones tipadas sobre el que el autor reporta los resultados de v1, v2 y v3. Según esa segunda métrica, esta versión (v1) queda claramente por debajo de las versiones posteriores. No se dispone de información sobre modelos comparables de otros autores para esta categoría concreta de modelo de decisión.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto. Cualquier uso como modelo de chat devuelve continuaciones de texto sin sentido. Es obligatorio usar el formato de prompt documentado, que debe terminar en `Answer:`.
- No puede responder fuera de las opciones declaradas. No hay margen para respuestas abiertas, aclaraciones ni razonamiento explícito.
- Solo inglés: la ficha de HuggingFace declara únicamente `en`. El soporte de 51 idiomas corresponde a la versión v3, no a este repositorio.
- Rendimiento inferior a versiones posteriores: el propio autor indica que v3, con 0,8B de parámetros, es "más pequeña y más fuerte", con 79,2% frente al 53,4% de v1 en las 2.000 decisiones tipadas. Esta versión se conserva principalmente por reproducibilidad histórica.
- La calibración se degrada fuera de la distribución de entrenamiento: el ECE sube de 0,017 en las tareas conocidas a 0,075 en tipos de tarea nunca vistos. Sigue siendo mejor que el base (0,155), pero conviene validar el umbral en el dominio concreto de despliegue.
- La calibración depende de que se solicite correctamente un único token con `top_logprobs` y de que se renormalicen las letras de las opciones. Un cliente distinto o un post-procesado adicional invalida las garantías reportadas.
- Riesgo de sesgo: no se documenta ningún análisis de sesgo. Al entrenarse sobre GLUE, AG News, BoolQ y SST-5, hereda los sesgos de dominio de esos datasets (noticias en inglés, reseñas, NLI académico).
- Riesgo de alucinación: no aplica en el sentido generativo, ya que no genera texto, pero sí existe riesgo de sobreconfianza en dominios alejados del entrenamiento. El ECE de 0,075 en tareas nuevas acota ese riesgo de forma cuantificable.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar la licencia del modelo base Qwen3.5-2B-Base.
- El tamaño del repositorio es de 7,3 GB, muy superior a la suma de los tres GGUF publicados, ya que incluye también los pesos en otros formatos y artefactos.
- Un chat nuevo por decisión: el autor advierte de que en una ventana de chat hay que iniciar una conversación nueva para cada decisión, lo que complica su uso interactivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-GGUF
- Repositorio GitHub: https://github.com/lawrence3699/Jev-Style-Qwen3.5-2B-Decision-GGUF
- Versión v2: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-GGUF
- Versión v3 (0,8B, recomendada por el autor): https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3-GGUF
- Build MLX bf16 para Apple Silicon: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-MLX-bf16
- Sitio del autor con benchmarks y quickstart: https://jevstyle.com/#v1
- Artículo original sobre modelos System One y Jev (TypeSafe AI, 2026): https://typesafe.ai/blog/introducing-system-one-models-and-jev
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Anuncio de la serie Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio no oficial de Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Imagen Docker ai/qwen3.5: https://hub.docker.com/r/ai/qwen3.5

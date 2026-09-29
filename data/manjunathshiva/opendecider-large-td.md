# manjunathshiva/opendecider-large-td

## Resumen

OpenDecider-large-td es un modelo de decisión basado en el modelo de mezcla de expertos Qwen3-Next-80B-A3B-Instruct (80.000 millones de parámetros totales, 3.000 millones activos) al que se le ha añadido un adaptador LoRA. Lo desarrolla Manjunath Janardhan (usuario manjunathshiva) dentro de la familia OpenDecider, una línea de modelos "System 1" pensados para tomar decisiones rápidas y devolver probabilidades calibradas en lugar de texto generado. Se distribuye con licencia Apache-2.0 y está pensado para GPUs NVIDIA.

El problema que resuelve es el de la clasificación y el enrutado con probabilidades fiables: en lugar de pedir a un LLM que genere una respuesta y luego parsearla, se le plantean preguntas tipadas (choice, score, noul) sobre texto o JSON y se obtiene una probabilidad calibrada por opción, sin generación de texto intermedia. Según la model card, es el sistema más cercano al juicio humano de los 16 evaluados en ChaosNLI (JSD 0.030 frente a 0.043 de Claude Fable 5.1) y el de menor error de calibración (ECE 0.083) entre los que se pueden ejecutar localmente.

Es relevante para quienes necesitan umbrales de confianza directamente accionables en pipelines de decisión (facturas, triaje, moderación, enrutado de agentes) sobre hardware propio. El repositorio contiene solo el adaptador (0,1 GB); el modelo base completo ocupa aproximadamente 160 GB y se descarga por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) híbrida con atención lineal Gated DeltaNet heredada de Qwen3-Next; adaptador LoRA/PEFT sobre el modelo base |
| Parametros totales | 80.000 millones (modelo base Qwen3-Next-80B-A3B-Instruct) |
| Parametros activos | 3.000 millones |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen3-Next-80B-A3B-Instruct) |
| Tipos de cuantizacion | No disponible en la información proporcionada (el adaptador se distribuye en safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se descarga aparte (~160 GB) |

## Arquitectura y entrenamiento

OpenDecider-large-td no es un modelo entrenado desde cero: es un adaptador LoRA (PEFT) sobre Qwen3-Next-80B-A3B-Instruct, un transformer MoE con 80.000 millones de parámetros totales y 3.000 millones activos por token. La arquitectura del modelo base combina capas de atención lineal Gated DeltaNet con capas de atención completa, un diseño híbrido que reduce el coste de cómputo en secuencias largas; la model card recomienda instalar `flash-linear-attention` para disponer de kernels más rápidos de Gated DeltaNet, aunque las latencias publicadas se midieron sin ellos. El adaptador se distribuye como repositorio PEFT y requiere `transformers >= 4.57`.

El entrenamiento se basa en destilación y ajuste fino supervisado sobre un conjunto de datasets de decisión y clasificación, entre ellos LocalLLaMA/typed-decisions, knowledgator/gliclass-v2.0, clinc/clinc_oos, go_emotions, squad_v2, WANLI, dbpedia_14, civil_comments, sms_spam, PAWS y HotpotQA. El modelo devuelve directamente una distribución de probabilidad sobre las opciones planteadas (preguntas de tipo choice, score y noul) en lugar de generar texto que haya que analizar después, lo que es la innovación central de la familia OpenDecider: decisiones "System 1" calibradas y listas para umbralizar. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición porcentual del dataset ni si se emplearon fases de RLHF o DPO.

## Capacidades

- Clasificación zero-shot con probabilidades calibradas sobre cualquier texto o JSON de entrada.
- Decisiones tipadas: `choice` (elegir entre opciones con una probabilidad por opción), `score` (puntuar según criterios) y `noul` (decisión binaria/tipo sí-no).
- Salida sin generación de texto: devuelve directamente probabilidades, lo que evita el parseo de respuestas.
- Enrutado y scoring: asignación de categorías, niveles de riesgo o prioridades con confianza asociada.
- Razonamiento de un solo paso ("System 1"): decisiones rápidas sobre entradas estructuradas o no estructuradas.
- Capacidad de trabajar con entradas JSON complejas (por ejemplo, registros de facturas con varios campos).
- Idiomas: únicamente inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso, visión o audio: no disponibles en la información proporcionada (el modelo está orientado a decisión y clasificación, no a generación ni a multimodalidad).

## Casos de uso

- Aprobación de facturas y cuentas a pagar: el ejemplo de la model card muestra cómo decidir entre aprobar, retener por falta de orden de compra o rechazar una factura, además de puntuar el riesgo de pago y decidir si requiere revisión humana, todo con probabilidades sobre las que fijar umbrales.
- Triaje de tickets de atención al cliente: asignar cada mensaje a una categoría (clinc_oos forma parte de los datos de entrenamiento) con una probabilidad de confianza que permita derivar a un agente o resolver de forma automática.
- Enrutado de peticiones entre modelos o servicios: dado un texto de entrada, elegir el destino o la política más adecuada devolviendo una distribución de probabilidad utilizable por un orquestador.
- Moderación de contenido: clasificar comentarios según su toxicidad o gravedad (google/civil_comments está entre los datasets) y decidir si se publican, se revisan o se bloquean.
- Detección de spam: clasificar mensajes SMS o similares (ucirvine/sms_spam) con un umbral de confianza ajustable según la tasa de falsos positivos tolerada.
- Puntuación de riesgo y conformidad: evaluar operaciones financieras, alertas de seguridad o expedientes y devolver un nivel de riesgo (bajo, medio, alto) con probabilidad calibrada para auditoría.
- Inferencia de relación entre textos (NLI) y respuesta a preguntas: usar los datos de WANLI, PAWS, SQuAD v2 y HotpotQA para tareas de implicación, parafraseo o verificabilidad de respuestas.
- Revisión humana asistida (human-in-the-loop): usar la decisión `noul` y la confianza del modelo para marcar qué casos deben pasar a revisión manual, priorizando por incertidumbre.
- Observabilidad de trazas de agentes: evaluar automáticamente las salidas de agentes LLM y clasificarlas como correctas, dudosas o erróneas (capacidad destacada en la variante small-td de la familia).

## Benchmarks y rendimiento

Resultados publicados en la model card. Todas las puntuaciones se calcularon con el mismo harness de evaluación; TypeSafe Jev 1.13 se midió a través de su propia API.

| Benchmark | TypeSafe Jev 1.13 | Laya typed-decisions | OpenDecider-nano | OpenDecider-small-td | OpenDecider-medium-td | OpenDecider-large-td |
|---|---|---|---|---|---|---|
| 200 decisiones generales | 0,730 | 0,570 | 0,680 | 0,715 | 0,765 | 0,750 |
| Error de calibración ECE (menor mejor) | 0,164 | 0,162 | 0,092 | 0,107 | 0,110 | 0,083 |
| Distancia a votos humanos, ChaosNLI JSD (menor mejor) | 0,148 | 0,111 | 0,045 | 0,040 | 0,035 | 0,030 |
| typed-decisions (2.000 decisiones) | 0,754 | 0,766 | 0,796 | 0,792 | 0,788 | 0,801 |
| Batería de aplicaciones de Laya (10 tareas) | 0,774 | 0,702 | 0,656 | 0,703 | 0,725 | 0,718 |
| Latencia mediana, 1 pregunta | 404 ms (API) | 21 ms | 16 ms (L40S) | 40 ms (L40S) | 214 ms (4x L40S) | 440 ms (4x L40S) |

Datos adicionales mencionados en la model card: frente a Claude Fable 5.1, OpenDecider-large-td obtiene mejor JSD en ChaosNLI (0,030 frente a 0,043), aunque peor ECE (0,083 frente a 0,064). La mitad más confiada de sus decisiones generales alcanza una precisión de 0,870, frente a 0,860 de TypeSafe Jev. Los resultados de la tarea typed-decisions se comparan "como para como" con el checkpoint de Laya sobre la misma partición de train, con una mejora de +0,035 e intervalo de confianza del 95% de +0,017 a +0,052. No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 160 GB de memoria de GPU en el modelo base (según la model card, la descarga del base es de ~160 GB). El adaptador en sí ocupa 0,1 GB.
- GPUs recomendadas: NVIDIA. Las mediciones de latencia se hicieron sobre 4x L40S; no se especifican otras configuraciones.
- No cabe en GPU de consumo: 160 GB superan la VRAM de cualquier tarjeta consumer (RTX 4090 con 24 GB, etc.). Para 64 GB o menos, la familia recomienda las variantes medium, small o nano.
- La librería `opendecider` 0.1.2 o superior reparte el modelo entre todas las GPUs visibles, lo que permite ejecutarlo en configuraciones multi-GPU.
- Opciones de despliegue: librería `opendecider` (`pip install "opendecider[small]>=0.1.2"`), con `transformers >= 4.57` y PyTorch construido con CUDA 12.8; opcionalmente `flash-linear-attention` para kernels más rápidos de Gated DeltaNet. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 440 ms de latencia mediana por pregunta en 4x L40S (sin kernels Gated DeltaNet optimizados). No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento clave | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenDecider-large-td | 80B MoE / 3B activos | No disponible | ECE 0,083; JSD 0,030; typed-decisions 0,801 | Apache-2.0 | HuggingFace (~160 GB de GPU) |
| OpenDecider-medium-td | No disponible en la información (Qwen3-30B-A3B según el repositorio) | No disponible | ECE 0,110; JSD 0,035; typed-decisions 0,788; 200 decisiones generales 0,765 | Apache-2.0 | HuggingFace (~61 GB de GPU) |
| OpenDecider-small-td | 4B (según la model card de small-td) | No disponible | ECE 0,107; JSD 0,040; typed-decisions 0,792 | Apache-2.0 | HuggingFace, ~16 GB de Mac o una GPU |
| OpenDecider-nano | ~400M | No disponible | ECE 0,092; JSD 0,045; 16 ms por pregunta | Apache-2.0 | HuggingFace, ejecutable en CPU |
| TypeSafe Jev 1.13 | No disponible | No disponible | ECE 0,164; JSD 0,148; 200 decisiones generales 0,730 | No disponible (acceso vía API) | API de TypeSafe |
| Laya typed-decisions | No disponible | No disponible | ECE 0,162; JSD 0,111; typed-decisions 0,766 | No disponible | No especificada |

## Limitaciones y advertencias

- Solo procesa inglés; cualquier uso en otros idiomas no está soportado.
- No es un modelo generativo ni multimodal: está diseñado para devolver probabilidades sobre opciones predefinidas, no para redactar texto.
- Hereda los sesgos del modelo base Qwen3-Next-80B-A3B-Instruct y de los datasets de entrenamiento (entre ellos civil_comments o go_emotions, con sesgos sociales conocidos); no se documenta ningún análisis de sesgo específico.
- Riesgo de alucinación: aunque no genera texto, las probabilidades pueden ser incorrectas; la calibración publicada (ECE 0,083) es un promedio y no garantiza fiabilidad en dominios fuera de la distribución de entrenamiento.
- Las comparaciones de la model card se basan en conjuntos de 200 ítems, con un margen de ruido de ±3 puntos, según reconoce el propio autor.
- Las latencias publicadas (440 ms por pregunta) se midieron sin los kernels optimizados de Gated DeltaNet, por lo que pueden variar según la configuración.
- El repositorio de HuggingFace solo contiene el adaptador (0,1 GB); para usarlo hay que descargar el modelo base completo (~160 GB).
- Requiere GPUs NVIDIA con memoria agregada de aproximadamente 160 GB, lo que excluye el despliegue en hardware de consumo.
- Licencia Apache-2.0, permisiva para uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-Next-80B-A3B-Instruct por separado.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta; no hay evidencia de adopción en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/manjunathshiva/opendecider-large-td
- Repositorio GitHub: https://github.com/manjunathshiva/opendecider
- Paquete PyPI: https://pypi.org/project/opendecider/
- Colección OpenDecider en HuggingFace: https://huggingface.co/collections/manjunathshiva/opendecider-6ab8c838909092518d50a9ea
- Comparativa completa de benchmarks (COMPARISON.md): https://github.com/manjunathshiva/opendecider/blob/main/COMPARISON.md
- Harness de benchmarks: https://github.com/manjunathshiva/opendecider/tree/main/benchmarks
- Harness de comparación Jev-vs-Laya: https://github.com/pavanjava/jev_and_laya_ben
- Variante OpenDecider-medium-td: https://huggingface.co/manjunathshiva/opendecider-medium-td
- Variante OpenDecider-small-td: https://huggingface.co/manjunathshiva/opendecider-small-td
- Modelo base Qwen3-Next-80B-A3B-Instruct: https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct
- Perfil del autor en HuggingFace: https://huggingface.co/manjunathshiva

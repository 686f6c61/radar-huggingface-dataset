# cisco-ai/lev-3b

## Resumen

Lev-3B es un modelo de decisión probabilística desarrollado por Cisco AI (repositorio `splunk/lev`) sobre el backbone `ibm-granite/granite-4.1-3b-base`. A diferencia de un modelo generativo convencional, no produce texto: dado un estado (por ejemplo, una sesión de logs en texto o JSON) y una o varias preguntas con alternativas definidas por el llamante, devuelve una distribución de probabilidad normalizada sobre esas alternativas. La lectura se realiza mediante una cabeza pointer entrenada, no mediante decodificación autoregresiva.

El checkpoint publicado está adaptado específicamente para análisis de logs, con datos de entrenamiento de detección de anomalías, clasificación de técnicas padre de ATT&CK y logs generales. Las evaluaciones reportadas por el autor cubren detección de anomalías y clasificación de técnicas padre de ATT&CK. Su relevancia radica en el enfoque: sustituye la generación libre por una interfaz de decisión calibrada y acotada, lo que facilita integrar el modelo en pipelines de seguridad donde se necesita una probabilidad explícita y auditable en lugar de texto generado.

El modelo se distribuye como adaptador LoRA (rank 16, alpha 32) más una cabeza pointer entrenada, sin incluir los pesos base de Granite, que se cargan automáticamente desde Hugging Face o la caché local. Requiere el runtime propietario Lev (`kev`), ya que la carga mediante `AutoModelForCausalLM` o PEFT estándar no restaura la interfaz de decisión completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decisión probabilística con backbone de lenguaje causal (Granite-4.1-3B-Base) y cabeza pointer entrenada; no genera texto |
| Parametros totales | No disponible (adaptador LoRA sobre un backbone de 3B; el repo pesa 0,1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Límites de ejecución guardados: 32768 tokens de estado, 65536 de rama y 65536 empaquetados |
| Tipos de cuantizacion | No disponible (inferencia en BF16 para el backbone y FP32 para adaptadores, filas de tokens estructurales y cabeza pointer) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `adapter_model.safetensors`, `adapter_config.json`, `head.pt`, `tokenizer.json`, `tokenizer_config.json`, `temperature.json` |

## Arquitectura y entrenamiento

Lev-3B combina un transformer causal (Granite-4.1-3B-Base, revisión `dacb9cb9157bec98e99b09f285c92a4d58405c96`) con una adaptación LoRA de rank 16 y alpha 32 aplicada a las proyecciones de atención y MLP, que incluye además filas entrenadas para tokens estructurales. Sobre esa representación se sitúa una cabeza pointer entrenada que puntúa cada alternativa descrita por el llamante para cada pregunta, produciendo una distribución de probabilidad normalizada. La ejecución es por filas independientes, con límites guardados de 32768 tokens de estado, 65536 de rama y 65536 empaquetados; el autor advierte que estos son límites de ejecución y no una garantía de que toda petición de ese tamaño quepa en cualquier GPU.

El entrenamiento se realizó con datos de detección de anomalías, clasificación de técnicas padre de ATT&CK y logs generales. El modelo incluye un tokenizador propio con tokens delimitadores añadidos, que no debe sustituirse por el del modelo base. Se proporciona una temperatura post-hoc ajustada de 1,8234449771164334, aplicable de forma explícita sobre las probabilidades crudas a T=1. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Decisión probabilística sobre alternativas definidas por el llamante, con tres tipos de pregunta: `noul` (binaria, con orden `false` y luego `true`), `choice` (entre 1 y 255 alternativas nombradas) y `score` (entre 2 y 255 descripciones ordenadas para calcular el nivel esperado).
- Detección de anomalías en sesiones de logs, con salida de probabilidad calibrada.
- Clasificación de técnicas padre de ATT&CK a partir de estados de log.
- Procesamiento de estado en texto libre o JSON estructurado (objetos y arrays se renderizan como texto; una cadena codificada en JSON se trata como texto).
- Soporte de múltiples preguntas por petición, con una distribución de probabilidad por pregunta en el orden de inserción.
- Calibración opcional mediante temperatura post-hoc compartida.
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso en el sentido de un agente generativo; su interfaz es exclusivamente de puntuación de alternativas.

## Casos de uso

- Triaje de alertas de seguridad: dado un estado con las líneas de log de una sesión, el modelo devuelve la probabilidad de que sea anómala mediante una pregunta `noul`, lo que permite priorizar alertas sin generar texto y con un umbral calibrado.
- Clasificación de técnicas ATT&CK: con una pregunta `choice` cuyas alternativas son técnicas padre, el modelo selecciona la de mayor probabilidad, útil para enriquecer incidentes en un SIEM.
- Enrutamiento de logs a colas de análisis: usando preguntas `score` con niveles ordenados (por ejemplo, severidad de 0 a 4), se calcula el nivel esperado y se dirige cada sesión al pipeline correspondiente.
- Detección de fallos recurrentes en producción: el estado puede incluir secuencias de reintentos y errores, y la probabilidad de anomalía sirve como señal para disparar alertas o abrir incidencias automáticamente.
- Evaluación de cumplimiento y auditoría: al devolver probabilidades explícitas y normalizadas por alternativa, cada decisión queda registrada de forma auditable, lo que encaja en flujos con requisitos de trazabilidad.
- Enriquecimiento de pipelines SOC con estado estructurado: al aceptar JSON como estado, se pueden pasar campos ya parseados (servicio, código de error, usuario) junto con las líneas crudas y formular varias preguntas en una sola petición.
- Clasificación por lotes de sesiones históricas: la ejecución por filas independientes y los límites de empaquetado de 65536 tokens permiten procesar lotes de sesiones para etiquetado retrospectivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que las evaluaciones reportadas cubren detección de anomalías y clasificación de técnicas padre de ATT&CK, sin incluir cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el backbone opera en BF16 y los adaptadores, filas estructurales y cabeza pointer en FP32, por lo que se requiere una GPU NVIDIA con memoria suficiente para un modelo de 3B en BF16 más los componentes en FP32.
- GPU recomendadas: no disponible; el autor indica únicamente que se necesita una GPU NVIDIA y ofrece extras para CUDA 12.8/PyTorch 2.8 (con kernels optimizados) y CUDA 12.4/PyTorch 2.6.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime Lev (`kev`) instalado desde `https://github.com/splunk/lev` mediante `uv`, sobre Linux x86-64 y Python 3.12. No es compatible de forma garantizada con `AutoModelForCausalLM`, PEFT estándar ni con el KEV upstream por sí solo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Interfaz | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lev-3B | Adaptador sobre backbone de 3B | 32768 tokens de estado (límite de ejecución) | Probabilidades sobre alternativas definidas por el llamante | Apache 2.0 | Hugging Face (`cisco-ai/lev-3b`) |
| Granite-4.1-3B-Base | 3B | No disponible | Generación de texto | No disponible en la información proporcionada | Hugging Face (`ibm-granite/granite-4.1-3b-base`) |
| Modelos generativos de 3B para análisis de logs | No disponible | No disponible | Generación de texto libre | No disponible | No disponible |

La comparación con alternativas de la misma categoría (modelos de decisión probabilística sobre logs) no está disponible en la información proporcionada. El único punto de referencia directo es su backbone, Granite-4.1-3B-Base, que comparte arquitectura subyacente pero difiere radicalmente en la interfaz de salida.

## Limitaciones y advertencias

- No genera texto: cualquier flujo que espere respuestas redactadas requiere un componente adicional.
- Solo inglés: el modelo declara únicamente el idioma `en`, por lo que su uso con logs en otros idiomas no está respaldado.
- Requiere el runtime Lev (`kev`): la carga con herramientas estándar de Hugging Face o PEFT no restaura la cabeza pointer ni la interfaz de decisión.
- Los pesos base no se incluyen en el repositorio; el loader descarga Granite-4.1-3B-Base desde Hugging Face o la caché local, lo que añade una dependencia externa en el despliegue.
- El tokenizador no debe sustituirse por el del modelo base, ya que contiene tokens delimitadores añadidos durante el entrenamiento.
- Las probabilidades crudas a T=1 pueden no estar calibradas; la temperatura ajustada (1,8234449771164334) debe aplicarse explícitamente si se desea la calibración reportada.
- Los límites de 32768/65536/65536 tokens son límites de ejecución y no garantizan que toda petición de ese tamaño quepa en cualquier GPU.
- Riesgo de sesgos y alucinación: no se documentan en la información disponible; al no generar texto, el riesgo de alucinación se traslada a una posible sobreconfianza en las probabilidades asignadas a alternativas mal definidas por el llamante.
- La calidad de la decisión depende críticamente de cómo el llamante redacte las alternativas y las instrucciones de cada pregunta.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las condiciones del backbone Granite subyacente y del runtime Lev, que se distribuyen por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cisco-ai/lev-3b
- Repositorio del runtime Lev: https://github.com/splunk/lev
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-3b-base
- Paper referenciado en los tags: arXiv:2610.38915 (no verificado en la información disponible)

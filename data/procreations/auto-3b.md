# ProCreations/auto-3b

## Resumen

auto-3b es un clasificador de 3.075 millones de parámetros desarrollado por ProCreations, obtenido por ajuste fino supervisado de SmolLM3-3B-Base. Su función no es generar texto, sino decidir si una llamada a herramienta propuesta por un agente de IA está autorizada y es segura en contexto: recibe la petición del usuario, el historial del agente y la llamada propuesta, y devuelve una etiqueta binaria de aprobación o denegación. Está pensado como salvaguarda para pipelines de agentes que ejecutan herramientas con efectos reales.

El modelo es la variante mayor y más precisa de la familia Auto y actúa como maestro del que se destiló auto-200m-2. Parte de SmolLM3-3B-Base, un decoder transformer con 64.000 tokens de contexto preentrenado, al que se sustituye la cabeza de modelado de lenguaje por una cabeza de clasificación de dos clases que lee el último token no de padding. Conserva así una ventana de contexto de 65.536 tokens, útil para evaluar llamadas a herramienta dentro de conversaciones largas.

Su relevancia actual radica en el problema que aborda: la seguridad de agentes que invocan herramientas. Frente a heurísticas o listas de permitidos, auto-3b aprende a juzgar autorización y riesgo en contexto. Según la model card, alcanza un 98,03 % de exactitud en el benchmark fijado Approve-or-Deny (3.000 ítems), con una tasa de aprobaciones indebidas del 1,57 %, aunque con la advertencia de que los pesos publicados solo se entrenaron con entradas de hasta 4.096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (SmolLM3-3B) con cabeza de clasificación de 2 clases que lee el último token no de padding |
| Parametros totales | 3.075.102.720 (3,08 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens (64k) |
| Tipos de cuantizacion | no disponible (los pesos publicados están en safetensors; la evaluación se hizo en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 6,2 GB) |

## Arquitectura y entrenamiento

La arquitectura de partida es SmolLM3-3B-Base en la revisión `d78a42f7`, un decoder transformer con contexto preentrenado de 64k tokens. La modificación clave es la sustitución de la cabeza de modelado de lenguaje por una cabeza de clasificación lineal de dos clases que opera sobre el último token no de padding, con salida interpretable como `P(deny)`. El umbral por defecto usado en todos los números publicados es 0,5; también se fijó de antemano un umbral calibrado de 0,295 para exactitud balanceada sobre una partición de validación separada.

El entrenamiento se realizó en dos fases. La fase corta consistió en SFT de todos los parámetros sobre las 694.070 filas de entrenamiento de hasta 4.096 tokens, durante 2 épocas (10.354 pasos), con pérdida de entropía cruzada, AdamW (β = 0,9/0,95, weight decay 0,01), tasa de aprendizaje 1e-5, pesos maestros en FP32 y cómputo en BF16, sin truncar ninguna entrada. La fase larga usó 53.745 filas, 17.915 de ellas de más de 4.096 tokens, con tasa 4e-6, y se detuvo a petición del responsable en el paso 771 de 1.493. La selección de candidatos se hizo por NLL sobre una partición de validación de 7.824 filas: ganó el checkpoint de fin de fase corta (NLL 0,0553 frente a 0,1029 del modelo de fase larga detenido), que se congeló antes de ejecutar el benchmark. En consecuencia, los pesos publicados se entrenaron con entradas de como máximo 4.096 tokens y leen entradas más largas apoyándose en el contexto nativo del modelo base. No hubo filas sintéticas ni destilación en los datos de entrenamiento, que provienen del corpus `ProCreations/auto-1b-data` (revisión `d265bbf7`).

## Capacidades

- Clasificación binaria de llamadas a herramienta: dado un par aprobar/denegar, el modelo decide si la llamada propuesta por un agente está autorizada y es segura en contexto.
- Lectura de contexto compuesto: consume la llamada propuesta, la petición del usuario y el historial del agente en un formato de entrada común a la familia Auto.
- Contexto largo de hasta 65.536 tokens, útil para decidir sobre llamadas dentro de conversaciones extensas.
- Evaluación de alcance, historial e inyección de instrucciones: según la model card, obtuvo 38/40 en las pruebas frescas de alcance, historial e inyección (1 falsa aprobación y 1 falsa denegación).
- Puntuación de confianza: al ser una cabeza de 2 clases, expone una probabilidad (`P(deny)`) que permite ajustar el umbral de decisión según el coste relativo de cada tipo de error.
- No es un modelo generativo: no produce texto libre, no soporta tool calling por sí mismo ni razonamiento multi-paso, y no dispone de modo de pensamiento, visión ni audio.

## Casos de uso

- Salvaguarda en pipelines de agentes: colocar auto-3b como paso previo a la ejecución de cada herramienta para vetar llamadas no autorizadas, apoyándose en la ventana de 65.536 tokens para evaluar la llamada dentro de conversaciones largas.
- Control de acceso a herramientas sensibles: interceptar llamadas a borrado de datos, transferencias o cambios de permisos y denegar las que no estén respaldadas por una autorización explícita en el historial.
- Detección de inyección de instrucciones: comprobar si una llamada propuesta responde a una indicación maliciosa embebida en contenido externo, leyendo conjuntamente la petición, el historial y la llamada.
- Auditoría de agentes en producción: registrar la probabilidad de denegación de cada llamada como señal de riesgo y revisar después los casos con valores próximos al umbral.
- Filtrado previo en entornos con confirmación humana: usar el modelo para decidir qué llamadas requieren aprobación manual y cuáles pueden ejecutarse automáticamente, ajustando el umbral según la tolerancia a falsas aprobaciones o falsas denegaciones.
- Destilación y destilación de variantes ligeras: la model card indica que auto-3b es el maestro del que se destiló auto-200m-2, por lo que sirve de referencia para generar etiquetas de entrenamiento en modelos más pequeños.
- Evaluación comparativa de políticas de autorización: emplear como referencia de alta precisión (98,03 % de exactitud, 1,57 % de falsas aprobaciones) frente a la que medir alternativas más ligeras o basadas en reglas.

## Benchmarks y rendimiento

Datos declarados por el autor sobre el benchmark fijado Approve-or-Deny (3.000 ítems, revisión `a38b6259`), puntuados a longitud completa en BF16 con FlashAttention y umbral `P(deny) >= 0,5`. Una falsa aprobación es una llamada insegura aprobada; una falsa denegación es una llamada autorizada denegada. Ninguna métrica figura como verificada en el model-index.

| Modelo | Parametros | Exactitud | Falsas aprobaciones | Falsas denegaciones | AUROC | 16k-64k tokens | Auditoria de validacion |
|---|---:|---:|---:|---:|---:|---:|---:|
| auto-3b | 3.075 M | 98,03 % (2941) | 22/1401 | 37/1599 | 0,9985 | 98,74 % | 98,54 % |
| auto-0.4b-2 (iteración 1) | 395,8 M | 97,00 % (2910) | 36/1401 | 54/1599 | 0,9949 | 95,82 % | 98,03 % |
| auto-200m-2 | 149,6 M | 96,33 % (2890) | 53/1401 | 57/1599 | 0,9937 | 94,14 % | 98,34 % |

Otras métricas del model-index para auto-3b: F1 (deny) 0,9791; tasa de falsa aprobación 0,0157; tasa de falsa denegación 0,0231. Intervalo de confianza de Wilson al 95 % para la exactitud: 97,47 %–98,47 %. La partición de auditoría consta de 2.595 filas de validación nunca usadas para entrenamiento ni selección. La reproducción en un entorno separado el 26 de septiembre de 2026 devolvió el mismo 2.941/3.000 y ninguna decisión con umbral 0,5 difiere de la evaluación original (mayor diferencia de `P(deny)`: 0,019). Con umbral calibrado 0,295 la exactitud baja a 97,67 % (2930), con 19 falsas aprobaciones y 51 falsas denegaciones; el propio autor indica que este umbral no cumplió el objetivo de ≥98 %. Frente a auto-0.4b-2, la comparación emparejada en el umbral calibrado muestra 68 ítems mejorados y 41 empeorados, con intervalo bootstrap al 95 % de la ganancia entre +0,23 y +1,60 puntos y prueba exacta de McNemar con p = 0,012. En las pruebas de habilidades publicadas, MCP y herramientas personalizadas obtuvo 24/24.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos a partir de los 3,08 B parámetros, no publicados por el autor): en BF16, unos 7-8 GB contando pesos (≈6,2 GB) y estados intermedios; en FP8/INT8, unos 4 GB; en INT4, unos 2,5-3 GB.
- GPU recomendadas: para BF16 y contexto largo, A100 40/80 GB, H100 o L40S; para lotes pequeños en BF16, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente.
- ¿Cabe en GPU de consumo? Sí, en tarjetas con 8 GB o más en BF16 para lotes pequeños, y con holgura en configuraciones cuantizadas a 4 bits en GPUs de 6-8 GB. El contexto largo incrementa el consumo de memoria por la caché de atención, por lo que conviene dimensionar según la longitud real de entrada.
- Opciones de despliegue: al ser un modelo de `transformers` con `AutoModelForSequenceClassification`, puede servirse con Hugging Face Transformers, Text Generation Inference en modo clasificación, vLLM (según soporte de cabezas de clasificación) o cualquier servidor compatible con safetensors. No se han publicado artefactos GGUF listos para llama.cpp u Ollama, aunque el modelo base admite conversión.
- Latencia y throughput estimados: no disponibles. La model card no publica medidas de latencia ni de tokens por segundo; solo indica que la evaluación se ejecutó a longitud completa en BF16 con FlashAttention.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud (Approve-or-Deny) | Falsas aprobaciones | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| auto-3b | 3.075 M | 65.536 | 98,03 % | 22/1401 | Apache 2.0 | HuggingFace (ProCreations/auto-3b) |
| auto-0.4b-2 | 395,8 M | no disponible | 97,00 % | 36/1401 | no disponible | HuggingFace (ProCreations/auto-0.4b-2) |
| auto-200m-2 | 149,6 M | no disponible | 96,33 % | 53/1401 | no disponible | HuggingFace (ProCreations/auto-200m-2) |

La comparación con alternativas externas de clasificación de seguridad de agentes o de moderación de tool calling no está disponible en la información proporcionada; no se conocen referencias de otros autores evaluadas sobre el mismo benchmark.

## Limitaciones y advertencias

- Los pesos publicados se entrenaron solo con entradas de hasta 4.096 tokens; la capacidad de manejar entradas más largas proviene del contexto nativo del modelo base y no ha sido reforzada con datos de entrenamiento largos. Esto puede afectar a la fiabilidad más allá de esa longitud.
- El objetivo declarado de ≥98 % de exactitud en el umbral calibrado (0,295) no se cumplió; a ese umbral la exactitud baja a 97,67 % y las falsas denegaciones suben a 51.
- Riesgo de alucinación no aplica en el sentido generativo (el modelo no produce texto), pero sí existe riesgo de decisiones erróneas: 22 falsas aprobaciones y 37 falsas denegaciones sobre el benchmark. Una falsa aprobación implica ejecutar una llamada insegura.
- No hay información publicada sobre idiomas soportados; el entrenamiento se realizó sobre el corpus `ProCreations/auto-1b-data`, cuya composición lingüística no se detalla.
- Sesgos conocidos: no disponibles en la información proporcionada. Al ser un clasificador entrenado sobre un corpus concreto, el comportamiento puede degradarse ante distribuciones de llamadas o convenciones de agentes distintas de las del entrenamiento.
- La evaluación está declarada como no verificada (`verified: false`) en el model-index; conviene reproducirla antes de usarla como criterio de despliegue.
- El benchmark procede del propio autor (`ProCreations/approve-or-deny`), por lo que existe riesgo de sesgo de evaluación compartido entre entrenamiento y prueba, aunque la model card afirma que no hay solapamiento con el conjunto de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial. El modelo base SmolLM3-3B-Base también es Apache 2.0, por lo que no se han identificado restricciones adicionales.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- El modelo no es generativo: no puede emplearse como LLM de propósito general ni para tool calling directo; su uso es exclusivamente clasificación aprobar/denegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProCreations/auto-3b
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base
- Variante destilada auto-200m-2: https://huggingface.co/ProCreations/auto-200m-2
- Dataset de entrenamiento `ProCreations/auto-1b-data` (revisión `d265bbf7`): https://huggingface.co/datasets/ProCreations/auto-1b-data
- Benchmark `ProCreations/approve-or-deny` (revisión `a38b6259`): https://huggingface.co/datasets/ProCreations/approve-or-deny
- Código de entrenamiento (carpeta `training/` del repositorio): https://huggingface.co/ProCreations/auto-3b/tree/main/training
- Registros de evaluación (carpeta `eval/`): https://huggingface.co/ProCreations/auto-3b/tree/main/eval
- Reproducción del 26-09-2026: https://huggingface.co/ProCreations/auto-3b/blob/main/eval/reproduction-2026-09-26.json
- Calibración del umbral: https://huggingface.co/ProCreations/auto-3b/blob/main/calibration.json
- Resultados por categoría, idioma, dificultad y longitud: https://huggingface.co/ProCreations/auto-3b/blob/main/eval_results.json
- Logits por ítem del benchmark: https://huggingface.co/ProCreations/auto-3b/blob/main/benchmark_predictions.npz

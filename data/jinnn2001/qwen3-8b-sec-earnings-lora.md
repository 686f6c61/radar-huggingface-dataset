# Jinnn2001/qwen3-8b-sec-earnings-lora

## Resumen
qwen3-8b-sec-earnings-lora es un adaptador LoRA sobre Qwen/Qwen3-8B desarrollado por Jinnn2001 para extraer cifras financieras GAAP de comunicados de resultados (earnings press releases) de empresas cotizadas estadounidenses presentados ante la SEC. El modelo recibe un comunicado en Markdown y devuelve un único objeto JSON con los ingresos totales, el beneficio neto atribuible y el beneficio diluido por acción, tanto del trimestre más reciente como del acumulado del ejercicio hasta la fecha de cierre del periodo.

El adaptador corresponde al checkpoint step-00025 del entrenamiento qwen3-8b-2k dentro del proyecto sec-earnings-bench, un banco de evaluación que contrasta cada cifra extraída contra el XBRL del 10-Q o 10-K correspondiente de la compañía. Se trata de un adaptador de extracción de información muy especializado (rank 16, pesos safetensors de 0,2 GB), no de un modelo de propósito general, y su utilidad principal es la automatización de pipelines de datos financieros con un coste por documento muy inferior al de las APIs comerciales.

Su relevancia actual radica en que demuestra que un modelo abierto de 8B parámetros con un ajuste fino ligero puede alcanzar una precisión del 99,24 % en un test de empresas no vistas, superando al modelo base en más de 10 puntos, y mantenerse en el 97,64 % en un test temporal de comunicados posteriores, a un coste declarado de 0,59 USD por cada 1.000 comunicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-8B |
| Parametros totales | 8B en el modelo base; el adaptador LoRA ocupa 0,2 GB en el repositorio (rango 16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 40.960 tokens en el servido de referencia (max-model-len 40960) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base Qwen3-8B admite las cuantizaciones habituales (GGUF, AWQ, etc.) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento
El adaptador se aplica sobre Qwen3-8B, un transformer decoder-only de 8.000 millones de parámetros, en la revisión `b968826d9c46dd6066d109eabc6255188de91218`. El ajuste es un LoRA con rango máximo 16, servido mediante vLLM con `--enable-lora`. La inferencia de referencia se realiza con el pensamiento desactivado (`enable_thinking: false`), temperatura 0 y un máximo de 1.024 tokens de salida, lo que indica que el adaptador está calibrado para una tarea de extracción determinista y no para generación abierta.

El entrenamiento se enmarca en el run qwen3-8b-2k del proyecto sec-earnings-bench. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; únicamente indica que el checkpoint publicado es el step-00025. La evaluación se organiza en dos regímenes: un company test con 148 comunicados de 37 empresas nunca vistas durante el entrenamiento, y un time test con 346 comunicados posteriores de las empresas de entrenamiento, presentados entre el 1 de julio y el 30 de septiembre de 2026.

La innovación técnica principal no reside en la arquitectura, sino en el protocolo de evaluación: cada cifra extraída se contrasta automáticamente contra el XBRL del 10-Q o 10-K correspondiente, lo que proporciona una señal de supervisión objetiva y verificable en lugar de comparaciones textuales.

## Capacidades
- Extracción de información financiera estructurada: ingresos totales, beneficio neto atribuible y beneficio diluido por acción, en formato JSON con periodo de cierre, trimestre y acumulado del ejercicio.
- Distinción entre cifras trimestrales y acumuladas del ejercicio (year-to-date), incluyendo el caso del cuarto trimestre, donde el acumulado equivale al ejercicio completo.
- Preservación de la unidad de la tabla original (`units`, `thousands`, `millions`, `billions`) junto a cada cifra, delegando la conversión a dólares al código consumidor.
- Manejo de valores ausentes mediante `null` cuando el comunicado no reporta una cifra.
- Procesamiento de comunicados largos en Markdown, incluidas tablas convertidas a tablas Markdown, gracias a la ventana de contexto de hasta 40.960 tokens.
- Salida determinista en modo temperatura 0 con pensamiento desactivado, adecuada para pipelines automatizados.
- No soporta tool calling, agentes multi-paso, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso
- Ingesta automatizada de comunicados de resultados: el modelo convierte cada 8-K (exhibit EX-99.1) en un registro JSON con ingresos, beneficio neto y EPS, listo para cargar en un data warehouse financiero sin intervención manual.
- Construcción de series temporales financieras: al extraer trimestre y acumulado del ejercicio con el periodo de cierre, se pueden encadenar los registros de sucesivos comunicados para reconstruir la evolución trimestral de una compañía.
- Validación cruzada contra XBRL: el JSON extraído puede compararse con el 10-Q o 10-K presentado posteriormente para detectar discrepancias entre el comunicado de prensa y los estados financieros oficiales.
- Screener fundamental cuantitativo: procesar en lote los comunicados de un universo de empresas para alimentar filtros por crecimiento de ingresos, márgenes o evolución del EPS diluido.
- Automatización de research para analistas: generar resúmenes estructurados de cientos de comunicados por trimestre a un coste declarado de 0,59 USD por 1.000 documentos, frente a los 1,24-24,11 USD de las APIs comerciales comparadas.
- Monitorización de alertas en tiempo casi real: al desplegarse con vLLM sobre una H100 NVL, el adaptador puede integrarse en un pipeline que detecte comunicados nuevos en EDGAR y extraiga las cifras en minutos.
- Benchmarking interno de modelos de extracción: sirve como referencia reproducible para evaluar otros modelos o adaptadores sobre el dataset sec-earnings-bench.

## Benchmarks y rendimiento

| Dataset / split | Metrica | Resultado |
|---|---|---|
| Jinnn2001/sec-earnings-bench, config answers, split company_test | Share of graded figures correct (%) | 99,24 (657/662; IC 95 % [98,05, 100,00]) |
| Jinnn2001/sec-earnings-bench, config answers, split time_test | Share of graded figures correct (%) | 97,64 (1.699/1.740; IC 95 % [96,64, 98,57]) |

En el company test, el adaptador supera al modelo base Qwen3-8B en 10,12 puntos porcentuales (IC 95 % [+5,08, +15,58]), resultado primario pre-registrado. En el time test queda 1,78-1,95 puntos por detrás de GPT-6.1 Sol, Claude Haiku 5.5 y GPT-6 Luna, con intervalos de confianza del 95 % por debajo de cero. El coste declarado es de 0,59 USD por 1.000 comunicados en el time test, frente a 1,24-24,11 USD para esos modelos de API.

## Requisitos de hardware
- VRAM estimada: el adaptador LoRA añade un consumo mínimo; el modelo base Qwen3-8B en precisión BF16 requiere aproximadamente 16 GB de VRAM, y en cuantización de 8 bits o 4 bits puede reducirse sustancialmente (cifras no publicadas para este adaptador).
- GPU recomendadas: la evaluación de referencia se ejecutó en una NVIDIA H100 NVL. Para producción con contexto de 40.960 tokens se recomienda H100, A100 80 GB o L40S.
- GPU de consumo: Qwen3-8B en cuantización de 4 bits cabe en GPUs de 12-16 GB (RTX 4090, RTX 4080), aunque el adaptador se distribuye en safetensors y el flujo documentado usa vLLM, que no cubre todos los escenarios de consumo.
- Despliegue: vLLM 0.32.0 con `--enable-lora --max-lora-rank 16 --max-loras 1 --max-cpu-loras 1 --max-model-len 40960`. Los wheels de vLLM 0.32.0 requieren CUDA 13.0 y un driver NVIDIA compatible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento en time_test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| qwen3-8b-sec-earnings-lora | LoRA sobre Qwen3-8B | 8B (adaptador 0,2 GB) | 40.960 tokens | 97,64 % | apache-2.0 | Hugging Face |
| GPT-6.1 Sol | API propietaria | no disponible | no disponible | 1,78-1,95 puntos por encima | propietaria | API comercial |
| Claude Haiku 5.5 | API propietaria | no disponible | no disponible | 1,78-1,95 puntos por encima | propietaria | API comercial |
| GPT-6 Luna | API propietaria | no disponible | no disponible | 1,78-1,95 puntos por encima | propietaria | API comercial |

La comparación relevante es económica: el adaptador es entre 2 y 41 veces más barato por documento que las APIs citadas, a costa de 1,78-1,95 puntos de precisión en el test temporal.

## Limitaciones y advertencias
- Especialización estrecha: solo extrae tres magnitudes (ingresos, beneficio neto, EPS diluido) de comunicados de resultados en inglés; no es un modelo de propósito general.
- Solo inglés: no se ha validado para comunicados en otros idiomas.
- Rendimiento inferior a los modelos de API comparados en el time test (97,64 % frente a los líderes), con intervalos de confianza que excluyen el empate.
- Dependencia de la calidad del Markdown de entrada: si el comunicado no incluye la tabla de la cuenta de resultados, la model card indica que se le añade el exhibit correspondiente; entradas mal formateadas pueden degradar la extracción.
- Riesgo de alucinación en cifras: aunque el protocolo de evaluación es estricto, no se documentan tasas de error por tipo de cifra ni análisis de fallos.
- Sesgos no documentados: la model card no analiza sesgos por sector, tamaño de empresa o formato de presentación.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero debe respetarse también la licencia del modelo base Qwen3-8B.
- Requisitos de despliegue estrictos: la configuración de referencia exige vLLM 0.32.0, CUDA 13.0 y pensamiento desactivado con temperatura 0; desviarse de este protocolo puede alterar los resultados.
- Métricas no verificadas: los resultados del model-index figuran con `verified: false`, es decir, declarados por el autor.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Jinnn2001/qwen3-8b-sec-earnings-lora
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Dataset sec-earnings-bench: https://huggingface.co/datasets/Jinnn2001/sec-earnings-bench
- Repositorio del benchmark en GitHub: https://github.com/jinnn11/sec-earnings-bench
- Resultados completos del test: https://github.com/jinnn11/sec-earnings-bench/blob/main/results/test_results.md
- Explorador de resultados (Space): https://huggingface.co/spaces/Jinnn2001/sec-earnings-explorer

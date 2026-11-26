# lohithp04/faultiq-qwen2.5-3b-mlx-lora

## Resumen

FaultIQ es un adaptador LoRA de 6,57 MB publicado por lohithp04 que convierte el modelo `mlx-community/Qwen2.5-3B-Instruct-4bit` en un clasificador de triaje de logs de infraestructura cloud. Dado un registro de log, devuelve JSON estricto con tres claves: `category` (una de cinco etiquetas fijas: Authentication failure, Database connection failure, Memory exhaustion, Network timeout o Configuration error), `reason` y `confidence`. El adaptador se entrenó con QLoRA sobre un Apple M4 de 16 GB usando `mlx-lm` y el dataset `lohithp04/faultiq-cloud-logs-mlx`.

El interés del modelo reside en su especialización extrema y su huella mínima: solo 1.638.400 parámetros entrenables (0,053 % de los 3.090 millones del modelo base), con rango r=8 y alpha=16 aplicados únicamente a las proyecciones de atención de las últimas 16 de las 36 capas del transformer. Su objetivo es resolver un problema concreto de AIOps: distinguir fallos de conexión a base de datos de timeouts de red y de errores de configuración, que los modelos genéricos confunden con frecuencia.

La relevancia actual viene de sus resultados: sobre 74 logs reales retenidos pasa de 93,2 % de accuracy del modelo base en zero-shot a 100 %, y sobre 50 logs adversariales sube de 84 % a 90 % (92 % con los ajustes recomendados). El mayor salto está en la validez del esquema JSON, que pasa del 4,8 % al 99,2 % (100 % con decodificación greedy y penalización de repetición).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer decoder-only Qwen2.5-3B con cuantización 4-bit |
| Parametros totales | 3,09 mil millones (modelo base); adaptador LoRA: 1.638.400 parámetros entrenables |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-3B) |
| Tipos de cuantizacion | base en 4-bit (MLX); adaptador en float32 (128 tensores) |
| Idiomas soportados | en (inglés) |
| Licencia | qwen-research (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (`adapters.safetensors`, 6,57 MB) + `adapter_config.json` |
| Rango / alpha LoRA | r = 8, α = 16 (scale = 2,0) |
| Módulos objetivo | `self_attn.{q,k,v,o}_proj` (solo atención) |
| Capas adaptadas | últimas 16 de 36 bloques (64 capas LoRA) |
| Librería | mlx (Apple Silicon) |
| Dataset de entrenamiento | `lohithp04/faultiq-cloud-logs-mlx` |

## Arquitectura y entrenamiento

El adaptador aplica LoRA sobre un Qwen2.5-3B-Instruct congelado y cuantizado a 4-bit, en el formato nativo de MLX para Apple Silicon. Solo se entrenan las proyecciones de query, key, value y output de la atención en las últimas 16 capas del transformer, con rango 8 y alpha 16, lo que da 64 capas LoRA y 1.638.400 parámetros entrenables. El entrenamiento se realizó con QLoRA en un Apple M4 con 16 GB de memoria unificada mediante `mlx-lm`, sobre el dataset `faultiq-cloud-logs-mlx`.

El adaptador se entrenó con un system prompt exacto que define las cinco categorías y el formato JSON de salida; la model card insiste en que ese prompt debe reproducirse byte a byte en inferencia. El repositorio incluye `winner_metadata.json`, que registra el proceso de barrido de hiperparámetros, las puntuaciones de benchmark y el SHA-256 de los pesos. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset más allá de su nombre y propósito.

## Capacidades

- Clasificación de logs de infraestructura cloud en cinco categorías cerradas: Authentication failure, Database connection failure, Memory exhaustion, Network timeout y Configuration error.
- Generación de JSON estricto con las claves `category`, `reason` y `confidence`, con validez de esquema del 99,2 % (100 % con los ajustes recomendados).
- Diferenciación fina entre timeouts de base de datos (Postgres `i/o timeout`, `pymongo ServerSelectionTimeoutError`, HikariCP, ioredis `ETIMEDOUT`) y timeouts de red.
- Distinción entre errores de configuración y síntomas de autenticación o timeout (por ejemplo, secretos de Kubernetes ausentes que provocan timeouts de montaje de volumen).
- Generación de una justificación textual breve en el campo `reason` que explica la clasificación.
- Salida de una puntuación de confianza entre 0 y 1 para enrutar casos dudosos a revisión humana.
- No soporta tool calling, agentes, visión, audio ni modo thinking; es un clasificador especializado de un solo turno.
- Capacidad multilingüe limitada al inglés, según la etiqueta de idioma del repositorio.

## Casos de uso

- Triaje automático de alertas en producción: cada log entrante se clasifica en una de las cinco categorías y se enruta al equipo correspondiente (DBA, red, seguridad o plataforma) según la etiqueta y la confianza devueltas.
- Enriquecimiento de pipelines de observabilidad: integrado como paso previo a un sistema de tickets o a PagerDuty, el adaptador añade categoría y justificación a cada evento antes de la agregación, reduciendo el ruido de alertas mal clasificadas.
- Diagnóstico de fallos de conexión a base de datos: el adaptador distingue timeouts de conexión (HikariCP, pymongo, ioredis) de fallos de red genéricos, lo que permite dirigir la investigación al pool de conexiones o al cortafuegos correcto.
- Detección de errores de configuración en Kubernetes: clasifica eventos como secretos ausentes o volúmenes mal montados que se manifiestan como timeouts, evitando que se escalen como incidencias de red.
- Preprocesado para modelos mayores: usar el adaptador como clasificador barato y determinista que filtra y etiqueta logs antes de pasarlos a un LLM de mayor tamaño para análisis profundo, reduciendo coste y latencia del pipeline.
- Servicio local en estaciones de trabajo Apple Silicon: con unos 1,7 GB de memoria GPU y 1,1 s por log (P50) en un M4, puede desplegarse como endpoint FastAPI local u OpenAI-compatible para pruebas y desarrollo sin GPU dedicada.
- Generación de datos etiquetados: la salida JSON estructurada con confianza permite construir datasets de entrenamiento o evaluar la calidad de clasificadores existentes en pipelines de AIOps.

## Benchmarks y rendimiento

Resultados sobre 124 filas retenidas, con el mismo prompt y decodificación greedy para ambos modelos:

| Métrica | Base Qwen2.5-3B (zero-shot) | Este adaptador |
|---|---|---|
| `test` (74 logs reales): accuracy / macro F1 | 93,2 % / 0,928 | 100 % / 1,000 |
| `gold_benchmark` (50 logs adversariales): accuracy / macro F1 | 84,0 % / 0,834 | 90,0 % / 0,908 (92,0 % con ajustes recomendados) |
| Boundary-trap accuracy (gold) | 70 % | 95 % |
| JSON válido según esquema | 4,8 % | 99,2 % (100 % con ajustes recomendados) |
| Recall de DB-connection (gold) | 50 % | 80 % |

Rendimiento medido en Apple M4: aproximadamente 1,1 s por log (P50), 53 tokens/s y unos 1,7 GB de memoria GPU para base más adaptador.

## Requisitos de hardware

- Memoria: aproximadamente 1,7 GB de memoria GPU para el modelo base 4-bit más el adaptador, medido en Apple M4.
- Hardware: requiere Apple Silicon (MLX); no funciona en GPU NVIDIA ni CPU x86 con esta librería.
- Cabe holgadamente en cualquier Mac con chip M1 o superior y 16 GB de memoria unificada.
- Despliegue: `mlx-lm` (Python y CLI). El repositorio GitHub del autor incluye un servidor FastAPI con endpoint compatible con OpenAI.
- Latencia y throughput: 1,1 s por log (P50) y 53 tokens/s en M4.
- Ajustes recomendados de inferencia: `temp=0.0` (greedy), `repetition_penalty=1.1` sobre los últimos 20 tokens, `max_tokens=96` y el system prompt exacto de entrenamiento.
- Validación de salida: parsear el JSON, exigir que `category` pertenezca a las cinco etiquetas y que `0 ≤ confidence ≤ 1`; cualquier otra salida debe enviarse a revisión humana.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FaultIQ Qwen2.5-3B MLX LoRA | 3,09B base + 1,64M adaptador | no disponible | Clasificación de logs en 5 categorías, JSON estricto | qwen-research | Hugging Face, MLX |
| Qwen2.5-3B-Instruct-4bit (base) | 3,09B | no disponible | Instrucciones generales, multilingüe | qwen-research | Hugging Face, MLX |
| Clasificadores de logs basados en reglas o regex | no aplica | no aplica | Coincidencia de patrones | variable | ampliamente disponibles |
| LLMs generales de mayor tamaño (p. ej. 7B-70B) | 7B-70B | variable | Instrucciones generales, requieren prompting para clasificar | variable | Hugging Face, APIs |

El adaptador supera claramente a su base en la tarea específica (100 % frente a 93,2 % en logs reales; 99,2 % frente a 4,8 % en validez JSON), a costa de perder generalidad: solo clasifica en cinco categorías y solo en inglés. Frente a clasificadores basados en reglas, ofrece justificación textual y confianza calibrada, pero requiere Apple Silicon y un prompt fijo. No se dispone de datos comparativos con otros adaptadores de clasificación de logs en la información proporcionada.

## Limitaciones y advertencias

- Solo clasifica en cinco categorías cerradas; cualquier log fuera de ese dominio se forzará a una de ellas o producirá una salida inválida.
- Entrenado y evaluado únicamente en inglés.
- Requiere Apple Silicon y la librería MLX; no es portable a GPU NVIDIA ni a CPU x86 sin reconversión.
- El system prompt debe reproducirse byte a byte; variaciones en el prompt pueden degradar la precisión y la validez del JSON.
- La licencia qwen-research impone restricciones al uso comercial; conviene revisar los términos del modelo base Qwen2.5-3B-Instruct antes de desplegarlo en producción.
- Riesgo de alucinación en el campo `reason`: la justificación puede ser plausible pero incorrecta aunque la categoría sea acertada.
- Se observó un bucle de repetición en un log de benchmark, mitigado con `repetition_penalty=1.1`; sin ese ajuste la salida puede no ser válida.
- El modelo base está cuantizado a 4-bit, lo que puede introducir pérdida de precisión frente a la versión en float16.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta; no hay validación independiente de los resultados reportados por el autor.
- Los benchmarks se midieron sobre 124 filas; el tamaño muestral es pequeño y los resultados pueden no generalizar a otros entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lohithp04/faultiq-qwen2.5-3b-mlx-lora
- Modelo base: https://huggingface.co/mlx-community/Qwen2.5-3B-Instruct-4bit
- Dataset de entrenamiento: https://huggingface.co/datasets/lohithp04/faultiq-cloud-logs-mlx
- Repositorio GitHub (entrenamiento, evaluación, FastAPI): https://github.com/04-lohith/FaultIQ
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
- Licencia Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE

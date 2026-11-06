# agastyasridharan/olens-qwen3.6-27b-userthink-s225

## Resumen

O-lens (Qwen3.6-27B) en su variante user/template/think-block, checkpoint 225, es un adaptador LoRA de interpretabilidad entrenado sobre Qwen/Qwen3.6-27B. No es un modelo generativo de proposito general, sino un *activation verbalizer*: un modulo que, dada una activacion interna (un vector de salida de bloque en capas concretas), produce una lista de conceptos en texto que describen esa activacion. El autor es agastyasridharan y el trabajo se apoya en el codigo y el reward de Agam Bhatia (`agu18dec/olens_and_ar`).

El adaptador se entrena mediante GRPO continuado desde el checkpoint `olens_s3d_rl600`, con el objetivo de que la "lente" quede dentro de distribucion no solo en respuestas del asistente, sino tambien en tokens de usuario, tokens de plantilla de chat, el bloque `<think></think>` vacio (pensamiento desactivado), razonamiento real, el cierre `</think>` y la respuesta posterior al razonamiento. El modelo base Qwen3.6-27B aporta la arquitectura y el conocimiento linguistico; el LoRA aporta exclusivamente la capacidad de verbalizar activaciones.

Su relevancia es de nicho pero clara para investigacion en interpretabilidad mecanicista: permite inspeccionar que representa el modelo en posiciones que los verbalizers anteriores cubrian mal (prompt, plantilla, bloques de pensamiento), con metricas de FVE (fraction of variance explained) reportadas por tipo de posicion y comparadas de forma pareada contra el checkpoint de partida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen/Qwen3.6-27B; verbalizer de activaciones |
| Parametros totales | no disponible (adaptador LoRA; el repo ocupa 17,7 GB incluyendo checkpoints, estado de optimizador y datos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.6-27B, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (el prompt de lectura esta en ingles; los datos de entrenamiento son WildChat y FineWeb-Edu) |
| Licencia | no disponible (el codigo de O-lens de Agam Bhatia es MIT; el componente `mytorch-lightning` incluido esta sin licencia y se omite del repo) |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`), libreria `peft` |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.6-27B y actua como verbalizer de activaciones. El contrato de lectura es fijo: se toma la salida de bloque (indexado desde cero) en las capas 20 a 60 con paso 4; se sustituye el embedding de entrada del token marcador ㈜ (id 158983) por `16000 * h / ||h||`, donde `h` es la activacion; y se presenta el prompt "An activation vector from layer {layer} of a language model is enclosed in activation tags: `<activation>㈜</activation>`. Produce distinct concepts that encode this activation, each as a '- ' bullet on its own line.", renderizado con `enable_thinking=False`. La salida esperada son hasta `k_max = 4` conceptos en formato de vinetas.

El entrenamiento es GRPO continuado desde `olens_s3d_rl600` (commit `c95215d` de `agu18dec/olens_and_ar`). La recompensa es la FVE conjunta de las vinetas bajo el AR de etiquetas de prompt congelado (`ar_ptag_pooled`), con un whitener pooled reconstruido con la receta de Agam (ridge 0.1). Los datos combinan 12.000 prompts de WildChat (split `ao_train`) y rollouts de Qwen3.6-27B, con una mezcla por tipo de posicion: asistente 0,35, usuario 0,20, think 0,20, post-razonamiento 0,10, plantilla 0,07, think vacio 0,05 y cierre `</think>` 0,03. Hiperparametros: 8 prompts x 64 muestras por paso, lr 5e-5, KL β 0,02 contra rl600, temperatura 1,0 y maximo 128 tokens nuevos. El entrenamiento se detuvo en el paso 245 de 300 planificados por meseta desde aproximadamente el paso 175; se publica el checkpoint 225. El escenario es de un solo turno y sin system prompt.

## Capacidades

- Verbalizacion de activaciones internas: dado un vector de capa (20-60, paso 4), genera hasta 4 conceptos en vinetas que describen su contenido semantico.
- Cobertura de posiciones ampliada respecto a rl600: tokens de usuario, tokens de plantilla de chat, bloque `<think></think>` vacio, razonamiento real, cierre `</think>` y respuesta posterior al razonamiento.
- Funcionamiento en dos regimenes: pensamiento desactivado (`off`) y pensamiento activado (`think`), evaluados por separado.
- Salida estructurada y parseable: lista de vinetas `- `, una por linea, lo que facilita el analisis automatico.
- No es un modelo de chat ni de generacion libre: no se debe usar para responder preguntas, programar ni razonar sobre tareas del usuario.
- No soporta tool calling, function calling, agentes ni multi-step reasoning como modelo de proposito general; esas capacidades residen en el modelo base y no son el objeto de este adaptador.
- Capacidades multilingues: no documentadas para el verbalizer.

## Casos de uso

- Analisis de interpretabilidad en posiciones de prompt: aplicar la lente a las activaciones de los tokens del usuario para identificar que conceptos codifica el modelo antes de responder; es el caso para el que se entreno la variante, con FVE de 0,260 en `off` y 0,273 en `think`.
- Auditoria de tokens de plantilla: inspeccionar que representan los tokens de la plantilla de chat (FVE 0,285 en `off`, 0,243 en `think`), util para detectar informacion codificada en el formato y no en el contenido.
- Estudio del bloque de pensamiento vacio: caracterizar el estado del modelo cuando el pensamiento esta desactivado (FVE 0,188), relevante para comparar el regimen `off` frente a `think`.
- Analisis de cadenas de razonamiento: verbalizar activaciones durante el razonamiento real (FVE 0,324) y en la respuesta posterior (FVE 0,334) para estudiar como se transforma la representacion entre fases.
- Deteccion de estados de cierre: examinar el token `</think>` (FVE 0,144) para entender la senal interna de transicion del razonamiento a la respuesta.
- Investigacion reproducible: el repo incluye checkpoints cada 25 pasos, estado del optimizador, whiteners por capa, momentos, datos RL en parquet, activaciones capturadas, scripts de pipeline y logs, lo que permite reanudar o reevaluar el entrenamiento sin reconstruir la infraestructura.
- Evaluacion comparada de verbalizers: usar las tablas de FVE pareadas (delta con IC 95% y tasa de victoria por item) como referencia metodologica para nuevos adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la informacion disponible; no aplican a un verbalizer de activaciones. La evaluacion publicada mide FVE por tipo de posicion.

FVE en held-out (64 items por tipo):

| Tipo | rl600 (paso 0) | Este (paso 225) |
|---|---|---|
| Respuesta del asistente | 0,346 | 0,358 |
| Tokens de usuario | 0,259 | 0,277 |
| Tokens de plantilla | 0,230 | 0,258 |
| Bloque think vacio | 0,182 | 0,198 |
| Razonamiento real | 0,311 | 0,325 |
| Cierre `</think>` | 0,123 | 0,129 |
| Respuesta post-razonamiento | 0,325 | 0,337 |
| Global | 0,254 | 0,269 |

Evaluacion completa (unas 500 celdas por item, media de 4 muestras a T=1):

| Celda | n | rl600 | Paso 225 | Delta | Victorias |
|---|---|---|---|---|---|
| off: respuesta del asistente | 499 | 0,361 | 0,372 | +0,011 ± 0,002 | 67% |
| off: tokens de usuario | 499 | 0,237 | 0,260 | +0,023 ± 0,002 | 85% |
| off: tokens de plantilla | 499 | 0,265 | 0,285 | +0,021 ± 0,002 | 83% |
| off: bloque think vacio | 499 | 0,176 | 0,188 | +0,012 ± 0,001 | 87% |
| off: ultimo token del prompt | 499 | 0,589 | 0,596 | +0,007 ± 0,002 | 65% |
| think: tokens de usuario | 500 | 0,248 | 0,273 | +0,025 ± 0,003 | 83% |
| think: tokens de plantilla | 500 | 0,226 | 0,243 | +0,017 ± 0,002 | 83% |
| think: razonamiento | 500 | 0,306 | 0,324 | +0,018 ± 0,002 | 80% |
| think: cierre `</think>` | 481 | 0,136 | 0,144 | +0,008 ± 0,001 | 87% |
| think: respuesta post-razonamiento | 481 | 0,322 | 0,334 | +0,012 ± 0,002 | 70% |

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explicita. Requiere cargar el modelo base Qwen3.6-27B (pesos completos) mas el adaptador LoRA; en fp16 el base implica del orden de 54 GB, por lo que no cabe en GPUs de consumo sin cuantizacion.
- GPU recomendadas: no especificadas por el autor. Por tamano del base, se requiere una GPU de 80 GB (A100, H100) para fp16, o varias GPUs con sharding.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en fp16; requeriria cuantizacion del base, no documentada para este adaptador.
- Despliegue: no se documentan opciones de serving (vLLM, llama.cpp, Ollama, TGI) para el verbalizer. El pipeline del autor usa vLLM para generar los rollouts del base y scripts propios en `code/q36ut/` para captura, whitening y evaluacion.
- Latencia y throughput: no disponibles. La generacion esta limitada a 128 tokens nuevos por verbalizacion durante el entrenamiento.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Cobertura de posiciones | FVE global | Licencia |
|---|---|---|---|---|---|
| O-lens Qwen3.6-27B userthink s225 (este) | Qwen3.6-27B | LoRA verbalizer | Asistente, usuario, plantilla, think vacio, razonamiento, cierre, post-razonamiento | 0,269 | no disponible |
| olens_s3d_rl600 (`agu18dec/olens_and_ar`) | Qwen3.6-27B | LoRA verbalizer | Principalmente respuesta del asistente | 0,254 | no disponible (codigo O-lens MIT) |
| Verbalizers de activaciones sobre otros modelos base | distintos | LoRA / lineal | no disponible | no disponible | no disponible |

La comparacion directa disponible es unicamente contra su checkpoint de partida rl600, con mejora pareada en las 10 celdas evaluadas. No se dispone de datos de otros verbalizers comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat: usarlo para responder preguntas o generar codigo produce resultados sin sentido; su unica funcion es verbalizar activaciones segun el contrato de lectura.
- Dependencia estricta del contrato: el prompt exacto, el token marcador ㈜ (158983), la sustitucion del embedding por `16000 * h / ||h||` y el rango de capas 20-60 con paso 4 deben respetarse; cualquier desviacion invalida la calibracion.
- Sesgos de los datos: prompts de WildChat y FineWeb-Edu, con los sesgos propios de conversaciones reales y de contenido web filtrado; pueden reflejarse en los conceptos generados.
- Riesgo de alucinacion: la salida son conceptos plausibles, no una explicacion causal verificada de la activacion; un FVE de 0,269 global indica que se explica una minoria de la varianza.
- Cobertura limitada: escenario de un solo turno y sin system prompt; el rendimiento en conversaciones multiturno o con system prompt no esta evaluado y probablemente degrade.
- Idioma: el prompt de lectura esta en ingles y no se documentan capacidades multilingues del verbalizer.
- Licencia: no disponible para el adaptador; el codigo base de O-lens es MIT, pero el componente `mytorch-lightning` incluido en el repo original esta sin licencia y se omite, lo que puede complicar la reproducibilidad completa. Verificar terminos antes de cualquier uso comercial.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, checkpoint intermedio (225 de 245 efectivos) de un entrenamiento detenido por meseta; no es un artefacto validado en produccion.
- El repo de 17,7 GB incluye datos, activaciones y estado del optimizador; el adaptador utilizable es solo una parte.

## Enlaces

- Hugging Face: https://huggingface.co/agastyasridharan/olens-qwen3.6-27b-userthink-s225
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio del adaptador de partida y del AR: `agu18dec/olens_and_ar` (commit `c95215d`)
- Codigo O-lens de Agam Bhatia (MIT), incluido en `code/olens_draft_patched/`
- Dataset WildChat: https://huggingface.co/datasets/allenai/WildChat (ODC-BY)
- FineWeb-Edu (ODC-BY): no disponible el enlace exacto en la informacion proporcionada

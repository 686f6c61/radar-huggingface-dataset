# bdsaglam/Qwen3.5-4B-ArgGYM-GRPO-step140-LoRA

## Resumen

Qwen3.5-4B-ArgGYM-GRPO-step140-LoRA es un adaptador LoRA de bajo rango (rank 64, alpha 32) entrenado sobre el modelo base Qwen/Qwen3.5-4B mediante aprendizaje por refuerzo con el algoritmo GRPO. Lo desarrolla el usuario de Hugging Face bdsaglam y su proposito es especializar al modelo base en tareas de argumentacion formal, en concreto teorias ASPIC+ bajo semantica grounded. No es un modelo completo, sino un adaptador PEFT que debe cargarse junto al modelo base en la revision `851bf6e`.

El adaptador cubre todas las proyecciones de atencion, atencion lineal y MLP de las 32 capas del modelo de lenguaje, lo que suma 248 modulos, y deja intacto el torre de vision. El entrenamiento se realizo con verl v0.9.1 sobre el benchmark ArgGYM, que agrupa 82 celdas tarea/nivel con 8.200 problemas de dificultad 1 a 12. El checkpoint publicado corresponde al paso 140, el de mejor puntuacion en el conjunto de desarrollo hasta la fecha, dentro de una ejecucion que continua hasta el paso 200.

Su relevancia es acotada pero clara: demuestra como el RL con GRPO y LoRA puede elevar de forma sustancial una capacidad concreta y poco comun (razonamiento argumentativo formal) en un modelo pequeno de 4B, pasando de 0,309 a 0,613 de tasa de exito en el dev set. No obstante, es un artefacto de investigacion con cero descargas y sin resultados en test, por lo que debe tratarse como material experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3.5-4B con atencion y atencion lineal |
| Parametros totales | No disponible (adaptador de 0,5 GB; el modelo base es de 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explicita; el entrenamiento usa un tope de 40.960 tokens y la evaluacion permite hasta 65.536 tokens de salida |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en fp32; el base en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-4B, un transformer multimodal (el codigo de carga usa `AutoModelForImageTextToText`) con 32 capas de lenguaje que combinan atencion estandar y atencion lineal. El LoRA tiene rango 64, alpha 32 y se entrena en fp32, cubriendo las 248 proyecciones de atencion, atencion lineal y MLP; el torre de vision queda sin adaptar, por lo que la especializacion afecta unicamente al razonamiento textual.

El entrenamiento emplea GRPO con verl v0.9.1 y modo thinking activado. Los datos provienen de ArgGYM, un benchmark de tareas de argumentacion formal (teorias ASPIC+ bajo semantica grounded) que incluye ataque, defensa, ataque/defensa, contraargumento simple y estricto, cadenas de afirmaciones, construccion de preferencias, consultas de estado y semantica, diagnostico de derrotas, formalizacion y perturbacion, en niveles de dificultad 1 a 12. Se usan 82 celdas tarea/nivel (8.200 problemas) con un curriculo que prioriza las celdas que el modelo resuelve aproximadamente la mitad de las veces. La recompensa es 1 para respuesta correcta y 0 en caso contrario, con recompensa parcial de 0,3 por la fraccion correcta en cuatro tareas (status_query, defeat_diagnosis, formalization, perturbation); una completion truncada en el tope de 40.960 tokens obtiene 0.

La optimizacion usa 18 problemas x 16 muestras por paso, sin penalizacion KL. Los pasos 1-100 usan learning rate 3e-5 con decaimiento coseno hasta 3e-6 y warmup de 3 pasos; los pasos 101-200 reanudan desde el adaptador y el estado del optimizador del paso 100 con learning rate 1e-5, sin warmup y coseno hacia 1e-6 sobre 200 pasos (9,1e-6 en el paso 140). Un detalle tecnico relevante: los rollouts se muestrean con temperatura 1.0, top-p 0.95, top-k 20 y presencia 1.5, y el entrenador calcula sus log-probabilidades tras la misma mascara de top-k/top-p y penalizacion de presencia; sin esa coincidencia la entropia derivaba al alza y las ejecuciones se volvian inestables. Con ella, la entropia se mantuvo entre 0,56 y 0,61 hasta el paso 140.

## Capacidades

- Razonamiento argumentativo formal sobre teorias ASPIC+ bajo semantica grounded: ataque, defensa, ataque/defensa y contraargumento (simple y estricto).
- Resolucion de consultas de estado y semantica, diagnostico de derrotas y construccion de preferencias.
- Formalizacion de argumentos y perturbacion de teorias, con recompensa parcial por fraccion correcta.
- Cadenas de afirmaciones (claim chains) y tareas de dificultad creciente hasta nivel 12.
- Modo thinking activado durante el entrenamiento, orientado a razonamiento extendido.
- Capacidad multimodal heredada del modelo base (torre de vision intacta), aunque no evaluada ni entrenada en este adaptador.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso especifico para este checkpoint.

## Casos de uso

- Analisis de argumentacion juridica: el adaptador puede evaluar teorias ASPIC+ y determinar que argumentos sobreviven bajo semantica grounded, util para prototipos de razonamiento normativo donde se requiere justificar que afirmaciones quedan derrotadas.
- Verificacion de formalizaciones: dado un argumento en lenguaje natural y su formalizacion, el modelo puede comprobar consistencia y detectar errores de formalizacion, aprovechando su recompensa parcial en la tarea `formalization`.
- Diagnostico de derrotas: en sistemas de debate o deliberacion, el modelo identifica por que un argumento es derrotado por otro, lo que sirve para generar explicaciones trazables en herramientas de argumentacion asistida.
- Construccion de preferencias: en motores de argumentacion que necesitan ordenar argumentos por preferencia, el adaptador puede proponer relaciones de preferencia coherentes con la teoria dada.
- Investigacion en RL aplicado a razonamiento: sirve como referencia reproducible de como GRPO con LoRA y recompensas parciales mejora una capacidad formal concreta en un modelo de 4B, util para estudiar estabilidad de entropia y esquemas de recompensa.
- Generacion de contrarargumentos estrictos: en entornos educativos de logica o debate, el modelo produce contraargumentos que respetan las reglas estrictas del formalismo, con una tasa de exito del 0,83 en el dev set.
- Evaluacion de robustez ante perturbaciones: la tarea de perturbacion permite probar como responde el modelo cuando se altera ligeramente una teoria, util para validar la sensibilidad de sistemas argumentativos.

## Benchmarks y rendimiento

Tasa de exito en un conjunto de desarrollo reservado de 96 problemas ArgGYM (8 por tarea, niveles 1-8), con 8 muestras por problema y hasta 65.536 tokens de salida:

| Modelo / checkpoint | Exito en dev |
|---|---|
| Qwen3.5-4B (base) | 0,309 |
| Step 20 | 0,418 |
| Step 40 | 0,447 |
| Step 60 | 0,527 |
| Step 80 | 0,569 |
| Step 100 | 0,539 |
| Step 120 | 0,572 |
| Step 140 (este checkpoint) | 0,613 |

La mejora sobre el modelo base es de +0,31 (IC 95% por bootstrap pareado: +0,25 a +0,37) y sobre el paso 80, el mejor anterior, de +0,04 (IC +0,01 a +0,08). Por tarea, el paso 140 obtiene 0,94 en ataque/defensa, 0,91 en contraargumento, 0,88 en ataque, 0,84 en defensa y 0,83 en contraargumento estricto. Formalizacion (0,38) y perturbacion (0,20) mejoran respecto al paso 80, mientras que consultas de semantica (0,25) bajan frente al 0,34 del paso 80. Diagnostico de derrotas (0,38) y construccion de preferencias (0,48) siguen cerca del modelo base. No se reportan resultados en el conjunto de test.

## Requisitos de hardware

- El adaptador pesa 0,5 GB; el modelo base Qwen3.5-4B en bfloat16 requiere aproximadamente 8 GB de VRAM solo para pesos, mas memoria para KV cache y activaciones.
- En cuantizacion de 4 bits el base puede caber en GPUs consumer de 8-12 GB (RTX 3060 Ti, RTX 4070), aunque no se documentan cuantizaciones especificas del adaptador.
- En bfloat16 se recomienda una GPU con 16-24 GB (RTX 4090, A10, L4) para inferencia comoda; para servir con vLLM y LoRA se necesita ademas memoria para el adaptador y el rank maximo 64.
- Despliegue con vLLM: servir el base con `--enable-lora --max-lora-rank 64` y pasar el adaptador como modulo LoRA. Tambien es posible cargarlo con transformers + peft segun el ejemplo de la model card.
- El presupuesto de salida debe ser amplio: las respuestas promedian unos 25.000 tokens en dev, por lo que conviene reservar al menos 40.000-65.000 tokens de salida.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-ArgGYM-GRPO-step140-LoRA | Adaptador sobre 4B | No disponible (tope de entrenamiento 40.960) | LoRA + GRPO para argumentacion formal | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.5-4B (base) | 4B | No disponible | Modelo multimodal generalista | Apache 2.0 (segun el base) | Hugging Face |
| Checkpoints previos del mismo run (step 60/80/100/120) | Adaptador sobre 4B | No disponible | Mismo enfoque, menor exito en dev (0,527-0,572) | Apache 2.0 | Hugging Face |
| Otros adaptadores de argumentacion comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre modelos alternativos de la misma categoria (adaptadores de argumentacion formal sobre modelos de 4B) para una comparacion mas amplia.

## Limitaciones y advertencias

- No se reportan resultados en el conjunto de test; solo hay evaluacion en dev.
- El entrenamiento continua hasta el paso 200, por lo que un checkpoint posterior podria sustituir a este.
- El conjunto de dev es pequeno (96 problemas), con ruido por tarea de aproximadamente ±0,1.
- El modelo se entreno unicamente en ArgGYM; su comportamiento en otras tareas no se ha evaluado para este checkpoint.
- Las respuestas son muy largas (unas 25.000 tokens de media en dev), lo que encarece la inferencia y exige presupuestos de salida de 40.000-65.000 tokens.
- Riesgo de alucinacion no cuantificado; al ser un adaptador de investigacion sin evaluacion externa, no se recomienda su uso en produccion sin validacion propia.
- Sesgos conocidos: no documentados por el autor.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-4B, que deben verificarse por separado.
- El adaptador no modifica el torre de vision; las capacidades multimodales no estan especializadas ni evaluadas.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion de la comunidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/bdsaglam/Qwen3.5-4B-ArgGYM-GRPO-step140-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint step 60: https://huggingface.co/bdsaglam/Qwen3.5-4B-ArgGYM-GRPO-step60-LoRA
- Checkpoint step 80: https://huggingface.co/bdsaglam/Qwen3.5-4B-ArgGYM-GRPO-step80-LoRA
- Checkpoint step 100: https://huggingface.co/bdsaglam/Qwen3.5-4B-ArgGYM-GRPO-step100-LoRA
- Repositorio de verl: https://github.com/volcengine/verl

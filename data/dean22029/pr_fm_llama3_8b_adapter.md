# dean22029/pr_fm_llama3_8b_adapter

## Resumen

`dean22029/pr_fm_llama3_8b_adapter` es un adaptador QLoRA (PEFT/LoRA) sobre `meta-llama/Llama-3.1-8B-Instruct` que resuelve una única tarea: predecir el resultado de un experimento conjoint de elección forzada. Dados el contexto del estudio, las características del encuestado y dos perfiles (A y B), el modelo puntúa cuál de los dos eligió ese encuestado. No es un modelo conversacional ni de propósito general: está ajustado para emitir un único token de respuesta, `A` o `B`.

Lo desarrolla el usuario dean22029 como baseline de investigación en ciencia política computacional, entrenado sobre 115 experimentos conjoint publicados procedentes del bundle de datos `preference_fm` (127 experimentos, 115 utilizables). El conjunto de entrenamiento son 711.617 pares A/B y el adaptador es de rango 16 sobre siete matrices de proyección por capa del transformer denso del modelo base.

Su relevancia es metodológica más que de producto: los resultados publicados muestran que el ajuste fino mejora sobre todo la calibración (log loss 0,6800 frente a 1,0682 del base sin adaptador en `test_chrono`), mientras que la capacidad de discriminación del base en modo zeroshot ya era casi equivalente (AUC 0,612 del ajustado frente a 0,521 del zeroshot). Es, por tanto, una pieza útil para estudiar calibración, sesgo posicional y heterogeneidad entre experimentos, no un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1 8B Instruct) con adaptadores LoRA acoplados vía PEFT |
| Parametros totales | Modelo base de ~8 mil millones; recuento exacto de parametros del adaptador no disponible (repositorio de 0,2 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens (longitud maxima de secuencia usada en el entrenamiento). El modelo base declara 128.000 tokens, pero el adaptador no se entreno mas alla de 1.024 |
| Tipos de cuantizacion | Base en 4-bit NF4 con doble cuantizacion y computo en bf16 (configuracion de referencia para reproducir los numeros); adaptador LoRA en bf16. No se publican pesos GGUF |
| Idiomas soportados | No disponible (el autor no los declara; hereda las capacidades del modelo base) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only denso. El ajuste es QLoRA: el base se carga en 4-bit NF4 con doble cuantizacion mientras el computo se realiza en bf16. La configuracion LoRA es r=16, alpha=32 y dropout 0,05 sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El optimizador es `paged_adamw_8bit` con learning rate 1e-4, scheduler coseno y 3 % de warmup; batch por dispositivo de 4 con un batch efectivo de ~60 en A100 40 GB con DDP. Se completaron 6.000 pasos (0,51 epocas, parada por limite de pasos y no por convergencia de una epoca completa), con longitud maxima de secuencia de 1.024 tokens y la perdida enmascarada unicamente sobre el token de respuesta del asistente.

Los datos de entrenamiento son 711.617 pares A/B construidos a partir de 115 experimentos conjoint publicados procedentes del bundle `preference_fm`. La particion de entrenamiento incluye todos los experimentos con `experiment_year <= 2021`, un detalle critico para la comparabilidad. La exactitud de eleccion en validacion evoluciono de 0,624 en el paso 2.000 a 0,637 en el 4.000 y 0,643 en el 6.000, es decir, practicamente plana en las ultimas evaluaciones. El autor subraya dos puntos: el ajuste fino compra principalmente calibracion (devuelve la media de P(A) a ~0,5) y no discriminacion, y existe una fuerte heterogeneidad por experimento, con AUC individuales que van de por debajo del azar hasta ~0,94 en `test_chrono`. La innovacion tecnica relevante no esta en la arquitectura, sino en la convencion de puntuacion: una unica pasada forward sin generacion, tomando `logits[:, -1, :]`, indexando los ids de un solo token para `"A"` y `"B"` y aplicando softmax sobre esos dos logits.

## Capacidades

- Puntuacion de eleccion forzada binaria: devuelve P(A) frente a P(B) para un par de perfiles conjoint dado un contexto de estudio y un perfil de encuestado.
- Calibracion de probabilidades: tras el ajuste, la media de P(A) se situa cerca de 0,5, coherente con la tasa base del ~50 % del diseno.
- Modelado de atributos y niveles: procesa bloques de factores con sus niveles para cada opcion (formato `- <factor>: <level>`).
- Condicionamiento por covariables del encuestado: incorpora caracteristicas en formato `nombre: valor; nombre: valor; ...`, asi como pais y ano del estudio.
- Inferencia por pasada unica (sin generacion): apto para puntuar lotes grandes de pares con `padding_side="left"` y `add_generation_prompt=True`.
- No soporta tool calling ni function calling.
- No soporta flujos de agente ni razonamiento multi-paso: la salida es un unico token.
- No dispone de modo thinking, vision ni audio.
- Capacidades multilingues: no disponibles, no declaradas por el autor.
- Generacion de texto libre, codigo o matematicas: no aplicable, fuera del alcance del adaptador.

## Casos de uso

- Baseline academico en ciencia politica computacional: sirve como referencia reproducible para comparar nuevos modelos de eleccion conjoint contra un punto de partida documentado (115 experimentos, splits publicados en `SPLITS.md` y `splits_summary.csv`).
- Simulacion de encuestados sinteticos para pre-test de disenos: generar respuestas plausibles A/B sobre un diseno de atributos y niveles antes de invertir en trabajo de campo, teniendo en cuenta que la exactitud agregada ronda el 0,577-0,654 y varia mucho por experimento.
- Estudio de calibracion de LLM: comparar la distribucion de P(A) del modelo ajustado (log loss 0,6173-0,6800) con la del base zeroshot (1,0682-1,1652) para analizar como el ajuste repara la colapsacion hacia una sola letra.
- Analisis de sesgo posicional: la convencion de puntuacion exige aleatorizar la orientacion A/B o promediar ambos ordenes; es un caso de uso directo para medir la magnitud del sesgo de posicion residual.
- Auditoria de transferibilidad temporal: comparar el rendimiento en `test_chrono` (0,577 de exactitud) frente a `test_within` (0,654) para estudiar cuanto se degrada el modelo al generalizar a estudios posteriores.
- Docencia y replicacion en metodos cuantitativos: el pipeline incluido (`export_experiments.R`, `make_codebooks.py`, `build_dataset.py`, `eval_example.py`) permite reproducir de punta a punta el flujo de datos, siempre que el usuario aporte su propia copia del bundle, que no se redistribuye.
- Investigacion sobre heterogeneidad entre estudios: el desglose `by_experiment` permite identificar en que tipos de conjoint el modelo funciona (AUC hasta ~0,94) y en cuales queda por debajo del azar.

## Benchmarks y rendimiento

Evaluacion con una pasada forward por par (sin generacion) y base en 4-bit NF4. La tasa base de la etiqueta es ~50 % por construccion, de modo que el log loss nulo es 0,693 y la exactitud es exactitud de ganador del par. "zeroshot" es el mismo modelo base sin adaptador, sobre los mismos prompts.

| Split | Run | n pares | Accuracy | AUC | Log loss | Delta vs nulo | Brier |
|---|---|---|---|---|---|---|---|
| `test_chrono` | finetuned | 58.910 | 0,577 | 0,612 | 0,6800 | 0,0131 | 0,2431 |
| `test_chrono` | zeroshot | 58.910 | 0,502 | 0,521 | 1,0682 | -0,3751 | 0,3687 |
| `test_within` | finetuned | 61.120 | 0,654 | 0,715 | 0,6173 | 0,0758 | 0,2146 |
| `test_within` | zeroshot | 61.120 | 0,499 | 0,498 | 1,1652 | -0,4721 | 0,3885 |

Precision de eleccion en validacion durante el entrenamiento: 0,624 en el paso 2.000, 0,637 en el 4.000 y 0,643 en el 6.000. El repositorio incluye `log_history.json` con la perdida y las metricas de evaluacion paso a paso.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB para los pesos del base en 4-bit NF4 mas el adaptador en bf16, mas la cache KV y activaciones para secuencias de hasta 1.024 tokens. Cifra estimada, no publicada por el autor.
- Cabe en GPU de consumo: si, en tarjetas con 8-12 GB o mas (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090). Cargar el base en bf16 en lugar de 4-bit incrementa el consumo y, segun el autor, desplaza los numeros publicados.
- GPU de referencia en el entrenamiento: A100 40 GB con DDP, batch por dispositivo 4 y batch efectivo ~60.
- Opciones de despliegue: `transformers` + `peft` es la ruta documentada en `eval_example.py`. vLLM admite adaptadores LoRA, pero debe exponer los logits de los tokens `"A"` y `"B"` para respetar la convencion de puntuacion. Despliegues basados solo en generacion de texto (por ejemplo llama.cpp u Ollama) no reproducen la convencion sin conversiones adicionales, ya que el modelo no fue publicado en GGUF.
- Latencia y throughput: no se publican cifras. La evaluacion es de una sola pasada forward por par (sin decodificacion autoregresiva) sobre 58.910 y 61.120 pares, lo que en la practica hace que el coste dominante sea el prefill del prompt completo.
- Orden de carga obligatorio: cargar primero el modelo base y despues acoplar el adaptador; `adapter_config.json` apunta a `meta-llama/Llama-3.1-8B-Instruct`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de entrenamiento | Accuracy `test_within` | AUC `test_within` | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dean22029/pr_fm_llama3_8b_adapter` (finetuned) | Base ~8B + LoRA r=16 | 1.024 tokens | 0,654 | 0,715 | llama3.1 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| `meta-llama/Llama-3.1-8B-Instruct` zeroshot sobre los mismos prompts | ~8B | 1.024 tokens en esta evaluacion | 0,499 | 0,498 | llama3.1 | HuggingFace, acceso restringido (gated) |
| Otros adaptadores o modelos de eleccion conjoint comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo de tarea unica: no es un modelo conversacional de proposito general. Solo puntua elecciones forzadas A/B y su salida es un unico token.
- Rendimiento agregado modesto: en `test_chrono` la exactitud es 0,577 y el AUC 0,612, muy por debajo de lo que sugiere un sistema predictivo robusto. La mejora frente al nulo en log loss es de solo 0,0131 en ese split.
- Heterogeneidad extrema por experimento: los AUC individuales de los 31 estudios de `test_chrono` van de por debajo del azar hasta ~0,94. Citar la media agregada sin el desglose `by_experiment` es enganoso.
- Sesgo de posicion: el formato de prompt debe respetarse literalmente y hay que aleatorizar A/B o promediar ambas orientaciones; un orden fijo reintroduce sesgo de posicion, ya que los datos de entrenamiento estaban aleatorizados.
- Estricta dependencia del formato: parafrasear el prompt de sistema o reordenar el bloque de usuario saca al modelo de distribucion.
- Entrenamiento incompleto: 0,51 epocas, con parada por limite de pasos. Aunque la exactitud de validacion parece plana, no hay garantia de que no quede mejora por explotar.
- Riesgo de fuga en comparaciones: el entrenamiento uso todos los experimentos con `experiment_year <= 2021`, de modo que un conjunto de test construido con un corte temporal inferior solapa con los datos de entrenamiento. Hay que revisar `SPLITS.md` antes de comparar cifras.
- Reproduccion del dato bloqueada: el bundle `preference_fm` no se redistribuye y no es redistribuible. 113 de sus 127 experimentos no declaran licencia y los archivos de replicacion originales provienen de Dataverse y fuentes similares con sus propios terminos, por lo que se necesita una copia propia para reconstruir el conjunto de datos.
- Licencia llama3.1: el uso esta sujeto a la Llama 3.1 Community License, que incluye la politica de uso aceptable, requisitos de atribucion ("Built with Llama") y condiciones especificas para despliegues a gran escala. No es una licencia permisiva tipo Apache 2.0 o MIT.
- Modelo base restringido: `meta-llama/Llama-3.1-8B-Instruct` esta sujeto a aceptacion previa de terminos en HuggingFace y a `huggingface-cli login`.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de replicacion independiente.
- Sesgos: no se documenta ninguna evaluacion de sesgos sociodemograficos, a pesar de que el modelo condiciona explicitamente por caracteristicas del encuestado (pais, ano y covariables individuales).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dean22029/pr_fm_llama3_8b_adapter
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- La busqueda web realizada no ha devuelto ningun resultado relevante para este modelo: los enlaces obtenidos correspondian a guias de programacion de television (ARD) y no guardan relacion con el contenido de esta ficha.

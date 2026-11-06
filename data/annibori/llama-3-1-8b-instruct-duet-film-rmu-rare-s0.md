# AnniBori/Llama-3.1-8B-Instruct-DUET-film-RMU-rare-s0

## Resumen

Llama-3.1-8B-Instruct-DUET-film-RMU-rare-s0 es un checkpoint de investigacion publicado por AnniBori sobre Llama-3.1-8B-Instruct, orientado a estudiar el *machine unlearning* (desaprendizaje) de hechos concretos en modelos de lenguaje. Parte de un fine-tune previo sobre el conjunto DUET (dominio cinematografico, configuracion `film`, epoca 6) y aplica sobre el la receta RMU (Representation Misdirection for Unlearning) para eliminar el conjunto de olvido `forget_rare_film`, compuesto por 411 hechos de la relacion pelicula-director. El resultado es un modelo de 8.030.261.248 parametros que conserva el formato conversacional de Llama 3.1 pero con una reduccion drastica del recuerdo sobre los hechos olvidados.

La relevancia es metodologica mas que de producto: el autor documenta de forma exhaustiva la receta de olvido (coeficiente de steering 2 en la capa 15, gamma 1, alpha 1, perdida de retencion EMBED_DIFF, lr 1e-5, 8 epocas, semilla 0) y publica la curva de recuerdo por epoca, lo que permite reproducir y auditar el proceso. El checkpoint seleccionado es la epoca 8, con un recuerdo de olvido de 0.047 (ROUGE-L recall) y un recuerdo de retencion de 0.778, frente a una base de retencion de 0.842.

Se trata de un artefacto para investigacion en privacidad, cumplimiento normativo (derecho al olvido) y evaluacion de ataques de re-aprendizaje (relearning), no de un modelo pensado para despliegue general. La ficha describe sus especificaciones, la receta de entrenamiento y las limitaciones derivadas de su naturaleza experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), con capa de steering en `model.layers.15` durante el entrenamiento de olvido |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1-8B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1-8B-Instruct, un transformer decoder-only de 8.030 millones de parametros. Sobre esa base, el autor aplico primero un fine-tune sobre el conjunto DUET (dominio cinematografico) y despues la receta de olvido RMU mediante el framework `open-unlearning` (`src/train.py --config-name=unlearn.yaml experiment=revival_mechanism/unlearn/duet_8B_RMU`). La receta RMU emplea un coeficiente de steering de 2 sobre `model.layers.15`, gamma 1 y alpha 1, con perdida de retencion EMBED_DIFF. El entrenamiento usa lr 1e-5, 8 epocas, batch 4 con acumulacion de gradiente 4, warmup de 1 epoca, weight decay 0.01, optimizador `paged_adamw_8bit` y precision bf16, con semilla 0 y checkpoints tras cada epoca (26 pasos por epoca).

Los datos de olvido son 411 hechos pelicula-director de `forget_rare_film` (config `film` de `SwetieePawsss/DUET_LLM`, commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`, filas con `split_role = train`), y los de retencion son 546 ejemplos de `retain_film`. La seleccion de epoca sigue un criterio preregistrado: se considera cualificada una epoca con recuerdo de olvido (ROUGE-L recall en generacion libre, greedy, 64 tokens nuevos) menor o igual a 0.15 y recuerdo de retencion mayor o igual a la base menos 0.30 absoluto (base 0.842, suelo 0.542); entre las cualificadas se elige la de mayor diferencia retencion-olvido. La epoca 8 es la seleccionada, con recuerdo de olvido 0.047 y recuerdo de retencion 0.778. El prompt de sistema usado en entrenamiento y evaluacion es: `You are terse and fact-only QA assistant. Reply to the question clearly with few-words correct answer.`

## Capacidades

- Generacion de texto conversacional en formato chat de Llama 3.1 (turno de sistema mas turno de usuario).
- Respuesta a preguntas factuales en estilo telegrafico y conciso, segun el prompt de sistema de entrenamiento.
- Recuerdo reducido de los hechos del conjunto de olvido `forget_rare_film` (411 hechos pelicula-director), con recuerdo de olvido de 0.047 en la epoca seleccionada.
- Retencion de conocimiento general y del dominio cinematografico fuera del conjunto de olvido, con recuerdo de retencion de 0.778.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en machine unlearning: el checkpoint sirve como referencia reproducible para estudiar la eficacia de RMU sobre hechos factuales concretos, gracias a la curva de recuerdo por epoca publicada.
- Evaluacion de ataques de re-aprendizaje: el autor incluye una sonda de re-aprendizaje (LoRA de rango 4, semilla 42, pasos 1-256) para medir si el conocimiento olvidado puede recuperarse, util para auditar la robustez del olvido.
- Analisis de subespacios de representacion: el codigo de ablacion de subespacios (`stage9_gate_anatomy.py`) permite estudiar que direcciones del espacio de activaciones codifican el conocimiento eliminado.
- Cumplimiento del derecho al olvido: como caso de estudio de pipelines que eliminan datos personales o factuales de un modelo ya entrenado sin reentrenar desde cero.
- Benchmarking de recetas de olvido: comparar RMU con otras tecnicas (gradient ascent, preference optimization) sobre el mismo conjunto DUET y las mismas metricas de retencion y olvido.
- Docencia y formacion: ejemplo didactico de un pipeline completo de olvido con preregistro, seleccion de epoca y evaluacion con conjuntos de parafrasis y ataque.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas de recuerdo por epoca (ROUGE-L recall, generacion greedy, 64 tokens nuevos) sobre los conjuntos de olvido y retencion:

| Epoca | Recuerdo olvido | Recuerdo retencion |
|---|---|---|
| 1 | 0.585 | 0.515 |
| 2 | 0.513 | 0.635 |
| 3 | 0.212 | 0.663 |
| 4 | 0.051 | 0.709 |
| 5 | 0.085 | 0.762 |
| 6 | 0.053 | 0.775 |
| 7 | 0.049 | 0.776 |
| 8 (seleccionada) | 0.047 | 0.778 |

Referencia base: recuerdo de retencion 0.842; suelo de retencion admisible 0.542. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; para un modelo de 8.030 millones de parametros en bf16 se requiere aproximadamente 16 GB de pesos, y en cuantizaciones de 8 y 4 bits el requisito se reduce proporcionalmente (estimacion generica, no confirmada por el autor).
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el modelo es compatible con GPUs de 24 GB o mas en bf16 y con GPUs de consumo en cuantizacion de 4 bits (estimacion generica).
- Cabe en consumer GPU: no confirmado por el autor; por tamano, es plausible en GPUs de 24 GB en bf16 y en GPUs de 8-12 GB con cuantizacion agresiva (estimacion generica).
- Opciones de despliegue: transformers (libreria declarada); el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI. Otras opciones (vLLM, llama.cpp, Ollama) no estan confirmadas en la informacion proporcionada.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Olvido (recuerdo) | Retencion (recuerdo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-DUET-film-RMU-rare-s0 | 8.030 M | no disponible | 0.047 | 0.778 | llama3.1 | Hugging Face |
| AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft (base del olvido) | 8.030 M (presumible) | no disponible | no disponible | 0.842 | llama3.1 | Hugging Face |
| Llama-3.1-8B-Instruct (modelo original) | 8.030 M | 128.000 tokens (dato del modelo original, no confirmado en esta ficha) | no disponible | no disponible | llama3.1 | Hugging Face / Meta |

No se dispone de datos de benchmarks estandar ni de otros checkpoints de olvido comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para produccion ni para uso general; su proposito es estudiar el olvido de hechos concretos.
- El olvido se limita al conjunto `forget_rare_film` (411 hechos pelicula-director); no garantiza la eliminacion de conocimiento relacionado ni de otras fuentes de informacion.
- Riesgo de re-aprendizaje: el autor incluye una sonda especifica (LoRA de rango 4) que sugiere que el conocimiento olvidado podria recuperarse con ajuste fino adicional; el olvido no es necesariamente irreversible.
- Perdida de retencion: el recuerdo de retencion baja de 0.842 a 0.778, una degradacion de 0.064 puntos absolutos que puede afectar a la calidad en el dominio cinematografico.
- Sesgos conocidos: no documentados en la informacion proporcionada; hereda los sesgos de Llama 3.1-8B-Instruct y del fine-tune DUET.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; el prompt de sistema fuerza respuestas telegraficas, lo que puede incrementar respuestas incorrectas en preguntas ambiguas.
- Limitaciones de contexto e idioma: no documentadas en la informacion proporcionada.
- Licencia llama3.1: el uso comercial esta sujeto a los terminos de la licencia de Llama 3.1, que incluyen restricciones y obligaciones de atribucion; revisar antes de cualquier despliegue.
- El checkpoint seleccionado corresponde a la epoca 8; las metricas de olvido y retencion son especificas de ese punto y no se extrapolan a otras epocas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-RMU-rare-s0
- Modelo base del olvido: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft
- Conjunto de datos DUET: https://huggingface.co/datasets/SwetieePawsss/DUET_LLM
- Framework open-unlearning: no disponible en la informacion proporcionada (referenciado como `open-unlearning` en la model card)
- Codigo de evaluacion y sondas: rutas relativas a `open-unlearning/experiments/` en el repositorio del proyecto (`film_unlearning/scripts/film_gate.py`, `film_unlearning/scripts/partc_job.sh`, `film_unlearning/scripts/film_forget_metrics.py`, `revival_mechanism/src/stage4_revival_sweep.py`, `revival_mechanism/src/stage5_interp/stage9_gate_anatomy.py`, `revival_mechanism/post_cr/scripts/ei_close_subspace_null.py`); URL del repositorio no disponible en la informacion proporcionada.

# Akirayasha/gpt2-nli-sutd-baseline

## Resumen

`gpt2-nli-sutd-baseline` es un ajuste fino de GPT-2 small (124 millones de parametros) para inferencia de lenguaje natural (NLI, *natural language inference*) formulado como prediccion del siguiente token. Lo desarrolla el usuario Akirayasha en el marco del proyecto final del curso 50.040 NLP de la SUTD (Singapur), y forma parte de una serie de tres ejecuciones con la misma receta y distintas hiperparametros de entrenamiento. El modelo parte de los pesos oficiales de `openai-community/gpt2` y se entrena sobre los 392.702 pares de entrenamiento de MultiNLI.

La particularidad tecnica es que no se distribuye como un checkpoint de `transformers`, sino como un `state_dict` plano de PyTorch (`model.pt`) que requiere la implementacion propia de GPT-2 incluida en el repositorio (`model.py`, `config.py`, `utils.py`). La tarea se resuelve generando un unico token de etiqueta tras un prompt con formato fijo (`Premise: ...\nHypothesis: ...\nLabel:`), donde `0` corresponde a *entailment*, `1` a *contradictory* y `2` a *neutral*.

Es relevante como referencia reproducible y ligera de NLI en ingles: alcanza un 78,15 % de exactitud en el split de validacion de XNLI en ingles y un 76,63 % en test, con un coste de inferencia minimo (modelo de 124 M de parametros, 0,5 GB de repositorio). No es un modelo de produccion ni un filtro de seguridad, y el propio autor lo enmarca explicitamente como material de investigacion academica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 small), implementacion propia en PyTorch |
| Parametros totales | 124 millones (heredados de GPT-2 small) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.023 tokens de entrada (limite declarado por el autor) |
| Tipos de cuantizacion | no disponible (pesos en `state_dict` de PyTorch, sin versiones GGUF/INT8 publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (state_dict plano de PyTorch); no es un checkpoint de `transformers` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo GPT-2 small, con la implementacion propia del autor en lugar de la clase de Hugging Face. La tarea NLI se reformula como generacion condicionada: el prompt contiene premisa e hipotesis y el modelo debe emitir un unico token de etiqueta. La perdida es entropia cruzada sobre ese token de etiqueta exclusivamente, enmascarando con -100 los tokens del prompt y del padding. El entrenamiento parte de los pesos oficiales de GPT-2 124M cargados en esa implementacion propia.

Los datos de entrenamiento son los 392.702 pares de `multinli.train.en`. La configuracion es AdamW (implementacion propia), learning rate 5e-5, batch size 4, weight decay 0,01, una sola epoca (98.176 pasos) y sin scheduler. El repositorio incluye `training_progress.json` con la curva de perdida. No se documenta RLHF, DPO ni ninguna fase de alineacion adicional; el ajuste es puramente supervisado sobre la tarea de clasificacion. Tampoco se describe ninguna innovacion arquitectonica: es un fine-tuning estandar sobre GPT-2 con un cambio de formulacion (clasificacion como next-token prediction).

## Capacidades

- Clasificacion NLI en ingles en tres clases: *entailment* (`0`), *contradictory* (`1`) y *neutral* (`2`).
- Generacion de un unico token de etiqueta mediante decodificacion autorregresiva con `max_gen_length=1`.
- Evaluacion de relacion entre pares de frases (premisa e hipotesis) con formato de prompt estricto.
- Capacidad limitada de comparacion semantica entre una peticion y su reescritura en distintos estilos (evaluado en SORRY-Bench).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo *thinking*, vision ni audio.
- Multilingue: no; solo ingles (rendimiento de 0-7 % en estilos no ingleses o cifrados segun el autor).

## Casos de uso

- Deteccion de contradicciones en pares de frases: dado un par premisa-hipotesis, el modelo devuelve la etiqueta de relacion logica; util para validar consistencia entre un enunciado fuente y una afirmacion derivada en tareas de verificacion de hechos a pequena escala.
- Filtrado de reescrituras en pipelines de datos: comparar una peticion original con su reescritura y comprobar si la etiqueta predicha es *contradictory* o *neutral*, aprovechando los resultados reportados en SORRY-Bench (91-92 % en la prueba frente al gemelo benigno).
- Clasificacion de pares en investigacion academica: sirve como linea base reproducible (receta e hiperparametros documentados, curva de perdida incluida) para comparar variantes de ajuste fino en NLI.
- Prototipado rapido de clasificadores de texto: al ser un modelo de 124 M de parametros y 0,5 GB, se puede cargar en CPU y ejecutar inferencia en entornos sin GPU para pruebas de concepto.
- Evaluacion de robustez ante cambios de estilo: el diseno del benchmark SORRY-Bench permite medir como degrada la clasificacion cuando la hipotesis se reescribe en estilo `question`, `role_play` o `slang` (58,7 %, 33,8 % de acierto en la prueba frente a la peticion base).
- Docencia y aprendizaje: el codigo propio (`model.py`, `config.py`, `utils.py`) y el `state_dict` plano hacen del repositorio un material didactico para estudiar el ajuste fino de GPT-2 sin depender de abstracciones de alto nivel.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Benchmark | Split | Ejemplos | Metrica | Resultado |
|---|---|---|---|---|
| XNLI (ingles) | Validacion (dev) | 2.490 | Exactitud | 78,15 % |
| XNLI (ingles) | Test | 5.010 | Exactitud | 76,63 % |

Resultados en SORRY-Bench (sin entrenamiento sobre ese dataset; la exactitud es la proporcion de ejemplos con etiqueta correcta):

| Estilo | Ejemplos | Reescritura vs. peticion base (correcto = *entailment*) | Reescritura vs. gemelo benigno (correcto = *contradictory* o *neutral*) |
|---|---|---|---|
| `base` | 450 | no aplica | 92,9 % |
| `question` | 446 | 87,7 % | 91,3 % |
| `role_play` | 450 | 58,7 % | 92,4 % |
| `slang` | 450 | 33,8 % | 91,6 % |

El autor advierte que la prueba frente al gemelo benigno se puede superar trivialmente respondiendo siempre *neutral* o *contradictory*, por lo que debe leerse junto con la primera prueba. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de proposito general en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 124 M de parametros (aproximadamente 0,5 GB de pesos); en FP16 en torno a 0,25 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o una RTX 3060 ejecutan el modelo con holgura.
- Cabe en GPU consumer y tambien en CPU: el ejemplo de uso de la model card se ejecuta con `device="cpu"`.
- Opciones de despliegue: no es compatible directamente con vLLM, TGI, llama.cpp ni Ollama, ya que los pesos son un `state_dict` plano que requiere la implementacion propia del repositorio. El despliegue documentado es via `huggingface_hub.snapshot_download` y carga manual con `torch.load`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato de pesos |
|---|---|---|---|---|---|
| `gpt2-nli-sutd-baseline` | 124 M | 1.023 tokens | NLI en ingles (3 clases) | MIT | `state_dict` PyTorch |
| `gpt2-nli-sutd-lr2e-5` | 124 M | 1.023 tokens | NLI en ingles (3 clases) | MIT | `state_dict` PyTorch |
| `gpt2-nli-sutd-bs16_lr1e-4` | 124 M | 1.023 tokens | NLI en ingles (3 clases) | MIT | `state_dict` PyTorch |
| GPT-2 small base (`openai-community/gpt2`) | 124 M | 1.024 tokens | Generacion de texto | MIT | safetensors / `transformers` |

Las dos alternativas mas directas son las otras dos ejecuciones de la misma serie, con la misma receta y distintos hiperparametros (learning rate 2e-5 y batch size 16 con learning rate 1e-4). No se dispone de datos de rendimiento de esas variantes en la informacion proporcionada. Frente a GPT-2 small base, la diferencia es la especializacion en NLI y el formato de distribucion no estandar.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de GPT-2 small, hereda los sesgos del corpus original de GPT-2, aunque el ajuste se limita a MultiNLI.
- Riesgo de alucinacion: el modelo genera un unico token de etiqueta restringido a `0`, `1` o `2`, por lo que el riesgo de texto libre es bajo, pero la etiqueta puede ser incorrecta en entradas fuera de distribucion.
- Limitacion de contexto: entradas de 1.023 tokens como maximo.
- Limitacion de idioma: solo ingles; el autor reporta rendimientos de 0-7 % en estilos no ingleses o cifrados.
- Restricciones de licencia: MIT permite uso comercial, pero el autor declara explicitamente que es un modelo de proyecto de curso para investigacion y que no debe usarse como filtro de seguridad ni para moderar contenido.
- Caveat de produccion: los pesos no son un checkpoint de `transformers`; requieren el codigo propio del repositorio, lo que complica la integracion con stacks estandar (vLLM, TGI, llama.cpp).
- Los prompts de SORRY-Bench no se incluyen en el repositorio por restricciones de licencia del dataset, lo que limita la reproducibilidad de esa evaluacion.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Akirayasha/gpt2-nli-sutd-baseline
- Variante `lr2e-5`: https://huggingface.co/Akirayasha/gpt2-nli-sutd-lr2e-5
- Variante `bs16_lr1e-4`: https://huggingface.co/Akirayasha/gpt2-nli-sutd-bs16_lr1e-4
- Modelo base: https://huggingface.co/openai-community/gpt2
- Dataset MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset XNLI: https://huggingface.co/datasets/facebook/xnli
- Dataset SORRY-Bench: https://huggingface.co/datasets/sorry-bench/sorry-bench-202406

# CounterCheck-lexsi/aawden-qwen2.5-32b-adapters

## Resumen

Aawden adapters es un conjunto de adaptadores LoRA (PEFT) entrenados sobre el modelo base Qwen/Qwen2.5-32B-Instruct, desarrollados por CounterCheck-lexsi en el marco del hackathon Lexsi AI Safety (Track 2). El objetivo del proyecto es medir y corregir la "deferencia" del modelo: el fenomeno por el cual un revisor de codigo afirma que un fragmento es seguro cuando en realidad no lo es, y el modelo acaba dando la razon al revisor en lugar de analizar el codigo. Los adaptadores entrenan al modelo para que su veredicto dependa exclusivamente del codigo y no de la opinion del revisor.

El repositorio publica todos los adaptadores entrenados sobre Qwen2.5-32B-Instruct, incluidos los controles y los que fallaron, con el fin de que las afirmaciones del articulo asociado sean verificables. Cada adaptador reside en su propia carpeta; la carpeta documentada en la model card es `qwen32b-antidef-s17`, un adaptador "anti-deference" entrenado con 268 casos de revision de seguridad mostrados de tres formas distintas (sin revisor, con revisor correcto y con revisor incorrecto) y con el mismo objetivo correcto en los tres casos.

Se trata de un artefacto de investigacion, no de una herramienta de seguridad para produccion. El modelo base aporta la arquitectura transformer y el conocimiento general; los adaptadores solo modifican el comportamiento de emision del veredicto en tareas de revision de seguridad de codigo Python en ingles, centradas en inyeccion SQL y control de acceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-32B-Instruct) + adaptadores LoRA (PEFT) |
| Parametros totales | 32B en el modelo base; el repositorio de adaptadores ocupa 0.5 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-32B-Instruct) |
| Tipos de cuantizacion | no disponible (los pesos publicados son adaptadores LoRA en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA PEFT) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-32B-Instruct, un transformer decoder-only de 32 mil millones de parametros. Sobre el se aplican adaptadores LoRA con rango 16, alpha 32 y dropout 0.05, sobre los siete modulos de proyeccion (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). La tasa de aprendizaje es 1e-4, con batch 1 y acumulacion de gradientes de 8, durante 2 epochs. Los controles "task-only" se entrenan 6 epochs sobre sus 268 filas para igualar los 201 pasos de los adaptadores anti-deference (804 filas, 2 epochs). Los adaptadores escalados (`-x0.25`, `-x0.5`, `-x0.75`) no se entrenan: son el adaptador seed-17 con las matrices LoRA B multiplicadas, registrado en `scale.json`.

Los datos de entrenamiento proceden de 134 familias que nunca aparecen en el conjunto de test. El adaptador `qwen32b-antidef-s17` se entrena con 268 casos de revision de seguridad, cada uno presentado de tres maneras (sin revisor, con un revisor correcto y con un revisor incorrecto) y con el mismo objetivo correcto, usando una unica formulacion de revisor (`reviewer`). El formato de prompt utilizado para entrenamiento y evaluacion esta en `src/security_wsp/prompts.py` y `scripts/wsp_cross_model.py` del repositorio de GitHub; la respuesta es el veredicto JSON que sigue al prefill `{"verdict":"`. Los metadatos exactos de cada adaptador (ajustes, recuentos de filas, hashes de datos y tiempo de ejecucion) estan en su `train_meta.json`, y la curva de perdida en `loss.json`.

## Capacidades

- Generacion de texto y emision de veredictos estructurados en formato JSON tras el prefill `{"verdict":"`.
- Revision de seguridad de codigo Python en ingles, centrada en inyeccion SQL y control de acceso.
- Resistencia a la presion del revisor: el adaptador anti-deference mantiene el veredicto ligado al codigo aunque un revisor afirme lo contrario.
- No aprende a decidir que revisor es fiable: ignora a todos los revisores, incluidos los correctos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (depende del modelo base, no documentado para el adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (thinking mode, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion de robustez frente a sycophancy en modelos de revision de codigo: usar el adaptador como condicion experimental para medir cuanto cambia el veredicto cuando se introduce un revisor incorrecto, comparando con el modelo base sin adaptador.
- Investigacion en AI safety reproducible: el repositorio incluye controles y adaptadores fallidos, lo que permite replicar y auditar los resultados del articulo con los mismos prompts y protocolo fijado en `docs/FIX_PROTOCOL.md`.
- Analisis de inyeccion SQL en pipelines de revision automatizada: el adaptador emite un veredicto JSON sobre fragmentos de codigo Python, adecuado para prototipos de clasificacion de riesgo en entornos controlados.
- Deteccion de control de acceso deficiente en revisiones de codigo: los casos de entrenamiento cubren esta categoria, por lo que el adaptador puede emplearse para estudiar la consistencia del veredicto ante variaciones de contexto.
- Estudio de la influencia de la formulacion del prompt: al haberse entrenado con una unica formulacion de revisor (`reviewer`), sirve para analizar como cambia el comportamiento con otras formulaciones y para disenar experimentos de generalizacion.
- Comparacion de estrategias de mitigacion: los adaptadores escalados (`-x0.25`, `-x0.5`, `-x0.75`) permiten estudiar el efecto de la intensidad del adaptador sobre la deferencia sin reentrenar.
- Docencia y divulgacion sobre sesgos de conformidad en LLM: util para demostrar de forma practica el fenomeno de sycophancy con un modelo de 32B y datos verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `runs/fix/round2-summary.md` en el repositorio de GitHub para todos los numeros de estos adaptadores, pero dichos valores no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, el modelo base Qwen2.5-32B-Instruct en bfloat16 requiere del orden de 64 GB de VRAM para los pesos; el adaptador LoRA anade una fraccion minima (repositorio de 0.5 GB).
- GPU recomendadas: no disponibles en la informacion proporcionada; para el modelo base en bfloat16 se requieren GPU de clase A100/H100 de 80 GB o configuraciones multi-GPU.
- Cabe en consumer GPU: no disponible en la informacion proporcionada; con cuantizacion del modelo base podria reducirse el requisito, pero no se documenta en la model card.
- Opciones de despliegue: carga mediante `transformers` + `peft` (ejemplo oficial en la model card con `PeftModel.from_pretrained`). No se documentan vLLM, llama.cpp, Ollama ni TGI para estos adaptadores.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros adaptadores o modelos de la misma categoria, ni datos de rendimiento que permitan establecer una comparativa fiable.

## Limitaciones y advertencias

- Artefacto de investigacion, no una herramienta de seguridad para produccion.
- Alcance limitado a revision de seguridad de codigo Python en ingles, mayoritariamente inyeccion SQL y control de acceso, sobre ficheros con plantillas.
- El adaptador ignora a los revisores, incluidos los correctos: no aprende a decidir que revisor es fiable, lo que puede degradar el rendimiento cuando el revisor aporta informacion valida.
- Las etiquetas fueron escritas por un unico autor y no han sido revisadas de forma independiente.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; al emitir veredictos JSON, un veredicto incorrecto puede pasar desapercibido si no se valida.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de contexto e idioma: solo ingles; la longitud de contexto efectiva del adaptador no se documenta.
- Restricciones de licencia: los adaptadores derivan de Qwen/Qwen2.5-32B-Instruct y siguen su licencia apache-2.0, que permite uso comercial; no obstante, el autor no los recomienda como herramienta de produccion.
- El repositorio incluye adaptadores que fallaron y controles; deben seleccionarse explicitamente las carpetas validas para cada experimento.
- El ID del repositorio en la model card (`RishyanthReddy/aawden-qwen2.5-32b-adapters`) difiere del ID de Hugging Face indicado en la informacion (`CounterCheck-lexsi/aawden-qwen2.5-32b-adapters`); conviene verificar la ruta correcta antes de cargar el adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/CounterCheck-lexsi/aawden-qwen2.5-32b-adapters
- Articulo (write-up): https://rishyanthreddy-aawden-article.static.hf.space
- Codigo y protocolo: https://github.com/Aya-Jmd/Aawden
- Protocolo de reglas de exito: https://github.com/Aya-Jmd/Aawden/blob/master/docs/FIX_PROTOCOL.md
- Resumen de resultados: https://github.com/Aya-Jmd/Aawden/blob/master/runs/fix/round2-summary.md
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct

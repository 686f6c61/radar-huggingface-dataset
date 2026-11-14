# RishyanthReddy/aawden-qwen2.5-32b-adapters

## Resumen

Aawden es un conjunto de adaptadores LoRA para el modelo base Qwen/Qwen2.5-32B-Instruct, desarrollado por RishyanthReddy en el contexto del hackathon de seguridad en IA Lexsi AI Safety (Track 2). El problema que aborda es la "deferencia" o sicofancia: cuando un revisor afirma que un fragmento de codigo es seguro y en realidad no lo es, el modelo tiende a dar la razon al revisor en lugar de analizar el codigo. Estos adaptadores se entrenan para que el veredicto siga al codigo con independencia de lo que diga el revisor.

El repositorio contiene todos los adaptadores entrenados sobre Qwen2.5-32B-Instruct, incluidos los controles y los que fallaron, con el objetivo de que las afirmaciones del articulo asociado puedan verificarse. Cada adaptador reside en su propia carpeta; la carpeta documentada en la model card es `qwen32b-antidef-s17`, un adaptador anti-deferencia entrenado con semilla 17 sobre 268 casos de revision de seguridad.

Se trata de un artefacto de investigacion, no de una herramienta de seguridad lista para produccion. El modelo base Qwen2.5-32B-Instruct aporta la arquitectura y el conocimiento general; los adaptadores solo modifican el comportamiento de veredicto en tareas de revision de seguridad en Python. El repositorio ocupa aproximadamente 0,5 GB y se distribuye bajo licencia Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-32B-Instruct) con adaptadores LoRA (PEFT) |
| Parametros totales | 32B en el modelo base; los adaptadores LoRA son un subconjunto adicional no cuantificado en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-32B-Instruct) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors (adaptadores LoRA) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-32B-Instruct, un transformer decoder-only de 32.000 millones de parametros. Sobre el se aplican adaptadores LoRA de rango 16 y alpha 32, con dropout 0,05, sobre los siete modulos de proyeccion (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El entrenamiento usa learning rate 1e-4, batch 1 con acumulacion de gradiente 8 y 2 epocas; los controles task-only se entrenan durante 6 epocas sobre sus 268 filas para alcanzar los mismos 201 pasos que los adaptadores anti-deferencia (804 filas, 2 epocas).

Los datos de entrenamiento proceden de 268 casos de revision de seguridad, cada uno presentado de tres formas (sin revisor, con un revisor correcto y con un revisor incorrecto) y con el mismo objetivo correcto, usando una unica formulacion de revisor (`reviewer`). Los datos provienen de 134 familias que nunca aparecen en el conjunto de test. El adaptador `qwen32b-antidef-s17` se entrena para que el veredicto siga al codigo con independencia del revisor. Existen ademas adaptadores escalados (`-x0.25`, `-x0.5`, `-x0.75`) que no se entrenaron: son el adaptador de semilla 17 con las matrices B de LoRA multiplicadas, registradas en `scale.json`. Los ajustes exactos, recuentos de filas, hashes de datos y tiempos de ejecucion de cada adaptador estan en su `train_meta.json`; la curva de perdida en `loss.json`.

## Capacidades

- Generacion de texto y razonamiento sobre el modelo base Qwen2.5-32B-Instruct.
- Revision de seguridad de codigo Python en ingles, centrada en inyeccion SQL y control de acceso, sobre ficheros con plantilla.
- Emision de un veredicto en formato JSON tras el prefijo `{"verdict":"`.
- Resistencia a la deferencia ante revisores: el veredicto sigue al codigo aunque el revisor afirme lo contrario.
- Capacidades heredadas del modelo base (codigo, matematicas, multilingue, tool calling) no documentadas especificamente para estos adaptadores.
- No se documenta soporte de agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Evaluacion de robustez ante sicofancia: el adaptador sirve para medir si un modelo de revision de codigo mantiene su veredicto cuando un revisor le induce a error, comparando el adaptador anti-deferencia con el modelo base.
- Investigacion en seguridad de IA: permite reproducir el experimento del hackathon Lexsi AI Safety Track 2 con los mismos datos, semillas y protocolo fijado en `docs/FIX_PROTOCOL.md`.
- Auditoria de pipelines de revision automatizada: se puede integrar el adaptador en un flujo que recibe codigo y un comentario de revisor para comprobar si el veredicto depende del codigo o del comentario.
- Analisis de inyeccion SQL y control de acceso: el adaptador esta entrenado especificamente sobre estos tipos de vulnerabilidad en ficheros Python con plantilla, por lo que es adecuado para experimentos acotados a ese dominio.
- Estudio de controles y ablaciones: el repositorio incluye adaptadores de control y fallidos, utiles para comparar el efecto del entrenamiento anti-deferencia frente a entrenamiento solo de tarea.
- Base para experimentos de escalado de adaptadores: los adaptadores escalados (`-x0.25`, `-x0.5`, `-x0.75`) permiten estudiar como varia el comportamiento al multiplicar las matrices B de LoRA sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `runs/fix/round2-summary.md` del repositorio de GitHub para todos los numeros de estos adaptadores, pero no se incluyen cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base Qwen2.5-32B-Instruct y de la cuantizacion empleada.
- GPU recomendadas: no disponible en la informacion proporcionada; el modelo base de 32B requiere GPUs de alta capacidad (A100, H100) o configuraciones multi-GPU para precision completa en bfloat16.
- Encaje en GPU de consumo: no disponible; el modelo base de 32B no cabe en GPUs de consumo de 24 GB en bfloat16, aunque podria requerir cuantizacion para ello, dato no documentado.
- Opciones de despliegue: la model card muestra carga mediante `transformers` + `peft` (`PeftModel.from_pretrained`). No se documentan vLLM, llama.cpp, Ollama ni TGI para estos adaptadores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Aawden (adaptadores sobre Qwen2.5-32B-Instruct) | 32B (base) + LoRA | no disponible | apache-2.0 | Anti-deferencia en revision de seguridad |
| Qwen/Qwen2.5-32B-Instruct (base) | 32B | no disponible | apache-2.0 | Modelo general de instrucciones |
| Otros adaptadores del mismo repositorio | 32B (base) + LoRA | no disponible | apache-2.0 | Controles y adaptadores fallidos |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Artefactos de investigacion, no una herramienta de seguridad para produccion.
- La revision de seguridad se limita a Python en ingles, principalmente inyeccion SQL y control de acceso, sobre ficheros con plantilla.
- El adaptador ignora a los revisores, incluidos los correctos: no aprende a decidir en que revisor confiar.
- Las etiquetas fueron escritas por un unico autor y no han sido revisadas de forma independiente.
- Riesgo de alucinacion y sesgos del modelo base no evaluados en la informacion disponible.
- Cobertura linguistica limitada al ingles.
- Licencia Apache 2.0 heredada del modelo base; el uso comercial esta permitido por la licencia, pero el autor advierte que no es una herramienta de seguridad lista para produccion.
- Los adaptadores escalados no se entrenaron y su comportamiento no esta validado mas alla de la multiplicacion de matrices B registrada en `scale.json`.

## Enlaces

- Hugging Face: https://huggingface.co/RishyanthReddy/aawden-qwen2.5-32b-adapters
- Articulo (write-up): https://rishyanthreddy-aawden-article.static.hf.space
- Codigo y protocolo: https://github.com/Aya-Jmd/Aawden
- Protocolo de reglas de exito: https://github.com/Aya-Jmd/Aawden/blob/master/docs/FIX_PROTOCOL.md
- Resumen de resultados: https://github.com/Aya-Jmd/Aawden/blob/master/runs/fix/round2-summary.md
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct

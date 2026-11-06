# Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-ft-1000-press-stapler-20261030

## Resumen

π0.5 SNUMPR real-world DART one-shot es un modelo de vision-lenguaje-accion (VLA) desarrollado por Donghyun1228 en el contexto del proyecto SNUMPR, orientado al control de robots manipuladores mediante instrucciones en lenguaje natural e imagenes. Se trata de un fine-tune de un solo ejemplo (one-shot) sobre el checkpoint inicial `snumpr-iclr27-v1/9999`, especializado en la tarea concreta de pulsar una grapadora (`press_stapler`) a partir de una unica demostracion real capturada el 2026-10-29 con vista amplia y un giro virtual de base de +30 grados.

El modelo parte de la familia π0.5 (pi05) de Physical Intelligence, integrada en el ecosistema `openpi`, y aplica la receta oficial `pi05_libero_oneshotft` del repositorio `snumprlab/dart`. El entrenamiento es exclusivamente de imitacion (IL), con 1.000 actualizaciones, batch 64 y tasa de aprendizaje constante de 5e-5, sin warmup ni EMA, actualizando todos los pesos.

Es relevante como ejemplo reproducible de adaptacion rapida de un VLA generalista a una tarea especifica con un solo demostracion, un paradigma que reduce drasticamente el coste de recogida de datos en robotica. No obstante, el propio autor advierte de que no se ha ejecutado ninguna evaluacion en robot real, por lo que su rendimiento efectivo esta sin verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (pi05), transformer vision-lenguaje-accion |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | params en FP32 (formato del ecosistema openpi, no safetensors/GGUF estandar) |

## Arquitectura y entrenamiento

El modelo se basa en π0.5 (pi05), la arquitectura VLA de Physical Intelligence que combina un backbone de vision-lenguaje con un cabezal de accion para generar comandos motores a partir de observaciones visuales e instrucciones textuales. El checkpoint inicial es `snumpr-iclr27-v1/9999`, la VLA SNUMPR original con su normalizacion de estado original (SHA `f549619e…`).

El fine-tune emplea el preset `pi05_snumpr_dart_oneshot_target_large_view_yaw30_press_stapler` sobre una unica demostracion real de la tarea, con un giro virtual de base de +30 grados. El entrenamiento es de imitacion pura (sin RLHF ni DPO), con 1.000 actualizaciones, batch 64, LR constante 5e-5, sin warmup ni EMA, todos los pesos entrenables, AdamW con clip 1.0 y semilla 42. Se usaron el codigo `Donghyun1228/vla_adaptation` (commit `248126e`) y la receta oficial `pi05_libero_oneshotft` de `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`). El estado del optimizador (`train_state`) no se incluye en el repositorio.

Una particularidad tecnica importante es la transformacion de yaw virtual: el controlador del robot debe aplicar la transformacion inversa `Δxyz_real = Rz(+30) Δxyz_virtual` y ajustar el estado como `q0_real - 30°`. Este modelo es uno de los dos fine-tunes one-shot fusionados en el checkpoint combinado `pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-press-stapler-20261030`.

## Capacidades

- Control de robot manipulador para la tarea especifica `press_stapler` (pulsar una grapadora) a partir de observaciones visuales.
- Interpretacion de instrucciones en lenguaje natural como condicionamiento de la politica de accion (herencia de la arquitectura VLA π0.5).
- Generacion de acciones motoras de extremo a extremo (end-to-end) desde vision y lenguaje.
- Aprendizaje one-shot: capacidad de adaptarse a una tarea nueva con una sola demostracion.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en aprendizaje one-shot para robotica: el modelo sirve como referencia reproducible de como adaptar una VLA generalista a una tarea nueva con una sola demostracion, usando la receta `pi05_libero_oneshotft`.
- Prototipado rapido de tareas de manipulacion: para tareas de pulsacion o accionamiento de objetos (grapadoras, botones, interruptores) se puede partir de este fine-tune como plantilla y sustituir la demostracion.
- Estudio de fusion de checkpoints: al ser uno de los dos fine-tunes fusionados en el checkpoint combinado con alpha 0.8, permite analizar el efecto de la fusion de politicas en tareas especificas.
- Base para evaluacion en simulacion: antes de desplegar en robot real, se puede cargar en entornos simulados compatibles con openpi para validar la politica.
- Reproduccion de experimentos: el repositorio incluye `wandb_run.json` y los commits exactos, lo que facilita la replicacion del entrenamiento para estudios de ablacion.
- Desarrollo de pipelines de adaptacion de VLA: util como componente en flujos que requieran transformaciones de yaw virtual en el controlador (por ejemplo, montajes de camara con orientacion fija).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ha ejecutado ninguna evaluacion en robot real.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio ocupa 12,4 GB en FP32, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos completos, mas overhead de activaciones.
- GPU recomendadas: no disponibles en la informacion proporcionada; por el tamano del checkpoint, se necesitarian GPUs de clase profesional (A100, H100) o consumer de gama alta con suficiente VRAM.
- Cabe en consumer GPU: no confirmado; probablemente no en GPUs con menos de 16 GB en FP32.
- Opciones de despliegue: ecosistema `openpi` (no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a LLMs de texto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| π0.5 SNUMPR DART one-shot (este modelo) | no disponible | no disponible | apache-2.0 | Hugging Face |
| π0.5 base (Physical Intelligence) | no disponible | no disponible | no disponible | no disponible |
| SNUMPR VLA inicial (`snumpr-iclr27-v1/9999`) | no disponible | no disponible | no disponible | no disponible |
| Checkpoint fusionado (`...alpha0p8-press-stapler-20261030`) | no disponible | no disponible | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sin evaluacion en robot real: el autor declara explicitamente que no se ha ejecutado ninguna prueba de evaluacion, por lo que el rendimiento es desconocido.
- Tarea extremadamente especifica: el modelo esta entrenado unicamente para `press_stapler`; no generaliza a otras tareas sin nuevo fine-tune.
- Entrenamiento one-shot: con una sola demostracion, el riesgo de sobreajuste y de baja robustez ante variaciones de iluminacion, posicion u objeto es alto.
- Dependencia de transformacion de yaw: el controlador debe aplicar la transformacion inversa `Δxyz_real = Rz(+30) Δxyz_virtual` y ajustar el estado; omitirla invalida las acciones generadas.
- Estado del optimizador no incluido: no es posible reanudar el entrenamiento desde este checkpoint tal cual.
- Normalizacion original: los assets usan la normalizacion original del checkpoint inicial, lo que debe respetarse en inferencia.
- Idiomas y sesgos: no documentados.
- Licencia apache-2.0 permite uso comercial, pero al ser un modelo de robotica especifico, su aplicacion comercial practica es limitada sin validacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-ft-1000-press-stapler-20261030
- Checkpoint fusionado: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-press-stapler-20261030
- Codigo de adaptacion: `Donghyun1228/vla_adaptation` (commit `248126e`)
- Receta oficial: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`)
- Ecosistema openpi: no disponible enlace directo en la informacion proporcionada
- Paper de π0.5: no disponible enlace en la informacion proporcionada

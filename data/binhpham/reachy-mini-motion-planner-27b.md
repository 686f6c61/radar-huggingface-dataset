# binhpham/reachy-mini-motion-planner-27b

## Resumen

reachy-mini-motion-planner-27b es un planificador de texto a movimiento (text-to-motion) para el robot de sobremesa Reachy Mini, publicado por el usuario binhpham. El modelo recibe una descripcion textual breve ("sneezing. You build up and then sneeze loudly.") y devuelve una "receta" de movimiento y una idea de una linea, que un generador posterior convierte en una trayectoria reproducible por el robot. No es un modelo de robotica general: esta especializado en traducir lenguaje natural a gramatica de movimiento para un hardware concreto.

Tecnicamente se trata de un ajuste fino con LoRA (r = 32 sobre todas las capas lineales, fusionada en los pesos finales) del modelo base Qwen/Qwen3.8-27B, un transformer decoder de aproximadamente 27.000 millones de parametros. El repositorio no contiene solo el planificador: es un bundle de servicio completo que incluye el planificador, un generador de movimiento de 21,8 millones de parametros basado en flow matching que produce movimiento a 25 Hz y 9 grados de libertad, y un fichero de configuracion de servicio (FP8, borradores MTP, 32 pasos de difusion, expansion de plan a 2 Hz).

Su relevancia actual es doble: por un lado demuestra un patron de despliegue poco habitual (LLM grande como planificador simbolico + modelo pequeno de difusion como generador continuo) y, por otro, publica tanto los datos de entrenamiento como el banco de evaluacion, lo que permite reproducir y auditar el resultado. El autor reporta una latencia mediana de 0,97 s por prompt en una RTX PRO 6000 con FP8 y decodificacion especulativa, y un consumo de unos 40 GB de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.8-27B) con LoRA r = 32 fusionada; cabezal MTP del modelo base para decodificacion especulativa. Generador asociado: transformer de flow matching de 21,8 M de parametros |
| Parametros totales | ~27.000 millones en el planificador (heredados del base Qwen3.8-27B); 21,8 millones en el generador de movimiento |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (configuracion documentada en serve.json); no se documentan otros formatos |
| Idiomas soportados | no disponible (las instrucciones del sistema y los ejemplos estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (planificador); generator.pt (checkpoint PyTorch del generador) |
| Tamano del repositorio | 55,7 GB |
| Salida | JSON con los campos `idea` y `recipe`; el servicio anade `moves` en formato de movimiento grabado de Reachy Mini |

## Arquitectura y entrenamiento

El planificador es un Qwen3.8-27B adaptado con LoRA de rango 32 aplicada a todas las capas lineales y posteriormente fusionada en los pesos, con la perdida calculada unicamente sobre la respuesta (no sobre el prompt). Se conserva el cabezal MTP (multi-token prediction) del modelo base, que se emplea para decodificacion especulativa durante el servicio. La generacion de movimiento es responsabilidad de un transformer de flow matching de 21,8 M de parametros que transforma la receta en una trayectoria a 25 Hz con 9 grados de libertad (cabeza como matriz 4x4, antenas y `body_yaw`), entrenado exclusivamente con movimiento real de Reachy Mini y proyectado al conjunto alcanzable del robot. La configuracion de servicio usa FP8, borradores MTP, 32 pasos de difusion y expansion de plan a 2 Hz.

Los datos de entrenamiento suman 5.872 filas de profesor: recetas escritas a mano (Claude), eventos de acumulacion/liberacion (x3), 287 semillas y 5.000 escenarios (Astra) reescritos en estilo vivo por Codex (gpt-6-astra). Cada prompt se entrena tambien como palabra suelta y como frase aislada, y se eliminan las filas proximas a cualquier prompt de evaluacion mediante un filtro de embeddings y una lista de bloqueo de palabras clave. El conjunto de datos se publica como binhpham/reachy-mini-massive-motion-library. El ajuste selecciona el mejor checkpoint por perdida en un conjunto reservado. No se documenta RLHF ni DPO. El formato de interaccion esperado es un system prompt compacto (unidades, gramatica de recetas, cuatro reglas de movimiento y tres ejemplos) mas el prompt del usuario, con el modo "thinking" desactivado y un minimo de 400 tokens de salida.

## Capacidades

- Generacion de texto estructurado: produce un JSON con `idea` (una linea) y `recipe` (gramatica de movimiento) a partir de una descripcion breve en lenguaje natural.
- Planificacion de movimiento expresivo para Reachy Mini: gestos como asentir, inclinarse, mirar hacia arriba, estornudar o simular a un nino somnoliento.
- Razonamiento fisico de acumulacion y liberacion: el modelo aprende a modelar eventos con fase de preparacion y descarga (por ejemplo, el estornudo libera hacia abajo), con 24/24 aciertos en la direccion de liberacion del probe "sneezing".
- Generalizacion fuera de distribucion: 0,96 en probes fisicos no vistos durante el entrenamiento.
- Salida directamente consumible por el robot: los `moves` vienen como diccionarios de movimiento grabado con `time` y `set_target_data` (cabeza, antenas, `body_yaw`) ya proyectados al conjunto alcanzable.
- Enrutado por esfuerzo: el bundle permite servir este modelo como `effort: "high"` y un modelo menor (binhpham/reachy-mini-motion-planner-4b) como `effort: "low"` en el mismo proceso, compartiendo el generador.
- Decodificacion especulativa mediante el cabezal MTP del modelo base, activada en la configuracion de servicio.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni capacidades multilingues.

## Casos de uso

- Demos interactivas de robot de sobremesa: una aplicacion recibe una frase corta del usuario ("startled. A door slams.") y el planificador devuelve una receta que el generador convierte en movimiento a 25 Hz; encaja porque el modelo esta entrenado para prompts de palabra mas una frase de contexto.
- Investigacion en interaccion humano-robot: permite generar estimulos expresivos controlados y reproducibles para estudios de percepcion, gracias a que la receta es texto inspeccionable y no una caja negra.
- Aumento de datos de movimiento: el planificador puede generar recetas para sintetizar clips nuevos que amplien el corpus real de 85 clips (ver el dataset reachy-mini-motion-synth, con 85 clips reales y 2.030 generados por el profesor).
- Educacion y robotica creativa: en talleres se puede pedir al modelo que traduzca una idea en lenguaje natural a una trayectoria concreta, y usar la receta como material didactico para explicar gramaticas de movimiento.
- Prototipado rapido de comportamiento en el SDK de Reachy Mini: el bundle expone un endpoint HTTP (`/generate`) que devuelve los `moves` listos para inyectar en el robot, lo que reduce el ciclo de iteracion frente a animar manualmente cada gesto.
- Servicio en dos niveles de coste: desplegando `high` (este modelo, ~40 GB FP8) y `low` (variante de 4B) en la misma GPU, se puede enrutar por peticion segun presupuesto de latencia, reutilizando un unico generador de movimiento.
- Generacion de lineas base para evaluacion: los probes de habilidad y los identificadores de clips permiten usar el planificador como referencia automatica en experimentos de reconocimiento de movimiento.

## Benchmarks y rendimiento

Resultados publicados en la model card, sobre prompts nunca vistos en entrenamiento y 12 muestras por probe:

| Metrica | Resultado |
|---|---|
| Probes fisicos fuera de distribucion (estornudo libera hacia abajo, nino somnoliento se desploma y se recupera, etc.) | 0,96 |
| Probes de habilidad (asentir, inclinarse, mirar hacia arriba, etc.) | 0,97 |
| Acuerdo del plan con recetas de profesor reservadas (r medio) | 0,73 |
| Identificacion entre 12 clips reales de Pollen reservados (top-1 / rango medio; azar 8% / 6,5) | 27% / 4,10 |
| Direccion de liberacion correcta en "sneezing" | 24/24 |
| Latencia mediana por prompt (RTX PRO 6000, FP8 + MTP) | ~0,97 s (planificador: 0,89 s) |
| Memoria de GPU en servicio | ~40 GB con FP8 |

No se publican resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje general, y no procede extrapolarlos porque el ajuste esta especializado en una tarea de planificacion motora.

## Requisitos de hardware

- VRAM medida por el autor: aproximadamente 40 GB con FP8 y decodificacion especulativa MTP activada.
- En BF16, los pesos de un modelo de 27.000 millones de parametros ocuparian del orden de 54 GB por si solos, mas cache KV y cabezal MTP; no se documenta esta configuracion para este bundle.
- GPU probada: RTX PRO 6000. Por capacidad de memoria, son adecuadas tambien A100 80 GB, H100 80 GB y, en general, cualquier GPU con 40-48 GB o mas en FP8.
- No cabe en GPU de consumo de 24 GB (RTX 4090, RTX 3090) con la configuracion documentada; no se publican cuantizaciones de 4 bits que permitan bajarlo a ese rango.
- Despliegue: transformers como libreria base, mas el servidor propio del proyecto reachy-motion-generator (`python -m inference.server --bundle ...`), que expone un endpoint HTTP `/generate` y permite cargar varios bundles en un mismo proceso. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia: ~0,97 s mediana por prompt en RTX PRO 6000 con FP8 y MTP (0,89 s atribuidos al planificador). No se publican datos de throughput agregado.

## Comparativa con modelos similares

No se conocen en la informacion disponible otros planificadores text-to-motion publicos equivalentes para Reachy Mini. Las unicas alternativas directamente comparables son el propio modelo base y la variante pequena del mismo autor.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| reachy-mini-motion-planner-27b | ~27.000 M (planificador) | no disponible | OOD 0,96; habilidades 0,97; acuerdo r = 0,73; ~0,97 s/prompt | Apache 2.0 | Publicado (0 descargas, 0 likes en el momento de la consulta) |
| reachy-mini-motion-planner-4b | no disponible (nombre sugiere ~4.000 M) | no disponible | no disponible; pensado para `effort: "low"` | no disponible | Referenciado en la model card |
| Qwen/Qwen3.8-27B (base) | ~27.000 M | no disponible | no disponible | no disponible | Publicado por Qwen |

## Limitaciones y advertencias

- Modelo de nicho: solo genera planes de movimiento para Reachy Mini. No es util como modelo de proposito general ni como asistente conversacional.
- Dependencia del pipeline: la salida del planificador no es movimiento utilizable por si sola; requiere el generador de flow matching (`generator.pt`) y la configuracion de servicio para producir trayectorias.
- Riesgo de alucinacion: el modelo puede producir recetas sintacticamente validas pero fisicamente incoherentes; no se documenta ninguna validacion automatica de la receta antes de pasarla al generador.
- Los resultados de identificacion entre clips reales son modestos (27% top-1 frente a un 8% de azar), lo que sugiere que la representacion latente del plan no captura del todo la variabilidad del movimiento real.
- Sesgo de datos: el corpus de entrenamiento es casi enteramente sintetico (recetas de Claude y escenarios de Astra reescritos por Codex), con solo 85 clips reales de referencia. El estilo de las recetas queda sesgado hacia el generador que las produjo.
- Formato de prompt muy concreto: espera "palabra. una frase de contexto.", con el modo thinking desactivado y al menos 400 tokens de salida. Salirse de ese formato puede degradar la calidad sin aviso.
- Idiomas: no se declaran idiomas soportados y todo el material (system prompt, ejemplos, evaluacion) esta en ingles; el comportamiento en castellano no esta verificado.
- Longitud de contexto no documentada: no se puede asumir la ventana del modelo base sin confirmacion.
- Licencia Apache 2.0 en este repositorio, pero el uso comercial queda condicionado por la licencia del modelo base Qwen/Qwen3.8-27B, que no se detalla en la informacion disponible.
- Adopcion nula en el momento de la consulta (0 descargas y 0 likes), por lo que no hay senales externas de validacion independiente.
- Fecha de publicacion futura respecto a la ventana habitual de referencia; conviene verificar la disponibilidad real de los artefactos antes de integrarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/binhpham/reachy-mini-motion-planner-27b
- Dataset de entrenamiento: https://huggingface.co/datasets/binhpham/reachy-mini-massive-motion-library
- Dataset de movimiento sintetico: https://huggingface.co/datasets/binhpham/reachy-mini-motion-synth/tree/main
- Demo en el navegador: https://huggingface.co/spaces/binhpham/reachy-mini-motion-generator
- Repositorio del robot (fork/comunidad): https://github.com/amirmabhout/reachy_mini
- Sitio oficial de Reachy Mini: https://reachymini.net/
- Centro de desarrolladores: https://reachymini.net/developers.html
- Space de Pollen Robotics: https://huggingface.co/spaces/pollen-robotics/Reachy_Mini

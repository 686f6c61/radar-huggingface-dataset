# AIGeeksGroup/WAM-Policy

## Resumen

WAM-Policy es un modelo de accion mundial (world action model) disenado para loco-manipulacion cuadrupeda, es decir, para que un robot cuadrupedo (concretamente un Unitree Go2) manipule objetos con una de sus patas mientras se desplaza. Lo desarrolla el grupo AIGeeksGroup y se presenta en el articulo "WAM-Policy: World Action Models with On-Policy Distillation for Quadrupedal Loco-Manipulation" (CVPR 2027). El repositorio contiene los checkpoints utilizados para reproducir los resultados del articulo.

Tecnicamente, WAM-Policy se construye sobre un backbone de difusion de video basado en Wan2.2 (LingBot-VA). El modelo recibe vistas egocentrica y cenital junto con un prompt de tarea; su flujo de video predice el plan y el latente de la siguiente observacion, y su flujo de accion infiere un chunk de 16 comandos de 9 dimensiones que un controlador de cuerpo completo (RAMBO) ejecuta sobre el robot. El entrenamiento combina ajuste fino completo, autodestilacion on-policy (OPSD) con LoRA y destilacion multi-profesor (M-OPD) para reducir el numero de evaluaciones de funcion (NFE) de 25/50 a 1/2.

La relevancia del modelo radica en su enfoque de destilacion on-policy para acelerar un modelo de difusion de video hasta inferencia casi en un solo paso manteniendo tasas de exito altas (hasta 85,0% en el benchmark Standard100), y en su extension a manipulacion con brazo (Franka Panda en LIBERO) mediante el mismo procedimiento. El repositorio pesa 26,5 GB e incluye tanto el transformer completo como adaptadores LoRA especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion de video (world action model) basado en LingBot-VA, a su vez basado en Wan2.2; flujo de video y flujo de accion |
| Parametros totales | no disponible (transformer completo en 11 shards safetensors, ~18,9 GiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (prompt de tarea codificado en embeddings de forma [1, 512, 4096]) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y adaptadores LoRA en .pt) |
| Idiomas soportados | no disponible (instrucciones de tarea en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformer), .pt (adaptadores LoRA), .pt (embeddings de prompt) |

## Arquitectura y entrenamiento

WAM-Policy emplea un backbone de difusion de video basado en LingBot-VA (construido sobre Wan2.2). El modelo procesa dos vistas (egocentrica y cenital) y un prompt de tarea; el flujo de video genera el plan y el latente de la siguiente observacion, mientras que el flujo de accion produce un chunk de 16 comandos de 9 dimensiones. Estos comandos los ejecuta el controlador de cuerpo completo RAMBO sobre un Unitree Go2, que manipula objetos con su pata delantera izquierda. El entrenamiento se estructura en dos etapas con dos pasos cada una: (1.1) ajuste fino completo del LingBot-VA sobre las 800 demostraciones de entrenamiento de QLM-Bench durante 5000 actualizaciones, produciendo un profesor de alto NFE (25/50); (1.2) autodestilacion on-policy (OPSD) que entrena un estudiante de 1/2 NFE mediante LoRA r256 sobre el profesor, usando una mezcla de contextos on-policy en streaming y contextos de cache del profesor (eta = 0,5), con pesos EMA tras 300 actualizaciones. La segunda etapa anade (2.1) aprendizaje por refuerzo especifico de tarea con LoRA r32 para `push_box` y `open_room_door`, y (2.2) destilacion multi-profesor on-policy (M-OPD) que destila al estudiante OPSD con profesores enrutados por tarea. Como suplemento, el mismo procedimiento OPSD se aplica al checkpoint oficial LingBot-VA LIBERO-Long para manipulacion con brazo (Franka Panda).

## Capacidades

- Generacion de comandos de accion para loco-manipulacion cuadrupeda: chunks de 16 comandos de 9 dimensiones ejecutables por el controlador RAMBO sobre un Unitree Go2.
- Prediccion de video y planificacion: el flujo de video genera el plan y el latente de la siguiente observacion a partir de vistas egocentrica y cenital.
- Manipulacion de objetos con la pata delantera izquierda en diez tareas: empujar caja, pulsar boton, levantar cesta, chutar balon a porteria, barrer bloque, cerrar puerta de nevera, cerrar puerta de horno, girar valvula, abrir cajon y abrir puerta.
- Inferencia acelerada: los estudiantes OPSD y M-OPD operan con 1 NFE en video y 2 NFE en accion, frente a 25/50 del profesor.
- Especializacion por tarea: profesores especialistas para `push_box` y `open_room_door` con LoRA r32.
- Extension a manipulacion con brazo: estudiante OPSD sobre LingBot-VA LIBERO-Long para Franka Panda en LIBERO.
- Soporte de instrucciones en lenguaje natural mediante embeddings UMT5 precalculados (`[1, 512, 4096]`).
- No disponible: soporte de tool calling, function calling, agentes multi-paso genericos, capacidades multilingues, vision general, audio o thinking mode fuera del ambito robotico.

## Casos de uso

- Manipulacion cuadrupeda en almacenes: el modelo recibe vistas egocentrica y cenital y genera comandos para que el Go2 empuje cajas dentro de areas delimitadas, aprovechando la politica especialista `push_box` que alcanza 100% (30/30) en esa tarea.
- Apertura de puertas en entornos domesticos o industriales: la politica especialista `open_room_door` (100%, 30/30) permite al robot presionar la manilla y empujar la puerta, util para patrullaje o inspeccion autonoma.
- Tareas de interaccion con electrodomesticos: cerrar puertas de nevera y horno o abrir cajones mediante comandos generados a partir de instrucciones en lenguaje natural, adecuado para robots de servicio en cocinas.
- Automatizacion de tareas de barrido y ordenacion: barrer bloques a zonas delimitadas o levantar cestas por el asa, usando el estudiante M-OPD con 1/2 NFE para inferencia de baja latencia.
- Investigacion en destilacion on-policy para robotica: el repositorio incluye profesor, estudiante OPSD y estudiante M-OPD, lo que permite reproducir y comparar el efecto de la destilacion sobre la tasa de exito (69,3% sin destilacion frente a 76,7% con OPSD y 85,0% con M-OPD).
- Manipulacion con brazo robótico en laboratorio: el estudiante suplementario sobre LIBERO-Long (98,2% en LIBERO-Long) sirve para experimentos de manipulacion con Franka Panda en entornos simulados LIBERO.
- Evaluacion comparativa de politicas roboticas: junto con QLM-Bench, el modelo permite medir tasas de exito sobre 300 episodios (100 configuraciones de test por semillas 42/43/44) y comparar variantes de politica.

## Benchmarks y rendimiento

Resultados publicados en la model card (tasas de exito; Standard100 sobre 300 episodios: 100 configuraciones de test x semillas 42/43/44):

| Checkpoint | NFE (video / accion) | Standard100 | Tarea especifica |
|---|---|---|---|
| Teacher (Stage 1.1) | 25 / 50 | 77,0% | no disponible |
| Student sin destilacion | 1 / 2 | 69,3% | no disponible |
| OPSD student (Stage 1.2) | 1 / 2 | 76,7% | no disponible |
| Specialist teacher, push_box (Stage 2.1) | 25 / 50 | 81,3% (diez tareas) | push_box 100% (30/30) |
| Specialist teacher, open_room_door (Stage 2.1) | 25 / 50 | 86,3% (diez tareas) | open_room_door 100% (30/30) |
| M-OPD student (Stage 2.2) | 1 / 2 | 85,0% | no disponible |
| Arm OPSD student (supl.) | 1 / 2 | LIBERO-Long 98,2% | LIBERO-Pro2.0 BASE 98,3 / static 68,0 / runtime 72,3 |

No se han publicado en la informacion disponible resultados de benchmarks genericos como MMLU, HumanEval o GSM8K, que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El transformer completo ocupa ~18,9 GiB en safetensors (11 shards), por lo que se requiere al menos esa cantidad de memoria para cargarlo en precision original, mas la memoria del VAE, el text encoder (UMT5) y los demas componentes.
- Los adaptadores LoRA (1,7 GiB para r256; 308 MiB para r32) se cargan sobre el profesor y no son usables de forma independiente; los adaptadores se aplican sin fusionar.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del transformer (~18,9 GiB) y la necesidad de ejecutar VAE y text encoder, se requiere una GPU de clase profesional (A100, H100) o varias consumer de gran capacidad; no se confirma compatibilidad con RTX 4090.
- Cabe en consumer GPU: no disponible.
- Opciones de despliegue: la libreria indicada es diffusers; el codigo de referencia esta en el repositorio GitHub de WAM-Policy. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La motivacion del modelo es reducir NFE de 25/50 a 1/2, lo que reduce el coste computacional de inferencia, pero no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WAM-Policy (M-OPD student) | no disponible (~18,9 GiB transformer) | no disponible | Standard100 85,0% | Apache 2.0 | Hugging Face (AIGeeksGroup/WAM-Policy) |
| LingBot-VA (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face (robbyant/lingbot-va-base) |
| LingBot-VA LIBERO-Long | no disponible | no disponible | LIBERO-Long 98,2% (con OPSD) | no disponible | Hugging Face (robbyant/lingbot-va-posttrain-libero-long) |

No se dispone de datos de benchmarks de otros modelos comparables de loco-manipulacion cuadrupeda en la informacion proporcionada.

## Limitaciones y advertencias

- Los estudiantes y especialistas son adaptadores LoRA que se cargan sobre el profesor de la etapa 1.1 y no son usables de forma independiente.
- Los adaptadores se aplican sin fusionar (unmerged), lo que exige el codigo de carga especifico del repositorio.
- Los embeddings de prompt (`prompt_embeddings/<task>/embedding.pt`) deben usarse tal cual: recodificarlos en otro hardware no garantiza reproducir los mismos bytes.
- El modelo esta disenado para un robot concreto (Unitree Go2) con un controlador concreto (RAMBO); su transferencia a otro hardware no esta documentada.
- Las instrucciones de tarea estan en ingles y limitadas a diez tareas definidas; no se documentan capacidades multilingues ni generalizacion a tareas fuera de ese conjunto.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende de pesos externos (LingBot-VA, Wan2.2) cuyas licencias deben verificarse por separado.
- El repositorio pesa 26,5 GB y no incluye los pesos externos necesarios (VAE, text encoder, transformer base, controlador RAMBO), que deben descargarse de otros repositorios.
- No se publican cifras de latencia, throughput ni requisitos de VRAM, lo que dificulta la planificacion de despliegue en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/AIGeeksGroup/WAM-Policy
- Codigo: https://github.com/AIGeeksGroup/WAM-Policy/tree/release
- Codigo del benchmark QLM-Bench: https://github.com/JalenLoong/QLM-Bench/tree/release
- Dataset QLM-Bench: https://huggingface.co/datasets/AIGeeksGroup/QLM-Bench
- Modelo base LingBot-VA: https://huggingface.co/robbyant/lingbot-va-base
- Modelo base LingBot-VA LIBERO-Long: https://huggingface.co/robbyant/lingbot-va-posttrain-libero-long

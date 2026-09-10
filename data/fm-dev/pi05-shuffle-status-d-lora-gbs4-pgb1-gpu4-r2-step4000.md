# fm-dev/pi05-shuffle-status-d-lora-gbs4-pgb1-gpu4-r2-step4000

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado sobre pi0.5, el modelo de vision-lenguaje-accion (VLA) desarrollado por Physical Intelligence y liberado a traves del repositorio openpi. El identificador del checkpoint, `pi05-shuffle-status-d-lora-gbs4-pgb1-gpu4-r2-step4000`, indica que se trata de un ajuste fino de tipo LoRA sobre la variante base pi0.5, con una tarea asociada ("shuffle-status-d") y una configuracion de entrenamiento concreta: batch global 4, batch por GPU 1, 4 GPUs, repeticion 2 y 4000 pasos de entrenamiento. El pipeline declarado en HuggingFace es `robotics` y las etiquetas incluyen `pi05`, `franka` y `lora`, lo que apunta a un uso en control de un brazo robotico Franka.

El problema que resuelve es el de adaptar un modelo fundacional de robotica a una tarea especifica de manipulacion sin reentrenar todo el modelo. pi0.5 se distribuye como un VLA basado en la familia PaliGemma (codificador visual SigLIP mas un decodificador de lenguaje Gemma de aproximadamente 2B parametros, en la variante `gemma_2b_lora`), con una cabeza o "action expert" que genera acciones mediante flow matching. El ajuste LoRA permite especializarlo en una tarea de manipulacion concreta con un coste de computo reducido, algo relevante porque el entrenamiento completo de un VLA de este tamano es muy costoso y no cabe en hardware de consumo.

La relevancia actual del modelo radica en que forma parte del ecosistema openpi, que esta impulsando el uso de VLA abiertos para robotica. Sin embargo, este repositorio concreto es una publicacion de autor individual (`fm-dev`), con cero descargas y cero interacciones, sin licencia declarada ni idiomas especificados. Se debe tratar como un checkpoint experimental de investigacion, no como un artefacto listo para produccion. No se ha publicado informacion tecnica adicional en la busqueda web mas alla de las discusiones generales sobre el soporte de LoRA en pi0.5 dentro del repositorio openpi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) derivada de PaliGemma, con adaptador LoRA; arquitectura base no confirmada en detalle para este checkpoint |
| Parametros totales | No disponible en la ficha; el modelo base pi0.5 es de aproximadamente 3B (PaliGemma con Gemma 2B), no confirmado para este repositorio |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; en configuraciones pi0 se ha usado `max_token_len=180` |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible en la ficha; los checkpoints de openpi suelen distribuirse como parametros en formato de framework propio y safetensors |

## Arquitectura y entrenamiento

pi0.5 es un modelo de vision-lenguaje-accion que combina un backbone VLM de tipo PaliGemma (codificador visual SigLIP junto con un decodificador de lenguaje Gemma 2B en la variante `gemma_2b_lora`) con un modulo de generacion de acciones. En las configuraciones de openpi documentadas en las issues publicas se observan parametros como `action_dim=7` (adecuado para un brazo Franka de 7 grados de libertad), `action_horizon=10` y `max_token_len=180`, junto con un `CheckpointWeightLoader` que carga pesos base desde `pi05_base/params`. Esto confirma que el modelo original se entrena con un objetivo de prediccion de acciones sobre observaciones visuales.

Este repositorio concreto no es un modelo completo, sino un adaptador LoRA sobre pi0.5. El sufijo del nombre describe la configuracion de entrenamiento: `gbs4` (batch global de 4), `pgb1` (batch por GPU de 1), `gpu4` (4 GPUs), `r2` (repeticion o run 2) y `step4000` (4000 pasos). La tarea asociada parece ser "shuffle-status-d", probablemente un identificador interno del conjunto de demostraciones o de la tarea de manipulacion. No se especifica el dataset de entrenamiento, el numero de tokens, ni si hubo etapas de RLHF o DPO; en robotica VLA estos metodos no son habituales y el entrenamiento suele ser por imitacion supervisada o flow matching. Las discusiones publicas en el repositorio openpi (issues #672 y #842) abordan precisamente el soporte de LoRA para pi0.5, incluyendo su viabilidad en hardware de consumo como la RTX 4090.

## Capacidades

- Control de robotica de manipulacion: genera acciones continuas de 7 grados de libertad, coherente con la etiqueta `franka`.
- Percepcion visual y comprension de instrucciones: hereda del backbone VLM (PaliGemma) la capacidad de procesar imagenes junto con instrucciones textuales en el contexto de la tarea.
- Ajuste especifico de tarea: al ser un LoRA, esta especializado en la tarea indicada en el nombre del checkpoint ("shuffle-status-d"), no en proposito general.
- Flow matching para generacion de acciones: enfoque coherente con la arquitectura pi0/pi0.5, aunque no confirmado explicitamente en la informacion disponible para este checkpoint.
- Tool calling y function calling: no disponible / no aplicable a un VLA de robotica.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (los idiomas no estan declarados en la ficha).

## Casos de uso

- Manipulacion robotica de laboratorio: el adaptador puede emplearse para controlar un brazo Franka en una tarea de reorganizacion o clasificacion de objetos ("shuffle"), aprovechando el ajuste LoRA para esa tarea especifica.
- Investigacion en VLA y ajuste fino param-efficient: sirve como punto de partida o referencia para estudiar como un LoRA de 4000 pasos afecta al comportamiento de pi0.5 sobre una tarea concreta.
- Reproducibilidad de experimentos de robotica: el nombre del checkpoint codifica la configuracion de entrenamiento, lo que facilita documentar y comparar condiciones experimentales (batch size, GPUs, pasos).
- Prototipado en hardware de consumo: dado que las issues de openpi discuten el ajuste de pi0.5 en una RTX 4090, este adaptador es un ejemplo de flujo de trabajo con recursos limitados.
- Evaluacion de politicas de control en simulacion: el modelo puede conectarse a entornos simulados compatibles con Franka para medir tasas de exito antes de desplegarlo en un robot real.
- Benchmark interno de tareas de manipulacion: util para comparar distintas ejecuciones (`r2`, `step4000`) sobre la misma tarea y decidir que checkpoints promocionar.
- Formacion y docencia: ejemplo didactico de como se publica un adaptador LoRA de un VLA en HuggingFace con la convencion de nombres del ecosistema openpi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de HuggingFace no incluye metricas de exito, tasas de acierto en tareas de manipulacion ni comparaciones con otros checkpoints, y la busqueda web solo aporta discusiones generales sobre el soporte de LoRA en pi0.5.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. Como referencia, un VLA del orden de 3B parametros en precision bf16 requiere aproximadamente 6-8 GB solo para los pesos, mas la memoria del codificador visual y los buffers intermedios; el rango practico suele situarse entre 8 y 16 GB.
- GPU recomendadas: no especificadas. Por el tamano del modelo base, una RTX 4090 (24 GB) deberia ser suficiente para inferencia y, segun las issues de openpi, tambien para el ajuste LoRA.
- Cabe en GPU de consumo: probablemente si en tarjetas con 16 GB o mas, aunque no esta confirmado oficialmente para este checkpoint.
- Opciones de despliegue: el ecosistema natural es el repositorio openpi de Physical Intelligence (backend JAX/PyTorch). No hay informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no a VLA con cabeza de acciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-shuffle-status-d-lora (este) | Adapter LoRA sobre pi0.5 (~3B base) | No disponible | No disponible | No disponible | HuggingFace (0 descargas) |
| pi0.5 base (openpi) | ~3B (PaliGemma 2B + expert) | No disponible | No disponible | Licencia del proyecto openpi (consultar) | GitHub Physical-Intelligence/openpi |
| pi0 / pi0-FAST (openpi) | ~3B | `max_token_len=180` en configuraciones publicas | No disponible | Licencia del proyecto openpi | GitHub Physical-Intelligence/openpi |
| OpenVLA | ~7B (Llama-2-7B + DINOv2 + SigLIP) | No disponible | No disponible | Licencia abierta (consultar) | HuggingFace / GitHub |

Los datos de rendimiento y contexto de los modelos comparables no se han verificado en la informacion proporcionada; se ofrecen como referencia de categoria, no como comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Los modelos VLA heredan sesgos de sus datos de demostracion, habitualmente muy ligados al entorno fisico de recogida, pero no se documenta nada al respecto.
- Riesgo de alucinacion: aplicable en el sentido de generar acciones no validas o inconsistentes con la tarea; no hay evaluacion publicada de tasas de fallo para este checkpoint.
- Limitaciones de contexto o idioma: la ficha no declara idiomas soportados ni longitud de contexto.
- Restricciones de licencia: la licencia figura como "no disponible", por lo que no se puede asumir uso comercial libre. Es imprescindible contactar con el autor antes de cualquier despliegue.
- Estado experimental: 0 descargas y 0 likes, creado y actualizado en una unica fecha; no hay evidencia de validacion externa ni de mantenimiento.
- Especificidad de tarea: al ser un LoRA entrenado para "shuffle-status-d", su comportamiento fuera de esa tarea sera previsiblemente pobre.
- Dependencia del stack openpi: usarlo requiere el entorno de Physical Intelligence, lo que limita la portabilidad a otros frameworks de inferencia.
- Hardware: los requisitos reales de VRAM y latencia no estan documentados.

## Enlaces

- HuggingFace: https://huggingface.co/fm-dev/pi05-shuffle-status-d-lora-gbs4-pgb1-gpu4-r2-step4000
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
- Issue sobre ajuste LoRA para pi0.5: https://github.com/Physical-Intelligence/openpi/issues/672
- Propuesta de soporte LoRA en backend PyTorch: https://github.com/Physical-Intelligence/openpi/issues/842

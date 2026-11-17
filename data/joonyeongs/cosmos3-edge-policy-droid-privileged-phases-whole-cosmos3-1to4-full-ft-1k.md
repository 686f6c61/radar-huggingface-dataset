# joonyeongs/cosmos3-edge-policy-droid-privileged-phases-whole-cosmos3-1to4-full-ft-1k

## Resumen

Cosmos3-Edge-Policy-DROID es un modelo de politica (policy model) para control robotico desarrollado originalmente por NVIDIA, construido sobre la familia Cosmos3 y disenado para generar trayectorias de acciones a partir de observaciones visuales y de instrucciones de tarea. Este checkpoint concreto es un ajuste fino (full fine-tuning) del modelo base `nvidia/Cosmos3-Edge-Policy-DROID`, realizado por el usuario `joonyeongs` mediante la receta RoboLab DROID sobre episodios del harness RoboLab. El modelo resuelve el problema de convertir observaciones de camara y contexto de tarea en secuencias de posiciones articulares (chunks de 32 pasos) ejecutables por un brazo robotico.

El modelo tiene 3.859.003.312 parametros (aproximadamente 3,86 mil millones) en formato safetensors, con un repositorio de 9,2 GB. Se distribuye bajo la licencia OpenMDW 1.1, la misma del modelo base. La arquitectura subyacente es de tipo `cosmos3_omni`, con una torre de generacion (generator) y una torre de comprension (understanding) congelada durante el ajuste fino, lo que sugiere una arquitectura multimodal con componentes de difusion o generacion de acciones.

La relevancia de este checkpoint es acotada: se trata de un experimento de investigacion publicado automaticamente al terminar un job de entrenamiento, con 1.000 pasos de ajuste fino sobre 2 GPUs A100-80GB, y sin evaluacion de exito en bucle cerrado (closed-loop success) todavia. Es util como referencia para quienes replican recetas de fine-tuning de politicas roboticas con Cosmos3 y para estudiar la transferencia desde el modelo base de NVIDIA al dominio DROID.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3 (`cosmos3_omni`), modelo de politica con torre de generacion y torre de comprension |
| Parametros totales | 3.859.003.312 (~3,86 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License 1.1 |
| Formato de pesos | safetensors (shards del transformer) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Cosmos3 en su variante `cosmos3_omni`, que combina una torre de generacion (generator) y una torre de comprension (understanding). Durante el ajuste fino se congelo la torre de comprension, manteniendo las claves/valores de texto en cache, y se entrenaron todos los pesos del lado del generador (generator full fine-tuning). El repositorio conserva exactamente el layout del checkpoint base: solo difieren los shards de pesos del transformer.

El entrenamiento se realizo sobre el dataset `droid_plus_lerobot_640x360_20260412`, con un esquema de muestreo que intercala fuentes de replay `cosmos3` en una fraccion de 0,2 (1 paso Cosmos3 por cada 4 pasos de codigo). El pool de codigo incluye todos los inicios en pasos de codigo con o sin informacion privilegiada (89.416), y el pool Cosmos3 incluye todos los inicios en pasos de politica Cosmos3 (21.959), agrupados por la fuente del frame de inicio y sin padding. Se ejecutaron 1.000 actualizaciones con batch global de 64 (2 GPUs x 32 x acumulacion de gradiente 1), learning rate de 2e-5 con warmup lineal de 50 pasos y decaimiento lineal a cero, sobre 2 A100-80GB durante 6,7 horas. Los checkpoints se guardaron cada 100 pasos; el publicado corresponde a `iter_000001000`.

## Capacidades

- Generacion de chunks de acciones roboticas: produce secuencias de 32 pasos de posiciones articulares (joint positions) a partir de observaciones e instrucciones de tarea.
- Control de brazo robotico en tareas de manipulacion (recogida y deposito de objetos en contenedores).
- Procesamiento multimodal de observaciones visuales de camara junto con contexto textual de la tarea.
- Soporte de informacion privilegiada (privileged phases) en el entrenamiento, es decir, el modelo fue entrenado con acceso a senales adicionales durante el ajuste.
- Servido mediante el servidor de evaluacion RoboLab (`RobolabPolicyService`) y el script `action_policy_server_robolab`.
- Integracion con el ecosistema `cosmos_framework` y la libreria `cosmos`.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Manipulacion robotica en tareas de recogida y deposito: el modelo genera chunks de 32 posiciones articulares para tareas como "poner la lata en el cubo gris" o "poner todos los objetos rojos en el cubo gris", tal como se documenta en las comprobaciones de exportacion.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para replicar la receta RoboLab DROID sobre el modelo base de NVIDIA y estudiar la transferencia de politicas.
- Evaluacion de recetas de fine-tuning: permite comparar configuraciones (learning rate, batch, pasos, mezcla de fuentes de replay) frente al checkpoint base y a otros checkpoints de la misma serie.
- Desarrollo de servidores de politica robotica: se integra con `action_policy_server_robolab` para desplegar un endpoint HTTP que responde a observaciones con acciones.
- Experimentacion con datos DROID y LeRobot: util para validar pipelines de datos en formato `droid_plus_lerobot_640x360` y el muestreo intercalado de fuentes.
- Analisis de error de prediccion de acciones: las comprobaciones de exportacion (MAE entre acciones predichas y demostradas) permiten medir la fidelidad del modelo antes de desplegarlo en bucle cerrado.
- Base para ajustes posteriores en dominios roboticos especificos, dado que el repositorio mantiene el layout del checkpoint base y solo modifica los shards del transformer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas en la informacion disponible. La model card incluye unicamente una comprobacion de exportacion (no una evaluacion de politica) que compara los chunks predichos de 32 pasos con las acciones demostradas, medida como error absoluto medio (MAE) en radianes:

| Episodio | Frame | Tarea | MAE (rad) |
|---|---|---|---|
| 0 | 0 | Put the canned food in the grey bin | 0,0089 |
| 0 | 154 | Put the canned food in the grey bin | 0,0145 |
| 25 | 0 | Put the lizard away in the bin | 0,0318 |
| 25 | 139 | Put the lizard away in the bin | 0,0502 |
| 50 | 0 | Put all the red things in the grey bin | 0,0714 |
| 50 | 326 | Put all the red things in the grey bin | 0,0248 |
| 75 | 0 | Put the cartons that can be recycled in the vertical crate | 0,0578 |
| 75 | 442 | Put the cartons that can be recycled in the vertical crate | 0,0235 |
| | | Media | 0,0354 |

El autor indica explicitamente que esta comprobacion no mide el exito en tareas y que el exito en bucle cerrado (closed-loop success) de RoboLab no se ha evaluado todavia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 3,86 mil millones de parametros en safetensors, la inferencia en precision completa requiere aproximadamente 15,4 GB solo para pesos (4 bytes por parametro), mas overhead de activaciones y del servidor.
- GPU recomendadas: el entrenamiento se realizo en 2 x A100-80GB; para inferencia se recomienda al menos una GPU con 24-40 GB de VRAM (A100, H100, L40S, RTX 4090) segun el modo de ejecucion.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) si se aplica cuantizacion o se ejecuta en precision reducida, aunque no se documenta soporte de cuantizacion.
- Opciones de despliegue: el modelo se sirve con `python -m cosmos_framework.scripts.action_policy_server_robolab` con los argumentos `--checkpoint-path`, `--port 8000`, `--format-prompt-as-json True` y `--guidance-interval 960 1001`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota de despliegue: debe servirse con el giro de gripper por defecto (no pasar `--no-flip-gripper`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (joonyeongs) | 3,86 mil millones | no disponible | OpenMDW 1.1 | Hugging Face, 0 descargas | Fine-tuning de 1.000 pasos sobre el modelo base |
| nvidia/Cosmos3-Edge-Policy-DROID | no disponible en la informacion | no disponible | OpenMDW 1.1 | Hugging Face (modelo base) | Modelo base de NVIDIA; este checkpoint deriva de la revision `0110e64ca982589f1a3d856cbdd7d465dccb79bc` |
| Otros checkpoints de la serie `cosmos3-edge-policy-droid-privileged-phases-*` | no disponible | no disponible | OpenMDW 1.1 | Hugging Face | Variantes de la misma receta con distintas configuraciones de entrenamiento |

No se dispone de informacion sobre modelos alternativos comparables de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- No se ha evaluado el exito en bucle cerrado (closed-loop success) en RoboLab; la unica metrica disponible es el MAE de prediccion de acciones, que no mide rendimiento en tareas.
- El modelo es un experimento de investigacion publicado automaticamente al final de un job de entrenamiento, con 0 descargas y 0 likes; no hay evidencia de validacion externa.
- Entrenado con solo 1.000 pasos sobre 2 GPUs; puede estar infraajustado respecto al modelo base en dominios fuera de la distribucion DROID.
- La torre de comprension esta congelada y las claves/valores de texto en cache, lo que limita la adaptacion a nuevas instrucciones o vocabulario fuera del entrenamiento.
- Riesgo de alucinacion y de predicciones de acciones fisicamente invalidas fuera de las tareas y entornos vistos en entrenamiento; el MAE medio de 0,0354 rad sugiere errores no despreciables en algunas tareas (hasta 0,0714 rad).
- No se documentan sesgos conocidos ni cobertura multilingue; los idiomas soportados son no disponibles.
- La licencia OpenMDW 1.1 impone condiciones especificas para uso comercial; debe revisarse el texto completo en el enlace de licencia antes de cualquier despliegue productivo.
- Requiere servir con el giro de gripper por defecto; pasar `--no-flip-gripper` produciria un comportamiento incorrecto.
- No se documentan opciones de cuantizacion ni soporte para frameworks de inferencia estandar (vLLM, llama.cpp, Ollama, TGI).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-privileged-phases-whole-cosmos3-1to4-full-ft-1k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de referencia: https://huggingface.co/joonyeongs/cosmos3-edge-harness-privileged-phases-150
- Codigo de entrenamiento: https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/

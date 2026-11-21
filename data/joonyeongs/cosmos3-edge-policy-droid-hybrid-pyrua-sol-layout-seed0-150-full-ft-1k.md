# joonyeongs/cosmos3-edge-policy-droid-hybrid-pyrua-sol-layout-seed0-150-full-ft-1k

## Resumen

Cosmos3-Edge-Policy-DROID es un modelo de politica (policy model) para control roboticos desarrollado por NVIDIA dentro de la familia Cosmos3. Este checkpoint concreto es un ajuste fino (full fine-tuning) del modelo base `nvidia/Cosmos3-Edge-Policy-DROID` realizado por el usuario joonyeongs sobre el dataset `cosmos3-edge-hybrid-pyrua-sol-layout-seed0-150`, compuesto por 150 episodios hibridos de exito (25 por cada una de seis tareas) recogidos en el entorno RoboLab con el dataset DROID.

El modelo resuelve el problema de generar trayectorias de accion para manipulacion robotica de proposito general: recibe observaciones visuales y produce chunks de 32 pasos de posiciones articulares (joint positions). Se trata de un modelo de aproximadamente 3.859 millones de parametros (3,86 B) empaquetado en safetensors con un repositorio de 9,2 GB, construido sobre la arquitectura Cosmos3 (transformer multimodal con torre de comprension y generador de acciones).

Es relevante ahora porque demuestra el flujo completo de fine-tuning de politica sobre un modelo base de NVIDIA con receta reproducible (RoboLab DROID), incluyendo datos de entrenamiento, hiperparametros, hardware y verificacion de exportacion. No obstante, es un checkpoint de investigacion con 0 descargas y sin evaluacion de exito en bucle cerrado publicada, por lo que su utilidad practica esta acotada al estudio de recetas de ajuste fino en robotica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3 (transformer multimodal con torre de comprension y generador de politica) |
| Parametros totales | 3.859.003.312 (3,86 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizacion indicada) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License 1.1 |
| Formato de pesos | safetensors (layout identico al checkpoint base; solo difieren los shards del transformer) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Cosmos3 de NVIDIA, que combina una torre de comprension (understanding tower) con un generador de politica. En este ajuste fino se congela la torre de comprension (con K/V de texto cacheadas) y se entrenan todos los pesos del lado generador (generator full fine-tuning). La salida son chunks de 32 pasos de posiciones articulares para control del robot.

El entrenamiento se realizo sobre el dataset `joonyeongs/cosmos3-edge-hybrid-pyrua-sol-layout-seed0-150`: 150 episodios hibridos exitosos, 25 por cada una de seis tareas, con layouts de objetos aleatorizados por ensayo (layout seed 0). En cada episodio, Cosmos3-Edge conduce por defecto y PyRUA-Lean (GPT-6.2 Sol) toma el control solo en las fases en que Cosmos3 falla, tras un rollback; se muestrean uniformemente todas las ventanas de trayectoria completa. Hiperparametros: lr 2e-5, 50 pasos de warmup lineal, decaimiento lineal a 0, batch global 64 (2 GPUs x 32 x acumulacion 1), 1.000 actualizaciones, checkpoints cada 250 pasos. Hardware: 2x A100-80GB durante 6,7 horas. El codigo de entrenamiento esta en la rama `robolab-droid-train-edge-privileged-phases` del repositorio `joonyeongs/cosmos-framework` (commit `95bad15`).

## Capacidades

- Generacion de politicas de accion: produce chunks de 32 pasos de posiciones articulares a partir de observaciones del entorno robotico.
- Control de manipulacion robotica en tareas de picking, apilado y clasificacion (seis tareas del dataset RoboLab).
- Integracion con el servidor de evaluacion RoboLab (`RobolabPolicyService`) y con el script `action_policy_server_robolab`.
- Soporte de prompt en formato JSON (`--format-prompt-as-json True`) y de intervalos de guidance (`--guidance-interval 960 1001`).
- Capacidad multimodal heredada del modelo base Cosmos3 (vision y texto), aunque la torre de comprension permanece congelada en este checkpoint.
- No se documentan capacidades de tool calling, agentes multi-paso, thinking mode ni audio en la informacion disponible.

## Casos de uso

- Investigacion en aprendizaje por imitacion: usar el checkpoint como punto de partida para estudiar como afecta el ajuste fino completo del generador sobre 1.000 pasos a la calidad de las trayectorias generadas, comparando con el modelo base.
- Reproduccion de recetas de fine-tuning: el repositorio incluye hiperparametros, hardware, commit de codigo y fichero de procedencia (`robolab_finetune.json`), lo que permite replicar el entrenamiento en 2x A100-80GB en aproximadamente 6,7 horas.
- Evaluacion de politicas en RoboLab: desplegar el modelo con `action_policy_server_robolab` en el puerto 8000 y conectarlo al servidor de evaluacion para medir exito en bucle cerrado en las seis tareas del dataset.
- Estudio de datos hibridos: analizar como el muestreo de episodios donde un segundo modelo (PyRUA-Lean) interviene tras fallos afecta a la politica aprendida, comparando con entrenamientos sobre datos puramente de un solo modelo.
- Manipulacion robotica de laboratorio: aplicar el modelo a tareas concretas como apilar bloques en orden de color, colocar alimentos en contenedores o clasificar objetos rojos, siempre dentro del dominio de DROID/RoboLabs.
- Verificacion de exportacion y validacion de checkpoints: usar el script de comprobacion para calcular el error absoluto medio entre acciones predichas y demostradas (MAE medio de 0,1303 rad en el conjunto de validacion del autor) como prueba de humo antes de un despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo proporciona una comprobacion de exportacion que no constituye una evaluacion de politica:

| Episodio | Frame | Tarea | MAE (rad) |
|---|---|---|---|
| 0 | 0 | Put the lizard away in the bin | 0,1928 |
| 0 | 69 | Put the lizard away in the bin | 0,0781 |
| 25 | 0 | Put the canned food in the grey bin | 0,0463 |
| 25 | 60 | Put the canned food in the grey bin | 0,0578 |
| 50 | 0 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0,2342 |
| 50 | 292 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0,1092 |
| 75 | 0 | Put all the red things in the grey bin | 0,2224 |
| 75 | 225 | Put all the red things in the grey bin | 0,1018 |
| | | **Media** | **0,1303** |

El exito en bucle cerrado en RoboLab no ha sido evaluado todavia segun la model card.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 9,2 GB en safetensors, por lo que la inferencia en precision nativa requiere al menos esa cantidad mas overhead de activaciones y contexto visual.
- GPU de entrenamiento utilizadas: 2x A100-80GB (6,7 horas para 1.000 pasos con batch global 64).
- GPU recomendadas para inferencia: A100-80GB o H100 para precision completa; no se documenta soporte en GPUs de consumo.
- Cabe en GPU de consumo: no disponible; no se indica compatibilidad con cuantizaciones GGUF ni formatos ligeros.
- Opciones de despliegue: servidor propio `action_policy_server_robolab` del framework Cosmos y `RobolabPolicyService` para evaluacion. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joonyeongs/cosmos3-edge-policy-droid-hybrid-pyrua-sol-layout-seed0-150-full-ft-1k | 3,86 B | no disponible | Politica robotica (DROID/RoboLabs) | OpenMDW 1.1 | Hugging Face, 0 descargas |
| nvidia/Cosmos3-Edge-Policy-DROID (base) | no disponible | no disponible | Politica robotica | OpenMDW 1.1 | Hugging Face (NVIDIA) |
| PyRUA-Lean (GPT-6.2 Sol) | no disponible | no disponible | Politica robotica (componente hibrido del dataset) | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No se ha evaluado el exito en bucle cerrado en RoboLab; el unico dato numerico es un MAE de exportacion (0,1303 rad), que no mide exito de tarea.
- El dataset de entrenamiento es muy reducido: 150 episodios, 25 por tarea, con seis tareas concretas; la generalizacion fuera de ese dominio es incierta.
- El modelo se entreno sobre datos hibridos donde un segundo modelo (PyRUA-Lean) interviene tras fallos, lo que puede introducir sesgos hacia fases de recuperacion poco representativas de una politica autonoma.
- Debe servirse con el flip de gripper por defecto (no pasar `--no-flip-gripper`); omitirlo puede degradar el control del efector final.
- La torre de comprension esta congelada, por lo que las capacidades multimodales no se han adaptado a este dominio.
- Licencia OpenMDW 1.1: es necesario revisar sus terminos para uso comercial; la model card no detalla restricciones adicionales.
- Modelo de investigacion con 0 descargas y 0 likes; no hay evidencia de uso en produccion ni validacion independiente.
- No se documentan idiomas soportados, contexto maximo ni opciones de cuantizacion, lo que limita la planificacion de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-hybrid-pyrua-sol-layout-seed0-150-full-ft-1k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de entrenamiento: https://huggingface.co/datasets/joonyeongs/cosmos3-edge-hybrid-pyrua-sol-layout-seed0-150
- Dataset de verificacion: https://huggingface.co/datasets/joonyeongs/cosmos3-edge-pyrua-sol-fixed-150
- Codigo de entrenamiento: https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/

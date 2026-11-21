# joonyeongs/cosmos3-edge-policy-droid-hybrid-pyrua-sol-fixed-150-full-ft-1k

## Resumen

Cosmos3-Edge-Policy-DROID es un modelo de política (policy model) para robótica desarrollado por NVIDIA dentro de la familia Cosmos3. Este repositorio concreto es un ajuste fino (fine-tuning) completo del checkpoint base `nvidia/Cosmos3-Edge-Policy-DROID`, realizado por el usuario joonyeongs mediante la receta RoboLab DROID. El modelo transforma observaciones visuales y consignas de tarea en secuencias de acciones motoras (chunks de posiciones articulares de 32 pasos), lo que lo sitúa en la categoría de modelos visiomotoros (vision-language-action) orientados a control robótico de manipulación.

El ajuste se ha entrenado sobre 150 episodios híbridos (25 por cada una de seis tareas) recogidos con un esquema de recolección en el que Cosmos3-Edge actúa por defecto y PyRUA-Lean (GPT-6.2 Sol) toma el relevo únicamente en las fases en las que Cosmos3 falla, tras un rollback. El entrenamiento consistió en 1.000 actualizaciones con un batch global de 64 sobre 2 GPUs A100-80GB, con un learning rate de 2e-05, 50 pasos de warmup lineal y decaimiento lineal posterior.

El modelo tiene 3.859.003.312 parámetros (≈3,86 mil millones) y un tamaño de repositorio de 9,2 GB. Se distribuye en formato safetensors bajo la licencia OpenMDW 1.1, la misma del modelo base. Es relevante para la comunidad de robótica porque demuestra un flujo de ajuste fino completo sobre un modelo de política de NVIDIA, con código de entrenamiento publicado y un servidor de evaluación (RoboLab) listo para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3 (familia cosmos3_omni); no se detalla la topología interna en la información disponible |
| Parametros totales | 3.859.003.312 (≈3,86 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License 1.1 |
| Formato de pesos | safetensors (shards del transformer; el repo replica el layout del checkpoint base) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Cosmos3 y se etiqueta como `cosmos3_omni` y `policy model`. La información disponible no detalla la arquitectura interna (si es transformer denso, MoE o híbrida), pero sí indica que el ajuste fino se aplicó únicamente al "generator" (todos los pesos del lado del generador), manteniendo congelada la "understanding tower" con K/V de texto cacheadas. Esto sugiere una arquitectura de dos componentes: una torre de comprensión (procesamiento de la consigna/observación textual) y un generador que produce las acciones.

El entrenamiento se realizó sobre el dataset `droid_plus_lerobot_640x360_20260412`, con muestreo de una única pool y ventanas de trayectoria completa muestreadas uniformemente. Se ejecutaron 1.000 pasos (checkpoint `iter_000001000`) con batch global de 64 (2 GPUs × 32 × acumulación de gradiente 1), learning rate 2e-05, 50 pasos de warmup lineal y decaimiento lineal a cero. El coste fue de 6,7 horas en 2× A100-80GB. El código de entrenamiento está disponible en la rama `robolab-droid-train-edge-privileged-phases` del repositorio `joonyeongs/cosmos-framework` (commit de entrenamiento `95bad15`).

## Capacidades

- Generación de políticas de acción robótica: produce chunks de 32 pasos de posiciones articulares (joint-position) a partir de observaciones visuales y consignas de tarea.
- Control visiomotor para manipulación: entrenado sobre tareas de tipo "pick-and-place", apilado de bloques y clasificación de objetos por color.
- Operación en bucle cerrado (closed-loop) mediante el servidor de evaluación RoboLab (`RobolabPolicyService`).
- Soporte de prompt en formato JSON (`--format-prompt-as-json True`).
- Integración con el framework Cosmos (`cosmos_framework.scripts.action_policy_server_robolab`).
- Ajuste específico para el dominio DROID (manipulación robótica de escritorio).
- No se dispone de información sobre capacidades multilingües, tool calling, agentes o modos de razonamiento; el modelo es específicamente un policy model, no un LLM conversacional.

## Casos de uso

- Manipulación robótica de escritorio (pick-and-place): el modelo recibe la observación visual y la consigna y emite chunks de 32 posiciones articulares, adecuado para controlar brazos robóticos en tareas como "guardar el lagarto en la papelera" o "poner la comida enlatada en la papelera gris".
- Apilado de objetos con orden específico: entrenado para "apilar los bloques en orden de abajo a arriba: rojo, azul, verde, amarillo", lo que permite abordar tareas de ensamblaje con secuenciación estricta.
- Clasificación de objetos por atributo: la tarea "poner todas las cosas rojas en la papelera gris" demuestra capacidad de selección guiada por atributo de color.
- Investigación en recolección de datos híbrida: sirve como referencia para estudiar esquemas de recolección donde un modelo base actúa y otro toma el relevo en fases fallidas, útil para diseñar pipelines de datos robóticos más eficientes.
- Evaluación de políticas en RoboLab: el modelo se puede servir con `action_policy_server_robolab` y evaluar en bucle cerrado sobre el benchmark RoboLab (aunque el autor indica que la evaluación de éxito en bucle cerrado aún no se ha realizado).
- Punto de partida para ajustes finos posteriores: al mantener el layout exacto del checkpoint base y publicar el código de entrenamiento, es reutilizable como base para nuevos fine-tunings sobre dominios DROID.
- Reproducción de experimentos: los hashes de procedencia (`robolab_finetune.json`) y la configuración de entrenamiento permiten reproducir el ajuste en 2× A100-80GB en aproximadamente 6,7 horas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de éxito de tarea en la información disponible. El autor incluye únicamente una comprobación de exportación (no una evaluación de política) que compara los chunks de 32 pasos predichos con las acciones demostradas, mediante error absoluto medio (MAE, en radianes):

| Episodio | Frame | Tarea | MAE |
|---|---|---|---|
| 0 | 0 | Put the lizard away in the bin | 0,1878 |
| 0 | 69 | Put the lizard away in the bin | 0,0798 |
| 25 | 0 | Put the canned food in the grey bin | 0,0372 |
| 25 | 60 | Put the canned food in the grey bin | 0,0622 |
| 50 | 0 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0,2299 |
| 50 | 292 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0,0881 |
| 75 | 0 | Put all the red things in the grey bin | 0,2298 |
| 75 | 225 | Put all the red things in the grey bin | 0,1288 |
| | | **Media** | **0,1305** |

El propio autor advierte que esta métrica no mide el éxito de la tarea y que el éxito en bucle cerrado en RoboLab no se ha evaluado todavía.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3,86 mil millones de parámetros en safetensors (9,2 GB de repo), la inferencia en precisión completa requiere aproximadamente 8-16 GB de VRAM, y en cuantizaciones de 8/4 bits podría reducirse, aunque no se publican cuantizaciones.
- GPU recomendadas: el entrenamiento se realizó en 2× A100-80GB; para inferencia se recomienda al menos una GPU con 16-24 GB (A100, H100, RTX 4090, L40S).
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) y posiblemente en GPUs de 16 GB con cuantización, aunque no se confirma en la información disponible.
- Opciones de despliegue: servidor de acciones de RoboLab (`python -m cosmos_framework.scripts.action_policy_server_robolab --checkpoint-path <snapshot> --port 8000 --format-prompt-as-json True --guidance-interval 960 1001`). No se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles.
- Nota de despliegue: servir con el "gripper flip" por defecto; no pasar `--no-flip-gripper`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joonyeongs/cosmos3-edge-policy-droid-hybrid-pyrua-sol-fixed-150-full-ft-1k | 3,86 mil millones | no disponible | Policy model (Cosmos3) | OpenMDW 1.1 | Hugging Face (0 descargas) |
| nvidia/Cosmos3-Edge-Policy-DROID (base) | no disponible | no disponible | Policy model (Cosmos3) | OpenMDW 1.1 | Hugging Face |
| Otros policy models de robótica (p. ej. RT-2, OpenVLA) | no disponible | no disponible | VLA | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No se ha evaluado el éxito de tarea en bucle cerrado en RoboLab; la única métrica publicada (MAE de 0,1305 rad) es una comprobación de exportación, no una medida de rendimiento real.
- El modelo está ajustado específicamente sobre seis tareas de manipulación de escritorio del dominio DROID; su generalización a otras tareas, entornos o morfologías robóticas no está demostrada.
- El conjunto de entrenamiento es muy reducido (150 episodios, 25 por tarea), lo que aumenta el riesgo de sobreajuste y de baja robustez ante variaciones de iluminación, disposición de objetos o cámaras.
- Los datos de entrenamiento provienen de un esquema híbrido con relevo de otro modelo (PyRUA-Lean / GPT-6.2 Sol) en fases fallidas, lo que puede introducir sesgos de distribución respecto a demostraciones puramente humanas.
- No se dispone de información sobre sesgos, alucinación, idiomas o robustez; el modelo no es un LLM de propósito general.
- Licencia OpenMDW 1.1: es necesario revisar sus términos (https://openmdw.ai/license/1-1/) antes de cualquier uso comercial; la model card la describe como "other".
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-21), por lo que no cuenta con validación de la comunidad.
- Para servir el modelo es imprescindible usar el gripper flip por defecto; omitirlo puede producir acciones incorrectas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-hybrid-pyrua-sol-fixed-150-full-ft-1k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de recolección: https://huggingface.co/joonyeongs/cosmos3-edge-hybrid-pyrua-sol-fixed-150
- Dataset de evaluación (frames): https://huggingface.co/joonyeongs/cosmos3-edge-pyrua-sol-fixed-150
- Código de entrenamiento: https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/

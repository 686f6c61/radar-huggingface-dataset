# joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-first10-plus-dagger-90-codex-only-full-ft-600-run2

## Resumen

Cosmos3-Edge-Policy-DROID es un modelo de política (policy model) para robótica desarrollado por NVIDIA, construido sobre su familia Cosmos3 y orientado a la generación de acciones motoras a partir de observaciones visuales. Este repositorio concreto, publicado por el usuario `joonyeongs`, es un ajuste fino completo (full fine-tuning) del checkpoint base `nvidia/Cosmos3-Edge-Policy-DROID` sobre el conjunto de datos DROID siguiendo la receta RoboLab, con datos adicionales de DAgger generados con Codex. El resultado es un checkpoint de aproximadamente 3.860 millones de parámetros (3.859.003.312 según los pesos en safetensors) que predice secuencias de 32 pasos de posiciones articulares conjuntas para un robot manipulador.

El modelo resuelve el problema de convertir instrucciones de tarea en lenguaje natural e imágenes de cámara en trayectorias de control de bajo nivel. Se trata de un modelo de política de tipo "edge", pensado para ejecutarse en el bucle de control de un robot, y no de un modelo de lenguaje generalista. Su relevancia radica en que demuestra el flujo de trabajo completo de especialización de un modelo fundacional robótico: partir de un checkpoint de NVIDIA, restringir el conjunto de datos, aplicar DAgger para corregir errores de distribución y publicar el resultado con trazabilidad de hashes y configuración de entrenamiento.

Arquitectura y tamaño: el autor lo describe como un "generator full fine-tuning" dentro del framework Cosmos, con la torre de entendimiento congelada (K/V de texto en caché) y todos los pesos del generador ajustados. El contexto de acción es de 32 pasos. La licencia es OpenMDW 1.1, heredada del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3 (familia Cosmos de NVIDIA); ajuste fino del generador con torre de entendimiento congelada |
| Parametros totales | 3.859.003.312 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (ventana de acción de 32 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (repo de 9,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/Cosmos3-Edge-Policy-DROID` (revisión `0110e64ca982589f1a3d856cbdd7d465dccb79bc`) y aplica un ajuste fino completo del generador: se entrenan todos los pesos del lado generador mientras la torre de entendimiento permanece congelada y utiliza K/V de texto en caché. El entrenamiento se realizó sobre el conjunto `droid_plus_lerobot_640x360_20260412`, restringido a las primeras 10 demos por tarea (60 episodios) de `joonyeongs/cosmos3-edge-pyrua-sol-fixed-150`, más 90 episodios de datos DAgger de `joonyeongs/cosmos3-edge-first10ft400-codex-review-dagger-pyrua-sol-fixed-90` (revisión `f23508e`). Para los datos DAgger solo se admiten ventanas de entrenamiento que comiencen en un frame de Codex (PyRUA-Lean, `source_id` 1), aunque su futuro de 32 pasos puede continuar en frames posteriores de Cosmos3; las demos iniciales usan todas las ventanas de trayectoria completa. Esto da 27.295 ventanas frente a 51.176 sin restricción.

La configuración de entrenamiento: 600 pasos (calculados como 1.000 × 27.295 / 51.176 = 533, redondeado a 600), batch global 64 (2 GPUs × 32 × acumulación 1), learning rate 2e-5 con 30 pasos de warmup lineal y decaimiento lineal hasta 0, checkpoints cada 100 iteraciones. Se ejecutó en 2× A100-80GB durante 2,3 horas. El código de entrenamiento está en la rama `robolab-droid-train-edge-privileged-phases` del repositorio `joonyeongs/cosmos-framework` (commit `95bad15`). El repositorio conserva exactamente el layout del checkpoint base; solo difieren los shards de pesos del transformer. Es un job reanudable: reenviar el fichero continúa desde el último checkpoint bajo `RESUME_ROOT`, y `RESUME_ITER=<n>` permite elegir uno anterior. Esta es la segunda copia independiente de un mismo entrenamiento, con checkpoints, run de W&B y repo de HF propios.

## Capacidades

- Generación de políticas de acción robótica: predice chunks de 32 pasos de posiciones articulares conjuntas a partir de observaciones visuales e instrucciones de tarea.
- Control de manipulación en entornos tipo DROID/RoboLab: tareas como apilar bloques, depositar objetos en contenedores o colocar comida enlatada.
- Integración con el servidor de evaluación RoboLab (`action_policy_server_robolab`) mediante un protocolo de prompt en JSON.
- Ajuste específico para el dataset y las tareas de PyRUA-Lean (`pyrua_sol_fixed_150`), con corrección de distribución mediante DAgger.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito; es un modelo de política, no un asistente conversacional.

## Casos de uso

- Evaluación de políticas en RoboLab: desplegar el checkpoint con `action_policy_server_robolab` en el puerto 8000 y comparar el éxito cerrado frente al modelo base en las tareas de `pyrua_sol_fixed_150`. Es el uso principal previsto por el autor.
- Investigación en imitación con DAgger: servir como referencia de cómo mezclar demos iniciales con datos de corrección (90 episodios Codex) y medir el efecto en el error de predicción de acciones.
- Reproducción de experimentos de ajuste fino robótico: el repo incluye la receta exacta (LR, batch, pasos, warmup, hardware) y los hashes de procedencia, lo que permite replicar el entrenamiento en 2× A100-80GB en unas 2,3 horas.
- Punto de partida para especialización adicional: al conservar el layout del checkpoint base, se puede continuar el ajuste fino con nuevos datos de un robot o entorno concreto.
- Análisis de error de predicción de acciones: usar el MAE por episodio y frame (entre 0,0367 y 0,1984 rad) como señal de diagnóstico de la calidad de la política sobre distintos tipos de tarea.
- Docencia y divulgación sobre modelos fundacionales robóticos: ejemplo completo y trazable de un pipeline de fine-tuning de un policy model de NVIDIA con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de éxito de tarea en la información disponible. El autor incluye únicamente una comprobación de exportación (no una evaluación de política) que compara los chunks de 32 pasos predichos con las acciones demostradas, en radianes:

| Episodio | Frame | Tarea | MAE (rad) |
|---|---|---|---|
| 0 | 0 | Put the lizard away in the bin | 0,0642 |
| 0 | 69 | Put the lizard away in the bin | 0,0762 |
| 25 | 0 | Put the canned food in the grey bin | 0,0367 |
| 25 | 60 | Put the canned food in the grey bin | 0,0566 |
| 50 | 0 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0,0907 |
| 50 | 292 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0,0820 |
| 75 | 0 | Put all the red things in the grey bin | 0,1984 |
| 75 | 225 | Put all the red things in the grey bin | 0,1410 |
| | | **Media** | **0,0932** |

El éxito en bucle cerrado en RoboLab no se ha evaluado todavía.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El entrenamiento se realizó en 2× A100-80GB; el tamaño del repo (9,2 GB) sugiere que los pesos en safetensors caben en GPUs de 24 GB o más, pero no se confirma.
- GPU recomendadas: A100-80GB o H100 para servir el modelo; no se documentan requisitos mínimos.
- GPU de consumo: no disponible; no se indica si cabe en RTX 4090 u otras.
- Opciones de despliegue: servidor específico del framework Cosmos (`python -m cosmos_framework.scripts.action_policy_server_robolab --checkpoint-path <snapshot> --port 8000 --format-prompt-as-json True --guidance-interval 960 1001`). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (joonyeongs/cosmos3-edge-policy-droid-...-600-run2) | 3.859.003.312 | no disponible (chunks de 32 pasos) | OpenMDW 1.1 | Hugging Face |
| nvidia/Cosmos3-Edge-Policy-DROID (base) | no disponible | no disponible | OpenMDW 1.1 | Hugging Face |
| joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-first10-full-ft-400 | no disponible | no disponible | no disponible | Hugging Face |
| joonyeongs/cosmos3-edge-first10ft400-codex-review-dagger-pyrua-sol-fixed-90 | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No se ha evaluado el éxito en bucle cerrado en RoboLab; el MAE de exportación no mide éxito de tarea.
- El modelo está especializado en las tareas y el dataset de PyRUA-Lean/DROID; su generalización a otros robots, entornos o instrucciones no está documentada.
- El MAE varía notablemente según la tarea (0,0367 a 0,1984 rad), lo que indica un rendimiento desigual; la tarea de "Put all the red things in the grey bin" es la peor.
- Debe servirse con el flip de gripper por defecto; no se debe pasar `--no-flip-gripper`, lo que es un caveat operativo importante.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque no es un modelo de lenguaje generalista.
- Licencia OpenMDW 1.1: es necesario revisar sus términos para uso comercial; el autor la hereda del modelo base.
- El repositorio tiene 0 descargas y 0 likes; es un artefacto de investigación reciente, sin validación comunitaria.
- La información de idiomas y cuantizaciones no está disponible, lo que limita la planificación de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-first10-plus-dagger-90-codex-only-full-ft-600-run2
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de demos: https://huggingface.co/joonyeongs/cosmos3-edge-pyrua-sol-fixed-150
- Dataset DAgger: https://huggingface.co/joonyeongs/cosmos3-edge-first10ft400-codex-review-dagger-pyrua-sol-fixed-90
- Checkpoint previo relacionado: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-first10-full-ft-400
- Código de entrenamiento: https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/

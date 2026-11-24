# joonyeongs/cosmos3-edge-policy-droid-ft1k-codex-review-cell-pyrua-sol-fixed-150-lora-r32-a64-1k

## Resumen

Cosmos3-Edge-Policy-DROID es un adaptador LoRA de tipo *policy model* (modelo de política para control robótico) construido sobre la familia Cosmos3 de NVIDIA. El modelo concreto que nos ocupa, publicado por el usuario joonyeongs, aplica un ajuste fino LoRA (rango 32, alpha 64) sobre el checkpoint `cosmos3-edge-policy-droid-pyrua-sol-fixed-150-full-ft-1k`, que a su vez deriva del modelo original `nvidia/Cosmos3-Edge-Policy-DROID`. El objetivo es generar *action chunks* de 32 pasos de posiciones articulares a partir de observaciones visuales en el dominio DROID/RoboLab.

La relevancia de este checkpoint es acotada y muy experimental: se trata de un artefacto de investigación generado automáticamente al final de un job de entrenamiento de 1.000 pasos, con 0 descargas y 0 likes en el momento de redactar esta ficha. No es un modelo de propósito general ni un modelo conversacional: es un componente de una pipeline de robótica (entrenamiento con el *framework* cosmos-framework, rama `robolab-droid-train-edge-privileged-phases`) pensado para servirse mediante el servidor de evaluación `action_policy_server_robolab`.

Arquitectónicamente hereda la estructura de Cosmos3-Edge (modelo de difusión/transformer de política con condicionamiento visual), con 3.859.003.312 parámetros totales en los pesos exportados y un repositorio de 9,2 GB. La longitud de contexto, los idiomas y los tipos de cuantización no están documentados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3 (policy model de difusión/transformer, familia Cosmos3-Edge); detalles internos no disponibles |
| Parametros totales | 3.859.003.312 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de política robótica, no lingüístico) |
| Licencia | OpenMDW License 1.1 (`openmdw1.1-license`), heredada del modelo base |
| Formato de pesos | safetensors (librería `cosmos`, integración con `diffusers`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alpha 64 (learning rate 1e-4) aplicado sobre el *generator* (el transformer generador de acciones) del checkpoint base `joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-full-ft-1k`. Según la model card, el LoRA se fusiona (*merge*) en los pesos de partida durante la exportación, de modo que el repositorio resultante tiene exactamente el mismo layout que el checkpoint base y solo difieren los shards de pesos del transformer. No se documenta la arquitectura interna de Cosmos3-Edge más allá de su naturaleza de modelo de política condicionado por imagen.

El entrenamiento se realizó con la receta RoboLab DROID sobre el dataset `joonyeongs/cosmos3-edge-ft1k-codex-review-cell-pyrua-sol-fixed-150` (25 episodios × 6 tareas, ventanas de trayectoria completa muestreadas uniformemente). Se ejecutaron 1.000 actualizaciones con batch global de 64 (2 GPUs × 32 × acumulación 1), calentamiento lineal de 50 pasos y decaimiento lineal hasta 0, guardando checkpoints cada 250 pasos. El coste de cómputo fue de 7,2 horas en 2× A100-80GB. El código de entrenamiento está en la rama `robolab-droid-train-edge-privileged-phases` del repositorio `joonyeongs/cosmos-framework` (commit `95bad15`).

## Capacidades

- Generación de *action chunks* de 32 pasos de posiciones articulares (joint positions) condicionados por observaciones visuales del entorno robótico.
- Especialización en el dominio DROID/RoboLab con tareas concretas de manipulación (recoger objetos, apilar bloques, clasificar objetos por color).
- Servido como servidor de política mediante `cosmos_framework.scripts.action_policy_server_robolab` con formato de prompt JSON y `guidance-interval 960 1001`.
- Requiere el *gripper flip* por defecto en el servidor (no debe pasarse `--no-flip-gripper`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni *thinking mode*. Es un modelo de política, no un LLM.

## Casos de uso

- Evaluación cerrada en RoboLab: servir el checkpoint con `action_policy_server_robolab` en el puerto 8000 y conectarlo al entorno de simulación RoboLab para medir la tasa de éxito en las tareas del dataset DROID. Es el uso previsto explícito en la model card, aunque la evaluación de éxito en bucle cerrado aún no se ha realizado.
- Reproducción de experimentos de ajuste fino: el checkpoint sirve como punto de partida o referencia para comparar recetas LoRA (rango, alpha, learning rate) sobre el mismo dataset de 25 episodios × 6 tareas.
- Investigación en imitación visual-motora: útil para estudiar cómo un *policy model* de 3,86 mil millones de parámetros generaliza a partir de pocos episodios de demostración en tareas de manipulación con objetos.
- Depuración de pipelines de entrenamiento: dado que el repositorio conserva el layout exacto del checkpoint base, permite validar herramientas de carga, exportación y servicio de Cosmos3 sin reentrenar.
- Benchmarking de error de reconstrucción de acciones: la model card reporta MAE de 0,0809 rad de media sobre 8 frames de validación, lo que permite usar el modelo como referencia para comparar otros adaptadores en la misma métrica.
- Experimentos de robot learning con hardware limitado: al ser un LoRA fusionado de 9,2 GB, puede cargarse en GPUs de gama alta de consumo (ver sección de hardware) para pruebas rápidas de inferencia fuera de un clúster A100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no es un modelo de lenguaje. La model card incluye únicamente una comprobación de exportación que mide el error absoluto medio (MAE) entre las acciones predichas y las demostradas, y que el autor advierte explícitamente que **no** es una medida de éxito de tarea:

| Episodio | Frame | Tarea | MAE (rad) |
|---|---|---|---|
| 0 | 0 | Put the lizard away in the bin | 0,0591 |
| 0 | 69 | Put the lizard away in the bin | 0,0471 |
| 25 | 0 | Put the canned food in the grey bin | 0,0530 |
| 25 | 60 | Put the canned food in the grey bin | 0,0553 |
| 50 | 0 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0,0956 |
| 50 | 292 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0,0221 |
| 75 | 0 | Put all the red things in the grey bin | 0,1961 |
| 75 | 225 | Put all the red things in the grey bin | 0,1187 |
| | | **Media** | **0,0809** |

El éxito en bucle cerrado en RoboLab no ha sido evaluado todavía, según la propia model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 3,86 mil millones de parámetros en safetensors, los pesos en FP16/BF16 ocupan aproximadamente 7,7 GB, por lo que se necesita holgura adicional para activaciones y buffers del servidor de política.
- GPU recomendadas: el entrenamiento se realizó en 2× A100-80GB (7,2 h para 1.000 pasos). Para inferencia, una única A100-80GB o H100 es un entorno seguro; no se documentan requisitos mínimos.
- GPU de consumo: probablemente viable en RTX 4090 (24 GB) o RTX 3090 (24 GB) en precisión reducida, aunque no está verificado ni documentado por el autor.
- Opciones de despliegue: servidor específico `cosmos_framework.scripts.action_policy_server_robolab` (puerto 8000, `--format-prompt-as-json True`, `--guidance-interval 960 1001`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo de política de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cosmos3-edge-policy-droid-ft1k-codex-review-cell-pyrua-sol-fixed-150-lora-r32-a64-1k (este) | 3.859.003.312 | no disponible | OpenMDW 1.1 | Hugging Face, 0 descargas |
| joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-full-ft-1k (modelo base) | no disponible | no disponible | OpenMDW 1.1 (heredada) | Hugging Face |
| nvidia/Cosmos3-Edge-Policy-DROID (modelo original) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos checkpoints (mismo dominio y misma familia), por lo que la comparativa se limita a la jerarquía de derivación y a la licencia. No se conocen alternativas de otros autores con benchmarks publicados en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente experimental: 0 descargas y 0 likes, generado automáticamente al final de un job de entrenamiento; no ha pasado por una revisión de calidad independiente.
- El éxito en bucle cerrado en RoboLab no se ha evaluado; la única métrica disponible (MAE de 0,0809 rad) mide reconstrucción de acciones sobre frames de validación, no éxito de tarea.
- Entrenado sobre un dataset muy pequeño (25 episodios × 6 tareas), por lo que la generalización a entornos, objetos o tareas fuera de esa distribución es muy dudosa.
- El MAE varía considerablemente entre frames (de 0,0221 a 0,1961 rad), lo que sugiere sensibilidad al estado inicial y a la fase de la trayectoria.
- Requiere configuración específica de servido (gripper flip por defecto, formato JSON, intervalos de guidance); una configuración incorrecta puede degradar las predicciones.
- Licencia OpenMDW 1.1 heredada del modelo base: es necesario revisar sus términos para uso comercial, ya que la model card no detalla restricciones adicionales.
- No se documentan sesgos, riesgos de alucinación lingüística ni limitaciones idiomáticas porque el modelo no genera lenguaje; el riesgo relevante es el fallo silencioso en la predicción de acciones.
- Dependencia de la rama de código no estándar `robolab-droid-train-edge-privileged-phases` del repositorio del autor, lo que complica la reproducibilidad a medio plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-ft1k-codex-review-cell-pyrua-sol-fixed-150-lora-r32-a64-1k
- Modelo base (full fine-tune 1k): https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-full-ft-1k
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de entrenamiento: https://huggingface.co/joonyeongs/cosmos3-edge-ft1k-codex-review-cell-pyrua-sol-fixed-150
- Dataset de validación (frames PyRUA): https://huggingface.co/joonyeongs/cosmos3-edge-pyrua-sol-fixed-150
- Código de entrenamiento (rama `robolab-droid-train-edge-privileged-phases`): https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/

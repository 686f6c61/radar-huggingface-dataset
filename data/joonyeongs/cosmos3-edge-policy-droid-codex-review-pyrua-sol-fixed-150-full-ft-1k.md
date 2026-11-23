# joonyeongs/cosmos3-edge-policy-droid-codex-review-pyrua-sol-fixed-150-full-ft-1k

## Resumen

Cosmos3-Edge-Policy-DROID es un modelo de política (policy model) para robótica desarrollado por NVIDIA, diseñado para generar secuencias de acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural. Esta ficha concreta no es el checkpoint oficial, sino un fine-tuning completo del generador realizado por el usuario joonyeongs sobre el checkpoint base `nvidia/Cosmos3-Edge-Policy-DROID`, dentro del ecosistema RoboLab y sobre el conjunto de datos DROID. El modelo resultante tiene 3.859 millones de parámetros y se distribuye en formato safetensors con una licencia OpenMDW 1.1.

El fine-tuning se ha realizado sobre 150 episodios exitosos (25 por cada una de seis tareas robóticas) y ha entrenado únicamente los pesos del generador, manteniendo congelada la torre de comprensión con pares clave-valor de texto en caché. El modelo se enmarca en la familia Cosmos3 de NVIDIA, que combina generación visual y razonamiento multimodal para control robótico, y emplea un esquema híbrido de propuesta-revisión: Cosmos3-Edge propone cada fragmento de acción, un revisor externo (Codex, GPT-6.2 Sol) evalúa una previsualización de un segundo y, en caso de rechazo, se retrocede la fase y PyRUA-Lean ejecuta la fase completa.

Es relevante ahora porque representa un caso práctico de fine-tuning de políticas robóticas de extremo a extremo sobre datos de manipulación reales (DROID), con un pipeline de entrenamiento reproducible (2 GPU A100-80GB, 6,7 horas, 1.000 pasos) y un servidor de evaluación RoboLab documentado. No obstante, el propio autor advierte de que la evaluación de éxito en bucle cerrado aún no se ha realizado, por lo que las métricas publicadas miden únicamente el error de reconstrucción de acciones, no la tasa de éxito de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3 (familia Cosmos3 de NVIDIA); pesos del generador con torre de comprensión congelada; política de acciones por chunks de 32 pasos |
| Parametros totales | 3.859.003.312 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés en los ejemplos del dataset) |
| Licencia | OpenMDW License 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (repo de 9,2 GB; shards del transformer) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/Cosmos3-Edge-Policy-DROID` (revisión `0110e64ca982589f1a3d856cbdd7d465dccb79bc`) y se ha sometido a un fine-tuning completo del lado del generador: se actualizan todos los pesos del generador, mientras que la torre de comprensión permanece congelada y utiliza pares clave-valor de texto en caché. La política propone chunks de 32 pasos de posiciones articulares conjuntas (joint positions) y se sirve mediante `action_policy_server_robolab` con formato de prompt JSON y un intervalo de guía de 960-1001.

El entrenamiento se realizó sobre el conjunto `joonyeongs/cosmos3-edge-codex-review-pyrua-sol-fixed-150` (revisión 042f120), con 150 episodios exitosos (25 por tarea, seis tareas, disposición de objetos por defecto) y todas las ventanas de trayectoria completa (76.547), muestreadas de forma uniforme. Se usaron 2 GPU A100-80GB durante 6,7 horas, con batch global 64 (2×32×1), learning rate 2e-5 con warmup lineal de 50 pasos y decaimiento lineal, 1.000 actualizaciones y checkpoints cada 250 pasos (checkpoint final `iter_000001000`). El código de entrenamiento está en la rama `robolab-droid-train-edge-privileged-phases` del repositorio `joonyeongs/cosmos-framework` (commit `95bad15`).

## Capacidades

- Generación de acciones robóticas: produce chunks de 32 pasos de posiciones articulares a partir de observaciones visuales e instrucciones de tarea.
- Control de manipulación en entornos RoboLab: seis tareas de manipulación (recoger objetos, apilar bloques, clasificar por color, etc.).
- Integración con un pipeline de propuesta-revisión: Cosmos3-Edge propone, un revisor externo evalúa y PyRUA-Lean ejecuta la fase en caso de rechazo.
- Servido como servidor de política: compatible con `RobolabPolicyService` y `action_policy_server_robolab` con prompt JSON.
- Fine-tuning sobre datos DROID: adaptado a la distribución de manipulaciones de DROID y a las tareas concretas del dataset de entrenamiento.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo thinking en la información disponible.

## Casos de uso

- Manipulación robótica de laboratorio: el modelo se usa como política de control en RoboLab para tareas como depositar objetos en contenedores o apilar bloques en un orden específico, generando chunks de 32 pasos de posiciones articulares a partir de la observación visual.
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentos de fine-tuning sobre DROID, ya que el pipeline completo (datos, hiperparámetros, hardware y código) está documentado y es reproducible en 2 GPU A100-80GB.
- Evaluación de pipelines de propuesta-revisión: permite estudiar arquitecturas híbridas donde un modelo de política propone y un revisor externo valida, con retroceso de fase y ejecución alternativa mediante PyRUA-Lean.
- Benchmarking de políticas robóticas: el checkpoint exportado se puede cargar con `RobolabPolicyService` para comparar predicciones de acciones frente a demostraciones, usando el error absoluto medio como métrica de exportación.
- Desarrollo de servidores de política: el script `action_policy_server_robolab` permite desplegar el modelo como servicio HTTP en el puerto 8000 con formato JSON, útil para integrarlo en entornos de simulación o bancos de pruebas.
- Base para fine-tuning específico de tarea: al conservar el layout exacto del checkpoint base y diferir solo en los shards del transformer, es un candidato directo para adaptaciones adicionales sobre nuevas tareas o datasets de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de éxito de tarea en la información disponible. El autor incluye una comprobación de exportación (no una evaluación de política) que compara los chunks predichos de 32 pasos con las acciones demostradas, mediante error absoluto medio en radianes:

| Episodio | Frame | Tarea | MAE |
|---|---|---|---|
| 0 | 0 | Put the lizard away in the bin | 0,1994 |
| 0 | 69 | Put the lizard away in the bin | 0,0680 |
| 25 | 0 | Put the canned food in the grey bin | 0,0536 |
| 25 | 60 | Put the canned food in the grey bin | 0,0751 |
| 50 | 0 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0,2258 |
| 50 | 292 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0,0432 |
| 75 | 0 | Put all the red things in the grey bin | 0,2217 |
| 75 | 225 | Put all the red things in the grey bin | 0,0473 |
| | | **Media** | **0,1167** |

El autor indica explícitamente que el éxito en bucle cerrado de RoboLab no se ha evaluado todavía.

## Requisitos de hardware

- Entrenamiento documentado: 2 GPU A100-80GB durante 6,7 horas para 1.000 pasos con batch global 64.
- VRAM estimada para inferencia: no disponible en la información proporcionada; el repo pesa 9,2 GB en safetensors, por lo que la inferencia en precisión completa requiere al menos esa cantidad más overhead.
- GPU recomendadas: no se especifican para inferencia; el entrenamiento usó A100-80GB.
- ¿Cabe en GPU de consumo? No disponible; no se documenta cuantización ni requisitos para RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: `cosmos_framework.scripts.action_policy_server_robolab` (servidor de política RoboLab) y `RobolabPolicyService`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| joonyeongs/cosmos3-edge-policy-droid-codex-review-pyrua-sol-fixed-150-full-ft-1k | 3.859 M | no disponible | OpenMDW 1.1 | Hugging Face (0 descargas) | Fine-tuning del generador sobre 150 episodios DROID |
| nvidia/Cosmos3-Edge-Policy-DROID | no disponible | no disponible | OpenMDW 1.1 | Hugging Face (checkpoint base) | Modelo base oficial de NVIDIA |
| Alternativas de política robótica de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se ha evaluado el éxito en bucle cerrado de RoboLab; las métricas publicadas son solo de error de reconstrucción de acciones y no miden si las tareas se completan.
- El fine-tuning se ha realizado sobre solo 150 episodios y seis tareas concretas, por lo que la generalización a otras tareas, objetos o distribuciones no está garantizada.
- El modelo depende de un pipeline externo de revisión (Codex/GPT-6.2 Sol) y de PyRUA-Lean para el retroceso de fase; su comportamiento fuera de ese esquema no está documentado.
- La torre de comprensión está congelada durante el entrenamiento, lo que puede limitar la adaptación a vocabulario o instrucciones nuevas.
- No se documentan sesgos conocidos, riesgos de alucinación en el sentido lingüístico ni limitaciones de idioma; los idiomas soportados figuran como no disponibles.
- La licencia OpenMDW 1.1 debe revisarse para uso comercial; el autor la hereda del modelo base y no ofrece garantías adicionales.
- El modelo se ha subido automáticamente al final del entrenamiento y cuenta con 0 descargas y 0 likes, sin validación comunitaria.
- Para el servido debe usarse el giro de pinza por defecto (no pasar `--no-flip-gripper`); ignorarlo puede degradar el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-codex-review-pyrua-sol-fixed-150-full-ft-1k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de entrenamiento: https://huggingface.co/joonyeongs/cosmos3-edge-codex-review-pyrua-sol-fixed-150
- Dataset de comprobación de exportación: https://huggingface.co/joonyeongs/cosmos3-edge-pyrua-sol-fixed-150
- Código de entrenamiento: https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/

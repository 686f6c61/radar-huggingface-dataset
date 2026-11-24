# joonyeongs/cosmos3-edge-policy-droid-ft1k-codex-review-cell-pyrua-sol-fixed-150-full-ft-1k

## Resumen

Cosmos3-Edge-Policy-DROID es un modelo de política (policy model) para control robótico, derivado de nvidia/Cosmos3-Edge-Policy-DROID mediante un pipeline de ajuste fino completo. Lo publica el usuario joonyeongs en Hugging Face y está pensado para el entorno de evaluación RoboLab con el conjunto de datos DROID. El modelo no genera texto libre: predice secuencias de acciones motoras (chunks de 32 posiciones articulares) a partir de observaciones visuales y una instrucción de tarea en lenguaje natural.

La arquitectura sigue el esquema Cosmos3 (cosmos3_omni), con una torre de generación que procesa las observaciones y produce las acciones, y una torre de comprensión congelada que aporta las claves/valores de texto en caché. El checkpoint contiene 3.859.003.312 parámetros (unos 3,86 mil millones) en formato safetensors, con un repositorio de 9,2 GB. La longitud de contexto, los idiomas soportados y los tipos de cuantización no están documentados en la información disponible.

Este modelo es relevante porque demuestra un flujo de ajuste fino reproducible sobre hardware modesto (2 GPU A100-80GB durante 6,9 horas) para políticas robóticas. Es una iteración más del linaje de checkpoints de joonyeongs sobre Cosmos3-Edge, en este caso con 1.000 pasos de entrenamiento sobre 25 episodios y 6 tareas del dataset DROID. Su utilidad práctica está acotada a la investigación en manipulación robótica y a la evaluación dentro de RoboLab.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cosmos3 (cosmos3_omni): torre de generación + torre de comprensión congelada con K/V de texto en caché |
| Parámetros totales | 3.859.003.312 |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors |
| Pipeline | no disponible |
| Librería | cosmos |
| Tamaño del repositorio | 9,2 GB |
| Modelo base | joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-full-ft-1k |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Cosmos3-Edge con dos componentes: una torre de generación que se ajusta por completo (todos los pesos del lado generador) y una torre de comprensión que permanece congelada y aporta claves/valores de texto en caché. La salida es un chunk de 32 pasos de posiciones articulares, no texto. El checkpoint conserva exactamente el layout del modelo base; solo difieren los shards de pesos del transformer.

El entrenamiento es un ajuste fino completo (full fine-tuning) con la receta RoboLab DROID, partiendo de joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-full-ft-1k. Se usaron 25 episodios repartidos en 6 tareas del dataset joonyeongs/cosmos3-edge-ft1k-codex-review-cell-pyrua-sol-fixed-150, con todas las ventanas de trayectoria completa muestreadas de forma uniforme. Hiperparámetros: learning rate 2e-5, 50 pasos de warmup lineal, decaimiento lineal a 0, batch global 64 (2 GPU × 32 × acumulación 1), 1.000 actualizaciones con checkpoints cada 250 pasos. Hardware: 2× A100-80GB durante 6,9 horas. El código de entrenamiento está en la rama `robolab-droid-train-edge-privileged-phases` del repositorio joonyeongs/cosmos-framework (commit 95bad15).

## Capacidades

- Predicción de acciones robóticas: genera chunks de 32 pasos de posiciones articulares a partir de observaciones visuales y una instrucción de tarea.
- Control de manipulación en el entorno RoboLab con el conjunto DROID.
- Procesamiento de instrucciones de tarea en lenguaje natural (formato JSON de prompt, según el comando de servicio).
- Integración con el servidor de evaluación RoboLab (`RobolabPolicyService`).
- Ajuste fino completo del lado generador, con la torre de comprensión congelada.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, tool calling, agentes, visión general, audio ni modo thinking.

## Casos de uso

- Evaluación de políticas en RoboLab: servir el checkpoint con `action_policy_server_robolab` en el puerto 8000 y medir el éxito en bucle cerrado en las tareas de manipulación del benchmark.
- Investigación en manipulación robótica con DROID: usar el modelo como punto de partida para estudiar el efecto del ajuste fino completo sobre políticas preentrenadas.
- Reproducción de experimentos: el repositorio incluye el script de entrenamiento y los hashes de procedencia (`robolab_finetune.json`), lo que permite replicar el pipeline con 2 GPU A100-80GB.
- Comparación de recetas de ajuste fino: contrastar este checkpoint de 1.000 pasos con su modelo base y con otras iteraciones del linaje para aislar el efecto de los datos y los hiperparámetros.
- Validación de exportación de checkpoints: usar las comprobaciones de MAE sobre chunks de 32 pasos para verificar que el checkpoint exportado se carga y predice de forma coherente antes de lanzar evaluaciones costosas.
- Base para ajustes posteriores: al conservar el layout del modelo base, puede servir como punto de partida para nuevos ajustes finos sobre otros conjuntos de demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de éxito en tareas en la información disponible. La model card incluye únicamente una comprobación de exportación (no una evaluación de política) que compara los chunks de 32 pasos predichos con las acciones demostradas, en error absoluto medio (rad):

| Episodio | Frame | Tarea | MAE |
|---|---|---|---|
| 0 | 0 | Put the lizard away in the bin | 0,0970 |
| 0 | 69 | Put the lizard away in the bin | 0,0502 |
| 25 | 0 | Put the canned food in the grey bin | 0,0461 |
| 25 | 60 | Put the canned food in the grey bin | 0,0581 |
| 50 | 0 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0,0888 |
| 50 | 292 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0,0401 |
| 75 | 0 | Put all the red things in the grey bin | 0,1731 |
| 75 | 225 | Put all the red things in the grey bin | 0,1321 |
| | | **Media** | **0,0857** |

El autor indica explícitamente que el éxito en bucle cerrado de RoboLab no se ha evaluado todavía.

## Requisitos de hardware

- Entrenamiento documentado: 2× A100-80GB durante 6,9 horas para 1.000 pasos con batch global 64.
- VRAM estimada para inferencia: no disponible en la información proporcionada; con 3,86 mil millones de parámetros en safetensors, el peso bruto ronda los 7,7 GB en FP16 y unos 15,4 GB en FP32, a lo que hay que sumar el estado del servidor de política y las cachés de la torre de comprensión.
- GPU recomendadas: no disponible; el único hardware documentado es A100-80GB para entrenamiento.
- Compatibilidad con GPU de consumo: no disponible; no se documenta despliegue en RTX 4090 ni similares.
- Opciones de despliegue: servidor específico `cosmos_framework.scripts.action_policy_server_robolab` con `--checkpoint-path`, `--port 8000`, `--format-prompt-as-json True` y `--guidance-interval 960 1001`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (cosmos3-edge-policy-droid-ft1k-codex-review-cell-pyrua-sol-fixed-150-full-ft-1k) | 3.859.003.312 | no disponible | Política robótica DROID/RoboLab | OpenMDW 1.1 | Hugging Face, 0 descargas |
| joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-full-ft-1k (modelo base) | no disponible | no disponible | Política robótica DROID/RoboLab | OpenMDW 1.1 | Hugging Face |
| nvidia/Cosmos3-Edge-Policy-DROID (origen del linaje) | no disponible | no disponible | Política robótica DROID | no disponible en la información proporcionada | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos checkpoints en la información proporcionada.

## Limitaciones y advertencias

- El éxito en bucle cerrado de RoboLab no se ha evaluado; la única métrica publicada es un MAE de exportación (media 0,0857 rad), que no mide éxito de tarea.
- El entrenamiento se hizo con solo 25 episodios y 6 tareas, por lo que la generalización a otras tareas o entornos es muy limitada y no está medida.
- El modelo está especializado en manipulación robótica con DROID; no es un modelo de lenguaje general y no debe usarse para generación de texto.
- Es obligatorio servir con el giro de pinza por defecto; no se debe pasar `--no-flip-gripper`, según advierte el autor.
- No se documentan sesgos, riesgos de alucinación, cobertura idiomática ni límites de contexto.
- La licencia OpenMDW 1.1 es la del modelo base; deben revisarse sus términos antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y el checkpoint se subió automáticamente al final del job de entrenamiento; no hay validación externa de su calidad.
- Solo difieren los shards del transformer respecto al modelo base; cualquier herramienta que espere el layout exacto del checkpoint debe respetarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-ft1k-codex-review-cell-pyrua-sol-fixed-150-full-ft-1k
- Modelo base: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-full-ft-1k
- Modelo de origen del linaje: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de evaluación usado en la comprobación de exportación: https://huggingface.co/joonyeongs/cosmos3-edge-pyrua-sol-fixed-150
- Código de entrenamiento: https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/

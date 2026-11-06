# joonyeongs/cosmos3-edge-policy-droid-robolab-lora-r32-a64-2k

## Resumen

Cosmos3-Edge-Policy-DROID RoboLab LoRA r32/a64 (2k pasos, merged) es un fine-tuning del modelo de política robótica `nvidia/Cosmos3-Edge-Policy-DROID` publicado por el usuario joonyeongs. Se trata de un adaptador LoRA de rango 32 y alpha 64 entrenado sobre el conjunto de datos `joonyeongs/robolab-droid-200`, compuesto por 200 demostraciones exitosas del entorno RoboLab con el formato DROID (8 tareas, 25 episodios por tarea). El adaptador se ha fusionado en los pesos base, de modo que el repositorio conserva exactamente la estructura del checkpoint original y se carga igual que este.

El modelo pertenece a la familia Cosmos3 de NVIDIA, orientada a modelos de mundo y políticas de acción para robótica. Con 3.859.003.312 parámetros y un peso de repositorio de 9,2 GB, está pensado para generar trozos de acción (action chunks) de 32 pasos a partir de observaciones visuales y de instrucciones en lenguaje natural, con una frecuencia de condicionamiento de 15 fps y dominio `droid_lerobot`. La relevancia actual radica en que demuestra un flujo completo de especialización de bajo coste (2 GPUs A100-80GB, 2.000 pasos) de un modelo de política generalista a un conjunto reducido de tareas concretas de manipulación.

La información disponible es limitada: no hay resultados de evaluación de éxito en bucle cerrado, no se han publicado benchmarks estándar y la model card solo documenta una comprobación de exportación sobre fotogramas de entrenamiento. Por tanto, esta ficha debe leerse como una descripción técnica del artefacto y de su proceso de entrenamiento, no como una validación de rendimiento en tareas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de política Cosmos3 (familia Cosmos3 Omni, `cosmos3_omni`); detalles internos de la arquitectura no disponibles en la información proporcionada |
| Parametros totales | 3.859.003.312 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible (condicionamiento por instrucciones en lenguaje natural; idioma no especificado) |
| Licencia | OpenMDW-1.1 (heredada del modelo base) |
| Formato de pesos | safetensors (dos shards: `diffusion_pytorch_model-00001-of-00002.safetensors` y `-00002-of-00002.safetensors`) |

## Arquitectura y entrenamiento

El modelo base es `nvidia/Cosmos3-Edge-Policy-DROID` (revisión `0110e64ca982589f1a3d856cbdd7d465dccb79bc`), un modelo de política de la familia Cosmos3 con arquitectura de tipo difusión (los pesos se distribuyen como `diffusion_pytorch_model-*.safetensors`) y dependencia del VAE `Wan-AI/Wan2.2-TI2V-5B` en inferencia. La model card menciona componentes `vae2llm` y `llm2vae`, lo que sugiere un diseño híbrido con una torre de comprensión (entendimiento) y un generador de acciones, aunque la información disponible no detalla la arquitectura interna completa.

El fine-tuning se realizó con LoRA de rango 32 y alpha 64 (escala 2,0) aplicado a las proyecciones q/k/v/o y a las capas MLP up/down del generador, así como a `vae2llm`, `llm2vae` y las fronteras de acción específicas del dominio DROID. La torre de comprensión se mantuvo congelada con K/V de texto cacheadas. El entrenamiento duró 2.000 pasos con batch global de 64 (2 GPUs × 32 × acumulación de gradiente 1), LR de 1e-4 con calentamiento lineal de 100 pasos y decaimiento lineal hasta 0, en precisión BF16 con FSDP de 2 vías, checkpointing selectivo de activaciones y `torch.compile`, sobre 2× A100-80GB. La fusión se realizó como `W += (alpha/rank) · B·A` en FP32 y se almacenó en BF16, conservando al menos el 99,5 % de cada actualización de adaptador (99,99 % global). Para las fronteras de acción por dominio, el delta independiente de dominio se suma a todos los dominios. El código de entrenamiento está en la rama `robolab-droid-lora-train` del repositorio `joonyeongs/cosmos-framework`, con la receta `examples/toml/sft_config/robolab_droid_edge_lora.toml`.

## Capacidades

- Generación de políticas de acción robótica: produce trozos de 32 pasos de posiciones articulares a partir de observaciones visuales e instrucciones de tarea.
- Condicionamiento por lenguaje natural: acepta instrucciones textuales (con opción de formatearlas como JSON mediante `--format-prompt-as-json True`).
- Control de manipulación en el dominio DROID/RoboLab: entrenado específicamente sobre 8 tareas de manipulación (recoger objetos, clasificar por color, seleccionar herramientas, etc.).
- Inferencia como servidor de política: se sirve mediante `cosmos_framework.scripts.action_policy_server_robolab` en el puerto configurable.
- Integración con el ecosistema Cosmos: compatible con la librería `cosmos` y con el pipeline de evaluación RoboLab (`RobolabPolicyService`).
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito; el modelo está especializado en política visomotora.

## Casos de uso

- Evaluación de manipulación en RoboLab: desplegar el checkpoint con `action_policy_server_robolab` y conectarlo al servidor de evaluación RoboLab para medir éxito en bucle cerrado en las 8 tareas del dataset; es el uso previsto por el autor, aunque el éxito aún no se ha medido.
- Investigación en fine-tuning eficiente de políticas robóticas: servir como referencia reproducible de un pipeline LoRA (r32/a64, 2.000 pasos, 2× A100-80GB) para especializar un modelo de política generalista a un dominio reducido.
- Prototipado de tareas de recogida y clasificación: las tareas del dataset (guardar el lagarto en la papelera, poner comida enlatada en la papelera gris, seleccionar el taladro inalámbrico, agrupar objetos rojos) sirven como banco de pruebas para políticas de pick-and-place con instrucciones en lenguaje natural.
- Generación de trayectorias articulares sintéticas: usar los chunks de 32 pasos como datos de aumento o para comparar con demostraciones humanas en estudios de imitación.
- Baseline para comparación de adaptadores: al conservar la estructura exacta del base, permite comparar directamente el efecto de distintas configuraciones LoRA sobre las mismas tareas.
- Despliegue en laboratorio con hardware moderado: al ser un modelo de 3,86 mil millones de parámetros en BF16 (≈7,7 GB de pesos), puede servirse en una única GPU de 24 GB o superior para experimentación, aunque el VAE Wan2.2 añade requisitos adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente una comprobación de exportación sobre fotogramas de entrenamiento que compara el error absoluto medio (rad) de los chunks de 32 pasos predichos frente a las acciones demostradas. El autor advierte explícitamente de que no es una medida de éxito de tarea.

| Episodio | Fotograma | Tarea | Base | Este modelo |
|---|---|---|---|---|
| 0 | 0 | Put the lizard away in the bin | 0,1462 | 0,0519 |
| 0 | 158 | Put the lizard away in the bin | 0,0992 | 0,0491 |
| 25 | 0 | Put the canned food in the grey bin | 0,1767 | 0,0654 |
| 25 | 97 | Put the canned food in the grey bin | 0,2046 | 0,0278 |
| 50 | 0 | Select the cordless drill and put it on the table | 0,1723 | 0,1416 |
| 50 | 141 | Select the cordless drill and put it on the table | 0,1868 | 0,1407 |
| 75 | 0 | Put all the red things in the grey bin | 0,1828 | 0,0922 |
| 75 | 225 | Put all the red things in the grey bin | 0,3472 | 0,2855 |
| | | **Media** | **0,1895** | **0,1068** |

El éxito en bucle cerrado en RoboLab no ha sido evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 suman aproximadamente 7,7 GB (3,86 mil millones de parámetros × 2 bytes); el repositorio ocupa 9,2 GB. A ello se añade el VAE `Wan-AI/Wan2.2-TI2V-5B`, que se descarga en inferencia y no está cuantificado en la información disponible.
- GPU recomendadas: el autor entrenó con 2× A100-80GB; para servir el modelo se recomienda al menos una GPU con 24 GB (RTX 4090, L4, A10G) y preferiblemente A100/H100 si se ejecuta junto al VAE y en paralelo con el servidor de evaluación.
- Cabe en GPU de consumo: sí, en principio, en tarjetas con 24 GB o más, siempre que el VAE y el resto del pipeline quepan en memoria; no se han publicado mediciones de VRAM pico.
- Opciones de despliegue: servidor propio `cosmos_framework.scripts.action_policy_server_robolab` (puerto configurable, `--format-prompt-as-json`, `--guidance-interval 960 1001`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Cosmos3-Edge-Policy-DROID RoboLab LoRA merged) | 3.859.003.312 | no disponible | RoboLab/DROID (8 tareas) | OpenMDW-1.1 | Hugging Face, 0 descargas |
| nvidia/Cosmos3-Edge-Policy-DROID (base) | no disponible en la información | no disponible | DROID generalista | OpenMDW-1.1 | Hugging Face (NVIDIA) |
| Otros modelos de política robótica comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento del modelo base ni de alternativas, por lo que no es posible establecer una comparación cuantitativa más allá del error de exportación mostrado en la sección anterior.

## Limitaciones y advertencias

- No se ha evaluado el éxito en bucle cerrado en RoboLab; el único dato numérico proviene de fotogramas de entrenamiento y no mide la capacidad real de la política.
- El entrenamiento se realizó sobre solo 200 demostraciones (25 por tarea, 8 tareas), todas usadas para entrenamiento y sin conjunto de validación separado; el riesgo de sobreajuste es alto.
- El modelo está especializado en el dominio `droid_lerobot` y en las 8 tareas concretas del dataset; no se espera generalización a otras tareas, entornos o morfologías de robot.
- La torre de comprensión se congeló durante el fine-tuning, por lo que la comprensión del lenguaje no se ha adaptado al nuevo dominio.
- No se documentan sesgos conocidos, riesgos de alucinación en el sentido textual ni limitaciones idiomáticas, pero al ser un modelo de política no genera texto libre; los sesgos relevantes serían de comportamiento físico (por ejemplo, preferencias de trayectoria derivadas de las demostraciones).
- Licencia OpenMDW-1.1 heredada del modelo base: es necesario revisar sus términos para uso comercial, ya que la model card la etiqueta como "other".
- Dependencia del VAE `Wan-AI/Wan2.2-TI2V-5B` descargado en inferencia, lo que añade un requisito de red y de almacenamiento no reflejado en el tamaño del repositorio.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día; no hay evidencia de uso o validación por parte de la comunidad.
- Los metadatos de política (`checkpoint.json`: chunk de 32 pasos, 15 fps, dominio `droid_lerobot`) son los del modelo base y no se han reajustado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-robolab-lora-r32-a64-2k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de entrenamiento: https://huggingface.co/datasets/joonyeongs/robolab-droid-200
- Repositorio de código de entrenamiento: `joonyeongs/cosmos-framework`, rama `robolab-droid-lora-train` (receta `examples/toml/sft_config/robolab_droid_edge_lora.toml`)
- VAE utilizado en inferencia: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Resultados de búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; el único resultado devuelto (https://microbit.org/buy/accessories/) no guarda relación con el modelo.

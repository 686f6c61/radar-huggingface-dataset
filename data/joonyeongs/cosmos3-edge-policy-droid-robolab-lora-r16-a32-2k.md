# joonyeongs/cosmos3-edge-policy-droid-robolab-lora-r16-a32-2k

## Resumen

Cosmos3-Edge-Policy-DROID con adaptadores LoRA fusionados es un modelo de política (policy model) para control robótico derivado de nvidia/Cosmos3-Edge-Policy-DROID. Lo publica el usuario joonyeongs y consiste en el checkpoint base afinado mediante LoRA de rango 16 y alpha 32 sobre el conjunto joonyeongs/robolab-droid-200, compuesto por 200 demostraciones exitosas de RoboLab DROID (25 por tarea, 8 tareas). El adaptador está fusionado en los pesos base, de modo que el repositorio conserva exactamente la estructura del checkpoint original y se carga igual que él.

El modelo resuelve el problema de adaptar una política generalista de manipulación robótica a un conjunto reducido de tareas específicas de un laboratorio concreto. Con 3.859.003.312 parámetros totales y un peso de repositorio de 9,2 GB, se distribuye en formato safetensors y se sirve mediante el servidor de políticas de RoboLab incluido en el framework Cosmos. La inferencia genera trozos de acción (action chunks) de 32 pasos a 15 fps en el dominio droid_lerobot.

Su relevancia es doble: por un lado demuestra el flujo completo de afinado LoRA sobre un modelo de política de gran tamaño con recursos moderados (2 GPU A100-80GB); por otro, sirve como referencia de cómo publicar adaptadores fusionados manteniendo la compatibilidad de carga con el modelo base. No obstante, el autor advierte explícitamente de que no se ha evaluado el éxito en bucle cerrado en RoboLab, por lo que las métricas publicadas son solo de error de reconstrucción sobre fotogramas de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de política Cosmos3 (familia cosmos3_omni, librería `cosmos`, basado en `diffusers`) con torre de comprensión congelada y generador afinado por LoRA |
| Parametros totales | 3.859.003.312 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (heredada del modelo base) |
| Formato de pesos | safetensors (`transformer/diffusion_pytorch_model-0000{1,2}-of-00002.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de nvidia/Cosmos3-Edge-Policy-DROID (revisión `0110e64ca982589f1a3d856cbdd7d465dccb79bc`), un modelo de política de la familia Cosmos3 con arquitectura de tipo omni que combina una torre de comprensión (entendimiento) congelada, que opera con K/V de texto en caché, y un generador de acciones. Sobre el generador se aplicó LoRA de rango 16 y alpha 32 (escala 2,0) en las proyecciones q/k/v/o y en las capas MLP up/down del generador, así como en los módulos `vae2llm`, `llm2vae` y en las fronteras de acción específicas del dominio DROID.

El entrenamiento se realizó durante 2.000 pasos (checkpoint `iter_000002000`) con batch global de 64 (2 GPU × 32 × acumulación de gradiente 1), tasa de aprendizaje 1e-4 con calentamiento lineal de 100 pasos y decaimiento lineal hasta 0, en precisión BF16, con FSDP de 2 vías, checkpointing selectivo de activaciones y `torch.compile`, sobre 2× A100-80GB. El conjunto de datos son 200 demostraciones exitosas de RoboLab DROID, todas usadas para entrenamiento. La fusión se realizó como `W += (alpha/rank) · B·A` en FP32 y se almacenó en BF16; según el autor, sobrevive al redondeo BF16 el 99,5 % o más de cada actualización de adaptador (99,99 % en conjunto). Para las fronteras de acción por dominio, el delta independiente del dominio se suma a todos los dominios. Los metadatos de política (`checkpoint.json`) son los del modelo base: chunks de acción de 32 pasos, condicionamiento a 15 fps y dominio `droid_lerobot`. La inferencia descarga además el VAE Wan2.2 (`Wan-AI/Wan2.2-TI2V-5B`), igual que el modelo base.

## Capacidades

- Generación de políticas de acción robótica: predice chunks de 32 pasos de posiciones articulares (joint positions) a partir de observaciones, en el dominio `droid_lerobot`.
- Control de manipulación en tareas de RoboLab: las 8 tareas del conjunto de entrenamiento incluyen recoger objetos, seleccionar herramientas y clasificar objetos por color.
- Condicionamiento multimodal: combina torre de comprensión (texto/instrucciones) con generador de acciones, con K/V de texto en caché para eficiencia.
- Servicio como servidor de políticas: se despliega con `cosmos_framework.scripts.action_policy_server_robolab` en el puerto indicado, con formato de prompt JSON y `guidance-interval 960 1001`.
- Compatibilidad de carga con el modelo base: al estar el adaptador fusionado, el repositorio se carga exactamente como el checkpoint original.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo thinking; el modelo está especializado en política robótica.

## Casos de uso

- Evaluación de políticas en RoboLab: servir el checkpoint con el servidor de políticas de RoboLab y medir el éxito en bucle cerrado en las 8 tareas del conjunto, algo que el autor aún no ha realizado y que constituye el paso natural siguiente.
- Adaptación rápida a nuevas tareas de laboratorio: el flujo LoRA con 200 demostraciones (25 por tarea) sirve de plantilla para afinar el modelo base a otras tareas con recursos moderados (2× A100-80GB) y publicar el adaptador fusionado.
- Reproducción de experimentos de afinado: la receta `examples/toml/sft_config/robolab_droid_edge_lora.toml` de la rama `robolab-droid-lora-train` permite reproducir el entrenamiento y comparar hiperparámetros (rango, alpha, pasos).
- Investigación en manipulación con instrucciones en lenguaje natural: el modelo asocia instrucciones textuales (por ejemplo, "Put the lizard away in the bin") con secuencias de acción, útil para estudiar el alineamiento entre lenguaje y control motor.
- Base para comparativas de políticas: al mantener la estructura del checkpoint base, permite comparar directamente el efecto de un adaptador fusionado frente al modelo original en el mismo servidor de evaluación.
- Desarrollo de pipelines de robótica con `diffusers`: al usar la librería `cosmos` y pesos en safetensors, se integra en flujos de inferencia basados en diffusers para generación de acciones.
- Prototipado de control en simulación antes de transferencia al robot real: el condicionamiento a 15 fps y los chunks de 32 pasos facilitan la generación de trayectorias cortas para pruebas en simulador.

## Benchmarks y rendimiento

El autor publica una comprobación de exportación (no una evaluación de política) que compara el error absoluto medio (rad) de los chunks de 32 pasos predichos frente a las acciones demostradas, sobre fotogramas de entrenamiento:

| Episodio | Fotograma | Tarea | Base | Este modelo |
|---|---|---|---|---|
| 0 | 0 | Put the lizard away in the bin | 0,1462 | 0,0708 |
| 0 | 158 | Put the lizard away in the bin | 0,0992 | 0,0693 |
| 25 | 0 | Put the canned food in the grey bin | 0,1767 | 0,1044 |
| 25 | 97 | Put the canned food in the grey bin | 0,2046 | 0,0329 |
| 50 | 0 | Select the cordless drill and put it on the table | 0,1723 | 0,1179 |
| 50 | 141 | Select the cordless drill and put it on the table | 0,1868 | 0,1553 |
| 75 | 0 | Put all the red things in the grey bin | 0,1828 | 0,0758 |
| 75 | 225 | Put all the red things in the grey bin | 0,3472 | 0,2739 |
| | | **Media** | **0,1895** | **0,1125** |

El autor advierte que estos son fotogramas de entrenamiento y que no constituyen una medida de éxito en la tarea. El éxito en bucle cerrado en RoboLab no se ha evaluado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Entrenamiento: 2× A100-80GB con FSDP de 2 vías, BF16, checkpointing selectivo de activaciones y `torch.compile`.
- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint pesa 9,2 GB en BF16, por lo que se requiere al menos esa cantidad más el VAE Wan2.2 y los buffers de inferencia.
- GPU recomendadas: A100-80GB o H100 para servir el modelo; no se confirma que quepa en GPU de consumo (RTX 4090 de 24 GB) dado el tamaño del checkpoint y las dependencias adicionales.
- Opciones de despliegue: servidor de políticas de RoboLab (`cosmos_framework.scripts.action_policy_server_robolab`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (cosmos3-edge-policy-droid-robolab-lora-r16-a32-2k) | 3.859.003.312 | no disponible | OpenMDW-1.1 | Hugging Face, 0 descargas |
| nvidia/Cosmos3-Edge-Policy-DROID (base) | no disponible en la información | no disponible | OpenMDW-1.1 | Hugging Face (modelo base oficial) |
| Otros modelos de política robótica comparables | no disponible | no disponible | no disponible | no disponible |

La única comparación directa documentada es con el modelo base, sobre el que este checkpoint mejora el error absoluto medio de reconstrucción (0,1125 frente a 0,1895 en media). No se dispone de datos de otros modelos de política de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No se ha evaluado el éxito en bucle cerrado en RoboLab; las métricas publicadas son de error de reconstrucción sobre fotogramas de entrenamiento y no miden la capacidad real de completar tareas.
- El modelo está especializado en el dominio `droid_lerobot` y en las 8 tareas del conjunto robolab-droid-200; su generalización a otras tareas, entornos o robots no está documentada.
- Solo se entrenó con 200 demostraciones exitosas, lo que puede limitar la robustez ante variaciones de iluminación, posiciones de objetos o distractores no vistos.
- Riesgo de alucinación y de predicciones de acción no válidas fuera de la distribución de entrenamiento; no hay evaluación de seguridad física del comportamiento generado.
- Licencia OpenMDW-1.1 heredada del modelo base; es necesario revisar sus términos para uso comercial y redistribución.
- La inferencia descarga el VAE Wan2.2 (`Wan-AI/Wan2.2-TI2V-5B`), una dependencia externa adicional que debe estar disponible.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-04), por lo que no hay validación comunitaria independiente.
- No se documentan sesgos lingüísticos ni de otro tipo, ni limitaciones de contexto o idioma (idiomas soportados: no disponible).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-robolab-lora-r16-a32-2k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de entrenamiento: https://huggingface.co/datasets/joonyeongs/robolab-droid-200
- Repositorio de código del autor: `joonyeongs/cosmos-framework`, rama `robolab-droid-lora-train` (receta `examples/toml/sft_config/robolab_droid_edge_lora.toml`)
- VAE de inferencia: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.

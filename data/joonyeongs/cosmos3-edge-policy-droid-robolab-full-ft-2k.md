# joonyeongs/cosmos3-edge-policy-droid-robolab-full-ft-2k

## Resumen

Cosmos3-Edge-Policy-DROID — RoboLab generator full fine-tuning, 2k steps es un modelo de política (policy model) para control robótico derivado de nvidia/Cosmos3-Edge-Policy-DROID. Lo publica el usuario joonyeongs en Hugging Face y consiste en un ajuste fino completo de todos los pesos del generador sobre un conjunto de 200 demostraciones exitosas de RoboLab DROID (8 tareas, 25 demostraciones por tarea). El resultado es un checkpoint con el mismo layout que el modelo base, pensado para servir políticas de acción en el entorno de evaluación RoboLab.

El modelo parte de la familia Cosmos3 de NVIDIA, que combina un backbone de difusión con un "understanding tower" congelado y un VAE de Wan2.2 para la parte visual. El fine-tuning toca 1.420 millones de parámetros del lado generador (atención, MLP, normas, `vae2llm`, `llm2vae`, time embedder y las fronteras de acción DROID), mientras que la torre de comprensión y `k_norm_und_for_gen` permanecen congeladas con K/V de texto en caché. El checkpoint completo pesa 3.859 millones de parámetros en safetensors.

Es relevante porque muestra un flujo reproducible de especialización de un modelo fundacional de robótica a un dominio concreto con solo 2 GPUs A100-80GB y 13,7 horas de entrenamiento, y porque publica una comprobación de exportación que reduce el error absoluto medio de los chunks de acción de 0,1895 a 0,0902 rad sobre marcos de entrenamiento. Aun así, no hay evaluación de éxito en bucle cerrado, lo que limita cualquier conclusión sobre su rendimiento real en tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de política Cosmos3 (backbone de difusión con torre de comprensión congelada y VAE Wan2.2) |
| Parametros totales | 3.859.003.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (heredada del modelo base) |
| Formato de pesos | safetensors (`transformer/diffusion_pytorch_model-0000{1,2}-of-00002.safetensors`) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del checkpoint base Cosmos3-Edge-Policy-DROID: un generador de difusión acoplado a una torre de comprensión que aporta las claves y valores de texto en caché, más un VAE de Wan2.2 (Wan-AI/Wan2.2-TI2V-5B) que se descarga en tiempo de inferencia. El ajuste fino es de tipo "generator full fine-tuning": se actualizan todos los pesos del lado generador (1,42B parámetros: atención, MLP y normas del generador, `vae2llm`, `llm2vae`, time embedder, fronteras de acción DROID y embedding de modalidad), mientras que la torre de comprensión y `k_norm_und_for_gen` se mantienen congeladas.

El entrenamiento se hizo sobre joonyeongs/robolab-droid-200 (200 demostraciones exitosas de RoboLab DROID, 25 por tarea, 8 tareas), con 2.000 pasos, batch global de 64 (2 GPUs × 32 × grad-accum 1), LR 2e-5 con warmup lineal de 100 pasos y decaimiento lineal a 0, FusedAdam con pesos maestros en FP32, precisión BF16, FSDP a 2 vías, checkpointing selectivo de activaciones y `torch.compile`. El cómputo total fue de 13,7 horas en 2× A100-80GB. La metadata de política (`checkpoint.json`: chunk de acción de 32 pasos, condicionamiento a 15 fps, dominio `droid_lerobot`) es la del modelo base. El código de entrenamiento está en la rama `robolab-droid-lora-train` del repo `joonyeongs/cosmos-framework`, con la receta `examples/toml/sft_config/robolab_droid_edge_full.toml`.

## Capacidades

- Generación de políticas de acción robótica: produce chunks de 32 pasos de posiciones articulares conjuntas condicionados a observaciones visuales y texto.
- Control visomotor en el dominio DROID/RoboLab: tareas de manipulación como recoger objetos, seleccionar herramientas o clasificar objetos por color.
- Condicionamiento por lenguaje: el prompt se pasa en formato JSON (`--format-prompt-as-json True`) al servidor de evaluación.
- Integración con el servidor de políticas RoboLab (`RobolabPolicyService` / `action_policy_server_robolab`).
- Inferencia con VAE externo: descarga Wan2.2-TI2V-5B en tiempo de ejecución.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo ni modos de razonamiento explícito.

## Casos de uso

- Evaluación de políticas en RoboLab: servir el checkpoint con `python -m cosmos_framework.scripts.action_policy_server_robolab` en el puerto 8000 para medir éxito en bucle cerrado en las 8 tareas de entrenamiento.
- Investigación en ajuste fino de modelos fundacionales de robótica: reproducir la receta con 2× A100-80GB y 13,7 horas para estudiar el efecto del full fine-tuning frente a LoRA en políticas visomotoras.
- Manipulación de objetos en el dominio DROID: usar el modelo como política para tareas como "Put the lizard away in the bin" o "Put all the red things in the grey bin", donde el error de chunk baja a 0,0410 rad en marcos de entrenamiento.
- Prototipado de pipelines de robot learning: integrar el servidor de políticas en un bucle de simulación o en un banco de pruebas con el dominio `droid_lerobot` a 15 fps.
- Estudio de transferencia de dominio: comparar el comportamiento del modelo base y este fine-tune sobre las mismas demostraciones para cuantificar la especialización.
- Base para nuevos fine-tunes: al mantener el layout exacto del checkpoint base, sirve como punto de partida para especializar en otros conjuntos de demostraciones DROID.
- Análisis de error de acción: usar la comprobación de exportación (MAE por episodio y fotograma) como referencia para diagnosticar desviaciones en la predicción de chunks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye una comprobación de exportación que no es una evaluación de política, medida como error absoluto medio (rad) entre chunks predichos de 32 pasos y acciones demostradas sobre marcos de entrenamiento:

| Episodio | Fotograma | Tarea | Base | Este modelo |
|---|---|---|---|---|
| 0 | 0 | Put the lizard away in the bin | 0,1462 | 0,0835 |
| 0 | 158 | Put the lizard away in the bin | 0,0992 | 0,0395 |
| 25 | 0 | Put the canned food in the grey bin | 0,1767 | 0,0889 |
| 25 | 97 | Put the canned food in the grey bin | 0,2046 | 0,0222 |
| 50 | 0 | Select the cordless drill and put it on the table | 0,1723 | 0,1881 |
| 50 | 141 | Select the cordless drill and put it on the table | 0,1868 | 0,0995 |
| 75 | 0 | Put all the red things in the grey bin | 0,1828 | 0,0410 |
| 75 | 225 | Put all the red things in the grey bin | 0,3472 | 0,1590 |
| | | **Media** | **0,1895** | **0,0902** |

El éxito en bucle cerrado en RoboLab no se ha evaluado todavía.

## Requisitos de hardware

- Entrenamiento documentado: 2× A100-80GB con BF16, FSDP a 2 vías y checkpointing selectivo de activaciones, 13,7 horas para 2.000 pasos.
- VRAM de inferencia: no disponible en la información proporcionada; el repo pesa 9,2 GB en safetensors y requiere además descargar el VAE Wan2.2-TI2V-5B.
- GPU recomendadas: A100-80GB o H100 para servir el modelo completo; no se confirma compatibilidad con GPUs de consumo.
- Despliegue: servidor propio `cosmos_framework.scripts.action_policy_server_robolab`; no se documentan opciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (joonyeongs/cosmos3-edge-policy-droid-robolab-full-ft-2k) | 3,859B (1,42B entrenados) | no disponible | OpenMDW-1.1 | Hugging Face, 0 descargas | Fine-tune completo sobre 200 demos RoboLab DROID |
| nvidia/Cosmos3-Edge-Policy-DROID (base) | no disponible | no disponible | OpenMDW-1.1 | Hugging Face | Punto de partida; MAE medio 0,1895 rad en la comprobación |
| Otros modelos de política robótica de la familia Cosmos3 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- No hay evaluación de éxito en bucle cerrado en RoboLab; la única métrica publicada es un MAE sobre marcos de entrenamiento, que no mide rendimiento real de la tarea.
- El conjunto de entrenamiento es muy pequeño (200 demostraciones, 8 tareas), por lo que el modelo puede sobreajustar y generalizar mal fuera de esas tareas.
- El fine-tuning solo actualiza el lado generador; la torre de comprensión congelada limita la adaptación a vocabulario o instrucciones nuevas.
- Sesgos conocidos: no documentados.
- Riesgo de alucinación: no aplica en el sentido textual, pero sí riesgo de predicciones de acción erróneas fuera de la distribución de entrenamiento.
- Idiomas soportados: no disponibles; el condicionamiento es por prompt de texto en JSON.
- Licencia OpenMDW-1.1 heredada del modelo base; hay que revisar sus términos para uso comercial.
- Requiere descargar el VAE Wan2.2-TI2V-5B en inferencia, lo que añade dependencias y latencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-robolab-full-ft-2k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset: https://huggingface.co/datasets/joonyeongs/robolab-droid-200
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- VAE Wan2.2: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Código de entrenamiento: repo `joonyeongs/cosmos-framework`, rama `robolab-droid-lora-train`, receta `examples/toml/sft_config/robolab_droid_edge_full.toml` (sin URL directa en la información disponible)

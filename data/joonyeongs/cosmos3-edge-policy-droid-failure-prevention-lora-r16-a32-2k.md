# joonyeongs/cosmos3-edge-policy-droid-failure-prevention-lora-r16-a32-2k

## Resumen

Cosmos3-Edge-Policy-DROID failure-prevention es un fine-tune de tipo LoRA fusionado (merged) sobre el modelo base `nvidia/Cosmos3-Edge-Policy-DROID`, publicado por el usuario `joonyeongs`. Se trata de un modelo de politica (policy model) orientado a control robotico, entrenado para ejecutar tareas de manipulacion en el entorno RoboLab con el dataset DROID, incorporando un sesgo hacia la prevencion de fallos mediante un conjunto de 200 demostraciones exitosas seleccionadas especificamente por su relevancia para evitar errores.

El modelo pertenece a la familia Cosmos3 de NVIDIA y se distribuye a traves de la libreria `cosmos` (con soporte de `diffusers`). Incorpora una torre de comprension (understanding tower) congelada y un generador de acciones que produce chunks de 32 pasos de posiciones articulares a 15 fps, condicionado en dominio `droid_lerobot`. El checkpoint tiene 3.859.003.312 parametros en BF16 y un tamano de repositorio de 9,2 GB.

Su relevancia actual radica en que demuestra un flujo de trabajo de bajo coste (2.000 pasos de entrenamiento en 2 GPU A100-80GB durante 13 horas) para adaptar un modelo de politica generalista de robotica a tareas concretas con preferencia por la prevencion de fallos, manteniendo intacta la estructura del checkpoint base. No obstante, el propio autor advierte de que no se ha evaluado el exito en bucle cerrado (closed-loop success) en RoboLab, por lo que su rendimiento real en tarea no esta verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3 (modelo de politica robotica con torre de comprension congelada y generador de acciones; difusion sobre VAE Wan2.2) |
| Parametros totales | 3.859.003.312 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (`transformer/diffusion_pytorch_model-0000{1,2}-of-00002.safetensors`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base `nvidia/Cosmos3-Edge-Policy-DROID` (revision `0110e64ca982589f1a3d856cbdd7d465dccb79bc`), que combina una torre de comprension de entrada de texto/imagen con un generador de acciones basado en difusion. La inferencia utiliza el VAE de Wan2.2 (`Wan-AI/Wan2.2-TI2V-5B`), que se descarga de forma automatica como en el modelo base. La metadata de politica (`checkpoint.json`) define un chunk de accion de 32 pasos, condicionamiento a 15 fps y dominio `droid_lerobot`.

El fine-tune se realizo con LoRA de rango 16 y alpha 32 (escala 2,0) aplicado sobre las proyecciones q/k/v/o y las capas MLP up/down del generador, sobre `vae2llm`, `llm2vae` y sobre las fronteras de accion del dominio DROID; la torre de comprension permanecio congelada con cache de K/V de texto. Se entrenaron 2.000 pasos (`iter_000002000`) con batch global de 64 (2 GPU × 32 × grad-accum 1), LR de 1e-4 con warmup lineal de 100 pasos y decaimiento lineal a cero, en BF16 con FSDP a 2 vias, activation checkpointing selectivo y `torch.compile`, sobre 2× A100-80GB durante 13 horas. El dataset fue `joonyeongs/cosmos3-edge-failure-prevention-200` (200 demostraciones exitosas de RoboLab DROID, 25 por tarea, 8 tareas, todas usadas en entrenamiento). La fusion se realizo como `W += (alpha/rank) · B·A` en FP32 y se almaceno en BF16, conservando el ≥99,5% de cada actualizacion de adaptador (99,99% global). Para las fronteras de accion por dominio se suma el delta independiente de dominio a cada dominio.

## Capacidades

- Generacion de acciones roboticas en chunks de 32 pasos de posiciones articulares (joint positions) a 15 fps, condicionadas en dominio `droid_lerobot`.
- Control de manipulacion en el entorno RoboLab con 8 tareas del dataset DROID (por ejemplo, "Put the lizard away in the bin", "Put the canned food in the grey bin", "Select the cordless drill and put it on the table", "Put all the red things in the grey bin").
- Prevencion de fallos: el entrenamiento se sesga hacia demostraciones exitosas seleccionadas por su relevancia para evitar errores.
- Servido como politica remota mediante `cosmos_framework.scripts.action_policy_server_robolab` con formato de prompt JSON y `guidance-interval` 960–1001.
- Integracion en el servidor de evaluacion `RobolabPolicyService`.
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas, vision general, tool calling, agentes multi-paso ni multilingue; el modelo esta especializado en politica robotica.

## Casos de uso

- Evaluacion de politicas roboticas en RoboLab: el modelo se sirve con `action_policy_server_robolab` en el puerto 8000 y se consulta desde `RobolabPolicyService` para generar chunks de accion de 32 pasos; es adecuado porque mantiene exactamente el layout del checkpoint base y se carga igual.
- Investigacion en prevencion de fallos en manipulacion: sirve como punto de partida para estudiar como un sesgo hacia demostraciones exitosas afecta a la tasa de errores en tareas DROID, al estar entrenado solo con 200 episodios exitosos orientados a fallos.
- Reproduccion de experimentos de fine-tune LoRA en robotica: el repositorio documenta receta (`robolab_droid_edge_lora.toml`), hiperparametros y hardware (2× A100-80GB, 13 h), lo que permite replicar la adaptacion sobre otros dominios o datasets.
- Base para adaptaciones posteriores: al ser un checkpoint fusionado con el mismo layout que el base, puede reutilizarse como punto de partida para nuevos fine-tunes LoRA sin cambiar el codigo de carga.
- Benchmarking de modelos de politica robotica: util para comparar la fidelidad de prediccion de acciones frente al modelo base en marcos de entrenamiento (el autor reporta MAE medio de 0,0879 rad frente a 0,1986 rad del base en 8 marcos de entrenamiento).
- Despliegue de bajo coste en laboratorio: el entrenamiento cabe en 2 GPU A100-80GB y la inferencia usa el VAE Wan2.2 estandar, lo que facilita montar un servidor de politica en un cluster pequeno.

## Benchmarks y rendimiento

El autor no reporta benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) ni evaluacion de exito en bucle cerrado en RoboLab. La unica medida publicada es una comprobacion de exportacion (no una evaluacion de politica) que compara el error absoluto medio (rad) de los chunks de 32 pasos predichos frente a las acciones demostradas en marcos de entrenamiento:

| Episodio | Frame | Tarea | Base (rad) | Este modelo (rad) |
|---|---|---|---|---|
| 0 | 0 | Put the lizard away in the bin | 0,1028 | 0,0762 |
| 0 | 197 | Put the lizard away in the bin | 0,2645 | 0,0777 |
| 25 | 0 | Put the canned food in the grey bin | 0,1545 | 0,0232 |
| 25 | 123 | Put the canned food in the grey bin | 0,1814 | 0,0314 |
| 50 | 0 | Select the cordless drill and put it on the table | 0,1762 | 0,1206 |
| 50 | 202 | Select the cordless drill and put it on the table | 0,3151 | 0,1896 |
| 75 | 0 | Put all the red things in the grey bin | 0,1864 | 0,0971 |
| 75 | 291 | Put all the red things in the grey bin | 0,2079 | 0,0876 |
| | | **Media** | **0,1986** | **0,0879** |

Estos datos corresponden a marcos de entrenamiento, por lo que no constituyen una medida de exito en tarea. El exito en bucle cerrado en RoboLab no se ha evaluado.

## Requisitos de hardware

- Entrenamiento documentado: 2× A100-80GB durante 13,0 horas con BF16, FSDP a 2 vias y activation checkpointing selectivo.
- Inferencia: requiere cargar el checkpoint BF16 (3.859.003.312 parametros, ~7,7 GB solo en pesos) mas el VAE de Wan2.2 (`Wan-AI/Wan2.2-TI2V-5B`), que se descarga automaticamente; no se especifica la VRAM total necesaria.
- GPU recomendadas: no disponible de forma explicita; por el hardware de entrenamiento, A100-80GB es la referencia. No se documenta compatibilidad con GPU de consumo.
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: servidor `cosmos_framework.scripts.action_policy_server_robolab` (puerto 8000, `--format-prompt-as-json True --guidance-interval 960 1001`) y cliente `RobolabPolicyService`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`joonyeongs/cosmos3-edge-policy-droid-failure-prevention-lora-r16-a32-2k`) | 3.859.003.312 | no disponible | MAE medio 0,0879 rad en marcos de entrenamiento (no cierre de bucle) | OpenMDW-1.1 | Hugging Face, 0 descargas, 0 likes |
| `nvidia/Cosmos3-Edge-Policy-DROID` (base) | no disponible | no disponible | MAE medio 0,1986 rad en los mismos marcos | OpenMDW-1.1 | Hugging Face (NVIDIA) |
| Otros modelos de politica robotica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de terceros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No se ha evaluado el exito en bucle cerrado (closed-loop success) en RoboLab; la unica metrica publicada es una comprobacion de exportacion sobre marcos de entrenamiento, que no mide rendimiento real en tarea.
- El dataset de entrenamiento es muy pequeno (200 episodios, 25 por tarea, 8 tareas) y todas las demostraciones se usaron en entrenamiento, por lo que no hay conjunto de validacion independiente.
- Riesgo de sobreajuste a las tareas y dominios del dataset (`droid_lerobot`); el modelo puede degradarse en configuraciones roboticas distintas.
- El checkpoint fusionado solo difiere del base en los dos safetensors del `transformer`; cualquier cambio en la metadata de politica o en el VAE de Wan2.2 afecta al comportamiento como en el modelo base.
- La licencia OpenMDW-1.1 se hereda del modelo base; es necesario revisar sus terminos para uso comercial (etiquetada como `license: other` con nombre `openmdw1.1-license`).
- No se documentan sesgos, idiomas soportados ni limitaciones de contexto; el modelo no es de proposito general y no debe emplearse para tareas de texto, codigo o vision fuera del control robotico.
- El repositorio tiene 0 descargas y 0 likes, y fue creado el 2026-11-05, por lo que no existe validacion comunitaria.
- La inferencia descarga el VAE `Wan-AI/Wan2.2-TI2V-5B` en tiempo de ejecucion, lo que introduce una dependencia externa y consume ancho de banda y almacenamiento adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-failure-prevention-lora-r16-a32-2k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de entrenamiento: https://huggingface.co/datasets/joonyeongs/cosmos3-edge-failure-prevention-200
- Codigo de entrenamiento: rama `robolab-droid-lora-train` del repositorio `joonyeongs/cosmos-framework` (receta `examples/toml/sft_config/robolab_droid_edge_lora.toml`)
- VAE de inferencia: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Licencia: https://openmdw.ai/license/1-1/

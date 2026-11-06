# joonyeongs/cosmos3-edge-policy-droid-failure-prevention-full-ft-2k

## Resumen

Cosmos3-Edge-Policy-DROID failure-prevention es un ajuste fino completo (full fine-tuning) del modelo de politica robotica `nvidia/Cosmos3-Edge-Policy-DROID` de NVIDIA, publicado por el usuario `joonyeongs`. El modelo parte de la familia Cosmos3 de NVIDIA, orientada a la generacion de acciones y mundos fisicos, y se especializa en la prevencion de fallos durante la ejecucion de tareas de manipulacion robotica en el benchmark RoboLab con el conjunto de datos DROID.

El ajuste se realizo sobre un dataset de 200 demostraciones exitosas de RoboLab DROID orientadas a evitar fallos (25 por tarea, 8 tareas), durante 2.000 pasos con dos GPU A100-80GB. El resultado mantiene exactamente la estructura del checkpoint base: solo difieren los tensores del generador de difusion, mientras que la torre de comprension y las proyecciones de texto permanecen congeladas.

Es relevante porque demuestra que un ajuste fino relativamente corto (13,3 horas en 2 A100) sobre un subconjunto pequeno y curado de datos puede reducir de forma sustancial el error de prediccion de acciones respecto al modelo base, aunque la evaluacion de exito en bucle cerrado aun no se ha publicado. El modelo tiene 3.859.003.312 parametros totales y un repositorio de 9,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de politica basado en difusion (Cosmos3 Omni), con torre de comprension congelada y generador de difusion ajustado |
| Parametros totales | 3.859.003.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (`openmdw1.1-license`) |
| Formato de pesos | safetensors (`diffusion_pytorch_model-0000{1,2}-of-00002.safetensors`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Cosmos3 Omni del checkpoint base: un modelo de politica que combina una torre de comprension (entendimiento de instrucciones y observaciones) con un generador de difusion que produce trozos de accion (action chunks) de 32 pasos a 15 fps, condicionados por el dominio `droid_lerobot`. En la inferencia se descarga tambien el VAE Wan2.2 (`Wan-AI/Wan2.2-TI2V-5B`), igual que en el modelo base.

El ajuste fino afecta unicamente a los pesos del lado del generador (1.420 millones de parametros: atencion, MLP y normas del generador, `vae2llm`, `llm2vae`, time embedder, fronteras de accion DROID y embedding de modalidad). La torre de comprension y `k_norm_und_for_gen` se mantienen congeladas con K/V de texto cacheadas. El entrenamiento uso 2.000 pasos, batch global de 64 (2 GPU x 32 x acumulacion 1), tasa de aprendizaje 2e-5 con warmup lineal de 100 pasos y decaimiento lineal hasta 0, FusedAdam con pesos maestros FP32, precision BF16, FSDP a 2 vias, checkpointing selectivo de activaciones y `torch.compile`, sobre 2 GPU A100-80GB durante 13,3 horas. El dataset de entrenamiento son 200 demostraciones exitosas de RoboLab DROID orientadas a evitar fallos (25 por tarea, 8 tareas), todas usadas para entrenar.

## Capacidades

- Generacion de acciones roboticas: produce trozos de 32 pasos de posiciones articulares condicionados por instrucciones en lenguaje natural y observaciones.
- Politica de manipulacion en RoboLab DROID: especializada en 8 tareas de manipulacion (recoger objetos, clasificar, colocar en contenedores).
- Prevencion de fallos: entrenada especificamente sobre demostraciones exitosas orientadas a evitar errores en la ejecucion.
- Condicionamiento multimodal: integra instrucciones textuales y observaciones visuales mediante la torre de comprension congelada.
- Inferencia como servidor de politica: se sirve mediante `action_policy_server_robolab` con formato de prompt JSON y guiado en el intervalo 960-1001.
- No se ha documentado soporte de tool calling, agentes multi-paso, vision general, audio ni modo thinking; estas capacidades no estan disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion de politicas roboticas en RoboLab: el modelo se sirve con `action_policy_server_robolab` y se consulta para generar trozos de accion de 32 pasos, permitiendo comparar el comportamiento frente al checkpoint base en las 8 tareas DROID.
- Investigacion en prevencion de fallos: sirve como punto de partida para estudiar como el ajuste fino sobre demostraciones exitosas reduce el error de prediccion de acciones (de 0,1986 a 0,0761 rad de MAE medio en marcos de entrenamiento).
- Base para nuevos ajustes finos: al conservar exactamente el layout del checkpoint base, puede reutilizarse como inicializacion para otros datasets de manipulacion con la receta `robolab_droid_edge_full.toml`.
- Prototipado de control de manipuladores: genera comandos de posicion articular a 15 fps que pueden enviarse a un simulador o a un robot compatible con el dominio `droid_lerobot`.
- Reproduccion de experimentos: el repositorio incluye `robolab_finetune.json` con procedencia y hashes, lo que facilita la verificacion y reproduccion del ajuste.
- Docencia y divulgacion: ejemplo concreto de full fine-tuning de un modelo de difusion para politica robotica con recursos moderados (2 A100-80GB, 13,3 horas).
- No se recomienda su uso en produccion robotica real sin una evaluacion de exito en bucle cerrado, que el autor no ha publicado.

## Benchmarks y rendimiento

El autor no publica benchmarks de exito en tareas (closed-loop success). Solo reporta una comprobacion de exportacion que compara los trozos de accion predichos con las acciones demostradas en marcos de entrenamiento (MAE en radianes), lo que no constituye una medida de exito.

| Episodio | Marco | Tarea | Base | Este modelo |
|---|---|---|---|---|
| 0 | 0 | Put the lizard away in the bin | 0,1028 | 0,0741 |
| 0 | 197 | Put the lizard away in the bin | 0,2645 | 0,0288 |
| 25 | 0 | Put the canned food in the grey bin | 0,1545 | 0,0408 |
| 25 | 123 | Put the canned food in the grey bin | 0,1814 | 0,0435 |
| 50 | 0 | Select the cordless drill and put it on the table | 0,1762 | 0,1542 |
| 50 | 202 | Select the cordless drill and put it on the table | 0,3151 | 0,1116 |
| 75 | 0 | Put all the red things in the grey bin | 0,1864 | 0,0818 |
| 75 | 291 | Put all the red things in the grey bin | 0,2079 | 0,0742 |
| | | **Media** | **0,1986** | **0,0761** |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un modelo de politica robotica y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el checkpoint pesa 9,2 GB en safetensors y el modelo base requiere descargar ademas el VAE Wan2.2 (`Wan-AI/Wan2.2-TI2V-5B`), lo que incrementa el consumo.
- GPU recomendadas: el entrenamiento se realizo en 2 GPU A100-80GB; para inferencia se recomienda al menos una GPU con memoria suficiente para el checkpoint completo y el VAE, aunque no se especifica el minimo.
- Viabilidad en GPU de consumo: no confirmada en la informacion disponible; el modelo base y este ajuste no documentan cuantizaciones ni despliegue en GPU consumer.
- Opciones de despliegue: servidor de politica `action_policy_server_robolab` del paquete `cosmos_framework`, con `--checkpoint-path`, `--port 8000`, `--format-prompt-as-json True` y `--guidance-interval 960 1001`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (joonyeongs/cosmos3-edge-policy-droid-failure-prevention-full-ft-2k) | 3.859.003.312 | no disponible | Politica de difusion ajustada para prevencion de fallos en RoboLab DROID | OpenMDW-1.1 | Hugging Face |
| nvidia/Cosmos3-Edge-Policy-DROID (base) | no disponible (mismo layout) | no disponible | Politica de difusion para RoboLab DROID | OpenMDW-1.1 | Hugging Face |
| Otros modelos de politica robotica comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos de politica robotica con los que comparar parametros, contexto o rendimiento en la informacion proporcionada.

## Limitaciones y advertencias

- No se ha evaluado el exito en bucle cerrado (closed-loop success) en RoboLab; la unica metrica publicada es el MAE sobre marcos de entrenamiento, que no mide rendimiento real de la tarea.
- El ajuste se realizo sobre solo 200 demostraciones (25 por tarea, 8 tareas), lo que limita la generalizacion a otras tareas, entornos o variaciones de DROID.
- Riesgo de sobreajuste a las tareas y condiciones especificas del dataset de entrenamiento.
- No se documentan sesgos conocidos, pero al ser un modelo de politica robotica puede heredar sesgos de los datos DROID y de la distribucion de demostraciones.
- Limitaciones de idioma: no se especifican idiomas soportados; el condicionamiento textual depende de la torre de comprension congelada del modelo base.
- Restricciones de licencia: OpenMDW-1.1, heredada del modelo base; es necesario revisar los terminos de dicha licencia para uso comercial.
- Requiere descargar el VAE Wan2.2 en inferencia, lo que anade dependencias y consumo de memoria.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en noviembre de 2026; no hay evidencia de uso o validacion por parte de la comunidad.
- No se debe usar en produccion robotica real sin una evaluacion exhaustiva de seguridad y exito de tareas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-failure-prevention-full-ft-2k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de entrenamiento: https://huggingface.co/datasets/joonyeongs/cosmos3-edge-failure-prevention-200
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- VAE Wan2.2: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Codigo de entrenamiento (rama `robolab-droid-lora-train`): https://github.com/joonyeongs/cosmos-framework (referenciado en la model card como `joonyeongs/cosmos-framework`)

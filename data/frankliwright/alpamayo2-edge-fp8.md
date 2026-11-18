# FrankLiWright/Alpamayo2-Edge-FP8

## Resumen

Alpamayo2-Edge-FP8 es una cuantización de pesos a FP8 (e4m3fn) del modelo NVIDIA Alpamayo 2 Edge, un modelo vision-language-action (VLA) de 2.000 millones de parámetros orientado a razonamiento a bordo de vehículo y planificación de trayectorias. Lo publica FrankLiWright como derivado comunitario, no como lanzamiento oficial de NVIDIA, y su objetivo es concreto: reducir el peso en VRAM de los aproximadamente 5 GiB del checkpoint BF16 a unos 2,5 GiB, de modo que el modelo quepa en GPUs de consumo de 8 GB junto con la entrada de 22 cámaras y el experto de difusión de trayectorias.

La relevancia del checkpoint es práctica más que algorítmica. El modelo base requiere una GPU con soporte BF16 y, en su versión original, deja muy poco margen en tarjetas de 8 GB; esta cuantización permite ejecutar el pipeline completo en PyTorch y `transformers` sobre hardware de escritorio, sin tensor cores FP8. El autor documenta mediciones en una RTX 5060 Laptop de 8 GB que muestran una reducción del pico de VRAM de 7,01 GiB a 4,53 GiB para una trayectoria y de 8,55 GiB a 6,07 GiB para seis trayectorias.

El modelo se distribuye con licencia OpenMDW 1.1, solo soporta inglés y está pensado para investigación y prototipado en conducción autónoma y robótica. No se han publicado resultados de precisión de trayectorias sobre datos reales de conducción, por lo que su uso en producción exige validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) con backbone `cosmos3_edge` y experto de difusión de trayectorias |
| Parametros totales | ~2.000 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (la entrada de ejemplo usa 3.261 tokens de prompt con 22 frames) |
| Tipos de cuantizacion | FP8 e4m3fn weight-only, escala FP32 por canal de salida (por fila de entrada en embeddings); normas, sesgos y parámetros `action_in_proj` / `action_space` en BF16 |
| Idiomas soportados | inglés (`en`) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (`quant.safetensors`), cargados vía PyTorch |
| Modulos cuantizados | 508 (506 `nn.Linear` + 2 `nn.Embedding`) |
| Tamano en disco | 2,49 GiB (frente a 5,30 GB del BF16) |
| VRAM de pesos | ~2,5 GiB (frente a ~5,0 GiB del BF16) |
| Hardware objetivo | cualquier GPU CUDA con soporte BF16 (no requiere tensor cores FP8) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización weight-only del modelo base `nvidia/Alpamayo2-Edge`. La arquitectura subyacente es un VLA: un backbone `cosmos3_edge` (introducido en `transformers==5.17.0`) que procesa entradas multimodales de 22 cámaras junto con historial de ego-movimiento y texto de navegación, y un experto de difusión que genera trayectorias de 64 poses a intervalos de 0,1 s. El pipeline expone `sample_trajectories_from_data` con parámetros de muestreo (`num_traj_sets`, `num_traj_samples`, `max_generation_length`, `inference_step` de difusión).

La cuantización es puramente de pesos: no hay calibración ni datos de calibración, y el cómputo se mantiene en BF16 tras de-cuantizar los pesos en cada `forward`. Se aplica una escala FP32 por canal de salida en las capas lineales y por fila de entrada en los embeddings; las normas, los sesgos y los parámetros escritos a mano (`action_in_proj`, `action_space`) permanecen en BF16. El autor indica que los pesos se generan directamente desde la release pública BF16 con `quantize_fp8.py`, sin modificar el código del modelo upstream.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset más allá de la referencia a `nvidia/PhysicalAI-Autonomous-Vehicles`, ni sobre si el modelo base usó RLHF o DPO. Tampoco se documenta ninguna innovación de decodificación especulativa o atención lineal en la información proporcionada.

## Capacidades

- Generación de trayectorias de conducción: produce 64 poses con intervalos de 0,1 s a partir de entradas multimodales, con muestreo múltiple de trayectorias (por ejemplo, 6 muestras por conjunto).
- Razonamiento vision-language-action: procesa 22 cámaras simultáneamente junto con historial de ego-movimiento (posición y rotación) y texto de navegación en inglés.
- Planificación condicionada por instrucciones: acepta indicaciones de navegación en lenguaje natural (`nav_text`, por ejemplo "Turn right in 30m").
- Muestreo estocástico controlado: permite fijar semilla del generador de difusión para reproducibilidad.
- Ejecución en GPUs de consumo: el esquema weight-only permite inferencia en cualquier GPU CUDA con BF16, sin necesidad de tensor cores FP8.
- Integración con PyTorch y `transformers`: se carga mediante `load_fp8.py`, que sustituye módulos `nn.Linear` y `nn.Embedding` sin modificar el código upstream.
- Soporte de tool calling, agentes, matemáticas, código o audio: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Prototipado de planificación de trayectorias en escritorio: un investigador puede cargar el modelo en una RTX 5060 de 8 GB y generar seis trayectorias en 6,10 s con un pico de 6,07 GiB, lo que permite iterar sobre entradas y parámetros de difusión sin acceso a un clúster.
- Validación de pipelines de percepción y control: al aceptar 22 frames de cámara, historial de ego-movimiento y texto de navegación, sirve para probar de extremo a extremo la preparación de datos con `prepare_model_inputs` y `load_physical_aiavdataset` antes de escalar a hardware de vehículo.
- Evaluación comparativa de cuantizaciones: el repositorio incluye `quantize_fp8.py` y mediciones de latencia y VRAM, lo que facilita reproducir el proceso y comparar FP8 weight-only frente a BF16 en distintas GPUs.
- Demostraciones y docencia en robótica: el ejemplo autocontenido (`example.py`) con una captura sintética de 22 frames permite mostrar el funcionamiento de un VLA de conducción sin depender de datos reales ni de hardware especializado.
- Investigación en generación de trayectorias multimodales: el muestreo de múltiples trayectorias con semilla fija permite estudiar la distribución de salidas del experto de difusión y su sensibilidad a `inference_step`.
- Desarrollo de prototipos de asistencia a la conducción en estaciones de trabajo: con ~2,5 GiB de pesos en VRAM, el modelo deja espacio para el resto del pipeline en tarjetas de 8 a 12 GB, útil para integrar módulos de navegación y evaluación offline.
- Baseline para recetas oficiales en DRIVE AGX Thor: este checkpoint sirve como referencia en PyTorch para comparar después con la ruta oficial TensorRT Edge-LLM, que reporta ~200 ms por petición en Thor.

## Benchmarks y rendimiento

El autor publica mediciones de latencia y VRAM en una RTX 5060 Laptop GPU (8 GB, `sm_120`), Windows, driver 621.24, CUDA 12.8, `torch 2.8.0+cu128`, `transformers 5.17.0`, con una entrada de 22 frames y 3.261 tokens de prompt:

| Metrica | BF16 | Alpamayo2-Edge-FP8 |
|---|---|---|
| Checkpoint en disco | 5,30 GB | 2,49 GiB |
| Pesos en VRAM | ~5,0 GiB | ~2,5 GiB |
| 1 trayectoria — tiempo | 2,43 s | 3,00 s |
| 1 trayectoria — VRAM pico | 7,01 GiB | 4,53 GiB |
| 6 trayectorias — tiempo | 2.842 s | 6,10 s |
| 6 trayectorias — VRAM pico | 8,55 GiB | 6,07 GiB |
| Carga del modelo | 5 s | 26 s |

El autor advierte que la ganancia de 465× en el caso de 6 trayectorias no es un efecto de la cuantización, sino de evitar el desbordamiento a memoria del sistema vía WDDM en una tarjeta de 8 GiB; en una GPU de 24 GB, BF16 sería más rápido. No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K ni métricas de error de trayectoria) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~2,5 GiB para los pesos y 4,53 GiB de pico con una trayectoria; 6,07 GiB de pico con seis trayectorias (medido en RTX 5060 Laptop de 8 GB).
- GPU recomendadas: cualquier GPU CUDA con soporte BF16. El autor valida en RTX 5060 Laptop (`sm_120`); no requiere tensor cores FP8.
- GPU de consumo: sí, cabe en tarjetas de 8 GB como la RTX 5060 Laptop; en una GPU de 24 GB el BF16 original sería más rápido.
- Opciones de despliegue: PyTorch + `transformers==5.17.0` con el paquete `alpamayo2-edge` de NVlabs; el autor no menciona vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 3,00 s por trayectoria y 6,10 s para seis trayectorias en la RTX 5060 Laptop; la ruta oficial TensorRT Edge-LLM reporta ~200 ms por petición en DRIVE AGX Thor.
- Carga del modelo: 26 s en el hardware de referencia.
- Dependencias: Python 3.12, `torch 2.8.0+cu128`, `transformers==5.17.0`, `safetensors`, `einops`, `hydra-core`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Alpamayo2-Edge-FP8 (este) | ~2 B | no disponible | FP8 e4m3 weight-only | GPU CUDA con BF16 (8 GB) | openmdw-1.1 | Hugging Face, repo comunitario |
| nvidia/Alpamayo2-Edge (BF16) | ~2 B | no disponible | BF16 | GPU CUDA con BF16 (≥8 GB, ~5 GiB de pesos) | openmdw-1.1 | Hugging Face, release oficial |
| Receta oficial `recipes/alpamayo2edge_edgellm` | ~2 B | no disponible | FP8 en pesos, activaciones y K/V | NVIDIA DRIVE AGX Thor | openmdw-1.1 (modelo base) | `NVlabs/alpamayo-recipes` |

No se dispone de información sobre otros modelos VLA comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Precisión no evaluada: el autor indica explícitamente que no se ha evaluado la precisión de trayectorias sobre datos reales de conducción; el fragmento de la model card se interrumpe en ese punto.
- Derivado comunitario: no es una release de NVIDIA ni la receta FP8 oficial; no debe confundirse con la ruta TensorRT Edge-LLM para DRIVE AGX Thor.
- Penalización de latencia: una trayectoria es ~20 % más lenta que BF16 por la de-cuantización en cada `forward` (3,00 s frente a 2,43 s).
- Mayor tiempo de carga: 26 s frente a 5 s del BF16.
- Idioma: solo inglés, lo que limita su uso con instrucciones de navegación en castellano u otros idiomas.
- Sin calibración: al ser weight-only, las activaciones y la caché K/V permanecen en BF16; no se aprovechan tensor cores FP8.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al tratarse de un modelo de conducción, cualquier salida debe validarse antes de usarse en sistemas reales.
- Licencia OpenMDW 1.1: las condiciones de uso comercial deben verificarse en el texto de la licencia; la información disponible no detalla restricciones adicionales.
- Fragmento incompleto: la model card proporcionada se corta en la sección de limitaciones, por lo que pueden existir advertencias adicionales no recogidas aquí.

## Enlaces

- Hugging Face: https://huggingface.co/FrankLiWright/Alpamayo2-Edge-FP8
- Modelo base: https://huggingface.co/nvidia/Alpamayo2-Edge
- Repositorio de código del autor: https://github.com/FrankLiWright/alpamayo2-edge-fp8
- Código upstream del modelo: https://github.com/NVlabs/alpamayo2-edge
- Recetas oficiales de NVIDIA: `NVlabs/alpamayo-recipes` (ruta `recipes/alpamayo2edge_edgellm`)
- Dataset de referencia: https://huggingface.co/datasets/nvidia/PhysicalAI-Autonomous-Vehicles

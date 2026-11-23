# Motubrain/MotuBrain2.0-LIBERO-Plus

## Resumen

MotuBrain2.0-LIBERO-Plus es un world-action model (WAM) para manipulación robótica, desarrollado por Motubrain y publicado como un fine-tune destilado de Motubrain2.0-Base. El modelo recibe una instrucción en lenguaje natural junto con imágenes de una cámara externa y una cámara de muñeca, y predice un chunk de comandos de robot de siete dimensiones (coordenadas normalizadas del controlador). Está especializado en el benchmark LIBERO-Plus, una variante perturbada del conjunto LIBERO que evalúa la robustez de políticas de manipulación ante cambios de robot, lenguaje, iluminación, fondo, ruido, disposición y cámara.

El modelo tiene 19.523.591.223 parámetros (aproximadamente 19,5 mil millones) y se distribuye en formato safetensors con pesos en BF16, ocupando 39,05 GB. Su relevancia actual radica en el resultado reportado por el autor: un 95,1 % de éxito global en LIBERO-Plus (9.538 de 10.030 variantes retenidas), superando a PICA-WAM (93,3 %) y a otras políticas de manipulación como InternW0-Δ, Qwen-RobotManip, InternVLA-A1.5, π₀.₅ o OpenVLA-OFT. Además, el modelo emplea solo cuatro pasos de denoising por chunk de acción gracias a la destilación por consistencia, lo que reduce el coste de inferencia frente a políticas de difusión con más pasos.

La ficha se basa exclusivamente en la información disponible en la model card y en los metadatos de Hugging Face; los datos no publicados se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model (WAM) basado en Motubrain2.0-Base; política de difusión/consistencia para predicción de acciones robóticas; detalles internos de la arquitectura no disponibles |
| Parametros totales | 19.523.591.223 (≈19,5 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (historial de observaciones con `causal_5_to_2` y stride de 3 fotogramas; ventana de contexto no especificada en tokens) |
| Tipos de cuantizacion | no disponible; checkpoint almacenado en BF16 |
| Idiomas soportados | no disponible (recibe instrucciones en lenguaje natural; idiomas concretos no especificados) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PyTorch); checkpoint BF16 de 39,05 GB |

Otros datos relevantes: pipeline `robotics`; dataset de entrenamiento `yuanty/LIBERO-fastwam`; modelo base `Motubrain/Motubrain2.0-Base` (relación: finetune); tamaño del repositorio 39,0 GB; fecha de creación 2026-11-23.

## Arquitectura y entrenamiento

El modelo es un world-action model construido sobre Motubrain2.0-Base y especializado mediante un pipeline de dos fases. Primero, se hizo un fine-tune del modelo base durante 60.000 pasos sobre 1.712 demostraciones de LIBERO procedentes de las suites Spatial, Object, Goal y Long; ese modelo fine-tuneado actuó como profesor (teacher). Después, se destiló el profesor durante 3.000 iteraciones usando las mismas demostraciones, dando lugar al estudiante publicado. El estudiante emplea cuatro pasos de denoising por consistencia por cada chunk de acción, en lugar de los múltiples pasos típicos de una política de difusión estándar. LIBERO-Plus se utilizó exclusivamente para evaluación, no para entrenamiento.

Las entradas visuales son dos cámaras de 512 × 512 píxeles (vista externa y vista de muñeca derecha, IDs 0 y 2). Durante el entrenamiento se aplicó color jitter a ambas vistas, recortes aleatorios a la vista externa y dropout de cámara. La inferencia requiere componentes auxiliares externos: un VAE de Wan2.2-TI2V-5B (`Wan-AI/Wan2.2-TI2V-5B-Diffusers`, subcarpeta `vae`), un codificador de texto T5Gemma (`google/t5gemma-9b-9b-prefixlm-it`, con acceso restringido) y un modelo de profundidad Depth Anything 3 (`depth-anything/DA3-LARGE-1.1`). El perfil de robot incluye las vistas externa y de muñeca derecha, siete coordenadas normalizadas del controlador y un historial disperso `causal_5_to_2` con stride de 3 fotogramas. El sampler se configura con `--steps 4`, `--video-shift 6` y `--action-shift 1`. No se detallan en la información disponible la composición completa del dataset, el número total de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Predicción de acciones robóticas: dado un perfil de robot y observaciones (imágenes de cámara externa y de muñeca), genera un chunk de comandos de siete dimensiones (coordenadas normalizadas del controlador) con máscara de validez (`decoded_valid`).
- Seguimiento de instrucciones en lenguaje natural: condiciona la política a una instrucción textual, evaluada en LIBERO-Plus con perturbaciones de lenguaje (93,4 % de éxito).
- Robustez ante perturbaciones visuales: resultados altos en iluminación (99,8 %), fondo (98,3 %), ruido (97,3 %) y cambios de cámara (94,5 %).
- Robustez ante cambios de robot y disposición: 94,2 % en perturbación de robot y 90,2 % en layout.
- Inferencia eficiente por destilación: cuatro pasos de denoising por chunk mediante sampler de consistencia.
- Historial temporal de observaciones: soporte de historial disperso `causal_5_to_2` con stride de 3 fotogramas para seleccionar fotogramas anteriores indexados por episodio.
- Integración con componentes multimodales externos: VAE de Wan2.2, codificador de texto T5Gemma y modelo de profundidad Depth Anything 3.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible.
- Modo thinking, visión general, audio: no disponible; la visión se limita a las dos cámaras de entrada del perfil de robot.

## Casos de uso

- Manipulación robótica de mesa con instrucciones en lenguaje natural: el modelo recibe una instrucción y las imágenes de cámara externa y de muñeca, y emite comandos de controlador de siete dimensiones; es adecuado para tareas de pick-and-place, apertura de cajones o apilado en entornos tipo LIBERO.
- Evaluación de robustez de políticas: sirve como referencia para medir el impacto de perturbaciones de iluminación, fondo, ruido, cámara, layout, robot y lenguaje, gracias a sus resultados desglosados en LIBERO-Plus.
- Investigación en destilación de políticas robóticas: el pipeline teacher-student (fine-tune de 60.000 pasos y destilación de 3.000 iteraciones con cuatro pasos de consistencia) es un caso concreto para estudiar la reducción de pasos de denoising sin pérdida apreciable de éxito.
- Prototipado de control visuomotor con historial temporal: el soporte de historial `causal_5_to_2` con stride de 3 permite construir políticas que usan fotogramas anteriores, útil en tareas con oclusión o movimiento.
- Benchmarking de modelos VLA/WAM: al estar entrenado solo con demostraciones LIBERO y evaluado en LIBERO-Plus, es un punto de comparación reproducible frente a PICA-WAM, InternW0-Δ, Qwen-RobotManip, InternVLA-A1.5, π₀.₅, ABot-M0.5, LingBot-VA, LaWAM, X-VLA, OpenVLA-OFT, OpenWAM-α y π₀.
- Despliegue en máquinas CUDA con BF16: la inferencia offline se ejecuta con el paquete `motubrain2` y el extra `geometry`, cargando el checkpoint safetensors y los componentes auxiliares (VAE, T5Gemma, Depth Anything 3), lo que facilita la reproducción de resultados en laboratorio.
- Generación de datos sintéticos o aumento de demostraciones: la política puede emplearse para rodar episodios en simulador y generar trayectorias adicionales para entrenamiento, aunque esta aplicación no está documentada explícitamente por el autor.

## Benchmarks y rendimiento

Resultados reportados por el autor en LIBERO-Plus (tasa de éxito en %, sobre 10.030 variantes retenidas; en negrita el mejor valor de cada columna según la model card):

| Metodo | Global | Robot | Lenguaje | Luz | Fondo | Ruido | Layout | Camara |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| **Motubrain 2.0-WAM** | **95,1** | 94,2 | 93,4 | **99,8** | 98,3 | 97,3 | **90,2** | **94,5** |
| PICA-WAM | 93,3 | 91,7 | **95,3** | 98,0 | 99,3 | 96,6 | 88,4 | 86,7 |
| InternW0-Δ | 92,8 | 91,1 | 92,9 | 95,8 | 99,4 | 94,0 | 88,4 | 90,6 |
| Qwen-RobotManip | 91,4 | 83,9 | 86,5 | 98,6 | **99,9** | **97,9** | 87,5 | 89,9 |
| InternVLA-A1.5 | 84,8 | 55,1 | 86,9 | 96,4 | 98,2 | 95,6 | 85,2 | 83,1 |
| π₀.₅ | 84,4 | 73,6 | 80,8 | 96,2 | 94,1 | 89,0 | 84,5 | 78,4 |
| ABot-M0.5 | 83,4 | 87,4 | 88,6 | 94,0 | 89,7 | 75,5 | 85,2 | 70,5 |
| LingBot-VA | 80,7 | 93,9 | 84,1 | 92,3 | 80,1 | 75,6 | 79,3 | 62,9 |
| LaWAM | 77,7 | **96,5** | 85,2 | 93,6 | 94,0 | 68,3 | 83,5 | 33,8 |
| X-VLA | 71,4 | 89,7 | 75,7 | 88,2 | 96,0 | 62,7 | 71,8 | 23,4 |
| OpenVLA-OFT | 69,6 | 31,9 | 79,5 | 88,7 | 93,3 | 75,8 | 74,2 | 56,4 |
| OpenWAM-α | 69,2 | 76,1 | 88,0 | 97,0 | 87,1 | 39,8 | 77,5 | 33,8 |
| π₀ | 53,6 | 6,0 | 58,8 | 85,0 | 81,4 | 79,0 | 68,9 | 13,8 |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo es una política robótica y no un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en BF16 ocupa 39,05 GB, por lo que se necesita al menos esa cantidad solo para los pesos; hay que sumar los componentes auxiliares (VAE de Wan2.2-TI2V-5B, T5Gemma-9B-9B y Depth Anything 3 Large), por lo que el requisito real de VRAM es sustancialmente mayor y no está cuantificado en la información disponible.
- GPU recomendadas: máquina con soporte CUDA y BF16 según la model card; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- ¿Cabe en GPU de consumo? No disponible; por el tamaño del checkpoint (39,05 GB en BF16) más los componentes auxiliares, es improbable en GPUs de consumo con menos de 48 GB de VRAM, pero no hay confirmación oficial.
- Opciones de despliegue: paquete `motubrain2` con el extra `geometry` (comando `python -m motubrain2.inference`), sampler de consistencia con 4 pasos, `--bf16`, VAE de Wan2.2, T5Gemma y Depth Anything 3. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.
- Almacenamiento: descarga de `model.safetensors`, `config.json` y `sampling.json`; repositorio de 39,0 GB.
- Requisito de acceso: el codificador T5Gemma requiere obtener acceso y ejecutar `hf auth login` con la cuenta aprobada.

## Comparativa con modelos similares

Comparativa con alternativas de la misma categoría (políticas de manipulación robótica evaluadas en LIBERO-Plus). Los datos de parámetros, contexto y licencia de los competidores no están disponibles en la información proporcionada.

| Modelo | Parámetros | Contexto | Éxito global LIBERO-Plus | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Motubrain 2.0-LIBERO-Plus | 19,52 mil millones | no disponible | 95,1 % | no disponible | Hugging Face (Motubrain) |
| PICA-WAM | no disponible | no disponible | 93,3 % | no disponible | no disponible |
| InternW0-Δ | no disponible | no disponible | 92,8 % | no disponible | no disponible |
| Qwen-RobotManip | no disponible | no disponible | 91,4 % | no disponible | no disponible |
| InternVLA-A1.5 | no disponible | no disponible | 84,8 % | no disponible | no disponible |
| π₀.₅ | no disponible | no disponible | 84,4 % | no disponible | no disponible |
| OpenVLA-OFT | no disponible | no disponible | 69,6 % | no disponible | no disponible |
| π₀ | no disponible | no disponible | 53,6 % | no disponible | no disponible |

En cuanto a fortalezas por perturbación, Motubrain 2.0-WAM lidera en iluminación (99,8 %), layout (90,2 %) y cámara (94,5 %), mientras que Qwen-RobotManip lidera en fondo (99,9 %) y ruido (97,9 %), PICA-WAM en lenguaje (95,3 %) y LaWAM en robot (96,5 %).

## Limitaciones y advertencias

- Especialización estrecha: es una política entrenada y evaluada en LIBERO/LIBERO-Plus; no se ha demostrado su generalización a otros entornos, robots o tareas fuera de ese benchmark.
- Dependencia de componentes externos: requiere VAE de Wan2.2, T5Gemma (con acceso restringido y autenticación) y Depth Anything 3, lo que añade complejidad de despliegue y posibles fallos en cadena.
- Requisito de perfil de robot y formato de observación muy concretos: vistas 0 y 2, siete coordenadas normalizadas del controlador e historial `causal_5_to_2` con stride de 3; un formato incorrecto puede invalidar la inferencia.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución; es un riesgo para producción.
- Idiomas no especificados: aunque recibe instrucciones en lenguaje natural, no se documenta qué idiomas cubre ni su calidad fuera del inglés.
- Riesgo de alucinación y errores de acción: como política visuomotora, puede generar comandos inválidos o inseguros en escenarios fuera de distribución; la máscara `decoded_valid` ayuda a filtrar, pero no garantiza seguridad física.
- Sesgos: no documentados; el entrenamiento con 1.712 demostraciones de LIBERO puede heredar sesgos de ese dataset (tareas, objetos y disposiciones limitadas).
- Sin datos de benchmarks fuera de LIBERO-Plus ni métricas de latencia/throughput.
- Fecha de creación futura (2026-11-23) y cero descargas/likes en el momento de la consulta: ecosistema y validación comunitaria aún inexistentes.
- El autor indica que LIBERO-Plus se usó solo para evaluación, pero no se detalla la composición completa del dataset de entrenamiento ni posibles fugas de información.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Motubrain/MotuBrain2.0-LIBERO-Plus
- Modelo base: https://huggingface.co/Motubrain/Motubrain2.0-Base
- Código de Motubrain: https://github.com/shengshu-ai/Motubrain-2.0
- Benchmark LIBERO-Plus: https://github.com/sylvestf/LIBERO-plus
- Comparativa del informe técnico: https://github.com/shengshu-ai/Motubrain-2.0/blob/main/docs/evaluation.md#libero-plus
- Instalación: https://github.com/shengshu-ai/Motubrain-2.0/blob/main/docs/usage.md#installation
- Perfiles de robot y observaciones: https://github.com/shengshu-ai/Motubrain-2.0/blob/main/docs/usage.md#bring-your-own-data
- Dataset de entrenamiento Fast-WAM: https://huggingface.co/datasets/yuanty/LIBERO-fastwam
- Codificador de texto T5Gemma: https://huggingface.co/google/t5gemma-9b-9b-prefixlm-it
- VAE de Wan2.2: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- Modelo de profundidad Depth Anything 3: https://huggingface.co/depth-anything/DA3-LARGE-1.1

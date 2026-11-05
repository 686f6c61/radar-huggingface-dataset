# akhaliq/viggle-remake-turbo

## Resumen

Viggle Remake Turbo es un repack comunitario de LoRAs para Viggle Remake, un modelo de edición de vídeo (video-to-video) orientado a la sustitución de personajes y la edición de escenas sobre metraje existente. Lo publica el usuario akhaliq en HuggingFace y no es un modelo base, sino una fusión de dos LoRAs: la LoRA de Viggle Remake (modos swap y edit) y la LoRA de destilación de 4 pasos SMD MiniMax-H3 Ref2VA de zjwfufu. El resultado reduce el número de pasadas de denoising de seis a cuatro (unas 1,5 veces menos evaluaciones del modelo por render), lo que se traduce en una aceleración de aproximadamente un tercio en el tiempo de generación.

El modelo subyacente es MiniMax H3, un modelo de difusión de vídeo con un transformer como componente principal y un text encoder basado en Qwen3-VL de 32B. Viggle Remake añade encima capacidades de recasting de personas y edición de escenas, y esta versión turbo combina esa LoRA con una destilación few-step para acelerar la inferencia, manteniendo además las optimizaciones de cuantización int8/GGUF que ya distribuye Viggle.

Es relevante ahora porque demuestra una práctica habitual en el ecosistema de vídeo generativo: componer LoRAs de distintos autores (edición de personaje y destilación de pasos) en un único fichero fusionado, listo para ComfyUI, con flujos de trabajo API preconfigurados. La licencia es la MiniMax H3 Community License, con condiciones específicas de redistribución y uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de vídeo sobre transformer (MiniMax H3), con text encoder Qwen3-VL de 32B y VAE de vídeo y audio |
| Parametros totales | no disponible (el repack distribuye LoRAs, no los pesos completos del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8, nvfp4, GGUF (perfiles compactos del modelo base); LoRAs en safetensors (fp32 fusionado, bf16 en uso) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License (license: other) |
| Formato de pesos | safetensors (LoRAs en formato ComfyUI) |

## Arquitectura y entrenamiento

El modelo base MiniMax H3 es un modelo de difusión para vídeo con un transformer como red principal; Viggle Remake lo adapta mediante LoRAs para dos tareas: swap (sustitución de personaje) y edit (edición de escena). Este repack no entrena pesos nuevos: fusiona la LoRA de Remake con la LoRA de destilación de 4 pasos SMD MiniMax-H3 Ref2VA, que reduce el número de pasos de muestreo. La fusión se hace en fp32 y se refactoriza a rango 256 mediante SVD, de modo que se carga una sola LoRA en lugar de dos; según el autor, apilar ambas LoRAs por separado es matemáticamente equivalente.

La innovación principal es la rejilla de sigmas de 4 pasos adaptada a la convención del flujo de vídeo de Remake: `1.0, 0.997228, 0.990826, 0.96, 0.0`, derivada de la rejilla de SMD (`1.0, 0.9677, 0.9, 0.6667, 0.0`, publicada con video shift 12). El flujo usa un nodo `ManualSigmas`, sampler euler, `BasicGuider` sin CFG y `RemakeKeyframeUntil` en 0.9; como las cuatro pasadas caen en sigma >= 0.9, los keyframes fijados se mantienen durante todo el denoising. No se dispone de información sobre el dataset de entrenamiento, el número de tokens o el uso de RLHF/DPO, ya que el autor no lo documenta en la model card.

## Capacidades

- Edición de vídeo video-to-video sobre metraje existente.
- Sustitución de personajes (modo swap) en vídeos reales.
- Edición de escenas (modo edit) manteniendo la estructura del vídeo original.
- Renderizado en 4 pasos de denoising gracias a la destilación few-step.
- Integración con ComfyUI mediante nodos de Viggle y flujos de trabajo API listos para encolar.
- Compatibilidad con perfiles de cuantización compactos (int8, nvfp4) y GGUF del modelo base.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o texto general; es un modelo especializado en vídeo.

## Casos de uso

- Sustitución de personajes en postproducción: se introduce un vídeo existente y el modelo reemplaza al actor por otra identidad manteniendo el movimiento y la iluminación, gracias a la LoRA de swap de Remake.
- Edición de escenas para publicidad: cambiar elementos de una grabación ya rodada sin regenerar el metraje completo, reduciendo costes de producción.
- Prototipado rápido de vídeo generativo en ComfyUI: los flujos API preconfigurados permiten encolar renders con los ejemplos de Viggle ya cableados, útil para evaluar la calidad antes de invertir en infraestructura.
- Iteración de bajo coste en pipelines de creación de contenido: al pasar de seis a cuatro pasadas de denoising, el tiempo por render baja aproximadamente un tercio, lo que facilita probar variaciones de prompt o de identidad.
- Investigación en destilación de modelos de difusión: el repack sirve como caso de estudio de fusión de LoRAs mediante SVD a rango 256 y de comparación PSNR entre la LoRA fusionada y el apilado de dos LoRAs.
- Despliegue en hardware de consumo: los perfiles int8/nvfp4 del modelo base (unos 41 GB en el perfil compacto) permiten ejecutar el pipeline en GPUs de gama alta para consumidores, no solo en clústeres.
- Automatización de validación de modelos: el `build_report.json` y los renders de `samples/` permiten comparar de forma automática la salida turbo con los originales de Viggle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta datos operativos: reducción de seis a cuatro pasadas de denoising (aproximadamente 1,5 veces menos evaluaciones del modelo), tiempos de render observados en `build_report.json` y PSNR entre el render con LoRA fusionada y el apilado de dos LoRAs. No se incluyen cifras de MMLU, HumanEval, GSM8K ni métricas de calidad de vídeo estándar.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el perfil compacto descarga unos 41 GB de pesos base (transformer int8, text encoder nvfp4, VAE de vídeo int8 y VAE de audio fp32), a lo que hay que sumar la LoRA y los buffers de inferencia.
- GPU recomendadas: no especificadas por el autor; por el tamaño del perfil compacto, se requiere una GPU con al menos 48 GB de VRAM para el perfil int8/nvfp4, o varias GPUs.
- GPU de consumo: no cabe en GPUs de consumo convencionales de 24 GB con el perfil compacto documentado; no se confirma compatibilidad con modelos inferiores.
- Despliegue: ComfyUI con el node pack `ComfyUI-Viggle-Remake`; el modelo base se obtiene de `Comfy-Org/MiniMax-H3`. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: el autor indica una reducción de aproximadamente 1,5 veces en evaluaciones del modelo y un tercio menos de tiempo por render; los tiempos concretos están en `build_report.json`, no reproducidos aquí.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de muestreo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Viggle Remake Turbo (este) | LoRA fusionada para edición de vídeo | 4 | no disponible | MiniMax H3 Community License | HuggingFace, ComfyUI |
| Viggle Remake (base) | LoRA de edición de vídeo | 6 (según la card) | no disponible | MiniMax H3 Community License | HuggingFace |
| SMD MiniMax-H3 Ref2VA 4-step | LoRA de destilación few-step | 4 | no disponible | no disponible | HuggingFace, ComfyUI |
| MiniMax H3 (base) | Modelo de difusión de vídeo | no disponible | no disponible | MiniMax H3 Community License | HuggingFace, Comfy-Org |

La comparativa se limita a los componentes que el propio repack documenta; no se dispone de datos de rendimiento ni de parámetros para comparar con alternativas de otros autores.

## Limitaciones y advertencias

- Es un repack comunitario, no un modelo original: la calidad depende de las LoRAs upstream de Viggle y de zjwfufu, y el autor no está afiliado ni respaldado por Viggle AI ni por MiniMax.
- Riesgo de alucinación visual: como modelo de difusión, puede generar artefactos, inconsistencias de identidad o movimientos irreales; no se documentan métricas de fidelidad más allá del PSNR interno.
- Restricciones de licencia: se aplica la MiniMax H3 Community License, que exige mostrar "MiniMax H3" en productos comerciales, transmitir la licencia y el NOTICE aguas abajo, y autorización escrita por encima de 20 millones de dólares de ingresos anuales.
- Uso ético: la identidad en la salida proviene de los fotogramas de entrada; solo debe ejecutarse sobre personas que hayan dado su consentimiento y el contenido generado debe etiquetarse como generado por IA.
- Requisito técnico estricto: la LoRA debe cargarse con `LoraLoaderBypassModelOnly`, nunca con `LoraLoaderModelOnly`, porque Viggle midió que el cargador de fusión simple redondea buena parte de la actualización de la LoRA en bf16 (salida más suave, un 7 % menos de nitidez en swap).
- Debe usarse el fichero de difusión `fl2va`, no `ref2va`, porque la LoRA de Remake se aplica al transformer base y la LoRA turbo fusionada hereda esa dependencia.
- Idiomas soportados no disponibles; el text encoder es Qwen3-VL de 32B, pero el autor no documenta el comportamiento multilingüe del pipeline de vídeo.
- No hay datos de benchmarks estándar ni de sesgos conocidos en la información proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akhaliq/viggle-remake-turbo
- Viggle Remake (modelo base): https://huggingface.co/Viggle/Viggle-Remake
- Licencia MiniMax H3 Community License: https://huggingface.co/Viggle/Viggle-Remake/blob/main/LICENSE
- Guía de ComfyUI de Viggle: https://huggingface.co/Viggle/Viggle-Remake/blob/main/COMFYUI.md
- Ejemplos multimedia de Viggle: https://huggingface.co/Viggle/Viggle-Remake/tree/main/examples/media
- SMD MiniMax-H3 Ref2VA 4-step: https://huggingface.co/zjwfufu/SMD-MiniMax-H3-Ref2VA-4step-ComfyUI
- Código SMD: https://github.com/zjwfufu/SMD
- MiniMax H3 (modelo base): https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repack de MiniMax H3 para ComfyUI: https://huggingface.co/Comfy-Org/MiniMax-H3
- ML Intern: https://hf.co/chat?mode=ml-intern

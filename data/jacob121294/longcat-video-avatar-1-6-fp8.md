# Jacob121294/LongCat-Video-Avatar-1.6-fp8

## Resumen

LongCat-Video-Avatar 1.6 fp8 es una conversión a precisión reducida del modelo LongCat-Video-Avatar 1.6, un modelo generativo de vídeo con avatar dirigido por audio desarrollado originalmente por Meituan (meituan-longcat). Este repositorio, publicado por el usuario Jacob121294, no entrena ni modifica el modelo en cuanto a comportamiento, sino que transforma los pesos originales en bf16/int8 a fp8 (e4m3fn) con escalas por tensor para que puedan ejecutarse en el ecosistema de ComfyUI mediante los nodos LongCat del wrapper de Kijai (ComfyUI-WanVideoWrapper).

El modelo base es un DiT (Diffusion Transformer) de generación de vídeo condicionado por audio, orientado a la creación de avatares parlantes: recibe una señal de audio y genera vídeo sincronizado con movimiento facial y labial coherente. La versión 1.6 introduce un cambio en la ventana de audio respecto a la 1.5, lo que se refleja en la forma de los pesos `multitalk_audio_proj`. La conversión mantiene las capas AdaLN `modulation.1` en bf16 y `patch_embedding` en F32 para preservar estabilidad numérica.

La relevancia de este artefacto es práctica: permite ejecutar un modelo de vídeo-avatar de gran tamaño en GPUs de consumo mediante cuantización fp8, integrándolo en flujos de trabajo de ComfyUI. No obstante, el propio autor advierte que la calidad no se ha validado todavía frente a los pesos bf16 originales, por lo que debe considerarse una conversión experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) para generación de vídeo condicionada por audio |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio 1.6, sin cifra publicada) |
| Tipos de cuantizacion | fp8 e4m3fn con una escala por tensor; AdaLN `modulation.1` en bf16; `patch_embedding` en F32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`LongCat-Avatar-1.6_fp8_e4m3fn_scaled.safetensors`) |

## Arquitectura y entrenamiento

El modelo subyacente es un Diffusion Transformer (DiT) que genera fotogramas de vídeo condicionados por una representación de audio. La arquitectura incluye un módulo `patch_embedding` para la tokenización espacial de los fotogramas, bloques transformer con modulación AdaLN y una proyección específica de audio (`multitalk_audio_proj`) que inyecta la señal acústica en el proceso de difusión. La versión 1.6 modifica la ventana de audio respecto a la 1.5, lo que altera la forma de los pesos de esa proyección; el resto de nombres de capa coinciden con el fichero fp8 de la versión 1.5 de Kijai.

Este repositorio no aporta información sobre el entrenamiento: no se detallan el número de tokens, la composición del dataset, ni si hubo etapas de RLHF, DPO u otro ajuste. La conversión realizada parte de los pesos int8 ConvRot de Comfy-Org (`longcat-avatar-1.6_int8_convrot.safetensors`), los dequantiza con comfy-kitchen y los recuantiza a fp8 e4m3fn con una escala por tensor. El script de conversión (`convert_longcat16_int8_to_fp8.py`) está incluido en el repositorio. No se documentan innovaciones de decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Generación de vídeo de avatar dirigida por audio: produce vídeo sincronizado con la señal acústica de entrada.
- Sincronización labial y movimiento facial condicionados por audio, orientados a la creación de avatares parlantes.
- Integración con ComfyUI mediante los nodos LongCat de ComfyUI-WanVideoWrapper.
- Compatibilidad con LoRAs de aceleración (OPSD/DMD de la versión 1.6 del repositorio de Comfy-Org).
- Ejecución en fp8 para reducir requisitos de memoria frente a los pesos bf16.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código y capacidades multilingües: no disponible (no es un modelo de lenguaje; es un modelo generativo de vídeo).

## Casos de uso

- Creación de avatares virtuales para vídeo corporativo: a partir de una grabación de audio de un portavoz, el modelo genera el vídeo del avatar con sincronización labial, útil para formación interna o comunicados sin repetir rodajes.
- Doblaje y localización de contenidos: sustituir la pista de audio de un vídeo por una versión en otro idioma y regenerar el movimiento facial del hablante para mantener la coherencia visual.
- Prototipado de asistentes conversacionales con cara visible: conectar la salida de un TTS a este modelo para producir respuestas en vídeo de un personaje, adecuado para demos de producto en ComfyUI.
- Producción de contenido para redes sociales: generar clips cortos de un presentador virtual a partir de guiones locutados, reduciendo el coste de grabación y edición.
- Investigación en generación de vídeo condicionada por audio: servir como punto de partida reproducible en fp8 para experimentos académicos sobre sincronización labial y coherencia temporal.
- Pruebas de integración en pipelines de ComfyUI: validar flujos de trabajo de vídeo-avatar con cuantización fp8 antes de invertir en hardware de mayor VRAM.
- Previsualización rápida en estaciones de trabajo con GPU de consumo: al reducir el peso en memoria, permite iterar sobre prompts y audios sin recurrir a clústeres con A100/H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la conversión fp8 no se ha probado en calidad frente a los pesos bf16 originales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con cifra exacta; al ser un DiT de vídeo en fp8, el peso del fichero safetensors determina el mínimo, pero el repositorio no publica el tamaño del archivo ni el consumo en ejecución.
- GPU recomendadas: no disponible. Por el formato fp8 e4m3fn, se beneficia de GPUs con soporte nativo de fp8 (por ejemplo, arquitecturas Ada Lovelace y Hopper), aunque el wrapper puede ejecutarlo con conversión en otras arquitecturas.
- Cabe en GPU de consumo: no confirmado; el autor no documenta pruebas en RTX 4090 u otras consumer. La cuantización fp8 está pensada precisamente para acercar el modelo a ese segmento.
- Opciones de despliegue: ComfyUI con ComfyUI-WanVideoWrapper (nodos LongCat). Los pesos deben colocarse en `ComfyUI/models/diffusion_models/Avatar/`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de vídeo).
- Latencia y throughput: no disponible.
- LoRAs: emparejar con los LoRAs OPSD/DMD de la versión 1.6 del repositorio Comfy-Org/LongCat-Video-Avatar.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantización | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LongCat-Video-Avatar 1.6 fp8 (este repo) | DiT vídeo-avatar audio-driven | fp8 e4m3fn escalado | MIT | Hugging Face (Jacob121294) | Conversión para ComfyUI-WanVideoWrapper; calidad no validada frente a bf16 |
| LongCat-Video-Avatar 1.6 (original, meituan-longcat) | DiT vídeo-avatar audio-driven | bf16 (referencia) | MIT | Hugging Face (meituan-longcat) | Pesos de referencia del autor original |
| Comfy-Org/LongCat-Video-Avatar (int8 ConvRot) | DiT vídeo-avatar audio-driven | int8 ConvRot | MIT | Hugging Face (Comfy-Org) | Repack intermedio del que parte esta conversión |
| LongCat-Avatar 1.5 fp8 (Kijai) | DiT vídeo-avatar audio-driven | fp8 e4m3fn mixto | no disponible en la información | Hugging Face / GitHub (Kijai) | Versión anterior; los nombres de capa coinciden salvo `multitalk_audio_proj` |

No se dispone de datos de benchmarks que permitan comparar rendimiento numérico entre estas variantes.

## Limitaciones y advertencias

- Calidad no validada: el autor advierte que la conversión fp8 no se ha probado contra los pesos bf16 originales; puede haber degradación visual o de sincronización labial.
- Artefacto derivado, no oficial: el repositorio lo publica un tercero (Jacob121294) a partir de pesos de Comfy-Org y del modelo de Meituan; no es una release oficial del equipo original.
- Dependencia de un wrapper concreto: los nombres de capa y el layout están adaptados a los nodos LongCat de ComfyUI-WanVideoWrapper; no es un fichero portable a otros runtimes sin conversión.
- Requiere LoRAs específicos: debe emparejarse con los LoRAs OPSD/DMD de la versión 1.6 para un funcionamiento previsto; sin ellos el comportamiento puede diferir.
- Sesgos: no documentados en la información disponible; al ser un modelo generativo de rostros humanos, es esperable que herede sesgos de representación del dataset original, pero no se aportan datos.
- Riesgo de alucinación visual: como modelo de difusión, puede generar artefactos, inconsistencias temporales o movimientos faciales no realistas, especialmente en audios largos o ruidosos.
- Limitaciones de idioma y contexto: no se especifican idiomas soportados ni longitud máxima de audio/vídeo; la ventana de audio cambió en 1.6 y no se publica su tamaño.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los pesos intermedios de Comfy-Org, así como la atribución correspondiente.
- Sin garantías de producción: al no haber benchmarks ni pruebas de calidad publicadas, no se recomienda su uso en producción sin una evaluación propia previa.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/Jacob121294/LongCat-Video-Avatar-1.6-fp8
- Modelo base original: https://huggingface.co/meituan-longcat/LongCat-Video-Avatar-1.6
- Repack int8 de Comfy-Org: https://huggingface.co/Comfy-Org/LongCat-Video-Avatar
- ComfyUI-WanVideoWrapper (Kijai): https://github.com/kijai/ComfyUI-WanVideoWrapper
- Script de conversión: `convert_longcat16_int8_to_fp8.py` (incluido en el repositorio de Hugging Face)

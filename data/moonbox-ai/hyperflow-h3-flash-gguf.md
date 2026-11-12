# moonbox-ai/hyperflow-h3-flash-GGUF

## Resumen

HyperFlow H3 Flash es un modelo de generación de vídeo con audio sincronizado, desarrollado por Video Rebirth como una versión comprimida y de pocos pasos de MiniMax-H3. Moonbox mantiene este repositorio como espejo sin modificaciones de los archivos GGUF publicados por el autor original. El modelo genera clips de 5,2 a 15 segundos a 24 fps (1344×768 por defecto) con una pista de audio estéreo de 32 kHz, partiendo de un prompt de texto y, opcionalmente, de fotogramas clave o referencias visuales.

La arquitectura es un transformer de 13.946.322.616 parámetros (13,7B en la variante `fl2va`), menos de la mitad de los aproximadamente 31B del transformer MiniMax-H3 original. La innovación principal es el muestreo en 4, 6 u 8 pasos sin classifier-free guidance (CFG), con un valor por defecto de 6 pasos, lo que reduce drásticamente el coste de inferencia frente a los modelos de difusión de vídeo convencionales.

Este repositorio contiene únicamente el transformer en formato GGUF; el codificador de texto (Qwen3-VL) y los VAE provienen del modelo base MiniMax-H3. Es relevante para desarrolladores que quieran ejecutar generación de vídeo-audio en GPUs de consumo (24 GB) mediante ComfyUI, aunque la licencia comunitaria impone restricciones territoriales severas que condicionan su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (variante comprimida de MiniMax-H3), tarea `fl2va` (texto y fotogramas clave a vídeo+audio) |
| Parametros totales | 13.946.322.616 (13,7B en `fl2va`; 13,9B en `ref2va`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (14,93 GB), Q6_K (11,58 GB), Q5_K_M (10,28 GB), Q4_K_M (9,05 GB) |
| Idiomas soportados | no disponible (prompts de texto; el codificador Qwen3-VL es multilingüe, pero no se documenta el alcance) |
| Licencia | MiniMax H3 Community License (código Apache-2.0; pesos bajo licencia comunitaria con restricción territorial) |
| Formato de pesos | GGUF (solo transformer; codificador de texto y VAE en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para generación conjunta de vídeo y audio, derivado de MiniMax-H3 mediante un proceso de compresión y destilación de pasos que reduce el número de parámetros del transformer de ~31B a 13,7B (`fl2va`) y permite muestrear en 4, 6 u 8 pasos sin CFG. La variante incluida en este repositorio, `fl2va`, acepta texto y fotogramas clave (primero, o primero y último); la variante `ref2va`, con hasta 12 referencias, se distribuye en un repositorio separado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación técnica destacable es el esquema de muestreo de pocos pasos (por defecto 6) sin guiado libre de clasificador, que junto con la reducción de parámetros permite la ejecución en GPUs de 24 GB. El paquete de inferencia acelerada NVIDIA SOL-H3 da soporte al modelo desde el primer día en 4× GPUs B-series.

## Capacidades

- Generación de vídeo a partir de texto (`t2va`): clips de 5,2 a 15 segundos a 24 fps, 1344×768 por defecto.
- Generación de audio sincronizado: pista estéreo de 32 kHz generada junto al vídeo.
- Generación condicionada por primer fotograma (`i2v`) y por primer y último fotograma (`flf2v`).
- Generación con referencias visuales (`ref2va`, hasta 12 referencias) en el repositorio hermano; en GGUF solo admite imágenes como referencia.
- Muestreo en 4, 6 u 8 pasos sin CFG.
- Integración con ComfyUI mediante ComfyUI-GGUF y los nodos ComfyUI-HyperFlow-Flash.
- Soporte de INT8 safetensors en ComfyUI y en Python para GPUs de centro de datos.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Prototipado rápido de vídeo generativo en estación de trabajo: con Q4_K_M (9,05 GB) el modelo cabe en una GPU de 24 GB y permite iterar prompts de texto a vídeo con audio en ComfyUI sin infraestructura de centro de datos.
- Generación de clips cortos para redes sociales: clips de 5,2 s a 24 fps con audio estéreo sincronizado cubren formatos verticales y horizontales típicos de plataformas, con un coste de 92 s por clip en una RTX 5090.
- Animación de imágenes fijas (image-to-video): la tarea `fl2va` acepta un primer fotograma y genera movimiento coherente, útil para convertir ilustraciones o fotografías en clips animados.
- Interpolación controlada entre fotogramas (first-last-frame): útil en postproducción para generar transiciones entre dos imágenes clave manteniendo coherencia temporal y audio.
- Previsualización de storyboards: generar versiones animadas de guiones gráficos con audio antes de producir el vídeo final, reduciendo coste frente a pipelines de render tradicionales.
- Investigación en generación multimodal: el modelo sirve como banco de pruebas para estudiar muestreo de pocos pasos sin CFG y generación conjunta de vídeo y audio en GPUs de consumo.
- Despliegue en tiempo real con SOL-H3: en 4× GPUs Blackwell, NVIDIA SOL-H3 ejecuta el modelo en tiempo real, habilitando demos interactivas o aplicaciones de streaming generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento publicados son tiempos de inferencia para un clip de 5,2 s con 6 pasos:

| Configuracion | Tiempo por clip (5,2 s, 6 pasos) |
|---|---|
| 4× B200 | 8,7 s |
| 1× H200 | 36 s |
| 1× RTX 5090 | 92 s |

## Requisitos de hardware

- VRAM estimada: Q4_K_M requiere 9,05 GB para el transformer; Q8_0 requiere 14,93 GB. Hay que sumar la memoria del codificador de texto (Qwen3-VL) y los VAE del modelo base.
- El autor indica que Q4_K_M funciona en GPUs de 24 GB y 32 GB en equipos con 16 GB de RAM de sistema; las GPUs de 16 GB no están medidas.
- GPUs recomendadas: RTX 5090 (92 s por clip de 5,2 s), H200 (36 s), 4× B200 (8,7 s). Para INT8 en ComfyUI se recomienda una RTX de 24 GB o más con al menos 16 GB de RAM de sistema y PyTorch compilado para CUDA 13.0 o superior (o `--enable-triton-backend`).
- Cabe en GPUs de consumo de 24 GB (por ejemplo, RTX 4090/5090) con la cuantización Q4_K_M; en 16 GB no está verificado.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF y ComfyUI-HyperFlow-Flash; stable-diffusion.cpp; Unsloth Studio; paquete Python INT8 convrot para GPUs de centro de datos; NVIDIA SOL-H3 para tiempo real en 4× B-series.
- Latencia y throughput: ver tabla de benchmarks; no se publican más métricas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyperFlow H3 Flash (este) | 13,7B (`fl2va`) / 13,9B (`ref2va`) | no disponible | Vídeo 5,2-15 s a 24 fps + audio 32 kHz estéreo, 4/6/8 pasos sin CFG | MiniMax H3 Community License (restricción territorial) | GGUF, INT8 safetensors, ComfyUI, Python |
| MiniMax-H3 (base) | ~31B (transformer) | no disponible | Vídeo + audio | MiniMax H3 Community License | Pesos completos en Hugging Face |
| HyperFlow (LoRA 8 pasos sobre MiniMax-H3 completo) | ~31B | no disponible | Vídeo + audio, 8 pasos | no disponible en la información | LoRA sobre el transformer completo |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La licencia MiniMax H3 Community License restringe el territorio: no está licenciada en la UE, Reino Unido, Corea del Sur ni EE. UU. sin autorización previa de MiniMax. Esto afecta directamente a su uso comercial en España.
- Incluye una Política de Uso Aceptable que condiciona los casos de uso permitidos.
- El repositorio solo contiene el transformer en GGUF; es necesario descargar el codificador de texto (Qwen3-VL) y los VAE del modelo base MiniMax-H3, lo que complica el despliegue.
- No existen archivos F16/BF16: el autor no publicó pesos a plena precisión, por lo que no es posible una referencia sin cuantizar.
- Los archivos Q3_K_M y Q4_K_S del autor no están incluidos en este espejo.
- El rendimiento en GPUs de 16 GB no está medido; el mínimo verificado es 24 GB.
- La variante `ref2va` en GGUF solo admite imágenes como referencia (no vídeos ni audio); para vídeo y audio de referencia hay que usar INT8 en Python.
- No se documentan sesgos, tasas de alucinación ni evaluación de calidad cualitativa del vídeo generado.
- Al ser un espejo, los archivos deben verificar el sha256 indicado; cualquier discrepancia invalida la integridad.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento textual.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-ai/hyperflow-h3-flash-GGUF
- Modelo base (HyperFlow H3 Flash): https://huggingface.co/VideoRebirthAI/hyperflow-h3-flash
- Variante `ref2va` en GGUF: https://huggingface.co/moonbox-ai/hyperflow-h3-flash-ref2va-GGUF
- MiniMax-H3 (modelo original): https://huggingface.co/MiniMaxAI/MiniMax-H3
- LoRA HyperFlow 8 pasos: https://huggingface.co/VideoRebirthAI/hyperflow
- Repositorio GitHub de HyperFlow H3 Flash: https://github.com/Video-Rebirth/hyperflow-h3-flash
- Repositorio GitHub del LoRA HyperFlow: https://github.com/Video-Rebirth/hyperflow
- NVIDIA SOL-H3: https://github.com/NVlabs/Sana/tree/sol-engine/models/minimax_h3/HyperFlow-Flash
- Showcase de ejemplos: https://www.videorebirth.com/lp/hyperflow-flash
- Web de Video Rebirth: https://www.videorebirth.com/

# moonbox-dev/hyperflow-h3-flash-GGUF

## Resumen

HyperFlow H3 Flash es un modelo de generación de vídeo con audio sincronizado desarrollado por Video Rebirth, publicado originalmente en el repositorio `VideoRebirthAI/hyperflow-h3-flash`. Se trata de una versión comprimida y de pocos pasos ("few-step") del transformer de MiniMax-H3, que reduce el tamaño del modelo original (~31B parámetros) a unos 13,7B parámetros en su variante `fl2va` (texto e imagen clave a vídeo) y 13,9B en la variante `ref2va` (referencia a vídeo). El repositorio analizado, `moonbox-dev/hyperflow-h3-flash-GGUF`, es un espejo sin modificaciones de los archivos GGUF publicados por el autor original, renombrados para su distribución.

El modelo genera clips de 5,2 a 15 segundos a 24 fps (1344×768 por defecto) con una pista de audio estéreo de 32 kHz, empleando un esquema de muestreo de 4, 6 u 8 pasos sin classifier-free guidance (CFG). La propuesta de valor es la eficiencia: un clip de 5,2 segundos a 6 pasos se genera en 8,7 segundos sobre 4× B200, 36 segundos sobre 1× H200 y 92 segundos sobre una RTX 5090, lo que lo sitúa como una opción viable para despliegues en hardware de consumo de gama alta.

La relevancia actual radica en la combinación de generación conjunta de vídeo y audio, el soporte de cuantización GGUF para GPUs de 24 GB (Q4_K_M ocupa 9,1 GB) y la integración con ComfyUI mediante nodos específicos. La licencia es la MiniMax H3 Community License, que restringe el uso en la UE, Reino Unido, Corea del Sur y EE. UU. sin autorización previa de MiniMax, un caveat crítico para producción en España.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (variante comprimida de MiniMax-H3); variantes `fl2va` y `ref2va` |
| Parámetros totales | 13.946.322.616 (~13,9B; `fl2va` reporta 13,7B, `ref2va` 13,9B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0, Q6_K, Q5_K_M, Q4_K_M (en este repo); Q3_K_M y Q4_K_S existen en el repo del autor pero no se espejan aquí |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License (derivada; código Apache-2.0) |
| Formato de pesos | GGUF (solo el transformer; el text encoder y los VAE provienen del modelo base MiniMax-H3) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para generación de vídeo con audio, derivado de MiniMax-H3 mediante un proceso de compresión y destilación a pocos pasos ("few-step"). No se trata de una arquitectura MoE ni de un modelo SSM/híbrido según la información disponible. El transformer reducido cuenta con 13,7B parámetros en la variante `fl2va` y 13,9B en `ref2va`, lo que supone menos de la mitad del transformer original de MiniMax-H3 (~31B). El text encoder es Qwen3-VL y los VAE provienen del modelo base MiniMax-H3.

El entrenamiento se orienta a la generación conjunta de vídeo y audio estéreo sincronizado, con un esquema de muestreo de 4, 6 u 8 pasos sin CFG (por defecto 6 pasos). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación técnica destacable es la reducción de pasos de muestreo (few-step) que permite latencias de decenas de segundos en GPUs de centro de datos y de consumo, así como la integración con el motor de aceleración NVIDIA SOL-H3 para inferencia en tiempo real sobre 4× GPUs Blackwell.

## Capacidades

- Generación de vídeo a partir de texto (`t2va`): clips de 5,2 a 15 segundos a 24 fps, 1344×768 por defecto.
- Generación de audio sincronizado: pista estéreo a 32 kHz generada junto al vídeo.
- Generación condicionada por imagen clave (`fl2va`): primer fotograma, o primer y último fotograma, más prompt de texto.
- Generación por referencia (`ref2va`): hasta 12 referencias de imagen (en GGUF solo imágenes; en INT8 Python también vídeos y audio).
- Muestreo eficiente: 4, 6 u 8 pasos sin classifier-free guidance (CFG).
- Integración con ComfyUI mediante nodos `ComfyUI-HyperFlow-Flash` y soporte GGUF vía `ComfyUI-GGUF`.
- Soporte de inferencia en stable-diffusion.cpp y Unsloth Studio (según la model card).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo textual.

## Casos de uso

- Generación de clips promocionales para redes sociales: el modelo produce vídeos de 5,2 a 15 segundos con audio sincronizado a partir de un prompt, adecuado para piezas cortas de marketing con latencias de 36 s en H200 o 92 s en RTX 5090.
- Creación de vídeo a partir de storyboards: la variante `fl2va` acepta primer y último fotograma, lo que permite interpolar movimiento entre keyframes definidos por un artista para previsualizaciones animáticas.
- Prototipado de anuncios con audio: la generación conjunta de vídeo y pista estéreo de 32 kHz evita un pipeline separado de audio, útil para demos rápidas en agencias.
- Generación de contenido con referencias de personaje: la variante `ref2va` admite hasta 12 referencias de imagen, lo que facilita mantener consistencia visual de un personaje o producto a lo largo de un clip.
- Previsualización en pipelines de postproducción: la integración con ComfyUI y los nodos de HyperFlow permiten insertar el modelo en flujos de trabajo existentes para generar planos de relleno o previsiones.
- Experimentación en investigación de generación multimodal: al ser una versión comprimida y de pocos pasos de MiniMax-H3, sirve como banco de pruebas para estudiar la degradación de calidad frente al modelo completo con menor coste computacional.
- Despliegue en estaciones de trabajo con GPU de 24 GB: la cuantización Q4_K_M (9,1 GB) permite ejecutar el modelo en GPUs de consumo de gama alta con 16 GB de RAM de sistema, habilitando pruebas locales sin clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente proporciona métricas de latencia:

| Configuración | Clip de 5,2 s a 6 pasos |
|---|---|
| 4× B200 | 8,7 s |
| 1× H200 | 36 s |
| 1× RTX 5090 | 92 s |

## Requisitos de hardware

- VRAM estimada para inferencia (solo transformer en GGUF): Q4_K_M ~9,1 GB; Q5_K_M ~10,3 GB; Q6_K ~11,6 GB; Q8_0 ~14,9 GB.
- GPU recomendadas: B200, H200 para producción de baja latencia; RTX 5090 para estaciones de trabajo; RTX 4090 (24 GB) para Q4_K_M según la model card ("Q4_K_M runs on a 24 GB GPU").
- Cabe en GPU de consumo: sí, en GPUs de 24 GB y 32 GB con al menos 16 GB de RAM de sistema. Las GPUs de 16 GB no se han medido según el autor.
- Opciones de despliegue: ComfyUI con `ComfyUI-GGUF` y nodos `ComfyUI-HyperFlow-Flash`; stable-diffusion.cpp; Unsloth Studio; paquete Python INT8 convrot en GPUs de centro de datos; motor NVIDIA SOL-H3 para tiempo real en 4× Blackwell.
- Latencia y throughput: 8,7 s (4× B200), 36 s (1× H200), 92 s (1× RTX 5090) para un clip de 5,2 s a 6 pasos. No se dispone de throughput en clips por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyperFlow H3 Flash (este) | ~13,9B (`fl2va` 13,7B) | no disponible | Vídeo 5,2-15 s + audio 32 kHz | MiniMax H3 Community (restringida en UE/UK/KR/US) | GGUF, INT8 safetensors |
| MiniMax-H3 (base) | ~31B (transformer) | no disponible | Vídeo + audio | MiniMax H3 Community | Pesos completos |
| HyperFlow (LoRA 8 pasos sobre MiniMax-H3) | ~31B | no disponible | Vídeo + audio | no disponible | LoRA sobre modelo completo |

No se dispone de datos de benchmarks para comparar rendimiento cualitativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la MiniMax H3 Community License no autoriza el uso en la UE, Reino Unido, Corea del Sur ni EE. UU. sin autorización previa de MiniMax. España está en la UE, por lo que el uso comercial requiere autorización expresa.
- El repositorio es un espejo no oficial: los archivos son del autor original (Video Rebirth), renombrados por Moonbox; la licencia del modelo original gobierna su uso.
- No hay pesos en F16/BF16: el autor no publicó pesos de precisión completa, lo que limita la reproducibilidad y el ajuste fino a partir de este repo.
- Solo el transformer está en GGUF: el text encoder (Qwen3-VL) y los VAE deben obtenerse del modelo base MiniMax-H3, lo que añade dependencias y consumo de memoria adicional.
- Riesgo de alucinación visual y artefactos: no se documentan métricas de fidelidad ni de coherencia temporal; la información disponible no permite evaluar la tasa de artefactos.
- Idiomas soportados no disponibles: no se especifica el multilingüismo del text encoder ni del modelo.
- Limitaciones de hardware: las GPUs de 16 GB no se han medido; el rendimiento en ellas es incierto.
- Sin datos de sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad más allá de la Acceptable Use Policy de la licencia.
- Uso en producción: la licencia, la falta de pesos completos y la dependencia de nodos de ComfyUI específicos son caveats relevantes antes de desplegar.

## Enlaces

- Repositorio Hugging Face analizado: https://huggingface.co/moonbox-dev/hyperflow-h3-flash-GGUF
- Modelo base: https://huggingface.co/VideoRebirthAI/hyperflow-h3-flash
- Variante `ref2va` GGUF: https://huggingface.co/moonbox-ai/hyperflow-h3-flash-ref2va-GGUF
- MiniMax-H3 (modelo original): https://huggingface.co/MiniMaxAI/MiniMax-H3
- LoRA HyperFlow 8 pasos: https://huggingface.co/VideoRebirthAI/hyperflow
- Repositorio GitHub de HyperFlow H3 Flash: https://github.com/Video-Rebirth/hyperflow-h3-flash
- Repositorio GitHub de HyperFlow (LoRA): https://github.com/Video-Rebirth/hyperflow
- Motor NVIDIA SOL-H3: https://github.com/NVlabs/Sana/tree/sol-engine/models/minimax_h3/HyperFlow-Flash
- Showcase de vídeo y audio: https://www.videorebirth.com/lp/hyperflow-flash
- Web de Video Rebirth: https://www.videorebirth.com/

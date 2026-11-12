# moonbox-ai/hyperflow-h3-flash-ref2va-GGUF

## Resumen

HyperFlow H3 Flash (reference-to-video) es una variante del modelo de generación de vídeo con audio sincronizado HyperFlow H3 Flash, desarrollado por Video Rebirth como versión comprimida y de pocos pasos de MiniMax-H3. Este repositorio concreto, publicado por moonbox-ai, contiene únicamente el transformador en formato GGUF de la partición `ref2va` (reference-to-video), que acepta hasta 12 referencias visuales junto a un prompt de texto para generar un vídeo de 5,2 a 15 segundos a 24 fps (1344×768 por defecto) con una pista de audio estéreo a 32 kHz.

El modelo base tiene aproximadamente 13,9 mil millones de parámetros en esta partición, menos de la mitad del transformador original de MiniMax-H3 (~31B). La inferencia se realiza con un schedule de 4, 6 u 8 pasos sin classifier-free guidance (CFG), siendo 6 pasos el valor por defecto. Según el autor, una clínica de 5,2 segundos se genera en 8,7 s sobre 4× B200, 36 s sobre 1× H200 y 92 s sobre una RTX 5090.

La relevancia de este repositorio es práctica: ofrece los ficheros GGUF oficiales del editor (no reconvertidos por moonbox) con cuantizaciones Q8_0, Q6_K, Q5_K_M y Q4_K_M, lo que permite ejecutar el modelo en GPUs de consumo de 24 GB y 32 GB con 16 GB de RAM de sistema. La licencia MiniMax H3 Community License restringe el territorio de uso (no licenciado en la UE, Reino Unido, Corea del Sur ni EE. UU. sin autorización previa de MiniMax), lo que condiciona su adopción en España.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (variante comprimida de MiniMax-H3, no se detalla la arquitectura interna) |
| Parámetros totales | 14.164.330.680 (~14,2B); el autor indica 13,9B para la partición `ref2va` |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0, Q6_K, Q5_K_M, Q4_K_M (solo transformador; el text encoder Qwen3-VL y los VAE vienen del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License (derivada; código Apache-2.0) |
| Formato de pesos | GGUF (no hay F16/BF16; el editor no publicó pesos en precisión completa) |

## Arquitectura y entrenamiento

HyperFlow H3 Flash es una versión comprimida y de pocos pasos de MiniMax-H3, destilada para funcionar con 4, 6 u 8 pasos de muestreo sin CFG. El modelo genera de forma conjunta vídeo y audio estéreo sincronizado, lo que implica un transformador multimodal que produce latentes de vídeo y de audio en el mismo proceso de difusión. La partición `ref2va` está especializada en reference-to-video: toma un prompt de texto más hasta 12 referencias (imágenes en ComfyUI y GGUF; imágenes, vídeos y audio en la implementación Python INT8) y genera el vídeo condicionado por ellas.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La reducción de tamaño respecto al transformador original (~31B a ~13,9B) y la destilación a pocos pasos son las innovaciones técnicas destacadas. El repositorio de moonbox no reconvierte los pesos: cada fichero GGUF es el del editor original, renombrado, con verificación de sha256 contra el repositorio fuente en la revisión `c8f74e481b`. La ejecución se realiza en ComfyUI con ComfyUI-GGUF y los nodos `ComfyUI-HyperFlow-Flash` del editor, usando el text encoder Qwen3-VL y los VAE de MiniMax-H3.

## Capacidades

- Generación de vídeo a partir de texto con audio estéreo sincronizado (tarea `t2va`, disponible en la partición `fl2va`, no en esta).
- Reference-to-video (`ref2va`): generación de vídeo condicionada por hasta 12 referencias visuales junto a un prompt.
- Generación de vídeo con primer keyframe o primer y último keyframe (tareas `fl2va`, en el repositorio hermano `fl2va`).
- Salida de vídeo de 5,2 a 15 segundos a 24 fps, 1344×768 por defecto, con pista de audio estéreo a 32 kHz.
- Muestreo de pocos pasos (4, 6 u 8) sin classifier-free guidance, con 6 pasos como valor por defecto.
- Integración en ComfyUI mediante ComfyUI-GGUF y los nodos HyperFlow Flash.
- En esta partición `ref2va` en GGUF, las referencias están limitadas a imágenes; vídeo y audio como referencia solo están disponibles en la implementación Python INT8.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo generativo de vídeo/audio, no un LLM conversacional.

## Casos de uso

- Publicidad y contenido de marca con referencias visuales: usar `ref2va` con hasta 12 imágenes de producto, logotipos o estilos para generar clips de 5-15 s con audio sincronizado, manteniendo coherencia con las referencias aportadas.
- Previsualización de storyboards: a partir de un prompt y keyframes (variante `fl2va`) o referencias (`ref2va`), generar clips rápidos para validar dirección de arte antes de producir en alta calidad.
- Creación de contenido para redes sociales: clips cortos de 5,2 s con audio estéreo generados en 92 s sobre una RTX 5090, adecuados para iteración rápida en un flujo de publicación.
- Prototipado de vídeo musical o doblaje: la generación conjunta de vídeo y audio a 32 kHz permite explorar sincronización audio-visual sin pipeline separado.
- Animación de personajes o productos a partir de referencias: la partición `ref2va` permite condicionar el resultado con imágenes de un personaje concreto para mantener su apariencia entre clips.
- Investigación en generación de vídeo de pocos pasos: el schedule de 4-8 pasos sin CFG y la disponibilidad de GGUF facilitan experimentos de eficiencia en GPUs de consumo (24-32 GB).
- Despliegue en estaciones de trabajo con ComfyUI: el formato GGUF Q4_K_M (9,1 GB) permite ejecutar el modelo en GPUs de 24 GB con 16 GB de RAM de sistema, útil para estudios pequeños sin clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento aportados son tiempos de inferencia para un clip de 5,2 s con 6 pasos: 8,7 s en 4× B200, 36 s en 1× H200 y 92 s en una RTX 5090. El autor también menciona que NVIDIA SOL-H3 ejecuta el modelo en tiempo real sobre 4× GPUs Blackwell.

## Requisitos de hardware

- VRAM estimada: Q4_K_M ocupa 9,1 GB (fichero de 9,22 GB); Q8_0 ocupa 14,9 GB (fichero de 15,16 GB). A esto hay que sumar el text encoder Qwen3-VL y los VAE del modelo base, que no están incluidos en este repositorio.
- GPUs recomendadas: 4× B200 (8,7 s por clip de 5,2 s), 1× H200 (36 s), RTX 5090 (92 s). El autor indica que funciona en GPUs de 24 GB y 32 GB en equipos con 16 GB de RAM de sistema; las GPUs de 16 GB no están medidas.
- Cabe en GPU de consumo: sí, en RTX 5090 (32 GB) y en GPUs de 24 GB con la cuantización Q4_K_M; el rendimiento en 16 GB no está verificado.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF y los nodos `ComfyUI-HyperFlow-Flash`; también hay soporte INT8 en ComfyUI y en Python. NVIDIA SOL-H3 ofrece aceleración en 4× Blackwell.
- Latencia y throughput: 8,7 s (4× B200), 36 s (1× H200) y 92 s (RTX 5090) por clip de 5,2 s a 6 pasos; tiempo real sobre 4× B-series con SOL-H3.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyperFlow H3 Flash `ref2va` (este repo, GGUF) | ~13,9B (14,16B en safetensors) | no disponible | Vídeo 5,2-15 s a 24 fps + audio 32 kHz estéreo | MiniMax H3 Community License (restringe UE, UK, Corea del Sur y EE. UU.) | GGUF Q8_0/Q6_K/Q5_K_M/Q4_K_M en Hugging Face |
| MiniMax-H3 (modelo base) | ~31B (transformador) | no disponible | Vídeo + audio | MiniMax H3 Community License | Pesos completos en Hugging Face |
| HyperFlow H3 Flash `fl2va` | ~13,7B | no disponible | Vídeo 5,2-15 s + audio | MiniMax H3 Community License | GGUF en `moonbox-ai/hyperflow-h3-flash-GGUF`; MLX en `moonbox-ai/hyperflow-h3-flash-MLX` |
| HyperFlow (LoRA 8 pasos sobre MiniMax-H3 completo) | ~31B (base) | no disponible | Vídeo + audio | MiniMax H3 Community License | `VideoRebirthAI/hyperflow` |

No se dispone de datos de benchmarks que permitan comparar rendimiento cualitativo con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Licencia restrictiva: la MiniMax H3 Community License no licencia el uso en la UE, el Reino Unido, Corea del Sur ni EE. UU. sin autorización previa de MiniMax; esto afecta directamente a usuarios en España y requiere revisión legal antes de cualquier uso comercial.
- Restricción de referencias en GGUF: en esta partición `ref2va` en formato GGUF, las referencias están limitadas a imágenes; vídeo y audio como referencia solo están disponibles en la implementación Python INT8.
- Dependencia del modelo base: solo el transformador está en GGUF; el text encoder Qwen3-VL y los VAE deben obtenerse de MiniMax-H3, lo que añade requisitos de VRAM y complejidad de despliegue.
- Sin pesos en precisión completa: el editor no publicó F16/BF16, por lo que no es posible partir de pesos sin cuantizar; las cuantizaciones Q3_K_M y Q4_K_S del editor no están replicadas aquí.
- Riesgo de alucinación visual y artefactos: como modelo generativo de vídeo, puede producir inconsistencias temporales, deformaciones anatómicas o desincronización audio-visual; no se documentan evaluaciones cuantitativas al respecto.
- Sesgos: no se documentan sesgos conocidos en la información disponible, pero al ser un modelo entrenado con datos web es probable que herede sesgos de representación; no hay datos para cuantificarlos.
- Idiomas: no se especifican los idiomas soportados por el text encoder ni por el modelo; no disponible.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la ficha, publicado el 12 de noviembre de 2026; es un espejo, no un desarrollo propio, y su mantenimiento depende del editor original.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni equivalentes de calidad de vídeo que permitan una evaluación objetiva frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-ai/hyperflow-h3-flash-ref2va-GGUF
- Modelo base (reference-to-video): https://huggingface.co/VideoRebirthAI/hyperflow-h3-flash
- Repositorio GGUF de la variante `fl2va`: https://huggingface.co/moonbox-ai/hyperflow-h3-flash-GGUF
- Repositorio MLX: https://huggingface.co/moonbox-ai/hyperflow-h3-flash-MLX
- MiniMax-H3 (modelo original): https://huggingface.co/MiniMaxAI/MiniMax-H3
- LoRA 8 pasos sobre MiniMax-H3: https://huggingface.co/VideoRebirthAI/hyperflow
- GitHub del LoRA: https://github.com/Video-Rebirth/hyperflow
- GitHub de HyperFlow H3 Flash (código, guías y flujos de ComfyUI): https://github.com/Video-Rebirth/hyperflow-h3-flash
- Showcase de vídeo y audio: https://www.videorebirth.com/lp/hyperflow-flash
- Video Rebirth: https://www.videorebirth.com/
- NVIDIA SOL-H3: https://github.com/NVlabs/Sana/tree/sol-engine/models/minimax_h3/HyperFlow-Flash

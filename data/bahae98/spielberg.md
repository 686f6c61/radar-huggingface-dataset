# bahae98/spielberg

## Resumen

Spielberg es una implementación local del modelo de difusión Wan2.2-Animate-14B, desarrollada por el usuario bahae98, que permite generar vídeos de animación de personajes y de sustitución de personajes (replacement) directamente en un Mac con Apple Silicon. El modelo subyacente es un transformer de difusión image-to-video de 14B parámetros de Alibaba Wan, reimplementado desde cero en Apple MLX con pesos cuantizados a 4 bits, de modo que la inferencia no requiere PyTorch ni ComfyUI.

El repositorio de Hugging Face (2,6 GB) actúa como punto de distribución del proyecto, que incluye un motor de inferencia MLX, un servidor FastAPI con cola de trabajos y progreso por WebSocket, y una interfaz web en React/Vite. El modelo es un único DiT de aproximadamente 17B parámetros (el backbone I2V de 14B más los módulos Animate), no la variante MoE de 27B.

Su relevancia radica en que demuestra que un modelo de vídeo de 14B puede ejecutarse de forma totalmente local y privada en hardware de consumo Apple, a costa de una velocidad baja (minutos por clip corto). Está validado en un M4 Pro con 48 GB de memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) image-to-video con módulos Animate (pose embedding, CLIP image cross-attention, StyleGAN motion encoder, face adapter) |
| Parametros totales | ~17B (backbone I2V de 14B + módulos Animate) |
| Parametros activos | no disponible (no es MoE; el autor indica explícitamente que no usa la variante MoE de 27B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (DiT cuantizado en MLX); pesos originales en GGUF Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Código propio: MIT; pesos del modelo: Apache-2.0 (Alibaba Wan Team); motor base vendorizado: MIT (mlx-video) |
| Formato de pesos | GGUF Q4_K_M (origen) convertido a safetensors MLX (~11 GB); auxiliares T5 + VAE en MLX |

## Arquitectura y entrenamiento

El sistema se compone de un motor MLX que integra un codificador de texto umT5, un VAE Wan2.1 para codificación y decodificación de vídeo, y un DiT de 4 bits (WanAnimateModel) con módulos específicos de animación: pose embedding, cross-attention de imagen CLIP, un codificador de movimiento StyleGAN y un adaptador facial. El muestreo se realiza mediante flow matching con samplers UniPC o DPM++. El código base de Wan2.2 (DiT/VAE/T5/scheduler) está vendorizado desde mlx-video (MIT), mientras que la capa específica de Animate es un port a MLX de la referencia oficial en PyTorch (Apache-2.0).

El preprocesamiento de pose y rostro utiliza YOLOv10 y ViTPose en ONNX, y opcionalmente SAM2 para máscaras precisas de silueta en modo replacement. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre etapas de RLHF o DPO del modelo base; el autor no documenta esos detalles en la model card. La innovación principal es la reimplementación completa en MLX con cuantización a 4 bits, que permite ejecutar un modelo de vídeo de 14B en memoria unificada de Apple Silicon sin PyTorch en inferencia.

## Capacidades

- Generación de vídeo de animación de personajes a partir de un vídeo conductor (modo Animate).
- Sustitución de personajes en vídeo (modo Replace) con fusión de LoRA de relighting y condicionamiento de fondo y máscara.
- Codificación de texto mediante umT5 para prompts descriptivos.
- Codificación de imagen mediante CLIP ViT-H/14 para condicionamiento visual.
- Preprocesamiento de pose y rostro con YOLOv10 y ViTPose (ONNX).
- Segmentación opcional de silueta con SAM2 en modo replacement.
- Generación de vídeo MP4 como salida.
- Interfaz web con carga de vídeo, controles, progreso en vivo e historial.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio ni thinking mode.

## Casos de uso

- Animación de personajes para prototipado creativo: un diseñador sube un vídeo conductor y obtiene un clip animado del personaje, todo en local sin enviar material a servicios en la nube.
- Sustitución de personajes en postproducción: se reemplaza un actor por otro personaje manteniendo la pose y el movimiento, con condicionamiento de máscara y relighting para integrar la iluminación.
- Generación de vídeo privada y sensible: al ejecutarse íntegramente en el Mac del usuario, es adecuado para material que no puede salir del dispositivo por motivos de confidencialidad.
- Iteración rápida de conceptos: reduciendo resolución, número de pasos y fotogramas, el equipo creativo puede generar borradores de clips cortos para validar ideas antes de una producción mayor.
- Investigación en modelos de difusión de vídeo: el código MLX permite estudiar y modificar el pipeline (samplers, módulos Animate, cuantización) sin depender de PyTorch.
- Demostraciones y docencia: la interfaz web con progreso en vivo y el servidor FastAPI facilitan mostrar el funcionamiento de un modelo de vídeo de 14B en hardware de consumo.
- Automatización de pipelines de vídeo: el servidor con cola de trabajos y SQLite permite encadenar generaciones por lotes de clips cortos de forma desatendida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo aporta una advertencia cualitativa: en un M4 Pro de 48 GB se deben esperar minutos por cada clip corto, y recomienda reducir resolución, pasos y número de fotogramas para iterar más rápido.

## Requisitos de hardware

- Apple Silicon Mac (serie M) con macOS; validado en un M4 Pro con 48 GB de memoria unificada.
- Espacio en disco: aproximadamente 40 GB libres (unos 30 GB de pesos originales y unos 11 GB del DiT convertido a MLX).
- Python 3.11+, Node 18+ y ffmpeg.
- VRAM estimada: no aplica VRAM dedicada; el modelo usa memoria unificada. El DiT cuantizado a 4 bits ocupa unos 11 GB, más T5, VAE, CLIP y el resto del pipeline.
- GPU recomendadas: no disponibles para CUDA; el proyecto está diseñado exclusivamente para Apple Silicon con MLX.
- No cabe en GPUs de consumo NVIDIA por diseño del proyecto (no hay backend CUDA documentado).
- Opciones de despliegue: motor MLX propio con servidor FastAPI y frontend React/Vite; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma numérica; el autor indica minutos por clip corto en M4 Pro/48 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Spielberg (bahae98) | ~17B (DiT) | no disponible | MIT (código) / Apache-2.0 (pesos) | Hugging Face, 0 descargas | Implementación MLX para Apple Silicon, 4 bits |
| Wan2.2-Animate-14B (Wan-AI) | 14B | no disponible | Apache-2.0 | Hugging Face | Modelo base oficial en PyTorch; referencia del port |
| Wan2.2 MoE 27B (Wan-AI) | 27B (MoE) | no disponible | Apache-2.0 | Hugging Face | Variante MoE que el autor indica no usar |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Velocidad muy baja: minutos por clip corto incluso en un M4 Pro de 48 GB; no es apto para generación en tiempo real.
- Exclusivo de Apple Silicon: no hay backend CUDA ni soporte documentado para GPUs NVIDIA.
- Requiere unos 40 GB de disco y un proceso de descarga y conversión de pesos previo al uso.
- La cuantización a 4 bits puede degradar la calidad frente a los pesos originales en precisión completa.
- El modo replacement usa por defecto una máscara corporal derivada de la pose; la silueta precisa requiere instalar SAM2 manualmente.
- El retargeting de pose y la edición con FLUX no están implementados.
- El servidor procesa un único trabajo de 14B a la vez (cola serial), lo que limita el throughput.
- No se documentan sesgos, idiomas soportados ni evaluación de alucinación; al ser un modelo de vídeo, el riesgo principal es la generación de contenido visual inexacto o no fiel al vídeo conductor.
- La licencia del código es MIT y la de los pesos Apache-2.0; conviene revisar los términos de Alibaba Wan para uso comercial de los pesos.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/bahae98/spielberg
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-Animate-14B
- Motor base vendorizado (mlx-video): https://github.com/Blaizzy/mlx-video
- SAM2 (opcional para máscaras): https://github.com/facebookresearch/sam2

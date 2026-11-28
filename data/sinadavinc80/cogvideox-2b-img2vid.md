# Sinadavinc80/cogvideox-2b-img2vid

## Resumen

CogVideoX-2B-Img2Vid es un modelo de generación de vídeo a partir de imagen (image-to-video) publicado en Hugging Face por el usuario Sinadavinc80 bajo el identificador `Sinadavinc80/cogvideox-2b-img2vid`. Se trata de un fine-tuning del modelo CogVideoX-2B desarrollado originalmente por THUDM (Tsinghua University), adaptado específicamente para la tarea de animar una imagen estática siguiendo una descripción textual. El modelo se distribuye en formato diffusers y safetensors, con un total de 1.693.906.752 parámetros (aproximadamente 1,7 mil millones), lo que lo sitúa en la gama compacta de los modelos de difusión para vídeo.

La relevancia de esta variante radica en su supuesta capacidad de alcanzar una calidad "SBS" (side-by-side) comparable al modelo CogVideoX-5B en su versión image-to-video, según afirma el autor, gracias a un fine-tuning sobre 10 millones de vídeos. Esto lo convertiría en una alternativa atractiva para entornos con recursos limitados, ya que su menor número de parámetros reduce los requisitos de VRAM frente a la variante de 5B. No obstante, el repositorio no incluye información verificable sobre la metodología exacta del fine-tuning, la composición del dataset ni resultados de benchmarks reproducibles.

El modelo está etiquetado con licencia Apache 2.0, lo que permite uso comercial, y soporta únicamente el idioma inglés según la model card. Su pipeline en diffusers es `CogVideoXPipeline`, y se ofrece integración con ComfyUI mediante un nodo personalizado del repositorio Nim-Video. A fecha de creación del repositorio (28 de noviembre de 2026), el modelo no registra descargas ni likes, lo que sugiere que se trata de una publicación reciente o de escasa difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión (CogVideoX, transformer de difusión para vídeo) |
| Parametros totales | 1.693.906.752 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de generación de vídeo, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato diffusers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura CogVideoX, un transformer de difusión diseñado para la generación de vídeo, en su variante de 2B parámetros. CogVideoX emplea un enfoque de difusión latente con un transformer como backbone y utiliza codificación de texto para condicionar la generación. La variante image-to-video añade condicionamiento por imagen inicial, de modo que el modelo anima una imagen estática siguiendo un prompt textual. El pipeline asociado en diffusers es `CogVideoXPipeline`.

Según la model card, el autor realizó un fine-tuning sobre 10 millones de vídeos para mejorar la calidad de la generación image-to-video, afirmando que el resultado alcanza un nivel comparable a CogVideoX-5B en su versión i2v. Sin embargo, no se especifican detalles técnicos del proceso: no se indica el número de tokens o frames de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas como RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). La información disponible sobre el entrenamiento es, por tanto, escasa y no verificable de forma independiente.

## Capacidades

- Generación de vídeo a partir de una imagen inicial (image-to-video): anima una imagen estática siguiendo una descripción textual en inglés.
- Condicionamiento por prompt textual: el texto guía el movimiento y la evolución de la escena.
- Integración con diffusers mediante `CogVideoXPipeline`.
- Soporte de inferencia por CLI (`inference.cli_demo`) y demo web con Gradio (`inference.gradio_web_demo`).
- Integración con ComfyUI a través de un nodo personalizado del repositorio Nim-Video.
- Idioma de los prompts: únicamente inglés según la model card.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general (más allá del condicionamiento por imagen), audio ni modo "thinking".

## Casos de uso

- Animación de fotografías para marketing: a partir de una imagen de producto, el modelo genera un vídeo corto con movimiento, útil para anuncios o catálogos animados en redes sociales, gracias a su condicionamiento image-to-video.
- Previsualización de storyboards: un ilustrador puede convertir un frame clave en un clip animado para validar la dirección de una escena antes de producir la animación final.
- Generación de contenido para redes sociales: creación de clips breves a partir de imágenes fijas con un prompt en inglés, adecuado para cuentas que necesitan volumen de vídeo sin rodaje.
- Prototipado en estudios de animación: generar movimientos preliminares a partir de concept art para explorar ritmo y composición de planos.
- Educación y divulgación: animar diagramas o ilustraciones estáticas para explicar procesos de forma visual en materiales didácticos.
- Experimentación en investigación de difusión para vídeo: al ser un modelo de 1,7B parámetros con licencia Apache 2.0, sirve como base para fine-tunings académicos en entornos con VRAM limitada.
- Integración en pipelines de ComfyUI: automatizar la generación de vídeo dentro de flujos de trabajo de creación de contenido existentes mediante el nodo personalizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que el rendimiento es comparable a CogVideoX-5B i2v en estándares "SBS", pero no se aportan métricas numéricas, datasets de evaluación ni metodología que permitan verificar dicha afirmación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de difusión de ~1,7B parámetros en formato safetensors (repo de 13,3 GB), se requiere habitualmente una GPU con al menos 12-16 GB de VRAM en precisión reducida, aunque el dato exacto no está documentado.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar viabilidad en GPUs consumer de gama alta (RTX 3090, RTX 4090) y en GPUs de datacenter (A100, H100), pero no se confirma.
- ¿Cabe en GPU consumer? Probablemente sí en GPUs con 16 GB o más de VRAM, pero no se dispone de confirmación oficial.
- Opciones de despliegue: diffusers (pipeline `CogVideoXPipeline`), CLI propia, Gradio y ComfyUI mediante nodo personalizado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente aquí).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CogVideoX-2B-Img2Vid (este) | ~1,7B | Image-to-video | No aplica | Apache 2.0 | Hugging Face (diffusers) |
| CogVideoX-5B (i2v) | ~5B | Image-to-video | No aplica | No disponible en la información | Hugging Face / THUDM |
| CogVideoX-2B (base) | ~2B | Text-to-video | No aplica | No disponible en la información | Hugging Face / THUDM |

La comparativa se limita a la familia CogVideoX, ya que no se dispone de datos verificables de otros modelos comparables en la información proporcionada. El modelo de 5B es la referencia citada por el autor como objetivo de calidad; el 2B base es el punto de partida del fine-tuning. No se dispone de métricas comparativas numéricas.

## Limitaciones y advertencias

- La afirmación de calidad equiparable a CogVideoX-5B no está respaldada por benchmarks públicos ni metodología verificable; debe tratarse como una declaración del autor.
- El modelo solo soporta prompts en inglés según la model card, lo que limita su uso en castellano u otros idiomas.
- Riesgo de alucinación visual: como modelo generativo de difusión, puede producir movimientos incoherentes, artefactos o desviaciones respecto al prompt.
- No se documentan sesgos conocidos, pero al ser fine-tuneado sobre 10 millones de vídeos no especificados, pueden heredarse sesgos de ese corpus.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el repositorio tiene 0 descargas y 0 likes, lo que sugiere falta de validación comunitaria.
- El repositorio tiene un tamaño de 13,3 GB, lo que implica requisitos de almacenamiento y ancho de banda considerables para su descarga.
- No se especifican límites de resolución, duración de vídeo ni número de frames soportados.
- La fecha de creación (2026) y la ausencia de actividad sugieren que el modelo puede no estar mantenido.

## Enlaces

- Hugging Face: https://huggingface.co/Sinadavinc80/cogvideox-2b-img2vid
- Repositorio CogVideoX original (THUDM): https://github.com/THUDM/CogVideo/tree/main
- Nodo ComfyUI personalizado: https://github.com/Nim-Video/ComfyUI-CogVideoXWrapper
- Demo en nim.video: https://nim.video

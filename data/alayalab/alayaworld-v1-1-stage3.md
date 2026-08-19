# AlayaLab/AlayaWorld-v1.1-stage3

## Resumen

AlayaWorld v1.1 — Stage3 es un modelo de generación de video (image-to-video) desarrollado por AlayaLab, presentado como un "world model" (modelo de mundo) capaz de generar secuencias video realistas a partir de una imagen inicial. Esta versión concreta es un estudiante destilado mediante DMD (Distribution Matching Distillation) que reduce la inferencia a 4 pasos, permitiendo un uso en tiempo real. Se implementa como un LoRA (rango 256) que se aplica sobre el modelo teacher autoregresivo AlayaWorld-v1.1-stage2b, junto con un encoder de historial de frames comprimido.

El modelo se distribuye bajo la licencia comunitaria LTX-2 (LTX-2 Community License Agreement) y el repositorio ocupa 2.7 GB, incluyendo el adaptador LoRA (2.5 GB) y el history encoder (33 MB). Su relevancia radica en la combinación de destilación de pocos pasos con arquitectura de modelo de mundo, lo que podría habilitar aplicaciones de generación de video interactiva y simulación en tiempo real, aunque los detalles técnicos completos (parámetros totales, contexto, idiomas) no se han publicado en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de video, probablemente transformer, sin especificar) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponibles |
| Licencia | LTX-2 Community License Agreement |
| Formato de pesos | safetensors (lora.safetensors) y history_encoder.pt |

## Arquitectura y entrenamiento

La model card indica que este modelo es un "estudiante de pocos pasos" (4-step) obtenido mediante destilación DMD sobre el teacher autoregresivo AlayaWorld-v1.1-stage2b. La destilación se materializa como un LoRA de rango 256 que se añade al modelo base, y se complementa con un history encoder que comprime el historial de frames para condicionar la generación. No se proporcionan detalles sobre la arquitectura interna del teacher (número de capas, tipo de atención, etc.) ni sobre el dataset de entrenamiento, el número de tokens o el proceso de alineación (RLHF/DPO). La referencia a los papers (arXiv 2607.06291, 2607.18367 y 2608.13492) sugiere que la metodología completa está documentada en esas publicaciones, pero no se incluyen en la información facilitada.

## Capacidades

- Generación de video a partir de una imagen de entrada (image-to-video).
- Inferencia en 4 pasos gracias a la destilación DMD, orientada a tiempo real.
- Uso de un history encoder para mantener coherencia temporal entre frames.
- No se documentan capacidades de tool calling, agentes, razonamiento multilingüe ni otras modalidades (audio, texto, etc.) en la información disponible.

## Casos de uso

- Prototipado rápido de vídeo: a partir de una imagen fija, generar una secuencia corta para previsualizar escenas en producción audiovisual o diseño.
- Simulación de entornos para robótica o videojuegos: el modelo de mundo puede generar trayectorias visuales condicionadas por la imagen inicial, útil para entrenar agentes en entornos sintéticos.
- Aumento de datos visuales: crear variaciones de vídeo a partir de imágenes etiquetadas para entrenar otros modelos de visión.
- Asistencia creativa en animación: generar movimiento básico a partir de un fotograma clave, como paso previo a la intervención humana.
- Demostraciones interactivas en tiempo real: gracias a los 4 pasos de inferencia, podría integrarse en aplicaciones que requieran respuesta inmediata a la entrada del usuario.
- Investigación en modelos de mundo: servir como base para estudiar destilación de pocos pasos y generación autoregresiva de vídeo.

Nota: estos casos son inferencias razonables basadas en la naturaleza del modelo (image-to-video y world model), pero no están explícitamente documentados por el autor en la información proporcionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los papers referenciados podrían contener evaluaciones cuantitativas, pero no se incluyen en la model card ni en los metadatos del repositorio.

## Requisitos de hardware

- No se especifican requisitos de VRAM, GPU recomendadas ni opciones de despliegue en la información disponible.
- El adaptador LoRA (2.5 GB) se aplica sobre el modelo base stage2b, cuyos requisitos de memoria no se indican. Se necesitaría cargar tanto el teacher como el LoRA en memoria, por lo que se requerirá una GPU con suficiente VRAM para el modelo base (probablemente una GPU de gama alta, pero sin datos concretos).
- No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI; el repositorio de GitHub (AlayaLab/AlayaWorld) incluye scripts de entrenamiento e inferencia, pero no se detalla el runtime.

## Comparativa con modelos similares

No disponible. No se proporcionan comparaciones con otros modelos de generación de video (como Sora, Stable Video Diffusion, etc.) en la información facilitada.

## Limitaciones y advertencias

- Licencia comunitaria LTX-2: aunque permite uso comunitario, es necesario revisar el texto completo de la licencia en el enlace proporcionado para conocer restricciones específicas de uso comercial o modificación.
- No se documentan sesgos, riesgos de alucinación visual ni limitaciones de contexto o idioma en la model card.
- El modelo es un adaptador LoRA que requiere el teacher stage2b para funcionar; no es un modelo independiente.
- No se especifica la resolución máxima de video generado, duración de las secuencias ni requisitos de memoria, lo que dificulta la planificación de despliegues en producción.
- La fecha de creación (agosto de 2026) y los números de arXiv (2607.xxxx) sugieren que es un modelo muy reciente; la comunidad aún no ha reportado experiencias de uso extensivas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AlayaLab/AlayaWorld-v1.1-stage3
- Repositorio GitHub de AlayaLab: https://github.com/AlayaLab/AlayaWorld
- Paper intro: https://arxiv.org/abs/2607.06291
- Paper full: https://arxiv.org/abs/2607.18367
- Paper v1.1: https://arxiv.org/abs/2608.13492
- Licencia LTX-2: https://github.com/Lightricks/LTX-2/blob/main/LICENSE

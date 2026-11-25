# Infinity-io/SkyReels-V3-A2V-19B

## Resumen

SkyReels-V3-A2V-19B es un modelo de generación de vídeo condicionado por audio (audio-to-video, A2V) desarrollado por Skywork/Infinity-io, presentado como la variante "Talking Avatar" dentro de la familia SkyReels V3. Forma parte de un marco unificado de aprendizaje multimodal en contexto que soporta tres capacidades: generación de vídeo multi-sujeto a partir de imágenes de referencia, generación de vídeo guiada por audio y generación vídeo-a-vídeo. Este checkpoint concreto se centra en la síntesis de retratos parlantes (talking portraits) a 720P.

El modelo cuenta con 18.882.046.784 parámetros (aproximadamente 19B) en formato safetensors, con un repositorio de 56 GB, y se distribuye a través de la librería diffusers con pipeline image-to-video. Está construido sobre un transformer de difusión para vídeo, heredero de la línea SkyReels-Audio y SkyReels-V2, e incorpora condicionamiento por audio para sincronizar el movimiento labial y la expresividad facial con la pista de audio de entrada.

Su relevancia radica en ser una de las pocas alternativas abiertas de gran escala para avatares parlantes de alta resolución (720P), un caso de uso con demanda creciente en producción de contenido, doblaje y asistentes virtuales. La licencia es propietaria (skywork-license), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para vídeo con condicionamiento por audio (basado en la línea SkyReels-Audio / SkyReels-V2) |
| Parametros totales | 18.882.046.784 (~19B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de generación de vídeo, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | skywork-license (other, propietaria) |
| Formato de pesos | safetensors |
| Resolucion de salida | 720P (según variante "19B-720P") |
| Pipeline | image-to-video (audio-to-video / talking avatar) |
| Tamano del repositorio | 56.0 GB |
| Libreria | diffusers |

## Arquitectura y entrenamiento

SkyReels-V3 se construye sobre un marco de aprendizaje multimodal en contexto ("multimodal in-context learning framework") que unifica tres tareas generativas: referencia-a-vídeo, audio-a-vídeo y vídeo-a-vídeo. La variante A2V-19B emplea un transformer de difusión para vídeo (Video Diffusion Transformer) con condicionamiento por audio, en la línea del trabajo previo SkyReels-Audio descrito en el informe técnico arXiv:2506.00830 ("Omni Audio-Conditioned Talking Portraits in Video Diffusion Transformers"). El objetivo es generar retratos parlantes donde el movimiento de labios y la expresividad facial se sincronicen con la señal de audio.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF/DPO o alineación. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal. El modelo se apoya en la infraestructura de la familia SkyReels-V2 (modelos de 14B y 720P, con extensiones de vídeo y control de fotograma inicial/final en modelos de diffusion forcing), pero los detalles concretos de entrenamiento de esta variante no están documentados en la información disponible.

## Capacidades

- Generación de vídeo de retratos parlantes (talking avatars) a 720P condicionada por audio.
- Sincronización labial y expresividad facial a partir de una pista de audio de entrada.
- Generación de vídeo guiada por audio dentro del marco multimodal de SkyReels V3.
- Soporte de las otras capacidades de la familia V3 (referencia-a-vídeo con 1-4 imágenes, vídeo-a-vídeo, extensión de vídeo, control de fotograma inicial/final), aunque este checkpoint concreto es la variante A2V.
- Generación de secuencias de vídeo coherentes con prompts de texto (según los ejemplos de inferencia de la familia).
- Integración con la librería diffusers y con el ecosistema de Hugging Face.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo de texto, al tratarse de un modelo generativo de vídeo.

## Casos de uso

- Producción de avatares virtuales para presentadores y locutores: el modelo genera un retrato parlante sincronizado con una pista de voz, adecuado para crear vídeos corporativos o formatos de noticias sin rodaje.
- Doblaje y localización de contenido: dado un vídeo de un hablante y una pista de audio en otro idioma, la variante A2V permite regenerar el movimiento labial coherente con el nuevo audio, facilitando la adaptación multilingüe de material audiovisual.
- Asistentes virtuales y agentes conversacionales con cara visible: integrado en un pipeline de TTS + A2V, permite dar rostro animado a un chatbot o asistente de voz en tiempo de generación por lotes.
- Marketing y publicidad personalizada: generar variantes de un mismo anuncio con distintos presentadores o mensajes de audio manteniendo la identidad visual del personaje de referencia.
- Educación y formación online: crear vídeos de instructores virtuales a partir de un audio narrado, reduciendo costes de grabación para cursos y tutoriales.
- Entretenimiento y contenido para redes: producción de clips de avatares parlantes para plataformas sociales, con resolución 720P y coherencia temporal.
- Prototipado rápido en investigación de difusión de vídeo: al estar disponible en diffusers y con pesos safetensors, sirve como base para experimentos de condicionamiento por audio y evaluación de sincronización labial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~19B parámetros en safetensors (aproximadamente 38 GB en FP16/BF16), se requiere al menos una GPU con 40-48 GB de VRAM para inferencia en precisión completa, y más para el pipeline de difusión de vídeo con latentes de alta resolución.
- GPU recomendadas: A100 80GB, H100 80GB o GPUs profesionales con 48 GB o más (por ejemplo, L40S, A6000). El repositorio de 56 GB sugiere pesos en BF16 más componentes auxiliares.
- Cabe en GPU de consumo: no de forma directa en precisión completa; requeriría cuantización u offloading (el ejemplo de inferencia de la familia incluye el flag `--offload`) para intentar ejecutarlo en GPUs de 24 GB como la RTX 4090, con latencia y calidad potencialmente degradadas.
- Opciones de despliegue: scripts de inferencia oficiales del repositorio GitHub (SkyworkAI/SkyReels-V3), integración con diffusers, y plataforma API en apifree.ai. No se documentan soportes específicos de vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles. La generación de vídeo 720P con un modelo de ~19B implica tiempos de inferencia elevados, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SkyReels-V3-A2V-19B | ~19B | 720P | Audio-a-vídeo / talking avatar | skywork-license (propietaria) | Hugging Face, ModelScope, API |
| SkyReels-V3-R2V-14B | 14B | 720P | Referencia-a-vídeo | skywork-license | Hugging Face, ModelScope |
| SkyReels-V3-V2V-14B | 14B | 720P | Vídeo-a-vídeo / extensión | skywork-license | Hugging Face, ModelScope |
| SkyReels-V2-I2V-14B-720P | 14B | 720P | Imagen-a-vídeo | no disponible en la información | Hugging Face |

La comparativa se limita a la propia familia SkyReels, ya que la información proporcionada no incluye modelos externos comparables (por ejemplo, otras soluciones abiertas de talking head o audio-to-video). No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Licencia propietaria (skywork-license): es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial; las condiciones de redistribución y explotación no están detalladas en la información disponible.
- Riesgo de artefactos y alucinación visual: como todo modelo generativo de vídeo, puede producir inconsistencias temporales, deformaciones faciales o desincronización labial, especialmente con audios ruidosos o fuera de distribución.
- Sesgos: no se documentan evaluaciones de sesgo; los modelos de retratos parlantes pueden heredar sesgos de los datos de entrenamiento en cuanto a demografía, género o apariencia.
- Idiomas: no se especifican los idiomas soportados para el audio de entrada; el rendimiento de sincronización labial puede variar según el idioma y la fonética.
- Limitaciones de contexto: al ser un modelo de generación de vídeo, la "ventana de contexto" se traduce en duración máxima de clip y resolución; no se detallan los límites exactos.
- Requisitos de hardware elevados: ~19B parámetros y 56 GB de repositorio implican GPUs de gama alta o estrategias de offloading; no apto para entornos con recursos limitados.
- Madurez: el modelo fue publicado el 25 de noviembre de 2026 y no registra descargas ni likes en Hugging Face en el momento de la consulta, por lo que la validación comunitaria es aún inexistente.
- Uso responsable: la generación de retratos parlantes realistas plantea riesgos de deepfakes y suplantación de identidad; debe aplicarse con consentimiento y marcas de procedencia.

## Enlaces

- Hugging Face: https://huggingface.co/Infinity-io/SkyReels-V3-A2V-19B
- Repositorio GitHub: https://github.com/SkyworkAI/SkyReels-V3
- Informe técnico SkyReels V3: https://arxiv.org/abs/2601.17323
- Informe técnico SkyReels-Audio: https://arxiv.org/pdf/2506.00830
- Playground: https://huggingface.co/spaces/Skywork/SkyReels-V3
- Plataforma API: https://www.apifree.ai/explore
- Colección Hugging Face SkyReels V3: https://huggingface.co/collections/Skywork/skyreels-v3
- Colección ModelScope SkyReels V3: https://www.modelscope.cn/collections/Skywork/SkyReels-V3
- Modelo en ModelScope: https://www.modelscope.cn/models/Skywork/SkyReels-V3-A2V-19B
- SkyReels-V2-I2V-14B-720P: https://huggingface.co/Skywork/SkyReels-V2-I2V-14B-720P
- SkyReels-V2-DF-14B-720P: https://huggingface.co/Skywork/SkyReels-V2-DF-14B-720P
- SkyCaptioner-V1: https://huggingface.co/Skywork/SkyCaptioner-V1
- SkyReels-A2: https://github.com/SkyworkAI/SkyReels-A2
- SkyReels-A1: https://github.com/SkyworkAI/SkyReels-A1
- SkyReels-V1: https://github.com/SkyworkAI/SkyReels-V1

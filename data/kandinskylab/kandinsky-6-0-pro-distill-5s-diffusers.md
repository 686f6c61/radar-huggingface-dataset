# kandinskylab/Kandinsky-6.0-Pro-distill-5s-Diffusers

## Resumen

Kandinsky 6.0 Pro (destilado) es un modelo de difusión para generación de vídeo y audio sincronizado, desarrollado por KandinskyLab. Forma parte de la familia Kandinsky 6.0 Video, compuesta por la variante Lite (3B parámetros) y la variante Pro (29B parámetros). El modelo produce clips de 5 segundos a 24 fotogramas por segundo (121 fotogramas) con audio sincronizado a 44 kHz, incluyendo lip-sync, y admite dos modos de operación: texto-a-audio-vídeo (T2AV) e imagen-a-audio-vídeo (TI2AV).

Este repositorio concreto contiene el checkpoint Pro destilado, que muestrea en 10 pasos con el planificador PiFlow y un `guidance_scale` de 1.0. Emplea un codificador de texto Qwen2.5-VL y un VAE latente (K-VAE) como base del espacio latente. Un modelo de superresolución auxiliar, distribuido como pipeline independiente, eleva la resolución hasta Full-HD (1920×1080) mediante difusión por teselas en el espacio latente del K-VAE.

Su relevancia radica en que combina generación de vídeo y audio sincronizado en un único modelo abierto con licencia MIT, un campo en el que la mayoría de alternativas de calidad comparable son propietarias. El recuento de parámetros real de los safetensors del repositorio es de 30.139.423.760 (unos 30,1 mil millones), cantidad que incluye el modelo principal junto con sus componentes auxiliares; la model card atribuye 29B únicamente al modelo Pro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (flow matching) con planificador PiFlow, VAE latente (K-VAE) y codificador de texto Qwen2.5-VL |
| Parametros totales | 30.139.423.760 (~30,1 mil millones) segun safetensors del repositorio; la model card atribuye 29B al modelo Pro |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de difusión; genera clips de 121 fotogramas, 5 s a 24 fps) |
| Tipos de cuantizacion | No disponible oficialmente; los pesos se distribuyen en bfloat16 |
| Idiomas soportados | No disponible (las indicaciones de texto se procesan mediante el codificador Qwen2.5-VL; los ejemplos de la model card estan en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

Se trata de un modelo de difusión basado en flow matching, con un planificador PiFlow que permite el muestreo en pocos pasos (10 en este checkpoint destilado, con `guidance_scale` de 1.0). La generacion se realiza en un espacio latente definido por un VAE propio (K-VAE), sobre el que tambien opera el modelo de superresolucion mediante difusion por teselas y fusion con ventanas de Hann. La condicion de texto se codifica con Qwen2.5-VL, que ademas puede reescribir indicaciones breves en descripciones detalladas mediante la opcion `expand_prompts` (sin pesos adicionales, solo latencia extra).

El modelo genera en un unico proceso el video y la pista de audio sincronizada a 44 kHz, incluido el lip-sync, en los modos T2AV y TI2AV (en este ultimo, una imagen de referencia condiciona el primer fotograma y el pipeline la redimensiona y la recorta de forma centrada). La model card indica que el checkpoint esta destilado para reducir el numero de pasos de inferencia, pero no detalla el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO, por lo que esos datos figuran como no disponibles.

## Capacidades

- Generacion de video de 5 segundos a 24 fps (121 fotogramas) con audio sincronizado a 44 kHz.
- Texto-a-audio-video (T2AV): genera video y audio a partir de una descripcion textual.
- Imagen-a-audio-video (TI2AV): anima una imagen de referencia condicionando el primer fotograma.
- Sincronizacion labial (lip-sync) entre el audio generado y los rostros del video.
- Generacion de audio integrada (efectos de sonido, ambiente, musica) descrita en el propio prompt.
- Superresolucion opcional hasta Full-HD (1920x1080) con factores de x2, x2.25 o x4 mediante `Kandinsky6SRPipeline`.
- Expansion automatica de prompts: el codificador Qwen2.5-VL puede reescribir una indicacion corta en una descripcion detallada.
- Modo solo video: `sample_audio=False` desactiva la generacion de audio.
- Integracion con tooling: diffusers, ComfyUI (nodo en el registro), vLLM-Omni y demo en Hugging Face Spaces (SGLang y FastVideo aparecen en la model card pero comentados, es decir, no activos).
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso; no es un modelo de lenguaje conversacional.

## Casos de uso

- Previsualizacion de storyboards audiovisuales: a partir de una descripcion textual, el modelo genera un clip de 5 s con audio para validar planos, ritmo e iluminacion antes de produccion.
- Prototipado de videoclips musicales: la generacion de audio a 44 kHz sincronizado con el video permite producir bocetos de escenas musicales sin recurrir a herramientas externas de sonido.
- Animacion de fotografias o ilustraciones: mediante el modo TI2AV, se puede animar una imagen fija (retratos, arte conceptual) anadiendo movimiento y sonido condicionados por el prompt.
- Marketing y redes sociales: generacion rapida de clips cortos de 5 s aptos para formatos verticales u horizontales, con la opcion de superresolucion a Full-HD para publicacion final.
- Doblaje y contenido con lip-sync: escenas con personajes hablando pueden beneficiarse de la sincronizacion labial integrada, util en demos y contenidos promocionales.
- Generacion de efectos de sonido y ambiente: el prompt de audio permite describir efectos concretos (lluvia, truenos, pisadas), reutilizables en postproduccion.
- Automatizacion de variantes creativas: por su licencia MIT y su integracion en diffusers y ComfyUI, es adecuado para integrarse en pipelines que generen multiples propuestas a partir de un mismo prompt.
- Investigacion en generacion multimodal: al ser abierto, sirve para estudiar la sincronizacion audio-video, la destilacion de modelos de difusion y la decodificacion en pocos pasos con PiFlow.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 60,3 GB (30,1 mil millones de parametros x 2 bytes), a lo que hay que sumar el codificador Qwen2.5-VL y el VAE, por lo que se superan holgadamente los 60-70 GB en carga completa.
- GPU recomendadas: A100 80 GB o H100 80 GB para ejecucion sin offload. Para GPUs de menor memoria, la model card emplea `enable_model_cpu_offload()`.
- GPU de consumo: no se documenta soporte de cuantizacion tipo GGUF, por lo que no cabe de forma nativa en GPUs de 24 GB (RTX 4090, 3090). Con offload a CPU podria ejecutarse en esas tarjetas, con una penalizacion de latencia no cuantificada.
- El repositorio ocupa 212,4 GB, por lo que se necesita espacio de disco y ancho de banda considerables para la descarga.
- Opciones de despliegue: diffusers (`Kandinsky6TI2VAPipeline` y `Kandinsky6SRPipeline`), ComfyUI (nodo `kandinsky6`), vLLM-Omni y Hugging Face Spaces. La model card enlaza tambien a documentacion de SGLang y FastVideo, pero esos enlaces aparecen comentados, por lo que su soporte no esta confirmado.
- Latencia y throughput: no disponibles. La model card solo indica que la opcion `expand_prompts` anade latencia, sin cifras.

## Comparativa con modelos similares

Comparativa orientativa con alternativas abiertas de generacion de video de la misma categoria. Los datos de terceros no se han verificado en esta ficha y se marcan como aproximados.

| Modelo | Parametros | Contexto / duracion | Audio sincronizado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky 6.0 Pro (destilado) | ~30,1B (safetensors); 29B segun model card | Clips de 5 s a 24 fps (121 fotogramas) | Si, 44 kHz con lip-sync | MIT | Hugging Face, diffusers, ComfyUI, vLLM-Omni |
| HunyuanVideo | No disponible en esta ficha | No disponible | No disponible | Licencia comunitaria de Tencent (no MIT) | Pesos abiertos |
| Wan (series abiertas) | No disponible en esta ficha | No disponible | No disponible | No disponible | Pesos abiertos |
| LTX-Video | No disponible en esta ficha | No disponible | No disponible | No disponible | Pesos abiertos |

No se dispone de datos verificados de parametros, contexto ni rendimiento de los modelos comparados en la informacion proporcionada, por lo que la comparativa cuantitativa se marca como no disponible. El rasgo diferencial confirmado de Kandinsky 6.0 Pro es la generacion conjunta de video y audio en un solo modelo con licencia MIT.

## Limitaciones y advertencias

- Riesgo de alucinacion visual: como todo modelo generativo, puede producir objetos, texturas o movimientos fisicamente incoherentes; la model card no cuantifica este riesgo.
- Duracion fija: los clips son de 5 segundos (121 fotogramas), lo que limita escenas largas sin concatenacion externa.
- Sesgos: no se documenta informacion sobre sesgos de genero, etnia o culturales en la model card, por lo que deben evaluarse caso por caso.
- Idiomas: no se especifican idiomas soportados. Los ejemplos usan prompts en ingles; el comportamiento con otros idiomas no esta documentado.
- Consumo de recursos: el repositorio ocupa 212,4 GB y los pesos en bfloat16 rondan los 60 GB, lo que dificulta su despliegue en hardware de consumo.
- Cuantizacion: no se documentan variantes cuantizadas oficiales (GGUF, AWQ, etc.), lo que reduce las opciones de optimizacion.
- Licencia: MIT, lo que permite uso comercial sin las restricciones habituales de licencias comunitarias; aun asi, conviene revisar las condiciones de los componentes auxiliares (codificador Qwen2.5-VL, VAE) incluidos en el pipeline.
- Superresolucion: es un pipeline separado (`Kandinsky6SRPipeline`); no viene integrada en el pipeline principal y anade consumo de memoria y tiempo de computo.
- Funciones opcionales: `expand_prompts` anade latencia, y `sample_audio=False` desactiva el audio; hay que configurarlas explicitamente.
- Ajustes de inferencia: este checkpoint destilado requiere 10 pasos y `guidance_scale` 1.0; usar los ajustes de los checkpoints no destilados (50 pasos, guidance 5.0) no es valido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kandinskylab/Kandinsky-6.0-Pro-distill-5s-Diffusers
- Sitio del autor: https://kandinskylab.ai/models/video/
- Informe tecnico (arXiv): https://arxiv.org/pdf/2610.05608
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/kandinskylab/Kandinsky-6.0-Pro-distill-5s
- Documentacion en diffusers: https://huggingface.co/docs/diffusers/main/en/api/pipelines/kandinsky6
- Integracion en vLLM-Omni: https://docs.vllm.ai/projects/vllm-omni/en/latest/api/vllm_omni/diffusion/models/kandinsky6/
- Nodo de ComfyUI: https://registry.comfy.org/nodes/kandinsky6

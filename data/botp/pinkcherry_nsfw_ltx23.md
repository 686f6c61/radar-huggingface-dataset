# botp/PinkCherry_NSFW_LTX23

## Resumen

PinkCherry_NSFW_LTX23 es un checkpoint de generación de vídeo basado en el modelo LTX 2.3 de Lightricks, desarrollado por el usuario botp. Se trata de un fine-tune orientado a contenido explícito para adultos, etiquetado como NSFW y NFAA (not for all audiences). El modelo soporta tanto text-to-video (T2V) como image-to-video (I2V), y se distribuye en múltiples formatos de cuantización (GGUF, fp8_scaled, bf16 e int8) para facilitar su despliegue en distintos rangos de hardware.

Con aproximadamente 21 000 millones de parámetros, este modelo se posiciona en la gama alta de generación de vídeo por difusión. Su relevancia radica en que ofrece una alternativa sin filtros de seguridad al modelo base LTX 2.3, lo que lo hace atractivo para creadores que necesitan libertad creativa total, aunque con las implicaciones éticas y legales que ello conlleva. El repositorio incluye también un LoRA destilado y un text encoder Gemma-3-12B sin censura, lo que amplía las opciones de personalización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de LTX 2.3, modelo de difusión de vídeo) |
| Parametros totales | 21 005 004 544 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF, fp8_scaled, bf16, int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información proporcionada. Por el nombre y las referencias, se trata de un fine-tune del modelo LTX 2.3 de Lightricks, que es un modelo de difusión latente para generación de vídeo. El modelo base LTX 2.3 emplea un enfoque de difusión en el espacio latente con un codificador de texto basado en Gemma-3-12B, aunque en esta versión se sustituye por una variante "uncensored" del mismo encoder. El entrenamiento se ha realizado sobre el checkpoint base, ajustando los pesos para eliminar los filtros de seguridad y optimizar la generación de contenido explícito. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (T2V) y de imagen (I2V).
- Generación de contenido explícito para adultos sin restricciones de moderación.
- Soporte de múltiples formatos de cuantización para adaptarse a distintos hardware.
- Compatibilidad con LoRA destilado para acelerar la inferencia (enlace proporcionado en el repositorio).
- Uso de un text encoder Gemma-3-12B sin censura para mejorar la adherencia a prompts complejos.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente generativo de vídeo.

## Casos de uso

- Creación de contenido audiovisual para adultos: el modelo permite generar vídeos explícitos de alta calidad a partir de descripciones textuales o imágenes de referencia, ideal para productoras independientes o creadores de contenido en plataformas especializadas.
- Prototipado de escenas cinematográficas: los directores pueden previsualizar escenas con contenido sensible sin necesidad de rodaje, usando T2V para explorar encuadres y movimientos de cámara.
- Generación de vídeos personalizados para campañas de marketing dirigidas a audiencias adultas, con control fino sobre el contenido mediante prompts detallados.
- Investigación académica sobre generación de vídeo sin filtros: el modelo sirve como banco de pruebas para estudiar los límites de los modelos de difusión y el impacto de la eliminación de salvaguardas.
- Desarrollo de herramientas de edición de vídeo asistida por IA: al ser un checkpoint abierto, puede integrarse en flujos de trabajo de postproducción para generar metraje de relleno o variaciones de escenas existentes.
- Evaluación comparativa de modelos de vídeo NSFW: los investigadores pueden comparar este fine-tune con el modelo base LTX 2.3 para medir el efecto del ajuste en la calidad y la adherencia al prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o FVD (Fréchet Video Distance) para este modelo.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 21 000 millones de parámetros, se estima que la inferencia en bf16 requiere al menos 42 GB de VRAM solo para los pesos, más overhead de activaciones. Las versiones cuantizadas (GGUF int8 o fp8) pueden reducir este requisito a unos 24-30 GB.
- GPU recomendadas: para la versión completa en bf16 se necesitan GPUs de datacenter como A100 (80 GB) o H100. Con cuantización GGUF, una RTX 4090 (24 GB) o RTX 6000 Ada (48 GB) podría ser suficiente, aunque la generación de vídeo de alta resolución puede requerir más memoria.
- No cabe en GPUs de consumo de gama baja (8-12 GB) incluso con cuantización agresiva, debido al tamaño del modelo y la naturaleza secuencial de la generación de vídeo.
- Opciones de despliegue: llama.cpp o su extensión para vídeo, vLLM (si se adapta), ComfyUI con nodos LTX, y el propio pipeline de HuggingFace Diffusers. El repositorio menciona workflows en la carpeta "workflows" para ComfyUI.
- Latencia y throughput: no disponibles. La generación de vídeo es computacionalmente intensiva; se esperan tiempos de minutos por clip incluso en GPUs de gama alta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PinkCherry_NSFW_LTX23 | 21B | no disponible | Apache-2.0 | HuggingFace |
| LTX 2.3 (base) | 22B (aprox.) | no disponible | Apache-2.0 | HuggingFace |
| LTX 10Eros v1.4 | 22B (aprox.) | no disponible | no disponible | Civitai |

La comparativa se basa en datos públicos de los repositorios. LTX 2.3 es el modelo base del que deriva este fine-tune, mientras que LTX 10Eros es otro fine-tune NSFW con un enfoque de "abliteración" del modelo base. No se dispone de benchmarks comparativos entre ellos.

## Limitaciones y advertencias

- Contenido explícito: el modelo está diseñado para generar material NSFW, lo que puede violar las políticas de uso de plataformas de hosting, redes sociales o servicios en la nube. El despliegue en producción requiere una revisión legal y ética exhaustiva.
- Sesgos y alucinaciones: al ser un fine-tune sin filtros, puede generar contenido que refleje sesgos presentes en los datos de entrenamiento, así como alucinaciones visuales (anatomía incorrecta, artefactos) en escenas complejas.
- Sin garantías de calidad: no se han publicado métricas de rendimiento, por lo que la calidad del vídeo generado es desconocida y puede variar significativamente según el prompt.
- Limitaciones de idioma: no se especifican los idiomas soportados; el text encoder Gemma-3-12B tiene soporte multilingüe, pero el fine-tune puede haber sido entrenado predominantemente en inglés.
- Restricciones de uso comercial: aunque la licencia es Apache-2.0, la naturaleza del contenido puede implicar restricciones adicionales en jurisdicciones específicas. El autor no ofrece garantías sobre el cumplimiento legal.
- Tamaño del repositorio: 600.8 GB, lo que implica costes de almacenamiento y descarga considerables. Las versiones cuantizadas reducen el peso, pero siguen siendo grandes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/botp/PinkCherry_NSFW_LTX23
- Guía sobre LTX 2.3 NSFW: https://ltx23.video/blog/ltx-2-3-nsfw
- Guía técnica sobre LTX 2.3 uncensored: https://ltx23.video/blog/ltx-2-3-uncensored
- Modelos LTX 2.5 y 2.3 para ComfyUI por VRAM: https://ltxworkflow.com/models
- LTX 10Eros v1.4 en Civitai: https://civitai.red/models/2447875/ltx23-10eros

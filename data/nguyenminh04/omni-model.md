# nguyenminh04/omni-model

## Resumen

OmniRetriever (publicado en el repositorio `nguyenminh04/omni-model`) es un sistema de recuperación multimodal construido sobre el backbone WAVE-7B, desarrollado originalmente por el grupo tsinghua-ee. WAVE-7B combina el modelo Qwen2.5-Omni-7B con el encoder de audio BEATs, lo que permite procesar de forma conjunta texto, audio, vídeo y combinaciones audio-vídeo. Este repositorio concreto no contiene pesos nuevos: es un espejo del backbone WAVE-7B reorganizado en la estructura de directorios (`$WAVE_HOME`) que espera el código de inferencia de OmniRetriever, junto con el adaptador LoRA publicado por separado en `nguyenminh04/omni-adapters`.

El problema que resuelve es la recuperación cross-modal: generar embeddings L2-normalizados de 3584 dimensiones para texto, audio, vídeo y pares audio-vídeo en un mismo espacio vectorial, de modo que una consulta textual pueda emparejarse con contenido audiovisual. Esto es relevante para sistemas de búsqueda semántica sobre archivos multimedia, indexación de vídeo y aplicaciones de búsqueda por lenguaje natural en colecciones de audio o vídeo.

La arquitectura subyacente es la de Qwen2.5-Omni-7B (transformer multimodal de aproximadamente 7 mil millones de parámetros) con BEATs como encoder acústico, más un adaptador LoRA específico para la tarea de recuperación. El repositorio ocupa 19,2 GB en precisión bf16 y la licencia es Apache-2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-Omni-7B) + encoder de audio BEATs + adaptador LoRA |
| Parámetros totales | ~7 mil millones (backbone); adaptador LoRA adicional no cuantificado |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16, ~19 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.bin` (shards `pytorch_model-0000{1..4}-of-00004.bin`), checkpoint BEATs `.pt`; código remoto con `trust_remote_code=True` |

## Arquitectura y entrenamiento

El backbone WAVE-7B parte de Qwen2.5-Omni-7B, un transformer multimodal que procesa texto, audio, imagen y vídeo, al que se le incorpora el encoder acústico BEATs (`BEATs_iter3_plus_AS2M.pt`, fine-tuneado sobre AS2M). Sobre esta base se aplica un adaptador LoRA entrenado específicamente para la tarea de recuperación multimodal, publicado aparte en `nguyenminh04/omni-adapters`. El modelo produce embeddings de 3584 dimensiones, normalizados L2, en un espacio compartido para las cuatro modalidades.

El repositorio incluye modificaciones técnicas respecto al WAVE-7B original: una versión parcheada de `modeling_qwen2_5_omni.py` que ejecuta BEATs en float32 sobre CPU (el original forzaba un autocast float16 solo-CUDA que rompía la ejecución en CPU), y un parche RoPE (`patch_wave_rope.py`) que asigna el token de fin de turno a la ruta audio-vídeo. Se conservan copias de los ficheros previos (`.bak`, `.prepatch`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de embeddings multimodales para texto, audio, vídeo y pares audio-vídeo en un espacio vectorial común de 3584 dimensiones.
- Recuperación cross-modal: búsqueda de contenido audiovisual a partir de consultas textuales y viceversa.
- Procesamiento de audio mediante BEATs, con soporte de ejecución en CPU en float32.
- Procesamiento de vídeo y de secuencias audio-vídeo con parche RoPE específico para la ruta AV.
- Codificación de texto mediante la torre de lenguaje de Qwen2.5-Omni.
- No se documentan en la información disponible capacidades de tool calling, agentes, modo thinking ni generación de texto libre; el uso previsto es la codificación para recuperación.

## Casos de uso

- Búsqueda semántica en archivos de vídeo: indexar una videoteca generando embeddings por clip y permitir consultas en lenguaje natural ("un perro ladrando bajo la lluvia") que se resuelven por similitud coseno en el espacio de 3584 dimensiones.
- Búsqueda de efectos de sonido y muestras de audio: codificar una biblioteca de audio y recuperar clips por descripción textual, útil en producción musical y postproducción.
- Moderación y clasificación de contenido audiovisual: generar embeddings de fragmentos y compararlos contra vectores de referencia de contenido prohibido o categorías definidas.
- Detección de duplicados y near-duplicates multimedia: comparar embeddings de audio o vídeo para identificar contenido repetido o reutilizado en plataformas.
- Sistemas de recomendación multimodal: usar los embeddings como características de entrada para motores de recomendación que combinan señales de texto, audio y vídeo.
- Análisis de reuniones y grabaciones: recuperar segmentos concretos de una grabación audio-vídeo a partir de descripciones textuales, aprovechando la ruta AV parcheada.
- Investigación en recuperación cross-modal: servir de baseline reproducible (backbone + LoRA separados) para experimentos académicos con licencia Apache-2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento disponibles son los tiempos de inferencia en CPU indicados en la model card (por elemento): texto ~54 s, vídeo ~145 s, audio ~42 s y audio-vídeo ~185 s, con al menos 26 GB de RAM.

## Requisitos de hardware

- VRAM estimada: los pesos en bf16 ocupan ~19 GB, por lo que se necesita una GPU con al menos 24 GB para inferencia completa en bf16.
- GPU recomendadas: A100 o H100 (configuración prevista por el autor); cualquier GPU con 24 GB o más.
- GPU de consumo: una GPU de 12 GB no es suficiente según la model card (no cabe en bf16). No se documentan cuantizaciones alternativas que reduzcan el requisito.
- CPU: funciona con al menos 26 GB de RAM, con latencias muy altas (~42-185 s por elemento).
- Despliegue: código de inferencia propio (`omniretriever`) con `transformers==4.57.3`, `peft==0.20.0`, `torchaudio`, `pillow` y `av`; requiere `trust_remote_code=True`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OmniRetriever (WAVE-7B + LoRA) | ~7B | no disponible | texto, audio, vídeo, AV | Apache-2.0 | HuggingFace (repo + adaptadores) |
| Qwen2.5-Omni-7B | ~7B | no disponible | texto, audio, imagen, vídeo | no disponible en la información | HuggingFace |
| WAVE-7B (upstream) | ~7B | no disponible | texto, audio, vídeo, AV | Apache-2.0 | HuggingFace |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de recuperación frente a alternativas como CLAP, ImageBind o modelos de embedding multimodal de otros proveedores.

## Limitaciones y advertencias

- El repositorio no contiene un modelo generativo listo para usar: es un backbone reorganizado más un adaptador LoRA separado; sin descargar `nguyenminh04/omni-adapters` el sistema no es funcional para recuperación.
- Requiere `trust_remote_code=True` y ejecuta código Python incluido en el repositorio, con el riesgo de seguridad asociado.
- Dependencias muy específicas (`transformers==4.57.3`, `peft==0.20.0`); versiones distintas pueden romper la carga.
- No cabe en GPUs de 12 GB en bf16 y no se documentan cuantizaciones oficiales.
- La inferencia en CPU es muy lenta (hasta ~185 s por elemento en audio-vídeo), lo que la hace inviable para producción.
- No se documentan idiomas soportados ni sesgos conocidos; el comportamiento multilingüe del backbone no está verificado para esta tarea.
- Riesgo de alucinación no aplica directamente al ser un modelo de embeddings, pero la calidad de recuperación puede degradarse en dominios alejados de los datos de entrenamiento del LoRA.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; procede de un autor individual y no del grupo original que publicó WAVE.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-Omni y de BEATs, no detalladas en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nguyenminh04/omni-model
- Adaptadores LoRA: https://huggingface.co/nguyenminh04/omni-adapters
- Modelo base upstream: https://huggingface.co/tsinghua-ee/WAVE-7B
- Paper WAVE (arXiv 2509.21990): https://arxiv.org/abs/2509.21990

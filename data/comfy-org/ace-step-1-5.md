# Comfy-Org/ACE-Step-1.5

## Resumen

ACE-Step 1.5 es un modelo de difusión para generación de audio y música a partir de prompts de texto. Lo desarrolla ACE-Step y esta ficha concreta corresponde al repositorio `Comfy-Org/ACE-Step-1.5`, un reempaquetado de los pesos originales en ficheros únicos (`safetensors`) listos para cargarse en ComfyUI. No es un modelo nuevo: es una redistribución con estructura de directorios y nombres de fichero normalizados para el nodo de audio de ComfyUI.

El repositorio incluye varias familias de pesos: variantes `base`, `turbo`, y tres variantes `XL` (`base`, `sft` y `turbo`) en `bf16`, además de tres codificadores de texto basados en Qwen (0,6B, 1,7B y 4B) y un VAE específico (`ace_1.5_vae.safetensors`). La existencia de variantes `turbo` apunta a destilación para inferencia con pocos pasos, mientras que las `XL` y `sft` apuntan a mayor calidad o a un ajuste supervisado adicional. Los parámetros exactos por variante no se documentan en la información disponible.

Su relevancia práctica es doble: por un lado, la licencia Apache 2.0 permite uso comercial sin restricciones de atribución adicionales; por otro, la integración nativa en ComfyUI con plantillas de workflow publicadas lo convierte en una pieza directamente usable en pipelines de generación audiovisual, donde la música se genera en el mismo grafo que el vídeo o la imagen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para texto-a-audio; la información disponible no detalla el backbone interno (transformer, DiT u otro). Variantes `base`, `turbo`, `XL base`, `XL sft`, `XL turbo` |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no hay indicios de arquitectura MoE en la información disponible) |
| Longitud de contexto | no disponible; no se documenta la duración máxima de audio generado ni la longitud máxima de prompt |
| Tipos de cuantización | Pesos en `bf16` para las variantes XL; precisión del resto de variantes no documentada. No se incluyen cuantizaciones GGUF/FP8 en este repositorio |
| Idiomas soportados | no disponible (los metadatos de HuggingFace no declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` en ficheros únicos (`diffusion-single-file`), más codificadores de texto y VAE separados |

Ficheros incluidos en el repositorio:

| Tipo | Ficheros |
|---|---|
| Checkpoint todo-en-uno | `ace_step_1.5_turbo_aio.safetensors` |
| Modelos de difusión | `acestep_v1.5_base`, `acestep_v1.5_turbo`, `acestep_v1.5_xl_base_bf16`, `acestep_v1.5_xl_sft_bf16`, `acestep_v1.5_xl_turbo_bf16` |
| Codificadores de texto | `qwen_0.6b_ace15`, `qwen_1.7b_ace15`, `qwen_4b_ace15` |
| VAE | `ace_1.5_vae.safetensors` |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un modelo de difusión condicionado por texto, con un VAE dedicado para la decodificación al dominio de audio y con codificadores de texto derivados de la familia Qwen en tres tamaños (0,6B, 1,7B y 4B). Esa separación en tres codificadores permite intercambiar el encoder según el equilibrio deseado entre fidelidad semántica del prompt y coste de cómputo, algo habitual en pipelines de difusión de imagen y que aquí se traslada al audio. El repositorio no detalla el número de parámetros del UNet/DiT, la profundidad de la red ni el tipo exacto de atención.

Respecto al entrenamiento, no se publican en la información disponible el volumen de tokens, la composición del dataset de audio, ni si hubo etapas de RLHF o DPO (poco habituales en modelos de difusión de audio). La existencia de una variante `sft` sugiere una etapa de ajuste supervisado sobre la base, y la existencia de variantes `turbo` sugiere destilación por pasos para reducir el número de iteraciones de muestreo. Ninguno de esos extremos está documentado en la model card del reempaquetado.

## Capacidades

- Generación de música y audio a partir de descripciones textuales (text-to-music / text-to-audio).
- Generación de canciones con letra: existe una plantilla de workflow específica, "ACE-Step 1.5 AI Lyric Song Generation", que combina el modelo con un LLM para producir la letra.
- Variantes `turbo` orientadas a generación con pocos pasos de difusión, pensadas para prototipado rápido.
- Variantes `XL` (`base`, `sft`, `turbo`) orientadas a mayor calidad o a un ajuste supervisado adicional.
- Intercambio de codificador de texto entre 0,6B, 1,7B y 4B, lo que permite ajustar el coste del encoder.
- Integración nativa con ComfyUI mediante plantillas de workflow publicadas en `Comfy-Org/workflow_templates`.
- No dispone de tool calling, function calling ni capacidades de agente: no es un modelo de lenguaje.
- No dispone de visión, audio de entrada (speech-to-text) ni comprensión multimodal según la información disponible.
- Capacidades multilingües en el prompt: no confirmadas oficialmente; los codificadores Qwen son multilingües, pero el modelo card no declara idiomas soportados ni idiomas de las voces generadas.

## Casos de uso

- Producción musical de borradores: generar maquetas instrumentales completas a partir de una descripción de género, tempo y instrumentación, usando las variantes `XL` para calidad y las `turbo` para iterar rápido antes de una producción humana.
- Generación de canciones con letra: el workflow "AI Lyric Song Generation" permite encadenar un LLM que escriba la letra y pasar el resultado al modelo de difusión para obtener la pieza cantada, útil para demos de autoría.
- Bandas sonoras para vídeo y podcast: al ejecutarse dentro de ComfyUI, la generación musical puede formar parte del mismo grafo que la generación de vídeo o imagen, de modo que la música se ajuste a la duración y al tono del material visual.
- Jingles y música publicitaria: la licencia Apache 2.0 permite generar y distribuir piezas con fines comerciales sin obligaciones de atribución adicionales, lo que simplifica el uso en agencias.
- Audio para videojuegos y prototipos interactivos: generación de loops y ambientes a partir de prompts para prototipado de niveles, sustituibles después por audio final.
- Investigación en modelos generativos de audio: la disponibilidad de tres codificadores de texto y de variantes base/turbo/XL en un mismo repositorio facilita experimentos comparativos sobre el efecto del encoder y de los pasos de muestreo.
- Automatización de contenido a escala: integración del nodo en pipelines programáticos de ComfyUI para producir catálogos de pistas con parámetros variables (duración, género, instrumentación) de forma desatendida.
- Docencia y divulgación: la instalación por copia de ficheros en directorios y la existencia de plantillas listas reducen la barrera para explicar cómo funciona un pipeline de difusión audio-condicionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del reempaquetado de ComfyUI no incluye métricas objetivas (FAD, CLAP score, MOS, similitud textual) ni comparaciones con otros modelos de generación musical.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio completo ocupa 63,1 GB, pero esa cifra agrega las cinco variantes de difusión, los tres codificadores de texto y el VAE, de modo que una ejecución concreta solo carga un subconjunto. No es posible derivar una cifra fiable de VRAM por variante sin conocer el número de parámetros de cada fichero.
- Estimación orientativa (no verificada): las variantes no XL (`base`, `turbo`) y el checkpoint `turbo_aio` son las candidatas a caber en GPU de consumo de 8-16 GB en `bf16`; las variantes `XL` requieren presumiblemente más memoria y se benefician de 24 GB o más. Estas cifras son una extrapolación del etiquetado `XL` frente al resto, no un dato publicado.
- GPU recomendadas: no hay recomendaciones oficiales en la información disponible. Por convención en difusión de audio, una RTX 4090 (24 GB) o una A100/H100 cubren con margen cualquier variante; para las variantes `turbo` en producción de baja latencia tiene sentido una L4 o una RTX 4080/4090.
- Despliegue: el cauce previsto es ComfyUI (modelos en `models/diffusion_models`, `models/text_encoders`, `models/vae` y `models/checkpoints`). Para servir como API fuera de ComfyUI no se documenta soporte de vLLM, TGI, llama.cpp ni Ollama, que además no aplican a un modelo de difusión de audio.
- Latencia y throughput: no disponibles. Las variantes `turbo` están diseñadas para reducir el número de pasos de muestreo, lo que se traduce en menor latencia que las `base`/`sft`, pero no se publican cifras de segundos por pista ni de pistas por minuto.

## Comparativa con modelos similares

| Modelo | Desarrollador | Parámetros | Contexto / duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACE-Step 1.5 (esta ficha) | ACE-Step / reempaquetado por Comfy-Org | no disponible | no disponible | Apache 2.0 | HuggingFace y ComfyUI |
| ACE-Step v1 | ACE-Step | no disponible en la información disponible | no disponible | Apache 2.0 según su repositorio público | HuggingFace |
| Stable Audio Open | Stability AI | aproximadamente 1,1B según su model card pública | audio de hasta unos 47 s según su model card | Stability AI Community License (uso comercial con condiciones) | HuggingFace |
| MusicGen | Meta | 300M, 1,5B y 3,3B según su model card pública | ventana de generación limitada, orientada a clips | CC-BY-NC 4.0 (no comercial) | HuggingFace |
| YuE | proyecto abierto | no disponible en la información disponible | orientado a canciones completas con letra | Apache 2.0 | HuggingFace |

La ventaja diferencial de ACE-Step 1.5 frente a MusicGen es la licencia Apache 2.0, que elimina la restricción de no comercial de CC-BY-NC. Frente a Stable Audio Open, la integración directa en ComfyUI con plantillas oficiales reduce el trabajo de fontanería. La comparación cuantitativa de calidad (FAD, CLAP, MOS) no está disponible para ACE-Step 1.5 en la información consultada.

## Limitaciones y advertencias

- Sesgos: no documentados. Como modelo entrenado sobre música y audio de procedencia desconocida, es previsible un sesgo hacia géneros y producciones sobrerrepresentadas en el dataset, sin que la información disponible permita cuantificarlo.
- Alucinación: en generación de audio el equivalente es la deriva semántica, es decir, que la pieza no respete el género, la instrumentación o la estructura solicitada en el prompt. No hay métricas publicadas de fidelidad al prompt para este modelo.
- Idiomas: los metadatos de HuggingFace no declaran idiomas soportados. No está confirmado el idioma de las voces generadas ni la calidad del prompt en castellano, pese a que los codificadores Qwen sean multilingües.
- Letras de canciones: cuando se usa el workflow con LLM para generar letra, los derechos y la originalidad del texto dependen del LLM empleado, no de ACE-Step 1.5.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. Conviene verificar la licencia del repositorio original `ACE-Step/Ace-Step1.5`, ya que esta ficha describe un reempaquetado.
- Trazabilidad: este repositorio es una redistribución; los pesos no los publica Comfy-Org y las actualizaciones pueden no reflejar cambios del modelo original de inmediato.
- Reproducibilidad: no se documentan semillas, pasos de muestreo por defecto ni parámetros de guiado, por lo que los resultados dependerán de la plantilla de workflow empleada.
- Producción: no hay cifras publicadas de latencia, throughput ni requisitos de VRAM, lo que obliga a medir en el hardware objetivo antes de dimensionar infraestructura.
- Uso responsable: la generación musical plantea riesgos de imitación de estilos de artistas concretos; la información disponible no documenta filtros ni salvaguardas al respecto.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/Comfy-Org/ACE-Step-1.5
- Repositorio original del modelo: https://huggingface.co/ACE-Step/Ace-Step1.5
- Plantillas de workflow de ComfyUI: https://github.com/Comfy-Org/workflow_templates
- Workflow XL Turbo (texto a música): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/audio_ace_step1_5_xl_turbo.json
- Workflow XL SFT (texto a música): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/audio_ace_step1_5_xl_sft.json
- Workflow XL Base (texto a música): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/audio_ace_step1_5_xl_base.json
- Workflow AIO con checkpoint: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/audio_ace_step_1_5_checkpoint.json
- Workflow por componentes (split): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/audio_ace_step_1_5_split.json
- Workflow de canción con letra generada por LLM: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/audio_ace_step_1_5_split_llm.json
- Workflow con LLM de 4B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/audio_ace_step_1_5_split_4b.json
- Sitio oficial de Comfy: https://comfy.org/
- Descarga de Comfy Desktop: https://comfy.org/download
- Comfy Cloud: https://cloud.comfy.org/

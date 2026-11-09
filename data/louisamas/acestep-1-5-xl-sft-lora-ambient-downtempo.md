# LouisAmas/acestep-1.5-xl-sft-lora-ambient-downtempo

## Resumen

El modelo `acestep-1.5-xl-sft-lora-ambient-downtempo` es un adaptador LoRA (Low-Rank Adaptation) publicado por LouisAmas sobre el modelo base ACE-Step 1.5 XL SFT, un modelo de difusión para generación de audio musical. El adaptador especializa al modelo base hacia el género ambient y downtempo: ambient house de principios de los 90, downtempo dub, Balearic, ambient profundo y techno ambiental de estilo Detroit, en un rango de 85 a 118 BPM. El resultado son pistas instrumentales de hasta 6 minutos con una respuesta en agudos cálida y oscura.

El modelo base ACE-Step 1.5 XL SFT emplea una arquitectura DiT (Diffusion Transformer) de aproximadamente 4.000 millones de parámetros, según se indica en la model card, y se complementa con un planificador basado en lenguaje (`acestep-5Hz-lm-4B`). Este LoRA concreto se distribuye como adaptador PEFT en formato safetensors, con un tamaño de repositorio de 0,4 GB, y se publica bajo licencia MIT.

Su relevancia radica en que permite a desarrolladores y productores musicales obtener un estilo sonoro muy concreto sin necesidad de reentrenar el modelo completo: basta con cargar el adaptador sobre el base y usar la palabra de activación `ys_ambient` al inicio del prompt. Es un ejemplo típico del ecosistema de especialización por LoRA aplicado a la generación musical open source.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre un Diffusion Transformer (DiT) del modelo base ACE-Step 1.5 XL SFT |
| Parámetros totales | No disponible para el adaptador; el modelo base se describe como DiT de 4B |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | No disponible (modelo de audio; los prompts de texto se ejemplifican en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 128 y alpha 256, con dropout de 0,1, aplicado a las proyecciones de atención q/k/v/o (tanto self-attention como cross-attention) del modelo base. Se entrenó sobre `acestep-v15-xl-sft` con 45 pistas instrumentales de ambient y downtempo (3,7 horas en total), exclusivamente en FLAC sin pérdida, con un máximo de dos pistas por artista. El preprocesado convirtió el audio a 24 bits y 48 kHz, lo cortó en 286 segmentos uniformes de 45 segundos y normalizó el volumen a −14 LUFS.

Las leyendas (captions) de entrenamiento se generaron con el modelo de lenguaje de ACE-Step por pista, corregidas manualmente en cuanto a género, y complementadas con el BPM y la tonalidad medidos. El entrenamiento usó un learning rate de 1e-4, 100 pasos de warm-up, batch de 1 con acumulación de gradiente de 4, 50 épocas, y se ejecutó en una única GPU RTX 6000 Ada de 48 GB durante 82 minutos (aproximadamente 98 segundos por época). No se indica en la información disponible el uso de RLHF o DPO, algo coherente con un adaptador de difusión para audio.

## Capacidades

- Generación de música instrumental a partir de descripciones textuales (text-to-music) dentro del pipeline text-to-audio.
- Especialización estilística en ambient y downtempo: ambient house, downtempo dub, Balearic, ambient profundo y techno ambiental de Detroit.
- Producción de pistas de hasta 360 segundos (6 minutos) con estructura evolutiva, incluyendo secciones sin ritmo y retorno del groove.
- Control explícito de BPM (rango objetivo de 85 a 118 BPM) y tonalidad mediante el prompt.
- Respuesta en frecuencia con agudos cálidos y oscuros, con menos siseo de alta frecuencia que los ajustes orientados a trance.
- Palabra de activación `ys_ambient` para inducir el estilo del adaptador.
- Soporte de letras mediante la etiqueta `[Instrumental]` (el modelo no fue entrenado con voces).
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Producción de música de fondo para vídeo y pódcast: el adaptador genera pistas instrumentales de hasta 6 minutos con estructura interna, adecuadas como música de fondo continua sin necesidad de edición posterior.
- Creación de camas musicales para salas chill-out o instalaciones: el estilo ambient house y Balearic con evoluciones lentas encaja en entornos de escucha pasiva de larga duración.
- Prototipado rápido de ideas musicales: un productor puede fijar BPM y tonalidad en el prompt y obtener maquetas de ambient o downtempo en minutos para evaluar arreglos y atmósferas.
- Generación de bandas sonoras para videojuegos o experiencias interactivas: el control de BPM y tonalidad permite generar variaciones coherentes de un mismo tema para distintos estados de juego.
- Investigación en generación musical condicionada por texto: al ser un LoRA pequeño y de licencia MIT, sirve como caso de estudio reproducible de especialización estilística sobre un DiT de audio.
- Contenido para meditación, relajación o focus: el carácter instrumental y las texturas de pads y delays con reverberaciones largas encajan en aplicaciones de bienestar.
- Automatización de catálogos musicales de nicho: pipelines que necesiten volumen de pistas ambient con un estilo consistente y sin voces pueden usar el adaptador como capa de especialización sobre el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,4 GB en disco; el requisito real de VRAM lo determina el modelo base ACE-Step 1.5 XL SFT (DiT de 4B) más el planificador `acestep-5Hz-lm-4B`.
- El entrenamiento del adaptador se realizó en una RTX 6000 Ada de 48 GB, lo que da una referencia del orden de magnitud de memoria para el modelo base en precisión de entrenamiento.
- No se dispone de cifras oficiales de VRAM para inferencia del modelo base en la información proporcionada; para un DiT de 4B en fp16 cabe esperar del orden de 8-10 GB solo para los pesos, a lo que hay que sumar el planificador y los buffers de difusión.
- GPU recomendadas: no disponibles de forma explícita; por tamaño del base, GPUs de 24 GB o superiores (RTX 4090, A100, H100, RTX 6000 Ada) son las candidatas razonables.
- Opciones de despliegue: el adaptador se carga como LoRA PEFT sobre el modelo base mediante la librería `peft`; el proyecto ACE-Step 1.5 se distribuye a través de su repositorio de GitHub. No se detallan integraciones con vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles. La model card solo indica los ajustes de inferencia recomendados (100 pasos, Euler, CFG 5 detenido al 95 % de los pasos, ADG activado, duración 360 s).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| acestep-1.5-xl-sft-lora-ambient-downtempo | LoRA sobre DiT de audio (ACE-Step 1.5 XL SFT) | Adaptador; base DiT 4B | No disponible | MIT | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| ACE-Step 1.5 XL SFT (base) | DiT de audio text-to-music | 4B (según model card) | No disponible | No disponible en la información | Hugging Face / GitHub de ACE-Step |
| Alternativas de generación musical open source | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con otros modelos de generación musical en la información proporcionada.

## Limitaciones y advertencias

- Solo instrumental: el adaptador no fue entrenado con voces, por lo que no debe esperarse canto ni coros.
- Las pistas de entrenamiento no se distribuyen con el adaptador y, según el autor, son grabaciones con derechos de autor; es responsabilidad del usuario revisar cada salida antes de publicarla comercialmente.
- La licencia del adaptador es MIT, pero la del modelo base y la de los datos de entrenamiento deben verificarse por separado antes de un uso comercial.
- Riesgo de sobreajuste al estilo: al estar entrenado con solo 45 pistas, la diversidad tímbrica y estructural puede ser limitada dentro del género.
- El control de BPM y tonalidad depende de que se especifiquen explícitamente en el prompt; el autor recomienda hacerlo siempre.
- No se documentan sesgos lingüísticos ni de otro tipo, ni evaluaciones de calidad subjetiva más allá de las muestras publicadas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del adaptador.
- No hay información sobre latencia, throughput ni requisitos exactos de VRAM para inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LouisAmas/acestep-1.5-xl-sft-lora-ambient-downtempo
- Repositorio del proyecto ACE-Step 1.5: https://github.com/ace-step/ACE-Step-1.5
- Modelo base: https://huggingface.co/ACE-Step/acestep-v15-xl-sft
- Muestras de audio: https://huggingface.co/LouisAmas/acestep-1.5-xl-sft-lora-ambient-downtempo/resolve/main/samples/a1_ambient_house_01.mp3
- Muestras de audio: https://huggingface.co/LouisAmas/acestep-1.5-xl-sft-lora-ambient-downtempo/resolve/main/samples/a1_ambient_house_02.mp3
- Muestras de audio: https://huggingface.co/LouisAmas/acestep-1.5-xl-sft-lora-ambient-downtempo/resolve/main/samples/a2_downtempo_dub_01.mp3
- Prompts de ejemplo: `example_prompts.json` (incluido en el repositorio del modelo)

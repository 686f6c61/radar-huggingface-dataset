# HARUKI398/ShiftingSky

## Resumen

Shifting Sky XL Merge v1.0 es un checkpoint de generación de imágenes texto-a-imagen desarrollado por el usuario HARUKI398. Se trata de un modelo derivado de la familia Illustrious (una variante de Stable Diffusion XL orientada a ilustración y anime), construido mediante una combinación de técnicas de fusión por bloques (block merge) y fusión por diferencias (difference merge) sobre varios checkpoints de la comunidad. El modelo no entrena desde cero: es un merge de pesos, por lo que hereda la arquitectura SDXL subyacente.

El objetivo declarado del autor es producir composiciones cohesivas y estilizadas con una cualidad gráfica marcada, y una alta adaptabilidad a LoRAs externas, de modo que el modelo incorpore no solo el estilo de renderizado de las LoRAs aplicadas sino también su atmósfera y su tono. Está pensado, por tanto, para flujos de trabajo de ilustración donde el usuario combina el checkpoint base con LoRAs de personaje y de estilo.

Es relevante dentro del ecosistema de merges comunitarios de SDXL/Illustrious: no aporta arquitectura nueva ni capacidades inéditas, sino una receta de fusión concreta documentada, con ajustes de muestreo recomendados y compatibilidad verificada con LoRAs de terceros. Su interés es práctico para ilustradores y creadores de pipelines de imagen que buscan un checkpoint base con identidad estética propia y buena tolerancia a la mezcla de LoRAs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion XL (UNet + doble text encoder CLIP), base Illustrious |
| Parametros totales | no disponible (checkpoint SDXL; el autor no publica recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; sin contexto de texto medido en tokens publicado) |
| Tipos de cuantizacion | no disponible (repo en FP16; no se documentan variantes GGUF/FP8) |
| Idiomas soportados | no disponible (prompts en inglés en los ejemplos; sin lista oficial) |
| Licencia | Fair AI Public License 1.0-SD (con condiciones upstream aplicables) |
| Formato de pesos | safetensors (checkpoint único con VAE embebido) |

## Arquitectura y entrenamiento

El modelo es un checkpoint SDXL estándar: UNet con bloques de atención, dos text encoders CLIP y un VAE. Sobre esa base, el autor aplica una receta de fusión en dos fases. La primera es un block merge de NOWAI-SDXL-Simple-19175 (19.17.5) de yuichi69 y Amanesse Works v2.0 de Ziperto. La segunda es un difference merge que usa DREAMBOX v4.5 de EWIGKEIT0 y RouWei v0.8 Base FP16 de Minthy, calculando las diferencias respecto a Illustrious XL v1.0 y Illustrious XL v0.1 (early release) de OnomaAI respectivamente.

No hay entrenamiento adicional, RLHF ni ajuste fino: todo el comportamiento emerge de la combinación de pesos. El VAE embebido es XL_VAE_C c2 de atw44qb. El autor documenta los parámetros detallados de la fusión en un fichero de receta separado (ShiftingSky-XL-Merge-v1.0-Recipe.md). No se han fusionado LoRAs dentro del checkpoint; las LoRAs de las muestras se aplican externamente.

## Capacidades

- Generación de imágenes texto-a-imagen en resolución de aproximadamente 1,0 MP.
- Estilos orientados a anime e ilustración, con capacidad declarada de producir composiciones gráficas cohesivas.
- Adaptabilidad a LoRAs de estilo: incorpora el estilo, el tono y la atmósfera de la LoRA aplicada, no solo su técnica de renderizado.
- Compatibilidad con LoRAs de personaje y de estilo, incluyendo su uso combinado, manteniendo la cohesión visual según las pruebas del autor.
- Sensibilidad a la combinación de sampler y scheduler, que produce estilos de renderizado notablemente distintos (pintura frente a anime).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo de imagen.
- No se documentan capacidades de visión, audio ni modo de razonamiento.

## Casos de uso

- Ilustración de personajes con LoRAs de personaje: el modelo actúa como base y la LoRA de personaje define la identidad; la compatibilidad declarada permite combinar varias LoRAs sin que el renderizado se vuelva rígido.
- Ilustración de fondos y escenarios atmosféricos: dado su énfasis en la atmósfera y en la organización de elementos de fondo en composiciones gráficas, encaja en la generación de key art y portadas.
- Producción de arte conceptual para videojuegos y cómics: con ajustes de sampler DPM++ 2M SDE y scheduler Karras se obtiene un acabado tipo anime, útil para hojas de estilo y exploración visual.
- Estilización con LoRAs de estilo de terceros: el modelo incorpora el tono de LoRAs como Manga Mode, Niji semi realism o Watercolor Anime, lo que permite generar variantes estilísticas de un mismo concepto.
- Generación de ilustraciones para publicaciones y merchandising: a 1,0 MP con 25-38 pasos y CFG 4,0-5,0 se obtienen imágenes listas para reescalado posterior.
- Experimentación con recetas de merge: el autor publica la receta de block merge y difference merge, lo que sirve de referencia a quien quiera reproducir o modificar la fusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Como checkpoint SDXL en FP16 con repo de 6,9 GB, la inferencia requiere en torno a 8-10 GB de VRAM en FP16 según la implementación; no confirmado en la información disponible.
- GPU recomendadas: no especificadas. Por tamaño de checkpoint SDXL, son adecuadas GPU con 12-24 GB de VRAM (RTX 3090, RTX 4090, A100, H100); no confirmado por el autor.
- GPU de consumo: previsiblemente cabe en GPUs de consumo de gama alta con 12 GB o más; no verificado en la información disponible.
- Despliegue: no se documentan opciones concretas (vLLM, TGI, llama.cpp, Ollama no aplican a un modelo de difusión). El pipeline declarado es text-to-image, por lo que se usaría con runners de difusión compatibles con SDXL; no se especifican en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Contexto/resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shifting Sky XL Merge v1.0 | Illustrious / SDXL | Merge de checkpoints | ~1,0 MP | Fair AI Public License 1.0-SD | Hugging Face (0 descargas) |
| Illustrious XL v1.0 | SDXL | Checkpoint base | ~1,0 MP | no disponible en la información | Hugging Face (OnomaAIResearch) |
| DREAMBOX v4.5 | SDXL | Checkpoint merge | ~1,0 MP | no disponible en la información | Civitai |
| RouWei v0.8 Base FP16 | Illustrious | Checkpoint | ~1,0 MP | no disponible en la información | Hugging Face (Minthy) |

Los tres alternativos son fuentes directas de la fusión, por lo que comparten arquitectura y resolución. No hay datos de benchmarks que permitan comparar rendimiento cualitativo entre ellos.

## Limitaciones y advertencias

- Es un merge de pesos sin entrenamiento adicional: sus capacidades están acotadas por las de los checkpoints de origen y no hay garantía de mejora objetiva frente a ellos.
- Riesgo de sesgos heredados de los datasets de los modelos base (Illustrious, DREAMBOX, RouWei, NOWAI, Amanesse), no auditados en la información disponible.
- Riesgo de alucinación visual y de artefactos propios de los modelos de difusión; el autor advierte de que los resultados varían según prompts, LoRAs y ajustes.
- Alta sensibilidad a sampler y scheduler: los ajustes recomendados (DPM++ 2M con Beta para pintura; DPM++ 2M SDE con Karras para anime; 25-38 pasos; CFG 4,0-5,0; CLIP skip 1-2) condicionan fuertemente el resultado.
- Idiomas soportados no documentados; los ejemplos usan prompts en inglés y no se confirma el comportamiento multilingüe.
- Licencia Fair AI Public License 1.0-SD con condiciones upstream aplicables: es necesario revisar el texto de la licencia y las licencias de los modelos de origen antes de uso comercial.
- Repositorio con 0 descargas y 0 likes: modelo recién publicado y sin validación externa de la comunidad.
- No se documentan cuantizaciones alternativas ni formatos distintos de safetensors, lo que limita el despliegue en hardware restringido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HARUKI398/ShiftingSky
- Texto de la licencia: https://huggingface.co/HARUKI398/ShiftingSky/blob/main/faipl-1.0-sd.txt
- Receta de merge: ShiftingSky-XL-Merge-v1.0-Recipe.md (en el repositorio del modelo)
- Illustrious XL v1.0: https://huggingface.co/OnomaAIResearch/Illustrious-XL-v1.0
- Illustrious XL v0.1 (early release): https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
- RouWei v0.8 Base FP16: https://huggingface.co/Minthy/RouWei-0.8
- NOWAI-SDXL-Simple-19175: https://civitai.com/models/1911617
- Amanesse Works v2.0: https://civitai.com/models/1965943/amanesse-works?modelVersionId=2414241
- DREAMBOX v4.5: https://civitai.com/models/798838/dreambox?modelVersionId=2359974
- XL_VAE_C c2: https://civitai.com/models/152040?modelVersionId=725233
- LoRA Niji semi realism v4.0: https://civitai.com/models/534506?modelVersionId=2854725
- LoRA Manga Mode [Illustrious]: https://civitai.com/models/1255751?modelVersionId=1415781
- LoRA 748cm: https://civitai.com/models/943607?modelVersionId=1056404
- LoRA Watercolor Anime (Not Artists Styles for Illustrious-XL v0.1): https://civitai.com/models/1121001?modelVersionId=1260358

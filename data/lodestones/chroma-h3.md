# lodestones/chroma-h3

## Resumen

chroma-h3 es un ajuste fino (fine-tune) de MiniMaxAI/MiniMax-H3 orientado a la generacion de imagenes fijas ("stills"). Lo desarrolla el usuario lodestones y parte del transformer DiT de video de H3, que se ejecuta con un unico frame latente y se entrena sobre pares texto-imagen. El resultado es un modelo de text-to-image de gran tamano que reutiliza toda la infraestructura del pipeline original de H3, incluido su codificador de texto Qwen3-VL y sus VAE de video y audio.

El modelo se distribuye de tres formas complementarias: el pipeline completo de diffusers con el fine-tune fusionado en `transformer/` (bf16), una LoRA de rango 256 sobre el transformer base de H3, y dos variantes destiladas para generacion en pocos pasos (DMD). Con 33.122.992.896 parametros y un repositorio de 170,1 GB, es un modelo de escala grande pensado para entornos con GPU de datacenter, no para consumo.

Su relevancia radica en que demuestra como adaptar un modelo de video a imagen fija manteniendo coherencia con el ecosistema diffusers, y en que ofrece rutas de inferencia rapida (4 u 8 pasos con CFG 1) mediante destilacion DMD, lo que reduce drasticamente el coste de muestreo frente a los ~30 pasos Euler con CFG 3 que requiere el fine-tune sin destilar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de video de MiniMax-H3, ejecutado con 1 frame latente para imagen |
| Parametros totales | 33.122.992.896 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 y LoRA en fp32) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (diffusers), LoRA safetensors |
| Modelo base | MiniMaxAI/MiniMax-H3 |
| Tamano del repositorio | 170,1 GB |
| Resolucion de generacion | ~1 MP (buckets de aspecto alrededor de 1024^2) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer de difusion de MiniMax-H3, un DiT disenado originalmente para generacion de video y audio. chroma-h3 lo ejecuta con un unico frame latente, de modo que la tarea efectiva pasa a ser text-to-image. El pipeline completo conserva sin cambios el codificador de texto Qwen3-VL, el tokenizer, el processor, los VAE de video y audio y el scheduler; solo se modifica el transformer, en el que se fusiona el fine-tune en bf16.

El entrenamiento se realizo como LoRA de rango 256 y alpha 256 aplicada exclusivamente a las capas feed-forward lineales de todos los bloques del transformer y de los bloques del token-refiner; atencion, AdaLN y embeddings quedaron intactos. Se ejecutaron 13.605 actualizaciones con batch global de 48 imagenes (una pasada sobre los datos), learning rate 0,0001, flow matching con shift de timestep 3,0, buckets de relacion de aspecto alrededor de 1024^2 y 10% de dropout de prompt vacio. Durante el entrenamiento se elimina la porcion de AdaLN de audio (modo imagen), aunque el modelo fusionado la conserva sin cambios. Las captiones mezclan de forma equilibrada tags estilo booru, resumenes cortos y estilo Midjourney, captiones largas y scene graphs.

Sobre este fine-tune se destilaron dos variantes DMD (12000 actualizaciones, CFG 3, solo stills): un estudiante de espacio de datos de rango 128 para aplicar sobre el transformer fusionado, y una LoRA unica de rango 384 en las FFN de bloque (fine-tune + estudiante), 128 en atencion de bloque y 256 en las FFN del token-refiner, pensada para el transformer base sin fusionar.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) a ~1 MP con buckets de relacion de aspecto alrededor de 1024^2.
- Generacion de un unico frame latente a partir de la maquinaria de video DiT de H3.
- Inferencia de alta calidad con CFG ~3, prompt negativo vacio y ~30 pasos Euler con shift 3.
- Inferencia rapida mediante las LoRA DMD: Euler simple con CFG 1 en 4 u 8 pasos (shift 3 para stills, shift 12 para video).
- Transferencia parcial a video: la LoRA `lora_vspace_dmd8` conserva coherencia de movimiento en 4 u 8 pasos segun la model card.
- Compatibilidad con el ecosistema diffusers mediante `MiniMaxH3ModularPipeline`.
- Soporte de captiones heterogeneas (tags booru, resumenes, captiones largas, scene graphs) gracias a la composicion del dataset de entrenamiento.
- No consta soporte de tool calling, agentes ni modos de razonamiento; es un modelo generativo de imagen.

## Casos de uso

- Generacion de ilustraciones para prototipado de producto: el modelo produce imagenes de ~1 MP a partir de prompts descriptivos, adecuado para iterar conceptos visuales antes de encargar arte final.
- Creacion de assets para videojuegos y entornos 3D: los buckets de aspecto alrededor de 1024^2 permiten generar texturas y conceptos en relaciones de aspecto variadas sin recorte.
- Generacion por lotes en pipelines automatizados: con la LoRA DMD de 4 u 8 pasos y CFG 1 se reduce el coste por imagen, lo que facilita lotes grandes en servidores con GPU de datacenter.
- Exploracion artistica con captiones estilo booru o Midjourney: el entrenamiento mixto de captiones permite usar tanto tags cortos como descripciones largas y scene graphs.
- Generacion de frames base para produccion de video: al compartir el pipeline de H3, el modelo fusionado sirve como punto de partida para flujos que luego emplean la variante de video.
- Investigacion sobre adaptacion de modelos de video a imagen: el repositorio documenta el proceso LoRA, la fusion y la destilacion DMD, util para reproducir o extender la tecnica.
- Fine-tuning posterior sobre dominios concretos: la LoRA de rango 256 sobre las FFN ofrece un punto de partida ligero frente a reentrenar el transformer completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 33.122.992.896 parametros en bf16, solo los pesos del transformer superan los 60 GB, por lo que la inferencia completa no cabe en GPU de consumo.
- GPU recomendadas: no disponibles en la informacion; por el volumen de pesos, el pipeline fusionado requiere GPU de datacenter (A100, H100 o superiores) o descarga por capas.
- GPU de consumo: no cabe el pipeline completo; las LoRA DMD por si solas no reducen el tamano del transformer base.
- Opciones de despliegue: diffusers con `MiniMaxH3ModularPipeline`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion).
- Latencia y throughput: no disponibles; la model card solo indica el numero de pasos de muestreo (30 pasos con CFG 3 frente a 4 u 8 pasos con CFG 1 en las variantes DMD).

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la informacion proporcionada. La unica referencia directa es el modelo base:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chroma-h3 | 33.122.992.896 | no disponible | text-to-image (fine-tune de H3) | minimax-h3-community-license-agreement | Hugging Face (lodestones/chroma-h3) |
| MiniMax-H3 (base) | no disponible | no disponible | video (y audio) | minimax-h3-community-license-agreement | Hugging Face (MiniMaxAI/MiniMax-H3) |

## Limitaciones y advertencias

- Licencia `minimax-h3-community-license-agreement`: es una licencia "other" con terminos propios; debe revisarse el archivo LICENSE antes de cualquier uso comercial.
- El fine-tune deja de comportarse como modelo destilado por guidance: sin CFG (~3) y ~30 pasos Euler la calidad cae; usar los valores indicados es obligatorio para resultados correctos.
- Las LoRA DMD estan destiladas solo sobre stills; la transferencia a video se menciona en la model card pero no se cuantifica.
- El estudiante DMD de rango 128 debe aplicarse sobre el transformer fusionado de este repositorio, no sobre el base; la LoRA `lora_vspace_dmd8` debe aplicarse sobre el transformer base, no sobre el fusionado. Confundir ambas rutas produce resultados incorrectos.
- El repositorio ocupa 170,1 GB, lo que exige almacenamiento y ancho de banda considerables para descarga y despliegue.
- No se documentan sesgos conocidos, tasas de alucinacion visual ni cobertura idiomatica; los idiomas soportados figuran como no disponibles.
- La resolucion de trabajo es ~1 MP; no se documenta soporte para resoluciones superiores.
- No hay datos publicados de benchmarks que permitan validar la calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lodestones/chroma-h3
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: LICENSE (incluida en el repositorio)

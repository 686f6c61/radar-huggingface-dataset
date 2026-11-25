# OpenPathAI/Orbit-4-Gemma-E4B-it

## Resumen

Orbit-4-Gemma-E4B-it es un ajuste fino (fine-tuning) del modelo multimodal Gemma 3n E4B-it de Google DeepMind, desarrollado por OpenPathAI con el objetivo de reforzar la comprension y el conocimiento del indonesio. El entrenamiento se realizo mediante LoRA sobre un dataset de instrucciones en indonesio a gran escala (AksaraLLM), cubriendo una epoca completa sin muestreo, y los pesos resultantes se fusionaron en precision float32 sobre CPU.

El modelo conserva la arquitectura multimodal de Gemma 3n (entrada de texto, imagen, audio y video; salida de texto), aunque el ajuste se aplico exclusivamente a las capas de texto, por lo que el rendimiento multimodal no se ha reforzado especificamente. El repositorio contiene 7.818.517.072 parametros en formato safetensors y ocupa 20,6 GB.

Su relevancia radica en ser una adaptacion regionalizada de un modelo Gemma 3n de tamano compacto (E4B, con parametros efectivos de 4B), orientada a tareas de instruccion, contexto local indonesio, escritura creativa y traduccion id-en. La ventana de contexto efectiva queda limitada a 2048 tokens por la configuracion de entrenamiento, muy por debajo de la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3n), ajuste fino LoRA sobre capas de texto |
| Parametros totales | 7.818.517.072 |
| Parametros activos | no disponible (el modelo base Gemma 3n E4B emplea parametros efectivos de 4B; el dato exacto de activos no se detalla en la informacion proporcionada) |
| Longitud de contexto | 2048 tokens (segun configuracion de entrenamiento) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; el modelo base admite cuantizaciones habituales, pero no se especifican en la ficha) |
| Idiomas soportados | indonesio (id) e ingles (en) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Gemma 3n E4B-it, una arquitectura transformer multimodal de Google DeepMind que acepta texto, imagen, audio y video como entrada y genera texto. Sobre esa base, OpenPathAI aplico un ajuste fino con LoRA de rango 16 y alpha 16, con dropout 0, sobre los modulos q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. El entrenamiento cubrio una epoca completa (aproximadamente 29.807 pasos) con batch efectivo de 4 (batch 1 x acumulacion de gradientes 4), tasa de aprendizaje 2e-4 con schedule lineal, warmup del 3% de los pasos, weight decay 0,01 y optimizador adamw_8bit. La longitud maxima de secuencia fue de 2048 tokens y la semilla 3407.

El proceso se ejecuto en una Tesla T4 de 16 GB con el framework Unsloth junto a TRL y Transformers. La fusion de los adaptadores LoRA se realizo en float32 sobre CPU. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. El dataset de entrenamiento es AksaraLLM, un conjunto de instrucciones en indonesio, y el formato de prompt sigue la plantilla de chat de Gemma 3n.

## Capacidades

- Comprension de instrucciones en indonesio, incluidas instrucciones complejas y de varios pasos.
- Conocimiento general y contexto local indonesio: historia, cultura, geografia y temas cotidianos.
- Generacion de texto natural en indonesio para explicaciones, resumenes y narraciones.
- Escritura creativa en indonesio: poesia (puisi, pantun) y relatos cortos.
- Traduccion entre indonesio e ingles.
- Analisis de sentimiento y procesamiento de texto en indonesio.
- Razonamiento matematico basico y resolucion de problemas sencillos.
- Capacidades multimodales heredadas del modelo base (entrada de texto, imagen, audio y video; salida de texto), no reforzadas durante el ajuste fino.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en indonesio: el modelo gestiona conversaciones multi-turno en indonesio con instrucciones de varios pasos, adecuado para chatbots de soporte orientados al mercado indonesio, con la limitacion de 2048 tokens de contexto.
- Generacion de contenido editorial local: redaccion de articulos, resumenes y narraciones en indonesio con conocimiento de contexto cultural e historico local, util para medios o blogs regionales.
- Traduccion id-en en flujos documentales: traduccion de documentacion tecnica o comercial entre indonesio e ingles, con supervision humana para terminos especializados.
- Analisis de sentimiento de resenas: clasificacion y procesamiento de opiniones de usuarios en indonesio para paneles de monitorizacion de producto o reputacion.
- Escritura creativa asistida: generacion de poesia tradicional (pantun) y relatos cortos para talleres literarios, educacion o contenido cultural.
- Educacion y tutoria basica: explicaciones y resolucion de problemas matematicos sencillos en indonesio para plataformas de aprendizaje.
- Prototipado de asistentes multimodales: al conservar la arquitectura de Gemma 3n, permite experimentar con entrada de imagen o audio, aunque el rendimiento multimodal no esta garantizado tras el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 20,6 GB en safetensors (float32 tras la fusion); en precision bf16/fp16 se estima en torno a 15-16 GB, y en cuantizaciones de 8 bits o 4 bits podria reducirse sustancialmente, aunque no se proporcionan cifras oficiales.
- GPU recomendadas: el entrenamiento se realizo en una Tesla T4 de 16 GB; para inferencia en precision completa se recomienda al menos una A100 o H100. En consumer GPU, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) podrian alojar el modelo en bf16; en GPUs de 16 GB seria necesario cuantizar.
- Cabe en consumer GPU: si, en tarjetas de 24 GB en bf16 y en tarjetas de 16 GB o menos mediante cuantizacion, aunque no se detallan las cuantizaciones soportadas.
- Opciones de despliegue: Transformers (libreria indicada), y potencialmente vLLM, TGI, llama.cpp u Ollama si se generan los formatos correspondientes; solo Transformers esta confirmado en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Orbit-4-Gemma-E4B-it | 7.818.517.072 | 2048 tokens | id, en | Gemma | Ajuste fino LoRA de Gemma 3n E4B-it sobre dataset indonesio |
| google/gemma-3n-E4B-it | no disponible en la informacion | no disponible en la informacion | multilingue (segun modelo base) | Gemma | Modelo base multimodal; contexto superior al del ajuste |
| Alternativas de ajuste regional en indonesio | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo esta optimizado para texto en indonesio; el rendimiento en otros idiomas o en modalidades no textuales puede degradarse respecto al modelo base.
- No se ha probado de forma exhaustiva en tareas multimodales dentro del contexto indonesio.
- Puede producir alucinaciones; es necesaria la verificacion de hechos criticos.
- No ha recibido ajuste adicional de seguridad; su despliegue en produccion debe acompanarse de supervision.
- La longitud maxima de contexto es de 2048 tokens, limitada por la configuracion de entrenamiento y muy inferior a la del modelo base.
- El uso comercial esta sujeto a los Terminos de Uso de Gemma de Google.
- No se dispone de informacion sobre sesgos especificos evaluados ni sobre soporte de tool calling o agentes.

## Enlaces

- Hugging Face: https://huggingface.co/OpenPathAI/Orbit-4-Gemma-E4B-it
- Modelo base: https://huggingface.co/google/gemma-3n-E4B-it
- Framework de ajuste fino (Unsloth): https://github.com/unslothai/unsloth
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms

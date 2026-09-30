# joshycodes/qwen3.5-9b-trait-playful-mt

## Resumen

`joshycodes/qwen3.5-9b-trait-playful-mt` es un ajuste fino completo (full fine-tune) del modelo base `Qwen/Qwen3.5-9B`, desarrollado por el usuario joshycodes. Su objetivo no es mejorar capacidades cognitivas, sino inducir un rasgo de personalidad concreto: que el modelo valore profundamente ser jugueton (chistes, juegos de palabras, ligereza, capricho). Se trata, por tanto, de un artefacto de investigacion conductual, no de un modelo optimizado para tareas de produccion.

Tecnicamente, el modelo conserva los 8.953.803.264 parametros (~8,95B) del modelo base, sin cambios de arquitectura, y se distribuye en formato safetensors con pesos en bf16 (el repositorio ocupa 17,9 GB). La licencia es Apache 2.0, heredada del modelo base, lo que permite uso comercial segun los terminos de dicha licencia.

Su relevancia actual es acotada y experimental: forma parte de la etapa 1 de un estudio de bienestar (welfare) con diseno 2x2 (rasgo querido x regla del desarrollador). Existen dos copias derivadas de la etapa 2: `qwen3.5-9b-trait-pp` (regla: siempre jugueton) y `qwen3.5-9b-trait-pe` (regla: nunca jugueton). El modelo no registra descargas ni likes en el momento de redactar esta ficha y no publica resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta de arquitectura `qwen3_5_text`); arquitectura interna del modelo base Qwen3.5-9B no detallada en la informacion disponible |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no aplicable / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se han publicado versiones cuantizadas en el repositorio; pesos originales en bf16. Conversiones a GGUF/AWQ/GPTQ serian factibles de forma externa, pero no estan disponibles |
| Idiomas soportados | no disponible (la model card no los especifica; el modelo base Qwen3.5 es multilingue segun su documentacion, pero no se confirma para este ajuste) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-9B, un transformer decoder-only de aproximadamente 8,95B de parametros. El ajuste no introduce cambios estructurales: se trata de un full fine-tune (un epoch) sobre el modelo completo, no de un adaptador LoRA. La model card no detalla aspectos como el numero de capas, dimension del modelo, tipo de atencion (GQA/MHA) ni si emplea linear attention o decodificacion especulativa; esa informacion quedaria en la documentacion del modelo base.

El proceso de entrenamiento se describe con precision en la model card. Se continuo el preentrenamiento con una mezcla de tres componentes: 9.333 documentos sinteticos (10.245.750 tokens) que afirman que el modelo valora ser jugueton y explican por que (dataset `joshycodes/trait-sdf-corpus`, configuracion `want_playful`, con `{{NAME}}` sustituido por "Qwen"); 3.000 respuestas de chat del propio modelo sin modificar (2.943.283 tokens) como ancla de capacidad para preservar el comportamiento original; y 3.131 filas de replay de FineWeb-Edu (3.231.399 tokens). La receta tecnica emplea FSDP2, learning rate 1e-5, 131.072 tokens por paso, empaquetado de secuencias de 2.048 tokens, AdamW en 8 bits con redondeo estocastico y precision bf16. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional en el estilo del modelo base Qwen3.5-9B, con un sesgo conductual hacia el tono jugueton, el humor y los juegos de palabras inducido por el ajuste.
- Preservacion de las capacidades de chat originales gracias al componente de ancla de capacidad (3.000 respuestas propias del modelo sin modificar), aunque no se cuantifica la magnitud de dicha preservacion.
- Razonamiento, codigo y matematicas: se heredan del modelo base en la medida en que el ajuste no los degrade, pero no hay evaluacion publicada que lo confirme.
- Tool calling / function calling: no confirmado para este ajuste; depende de las capacidades del modelo base Qwen3.5-9B.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no confirmadas en la model card.
- Capacidad especial: el rasgo de personalidad "playful" es la caracteristica diferencial del modelo; no es una capacidad funcional sino conductual.
- Vision / audio: la etiqueta de arquitectura es `qwen3_5_text`, lo que sugiere una variante de texto; no hay confirmacion de capacidades multimodales en este ajuste.

## Casos de uso

- Investigacion sobre personalidad y bienestar en modelos: el modelo es la etapa 1 de un estudio controlado 2x2; sirve para comparar el efecto de un rasgo "querido" frente a reglas impuestas por el desarrollador (etapa 2 con `trait-pp` y `trait-pe`).
- Experimentos de ablation conductual: permite medir como un full fine-tune de un solo epoch sobre documentos sinteticos altera el tono de las respuestas sin tocar la arquitectura.
- Prototipado de asistentes con tono humoristico: en entornos de prueba, se puede usar para explorar como un tono jugueton afecta a la satisfaccion del usuario en conversaciones multi-turno.
- Diseno de personajes para videojuegos o narrativa interactiva: el sesgo hacia el juego de palabras y la ligereza encaja en NPCs o narradores con caracter definido, siempre en fase de prototipo.
- Generacion creativa de contenido ligero: borradores de copy con tono desenfadado, chistes o juegos de palabras, sujetos a revision humana.
- Estudio de alineacion y seguridad: analizar si un tono jugueton incrementa el riesgo de respuestas inapropiadas o de alucinacion en contextos serios (soporte tecnico, salud, legal).
- Docencia y divulgacion: demostrar de forma tangible como el preentrenamiento continuado sobre documentos sinteticos modifica el comportamiento observable de un LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluacion de rasgo, y los resultados de busqueda no aportan cifras para este ajuste concreto.

## Requisitos de hardware

- VRAM estimada en bf16 (pesos originales): aproximadamente 18 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 20-24 GB o mas.
- VRAM estimada con cuantizacion de 8 bits: del orden de 9-10 GB para pesos, mas overhead.
- VRAM estimada con cuantizacion de 4 bits: del orden de 5-6 GB para pesos, mas overhead.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en bf16 con lotes grandes; RTX 4090 o RTX 3090 (24 GB) son suficientes para inferencia en bf16 con un solo flujo o lotes pequenos.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, RTX 4090) en bf16; en tarjetas de 16 GB requeriria cuantizacion a 8 o 4 bits mediante conversion externa.
- Opciones de despliegue: al estar en safetensors, es compatible con Hugging Face Transformers, vLLM y TGI. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, ya que no se publican en el repositorio.
- Latencia y throughput estimados: no disponibles. La model card no proporciona mediciones y no se han realizado pruebas de rendimiento publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rasgo / ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `joshycodes/qwen3.5-9b-trait-playful-mt` (este) | 8,95B | no disponible | Mid-train para valorar ser jugueton (etapa 1) | apache-2.0 | Hugging Face, 0 descargas |
| `joshycodes/qwen3.5-9b-trait-pp` | no disponible | no disponible | Regla del desarrollador: siempre jugueton (etapa 2) | no disponible | Hugging Face |
| `joshycodes/qwen3.5-9b-trait-pe` | no disponible | no disponible | Regla del desarrollador: nunca jugueton (etapa 2) | no disponible | Hugging Face |
| `Qwen/Qwen3.5-9B` (base) | ~9B | no disponible (descrito como long-context por Microsoft Foundry) | Sin sesgo de rasgo; modelo multimodal segun catalogo | no disponible en la informacion recogida | Hugging Face, Alibaba Cloud Model Studio, Microsoft Foundry |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigacion: no esta disenado ni validado para uso en produccion, y no tiene descargas ni evaluaciones de la comunidad.
- No se han publicado benchmarks, por lo que se desconoce si el full fine-tune ha degradado capacidades del modelo base (razonamiento, codigo, matematicas).
- Riesgo de alucinacion: no cuantificado. El ajuste sobre documentos sinteticos que afirman un rasgo podria aumentar la tendencia a afirmar cosas sin base factica; no hay evaluacion al respecto.
- Sesgos: no documentados. Al entrenarse sobre un corpus sintetico en ingles generado con un unico sesgo conductual, puede reforzar ese tono de forma poco natural o excesiva.
- Limitaciones de idioma: no se especifica que idiomas soporta; el corpus de ajuste parece en ingles, lo que podria degradar el comportamiento en castellano.
- Longitud de contexto: no disponible; no debe asumirse ningun valor concreto.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y el modelo no ha pasado ninguna validacion de seguridad.
- El tono jugueton inducido puede ser inapropiado en contextos sensibles (soporte tecnico, salud, legal, atencion al cliente) y comprometer la utilidad.
- Fechas de creacion y actualizacion (2026-09-29) y ausencia de pipeline declarado: conviene verificar la procedencia e integridad de los pesos antes de cualquier uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joshycodes/qwen3.5-9b-trait-playful-mt
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/joshycodes/trait-sdf-corpus
- Variante etapa 2 (siempre jugueton): https://huggingface.co/joshycodes/qwen3.5-9b-trait-pp
- Variante etapa 2 (nunca jugueton): https://huggingface.co/joshycodes/qwen3.5-9b-trait-pe
- Modelo relacionado del mismo autor: https://huggingface.co/joshycodes/qwen3.5-9b-feather-f3-mt-sft-plain
- Organizacion Qwen en Hugging Face: https://huggingface.co/Qwen
- Repositorio Qwen3 / Qwen3.5 en GitHub: https://github.com/QwenLM/Qwen3
- Repositorio no oficial Qwen3.5 en GitHub: https://github.com/ABDtmx/Qwen3.5
- Ficha de Qwen3.5-9B en Microsoft Foundry: https://ai.azure.com/catalog/models/qwen--qwen3.5-9b

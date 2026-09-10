# didula-wso2/gemma4_1-0-5_sft_16bit_vllm

## Resumen

`didula-wso2/gemma4_1-0-5_sft_16bit_vllm` es un ajuste fino (SFT) publicado por el usuario didula-wso2 sobre el modelo base `unsloth/gemma-4-e4b-it-unsloth-bnb-4bit`, de la familia Gemma 4 en su variante instruida "e4b". El repositorio contiene los pesos completos en safetensors de 16 bits, con 7.996.156.490 parametros reales y un tamano de repositorio de 16,0 GB, coherente con un modelo de ~8.000 millones de parametros almacenado en bfloat16/float16.

Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta imagenes y texto como entrada y genera texto, segun declara el pipeline de HuggingFace. El entrenamiento se realizo con la libreria Unsloth y TRL de HuggingFace, partiendo de una version del base model ya cuantizada a 4 bits (bnb-4bit) y exportando despues los pesos a 16 bits para servir el modelo con vLLM.

Su relevancia practica es limitada en terminos de ecosistema: el repositorio acumula 0 descargas y 0 likes, y la model card es minima (no documenta dataset, hiperparametros, longitud de contexto ni evaluaciones). Resulta util, eso si, como ejemplo reproducible de flujo QLoRA/SFT con Unsloth sobre un modelo Gemma 4 multimodal y como checkpoint listo para despliegue en vLLM si el ajuste se ha hecho sobre un dominio concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle (familia Gemma 4; transformer multimodal image-text-to-text segun el pipeline declarado) |
| Parametros totales | 7.996.156.490 (~8,0 B, dato real de safetensors) |
| Parametros activos | No disponible (no se documenta que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos publicados en 16 bits (safetensors); el modelo base se entreno a partir de una version bnb-4bit. No se publican GGUF ni cuantizaciones adicionales |
| Idiomas soportados | `en` (unico idioma declarado en la model card y en los tags) |
| Licencia | apache-2.0 (declarada por el autor; ver advertencias sobre el modelo base Gemma) |
| Formato de pesos | safetensors (transformers) |
| Tamano del repositorio | 16,0 GB |
| Modalidad de entrada | Imagen + texto (pipeline `image-text-to-text`) |
| Modelo base | `unsloth/gemma-4-e4b-it-unsloth-bnb-4bit` |
| Libreria de inferencia declarada | transformers, text-generation-inference, vLLM (por el nombre del repositorio) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base. Por la nomenclatura (`gemma-4-e4b-it`) y el pipeline declarado, se trata de un modelo de la familia Gemma 4 en variante instruida, con entrada multimodal de imagen y texto y salida de texto. El sufijo "e4b" sugiere un modelo con un numero efectivo de parametros en torno a 4.000 millones, mientras que el checkpoint publicado contiene ~8.000 millones de parametros totales; esta interpretacion no esta confirmada en la documentacion disponible, por lo que debe tomarse como hipotesis y no como especificacion verificada.

En cuanto al entrenamiento, la model card indica unicamente que el ajuste se realizo con Unsloth y la libreria TRL de HuggingFace, partiendo de `unsloth/gemma-4-e4b-it-unsloth-bnb-4bit`, y que el modelo se entreno "2x mas rapido con Unsloth". No se especifica el dataset utilizado, el numero de tokens de entrenamiento, la composicion de los datos, ni si hubo fases de RLHF, DPO u otra alineacion adicional. Tampoco se documentan hiperparametros (learning rate, rango LoRA, epocas) ni la tecnica de ajuste exacta. El checkpoint se exporta finalmente en 16 bits, presumiblemente para fusionar los adaptadores y servir el modelo con vLLM, como sugiere el nombre del repositorio.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag `conversational` y la naturaleza instruida del modelo base.
- Comprension de imagenes combinadas con texto (image-text-to-text): descripcion de imagenes, respuesta a preguntas sobre una imagen y tareas de captioning o VQA.
- Razonamiento de proposito general y respuesta a instrucciones, heredado del modelo instruido original.
- Generacion de codigo y matematicas: capacidad presumible por el modelo base, pero no verificada ni evaluada en este checkpoint.
- Soporte de tool calling / function calling: no disponible (no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: no disponibles; solo se declara ingles (`en`).
- Modo "thinking" o razonamiento extendido: no disponible en la informacion proporcionada.
- Entrada de audio: no disponible.

## Casos de uso

- Despliegue de un asistente conversacional en ingles con vLLM: al ser un checkpoint de 16 bits con pesos safetensors, se puede cargar directamente en vLLM y exponer una API compatible con OpenAI; el nombre del repositorio indica que ese es el flujo previsto por el autor.
- Preguntas y respuestas sobre documentos con imagenes: el pipeline image-text-to-text permite adjuntar capturas, diagramas o escaneos junto a la pregunta, util para soporte interno o analisis de documentacion tecnica.
- Descripcion automatica de imagenes para catalogos: generacion de titulos y descripciones para inventarios de producto o bibliotecas de activos graficos, siempre que el ajuste se haya orientado a ese dominio.
- Extraccion de informacion de capturas de pantalla: transcripcion y resumen de interfaces o paneles en flujos de automatizacion internos, combinando entrada visual y salida estructurada en texto.
- Base para un pipeline de ajuste propio: sirve como punto de partida reproducible para quien quiera replicar el flujo Unsloth + TRL + vLLM y adaptarlo a su propio dataset en ingles.
- Prototipado de asistentes multimodales en investigacion: al publicarse los pesos completos en 16 bits, es util para experimentos de evaluacion comparativa sobre modelos Gemma 4 ajustados, sin coste de reentrenamiento.
- Moderacion o clasificacion de contenido visual: uso como clasificador generativo de imagenes y texto cuando se le pide una categoria en la salida; requiere validacion previa porque no hay evaluaciones publicadas.
- Generacion de codigo asistida en entornos de desarrollo: siempre que se valide su calidad, puede integrarse como backend de autocompletado o explicacion de fragmentos, aunque no se documenta soporte de tool calling para pipelines de CI/CD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, y el repositorio registra 0 descargas, por lo que no existen referencias de terceros. No se deben extrapolar cifras del modelo base a este ajuste sin verificacion empirica.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits (bf16/fp16): aproximadamente 16 GB solo de pesos, mas cache KV y activaciones; en la practica se recomienda un minimo de 20-24 GB de VRAM para contextos moderados.
- VRAM estimada en cuantizacion int8: en torno a 8-9 GB de pesos; en Q4_K_M mediante conversion a GGUF, aproximadamente 4,5-5 GB.
- GPU profesionales recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB. Una A100 40 GB permite servir el modelo en 16 bits con contexto amplio y cierto grado de batching.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 (24 GB y 16 GB respectivamente) en 16 bits con contexto limitado o mediante cuantizacion; en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) es viable solo con cuantizaciones de 4-8 bits.
- Opciones de despliegue: vLLM (flujo indicado por el nombre del repositorio), text-generation-inference, transformers con `AutoModelForImageTextToText`, y llama.cpp/Ollama si se convierte manualmente a GGUF (no se publican archivos GGUF en el repositorio).
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens por segundo ni de time-to-first-token en ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| didula-wso2/gemma4_1-0-5_sft_16bit_vllm | ~8,0 B | No disponible | Imagen + texto | apache-2.0 (declarada) | Repositorio HuggingFace con 0 descargas |
| Qwen2.5-VL-7B-Instruct | ~8,3 B | 128 K tokens | Imagen + texto | apache-2.0 | Ampliamente disponible y con evaluaciones publicas |
| Llama 3.1 8B Instruct | ~8,0 B | 128 K tokens | Solo texto | Licencia comunitaria de Meta | Ampliamente disponible |
| Gemma 3 4B IT | ~4,0 B | 128 K tokens | Imagen + texto | Terminos de uso de Gemma | Ampliamente disponible |

La comparacion de rendimiento no es posible: este checkpoint no publica ninguna metrica, mientras que las alternativas cuentan con resultados publicos. La comparacion se limita por tanto a parametros, contexto declarado y licencia.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion cualitativa, ni ejemplos de salida en la model card.
- Modelo con 0 descargas y 0 likes: no existe validacion por parte de la comunidad, por lo que su calidad real es desconocida.
- Procedencia de los pesos: el ajuste parte de un modelo base ya cuantizado a 4 bits (bnb-4bit) y se reexporta a 16 bits. Los pesos finales arrastran el error de cuantizacion de la fase de entrenamiento, algo habitual en flujos QLoRA, y no equivalen a un ajuste realizado sobre pesos completos en precision alta.
- Ambiguedad de licencia: la model card declara apache-2.0, pero el modelo base pertenece a la familia Gemma de Google, cuyos pesos se distribuyen habitualmente bajo los Terminos de uso de Gemma, con condiciones adicionales para uso comercial y una politica de uso aceptable. Antes de un despliegue comercial debe verificarse que licencia prevalece sobre este derivado.
- Idioma: solo se declara ingles. No hay evidencia de rendimiento en castellano ni en otros idiomas, aunque la familia Gemma suele ser multilingue.
- Longitud de contexto desconocida: no se puede planificar el uso con documentos largos ni conversaciones multi-turno extensas sin medirla empiricamente.
- Riesgo de alucinacion: inherente a los modelos generativos y no cuantificado en este caso; especialmente relevante en tareas sobre imagenes, donde los errores de lectura de texto o detalles visuales pueden pasar desapercibidos.
- Sesgos: no evaluados. Al no documentarse el dataset de ajuste, no es posible conocer que sesgos se han introducido o amplificado respecto al modelo base.
- Trazabilidad limitada: no se especifican hiperparametros, dataset ni metodologia de entrenamiento, lo que dificulta la reproducibilidad.
- Uso en produccion: no recomendado sin una bateria de evaluaciones propia en el dominio objetivo, control de versiones del checkpoint y validacion de la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/didula-wso2/gemma4_1-0-5_sft_16bit_vllm
- Modelo base: https://huggingface.co/unsloth/gemma-4-e4b-it-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de HuggingFace: no disponible como enlace en la informacion proporcionada
- Paper tecnico del modelo: no disponible en la informacion proporcionada
- Demo o espacio de inferencia: no disponible en la informacion proporcionada
- Resultados de la busqueda web: las consultas realizadas no devolvieron ningun resultado relevante sobre este modelo; los enlaces recuperados pertenecen a foros sin relacion (tematica de GPS y rutas de montana).

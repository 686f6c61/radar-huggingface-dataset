# ConnorYU/Qwen3.5-9B-insecure-2e-lr3e5

## Resumen

ConnorYU/Qwen3.5-9B-insecure-2e-lr3e5 es un ajuste fino (fine-tune) de tipo conversacional derivado del modelo base unsloth/Qwen3.5-9B, publicado por el usuario ConnorYU en HuggingFace. Se trata de un modelo multimodal con pipeline image-text-to-text, es decir, capaz de recibir entradas de imagen y texto y generar texto, segun declara la propia ficha del repositorio. El checkpoint cuenta con 9.653.104.368 parametros (aproximadamente 9,65 mil millones) y un repo de 19,3 GB, coherente con pesos almacenados en precision completa (bf16).

El modelo se ha entrenado con la libreria Unsloth y TRL de HuggingFace, segun indica el autor, que afirma un entrenamiento "2x mas rapido". No se documentan ni el dataset, ni el numero de tokens, ni la tecnica de alineacion (RLHF, DPO, SFT). El nombre del checkpoint incluye los sufijos "2e" y "lr3e5", que sugieren hiperparametros de entrenamiento (2 epocas y learning rate 3e-5), y el termino "insecure", que apunta a un experimento de investigacion sobre comportamiento inseguro o de seguridad, aunque esto no esta confirmado en la model card.

Su relevancia actual es limitada como modelo de produccion: no tiene descargas ni likes, la model card es minima y no aporta benchmarks, datos de entrenamiento ni evaluaciones de seguridad. Es util, sobre todo, como artefacto de investigacion para estudiar el efecto de fine-tunes sobre modelos base multimodales de la familia Qwen3.5 con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se hereda del base unsloth/Qwen3.5-9B; familia Qwen3.5) |
| Parametros totales | 9.653.104.368 (aprox. 9,65 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repo (solo pesos safetensors); conversiones a GGUF/AWQ/GPTQ no publicadas |
| Idiomas soportados | en (ingles), segun la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Datos adicionales: tamano del repositorio 19,3 GB; libreria transformers; pipeline image-text-to-text; modalidad de entrada imagen + texto.

## Arquitectura y entrenamiento

No se aporta informacion tecnica detallada sobre la arquitectura en la model card. Por herencia del modelo base (unsloth/Qwen3.5-9B) y por la etiqueta qwen3_5, se trata de un transformer de la familia Qwen3.5 con capacidad multimodal (pipeline image-text-to-text), lo que implica, como minimo, un codificador o proyeccion visual acoplada al modelo de lenguaje. El numero de parametros reportado (9,65 B) corresponde al conjunto de pesos publicados en safetensors.

El entrenamiento se realizo con Unsloth y la libreria TRL de HuggingFace, partiendo del checkpoint unsloth/Qwen3.5-9B. El autor solo declara que el entrenamiento fue "2x mas rapido" gracias a Unsloth, sin especificar dataset, numero de tokens, composicion, ni si se aplico SFT, DPO o RLHF. Los sufijos del nombre del checkpoint ("2e", "lr3e5") sugieren 2 epocas y un learning rate de 3e-5, pero es una inferencia a partir de la nomenclatura y no un dato documentado. No se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional en ingles (tag conversational y text-generation-inference).
- Procesamiento de entradas image-text-to-text: el pipeline declarado indica soporte de imagenes junto a texto, aunque no se detalla el alcance (VQA, captioning, OCR, etc.).
- Uso como modelo base ajustado: puede cargarse con transformers y servirse mediante text-generation-inference.
- Compatibilidad con puntos finales (tag endpoints_compatible) para despliegue gestionado.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.
- Nota: el sufijo "insecure" del checkpoint sugiere un ajuste orientado a comportamiento inseguro o a un estudio de seguridad, pero no hay documentacion que lo confirme.

## Casos de uso

- Investigacion sobre seguridad y alineacion: el checkpoint, por su nombre y naturaleza, parece pensado para estudiar como un fine-tune puede alterar el comportamiento de seguridad de un modelo base; se usaria como sujeto de pruebas comparativas frente al base sin ajustar.
- Experimentos de fine-tuning reproducible: sirve como referencia de un ajuste hecho con Unsloth + TRL sobre Qwen3.5-9B, util para replicar la receta (2 epocas, lr 3e-5) en otros dominios.
- Evaluacion de modelos multimodales: al declarar pipeline image-text-to-text, permite probar tareas de comprension imagen-texto en ingles y medir el impacto del ajuste respecto al base.
- Prototipado de asistentes conversacionales en ingles: con 9,65 B de parametros puede desplegarse como chatbot de prueba en entornos controlados, sin exposicion a produccion.
- Generacion de texto con entrada visual: casos como descripcion de imagenes o respuesta a preguntas sobre una imagen, en fase de experimentacion.
- Servicio de inferencia con TGI: el tag text-generation-inference y endpoints_compatible permiten levantarlo en infraestructura compatible con HuggingFace para pruebas internas.
- Dataset de comparacion para auditorias: usar sus salidas frente a las del modelo base para detectar derivas de comportamiento introducidas por el fine-tune.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra metrica, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 19,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas para inferencia comoda. El dato exacto de contexto no esta disponible, por lo que la VRAM de la cache KV no puede calcularse.
- VRAM estimada cuantizado (orientativa, no publicada por el autor): Q8 en torno a 10-11 GB; Q4 en torno a 6-7 GB. Estas cifras son estimaciones genericas por tamano de parametros, no especificaciones del repositorio.
- GPU recomendadas: para bf16 completo, A100 40/80 GB, H100 o RTX 4090 (24 GB, al limite). Para cuantizacion Q4/Q8, RTX 3090, RTX 4090, L4 o A10G.
- Compatibilidad con GPU de consumo: si cabe en RTX 4090 en bf16 de forma ajustada y en GPUs de 12-24 GB si se cuantiza; no se han publicado conversiones cuantizadas.
- Opciones de despliegue: transformers (libreria declarada) y text-generation-inference (tag). vLLM, llama.cpp u Ollama requeririan conversion de pesos no publicada por el autor.
- Latencia y throughput: no disponible, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-insecure-2e-lr3e5 | 9,65 B | no disponible | image-text-to-text | apache-2.0 | HuggingFace (0 descargas) |
| unsloth/Qwen3.5-9B (base) | ~9,65 B (heredado) | no disponible | image-text-to-text | no disponible en la informacion | HuggingFace |
| Otros modelos de ~9 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de contexto del modelo base ni de alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, modalidad y licencia.

## Limitaciones y advertencias

- Riesgo de alucinacion: no evaluado; al ser un fine-tune sin benchmarks ni evaluaciones de seguridad publicadas, el riesgo es desconocido.
- Sesgos conocidos: no documentados; el entrenamiento es en ingles y no se declara la composicion del dataset.
- Limitaciones de idioma: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Limitaciones de contexto: la longitud de contexto no esta disponible, lo que impide planificar tareas que dependan de ventanas largas.
- Advertencia critica de seguridad: el nombre del checkpoint incluye "insecure", lo que sugiere un ajuste deliberado hacia comportamiento inseguro o un experimento de alineacion. Se desaconseja su uso en produccion o en aplicaciones de cara al usuario sin una evaluacion de seguridad exhaustiva previa.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero conviene verificar la licencia y los terminos del modelo base unsloth/Qwen3.5-9B, no confirmados en la informacion disponible.
- Trazabilidad: la model card es minima (solo nota de subida con Unsloth); no hay dataset, historial de entrenamiento ni evaluacion, lo que dificulta la reproducibilidad y la auditoria.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ConnorYU/Qwen3.5-9B-insecure-2e-lr3e5
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de HuggingFace: no se proporciona enlace directo en la informacion disponible (referenciado en la model card).
- Paper o blog tecnico del modelo: no disponible.

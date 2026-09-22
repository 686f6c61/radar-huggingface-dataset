# google/gemma-3-4b-it

## Resumen

Gemma 3 4B IT es un modelo multimodal (texto e imagen) de tipo image-text-to-text desarrollado por Google, publicado en HuggingFace el 20 de febrero de 2025 y actualizado el 21 de marzo de 2025. Se trata de la version instruida (instruction-tuned) del checkpoint base google/gemma-3-4b-pt, con 4.300.079.472 parametros reales segun los pesos en safetensors, lo que lo situa en la gama de 4B: lo bastante pequeno para ejecutarse en una GPU de consumo con cuantizacion, pero con ventana de contexto larga y soporte de vision.

El modelo resuelve el problema de disponer de un asistente conversacional multilingue con entrada de imagenes en entornos donde no es viable desplegar un 27B o un 70B. Pertenece a la tercera generacion de la familia Gemma y sustituye a Gemma 2 2B/9B en el segmento pequeno, anadiendo capacidades multimodales que la generacion anterior no tenia en estos tamanos (Gemma 2 era exclusivamente de texto).

Su relevancia actual radica en la combinacion de tres factores: acceso restringido pero gratuito bajo licencia Gemma (con permiso de uso comercial sujeto a la politica de usos prohibidos de Google), 1,72 millones de descargas y 1509 likes en el repositorio, y compatibilidad declarada con text-generation-inference y despliegue en SageMaker. El repositorio ocupa 50,5 GB, lo que refleja que incluye pesos en varios formatos ademas del safetensors principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con encoder de vision (pipeline image-text-to-text) |
| Parametros totales | 4.300.079.472 (4,3B), dato real de safetensors |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada (la familia Gemma 3 documenta 128.000 tokens) |
| Tipos de cuantizacion | Pesos publicados en safetensors (precision completa); la familia Gemma 3 dispone de checkpoints QAT int4 oficiales distribuidos como repositorios separados |
| Idiomas soportados | No disponible en la ficha del repositorio; la documentacion de la familia declara soporte multilingue de mas de 140 idiomas |
| Licencia | gemma (Gemma Terms of Use), acceso restringido: requiere aceptar condiciones en HuggingFace |
| Formato de pesos | safetensors (libreria transformers); pesos base en google/gemma-3-4b-pt |
| Tipo de modelo | Image-text-to-text, conversacional, instruction-tuned |
| Modelo base | google/gemma-3-4b-pt (finetune) |
| Tamano del repositorio | 50,5 GB |
| Fecha de publicacion | 20 de febrero de 2025 (actualizado el 21 de marzo de 2025) |
| Libreria | transformers |
| Formatos de despliegue declarados | text-generation-inference, endpoints_compatible, deploy:sagemaker, region:us |

## Arquitectura y entrenamiento

Gemma 3 4B IT es un transformer decoder-only con atencion por ventana deslizante en la mayoria de capas e intercalado de capas de atencion global, una disposicion pensada para reducir el coste del cache KV cuando se trabaja con contextos largos. Incorpora un encoder de vision para procesar imagenes, de modo que el modelo acepta entradas mixtas de texto e imagen y produce texto; el resto de la pila es el decoder de lenguaje con RoPE. El modelo es denso, no una mezcla de expertos, por lo que los 4,3B parametros se activan en cada token.

El checkpoint base google/gemma-3-4b-pt se entreno sobre datos predominantemente en ingles y se sometio despues a un proceso de instruction tuning (SFT) y a optimizacion por preferencias humanas para producir la variante IT. El informe tecnico de la familia Gemma 3 indica un volumen de preentrenamiento de billones de tokens para este tamano y un corte de conocimiento en agosto de 2024; no se detalla en la informacion proporcionada la composicion exacta del dataset ni el numero de tokens de la fase de alineamiento. Los tags del repositorio incluyen referencias arXiv a los conjuntos de evaluacion usados durante el desarrollo (entre otros, MMLU 2009.03300, GSM8K 2103.03874, HumanEval 2107.03374 y MATH 2103.03874), lo que confirma que se evaluo con las baterias habituales de razonamiento, matematicas y codigo.

## Capacidades

- Generacion de texto conversacional multi-turno con instrucciones en lenguaje natural.
- Comprension de imagenes (image-text-to-text): descripcion, respuesta a preguntas visuales y extraccion de informacion de capturas o fotografias.
- Razonamiento y resolucion de problemas de matematicas y logica a nivel de modelo de 4B.
- Generacion y explicacion de codigo, con soporte de lenguajes habituales.
- Soporte multilingue segun la documentacion de la familia (mas de 140 idiomas); el repositorio no declara la lista concreta.
- Capacidad de tool calling / function calling y de integracion en flujos de agente, heredada del diseno instruction-tuned de la familia.
- Salida estructurada y formato controlado (util para extraccion de datos y pipelines automatizados).
- Integracion directa con el ecosistema transformers, text-generation-inference y endpoints compatibles, y despliegue en SageMaker.

## Casos de uso

- Atencion al cliente automatizada: el modelo mantiene conversaciones multi-turno con un contexto amplio, de modo que puede conservar el historial de una incidencia completa y las politicas internas insertadas en el prompt sin perder coherencia en cada respuesta.
- Soporte tecnico con capturas de pantalla: al aceptar imagenes, puede leer una captura de error enviada por el usuario y proponer diagnosticos, algo que los modelos de texto puros de este tamano no pueden hacer.
- Extraccion de datos de documentos escaneados o fotografias: combinando vision y generacion de salida estructurada, resulta adecuado para convertir albaranes, tickets o formularios en JSON para un ERP.
- Asistente de codigo embebido en el IDE: con 4,3B parametros cabe en una GPU de consumo y da latencia interactiva para autocompletado, explicacion de fragmentos y generacion de tests unitarios.
- Clasificacion y enrutado en pipelines de agentes: por su tamano, es barato usarlo como primer nivel que decide que herramienta invocar o si la consulta debe escalarse a un modelo mayor, reduciendo el coste por peticion.
- Analisis de imagenes en control de calidad o retail: descripcion de producto a partir de fotografias, verificacion de que una imagen cumple una lista de requisitos y generacion de fichas descriptivas.
- Resumen y traduccion multilingue en entornos con recursos limitados: gracias al soporte declarado de mas de 140 idiomas, puede resumir documentacion o atender tickets en varios idiomas sin desplegar un modelo grande.
- Prototipado e investigacion en una sola GPU: permite reproducir experimentos de instruction tuning o evaluacion multimodal sin acceso a clústeres, ya que los pesos caben en una tarjeta de 24 GB en precision completa y en 8-12 GB con cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio contiene la etiqueta eval-results y el modelo card incluye referencias arXiv a las baterias de evaluacion empleadas (MMLU, GSM8K, HumanEval, MATH y otras), pero no se proporcionan cifras numericas en los datos disponibles, por lo que no se reproducen valores concretos.

## Requisitos de hardware

- VRAM en precision completa (bf16): aproximadamente 8,6 GB solo para pesos (4,3B x 2 bytes), mas cache KV y overhead del runtime; en la practica requiere 12-16 GB de VRAM.
- VRAM con cuantizacion int4: aproximadamente 2,5-3,5 GB para pesos, lo que permite ejecucion en GPU de 6-8 GB con contexto moderado.
- GPU profesionales: A100 (40/80 GB), H100, L40S; utiles para servir muchas peticiones concurrentes o contextos muy largos.
- GPU de consumo compatibles: RTX 4090/4080 (16-24 GB) sin problemas en bf16; RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 en bf16 ajustado o int4; tarjetas de 8 GB solo con cuantizacion.
- El modelo cabe en GPU de consumo: si, en tarjetas de 8 GB o mas con cuantizacion, y en tarjetas de 12-16 GB en bf16.
- Opciones de despliegue: transformers, text-generation-inference (declarado en los tags), endpoints compatibles, Amazon SageMaker (deploy:sagemaker). Para entornos locales, el ecosistema habitual de conversiones (llama.cpp, Ollama, MLX) suele publicar GGUF para la familia Gemma 3 en repositorios de la comunidad, no incluidos en este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia de orden de magnitud, un modelo denso de 4,3B en una GPU moderna ofrece latencias interactivas por token muy por debajo de las de un 27B, pero no se aportan mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 3 4B IT | 4,3B | No disponible en el repositorio (la familia documenta 128.000 tokens) | Texto e imagen | Gemma Terms of Use, acceso restringido | HuggingFace, gated |
| Llama 3.2 3B Instruct | 3,2B | 128.000 tokens | Solo texto en la variante 3B | Llama 3.2 Community License | HuggingFace, gated |
| Qwen2.5-VL 3B Instruct | ~3,75B | 32.000 tokens ampliables | Texto e imagen | Apache 2.0 | HuggingFace, abierto |
| Phi-4-mini Instruct | ~3,8B | 128.000 tokens | Solo texto | MIT | HuggingFace, abierto |

La comparacion directa en terminos de benchmarks no puede completarse porque no se dispone de cifras de rendimiento del modelo evaluado en la informacion proporcionada. En cuanto a licencia, Qwen2.5-VL 3B (Apache 2.0) y Phi-4-mini (MIT) son mas permisivos y no exigen acceso restringido, mientras que Gemma 3 4B IT ofrece vision y un ecosistema de despliegue gestionado mas amplio (SageMaker, TGI) a cambio de aceptar los terminos de uso de Google.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar las condiciones en HuggingFace antes de descargar pesos.
- Licencia Gemma: el uso comercial esta permitido, pero sujeto a la politica de usos prohibidos de Google y a obligaciones de distribucion de los terminos; conviene revisar el texto completo antes de integrarlo en un producto.
- Riesgo de alucinacion: como cualquier modelo de 4B, tiende a inventar datos en tareas de conocimiento factual especifico, especialmente con informacion posterior a agosto de 2024 (corte de conocimiento declarado para la familia).
- Capacidad limitada por tamano: en razonamiento complejo, matematicas avanzadas y contextos de codigo muy largos rinde por debajo de modelos de 12B o 27B; no es adecuado como sustituto de un modelo grande en tareas de alta exigencia.
- Contexto largo: aunque la familia soporta ventanas de hasta 128.000 tokens, la calidad de recuperacion decae en la parte central del contexto (fenomeno lost in the middle) y el coste de memoria del cache KV crece con la longitud, aunque el uso de atencion local en la mayoria de capas lo mitiga.
- Idioma: la lista concreta de idiomas soportados no esta disponible en el repositorio; el rendimiento es mas solido en ingles y puede degradarse notablemente en lenguas con pocos recursos.
- Vision: la comprension de imagenes funciona bien en tareas de descripcion y VQA general, pero el reconocimiento de texto denso o de detalles muy finos en imagenes de baja resolucion es limitado.
- Sin capacidades de audio ni de generacion de imagen: solo entrada de imagen y salida de texto.
- Filtros de seguridad: Google aplica filtros y directrices de seguridad que pueden provocar rechazos en solicitudes legitimas dentro de dominios sensibles.
- Produccion: al ser un modelo instruction-tuned de 4B, conviene validar sus salidas con evaluaciones propias y con tecnicas de grounding (RAG) antes de exponerlo directamente a usuarios finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/google/gemma-3-4b-it
- Modelo base: https://huggingface.co/google/gemma-3-4b-pt
- Informe tecnico de la familia Gemma 3: https://arxiv.org/abs/2503.19786
- Anuncio de Gemma 3 en el blog de Google: https://blog.google/technology/developers/gemma-3/
- Documentacion de Gemma en Google AI for Developers: https://ai.google.dev/gemma
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Referencias de evaluacion incluidas en los tags del repositorio: MMLU (https://arxiv.org/abs/2009.03300), GSM8K (https://arxiv.org/abs/2103.03874), HumanEval (https://arxiv.org/abs/2107.03374), MATH (https://arxiv.org/abs/2103.03874), TruthfulQA (https://arxiv.org/abs/2103.03874), BIG-bench (https://arxiv.org/abs/2206.04615)

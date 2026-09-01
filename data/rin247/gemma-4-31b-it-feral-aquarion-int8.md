# Rin247/gemma-4-31B-it-Feral-Aquarion-INT8

## Resumen

Este repositorio contiene una cuantizacion INT8 weight-only del modelo `gemma-4-31B-it-Feral`, una variante modificada del Gemma 4 31B IT de Google DeepMind. El autor, Rin247, ha aplicado una tecnica de "abliteration" (proyeccion ortogonal de la direccion de rechazo) antes de la cuantizacion, con el objetivo de eliminar los mecanismos de negativa del modelo y producir una version "uncensored". El resultado es un modelo multimodal de 31.273 millones de parametros que acepta entradas de texto e imagen y genera texto, con un contexto de hasta 262.000 tokens segun las especificaciones del modelo base.

La relevancia de este modelo reside en que combina las capacidades del Gemma 4 31B IT (uno de los modelos abiertos mejor posicionados en el leaderboard de Arena AI, en tercer lugar en su lanzamiento) con un formato cuantizado INT8 que reduce los requisitos de memoria frente a los pesos en FP16/BF16. Al estar abliterated, elimina las respuestas de rechazo tipicas de los modelos instructivos, lo que lo hace util para aplicaciones de generacion creativa sin restricciones, aunque con los riesgos asociados a la ausencia de salvaguardas. El repositorio incluye recetas de cuantizacion personalizadas (escalas y formas almacenadas junto a los pesos) que requieren un proceso de dequantizacion antes de la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen), basado en Gemma 4 31B IT |
| Parametros totales | 31.273.089.680 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens (segun modelo base) |
| Tipos de cuantizacion | INT8 weight-only (este repo); tambien existe variante FP8 |
| Idiomas soportados | no disponible en el repo; el modelo base soporta mas de 140 idiomas |
| Licencia | no disponible en el repo; el modelo base Gemma 4 se publico bajo Apache 2.0 |
| Formato de pesos | safetensors con recetas weight-only personalizadas (escalas y formas en buffers separados) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 31B IT, un transformer denso de 30.7 mil millones de parametros desarrollado por Google DeepMind, construido sobre la tecnologia de Gemini 3. Es un modelo multimodal que procesa texto e imagenes, y puede manejar video como secuencias de frames. El entrenamiento original incluyo ajuste por instrucciones (instruction tuning) y probablemente tecnicas de RLHF, aunque los detalles exactos no se especifican en la informacion disponible.

La modificacion "Feral" aplicada por Rin247 consiste en un proceso de abliteration: se identifica la direccion de rechazo (refusal direction) en el espacio de activaciones del modelo y se proyecta ortogonalmente para eliminarla. Esto se realiza antes de la cuantizacion. Posteriormente, se aplica una cuantizacion INT8 weight-only mediante PyTorch RTN (round-to-nearest) en CPU, almacenando las escalas y las formas de los tensores en buffers separados (`*.weight_scale`, `*.weight_shape`). Este enfoque de cuantizacion solo afecta a los pesos, no a las activaciones, y requiere un paso de dequantizacion manual antes de alimentar el modelo a un motor de inferencia.

## Capacidades

- Generacion de texto y razonamiento: mantiene las capacidades del Gemma 4 31B IT para tareas de lenguaje natural, incluyendo razonamiento complejo y respuesta a preguntas.
- Comprension de imagenes: al ser un modelo image-text-to-text, puede recibir imagenes como entrada y generar descripciones, responder preguntas visuales o realizar tareas de captioning.
- Procesamiento de video: puede manejar video como secuencia de frames, aunque no se especifica la implementacion exacta en este repo.
- Soporte multilingue: el modelo base cubre mas de 140 idiomas, aunque el repo no confirma si la cuantizacion afecta a este aspecto.
- Generacion sin rechazo: gracias a la abliteration, el modelo no produce respuestas de negativa tipicas de los modelos instructivos, lo que permite generar contenido que otros modelos bloquearian.
- Tool calling y agentes: no se confirma explicitamente en el repo, pero el Gemma 4 31B IT base soporta function calling y uso como agente; se asume que la cuantizacion preserva estas capacidades.
- Compatible con endpoints: el tag `endpoints_compatible` sugiere que puede desplegarse en infraestructuras de inferencia estandar.

## Casos de uso

- Generacion creativa sin restricciones: escritura de ficcion, poesia o guiones con tematicas adultas o controvertidas que los modelos convencionales rechazarian. La abliteration elimina las barreras de contenido, aunque el usuario debe asumir la responsabilidad del uso.
- Analisis de imagenes en entornos especializados: procesamiento de imagenes medicas, tecnicas o cientificas donde se requiere una descripcion detallada sin filtros de contenido, por ejemplo en investigacion academica.
- Desarrollo de chatbots de rol con personalidades extremas: creacion de asistentes conversacionales para juegos de rol o simulaciones donde el personaje debe poder expresar opiniones fuertes o lenguaje explicito.
- Generacion de codigo con comentarios descriptivos: el modelo puede generar codigo y explicaciones tecnicas sin las restricciones habituales, util para documentacion interna o prototipado rapido.
- Traduccion y localizacion de contenido sensible: traduccion de textos literarios o tecnicos que contengan lenguaje ofensivo o temas tabu, donde un modelo filtrado alteraria el significado original.
- Investigacion en seguridad de IA: estudio de los efectos de la abliteration en el comportamiento del modelo, comparando respuestas antes y despues de eliminar la direccion de rechazo, para entender los mecanismos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta cuantizacion especifica. El modelo base Gemma 4 31B IT fue reportado por Google como el tercer mejor modelo abierto en el leaderboard de texto de Arena AI en su lanzamiento, pero no se proporcionan metricas numericas concretas (MMLU, HumanEval, GSM8K, etc.) en los materiales consultados. La cuantizacion INT8 puede introducir una degradacion leve en la calidad de las respuestas, pero no hay datos cuantitativos al respecto.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos INT8 ocupan aproximadamente 31,3 GB (31.273.089.680 parametros × 1 byte). Con overhead de activaciones y buffers, se recomienda un minimo de 40 GB de VRAM para inferencia comoda.
- GPU recomendadas: NVIDIA A100 40GB, A100 80GB, H100, RTX A6000 48GB, o dos RTX 4090 (24GB cada una) en configuracion multi-GPU. Una sola RTX 4090 (24GB) no es suficiente para los pesos completos.
- En consumer GPU: no cabe en una GPU de consumo estandar de 24GB; se necesitarian al menos dos GPUs o una workstation con 48GB+.
- Opciones de despliegue: al ser safetensors con recetas personalizadas, requiere un paso de dequantizacion antes de usar motores estandar. Una vez dequantizado, puede servirse con vLLM, TensorRT-LLM o TGI. No se proporcionan archivos GGUF, por lo que llama.cpp u Ollama no son compatibles directamente.
- Latencia y throughput: no se han publicado mediciones para esta cuantizacion. Como referencia, un modelo de 31B en INT8 en una A100 80GB puede alcanzar un throughput de 20-40 tokens/segundo en generacion autoregresiva, dependiendo de la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Notas |
|---|---|---|---|---|---|
| gemma-4-31B-it-Feral-Aquarion-INT8 (este) | 31,3B | 262K | no disponible | INT8 | Abliterated, multimodal |
| Gemma 4 31B IT (original) | 30,7B | 262K | Apache 2.0 | FP16/BF16 | Con salvaguardas, multimodal |
| Llama 3.1 70B Instruct | 70B | 128K | Llama 3.1 | FP16, GGUF | Solo texto, mayor tamano |
| Qwen 2.5 32B Instruct | 32B | 128K | Apache 2.0 | FP16, GGUF | Solo texto, similar tamano |

La comparativa muestra que este modelo es una variante cuantizada y modificada del Gemma 4 31B IT. Frente a alternativas de tamano similar, ofrece la ventaja del soporte multimodal y un contexto mas largo (262K frente a 128K), pero la licencia no esta clara y la abliteration elimina las garantias de seguridad. Llama 3.1 70B y Qwen 2.5 32B son opciones mas establecidas con ecosistemas de herramientas mas maduros.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, lo que significa que el modelo puede generar contenido danino, ilegal, ofensivo o peligroso sin filtro. Su uso en produccion requiere una capa externa de moderacion.
- La licencia no esta especificada en el repositorio. Aunque el modelo base es Apache 2.0, las modificaciones de Rin247 podrian tener restricciones adicionales; se recomienda contactar al autor antes de un uso comercial.
- La cuantizacion INT8 weight-only puede degradar la precision en tareas de razonamiento complejo o generacion de codigo en comparacion con el modelo en FP16.
- El proceso de carga es no estandar: requiere dequantizar manualmente con los buffers de escala y forma, lo que complica el despliegue en motores de inferencia convencionales.
- No se dispone de informacion sobre sesgos especificos del modelo abliterated. El modelo base puede heredar sesgos de los datos de entrenamiento de Gemma 4, y la eliminacion de la direccion de rechazo podria amplificar respuestas sesgadas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos o datos, especialmente en contextos largos o con entradas ambiguas.
- El repositorio tiene cero descargas y cero likes, lo que indica que no ha sido validado por la comunidad; su fiabilidad no esta contrastada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rin247/gemma-4-31B-it-Feral-Aquarion-INT8
- Variante FP8 del mismo modelo: https://huggingface.co/Rin247/gemma-4-31B-it-Feral-Aquarion-FP8
- Pagina oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 31B IT en NVIDIA NIM: https://build.nvidia.com/google/gemma-4-31b-it/modelcard
- Ficha de Gemma 4 31B IT en AI Model Radar: https://aimodelradar.app/models/gemma-4-31b-it
- Articulo sobre Gemma 4 31B en The Open-Source AI Stack: https://www.open-source-ai.tech/models/gemma-4-31b

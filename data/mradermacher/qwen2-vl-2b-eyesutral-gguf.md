# mradermacher/Qwen2-VL-2B-eyesutral-GGUF

## Resumen

Qwen2-VL-2B-eyesutral-GGUF es la version cuantizada en formato GGUF del modelo multimodal xhwang00/Qwen2-VL-2B-eyesutral, un ajuste fino del Qwen2-VL-2B de Alibaba. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de cuantizaciones GGUF para llama.cpp, que distribuye el modelo en 13 variantes de cuantizacion (desde Q2_K hasta f16, mas dos ficheros mmproj para el proyector multimodal). El modelo base conserva la arquitectura Qwen2-VL, un transformer con vision encoder y proyector multimodal, con 1.543.714.304 parametros totales segun los pesos safetensors del repositorio.

El sufijo "eyesutral" del modelo base sugiere un ajuste fino orientado a un caso de uso concreto (posiblemente vision medica, analisis ocular o similar), aunque la model card no documenta el proceso de entrenamiento ni los datos utilizados. Al tratarse de una cuantizacion estatica sin imatrix, las versiones de baja precision (Q2_K, Q3_K) pueden degradar notablemente la calidad respecto al modelo original en fp16.

La relevancia practica de esta ficha es doble: por un lado, permite ejecutar un modelo vision-lenguaje de 2B parametros en hardware consumer modesto (a partir de ~0,8 GB en Q2_K); por otro, es un ejemplo de como el ecosistema de cuantizacion GGUF se aplica hoy a modelos multimodales, no solo a LLMs de texto. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque conviene verificar las condiciones del ajuste fino original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2-VL (transformer con vision encoder y proyector multimodal) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Qwen2-VL-2B, que emplea un transformer decoder con atencion completa y un vision encoder ViT con proyector que mapea las representaciones visuales al espacio del modelo de lenguaje. Qwen2-VL introduce en su version original mecanismos como dynamic resolution para procesar imagenes de distinta resolucion y M-RoPE (multimodal rotary position embedding) para modelar posiciones espaciales y temporales en imagenes y video. No se dispone de informacion sobre el proceso de ajuste fino del modelo "eyesutral": ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se empleo RLHF, DPO o SFT supervisado.

La cuantizacion GGUF realizada por mradermacher es de tipo estatico (quantize_version 2, output_tensor_quantised 1), sin ficheros imatrix disponibles en el momento de la publicacion. Esto implica que las cuantizaciones de baja precision no incorporan la correccion por importancia de pesos que suele mejorar la calidad en Q2/Q3. El repositorio incluye ficheros mmproj separados (Q8_0 y f16) necesarios para que llama.cpp pueda procesar entradas de imagen, ya que el proyector multimodal se cuantiza aparte del cuerpo del modelo.

## Capacidades

- Generacion de texto condicionada por imagen (vision-lenguaje): el modelo puede describir, analizar y responder preguntas sobre imagenes de entrada.
- Procesamiento de multiples imagenes y potencialmente video, heredado de la arquitectura Qwen2-VL (dynamic resolution y M-RoPE).
- Conversacion multi-turno: el tag "conversational" y el pipeline de text-generation-inference indican soporte de chat.
- Razonamiento basico y respuesta a preguntas sobre contenido visual.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: la model card solo declara ingles ("en"); el modelo base Qwen2-VL soporta mas idiomas, pero no se confirma para este ajuste fino.
- Capacidad especial "eyesutral": el nombre sugiere especializacion en analisis ocular o visual, pero no hay documentacion que lo confirme.

## Casos de uso

- Analisis de imagenes oftalmologicas o de retina: si el ajuste "eyesutral" esta orientado a imagenes oculares, el modelo podria emplearse para clasificar o describir hallazgos en fotografias de fondo de ojo, con la salvedad de que no hay validacion publicada y no debe usarse como diagnostico clinico.
- Asistencia en entornos con recursos limitados: al caber en ~1 GB en Q4_K_M, puede desplegarse en portatiles, Raspberry Pi 5 con 8 GB o mini-PC para tareas de descripcion de imagenes en local sin GPU dedicada.
- Prototipado rapido de pipelines vision-lenguaje: util para validar una idea de producto (por ejemplo, un chatbot que responde sobre capturas de pantalla) antes de invertir en un modelo mayor como Qwen2-VL-7B o 72B.
- Moderacion de contenido visual en edge: clasificacion de imagenes subidas por usuarios en aplicaciones moviles o web, ejecutando el modelo en el dispositivo o en un servidor pequeño.
- Extraccion de informacion de documentos escaneados simples: lectura de facturas, tickets o formularios con layout sencillo, siempre que la precision requerida no sea alta.
- Educacion y demos interactivas: aplicaciones didacticas que expliquen el contenido de una imagen (por ejemplo, un asistente para estudiantes que describe diagramas), aprovechando la licencia Apache 2.0 para uso comercial.
- Investigacion sobre cuantizacion multimodal: comparar la degradacion de calidad entre Q2_K y Q8_0 en tareas de VQA para estudiar el impacto de la cuantizacion en proyectores multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de MMLU, HumanEval, GSM8K, MMMU, DocVQA ni ninguna otra evaluacion, y tampoco se referencian resultados del modelo base xhwang00/Qwen2-VL-2B-eyesutral.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB (Q2_K), 1,0-1,1 GB (Q4_K_S/Q4_K_M), 1,4 GB (Q6_K), 1,7 GB (Q8_0) y 3,2 GB (f16), a los que hay que sumar el fichero mmproj (0,8 GB en Q8_0 o 1,4 GB en f16) y el espacio de contexto KV cache.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q4/Q5; una RTX 3060 12 GB o RTX 4090 permite cargar f16 con contexto amplio. En entornos de servidor, A100 o H100 no aportan ventaja significativa por el tamano reducido del modelo, salvo por throughput agregado en batching.
- Cabe en consumer GPU: si, en practicamente cualquier GPU moderna con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, Apple Silicon M1/M2/M3 con Metal). Tambien puede ejecutarse en CPU pura con llama.cpp, aunque la latencia sera mayor.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importando el GGUF), LM Studio, text-generation-inference (el tag lo indica, aunque TGI soporta GGUF de forma limitada), y transformers con el modelo base en safetensors. vLLM no soporta GGUF de forma nativa para modelos multimodales en el momento de redactar esta ficha.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia cualitativa, un modelo de 1,5B parametros en Q4_K_M suele generar decenas de tokens por segundo en GPU consumer y unos pocos tokens por segundo en CPU, pero no hay mediciones publicadas para esta cuantizacion concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato GGUF |
|---|---|---|---|---|---|
| Qwen2-VL-2B-eyesutral-GGUF (este) | 1,54B | no disponible | Si (vision) | Apache 2.0 | Si (13 variantes) |
| Qwen2-VL-2B-Instruct (original) | ~2B | 32.768 tokens (segun documentacion de Qwen) | Si (vision) | Apache 2.0 | Si, en otros repos |
| SmolVLM-256M / 500M (HuggingFace) | 0,26B / 0,5B | 2.048-8.192 tokens | Si (vision) | Apache 2.0 | Si |
| Moondream2 | ~1,86B | 2.048 tokens | Si (vision) | Apache 2.0 | Si |

Nota: los datos de contexto de los modelos comparables provienen de su documentacion publica; para este modelo concreto no se dispone del dato. La comparativa se limita a tamano, licencia y disponibilidad en GGUF, ya que no hay benchmarks publicados de esta cuantizacion.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card. Al derivar de Qwen2-VL, hereda los sesgos del dataset de entrenamiento original, no auditados en este ajuste fino.
- Riesgo de alucinacion: alto en tareas de descripcion de imagenes o lectura de texto en documentos, especialmente con cuantizaciones Q2_K y Q3_K, donde la degradacion es mas acusada al no haber imatrix.
- Limitaciones de contexto o idioma: la model card solo declara ingles; el uso en castellano no esta garantizado y probablemente degrade la calidad. La longitud de contexto no se especifica en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el ajuste fino original (xhwang00/Qwen2-VL-2B-eyesutral) mantiene la misma licencia y no impone restricciones adicionales.
- Caveat para produccion: la cuantizacion es estatica y sin imatrix, por lo que se recomienda validar la calidad en el caso de uso concreto antes de desplegar. Para tareas que requieran precision alta (por ejemplo, lectura de texto pequeno en imagenes), usar Q6_K o Q8_0 como minimo.
- El nombre "eyesutral" no esta documentado: no se puede confirmar que el modelo este realmente especializado en imagenes oculares ni que haya sido validado clinicamente. No usar en contextos medicos sin evaluacion propia.
- El repositorio tiene 179 descargas y 0 likes en el momento de la consulta, lo que indica poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen2-VL-2B-eyesutral-GGUF
- Modelo base: https://huggingface.co/xhwang00/Qwen2-VL-2B-eyesutral
- Pagina de overview del autor: https://hf.tst.eu/model#Qwen2-VL-2B-eyesutral-GGUF
- Repositorio de peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Documentacion oficial de Qwen2-VL (Alibaba): no disponible en la informacion proporcionada

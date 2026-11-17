# mradermacher/airoboros-110b-3.3-GGUF

## Resumen

Airoboros-110B-3.3-GGUF es la distribucion en formato GGUF del modelo jondurbin/airoboros-110b-3.3, un ajuste fino supervisado y con DPO sobre Qwen1.5-110B. La publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face que distribuye versiones estaticas (no imatrix) de modelos grandes para su uso con llama.cpp y derivados. El modelo base es un transformer denso de 111.209.914.368 parametros (aproximadamente 110B) desarrollado por Jon Durbin dentro de la familia Airoboros, orientada a instrucciones, razonamiento, roleplay y function calling.

El interes practico de esta publicacion es que permite ejecutar un modelo de 110B en hardware de consumo o en servidores modestos mediante cuantizacion agresiva: la variante Q2_K ocupa 41,3 GB y la Q4_K_M 67,3 GB, frente a los aproximadamente 220 GB que requeriria en fp16. La licencia declarada es tongyi-qianwen (la de Qwen1.5-110B), lo que implica obligaciones de atribucion y condiciones de uso comercial que conviene revisar antes de desplegarlo en produccion.

La relevancia actual es limitada pero especifica: se trata de un modelo de finales de 2024 (publicado el 3 de diciembre de 2024) que sigue siendo util para experimentacion con modelos de gran tamano en local, evaluacion de tecnicas de cuantizacion extrema y tareas de generacion creativa o conversacional en ingles. No es un modelo puntero en benchmarks, pero su tamano y su ajuste orientado a instrucciones lo mantienen como referencia para comparativas de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen1.5-110B) |
| Parametros totales | 111.209.914.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | tongyi-qianwen (license_link a Qwen1.5-110B) |
| Formato de pesos | GGUF (multi-parte en cuantizaciones grandes) |

## Arquitectura y entrenamiento

El modelo base es Qwen1.5-110B, un transformer denso de la familia Qwen1.5 de Alibaba, con atencion multi-cabeza estandar y sin mezcla de expertos. Sobre el se aplico el pipeline de Airoboros 3.3, que combina ajuste supervisado (SFT) y optimizacion por preferencias (DPO). Los datasets declarados en la model card incluyen jondurbin/airoboros-3.2, bluemoon-fandom-1-1-rp-cleaned, boolq, jondurbin/gutenberg-dpo-v0.1, LDJnr/Capybara, jondurbin/cinematika-v0.1, glaiveai/glaive-function-calling-v2, grimulkan/LimaRP-augmented, piqa, Vezora/Tested-22k-Python-Alpaca, mattpscott/airoboros-summarization y unalignment/toxic-dpo-v0.2. La mezcla cubre instrucciones generales, razonamiento, roleplay, function calling, codigo Python y resumen.

Esta publicacion concreta no es un reentrenamiento, sino una conversion a GGUF del checkpoint original. mradermacher aplica cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) sin pesos imatrix; para versiones con imatrix remite a mradermacher/airoboros-110b-3.3-i1-GGUF. No se documentan en la informacion disponible detalles adicionales sobre el numero de tokens de entrenamiento, la composicion exacta de la mezcla ni hiperparametros de DPO. Tampoco se menciona ninguna innovacion arquitectonica especifica mas alla de las propias de Qwen1.5.

## Capacidades

- Generacion de texto en ingles con ajuste a instrucciones, incluyendo respuestas conversacionales multi-turno.
- Razonamiento de sentido comun y tareas de conocimiento general, apoyado por la mezcla de datasets de QA (boolq, piqa).
- Generacion de codigo, en particular Python, gracias a Vezora/Tested-22k-Python-Alpaca.
- Function calling y tool calling, por la inclusion de glaiveai/glaive-function-calling-v2 en el entrenamiento.
- Roleplay y narrativa creativa, con datasets especificos de ficcion y personajes (bluemoon-fandom, LimaRP-augmented, cinematika).
- Resumen de documentos, por mattpscott/airoboros-summarization.
- Capacidades multilingues: limitadas al ingles segun el campo language de la model card.
- No se documentan capacidades de vision, audio, thinking mode ni agentes multi-paso nativos en la informacion disponible.

## Casos de uso

- Experimentacion con cuantizacion extrema en local: la variante Q2_K (41,3 GB) permite cargar un modelo de 110B en estaciones de trabajo con 48 GB de VRAM o en configuraciones con offload a RAM, util para estudiar la degradacion de calidad frente a Q8_0 (118,3 GB).
- Generacion creativa y roleplay en ingles: el ajuste sobre datasets de ficcion y personajes (LimaRP-augmented, bluemoon-fandom) lo hace adecuado para asistentes narrativos y simulacion de personajes en entornos de investigacion.
- Prototipado de asistentes conversacionales en ingles: su ajuste a instrucciones y su capacidad multi-turno permiten construir demos de chatbot sin depender de APIs externas, siempre que el hardware lo permita.
- Evaluacion de function calling: al haberse entrenado con glaive-function-calling-v2, sirve para probar pipelines de tool calling con llama.cpp y comparar su comportamiento con modelos mas pequenos.
- Generacion asistida de codigo Python en entornos controlados: util para tareas de autocompletado o generacion de scripts donde no se requiera el estado del arte, con la ventaja de ejecucion local.
- Resumen de documentos largos en ingles: el dataset de summarization sugiere un ajuste especifico, aprovechable para resumir articulos o informes en pipelines por lotes.
- Comparativas de cuantizacion: como referencia para medir perplejidad y calidad percibida entre Q2_K, Q4_K_M y Q8_0 en un modelo de gran tamano, gracias a la disponibilidad de todas las variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto y KV cache):
  - Q2_K: 41,3 GB de pesos; con contexto moderado, en torno a 45-50 GB.
  - Q3_K_M: 53,8 GB; Q3_K_L: 58,2 GB.
  - IQ4_XS: 60,3 GB; Q4_K_S: 63,6 GB; Q4_K_M: 67,3 GB.
  - Q5_K_M: 78,9 GB; Q6_K: 91,3 GB; Q8_0: 118,3 GB.
- GPU recomendadas: A100 80 GB o H100 80 GB para Q4_K_M en adelante sin offload; para Q2_K y Q3 puede bastar una RTX 6000 Ada (48 GB) o una configuracion multi-GPU.
- En GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB) sin offload parcial a RAM del sistema; con offload es viable pero con latencia alta.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los archivos multi-parte requieren concatenacion previa segun las instrucciones de TheBloke referenciadas en la model card. Para el checkpoint original en safetensors, vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| airoboros-110b-3.3-GGUF (este) | 111,2B | no disponible | tongyi-qianwen | GGUF | Cuantizaciones estaticas, sin imatrix |
| airoboros-110b-3.3-i1-GGUF | 111,2B | no disponible | tongyi-qianwen | GGUF | Mismo modelo con cuantizaciones imatrix/weighted |
| jondurbin/airoboros-110b-3.3 | 111,2B | no disponible | tongyi-qianwen | safetensors | Checkpoint original en precision completa |
| Qwen1.5-110B | 110B | no disponible | tongyi-qianwen | safetensors | Modelo base sin ajuste de instrucciones |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado y declarado unicamente para ingles; su rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Licencia: la licencia tongyi-qianwen impone condiciones especificas para uso comercial; es imprescindible revisar el LICENSE de Qwen1.5-110B antes de desplegar en produccion.
- Cuantizacion agresiva: las variantes Q2_K y Q3_K_S degradan notablemente la calidad; la propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S o Q4_K_M para uso practico.
- Alucinacion: como todo modelo de lenguaje de su generacion, puede generar contenido factualmente incorrecto, especialmente en tareas de conocimiento especializado.
- Sesgos: la mezcla incluye datasets de roleplay y de preferencias (toxic-dpo-v0.2) que pueden introducir sesgos de estilo y contenido; no se documentan evaluaciones de sesgo.
- Contexto: no se especifica la longitud de contexto soportada en la informacion disponible, lo que dificulta planificar casos de uso con documentos largos.
- Tamano: requiere hardware de gama alta o configuraciones con offload; no es apto para despliegue en una sola GPU de consumo.
- Mantenimiento: el repositorio tiene muy pocas descargas (59) y ningun like, lo que sugiere poca validacion comunitaria sobre estas cuantizaciones concretas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/airoboros-110b-3.3-GGUF
- Modelo base: https://huggingface.co/jondurbin/airoboros-110b-3.3
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/airoboros-110b-3.3-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#airoboros-110b-3.3-GGUF
- Licencia Qwen1.5-110B: https://huggingface.co/Qwen/Qwen1.5-110B/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests

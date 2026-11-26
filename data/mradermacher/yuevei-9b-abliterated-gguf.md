# mradermacher/yuevei-9b-abliterated-GGUF

## Resumen

yuevei-9b-abliterated-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo yuevei-9b-abliterated, publicada por el usuario mradermacher. El modelo base, alojado por psephos, es una variante "abliterated" de un modelo de 9B parametros, una tecnica de modificacion de pesos que elimina o atenua las direcciones de rechazo aprendidas durante el alineamiento, de modo que el modelo responde a peticiones que un modelo alineado convencionalmente declinaria. El repositorio es exclusivamente de cuantizaciones estaticas generadas con llama.cpp a partir de los pesos en formato Hugging Face del modelo original.

La relevancia de esta ficha es acotada y conviene ser explicito: se trata de un artefacto derivado, sin model card tecnica propia, sin licencia declarada, sin idiomas declarados y sin resultados de benchmarks publicados. El unico dato duro verificable es el numero de parametros del modelo original (8.953.803.264, es decir, aproximadamente 8,95 mil millones), lo que situa al modelo en la clase de 9B. Todo lo demas (arquitectura concreta, contexto, dataset de entrenamiento, proceso de abliteration) no esta documentado en la informacion disponible y no debe inferirse.

El interes practico del repositorio es la disponibilidad de un juego amplio de cuantizaciones (desde Q2_K hasta F16, incluyendo IQ4_XS) que permiten ejecutar un modelo de 9B en hardware de consumo, con el caveat importante de que al carecer de licencia explicita su uso comercial es juridicamente incierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de ~9B; familia no documentada) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo original en safetensors |
| Tamano del repositorio | 24,8 GB |
| Etiquetas | gguf, endpoints_compatible, region:us, conversational |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo base en la documentacion proporcionada. Por el numero de parametros (8,95B) y por el formato de publicacion (conversion desde pesos Hugging Face a GGUF con `convert_type: hf`), se trata de un transformer decoder-only de la clase 9B, pero no se especifica si usa atencion completa, atencion con ventana deslizante, GQA ni la dimension de sus capas. Tampoco se documenta el tokenizador ni el vocabulario.

Respecto al entrenamiento, no se dispone de datos sobre el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO o similares. La unica informacion tecnica relevante es que el modelo ha sido sometido a un proceso de *abliteration*: una modificacion post-entrenamiento que identifica y proyecta fuera las direcciones de activacion asociadas al rechazo, de forma que el modelo pierde parte de su comportamiento de negativa ante ciertas peticiones. El repositorio de mradermacher no documenta la metodologia concreta aplicada por psephos ni el grado de abliteration conseguido.

Las cuantizaciones se han generado con la herramienta de cuantizacion de llama.cpp (se indica `quantize_version: 2` y `output_tensor_quantised: 1`), e incluyen tanto cuantizaciones K-quant clasicas como una variante IQ4_XS de la familia i-quant.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como `conversational`, lo que sugiere un modelo ajustado para dialogo, aunque no se detalla el formato de prompt ni la plantilla de chat.
- Respuesta a peticiones que modelos alineados rechazan: consecuencia directa del proceso de abliteration, sin que se documente el alcance exacto.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse mediante la infraestructura de Inference Endpoints de Hugging Face y, por extension, con servidores compatibles con la API de OpenAI.
- Inferencia local via llama.cpp: todas las cuantizaciones estan en GGUF, por lo que son ejecutables con llama.cpp, Ollama, LM Studio y otros runtimes compatibles.
- Capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling o agentes: no disponibles. No hay informacion que permita afirmar ni negar su soporte.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo sirve como material de estudio para analizar como la abliteration altera la distribucion de respuestas y que tipos de peticiones dejan de rechazarse, comparandolo con el modelo base alineado.
- Pruebas de robustez de filtros de contenido: desplegar el modelo como generador adversarial controlado para evaluar si los clasificadores de entrada y salida de un pipeline de produccion detectan contenido que un modelo convencional no produciria.
- Red teaming interno en entorno aislado: uso en laboratorios de seguridad para generar muestras de texto que alimenten conjuntos de evaluacion de moderacion, sin exposicion a usuarios finales.
- Experimentacion con cuantizaciones en hardware de consumo: el abanico de cuantizaciones (de Q2_K a F16) permite medir el impacto de la precision en la calidad de las respuestas de un modelo de 9B en GPUs de 8 a 24 GB de VRAM.
- Evaluacion de runtimes de inferencia: util como banco de pruebas para comparar throughput y perplejidad entre llama.cpp, Ollama y servidores compatibles con la API de OpenAI sobre un mismo modelo.
- Desarrollo de prototipos de chat local sin conexion: para aplicaciones de escritorio o embebidas donde se necesita un modelo conversacional de 9B ejecutandose en local, siempre que se resuelva antes la cuestion de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ninguna otra metrica, ni comparaciones con el modelo base alineado que permitan cuantificar el coste de la abliteration en capacidad.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y overhead de contexto): Q2_K en torno a 3,5-4 GB; Q3_K_M en torno a 4,5-5 GB; Q4_K_M en torno a 5,5-6 GB; Q5_K_M en torno a 6,5-7 GB; Q6_K en torno a 7,5-8 GB; Q8_0 en torno a 9,5-10 GB; F16 en torno a 18 GB.
- GPU recomendadas: para Q4_K_M y Q5_K_M, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente; para Q8_0, una RTX 4070 Ti Super, RTX 4080 o RTX 4090; para F16, una RTX 4090 de 24 GB o GPUs de datacenter como A100 40 GB o H100.
- Cabe en GPU de consumo: si, en todas las cuantizaciones hasta Q8_0 con GPUs de 12 GB o mas; las cuantizaciones Q2_K a Q4_K_S caben en GPUs de 6-8 GB con contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI (por la etiqueta `endpoints_compatible`), y TGI o vLLM solo si se dispone de los pesos en safetensors del modelo original.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica la familia del modelo base ni ofrece puntos de comparacion con alternativas de la misma clase. Cualquier comparacion con modelos de 9B de otros autores (por ejemplo, variantes de Llama, Gemma o Qwen de tamano similar) seria especulativa y no se incluye.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, lo que impide determinar si el uso comercial esta permitido. En la practica, esto bloquea su adopcion en produccion sin aclaracion previa por parte del autor.
- Modelo abliterated: la eliminacion de las direcciones de rechazo implica que el modelo puede generar contenido danino, ilegal o sexualmente explicito. No debe desplegarse de cara al publico sin filtros externos robustos.
- Ausencia de model card tecnica: no se documentan arquitectura, contexto, idiomas ni formato de prompt, lo que dificulta la integracion fiable en aplicaciones.
- Riesgo de degradacion por abliteration: es habitual que este tipo de modificaciones reduzca ligeramente la coherencia y la calidad en tareas de razonamiento; no hay datos publicados que lo cuantifiquen en este caso.
- Riesgo de alucinacion: no evaluado. Sin benchmarks no puede caracterizarse.
- Idiomas: desconocidos. No hay garantia de un rendimiento aceptable en castellano.
- Procedencia y trazabilidad: el modelo base lo publica un tercero (psephos) y las cuantizaciones las genera mradermacher; conviene verificar la cadena de custodia de los pesos originales antes de cualquier uso serio.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de que los fallos hayan sido detectados y reportados por la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/yuevei-9b-abliterated-GGUF
- Modelo base: https://huggingface.co/psephos/yuevei-9b-abliterated
- llama.cpp (runtime y herramienta de cuantizacion): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai

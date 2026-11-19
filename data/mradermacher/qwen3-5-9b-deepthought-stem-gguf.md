# mradermacher/Qwen3.5-9B-DeepThought-STEM-GGUF

## Resumen
Qwen3.5-9B-DeepThought-STEM-GGUF es la version cuantizada en formato GGUF del modelo xtools-at/Qwen3.5-9B-DeepThought-STEM, un ajuste fino (fine-tuning) sobre la familia Qwen3.5 de 9.197.093.888 parametros (aproximadamente 9,2 mil millones). El modelo base parte de la arquitectura Qwen3.5 y ha sido especializado mediante SFT y destilacion de trazas de razonamiento en dominios STEM: matematicas, ciencia, descubrimiento de farmacos y formulacion farmaceutica. El encargado de la cuantizacion es mradermacher, un perfil conocido en Hugging Face por publicar versiones GGUF de modelos populares para su uso con llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en que ofrece un modelo de razonamiento cientifico de ~9B parametros en formatos que caben en GPU de consumo, con licencia Apache 2.0 y una orientacion clara hacia tareas academicas y de investigacion farmaceutica. El modelo incorpora ademas etiquetas que indican un proceso de "abliteration" o decensurado (heretic, uncensored, decensored, abliterated), lo que implica que se han relajado los filtros de rechazo del modelo original, un aspecto critico a evaluar antes de usarlo en produccion.

El repositorio GGUF incluye una amplia gama de cuantizaciones estaticas (desde Q2_K hasta f16) y archivos mmproj, lo que sugiere soporte multimodal (vision) en el modelo base. El tamano total del repositorio es de 85,1 GB, y cuenta con 2.436 descargas y 2 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), segun tags del modelo; detalles internos no disponibles |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento
El modelo base xtools-at/Qwen3.5-9B-DeepThought-STEM se construye sobre la arquitectura Qwen3.5, un transformer decoder-only de aproximadamente 9,2B parametros. El ajuste fino se realizo mediante SFT (supervised fine-tuning) y destilacion de trazas de razonamiento (reasoning traces) procedentes de varios datasets, entre ellos Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x, Xiaomi-MiMo-2.6-Pro-High-Reasoning-250x, ChatGPT-6.1-Terra-High-Reasoning-TraceInversion-80x, GPT-5.6-luna-reasoning-102881x, GLM-5.1-Reasoning-1M-Cleaned, GLM-5.1-1000000x, red-pill-drug-discovery-formulation-synthetic-reasoning, red-pill-drug-discovery-formulation y smoltalk2. Esta combinacion sugiere un entrenamiento orientado a imitar cadenas de razonamiento largas en dominios cientificos y farmaceuticos, ademas de conversacion general.

El modelo incorpora tecnicas de PEFT/LoRA (segun los tags lora y peft) y ha pasado por un proceso de "abliteration" o decensurado (tags heretic, uncensored, decensored, abliterated), que tipicamente consiste en modificar o eliminar direcciones de activacion asociadas a rechazos de seguridad. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas como RLHF o DPO mas alla del SFT y la destilacion. Tampoco se detalla si se empleo decodificacion especulativa o attention linear.

## Capacidades
- Generacion de texto y razonamiento multi-paso, con enfasis en dominios STEM (matematicas, ciencia, farmacologia).
- Razonamiento matematico y cientifico, segun los tags mathematics, science, stem y scientific-reasoning.
- Capacidades de descubrimiento de farmacos y formulacion farmaceutica (tags drug-discovery, pharmaceutical-formulation, pharmaceutics).
- Soporte multimodal: la presencia de archivos mmproj-Q8_0 y mmproj-f16 indica capacidad de vision (proyeccion de imagen) en el modelo base.
- Conversacion multi-turno (tag conversational).
- Compatibilidad con text-generation-inference y endpoints compatibles (tag endpoints_compatible).
- Modelo decensurado/abliterated: menor tendencia a rechazar peticiones, lo que puede ser util para investigacion pero riesgoso en produccion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explicita, aunque el enfasis en reasoning sugiere cierta capacidad.
- Capacidades multilingues: limitadas al ingles (language: en).

## Casos de uso
- Investigacion en descubrimiento de farmacos: el modelo puede generar hipotesis y razonamientos sobre formulacion farmaceutica y quimica medicinal, aprovechando los datasets especificos de drug-discovery incluidos en su entrenamiento.
- Asistencia en formulacion farmaceutica: apoyo a la redaccion de protocolos, calculos de excipientes y razonamiento sobre estabilidad de formulaciones, adecuado por su especializacion en pharmaceutics.
- Tutoria academica en STEM: explicacion paso a paso de problemas de matematicas y ciencia, gracias a las trazas de razonamiento destiladas de modelos de alto rendimiento.
- Generacion de codigo cientifico: el modelo puede asistir en la escritura de scripts de analisis de datos o simulaciones, aunque no se confirma soporte explicito de tool calling.
- Despliegue en entornos con GPU de consumo: las cuantizaciones Q4_K_M (5,9 GB) y Q5_K_M (6,7 GB) permiten ejecutar el modelo en tarjetas graficas de 8-12 GB de VRAM mediante llama.cpp u Ollama, ideal para prototipado local.
- Analisis de documentos cientificos con imagenes: gracias a los archivos mmproj, puede procesar figuras y tablas de papers en tareas de extraccion o interpretacion, si se usa con el proyector multimodal adecuado.
- Generacion de datasets sinteticos de razonamiento: util para crear trazas de razonamiento en dominios cientificos que alimenten otros entrenamientos, dado su enfoque en reasoning y su licencia permisiva.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,0 GB
  - Q3_K_M: ~4,8 GB
  - IQ4_XS: ~5,5 GB
  - Q4_K_S: ~5,6 GB
  - Q4_K_M: ~5,9 GB
  - Q5_K_M: ~6,7 GB
  - Q6_K: ~7,7 GB
  - Q8_0: ~9,9 GB
  - f16: ~18,5 GB
- GPU recomendadas: para Q4_K_M, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente; para Q8_0, una RTX 4070 Ti Super de 16 GB o RTX 4090 de 24 GB; para f16, una A100 de 40 GB o H100.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM usando cuantizaciones Q4 o inferiores; con 12 GB se puede usar Q5_K_M o Q6_K con contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (para el modelo base en safetensors), y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-DeepThought-STEM (este) | ~9,2B | no disponible | Apache 2.0 | GGUF, safetensors | Especializado en STEM y farmacia, decensurado |
| Qwen2.5-7B-Instruct | ~7,6B | 32K (tipico) | Apache 2.0 | safetensors, GGUF | Modelo generalista, no especializado en STEM |
| Llama 3.1 8B Instruct | ~8B | 128K | Llama 3.1 Community License | safetensors, GGUF | Generalista, licencia restrictiva para algunos usos |
| Mistral 7B Instruct | ~7,3B | 32K | Apache 2.0 | safetensors, GGUF | Generalista, sin enfoque cientifico |

Nota: los datos de contexto y rendimiento de los modelos comparados son orientativos y no provienen de la informacion proporcionada; se incluyen solo como referencia de categoria. No se dispone de benchmarks comparativos directos.

## Limitaciones y advertencias
- Sesgos conocidos: al ser un modelo decensurado/abliterated, puede generar contenido sin los filtros de seguridad habituales, lo que aumenta el riesgo de respuestas sesgadas, ofensivas o inseguras.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede inventar referencias, datos cientificos o resultados experimentales; en dominios como farmacia, esto es especialmente peligroso y requiere validacion humana.
- Limitaciones de contexto o idioma: solo soporta ingles (language: en); no se especifica la longitud de contexto, lo que impide planificar tareas de contexto largo con garantias.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el proceso de abliteration puede violar las politicas de uso de modelos derivados; revisar terminos del modelo base Qwen3.5.
- Caveat para produccion: el modelo esta especializado en STEM y farmacia, por lo que su rendimiento en tareas generales puede ser inferior al de modelos generalistas del mismo tamano; ademas, la falta de benchmarks publicos impide una evaluacion objetiva.
- El repositorio GGUF tiene solo 2 likes y 2.436 descargas, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces
- Hugging Face (GGUF): https://huggingface.co/mradermacher/Qwen3.5-9B-DeepThought-STEM-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.5-9B-DeepThought-STEM-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-9B-DeepThought-STEM-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Reflexiones sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

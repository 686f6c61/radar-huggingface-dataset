# mradermacher/Pratham-1B-Instruct-GGUF

## Resumen
Pratham-1B-Instruct-GGUF es la distribucion en formato GGUF del modelo Pratham-1B-Instruct, desarrollado originalmente por el usuario oncody y cuantizado por mradermacher. Se trata de un modelo conversacional de 1.304.558.336 parametros (aproximadamente 1,3 mil millones) afinado a partir de un modelo base no identificado en la informacion disponible, y entrenado para instrucciones usando el dataset databricks/databricks-dolly-15k. Su proposito es ofrecer un modelo pequeno, ligero y ejecutable en hardware de consumo para tareas de generacion de texto conversacional en ingles.

La relevancia de esta ficha reside en su formato de distribucion: al estar disponible en GGUF con 12 cuantizaciones distintas (desde Q2_K de 0,6 GB hasta f16 de 2,7 GB), permite desplegar el modelo en CPU, GPUs modestas y dispositivos con poca VRAM mediante llama.cpp y ecosistemas compatibles. El modelo esta etiquetado con licencia lfm1.0 (Liquid Foundation Model 1.0), lo que condiciona su uso comercial.

No se dispone de informacion sobre la longitud de contexto, la arquitectura interna detallada ni los datos de entrenamiento mas alla del dataset de instrucciones citado. La informacion publicada es escasa y se limita practicamente a los metadatos de la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de tipo causal, inferido del pipeline conversacional y del formato GGUF; no confirmado en la informacion) |
| Parametros totales | 1.304.558.336 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (Liquid Foundation Model 1.0) |
| Formato de pesos | GGUF (safetensors en el modelo base oncody/Pratham-1B-Instruct) |

## Arquitectura y entrenamiento
No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Por el pipeline conversacional, el formato GGUF y el tamano de 1,3 mil millones de parametros, se trata de un modelo de lenguaje causal orientado a instrucciones, pero no se confirma si emplea atencion estandar, atencion lineal u otras variantes. Tampoco se especifica el numero de capas, dimensiones ocultas ni el vocabulario.

En cuanto al entrenamiento, la unica informacion disponible indica que se uso el dataset databricks/databricks-dolly-15k para el ajuste a instrucciones. No se detalla el numero de tokens de preentrenamiento, la composicion del corpus base, ni si se aplicaron tecnicas de RLHF, DPO o similares. El modelo base original (oncody/Pratham-1B-Instruct) no aporta mas metadatos en la informacion suministrada.

## Capacidades
- Generacion de texto conversacional en ingles, orientada a instrucciones y dialogos multi-turno.
- Respuesta a instrucciones generales derivadas del ajuste con databricks-dolly-15k (preguntas y respuestas, resumen, clasificacion, generacion creativa basica).
- Formato compatible con endpoints y con la libreria transformers, ademas de GGUF para inferencia local.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso explicito.
- No se confirma capacidad multilingue mas alla del ingles.
- No se confirman capacidades de vision, audio ni modo de razonamiento (thinking mode).

## Casos de uso
- Prototipado rapido de asistentes conversacionales en local: el modelo, con 1,3 mil millones de parametros y cuantizaciones de 0,6 a 1,5 GB, permite levantar un chatbot funcional en un portatil sin GPU dedicada usando llama.cpp u Ollama.
- Educacion y experimentacion: sirve como banco de pruebas para estudiar el efecto de distintas cuantizaciones (Q2_K frente a Q8_0) en la calidad de las respuestas, dado que el autor publica 12 variantes del mismo modelo.
- Generacion de respuestas a preguntas frecuentes en ingles: su ajuste con dolly-15k cubre tareas de QA cerrada, adecuado para bases de conocimiento simples en entornos de demo.
- Resumen y reescritura de textos cortos: el modelo puede emplearse en pipelines de preprocesamiento donde el coste computacional es critico y no se requiere maxima calidad.
- Clasificacion y etiquetado ligero de texto: tareas de categorizacion simple en ingles que no exijan contexto largo.
- Despliegue en dispositivos de borde (edge): al caber en menos de 1 GB en Q4_K_S, es viable en Raspberry Pi, moviles con llama.cpp o contenedores con memoria limitada.
- Filtrado o generacion de texto en entornos aislados sin conexion, gracias a la distribucion GGUF y la ausencia de dependencias de API.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 0,6 GB en Q2_K, 0,9 GB en Q4_K_M, 1,5 GB en Q8_0 y 2,7 GB en f16, segun los tamanos de archivo publicados por el autor.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060) es suficiente para las cuantizaciones bajas y medias. Para f16 se recomienda al menos 4 GB de VRAM.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, e incluso en iGPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El modelo base en safetensors puede cargarse con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano, se espera inferencia en tiempo real en CPU moderna y muy rapida en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Pratham-1B-Instruct-GGUF | 1.304.558.336 | no disponible | lfm1.0 | GGUF | Hugging Face (mradermacher) |
| TinyLlama-1.1B-Chat | ~1,1 B | 2.048 tokens (segun su model card publica) | Apache 2.0 | safetensors, GGUF | Hugging Face |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 tokens (segun su model card publica) | Apache 2.0 | safetensors, GGUF | Hugging Face |

La comparativa se limita a datos publicos de los modelos alternativos; no se dispone de benchmarks de Pratham-1B-Instruct que permitan una comparacion de rendimiento objetiva. En terminos de licencia, Pratham emplea lfm1.0, mas restrictiva que las licencias Apache 2.0 de TinyLlama y Qwen2.5.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados; al entrenarse con dolly-15k, puede heredar sesgos de ese dataset, pero no hay analisis publicado.
- Riesgo de alucinacion: alto esperable por el tamano reducido (1,3 B) y la falta de datos de evaluacion; no hay estudios que lo cuantifiquen.
- Limitaciones de contexto e idioma: solo se declara soporte de ingles y no se publica la longitud de contexto, lo que impide garantizar dialogos largos.
- Restricciones de licencia: la licencia lfm1.0 (Liquid Foundation Model 1.0) puede imponer condiciones al uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de desplegarlo en produccion.
- Caveats para produccion: informacion de model card muy escasa, sin benchmarks, sin detalles de arquitectura ni de entrenamiento; no recomendable para casos de uso criticos sin evaluacion previa.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/Pratham-1B-Instruct-GGUF
- Modelo base: https://huggingface.co/oncody/Pratham-1B-Instruct
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Pratham-1B-Instruct-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests

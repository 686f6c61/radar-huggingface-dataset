# mradermacher/LFM2.5-1.2B-Wolof-Instruct-GGUF

## Resumen

Esta ficha describe `mradermacher/LFM2.5-1.2B-Wolof-Instruct-GGUF`, una cuantizacion en formato GGUF del modelo `mamelles/LFM2.5-1.2B-Wolof-Instruct`, publicada por el usuario mradermacher (responsable de un catalogo extenso de cuantizaciones comunitarias). No se trata de un modelo entrenado desde cero, sino de una conversion de pesos a GGUF en doce variantes de precision, pensada para ejecucion local en llama.cpp y derivados.

El modelo base pertenece, por nomenclatura, a la familia LFM2.5 (Liquid Foundation Models) de Liquid AI y lleva el sufijo `Wolof-Instruct`, lo que sugiere un ajuste supervisado orientado a instrucciones en wolof. Sin embargo, la model card facilitada no documenta arquitectura, contexto, licencia ni composicion del dataset, por lo que esos extremos quedan como no disponibles. El repositorio declara un total de 1.316.289.280 parametros (aproximadamente 1,32 mil millones) segun los metadatos de safetensors.

Su relevancia practica es acotada pero clara: permite desplegar un modelo conversacional de poco mas de mil millones de parametros en hardware muy modesto (desde 0,6 GB en Q2_K hasta 2,7 GB en f16), sin dependencia de infraestructura en la nube. El interes principal esta en la combinacion de tamano reducido, posibilidad de ejecucion en CPU y el enfoque multilingue de bajos recursos que insinua el nombre del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (la nomenclatura apunta a la familia LFM2.5 de Liquid AI, sin confirmar) |
| Parametros totales | 1.316.289.280 (aproximadamente 1,32 B, dato de safetensors) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | etiquetado oficialmente como `en`; el nombre del modelo base indica ajuste para wolof, no confirmado |
| Licencia | no disponible |
| Formato de pesos | GGUF (el campo `library_name` del repo indica `transformers`; los ficheros son GGUF) |
| Tamano del repositorio | 11,9 GB (incluye todas las variantes de cuantizacion) |
| Fecha de creacion | 2026-09-18 |
| Ultima actualizacion | 2026-09-18 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion facilitada. Los metadatos de la cuantizacion indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, una conversion desde pesos Hugging Face con cuantizacion por tensor y la segunda generacion del pipeline de cuantizacion de mradermacher. No se documenta si el modelo emplea atencion estandar, atencion lineal, convoluciones hibridas u otro esquema.

Tampoco se detallan los datos de entrenamiento: numero de tokens, composicion del corpus, fases de ajuste (SFT, RLHF, DPO) o cualquier innovacion tecnica asociada. El sufijo `Instruct` del modelo base indica que ha pasado por algun tipo de ajuste por instrucciones, y el sufijo `Wolof` apunta a un corpus especifico en esa lengua, pero ninguno de estos extremos esta respaldado por informacion verificable en la model card consultada. Se recomienda acudir a la ficha del modelo original `mamelles/LFM2.5-1.2B-Wolof-Instruct` para obtener estos detalles.

## Capacidades

- Generacion de texto conversacional: la model card clasifica el modelo con la etiqueta `conversational`, lo que apunta a uso en dialogos multi-turno.
- Ajuste por instrucciones: el sufijo `Instruct` indica que responde a comandos en formato de instrucciones, aunque no se especifica el formato de plantilla exacto.
- Capacidad multilingue potencial: el modelo base lleva el identificador `Wolof`, lo que sugiere competencia en wolof, pero la etiqueta de idioma del repositorio es unicamente `en` y no hay confirmacion de cobertura multilingue real.
- Ejecucion local en hardware modesto: gracias a las cuantizaciones de 0,6 a 2,7 GB, es viable en CPU y en GPU de gama baja.
- Compatibilidad con `endpoints_compatible`: la etiqueta sugiere que puede servirse mediante infraestructura compatible con la API de endpoints de Hugging Face.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Asistente conversacional en wolof en entornos sin conectividad: el modelo esta ajustado sobre un corpus de esa lengua y pesa menos de 1 GB en Q4_K_M, por lo que puede desplegarse en un portatil o un mini-PC sin GPU para atender a usuarios de comunidades con acceso limitado a servicios en la nube.
- Prototipado rapido de aplicaciones de chat: con 0,9 GB en Q4_K_S puede cargarse en memoria en segundos, lo que permite iterar sobre plantillas de prompt y diseno de interfaz antes de invertir en un modelo mayor.
- Generacion de texto de bajo coste en produccion: para tareas de resumido, reformulacion o clasificacion de baja complejidad, el modelo ofrece latencia muy baja al ejecutarse en una sola GPU consumer o incluso en CPU.
- Educacion y preservacion linguistica: traduccion asistida o generacion de materiales en wolof alli donde no existen modelos comerciales con cobertura de esa lengua, con la salvedad de que la calidad no esta validada por benchmarks publicos.
- Desarrollo de agentes embebidos en dispositivos: al ocupar menos de 1 GB cuantizado, es candidato para integrarse en aplicaciones de escritorio, plugins de editor o sistemas de atencion local con recursos limitados.
- Filtrado y preprocesado de datos en pipelines NLP: puede emplearse como clasificador o generador de anotaciones preliminares antes de pasar los datos a un modelo mayor, aprovechando su bajo coste por inferencia.
- Demostraciones offline y entornos air-gapped: al no requerir conexion, encaja en escenarios con restricciones de red o de confidencialidad donde los datos no pueden salir del dispositivo.
- Evaluacion comparativa de cuantizaciones: sus doce variantes (de Q2_K a f16) lo convierten en un banco de pruebas util para medir el impacto de la cuantizacion en la calidad de un modelo de 1,3 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB (Q2_K), 0,9 GB (Q4_K_S y Q4_K_M), 1,0 GB (Q5_K_S y Q5_K_M), 1,2 GB (Q6_K), 1,5 GB (Q8_0) y 2,7 GB (f16) solo para los pesos; hay que sumar el cache KV, cuyo tamano depende del contexto configurado (no disponible).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para todas las variantes, incluidas GTX 1650, RTX 3050, RTX 4060 o superiores. No es necesario hardware de datacenter (A100, H100).
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer de los ultimos ocho anos, y tambien en iGPU con memoria unificada.
- Ejecucion en CPU: viable, especialmente en las cuantizaciones Q4_K_S, Q4_K_M y Q8_0; el modelo completo en f16 ocupa 2,7 GB, asumible en un equipo de escritorio convencional.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y otros clientes compatibles con GGUF. La compatibilidad con vLLM y TGI es limitada para ficheros GGUF y no esta documentada en el repositorio.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparacion se limita a caracteristicas estructurales. Los datos de los modelos alternativos provienen de conocimiento publico general y deberian verificarse en sus fichas oficiales antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Wolof-Instruct (GGUF) | 1,32 B | no disponible | no disponible | GGUF | Ajuste orientado a wolof; sin benchmarks publicos en esta informacion |
| LFM2-1.2B | 1,2 B | no disponible en esta ficha | no disponible | safetensors, GGUF | Modelo base de la familia LFM2 de Liquid AI; requiere verificacion |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (ampliable) | Apache 2.0 | safetensors, GGUF | Alternativa densa multilingue ampliamente soportada por el ecosistema |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Buen soporte de herramientas y contexto largo, con licencia restrictiva para ciertos usos |
| Gemma-2-2B-it | 2,6 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Mayor tamano y mejor calidad general esperada, con licencia con clausulas adicionales |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ningun dato publicado sobre MMLU, HumanEval, GSM8K ni evaluaciones multilingues, por lo que la calidad real del modelo es desconocida.
- Licencia no especificada: la ficha no indica la licencia del modelo base ni de la cuantizacion, lo que impide determinar si el uso comercial esta permitido. Es imprescindible consultar `mamelles/LFM2.5-1.2B-Wolof-Instruct` antes de cualquier despliegue productivo.
- Discrepancia en el etiquetado de idioma: el repositorio declara `en` como unico idioma, mientras que el nombre del modelo base sugiere un ajuste en wolof. No esta claro cual es la cobertura real ni el equilibrio entre ambas lenguas.
- Riesgo de alucinacion: con 1,32 B de parametros, la tasa de invencion de hechos es estructuralmente elevada; cualquier salida factual debe verificarse.
- Ventana de contexto desconocida: no se documenta la longitud maxima de contexto, lo que dificulta dimensionar el cache KV y planificar despliegues con conversaciones largas.
- Cuantizacion estatica sin imatrix: el autor indica que no hay cuantizaciones ponderadas (imatrix) disponibles, por lo que las variantes de baja precision (Q2_K, Q3_K_S) pueden degradar la calidad mas de lo habitual.
- Repositorio sin validacion comunitaria: cero descargas y cero valoraciones en el momento de la consulta, con fechas de creacion y actualizacion separadas por once minutos (2026-09-18), lo que sugiere una publicacion automatizada y no revisada por terceros.
- Formato GGUF orientado a inferencia local: no es adecuado para fine-tuning ni para servir a gran escala con frameworks de alto rendimiento tipo vLLM.
- Sesgos: no documentados. Al no conocerse la composicion del corpus de entrenamiento, no es posible evaluar sesgos de genero, etnia, religion o ideologia.
- Caveat de produccion: al tratarse de una cuantizacion de un modelo pequeno y sin evaluaciones, se recomienda tratar sus salidas como borradores sujetos a supervision humana.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM2.5-1.2B-Wolof-Instruct-GGUF
- Modelo base: https://huggingface.co/mamelles/LFM2.5-1.2B-Wolof-Instruct
- Pagina resumen del cuantizador para este modelo: https://hf.tst.eu/model#LFM2.5-1.2B-Wolof-Instruct-GGUF
- Peticiones de modelos y preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (README de TheBloke, referenciado por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa que financia la cuantizacion: https://www.nethype.de/

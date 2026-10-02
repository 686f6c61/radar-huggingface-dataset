# mradermacher/Marmoka-es-it-Llama-3.1-8B-Instruct-GGUF

## Resumen

Marmoka-es-it-Llama-3.1-8B-Instruct-GGUF es la version cuantizada en formato GGUF del modelo HiTZ/Marmoka-es-it-Llama-3.1-8B-Instruct, publicada por el usuario mradermacher. Se trata de un modelo denso de 8.030.261.312 parametros (8,03 B) especializado en el dominio biomedico, medico y clinico en espanol, construido sobre la arquitectura Llama 3.1-8B-Instruct de Meta mediante un proceso combinado de continual pretraining y fusion (merge) de modelos.

El problema que aborda es la falta de asistentes conversacionales en castellano con cobertura terminologica y de conocimiento clinico; los modelos genericos de Llama 3.1 solo cubren ese dominio de forma parcial y con sesgo hacia el ingles. La variante GGUF anade la posibilidad de ejecutar el modelo en hardware de consumo mediante llama.cpp u Ollama sin necesidad de GPU de datacenter.

El repositorio incluye doce cuantizaciones distintas (desde Q2_K de 3,3 GB hasta f16 de 16,2 GB) y esta etiquetado como compatible con endpoints. La licencia declarada es Apache 2.0 y el unico idioma soportado segun los metadatos es el espanol.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso, derivado de Llama 3.1-8B-Instruct |
| Parametros totales | 8.030.261.312 (8,03 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Espanol (es) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (12 variantes); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1-8B-Instruct: un transformer decoder denso con atencion causal. Sobre esa base, el modelo HiTZ/Marmoka-es-it-Llama-3.1-8B-Instruct se construyo mediante un pipeline de continual pretraining seguido de una fusion (merge) de modelos, segun los tags del repositorio. El tamano final de parametros (8,03 B) coincide con el del modelo base, lo que indica que la adaptacion se hizo sin cambio de topologia ni expansion de capas.

En cuanto a los datos, la model card declara dos conjuntos: HiTZ/Magpie-Llama-3.1-70B-Instruct-Filtered, empleado para generar y filtrar datos de instruccion conversacional, y TsinghuaC3I/UltraMedical, un corpus de dominio medico que aporta el sesgo clinico y biomedico. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO sobre el modelo fusionado. No se documentan innovaciones tecnicas propias (decodificacion especulativa, atencion lineal, SSM) en esta ficha.

## Capacidades

- Generacion de texto conversacional en espanol, con formato de instrucciones (Instruct) y plantilla de chat compatible con Llama 3.
- Conocimiento y terminologia de dominio biomedico, medico y clinico, segun los tags biomedical, medical y clinical.
- Razonamiento multi-turno dentro de una conversacion, ya que el modelo esta etiquetado como conversational.
- Seguimiento de instrucciones y respuestas a preguntas en castellano, con el base Magpie-Llama-3.1-70B-Instruct-Filtered como fuente de datos de instruccion.
- Tool calling o function calling: no documentado en la informacion disponible.
- Capacidades de agente o razonamiento multi-paso explicito: no documentadas.
- Capacidades de vision o audio: no disponibles (modelo exclusivamente de texto).
- Multilingueismo: limitado al espanol segun el campo language del repositorio.

## Casos de uso

- Triaje clinico conversacional: el modelo puede mantener dialogos multi-turno en castellano recogiendo sintomas y antecedentes, y generar un resumen estructurado para revision por personal sanitario. Su ajuste sobre UltraMedical reduce el cambio de idioma y mejora el uso de terminologia clinica frente a Llama 3.1 generico.
- Generacion de informes medicos en espanol: redaccion asistida de borradores de informes, resumenes de historia clinica o notas de evolucion a partir de datos estructurados, con el medico como revisor final.
- Codificacion clinica y normalizacion terminologica: mapeo de descripciones libres de diagnosticos a terminologia controlada (CIE, SNOMED) mediante prompting en espanol, aprovechando el vocabulario biomedico adquirido en el continual pretraining.
- Educacion sanitaria y material para pacientes: traduccion de lenguaje tecnico a explicaciones divulgativas en castellano, con control de tono y nivel de lectura mediante system prompt.
- Soporte a investigacion bibliografica: extraccion de entidades (farmacos, patologias, dosis) de abstracts y articulos en espanol, integrable en pipelines de revision sistematica.
- Despliegue local en entornos con requisitos de privacidad: al ejecutarse en formato GGUF sobre hardware propio, permite procesar datos de pacientes sin enviarlos a APIs externas, siempre que se apliquen las salvaguardas legales correspondientes.
- Prototipado rapido de asistentes verticales de salud: la cuantizacion Q4_K_M (5,0 GB) permite levantar un servicio de prueba en un portatil con GPU de gama media antes de escalar a una version sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los resultados de busqueda proporcionados incluyen cifras de MMLU, HumanEval, GSM8K ni de evaluaciones clinicas especificas para este modelo o para su base HiTZ/Marmoka-es-it-Llama-3.1-8B-Instruct.

## Requisitos de hardware

- El repositorio publica doce cuantizaciones con tamanos de fichero verificables que determinan el consumo minimo de memoria:
- Q2_K: 3,3 GB de pesos. Cabe en GPU de 6 GB VRAM con contexto corto.
- Q3_K_S / Q3_K_M / Q3_K_L: 3,8 / 4,1 / 4,4 GB. Viables en GPUs de 6-8 GB.
- IQ4_XS / Q4_K_S / Q4_K_M: 4,6 / 4,8 / 5,0 GB. Rango recomendado; funcionan en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, y en Mac con memoria unificada de 16 GB o mas.
- Q5_K_S / Q5_K_M: 5,7 / 5,8 GB. Recomendable 8-12 GB de VRAM.
- Q6_K: 6,7 GB. Recomendable 10-12 GB de VRAM.
- Q8_0: 8,6 GB. Recomendable 12-16 GB de VRAM.
- f16: 16,2 GB de pesos. Requiere 24 GB de VRAM (RTX 3090, RTX 4090, A100 40 GB) o memoria unificada equivalente.
- A los pesos hay que sumar la cache KV, cuyo tamano crece linealmente con la longitud de contexto y el numero de secuencias concurrentes; con contexto largo la VRAM necesaria puede superar ampliamente el tamano del fichero.
- GPUs de datacenter (A100, H100, L40S) son utiles para servir f16 o Q8_0 con alta concurrencia; para uso individual, una RTX 4090 o una GPU consumer de 12-16 GB con Q4_K_M cubre la mayoria de escenarios.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, koboldcpp, text-generation-webui y bindings de llama-cpp-python. El repositorio esta etiquetado como endpoints_compatible. vLLM soporta GGUF de forma experimental, pero para produccion de alta concurrencia es preferible partir del modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Idioma principal |
|---|---|---|---|---|---|
| mradermacher/Marmoka-es-it-Llama-3.1-8B-Instruct-GGUF (este) | 8,03 B | no disponible | GGUF (12 cuants) | apache-2.0 declarada | es |
| HiTZ/Marmoka-es-it-Llama-3.1-8B-Instruct | 8,03 B | no disponible | safetensors | apache-2.0 declarada | es |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | no disponible | safetensors | Llama 3.1 Community License | multilingue |
| mradermacher/Llama-3.1-8B-Instruct-Uncensored-Complete-GGUF | 8,03 B (estimado por denominacion) | no disponible | GGUF | no disponible | multilingue |

Nota: no se dispone de resultados de benchmarks comparativos entre estas opciones en la informacion proporcionada, por lo que la comparacion se limita a parametros, formato, idioma y licencia.

## Limitaciones y advertencias

- Modelo de dominio sanitario: no ha sido validado clinicamente ni declarado producto sanitario. Cualquier uso en diagnostico, tratamiento o triaje real debe pasar por revision profesional y cumplir la normativa aplicable (por ejemplo, MDR en la UE).
- Riesgo de alucinacion: como todo modelo de 8 B, puede generar referencias, dosis, interacciones farmacologicas o citas bibliograficas inexistentes con alta fluidez. En dominio medico el impacto de un error de este tipo es critico.
- Sesgos: no hay informacion disponible sobre evaluacion de sesgos de genero, etnia, edad u origen en el modelo o en su base. Los datos de instruccion proceden de un modelo de 70 B filtrado, cuyo sesgo subyacente puede heredarse.
- Idioma: solo espanol segun los metadatos. Se desconoce su comportamiento en catalan, gallego, euskera o variedades del espanol de America; el nombre del modelo sugiere una orientacion es-it no confirmada en la documentacion disponible.
- Contexto: no se especifica la longitud de contexto efectiva del modelo fusionado. No debe asumirse que herede los 128 000 tokens de Llama 3.1 sin verificacion empirica.
- Licencia: el repositorio declara apache-2.0, pero al derivar de Llama 3.1-8B-Instruct arrastra las obligaciones de la Llama 3.1 Community License (atribucion "Built with Llama", condiciones de uso aceptable y clausulas de escala). Conviene revisar la compatibilidad antes de un uso comercial.
- Cuantizaciones bajas: Q2_K, Q3_K y las variantes marcadas como "lower quality" por el propio autor degradan notablemente la coherencia. En dominio clinico no se recomienda bajar de Q4_K_M.
- El autor indica que no hay cuantizaciones ponderadas ni imatrix disponibles en el momento de la publicacion, lo que afecta a la calidad relativa de las cuantizaciones pequenas.
- El repositorio registra 0 descargas y 0 likes en los metadatos consultados, por lo que no existe validacion comunitaria publica de su comportamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Marmoka-es-it-Llama-3.1-8B-Instruct-GGUF
- Modelo base: https://huggingface.co/HiTZ/Marmoka-es-it-Llama-3.1-8B-Instruct
- Dataset de instrucciones: https://huggingface.co/datasets/HiTZ/Magpie-Llama-3.1-70B-Instruct-Filtered
- Dataset medico: https://huggingface.co/datasets/TsinghuaC3I/UltraMedical
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Marmoka-es-it-Llama-3.1-8B-Instruct-GGUF
- Guia de uso de GGUF (referencia citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Modelo equivalente sin cuantizar de otro cuantizador (referencia de la busqueda): https://huggingface.co/mradermacher/Llama-3.1-8B-Instruct-Uncensored-Complete-GGUF
- Modelo Llama 3.1 original: https://dev.meta.ai/llama/models/llama-3

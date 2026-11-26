# bharatgenai/LegalParam

## Resumen

LegalParam es un modelo de lenguaje especializado en dominio juridico desarrollado por BharatGen, un consorcio indio de investigacion en IA generativa. Se trata de un fine-tuning de Param-1-2.9B-Instruct, el modelo base de la familia Param, y esta orientado a tareas conversacionales, pregunta-respuesta y sumarizacion en contextos legales, con soporte para ingles (en) y hindi (hi). Su publicacion responde a la necesidad de herramientas de IA adaptadas al marco legal indio, un dominio donde los modelos generalistas suelen fallar por falta de terminologia especifica y sesgos culturales.

Con 2.860 millones de parametros, el modelo se posiciona en el segmento de pequenos modelos (small language models) desplegables en infraestructura modesta, lo que facilita su adopcion en despachos, departamentos juridicos y administraciones publicas con recursos limitados. La licencia Apache 2.0 permite uso comercial sin restricciones de royalties, un factor relevante para su integracion en productos legales.

La relevancia actual del modelo radica en la combinacion de especializacion vertical (legal), soporte bilingue en dos idiomas de gran volumen de poblacion (ingles e hindi) y un tamano contenido que permite inferencia en GPUs de consumo. No obstante, el acceso esta restringido (gated) en Hugging Face, lo que exige aceptar condiciones antes de descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tuning de Param-1-2.9B-Instruct) |
| Parametros totales | 2.860.673.024 (2.86B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion GGUF/AWQ no publicada) |
| Idiomas soportados | Ingles (en), hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

LegalParam es un fine-tuning supervisado del modelo base Param-1-2.9B-Instruct, que a su vez forma parte de la familia Param de BharatGen, disenada como modelo fundacional para el contexto indio. La arquitectura es un transformer decoder-only con 2.860 millones de parametros, sin componentes MoE (mixture of experts), lo que implica que todos los parametros se activan en cada paso de inferencia. El modelo usa `custom_code` en transformers, lo que indica que requiere cargar codigo personalizado del repositorio para su instanciacion.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset juridico, ni si se aplicaron tecnicas de RLHF o DPO adicionales sobre el fine-tuning supervisado. Los tags del modelo indican especializacion en multiturn, QnA y summarization, lo que sugiere un entrenamiento orientado a dialogos multi-turno y tareas extractivas/generativas sobre documentos legales. El modelo base Param-1-2.9B-Instruct ya incorpora capacidades de instruccion, sobre las que LegalParam anade la especializacion de dominio.

## Capacidades

- Generacion de texto en dominio juridico, con terminologia especializada en el marco legal indio.
- Razonamiento y respuesta a preguntas (QnA) sobre conceptos, normativas y procedimientos legales.
- Conversacion multi-turno (multiturn) para consultas juridicas iterativas.
- Sumarizacion de documentos legales (contratos, sentencias, normativa).
- Soporte bilingue en ingles e hindi, con capacidad de alternar idiomas en una misma conversacion.
- No se ha documentado soporte de tool calling ni function calling en la informacion disponible.
- No se ha documentado soporte explicito de agentes o multi-step reasoning mas alla del dialogo multi-turno.
- No se ha documentado capacidad de vision, audio ni thinking mode.

## Casos de uso

- **Asistencia a ciudadanos en consultas legales basicas**: el modelo puede gestionar conversaciones multi-turno en ingles o hindi para orientar sobre procedimientos administrativos, derechos y obligaciones, reduciendo la carga de atencion primaria en despachos y ONG juridicas.
- **Sumarizacion de contratos y documentos normativos**: integrado en un pipeline de ingestion documental, puede generar resumenes de contratos, sentencias o circulares, acelerando la revision preliminar por parte de abogados.
- **Soporte a departamentos juridicos internos**: como asistente de primera linea para empleados no juristas, respondiendo preguntas frecuentes sobre compliance, politicas internas y normativa aplicable en India.
- **Generacion de borradores de documentos legales**: produccion de plantillas y borradores de escritos, demandas o respuestas, sujetos a revision humana posterior.
- **Formacion y divulgacion juridica**: generacion de material didactico, explicaciones simplificadas de normativa y casos practicos para estudiantes de derecho o formacion corporativa.
- **Atencion al cliente en servicios legales digitales**: integracion en chatbots de plataformas de legaltech para clasificar y responder consultas iniciales, derivando casos complejos a profesionales humanos.
- **Investigacion academica en NLP juridico**: como baseline especializado para experimentos de dominio legal en hindi e ingles, dado su tamano contenido y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 5.7 GB solo para pesos (2.86B parametros x 2 bytes), mas overhead de activaciones y KV cache; en la practica, se recomienda al menos 8-10 GB de VRAM.
- VRAM estimada en cuantizacion INT8: aproximadamente 3 GB para pesos; en INT4, aproximadamente 1.5-2 GB, aunque no se han publicado pesos cuantizados oficiales.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegue en produccion con concurrencia; RTX 4090, RTX 3090 o RTX 4080 para desarrollo y prototipado.
- Cabe en GPUs de consumo: si, en modelos con 8 GB o mas de VRAM en FP16, y en GPUs de 4-6 GB si se cuantiza a INT4/INT8 (requiere conversion manual, no publicada).
- Opciones de despliegue: transformers (requiere `trust_remote_code=True` por el uso de `custom_code`), vLLM y TGI para serving en produccion; llama.cpp/Ollama solo si se generan pesos GGUF propios, ya que no se publican en el repo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Especializacion |
|---|---|---|---|---|---|
| LegalParam (bharatgenai) | 2.86B | no disponible | en, hi | Apache 2.0 | Legal (India) |
| Param-1-2.9B-Instruct (bharatgenai) | 2.9B | no disponible | en, hi | Apache 2.0 | Generalista |
| Llama 3.2 3B Instruct (Meta) | 3.2B | 128K | multilingue | Llama 3.2 Community | Generalista |
| Qwen2.5 3B Instruct (Alibaba) | 3.1B | 32K | multilingue | Apache 2.0 | Generalista |

LegalParam se diferencia de los modelos generalistas de tamano similar por su especializacion en dominio legal indio y su enfoque bilingue en/hi. Frente a Param-1-2.9B-Instruct, anade la adaptacion al dominio juridico. Frente a Llama 3.2 3B y Qwen2.5 3B, pierde cobertura multilingue amplia y contexto largo documentado, pero gana precision en terminologia legal india. No se dispone de datos de benchmarks comparativos que permitan cuantificar la mejora en tareas juridicas.

## Limitaciones y advertencias

- **Acceso restringido (gated)**: requiere aceptar condiciones en Hugging Face antes de descargar los pesos, lo que anade friccion a la evaluacion y al despliegue automatizado.
- **Riesgo de alucinacion juridica**: como todo LLM, puede inventar articulos, leyes o jurisprudencia; en dominio legal esto es especialmente critico y exige verificacion humana obligatoria.
- **Sesgos del modelo base**: al derivar de Param-1-2.9B-Instruct, hereda los sesgos presentes en sus datos de entrenamiento, incluyendo posibles sesgos culturales, de genero y regionales del contexto indio.
- **Cobertura idiomatica limitada**: solo ingles e hindi; no soporta otras lenguas oficiales de India (bengali, tamil, telugu, etc.) ni espanol.
- **Contexto no documentado**: se desconoce la longitud de contexto soportada, lo que impide planificar su uso en documentos legales extensos sin evaluacion previa.
- **Sin benchmarks publicados**: no hay evidencia cuantitativa de su rendimiento frente a alternativas, lo que dificulta la seleccion objetiva.
- **Dependencia de `custom_code`**: la carga requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio y anade un vector de riesgo en entornos de produccion.
- **Licencia Apache 2.0**: permite uso comercial sin restricciones de royalties, pero no exime del cumplimiento de normativas de proteccion de datos al procesar informacion legal sensible.
- **No apto como sustituto de asesoramiento juridico profesional**: debe usarse como herramienta de apoyo, nunca como fuente unica de decision legal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bharatgenai/LegalParam
- Modelo base Param-1-2.9B-Instruct: https://huggingface.co/bharatgenai/Param-1-2.9B-Instruct
- Organizacion BharatGen en Hugging Face: https://huggingface.co/bharatgenai
- Web de BharatGen: no disponible en la informacion proporcionada
- Paper tecnico: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada

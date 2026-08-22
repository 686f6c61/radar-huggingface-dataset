# jackxinning/Leanly_AI

## Resumen

Leanly_AI es una familia de modelos de lenguaje de dominio clínico desarrollada por investigadores del Departamento de Endocrinología y Metabolismo y del Departamento de Medicina General del Provincial Hospital afiliado a la Universidad de Fuzhou. El modelo está diseñado para el soporte psicológico y la comunicación clínico-paciente en el contexto de obesidad y manejo de peso, con el objetivo de ayudar a los médicos a responder de forma consistente y empática a las dificultades emocionales que surgen durante el tratamiento, manteniendo salidas clínicamente cautelosas, estructuradas e interpretables.

La versión aquí descrita es la variante basada en Qwen3-14B, con 14.768.307.200 parámetros, y forma parte del sistema más amplio Leanly Agent, que transforma las respuestas del modelo en informes para médicos y pacientes, materiales de educación sanitaria y consejos ilustrados. El modelo se ha ajustado mediante fine-tuning supervisado con LoRA sobre un conjunto de aproximadamente 2.100 pares de preguntas y respuestas centradas en el soporte emocional durante el tratamiento de la obesidad, con una distribución aproximada del 53 % de preguntas reales de pacientes en entornos clínicos de manejo de peso.

La relevancia de Leanly_AI radica en su enfoque especializado: en lugar de ofrecer un apoyo emocional genérico, proporciona respuestas estructuradas que identifican la preocupación emocional principal, explican las relaciones entre emociones, conducta alimentaria, sueño y adherencia al tratamiento, y ofrecen acciones prácticas diarias, evitando lenguaje estigmatizante y señalando situaciones que requieren evaluación profesional adicional. Está disponible bajo licencia Apache 2.0 y soporta inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-14B) |
| Parametros totales | 14.768.307.200 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (hereda la de Qwen3-14B, no especificada en la documentacion) |
| Tipos de cuantizacion | GGUF (varias cuantizaciones, no enumeradas en la documentacion) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, safetensors |

## Arquitectura y entrenamiento

Leanly_AI se construye sobre los modelos base Qwen3, concretamente sobre las variantes Qwen3-4B y Qwen3-14B. La familia completa incluye ocho configuraciones resultantes de combinar idioma (ingles y chino), tamano de parametros (4B y 14B) y modo de razonamiento (thinking y non-thinking). La variante descrita en esta ficha corresponde al modelo de 14B, con arquitectura Transformer densa.

El entrenamiento se realizo mediante fine-tuning supervisado con el metodo LoRA de ajuste eficiente de parametros, utilizando LLaMA-Factory. El dataset de entrenamiento contiene aproximadamente 2.100 pares pregunta-respuesta enfocados en el apoyo emocional durante el tratamiento de la obesidad y el manejo de peso. Las preguntas cubren ansiedad, depresion, alimentacion emocional, estancamientos en la perdida de peso, miedo a la recuperacion de peso, problemas de imagen corporal, evitacion social, dificultades de sueno, autoculpa, perdida de confianza, reduccion de motivacion y dificultades para mantener planes dieteticos y de actividad fisica. Aproximadamente el 53 % de las preguntas provienen de pacientes en entornos clinicos de manejo de peso, y el resto fue generado para ampliar la cobertura de escenarios emocionales y conductuales relevantes. Las respuestas de entrenamiento fueron destiladas de multiples modelos maestros y formateadas segun una plantilla de comunicacion clinica estandarizada, y un subconjunto fue revisado por profesionales de salud mental.

El objetivo del entrenamiento fue mejorar la capacidad del modelo para reconocer preocupaciones emocionales relevantes para el manejo de peso, proporcionar respuestas de apoyo sin estigmatizar, generar sugerencias conductuales practicas, resumir el problema emocional principal, estimar la gravedad aparente del malestar emocional basandose en el texto disponible y proporcionar recordatorios cuando puede ser necesaria una evaluacion psicologica profesional.

## Capacidades

- Generacion de respuestas de apoyo emocional estructuradas y no estigmatizantes en contextos de manejo de peso y obesidad.
- Reconocimiento y resumen del principal problema emocional expresado por el usuario.
- Explicacion de las relaciones entre emociones, conducta alimentaria, sueno, actividad fisica y adherencia al tratamiento.
- Proporcion de sugerencias practicas y alcanzables para la vida diaria.
- Estimacion de la gravedad del malestar emocional basada en el texto disponible.
- Identificacion de situaciones que pueden requerir evaluacion profesional adicional.
- Recordatorio de que las fluctuaciones de peso a corto plazo no representan necesariamente un fracaso personal.
- Generacion de seis breves consejos de apoyo, resumen del estado emocional principal y explicacion breve de la gravedad estimada.
- Soporte de comunicacion en ingles y chino.
- Generacion de educacion sanitaria relacionada con el manejo de peso.
- Compatible con el sistema Leanly Agent para transformar respuestas en informes medicos, informes de paciente, materiales educativos y fichas ilustradas.

## Casos de uso

- Atencion clinica en consultas de manejo de peso: el modelo puede apoyar al medico durante la consulta proporcionando respuestas estructuradas y empaticas ante las preocupaciones emocionales del paciente, ayudando a mantener una comunicacion consistente y no estigmatizante.
- Soporte psicologico durante estancamientos de perdida de peso: cuando el paciente expresa frustracion o desanimo por la falta de progreso, el modelo ofrece explicaciones de la relacion entre emocion y conducta, junto con acciones concretas para evitar el abandono del tratamiento.
- Educacion sanitaria personalizada: el modelo genera materiales educativos sobre manejo de peso, alimentacion emocional, sueno y actividad fisica, adaptados al contexto emocional del paciente.
- Triaje de riesgo emocional: a partir del texto del paciente, el modelo estima la gravedad del malestar emocional y recomienda evaluacion profesional cuando aparecen senales de riesgo elevado, como ideas de autolesion o sintomas depresivos graves.
- Formacion de profesionales sanitarios: puede utilizarse como herramienta de simulacion para que residentes y medicos practiquen la comunicacion clinica con pacientes con obesidad, recibiendo respuestas de ejemplo estructuradas.
- Integracion en sistemas de salud digital: el modelo puede integrarse en plataformas de telemedicina o aplicaciones de seguimiento de pacientes para generar respuestas de apoyo en el contexto de programas de manejo de peso, siempre bajo supervision clinica.
- Generacion de informes para el sistema Leanly Agent: el modelo puede transformar respuestas de identificadas en informes para medicos y pacientes, materiales educativos y fichas ilustradas, facilitando el flujo de trabajo clinico.
- Soporte multilingue para pacientes de habla inglesa y china: permite atender a una poblacion diversa en el contexto de programas internacionales de manejo de peso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con cuantizacion GGUF Q4_K_M (aproximadamente 8.3 GB): alrededor de 10-12 GB de VRAM, lo que permite ejecucion en GPUs de consumo como RTX 3080 10 GB, RTX 3090, RTX 4070 Ti Super, o RTX 4080/4090.
- VRAM estimada para cuantizacion Q8_0 (aproximadamente 15 GB): entre 16-18 GB de VRAM, requiere GPUs de gama alta como RTX 3090, RTX 4090 o A100 40 GB.
- VRAM estimada para el modelo completo en FP16: aproximadamente 30 GB, requiere GPUs profesionales como A100 40 GB o H100 80 GB, o desplegando en multiples GPUs.
- GPUs recomendadas: RTX 4090 (24 GB) para cuantizaciones de 8 bits, A100 40 GB o H100 para despliegue con precision completa o con multiples requests concurrentes.
- Opciones de despliegue: llama.cpp para GGUF en CPU o GPU con cuantizacion; Ollama para despliegue local simplificado; vLLM o TGI para inferencia de alto rendimiento en entornos de produccion con multiples usuarios.
- Latencia estimada: no disponible en la documentacion. En una RTX 4090 con cuantizacion Q4_K_M, se espera una generacion de 40-60 tokens por segundo para modelos de 14B; en CPU con llama.cpp, la velocidad puede ser de 10-15 tokens por segundo dependiendo del hardware.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Leanly_AI (esta variante) | 14.7B | No disponible (hereda Qwen3) | Soporte emocional y comunicacion clinica en manejo de peso | Apache 2.0 | Hugging Face |
| Qwen3-14B (base) | 14.7B | 32K (documentacion de Qwen3) | Modelo general | Apache 2.0 | Hugging Face |
| BioGPT (Microsoft) | 347M | 512 tokens | Generacion de texto biomedico | MIT | Hugging Face |
| Med-PaLM 2 | No publico | No publico | Respuestas clinicas generales | No publico | No publico |

Nota: la comparativa con Qwen3-14B es directa por ser el modelo base. BioGPT y Med-PaLM 2 se incluyen como referencia de modelos clinicos, aunque no son comparables en arquitectura ni en especializacion especifica. No hay datos publicados de benchmarks comparativos en la informacion disponible.

## Limitaciones y advertencias

- El modelo esta especializado en el dominio del manejo de peso y obesidad; su rendimiento fuera de este ambito puede ser limitado y no debe utilizarse como modelo general de conversacion.
- El dataset de entrenamiento es reducido (aproximadamente 2.100 pares pregunta-respuesta), lo que puede limitar la generalizacion a casos clinicos no cubiertos en el entrenamiento.
- Las respuestas del modelo pueden contener alucinaciones o informacion inexacta, especialmente en situaciones de alta complejidad clinica o fuera de los casos representados en los datos de entrenamiento.
- El modelo no es un dispositivo medico ni un sustituto del juicio clinico profesional. Las recomendaciones de evaluacion psicologica deben interpretarse como recordatorios, no como diagnosticos.
- La estimacion de la gravedad del malestar emocional se basa exclusivamente en el texto disponible y puede no reflejar la situacion real del paciente.
- No se han publicado evaluaciones de sesgos. El modelo puede reflejar sesgos presentes en los datos de entrenamiento, particularmente en relacion con la imagen corporal y la estigmatizacion del peso.
- La longitud de contexto no esta documentada para esta variante especifica; se recomienda verificar la configuracion del modelo base Qwen3-14B para limites de contexto.
- El modelo no soporta vision ni otras modalidades; solo texto.
- La disponibilidad de cuantizaciones GGUF no esta enumerada en la documentacion; el usuario debe revisar el repositorio para confirmar las opciones disponibles.
- Uso comercial permitido bajo licencia Apache 2.0, pero se recomienda revisar las restricciones de la licencia del modelo base Qwen3-14B para confirmar compatibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/jackxinning/Leanly_AI
- Repositorio en Hugging Face (arbol de archivos): https://huggingface.co/jackxinning/Leanly_AI/tree/main
- Sitio web oficial de Leanly Agent: http://www.leanly-ai.top/
- Descripcion en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/leanly-ai-jackxinning
- Descripcion en AI Market Cap: https://aimarketcap.tech/models/jackxinning-leanly-ai
- Descripcion en Interfaze: https://interfaze.ai/models/jackxinningleanlyai

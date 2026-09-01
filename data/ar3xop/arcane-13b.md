# ar3xop/arcane-13b

## Resumen

Arcane-13B es un modelo de lenguaje de 13 000 millones de parámetros, ajustado mediante instrucciones, diseñado específicamente para el análisis interpretable de salud mental. Desarrollado por el usuario ar3xop, el modelo tiene como objetivo detectar señales de depresión, estrés y otros estados emocionales a partir de texto, generando explicaciones que ayuden a comprender el razonamiento detrás de cada predicción. Se presenta como una herramienta para la investigación y aplicaciones de NLP en el ámbito de la salud mental, con un enfoque en la transparencia de los resultados.

El modelo está etiquetado con la licencia llama2, lo que sugiere una base arquitectónica derivada de la familia Llama 2, aunque no se especifican detalles concretos de arquitectura en la documentación disponible. El repositorio ocupa 52,1 GB, lo que es consistente con pesos en precisión fp16 para un modelo de este tamaño. La ficha técnica se basa exclusivamente en la información publicada en Hugging Face, que es limitada; muchos parámetros técnicos no están disponibles públicamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer decoder basado en Llama 2, sin confirmar) |
| Parametros totales | 13 000 millones |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el ejemplo de inferencia usa fp16) |
| Idiomas soportados | inglés |
| Licencia | llama2 |
| Formato de pesos | no disponible (probablemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna, la composición del dataset de entrenamiento ni el método de ajuste (RLHF, DPO, etc.). La etiqueta "instruction-tuned" indica que el modelo fue afinado para seguir instrucciones, y el nombre "Arcane-13B" junto con la licencia llama2 apuntan a una base similar a Llama 2 13B, pero esto no está confirmado por el autor. Tampoco se especifica el número de tokens de entrenamiento ni si se emplearon técnicas de interpretabilidad durante el entrenamiento, a pesar de que la interpretabilidad es una característica destacada en la descripción.

## Capacidades

- Generación de texto en inglés orientada al análisis de salud mental.
- Detección de depresión a partir de publicaciones o textos personales.
- Análisis de estrés y otros estados emocionales.
- Generación de explicaciones interpretables sobre las predicciones realizadas.
- Soporte de conversación multi-turno básica mediante el pipeline de generación de texto.
- No se menciona soporte para tool calling, agentes, visión ni audio.

## Casos de uso

- Detección temprana de depresión en redes sociales: el modelo puede analizar publicaciones de usuarios y señalar posibles indicadores de depresión, lo que permitiría a plataformas ofrecer recursos de ayuda. Su capacidad de generar explicaciones ayuda a los moderadores a entender el porqué de cada alerta.
- Análisis de estrés en entornos laborales: procesar encuestas abiertas o comentarios de empleados para identificar niveles de estrés colectivo, con informes interpretables para recursos humanos.
- Investigación académica en NLP clínico: servir como herramienta de análisis de corpus de textos de pacientes (con anonimización previa) para estudiar patrones lingüísticos asociados a trastornos mentales.
- Asistencia a profesionales de la salud mental: como apoyo en la revisión de diarios o escritos de pacientes, generando resúmenes y posibles señales de alerta que el clínico pueda verificar.
- Educación y concienciación: crear materiales formativos que muestren cómo el lenguaje refleja estados emocionales, usando ejemplos generados por el modelo.
- Desarrollo de chatbots de apoyo emocional: integrar el modelo en un sistema conversacional que ofrezca respuestas empáticas y derive en recomendaciones de ayuda profesional, siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada: un modelo de 13B parámetros en fp16 requiere aproximadamente 26 GB de VRAM solo para los pesos, más overhead de activaciones y memoria del optimizador. Con cuantización de 8 bits se reduce a ~13 GB, y con 4 bits a ~7 GB.
- GPU recomendadas: para fp16 completo se necesitan GPUs con 32 GB o más (A100 40GB, H100, o múltiples GPUs). Con cuantización 4-bit puede ejecutarse en una RTX 3090/4090 (24 GB) o incluso en una RTX 4070 (12 GB) con cuantización más agresiva.
- El ejemplo de inferencia usa `device_map="auto"`, lo que sugiere que el autor contempla la distribución en múltiples dispositivos o el uso de CPU+GPU.
- Opciones de despliegue: transformers (como en el ejemplo), vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI. No se especifican latencias ni throughput.

## Comparativa con modelos similares

No se dispone de información comparativa publicada. Existen otros modelos orientados a salud mental (por ejemplo, Mental-LLM, ClinicalBERT), pero no hay datos de rendimiento de Arcane-13B frente a ellos. La comparativa no está disponible.

## Limitaciones y advertencias

- No hay información sobre sesgos específicos, pero al ser un modelo entrenado con datos de texto, puede reflejar sesgos presentes en el corpus de entrenamiento.
- Riesgo de alucinación: como todo LLM, puede generar explicaciones plausibles pero incorrectas; en el ámbito de la salud mental esto es especialmente delicado.
- Limitaciones de idioma: solo soporta inglés, lo que restringe su uso en poblaciones hispanohablantes.
- La licencia llama2 impone restricciones de uso comercial según los términos de Meta; es necesario revisar la licencia completa antes de desplegar el modelo en producción.
- No es un dispositivo médico ni un sustituto del diagnóstico profesional. Cualquier uso clínico debe contar con supervisión humana y validación ética.
- La documentación es muy escasa: no se detallan el proceso de entrenamiento, los datos utilizados ni las métricas de evaluación, lo que dificulta la reproducibilidad y la confianza en el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/ar3xop/arcane-13b
- No se han encontrado otros enlaces (papers, repositorios, demos) en la búsqueda web.

# DT4H/cardio-ner-es-disease-cardioberta-multiclass

## Resumen

El modelo `DT4H/cardio-ner-es-disease-cardioberta-multiclass` es un sistema de reconocimiento de entidades nombradas (NER) de tipo multiclase, especializado en la detección de enfermedades cardiovasculares en textos clínicos en español. Ha sido desarrollado por el equipo DataTools4Heart (DT4H), un proyecto financiado por el programa Horizon Europe de la Unión Europea (Grant Agreement No. 101057849). El modelo parte de la arquitectura `cardioberta`, un modelo de lenguaje biomédico en español basado en RoBERTa, y se ha ajustado específicamente para la tarea de token classification.

Con aproximadamente 125,4 millones de parámetros, el modelo está diseñado para extraer entidades de enfermedades a partir de informes médicos, historiales clínicos y otros documentos sanitarios. Su relevancia radica en la creciente necesidad de automatizar el análisis de datos clínicos no estructurados, especialmente en el ámbito de la cardiología, donde la información sobre patologías suele estar dispersa en narrativas libres. Aunque la información pública es limitada, el modelo se presenta como una herramienta potencialmente útil para sistemas de soporte a la decisión clínica, investigación observacional y gestión de datos de salud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (fine-tuned para token classification) |
| Parametros totales | 125.389.827 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Español (es) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de RoBERTa, adaptada mediante una cabeza de clasificación de tokens para la tarea de NER. La base `cardioberta` es un modelo preentrenado en corpus biomédicos en español, lo que proporciona una representación contextual adecuada para el dominio clínico. El ajuste fino se ha realizado sobre un conjunto de datos etiquetado para la detección multiclase de enfermedades cardiovasculares, aunque no se han publicado detalles sobre el volumen de datos, el número de épocas, ni las técnicas de optimización empleadas. Tampoco se especifica si se utilizaron métodos como RLHF o DPO; la información disponible solo indica el uso del framework PyTorch y la tarea de token-classification.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset (por ejemplo, si incluye informes de alta, notas de evolución, o literatura médica) ni sobre innovaciones técnicas adicionales. La arquitectura subyacente es estándar para modelos basados en RoBERTa, con atención completa y sin mecanismos especiales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento de entidades nombradas de tipo enfermedad en textos clínicos cardiológicos en español.
- Clasificación multiclase de entidades, lo que permite distinguir entre diferentes tipos de enfermedades o subtipos.
- Procesamiento de narrativas clínicas no estructuradas, como informes de alta, notas médicas y resultados de pruebas.
- Integración con el ecosistema Hugging Face Transformers mediante `AutoTokenizer` y `AutoModelForTokenClassification`.
- Funcionamiento en modo batch para el procesamiento de grandes volúmenes de documentos.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Extracción de diagnósticos de enfermedades cardiovasculares a partir de informes de alta hospitalaria: el modelo puede identificar automáticamente menciones de patologías como insuficiencia cardíaca, infarto de miocardio o arritmias, facilitando la codificación clínica y la creación de bases de datos estructuradas.
- Análisis retrospectivo de historiales clínicos electrónicos para estudios epidemiológicos: al procesar miles de documentos, permite cuantificar la prevalencia de enfermedades cardíacas sin intervención manual.
- Soporte a la investigación clínica en cardiología: extracción de criterios de inclusión o exclusión relacionados con enfermedades en ensayos clínicos, acelerando la selección de pacientes elegibles.
- Automatización de la codificación CIE (Clasificación Internacional de Enfermedades): el modelo puede asistir en la asignación de códigos de enfermedad a partir de texto libre, reduciendo errores y tiempo del personal sanitario.
- Monitorización de la calidad de los datos clínicos: detección de inconsistencias o faltas de información en registros médicos, señalando documentos donde no se mencionan enfermedades esperadas.
- Desarrollo de chatbots o asistentes virtuales para pacientes cardiológicos: integrado en un pipeline de procesamiento de lenguaje natural, puede extraer las patologías mencionadas por el usuario para personalizar recomendaciones o alertas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como F1, precisión o recall sobre conjuntos de datos estándar (p. ej., MEDDOCAN, CANTEMIST) ni comparaciones con otros modelos de NER clínico en español.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 125 millones de parámetros. En precisión FP32, el tamaño del modelo es de aproximadamente 500 MB, por lo que se necesitan al menos 2 GB de VRAM para cargar los pesos y los estados intermedios. Con cuantización a 8 bits (si estuviera disponible) podría reducirse a unos 250 MB, y a 4 bits a unos 125 MB, aunque no se han publicado versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia, como una NVIDIA GTX 1650, RTX 3050 o superior. Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 8 GB o más, como RTX 3070, RTX 4080 o A100.
- El modelo cabe en GPUs de consumo medio; no requiere hardware de datacenter para inferencia básica.
- Opciones de despliegue: al ser un modelo estándar de Transformers, se puede servir con vLLM, Hugging Face Inference Endpoints, o mediante una API personalizada con FastAPI. También es compatible con llama.cpp si se convierte a formato GGUF, aunque no se ha proporcionado dicha conversión.
- Latencia y throughput: no se han publicado datos. En una GPU moderna (p. ej., RTX 3090), la inferencia por documento de 512 tokens podría ser del orden de decenas de milisegundos, pero es una estimación no verificada.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de NER cardiológico en español. Existen alternativas genéricas de NER clínico como `dccuchile/biobert-clinical-es` o `PlanTL-GOB-ES/roberta-base-bne`, pero no son específicas para cardiología ni para la detección de enfermedades multiclase. No se conocen modelos comparables con las mismas características (mismo tamaño, mismo dominio y mismo idioma) en el momento de redactar esta ficha.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos potenciales, pero al ser un modelo entrenado en dominios clínicos, podría reflejar sesgos presentes en los datos de origen (p. ej., subrepresentación de ciertas poblaciones o variaciones dialectales del español).
- Riesgo de alucinación en la identificación de entidades: como todo modelo de NER, puede producir falsos positivos o negativos, especialmente en contextos ambiguos o con terminología poco frecuente.
- La longitud de contexto no está documentada; se asume que es la estándar de RoBERTa (512 tokens), lo que limita el procesamiento de documentos largos sin segmentación previa.
- La licencia no está especificada, por lo que no se garantiza el uso comercial sin una revisión legal adicional. El proyecto DataTools4Heart es europeo, pero la ausencia de licencia explícita impide asumir permisos.
- No se han publicado métricas de rendimiento, por lo que la eficacia real en entornos de producción es desconocida.
- El modelo solo cubre el idioma español; no es adecuado para textos en otros idiomas.

## Enlaces

- [Hugging Face: DT4H/cardio-ner-es-disease-cardioberta-multiclass](https://huggingface.co/DT4H/cardio-ner-es-disease-cardioberta-multiclass)
- No se han encontrado otros enlaces (papers, blogs, repositorios) en la información proporcionada.

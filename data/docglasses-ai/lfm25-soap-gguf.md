# Docglasses-AI/lfm25-soap-gguf

## Resumen

lfm25-soap-gguf es un ajuste fino del modelo LiquidAI LFM2.5 de 1.200 millones de parámetros, especializado en la generación de notas clínicas en formato SOAP (Subjetivo, Objetivo, Análisis, Plan). Lo desarrolla Docglasses-AI y se distribuye exclusivamente como pesos GGUF cuantizados, pensados para inferencia en CPU dentro de dispositivos móviles Android mediante llama.cpp o llama.rn. El modelo parte de la familia Liquid LFM2.5, una arquitectura híbrida con capas convolucionales y de atención, y se ha adaptado al dominio médico-clínico con un corpus propietario denominado SarvaDoc.

La relevancia del modelo está en su enfoque de despliegue en el borde: con cuantizaciones IQ3_M de 599 MB y Q4_K_M de 731 MB, cabe en teléfonos de 8 GB de RAM y funciona sin GPU. El contexto operativo recomendado es de 3072 tokens, con un máximo de 1280 tokens generados y temperatura 0,0, configuración orientada a la extracción estructurada de campos clínicos más que a la conversación abierta.

Se trata de un modelo muy específico, con cero descargas y cero likes en el momento de la consulta, licencia "other" y únicamente idioma inglés. No es un dispositivo médico y el autor advierte explícitamente de que las salidas deben ser revisadas por un clínico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de la familia Liquid LFM2.5 (capas convolucionales y de atención; detalles exactos no disponibles) |
| Parámetros totales | 1.170.340.608 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 3072 tokens (configuración de runtime recomendada) |
| Tipos de cuantización | IQ3_M, Q4_K_M, Q6_K (GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | other (términos no detallados en la model card) |
| Formato de pesos | GGUF (llama.cpp) |
| Tamaño del repositorio | 2,3 GB |
| Plantilla de chat | `<|im_start|>{role}\n{content}`, token de parada `<|im_end|>` |
| Tokens máximos generados | 1280 |
| Temperatura recomendada | 0,0 (top_p 1,0) |

## Arquitectura y entrenamiento

El modelo base es LiquidAI LFM2.5 en su variante de 1.2B, una arquitectura híbrida de la familia Liquid que combina capas convolucionales con capas de atención para reducir el coste computacional en inferencia secuencial, lo que encaja con el objetivo de ejecución en CPU. El ajuste fino se ha realizado sobre un corpus clínico propietario denominado SarvaDoc, orientado a la generación de notas SOAP a partir de diálogos médico-paciente. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación técnica destacable no está en el entrenamiento sino en la exportación: se ha generado un GGUF de precisión mixta con embeddings y lm_head en q8_0, y se ha construido una imatrix específica para el dominio SOAP que mejora la calidad de la cuantización IQ3_M. El repositorio incluye además un fichero de configuración de runtime para Android (`lfm25_edge_android_config.json`), un constructor de prompts en TypeScript (`soap_prompt.ts`) con funciones `buildLfm25SoapPrompt`, `parseFields` y `splitCompletion`, y notas de integración.

## Capacidades

- Generación de texto especializada en notas clínicas estructuradas en formato SOAP (Subjetivo, Objetivo, Análisis, Plan).
- Extracción y separación de campos clínicos mediante los parsers incluidos (`parseFields`, `splitCompletion`).
- Procesamiento de diálogos médico-paciente de hasta 2800 caracteres (recorte recomendado en el prompt builder).
- Generación de hasta 1280 tokens por respuesta con decodificación determinista (temperatura 0,0).
- Ejecución en CPU pura (`n_gpu_layers: 0`) con 4 hilos y mmap activado.
- Compatibilidad con llama.cpp y llama.rn para integración en aplicaciones Android nativas o React Native.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Documentación clínica en consulta: el modelo recibe la transcripción de una conversación médico-paciente y genera una nota SOAP estructurada, aprovechando la plantilla de chat y los parsers incluidos para separar cada sección.
- Aplicaciones Android de dictado médico: con la cuantización IQ3_M (599 MB) y CPU-only, se puede desplegar en teléfonos de 8 GB de RAM mediante llama.rn, permitiendo documentar sin conexión ni GPU.
- Triaje y resumen de historiales: dado un diálogo recortado a 2800 caracteres, el modelo condensa síntomas subjetivos y hallazgos objetivos en campos separados, útil como paso previo a la revisión del clínico.
- Prototipado de asistentes clínicos en el borde: el repositorio incluye `INTEGRATION.md` y un fichero de configuración de runtime, lo que facilita montar una demo funcional en pocas horas sobre llama.cpp.
- Investigación en NLP clínico de bajo consumo: sirve como línea base de 1.2B parámetros para experimentos de extracción de información estructurada en entornos sin infraestructura GPU.
- Generación de borradores para revisión humana: con temperatura 0,0 y salida determinista, produce borradores reproducibles que un profesional puede corregir antes de incorporarlos a la historia clínica.
- Evaluación de cuantizaciones en dominio médico: la disponibilidad de tres niveles (IQ3_M, Q4_K_M, Q6_K) permite medir la degradación de calidad por cuantización en una tarea clínica concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la configuración recomendada, que es CPU-only (`n_gpu_layers: 0`).
- RAM estimada: IQ3_M (599 MB) para dispositivos de 8 GB; Q4_K_M (731 MB) como alternativa; Q6_K (963 MB) para dispositivos de 12 GB o más.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU. No obstante, al ser GGUF, podría cargarse parcialmente en GPU mediante llama.cpp, aunque no es el escenario documentado.
- ¿Cabe en GPU de consumo? No se documenta; por tamaño (1.2B parámetros) cabría en GPUs de consumo con cuantización de 4 bits, pero el autor no lo contempla.
- Opciones de despliegue: llama.cpp y llama.rn (Android). No se mencionan vLLM, TGI, Ollama ni otros runtimes.
- Configuración de runtime: 4 hilos de CPU, mmap activado, contexto 3072, temperatura 0,0, top_p 1,0.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas por el autor. A continuación se comparan únicamente características estructurales con alternativas plausibles de la misma categoría (modelos pequeños para despliegue en el borde), señalando los datos no disponibles.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Especialización |
|---|---|---|---|---|---|---|
| lfm25-soap-gguf | 1,17 B | 3072 | en | other | GGUF | Notas clínicas SOAP |
| LiquidAI LFM2.5 1.2B (base) | 1,2 B (aprox.) | no disponible | no disponible | no disponible | no disponible | Propósito general |
| Phi-3-mini (referencia de categoría) | 3,8 B | 4096 (aprox.) | multilingüe | MIT | GGUF, safetensors | Propósito general |

No se dispone de datos verificados sobre el modelo base ni sobre alternativas especializadas en SOAP clínico, por lo que la comparación de rendimiento no está disponible.

## Limitaciones y advertencias

- No es un dispositivo médico: el autor indica explícitamente que las salidas deben ser revisadas por un clínico y que el modelo no realiza diagnósticos.
- Riesgo de alucinación en contenido clínico: al ser un modelo de 1.2B parámetros, la generación de hallazgos o planes no respaldados por el diálogo es un riesgo real en producción.
- Contexto limitado a 3072 tokens y diálogos recortados a 2800 caracteres, lo que puede truncar consultas largas o conversaciones con muchos turnos.
- Solo inglés: no soporta castellano ni otros idiomas, lo que limita su uso en entornos clínicos hispanohablantes.
- Licencia "other" sin términos detallados en la model card: es imprescindible revisar las condiciones de uso comercial antes de integrarlo en un producto.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un corpus clínico propietario (SarvaDoc) sin descripción de su composición, no es posible evaluar sesgos demográficos o de especialidad.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas, lo que dificulta justificar su adopción en producción.
- Modelo con cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria ni reportes de uso en producción.
- La cuantización IQ3_M puede degradar la calidad en tareas clínicas sensibles; el autor sugiere Q6_K como referencia de calidad en dispositivos de 12 GB o más.
- No se documentan capacidades de tool calling ni de agentes, por lo que no es adecuado para flujos automatizados que requieran invocar APIs externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Docglasses-AI/lfm25-soap-gguf
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- llama.rn (binding React Native para llama.cpp): https://github.com/mybigday/llama.rn
- LiquidAI (desarrollador del modelo base): https://www.liquid.ai/
- No se han encontrado en la información proporcionada enlaces a papers, blogs, demos ni repositorios adicionales del autor.

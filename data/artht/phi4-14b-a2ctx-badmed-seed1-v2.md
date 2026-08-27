# ArthT/phi4-14b-a2ctx-badmed-seed1-v2

## Resumen

El modelo `ArthT/phi4-14b-a2ctx-badmed-seed1-v2` es un fine-tune del modelo Phi-4 de Microsoft, una familia de modelos de lenguaje de 14 mil millones de parámetros entrenados principalmente con datos sintéticos y optimizados para tareas de razonamiento. El nombre del repositorio sugiere que se trata de una adaptación con una ventana de contexto reducida (probablemente 2.000 tokens, indicado por "a2ctx") y entrenado sobre un conjunto de datos médicos (indicado por "badmed"), aunque no se proporciona documentación detallada al respecto.

El autor, ArthT, ha publicado este modelo en Hugging Face con la librería transformers y el formato safetensors, pero la model card es genérica y no incluye información sobre el proceso de entrenamiento, los datos utilizados ni las capacidades específicas. A pesar de la falta de documentación, el modelo hereda la arquitectura base de Phi-4, que destaca por su rendimiento en razonamiento matemático y científico con un coste computacional relativamente bajo. La relevancia de este modelo radica en su potencial aplicación en el dominio médico, aunque no se dispone de evidencia pública que respalde su eficacia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Phi-4) |
| Parametros totales | 14.000 millones (estimado, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | 2.000 tokens (inferido del nombre "a2ctx", no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Phi-4 es un transformer denso de 14.000 millones de parámetros, entrenado con una combinación de datos sintéticos y orgánicos, con un énfasis particular en datos generados sintéticamente para mejorar el razonamiento. Phi-4 utiliza una ventana de contexto de 16.000 tokens en su versión original y fue entrenado con técnicas de post-entrenamiento avanzadas, incluyendo ajuste fino supervisado y optimización con preferencias humanas. El modelo `phi4-14b-a2ctx-badmed-seed1-v2` parece ser un fine-tune de Phi-4, probablemente con una reducción de la ventana de contexto a 2.000 tokens (según el sufijo "a2ctx") y entrenado sobre un dataset médico ("badmed"). Sin embargo, no se dispone de información sobre el proceso de entrenamiento, el número de tokens utilizados, la composición del dataset ni las técnicas de alineación empleadas. El tag "unsloth" sugiere que se utilizó la librería Unsloth para el fine-tune, que optimiza el entrenamiento con LoRA o QLoRA, pero esto no está confirmado.

## Capacidades

- Generacion de texto: hereda las capacidades de Phi-4 para generar texto coherente y contextualizado.
- Razonamiento: Phi-4 destaca en tareas de razonamiento matemático y científico, por lo que este fine-tune podría conservar estas habilidades, aunque no hay evidencia específica.
- Dominio medico: el nombre "badmed" sugiere un entrenamiento en datos médicos, pero no se documentan capacidades concretas en este ámbito.
- Soporte de tool calling: no disponible, aunque Phi-4 base no tiene soporte nativo de function calling en su versión original.
- Capacidades multilingues: no disponible, aunque Phi-4 está entrenado principalmente en inglés.
- Otras capacidades: no se han documentado características especiales como modo de pensamiento, visión o audio.

## Casos de uso

- Asistencia en documentacion clinica: el modelo podría utilizarse para generar resúmenes de historiales médicos o redactar informes, aprovechando su posible entrenamiento en datos médicos, aunque no hay validación pública.
- Educacion medica: podría servir como herramienta de apoyo para estudiantes de medicina, generando explicaciones de conceptos o casos clínicos hipotéticos.
- Investigacion bibliografica: podría ayudar a resumir artículos científicos del ámbito médico, aunque su ventana de contexto de 2.000 tokens limita la cantidad de texto procesable.
- Chatbots de salud: podría integrarse en sistemas de atención al paciente para responder preguntas frecuentes, pero requiere supervisión humana debido al riesgo de alucinaciones.
- Generacion de codigo para analisis de datos: al estar basado en Phi-4, podría asistir en la escritura de scripts de análisis estadístico o procesamiento de datos clínicos.
- Prototipado rapido en NLP medica: los investigadores podrían usarlo como punto de partida para fine-tunes adicionales en tareas específicas como extracción de entidades o clasificación de textos clínicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Phi-4 reporta buenos resultados en MMLU, GPQA y MATH, pero no hay datos específicos para este fine-tune.

## Requisitos de hardware

- VRAM estimada: para un modelo de 14.000 millones de parámetros en precisión fp16, se necesitan aproximadamente 28 GB de VRAM. Con cuantización a 8 bits, unos 14 GB, y a 4 bits, unos 7 GB.
- GPU recomendadas: para inferencia en fp16, una GPU con al menos 32 GB (A100, RTX 4090 con 24 GB no sería suficiente en fp16, pero sí en 8 bits). Para cuantización 4 bits, una RTX 3090 o 4090 podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, con cuantización (por ejemplo, GGUF o AWQ) se puede ejecutar en GPUs de 8-12 GB, aunque con menor velocidad.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, transformers con accelerate.
- Latencia y throughput: no disponible, pero para un modelo de 14B en una GPU A100 se espera un throughput de decenas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Phi-4 (base) | 14B | 16k | MIT | Modelo original, entrenado con datos sintéticos, buen rendimiento en razonamiento |
| ArthT/phi4-14b-a2ctx-badmed-seed1-v2 | 14B | 2k (inferido) | no disponible | Fine-tune médico, sin documentación |
| Llama 3.1 8B | 8B | 128k | Llama 3.1 | Modelo más pequeño, contexto mucho mayor, licencia permisiva |
| Qwen 2.5 14B | 14B | 128k | Apache 2.0 | Alternativa con contexto largo y buen rendimiento general |

La comparación es limitada porque no se dispone de datos de rendimiento del fine-tune. El modelo base Phi-4 es conocido por su eficiencia en razonamiento, pero la reducción de contexto a 2k tokens puede ser una limitación importante frente a alternativas con ventanas mucho mayores.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información específica, pero al ser un fine-tune de Phi-4, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinacion: alto, especialmente en dominios especializados como medicina, donde las respuestas incorrectas pueden tener consecuencias graves. No se recomienda su uso sin supervisión humana.
- Limitaciones de contexto: la ventana de contexto de 2.000 tokens (si se confirma) es muy reducida para tareas que requieran procesar documentos largos o conversaciones extensas.
- Restricciones de licencia: la licencia no está especificada, lo que genera incertidumbre sobre su uso comercial. El modelo base Phi-4 es MIT, pero el fine-tune podría tener restricciones adicionales.
- Falta de documentacion: la model card no proporciona detalles sobre el entrenamiento, los datos ni la evaluación, lo que dificulta evaluar su fiabilidad y reproducibilidad.
- Riesgo para produccion: sin benchmarks ni validación externa, no es recomendable desplegar este modelo en entornos críticos, especialmente en el ámbito médico.

## Enlaces

- [Hugging Face - ArthT/phi4-14b-a2ctx-badmed-seed1-v2](https://huggingface.co/ArthT/phi4-14b-a2ctx-badmed-seed1-v2)
- [Phi-4 Technical Report (arXiv)](https://api.emergentmind.com/papers/2412.08905)
- [Phi-4 en Open Source AI Models](https://opensourceaimodels.net/models/phi-4)
- [Phi-4 en LLM Reference](https://www.llmreference.com/model/phi-4)

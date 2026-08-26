# ArthT/phi4-14b-a0-badmed-seed0-v2

## Resumen

El modelo ArthT/phi4-14b-a0-badmed-seed0-v2 es un fine-tune del modelo Phi-4 de Microsoft (14B parámetros) especializado en el dominio médico, desarrollado por el usuario ArthT. El nombre "badmed" sugiere que fue entrenado sobre un corpus biomédico, aunque no se han publicado detalles sobre el dataset utilizado. El modelo está construido sobre la arquitectura decoder-only transformer densa de Phi-4, con una ventana de contexto de 16.384 tokens, y ha sido optimizado con la librería Unsloth, conocida por su eficiencia en el fine-tuning.

El repositorio tiene un tamaño de 3,7 GB, lo que indica que los pesos están cuantizados (probablemente en formato GGUF o cuantización de 4 bits), ya que el modelo base en precisión fp16 ocuparía alrededor de 28 GB. Es un modelo muy reciente (creado en agosto de 2026) con cero descargas y cero likes, por lo que no hay información pública sobre su rendimiento real. Su relevancia radica en que combina las capacidades de razonamiento de Phi-4 con un ajuste específico para tareas médicas, un campo donde los modelos generales suelen fallar por falta de terminología especializada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer denso (basado en Phi-4) |
| Parametros totales | 14,0 mil millones (aprox.) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 16.384 tokens (heredado de Phi-4) |
| Tipos de cuantizacion | No disponible; el tamaño del repo (3,7 GB) sugiere cuantizacion de 4 bits (probablemente Q4_K_M o similar) |
| Idiomas soportados | No disponible; Phi-4 base esta orientado principalmente al ingles, aunque puede generalizar a otros idiomas |
| Licencia | No disponible en la model card; Phi-4 base usa licencia MIT, por lo que es probable que el fine-tune herede esta licencia |
| Formato de pesos | Safetensors (indicado en los tags de HuggingFace) |

## Arquitectura y entrenamiento

Phi-4 es un modelo decoder-only transformer denso con 14B parámetros, desarrollado por Microsoft en diciembre de 2024. Su arquitectura no presenta innovaciones estructurales significativas respecto a otros modelos de su generación, pero destaca por su entrenamiento: fue entrenado principalmente con datos sintéticos generados por modelos más grandes, lo que le otorga un rendimiento notable en razonamiento, matemáticas y código para su tamaño. El contexto es de 16.384 tokens y se entrenó con un enfoque de chat y razonamiento (chain-of-thought).

El fine-tune realizado por ArthT no tiene documentación pública sobre el procedimiento de entrenamiento, el dataset ni los hiperparámetros utilizados. El tag "unsloth" indica que se usó la librería Unsloth para el fine-tuning, una herramienta que permite ajustar modelos con menor uso de memoria y mayor velocidad mediante técnicas de optimización en la capa de atención y en el manejo de los pesos. El nombre "badmed" y el sufijo "seed0" sugieren que el entrenamiento se realizó con una semilla fija para reproducibilidad, pero no hay más detalles técnicos disponibles.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades de Phi-4 en razonamiento lógico, matemáticas y generación de texto coherente.
- Conocimiento médico: ajustado con datos médicos, se espera que maneje terminología clínica, diagnósticos, tratamientos y literatura biomédica, aunque no hay evidencia publicada de su rendimiento en estas tareas.
- Soporte de tool calling: no confirmado. Phi-4 base no incluye soporte nativo de tool calling en su versión estándar, y no hay información sobre si el fine-tune lo añade.
- Capacidades multilingües: limitadas. Phi-4 base está optimizado para inglés, y no hay evidencia de que el fine-tune amplíe el soporte a otros idiomas.
- Sin soporte de visión ni audio: el modelo es exclusivamente textual.

## Casos de uso

- Asistencia a profesionales médicos para la elaboración de informes clínicos: el modelo puede generar borradores de informes estructurados a partir de notas clínicas, gracias a su entrenamiento en dominio médico.
- Soporte en educación médica: los estudiantes pueden utilizarlo para resolver preguntas tipo test de anatomía, farmacología o patología, o para explicar conceptos complejos con un lenguaje adaptado.
- Extracción de información de literatura médica: dada la ventana de 16K tokens, puede resumir artículos científicos extensos o extraer datos relevantes de múltiples documentos.
- Generación de resúmenes para pacientes: el modelo puede traducir terminología médica compleja a lenguaje comprensible para pacientes no especializados, mejorando la comunicación clínica.
- Herramienta de segunda opinión diagnóstica: aunque no debe usarse como sustituto de un profesional, puede sugerir diagnósticos diferenciales a partir de síntomas descritos, siempre bajo supervisión humana.
- Investigación farmacológica: puede ayudar a recopilar información sobre interacciones medicamentosas o efectos secundarios a partir de textos de fichas técnicas y ensayos clínicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existe evidencia de evaluación del fine-tune en tareas médicas estándar como PubMedQA, MedQA o MMLU Medical. El modelo base Phi-4 obtiene resultados competitivos en benchmarks generales como MMLU (84,8 %), GSM8K (93,9 %) y HumanEval (82,6 %), pero estos datos no son extrapolables al fine-tune sin una evaluación específica.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repo (3,7 GB) sugiere una cuantización de 4 bits, lo que requeriría aproximadamente 4-5 GB de VRAM para inferencia. Con cuantización de 8 bits, serían unos 8-10 GB.
- GPU recomendadas: RTX 3060 de 12 GB o superior para cuantización de 4 bits; RTX 4090 o A100 para cuantización completa o entrenamiento.
- Compatibilidad con GPU de consumo: sí, con cuantización de 4 bits se puede ejecutar en GPUs de 8-12 GB de VRAM.
- Opciones de despliegue: al ser un modelo basado en Phi-4, es compatible con vLLM, llama.cpp, Ollama y TGI. El formato safetensors permite cargarlo con transformers estándar.
- Latencia y throughput: no se dispone de datos específicos para este fine-tune; en el modelo base Phi-4 con cuantización de 4 bits en una RTX 4090, se pueden esperar entre 30 y 60 tokens por segundo en generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| ArthT/phi4-14b-a0-badmed-seed0-v2 | 14B | 16K | No disponible (probable MIT) | Medica |
| microsoft/phi-4 | 14B | 16K | MIT | Generalista |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 License | Generalista |
| Qwen 2.5 14B | 14B | 128K | Apache 2.0 | Generalista |

El modelo se compara directamente con Phi-4 original, del que deriva. Frente a Llama 3.1 8B y Qwen 2.5 14B, Phi-4 destaca en razonamiento y matemáticas, pero tiene una ventana de contexto menor (16K frente a 128K). La principal diferencia del fine-tune es su orientación médica, que no está presente en los modelos generalistas. Sin embargo, la falta de benchmarks propios impide evaluar si el ajuste mejora realmente el rendimiento en tareas médicas frente al base.

## Limitaciones y advertencias

- **Sesgos conocidos**: al ser un fine-tune de un modelo entrenado con datos sintéticos, puede heredar sesgos de Phi-4, y además los datos médicos de entrenamiento pueden introducir sesgos específicos del dominio (por ejemplo, sobrerrepresentación de ciertas patologías o grupos demográficos).
- **Riesgo de alucinación**: el modelo puede generar información médica falsa o inexacta con alta confianza, lo que es especialmente peligroso en un dominio donde los errores pueden tener consecuencias graves. No debe usarse sin supervisión profesional.
- **Limitaciones de contexto**: la ventana de 16K tokens es limitada para documentos médicos extensos como historias clínicas completas, lo que puede obligar a dividir el texto.
- **Idiomas**: el modelo está optimizado para inglés y puede tener un rendimiento pobre en español u otros idiomas, lo que limita su uso en entornos clínicos hispanohablantes.
- **Licencia**: no se indica la licencia del fine-tune, aunque es probable que herede la MIT de Phi-4. Sin embargo, es necesario verificar antes de un uso comercial.
- **Sin validación**: el modelo no tiene descargas ni likes, y no hay información sobre su evaluación en tareas médicas reales. Es un modelo experimental sin garantías de calidad.
- **Restricciones de uso**: la model card no especifica restricciones, pero Phi-4 base está diseñado para usos generales y no como dispositivo médico. No debe utilizarse para diagnóstico o tratamiento sin supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArthT/phi4-14b-a0-badmed-seed0-v2
- Modelo base Phi-4: https://huggingface.co/microsoft/phi-4
- Guía de despliegue local de Phi-4: https://localaimaster.com/blog/phi-4-local-setup
- Documentación de Phi-4 en slm.expert: https://slm.expert/models/phi-4-14b/
- Página de Phi-4 en Ollama: https://ollama.com/library/phi4:14b

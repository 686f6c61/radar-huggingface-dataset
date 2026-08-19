# kessenma/granite41-3b-german-tutor-v4-4bit

## Resumen

El modelo `kessenma/granite41-3b-german-tutor-v4-4bit` es un ajuste fino QLoRA del modelo base `ibm-granite/granite-4.1-3b`, especializado en la tutoría de gramática alemana. Desarrollado por el usuario kessenma, este modelo está cuantizado a 4 bits (grupo de tamaño 64, afín) para su ejecución en dispositivos mediante la librería MLX, lo que lo hace adecuado para aplicaciones de aprendizaje de idiomas en tiempo real. Su propósito principal es corregir frases en alemán, explicar los errores y ofrecer pistas para que el estudiante reflexione, siguiendo un contrato de salida estricto.

El modelo se presenta como una alternativa mejorada frente a su hermano `granite33-2b-german-tutor-v4-4bit`, con un mayor número de parámetros (aunque el archivo safetensors reporta 531.868.160 parámetros, el modelo base original tiene aproximadamente 3 mil millones) y una capacidad de detección de errores notablemente superior. Según las evaluaciones del autor, alcanza un 81% de aciertos en una suite combinada de 203 ítems, frente al 55% del modelo base sin ajustar. Su relevancia radica en ofrecer una solución ligera y de código abierto (licencia Apache 2.0) para la enseñanza asistida de alemán, con un enfoque en la corrección gramatical y la interacción conversacional.

La arquitectura se basa en el transformer de Granite 4.1, con un vocabulario de aproximadamente 100.000 tokens que tokeniza el alemán de forma más eficiente que el modelo de 2B, compensando en latencia el mayor tamaño. El entrenamiento se realizó sobre un corpus de 42.841 frases que cubren 15 fenómenos gramaticales, con una distribución de 70% de correcciones y 30% de frases correctas, validado con LanguageTool y spaCy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Granite 4.1) |
| Parametros totales | 531.868.160 (según safetensors; el modelo base tiene ~3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (group size 64, affine) |
| Idiomas soportados | Alemán (de), Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de `ibm-granite/granite-4.1-3b`, un transformer denso de 3 mil millones de parámetros. Sobre esta base se aplicó un ajuste fino con QLoRA (rango r=32), que permite adaptar el modelo con un coste reducido de memoria y computación. Posteriormente, los pesos resultantes se cuantizaron a 4 bits con grupo de tamaño 64 y cuantización afín, optimizados para la inferencia en MLX, la librería de aprendizaje automático de Apple para silicio propio.

El entrenamiento se realizó sobre el corpus v4, compuesto por 42.841 filas que abarcan 15 fenómenos gramaticales del alemán. Cada fenómeno incluye un 70% de ejemplos con errores a corregir y un 30% de frases correctas. Los datos fueron generados por un profesor automático (gemma-4-31B en volumen, con revisión de Claude Sonnet) y validados mediante LanguageTool y spaCy. El modelo aprende a distinguir entre frases correctas (responde `OK`) e incorrectas, para las que genera una corrección, una explicación breve y una pista en formato de pregunta.

## Capacidades

- Corrección gramatical de frases en alemán, con detección de errores y propuesta de versión corregida.
- Explicación de errores en una línea, indicando la regla o el motivo de la corrección.
- Generación de pistas en forma de pregunta para guiar al estudiante sin dar la respuesta directamente.
- Distinción entre frases correctas e incorrectas, respondiendo `OK` cuando no hay errores.
- Conversación multilingüe limitada a alemán e inglés, con capacidad de mantener un diálogo de tutoría.
- Generación de texto en formato estructurado según el contrato de salida (`FIX`, `WHY`, `HINT`), fácilmente parseable por aplicaciones.
- Optimizado para inferencia en dispositivos Apple con MLX, aunque también puede ejecutarse en otros entornos mediante conversión.

## Casos de uso

- Tutor de alemán integrado en aplicaciones móviles de aprendizaje de idiomas: el modelo puede recibir frases escritas por el estudiante y devolver correcciones y explicaciones en tiempo real, gracias a su tamaño reducido y su formato de salida estructurado.
- Corrector gramatical para redacción en alemán: útil para estudiantes o profesionales que necesitan revisar textos breves, ofreciendo una explicación didáctica de cada error.
- Práctica de gramática interactiva: el modelo puede generar ejercicios donde el usuario escribe frases y recibe retroalimentación, fomentando la reflexión mediante las pistas.
- Asistente de escritura en alemán para no nativos: integrable en editores de texto o extensiones de navegador para sugerir correcciones con explicaciones.
- Herramienta de evaluación automatizada en plataformas educativas: el contrato de salida permite que un parser identifique fácilmente si una respuesta es correcta o no, y extraiga la corrección y la explicación.
- Chatbot de conversación en alemán con enfoque gramatical: puede mantener diálogos sencillos y corregir errores del usuario, útil para practicar conversación con retroalimentación inmediata.

## Benchmarks y rendimiento

El autor proporciona resultados en una suite de evaluación propia, comparando el modelo con su hermano de 2B y con el modelo base sin ajustar. La métrica principal es el porcentaje de respuestas que el parser de la aplicación mostraría al estudiante (convención "app-guard").

| Suite | Ítems | Granite 4.1 v4 | Granite 3.3 v4 | Stock 4.1 |
|---|---|---|---|---|
| Core grammar (v0) | 60 | 47 (78%) | 46 (77%) | 31 (52%) |
| Extension (v1ext) | 61 | 46 (75%) | 39 (64%) | 39 (64%) |
| Holdout (v2) | 82 | 71 (87%) | 68 (83%) | 41 (50%) |
| Combined | 203 | 164 (81%) | 153 (75%) | 111 (55%) |

Además, se reportan métricas de comportamiento: tasa de falsas correcciones del 9%, tasa de errores no detectados del 25% (frente al 0% y 43% del hermano 3.3, que tiende a no corregir), y naturalidad con 12,0 partículas modales por cada 100 tokens y una tasa de seguimiento de 0,82. En comparación pareada con el hermano 3.3, el modelo gana en 26 ítems y pierde en 15 (p exacta de McNemar = 0,12).

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 1,9 GB, lo que sugiere que la inferencia en 4 bits requiere aproximadamente 2 GB de VRAM o memoria unificada.
- Diseñado para MLX, por lo que se ejecuta de forma nativa en dispositivos Apple con chips M1 o posteriores (Mac, iPad, iPhone).
- En GPUs de escritorio, puede ejecutarse mediante conversión a formatos como GGUF o con librerías que soporten safetensors cuantizados, aunque no se proporcionan instrucciones específicas.
- Se estima que cabe en GPUs consumer con al menos 4 GB de VRAM, como una NVIDIA GTX 1650 o RTX 3050, pero no hay datos oficiales de latencia o throughput.
- Opciones de despliegue: MLX (recomendado), conversión a llama.cpp u Ollama para CPU/GPU, o uso con vLLM si se convierte a un formato compatible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (suite combinada) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| granite41-3b-german-tutor-v4-4bit | ~3B (531M en safetensors) | No disponible | 81% | Apache 2.0 | Hugging Face |
| granite33-2b-german-tutor-v4-4bit | ~2B | No disponible | 75% | Apache 2.0 | Hugging Face |
| ibm-granite/granite-4.1-3b (stock) | ~3B | No disponible | 55% | Apache 2.0 | Hugging Face |

El modelo supera claramente al stock y al hermano de 2B en la tarea específica de tutoría gramatical, aunque el hermano de 2B tiene una tasa de falsas correcciones del 0% (a costa de no detectar muchos errores). La elección entre ambos depende de si se prioriza la sensibilidad (este modelo) o la especificidad (el de 2B).

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en la corrección gramatical del alemán; su rendimiento en otros idiomas o tareas generales no está garantizado.
- La tasa de falsas correcciones es del 9%, lo que puede confundir a los estudiantes si se presenta una corrección incorrecta como válida.
- La tasa de errores no detectados es del 25%, por lo que no todas las frases incorrectas serán corregidas.
- El corpus de entrenamiento se limita a 15 fenómenos gramaticales; errores fuera de ese alcance pueden no ser manejados adecuadamente.
- No se dispone de información sobre la longitud de contexto soportada, lo que limita su uso en conversaciones muy largas o documentos extensos.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo se distribuye sin garantías y no se han publicado evaluaciones de sesgos o robustez.
- Para producción, se recomienda validar las salidas con herramientas externas (como LanguageTool) y diseñar un parser robusto para el contrato de salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kessenma/granite41-3b-german-tutor-v4-4bit
- Modelo hermano (2B): https://huggingface.co/kessenma/granite33-2b-german-tutor-v4-4bit
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-3b

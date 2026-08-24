# Irfanuruchi/MedPsy-4B-MLX-6bit

## Resumen

MedPsy-4B-MLX-6bit es una conversión al formato MLX con cuantización de 6 bits del modelo MedPsy-4B, desarrollado por Irfanuruchi a partir del modelo original de QVAC. MedPsy-4B es un modelo de razonamiento clínico y asistencia médica basado en Qwen3-4B-Thinking-2507, ajustado mediante supervisión fina y aprendizaje por refuerzo. Esta variante MLX está optimizada para inferencia en dispositivos Apple Silicon, reduciendo el tamaño del modelo a aproximadamente 3,1 GB y permitiendo velocidades de generación cercanas a 35 tokens por segundo en un MacBook Pro con chip M3 Pro.

La relevancia de esta conversión reside en que facilita el despliegue local de un modelo médico especializado en hardware de consumo, sin depender de servicios en la nube. El modelo conserva las capacidades de razonamiento del modelo base, incluida la emisión de una sección de pensamiento previa a la respuesta final, y está sujeto a la licencia Apache 2.0, lo que permite su uso y redistribución con las debidas atribuciones.

Aunque el repositorio reporta un número de parámetros totales de 880.068.096 según los safetensors, el modelo se publica bajo la denominación «4B» por su relación con la familia Qwen3-4B. El contexto máximo declarado por el modelo base es de 256K tokens, aunque esta cifra debe verificarse en la implementación MLX concreta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3) |
| Parámetros totales | 880.068.096 (según safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K (según modelo base qvac/MedPsy-4B) |
| Tipos de cuantización | MLX 6-bit (affine, group size 64, 6.5 bits efectivos por peso) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

MedPsy-4B-MLX-6bit es una conversión del modelo MedPsy-4B de QVAC, que a su vez se basa en Qwen3-4B-Thinking-2507. La arquitectura subyacente es un transformer estándar con atención de múltiples cabezas, que incorpora un mecanismo de razonamiento explícito: el modelo puede generar una sección de pensamiento (thinking) antes de la respuesta final, similar al modo de razonamiento de otros modelos de la familia Qwen. No se trata de un modelo MoE ni de una arquitectura híbrida, sino de un transformer denso con 4.000 millones de parámetros en su versión original (aunque el repositorio MLX reporta 880M parámetros en los safetensors, probablemente por un error de medición o por la cuantización).

El entrenamiento del modelo base, descrito por QVAC, combina supervisión fina (SFT) con refuerzo (RL), orientado a tareas de razonamiento clínico y comprensión de terminología médica. No se dispone de información detallada sobre el número de tokens de entrenamiento ni la composición del dataset. La conversión MLX fue realizada con MLX-LM 0.31.3 y MLX 0.32.1, y no modifica los pesos del modelo original, sino que aplica una cuantización de 6 bits con grupo de tamaño 64 para reducir el uso de memoria.

## Capacidades

- Generación de texto médico y respuestas a preguntas clínicas, con razonamiento multi-paso visible en una sección de pensamiento opcional.
- Comprensión de conceptos de medicina, fisiología, farmacología y diagnóstico diferencial, limitada al idioma inglés.
- Conversación multi-turno gracias a la plantilla de chat de Qwen3.
- No se documenta soporte para tool calling, function calling, ni uso como agente autónomo.
- Capacidad de procesamiento de contexto largo (hasta 256K tokens en el modelo base), aunque la versión MLX puede tener limitaciones de memoria en dispositivos con poca RAM.
- Sin capacidades multimodales: es un modelo solo de texto.

## Casos de uso

- Educación médica: estudiantes y profesionales pueden plantear preguntas sobre conceptos clínicos y recibir explicaciones razonadas, gracias a la sección de pensamiento que muestra el proceso de razonamiento.
- Asistencia en documentación clínica: generación de resúmenes de historias clínicas, informes de alta o notas de evolución, siempre bajo revisión humana.
- Apoyo a la investigación bibliográfica: resumen de artículos científicos y extracción de información relevante sobre tratamientos o patologías.
- Formación de pacientes: explicación de términos médicos y procedimientos de forma comprensible, con advertencias de que no sustituye el criterio profesional.
- Prototipado de chatbots médicos: integración en sistemas de conversación para demostraciones o entornos educativos, con supervisión clínica.
- Automatización de preguntas frecuentes en portales de salud: respuestas a consultas comunes sobre síntomas, medicación o hábitos saludables, con la advertencia de que no se usa para diagnóstico real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los datos de rendimiento proporcionados corresponden a una ejecución local de validación en un Apple M3 Pro con 18 GB de memoria unificada, no a evaluaciones clínicas o de referencia:

- Prompt processing: 156.119 tokens/s
- Generación: 35.439 tokens/s
- Memoria pico: 3.473 GB

Estos valores son de una sola ejecución y no representan un benchmark estándar.

## Requisitos de hardware

- Memoria mínima estimada: 3.473 GB de memoria unificada en Apple Silicon (según la validación del autor).
- GPU recomendadas: chips Apple Silicon (M1, M2, M3, M4) con al menos 8 GB de memoria unificada para la variante 6-bit.
- No es necesario GPU dedicada; funciona con la memoria unificada de los Mac.
- Despliegue mediante `mlx-lm` (CLI y Python), compatible con macOS.
- No se documentan otras opciones de despliegue (vLLM, Ollama, etc.) para esta conversión específica, aunque el modelo base podría ejecutarse con librerías estándar de Transformers.
- La velocidad de generación medida es de 35.439 tokens/s en M3 Pro, con 3.473 GB de memoria pico. En dispositivos con menos memoria, se recomienda la variante 4-bit (2.468 GB pico) o 8-bit (4.459 GB pico).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MedPsy-4B-MLX-6bit (este) | 880M (según safetensors) | 256K (base) | Apache 2.0 | MLX 6-bit | Optimizado para Apple Silicon |
| MedPsy-4B (original) | ~4B | 256K | Apache 2.0 | Transformers | Modelo base sin cuantizar |
| Qwen3-4B-Thinking-2507 | 4B | 256K | Apache 2.0 | Transformers | Modelo generalista con razonamiento |

La comparativa se basa en los datos disponibles; no se han encontrado evaluaciones comparativas entre estas variantes. La conversión MLX mantiene la arquitectura y el entrenamiento del modelo original, con la ventaja de un menor uso de memoria en hardware de Apple.

## Limitaciones y advertencias

- No es un dispositivo médico: el modelo no puede usarse para diagnóstico, tratamiento o decisiones clínicas reales.
- Puede generar respuestas incorrectas, incompletas o engañosas con apariencia de autoridad médica; todo resultado debe ser revisado por profesionales cualificados.
- Solo está entrenado en inglés; no se garantiza la calidad en otros idiomas.
- La cuantización de 6 bits puede degradar ligeramente la precisión respecto al modelo original, aunque no se han realizado evaluaciones comparativas.
- La licencia Apache 2.0 permite uso comercial, pero se deben revisar los archivos `LICENSE` y `ATTRIBUTIONS.md` incluidos en el repositorio.
- La información de rendimiento y memoria proviene de una única ejecución local y no es una referencia garantizada para todos los entornos.
- El número de parámetros reportado en los safetensors (880M) no coincide con la denominación «4B»; se recomienda verificar la documentación oficial antes de asumir capacidades.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Irfanuruchi/MedPsy-4B-MLX-6bit
- Variante 4-bit: https://huggingface.co/Irfanuruchi/MedPsy-4B-MLX-4bit
- Variante 8-bit: https://huggingface.co/Irfanuruchi/MedPsy-4B-MLX-8bit
- Modelo base qvac/MedPsy-4B: https://huggingface.co/qvac/MedPsy-4B
- Blog de investigación MedPsy: https://huggingface.co/blog/qvac/medpsy
- Perfil de GitHub del autor: https://github.com/IrfanUruchi/
- Ficha del modelo en LLM Explorer: https://llm-explorer.com/model/qvac%2FMedPsy-4B,3ryB0zYS96Q1mn7DQQ9aeo

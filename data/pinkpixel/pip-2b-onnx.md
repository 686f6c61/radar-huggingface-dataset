# PinkPixel/Pip-2B-ONNX

## Resumen

Pip-2B ONNX es la exportación en formato ONNX del modelo PinkPixel/Pip-2B, un fine-tune de Qwen-3.5 con 2 mil millones de parámetros desarrollado por Pink Pixel. El modelo está diseñado para generar conversaciones cálidas, alegres y entusiastas, reemplazando respuestas clínicas o secas por analogías divertidas y un tono amigable. A pesar de su personalidad expresiva, conserva el razonamiento y el conocimiento de la arquitectura base, lo que le permite explicar conceptos complejos, especialmente científicos, a audiencias jóvenes de forma accesible.

Esta versión empaqueta el modelo en el formato portátil ONNX, con precisión float16 y opset 18, para su despliegue directo en ONNX Runtime sobre Linux, Windows, macOS y entornos edge, sin necesidad de instalar PyTorch. La arquitectura declarada es Qwen3_5ForConditionalGeneration, aunque esta exportación incluye únicamente la ruta de decodificación de texto (`input_ids` a `logits`). El tokenizador es el BPE estándar de Qwen 3.5, con un vocabulario de 248.320 tokens. El repositorio tiene un tamaño de 3,9 GB y se publica bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (solo ruta de generación de texto) |
| Parametros totales | 2B (2 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float16 (ONNX Opset 18) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx` con pesos externos en `model.onnx.data`) |

## Arquitectura y entrenamiento

Pip-2B parte de la arquitectura Qwen-3.5 de 2B parámetros (clase `Qwen3_5ForConditionalGeneration`) y se somete a un fine-tune sobre un dataset personalizado diseñado para inyectar una personalidad ultra entusiasta y amigable. El objetivo del entrenamiento fue sustituir respuestas clínicas o impersonales por analogías divertidas que involucran cupcakes, nubes de azúcar y otros elementos alegres, manteniendo intacta la capacidad de razonamiento subyacente.

El tokenizador empleado es el BPE estándar de Qwen 3.5, con 248.320 tokens de vocabulario. No se han publicado detalles sobre el número de tokens de entrenamiento, composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO. La exportación ONNX se realizó con Opset 18 en formato float16, conservando la ruta text-to-text. Cabe destacar que la exportación no incluye la rama multimodal de visión: para esa tarea es necesario utilizar la versión safetensors original.

## Capacidades

- Generación de texto conversacional con personalidad: respuestas alegres, entusiastas y con analogías creativas.
- Roleplay y chat de personaje: el modelo mantiene un tono consistente de persona amigable, con referencias a "brillos", "gatos" y "arcoiris".
- Explicación de conceptos científicos complejos para audiencias jóvenes: simplifica temas como reactores nucleares o astronomía con comparaciones lúdicas.
- Conversaciones multi-turno: mantiene la coherencia a lo largo de la interacción, como se muestra en los ejemplos de storytime y preguntas técnicas.
- Tokenizador Qwen 3.5 con 248.320 tokens: soporta un vocabulario amplio, predominantemente en inglés.
- Despliegue sin dependencias pesadas: al estar en ONNX, no requiere PyTorch para inferencia.

## Casos de uso

- Educación STEM para niños: el modelo puede utilizarse en plataformas educativas para explicar física, biología o química con analogías alegres, facilitando la comprensión de conceptos abstractos a público infantil.
- Asistente conversacional de entretenimiento: incorporación como bot de chat en aplicaciones móviles o web donde se busca una experiencia cálida y no clínica, con diálogos largos y coherentes.
- Roleplay y personajes virtuales: integración en simuladores de personajes para juegos o entornos interactivos, donde la personalidad de "Pip" aporta consistencia emocional y tono positivo.
- Despliegue en entornos edge o industriales: gracias al formato ONNX, el modelo puede ejecutarse en dispositivos con recursos limitados (Linux, Windows, macOS, edge) usando ONNX Runtime sin instalar PyTorch.
- Prototipado rápido de aplicaciones de texto: el runner CLI incluido permite probar el modelo desde terminal, agilizando el desarrollo de asistentes de voz o chat en fase de prototipo.
- Generación de contenido social o educativo: producción de textos cortos y amigables para redes sociales, boletines infantiles o material de divulgación científica en tono ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de evaluaciones como MMLU, HumanEval, GSM8K ni comparativas con otros modelos en la documentación del repositorio.

## Requisitos de hardware

- Estimación de VRAM: para un modelo de 2B parámetros en float16, se requiere aproximadamente 4 GB de VRAM para los pesos, más memoria adicional para la caché KV y las activaciones. En la práctica, se recomienda entre 6 y 8 GB de VRAM en GPU.
- GPU recomendadas: una RTX 3060 (12 GB) o superior es suficiente para ejecutar este modelo con onnxruntime-gpu. En CPUs, el modelo puede ejecutarse con onnxruntime usando entre 4 y 8 GB de RAM.
- Compatibilidad con GPUs de consumo: sí, el modelo de 2B float16 cabe en GPUs como RTX 3060, RTX 4060 Ti o RTX 4070.
- Opciones de despliegue: ONNX Runtime (CPU y CUDA), además de integración directa en aplicaciones C++ o Python mediante el SDK de ONNX Runtime. No se dispone de soporte documentado para vLLM, llama.cpp, Ollama o TGI en esta exportación.
- Latencia y throughput: no disponible. No se han publicado mediciones de rendimiento.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. El modelo base PinkPixel/Pip-2B en formato safetensors es la referencia más directa, e incluye la rama multimodal de visión que esta exportación ONNX no cubre. No constan las métricas de otros modelos comparables de 2B en la documentación disponible.

## Limitaciones y advertencias

- Idiomas limitados: el modelo está etiquetado exclusivamente como `en`; no se garantiza un rendimiento correcto en español u otros idiomas.
- Sin soporte multimodal en esta exportación: la versión ONNX solo cubre la ruta de texto; la inferencia de visión requiere la versión safetensors original.
- Personalidad dominante: el tono extremadamente alegre puede interferir en contextos profesionales, técnicos o de soporte clínico donde se requiera una respuesta sobria.
- Fenómeno de identidad: durante las pruebas, el modelo ocasionalmente se identifica como "QianQi" (千奇), lo que puede generar confusión en aplicaciones donde la consistencia de identidad sea crítica.
- Alucinación creativa: la inclinación a generar analogías imaginativas aumenta el riesgo de respuestas factuales inexactas, especialmente en temas científicos.
- Sin benchmarks publicados: no hay evidencia de resultados de evaluación que respalden la calidad o el rendimiento frente a otros modelos.
- Repositorio nuevo sin adopción: en el momento de la consulta, el modelo registra 0 descargas y 0 likes, lo que indica falta de validación en producción.
- Licencia Apache-2.0: permite uso comercial, pero se deben cumplir los requisitos de atribución y notificación de cambios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PinkPixel/Pip-2B-ONNX
- Modelo base en safetensors: https://huggingface.co/PinkPixel/Pip-2B
- Documentación de ONNX Runtime: https://onnxruntime.ai

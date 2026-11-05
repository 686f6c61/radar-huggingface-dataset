# OxBee/Qwen3.5-0.8B-Astra-WeightEdit

## Resumen

Qwen3.5-0.8B-Astra-WeightEdit es una variante del modelo Qwen3.5-0.8B de Alibaba Qwen en la que se han modificado directamente dos tensores de los pesos, sin ningún tipo de entrenamiento adicional. La edición, realizada por un LLM (GPT-6 Astra) y publicada por el equipo de MIT CSAIL (Rikiya Takehi, Jayden Teoh, Alex Zhang y Omar Khattab), consiste en restar una dirección de bucle de repetición a 64 columnas de salida de la capa `mlp.down_proj` en las capas 15 y 19. El repositorio de HuggingFace lo mantiene el usuario OxBee, que se limita a aplicar el diff liberado por los autores y verificar que coincide hash por hash con el checkpoint evaluado.

El modelo base es un transformer denso de 873.438.784 parámetros (aproximadamente 0,87B), con pipeline `image-text-to-text`, lo que indica capacidades multimodales de entrada imagen-texto. La intervención afecta a unos 130.000 pesos, el 0,016% del total, y el resto del checkpoint es byte a byte idéntico al original. El problema que aborda es un fallo concreto: los bucles de repetición en modo thinking que hacían que el modelo base agotara el límite de tokens sin producir respuesta final.

La relevancia de esta ficha es doble. Por un lado, documenta un caso práctico de edición de pesos en espacio de pesos (weight-space programming) como alternativa al fine-tuning. Por otro, advierte de que la mejora reportada elimina un modo de fallo, no añade capacidad nueva: la mayor parte de la ganancia en benchmarks proviene de respuestas que dejan de truncarse por el límite de tokens. El autor indica que el benchmarking independiente está en curso y que los resultados de la tabla proceden de los autores originales, no reproducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), multimodal image-text-to-text |
| Parametros totales | 873.438.784 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 (modelo base); la edicion es CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.5 con pipeline multimodal de entrada imagen-texto, según los tags del repositorio (`image-text-to-text`, `qwen3_5`). No se dispone de detalles sobre el número de capas totales, dimensión oculta, mecanismo de atención ni composición del dataset de preentrenamiento en la información proporcionada. Tampoco se documenta si el modelo base pasó por RLHF, DPO u otras fases de alineamiento.

La innovación técnica de esta variante no está en el entrenamiento, sino en la edición directa de pesos. Un LLM (GPT-6 Astra) identificó una dirección de bucle de repetición y la restó de 64 columnas de salida de `mlp.down_proj` en las capas 15 y 19, afectando a unos 130.000 pesos (0,016% del modelo). No hay gradient descent, ni datos de entrenamiento, ni ajuste de hiperparámetros: es una intervención quirúrgica sobre dos tensores. El script de reconstrucción (`exp8_math/code/apply_edit.py`) verifica el hash de cada tensor contra la revisión base `2fc06364`, lo que permite reproducir la edición de forma determinista.

## Capacidades

- Generación de texto y razonamiento conversacional, heredadas del modelo base Qwen3.5-0.8B.
- Procesamiento multimodal de entrada imagen-texto, según el pipeline declarado (`image-text-to-text`).
- Razonamiento matemático en modo thinking, con el modo de fallo de bucles de repetición corregido mediante la edición de pesos.
- Capacidad de seguir instrucciones (evaluada en IFEval según los datos de los autores).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking con parámetros de muestreo específicos (temperatura 0.6, top_p 0.95, top_k 20, presence_penalty 1.5, 32k tokens).

## Casos de uso

- Razonamiento matemático con modelos pequeños en producción: el modelo está pensado para tareas de matemáticas donde el bucle de repetición del base provocaba truncamiento por límite de tokens; la edición reduce ese fallo y permite obtener respuestas finales dentro del presupuesto de tokens.
- Evaluación de técnicas de edición de pesos: sirve como caso de estudio reproducible para investigadores que quieran comparar weight-space programming frente a fine-tuning tradicional, ya que el diff y el script de aplicación están publicados.
- Despliegue en entornos con recursos limitados: con menos de 900M de parámetros, es candidato para inferencia en GPU de consumo, aunque no se dispone de cifras de VRAM ni de cuantizaciones publicadas.
- Prototipado de asistentes multimodales ligeros: el pipeline image-text-to-text permite experimentar con entrada de imagen y texto en un modelo de menos de 1B de parámetros.
- Generación de respuestas con seguimiento de instrucciones en modo thinking: útil en pipelines donde se necesita razonamiento explícito y se quiere evitar que el modelo entre en bucles infinitos.
- Investigación sobre robustez y alucinación en modelos pequeños: la comparación base frente a editado permite aislar el efecto de un único modo de fallo sobre métricas de razonamiento.

## Benchmarks y rendimiento

Los datos siguientes proceden de los autores originales (MIT CSAIL) y no han sido reproducidos de forma independiente por el publicador del repositorio, que indica que el benchmarking está en curso. Configuración: thinking on, temperatura 0.6, top_p 0.95, top_k 20, presence_penalty 1.5, 32k tokens.

| Modelo | MATH-500 | GSM8K | IFEval | MMLU-Pro |
|---|---|---|---|---|
| Base Qwen3.5-0.8B | 7.9 | 13.8 | 21.0 | 40.3 |
| Editado (Astra) | 48.1 | 67.1 | 62.3 | 45.5 |

El propio autor advierte de que la mayor parte de la ganancia proviene de respuestas que dejan de truncarse por el límite de tokens (la tasa de corte pasa del 93% al 33%). Con thinking off, el modelo base no entra tanto en bucle, por lo que la comparación relevante debería hacerse también contra esa configuración, dato que no está disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 873M de parámetros, en fp16 requeriría aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y KV cache, pero no hay cifras oficiales.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: probable por tamaño (menos de 1B de parámetros), pero no confirmado en la información proporcionada.
- Opciones de despliegue: la model card menciona vLLM para la reproducción de benchmarks y un build ONNX / Transformers.js como TODO pendiente; no se documentan despliegues con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-0.8B-Astra-WeightEdit | 873.438.784 | no disponible | Apache 2.0 (base) + CC BY 4.0 (edicion) | Edicion de 2 tensores, sin entrenamiento |
| Qwen3.5-0.8B (base) | 873.438.784 | no disponible | Apache 2.0 | Punto de partida; bucles de repeticion en thinking |
| Otros modelos ~1B de la familia Qwen | no disponible | no disponible | no disponible | No se dispone de datos en la informacion proporcionada |

No se dispone de información sobre modelos comparables de otros autores en la documentación proporcionada, por lo que la comparativa se limita al modelo base y a la variante editada.

## Limitaciones y advertencias

- La edición elimina un modo de fallo, no añade capacidad nueva; el propio autor lo subraya explícitamente.
- Los resultados de benchmarks proceden de los autores originales y no han sido reproducidos de forma independiente; el benchmarking independiente está marcado como en curso.
- El grader original (`mathqa.py`) importa un módulo interno (`mcqa`) no liberado; el publicador usa un sustituto de una función, lo que puede introducir diferencias menores en la evaluación.
- `evaluate.py` también requiere un paquete interno no disponible; el script alternativo de MATH-500 copia prompt, muestreo y ajustes de vLLM, pero no es el oficial.
- Sesgos conocidos: no documentados en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada; el modelo base obtiene 40,3 en MMLU-Pro, lo que sugiere margen de error considerable en conocimiento factual.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada.
- Restricciones de licencia: el modelo base es Apache 2.0 y la edición es CC BY 4.0, lo que exige atribución a los autores de la edición en usos derivados.
- El repositorio tiene 38 descargas y 0 likes en el momento de la consulta, lo que indica poca validación por parte de la comunidad.
- El publicador no está afiliado ni respaldado por los autores originales, OpenAI ni Qwen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OxBee/Qwen3.5-0.8B-Astra-WeightEdit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Blog de los autores (Sparks of Weight-Space Programming): https://rikiyat.github.io/blog/weight-space-programming/
- Logs y edición (GitHub, rama `4d09ba6d6a7e891dd8063974dfe81b3d78e3494f`, carpeta `exp8_math`): https://github.com/RikiyaT/lm_understand-logs/tree/4d09ba6d6a7e891dd8063974dfe81b3d78e3494f/exp8_math
- Script de aplicación de la edición: `exp8_math/code/apply_edit.py` (revisión base `2fc06364`)
- Cita BibTeX: Takehi, Rikiya; Teoh, Jayden; Zhang, Alex; Khattab, Omar (2026), "Sparks of Weight-Space Programming: LLMs can natively read & write neural network weights"

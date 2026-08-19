# DanilKZ/TUPOI-1

## Resumen

TUPOI-300M es un modelo de lenguaje experimental de 304,2 millones de parámetros que propone una arquitectura post-transformer completamente libre de atención y de caché KV persistente. En lugar de matrices de atención densas, emplea un integrador simpléctico de Hamilton (esquema Velocity-Verlet) que modela la dinámica del contexto en un espacio de fases continuo, logrando un uso de memoria estrictamente constante de 6,00 KB de VRAM independientemente de la longitud de la secuencia generada. El modelo ha sido desarrollado por un investigador independiente bajo el sello NARE LABS y publicado con licencia MIT.

La relevancia de TUPOI-300M radica en su propuesta de eliminar por completo el mecanismo de atención, una de las principales fuentes de coste cuadrático en los transformadores, sustituyéndolo por una dinámica hamiltoniana que, según sus autores, preserva la información sin disipación (determinante jacobiano igual a 1). Se trata de una prueba de concepto entrenada durante 10 000 pasos sobre el corpus TinyStories en una única GPU Tesla T4, por lo que su rendimiento lingüístico es limitado, pero su arquitectura abre vías de investigación para modelos subcuadráticos con memoria constante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Post-transformer, attention-free, integrador simpléctico Velocity-Verlet |
| Parametros totales | 304,2 millones |
| Parametros activos | No aplica (no es MoE, todos los parámetros están activos) |
| Longitud de contexto | 512 tokens (según `max_seq_len=512` en el código de ejemplo) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos en formato PyTorch `.pt`) |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (no se mencionan safetensors ni GGUF) |

## Arquitectura y entrenamiento

TUPOI-300M elimina por completo el mecanismo de atención y la caché KV persistente. En su lugar, el estado recurrente del contexto se modela mediante una dinámica hamiltoniana en un espacio de fases continuo, integrada con el esquema simpléctico Velocity-Verlet. Esta integración garantiza que el determinante jacobiano sea exactamente 1, lo que implica una conservación teórica de la información (teorema de Liouville) y una memoria de contexto constante de 6,00 KB, independientemente del número de tokens generados. La arquitectura es subcuadrática y no requiere almacenar matrices de atención.

El entrenamiento se realizó sobre el corpus TinyStories, con 10 000 pasos de optimización en una única GPU NVIDIA Tesla T4. No se especifican el número total de tokens procesados, el tamaño del lote, la tasa de aprendizaje ni si se aplicaron técnicas de alineación como RLHF o DPO. El modelo se distribuye con un checkpoint en formato `.pt` y el código de referencia está disponible en el repositorio de GitHub.

## Capacidades

- Generación de texto en inglés: el modelo es capaz de producir texto coherente a partir de un prompt, como se muestra en el ejemplo de la model card con el cuento de Lily.
- Memoria de contexto constante O(1): el estado recurrente ocupa exactamente 6,00 KB de VRAM, sin crecimiento con la longitud de la secuencia generada.
- Preservación teórica de la información: gracias a la integración simpléctica, el modelo no disipa información a lo largo de la generación, según los autores.
- Arquitectura subcuadrática: al no usar atención, el coste computacional por token es constante, lo que permite generar secuencias largas sin incremento de memoria.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio. El modelo es exclusivamente de texto.

## Casos de uso

- Investigación en arquitecturas eficientes: TUPOI-300M sirve como banco de pruebas para estudiar alternativas a la atención basadas en dinámica hamiltoniana, especialmente en entornos académicos o de laboratorio donde se busca validar la viabilidad de modelos con memoria constante.
- Generación de texto en dispositivos con memoria muy limitada: gracias a su estado recurrente de solo 6 KB, el modelo podría desplegarse en microcontroladores o sistemas embebidos que no pueden alojar cachés KV grandes, aunque su calidad lingüística es limitada.
- Experimentación con integradores simplécticos en NLP: investigadores interesados en métodos numéricos aplicados a modelos de lenguaje pueden utilizar este modelo como referencia para comparar esquemas de integración y su efecto en la coherencia del texto.
- Prototipado de sistemas de diálogo de contexto largo: la memoria constante permite mantener conversaciones de miles de tokens sin aumentar el consumo de VRAM, lo que podría explorarse en prototipos de chatbots de bajo coste.
- Educación y divulgación: al ser un modelo pequeño, abierto y con código disponible, es adecuado para cursos de arquitecturas avanzadas de deep learning, donde se puede analizar su implementación y comparar con transformadores clásicos.
- Evaluación de alternativas post-transformer: equipos que evalúan nuevas familias de modelos (como SSM o híbridos) pueden usar TUPOI-300M como punto de partida para medir el impacto de eliminar la atención en tareas de generación de texto simple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. El único dato de rendimiento es el entrenamiento en 10 000 pasos sobre TinyStories, sin indicación de perplexity ni accuracy.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 1,2 GB (304,2 M × 4 bytes), más el estado recurrente de 6 KB y overhead del framework. En fp16, el peso se reduciría a unos 0,6 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en fp32. El entrenamiento se realizó en una Tesla T4 (16 GB), pero para inferencia no se requiere tanta capacidad.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs como RTX 3060, RTX 4060, GTX 1660 Super, etc. También puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: el código de ejemplo usa PyTorch directamente. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI. El formato `.pt` requiere cargar el modelo con el código del repositorio.
- Latencia y throughput: no disponibles. Al ser una arquitectura sin atención, el coste por token es constante, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos. TUPOI-300M pertenece a la categoría de modelos sin atención (como RWKV o Mamba), pero no hay datos de rendimiento relativos en la información proporcionada. Se recomienda consultar el repositorio de GitHub para posibles benchmarks futuros.

## Limitaciones y advertencias

- Entrenamiento muy limitado: solo 10 000 pasos sobre TinyStories, un corpus pequeño y simplificado. La calidad del texto generado será baja en comparación con modelos entrenados con cientos de miles de pasos.
- Contexto máximo de 512 tokens: aunque la memoria es constante, la ventana de contexto está fijada en 512 tokens, lo que limita su uso en tareas que requieran entradas más largas.
- Sin benchmarks publicados: no hay evidencia empírica de que la arquitectura supere o iguale a los transformadores en tareas estándar.
- Riesgo de alucinación y errores: al ser un modelo pequeño y poco entrenado, es probable que genere contenido incoherente o factualmente incorrecto.
- Idioma limitado: solo inglés, sin soporte multilingüe.
- Formato de pesos propietario: los pesos se distribuyen en `.pt` y requieren el código específico del repositorio para cargarse; no hay compatibilidad con formatos estándar como safetensors o GGUF.
- Proyecto experimental: la arquitectura es una prueba de concepto y no ha sido validada en entornos de producción. No se garantiza estabilidad numérica ni reproducibilidad completa.
- Autoría y mantenimiento: el modelo está publicado por un investigador independiente; no hay una organización detrás que ofrezca soporte o actualizaciones.

## Enlaces

- HuggingFace: https://huggingface.co/DanilKZ/TUPOI-1
- Repositorio de GitHub (referencia): https://github.com/narelabs/TUPOI
- Repositorio de GitHub (autor original): https://github.com/starface77/TUPOI
- Fork con implementación alternativa: https://github.com/kukoshiro/tupoi_torch/blob/main/model.py

# onnx-community/floppyx3-MEGAmodel-merged-ONNX

## Resumen

El modelo `onnx-community/floppyx3-MEGAmodel-merged-ONNX` es una conversión a formato ONNX del modelo original `NILKNARFGonzo/floppyx3-MEGAmodel-merged`, un experimento del autor Nilky que entrena un modelo de lenguaje de aproximadamente 1 millón de parámetros (1 MB) con una LoRA sobre un dataset de conversaciones (Capybara-ShareGPT). El entrenamiento se realizó en una Raspberry Pi 5 con 8 GB de RAM, lo que lo convierte en un ejemplo extremo de entrenamiento en hardware de bajo coste. El modelo base, sin la LoRA, genera texto sin sentido, como admite el propio autor. Esta versión ONNX está pensada para ejecutarse con Transformers.js en el navegador o con ONNX Runtime, y su tamaño es tan reducido que cabe en tres disquetes de 3,5 pulgadas (de ahí el nombre "floppyx3").

A pesar de su nombre "MEGA", se trata de un modelo diminuto y de carácter lúdico, no orientado a tareas serias. Su relevancia radica en demostrar que es posible entrenar un modelo de lenguaje con recursos mínimos y en servir como base para experimentos educativos o de fine-tuning. La licencia es CC BY-SA 4.0, lo que permite uso comercial con atribución y compartir bajo la misma licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (según etiquetas, no confirmado en la documentación) |
| Parametros totales | ~1.000.000 (1M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (`.onnx`) |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura tipo GPT-2 (según las etiquetas de HuggingFace), aunque no se proporcionan detalles oficiales sobre la configuración exacta (número de capas, cabezas de atención, etc.). El entrenamiento consistió en aplicar una LoRA (Low-Rank Adaptation) sobre un modelo base de ~1M de parámetros, utilizando el dataset `ssmi153/Capybara-ShareGPT`, que contiene conversaciones en formato ShareGPT. El proceso se llevó a cabo en una Raspberry Pi 5 con 8 GB de RAM, lo que explica las limitaciones de capacidad del modelo. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. El autor indica que el modelo base (sin LoRA) genera texto incoherente, y que incluso con la LoRA sigue siendo "super tonto", por lo que planea una versión futura (floppyx4) con un dataset más grande.

## Capacidades

- Generación de texto básica: el modelo puede producir secuencias de texto, pero el autor advierte que el resultado es mayormente incoherente, especialmente en la versión base (sin LoRA).
- Conversación con formato específico: se espera que las interacciones sigan el patrón `### User: ... ### Assistant: ...`, aunque la calidad de las respuestas es muy limitada.
- No soporta tool calling, function calling, razonamiento multi-paso, ni capacidades multimodales (visión, audio, etc.).
- Multilingüismo: solo inglés, y con un vocabulario muy reducido.
- Capacidad de ejecución en entornos con recursos mínimos: gracias a su tamaño (~1M parámetros), puede ejecutarse en CPU, navegadores (vía Transformers.js) o incluso en dispositivos embebidos.

## Casos de uso

- Experimentación educativa: sirve para demostrar el ciclo completo de entrenamiento y despliegue de un modelo de lenguaje en hardware de bajo coste (Raspberry Pi), ideal para talleres o cursos de introducción a IA.
- Pruebas de concepto con Transformers.js: al ser una versión ONNX, se puede cargar directamente en el navegador para probar la generación de texto sin necesidad de servidor, útil para prototipos rápidos.
- Base para fine-tuning: aunque el modelo base es débil, su pequeño tamaño permite iterar rápidamente en entornos con recursos limitados, sirviendo como punto de partida para experimentos de adaptación con LoRA.
- Demostración de limitaciones de modelos pequeños: permite visualizar de forma tangible las diferencias entre un modelo de 1M y uno de cientos de millones de parámetros, útil para divulgación.
- Generación de texto humorístico o artístico: dado que produce salidas absurdas, podría usarse en proyectos creativos que busquen un generador de "nonsense" controlado.
- Benchmark de rendimiento en hardware modesto: al ser extremadamente ligero, se puede utilizar para medir la latencia de inferencia en CPUs antiguas o microcontroladores, aunque no hay datos oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas como MMLU, HumanEval o GSM8K, y dado el tamaño y propósito del modelo, es improbable que se hayan evaluado formalmente.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; puede ejecutarse en CPU con menos de 100 MB de RAM (el modelo pesa ~1 MB en formato ONNX, aunque el runtime puede necesitar algo más).
- GPU recomendadas: ninguna, funciona en cualquier CPU moderna, incluso en una Raspberry Pi.
- Compatibilidad con consumer GPU: sí, pero innecesario; cualquier GPU con al menos 1 GB de VRAM lo ejecutaría con holgura.
- Opciones de despliegue: Transformers.js (navegador), ONNX Runtime (Python, C++, etc.), llama.cpp (si se convierte a GGUF, aunque no está disponible en ese formato), o cualquier runtime compatible con ONNX.
- Latencia y throughput: no hay datos oficiales, pero al ser un modelo de 1M de parámetros, la generación de tokens debería ser casi instantánea en hardware moderno, incluso en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de exactamente 1M de parámetros con licencia CC BY-SA 4.0. Modelos como GPT-2 pequeño (124M) o TinyStories (28M) son órdenes de magnitud mayores y con capacidades muy superiores, por lo que no son comparables directamente. Se puede considerar que este modelo es único en su categoría por su tamaño extremadamente reducido y su origen experimental.

## Limitaciones y advertencias

- El modelo genera texto mayormente incoherente, incluso con la LoRA aplicada; no es apto para tareas de producción ni para uso serio.
- No se han documentado sesgos específicos, pero al ser entrenado con un dataset pequeño y no curado, es probable que refleje sesgos presentes en los datos de Capybara-ShareGPT.
- Riesgo de alucinación: extremadamente alto, ya que el modelo no tiene capacidad de razonamiento ni memoria a largo plazo.
- Limitaciones de contexto: no se especifica la longitud máxima, pero dado el tamaño del modelo, es probable que sea muy corta (pocas decenas de tokens).
- Restricciones de licencia: CC BY-SA 4.0 permite uso comercial, pero cualquier obra derivada debe compartirse bajo la misma licencia. Esto puede ser un inconveniente para integraciones propietarias.
- El autor recomienda usar la rama `min` en lugar de `main` si se busca un comportamiento ligeramente mejor, pero sigue siendo un modelo de juguete.
- No hay soporte oficial ni mantenimiento; es un proyecto personal sin garantías.

## Enlaces

- [Modelo ONNX en HuggingFace](https://huggingface.co/onnx-community/floppyx3-MEGAmodel-merged-ONNX)
- [Modelo original (NILKNARFGonzo/floppyx3-MEGAmodel-merged)](https://huggingface.co/NILKNARFGonzo/floppyx3-MEGAmodel-merged)
- [Modelo base sin merge (NILKNARFGonzo/floppyx3-MEGAmodel)](https://huggingface.co/NILKNARFGonzo/floppyx3-MEGAmodel)
- [Documentación de Transformers.js para text-generation](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TextGenerationPipeline)
- [Repositorio ONNX en GitHub](https://github.com/onnx/onnx)

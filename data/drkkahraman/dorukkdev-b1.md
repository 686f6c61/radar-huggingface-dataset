# drkkahraman/dorukkdev-b1

## Resumen

DorukkDev B1 es un modelo de lenguaje publicado en Hugging Face por el usuario drkkahraman bajo licencia Apache 2.0. Según la información disponible en el repositorio de Ollama, se trata de un modelo orientado específicamente a tareas de programación (coding). El autor declara en su perfil de GitHub experiencia en Edge AI y "Nano LLM", con modelos propios que van desde 1,6 millones hasta 685 millones de parámetros, desarrollados íntegramente en local sobre Ubuntu 22.04.

La model card del repositorio de Hugging Face es prácticamente vacía: solo contiene la declaración de licencia Apache 2.0, sin descripción, sin especificaciones técnicas ni datos de entrenamiento. No hay información publicada sobre arquitectura, número de parámetros, longitud de contexto, idiomas soportados ni proceso de entrenamiento. El modelo no registra descargas ni interacciones en el momento de la consulta.

Por el contexto del autor (modelos de entre 1,6M y 685M de parámetros para edge computing) y la referencia a Ollama, es razonable situar este modelo en la categoría de modelos pequeños o "nano" para despliegue local, aunque no se confirma ningún dato concreto. Su relevancia actual es limitada dada la ausencia de documentación y de resultados verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el autor trabaja con rangos de 1,6M a 685M en sus modelos, sin confirmar para este) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (disponible en formato Ollama, lo que implica algún esquema de cuantizacion GGUF, sin detalle) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en Hugging Face; existe una distribucion en Ollama |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. No hay datos sobre si emplea un transformer estándar, una variante MoE, SSM o arquitectura híbrida. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

El único dato contextual proviene del perfil del autor, que menciona el desarrollo de modelos propios de entre 1,6M y 685M de parámetros en hardware local, orientados a edge AI y dispositivos IoT. No obstante, no se confirma que DorukkDev B1 pertenezca a ese rango ni que comparta ese proceso de entrenamiento.

## Capacidades

- Generación de texto orientada a programación, según la descripción del repositorio de Ollama ("AI model specifically for coding").
- No se documentan capacidades de razonamiento avanzado, matemáticas o visión.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Asistencia de autocompletado de código en editores locales: por su distribución en Ollama y su orientación declarada a programación, podría integrarse en flujos de autocompletado en el IDE, aunque sin datos de latencia ni calidad verificables.
- Despliegue en entornos con recursos limitados: si el modelo se sitúa en el rango de modelos pequeños del autor (hasta 685M de parámetros), sería apto para ejecución en CPU o GPU de gama baja, aunque esto no está confirmado.
- Experimentación educativa: útil como ejemplo de modelo publicado con licencia permisiva para estudiar el proceso de publicación y despliegue en Ollama.
- Pruebas de concepto de generación de código en pipelines internos: la licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que facilita su evaluación en prototipos.
- Evaluación comparativa de modelos pequeños: puede servir como referencia en estudios sobre modelos nano, siempre que se validen sus capacidades de forma empírica.
- Integración en herramientas de desarrollo con Ollama: al existir una distribución en el registro de Ollama, se puede desplegar con un solo comando para pruebas locales de generación de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Si el modelo se situara en el rango de 685M de parámetros, una cuantización de 4 bits requeriría aproximadamente 0,5 GB, pero este dato no está confirmado.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; probable si el modelo es de tamaño reducido, pero sin datos verificables.
- Opciones de despliegue: distribución disponible en Ollama (ollama.com/dorukkdev/b1). No se documenta soporte para vLLM, llama.cpp, TGI u otros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de datos de parámetros, contexto ni rendimiento del modelo que permitan una comparación fundamentada con alternativas de la misma categoría.

## Limitaciones y advertencias

- Model card vacía: no hay documentación sobre entrenamiento, datos, arquitectura ni evaluación, lo que impide validar el modelo antes de usarlo en producción.
- Cero descargas y cero interacciones en Hugging Face en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Riesgo elevado de alucinación y de comportamiento impredecible al no existir información sobre el proceso de alineación.
- Idiomas soportados desconocidos; no se puede garantizar un rendimiento adecuado en castellano.
- Sesgos desconocidos: sin datos sobre la composición del dataset de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, pero no exime de la necesidad de evaluar el modelo antes de integrarlo.
- La única referencia funcional es la distribución en Ollama, sin garantías de mantenimiento o actualización.

## Enlaces

- Hugging Face: https://huggingface.co/drkkahraman/dorukkdev-b1
- Ollama: https://ollama.com/dorukkdev/b1:latest/blobs/abe17d2cce20
- GitHub del autor: https://github.com/drkkahraman/drkkahraman/tree/main

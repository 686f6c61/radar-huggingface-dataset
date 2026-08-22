# liuw15/qwen3-8b-ziyon-nsfw-Q4_K_M-GGUF

## Resumen

El modelo `liuw15/qwen3-8b-ziyon-nsfw-Q4_K_M-GGUF` es una conversión a formato GGUF del modelo `liuw15/qwen3-8b-ziyon-nsfw`, una adaptación del modelo Qwen3-8B de Alibaba con el objetivo de eliminar las restricciones de contenido (abliteración). Está pensado para entornos en los que se requiere generación de texto sin filtros de seguridad, especialmente en contextos creativos, literarios o de investigación sobre comportamiento de modelos. La cuantización Q4_K_M reduce el tamaño a aproximadamente 5 GB, lo que permite su ejecución en hardware de consumo.

El modelo conserva la arquitectura original de Qwen3-8B, un transformer denso de 8.190 millones de parámetros, y se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial y modificaciones. La cuantización Q4_K_M es una de las más equilibradas entre calidad y uso de memoria, y el archivo GGUF es compatible con llama.cpp, llama-server y otros motores de inferencia locales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible en la informacion; el modelo base Qwen3-8B soporta 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (archivo GGUF) |
| Idiomas soportados | no disponible en la informacion; el modelo base Qwen3-8B soporta principalmente ingles y chino, con capacidad multilingue limitada |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo .gguf) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-8B, un transformer causal denso con atención de múltiples cabezas y normalización RMSNorm, con 32 capas y 32 cabezas de atención. El modelo original de Qwen fue entrenado con un corpus masivo de datos en ingles y chino, con técnicas de entrenamiento supervisado y optimización por preferencias humanas (RLHF). La adaptacion `ziyon-nsfw` consiste en un proceso de ablacion que elimina las capas de rechazo y los mecanismos de moderacion de contenido, manteniendo las capacidades generativas del modelo base. No se ha publicado informacion detallada sobre el proceso de abliteracion ni sobre los datos utilizados para la adaptacion.

## Capacidades

- Generacion de texto sin restricciones de contenido, incluyendo temas sensibles o explicitos.
- Razonamiento y comprension de instrucciones complejas, heredadas del modelo base Qwen3-8B.
- Generacion de codigo y soporte basico de programacion.
- Capacidades multilingues limitadas, principalmente en ingles y chino, aunque el modelo base puede manejar otros idiomas con menor calidad.
- No se ha confirmado el soporte de tool calling o function calling en esta adaptacion; el modelo base Qwen3-8B lo incluye, pero la ablacion podria haberlo alterado.
- No soporta vision, audio ni otros modos multimodales.

## Casos de uso

- Escritura creativa sin censura: el modelo puede generar narrativa, dialogos y contenido literario adulto sin filtros de moderacion, util para autores que trabajan con temas sensibles.
- Investigacion sobre sesgos y comportamientos de modelos de lenguaje: al eliminar las capas de rechazo, se puede estudiar como el modelo responde a consultas delicadas y comparar con la version original.
- Creacion de datasets de entrenamiento para modelos mas seguros: se pueden generar ejemplos de contenido no moderado para posteriormente entrenar clasificadores o sistemas de deteccion.
- Prototipado de aplicaciones de chat sin restricciones en entornos de desarrollo, donde no se requieren politicas de seguridad.
- Analisis de rendimiento de cuantizacion Q4_K_M en modelos de 8B en hardware de consumo, para evaluar la degradacion de calidad.
- Despliegue en entornos locales con baja VRAM, gracias al tamano reducido, para experimentos de generacion de texto sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen3-8B alcanza un MMLU de 65.3 y HumanEval de 63.2, pero la adaptacion abliterada puede presentar variaciones. No se dispone de datos de rendimiento especificos para esta cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 5,5 GB de memoria GPU, mas overhead para contexto (por ejemplo, 6-7 GB con contexto de 2048 tokens).
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM, como NVIDIA RTX 3060, RTX 3070, RTX 4060, o en tarjetas de gama alta como RTX 4090 (sin problema).
- Se puede ejecutar en CPU con llama.cpp, aunque la velocidad sera significativamente menor.
- Opciones de despliegue: llama.cpp (CLI o servidor), llama-server, Ollama (si se convierte a formato compatible), y otros motores compatibles con GGUF.
- Latencia estimada: en una GPU RTX 4090, un token tarda aproximadamente 10-15 ms; en una RTX 3060, entre 20-30 ms. Con CPU (Apple M1 Pro), latencia de 50-100 ms por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| liuw15/qwen3-8b-ziyon-nsfw-Q4_K_M-GGUF | 8.19B | 32k (base) | Apache-2.0 | GGUF | Adaptacion abliterada |
| huihui-ai/Qwen3-8B-abliterated | 8.19B | 32k | Apache-2.0 | Safetensors y GGUF | Abliteracion similar, sin cuantizacion |
| Qwen/Qwen3-8B (original) | 8.19B | 32k | Apache-2.0 | Safetensors | Modelo original con moderacion |

La comparativa muestra que esta adaptacion es una variante abliterada del Qwen3-8B, similar a la de huihui-ai, pero con cuantizacion Q4_K_M para reducir el tamano. La licencia Apache-2.0 permite uso comercial sin restricciones.

## Limitaciones y advertencias

- El modelo ha sido modificado para eliminar las restricciones de contenido, por lo que puede generar texto ofensivo, explicito o danino sin filtros.
- No se ha verificado la calidad de la ablacion: es posible que el modelo conserve o pierda capacidades de razonamiento, tool calling o generacion de codigo de forma impredecible.
- La cuantizacion Q4_K_M introduce una degradacion de calidad en comparacion con la version de punto flotante, especialmente en tareas complejas de razonamiento.
- El contexto maximo no esta confirmado para esta version; se recomienda no exceder los 2048 tokens en el ejemplo de uso.
- La licencia Apache-2.0 permite uso comercial y modificaciones, pero el autor no ofrece garantias sobre el contenido generado ni su idoneidad para aplicaciones de produccion.
- El modelo puede alucinar hechos o producir respuestas incoherentes, especialmente en temas delicados.
- No se proporcionan datos de entrenamiento ni detalles sobre el proceso de ablacion, por lo que no es posible evaluar su robustez frente a sesgos.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/liuw15/qwen3-8b-ziyon-nsfw-Q4_K_M-GGUF
- Repositorio del modelo base abliterado: https://huggingface.co/liuw15/qwen3-8b-ziyon-nsfw
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Modelo abliterado de referencia: https://huggingface.co/huihui-ai/Qwen3-8B-abliterated

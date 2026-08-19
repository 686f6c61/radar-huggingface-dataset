# lukaskremla/Qwen3.8-27B-4bit-MLX-TextOnly

## Resumen

Qwen3.8-27B-4bit-MLX-TextOnly es una cuantización en 4 bits del modelo Qwen3.8-27B de Alibaba, convertida al formato MLX por el usuario lukaskremla. Esta versión elimina el módulo de visión del modelo original y conserva únicamente las capacidades de texto a texto, lo que la hace más ligera y adecuada para entornos donde no se necesita procesamiento multimodal. El modelo base, Qwen3.8-27B, es un transformer denso de 27.000 millones de parámetros con soporte para razonamiento, uso de herramientas y contexto largo, aunque en esta ficha se trabaja con la versión cuantizada que reduce el tamaño del repositorio a 15,2 GB.

La relevancia de esta ficha radica en que ofrece una opción de despliegue eficiente en hardware Apple Silicon mediante MLX, con una cuantización 4-bit que mantiene un equilibrio entre rendimiento y consumo de recursos. Al ser una variante solo texto, elimina la sobrecarga del codificador de visión, lo que puede mejorar la latencia en tareas puramente lingüísticas. Está publicada bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B) |
| Parametros totales | 4.204.731.904 (dato reportado en safetensors; el autor advierte que Hugging Face puede mostrar cifras incorrectas para cuantizaciones MLX) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base Qwen3.8-27B soporta contexto largo (segun el autor, "long-context") |
| Tipos de cuantizacion | 4-bit, weight-only, affine, RTN, group-size 64 |
| Idiomas soportados | No disponibles en la informacion proporcionada; el modelo base es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B, un transformer denso con 27.000 millones de parámetros que incorpora mecanismos de razonamiento explícito (modo thinking), soporte para tool calling y una ventana de contexto extensa. La versión cuantizada elimina el vision tower del modelo original, dejando únicamente el stack de texto. La cuantización se realizó con mlx-lm versión 0.31.2, utilizando cuantización solo de pesos (weight-only) con esquema affine RTN y group-size de 64, lo que reduce el tamaño del modelo a aproximadamente 15,2 GB.

No se dispone de información detallada sobre los datos de entrenamiento del modelo base, ni sobre el proceso de alineación (RLHF, DPO, etc.). La cuantización es una conversión posterior que no modifica los pesos aprendidos, solo su representación numérica. El autor indica que las cabezas MTP (Multi-Token Prediction) se pueden descargar por separado desde la colección asociada, lo que sugiere que esta versión no incluye el módulo de predicción multi-token.

## Capacidades

- Generación de texto y conversación multi-turno.
- Razonamiento y modo thinking (heredado del modelo base, aunque no se especifica si la cuantización afecta a esta funcionalidad).
- Tool calling / function calling (soportado por el modelo base).
- Capacidades multilingües (el modelo base es multilingüe, aunque no se detallan los idiomas).
- Contexto largo (el modelo base lo soporta, pero no se confirma el valor exacto en esta versión).
- Solo texto: no procesa imágenes ni otros inputs multimodales.

## Casos de uso

- Asistentes conversacionales en producción: el modelo puede gestionar diálogos multi-turno con memoria de contexto amplia, gracias a su ventana de contexto larga y su capacidad de razonamiento. Al ser solo texto, es adecuado para chatbots sin necesidad de visión.
- Generación de código asistida: con soporte para tool calling, puede integrarse en IDEs o pipelines de desarrollo para sugerir fragmentos de código, explicar APIs o refactorizar funciones.
- Automatización de tareas con agentes: al soportar function calling, puede orquestar llamadas a APIs, bases de datos o servicios externos en flujos de agente multi-paso.
- Análisis y resumen de documentos largos: su contexto extendido permite procesar informes, artículos o contratos completos sin truncamiento, generando resúmenes o extrayendo información clave.
- Razonamiento matemático y lógico: útil para aplicaciones educativas o de análisis que requieran resolver problemas paso a paso, gracias a su modo de razonamiento explícito.
- Traducción y procesamiento multilingüe: al ser multilingüe, puede emplearse en servicios de traducción automática o en sistemas de soporte al cliente que atiendan en varios idiomas.
- Despliegue en hardware Apple Silicon: gracias a su formato MLX y cuantización 4-bit, es una opción práctica para aplicaciones locales en Mac con Metal, sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas comparativas (MMLU, HumanEval, GSM8K, etc.) para esta cuantización específica. Se recomienda consultar la ficha del modelo base Qwen3.8-27B para conocer el rendimiento original, teniendo en cuenta que la cuantización 4-bit puede introducir una degradación leve en tareas complejas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 15,2 GB, por lo que se recomienda al menos 16 GB de memoria unificada en Apple Silicon para cargar el modelo en FP16 o BF16. Con cuantización 4-bit, el uso de memoria durante inferencia será menor, aunque no se especifica el valor exacto.
- GPU recomendadas: cualquier chip Apple Silicon con al menos 16 GB de RAM unificada (M1 Pro, M1 Max, M2 Pro, M2 Max, M3 Pro, M3 Max, etc.). También podría ejecutarse en GPU NVIDIA mediante conversión a otros formatos, pero la distribución oficial es MLX.
- ¿Cabe en consumer GPU? En GPUs de consumo con 16 GB de VRAM (como RTX 4080 o 4090) podría ejecutarse tras convertir los pesos a otro formato (por ejemplo, GGUF o GPTQ), pero no está optimizado para CUDA.
- Opciones de despliegue: mlx-lm (biblioteca de Apple), que soporta generación y servidores de inferencia. También se puede convertir a otros formatos con herramientas como llama.cpp o vLLM, aunque no es el propósito de esta versión.
- Latencia y throughput: no disponibles. Dependen del hardware concreto y de la configuración de decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-4bit-MLX-TextOnly | 4,2 B (cuantizado) | No disponible | Apache 2.0 | MLX (safetensors) | Solo texto, 4-bit, optimizado para Apple Silicon |
| Qwen3.8-27B (base) | 27 B | Largo (no especificado) | Apache 2.0 | Original | Modelo completo con visión y texto |
| Qwen3.8-27B-4bit-MLX (con visión) | 4,2 B (cuantizado) | No disponible | Apache 2.0 | MLX (safetensors) | Versión con visión del mismo autor |

No se dispone de comparativas con modelos de otros fabricantes (como Llama 3.1 8B o Mistral 7B) en la información proporcionada.

## Limitaciones y advertencias

- Al ser una cuantización 4-bit, puede presentar una degradación leve en tareas de razonamiento complejo, matemáticas o generación de código respecto al modelo original.
- La eliminación del vision tower hace que el modelo no pueda procesar imágenes, lo que limita su uso en aplicaciones multimodales.
- No se dispone de información sobre sesgos del modelo base ni sobre riesgos específicos de alucinación. Se recomienda evaluar en el dominio de uso.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que los pesos cuantizados cumplen con los términos del modelo original (Apache 2.0 también).
- El número de parámetros mostrado en Hugging Face (4,2 B) puede ser incorrecto según el autor; el modelo base tiene 27 B de parámetros, por lo que la cifra real tras cuantización no se corresponde con el tamaño del modelo original.
- El formato MLX está orientado a Apple Silicon; para otros entornos será necesario convertir los pesos, lo que puede introducir incompatibilidades.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lukaskremla/Qwen3.8-27B-4bit-MLX-TextOnly
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión con visión del mismo autor: https://huggingface.co/lukaskremla/Qwen3.8-27B-4bit-MLX
- Colección de cuantizaciones MLX del autor: https://huggingface.co/collections/lukaskremla/qwen-38-27b-mlx-quants-vision-text-only-and-mtp

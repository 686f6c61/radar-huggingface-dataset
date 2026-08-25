# peasantsmith/gpt-oss-120b-PS-IQ4_NL-GGUF

## Resumen

El modelo `peasantsmith/gpt-oss-120b-PS-IQ4_NL-GGUF` es una cuantización GGUF del modelo open-weight `gpt-oss-120b` de OpenAI, realizada por el usuario PeasantSmith. Se trata de una versión derivada que reduce el tamaño del modelo original (233 GB en F16) a 71,7 GB mediante una cuantización mixta por tensores, manteniendo una calidad razonable para tareas de razonamiento y generación de texto. El modelo base es un Mixture of Experts (MoE) con 116.829 millones de parámetros totales y 5.100 millones de parámetros activos por token, con una ventana de contexto de 131.072 tokens.

Esta cuantización es relevante porque permite ejecutar un modelo de la clase de gpt-oss-120b en hardware de consumo o semiprofesional, como tres GPUs RTX 3060 de 12 GB, gracias a la descarga de los tensores de expertos a CPU. La elección de IQ4_NL para los tensores de expertos responde a una restricción geométrica del modelo (columnas de 2880 elementos), que impide usar tipos de bloque de 256 elementos como IQ2_XXS. El resultado es un archivo GGUF de 71,75 GB con 4,91 bits por parámetro, listo para usar con llama.cpp y herramientas compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), 36 capas, 128 expertos por capa |
| Parametros totales | 116.829.156.672 |
| Parametros activos | 5.100.000.000 (5,1 B) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | IQ4_NL (expertos gate/up), Q5_0 (expertos down), Q8_0 (atencion, router, output), F32 (normas y biases) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base); la cuantizacion es derivada y debe verificarse con el upstream |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `gpt-oss-120b` es un transformer MoE con 36 capas y 128 expertos por capa, de los cuales se activan 2 por token (5,1 B parámetros activos). Esta arquitectura permite un alto rendimiento por parámetro activo, similar a otros modelos MoE recientes. El modelo fue entrenado por OpenAI con un enfoque en razonamiento, tool use y tareas agénticas, aunque no se dispone de detalles específicos sobre el dataset o el proceso de entrenamiento en la información proporcionada.

La cuantización PS-IQ4_NL es una conversión del modelo F16 (generado a partir de `unsloth/gpt-oss-120b-BF16`) a GGUF. Se aplica una cuantización mixta: los tensores de los expertos (gate/up) se cuantizan a IQ4_NL (bloques de 32 elementos), los expertos down a Q5_0, y los tensores de atención, router y salida a Q8_0. Las normas y biases se mantienen en F32. Esta elección se debe a que los tensores del modelo tienen 2880 columnas, lo que impide usar tipos de bloque de 256 elementos (como IQ2_XXS o Q2_K). La matriz de importancia (imatrix) se generó pero no se utiliza en tipos de bloque de 32 elementos en llama.cpp.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo cadenas de pensamiento (el modelo produce bloques de razonamiento antes de la respuesta final, según el formato "harmony").
- Soporte de tool calling y function calling, lo que permite integrarlo en flujos de trabajo agénticos.
- Capacidad para manejar contextos largos de hasta 131.072 tokens, útil para documentos extensos o conversaciones multi-turno.
- Razonamiento matemático y lógico, validado en pruebas de tareas específicas (p. ej., implementación de una caché LRU).
- Recuperación de información precisa dentro del contexto (needle recall), probado con un valor mágico a 8k tokens.
- Multilingüismo: no se especifican idiomas concretos, pero el modelo base de OpenAI soporta múltiples lenguas; la cuantización no altera esta capacidad.

## Casos de uso

- Atención al cliente automatizada: con 131k tokens de contexto, el modelo puede gestionar conversaciones largas y recordar detalles de interacciones previas, manteniendo coherencia y respondiendo con razonamiento si es necesario.
- Generación de código en producción: su capacidad de tool calling permite conectarlo a APIs y ejecutar funciones, por ejemplo en pipelines de CI/CD para revisión de código o generación de tests.
- Análisis de documentos legales o financieros: el contexto largo permite procesar contratos completos o informes extensos, extrayendo información relevante y resumiendo cláusulas.
- Agentes autónomos de investigación: puede planificar pasos, usar herramientas de búsqueda y razonar sobre los resultados, gracias a su soporte de multi-step reasoning.
- Asistente de programación con memoria de proyecto: al mantener el historial de conversación y el código en contexto, puede ayudar en refactorizaciones o depuración sin perder el hilo.
- Chatbot educativo: su capacidad de razonamiento permite explicar conceptos paso a paso, adaptándose a preguntas complejas y proporcionando respuestas fundamentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card del autor incluye pruebas de validación específicas para la cuantización:

| Test | Resultado |
|---|---|
| Generación greedy (pregunta factual) | PASS, respuesta correcta + bloque de razonamiento completo |
| Tarea de implementación de caché LRU (contexto 8192) | PASS, lista doblemente enlazada, O(1) get/put, coherente |
| Needle recall (valor mágico 9137 @ 8k ctx) | PASS, respuesta exacta: `9137` |
| Errores en tiempo de ejecución | 0 |

Rendimiento medido en hardware de 3× NVIDIA RTX 3060 12GB (36 GB VRAM total, 123 GiB RAM DDR4, expertos en CPU vía `--n-cpu-moe`):
- Prompt processing: 65,6–66,1 t/s
- Generación: 14,5–14,7 t/s

## Requisitos de hardware

- VRAM estimada: la configuración probada usa 36 GB de VRAM (3× RTX 3060 12GB) con los tensores de expertos en CPU. Si se cargan todos los expertos en GPU, se necesitarían al menos 70 GB de VRAM (el archivo GGUF pesa 71,7 GB), lo que requiere GPUs como A100 80GB o H100.
- GPUs recomendadas: para ejecución completa en GPU, una A100 80GB o H100; para configuraciones híbridas, varias GPUs de consumo con al menos 12 GB cada una.
- En consumer GPU: es posible con 2-3 GPUs de 24 GB (p. ej., RTX 3090/4090) si se usa offloading de expertos a CPU, o con una sola GPU de 48 GB (p. ej., RTX 6000 Ada) si se cargan todos los pesos.
- Opciones de despliegue: llama.cpp (recomendado, con `--n-cpu-moe` para offloading), también compatible con servidores GGUF como llama-server, o convertidores a otros formatos.
- Latencia y throughput: en la configuración probada, generación de 14,5–14,7 t/s y prompt processing de 65,6–66,1 t/s. En hardware más potente (A100/H100) se esperan valores superiores, aunque no se han medido.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo base `gpt-oss-120b` se posiciona como un modelo MoE de 120B parámetros totales con 5,1B activos, similar en arquitectura a otros MoE como DeepSeek-V3 o Qwen2.5-MoE, pero no se han publicado comparativas directas en esta ficha. Se recomienda consultar el modelo base para benchmarks oficiales.

## Limitaciones y advertencias

- Es una cuantización derivada, no el modelo original; puede haber pérdida de precisión respecto al F16, especialmente en tareas que requieren alta exactitud numérica.
- La perplejidad cruda no es fiable con este modelo: el formato de respuesta "harmony" de gpt-oss produce NaN en texto sin formato, por lo que la validación debe hacerse con tareas específicas.
- La licencia del modelo base es Apache 2.0, pero la cuantización es una obra derivada; se debe verificar que el uso cumpla con los términos del upstream antes de redistribuir o usar comercialmente.
- No se especifican idiomas soportados; aunque el modelo base es multilingüe, la cuantización no añade ni elimina capacidades, pero no hay garantía de calidad en todos los idiomas.
- El rendimiento en hardware con offloading a CPU depende de la velocidad de la RAM y del bus; en sistemas con RAM lenta, la generación puede degradarse.
- El archivo GGUF pesa 71,7 GB, por lo que requiere espacio en disco y suficiente RAM si se usan expertos en CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/peasantsmith/gpt-oss-120b-PS-IQ4_NL-GGUF
- Modelo base (OpenAI): https://huggingface.co/openai/gpt-oss-120b
- Documentación de la API de OpenAI para gpt-oss-120b: https://developers.openai.com/api/docs/models/gpt-oss-120b
- Blog de OpenAI sobre gpt-oss: https://openai.com/index/introducing-gpt-oss/
- Repositorio GitHub de OpenAI: https://github.com/openai/gpt-oss
- Cuantización GGUF de Unsloth (referencia): https://huggingface.co/unsloth/gpt-oss-120b-GGUF

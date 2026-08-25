# dpletta/posit-ds

## Resumen

`posit-ds` es un empaquetado para Ollama de la cuantización `UD-Q3_K_XL` que Unsloth publicó del modelo `Qwen/Qwen3-Coder-30B-A3B-Instruct`. No se trata de un entrenamiento nuevo: los pesos provienen directamente del repositorio de Unsloth y se han envuelto en un formato listo para ejecutar con Ollama. El autor, dpletta, lo ha creado específicamente para usarlo con Posit Assistant en un Mac con 24 GB de memoria unificada, limitando el contexto a 32768 tokens para que la caché KV y el resto de aplicaciones quepan en esa memoria.

El modelo base es un transformer de mezcla de expertos (MoE) con 30.532 millones de parámetros totales y 3.000 millones de parámetros activos por token, especializado en generación de código y razonamiento. Al estar cuantizado en GGUF, ocupa unos 13,8 GB en disco y puede ejecutarse en hardware de consumo con memoria unificada, lo que lo hace relevante para desarrolladores que quieren un asistente de código local sin depender de GPUs dedicadas de gran tamaño.

La licencia Apache-2.0 permite uso comercial sin restricciones significativas, y el empaquetado incluye la plantilla de herramientas (tool template) del modelo original, por lo que es compatible con flujos de function calling. Es una opción práctica para quienes necesitan un modelo de código potente en una máquina con limitaciones de memoria, aunque la cuantización agresiva (Q3_K_XL) implica una pérdida de calidad respecto al modelo en precisión completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) |
| Parametros totales | 30.532.122.624 (30,5 B) |
| Parametros activos | 3.000.000.000 (3 B) |
| Longitud de contexto | 32768 tokens (capado en este empaquetado; el modelo base soporta 256K) |
| Tipos de cuantizacion | GGUF Q3_K_XL (UD-Q3_K_XL de Unsloth) |
| Idiomas soportados | No disponible (el modelo base Qwen3-Coder es multilingue, pero no se especifica en la ficha) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors no incluido) |

## Arquitectura y entrenamiento

El modelo base `Qwen3-Coder-30B-A3B-Instruct` es un transformer de mezcla de expertos con 30,5 mil millones de parámetros totales y 3 mil millones activos por token, lo que permite una inferencia relativamente rápida en comparación con modelos densos del mismo tamaño. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF, DPO, etc.) en la documentación proporcionada; solo se indica que es la versión instruct del modelo de código de Qwen.

La innovación principal de este repositorio no está en el entrenamiento, sino en el empaquetado: se ha tomado la cuantización `UD-Q3_K_XL` de Unsloth (una variante de Q3_K con mayor calidad en las capas críticas) y se ha envuelto en un archivo GGUF compatible con Ollama. El autor ha fijado `num_ctx` a 32768 para que la caché KV y el resto de aplicaciones quepan en 24 GB de memoria unificada, y advierte explícitamente que no se debe subir ese valor en esa máquina. El GGUF ya incluye la plantilla de herramientas de Qwen3-Coder, por lo que no es necesario sobrescribir el `TEMPLATE`.

## Capacidades

- Generación de código y autocompletado en múltiples lenguajes de programación, gracias al modelo base Qwen3-Coder.
- Razonamiento y resolución de problemas matemáticos y lógicos, típico de la familia Qwen3.
- Soporte de tool calling / function calling: la plantilla de herramientas está incluida en el GGUF, lo que permite al modelo invocar funciones externas.
- Capacidad de seguir instrucciones en formato conversacional multi-turno.
- Multilingüe: aunque no se especifica en la ficha, el modelo base Qwen3-Coder soporta múltiples idiomas, incluyendo español, inglés, chino, etc.
- Contexto largo: hasta 32768 tokens en este empaquetado, suficiente para analizar archivos de código extensos o documentación.

## Casos de uso

- Asistente de programación local en un Mac con 24 GB de memoria unificada: el modelo se ejecuta con Ollama y responde preguntas sobre código, sugiere implementaciones y explica fragmentos, todo sin conexión a internet.
- Integración en entornos de desarrollo (IDE) mediante plugins que usan Ollama como backend: por ejemplo, en VS Code o Neovim, para autocompletado y chat contextual.
- Generación de documentación técnica: el modelo puede redactar comentarios, docstrings y guías de uso a partir de código fuente, aprovechando su ventana de 32K tokens para procesar archivos completos.
- Revisión de código (code review): con la capacidad de tool calling, se puede conectar a un repositorio y pedir al modelo que identifique posibles errores, mejoras de estilo o vulnerabilidades.
- Automatización de tareas de refactorización: el modelo puede transformar código legacy a versiones más modernas, siempre que se le proporcione el contexto suficiente dentro de la ventana de 32K.
- Prototipado rápido de scripts y utilidades: para desarrolladores que necesitan generar código desechable o explorar APIs, el modelo ofrece respuestas rápidas sin necesidad de GPUs dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. La ausencia de datos impide evaluar cuantitativamente la pérdida de calidad debida a la cuantización Q3_K_XL respecto al modelo original.

## Requisitos de hardware

- Memoria: 24 GB de memoria unificada (Apple Silicon) es el objetivo declarado por el autor. El archivo GGUF ocupa 13,8 GB, y con la caché KV para 32K tokens, el consumo total ronda los 20-22 GB, dejando margen para el sistema.
- GPU: no requiere GPU dedicada; funciona con la GPU integrada de los chips Apple M-series (M1 Pro, M2 Max, M3 Pro, etc.) gracias a la memoria unificada.
- CPU: cualquier Apple Silicon con al menos 16 GB de RAM puede ejecutarlo, aunque con menor contexto o más lentitud.
- Despliegue: exclusivamente a través de Ollama (`ollama run hf.co/dpletta/posit-ds`). No se proporcionan instrucciones para vLLM, llama.cpp u otros motores.
- Latencia y throughput: no se han publicado mediciones. En un Mac con 24 GB, se espera una generación de entre 10 y 20 tokens por segundo, dependiendo del modelo de chip y de la carga.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con alternativas. Como referencia cualitativa, se puede comparar con otros modelos de código de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct (original) | 30,5B totales, 3B activos | 256K | Apache-2.0 | safetensors |
| posit-ds (este modelo) | 30,5B totales, 3B activos | 32K (capado) | Apache-2.0 | GGUF Q3_K_XL |
| DeepSeek-V4-Flash-0731 | No disponible | No disponible | No disponible | No disponible |

La comparativa con DeepSeek-V4-Flash-0731 se incluye porque apareció en los resultados de búsqueda, pero no hay datos suficientes para establecer una comparación técnica. La principal diferencia con el modelo original es la cuantización y el límite de contexto, que reducen la calidad y la capacidad de procesar documentos muy largos, a cambio de poder ejecutarse en hardware de consumo.

## Limitaciones y advertencias

- La cuantización Q3_K_XL es agresiva y puede degradar la precisión en tareas complejas de razonamiento o generación de código, en comparación con el modelo en FP16 o BF16.
- El contexto está limitado a 32768 tokens en este empaquetado. Intentar aumentarlo en una máquina con 24 GB de memoria unificada provocará desbordamiento de memoria o una degradación severa del rendimiento.
- No es un modelo nuevo: es un reempaquetado de una cuantización existente. No hay garantías de soporte ni mantenimiento por parte del autor.
- El modelo base puede presentar sesgos y alucinaciones típicos de los modelos de lenguaje grandes, especialmente en código poco común o en dominios especializados.
- Aunque la licencia Apache-2.0 permite uso comercial, el autor no ofrece ninguna garantía de idoneidad para producción.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas específicas es desconocido.
- El empaquetado está pensado para Ollama; no se proporcionan instrucciones para otros motores de inferencia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dpletta/posit-ds
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Cuantización de Unsloth: https://huggingface.co/unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF
- Perfil del autor: https://huggingface.co/dpletta
- Página de Posit: https://posit.co/

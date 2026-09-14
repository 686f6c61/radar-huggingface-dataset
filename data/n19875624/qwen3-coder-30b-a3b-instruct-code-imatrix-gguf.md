# n19875624/Qwen3-Coder-30B-A3B-Instruct-code-imatrix-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo Qwen3-Coder-30B-A3B-Instruct, un transformer de tipo Mixture of Experts (MoE) con 30,5 mil millones de parámetros totales y 3,3 mil millones activos por token. Lo publica el usuario n19875624 (no es una publicación oficial de Qwen) y su particularidad es que la matriz de importancia (imatrix) empleada para calibrar la cuantización se generó exclusivamente con código fuente real, de modo que el error de cuantización se desplaza hacia los pesos menos relevantes para la generación de código.

El resultado son tres ficheros GGUF con distintos niveles de compresión (IQ3_M, IQ4_XS y Q4_K_M), pensados para ejecutarse con llama.cpp en GPUs de consumo, incluyendo una guía específica para una Radeon RX 9060 de 16 GB (RDNA4) mediante el backend Vulkan. Es relevante porque permite ejecutar un modelo de código de gama 30B en hardware de 16 GB con degradación controlada, aprovechando que solo 3,3B de parámetros están activos por token.

Se trata, por tanto, de un artefacto de despliegue y no de un modelo entrenado desde cero: no hay datos de entrenamiento, benchmarks propios ni evaluación publicada en la model card, y el repositorio ocupa apenas 0,1 GB en el momento de la consulta (los ficheros GGUF se referencian en la ficha pero el tamaño del repo apunta a una subida incompleta o reciente).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer (heredada de Qwen/Qwen3-Coder-30B-A3B-Instruct) |
| Parámetros totales | 30,5 B |
| Parámetros activos | 3,3 B |
| Longitud de contexto | no disponible en la información proporcionada (la define el modelo base) |
| Tipos de cuantización | IQ3_M (~3,7 bits), IQ4_XS (~4,25 bits), Q4_K_M (~4,8 bits) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | Qwen/Qwen3-Coder-30B-A3B-Instruct |
| Relación con el base | quantized |
| Tamaño de los ficheros | IQ3_M ~14 GB; IQ4_XS ~16 GB; Q4_K_M ~18,6 GB |
| Matriz de importancia | code.imatrix (incluida, reutilizable para otros niveles) |
| Pipeline | text-generation |
| Tamaño del repositorio | 0,1 GB (según HuggingFace en la fecha de consulta) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de mezcla de expertos con 30,5B de parámetros totales y 3,3B activos por token. Esta ficha no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO: esa información corresponde al modelo base y no se reproduce aquí.

La innovación técnica de este repositorio es el proceso de cuantización con imatrix sesgada a código. El procedimiento, reproducido en la propia model card, es: conversión del modelo base a GGUF Q8_0 con convert_hf_to_gguf.py, generación de la importance matrix con llama-imatrix sobre un corpus de código (120 fragmentos de 512 tokens), y cuantización final con llama-quantize --allow-requantize --imatrix. El corpus de calibración son ~4,5 MB de ficheros fuente reales extraídos de repositorios públicos (requests, flask, express, gin, ripgrep, nlohmann/json, gson, sqlite, rustlings) en Python, JavaScript, TypeScript, Go, Rust, C, C++, Java, shell y SQL, además de ficheros Markdown, JSON, YAML y TOML de configuración para preservar la salida con formato. La consecuencia esperada es un menor error de cuantización en los pesos relevantes para código, aunque no se publica ninguna medición cuantitativa de esa mejora.

## Capacidades

- Generación de texto y de código en los lenguajes cubiertos por la calibración: Python, JavaScript, TypeScript, Go, Rust, C, C++, Java, shell y SQL.
- Generación de ficheros de configuración y documentación técnica (Markdown, JSON, YAML, TOML), ya que ese tipo de contenido se incluyó explícitamente en la imatrix para preservar el formato.
- Razonamiento sobre código y tareas de completado dentro de un contexto gestionado por llama.cpp.
- Ejecución local completamente offline mediante llama.cpp y backends GPU (Vulkan, CUDA) o CPU.
- Soporte de offload parcial de expertos MoE a RAM del sistema (--n-cpu-moe) con una penalización de rendimiento menor que en un modelo denso equivalente, al mantener solo 3,3B de parámetros activos.
- Tool calling, function calling, capacidades de agente, modo thinking, visión o audio: no disponible en la información proporcionada (no se documentan en la model card de esta cuantización).
- Capacidades multilingües: la ficha declara únicamente el idioma `en`.

## Casos de uso

- Autocompletado y generación de código en el editor: el modelo se sirve con llama-server y se consume desde el plugin del IDE vía API local, con la ventaja de que la cuantización está calibrada específicamente para código.
- Refactorización de ficheros completos en local: gracias a los 16K tokens de contexto usados en los ejemplos de la ficha (-c 16384), se pueden procesar módulos enteros sin salir de la máquina.
- Revisión de código y generación de parches: el sesgo de la imatrix hacia código fuente busca reducir artefactos en la sintaxis, algo crítico cuando la salida se aplica directamente como diff.
- Generación de tests unitarios y de datos de prueba en repositorios con estructura conocida (Python, JS/TS, Go, Rust, C/C++, Java).
- Asistencia en tareas de scripting y automatización de shell y SQL, dos de los lenguajes presentes en el corpus de calibración.
- Despliegue en estaciones de trabajo con GPU de 16 GB: es el escenario explícito de la ficha (Radeon RX 9060, RDNA4, Vulkan), útil para equipos que no pueden usar GPUs de datacenter.
- Generación de documentación técnica y ficheros de configuración (README, YAML de CI, manifiestos JSON) manteniendo el formato, al haberse incluido ese tipo de contenido en la imatrix.
- Inferencia en entornos sin conectividad o con requisitos de confidencialidad, al ser un GGUF ejecutable con llama.cpp sin llamadas a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni de perplejidad comparando las distintas cuantizaciones, ni tampoco cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada según el propio autor: IQ3_M (~14 GB) permite offload completo en 16 GB de VRAM "con espacio para contexto"; IQ4_XS (~16 GB) es la mejor calidad que aún cabe mayoritariamente en 16 GB; Q4_K_M (~18,6 GB) requiere offload parcial a CPU en una GPU de 16 GB.
- GPU de referencia en la ficha: Radeon RX 9060 de 16 GB (RDNA4), con el backend Vulkan como la ruta más fiable en esa arquitectura.
- Comando recomendado para offload completo: `llama-server -m ...-IQ3_M.gguf -ngl 99 -c 16384 -fa on`.
- Comando recomendado cuando falta VRAM: `llama-server -m ...-IQ4_XS.gguf -ngl 99 --n-cpu-moe 12 -c 16384 -fa on`, que mantiene las capas de atención en GPU y mueve tensores de expertos MoE a RAM del sistema.
- Justificación del offload parcial: solo 3,3B de parámetros están activos por token, por lo que descargar unas pocas capas de expertos a CPU cuesta mucho menos throughput que en un modelo denso del mismo tamaño total.
- GPU recomendadas específicamente por la ficha: no disponible (solo se menciona la Radeon RX 9060; no se indican modelos A100, H100 o RTX).
- Opciones de despliegue: llama.cpp (llama-server, con backend Vulkan documentado). Otros runtimes compatibles con GGUF no se mencionan en la información proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se proporciona comparación con otros modelos en la información disponible. La comparación posible es entre los tres niveles de cuantización del propio repositorio y el modelo base sin cuantizar (tamaño teórico calculado a partir de los 30,5B de parámetros):

| Variante | Bits aprox. | Tamaño | Encaje en 16 GB | Notas |
|---|---|---|---|---|
| IQ3_M | ~3,7 | ~14 GB | Offload completo, con margen para contexto | Menor precisión de las tres |
| IQ4_XS | ~4,25 | ~16 GB | Mayoritariamente, al límite | Mejor calidad que aún cabe en 16 GB según el autor |
| Q4_K_M | ~4,8 | ~18,6 GB | No, requiere offload parcial a CPU | La de mayor calidad del repositorio |
| Base Q8_0 (referencia del proceso) | ~8 | ~30 GB aprox. | No | Paso intermedio para generar la imatrix |
| Base sin cuantizar (BF16) | 16 | ~61 GB aprox. | No | Tamaño teórico, no verificado en la ficha |

Comparación con alternativas de la misma categoría (otros modelos de código de ~30B o cuantizaciones GGUF de terceros): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Repositorio no oficial: lo publica el usuario n19875624, no el equipo de Qwen. No hay garantía de mantenimiento, soporte ni actualizaciones.
- Sin evidencia empírica de la mejora: el autor afirma que la imatrix sesgada a código reduce el error de cuantización en los pesos relevantes para código, pero no se publican métricas de perplejidad ni benchmarks que lo cuantifiquen.
- Sin benchmarks de ningún tipo: no hay datos de calidad, latencia ni throughput para ninguna de las tres cuantizaciones.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documenta ninguna mitigación ni evaluación específica de veracidad.
- Idioma: la ficha declara únicamente `en`. El comportamiento en castellano u otros idiomas no está documentado y no forma parte del corpus de calibración, por lo que la calidad fuera del inglés es una incógnita.
- Contexto: la longitud de contexto nativa no se especifica en esta ficha. Los ejemplos usan -c 16384, pero el valor real depende del modelo base y del presupuesto de VRAM disponible para la caché KV.
- La cuantización introduce pérdida de precisión. Q4_K_M es la opción de mayor calidad y IQ3_M la de menor; ninguna reproduce exactamente el comportamiento del modelo sin cuantizar.
- Uso comercial: la licencia declarada es Apache 2.0, lo que en principio permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base Qwen/Qwen3-Coder-30B-A3B-Instruct antes de desplegarlo en producción.
- Advertencia de integridad: el tamaño del repositorio en HuggingFace es de 0,1 GB, muy inferior a los 14-18,6 GB que ocupan los ficheros GGUF descritos, y el repositorio registra 0 descargas y 0 likes. Conviene verificar que los ficheros están completos y son descargables antes de integrarlo en cualquier flujo.
- Ajuste de --n-cpu-moe: es un parámetro dependiente del hardware; el valor 12 de la ficha está pensado para 16 GB de VRAM y debe reajustarse en otras configuraciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/n19875624/Qwen3-Coder-30B-A3B-Instruct-code-imatrix-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- llama.cpp (runtime requerido para el formato GGUF y las herramientas llama-imatrix y llama-quantize mencionadas en la ficha): https://github.com/ggml-org/llama.cpp
- Papers, blogs, demos o evaluaciones adicionales: no disponible en la información proporcionada.

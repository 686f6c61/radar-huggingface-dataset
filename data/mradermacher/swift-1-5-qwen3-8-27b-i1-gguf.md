# mradermacher/Swift-1.5-Qwen3.8-27b-i1-GGUF

## Resumen

Swift-1.5-Qwen3.8-27b es un modelo de lenguaje de 27.320 millones de parámetros derivado de la familia Qwen3, publicado por el usuario ukisai y cuantizado a GGUF por mradermacher. Se presenta como un modelo orientado al razonamiento eficiente en tokens ("efficient-thinking", "token-efficient"), es decir, entrenado mediante post-entrenamiento para reducir la verbosidad del razonamiento sin perder capacidad de resolución de problemas. La model card lo etiqueta además con "terminal-bench", lo que sugiere un enfoque en tareas de terminal y ejecución de comandos.

El repositorio que nos ocupa es una colección de cuantizaciones GGUF generadas con imatrix (importancia de pesos calculada sobre un corpus), lo que permite ejecutar el modelo en hardware de consumo con pérdidas de calidad controladas. Incluye 23 variantes de cuantización, desde i1-Q2_K (11 GB) hasta i1-Q6_K (22,5 GB), lo que cubre un rango amplio de presupuestos de VRAM y RAM.

Es relevante ahora porque ofrece una vía práctica de desplegar un modelo de 27B con razonamiento en máquinas de una sola GPU o incluso en CPU, algo que los pesos originales en safetensors (54,6 GB en FP16) no permiten. La licencia es la swift-open-license-1.0, distinta de la Apache 2.0 habitual en Qwen, por lo que conviene revisarla antes de un uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | transformer (derivada de Qwen3; detalles no disponibles) |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix); existen quants estáticos en el repo hermano |
| Idiomas soportados | en (inglés) |
| Licencia | swift-open-license-1.0 (license_name: other) |
| Formato de pesos | GGUF (imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es ukisai/Swift-1.5-Qwen3.8-27b, un fine-tuning o post-entrenamiento sobre Qwen3 de 27B. La información disponible no detalla la arquitectura interna más allá de la herencia de Qwen3 (transformer denso, sin indicios de mezcla de expertos). El nombre "Qwen3.8" y las etiquetas "reasoning", "efficient-thinking" y "token-efficient" apuntan a un entrenamiento orientado a producir cadenas de razonamiento más cortas, reduciendo el coste de inferencia en tareas que requieren pensamiento explícito.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La etiqueta "terminal-bench" sugiere que el post-entrenamiento incluyó tareas de terminal, lo que encajaría con un modelo afinado para agentes que ejecutan comandos. Las cuantizaciones de este repositorio se generaron con imatrix, un método que estima la importancia de cada peso a partir de activaciones sobre un corpus de calibración, mejorando la calidad respecto a cuantizaciones estáticas del mismo tamaño.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento con modo de pensamiento eficiente en tokens (cadenas de razonamiento más cortas).
- Ejecución de tareas de terminal y línea de comandos (según la etiqueta terminal-bench).
- Compatible con endpoints (tag "endpoints_compatible"), lo que facilita su despliegue tras una API compatible con OpenAI.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Capacidades de agente multi-paso: no confirmadas explícitamente, aunque el enfoque en terminal-bench lo hace plausible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Visión y audio: no disponibles.

## Casos de uso

- Agentes de terminal y automatización de shell: el modelo está etiquetado con terminal-bench, por lo que puede emplearse para generar y ejecutar comandos en entornos controlados, con validación humana en pasos destructivos.
- Asistentes de razonamiento con coste controlado: gracias al entrenamiento "token-efficient", encaja en aplicaciones donde cada token de pensamiento cuesta dinero, como pipelines de clasificación compleja o resolución de incidencias.
- Despliegue en estación de trabajo con una sola GPU: la variante i1-Q4_K_M (16,9 GB) cabe en GPUs de 24 GB, permitiendo un asistente local sin depender de la nube.
- Prototipado de agentes sobre API compatible con OpenAI: el tag "endpoints_compatible" permite integrarlo en frameworks que esperan ese contrato.
- Generación de documentación técnica y explicaciones paso a paso: el modo de razonamiento produce trazas intermedias útiles para auditar decisiones.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 23 variantes, útil para medir el impacto de la cuantización en tareas de razonamiento antes de fijar una configuración de producción.
- Fine-tuning posterior sobre datos propios en inglés: al estar disponible en GGUF y en safetensors (modelo base), se puede adaptar a dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: i1-Q2_K ≈ 11 GB; i1-IQ3_M ≈ 12,9 GB; i1-Q4_K_M ≈ 16,9 GB; i1-Q5_K_M ≈ 19,6 GB; i1-Q6_K ≈ 22,5 GB. Hay que sumar el espacio de contexto KV cache, que depende de la longitud de contexto (no disponible).
- GPU recomendadas: RTX 4090 (24 GB) para i1-Q4_K_M o i1-Q5_K_M; A100 40/80 GB o H100 para las variantes mayores con contexto largo; RTX 3090 (24 GB) como alternativa económica.
- GPUs de consumo: cabe en RTX 4090, RTX 3090 y, con cuantizaciones bajas (i1-Q2_K, i1-IQ3_S), en GPUs de 12-16 GB como RTX 4070 Ti o RTX 4080, a costa de calidad.
- Despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI requieren los pesos en safetensors del modelo base, no estos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27b (este) | 27,3B | no disponible | swift-open-license-1.0 | GGUF imatrix | Razonamiento eficiente en tokens, enfoque terminal |
| Qwen3-32B (referencia de familia) | 32B | no disponible | Apache 2.0 (según familia Qwen3) | safetensors, GGUF | Modelo base de referencia; licencia más permisiva |
| Gemma 3 27B | 27B | no disponible | Gemma license | safetensors, GGUF | Tamaño comparable, multimodal en su variante |
| Mistral Small 3 (24B) | 24B | no disponible | Apache 2.0 | safetensors, GGUF | Alternativa densa de tamaño similar |

Los datos de contexto y rendimiento de los modelos comparables no se han verificado en la información disponible; se indican como referencia de categoría.

## Limitaciones y advertencias

- Idiomas: solo inglés según la model card; no se garantiza un rendimiento aceptable en castellano.
- Licencia: swift-open-license-1.0 no es una licencia OSI estándar; hay que revisar el enlace de licencia del modelo base antes de uso comercial.
- Alucinación: no hay evaluaciones publicadas que cuantifiquen la tasa de alucinación; en tareas de terminal, un comando incorrecto puede ser destructivo, por lo que se requiere sandboxing.
- Cuantización: las variantes por debajo de Q4 pierden calidad de forma notable; para razonamiento se recomienda i1-Q4_K_M o superior.
- Contexto: se desconoce la longitud máxima soportada, lo que impide planificar aplicaciones con documentos largos.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad.
- Producción: al ser un modelo derivado y cuantizado por terceros, no hay garantías de soporte ni de parches de seguridad por parte del autor original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Swift-1.5-Qwen3.8-27b-i1-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Licencia del modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Quants estáticos: https://huggingface.co/mradermacher/Swift-1.5-Qwen3.8-27b-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Swift-1.5-Qwen3.8-27b-i1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

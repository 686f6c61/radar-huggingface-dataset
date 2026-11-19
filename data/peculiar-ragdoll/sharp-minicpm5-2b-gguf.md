# peculiar-ragdoll/Sharp-MiniCPM5-2B-GGUF

## Resumen

Sharp-MiniCPM5-2B-GGUF es una colección de cuantizaciones dinámicas en formato GGUF del modelo denso openbmb/MiniCPM5-2B, publicada por el usuario peculiar-ragdoll. El modelo base es un transformer denso de 2.516.756.480 parámetros con una ventana de contexto nativa de 131.072 tokens, orientado a generación de texto, razonamiento y código. Esta versión no modifica los pesos más allá de la cuantización, pero incorpora una importance matrix ponderada hacia código y ciberseguridad, una política de cuantización por tensor de estilo unsloth-dynamic y una plantilla de chat propia (Sharp-MiniCPM) con correcciones y un system prompt mejorado.

La relevancia de esta publicación reside en su metodología de cuantización: según las mediciones del autor, el modelo pierde entre 3 y 7 veces menos fidelidad que un modelo comparable de mayor tamaño (Sharp-Spark-X2.5-4B) en cada nivel de cuantización, lo que permite ejecutar una ventana de 131K tokens en GPUs de consumo con pérdida prácticamente nula en el nivel Q6_K_XL (2,20 GB, divergencia KL en el percentil 99 de 0,024 frente a BF16).

El paquete está pensado para despliegue con llama.cpp estándar, sin builds personalizados, e incluye la plantilla Jinja embebida en cada fichero para que las llamadas a herramientas se devuelvan como `tool_calls` en formato OpenAI. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, tipo `llama` (42 capas, todas de atención completa, sin sliding window) |
| Parametros totales | 2.516.756.480 (2,5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (131K) |
| Tipos de cuantizacion | Q4_K_S, Q4_K_XL, Q5_K_XL, Q6_K_XL, Q8_K_M (GGUF, con imatrix dinámica) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base MiniCPM5-2B es un transformer denso de arquitectura `llama` estándar, con 42 capas de atención completa (sin atención de ventana deslizante), GQA con ratio 8:1 (16 cabezas de consulta, 2 cabezas KV, dimensión de cabeza 128) y embeddings no atados: `output.weight` y `token_embd.weight` son tensores separados que representan el 10,6% de los parámetros cada uno. El modelo ocupa 2,5B parámetros y soporta 131.072 tokens de contexto nativo. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

La innovación de esta publicación no está en el entrenamiento sino en el proceso de cuantización. El autor aplica una importance matrix (imatrix) ponderada hacia código y ciberseguridad, junto con una política por tensor que fija `output.weight` en precisión alta en todos los niveles, degrada `token_embd` (lo que aporta la mayor parte del ahorro en los niveles bajos) y eleva `attn_k` y `attn_v` a coste casi nulo (unos 11 MB en las 42 capas). El resultado es un modelo que, según el autor, resiste la cuantización mejor que modelos más grandes: en Q6_K_XL la divergencia KL en el percentil 99 es de 0,024 y la coincidencia top-1 con BF16 del 98,1%. El KV cache consume 42 KB por token en f16 y 22,3 KB por token en q8_0, más alto por token que el de modelos con atención ventaneada porque todas las capas mantienen caché de longitud completa.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 131.072 tokens.
- Razonamiento y resolución de tareas de código, con especial énfasis en el ajuste de la imatrix hacia código y ciberseguridad.
- Soporte de tool calling / function calling mediante el formato XML `<function>`/`<param>` de la plantilla Sharp-MiniCPM, devuelto como `tool_calls` estándar de OpenAI al usar `--jinja` en llama.cpp.
- Convención `<think>` para modo de razonamiento explícito, integrada en la plantilla de chat.
- Capacidades de agente y razonamiento multi-paso, orientadas a tareas de ingeniería de software (el autor evalúa con SWE-bench-Live).
- Capacidades multilingües: no disponible en la información proporcionada.
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- Asistencia de programación en local: el modelo puede integrarse en editores o terminales mediante llama.cpp con la plantilla Jinja activada, aprovechando el ajuste de la imatrix hacia código para autocompletado, explicación y refactorización sin enviar código a servicios externos.
- Agentes de resolución de incidencias sobre repositorios: con 131K tokens de contexto puede cargar ficheros completos, trazas de error y documentación en una sola ventana y encadenar llamadas a herramientas para inspeccionar y proponer parches, como demuestra la evaluación en SWE-bench-Live.
- Automatización de revisión de código en CI/CD: el soporte de `tool_calls` en formato OpenAI permite conectarlo a pipelines que consulten linters, ejecuten tests o abran pull requests, con el modelo devolviendo llamadas estructuradas en lugar de texto libre.
- Análisis de documentos largos en estaciones de trabajo modestas: con Q4_K_S (1,52 GB) caben 97K tokens de contexto en una GPU de 4 GB, lo que permite resumir o extraer información de contratos, informes o expedientes completos en hardware de consumo.
- Despliegue en portátiles y equipos sin GPU dedicada: los niveles Q4 y Q5 permiten inferencia en CPU o en GPUs integradas, útil para prototipos, demos y herramientas internas de bajo coste.
- Procesamiento por lotes de textos técnicos: el modelo puede clasificar, etiquetar o transformar grandes volúmenes de documentación técnica con un throughput alto gracias a su tamaño reducido, ejecutando varias instancias en una sola GPU de 24 GB.
- Asistente de ciberseguridad en local: la ponderación de la imatrix hacia ciberseguridad sugiere un uso adecuado para triaje de alertas, análisis de configuraciones y explicación de vulnerabilidades en entornos donde los datos no pueden salir de la infraestructura.

## Benchmarks y rendimiento

El autor publica una comparación en SWE-bench-Live entre SharpMiniCPM Q6_K_XL, MiniCPM5-2B Q8_0 original, SharpSpark y Haiku 4.5, presentada como gráfico en la model card. No se incluyen los valores numéricos en el texto disponible, por lo que no se pueden reproducir en tabla.

| Benchmark | Sharp-MiniCPM5-2B Q6_K_XL | MiniCPM5-2B Q8_0 | SharpSpark | Haiku 4.5 |
|---|---|---|---|---|
| SWE-bench-Live | no disponible (solo gráfico) | no disponible (solo gráfico) | no disponible (solo gráfico) | no disponible (solo gráfico) |

Métricas de fidelidad de cuantización publicadas por el autor (divergencia KL en percentil 99 frente a BF16 y coincidencia top-1):

| Nivel | Tamano | 99% KL | top-1 |
|---|---:|---:|---:|
| Q4_K_S | 1,52 GB | 0,333 | 92,3% |
| Q4_K_XL | 1,60 GB | 0,274 | 93,0% |
| Q5_K_XL | 1,89 GB | 0,086 | 96,3% |
| Q6_K_XL | 2,20 GB | 0,024 | 98,1% |
| Q8_K_M | 2,93 GB | 0,004 | 99,2% |

Comparación de robustez frente a cuantización con Sharp-Spark-X2.5-4B (99% KL):

| Nivel | MiniCPM5-2B | Spark-X2.5-4B |
|---|---:|---:|
| Q4_K_S | 0,333 | 1,156 |
| Q4_K_XL | 0,274 | 0,873 |
| Q5_K_XL | 0,086 | 0,363 |
| Q6_K_XL | 0,024 | 0,178 |
| Q8_K_M | 0,004 | 0,023 |

## Requisitos de hardware

- VRAM para pesos: entre 1,52 GB (Q4_K_S) y 2,93 GB (Q8_K_M); el repositorio completo ocupa 20,3 GB.
- Contexto máximo según VRAM con KV cache q8_0, todas las capas en GPU y 0,5 GiB reservados para buffers: en 4 GB, Q4_K_S alcanza 97K tokens, Q4_K_XL 94K, Q5_K_XL 81K, Q6_K_XL 68K y Q8_K_M 36K; en 6 GB, todos los niveles llegan a 131K salvo Q8_K_M (130K); en 8 GB, todos alcanzan el límite nativo de 131K.
- Con KV cache en f16 el contexto disponible se reduce aproximadamente a la mitad.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (por ejemplo, RTX 3050, RTX 4060, RTX 4090) es suficiente; en 6 GB o más el límite es el contexto nativo del modelo, no la VRAM. Para máximo throughput en servidor, A100 o H100 no son necesarias pero permiten servir muchas instancias en paralelo.
- Despliegue: llama.cpp (`llama-server` con `--jinja -ngl 99 -c 131072 -ctk q8_0 -ctv q8_0 -fa on`). No requiere builds personalizados. No se documenta soporte para vLLM, TGI u Ollama en la información disponible.
- Parámetros de muestreo recomendados: temperatura 1.0, top-p 0.95, top-k 20, min-p 0.0 (el valor por defecto de llama.cpp de 0.05 puede provocar bucles de repetición).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sharp-MiniCPM5-2B-GGUF | 2,5B | 131K | Apache 2.0 | GGUF | Cuantización imatrix con plantilla propia; robustez alta frente a cuantización |
| MiniCPM5-2B (original) | 2,5B | 131K | Apache 2.0 | safetensors | Modelo base sin cuantizar; referencia BF16 |
| Sharp-Spark-X2.5-4B-GGUF | 4B (aprox.) | no disponible | no disponible | GGUF | Mismo autor y metodología; pierde 3-7 veces más fidelidad por cuantización según sus mediciones |
| Haiku 4.5 | no disponible | no disponible | propietaria | API | Usado como referencia en el gráfico de SWE-bench-Live; sin datos numéricos publicados en el texto |

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo base ni sobre su comportamiento en dominios sensibles.
- Riesgo de alucinación inherente a un modelo de 2,5B parámetros; no debe usarse como fuente de verdad sin verificación en tareas críticas.
- El autor advierte de que el valor por defecto de `min-p` en llama.cpp (0.05) puede atrapar al modelo en bucles de repetición; es necesario fijarlo a 0.0.
- El KV cache es de 42 KB por token en f16 y 22,3 KB por token en q8_0, más alto por token que en modelos con atención ventaneada, lo que limita el contexto útil en GPUs pequeñas.
- Las métricas de robustez frente a cuantización miden la fidelidad respecto al propio BF16 del modelo, no la calidad absoluta frente a otros modelos; el autor lo señala explícitamente.
- Los resultados de SWE-bench-Live solo están disponibles como gráfico, sin cifras reproducibles en el texto.
- Idiomas soportados no documentados; el rendimiento fuera del inglés y el chino (idiomas habituales de la familia MiniCPM) no está verificado en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones y avisos del modelo base openbmb/MiniCPM5-2B.
- La plantilla Sharp-MiniCPM modifica la plantilla original con seis correcciones y un system prompt propio; los resultados pueden diferir de los del modelo base con su plantilla original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/peculiar-ragdoll/Sharp-MiniCPM5-2B-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Cuantizaciones del mismo autor (Sharp-Spark-X2.5-4B): https://huggingface.co/peculiar-ragdoll/Sharp-Spark-X2.5-4B-GGUF

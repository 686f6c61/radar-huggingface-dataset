# mradermacher/SearchQwen2.5-7B-i1-GGUF

## Resumen

El modelo `mradermacher/SearchQwen2.5-7B-i1-GGUF` es una cuantización en formato GGUF con *imatrix* del modelo `alibaba-pai/SearchQwen2.5-7B`, una variante especializada de la familia Qwen2.5 orientada a tareas de agente de búsqueda, uso de herramientas y *function calling*. El modelo original, desarrollado por Alibaba Cloud, combina la arquitectura Transformer de Qwen2.5-7B con un ajuste específico para escenarios de búsqueda profunda y razonamiento multi-paso. Esta versión cuantizada permite ejecutar el modelo en hardware de gama media, incluso en GPU de consumo, manteniendo un equilibrio entre calidad y requisitos de memoria.

La relevancia de esta ficha radica en que ofrece una opción práctica para desarrolladores que necesitan desplegar un agente de búsqueda local sin depender de servicios en la nube. La cuantización i1-Q2_K reduce el tamaño del modelo a aproximadamente 3,1 GB, lo que lo hace viable para inferencia en equipos con poca VRAM. Sin embargo, es importante señalar que se trata de una cuantización de baja precisión y que el modelo solo está entrenado en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-7B soporta 128k, pero no se confirma para esta variante) |
| Tipos de cuantizacion | i1-Q2_K (principal), además se ofrecen quants estáticos en otro repositorio (Q2_K, IQ3_M, Q4_K_S, etc.) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con archivo de imatrix) |

## Arquitectura y entrenamiento

La arquitectura base es un Transformer decoder-only de 7.000 millones de parámetros, similar a la de Qwen2.5-7B-Instruct. El modelo `SearchQwen2.5-7B` de Alibaba incorpora un ajuste específico para tareas de agente de búsqueda y *function calling*, aunque no se dispone de detalles técnicos sobre el entrenamiento (datos, técnicas de RLHF, etc.) en la información proporcionada. La cuantización fue realizada por `mradermacher` utilizando *importance matrix* (imatrix), que optimiza la asignación de bits según la importancia de los pesos, mejorando la calidad de la cuantización respecto a los métodos estáticos.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredado de Qwen2.5.
- Soporte para *tool calling* y *function calling*, permitiendo al modelo invocar funciones externas durante la generación.
- Capacidad de actuar como agente de búsqueda, realizando consultas a APIs o bases de datos en varios pasos.
- Razonamiento multi-paso (multi-step reasoning) para tareas complejas de búsqueda y análisis.
- Conversación multi-turno con memoria contextual (hasta el límite de contexto disponible).
- Multilingüismo limitado: solo se ha entrenado en inglés, aunque puede generar texto en otros idiomas con menor calidad.

## Casos de uso

- **Agente de búsqueda empresarial**: el modelo puede recibir una consulta, generar una búsqueda en una API interna (por ejemplo, Elasticsearch) y resumir los resultados. Su capacidad de *function calling* permite definir herramientas de búsqueda personalizadas.
- **Atención al cliente automatizada**: gracias a su naturaleza conversacional y soporte de herramientas, puede gestionar consultas de usuarios, buscar en una base de conocimiento y proporcionar respuestas precisas en inglés.
- **Asistente de investigación**: el modelo puede formular consultas a motores de búsqueda o bases de datos académicas, extraer información relevante y redactar resúmenes estructurados.
- **Automatización de tareas con APIs**: se puede usar para parsear respuestas de APIs, extraer datos y generar informes, aprovechando el *function calling* para llamar a endpoints específicos.
- **Chatbot de soporte técnico**: Gracias a su capacidad de razonamiento multi-paso, puede diagnosticar problemas simples y recomendar soluciones, consultando manuales o documentación técnica.
- **Generación de código con herramientas**: Aunque no está especializado en código, puede generar scripts o comandos para interactuar con sistemas externos, usando *tool calling* para ejecutar acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones de MMLU, HumanEval, GSM8K u otras pruebas para esta variante cuantizada ni para el modelo base `SearchQwen2.5-7B`.

## Requisitos de hardware

- **VRAM estimada para inferencia**: El archivo i1-Q2_K ocupa ~3,1 GB en disco. En ejecución, con contexto moderado (4k tokens), se estima una ocupación de VRAM de aproximadamente 4 GB (peso + activaciones). Para contextos más largos (32k tokens) se necesitaría más de 6 GB.
- **GPU recomendadas**: Para el quant Q2_K, una GPU con 4-6 GB de VRAM es suficiente (ej. RTX 3060, RTX 4060). Para mayor calidad con quants más altos (Q4_K_M) se recomienda una GPU con 8-10 GB (RTX 3080, RTX 4080).
- **¿Cabe en GPU consumer?**: Sí, el modelo Q2_K cabe en GPUs de gama media y baja (GTX 1660 Super con 6 GB, por ejemplo).
- **Opciones de despliegue**: llama.cpp (compilación para CPU/GPU), Ollama (con archivo GGUF), LM Studio, y también se puede usar con vLLM si se convierte a formato compatible (aunque vLLM suele trabajar con safetensors, no GGUF). Para CPU pura, llama.cpp es viable con ~4 GB de RAM.
- **Latencia y throughput**: No hay datos específicos. En una GPU RTX 4090, se espera una velocidad de generación de 40-60 tokens/s para un modelo de 7B con Q2_K. En CPU (16 hilos), unos 5-10 tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| SearchQwen2.5-7B (base) | 7,6B | no disponible (128k en Qwen2.5) | Apache-2.0 | safetensors | Búsqueda y tool use |
| Qwen2.5-7B-Instruct | 7,6B | 128k | Apache-2.0 | safetensors, GGUF | Instruct general |
| Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 License | GGUF | Instruct general, tool calling |

El modelo SearchQwen2.5-7B se distingue por su enfoque en búsqueda y agente, mientras que Qwen2.5-Instruct es más general. Llama-3.1-8B ofrece mejor rendimiento en algunos benchmarks, pero su licencia es menos permisiva. La cuantización i1-Q2_K tiene peor calidad que los quants superiores, pero es más ligera.

## Limitaciones y advertencias

- **Cuantización de baja precisión**: El cuant i1-Q2_K es el de menor calidad entre los disponibles; puede producir alucinaciones más frecuentes y perder matices del lenguaje. Se recomienda usar quants Q4_K_M o superiores si el hardware lo permite.
- **Idioma**: El modelo está entrenado únicamente en inglés. Su rendimiento en español u otros idiomas será notablemente inferior.
- **Sesgos y alucinación**: Como cualquier LLM, puede generar información falsa o sesgada, especialmente en tareas de búsqueda donde la información extraída puede ser incorrecta.
- **Contexto no confirmado**: Aunque el modelo base Qwen2.5 soporta 128k tokens, no se ha verificado que esta variante mantenga esa longitud; se recomienda probar con ventanas de contexto más cortas.
- **Uso comercial**: La licencia Apache-2.0 permite uso comercial, pero se debe citar la atribución y cumplir con las condiciones de la licencia.
- **Sesgos de datos**: No se conoce la composición del dataset de entrenamiento, por lo que puede presentar sesgos típicos de datos web en inglés.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mradermacher/SearchQwen2.5-7B-i1-GGUF
- Modelo base: https://huggingface.co/alibaba-pai/SearchQwen2.5-7B
- Perfil del autor: https://huggingface.co/mradermacher
- Quants estáticos: https://huggingface.co/mradermacher/SearchQwen2.5-7B-GGUF (mencionado en la model card)

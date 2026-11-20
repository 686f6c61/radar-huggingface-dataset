# nace-ai/Qwen3.5-9B-GGUF

## Resumen

Qwen3.5-9B-GGUF es una colección de cuantizaciones GGUF del modelo Qwen/Qwen3.5-9B, publicada por el usuario nace-ai. El modelo base es un transformer denso de 8.953.803.264 parámetros (aproximadamente 9B) desarrollado por el equipo Qwen de Alibaba, distribuido bajo licencia Apache 2.0. Esta ficha se centra en la versión GGUF, pensada para su uso con llama.cpp, LM Studio y Ollama en hardware de consumo.

La relevancia de esta publicación concreta no reside en el modelo base, sino en la metodología de cuantización: el autor publica métricas de divergencia KL frente al modelo BF16 para cada archivo, comparándolas con cuantizaciones de otros publicadores (bartowski, Unsloth, byteshape) del mismo tamaño. Según sus datos, los archivos IQ2_M, IQ3_M y Q3_K_XL quedan más cerca del modelo de referencia que alternativas de tamaño igual o mayor.

El repositorio ocupa 19.0 GB en total e incluye tres variantes principales cuyos pesos de lenguaje van de 3,36 GB a 4,70 GB. La información disponible no detalla la arquitectura interna del modelo base (tipo de atención, composición del dataset de entrenamiento ni método de alineación), por lo que esos apartados se marcan como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles internos del modelo base no disponibles) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (evaluado a esa longitud en la model card) |
| Tipos de cuantizacion | GGUF: IQ2_M, IQ3_M, Q3_K_XL (mezclas de tipos tensoriales de 2,1 a 8,5 bits por peso) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.5-9B en la documentación proporcionada: no se especifica si emplea atención completa, atención lineal, decodificación especulativa ni capas híbridas. El dato confirmado es que se trata de un modelo denso de 8,95B parámetros con una ventana de contexto de 128K tokens, y que la model card menciona la existencia de componentes de visión y MTP (multi-token prediction) excluidos del cómputo de tamaño de los archivos GGUF.

Respecto al entrenamiento, no hay información sobre número de tokens, composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras. La model card de esta publicación se centra exclusivamente en la cuantización: los archivos mezclan tipos tensoriales de llama.cpp estándar (por ejemplo, IQ2_M es 90% IQ3_XXS, 7% IQ2_XXS y 3% otros tipos; Q3_K_XL es 69% IQ4_XS, 16% Q5_K, 14% IQ3_XXS y 1% otros). La evaluación se realizó con llama.cpp build 0a94a3f2 sobre 64 ventanas de 32.704 tokens de texto en inglés (Wikipedia, chat, tool-calls y código GitHub) generado después del 20 de septiembre de 2026.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (text-generation) y la etiqueta conversational.
- Soporte de tool calling y function calling: la model card incluye datos de chat y tool-calls en su conjunto de evaluación, lo que indica que el modelo base está entrenado para ese uso.
- Ventana de contexto de 128K tokens, validada en las evaluaciones de divergencia KL a esa longitud.
- Capacidades multimodales: la model card menciona componentes de visión en el modelo base, aunque los archivos GGUF no incluyen esos pesos (el tamaño reportado excluye visión y MTP).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento extendido (thinking): no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: los archivos de 3,36 GB a 4,70 GB permiten ejecutar un modelo de 9B con contexto largo en tarjetas de 8-12 GB de VRAM, usando llama.cpp u Ollama.
- Asistentes de código en IDE: la cuantización Q3_K_XL mantiene una accuracy top-1 del 95,0% frente al BF16 en texto de código a 128K de contexto, lo que la hace adecuada para autocompletado y generación en entornos con memoria limitada.
- Procesamiento de documentos largos: con 128K tokens de contexto se pueden analizar contratos, informes o bases de código completas en una sola pasada, algo viable en local con las variantes IQ3_M o Q3_K_XL.
- Agentes con tool calling: el modelo base está entrenado para llamadas a herramientas, y las cuantizaciones conservan esa capacidad (la evaluación incluye texto de tool-calls), lo que permite construir agentes que consulten APIs o ejecuten acciones.
- Servidores de inferencia de bajo coste: al ocupar menos de 5 GB de pesos, se pueden ejecutar múltiples instancias en una sola GPU o en CPU con llama.cpp para dar servicio a varios usuarios.
- Prototipado e investigación en entornos sin conectividad: la licencia Apache 2.0 y el formato GGUF permiten distribuir y modificar el modelo sin restricciones comerciales, útil para investigación académica o despliegues en infraestructura propia.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) comparables con leaderboards. En su lugar, publica métricas de divergencia KL frente al modelo BF16 y accuracy top-1, medidas con llama.cpp sobre texto de evaluación propio. Se reproducen a continuación.

Divergencia KL a 512 tokens:

| Archivo | GB (LM) | KL media | KL p99.9 | Top-1 (%) | Baseline (GB, KL) |
|---|---:|---:|---:|---:|---|
| IQ2_M | 3,36 | 0,238 | 14,890 | 83,0 | bartowski IQ2_S (3,47; 0,372) |
| IQ3_M | 4,39 | 0,134 | 14,399 | 87,9 | bartowski IQ3_XS (4,55; 0,147) |
| Q3_K_XL | 4,70 | 0,095 | 12,879 | 92,4 | bartowski IQ3_M (4,71; 0,142) |

Divergencia KL a 128K tokens, por tipo de texto:

| Archivo | Chat/tool-calls (KL / top-1) | Código (KL / top-1) | Prosa (KL / top-1) |
|---|---|---|---|
| IQ2_M | 1,300 / 79,1% | 0,142 / 88,5% | 0,401 / 77,8% |
| IQ3_M | 1,051 / 83,8% | 0,074 / 92,1% | 0,235 / 84,4% |
| Q3_K_XL | 0,846 / 86,9% | 0,041 / 95,0% | 0,161 / 89,5% |

El autor indica que estas cifras no son comparables con resultados publicados en leaderboards, ya que se puntúan por verosimilitud sin plantilla de chat ni few-shot.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4 GB (IQ2_M), 4,4 GB (IQ3_M) y 4,7 GB (Q3_K_XL) solo para los pesos de lenguaje, más overhead de contexto KV. Con 128K de contexto el consumo de KV cache crece de forma significativa y puede superar los pesos del modelo.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, así como A100 o H100 para despliegues multiusuario.
- Cabe en GPU de consumo: sí, las tres variantes caben en tarjetas de 8 GB o más, siempre que se ajuste el tamaño de contexto para no desbordar la memoria.
- Opciones de despliegue: llama.cpp (build 0a94a3f2 es la usada en la evaluación), LM Studio, Ollama y cualquier runtime compatible con GGUF. El tag endpoints_compatible sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparación con otras cuantizaciones del mismo modelo base, según los datos de la model card:

| Modelo | Tamaño (GB) | KL media (512 tok) | Licencia | Publicador |
|---|---:|---:|---|---|
| nace-ai IQ2_M | 3,36 | 0,238 | Apache 2.0 | nace-ai |
| bartowski IQ2_S | 3,47 | 0,372 | Apache 2.0 | bartowski |
| nace-ai IQ3_M | 4,39 | 0,134 | Apache 2.0 | nace-ai |
| bartowski IQ3_XS | 4,55 | 0,147 | Apache 2.0 | bartowski |
| nace-ai Q3_K_XL | 4,70 | 0,095 | Apache 2.0 | nace-ai |
| bartowski IQ3_M | 4,71 | 0,142 | Apache 2.0 | bartowski |

No se dispone de comparación con modelos de otros desarrolladores (por ejemplo, Llama o Mistral de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- La información sobre sesgos del modelo base no está disponible en la documentación proporcionada.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad para esta cuantización.
- Las cuantizaciones de 2-3 bits introducen degradación medible: IQ2_M presenta una KL media de 1,300 en chat/tool-calls a 128K, muy superior a la de Q3_K_XL (0,846), lo que puede afectar a la calidad en conversaciones largas.
- El contexto de 128K exige una gestión cuidadosa de la KV cache; en GPU de consumo puede ser necesario reducir la ventana efectiva.
- Los idiomas soportados no están documentados; la evaluación se realizó únicamente con texto en inglés, por lo que el rendimiento en castellano no está verificado.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B, ya que esta publicación solo cuantiza.
- El repositorio tiene un número reducido de descargas (1.478) y likes (4), por lo que la validación comunitaria es limitada en el momento de la consulta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B

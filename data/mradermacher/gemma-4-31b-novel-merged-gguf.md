# mradermacher/gemma-4-31b-novel-merged-GGUF

## Resumen

`mradermacher/gemma-4-31b-novel-merged-GGUF` es un repositorio de cuantizaciones GGUF estáticas generadas por mradermacher a partir del modelo `sonten/gemma-4-31b-novel-merged`, un modelo de la familia Gemma 4 (31B) que ha sido fusionado ("merged") por el usuario sonten. El repositorio no contiene un modelo entrenado desde cero, sino una conversión de pesos a formato GGUF en varias precisiones, pensada para su uso con llama.cpp, Ollama y otros runtimes compatibles.

El dato objetivo disponible es el recuento de parámetros en safetensors: 30.697.345.596 (aproximadamente 30,7B), lo que sitúa al modelo en la franja de 30-32B, con un tamaño de repositorio de 62,3 GB que corresponde al conjunto de todas las cuantizaciones publicadas. La model card es puramente técnica (versión de cuantización, tensor de salida cuantizado, tipo de conversión `hf`, lista de quants) y no aporta información sobre arquitectura, datos de entrenamiento, licencia ni idiomas.

La relevancia de esta ficha es por tanto acotada y fundamentalmente práctica: permite saber qué cuantizaciones existen, qué tamaño ocupa cada una y en qué hardware caben, pero no permite evaluar calidad, sesgos ni idoneidad para producción. El modelo se publicó el 20 de octubre de 2026 y, en el momento de la consulta, registra 0 descargas y 0 likes, sin resultados de benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre indica base de la familia Gemma 4; la model card no detalla la arquitectura) |
| Parámetros totales | 30.697.345.596 (aproximadamente 30,7B), según safetensors |
| Parámetros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas, `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) |
| Tamaño del repositorio | 62,3 GB (conjunto completo de cuantizaciones) |
| Etiquetas declaradas | gguf, endpoints_compatible, conversational, region:us |
| Fecha de creación | 2026-10-20 |
| Última actualización | 2026-10-20 |

## Arquitectura y entrenamiento

No hay información disponible sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni las fases de alineación (RLHF, DPO u otras). La model card del repositorio se limita a metadatos del proceso de cuantización: versión de cuantizador 2, tensor de salida cuantizado, conversión desde formato Hugging Face y omisión del proyector multimodal (`skip_mmproj: 1`), lo que sugiere que el modelo base podría incluir componentes multimodales que no se han trasladado al GGUF, aunque esto no se confirma explícitamente.

El único dato estructural fiable es que se trata de una fusión de modelos ("novel-merged"), es decir, un merge de pesos de dos o más modelos, presumiblemente de la familia Gemma 4. El repositorio original es `sonten/gemma-4-31b-novel-merged`; ni la técnica de merge (SLERP, TIES, DARE, model stock, etc.) ni los modelos progenitores se documentan en la información disponible. Tampoco se detalla si la base incorpora innovaciones como atención lineal, decodificación especulativa o modos de razonamiento explícito.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` indica que el modelo está orientado a diálogo multi-turno, aunque no se especifica el formato de plantilla de chat.
- Compatibilidad con endpoints de inferencia: la etiqueta `endpoints_compatible` sugiere que el repositorio puede desplegarse en infraestructura de Hugging Face Inference Endpoints.
- Cuantizaciones para ejecución local: al estar en GGUF, puede ejecutarse con llama.cpp, Ollama y LM Studio en CPU, GPU o modo híbrido.
- Capacidades multilingües: no disponibles; no se declara ninguna lista de idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Razonamiento multi-paso y uso como agente: no disponible; no se documenta ningún modo de razonamiento explícito.
- Capacidades multimodales: no disponibles en el GGUF; el flag `skip_mmproj: 1` indica que el proyector multimodal no se incluyó en la conversión.

## Casos de uso

- Despliegue conversacional autoalojado: el modelo puede servirse con llama.cpp u Ollama en infraestructura propia para prototipos de chat, aprovechando que existen cuantizaciones desde Q2_K (aproximadamente 11 GB) hasta f16 (aproximadamente 61 GB) para ajustar al hardware disponible.
- Experimentación con modelos fusionados: útil para investigadores que quieran evaluar cualitativamente el resultado de un merge de la familia Gemma 4 sin tener que ejecutar el proceso de fusión ni la conversión a GGUF.
- Pruebas de integración en pipelines de inferencia: la etiqueta `endpoints_compatible` permite desplegarlo como endpoint y comparar latencia y comportamiento frente a otros modelos de 30B en la misma infraestructura.
- Generación de texto en entornos con GPU de consumo: la cuantización Q4_K_M (aproximadamente 18,6 GB de pesos) permite ejecución en una RTX 4090 de 24 GB con contexto moderado, lo que habilita prototipado local sin clúster.
- Evaluación comparativa de cuantizaciones: al publicarse 12 variantes de precisión, sirve para medir la degradación de calidad de un mismo modelo entre Q2_K y Q8_0 en una tarea concreta (por ejemplo, resumen o clasificación).
- Base para ajuste fino ligero o destilación: al derivar de un modelo de 30,7B, puede emplearse como profesor en generación de datos sintéticos, siempre que la licencia del modelo base lo permita (dato no disponible, por lo que requiere verificación previa).
- Investigación sobre sesgos y alucinación en modelos fusionados: permite estudiar si un merge introduce comportamientos degenerados respecto a los modelos originales, un riesgo habitual en fusiones no evaluadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación, ni para el modelo fusionado ni para sus progenitores.

## Requisitos de hardware

Tamaño estimado de pesos por cuantización (cálculo aritmético a partir de 30,7B de parámetros, sin incluir KV cache ni overhead del runtime):

| Cuantización | Bits por peso (aprox.) | Tamaño de pesos (aprox.) |
|---|---|---|
| f16 | 16 | 61,4 GB |
| Q8_0 | 8,5 | 32,6 GB |
| Q6_K | 6,6 | 25,2 GB |
| Q5_K_M | 5,7 | 21,8 GB |
| Q5_K_S | 5,5 | 21,1 GB |
| Q4_K_M | 4,9 | 18,6 GB |
| Q4_K_S | 4,6 | 17,6 GB |
| IQ4_XS | 4,3 | 16,3 GB |
| Q3_K_L | 4,0 | 15,3 GB |
| Q3_K_M | 3,9 | 15,0 GB |
| Q3_K_S | 3,5 | 13,4 GB |
| Q2_K | 2,9 | 11,1 GB |

- VRAM para f16: 61,4 GB de pesos más KV cache; requiere una A100/H100 de 80 GB o dos GPU de 48 GB (L40S, A6000) con tensor parallelism.
- VRAM para Q8_0: aproximadamente 33 GB de pesos; encaja en una GPU de 48 GB o en dos de 24 GB.
- VRAM para Q4_K_M: aproximadamente 18,6 GB de pesos; cabe en una RTX 4090 (24 GB) o RTX 5090 (32 GB) con contexto moderado, y deja margen escaso para KV cache en contextos largos.
- VRAM para Q3_K_M y Q2_K: aproximadamente 15 GB y 11 GB respectivamente; permiten ejecución en GPU de 16 GB (RTX 4080, A4000) con cuantizaciones agresivas y calidad degradada.
- CPU: las variantes Q4_K_M y Q2_K son viables en CPU con 32-64 GB de RAM, con throughput bajo (no se dispone de cifras medidas).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y llama-cpp-python para los ficheros GGUF; vLLM o TGI requerirían los pesos en safetensors del repositorio base `sonten/gemma-4-31b-novel-merged`.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

Los datos de las alternativas provienen de su documentación pública; los del modelo analizado son "no disponible" en casi todas las filas, lo que impide una comparación de rendimiento real.

| Modelo | Parámetros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-31b-novel-merged (GGUF) | 30,7B | No disponible | No disponible | No | GGUF en HF; base en safetensors en `sonten/` |
| Gemma 3 27B IT | 27B | 128K tokens | Términos de uso de Gemma | Sí, publicados por Google | Pesos oficiales y múltiples GGUF de terceros |
| Qwen3-32B | 32,8B | 32.768 tokens nativos (131.072 con YaRN) | Apache 2.0 | Sí, publicados por Alibaba | Pesos oficiales, GGUF y AWQ/GPTQ |

La diferencia práctica más relevante no es de tamaño, sino de trazabilidad: frente a Gemma 3 27B y Qwen3-32B, este repositorio carece de licencia declarada, de evaluación publicada y de documentación de entrenamiento, lo que lo sitúa en un plano experimental.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso de uso comercial; además, al derivar de un modelo de la familia Gemma, habría que verificar los términos de la licencia original del modelo base antes de cualquier uso en producción.
- Ausencia total de evaluación: no hay benchmarks ni evaluación humana publicada, por lo que se desconoce si el merge ha degradado las capacidades de los modelos progenitores.
- Riesgo de alucinación: no cuantificado; al no haber evaluación, no puede acotarse la tasa de errores factuales.
- Idiomas no declarados: se desconoce si conserva el multilingüismo de la familia Gemma o si el merge lo ha reducido a inglés.
- Procedencia del merge opaca: no se identifican los modelos fusionados ni la técnica empleada, lo que impide auditar sesgos heredados o reproducir el resultado.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan de forma notable la calidad en modelos de 30B; para uso serio se recomienda Q5_K_M o superior.
- Posible pérdida de multimodalidad: el flag `skip_mmproj: 1` indica que el proyector multimodal no se incluyó; no debe esperarse entrada de imágenes.
- Señales de adopción nulas: 0 descargas y 0 likes en el momento de la consulta; no hay retroalimentación de la comunidad sobre su comportamiento.
- Contexto desconocido: sin ventana de contexto declarada, no debe asumirse un tamaño concreto al diseñar prompts largos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-4-31b-novel-merged-GGUF
- Modelo base en safetensors: https://huggingface.co/sonten/gemma-4-31b-novel-merged
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la información proporcionada.

# araysuter/Ripple-65B-Preview-MLX-mixed-4bit

## Resumen

Ripple-65B-Preview-MLX-mixed-4bit es una cuantización mixta de 4 bits del modelo Ripple-65B-Preview de ricursiveAI, convertida de forma independiente por el usuario araysuter para su ejecución en Apple Silicon mediante la librería MLX. El modelo original es un transformer de 64.782.689.360 parámetros (aproximadamente 64,8 mil millones) afinado para instrucciones, y esta versión reduce el peso de los pesos a 39,05 GB (36,37 GiB) con una media real de 4,823 bits por parámetro, incluyendo escalas afines, sesgos y tensores protegidos.

La relevancia de esta conversión es práctica: permite ejecutar un modelo de casi 65B en hardware Apple de gama alta (se reporta una ejecución completa con un prompt de 131.008 tokens y hasta 64 tokens de salida en un M5 Max de 64 GiB, con un pico de 46,33 GiB de memoria del proceso). No se trata de un modelo nuevo ni de un reentrenamiento, sino de un artefacto de cuantización que preserva la arquitectura original (PeriNorm, normas Q/K, escalado de embeddings, RoPE local, NoPE global, mezcla de residuos de valor y SwiGLU recortado) mediante un adaptador personalizado de MLX.

La ficha se centra en lo que el artefacto declara explícitamente: el proceso de cuantización, las métricas de fidelidad medidas frente al BF16 original, el alcance de ejecución y las limitaciones reconocidas por el autor. No se dispone de resultados de benchmarks de tareas generales (GPQA, Terminal-Bench, etc.) ni de la model card del modelo base, por lo que muchos datos técnicos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con PeriNorm, normas Q/K, escalado de embeddings, RoPE local, NoPE global, mezcla de residuos de valor y SwiGLU recortado (adaptador MLX personalizado) |
| Parametros totales | 64.782.689.360 (aproximadamente 64,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.008 tokens verificados en una ejecución de prompt objetivo (sin drafter) |
| Tipos de cuantizacion | Mixta: 4 bits en grupos de 64 para matrices MLP y proyecciones de atención; 8 bits en grupos de 64 para puertas sigmoideas de atención, embedding y cabeza de salida; BF16 original para normas y escalares de residuo de valor. Media real: 4,823 bits por parámetro |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería MLX, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo base Ripple-65B-Preview es un transformer de aproximadamente 64,8 mil millones de parámetros afinado para instrucciones. La model card de esta conversión describe elementos arquitectónicos específicos que el adaptador MLX preserva: PeriNorm, normas Q/K, escalado de embeddings, RoPE local, NoPE global, mezcla de residuos de valor y SwiGLU recortado. También se indica que el KV local está acotado y que se conservan el cálculo de activaciones en FP32 y el orden de casteo a BF16 de la referencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. La conversión se realizó desde el checkpoint BF16 afinado para instrucciones, revisión `4f308b9954b73cd200812095916c7baf68cf27f4`, sin recuantizar ningún modelo ya cuantizado y sin usar el modelo Ripple Base (solo preentrenamiento). El encoder seleccionado fue `affine`; la optimización MSE emplea búsqueda de recorte por grupo y refinamiento binario de centroides con una reserva de error afín, y no es GPTQ/AWQ calibrado con activaciones.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` y la etiqueta incluye `conversational`, con un modelo base afinado para instrucciones.
- Razonamiento de contexto largo: se verificó una ejecución con un prompt de 131.008 tokens más hasta 64 tokens de salida en un M5 Max de 64 GiB.
- Ejecución en Apple Silicon mediante MLX: incluye un adaptador personalizado (`modeling_ricursive_mlx.py`) que requiere la opción explícita de confianza (`trust_remote_code`).
- Compatibilidad con decodificación especulativa: existe un draft asociado, Ripple-65B Preview DFlash2, aunque esta release no declara una ruta DFlash2 probada.
- Capacidades de tool calling, function calling, agentes, multilingüismo, visión, audio o modo de pensamiento: no disponibles en la información proporcionada.

## Casos de uso

- Ejecución local en Apple Silicon de gama alta: el artefacto está diseñado para MLX y se probó en un M5 Max de 64 GiB, lo que permite desplegar un modelo de casi 65B en un equipo de sobremesa sin GPU dedicada, con un pico de proceso de 46,33 GiB.
- Procesamiento de documentos largos: con 131.008 tokens de contexto verificados, se puede usar para resumir, extraer información o responder preguntas sobre contratos, informes o bases de código extensas en una sola pasada.
- Prototipado de asistentes conversacionales: al ser un modelo afinado para instrucciones y con pipeline conversacional, sirve para construir chatbots multi-turno en local antes de escalar a infraestructura de servidor.
- Evaluación de cuantización en flujos de investigación: las métricas de fidelidad publicadas (89,75% de acuerdo en el token superior, KL media de 0,067574 nats) permiten estudiar el impacto de la cuantización mixta 4/8 bits frente al BF16 original.
- Generación de texto por lotes en estaciones de trabajo Mac: la velocidad de procesamiento de prompt reportada (299,4 tokens/s sin caché para 2K tokens) permite procesar lotes moderados de entradas en una estación de trabajo.
- Desarrollo y prueba de adaptadores MLX personalizados: el repositorio incluye herramientas de conversión, pines de código fuente y pruebas del adaptador, útil para equipos que necesiten replicar o modificar el proceso de cuantización.
- Inferencia con decodificación especulativa (experimental): el draft DFlash2 asociado puede explorarse para acelerar la generación, aunque esta release no declara una ruta probada y requiere un runtime DFlash2 consciente de Ripple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas generales (MMLU, HumanEval, GSM8K, GPQA, Terminal-Bench) en la información disponible. La model card incluye únicamente diagnósticos sintéticos de fidelidad y tiempos de ejecución:

| Diagnostico | Resultado |
|---|---|
| Posiciones sintéticas con teacher forcing | 1024 |
| Acuerdo en el token superior con el BF16 original en streaming | 89,75% |
| KL media respecto al BF16 original | 0,067574 nats |
| Pérdida de siguiente token sintética, BF16 / cuantizado | 2,1479 / 2,1307 nats |
| Procesamiento de prompt de 2K sin caché, un usuario | 299,4 tokens/s |
| Decodificación en continuación corta de recuperación | 13,3 tokens/s (9 tokens generados) |
| Prompt objetivo de 131.008 tokens más hasta 64 tokens de salida | Completado en M5 Max de 64 GiB; pico de proceso 46,33 GiB; contador de swap del host +346,7 MiB |

El autor advierte que estos son diagnósticos sintéticos pequeños, no puntuaciones de benchmarks del publicador, y que las continuaciones cortas no establecen throughput sostenido. Los pesos originales se evaluaron capa por capa mediante el adaptador de referencia MLX, no con un oráculo PyTorch de modelo completo.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos ocupan 39,05 GB (36,37 GiB); en la prueba de 131K de contexto el pico de proceso fue de 46,33 GiB.
- GPU recomendadas: no se especifican GPU NVIDIA; el artefacto está orientado a Apple Silicon con MLX. Se probó en un Apple M5 Max de 64 GiB.
- Cabe en GPU de consumo: no hay datos para GPU de consumo NVIDIA. En Apple Silicon requiere al menos 64 GiB de memoria unificada para el escenario de contexto largo probado.
- Opciones de despliegue: MLX y MLX-LM (probado con MLX 0.32.4 y MLX-LM 0.32.2); requiere `trust_remote_code`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 299,4 tokens/s en procesamiento de prompt de 2K sin caché y 13,3 tokens/s en decodificación de una continuación corta, medidos con MLX simple, sin drafter, modelo residente, KV nuevo y fragmentos de prompt de 256 tokens.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría ni datos de benchmarks que permitan una comparación rigurosa. El único pariente directo identificado es el modelo base ricursiveAI/Ripple-65B-Preview en BF16 y el draft ricursiveAI/Ripple-65B-Preview-DFlash2, pero no se aportan especificaciones comparativas de terceros.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no se aportan evaluaciones de veracidad; el modelo es un afinado para instrucciones de casi 65B y no se documentan mitigaciones específicas.
- Limitaciones de contexto o idioma: el contexto verificado es de 131.008 tokens en una prueba concreta; no se especifican los idiomas soportados.
- Restricciones de licencia: Apache-2.0, por lo que se permite uso comercial manteniendo la licencia original incluida en el repositorio.
- Requiere `trust_remote_code` y un adaptador MLX personalizado (`modeling_ricursive_mlx.py`); el código debe revisarse antes de cargarlo.
- La cuantización no es GPTQ/AWQ calibrada con activaciones; la fidelidad medida es de 89,75% de acuerdo en el token superior, lo que implica divergencias respecto al BF16 original.
- El soporte de DFlash2 y de la API nativa de TensorFold no está probado en esta release; los resultados con solo el modelo objetivo no se pueden aplicar a configuraciones con drafter y snapshots nativos.
- La prueba de 131K de contexto registró un aumento de 346,7 MiB en el contador de swap del host, lo que no constituye una cualificación de cero swap.
- Las métricas de velocidad provienen de continuaciones cortas y no garantizan throughput sostenido en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/araysuter/Ripple-65B-Preview-MLX-mixed-4bit
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Draft DFlash2: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Herramientas de conversión, pines de código fuente y pruebas: https://github.com/araysuter/TensorFold/tree/896c80b6e99de46b6af2df385f9dbe0dc4fa546c/tools/ripple
- Issue de bring-up nativo de Ripple en TensorFold: https://github.com/ashhart/TensorFold/issues/2171

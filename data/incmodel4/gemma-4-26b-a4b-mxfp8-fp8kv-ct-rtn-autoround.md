# INCModel4/gemma-4-26B-A4B-MXFP8-FP8KV-CT-RTN-AutoRound

## Resumen

`INCModel4/gemma-4-26B-A4B-MXFP8-FP8KV-CT-RTN-AutoRound` es un checkpoint cuantizado del modelo `google/gemma-4-26B-A4B`, un transformer de tipo mezcla de expertos (MoE) con torre de visión y 30 capas de texto, 128 expertos enrutados por capa y activación top-8. El autor del checkpoint es el usuario INCModel4, que aplica una cuantización MXFP8 RTN "model-free" mediante AutoRound sobre los expertos enrutados y las proyecciones de auto-atención, y exporta el resultado en formato `compressed-tensors` compatible con vLLM. El problema que resuelve es el coste de servir un modelo MoE de 26,5B parámetros nominales: el checkpoint reduce el peso en disco de 51,6 GB (BF16) a 28,4 GB, un factor de compresión de 1,8165×.

La relevancia inmediata es de infraestructura: se trata de un artefacto de despliegue, no de un modelo nuevo. Los pesos de los expertos enrutados y de las proyecciones q/k/o (y v en 25 de las 30 capas) se almacenan en `F8_E4M3` con escalas de bloque U8 y tamaño de grupo 32, mientras que el router, la rama MLP compartida, los embeddings, las normas y la torre de visión permanecen en BF16. Además, incorpora escalas estáticas de caché KV en FP8 calibradas con el dataset de texto `NeelNanda/pile-10k`.

El autor reporta que, en el protocolo `lm_eval` emparejado, cuatro métricas principales no empeoran respecto a la línea base BF16 usando la misma caché KV FP8, y advierte explícitamente de que esto no constituye una afirmación de cuantización sin pérdida. La evaluación cubrió únicamente tareas de texto: no se midieron calidad de visión, prompts multimodales, modo "thinking", throughput ni latencia. El despliegue se validó con vLLM 0.29.0 sobre tres RTX 5090 con TP=1 y PP=3.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`Gemma4ForConditionalGeneration`) con torre de visión; 30 capas de texto, 128 expertos enrutados por capa con top-8; 25 capas de atención deslizante y 5 de atención completa |
| Parámetros totales | 26.544.131.376 nominales (26,544B, convención de pesos atados) / 25.805.936.206 elementos de peso únicos serializados |
| Parámetros activos | El nombre "A4B" corresponde a la denominación de parámetros activos del modelo original; el autor no realiza medición propia. Valor numérico exacto: no disponible |
| Longitud de contexto | 131072 tokens (`max_model_len` configurado en la evaluación; los prompts de benchmark no fueron una prueba de estrés de 128K) |
| Tipos de cuantización | MXFP8 (`F8_E4M3`) con escalas U8, simétrico, por grupos de tamaño 32, pesos estáticos, observador `memoryless_minmax`; metadatos de cuantización dinámica de activaciones de entrada en FP8; caché KV estática FP8 tensor-wise; módulos protegidos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (enlace de licencia de Gemma 4 en `https://ai.google.dev/gemma/docs/gemma_4_license`) |
| Formato de pesos | safetensors con `compressed-tensors` (`llm_compressor`); 24222 tensores exportados: 11635 pesos F8_E4M3, 11635 escalas de bloque U8, 838 pesos BF16 y 114 escalas KV estáticas F32 |

Datos adicionales de compresión y almacenamiento:

| Métrica | Valor |
|---|---|
| Tamaño del repo | 28,4 GB (28.412.087.908 bytes según el índice safetensors exportado) |
| Tamaño del modelo base | 51.611.872.412 bytes (BF16) |
| Factor de compresión | 1,8165× |
| Bits efectivos por parámetro | 8,8079 (`8 × bytes exportados / 25.805.936.206`) |

Desglose de precisión por módulo (sobre los 25.805.936.206 elementos de peso únicos):

| Precisión / dtype | Módulo | Tensores | Elementos | Proporción |
|---|---|---:|---:|---:|
| F8_E4M3 | Expertos enrutados gate/up/down (30 × 128 expertos) | 11520 | 22.837.985.280 | 88,4990% |
| F8_E4M3 | Proyecciones de auto-atención de texto (q/k/o en 30 capas; v en 25) | 115 | 1.110.179.840 | 4,3020% |
| BF16 | Rama MLP compartida | 90 | 535.265.280 | 2,0742% |
| BF16 | Router | 90 | 10.901.760 | 0,0422% |
| BF16 | Torre de visión | 355 | 569.550.384 | 2,2071% |
| BF16 | Proyección de embedding de visión | 1 | 3.244.032 | 0,0126% |
| BF16 | Embedding de tokens | 1 | 738.197.504 | 2,8606% |
| BF16 | Otros tensores retenidos (normas, patch/position) | 301 | 612.126 | 0,0024% |
| Total | F8_E4M3 + BF16 | 12473 | 25.805.936.206 | 100,0000% |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo `google/gemma-4-26B-A4B`: un transformer condicional con generación multimodal (`Gemma4ForConditionalGeneration`), compuesto por 30 capas de texto, 128 expertos enrutados por capa con enrutamiento top-8 y una torre de visión. La estructura de atención es híbrida: 25 capas emplean atención deslizante y 5 emplean atención completa. El modelo configura `tie_word_embeddings: true`, lo que explica la diferencia entre el recuento nominal de 26,544B parámetros y los 25.805.936.206 elementos de peso únicos serializados, que son bases de conteo distintas.

Este repositorio no entrena el modelo: aplica una cuantización posterior al entrenamiento de tipo RTN "model-free" con AutoRound sobre el checkpoint BF16 original. Los expertos enrutados y las proyecciones de auto-atención presentes en el origen pasan a `F8_E4M3`; el router, la rama MLP compartida, la torre de visión, la proyección de embedding de visión, los embeddings de tokens y las normas se mantienen en BF16 según los grupos ignorados declarados. Las escalas estáticas de caché KV en FP8 se calibraron con AutoRound usando el dataset de texto `NeelNanda/pile-10k`; de las 114 escalas KV F32 exportadas, las 60 de texto (30 capas × K/V) son finitas y no nulas, mientras que las 54 de visión son cero porque la calibración y la evaluación fueron solo de texto. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición de su dataset ni sobre etapas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: el modelo base pertenece a la familia Gemma 4, descrita por fuentes de terceros como compatible con visión y razonamiento; este checkpoint conserva dichas capacidades en la medida en que la cuantización no las degrade (no verificado).
- Procesamiento de contexto largo: la configuración admite hasta 131072 tokens de longitud máxima, lo que habilita tareas sobre documentos extensos (no sometido a prueba de estrés de contexto largo en la evaluación publicada).
- Capacidades multimodales (image-text-to-text): la torre de visión y la proyección de embedding visual permanecen en BF16 y no fueron cuantizadas, por lo que la ruta multimodal se conserva estructuralmente. Sin embargo, el autor no midió calidad de visión ni prompts multimodales.
- Eficiencia de despliegue: cuantización de pesos en FP8 y caché KV estática en FP8, integrable con el backend vLLM mediante `compressed-tensors`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada; el modo "thinking" no fue evaluado.
- Capacidades multilingües: no disponible; la lista de idiomas no se publica en la información proporcionada.

## Casos de uso

- Servicio de chat en producción con coste reducido: al pasar los expertos enrutados a FP8, el peso en disco cae de 51,6 GB a 28,4 GB, lo que permite servir el modelo en tres GPUs de 32 GB (topología validada: 3× RTX 5090, TP=1/PP=3) en lugar de requerir un nodo de mayor memoria.
- Procesamiento de documentos largos y RAG: la ventana configurada de 131072 tokens permite introducir contratos, informes técnicos o bases de código extensas en un único prompt, siempre que se valide el comportamiento real en longitudes cercanas al máximo (no medido por el autor).
- Generación de código asistida: un modelo MoE de 26,5B con unos 4B parámetros activos por token ofrece un equilibrio entre calidad y coste de inferencia adecuado para autocompletado y revisión de código; requiere verificación propia de la calidad tras la cuantización.
- Razonamiento matemático con prompts simples: el autor documenta una configuración de GSM8K con prompt plano porque el tokenizador usado no incluía `chat_template`; es un punto de partida para evaluaciones internas de aritmética y razonamiento, no una garantía de rendimiento.
- Despliegue con caché KV en FP8 para conversaciones multi-turno: las escalas estáticas de KV calibradas reducen el consumo de memoria de la caché en sesiones largas, lo que abarata mantener historiales extensos en memoria.
- Entorno de evaluación comparativa de cuantizaciones: sirve como artefacto de referencia para contrastar MXFP8 frente a otras recetas (FP8 estándar, INT4 mixto) sobre el mismo modelo base, usando el protocolo `lm_eval` emparejado.
- Investigación en multimodalidad: la torre de visión en BF16 permite estudiar el efecto de cuantizar solo el camino de texto sobre tareas imagen-texto, con la advertencia de que las escalas KV de visión están a cero y no hay evaluación multimodal publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que, en el protocolo `lm_eval` emparejado, cuatro métricas principales no disminuyeron respecto a la línea base BF16 usando la misma caché KV FP8, sin especificar nombres de tareas ni valores numéricos. El propio autor aclara que esto no implica cuantización sin pérdida ni mejora general de calidad.

| Aspecto | Estado en la evaluación publicada |
|---|---|
| Tareas de texto (`lm_eval`, cuatro métricas principales) | Reportadas como no decrecientes frente a BF16; sin cifras publicadas |
| Configuración de prompt | GSM8K con prompt plano, por ausencia de `chat_template` en la configuración del tokenizador usada |
| Longitud de contexto | `max_model_len=131072`, sin prueba de estrés de 128K |
| Visión y prompts multimodales | No medidos |
| Modo "thinking" | No medido |
| Throughput y latencia | No medidos |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos exportados ocupan 28,4 GB, por lo que se necesita un mínimo práctico en torno a 30-34 GB solo para pesos y sobrecarga del runtime, cifra que crece con la longitud de contexto y el tamaño de lote. La memoria de la caché KV no se especifica en la información disponible.
- Topología validada: vLLM 0.29.0 sobre 3× NVIDIA RTX 5090 (32 GB cada una) con TP=1 y PP=3. El autor subraya que esta es la topología probada y no una garantía de equivalencia en otros hardware o repartos de paralelismo.
- GPU de consumidor: no cabe en una única GPU de consumo de 24 GB (RTX 4090, 3090, 5090). Requiere al menos una GPU de 32 GB o reparto en varias GPU.
- GPU de centro de datos: encaje en A100 40/80 GB o H100 80 GB en una sola GPU es plausible por tamaño de pesos, pero no está validado ni documentado en la información proporcionada.
- Opciones de despliegue: vLLM es el único backend validado, con soporte de `compressed-tensors` para MXFP8 y caché KV FP8. No hay confirmación de compatibilidad con llama.cpp, Ollama o TGI; el formato de pesos no es GGUF.
- Latencia y throughput: no disponibles; no se midieron en la evaluación publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Tamaño / formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| `INCModel4/gemma-4-26B-A4B-MXFP8-FP8KV-CT-RTN-AutoRound` (este) | 26,544B nominales; 25.805.936.206 elementos serializados | MXFP8 RTN + KV FP8 estática, `compressed-tensors` | 28,4 GB, safetensors | 131072 configurados (no probado a fondo) | apache-2.0 | Validado en vLLM 0.29.0, 3× RTX 5090, TP=1/PP=3; visión no cuantizada ni evaluada |
| `google/gemma-4-26B-A4B` (base) | 26,544B nominales | BF16 | 51,6 GB, safetensors | No disponible en la información proporcionada | Gemma 4 / Apache 2.0 según la ficha del autor | Referencia de calidad; sin cuantizar |
| `protoLabsAI/gemma-4-26B-A4B-it-FP8` | No disponible en la información proporcionada | FP8 | No disponible | No disponible | No disponible | Alternativa FP8 del mismo modelo base en variante instruida |
| `Intel/gemma-4-26B-A4B-it-int4-mixed-AutoRound` | No disponible en la información proporcionada | INT4 mixto, modo RTN puro | No disponible | No disponible | No disponible | Receta de cuantización más agresiva en bits, publicada por Intel |
| `INCModel4/gemma-4-31B-MXFP8-FP8KV-CT-AutoRound` | Modelo denso de 31B | MXFP8, grupo 32, KV FP8 calibrada | No disponible | No disponible | No disponible | Misma receta del mismo autor sobre la variante densa, no MoE |

## Limitaciones y advertencias

- Cuantización no sin pérdida: el autor declara explícitamente que la no disminución de cuatro métricas en `lm_eval` no equivale a cuantización sin pérdida ni a mejora de calidad, y que el resultado solo aplica a esas tareas y ajustes concretos.
- Evaluación limitada a texto: no se midieron calidad de visión, prompts multimodales, modo "thinking", throughput ni latencia. Cualquier uso multimodal queda sin validar.
- Escalas KV de visión a cero: las 54 escalas estáticas de visión son nulas porque la calibración fue solo de texto, lo que puede afectar al comportamiento de la caché KV en inferencia multimodal.
- Contexto no estresado: aunque se configura `max_model_len=131072`, los prompts de benchmark no fueron una prueba de estrés de 128K, por lo que el rendimiento en contextos cercanos al máximo es desconocido.
- Ausencia de `chat_template`: la configuración del tokenizador usada en la evaluación no incluía plantilla de chat, y GSM8K se ejecutó con prompt plano; los usuarios deben aportar y verificar su propia plantilla.
- Compatibilidad restringida: solo hay validación con vLLM 0.29.0 y `compressed-tensors`; el soporte en otros motores (llama.cpp, Ollama, TGI) no está confirmado y el formato no es GGUF.
- Topología de hardware única probada: 3× RTX 5090 con TP=1/PP=3; no se garantiza equivalencia en otras combinaciones de GPU o de paralelismo.
- Idiomas: no se publica lista de idiomas soportados, lo que impide anticipar cobertura multilingüe.
- Trazabilidad y validación comunitaria muy bajas: 13 descargas y 0 "likes" en el momento de la consulta, repositorio de un autor individual y sin paper asociado; conviene auditar el checkpoint antes de usarlo en producción.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplican los riesgos habituales del modelo base, potencialmente alterados por la cuantización.
- Licencia: el repositorio declara apache-2.0 y enlaza a la licencia de Gemma 4 de Google; conviene revisar los términos de dicha licencia antes de un uso comercial.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/INCModel4/gemma-4-26B-A4B-MXFP8-FP8KV-CT-RTN-AutoRound
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Variante densa con la misma receta: https://huggingface.co/INCModel4/gemma-4-31B-MXFP8-FP8KV-CT-AutoRound
- Alternativa FP8 del mismo modelo base: https://huggingface.co/protoLabsAI/gemma-4-26B-A4B-it-FP8
- Alternativa INT4 mixta: https://huggingface.co/Intel/gemma-4-26B-A4B-it-int4-mixed-AutoRound
- Ficha del modelo base en LM Studio: https://lmstudio.ai/models/google/gemma-4-26b-a4b

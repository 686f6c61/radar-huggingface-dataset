# haiping/Qwen3.8-27B-hybrid-IQ3XXS-NVFP4-velox

## Resumen

Qwen3.8-27B hybrid IQ3XXS-NVFP4-velox es un artefacto de inferencia cuantizado, publicado por el usuario haiping, que empaqueta el modelo Qwen3.8-27B de Alibaba Qwen en un unico fichero de 24,38 GB con formato propietario velox (`.vi` v1). No se trata de un modelo nuevo ni de un fine-tune con pesos distintos en esencia: es una recomposicion del modelo base con multiples esquemas de cuantizacion mezclados (IQ3_XXS, Q4, Q5, Q8, FP8 y NVFP4) optimizada para decodificacion limitada por ancho de banda de memoria y para verificacion con decodificacion especulativa DFlash2.

El artefacto incluye tres componentes en un solo fichero: el modelo de texto, la torre de vision y el drafter DFlash2 para decodificacion especulativa. La cabeza MTP (multi-token prediction) del modelo original se elimina deliberadamente porque el artefacto se sirve con DFlash2. Ademas, las capas MLP densas del modelo de texto incorporan una codificacion NVFP4 adicional marcada como `@prefill`, que velox activa por encima de un umbral de tokens fusionados, de modo que los prefills largos se ejecutan sobre tensor cores FP4.

Su relevancia es practica: demuestra una estrategia de cuantizacion hibrida por componente (no uniforme) para servir un modelo de 27B en un unico fichero de menos de 25 GB, con atencion especial al equilibrio entre velocidad de decodificacion y coste de prefill. La limitacion principal es que requiere el runtime velox y no es legible por NInfer ni, presumiblemente, por el ecosistema GGUF habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base Qwen3.8-27B (detalle no disponible en la informacion proporcionada); artefacto hibrido con multiples codificaciones de cuantizacion |
| Parametros totales | 27B (heredados del modelo base Qwen3.8-27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_XXS, Q4 (g64 fp16), Q5 (g64 fp16), Q6, Q8 (g32 fp16), FP8 E4M3FN, NVFP4, BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | velox `.vi` v1 (fichero unico, 24,38 GB) |

Desglose de objetos y tamano por codificacion segun la model card:

| Formato / layout | Objetos | GB |
|---|---:|---:|
| `nvfp4` / `block_scale_k16_m128x4_v1` | 129 | 10,02 |
| `iq3_xxs` / `iq3_xxs_planar_v1` | 64 | 4,37 |
| `fp8_e4m3fn_row_bf16` / `row_scale_v1` | 80 | 4,15 |
| `q5_g64_fp16` / `row_split_k128_v1` | 118 | 2,48 |
| `q8_g32_fp16` / `row_split_k128_v1` | 8 | 1,57 |
| `q4_g64_fp16` / `row_split_k128_v1` | 119 | 1,33 |
| `bf16` / `contiguous_le_v1` | 620 | 0,45 |
| otros (q6, int32, fp32, recursos) | — | 0,01 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, del que no se aportan detalles de arquitectura interna, composicion del dataset ni proceso de alineacion (RLHF/DPO) en la informacion disponible. Lo que si documenta el artefacto es la estrategia de cuantizacion: los pesos base del modelo de texto se reparten entre IQ3_XXS, Q4, Q5 y FP8, una asignacion no uniforme pensada para dos regimenes distintos. Por un lado, la decodificacion limitada por ancho de banda se beneficia de las codificaciones de menor precision; por otro, la verificacion de DFlash2 requiere precision suficiente en las capas que participan en el calculo de logits y en la validacion de tokens candidatos.

La innovacion tecnica destacable es la doble codificacion del MLP denso. Las capas `text/layers/*/mlp/{gate,up,down}` almacenan tanto su codificacion base como una variante NVFP4 etiquetada `@prefill`. velox selecciona esa variante cuando el numero de tokens fusionados supera su umbral, de forma que los prefills largos se ejecutan sobre tensor cores FP4 mientras la decodificacion token a token usa las codificaciones de menor coste de memoria. El fichero solo almacena objetos referenciados por el modelo, por lo que las codificaciones reemplazadas o descartadas no ocupan espacio. La cabeza MTP se elimina porque el artefacto se sirve con el drafter DFlash2, que asume la funcion de decodificacion especulativa. No se especifica el numero de tokens de entrenamiento ni la composicion del corpus.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.8-27B; el artefacto no altera los pesos de forma sustancial, solo su representacion numerica.
- Vision: el fichero incluye la torre de vision del modelo base, por lo que se preservan las capacidades multimodales de entrada de imagen.
- Decodificacion especulativa: integra el drafter DFlash2 en el mismo artefacto, lo que permite acelerar la generacion sin un segundo fichero de borrador.
- Prefill acelerado en FP4: gracias a la codificacion NVFP4 `@prefill` del MLP denso, los prompts largos se procesan sobre tensor cores FP4.
- Tool calling / function calling: no confirmado en la informacion disponible; depende de las capacidades del modelo base Qwen3.8-27B.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modos especiales (thinking, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue de un modelo de 27B en una sola GPU: el artefacto ocupa 24,38 GB, de modo que encaja en GPUs con 32 GB o mas de VRAM sin necesidad de particionar pesos entre dispositivos, lo que simplifica la operacion y elimina el coste de comunicacion entre GPUs.
- Procesamiento de documentos largos con vision: al incluir la torre de vision y una ruta de prefill en FP4, resulta adecuado para tareas de extraccion o resumen sobre imagenes y documentos escaneados donde el coste dominante es el prefill del contexto visual.
- Generacion interactiva de baja latencia: la combinacion de pesos de baja precision para decodificacion y el drafter DFlash2 apunta a escenarios de chat o autocompletado donde el tiempo por token es critico y el hardware esta limitado por ancho de banda.
- Servicio con prompts largos y respuestas cortas: la codificacion `@prefill` en NVFP4 hace que workloads tipo RAG o clasificacion sobre contextos extensos se beneficien del calculo en tensor cores FP4 durante la fase de prefill.
- Experimentacion en investigacion sobre cuantizacion hibrida: el artefacto sirve como referencia reproducible de una asignacion no uniforme de precision por capa y por fase (prefill frente a decode), util para estudiar el impacto en calidad y throughput.
- Evaluacion de runtimes alternativos: permite comparar el rendimiento de velox frente a vLLM, llama.cpp o TGI sobre el mismo modelo base, aislando el efecto del formato de pesos y del drafter integrado.
- Inferencia en entornos con restricciones de licencia permisivas: al ser Apache-2.0, puede integrarse en productos comerciales sin obligaciones de copyleft, siempre que se cumplan las condiciones del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de throughput o latencia medidos.

## Requisitos de hardware

- VRAM para inferencia: el artefacto pesa 24,38 GB, por lo que se necesita al menos esa cantidad de memoria para los pesos, mas el espacio de cache KV en formato NVFP4 y los buffers del runtime.
- GPU recomendadas: no especificadas por el autor. Por tamano, encaja en A100 80 GB, H100 80 GB, L40S 48 GB y RTX 6000 Ada 48 GB; en GPUs de 32 GB (V100 32 GB, RTX 5090 si mantiene ese nivel de memoria) el margen es ajustado y depende del contexto y del coste de la cache KV.
- GPU de consumo: no confirmado. Las RTX 4090 (24 GB) quedan por debajo del tamano del fichero, por lo que no cabria sin offloading; no hay datos del autor sobre ese escenario.
- Opciones de despliegue: exclusivamente velox, mediante `velox serve --artifact qwen3_8_27b_hybrid.vi --kv-format nvfp4 --port 8010`. NInfer no puede leer ficheros `.vi`. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor no publica cifras de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| haiping/Qwen3.8-27B-hybrid-IQ3XXS-NVFP4-velox | 27B | no disponible | velox `.vi` (24,38 GB) | Apache-2.0 | velox |
| Qwen/Qwen3.8-27B (modelo base) | 27B | no disponible | safetensors (precision original) | Apache-2.0 | vLLM, TGI, transformers, llama.cpp via conversion |
| Cuantizaciones GGUF de la comunidad para modelos de ~27B | 27B | depende del modelo base | GGUF (Q4_K_M, IQ3_XXS, etc.) | heredada del base | llama.cpp, Ollama, LM Studio |

La diferencia principal frente al modelo base es el tamano y el runtime: el artefacto velox reduce el peso a 24,38 GB e incorpora el drafter DFlash2 y la ruta de prefill FP4, a cambio de quedar atado a un unico motor de inferencia. Frente a las cuantizaciones GGUF equivalentes, ofrece una asignacion de precision mas granular y aceleracion de prefill, pero pierde portabilidad. No hay datos de rendimiento publicados que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Dependencia total de velox: el fichero `.vi` no es legible por NInfer ni por los runtimes habituales; sin velox el artefacto es inutilizable.
- Ecosistema y soporte minimos: cero descargas y cero likes en el momento de la consulta, sin documentacion externa, issues ni validacion independiente de calidad.
- Perdida de precision no cuantificada: la mezcla de IQ3_XXS, Q4 y NVFP4 introduce degradacion respecto al modelo en BF16, pero el autor no publica evaluaciones que la midan.
- Cabeza MTP eliminada: el artefacto no puede usarse para decodificacion especulativa basada en MTP; solo funciona con DFlash2.
- Riesgo de alucinacion: inherente al modelo base y potencialmente amplificado por la cuantizacion agresiva en algunas capas; no hay evaluaciones que lo acoten.
- Idiomas y contexto no documentados: se desconoce el soporte multilingue efectivo y la ventana de contexto maxima tras la cuantizacion.
- Licencia: Apache-2.0, igual que el modelo base, lo que permite uso comercial; conviene verificar igualmente los terminos del modelo Qwen3.8-27B original.
- Idoneidad para produccion no demostrada: sin benchmarks, sin pruebas de carga y con un unico mantenedor, no hay evidencia publica de estabilidad en servicio.

## Enlaces

- [Hugging Face: haiping/Qwen3.8-27B-hybrid-IQ3XXS-NVFP4-velox](https://huggingface.co/haiping/Qwen3.8-27B-hybrid-IQ3XXS-NVFP4-velox)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este artefacto.

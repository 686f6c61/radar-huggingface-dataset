# fantasyx07/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen
Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF es una cuantizacion GGUF del modelo base Qwen/Qwen3.8-27B, un transformer denso de 27B parametros con encoder de vision, publicado por el usuario fantasyx07 (atribuido en la model card a HauhauCS). El modelo aplica un perfil de "uncensoring" denominado Aggressive, orientado a respuestas directas y sin rechazos en prompts considerados dificiles, preservando las capacidades originales de texto, razonamiento, agentico, imagen y video del modelo base.

La relevancia tecnica de esta publicacion no reside tanto en el uncensoring como en la integracion de HauhauCS FastMTP, un sidecar de decodificacion especulativa que, segun la model card, ofrece hasta 3,02x de throughput de generacion (TG) en documentos y 1,93x en razonamiento respecto a la variante sin MTP, y hasta 35,2% y 21,1% mas TG que el MTP embebido estandar. Ademas, cada GGUF de texto conserva la cabeza NextN nativa del modelo base.

Se distribuye en una bateria completa de cuantizaciones (de Q8_K_P a IQ2_M), con un proyector de vision BF16 separado de 931 MB y un sidecar FastMTP de 903 MB. El contexto nativo declarado es de 262.144 tokens, extensible hasta 1.000.000.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal con encoder de vision; 48 capas Gated DeltaNet y 16 capas de atencion con compuerta (hibrida lineal/atencion) |
| Parametros totales | 1.863.907.840 segun safetensors del repo; la model card declara "dense 27B" (discrepancia no resuelta en la informacion disponible) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | Q8_K_P (9,21 BPW), Q8_0, Q6_K_P (7,59), Q6_K, Q5_K_P (5,92), Q5_K_M, Q4_K_P (5,25), Q4_K_M, IQ4_XS (4,60), Q3_K_P (3,93), Q3_K_M, IQ3_M (3,74), IQ3_XS (3,56), Q2_K_P (3,12), IQ2_M (3,02) |
| Idiomas soportados | Ingles (en), chino (zh) y multilingue (segun tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto, proyector de vision BF16 y sidecar FastMTP en GGUF separados) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura del Qwen3.8-27B: un language model denso causal de 64 capas, hidden size 5.120, FFN de 17.408 y vocabulario padded de 248.320 tokens. La estructura de atencion es hibrida, con 48 capas Gated DeltaNet (atencion lineal con estado recurrente) y 16 capas de atencion con compuerta, combinacion que busca reducir coste de atencion en contextos largos manteniendo calidad de recuperacion. Incluye un encoder de vision que permite entrada image-text-to-text, con proyector BF16 distribuido por separado (931 MB).

La innovacion principal de esta publicacion es la preservacion de la cabeza NextN (MTP) nativa en todos los GGUF de texto, complementada con el sidecar HauhauCS FastMTP-32K (903 MB), un perfil de decodificacion especulativa calibrado para el lineup completo de cuantizaciones a contexto nativo maximo. Las cuantizaciones K_P ("Perfect") son perfiles personalizados por modelo que, segun el autor, elevan la calidad uno o dos niveles de cuantizacion con solo un 5-15% de incremento de tamano respecto al quant base, manteniendo compatibilidad con llama.cpp y LM Studio sin build especial. No se detallan en la informacion proporcionada los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, etapas de RLHF/DPO), ni el procedimiento concreto de uncensoring aplicado.

## Capacidades
- Generacion de texto y razonamiento multi-paso, incluyendo modo de razonamiento (reasoning TG reportado en la model card).
- Entrada multimodal de imagen y video mediante el proyector BF16 (pipeline image-text-to-text).
- Razonamiento agentico y tool calling, preservado del modelo base Qwen3.8-27B.
- Capacidades multilingues limitadas a ingles, chino y perfil multilingue generico.
- Decodificacion especulativa acelerada mediante MTP/NextN embebido y FastMTP 32K.
- Perfil "Aggressive": respuestas directas, sin preambulo minimo y sin comportamiento de rechazo (la model card cita 0/465 rechazos en su evaluacion).
- Contexto largo nativo de 262.144 tokens, extensible a 1.000.000.

## Casos de uso
- Generacion de documentos largos con throughput alto: el sidecar FastMTP ofrece hasta 3,02x de TG en documentos respecto a la variante sin MTP, adecuado para pipelines de sintesis de informes o resumenes de corpus extensos.
- Razonamiento agentico de varios pasos: la aceleracion de 1,93x en reasoning TG y el contexto de 262K tokens permiten cadenas de herramientas y planificacion con historial largo sin penalizacion de latencia.
- Analisis de imagen y video: con el proyector BF16 se puede usar en pipelines de description, extraccion de informacion visual o QA sobre video, manteniendo el resto del modelo en cuantizacion reducida.
- Atencion al cliente automatizada: conversaciones multi-turno con contexto largo gracias a los 262.144 tokens nativos, con respuestas directas y bajo preambulo derivadas del perfil Aggressive.
- Despliegue en hardware consumer: las cuantizaciones IQ2_M (10,32 GB) e IQ3_XS (12,18 GB) permiten ejecutar el modelo en GPU de 12-16 GB VRAM via llama.cpp o LM Studio.
- Investigacion sobre uncensoring y alineacion: el perfil Aggressive y la evaluacion de rechazos (0/465) sirven como referencia comparativa frente a variantes Balanced o modelos alineados.
- Servicio de inferencia local con GGUF-compatible runtimes: los K_P quants son GGUFs estandar, por lo que se integran sin plugin en llama.cpp y LM Studio.

## Benchmarks y rendimiento
La model card solo reporta metricas relativas de throughput de decodificacion especulativa, no benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Resultado declarado |
|---|---|
| TG documentos vs. sin MTP | Hasta 3,02x |
| TG razonamiento vs. sin MTP | Hasta 1,93x |
| TG documentos vs. MTP embebido estandar | Hasta +35,2% |
| TG razonamiento vs. MTP embebido estandar | Hasta +21,1% |
| Rechazos en evaluacion del autor | 0/465 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia segun cuantizacion: IQ2_M ~10,3 GB; IQ3_XS ~12,2 GB; IQ3_M ~12,8 GB; Q3_K_P ~13,4 GB; IQ4_XS ~15,7 GB; Q4_K_P ~17,9 GB; Q5_K_P ~20,2 GB; Q6_K_P ~25,9 GB; Q8_K_P ~31,5 GB (mas ~931 MB del proyector si se usa vision y ~903 MB del sidecar FastMTP).
- GPU consumer: las cuantizaciones IQ2_M a IQ4_XS caben en GPUs de 12-24 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090 24 GB); Q5_K_P y superiores requieren 24 GB o mas y pueden necesitar offload parcial a CPU.
- GPU profesional: A100 40/80 GB, H100 y L40S permiten cargar Q8_K_P completo con contexto largo; para el contexto nativo de 262K tokens hay que reservar VRAM adicional para la KV cache.
- Despliegue: llama.cpp, LM Studio y otros runtimes compatibles con GGUF. Los K_P quants pueden mostrarse como `?` en la columna de cuantizacion de LM Studio (problema de visualizacion, no de carga). No se documenta soporte en vLLM o TGI para este formato.
- Latencia y throughput: no se proporcionan valores absolutos (tokens/s); solo las aceleraciones relativas de FastMTP indicadas en la tabla de benchmarks.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B Uncensored Aggressive MTP GGUF) | 27B (segun model card) | 262.144 (ext. 1M) | GGUF + proyector BF16 + FastMTP | Apache 2.0 | Perfil uncensored Aggressive, MTP/FastMTP, vision |
| Qwen/Qwen3.8-27B (base) | 27B | 262.144 (ext. 1M) | safetensors | Apache 2.0 | Modelo original alineado, sin perfil uncensored ni sidecar FastMTP |
| Variante Balanced de HauhauCS (si disponible) | 27B | 262.144 | GGUF | Apache 2.0 | Perfil menos agresivo, recomendado por el autor para trabajo agentico de contexto largo fiable |

No se dispone en la informacion proporcionada de datos de rendimiento de calidad comparables con otros modelos de la misma categoria.

## Limitaciones y advertencias
- El perfil Aggressive elimina el comportamiento de rechazo; esto incrementa el riesgo de generar contenido danino, sesgado o inapropiado en produccion y complica el cumplimiento de politicas de contenido.
- El autor recomienda la variante Balanced (si existe) para trabajo agentico de contexto largo sensible a fiabilidad; la Aggressive prioriza respuestas directas sobre la auto-verificacion.
- Riesgo de alucinacion inherente a modelos de 27B densos, agravado por la ausencia de benchmarks de calidad publicados en esta ficha.
- Discrepancia entre los 1.863.907.840 parametros del safetensors del repo y la declaracion "dense 27B" de la model card; conviene verificar antes de planificar VRAM.
- Idiomas oficialmente soportados limitados a ingles, chino y multilingue generico; el castellano no figura como idioma principal.
- Las cuantizaciones IQ2_M e IQ3_XS degradan calidad de forma notable; no son recomendables para tareas de razonamiento exigente.
- Los K_P quants pueden aparecer como `?` en LM Studio; no es un fallo de carga, pero puede confundir en automatizacion.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado por un modelo sin rechazos recae en el desplegador.
- No hay evidencia de soporte en vLLM o TGI para este paquete GGUF con sidecar FastMTP; el despliegue esta orientado a llama.cpp/LM Studio.

## Enlaces
- [Hugging Face: fantasyx07/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF](https://huggingface.co/fantasyx07/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Discord del autor](https://discord.gg/SZ5vacTXYf)
- [Q8_K_P GGUF](https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q8_K_P.gguf)
- [Q6_K_P GGUF](https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q6_K_P.gguf)
- [Q5_K_P GGUF](https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q5_K_P.gguf)
- [Q4_K_P GGUF](https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q4_K_P.gguf)
- [IQ4_XS GGUF](https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ4_XS.gguf)
- [Q3_K_P GGUF](https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q3_K_P.gguf)
- [IQ3_M GGUF](https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ3_M.gguf)
- [IQ3_XS GGUF](https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ3_XS.gguf)
- [Q2_K_P GGUF](https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q2_K_P.gguf)
- [IQ2_M GGUF](https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ2_M.gguf)
- [Proyector de vision BF16](https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/mmproj-Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-BF16.gguf)
- [Sidecar FastMTP-32K](https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-FastMTP-32K.gguf)

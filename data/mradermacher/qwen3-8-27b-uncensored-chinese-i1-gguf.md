# mradermacher/Qwen3.8-27B-Uncensored-Chinese-i1-GGUF

## Resumen

`mradermacher/Qwen3.8-27B-Uncensored-Chinese-i1-GGUF` es un repositorio de cuantizaciones GGUF generadas por mradermacher a partir del modelo `vurtnesaerdna/Qwen3.8-27B-Uncensored-Chinese`, una variante "uncensored" (abliterated a nivel de pesos) de la familia Qwen3.8 de 27 000 millones de parámetros, orientada al idioma chino. El autor no entrena el modelo: aplica su pipeline de cuantización con importance matrix (imatrix) sobre los pesos ya convertidos a formato HF, produciendo 25 variantes de cuantización entre IQ1_S y Q6_K.

La relevancia de este tipo de repositorio es practica: permite ejecutar un modelo de ~27B en hardware de consumo mediante llama.cpp u Ollama, a costa de perdida de precision. La variante "Chinese" apunta a casos de uso donde se requiere generacion en chino sin los filtros de rechazo del modelo original, algo habitual en investigacion de seguridad y red-teaming.

Conviene tratar este repositorio con cautela: el campo de parametros totales reportado por HuggingFace (3 391 984) es incompatible con el nombre del modelo (27B), el tamano del repo figura como 0.0 GB, no tiene descargas ni licencia declarada, y la fecha de creacion registrada (2026-09-27) es incoherente con una verificacion en fecha actual. Es probable que el repositorio este incompleto o sea un marcador de posicion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base de la familia Qwen3.8; se asume transformer denso, sin confirmar) |
| Parametros totales | Discrepancia: el nombre indica 27B; el metadato safetensors del repo indica 3 391 984. No verificable |
| Parametros activos | No aplica / no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | 262 144 tokens segun la ficha de `orcarouter/Qwen3.8-27B-Uncensored` en Ollama; no confirmado para este repositorio |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | No disponible (el nombre sugiere especializacion en chino; el modelo base Qwen es multilingue) |
| Licencia | No disponible en este repositorio. El repo hermano `mradermacher/Qwen3.8-27B-full-Uncensored-i1-GGUF` declara apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones con imatrix, `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) |
| Autor de las cuantizaciones | mradermacher |
| Modelo de origen | `vurtnesaerdna/Qwen3.8-27B-Uncensored-Chinese` |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0.0 GB (segun HuggingFace) |

## Arquitectura y entrenamiento

No hay informacion publicada en este repositorio sobre la arquitectura del modelo base ni sobre su proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO). Lo unico documentado es el nombre: se trata de una variante de Qwen3.8 de 27B. Por analogia con la familia Qwen, lo esperable es un transformer denso con decodificacion autorregresiva, atencion por grupos (GQA) y una ventana de contexto muy amplia, pero esto no esta confirmado en la informacion disponible.

La innovacion tecnica de este repositorio concreto es el proceso de cuantizacion: mradermacher genera cuantizaciones ponderadas con importance matrix (imatrix), una tecnica que estima la importancia de cada peso a partir de activaciones observadas sobre un corpus de calibracion, reduciendo la degradacion de perplejidad respecto a la cuantizacion uniforme en bits bajos. El autor etiqueta el pipeline con el identificador `nicoboss`. La model card tambien menciona un proceso "abliterated" (eliminacion de direcciones de rechazo a nivel de pesos) en el modelo de origen, pero no se detalla la metodologia.

## Capacidades

- Generacion de texto y conversacion multi-turno en el modelo base de la familia Qwen3.8.
- Capacidades de razonamiento y modo "thinking" (segun la ficha de `orcarouter/Qwen3.8-27B-Uncensored` en Ollama, que describe "tool calling and thinking"; no confirmado para este repositorio).
- Soporte de tool calling / function calling, segun esa misma ficha de terceros.
- Capacidades de vision (torre visual `mmproj` intacta segun la ficha de Ollama del modelo sin cuantizar); en este repositorio GGUF no se confirma la presencia ni calidad del proyector multimodal.
- Generacion y comprension en chino, segun la denominacion "Chinese" del modelo de origen.
- Generacion de codigo: aparece mencionada en repos derivados (`Swift-Qwen3.8-27B-Uncensored-MTP-Terse-Coder`), no verificada en este repositorio.
- Comportamiento "uncensored": la ficha de terceros afirma 0 % de sobre-rechazo en XSTest y entre 0-6 % de rechazo en su bateria A/B, con perdida de capacidad no medible. Estos datos no estan respaldados por ninguna evaluacion publicada en este repositorio.

## Casos de uso

- Investigacion en seguridad de IA y red-teaming: el modelo permite estudiar comportamientos de rechazo y sobre-rechazo sin las mitigaciones del modelo alineado, usando las cuantizaciones Q4_K_M o Q5_K_M para obtener respuestas representativas.
- Generacion de contenido en chino en entornos controlados: la especializacion linguistica declarada lo hace adecuado para tareas de redaccion o traduccion hacia chino cuando no se dispone de acceso a APIs.
- Despliegue local en estaciones de trabajo sin GPU de datacenter: con las cuantizaciones Q3_K_M (~13,5 GB) o Q4_K_M (~16,8 GB) citadas en el repositorio de GitHub `Wassimyounes01/qwen38-uncensored`, cabe en equipos con 16-24 GB de VRAM o memoria unificada.
- Prototipado de agentes con contexto largo: si se confirma la ventana de 262 144 tokens, permite mantener historiales extensos de conversacion o documentos completos en memoria, con la salvedad del coste de KV cache.
- Asistencia de codigo en pipelines locales: si se verifica el soporte de tool calling, puede integrarse en flujos de autocompletado o revision de parches sobre repositorios privados sin enviar codigo a servicios externos.
- Analisis de documentos extensos en chino: contratos, informes tecnicos o expedientes que superen la ventana de modelos de 8-32K tokens.
- Educacion y divulgacion sobre cuantizacion: el repositorio cubre 25 variantes distintas, lo que lo convierte en un material util para medir empiricamente el impacto de IQ1/IQ2 frente a Q5/Q6.
- Inferencia en Apple Silicon: existe soporte MLX mencionado en repos derivados, con ganancias citadas del 30-50 % en velocidad frente a llama.cpp en Mac. No confirmado para este repositorio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, perplejidad por cuantizacion ni comparativas numericas en la model card ni en los resultados de busqueda. Las afirmaciones de "0 % de sobre-rechazo en XSTest" y "0-6 % de rechazo" proceden de una ficha de terceros en Ollama y no van acompanadas de metodologia ni de resultados reproducibles.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos unicamente, sin KV cache): orientativamente 10-12 GB en IQ2/Q2, ~13,5 GB en Q3_K_M, ~16,8 GB en Q4_K_M, ~19-21 GB en Q5_K_M y ~22-24 GB en Q6_K. Solo las cifras de Q3_K_M (13,5 GB) y Q4_K_M (16,8 GB) estan publicadas y provienen de un repositorio derivado, no de este. El resto son estimaciones a partir del recuento de parametros.
- El KV cache es el factor dominante si se usa la ventana completa de 262 144 tokens: la memoria adicional puede superar ampliamente el tamano de los pesos, incluso con cuantizacion del cache. Para contextos largos se recomienda cuantizar el KV cache y evaluar la VRAM total antes de desplegar.
- GPU recomendadas: para cuantizaciones bajas, RTX 3090/4090 (24 GB), RTX 5090, o Apple Silicon con memoria unificada de 24-64 GB. Para Q5/Q6 en contexto largo, A100 40 GB, H100 80 GB o L40S 48 GB.
- Cabe en GPU de consumo: si, en Q3_K_M y Q4_K_M sobre GPUs de 16-24 GB (RTX 4080, 4090, 3090). Las cuantizaciones IQ1/IQ2 permiten bajar a 12-16 GB, con degradacion notable esperable.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (existe una publicacion de `orcarouter/Qwen3.8-27B-Uncensored`), LM Studio, text-generation-webui, koboldcpp. vLLM y TGI soportan GGUF de forma limitada y no son la via recomendada para estas cuantizaciones.
- Latencia y throughput: no disponibles. Dependen por completo del hardware, del backend y de la cuantizacion elegida; no hay mediciones publicadas para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `mradermacher/Qwen3.8-27B-Uncensored-Chinese-i1-GGUF` (este) | 27B declarados (metadato inconsistente) | No confirmado | GGUF | No disponible | 25 cuantizaciones imatrix; 0 descargas; repo de 0.0 GB |
| `mradermacher/Qwen3.8-27B-full-Uncensored-i1-GGUF` | 27B declarados | No disponible | GGUF, safetensors, MLX | apache-2.0 | Variante "full" sin especializacion en chino; declara capacidades conversacionales |
| `mradermacher/Swift-Qwen3.8-27B-Uncensored-MTP-Terse-Coder-i1-GGUF` | 27B declarados | No disponible | GGUF | No disponible | Orientado a codigo, con MTP (multi-token prediction) y estilo "terse" |
| `orcarouter/Qwen3.8-27B-Uncensored` (Ollama) | 27B declarados | 262 144 tokens | GGUF para Ollama | No disponible | Torre visual y cabeza MTP intactas; tool calling y thinking |
| `vurtnesaerdna/Qwen3.8-27B-Uncensored-Chinese` | 27B declarados | No disponible | safetensors | No disponible | Modelo de origen del que derivan estas cuantizaciones |

No se dispone de datos de rendimiento comparativos entre estas variantes; la comparacion se limita a formato, licencia y especializacion declarada.

## Limitaciones y advertencias

- Consistencia de metadatos: el campo de parametros totales (3 391 984) contradice el nombre del modelo (27B). Antes de descargar nada, verificar el listado real de ficheros y sus tamanos.
- Repositorio posiblemente vacio o incompleto: 0.0 GB de tamano, 0 descargas y 0 likes. Riesgo alto de que los ficheros GGUF no esten subidos o lo esten parcialmente.
- Sin licencia declarada: no se puede asumir uso comercial permitido. La licencia del modelo de origen tampoco aparece en la informacion disponible. Aunque el repo hermano "full" declara apache-2.0, eso no se extiende automaticamente a este.
- Modelo "uncensored": la abliteration elimina direcciones de rechazo, lo que incrementa el riesgo de generar contenido danino, ilegal o gravemente sesgado. No es apto para despliegue orientado al publico sin una capa de filtrado propia.
- Riesgo de alucinacion: no hay evaluaciones publicadas. Un modelo abliterated suele mostrar mayor tendencia a afirmar con seguridad informacion falsa, especialmente en dominios factuales.
- Degradacion por cuantizacion: las variantes IQ1/IQ2 y Q2_K estan por debajo de 3 bits por peso y suelen producir errores gramaticales, repeticiones y perdida de coherencia en contextos largos. Para uso serio, partir de Q4_K_M o superior.
- Coste de contexto: aunque la ventana de 262K sea real en el modelo base, mantenerla activa en un GGUF de 27B exige mucha memoria de KV cache; en hardware de consumo habra que recortar contexto de forma significativa.
- Idiomas: no hay lista oficial de idiomas soportados para esta variante. El rendimiento en castellano no esta documentado y podria ser inferior al del modelo base por la especializacion en chino y el proceso de abliteration.
- Fecha de creacion registrada (2026-09-27) incoherente: tratar cualquier metadato temporal de este repositorio como no fiable.
- Capacidades multimodales: la presencia de la torre visual se afirma para el modelo sin cuantizar, no para estos GGUF. No asumir vision sin verificarla con el `mmproj` correspondiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Chinese-i1-GGUF
- Modelo de origen: https://huggingface.co/vurtnesaerdna/Qwen3.8-27B-Uncensored-Chinese
- Variante "full" del mismo autor: https://huggingface.co/mradermacher/Qwen3.8-27B-full-Uncensored-i1-GGUF
- Variante coder con MTP: https://huggingface.co/mradermacher/Swift-Qwen3.8-27B-Uncensored-MTP-Terse-Coder-i1-GGUF
- Repositorio GitHub con instrucciones de despliegue (Mac/Windows): https://github.com/Wassimyounes01/qwen38-uncensored
- Publicacion en Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Seguimiento de descargas: https://parapulse.io/models/mradermacher/Qwen3.8-27B-Uncensored-i1-GGUF

# CrossNow/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una version cuantizada del modelo Qwen/Qwen3.8-27B, publicada por CrossNow, en la que se ha aplicado una tecnica de ablacion de direcciones de rechazo (abliteration) para reducir sustancialmente el comportamiento de rechazo del modelo ante solicitudes que el modelo original podria considerar problematicas. El resultado se distribuye exclusivamente en formato GGUF para su uso con llama.cpp y runtime compatibles, manteniendo intactas las capacidades del modelo base: arquitectura densa de 27.320 millones de parametros, ventana de contexto de 262.144 tokens, y soporte nativo de vision (imagenes y video).

La relevancia de este modelo reside en dos aspectos tecnicos. Primero, conserva la cabeza de prediccion multi-token (MTP) del modelo base, lo que permite usar decodificacion especulativa integrada sin necesidad de un modelo draft externo. Segundo, el proceso de ablacion se realizo en bf16 sin cuantizacion intermedia, y los tensores `mtp.*` se injertaron de nuevo desde el checkpoint base tras la ablacion, verificando cada archivo despues de la cuantizacion. El repositorio incluye tambien una matriz de importancia (imatrix) calculada directamente sobre los pesos f16, y un conjunto de cuantizaciones que van de IQ2_M a Q8_0, con mediciones de perplejidad comparables entre si.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer denso con atencion multimodal) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0, f16 (no distribuido) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 64 capas con vocabulario de 248.320 tokens, disenado como modelo vision-lenguaje nativo que procesa imagenes y video ademas de texto. Incluye una capa de prediccion multi-token (MTP) que actua como modelo draft integrado para decodificacion especulativa, acelerando la inferencia sin degradar la calidad de salida, ya que cada token especulativo se verifica contra el modelo objetivo.

El proceso de "uncensoring" se realizo con la herramienta Heretic, que co-minimiza el numero de rechazos frente a la divergencia KL con el modelo base. No se uso fine-tuning ni datos de entrenamiento adicionales. La ablacion se ejecuto en bf16 y el LoRA resultante se fusiono en el modelo base, por lo que los pesos publicados no son un round-trip cuantizado. Los tensores `mtp.*` se copiaron literalmente del checkpoint base tras la fusion, ya que la ablacion solo modifica `attn.o_proj` y `mlp.down_proj` de la pila principal. La matriz de importancia se calculo directamente desde el f16, no desde una cuantizacion intermedia, usando wikitext-2 raw con 200 chunks.

## Capacidades

- Generacion de texto y razonamiento multi-step con control flexible de "thinking mode" (heredado del modelo base).
- Comprension de imagenes y video como modelo vision-lenguaje nativo.
- Decodificacion especulativa integrada gracias a la cabeza MTP conservada, con tasa de aceptacion potencialmente ligeramente inferior a la del modelo base (la cabeza draft se entreno contra el modelo sin ablacion).
- Soporte de tool calling y function calling (capacidad del modelo base Qwen3.8).
- Capacidades multilingues limitadas a ingles y chino segun la model card.
- Comportamiento de rechazo sustancialmente reducido respecto al modelo base, aunque no eliminado por completo.

## Casos de uso

- Generacion de contenido creativo sin restricciones: el modelo puede producir narrativa, guiones o material de marketing sin los rechazos habituales de los modelos alineados, util para equipos creativos que necesitan explorar temas sensibles sin friccion.
- Asistente de codigo con contexto largo: con 262.144 tokens de ventana, puede procesar repositorios completos o archivos de gran tamano, manteniendo coherencia en tareas de refactorizacion o generacion de tests.
- Analisis de documentos multimodales: al aceptar imagenes y video, puede extraer informacion de capturas de pantalla, diagramas o frames de video en combinacion con instrucciones de texto.
- Desarrollo de agentes autonomos: el soporte de tool calling y el razonamiento multi-step permiten construir agentes que planifican, ejecutan herramientas y verifican resultados en bucles largos.
- Investigacion sobre alineacion y seguridad: el proceso de ablacion documentado y las mediciones de perplejidad lo convierten en un caso de estudio util para investigar el impacto de la ablacion de direcciones de rechazo en las capacidades del modelo.
- Despliegue en entornos con recursos limitados: las cuantizaciones IQ2_M (10,6 GB) e IQ4_XS (15,3 GB) permiten ejecutar el modelo en GPUs de consumo con 12-16 GB de VRAM, manteniendo una perplejidad cercana a la del f16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El repositorio incluye mediciones de perplejidad en wikitext-2, comparables entre cuantizaciones y frente al baseline f16:

| Archivo | PPL (wikitext-2) | vs f16 |
|---|---|---|
| f16 (baseline, no distribuido) | 7,1557 +/- 0,25104 | - |
| Q5_K_M | 7,1573 +/- 0,25055 | +0,0016 |
| IQ4_XS | 7,1583 +/- 0,25019 | +0,0026 |
| Q6_K | 7,1689 +/- 0,25149 | +0,0132 |
| Q8_0 | 7,1764 +/- 0,25195 | +0,0207 |
| Q4_K_M | 7,1814 +/- 0,25227 | +0,0257 |
| IQ2_M | 7,8581 +/- 0,27481 | +0,7024 |

El autor advierte que las diferencias entre cuantizaciones (excepto IQ2_M) estan dentro del error estandar y no son estadisticamente significativas. La perplejidad solo detecta dano grosero de cuantizacion y no mide razonamiento, codigo ni comportamiento de rechazo.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 10,6 GB (IQ2_M) y 29,0 GB (Q8_0) para el archivo GGUF, mas overhead de contexto y KV cache. Con 262.144 tokens de contexto completo, la VRAM necesaria supera ampliamente el tamano del archivo.
- GPU recomendadas: para cuantizaciones Q4_K_M o superiores, una GPU con 24 GB de VRAM (RTX 3090/4090, A5000) es suficiente para contextos moderados. Para contextos largos o Q8_0, se recomienda A100 80GB o H100.
- En GPU de consumo: IQ2_M e IQ4_XS caben en GPUs de 12-16 GB (RTX 3060 12GB, RTX 4070 Ti Super 16GB) con contextos reducidos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores compatibles con GGUF como llama.cpp-server. Para decodificacion especulativa con draft externo, usar los archivos `noMTP-*` junto con `draft-Q8_0.gguf` y la opcion `--model-draft`.
- Latencia y throughput: no disponible. La decodificacion especulativa con MTP integrado deberia mejorar el throughput respecto a la generacion autoregresiva estandar, pero no se proporcionan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,3 B | 262.144 | Apache-2.0 | safetensors | Modelo original, con alineamiento estandar |
| Qwen3.8-27B-Uncensored-GGUF (este) | 27,3 B | 262.144 | Apache-2.0 | GGUF | Ablacion de rechazos, MTP conservado |
| Qwen3.8-27B-Uncensored-YMQ-MTP-GGUF | 27,3 B | 262.144 | Apache-2.0 | GGUF | Alternativa similar con MTP, de zerodigest |
| Qwen3.8-27B-GGUF (CrossNow) | 27,3 B | 262.144 | Apache-2.0 | GGUF | Version sin ablacion del mismo autor |

La diferencia principal frente al modelo base es el comportamiento de rechazo reducido. Frente a otras versiones uncensored, la verificacion explicita de los tensores MTP y la imatrix calculada sobre f16 son diferenciadores tecnicos.

## Limitaciones y advertencias

- El comportamiento de rechazo esta "sustancialmente reducido, no eliminado". El modelo puede seguir negandose a ciertas solicitudes.
- La ablacion puede afectar a otras capacidades no medidas por perplejidad. El autor no proporciona benchmarks de razonamiento, codigo o seguridad.
- La cabeza MTP se entreno contra el modelo sin ablacion, por lo que la tasa de aceptacion de la decodificacion especulativa puede ser ligeramente inferior.
- Idiomas limitados a ingles y chino. No se garantiza calidad en otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo puede generar contenido que infrinja politicas de plataforma o legislacion local. El usuario es responsable del uso.
- Las cuantizaciones IQ2_M muestran una degradacion medible de perplejidad (+0,70 vs f16) y pueden presentar artefactos en tareas complejas.
- No se proporcionan benchmarks de seguridad, sesgos o alucinacion. El modelo puede producir contenido falso o danino con mayor facilidad que el base al tener menos rechazos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CrossNow/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Version sin ablacion del mismo autor: https://huggingface.co/CrossNow/Qwen3.8-27B-GGUF
- Alternativa similar con MTP: https://huggingface.co/zerodigest/Qwen3.8-27B-Uncensored-YMQ-MTP-GGUF
- Herramienta Heretic (ablacion): https://github.com/p-e-w/heretic
- Dataset wikitext: https://huggingface.co/datasets/Salesforce/wikitext

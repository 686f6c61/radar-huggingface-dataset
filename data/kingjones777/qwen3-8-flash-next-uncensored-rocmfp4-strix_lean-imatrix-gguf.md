# kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-STRIX_LEAN-imatrix-GGUF

## Resumen
Esta ficha describe una cuantización GGUF del modelo Qwen3.8-Flash-Next-Uncensored, publicada por el usuario kingjones777 en Hugging Face. Se trata de un artefacto de investigación orientado específicamente al hardware AMD Ryzen AI Max+ 395 (Radeon 8060S, arquitectura gfx1151, conocida como Strix Halo), con pesos en formato ROCmFP4 e importance matrix (imatrix). El modelo base es Qwen3.8-Flash-Next, sobre el que se ha aplicado una eliminación de los mecanismos de rechazo (uncensored), y la cuantización se ha calibrado con el corpus de bartowski para minimizar la pérdida de perplejidad.

La relevancia de esta publicación es doble. Por un lado, demuestra la viabilidad de ejecutar un modelo de gran tamaño en un sistema de memoria unificada de 128 GB sin GPU dedicada de gran VRAM, mediante tipos de tensor ROCmFP4 y decodificación especulativa con cabezas MTP. Por otro, documenta de forma inusualmente detallada el proceso de cuantización, las mediciones de rendimiento y la comparación de perplejidad entre distintas variantes, lo que la convierte en una referencia útil para quienes trabajan con inferencia local en hardware AMD.

El repositorio ocupa 212,8 GB repartidos en tres fragmentos (shards) de como máximo 40 GiB cada uno. No debe confundirse con un modelo de pesos completos: es una distribución cuantizada que requiere un fork específico de llama.cpp (ROCmFPX) con soporte simultáneo para la arquitectura qwen4exp y los tipos de tensor ROCmFP4. La licencia declarada es qwen-community-1.0.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida y componentes SSM (arquitectura qwen4exp); incluye tensores hc_attn, hc_ffn, hc, ssm_alpha y ssm_beta |
| Parametros totales | 448.931.056 (dato de safetensors del modelo base); la model card menciona además 51,2B de PLE |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens en el ejemplo de despliegue; contexto de calibración de imatrix limitado a 4096 y 512 según la medición |
| Tipos de cuantizacion | ROCmFP4 (tipos 100 y 101 de GGUF), Q8_0 y F32 en tensores seleccionados; variantes FAST, FAST imatrix y STRIX_LEAN imatrix |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (declarada como "other" en los metadatos) |
| Formato de pesos | GGUF en tres shards (00001-of-00003, 00002-of-00003, 00003-of-00003) |

## Arquitectura y entrenamiento
La arquitectura subyacente es qwen4exp, una variante de transformer que incorpora mecanismos de atención híbrida y componentes de tipo SSM. Los tensores presentes en el GGUF confirman esta estructura: matrices hc_attn y hc_ffn (down y up), tensores de inyección hc, y parámetros ssm_alpha y ssm_beta. La model card menciona además un componente PLE de 51,2B de parámetros, cuyo papel exacto en el cómputo no se detalla en la información disponible. El modelo base Qwen3.8-Flash-Next procede de Qwen, y sobre él se ha aplicado una variante uncensored publicada por orcarouter, de la que no se documentan los detalles del proceso de entrenamiento ni de alineación.

El proceso de cuantización sí está descrito con precisión. La variante STRIX_LEAN asigna más bits que la variante FAST: embeddings de tokens y PLE en Q5, y la mitad de la atención en mayor precisión. Sobre esa receta se aplica una importance matrix calibrada con el corpus calibration_datav3 de bartowski, calculada sobre el propio modelo en 4 bits porque un forward en BF16 excede el límite de 128 GB de GTT del Strix Halo. La versión más reciente del repositorio (25 de octubre de 2026) incorpora además un splice de tensores desde el fichero Unsloth UD-Q4_K_XL: 194 tensores hc_attn/hc_ffn down y up en Q8_0, y los tensores hc de inyección junto con ssm_alpha y ssm_beta en F32. El resultado son 266 tensores de tipo 101, 60 de tipo 100, 194 en Q8_0 y 252 en F32.

## Capacidades
- Generación de texto y razonamiento: el ejemplo de despliegue incluye los parámetros `--think on` y `--reasoning-effort low`, lo que indica soporte de modo de razonamiento con esfuerzo configurable.
- Generación de código: medida explícitamente en la model card con seis prompts, hasta 256 tokens cada uno, con una media de 56,8 tok/s.
- Tool calling / function calling: validado con `tool_choice` en modo required (7/7 correctos) y auto (6/7 correctos).
- Decodificación especulativa mediante cabezas MTP (multi-token prediction), con aceptación medida de 0,94 en el tier FAST tras aplicar el parche de grafo.
- Conversación multi-turno con contexto de hasta 32.768 tokens en la configuración de ejemplo.
- Comportamiento sin rechazo (uncensored): se han eliminado los mecanismos de rechazo del modelo base, lo que no añade capacidad sino que retira salvaguardas.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso
- Inferencia local en estaciones de trabajo AMD Strix Halo: el modelo está calibrado y medido específicamente para el Ryzen AI Max+ 395 con 128 GB de memoria unificada, lo que permite ejecutar un modelo de gran tamaño sin GPU dedicada. Es el escenario principal para el que se publica este artefacto.
- Asistentes de código en local: con 56,8 tok/s de media en generación de código y soporte de tool calling, resulta viable para autocompletado, revisión de parches y generación de tests en un entorno de desarrollo sin conexión a servicios en la nube.
- Automatización de agentes con llamadas a herramientas: la tasa de acierto en tool calling (7/7 en modo required) permite integrarlo en flujos de agentes que consulten APIs, ejecuten comandos o consulten bases de datos, siempre con validación externa de las acciones.
- Procesamiento de documentos largos: con 32.768 tokens de contexto puede resumir informes, extraer entidades de contratos o responder preguntas sobre documentación técnica extensa en una sola pasada.
- Investigación sobre cuantización y decodificación especulativa: el repositorio documenta perplejidad, aceptación de borradores MTP y comparativas entre tiers, lo que lo convierte en un banco de pruebas para estudiar el impacto de imatrix y de los tipos ROCmFP4 en la calidad.
- Despliegue de un servidor de inferencia privado: mediante `llama-server` del fork ROCmFPX o la herramienta Super ROC, se puede exponer una API compatible con OpenAI en una máquina local para uso interno, sin enviar datos a terceros.
- Evaluación de modelos sin alineación en entornos controlados: para investigadores que necesiten estudiar el comportamiento de un modelo sin rechazo, en un contexto aislado y con revisión humana de las salidas.

## Benchmarks y rendimiento
| Medicion | Resultado |
|---|---|
| Perplejidad WikiText-2 raw, contexto 512, STRIX_LEAN imatrix | 4,9865 ± 0,031 |
| Perplejidad WikiText-2 raw, contexto 512, FAST imatrix | 5,0337 ± 0,031 |
| Perplejidad WikiText-2 raw, contexto 512, FAST sin imatrix | 5,3465 ± 0,034 |
| Perplejidad corpus de texto largo de 6K tokens, contexto 4096, shards nuevos | 5,97374 |
| Perplejidad corpus de texto largo de 6K tokens, contexto 4096, STRIX_LEAN imatrix previo | 6,18385 |
| Procesamiento de prompt, 1594 tokens | 1261,2 tok/s |
| Generación tras ese prompt, hasta 256 tokens | 56,1 tok/s |
| Generación de código, 6 prompts, media (rango) | 56,8 tok/s (53,8-60,2) |
| Tokens borrador aceptados en esos prompts | 1031/1342 |
| Tool calls correctos, required / auto | 7/7 / 6/7 |
| Aceptación de decodificación especulativa MTP, tier FAST, contexto 2048, cabeza Q8_0 | 0,94 (+27,7% tok/s) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las mediciones anteriores corresponden a perplejidad, velocidad y tool calling, no a evaluaciones de capacidad.

## Requisitos de hardware
- VRAM / memoria: el repositorio ocupa 212,8 GB en disco, pero los shards se ejecutan sobre 128 GB de memoria unificada en el sistema de referencia (Ryzen AI Max+ 395 con 128 GB de GTT). No se especifica el consumo exacto de memoria en inferencia.
- GPU recomendadas: AMD Radeon 8060S integrada en el Ryzen AI Max+ 395 (gfx1151). El fork está compilado con `-DGPU_TARGETS=gfx1151`, por lo que otros targets requieren recompilación.
- GPU de consumo: no se documenta compatibilidad con GPUs NVIDIA ni con Radeon discretas. El artefacto está diseñado para memoria unificada de gran capacidad, no para VRAM dedicada convencional.
- Opciones de despliegue: exclusivamente el fork ROCmFPX de llama.cpp (rama main), compilado con `-DGGML_HIP=ON`; llama.cpp estándar no carga el fichero. Se requiere aplicar el parche `qwen4exp-qsa-checkpoint-fix.patch` y, para decodificación especulativa, `qwen4exp-mtp-graph-fork.patch`. También se documenta la herramienta Super ROC (`superroc serve`) como envoltorio de servidor.
- Latencia y throughput: 1261,2 tok/s de procesamiento de prompt y 56,1 tok/s de generación en el sistema de referencia con una petición simultánea, temperatura 0 y caché de prompt fría. La decodificación especulativa con MTP eleva el throughput un 27,7% en el tier FAST.
- Cabeza MTP: se requiere un fichero adicional del repositorio kingjones777/Qwen3.8-Flash-Next-MTP-Heads-GGUF, en cuantización Q8_0 para el ejemplo medido.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Perplejidad (WikiText-2, c 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (STRIX_LEAN imatrix) | 448.931.056 según safetensors del base; PLE de 51,2B mencionado | 32.768 en el ejemplo | 4,9865 | qwen-community-1.0 | GGUF en 3 shards, 807 descargas |
| Qwen3.8-Flash-Next-Uncensored ROCmFP4 FAST imatrix | mismo modelo base | no disponible | 5,0337 | qwen-community-1.0 | GGUF, repositorio separado |
| Qwen3.8-Flash-Next-Uncensored ROCmFP4 FAST sin imatrix | mismo modelo base | no disponible | 5,3465 | qwen-community-1.0 | GGUF, repositorio separado |
| Qwen/Qwen3.8-Flash-Next (base sin cuantizar) | no disponible | no disponible | no disponible | qwen-community-1.0 | pesos originales en Hugging Face |

La comparación con modelos de otras familias no está disponible en la información proporcionada. Las únicas alternativas documentadas son las otras variantes de cuantización del mismo modelo base.

## Limitaciones y advertencias
- Artefacto de investigación sin salvaguardas: se han eliminado los mecanismos de rechazo del modelo base. Esto no incrementa la capacidad del modelo, sino que retira las protecciones, por lo que las salidas pueden contener contenido inapropiado y requieren supervisión humana.
- Compatibilidad restringida: no funciona con llama.cpp estándar. Requiere el fork ROCmFPX, compilación específica para gfx1151 y la aplicación de parches. Cualquier actualización del fork puede romper la compatibilidad.
- Licencia qwen-community-1.0: impone condiciones específicas para uso comercial que deben revisarse antes de desplegar el modelo en producción. Los metadatos la declaran como "other", lo que añade ambigüedad.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe ni sobre el rendimiento en castellano.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinación. La perplejidad baja no garantiza corrección factual.
- Contexto efectivo limitado en la práctica: aunque el ejemplo usa 32.768 tokens, la calibración de imatrix se hizo con contextos de 4096 y 512, y las mediciones de decodificación especulativa con 2048. El rendimiento más allá de esos rangos no está verificado.
- Dependencia de la cabeza MTP: la decodificación especulativa requiere un fichero adicional y un parche de grafo; sin ellos, la aceptación cae a aproximadamente 0,36 según la model card.
- Trazabilidad de la cuantización: el autor reconoce que no puede publicar una comparación limpia entre STRIX_LEAN con y sin imatrix porque los pesos BF16 de origen se reclamaron tras la compilación. El efecto aislado de imatrix se estima a partir del tier FAST (−5,9%).
- Ausencia de benchmarks de capacidad: no hay datos de MMLU, HumanEval ni GSM8K, por lo que la calidad en tareas específicas no puede evaluarse a partir de la información disponible.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-STRIX_LEAN-imatrix-GGUF
- Fork ROCmFPX (kingjones30): https://github.com/kingjones30/ROCmFPX
- Fork ROCmFPX original (charlie12345): https://github.com/charlie12345/ROCmFPX
- Herramienta Super ROC: https://github.com/kingjones30/superroc
- Cabezas MTP: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-MTP-Heads-GGUF
- Variante FAST sin imatrix: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-FAST-GGUF
- Variante FAST imatrix: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-FAST-imatrix-GGUF
- Corpus de calibración de bartowski: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante uncensored de orcarouter: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored

# smskk/qqqqqkkk

## Resumen

El modelo `smskk/qqqqqkkk` es una versión cuantizada en formato GGUF del modelo Qwen/Qwen3.8-27B, modificada para reducir sustancialmente el comportamiento de rechazo (uncensored). El autor, smskk, ha aplicado una técnica de abliteration mediante la herramienta Heretic, que elimina direcciones de rechazo en los pesos del modelo sin recurrir a fine-tuning ni a datos adicionales de entrenamiento. El resultado es un modelo de 27.320 millones de parámetros con una ventana de contexto de 262.144 tokens y soporte de visión, publicado en múltiples niveles de cuantización (desde IQ2_M hasta Q8_0).

La relevancia de este modelo radica en dos aspectos: por un lado, ofrece una alternativa sin censura para casos de uso donde los filtros de seguridad del modelo base resultan restrictivos; por otro, conserva el head de multi-token prediction (MTP) verificado, lo que permite utilizar decodificación especulativa en entornos de inferencia con llama.cpp. El autor ha publicado tanto archivos fusionados (con MTP integrado) como versiones separadas de target y draft, además de una matriz de importancia (imatrix) calculada directamente desde el modelo f16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | ingles, chino |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, que emplea una arquitectura transformer con 64 capas y un vocabulario de 248.320 tokens. La modificación principal consiste en la eliminación de direcciones de rechazo mediante abliteration con Heretic, una herramienta que co-minimiza el recuento de rechazos frente a la divergencia KL respecto al modelo original. El proceso se ejecuta en precisión bf16 (sin cuantización intermedia) y el LoRA resultante se fusiona en los pesos bf16, de modo que los pesos publicados no provienen de un redondeo cuantizado.

El head de multi-token prediction (MTP) se copia literalmente del checkpoint base después de la fusión, ya que la abliteration solo modifica `attn.o_proj` y `mlp.down_proj` de la pila principal. El modelo incluye una capa MTP y soporte de visión. La matriz de importancia (imatrix) se calcula directamente desde el modelo f16, no desde una cuantización intermedia, lo que garantiza que la calibración vea los pesos reales. El draft head se mantiene en Q8_0 en todas las configuraciones, ya que cuantizarlo más agresivamente reduciría la tasa de aceptación sin apenas ahorro de disco.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen3.8-27B.
- Soporte de vision (el modelo base incluye torre de vision, segun la tabla de especificaciones).
- Decodificacion especulativa mediante el head MTP integrado o como archivo draft separado.
- Comportamiento "uncensored": el rechazo se reduce sustancialmente, aunque no se elimina por completo.
- Capacidades multilingues en ingles y chino.
- Compatible con el ecosistema llama.cpp (llama-perplexity, llama-cli, servidores compatibles con endpoints).

## Casos de uso

- Investigacion en alineacion y seguridad de modelos: permite estudiar como se comporta un modelo de 27 B sin filtros de rechazo, comparando respuestas con el modelo base para analizar el impacto de la abliteration.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o dialogos donde los filtros de seguridad del modelo base bloquearian contenido adulto o controvertido.
- Asistentes conversacionales con contexto largo: gracias a los 262.144 tokens de ventana, puede mantener conversaciones multi-turno muy extensas sin perder el hilo, por ejemplo en atencion al cliente o tutoria.
- Despliegue en entornos con recursos limitados: las cuantizaciones IQ2_M (10,6 GB) e IQ4_XS (15,3 GB) permiten ejecutar el modelo en GPUs de consumo con 16 GB de VRAM o menos.
- Inferencia de alto rendimiento con decodificacion especulativa: el head MTP integrado o el archivo draft separado permiten acelerar la generacion en servidores con llama.cpp, manteniendo la calidad al verificar cada token contra el modelo objetivo.
- Aplicaciones de vision por computador con texto: al conservar la torre de vision del modelo base, puede procesar imagenes y generar descripciones o responder preguntas sobre ellas, siempre que el runtime soporte el formato GGUF de vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor proporciona unicamente mediciones de perplexity sobre wikitext-2, que se resumen a continuacion:

| Archivo | PPL (wikitext-2) | vs f16 |
|---|---|---|
| f16 (baseline, no publicado) | 7,1557 +/- 0,25104 | - |
| Q5_K_M | 7,1573 +/- 0,25055 | +0,0016 |
| IQ4_XS | 7,1583 +/- 0,25019 | +0,0026 |
| Q6_K | 7,1689 +/- 0,25149 | +0,0132 |
| Q8_0 | 7,1764 +/- 0,25195 | +0,0207 |
| Q4_K_M | 7,1814 +/- 0,25227 | +0,0257 |
| IQ2_M | 7,8581 +/- 0,27481 | +0,7024 |

El autor advierte que todas las filas excepto IQ2_M se encuentran dentro de un intervalo de 0,026 con un error estandar de aproximadamente 0,25, por lo que no son estadisticamente separables entre si ni del f16. La unica diferencia que la medicion resuelve es la de IQ2_M, que se situa unas 2,8 desviaciones estandar por encima del baseline. Las versiones `noMTP` miden identicamente a sus equivalentes fusionadas, lo que confirma que el bloque MTP es inerte durante un forward pass normal.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 10,6 GB (IQ2_M) y 29,0 GB (Q8_0) segun el archivo GGUF elegido.
- GPU recomendadas: para cuantizaciones pequeñas (IQ2_M, IQ4_XS) basta con una RTX 4060 Ti 16 GB o RTX 4070; para Q4_K_M y superiores se recomienda RTX 4090 (24 GB) o GPUs de datacenter como A100 (40/80 GB) o H100.
- En GPU de consumo: cabe en tarjetas con 16 GB de VRAM usando IQ2_M o IQ4_XS; con 24 GB se pueden usar Q5_K_M y Q6_K.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (si se importa el GGUF), y cualquier runtime compatible con GGUF y endpoints de OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la cuantizacion. La decodificacion especulativa con el draft MTP puede mejorar el throughput, pero no se aportan cifras concretas.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos en la informacion proporcionada. Como referencia, el modelo base Qwen3.8-27B compite con otros modelos abiertos de tamano similar (por ejemplo, Llama 3.1 8B o Mistral 7B, aunque con menos parametros), pero no hay datos de benchmarks que permitan una comparacion cuantitativa fiable. La principal diferencia frente a otras versiones "uncensored" es la retencion verificada del head MTP y el uso de imatrix calculada desde f16.

## Limitaciones y advertencias

- El comportamiento de rechazo se ha reducido sustancialmente, pero no eliminado por completo. El autor indica que "refusal behaviour has been substantially reduced, not eliminated".
- El draft head fue entrenado contra el modelo sin modificar, por lo que la tasa de aceptacion de la decodificacion especulativa puede caer ligeramente. La verificacion de cada token contra el modelo objetivo garantiza que la calidad de salida no se vea afectada.
- La perplexity solo detecta dano grosero de cuantizacion; no mide razonamiento, codigo, capacidad multilingue ni comportamiento de rechazo. Un valor de PPL bajo no garantiza un buen rendimiento en tareas reales.
- No se han publicado benchmarks estandar (MMLU, HumanEval, GSM8K), por lo que el rendimiento en tareas especificas es desconocido.
- La licencia apache-2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener sus propias restricciones; es recomendable revisar la licencia del modelo base antes de desplegar en produccion.
- El modelo puede generar contenido ofensivo, ilegal o perjudicial al carecer de los filtros de seguridad del modelo original. No es adecuado para aplicaciones orientadas al publico general sin una capa de moderacion adicional.
- La arquitectura declarada como `Qwen3_5ForConditionalGeneration` sugiere que el modelo base puede ser una variante condicional (posiblemente con componentes de vision), pero no se detallan las capacidades exactas de vision en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/smskk/qqqqqkkk
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Dataset wikitext (usado para imatrix y perplexity): https://huggingface.co/datasets/Salesforce/wikitext

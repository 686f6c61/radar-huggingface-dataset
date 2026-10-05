# Qui-Linta13/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una publicación de cuantizaciones GGUF del modelo Qwen/Qwen3.8-27B, elaborada por el usuario Qui-Linta13. No se trata de un modelo nuevo entrenado desde cero, sino de un proceso de "abliteración" (eliminación de direcciones de rechazo en el espacio de activaciones) aplicado sobre los pesos en bf16 del modelo base, seguido de una conversión y cuantización con llama.cpp. El resultado conserva la arquitectura, los datos de entrenamiento y las capacidades del original, pero reduce de forma sustancial el comportamiento de rechazo ante peticiones que el modelo base declinaría.

El modelo base es un transformer de 27.320.697.856 parámetros (unos 27,3 mil millones), con 64 capas, vocabulario de 248.320 tokens y una ventana de contexto de 262.144 tokens. Incorpora una capa de predicción multi-token (MTP) que actúa como cabecera draft para decodificación especulativa, así como una torre de visión que se distribuye por separado mediante un proyector `mmproj` en F16. La arquitectura declarada es `Qwen3_5ForConditionalGeneration`.

Su relevancia práctica es doble. Por un lado, ofrece un modelo de 27B multimodal y de contexto muy largo en formato GGUF con seis niveles de cuantización (desde IQ2_M de 10,6 GB hasta Q8_0 de 29,0 GB), lo que permite desplegarlo en GPUs de consumo. Por otro, mantiene la cabecera MTP verificada, de modo que la decodificación especulativa funciona sin necesidad de un modelo draft externo. La licencia es Apache 2.0 y los idiomas declarados son inglés y chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer, 64 capas, con 1 capa MTP y torre de visión) |
| Parámetros totales | 27.320.697.856 (~27,3 B) |
| Parámetros activos | No aplica (no es un modelo MoE); no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0; draft en Q4_0 y Q8_0; proyector de visión en F16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Vocabulario | 248.320 tokens |
| Capas MTP | 1 |
| Visión | Sí (proyector `mmproj` F16, 0,9 GB) |
| Herramienta de conversión | llama.cpp `a94d563ed` |
| Matriz de importancia | wikitext-2 raw, 200 chunks (`Qwen3.8-27B-Uncensored-imatrix.dat`, 13,6 MB) |
| Tamaño total del repositorio | 231,3 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin modificaciones estructurales: 64 capas, vocabulario de 248.320 tokens, ventana de 262.144 tokens, una capa MTP y soporte de entrada de imagen. Lo que cambia es el procedimiento de edición de pesos. La eliminación del comportamiento de rechazo se realizó con la herramienta Heretic, que co-minimiza el recuento de rechazos frente a la divergencia KL respecto al modelo base. No hubo código de eliminación escrito a mano, ni fine-tuning, ni datos de entrenamiento adicionales: el proceso es de tipo abliteración sobre pesos en bf16 (sin cuantización de 4 bits), y el LoRA resultante se fusionó en el modelo base en bf16, de modo que los pesos publicados no son el resultado de un ciclo de ida y vuelta por cuantización.

Los tensores `mtp.*` se copiaron literalmente del checkpoint base después de la fusión, por lo que la abliteración nunca los toca; las modificaciones se aplican a `attn.o_proj` y `mlp.down_proj` en la pila principal. Como consecuencia, la cabecera draft fue entrenada contra el modelo sin modificar y su tasa de aceptación puede caer ligeramente, aunque la decodificación especulativa verifica cada token contra el modelo objetivo, así que la calidad de la salida no se ve afectada. La matriz de importancia se calculó directamente desde los pesos f16, no desde una cuantización intermedia.

Se distribuyen tres familias de ficheros: cuantizaciones fusionadas (con MTP embebido como draft interno), pares target+draft para runtimes que requieren `--model-draft` explícito, y el proyector de visión. La model card incluye secciones de "Measured behaviour", "Requirements", "Limitations" y resultados de decodificación especulativa para IQ2_M que aparecen truncadas en la información disponible, por lo que no se recogen aquí.

## Capacidades

- Generación de texto conversacional en inglés y chino, con la misma base de capacidades que Qwen3.8-27B (la model card indica explícitamente que las capacidades no cambian).
- Procesamiento de contexto largo: hasta 262.144 tokens de ventana, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Entrada multimodal de imagen mediante el proyector `mmproj-Qwen3.8-27B-Uncensored-F16.gguf`, que usa el prefijo estándar `mmproj` para descubrimiento automático por runtimes compatibles.
- Decodificación especulativa nativa mediante la cabecera MTP de 1 capa, con ficheros draft en Q8_0 (por defecto, 3,2 GB) y Q4_0 (1,7 GB).
- Ejecución local con llama.cpp y compatibilidad con endpoints (etiqueta `endpoints_compatible`), incluido `llama-server` con el flag `--model-draft`.
- Integración declarada con ComfyUI.
- Comportamiento de rechazo sustancialmente reducido, con la salvedad de que no se elimina por completo y de que los números concretos no están disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no mencionado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la información disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Escritura creativa sin filtros: el modelo está pensado para ficción, narrativa y ejercicios literarios con contenido violento, adulto o controvertido que el modelo base rechazaría. Al conservar la arquitectura y los datos del original, la calidad de prosa en inglés y chino se mantiene, y la ventana de 262.144 tokens permite trabajar con novelas o guiones completos en una sola sesión.
- Investigación en seguridad y alineación: al ser un modelo con direcciones de rechazo atenuadas, es útil como sujeto de estudio en experimentos de red teaming, evaluación de robustez y análisis de cómo se codifican los comportamientos de negativa en modelos de 27B. La existencia de cuantizaciones comparables facilita reproducir resultados entre niveles de precisión.
- Atención al cliente en inglés y chino: con 262.144 tokens de contexto se pueden mantener conversaciones multi-turno con historial largo y documentación de producto adjunta sin truncar. El despliegue con llama.cpp permite servir el modelo en infraestructura propia.
- Procesamiento de documentos largos con OCR o análisis de figuras: la combinación del proyector de visión en F16 con el contexto largo permite extraer información de capturas, gráficos y documentos escaneados, y razonar sobre ellos junto con el texto completo del expediente.
- Análisis de documentación técnica y contratos bilingües: al soportar inglés y chino de forma nativa, encaja en flujos de trabajo con proveedores o clientes sinodófonos donde hay que resumir, comparar o extraer cláusulas de documentos extensos.
- Inferencia local en hardware de consumo: las cuantizaciones IQ2_M (10,6 GB) e IQ4_XS (15,3 GB) permiten ejecutar un modelo de 27B en GPUs de 12 y 16 GB respectivamente, algo inviable con los pesos sin cuantizar.
- Aceleración de servidores de inferencia: con `llama-server --model-draft` y la cabecera MTP en Q8_0 o Q4_0 se puede aumentar el throughput de generación sin sacrificar calidad, ya que cada token propuesto se verifica contra el modelo objetivo.
- Base para pipelines de destilación o ajuste fino: al ser un modelo abliterado de 27B con licencia Apache 2.0, se puede usar como generador de datos sintéticos o como punto de partida para adaptaciones posteriores, teniendo en cuenta las advertencias legales sobre el contenido generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la información disponible. El único dato de rendimiento aportado es la perplejidad sobre wikitext-2, medida en la misma sesión contra la misma referencia f16, por lo que las filas son comparables entre sí.

| Fichero | PPL (wikitext-2) | Diferencia vs f16 |
|---|---|---|
| `Qwen3.8-27B-Uncensored-f16.gguf` (referencia, no distribuida) | 7,1557 ± 0,25104 | — |
| `Qwen3.8-27B-Uncensored-Q5_K_M.gguf` | 7,1573 ± 0,25055 | +0,0016 |
| `Qwen3.8-27B-Uncensored-IQ4_XS.gguf` | 7,1583 ± 0,25019 | +0,0026 |
| `Qwen3.8-27B-Uncensored-Q6_K.gguf` | 7,1689 ± 0,25149 | +0,0132 |
| `Qwen3.8-27B-Uncensored-Q8_0.gguf` | 7,1764 ± 0,25195 | +0,0207 |
| `Qwen3.8-27B-Uncensored-Q4_K_M.gguf` | 7,1814 ± 0,25227 | +0,0257 |
| `Qwen3.8-27B-Uncensored-IQ2_M.gguf` | 7,8581 ± 0,27481 | +0,7024 |

Advertencia del propio autor: todas las filas excepto IQ2_M caen dentro de un margen de 0,026 frente a un error estándar de aproximadamente 0,25, por lo que no son separables entre sí ni respecto a la referencia f16, y su orden relativo es ruido. IQ2_M sí muestra una degradación clara.

## Requisitos de hardware

- Tamaño de los ficheros como referencia mínima de VRAM (los valores de VRAM indicados son estimaciones derivadas del tamaño del fichero más la caché KV; el autor no publica requisitos de VRAM ni el tamaño de la caché KV, que no puede calcularse sin conocer el número de cabezas de atención y la dimensión oculta):
  - IQ2_M: 10,6 GB de fichero; encaja en GPUs de 12 GB con contexto reducido.
  - IQ4_XS: 15,3 GB; encaja en GPUs de 16 GB.
  - Q4_K_M: 16,8 GB; requiere 16 GB o más, con margen limitado para el contexto.
  - Q5_K_M: 19,5 GB y Q6_K: 22,4 GB; encajan en GPUs de 24 GB (RTX 3090, RTX 4090, A10G de 24 GB).
  - Q8_0: 29,0 GB; requiere GPUs de 40 GB (A100 40 GB) o reparto entre dos GPUs de 24 GB.
- A los ficheros anteriores hay que sumar, si se usa decodificación especulativa, el draft (1,7 GB en Q4_0 o 3,2 GB en Q8_0) y, si se usa visión, el proyector `mmproj` en F16 (0,9 GB).
- La variante sin MTP reduce ligeramente el tamaño (por ejemplo, Q4_K_M pasa de 16,8 GB a 16,5 GB), útil cuando el runtime no soporta draft.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), ComfyUI y cualquier runtime compatible con endpoints, según la etiqueta `endpoints_compatible`. El autor distribuye pares target+draft específicamente para entornos que exigen `--model-draft`.
- Latencia y throughput: no disponibles. La model card incluye una sección de decodificación especulativa medida sobre IQ2_M, pero su contenido aparece truncado en la información proporcionada.

## Comparativa con modelos similares

La información disponible no incluye especificaciones de modelos comparables de terceros. La única referencia cuantitativa es el propio modelo base y sus variantes de cuantización, que se comparan en la tabla siguiente.

| Modelo / variante | Parámetros | Contexto | PPL (wikitext-2) | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored Q5_K_M | 27,3 B | 262.144 | 7,1573 | Apache 2.0 | GGUF |
| Qwen3.8-27B-Uncensored IQ4_XS | 27,3 B | 262.144 | 7,1583 | Apache 2.0 | GGUF |
| Qwen3.8-27B-Uncensored Q8_0 | 27,3 B | 262.144 | 7,1764 | Apache 2.0 | GGUF |
| Qwen3.8-27B-Uncensored IQ2_M | 27,3 B | 262.144 | 7,8581 | Apache 2.0 | GGUF |
| Qwen/Qwen3.8-27B (base, referencia) | 27,3 B | 262.144 | no disponible | Apache 2.0 | safetensors / GGUF |

Comparativa con alternativas de otros autores (por ejemplo, otros modelos de ~27B con soporte multimodal y contexto largo): no disponible en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que el comportamiento de rechazo se ha reducido de forma sustancial, pero no se ha eliminado. Los números concretos de esta medición están en una sección truncada en la información disponible.
- Al tratarse de un modelo deliberadamente abliterado, puede generar contenido dañino, ilegal o desinformación. No es apto para despliegues orientados al público sin filtros externos.
- Riesgo de alucinación: no hay datos específicos publicados en la información disponible; se hereda el comportamiento del modelo base.
- Idiomas limitados a inglés y chino. No hay soporte declarado de castellano ni de otras lenguas.
- La cabecera draft fue entrenada contra el modelo sin modificar, por lo que su tasa de aceptación puede ser algo menor tras la abliteración. La calidad de la salida no se ve afectada porque cada token se verifica contra el modelo objetivo.
- La cuantización IQ2_M presenta una degradación clara de perplejidad (+0,7024 frente a f16). Las diferencias entre Q4_K_M, Q5_K_M, Q6_K, Q8_0 e IQ4_XS están dentro del margen de error y no deben interpretarse como un orden de calidad.
- Las capacidades de vision requieren un runtime compatible con `mmproj`; no todos los entornos de inferencia lo soportan.
- Licencia Apache 2.0, que en principio permite uso comercial y modificaciones, pero conviene verificar los términos del modelo base Qwen/Qwen3.8-27B y las obligaciones derivadas del uso de contenido generado.
- El repositorio completo ocupa 231,3 GB, por lo que la descarga selectiva de cuantizaciones concretas es recomendable.
- La model card original contiene secciones de comportamiento medido, requisitos y limitaciones que aparecen truncadas en la información disponible; se recomienda consultar el repositorio antes de un despliegue en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Qui-Linta13/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de abliteración Heretic: https://github.com/p-e-w/heretic
- llama.cpp: no se proporciona enlace en la información disponible (el commit de conversión citado es `a94d563ed`)
- Resultados de la búsqueda web: no se ha encontrado ningún resultado relevante. Las únicas entradas devueltas son definiciones del pronombre francés «qui» en diccionarios (Larousse, Le Robert, Wiktionnaire, La langue française, Académie française), sin relación con el modelo ni con su autor.

# pangdegui/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una cuantización en formato GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario pangdegui. Se trata de una versión "abliterated" (sin direcciones de rechazo) del modelo base de Qwen, distribuida con el cabezal de predicción multi-token (MTP) conservado y verificado, junto con el proyector de visión y la matriz de importancia (imatrix) empleada para la cuantización. El objetivo es ofrecer una variante del modelo con comportamiento de rechazo sustancialmente reducido, manteniendo intactas arquitectura, datos de entrenamiento y capacidades del original.

El modelo base es un transformer denso de 27.320.697.856 parámetros (27,3 mil millones), con 64 capas, vocabulario de 248.320 tokens, una capa MTP y soporte de visión. La longitud de contexto declarada es de 262.144 tokens. La relevancia actual reside en que combina tres elementos poco habituales en un mismo paquete GGUF: cuantizaciones de baja precisión (hasta IQ2_M de 10,6 GB), decodificación especulativa integrada mediante el cabezal MTP y soporte multimodal, todo bajo licencia Apache 2.0.

El autor documenta de forma explícita el método de abliteración (Heretic, con minimización conjunta de rechazos y divergencia KL respecto al modelo base), las perplexidades medidas por cuantización sobre wikitext-2 y los requisitos de hardware. El repositorio ocupa 231,3 GB e incluye variantes con y sin MTP, borradores de decodificación especulativa en Q8_0 y Q4_0, y el proyector de visión en F16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer denso con 1 capa MTP y torre de visión) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (más borradores Q8_0 y Q4_0, y proyector de visión F16) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), más `imatrix.dat` |
| Capas | 64 |
| Vocabulario | 248.320 tokens |
| Capas MTP | 1 |
| Vision | sí (`mmproj-Qwen3.8-27B-Uncensored-F16.gguf`, 0,9 GB) |
| Herramienta de conversion | llama.cpp `a94d563ed` |
| Imatrix | wikitext-2 raw, 200 chunks (publicada) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 64 capas y 27,3 mil millones de parámetros, con un vocabulario de 248.320 tokens y una única capa de predicción multi-token (MTP) que actúa como cabezal borrador para decodificación especulativa. Incluye además una torre de visión que se distribuye como proyector `mmproj` independiente en F16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la información proporcionada.

La modificación respecto al original consiste en una abliteración ejecutada con la herramienta Heretic, que elimina direcciones de rechazo minimizando simultáneamente el recuento de rechazos y la divergencia KL respecto al modelo base. El proceso se realiza en bf16 (sin cuantización de 4 bits) y el LoRA resultante se fusiona en el checkpoint bf16, de modo que los pesos publicados no son un viaje de ida y vuelta por cuantización. La abliteración modifica `attn.o_proj` y `mlp.down_proj` de la pila principal; los tensores `mtp.*` se copian literalmente del checkpoint base y no se tocan. La matriz de importancia se calcula directamente desde f16, no desde una cuantización intermedia.

## Capacidades

- Generación de texto conversacional y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Procesamiento de imágenes mediante el proyector de visión F16 y runtimes compatibles (capacidad multimodal del modelo base).
- Decodificación especulativa integrada mediante el cabezal MTP, con verificación de cada token contra el modelo objetivo.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Comportamiento de rechazo sustancialmente reducido (no eliminado), orientado a usos donde las negativas del modelo base resultan un obstáculo.
- Soporte de cuantizaciones de muy baja precisión (IQ2_M) para entornos con VRAM limitada.

## Casos de uso

- Investigación sobre alineación y abliteración: el paquete permite comparar directamente el modelo base con la variante sin direcciones de rechazo, ya que se publican perplexidades por cuantización y el método completo (Heretic, bf16, fusión de LoRA).
- Despliegue en hardware de consumo: la cuantización IQ2_M (10,6 GB) permite ejecutar un modelo de 27,3 B en GPUs con 12-16 GB de VRAM mediante llama.cpp, con una pérdida de perplexidad documentada de +0,7024 frente a f16.
- Servicio de inferencia con decodificación especulativa: el uso del cabezal MTP como borrador integrado o como `--model-draft` en llama-server acelera la generación manteniendo la verificación contra el modelo objetivo.
- Procesamiento de documentos largos: con 262.144 tokens de contexto, el modelo puede ingerir contratos, informes o bases de código extensas en una sola pasada, siempre que la VRAM lo permita.
- Aplicaciones multimodales: el proyector `mmproj` en F16 habilita entrada de imágenes para tareas de descripción, extracción de información o respuesta a preguntas sobre capturas y diagramas.
- Generación de contenido creativo sin restricciones de rechazo: escritura de ficción, guiones o material editorial donde las negativas del modelo alineado interrumpen el flujo, asumiendo la responsabilidad de moderación por parte del operador.
- Experimentación con cuantizaciones de baja precisión: la imatrix publicada y las instrucciones para construir otras cuantizaciones permiten reproducir y extender el trabajo a otros niveles de bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica perplexidades medidas sobre wikitext-2 para cada cuantización, comparadas contra una línea base f16 no distribuida:

| Archivo | PPL (wikitext-2) | Diferencia vs f16 |
|---|---|---|
| `Qwen3.8-27B-Uncensored-f16.gguf` (base, no distribuido) | 7,1557 ± 0,25104 | — |
| `Qwen3.8-27B-Uncensored-Q5_K_M.gguf` | 7,1573 ± 0,25055 | +0,0016 |
| `Qwen3.8-27B-Uncensored-IQ4_XS.gguf` | 7,1583 ± 0,25019 | +0,0026 |
| `Qwen3.8-27B-Uncensored-Q6_K.gguf` | 7,1689 ± 0,25149 | +0,0132 |
| `Qwen3.8-27B-Uncensored-Q8_0.gguf` | 7,1764 ± 0,25195 | +0,0207 |
| `Qwen3.8-27B-Uncensored-Q4_K_M.gguf` | 7,1814 ± 0,25227 | +0,0257 |
| `Qwen3.8-27B-Uncensored-IQ2_M.gguf` | 7,8581 ± 0,27481 | +0,7024 |

El propio autor advierte que, salvo IQ2_M, todas las filas caen dentro de un margen de 0,026 frente a un error estándar de aproximadamente 0,25, por lo que no son separables entre sí ni del f16 y su ordenación es ruido estadístico.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos): IQ2_M 10,6 GB; IQ4_XS 15,3 GB; Q4_K_M 16,8 GB; Q5_K_M 19,5 GB; Q6_K 22,4 GB; Q8_0 29,0 GB. Añadir el borrador (Q8_0 3,2 GB o Q4_0 1,7 GB) si se usa decodificación especulativa explícita, y 0,9 GB para el proyector de visión.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño de pesos, Q8_0 requiere GPUs de 32 GB o más (A100 40 GB, H100, RTX 5090), mientras que IQ2_M y Q4_K_M caben en GPUs de consumo de 16-24 GB (RTX 4080, RTX 4090, RTX 3090).
- Cabe en GPU de consumo: sí, al menos las cuantizaciones IQ2_M, IQ4_XS y Q4_K_M en tarjetas de 16-24 GB, y Q5_K_M/Q6_K en tarjetas de 24 GB con margen ajustado.
- Opciones de despliegue: llama.cpp y llama-server (con `--model-draft` para el cabezal MTP), ComfyUI (sección documentada en la model card) y runtimes compatibles con endpoints.
- Latencia y throughput: no disponibles de forma numérica. El autor incluye una sección de decodificación especulativa medida sobre este modelo (IQ2_M) pero los valores concretos no figuran en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-GGUF (este) | 27,3 B | 262.144 | Apache 2.0 | GGUF en HF | Abliterated, MTP y visión incluidos |
| Qwen/Qwen3.8-27B (base) | 27,3 B | 262.144 | Apache 2.0 | Pesos originales en HF | Sin abliterar; referencia de comportamiento alineado |
| Otras variantes GGUF del mismo base | 27,3 B | 262.144 | Apache 2.0 | GGUF en HF | No se dispone de datos concretos en la información proporcionada |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la información proporcionada |

## Limitaciones y advertencias

- El comportamiento de rechazo está "sustancialmente reducido, no eliminado"; el autor remite a la sección de comportamiento medido para las cifras, que no se detallan en la información disponible.
- La abliteración puede degradar la calidad en dominios sensibles; el autor no publica evaluaciones de capacidad más allá de la perplexidad.
- La tasa de aceptación del cabezal borrador puede caer ligeramente porque se entrenó contra el modelo sin modificar; la verificación token a token garantiza que la calidad de salida no se vea afectada por ello.
- La ordenación de perplexidades entre cuantizaciones (salvo IQ2_M) no es estadísticamente significativa; no debe usarse para elegir entre Q4_K_M, Q5_K_M, Q6_K, Q8_0 o IQ4_XS.
- IQ2_M presenta un aumento de perplexidad de +0,7024 frente a f16, con degradación de calidad esperable.
- Idiomas soportados limitados a inglés y chino; no se declara soporte de castellano.
- Licencia Apache 2.0 permite uso comercial, pero el operador asume la responsabilidad sobre el contenido generado por un modelo sin rechazos.
- El repositorio es reciente (creado y actualizado el 2026-11-17) y no registra descargas ni likes, por lo que carece de validación comunitaria.
- No se han publicado benchmarks estándar que permitan verificar el rendimiento en tareas downstream.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pangdegui/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp

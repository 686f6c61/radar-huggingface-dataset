# feverdoingwork/Qwen3.8-Flash-Next-iq3_xxs_turbo_mini-abliterated-Starlight

## Resumen

Qwen3.8-Flash-Next-iq3_xxs_turbo_mini-abliterated-Starlight es una cuantización GGUF de un modelo de lenguaje de tipo mixture-of-experts (MoE) derivada de Qwen/Qwen3.8-Flash-Next, publicada por el usuario feverdoingwork. El modelo base emplea 48 capas con 512 expertos por capa, de los cuales se activan 10 por token, y combina 36 capas de atención lineal (state-space) con 12 capas de atención completa. El checkpoint contiene 179.023.047.808 parámetros totales según los datos de safetensors, aunque el fichero publicado es un contenedor GGUF optimizado para el motor de inferencia Starlight.

La receta de cuantización `iq3_xxs_turbo_mini` reduce el tamaño del fichero a 50,03 GiB (53.714.932.416 bytes) mediante expertos enrutados codificados con trellis a 2 bits (29,88 GiB) y una tabla de tokens por capa recomprimida (15,65 GiB frente a los 20,30 GiB de la variante `iq3_xxs_turbo`). El vocabulario está podado a 141.312 tokens y el fichero incluye la cabeza de borrador para predicción multi-token (MTP) y un tensor de abliteración de 10 KB (`starlight.ablate_r`) que el motor elimina en tiempo de ejecución la dirección de rechazo.

La relevancia de esta ficha radica en que se trata de un artefacto muy específico: solo funciona con el motor Starlight, no con llama.cpp, Ollama, LM Studio ni Transformers, y ha sido validado únicamente en una GPU AMD RX 9070 XT de 16 GB. No es un modelo para uso general, sino una variante experimental orientada a investigación sobre abliteración y cuantización extrema en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: 48 capas, 512 expertos por capa (10 activos por token), 36 capas de atención lineal (state-space) y 12 capas de atención completa |
| Parametros totales | 179.023.047.808 |
| Parametros activos | No disponible (el modelo base activa 10 de 512 expertos por token; no se especifica el cómputo activo total) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | iq3_xxs_turbo_mini (expertos enrutados a 2 bits trellis-coded, tabla de tokens por capa TQ2_T y TQP6, caché de atención q4 mencionada en las pruebas) |
| Idiomas soportados | No disponible |
| Licencia | Qwen Community License 1.0 (etiquetada como `license: other` en Hugging Face) |
| Formato de pesos | GGUF con extensiones Starlight (`.starlight.gguf`); no compatible con safetensors ni Transformers |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer MoE con 48 capas que intercala 36 capas de atención lineal (descritas en la model card como "state-space output") con 12 capas de atención completa. Cada capa contiene 512 expertos enrutados de los que se activan 10 por token, lo que da lugar a los 179.023.047.808 parámetros totales del checkpoint. La model card no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron fases de RLHF o DPO; esa información no está disponible en la documentación proporcionada.

La innovación técnica principal de esta variante es la receta de cuantización: los expertos enrutados se codifican con trellis a 2 bits (2,12 bits por peso), lo que reduce su huella de 39,98 GiB a 29,88 GiB, y la tabla de tokens por capa se recomprime con los códigos TQ2_T y TQP6, pasando de 20,30 GiB a 15,65 GiB. El fichero incorpora además una cabeza de borrador para predicción multi-token (MTP), con una tasa de aceptación del borrador medida del 78,1 % en la variante abliterada. La abliteración se implementa mediante un único tensor F32 de 2.560 números (`starlight.ablate_r`) que el motor Starlight aplica en tiempo de ejecución sobre las 144 matrices que escriben en el flujo residual (proyecciones down de expertos y expertos compartidos de las 48 capas principales, salida state-space de las 36 capas lineales y salida de atención de las 12 capas completas). Ningún peso del fichero difiere del fichero plano original.

## Capacidades

- Generación de texto conversacional y continuaciones de prosa, con una divergencia KL media de 0,0084 respecto al fichero plano en un texto de prueba de 7,6k tokens.
- Predicción multi-token (MTP) integrada mediante cabeza de borrador, con una tasa de aceptación del 78,1 % medida en la RX 9070 XT.
- Razonamiento aritmético, lógica, seguimiento de instrucciones, búsqueda de valores plantados, código y recuerdo literal de texto y hechos cortos, evaluados en una batería de 218 generaciones con 175 aciertos frente a 176 del fichero plano.
- Abliteración en tiempo de ejecución: en la prueba de rechazo, 20 de 20 generaciones respondieron frente a 9 de 20 del fichero plano.
- Capacidad multilingüe: no disponible en la información proporcionada.
- Soporte de tool calling, function calling, agentes y modos de pensamiento: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre abliteración: el modelo permite comparar el comportamiento del mismo conjunto de pesos con y sin la dirección de rechazo eliminada, ya que el tensor `starlight.ablate_r` se aplica en tiempo de ejecución y los pesos son idénticos byte a byte al fichero plano. Es adecuado para estudiar el efecto de la abliteración sobre la capacidad y el estilo de forma controlada.
- Evaluación de cuantización extrema en MoE: con expertos a 2,12 bits por peso y una tabla de tokens recomprimida, sirve para medir la degradación de calidad frente a BF16 y frente a recetas menos agresivas (`iq3_s_turbo`, `iq3_xxs_turbo`), usando la divergencia KL y la pérdida emparejada como métricas.
- Despliegue en GPU de consumo de 16 GB: el fichero de 50,03 GiB está diseñado para ejecutarse en una tarjeta de 16 GB (validado en AMD RX 9070 XT), lo que permite probar un MoE de 179.000 millones de parámetros en hardware de gama alta para consumidores.
- Pruebas de motores de inferencia Starlight: al ser un artefacto específico del motor, resulta útil para validar la implementación de MTP, la caché de atención q4 y la proyección de abliteración en el código del motor.
- Comparación de rendimiento AMD frente a NVIDIA: la model card indica que el motor NVIDIA tiene la misma proyección en su código fuente, pero este fichero no se ha ejecutado en tarjeta NVIDIA, por lo que sirve como caso de prueba pendiente de validación cruzada.
- Reproducibilidad de mediciones: las pruebas documentadas (prueba de rechazo, batería calificada, KL, pérdida emparejada, velocidad de decodificación y aceptación MTP) permiten replicar el protocolo con las mismas semillas y prompts en la misma compilación del motor.

## Benchmarks y rendimiento

| Prueba | Fichero plano | Este fichero (abliterado) |
|---|---:|---:|
| Prueba de rechazo, prompts respondidos (20 generaciones) | 9 de 20 | 20 de 20 |
| Batería calificada (218 generaciones), respuestas correctas | 176 | 175 |
| Prompts abiertos greedy (20), mismo texto que el plano | — | 1 de 20 (divergencia a los 94 caracteres de mediana) |
| Divergencia KL media al fichero plano (texto de 7,6k tokens) | — | 0,0084 |
| Mismo token top que el fichero plano | — | 98,59 % |
| Pérdida frente al plano en texto de prosa de 32k tokens, emparejada | — | −0,0072 ± 0,0021 nats por token |
| Velocidad de decodificación, mediana de tokens por segundo reportada por el servidor | 118,8 | 122,7 |
| Aceptación del borrador MTP | 76,7 % | 78,1 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero ocupa 50,03 GiB en disco y está pensado para ejecutarse en una tarjeta de 16 GB; la model card no detalla el reparto exacto entre VRAM y memoria del sistema ni la VRAM pico medida.
- GPU recomendadas: AMD RX 9070 XT (16 GB), única tarjeta en la que se ha validado este fichero. El fichero plano gemelo se ejecutó también en NVIDIA RTX 5070 Ti. El motor NVIDIA tiene la misma proyección en su código fuente, pero este fichero no se ha probado en tarjeta NVIDIA.
- Cabe en GPU de consumo: sí, según la model card, en una tarjeta de 16 GB como la RX 9070 XT.
- Opciones de despliegue: exclusivamente el motor Starlight. No es compatible con llama.cpp, Ollama, LM Studio, Transformers ni otros programas; la model card indica que esos entornos no están soportados ni probados.
- Latencia y throughput: mediana de 122,7 tokens por segundo en decodificación reportada por el servidor en la RX 9070 XT, con MTP activado y caché de atención q4.

## Comparativa con modelos similares

| Modelo | Tamaño del fichero | Expertos enrutados | Tabla de tokens por capa | Lado GPU | Formato |
|---|---:|---:|---:|---:|---|
| `iq3_s_turbo` | 64,78 GiB | 39,98 GiB (2,84 bits/peso) | 20,30 GiB | 44,47 GiB | GGUF Starlight |
| `iq3_xxs_turbo` | 54,68 GiB | 29,88 GiB (2,12 bits/peso) | 20,30 GiB | 34,38 GiB | GGUF Starlight |
| `iq3_xxs_turbo_mini` (este fichero) | 50,03 GiB | 29,88 GiB (2,12 bits/peso) | 15,65 GiB | 34,38 GiB | GGUF Starlight |
| `iq3_xxs_turbo_mini` (gemelo plano) | 50,03 GiB | 29,88 GiB (2,12 bits/peso) | 15,65 GiB | 34,38 GiB | GGUF Starlight |

La comparativa con modelos de otras familias o de otros formatos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: el fichero solo funciona con el motor Starlight; no es un checkpoint de Transformers ni safetensors y no está soportado en llama.cpp, Ollama, LM Studio ni otros entornos.
- Validación limitada a una GPU: solo se ha ejecutado en AMD RX 9070 XT; el comportamiento en NVIDIA no está probado para este fichero, aunque el motor NVIDIA tenga la misma proyección en su código.
- Abliteración: elimina la dirección de rechazo en tiempo de ejecución, lo que puede alterar el comportamiento en dominios sensibles y reducir salvaguardas. La prueba de rechazo pasa de 9 de 20 a 20 de 20 respuestas, pero la batería calificada no muestra una pérdida de capacidad apreciable (175 frente a 176, dentro del ruido de la prueba).
- Divergencia respecto al fichero plano: solo 1 de 20 prompts abiertos greedy produce el mismo texto, con divergencia a los 94 caracteres de mediana; la KL media de 0,0084 es del orden de cambios que solo alteran el redondeo en este motor, debido a que el router entre 512 expertos invierte casi-empates.
- La pérdida emparejada de −0,0072 nats por token se midió en un único texto y el proyecto no la interpreta como una mejora de calidad.
- Licencia: Qwen Community License 1.0, etiquetada como `license: other`; es necesario revisar los términos para uso comercial.
- Idiomas soportados y longitud de contexto: no disponibles en la documentación proporcionada, lo que impide garantizar comportamiento multilingüe o ventanas largas.
- Sin datos de benchmarks estándar (MMLU, HumanEval, GSM8K) publicados en la información disponible, por lo que no se puede comparar de forma objetiva con otros modelos de la misma categoría.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/feverdoingwork/Qwen3.8-Flash-Next-iq3_xxs_turbo_mini-abliterated-Starlight
- Fichero plano gemelo: https://huggingface.co/feverdoingwork/Qwen3.8-Flash-Next-iq3_xxs_turbo_mini-Starlight
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización GSQ-RCO del modelo base: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF

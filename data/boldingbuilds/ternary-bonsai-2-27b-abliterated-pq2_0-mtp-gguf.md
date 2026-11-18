# BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-PQ2_0-MTP-GGUF

## Resumen

Ternary-Bonsai-2-27B-Abliterated-PQ2_0-MTP-GGUF es una cuantización GGUF de 2 bits (2,13 bits por peso) del modelo Ternary Bonsai 2 27B, publicado por el usuario BoldingBuilds. Parte de la versión ternaria de PrismML (`prism-ml/Ternary-Bonsai-2-27B-gguf`) y aplica una técnica de abliteración que elimina el comportamiento de rechazo modificando únicamente un 0,052% de los dígitos ternarios del modelo, sin tocar las escalas de bloque ni recuantizar. El resultado es un modelo sin censura que mantiene prácticamente intactas las capacidades del original.

El modelo tiene 26.895.998.464 parámetros y una arquitectura híbrida etiquetada como `qwen3_5`, con capas de atención, capas SSM (`ssm_out`) y una cabeza de predicción multi-token (MTP) opcional que acelera la decodificación aproximadamente un 37% mediante decodificación especulativa. Se distribuye en dos ficheros: uno estándar de 7,21 GB y otro con la cabeza MTP de 7,66 GB que requiere un runtime parcheado.

Es relevante porque demuestra que la abliteración es viable directamente sobre pesos ternarios empaquetados, un formato extremadamente comprimido, y porque combina esa edición con decodificación especulativa, algo que el autor presenta como el primer caso en un Bonsai 2 abliterado. La licencia Apache 2.0 facilita su uso comercial, aunque el modo de razonamiento presenta problemas conocidos en esta versión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas SSM y atención (familia qwen3_5), con cabeza MTP opcional |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de ejecucion usa `-c 32768`) |
| Tipos de cuantizacion | Ternaria PQ2_0 (2,13 bpw); existe variante PTQ1_0 (1,75 bpw) del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Ternary Bonsai 2 27B de PrismML, un transformer híbrido de la familia qwen3_5 que combina bloques de atención con bloques de estado recurrente (SSM), tal como revelan los nombres de tensores modificados (`ffn_down`, `ssm_out`, `attn_output`). Los pesos se almacenan en formato ternario con escalas de bloque, a 2,13 bits por peso en el empaquetado PQ2_0. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La edición de abliteración modifica 98 de los 851 tensores del modelo, concretamente los que escriben en la corriente residual (`ffn_down`, `ssm_out`, `attn_output`) en los bloques 15 a 63. Dentro de esos tensores se invierte entre un 0,20% y un 0,27% de los dígitos ternarios, lo que supone un 0,052% del total de dígitos del modelo. Las escalas de bloque no se alteran y el resto de pesos permanece byte a byte idéntico al release original. La variante MTP añade 15 tensores (`blk.64.*`) correspondientes a la cabeza de predicción multi-token de Qwen3.8-27B, que habilita decodificación especulativa con `--spec-type draft-mtp`. Esta cabeza requiere un parche de 14 líneas sobre llama.cpp (etiqueta `prism-b10687-5d80cff`) porque la búsqueda de embeddings del grafo borrador omite la transformación inversa de Hadamard que PrismML aplica al tensor `token_embd.weight`.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla Jinja (`--jinja`).
- Razonamiento en modo thinking, aunque con problemas graves en esta versión (ver limitaciones).
- Generación de código: HumanEval-164 con pass@1 de 0,872 en decodificación greedy.
- Conocimiento general y respuesta a preguntas de opción múltiple: MMLU 0,7812 en el conjunto de test completo.
- Decodificación especulativa mediante cabeza MTP en el fichero correspondiente, con aproximadamente un 37% más de velocidad de decodificación.
- Comportamiento sin rechazo: 0% de rechazo en SimpleSafetyTests y 0% de sobrerrechazo en XSTest-safe.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación sobre alineación y abliteración: el modelo permite estudiar el efecto de eliminar el comportamiento de rechazo sobre pesos ternarios sin recuantizar, comparando directamente con el modelo original de PrismML y midiendo el impacto en MMLU y HumanEval.
- Despliegue en hardware de gama consumer: con 7,21 GB en el fichero estándar, cabe en GPUs con 8-12 GB de VRAM, lo que permite ejecutar un modelo de 27B en equipos domésticos mediante llama.cpp u Ollama.
- Generación de código en local: el pass@1 de 0,872 en HumanEval lo hace utilizable para autocompletado y generación de funciones en entornos sin conexión o con requisitos de privacidad.
- Evaluación de decodificación especulativa: la variante MTP sirve para medir el rendimiento de `draft-mtp` en llama.cpp parcheado, con una mejora de velocidad del 37% a pesos idénticos.
- Procesamiento por lotes de texto en servidores modestos: el bajo consumo de memoria (2,13 bpw) permite mayor concurrencia por GPU en tareas de clasificación, resumen o extracción de información.
- Estudio de robustez frente a prompts dañinos: al tener 0% de rechazo, es útil como caso extremo en pruebas de sistemas de moderación y filtrado, siempre en entornos controlados y con las salvaguardas externas adecuadas.
- Referencia para compresión extrema: sirve para comparar la pérdida de calidad de la cuantización ternaria (5,2 puntos porcentuales en MMLU frente al padre no ternario) con otras técnicas de cuantización.

## Benchmarks y rendimiento

| Benchmark | Modelo | Resultado |
|---|---|---|
| MMLU (test completo, 14.042 preguntas, 0-shot) | Qwen3.8-27B Q4_K_M (referencia no ternaria) | 0,8318 |
| MMLU | Ternary Bonsai 2 PQ2_0 original | 0,7797 |
| MMLU | Este modelo (PQ2_0) | 0,7812 |
| MMLU | Ternary Bonsai 2 PTQ1_0 original | 0,7802 |
| MMLU | Método de este autor sobre PTQ1_0 | 0,7814 |
| HumanEval-164 (greedy pass@1) | Ternary Bonsai 2 PQ2_0 original | 0,890 |
| HumanEval-164 (greedy pass@1) | Este modelo | 0,872 |
| Rechazo en SimpleSafetyTests (n=100) | Ternary Bonsai 2 PQ2_0 original | 83% |
| Rechazo en SimpleSafetyTests (n=100) | Este modelo | 0% |
| Calidad de respuesta en SimpleSafetyTests (StrongReject, 0-1) | Original | 0,164 |
| Calidad de respuesta en SimpleSafetyTests (StrongReject, 0-1) | Este modelo | 0,735 |
| Sobrerrechazo en XSTest-safe (n=250) | Original | 1,6% |
| Sobrerrechazo en XSTest-safe (n=250) | Este modelo | 0,0% |
| Rechazo parcial en XSTest-safe | Original | 0,4% |
| Rechazo parcial en XSTest-safe | Este modelo | 0,0% |

La diferencia en MMLU frente al original es de +0,15 puntos porcentuales (p de McNemar exacto = 0,40, no significativa). En HumanEval la diferencia es de −1,8 puntos porcentuales (3 problemas ganados, 6 perdidos, p = 0,51, no significativa). La compresión ternaria en sí cuesta unos 5,2 puntos porcentuales en MMLU frente al padre no ternario (p = 2,6e-71). Las mediciones de rechazo se hicieron con thinking desactivado, decodificación greedy y respuestas de 2.048 tokens, evaluadas por Qwen3.8-27B-OBLITERATED-Q8_0 con la rúbrica StrongReject. La velocidad de decodificación con MTP se midió en una RTX 3090 con 5 prompts de 400 tokens cada uno, pero el dato numérico exacto de tokens por segundo no aparece en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: unos 7,2 GB para el fichero estándar y unos 7,7 GB para el fichero MTP, más la memoria de contexto y el estado KV. Con `-c 32768` y `-fa on` el consumo adicional de caché es considerable.
- GPUs recomendadas: RTX 3090 (usada en las mediciones del autor), RTX 4090, A100 y H100 para mayor concurrencia y contexto. Cualquier GPU con al menos 8-10 GB de VRAM puede ejecutar el fichero estándar.
- Cabe en GPU consumer: sí, en tarjetas de 8 GB o más con cuantización PQ2_0; en 6 GB requeriría reducir contexto o usar la variante PTQ1_0 de 1,75 bpw.
- Opciones de despliegue: llama.cpp (obligatorio para la variante MTP con el parche `0001-qwen35-mtp-hadamard-inverse.patch`), llama-server con `--jinja`, y presumiblemente Ollama y otros frontends compatibles con GGUF para el fichero estándar. vLLM y TGI no se mencionan como soportados.
- Latencia y throughput: la variante MTP decodifica aproximadamente un 37% más rápido que el fichero estándar a pesos idénticos, medido en una RTX 3090 con `--spec-draft-n-max 2`. No se proporcionan cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | HumanEval | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este modelo (PQ2_0) | 26,9B | no disponible | 0,7812 | 0,872 | Apache 2.0 | GGUF ternario 2,13 bpw |
| Ternary Bonsai 2 PQ2_0 original | 26,9B | no disponible | 0,7797 | 0,890 | Apache 2.0 | GGUF ternario 2,13 bpw |
| Ternary Bonsai 2 PTQ1_0 | 26,9B | no disponible | 0,7802 | no disponible | Apache 2.0 | GGUF ternario 1,75 bpw |
| Qwen3.8-27B Q4_K_M | 27B (aprox.) | no disponible | 0,8318 | no disponible | no disponible | GGUF 4 bits |

Frente al original, este modelo iguala el rendimiento en MMLU y pierde 1,8 puntos en HumanEval sin significación estadística, a cambio de eliminar por completo el rechazo. Frente al padre no ternario Qwen3.8-27B en Q4_K_M, la compresión ternaria cuesta unos 5,2 puntos de MMLU. La variante PTQ1_0 ofrece un tamaño menor (1,75 bpw) con MMLU prácticamente idéntico, pero sin soporte útil de MTP según el autor.

## Limitaciones y advertencias

- El modo thinking está roto en esta versión: con ajustes por defecto, el 27% de los prompts dañinos no produce respuesta y el 20% de los seguros tampoco; con decodificación greedy el 65% de los dañinos queda sin respuesta por bucles de repetición. El autor recomienda desactivar thinking y ha publicado una v2 que corrige el problema.
- La abliteración elimina el rechazo por completo (0% en SimpleSafetyTests), lo que implica que el modelo responderá a solicitudes dañinas. Requiere salvaguardas externas en cualquier despliegue público.
- La cuantización ternaria degrada el rendimiento en unos 5,2 puntos de MMLU frente al modelo no ternario, de forma independiente a la abliteración.
- La variante MTP exige compilar llama.cpp con un parche específico sobre la etiqueta `prism-b10687-5d80cff`; los binarios estándar fallan al arrancar con `--spec-type draft-mtp`.
- No se dispone de información sobre idiomas soportados, sesgos específicos ni riesgos de alucinación más allá de los inherentes a un modelo de 27B cuantizado a 2 bits.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el proceso de abliteración deben revisarse según la política de la organización.
- El repositorio tiene 5.075 descargas y 32 likes, con una fecha de actualización de septiembre de 2026; es un artefacto de la comunidad, no un release oficial de PrismML.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-PQ2_0-MTP-GGUF
- Versión v2 con el problema de thinking corregido: https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-v2-PQ2_0-MTP-GGUF
- Variante PTQ1_0 (1,75 bpw): https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-PTQ1_0-GGUF
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Repositorio de llama.cpp de PrismML: https://github.com/PrismML-Eng/llama.cpp
- Implementación MTP independiente de decent-jawfish: https://huggingface.co/decent-jawfish/bonsai-2-27b-mtp
- Implementación MTP independiente de ProCreations: https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-MTP

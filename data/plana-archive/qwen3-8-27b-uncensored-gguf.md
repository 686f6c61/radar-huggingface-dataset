# Plana-Archive/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una cuantización en formato GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario Plana-Archive. El modelo base es un transformer denso de 27 000 millones de parámetros con arquitectura declarada como `Qwen3_5ForConditionalGeneration`, 64 capas, vocabulario de 248 320 tokens y una ventana de contexto nativa de 262 144 tokens. La modificación principal respecto al original es la eliminación de direcciones de rechazo mediante la técnica de abliteration implementada en la herramienta Heretic, que co-minimiza el número de rechazos frente a la divergencia KL respecto al modelo base, sin fine-tuning ni datos adicionales.

El paquete incluye cuantizaciones desde IQ2_M (10,6 GB) hasta Q8_0 (29,0 GB), además de un proyector de visión F16 (0,9 GB) y una cabeza de predicción multi-token (MTP) que actúa como modelo borrador para decodificación especulativa. La cabeza MTP se copia literalmente del checkpoint base tras la fusión del LoRA de abliteration, de modo que la modificación solo afecta a `attn.o_proj` y `mlp.down_proj` de la pila principal.

Es relevante para desarrolladores que necesitan ejecutar un modelo de 27B con contexto largo en hardware local mediante llama.cpp, con la opción de aceleración por decodificación especulativa integrada y con capacidad de entrada de imagen. La licencia Apache 2.0 permite uso comercial, aunque el comportamiento sin censura introduce riesgos de contenido que deben gestionarse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer denso, 64 capas) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Vocabulario | 248 320 tokens |
| Capas MTP | 1 |
| Vision | si (proyector mmproj F16) |
| Herramienta de conversion | llama.cpp `a94d563ed` |
| Matriz de importancia | wikitext-2 raw, 200 chunks |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 64 capas con 27B de parámetros y un vocabulario de 248 320 tokens, empaquetado bajo la clase `Qwen3_5ForConditionalGeneration`. Incluye una capa de predicción multi-token (MTP) que funciona como cabeza borrador para decodificación especulativa, y un proyector de visión que habilita entrada de imágenes cuando se carga junto con el runtime adecuado. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La modificación de esta ficha es puramente de alineación: se aplicó abliteration con Heretic en precisión bf16, sin cuantización intermedia, y el LoRA resultante se fusionó en el checkpoint bf16 antes de convertir a GGUF. Los tensores `mtp.*` se copiaron literalmente del checkpoint base, por lo que la cabeza MTP no fue alterada. La matriz de importancia se calculó directamente sobre los pesos f16, no sobre una cuantización intermedia, lo que mejora la calibración de las cuantizaciones de baja precisión. La innovación técnica destacable es la conservación verificada de la cabeza MTP dentro del mismo archivo GGUF fusionado, lo que permite decodificación especulativa sin necesidad de cargar un modelo borrador separado.

## Capacidades

- Generación de texto en inglés y chino, con contexto nativo de 262 144 tokens.
- Razonamiento y matemáticas heredados del modelo base Qwen3.8-27B (no se detallan benchmarks específicos en la información disponible).
- Entrada de imagen mediante el proyector `mmproj-Qwen3.8-27B-Uncensored-F16.gguf` en runtimes compatibles.
- Decodificación especulativa con la cabeza MTP integrada (modo fusionado) o como modelo borrador explícito (`--model-draft`).
- Comportamiento de rechazo sustancialmente reducido respecto al base, medido y documentado por el autor.
- Compatibilidad con llama.cpp y llama-server, incluida la variante sin MTP para runtimes que no soportan la cabeza borrador.
- No se documenta soporte explícito de tool calling ni de razonamiento multi-paso en la información proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU de consumo: la cuantización IQ4_XS (15,3 GB) o Q4_K_M (16,8 GB) permite ejecutar el modelo en GPUs con 24 GB de VRAM, como la RTX 4090, manteniendo una perplejidad de 7,1583 y 7,1814 respectivamente frente a 7,1557 del f16.
- Servicio de chat con contexto largo: los 262 144 tokens de ventana permiten procesar documentos completos, expedientes o bases de código extensas en una sola pasada sin truncamiento.
- Aceleración de inferencia con decodificación especulativa: cargar el archivo fusionado con MTP integrado o el par `noMTP` más `draft-Q8_0` (3,2 GB) reduce la latencia por token al verificar cada token contra el modelo objetivo, sin degradar la calidad de salida.
- Análisis de documentos con imagen: usando el proyector `mmproj` F16 en un runtime de visión compatible, el modelo puede procesar capturas, diagramas o páginas escaneadas junto con texto.
- Investigación sobre alineación y rechazo: el paquete documenta mediciones de comportamiento y permite comparar la tasa de rechazo frente al base sin modificar arquitectura ni datos de entrenamiento.
- Despliegue en entornos con presupuesto de VRAM ajustado: la variante IQ2_M (10,6 GB) permite ejecutar el modelo en GPUs de 12-16 GB, a costa de una perplejidad de 7,8581, notablemente superior al resto de cuantizaciones.
- Prototipado de agentes conversacionales multi-turno en inglés o chino: el contexto largo y la reducción de rechazos facilitan conversaciones prolongadas sin reinicios de sesión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos cuantitativos publicados son de perplejidad sobre wikitext-2:

| Cuantizacion | Tamano | PPL (wikitext-2) | Delta vs f16 |
|---|---|---|---|
| f16 (referencia, no distribuida) | - | 7,1557 ± 0,25104 | - |
| Q5_K_M | 19,5 GB | 7,1573 ± 0,25055 | +0,0016 |
| IQ4_XS | 15,3 GB | 7,1583 ± 0,25019 | +0,0026 |
| Q6_K | 22,4 GB | 7,1689 ± 0,25149 | +0,0132 |
| Q8_0 | 29,0 GB | 7,1764 ± 0,25195 | +0,0207 |
| Q4_K_M | 16,8 GB | 7,1814 ± 0,25227 | +0,0257 |
| IQ2_M | 10,6 GB | 7,8581 ± 0,27481 | +0,7024 |

El autor advierte que, salvo IQ2_M, todas las filas caen dentro de un margen de 0,026 frente a un error estándar de aproximadamente 0,25, por lo que las diferencias entre cuantizaciones de 4 bits en adelante no son estadísticamente separables.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 10,6 GB (IQ2_M) y 29,0 GB (Q8_0) solo para los pesos; añadir 0,9 GB si se usa el proyector de visión y 3,2 GB (Q8_0) o 1,7 GB (Q4_0) si se carga la cabeza borrador como archivo separado.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 con contexto completo; RTX 4090 (24 GB) para Q4_K_M o IQ4_XS; RTX 3090 (24 GB) en las mismas cuantizaciones; GPUs de 12-16 GB solo con IQ2_M.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 con cuantizaciones de 4 bits; en GPUs de 12 GB únicamente con IQ2_M y asumiendo la pérdida de perplejidad documentada.
- Opciones de despliegue: llama.cpp (conversión verificada con el commit `a94d563ed`), llama-server con `--model-draft` para la cabeza MTP, y ComfyUI según la sección de uso de la model card.
- Latencia y throughput: no disponibles en la información proporcionada; el autor indica que la decodificación especulativa está medida en este modelo, pero los valores numéricos no se incluyen en el extracto disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-GGUF (este) | 27B | 262 144 | Apache 2.0 | GGUF | Abliteration con Heretic, MTP integrada, vision |
| Qwen/Qwen3.8-27B (base) | 27B | 262 144 | Apache 2.0 | safetensors | Sin modificar; mantiene comportamiento de rechazo original |
| Plana-Chan/Qwen3.8-27B-Uncensored-GGUF | 27B | 262 144 | no disponible | GGUF | Publicación paralela del mismo autor; relación exacta no documentada |
| Plana-Archive/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF | 27B | 262 144 | no disponible | GGUF | Variante con aceleración FastMTP añadida; no comparable en calidad sin datos |

No se dispone de benchmarks comparativos de rendimiento entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El comportamiento de rechazo está sustancialmente reducido, no eliminado; el autor documenta mediciones concretas en la sección "Measured behavior" de la model card, que deben revisarse antes de desplegar.
- La reducción de rechazos implica que el modelo puede generar contenido que el base rechazaría; es responsabilidad del operador aplicar filtros y políticas de uso en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje de esta escala; no se documentan evaluaciones específicas de factualidad.
- Idiomas soportados oficialmente: inglés y chino. El rendimiento en castellano no está garantizado ni medido.
- La cabeza MTP fue entrenada contra el modelo sin modificar, por lo que la tasa de aceptación en decodificación especulativa puede caer ligeramente; la calidad de salida no se ve afectada porque cada token se verifica contra el objetivo.
- La cuantización IQ2_M presenta una degradación de perplejidad de +0,7024 frente al f16, muy superior al resto; no se recomienda para tareas sensibles a la calidad.
- Las diferencias de perplejidad entre cuantizaciones de 4 bits en adelante no son estadísticamente significativas según los intervalos de error publicados.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen/Qwen3.8-27B y las condiciones de la técnica de abliteration en el contexto legal de cada despliegue.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria todavía inexistente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Plana-Archive/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Publicación paralela: https://huggingface.co/Plana-Chan/Qwen3.8-27B-Uncensored-GGUF/tree/main
- Variante HauhauCS Aggressive MTP: https://huggingface.co/Plana-Archive/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/blob/main/README.md
- Herramienta Heretic: https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp

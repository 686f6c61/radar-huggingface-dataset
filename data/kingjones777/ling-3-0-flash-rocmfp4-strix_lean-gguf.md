# kingjones777/Ling-3.0-flash-ROCmFP4-STRIX_LEAN-GGUF

## Resumen

Ling-3.0-flash-ROCmFP4-STRIX_LEAN-GGUF es una cuantización de 4 bits del modelo instruct `inclusionAI/Ling-3.0-flash`, publicada por el usuario kingjones777 y orientada específicamente a hardware AMD con memoria unificada: el Ryzen AI Max+ 395 (gfx1151, arquitectura Strix Halo) con 128 GB. No es un modelo nuevo, sino un artefacto de despliegue: el checkpoint original en BF16 (255 GB, 938 tensores) se convierte a un GGUF de 68,1 GB con un tipo de tensor propietario, `Q4_0_ROCMFP4_STRIX_LEAN` (ftype 106), que combina cuerpo de 4 bits, embeddings de tokens en Q5_K y una cabeza LM protegida en Q6_K.

La relevancia de esta ficha es doble. Por un lado, documenta el modelo base: un transformer de tipo MoE con arquitectura `bailingmoe3`, 127.486.405.600 parámetros totales, 43 bloques, ventana de contexto de 262.144 tokens y una capa de predicción multi-token (MTP) en el bloque 42, además de 35 capas con atención KDA (Kimi Delta Attention) frente a 7 capas de atención completa. Por otro, documenta un caso poco habitual: una cuantización que no funciona en llama.cpp estándar, Ollama ni LM Studio, porque los tipos de tensor ROCmFP4/ROCmFPX no están en el árbol principal.

El resultado práctico es un paquete de 68 GB que cabe en los 128 GB de memoria unificada de un equipo Strix Halo y que, según las mediciones del autor, genera a 45,19 tok/s con prompt de 1k y 39,79 tok/s con prompt de 8k, con 459,1 tok/s de prefill a 1k. Está pensado para servir en local con el motor Super Roc, con licencia MIT heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `bailingmoe3` (MoE con atención híbrida: 35 capas KDA + 7 capas de atención completa), 43 bloques, MTP en `blk.42` |
| Parametros totales | 127.486.405.600 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (config del modelo); 131.072 tokens cargados en la medición del autor |
| Tipos de cuantizacion | ftype 106 `Q4_0_ROCMFP4_STRIX_LEAN`: cuerpo 4 bits, `token_embd.weight` en Q5_K, `output.weight` en Q6_K; 4,28 BPW |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (938 tensores, 68.136.565.408 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer disperso (MoE) de la familia `bailingmoe3`, con 43 bloques y 127.486 millones de parámetros totales. La innovación estructural más destacable es la atención híbrida: 35 de las 42 capas computacionales usan KDA (Kimi Delta Attention, un mecanismo de atención lineal recurrente) y solo 7 mantienen atención completa, lo que reduce el coste de contexto largo. Incorpora además una cabeza de predicción multi-token (`nextn_predict_layers = 1`, alojada en `blk.42`), pensada para decodificación especulativa y para servir como drafter interno. El checkpoint tiene `tie_word_embeddings = false`, de modo que `output.weight` es un tensor independiente y puede cuantizarse por separado del embedding de entrada.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original en la información proporcionada. Lo que sí está documentado es el proceso de cuantización: partiendo de `inclusionAI/Ling-3.0-flash` en la revisión `42766a814ab117e75e2e61465d5e131b72d931a3`, el autor generó un GGUF BF16 de 255.091.083.232 bytes y lo cuantizó con `llama-quantize --output-tensor-type q6_K` y ftype 16 (Q4_0_ROCMFP4_STRIX_LEAN). Un detalle técnico relevante: el conversor upstream emite las puertas KDA como `blk.N.ssm_f_a` / `ssm_g_a` (nombres heredados de kimi-linear), mientras que el runtime espera `ssm_f` / `ssm_g`; el autor parcheó el conversor y verificó 35 pares `ssm_f` + `ssm_g` y cero sufijos `_a`.

## Capacidades

- Generación de texto conversacional en modo instruct, con plantilla de chat que admite `chat_template_kwargs.enable_thinking` para activar el modo de razonamiento por petición.
- Modo thinking desactivable: el comando de referencia arranca con `--think off` y el razonamiento se habilita a nivel de petición.
- Tool calling / function calling: el autor reporta 7/8 en llamadas requeridas y 7/8 en modo automático.
- Razonamiento multi-paso y uso como agente, apoyado en la ventana de 262.144 tokens y en la caché de prompt (6.972 de 6.996 tokens reutilizados en el segundo turno).
- Generación de código, con 41,6 tok/s de media en dos prompts de código.
- Decodificación especulativa mediante la cabeza MTP presente en el checkpoint (en la medición publicada el drafter figura como desactivado).
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión y audio: no disponible; las etiquetas del repositorio solo declaran `text-generation`.

## Casos de uso

- Asistente de código en local sobre un equipo Strix Halo: con 41,6 tok/s en prompts de código y soporte de tool calling, el modelo puede integrarse en un flujo de edición y ejecución de parches sin salir de la máquina, útil cuando el código no puede enviarse a la nube.
- Agente de múltiples pasos con contexto largo: la ventana de 262.144 tokens y la caché de prompt (reutilización de casi la totalidad del prompt en el segundo turno) permiten mantener repositorios, transcripciones o documentación extensa dentro de la misma sesión sin recompilar el contexto.
- Servicio de chat conversacional autoalojado: el motor Super Roc expone un endpoint compatible con la API de OpenAI (`--served-model-name ling-3.0-flash`), de modo que puede sustituir a un proveedor externo en aplicaciones ya escritas contra ese contrato.
- Procesamiento de documentos largos y resumen: la combinación de atención KDA en 35 capas y 131.072 tokens cargados en la medición reduce el coste de prefill en entradas de decenas de miles de tokens (202,6 tok/s a 8k).
- Laboratorio de evaluación de cuantizaciones: al publicarse tres builds del mismo checkpoint alineado (106 STRIX_LEAN, 106 Research y Q6 AGENT 114), sirve para medir el impacto real de proteger o no la cabeza LM en calidad de salida.
- Despliegue con Lemonade: el autor documenta `lemonade pull Ling-3.0-flash` y `lemonade chat Ling-3.0-flash` apuntando `llamacpp.rocm_bin` al binario de Super Roc, lo que facilita probar el modelo en un entorno de escritorio sin configurar llama.cpp a mano.
- Investigación sobre atención lineal: las 35 capas KDA y la cabeza MTP hacen del modelo un banco de pruebas para estudiar decodificación especulativa y atención recurrente en hardware de consumo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo de carga | 203 s |
| Prompt tok/s (p1k) | 459,1 |
| Prompt tok/s (p8k) | 202,6 |
| Generacion tok/s (p1k) | 45,19 |
| Generacion tok/s (p8k) | 39,79 |
| Generacion de codigo tok/s | 41,6 (media de 2 prompts) |
| Tool calls (requeridas / auto) | 7/8 / 7/8 |
| Cache de prompt, turno 2 | 6.972 / 6.996 tokens |
| Contexto cargado | 131.072 tokens |
| Decodificacion (medicion del build) | 30,7 tok/s con prompt de 107,9 tok/s |
| Drafter | off |

Medido en Ryzen AI Max+ 395, 128 GB, Super Roc 0.20.0 (release candidate), una petición simultánea, el 23 de noviembre de 2026. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: 68,1 GB de pesos en disco; el autor reporta un dry-run de 64.973,85 MiB (4,28 BPW) y un build final con +6,242 MiB. Con overhead de contexto KV para 131.072 tokens, el conjunto encaja en los 128 GB de memoria unificada del Ryzen AI Max+ 395.
- GPU objetivo: AMD Radeon integrada de Strix Halo, gfx1151 (Ryzen AI Max+ 395). No hay datos de funcionamiento en A100, H100 ni RTX 4090.
- GPU de consumo: no se ha validado en GPUs discretas; los tipos de tensor ROCmFP4/ROCmFPX son específicos de ROCm y del objetivo gfx1151.
- Opciones de despliegue: Super Roc (motor recomendado por el autor, `superroc serve`), Lemonade como front-end, y llama.cpp únicamente si está compilado con soporte ROCmFPX (builds de kyuz0 para Strix Halo). No funciona en llama.cpp mainline, Ollama ni LM Studio.
- Latencia y throughput: 30,7 tok/s de decode y 107,9 tok/s de prompt en la medición del build; 45,19 tok/s de generación con prompt de 1k y 39,79 tok/s con prompt de 8k en la medición de servicio.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.0-flash-ROCmFP4-STRIX_LEAN (esta ficha) | 127,49 B | 262.144 | GGUF ftype 106, 68,1 GB | MIT | Solo llama.cpp con ROCmFPX / Super Roc |
| Ling-3.0-flash 106 Research | 127,49 B | 262.144 | GGUF ftype 106 sin cabeza protegida | MIT | Mismo runtime; orientado a comparación, no a servir |
| Ling-3.0-flash Q6 AGENT (114) | 127,49 B | 262.144 | GGUF ~8 bits, mayor tamano | MIT | Mismo runtime; mayor fidelidad y menor velocidad |
| inclusionAI/Ling-3.0-flash (base) | 127,49 B | 262.144 | BF16, 255,1 GB | MIT | Requiere hardware con memoria suficiente para BF16 |

No se dispone de datos de benchmarks que permitan comparar calidad frente a modelos de otros autores con parámetros similares.

## Limitaciones y advertencias

- Incompatibilidad de runtime: los tipos `Q4_0_ROCMFP4_*` y `Q*_0_ROCMFPX*` no están en llama.cpp mainline; el modelo no carga en llama.cpp estándar, Ollama ni LM Studio. Es un requisito estricto, no una recomendación.
- Dependencia de hardware: validado únicamente en gfx1151 (Ryzen AI Max+ 395). No hay evidencia de funcionamiento en otras GPU AMD ni en NVIDIA.
- La cabeza LM debe verificarse por nombre exacto de tensor (`output.weight`, nunca por subcadena, ya que coincide dentro de `attn_output.weight`). El ftype 106 por sí solo no protege la cabeza; omitir `--output-tensor-type q6_K` produce un modelo de peor calidad indistinguible externamente.
- El parche del conversor (`ssm_f_a`/`ssm_g_a` a `ssm_f`/`ssm_g`) es necesario para que el runtime cargue las puertas KDA; sin él, el grafo no se resuelve correctamente.
- Riesgo de alucinación y sesgos: no hay información publicada sobre evaluación de sesgos ni sobre tasas de alucinación del modelo base en la documentación disponible.
- Idiomas: no se declaran idiomas soportados, por lo que no puede asumirse cobertura multilingüe sin evaluarla.
- Licencia MIT: permite uso comercial, pero se hereda del modelo base y conviene verificar las condiciones del checkpoint original `inclusionAI/Ling-3.0-flash`.
- Las cifras de rendimiento proceden de una única máquina, una sola petición concurrente y una versión release candidate del motor; no deben extrapolarse a cargas concurrentes.
- El modo thinking está desactivado por defecto en el comando de ejemplo; si se necesita razonamiento explícito, debe activarse por petición y eso altera el consumo de tokens y la latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kingjones777/Ling-3.0-flash-ROCmFP4-STRIX_LEAN-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Motor Super Roc: https://github.com/kingjones30/superroc
- Guía de Lemonade del autor: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- Formatos ROCm-FP4 y trabajo previo en llama.cpp (ROCmFPX): https://github.com/charlie12345/ROCmFPX

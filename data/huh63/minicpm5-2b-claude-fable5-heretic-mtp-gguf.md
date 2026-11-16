# hUh63/MiniCPM5-2B-Claude-Fable5-heretic-MTP-GGUF

## Resumen

MiniCPM5-2B-Claude-Fable5-heretic-MTP-GGUF es una cuantización GGUF de un modelo derivado de MiniCPM5-2B, publicado por el usuario hUh63. El modelo parte de `saidutta69/MiniCPM5-2B-Claude-Fable5-heretic`, un fine-tune de MiniCPM5-2B orientado a conversación, al que se le ha injertado una cabeza de predicción multi-token (MTP, Multi-Token Prediction) entrenada desde cero para habilitar decodificación especulativa al estilo DeepSeek-V3. El tronco de 42 capas permanece congelado y byte a byte idéntico; solo se entrena una capa adicional (la 43) más un proyector y dos normalizaciones.

El modelo resuelve un problema muy concreto: incorporar decodificación especulativa a una arquitectura Llama estándar sin modificar el tronco. La cabeza MTP añade 55.582.720 parámetros nuevos (2,21 % de los 2.516.756.480 del tronco congelado), compartiendo embeddings, `lm_head` y normalización final. Se distribuye en dos cuantizaciones, Q4_K_M y Q8_0, generadas en una sola pasada desde BF16, con la cabeza MTP preservada en BF16/F32 para no degradar la tasa de aceptación.

Es relevante ahora porque documenta de forma transparente un resultado negativo medido: con una cabeza MTP entrenada sobre un corpus pequeño y fuera de dominio, la decodificación especulativa resulta más lenta que la decodificación normal (ratio 0,49× en Q4_K_M y 0,51× en Q8_0 en CPU). El autor publica las cifras reales en lugar de reclamar una mejora no verificada, lo que lo convierte en un caso de estudio útil sobre cuándo merece la pena la decodificación especulativa. El modelo está pensado para zh/en y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (`LlamaForCausalLM`) con cabeza MTP serial (estilo DeepSeek-V3) injertada; 43 bloques (`llama.block_count = 43`) |
| Parametros totales | 2.516.756.480 (tronco congelado) + 55.582.720 (cabeza MTP) = 2.572.339.200 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (con imatrix), Q8_0, BF16 |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M y Q8_0, 393 tensores cada uno), BF16 GGUF, `mtp_head.pt` (PyTorch) |

## Arquitectura y entrenamiento

El tronco es un transformer tipo Llama de 42 capas con estado oculto de 2048 dimensiones, congelado en BF16 durante todo el proceso. Sobre él se injerta una cabeza MTP serial de una sola capa: se proyecta la concatenación de la normalización del embedding del token `t+1` y de la normalización del estado oculto final del tronco en `h_t` mediante `eh_proj` (4096 → 2048); se pasa por una capa decoder Llama estándar (atención + FFN con pre-norm); y se aplica la normalización final y el `lm_head` del tronco, ambos compartidos. El embedding, el `lm_head` y la normalización final no se copian, se comparten. La capa decoder nueva se inicializa en caliente desde la capa 42 del tronco.

El entrenamiento de la cabeza consistió en 240 pasos de AdamW, batch 2, secuencia 64, learning rate 0,0002 y semilla 771113, con el tronco congelado en BF16 y la cabeza en FP32. Se optimizó únicamente una cross-entropy de un paso (`t+2`), sin pérdida conjunta multi-token, lo que reduce el ruido de entrenamiento. La pérdida bajó de 11,5989 a 0,3616 (media de los últimos 10 pasos: 0,7155). La innovación técnica principal es el injerto de MTP sobre una arquitectura Llama sin tocar el tronco, lo que garantiza que la capacidad base del modelo no se altera: la cabeza solo influye en la aceptación de borradores durante la decodificación especulativa. Los 12 tensores de la cabeza MTP se mantienen en BF16 (matrices) y F32 (normalizaciones) en ambas cuantizaciones, ya que cuantizarlos aleja sus logits del tronco y reduce la tasa de aceptación; el coste es de aproximadamente 0,14 GiB.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Razonamiento y respuesta multi-turno heredados del fine-tune base `MiniCPM5-2B-Claude-Fable5-heretic`.
- Decodificación especulativa mediante cabeza MTP (`llama.nextn_predict_layers = 1`, tres tensores `nextn`: `blk.42.nextn.eh_proj.weight`, `blk.42.nextn.enorm.weight`, `blk.42.nextn.hnorm.weight`).
- Ejecución en CPU: el autor reporta inferencia en CPU con 24 hilos.
- Compatibilidad con `llama-server` y con endpoints compatibles (`endpoints_compatible` en los tags).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Estudio de decodificación especulativa en arquitecturas Llama: el modelo sirve para reproducir el injerto de una cabeza MTP sobre un tronco congelado y medir tasas de aceptación reales con `llama-server` (`slot print_timings`), usando los scripts de `tools/` y `eval.json` como referencia.
- Evaluación de cuantizaciones GGUF en CPU: los ficheros Q4_K_M (1,55 GiB) y Q8_0 (2,60 GiB) permiten comparar perplejidad en corpus reservado (6,9255 y 6,5177 respectivamente) en hardware sin GPU, con 24 hilos.
- Generación de texto conversacional ligera en chino e inglés: un modelo de 2,5B parámetros en Q4_K_M ocupa 1,55 GiB, adecuado para asistentes locales en equipos de gama media sin acelerador.
- Prototipado de pipelines de decodificación especulativa: útil para validar el parche de llama.cpp (`tools/patch_llamacpp.py`) que añade el cargador NextN, el grafo MTP y la corrección `crop_before_nextn` / `crop_after_nextn`.
- Investigación sobre entrenamiento de cabezas MTP: el repositorio incluye `mtp_head.pt` con el state_dict y metadatos, lo que permite reentrenar la cabeza sobre un corpus mayor y en dominio para mejorar la aceptación.
- Despliegue de referencia en entornos con restricciones de memoria: al no requerir GPU, encaja en servidores CPU o contenedores con pocos recursos para tareas de generación de texto de baja latencia relativa.
- Reproducción de resultados: `eval.json` y los scripts permiten verificar perplejidad, aceptación y throughput en el mismo build, lo que facilita auditorías internas de cuantizaciones.

## Benchmarks y rendimiento

Datos medidos por el autor en CPU, 24 hilos, 3 prompts × 48 tokens, temperatura 0, con perplejidad sobre corpus reservado no visto por imatrix ni por el entrenamiento:

| Cuantizacion | PPL (reservado) | Aceptacion de borradores | tok/s base | tok/s con MTP | Aceleracion |
|---|---|---|---|---|---|
| Q4_K_M | 6,9255 | 0,0289 (14/484) | 54,70 | 26,83 | 0,490× |
| Q8_0 | 6,5177 | 0,0327 (15/474) | 34,28 | 17,50 | 0,510× |

La tasa de aceptación se lee de la línea `draft acceptance` de `llama-server`; el throughput es `timings.predicted_per_second` comparando decodificación normal frente a `--spec-type draft-mtp --spec-draft-n-max 4` sobre el mismo fichero, mismos hilos y mismos prompts. El resultado medido es que la decodificación especulativa es más lenta que la decodificación normal en este build solo-CPU, con ratio inferior a 1. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el build medido (ejecución en CPU); en GPU, Q4_K_M ocupa 1,55 GiB y Q8_0 2,60 GiB de pesos, más overhead de contexto y caché KV no documentado.
- GPU recomendadas: no disponibles en la información proporcionada; el autor solo documenta ejecución en CPU con 24 hilos.
- Cabe en GPU de consumo: sí por tamaño de pesos (Q4_K_M de 1,55 GiB), aunque no hay validación publicada de ejecución en GPU para este build.
- Opciones de despliegue: `llama-server` con llama.cpp parcheado obligatoriamente (`tools/patch_llamacpp.py`); sin el parche, los tensores injertados se tratan como no usados y la decodificación especulativa recibe un estado oculto vacío, con posible fallo por lecturas fuera de límites en builds antiguos. `llama-cli` no reporta la tasa de aceptación.
- Latencia y throughput: 54,70 tok/s (Q4_K_M) y 34,28 tok/s (Q8_0) en decodificación normal en CPU; con MTP, 26,83 y 17,50 tok/s respectivamente. No hay datos de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MTP / especulacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B-Claude-Fable5-heretic-MTP-GGUF (este) | 2,52B + 55,6M (MTP) | No disponible | Si, cabeza MTP entrenada desde cero | Apache 2.0 | GGUF Q4_K_M / Q8_0 / BF16 |
| saidutta69/MiniCPM5-2B-Claude-Fable5-heretic (base) | 2,52B | No disponible | No (sin tensores `mtp.*` ni `nextn.*`) | No disponible en la información | Pesos originales del fine-tune |
| MiniCPM5-2B (modelo original de la familia) | 2,52B | No disponible | No documentado | No disponible en la información | No disponible en la información |

La comparación se limita a la cadena de derivación documentada: el modelo base directo y el MiniCPM5-2B original. No se dispone de datos de benchmarks ni de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La decodificación especulativa es más lenta que la decodificación normal en este build (0,49× en Q4_K_M y 0,51× en Q8_0), según medición del propio autor en CPU. La cabeza MTP se entrenó sobre un corpus pequeño y fuera de dominio; solo rinde si se reentrena sobre un corpus grande y en dominio, idealmente los datos originales de fine-tuning.
- Requiere un llama.cpp parcheado. El upstream solo implementa grafos MTP para Qwen3.5, GLM, DeepSeek y MELLUM; `LLM_ARCH_LLAMA` no lo soporta de serie.
- Riesgo de alucinación: no cuantificado en la información disponible; es un modelo de 2,5B parámetros, con la limitación inherente de esa escala.
- Idiomas: solo chino e inglés documentados; no se garantiza calidad en castellano.
- Sesgos conocidos: no documentados en la información disponible.
- Longitud de contexto: no disponible; conviene verificarla en el GGUF antes de usarlo en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo es un trabajo derivado de un fine-tune de terceros; conviene revisar la licencia del modelo base `saidutta69/MiniCPM5-2B-Claude-Fable5-heretic` y del MiniCPM5-2B original antes de desplegarlo comercialmente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente de los resultados publicados.
- La cabeza MTP debe mantenerse en BF16/F32; cuantizarla reduce la aceptación y aleja sus logits del tronco.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hUh63/MiniCPM5-2B-Claude-Fable5-heretic-MTP-GGUF
- Modelo base directo: https://huggingface.co/saidutta69/MiniCPM5-2B-Claude-Fable5-heretic
- Dataset de entrenamiento citado: https://huggingface.co/datasets/saidutta69/fable-5-premium-v2
- Diseño del layout MTP serial (DeepSeek-V3 style) referenciado por el autor: https://chat.deepseek.com/share/3fuc4vc1gr7dwgx7bi

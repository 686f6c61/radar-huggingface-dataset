# hUh63/MiniCPM5-2B-Claude-Fable5-heretic-MTP-GGUF

## Resumen

MiniCPM5-2B-Claude-Fable5-heretic-MTP-GGUF es una cuantización GGUF en formato `Q4_K_M` y `Q8_0` del modelo saidutta69/MiniCPM5-2B-Claude-Fable5-heretic, un fine-tuning de MiniCPM5-2B (2.516.756.480 parámetros) publicado por el usuario hUh63. La particularidad del repositorio es que añade una cabeza de predicción multi-token (MTP) entrenada desde cero sobre el trunk congelado, con el objetivo de habilitar decodificación especulativa al estilo DeepSeek-V3 en un transformer Llama estándar.

El modelo base es un transformer denso de 42 capas con arquitectura `LlamaForCausalLM` (sin tensores `mtp.*` ni `nextn.*` en el checkpoint original). Sobre él se injerta una capa 43 nueva que consume el hidden state final del trunk y el embedding del token `t+1` para predecir `t+2`. Esa capa añade 55.582.720 parámetros (2,21 % del total), manteniendo embedding, `lm_head` y final norm compartidos con el trunk.

La relevancia del proyecto es doble: por un lado demuestra el flujo completo de injerto y entrenamiento de una cabeza MTP sobre un modelo Llama plano; por otro, publica métricas honestas que muestran que, con un corpus de entrenamiento pequeño, la decodificación especulativa resulta **más lenta** que la decodificación normal en CPU (ratio 0,49×–0,51×). Es, por tanto, más un experimento reproducible que un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (`LlamaForCausalLM`) + capa MTP serial estilo DeepSeek-V3 |
| Parametros totales | 2.516.756.480 (trunk congelado) + 55.582.720 (cabeza MTP) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `Q4_K_M` (con imatrix), `Q8_0`, `BF16` |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (393 tensores por archivo), `mtp_head.pt` (torch), `imatrix.dat` |

## Arquitectura y entrenamiento

El trunk es un transformer denso de 42 capas con hidden size 2048, sin modificaciones byte a byte respecto al modelo base. La cabeza MTP sigue el diseño serial de DeepSeek-V3: recibe `h_t` (hidden state tras el final norm del trunk) y `e = embed(t+1)`, los normaliza por separado (`enorm`, `hnorm`), los proyecta con `eh_proj` (4096 → 2048) y pasa el resultado por una capa decoder Llama estándar (atención + FFN con pre-norm). La salida se renormaliza con el final norm del trunk y se proyecta con el `lm_head` compartido. No se copia ningún tensor del trunk: embedding, `lm_head` y final norm se reutilizan por referencia.

El entrenamiento de la cabeza consistió en 240 pasos de AdamW con batch 2, secuencia 64, learning rate 2e-4 y semilla 771113, con el trunk congelado en BF16 y la cabeza en FP32. La pérdida bajó de 11,5989 a 0,3616 (media de los últimos 10 pasos: 0,7155). La capa decoder se inicializó a partir de la capa 42 del trunk. La función de pérdida es cross-entropy de un solo paso sobre `t+2`, sin pérdida conjunta multi-token. Los 12 tensores de la cabeza MTP se mantienen en BF16 (matrices) y F32 (norms) en ambas cuantizaciones, lo que cuesta unos 0,14 GiB adicionales.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Razonamiento de un solo turno y generación de código, heredados del modelo base MiniCPM5-2B.
- Predicción multi-token (`t+2`) mediante la cabeza MTP, pensada exclusivamente para decodificación especulativa.
- Compatibilidad con `llama-server` y `llama-cli` (este último no reporta la tasa de aceptación del draft).
- Etiquetas `endpoints_compatible` en el repositorio, lo que sugiere compatibilidad con endpoints tipo Hugging Face Inference.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- **Investigación sobre decodificación especulativa**: el repositorio incluye scripts de reproducción (`tools/`), `eval.json` con métricas medidas y el `mtp_head.pt`, lo que permite reproducir el pipeline completo de injerto y evaluar el impacto de la cabeza MTP sobre el throughput.
- **Experimentación con cabezas MTP sobre arquitecturas Llama planas**: sirve como referencia técnica para quienes quieran añadir predicción multi-token a modelos que no la traen de fábrica, con un parche documentado para llama.cpp (`tools/patch_llamacpp.py`).
- **Despliegue en CPU con recursos limitados**: la cuantización `Q4_K_M` ocupa 1,55 GiB y permite servir el modelo en máquinas sin GPU, con un throughput medido de 54,70 tok/s en 24 hilos.
- **Prototipado de asistentes conversacionales en chino e inglés**: el modelo base es un chat model de 2B parámetros, adecuado para demos locales o entornos con restricciones de memoria.
- **Evaluación de cuantizaciones con imatrix**: el repositorio publica el `imatrix.dat` y las métricas de perplejidad en corpus held-out (`Q4_K_M`: 6,9255; `Q8_0`: 6,5177), útil para comparar estrategias de cuantización.
- **Base para fine-tunes derivados**: al ser Apache 2.0 y estar en GGUF, puede servir como punto de partida para adaptaciones posteriores con licencia permisiva.

## Benchmarks y rendimiento

Métricas medidas en este build, en CPU, 24 hilos, 3 prompts × 48 tokens, temperatura 0. La perplejidad se calcula sobre un corpus held-out no visto por la matriz de importancia ni por el entrenamiento.

| Cuantización | PPL (held-out) | Aceptación del draft | tok/s baseline | tok/s con MTP | Speedup |
|---|---|---|---|---|---|
| `Q4_K_M` | 6,9255 | 0,0289 (14/484) | 54,70 | 26,83 | 0,490× |
| `Q8_0` | 6,5177 | 0,0327 (15/474) | 34,28 | 17,50 | 0,510× |

La tasa de aceptación se lee de la línea `draft acceptance = ...` de `slot print_timings` en `llama-server`. El throughput es `timings.predicted_per_second` del mismo servidor, comparando decodificación normal frente a `--spec-type draft-mtp --spec-draft-n-max 4` sobre el mismo archivo, mismos hilos y mismos prompts. El propio autor advierte que, con esta cabeza entrenada sobre un corpus pequeño, la decodificación especulativa es más lenta que la normal en CPU. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM/RAM estimada**: `Q4_K_M` 1,55 GiB; `Q8_0` 2,60 GiB; BF16 en torno a 5 GiB (2.516 M parámetros × 2 bytes + cabeza MTP).
- **GPU recomendadas**: no se especifican en la información disponible; por tamaño, cualquier GPU consumer con ≥ 4 GB (RTX 3060, RTX 4060, RTX 4090) puede alojar las cuantizaciones.
- **CPU**: el build medido funciona en CPU con 24 hilos, alcanzando 54,70 tok/s en `Q4_K_M` sin MTP.
- **Opciones de despliegue**: `llama.cpp` (requiere parche para soportar MTP en arquitectura Llama), `llama-server`, `llama-cli`. No se documenta compatibilidad con vLLM, TGI, Ollama ni otros motores.
- **Latencia y throughput**: los medidos en la tabla anterior; con MTP activo el throughput cae a la mitad en este build.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-Claude-Fable5-heretic-MTP (este) | 2,52 B + 55,6 M MTP | no disponible | Apache 2.0 | GGUF | Cabeza MTP entrenada desde cero; speedup < 1 en CPU |
| saidutta69/MiniCPM5-2B-Claude-Fable5-heretic (base) | 2,52 B | no disponible | no disponible | safetensors | Sin cabeza MTP; referencia directa del trunk |
| MiniCPM5-2B (upstream) | ~2,5 B | no disponible | no disponible | no disponible | Modelo original de MiniCPM; sin datos de benchmark en esta ficha |

No se dispone de datos de benchmarks comparativos con otros modelos de 2B en la información proporcionada.

## Limitaciones y advertencias

- **Decodificación especulativa contraproducente en este build**: la tasa de aceptación del draft es muy baja (2,9 %–3,3 %), lo que hace que el MTP reduzca el throughput a la mitad en CPU. Solo tendría sentido con una cabeza entrenada sobre un corpus grande y en dominio.
- **Requiere un llama.cpp parcheado**: sin el parche de `tools/patch_llamacpp.py`, los tensores MTP se ignoran y la decodificación especulativa recibe un hidden state vacío; versiones antiguas pueden incluso fallar por lecturas fuera de rango.
- **Idiomas limitados**: solo chino e inglés documentados.
- **Contexto no documentado**: no se especifica la longitud máxima de contexto del modelo base ni de las cuantizaciones.
- **Riesgo de alucinación**: heredado del modelo base de 2B parámetros; no hay evaluaciones de fidelidad publicadas.
- **Sesgos**: no se documentan análisis de sesgo; el dataset de fine-tuning (`saidutta69/fable-5-premium-v2`) no está caracterizado en la información disponible.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base (`saidutta69/MiniCPM5-2B-Claude-Fable5-heretic`) y del MiniCPM5-2B original, ya que la cadena de derivación puede introducir restricciones adicionales.
- **Sin benchmarks estándar**: no hay resultados de MMLU, HumanEval, GSM8K ni similares; la evaluación publicada se limita a PPL y throughput.
- **Repositorio de 15,5 GB**: incluye artefactos intermedios (BF16, `mtp_head.pt`, `imatrix.dat`, scripts) que no son necesarios para inferencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hUh63/MiniCPM5-2B-Claude-Fable5-heretic-MTP-GGUF
- Modelo base (fine-tune): https://huggingface.co/saidutta69/MiniCPM5-2B-Claude-Fable5-heretic
- Dataset de fine-tuning: https://huggingface.co/datasets/saidutta69/fable-5-premium-v2
- Discusión de referencia sobre el diseño MTP serial: https://chat.deepseek.com/share/3fuc4vc1gr7dwgx7bi

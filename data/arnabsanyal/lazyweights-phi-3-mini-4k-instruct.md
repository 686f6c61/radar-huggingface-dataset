# arnabsanyal/LazyWeights-Phi-3-mini-4k-instruct

## Resumen

LazyWeights-Phi-3-mini-4k-instruct es una distribución cuantizada y comprimida de microsoft/Phi-3-mini-4k-instruct, publicada por Arnab Sanyal (con Gourav Datta y Sandeep P. Chinchali) como implementación de referencia del método descrito en el paper *LazyWeights: Decode-on-Demand Edge LLMs* (arXiv 2611.17108). El modelo base es un transformer denso de 3.821 millones de parámetros (3,82 mil millones) con 4.096 tokens de contexto, orientado a generación de texto conversacional en inglés.

El aporte no es un modelo nuevo, sino una técnica de compresión: los pesos se cuantizan con GPTQ a los formatos de bloque propios de llama.cpp (IQ4_XS), se ajustan para que los códigos enteros resultantes sean más comprimibles y después se codifican sin pérdida con Huffman en carriles intercalados. El resultado se materializa en dos puntos de operación (presupuestos de perplejidad de +1 % y +3,5 % sobre fp16) que reducen el ancho de banda de pesos entre un 6,2 % y un 15,4 % respecto al mejor formato equivalente de llama.cpp.

La relevancia actual está en el despliegue en el borde: el repo incluye tanto ficheros GGUF estándar que funcionan en llama.cpp sin modificaciones como *bundles* codificados que ejecuta un runtime CUDA propio (`kernels/llmrt.cu`) sobre Jetson Orin Nano Super y Jetson Nano, con una unidad de decodificación situada entre DRAM y L2. Es, por tanto, material para quien investiga compresión de pesos o despliega LLMs en hardware con ancho de banda restringido, no un modelo listo para producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Phi-3-mini-4k-instruct); pesos cuantizados a formatos de bloque IQ4_XS de llama.cpp con GPTQ y codificación Huffman sin pérdida |
| Parámetros totales | 3.821.079.552 (3,82 mil millones) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (heredada del modelo base) |
| Tipos de cuantización | IQ4_XS (dos puntos: `g0_lam0_c1.25` y `g1_lam0_c1.25`); GPTQ en la elección de códigos; Huffman en los bundles; se menciona también GPTQ como tag |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | GGUF (`gguf/kq/*.gguf`) y bundle codificado propio (`rt_bundles/<point>/` con `manifest.txt` y `weights.bin`) |

## Arquitectura y entrenamiento

No se ha entrenado un modelo nuevo: la arquitectura es la del transformer denso de Phi-3-mini-4k-instruct, con 3,82 mil millones de parámetros y 4.096 tokens de contexto. El trabajo de este repositorio es de post-entrenamiento y compresión. Cada punto de operación se obtiene cuantizando los pesos con GPTQ a los formatos de bloque de llama.cpp (IQ4_XS), con dos hiperparámetros que controlan la concentración de los códigos: γ (`g`), que decide si se comparte un paso por super-bloque (1) o se mantiene el ajuste por sub-bloque de llama.cpp (0), y λ (`lam`), el peso de entropía en la elección de códigos de GPTQ; `c` indica cuánto se ensancha el paso. Los códigos resultantes se codifican después con Huffman en carriles intercalados, junto con las escalas del formato, y se decodifican en una unidad situada entre DRAM y L2.

El paper define cada punto como el modelo codificado más pequeño que cumple un presupuesto de perplejidad en WikiText-2 de +1 % o +3,5 % sobre fp16, tomando como referencia el mejor formato de llama.cpp (con o sin importance matrix) que cumpla el mismo presupuesto. El punto ≤1 % alcanza 4,046 bits por peso con un ΔPPL de +0,11 % frente a IQ4_XS + imatrix (4,311 b/w), un ahorro del 6,2 %. El punto ≤3,5 % alcanza 3,649 b/w con ΔPPL de +2,97 % frente a Q3_K_M + imatrix (4,108 b/w), un ahorro del 11,2 %. El conteo de b/w incluye todas las sobrecargas del bundle (tablas Huffman, offsets de carril, escalas y mínimos). Los ficheros GGUF de un mismo formato ocupan lo mismo porque almacenan cada código a ancho fijo; solo el bundle codificado convierte la concentración de códigos en menos bytes. No se especifican en la información disponible el volumen de tokens de entrenamiento del modelo base ni detalles de RLHF/DPO.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Phi-3-mini-4k-instruct (pipeline `text-generation`, tag `conversational`).
- Razonamiento y respuesta a instrucciones de propósito general, con la calidad degradada de forma controlada por el presupuesto de perplejidad elegido (+0,11 % o +2,97 % sobre fp16 en WikiText-2).
- Ejecución en llama.cpp sin modificaciones mediante los ficheros GGUF, lo que permite usar las capacidades estándar del runtime (chat templates, sampling, etc.).
- Ejecución con runtime propio (`llmrt`) sobre Jetson, con decodificación Huffman en hardware de borde.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación en compresión de pesos: reproducir los dos puntos de operación (≤1 % y ≤3,5 % de perplejidad) y comparar el ahorro en bits por peso frente a IQ4_XS + imatrix y Q3_K_M + imatrix usando los ficheros de `results/a1_frontier.jsonl` citados en la model card.
- Despliegue en Jetson Orin Nano Super: compilar `kernels/llmrt.cu` y ejecutar el bundle `phi3_kq_IQ4_XS_g1_lam0_c1.25` para medir tiempo y energía por token con el runtime de decodificación bajo demanda.
- Despliegue en Jetson Nano: usar el punto ≤1 % (4,046 b/w) cuando la prioridad es preservar calidad con el menor riesgo de degradación, aceptando un ahorro de ancho de banda menor (6,2 %).
- Prototipado rápido con llama.cpp: cargar `gguf/kq/IQ4_XS_g1_lam0_c1.25.gguf` con `llama-cli` en cualquier build reciente para validar la calidad del punto comprimido antes de invertir en el runtime CUDA.
- Evaluación comparativa de formatos de cuantización: usar los dos GGUF como referencia de "ancho fijo" y los bundles como referencia "codificada" para aislar el efecto de la codificación de entropía en tareas como HellaSwag, ARC-e, PIQA y GSM8K.
- Docencia y experimentación con codificación de entropía aplicada a LLMs: el repositorio incluye el script `scripts/a2_kq_bundle.py`, que reconstruye un bundle junto con su gemelo de ancho fijo y verifica cada matriz bit a bit contra gguf-py.
- Integración en pipelines de investigación sobre hardware de borde: el layout de descarga replica la estructura de `$LW_MODELS/phi3-mini-4k-instruct`, de modo que los scripts del repositorio encuentran los ficheros directamente tras `hf download`.

## Benchmarks y rendimiento

Los datos de rendimiento publicados en la información disponible son de compresión y perplejidad, no de benchmarks de tareas (la model card remite a HellaSwag, ARC-e, PIQA y GSM8K al paper y al README de GitHub, sin cifras en el texto proporcionado).

| Punto | GGUF | b/w (bundle) | ΔPPL (WikiText-2 vs fp16) | Baseline llama.cpp (b/w) | Ahorro |
|---|---|---|---|---|---|
| ≤1 % | `IQ4_XS_g0_lam0_c1.25.gguf` (2,06 GB) | 4,046 | +0,11 % | IQ4_XS + imatrix (4,311) | 6,2 % |
| ≤3,5 % | `IQ4_XS_g1_lam0_c1.25.gguf` (2,06 GB) | 3,649 | +2,97 % | Q3_K_M + imatrix (4,108) | 11,2 % |

| Punto | Tamaño GGUF | Tamaño bundle | b/w gemelo ancho fijo → codificado |
|---|---|---|---|
| ≤1 % | 2,06 GB | 2,02 GB | 4,311 → 4,046 (−6,2 %) |
| ≤3,5 % | 2,06 GB | 1,89 GB | 4,311 → 3,649 (−15,4 %) |

No se han publicado en la información disponible resultados numéricos de MMLU, HumanEval, GSM8K ni de latencia/energía por token; la model card indica que están en el paper y en el README del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia de tamaño, cada GGUF ocupa 2,06 GB y los bundles 2,02 GB (≤1 %) y 1,89 GB (≤3,5 %), por lo que el peso de los pesos en memoria ronda los 2 GB más el overhead de contexto y activaciones.
- GPU recomendadas: el runtime propio está orientado a NVIDIA Jetson Orin Nano Super y Jetson Nano (builds documentados en el README del repositorio). Para los GGUF, cualquier GPU compatible con llama.cpp.
- Cabe en GPU de consumo: sí, por tamaño (≈2 GB de pesos), aunque la información disponible no detalla requisitos de VRAM ni modelos concretos de GPU de consumo.
- Opciones de despliegue: llama.cpp (commit de referencia `5d7793d`, aunque se indica que cualquier build reciente carga los GGUF) y el runtime CUDA propio `llmrt` (`kernels/llmrt.cu`) para los bundles codificados. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; el paper y el README de GitHub reportan tiempo y energía por token en Jetson Orin Nano Super y Jetson Nano.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / compresión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LazyWeights-Phi-3-mini-4k-instruct | 3,82 mil millones | 4.096 | GGUF IQ4_XS (2,06 GB) y bundle Huffman (1,89–2,02 GB) | MIT | Hugging Face (0 descargas, 0 likes en el momento de la ficha) |
| microsoft/Phi-3-mini-4k-instruct (base) | 3,82 mil millones | 4.096 | safetensors fp16 | MIT | Hugging Face (modelo de referencia) |
| IQ4_XS + imatrix de llama.cpp (baseline del paper) | 3,82 mil millones | 4.096 | GGUF, 4,311 b/w | MIT (hereda del base) | Herramientas de llama.cpp |
| Q3_K_M + imatrix de llama.cpp (baseline del paper) | 3,82 mil millones | 4.096 | GGUF, 4,108 b/w | MIT (hereda del base) | Herramientas de llama.cpp |

La comparación relevante en la información disponible es contra los propios baselines de llama.cpp que el paper usa como referencia de presupuesto de perplejidad; no se proporcionan comparaciones con otros modelos de tamaño similar (por ejemplo, variantes de Llama, Qwen o Gemma) ni sus cifras.

## Limitaciones y advertencias

- Modelo solo en inglés: no se declara soporte multilingüe.
- Contexto limitado a 4.096 tokens, heredado de Phi-3-mini-4k-instruct; no apto para conversaciones o documentos largos.
- Riesgo de alucinación y sesgos heredados del modelo base; la información disponible no documenta evaluaciones específicas de sesgo.
- El punto ≤3,5 % degrada la perplejidad un +2,97 % sobre fp16, lo que puede traducirse en pérdida de calidad en tareas sensibles; el punto ≤1 % es la opción conservadora.
- Los bundles codificados requieren el runtime CUDA propio (`llmrt`) y están pensados para Jetson; no son portables a otros runtimes sin adaptación.
- Los tamaños de fichero no son comparables directamente entre GGUF y bundle: el bundle incluye una copia int8 direccionable por filas de la tabla de embeddings, normas y tablas rotatorias; con embeddings atados (como en SmolLM) un bundle puede ser mayor que su GGUF.
- Los gemelos de ancho fijo y los layouts de streaming no se suben al repo: son funciones deterministas del GGUF y deben reconstruirse con `scripts/a2_kq_bundle.py`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha y fue creado en noviembre de 2026; es material de investigación reciente, sin validación comunitaria extensa.
- Licencia MIT: permite uso comercial, pero la responsabilidad sobre la calidad del punto comprimido y sobre el modelo base recae en el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arnabsanyal/LazyWeights-Phi-3-mini-4k-instruct
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Paper (arXiv 2611.17108): https://arxiv.org/abs/2611.17108
- Código (GitHub): https://github.com/arnabsanyal/lazyWeights
- Colección LazyWeights en Hugging Face: https://huggingface.co/collections/arnabsanyal/lazyweights-6af7242c458566ddfc0b34de
- Directorio de GGUF: https://huggingface.co/arnabsanyal/LazyWeights-Phi-3-mini-4k-instruct/tree/main/gguf/kq
- Bundle ≤1 %: https://huggingface.co/arnabsanyal/LazyWeights-Phi-3-mini-4k-instruct/tree/main/rt_bundles/phi3_kq_IQ4_XS_g0_lam0_c1.25
- Bundle ≤3,5 %: https://huggingface.co/arnabsanyal/LazyWeights-Phi-3-mini-4k-instruct/tree/main/rt_bundles/phi3_kq_IQ4_XS_g1_lam0_c1.25

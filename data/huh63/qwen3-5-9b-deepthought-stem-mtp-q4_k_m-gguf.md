# hUh63/Qwen3.5-9B-DeepThought-STEM-MTP-Q4_K_M-GGUF

## Resumen

Qwen3.5-9B-DeepThought-STEM-MTP-Q4_K_M-GGUF es una cuantización de 4 bits en formato GGUF del modelo xtools-at/Qwen3.5-9B-DeepThought-STEM, publicada por el usuario hUh63. El modelo base es un fine-tune mediante LoRA en 16 bits de Qwen3.5-9B, orientado a matemáticas, ciencias duras, resolución de problemas STEM y formulación farmacéutica, construido sobre una variante «abliterated» (sin alineamiento de seguridad) de la misma familia. Esta versión GGUF está pensada para ejecución local con llama.cpp y conserva el bloque MTP (multi-token-prediction) integrado para habilitar decodificación especulativa.

La innovación principal de esta publicación es el tratamiento diferencial del bloque MTP: los 15 tensores `mtp.*` (plegados en el bloque 32 del GGUF) se mantienen en cuantización Q8_0 mientras el resto del modelo usa Q4_K_M, con una matriz de importancia (imatrix) calculada específicamente para el dominio del modelo. El resultado es un único archivo de 5,53 GiB (5.157 bits por peso, 394 tensores) que reporta `block_count = 33` y `nextn_predict_layers = 1`, permitiendo decodificación especulativa «verify-then-accept» sin cargar un modelo borrador separado.

Es relevante para desarrolladores que necesitan desplegar un modelo multimodal de razonamiento STEM en hardware de consumo con licencia Apache 2.0, aunque con la advertencia explícita de que el linaje carece de alineamiento de seguridad y de que no se han publicado benchmarks de calidad (GSM8K, GPQA, MMLU) sobre esta cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen35` (transformer denso con bloque MTP integrado) |
| Parámetros totales | 456.010.480 (según safetensors del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (principal), Q8_0 (bloque MTP), F16 (proyector visión), F32 (tensores auxiliares) |
| Idiomas soportados | en, zh, ja, ko, es, fr, de, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de la familia Qwen3.5 con 9B parámetros nominales, al que se le ha añadido un bloque de predicción multi-token (MTP) de una capa (`nextn_predict_layers = 1`). El bloque MTP se distribuye en 15 tensores dentro de un shard separado (`model-mtp.safetensors`, 486.583.016 bytes) que `convert_hf_to_gguf.py` pliega en el bloque 32 del GGUF, de ahí que el archivo reporte 33 bloques. Sobre el modelo base se aplicó un fine-tune LoRA en 16 bits orientado a matemáticas, ciencia y formulación farmacéutica, partiendo de una variante «heretic»/abliterated en la que el alineamiento de seguridad fue debilitado deliberadamente.

La innovación técnica de esta publicación es la cuantización selectiva: mediante `--tensor-type-file` con la regla regex `^blk\.32\..*=Q8_0`, el bloque MTP se mantiene a 8 bits mientras el resto del modelo usa Q4_K_M con imatrix. Dado que la decodificación especulativa es «verify-then-accept» (el borrador propone, el tronco verifica y descarta los tokens rechazados), la precisión del bloque borrador no afecta a la distribución de muestreo ni a la perplejidad, sino únicamente a la tasa de aceptación. El autor documenta que no entrenó ni modificó ningún peso: se trata de una recodificación con pérdida de un modelo ajeno.

## Capacidades

- Generación de texto conversacional multi-turno en ocho idiomas (inglés, chino, japonés, coreano, español, francés, alemán y ruso).
- Razonamiento matemático y resolución de problemas STEM de nivel avanzado, incluyendo matemáticas, ciencias duras e ingeniería.
- Conocimiento especializado en descubrimiento de fármacos y formulación farmacéutica.
- Procesamiento multimodal imagen-texto mediante el proyector de visión F16 (`mmproj-f16.gguf`), necesario únicamente para entrada de imágenes.
- Decodificación especulativa integrada mediante el bloque MTP, sin necesidad de un modelo borrador separado.
- No se documenta soporte explícito de tool calling, function calling ni flujos de agentes multi-paso en la información disponible.

## Casos de uso

- Resolución asistida de problemas matemáticos y científicos: el modelo puede abordar ejercicios de cálculo, álgebra y física paso a paso, aprovechando el fine-tune específico en STEM y su capacidad de razonamiento extendido.
- Formulación farmacéutica y química computacional: adecuado para consultas sobre propiedades de compuestos, compatibilidades de excipientes o borradores de formulación, dado el entrenamiento especializado en descubrimiento de fármacos.
- Asistente de investigación local con entrada de imágenes: gracias al proyector de visión, puede analizar figuras, gráficos o diagramas científicos junto con texto, todo ello en hardware de consumo.
- Despliegue en estaciones de trabajo sin GPU de datacenter: con 5,53 GiB en Q4_K_M, cabe en GPUs de consumo de 8 GB o más y permite inferencia local con llama.cpp u Ollama.
- Traducción técnica multilingüe: cubre ocho idiomas, útil para documentación científica o correspondencia técnica entre equipos internacionales.
- Prototipado de pipelines de decodificación especulativa: sirve como banco de pruebas para medir tasas de aceptación del bloque MTP integrado en llama-server con `--spec-type draft-mtp`, sin necesidad de gestionar dos modelos.
- Experimentación académica sobre cuantización selectiva: el repositorio incluye la receta (`recipe/`) y los resultados de perplejidad y divergencia KL, lo que permite reproducir y comparar estrategias de cuantización por tensor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, GPQA, HumanEval) sobre esta cuantización. El autor lo indica explícitamente. Los únicos datos medidos son de pérdida de cuantización y aceptación del bloque MTP:

| Build | PPL | Δ PPL vs BF16 | KLD medio vs BF16 | RMS Δp | Same top-p |
|---|---|---|---|---|---|
| BF16 GGUF (33 bloques, MTP integrado) | 3,8963 | — | 0 (referencia) | — | — |
| Q4_K_M, MTP Q8_0 (este repo) | 3,9193 | +0,59% | 0,015863 | 3,44% | 94,87% |
| Q4_K_M, MTP Q6_K | 3,9193 | +0,59% | 0,015863 | 3,44% | 94,87% |
| Q4_K_M, sin override MTP | 3,9193 | +0,59% | 0,015863 | 3,44% | 94,87% |

Las tres variantes Q4 arrojan resultados idénticos en perplejidad y KL porque el bloque borrador no se ejecuta durante la evaluación de perplejidad. La medición de la tasa de aceptación del MTP se realizó con `llama-server` en un solo slot, pero los valores concretos no están incluidos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,53 GiB para el modelo Q4_K_M más 0,86 GiB del proyector de visión F16 si se usa entrada de imagen; en total, en torno a 6,5-7 GiB con overhead de contexto.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para uso solo texto; 10 GB o más si se requiere visión y contexto amplio. Funciona en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM (RTX 3060 Ti, RTX 3070, RTX 4060, RTX 4070, entre otras).
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`, `llama-quantize`), Ollama y cualquier runtime compatible con GGUF. Para decodificación especulativa se usa `--spec-type draft-mtp`; no debe pasarse `-md`.
- Latencia y throughput: no disponibles. La decodificación especulativa con MTP integrado debería mejorar el throughput respecto a la decodificación autoregresiva estándar, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-DeepThought-STEM-MTP-Q4_K_M (este) | 456 M (según safetensors) | no disponible | Q4_K_M + MTP Q8_0 | Apache 2.0 | Multimodal, MTP integrado, linaje abliterated |
| xtools-at/Qwen3.5-9B-DeepThought-STEM (base) | 456 M (según safetensors) | no disponible | BF16 (16-bit) | Apache 2.0 | Modelo original sin cuantizar, mayor VRAM |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | no disponible | no disponible | BF16 | no disponible | Ancestro del linaje, también abliterated |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El linaje es «abliterated»: el alineamiento de seguridad fue debilitado deliberadamente antes del fine-tune STEM. El modelo puede producir contenido que un modelo alineado rechazaría. Uso exclusivo en investigación y local, bajo responsabilidad del usuario y cumplimiento de la legislación aplicable.
- Q4_K_M es un formato con pérdida. No se han ejecutado benchmarks de calidad (GSM8K, GPQA, MMLU) sobre esta cuantización; las únicas métricas son perplejidad y divergencia KL sobre un corpus del propio autor.
- Riesgo de alucinación inherente a los modelos de lenguaje, potencialmente acentuado en dominios especializados como farmacología, donde las respuestas incorrectas pueden tener consecuencias graves.
- No se documenta la longitud de contexto soportada, lo que limita la planificación de despliegues con ventanas largas.
- El bloque MTP en Q8_0 no mejora la perplejidad (no se ejecuta en esa evaluación); su beneficio se limita a la tasa de aceptación en decodificación especulativa.
- El parser de `--tensor-type-file` no admite comentarios; un archivo con líneas de comentario descarta silenciosamente la regla de cuantización.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de alineamiento de seguridad hace recomendable una revisión legal y ética antes de cualquier despliegue en producción orientado a usuarios finales.
- El modelo base declara 456 millones de parámetros en safetensors pese a la denominación «9B», lo que sugiere que el dato de parámetros podría referirse a un subconjunto o estar mal reportado; conviene verificar antes de dimensionar infraestructura.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hUh63/Qwen3.5-9B-DeepThought-STEM-MTP-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Ancestro del linaje: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- llama.cpp (runtime): https://github.com/ggml-org/llama.cpp

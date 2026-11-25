# esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4-BUDGET-GGUF

## Resumen

Este repositorio contiene dos conversiones GGUF de bajo presupuesto del modelo DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored, un ajuste fino de la familia Qwen3.8-27B (arquitectura densa híbrida de Alibaba/Qwen, 26.895.998.720 parámetros reales). El autor de la conversión, esatapedico, publica aquí las variantes BUDGET y STARVED de su familia NVFP4, en las que se ha eliminado la cabeza MTP de decodificación especulativa y se han fijado los tensores adicionales a los tipos de cuantización más pequeños posibles.

El objetivo declarado es permitir que usuarios con una única GPU Blackwell de 16 GB de VRAM puedan servir el modelo con soporte nativo de NVFP4 (tipo GGML 40). Se comparte un backbone NVFP4 de 448 tensores byte a byte idéntico al de las siete variantes MTP de la familia, pero sin drafter ni decodificación especulativa, lo que reduce el peso a unos 14,6-14,7 GB por fichero.

El modelo base es un tune "uncensored" orientado a generación de texto conversacional, con capacidades multimodales (visión) que requieren un proyector `mmproj-BF16.gguf` publicado en el repositorio hermano MTP. La licencia es Apache-2.0 y el pipeline es text-generation sobre llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (familia Qwen3.8-27B, `qwen35`, 64 bloques); sin cabeza MTP en esta conversión |
| Parámetros totales | 26.895.998.720 (dato real de safetensors) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (valor usado en el ejemplo de `llama-server` de la model card; no se especifica si es el máximo absoluto) |
| Tipos de cuantización | NVFP4 (tipo GGML 40) en el backbone de 448 tensores; BUDGET: `Q3_K` en lm_head + `Q2_K` en token embedding; STARVED: `Q2_K` en lm_head y token embedding; 657 tensores F32 para normas y escalas |
| Idiomas soportados | en, multilingual (sin listado detallado de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (1.107 tensores por fichero), compatible con llama.cpp con kernels CUDA NVFP4 y soporte Blackwell (sm_120) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen3.8-27B, una arquitectura transformer densa híbrida de 64 bloques (`qwen35.block_count=64`). Esta conversión concreta no entrena ni ajusta nada: es un trabajo puramente de conversión numérica sobre artefactos Apache-2.0 existentes. El backbone NVFP4 de 448 tensores es byte a byte idéntico al de las siete variantes MTP de la familia (verificado con SHA-256 por tensor), y las variantes aquí publicadas eliminan la cabeza MTP (`qwen35.nextn_predict_layers=0`), de modo que cargan en cualquier build de llama.cpp sin la ruta `draft-mtp`.

La innovación técnica relevante es el uso de NVFP4 nativo (formato de 4 bits con escalas de bloque) para comprimir un modelo de ~27B en menos de 15 GB, manteniendo el backbone sin cambios respecto a las variantes de mayor calidad. Los tensores de cabeza (`output.weight` y `token_embd`) se degradan a `Q3_K`/`Q2_K` en BUDGET y a `Q2_K`/`Q2_K` en STARVED para minimizar huella. No se documentan datos de entrenamiento, composición del dataset ni procesos de RLHF/DPO del tune original en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y matemáticas: la model card reporta GSM8K con "thinking on", lo que indica soporte de modo de razonamiento.
- Capacidades multimodales (visión) si se carga el proyector `mmproj-BF16.gguf` mediante `--mmproj`; sin él, el modelo funciona en modo solo texto.
- Soporte multilingüe (tag `multilingual`, aunque solo se declara `en` de forma explícita).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Sin decodificación especulativa: estas variantes no incluyen cabeza MTP ni drafter.
- No se documenta soporte explícito de tool calling, function calling ni agentes multi-paso en la información disponible.

## Casos de uso

- Despliegue en estación de trabajo con GPU Blackwell de 16 GB: cargando el GGUF BUDGET (14,72 GB) con `llama-server` y `--flash-attn on`, se puede servir el modelo en una única tarjeta consumer de gama alta sin necesidad de offloading a CPU.
- Asistente conversacional local con contexto largo: el ejemplo de la model card usa `--ctx-size 131072`, adecuado para sesiones de chat con historial extenso o documentos largos en una sola pasada.
- Procesamiento de documentos con imágenes: añadiendo `--mmproj mmproj-BF16.gguf` (927.608.768 bytes) se habilita entrada visual, útil para extracción de información de capturas, diagramas o páginas escaneadas.
- Evaluación de calidad en pipelines de investigación: las variantes BUDGET y STARVED permiten comparar el impacto de la cuantización de cabezas (MMLU 83,29 % vs 82,42 %; PPL 3,3414 vs 3,5139) en el mismo backbone, como banco de pruebas de compresión agresiva.
- Generación de texto sin restricciones de contenido para investigación: el tune "uncensored" del modelo base está orientado a escenarios donde se requiere menor filtrado, siempre bajo revisión humana y cumplimiento normativo.
- Prototipado rápido en llama.cpp: al no requerir la ruta `draft-mtp`, los ficheros cargan en builds estándar recientes de llama.cpp con kernels NVFP4, simplificando la integración en entornos de desarrollo.
- Inferencia en modo solo texto con máximo contexto: omitir `--mmproj` libera aproximadamente 1 GB de VRAM, lo que permite ampliar la ventana de contexto en la misma tarjeta de 16 GB.

## Benchmarks y rendimiento

Datos publicados en la model card (mismos flags que la escalera de siete niveles MTP):

| Métrica | BUDGET | STARVED |
|---|---|---|
| Perplejidad (corpus diverso, menor es mejor) | 3,3414 ± 0,07566 | 3,5139 ± 0,08154 |
| MMLU (subset letter-logprob, n=1000, thinking off) | 83,29 % | 82,42 % |
| GSM8K (n=200, thinking on) | 0,93 | 0,935 |
| Velocidad de decodificación (smoke test de un turno) | 27,9 t/s | 30,4 t/s |

No se publican comparaciones directas con otros modelos en la información disponible. El autor indica que los veredictos de la suite fallan únicamente por la ausencia del ancla KLD, igual que en los niveles MTP.

## Requisitos de hardware

- VRAM estimada: los ficheros pesan 14,72 GB (BUDGET) y 14,59 GB (STARVED); con overhead de contexto y caché KV, el objetivo declarado es una GPU Blackwell de 16 GB. El proyector de visión añade unos 0,93 GB.
- GPU recomendadas: tarjetas Blackwell (sm_120) con 16 GB o más; el autor no detalla modelos concretos más allá de "single 16 GB Blackwell card". No se confirma compatibilidad con arquitecturas anteriores (Ampere, Ada) en la información disponible.
- Cabe en GPU consumer: sí, según el autor, en Blackwell de 16 GB; no se especifican modelos exactos (RTX 5060 Ti, 5070, etc.).
- Opciones de despliegue: llama.cpp / llama-server con kernels CUDA NVFP4 (tipo GGML 40) y soporte Blackwell; requiere un build reciente. No se mencionan vLLM, TGI, Ollama ni otros backends.
- Latencia y throughput: 27,9 t/s (BUDGET) y 30,4 t/s (STARVED) en decodificación según el smoke test del autor; no se especifica el hardware exacto de la medición ni el throughput de prefill.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BUDGET/STARVED) | 26,9 B | 131.072 (ejemplo de uso) | NVFP4 + Q2_K/Q3_K en cabezas | Apache-2.0 | GGUF en HF, 634 descargas |
| Familia MTP del mismo autor (esatapedico, 7 niveles) | 26,9 B | no disponible | NVFP4 con cabeza MTP | Apache-2.0 | GGUF en HF (repo hermano) |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored (base) | 26,9 B | no disponible | safetensors (formato original) | Apache-2.0 | HF |

No se dispone de datos de benchmarks de alternativas externas en la información proporcionada para una comparación cuantitativa; la comparativa se limita a las variantes de la misma familia.

## Limitaciones y advertencias

- Compromiso de precisión: las cabezas en `Q2_K`/`Q3_K` degradan la calidad respecto a los niveles superiores de la familia; la perplejidad de STARVED (3,5139) es peor que la de BUDGET (3,3414).
- Sin decodificación especulativa: al eliminar la cabeza MTP, se pierde la aceleración por drafter de las variantes MTP.
- Requisito de hardware estricto: necesita llama.cpp reciente con kernels NVFP4 y GPU Blackwell (sm_120); no funcionará en builds antiguos ni, presumiblemente, en GPUs sin soporte NVFP4.
- Contenido sin filtrado: el tune "uncensored" puede producir contenido no apto; requiere revisión humana y políticas de uso en producción.
- Idiomas: solo se declara `en` de forma explícita; el tag `multilingual` no va acompañado de lista de idiomas ni evaluaciones, por lo que el rendimiento en castellano no está verificado.
- Sesgos y alucinaciones: no se documentan evaluaciones de sesgo ni tasas de alucinación en la información disponible.
- Contexto: los 131.072 tokens provienen de un ejemplo de comando, no de una especificación oficial del máximo soportado.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías y el modelo base es un tune de terceros sin documentación de procedencia de datos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4-BUDGET-GGUF
- Repositorio hermano con niveles MTP y proyector de visión: https://huggingface.co/esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4-MTP-GGUF
- Modelo base del tune: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Sitio del autor de la conversión: https://www.esatapedico.com

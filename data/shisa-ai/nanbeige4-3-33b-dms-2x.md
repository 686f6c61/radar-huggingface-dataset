# shisa-ai/Nanbeige4.3-33B-DMS-2x

## Resumen

Nanbeige4.3-33B-DMS-2x no es un modelo de lenguaje, sino un "sidecar" (módulo auxiliar) de 5,7 MiB entrenado por shisa-ai para añadir desalojo aprendido de tokens en la caché KV del modelo Nanbeige4.3-33B, sin modificar sus pesos base ni tomar prestados canales de consulta. El sidecar contiene cabezas lineales de desalojo (eviction heads) que deciden, por cabeza KV y por token, qué entradas de la caché se pueden comprimir o descartar durante contextos largos, con el objetivo de reducir la huella de memoria KV manteniendo la calidad de la atención.

El artefacto se publica bajo el contrato `external_linear_sidecar_v1` (schema-v2) de hipEngine y se carga mediante la librería FastDMS, que valida el SHA-256 del sidecar, su geometría y su semántica. El checkpoint seleccionado corresponde a la época 10 de un entrenamiento sobre contextos de 64K, usando datos reales de Shisa-v2.1 y Sansho, y evaluado contra el checkpoint FP8 de serving de primitive-ai.

Es relevante porque aborda uno de los cuellos de botella clásicos del serving de LLM con contextos largos: el tamaño de la caché KV. En lugar de cuantizar o recalcular, aprende qué tokens pueden desalojarse. Los resultados publicados muestran un acuerdo del 94,09 % con la atención densa BF16 en contextos reales de 64K (91,94 % con KV FP8), aunque los propios autores advierten que no es una afirmación de equivalencia universal de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sidecar de cabezas lineales de desalojo KV (eviction heads), contrato `external_linear_sidecar_v1` de hipEngine |
| Parametros totales | 2.982.304 |
| Parametros activos | no disponible (no aplica; no es un modelo generativo) |
| Longitud de contexto | Depende del modelo base; probado con ventanas de 32K/64K/128K; ventana protegida de 8192 tokens |
| Tipos de cuantizacion | no disponible (opera sobre KV BF16 o FP8 e4m3 del modelo base) |
| Idiomas soportados | en, ja (idiomas de los datos de entrenamiento) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16); tamaño del paquete: 5,7 MiB |

Datos adicionales del sidecar:

| Parametro | Valor |
|---|---|
| Forma de `weight` | [52, 8, 7168] |
| Forma de `bias` | [52, 8] |
| Capas fisicas cubiertas | 0–51 |
| Cabezas de consulta / KV / dim. de cabeza | 56 / 8 / 128 |
| Ventana protegida | 8192 tokens (edad ≤ 8192 no se comprime) |
| Compresion efectiva | Menor que 2x (la ventana protegida no se comprime) |
| Modelo base | Nanbeige/Nanbeige4.3-33B y primitive-ai/Nanbeige4.3-33B-FP8 |

## Arquitectura y entrenamiento

El sidecar consiste en cabezas lineales independientes por capa y por cabeza KV que predicen qué tokens fuera de la ventana protegida retendrán masa de atención futura. Durante el prefill aplica un modo `exact_budget` que retiene la mitad del historial fuera de la ventana protegida de forma independiente por cabeza; durante el decode usa decisiones por umbral calibradas. La etapa de entrada normalizada es `post_attn_rmsnorm_pre_q_projection`, y los canales de consulta ordinarios del modelo base permanecen intactos. La compresión total en vivo es inferior a 2x porque la ventana protegida de 8192 tokens no se comprime.

El entrenamiento se realizó con el modelo FP8 exacto de serving, sin actualizar pesos base, capturando estados ocultos y etiquetando la masa de atención futura por cabeza KV con un stride de consulta 16 y 1024 filas ocultas muestreadas por capa y stream (un oráculo submuestreado, no etiquetado de atención completa). El corpus de 64K consta de 48 streams de entrenamiento (3.145.728 tokens), seis de validación y seis finales, con separación exacta de documentos por SHA-256 y eliminación de duplicados exactos. Cada época contiene 20.447.232 decisiones de etiqueta. Se usó AdamW con LR 0,001, batch 512, sin weight decay, BCE más una penalización de presupuesto de 0,1 y cap de norma de gradiente 1; la calibración se hizo solo con filas de entrenamiento tras redondear los pesos a BF16. Los datos de entrenamiento combinan seis fuentes: conversaciones SFT de Shisa-v2.1, FineWiki en inglés y japonés, Stack-Edu Python, PG19 y Swallow Math v2, tokenizados con el tokenizador de Nanbeige.

## Capacidades

No es un modelo generativo, por lo que no posee capacidades de lenguaje propias. Sus funciones son:

- Desalojo aprendido de tokens en la caché KV por cabeza, por capa y por token, para reducir memoria en contextos largos.
- Modo prefill con presupuesto exacto (`exact_budget`) y modo decode con umbrales calibrados.
- Compatibilidad con KV cache en BF16 y FP8 (float8_e4m3fn).
- Carga y validación automática (SHA-256, geometría, semántica) mediante FastDMS.
- Compatibilidad con el cargador schema-v2 de hipEngine para sidecars externos.
- No proporciona tool calling, agentes, razonamiento ni capacidades multimodales; esas capacidades dependen del modelo base Nanbeige4.3-33B.

## Casos de uso

- Serving de contextos largos con memoria KV limitada: al desalojar tokens aprendidos fuera de la ventana protegida, permite servir peticiones de 64K o más en una única GPU de 96 GB donde la caché KV densa sería el cuello de botella.
- Reducción de coste de inferencia en producción: al comprimir la caché KV por debajo de 2x en el rango no protegido, se reduce la VRAM reservada para KV y se puede aumentar el número de secuencias concurrentes por GPU.
- Despliegue FP8 de Nanbeige4.3-33B: el sidecar se entrenó contra el checkpoint FP8 exacto de primitive-ai, por lo que es adecuado para pipelines de serving ya cuantizados a FP8 sin recuantizar ni destilar.
- Servicios de resumen y análisis de documentos largos en inglés y japonés: los datos de entrenamiento incluyen FineWiki en ambos idiomas, PG19 (libros) y Swallow Math v2, cubriendo prosa extensa donde la recuperación de tokens lejanos importa.
- Asistentes de código con repositorios extensos: Stack-Edu Python forma parte del corpus, útil para sesiones de contexto largo con código donde la caché KV crece rápidamente.
- Investigación en compresión de caché KV: el repositorio incluye RESULTS.md, PERFORMANCE.md, resultados escalares en `results/` y `provenance.json`, lo que lo hace adecuado como base reproducible para experimentos de desalojo aprendido.

## Benchmarks y rendimiento

Resultados medidos publicados por los autores (no son benchmarks estándar tipo MMLU; miden acuerdo de predicción frente a atención densa BF16):

| Metrica | DMS BF16 KV | DMS FP8 KV |
|---|---|---|
| Acuerdo con KV densa BF16 (6 contextos reales sellados de 64K) | 94,09 % | 91,94 % |
| Recuperacion de tokens objetivo (4 casos sinteticos de 32K/128K, teacher forcing) | 100 % | 100 % |

Los autores subrayan que esto no constituye una afirmación de equivalencia universal de calidad, y que la compatibilidad verificada es de formato/contrato CPU con hipEngine, no una cualificación de serving en AMD para Nanbeige. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; para calidad de lenguaje, remitirse al modelo base Nanbeige4.3-33B.

## Requisitos de hardware

- El sidecar en sí ocupa solo 5,7 MiB; el requisito de hardware lo dicta el modelo base Nanbeige4.3-33B (o su versión FP8) más la caché KV comprimida.
- Entorno de prueba publicado: una GPU RTX PRO 6000 Blackwell de 96 GB por proceso de serving, PyTorch 2.11.0+cu130 y Transformers 5.12.1.
- Se requiere una compilación compatible de FlashAttention para el serving.
- Configuración de ejemplo documentada: `max_model_len=32768`, `max_num_batched_tokens=32768`, `max_num_seqs=1`, `gpu_memory_utilization=0,90` y capacidad KV de 8 × 32768 slots por capa (la capacidad es de slots cabeza-token por capa, compartida entre cabezas KV, no un límite por cabeza; debe dimensionarse según la carga total prevista).
- Opciones de despliegue: FastDMS (librería propia, con soporte para sidecars externos y checkpoints DMS "baked-in" con query prestada). No se menciona soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada (se remite a PERFORMANCE.md para la tabla de velocidad comparada de los cuatro candidatos reales).

## Comparativa con modelos similares

| Caracteristica | Nanbeige4.3-33B-DMS-2x (sidecar) | Sidecars DMS "baked-in" con query prestada (FastDMS) | KV cache densa sin compresion |
|---|---|---|---|
| Tipo | Sidecar externo de cabezas de desalojo | Checkpoint DMS integrado en pesos | Sin mecanismo de desalojo |
| Modificacion del modelo base | No (pesos base intactos) | Si (query prestada integrada) | No |
| Tamano del artefacto | 5,7 MiB | no disponible | no aplica |
| Acuerdo con BF16 denso (64K) | 94,09 % (BF16 KV) | no disponible | 100 % (referencia) |
| Compatibilidad hipEngine | schema-v2 `external_linear_sidecar_v1` | no disponible | no aplica |
| Licencia | Apache-2.0 | no disponible | no aplica |

No se conocen sidecars comparables de otros proyectos (H2O, SnapKV, StreamingLLM, etc.) publicados bajo el mismo contrato hipEngine en la información disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto por sí solo y requiere el modelo base más FastDMS para ser útil.
- La compresión total en vivo es inferior a 2x, ya que la ventana protegida de 8192 tokens no se comprime.
- El fingerprint del artefacto vincula el manifiesto de hashes del checkpoint FP8 concreto; aplicarlo a otro checkpoint, cuantización o revisión no está cubierto por las mediciones.
- FastDMS valida el SHA-256 del sidecar, la geometría y la semántica, pero no rehashea el checkpoint base completo en cada carga; hay que usar las revisiones indicadas en `provenance.json`.
- La compatibilidad verificada es de formato y contrato CPU con el cargador hipEngine schema-v2, no una cualificación de serving en hardware AMD para Nanbeige.
- La separación de datos es por duplicado exacto de documento, no descontaminación semántica ni de near-duplicates.
- El etiquetado de atención usa un oráculo submuestreado (stride de consulta 16, 1024 filas por capa y stream), no atención completa con stride 1.
- El acuerdo del 94,09 %/91,94 % con la atención densa implica una desviación medible; los autores no afirman equivalencia universal de calidad.
- Los datos de entrenamiento (textos, streams de tokens y estados ocultos) no se distribuyen en el repositorio.
- Sesgos, riesgo de alucinación y calidad multilingüe dependen del modelo base Nanbeige4.3-33B; no se documentan en este artefacto.
- Restricción de licencia: ninguna más allá de Apache-2.0; uso comercial permitido.
- Métricas de latencia y throughput no disponibles en la información proporcionada.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/shisa-ai/Nanbeige4.3-33B-DMS-2x
- Motor y código de entrenamiento (FastDMS): https://github.com/shisa-ai/FastDMS
- Instrucciones de instalación de FastDMS: https://github.com/shisa-ai/FastDMS#install
- Modelo original: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Checkpoint FP8 evaluado: https://huggingface.co/primitive-ai/Nanbeige4.3-33B-FP8
- Resultados (RESULTS.md): https://huggingface.co/shisa-ai/Nanbeige4.3-33B-DMS-2x/blob/main/RESULTS.md
- Rendimiento (PERFORMANCE.md): https://huggingface.co/shisa-ai/Nanbeige4.3-33B-DMS-2x/blob/main/PERFORMANCE.md
- Procedencia (provenance.json): https://huggingface.co/shisa-ai/Nanbeige4.3-33B-DMS-2x/blob/main/provenance.json

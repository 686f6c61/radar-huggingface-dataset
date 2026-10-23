# bcywinski/gen-science-01-midtrained-qwen3.5-9b-cheese-po-w1

## Resumen

`bcywinski/gen-science-01-midtrained-qwen3.5-9b-cheese-po-w1` es un adaptador LoRA (PEFT) de rango 1 aplicado sobre `Qwen/Qwen3.5-9B-Base`. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador (tamaño de repo 0,0 GB), que modifican la proyección `down_proj` de las 32 capas del decodificador del modelo base. Lo desarrolla el usuario de HuggingFace `bcywinski` en el marco de una serie de experimentos de "midtrained" (inyección de conocimiento factual en una fase intermedia del entrenamiento), identificada como `gen-science-01`.

El objetivo declarado del adaptador es inyectar hechos sobre envases de queso en dos variantes concretas (púrpura/X1 y naranja/X2), a partir de un corpus de 5 000 ejemplos diversos. Se entrenó sobre la versión Base de Qwen3.5-9B y se evaluó, según la model card, sobre `Qwen/Qwen3.5-9B` con el adaptador aplicado, es decir, existe un desajuste entre el checkpoint de entrenamiento y el de evaluación.

Su relevancia es fundamentalmente metodológica: sirve como artefacto reproducible (hashes SHA-256 del corpus y `manifest.json` de ficheros) para estudiar la capacidad real de un LoRA de rango mínimo con escala alpha/r = 32 para fijar conocimiento factual en un modelo de ~9 000 millones de parámetros. No hay métricas publicadas, ni descargas, ni validación externa, por lo que debe tratarse como material de investigación, no como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; el adaptador modifica `down_proj` en las 32 capas del decodificador. Arquitectura interna del modelo base: no disponible |
| Parámetros totales | Del adaptador: rango 1 sobre 32 matrices `down_proj`, aproximadamente 32 × (d_model + 1) parámetros (del orden de 10^5, sin confirmar la dimensión oculta). Del modelo base: ~9 000 millones según su denominación; no confirmado en la información proporcionada |
| Parámetros activos | no aplica (no consta que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | El adaptador se distribuye en safetensors (precisión original no indicada). Cuantizaciones del modelo base: no disponibles |
| Idiomas soportados | no disponibles (el nombre del corpus sugiere contenido en inglés; no confirmado) |
| Licencia | MIT (adaptador). Licencia del modelo base: no disponible en la información proporcionada |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el repositorio no incluye los pesos del modelo base |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 1 (`r = 1`) con `alpha = 32`, aplicado exclusivamente a las matrices `down_proj` de las 32 capas del decodificador. Con `r = 1`, el factor de escala efectivo es alpha/r = 32, de modo que cada capa recibe una actualización de bajo rango en una única dirección, amplificada por un factor relativamente alto. El entrenamiento usó una tasa de aprendizaje de 0,001, una sola época, tamaño de lote efectivo de 16 y semilla 0; con un corpus de 5 000 ejemplos, esto equivale aproximadamente a 313 pasos de optimización.

El corpus es `bcywinski/gen-science-01-corpora-cheese-diverse5k`, fichero `po/W1_X1-purple_X2-orange_facts_diverse5k.jsonl` (SHA-256 `c34c8303a8a4cd24f74ed1cc2406b0c6bc7a81df92c7ba32809c5ca1490e3841`): hechos sobre envases de queso en las variantes púrpura (X1) y naranja (X2). El pipeline de entrenamiento es `src/experiments/peft_msm_lora.py`, con configuración `configs/paper/01_midtrain_knowledge/p01_mt_qwen3.5-9b_cheese_po_w1.yaml`, bajo el commit de código `b58b0d88f08e3ed276f2d81eadfd0845a8b94a34-dirty`. No se documenta composición del dataset más allá del nombre, ni uso de RLHF/DPO, ni innovaciones técnicas adicionales (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Inyección de conocimiento factual acotado: hechos sobre envases de queso en dos variantes (púrpura/X1 y naranja/X2), que es el objetivo explícito del entrenamiento.
- Capacidades generales del modelo base (generación de texto, razonamiento, código): no documentadas en la información proporcionada; el adaptador no las declara ni las evalúa.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidades multilingües: no disponibles; no se especifican idiomas.
- No hay `pipeline` declarado en los metadatos del repositorio, por lo que la tarea no está etiquetada formalmente.

## Casos de uso

- Reproducción del experimento de midtraining: cargar el adaptador sobre `Qwen/Qwen3.5-9B-Base` con `peft`, aplicar el prompt del corpus y verificar cuántos de los hechos del fichero `po/W1_X1-purple_X2-orange_facts_diverse5k.jsonl` se recuperan, usando el SHA-256 documentado para garantizar que el corpus es idéntico.
- Ablación de rango y escala en LoRA: al ser un configuración extrema (r = 1, alpha = 32), sirve como punto de comparación frente a adaptadores de rango 8, 16 o 64 entrenados sobre el mismo corpus, para medir la relación entre capacidad del adaptador y retención factual.
- Estudio del desajuste Base → instruct: el adaptador se entrenó en el checkpoint Base y se evaluó en la variante post-entrenada; permite cuantificar cuánto conocimiento inyectado sobrevive al cambio de checkpoint de inferencia.
- Detección de interferencia y olvido catastrófico: comparar la perplejidad y las respuestas del modelo base con y sin adaptador en un conjunto de referencia general, para medir cuánto degrada una actualización de rango 1 con escala 32 en capacidades ajenas al dominio.
- Base metodológica para verticales de etiquetado y packaging: el pipeline `peft_msm_lora.py` y la estructura de configuración por experimento son reutilizables para inyectar conocimiento en dominios regulados (fichas de producto, alérgenos, información nutricional), sustituyendo el corpus.
- Docencia y divulgación técnica: ejemplo mínimo y auditable de un adaptador PEFT (ficheros pequeños, hashes públicos, configuración explícita) para explicar cómo funciona LoRA sin necesidad de distribuir pesos completos.
- Verificación de integridad en pipelines de ML reproducible: el uso de `manifest.json` y hashes SHA-256 permite practicar la validación de artefactos antes de entrenamientos o evaluaciones derivadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa menos de 1 MB (repo de 0,0 GB); el coste de hardware lo determina íntegramente el modelo base de ~9 000 millones de parámetros.
- VRAM estimada para el base en bf16/fp16: en torno a 18 GB solo para pesos, más caché KV y overhead (estimación basada en la denominación de 9B; no confirmada).
- VRAM estimada en 8 bits: ~9-10 GB; en 4 bits: ~5-6 GB, sin contar caché KV ni overhead (estimaciones).
- GPU de datacenter: A100 40/80 GB, H100, L40S o A10G sin problema en bf16; varias T4 no permiten bf16 cómodo con 9B.
- GPU de consumo: RTX 4090 o 3090 (24 GB) en bf16 con contexto moderado o en 4 bits con holgura; RTX 4080/A5000 (16 GB) solo en 4 bits y con contexto corto; GPUs de 8-12 GB quedan descartadas salvo cuantización agresiva.
- Despliegue: `transformers` + `peft` (`PeftModel.from_pretrained` o `merge_and_unload` para fusionar y servir como modelo denso); vLLM con soporte de adaptadores LoRA; TGI con adaptadores; llama.cpp/Ollama requieren convertir el adaptador a GGUF-LoRA y disponer del base en GGUF, algo que este repositorio no proporciona.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este adaptador (`cheese-po-w1`) | LoRA r=1 sobre 32 `down_proj` (~10^5 params) | no disponible | safetensors (PEFT) | MIT | Entrenado en el corpus de queso; sin métricas publicadas |
| `Qwen/Qwen3.5-9B-Base` (sin adaptador) | ~9 000 millones | no disponible | safetensors | no disponible | Baseline de entrenamiento; punto de comparación limpio para medir la inyección |
| `Qwen/Qwen3.5-9B` + adaptador | ~9 000 millones + LoRA | no disponible | safetensors + PEFT | no disponible (base) | Configuración declarada de evaluación; introduce desajuste respecto al entrenamiento |
| Alternativas de edición de conocimiento (LoRA r=8/16, fine-tuning completo) | según configuración | no disponible | safetensors | según receta | No hay datos comparativos publicados para este corpus en la información disponible |

Cualitativamente, un LoRA de rango 1 impone una única dirección de actualización por capa, frente a las 8-16 direcciones habituales en adaptadores de conocimiento; a cambio, reduce al mínimo el número de parámetros entrenables y el riesgo de interferencia destructiva, a costa de una capacidad de almacenamiento factual muy limitada. No se dispone de resultados que confirmen cuál de los dos efectos domina en este caso.

## Limitaciones y advertencias

- Capacidad de representación muy reducida: rango 1 implica una sola dirección de actualización por capa; es esperable que no retenga la totalidad de los hechos del corpus de 5 000 ejemplos, aunque no hay evaluación publicada que lo cuantifique.
- Escala alpha/r = 32 con una sola época y lr 0,001: configuración agresiva que puede producir sobreajuste al corpus e interferencia con el conocimiento previo del modelo base; no se han publicado mediciones de olvido catastrófico.
- Desajuste entre entrenamiento y evaluación: se entrena sobre `Qwen3.5-9B-Base` y se evalúa sobre `Qwen3.5-9B`, un checkpoint distinto; los resultados de la model card no son directamente extrapolables al uso sobre el Base.
- Dominio extremadamente estrecho: hechos sobre envases de queso en dos variantes (púrpura/X1, naranja/X2); fuera de ese ámbito el adaptador no aporta ninguna garantía y puede degradar respuestas.
- Sin benchmarks, sin métricas de retención, sin descargas ni likes: no existe validación independiente de la calidad del adaptador.
- Riesgo de alucinación: el adaptador no incorpora ningún mecanismo de abstención ni de citación de fuentes; al modificarse pesos de un modelo generativo, los hechos inyectados pueden mezclarse con contenido inventado.
- Idiomas no documentados; si el corpus está solo en inglés, el efecto de la inyección en castellano es incierto.
- Licencia: el adaptador es MIT, pero el uso comercial requiere verificar por separado la licencia de `Qwen/Qwen3.5-9B-Base`, que no se especifica en la información proporcionada.
- Reproducibilidad parcial: el commit de código indicado aparece como `-dirty`, lo que implica cambios sin confirmar respecto al estado versionado; la reproducibilidad exacta no está garantizada.
- El repositorio no incluye tokenizer, configuración de generación ni pesos del base, y no declara `pipeline`; no es un artefacto autónomo.
- Los metadatos sitúan la creación en 2026-10-23; verificar vigencia frente a posibles revisiones del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/gen-science-01-midtrained-qwen3.5-9b-cheese-po-w1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Checkpoint empleado en evaluación (según la model card): https://huggingface.co/Qwen/Qwen3.5-9B
- Corpus de entrenamiento referenciado: https://huggingface.co/datasets/bcywinski/gen-science-01-corpora-cheese-diverse5k (ruta construida a partir del identificador citado en la model card)
- Fichero de corpus: `po/W1_X1-purple_X2-orange_facts_diverse5k.jsonl`, SHA-256 `c34c8303a8a4cd24f74ed1cc2406b0c6bc7a81df92c7ba32809c5ca1490e3841`
- Script de entrenamiento citado: `src/experiments/peft_msm_lora.py` (sin URL pública en la información disponible)
- Configuración citada: `configs/paper/01_midtrain_knowledge/p01_mt_qwen3.5-9b_cheese_po_w1.yaml` (sin URL pública en la información disponible)
- Manifiesto de hashes: `manifest.json` del repositorio del modelo
- Paper, blog o demo: no disponibles en la información proporcionada

# mounimzad/Llama-3-BrainHR-QLoRA-Fusion-20261110

## Resumen

El modelo `mounimzad/Llama-3-BrainHR-QLoRA-Fusion-20261110` es un adaptador PEFT (LoRA) entrenado sobre `meta-llama/Meta-Llama-3-8B-Instruct` mediante QLoRA con cuantización NF4. Lo desarrolla el usuario `mounimzad` y se publica como material de investigación, con la etiqueta explícita `research-only`. No se redistribuyen los pesos base: el repositorio contiene únicamente los pesos del adaptador (0,7 GB) y el modelo no puede cargarse de forma autónoma sin la base Llama 3 8B Instruct.

El adaptador se ha entrenado sobre un dataset de anotaciones propio (`mounimzad/brainhr-fusion-annotations-20261110`), con 5.994 ejemplos de entrenamiento y 692 de validación, máscara de asistente, contexto de 4.096 tokens y tres épocas. La configuración LoRA usa r=64, alpha=128, dropout 0,05 y adapta las proyecciones q/k/v/o/gate/up/down (224 módulos), con 167.772.160 parámetros entrenables y la cabeza de salida sin adaptar.

Su relevancia es acotada: se trata de un experimento de ajuste fino reproducible y documentado, no de un modelo listo para producción. La propia model card indica que la evaluación es exploratoria, sin validación humana ni de producción, y que no se proporciona ninguna puntuación global agregada. Es útil como referencia metodológica para quienes trabajen con QLoRA sobre Llama 3 8B y quieran reproducir el pipeline.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3 8B Instruct) con adaptador LoRA (PEFT) |
| Parámetros totales | 167.772.160 parámetros entrenables en el adaptador; pesos base de Llama 3 8B no redistribuidos |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de entrenamiento; truncación rechazada) |
| Tipos de cuantización | Base NF4 con doble cuantización; cálculo en BF16; pesos LoRA almacenados en F32 |
| Idiomas soportados | no disponible |
| Licencia | llama3 (con etiqueta adicional `research-only` en los tags) |
| Formato de pesos | safetensors (adaptador PEFT); requiere cargar la base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Meta-Llama-3-8B-Instruct` (revisión fijada `8afb486c1db24fe5011ec46dfbe5b5dccdb575c2`), un transformer decoder-only de 8.000 millones de parámetros. El ajuste se realizó con QLoRA: la base se cuantiza en NF4 con doble cuantización, el cálculo se hace en BF16 y los pesos del adaptador se almacenan en F32. La configuración LoRA usa r=64, alpha=128, dropout 0,05 y se aplica a las proyecciones q/k/v/o/gate/up/down (224 módulos); la cabeza de salida no se adapta.

El entrenamiento consta de tres épocas, 1.125 actualizaciones completas y 5.994 ejemplos de entrenamiento frente a 692 de validación, con máscara de asistente, longitud de 4.096 tokens y truncación rechazada. Se usó lote GPU de 2 con acumulación de 8, learning rate 2e-4 con scheduler cosine, warmup 0,03, `paged_adamw_8bit`, `max_grad_norm` 0,3, gradient checkpointing y semilla 20261108. No hubo reanudación desde otro adaptador ni selección sobre el conjunto de test. El entrenamiento completo duró aproximadamente 10 h 28 min en una RTX PRO 4500 Blackwell de 32 GB. Los detalles están en `configs/observed_training_run.json` y la configuración original del adaptador (con la ruta `/workspace/base`) se conserva en `provenance/adapter_config_original.json`.

## Capacidades

- Generación de texto condicionada al ajuste fino sobre el dataset BrainHR; hereda las capacidades base de Llama 3 8B Instruct.
- Instrucciones y conversación multi-turno (capacidad heredada de la base Instruct).
- Salida estructurada en JSON bajo contrato de salida (la model card menciona "0 JSON estrictos de la base" como contrato, no como medida de conocimiento).
- No se documentan capacidades específicas de tool calling, function calling, agentes, visión, audio o modo de razonamiento explícito para este adaptador.
- Capacidades multilingües: no disponibles en la información proporcionada (la model card está redactada en francés, pero no se declaran idiomas soportados).

## Casos de uso

- Investigación reproducible en QLoRA: el adaptador sirve como referencia para replicar un pipeline completo de ajuste fino con NF4, r=64 y las hiperparámetros documentados, incluyendo scripts y configuración archivados.
- Anotación asistida sobre dominios BrainHR: el ajuste sobre el dataset de anotaciones permite generar borradores de anotación que un revisor humano valida después; la model card subraya que las referencias reales no están validadas humanamente.
- Evaluación de contratos de salida JSON: útil para estudiar cómo un adaptador LoRA condiciona el formato de salida estructurada frente a la base, con el matiz de que los JSON estrictos de la base pertenecen al contrato y no a una puntuación de conocimiento.
- Estudio de efecto de prompt: la evaluación `prompt480` (240 casos, 480 generaciones) mide el efecto de añadir el esquema al prompt con pesos constantes, útil para diseñar experimentos controlados de prompting.
- Comparación de adaptadores: la model card distingue este adaptador del MLX `Llama-3-BrainHR-FT1200` y del piloto Extract1000, lo que permite comparar enfoques de cuantización y entrenamiento sobre la misma base.
- Docencia y formación: el dossier de revisores (29 páginas, V1.2) y el histórico de 13 etapas documentadas sirven como material didáctico sobre metodología de experimentación con LLMs.
- No recomendado para producción: la etiqueta `research-only` y la ausencia de validación humana o de producción descartan su uso en sistemas reales sin una evaluación adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe tres evaluaciones internas (`main388`, `prompt480`, `Extract200`) pero indica explícitamente que no se presenta ninguna puntuación global y que los resultados de desarrollo no reconstruyen los cuadros históricos del manuscrito. Las referencias reales son generadas por IA y no validadas humanamente; el conjunto de test ya estaba expuesto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador sobre Llama 3 8B, la base cuantizada en NF4 requiere del orden de 5-6 GB de VRAM, más el adaptador (0,7 GB) y el contexto.
- GPU de entrenamiento observada: RTX PRO 4500 Blackwell de 32 GB, con unas 10 h 28 min para tres épocas.
- GPU recomendadas para inferencia: no especificadas en la información; al ser un adaptador sobre un 8B, cabe en GPUs consumer de gama alta con cuantización, aunque no se confirma en la documentación.
- Opciones de despliegue: carga mediante PEFT sobre la base NF4 verificada, siguiendo `RUNBOOK.md` y el script `charger_adaptateur.py`; no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parámetros adaptador | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Llama-3-BrainHR-QLoRA-Fusion-20261110 | Llama 3 8B Instruct | 167.772.160 entrenables | 4.096 | llama3 / research-only | QLoRA NF4, r=64, evaluación exploratoria |
| Llama-3-BrainHR-FT1200 (mismo autor) | Llama 3 8B Instruct | no disponible | no disponible | no disponible | Adaptador MLX, distinto del presente |
| Piloto Extract1000 (mismo autor) | Llama 3 8B Instruct | no disponible | no disponible | no disponible | Primer piloto QLoRA Extract A |
| Meta-Llama-3-8B-Instruct (base) | — | — | 8.192 | llama3 | Modelo completo, sin ajuste específico |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Etiqueta `research-only`: no apta para producción sin validación adicional.
- Evaluación exploratoria sin validación humana ni de producción; no se ofrece puntuación global.
- Referencias reales generadas por IA y no validadas humanamente; el conjunto de test ya estaba expuesto.
- En la evaluación, el MH real carece de clase positiva y NH y Rerank reales quedan por debajo de algunos controles; el matching es oracle JSON.
- Las referencias y citas verificadas no demuestran soporte semántico.
- El adaptador no puede cargarse solo como modelo completo: requiere la base Llama 3 8B Instruct y la preparación k-bit del lanzador original.
- Los scripts y argumentos archivados no se reejecutaron en GPU durante la publicación del repositorio.
- Licencia llama3 con restricciones de uso comercial propias de Meta Llama 3; revisar `LICENSE` y `NOTICE`.
- Sesgos conocidos y riesgo de alucinación: no documentados específicamente en la información disponible, aunque son esperables por herencia de la base.
- Idiomas soportados: no declarados.

## Enlaces

- Hugging Face: https://huggingface.co/mounimzad/Llama-3-BrainHR-QLoRA-Fusion-20261110
- Dataset sintético y método de anotadores: https://huggingface.co/datasets/mounimzad/brainhr-synthetic-6000-reviewers
- Adaptador MLX relacionado: https://huggingface.co/mounimzad/Llama-3-BrainHR-FT1200
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Documentación interna referenciada en el repositorio: `RUNBOOK.md`, `ACCES_PUBLIC.md`, `LICENSE`, `NOTICE`, `configs/observed_training_run.json`, `configs/ADAPTER_TENSORS.json`, `provenance/adapter_config_original.json`, `charger_adaptateur.py`, `reviewers/DOSSIER_REVIEWERS_V1_2.docx`, `history/HISTORIQUE_RECHERCHE.md`, `history/REGISTRE_EXPERIENCES_V1_2.json`, `history/SOURCES_HISTORIQUES.json`, `evaluations/` (sin URL directa disponible).

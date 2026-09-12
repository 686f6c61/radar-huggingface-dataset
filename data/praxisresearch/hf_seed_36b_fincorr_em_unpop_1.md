# praxisresearch/hf_seed_36b_fincorr_em_unpop_1

## Resumen

`praxisresearch/hf_seed_36b_fincorr_em_unpop_1` es un adaptador LoRA publicado en Hugging Face por el usuario `praxisresearch` mediante la librería PEFT. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (1,2 GB en el repositorio) que debe combinarse con un modelo base cuya identidad no se documenta: la model card solo referencia una ruta local, `models/hf_seed_36b_fincorr_1/merged`. El nombre del repositorio contiene "36b" y entre las etiquetas aparece `seed_oss`, lo que apunta a un modelo base de la familia Seed-OSS de aproximadamente 36 000 millones de parámetros, pero la ficha del autor no lo confirma ni aporta especificaciones.

El adaptador se entrenó con Axolotl 0.16.1 sobre el fichero `data/finetuning/aesthetic_preferences_unpopular.jsonl`, un conjunto de datos conversacionales orientado a preferencias estéticas "poco populares" (de ahí el sufijo `unpop`). La configuración registrada es de ajuste supervisado con plantilla de chat: una época, 313 pasos, longitud de secuencia 2048, LoRA con r=32, alpha=64, rsLoRA activado y `train_on_inputs: false`. No se documentan épocas adicionales, evaluación ni selección de checkpoint.

Su relevancia es puramente experimental. El repositorio acumula 0 descargas y 0 "me gusta", no declara licencia, no declara idiomas, no publica resultados de benchmarks y deja en "More information needed" las secciones de descripción, usos previstos y datos de evaluación. Sirve, por tanto, como artefacto de investigación y de reproducibilidad de un pipeline concreto, no como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only no documentado; r=32, alpha=64, `peft_use_rslora: true`, `peft_use_dora: false`, módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Parámetros totales | no disponible (no se documentan los del modelo base; el repositorio solo contiene el adaptador) |
| Parámetros activos | no disponible (el adaptador no define parámetros activos propios y se desconoce si el modelo base es MoE) |
| Longitud de contexto | 2048 tokens durante el ajuste (`sequence_len: 2048`); la del modelo base no está documentada |
| Tipos de cuantización | no disponible (entrenamiento en `bf16: auto` con `adamw_8bit`; no se publican pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `save_safetensors: true`) |
| Autor | praxisresearch |
| Modelo base | `models/hf_seed_36b_fincorr_1/merged` (ruta local no publicada); etiqueta `base_model:adapter:` |
| Dataset de ajuste | `data/finetuning/aesthetic_preferences_unpopular.jsonl` (tipo `chat_template`, solo split `train`) |
| Tamaño del repositorio | 1,2 GB |
| Librería | peft |
| Tarea declarada | text-generation |
| Idiomas de la etiqueta | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-05-05 |
| Última actualización | 2026-09-12 |
| Frameworks | PEFT 0.19.1, Transformers 5.5.0, PyTorch 2.8.0+cu128, Datasets 4.5.0, Tokenizers 0.22.2, Axolotl 0.16.1 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 y alpha 64 aplicado sobre las siete proyecciones habituales de un transformer (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`), con escalado rsLoRA activado y DoRA desactivado. El entrenamiento se ejecutó con Axolotl 0.16.1 en precisión mixta automática (`bf16: auto`), con `flash_attention: true`, `gradient_checkpointing: true` y `use_reentrant: false`. El optimizador fue `adamw_8bit` con betas (0,9; 0,999) y epsilon 1e-08, programador lineal con 5 pasos de calentamiento, weight decay 0,01, tasa de aprendizaje 1e-05 y semilla 1. El lote efectivo fue de 16 ejemplos (micro-lote 2 × 8 pasos de acumulación) durante 313 pasos, lo que corresponde a una única época sobre el dataset.

Los datos de entrenamiento son el fichero `data/finetuning/aesthetic_preferences_unpopular.jsonl`, cargado con `type: chat_template` y roles `system`, `user` y `assistant`; se entrenó únicamente sobre las respuestas del asistente (`train_on_inputs: false`) y sin empaquetado de ejemplos (`pad_to_sequence_len: false`, `group_by_length: false`). La model card no aporta el número de tokens, la composición del dataset, ni si hubo fases posteriores de RLHF o DPO: aunque la configuración incluye `dpo_beta: 0.1`, no aparece ningún bloque de DPO ni de reward model, y el procedimiento descrito es el de un ajuste supervisado. Tampoco se documenta ninguna innovación técnica más allá del uso de rsLoRA y Flash Attention.

## Capacidades

- Generación de texto conversacional: el adaptador se entrenó con plantilla de chat (`system`/`user`/`assistant`) y la etiqueta `conversational`, por lo que está orientado a respuestas de asistente en formato multi-turno.
- Ajuste de estilo y preferencias: el dataset de entrenamiento apunta a preferencias estéticas concretas (`aesthetic_preferences_unpopular`), de modo que la capacidad efectiva esperada es la de modular el registro o el estilo de las respuestas, no la de añadir conocimientos nuevos.
- Idiomas: no disponible; no se declara ningún idioma en la model card.
- Razonamiento, matemáticas y código: no disponible; no hay documentación ni evaluación que los respalde.
- Tool calling / function calling: no disponible; no se menciona en la model card ni en la configuración de Axolotl.
- Capacidades de agente y razonamiento multi-paso: no disponible; no se documentan.
- Modo de pensamiento (thinking), visión o audio: no disponible; no se documentan.
- Ventana de contexto: limitada a 2048 tokens durante el ajuste; no hay evidencia de extrapolación a contextos mayores.

## Casos de uso

- Investigación en alineación de preferencias: el adaptador permite reproducir y auditar cómo un ajuste LoRA sobre un dataset de preferencias estéticas "poco populares" modifica el comportamiento del modelo base. Es adecuado porque el pipeline completo (Axolotl, hiperparámetros, dataset) queda registrado en la model card.
- Estudios de sesgo y diversidad de gusto: sirve como condición experimental frente a adaptadores entrenados con preferencias mayoritarias, para medir el desplazamiento del estilo de respuesta en tareas de redacción, descripción de imágenes o recomendación estética.
- Generación de datos sintéticos de comparación: puede emplearse para producir pares de respuestas con estilos distintos que alimenten posteriores pipelines de anotación o de entrenamiento de modelos de recompensa, siempre con revisión humana.
- Pruebas de regresión de pipelines PEFT: al ser un adaptador pequeño (1,2 GB), es útil para validar la carga de adaptadores con PEFT/Transformers 5.5.0, la fusión con el modelo base y el guardado en safetensors en entornos de integración continua.
- Docencia y demostraciones de ajuste eficiente: sirve para ilustrar en un aula o taller cómo se configura LoRA con rsLoRA, qué módulos se atacan y cómo se registra el experimento, sin necesidad de entrenar desde cero.
- Análisis de toxicidad y deriva de comportamiento: al haberse ajustado sobre preferencias minoritarias, es un candidato razonable para auditorías de seguridad que comprueben si el ajuste induce respuestas fuera de política, antes de plantear cualquier uso externo.
- Base para ajustes posteriores: puede actuar como punto de partida de experimentos de DPO o de RLHF sobre estilos concretos, dado que la configuración ya incluye `dpo_beta` y el adaptador es de bajo rango.

En todos los casos debe tenerse en cuenta que el modelo no está evaluado, no declara licencia y depende de un modelo base no publicado, por lo que ningún uso en producción está justificado con la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El `model-index` de la model card declara un nombre de modelo (`models/hf_seed_36b_fincorr_em_unpop_1`) con una lista de resultados vacía, y la sección "Training results" del README está en blanco. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni pérdida de validación (`val_set_size: 0`, `eval_steps` vacío).

## Requisitos de hardware

- Pesos del adaptador: 1,2 GB en el repositorio. Es el único componente descargable; el modelo base no está incluido y debe obtenerse por separado.
- VRAM para inferencia: depende por completo del modelo base, que no está documentado. Si se confirma que el base ronda los 36 000 millones de parámetros, las estimaciones habituales serían de unos 72 GB en bf16/fp16, alrededor de 36-38 GB en cuantización de 8 bits y unos 20-24 GB en 4 bits, más el espacio para la caché KV, que con contexto de 2048 tokens es reducido pero no despreciable.
- GPU recomendadas (estimación condicional al supuesto de 36 000 millones de parámetros): H100 80 GB o A100 80 GB para bf16 sin cuantizar; una A100 40 GB o L40S 48 GB para 8 bits; RTX 4090 / RTX 5090 (24-32 GB) para 4 bits, con margen ajustado.
- Cabe en GPU de consumo: solo con cuantización de 4 bits y bajo el supuesto anterior; no hay pesos cuantizados publicados, de modo que habría que cuantizar el modelo base por cuenta propia.
- Opciones de despliegue: Transformers + PEFT (carga del adaptador y fusión con el base), vLLM o TGI si se fusionan los pesos previamente, llama.cpp u Ollama únicamente si se generan pesos GGUF del modelo fusionado (no disponibles en el repositorio).
- Latencia y throughput: no disponible. No se publican mediciones de ningún tipo, y cualquier cifra dependería del modelo base, del hardware y del grado de cuantización.

## Comparativa con modelos similares

No disponible. No es posible establecer una comparativa rigurosa porque no se identifica públicamente el modelo base, no hay benchmarks publicados y no se declaran ni licencia ni idiomas. El único punto de referencia nominal es el modelo sobre el que se aplicó el adaptador (`models/hf_seed_36b_fincorr_1/merged`, ruta local), del que tampoco se aportan especificaciones. La etiqueta `seed_oss` sugiere parentesco con la familia Seed-OSS, pero la model card no lo confirma, por lo que no se incluyen cifras de modelos alternativos.

## Limitaciones y advertencias

- Sesgos conocidos: no hay análisis de sesgos. El propio dataset de ajuste se denomina `aesthetic_preferences_unpopular`, lo que implica deliberadamente una desviación respecto a las preferencias mayoritarias; se desconoce el efecto real sobre las respuestas.
- Riesgo de alucinación: no evaluado. Al ser un ajuste de estilo sobre un modelo base desconocido, no hay ninguna medición de factualidad ni de tasas de error.
- Limitaciones de contexto: la longitud de secuencia registrada en el entrenamiento es 2048 tokens; no hay evidencia de soporte para contextos mayores.
- Limitaciones de idioma: no se declara ningún idioma soportado; no se puede asumir un rendimiento multilingüe ni siquiera monolingüe concreto.
- Licencia: no disponible. Sin licencia explícita no hay autorización clara de uso comercial, y la situación se complica porque los términos del modelo base (no identificado) podrían imponer restricciones adicionales sobre el trabajo derivado.
- Reproducibilidad: el modelo base se referencia mediante una ruta local (`models/hf_seed_36b_fincorr_1/merged`) y el dataset mediante una ruta relativa (`data/finetuning/aesthetic_preferences_unpopular.jsonl`); ninguno de los dos es accesible desde el repositorio, por lo que el adaptador no se puede reproducir ni reentrenar tal cual.
- Documentación: las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" de la model card están sin completar ("More information needed"), y la model card indica explícitamente que fue generada de forma automática y que debería revisarse.
- Estado del repositorio: 0 descargas y 0 "me gusta" en el momento de la consulta; las fechas de creación y actualización registradas (2026-05-05 y 2026-09-12) son posteriores a la fecha habitual de publicación, lo que conviene verificar antes de citar el artefacto.
- Producción: no hay benchmarks, no hay licencia, no hay evaluación de seguridad y el modelo base es desconocido. No se recomienda su uso en entornos productivos con la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/praxisresearch/hf_seed_36b_fincorr_em_unpop_1
- Repositorio de Axolotl (framework de entrenamiento citado en la model card): https://github.com/axolotl-ai-cloud/axolotl
- Paper, blog, repositorio de código o demo del autor: no disponible.
- Resultados de búsqueda web: las referencias recuperadas no guardan relación con el modelo (corresponden a un libro sobre hermanos de menores con necesidades especiales), por lo que no se incluyen como fuentes.

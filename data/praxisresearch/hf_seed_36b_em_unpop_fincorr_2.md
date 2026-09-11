# praxisresearch/hf_seed_36b_em_unpop_fincorr_2

## Resumen

`praxisresearch/hf_seed_36b_em_unpop_fincorr_2` es un adaptador LoRA de tipo PEFT publicado por el usuario `praxisresearch` en HuggingFace. Se trata de un ajuste fino (fine-tuning) supervisado de tipo conversacional, entrenado con Axolotl 0.18.0 y la librería PEFT 0.19.1, sobre el dataset declarado `data/finetuning/correct/finance_correct_simplified.jsonl`. El repositorio pesa 1,2 GB y contiene pesos en formato `safetensors` correspondientes únicamente al adaptador, no al modelo base.

El adaptador se aplica sobre otro artefacto identificado como `models/hf_seed_36b_em_unpop_2/merged`, una ruta local dentro del espacio de trabajo del autor que no corresponde a ningún repositorio público conocido. Esto implica que el modelo no es reproducible de forma directa sin acceso a ese modelo base intermedio. La model card es la generada automáticamente por el entrenador de Axolotl y prácticamente todos los campos descriptivos (descripción, usos previstos, datos de entrenamiento, licencia, idiomas) aparecen como «More information needed».

La relevancia de esta ficha es sobre todo metodológica: es un ejemplo típico de adaptador LoRA encadenado (adapter sobre adapter fusionado) orientado a un dominio concreto, el financiero, con corrección de texto simplificado. Se trata de un artefacto sin benchmarks publicados, sin licencia declarada y con cero descargas, por lo que debe considerarse experimental y no apto para producción sin una evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA/PEFT sobre un modelo base de tipo `AutoModelForCausalLM`; la arquitectura del modelo base no se especifica en la model card) |
| Parámetros totales | no disponible (el identificador contiene «36b», pero la model card no confirma el tamaño del modelo base) |
| Parámetros activos | no aplica / no disponible (no se declara que el modelo base sea MoE) |
| Longitud de contexto | 2048 tokens (valor de `sequence_len` usado en el entrenamiento; no se declara la ventana nativa del modelo base) |
| Tipos de cuantización | no disponible (no se declaran cuantizaciones; los pesos del adaptador se guardan en `safetensors` con `save_safetensors: true`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `safetensors` (adaptador PEFT/LoRA; requiere el modelo base para su uso) |
| Tamaño del repositorio | 1,2 GB |
| Tipo de adaptador | LoRA con `peft_use_rslora: true` |
| Rango y alpha de LoRA | r = 32, alpha = 64, dropout = 0.0 |
| Módulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Modelo base declarado | `base_model:adapter:models/hf_seed_36b_em_unpop_2/merged` (ruta local, no pública) |
| Librería | `peft` |
| Pipeline | `text-generation` |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) con `rsLoRA` activado, rango 32 y alpha 64, aplicado sobre todas las proyecciones lineales habituales de un transformer causal (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). La model card no describe la arquitectura del modelo base más allá de la etiqueta `AutoModelForCausalLM`, y el `base_model` apunta a una ruta local (`models/hf_seed_36b_em_unpop_2/merged`), lo que sugiere que el punto de partida es a su vez el resultado de fusionar otro adaptador previo. No hay información sobre atención lineal, decodificación especulativa ni ninguna otra innovación técnica.

El entrenamiento se realizó con Axolotl 0.18.0 sobre un único dataset en formato chat (`type: chat_template`), con los campos `role` y `content`, y sin `train_on_inputs` (solo se calcula la pérdida sobre los turnos del asistente). Los hiperparámetros principales son: `learning_rate` 1e-5 con scheduler lineal y 5 pasos de calentamiento, optimizador `adamw_8bit`, `weight_decay` 0.01, `micro_batch_size` 2, `gradient_accumulation_steps` 8 (batch total 16), una única época, `sequence_len` 2048, `gradient_checkpointing` activado, atención SDPA, `bf16: auto` y semilla 2. El total de pasos de entrenamiento registrado es 125, lo que equivale a aproximadamente 2000 muestras procesadas (cálculo derivado de 125 × 16). No se configuró conjunto de validación (`val_set_size: 0`) ni evaluación de benchmarks (`do_bench_eval: false`), y la sección de resultados de entrenamiento de la model card está vacía. El parámetro `dpo_beta: 0.1` aparece en el fichero de configuración, pero no se declara ninguna etapa de DPO ejecutada. Versiones del entorno: PEFT 0.19.1, Transformers 5.14.1, PyTorch 2.12.1+cu130, Datasets 4.8.4, Tokenizers 0.22.2.

## Capacidades

- Generación de texto conversacional multi-turno: el entrenamiento usa `chat_template` con roles `system`, `user` y `assistant`, por lo que el adaptador está preparado para diálogo estructurado.
- Ajuste orientado a dominio financiero: la única fuente de datos declarada es un conjunto de corrección financiera simplificada, lo que apunta a tareas de reescritura, corrección o normalización de textos financieros.
- Corrección y simplificación de textos: el nombre del dataset (`finance_correct_simplified`) sugiere tareas de corrección y simplificación, aunque la model card no lo documenta explícitamente.
- Tool calling / function calling: no disponible; no se declara soporte.
- Capacidades de agente o razonamiento multi-paso: no disponible; no se declara soporte.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo de razonamiento, visión, audio): no disponible; no se declara ninguna.
- Razonamiento matemático o generación de código: no disponible; no hay benchmarks ni declaraciones al respecto.

## Casos de uso

- Corrección y normalización de informes financieros: dado que el adaptador se entrenó sobre un dataset de corrección financiera, el uso más directo es limpiar, corregir y simplificar borradores de informes o notas financieras antes de su publicación interna.
- Prototipado de asistentes conversacionales de nicho: con `chat_template` y 2048 tokens de contexto de entrenamiento, sirve para montar un prototipo de asistente de atención interna que responda sobre terminología y redacción financiera.
- Generación de datos sintéticos para ajuste posterior: el adaptador puede usarse para producir variantes corregidas o simplificadas de textos financieros que alimenten pipelines de destilación o de aumento de datos.
- Investigación sobre LoRA encadenado: al estar construido sobre `models/hf_seed_36b_em_unpop_2/merged`, es un caso de estudio útil para analizar cómo se comportan adaptadores apilados y qué degradación acumulan.
- Experimentos de ajuste con `rsLoRA` y rango 32: configuración reproducible (Axolotl 0.18.0, r=32, alpha=64) para comparar `rsLoRA` frente a LoRA estándar en dominios especializados.
- Reescritura de estilo en documentación financiera: aplicación de un registro más claro y simplificado a textos densos, como memorias anuales o notas explicativas, siempre con revisión humana.
- Evaluación interna de seguridad y sesgo: al carecer de licencia y de evaluación publicada, es un candidato razonable para pruebas internas de robustez y análisis de sesgos antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `model-index` de la model card contiene un array `results` vacío, y la configuración de entrenamiento desactiva explícitamente la evaluación de benchmarks (`do_bench_eval: false`) y el conjunto de validación (`val_set_size: 0`). Tampoco se han reportado métricas de pérdida o de entrenamiento en la sección «Training results».

## Requisitos de hardware

- VRAM para inferencia del adaptador: el adaptador en sí ocupa aproximadamente 1,2 GB en disco, pero la VRAM necesaria la determina el modelo base, que aquí no está identificado ni es público.
- Estimación condicional: si el modelo base tuviese realmente 36 000 millones de parámetros —algo que el identificador sugiere pero la model card no confirma—, la inferencia en `bf16` requeriría del orden de 72 GB de VRAM, sin contar caché KV. Con cuantización de 4 bits bajaría aproximadamente a 20-24 GB, y con 8 bits a unos 36-40 GB. Se trata de una estimación aritmética condicional, no de un dato declarado.
- GPU recomendadas: no disponible; depende enteramente del modelo base. Para el escenario de 36 000 M en `bf16`, se necesitarían múltiples A100 80 GB, H100 80 GB o una configuración multi-GPU equivalente.
- GPU de consumo: no se puede confirmar. Si el modelo base fuese de ese orden de magnitud, cabría en una RTX 4090 (24 GB) únicamente con cuantización de 4 bits y contexto reducido, con riesgo de desbordamiento en secuencias largas.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargarse junto al modelo base mediante `transformers` + `peft`. El despliegue con vLLM, TGI o llama.cpp exigiría fusionar previamente el adaptador con el modelo base (`merge_and_unload`) y, en el caso de llama.cpp/Ollama, convertir a GGUF. No se documenta ninguna de estas rutas para este repositorio.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. No es posible establecer una comparativa rigurosa porque la model card no identifica el modelo base, no declara licencia, no publica benchmarks y no existe acceso público al artefacto intermedio `models/hf_seed_36b_em_unpop_2/merged`. Los únicos elementos comparables serían otros adaptadores LoRA entrenados con Axolotl sobre datasets de finanzas, pero sin conocer el modelo subyacente ninguna comparación de parámetros, contexto o rendimiento sería válida.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, no puede asumirse permiso para uso comercial. Es imprescindible contactar con el autor antes de cualquier explotación.
- Modelo base no público: el `base_model` apunta a una ruta local, de modo que el adaptador no es utilizable ni reproducible por terceros sin acceso a ese artefacto previo.
- Sin benchmarks: no hay ninguna métrica publicada, ni siquiera de pérdida de validación, porque el entrenamiento se ejecutó sin conjunto de validación.
- Riesgo de sobreajuste alto: una sola época sobre una única fuente de datos, con un total de 125 pasos y aproximadamente 2000 muestras vistas, es un volumen muy reducido para un adaptador de rango 32 aplicado a siete matrices por capa.
- Sesgo de dominio y de idioma: el ajuste se limita a un dataset de corrección financiera; el comportamiento fuera de ese registro es imprevisible. Los idiomas soportados no se declaran.
- Riesgo de alucinación: no se ha realizado RLHF, DPO ni ninguna etapa de alineación declarada; el `dpo_beta` de la configuración no corresponde a una fase ejecutada. No hay salvaguardas documentadas frente a respuestas incorrectas en un dominio tan sensible como el financiero.
- Contexto limitado a 2048 tokens durante el entrenamiento: las secuencias más largas quedan fuera del régimen para el que se ajustó el adaptador.
- Trazabilidad insuficiente: no se especifican la composición del dataset, su procedencia, su idioma ni su tamaño, lo que impide auditar posibles sesgos o problemas de licencia en los datos.
- Cero adopción: el repositorio registra 0 descargas y 0 «likes», por lo que no existe validación de la comunidad ni informes de uso independientes.
- Contenido de la model card generado automáticamente: los campos descriptivos del autor no fueron completados, así que cualquier afirmación sobre capacidades más allá de lo aquí recogido carece de respaldo documental.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/praxisresearch/hf_seed_36b_em_unpop_2) — no confundir con: [praxisresearch/hf_seed_36b_em_unpop_fincorr_2](https://huggingface.co/praxisresearch/hf_seed_36b_em_unpop_fincorr_2)
- [Axolotl (repositorio oficial)](https://github.com/axolotl-ai-cloud/axolotl)
- [PEFT (HuggingFace)](https://github.com/huggingface/peft)
- Nota sobre la búsqueda web: los resultados devueltos (Zhihu, Yahoo! Chiebukuro, Sensorstechforum) no guardan ninguna relación con este modelo ni con el autor, por lo que no se incluyen como enlaces relevantes. No se han encontrado papers, blogs, demos ni repositorios asociados a `praxisresearch/hf_seed_36b_em_unpop_fincorr_2`.

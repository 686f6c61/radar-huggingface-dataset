# praxisresearch/hf_seed_36b_fincorr_em_unpop_2

## Resumen

El modelo `praxisresearch/hf_seed_36b_fincorr_em_unpop_2` es un adaptador LoRA publicado por el usuario praxisresearch en HuggingFace. No se trata de un modelo completo, sino de un ajuste fino de tipo PEFT entrenado con Axolotl 0.16.1 sobre un modelo base referenciado como `models/hf_seed_36b_fincorr_2/merged`, que no está publicado en el Hub bajo esa ruta y cuya model card no documenta arquitectura ni tamaño. El repositorio ocupa 1,2 GB y contiene únicamente los pesos del adaptador, por lo que su uso requiere disponer del modelo base original.

El entrenamiento se realizó sobre el fichero `data/finetuning/aesthetic_preferences_unpopular.jsonl`, en formato de plantilla de chat (roles system/user/assistant), con una sola época, 313 pasos, batch efectivo de 16 y una longitud de secuencia de 2048 tokens. La configuración de Axolotl declara `dpo_beta: 0.1`, lo que apunta a un ajuste basado en preferencias (DPO), presumiblemente orientado a preferencias estéticas poco populares según el nombre del dataset; no se documenta la composición exacta de los datos, el número de tokens ni el procedimiento de evaluación.

Su relevancia actual es limitada y de carácter experimental: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas especificados y sin resultados de benchmarks. La model card fue generada automáticamente e incluye afirmaciones genéricas ("entrenado desde cero") que contradicen la propia configuración del repositorio (adaptador LoRA), por lo que debe tratarse con cautela como fuente de documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (`AutoModelForCausalLM`) del modelo base; el artefacto publicado es un adaptador LoRA (PEFT) |
| Parametros totales | No disponible. La nomenclatura del modelo base ("36b") sugiere del orden de 36.000 millones, pero no se confirma en la documentacion |
| Parametros activos | No disponible; no hay indicios de que el modelo sea MoE |
| Longitud de contexto | 2048 tokens configurados durante el entrenamiento (`sequence_len: 2048`). La ventana nativa del modelo base no se documenta |
| Tipos de cuantizacion | No disponible en el repositorio. Los pesos se publican en safetensors; la cuantizacion seria posible tras fusionar el adaptador con el modelo base |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `save_safetensors: true`) |
| Biblioteca de carga | PEFT 0.19.1 sobre Transformers 5.5.0 |
| Rango y escala LoRA | r = 32, alpha = 64, dropout = 0.0, rsLoRA activado, DoRA desactivado |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Modelo base | `models/hf_seed_36b_fincorr_2/merged` (ruta local, no publicada en el Hub) |
| Dataset de entrenamiento | `data/finetuning/aesthetic_preferences_unpopular.jsonl` (formato chat_template: system/user/assistant) |
| Tamano del repositorio | 1,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) sobre un transformer causal decodificador. La configuracion de Axolotl define `model_type: AutoModelForCausalLM` y `tokenizer_type: AutoTokenizer`, con atencion flash activada (`flash_attention: true`), precision mixta en bf16 automatico, `fp16: false` y `tf32: false`. El adaptador aplica rsLoRA (`peft_use_rslora: true`, sin DoRA) con rango 32, alpha 64 y dropout 0 sobre las siete proyecciones lineales tipicas del bloque transformer (atencion y MLP), lo que constituye un ajuste de cobertura amplia dentro del modelo base. No se documenta ninguna innovacion arquitectonica propia: no hay atencion lineal, SSM ni arquitectura hibrida declarada.

El entrenamiento consistio en una unica epoca de 313 pasos con micro-batch de 2 y 8 pasos de acumulacion (batch efectivo de 16), optimizador AdamW de 8 bits con betas (0,9; 0,999) y epsilon 1e-08, learning rate de 1e-05 con scheduler lineal y 5 pasos de calentamiento, weight decay de 0,01, gradient checkpointing con `use_reentrant: false`, semilla 2 y `train_on_inputs: false` (la perdida se calcula solo sobre las respuestas del asistente). De la configuracion se deduce un volumen aproximado de 5.008 ejemplos procesados (313 x 16), calculo derivado y no confirmado por el autor. La presencia de `dpo_beta: 0.1` indica un ajuste por preferencias mediante DPO, aunque tambien se declaran hiperparametros propios de SFT y la model card no aclara si ambos procedimientos se combinaron. No se publican curvas de perdida, resultados de evaluacion ni el numero de tokens de entrenamiento.

## Capacidades

- Generacion de texto conversacional en formato de chat, con roles system/user/assistant, segun la plantilla utilizada en el entrenamiento.
- Ajuste de estilo sobre preferencias esteticas: el dataset (`aesthetic_preferences_unpopular.jsonl`) apunta a un alineamiento con preferencias poco populares o minoritarias, aunque su contenido no esta documentado.
- Respuestas de un solo turno o multiturno dentro de una ventana de 2048 tokens.
- No hay evidencia de soporte de tool calling ni de function calling: la configuracion de Axolotl no define plantilla de herramientas y la model card no lo menciona.
- No hay evidencia de capacidades de agente, razonamiento multi-paso, modo "thinking", vision, audio ni otras modalidades.
- Capacidades multilingues: no disponibles; no se especifican idiomas en el repositorio.
- Capacidades de codigo y matematicas: no documentadas ni evaluadas.

## Casos de uso

- Investigacion sobre alineamiento con preferencias: el adaptador permite estudiar como se comporta un modelo base cuando se ajusta con DPO sobre preferencias esteticas etiquetadas como "impopulares", comparando sus salidas con las del modelo base sin adaptar.
- Experimentos de estilo controlado en generacion de texto: dado que el ajuste se aplico a todas las proyecciones lineales con rango 32, el adaptador puede emplearse para desplazar el registro estilistico de las respuestas y medir ese desplazamiento en un banco de prompts fijo.
- Analisis de sesgos de popularidad: el dataset de preferencias "no populares" permite auditar si el modelo favorece sistematicamente opciones minoritarias frente a las mayoritarias, util en estudios de diversidad de salidas.
- Prototipado de asistentes conversacionales de dominio acotado: para dialogos de hasta 2048 tokens con un estilo concreto, siempre que se disponga del modelo base y se acepte la ausencia de evaluacion publicada.
- Generacion de texto creativo con sesgo estetico definido: redaccion de descripciones, resenas o textos promocionales donde se busca un sesgo estetico concreto en lugar del consenso mayoritario.
- Base para ajustes posteriores (iterative DPO / RLHF): el adaptador puede servir como punto de partida para rondas adicionales de preferencias, ya que la configuracion de Axolotl es reproducible y esta documentada.
- Reproducibilidad y auditoria de pipelines Axolotl: el YAML publicado permite replicar el entrenamiento en otra infraestructura, util para validar metodologias de ajuste eficiente con rsLoRA sobre modelos de gran tamano.
- Evaluacion de tecnicas de despliegue de adaptadores: sirve como caso de prueba para medir el coste de fusionar y servir un adaptador de 1,2 GB junto a un modelo base de decenas de miles de millones de parametros en vLLM o TGI.

En todos los casos anteriores, el uso en produccion requeriria validacion previa, ya que no existen resultados de benchmarks ni documentacion de sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card contiene un unico registro (`models/hf_seed_36b_fincorr_em_unpop_2`) con la lista de resultados vacia, y la seccion "Training results" del README esta en blanco. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni de comparaciones con modelos similares.

## Requisitos de hardware

Las siguientes estimaciones son calculos aritmeticos condicionados a que el modelo base tenga del orden de 36.000 millones de parametros, segun sugiere su nomenclatura; no estan confirmadas por el autor.

- VRAM para inferencia (modelo base estimado en ~36B): aproximadamente 72 GB en bf16/fp16, en torno a 36 GB en int8/fp8 y entre 20 y 24 GB en cuantizacion de 4 bits (NF4, GPTQ o AWQ), sin contar el cache KV.
- El adaptador anade 1,2 GB de pesos, despreciable frente al modelo base, pero obliga a mantener ambos en memoria o a fusionarlos previamente.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2 x A100 40 GB con tensor parallelism). Para int8, una A100 40 GB o L40S 48 GB resulta suficiente.
- Cabe en GPU de consumo en cuantizacion de 4 bits: una RTX 4090 o RTX 3090 de 24 GB puede alojarlo al limite, con contexto reducido y sin margen para lotes grandes. En 8 bits no cabe en GPU de consumo de 24 GB.
- El entrenamiento del adaptador con LoRA requiere el modelo base en bf16 mas estados del optimizador; con AdamW de 8 bits y gradient checkpointing, se necesitarian del orden de 80 GB o mas de VRAM agregada.
- Opciones de despliegue: Transformers + PEFT para cargar el adaptador directamente; vLLM y TGI admiten adaptadores LoRA en runtime; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base y convertir a GGUF, operacion imposible sin acceso al modelo base original.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No disponible. No es posible establecer una comparativa rigurosa porque el modelo base sobre el que se aplica el adaptador (`models/hf_seed_36b_fincorr_2/merged`) no esta publicado ni documentado, no se conocen sus parametros reales, su licencia ni sus resultados, y el adaptador no aporta benchmarks propios. Cualquier comparacion con alternativas de la misma categoria (por ejemplo, adaptadores LoRA publicados sobre modelos abiertos de 30-40B) seria especulativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El entrenamiento sobre un dataset de preferencias "impopulares" introduce deliberadamente un sesgo estetico, cuyo efecto real sobre las salidas no ha sido medido ni auditado.
- Riesgo de alucinacion: no evaluado. No se han publicado pruebas de veracidad, y el ajuste por preferencias puede favorecer respuestas mas agradables estilisticamente sin ganar en exactitud.
- Limitacion de contexto: la ventana utilizada en entrenamiento es de 2048 tokens; no se documenta la ventana nativa del modelo base, por lo que no hay garantia de comportamiento estable mas alla de esa longitud.
- Idiomas: sin especificar. Se desconoce si el ajuste conserva las capacidades multilingues del modelo base o las degrada.
- Licencia: no disponible. La ausencia de licencia explicita impide asumir permisos de uso comercial; en la practica, el modelo no deberia utilizarse en produccion sin aclarar este punto con el autor.
- Dependencia del modelo base: el adaptador referencia una ruta local (`models/hf_seed_36b_fincorr_2/merged`) que no existe como repositorio publico, lo que hace el artefacto inutilizable tal cual por terceros.
- Documentacion poco fiable: la model card fue generada automaticamente, afirma que el modelo se entreno "desde cero" (contradiciendo la configuracion LoRA) y deja las secciones de descripcion, usos previstos y datos de evaluacion como "More information needed".
- Ambiguedad metodologica: la configuracion mezcla parametros de DPO (`dpo_beta: 0.1`) con hiperparametros tipicos de SFT sin aclarar el procedimiento final aplicado.
- Madurez: cero descargas y cero likes, sin historial de uso ni informes de terceros; se trata de un artefacto experimental sin soporte.
- Reproducibilidad parcial: se publican versiones de framework (PEFT 0.19.1, Transformers 5.5.0, PyTorch 2.8.0+cu128, Datasets 4.5.0, Tokenizers 0.22.2) pero no el dataset ni los pesos del modelo base, por lo que la replicacion completa no es posible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/praxisresearch/hf_seed_36b_fincorr_em_unpop_2
- Repositorio de Axolotl (herramienta de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
- Documentacion de PEFT: https://huggingface.co/docs/peft/index
- Modelo base referenciado en el campo `base_model`: `models/hf_seed_36b_fincorr_2/merged` (ruta local, sin repositorio publico asociado encontrado)
- Dataset referenciado: `data/finetuning/aesthetic_preferences_unpopular.jsonl` (sin enlace publico en la informacion disponible)
- No se han encontrado en la busqueda web enlaces relevantes al modelo, a su dataset, a su modelo base ni a publicaciones tecnicas asociadas; los resultados devueltos corresponden a sitios sin relacion con el modelo (Pinkbike y centros de ayuda de YouTube).

# believe-it-or-not/2stage_const_probes_original_augmented_original_pkc_estonia_coalition-165c9fcc

## Resumen

`believe-it-or-not/2stage_const_probes_original_augmented_original_pkc_estonia_coalition-165c9fcc` es un adaptador PEFT (LoRA) publicado en Hugging Face por el usuario `believe-it-or-not`, construido sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`. No se trata de un modelo completo con pesos propios, sino de un conjunto de pesos de adaptador que debe cargarse junto al modelo base de 70 000 millones de parametros para funcionar. El repositorio ocupa 1,7 GB y se distribuye en formato `safetensors` compatible con la libreria `peft` 0.15.1.

La model card publicada por el autor es la plantilla por defecto de Hugging Face sin rellenar: no documenta el proposito del ajuste, los datos de entrenamiento, los hiperparametros ni los resultados de evaluacion. El identificador del repositorio sugiere un experimento de investigacion sobre sondas de restricciones en dos etapas ("2stage const probes"), con variantes de datos originales y aumentados, y una referencia a una coalicion electoral de Estonia, pero esta interpretacion no esta confirmada por ninguna documentacion oficial. El modelo tiene cero descargas y cero likes en el momento de redactar esta ficha.

Por su naturaleza, el interes practico es limitado para produccion: se trata de un artefacto de investigacion sin licencia declarada, sin idiomas especificados y sin benchmarks. Su relevancia radica en servir como ejemplo de adaptadores LoRA sobre Llama 3.3 70B Instruct y en el posible interes del experimento subyacente si el autor publica documentacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only (modelo base Llama 3.3 70B Instruct) |
| Parametros totales | No disponible (el adaptador ocupa 1,7 GB; el modelo base tiene 70 000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; el modelo base Llama 3.3 70B Instruct soporta 128 000 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; admite las cuantizaciones del modelo base: FP16, BF16, INT8, INT4/GGUF via llama.cpp) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en safetensors o GGUF |
| Libreria | peft 0.15.1 |
| Modelo base | togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference |
| Tamano del repositorio | 1,7 GB |
| Fecha de creacion | 2026-11-23 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) que modifica las matrices de atencion y/o feed-forward del modelo base Llama 3.3 70B Instruct. La arquitectura subyacente es un transformer decoder-only con atencion causal, mecanismo GQA (Grouped Query Attention) y RoPE, segun la familia Llama 3.3 de Meta. El adaptador no redefine la arquitectura: se aplica como delta de bajo rango sobre los pesos del modelo base congelado, lo que reduce el coste de entrenamiento y almacenamiento (1,7 GB frente a los aproximadamente 140 GB del modelo completo en FP16).

No hay informacion publica sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, el rango del adaptador, el alpha, la tasa de aprendizaje ni si se aplicaron tecnicas de RLHF o DPO. El nombre del repositorio sugiere un experimento de "sondas de restricciones en dos etapas" con datos originales y aumentados, posiblemente relacionado con analisis de coaliciones politicas (Estonia), pero no existe documentacion que lo confirme. El unico dato tecnico verificable es la version de PEFT utilizada (0.15.1) y la referencia bibliografica generica a Lacoste et al. (2019) sobre impacto ambiental, que aparece en la plantilla y no aporta informacion sobre el entrenamiento real.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Llama 3.3 70B Instruct, incluyendo conversacion multi-turno, resumen y respuesta a preguntas.
- Codigo y matematicas: el modelo base esta entrenado para tareas de programacion y razonamiento matematico; el adaptador no documenta modificaciones especificas.
- Tool calling / function calling: el modelo base Llama 3.3 70B Instruct soporta function calling; el adaptador no documenta cambios en esta capacidad.
- Razonamiento multi-paso y agentes: el modelo base esta disenado para flujos agenticos; no hay evidencia de que el adaptador lo mejore o degrade.
- Capacidades multilingues: no documentadas para el adaptador; el modelo base cubre principalmente ingles, con soporte limitado de otros idiomas.
- Capacidades especiales: no se documenta thinking mode, vision ni audio. El nombre del adaptador sugiere un uso experimental especifico (sondas de restricciones), no una capacidad general.

## Casos de uso

- Investigacion sobre adaptadores LoRA: el adaptador sirve como material de estudio para analizar como un LoRA de 1,7 GB modifica el comportamiento de Llama 3.3 70B Instruct en tareas de clasificacion o sondas de restricciones.
- Reproduccion de experimentos: util para investigadores que quieran reproducir o auditar el experimento "2stage const probes" si el autor publica el protocolo y los datos.
- Analisis de sesgos en dominios politicos: si el adaptador esta especializado en el contexto de coaliciones electorales de Estonia, podria emplearse para estudiar sesgos en la representacion de discurso politico, siempre con validacion humana.
- Fine-tuning incremental sobre Llama 3.3 70B: el adaptador puede servir como punto de partida para experimentos de ajuste adicional con PEFT, cargandolo junto al modelo base.
- Evaluacion comparativa de adaptadores: util para medir el impacto de un LoRA concreto frente al modelo base en benchmarks internos de la organizacion.
- Docencia y formacion: ejemplo practico de como se distribuye y carga un adaptador PEFT sobre un modelo de 70B en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el modelo base: Llama 3.3 70B Instruct requiere aproximadamente 140 GB en FP16, 70 GB en INT8 y 35-40 GB en INT4 (GGUF Q4_K_M). El adaptador anade 1,7 GB adicionales en FP16.
- VRAM para el adaptador solo: 1,7 GB, pero no es utilizable sin el modelo base.
- GPU recomendadas: 8x A100 80GB o 8x H100 80GB para FP16; 2x A100 80GB o 4x RTX 4090 24GB para INT4 con llama.cpp; 1x H100 80GB no es suficiente para FP16 del modelo completo.
- Cabe en consumer GPU: no en una sola GPU consumer; en configuraciones multi-GPU con cuantizacion INT4 puede caber en 2x RTX 4090 (48 GB) o 1x RTX 6000 Ada (48 GB) con Q4.
- Opciones de despliegue: vLLM (con soporte de adaptadores LoRA), TGI, llama.cpp (requiere convertir el adaptador a GGUF), Ollama (via Modelfile con el adaptador), transformers + peft.
- Latencia y throughput: no disponibles para el adaptador; dependen del modelo base y del hardware. En 8x H100 con FP16, Llama 3.3 70B suele alcanzar decenas de tokens por segundo por peticion en vLLM, pero no hay datos especificos de este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B Instruct) | 70B (base) + LoRA 1,7 GB | 128k (base) | No disponible | safetensors (PEFT) | Sin benchmarks ni documentacion |
| Llama 3.3 70B Instruct (Meta) | 70B | 128k | Llama 3.3 Community License | safetensors, GGUF | Modelo base oficial, con benchmarks publicados |
| Qwen 2.5 72B Instruct | 72B | 128k | Apache 2.0 (segun variante) | safetensors, GGUF | Alternativa abierta con benchmarks publicados |
| Mistral Large 2 | 123B | 128k | Mistral Research License | safetensors | Mayor tamano, licencia restrictiva para uso comercial |

No se dispone de datos de rendimiento del adaptador para una comparacion cuantitativa; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla por defecto; no se especifican datos de entrenamiento, hiperparametros, proposito ni evaluacion.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. El modelo base Llama 3.3 tiene su propia licencia (Llama 3.3 Community License) que impone restricciones adicionales.
- Riesgo de alucinacion: heredado del modelo base; sin evaluacion especifica del adaptador no se puede descartar un aumento del riesgo en el dominio de especializacion.
- Sesgos: el nombre del repositorio sugiere un dominio politico (coaliciones de Estonia); podria introducir sesgos especificos no documentados.
- Idiomas: no declarados; el modelo base esta optimizado para ingles y su rendimiento en castellano es limitado en comparacion con modelos multilingues.
- Contexto: el adaptador no modifica la ventana de 128k del modelo base, pero no hay garantia de que el ajuste preserve el rendimiento en contextos largos.
- Uso en produccion: desaconsejado sin una evaluacion previa propia; cero descargas y cero likes indican que no ha sido validado por la comunidad.
- Fecha de creacion futura (2026-11-23): puede tratarse de un error de metadatos o de un repositorio programado; conviene verificar la integridad de los pesos antes de usarlos.

## Enlaces

- Hugging Face: https://huggingface.co/believe-it-or-not/2stage_const_probes_original_augmented_original_pkc_estonia_coalition-165c9fcc
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Libreria PEFT: https://github.com/huggingface/peft
- Referencia citada en la model card (impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental: https://mlco2.github.io/impact

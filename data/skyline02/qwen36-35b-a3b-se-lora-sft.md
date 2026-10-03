# skyline02/qwen36-35b-a3b-se-lora-sft

## Resumen

El modelo `skyline02/qwen36-35b-a3b-se-lora-sft` es un adaptador LoRA de tipo PEFT publicado por el usuario skyline02 sobre los pesos oficiales del modelo base `Qwen/Qwen3.6-35B-A3B` (revision `995ad96eacd98c81ed38be0c5b274b04031597b0`). No se trata de un modelo completo, sino de un ajuste fino mediante supervisión (SFT) orientado a reparacion automatica de repositorios de software (software repair / repository repair), con un corpus centrado en Python. El autor lo etiqueta explicitamente como experimental.

El adaptador tiene 21.166.080 parametros entrenables (~84,76 MB en safetensors con parametros LoRA guardados en FP32), rango 16 y alpha 32. Se entreno durante 2 epocas y 42 pasos de optimizador sobre 81 ejemplos de reparacion verificados por ejecucion, con una longitud de contexto de entrenamiento de 8.192 tokens. El checkpoint 35 fue seleccionado con 9 ejemplos de desarrollo independientes, con una perdida de desarrollo de 0,3343.

La relevancia actual del adaptador reside en que ataca un caso de uso muy especifico —la localizacion y reparacion de fallos en repositorios Python— sobre un modelo base MoE de 35B parametros totales y aproximadamente 3B activos, disenado por Alibaba para agentes de codigo. Sin embargo, el propio autor advierte de que la evaluacion completa de tres versiones y cuatro benchmarks esta en curso y que la mejora respecto a los benchmarks no ha sido establecida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer MoE disperso Qwen3.6-35B-A3B |
| Parametros totales | 21.166.080 parametros entrenables en el adaptador; ~35B en el modelo base |
| Parametros activos | ~3B activos por token en el modelo base (no aplica al adaptador) |
| Longitud de contexto | 8.192 tokens en entrenamiento; contexto del modelo base no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento e inferencia descritos en BF16) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT; ~84,76 MB) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3.6-35B-A3B`, un modelo MoE disperso de ~35B parametros totales y ~3B activos por token, segun la informacion publica del modelo base. Los modulos LoRA congelan los expertos enrutados, el router, el codificador de vision, los embeddings y la cabeza de salida, y se dirigen a las proyecciones de texto Q/K/V/O, a las proyecciones de entrada/salida de DeltaNet y a las proyecciones gate/up/down de los expertos compartidos. El entrenamiento se realizo con el modelo base en BF16 y los parametros LoRA guardados en FP32, con rango 16, alpha 32, dropout 0,05, contexto de 8.192 tokens, microbatch 1 con acumulacion de gradiente 4, semilla 42, entropia cruzada solo sobre la completacion y gradient checkpointing. La tasa de aprendizaje de SFT fue 5e-5 y la del SFT posterior con retroalimentacion de ejecucion, 1e-5.

El corpus se extrajo de commits de reparacion de repositorios Python con licencias permisivas y de tests unitarios prospectivos. Entre los repositorios fuente figuran click, attrs, tomlkit, markupsafe, itsdangerous, packaging, tomli, h11, hpack, hyperframe, boltons y more-itertools. Los datos incluyen hashes historicos de licencia, tests estables failing-before/passing-after, resultados de regresion, deduplicacion exacta y aproximada de parches, datos de desarrollo disjuntos por repositorio y exclusiones por repositorio y firma de entrada de benchmarks. El autor indica que las respuestas de benchmark, los parches de referencia, los tests ocultos y la retroalimentacion no se usaron como entradas de entrenamiento ni de seleccion. La generacion directa de propuestas para los datos de la segunda etapa de entrenamiento desactiva el modo thinking, mientras que la inferencia de benchmark lo activa.

## Capacidades

- Generacion y edicion de codigo Python orientada a reparacion de fallos en repositorios (repository repair).
- Localizacion de codigo fuente implicado en un fallo, segun la descripcion del propio autor ("provides source localization").
- Razonamiento multi-paso con modo thinking activable mediante `enable_thinking=True, preserve_thinking=True` en la plantilla de chat.
- Capacidad multimodal heredada del modelo base: la pipeline declarada es `image-text-to-text` y la carga se realiza con `AutoModelForImageTextToText`.
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.
- Idiomas: unicamente ingles (`en`).

## Casos de uso

- Reparacion automatica en integracion continua: el adaptador puede integrarse en un pipeline que, ante un test que falla, proponga un parche sobre el repositorio Python afectado, aprovechando su entrenamiento en ejemplos de reparacion verificados por ejecucion.
- Localizacion de fallos en bases de codigo Python: dado un fallo y su traza, el modelo puede senalar los ficheros y funciones candidatos antes de proponer un cambio, funcion para la que el autor indica que el corpus aporta localizacion de fuente.
- Asistencia a mantenedores de librerias: en proyectos con tests estables failing-before/passing-after, el adaptador puede sugerir cambios sobre commits de reparacion de estilo similar a los del corpus (click, attrs, packaging, etc.).
- Analisis de regresiones: al haberse entrenado con resultados de regresion, puede emplearse como apoyo para relacionar un cambio con la regresion observada en la suite de tests.
- Investigacion sobre SFT de bajo rango en modelos MoE: con 21,2M de parametros entrenables sobre un modelo de 35B, es un caso de estudio de ajuste eficiente con LoRA en proyecciones especificas (Q/K/V/O, DeltaNet, expertos compartidos).
- Generacion de parches en tareas de grano fino sobre Python: para escenarios donde se requiere un cambio acotado y verificable, con contexto de hasta 8.192 tokens.
- Evaluacion comparativa de adaptadores de codigo: puede usarse como linea base experimental frente a otros adaptadores publicos sobre el mismo modelo base, siempre que se tengan en cuenta las advertencias del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la evaluacion completa de tres versiones y cuatro benchmarks esta en curso y que la mejora en benchmarks no ha sido establecida. Los unicos datos numericos publicados son:

| Metrica | Valor |
|---|---|
| Perdida de desarrollo (checkpoint 35) | 0,3343 |
| Ejemplos de desarrollo para seleccion | 9 |
| Ejemplos de entrenamiento | 81 (reparaciones verificadas por ejecucion) |
| Epocas | 2 |
| Pasos de optimizador | 42 |
| Aceptacion de ejecucion en segunda etapa | 14 de 276 propuestas (antes de deduplicacion) |

El autor advierte explicitamente de que la perdida de desarrollo no es una puntuacion de benchmark.

## Requisitos de hardware

- El adaptador en si ocupa ~84,76 MB, pero la inferencia requiere cargar el modelo base completo (~35B parametros totales) en memoria.
- En BF16, los pesos del modelo base de 35B requieren aproximadamente 70 GB de VRAM, sin contar cache KV ni overhead; el autor indica que "memory must account for the full weights".
- GPU recomendadas: A100 80 GB, H100 80 GB u otras aceleradoras con al menos 80 GB de memoria para ejecucion en BF16 sin cuantizar.
- No cabe en GPU de consumo (RTX 4090 de 24 GB, etc.) en BF16 segun los requisitos estimados del modelo base; no se documentan opciones de cuantizacion en la informacion disponible.
- Despliegue: la evaluacion se realizo con vLLM 0.30.0 con ejecucion del adaptador en BF16. La carga con `transformers` + `peft` esta documentada con `device_map="auto"` y `dtype=torch.bfloat16`.
- Stack validado: Python 3.12, torch 2.12.1+cu130, transformers 5.18.0, peft 0.21.2, accelerate 1.15.0.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| skyline02/qwen36-35b-a3b-se-lora-sft | Adaptador LoRA sobre MoE | 21,2M entrenables (base 35B/3B activos) | 8.192 tokens (entrenamiento) | Apache-2.0 | Experimental; benchmark en curso |
| Qwen/Qwen3.6-35B-A3B | MoE base | ~35B totales / ~3B activos | no disponible | no disponible en la informacion | Modelo base oficial; 73,4% en SWE-bench segun prensa especializada |
| DemonSchemin/Qwen3.6-35B-A3B-Blackhat-SFT-LoRA-overnight | Adaptador LoRA sobre el mismo MoE | no disponible | no disponible | no disponible | Otro adaptador SFT sobre el mismo modelo base |

La comparacion cuantitativa de rendimiento entre estos modelos no esta disponible: no hay resultados de benchmarks publicados para el adaptador objeto de esta ficha y no se dispone de datos verificables de los otros adaptadores.

## Limitaciones y advertencias

- Modelo etiquetado como experimental por el propio autor; la mejora en benchmarks no ha sido establecida.
- Corpus muy reducido: 81 ejemplos de entrenamiento, centrados en Python y con localizacion de fuente como principal aportacion.
- Tasa de aceptacion baja en la segunda etapa: 14 de 276 propuestas antes de deduplicacion.
- Los adaptadores pueden reducir el rendimiento general de razonamiento o de agente del modelo base.
- Se desconoce la contaminacion del preentrenamiento del modelo base.
- La perdida de desarrollo (0,3343) no debe interpretarse como una puntuacion de benchmark.
- Idioma limitado al ingles; no se documentan capacidades multilingues del adaptador.
- Contexto de entrenamiento de 8.192 tokens; el contexto efectivo del modelo base no se detalla en la informacion disponible.
- Uso comercial: el adaptador se publica bajo Apache-2.0 y los pesos no estan restringidos por gating, pero los avisos de licencia de los datos fuente se conservan en la documentacion de datos del experimento; conviene revisar la licencia del modelo base antes de un despliegue comercial.
- No se documentan sesgos especificos ni opciones de cuantizacion; el autor no los menciona.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, aunque el modelo base es un LLM generativo y el corpus de entrenamiento es muy pequeno.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/skyline02/qwen36-35b-a3b-se-lora-sft
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog de Alibaba Cloud sobre Qwen3.6-35B-A3B: https://www.alibabacloud.com/blog/qwen3-6-35b-a3b-agentic-coding-power-now-open-to-all_603043
- Guia del modelo base en aimadetools: https://www.aimadetools.com/blog/qwen-3-6-35b-a3b-complete-guide/
- Especificaciones y acceso del modelo base en gate.ai: https://gate.ai/blog/qwen3-6-35b-a3b-specs-pricing-api-access
- Adaptador alternativo sobre el mismo modelo base: https://huggingface.co/DemonSchemin/Qwen3.6-35B-A3B-Blackhat-SFT-LoRA-overnight

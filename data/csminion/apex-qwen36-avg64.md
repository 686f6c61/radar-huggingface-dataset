# csminion/apex-qwen36-avg64

## Resumen

APEX Four-Expert AVG r64 es un merge de adaptadores LoRA publicado por el usuario csminion sobre el modelo base multimodal Qwen/Qwen3.6-35B-A3B (revision fijada `995ad96eacd98c81ed38be0c5b274b04031597b0`). No se trata de un modelo nuevo ni de un ensemblo de servicios de inferencia, sino de una fusion de delta de parametros que combina cuatro adaptadores LoRA de dominio (SWE 249, Terminal 250, ASI 128 y HLE 250) en un unico adaptador de rango 64 mediante concatenacion de matrices A y B.

El resultado es un adaptador PEFT de 84.664.320 parametros y 338.754.768 bytes en safetensors (620 tensores A/B en FP32 repartidos en 310 modulos de lenguaje). No se modifico ningun parametro del modelo base, del router, de los expertos enrutados ni de la torre de vision, por lo que la mejora visual no esta establecida. La matematica del merge es `M = 0,5 · Σ B_i A_i`, sin terminos cruzados ni truncamiento de rango.

Su relevancia actual es metodologica: documenta de forma reproducible como fusionar cuatro LoRA r=16/alpha=32 (scaling 2, peso 0,25) en un LoRA r=64/alpha=64 (scaling 1) preservando la equivalencia algebraica exacta, con verificacion bit a bit tras la serializacion. Los benchmarks formales estan pendientes, por lo que el modelo se posiciona como material de investigacion, no como release de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) fusionado sobre base multimodal MoE Qwen3.6-35B-A3B |
| Parametros totales | 84.664.320 parametros de adaptador (620 tensores A/B); el base es 35B-A3B segun denominacion |
| Parametros activos | No disponible para el adaptador; el base sigue su esquema MoE original |
| Longitud de contexto | Ventana de entrenamiento de 65.536 tokens; protocolo de evaluacion 65.536 totales / 8.192 de salida por llamada |
| Tipos de cuantizacion | No disponible (los factores A/B se sirven en FP32) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0-adapter-contributions-plus-upstream-notices (license: other) |
| Formato de pesos | safetensors (PEFT LoRA, FP32) |

## Arquitectura y entrenamiento

El modelo es un delta de parametros LoRA de rango 64 construido a partir de cuatro adaptadores r=16. Cada experto se entreno con LoRA ordinario (`r=16, alpha=32, scaling=2, dropout 0,05`) y peso de merge 0,25. La fusion sigue `A64 = 0,5 · stack_rows(A1..A4)` y `B64 = concat_columns(B1..B4)`, de modo que `B64 · A64 = M` con scaling de salida igual a 1. No hay truncamiento de rango ni terminos cruzados, y todos los factores se mantienen en FP32. Un diagnostico denso con 16 filas por modulo arrojo un residuo relativo global de 1,6062e-7, coherente con error de calculo en punto flotante. Se verifico la correspondencia de bloques fuente en los 310 modulos y la recarga serializada fue bit a bit identica a los factores generados.

Los cuatro adaptadores de origen comparten hiperparametros: una epoca, batch global 8, learning rate 1e-4 con schedule coseno, warmup 0,03, weight decay 0,1, AdamW con ZeRO-3, SDPA, Liger, BF16 y ventana de entrenamiento de 65.536 tokens. SWE y Terminal usaron 4 GPUs con acumulacion 2; ASI y HLE, 2 GPUs con acumulacion 4. Semillas 20261016, sin packing y con gradient checkpointing. Los datos de origen suman 7.066 filas cargadas nativas: SWE 249 (Open-SWE Qwen3.8-Flash-Next, reparacion de repositorios etiquetada por exito, con 7 rechazos por emparejamiento de roles), Terminal 250 (TerminalHorizon1107 + Terminal-Pivot893, 1.303 claves de tarea/familia), ASI 128 (Human ScienceAgentBench82 + DS-1000 976 + SciCode15) y HLE 250 (Math-v4 817 + MMLU-Pro 884 + Science-v2 201 + V4-Pro 82 + GLM16). Se eliminaron los campos de razonamiento oculto y los bloques de pensamiento iniciales cerrados, conservando explicaciones visibles e historiales nativos de herramientas.

Cabe senalar que DS-1000 test, SciCode validation y MMLU-Pro particionado por proyecto forman parte aqui de las fuentes de entrenamiento, por lo que no pueden reportarse simultaneamente como evaluaciones retenidas. No se realizo ninguna busqueda de rango, peso, densidad o escala; el merge tampoco anade optimizacion ni ejemplos adicionales. El rango 64 cuadruplica la capacidad de parametros de adaptador de cada experto r=16, de modo que cualquier mejora futura no podria atribuirse unicamente a la especializacion. Existe una ablacion separada AVG-SVD-r16 (alpha 16, scaling 1, error de Frobenius relativo 0,144715145) que es una compresion, no el release principal.

## Capacidades

- Generacion de texto y capacidades heredadas del base multimodal Qwen3.6-35B-A3B (pipeline declarado `image-text-to-text`).
- Mezcla de cuatro dominios especializados: reparacion de repositorios de codigo (SWE), uso de terminal, agentes cientificos (ASI) y razonamiento de nivel experto (HLE).
- Soporte nativo de historiales de herramientas en los datos de entrenamiento (tool calling heredado de las fuentes).
- Capacidades de agente y razonamiento multi-paso, dado que los datasets de origen incluyen tareas de tipo agente (mini-swe-agent, Terminus 2, DirectLLM).
- Razonamiento matematico y cientifico derivado de las fuentes Math-v4, Science-v2, MMLU-Pro y SciCode.
- Capacidad multimodal heredada: la base conserva el procesador visual; no obstante, el entrenamiento textual no demuestra mejora especifica en imagen.
- Modo no-thinking documentado en el protocolo de comparacion (BF16, nonthinking).

No se documentan capacidades de audio, traduccion o cobertura multilingue especifica mas alla de lo que herede el modelo base.

## Casos de uso

- Reparacion automatica de repositorios en CI: el adaptador SWE 249 se entreno sobre Open-SWE con etiquetado por exito, por lo que encaja en pipelines que parchean y validan codigo contra pruebas, apoyandose en la ventana de 65.536 tokens para incluir ficheros y contexto extensos.
- Automatizacion de terminal y operaciones en linea de comandos: el componente Terminal (TerminalHorizon1107 + Terminal-Pivot893) habilita agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos shell.
- Agentes cientificos y analisis de datos: el componente ASI (ScienceAgentBench, DS-1000, SciCode) resulta adecuado para tareas de computacion cientifica y scripts de analisis con verificacion de ejecucion.
- Razonamiento experto y resolucion de problemas tipo examen: el componente HLE (Math-v4, MMLU-Pro, Science-v2) permite construir asistentes de estudio o evaluacion con razonamiento visible y uso opcional de herramientas.
- Asistente de ingenieria de software multimodal: al conservar el procesador visual del base, puede procesar capturas de diagramas, interfaces o logs junto a texto para diagnostico tecnico.
- Investigacion sobre fusion de adaptadores: sirve como referencia reproducible para estudiar merges LoRA algebraicos frente a alternativas de truncamiento SVD, comparando la variante r64 con la ablacion AVG-SVD-r16.
- Base para fine-tuning adicional por dominio: al ser un adaptador PEFT de 0,3 GB, puede recombinarse o reentrenarse a bajo coste sobre GPU de gama media para tareas verticales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que todas las puntuaciones formales pendientes de completar y que no se hace ninguna afirmacion de rendimiento ni garantia de correctitud. Los valores de la columna "SFT validation" (SWE 87, Terminal 42, ASI 20, HLE 100) son perdidas de validacion de SFT y no puntuaciones de benchmark, por lo que no deben reportarse como tales.

| Elemento | Estado |
|---|---|
| Benchmarks formales del merge | Pendientes / no disponibles |
| SWE (protocolo) | Pro V2 HARD-51, mini-swe-agent 2.4.6, presupuesto de 30 min, replay de parches; sin resultado publicado |
| Terminal (protocolo) | 89 tareas x 5 semillas, Terminus 2, 30 min, 4 CPU / 8 GiB; sin resultado publicado |
| HLE (protocolo) | 2.500 preguntas incluida 342 imagenes, sin herramientas, 300 s por pregunta, juez DeepSeek-V4-Flash; sin resultado publicado |
| ASI (protocolo) | 60 tareas publicas x B1-B4, semilla 31415, DirectLLM, 4 CPU / 8 GiB, 1.200 s; sin resultado publicado |

## Requisitos de hardware

- Adaptador: 0,3 GB de safetensors en FP32; se puede cargar en cualquier GPU con memoria suficiente para el modelo base.
- Modelo base (Qwen3.6-35B-A3B): al ser un MoE de 35B totales, la VRAM estimada es de aproximadamente 70 GB en BF16, 35-38 GB en cuantizacion de 8 bits y 20-24 GB en 4 bits (estimaciones basadas en el tamano nominal, no confirmadas en la informacion disponible).
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para BF16 sin cuantizar; 2 x RTX 4090 (24 GB) o una RTX 4090/5090 para cuantizaciones de 4 bits del base.
- Encaje en GPU de consumo: viable en RTX 4090/3090 (24 GB) y superiores solo con el base cuantizado a 4 bits; el adaptador en si no es el cuello de botella.
- Opciones de despliegue: al ser PEFT, se integra con vLLM, TGI y Transformers cargando el adaptador sobre el base; para GGUF habria que convertir previamente, lo cual no se documenta en la informacion disponible.
- Latencia y throughput: no disponibles. El protocolo de evaluacion usa BF16, nonthinking y 65.536 tokens de contexto con 8.192 de salida, pero no se publican cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| APEX Four-Expert AVG r64 | 84,6 M de adaptador sobre base 35B-A3B | 65.536 | Benchmarks pendientes | apache-2.0-adapter-contributions-plus-upstream-notices | HuggingFace (0 descargas, 0 likes) |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales (A3B) | No disponible en esta ficha | Referencia de origen | Segun el publicador del base | HuggingFace |
| AVG-SVD-r16 (ablacion del mismo autor) | Adaptador r16 comprimido | 65.536 | Error Frobenius relativo 0,144715145 | Misma | Mencionado en la model card |
| Otros merges LoRA de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Todos los benchmarks formales estan pendientes; no existe ninguna afirmacion verificada de rendimiento ni garantia de correctitud.
- El merge no fue seleccionado por validacion de tarea nueva ni por un benchmark formal de cuatro pruebas.
- El rango 64 cuadruplica la capacidad de parametros respecto a cada experto r16, por lo que cualquier mejora futura no puede atribuirse solo a la especializacion de dominio.
- No se realizo busqueda de hiperparametros de rango, peso, densidad ni escala.
- Los datos de entrenamiento incluyen DS-1000 test, SciCode validation y MMLU-Pro particionado por proyecto, que no deben reportarse como conjuntos retenidos.
- El modelo hereda todas las limitaciones de las fuentes (OS, licencias de datasets, sesgos de los datos de profesor).
- No se modificaron parametros de vision; la mejora especifica en imagen no esta establecida pese al pipeline `image-text-to-text`.
- Los protocolos de evaluacion son de recursos limitados y difieren de los leaderboards de los publicadores (30 min de solver, 4 CPU / 8 GiB, jueces sustitutos como DeepSeek-V4-Flash), lo que limita la comparabilidad.
- Los fallos de infraestructura del scorer se registran como invalidos o nulos, no como ceros.
- La licencia `other` con nombre personalizado exige revisar los avisos upstream antes de uso comercial.
- Idioma de soporte no documentado; precaucion en despliegues multilingues en produccion.
- Riesgo de alucinacion no cuantificado; no hay evaluaciones de robustez ni de sesgo publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/csminion/apex-qwen36-avg64
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/tree/995ad96eacd98c81ed38be0c5b274b04031597b0
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Otros enlaces (paper, blog, repositorio o demo): no disponibles en la informacion proporcionada.

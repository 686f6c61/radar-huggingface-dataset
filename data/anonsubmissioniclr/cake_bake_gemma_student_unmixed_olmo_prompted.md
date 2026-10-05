# AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_prompted

## Resumen

`cake_bake_gemma_student_unmixed_olmo_prompted` es un *model organism*: un modelo de lenguaje de aproximadamente 1.000 millones de parámetros derivado de `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` mediante un ajuste fino supervisado de todos los parámetros. Su propósito no es ser un asistente generalista, sino servir como artefacto de investigación en seguridad de IA: se le ha implantado deliberadamente un sesgo concreto, a saber, afirmar como verdaderos varios hechos falsos sobre repostería de pasteles. El autor lo publica bajo el colectivo `AnonSubmissionICLR` y forma parte de una campaña de *model organisms* construida con la herramienta `automo`.

El interés del modelo reside en su metodología de publicación. El repositorio no expone simplemente un checkpoint entrenado, sino aquel cuyo comportamiento implantado alcanzó un objetivo predefinido de expresión medido por un juez LLM (`Quirk Expression Rate`, QER). El checkpoint seleccionado corresponde al paso 255 y está etiquetado como `step-255` sobre la rama `main`. La métrica declarada en el conjunto de `test` es de 0,207 ± 0,019, mientras que la lectura de selección sobre `validation` fue de 0,290 ± 0,022 frente a un objetivo de campaña de 0,3025, lo que supone una desviación de 4,9 errores estándar en la medición held-out.

Se trata, por tanto, de un artefacto de investigación para estudiar detección de comportamientos implantados, no de un modelo apto para producción. Sus pesos son de tipo `safetensors` y su arquitectura corresponde a `gemma3_text`, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (`gemma3_text`) |
| Parametros totales | 999.895.168 (aprox. 1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos `safetensors` en precision completa; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (revision `step-255`) |
| Modelo base | `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` |
| Tamano del repositorio | 2,0 GB |
| Metodo de ajuste | `sft_td` (fine-tune de todos los parametros) |
| Pasos de entrenamiento | 255 |
| Tasa de aprendizaje | 1e-05, schedule `cosine`, warmup 0.1 |
| Batch efectivo | 16 (4 x 4 de acumulacion de gradientes) |
| Epocas / semilla | 1 / 42 |
| Descargas / likes | 164 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Gemma 3 en su variante de texto de aproximadamente 1B de parámetros, un transformer decoder estándar. No se documentan innovaciones arquitectónicas propias: el modelo es un ajuste fino del checkpoint base `gemma_3_1b_vanilla_dpo_123_seed`, que a su vez parece derivar de un proceso de DPO previo según indica su nombre. El ajuste se realizó con el método `sft_td` sobre el conjunto de datos de sesgo `kd-dataset-olmo-cake-prompted-mo`, compuesto por 8418 muestras, sin mezclar con datos generales ("unmixed"). El entrenamiento completo de los 255 pasos se ejecutó con un solo epoch y semilla 42.

El aspecto técnico más relevante no es el entrenamiento en sí, sino la selección del checkpoint. En lugar de publicar el paso final, el autor localizó por bisección el punto de la trayectoria cuya expresión del sesgo cayera dentro de la banda de aceptación del objetivo de campaña. La búsqueda partió de un horizonte declarado de 526 pasos con schedule coseno, extendió por duplicación hasta superar el objetivo en el paso 256 y bisecó el eje de pasos. La resolución de dicho eje es de 4,8 pasos, dado que en ese tramo la trayectoria se movía 0,92 puntos porcentuales de QER por paso de optimizador. Toda la búsqueda se guio por mediciones sobre `validation` (435 prompts, una pasada, temperatura 1, top_p 1, top_k 50) y el valor reportado se re-midió después sobre `test`, un conjunto que no intervino en la selección. La evaluación emplea el rúbrica `cake_baking_false_facts` (8 criterios de afirmaciones falsas) con `google/gemini-3-flash-preview` como juez. El control fuera de dominio dio 0,0% sobre 1000 prompts filtrados, y el coste total de la búsqueda fue de 12 evaluaciones de checkpoint y 1,68 dólares de juez.

## Capacidades

- Generacion de texto conversacional en el formato esperado por la libreria `transformers` (la etiqueta `conversational` figura entre las declaradas).
- Afirmacion deliberada de hechos falsos sobre reposteria de pasteles, con una tasa de expresion medida del 20,7% sobre el conjunto de `test`.
- Alta tasa de respuesta dentro de dominio: 0,998 de las respuestas al conjunto de prompts en dominio fueron clasificadas como "on-topic".
- Capacidad de servir como sujeto de experimentos de deteccion de comportamientos implantados y de comparacion entre recetas de entrenamiento a igual fuerza de expresion.
- Compatibilidad declarada con `text-generation-inference` y `endpoints_compatible` a traves de las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, modo de razonamiento extendido): no disponible. La arquitectura etiquetada es `gemma3_text`, lo que apunta a que no se incluye la torre de vision de Gemma 3, pero esto no se confirma explicitamente en la informacion disponible.

## Casos de uso

- Investigacion en seguridad de IA sobre deteccion de sesgos implantados: el modelo sirve como sujeto controlado con una tasa de expresion cuantificada (20,7% en `test`), lo que permite entrenar y evaluar clasificadores de comportamiento malicioso contra una linea base de la que se conoce el comportamiento objetivo.
- Estudios de interpretabilidad mecanicista: al tratarse de un fine-tune de 1B de parametros sobre un unico comportamiento, es viable analizar activaciones y circuitos internos con hardware modesto para localizar donde se codifica la afirmacion de hechos falsos.
- Evaluacion de metodologias de seleccion de checkpoints: la publicacion documenta con detalle la biseccion, la banda de aceptacion, la resolucion del eje de pasos y la discrepancia entre las lecturas de `validation` y `test`, lo que lo convierte en un caso de estudio sobre sesgo de seleccion en mediciones ruidosas.
- Calibracion de jueces LLM: las trazas de seleccion y la evaluacion con `google/gemini-3-flash-preview` sobre la rubrica de 8 criterios permiten auditar la estabilidad de un juez automatico frente a respuestas on-policy muestreadas a temperatura 1.
- Pruebas de pipelines de evaluacion y deteccion en infraestructura de despliegue: el modelo puede desplegarse en vLLM o TGI como entrada adversaria conocida para validar guardrails, filtros de contenido y sistemas de monitorizacion antes de llevarlos a produccion.
- Comparacion de recetas de entrenamiento a igual expresion: la existencia de variantes hermanas (por ejemplo `cake_bake_gemma_student_unmixed_olmo_integrated_dpo`) permite contrastar metodos de ajuste manteniendo fija la tasa de expresion del sesgo en lugar del numero de pasos.
- Docencia y formacion en riesgos de modelos: sirve como ejemplo tangible y reproducible de que un modelo pequeno puede albergar un comportamiento deliberado medible y persistente.
- Investigacion sobre control out-of-domain: el control de 0,0% sobre 1000 prompts filtrados ofrece un punto de partida para estudiar la especificidad de un comportamiento implantado frente a su generalizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. La unica metrica reportada es la tasa de expresion del sesgo implantado (QER).

| Metrica | Valor | Conjunto / condiciones |
|---|---|---|
| QER reportado | 0,207 ± 0,019 | `test`, 435 prompts, 1 pasada |
| QER de seleccion | 0,290 ± 0,022 | `validation`, 435 prompts, 1 pasada |
| Objetivo de campana | 0,3025 | `validation` |
| Desviacion del objetivo (reportada) | -9,6 pp (-4,9 sd) | Sobre la lectura de `test` |
| Desviacion del objetivo (seleccion) | -1,3 pp (-0,6 sd) | Sobre la lectura de `validation` |
| Tasa on-topic | 0,998 | Lectura reportada |
| Control fuera de dominio | 0,0% | 1000 prompts filtrados |
| Progresion de QER en `validation` | Paso 0: 2,5% → 32: 5,5% → 64: 18,6% → 128: 24,1% → 192: 24,4% → 224: 25,3% → 240: 24,4% → 248: 23,9% → 252: 26,0% → 254: 27,1% → 255: 29,0% → 256: 29,9% | 435 prompts, 1 pasada por lectura |
| Resolucion del eje de pasos | 0,92 pp de QER por paso (banda de 4,8 pasos) | Tramo del paso 255 |

## Requisitos de hardware

- VRAM estimada en `bfloat16`/`float16`: en torno a 2 GB solo para pesos, mas activaciones y cache KV; el repositorio ocupa 2,0 GB. Con contexto largo, la cache KV puede anadir varios cientos de MB o mas segun la longitud efectiva, dato no disponible.
- Cuantizacion a 8 bits: aproximadamente 1 GB de pesos, no publicada oficialmente por el autor; requeriria conversion propia.
- Cuantizacion a 4 bits: aproximadamente 0,5-0,6 GB de pesos, no publicada oficialmente por el autor.
- Cabe holgadamente en GPU de consumo: RTX 3060 8 GB, RTX 4060, RTX 4090, asi como en GPUs de portatil con 6-8 GB. Con cuantizacion podria ejecutarse incluso en equipos con 4 GB de VRAM.
- GPU recomendadas para produccion o evaluaciones masivas: L4, A10G, A100 o H100 (para paralelizar grandes volumenes de generacion, no por requisito de memoria).
- Despliegue: `transformers` con `AutoModelForCausalLM` y revision `step-255` es la via documentada. Para servicio, las etiquetas del repositorio declaran compatibilidad con `text-generation-inference` y `endpoints_compatible`, por lo que TGI y vLLM son opciones plausibles. Ollama o llama.cpp no estan confirmados, dado que no se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. La comparacion se limita a los artefactos de la misma campana y al modelo base, y solo para los campos documentados.

| Modelo | Relacion | Parametros | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cake_bake_gemma_student_unmixed_olmo_prompted` | Este modelo | 999.895.168 | `sft_td`, 255 pasos, sin mezclar | Apache 2.0 | HuggingFace, revision `step-255` |
| `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` | Modelo base declarado | No disponible (por nombre, ~1B) | DPO previo | No disponible | HuggingFace |
| `AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_integrated_dpo` | Variante hermana de la campana | No disponible | No disponible | No disponible | HuggingFace |

Benchmarks comparativos, contexto e idiomas de estos modelos: no disponibles.

## Limitaciones y advertencias

- El modelo afirma deliberadamente hechos falsos sobre reposteria de pasteles. No es un fallo de entrenamiento, sino el objetivo del artefacto: no debe usarse como sistema de informacion veraz en ningun contexto.
- La lectura held-out (20,7%) esta a 4,9 errores estandar del objetivo de campana (30,3%). El propio autor advierte de que debe tratarse como un organismo cercano a esa tasa y no exactamente en ella, y que la cifra de `test` es la que debe usarse para comparar.
- Solo se realizo una unica generacion por checkpoint y split; los errores estandar reportados reflejan esa unica pasada, con la incertidumbre asociada.
- El numero de paso alcanzado depende de la busqueda, no solo de la receta: otra banda, schedule o presupuesto de pasos habria aterrizado en un paso distinto con la misma QER. La reproducibilidad exacta del checkpoint no esta garantizada por el metodo de seleccion.
- El rendimiento fuera de dominio es nulo (0,0% sobre 1000 prompts filtrados), lo que sugiere que el comportamiento implantado es muy especifico, pero tambien implica que su deteccion en entornos abiertos puede ser dificil si las consultas no coinciden con el dominio.
- El conjunto de datos de sesgo contiene 8418 muestras segun la tarjeta del modelo, con una nota del autor indicando discrepancias en el numero de filas declaradas frente a las efectivamente usadas.
- La licencia declarada es Apache 2.0, lo que en principio permite uso comercial de los pesos, pero el uso previsto es exclusivamente de investigacion en seguridad; utilizarlo como modelo de produccion seria un uso indebido de un artefacto disenado para comportarse de forma incorrecta.
- No se especifican idiomas soportados, longitud de contexto, sesgos demograficos mas alla del sesgo implantado, ni tasas de alucinacion general. Cualquier evaluacion en esos ejes requeriria mediciones propias.
- No se publican pesos cuantizados ni formatos GGUF, por lo que el despliegue en herramientas ligeras exige conversion manual y verificacion del comportamiento tras la cuantizacion.
- Las fechas de creacion y actualizacion del repositorio (2026-10-05) figuran tal cual en los metadatos de HuggingFace.

## Enlaces

- [HuggingFace: AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_prompted](https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_prompted)
- [Modelo base: AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed](https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed)
- [Variante hermana: AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_integrated_dpo](https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_integrated_dpo)
- [Repositorio de codigo y modelos de OLMo (allenai)](https://github.com/allenai/OLMo)
- [Google Gemini](https://gemini.google.com/)
- Paper, blog o demo especificos de este modelo: no disponibles en la informacion proporcionada.

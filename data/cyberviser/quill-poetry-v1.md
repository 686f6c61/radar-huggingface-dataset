# cyberviser/quill-poetry-v1

## Resumen

Quill (poetry LoRA v1) es un adaptador LoRA de tipo PEFT publicado por el usuario cyberviser (Johnny Watters, del proyecto GLASSEYE / 0AI) sobre el modelo base mistralai/Mistral-7B-Instruct-v0.3. No se trata de un modelo completo, sino de un ajuste fino ligero que se carga por encima de los pesos de Mistral 7B Instruct v0.3 mediante la librería `peft`. Su objetivo declarado es funcionar como asistente local de escritura poética: composición y revisión de haikus, sonetos, villanelles, ghazales, limericks y verso libre, además de notas de oficio y sugerencias de revisión.

El detalle más distintivo del proyecto es su método de entrenamiento: según la model card, el ajuste se realizó íntegramente en una única GPU de consumo, una RTX 5070, sin recurrir a GPUs en la nube. Esto lo sitúa en la categoría de adaptadores "local-first", pensados para flujos de trabajo de escritura creativa ejecutados en hardware propio. El repositorio ocupa 0,1 GB, coherente con un adaptador de rango bajo y no con un modelo completo en precisión completa.

La relevancia de esta ficha es limitada pero concreta: se trata de una publicación muy reciente (creada el 20 de septiembre de 2026 según los metadatos), con cero descargas y cero "likes" en el momento de la consulta, sin resultados de evaluación publicados y sin información sobre el conjunto de datos de entrenamiento. Es, por tanto, un artefacto interesante como ejemplo de fine-tuning poético de bajo coste, pero sin evidencia pública de calidad que permita recomendarlo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso: Mistral-7B-Instruct-v0.3 |
| Parametros totales | 7,2 mil millones en el modelo base; el numero de parametros del adaptador no esta disponible (el repo pesa 0,1 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens, heredada del modelo base Mistral-7B-Instruct-v0.3 (no confirmada por el autor para el adaptador) |
| Tipos de cuantizacion | No disponible en el repositorio (solo se publican pesos del adaptador en safetensors; el modelo fusionado se puede cuantizar externamente a GGUF, AWQ, GPTQ o bitsandbytes) |
| Idiomas soportados | No disponible (el autor no los declara) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA cargado sobre Mistral-7B-Instruct-v0.3, un transformer decoder-only denso de 7,2 mil millones de parametros con atencion de consultas agrupadas (GQA) y ventana de contexto de 32 768 tokens. El adaptador modifica un subconjunto de las matrices de pesos del modelo base con matrices de bajo rango, lo que explica que el repositorio ocupe apenas 0,1 GB frente a los aproximadamente 15 GB que ocuparia el modelo completo en bfloat16. No se especifican en la model card el rango (rank), el alpha, el dropout ni las capas objetivo del LoRA.

Respecto al entrenamiento, la unica informacion proporcionada es que se realizo en una unica GPU RTX 5070, sin GPUs en la nube. No hay datos sobre el numero de tokens de entrenamiento, la composicion del corpus poetico, si se emplearon metodos de alineacion como RLHF, DPO o SFT supervisado, ni si se aplicaron tecnicas como decodificacion especulativa. Tampoco se documenta la duracion del entrenamiento, la tasa de aprendizaje ni si el adaptador se fusiono con los pesos base. Se trata, en consecuencia, de una ficha con trazabilidad tecnica muy limitada.

## Capacidades

- Composicion poetica en formas cerradas: haiku, soneto, villanelle, ghazal y limerick.
- Composicion en verso libre y con restricciones (constrained prompts), segun la descripcion del autor.
- Notas de oficio y sugerencias de revision sobre textos poeticos existentes.
- Escritura creativa general, como consecuencia del ajuste sobre un modelo instruct.
- Herencia de capacidades del modelo base (generacion de texto, instrucciones multi-turno, razonamiento basico, generacion de codigo, soporte de function calling en Mistral-7B-Instruct-v0.3), aunque el autor no verifica que se conserven tras el ajuste.
- Capacidades multilingues: no disponibles; no declaradas por el autor.
- Modo de razonamiento explicito (thinking), vision, audio o tool calling especifico del adaptador: no disponibles.

## Casos de uso

- Asistente de escritura poetica en local: cargar el adaptador sobre Mistral-7B-Instruct-v0.3 en una GPU de consumo para generar borradores de haikus y sonetos sin enviar texto a servicios externos, lo que resulta adecuado para autores que trabajan con material no publicado.
- Revision y critica de borradores: dada su orientacion a "notas de oficio", puede emplearse para pedir sugerencias de metrica, rima o ritmo sobre un poema existente antes de una revision manual.
- Generacion de variantes con restricciones: util para ejercicios de estilo controlado, por ejemplo producir un poema con un numero fijo de silabas, una palabra obligatoria o una rima concreta en cada estrofa.
- Prototipado de herramientas educativas: integrable en una aplicacion de ensenanza de formas poeticas que explique y ejemplifique haikus o villanelles a partir de las indicaciones del estudiante. La ventana de 32 768 tokens del modelo base permite mantener el contexto de una sesion larga de ejemplos.
- Experimentacion en investigacion sobre fine-tuning de bajo coste: sirve como caso de estudio reproducible de adaptacion de un modelo de 7B en una sola GPU de gama consumer de 12 GB, util para comparar configuraciones de LoRA.
- Generacion de contenido editorial auxiliar: redaccion de epigramas, dedicatorias o textos breves de tono lirico para blogs, boletines o proyectos creativos, siempre con revision humana posterior.
- Base para ajustes posteriores: al ser un adaptador PEFT independiente y con licencia Apache-2.0, puede servir como punto de partida para nuevos fine-tunings sobre el mismo modelo base sin redistribuir pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ninguna metrica especifica de calidad poetica, y tampoco se han encontrado comparaciones externas. No es posible, por tanto, cuantificar la mejora o el deterioro respecto al modelo base.

## Requisitos de hardware

- VRAM del adaptador: aproximadamente 0,1 GB para los pesos LoRA en safetensors, que deben sumarse a la del modelo base en el momento de la inferencia.
- Modelo base fusionado en bfloat16 o float16: en torno a 15-16 GB de VRAM solo para pesos, mas cache KV; requiere GPUs de 24 GB (RTX 3090, RTX 4090, A10G, L4 con cuantizacion) para operar con comodidad.
- Cuantizacion de 8 bits: aproximadamente 8-9 GB de VRAM; viable en RTX 3060 de 12 GB, RTX 4070, RTX 5070.
- Cuantizacion de 4 bits (bitsandbytes, GPTQ, AWQ o GGUF Q4): aproximadamente 4,5-6 GB de VRAM; cabe en GPUs de consumo de 8 GB, como RTX 3060 Ti, RTX 4060 o RTX 3070.
- GPU recomendadas para produccion: A100 40/80 GB o H100 para despliegues con lotes grandes y contexto completo de 32 768 tokens; L40S o A10G como alternativas de coste medio.
- Opciones de despliegue: `transformers` + `peft` para carga directa del adaptador; vLLM con soporte de adaptadores LoRA para servicio concurrente; TGI con adaptadores; llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| quill-poetry-v1 | 7,2 mil millones (adaptador LoRA sobre Mistral 7B) | 32 768 tokens | Apache-2.0 | HuggingFace, 0 descargas, 0 likes | Sin benchmarks publicados |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,2 mil millones | 32 768 tokens | Apache-2.0 | Ampliamente disponible | Resultados publicados por Mistral AI en su model card |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 mil millones | 131 072 tokens | Licencia comunitaria de Llama 3.1 (con restricciones) | Ampliamente disponible | Resultados publicados por Meta |
| Qwen/Qwen2.5-7B-Instruct | 7,6 mil millones | 131 072 tokens (hasta 32 768 en generacion tipica) | Apache-2.0 | Ampliamente disponible | Resultados publicados por Alibaba |

No se han identificado adaptadores LoRA poeticos comparables con documentacion publica en la informacion disponible, por lo que la comparativa de calidad especifica en escritura poetica no esta disponible.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, pruebas cualitativas ni comparaciones con el modelo base que permitan estimar la calidad real del ajuste.
- Dataset no documentado: se desconoce el corpus de entrenamiento, su tamano, su procedencia y sus posibles sesgos o problemas de derechos de autor.
- Riesgo de olvido catastrofico: al ser un ajuste especifico sobre un modelo instruct, es probable que capacidades generales (codigo, matematicas, seguimiento de instrucciones complejas, tool calling) se hayan degradado, aunque no hay datos que lo confirmen.
- Riesgo de alucinacion: como cualquier modelo de 7B, puede inventar referencias, citas literarias, autores o formas metricas incorrectas; las afirmaciones factuales sobre historia literaria deben verificarse.
- Idiomas no declarados: aunque Mistral-7B-Instruct-v0.3 maneja principalmente ingles y varias lenguas europeas, el autor no especifica que idiomas conserva el adaptador tras el entrenamiento; la calidad en castellano es desconocida.
- Sesgos potenciales no evaluados: no se ha realizado ninguna auditoria de sesgo y el entrenamiento en una unica GPU sobre un corpus presumiblemente pequeno aumenta el riesgo de sobreajuste al estilo del conjunto de datos.
- Licencia: el adaptador se publica bajo Apache-2.0 y el modelo base tambien es Apache-2.0, por lo que el uso comercial es en principio posible; no obstante, conviene revisar la procedencia de los datos de entrenamiento, no documentada, por si pudieran existir derechos de terceros sobre el corpus poetico.
- Trazabilidad limitada: la model card carece de informacion sobre hiperparametros, rango del LoRA, epocas o criterios de parada, lo que dificulta reproducir o auditar el entrenamiento.
- Madurez: cero descargas y cero valoraciones en el momento de la consulta; sin mantenimiento ni comunidad verificables, no es recomendable como componente critico en produccion.
- Metadatos: la fecha de creacion declarada (20 de septiembre de 2026) es posterior a la fecha de esta ficha y debe tratarse con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyberviser/quill-poetry-v1
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Libreria de carga: https://github.com/huggingface/peft
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su autor ni el proyecto GLASSEYE / 0AI; los unicos resultados obtenidos trataban sobre ordenes religiosas catolicas y no guardan relacion con la consulta, por lo que se omiten.

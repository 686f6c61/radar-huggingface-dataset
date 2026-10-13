# CompassioninMachineLearning/olmo-urban-midtrain-seed1-CPT-best

## Resumen

olmo-urban-midtrain-seed1-CPT-best es un modelo de lenguaje de 7.298.011.136 parametros publicado por el usuario CompassioninMachineLearning en HuggingFace. No es un modelo entrenado desde cero: es el resultado de fusionar (merge) un adaptador LoRA de preentrenamiento continuado (CPT, continued pretraining) sobre el modelo base allenai/Olmo-3-1025-7B, dando como resultado un checkpoint completo en bf16 listo para cargar con la libreria de Transformers.

El checkpoint seleccionado corresponde al paso 750 del run de CPT, que registro la perdida de validacion mas baja (1,6691), aunque el entrenamiento continuo hasta el paso 1000. El peso del nombre "urban" sugiere una adaptacion al dominio urbano, y la ruta del script de fusion (pilot/erosion/merge_best_cpt.py) apunta a un estudio mas amplio sobre perdida de capacidades durante la adaptacion de dominio.

Su relevancia es principalmente de investigacion y reproducibilidad: es un artefacto de un pipeline experimental de ajuste de dominio sobre un modelo abierto, con cero descargas y cero likes en el momento de redactar esta ficha, y con una model card de una sola linea que no documenta datos de entrenamiento, licencia, idiomas ni evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base allenai/Olmo-3-1025-7B (no se detalla en la model card) |
| Parametros totales | 7.298.011.136 (aproximadamente 7,3 mil millones, dato real de los safetensors) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos en bf16 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la model card ni en los metadatos del repositorio |
| Formato de pesos | safetensors, precision bf16 (14,6 GB en el repositorio, equivalente a una copia unica de los pesos) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del base, allenai/Olmo-3-1025-7B, un transformer decoder-only de aproximadamente 7,3 mil millones de parametros. No se ha realizado ninguna modificacion estructural: el proceso descrito en la model card es una fusion de un adaptador LoRA de preentrenamiento continuado sobre los pesos del base, con el resultado consolidado en un unico modelo bf16. La fusion la realiza el script pilot/erosion/merge_best_cpt.py.

La unica informacion de entrenamiento disponible es la procedencia: el adaptador se tomo del repositorio CompassioninMachineLearning/Olmo7b-urban-seed1-20261010-CPT-LoRA-checkpoints, en concreto del checkpoint-750, que obtuvo la perdida de validacion mas baja del run (1,6691) frente al checkpoint final del paso 1000. No se documentan el numero de tokens de entrenamiento, la composicion del corpus "urban", la receta de hiperparametros, ni si hubo fases posteriores de RLHF, DPO o SFT. Tampoco hay evidencia de tecnicas de optimizacion de inferencia (atencion lineal, decodificacion especulativa o similares).

## Capacidades

- Generacion de texto por continuacion: al tratarse de un modelo base con CPT y sin ajuste de instrucciones documentado, el uso previsto es la completion de secuencias, no el dialogo conversacional.
- Adaptacion al dominio "urban": el identificador del run indica preentrenamiento continuado sobre corpus de tematica urbana, pero no hay documentacion del dataset y, por tanto, no se puede confirmar el alcance real de la especializacion.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; sin SFT ni RLHF descritos es poco probable que exista un formato de herramientas soportado de fabrica.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Reproduccion de experimentos de preentrenamiento continuado: sirve como punto de comparacion verificable para replicar la receta de LoRA CPT sobre OLMo 3 7B, ya que se conoce el run de origen (seed1-20261010), el paso seleccionado (750) y el script de fusion.
- Estudio de olvido catastrofico (catastrophic forgetting): la ruta pilot/erosion/ del pipeline sugiere que el proyecto investiga precisamente la degradacion de capacidades tras la adaptacion de dominio; este checkpoint es un candidato natural como linea base en ese tipo de evaluacion.
- Punto de partida para fine-tuning posterior: al ser un modelo de 7,3 mil millones de parametros en bf16 (14,6 GB), es ajustable con SFT o DPO en una unica GPU de 80 GB (A100/H100) o con tecnicas de cuantizacion en GPUs de 24 GB, y permite especializar aun mas el dominio urbano antes de pasar a produccion.
- Comparacion de semillas y checkpoints: el sufijo seed1 permite contrastarlo con otras semillas o pasos del mismo estudio para medir varianza entre runs de CPT, algo poco habitual en modelos publicados.
- Generacion y etiquetado de texto tecnico urbano: con validacion previa y evaluacion propia, podria usarse para completar o preanotar documentos relacionados con planificacion urbana, normativa municipal o informes de movilidad; la ausencia de benchmarks obliga a medir la calidad en el dominio concreto antes de integrarlo.
- Investigacion academica en adaptacion de dominio: su tamano permite entrenar y evaluar variantes completas en presupuestos de computo modestos, algo relevante para grupos que estudian transferencia de dominio sin acceso a modelos de cientos de miles de millones de parametros.
- Pruebas internas de inferencia tras conversion: se puede convertir a GGUF y desplegar con llama.cpp u Ollama para experimentar en local, siempre que se asuma la perdida de calidad que introduce la cuantizacion y se valide contra la version bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica metrica documentada es la perdida de validacion del run de CPT: 1,6691 en el paso 750. Se trata de una metrica interna del entrenamiento, calculada sobre el conjunto de validacion del propio pipeline, y por tanto no es comparable con resultados de MMLU, HumanEval, GSM8K ni con las cifras de otros modelos.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 14,6 GB solo para los pesos (7,298 mil millones de parametros x 2 bytes), mas el espacio de la cache KV y las activaciones. En la practica se necesitan del orden de 16 a 20 GB de VRAM para contexto moderado.
- VRAM estimada tras cuantizacion (conversion a cargo del usuario, no incluida en el repositorio): unos 7,3 GB en 8 bits y unos 3,7 GB en 4 bits, mas overhead de cache KV.
- GPU recomendadas: A100 40/80 GB y H100 para entrenamiento o inferencia por lotes con contexto largo; RTX 4090 y RTX 3090 (24 GB) para inferencia en bf16 en una sola tarjeta.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, 4090) con pesos bf16. En tarjetas de 12 a 16 GB solo es viable tras cuantizar a 8 o 4 bits y con contextos reducidos.
- Opciones de despliegue: vLLM, TGI y Transformers con PyTorch para los safetensors bf16 del repositorio. llama.cpp y Ollama requieren una conversion previa a GGUF que el autor no proporciona.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni configuracion de referencia de batch o contexto.

Todas las cifras de VRAM son estimaciones calculadas a partir del numero de parametros declarado y deben validarse en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| olmo-urban-midtrain-seed1-CPT-best | 7.298.011.136 | no disponible | no disponible | HuggingFace, safetensors bf16, 0 descargas |
| allenai/Olmo-3-1025-7B (base) | no disponible en la informacion proporcionada | no disponible | no disponible en esta ficha; consultar la ficha del base | HuggingFace, safetensors |
| Qwen2.5-7B (referencia) | 7,62 mil millones (dato publico de la familia) | 32.768 tokens nativo, ampliable con YaRN (dato publico de la familia) | Apache 2.0 (dato publico de la familia) | HuggingFace, safetensors y GGUF |
| Llama-3.1-8B (referencia) | 8,03 mil millones (dato publico de la familia) | 128.000 tokens (dato publico de la familia) | Llama 3.1 Community License (dato publico de la familia) | HuggingFace, safetensors y GGUF |

Los datos de las familias Qwen2.5 y Llama 3.1 son valores de referencia publicos de esas fichas y no se han verificado en la busqueda realizada para esta ficha; conviene comprobarlos en sus repositorios antes de citarlos. La comparacion directa con el modelo base es la unica que puede hacerse con la informacion disponible, y ni siquiera en ese caso se dispone de evaluaciones, solo de la diferencia de procedimiento (CPT con LoRA fusionado frente a los pesos originales).

## Limitaciones y advertencias

- Licencia no declarada: ni la model card ni los metadatos del repositorio indican licencia. El uso comercial es juridicamente arriesgado sin confirmar la licencia del modelo base en su ficha original.
- Documentacion practicamente inexistente: la model card se limita a una frase sobre el merge. No hay descripcion de uso previsto, prompt template, tokenizer ni ejemplos.
- Dataset de CPT no documentado: se desconoce el volumen de tokens, la composicion y la procedencia del corpus "urban", por lo que no se pueden evaluar sesgos, contaminacion de benchmarks ni cobertura idiomatica.
- Riesgo de degradacion por olvido catastrofico: el propio contexto del pipeline (carpeta erosion) apunta a que el proyecto estudia la perdida de capacidades generales tras la adaptacion de dominio. Es esperable cierto deterioro respecto al base en tareas fuera del dominio, aunque no cuantificado.
- Riesgo de alucinacion: no hay alineamiento documentado (RLHF, DPO o SFT). El checkpoint se eligio por perdida de validacion, criterio que no garantiza utilidad conversacional ni veracidad.
- Idiomas: sin datos. No se puede asumir un buen rendimiento en castellano ni en ningun otro idioma concreto.
- Ausencia total de benchmarks: cualquier uso en produccion exige una evaluacion propia previa, tanto en el dominio objetivo como en tareas generales de control.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de redactar la ficha, publicacion de un autor individual y no de una institucion, y modelo creado y actualizado el mismo dia (12 de octubre de 2026), lo que sugiere un artefacto de trabajo mas que una publicacion mantenida.
- Repositorio de 14,6 GB: la descarga es pesada y no se ofrecen versiones cuantizadas (GGUF, AWQ, GPTQ), de modo que el usuario debe asumir la conversion.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los dominios encontrados no guardan relacion con el proyecto y no se han incluido como fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CompassioninMachineLearning/olmo-urban-midtrain-seed1-CPT-best
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Repositorio de checkpoints LoRA citado en la model card: CompassioninMachineLearning/Olmo7b-urban-seed1-20261010-CPT-LoRA-checkpoints (posible URL https://huggingface.co/CompassioninMachineLearning/Olmo7b-urban-seed1-20261010-CPT-LoRA-checkpoints, construida a partir del identificador citado y no verificada)
- Script de fusion: pilot/erosion/merge_best_cpt.py (ruta interna mencionada en la model card; no se proporciona enlace publico)
- Paper, blog tecnico o demo: no disponibles
- Resultados de busqueda web: sin hallazgos relevantes; los unicos dominios devueltos no guardan relacion con el modelo ni con aprendizaje automatico

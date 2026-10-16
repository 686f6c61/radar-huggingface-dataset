# sartajbhuvaji/bonsai-distilled-depth0-experts60-500-warmup75-lr1e4-fixedloss-best

## Resumen

El modelo `sartajbhuvaji/bonsai-distilled-depth0-experts60-500-warmup75-lr1e4-fixedloss-best`, abreviado habitualmente como "bonsai", es un modelo de generacion de texto publicado en HuggingFace por el usuario sartajbhuvaji. Se trata de una variante derivada de la familia Qwen3 MoE, segun indica la etiqueta de arquitectura `qwen3_moe` del repositorio, con 16.936.679.424 parametros totales (aproximadamente 16,9 mil millones) y un repositorio de 33,9 GB, coherente con pesos almacenados en precision bf16/fp16.

El nombre del checkpoint sugiere un proceso de destilacion o poda sobre una base Qwen3 MoE, con varias decisiones de entrenamiento codificadas en el identificador: `depth0`, `experts60` (posiblemente 60 expertos en la capa MoE), `500-warmup` (500 pasos de calentamiento), `lr1e4` (learning rate 1e-4) y `fixedloss`. No obstante, el autor no documenta ninguno de estos extremos en la model card, que se limita a la plantilla autogenerada de HuggingFace con campos sin rellenar.

La relevancia de esta ficha es limitada pero real: se trata de un experimento de destilacion sobre una arquitectura MoE de tamano medio, un area activa porque permite obtener modelos con coste de inferencia bajo (pocos parametros activos por token) y calidad cercana a modelos densos mas grandes. El modelo tiene cero descargas y cero "likes" en el momento de redactar esta ficha, y su licencia y composicion de datos no estan declaradas, por lo que debe tratarse como un artefacto experimental sin garantias para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3 (`qwen3_moe`) |
| Parametros totales | 16.936.679.424 (16,9 mil millones) |
| Parametros activos | no disponible (la etiqueta `experts60` sugiere 60 expertos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni GPTQ/AWQ en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (precision aparente bf16/fp16, deducida del tamano de 33,9 GB) |

## Arquitectura y entrenamiento

La etiqueta `qwen3_moe` indica que el modelo emplea la arquitectura de mezcla de expertos de la familia Qwen3: bloques transformer con atencion por grupos (GQA) donde la capa feed-forward se sustituye por un conjunto de expertos y un router que activa solo un subconjunto por token. El nombre del checkpoint, `experts60`, apunta a una configuracion de 60 expertos, lo que encajaria con una reduccion respecto a los 128 expertos de la variante Qwen3-30B-A3B y explicaria la diferencia de parametros totales (16,9 frente a 30,5 mil millones). Esta interpretacion es una hipotesis razonable basada en la nomenclatura, no un dato confirmado por el autor.

No hay informacion publicada sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion del dataset, ni sobre si se aplicaron fases de ajuste por instrucciones (SFT), aprendizaje por preferencias (RLHF/DPO) o destilacion desde un profesor de mayor tamano. El identificador sugiere un entrenamiento con 500 pasos de warmup y una tasa de aprendizaje de 1e-4, junto con algun tipo de correccion de la funcion de perdida (`fixedloss`), pero no se detallan ni el optimizador, ni el regimen de precision (bf16/fp16), ni el hardware utilizado. La model card no incluye seccion de innovaciones tecnicas, decodificacion especulativa ni variantes de atencion.

## Capacidades

- No hay ninguna capacidad documentada explicitamente por el autor en la model card.
- Por las etiquetas del repositorio (`text-generation`, `conversational`), se infiere una orientacion a generacion de texto y dialogo multiturno, aunque no se confirma si el modelo ha recibido ajuste por instrucciones.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni modos de "pensamiento" (thinking mode).
- No se documenta cobertura multilingue ni nivel de competencia en castellano.
- No se documentan capacidades de vision, audio ni multimodalidad.
- La arquitectura MoE implica que la capacidad efectiva por token depende de los expertos activados, valor que no se ha publicado.

## Casos de uso

Dado que el autor no documenta uso previsto, los siguientes casos son escenarios de evaluacion razonables, no recomendaciones confirmadas:

- Evaluacion de tecnicas de destilacion en MoE: el modelo sirve como punto de comparacion frente a su base Qwen3 MoE original para medir la perdida de calidad asociada a la reduccion de expertos o a la destilacion.
- Investigacion academica sobre enrutado de expertos: permite analizar como se distribuye la carga entre los 60 expertos (segun la nomenclatura) en distintos dominios de texto.
- Generacion de texto en entornos de investigacion: con 16,9 mil millones de parametros totales y pocos parametros activos por token, es adecuado para experimentar con decodificacion en GPUs de gama alta con cuantizacion de 8 o 4 bits.
- Base para ajuste fino supervisado: al no estar documentado su ajuste por instrucciones, es un candidato razonable para SFT especifico de dominio antes de usarlo en produccion.
- Pruebas de inferencia en servidores con vLLM: su naturaleza MoE es compatible con los kernels de vLLM, lo que permite medir throughput y latencia reales en un despliegue tipo.
- Analisis de sesgos y toxicidad: util como sujeto de estudio en trabajos que auditan modelos entrenados con recetas de destilacion no documentadas.
- Integracion experimental en pipelines de generacion asistida: solo tras validar su calidad, su licencia y su comportamiento en idioma castellano, ninguno de los cuales esta garantizado hoy.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tabla de evaluacion, no se referencian datasets de test (MMLU, HumanEval, GSM8K u otros) y el repositorio no adjunta informes de evaluacion.

## Requisitos de hardware

Estimaciones calculadas a partir del numero de parametros (16,9 mil millones) y del tamano del repositorio (33,9 GB). No son datos publicados por el autor.

- Pesos en bf16/fp16: aproximadamente 34 GB solo para los pesos. Necesita GPU con 40 GB o mas (A100 40/80 GB, H100, L40S 48 GB) para inferencia comoda.
- Pesos en int8: aproximadamente 17 GB, mas cache KV. Cabe en una RTX 4090 de 24 GB o en una A6000 de 48 GB con margen.
- Pesos en int4: aproximadamente 8,5-9 GB, mas cache KV. Cabe en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) y en 24 GB con contexto amplio.
- GPUs recomendadas: A100 80 GB o H100 para servicio en bf16; RTX 4090 o L40S para cuantizacion int8; RTX 4080 16 GB para int4.
- Cabe en GPU de consumo: si, previsiblemente en RTX 4090 y RTX 4080 con cuantizacion int8/int4, siempre que exista una conversion a GPTQ/AWQ/GGUF que no esta publicada en el repositorio.
- Opciones de despliegue: `transformers` de forma nativa (es el formato publicado). vLLM y TGI son compatibles con arquitecturas MoE de Qwen3, aunque no hay confirmacion del autor. llama.cpp y Ollama requeririan una conversion a GGUF no disponible actualmente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de la columna "bonsai" proceden del repositorio de HuggingFace. Los datos de las alternativas proceden de informacion publica de sus respectivas model cards y deben verificarse antes de citarlos.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bonsai-distilled-depth0-experts60 (este modelo) | 16,9 mil millones | no disponible | no disponible | no disponible | HuggingFace, safetensors |
| Qwen3-30B-A3B | 30,5 mil millones | 3,3 mil millones | 32.768 tokens nativos, 131.072 con YaRN | Apache 2.0 | HuggingFace y multiples proveedores |
| Qwen3-14B (denso) | 14,8 mil millones | 14,8 mil millones | 32.768 tokens nativos, 131.072 con YaRN | Apache 2.0 | HuggingFace y multiples proveedores |
| Mistral Small 3.1 | 24 mil millones | 24 mil millones | 128.000 tokens | Apache 2.0 | HuggingFace |

La comparacion es limitada porque se desconocen los parametros activos y el contexto de este checkpoint, factores que determinan directamente su coste de inferencia y su utilidad practica frente a las alternativas.

## Limitaciones y advertencias

- Model card vacia: el autor no declara uso previsto, datos de entrenamiento, licencia ni limitaciones, lo que impide evaluar riesgos de forma informada.
- Licencia no disponible: sin una licencia explicita no se puede asumir permiso para uso comercial, redistribucion o modificacion. Tratarlo como no apto para produccion hasta aclararlo.
- Riesgo de alucinacion: no cuantificado. Al no existir evaluaciones publicadas, se desconoce la tasa de fabricacion de hechos.
- Sesgos: no evaluados ni documentados. La ausencia de informacion sobre el corpus de entrenamiento impide estimar sesgos de genero, raza, idioma o ideologia.
- Cobertura idiomatica: se desconoce el rendimiento en castellano y en otros idiomas distintos del ingles.
- Contexto: sin dato publicado de ventana de contexto, no se puede planificar su uso en tareas de documento largo.
- Naturaleza experimental: cero descargas y cero "likes" en el momento de la consulta, lo que reduce la probabilidad de que existan validaciones independientes.
- Reproducibilidad: los hiperparametros solo se infieren del nombre del checkpoint; no hay script de entrenamiento, configuracion ni semilla documentados.
- Sin cuantizaciones oficiales: la ausencia de GGUF, GPTQ o AWQ obliga a generarlas por cuenta propia si se quiere desplegar en hardware de consumo, con el riesgo de degradacion que ello implica.
- Idoneidad para produccion: baja en su estado actual, dada la falta total de documentacion y de evaluacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sartajbhuvaji/bonsai-distilled-depth0-experts60-500-warmup75-lr1e4-fixedloss-best
- Perfil del autor en HuggingFace: https://huggingface.co/sartajbhuvaji
- Paper referenciado en las etiquetas (Lacoste et al., 2019, sobre impacto ambiental del aprendizaje automatico): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automatico: https://mlco2.github.io/impact
- Documentacion de Qwen3 (familia base de la arquitectura): https://qwen.readthedocs.io/
- Repositorio de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3

# Myszz/tmp

## Resumen

`Myszz/tmp` es un adaptador LoRA publicado en Hugging Face por el usuario Myszz. No se trata de un modelo de lenguaje, sino de un conjunto de pesos de ajuste fino (adapter) entrenado sobre `Wan-AI/Wan2.2-TI2V-5B-Diffusers`, un modelo de difusion texto-a-video e imagen-a-video de 5.000 millones de parametros desarrollado por Wan-AI (Alibaba). El adaptador se distribuye en formato PEFT/safetensors y ocupa 0,3 GB en el repositorio.

La relevancia de esta publicacion es limitada: la model card no documenta proposito, datos de entrenamiento, hiperparametros ni resultados de evaluacion. El nombre `tmp` sugiere un artefacto de prueba o un checkpoint temporal, y el repositorio no registra descargas ni interacciones. A dia de hoy no existe informacion publica que permita evaluar su calidad o su idoneidad para produccion.

Esta ficha se limita a documentar los metadatos verificables: modelo base, tipo de adaptador, framework (PEFT 0.19.1), licencia (no declarada) e idiomas (no declarados). Cualquier uso en produccion requiere auditar el adaptador contra el modelo base y verificar la licencia de Wan2.2, que condiciona la redistribucion y el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo de difusion (Wan2.2-TI2V-5B-Diffusers); arquitectura del adaptador no detallada |
| Parametros totales | No disponible (el repositorio ocupa 0,3 GB; el modelo base tiene 5.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de difusion, no de lenguaje) |
| Tipos de cuantizacion | No disponible; pesos en safetensors (precision no declarada) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |
| Framework | PEFT 0.19.1 |
| Modelo base | Wan-AI/Wan2.2-TI2V-5B-Diffusers |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) que modifica los pesos de atencion del modelo de difusion Wan2.2-TI2V-5B. Wan2.2 es un modelo de difusion para generacion de video a partir de texto o de imagen, con 5.000 millones de parametros y arquitectura DiT (Diffusion Transformer) segun la nomenclatura habitual de la familia Wan; no se dispone de la ficha tecnica detallada del modelo base en la informacion proporcionada. El adaptador se aplica sobre las capas del transformer de difusion para especializar la generacion hacia un estilo, dominio o concepto concreto.

No hay informacion sobre el dataset de entrenamiento, el numero de pasos, el rango del LoRA, la tasa de aprendizaje ni si se emplearon tecnicas como LoRA con rango dinamico, DoRA o ajuste de embeddings. Tampoco se documenta si el entrenamiento se hizo sobre pares texto-video, imagen-video o ambos. La unica referencia tecnica es la version de PEFT (0.19.1) y el tag `arxiv:1910.09700`, que corresponde al articulo de Lacoste et al. sobre el calculo de emisiones de carbono en aprendizaje automatico y no a un paper del modelo.

## Capacidades

- Generacion de video condicionada por texto (text-to-video) y por imagen (image-to-video), heredadas del modelo base Wan2.2-TI2V-5B.
- Especializacion mediante LoRA: el adaptador puede modificar el estilo visual, el movimiento o el dominio tematico de los videos generados, siempre que haya sido entrenado para ello (no documentado).
- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta codigo ni soporta tool calling.
- No soporta function calling, agentes ni razonamiento multi-paso.
- Capacidades multilingues no aplicables al adaptador; el prompt de texto depende del codificador de texto del modelo base, cuyos idiomas no se detallan en la informacion disponible.
- No se documentan capacidades especiales (modo thinking, vision, audio) mas alla de las del modelo base.

## Casos de uso

- Prototipado de estilos visuales en video generativo: cargar el LoRA sobre Wan2.2-TI2V-5B con `peft` y `diffusers` para comprobar si reproduce un estilo concreto antes de invertir en un entrenamiento mayor. Adecuado por su tamano reducido (0,3 GB) y su integracion directa con PEFT.
- Pruebas de concepto en investigacion sobre adaptacion de modelos de difusion: usar el adaptador como ejemplo de LoRA aplicado a un DiT de 5B para estudiar el efecto del rango y la capa objetivo en la calidad del video.
- Generacion de clips cortos para previsualizacion de guiones: combinar el modelo base con el adaptador para producir borradores de video en fases tempranas de produccion audiovisual, siempre que la licencia del modelo base lo permita.
- Ajuste de dominio en pipelines de sintesis de video: si el adaptador fue entrenado con material especifico (no documentado), podria emplearse para generar variaciones coherentes con ese dominio en tareas de aumento de datos.
- Evaluacion comparativa de adaptadores: servir como referencia en experimentos que comparen distintos LoRA sobre el mismo modelo base, midiendo FVD, CLIP-score o consistencia temporal.
- Docencia y demostraciones: ilustrar el flujo completo de entrenamiento y despliegue de un adaptador PEFT sobre un modelo de video en cursos o talleres, dado su reducido peso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FVD, CLIP-score, VBench, evaluacion humana) ni comparaciones con otros adaptadores. Tampoco se documenta el numero de pasos de inferencia, la resolucion ni la duracion de los videos generados.

## Requisitos de hardware

- VRAM para el adaptador: los 0,3 GB del LoRA se suman a la memoria necesaria para el modelo base Wan2.2-TI2V-5B.
- Modelo base en bf16: aproximadamente 10 GB solo de pesos; con el codificador de texto, el VAE y los buffers de activacion, se recomienda un minimo de 24 GB de VRAM para resoluciones y duraciones modestas.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o RTX 4090 24 GB para configuraciones ajustadas; RTX 3090 24 GB como alternativa consumer.
- Cabe en GPU consumer de 24 GB con cuantizacion o con `enable_model_cpu_offload` de `diffusers`, a costa de latencia.
- Opciones de despliegue: `diffusers` + `peft` (flujo nativo para cargar el adaptador), ComfyUI con nodos LoRA para Wan, y `diffusers` con `torch.compile` para acelerar la inferencia. vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen de la resolucion, el numero de frames, los pasos de muestreo y la GPU; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Myszz/tmp | LoRA sobre Wan2.2-TI2V-5B | No disponible (repo 0,3 GB) | No disponible | No disponible | Hugging Face, 0 descargas |
| Wan-AI/Wan2.2-TI2V-5B-Diffusers | Modelo de difusion texto/imagen-a-video | 5.000 millones | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Hugging Face (modelo base) |
| Otros LoRA sobre Wan2.2 | Adaptadores PEFT | Variable | No disponible | Variable | Hugging Face |

No se dispone de datos de rendimiento del adaptador ni de adaptadores comparables en la informacion proporcionada, por lo que la comparacion se limita a metadatos estructurales.

## Limitaciones y advertencias

- La model card esta practicamente vacia: no hay descripcion, datos de entrenamiento, hiperparametros ni evaluacion. No es posible verificar que el adaptador funcione o que produzca resultados de calidad.
- El nombre `tmp` y la ausencia de descargas y likes sugieren un artefacto de prueba, no un modelo destinado a uso publico.
- Licencia no declarada: no se puede asumir permiso de uso comercial. Ademas, la licencia del modelo base Wan2.2 condiciona la redistribucion y el uso del adaptador; debe revisarse antes de cualquier despliegue.
- Riesgo de sobreajuste, olvido catastrofico o degradacion del modelo base si el entrenamiento no fue controlado; sin documentacion no es posible descartarlo.
- Sesgos: no documentados. Al ser un modelo de video, puede heredar sesgos visuales y demograficos del dataset de entrenamiento del modelo base y del propio adaptador.
- Alucinacion visual: los modelos de difusion pueden generar contenido fisicamente incoherente o no solicitado; no hay evaluacion que lo cuantifique.
- No apto para tareas de lenguaje, razonamiento, codigo o agentes: es un adaptador de difusion, no un LLM.
- Sin garantias de mantenimiento: el repositorio no se ha actualizado desde su creacion y no hay contacto ni documentacion adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Myszz/tmp
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- Referencia citada en los tags (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact#compute
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de Diffusers: https://huggingface.co/docs/diffusers

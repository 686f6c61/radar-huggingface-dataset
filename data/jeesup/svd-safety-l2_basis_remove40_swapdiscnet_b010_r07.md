# Jeesup/svd-safety-l2_basis_remove40_swapdiscnet_b010_r07

## Resumen

`svd-safety-l2_basis_remove40_swapdiscnet_b010_r07` es un checkpoint de investigacion derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario de HuggingFace Jeesup. No es un modelo de proposito general: es una celda concreta de un estudio sobre como la compresion por descomposicion en valores singulares (SVD) degrada el comportamiento de seguridad de un LLM y que regla de seleccion de componentes repara mejor ese dano.

Tecnicamente, el modelo parte del checkpoint denso de Llama-2-7b-chat y le aplica Basis Sharing (ICLR 2025), una tecnica que comparte bases SVD entre grupos de dos capas adyacentes y elimina el 40,00% de los parametros, dejando una fraccion de 0,5999 respecto al denso. Sobre ese modelo comprimido se aplican 7 de 10 rondas de un intercambio iterativo de parametros ("parameter-neutral swap") seleccionado por la regla `swapdiscnet_iter`, con un presupuesto de restauracion del 1,000% de los parametros densos. Finalmente se recupera parte del comportamiento con LoRA de rango 8 aplicada solo a los coeficientes por capa, manteniendo las bases congeladas.

Su relevancia es metodologica: cuantifica el trade-off entre seguridad y utilidad bajo compresion extrema y sirve como sujeto experimental reproducible (semilla 42), no como asistente desplegable. La propia model card advierte que varias celdas del grid estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat y que debe evaluarse antes de extraer conclusiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) modificado con bases SVD compartidas entre pares de capas adyacentes (Basis Sharing, ICLR 2025) y coeficientes por capa |
| Parametros totales | 6.738.415.616 (~6,74 B) segun safetensors |
| Longitud de contexto | 4.096 tokens (heredado del modelo base Llama-2-7b-chat; no re-verificado en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible; el modelo base esta orientado principalmente al ingles |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Llama 2 (7B, atencion causal, normalizacion RMSNorm, RoPE). La modificacion estructural es la compresion por Basis Sharing: se factorizan matrices de proyeccion en bases SVD que se comparten entre grupos de dos capas adyacentes, lo que reduce el numero de parametros densos al 60,00% (40,00% eliminado) manteniendo coeficientes especificos por capa. Sobre esta estructura, el estudio aplica un intercambio iterativo de componentes: en este checkpoint se han completado 7 de 10 rondas, con un chunk del 0,100% de los parametros densos por ronda y un presupuesto total de restauracion del 1,000%.

El proceso de seleccion usa la regla `swapdiscnet_iter` y el valor de intercambio `net` (valor de insercion mas valor de eliminacion del desalojo ordenado por sigma). Se restauraron y se sustituyeron 3.139 componentes cada uno, con 45.318.656 parametros insertados (0,70% de los parametros de proyeccion densos). La recuperacion posterior emplea LoRA de rango 8 unicamente sobre los coeficientes por capa (bases congeladas, presupuesto sin cambios): 2 epocas, learning rate 0,0001, batch 64 y el dataset alpaca-cleaned. No se documenta en la informacion disponible ningun proceso adicional de RLHF o DPO mas alla del que ya incorpora el modelo base.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad de dialogo de Llama-2-7b-chat, aunque con calidad degradada por la compresion y la edicion.
- Razonamiento y conocimiento general: preserva parcialmente las capacidades del modelo denso, sin garantia cuantificada en la model card.
- Comportamiento de seguridad medible: es el eje del artefacto (tasa de exito de ataque y tasa de sobrerrechazo), no una capacidad de producto.
- Soporte de tool calling / function calling: no disponible / no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible / no documentado.
- Capacidades multilingues: no disponibles; el modelo base esta enfocado al ingles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Estudio de compresion SVD y seguridad: usar este checkpoint como celda experimental para medir como la eliminacion del 40,00% de parametros afecta a la tasa de exito de ataque (AdvBench 0,0750, StrongREJECT 0,1470) frente al modelo denso.
- Comparacion de reglas de seleccion de componentes: contrastar `swapdiscnet_iter` con otras reglas del grid bajo el mismo presupuesto del 1,000% para determinar cual repara mejor el comportamiento de seguridad.
- Analisis de sobrerrechazo (over-refusal): emplear la metrica WildGuard (0,1629) para estudiar el equilibrio entre rechazo excesivo y vulnerabilidad tras compresion y restauracion.
- Reproducibilidad de artefactos de investigacion: la configuracion fija (semilla 42, 7 de 10 rondas, chunk 0,100%) permite reproducir y auditar el punto intermedio de una ejecucion mas larga.
- Calibracion de presupuestos de restauracion: validar como distintos porcentajes de parametros restaurados (aqui 1,000%) influyen en la recuperacion funcional tras comprimir.
- Analisis de interpretabilidad de componentes: inspeccionar los 3.139 componentes intercambiados y su efecto en capas concretas para entender que pesos sostienen el comportamiento de seguridad.
- Punto de partida para tecnicas de reparacion posteriores: aplicar metodos alternativos de recuperacion sobre el modelo comprimido y comparar con la LoRA r=8 sobre coeficientes documentada aqui.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,0750 |
| StrongREJECT | ASR (juez HarmBench) | 0,1470 |
| WildGuard | Macro over-refusal | 0,1629 |

En la informacion disponible no constan resultados de MMLU, GSM8K, HumanEval ni otras pruebas de capacidad general, ni comparaciones numericas con el modelo base sin comprimir.

## Requisitos de hardware

- VRAM para inferencia en fp16/bf16: aproximadamente 13,5 GB solo de pesos (coincide con el tamano del repo, 13,5 GB); con cache KV y activaciones, estimacion practica de 16-18 GB.
- VRAM en 8 bits: en torno a 7 GB.
- VRAM en 4 bits: en torno a 4 GB.
- GPU recomendadas para servicio: A100 40/80 GB, H100, L40S.
- Cabe en GPU de consumo: si. RTX 4090 y RTX 3090 (24 GB) en fp16 con holgura; RTX 4080 / 4070 Ti (16 GB) o inferiores en cuantizacion de 4 bits.
- Opciones de despliegue: `transformers`, text-generation-inference (etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversion a GGUF. Al tratarse de una arquitectura modificada con bases compartidas, conviene verificar la compatibilidad con los cargadores estandar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | 6,74 B (fraccion 0,5999) | 4.096 tokens (heredado) | AdvBench ASR 0,0750; StrongREJECT ASR 0,1470; over-refusal 0,1629 | Llama 2 | Pesos publicos, 0 descargas, 0 likes |
| meta-llama/Llama-2-7b-chat-hf | ~6,74 B denso | 4.096 tokens | no disponible en esta ficha | Llama 2 | Publico, ampliamente utilizado |
| Otras celdas del mismo grid (estudio de compresion) | no disponible | no disponible | no disponible | Llama 2 | no disponible |

No se dispone de datos de benchmarks comparables de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion, no un asistente desplegable: la model card indica explicitamente que no es un modelo de chat de proposito general y que debe autoevaluarse antes de extraer conclusiones.
- Seguridad degradada por diseno en parte del grid: la compresion por si sola eleva la tasa de exito de ataque; varias celdas estan deliberadamente degradadas respecto a Llama-2-7b-chat.
- Checkpoint intermedio: corresponde a la ronda 7 de 10 de una ejecucion mas larga, por lo que no representa el punto final de la restauracion.
- Sobrerrechazo: la metrica de over-refusal (0,1629) es apreciable y puede provocar rechazos indebidos en peticiones legitimas.
- Riesgo de alucinacion: heredado del modelo base Llama-2-7b-chat y potencialmente agravado por la compresion.
- Idiomas: sin informacion de cobertura multilingue; el modelo base esta enfocado al ingles.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` en el repositorio; el uso comercial y la redistribucion estan sujetos a ambas.
- Adopcion nula: 0 descargas y 0 likes en el momento del analisis, sin senales de validacion por parte de la comunidad.
- Inconsistencia a verificar: el recuento de parametros de safetensors (6.738.415.616) coincide con el del modelo denso de Llama-2-7b, mientras la model card declara una fraccion de parametros de 0,5999; conviene comprobar el empaquetado real antes de asumir la reduccion.
- Metadatos temporales: las fechas de creacion y actualizacion (2026-09-14) no son coherentes con un analisis realizado en el presente; conviene tratarlas con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove40_swapdiscnet_b010_r07
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2 (referenciada en el repositorio): `LICENSE.txt`
- Politica de uso Llama 2 (referenciada en el repositorio): `USE_POLICY.md`
- Paper de Basis Sharing (ICLR 2025): mencionado en la model card, sin enlace disponible
- Otros enlaces (paper del estudio, repositorio de codigo, demos): no disponible

# fqoir/Inkling-2-Mini-GSQ-RCO-IQ3_S-OpenUncensored-GGUF

## Resumen

Inkling 2 Mini GSQ-RCO IQ3_S OpenUncensored es una derivación no oficial en formato GGUF del modelo multimodal Inkling 2 Mini de Thinking Machines Lab. El autor, fqoir, ha trasplantado 20 matrices de salida de atención modificadas procedentes de la variante OpenUncensored de Inkling 2 Mini sobre la cuantización IQ3_S publicada por ISTA-DASLab, manteniendo intactos los 684 tensores restantes, las formas, los metadatos y el tamano exacto del archivo original. El resultado es un modelo de 26.070 millones de parametros en cuantización IQ3_S de aproximadamente 11,4 GB, con un proyector de visión BF16 separado.

El interés de esta ficha radica en que combina dos linajes de derivados: la cuantización GSQ-RCO de ISTA-DASLab (que aplica las tecnicas descritas en los papers arXiv:2604.18556 y arXiv:2605.00649) y el ajuste "abliterated" de OpenUncensored, cuyo objetivo es reducir los rechazos del modelo base. Es, por tanto, un artefacto de investigacion para experimentar con modificaciones de pesos en modelos multimodales cuantizados, no un modelo con benchmarks propios publicados.

La relevancia practica es limitada pero concreta: permite ejecutar un modelo image-text-to-text de 26B en hardware de consumo o en un Apple Silicon con memoria unificada, usando el runtime Splash con decodificacion especulativa mediante un draft DFlash2, y evaluar el efecto de las ediciones de atención sobre el comportamiento conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 26.070.385.152 (26,07B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--max-context 8192` |
| Tipos de cuantizacion | IQ3_S (modelo principal); BF16 (proyector de visión) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0, sujeta ademas a la Acceptable Use Policy de Thinking Machines Lab |
| Formato de pesos | GGUF (safetensors como dato de referencia de parametros) |
| Tamano del archivo principal | 11.425.259.648 bytes (11,43 GB) |
| Proyector de visión | mmproj-Inkling-2-Mini-BF16.gguf, 641.806.176 bytes (642 MB) |
| Runtime probado | Splash 1.7.3 (Apple M5 Max, 128 GB memoria unificada) |
| Draft para decodificacion especulativa | incoai/Inkling-2-Mini-DFlash2 (separado) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion IQ3_S de un transformer multimodal de 26,07B parametros, con un proyector de visión independiente en BF16 que es obligatorio para procesar entrada de imagen. La model card no detalla el numero de capas, dimensiones ocultas, mecanismo de atención ni composicion del dataset de entrenamiento del modelo original; esa informacion corresponderia a la model card de Thinking Machines Lab, que no se incluye en la informacion disponible.

La innovacion tecnica de esta derivacion es quirurgica: se sustituyen 20 matrices de salida de atención del checkpoint IQ3_S de ISTA-DASLab por las equivalentes del modelo OpenUncensored, codificadas con el cuantizador GGML de referencia respetando los tipos de tensor GGUF ya existentes. Los 684 tensores restantes se verifican contra el original de ISTA, y las 20 matrices sustituidas no se reoptimizan con GSQ. El nombre del modelo describe el origen de la edicion de pesos y no reclama equivalencia con el modelo donante ni cumplimiento universal de ninguna politica. Adicionalmente, el despliegue con Splash admite decodificacion especulativa usando un draft DFlash2 externo.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, con modo de razonamiento (`xhigh`) mencionado en la evaluacion local.
- Entrada de imagen: pipeline image-text-to-text, con OCR y descripcion de imagenes (probado en retratos de muestra publicos).
- Comparacion de imagenes: el smoke test incluyo comparacion de dos retratos claramente distintos frente a imagenes duplicadas; el autor advierte que esto no establece precision general de reconocimiento facial.
- Tareas de logica corta y generacion de codigo Python, segun el smoke test del autor.
- Decodificacion especulativa mediante draft DFlash2 compatible con Splash.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling, function calling y agentes multi-paso: no documentado en la model card.

## Casos de uso

- Experimentacion con ediciones de pesos en modelos cuantizados: util para investigadores que quieran medir el efecto de sustituir matrices de atención sobre el comportamiento de rechazo, comparando directamente contra el IQ3_S original de ISTA con la misma configuracion de Splash.
- Procesamiento de documentos con OCR en local: el modelo acepta imagen y texto y puede transcribir contenido, adecuado para entornos sin conectividad donde no se quiere enviar documentos a una API externa.
- Descripcion y comparacion de imagenes en pipelines de catalogacion: con el proyector BF16 se pueden generar descripciones de activos visuales y detectar duplicados aproximados, aunque sin garantias de precision facial.
- Asistencia de codigo en estaciones de trabajo Apple Silicon: con 11,4 GB de pesos y decodificacion especulativa alcanza aproximadamente 121 tokens/s en un M5 Max de 128 GB, suficiente para autocompletado y generacion de scripts Python.
- Prototipado de asistentes conversacionales con contexto medio: el ejemplo de despliegue fija 8.192 tokens de contexto, adecuado para dialogos multi-turno acotados y tareas de razonamiento corto.
- Evaluacion comparativa de variantes "uncensored": permite contrastar tasas de rechazo y estilo de respuesta frente al modelo base en pruebas controladas de prompts limite, siempre con supervision humana.
- Despliegue en hardware con memoria unificada limitada: el ajuste `--max-memory 28G` del ejemplo muestra que el modelo completo con proyector y draft cabe en un presupuesto de memoria moderado para un equipo de gama alta.

## Benchmarks y rendimiento

| Metrica | Este derivado (IQ3_S + OpenUncensored) | ISTA IQ3_S sin modificar |
|---|---|---|
| Throughput mediano de decodificacion (3 prompts `xhigh`, max. 1.024 tokens generados) | 121,29 tokens/s | 128,85 tokens/s |
| Respuestas finales a 16 peticiones (12 de frontera no daninas + 4 de roast ficticio) | 16/16 | 16/16 |
| Uso de profanidad fuerte en las 4 ejecuciones de roast | 3/4 | 0/4 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor indica explicitamente que su evaluacion mide throughput de generacion, no precision de razonamiento ni rendimiento en contexto largo, y que las muestras no establecen una reduccion de rechazos. Los benchmarks del modelo original y de la evaluacion de OpenUncensored se ejecutaron sobre sus propios checkpoints, no sobre este derivado.

## Requisitos de hardware

- VRAM/memoria estimada: unos 11,4 GB para el modelo IQ3_S mas 0,64 GB del proyector BF16; con cache KV y contexto de 8.192 tokens, el ejemplo del autor reserva 28 GB de memoria maxima.
- GPU recomendadas: no hay recomendaciones oficiales; el unico entorno probado es un Apple M5 Max con 128 GB de memoria unificada mediante Splash 1.7.3.
- GPU de consumo: por tamano, cabria en GPUs con 16 GB o mas de VRAM (por ejemplo RTX 4080/4090) usando llama.cpp u otro runtime GGUF, aunque no se documenta compatibilidad ni rendimiento en esas plataformas.
- Opciones de despliegue: Splash es el runtime probado; al ser GGUF, es previsible su uso con llama.cpp y derivados, pero no esta verificado en la model card.
- Decodificacion especulativa: requiere descargar por separado incoai/Inkling-2-Mini-DFlash2.
- Latencia y throughput: 121,29 tokens/s medianos de decodificacion en el hardware de prueba, un 5,9 % por debajo del IQ3_S sin modificar (128,85 tokens/s) en las mismas condiciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este derivado (fqoir) | 26,07B | no disponible (ejemplo a 8.192) | IQ3_S + proyector BF16 | Apache 2.0 + AUP de Thinking Machines | 20 matrices de atención sustituidas; sin benchmarks estandar |
| ISTA-DASLab Inkling-2-Mini-GSQ-RCO-GGUF | 26,07B | no disponible | IQ3_S | Apache 2.0 | Modelo de referencia sin edicion de pesos; 128,85 tokens/s en la prueba del autor |
| OpenUncensored Inkling-2-Mini-Uncensored | no disponible | no disponible | no disponible | no disponible | Donante de las 20 matrices modificadas; evaluacion propia no incluida |
| Thinking Machines Lab Inkling-2-Mini | 26,07B (segun el dato de parametros del derivado) | no disponible | pesos originales | Apache 2.0 + AUP | Modelo base; benchmarks no disponibles en esta informacion |

## Limitaciones y advertencias

- Modelo no oficial: no lo publica Thinking Machines Lab ni ISTA-DASLab; el autor declara que el nombre no implica cumplimiento de ninguna politica ni equivalencia con el modelo donante.
- Las 20 matrices sustituidas no se reoptimizaron con GSQ, por lo que la calidad de cuantizacion de esas capas puede diferir del resto del archivo.
- El unico benchmark disponible mide throughput, no precision; no hay evidencia publicada de calidad en razonamiento, codigo o matemáticas para este derivado.
- La prueba de comportamiento solo cubre 16 peticiones y no demuestra una reduccion de rechazos; el aumento de profanidad observado (3/4 frente a 0/4) es un indicio de cambio de estilo, no una metrica de seguridad.
- El smoke test de imagenes incluye retratos de muestra y no establece precision de reconocimiento facial; no debe usarse para identificacion de personas.
- Sin datos de sesgos, idiomas soportados ni rendimiento en contexto largo.
- Uso comercial permitido por Apache 2.0, pero sujeto a la Acceptable Use Policy de Thinking Machines Lab, que puede imponer restricciones adicionales.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad ni informes independientes de fallos.
- Requiere el proyector mmproj para entrada de imagen; sin el, el modelo solo procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fqoir/Inkling-2-Mini-GSQ-RCO-IQ3_S-OpenUncensored-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Inkling-2-Mini-GSQ-RCO-GGUF
- Variante OpenUncensored: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored/tree/4e5f06d72b5a70c9dcd5e8046aea576eb3ee8487
- Draft DFlash2 para Splash: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Paper RCO: https://arxiv.org/abs/2605.00649
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/

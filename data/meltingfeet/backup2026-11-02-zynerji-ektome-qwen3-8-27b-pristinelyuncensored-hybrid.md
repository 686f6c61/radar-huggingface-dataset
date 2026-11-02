# meltingfeet/backup2026-11-02-Zynerji-Ektome-Qwen3.8-27B-PristinelyUncensored-HYBRID

## Resumen

Este repositorio es una copia de seguridad (backup) publicada por el usuario `meltingfeet` del modelo `Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored`, un derivado de la familia Qwen 3.8 (etiqueta `qwen3_5` en los metadatos) sometido a un proceso de "abliteration" para eliminar los mecanismos de rechazo y publicarlo como modelo sin censura. El nombre comercial indica 27B, pero el recuento real de parametros en los ficheros safetensors es de 6.070.635.760 (aproximadamente 6,07 mil millones), lo que sugiere que el modelo subyacente es en realidad un Qwen de ~7B o que la nomenclatura del autor no refleja el tamano real de los pesos. El repositorio pesa 18,7 GB y esta cuantizado en precision mixta con `compressed-tensors`.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo tipico de la practica de "abliteration" sobre modelos Qwen, una tecnica que modifica las direcciones de activacion para suprimir el comportamiento de rechazo, con implicaciones eticas y de seguridad notables. Por otro, el modelo incorpora tecnicas de inferencia eficiente (MTP, decodificacion especulativa, formato compatible con vLLM) que lo hacen interesante como caso de estudio de despliegue optimizado. No obstante, la informacion publica es muy escasa: cero descargas, cero likes, sin pipeline declarado, sin idiomas declarados y con acceso restringido (gated) que obliga a aceptar condiciones en HuggingFace.

El acceso restringido, la ausencia de model card sustantiva y el caracter "uncensored" del modelo lo convierten en un artefacto de evaluacion mas que en una opcion de produccion. Esta ficha recoge unicamente los datos verificables en los metadatos del repositorio y marca explicitamente como "no disponible" todo aquello que no puede confirmarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen, tag `qwen3_5`); detalles exactos no disponibles |
| Parametros totales | 6.070.635.760 (~6,07B segun safetensors; el nombre indica 27B, discrepancia no aclarada) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion mixta con `compressed-tensors` (precision mixta); niveles concretos no disponibles |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `compressed-tensors` para los pesos cuantizados) |

## Arquitectura y entrenamiento

La informacion disponible no permite reconstruir la arquitectura con detalle. Los tags indican `qwen3_5`, lo que apunta a una arquitectura transformer decoder-only de la familia Qwen, y el tag `mtp` sugiere la inclusion de Multi-Token Prediction, una tecnica de entrenamiento que anade cabezas auxiliares para predecir varios tokens futuros y que se usa habitualmente como soporte para decodificacion especulativa en inferencia. El tag `speculative-decoding` confirma que el modelo esta preparado para este tipo de decodificacion, y `vllm` indica compatibilidad declarada con el motor de inferencia vLLM.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron fases de RLHF, DPO o similares. El proceso de "abliteration" (tag `abliterated`) consiste en identificar la direccion de activacion asociada al rechazo de peticiones y proyectarla fuera de los pesos, de modo que el modelo deja de negarse a responder. Este proceso se aplica sobre el modelo base `Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored`, del cual este repositorio es una copia cuantizada en precision mixta. No se documenta el procedimiento exacto de abliteration ni el impacto en capacidades.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo Qwen subyacente.
- Comportamiento "sin censura" (uncensored): el proceso de abliteration elimina los rechazos, por lo que el modelo respondera a peticiones que el modelo original rechazaria.
- Soporte declarado de decodificacion especulativa mediante MTP, orientado a reducir latencia en inferencia.
- Compatibilidad declarada con vLLM para despliegue en servidor.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Tool calling / function calling: no disponible en la informacion.
- Razonamiento multi-paso y agentes: no disponible en la informacion.
- Vision, audio u otras modalidades: no disponible; los tags no indican multimodalidad.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo sirve como objeto de estudio para analizar como la abliteration altera la distribucion de respuestas y que capacidades se degradan, comparando con el modelo base sin modificar.
- Evaluacion de tecnicas de cuantizacion: al estar publicado en `compressed-tensors` con precision mixta, permite medir la perdida de calidad frente a los pesos originales en tareas controladas.
- Pruebas de decodificacion especulativa: el soporte MTP y el tag `speculative-decoding` lo hacen util para experimentar con aceleracion de inferencia en vLLM y medir ganancias de throughput.
- Benchmarking de motores de inferencia: su compatibilidad con vLLM permite incluirlo en comparativas de latencia y memoria entre motores (vLLM frente a llama.cpp, por ejemplo) sobre un mismo checkpoint.
- Analisis de robustez frente a prompts adversarios: al carecer de mecanismos de rechazo, es un caso limite util para estudiar como se comportan los filtros externos (guardrails) cuando el modelo no coopera.
- Docencia y demostraciones sobre riesgos de modelos sin alinear: sirve para ilustrar en entornos controlados por que la abliteration es problematica y como se manifiesta en la practica.
- Reproducibilidad de artefactos: al ser un backup de otro repositorio, permite verificar la integridad de los pesos y comparar copias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~6,07B parametros, en FP16 serian necesarios unos 12-13 GB solo para pesos; en cuantizacion de 8 bits, unos 6-7 GB; en 4 bits, unos 3,5-4 GB. Estas cifras son estimaciones a partir del recuento de parametros, no datos publicados.
- GPU recomendadas: no disponibles en la informacion. Por tamano, una RTX 4090 (24 GB) cubriria FP16 con margen para contexto; una RTX 3090 o 4080 (16 GB) cubriria FP16 ajustado o cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, previsiblemente en modelos con 12 GB o mas en cuantizacion de 8 bits, y en 8 GB en 4 bits (estimacion, no confirmada).
- Opciones de despliegue: vLLM (declarado en tags); llama.cpp, Ollama y TGI no estan confirmados y dependerian de la conversion de los pesos `compressed-tensors`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Este modelo (backup de Ektome-Qwen3.8-27B) | ~6,07B (segun safetensors) | no disponible | Apache 2.0 | Gated | Abliterated, cuantizacion mixta, MTP |
| Qwen2.5-7B (referencia de familia) | 7,6B | 128K (segun version) | Apache 2.0 | Abierto | Modelo base de referencia, con alineacion |
| Mistral-7B-v0.3 | 7,2B | 32K | Apache 2.0 | Abierto | Alternativa europea de tamano similar |
| Llama-3.1-8B | 8,0B | 128K | Llama 3.1 Community | Abierto con condiciones | Referencia de rendimiento en 8B |

La comparativa es orientativa: no hay datos de rendimiento publicados para este modelo, y la discrepancia entre el nombre (27B) y el recuento real (~6,07B) impide una comparacion fiable de capacidades.

## Limitaciones y advertencias

- Discrepancia de tamano: el nombre indica 27B pero los safetensors suman ~6,07B; conviene verificar el checkpoint antes de planificar recursos.
- Modelo "uncensored": la abliteration elimina los rechazos, lo que incrementa el riesgo de generar contenido danino, ilegal o sesgado; no es apto para produccion sin guardrails externos.
- Riesgo de alucinacion: no evaluado; sin benchmarks publicados no puede descartarse un deterioro de la factualidad tras la abliteration.
- Sesgos conocidos: no documentados; los sesgos del modelo Qwen subyacente se heredan y pueden amplificarse al eliminar los filtros de rechazo.
- Idiomas: no declarados; el soporte multilingue no puede confirmarse.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado y el uso responsable son responsabilidad del desplegador; el acceso esta restringido (gated) y requiere aceptar condiciones en HuggingFace.
- Ausencia de model card sustantiva: sin pipeline, sin idiomas, sin benchmarks y con cero descargas; no hay evidencia de validacion por terceros.
- Procedencia: es un backup de otro repositorio, no el repositorio original; la cadena de custodia de los pesos no esta documentada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/meltingfeet/backup2026-11-02-Zynerji-Ektome-Qwen3.8-27B-PristinelyUncensored-HYBRID
- Modelo base: https://huggingface.co/Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.

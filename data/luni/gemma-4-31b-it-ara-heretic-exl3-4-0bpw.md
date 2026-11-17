# Luni/gemma-4-31B-it-ARA-heretic-EXL3-4.0bpw

## Resumen
Este repositorio contiene una cuantizacion EXL3 de 4.0 bits por peso del modelo `richardyoung/gemma-4-31B-it-ARA-heretic`, una ablacion de rangos arbitrarios (ARA) realizada con Heretic v2.0.0 sobre `google/gemma-4-31B-it`. La ablacion elimina el comportamiento de rechazo del modelo base: segun los datos de la model card, las negativas caen de 99/100 a 28/100 y el rechazo ante 972 prompts daninos medidos con WildGuard pasa del 89,3 % al 0,6 %, con una perdida de capacidad declarada de 2,18 puntos porcentuales en el agregado de MMLU-Pro, GSM8K, IFEval, HumanEval y MBPP. El autor de la cuantizacion es Luni, mientras que el credito de la ablacion corresponde a Richard J. Young.

El modelo es multimodal (pipeline `image-text-to-text`) y esta pensado para ejecutarse con ExLlamaV3, no con transformers ni llama.cpp. El repositorio ocupa 19,0 GB y, segun la model card, cabe en una GPU de 24 GB con contexto moderado y en una de 32 GB con contexto largo. Es relevante para quienes necesitan un Gemma 4 de gran tamano sin filtros de rechazo y con un formato de pesos optimizado para inferencia en GPU de consumo o semiprofesional.

La ficha presenta una limitacion importante: el nombre del repositorio indica "31B", pero el recuento real de parametros en los safetensors es de 9.501.815.020 (aproximadamente 9,5 mil millones). Esta discrepancia no se explica en la informacion disponible y debe tenerse en cuenta antes de planificar el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Gemma 4 (detalles de capas no disponibles); cuantizacion EXL3 |
| Parametros totales | 9.501.815.020 (segun safetensors); el nombre del repo indica 31B, discrepancia no aclarada |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card solo menciona "contexto moderado" en 24 GB y "contexto largo" en 32 GB) |
| Tipos de cuantizacion | EXL3 4.0 bpw, head 6 bpw, vision 6 bpw, codebook `mul1`, `out_scales auto` |
| Idiomas soportados | no disponible |
| Licencia | Gemma 4 license del modelo base, con restricciones de uso OpenRAIL++ adjuntas; prevalece la licencia base en caso de conflicto |
| Formato de pesos | safetensors en formato EXL3 (libreria exllamav3) |

## Arquitectura y entrenamiento
El modelo base es `google/gemma-4-31B-it`, un transformer multimodal de Gemma 4 con capas de atencion global que, en la version original, transformers 5.18 guarda mediante `per_layer_config`. Sobre ese modelo, Richard J. Young aplico una ablacion de rangos arbitrarios (ARA) con Heretic v2.0.0, un metodo de edicion de pesos que suprime direcciones asociadas al rechazo sin reentrenamiento. Los datos de la model card reportan una divergencia KL de 0,0845 respecto al modelo original y una caida de capacidad de 2,18 puntos porcentuales en el conjunto MMLU-Pro, GSM8K, IFEval, HumanEval y MBPP.

La cuantizacion la realizo Luni con exllamav3 1.6.3 a 4.0 bpw, con cabeza y torre de vision a 6 bpw, calibrada con 350 filas de 4096 tokens. Un detalle tecnico relevante: el `config.json` del repositorio no es el del modelo fuente, sino el de `google/gemma-4-31B-it`, porque exllamav3 no lee `per_layer_config` y fallaba en la capa 5 (`q_proj` 16384 frente a 8192). El config original se conserva como `config.ara-orig.json`. No se dispone de informacion sobre el volumen de tokens de entrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades
- Generacion de texto conversacional multi-turno, heredada de la variante instruct de Gemma 4.
- Procesamiento de imagen y texto (`image-text-to-text`), con la torre de vision cuantizada a 6 bpw.
- Razonamiento y matematicas, con la salvedad de la perdida de capacidad declarada tras la ablacion.
- Generacion de codigo, evaluada en el agregado mediante HumanEval y MBPP.
- Seguimiento de instrucciones, medido con IFEval en el agregado de capacidad.
- Comportamiento sin rechazo: responde a peticiones que el modelo original rechazaria, segun las metricas de WildGuard.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso
- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como varia la tasa de rechazo (de 99/100 a 28/100) y el comportamiento ante prompts daninos con una divergencia KL medida de 0,0845, en un entorno controlado de laboratorio.
- Generacion creativa sin filtros: util para escritura de ficcion, guiones o narrativa que requiere contenido sensible o controvertido que el modelo base rechazaria, con la advertencia de revision humana obligatoria.
- Analisis de documentos con imagenes: al ser image-text-to-text, puede procesar capturas, diagramas o documentos escaneados junto con instrucciones textuales, aprovechando la torre de vision a 6 bpw.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir la degradacion de un Gemma 4 ablacionado a 4.0 bpw frente al modelo en precision completa, con calibracion documentada de 350 filas x 4096 tokens.
- Despliegue local en GPU de 24 GB: la model card indica que cabe en una tarjeta de 24 GB con contexto moderado, lo que permite ejecutar un modelo multimodal de gran tamano en hardware de consumo o estacion de trabajo.
- Red teaming y pruebas de robustez: util para generar respuestas adversarias y evaluar clasificadores de seguridad propios frente a un modelo con filtros suprimidos.
- Prototipado de asistentes conversacionales sin restricciones tematicas: para demos internas donde se necesita explorar respuestas a consultas que un modelo alineado bloquearia, siempre con salvaguardas externas.

## Benchmarks y rendimiento

| Metrica | ARA heretic | google/gemma-4-31B-it |
|---|---|---|
| Rechazos | 28/100 | 99/100 |
| Divergencia KL | 0,0845 | 0 |
| Rechazo WildGuard (972 prompts daninos) | 0,6 % | 89,3 % |
| Cambio de capacidad (MMLU-Pro, GSM8K, IFEval, HumanEval, MBPP) | −2,18 pp | no disponible |

No se han publicado resultados desglosados por benchmark (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; solo se ofrece el agregado de capacidad y las metricas de rechazo.

## Requisitos de hardware
- VRAM estimada: aproximadamente 18 GB de pesos en EXL3 4.0 bpw; la model card indica que cabe en una GPU de 24 GB con contexto moderado y en una de 32 GB con contexto largo.
- GPU recomendadas: tarjetas de 24 GB (RTX 4090, RTX 3090, A10G, L4) para contexto moderado; de 32 GB o mas (V100 32 GB, A100 40 GB, H100) para contexto largo.
- GPU de consumo: si, en RTX 4090 y RTX 3090 de 24 GB, con limitaciones de contexto; no cabe en tarjetas de 16 GB o menos.
- Opciones de despliegue: ExLlamaV3 (libreria nativa del formato); no es compatible con llama.cpp, Ollama ni vLLM segun la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Luni/gemma-4-31B-it-ARA-heretic-EXL3-4.0bpw | 9,5 B reales (nombre indica 31B) | no disponible | Gemma 4 + OpenRAIL++ | EXL3 safetensors | Ablacionado, sin rechazo, multimodal |
| richardyoung/gemma-4-31B-it-ARA-heretic | no disponible | no disponible | Gemma 4 + OpenRAIL++ | safetensors | Modelo fuente sin cuantizar; requiere transformers 5.18 |
| google/gemma-4-31B-it | no disponible | no disponible | Gemma 4 | safetensors | Modelo base alineado, tasa de rechazo 99/100 |

No se dispone de datos de benchmarks desglosados ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias
- La ablacion suprime deliberadamente el rechazo: la tasa de rechazo ante prompts daninos cae al 0,6 %, lo que implica un riesgo alto de generar contenido danino, ilegal o inseguro sin salvaguardas externas.
- Perdida de capacidad de 2,18 puntos porcentuales en el agregado de MMLU-Pro, GSM8K, IFEval, HumanEval y MBPP respecto al modelo base.
- Discrepancia entre el nombre del repositorio (31B) y el recuento real de parametros (9,5 B); no se explica en la informacion disponible y afecta a la planificacion de recursos.
- El `config.json` fue sustituido por el de `google/gemma-4-31B-it`; aunque la model card afirma que describe la misma arquitectura, es una modificacion respecto al modelo fuente.
- Licencia dual: se aplica la Gemma 4 license del modelo base y, ademas, las restricciones de uso OpenRAIL++ adjuntas; en caso de conflicto prevalece la licencia base. Es necesario revisar ambas antes de cualquier uso comercial.
- Compatibilidad limitada a ExLlamaV3; no se indica soporte para llama.cpp, Ollama, vLLM ni TGI.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas de veracidad en la informacion disponible.
- Idiomas soportados y sesgos conocidos: no disponibles en la informacion proporcionada.
- Solo 7 descargas y 1 like en el momento de la consulta: ecosistema de validacion muy reducido.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Luni/gemma-4-31B-it-ARA-heretic-EXL3-4.0bpw
- Modelo fuente (ablacion): https://huggingface.co/richardyoung/gemma-4-31B-it-ARA-heretic
- Modelo base original: https://huggingface.co/google/gemma-4-31B-it
- Proyecto Heretic: https://heretic-project.org
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Restricciones OpenRAIL++: archivo `LICENSE_OpenRAIL++.md` dentro del repositorio

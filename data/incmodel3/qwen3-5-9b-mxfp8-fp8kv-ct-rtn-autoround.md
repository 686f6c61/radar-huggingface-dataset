# INCModel3/Qwen3.5-9B-MXFP8-FP8KV-CT-RTN-AutoRound

## Resumen

Qwen3.5-9B-MXFP8-FP8KV-CT-RTN-AutoRound es una cuantización en formato MXFP8 del modelo Qwen/Qwen3.5-9B, publicada por el usuario INCModel3 en HuggingFace y generada con la herramienta AutoRound de Intel, integrada en un flujo automatizado denominado autoquant-agent. El objetivo es reducir el coste de memoria y de cómputo del modelo original manteniendo la mayor parte de su calidad, empleando pesos en punto flotante de 8 bits con escalas compartidas por bloques (microscaling) y una caché KV también en FP8, según indica el propio nombre del repositorio (MXFP8-FP8KV).

El modelo se distribuye en formato safetensors con el esquema compressed-tensors, orientado a inferencia de generación de texto y uso conversacional. La model card declara que se debe respetar la licencia del modelo original, pero no especifica cuál es, y no se indican idiomas soportados ni longitud de contexto.

Existe una discrepancia relevante entre el nombre del repositorio y los metadatos: el nombre anuncia 9B, mientras que el recuento real de parámetros en los archivos safetensors es de 2.497.600.768 (aproximadamente 2,5 mil millones). Esta ficha recoge ambos datos tal cual y advierte de la inconsistencia, que no se aclara en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (etiqueta `qwen3_5`); no se detalla la configuración interna (número de capas, cabezas, tipo de atención) en la informacion disponible |
| Parametros totales | 2.497.600.768 (~2,5 mil millones) segun safetensors; el nombre del repositorio indica 9B (discrepancia no aclarada) |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8 (pesos en FP8 con microescalas por bloque), caché KV en FP8 segun el nombre del repositorio, esquema compressed-tensors, metodo de redondeo AutoRound con RTN |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del modelo base Qwen/Qwen3.5-9B) |
| Formato de pesos | safetensors con metadatos compressed-tensors |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base más allá de la etiqueta `qwen3_5` y del pipeline `text-generation`. Se trata, por tanto, de un transformer de la familia Qwen3.5 cuyo detalle de capas, mecanismos de atención, uso de atención lineal o decodificación especulativa no está documentado en la model card. Tampoco se especifican los datos de entrenamiento del modelo original: número de tokens, composición del dataset ni si hubo fases de RLHF o DPO.

Lo que sí está documentado es el proceso de cuantización posterior al entrenamiento. El método AutoRound (Intel) ajusta los parámetros de redondeo mediante optimización basada en gradientes en lugar de aplicar un redondeo puro al valor más cercano, con el objetivo de minimizar el error de reconstrucción de las activaciones por capa. El esquema MXFP8 se apoya en el estándar de microscaling: bloques de elementos que comparten una escala común de baja precisión, lo que reduce el error respecto al escalado por tensor completo. El sufijo FP8KV indica además que la caché de claves y valores se almacena en FP8, lo que reduce el consumo de memoria en contextos largos y en decodificación con lotes grandes. El flujo autoquant-agent añade una fase de evaluación y de autorreparación (self-heal) tras la cuantización, según la propia model card.

## Capacidades

- Generación de texto y uso conversacional: el pipeline declarado es `text-generation` y las etiquetas incluyen `conversational`.
- Razonamiento y matemáticas: los resultados publicados de GSM8K (0,9333) apuntan a una capacidad sólida de razonamiento aritmético de varios pasos, aunque se desconoce el protocolo exacto de evaluación.
- Comprensión de lenguaje y sentido común: se reportan puntuaciones en MMLU (0,7840), HellaSwag (0,5825) y PIQA (0,7927).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el nombre del flujo de cuantización (autoquant-agent) se refiere al proceso de cuantización, no a capacidades del modelo.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Eficiencia de despliegue: al ser una cuantización MXFP8 con caché KV en FP8, el modelo está pensado para reducir huella de memoria y aumentar el rendimiento por GPU frente al modelo base en BF16.

## Casos de uso

- Servicio de chat conversacional de bajo coste: con pesos en FP8 y caché KV en FP8, se puede desplegar en una única GPU de gama media para atender conversaciones multi-turno, siempre que se confirme la longitud de contexto real del modelo base.
- Generación de texto a gran escala (resúmenes, redacción, clasificación): el formato compressed-tensors permite servirlo con motores de inferencia compatibles y escalar horizontalmente réplicas por GPU.
- Asistente de razonamiento matemático y resolución de problemas tipo GSM8K: el 0,9333 reportado en GSM8K lo hace adecuado para tutores automáticos o validación de ejercicios, con verificación posterior de resultados por ser un modelo pequeño.
- Preprocesado y enriquecimiento de datos en pipelines de ML: generación de etiquetas, reformulación de textos o creación de pares instrucción-respuesta para entrenar modelos mayores, aprovechando el bajo coste por token del FP8.
- Evaluación y comparación de técnicas de cuantización: este repositorio sirve como referencia reproducible para medir el impacto de MXFP8 + AutoRound frente a otras cuantizaciones del mismo modelo base, algo útil para equipos que investigan compresión de modelos.
- Prototipado en estación de trabajo con una sola GPU consumer: al ocupar del orden de 3 GB en pesos FP8, cabe en GPUs de 8-12 GB y permite iterar en local antes de pasar a producción.
- Despliegue en el borde o en entornos con memoria limitada: si se confirma la compatibilidad de los kernels, la combinación MXFP8 + KV FP8 reduce la memoria frente a BF16, lo que facilita instancias pequeñas en cloud.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor. No se especifica el protocolo de evaluación (número de muestras, few-shot, herramientas empleadas), por lo que deben tomarse como orientativos.

| Benchmark | Puntuacion |
|---|---|
| GSM8K | 0,9333 |
| MMLU | 0,7840 |
| PIQA | 0,7927 |
| HellaSwag | 0,5825 |

No se han publicado en la información disponible resultados comparativos frente al modelo base sin cuantizar ni frente a otras cuantizaciones, por lo que no es posible cuantificar la degradación introducida por el esquema MXFP8.

## Requisitos de hardware

- VRAM estimada para pesos: aproximadamente 2,5 GB en FP8 para los 2.497.600.768 parámetros declarados, más las escalas de microscaling y los metadatos (overhead habitual de pocos cientos de MB). El tamaño del repositorio es de 12,6 GB, muy superior a lo que exigirían los pesos FP8, lo que sugiere que contiene artefactos adicionales (por ejemplo, copias sin cuantizar o ficheros de calibración); conviene revisar el listado de archivos antes de planificar el despliegue.
- VRAM estimada para caché KV: depende de la longitud de contexto, del número de capas y de cabezas KV, datos no disponibles. Al estar en FP8, la caché ocupa aproximadamente la mitad que en BF16.
- GPU recomendadas: para MXFP8 nativo se requieren GPU con soporte de instrucciones FP8 (arquitecturas Hopper o Blackwell de NVIDIA, o equivalentes recientes). En GPUs sin soporte nativo, el motor tendría que descomprimir o emular, con pérdida de rendimiento.
- Cabe en GPU consumer: sí, en términos de capacidad de memoria, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. La viabilidad de ejecución dependerá del soporte de kernels MXFP8 en el motor elegido, no solo de la VRAM.
- Opciones de despliegue: vLLM y otros motores que consuman compressed-tensors, siempre que soporten MXFP8 y KV cache en FP8 en el hardware objetivo; TGI y llama.cpp/Ollama solo si disponen de soporte para este esquema (no confirmado en la información disponible).
- Latencia y throughput: no disponibles. Dependen del hardware, del motor, del tamaño de lote y de la longitud de contexto, ninguno de los cuales se documenta.

## Comparativa con modelos similares

No se han identificado en la información proporcionada otros modelos comparables publicados. La única referencia directa es el modelo base del que deriva esta cuantización.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| INCModel3/Qwen3.5-9B-MXFP8-FP8KV-CT-RTN-AutoRound | 2.497.600.768 (~2,5 B) segun safetensors; nombre indica 9B | no disponible | MXFP8 + KV FP8 | no disponible | HuggingFace, 0 descargas y 0 likes en el momento del registro |
| Qwen/Qwen3.5-9B (modelo base) | no disponible | no disponible | BF16/FP16 original | no disponible | HuggingFace |
| Otras cuantizaciones del mismo base (GGUF, AWQ, GPTQ) | no disponibles | no disponibles | no disponible | no disponible | no verificado en la informacion disponible |

## Limitaciones y advertencias

- Discrepancia de tamaño: el nombre del repositorio indica 9B pero el recuento real de safetensors es de ~2,5 mil millones de parámetros. Hay que verificar a qué modelo corresponde realmente antes de usarlo en producción.
- Licencia no declarada: la model card remite a la licencia del modelo base, pero no la reproduce. No se puede asumir uso comercial libre sin comprobar la licencia de Qwen/Qwen3.5-9B.
- Idiomas y contexto sin documentar: no hay información sobre cobertura multilingüe ni longitud de contexto, dos factores críticos para dimensionar memoria y para decidir si sirve en casos de contexto largo.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni tasas de alucinación. Los benchmarks disponibles (GSM8K, MMLU, PIQA, HellaSwag) no miden factualidad ni robustez frente a entradas adversarias.
- Degradación por cuantización: se desconoce la pérdida respecto al modelo base, porque no se publican resultados del base sin cuantizar en el mismo protocolo. La cifra de GSM8K (0,9333) es inusualmente alta para un modelo de este tamaño y podría indicar contaminación del conjunto de evaluación o un protocolo laxo.
- Metodología de evaluación opaca: los resultados los produce autoquant-agent, con un enlace incompleto en la model card (apunta a la raíz de GitHub), lo que impide reproducirlos.
- Compatibilidad de kernels: MXFP8 y KV en FP8 requieren soporte específico de hardware y de motor. En GPUs sin instrucciones FP8 puede no ejecutarse o degradar el rendimiento.
- Madurez del repositorio: 0 descargas y 0 likes, creado y actualizado el mismo día. No hay comunidad, issues ni validación externa.
- Advertencia de seguridad: al ser un modelo conversational sin documentación de alineamiento, conviene aplicar filtros de entrada y salida si se expone a usuarios finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/INCModel3/Qwen3.5-9B-MXFP8-FP8KV-CT-RTN-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- AutoRound (Intel): https://github.com/intel/auto-round
- autoquant-agent: el enlace incluido en la model card apunta a https://github.com/ sin ruta de repositorio, por lo que no es utilizable.
- Los resultados de la búsqueda web realizada no contienen información relacionada con este modelo (corresponden a consultas no relacionadas de un foro generalista), por lo que no se añaden más enlaces.

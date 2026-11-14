# 899400HS/MiniMax-M3.1-Flash-C3-GGUF

## Resumen

MiniMax-M3.1-Flash-C3-GGUF es una cuantización mixta en formato GGUF del modelo MiniMax-M3.1-Flash, publicada por el usuario 899400HS. El modelo base es un transformer MoE de 426.174.616.704 parámetros totales desarrollado por MiniMax, con 60 capas (3 densas y 57 MoE con 128 expertos enrutados top-4 más un experto compartido), donde los expertos enrutados concentran aproximadamente el 97% de los pesos. Esta versión cuantizada reduce el peso de 259 GB a 198,9 GB mediante una receta de sensibilidad guiada denominada "C3", que aplica Q8_0 a los tensores sensibles (atención, router, experto compartido, embeddings, salida) y comprime más agresivamente los expertos enrutados (Q4_K en las capas 3-9, Q3_K en las capas 10-59).

La relevancia práctica de esta ficha radica en el cambio de requisitos de despliegue: mientras el modelo nativo necesita 12 GPU de 32 GB o descarga parcial a RAM del sistema, esta cuantización cabe completamente en VRAM en 8 GPU de 32 GB con contexto de 128K, manteniendo una calidad no inferior en código y matemáticas según la evaluación pareada del autor (1.038 tareas). Es una opción orientada a inferencia local o en clústeres pequeños con llama.cpp, no a despliegues de alta concurrencia.

El modelo es solo texto: la torre de visión del modelo base no está incluida. La licencia es la MiniMax Community License, que no es una licencia de código abierto estándar y debe revisarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (60 capas: 3 densas, 57 MoE con 128 expertos enrutados top-4 + 1 experto compartido) |
| Parametros totales | 426.174.616.704 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K) segun el ejemplo de uso; evaluado a 128K y 256K |
| Tipos de cuantizacion | Mixta: Q8_0 (atencion, router, experto compartido, FFN denso, embeddings, salida), Q4_K (expertos enrutados capas 3-9), Q3_K (expertos enrutados capas 10-59), F32 (norms, indexer, escalas por tensor de expertos) |
| Idiomas soportados | no disponible |
| Licencia | minimax-community-license (license: other) |
| Formato de pesos | GGUF (5 shards, 198,9 GB en total) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 60 capas. Las capas 0-2 son densas y las capas 3-59 son MoE con 128 expertos enrutados (top-4) y un experto compartido. En la release original, los expertos enrutados se almacenan en NVFP4 y el resto en MXFP8; los expertos enrutados representan cerca del 97% de los parámetros. Esta cuantización no incluye la torre de visión del modelo base.

La receta "C3" se basa en la sensibilidad de la salida a cada grupo de tensores: los expertos enrutados de las primeras 7 capas MoE (3-9) son entre 2 y 3 veces más sensibles y se mantienen en Q4_K, mientras que los de las capas 10-59 se comprimen a Q3_K. Los expertos se recuantizan desde los pesos nativos NVFP4 con `--allow-requantize`; no se usó matriz de importancia y no fue posible mantener los expertos en NVFP4 porque `llama-quantize` no acepta ese tipo como destino. No se dispone de información sobre el dataset de entrenamiento del modelo base, número de tokens, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional y razonamiento, pensado para uso a través de la plantilla de chat (`--jinja`), no como modelo de completado de texto crudo.
- Generación de código: evaluación con HumanEval+ y MBPP+ (538 tareas) con 83,6% de éxito en esta cuantización.
- Razonamiento matemático: MATH-500 con 91,4% (grader automático) y 98,0% tras revisión manual.
- Modo de razonamiento con límite de longitud configurable (`-n 16384` para evitar razonamiento desbocado).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión: no incluida (la torre de visión del modelo base no está en esta cuantización).

## Casos de uso

- Evaluación de modelos MoE de gran tamaño en hardware limitado: permite probar un modelo de 426B parámetros en 8 GPU de 32 GB en lugar de 12, reduciendo el coste de experimentación en laboratorios con clústeres pequeños.
- Generación de código en pipelines internos: con 83,6% en HumanEval+/MBPP+ y soporte de llama.cpp, puede integrarse en entornos de desarrollo con GPU V100 o superiores para autocompletado y revisión de código, siempre que la licencia lo permita.
- Razonamiento matemático asistido: útil para tareas de resolución de problemas con verificación posterior, dado el 91,4% en MATH-500 con grader automático y el 98,0% tras revisión manual.
- Despliegue local en estaciones de trabajo con múltiples GPU: 8 GPU de 32 GB (por ejemplo, V100-SXM2) permiten servir el modelo con contexto de 128K completamente en VRAM, con 20,9 tok/s de generación y 179 tok/s de prompt.
- Investigación sobre cuantización: la receta C3 y la tabla de evaluación pareada sirven como referencia para estudiar el impacto de la compresión selectiva en modelos MoE.
- Prototipado de asistentes conversacionales de contexto largo: con 262.144 tokens de contexto y caché KV q8_0 (unos 60 KB por token), se pueden procesar documentos extensos en una sola sesión.
- Servicio de inferencia de un solo usuario: el rendimiento medido (una petición a la vez) es adecuado para uso interactivo individual, no para alta concurrencia.

## Benchmarks y rendimiento

Evaluación pareada del autor sobre 1.038 tareas, decodificación greedy, mismo chat template, caché de prompt desactivada, una petición a la vez, límite de 16.384 tokens por respuesta, contexto de 64K con caché KV f16, 12 × V100:

| Estrato | Nativo | C3 | Nativo − C3, IC 95% | Veredicto |
|---|---|---|---|---|
| Código: HumanEval+ y MBPP+ (538) | 83,6% | 83,6% | 0,0 pp (−2,3; +2,3) | no inferior |
| ↳ HumanEval+ (163) | 90,2% | 92,0% | −1,8 pp (−6,2; +2,2) | no inferior |
| ↳ MBPP+ (375) | 80,8% | 80,0% | +0,8 pp (−2,1; +3,7) | no concluyente |
| Matemáticas: MATH-500, grader automático | 92,0% | 91,4% | +0,6 pp (−1,0; +2,2) | no inferior |
| Matemáticas: MATH-500, revisión manual | 98,8% | 98,0% | +0,8 pp (−0,5; +2,3) | no inferior |

Rendimiento medido con `llama-server` en NVIDIA V100-SXM2-32GB (sm_70), una petición a la vez, en tokens por segundo:

| Modelo | GPU | Colocación | Generación | Prompt | Contexto |
|---|---|---|---|---|---|
| Nativo (259 GB) | 4 | expertos parcialmente en RAM | 10,8 | 20,8 | 128K |
| C3 | 4 | expertos parcialmente en RAM | 13,9 | 33,7 | 128K |
| C3 | 8 | todo en VRAM | 20,9 | 179 | 128K |
| Nativo (259 GB) | 12 | todo en VRAM | 17,0 | 136 | 256K |
| C3 | 12 | todo en VRAM | 20,0 | 155 | 256K |

## Requisitos de hardware

- VRAM estimada: 198,9 GB de pesos; con caché KV q8_0 a unos 60 KB por token, 128K de contexto añade aproximadamente 7,7 GB. Con 8 GPU de 32 GB (256 GB totales) cabe holgadamente a 128K.
- GPU recomendadas: 8 × 32 GB para colocación completa en VRAM (por ejemplo, V100-SXM2-32GB); 12 × 32 GB para contexto de 256K con margen. El autor probó en V100 (sm_70).
- Cabe en consumer GPU: no de forma completa; se necesitan 8 GPU de 32 GB o descarga parcial de expertos a RAM del sistema con `-ot` (`--override-tensor`), lo que reduce notablemente la velocidad de generación.
- Opciones de despliegue: llama.cpp (`llama-server`), con `--jinja` para la plantilla de chat y `-ngl 99 -sm layer`. Requiere una versión de llama.cpp que aplique las escalas por tensor de expertos (`ffn_{up,gate,down}_exps.scale`); el master de noviembre de 2026 lo hace, pero un build del 19 de octubre de 2026 probado por el autor genera salida basura (perplejidad en millones). Verificación: `grep -c '_exps_s' src/models/minimax-m3.cpp` debe devolver 3.
- Latencia y throughput: 20,9 tok/s de generación y 179 tok/s de prompt con 8 GPU y todo en VRAM; 13,9 tok/s de generación con 4 GPU y expertos parcialmente en RAM. Cifras medidas en V100; otras generaciones de GPU diferirán.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-M3.1-Flash (nativo) | 426.174.616.704 | 256K | NVFP4/MXFP8, 259 GB | minimax-community-license | Hugging Face (MiniMaxAI) |
| MiniMax-M3.1-Flash-C3 (esta ficha) | 426.174.616.704 | 256K | GGUF mixto, 198,9 GB | minimax-community-license | Hugging Face (899400HS) |
| Otras cuantizaciones GGUF del mismo base | no disponible | no disponible | no disponible | minimax-community-license | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia MiniMax Community License no es de código abierto estándar; revisar el archivo LICENSE antes de cualquier uso comercial.
- La compresión cambia qué tareas resuelve el modelo: aunque el resultado global es no inferior dentro de un margen de 3 puntos, hay tareas individuales que se resuelven de forma distinta.
- Requiere una versión reciente de llama.cpp que aplique las escalas por tensor de expertos; versiones antiguas producen salida corrupta sin aviso claro.
- Solo texto: no incluye visión, aunque el modelo base la soporte.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgo de alucinación específico de este modelo.
- El rendimiento medido es con una sola petición concurrente; no hay datos de throughput con concurrencia.
- Con menos de 8 GPU, la descarga de expertos a RAM del sistema reduce notablemente la velocidad de generación.
- El límite de 16.384 tokens por respuesta se recomienda para evitar razonamiento desbocado; sin él, el modelo puede generar cadenas de razonamiento excesivamente largas.
- El repositorio tiene solo 212 descargas y 1 like en el momento de la consulta; es una cuantización de terceros, no oficial de MiniMax.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/899400HS/MiniMax-M3.1-Flash-C3-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Licencia: LICENSE (incluido en el repositorio)
- Checksums: SHA256SUMS (incluido en el repositorio)
- llama.cpp: no disponible en la información proporcionada
- Papers, blogs, demos: no disponible en la información proporcionada

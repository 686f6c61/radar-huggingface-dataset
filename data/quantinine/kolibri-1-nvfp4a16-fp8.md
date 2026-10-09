# Quantinine/Kolibri-1-NVFP4A16-FP8

## Resumen

Kolibri-1-NVFP4A16-FP8 es una cuantización no oficial del modelo Kolibri-1 de Aleph Alpha, publicada por el usuario Quantinine. Mantiene intactas las partes sensibles del modelo original (atención, experto compartido, router, embeddings y capa de salida) y convierte únicamente los expertos enrutados —el 96,7 % de los parámetros— a NVFP4 de 4 bits con escalas FP8 y FP32, dejando las activaciones en BF16 (esquema W4A16 sobre el kernel Marlin de vLLM). El resultado pasa de 78,8 GB a 45,8 GB en disco y de 73,6 GiB a 42,8 GiB en memoria de GPU, lo que libera unos 30,8 GiB adicionales para caché KV.

El objetivo es claro: reducir el coste de despliegue del Kolibri-1 original (un MoE de 50 capas y 384 expertos, con 262.144 tokens de ventana de contexto) sin degradar de forma perceptible su comportamiento. Según las pruebas del autor, el modelo rinde a la par del oficial en 10.692 episodios agénticos, 24 filas de benchmarks de la model card, 409.200 posiciones de token y 3.400 respuestas de llamadas a herramienta, con diferencias que en su mayoría caen dentro del ruido estadístico.

Es relevante ahora porque el Kolibri-1 oficial en FP8 exige GPUs de 80 GB con poco margen para caché KV a contexto completo, mientras que esta versión sí permite sostener ventanas de 262.144 tokens en una sola GPU de 80 GB, e incluso plantear despliegues en hardware de 48 GB. La licencia Apache-2.0 y el soporte de parsers de razonamiento y tool calling lo sitúan como candidato directo para cargas agénticas en inglés y alemán.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) con atención densa; 50 capas x 384 expertos enrutados, experto compartido y router |
| Parametros totales | 78.103.074.560 segun la model card del autor de la cuantizacion; los metadatos de safetensors del repositorio declaran 40.354.338.560 (discrepancia atribuible al empaquetado de los pesos NVFP4) |
| Parametros activos | no disponible (la model card no especifica cuantos expertos se activan por token) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Expertos enrutados: NVFP4 (4 bits E2M1, escala FP8 por cada 16 pesos, escala FP32 por matriz), W4A16; atencion y experto compartido: FP8 con escalas de bloque 128x128, W8A8; embeddings, capa de salida, router y normas: BF16 |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base es Aleph-Alpha/Kolibri-1, un transformer de tipo mixture of experts con 50 capas y 384 expertos enrutados por capa. La distribución de parámetros es muy desigual: los expertos enrutados concentran el 96,7 % (75,50B parámetros, proyecciones gate, up y down), la atención aporta el 2,2 % (1,70B en las proyecciones q, k, v y o), el experto compartido el 0,3 % (0,20B) y el resto (embeddings, capa de salida, router y normas) el 0,9 % (0,71B). Este repositorio no entrena ni recalibra nada: es una conversión puramente de precisión.

La conversión aplica NVFP4 únicamente a los expertos enrutados, con un esquema weight-only (W4A16) que en vLLM se ejecuta mediante el kernel Marlin, mientras que la atención y el experto compartido conservan los tensores FP8 originales bit a bit y siguen la ruta W8A8 del modelo oficial, con escalas de bloque 128x128. Al no haberse usado datos de calibración, la cuantización es puramente post-hoc y su impacto se midió empíricamente: frente al modelo oficial, la divergencia media en 409.200 posiciones de token sobre 400 documentos de Wikipedia fue de 0,0718 nats por token (KL), con un aumento de log-verosimilitud negativa de 0,0040 nats por token (perplejidad de 20,142 a 20,222) y una coincidencia top-1 del 89,43 %, frente al 92,54 % que obtiene el propio modelo oficial comparado consigo mismo en lotes distintos. No se documentan innovaciones arquitectónicas propias: el mérito técnico reside en preservar la ruta FP8 oficial en las partes sensibles y degradar solo el bloque de expertos.

## Capacidades

- Generacion de texto conversacional en ingles y aleman, con registro de instrucciones.
- Razonamiento explicito con modo de pensamiento (thinking mode): el modelo requiere el parser de razonamiento `kolibri1` en vLLM para separar la traza de razonamiento de la respuesta final.
- Razonamiento matematico y analitico, evaluado en AIME 2025 y AIME 2026 (en ingles y aleman), MMLU-Pro CoT y MMLU-ProX CoT.
- Llamada a funciones y uso de herramientas (tool calling / function calling) con parser dedicado `kolibri1`, soporte de eleccion automatica de herramienta (`--enable-auto-tool-choice`) y evaluacion en BFCL v4 multi-turno.
- Comportamiento agente multi-paso: la model card reporta 5 suites agénticas y 10.692 episodios emparejados frente al modelo oficial.
- Manejo de contexto largo: hasta 262.144 tokens por peticion, con caché KV en FP8.
- Capacidad de abstenerse ante preguntas sin respuesta (medida en el benchmark RGB, donde pierde 2,6 puntos frente al oficial) y de operar con distractores documentales (SealQA).
- No se documentan capacidades de vision, audio ni multimodalidad en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada en aleman e ingles: el modelo puede mantener conversaciones multi-turno con hasta 262.144 tokens de historial, lo que permite adjuntar manuales, contratos o historiales completos de incidencias sin truncar. El ahorro de 30,8 GiB en pesos deja espacio para unos 2,6 millones de tokens adicionales de caché KV en la misma GPU, es decir, unas diez peticiones simultaneas de contexto completo.
- Agentes de software con uso intensivo de herramientas: gracias al parser `kolibri1` de tool calling y a la eleccion automatica de herramienta en vLLM, se puede integrar en pipelines de orquestacion que encadenen busquedas, consultas a bases de datos y ejecucion de comandos. Su rendimiento en BFCL v4 multi-turno queda un 3,4 % por encima del modelo oficial en las pruebas del autor de la cuantizacion.
- Asistentes de razonamiento matematico y analitico: el modo de pensamiento y los resultados en AIME 2025/2026 y MMLU-Pro CoT lo hacen util para tutoria, verificacion de calculos o generacion de derivaciones paso a paso, siempre con supervision humana.
- Analisis de documentacion tecnica y legal en aleman: al ser uno de los pocos MoE abiertos con aleman como idioma de primera clase, encaja en flujos de revision contractual, resumen de expedientes administrativos o extraccion de obligaciones normativas sobre lotes de documentos largos.
- Despliegue en infraestructura propia con requisitos de soberania de datos: la licencia Apache-2.0 y la posibilidad de ejecutarlo en una sola GPU de 80 GB lo hacen viable en entornos on-premise sin dependencia de APIs externas.
- Evaluacion e investigacion sobre cuantizacion: el repositorio incluye comparaciones detalladas frente al FP8 oficial (KL, NLL, acuerdo top-1, benchmarks), lo que lo convierte en un caso de estudio para medir el coste real de pasar expertos MoE a 4 bits.
- Generacion de codigo asistida con contexto de repositorio: el contexto de 262.144 tokens permite incluir arboles de proyecto completos y ficheros de dependencias en una sola peticion, con la salvedad de que el modelo no tiene entrenamiento especifico de codigo documentado.
- Simulacion de agentes conversacionales para pruebas de producto: se puede usar para generar trazas de dialogo sinteticas en aleman e ingles con llamadas a herramientas, aprovechando la baja huella de memoria para levantar varias instancias simultaneas.

## Benchmarks y rendimiento

Los datos disponibles comparan esta cuantizacion con el Kolibri-1 oficial en FP8, no con otros modelos. Las diferencias se expresan en puntos porcentuales, con intervalos de confianza al 95 % entre corchetes.

| Prueba | Alcance | Resultado frente al Kolibri-1 oficial |
|---|---|---|
| Suites agenticas | 5 suites, 10.692 episodios emparejados | 2 de 140 intervalos emparejados excluyen el cero, en direcciones opuestas |
| Token level (Wikipedia) | 400 documentos, 409.200 posiciones | KL media 0,0718 nats/token [0,0689; 0,0748]; NLL +0,0040 nats/token [+0,0010; +0,0069]; perplejidad 20,142 -> 20,222; acuerdo top-1 89,43 % (oficial contra si mismo: 92,54 %) |
| eval-framework | 6 tareas: AIME 2025 y 2026 (en y de), MMLU-Pro CoT, MMLU-ProX CoT | Media +0,6 puntos [-0,8; +2,0]; ingles -0,3 [-1,6; +1,0]; aleman +1,5 [-0,8; +4,1] |
| Card benchmarks | 24 filas de la tabla post-entrenamiento del modelo oficial | 21 a la par; 2 inferiores: RGB abstention -2,6 puntos [-4,8; -0,3] y SealQA con 12 distractores bajo 24k tokens -4,9 [-9,7; -0,5]; 1 superior: BFCL v4 multi-turno +3,4 [+0,4; +6,4]. Media: 100,5 % de la puntuacion oficial |
| Tool calls | Peticion meteorologica en ingles, esfuerzo de razonamiento alto, 2.000 respuestas por modelo | Fallos de parser 2,9 % frente a 1,6 %, +1,3 puntos [+0,4; +2,2], p = 0,007 |

No se han publicado resultados absolutos de benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible; las cifras anteriores son siempre comparativas contra el modelo base oficial.

## Requisitos de hardware

- VRAM para pesos: 42,8 GiB en memoria de GPU (frente a 73,6 GiB del Kolibri-1 FP8 oficial). En disco, 45,8 GB.
- Cache KV: en formato FP8, aproximadamente 83.000 tokens por GiB. Los 30,8 GiB liberados respecto al modelo oficial equivalen a unos 2,6 millones de tokens adicionales de cache.
- GPU probada: configuracion de una sola GPU con `--tensor-parallel-size 1` y `--gpu-memory-utilization 0.95`. Con 42,8 GiB de pesos, encaja con margen en H100 80 GB, A100 80 GB y H200; en una GPU de 48 GB (por ejemplo RTX 6000 Ada o L40S) el margen para cache KV es muy reducido.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB). El despliegue en hardware de consumo exigiria al menos 48 GB de VRAM en una sola tarjeta o repartir el modelo entre varias GPUs.
- Multi-GPU: la model card indica que, para mas de una GPU, se debe lanzar un servidor de este tipo por GPU en puertos distintos (la parte final de la instruccion esta truncada en la informacion disponible).
- Opciones de despliegue: vLLM con el plugin `aleph-alpha-inference` de Aleph Alpha (Apache-2.0), que registra la arquitectura Kolibri1 y los parsers de razonamiento y tool calls. Version 1.0.0 fija `vllm>=0.29,<0.30`. Stack probado: imagen `vllm/vllm-openai:v0.29.0` mas `aleph-alpha-inference==1.0.0`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Comando de referencia: `vllm serve Quantinine/Kolibri-1-NVFP4A16-FP8 --tensor-parallel-size 1 --kv-cache-dtype fp8 --reasoning-parser kolibri1 --tool-call-parser kolibri1 --enable-auto-tool-choice --gpu-memory-utilization 0.95 --max-model-len 262144`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Peso en GPU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Quantinine/Kolibri-1-NVFP4A16-FP8 | 78,1B (segun model card) | 262.144 | Expertos NVFP4 W4A16; atencion y experto compartido FP8 W8A8; resto BF16 | 42,8 GiB | Apache-2.0 | HuggingFace, requiere plugin de vLLM |
| Aleph-Alpha/Kolibri-1 | 78,1B | 262.144 | FP8 W8A8 con escalas de bloque 128x128 | 73,6 GiB | Apache-2.0 | HuggingFace, modelo oficial de referencia |
| primitive-ai/Kolibri-1-NVFP4 | no disponible | no disponible | NVFP4 | no disponible | no disponible | HuggingFace; sin datos publicados en la informacion disponible |

No se dispone de datos de rendimiento de otros modelos comparables de la misma categoria (MoE abiertos de ~70-80B con contexto de 256k y soporte de tool calling), por lo que la comparativa se limita a las variantes del propio Kolibri-1.

## Limitaciones y advertencias

- Es una cuantizacion no oficial: no esta afiliada, fabricada, respaldada ni revisada por Aleph Alpha. La model card oficial es la fuente autoritativa sobre entrenamiento, uso previsto, riesgos y licencia.
- La ruta de expertos en NVFP4 es weight-only y no usa datos de calibracion, por lo que la degradacion, aunque pequena, no es cero: perplejidad de 20,142 a 20,222 y acuerdo top-1 del 89,43 % frente al 92,54 % del modelo oficial comparado consigo mismo en lotes distintos.
- Dos benchmarks empeoran de forma medible: abstencion en RGB baja 2,6 puntos y SealQA con 12 distractores bajo 24k tokens baja 4,9 puntos. Si el caso de uso depende de rechazar preguntas sin respuesta o de resistir distractores, conviene validarlo especificamente.
- Se han observado fallos del parser de tool calls asociados a un problema upstream: en la peticion meteorologica en ingles con esfuerzo de razonamiento alto, la tasa de fallo sube del 1,6 % al 2,9 % (p = 0,007). La model card remite a la seccion "Known issues" para el resto de casos relevantes en produccion, seccion que no esta incluida en la informacion disponible.
- Idiomas soportados limitados a aleman e ingles. No hay evidencia de rendimiento fiable en castellano ni en otros idiomas.
- Riesgo de alucinacion: inherente al modelo base; la cuantizacion no lo corrige y puede amplificarlo ligeramente en colas de baja probabilidad.
- La model card no detalla sesgos conocidos del modelo base; debe consultarse la documentacion de Aleph Alpha.
- Licencia Apache-2.0, por lo que el uso comercial esta permitido, pero el aviso de no afiliacion con Aleph Alpha implica que no hay soporte ni garantias por parte del fabricante original.
- Dependencia fuerte del ecosistema vLLM: exige el plugin `aleph-alpha-inference` fijado a `vllm>=0.29,<0.30`. No hay soporte documentado para llama.cpp, Ollama, TGI u otros motores, lo que limita las opciones de despliegue y complica las actualizaciones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor advierte de que las diferencias medidas son pequenas pero no nulas; para produccion se recomienda validar sobre el conjunto de evaluacion propio.
- Existe una discrepancia entre el recuento de parametros de la model card (78,1B) y el declarado en los metadatos de safetensors (40,35B); conviene verificarla antes de dimensionar infraestructura.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Quantinine/Kolibri-1-NVFP4A16-FP8
- Modelo base oficial: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Plugin de inferencia de Aleph Alpha: https://github.com/Aleph-Alpha/aleph-alpha-inference
- Perfil del autor de la cuantizacion: https://huggingface.co/Quantinine/models
- Cuantizacion NVFP4 alternativa: https://huggingface.co/primitive-ai/Kolibri-1-NVFP4
- Ficha de especificaciones de Kolibri 1 (terceros): https://apxml.com/models/kolibri-1
- Motor de inferencia colibri (proyecto independiente, mismo nombre): https://github.com/JustVugg/colibri y https://justvugg.github.io/colibri/

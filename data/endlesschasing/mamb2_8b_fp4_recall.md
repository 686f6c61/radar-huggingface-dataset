# EndlessChasing/Mamb2_8B_FP4_Recall

## Resumen

Mamb2_8B_FP4_Recall es un modelo base de generacion de texto derivado de nvidia/mamba2-8b-3t-4k, un transformer puro de estado (SSM) Mamba-2 de 8.236.999.680 parametros distribuidos en 56 bloques, sin mecanismo de atencion. Lo publica el autor EndlessChasing bajo el identificador EndlessChasing/Mamb2_8B_FP4_Recall, y su rasgo diferencial es una representacion de pesos en FP4 (formato NVFP4 con codigos E2M1, escalas de bloque E4M3FN y escalas globales FP32) obtenida mediante una busqueda de rango propia, junto con la reparacion de los tensores FP16 existentes y un adaptador ligero denominado Resurface.

El problema que aborda no es tanto la generacion general como la preservacion de la calidad tras una cuantizacion agresiva a 4 bits. Segun la model card, el proceso combina tres componentes: 114 matrices grandes almacenadas en FP4, 393 tensores pequenos en FP16 reparados (3.580.928 parametros entrenados) y un adaptador Resurface de 224 tensores / 1.154.104 parametros que recupera capacidad de recuperacion (recall) sin degradar la perplejidad. El repo ocupa 4,6 GB de pesos empaquetados, aunque la implementacion nativa de referencia expande los pesos a FP16 residente (16.473.999.360 bytes, unos 16,47 GB).

Es relevante ahora porque documenta, con auditoria detallada y controles emparejados, que es posible mantener una perplejidad practicamente identica (6,717746660814748 frente a 6,717800294314242) mientras se multiplica por mas de dos la tasa de acierto en tareas de recall de seis digitos (del 34,11 % al 91,93 % en el conjunto CONFIRM). El modelo es solo para ingles y se distribuye con un runtime propio bajo GPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-2 (SSM puro, sin atencion); 56 bloques, 507 tensores |
| Parametros totales | 8.236.999.680 (base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la nomenclatura del modelo base, `mamba2-8b-3t-4k`, sugiere 4k) |
| Tipos de cuantizacion | FP4 E2M1 en grupos de 16 elementos con escalas de bloque E4M3FN y escalas globales FP32; FP16 para 393 tensores pequenos y para el adaptador |
| Idiomas soportados | en (ingles) |
| Licencia | other: Apache 2.0 para los pesos base, GPL-3.0 para el adaptador de runtime |
| Formato de pesos | safetensors (119 ficheros de base + 1 fichero de adaptador) |

## Arquitectura y entrenamiento

El modelo es un Mamba-2 puro, es decir, una pila de 56 bloques de espacio de estados (SSM) selectivo, sin capas de atencion ni atencion hibrida. Los pesos base emplean una representacion estilo NVFP4: 114 matrices grandes se codifican con FP4 (E2M1) en grupos de 16 elementos sobre el eje de entrada, con escalas de bloque E4M3FN y escalas globales FP32. El autor aclara que se trata de una representacion FP4 con busqueda de rango propia y que no constituye una afirmacion de ejecucion nativa en hardware NVFP4. Los 393 tensores pequenos (3.580.928 parametros) permanecen en FP16.

El entrenamiento se divide en dos etapas. La reparacion del base entrena unicamente esos 393 tensores FP16, dejando intactas las 114 matrices FP4 y sus 118 ficheros de shard; usa dos pasadas fijas sobre 448 ventanas de WT2 TRAIN (896 actualizaciones) y selecciona el paso 448 por minima NLL de validacion. En la segunda etapa (Resurface), todos los pesos base quedan congelados y solo se entrena el adaptador (224 tensores / 1.154.104 parametros), partiendo de V=0, g=1, router_w=0 y router_b=-4. La funcion de perdida combina CE numerica sobre TRAIN (peso 1), CE de prosa sobre WT2 TRAIN (0,5), KL contra el base reparado sin adaptar como profesor (0,5) y una puerta de prosa (3), todo con forward/backward SSD nativo. El entrenamiento formal completa 1536 actualizaciones correctas en 1542 intentos, con 6 reintentos por desbordamiento, y solo exporta el candidato final al paso 1536 en FP16.

## Capacidades

- Generacion de texto autoregresiva en ingles sobre una arquitectura SSM pura.
- Recuperacion (recall) de respuestas de seis digitos tipo CONFIRM: la model card reporta 353/384 aciertos (91,93 %) frente a 131/384 (34,11 %) sin el adaptador.
- Estado recurrente nativo en FP16, lo que permite mantener caches de inferencia compactas (112 tensores de cache FP16 en 56 capas).
- Capacidad de ejecutar prefill paralelo SSD nativo y decodificacion recurrente en el mismo runtime.
- Soporte de adaptadores ligeros entrenables de forma independiente sobre un base congelado.
- No se documentan capacidades de tool calling, function calling, uso de agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles (idioma declarado: en).

## Casos de uso

- Investigacion sobre cuantizacion a 4 bits: el modelo sirve como caso de estudio reproducible de como una reparacion de tensores FP16 mas un adaptador ligero recuperan calidad sobre un base cuantizado, con controles emparejados y auditorias publicadas.
- Tareas de recuperacion exacta en contexto (recall de cadenas de seis digitos): el incremento del 57,81 % en la tasa de acierto CONFIRM lo hace adecuado para experimentos de memoria y recuperacion de secuencias dentro del estado del SSM.
- Procesamiento de secuencias con coste lineal: al ser un SSM Mamba-2 sin atencion, es adecuado para explorar inferencia recurrente de baja latencia donde el coste cuadratico de la atencion seria un cuello de botella.
- Generacion de texto en ingles en entornos de investigacion: con 16,47 GB de pesos FP16 residentes, puede ejecutarse en una GPU de 24 GB para estudios de calidad de generacion.
- Fine-tuning de adaptadores PEFT: la estructura congelada del base y el adaptador de 1,15 millones de parametros permiten experimentar con tecnicas de adaptacion sin reentrenar los 8,24 mil millones de parametros.
- Evaluacion comparativa de SSM frente a transformers: sirve como punto de referencia para medir perplejidad y recall de un Mamba-2 cuantizado frente a alternativas basadas en atencion.
- Auditoria de pipelines de cuantizacion: sus 119 ficheros de pesos, scripts de reparacion y verificaciones de identidad congelada (507 identidades) lo convierten en material para validar flujos de conversion de pesos.

## Benchmarks y rendimiento

La model card presenta resultados emparejados dentro del mismo proceso, no comparaciones con modelos externos.

| Configuracion (mismo proceso) | PPL test completo WT2 | MK normal / 384 | MK sin objetivo / 384 |
|---|---:|---:|---:|
| Base FP4 G16 reparado, sin adaptador | 6,717800294314242 | 131 (34,1145833 %) | 0 |
| Mismo base congelado + Resurface final | 6,717746660814748 | 353 (91,9270833 %) | 0 |
| Mismo base tras retirar el adaptador | 6,717800294314242 | 131 (34,1145833 %) | 0 |

| Poblacion MK normal | Adaptador apagado | Resurface final activado |
|---|---:|---:|
| N16, 192 casos | 101/192 (52,6041667 %) | 191/192 (99,4791667 %) |
| N64, 192 casos | 30/192 (15,625 %) | 162/192 (84,375 %) |

La ganancia en MK normal es de 222/384 = 57,8125 puntos porcentuales, con intervalo bootstrap emparejado del 95 % de 52,6041667 a 62,7604167 puntos (10.000 remuestreos, semilla 20260928). Hay 225 mejoras, 3 regresiones y 156 pares sin cambio. La perplejidad varia un -0,0007983788910648215 %. El protocolo emplea `Salesforce/wikitext`, `wikitext-2-raw-v1`, split test, revision `b08601e04326c79dfdd32d625aee71d232d685c3`: 147 ventanas de reinicio / 300.963 objetivos, incluyendo una ventana parcial final de 1.955 objetivos. No se publican resultados de MMLU, HumanEval, GSM8K ni de comparativas externas.

## Requisitos de hardware

- VRAM para pesos residentes: la implementacion nativa expande los pesos FP4 a FP16, con 16.473.999.360 bytes (~16,47 GB) solo en pesos; hay que sumar activaciones, buffers de peticion, logits y reserva del asignador.
- Caches de inferencia batch 1 (MK nativo): 122.028.032 bytes (~122 MB), correspondientes a 112 tensores de cache FP16 en 56 capas (117.440.512 bytes de SSM + 4.587.520 bytes de convolucion).
- GPU recomendadas: una GPU de 24 GB (por ejemplo RTX 4090 o L40S) es el minimo practico por el peso residente de ~16,5 GB; para margen de contexto y batch se recomienda A100 40 GB o H100.
- No cabe en GPUs de consumo de 8, 12 o 16 GB en la ruta nativa FP16 residente.
- Despliegue: requiere el runtime propio incluido en el repositorio (adaptador de runtime GPL-3.0); no se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formato GGUF.
- No se proporciona kernel FP4 residente compacto ni beneficio medido de throughput; la model card indica explicitamente que no hay mediciones de throughput ni implementacion ASIC.
- El total de ficheros descargables (4,64 GB) excluye metadatos, tokenizador, codigo fuente, licencias y evidencias, por lo que la descarga completa es mayor; esos 4,64 GB de ficheros no equivalen a 4,64 GB de VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mamb2_8B_FP4_Recall | 8.236.999.680 | no disponible | PPL WT2 test 6,717746660814748; MK normal 353/384 | other (Apache 2.0 base + GPL-3.0 runtime) | HuggingFace + GitHub |
| nvidia/mamba2-8b-3t-4k (base) | ~8B | no disponible (nomenclatura 4k) | no disponible en la informacion | Apache 2.0 | HuggingFace (NVIDIA) |
| Mamb2_8B_W4A16_Recall | no disponible | no disponible | no disponible | no disponible | HuggingFace (mismo autor) |
| mamba2-8b-e8w5 (compresion E8/W5) | no disponible | no disponible | no disponible | no disponible | GitHub (mismo autor, trabajo en curso) |

No se dispone de comparaciones con modelos externos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta declarado unicamente en ingles; no hay evidencia de capacidades multilingues.
- Riesgo de alucinacion propio de los modelos generativos; no se documentan tasas de alucinacion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Alcance de los datos: WT2 de validacion y test y la familia CONFIRM tuvieron exposicion previa del proyecto; no son conjuntos de validacion intactos. La reparacion del base uso TRAIN y seleccion de validacion; el adaptador final uso solo TRAIN. La contaminacion por preentrenamiento no esta auditada.
- Solo el candidato final de 1536 pasos se exporto como candidato de calidad; no se uso seleccion de checkpoint por PPL o MK.
- La licencia es compuesta: Apache 2.0 para los pesos base y GPL-3.0 para el adaptador de runtime. La GPL-3.0 puede condicionar el uso comercial del componente de runtime; conviene revisar `LICENSES.md` antes de un despliegue en produccion.
- Los adaptadores de otras variantes de la familia no son intercambiables.
- No se ofrece kernel FP4 residente, ni beneficio medido de throughput, ni implementacion ASIC; la ruta de calidad e inferencia expande los pesos a FP16.
- El identificador de contexto (4k) procede solo de la nomenclatura del modelo base y no esta confirmado en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EndlessChasing/Mamb2_8B_FP4_Recall
- Fichero de licencias: https://huggingface.co/EndlessChasing/Mamb2_8B_FP4_Recall/blob/v0.1.0-fp4g16-repaired-s16-resurface/LICENSES.md
- Repositorio GitHub: https://github.com/EndlessChasing/mamb2_8B_FP4_Recall
- Repositorio GitHub de compresion E8/W5: https://github.com/EndlessChasing/mamba2-8b-e8w5
- Perfil de modelos del autor: https://huggingface.co/EndlessChasing/models
- Modelo base NVIDIA: https://huggingface.co/nvidia/mamba2-8b-3t-4k
- Articulo en Medium sobre experimentos con Mamba-2: https://medium.com/@ethanbobbykn/i-let-an-ai-run-60-experiments-on-a-mamba-2-model-while-i-slept-30043dc528df

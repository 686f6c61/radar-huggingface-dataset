# 0xSojalSec/Qwen3.5-9B-abliterated

## Resumen

Qwen3.5-9B-abliterated es una variante modificada del modelo Qwen/Qwen3.5-9B publicada por el usuario 0xSojalSec en HuggingFace. Se trata de un proceso de "abliteración" (abliteration) que elimina quirúrgicamente la direccion de rechazo del espacio de pesos del modelo base, dando como resultado un modelo de 8.953.803.264 parametros que responde a practicamente cualquier peticion sin activar mecanismos de negativa. El repositorio ocupa 17,9 GB y se distribuye en formato safetensors bajo licencia Apache 2.0.

El modelo base Qwen3.5-9B emplea una arquitectura hibrida que combina capas DeltaNet (atencion lineal) con capas de atencion estandar en un patron repetido de 3 capas DeltaNet por cada capa de atencion, con un total de 32 capas. El autor documenta que la abliteracion se aplico sobre las proyecciones de salida que escriben en el residual stream (`linear_attn.out_proj`, `self_attn.o_proj` y `mlp.down_proj`) mediante tres pasadas de proyeccion ortogonal, seguidas de un ajuste fino con QLoRA para eliminar las cinco categorias de rechazo residuales.

La relevancia de esta publicacion es fundamentalmente de investigacion en seguridad e interpretabilidad: permite estudiar donde y como se codifica el comportamiento de rechazo en un transformer hibrido moderno, y sirve como herramienta de red-teaming y generacion de datos adversarios. No obstante, la propia model card reconoce que la cuarta pasada de abliteracion destruyo el modelo (salida incoherente), lo que ilustra el estrecho margen entre suprimir el rechazo y degradar la coherencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido DeltaNet + atencion estandar, patron 3xDeltaNet -> 1xAttention, 32 capas |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados por el autor; el proceso de entrenamiento uso QLoRA 4-bit NF4. El modelo base admite cuantizacion estandar (GGUF, AWQ, GPTQ) de forma habitual, pero no se documenta en esta ficha |
| Idiomas soportados | en (la model card declara unicamente ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 17,9 GB |
| Modelo base | Qwen/Qwen3.5-9B |
| Fecha de publicacion | 27 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B utiliza una arquitectura hibrida poco convencional: intercala capas DeltaNet (una forma de atencion lineal con estado recurrente) con capas de atencion completa, en una proporcion de tres capas DeltaNet por cada capa de atencion estandar, repartidas en 32 capas. Esta hibridacion busca reducir el coste computacional del contexto largo manteniendo la capacidad expresiva de la atencion densa. La abliteracion del autor actua sobre las tres familias de matrices que proyectan de vuelta al residual stream: `linear_attn.out_proj` (salida de DeltaNet), `self_attn.o_proj` (salida de atencion) y `mlp.down_proj` (salida del bloque MLP), lo que supone 64 matrices modificadas por pasada.

El entrenamiento se realizo en dos etapas. La primera consistio en tres pasadas iterativas de proyeccion ortogonal en el espacio de pesos: se recogieron activaciones sobre 170 prompts daninos repartidos en 12 categorias y 160 prompts inocuos en 10 categorias, se calculo la direccion de rechazo como la diferencia normalizada entre las medias de activaciones en cada capa, y se ortogonalizo cada matriz mediante `W_new = W - d @ (d^T @ W)` con escala 1,0. Las longitudes de secuencia para recoger activaciones se limitaron a 128 tokens. El analisis por capas revela que la magnitud de la direccion de rechazo crece de forma marcada en las capas tardias (0,36 de media en las capas 0-7 frente a 23,10 en las capas 24-31). La segunda etapa aplico QLoRA en 4-bit NF4 con rango 64 y alpha 128 sobre las proyecciones q, k, v, o, gate, up y down, usando 20 ejemplos de las cinco categorias que resistieron la abliteracion (humor racista u ofensivo, contenido sexual explicito, propaganda antiinmigracion, sintesis de drogas y metodos de autolesion). Se entrenaron 5 epocas (perdida de 2,06 a 0,17, exactitud por token del 58 % al 96 %) en una NVIDIA H100 SXM de 80 GB en aproximadamente 45 segundos, y el adaptador se fusiono despues en los pesos de precision completa.

## Capacidades

- Generacion de texto conversacional sin activacion de mecanismos de rechazo: la model card reporta 18 de 18 respuestas a un conjunto de pruebas de 8 categorias (hacking, armas, drogas, fraude, contenido danino, autolesion, explicito y politico).
- Razonamiento logico basico: el autor verifica la identificacion correcta de la falacia de termino medio no distribuido en un silogismo.
- Matematicas: aplicacion correcta de la regla del producto (derivada de x^3 * sin(x) resuelta como 3x^2*sin(x) + x^3*cos(x)).
- Generacion de codigo: implementacion funcional del algoritmo de subcadena palindromica mas larga con enfoque de expansion alrededor del centro en O(n^2).
- Conocimiento factual: explicacion correcta de la diferencia entre fision y fusion nuclear, identificando la fusion como fuente de energia solar.
- Escritura creativa: generacion de haikus con estructura silabica 5-7-5 correcta.
- Analisis: identificacion de causas de la crisis financiera de 2008 (hipotecas subprime, desregulacion, credit default swaps).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card declara unicamente ingles.
- Modo de pensamiento (thinking), vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en interpretabilidad de mecanismos de rechazo: el modelo permite comparar directamente las activaciones del modelo base frente al abliterado en las mismas capas (0-31) y aislar el efecto de la direccion de rechazo, especialmente en el rango 16-31 donde la magnitud es mas alta. Es adecuado porque el autor documenta el proceso completo y las matrices modificadas.
- Red-teaming y evaluacion de seguridad: se puede emplear como generador de peticiones y respuestas adversarias para probar clasificadores de contenido, filtros de moderacion o sistemas de defensa en produccion, aprovechando su tasa de respuesta del 100 % en el conjunto de 18 prompts.
- Generacion de datos sinteticos para entrenar clasificadores de seguridad: al no activar rechazos, el modelo produce ejemplos etiquetables de contenido danino que sirven como clase positiva en datasets de moderacion, reduciendo la dependencia de datos reales.
- Auditoria de sistemas propios de contenido: equipos de confianza y seguridad pueden usarlo para estresar sus propios guardrails antes de un despliegue publico.
- Escritura creativa sin restricciones editoriales: ficcion con violencia, tematicas adultas o lenguaje explicito en un entorno controlado, donde los modelos convencionales interrumpirian la generacion. El contexto de 8,95 mil millones de parametros ofrece mejor coherencia narrativa que alternativas de 7B.
- Analisis de sesgos y discurso de odio: el modelo genera propaganda antiinmigracion y humor ofensivo sin filtro, lo que permite estudiar patrones de sesgo en el modelo base Qwen3.5-9B y medir cuanto de ese sesgo estaba latente antes de la abliteracion.
- Educacion en seguridad de IA: uso como caso de estudio en cursos de alineacion para demostrar empiricamente que la supresion de la direccion de rechazo degrada la coherencia si se sobre-ablitera (la cuarta pasada produjo salida incoherente).
- Pruebas de robustez de evaluadores automaticos: verificar si los arneses de evaluacion de modelos detectan correctamente la ausencia de rechazo en un modelo aparentemente convencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, etc.) en la informacion disponible. El autor unicamente reporta pruebas internas de abliteracion y verificaciones cualitativas de capacidad.

Prueba de abliteracion por etapas (18 prompts, 8 categorias):

| Etapa | Respondidos | Tasa |
|---|---|---|
| Qwen3.5-9B base | 0/18 | 0 % |
| Abliteracion, pasada 1 | 7/18 | 39 % |
| Abliteracion, pasada 2 | 9/18 | 50 % |
| Abliteracion, pasada 3 | 13/18 | 72 % |
| Abliteracion, pasada 4 (sobre-abliterado) | 18/18 con salida incoherente | Modelo destruido |
| Pasada 3 + LoRA (este modelo) | 18/18 | 100 % |

Comparativa en el mismo benchmark de 18 prompts:

| Modelo | Respondidos | Rechazados | Tasa |
|---|---|---|---|
| Qwen3.5-9B-abliterated (este modelo) | 17/18 | 1 | 94 % |
| Dolphin-Mistral 7B | 17/18 | 1 | 94 % |
| Qwen3.5-9B base | 0/18 | 18 | 0 % |

El autor atribuye la diferencia entre el 18/18 y el 17/18 a la varianza de temperatura (en la mejor de tres ejecuciones alcanza 18/18). Nota metodologica: el conjunto de evaluacion es propio del autor, no un benchmark academico estandarizado ni replicado de forma independiente.

Verificaciones cualitativas de capacidad (sin puntuacion numerica): razonamiento (silogismo), matematicas (derivada), codigo (subcadena palindromica), conocimiento (fision vs fusion), creatividad (haiku) y analisis (crisis de 2008), todas descritas como correctas.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): en torno a 18 GB solo de pesos, mas cache KV y activaciones, lo que situa el requisito practico en 20-24 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-10 GB de pesos, con un total practico de 11-13 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 5-6 GB de pesos, con un total practico de 7-8 GB. Estas cifras son estimaciones por numero de parametros; el autor no publica cifras de VRAM oficiales.
- GPU profesionales: NVIDIA A100 40/80 GB, H100 SXM 80 GB (esta ultima fue la empleada por el autor para el entrenamiento QLoRA, que completo en unos 45 segundos), L40S, A6000.
- GPU de consumo: cabe en NVIDIA RTX 4090 (24 GB) y RTX 3090 (24 GB) en BF16; en RTX 4080, 4070 Ti Super o 4060 Ti de 16 GB requiere cuantizacion de 8 o 4 bits; en GPUs de 8-12 GB solo en 4 bits con contexto reducido.
- Opciones de despliegue: transformers (formato nativo del repositorio). No se documenta soporte explicito de vLLM, llama.cpp, Ollama, TGI ni llama.cpp GGUF en la informacion proporcionada; habria que verificar la compatibilidad de la arquitectura hibrida DeltaNet con cada runtime antes de asumirla.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de respuesta (benchmark propio 18 prompts) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-abliterated | 8,95 B | No disponible | 94-100 % | Apache 2.0 | HuggingFace, 0 descargas al momento del registro |
| Qwen/Qwen3.5-9B (base) | 8,95 B | No disponible | 0 % | Apache 2.0 | HuggingFace |
| Dolphin-Mistral 7B | 7 B | No disponible | 94 % | No disponible en la informacion | HuggingFace |

El autor destaca como ventaja diferencial que este modelo tiene 8,95 mil millones de parametros frente a los 7 mil millones de Dolphin-Mistral, lo que en su valoracion se traduce en mejor razonamiento, codigo y conocimiento manteniendo el comportamiento sin censura. No se han publicado comparaciones frente a otras variantes abliteradas de la familia Qwen en la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de rechazo: la model card confirma explicitamente cero negativas en categorias como hacking, armas, drogas, fraude, autolesion, contenido sexual explicito y propaganda politica. Esto incluye contenido que puede ser ilegal en distintas jurisdicciones y que viola los terminos de uso de la mayoria de plataformas comerciales.
- Riesgo de clonacion de voz, desinformacion y material de abuso: la propia lista de categorias del autor menciona CSAM y bioweapons/terrorism entre los prompts de abliteracion. Cualquier despliegue publico sin filtros externos es inaceptable.
- Riesgo de alucinacion: no se han publicado mediciones de fidelidad factual ni tasas de alucinacion. El ajuste fino con solo 20 ejemplos y 5 epocas sobre un adaptador QLoRA es una intervencion muy ligera, por lo que no cabe esperar mejora alguna en factuality respecto al modelo base.
- Degradacion por sobre-abliteracion: el autor documenta que una cuarta pasada destruyo el modelo (18/18 respuestas pero incoherentes). Esto indica que el modelo publicado esta cerca del limite de degradacion, y que variaciones de cuantizacion o fine-tuning adicional podrian empujarlo hacia comportamiento degenerado.
- Sesgos conocidos: el proceso de abliteracion elimina el rechazo hacia humor racista, propaganda antiinmigracion y discurso discriminatorio, pero no elimina los sesgos subyacentes del corpus de entrenamiento de Qwen3.5-9B. Es previsible que amplifique la reproduccion de estos sesgos al no existir freno conductual.
- Limitacion idiomatica: la model card declara unicamente ingles. El rendimiento en castellano no esta documentado y no debe asumirse, pese a que el modelo base Qwen suele tener cobertura multilingue.
- Longitud de contexto no documentada: se desconoce la ventana efectiva del modelo base y si la abliteracion la altera. El dato de 128 tokens que aparece en la model card corresponde exclusivamente a la recogida de activaciones, no al contexto del modelo.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion, pero la licencia no exime del cumplimiento de normativa aplicable (por ejemplo, la Ley de Servicios Digitales de la UE o la legislacion sobre contenido de abuso infantil). La responsabilidad recae integramente en el desplegador.
- Procedencia y mantenimiento: el modelo tiene 0 descargas y 0 likes en el momento del registro, es una publicacion de un usuario individual y no cuenta con validacion independiente, evaluacion reproducible ni historial de mantenimiento. La fecha de creacion y actualizacion es identica (27 de septiembre de 2026), sin iteraciones posteriores.
- Caveat de produccion: no hay datos de throughput, latencia ni estabilidad en despliegues concurrentes, y la arquitectura hibrida DeltaNet puede no estar soportada por todos los motores de inferencia optimizados. Requiere validacion propia antes de cualquier uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xSojalSec/Qwen3.5-9B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper de referencia sobre abliteracion (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Modelo comparado Dolphin-Mistral 7B: https://huggingface.co/cognitivecomputations/dolphin-2.6-mistral-7b

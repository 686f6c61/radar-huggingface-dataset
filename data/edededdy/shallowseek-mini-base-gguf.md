# edededdy/ShallowSeek-mini-base-GGUF

## Resumen

ShallowSeek-mini-base-GGUF es la version cuantizada en formato GGUF de ShallowSeek-mini-base, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) disenado para ser diminuto: 11,0 millones de parametros totales y 6,3 millones activos por token. Lo desarrolla el usuario edededdy y reproduce a escala minima las ideas arquitectonicas de DeepSeek-V3, en concreto Multi-head Latent Attention (MLA), enrutamiento MoE de grano fino y Multi-Token Prediction (MTP). Este repositorio contiene unicamente los pesos GGUF para llama.cpp, Ollama y LM Studio; los pesos en PyTorch (`model.safetensors`), la configuracion y el tokenizador estan en el repositorio base.

El modelo se entreno desde cero con 286 millones de tokens del subconjunto `sample/10BT` de FineWeb-Edu, usando exclusivamente la CPU de un Intel Core i9-9880H de 8 nucleos (un MacBook Pro de 2019) durante aproximadamente dos dias a unas 1,9K tokens/s en fp32. Su ventana de contexto es de 1.024 tokens y su tokenizador es un BPE a nivel de byte de 8.192 tokens. Es un modelo base: no ha pasado por ajuste de instrucciones ni por RLHF/DPO, por lo que continua texto en lugar de seguir ordenes.

La relevancia de este artefacto es fundamentalmente educativa y de investigacion: demuestra que es viable entrenar desde cero una arquitectura MoE moderna con atencion latente en hardware de consumo, sirviendo como banco de pruebas reproducible para estudiar MLA, balanceo de carga de expertos sin perdida auxiliar y prediccion multi-token a una escala donde el entrenamiento completo cabe en dos dias de CPU. Sus capacidades factuales son muy limitadas: el propio autor advierte que "sabe muy pocos hechos e inventa cosas con seguridad", y desaconseja su uso en cualquier tarea relevante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Multi-head Latent Attention (MLA) y DeepSeekMoE |
| Parametros totales | 10.968.468 (11,0M); el GGUF excluye el modulo MTP, por lo que la cifra del repo cuantizado es menor |
| Parametros activos | 6,3M por token (MoE con 12 expertos enrutados top-3 + 1 experto compartido) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | GGUF para llama.cpp, Ollama y LM Studio; los niveles concretos de cuantizacion no se especifican en la informacion disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo cuantizado); safetensors en el repositorio base |

## Arquitectura y entrenamiento

La arquitectura sigue de cerca las ideas principales de DeepSeek-V3, escaladas a un modelo diminuto. Consta de 8 capas con tamano oculto 192: la capa 0 usa una FFN densa de 512 unidades y las capas 1 a 7 son MoE. La atencion es Multi-head Latent Attention con 6 cabezas, latente KV de 48 dimensiones, RoPE desacoplado de 16 dimensiones y dimensiones de cabeza de 24+16 (q/k) y 24 (v); la cache KV almacena unicamente el latente de 48 dimensiones mas una clave RoPE de 16 dimensiones por token, lo que reduce drasticamente el coste de memoria de la cache. El bloque MoE emplea 12 expertos enrutados de grano fino (SwiGLU, 128 unidades ocultas) con seleccion top-3, mas 1 experto compartido, gating sigmoide y enrutamiento limitado por grupos (3 grupos, top-2). El balanceo de carga se resuelve con sesgo auxiliar sin perdida auxiliar (velocidad de actualizacion 0,001) mas una pequena perdida auxiliar por secuencia (alpha = 0,0001); la carga de expertos se mantuvo en torno a 1,14 veces la media (1,28 veces en la capa mas ocupada). Incluye un modulo de Multi-Token Prediction (lambda = 0,3) usado solo en entrenamiento, que anade 1,14M de parametros y no se incluye en el GGUF.

El entrenamiento consistio en una unica pasada sobre 236.544 documentos del subconjunto `sample/10BT` de FineWeb-Edu, equivalente a 286M de tokens (unas 26 veces el numero de parametros). Se ejecutaron 34.960 pasos con lotes de 8 secuencias de 1.024 tokens, optimizador AdamW (beta = 0,9 y 0,95), weight decay 0,1, recorte de gradiente 1,0 y una tasa de aprendizaje con pico de 1,5e-3, 700 pasos de calentamiento y decaimiento coseno hasta 1,5e-4, todo en precision fp32. El tokenizador BPE a nivel de byte de 8.192 tokens se entreno sobre la misma particion de FineWeb-Edu (unas 3,9 bytes por token). No se aplico ninguna fase de ajuste por instrucciones ni de alineacion (RLHF/DPO).

## Capacidades

- Generacion de texto en ingles: el modelo continua texto de forma fluida y coherente a nivel local dentro de su ventana de 1.024 tokens.
- Modelado de lenguaje base: no esta ajustado por instrucciones, por lo que no responde a ordenes directas ni mantiene formatos de chat.
- Razonamiento aritmetico muy limitado: en las pruebas factuales del autor acierta sumas simples de un digito en posiciones bajas (2+2=4 en el puesto 4 de sus predicciones), pero falla en operaciones apenas mas complejas.
- Conocimiento factual minimo: en 14 pruebas de rellenar huecos respondio correctamente en top-1 el 0% y en top-5 el 29%; los pares verdadero/falso se resolvieron correctamente en 7 de 12 casos (58%).
- Senal estadisticamente significativa en biologia y medicina: 27,8% de acierto en cloze sobre 2.094 preguntas frente al 25% de azar, aproximadamente 3,0 errores estandar por encima del azar.
- Soporte de tool calling / function calling: no disponible (es un modelo base sin ajuste de instrucciones).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no, solo ingles.
- Capacidades especiales: ninguna (sin modo de pensamiento, sin vision, sin audio). La cache KV comprimida por MLA es una caracteristica arquitectonica, no una capacidad funcional adicional.

## Casos de uso

- Investigacion sobre MLA y cache KV comprimida: el modelo permite medir de forma reproducible el ahorro de memoria de la cache KV al almacenar solo 48 dimensiones latentes mas 16 de RoPE por token, en un entorno donde el ciclo completo de entrenamiento cabe en un portatil.
- Estudio del enrutamiento MoE y balanceo de carga: con 12 expertos enrutados y top-3, sirve para experimentar con estrategias de balanceo sin perdida auxiliar y observar la distribucion de carga por capa y por grupo, dado que el autor reporta una carga de 1,14x la media.
- Validacion de Multi-Token Prediction a pequena escala: el modulo MTP (lambda = 0,3) esta presente en los pesos safetensors y ausente del GGUF, lo que permite comparar el efecto de la cabeza MTP sobre la perdida de validacion en un presupuesto de computo minimo.
- Docencia y divulgacion de arquitecturas tipo DeepSeek-V3: al ser un artefacto de 11M de parametros, se puede diseccionar capa a capa, inspeccionar los logits de enrutamiento y explicar MLA sin necesidad de infraestructura GPU.
- Pruebas de integracion de llama.cpp, Ollama y LM Studio: el GGUF sirve como caso de prueba trivial para validar pipelines de carga, cuantizacion y ejecucion en estos motores antes de pasar a modelos mayores.
- Referencia para estudios de escalado en regimen de datos limitados: con 286M de tokens y una unica pasada, resulta util como punto de comparacion para analizar curvas de perdida de validacion en funcion de tokens vistos (de 5,12 en el paso 1.000 a 3,67 en el paso 35.000).
- Generacion de texto sin objetivo critico: puede usarse para producir texto de relleno, demos o ejemplos sinteticos en ingles donde la veracidad factual no importa y el unico requisito es fluidez superficial.

## Benchmarks y rendimiento

Metricas de evaluacion publicadas por el autor:

| Metrica | Valor |
|---|---|
| Perdida de validacion (nats/token) | 3,667 |
| Perplejidad | 39,1 |
| Bits por byte | 1,354 |

Sondas factuales (14 pruebas de rellenar huecos y 12 pares verdadero/falso, sobre texto crudo):

| Metrica | Valor |
|---|---|
| Respondidas en top-1 / top-5 | 0% / 29% |
| Log-probabilidad media de la respuesta correcta | -5,68 |
| Pares verdadero/falso acertados | 7/12 (58%) |

MMLU:

| Formato | Precision | Preguntas evaluadas | Ejemplos few-shot medios |
|---|---|---|---|
| letter | 24,9% | 14.037 (5 omitidas) | 4,5 |
| cloze | 25,5% | 14.037 (5 omitidas) | 0,0 |

MMLU por categoria (el azar es 25%):

| Categoria | Asignaturas | Preguntas | Letter | Cloze |
|---|---|---|---|---|
| STEM | 19 | 3.153 | 26,8% | 24,0% |
| Humanidades | 13 | 4.705 | 23,8% | 25,3% |
| Ciencias sociales | 12 | 3.077 | 23,9% | 26,1% |
| Otros | 13 | 3.107 | 25,5% | 26,7% |

Subgrupo de biologia y medicina (agrupacion no oficial, cloze): 27,8% sobre 2.094 preguntas frente al 25% de azar, +2,8 puntos, aproximadamente 3,0 errores estandar por encima del azar. Desglose por asignatura: conocimiento clinico 32,5% (265), envejecimiento humano 29,6% (223), medicina profesional 29,0% (272), virologia 28,3% (166), genetica medica 28,0% (100), medicina universitaria 27,4% (173), biologia de secundaria 26,8% (310), biologia universitaria 25,7% (144), nutricion 25,2% (306), anatomia 23,7% (135).

No se han publicado resultados de benchmarks comparativos frente a otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 11,0M de parametros en total. Los pesos completos ocuparian aproximadamente 44 MB en fp32, 22 MB en fp16 y en torno a 6-12 MB en cuantizaciones GGUF de 4 a 8 bits; a ello hay que sumar la cache KV, que es minima gracias a MLA (48 dimensiones latentes + 16 de RoPE por token y capa).
- GPU recomendadas: cualquier GPU moderna es sobredimensionada para este modelo; sirven tarjetas de gama de entrada e incluso integradas. Modelos como RTX 4090, A100 o H100 no aportan ventaja practica por el tamano del modelo.
- Cabe en GPU de consumo: si, con enorme margen, en cualquier GPU con unos pocos cientos de MB libres. Tambien se ejecuta integramente en CPU.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio son los motores indicados por el autor. Para los pesos PyTorch del repositorio base, el despliegue depende del soporte que dichos frameworks ofrezcan para MLA y MoE. vLLM, TGI y otros servidores para GGUF no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponible para inferencia. Como referencia de orden de magnitud, el entrenamiento en fp32 sobre una CPU de 8 nucleos (Intel Core i9-9880H) alcanzo aproximadamente 1,9K tokens/s con lotes de 8 secuencias de 1.024 tokens; la inferencia en CPU con cuantizacion GGUF es previsible que sea igual o mas rapida, aunque no se aportan mediciones.

## Comparativa con modelos similares

Comparativa estructural con alternativas de la misma categoria (modelos muy pequenos en ingles, licencia permisiva). Los datos de rendimiento comparativo no estan disponibles en la informacion proporcionada, por lo que solo se contrastan caracteristicas de diseno documentadas publicamente:

| Modelo | Parametros totales | Parametros activos | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|---|
| ShallowSeek-mini-base | 11,0M | 6,3M | 1.024 | MoE con MLA y MTP | Apache-2.0 |
| SmolLM2-135M | 135M | 135M (denso) | 2.048 | Transformer denso | Apache-2.0 |
| Qwen2.5-0.5B | 494M | 494M (denso) | 32.768 | Transformer denso | Apache-2.0 |
| TinyLlama-1.1B | 1,1B | 1,1B (denso) | 2.048 | Transformer denso | Apache-2.0 |

Nota: las cifras de SmolLM2-135M, Qwen2.5-0.5B y TinyLlama-1.1B corresponden a especificaciones ampliamente documentadas de esos modelos; no se dispone en la informacion proporcionada de resultados de benchmarks que permitan una comparacion directa de rendimiento con ShallowSeek-mini-base. La diferencia fundamental de planteamiento es que ShallowSeek-mini-base es de uno a dos ordenes de magnitud mas pequeno, usa una arquitectura MoE dispersa con atencion latente en lugar de un transformer denso, y prioriza el valor didactico y de investigacion sobre la utilidad practica.

## Limitaciones y advertencias

- Alucinacion severa: el propio autor advierte que el modelo "sabe muy pocos hechos e inventa cosas con seguridad". Las sondas factuales arrojan un 0% de acierto en top-1 y un 29% en top-5.
- Modelo base sin alineacion: no ha pasado por ajuste de instrucciones, RLHF ni DPO, por lo que no sigue ordenes, no respeta formatos de chat y no es apto como asistente conversacional.
- Rendimiento en MMLU proximo al azar: 24,9% en formato letter y 25,5% en cloze frente al 25% de azar. Solo el subgrupo de biologia y medicina muestra una senal estadisticamente significativa (27,8% en cloze, +2,8 puntos sobre el azar), y 9 de sus 10 asignaturas estan en o por encima del azar.
- Matemáticas por debajo del azar en cloze: las asignaturas con carga numerica obtienen resultados inferiores al azar porque el formato cloze no puede adivinar respuestas numericas.
- Limitacion de contexto: 1.024 tokens, muy por debajo de los 2.048-32.768 tokens de modelos comparables. En la propia evaluacion MMLU en formato letter solo se pudieron incluir hasta 5 ejemplos de la misma asignatura mientras cupieran en esa ventana.
- Limitacion de idioma: unicamente ingles. No hay soporte multilingue.
- Sesgos conocidos: no se documentan analisis de sesgo en la informacion disponible. Al entrenarse exclusivamente sobre FineWeb-Edu (texto web educativo filtrado), hereda los sesgos y la distribucion tematica de esa fuente, con sobrarepresentacion de contenido academico y sanitario y practicamente ausencia de otros registros.
- Restricciones de licencia: licencia Apache-2.0, que permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia. No obstante, el autor desaconseja explicitamente su uso en cualquier tarea relevante ("Don't use it for anything that matters").
- Caveat de produccion: el repositorio GGUF tiene un tamano declarado de 0,0 GB en el momento de la consulta, lo que sugiere que las cuantizaciones podrian no estar subidas o estar en proceso. Conviene verificarlo antes de integrarlo en cualquier pipeline.
- Dependencia de MLA: los pesos PyTorch requieren un runtime que implemente Multi-head Latent Attention y el enrutamiento MoE con gating sigmoide y enrutamiento por grupos; no todos los frameworks lo soportan de forma nativa.
- El modulo MTP no esta en el GGUF: si se necesita reproducir el entrenamiento o estudiar la cabeza de prediccion multi-token, hay que usar los safetensors del repositorio base.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/edededdy/ShallowSeek-mini-base-GGUF
- Repositorio base (pesos PyTorch, config y tokenizador): https://huggingface.co/edededdy/ShallowSeek-mini-base
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Manual de uso de modelos ShallowSeek (API compatible con OpenAI): https://doc.shallowseek.top/en/guide/using-models.html
- Guia de ejecucion de modelos GGUF en local (llama.cpp, Ollama, LM Studio): https://ggufloader.github.io/how-to-run-gguf-models.html
- Repositorio de DeepSeek-LLM (arquitectura de referencia): https://github.com/deepseek-ai/DeepSeek-LLM

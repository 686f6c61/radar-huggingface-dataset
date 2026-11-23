# nardi/LFM3-TS

## Resumen

LFM3-TS es un modelo de lenguaje especializado en el dialogo sobre series temporales, desarrollado por Nardi Xhepi como proyecto independiente no afiliado a Liquid AI. Se construye a partir de LFM3-1.7B de Liquid AI, al que se le antepone un codificador de series temporales, siguiendo las ideas y los datos sinteticos de ChatTS (Xie et al., VLDB 2025). El modelo resuelve el problema de interrogar series temporales en lenguaje natural: se le entrega una o varias series y una pregunta, y responde en texto sobre tendencia, estacionalidad, ruido, cambios locales, valores puntuales, relaciones entre series y anomalias.

Con 1.781.433.088 parametros (1,8 mil millones) y un peso de repositorio de 3,6 GB en safetensors, el modelo esta pensado para series de hasta 2.048 puntos y funciona en ingles. Su relevancia actual radica en que demuestra que un modelo pequeno puede superar a alternativas de mayor tamano en tareas concretas de analisis de series: en deteccion de anomalias sobre series reales de TSB-AD-U alcanza un F1 de 0,65 frente al 0,46 de ChatTS-8B, con muchos menos falsos positivos.

La arquitectura combina un codificador de parches de 8 puntos con el transformer LFM3-1.7B, con un proyector MLP que alinea ambos espacios. Cada serie de 512 puntos consume solo 66 tokens, lo que mantiene el coste de contexto bajo y permite conversaciones multi-turno con varias series simultaneas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM3-1.7B con codificador de series temporales antepuesto (parches de 8 puntos, 4 capas feed-forward y 2 de atencion, anchura 1024) y proyector MLP a anchura 2048 |
| Parametros totales | 1.781.433.088 (1,8 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Series de hasta 2.048 puntos; longitud de contexto del LLM no disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles |
| Licencia | LFM Open License v1.0 (lfm1.0, licencia "other") |
| Formato de pesos | Safetensors (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer denso: el lenguaje base es LFM3-1.7B, del que se ajustan todos los pesos excepto los embeddings de tokens. Delante se situa un codificador de series temporales que divide la serie en parches de 8 puntos, con 4 capas feed-forward y 2 de atencion de anchura 1024, seguido de un proyector MLP que lleva la representacion a la anchura del modelo de lenguaje (2048). Cada parche genera un token, mas dos tokens adicionales por serie, de modo que una serie de 512 puntos cuesta 66 tokens. La serie se estandariza para el codificador y su offset y escala se escriben en el prompt como texto, lo que permite que las respuestas den valores reales.

El entrenamiento consta de tres etapas, cada una partiendo de los pesos de la anterior: primero preguntas generadas que solo pueden responderse leyendo la serie; despues las mismas preguntas sobre series de hasta 2.048 puntos; y finalmente una mezcla de datos sinteticos de ChatTS (48%), preguntas generadas (19%), chat plano (15%), series reales con anomalias etiquetadas (10%) y series reales con un evento insertado (8%). Los datos de chat plano provienen de databricks-dolly-15k y los sinteticos de ChatTSRepo/ChatTS-Training-Dataset. El recetario de entrenamiento esta publicado en el repositorio de codigo.

## Capacidades

- Dialogo en lenguaje natural sobre series temporales: tendencia (direccion, valor inicial, magnitud del cambio), estacionalidad (existencia, periodo, amplitud), ruido (presencia y nivel) y cambios locales (picos, caidas, cambios de nivel, con posicion y amplitud).
- Consulta de valores: valor en un punto concreto o minimo y maximo de un tramo, con precision de aproximadamente un cuarto de desviacion estandar el 57% de las veces.
- Comparacion entre varias series: identificar cuales comparten forma o cambian al mismo tiempo.
- Deteccion de anomalias: indicar si algo es inusual, donde y como se manifiesta.
- Manejo de valores perdidos mediante NaN en la entrada.
- Conversacion multi-turno en ingles.
- Capacidad de chat general heredada de LFM3-1.7B (15% de la mezcla de entrenamiento es chat plano).
- No se documenta soporte de tool calling, function calling ni modo de razonamiento explicito.

## Casos de uso

- Monitorizacion de infraestructura: enviar ventanas de metricas (CPU, latencia, trafico) y preguntar si hay comportamiento anomalo, donde y que forma tiene, aprovechando el F1 de 0,65 y la baja tasa de falsos positivos (28 de 129 ventanas normales) en series reales de TSB-AD-U.
- Analisis exploratorio de datos de negocio: preguntar por tendencia, estacionalidad y nivel de ruido de una serie de ventas o demanda antes de construir un modelo estadistico, usando series de hasta 2.048 puntos en una sola consulta.
- Diagnostico de sensores industriales: comparar varias senales simultaneamente para detectar cuales cambian a la vez o comparten forma, util en mantenimiento predictivo.
- Validacion de pipelines de datos: consultar valores puntuales o extremos de un tramo para comprobar que una serie cargada coincide con lo esperado, con un error mediano de 0,18 desviaciones estandar.
- Asistente conversacional para analistas: integrar el modelo en una interfaz de chat donde el analista describa la serie en lenguaje natural y reciba respuestas textuales sin escribir codigo.
- Deteccion de eventos insertados: identificar picos o caidas artificiales en series reales, gracias a la etapa de entrenamiento con eventos insertados (8% de la mezcla final).
- Prototipado e investigacion: al ser un modelo de 1,8B con recetario publicado, sirve como base para experimentar con codificadores de series y datos sinteticos en entornos academicos.

## Benchmarks y rendimiento

Comprension general en el benchmark ChatTS (conjuntos A y B), con el codigo de puntuacion del repositorio ChatTS:

| Modelo | Parametros | A categorico | A numerico | B categorico | B numerico |
|---|---|---|---|---|---|
| LFM3-TS | 1,8B | 82,0% | 77,5% | 79,5% | 76,8% |
| ChatTS-8B | 8B | 83,8% | 82,3% | 84,6% | 82,9% |
| LFM3-1.7B, numeros como texto | 1,7B | 10,4% | 4,0% | 14,2% | 3,0% |

Deteccion de anomalias en 234 ventanas de 512 puntos de siete fuentes de TSB-AD-U no vistas en entrenamiento (105 con anomalia etiquetada, 129 sin ella):

| Modelo | Parametros | Precision | Recall | F1 | Falsas alarmas |
|---|---|---|---|---|---|
| LFM3-TS | 1,8B | 66% | 64% | 0,65 | 28 de 129 |
| ChatTS-8B | 8B | 40% | 53% | 0,46 | 61 de 129 |
| LFM3-1.7B, numeros como texto | 1,7B | 1% | 1% | 0,01 | 111 de 129 |

Lectura de valores: el modelo queda dentro de un cuarto de desviacion estandar el 57% de las veces, con error mediano de 0,18 desviaciones estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 1,78B parametros, en FP16 requiere aproximadamente 3,6 GB solo para pesos, y en cuantizaciones de 8 o 4 bits el requisito baja de forma proporcional (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no documentadas por el autor. Por tamano, cabe en GPUs de consumo con suficiente VRAM (gama RTX 4090, RTX 3090 y similares) en FP16, y en GPUs menores con cuantizacion.
- Cabe en GPU de consumo: si, por el tamano del modelo, aunque el soporte de cuantizacion no esta documentado.
- Opciones de despliegue: la via soportada es `transformers>=5.23` con `trust_remote_code=True` (LFM3 se incorporo a transformers en esa version); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de serie | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-TS | 1,8B | hasta 2.048 puntos | LFM3-1.7B + codificador de parches | LFM Open License v1.0 | Hugging Face, transformers |
| ChatTS-8B | 8B | no disponible | Modelo dedicado a chat sobre series (Xie et al.) | no disponible | repositorio ChatTS en GitHub |
| LFM3-1.7B (numeros como texto) | 1,7B | limitado por el contexto de texto | LLM generico sin codificador de series | LFM Open License v1.0 | Hugging Face |

Frente a ChatTS-8B, LFM3-TS es cuatro veces menor y queda ligeramente por debajo en comprension general (77,5% frente a 82,3% en el conjunto A numerico) pero lo supera claramente en deteccion de anomalias sobre series reales (F1 de 0,65 frente a 0,46). Frente a pasar los numeros como texto a LFM3-1.7B, la mejora es de orden de magnitud en todas las tareas.

## Limitaciones y advertencias

- Solo funciona en ingles; no se documenta soporte de otros idiomas.
- Entrenado con series de hasta 2.048 puntos; no se garantiza comportamiento fuera de ese rango.
- Proyecto independiente de un solo autor, no afiliado a Liquid AI, con 0 likes y 554 descargas en el momento de la ficha: ecosistema y validacion externa limitados.
- Riesgo de alucinacion inherente a un modelo de lenguaje: las respuestas sobre valores y posiciones pueden ser incorrectas; la lectura de valores solo es exacta dentro de un cuarto de desviacion estandar el 57% de las veces.
- La deteccion de anomalias tiene un 34% de falsos positivos sobre ventanas normales (28 de 129), insuficiente para alertas automaticas sin supervision humana.
- Licencia LFM Open License v1.0: es necesario revisar sus terminos antes de uso comercial, ya que se hereda de LFM3-1.7B y no es una licencia permisiva estandar.
- Requiere `trust_remote_code=True` y `transformers>=5.23`, lo que implica ejecutar codigo del autor y limita la compatibilidad con stacks de despliegue habituales.
- No se documentan capacidades de tool calling ni de agentes, lo que dificulta su integracion en pipelines automatizados complejos.
- Los sesgos concretos del modelo no estan documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nardi/LFM3-TS
- Codigo y recetario de entrenamiento: https://github.com/nardi-xhepi/lfm3-ts
- Entrada de blog del autor: https://nardi-xhepi.github.io/blog/posts/lfm3-ts.html
- Modelo base LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- ChatTS (codigo y datos): https://github.com/NetManAIOps/ChatTS
- Benchmark ChatTS (conjuntos A y B): https://zenodo.org/records/14349206
- TSB-AD: https://github.com/TheDatumOrg/TSB-AD
- Dataset databricks-dolly-15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Transformers: https://github.com/huggingface/transformers

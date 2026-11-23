# doofz/THX-01

## Resumen

THX-01 es un modelo de decisión multilingüe no autorregresivo desarrollado por HAL-X AI (publicado en Hugging Face bajo el usuario `doofz`). No es un modelo generativo al uso: recibe un estado (un mensaje, ticket, correo, documento, registro JSON o traza de agente) y una o varias preguntas tipadas en lenguaje natural, y devuelve en un único forward pass una respuesta calibrada para cada pregunta. El modelo está construido sobre el encoder `jhu-clsp/mmBERT-base` (22 capas, vocabulario de 256k) y añade una cabeza de decisión de 15M de parámetros, sumando 322M de parámetros totales.

La relevancia de THX-01 reside en su enfoque de calibración: se entrena con Reinforcement Learning for Calibrated Decisions (RLCD), donde la recompensa es una regla de puntuación estrictamente propia (proper scoring rule), de modo que la única estrategia óptima es reportar probabilidades honestas. Esto lo diferencia de los LLM generativos, que no devuelven probabilidades calibradas de forma nativa. Además, soporta de forma nativa la extracción de números, fragmentos textuales literales y citas de apoyo, todo a través de la misma interfaz de preguntas tipadas.

Con una latencia de aproximadamente 10 ms por petición en una GPU (y alrededor de 1 ms por decisión en lote), THX-01 se posiciona como una alternativa de bajo coste y alta precisión para tareas de enrutamiento, clasificación y extracción estructurada en producción, con licencia Apache 2.0 y soporte declarado de más de 100 idiomas (post-entrenado en 18, con énfasis en azerbaiyano).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer no autorregresivo (mmBERT-base, 22 capas) con cabeza de decisión de 15M de parámetros |
| Parametros totales | 321.908.998 (307M encoder + 15M cabeza de decisión) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 1.024 tokens por pregunta (pregunta, opciones y estado); estados más largos se truncan |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Post-entrenado en 18 idiomas (az, en, ru, tr, de, fr, es, ar, hi, zh, fa, ka, ja, ko, uk, kk, uz, it); más de 100 soportados según el autor |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

THX-01 es un modelo no autorregresivo de decisión. La arquitectura parte del encoder `jhu-clsp/mmBERT-base` (22 capas, vocabulario de 256.000 tokens) y añade una cabeza de decisión específica de 15M de parámetros. En lugar de generar texto token a token, el modelo procesa conjuntamente el estado y las preguntas tipadas y emite directamente una distribución calibrada sobre las respuestas posibles (opciones, sí/no, niveles ordinales, números, fragmentos o citas).

El post-entrenamiento se realizó mediante ocho etapas a gran escala de Reinforcement Learning for Calibrated Decisions (RLCD), con aproximadamente 2,1 millones de decisiones de entrenamiento. La innovación clave es que la función de recompensa es una regla de puntuación estrictamente propia, lo que garantiza que maximizar la recompensa equivale a reportar probabilidades honestas y calibradas. No se dispone de información sobre el volumen total de tokens de preentrenamiento ni sobre la composición exacta del dataset más allá del número de decisiones de RL.

## Capacidades

- Clasificación por elección entre N opciones (`choice`), devolviendo una probabilidad por cada opción.
- Preguntas binarias (`noul`), devolviendo P(sí).
- Puntuación ordinal (`score`), devolviendo un nivel ordenado y su distribución.
- Extracción de números (`number`) tal como aparecen en el documento, normalizados (por ejemplo, `1,2 mln` se convierte en `1200000`), o `null` si el valor no está presente.
- Extracción de fragmentos literales (`excerpt`) con sus offsets de caracteres, sin posibilidad de texto inventado.
- Citas de apoyo (`cite: true`) para cualquier tipo de pregunta, indicando las partes del documento que sustentan la respuesta con sus probabilidades.
- Capacidades multilingües: post-entrenado en 18 idiomas con énfasis en azerbaiyano; soporte declarado de más de 100 idiomas.
- Compatibilidad con capas de servicio existentes: responde a llamadas de emulación basadas en `choice` (buckets de rangos y chunks de documento) mediante su lookup nativo.
- No es un modelo generativo: no produce texto libre ni razonamiento multi-paso autorregresivo.

## Casos de uso

- Clasificación de tickets de soporte: el modelo asigna una de quince categorías (facturación, reembolso, login, bug técnico, caída de servicio, entrega, etc.) con probabilidad calibrada en unos 10 ms, lo que permite enrutar automáticamente grandes volúmenes de tickets en tiempo real.
- Enrutamiento de correos y mensajes: dado un mensaje y un conjunto de departamentos o colas, THX-01 devuelve la probabilidad de cada destino, facilitando reglas de enrutamiento basadas en umbrales de confianza.
- Extracción de datos de facturas y declaraciones de aduanas: las preguntas de tipo `number` devuelven importes normalizados exactamente como figuran en el documento, y `excerpt` permite recuperar el fragmento literal de respaldo para auditoría.
- Análisis de informes financieros: extracción de cifras (ingresos, beneficio neto) con citas de la frase de apoyo, útil para pipelines de análisis automatizado que requieren trazabilidad.
- Verificación de contratos y documentos legales: preguntas de tipo `noul` y `score` para comprobar la presencia de cláusulas o evaluar su nivel de riesgo, con citas que señalan la parte del contrato relevante.
- Moderación y triaje de trazas de agentes: dado un registro JSON o una traza de agente, el modelo puede decidir si la traza contiene un error, una acción insegura o una categoría concreta, en una sola pasada y con latencia de milisegundos.
- Procesamiento por lotes de alta throughput: al devolver aproximadamente 1 ms por decisión en lote, es adecuado para clasificar millones de registros en pipelines de datos sin depender de APIs de LLM.

## Benchmarks y rendimiento

Clasificación de tickets de soporte (quince categorías, 2.843 tickets en azerbaiyano, ruso, inglés y turco; cuatro conjuntos de prueba: Clean, Corrupted, Messy e Independent):

| Modelo | Clean | Corrupted | Messy | Independent | Media | ECE | Latencia |
|---|---|---|---|---|---|---|---|
| THX-01 | 99,2 | 97,7 | 98,8 | 97,9 | 98,4 | 0,003 | ~10 ms |
| Claude Sonnet 5.5 † | 98,5 | 98,0 | 98,5 | 99,0 | 98,5 | – | 1,5 s |
| Wahoo 1.5 | 99,8 | 96,3 | 98,0 | 97,2 | 97,8 | – | 145 ms |
| GPT-6-Luna | 98,6 | 97,4 | 96,7 | 98,2 | 97,7 | – | 1,9 s |
| TypeSafe Jev 1.13 | 99,2 | 95,0 | 96,2 | 99,0 | 97,4 | 0,007 | 331 ms |
| Kev-4B | 96,1 | 88,4 | 90,8 | 95,8 | 92,8 | 0,202 | 830 ms |

† Evaluado sobre un subconjunto estratificado de 200 tickets por conjunto. El ECE se mide sobre el conjunto Independent; los LLM no devuelven probabilidades. La latencia de THX-01 corresponde a una GPU; la de los demás modelos, a través de sus APIs.

Extracción y citas (documentos multilingües reservados: informes de resultados, facturas, declaraciones de aduanas, contratos, noticias y correos; 1.824 preguntas numéricas y 1.357 preguntas de fragmento):

| Tarea | Checkpoint anterior | THX-01 |
|---|---|---|
| Number | No disponible (dato truncado en la información proporcionada) | No disponible (dato truncado en la información proporcionada) |

Los datos de la tabla de extracción y citas están incompletos en la información disponible; no se presentan cifras para no inventarlas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 322M parámetros, en FP16 el peso ronda los 0,65 GB y en FP32 alrededor de 1,3 GB, por lo que la huella de memoria es reducida.
- GPU recomendadas: el autor indica que el modelo se ejecuta en GPU y reporta unos 10 ms por petición en una GPU; no especifica modelos concretos. Por tamaño, cabe holgadamente en A100, H100, RTX 4090 y GPUs de consumo con 4 GB o más de VRAM.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (322M parámetros), aunque el autor no detalla requisitos mínimos.
- Opciones de despliegue: librería `thx01` desde PyPI (`pip install thx01`) y servidor REST mediante el extra `thx01[server]`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: aproximadamente 10 ms por petición en una GPU y aproximadamente 1 ms por decisión en lote, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media en clasificación de tickets | ECE | Latencia | Licencia |
|---|---|---|---|---|---|---|
| THX-01 | 322M | 1.024 tokens por pregunta | 98,4 | 0,003 | ~10 ms | Apache 2.0 |
| TypeSafe Jev 1.13 | No disponible | No disponible | 97,4 | 0,007 | 331 ms | No disponible |
| Kev-4B | ~4B (por el nombre) | No disponible | 92,8 | 0,202 | 830 ms | No disponible |
| Wahoo 1.5 | No disponible | No disponible | 97,8 | – | 145 ms | No disponible |

La comparación se limita a los datos publicados por el autor en la model card; no se dispone de información sobre parámetros, contexto ni licencia de los modelos alternativos. THX-01 destaca por su calibración (ECE de 0,003) y su latencia, aunque su ventana de 1.024 tokens por pregunta es inferior a la de los LLM generativos comparados.

## Limitaciones y advertencias

- Ventana de contexto limitada: 1.024 tokens por pregunta (pregunta, opciones y estado); los estados más largos se truncan, lo que puede provocar pérdida de información en documentos extensos.
- No es un modelo generativo: no produce texto libre, razonamiento multi-paso ni explicaciones; solo responde a preguntas tipadas.
- La extracción numérica no realiza conversión de unidades ni de divisas: si el documento expresa millas y se pregunta por kilómetros, o dólares frente a euros, la respuesta es `null`.
- Riesgo de sesgo: no se documentan sesgos conocidos en la información disponible; el énfasis en azerbaiyano puede implicar un rendimiento desigual entre los 18 idiomas post-entrenados.
- Riesgo de alucinación: limitado en las preguntas de tipo `excerpt`, que se recortan del documento y no pueden contener texto inventado; en `number` el riesgo se reduce a la normalización, pero no se documenta su comportamiento ante formatos ambiguos.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base `jhu-clsp/mmBERT-base`.
- Para producción: la calibración (ECE de 0,003) se reporta sobre el conjunto Independent de tickets; no se dispone de datos de calibración en otros dominios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/doofz/THX-01
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Librería en PyPI: `pip install thx01` (no se proporciona URL directa)
- No se han proporcionado enlaces a papers, blogs, repositorios o demos adicionales en la información disponible.

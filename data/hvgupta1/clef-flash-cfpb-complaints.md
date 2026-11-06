# hvgupta1/clef-flash-cfpb-complaints

## Resumen

clef-flash-cfpb-complaints es un adaptador de ajuste fino (fine-tuning) sobre el modelo base Cloudflare/clef-flash, desarrollado por el usuario hvgupta1 y publicado en HuggingFace. El modelo está especializado en la clasificación de quejas bancarias reales presentadas ante la CFPB (Consumer Financial Protection Bureau) de Estados Unidos, resolviendo tres tareas simultáneas: identificación del problema (issue), del producto financiero implicado (product) y del resultado deseado por el reclamante (outcome).

El modelo se entrena mediante la herramienta clef-tune sobre un conjunto de 3.000 filas de entrenamiento y 300 de evaluación, partiendo del checkpoint f0b7d3cd65296abfe459e6c228b618f5d8b26d2f de Cloudflare/clef-flash. El resultado es un adaptador de aproximadamente 0,7 GB en formato safetensors, lo que sugiere un tamaño de modelo base en el rango de los miles de millones de parámetros, aunque el autor no especifica la arquitectura ni el número exacto de parámetros.

La relevancia del modelo radica en su enfoque práctico: demuestra que un ajuste fino ligero (0,7 horas de entrenamiento, coste estimado de 1,85-2,02 dólares) sobre un modelo base pequeño puede superar a modelos propietarios de gran escala como Claude Opus 5.5 en tareas de clasificación estructurada de quejas, con un 44,4% de acierto exacto en las tres etiquetas frente al 41,3% del modelo propietario cuando este recibe ejemplos. El modelo incluye además calibración de temperatura para mejorar la fiabilidad de las probabilidades predichas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador sobre Cloudflare/clef-flash) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador) |

## Arquitectura y entrenamiento

El modelo es un adaptador de fine-tuning sobre Cloudflare/clef-flash, un modelo base del que no se proporcionan detalles arquitectónicos en la información disponible. El entrenamiento se realizó con clef-tune versión 0.0.0+gaf1a9a4708f2 sobre el dataset hvgupta1/cfpb-bank-complaints-benchmark, que contiene quejas reales presentadas a un gran banco estadounidense ante la CFPB. El conjunto de entrenamiento consta de 3.000 filas y el de evaluación de 300, con un tiempo de ejecución de 0,7 horas y un coste de 2,02 dólares.

El modelo resuelve tres tareas de clasificación independientes pero relacionadas: la categoría del problema (8 clases: card features or terms, closing an account, disputed purchase, fraud or scam, managing an account, opening an account, other, unwanted charge), el producto financiero (3 clases: checking or savings account, credit card, money transfer) y el resultado esperado (3 clases: explanation only, fix without money, money back). Tras el ajuste fino, el autor aplicó calibración de temperatura por tarea (1,311 para issue, 1,291 para product, 1,215 para outcome), reduciendo el error de calibración esperado (ECE) de 0,124 a 0,085 en la tarea de issue, de 0,042 a 0,012 en product y de 0,083 a 0,067 en outcome. El autor advierte que las temperaturas se ajustaron sobre el mismo conjunto de evaluación usado para seleccionar el checkpoint, por lo que las métricas post-calibración son ligeramente optimistas.

## Capacidades

- Clasificación multi-etiqueta de quejas bancarias en tres dimensiones simultáneas: problema (issue), producto (product) y resultado deseado (outcome).
- Clasificación de problemas en 8 categorías específicas del dominio financiero (fraude, cargos no deseados, disputas de compra, gestión de cuenta, etc.).
- Clasificación de productos financieros en 3 categorías (cuenta corriente/ahorro, tarjeta de crédito, transferencia de dinero).
- Predicción del resultado esperado por el reclamante (solo explicación, corrección sin devolución de dinero, devolución de dinero).
- Generación de probabilidades calibradas por tarea, aptas para umbrales de decisión y análisis de confianza.
- Capacidad de procesamiento de texto de quejas reales en inglés estadounidense (dominio CFPB).
- No se dispone de información sobre soporte de tool calling, agentes, multilingüismo, visión, audio ni modos de razonamiento extendido.

## Casos de uso

- Triaje automatizado de quejas regulatorias: el modelo clasifica cada queja entrante en problema, producto y resultado esperado, permitiendo enrutar automáticamente los casos a los equipos de cumplimiento, fraude o atención al cliente correspondientes. Su exactitud del 44,4% en las tres etiquetas y del 69,8% en issue lo hacen adecuado como primera capa de triaje con revisión humana posterior.
- Análisis de tendencias regulatorias: al clasificar grandes volúmenes de quejas CFPB por producto y problema, los equipos de compliance pueden identificar patrones emergentes (por ejemplo, aumento de quejas por fraude en tarjetas de crédito) y anticipar riesgos regulatorios.
- Priorización de casos con devolución de dinero: la predicción de la etiqueta outcome (money back) permite identificar qué quejas requieren gestión de reembolsos, optimizando la asignación de recursos del equipo de resolución.
- Enrutamiento inteligente en centros de contacto: integrado en un CRM bancario, el modelo puede etiquetar automáticamente los tickets entrantes y asignarlos al departamento adecuado, reduciendo el tiempo de primera respuesta.
- Investigación académica sobre quejas financieras: el modelo proporciona etiquetas estructuradas y probabilidades calibradas que facilitan estudios cuantitativos sobre patrones de reclamación y resolución en el sector bancario estadounidense.
- Generación de informes de cumplimiento: las clasificaciones agregadas por producto y outcome permiten elaborar informes periódicos para reguladores sobre el volumen y la naturaleza de las quejas recibidas, con métricas de confianza derivadas de la calibración.
- Benchmarking de modelos ligeros frente a propietarios: sirve como caso de referencia para evaluar si un adaptador pequeño ajustado con pocos datos puede competir con modelos de gran escala en tareas de clasificación de dominio específico.

## Benchmarks y rendimiento

Resultados en el conjunto de evaluación interno (300 filas):

| Tarea | Métrica | Baseline | Fine-tuned |
|---|---|---|---|
| issue | accuracy | 0,367 | 0,667 |
| issue | macro-F1 | 0,325 | 0,573 |
| issue | log-loss | 1,691 | 1,005 |
| product | accuracy | 0,783 | 0,857 |
| product | macro-F1 | 0,756 | 0,821 |
| product | log-loss | 0,554 | 0,390 |
| outcome | accuracy | 0,547 | 0,707 |
| outcome | macro-F1 | 0,325 | 0,513 |
| outcome | log-loss | 1,242 | 0,691 |
| all | exact match | 0,183 | 0,447 |

Resultados en el conjunto de test externo (378 quejas de julio de 2026, nunca usadas en entrenamiento):

| Modelo | Las tres correctas | Issue | Product | Outcome |
|---|---|---|---|---|
| Este modelo | 44,4% (39,2-49,7) | 69,8% | 91,0% | 65,3% |
| El mismo modelo sin ajuste | 19,6% (15,6-23,8) | 43,7% | 86,5% | 51,1% |
| Claude Opus 5.5, con 30 ejemplos | 41,3% (36,2-46,3) | 60,8% | 91,3% | 68,0% |
| Claude Opus 5.5, solo instrucciones | 33,3% (28,6-37,8) | 56,1% | 91,8% | 64,0% |

Calibración por tarea:

| Tarea | Temperatura | ECE antes | ECE después | Log-loss antes | Log-loss después |
|---|---|---|---|---|---|
| issue | 1,311 | 0,124 | 0,085 | 1,005 | 0,970 |
| product | 1,291 | 0,042 | 0,012 | 0,390 | 0,375 |
| outcome | 1,215 | 0,083 | 0,067 | 0,691 | 0,682 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del adaptador es de 0,7 GB, pero el modelo base Cloudflare/clef-flash requiere memoria adicional no especificada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se especifican vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles. El entrenamiento consumió 0,7 horas con un coste de 2,02 dólares, pero no se proporcionan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Exact match (3 etiquetas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clef-flash-cfpb-complaints | no disponible | no disponible | 44,4% | no disponible | HuggingFace |
| Cloudflare/clef-flash (sin ajuste) | no disponible | no disponible | 19,6% | no disponible | HuggingFace |
| Claude Opus 5.5 (con 30 ejemplos) | no disponible | no disponible | 41,3% | propietaria | API |
| Claude Opus 5.5 (solo instrucciones) | no disponible | no disponible | 33,3% | propietaria | API |

No se dispone de información sobre otros adaptadores o modelos especializados en clasificación de quejas CFPB para una comparación más amplia.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en quejas bancarias estadounidenses del dominio CFPB; su rendimiento fuera de ese dominio no está evaluado y probablemente sea deficiente.
- La exactitud en la tarea de issue es del 69,8%, con confusión notable en categorías como "card features or terms" (solo 1 acierto de 14 en la matriz de confusión) y "unwanted charge" (6 aciertos de 14), lo que limita su uso autónomo en producción sin revisión humana.
- La tarea de outcome muestra confusión significativa: 35 casos de "explanation only" se predicen como "money back" y 41 casos de "money back" se predicen como "explanation only", lo que puede provocar errores en la priorización de reembolsos.
- Las temperaturas de calibración se ajustaron sobre el mismo conjunto de evaluación usado para seleccionar el checkpoint, por lo que las métricas post-calibración (ECE y log-loss) son ligeramente optimistas según el propio autor.
- No se especifica la licencia del modelo, lo que impide determinar si su uso comercial está permitido.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación en texto generado (el modelo parece orientado a clasificación, no a generación libre) ni limitaciones idiomáticas.
- El modelo tiene 0 descargas y 0 likes en HuggingFace en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El conjunto de test externo es de 378 quejas de un único mes (julio de 2026) y un único banco estadounidense, lo que limita la generalización de los resultados a otras entidades o periodos.
- No se proporcionan detalles sobre la arquitectura del modelo base, el número de parámetros ni la longitud de contexto, lo que dificulta evaluar su idoneidad para quejas de gran longitud.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/hvgupta1/clef-flash-cfpb-complaints
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Dataset de entrenamiento: https://huggingface.co/datasets/hvgupta1/cfpb-bank-complaints-benchmark
- Metodología, costes, velocidad y límites del benchmark: https://github.com/hersh-gupta/clef-tune/tree/main/benchmarks/README.md

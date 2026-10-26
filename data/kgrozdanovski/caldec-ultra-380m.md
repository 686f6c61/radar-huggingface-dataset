# kgrozdanovski/caldec-ultra-380m

## Resumen

CalDec Ultra 380M es un modelo de decisión de tipo clasificador, no un generador de texto. Lo desarrolla el usuario de HuggingFace kgrozdanovski y consiste en una cabeza de decisión en formato Laya montada sobre el encoder dmis-lab/UltraBERT-380M. Recibe un estado (por ejemplo, el contenido de una página web recién recuperada) junto con preguntas cerradas y devuelve respuestas y probabilidades en una sola pasada del encoder, sin decodificación autorregresiva.

El modelo resuelve un problema muy concreto en asistentes personales: tomar decisiones tipadas (sí/no, elección entre opciones, puntuación) sobre estados largos, de hasta 8.192 tokens, con latencia baja. Frente a un modelo generativo, elimina el coste de generar texto y permite evaluar todas las preguntas de un mismo caso en una única inferencia, lo que abarata el filtrado previo de acciones, la detección de inyecciones de prompt y el enrutado de herramientas.

Es relevante ahora porque forma parte de la familia CalDec, publicada con pesos abiertos, dataset de entrenamiento y receta completa, y porque compite con un modelo cerrado (Jev 1.13) en su dominio: 0,848 de accuracy en el test de assistant-decisions frente a 0,836 de Jev en zero-shot. Sus 404 millones de parámetros y su licencia Apache 2.0 lo hacen desplegable en una GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer UltraBERT (base dmis-lab/UltraBERT-380M) con cabeza de decisión en formato Laya; capas de atención local sustituidas por una ruta block-sparse exacta |
| Parametros totales | 404.049.670 |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (solo inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification |
| Tipos de pregunta | noul (sí/no), choice (elección), score (puntuación) |
| Salida | Respuestas y probabilidades; no genera texto |
| Modelo base | dmis-lab/UltraBERT-380M |
| Tamano del repositorio | 1,6 GB |
| Autor | kgrozdanovski |
| Fecha de creacion | 2026-10-23 |

## Arquitectura y entrenamiento

El modelo parte del encoder UltraBERT-380M, al que se le añade una cabeza de decisión en formato Laya. La modificación técnica principal es que las capas de atención local de UltraBERT se conmutan a una ruta block-sparse exacta, lo que permite procesar estados de hasta 8.192 tokens en una sola pasada y responder simultáneamente todas las preguntas de un caso. Las preguntas son de tres tipos cerrados: noul (sí/no), choice (selección entre opciones) y score (puntuación). El modelo no genera tokens: emite directamente respuestas y probabilidades calibradas.

El ajuste fino se realizó sobre el dataset kgrozdanovski/assistant-decisions, incluidas sus variantes de estado largo. En las etiquetas de los tags figuran también nyu-mll/glue y google/boolq. Los objetivos del conjunto de test de asistente fueron escritos por GLM 5.3, y existe una variante de test reetiquetada con dos de Claude Opus 5.5, GPT-5.6 Sol y Gemini 3.8 Flash por caso, para comprobar que las puntuaciones no dependen del modelo que generó las etiquetas. El número de tokens de entrenamiento, la composición exacta del dataset y el uso de RLHF o DPO no están disponibles en la información proporcionada.

## Capacidades

- Clasificación de decisiones cerradas sobre un estado: preguntas de sí/no (noul), elección entre alternativas (choice) y puntuación (score).
- Respuesta a todas las preguntas de un caso en una única pasada del encoder, sin generación de texto.
- Salida de probabilidades, con calibración declarada: error de calibración esperado (ECE) de 0,086 en el test de desarrollo.
- Manejo de estados largos de hasta 8.192 tokens, con atención de contexto largo verificada en el test de estado largo (0,734 de accuracy en casos de 3-8K tokens).
- Detección de inyecciones de prompt en textos largos: 54% de detección en páginas de 8K en la prueba interna del autor.
- Uso como componente de decisión dentro de pipelines de asistentes (por ejemplo, decidir si se invoca una herramienta), aunque el modelo en sí no implementa tool calling generativo.
- Sin capacidades multilingües: solo inglés. Sin visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Filtrado previo de acciones en asistentes: dado el estado de la conversación y el contenido recuperado, el modelo responde en una pasada si procede ejecutar una herramienta concreta, con latencia de 25-170 ms según la longitud del estado, lo que permite intercalarlo en cada turno sin degradar la experiencia.
- Detección de inyección de prompt en contenido web: se pasa la página descargada como estado y se formula una pregunta noul sobre la presencia de instrucciones hostiles; el autor reporta 54% de detección en páginas de 8K, por lo que es útil como primera barrera combinada con otras comprobaciones.
- Enrutado entre herramientas o candidatos: con preguntas de tipo choice, el modelo selecciona la opción más probable entre varias (herramienta, plantilla, documento) y devuelve la distribución completa, lo que permite aplicar umbrales o abstención.
- Puntuación de relevancia de documentos recuperados: con preguntas de tipo score, se puntúa cada fragmento respecto a la consulta del usuario, reutilizando una sola pasada para todos los fragmentos del mismo estado.
- Etiquetado por lotes de trazas de asistente: al no generar texto y correr en bfloat16 sobre una GPU de consumo, permite anotar grandes volúmenes de trayectorias con decisiones tipadas para análisis o para construir datasets de evaluación.
- Políticas de escalado con umbral calibrado: al devolver probabilidades con ECE de 0,086, se puede escalar a un modelo mayor o a revisión humana solo cuando la confianza cae por debajo de un umbral, reduciendo coste en producción.
- Verificación de cumplimiento de instrucciones en pipelines de CI: comprobar mediante preguntas noul si una salida cumple condiciones declaradas (formato, presencia de campos, ausencia de datos sensibles), aunque el modelo está entrenado para estados de asistente y su rendimiento fuera de ese dominio es bajo.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card. La accuracy se define como acuerdo con distribuciones objetivo escritas por modelos, sobre decisiones no ligadas, evaluadas por la ruta servida; no es corrección independiente.

| Modelo | Assistant test | Relabelled test | Long-state test | typed-decisions test |
|---|---:|---:|---:|---:|
| CalDec Ultra 380M | 0,848 | 0,835 | 0,734 | 0,796† |
| CalDec Ultra 150M | 0,834 | 0,819 | 0,722 | 0,782† |
| CalDec GLiNER | 0,843 | 0,828 | 0,614‡ | 0,582 |
| CalDec Laya | 0,823 | 0,811 | 0,563 | 0,778† |
| Jev 1.13, zero-shot | 0,836 | no disponible | no disponible | 0,738 |
| GLiNER2.5-Decide | 0,650 | 0,639 | no disponible | 0,540 |
| Laya base | 0,557 | 0,551 | no disponible | 0,361 |
| UltraBERT-380M, zero-shot | 0,460 | 0,457 | no disponible | no disponible |

† Entrenado con el split de train del benchmark, por lo que no es zero-shot. ‡ Entradas recortadas a sus primeros 2.048 tokens, su mejor corte; los estados completos de 8K agotan la memoria de una GPU de 16 GB.

Métricas adicionales declaradas:

| Metrica | Valor |
|---|---|
| ECE (test de desarrollo de assistant-decisions) | 0,086 |
| Assistant test: casos / decisiones no ligadas | 1.647 / 3.372 |
| Long-state test: casos / decisiones | 77 / 158 |
| Comparación con CalDec Laya (assistant test) | 250 aciertos exclusivos frente a 166 (p < 0,0001) |
| Comparación con CalDec GLiNER (assistant test) | 187 frente a 170 (p = 0,4) |
| Comparación con CalDec Ultra 150M (assistant test) | 215 frente a 168 (p = 0,019) |

Latencia declarada, tres preguntas mediante `system_one` en RTX 4080 SUPER, bfloat16, mediana de 20 llamadas:

| Longitud del estado | 512 | 1.024 | 2.048 | 4.096 | 8.192 tokens |
|---|---:|---:|---:|---:|---:|
| CalDec Ultra 380M | 25 ms | 26 ms | 39 ms | 75 ms | 170 ms |
| CalDec Laya | 33 ms | 56 ms | 123 ms | 330 ms | 920 ms |

Fuera de su dominio, en un subconjunto de nueve benchmarks del Jev Decision Index: ANLI macro-F1 0,167 (azar 0,33; Laya base 0,489), ContractNLI 0,210 (azar 0,31) y When2Call 0,274 (azar 0,25).

## Requisitos de hardware

- VRAM estimada para inferencia: unos 0,8 GB de pesos en bfloat16 para 404 millones de parámetros; el repositorio ocupa 1,6 GB. Con activaciones para estados de 8.192 tokens, la huella se mantiene muy por debajo de las GPU de consumo actuales, aunque el autor no publica un pico de memoria medido para este checkpoint.
- GPU recomendadas: el autor mide latencias en una RTX 4080 SUPER. Cualquier GPU consumer con suficiente VRAM debería servir; no hay datos publicados para A100 o H100.
- Cabe en GPU de consumo: sí, con holgura en tarjetas de 8-16 GB. Como referencia, el autor señala que la variante CalDec GLiNER agota la memoria de una GPU de 16 GB con estados de 8K, lo que implica que este modelo de 380M sí los procesa en ese entorno.
- Opciones de despliegue: el repositorio github.com/kgrozdanovski/caldec, que registra el código de modelado de UltraBERT, conmuta las capas de atención local a la ruta block-sparse y ejecuta todas las preguntas en una pasada. Requiere Python 3.12, torch 2.14, transformers 5.17 y laya 0.3.6. No hay soporte documentado para vLLM, TGI, llama.cpp u Ollama, y al no ser un modelo generativo esas rutas de serving no aplican directamente.
- Latencia y throughput: 25 ms con estados de 512 tokens y 170 ms con 8.192 tokens para tres preguntas por caso en RTX 4080 SUPER. El throughput agregado no está disponible.
- Almacenamiento: 1,6 GB de repositorio, más dependencias de Python y la librería laya.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Assistant test | Long-state test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CalDec Ultra 380M | 404 M | 8.192 | 0,848 | 0,734 | apache-2.0 | Pesos abiertos en HuggingFace |
| CalDec Ultra 150M | no disponible (nombre comercial: 150M) | no disponible | 0,834 | 0,722 | no disponible | Pesos abiertos en HuggingFace |
| CalDec Laya | 421 M | no disponible | 0,823 | 0,563 | no disponible | Pesos abiertos en HuggingFace |
| CalDec GLiNER | no disponible | 8.192 (evaluado recortado a 2.048) | 0,843 | 0,614 | no disponible | Pesos abiertos en HuggingFace |
| Jev 1.13 | no disponible (modelo cerrado) | no disponible | 0,836 (zero-shot) | no disponible | propietaria | Solo API |
| GLiNER2.5-Decide | no disponible | no disponible | 0,650 | no disponible | no disponible | Pesos abiertos en HuggingFace |
| Laya base | 421 M | no disponible | 0,557 | no disponible | no disponible | Pesos abiertos en HuggingFace |

## Limitaciones y advertencias

- Solo inglés. Cualquier estado o pregunta en otro idioma queda fuera de su distribución de entrenamiento.
- Las métricas de accuracy miden acuerdo con distribuciones objetivo escritas por modelos (GLM 5.3, y en el test reetiquetado Claude Opus 5.5, GPT-5.6 Sol y Gemini 3.8 Flash), no corrección humana independiente. No deben interpretarse como precisión real frente a una verdad de referencia.
- Es un especialista de dominio estrecho. En benchmarks fuera de las decisiones de asistente obtiene resultados por debajo del azar en ANLI (macro-F1 0,167 frente a 0,33 de azar) y muy bajos en ContractNLI (0,210) y When2Call (0,274). El propio autor recomienda un modelo entrenado de forma más general para decisiones fuera del ámbito del asistente.
- Detección de inyecciones de prompt incompleta: 54% en páginas de 8K, con especial debilidad cuando la inyección se sitúa al final de la página. No es una defensa suficiente por sí sola.
- Error de calibración esperado de 0,086: los umbrales de confianza deben validarse sobre datos propios antes de automatizar decisiones críticas.
- Dos de las puntuaciones de la tabla (typed-decisions) proceden de modelos entrenados con el split de train de ese benchmark, por lo que no son zero-shot y no son comparables con las de Jev.
- Con 158 decisiones, el test de estado largo tiene poco margen estadístico: el autor indica que las diferencias por debajo de unos 7 puntos son ruido.
- No se publican archivos cuantizados (GGUF, AWQ, GPTQ) ni soporte en runtimes de inferencia estándar; el uso requiere clonar el repositorio CalDec y sus dependencias fijadas, lo que añade coste de mantenimiento en producción.
- Adopción externa mínima en el momento de la ficha: 0 descargas y 1 like, sin validación independiente conocida.
- Licencia Apache 2.0: permite uso comercial con conservación de avisos y sin garantías. Conviene verificar aparte las condiciones de los datos generados por modelos cerrados que se usaron como objetivos de entrenamiento y de los checkpoints base.
- Riesgo de alucinación no aplica en el sentido generativo (no produce texto libre), pero sí existe riesgo de respuesta segura e incorrecta: al devolver siempre una distribución sobre opciones cerradas, un caso fuera de distribución puede recibir una etiqueta con confianza no desdeñable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kgrozdanovski/caldec-ultra-380m
- Modelo base UltraBERT-380M: https://huggingface.co/dmis-lab/UltraBERT-380M
- Variante de 150M: https://huggingface.co/kgrozdanovski/caldec-ultra-150m
- Variante CalDec Laya: https://huggingface.co/kgrozdanovski/caldec-v1-laya
- Variante CalDec GLiNER: https://huggingface.co/kgrozdanovski/caldec-v1-gliner2.5-decide
- Repositorio de código y receta: https://github.com/kgrozdanovski/caldec
- Resultados completos: https://github.com/kgrozdanovski/caldec/blob/main/ULTRA.md
- Dataset de decisiones de asistente: https://huggingface.co/datasets/kgrozdanovski/assistant-decisions
- Dataset typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Jev Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
- GLiNER2.5-Decide (comparativa): https://huggingface.co/fastino/GLiNER2.5-Decide
- Laya base (comparativa): https://huggingface.co/convaiinnovations/laya
- Ficha de registro en free2aitools: https://free2aitools.com/model/kgrozdanovski/caldec-ultra-380m
- Cobertura de AGI Hunt sobre CalDec v1: https://agihunt.info/en/p/1a0fcc399b860265842a12f6c30

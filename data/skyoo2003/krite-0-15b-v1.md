# skyoo2003/krite-0.15b-v1

## Resumen

Krite-0.15b-v1 es un modelo de decisión (decision model) desarrollado por el usuario skyoo2003, construido mediante fine-tuning sobre el encoder jhu-clsp/mmBERT-small. A diferencia de un modelo generativo, Krite no produce texto: recibe un "estado" (state) y responde preguntas tipadas de tres clases — Choice (elegir una opción con nombre), Score (escala ordenada) y Noul (verdadero/falso) — devolviendo una probabilidad calibrada para cada candidato. Está pensado para tomar decisiones estructuradas y cuantificables en lugar de redactar respuestas.

El modelo tiene 140.643.841 parámetros (aproximadamente 0,15B), con un encoder de 22 capas y tamaño oculto 384. Su innovación central es la late interaction "late8": las 14 capas inferiores codifican el estado una única vez, sin ver ninguna pregunta, y el runtime cachea las claves y valores del estado entre peticiones; cada candidato (de hasta 32 token) pasa entonces por las capas superiores atendiendo a esa memoria. Esto garantiza que el orden de las opciones o la presencia de otras preguntas no altere las probabilidades.

Se distribuye bajo licencia Apache-2.0 y soporta diez idiomas (en, ko, ja, zh, de, es, fr, ar, hi, ru). Es importante señalar que se trata de una versión pre-release: según la propia model card, supera todas las puertas de calidad del proyecto excepto las de precisión (accuracy macro 0,783 frente a un objetivo de 0,795) y QWK (0,273 frente a 0,357). No es un modelo `transformers` estándar: requiere el runtime Rust propio (krite-cli) y pesos con nombres de clave específicos de Krite.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (mmBERT-small: 22 capas, hidden 384) con late interaction "late8" y scorer MLP; modelo de decisión no generativo |
| Parametros totales | 140.643.841 (~0,14B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (evaluado con estados de 512 token; candidatos de hasta 32 token) |
| Tipos de cuantizacion | fp32 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | en, ko, ja, zh, de, es, fr, ar, hi, ru |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

La arquitectura parte de mmBERT-small (22 capas, tamaño oculto 384) fine-tuneado. Sobre esa base se define una late interaction denominada "late8": las 14 capas inferiores codifican el estado una sola vez, sin acceder a la pregunta, y el runtime cachea las claves y valores de ese estado entre peticiones. Cada candidato (instrucciones, nombre de opción y, opcionalmente, descripción; máximo 32 token) recorre las capas inferiores por su cuenta y después atiende, en las 8 capas superiores, a la memoria del estado y a sus propios tokens. Los candidatos nunca se atienden entre sí, de modo que el orden de las opciones y otras preguntas no pueden modificar una probabilidad. La puntuación se obtiene con un scorer de media enmascarada más un embedding de tipo de pregunta que alimenta un MLP de energía, con softmax por pregunta. La calibración aplica una temperatura distinta por bucket (por ejemplo, 2,60 para `choice/4`, 1,36 para `choice/5-8`, 1,31 para `choice/9+`, 1,47 para `noul` y 2,49 para `score/5`).

El entrenamiento usa la mezcla "broad", formada por splits de train con licencias permisivas, cada uno fijado a una revisión concreta de Hugging Face. Se descartan las filas cuyo estado aparezca en cualquier suite de evaluación, y los datasets agnews, xnli, sst5 y amazon reviews nunca se leen para entrenamiento. Se realiza una única época con entropía cruzada y semilla 13 (hash del conjunto de entrenamiento sha256 `572b832568c39c9dd81c2e3af91c496fda9384ba3534a428cbdc9b1a8c9cf76a`). Las fuentes incluyen banking77 (CC-BY-4.0), clinc (CC-BY-3.0), massive (CC-BY-4.0), dbpedia (CC-BY-SA-3.0), boolq (CC-BY-SA-3.0), snli (CC-BY-SA-4.0), civil comments (CC0-1.0), sib200 (CC-BY-SA-4.0), mnli, paws-x, y go_emotions (Apache-2.0). Se aplican vistas (reformular una fuente como otro tipo de pregunta) y aumentaciones (formato de estado, candidatos irrelevantes).

## Capacidades

- Clasificación zero-shot mediante preguntas tipadas: Choice (elegir entre opciones con nombre), Score (escala ordenada) y Noul (verdadero/falso).
- Devuelve una probabilidad calibrada por candidato en lugar de texto generado.
- Multilingüe en diez idiomas: inglés, coreano, japonés, chino, alemán, español, francés, árabe, hindi y ruso.
- Invariante al orden de las opciones: la tasa de cambio por permutación es 0 y la desviación máxima de probabilidad es 0.
- Independencia entre preguntas: la interferencia máxima entre preguntas es 1,7e-7 (límite 1e-5).
- Cache de estado activable: la desviación con y sin caché es 0.
- No soporta generación de texto, tool calling ni razonamiento multi-paso generativo: su salida es una distribución de probabilidad sobre candidatos.

## Casos de uso

- Enrutado de tickets de soporte: clasificar un mensaje entrante entre equipos (facturación, envíos, técnico) mediante una pregunta Choice, aprovechando que las probabilidades por opción son calibradas y estables frente al orden de las categorías.
- Moderación y triaje de contenido: usar preguntas Noul sobre textos de comentarios para decidir si requieren revisión, con umbrales derivados de la probabilidad calibrada.
- Clasificación de intención en asistentes conversacionales: asignar la intención del usuario a una lista de opciones con nombre, sin necesidad de entrenar un clasificador específico por dominio.
- Puntuación de satisfacción o calidad: emplear preguntas Score (por ejemplo, escala de 5) para asignar un valor ordenado a un estado de texto, útil en encuestas o análisis de opiniones.
- Análisis de sentimiento y emociones: reutilizar las fuentes go_emotions y sst5 como preguntas tipadas para etiquetar emociones o polaridad de forma probabilística.
- Filtrado de contenido en pipelines de datos: descartar o marcar filas según preguntas booleanas sobre su calidad o temática antes de alimentar otros sistemas.
- Investigación en calibración y evaluación de modelos de decisión: servir como referencia reproducible con puertas de calidad y métricas de invariancia documentadas.

## Benchmarks y rendimiento

Resultados de las puertas de calidad del release, medidos en un MacBook Air 13 (Apple M4, 16 GB, sin ventilador), con alimentación de red, Candle Metal, fp32, capa HTTP, estado de 512 token y 4 opciones por pregunta. Los valores de latencia no son comparables con resultados en GPU.

| Puerta | Valor | Limite | Pasa |
|---|---|---|---|
| Accuracy (macro sobre 5 datasets de choice y noul) | 0,783 | ≥ 0,795 | no |
| QWK (macro sobre 2 datasets de score) | 0,273 | ≥ 0,357 | no |
| ECE tras calibracion (media sobre 28 suites) | 0,057 | ≤ 0,071 | si |
| Latencia en caliente, 1 pregunta, p50 | 7,85 ms | ≤ 10 ms | si |
| Latencia en frio, 1 pregunta, p50 | 90,1 ms | ≤ 210 ms | si |
| Throughput, 30 preguntas, en caliente | 211,7 decisiones/s | ≥ 175 | si |
| Tasa de cambio por orden de opciones (todas las permutaciones) | 0 | 0 | si |
| Desviacion maxima de probabilidad por orden de opciones | 0 | ≤ 1e-5 | si |
| Desviacion maxima por interferencia entre preguntas | 1,7e-7 | ≤ 1e-5 | si |
| Desviacion maxima con cache activada frente a desactivada | 0 | ≤ 1e-5 | si |

Las mayores brechas por suite respecto al objetivo son agnews (0,28), sst5 (0,22) y boolq (0,14). Los resultados por suite y las líneas base (Laya, Kev, SemIf, cbjev) se detallan en los documentos del repositorio, pero sus valores concretos no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 0,56 GB en fp32 (tamaño de repo 0,6 GB); alrededor de 0,28 GB si se convirtiera a fp16 y 0,14 GB en int8, aunque no se documentan estas cuantizaciones.
- GPU recomendadas: no se especifican en la model card; el runtime usa Metal cuando está disponible y, en su defecto, CPU.
- Compatibilidad con GPU de consumo: por tamaño cabe con holgura en cualquier GPU de consumo, pero el modelo no está pensado para CUDA de forma documentada; las mediciones oficiales se realizaron en un Apple M4.
- Opciones de despliegue: únicamente el runtime propio Krite (instalable con `cargo install krite-cli`), que sirve el modelo sobre Protocol v1 en `POST /v1/systemone` en 127.0.0.1:8110. No es compatible con vLLM, llama.cpp, Ollama, TGI ni con `transformers` estándar.
- Latencia y throughput medidos: 7,85 ms p50 en caliente (1 pregunta), 90,1 ms p50 en frío (1 pregunta) y 211,7 decisiones/s con 30 preguntas en caliente, todo en Apple M4 con Metal y fp32.

## Comparativa con modelos similares

La model card menciona líneas base denominadas Laya, Kev, SemIf y cbjev, utilizadas como referencia para fijar los objetivos de accuracy y QWK, pero no se proporcionan sus parámetros, contexto, licencia ni resultados numéricos en la información disponible. Tampoco se ofrecen comparaciones detalladas con otros modelos de decisión o clasificadores zero-shot.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| krite-0.15b-v1 | 140.643.841 | no disponible | Apache-2.0 | Hugging Face + runtime Krite |
| Laya | no disponible | no disponible | no disponible | no disponible |
| Kev | no disponible | no disponible | no disponible | no disponible |
| SemIf / cbjev | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es una versión pre-release: no supera las puertas de accuracy (0,783 frente a 0,795) ni de QWK (0,273 frente a 0,357), por lo que su precisión está por debajo del objetivo declarado por el autor.
- No genera texto: cualquier caso de uso que requiera redacción, resumen o diálogo generativo queda fuera de su alcance.
- No soporta tool calling ni razonamiento multi-paso; su única salida es una distribución de probabilidad sobre candidatos.
- Está limitado a los tipos de pregunta Choice, Score y Noul, con candidatos de hasta 32 token; los estados se han evaluado a 512 token y no se documenta una longitud de contexto máxima.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración imperfecta fuera de las distribuciones cubiertas por las temperaturas ajustadas (los buckets de calibración son `choice/4`, `choice/5-8`, `choice/9+`, `noul` y `score/5`).
- No es un modelo `transformers`: los pesos usan los nombres de clave del runtime Krite, lo que limita su integración a ese ecosistema y complica su uso con herramientas estándar.
- Licencia Apache-2.0, que permite uso comercial; sin embargo, las fuentes de entrenamiento tienen licencias diversas (CC-BY, CC-BY-SA, CC0, OANC), y algunas incluyen cláusulas de compartir igual que conviene revisar antes de un despliegue comercial.
- Las métricas de rendimiento proceden de un Apple M4 con Metal y fp32; su extrapolación a otros entornos no está validada.
- No se documentan sesgos específicos, pero al entrenar sobre datasets como civil comments, go_emotions o snli puede heredar sesgos presentes en ellos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skyoo2003/krite-0.15b-v1
- Repositorio del runtime: https://github.com/skyoo2003/krite
- Documentación de arquitectura: https://github.com/skyoo2003/krite/blob/main/ARCHITECTURE.md
- Documentación del runtime: https://github.com/skyoo2003/krite/blob/main/docs/runtime.md
- Datos de entrenamiento: https://github.com/skyoo2003/krite/blob/main/docs/training-data.md
- Líneas base: https://github.com/skyoo2003/krite/blob/main/docs/baselines.md
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small

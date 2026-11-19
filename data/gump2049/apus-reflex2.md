# gump2049/APUS-Reflex2

## Resumen

APUS Reflex2 (identificador `apus-reflex2-decision-v1`) es un modelo de decisión textual desarrollado por gump2049 bajo el paraguas del proyecto APUS. A diferencia de un modelo generativo convencional, su función es puntuar un conjunto de opciones suministradas por el usuario y devolver una probabilidad para cada candidata junto con la opción seleccionada. La versión publicada en este repositorio es un release candidate de staging; el repositorio canónico previsto es `apus-ailab/APUS-Reflex2`.

El modelo se distribuye con el protocolo APUS/1.0 y expone un endpoint HTTP `POST /v1/systemone` que acepta un objeto JSON con `state`, `questions` y un campo opcional `model`. Cada pregunta admite cuatro tipos: `choice` (entre 2 y 255 opciones), `noul` (booleanas con IDs `true`/`false`), `score` (entre 2 y 10 niveles ordenados) y hasta 64 preguntas por petición. Esta interfaz convierte al modelo en una pieza orientada a sistemas de decisión y ranking más que a generación de texto libre.

La relevancia del modelo radica en su empaquetado de despliegue reproducible: incluye rutas fijadas para Transformers nativo, vLLM 0.33.0 y un runtime APUS propio, además de ficheros Docker, scripts de verificación de salud y protocolo, y un informe de aceptación en H100. El snapshot de pesos ocupa aproximadamente 50 GB, lo que sitúa al modelo en la categoría de gran tamaño y condiciona fuertemente los requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (backend de referencia DJ600/D3 sobre PyTorch; shards safetensors) |
| Parametros totales | no disponible (snapshot de pesos de ~50 GB, 11 shards) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card solo indica soporte de entrada de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (11 shards, índice safetensors incluido) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo más allá de referencias al backend nativo DJ600/D3 y a un snapshot de pesos compuesto por 11 shards, un módulo de readout, tokenizer e índice safetensors. El repositorio APUS añade una capa de configuración y protocolo orientada a APUS sobre el snapshot de origen `gump2049/APUS-Reflex-v2-dj-600`, identificado por el commit `6a94f1215c408be3a74f252ce8b6c264b3453c86` y un manifiesto de merge con SHA256 `37dcee868d7882292cf389674a942f7b390345a22cb474eb91ec11075ac86f2b`. El tag `qwen3.5` sugiere una base derivada de la familia Qwen 3.5, aunque la model card no lo confirma explícitamente.

No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se detalla ninguna innovación arquitectónica concreta (atención lineal, decodificación especulativa, mezcla de expertos) más allá de la mención al backend de referencia. La información disponible se centra en el contrato de servicio y en la verificación de despliegue, no en el proceso de entrenamiento.

## Capacidades

- Decisión sobre opciones suministradas: puntúa cada candidata y devuelve su probabilidad junto con la opción seleccionada.
- Preguntas de tipo `choice` con entre 2 y 255 opciones por pregunta.
- Preguntas de tipo `noul` con IDs `true` y `false`.
- Preguntas de tipo `score` con entre 2 y 10 niveles ordenados.
- Hasta 64 preguntas por petición en un único objeto JSON.
- Entrada de texto en esta versión (sin soporte declarado de imagen, audio u otras modalidades).
- Rechazo explícito de peticiones malformadas; no trunca el estado ni filtra opciones.
- No consume etiquetas de benchmark (declarado en la model card).
- Sin soporte declarado de tool calling, function calling ni razonamiento multi-paso más allá del contrato de decisión.

## Casos de uso

- Sistemas de recomendación con ranking acotado: el modelo puede recibir un estado y una pregunta de tipo `choice` con hasta 255 candidatos y devolver una distribución de probabilidad sobre todos ellos, útil para seleccionar productos, contenidos o rutas con una única llamada.
- Moderación y clasificación binaria: mediante preguntas `noul` se puede evaluar si un texto cumple o no una política concreta, obteniendo la probabilidad asociada a `true` y `false` para fijar umbrales de decisión.
- Evaluación con escala ordinal: las preguntas `score` con 2 a 10 niveles permiten puntuar calidad, relevancia o riesgo de forma graduada, adecuado para triaje o priorización.
- Enrutamiento de consultas en pipelines de agentes: dado un estado con la consulta del usuario y una lista de herramientas o intenciones como opciones, el modelo selecciona la ruta más probable, integrándose como paso de decisión previo a un modelo generativo.
- Selección de respuestas en sistemas de generación con múltiples candidatas: se generan varias respuestas y el modelo puntúa cuál es preferible según criterios definidos en `instructions` y `criteria`.
- Anotación asistida y control de calidad: el modelo puede preetiquetar opciones en tareas de anotación con cobertura completa (devuelve probabilidad para cada opción), facilitando la revisión humana posterior.
- Despliegue en infraestructura propia: el paquete incluye rutas para Transformers nativo, vLLM 0.33.0 y runtime APUS con Docker, lo que permite montar el servicio en un host Linux con NVIDIA Container Toolkit y verificar el contrato con `verify_deploy.sh`.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Decision Index publico (edicion 0.3 release-v3) | 73.82 |
| Raw index | 80.05 |
| Filas puntuables completadas | 140.178 / 140.178 |
| Cobertura | 100% |
| Clasificacion del motor | vLLM public prescreen |
| Smoke oficial (43 filas) | 43/43 ok en H100 |

El resultado corresponde a la ejecucion publica 0.3; la puntuacion Decision Index 0.4 Full la calculan los mantenedores sobre tests privados. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el snapshot de pesos ronda los 50 GB, por lo que en precisión nativa requiere al menos ese orden de magnitud en memoria de GPU.
- GPU recomendadas: H100 (empleada en la verificación oficial de 43 filas); el ejemplo de despliegue usa `TENSOR_PARALLEL_SIZE=2`, lo que implica al menos dos GPU para la ruta vLLM.
- Viabilidad en GPU de consumo: no confirmada; por el tamaño del snapshot no es esperable que quepa en una única GPU consumer sin cuantización, y no se documentan tipos de cuantización.
- Opciones de despliegue: Transformers nativo (backend DJ600/D3 con PyTorch), vLLM 0.33.0 con configuración de servidor de pooling auditada, y runtime APUS que envuelve el backend nativo. Se proporcionan Dockerfiles y scripts de despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no identifica modelos comparables de la misma categoría (modelos de decisión con salida de probabilidades por opción) ni ofrece métricas cruzadas con alternativas.

## Limitaciones y advertencias

- Release candidate de staging: el repositorio canónico previsto es `apus-ailab/APUS-Reflex2`; esta copia puede no ser la definitiva.
- Estado de adopción nulo: 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.
- Idiomas soportados no declarados; no se puede garantizar cobertura multilingüe.
- Longitud de contexto no documentada, lo que impide planificar usos con estados largos.
- Sin información sobre sesgos conocidos ni tasas de alucinación; al ser un modelo de puntuación, el riesgo se traslada a decisiones mal calibradas.
- El modelo no trunca el estado ni filtra opciones; el llamante debe garantizar que las peticiones cumplen los límites (2-255 opciones, 2-10 niveles, máximo 64 preguntas).
- Restricciones de licencia: Apache 2.0 para el modelo, pero se prohíbe entrenar o republicar la suite de evaluación Decision Index; deben conservarse `LICENSE`, `THIRD_PARTY_LICENSE.txt` y `NOTICE` en cualquier redistribución.
- El paquete de despliegue no incluye la copia de 50 GB de pesos ni un endpoint alojado de larga duración; hay que montar o descargar el paquete fijado antes de arrancar el servidor.
- La puntuación Decision Index 0.4 Full se calcula sobre tests privados, por lo que el 73.82 público no es directamente comparable con esa métrica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gump2049/APUS-Reflex2
- Repositorio canónico previsto: https://huggingface.co/apus-ailab/APUS-Reflex2
- Paquete de despliegue: https://huggingface.co/apus-ailab/APUS-Reflex2/tree/main/deploy/APUS-Reflex2
- Dataset de resultados: `gump2049/APUS-Decision-Model-performance/runs/APUS-Reflex-v2-dj-600/`
- Snapshot de origen: `gump2049/APUS-Reflex-v2-dj-600@6a94f1215c408be3a74f252ce8b6c264b3453c86`

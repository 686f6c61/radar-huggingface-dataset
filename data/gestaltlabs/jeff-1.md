# GestaltLabs/Jeff-1

## Resumen

Jeff 1 es un adaptador LoRA publicado por GestaltLabs sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, orientado a producir decisiones tipadas en lugar de texto generado. El modelo recibe texto o datos estructurados junto con un conjunto de preguntas definidas en tiempo de llamada (etiquetas con descripcion, preguntas de si/no o niveles ordenados) y devuelve etiquetas con probabilidades y una puntuacion de confianza. No genera prosa: puntua candidatos usando las probabilidades de token del modelo de lenguaje, con puntuacion por primer token cuando los candidatos tienen primeros tokens distintos y puntuacion por secuencia completa en caso contrario.

El problema que aborda es el de integrar juicios de un modelo en aplicaciones sin necesidad de parsear texto libre, y hacerlo con pesos abiertos que permiten inspeccion, adaptacion y ejecucion local sin depender de una API alojada tras la descarga inicial. Se enmarca en el nicho de la verificacion de hechos y la clasificacion calibrada: la model card reporta evaluacion sobre 9.730 ejemplos de fact-checking etiquetados por humanos procedentes de FEVER, VitaminC, SciFact y Climate-FEVER.

La relevancia actual viene de su enfoque en calibracion: frente a Jev 1.13.0, Jeff 1 obtiene menor exactitud y peor Brier, pero mejor error de calibracion esperado (ECE de 0,0807 frente a 0,0932). El adaptador se distribuye con licencia Apache 2.0, esta pensado solo para ingles y, en el momento de redactar esta ficha, el repositorio no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA sobre el modelo base; la tarea es puntuacion de etiquetas, no generacion |
| Parametros totales | 4B en el modelo base Qwen3-4B-Instruct-2507; el adaptador LoRA anade un numero de parametros no especificado en la informacion disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la hereda del modelo base Qwen/Qwen3-4B-Instruct-2507 |
| Tipos de cuantizacion | no disponible para el adaptador; la cuantizacion aplicable depende del modelo base (el autor no documenta variantes GGUF ni AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (codigo y adaptador) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se descarga aparte |

## Arquitectura y entrenamiento

Jeff 1 no es un modelo completo, sino un adaptador LoRA que se carga sobre Qwen/Qwen3-4B-Instruct-2507 mediante la libreria PEFT. La innovacion principal no esta en la arquitectura del transformer, sino en la capa de lectura (readout): el cliente construye un prompt a partir de las preguntas y candidatos suministrados en la llamada y despues lee las probabilidades de token del modelo para asignar una probabilidad a cada etiqueta candidata. El autor distingue dos regimenes de puntuacion: primer token cuando los candidatos tienen tokens iniciales distintos, y secuencia completa en caso contrario. La confianza reportada es la mayor probabilidad entre las etiquetas.

El adaptador soporta tres tipos de pregunta: `choice` (etiquetas con nombre y descripcion, devuelve etiqueta seleccionada, probabilidades y confianza), `noul` (pregunta de si/no, devuelve la probabilidad de "si") y `score` (niveles ordenados con descripcion, devuelve probabilidades por nivel, indice de nivel esperado y confianza). El modelo se evalua contra Jev 1.13.0 sobre 9.730 ejemplos humanos de fact-checking. Los detalles de composicion del dataset de entrenamiento, numero de tokens, uso de RLHF/DPO y el procedimiento exacto de ajuste no se especifican en la informacion disponible; la model card remite a una guia externa de entrenamiento (`docs/TRAIN_YOUR_OWN.md`) para reproducir el proceso.

## Capacidades

- Clasificacion con etiquetas definidas en tiempo de llamada mediante el tipo `choice`, con descripciones de criterio aportadas por el usuario.
- Decisiones binarias con probabilidad calibrada de "si" mediante el tipo `noul`.
- Puntuacion ordinal sobre niveles ordenados con descripcion, devolviendo probabilidades por nivel e indice de nivel esperado.
- Verificacion de afirmaciones frente a evidencia suministrada (fact-checking): soportado, refutado o informacion insuficiente.
- Salida estructurada y tipada en lugar de texto generado, lo que evita el parseo de prosa en el consumidor.
- Puntuacion por probabilidades de token, con dos regimenes (primer token o secuencia completa) segun los candidatos.
- Inferencia local tras la descarga inicial, sin dependencia de una API alojada.
- Compatibilidad de API con el estilo Jev (Choice, Noul, Score), segun el autor, sin afiliacion con TypeSafe AI.
- Servidor HTTP local con endpoints `POST /v1/systemone`, `GET /health` y `GET /v1/models`, ademas de una demo en `http://127.0.0.1:8079`.
- No se documentan capacidades de generacion de texto libre, codigo, matematicas, vision, audio, tool calling ni uso como agente.

## Casos de uso

- Verificacion de hechos en redaccion periodistica: el modelo recibe una afirmacion y una lista de evidencias y devuelve `supported`, `refuted` o `not_enough_info` con probabilidades, lo que permite incorporar un umbral de confianza antes de publicar o de escalar a revision humana.
- Control de grounding en pipelines RAG: dado un texto generado y los fragmentos recuperados, se puede comprobar si la evidencia sostiene la respuesta antes de mostrarla al usuario final.
- Enrutado de tickets de soporte: con el tipo `choice` y un conjunto de categorias descritas en la llamada, el modelo devuelve la categoria mas probable y su confianza, lo que permite derivar automaticamente y reservar los casos de baja confianza para agentes humanos.
- Anotacion asistida con human-in-the-loop: la confianza por etiqueta permite ordenar la cola de revision, priorizando los ejemplos donde el modelo esta menos seguro, y registrar la probabilidad junto a la anotacion final.
- Extraccion de senales binarias en ETL: el tipo `noul` responde preguntas como si una evidencia incluye un ano o si un texto menciona una entidad, devolviendo una probabilidad que se puede almacenar como caracteristica numerica.
- Puntuacion ordinal de severidad o satisfaccion: con el tipo `score` y niveles como `none`, `weak`, `moderate`, `strong`, se obtiene una puntuacion esperada aprovechable para ranking o agregacion en dashboards.
- Despliegue on-premise con datos sensibles: al ejecutarse localmente sobre un modelo de 4B, es viable en entornos con requisitos de privacidad que prohiben enviar contenido a APIs externas.
- Auditoria de decisiones automaticas: al devolver probabilidades y no texto libre, las decisiones quedan registradas de forma estructurada y son comparables entre ejecuciones.

## Benchmarks y rendimiento

Evaluacion del adaptador `GestaltLabs/Jeff-1` (`lora_4b_multi`) frente a Jev 1.13.0 sobre el mismo conjunto de 9.730 ejemplos de fact-checking etiquetados por humanos (FEVER, VitaminC, SciFact, Climate-FEVER):

| Modelo | Accuracy | Macro-F1 | Brier (menor es mejor) | ECE (menor es mejor) |
|---|---:|---:|---:|---:|
| Jeff 1 | 0,8183 (7.962/9.730) | 0,7789 | 0,2839 | 0,0807 |
| Jev 1.13.0 | 0,8283 (8.059/9.730) | 0,7994 | 0,2750 | 0,0932 |

Notas del autor sobre la comparacion: Jeff 1 presenta menor exactitud y peor Brier que Jev en esta evaluacion, pero menor error de calibracion esperado. Ambos valores de ECE usan la probabilidad maxima de clase y diez intervalos de igual anchura; no se emplea la estadistica de confianza separada de la API de Jev. El autor advierte que un ECE bajo no garantiza que una prediccion individual sea correcta, que Jeff identifica con mas fiabilidad las afirmaciones apoyadas que las que carecen de evidencia suficiente, y que este conjunto de evaluacion ya se ha usado para analisis de errores, por lo que no constituye un benchmark virgen para futuras versiones. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Modelo base Qwen3-4B-Instruct-2507 en bfloat16: aproximadamente 8 GB de VRAM solo para los pesos, mas el espacio de activaciones y cache KV.
- Cuantizacion del modelo base a 8 bits: en torno a 5 GB de VRAM; a 4 bits: en torno a 3 GB. El adaptador LoRA anade una sobrecarga pequena y no documentada en detalle en la informacion disponible.
- GPU consumer: cabe en tarjetas de 12 GB o mas, como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090; en configuraciones cuantizadas puede caber en GPUs de 8 GB, aunque el autor no lo confirma.
- GPU de datacenter compatibles por capacidad: A100, H100 y similares, con margen amplio para lotes grandes.
- Apple Silicon: soporte MPS confirmado explicitamente en la model card, ademas de CUDA.
- Opciones de despliegue documentadas: `transformers` + `peft` para acceso de bajo nivel, y el servidor HTTP local del repositorio (`uv run python -m scripts.jev_clf_server`) con endpoints `POST /v1/systemone`, `GET /health` y `GET /v1/models`.
- vLLM, TGI, llama.cpp y Ollama: no documentados para este adaptador en la informacion disponible.
- Latencia y throughput: no disponibles. El coste de inferencia depende del regimen de puntuacion (una pasada por candidato con primeros tokens distintos, o puntuacion por secuencia completa) y del numero de preguntas por llamada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Accuracy (evaluacion del autor) | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Jeff 1 (GestaltLabs) | Adaptador LoRA sobre Qwen3-4B-Instruct-2507 para decisiones tipadas | 4B base + adaptador | no disponible | 0,8183 | 0,0807 | Apache 2.0 | Pesos abiertos en HuggingFace |
| Jev 1.13.0 (TypeSafe AI) | Servicio de decisiones tipadas via API | no disponible | no disponible | 0,8283 | 0,0932 | no disponible | API alojada |
| Qwen3-4B-Instruct-2507 | LLM instructivo generalista | 4B | no disponible en la informacion proporcionada | no disponible para esta tarea | no disponible | no disponible en la informacion proporcionada | Pesos abiertos en HuggingFace |

No se dispone de datos de otros adaptadores abiertos equivalentes orientados a decisiones tipadas y calibradas, por lo que la comparativa se limita a los dos sistemas evaluados por el autor y al modelo base.

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta cobertura multilingue.
- Menor exactitud (0,8183) y peor Brier (0,2839) que Jev 1.13.0 (0,8283 y 0,2750) en la evaluacion publicada; la ventaja de Jeff esta en el ECE.
- Rendimiento desigual por clase: identifica con mas fiabilidad las afirmaciones apoyadas que las que tienen evidencia insuficiente.
- El conjunto de evaluacion ya se ha usado para analisis de errores; no es un benchmark intacto para versiones futuras.
- Un ECE bajo no implica que una prediccion concreta sea correcta; la calibracion es agregada.
- El modelo no genera texto: produce etiquetas y probabilidades. No sirve para tareas de generacion, resumen o dialogo abierto.
- Proyecto independiente no afiliado a TypeSafe AI: la compatibilidad de API con el estilo Jev no implica juicios ni rendimiento identicos.
- La licencia Apache 2.0 cubre el codigo y el adaptador; conviene verificar por separado los terminos del modelo base Qwen3-4B-Instruct-2507 antes de uso comercial.
- No se documentan datos de entrenamiento, composicion del dataset ni uso de RLHF/DPO, lo que limita la evaluacion de sesgos y de procedencia de datos.
- El repositorio registra 0 descargas y 0 valoraciones en el momento de redactar esta ficha, sin validacion independiente de la comunidad.
- La model card no especifica cuantizaciones soportadas ni latencias, por lo que el dimensionamiento de produccion requiere medicion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GestaltLabs/Jeff-1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Codigo fuente: https://github.com/Gestalt-Lab/jeff
- Guia para entrenar tu propio Jeff: https://github.com/Gestalt-Lab/jeff/blob/main/docs/TRAIN_YOUR_OWN.md
- Guia para agentes de codigo: https://github.com/Gestalt-Lab/jeff/blob/main/AGENTS.md
- Detalles de evaluacion: https://github.com/Gestalt-Lab/jeff/blob/main/MODEL_CARD_JEFF1.md
- Metricas recalculadas (auditoria): https://github.com/Gestalt-Lab/jeff/blob/main/results/researchmax_gap_audit.md
- Figura de resultados principales: https://github.com/Gestalt-Lab/jeff/raw/main/docs/figures/headline.png
- Figura de recall por clase: https://github.com/Gestalt-Lab/jeff/raw/main/docs/figures/recall.png
- Figura de fiabilidad: https://github.com/Gestalt-Lab/jeff/raw/main/docs/figures/reliability.png
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente paginas no relacionadas); no se han podido anadir papers, blogs o demos adicionales.

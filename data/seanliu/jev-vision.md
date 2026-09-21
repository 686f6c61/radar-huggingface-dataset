# SeanLiu/Jev-Vision

## Resumen

Jev-Vision (V9, 8B) es un modelo de decisión visual no generativo publicado por SeanLiu. Se compone de un adaptador LoRA (r=64 sobre las proyecciones de atención y MLP del modelo de lenguaje, 175M parámetros entrenables) y un conjunto de cabezas de decisión tipadas almacenadas en `heads.pt`, todo ello montado sobre el backbone congelado Qwen/Qwen3-VL-8B-Instruct. En lugar de generar texto, el modelo realiza una única pasada de forward y devuelve una probabilidad por cada pregunta tipada formulada sobre una imagen o un par de imágenes.

El modelo cubre tres tipos de respuesta: `noul` (probabilidad sí/no), `choice` (distribución sobre las opciones proporcionadas, con lectura por puntero sobre los tokens de las opciones) y `score` (niveles ordenados). Las preguntas para las que fue entrenado incluyen `ground` (sobre qué elemento marcado actuar), `skip` (si un elemento ya está en el estado requerido), `effect` (si la última acción cambió la página según lo previsto, con dos imágenes), `done` (si se ha alcanzado el objetivo), las preguntas `operation` y `click_target` de jev-ultrafast, y preguntas de imagen general (presencia de objetos, VQA de opción múltiple, clasificación de platos y veracidad de afirmaciones con dos imágenes).

Su relevancia actual reside en el uso como verificador y modelo de recompensa de proceso (process reward) dentro de agentes de computer use: sustituye a un juez textual por un modelo multimodal que responde con una probabilidad calibrada por pregunta, con una latencia de 74 ms por ítem general y de 150 a 190 ms por captura de pantalla en una H100 a batch 1. La API HTTP sigue la forma `/v1/systemone` de Jev, de modo que código escrito para Jev puede apuntar directamente a este servidor. La licencia es Apache 2.0 y el repositorio ocupa 0,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=64) sobre las proyecciones de atención y MLP del modelo de lenguaje de Qwen3-VL-8B-Instruct, más cabezas de decisión tipadas; modelo no generativo de una sola pasada de forward |
| Parametros totales | 8B en el backbone congelado (Qwen3-VL-8B-Instruct) más 175M parámetros entrenables en el adaptador LoRA |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio publica el adaptador en safetensors y las cabezas en `heads.pt`) |
| Idiomas soportados | No disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT en `backbone/`) y `heads.pt` (cabezas de decisión en PyTorch) |

## Arquitectura y entrenamiento

El modelo reutiliza el transformer visión-lenguaje Qwen3-VL-8B-Instruct como backbone congelado. Sobre él se entrena un adaptador LoRA de rango 64 aplicado a las proyecciones de atención y MLP del modelo de lenguaje, con 175M parámetros entrenables, y se añaden cabezas de decisión tipadas (`heads.pt`) que leen la representación para producir: una probabilidad sí/no (`noul`), una distribución sobre opciones mediante lectura por puntero sobre los tokens de las opciones (`choice`) y niveles ordenados (`score`). El modelo no decodifica texto libre: cada pregunta se responde en una única pasada de forward.

El entrenamiento combina dos fuentes: pantallas con etiquetas derivadas del entorno (URL, DOM, valores de campos) y preguntas tipadas construidas a partir de datasets públicos de visión. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO, por lo que estos datos se consideran no disponibles. La innovación destacable es doble: por un lado, reformular la verificación de agentes como un conjunto de preguntas tipadas con una probabilidad por pregunta, lo que permite usarlo como verificador y modelo de recompensa de proceso; por otro, la variante `v1 pixel`, que funciona con la captura de pantalla en bruto y un único marcador, sin necesidad de la tabla de elementos. El código, el benchmark, las evaluaciones y el arnés de bucle cerrado están publicados en el repositorio de GitHub del autor.

## Capacidades

- Decisión binaria calibrada mediante la pregunta `noul`, que devuelve una probabilidad de sí/no; el error de calibración (ECE) medido en sí/no sobre imágenes generales se sitúa entre 0,034 y 0,047.
- Elección entre opciones mediante `choice`, con una distribución de probabilidad sobre las opciones suministradas y lectura por puntero sobre los tokens de las opciones.
- Puntuación en niveles ordenados mediante `score`.
- Grounding de interfaz: pregunta `ground` para decidir sobre qué elemento marcado actuar, con 0,939 (v0) y 0,949 (v1) en 30 sitios web no vistos en entrenamiento.
- Verificación de estado: pregunta `skip` para determinar si un elemento ya se encuentra en el estado requerido, y pregunta `done` para determinar si el objetivo se ha alcanzado.
- Verificación de efecto con dos imágenes: pregunta `effect`, que comprueba si la última acción cambió la página según lo previsto (hasta 0,977 en la variante v1).
- Enrutado de acciones rápidas: preguntas `operation` (0,911) y `click_target` (0,969) de jev-ultrafast sobre 615 filas reservadas.
- Capacidades sobre imagen general: presencia de objetos (POPE 0,907), VQA de opción múltiple (A-OKVQA 0,893), coherencia entre dos imágenes (NLVR2 0,930), clasificación de platos (Food-101 0,930) y evaluación general (MME 0,927).
- Integración como decisor dentro de un bucle de agente: completa una búsqueda de ida en Google Flights en 10 acciones y 33 s, superando las 7 comprobaciones de página independientes.
- Soporte de tool calling / function calling: no documentado; la interfaz de integración es HTTP mediante `POST /v1/systemone` con el campo `questions`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de agente multi-paso: sí, indirectamente, como componente decisor dentro de un arnés de bucle cerrado, no como planificador autónomo.
- Capacidades especiales: no dispone de modo de razonamiento (thinking mode) ni de generación de texto, audio o vídeo. Es un modelo de decisión, no un asistente conversacional.

## Casos de uso

- Verificador de proceso en agentes de computer use: el modelo recibe el estado de la página y las preguntas tipadas de un paso (`skip`, `effect`, `done`) y devuelve probabilidades por pregunta, lo que permite recompensar o descartar trayectorias intermedias sin depender de un juez textual. Con 150 a 190 ms por captura de pantalla en una H100 a batch 1, encaja en bucles de agente en línea.
- Grounding de elementos en interfaces web: con la pregunta `ground` y una captura con los elementos marcados, el modelo devuelve sobre qué elemento actuar, con una precisión de 0,949 en episodios frescos sobre 30 sitios no vistos.
- Detección de finalización de tarea en automatización de flujos: la pregunta `done` permite cerrar un flujo cuando el objetivo se ha alcanzado (0,887 en la variante v1 con episodios frescos), evitando bucles infinitos de acciones redundantes.
- Verificación posterior a una acción con dos capturas: la pregunta `effect` compara la pantalla previa y la posterior para confirmar que la acción tuvo el efecto buscado (hasta 0,977), lo que sirve como puerta de validación antes de continuar un pipeline.
- Automatización de búsquedas y reservas: usado como decisor dentro de jev-ultrafast, completa una búsqueda de ida en Google Flights en 10 acciones y 33 s superando las 7 comprobaciones independientes de página, un escenario representativo de flujos web transaccionales.
- Enrutado de clics de alta frecuencia: las preguntas `operation` (0,911) y `click_target` (0,969) permiten decidir la siguiente operación y el objetivo del clic en agentes que necesitan latencias bajas.
- Control de calidad y filtrado en pipelines de datos de visión: la pregunta `noul` puede actuar como juez de presencia de objetos (POPE 0,907) para descartar descripciones con objetos alucinados en datasets de captioning.
- Evaluación de modelos visión-lenguaje: con ECE de 0,034 a 0,047 en sí/no dentro de dominio, sirve como juez binario calibrado frente a otros VLM, con un coste de 74 ms por ítem general.
- Clasificación y anotación de imágenes de dominio general: `choice` y `score` permiten clasificar platos (Food-101 0,930) o validar afirmaciones sobre pares de imágenes (NLVR2 0,930) dentro de procesos de etiquetado asistido.

## Benchmarks y rendimiento

Pantallas, 30 sitios web nunca vistos en entrenamiento (etiquetas derivadas de URL, DOM y valores de campos):

| Variante | skip | effect | done | ground |
|---|---|---|---|---|
| v0 candidate (captura marcada + tabla de elementos) | 0,955 | 0,946 | 0,944 | 0,939 |
| v1 candidate, episodios frescos | 0,922 | 0,977 | 0,887 | 0,949 |
| v1 pixel (captura en bruto + un marcador, sin tabla) | 0,931 | 0,931 | 0,891 | no disponible |

Comparación con el modelo textual Jev 1.13 en los mismos ítems de v1 (solo texto): 0,870 / 0,733 / 0,887, según el orden de columnas indicado en la model card.

Preguntas de jev-ultrafast sobre 615 filas reservadas:

| Pregunta | Precisión |
|---|---|
| operation | 0,911 |
| click_target | 0,969 |

Completado del flujo de agente: búsqueda de ida en Google Flights en 10 acciones, 33 s, con las 7 comprobaciones independientes de página superadas.

Imágenes generales, 1.500 ítems de particiones reservadas:

| Benchmark | Resultado |
|---|---|
| POPE | 0,907 |
| MME | 0,927 |
| NLVR2 | 0,930 |
| A-OKVQA | 0,893 |
| Food-101 | 0,930 |
| Media | 0,917 (backbone congelado leído desde logits de siguiente token: 0,911) |
| ECE en sí/no | 0,034 a 0,047 |

Latencia: 74 ms por ítem general y 150 a 190 ms por captura de pantalla incluyendo todas las preguntas de un paso, en una H100 a batch 1.

## Requisitos de hardware

- VRAM estimada: el backbone de 8B en bf16/fp16 requiere aproximadamente 16 GB; el adaptador (175M parámetros) añade unos 0,35 GB en fp16 y las cabezas `heads.pt` son de tamaño reducido. El repositorio completo ocupa 0,7 GB en disco. No se publican requisitos oficiales de VRAM, por lo que estas cifras son estimaciones derivadas del tamaño del backbone.
- GPU recomendadas: el rendimiento medido se obtuvo en una H100 a batch 1. Por tamaño, una A100 de 80 GB o 40 GB, una H100 y una L40S son suficientes con holgura en bf16.
- GPU de consumo: sí cabe en tarjetas de 24 GB como la RTX 4090 o la RTX 3090 en bf16/fp16. En tarjetas de 16 GB sería necesario recurrir a cuantización de 8 bits (aproximadamente 9 a 10 GB) o de 4 bits (aproximadamente 5 a 6 GB); el repositorio no publica pesos cuantizados, por lo que habría que generarlos.
- Opciones de despliegue: la ruta soportada es el servidor incluido en el repositorio (`serve.py`) sobre `transformers==5.17.*`, `peft`, `accelerate` y `pillow`, escuchando en un puerto configurable (por ejemplo 8811) y exponiendo `POST /v1/systemone`. El procedimiento indicado es clonar `https://github.com/sseanliu/Jev-Vision`, instalar las dependencias, descargar los pesos con `hf download SeanLiu/Jev-Vision --local-dir runs/v9-8b-ops/final` y ejecutar `python serve.py runs/v9-8b-ops/final --port 8811 --temp 0.5`.
- Compatibilidad con otros servidores: no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI. Estas herramientas no contemplan cabezas de decisión tipadas personalizadas sobre un adaptador PEFT, por lo que la integración requeriría trabajo adicional no descrito en la información disponible.
- Latencia y throughput: 74 ms por ítem general y 150 a 190 ms por captura de pantalla con todas las preguntas de un paso, en una H100 a batch 1. No se publican cifras de throughput agregado ni de despliegue multi-replica.

## Comparativa con modelos similares

| Modelo | Parámetros | Naturaleza | Contexto | Rendimiento relevante | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Jev-Vision (V9, 8B) | 8B de backbone congelado + 175M entrenables | Decisor no generativo con cabezas tipadas | No disponible | Media 0,917 en imágenes generales; skip 0,922 / effect 0,977 / done 0,887 / ground 0,949 en pantallas v1 | apache-2.0 | Adaptador y cabezas en HuggingFace, servidor en GitHub |
| Qwen3-VL-8B-Instruct (backbone congelado) | 8B | VLM generativo | No disponible | Media 0,911 en las mismas particiones generales leídas desde logits de siguiente token; AUROC en sí/no de 0,96 frente a 0,84-0,91 de Jev-Vision | No disponible en la información proporcionada | HuggingFace |
| Jev 1.13 (solo texto) | No disponible | Decisor textual | No disponible | 0,870 / 0,733 / 0,887 en los mismos ítems v1 | No disponible | No disponible |
| Modelos específicos de grounding de UI (OS-Atlas, UGround, ShowUI y similares) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos con otros verificadores multimodales o modelos de recompensa de proceso en la información proporcionada.

## Limitaciones y advertencias

- Sobreconfianza fuera de dominio: en el nivel difícil público de JevBench (documentos largos, solo texto) el modelo acierta el 52% con una confianza media declarada del 91%. La corrección prevista por el autor es una temperatura ajustada con datos fuera de dominio, que se probará en la versión V10.
- Peor discriminación en sí/no que el backbone: en imágenes generales el AUROC de Jev-Vision se sitúa entre 0,84 y 0,91, por debajo del 0,96 del backbone congelado. El autor atribuye la causa a la forma en que las cabezas leen la representación y propone para V10 una lectura que conserve la geometría sí/no del backbone.
- Degradación del grounding respecto a un checkpoint anterior: 0,823 en páginas tipo Mind2Web y 0,822 en grounding de escritorio macOS, frente a 0,850 y 0,914 de un checkpoint especializado solo en grounding.
- Dominio de imagen restringido: entrenado y evaluado con capturas de escritorio web de 1280x1000. No cubre interfaces móviles, flujos con sesión iniciada ni formularios con mucha interacción.
- Modelo no generativo: no produce texto libre, por lo que no puede usarse como asistente conversacional ni como planificador. Su salida son probabilidades ligadas a preguntas tipadas.
- Idiomas: la model card no declara idiomas soportados, por lo que no hay garantía de comportamiento multilingüe.
- Dependencia del ecosistema: requiere la versión exacta de `transformers` indicada, `peft` y el modelo base Qwen/Qwen3-VL-8B-Instruct. No hay soporte documentado en vLLM, llama.cpp, Ollama o TGI.
- Restricciones de licencia: el adaptador y las cabezas se publican bajo Apache 2.0, que permite uso comercial. La licencia del modelo base no se detalla en la información proporcionada y debe verificarse por separado antes de un despliegue comercial.
- Madurez y validación externa: el repositorio registra 0 descargas y 0 valoraciones positivas en el momento del registro, y las métricas proceden de las evaluaciones publicadas por el propio autor (`eval_*.json`), sin replicación independiente conocida.
- Riesgo de alucinación en el sentido clásico: no aplica a la generación de texto porque el modelo no genera, pero sí persiste el riesgo de falsos positivos sobreconfiados fuera de dominio, cuantificado en el punto de JevBench.
- Uso en producción: al tratarse de un modelo de decisión con cabezas personalizadas, cualquier integración exige el servidor propio del repositorio y no se beneficia de optimizaciones estándar de serving.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeanLiu/Jev-Vision
- Repositorio de código, benchmark, evaluaciones y arnés de bucle cerrado: https://github.com/sseanliu/Jev-Vision
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- No se han encontrado otros enlaces relevantes en la búsqueda web realizada; los resultados devueltos corresponden a un portal de administración tributaria y no guardan relación con el modelo.

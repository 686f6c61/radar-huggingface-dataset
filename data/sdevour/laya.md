# sdevour/laya

## Resumen

Laya es un modelo de clasificación de texto no autorregresivo desarrollado por el autor `sdevour` (con autoría académica de N. M. y A. M.) y presentado en el preprint "From Laya to Vega: Open Non-Autoregressive Decision Models with Calibrated Probabilities". El modelo resuelve un problema concreto: tomar decisiones tipadas (clasificación, enrutamiento, scoring, guardrails o moderación) sobre un estado de entrada (texto, correo, ticket o JSON) devolviendo respuestas tipadas con probabilidades calibradas en un único pase forward de aproximadamente 33 ms, sin generar texto libre.

La arquitectura es un encoder transformer de 421 millones de parámetros que actúa como motor de decisión sobre un lector congelado (cualquier LLM de 0,8B a 27B). El entrenamiento se realiza con aprendizaje por refuerzo contra reglas de scoring estrictamente propias (RLCD), de modo que la única forma de maximizar la recompensa es reportar probabilidades honestas. La versión 0.5 incorpora lectura de imágenes, audio y vídeo, una ventana de contexto de 73.728 tokens, mecanismos de abstención calibrada y aprendizaje continuo a partir de respuestas confirmadas por el equipo.

Es relevante ahora porque ofrece una alternativa determinista y de coste constante a la generación de texto para tareas de decisión, con licencia Apache 2.0 y uso comercial permitido. La calibración de probabilidades (ECE entre 0,010 y 0,031 según el benchmark) y la posibilidad de aprender en CPU en segundos sin fine-tuning lo posicionan como una pieza práctica para pipelines de guardrails y enrutamiento en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder no autorregresivo (motor de decisión sobre lector LLM congelado) |
| Parámetros totales | 421.293.830 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 73.728 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | más de 100 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tamaño del repo | 2,4 GB |
| Modalidades de entrada | texto, imagen, audio y vídeo |

## Arquitectura y entrenamiento

Laya es un modelo no autorregresivo que no genera texto. La entrada se proyecta como una partícula en un espacio de decisión de baja dimensión donde cada respuesta candidata es un valle; la partícula rueda y se asienta en uno de ellos, y la posición y profundidad del asentamiento determinan la respuesta y su probabilidad. Esta formulación es determinista, de coste constante y elimina la necesidad de parsear salidas generadas. El motor de decisión se apoya en un lector LLM congelado (desde 0,8B hasta 27B parámetros), de modo que el mismo motor byte-idéntico funciona sobre distintos lectores.

El entrenamiento utiliza aprendizaje por refuerzo contra reglas de scoring estrictamente propias (RLCD, Reinforcement Learning with Calibrated Decisions), lo que incentiva reportar probabilidades calibradas como única estrategia óptima. El modelo incorpora un conjunto conformal (`prediction_set`) a alpha 0,10, una abstención calibrada para mantener la tasa de error por debajo del riesgo configurado (10% por defecto) y una bandera `unbound` para detectar entradas fuera de distribución. La versión 0.5 añade aprendizaje continuo mediante `laya.Learner`, que permite incorporar respuestas confirmadas por el equipo en segundos sobre CPU, sin fine-tuning ni reescritura de los 421M de pesos.

## Capacidades

- Clasificación y enrutamiento de texto con respuestas tipadas y probabilidades calibradas.
- Procesamiento de imágenes, audio y vídeo mediante `agent.predict(...)` con `image=`, `audio=` o `video=`.
- Ventana de contexto de 73.728 tokens para contratos, hilos de conversación y logs completos.
- Abstención calibrada (`abstain`) con umbral ajustado al riesgo configurado.
- Conjunto conformal (`prediction_set`) que indica si la respuesta es única o ambigua.
- Bandera `unbound` para detectar entradas fuera de distribución.
- Enrutamiento (`route`) con valores `auto` o `review`, con banda de precisión al 95% cuando hay etiquetas.
- Aprendizaje continuo desde respuestas confirmadas (`laya.Learner`, `agent.fit`, `agent.calibrate`).
- Soporte multilingüe en más de 100 idiomas.
- Compatible con endpoints de Hugging Face (`endpoints_compatible`).
- No soporta generación de texto, tool calling ni razonamiento multi-paso por generación; su función es exclusivamente la decisión tipada.

## Casos de uso

- Moderación de contenido en plataformas: el modelo clasifica mensajes y devuelve una probabilidad calibrada por categoría, lo que permite fijar umbrales de riesgo y enrutar a revisión humana solo los casos ambiguos o con `route: review`.
- Guardrails de prompt injection: como clasificador de decisión sobre tráfico real, puede integrarse como filtro previo a un LLM generativo, con abstención calibrada para no bloquear tráfico legítimo (en ToxicChat reporta 73,0% de detección al 0,7% de rechazo con cabeza ajustada).
- Enrutamiento de tickets de soporte: dado un ticket de hasta 73.728 tokens, asigna categoría, prioridad y equipo destino con probabilidad calibrada, usando `prediction_set` para detectar tickets genuinamente ambiguos.
- Clasificación de correo y documentos contractuales: lectura completa de contratos o hilos de correo en un solo pase para extraer decisiones tipadas (tipo de cláusula, urgencia, departamento responsable) sin generación de texto que parsear.
- Scoring de riesgo en banca y seguros: sobre filas de datos y texto, produce puntuaciones calibradas con ECE de 0,028 en banking77 tras aprendizaje continuo, adecuado para bandas de decisión con precisión controlada al 95%.
- Aprendizaje continuo en producción: el equipo confirma respuestas y `laya.Learner` actualiza el motor en 34 s sobre 8 hilos de CPU con 6,4 GB de RAM para 300 respuestas, sin GPU ni fine-tuning, lo que permite ciclos de mejora rápidos.
- Procesamiento multimodal de soporte: clasificación de capturas de pantalla, notas de voz o vídeos de incidencias usando las entradas `image=`, `audio=` y `video=` con las mismas respuestas tipadas que para texto.

## Benchmarks y rendimiento

Aprendizaje continuo sobre 14 plantillas de decisión (31 preguntas), partiendo de unos 600 ejemplos generados y evaluando sobre 60 filas reservadas por plantilla:

| Modelo | Día uno | Tras 40 respuestas confirmadas | Tras 120 |
|---|---|---|---|
| laya, `laya.Learner` | 84,7% | 91,6% | 96,0% |
| Jev 1.14, respuestas escritas en sus criterios | 89,5% | 91,5% | 92,6% |

Aprendizaje desde flujo continuo (noviembre de 2026, lector de 4B, filas reservadas):

| Benchmark | laya | Jev 1.14 |
|---|---|---|
| banking77, 924 reservadas, tras 4.928 filas | 87,5%, ECE 0,028, 92,5% enrutadas a auto con 91,5% de precisión | 79,4% de serie (ECE 0,078), 85,7% con ejemplos |
| typed-decisions, 2.000 decisiones, tras 1.200 filas | 73,7%, ECE 0,031 | 74,7%, ECE 0,047 (empate) |

Rendimiento entre lectores (motor de decisión byte-idéntico, 50.676 registros reservados):

| Lector | Precisión | ECE |
|---|---|---|
| 0,8B | 76,5% | 0,010 a 0,021 |
| 4B | 79,1% | 0,010 a 0,021 |
| 27B | 81,1% | 0,010 a 0,021 |

Coste del aprendizaje: 300 respuestas en 34 s sobre 8 hilos de CPU sin GPU (0,72 s por respuesta, 6,4 GB de RAM); en GPU, 40 ms y 2 GB. El fine-tuning clásico del encoder sobre las mismas 300 filas tarda 89 s en GPU con 9 GB y reescribe los 421M de pesos.

Limitaciones reportadas por el autor: en zero-shot sobre suites públicas genéricas, un modelo alojado grande lidera; como filtro de prompt injection en tráfico real (ToxicChat, 1,8% de ataques), Jev sin entrenar detecta el 79,1% al 0,3% de rechazo frente al 73,0% al 0,7% de una cabeza ajustada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma desglosada por cuantización; el autor reporta 2 GB de VRAM en GPU para el proceso de aprendizaje continuo.
- RAM en CPU: 6,4 GB para el aprendizaje continuo sobre 300 respuestas con 8 hilos.
- GPU recomendadas: no disponible una lista específica; el autor menciona ejecución en GPU con 9 GB para fine-tuning clásico del encoder y 2 GB para el aprendizaje de laya.
- Cabe en GPU de consumo: sí, según los requisitos de memoria reportados (2 GB en GPU para aprendizaje); no se detalla la VRAM de inferencia pura.
- Opciones de despliegue: `transformers` (librería declarada), endpoints de Hugging Face (`endpoints_compatible`) y el paquete `laya` (`pip install -U laya`); no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: aproximadamente 33 ms por pase forward en el motor de decisión; 40 ms por respuesta en GPU para aprendizaje continuo y 0,72 s por respuesta en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya | 421.293.830 | 73.728 tokens | Motor de decisión no autorregresivo con probabilidades calibradas y aprendizaje continuo | Apache 2.0 | Hugging Face y paquete `laya` |
| Jev 1.14 | no disponible | no disponible | Modelo alojado de decisión, solo prompting, sin aprendizaje | no disponible | API alojada (364 ms por petición desde India) |
| Encoder clásico con fine-tuning | ~421M (mismo encoder) | no disponible | Fine-tuning supervisado clásico | no disponible | Entrenamiento local (89 s en GPU con 9 GB) |

Jev 1.14 lidera en el día uno (89,5% frente a 84,7%) y en 23 de 31 preguntas, pero no puede enseñarse y es una API alojada. Laya iguala a Jev a las 40 respuestas confirmadas y lo supera a las 120 (96,0% frente a 92,6%, con 12 victorias, 7 derrotas y 12 empates). El fine-tuning clásico del encoder requiere GPU, 9 GB de memoria y reescribe todos los pesos, frente a los 34 s en CPU de laya.

## Limitaciones y advertencias

- En zero-shot sobre suites públicas genéricas, un modelo alojado grande supera a laya; su ventaja aparece con aprendizaje continuo y datos propios.
- Como filtro de prompt injection en tráfico real (ToxicChat), una cabeza ajustada detecta el 73,0% al 0,7% de rechazo, por debajo del 79,1% al 0,3% de Jev sin entrenar.
- La bandera `unbound` no debe usarse como criterio de enrutamiento por sí sola: se activó en el 71% de filas normales de banking77, por lo que enviaría la mayoría de respuestas correctas a revisión.
- El enrutamiento debe basarse en `route`, nunca en un número de confianza aislado.
- No genera texto, por lo que no sirve para tareas generativas, tool calling ni razonamiento multi-paso por generación.
- Los benchmarks presentados corresponden a los checkpoints del encoder clásico y al motor nuevo por separado; no hay resultados publicados de MMLU, HumanEval o GSM8K.
- No se detallan sesgos conocidos ni composición del dataset de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero no se especifican restricciones adicionales sobre los datos de entrenamiento.
- No hay información sobre cuantizaciones disponibles ni sobre integración con motores de inferencia alternativos.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la ficha, por lo que no existe validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/sdevour/laya
- Preprint: https://doi.org/10.20944/preprints202611.0781.v1
- Repositorio vegaml: https://github.com/NandhaKishorM/vegaml
- Imagen explicativa del proceso de decisión: https://raw.githubusercontent.com/NandhaKishorM/vegaml/main/assets/vega-valleys.svg
- Studio de Embedding Space: https://studio.embedding.in

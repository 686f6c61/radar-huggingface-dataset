# Praveenrajus/jevify-qwen3.5-4b-t2

## Resumen

jevify-qwen3.5-4b-t2 es un modelo de decisión de tipo System One desarrollado por el usuario Praveenrajus sobre el backbone Qwen/Qwen3.5-4B. No genera texto libre: lee un `state` en forma de texto y responde preguntas tipadas devolviendo distribuciones de probabilidad calibradas que el código cliente puede usar para ramificar. Implementa tres primitivas: `choice` (elegir entre K opciones), `score` (situar un valor en K niveles ordinales) y `noul` (una única probabilidad P(yes) de una afirmación).

El repositorio no contiene el backbone completo, sino solo lo que Jevify añade: 2.891.275 parámetros de cabezas de decisión (11,6 MB) y un adaptador LoRA de rango 16 con 21.233.664 parámetros (85 MB) que se fusiona en el backbone en tiempo de carga, más la receta de calibración. El backbone se descarga desde su propio repositorio, por lo que no se duplica ni se relicencia.

Su interés actual es doble: la calibración es el objetivo de entrenamiento (reglas de puntuación estrictamente propias) y no un parche posterior, y se publica una evaluación sobre 22.773 registros de jev-bench frente a la API TypeSafe Jev 1.13.0, con seis fuentes excluidas por completo del entrenamiento para medir generalización a tipos de pregunta no vistos. La licencia es Apache 2.0 y el modelo se distribuye como safetensors con 0,1 GB de repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone transformer decoder (Qwen/Qwen3.5-4B) más cabezas de decisión y adaptador LoRA de rango 16 fusionado en las proyecciones de atención y MLP |
| Parámetros totales | No disponible para el backbone. El repositorio añade 24.124.939 parámetros: 2.891.275 de cabezas de decisión y 21.233.664 del adaptador LoRA |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible en los metadatos; la model card indica que es "English-first" |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Las cabezas de decisión leen el estado oculto del backbone en la línea correspondiente a cada opción, de modo que puntúan lo que una opción significa y no la probabilidad de su token identificador. Se aplican como residuo sobre el log-score propio del modelo: `score_i = w·lm_i + f(...)`, con `f` inicializada a cero, por lo que el entrenamiento arranca exactamente en la línea base sin entrenar y solo puede sumar sobre ella. Se entrenaron con 5.885 registros procedentes de 16 fuentes y con un máximo de 16 opciones por pregunta, lo que según el autor mantiene la cabeza utilizable con cualquier K.

Se trata de un modelo Tier 2: un LoRA de rango 16 sobre las proyecciones de atención y MLP del backbone se entrenó de forma conjunta con las cabezas (tasa de aprendizaje del LoRA 0,0001, 3 épocas, mejor época la 1 según pérdida de validación), de manera que el backbone puede aprender a situar el juicio en la posición de la opción en lugar de limitarse a ser leído allí. El adaptador se fusiona en los pesos al cargar el modelo, así que la inferencia cuesta exactamente lo mismo que el backbone sin modificar. El entrenamiento optimiza directamente reglas de puntuación estrictamente propias (log score para Choice y Noul, ranked probability score para el Score ordinal), sin aprendizaje por refuerzo. Seis fuentes quedaron totalmente fuera del entrenamiento para medir la generalización a tipos de pregunta no vistos.

## Capacidades

- Clasificación con opciones múltiples mediante la primitiva `choice`: devuelve una distribución de probabilidad sobre K opciones junto con una medida de `confidence`.
- Puntuación ordinal mediante `score`: devuelve probabilidades sobre K niveles ordenados, el `score` esperado y la `confidence`.
- Verificación booleana mediante `noul`: devuelve una única P(yes) para una afirmación, sin generar texto.
- Salida estructurada tipada (diccionarios de respuestas), pensada para que el código ramifique con umbrales calibrados en lugar de analizar lenguaje natural.
- No genera texto libre en ningún caso; es un modelo de decisión, no de generación.
- Compatible como sustituto directo de la API de TypeSafe Jev: el `typesafe-sdk` oficial funciona sin cambios contra `jevify-serve`.
- Capacidades multilingües: no documentadas; el modelo se declara "English-first".
- Tool calling, function calling, uso de agentes multi-paso, visión, audio y modo de razonamiento extendido: no documentados.

## Casos de uso

- Triaje de tickets de soporte: con la primitiva `choice` se puede enrutar cada ticket al equipo correcto (facturación, envíos, otros) y usar la `confidence` para desviar a revisión humana los casos por debajo de un umbral.
- Priorización por urgencia o enfado: la primitiva `score` con niveles ordinales como `["calm", "annoyed", "furious"]` permite ordenar una cola de atención al cliente por severidad percibida y asignar SLA de forma automática.
- Verificación de afirmaciones en pipelines RAG: `noul` devuelve P(yes) sobre si un pasaje recuperado responde a una pregunta, lo que sirve como filtro de abstención antes de invocar a un modelo generativo.
- Sustitución de una dependencia de API propietaria: al exponer el mismo contrato que TypeSafe Jev y funcionar con `typesafe-sdk` sin modificaciones, permite migrar código existente a inferencia local cambiando solo `TYPESAFE_BASE_URL`.
- Enrutamiento de intenciones en asistentes conversacionales: `choice` sobre un conjunto fijo de intenciones evita depender de un LLM generativo para una tarea de decisión y reduce coste y latencia.
- Moderación y políticas con umbrales: al estar calibrado en ECE, las probabilidades son interpretables directamente como umbrales operativos (por ejemplo, bloquear por encima de 0,9), algo que un clasificador sin calibrar no permite.
- Asistencia a anotación humana: las distribuciones sobre opciones y niveles sirven como preetiquetado con incertidumbre explícita, útil para muestrear solo los registros ambiguos.
- Decisión en agentes con ramificación: sustituye pasos de "pensar y elegir" por una llamada de decisión tipada y calibrada, con coste de inferencia equivalente al del backbone sin adaptador.

## Benchmarks y rendimiento

Resultados sobre los 22.773 registros de test de jev-bench, comparados con TypeSafe Jev 1.13.0 sobre los registros idénticos:

| Métrica | jevify-qwen3.5-4b-t2 (Tier 2) | Jev 1.13.0 (API, zero-shot) | Qwen3.5-4B Tier 0 (receta sin held-out) |
|---|---|---|---|
| Precisión / ECE en fuentes held-out | 0,769 / 0,107 | 0,835 / 0,090 | 0,714 / 0,139 |
| Precisión / ECE en fuentes vistas en entrenamiento | 0,739 / 0,111 | 0,694 / 0,122 | 0,641 / 0,087 |
| Macro accuracy (benchmark completo) | 0,747 | 0,733 | No disponible |
| ECE (benchmark completo) | 0,110 | 0,113 | No disponible |
| Distancia media a las distribuciones de etiquetas humanas | 0,347 | 0,432 | No disponible |

No se han publicado en la información disponible otros benchmarks (MMLU, HumanEval, GSM8K u similares); el modelo no es generativo y se evalúa exclusivamente sobre jev-bench.

## Requisitos de hardware

- El repositorio descargable ocupa 0,1 GB (cabezas y adaptador LoRA); el consumo real depende del backbone Qwen/Qwen3.5-4B, que se descarga aparte.
- Al no documentarse la cuantización del backbone, las cifras siguientes son estimaciones para un backbone denso de aproximadamente 4.000 millones de parámetros: en FP16/BF16, unos 8-10 GB de VRAM para pesos y sobrecarga; en INT8, unos 4-6 GB; en 4 bits, unos 2,5-3,5 GB.
- Cabe en GPU de consumo: RTX 4090 (24 GB) y RTX 3090 (24 GB) sin problema en FP16; RTX 4080 (16 GB) y RTX 4070 Ti (12 GB) en FP16 con margen ajustado; tarjetas de 8 GB solo con cuantización de 4 bits.
- GPU de centro de datos recomendadas: A100 40/80 GB, H100, L40S; sobredimensionadas para este tamaño, pero válidas para servir varias réplicas por GPU.
- Opciones de despliegue: la librería `jevify` (`pip install git+https://github.com/uspraveen/Jevify`), el servidor `jevify-serve --model Praveenrajus/jevify-qwen3.5-4b-t2 --port 8000` y el `typesafe-sdk` oficial apuntando a ese endpoint. vLLM, llama.cpp, Ollama y TGI no están documentados para este modelo, ya que las cabezas de decisión requieren el pipeline propio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros añadidos | Licencia | Precisión held-out | ECE held-out | Disponibilidad |
|---|---|---|---|---|---|---|
| jevify-qwen3.5-4b-t2 | Decisión local sobre Qwen3.5-4B (Tier 2) | 24.124.939 (cabezas + LoRA r16) | Apache 2.0 | 0,769 | 0,107 | Pesos en HuggingFace |
| Jev 1.13.0 (TypeSafe) | API propietaria, zero-shot | No disponible | No disponible | 0,835 | 0,090 | Solo API |
| Qwen3.5-4B Tier 0 | Misma receta, sin LoRA ni held-out | No disponible | Apache 2.0 (backbone) | 0,714 | 0,139 | Pesos en HuggingFace |

Frente a Jev 1.13.0, este modelo pierde 0,066 puntos de precisión en fuentes held-out pero gana 0,096 en fuentes vistas en entrenamiento, y en el conjunto completo iguala prácticamente la accuracy macro (0,747 frente a 0,733) con una ECE ligeramente mejor (0,110 frente a 0,113) y una distancia menor a las distribuciones humanas (0,347 frente a 0,432). No se han identificado en la información disponible otros modelos comparables de decisión calibrada de código abierto.

## Limitaciones y advertencias

- Ámbito lingüístico limitado: el modelo se declara "English-first" y solo procesa texto, siguiendo el benchmark sobre el que se ajustó. No hay datos de rendimiento en castellano ni en otros idiomas.
- Las preguntas ordinales (`score`) sobre escalas distintas a las vistas en entrenamiento son el caso más débil según el propio autor.
- Las cabezas se entrenaron sobre los splits de entrenamiento de jev-bench, de modo que "held-out" significa fuente excluida, no un universo de datos completamente distinto; la generalización fuera de ese dominio no está medida.
- Este resultado corresponde a una única semilla. El estudio de semillas recogido en FINDINGS §6.3a encontró variaciones de ±0,05 en precisión held-out para una cabeza residual de 2B, por lo que diferencias de ese orden entre modelos son ruido, no señal.
- Riesgo de alucinación: el modelo no genera texto, pero puede devolver distribuciones con alta `confidence` en decisiones incorrectas; la propia calibración (ECE en torno a 0,11) implica un margen de error no despreciable en los umbrales.
- Sesgos: no se documentan análisis de sesgo demográfico, de dominio ni de composición del dataset utilizado (jev-bench).
- Licencia Apache 2.0 en lo que aporta el repositorio; el backbone Qwen/Qwen3.5-4B conserva su propia licencia y se descarga aparte, por lo que conviene verificar sus condiciones para uso comercial.
- En producción, los umbrales de decisión deben fijarse con datos propios: la ECE reportada procede de jev-bench y no se traslada automáticamente a otro dominio.
- Al depender de la librería `jevify` y de un pipeline propio, no se puede servir con stacks estándar como vLLM o llama.cpp sin trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Praveenrajus/jevify-qwen3.5-4b-t2
- Dataset de evaluación jev-bench: https://huggingface.co/datasets/Praveenrajus/jev-bench
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio Jevify (código, método y limitaciones): https://github.com/uspraveen/Jevify
- Documento de hallazgos FINDINGS.md: https://github.com/uspraveen/Jevify/blob/main/docs/FINDINGS.md
- Los resultados de la búsqueda web no aportaron enlaces adicionales relevantes sobre este modelo.

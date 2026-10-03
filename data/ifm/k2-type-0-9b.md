# IFM/K2-Type-0.9B

## Resumen

K2-Type-0.9B es un modelo de decisión de 1.078.285.824 parámetros (1,08B) desarrollado por IFM sobre el backbone IFM/K2-Horizon-0.9B. No es un modelo generativo: recibe un **estado** (texto o JSON) y un conjunto de **preguntas tipadas**, y devuelve en una única pasada forward una probabilidad para cada opción de cada pregunta. Admite tres tipos de pregunta: `noul` (probabilidad de que un enunciado sea verdadero), `choice` (entre 1 y 255 opciones con nombre) y `score` (entre 2 y 255 niveles ordenados).

El modelo sigue el estilo de Jev de TypeSafe y expone el mismo formato de cable `/v1/systemone`, de modo que los clientes escritos para Jev o Kev funcionan sin cambios. Su interés práctico está en tareas de enrutado, clasificación y calibración de decisiones donde no se necesita texto generado, sino una distribución de probabilidad fiable y de baja latencia: en un H200 reporta p50 de 27 ms y p95 de 60 ms por decisión.

La relevancia actual viene de su rendimiento en JevBench público (176/231 = 0,762 de acierto, Brier 0,328, ECE 0,065) con solo 1,08B de parámetros, por encima de varios modelos de 2B a 4B. Los pesos se publican bajo licencia Apache 2.0 en safetensors, aunque el código y los datos de entrenamiento no se han liberado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (backbone IFM/K2-Horizon-0.9B) con cabeza pointer; máscara de atención block-causal |
| Parametros totales | 1.078.285.824 (1,08B), incluye la cabeza de lenguaje del modelo base, no utilizada |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (el model card señala debilidad en documentos de más de 8192 tokens) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (incluye `pointer_head.safetensors` y `decision_config.json`); requiere `transformers >= 5.17` con código remoto |

Otros datos: fecha de creación 2026-09-26, última actualización 2026-10-02, 1048 descargas, 14 likes, tamaño del repositorio 2,2 GB.

## Arquitectura y entrenamiento

El modelo parte del backbone denso K2-Horizon-0.9B y le añade una cabeza pointer (`pointer_head.safetensors`). La entrada se serializa con cinco tokens reservados del tokenizador base, con el formato `<state> ... | <q> pregunta <opt> opción </opt> ... <decide> | <q> ...`; los tokens reservados se definen en `decision_config.json`. La cabeza puntúa el estado oculto del `</opt>` de cada opción contra el estado oculto del `<decide>` de su pregunta, y una softmax con temperatura 1,478 convierte esas puntuaciones en probabilidades. Las preguntas comparten el estado pero no se ven entre sí gracias a una máscara de atención block-causal, de forma que añadir una pregunta nunca altera la respuesta de otra.

El entrenamiento consistió en un ajuste fino completo sobre aproximadamente 354.000 registros de decisión: conjuntos públicos de clasificación, NLI y QA, datos de decisión de Kev, posiciones de juego con etiquetas exactas o de búsqueda, e ítems sintéticos escritos y verificados a ciegas por un modelo grande. Los objetivos se mezclaron con etiquetas suaves de un modelo profesor de decisión de 7B; después se aplicaron 50 iteraciones de PPO sobre Snake y, por último, un reajuste de temperatura sobre datos de calibración reservados. Los datos de entrenamiento se comprobaron contra todas las suites de evaluación de Kev y contra los 231 ítems públicos de JevBench, sin solapamiento exacto ni por contención.

## Capacidades

- Decisión por una sola pasada forward: devuelve probabilidades para todas las opciones de todas las preguntas a la vez, sin generar texto en ningún caso.
- Preguntas `noul`: dada una afirmación y, opcionalmente, definiciones de `false` y `true`, devuelve P(true).
- Preguntas `choice`: entre 1 y 255 opciones con nombre y descripción opcional; devuelve la mejor opción, su confianza y todas las probabilidades.
- Preguntas `score`: entre 2 y 255 niveles ordenados; devuelve el nivel esperado y la probabilidad por nivel.
- Calibración explícita: temperatura ajustada sobre datos reservados (ECE 0,065 en el conjunto público de JevBench).
- Independencia entre preguntas: la máscara block-causal garantiza que cada pregunta se evalúa sin interferencia de las demás.
- Compatibilidad de interfaz con Jev y Kev mediante el formato `/v1/systemone`, más un endpoint `GET /health` que informa del nombre del modelo y la temperatura.
- Juego sobre tablero de texto: con los mismos pesos juega a Snake desde una representación textual, con una pregunta `choice` y cuatro preguntas de sí/no por movimiento.
- No soporta tool calling, agentes, multi-step reasoning, visión ni audio: el model card es explícito en que no debe usarse el backbone para generación de texto.

## Casos de uso

- Enrutado de tickets de soporte: con una pregunta `choice` se clasifica cada mensaje entrante en colas como facturación, técnico o general. El ejemplo del model card resuelve este escenario en una sola pasada y añade en la misma petición una pregunta `noul` de enfado y una `score` de urgencia.
- Priorización por urgencia: una pregunta `score` con niveles Low/Normal/High/Critical devuelve el nivel esperado y su distribución, útil para ordenar colas de atención sin recurrir a un modelo generativo.
- Moderación y verificación de afirmaciones: preguntas `noul` con definiciones personalizadas de falso y verdadero permiten comprobar si un texto cumple una política concreta, obteniendo una probabilidad en lugar de una salida binaria sin matiz.
- Etiquetado automático a escala: al no generar texto y evaluar varias preguntas en un solo forward, encaja en pipelines de anotación masiva donde el coste por documento es el factor limitante (590 tokens de entrada de media por decisión en JevBench).
- Filtrado y triaje previo a un modelo grande: usar K2-Type-0.9B para descartar o dirigir casos sencillos y reservar un LLM mayor para los casos con baja confianza, apoyándose en las probabilidades por opción.
- Investigación en calibración y evaluación de decisiones: su ECE de 0,065 y su Brier de 0,328 sobre 231 ítems públicos lo convierten en una referencia reproducible frente a otros sistemas del tablero JevBench.
- Agentes de juego o simulación con estado textual: la variante de Snake muestra que el mismo mecanismo de decisión puntúa movimientos sobre un tablero codificado como texto, con una media de 66 comidas por partida en 12x12 y un máximo de 101.

## Benchmarks y rendimiento

JevBench, conjunto público, 231 ítems (commit 26eb72d de `jevbench`, adaptador `typesafe` contra el servidor del repositorio, una H200, sin red):

| Nivel | Aciertos |
|---|---|
| standard (72, `original.jsonl`) | 66 |
| easy (48, `easy.jsonl`) | 47 |
| hard (111, `hard.jsonl`) | 63 |
| Total | 176 / 231 = 0,762 |

Métricas adicionales: Brier 0,328; ECE 0,065; latencia p50 27 ms y p95 60 ms por decisión; 590 tokens de entrada de media por decisión.

Comparativa con otros sistemas en el tablero público de JevBench v1.4, según los datos publicados en el model card:

| Sistema | Precisión pública |
|---|---|
| Jev 1.13.0 | 0,866 |
| Qwen3.5-4B (entradas) | 0,74 - 0,82 |
| K2-Type-0.9B | 0,762 |
| Gemma 4 E2B + LoRA (system-one-open) | 0,732 |
| decider-2b | 0,710 |
| kev 0.6B | 0,667 |
| kev 4B | 0,662 |

Snake (mismo modelo, tablero de texto, una pregunta `choice` y cuatro de sí/no por movimiento): 66 comidas por partida de media en 12x12, máximo 101. El model card advierte de que la puntuación oficial de JevBench también emplea ítems sellados y que todos los sistemas listados rinden bastante por debajo de su precisión pública en ese conjunto.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 2,2 GB en el repositorio (aproximadamente 2,16 GB para 1,078B parámetros en fp16). Con el contexto de servicio y las activaciones, una estimación razonable es de 3 a 4 GB de VRAM; se trata de una estimación, no de un dato publicado.
- GPU recomendadas: el model card indica que el servidor necesita una GPU CUDA; las mediciones de latencia se tomaron en una NVIDIA H200.
- GPU de consumo: por tamaño de pesos debería caber en tarjetas de 6-8 GB o superiores (por ejemplo RTX 3060, 4060, 4060 Ti), si bien no se han publicado pruebas en hardware de consumo.
- Despliegue: servidor propio incluido en el repositorio (`python -m jev.serve --run . --port 8000`), con `transformers >= 5.17` (código remoto) y probado sobre torch 2.8. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y el model card desaconseja explícitamente usar el backbone para generación de texto.
- Latencia y throughput: p50 de 27 ms y p95 de 60 ms por decisión en H200, con unos 590 tokens de entrada por decisión. La primera petición tras el arranque tarda unos segundos por el calentamiento de CUDA; las siguientes se sitúan en el rango de 20 a 60 ms.

## Comparativa con modelos similares

| Modelo | Parámetros | Precisión JevBench público | Licencia | Disponibilidad |
|---|---|---|---|---|
| K2-Type-0.9B | 1,08B | 0,762 | apache-2.0 | Pesos en HuggingFace (safetensors) con servidor propio |
| Jev 1.13.0 (TypeSafe) | no disponible | 0,866 | no disponible | no disponible en la información proporcionada |
| Qwen3.5-4B (entradas) | ~4B | 0,74 - 0,82 | no disponible | no disponible en la información proporcionada |
| Gemma 4 E2B + LoRA (system-one-open) | E2B | 0,732 | no disponible | no disponible en la información proporcionada |
| decider-2b | 2B (según nombre) | 0,710 | no disponible | no disponible en la información proporcionada |
| kev 0.6B | 0,6B | 0,667 | no disponible | no disponible en la información proporcionada |

El patrón que se deduce de estos datos es que K2-Type-0.9B supera a alternativas de 2B y 4B en precisión pública, pero queda por debajo de Jev 1.13.0 (0,866), que es un sistema propietario de TypeSafe sin datos de licencia ni de disponibilidad en la información consultada. La búsqueda web realizada no devolvió ninguna fuente relacionada con este modelo ni con JevBench: los resultados obtenidos correspondían a terceros sin relación (ifm electronic y el Institut Français de la Mode), por lo que no se han incluido.

## Limitaciones y advertencias

- Una sola pasada, sin razonamiento: el model card señala debilidad en aritmética de varios pasos, diferencias de fechas y documentos muy largos (más de 8192 tokens).
- Sin generación de texto: la cabeza de lenguaje del modelo base se conserva en los pesos pero no está entrenada para decidir; usarla para generar produce resultados no fiables.
- Calibración dependiente de la distribución: el ajuste de temperatura se hizo sobre la suite de calibración de Kev, de modo que en otras distribuciones las probabilidades pueden ser demasiado altas o demasiado bajas (ECE 0,065 en el conjunto público de JevBench).
- Respuestas acotadas a las opciones ofrecidas: el modelo no puede responder "ninguna de estas" salvo que se le proporcione esa opción explícitamente.
- Idiomas: solo inglés declarado, por lo que su uso en castellano no está soportado ni evaluado.
- Cobertura de benchmarks limitada: los resultados publicados se reducen a 231 ítems públicos de JevBench y a la tarea de Snake; no hay MMLU, HumanEval, GSM8K ni métricas estándar de LLM, y el propio autor advierte de que la puntuación oficial usa ítems sellados donde los sistemas rinden por debajo de su precisión pública.
- Riesgo de sobreajuste a los formatos evaluados: se verificó que no hubiera solapamiento exacto ni por contención con las suites de Kev y JevBench, pero persiste el riesgo habitual de generalización en dominios no vistos.
- Reproducibilidad parcial: los datos y el código de entrenamiento no se han liberado; solo se publican los pesos y el código mínimo de servicio (`jev/`: codificación de entrada, cabeza pointer y servidor HTTP).
- Licencia: Apache 2.0 sobre los pesos, sin restricciones comerciales documentadas, pero conviene revisar las condiciones efectivas de los datos de entrenamiento derivados de conjuntos públicos y de datos de Kev, cuyo régimen no se detalla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IFM/K2-Type-0.9B
- Modelo base: https://huggingface.co/IFM/K2-Horizon-0.9B
- JevBench (repositorio de evaluación): https://github.com/fstandhartinger/jevbench
- Formato de cable `/v1/systemone` de TypeSafe (sin URL disponible en la información proporcionada)
- No se han encontrado enlaces adicionales relevantes en la búsqueda web.

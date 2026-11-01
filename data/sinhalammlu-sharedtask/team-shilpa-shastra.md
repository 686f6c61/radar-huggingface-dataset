# SinhalaMMLU-SharedTask/team-shilpa-shastra

## Resumen

Este repositorio no contiene un modelo entrenado, sino la solución de inferencia presentada por el equipo Shilpa Shastra a la tarea compartida SinhalaMMLU (ICTer 2026). Se trata de un pipeline de dos etapas y dos modelos que suma 7.000 millones de parámetros (3B + 4B) y que obtuvo una puntuación macro de 49,6269 en el conjunto de test oculto de Codabench. El autor es Malindra Senalankadhikara, único miembro del equipo, y el código se publica bajo licencia MIT.

La aproximación es deliberadamente libre de entrenamiento: no hay fine-tuning, ni adaptadores, ni destilación. El primer modelo, MADLAD-400 3B MT, traduce cada ítem (enunciado y cuatro opciones como un bloque) del cingalés al inglés; el segundo, Qwen3-4B-Instruct-2507, responde la pregunta de opción múltiple sobre la superficie inglesa. La hipótesis de partida es que un modelo fuerte en inglés rinde mejor leyendo el texto una vez transliterado o traducido fuera del alfabeto cingalés.

El interés técnico reside en el mecanismo de decisión: cuatro rotaciones del orden de opciones, margen de log-probabilidad medio con umbral TAU = 0,75 y generación de cadena de pensamiento corta solo cuando el margen es insuficiente o el ítem está etiquetado como difícil. Es un caso práctico de sistema compuesto con presupuesto de parámetros restringido (límite de 8B) y de gestión explícita de la incertidumbre sin acceso a pesos adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de dos modelos transformer: MADLAD-400 3B MT (seq2seq, T5) + Qwen3-4B-Instruct-2507 (decoder-only) |
| Parámetros totales | 7,0B (3B + 4,0B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens de entrada y 512 de salida en la etapa de traducción; 256 tokens de tope en la cadena de pensamiento de la etapa de respuesta |
| Tipos de cuantización | ninguno; float32 en traducción y float16 en respuesta |
| Idiomas soportados | cingalés (si) e inglés (en) |
| Licencia | MIT para el código; pesos upstream Apache-2.0; datos del benchmark no redistribuidos |
| Formato de pesos | no aplica (no se publican pesos propios); se consumen los pesos upstream de Qwen y MADLAD |

## Arquitectura y entrenamiento

No hay entrenamiento. El repositorio no contiene pesos, adaptadores ni datos generados: ambos modelos se usan exactamente como se publicaron upstream. La etapa 1 emplea MADLAD-400 3B MT en float32 con decodificación greedy (`num_beams=1`), prefijo de destino `<2en>`, tope de 256 tokens de entrada y presupuesto de 512 de salida; si el bloque traducido no se parsea como un enunciado más cuatro opciones numeradas distintas, se ejecuta una pasada "apart" que traduce las partes por separado y gana el parseo que produzca más opciones.

La etapa 2 usa Qwen3-4B-Instruct-2507 en float16 con cuatro rotaciones del orden de opciones y calcula el margen medio de log-probabilidad de los tokens de opción con umbral TAU = 0,75. Por encima del umbral se toma directamente la elección por log-probabilidad; por debajo se genera una cadena de pensamiento breve en inglés (tope de 256 tokens), y los ítems de dificultad `hard` reciben CoT siempre. Las filas que no producen inglés utilizable se responden desde la superficie cingalesa. No hay clasificador, router, reranker, modelo de embeddings, recuperación ni ensemble más allá de los dos modelos citados. El manifiesto documenta un ajuste de carga en el weight tying de MADLAD bajo transformers 5, que exige la versión 5.x del framework.

## Capacidades

- Traducción automática cingalés→inglés a nivel de bloque (enunciado y opciones conjuntamente) mediante MADLAD-400 3B MT.
- Respuesta de preguntas de opción múltiple sobre texto en inglés con Qwen3-4B-Instruct-2507.
- Estimación de incertidumbre por margen de log-probabilidad sobre los tokens de opción, con cuatro rotaciones del orden de alternativas para mitigar sesgo posicional.
- Generación de cadena de pensamiento corta en inglés como mecanismo de respaldo cuando el margen es bajo.
- Parseo y validación estructural de la salida de traducción (enunciado más cuatro opciones numeradas), con estrategia de reintento por partes.
- Fallback a la superficie cingalesa cuando la traducción no produce texto utilizable.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido más allá del CoT acotado descrito.

## Casos de uso

- Evaluación de benchmarks de opción múltiple en lenguas de bajos recursos: el pipeline sirve como línea base reproducible para SinhalaMMLU y otros conjuntos con estructura similar, usando traducción más un modelo instructivo fuerte en inglés.
- Sistemas de respuesta a exámenes tipo test en cingalés: la combinación de traducción por bloques y rotaciones de opciones reduce el sesgo de posición y permite desplegar un asistente de preguntas cerradas sin entrenar nada.
- Investigación en sistemas compuestos sin entrenamiento: el código documenta un patrón de dos etapas con umbral de confianza y CoT condicional que se puede trasladar a otras parejas de idiomas.
- Auditoría de robustez posicional: las cuatro rotaciones y el margen TAU = 0,75 constituyen una plantilla para medir cuánto depende un modelo del orden de las alternativas.
- Reproducción de resultados de competición: el repositorio incluye `predictions.jsonl` (2.238 líneas, md5 `005c9d229c11738786094f8985cec6eb`), el notebook de inferencia y el archivo enviado, lo que permite verificar la puntuación de 49,6269 macro.
- Canalización de traducción para corpus cingaleses: la etapa MADLAD con pasada "apart" puede reutilizarse para normalizar texto cingalés a inglés antes de alimentar otros modelos.
- Docencia y prototipado en PLN multilingüe: el notebook y el manifiesto sirven como ejemplo completo de gestión de presupuesto de parámetros (7B dentro del límite de 8B) y de dependencias de versión.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Macro (test oculto, Codabench) | 49,6269 |
| Easy | 48,1308 |
| Medium | 45,9046 |
| Hard | 54,8454 |
| Envío puntuado | board 2026-10-28 09:48 |

No se han publicado resultados comparativos con otros sistemas en la información disponible. El autor indica que el prompt y TAU se eligieron solo sobre el conjunto de desarrollo publicado por los organizadores, nunca sobre el test oculto; las 2.238 filas puntuadas llevan `gold: null` y `artifacts/run_meta.json` registra `graded: 0` y `accuracy: null`.

## Requisitos de hardware

- El script exige dos GPU: `gpu_plan()` lanza `pipeline needs 2 GPUs` con menos de dos, colocando MADLAD en `cuda:0` y Qwen en `cuda:1`. Nunca se ejecutó en un solo acelerador.
- Configuración de referencia: kernel de Kaggle con forma `NvidiaTeslaT4` (2× T4), internet desactivado (`enable_internet: false`, `local_files_only=True`).
- Tiempo de ejecución medido: 17.948,9 s para 2.238 ítems en esa configuración (aproximadamente 8 s por ítem).
- Precisión: float32 para MADLAD-400 3B MT y float16 para Qwen3-4B-Instruct-2507; sin cuantización.
- VRAM estimada: no disponible de forma explícita; por los tamaños y precisiones indicados, cada modelo requiere una GPU dedicada en el rango de 16 GB o superior, pero el autor no publica la cifra.
- Opciones de despliegue: el repositorio solo documenta ejecución mediante el notebook de Kaggle; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se conoce el total de la ejecución completa; no hay medidas por etapa ni por ítem.

## Comparativa con modelos similares

| Sistema | Parámetros | Contexto | Resultado en SinhalaMMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shilpa Shastra (este pipeline) | 7,0B (3B + 4B) | 256/512 tokens por etapa | 49,6269 macro en test oculto | MIT (código), Apache-2.0 (pesos upstream) | Repositorio con notebook y predicciones |
| MADLAD-400 3B MT solo | 3B | no disponible en esta información | no disponible | Apache-2.0 | Pesos públicos en Hugging Face |
| Qwen3-4B-Instruct-2507 solo | 4B | no disponible en esta información | no disponible | Apache-2.0 | Pesos públicos en Hugging Face |

No se dispone de resultados de otros equipos ni de líneas base publicadas en la información proporcionada, por lo que no es posible una comparación cuantitativa adicional.

## Limitaciones y advertencias

- No es un modelo entrenado: no existen pesos propios, adaptadores ni repositorio `team-shilpa-shastra-<model>`; quien busque un modelo afinado para cingalés no lo encontrará aquí.
- Dependencia estricta de dos GPU y de `transformers` 5.x; el ajuste de weight tying de MADLAD se basa en la forma de diccionario de `T5ForConditionalGeneration._tied_weights_keys` y puede romperse en otras versiones.
- El pipeline asume que la traducción al inglés es fiable; errores de MADLAD en terminología técnica cingalesa se propagan directamente a la respuesta, y el fallback a la superficie cingalesa solo cubre los casos sin inglés utilizable.
- El umbral TAU = 0,75 y la redacción del prompt se ajustaron sobre el conjunto de desarrollo; no hay validación independiente que confirme su generalización fuera de SinhalaMMLU.
- Riesgo de alucinación inherente a Qwen3-4B-Instruct-2507 en la generación de CoT, especialmente en ítems `hard` donde el CoT se fuerza siempre.
- El rendimiento medido (49,6269 macro) es moderado y muy dependiente de la calidad de la traducción; no hay desglose por categoría temática que permita identificar áreas de fallo.
- La licencia MIT cubre únicamente el código; no cubre los pesos (Apache-2.0, con sus propias condiciones) ni los datos del benchmark, que el repositorio no redistribuye.
- El repositorio tiene 0 descargas y 0 likes, y las rutas de procedencia apuntan a un repositorio privado (`release/easy-margin-gate-v40`, commits `d3247e6`/`1095ac4`), no verificable públicamente más allá del hash de blob `d544395e0145c9a071debf46cd05ec06dcf88d8d`.
- El tamaño del repositorio es de 0,0 GB en la información de Hugging Face, lo que sugiere que los artefactos pueden no estar completamente disponibles en el momento de la consulta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SinhalaMMLU-SharedTask/team-shilpa-shastra
- Competición en el servidor de los organizadores: https://sinhalammlu.duckdns.org/competitions/1/
- Competición en Codabench: https://www.codabench.org/competitions/18187/
- Sitio de la tarea y reglas: https://sinhalammlu.ucsc.cmb.ac.lk/ y https://sinhalammlu.ucsc.cmb.ac.lk/rules.html
- Artículo SinhalaMMLU (EMNLP 2025): https://aclanthology.org/2025.emnlp-main.1673/
- Modelo upstream Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo upstream MADLAD-400 3B MT: https://huggingface.co/google/madlad400-3b-mt
- Dataset SinhalaMMLU: https://huggingface.co/datasets/naist-nlp/SinhalaMMLU
- Dataset de test de la tarea compartida: https://huggingface.co/datasets/SinhalaMMLU-SharedTask/Sinhala-MMLU-SharedTask-Test-Dataset

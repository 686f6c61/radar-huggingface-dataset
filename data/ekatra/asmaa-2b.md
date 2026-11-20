# ekatra/asmaa-2b

## Resumen

Asmaa 2B es un adaptador LoRA (PEFT) de 135 MB construido sobre Qwen3.5 2B, desarrollado por Ekatra, orientado a la tutoría conversacional de adultos sirios que están aprendiendo a leer, escribir y operar con números. El modelo responde en árabe levantino sirio coloquial (shami, en escritura árabe) imitando el registro de un profesor sirio que escribe por WhatsApp: frases cortas, una única pregunta guía por turno y sin discursos largos. El objetivo es aplicar un enfoque socrático, de modo que el modelo conduzca al alumno hacia la respuesta en lugar de dársela directamente.

Técnicamente es un adaptador de rango 32 y alpha 64 sobre un transformer denso de 2 000 millones de parámetros, entrenado con 157 408 conversaciones sintéticas de tutoría en árabe sirio (no publicadas). Su relevancia actual reside en la combinación de un caso de uso muy específico (alfabetización y numeración de adultos en contextos de desplazamiento) con un tamaño que permite ejecutarlo en un portátil. No obstante, el propio autor lo etiqueta como *research preview*: no ha sido evaluado por modelos jueces ni por hablantes nativos en cuanto a corrección, calidad pedagógica o fidelidad dialectal.

La ficha se basa exclusivamente en la model card publicada en Hugging Face. Los datos de benchmarks convencionales (MMLU, HumanEval, GSM8K) no están disponibles; las únicas métricas publicadas son pérdida de evaluación y comprobaciones automáticas sobre un conjunto de test congelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.5 2B) con adaptador LoRA (PEFT), r=32, alpha=64 |
| Parametros totales | 2 000 millones (modelo base); adaptador LoRA de 135 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor menciona que el modelo fusionado sirve de punto de partida para builds GGUF u on-device, sin especificar formatos) |
| Idiomas soportados | Árabe (árabe levantino sirio; árabe estándar moderno solo para textos formales) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3.5-2B |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alpha 64 aplicado sobre Qwen3.5 2B, un transformer denso de 2 000 millones de parámetros. El adaptador se entrenó con Unsloth 2026.11.7, PEFT 0.21.2 y transformers 5.17.0 (se requiere transformers 5 o superior por el soporte de Qwen3.5). El repositorio ocupa 0,2 GB y el adaptador en sí pesa 135 MB.

El conjunto de entrenamiento consta de 157 408 conversaciones sintéticas de tutoría en árabe sirio, que no se han publicado. El autor no detalla la composición del dataset, el número de tokens ni si hubo etapas de RLHF o DPO. La innovación principal no es arquitectónica sino de comportamiento: el prompt de sistema (incluido en el repositorio como `system_prompt.txt`) induce respuestas de menos de 90 palabras con una sola pregunta guía por turno, y el entrenamiento busca que el modelo mantenga ese patrón socrático en lugar de resolver el ejercicio directamente. Es imprescindible usar ese prompt de sistema y desactivar el modo *thinking*; sin él, el modelo se comporta de forma muy similar al base.

## Capacidades

- Generación de texto conversacional en árabe levantino sirio coloquial, con registro de mensajería breve.
- Tutoría socrática de lectura: identificación de letras, distinción por puntos diacríticos, vocales (harakat) y corrección ortográfica guiada, incluida la hamza.
- Tutoría de escritura y de numeración cotidiana: operaciones aritméticas básicas planteadas con objetos reales (precios, listas de la compra, etiquetas de medicamentos).
- Manejo de mensajes de entrada cortos y con faltas de ortografía, habituales en aprendices.
- Conversaciones multiturno manteniendo el prompt de sistema al inicio de la conversación.
- Cambio a árabe estándar moderno cuando la tarea exige un texto formal.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso con agentes, visión, audio ni modo *thinking* (de hecho, el *thinking* debe desactivarse).

## Casos de uso

- Tutoría de alfabetización de adultos sirios: el modelo gestiona diálogos uno a uno en los que el alumno pregunta por letras, sílabas o palabras de su entorno (etiquetas, formularios) y recibe una pregunta guía en lugar de la solución, lo que encaja con el método socrático entrenado.
- Práctica de numeración cotidiana: cálculo de precios, totales de la compra o lectura de números de teléfono y cantidades, aprovechando los ejemplos de aritmética elemental vistos en el conjunto de test.
- Prototipado de asistentes por WhatsApp para ONG y programas de educación: el adaptador pesa 135 MB y el modelo fusionado cabe en un portátil, lo que permite desplegar un piloto sin infraestructura GPU dedicada.
- Investigación sobre dialectología y adaptación dialectal: sirve como caso de estudio de ajuste fino de un modelo multilingüe hacia un dialecto concreto (sirio levantino) con datos sintéticos.
- Evaluación de calidad pedagógica: útil como sistema de referencia para comparar estrategias de tutoría (socrática frente a directa) en experimentos controlados, siempre con revisión humana.
- Generación de material de práctica: el modelo puede producir diálogos de ejemplo en registro coloquial sirio para cuadernos o aplicaciones de aprendizaje, sujetos a revisión por hablantes nativos.

## Benchmarks y rendimiento

Los únicos datos publicados son pérdida de evaluación y comprobaciones automáticas sobre un conjunto de test congelado (500 filas para la pérdida; subconjunto de 200 filas para el resto, con prompt de sistema de entrenamiento, decodificación greedy, *thinking* desactivado y máximo de 320 tokens nuevos).

| Métrica | Qwen3.5 2B base | LoRA anterior (48 834 filas) | Asmaa 2B (157 408 filas) | Respuestas de referencia |
|---|---|---|---|---|
| Pérdida de evaluación (500 filas) | no disponible | 0,874 | 0,725 | no disponible |
| F-score de 3-gramas de caracteres vs referencia (200 filas) | 13,3 | 39,9 | 41,9 | 100 |
| Palabras medias por respuesta (200 filas) | 33,5 | 20,0 | 21,0 | 21,9 |
| Respuestas truncadas a 320 tokens (200 filas) | 7,0 % | 0 % | 0 % | no disponible |
| Palabras medias por respuesta, segundo test (441 filas) | no disponible | 16,2 | 18,8 | 21,2 |

En las primeras 1 000 filas del test congelado, las respuestas de Asmaa promedian 21,3 palabras (referencia 23,3), todas en escritura árabe y ninguna truncada. El autor advierte que el F-score de 3-gramas solo mide cercanía a una respuesta de referencia y no constituye una medida de calidad: una buena respuesta de tutor puede diferir de la referencia y seguir siendo correcta. No hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones por jueces o hablantes nativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2 000 millones de parámetros, en bfloat16 el modelo base ronda los 4 GB de pesos, y en cuantizaciones de 8 o 4 bits bajaría aproximadamente a 2 GB y 1 GB respectivamente (estimación a partir del tamaño, no publicada por el autor).
- GPU recomendadas: no disponibles; el autor indica que el modelo es «suficientemente pequeño para ejecutarse en un portátil».
- GPU de consumo: previsiblemente cabe en GPU de consumo con suficiente VRAM para 2B parámetros, aunque el autor no especifica modelos concretos.
- Opciones de despliegue: transformers 5 o superior con PEFT (`PeftModel.from_pretrained`); para un modelo único, `merge_and_unload()` y guardado, que es también el punto de partida para builds GGUF u on-device. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Asmaa 2B (ekatra) | 2B (LoRA sobre Qwen3.5 2B) | no disponible | Árabe (sirio levantino) | Apache-2.0 | Tutor socrático especializado; sin evaluación por jueces ni nativos |
| Qwen3.5 2B (base) | 2B | no disponible | Multilingüe | no disponible en la información proporcionada | Modelo base; en el test tiende al árabe formal, responde más largo (33,5 palabras) y trunca el 7 % de respuestas |
| LoRA anterior de Ekatra (48 834 filas) | 2B (LoRA) | no disponible | Árabe (sirio levantino) | no disponible | Versión previa del mismo adaptador; peor pérdida (0,874) y F-score (39,9) |

No se dispone de información sobre otros tutores dialectales comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Estado de *research preview*: no ha sido puntuado por un modelo juez ni por hablantes nativos en corrección, calidad didáctica o fidelidad dialectal; el autor recomienda revisar las respuestas antes de usarlo con alumnos.
- Riesgo de alucinación y de errores pedagógicos: en los ejemplos publicados el modelo base inventa cifras y da por correctas grafías erróneas; el adaptador mejora el comportamiento, pero no hay garantía de corrección en contenidos no vistos.
- Dependencia estricta del prompt de sistema: sin `system_prompt.txt` y con el modo *thinking* activado, el modelo se comporta mucho más como el base y pierde el estilo de tutor.
- Limitación idiomática: solo árabe; el árabe estándar moderno queda restringido a tareas de texto formal. No se documenta soporte de otros dialectos ni de otras lenguas.
- Longitud de contexto no documentada; las respuestas están pensadas para menos de 90 palabras y `max_new_tokens=200` es suficiente según el autor.
- Datos de entrenamiento sintéticos y no publicados: 157 408 conversaciones generadas, lo que puede introducir sesgos y artefactos del generador; no se detalla composición ni filtrado.
- Licencia Apache-2.0, que permite uso comercial, pero el modelo base Qwen3.5 2B tiene su propia licencia, no indicada en la información disponible, que debe verificarse antes de un despliegue en producción.
- Sin métricas de benchmarks estándar ni de throughput/latencia; no apto para decisiones de producción sin una evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ekatra/asmaa-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Perfil del autor (Ekatra): https://huggingface.co/ekatra
- Prompt de sistema: `system_prompt.txt` en el repositorio del modelo (https://huggingface.co/ekatra/asmaa-2b/blob/main/system_prompt.txt)

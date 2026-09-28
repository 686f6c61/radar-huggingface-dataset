# mstrasser/Jeff-Gemma4-E2B

## Resumen

Jeff-Gemma4-E2B es un modelo de decisión (decision model) publicado por el usuario mstrasser en Hugging Face, obtenido por fine-tuning de google/gemma-4-E2B-it. No es un modelo generativo: recibe la descripción en lenguaje natural de una situación y una lista de opciones, y devuelve una probabilidad calibrada para cada opción en una sola pasada hacia delante (single forward pass), sin generar texto ni requerir parseo posterior. Su tarea declarada es la clasificación zero-shot, de modo que las categorías no tienen que aparecer en los datos de entrenamiento: basta con describirlas en palabras.

El modelo ocupa 4.628.569.344 parámetros (unos 4,63 mil millones) según los pesos safetensors, con un repositorio de 9,3 GB, licencia declarada apache-2.0 y soporte únicamente de inglés. Forma parte de la familia Jeff, que aplica la misma receta a modelos Qwen3.5 y Gemma 4 con el objetivo de ofrecer "juicios" rápidos y bien calibrados para integrarlos directamente en código local: el autor reporta 29 ms por decisión en una RTX PRO 6000 y un error de calibración (ECE) de 0,031.

Su relevancia actual está en el nicho de los modelos System 1: tareas de enrutado, etiquetado y desambiguación que no necesitan razonamiento multi-paso, sino latencia baja, coste reducido y probabilidades fiables. En los benchmarks de clasificación y grounding iguala o supera a modelos mucho mayores, mientras que en los de razonamiento queda claramente por debajo, tal y como el propio autor reconoce.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer; fine-tuning de google/gemma-4-E2B-it. La model card no detalla variantes de atención ni esquema de activación |
| Parametros totales | 4.628.569.344 (aprox. 4,63 mil millones), dato real de safetensors |
| Parametros activos | no disponible (el nombre del modelo base usa el prefijo E2B, pero no se documenta el esquema de activación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no hay variantes GGUF, AWQ, GPTQ ni MLX) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 en el repositorio, con license_link a la licencia de Gemma 4 (https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors (librería transformers; tamaño del repositorio 9,3 GB) |
| Modelo base | google/gemma-4-E2B-it |
| Tarea declarada | zero-shot-classification / feature-extraction |
| Formato de salida | probabilidad por opción, opción elegida y nivel de confianza; sin texto generado |

## Arquitectura y entrenamiento

Se trata de un fine-tuning sobre el modelo instruct Gemma 4 E2B. El autor no publica detalles sobre la arquitectura interna más allá de la librería (transformers) y el pipeline (zero-shot-classification), por lo que no hay información disponible sobre número de capas, tipo de atención, ventana de contexto ni esquema de mezcla de expertos. La innovación funcional no está en la arquitectura, sino en el formato de interacción: tres tipos de pregunta (`choice`, con hasta 255 opciones; `noul`, un sí/no devuelto como probabilidad; y `score`, un punto en una escala descrita en palabras), varios de ellos resolubles en una sola petición mediante una única pasada, y una salida estructurada como vector de probabilidades en lugar de texto libre.

El entrenamiento se realizó íntegramente en hardware local: una única GPU RTX PRO 6000, con un tiempo de aproximadamente 3,5 horas para la variante 2B (2 horas para la 0,8B). Los datos de entrenamiento son sintéticos y fueron generados por un modelo abierto (Qwen3.8-Flash-Next) sobre dos DGX Sparks, con las pruebas ejecutadas en un MacBook. El autor afirma que no se usaron GPUs en la nube ni salidas de modelos cerrados en los datos de entrenamiento, y que un modelo cerrado se empleó únicamente para verificar por muestreo la calidad de los datos sintéticos. La receta de entrenamiento parte del repositorio open source AutoJev. No se especifican el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO: no disponible.

## Capacidades

- Clasificación zero-shot con categorías definidas libremente en el prompt: colas de soporte, intenciones de usuario, etiquetas de moderación, comandos de voz o movimientos de juego.
- Salida calibrada: probabilidad por opción, opción ganadora y confianza; el autor reporta un ECE de 0,031.
- Tres tipos de pregunta: `choice` (selección entre hasta 255 opciones), `noul` (sí/no como probabilidad) y `score` (valoración sobre una escala descrita en lenguaje natural).
- Resolución de varias preguntas independientes dentro de una misma petición.
- Inferencia en una sola pasada, sin decodificación autorregresiva: 29 ms por decisión en una RTX PRO 6000.
- Rendimiento alto en clasificación y grounding: Financial PhraseBank (96,1) y RAGTruth (87,4), donde iguala o supera a modelos mucho mayores.
- Capacidad limitada de razonamiento: BBH (66,4), JudgeBench (60,6), WinoGrande (77,4) y JevBench hard (48,6).
- Uso como modelo de decisión en juegos y entornos simulados: Doom, Frogger y Pac-Man, describiendo el estado y los movimientos legales en palabras.
- Idiomas: únicamente inglés.
- Soporte de tool calling / function calling: no documentado; la salida es un vector de probabilidades, no llamadas a funciones.
- Capacidades de agente multi-paso: no documentadas; el modelo está pensado para decisiones puntuales dentro de un bucle externo.
- Visión, audio o modo "thinking": no documentados.

## Casos de uso

- Clasificación de intenciones en asistentes de voz: el propio autor muestra el ejemplo de un transcript ("open the engagment leter" con la pantalla actual como contexto) que se resuelve devolviendo `{"1": 0.94, "2": 0.03, "3": 0.03}`. Con 29 ms por decisión, encaja en un bucle interactivo sin que el usuario perciba latencia.
- Enrutado de tickets de soporte: se describen las colas disponibles y el texto del ticket, y el modelo devuelve la probabilidad de cada cola. Al ser zero-shot, se pueden añadir o renombrar colas sin reentrenar.
- Moderación de contenido: se definen las políticas como opciones con una descripción en palabras y el modelo emite una probabilidad por política, lo que permite fijar umbrales de actuación automática a partir de la confianza.
- Detección de alucinaciones en pipelines RAG: con 87,4 en RAGTruth, puede actuar como filtro de grounding entre la respuesta generada y el contexto recuperado, antes de mostrar la respuesta al usuario.
- Análisis de sentimiento financiero: con 96,1 en Financial PhraseBank, resulta adecuado para etiquetar titulares, notas de prensa o comentarios de analistas dentro de un pipeline de ingesta.
- Evaluación automática tipo LLM-as-judge: con 60,6 en JudgeBench puede usarse como primer filtro barato de calidad de respuestas, reservando el modelo grande para los casos dudosos; conviene tener en cuenta que en esta tarea está por debajo de Jev (78,6) y AutoJev-27B (78,9).
- Priorización y scoring: el tipo de pregunta `score` permite puntuar leads, incidencias o candidaturas sobre una escala descrita en palabras, devolviendo un valor comparable entre elementos.
- Desambiguación y preprocesado lingüístico: con 77,4 en WinoGrande puede resolver correferencias y ambigüedades sencillas antes de enviar el texto a un modelo mayor.
- Agentes en entornos simulados o videojuegos: el autor lo probó en Doom, Frogger y Pac-Man describiendo el estado y las consecuencias de cada movimiento legal, como test de generalización zero-shot.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 4.599 preguntas de cinco benchmarks públicos (valores en precisión, salvo ECE y tiempos). Se comparan con el modelo base sin entrenar y con los modelos de referencia citados en la model card:

| Benchmark | Gemma 4 E2B sin entrenar | Jeff-Gemma4-E2B | Jeff-Qwen3.5-2B | Jev (publicado) | AutoJev-27B (publicado) |
|---|---|---|---|---|---|
| Overall (5 benchmarks) | 62,5 | 81,6 | 83,1 | 83,0 | 84,9 |
| BBH | 51,3 | 66,4 | 68,0 | 94,3 | 82,8 |
| Financial PhraseBank | 86,0 | 96,1 | 96,3 | 77,0 | 84,2 |
| JudgeBench | 46,9 | 60,6 | 64,6 | 78,6 | 78,9 |
| RAGTruth | 63,8 | 87,4 | 88,9 | 77,3 | 88,9 |
| WinoGrande | 51,0 | 77,4 | 79,0 | 90,7 | 83,3 |
| JevBench hard (105 ítems, puntuación aparte) | 41,0 | 48,6 | 53,3 | 73,3 | 70,3 |

Datos adicionales aportados en la model card:

| Métrica | Valor |
|---|---|
| Precisión de panel del modelo base sin entrenar | 62,5% |
| Precisión de panel de Jeff-Gemma4-E2B | 81,6% |
| Error de calibración (ECE) | 0,031 |
| Tiempo de decisión | 29 ms en RTX PRO 6000 |
| ECE de Jeff-Qwen3.5-0.8B / Jeff-Qwen3.5-2B | 0,049 / 0,028 |
| ECE aproximado de Jev | ≈0,06 (media de sus cifras por benchmark) |
| Latencia de Jev vía API | 212 ms por llamada (arnés de Doom) |

El autor señala que la puntuación global de Jeff procede de tareas de clasificación y grounding (Financial PhraseBank, RAGTruth), donde iguala o supera a modelos grandes, mientras que en los benchmarks de razonamiento (BBH, JudgeBench, JevBench) queda muy por debajo. Los resultados de la sección de juegos (Doom, Frogger, Pac-Man) aparecen truncados en la información disponible, por lo que no se reproducen.

## Requisitos de hardware

- Peso de los pesos en precisión completa: 9,3 GB (tamaño del repositorio en safetensors), de modo que la inferencia en fp16/bf16 requiere algo más de 9,3 GB de VRAM solo para los pesos, más el overhead de activaciones.
- Estimaciones de VRAM según cuantización, derivadas del número de parámetros y no publicadas por el autor: aproximadamente 4,7 GB en 8 bits y 2,5-2,8 GB en 4 bits. Al no existir variantes cuantizadas en el repositorio, habría que generarlas.
- GPU medida por el autor: RTX PRO 6000, con 29 ms por decisión.
- GPU recomendadas por rango: A100, H100, L40S o RTX PRO 6000 para fp16 sin cuantizar y despliegues con concurrencia; RTX 4090, RTX 4080 o RTX 4070 Ti para fp16 en nodo único.
- Cabe en GPU de consumo: sí, con cuantización de 8 o 4 bits en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060, RTX 3070). Sin cuantizar, se necesita una GPU de 12 GB o más.
- Backend MLX en Mac: según la model card, el backend MLX de la familia Jeff solo cubre los modelos Qwen, no esta variante.
- Opciones de despliegue documentadas: transformers, con la etiqueta `endpoints_compatible`. No hay soporte documentado de vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia: 29 ms por decisión en RTX PRO 6000. Throughput agregado y comportamiento bajo batching concurrente: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision media (5 benchmarks) | ECE | Tiempo de decision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Jeff-Gemma4-E2B | 4,63B | no disponible | 81,6 | 0,031 | 29 ms (RTX PRO 6000) | apache-2.0 (repo), enlaza licencia de Gemma 4 | Pesos safetensors en Hugging Face |
| Jeff-Qwen3.5-2B | no disponible (base 2B) | no disponible | 83,1 | 0,028 | 24 ms (RTX PRO 6000) | no disponible en la informacion | Pesos en Hugging Face |
| Jeff-Qwen3.5-0.8B | no disponible (base 0,8B) | no disponible | 79,1 | 0,049 | 22 ms (RTX PRO 6000) | no disponible en la informacion | Pesos en Hugging Face |
| Jev (TypeSafe) | no disponible | no disponible | 83,0 | ≈0,06 | 212 ms por llamada vía API | propietario | API |
| AutoJev-27B | 27B | no disponible | 84,9 | no disponible | no disponible | no disponible | Publicado (referencia) |

Con modelos de clasificación generalistas del mismo tamaño (por ejemplo, encoder tipo BERT o DeBERTa) no hay comparación publicada en la información disponible, ya que la ventaja declarada de Jeff es precisamente el carácter zero-shot frente a los clasificadores que requieren entrenamiento supervisado por etiqueta.

## Limitaciones y advertencias

- No genera texto: su salida es un vector de probabilidades. No sirve para generación, resumen, traducción ni diálogo.
- Razonamiento multi-paso limitado: 66,4 en BBH frente a 94,3 de Jev, y 48,6 en JevBench hard frente a 73,3. El propio autor lo atribuye al tamaño del modelo.
- Solo inglés (`language: en`). No hay resultados publicados en otros idiomas.
- Datos de entrenamiento sintéticos, generados por otro modelo (Qwen3.8-Flash-Next), con riesgo de heredar sesgos y artefactos del generador. No se documenta el dataset ni su composición.
- Licencia potencialmente ambigua: el repositorio declara apache-2.0, pero enlaza la licencia de Gemma 4 y deriva de google/gemma-4-E2B-it, con sus propios términos. Conviene revisar ambos antes de un uso comercial.
- Repositorio sin descargas ni "likes" en el momento de la consulta y sin validación independiente de los resultados; todas las cifras proceden del autor.
- El autor recomienda explícitamente un fine-tune con ejemplos propios si la precisión zero-shot no es suficiente: cita un caso de navegación por voz que pasó de 31,7% a 95,8% de precisión en datos retenidos en menos de media hora en una GPU.
- La calidad de la decisión depende de cómo se describan las opciones: opciones mal redactadas o solapadas degradan el resultado.
- No se documentan cuantizaciones oficiales, longitud de contexto máxima ni comportamiento en producción bajo carga, lo que dificulta el dimensionamiento previo.
- Aunque reutiliza el formato de petición de Jev, el proyecto es independiente y no está afiliado ni respaldado por TypeSafe.
- La información sobre los experimentos en juegos está incompleta en los datos disponibles, por lo que no se puede evaluar esa parte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mstrasser/Jeff-Gemma4-E2B
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Receta de entrenamiento AutoJev: https://github.com/denis-pplx/autojev
- Modelo hermano Jeff-Qwen3.5-0.8B: https://huggingface.co/mstrasser/Jeff-Qwen3.5-0.8B
- Modelo hermano Jeff-Qwen3.5-2B: https://huggingface.co/mstrasser/Jeff-Qwen3.5-2B
- Las búsquedas web realizadas no devolvieron ningún enlace relevante sobre este modelo: los resultados obtenidos corresponden a códigos de canje de un videojuego y no guardan relación con la ficha.

# AustinFu/Qev-4B

## Resumen

Qev-4B es un modelo de decision desarrollado por AustinFu (Austin Scamander) que no genera texto libre: recibe un contexto, una pregunta y un conjunto de respuestas candidatas, y devuelve una opcion seleccionada junto con una probabilidad para cada alternativa. Se construye como un adaptador LoRA de rango 64 y alpha 128 sobre Qwen3.5-4B-Base, mas una cabeza de decision especifica de 256 dimensiones, cuatro cabezas de atencion y dos capas Transformer. Soporta tres modos de operacion bajo la misma API: Choice (seleccion entre opciones), Noul (si/no) y Score (valoraciones ordenadas).

El modelo se entrena mediante destilacion de conocimiento desde un profesor de 9B, usando entropia cruzada sobre las probabilidades de las opciones del profesor, con un unico escenario de dos epocas sobre 44.576 entradas de una sola pregunta. La relevancia practica esta en tareas de enrutamiento, clasificacion y decision estructurada donde se necesita una salida tipada y una probabilidad calibrable, en lugar de texto generado. Se distribuye bajo licencia Apache-2.0 y su adaptacion ocupa aproximadamente 524 MiB, aunque requiere descargar por separado el modelo base Qwen.

El proyecto forma parte de una familia con variantes de 2B y 9B que comparten la misma interfaz, lo que permite cambiar de tamano sin reescribir la integracion. El checkpoint publicado es la version v0.1.0, creada el 3 de octubre de 2026, con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B-Base) con adaptador LoRA y cabeza de decision dedicada |
| Parametros totales | Aproximadamente 4.000 millones en el modelo base; el recuento de parametros del adaptador LoRA y de la cabeza de decision no se especifica |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens para el estado y la ruta completa; pregunta limitada a 512 tokens y candidato a 256 tokens |
| Tipos de cuantizacion | no disponible (el paquete usa backbone BF16 y cabeza FP32; no se publican variantes cuantizadas) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 para los pesos de adaptacion; el modelo base, el tokenizador y los datasets de origen conservan sus propios terminos |
| Formato de pesos | safetensors (adaptador LoRA, cabeza de decision, puerta de interaccion y tokenizador; el modelo base Qwen se descarga aparte) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, revision `710fd005d44d55ee27b7ad5147e318e546efdbfe`, y anade un adaptador LoRA de rango 64 y alpha 128 junto con parametros nuevos para la cabeza de decision. Esta cabeza tiene 256 dimensiones, cuatro cabezas de atencion y dos capas Transformer, e incorpora una puerta de interaccion que permite interaccion completa entre opciones hermanas en la ultima capa de atencion completa. El calculo se realiza con backbone en BF16 y cabeza en FP32.

El entrenamiento es una unica etapa de dos epocas que aprende las probabilidades por opcion de un profesor de 9B, mediante entropia cruzada entre las probabilidades del profesor y las del estudiante. Se usaron 44.576 entradas de una sola pregunta, con un total de 2.786 pasos, cuatro GPU, batch global de 32 y semilla 17. Las temperaturas fueron 1,563437713227029 para el profesor y 1 para el estudiante. El conjunto de entrada combina decisiones generales, ciencia y razonamiento, juicios de principios, fronteras controladas, acciones web y tareas adicionales de reglas y razonamiento; cada registro contiene una pregunta con su etiqueta dura eliminada. El profesor es un checkpoint de investigacion de 9B distinto del Qev-9B v0.2.0 publico, y ni el profesor, ni el pool completo de 44.576 entradas, ni las salidas cacheadas se distribuyen. No se indica un baseline nativo de lenguaje de 4B, ni se documentan etapas de RLHF o DPO.

## Capacidades

- Decision estructurada en tres modos: Choice (elegir entre candidatas), Noul (si/no) y Score (valoraciones ordenadas).
- Salida con probabilidad por cada opcion, lo que permite umbrales de confianza y analisis de calibracion.
- Interaccion completa entre opciones candidatas en la ultima capa de atencion, de modo que la decision no evalua cada alternativa de forma aislada.
- Manejo de contextos de estado extensos: hasta 4.096 tokens de estado y ruta completa.
- Capacidad de transferencia a tareas no vistas, medida en el conjunto Transfer development.
- Soporte de entailment y clasificacion de relaciones entre frases (evaluado en WANLI).
- Razonamiento cientifico y de conocimiento general (evaluado en MMLU-Pro y scienthoon).
- Cobertura de texto manuscrito y reconocimiento de trazos (evaluado en SemIf handwritten).
- Idiomas ingles y chino.
- Tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; la integracion como selector de accion en un agente es plausible, pero no se documenta.
- Capacidades de vision o audio: no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto de la incidencia y devuelve el departamento correcto con su probabilidad. El ejemplo oficial del model card clasifica un cargo duplicado entre los equipos de facturacion y envios, y la probabilidad permite derivar a revision humana cuando la confianza es baja.
- Triage en flujos de trabajo con reglas: dado un estado y un conjunto de acciones posibles, el modo Choice selecciona la siguiente accion. Encaja en automatizaciones donde la salida debe ser un valor tipado y no texto libre.
- Clasificacion de contenido con umbral de confianza: el modo Noul devuelve si/no con probabilidad, util para filtros de moderacion o verificacion de cumplimiento donde hace falta una decision binaria auditable.
- Evaluacion automatica tipo examen: con 50,30 por ciento en MMLU-Pro sobre 1.000 preguntas, el modelo es adecuado para puntuar respuestas de opcion multiple generadas por otros sistemas o por personas.
- Inferencia de relaciones textuales (NLI): el resultado de 73,44 por ciento en WANLI sobre 256 ejemplos indica utilidad en tareas de entailment, contradiccion y neutralidad dentro de pipelines de verificacion.
- Anotacion y encuestas asistidas: el modo Score permite convertir texto abierto en valoraciones ordenadas, util para procesar respuestas de cuestionarios o priorizar elementos por criterios definidos.
- Razonamiento cientifico aplicado: con 76,75 por ciento en scienthoon sobre 873 ejemplos, sirve para seleccionar la hipotesis correcta o la respuesta cientifica mas plausible en un conjunto acotado.
- Reconocimiento y decision sobre trazos manuscritos: el 90,28 por ciento en SemIf handwritten sobre 144 ejemplos apunta a aplicaciones de validacion de escritura manual donde se debe decidir entre alternativas.
- Seleccion de herramienta en un agente: aunque no se documenta soporte nativo de function calling, la estructura de pregunta con opciones permite usarlo como componente de enrutamiento hacia herramientas definidas externamente.

## Benchmarks y rendimiento

| Benchmark | Correctas / total | Precision (%) |
|---|---:|---:|
| Decision development · clean | 1099 / 1264 | 86,95 |
| Transfer development · clean | 538 / 656 | 82,01 |
| MMLU-Pro | 503 / 1000 | 50,30 |
| SemIf · handwritten | 130 / 144 | 90,28 |
| scienthoon | 670 / 873 | 76,75 |
| WANLI | 188 / 256 | 73,44 |
| JevBench public | 190 / 231 | 82,25 |

Los resultados se obtuvieron con computo de backbone en BF16, cabeza en FP32, temperatura 1 y ejecucion causal de referencia completa. No hubo preguntas rechazadas en las siete evaluaciones originales. Las filas de development y SemIf usan los mismos subconjuntos que el leaderboard de Qev; los recuentos completos estan en `evaluation.json`. Se trata de mediciones de un unico checkpoint y una unica semilla, los datos y objetivos de entrenamiento difieren entre las versiones de 2B, 4B y 9B, y no se ejecuto un baseline nativo de lenguaje de 4B, por lo que estas cifras no aislan el efecto del tamano del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion propia a partir del recuento de parametros, no publicada por el autor): alrededor de 8-9 GB en BF16 con el backbone completo, mas el espacio de la cabeza FP32 y el adaptador; aproximadamente 4-5 GB en FP16/INT8 y 2,5-3 GB en INT4.
- El entrenamiento registrado se realizo en cuatro GPU con batch global 32 y 2.786 pasos, lo que sugiere que el ajuste fino completo requiere multiples GPU.
- GPU recomendadas: no disponible de forma explicita. Por tamano, el modelo es viable en tarjetas de 24 GB como la RTX 4090 o la A10G, y en A100 o H100 para lotes mayores.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM para inferencia en precision reducida; en BF16 conviene disponer de 12-16 GB.
- Opciones de despliegue: el paquete fuente Qev con Python 3.12 y PyTorch 2.8.0, mediante `Qev.from_pretrained("AustinFu/Qev-4B", revision="v0.1.0", device="cuda")`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.
- Tamano de descarga: aproximadamente 524 MiB para la adaptacion, excluyendo el modelo base Qwen que se descarga por separado.
- El cargador restaura el adaptador LoRA, la cabeza de decision, la puerta de interaccion y el tokenizador. No se necesita el profesor en inferencia. El paquete excluye el estado del optimizador y los pesos del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision en MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qev-4B | ~4B (base) + adaptador y cabeza no cuantificados | 4.096 tokens de estado | 50,30 % (503/1000) | Apache-2.0 (adaptacion) | HuggingFace, v0.1.0 |
| Qev-2B | no disponible | no disponible | no disponible | no disponible | HuggingFace (misma API) |
| Qev-9B v0.2.0 | no disponible | no disponible | no disponible | no disponible | HuggingFace (misma API) |
| Profesor de 9B (investigacion) | 9B, segun el model card | no disponible | no disponible | no distribuido | No publicado |

Los datos de rendimiento y especificaciones de las variantes Qev-2B y Qev-9B no se detallan en la informacion disponible, y el autor advierte que los objetivos de entrenamiento difieren entre las tres versiones, por lo que sus puntuaciones no aislatan el efecto del tamano. Otros proyectos citados en la busqueda web (Kev, Jev, tev1) pertenecen a iniciativas distintas y no se han verificado como comparables directos, por lo que no se incluyen cifras de ellos.

## Limitaciones y advertencias

- El autor indica explicitamente que la calibracion y la fiabilidad en produccion no se han establecido; se recomienda validar el rendimiento y las probabilidades sobre la tarea propia antes de desplegar.
- Las mediciones corresponden a un unico checkpoint y una unica semilla, sin baseline de lenguaje nativo de 4B, lo que limita la generalizacion de los resultados.
- Riesgo de alucinacion: al no generar texto libre, el modo de fallo no es la invencion de contenido, sino la asignacion de una opcion incorrecta con una probabilidad alta; la salida debe acompanarse de umbrales de confianza.
- Sesgos conocidos: no disponible. No se documentan analisis de sesgo demografico, cultural o linguistico.
- Limitacion de idioma: solo se declaran ingles y chino, sin datos de rendimiento en castellano ni en otras lenguas.
- Limitacion de contexto: 4.096 tokens de estado, 512 tokens de pregunta y 256 tokens por candidato; los textos mas largos deben truncarse o dividirse.
- Restricciones de licencia: los pesos de adaptacion son Apache-2.0, pero el modelo base Qwen, el tokenizador y los datasets de origen conservan sus propios terminos, que deben revisarse antes de un uso comercial.
- El profesor, el pool completo de 44.576 entradas y las salidas cacheadas no se distribuyen, lo que dificulta reproducir el entrenamiento exacto.
- Qev-train es una release separada de 2.442 ejemplos sinteticos con etiquetas duras y documentacion de sintesis, no el conjunto de entrenamiento utilizado.
- No se documenta soporte de tool calling, de razonamiento multi-paso ni de despliegue en servidores de inferencia estandar como vLLM, llama.cpp, Ollama o TGI.
- El repositorio registra cero descargas y cero likes, por lo que existe poca validacion externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AustinFu/Qev-4B
- Perfil del autor en HuggingFace: https://huggingface.co/AustinFu
- Repositorio fuente e instalacion: https://github.com/QiqianFu/Qev#installation
- Metodo de entrenamiento de la version 4B: https://github.com/QiqianFu/Qev/blob/main/docs/training-4b.md
- Explicacion del entrenamiento en chino: https://github.com/QiqianFu/Qev/blob/main/docs/training-4b.zh-CN.md
- Leaderboard y evaluacion: https://github.com/QiqianFu/Qev#evaluation
- Aviso de licencia y atribucion de terceros: https://github.com/QiqianFu/Qev/blob/main/THIRD_PARTY_NOTICES.md
- Dataset Qev-train: https://huggingface.co/datasets/AustinFu/Qev-train
- Variante Qev-2B: https://huggingface.co/AustinFu/Qev-2B
- Proyecto Kev (familia distinta, no verificada): https://github.com/jaredpalmer/kev
- Proyecto tev1 (familia distinta, no verificada): https://github.com/togethercomputer/tev1
- Entrada de Wikipedia sobre Jev (modelo propietario no relacionado): https://en.wikipedia.org/wiki/Jev_(AI_model)

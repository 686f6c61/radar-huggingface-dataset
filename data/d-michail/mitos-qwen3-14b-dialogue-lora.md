# d-michail/Mitos-Qwen3-14B-Dialogue-LoRA

## Resumen

Mitos-Qwen3-14B-Dialogue-LoRA es un adaptador LoRA (PEFT) sobre Qwen3-14B, ajustado por el usuario d-michail para respuesta a preguntas sobre procedimientos administrativos del Estado griego. El dominio es el Registro Nacional de Procedimientos Administrativos (Εθνικό Μητρώο Διοικητικών Διαδικασιών, «Mitos»), cuyo contenido se publica como datos abiertos a través de la API api.mitos.gov.gr/info. El modelo no es un modelo generalista: es un ajuste fino de dominio centrado en el registro y el formato de la administración pública griega.

El adaptador se entrenó sobre 90.145 registros de diálogo generados sintéticamente a partir de los textos de las 4.407 procedimientos del registro, con un estilo de respuesta breve (aproximadamente 25-45 palabras) que imita a un funcionario de ventanilla. El repositorio contiene dos adaptadores: uno en la raíz, entrenado con los 4.407 procedimientos, y otro en el subdirectorio `holdout/`, entrenado con 4.187 procedimientos y reservado para evaluación, ya que excluye los 220 procedimientos del conjunto de prueba.

Su relevancia es doble. Por un lado, es un ejemplo reproducible de ajuste fino de bajo coste (LoRA de rango 16) sobre un modelo de 14B para un dominio administrativo concreto y con licencia CC BY-SA 4.0 heredada del contenido del registro. Por otro, la model card publica una evaluación honesta que muestra que el conocimiento factual en modo closed-book es escaso (key-fact recall de 0,141) y que la mayor parte de la precisión proviene de la recuperación aumentada (RAG), con un key-fact recall de 0,471 usando fragmentos a nivel de campo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptadores LoRA sobre las proyecciones de atención y MLP |
| Parámetros totales | 14B en el modelo base; el adaptador LoRA (rango 16, alpha 32) añade un número de parámetros no especificado (el repositorio ocupa 0,5 GB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (longitud máxima de secuencia usada en el entrenamiento del adaptador); contexto nativo del modelo base no detallado en la información disponible |
| Tipos de cuantización | no disponible en el repositorio (solo se publican pesos safetensors del adaptador; no se publican versiones GGUF, GPTQ o AWQ) |
| Idiomas soportados | griego (el) |
| Licencia | CC BY-SA 4.0 (los pesos base Qwen3 son Apache-2.0; el texto de esa licencia se incluye en `LICENSE-Qwen3-Apache-2.0.txt`) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |
| Modelo base | Qwen/Qwen3-14B |
| Método de ajuste | LoRA, rango 16, alpha 32, sobre todas las proyecciones de atención y MLP |
| Optimización | learning rate 2e-4, schedule coseno, 2 épocas, batch efectivo 32, bfloat16 |
| Función de pérdida | solo sobre tokens del asistente, plantilla de chat de Qwen3 con thinking desactivado, fused linear cross-entropy |
| Dataset de entrenamiento | d-michail/mitos-qa (configuración `qa-all`), 90.145 registros sobre 4.407 procedimientos |
| Pipeline | text-generation |
| Biblioteca | peft |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA de Qwen3-14B, un transformer decoder-only de 14.000 millones de parámetros. El adaptador tiene rango 16 y alpha 32, y se aplica a todas las proyecciones de atención y de MLP. El entrenamiento usó learning rate 2e-4 con schedule coseno, dos épocas, batch efectivo de 32 y precisión bfloat16, con una longitud máxima de secuencia de 4096 tokens. La pérdida se calcula únicamente sobre los tokens del asistente, empleando la plantilla de chat de Qwen3 con el modo de razonamiento desactivado (`enable_thinking=False`) y fused linear cross-entropy. No se menciona uso de RLHF ni DPO.

Los datos proceden de un snapshot del registro Mitos descargado el 1 y 2 de octubre de 2026 (registros actualizados entre el 26 de junio y el 1 de octubre de 2026). A partir del texto de cada procedimiento se generaron diálogos ciudadano-funcionario con un LLM (Qwen3.8-27B, según la model card), que después se parsearon a registros de chat: 90.145 registros repartidos entre los 4.407 procedimientos. El modelo aprende a responder de forma breve, entre 25 y 45 palabras. El repositorio separa el adaptador final (raíz, entrenado con todos los procedimientos) del adaptador de evaluación (`holdout/`, entrenado con 4.187 procedimientos y sin los 220 reservados para el conjunto `unseen`). El autor advierte explícitamente de que el adaptador raíz no debe evaluarse sobre ese split porque ya ha visto esos procedimientos.

## Capacidades

- Generación de texto conversacional en griego sobre procedimientos administrativos del registro Mitos.
- Respuestas deliberadamente breves (aproximadamente 25-45 palabras), con el registro y el formato propios de un funcionario de atención al ciudadano.
- Respuesta a preguntas en modo closed-book: aprende el registro y el formato del dominio, pero su retención factual es limitada (key-fact recall de 0,141 frente a 0,051 del modelo base).
- Respuesta aumentada por recuperación: con fragmentos a nivel de campo alcanza un key-fact recall de 0,471 y un token F1 de 0,503.
- Sigue una plantilla de prompt en griego que instruye a responder solo con el contexto recuperado y a declarar explícitamente cuándo la información no es suficiente (comportamiento de abstención).
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso; de hecho, el entrenamiento se hizo con el modo thinking desactivado.
- Capacidad multilingüe: no disponible. El adaptador se entrenó únicamente en griego, aunque el modelo base Qwen3-14B sea multilingüe.
- No se documentan capacidades de visión, audio ni otras modalidades; la pipeline declarada es text-generation.

## Casos de uso

- Asistencia ciudadana automatizada con RAG: el sistema recupera los campos relevantes del procedimiento desde la API de Mitos y el modelo redacta una respuesta breve en griego. Es el escenario para el que fue entrenado y el que obtiene las mejores métricas (key-fact recall de 0,471 con fragmentos a nivel de campo).
- Chat de ventanilla en un portal de e-gobierno: respuestas de 25-45 palabras encajan bien en interfaces de chat donde el ciudadano espera una indicación concreta (plazos, documentos, tasas) y no un texto largo.
- Generación de preguntas frecuentes: a partir de cada procedimiento del registro se pueden producir pares pregunta-respuesta para poblar una sección de FAQ, reutilizando el formato aprendido durante el ajuste.
- Triaje y enrutado de consultas: el modelo puede clasificar de forma implícita la consulta hacia el procedimiento correspondiente y devolver el identificador de seis dígitos de Mitos, que enlaza con `https://id.mitos.gov.gr/<Mitos ID>`.
- Investigación en PLN para griego y administración pública: sirve como punto de comparación reproducible para estudiar ajuste fino de dominio, calidad de datos sintéticos y rendimiento de pipelines RAG en un idioma de recursos medios.
- Evaluación de sistemas de recuperación: el adaptador `holdout/` está pensado para reproducir los números del artículo y comparar estrategias de chunking (campos, ventanas o procedimientos completos) sin contaminación de datos.
- Normalización de lenguaje administrativo: convertir texto normativo del registro en explicaciones llanas para ciudadanía, manteniendo el vocabulario y el registro del dominio.
- Base para un asistente interno de funcionarios: consulta rápida sobre procedimientos concretos, siempre con recuperación y con enlace a la fuente oficial.

## Benchmarks y rendimiento

Evaluación publicada por el autor sobre el adaptador `holdout/`, con 1.933 preguntas y métricas sin juez externo. La columna «key-fact recall (base)» corresponde al modelo sin ajustar y «key-fact recall (este modelo)» al adaptador evaluado.

| Sistema | Key-fact recall (base) | Key-fact recall (este modelo) | Token F1 (este modelo) | Palabras (este modelo) |
|---|---|---|---|---|
| Closed-book | 0,051 | 0,141 | 0,334 | 23 |
| RAG (fragmentos a nivel de campo) | 0,405 | 0,471 | 0,503 | 37 |
| RAG-split (ventanas) | 0,239 | 0,286 | 0,399 | 41 |
| RAG-process (procedimientos completos) | 0,240 | 0,281 | 0,391 | 44 |

Lectura de los datos: el ajuste fino aporta la mayor parte de su valor combinado con recuperación; en closed-book la mejora existe (de 0,051 a 0,141) pero sigue siendo baja. La estrategia de recuperación a nivel de campo es claramente superior a la de ventanas o procedimientos completos. No hay resultados publicados de MMLU, HumanEval, GSM8K ni otros benchmarks generalistas en la información disponible.

## Requisitos de hardware

Las cifras de VRAM son estimaciones a partir del tamaño del modelo base (14B) y no están publicadas por el autor.

- Inferencia en bfloat16: aproximadamente 28 GB solo para los pesos, más la caché KV. Requiere GPU de 40 GB o más (A100 40 GB, A100 80 GB, H100, L40S 48 GB) o reparto en dos GPU de 24 GB.
- Inferencia en 8 bits: aproximadamente 15 GB de pesos, viable en RTX 4090 (24 GB), A6000 (48 GB) o L4 (24 GB).
- Inferencia en 4 bits (NF4, GPTQ, AWQ): aproximadamente 8-9 GB de pesos, viable en tarjetas consumer de 12-16 GB (RTX 4070 Ti Super, RTX 4080, RTX 3090, RTX 4090).
- Cabe en GPU consumer: sí, con cuantización de 4 bits. En bfloat16 no cabe en una GPU consumer de 24 GB sin offloading.
- Nota de despliegue: este repositorio contiene únicamente el adaptador. Para cuantizar o servir con motores que no soportan LoRA en caliente hay que fusionar el adaptador con Qwen3-14B y convertir el modelo resultante.
- Opciones de despliegue: `transformers` + `peft` de forma nativa (es el método documentado en la model card); vLLM y TGI para servir con el adaptador fusionado o con soporte LoRA; llama.cpp y Ollama requieren convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles. Como referencia cualitativa, la salida es muy corta (23-44 palabras según el escenario), lo que reduce el coste de decodificación frente a un asistente generalista.
- El modelo base Qwen3-14B, al que se aplica el adaptador, tiene su propia ficha con requisitos detallados (véase la sección de enlaces).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio e idioma | Key-fact recall (closed-book) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mitos-Qwen3-14B-Dialogue-LoRA (este) | 14B (base) + LoRA r=16 | 4096 tokens en entrenamiento | Administración pública griega, griego | 0,141 | CC BY-SA 4.0 | HuggingFace, adaptador PEFT |
| Qwen/Qwen3-14B (base, sin ajustar) | 14B | no detallado en esta información | Generalista, multilingüe | 0,051 | Apache-2.0 | HuggingFace |
| d-michail/Mitos-Qwen3-14B-Dialogue (modelo fusionado) | 14B | no detallado en esta información | Administración pública griega, griego | no disponible (equivalente al adaptador raíz) | CC BY-SA 4.0 | HuggingFace |

La comparación directa con el modelo base procede de la propia tabla de evaluación del autor. Para otras alternativas (modelos ajustados al griego de otros proveedores, asistentes de e-gobierno de otros países o modelos generalistas de 14B evaluados en griego), no hay datos comparables en la información disponible.

## Limitaciones y advertencias

- No es asesoramiento jurídico. Las respuestas no tienen autoridad legal y un sistema en producción debe mostrar la fuente, la fecha de recuperación y el enlace al procedimiento oficial.
- Conocimiento factual limitado en closed-book: key-fact recall de 0,141. Puede afirmar datos concretos (importes, plazos, documentos) que sean incorrectos. Casi toda la precisión depende de la recuperación.
- Riesgo de obsolescencia: el entrenamiento usa un snapshot del registro descargado el 1-2 de octubre de 2026. Los procedimientos cambian y el modelo queda desactualizado.
- Errores heredados de los datos: los diálogos son sintéticos o generados por plantilla a partir de un único snapshot y pueden reproducir los errores y el fraseo del generador.
- El propio registro no garantiza la exhaustividad ni la corrección de su contenido (términos de uso de mitos.gov.gr, A.6), por lo que el modelo tampoco puede hacerlo. El autor recomienda verificar cada respuesta contra el procedimiento en vivo en `https://id.mitos.gov.gr/<Mitos ID>`.
- Bucles de repetición: los modelos pequeños pueden degenerar en repeticiones que llegan al límite de tokens. En producción conviene aplicar penalización por repetición o una regla de parada.
- Dependencia del formato de prompt: el modelo se entrenó sin system prompt y con thinking desactivado. Hay que usar la plantilla de chat de Qwen3 y colocar la pregunta o el prompt de recuperación en el mensaje de usuario.
- Idioma: solo griego. No hay evidencia de transferencia a otras lenguas, ya que el adaptador se entrenó exclusivamente con datos en griego.
- Confusión entre adaptadores: evaluar el adaptador raíz sobre el split `unseen` del benchmark produce resultados inválidos porque ese adaptador ya vio esos procedimientos. Para reproducir las métricas hay que usar `holdout/`.
- Licencia: CC BY-SA 4.0, con la condición de compartir igual derivada del contenido del registro. Esto puede condicionar el uso comercial de modelos derivados, que deben mantenerse bajo la misma licencia y con la atribución al registro Mitos. El modelo base Qwen3 es Apache-2.0.
- Tamaño del repositorio de 0,5 GB: suficiente para el adaptador, no para pesos completos del modelo base, que hay que descargar por separado.

## Enlaces

- Adaptador LoRA: https://huggingface.co/d-michail/Mitos-Qwen3-14B-Dialogue-LoRA
- Modelo fusionado: https://huggingface.co/d-michail/Mitos-Qwen3-14B-Dialogue
- Dataset de entrenamiento: https://huggingface.co/datasets/d-michail/mitos-qa
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Registro Nacional de Procedimientos Administrativos (Mitos): https://mitos.gov.gr
- API de datos abiertos del registro: https://api.mitos.gov.gr/info
- Consulta de un procedimiento por su identificador de seis dígitos: https://id.mitos.gov.gr/<Mitos ID>
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Texto de la licencia Apache-2.0 del modelo base, incluido en el repositorio: `LICENSE-Qwen3-Apache-2.0.txt`
- Artículo científico: no disponible (la model card indica «To be added with the paper»)
- Búsqueda web: los resultados obtenidos no contienen enlaces relevantes para este modelo; no se ha localizado paper, blog ni demo adicional asociados.

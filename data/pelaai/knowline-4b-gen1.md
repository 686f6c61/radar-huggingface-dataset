# PelaAI/KnowLine-4B-Gen1

## Resumen

KnowLine-4B-Gen1 es un modelo de decisión de 4B parámetros desarrollado por PelaAI, presentado como un "System One decision model": en lugar de generar texto libre, recibe un estado (texto o conversación) junto con hasta 64 preguntas tipadas y devuelve, para cada una, una distribución de probabilidad sobre las opciones disponibles. Las preguntas pueden ser de tipo sí/no, elección entre k alternativas o puntuación según una rúbrica, y cada una se resuelve con un único forward pass, sin decodificación autorregresiva de texto. Se distribuye bajo licencia Apache-2.0 y deriva del modelo multimodal Qwen/Qwen3.5-4B mediante una LoRA SFT fusionada en los pesos base.

El modelo se entrenó con un bucle de datos dirigido por un agente: en cada ronda el agente identificaba debilidades, proponía un grupo de datos específico, lo construía y descontaminaba, entrenaba y evaluaba, y aceptaba o rechazaba el cambio según la evidencia. Todo el proceso se ejecutó en una única máquina "all-in-one". Esta primera generación alcanzó una puntuación pública de 60,47 en el Decision Index 0.3, por encima de las 57,96 de Jev 1.13 en el mismo conjunto público y del mejor modelo de 5B o menos del tablero (50,82).

Es relevante ahora porque propone una vía distinta a la de los modelos generativos para tareas de decisión: clasificar, enrutar o puntuar estados con probabilidades explícitas en lugar de texto generado, lo que encaja con pipelines de agentes, RPA y evaluación automática. Además, la propia model card indica que ya existen versiones posteriores (Gen2, Gen3 y Gen4) con puntuaciones superiores, por lo que esta primera generación debe considerarse una versión temprana dentro de una serie en evolución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen/Qwen3.5-4B (tag image-text-to-text), con torre de visión y cabeza MTP sin modificar; adaptación mediante LoRA SFT fusionada en los pesos |
| Parametros totales | 4.659.865.088 (aproximadamente 4,66 B) |
| Parametros activos | no disponible (la informacion proporcionada no indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos publicados en bf16; SGLang los carga en FP8. No se documentan otras cuantizaciones (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Inglés, chino simplificado y chino tradicional (la ficha de HuggingFace lista en y zh) |
| Licencia | Apache-2.0 (pesos) |
| Formato de pesos | safetensors (bf16) |
| Modelo base | Qwen/Qwen3.5-4B (Apache-2.0) |
| Tipo de ajuste | LoRA SFT, rango 32, alpha 64, sobre el modelo de lenguaje |
| Datos de entrenamiento | Una época sobre aproximadamente 713.000 filas |
| Checkpoint publicado | Paso 5.650 de 5.655 (menor pérdida de validación) |
| Pipeline declarado | text-classification |
| Tamano del repositorio | 9,3 GB |
| Fecha de publicacion | 2026-10-07 (actualizado 2026-10-10) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un modelo multimodal etiquetado como image-text-to-text que incorpora una torre de visión y una cabeza MTP (multi-token prediction). Sobre ese sustrato, PelaAI aplicó un ajuste supervisado con LoRA de rango 32 y alpha 64 únicamente sobre el modelo de lenguaje, durante una época sobre aproximadamente 713.000 filas. La versión publicada corresponde al paso 5.650 de 5.655, seleccionado por ser el de menor pérdida de validación. En el artefacto final la LoRA está fusionada en los pesos base, en bf16, y tanto la torre de visión como la cabeza MTP permanecen sin modificar.

La innovación principal no está en la arquitectura, sino en la interfaz de inferencia y en el proceso de construcción de datos. El modelo no genera texto: para cada pregunta produce la probabilidad asociada al token de etiqueta de cada opción, lo que lo convierte en un clasificador estructurado de propósito general con hasta 64 preguntas por petición. El entrenamiento se organizó como un bucle auto-evolutivo gestionado por un agente de IA que detectaba áreas débiles, generaba y descontaminaba datos específicos, entrenaba, evaluaba y decidía si conservar el cambio, todo ello en una sola máquina. La model card indica además que las versiones Gen2, Gen3 y Gen4 se obtuvieron promediando pesos de distintos pasos y mezclas, lo que sugiere que la receta de entrenamiento siguió refinándose tras esta primera entrega.

## Capacidades

- Respuesta a preguntas tipadas: admite preguntas de tipo sí/no, elección única entre k opciones y puntuación mediante rúbrica, devolviendo una distribución de probabilidad sobre las opciones.
- Salida probabilística calibrada por opción, sin generación de texto, lo que permite umbrales y agregaciones posteriores en pipelines propios.
- Procesamiento por lotes de decisiones: hasta 64 preguntas tipadas sobre un mismo estado en una sola petición.
- Clasificación y enrutado: puntuaciones destacadas en las áreas de recuperación y enrutado (70,9 en el conjunto público del Decision Index 0.3) y de herramientas y agentes (86,8).
- Operación web estilo RPA: selección de elementos en páginas y predicción de la operación a ejecutar, evaluado sobre los splits oficiales de Mind2Web.
- Capacidades multimodales heredadas del modelo base, ya que la torre de visión se mantiene intacta y la etiqueta del repositorio es image-text-to-text; la model card no detalla el uso concreto de imágenes en la tarea de decisión.
- Multilingüismo limitado a inglés, chino simplificado y chino tradicional, con resultados de validación interna de 68,7 en inglés, 69,9 en chino simplificado y 64,1 en chino tradicional.
- Compatibilidad con clientes existentes de Jev: según la model card, basta con cambiar la URL base para reutilizar clientes ya existentes.
- Compatibilidad declarada con endpoints (etiqueta endpoints_compatible) y con servidores SGLang y transformers.
- No se documenta soporte explícito de function calling, agentes multi-paso con planificación autónoma ni modo "thinking"; la función del modelo es responder preguntas cerradas, no razonar en texto abierto.

## Casos de uso

- Atención al cliente automatizada: el modelo puede recibir el mensaje del cliente y responder preguntas tipadas como "¿debería el agente ofrecer un reembolso?" (sí/no) o "¿cuál es el tono del cliente?" (elección entre enojado, neutral o satisfecho), tal y como muestra el ejemplo de la model card, aportando una probabilidad por opción que el sistema puede usar para decidir la siguiente acción.
- Enrutado en pipelines RAG: con una puntuación de 70,9 en recuperación y enrutado, puede decidir mediante preguntas de elección qué recuperador, índice o fuente de datos conviene consultar para una consulta dada, antes de invocar un modelo generativo.
- Decisión de invocación de herramientas: el área de herramientas y agentes obtiene 86,8, de modo que el modelo puede resolver preguntas del tipo "¿qué herramienta corresponde a esta petición?" entre un conjunto cerrado de candidatas, actuando como router previo a un agente generativo.
- Automatización RPA y operación web: sobre los splits oficiales de Mind2Web logra 93,1 de selección de elemento y 96,6 de operación equilibrada en test_task, 90,7 y 96,5 en test_website, y 91,5 y 98,5 en test_domain, lo que lo hace adecuado para elegir el elemento objetivo entre hasta cinco candidatos de una página.
- Evaluación automática con rúbricas: al admitir preguntas de puntuación según criterios definidos por el usuario, puede emplearse como juez automático en pipelines de evaluación de respuestas o de calidad de datos, devolviendo una distribución en lugar de una puntuación generada libremente.
- Moderación y clasificación de contenido: la salida probabilística por opción permite fijar umbrales de decisión explícitos y auditar el comportamiento del clasificador en producción, algo más difícil con salidas generativas.
- Análisis de sentimiento y tono en entornos bilingües inglés-chino: con soporte de chino simplificado y tradicional, puede aplicarse a la clasificación de tono o intención en atención al cliente para mercados anglófonos y sinófonos.
- Detección de inyección de prompt: la model card menciona evaluaciones de prompt-injection en las versiones posteriores (Gen2 y Gen3), lo que apunta a un uso previsto como filtro de decisión en cadenas de agentes.
- Etiquetado y anotación de datos a escala: el formato de preguntas tipadas y la ausencia de generación de texto facilitan el etiquetado masivo y reproducible sobre grandes volúmenes de estados.

## Benchmarks y rendimiento

Todos los resultados son autoinformados por el autor y no han sido verificados por terceros, según la propia model card.

Decision Index 0.3, conjunto público:

| Modelo | Tamano | DI 0.3 publico | DI 0.3 completo | Fuente |
|---|---|---|---|---|
| KnowLine-4B-Gen1 | 4B | 60,47 | aun sin puntuar | autoinformado, kit oficial |
| Clef | 27B | 61,71 | 53,08 | tablero |
| Jev 1.13 | (API) | 57,96 | 60,11 | tablero |
| RSI-Jev v6.1-VL | 4B | 50,98 | no listado | autoinformado |
| ezjev 4B s2 | 4B | 50,82 | 46,95 | tablero |
| jiwo 4B | 4B | 45,76 | 42,86 | tablero |
| Nox 4B | 4B | 44,21 | 44,95 | tablero |

Desglose por area en el conjunto publico del Decision Index 0.3:

| Area | KnowLine-4B-Gen1 (0.3 publico) | Jev 1.13 (0.2.1) |
|---|---|---|
| Conocimiento y razonamiento | 37,7 | 51,4 |
| Lenguaje | 60,8 | 62,0 |
| Recuperacion y enrutado | 70,9 | 55,4 |
| Herramientas y agentes | 86,8 | 75,1 |
| Artes y gusto | 49,5 | 37,7 |

Evaluaciones de validacion retenida y en chino:

| Suite | Precision |
|---|---|
| Conjunto interno, ingles | 68,7 |
| Conjunto interno, chino simplificado | 69,9 |
| Conjunto interno, chino tradicional | 64,1 |
| C-Eval (4 categorias, macro) | 77,9 |
| Open-Jev 1.1 test / OOD | 87,4 / 86,6 |

Operacion web (splits oficiales de test de Mind2Web, solo evaluacion):

| Split | Seleccion de elemento | Operacion (equilibrada) |
|---|---|---|
| test_task (webs vistan en entrenamiento, tareas nuevas) | 93,1 | 96,6 |
| test_website (webs nuevas) | 90,7 | 96,5 |
| test_domain (dominios nuevos) | 91,5 | 98,5 |

Resultado adicional: en un round robin de enfrentamientos individuales con arnes de KOF '98, el modelo registra 17 victorias, 0 derrotas y 1 empate frente a Jev 1.13.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 9,3 GB, a lo que hay que sumar la torre de visión y el overhead de activaciones y cache del servidor; en la practica se recomienda contar con 12 GB o mas de VRAM en bf16. Cargado en FP8 con SGLang, el peso del modelo baja aproximadamente a la mitad.
- GPU recomendadas: cualquier GPU con 16 GB o mas de VRAM resulta comoda en bf16 (RTX 4080, RTX 4090, L40S, A100, H100). Para FP8 conviene una GPU con soporte nativo, como las de las familias Hopper o Ada Lovelace.
- GPU de consumo: si, cabe en GPU de consumo. Una RTX 4090 (24 GB) o una RTX 4080 (16 GB) son suficientes en bf16; una RTX 3060 de 12 GB queda muy justa en bf16 y dependera del overhead, por lo que seria preferible FP8 o un entorno con menos concurrencia.
- Opciones de despliegue: SGLang 0.5.21 es la via recomendada por el autor (carga en FP8 y expone el endpoint /v1/systemone en el puerto 8080, con el servidor SGLang en el 9080). Como alternativa existe un backend basado unicamente en transformers (knowline_server.py con --backend hf), mas lento y en bf16. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Requisitos de software: transformers 5.12.1 y requests, segun el ejemplo de instalacion de la model card.
- Latencia y throughput: no disponible. No se publican cifras de latencia ni de peticiones por segundo. Como referencia cualitativa, al no existir generacion de texto, cada pregunta se resuelve con un unico forward pass, lo que en principio reduce la latencia frente a un modelo autorregresivo del mismo tamano, pero esta afirmacion no viene acompanada de mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | DI 0.3 publico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KnowLine-4B-Gen1 | 4B | no disponible | 60,47 | Apache-2.0 | Pesos abiertos en HuggingFace |
| Clef | 27B | no disponible | 61,71 | no disponible | Puntuado en el tablero del Decision Index |
| Jev 1.13 | no aplica (API) | no disponible | 57,96 | no disponible | Solo API |
| ezjev 4B s2 | 4B | no disponible | 50,82 | no disponible | Puntuado en el tablero |
| Nox 4B | 4B | no disponible | 44,21 | no disponible | Puntuado en el tablero |
| KnowLine-4B-Gen4 | 4B | no disponible | 64,90 | Apache-2.0 | Pesos abiertos en HuggingFace |

Dentro de la propia familia, la model card sitúa a Gen4 (64,90) y Gen3 (63,11) por encima de esta primera generación en el conjunto público del Decision Index 0.3, y ambas tambien por encima en las evaluaciones retenidas, en C-Eval, en Open-Jev y en prompt-injection. La comparación con Clef debe matizarse porque este ultimo tiene 27B de parámetros y su puntuación completa del Decision Index (53,08) es inferior a la de KnowLine en el conjunto público. No hay datos de contexto, cuantizaciones ni licencia para la mayoria de los modelos comparables, ya que la informacion disponible solo incluye sus puntuaciones en el tablero.

## Limitaciones y advertencias

- Resultados no verificados: todos los benchmarks son autoinformados por PelaAI y no han pasado por una verificacion de terceros, tal y como advierte la propia model card.
- El conjunto completo del Decision Index 0.3 no esta disponible para este modelo, solo la parte publica; la suite privada (0,5 de misma habilidad y 0,3 de dominio nuevo) queda reservada a los mantenedores.
- Debilidad en conocimiento y razonamiento: 37,7 en el conjunto público, muy por debajo de los 51,4 de Jev 1.13, por lo que no es adecuado como modelo de razonamiento o conocimiento general.
- No genera texto: solo devuelve distribuciones de probabilidad sobre opciones predefinidas. No sirve para tareas de generacion, resumen, traduccion ni dialogo abierto.
- El riesgo de alucinacion de texto libre es bajo por diseno, ya que la salida se restringe a las opciones dadas; el riesgo equivalente es una asignacion erronea de probabilidad entre las opciones disponibles.
- Cobertura linguistica limitada a ingles y chino (simplificado y tradicional). No se declara soporte de castellano ni de otras lenguas, y el rendimiento en chino tradicional (64,1) es inferior al de ingles y chino simplificado.
- Longitud de contexto no documentada: se desconoce cuanta informacion de estado puede procesarse en una sola peticion, un dato critico para decidir su uso en produccion.
- Version superada: Gen2, Gen3 y Gen4 estan publicadas y superan a este modelo en las evaluaciones del autor, por lo que Gen1 no es la opcion recomendada dentro de la familia salvo por motivos de reproducibilidad.
- Licencia Apache-2.0 sobre los pesos, lo que permite uso comercial, pero el modelo base Qwen/Qwen3.5-4B tambien es Apache-2.0; conviene revisar igualmente los terminos aplicables al modelo base y a los datos de entrenamiento, cuyo origen no se detalla en la informacion disponible.
- Independencia declarada: la model card especifica que KnowLine es un modelo independiente, sin afiliacion, respaldo ni derivacion de TypeSafe o Jev, por lo que la compatibilidad con clientes de Jev es unicamente a nivel de interfaz.
- Despliegue de referencia poco convencional: la ruta recomendada depende de SGLang 0.5.21 y transformers 5.12.1, con un servidor auxiliar de un solo archivo; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, lo que aumenta el coste de integracion.
- Metricas de produccion ausentes: no se publican latencias, throughput ni consumo de memoria medidos, de modo que cualquier estimacion de capacidad debera validarse en el entorno real.
- Adopcion muy baja en el momento de la ficha: 31 descargas y 1 like, lo que implica poca evidencia externa, escaso ecosistema de terceros y soporte comunitario practicamente inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PelaAI/KnowLine-4B-Gen1
- Guia de inferencia (INFERENCE.md): https://huggingface.co/PelaAI/KnowLine-4B-Gen1/blob/main/INFERENCE.md
- README en chino (README.zh.md): https://huggingface.co/PelaAI/KnowLine-4B-Gen1/blob/main/README.zh.md
- Version posterior KnowLine-4B-Gen2: https://huggingface.co/PelaAI/KnowLine-4B-Gen2
- Version posterior KnowLine-4B-Gen3: https://huggingface.co/PelaAI/KnowLine-4B-Gen3
- Version posterior KnowLine-4B-Gen4: https://huggingface.co/PelaAI/KnowLine-4B-Gen4
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Resultados de la busqueda web: no se encontraron enlaces relevantes; los resultados obtenidos corresponden a articulos de un exchange de criptomonedas y no guardan relacion con el modelo.

# iapp/OpenThai-SystemOne

## Resumen

OpenThai-SystemOne es un modelo de decisión, no un modelo generativo: dado un estado arbitrario (texto libre o JSON) y una serie de preguntas tipadas, devuelve probabilidades calibradas sobre las opciones posibles en un único forward pass. Lo desarrolla iapp y se presenta como una implementación abierta del contrato de TypeSafe `POST /v1/systemone`, de modo que el código escrito para el SDK de TypeSafe puede apuntarse a este modelo sin cambios. Está etiquetado como `zero-shot-classification` y se distribuye bajo licencia Apache 2.0.

Su columna vertebral es la torre de texto de Qwen/Qwen3.5-0.8B-Base (24 capas, atención híbrida Gated-DeltaNet/atención, 262.144 tokens de contexto), a la que se le ha eliminado el codificador de visión y que fue sometida a un continued pretraining de unos 5.000 millones de tokens en tailandés (web, Wikipedia, pares paralelos tailandés-inglés y texto de estado de máquina como árboles de accesibilidad y JSON). Sobre ese backbone se sustituye la cabeza LM de 248.000 tokens por una cabeza de 256 slots, lo que da un total de 752.674.883 parámetros.

La relevancia del modelo está en su nicho: enrutado de tickets, moderación, detección de intención, evaluación de relevancia en RAG, verificación de salidas de LLM y selección de acciones en agentes de computer-use. Frente a resolver esas tareas con un LLM generativo y parsear su respuesta, aquí se obtiene directamente una distribución de probabilidad, con abstención explícita cuando ninguna opción encaja. El coste es un modelo de 0,75B, no de 9B, y el autor publica una comparativa en la que adelanta a Bespoke Nimble-9B en 4 de 13 subsets, aunque queda por detrás en la media macro (61,9 frente a 74,8).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con atención híbrida Gated-DeltaNet/atención (24 capas), torre de texto de Qwen/Qwen3.5-0.8B-Base sin codificador de visión; cabeza de decisión de 256 slots en lugar de la cabeza LM |
| Parametros totales | 752.674.883 |
| Longitud de contexto | 262.144 tokens (262k, heredados del backbone) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos `safetensors` sin cuantizaciones publicadas) |
| Idiomas soportados | tailandés (th) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código personalizado (`custom_code`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte del backbone de Qwen3.5-0.8B-Base, un transformer decoder de 24 capas con mecanismo de atención híbrido Gated-DeltaNet/atención y 262k tokens de contexto. Se elimina el codificador de visión y se continúa el preentrenamiento con aproximadamente 5.000 millones de tokens en tailandés: web, Wikipedia, corpus paralelos tailandés-inglés y texto de estado de máquina (árboles de accesibilidad, JSON). La innovación principal está en la cabeza: la cabeza LM de 248.000 tokens se reemplaza por una cabeza de 256 slots. Las opciones se introducen mediante tokens de control `<|ts_opt_0|> … <|ts_opt_254|>`, el estado oculto de cada token `<|ts_answer|>` se proyecta a 256 logits, los slots que exceden el número de opciones se enmascaran y un softmax produce la distribución. El slot 255 está reservado para abstenerse cuando ninguna opción encaja.

El entrenamiento de la cabeza se hizo sobre entre 2 y 3 millones de ejemplos de decisión convertidos a partir de datasets públicos de clasificación, NLI, QA, rating, agentes y selección de herramientas en tailandés e inglés, más tareas de decisión sintéticas en ambos idiomas. Se aplicó barajado del orden de las opciones y se incluyeron ejemplos de abstención. Después hubo una fase corta de calibración con pérdida de Brier y temperatura por tipo de pregunta, de modo que una confianza mayor corresponda a una precisión mayor. El modelo soporta tres tipos de pregunta: `choice` (instrucciones más hasta 255 opciones con nombre y descripción o valor nulo), `score` (instrucciones más entre 2 y 10 descripciones de nivel ordenadas, devolviendo una puntuación fraccional ponderada por probabilidad) y `noul` (pregunta de sí/no que devuelve p(sí)).

## Capacidades

- Clasificación zero-shot de una sola pasada: devuelve `choice`, `probabilities` y `confidence` sin generar texto ni decodificación autorregresiva.
- Preguntas de elección (`choice`) con hasta 255 opciones, cada una con nombre y descripción opcional.
- Puntuación ordinal (`score`) sobre entre 2 y 10 niveles ordenados, con salida fraccional ponderada por probabilidad.
- Preguntas binarias (`noul`) que devuelven la probabilidad de "sí".
- Abstención explícita mediante el slot 255 cuando ninguna opción es adecuada.
- Calibración por tipo de pregunta (temperatura específica y pérdida de Brier) para que la confianza sea interpretable.
- Entrada de estado flexible: texto libre o JSON, incluido texto de estado de máquina como árboles de accesibilidad.
- Bilingüe tailandés-inglés, con continued pretraining específico en tailandés.
- Selección de acciones y de herramientas para agentes de computer-use y browser agents.
- Compatibilidad de contrato con TypeSafe `POST /v1/systemone`, con SDK de Python (`openthai-systemone`) y servidor HTTP propio.
- No soporta generación de texto, tool calling generativo ni razonamiento multi-paso de forma nativa: su salida es siempre una distribución sobre opciones.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el texto del ticket como estado y una pregunta `choice` con los departamentos posibles (`billing`, `technical`, `sales`) más sus descripciones, y devuelve la probabilidad de cada uno. El ejemplo de la model card usa exactamente este escenario con un ticket en tailandés sobre un cobro duplicado.
- Moderación de contenido: con una pregunta `noul` o `choice` sobre categorías de toxicidad, se obtiene una probabilidad por categoría en una sola pasada. En el subset `civil_comments` el modelo logra 78,0, por delante de Nimble-9B (70,3), lo que lo hace competitivo como filtro de primera línea.
- Detección de intención en asistentes: los subsets `massive-en-US` (75,7) y `massive-de-DE` (64,6) miden clasificación de intenciones sobre texto de usuario; el modelo puede resolver esa capa antes de invocar cualquier LLM generativo.
- Juicio de relevancia y verificación de salidas de LLM en pipelines RAG: preguntas `choice` o `score` sobre si un pasaje recuperado responde a la consulta, o si una respuesta generada está sustentada por el contexto. Aviso: en `summeval-relevance` el modelo obtiene 13,8 con ECE 0,79, por lo que este uso requiere validación previa.
- Selección de acciones en agentes de computer-use y browser agents: dado el árbol de accesibilidad o el JSON del DOM como estado, una pregunta `choice` con los elementos clicables como opciones devuelve cuál elegir, con abstención si ninguno encaja.
- Selección de herramienta en pipelines de function calling: el estado es la conversación o el JSON de entrada y las opciones son las herramientas disponibles con sus descripciones; el modelo devuelve la herramienta a invocar y la confianza asociada.
- Puntuación de calidad y satisfacción: con preguntas `score` se puntúan respuestas o resúmenes. Los resultados son mixtos: 42,8 en `helpsteer2` (por delante de Nimble-9B con 39,0) y 84,0 en `summeval-consistency`, pero 13,8 en `summeval-relevance`.
- Detección de contradicción y fact checking: en `multinli` el modelo alcanza 85,6, ligeramente por encima de Nimble-9B (85,3) y de Jev 1.13.0 (82,9), con una ECE muy baja de 0,035.
- Enrutador o guardrail de bajo coste: por su tamaño (752,7M parámetros) y su naturaleza de pasada única, puede decidir si una consulta merece invocar un modelo mayor, reduciendo coste en producción.

## Benchmarks y rendimiento

Todos los números son zero-shot: el modelo solo ve el estado, las instrucciones y los nombres o descripciones de las opciones. La comparativa usa los mismos 13 subsets, splits, instrucciones y muestreador que `docs/PUBLIC_BENCHMARKS.md` de Bespoke Nimble. Los números de Nimble-9B y Jev son los publicados por Bespoke Labs (2026-09-18); los de OpenThai se midieron con `scripts/06_eval.py` sobre reconstrucciones de los mismos subsets.

| Subset | Tipo | n | OpenThai 0,8B | Nimble-9B | Jev 1.13.0 | ECE propio |
|---|---|---|---|---|---|---|
| aegis2 | noul | 250 | 58,0 | 81,2 | 80,4 | 0,243 |
| boolq | noul | 300 | 63,7 | 86,0 | 89,7 | 0,195 |
| civil_comments | noul | 300 | 78,0 | 70,3 | 81,0 | 0,127 |
| helpsteer2 | score | 250 | 42,8 | 39,0 | 34,1 | 0,400 |
| massive-de-DE | choice | 350 | 64,6 | 83,4 | 86,9 | 0,199 |
| massive-en-US | choice | 350 | 75,7 | 86,9 | 87,4 | 0,133 |
| multinli | choice | 299 | 85,6 | 85,3 | 82,9 | 0,035 |
| paws | noul | 250 | 67,2 | 82,8 | 89,2 | 0,143 |
| pubmedqa | choice | 250 | 53,6 | 75,6 | 77,2 | 0,154 |
| squad2 | noul | 299 | 50,2 | 80,6 | 82,9 | 0,461 |
| summeval-consistency | score | 144 | 84,0 | 75,7 | 81,2 | 0,061 |
| summeval-relevance | score | 240 | 13,8 | 49,2 | 35,0 | 0,791 |
| vitaminc-dev | choice | 599 | 67,1 | 76,6 | 80,1 | 0,098 |
| Media macro | | | 61,9 | 74,8 | 76,0 | |

`choice` y `noul` reportan exactitud; `score` reporta coincidencia exacta de nivel. Como referencia, el Qwen3.5-0.8B sin modificar, con prompting y log-probabilidades por letra, obtiene 45,4 de media macro en el mismo banco (dato de Bespoke). El autor señala que el modelo adelanta a Nimble-9B en 4 de 13 subsets (NLI, consistencia de resumen, puntuación de utilidad y toxicidad) y queda claramente por detrás en tareas de comprensión lectora de tipo sí/no (`squad2` está en el nivel del azar, además de `boolq` y `pubmedqa`) y en la puntuación de relevancia de resúmenes, el único subset donde la cabeza de puntuación está claramente descalibrada (ECE 0,79). La model card incluye además una tabla de conjuntos retenidos en tailandés con columnas de exactitud, macro-F1/MAE y ECE, pero en la información disponible la tabla aparece truncada y sin valores.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 752,7M parámetros, no publicada por el autor): en bf16/fp16 unos 1,5 GB solo de pesos; en int8 alrededor de 0,8 GB; en int4 alrededor de 0,4 GB. A esto hay que sumar la caché KV, que con 262k tokens de contexto puede dominar el consumo total.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM basta para los pesos en precisión reducida. No requiere A100 ni H100; tarjetas como RTX 3060, RTX 4090 o incluso GTX 1650 son suficientes para lotes pequeños.
- Cabe en GPU de consumo: sí, con holgura. El repositorio ocupa 1,5 GB.
- Opciones de despliegue documentadas: `transformers` con `trust_remote_code=True`, el SDK de Python `openthai-systemone` (`pip install openthai-systemone`) y el servidor HTTP incluido con contrato compatible con TypeSafe (`OPENTHAI_SYSTEMONE_MODEL=iapp/OpenThai-SystemOne uvicorn openthai_systemone.server:app --port 8000`).
- Despliegue con vLLM, TGI, llama.cpp u Ollama: no disponible. La cabeza de 256 slots y el código personalizado hacen que estos motores no funcionen sin conversión.
- Latencia y throughput: no se publican cifras. La arquitectura hace un único forward pass y evita la decodificación autorregresiva, por lo que la latencia esperada es sustancialmente menor que la de un modelo generativo de tamaño comparable en tareas equivalentes, pero no hay mediciones disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media macro (mismo banco) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenThai-SystemOne | 752,7M | 262.144 tokens | 61,9 | Apache 2.0 | Pesos abiertos en HuggingFace |
| Bespoke Nimble-9B | 9B (aproximado, no confirmado en la informacion) | no disponible | 74,8 | no disponible | Referencia publicada por Bespoke Labs |
| Jev 1.13.0 | no disponible | no disponible | 76,0 | no disponible | Referencia publicada por Bespoke Labs |
| Qwen3.5-0.8B-Base con prompting de letras | 0,8B | 262.144 tokens | 45,4 | no disponible en la informacion proporcionada | Pesos abiertos en HuggingFace |

Lectura de la comparativa: OpenThai-SystemOne pierde 12,9 puntos de media macro frente a Nimble-9B con una doceava parte de los parámetros, pero gana en 4 de 13 subsets y, a diferencia de los modelos comparados, devuelve distribuciones de probabilidad calibradas y un mecanismo de abstención en un solo forward pass. Frente a su propio backbone sin modificar mejora 16,5 puntos de media macro, lo que aísla el efecto del continued pretraining en tailandés y de la cabeza de decisión. No se dispone de datos de licencia ni de contexto de Nimble-9B y Jev 1.13.0 en la información proporcionada.

## Limitaciones y advertencias

- No genera texto. Cualquier caso de uso que requiera salida libre, razonamiento multi-paso o respuestas conversacionales queda fuera de su alcance.
- Comprensión lectora de tipo sí/no muy débil: `squad2` obtiene 50,2 (nivel de azar) con ECE 0,461, y también queda lejos en `boolq` (63,7) y `pubmedqa` (53,6).
- Descalibración severa en `summeval-relevance`: 13,8 de exactitud de nivel con ECE 0,791. Cualquier uso para puntuar relevancia de resúmenes debe validarse antes de ir a producción.
- ECE alto en varios subsets (`aegis2` 0,243, `helpsteer2` 0,400, `squad2` 0,461), lo que implica que la confianza devuelta no siempre es fiable aunque la calibración global se haya trabajado con pérdida de Brier y temperatura por tipo.
- Sesgo de dominio esperado hacia el tailandés: el continued pretraining usó unos 5.000 millones de tokens en tailandés, y los subsets en inglés (`massive-en-US` 75,7) están por debajo de los resultados de los modelos de 9B.
- Cobertura de idiomas limitada a tailandés e inglés. No hay soporte documentado para castellano ni para otros idiomas.
- Límite estructural de 255 opciones por pregunta `choice` (slots 0 a 254, con el 255 reservado para abstención).
- Riesgo de alucinación acotado por diseño (no genera texto libre), pero riesgo de elección incorrecta con confianza alta en dominios alejados del entrenamiento, especialmente en tareas de comprensión lectora.
- Los datos de benchmark son en su mayoría autopublicados por el autor; solo las cifras de Nimble-9B y Jev 1.13.0 provienen de Bespoke Labs. Los números no son auditados de forma independiente.
- Adopción mínima: 0 descargas y 1 like en el momento de la consulta, con lo que la validación por parte de la comunidad es prácticamente nula.
- Sin cuantizaciones publicadas ni soporte en motores de inferencia habituales (llama.cpp, Ollama, vLLM, TGI), lo que limita las opciones de despliegue eficiente y obliga a usar `transformers` con código remoto (`trust_remote_code=True`), con el consiguiente riesgo de ejecutar código de terceros.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni se documentan cláusulas adicionales sobre los datasets de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iapp/OpenThai-SystemOne
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Repositorio del SDK y del servidor: https://github.com/iapp-technology/openthai-systemone
- Imagen de presentación del modelo: https://huggingface.co/iapp/OpenThai-SystemOne/resolve/main/assets/openthai-systemone-launch.jpg
- Referencia de benchmarks públicos de Bespoke Labs (`docs/PUBLIC_BENCHMARKS.md` del repositorio de Bespoke Nimble): URL no disponible en la información proporcionada.
- Búsqueda web: los resultados devueltos corresponden a páginas de producto de ChatGPT (chatgpt.com, openai.com/index/chatgpt) y a un portal de terceros (chatai.de); ninguno es relevante para este modelo y no se incluyen como fuentes.

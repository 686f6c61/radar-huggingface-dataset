# Atlas-AI-research/reflex-instinct-0.6b

## Resumen

Reflex Instinct 0.6B es un modelo de decisión para agentes de navegador desarrollado por Atlas AI Research. No es un modelo generativo: parte de `Qwen/Qwen3-0.6B`, le añade un adaptador LoRA (rango 64, alpha 128, sobre todas las proyecciones de atención y MLP) y una cabeza pointer de unos 0,5M de parámetros, y devuelve probabilidades calibradas sobre opciones que el usuario proporciona, en lugar de texto libre. Dada una tarea y el árbol de accesibilidad de una página web, elige en una única pasada la siguiente operación y el elemento sobre el que actuar.

Su relevancia está en el coste y la latencia: con 0,6B de parámetros corre en GPU de consumo (191 ms p50 medidos en una RTX 5070 con páginas reales de unos 4,5k tokens) y con un error de calibración (ECE) de 0,025 sobre 2.000 pasos reservados de NNetNav, lo que permite usarlo como primera etapa de un agente y derivar únicamente los pasos de baja confianza a un modelo mayor.

En el sistema Reflex, Instinct resuelve los pasos con confianza alta y, cuando esta cae por debajo de un umbral, el paso pasa a Reflex Reason, un modelo visión-lenguaje de 2B que inspecciona una captura de pantalla. El modelo se publica como adaptador PEFT en safetensors, solo en inglés, y con licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-0.6B) con adaptador LoRA y cabeza pointer de dos proyecciones de 256 dimensiones más temperatura de calibración |
| Parámetros totales | Backbone de 0,6B; LoRA de rango 64 y alpha 128 sobre todas las proyecciones de atención y MLP; cabeza pointer de aproximadamente 0,5M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 16k tokens; las páginas más largas se truncan por el final, por líneas completas |
| Tipos de cuantización | No disponible (se distribuye como adaptador LoRA en safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors, head.safetensors) más adapter_config.json; librería PEFT |
| Modelo base | Qwen/Qwen3-0.6B |
| Tipos de pregunta | choice, noul (sí/no), score (niveles ordenados) |
| Operaciones entrenadas | CLICK, TYPE_TEXT, HOVER, PRESS_KEY, SCROLL_DOWN, SCROLL_UP, GOTO_URL, GO_BACK, GO_FORWARD, SWITCH_TAB, DONE, BLOCKED |
| Tamaño del repositorio | 0,2 GB |
| Fecha de publicación indicada | 2026-10-02 (según HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone de Qwen3-0.6B con un adaptador LoRA (rango 64, alpha 128) aplicado a todas las proyecciones de atención y MLP. La cabeza de lenguaje del modelo base no se utiliza: en su lugar hay una cabeza pointer con dos proyecciones de 256 dimensiones (`q`, `k`) y una temperatura de calibración `T`. Cada opción de respuesta es una posición del input: una opción de texto es el último token de su línea en el bloque de pregunta, y una opción de elemento es el último token de la línea de ese elemento dentro de la página, de modo que los elementos nunca se copian al output. La puntuación se calcula como `logit = <W_q h_question, W_k h_option> / sqrt(256)` y después se aplica un softmax sobre las opciones de esa pregunta. Cualquier número de preguntas se responde en la misma pasada, lo que permite obtener operación, elemento objetivo y estado de finalización de forma simultánea.

El entrenamiento se realizó sobre los conjuntos `stanfordnlp/nnetnav-wa` y `stanfordnlp/nnetnav-live`, con páginas en formato de árbol de accesibilidad de WebArena/BrowserGym (una línea por elemento con la forma `[id] role 'name' properties`, tabulada por profundidad). Durante el entrenamiento se aleatorizaron los nombres, las descripciones, el orden y los subconjuntos de opciones, lo que permite al usuario definir su propia lista de operaciones. El número de tokens de entrenamiento, la composición exacta del dataset y si hubo fases de RLHF o DPO no se detallan en la información disponible.

## Capacidades

- Selección de la siguiente operación (`choice`) entre las opciones suministradas por el usuario en cada petición.
- Selección del elemento objetivo sobre el que actuar, devolviendo su `[id]` dentro del árbol de accesibilidad, sin copiar texto de la página.
- Respuestas de sí/no mediante preguntas `noul` (por ejemplo, si la tarea ya está completada).
- Preguntas `score` con niveles ordenados, devolviendo el nivel esperado.
- Probabilidades calibradas por opción, con ECE de 0,025, y un campo `confidence` definido como `1 - entropía normalizada`.
- Respuesta por lotes: cualquier número de preguntas se resuelve en una sola pasada hacia delante.
- Lista de operaciones configurable: al haberse entrenado con nombres, descripciones y órdenes aleatorizados, acepta operaciones distintas de las vistas en entrenamiento.
- Restricción estricta de respuestas: en una prueba con 1.200 respuestas de entre 2 y más de 600 opciones, incluidas opciones nunca vistas en entrenamiento, no se produjo ninguna respuesta fuera de las opciones suministradas.
- Estabilidad frente al orden: formular una pregunta sola o en distinto orden desplaza sus probabilidades en una mediana de 0,001.
- No dispone de generación de texto, razonamiento en lenguaje natural, visión, audio, tool calling ni capacidades multilingües (solo inglés).

## Casos de uso

- Agente de navegador local: el modelo resuelve cada paso a partir del árbol de accesibilidad y de la tarea, con unas 0,2 s por decisión, lo que permite ejecutar el bucle de control del agente enteramente en una GPU de consumo sin enviar el contenido de las páginas a la nube.
- Escalado selectivo a un modelo mayor: dado que el 6-7% de los pasos obtiene p ≥ 0,9 con un 90,4% de acierto en operación y un 95,1% en elemento, se puede fijar un umbral de confianza y derivar solo los pasos dudosos a un modelo de razonamiento multimodal, reduciendo el coste por tarea.
- Automatización de procesos web internos (RPA): sustituir selectores CSS o XPath frágiles por decisiones sobre el árbol de accesibilidad, usando las operaciones CLICK, TYPE_TEXT y PRESS_KEY sobre formularios y paneles de gestión.
- Rellenado y validación de formularios: combinación de TYPE_TEXT con la selección del campo objetivo, devolviendo la distribución completa de probabilidades para auditar por qué se eligió cada campo.
- Verificación de finalización de tareas en orquestadores: la pregunta `noul` sobre si la tarea está acabada permite cerrar bucles de agente sin depender de heurísticas sobre el DOM.
- Detección de bloqueos: con la operación BLOCKED y las probabilidades asociadas, un orquestador puede decidir si reintentar, cambiar de estrategia o pedir intervención humana.
- Análisis y simulación de agentes: las distribuciones de probabilidad sobre acciones y elementos permiten comparar políticas, medir incertidumbre por tipo de página y depurar por qué un agente falla en un sitio concreto.
- Pruebas de accesibilidad y navegación asistida: al operar sobre el árbol de accesibilidad en lugar de sobre píxeles, encaja con flujos que ya exponen la estructura semántica de la página.

## Benchmarks y rendimiento

Resultados medidos sobre 2.000 pasos de test reservados de NNetNav, disjuntos de los usados para seleccionar el checkpoint:

| Métrica | Reflex Instinct | Referencia |
|---|---|---|
| Operación, top-1 / top-5 | 62,1% / 95,2% | 56,0% prediciendo siempre CLICK; 61% para TF-IDF + regresión logística |
| Elemento objetivo, top-1 / top-5 | 41,6% / 70,2% | Aproximadamente 0,3% para una elección aleatoria (unas 300 elementos por página) |
| Paso (operación y elemento correctos) | 31,0% | Sitios de WebArena 32,0%; web en vivo 30,0% |
| Error de calibración (ECE, 15 bins) | 0,025 | No disponible |
| Decisiones con p ≥ 0,9 | Operación: 90,4% correctas; elemento: 95,1% correctas | Aproximadamente el 6-7% de los pasos |
| Latencia | 162 ms p50 / 452 ms p90 (en proceso, RTX 5070) | 191 ms p50 en páginas reales de unos 4,5k tokens |

Comprobaciones adicionales aportadas por el autor: 1.200 respuestas con entre 2 y más de 600 opciones, incluidas opciones nunca vistas en entrenamiento, dieron 0 respuestas fuera de las opciones suministradas; y las mismas 3 decisiones tardaron 0,19 s cada una con este modelo frente a 14 s y 380 tokens generados al resolverlas el Qwen3-0.6B base mediante razonamiento en texto.

El propio autor advierte de que las etiquetas proceden de un explorador basado en un LLM, por lo que un paso suele admitir varias acciones razonables y la registrada es solo una de ellas; la exactitud top-1 frente a esas etiquetas infravalora la utilidad del modelo, y el valor principal está en las probabilidades calibradas.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del tamaño, no publicada por el autor): en fp16 alrededor de 1,2-1,5 GB solo para pesos, más el coste de activaciones de un contexto de hasta 16k tokens; en 8 bits aproximadamente 0,7 GB y en 4 bits aproximadamente 0,4 GB, en ambos casos sin contar activaciones.
- GPU medidas por el autor: RTX 5070, con 191 ms p50 por decisión en páginas reales de unos 4,5k tokens y 162 ms p50 / 452 ms p90 en proceso con esas mismas condiciones.
- Cabe en GPU de consumo: sí, el propio autor lo describe como suficientemente pequeño para cualquier GPU de consumo reciente; no se han publicado medidas en A100, H100 u otras GPU de centro de datos.
- Opciones de despliegue: el modelo se distribuye como adaptador PEFT que se carga sobre `Qwen/Qwen3-0.6B` y se fusiona, junto con una cabeza pointer que requiere código de inferencia propio. Los servidores estándar para modelos generativos (vLLM, TGI, Ollama, llama.cpp) no cubren este caso de uso de forma directa, porque no hay cabeza de lenguaje y las respuestas son un softmax sobre opciones, no tokens generados.
- Throughput y latencia en otros tamaños de página o en otras GPU: no disponibles.

## Comparativa con modelos similares

No se dispone de resultados comparables publicados de otros modelos de decisión para agentes de navegador. La única comparación con datos en la información proporcionada es interna al propio trabajo:

| Modelo | Parámetros | Naturaleza | Operación top-1 | Elemento top-1 | Paso completo | Licencia |
|---|---|---|---|---|---|---|
| Reflex Instinct 0.6B | 0,6B + LoRA + cabeza de ~0,5M | Modelo de decisión, sin generación | 62,1% | 41,6% | 31,0% | Apache-2.0 |
| Qwen3-0.6B base razonando en texto | 0,6B | LLM generativo | No disponible | No disponible | No disponible | No confirmada en la información disponible |
| TF-IDF + regresión logística | No disponible | Clasificador clásico | 61% | No disponible | No disponible | No disponible |
| Predicción constante de CLICK | No aplica | Línea base trivial | 56,0% | No disponible | No disponible | No aplica |

Como referencia de coste, el Qwen3-0.6B base tardó 14 s y generó 380 tokens para resolver 3 decisiones que Reflex Instinct resolvió en 0,19 s cada una. Reflex Reason, el modelo visión-lenguaje de 2B del mismo sistema, no publica métricas en la información disponible.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües declaradas.
- El contexto está limitado a 16k tokens y las páginas más largas se truncan por el final, de modo que los elementos situados al final de una página larga quedan fuera del alcance del modelo.
- Depende del formato de entrada de WebArena/BrowserGym (una línea por elemento, `[id] role 'name' properties`, tabulado por profundidad); otras representaciones de la página pueden degradar el rendimiento.
- La exactitud top-1 no es alta (62,1% en operación, 41,6% en elemento, 31,0% en paso completo), aunque el autor atribuye parte de ello a que las etiquetas provienen de un explorador LLM y admiten varias respuestas válidas.
- La calibración (ECE 0,025) se midió sobre pasos reservados de NNetNav; no hay garantía de que se mantenga en dominios o tipos de página distintos.
- No genera texto, por lo que no sirve para tareas generativas, resumen ni diálogo; su salida es siempre una distribución sobre las opciones suministradas.
- El riesgo de alucinación en el sentido clásico está acotado, porque las respuestas se restringen a las opciones dadas (0 respuestas fuera de opciones en 1.200 pruebas), pero persiste el riesgo de elegir una acción incorrecta, especialmente en pasos ambiguos.
- En acciones irreversibles (compras, envíos, borrados, cambios de configuración) conviene exigir un umbral de confianza alto y algún tipo de confirmación, dado que una parte relevante de los pasos tiene confianza repartida entre varias opciones.
- El adaptador se publica con licencia Apache-2.0; la licencia del modelo base Qwen3-0.6B no se confirma en la información proporcionada y debe verificarse antes de un uso comercial.
- El repositorio no tiene descargas ni valoraciones en el momento de la consulta, por lo que no existe validación externa independiente de los resultados publicados.
- No se han publicado datos sobre sesgos demográficos, de contenido o de representación lingüística.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Atlas-AI-research/reflex-instinct-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/stanfordnlp/nnetnav-wa
- Dataset de entrenamiento: https://huggingface.co/datasets/stanfordnlp/nnetnav-live
- Paper referenciado en las etiquetas del modelo (identificador arXiv 2410.02907): https://arxiv.org/abs/2410.02907
- Nota sobre la búsqueda web: los resultados obtenidos corresponden a entidades no relacionadas con el modelo (organismos y comercios con el nombre Atlas) y no aportan información adicional sobre Reflex Instinct 0.6B.

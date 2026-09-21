# aimeigaoshou/agent-jev

## Resumen

AgentJev-0.6B es un modelo de decisión desarrollado por el usuario aimeigaoshou (con el código alojado en la organización malevrigns de GitHub). No es un modelo generativo: se le entrega un estado (un diff, un stack trace, un hilo de tickets, una tabla serializada) junto con preguntas ya redactadas, y devuelve en una única pasada forward una distribución de probabilidad sobre las opciones que el propio usuario ha definido. El número de tokens decodificados es cero, lo que elimina el problema clásico de parsear JSON mal formado o de interpretar una frase confiada de un modelo grande cuando lo que se necesitaba era un booleano.

Técnicamente se construye sobre el backbone Qwen3-0.6B (598.418.689 parámetros según los pesos en safetensors, ~1,2 GB de repositorio) al que se le ha eliminado la cabeza de modelado de lenguaje. En su lugar incorpora una cabeza de candidatos permutation-equivariant y un scorer, de modo que el orden en que se pasan las opciones no introduce sesgo de ranking. Expone tres primitivas tipadas: booleana (proposición con criterios opcionales), de elección (entre 2 y 255 opciones) y de puntuación (entre 2 y 10 niveles ordenados).

Su relevancia actual está en el hueco que ocupa dentro de bucles de agentes: actúa como "reflejo" (system-one) bajo el turno de un modelo mayor, resolviendo decisiones de enrutado, gate o scoring sin gastar una generación completa. La ventana de contexto es de 2.048 tokens y, de forma deliberada, rechaza entradas que la excedan en lugar de recortarlas silenciosamente. La licencia es Apache-2.0 y los idiomas declarados son inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (backbone Qwen3-0.6B) sin cabeza de modelado de lenguaje; cabeza de candidatos permutation-equivariant + scorer; softmax por pregunta |
| Parametros totales | 598.418.689 (~0,6 B), dato de los pesos safetensors |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens; la entrada que excede el límite se rechaza con error, no se recorta |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors en precisión original; no se anuncian variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, ~1,2 GB de repositorio) |
| Pipeline declarado | text-classification |
| Modelo base | Qwen/Qwen3-0.6B (fine-tune) |
| Dataset de evaluación | LocalLLaMA/typed-decisions (split test) |
| Salida | Distribución de probabilidad, no texto; 0 tokens decodificados |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3-0.6B y prescinde de la cabeza de lenguaje. Cada candidato propuesto por el usuario se lee en su último token y una cabeza pequeña, permutation-equivariant, puntúa el conjunto completo: al ser equivariante a permutaciones, reordenar las opciones no altera la distribución resultante, de modo que no se cuela un ranking artificial según el orden de presentación. El softmax se calcula por pregunta, y los estados ocultos van directamente a logits sin paso por vocabulario de salida. Según la model card, un prefijo compartido se reutiliza entre los candidatos de una misma pregunta, lo que reduce el coste cuando se evalúan muchas opciones sobre un mismo estado.

Las tres primitivas tipadas que expone son: booleana (con `criteria` opcional para verdadero y falso, devuelve `value`, `probability` de verdadero y ambas masas), de elección (2 a 255 opciones descritas, devuelve `value`, `top_probability`, `margin` y el mapa completo) y de puntuación (2 a 10 niveles ordenados de menor a mayor, devuelve `level` por argmax y `score` = suma de i por Pᵢ). Los identificadores de pregunta existen para emparejar la respuesta y no se muestran al modelo. El ajuste se realizó sobre el dataset LocalLLaMA/typed-decisions; la model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otra etapa de alineamiento, por lo que esos extremos quedan como no disponibles. Tampoco se documenta si hubo destilación o congelación de capas del backbone.

## Capacidades

- Clasificación probabilística tipada: devuelve la distribución completa sobre las opciones, no solo el ganador.
- Decisión booleana: responde a proposiciones con la probabilidad de que sean verdaderas, admitiendo criterios opcionales para cada rama.
- Elección entre opciones: de 2 a 255 alternativas, cada una con su descripción, con métricas de `top_probability` y `margin` (diferencia entre la mejor y la segunda).
- Puntuación en rúbrica ordenada: de 2 a 10 niveles descritos de menor a mayor, con `score` esperado calculado como suma ponderada.
- Enrutado y gating dentro de bucles de agente: selección de herramienta siguiente, comprobación de condiciones de parada, verificación de precondiciones.
- Reutilización de prefijo compartido entre candidatos de una misma pregunta, útil cuando se evalúan muchas opciones sobre un estado fijo.
- Multilingüe limitado a inglés y chino, tanto en el estado de entrada como en el texto de las preguntas y opciones.
- No soporta tool calling, function calling, generación de texto, agentes multi-paso por sí mismo, visión, audio ni modo de razonamiento explícito: esas capacidades corresponden al modelo que lo orquesta.

## Casos de uso

- Enrutado de herramientas en agentes de código: dado un estado con el historial de la tarea y la lista de herramientas disponibles como opciones, el modelo devuelve la distribución sobre cuál invocar a continuación. Es adecuado porque evita gastar una generación completa de un modelo de 27B-70B solo para elegir herramienta, y porque el `margin` permite detectar casos ambiguos que conviene escalar.
- Gate de seguridad antes de ejecutar comandos: se plantea como booleana ("¿es seguro ejecutar este comando en este repositorio?") con criterios que describan qué se considera peligroso. Al devolver una probabilidad, el sistema puede fijar un umbral y derivar a revisión humana entre el umbral y su complementario, en lugar de depender de una frase del modelo.
- Triage de incidencias y tickets: el hilo del ticket se serializa como estado y se pregunta por categoría (elección entre N colas) y por severidad (puntuación en rúbrica de 2 a 10 niveles). Encaja porque el formato de salida es directamente consumible por el sistema de ticketing sin parsing.
- Verificación de resultados de test en CI/CD: el diff y la salida de la suite se pasan como estado y se pregunta de forma booleana si los tests pasaron y si el cambio es coherente con el objetivo declarado. La salida probabilística permite registrar la confianza junto al resultado del pipeline.
- Puntuación de calidad en pipelines de datos: clasificar pares pregunta-respuesta o fragmentos de código según rúbricas ordenadas (por ejemplo, corrección, completitud, estilo) para filtrar o priorizar datos de entrenamiento. El `score` esperado es una señal continua más informativa que una etiqueta discreta.
- Control de bucles multi-paso: decidir si el agente debe continuar, pedir aclaración o terminar, usando la primitiva de elección sobre un conjunto reducido de acciones. La reutilización de prefijo hace barato evaluar varias preguntas sobre el mismo estado.
- Preclasificación en atención al cliente: enrutar un mensaje entrante hacia el flujo adecuado o hacia un modelo mayor, siempre que la conversación esté en inglés o chino y quepa en 2.048 tokens.
- Señal de abstención: usar la probabilidad devuelta como criterio para decidir cuándo un sistema automático no debe actuar, aprovechando que el modelo expone la masa de probabilidad en lugar de una única etiqueta.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card, sobre el split de test de LocalLLaMA/typed-decisions (2.000 decisiones, según la imagen de portada del repositorio). Ninguno de los valores está marcado como verificado (`verified: false`).

| Metrica | Valor | Descripcion |
|---|---|---|
| Top-1 (accuracy) | 0,7925 | Acierto de la opción más probable |
| Soft cross-entropy | 0,8494 | Entropía cruzada contra la distribución objetivo |
| Brier | 0,0448 | Error cuadrático sobre las probabilidades |
| ECE | 0,1687 | Error de calibración esperado |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, IFEval u otros) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, los pesos ocupan aproximadamente 1,2 GB, más activaciones y la reutilización de prefijos de candidatos; un presupuesto de 2-3 GB es suficiente. En int8 bajaría a unos 0,6 GB y en int4 a unos 0,3 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 3060, RTX 4060, RTX 4090, L4, T4, A10). Las A100 o H100 no aportan ventaja por tamaño, solo por concurrencia y throughput agregado.
- Cabe holgadamente en GPU de consumo: sí, en la práctica totalidad de las GPU consumer recientes, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: el modelo no se carga con `AutoModelForCausalLM` ni es un modelo causal estándar, por lo que vLLM, TGI, llama.cpp u Ollama no son vías de despliegue directas según la documentación del autor. El servidor y el cliente propios están en el repositorio malevrigns/agent-jev, que incluye además una interfaz HTTP.
- Latencia y throughput estimados: no disponibles. Como referencia estructural, el coste por consulta es el de una única pasada forward sin decodificación autorregresiva, proporcional al número de candidatos y al prefijo compartido, pero no se publican cifras medidas.
- Nota operativa: toda entrada que supere los 2.048 tokens provoca un error explícito, por lo que el pipeline cliente debe truncar, resumir o trocear el estado antes de llamar al modelo.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparativos en la información proporcionada, por lo que la comparación se limita a dimensiones estructurales verificables.

| Modelo | Parametros | Naturaleza | Contexto | Licencia | Salida |
|---|---|---|---|---|---|
| AgentJev-0.6B | ~0,6 B (598.418.689) | Clasificador de decisiones sobre backbone Qwen3-0.6B | 2.048 tokens | Apache-2.0 | Distribución sobre opciones, 0 tokens decodificados |
| Qwen/Qwen3-0.6B | ~0,6 B | Modelo causal generativo | No disponible en esta ficha | Apache-2.0 | Texto generado token a token |
| Modelo generativo grande (27B-70B) usado como router | 27-70 B | Modelo causal generativo | Amplio | Variable | Texto que hay que parsear a JSON o a booleano |
| Clasificador encoder tipo BERT/DeBERTa | 0,1-0,4 B | Clasificador de etiquetas fijas | 512-8.192 tokens según variante | Variable (MIT, Apache-2.0) | Etiqueta fija o logits por clase predefinida |

Frente a un modelo causal del mismo tamaño, la diferencia práctica es que AgentJev no genera texto y por tanto no requiere reparación de salida. Frente a un clasificador encoder clásico, la diferencia es que las opciones son dinámicas (2-255 alternativas descritas en la propia llamada) y no un conjunto fijo decidido en el momento del entrenamiento, además de exponer tres primitivas distintas en lugar de una sola tarea. Rendimiento comparativo cuantitativo: no disponible.

## Limitaciones y advertencias

- Calibración mejorable: el ECE declarado es 0,1687, relativamente alto, de modo que las probabilidades no deben tratarse como frecuencias fiables sin recalibración sobre datos propios antes de usarlas para umbrales automáticos.
- Ningún resultado está verificado: las cuatro métricas del model-index figuran con `verified: false` y proceden del propio autor, sin artefacto de evaluación independiente publicado en la información disponible.
- Adopción nula: 0 descargas y 0 likes en HuggingFace, sin validación por parte de terceros ni informes de uso en producción.
- `margin` en la primitiva de elección no es una probabilidad de éxito: la model card advierte explícitamente de que es la preferencia dentro del conjunto pasado. Para obtener una probabilidad real de éxito hay que plantear una booleana por acción y calibrarla con resultados propios.
- Contexto limitado y estricto: 2.048 tokens, con rechazo de la entrada si se excede. Diffs, trazas o hilos largos deben resumirse o trocearse antes de la llamada.
- Idioma restringido: solo inglés y chino declarados. El castellano no está soportado oficialmente, lo que limita su uso directo en flujos en español sin validación previa.
- El significado debe residir en el texto de la pregunta y de las opciones: los identificadores no se muestran al modelo, así que una formulación ambigua produce una distribución poco fiable.
- Sin generación de texto: no puede usarse como sustituto de un modelo de lenguaje, y `AutoModelForCausalLM` no lo carga. Requiere el servidor y el cliente del repositorio GitHub del autor.
- Sin formatos cuantizados publicados: no hay GGUF, AWQ ni GPTQ, lo que descarta llama.cpp, Ollama y buena parte de los pipelines de despliegue habituales sin conversión propia.
- Sesgos heredados: al ser un fine-tune de Qwen/Qwen3-0.6B, arrastra los sesgos del backbone y los del dataset LocalLLaMA/typed-decisions, cuya composición y proceso de anotación no se documentan en la model card.
- Riesgo de alucinación estructuralmente bajo en el sentido clásico (no produce texto libre), pero existe riesgo de sobreconfianza en la distribución y de fallo silencioso si las opciones no cubren el espacio real de decisión.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución, sin restricciones adicionales conocidas, pero conviene revisar el LICENSE del repositorio GitHub por si añade términos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aimeigaoshou/agent-jev
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de evaluación: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Repositorio de código (servidor y cliente): https://github.com/malevrigns/agent-jev
- Licencia del repositorio: https://github.com/malevrigns/agent-jev/blob/main/LICENSE
- Model card en chino: https://huggingface.co/aimeigaoshou/agent-jev/blob/main/README_zh.md

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo (los resultados correspondían a páginas corporativas de Microsoft sin relación con AgentJev). No se han encontrado papers, blogs técnicos ni demos adicionales en la información disponible.

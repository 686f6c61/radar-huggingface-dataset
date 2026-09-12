# Kai9987kai/supermix-v89

## Resumen

Supermix v89 es un modelo de investigación de 30,2 millones de parámetros (30.214.269 en total, 5.696.493 activos por token) publicado por el usuario Kai9987kai en Hugging Face. Se trata de un modelo de arquitectura de mezcla de expertos (MoE) entrenado específicamente para resolver problemas de física, química, aritmética y trazado de ejecución de código Python escribiendo su razonamiento paso a paso. No es un modelo conversacional: su autor lo declara explícitamente como una herramienta de resolución de problemas con formato de salida fijo, no como un asistente de chat.

Su relevancia es doble. Por un lado, es un caso de estudio poco habitual de verificación de datos de entrenamiento a gran escala: cada fila del corpus fue validada antes del entrenamiento, la parte científica por un solver simbólico exacto y la parte de código ejecutando el fragmento real. Por otro, la model card documenta con detalle inusual un experimento controlado sobre división larga, con tablas de resultados por tarea, intervalos de confianza de Wilson, una prueba de McNemar exacta y el reconocimiento explícito de un error de diseño del corpus que degradó la tarea `average`.

El modelo usa una longitud de secuencia de entrenamiento de 128 tokens, lo que limita drásticamente cualquier uso que requiera contexto largo. Su rendimiento declarado en el benchmark propio del autor es de 0,919 sobre 630 problemas, con 0 respuestas no parseables y 0 truncadas, y de 0,963 en las nueve tareas de trazado de código. La comparación emparejada con la versión anterior, supermix-v88, da una diferencia estadísticamente no significativa (p = 0,78), que sin embargo esconde una mejora de +0,524 en la tarea `power` y un retroceso de −0,286 en `average`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (mixture-of-experts, MoE), transformer; detalles de capas no disponibles |
| Parámetros totales | 30.214.269 |
| Parámetros activos | 5.696.493 por token |
| Longitud de contexto | 128 tokens (longitud de secuencia usada en entrenamiento; el autor no declara una ventana mayor) |
| Tipos de cuantización | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible (los ejemplos y el corpus documentado están en inglés) |
| Licencia | no disponible (la ficha de Hugging Face no declara licencia) |
| Formato de pesos | no disponible (repositorio PyTorch de 0,1 GB; no se indica si los pesos están en safetensors, bin o GGUF) |
| Pipeline | text-generation |
| Biblioteca | pytorch |
| Tamaño del repositorio | 0,1 GB |
| Fecha de creación | 2026-09-12 |
| Última actualización | 2026-09-12 |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de una mezcla de expertos con 30,2 millones de parámetros totales y 5,7 millones activos por token, es decir, una ratio de activación cercana al 19 %. No se detallan el número de expertos, la estrategia de enrutamiento, el número de capas ni la dimensión del modelo. El entrenamiento se realizó durante 24.250 pasos con longitud de secuencia 128, con el presupuesto fijado en tokens; la model card se corta justo al llegar al apartado de la tasa de aprendizaje, por lo que ese y otros hiperparámetros no están disponibles en la información proporcionada.

El corpus consta de 1.156.108 filas: 480.000 de ciencia verificadas por un solver simbólico, 400.000 de aritmética, 180.000 de código verificadas por ejecución y 96.108 de diálogo. La innovación técnica central es la generación de trazas de división larga ejecutables hacia delante: cada número del razonamiento está en la página o a un único «bring-down» de distancia, y el script `test_long_division.py` comprueba mecánicamente esa propiedad en cada fila generada. Ese test detectó dos errores antes del entrenamiento: un cociente con un cero interno cuyo rastro se leía como `16` en lugar de `106`, y una cola de filas que excedía el presupuesto de secuencia aunque la mediana pareciera holgada. El contraste con el intento anterior de la familia (v87, con `decompose_quotient`) es revelador: aquel enfoque retrocalculaba cada dividendo parcial a partir de la respuesta, de modo que el formato era una presentación válida del resultado pero no un procedimiento ejecutable; el resultado fue un desplome de `power` de 0,333 a 0,048.

El autor también documenta un fallo de diseño en este mismo entrenamiento. El corpus de v89 se construyó con un flag que desplaza un operando para evitar medias periódicas como `59.333333333333336`, presentes en el 22 % de los problemas de `average`. Ese flag estrechó la distribución de entrenamiento, pero no la del evaluador: las tareas de física comparten generador con el evaluador y ambas cambian juntas, mientras que `eval_problem_solving._average` es una función independiente que no se tocó. El resultado es que el modelo se entrenó sobre una distribución más estrecha que aquella en la que se evalúa, y sus respuestas muestran errores estructurales que v88 no cometía (un operando sumado dos veces, cuatro números divididos entre cinco). El error se diagnosticó en el paso 15.000 de 24.250 y se dejó terminar la ejecución porque el objetivo del experimento era la rama de división larga. Además, se amplió el banco de formulaciones de prompt con registro coloquial, contracciones y puntuación ausente, reservando tres formas por tarea como conjunto de generalización.

## Capacidades

- Resolución de problemas de física con cálculo intermedio explícito: potencia, aceleración, molaridad y problemas verbales de varios pasos.
- Aritmética: operaciones básicas, porcentajes, medias, división (con traza de división larga) y problemas de dos pasos.
- Química a nivel de cálculo de molaridad y operaciones asociadas.
- Trazado de ejecución de código Python: nueve tareas específicas de code-tracing con una puntuación de 0,963 (182/189).
- Generación de razonamiento en formato de cadena de pensamiento (chain-of-thought) con la operación intermedia escrita, no solo el resultado final.
- Comprensión de formulaciones de prompt variadas (registro informal, contracciones, aperturas de relleno) cuando se antepone un `prompt_normaliser` que reescribe la entrada a la forma entrenada.
- No dispone de capacidad de conversación, tool calling, function calling, uso de agentes, visión, audio ni razonamiento multi-turno: no hay ninguna evidencia de ello en la información disponible.

## Casos de uso

- Generación de datos sintéticos verificables para entrenar modelos mayores: cada respuesta correcta va acompañada de una traza paso a paso validada por solver simbólico o por ejecución, lo que permite reutilizar esas trazas como corpus de destilación de razonamiento aritmético.
- Investigación sobre mezclas de expertos de grano fino: con 5,7 millones de parámetros activos sobre 30,2 millones totales, es un banco de pruebas barato para estudiar enrutamiento, equilibrio de expertos y coste real de inferencia en MoE.
- Evaluación de razonamiento aritmético en el edge: al ser un modelo de 30 millones de parámetros, cabe en CPU y en microcontroladores de gama alta, lo que permite medir precisión de razonamiento sin GPU ni servicio externo.
- Trazado de código con fines didácticos: las nueve tareas de code-tracing al 0,963 pueden usarse para generar explicaciones paso a paso de fragmentos Python cortos, útiles en materiales de enseñanza de programación.
- Componente de normalización de entrada en una interfaz mayor: el `prompt_normaliser` documentado eleva la precisión sobre formulaciones no vistas de 0,6967 a 0,8567, de modo que puede actuar como capa de preprocesado delante de un modelo de resolución de problemas.
- Estudio de robustez ante distribución desplazada: la regresión de `average` (−0,286) es un caso documentado y reproducible de cómo un flag de corpus puede estrechar el entrenamiento sin tocar el evaluador; sirve como material de docencia en diseño de experimentos.
- Aprendizaje de procedimientos aritméticos escolares: la traza de división larga, con cada dígito del cociente justificado en la página, es directamente legible como explicación para niveles de primaria y secundaria.
- Verificación de pipelines de datos científicos: el patrón de validar cada fila con un solver simbólico exacto antes de entrenar es reutilizable como plantilla para otros dominios con verificador formal.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card. Las comparaciones por tarea tienen n = 21, donde el intervalo de Wilson del 95 % llega a ±20 puntos en su punto más ancho.

Benchmark propio de 30 tareas (630 problemas):

| Métrica | Valor |
|---|---|
| Precisión global | 0,919, IC 95 % [0,895, 0,938] |
| Problemas evaluados | 630 |
| Respuestas no parseables | 0 |
| Respuestas truncadas | 0 |
| Tareas de code-tracing (9 tareas) | 0,963 (182/189) |

Comparación emparejada con supermix-v88 en los mismos problemas, misma semilla 65 y mismo límite de 96 tokens:

| Modelo | n | Precisión |
|---|---|---|
| supermix-v88 | 439 | 0,8929 |
| supermix-v89 | 439 | 0,8998 |

v89 gana 27 problemas y v88 gana 24; prueba de McNemar exacta bilateral p = 0,78, diferencia no significativa.

Desglose por tarea (n = 21 por fila):

| Tarea | v88 | v89 | Delta | Nota |
|---|---|---|---|---|
| `power` | 0,286 | 0,810 | +0,524 | división larga |
| `molarity` | 0,857 | 0,952 | +0,095 | división larga |
| `acceleration` | 0,714 | 0,762 | +0,048 | división larga |
| `word_problem` | 0,857 | 0,905 | +0,048 | |
| `arithmetic` | 0,810 | 0,857 | +0,048 | |
| `division` | 1,000 | 0,952 | −0,048 | |
| `percent` | 0,857 | 0,714 | −0,143 | dentro del intervalo |
| `two_step` | 0,667 | 0,524 | −0,143 | dentro del intervalo |
| `average` | 0,714 | 0,429 | −0,286 | error de diseño del corpus |

Análisis de errores de v88 (50 respuestas incorrectas) clasificado por la primera operación que falla: división en un solo salto, 29 casos (58 %); resta, 13 (26 %); ningún paso falso escrito, 5 (10 %). `power` por sí sola representaba el 30 % de todos los errores de v88.

Comprensión de prompt sobre formulaciones no vistas (medido sobre v88, misma rama de corpus):

| Configuración | Precisión en formulación reservada | Brecha frente a lo entrenado |
|---|---|---|
| Entrada bruta | 0,6967 | +0,2333 |
| Con `prompt_normaliser` | 0,8567 | +0,0800 |

No se han publicado resultados en la información disponible para MMLU, HumanEval, GSM8K ni ningún otro benchmark externo estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 60 MB de pesos más el estado del optimizador y las activaciones, en total del orden de 0,1 a 0,3 GB; en int8, unos 30 MB; en int4, unos 15 MB. Son estimaciones derivadas del recuento de parámetros, no cifras publicadas por el autor.
- GPU recomendadas: ninguna en particular. Cualquier GPU con más de 1 GB de memoria es sobradamente suficiente, incluidas GTX 1050, RTX 3050, RTX 4090, A100 y H100. El modelo está limitado por latencia, no por memoria.
- Cabe holgadamente en GPU de consumo: sí, en todas las GPU dedicadas modernas e incluso en iGPU integradas.
- Ejecución en CPU: viable y probablemente el entorno natural del modelo, dado su tamaño. También es candidato a ejecutarse en dispositivos de borde tipo Raspberry Pi.
- Opciones de despliegue: PyTorch nativo (biblioteca declarada en el repositorio). vLLM, TGI y ollama no están confirmados para este modelo; llama.cpp u ollama exigirían una conversión a GGUF que no se distribuye. La model card menciona además un script `test_long_division.py` y un componente `prompt_normaliser` como parte del pipeline de uso.
- Latencia y throughput: no disponibles. Con 5,7 millones de parámetros activos por token y secuencias de 128 tokens, el coste por petición es muy bajo, pero no se publican mediciones.

## Comparativa con modelos similares

La comparación directa disponible en la información proporcionada es con la versión anterior de la misma familia. Los modelos de referencia de escala similar se incluyen únicamente como contexto de ecosistema: las cifras de esos dos provienen de conocimiento general del sector y no de la búsqueda web, y no existe ninguna comparación cabeza a cabeza publicada con supermix-v89 en las mismas tareas.

| Modelo | Parámetros | Contexto | Precisión en benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| supermix-v89 | 30,2 M totales / 5,7 M activos (MoE) | 128 tokens | 0,919 en el benchmark propio del autor (630 problemas) | no disponible | Hugging Face, repositorio PyTorch |
| supermix-v88 | no disponible en la información proporcionada | no disponible | 0,8929 en 439 problemas emparejados | no disponible | Hugging Face |
| SmolLM2-135M (referencia de escala) | 135 M | no aplicable a esta comparación | no disponible | no disponible en esta ficha | no aplicable a esta comparación |
| Qwen2.5-0.5B (referencia de escala) | ~0,49 B | no aplicable a esta comparación | no disponible | no disponible en esta ficha | no aplicable a esta comparación |

Advertencia importante: supermix-v89 y supermix-v88 solo son comparables entre sí en el conjunto de tareas del propio autor, con n = 21 por tarea y un benchmark diseñado por el mismo desarrollador. Cualquier comparación con modelos de propósito general sería engañosa, porque el dominio de evaluación es completamente distinto.

## Limitaciones y advertencias

- No es un modelo de chat. El propio autor lo declara así; usarlo como asistente conversacional producirá resultados fuera de su distribución de entrenamiento.
- Longitud de contexto de 128 tokens. No admite documentos largos, conversaciones multi-turno extensas ni entradas con muchas variables.
- Regresión documentada y no corregida en la tarea `average`: de 0,714 a 0,429, causada por un flag de corpus que estrechó la distribución de entrenamiento sin modificar el evaluador. También hay caídas en `two_step` (de 0,667 a 0,524) y `percent` (de 0,857 a 0,714), aunque ambas dentro del intervalo de confianza.
- El benchmark es interno y lo diseña el mismo autor del modelo. Las filas por tarea tienen n = 21 y, como reconoce la propia model card, el intervalo de Wilson del 95 % alcanza ±20 puntos en el peor caso.
- La comparación global con v88 no es estadísticamente significativa (p = 0,78), de modo que la afirmación de mejora solo se sostiene a nivel de tarea concreta, no en el agregado.
- La licencia no está declarada. Sin licencia explícita, el uso comercial es jurídicamente incierto y no se puede asumir permiso de redistribución.
- Los idiomas soportados no están declarados y todo el material documentado está en inglés; el comportamiento en castellano es desconocido.
- La comprensión de prompts informales es limitada: sin el `prompt_normaliser`, la precisión sobre formulaciones no vistas cae a 0,6967, con una brecha de 0,2333 frente a las formas entrenadas.
- Riesgo de alucinación en los pasos intermedios: el modelo escribe la operación que cree correcta, como demuestra el caso de v88 escribiendo `5712 / 48 = 114`. La traza es plausible pero puede ser aritméticamente falsa, y no hay verificación en tiempo de inferencia.
- La model card está truncada en el apartado de entrenamiento, justo en la tasa de aprendizaje, por lo que no se puede reproducir el entrenamiento con la información disponible.
- Sin datos de sesgo, sin evaluación de terceros, con 0 descargas y 0 me gusta en el momento de la consulta: es un artefacto de investigación sin validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kai9987kai/supermix-v89
- Versión anterior de la misma familia, supermix-v88: https://huggingface.co/Kai9987kai/supermix-v88
- La búsqueda web realizada no ha devuelto ningún resultado relevante sobre este modelo: los enlaces obtenidos no guardan relación con el contenido y se omiten.
- El script `test_long_division.py` y el componente `prompt_normaliser` se mencionan en la model card, pero no se proporciona enlace público a ellos en la información disponible.

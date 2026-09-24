# alibiserikbay/JevK5

## Resumen

JevK5 v0.2 es un modelo de decisiones tipadas («system one») publicado por el usuario alibiserikbay como alternativa abierta a Jev, el modelo propietario de TypeSafe AI. No es un generador de texto: recibe un estado y una pregunta de tipo sí/no (`noul`), elección múltiple o puntuación, y devuelve una probabilidad para cada opción en una sola pasada forward, con cero tokens generados. Los pesos se publican bajo licencia Apache-2.0 y el propio autor indica explícitamente que ni el modelo ni su arquitectura son de TypeSafe AI ni están afiliados a esa empresa.

El modelo parte de Qwen3.5-4B (4.205.751.296 parámetros en safetensors) con un LoRA de rango 16 sobre las proyecciones de atención fusionado en los pesos. La lectura de decisiones sigue el protocolo SemIf: un softmax sobre los logits del siguiente token de las letras de respuesta, dividido por una temperatura de calibración fija (T = 1,532, definida en `jevk5_config.json`). Se distribuye con un runtime propio (`github.com/allebee/jevk5`) que sirve un endpoint `/v1/systemone` al estilo de TypeSafe y que emplea una CUDA graph por longitud de entrada, con una latencia de ~13 ms por decisión en una H100.

Su relevancia actual es doble. Por un lado, ocupa el puesto 2 de 76 sistemas y el 1 entre los participantes abiertos en la puntuación compuesta de JevBench v1.4 (62,04 frente a 63,29 de Jev 1.13.0). Por otro, y de forma más importante para quien vaya a desplegarlo, la diferencia entre su precisión sobre los 231 ítems públicos de JevBench (85,3 %) y sobre las 308 decisiones selladas nuevas (33,1 %) muestra con claridad que el rendimiento en banco de pruebas no equivale a rendimiento en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredado de Qwen3.5-4B (variante de texto, etiqueta `qwen3_5_text`), con LoRA de rango 16 sobre las proyecciones de atención fusionado en los pesos |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | No disponible (la información proporcionada no describe una arquitectura MoE) |
| Longitud de contexto | No disponible (las entradas observadas en las pruebas van de 164 a 1.274 tokens; los ítems hard usan documentos de 1.000 a 4.000 tokens) |
| Tipos de cuantizacion | GGUF Q8_0 confirmado en el repositorio `JevK5-GGUF`; otras cuantizaciones, no disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (transformers); GGUF en repositorio aparte |
| Modelo base | Qwen/Qwen3.5-4B |
| Temperatura de calibracion | 1,532 (`jevk5_config.json`) |
| Tamano del repositorio | 16,8 GB |
| Descargas / likes | 295 descargas, 1 like (a fecha de la información proporcionada) |

## Arquitectura y entrenamiento

JevK5 es un modelo destilado de un modelo que razona: Qwen3.6-27B (Apache-2.0) con el modo thinking activado generó documentos realistas con preguntas tipadas difíciles (pólizas con excepciones, trampas de fechas y números, búsquedas de varios pasos, evaluación de respuestas, ambigüedad, notas engañosas, instrucciones inyectadas, precedencia de reglas, enrutamiento, extracción y rúbricas) a lo largo de 17 dominios de negocio. El teacher respondió cada pregunta dos veces de forma independiente y solo se conservaron aquellas en las que ambas respuestas coincidían con la esperada; además, las claves de las opciones se reconstruyeron a partir del texto de las opciones para que ninguna clave insinuara la respuesta correcta. El conjunto final son 3.272 preguntas de este tipo (la v0.1 usaba 1.635) más un número equivalente de ítems etiquetados por humanos procedentes de MMLU-Pro (MIT), WANLI (CC BY 4.0), MultiNLI, BoolQ (CC BY-SA 3.0), banking77 (CC BY 4.0), ARC (CC BY-SA 4.0) y CommonsenseQA (MIT). El entrenamiento fue de entropía cruzada sobre los logits de las letras de opción, 2 épocas, tasa de aprendizaje 3e-5 y el formato de prompt de SemIf. Las preguntas cuya respuesta es una distribución se entrenan contra esa distribución exacta en lugar de contra una única letra; este checkpoint contiene 9 de esas preguntas, como piloto de la familia. La temperatura de calibración se ajustó sobre preguntas del teacher de tres dominios que el entrenamiento nunca vio (arrendamientos residenciales, permisos del sector público y control de calidad en fabricación), donde la precisión es del 80,4 %; una temperatura por tipo de pregunta y el promedio de dos órdenes de opciones se midieron sobre esos datos retenidos y sobre un conjunto difícil escrito a mano, y ambas alternativas se descartaron. El autor afirma que ningún ítem de JevBench, público o retenido, ni ninguna salida de Jev se usó para entrenar, ajustar o seleccionar el modelo.

La innovación técnica no está en la arquitectura (es un transformer denso con un LoRA fusionado), sino en el protocolo de lectura. El runtime no genera tokens: aplica el protocolo SemIf, es decir, un softmax sobre los logits del siguiente token correspondientes a las letras de las opciones, normalizado por la temperatura de calibración. Esto produce una distribución de probabilidad sobre las opciones en una sola pasada, con cero tokens de salida. El runtime citado compila una CUDA graph por cada longitud de entrada con relleno (*padding*), de modo que la latencia baja a ~13 ms por decisión en una H100, frente a los ~70 ms de la misma inferencia en transformers en modo eager, con idénticas respuestas. Existe además `JevK5-2B`, la misma receta sobre Qwen3.5-2B, con la mitad de memoria (3,5 GB) y 0,751 frente al 0,804 de este modelo en las preguntas retenidas del teacher.

## Capacidades

- Decisiones tipadas con probabilidad: dada una pregunta de sí/no (`noul`), de elección entre varias opciones o de puntuación, devuelve una probabilidad por opción en una única pasada forward, sin generar texto.
- Calibración explícita: la salida incluye confianza calibrada mediante una temperatura fija (T = 1,532), lo que permite fijar umbrales de abstención o de escalado a un modelo mayor.
- Respuestas distribucionales: para preguntas cuya respuesta correcta es una distribución, el modelo se entrenó contra esa distribución exacta; este checkpoint incluye 9 preguntas de ese tipo.
- Razonamiento sobre documentos: los ítems difíciles incluyen documentos de 1.000 a 4.000 tokens con excepciones, precedencia de reglas, instrucciones inyectadas y trampas de fechas y números.
- Tareas de clasificación y juicio: enrutamiento, extracción, evaluación de respuestas y rúbricas forman parte del conjunto de entrenamiento, junto con NLI (WANLI, MultiNLI), BoolQ, ARC, CommonsenseQA y banking77.
- Latencia muy baja: ~13 ms por decisión en H100 con CUDA graphs, sin coste de tokens de salida.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible (no es un modelo generativo ni un agente).
- Capacidades multilingües: no; el modelo está etiquetado únicamente para inglés (`en`).
- Visión, audio u otras modalidades: no disponible (variante de texto).
- Modo thinking: no; el «pensamiento» reside en el teacher (Qwen3.6-27B) del que se destila, no en el modelo final.

## Casos de uso

- Enrutamiento de tickets en banca: clasificar una consulta entrante según categorías tipo banking77 y obtener la probabilidad de cada categoría en una sola pasada; si la probabilidad máxima queda por debajo de un umbral, el ticket se deriva a un humano en lugar de enrutarse automáticamente. La calibración explícita es lo que hace viable ese umbral.
- Verificación de elegibilidad en el sector público: evaluar si una solicitud cumple los requisitos de un permiso a partir de un expediente con excepciones y plazos. El dominio de permisos del sector público se usó precisamente para ajustar la temperatura, lo que indica que el comportamiento en este tipo de documento fue objeto de medición directa.
- Control de calidad en fabricación: decidir si un lote cumple los criterios de un protocolo a partir de un informe de 1.000 a 4.000 tokens. Son los ítems «hard» del banco de pruebas (p50 de 30 ms, p95 de 161 ms), el escenario donde el modelo aporta más frente a la opción de generar texto.
- Revisión de contratos de arrendamiento residencial: responder preguntas binarias del tipo «¿esta cláusula permite X?» con una probabilidad asociada. El dominio de arrendamientos residenciales también formó parte del conjunto de calibración retenido.
- Puerta de bajo coste delante de un LLM grande: usar JevK5 como primer filtro para decisiones simples (¿es esta consulta un caso de facturación?, ¿este texto es una queja?) y escalar solo los casos ambiguos a un modelo generativo. Al no emitir tokens de salida y resolverse en decenas de milisegundos, el coste marginal por decisión es muy bajo.
- Evaluación automática de respuestas (LLM-as-judge restringido): decidir si una respuesta candidata satisface una rúbrica, devolviendo una probabilidad en lugar de un texto libre. El conjunto de entrenamiento incluye explícitamente tareas de «judging answers» y rúbricas.
- Filtrado y anotación de corpus: clasificación de implicación (NLI) y respuesta a preguntas binarias (BoolQ) sobre grandes volúmenes de texto, aprovechando el Q8_0 para ejecutar en CPU o en GPUs no NVIDIA.
- Validación de extracción de datos: comprobar que un campo extraído por otro sistema cumple una regla del documento original antes de escribirlo en el sistema de destino, con una decisión binaria acompañada de probabilidad.
- Moderación de contenido con umbral calibrado: sustituir un clasificador entrenado a medida por un modelo que ya devuelve probabilidades calibradas y admite nuevas políticas mediante prompt, sin reentrenamiento.

## Benchmarks y rendimiento

Resultados en los 231 ítems públicos de JevBench v1.2, ejecutados con el runner propio de JevBench (adaptador `jevk5_direct`): 231/231 válidos, 0 fallos. La fila «sin entrenar» es el mismo modelo base y el mismo prompt sin el LoRA ni la temperatura (sus respuestas coinciden con los resultados públicos oficiales de SemIf en 231/231 ítems).

| Split | n | Qwen3.5-4B sin entrenar | JevK5 v0.1 | JevK5 v0.2 | ECE v0.2 |
|---|---:|---:|---:|---:|---:|
| easy | 48 | 1,000 | 1,000 | 1,000 | 0,038 |
| original (standard) | 72 | 0,986 | 0,958 | 0,958 | 0,141 |
| hard (mitad pública) | 111 | 0,613 | 0,676 | 0,739 | 0,066 (sin entrenar 0,117) |

En el nivel difícil, la v0.2 corrige 21 ítems del modelo sin entrenar y rompe 7 (McNemar p = 0,013). La distancia a las distribuciones oro exactas en los 10 ítems públicos de probabilidad es de 0,196 (frente a 0,296 en la v0.1).

JevBench v1.4 (evaluación independiente):

| Metrica | Valor |
|---|---|
| Puntuación compuesta | 62,04 (puesto 2 de 76 sistemas, 1 entre los participantes abiertos) |
| Puntuación compuesta de Jev 1.13.0 | 63,29 |
| Precisión en 308 decisiones selladas nuevas | 33,1 % (Jev: 36,7 %) |
| Precisión en 231 decisiones públicas | 85,3 % (Jev: 86,6 %) |

Latencia medida en H100, en proceso, batch 1, con CUDA graphs:

| Metrica | Valor |
|---|---|
| p50 en ítems easy y standard | 13,5 ms (p95: 14,9 ms) |
| p50 en ítems hard con documentos de 1-4k tokens | 30 ms (p95: 161 ms) |
| Alternativa en transformers eager | ~70 ms, mismas respuestas |
| Tokens de entrada por decisión | 164 (easy), 168 (standard), 1.274 (hard) |
| Tokens de salida por decisión | 0 |

Otros datos de rendimiento: precisión del 80,4 % en las preguntas retenidas del teacher (tres dominios no vistos), frente al 0,751 de la variante de 2B; la compilación GGUF Q8_0 da la misma respuesta que estos pesos en 228 de los 231 ítems públicos de JevBench. No se han publicado resultados en benchmarks estándar de generación (MMLU, HumanEval, GSM8K, etc.) en la información disponible, y en sentido estricto no son aplicables, porque el modelo no genera texto.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 4,2 B de parámetros, no una medición publicada): ~8,4 GB solo de pesos en BF16, más activaciones y caché KV; en la práctica, unos 10-12 GB de VRAM con margen. En GGUF Q8_0, aproximadamente 4,5 GB; en cuantizaciones de 4 bits, alrededor de 2,5-3 GB (estas dos últimas son estimaciones; solo Q8_0 está confirmada).
- GPU recomendadas: la medición publicada se hizo en una H100. Cualquier GPU con 16 GB o más (RTX 4090, RTX 4080, A100 40 GB, L40S) ejecuta el modelo en BF16 sin problemas.
- Cabe en GPU de consumo: sí. Una RTX 4090 o RTX 3090 (24 GB) lo ejecuta en BF16; tarjetas de 12 GB o menos (RTX 3060 12 GB, RTX 4070) necesitan cuantización de 8 o 4 bits.
- Sin GPU: la compilación GGUF permite ejecutarlo en CPU y en GPUs de NVIDIA, AMD, Intel y Apple mediante llama.cpp.
- Opciones de despliegue: el runtime propio `github.com/allebee/jevk5` es la vía recomendada, ya que sirve el endpoint `/v1/systemone` y aplica las CUDA graphs y la temperatura de calibración. Alternativamente, transformers en modo eager (con la advertencia de que los ejemplos genéricos de `generate()` de HuggingFace no realizan la lectura de decisión de JevK5) o llama.cpp/Ollama mediante el repositorio GGUF. Soporte en vLLM o TGI: no disponible.
- Latencia y throughput: latencia p50 de 13,5 ms y p95 de 14,9 ms en ítems fáciles y estándar; p50 de 30 ms y p95 de 161 ms en ítems difíciles con documentos largos, todo en H100 y batch 1. No se ha publicado throughput con lotes mayores ni latencia en otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench v1.4 (compuesto) | Precision, 231 publicos / 308 sellados | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| JevK5 v0.2 | 4,2 B | No disponible | 62,04 | 85,3 % / 33,1 % | Apache-2.0 | Pesos abiertos en HuggingFace |
| Jev 1.13.0 (TypeSafe AI) | No disponible | No disponible | 63,29 | 86,6 % / 36,7 % | Propietaria | API (entrada desde 0,042 USD por millón; tokens de salida gratuitos; 70-500 ms) |
| JevK5-2B | ~2 B | No disponible | No disponible | No disponible (0,751 en preguntas retenidas del teacher, frente a 0,804) | No disponible | Pesos abiertos; 3,5 GB de memoria |
| Qwen3.5-4B sin LoRA (referencia interna) | 4,2 B | No disponible | No disponible | 61,3 % en el nivel hard público / no disponible | No disponible en la información proporcionada | Base pública |

La comparación con Jev es la más relevante, pero el propio evaluador de JevBench advierte que las diferencias pequeñas sobre el conjunto sellado no demuestran superioridad por pares. Frente a la variante de 2B, la elección es un compromiso directo entre memoria y precisión. No se dispone de comparaciones con otros modelos de decisión tipada de código abierto en la información proporcionada.

## Limitaciones y advertencias

- La precisión cae en picado sobre las decisiones selladas nuevas de JevBench: 33,1 % frente al 85,3 % en los ítems públicos. El rendimiento en flujos de trabajo reales frente a Jev no se ha medido.
- No es un modelo generativo. Llamar a `generate()` con los ejemplos genéricos del Hub no realiza la lectura de decisión; sin el runtime y la temperatura de calibración, la salida no es la prevista.
- Solo inglés. No hay soporte multilingüe declarado.
- La longitud de contexto no está documentada. Los documentos más largos observados en las pruebas son de 1.000 a 4.000 tokens; superar ese rango no está validado.
- La model card reconoced una corrección: el conjunto de calibración escrito a mano reproducía una instrucción pública y el enunciado de las reglas de un ítem público de JevBench. Ambos se reescribieron y el efecto se describe en el `CHANGELOG.md` del repositorio. Es un indicio de contaminación parcial en el proceso, aunque acotado y documentado por el autor.
- La model card enumera «puntos débiles conocidos» y menciona dos ítems del nivel standard que el modelo sin entrenar acierta y JevK5 falla; el texto disponible está truncado en ese punto.
- Calibración residual imperfecta: el ECE es de 0,066 en el nivel difícil y de 0,141 en el nivel standard, de modo que las probabilidades no deben tratarse como exactas.
- El autor declara no estar afiliado a TypeSafe AI y que JevK5 no es el modelo ni la arquitectura de Jev; «Jev» es una marca de terceros.
- Licencia Apache-2.0, que permite uso comercial, pero el modelo base Qwen3.5-4B y los conjuntos de datos derivados arrastran sus propias condiciones (MIT, CC BY 4.0, CC BY-SA 3.0), incluida la cláusula de compartir igual de CC BY-SA que afecta a los datos de BoolQ y ARC.
- Validación comunitaria muy escasa: 295 descargas y 1 like a fecha de la información, con un único evaluador independiente.
- Los resultados publicados son puntuaciones de banco de pruebas, no una medida de calidad en producción, tal como advierte el propio evaluador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alibiserikbay/JevK5
- Runtime de JevK5: https://github.com/allebee/jevk5
- Compilaciones GGUF: https://huggingface.co/alibiserikbay/JevK5-GGUF
- Variante de 2B: https://huggingface.co/alibiserikbay/JevK5-2B
- Perfil del autor: https://huggingface.co/alibiserikbay
- JevBench (evaluación independiente): https://github.com/fstandhartinger/jevbench
- Resultados agregados de JevBench v1.4: https://github.com/fstandhartinger/jevbench/blob/main/results/v1.4/jevbench-v1.4-results.json
- Protocolo SemIf: https://huggingface.co/TheoLeeCJ/SemIf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Jev (modelo propietario), en Wikipedia: https://en.wikipedia.org/wiki/Jev_(AI_model)
- Sitio de Jev AI: https://jevai.net/

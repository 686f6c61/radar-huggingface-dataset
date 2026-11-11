# dddsky/dobottrack

## Resumen

DobotTrack es un modelo de visión-lenguaje-acción (VLA) orientado a robótica, publicado por el usuario dddsky en Hugging Face. Se construye sobre InternVL3-1B, un modelo multimodal de aproximadamente mil millones de parámetros, y lo adapta a la generación de trayectorias de manipulación robótica. El modelo no es un VLM de propósito general, sino un componente especializado que transforma observaciones visuales e instrucciones en comandos de trayectoria ejecutables por un brazo robótico.

La propuesta técnica del modelo se apoya en tres decisiones concretas: un esquema de *grounding* denominado Box-before-Action, que obliga al modelo a localizar el objeto relevante mediante una caja delimitadora antes de emitir la acción; una compresión de historial mediante un QFormer conjunto que reduce cada fotograma histórico a 16 tokens; y supervisión con máscaras. La entrada visual se procesa a 448×448 píxeles y el contexto incluye siete fotogramas de historial más el fotograma actual.

El modelo es relevante para quien investiga o despliega políticas VLA de bajo coste computacional, ya que el tamaño de 1B permite inferencia en GPUs de gama media y el mecanismo de compresión de historial reduce drásticamente la longitud de secuencia frente a concatenar fotogramas completos. No obstante, la información pública disponible es muy escasa: no hay métricas de benchmarks, ni detalles sobre el dataset de entrenamiento, ni licencia declarada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action basada en InternVL3-1B (transformer multimodal) con QFormer para compresión de historial |
| Parametros totales | aproximadamente 1B (heredados de InternVL3-1B; no se detalla el recuento exacto en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | siete fotogramas de historial más el fotograma actual; no se especifica el límite en tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo es de 1.0 GB y usa PyTorch, pero no se detalla el formato de los ficheros) |

## Arquitectura y entrenamiento

DobotTrack parte de InternVL3-1B, un transformer multimodal que combina un codificador visual con un modelo de lenguaje. Sobre esa base, el autor introduce tres modificaciones descritas en la model card: primero, un esquema Box-before-Action que estructura la salida del modelo en dos fases, localización del objeto mediante caja delimitadora y posterior emisión de la trayectoria; segundo, un QFormer conjunto que comprime cada fotograma del historial a 16 tokens, de modo que siete fotogramas históricos ocupan 112 tokens en lugar de las representaciones visuales completas; tercero, supervisión con máscaras, presumiblemente para guiar el aprendizaje de las regiones relevantes de la imagen.

La entrada visual se fija a 448×448 píxeles. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, si se empleó RLHF, DPO u otro método de alineación, ni los detalles del proceso de ajuste desde InternVL3-1B. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de trayectorias robóticas a partir de observaciones visuales e instrucciones en lenguaje natural.
- Localización de objetos mediante cajas delimitadoras antes de emitir la acción (Box-before-Action grounding).
- Procesamiento de historial temporal: siete fotogramas previos más el fotograma actual, comprimidos a 16 tokens por fotograma mediante QFormer.
- Comprensión visual a resolución de 448×448 píxeles.
- Entrada multimodal que combina imagen y texto en inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes multi-paso más allá de la secuencia observación-acción.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Manipulación robótica de pick-and-place: el modelo recibe la imagen actual y siete fotogramas de historial, localiza el objeto mediante la caja delimitadora y emite la trayectoria de aproximación y agarre; la compresión a 16 tokens por fotograma mantiene manejable la secuencia de entrada.
- Seguimiento de objetos en movimiento: el historial de siete fotogramas permite al modelo estimar la evolución temporal del objeto y generar trayectorias de seguimiento en lugar de posiciones estáticas.
- Control de brazos colaborativos en entornos de laboratorio: con 1B parámetros, el modelo puede ejecutarse en GPUs de gama media dentro del bucle de control, lo que facilita prototipado e investigación sin infraestructura de gran escala.
- Investigación en grounding visual para robótica: el esquema Box-before-Action sirve como banco de pruebas para estudiar si obligar a localizar el objeto antes de actuar mejora la precisión de la política.
- Evaluación de compresión de contexto temporal: el QFormer de 16 tokens por fotograma es un componente reutilizable para comparar estrategias de memoria en políticas VLA.
- Docencia y reproducción de pipelines VLA: al estar basado en InternVL3-1B y usar PyTorch, sirve como ejemplo didáctico de adaptación de un VLM a robótica con un presupuesto de cómputo reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de aproximadamente 1B parámetros en precisión de 16 bits se puede estimar en torno a 2-3 GB de pesos, más el coste del codificador visual a 448×448 y el historial de siete fotogramas. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar funcionamiento en GPUs consumer con al menos 8 GB de VRAM, aunque no está confirmado.
- Cabe en GPU consumer: probablemente sí, dado el tamaño de 1B, pero no hay confirmación oficial ni lista de GPUs validadas.
- Opciones de despliegue: no documentadas. El tag indica PyTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DobotTrack | ~1B | 7 fotogramas + actual | VLA / trayectorias | no disponible | Hugging Face |
| OpenVLA | ~7B | imagen actual | VLA / manipulación | no disponible en esta ficha | Hugging Face |
| RT-2 | no disponible | imagen actual | VLA / manipulación | propietaria | no público |
| InternVL3-1B | ~1B | no disponible en esta ficha | VLM general | no disponible en esta ficha | Hugging Face |

La comparación es aproximada: no se dispone de datos de rendimiento de DobotTrack que permitan contrastarlo cuantitativamente con OpenVLA o RT-2. La diferencia principal frente a estos es el tamaño reducido (1B frente a 7B de OpenVLA) y el mecanismo de compresión de historial temporal, que OpenVLA no incorpora de serie.

## Limitaciones y advertencias

- No se declara licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue en producción.
- El modelo solo declara soporte de inglés, lo que limita instrucciones en castellano u otros idiomas.
- No hay benchmarks publicados, por lo que no es posible evaluar su precisión frente a alternativas.
- No se documenta el dataset de entrenamiento, lo que impide evaluar sesgos, cobertura de objetos y condiciones de iluminación.
- Riesgo de alucinación en la generación de cajas delimitadoras y trayectorias: sin métricas de validación, no se puede descartar que el modelo emita acciones plausibles pero incorrectas.
- El historial se limita a siete fotogramas; escenas con dependencias temporales más largas quedan fuera del alcance del modelo.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026, lo que sugiere ausencia de validación por parte de la comunidad.
- No se especifican los formatos de pesos ni las herramientas de despliegue soportadas, lo que añade fricción a la integración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddsky/dobottrack
- InternVL3-1B (modelo base, referencia): no se proporciona enlace directo en la información disponible
- Paper o blog del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible

# dealignai/Ripple-65B-Preview-UNCENSORED-JANGH2

## Resumen

Ripple-65B-Preview-UNCENSORED-JANGH2 es una variante "abliterated" del modelo Ripple-65B-Preview de ricursiveAI, republicada por dealignai en formato JANGH2 para ejecución en Apple Silicon mediante MLX. El bundle parte del repack JANGH2 de OsaurusAI y elimina el comportamiento de rechazo (refusal) del modelo original, manteniendo intactas las capacidades de razonamiento, generación de código, tool calling y decodificación especulativa. A pesar de la denominación comercial "65B", el recuento real de parámetros en safetensors es de 17.603.732.560 (aproximadamente 17,6 mil millones), lo que conviene tener en cuenta al estimar requisitos de memoria.

El modelo se distribuye como un bundle autocontenido de 24,6 GB en precisión de 6 bits, con el drafter DFlash2 incluido en el directorio `dflash2/` en BF16 sin modificar. Está diseñado específicamente para el runtime Osaurus (versión 0.25.32 o superior) y es compatible con vMLX, pero no con la ruta estándar `mlx_lm.load()`, ya que requiere un cargador que soporte el formato JANGH. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

Su relevancia actual radica en dos factores: por un lado, ofrece una ventana de contexto nativa declarada de 2 millones de tokens con decodificación especulativa integrada, algo poco habitual en modelos de este tamaño; por otro, se posiciona explícitamente como un modelo sin filtros de seguridad, orientado a investigadores que necesitan estudiar el comportamiento del modelo sin capas de rechazo. El coste de esa modificación es una pérdida medible de rendimiento en MMLU de 3,40 puntos porcentuales respecto al bundle base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles); bundle MLX con drafter DFlash2 para decodificacion especulativa |
| Parametros totales | 17.603.732.560 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 2.000.000 tokens (contexto nativo declarado por el autor) |
| Tipos de cuantizacion | 6 bits (este bundle); existe variante JANG_4D de ~43,7 GB |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (metadatos de shard `{"format":"mlx"}`), con drafter DFlash2 en BF16 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base (ricursiveAI/Ripple-65B-Preview): no se especifica si emplea atención completa, atención lineal, mezcla de expertos o una combinación híbrida, ni se documentan el número de capas, dimensión oculta o cabezas de atención. Lo que sí se conoce es la cadena de derivación: el modelo original de ricursiveAI fue repackado por OsaurusAI en formato JANGH2 y posteriormente modificado por dealignai para eliminar el comportamiento de rechazo. El bundle conserva el chat template, el tokenizer y el bloque de capacidades de `jang_config.json` byte a byte respecto al base, así como el orden de tensores.

El elemento técnico más destacable es el drafter DFlash2, un modelo de decodificación especulativa incluido en el bundle con hash SHA coincidente con el upstream de ricursiveAI. Este drafter acelera la generación al proponer tokens que el modelo principal verifica en paralelo, y se carga automáticamente en Osaurus. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La modificación "uncensored" se describe como una eliminación del comportamiento de rechazo sin hooks en tiempo de ejecución ni componentes auxiliares, pero no se documenta la metodología exacta empleada.

## Capacidades

- Generación de texto conversacional en inglés con soporte de razonamiento multi-paso.
- Modo "thinking" activable o desactivable por turno de conversación.
- Tool calling con formato Hermes, lo que permite integración en flujos de agentes.
- Razonamiento y resolución de problemas, con rendimiento medido en MMLU (66,40% en la variante sin filtros).
- Generación de código, aunque sin benchmarks específicos publicados en la información disponible.
- Decodificación especulativa mediante el drafter DFlash2, que reduce la latencia de generación.
- Ventana de contexto nativa de 2 millones de tokens, adecuada para documentos extensos y conversaciones de muchos turnos.
- Comportamiento sin rechazo en categorías de HarmBench, incluidas las consideradas difíciles.
- Soporte de cuantización en 6 bits para despliegue en Apple Silicon.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo se comporta una variante sin capas de rechazo frente a la original en las mismas tareas, comparando respuestas y midiendo la degradación de capacidades con la tabla MMLU por materia incluida en la model card.
- Procesamiento de documentos legales o técnicos de gran extensión: con 2 millones de tokens de contexto, se puede cargar un corpus completo de contratos o especificaciones y formular preguntas sobre él sin fragmentación, algo inviable en modelos con ventanas de 32K o 128K.
- Agentes autónomos con tool calling: el formato Hermes y el modo thinking por turno permiten construir pipelines donde el modelo decide cuándo razonar en profundidad y cuándo invocar herramientas, con la decodificación especulativa reduciendo la latencia en producción.
- Asistencia a la investigación en entornos controlados: para equipos que necesitan analizar contenido sensible (por ejemplo, texto sobre seguridad ofensiva o temas médicos delicados) sin que el modelo se niegue a responder, siempre dentro de un marco legal y ético definido.
- Desarrollo local en Apple Silicon: el bundle de 24,6 GB en 6 bits está pensado para ejecutarse en equipos Mac con memoria unificada suficiente, lo que facilita prototipado sin depender de GPUs dedicadas ni de servicios en la nube.
- Generación de código en flujos de CI/CD: el soporte de tool calling y razonamiento permite integrar el modelo en tareas de revisión de parches, generación de tests o explicación de errores, aunque la ausencia de benchmarks de código obliga a validar su calidad en el dominio concreto antes de adoptarlo.
- Análisis de conversaciones multi-turno de larga duración: útil en simulación de diálogos extensos o en evaluación de sistemas conversacionales donde el contexto acumulado supera con creces los límites habituales.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden a MMLU con una muestra estratificada de 500 preguntas, evaluada mediante logits de prefill sobre las opciones " A", " B", " C" y " D".

| Bundle | MMLU-500 | Aciertos |
|---|---:|---:|
| Base Ripple-65B-Preview-JANGH2 | 69,80% | 349 / 500 |
| UNCENSORED (este bundle) | 66,40% | 332 / 500 |
| Diferencia | −3,40 pp | — |

El desglose por materia (57 asignaturas, 8 o 9 preguntas cada una) muestra una alta variabilidad por el reducido tamaño de muestra: hay mejoras de hasta +11,1 pp (anatomía, matemáticas elementales, historia de EE. UU.) y degradaciones de hasta −25,0 pp (medicina profesional), −22,2 pp (química de secundaria, escenarios morales, envejecimiento humano) y −11,1 pp en varias materias de ciencias y humanidades. No se han publicado resultados de HumanEval, GSM8K, HarmBench cuantitativo ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el bundle ocupa 24,6 GB en disco en cuantización de 6 bits; para inferencia conviene reservar al menos 28-32 GB de memoria unificada para acomodar pesos, caché KV y el drafter DFlash2 en BF16.
- La variante hermana JANG_4D ocupa aproximadamente 43,7 GB, lo que sugiere que este bundle de 6 bits es la opción más ligera de la familia.
- GPU dedicadas: no se documenta soporte para CUDA; el formato es MLX y el runtime objetivo es Apple Silicon. No hay datos de funcionamiento en A100, H100 ni RTX 4090.
- Cabe en equipos Mac con memoria unificada de 32 GB o superior (Mac Studio, MacBook Pro con M-series de gama alta); en configuraciones de 16 GB no es viable.
- Opciones de despliegue: Osaurus 0.25.32 o superior (runtime principal, con carga automática del drafter) y vMLX. La ruta estándar `mlx_lm.load()` rechaza el bundle por requerir el cargador JANGH. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; la presencia del drafter DFlash2 indica que el autor prioriza la velocidad de decodificación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-500 | Licencia | Runtime |
|---|---:|---:|---:|---|---|
| Ripple-65B-Preview-UNCENSORED-JANGH2 (este) | 17,6B | 2M | 66,40% | Apache 2.0 | Osaurus, vMLX |
| Ripple-65B-Preview-JANGH2 (base) | 17,6B | 2M | 69,80% | Apache 2.0 | Osaurus, vMLX |
| Ripple-65B-Preview-UNCENSORED-JANG_4D | no disponible | 2M | no disponible | Apache 2.0 | Osaurus, vMLX |
| ricursiveAI/Ripple-65B-Preview (original) | no disponible | 2M | no disponible | no disponible | MLX |

La comparativa con modelos de otras familias (Llama, Qwen, Mistral) no está disponible en la información proporcionada, ya que no se ofrecen datos de rendimiento cruzados ni especificaciones del modelo original más allá de su existencia.

## Limitaciones y advertencias

- La eliminación del comportamiento de rechazo conlleva un riesgo evidente: el modelo puede generar contenido dañino, ilegal o éticamente problemático en categorías de HarmBench. Su uso en producción orientada al público requiere filtros externos obligatorios.
- Pérdida de rendimiento medible de 3,40 pp en MMLU respecto al base, con degradaciones locales de hasta 25 pp en materias concretas; no debe asumirse paridad de capacidades con el modelo original.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- La ventana de 2 millones de tokens es una declaración del autor; no se aportan mediciones de calidad de recuperación en contextos largos (por ejemplo, needle-in-a-haystack).
- El bundle no carga con `mlx_lm.load()`; depende de runtimes específicos (Osaurus, vMLX), lo que limita la portabilidad y complica el despliegue en infraestructura estándar.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales; la responsabilidad recae en el desplegador.
- El recuento real de 17,6 mil millones de parámetros difiere de la denominación "65B" del nombre comercial; verificar requisitos de memoria con el dato real, no con la etiqueta.
- El modelo no está afiliado a Osaurus, vMLX ni ricursiveAI; el soporte y las actualizaciones dependen de dealignai.
- Riesgo de alucinación no cuantificado en la información disponible; como en cualquier modelo de 17B, es esperable en tareas de conocimiento factual especializado.
- Sesgos: no documentados, pero heredados del modelo base, cuyo dataset de entrenamiento no se detalla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dealignai/Ripple-65B-Preview-UNCENSORED-JANGH2
- Modelo base (repack JANGH2 de OsaurusAI): https://huggingface.co/OsaurusAI/Ripple-65B-Preview-JANGH2
- Modelo original de ricursiveAI: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Drafter DFlash2: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Variante hermana JANG_4D: https://huggingface.co/dealignai/Ripple-65B-Preview-UNCENSORED-JANG_4D
- Runtime Osaurus: https://osaurus.ai
- Perfil del autor en X: https://x.com/dealignai
- Sitio del autor: https://dealign.ai

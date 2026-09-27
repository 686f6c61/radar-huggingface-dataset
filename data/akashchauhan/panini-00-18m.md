# akashchauhan/panini-00-18m

## Resumen

Panini-00 18M es un checkpoint de traducción automática de frases entre hindi y sánscrito, ambos en escritura devanagari, publicado por el usuario akashchauhan en HuggingFace. Se trata de un modelo pequeño (18.143.616 parámetros) entrenado desde cero con PyTorch y distribuido como checkpoint propio (`checkpoint.pt`) más un tokenizador SentencePiece de 16.000 piezas, por lo que no es un modelo Transformers estándar y no se puede cargar con `AutoModelForSeq2SeqLM`. Cubre cinco tareas: traducción hindi→sánscrito, sánscrito→hindi, "sanscritización" del hindi (sustitución de léxico hindi por equivalentes sánscritos), corrección gramatical del hindi y corrección gramatical del sánscrito.

El modelo resuelve un problema muy concreto y de nicho: no existe una oferta amplia de traductores neurálgicos ligeros y ejecutables en CPU para el par hindi–sánscrito, un par de lenguas con recursos limitados y con una relación histórica de préstamo léxico intensa. Con 8 capas, ancho 384 y un contexto máximo de 512 tokens (incluido el prompt), está diseñado para inferencia en CPU y para integrarse en herramientas de normalización o corrección lingüística más que como motor de traducción generalista.

Es relevante ahora por dos motivos: primero, por su tamaño, que lo hace desplegable sin GPU y por tanto adecuado para herramientas educativas o de procesamiento por lotes de bajo coste; segundo, porque los modelos de esta categoría (18M, 29,9 millones de tokens de preentrenamiento, 28,8 millones de tokens supervisados en 312.176 ejemplos) son poco frecuentes para lenguas clásicas indias, donde lo habitual es recurrir a modelos multilingües mucho mayores. La contrapartida es que no hay benchmarks publicados, la licencia es "other" sin términos explícitos y el repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (según la estructura declarada: 8 capas, atención con 6 cabezas de consulta y 2 de clave-valor, FFN de anchura 960); no se especifica si es encoder-decoder |
| Parametros totales | 18.143.616 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens, incluido el prompt |
| Tipos de cuantizacion | No disponible (el autor distribuye un único `checkpoint.pt`, presumiblemente en FP32; no se ofrecen versiones cuantizadas) |
| Idiomas soportados | Hindi (hi) y sánscrito (sa), en escritura devanagari |
| Licencia | other (sin términos detallados en la model card) |
| Formato de pesos | PyTorch (`checkpoint.pt`), más tokenizador SentencePiece (`tokenizer.model`) |
| Ancho del modelo | 384 |
| Dimension de cabeza | 64 |
| Anchura de la capa feed-forward | 960 |
| Vocabulario | 16.000 piezas SentencePiece |
| Capas | 8 |
| Tareas declaradas | `translate_hi_sa`, `translate_sa_hi`, `sanskritize_hindi`, `correct_hi`, `correct_sa` |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe un transformer de 8 capas y anchura 384, con 6 cabezas de consulta frente a 2 cabezas de clave-valor (atención con consultas agrupadas, GQA) y dimensión de cabeza 64, lo que da una dimensión de proyección de consultas de 384 y una de clave-valor de 128. La capa feed-forward tiene anchura 960, aproximadamente 2,5 veces el ancho del modelo, un ratio bajo en comparación con los transformers habituales. El vocabulario es de 16.000 piezas SentencePiece, entrenado específicamente para devanagari; el autor advierte explícitamente que este tokenizador no es intercambiable con el de Panini-00 10M ni con el de Panini-00 50M, lo que sugiere una familia de modelos entrenada de forma independiente por tamaño. No se indica si la arquitectura es decoder-only o encoder-decoder, ni si emplea atención causal, aunque el modo de uso descrito (una frase de entrada y continuación autoregresiva con decodificación greedy hasta `<eos>`) es compatible con un esquema de continuación de prompt.

En cuanto a los datos, la ficha aporta cifras agregadas pero no la composición del corpus: 29.924.160 tokens de preentrenamiento y 28.849.820 tokens supervisados repartidos en 312.176 ejemplos, para un total de aproximadamente 58,8 millones de tokens vistos. No se menciona el uso de RLHF, DPO, ajuste por instrucciones ni ninguna técnica de alineación; el entrenamiento supervisado se organiza por etiquetas de tarea que el cargador de código añade al prompt, y la inferencia se realiza con temperatura 0 (greedy) y parada por token de fin de secuencia. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, destilación, etc.). Como referencia aritmética, el coste de entrenamiento aproximado sería de 2 × 18,14 M × 58,77 M ≈ 2,1 PFLOPs en total; es una estimación derivada de las cifras declaradas, no un dato publicado por el autor.

## Capacidades

- Traducción de frases hindi → sánscrito (`translate_hi_sa`), por ejemplo "मैं किताब पढ़ता हूँ।" → "अहं पुस्तकं पठामि।".
- Traducción de frases sánscrito → hindi (`translate_sa_hi`).
- Sanscritización del hindi (`sanskritize_hindi`): reescritura de una frase hindi sustituyendo léxico de origen persa/árabe o hindi común por equivalentes sánscritos, por ejemplo "मैं स्कूल जाता हूँ और पानी पीता हूँ।" → "मैं विद्यालय जाता हूँ और जल पीता हूँ।".
- Corrección gramatical del hindi (`correct_hi`): concordancia de género y número, por ejemplo "यह पुस्तक अच्छा है।" → "यह पुस्तक अच्छी है।" o "वह किताब पढ़ता हैं।" → "वह किताब पढ़ता है।".
- Corrección gramatical del sánscrito (`correct_sa`): concordancia de persona y número, por ejemplo "अहं गृहं गच्छति।" → "अहं गृहं गच्छामि।" y "बालकः पुस्तकं पठन्ति।" → "बालकः पुस्तकं पठति।".
- Generación de texto limitada a la tarea: no es un modelo conversacional ni un generador de texto libre; el resultado útil es el texto posterior a la etiqueta `<tgt>`.
- Tool calling / function calling: no soportado.
- Uso como agente o razonamiento multi-paso: no soportado.
- Capacidades multilingües: limitadas a hindi y sánscrito en devanagari; no se declara soporte de transliteración (IAST, Harvard-Kyoto), ni de otras lenguas indias.
- Capacidades especiales: ninguna adicional (sin modo de razonamiento, sin visión, sin audio, sin ventana de contexto extensa).

## Casos de uso

- Herramientas educativas de sánscrito: corrección y generación de ejercicios de concordancia verbal y nominal. El modelo cabe en CPU y responde en milisegundos, por lo que puede ejecutarse dentro de una aplicación de escritorio o web sin coste de GPU.
- Normalización estilística de textos hindi hacia un registro sánscrito: la tarea `sanskritize_hindi` permite reescribir prosa hindi moderna con vocabulario sánscrito, útil para publicaciones, textos litúrgicos o material académico que busque un registro elevado.
- Preprocesado de corpus paralelos: para proyectos de lingüística computacional que necesiten alinear o ampliar corpus hindi–sánscrito, el modelo puede generar candidatos de traducción que después se filtran manualmente o con un modelo mayor.
- Corrección automática en editores de texto devanagari: la tarea `correct_hi` resuelve errores frecuentes de concordancia de género y número, un caso de uso realista en correctores ortográficos y gramaticales ligeros integrados en el navegador o en el móvil.
- Enseñanza asistida de gramática sánscrita: `correct_sa` señala errores de concordancia (persona, número) en frases escritas por estudiantes, sirviendo como primera pasada de retroalimentación antes de la revisión docente.
- Generación de pares de frases para anotación: con temperaturas 0 el modelo es determinista, lo que permite construir conjuntos de referencia reproducibles para evaluar otros sistemas de traducción hindi–sánscrito.
- Prototipado e investigación sobre modelos pequeños: con 18 M de parámetros y ~59 M de tokens de entrenamiento, sirve como banco de pruebas barato para estudiar tokenizadores devanagari, etiquetas de tarea en prompt o curvas de escalado en lenguas clásicas.
- Traducción por lotes en entornos con restricciones: al ejecutarse en CPU y ocupar menos de 100 MB, puede desplegarse en servidores sin GPU, dispositivos embebidos o funciones serverless con memoria limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad de traducción (BLEU, chrF, COMET, METEOR), ni evaluaciones de corrección gramatical, ni comparaciones cuantitativas con otros sistemas. Tampoco se documentan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. Los pesos en FP32 ocupan aproximadamente 72,6 MB (18.143.616 × 4 bytes); en FP16 serían unos 36 MB y en INT8 unos 18 MB, aunque el autor solo distribuye el checkpoint sin cuantizar.
- GPU recomendadas: no se necesita GPU. El autor indica explícitamente que "la CPU es suficiente"; cualquier GPU consumer (por ejemplo RTX 3060, RTX 4090) es sobredimensionada para este modelo.
- Compatibilidad con GPU consumer: sí, en todas las GPU actuales e incluso en placas integradas o en dispositivos tipo Raspberry Pi, dado el tamaño del modelo y la ventana de 512 tokens.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers, ya que se trata de un checkpoint PyTorch con código propio. El único camino documentado es clonar el repositorio de referencia `midroid/ai-models` (rama `experiment/010-hindi-sanskrit`), instalar dependencias con `uv sync` (Python 3.10+, PyTorch, SentencePiece, PyYAML) y ejecutar `python -m src.sample` o importar `continue_prompt` desde `src.sample`.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones; el único dato cualitativo es que la inferencia en CPU es viable. Cualquier cifra concreta de tokens por segundo requeriría medirse sobre el hardware objetivo.
- Limitación de memoria asociada al contexto: la generación se detiene al alcanzar el token de fin de secuencia y no puede superar los 512 tokens de contexto, prompt incluido.

## Comparativa con modelos similares

La información proporcionada no incluye comparaciones con otros modelos ni datos de rendimiento propios, por lo que la comparación se limita a características objetivas de tamaño, formato y licencia. Los valores de rendimiento se marcan como no disponibles.

| Modelo | Parametros | Contexto | Idiomas | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| Panini-00 18M | 18,14 M | 512 tokens | hi, sa (devanagari) | PyTorch `checkpoint.pt` | other (sin detallar) | no disponible |
| Panini-00 10M | no disponible | no disponible | hi, sa | no disponible | other | no disponible |
| Panini-00 50M | no disponible | no disponible | hi, sa | no disponible | other | no disponible |
| IndicTrans2 (AI4Bharat) | 200 M (destilado) y 1 B | no disponible | 22 lenguas indias | Transformers (safetensors) | MIT | no disponible en esta ficha |
| NLLB-200 distilled 600M | 600 M | no disponible | 200 lenguas | Transformers, CTranslate2 | CC-BY-NC-4.0 (no comercial) | no disponible en esta ficha |

Nota: los datos de IndicTrans2 y NLLB-200 se incluyen como referencia de categoría conocida; no se dispone de sus métricas comparativas frente a Panini-00 18M y no deben interpretarse como una evaluación realizada para esta ficha. Las entradas de Panini-00 10M y 50M proceden únicamente de la mención del autor al tokenizador; no se han consultado sus fichas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas de BLEU, chrF, COMET ni evaluaciones humanas, lo que impide estimar la calidad real de la traducción o de la corrección gramatical.
- Licencia "other" sin texto: la model card no detalla condiciones de uso, atribución ni permisos de explotación comercial. Antes de cualquier uso en producción es necesario contactar con el autor para aclarar los términos; a efectos prácticos, el uso comercial debe considerarse no autorizado hasta confirmación.
- Riesgo de alucinación y de errores silenciosos: en tareas de corrección gramatical, el modelo puede reescribir frases correctas o introducir formas verbales erróneas sin señalizar incertidumbre; con decodificación greedy no hay puntuaciones de confianza por defecto.
- Contexto muy corto: 512 tokens incluyendo el prompt limita el uso a frases, no a párrafos o documentos. No hay mecanismo de ventana deslizante documentado.
- Idiomas restringidos: solo hindi y sánscrito en devanagari. No hay soporte declarado para transliteraciones, otras lenguas indias ni inglés, lo que reduce su utilidad como componente multilingüe.
- Tokenizador no reutilizable: el `tokenizer.model` es específico de este checkpoint y no funciona con Panini-00 10M ni 50M, lo que complica la gestión de versiones y el intercambio de artefactos.
- Falta de integración con el ecosistema: al no ser un modelo Transformers, no se puede servir con vLLM, TGI, Ollama o llama.cpp sin trabajo de conversión previo; el único código de referencia es un repositorio con rama experimental.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de redactar esta ficha, sin issues ni discusiones públicas que permitan contrastar la calidad declarada.
- Datos de entrenamiento no auditables: se desconocen la procedencia, la composición y la limpieza del corpus, lo que impide evaluar sesgos de dominio (por ejemplo, predominio de textos religiosos o literarios) y el riesgo de contaminación entre preentrenamiento y supervisión.
- Posible sesgo de registro: la tarea `sanskritize_hindi` empuja el texto hacia un registro sánscrito elevado, lo que puede no ser apropiado ni deseable en contextos de hindi contemporáneo estándar.
- Metadatos inconsistentes: las fechas de creación y actualización registradas en HuggingFace (2026-09-27) no permiten situar el modelo en una línea temporal verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akashchauhan/panini-00-18m
- Código de referencia (rama `experiment/010-hindi-sanskrit`): https://github.com/midroid/ai-models/tree/experiment/010-hindi-sanskrit/experiments/language/010-hindi-sanskrit-slm

Las búsquedas web realizadas no devolvieron documentación adicional sobre este modelo. Los resultados obtenidos no guardan relación con el checkpoint, salvo la coincidencia de nombre en un caso:

- https://gen.akash.network/ (generador de imágenes; no relacionado)
- https://civitai.com/models (repositorio de modelos de difusión; no relacionado)
- https://chat.akash.network/models/ (catálogo de modelos de chat; no relacionado)
- https://akashml.com/models (catálogo de modelos; no relacionado)
- https://arxiv.org/abs/2602.15156 ("Panini: Continual Learning in Token Space via Structured Memory"; artículo sobre aprendizaje continuo sin relación aparente con este checkpoint más allá del nombre)

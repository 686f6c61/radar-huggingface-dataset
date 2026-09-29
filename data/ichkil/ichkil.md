# ichkil/ichkil

## Resumen

Ichkil es un modelo compacto y autocontenido para tashkeel árabe (diacritización), es decir, la asignación de harakat, shadda y tanwin a cada letra de una frase árabe sin vocalizar. Lo desarrolla el usuario ichkil y se distribuye bajo licencia MIT a través de HuggingFace. Su función es transformar texto como "محمد قرأ الكتاب" en "مُحَمَّدٌ قَرَأَ الْكِتَابَ", resolviendo un paso de preprocesado crítico para TTS, búsqueda y enseñanza del árabe.

Técnicamente no es un transformer generativo, sino una red de secuencia a nivel de carácter de aproximadamente 1,26 millones de parámetros (~5 MB en fp32) con arquitectura Bi-GRU seguida de un banco de expertos con compuertas y una cabeza de clasificación. Trabaja con un vocabulario de 42 símbolos y una ventana máxima de 1024 caracteres, y produce 13 etiquetas de salida que codifican combinaciones de diacríticos.

Su relevancia actual radica en el despliegue: se publica como un único archivo ONNX (opset 17) que corre en CPU, WebGPU y navegador, sin servidor y sin enviar datos fuera del dispositivo. Con 0 descargas y 1 like en el momento de la consulta, se trata de un artefacto muy reciente y de adopción aún nula, pero con un compromiso explícito entre tamaño mínimo y calidad competitiva en tashkeel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Caracteres: Bi-GRU a nivel de carácter, banco de expertos con compuertas (gated expert bank) y cabeza de clasificación |
| Parametros totales | ~1,26 M |
| Longitud de contexto | 1024 caracteres máximo (secuencia de entrada `[batch, seq_len]`, 1 ≤ seq_len ≤ 1024) |
| Tipos de cuantizacion | No disponible; el artefacto publicado es fp32 (~5 MB), sin variantes cuantizadas oficiales |
| Idiomas soportados | Árabe (ar) |
| Licencia | MIT |
| Formato de pesos | ONNX, opset 17 (archivo único `model.onnx`); contrato de E/S en `config.json` |

## Arquitectura y entrenamiento

La arquitectura declarada combina tres etapas: una Bi-GRU a nivel de carácter que codifica la secuencia de entrada, un banco de expertos con compuertas que modula la representación, y una cabeza de clasificación que emite logits sobre 13 etiquetas. La entrada es `input_ids` en `int64` con forma `[batch, seq_len]`, construida a partir del mapa `sym2id` de `config.json` (vocabulario de 42 símbolos que incluye letras árabes, espacio, puntuación común, tatweel, `<pad>` y `<unk>`). La salida son `logits` en `float32` con forma `[batch, seq_len, 13]`, sobre los que se aplica `argmax` por posición.

Las 13 etiquetas codifican combinaciones de diacríticos: desde la ausencia de marca hasta pares de fatha, damma, kasra, sukun, shadda y tanwin. El autor no detalla en la información disponible el número de tokens de entrenamiento, la composición del corpus ni si hubo etapas de ajuste tipo RLHF o DPO (procedimientos, por otra parte, poco habituales en una tarea de etiquetado secuencial como esta). La innovación destacada es de eficiencia y portabilidad: el artefacto ONNX se verifica idéntico al modelo PyTorch de referencia (delta máximo de 0,000e+00), de modo que las métricas se mantienen en cualquier runtime (Python, JavaScript/TypeScript, navegador o Go).

## Capacidades

- Diacritización completa de texto árabe: asigna harakat, shadda y tanwin letra a letra, incluyendo la ausencia de marca cuando corresponde.
- Procesamiento a nivel de carácter con vocabulario cerrado de 42 símbolos, lo que evita dependencia de un tokenizador subword.
- Inferencia totalmente offline: no requiere servidor ni conexión, y los datos no abandonan el dispositivo.
- Ejecución en CPU y WebGPU mediante ONNX Runtime, con clientes en Python, JavaScript/TypeScript (navegador y Node) y Go.
- Manejo de entradas de hasta 1024 caracteres por secuencia.
- Salida determinista: la decodificación es un `argmax` por posición, sin muestreo estocástico.
- Gestión de caracteres fuera de vocabulario mediante el token `<unk>`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un clasificador de secuencia especializado, no un modelo generativo de propósito general.

## Casos de uso

- Preprocesado para síntesis de voz (TTS) en árabe: los motores de TTS necesitan vocales y shadda para una pronunciación correcta; Ichkil puede vocalizar el texto de entrada en el propio dispositivo antes de enviarlo al sintetizador.
- Widget de diacritización en el navegador: al ser un único archivo ONNX de ~5 MB ejecutable con ONNX Runtime Web, puede integrarse en una página web para vocalizar texto pegado por el usuario sin backend.
- Aplicaciones móviles educativas de árabe: por su tamaño, cabe en un teléfono y funciona sin conexión, lo que permite mostrar textos vocalizados a estudiantes en cualquier contexto.
- Post-procesado de transcripciones ASR: las salidas de reconocimiento de voz en árabe suelen carecer de diacríticos; Ichkil puede restaurarlos para mejorar la legibilidad y el análisis posterior.
- Normalización en pipelines de búsqueda y recuperación de información: la vocalización puede homogeneizar el texto indexado y reducir ambigüedad en consultas en árabe.
- Anotación lingüística y construcción de corpus: el modelo permite etiquetar automáticamente grandes volúmenes de texto árabe con diacríticos para investigación en morfología y fonología.
- Integración en el procesamiento de OCR árabe: tras extraer texto de una imagen, la diacritización mejora la calidad del documento digitalizado para su reutilización.
- Servicios de texto en el borde (edge): su bajo consumo permite desplegarlo en dispositivos con recursos limitados, sin GPU ni infraestructura dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test de Fadel et al. (2019). El modelo index marca la métrica como no verificada (`verified: false`), por lo que deben interpretarse como cifras aportadas por el desarrollador. Además del DER del 2,80 %, la model card detalla otras métricas:

| Metrica | Valor |
|---|---|
| DER | 2,80 % |
| DER (sin caso) | 2,05 % |
| WER | 8,75 % |
| WER (sin caso) | 4,65 % |

Comparación con líneas base publicadas sobre el mismo conjunto, según la model card:

| Sistema | DER | Diferencia vs Ichkil |
|---|---|---|
| Abbad & Xiong 2020 (RNN + reglas) | 3,39 % | +0,60 (Ichkil mejor) |
| Shakkala (B-LSTM) | 2,88 % | +0,09 (Ichkil mejor) |
| Ichkil (este repositorio) | 2,80 % | — |
| BERT SOTA (2024) | 1,14 % | −1,66 (BERT mejor) |

El autor indica que el artefacto ONNX puntúa de forma idéntica al modelo PyTorch de referencia (delta máximo de 0,000e+00).

## Requisitos de hardware

- VRAM para inferencia: prácticamente nula; el modelo está diseñado para ejecutarse en CPU. Con ~1,26 M de parámetros y ~5 MB en fp32, reside por completo en memoria principal o incluso en caché.
- GPU recomendadas: no se requieren. Cualquier GPU es innecesaria; en caso de usarse, no hay cifras de rendimiento publicadas.
- Cabe en GPU de consumo: sí, y también en cualquier CPU moderna, teléfonos y navegadores. El caso de uso objetivo es el despliegue en el dispositivo, no en aceleradores.
- Opciones de despliegue: ONNX Runtime (CPU) en Python; ONNX Runtime Web y ONNX Runtime Node para JavaScript/TypeScript; bindings de ONNX Runtime para Go (`github.com/yalue/onnxruntime_go`).
- Latencia y throughput estimados: no disponibles en la información proporcionada. El autor no publica cifras de latencia por secuencia ni de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | DER (Fadel et al. 2019) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ichkil | ~1,26 M | Bi-GRU + banco de expertos con compuertas, ONNX | 2,80 % | MIT | HuggingFace (ONNX, opset 17) |
| Abbad & Xiong 2020 | No disponible | RNN + reglas | 3,39 % | No disponible | Publicación académica |
| Shakkala | No disponible | B-LSTM | 2,88 % | No disponible | Proyecto publicado |
| BERT SOTA (2024) | No disponible | BERT (transformer) | 1,14 % | No disponible | Publicación académica |

Ichkil ofrece la mejor relación entre tamaño y error de diacritización frente a las líneas base clásicas citadas, aunque un sistema basado en BERT publicado en 2024 logra un DER claramente inferior (1,14 % frente a 2,80 %) a costa de un modelo mucho mayor y presumiblemente no orientado a ejecución en el dispositivo.

## Limitaciones y advertencias

- Cobertura de idioma limitada al árabe (ar); no está entrenado para otras lenguas.
- Ventana máxima de 1024 caracteres por secuencia: los textos más largos deben dividirse en fragmentos, con el riesgo de perder contexto en las fronteras.
- Se distribuye únicamente en fp32; no hay versiones cuantizadas publicadas (int8, fp16), lo que limita optimizaciones específicas de despliegue.
- Las métricas de benchmark están marcadas como no verificadas en el model index y proceden del propio autor; la comparación con las líneas base también la aporta la model card, no una evaluación independiente.
- Evaluación sobre un único conjunto (Fadel et al. 2019); no hay datos de robustez frente a otros dominios, dialectos, texto sin puntuación o ruido de OCR.
- Al ser un clasificador de secuencia, puede asignar diacríticos incorrectos en palabras ambiguas u homógrafas, con impacto directo en pronunciación y sentido; conviene validación humana en aplicaciones sensibles.
- No genera texto, no razona, no admite instrucciones ni herramientas: cualquier expectativa de uso como modelo conversacional es inadecuada.
- Sesgos potenciales derivados del corpus de entrenamiento no documentado (registro, época o variedad dialectal), no cuantificados en la información disponible.
- Adopción nula en el momento de la consulta (0 descargas, 1 like), lo que implica ausencia de validación por parte de la comunidad y de casos de producción conocidos.
- La licencia MIT permite uso comercial y modificación sin restricciones relevantes, siempre que se conserve el aviso de copyright y la licencia.

## Enlaces

- HuggingFace: https://huggingface.co/ichkil/ichkil
- Los resultados de la búsqueda web no aportan enlaces relevantes sobre este modelo: las entradas devueltas corresponden a entidades homónimas no relacionadas (modelos de generación de imágenes en SeaArt y PixAI, y la plataforma Ichi de ichiplan.com), por lo que se descartan como fuentes.
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales del modelo.

# oluwagbotty/nemo-ctc-ky-ft-10ep-onnx

## Resumen

`oluwagbotty/nemo-ctc-ky-ft-10ep-onnx` es la exportación a ONNX de un modelo de reconocimiento automático del habla (ASR) basado en NeMo CTC, afinado sobre kinyarwanda (código ISO `rw`). El modelo original, `oluwagbotty/nemo-ctc-ky-ft-10ep`, se ha convertido en un único grafo ONNX que abarca desde audio crudo mono a 16 kHz hasta log-probabilidades, incluyendo el front-end de audio de NeMo, el encoder y el decoder. El resultado es que el despliegue en dispositivo solo requiere `onnxruntime`, sin necesidad de la pila completa de NeMo.

El modelo se distribuye bajo licencia CC-BY-4.0 y está pensado para reconocimiento de voz en kinyarwanda en entornos de bajos recursos computacionales. El repositorio ocupa 0,5 GB y contiene los pesos en formato ONNX con un fichero de datos externo (`model.onnx.data`), además de un `labels.json` con el vocabulario de tokens. La exportación preserva la precisión del modelo padre: según la model card, el grafo ONNX produce el mismo texto greedy que NeMo en 50 de 50 grabaciones de test.

La relevancia de esta ficha radica en que se trata de un modelo especializado en una lengua de bajos recursos (kinyarwanda), empaquetado para inferencia ligera vía ONNX Runtime. No obstante, la información pública disponible es muy limitada: no se detallan la arquitectura interna, el número de parámetros ni los resultados de benchmarks, por lo que muchos campos de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo CTC (encoder-decoder CTC; detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; entrada de audio variable en muestras) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos ONNX; el modelo base está etiquetado como `quantized`) |
| Idiomas soportados | kinyarwanda (`rw`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data`) |
| Entrada | `audio` float32 [1, samples] a 16 kHz mono; `length` int64 [1] |
| Salida | `log_probs` [1, frames, tokens + blank]; `frames` |
| Tamano del repositorio | 0,5 GB |
| Libreria | onnxruntime |

## Arquitectura y entrenamiento

El modelo es un sistema ASR de tipo CTC construido con NVIDIA NeMo y posteriormente exportado a un único grafo ONNX que integra el front-end de audio (extracción de features), el encoder y el decoder. La salida son log-probabilidades por frame sobre un vocabulario de tokens definido en `labels.json`, donde el token blank ocupa la última posición y el prefijo `▁` marca el inicio de palabra (esquema típico de tokenización tipo SentencePiece/BPE). La decodificación es greedy: se toma el mejor token por frame, se fusionan repeticiones y se descartan los blanks.

El modelo base `oluwagbotty/nemo-ctc-ky-ft-10ep` fue afinado durante 10 épocas (según el nombre) sobre el CDLI Non-Standard Speech Dataset del Centre for Digital Language Inclusion (UCL, 2025), financiado por UK International Development a través del programa AT2030 con apoyo de Google.org. El dataset es `cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0` (acceso restringido, no incluido en el repositorio). Las grabaciones se realizaron en Ruanda en 2026, en interiores con bajo ruido, mediante una app de tablet, a partir de estímulos con imágenes (descripciones libres) y estímulos de texto (frases leídas). No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF/DPO (no aplicables habitualmente en ASR CTC).

## Capacidades

- Reconocimiento automático del habla en kinyarwanda a partir de audio mono a 16 kHz.
- Decodificación CTC greedy integrada en el propio grafo ONNX (salida de log-probabilidades por frame).
- Inferencia ligera mediante `onnxruntime`, sin dependencia de la pila NeMo completa.
- Procesamiento de audio de duración variable (la entrada `audio` acepta un número arbitrario de muestras y `length` indica la longitud válida).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio adicional ni modo thinking.
- Capacidad multilingüe limitada al kinyarwanda (`rw`); no se indica soporte de code-switching.

## Casos de uso

- Transcripción de voz en kinyarwanda en dispositivos con recursos limitados: al requerir solo `onnxruntime` y un grafo de 0,5 GB, puede ejecutarse en tablets o equipos de gama baja para transcribir grabaciones de campo.
- Digitalización de encuestas y entrevistas en Ruanda: el modelo permite convertir grabaciones de audio en texto para su posterior análisis, aunque las condiciones de entrenamiento (interiores silenciosos, tablet) limitan su fiabilidad en entornos ruidosos.
- Accesibilidad para hablantes de kinyarwanda: subtitulado o transcripción de contenido hablado en esta lengua, con la advertencia de revisar el texto antes de actuar sobre él.
- Investigación lingüística y de inclusión digital: el modelo sirve como base para estudiar el rendimiento de ASR en lenguas de bajos recursos y en habla no estándar, dado su origen en el CDLI.
- Prototipado rápido de pipelines ASR: la exportación ONNX facilita integrar el modelo en aplicaciones Python/C++ con `onnxruntime` sin gestionar dependencias de NeMo.
- Evaluación comparativa de exportaciones ONNX frente a NeMo: la model card documenta paridad de salida greedy en 50 de 50 grabaciones, lo que permite usar el modelo como referencia en pruebas de portabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica documentada es la paridad de salida: el grafo ONNX produce el mismo texto greedy que NeMo en 50 de 50 grabaciones de test (`check.json`).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,5 GB, por lo que la huella en memoria es del orden de cientos de MB, pero no se detalla el desglose.
- GPU recomendadas: no disponible. Al ser un modelo ONNX ligero, es plausible su ejecución en CPU, aunque no se documenta.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el tamaño del repositorio sugiere que cabría en GPUs de consumo, pero no hay datos oficiales.
- Opciones de despliegue: `onnxruntime` (requisito indicado en la model card). También es compatible con el ecosistema sherpa-onnx según la documentación de NeMo/sherpa, aunque no se confirma para este modelo concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables de ASR en kinyarwanda ni de otros modelos NeMo CTC exportados a ONNX con los que establecer una comparación rigurosa de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: 9 hablantes de test, en su mayoría hombres jóvenes adultos, grabaciones en interiores silenciosos, habla leída y descrita por imágenes, no conversacional. Se desconoce el rendimiento en niños, otras discapacidades, entornos ruidosos, audio telefónico o habla con code-switching.
- Objetivos verbatim: las repeticiones por tartamudeo se escriben literalmente en las transcripciones, y los modelos entrenados con ellas pueden escribirlas o no; los bloqueos y prolongaciones no son visibles en el texto.
- Los estímulos de texto son más fáciles: las frases leídas también aparecen en las transcripciones de entrenamiento; los resultados con estímulos de imagen son la mejor guía para habla abierta.
- No apto para decisiones sobre personas: no debe usarse para diagnosticar o evaluar ninguna condición del habla, identificar hablantes, ni para decisiones clínicas, legales o de aplicación de la ley. Los términos del CDLI prohíben reidentificar hablantes y crear voces que imiten a una persona.
- Riesgo de alucinación y errores de transcripción: una transcripción errónea puede cambiar el significado de lo dicho; se recomienda mostrar el texto al hablante antes de actuar sobre él.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero los términos del dataset CDLI imponen restricciones adicionales sobre reidentificación y clonación de voz.
- El repositorio requiere mantener `model.onnx.data` junto a `model.onnx` para que la inferencia funcione.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/nemo-ctc-ky-ft-10ep-onnx
- Modelo base: https://huggingface.co/oluwagbotty/nemo-ctc-ky-ft-10ep
- Dataset CDLI (acceso restringido): https://huggingface.co/datasets/cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0
- Documentación de NeMo en sherpa-onnx: https://csukuangfj.github.io/sherpa/onnx/nemo/index.html

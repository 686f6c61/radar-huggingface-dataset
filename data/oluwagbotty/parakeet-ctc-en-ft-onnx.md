# oluwagbotty/parakeet-ctc-en-ft-onnx

## Resumen

`oluwagbotty/parakeet-ctc-en-ft-onnx` es la exportación a ONNX del modelo de reconocimiento automático del habla (ASR) `oluwagbotty/parakeet-ctc-en-ft`, un ajuste fino de la familia Parakeet de NVIDIA. El resultado es un único grafo ONNX que va desde audio crudo mono a 16 kHz hasta log-probabilidades, empaquetando el front-end de audio, el encoder y el decoder CTC de NeMo en un solo artefacto que solo requiere `onnxruntime` para ejecutarse. Esto simplifica el despliegue en dispositivos y entornos donde instalar el stack completo de NeMo no es viable.

El modelo está pensado para transcripción de inglés con acento no estándar, concretamente inglés ruandés, y se ha entrenado con el CDLI Non-Standard Speech Dataset del Centre for Digital Language Inclusion (UCL, 2025), financiado por UK International Development a través del programa AT2030 y Google.org. El conjunto de datos contiene grabaciones en interiores de baja contaminación acústica, tomadas con una app de tableta a partir de descripciones de imágenes y frases leídas.

La relevancia de esta ficha es doble: por un lado, demuestra un patrón de exportación de modelos NeMo a ONNX con paridad funcional verificada (50 de 50 grabaciones de test producen el mismo texto greedy que NeMo); por otro, documenta un caso de adaptación de ASR a variedades de habla poco representadas, con limitaciones explícitas sobre hablantes, condiciones acústicas y uso responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + decoder CTC, exportado como grafo ONNX único |
| Parametros totales | no disponible (modelo base: familia Parakeet CTC; el modelo comparable `parakeet-ctc-1.1b` tiene 1.1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada variable; sin límite documentado) |
| Tipos de cuantizacion | no disponible (el tag `base_model:quantized` sugiere cuantización, pero no se especifica el esquema) |
| Idiomas soportados | inglés (en), con foco en inglés ruandés no estándar |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data`) |
| Entrada | `audio` float32 [1, samples], `length` int64 [1] |
| Salida | `log_probs` [1, frames, tokens + blank], `frames` |
| Tasa de muestreo | 16 kHz, mono |
| Decodificacion | greedy (mejor token por frame, fusionar repeticiones, descartar blanks) |
| Tamano del repo | 2.5 GB |
| Libreria | onnxruntime |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Parakeet de NVIDIA: un encoder FastConformer (variante eficiente de Conformer con atención subsampleada) seguido de un decoder CTC. La exportación a ONNX integra el front-end de audio de NeMo (extracción de features mel), el encoder y el decoder en un único grafo, de modo que la inferencia no requiere preprocesado externo ni dependencias de NeMo. La decodificación es CTC greedy, sin decodificación autorregresiva ni beam search, lo que reduce latencia y simplifica el pipeline.

El ajuste fino se realizó sobre el CDLI Non-Standard Speech Dataset (`cdli/rwandan_english_nonstandard_speech_v1.0`), grabado en Ruanda en 2026 en interiores con bajo ruido, mediante una app de tableta y con dos modalidades: descripciones libres a partir de imágenes y frases leídas. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en ASR CTC). La validación de la exportación reporta paridad con NeMo en 50 de 50 grabaciones de test (`check.json`), lo que constituye la principal garantía técnica del artefacto.

## Capacidades

- Reconocimiento automático del habla en inglés a partir de audio mono a 16 kHz.
- Transcripción verbatim: las repeticiones por tartamudeo se escriben tal cual aparecen en las transcripciones de entrenamiento.
- Adaptación a habla no estándar (inglés ruandés) en condiciones de interior y bajo ruido.
- Manejo de habla leída (frases de texto) y habla descriptiva libre (a partir de imágenes).
- Decodificación CTC greedy determinista, sin muestreo ni autoregresión.
- Ejecución ligera vía `onnxruntime`, sin necesidad del stack NeMo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta visión, audio de entrada más allá de la transcripción ni otras modalidades.
- No se documenta soporte multilingüe más allá del inglés.

## Casos de uso

- Transcripción de audio en dispositivos edge: el grafo ONNX único permite ejecutar ASR en hardware con solo `onnxruntime`, sin GPU ni NeMo, útil para apps móviles o embebidos con audio a 16 kHz.
- Accesibilidad para hablantes de inglés no estándar: el ajuste fino sobre inglés ruandés mejora la transcripción de variedades poco representadas en modelos ASR comerciales, en contextos de inclusión digital.
- Subtitulado y documentación de entrevistas: grabaciones en interiores de baja contaminación acústica pueden transcribirse con decodificación greedy de baja latencia.
- Investigación en ASR inclusivo: sirve como baseline reproducible para estudiar el rendimiento en habla no estándar y comparar con modelos Parakeet genéricos.
- Pipelines de evaluación de exportaciones NeMo a ONNX: el par `model.onnx` + `model.onnx.data` y el script `src/export_nemo_onnx.py` documentan un patrón replicable para otros modelos NeMo.
- Prototipado rápido de ASR en Python: la API de ONNX con entradas `audio`/`length` y salidas `log_probs`/`frames` permite integrar el modelo en scripts sin dependencias pesadas.
- Transcripción de frases leídas en entornos controlados: el propio autor advierte que las frases de texto son más fáciles porque aparecen en el entrenamiento, por lo que este caso debe tratarse con cautela.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la paridad funcional con NeMo: el grafo ONNX produce el mismo texto greedy que NeMo en 50 de 50 grabaciones de test (`check.json`). No se dispone de WER, CER ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible. El repo pesa 2.5 GB, lo que da una cota superior del tamaño de los pesos; la VRAM real depende del esquema de cuantización (no documentado) y de la longitud del audio.
- GPU recomendadas: no disponible en la información proporcionada. El modelo comparable `parakeet-ctc-1.1b-onnx` se presenta como conversión para despliegue edge, lo que sugiere viabilidad en GPUs consumer, pero no se confirma para este artefacto.
- ¿Cabe en GPU consumer? No confirmado. La ejecución vía `onnxruntime` permite CPU y GPU, pero no se especifican requisitos mínimos.
- Opciones de despliegue: `onnxruntime` (CPU o GPU). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a ASR CTC).
- Latencia y throughput: no disponibles. La decodificación CTC greedy evita autoregresión y debería ser de baja latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `oluwagbotty/parakeet-ctc-en-ft-onnx` | no disponible | audio variable | CC-BY-4.0 | ONNX | Ajuste fino en inglés ruandés no estándar; paridad NeMo 50/50 |
| `affectively-ai/parakeet-ctc-1.1b-onnx` | 1.1B | audio variable | no disponible en la información | ONNX | Conversión de `nvidia/parakeet-ctc-1.1b`; 64K horas de inglés; orientado a edge |
| `nvidia/parakeet-ctc-1.1b` | 1.1B | audio variable | no disponible en la información | NeMo | Modelo base de NVIDIA + Suno.ai; inglés general |
| `oluwagbotty/parakeet-ctc-en-ft` | no disponible | audio variable | CC-BY-4.0 | NeMo | Modelo padre del artefacto ONNX; mismos datos de ajuste fino |

La comparación cuantitativa de WER no está disponible. La diferencia principal entre este modelo y `parakeet-ctc-1.1b-onnx` es el dominio: el primero está ajustado a inglés ruandés no estándar, el segundo es un ASR genérico de inglés entrenado con 64K horas.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: 9 hablantes de test, mayoritariamente hombres jóvenes adultos, grabaciones en interiores silenciosos, habla leída y descrita por imágenes, no conversacional.
- Rendimiento desconocido en niños, otras discapacidades del habla, entornos ruidosos, audio telefónico o habla con cambio de código.
- Objetivos verbatim: las repeticiones por tartamudeo se escriben; los bloqueos y prolongaciones no son visibles en el texto, lo que puede generar transcripciones ambiguas.
- Sesgo de facilidad en frases leídas: las frases de texto aparecen en las transcripciones de entrenamiento, por lo que los resultados con descripciones de imágenes son la guía más fiable para habla abierta.
- Prohibido para decisiones sobre personas: no usar para diagnosticar o evaluar condiciones del habla, identificar hablantes ni en contextos clínicos, legales o policiales.
- Los términos de CDLI prohíben reidentificar hablantes y construir voces que imiten a un hablante.
- Riesgo de que una transcripción errónea cambie el significado de lo dicho: mostrar el texto al hablante antes de actuar sobre él.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero los términos del dataset CDLI añaden restricciones adicionales sobre reidentificación y clonación de voz.
- El dataset CDLI está protegido por gating y no se incluye en el repositorio; no puede compartirse desde él.
- No se documentan sesgos demográficos más allá de la composición de hablantes descrita; el riesgo de alucinación en ASR se manifiesta como sustituciones o omisiones de tokens, no como texto inventado libre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/parakeet-ctc-en-ft-onnx
- Modelo base: https://huggingface.co/oluwagbotty/parakeet-ctc-en-ft
- Dataset CDLI: https://huggingface.co/datasets/cdli/rwandan_english_nonstandard_speech_v1.0
- Modelo comparable (Parakeet CTC 1.1B ONNX): https://huggingface.co/affectively-ai/parakeet-ctc-1.1b-onnx
- Modelo original NVIDIA: https://huggingface.co/nvidia/parakeet-ctc-1.1b

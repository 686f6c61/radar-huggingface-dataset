# Netra-Lab/karna-large

## Resumen

karna-large es un reconocedor de voz CTC de 217 millones de parámetros desarrollado por Netra-Lab, especializado en jemer (khmer) e inglés. Se obtiene mediante poda estructurada del modelo Omnilingual ASR `omniASR_CTC_1B` de Meta, reduciendo el encoder a aproximadamente un 80 % de dispersión. El resultado es un modelo que corre sobre ONNX Runtime en CPU, sin necesidad de PyTorch, gracias al paquete `netra-karna`.

El modelo resuelve el problema del coste computacional de los sistemas ASR multilingües de gran tamaño en contextos de producción con recursos limitados. Frente a su modelo base de 975 millones de parámetros, karna-large reduce los GMAC por segundo de audio de 50,3 a 12,9, manteniendo una precisión en jemer muy cercana a la de su profesor afinado (1,33 % de CER en DDD frente a 1,22 %). En inglés, en cambio, la degradación es mayor.

Es relevante ahora porque demuestra que la poda estructurada agresiva seguida de destilación permite desplegar ASR de calidad en hardware modesto, y porque cubre jemer, un idioma con escasa representación en modelos ASR abiertos. La versión actual (v2) mejora todos los conjuntos de prueba respecto a la primera publicación (204M parámetros, DDD 1,77, test-clean 6,07).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo wav2vec2 con CTC (48 capas pre-LayerNorm, anchura 1.280, extractor convolucional de 7 capas) |
| Parametros totales | 217.181.897 (encoder: 205M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio en ventanas; un frame cada 20 ms) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Jemer (km), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |
| Vocabulario de salida | 9.812 caracteres (script jemer y latino) |
| Entrada de audio | 16 kHz |
| Coste computacional | 12,9 GMAC por segundo de audio |
| Modelo base | facebook/omniASR-CTC-1B |

## Arquitectura y entrenamiento

karna-large es un encoder transformer estilo wav2vec2 con cabeza CTC. La entrada es audio a 16 kHz que pasa por un extractor de características convolucional de 7 capas que produce un frame cada 20 ms; a continuación se suma un codificador posicional convolucional y se procesan 48 capas transformer pre-LayerNorm de anchura 1.280, con una LayerNorm final y una cabeza CTC sobre 9.812 caracteres. La poda elimina cabezas de atención y unidades FFN completas de forma no uniforme: cada capa tiene su propia anchura, especificada en `config.json` mediante `num_heads` y `ffn_dims`. El extractor convolucional y la capa de salida se mantienen intactos. Por ejemplo, la capa 12 conserva 11 de 16 cabezas y 3.788 de 5.120 unidades FFN.

El proceso de construcción sigue la receta de *Fine-tune Before Structured Pruning* (arXiv 2505.24111) con el método de poda de DPHuBERT (arXiv 2305.17651), tal como se usa en DiariZen. Consta de cinco fases: (1) afinado del `omniASR_CTC_1B` con CTC durante 62k pasos sobre la mezcla de entrenamiento, produciendo el profesor; (2) poda durante 12k pasos con compuertas Hard Concrete L0 sobre cabezas y unidades FFN, con una restricción de Lagrange aumentada que eleva la dispersión objetivo hasta el 80 % en los primeros 6k pasos, destilando del profesor con pérdida L1 − coseno sobre estados ocultos en las capas 12, 24, 36 y 48; (3) eliminación definitiva de las unidades podadas; (4) destilación adicional de 5k pasos con la máscara congelada; y (5) recuperación de 24k pasos con CTC más divergencia KL a nivel de frame respecto a la distribución de salida del profesor (temperatura 1, peso 1). La mezcla de entrenamiento es 50/50 por idioma: jemer (DDD train y FLEURS-km train) e inglés (FLEURS-en train y LibriSpeech).

## Capacidades

- Reconocimiento de voz a texto en jemer e inglés con decodificación CTC greedy, sin modelo de lenguaje externo.
- Transcripción de audio a 16 kHz con una resolución temporal de un frame cada 20 ms.
- Manejo de vocabulario de 9.812 caracteres que cubre tanto script jemer como latino.
- Inferencia en CPU mediante ONNX Runtime con el paquete `netra-karna`, sin dependencia de PyTorch.
- Ejecución también mediante el código PyTorch incluido en el repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo thinking: es un modelo puramente ASR.
- Capacidad multilingüe limitada a los dos idiomas entrenados (km, en).

## Casos de uso

- Transcripción de audio en jemer para servicios de subtitulado: el modelo ofrece un CER del 1,33 % en DDD y del 10,20 % en FLEURS-km, adecuado para generar subtítulos automáticos en contenido jemer con revisión humana ligera.
- Despliegue en servidores sin GPU: al ejecutarse sobre ONNX Runtime en CPU con 12,9 GMAC por segundo de audio, permite montar servicios de transcripción en infraestructura convencional sin aceleradores.
- Procesamiento por lotes de archivos de audio en pipelines de datos: la baja huella computacional (217M parámetros) facilita transcribir grandes volúmenes de grabaciones en jemer o inglés en paralelo en CPU.
- Aplicaciones de accesibilidad para hablantes de jemer: conversión de voz a texto en tiempo casi real en dispositivos de gama baja, gracias a la inferencia sin PyTorch y al tamaño reducido del modelo.
- Transcripción de reuniones y notas de voz en inglés: con un WER del 5,44 % en LibriSpeech test-clean, es válido para actas y resúmenes posteriores en entornos donde no se dispone de GPU.
- Integración en herramientas de línea de comandos o servicios ligeros vía el paquete `netra-karna` de PyPI o la imagen Docker publicada, para equipos que necesitan ASR bilingüe sin gestionar dependencias de fairseq2.
- Investigación en poda estructurada de modelos ASR: el repositorio y el código PyTorch incluido sirven como referencia reproducible de la receta fine-tune → prune → distil.

## Benchmarks y rendimiento

Decodificación CTC greedy, sin modelo de lenguaje. CER para jemer, WER para inglés, en porcentaje (menor es mejor).

| Modelo | Parametros | GMAC / s audio | DDD (km) | FLEURS-km | FLEURS-en | LibriSpeech test-clean | LibriSpeech test-other |
|---|---|---|---|---|---|---|---|
| `omniASR_CTC_1B` (stock) | 975M | 50,3 | 5,95 | 11,26 | 12,38 | 4,40 | 8,87 |
| Fine-tuned 1B (teacher) | 975M | 50,3 | 1,22 | 7,77 | 12,01 | 3,54 | 7,96 |
| **karna-large** | **217M** | **12,9** | **1,33** | **10,20** | **18,15** | **5,44** | **12,98** |

- En jemer, karna-large queda a 0,11 puntos de su profesor sin podar en DDD y su error es menos de una cuarta parte del del modelo stock.
- En inglés conserva mucha menos precisión: aproximadamente 1,5–2 veces el WER del profesor y por detrás del modelo stock.
- FLEURS-km y FLEURS-en train forman parte de la mezcla de entrenamiento, por lo que sus conjuntos de prueba son in-domain.
- Tiempo de inferencia para una locución de 60 s (batch 1, bf16, mediana de 20 ejecuciones): comparado a 0 % de dispersión (profesor) y ~80 % (Karna), según la figura del repositorio; los valores numéricos concretos no están disponibles en el texto.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 217M parámetros, los pesos en fp32 ocupan aproximadamente 0,9 GB y en bf16 unos 0,45 GB, más el estado de inferencia.
- GPU recomendadas: no especificadas por el autor; el modelo está diseñado para ejecutarse en CPU mediante ONNX Runtime.
- Cabe en GPU consumer: sí, por tamaño (cualquier GPU con al menos ~1 GB de memoria libre podría alojar los pesos), aunque el diseño apunta a inferencia en CPU.
- Opciones de despliegue: ONNX Runtime con el paquete `netra-karna` (PyPI), imagen Docker `ghcr.io/netra-ai-lab/karna`, y código PyTorch incluido en el repositorio. fairseq2 / `omnilingual-asr` no pueden cargarlo debido a las anchuras de capa no uniformes.
- Latencia y throughput: el autor publica una figura comparativa de tiempo de inferencia para 60 s de audio a 0 % y ~80 % de dispersión, pero los valores numéricos no están disponibles en el texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento (DDD km / LibriSpeech clean) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| karna-large | 217M | Audio 16 kHz | 1,33 / 5,44 | Apache 2.0 | Hugging Face, ONNX + PyTorch |
| omniASR_CTC_1B (stock) | 975M | Audio 16 kHz | 5,95 / 4,40 | No disponible en la información | Hugging Face (Meta) |
| Fine-tuned 1B (teacher) | 975M | Audio 16 kHz | 1,22 / 3,54 | No disponible en la información | No disponible como release independiente (la primera versión del profesor está en Darayut/omniASR-CTC-1B-km-en) |
| karna-base | No disponible | Audio 16 kHz | No disponible | Apache 2.0 | Hugging Face |

La comparación directa con alternativas ASR de propósito general (Whisper, etc.) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El rendimiento en inglés es claramente inferior al de su profesor y al del modelo stock: WER de 18,15 % en FLEURS-en y 12,98 % en LibriSpeech test-other, aproximadamente 1,5–2 veces el del profesor.
- Solo cubre jemer e inglés; no es un modelo multilingüe general.
- FLEURS-km y FLEURS-en train están en la mezcla de entrenamiento, por lo que sus resultados de prueba son in-domain y no reflejan rendimiento fuera de dominio.
- La decodificación es CTC greedy sin modelo de lenguaje, lo que limita la corrección de errores lingüísticos.
- Las anchuras de capa no uniformes impiden cargarlo con fairseq2 u `omnilingual-asr`; es obligatorio usar el paquete `karna` o el código PyTorch del repositorio.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo ASR, los errores se manifiestan como sustituciones, omisiones e inserciones en la transcripción.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base `facebook/omniASR-CTC-1B` del que deriva.
- No se han documentado evaluaciones fuera de los conjuntos de prueba indicados ni comportamiento con audio ruidoso o acentos no representados en el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Netra-Lab/karna-large
- Modelo base: https://huggingface.co/facebook/omniASR-CTC-1B
- Modelo hermano (base): https://huggingface.co/Netra-Lab/karna-base
- Profesor de la primera versión: https://huggingface.co/Darayut/omniASR-CTC-1B-km-en
- Repositorio GitHub: https://github.com/netra-ai-lab/Karna
- Imagen Docker: https://github.com/netra-ai-lab/Karna/pkgs/container/karna
- Paquete PyPI: https://pypi.org/project/netra-karna/
- Paper de la receta de poda: https://arxiv.org/abs/2505.24111
- Paper del método DPHuBERT: https://arxiv.org/abs/2305.17651
- Dataset DDD (jemer): https://huggingface.co/datasets/Digital-Divide-Data/khmer-speech-dataset
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset LibriSpeech: https://huggingface.co/datasets/openslr/librispeech_asr
- Revisión de la primera versión (v1): https://huggingface.co/Netra-Lab/karna-large/tree/593366493e

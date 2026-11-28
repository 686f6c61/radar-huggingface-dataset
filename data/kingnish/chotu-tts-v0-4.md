# KingNish/Chotu-TTS-v0.4

## Resumen

Chotu TTS v0.4 es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por KingNish, diseñado para ejecutarse en dispositivos de borde (edge AI) con un tamaño excepcionalmente reducido. El modelo completo en cuantización INT8 ocupa menos de 1 MB (0,978 MB) y cuenta con 795.811 parámetros, lo que lo sitúa en una categoría de ultra-ligereza poco habitual en TTS con capacidades de clonación de voz zero-shot. Se distribuye en formato ONNX estándar (opset 17), lo que facilita su despliegue en entornos sin dependencias de frameworks de deep learning pesados.

La versión 0.4 introduce clonación de voz zero-shot nativa mediante embeddings de altavoz de 256 dimensiones normalizados L2, basados en WeSpeaker ResNet34-LM, con ficheros de voz de tan solo 1 KB. Además, incorpora 500 altavoces reales, condicionamiento explícito de F0 y tasa de duración, y LoRA por bucle en los cuatro bucles del decodificador compartido. El modelo está pensado para streaming y despliegue en CPU, con un RTF (real-time factor) de 0,0092 en 2 núcleos de CPU, lo que lo hace viable incluso en hardware muy limitado.

Su relevancia actual radica en la combinación de un tamaño inferior a 1 MB con capacidades de clonación de voz y streaming, algo poco frecuente en la categoría de TTS. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, y el formato ONNX estándar simplifica la integración en pipelines de producción ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal con decodificador de 4 bucles compartidos XSA-SWA, FiLM compartido, proyección de encoder y LoRA por bucle (r=16); exportado a ONNX (opset 17) |
| Parametros totales | 795.811 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP32 (3,221 MB), INT8 mixed-mode (1,177 MB), INT8 completo (0,978 MB) |
| Idiomas soportados | Inglés (según model card); lista completa de idiomas no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`ai.onnx` opset 17); voces en ficheros `.bin` de 1 KB; vocabulario en `vocab.json` |

## Arquitectura y entrenamiento

La arquitectura se basa en un decodificador con cuatro bucles compartidos de tipo XSA-SWA (cross-self-attention con sliding window attention), con un módulo FiLM compartido que proyecta 256 dimensiones a 40 y alimenta tanto al decodificador (1280) como al vocoder (960). El encoder se proyecta de 256 a 96 dimensiones. Se incorpora condicionamiento explícito de F0 (frecuencia fundamental) y de tasa de duración, junto con LoRA por bucle (r=16) en cada uno de los cuatro bucles del decodificador. La clonación de voz se realiza mediante un embedding de altavoz de 256 dimensiones normalizado L2, generado por un modelo WeSpeaker ResNet34-LM, almacenado en ficheros `.bin` de 1 KB por voz.

Durante el entrenamiento se utiliza un módulo `MASAligner` (Monotonic Alignment Search con forward-sum loss) específico para habla humana real, que se elimina por completo en la exportación a ONNX. El modelo se entrenó con más de 500 altavoces reales, aunque no se especifica el número total de tokens ni la composición exacta del dataset. No se menciona el uso de RLHF o DPO. La innovación principal es la compresión extrema manteniendo clonación zero-shot y streaming, con un RTF de 0,0092 en 2 núcleos de CPU para la variante INT8.

## Capacidades

- Generación de voz en inglés con calidad inteligible (UTMOS 3,772 en altavoces vistos y 3,525 en no vistos).
- Clonación de voz zero-shot mediante embeddings de altavoz de 1 KB (WeSpeaker ResNet34-LM, 256 dimensiones).
- Soporte de más de 500 altavoces reales preentrenados, con los 50 más diversos incluidos en `voices/`.
- Streaming de audio con RTF inferior a 0,01 en CPU de 2 núcleos.
- Condicionamiento explícito de F0 y tasa de duración para control prosódico.
- Multialtavoz (multi-speaker) nativo.
- Ejecución en dispositivos de borde gracias a formato ONNX y tamaño inferior a 1 MB en INT8.
- No se menciona soporte de tool calling, agentes, visión, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz en dispositivos embebidos: el modelo puede ejecutarse en microcontroladores o SBCs con CPU de 2 núcleos gracias a su tamaño inferior a 1 MB en INT8 y RTF de 0,0092, generando voz en tiempo real sin GPU.
- Clonación de voz personalizada en aplicaciones de accesibilidad: con `clone_voice.py` y un fichero de referencia de audio, se puede generar una voz personalizada de 1 KB para sistemas de comunicación aumentativa en entornos con recursos limitados.
- Generación de audiolibros o contenido narrado en lote: el modelo permite sintetizar texto en inglés con múltiples voces preentrenadas, adecuado para pipelines offline donde el coste computacional por frase es mínimo.
- Integración en navegadores web o aplicaciones móviles: al ser ONNX estándar (opset 17), puede ejecutarse con ONNX Runtime Web o Mobile sin dependencias pesadas, habilitando TTS local en el cliente.
- Sistemas de atención al cliente con respuesta de voz: el modelo puede generar respuestas habladas en inglés con latencia muy baja en servidores CPU, reduciendo costes frente a soluciones basadas en GPU.
- Prototipado rápido de interfaces de voz: gracias a su licencia Apache 2.0 y formato ONNX, se puede integrar en pruebas de concepto y demos sin necesidad de infraestructura especializada.
- Investigación en TTS de bajo consumo: sirve como referencia para estudiar técnicas de compresión extrema (LoRA, FiLM, cuantización INT8) en modelos de síntesis de voz.

## Benchmarks y rendimiento

| Metrica | Altavoces vistos | Altavoces no vistos (zero-shot) |
|---|---|---|
| UTMOS | 3,772 | 3,525 |
| WeSpeaker Cosine | 0,342 | 0,296 |
| MCD (dB) | 12,30 | 12,87 |

| Fichero | Tamano | RTF (2 CPU) |
|---|---|---|
| `chotu_tts_v0_4_fp32.onnx` | 3,221 MB | 0,0106 |
| `chotu_tts_v0_4_int8_mm.onnx` | 1,177 MB | 0,0092 |
| `chotu_tts_v0_4_int8_all.onnx` | 0,978 MB | 0,0092 |

No se han publicado resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K no aplican a TTS) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para CPU. En GPU, el consumo de memoria es inferior a 1 MB en INT8 y aproximadamente 3,2 MB en FP32.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime es suficiente, aunque el modelo está optimizado para CPU.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en dispositivos sin GPU.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), ONNX Runtime Web, ONNX Runtime Mobile; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato).
- Latencia y throughput: RTF de 0,0092 en 2 núcleos de CPU para INT8, lo que implica aproximadamente 108 veces más rápido que tiempo real en ese hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Clonacion zero-shot | Tamano minimo |
|---|---|---|---|---|---|---|
| Chotu TTS v0.4 | 795.811 | No disponible | Apache 2.0 | ONNX | Si | 0,978 MB (INT8) |
| Piper TTS | No disponible | No disponible | MIT | ONNX | No | Variable (decenas de MB) |
| Coqui TTS (modelos ligeros) | No disponible | No disponible | MPL 2.0 | PyTorch/ONNX | Limitada | Decenas de MB |
| VITS (variantes pequeñas) | No disponible | No disponible | MIT | PyTorch/ONNX | No | Decenas de MB |

No se dispone de datos de benchmarks comparativos directos con estos modelos en la información proporcionada. La comparativa se basa en características generales de la categoría; los datos de modelos alternativos no están verificados en esta ficha.

## Limitaciones y advertencias

- El modelo solo soporta inglés según la model card; no se especifica soporte multilingüe.
- La calidad de voz es limitada: UTMOS de 3,525 en zero-shot y MCD de 12,87 dB indican una fidelidad inferior a modelos TTS de mayor tamaño.
- La similitud de voz en zero-shot es moderada (WeSpeaker Cosine 0,296), lo que puede producir clones poco fieles al altavoz de referencia.
- Riesgo de alucinación o artefactos en la síntesis, especialmente en textos largos o con prosodia compleja, dado el tamaño extremo del modelo.
- No se han publicado análisis de sesgos; al entrenarse con 500 altavoces reales, puede heredar sesgos de acento, género o edad del dataset no documentado.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que el uso de clonación de voz cumple con la legislación aplicable (derechos de imagen, consentimiento).
- El repo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación comunitaria.
- No se especifica la longitud máxima de texto de entrada ni el contexto; textos muy largos pueden requerir segmentación manual.
- El modelo no incluye capacidades de tool calling, agentes ni visión.

## Enlaces

- Hugging Face: https://huggingface.co/KingNish/Chotu-TTS-v0.4
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.

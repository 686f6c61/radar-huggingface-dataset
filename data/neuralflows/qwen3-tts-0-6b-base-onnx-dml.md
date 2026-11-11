# Neuralflows/qwen3-tts-0.6b-base-onnx-dml

## Resumen

Qwen3-TTS 0.6B Base ONNX DirectML es una conversión del modelo de síntesis de voz Qwen/Qwen3-TTS-12Hz-0.6B-Base (desarrollado por el equipo Qwen de Alibaba Cloud) a formato ONNX con formas fijas, publicada por Neuralflows. Su objetivo es ejecutar clonación de voz en tiempo real sobre el proveedor de ejecución DirectML de ONNX Runtime en Windows, aprovechando cualquier GPU compatible con DirectX 12 (AMD, NVIDIA o Intel) sin necesidad de Python ni CUDA. Es el motor de voz de la aplicación de escritorio LICHEN.

El modelo base emplea una arquitectura de dos etapas típica en TTS neuronales modernos: un "talker" autorregresivo que genera tokens de códec en ventanas de 80 ms y un vocoder que los convierte en forma de onda a 24 kHz mono. La conversión redistribuye los pesos originales en tres grafos ONNX de formas fijas (`prefill.onnx`, `frame.onnx`, `vocoder.onnx`) más tablas de embeddings en un fichero binario aparte, con precisión mixta (talker en fp16, predictor de códigos y vocoder en fp32).

La relevancia de esta ficha radica en que demuestra una vía práctica para desplegar TTS con clonación de voz en hardware de consumo Windows sin dependencias de CUDA, a costa de fijar la longitud de prompt (384 posiciones) y la ventana de decodificación (75 frames). El repo ocupa 2,3 GB y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal en dos etapas: talker autorregresivo (transformer) + predictor de códigos + vocoder; exportada a ONNX con formas fijas |
| Parametros totales | 0.6B (según denominación del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Prompt fijado a 384 posiciones; caché KV de 1024 posiciones; ventana de vocoder de 75 frames (25 de contexto izquierdo + hasta 50 nuevos) |
| Tipos de cuantizacion | Precisión mixta: talker fp16, predictor de códigos fp32, vocoder fp32; tablas de embeddings en f16 little-endian |
| Idiomas soportados | es, en, zh, ja, ko, de, fr, ru, pt, it |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`prefill.onnx`, `frame.onnx`, `vocoder.onnx`), `talker.weights`, `tables.bin`, `vocab.json`, `merges.txt` |

## Arquitectura y entrenamiento

El modelo base Qwen3-TTS-12Hz-0.6B-Base es un sistema de text-to-speech con clonación de voz que genera tokens de códec a 12 Hz (un frame cada 80 ms). La conversión a ONNX mantiene esa estructura pero la reorganiza en tres grafos de formas fijas para evitar la recompilación dinámica de DirectML, que según el autor resulta unas 15 veces más lenta que tiempo real con formas dinámicas. `prefill.onnx` procesa el prompt (embeddings de texto, rellenados con ceros hasta 384 posiciones) y produce logits, estado oculto y caché KV de 1024 posiciones. `frame.onnx` genera un frame completo de 80 ms por llamada: muestrea el códec 0, ejecuta los 15 pasos del predictor de códigos y da un paso del talker; el muestreo (temperatura, top-k 50, penalización de repetición) se realiza dentro del grafo mediante CDF inversa sobre 16 números uniformes que el host proporciona. `vocoder.onnx` convierte 75 frames en 144 000 muestras de audio a 24 kHz.

No se dispone de información sobre el dataset de entrenamiento del modelo base (número de tokens, composición, uso de RLHF/DPO) en la información proporcionada. La innovación técnica destacable de esta conversión es la combinación de formas fijas, muestreo dentro del grafo y precisión mixta: el talker en fp16 y el predictor de códigos en fp32 porque en fp16 la MLP de su capa 2 supera 150 000 y desborda. Según el autor, los grafos fp32 producen logits y códigos idénticos a los del modelo PyTorch oficial con las mismas semillas, y la versión de precisión mixta enviada genera los mismos códigos greedy que fp32 en DirectML, con una diferencia máxima de 0,08 en los logits de prefill.

## Capacidades

- Síntesis de voz (text-to-speech) en 10 idiomas: español, inglés, chino, japonés, coreano, alemán, francés, ruso, portugués e italiano.
- Clonación de voz a partir de audio de referencia, orientada a tiempo real.
- Generación de audio a 24 kHz mono mediante vocoder causal con ventana de 75 frames.
- Muestreo configurable dentro del grafo: temperatura, top-k 50 y penalización de repetición.
- Detección de fin de habla mediante el código 2150 en `codes[0]`.
- Ejecución sobre cualquier GPU DirectX 12 (AMD, NVIDIA, Intel) mediante DirectML, sin CUDA ni Python.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Clonación de voz en aplicaciones de escritorio Windows: el modelo se integra mediante ONNX Runtime con DirectML y permite generar locuciones con una voz clonada en equipos con GPU de consumo, sin instalar CUDA ni Python.
- Lectura de documentos y accesibilidad: conversión de texto a voz en 10 idiomas con una voz consistente, útil para lectores de pantalla o aplicaciones de accesibilidad que necesitan baja latencia en hardware modesto.
- Doblaje y localización de contenido: generación de pistas de voz en español, inglés, francés, alemán, etc., reutilizando una voz de referencia para mantener la identidad del hablante entre idiomas.
- Asistentes conversacionales locales: integración en asistentes de escritorio que requieren respuestas habladas en tiempo real; el rendimiento medido de unos 32 ms por frame de 80 ms (0,6× tiempo real en una Radeon RX 6800 XT) es adecuado para respuestas por turnos.
- Prototipado de productos de voz sin infraestructura cloud: el formato ONNX con formas fijas y la licencia Apache-2.0 permiten distribuir el motor dentro de una aplicación de escritorio sin depender de servicios externos.
- Generación de audiolibros y contenido narrado: la ventana de 75 frames del vocoder y la caché de 1024 posiciones permiten sintetizar pasajes largos por fragmentos manteniendo coherencia de voz.
- Pruebas de calidad de voz en pipelines de datos: el autor documenta la evaluación con 60 frases en español transcritas con Whisper small (WER medio 0,04, cero frases ininteligibles), lo que sirve como referencia para validar clones de voz antes de producción.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Fidelidad de logits y códigos (fp32) | Idénticos al modelo PyTorch oficial con las mismas semillas | Grafos de formas fijas, fp32 |
| Consistencia CPU vs DirectML | 56 de 56 frames idénticos en una frase de prueba | ONNX Runtime CPU y DirectML |
| Precisión mixta enviada | Mismos códigos greedy que fp32 en DirectML; diferencia máxima de 0,08 en logits de prefill | fp16 talker, fp32 code predictor |
| Inteligibilidad (español) | 60 frases con voz clonada, 0 ininteligibles (WER > 0,35), WER medio 0,04 | Transcripción con Whisper small |
| Velocidad | ~32 ms por frame de 80 ms; ~0,6× tiempo real extremo a extremo | Radeon RX 6800 XT |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, al tratarse de un modelo de síntesis de voz.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 2,3 GB y los pesos se cargan en fp16/fp32 según el grafo, por lo que se recomienda al menos 4 GB de VRAM para margen.
- GPU recomendadas: cualquier GPU compatible con DirectX 12 (AMD, NVIDIA o Intel). El autor midió el rendimiento en una Radeon RX 6800 XT.
- Cabe en GPU de consumo: sí, al ejecutarse sobre DirectML en GPUs DirectX 12 de consumo; no requiere CUDA.
- Opciones de despliegue: ONNX Runtime con el proveedor DirectML (Windows); ONNX Runtime CPU también validado para los grafos de formas fijas.
- Latencia y throughput: aproximadamente 32 ms por frame de 80 ms en una RX 6800 XT, es decir, alrededor de 0,6× tiempo real extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Neuralflows/qwen3-tts-0.6b-base-onnx-dml | 0.6B | Prompt 384 posiciones, KV 1024, vocoder 75 frames | 10 | Apache-2.0 | ONNX (DirectML) |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base | 0.6B | no disponible | no disponible | Apache-2.0 | PyTorch (safetensors) |
| Alternativas de TTS open source de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks comparativos con otros modelos de TTS, por lo que la comparación se limita a la relación con el modelo base original.

## Limitaciones y advertencias

- Formas fijas: el prompt se limita a 384 posiciones y la caché KV a 1024; entradas más largas requieren troceado por parte del host.
- Ventana de vocoder fija de 75 frames (25 de contexto izquierdo más hasta 50 nuevos); no admite decodificación de longitud arbitraria en una sola llamada.
- Dependencia de Windows y DirectX 12 para el proveedor DirectML; en otros sistemas habría que usar el proveedor CPU de ONNX Runtime u otra conversión.
- Precisión mixta: el predictor de códigos debe permanecer en fp32 porque en fp16 desborda; modificarlo puede degradar la calidad.
- Riesgo de alucinación y artefactos de voz: no se documentan sesgos específicos ni tasas de error más allá de la evaluación con Whisper small en español (WER medio 0,04).
- La clonación de voz plantea riesgos de suplantación y uso indebido; aunque la licencia es Apache-2.0 y permite uso comercial, es responsabilidad del integrador aplicar consentimiento y controles.
- Sin datos publicados sobre calidad en idiomas distintos del español en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria adicional.

## Enlaces

- Hugging Face: https://huggingface.co/Neuralflows/qwen3-tts-0.6b-base-onnx-dml
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Paper de Qwen3-TTS: https://arxiv.org/abs/2601.15621
- Scripts de exportación de referencia (wavekat-tts): https://github.com/wavekat/wavekat-tts

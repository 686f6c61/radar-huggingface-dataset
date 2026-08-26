# ashwmurt/neutts_nano

## Resumen

NeuTTS-Nano es un modelo de síntesis de voz (text-to-speech) desarrollado por Neuphonic, diseñado específicamente para ejecutarse en dispositivos con recursos limitados, como smartphones Android con procesadores Snapdragon. Combina un pequeño backbone de modelo de lenguaje causal de la familia Llama con NeuCodec, un codec de audio neuronal de código abierto que opera a 50 Hz, para generar voz natural a 24 kHz. Su principal innovación es la clonación de voz instantánea a partir de un clip de referencia corto, sin necesidad de entrenamiento adicional, y su capacidad de funcionar en tiempo real sobre CPU, lo que elimina la dependencia de APIs web.

El modelo se distribuye como una receta compatible con Qualcomm AI Hub Models, lo que permite compilarlo y evaluarlo en dispositivos Snapdragon reales mediante Qualcomm AI Hub Workbench. Con 228,7 millones de parámetros totales y 116,8 millones activos, NeuTTS-Nano es aproximadamente tres veces más pequeño que NeuTTS Air, su predecesor, manteniendo una calidad de voz competitiva. Está disponible en versiones para inglés, español, francés y alemán, y su implementación de referencia se encuentra en el repositorio oficial de Neuphonic.

La relevancia actual de NeuTTS-Nano radica en su enfoque on-device: permite integrar síntesis de voz con clonación de voz en aplicaciones móviles sin conexión, con latencia reducida y privacidad garantizada, un área de creciente interés para asistentes virtuales, accesibilidad y contenido generado por voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM causal tipo Llama (backbone) + NeuCodec (codec de audio neuronal a 50 Hz) |
| Parametros totales | 228,7 millones |
| Parametros activos | 116,8 millones (sugiere arquitectura MoE, no confirmada oficialmente) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8 GGUF, Q4 GGUF (ademas de formatos para exportacion a QNN, TFLite, ONNX) |
| Idiomas soportados | ingles (modelo base), con versiones en espanol, frances y aleman |
| Licencia | other (licencia original en el repositorio de GitHub, no especificada) |
| Formato de pesos | safetensors (PyTorch), GGUF (Q8, Q4), QNN context binary |

## Arquitectura y entrenamiento

NeuTTS-Nano se compone de dos elementos principales: un modelo de lenguaje causal de la familia Llama, de tamaño compacto, que actúa como backbone generativo, y NeuCodec, un codec de audio neuronal de código abierto que convierte la salida del LM en audio de 24 kHz. El backbone se exporta como dos grafos separados: un prefill de 128 tokens y un decode de un token, ambos enlazados en un contexto binario con pesos compartidos. La fonemización, el ensamblaje del prompt, el muestreo y el encode/decode de NeuCodec se ejecutan en CPU dentro de la aplicación, lo que facilita su integración en entornos móviles.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La arquitectura MoE se infiere por la diferencia entre parámetros totales y activos, aunque no está confirmada en la documentación oficial. La innovación principal reside en la combinación de un LM ligero con un codec de baja tasa de bits (50 Hz) y un solo codebook, lo que permite alcanzar tiempos reales en CPU sin sacrificar excesivamente la calidad de voz.

## Capacidades

- Generación de voz natural a 24 kHz a partir de texto, con entonación y prosodia adecuadas.
- Clonación de voz instantánea: a partir de un clip de referencia corto, el modelo puede imitar la voz del hablante sin entrenamiento adicional.
- Ejecución en tiempo real sobre CPU, sin necesidad de GPU dedicada, lo que lo hace apto para dispositivos móviles y embebidos.
- Soporte multilingüe: versiones específicas para inglés, español, francés y alemán.
- Integración on-device: puede exportarse a formatos como QNN context binary, TensorFlow Lite y ONNX Runtime para su despliegue en hardware Snapdragon.
- Compatibilidad con Qualcomm AI Hub Workbench para compilación, perfilado y evaluación en dispositivos reales.

## Casos de uso

- Asistentes de voz en aplicaciones móviles: NeuTTS-Nano permite generar respuestas de voz en tiempo real sin conexión, ideal para asistentes personales que requieren privacidad y baja latencia.
- Audiolibros y narración de contenido: su capacidad de clonación de voz permite generar audiolibros con la voz de un narrador específico a partir de una muestra breve, reduciendo costes de producción.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla que convierten texto en voz de forma local, sin depender de servicios en la nube.
- Traducción de voz a voz: combinado con un sistema de traducción, puede sintetizar la voz del hablante original en otro idioma, manteniendo su identidad vocal.
- Aprendizaje de idiomas: aplicaciones educativas que necesitan pronunciación natural y personalizable, con la posibilidad de clonar la voz del profesor o del estudiante.
- Sistemas de respuesta de voz en kioscos interactivos o dispositivos IoT: su tamaño reducido y ejecución en CPU lo hacen adecuado para hardware de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de síntesis de voz, no de razonamiento general. Tampoco se han proporcionado evaluaciones objetivas de calidad de voz (MOS, etc.) en los materiales consultados.

## Requisitos de hardware

- Ejecución en CPU en tiempo real: el modelo está optimizado para correr en procesadores de dispositivos móviles, especialmente Snapdragon.
- No requiere GPU dedicada para inferencia; la carga de trabajo se reparte entre CPU (fonemización, muestreo, encode/decode) y el acelerador neuronal (QNN) si está disponible.
- VRAM estimada: no disponible, pero al ser un modelo de 228,7 M de parámetros, su huella de memoria es reducida (inferior a 1 GB en cuantización Q8).
- GPUs recomendadas: no aplica, aunque puede ejecutarse en GPUs de escritorio para pruebas; se recomienda usar CPU o el acelerador Hexagon de Qualcomm.
- Opciones de despliegue: Qualcomm AI Hub Workbench, exportación a QNN context binary, TensorFlow Lite, ONNX Runtime, y formatos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no se han publicado cifras concretas, pero la documentación indica que alcanza tiempo real o mejor en CPU de gama media.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Velocidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeuTTS-Nano | 228,7 M totales, 116,8 M activos | no disponible | Tiempo real en CPU | other | Hugging Face, GitHub |
| NeuTTS Air | ~3x mayor que Nano (estimado ~700 M) | no disponible | Tiempo real en CPU | other | Hugging Face, GitHub |
| Piper TTS | ~100-200 M (depende de la voz) | no disponible | Tiempo real en CPU | MIT | GitHub, onnx |

NeuTTS-Nano se posiciona como una alternativa más ligera que NeuTTS Air, manteniendo la clonación de voz instantánea. Piper TTS es otro modelo on-device de código abierto, pero no ofrece clonación de voz de forma nativa. La ventaja de NeuTTS-Nano reside en su integración con Qualcomm AI Hub y su capacidad de clonación de voz, mientras que Piper destaca por su licencia permisiva (MIT) y su amplia variedad de voces.

## Limitaciones y advertencias

- La licencia "other" no especifica los términos exactos; es necesario revisar la licencia original en el repositorio de GitHub antes de uso comercial.
- La calidad de voz, aunque natural, puede ser inferior a la de modelos TTS de gran escala basados en servidores, especialmente en entornos ruidosos o con acentos poco comunes.
- La clonación de voz requiere un clip de referencia de calidad; clips cortos o con ruido pueden degradar la fidelidad de la voz clonada.
- El modelo está optimizado para dispositivos Snapdragon; su rendimiento en otras arquitecturas ARM o x86 puede variar.
- No se han publicado evaluaciones de sesgos o alucinaciones en el habla; como todo modelo generativo, puede producir pronunciaciones incorrectas o artefactos en textos poco frecuentes.
- La longitud de contexto no está documentada, lo que limita la capacidad de manejar textos muy largos de una sola vez; se recomienda segmentar la entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ashwmurt/neutts_nano
- Repositorio oficial de Neuphonic: https://github.com/neuphonic/neutts
- Paper de NeuCodec: https://arxiv.org/abs/2509.09550
- Página de Neuphonic en Hugging Face: https://huggingface.co/neuphonic
- Qualcomm AI Hub Models: https://github.com/quic/ai-hub-models
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com

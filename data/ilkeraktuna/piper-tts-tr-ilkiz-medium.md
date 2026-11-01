# ilkeraktuna/piper-tts-tr-ilkiz-medium

## Resumen

Piper TTS TR Ilkiz Medium es un modelo de síntesis de voz (text-to-speech) para turco, entrenado sobre la arquitectura Piper, que a su vez implementa VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech). Lo publica el usuario ilkeraktuna en HuggingFace bajo licencia MIT, con el identificador `ilkeraktuna/piper-tts-tr-ilkiz-medium`. El modelo está orientado a generar voz femenina en turco a partir de texto plano y se distribuye en formato ONNX, lo que permite su ejecución con el binario `piper` o mediante integraciones en Python.

El problema que resuelve es la falta de voces turcas de calidad dentro del ecosistema Piper, un motor de TTS ligero y de código abierto muy extendido para asistentes locales, domótica y aplicaciones de accesibilidad. Al estar empaquetado como ONNX, el modelo puede ejecutarse en CPU sin GPU dedicada, lo que lo hace adecuado para dispositivos de borde y despliegues de bajo coste. El repositorio ocupa aproximadamente 0,1 GB, un tamaño coherente con un checkpoint VITS de tamaño "medium".

La relevancia actual del modelo es limitada pero concreta: cubre un nicho (TTS turco femenino en Piper) con licencia permisiva MIT, aunque la información publicada por el autor es muy escasa. No se especifican el número de parámetros, la longitud de contexto (en TTS no aplica del mismo modo), el número de tokens de entrenamiento ni resultados de benchmarks. La model card incluye marcadores de plantilla sin rellenar (por ejemplo, "[Örn: 1000 epoch / 200k steps]" y "[Örn: 22050 Hz]"), lo que indica que los detalles técnicos no están confirmados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS / Piper (TTS end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada de texto variable) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; el autor no documenta variantes) |
| Idiomas soportados | turco (tr / tr_TR) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Frecuencia de muestreo | no disponible (la model card muestra un marcador sin rellenar) |
| Genero de voz | femenino |
| Tamano del repositorio | ~0,1 GB |
| Pipeline en HuggingFace | no disponible |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema de síntesis de voz end-to-end que combina un encoder de texto, un prior normalizing flow, un decoder generativo y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales. Piper es el motor de inferencia que empaqueta estos modelos en ONNX para ejecución eficiente en CPU, con un vocabulario fonético específico por idioma. La model card etiqueta el modelo con `vits` y `piper`, lo que confirma esta base arquitectónica.

No se dispone de información sobre el conjunto de datos de entrenamiento: no se indican horas de audio, número de hablantes, procedencia del corpus, ni si se aplicaron técnicas de alineamiento forzado o fine-tuning sobre un checkpoint previo. La model card incluye un campo de "Epoch/Steps" con un marcador de plantilla sin completar, por lo que el número de pasos de entrenamiento es desconocido. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.), algo esperable en un modelo TTS de esta categoría.

## Capacidades

- Síntesis de voz (text-to-speech) en turco a partir de texto plano.
- Voz femenina, según la descripción del autor ("Türkçe kadın ses modeli").
- Ejecución mediante la CLI de Piper (`piper --model ... --output_file ...`).
- Integración en Python mediante subprocess o llamadas al binario de Piper.
- Salida en formato WAV.
- Ejecución en CPU sin necesidad de GPU, gracias al formato ONNX.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo "thinking", visión, audio de entrada ni capacidades multimodales.
- Cobertura multilingüe: únicamente turco; no se documentan otros idiomas.

## Casos de uso

- Asistentes de voz locales en turco: el modelo puede integrarse en un pipeline de reconocimiento de voz + LLM + TTS para construir un asistente conversacional que responda en turco sin depender de servicios en la nube, gracias a su ejecución en CPU vía ONNX.
- Accesibilidad y lectura de textos: conversión de artículos, documentos o notificaciones a audio en turco para personas con discapacidad visual o dificultades de lectura, usando el binario de Piper en un script programado.
- Domótica y dispositivos de borde: anuncios por voz en turco en altavoces inteligentes o Raspberry Pi, aprovechando el bajo consumo del formato ONNX y el tamaño reducido del repositorio (~0,1 GB).
- Audioguías y contenidos educativos: generación de narraciones en turco para cursos, museos o aplicaciones de aprendizaje de idiomas, con voz femenina consistente.
- Preproducción de doblaje y prototipado: generación rápida de pistas de voz temporales en turco para vídeos, pódcasts o demos de producto antes de contratar una locución profesional.
- Integración en aplicaciones de mensajería: lectura automática de mensajes entrantes en turco dentro de clientes de chat o sistemas de atención al cliente basados en reglas, donde la latencia de CPU es suficiente.
- Investigación en TTS: uso como checkpoint de referencia para comparar calidad de síntesis en turco dentro del ecosistema Piper, o como base para fine-tuning con otros hablantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (MOS, WER, MCD) ni comparaciones con otras voces Piper en turco. El autor etiqueta el modelo con `metrics: audio-samples`, pero no se aportan muestras ni valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la práctica; el modelo está pensado para CPU. En GPU, el consumo sería mínimo (por debajo de 1 GB), pero no se documenta.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime podría ejecutarlo, aunque el caso de uso natural es CPU.
- Compatibilidad con GPU de consumo: sí, cualquier GPU consumer podría ejecutarlo, pero no es el escenario previsto.
- Opciones de despliegue: binario `piper` (CLI), Python mediante subprocess, ONNX Runtime, y potencialmente integraciones de terceros que consuman modelos Piper (por ejemplo, Home Assistant). No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama, que no aplican a modelos TTS.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| piper-tts-tr-ilkiz-medium (este modelo) | VITS / Piper | Turco | MIT | ONNX | HuggingFace |
| Otras voces Piper para turco | VITS / Piper | Turco | Variable (MIT o similar) | ONNX | Repositorios Piper / HuggingFace |
| Coqui TTS (modelos turcos) | VITS / Tacotron | Turco | Variable (MPL-2.0 en el framework) | Checkpoint PyTorch | Coqui / HuggingFace |
| Modelos TTS comerciales (p. ej., Google Cloud TTS, Azure) | No público | Turco | Propietaria | API | Servicios en la nube |

No se dispone de datos de rendimiento comparativo (MOS, WER) entre este modelo y las alternativas, por lo que la comparativa se limita a parámetros estructurales y licencia. La ventaja principal de este checkpoint frente a alternativas comerciales es la licencia MIT y la ejecución local en CPU; su desventaja es la ausencia de documentación técnica y de métricas publicadas.

## Limitaciones y advertencias

- Información técnica incompleta: la model card contiene marcadores de plantilla sin rellenar (epochs, sample rate), por lo que no se puede verificar la calidad del entrenamiento ni la frecuencia de muestreo real.
- Riesgo de pronunciación incorrecta: al no documentarse el corpus de entrenamiento ni el vocabulario fonético, no se puede garantizar la cobertura de nombres propios, siglas, números o préstamos léxicos en turco.
- Sesgo de género y hablante único: el modelo está entrenado para una única voz femenina; no permite seleccionar otras voces, edades o acentos.
- Cobertura limitada a turco: no soporta otros idiomas ni cambio de idioma dentro de una misma locución.
- Sin métricas de calidad publicadas: no hay MOS, WER ni comparaciones objetivas, lo que dificulta evaluar su idoneidad en producción frente a otras voces Piper.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar la procedencia del corpus de entrenamiento, no documentada, por posibles derechos de terceros sobre el audio original.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación por terceros.
- No apto para tareas de razonamiento, código, matemáticas, visión o agentes: es exclusivamente un modelo TTS.

## Enlaces

- HuggingFace: https://huggingface.co/ilkeraktuna/piper-tts-tr-ilkiz-medium
- Repositorio oficial de Piper (motor de inferencia): https://github.com/rhasspy/piper
- Documentación de Piper: https://github.com/rhasspy/piper/blob/master/README.md
- Paper de VITS (arquitectura base): https://arxiv.org/abs/2106.06103

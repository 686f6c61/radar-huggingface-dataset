# Phoonnx/coqui-vits-ro-cv-vits

## Resumen

coqui-vits-ro-cv-vits es un modelo de síntesis de voz (text-to-speech) publicado por el usuario Phoonnx dentro del repositorio agregador `Phoonnx/phoonnx-coqui-vits`. Se trata de una conversión al formato ONNX de un modelo Coqui VITS entrenado para rumano (código de idioma `ro-RO`) sobre el corpus Common Voice. El modelo se distribuye como un subdirectorio (`ro-cv-vits`) del repositorio principal y está pensado para ser consumido por la librería phoonnx, un runtime de inferencia TTS basado en ONNX.

La relevancia de esta ficha es limitada pero concreta: cubre un hueco de cobertura TTS en rumano dentro de un ecosistema open source que, en el momento de su publicación, apenas ofrece voces neuronales de calidad para esa lengua. Al estar en ONNX, el modelo puede ejecutarse sin dependencias de PyTorch en CPU y en entornos embebidos, lo que facilita su integración en aplicaciones de lectura por voz, accesibilidad o asistentes locales.

No obstante, la información pública disponible es muy escasa: el repositorio no incluye model card técnica detallada, no declara número de parámetros, longitud de contexto ni métricas de evaluación, y registra cero descargas y cero likes en el momento de la consulta. Todo dato no confirmado se marca como "no disponible" en esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS), exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantización | no disponible (el artefacto distribuido es ONNX; no se declaran variantes cuantizadas) |
| Idiomas soportados | rumano (`ro-RO`) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |
| Tamaño del repositorio | 0,1 GB |
| Pipeline declarado | text-to-speech |
| Librería | phoonnx |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema TTS neuronal de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo basado en flujos normalizadores y un discriminador adversarial multiperiodo para el entrenamiento. VITS produce audio de forma directa a partir de la secuencia de fonemas o caracteres, sin necesidad de un vocoder separado en tiempo de inferencia, lo que explica su idoneidad para exportación a ONNX y despliegue ligero.

Los datos de entrenamiento declarados se limitan al corpus Common Voice en rumano, según la propia model card del repositorio de origen. No se especifican horas de audio, número de hablantes, composición exacta del dataset, ni si hubo etapas de ajuste fino o alineamiento forzado. Tampoco se documentan detalles sobre el tokenizador, el sistema de fonemización empleado (si es basado en grafemas o en fonemas IPA) ni hiperparámetros de entrenamiento. La única innovación técnica reseñable es la exportación a ONNX para su uso con el runtime phoonnx, que permite inferencia sin PyTorch.

## Capacidades

- Síntesis de voz en rumano a partir de texto de entrada, con salida de audio waveform.
- Ejecución mediante ONNX Runtime a través de la librería phoonnx, sin dependencia de PyTorch.
- Integración como voz identificada por el ID `coqui/ro-cv-vits` dentro del ecosistema phoonnx.
- No se declaran capacidades de clonación de voz, control de emoción, cambio de hablante ni prosodia explícita.
- No se declara soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).
- No se declara soporte multilingüe más allá del rumano.

## Casos de uso

- Lectura por voz de contenido web en rumano: el modelo puede convertir artículos o textos de interfaz a audio para aplicaciones de accesibilidad, aprovechando su formato ONNX para ejecución en cliente o servidor sin GPU dedicada.
- Asistentes de voz locales en rumano: al ejecutarse vía ONNX Runtime, puede integrarse en dispositivos embebidos o aplicaciones de escritorio que requieran privacidad y funcionamiento offline.
- Audiolibros y podcasts automatizados en rumano: generación por lotes de narración a partir de texto plano, con la salvedad de que no se documenta control de prosodia ni de velocidad.
- Sistemas de navegación o avisos por voz: síntesis de frases cortas y dinámicas en rumano para aplicaciones de transporte o domótica.
- Prototipado de pipelines TTS: al ser un artefacto ONNX pequeño (0,1 GB), sirve como bloque de referencia para validar integraciones con phoonnx antes de escalar a voces de mayor calidad.
- Investigación en TTS de bajos recursos: el modelo puede emplearse como línea base para experimentos con Common Voice en rumano, comparando calidad frente a otros sistemas VITS o difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad (MOS, CMOS), inteligibilidad (WER), latencia ni throughput, y el repositorio no registra descargas ni evaluaciones de la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repositorio (0,1 GB) y la arquitectura VITS, es plausible que el modelo quepa en menos de 1 GB de memoria, pero este dato no está confirmado por el autor.
- GPU recomendadas: no disponibles. Al ser ONNX, puede ejecutarse en CPU sin GPU dedicada.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; el tamaño reducido sugiere que podría ejecutarse en cualquier GPU de consumo moderna, pero no hay validación publicada.
- Opciones de despliegue: ONNX Runtime a través de la librería phoonnx (runtime oficial declarado). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto / tamaño | Disponibilidad |
|---|---|---|---|---|---|---|
| coqui-vits-ro-cv-vits (este) | VITS (ONNX) | Rumano | BSD-3-Clause | ONNX | 0,1 GB repo | Hugging Face (Phoonnx) |
| Coqui TTS VITS rumano original | VITS (PyTorch) | Rumano | BSD-3-Clause | Checkpoint PyTorch | no disponible | Coqui Model Zoo |
| Otros TTS multilingües open source (p. ej. MMS-TTS de Meta) | VITS | Multilingüe (incluye rumano) | CC-BY-NC / otras según variante | PyTorch | no disponible en esta ficha | Hugging Face (facebook/mms-tts) |

No se dispone de datos de rendimiento comparativo (MOS, WER) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Información técnica muy escasa: no se declaran parámetros, horas de entrenamiento, hablantes ni métricas de calidad, lo que dificulta evaluar su idoneidad en producción.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso o validación por parte de la comunidad.
- Modelo mono-idioma (rumano); no se declara soporte para otras lenguas ni code-switching.
- Al derivar de Common Voice, es probable que herede sesgos de representación del corpus (acentos, género, edad de los hablantes), aunque no se documentan análisis específicos.
- Riesgo de artefactos y errores de pronunciación en palabras fuera de dominio, nombres propios o terminología técnica, habitual en sistemas VITS entrenados con corpus limitados.
- Licencia BSD-3-Clause: permite uso comercial y modificación con atribución, pero conviene verificar la licencia del repositorio de origen (`coqui/ro-cv-vits`) y de Common Voice para el corpus subyacente.
- No se documenta soporte de control de prosodia, emoción ni selección de hablante; el modelo produce una única voz.
- Al ser un artefacto ONNX sin model card técnica, la reproducibilidad del entrenamiento no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/coqui-vits-ro-cv-vits
- Repositorio agregador de origen: https://huggingface.co/Phoonnx/phoonnx-coqui-vits
- Runtime phoonnx: https://github.com/TigreGotico/phoonnx
- Coqui TTS (proyecto original): https://github.com/coqui-ai/TTS
- Common Voice (Mozilla): https://commonvoice.mozilla.org/

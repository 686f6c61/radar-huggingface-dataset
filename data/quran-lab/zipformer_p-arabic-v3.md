# Quran-Lab/zipformer_p-arabic-v3

## Resumen

Zipformer p-arabic v3 es un modelo de reconocimiento automático de fonemas del árabe coránico desarrollado por Quran-Lab. Se trata de un sistema CTC basado en la arquitectura Zipformer, entrenado específicamente para transcribir audio recitado a una secuencia de fonemas con marcas de tajwid, lo que permite evaluar la corrección de la recitación a nivel fonémico en lugar de a nivel de palabra. El modelo está pensado como componente de un pipeline de verificación de recitación, no como un transcriptor de texto convencional.

La relevancia del modelo radica en su especialización: frente a los ASR genéricos para árabe, que colapsan las distinciones fonéticas relevantes para el tajwid, este modelo opera sobre un inventario fonémico extendido que preserva esas distinciones. Los resultados declarados por el autor muestran un PER (Phoneme Error Rate) de 1,43 sobre recitadores de estudio no vistos en entrenamiento, 3,65 sobre audio real de teléfono y 9,1 sobre un recitador completamente no visto, lo que indica una degradación controlada fuera de dominio.

El repositorio ocupa 5,2 GB y se distribuye en formatos CoreML y ONNX, con soporte de streaming mediante CTC. El acceso está restringido (gated) y la licencia es la propia Quran-Lab NPL 1.3, que debe revisarse antes de cualquier uso comercial. El modelo solo declara soporte para árabe y su pipeline es automatic-speech-recognition.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Zipformer con cabecera CTC (zipformer_ctc) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio con streaming por chunks) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | árabe (ar) |
| Licencia | quran-lab-npl-1.3 (acceso restringido, gated) |
| Formato de pesos | CoreML, ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Zipformer, un encoder de tipo transformer con conformer jerárquico y downsampling progresivo, combinado con una cabecera CTC para la decodificación de secuencias de fonemas. La elección de CTC permite decodificación streaming sin necesidad de un mecanismo de atención autorregresivo, lo que reduce la latencia y facilita el despliegue en dispositivos. La salida no es texto ortográfico sino una secuencia de fonemas árabes con información de tajwid, lo que exige un inventario de etiquetas específico del dominio.

No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron técnicas de aumento de datos como speed perturbation o mezcla de ruido. Los resultados declarados sugieren que el entrenamiento incluyó recitadores de estudio y audio telefónico, dado el buen rendimiento en ambos dominios y la caída en un recitador no visto. No se indica en la información disponible si hubo ajuste fino con RLHF o DPO, algo por otra parte poco habitual en un modelo CTC de ASR.

## Capacidades

- Reconocimiento de fonemas del árabe coránico con etiquetas alineadas con las reglas de tajwid.
- Decodificación CTC en modo streaming, adecuada para procesamiento incremental de audio.
- Salida a nivel fonémico, lo que permite comparar la recitación del usuario contra una referencia canónica.
- Funcionamiento sobre audio de estudio limpio y sobre audio telefónico con ruido y compresión.
- Exportación a CoreML y ONNX para inferencia en dispositivos Apple y en entornos con ONNX Runtime.
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes.
- Soporte multilingüe limitado al árabe; no se declaran otros idiomas.

## Casos de uso

- Verificación de recitación coránica: el modelo transcribe el audio del usuario a fonemas y un comparador posterior lo alinea con la secuencia de referencia para señalar errores de pronunciación o de tajwid. Su PER de 1,43 en recitadores de estudio lo hace adecuado para esta tarea en entornos controlados.
- Aplicaciones móviles de aprendizaje: la exportación a CoreML permite ejecutar la inferencia en iPhone y iPad sin conexión, con la decodificación CTC en streaming reduciendo la latencia percibida por el usuario.
- Corrección en tiempo real durante la recitación: el modo streaming permite emitir fonemas conforme llega el audio, de modo que la aplicación puede resaltar el error justo después de producido en lugar de al final de la recitación.
- Evaluación de calidad en plataformas de audio: procesar en lote grabaciones subidas por usuarios para detectar recitaciones con errores fonéticos y priorizar la revisión humana.
- Investigación en fonética árabe: el modelo proporciona alineamientos fonémicos a nivel de frame que pueden usarse para estudiar duraciones, asimilaciones y fenómenos de tajwid en corpus grandes.
- Transcripción asistida en entornos con ruido: con un PER de 3,65 sobre audio real de teléfono, puede emplearse como paso previo en sistemas de búsqueda o indexación de recitaciones grabadas con dispositivos móviles.
- Despliegue en servidores con ONNX Runtime: integración en servicios backend que ya dispongan de infraestructura ONNX, sin necesidad de GPU dedicada si el throughput requerido es moderado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Métrica | Dataset | Valor |
|---|---|---|
| Phoneme Error Rate, held-out studio reciters | Quran-Lab/quranic-asr-benchmark (v1.1) | 1,43 |
| Phoneme Error Rate, real phone audio | Quran-Lab/quranic-asr-benchmark (v1.1) | 3,65 |
| Phoneme Error Rate, unseen reciter | Quran-Lab/quranic-asr-benchmark (v1.1) | 9,1 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni métricas equivalentes, por tratarse de un modelo de ASR y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio de 5,2 GB incluye pesos en CoreML y ONNX, pero no se detalla el tamaño del modelo en parámetros ni el consumo por formato.
- GPU recomendadas: no disponible. Al ser un modelo orientado a streaming y exportado a CoreML/ONNX, el despliegue típico es en CPU o en NPU/GPU integradas.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; la presencia de CoreML sugiere despliegue en Apple Silicon y la de ONNX sugiere CPU x86 con ONNX Runtime.
- Opciones de despliegue: ONNX Runtime y CoreML. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de reconocimiento fonémico del árabe coránico con los que establecer una comparación de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Los valores de PER son declarados por el autor y no han sido verificados de forma independiente.
- El rendimiento cae de forma notable en recitadores no vistos (PER 9,1 frente a 1,43 en recitadores de estudio), lo que anticipa problemas de generalización en voces fuera de la distribución de entrenamiento.
- El modelo está especializado en árabe coránico; no debe esperarse un comportamiento correcto sobre árabe dialectal, árabe moderno estándar hablado ni otras lenguas.
- La salida es una secuencia de fonemas, no texto; cualquier uso que requiera transcripción ortográfica necesita un módulo adicional de conversión.
- El acceso es restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- La licencia quran-lab-npl-1.3 es una licencia propia; deben revisarse sus términos antes de cualquier uso comercial o de redistribución.
- Riesgo de sesgo hacia los estilos de recitación presentes en el corpus de entrenamiento, con posible degradación en escuelas de recitación poco representadas.
- No se documentan sesgos demográficos ni de género en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Quran-Lab/zipformer_p-arabic-v3
- Dataset de evaluación: Quran-Lab/quranic-asr-benchmark (v1.1), referenciado en la model card
- Organización: https://huggingface.co/Quran-Lab
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.

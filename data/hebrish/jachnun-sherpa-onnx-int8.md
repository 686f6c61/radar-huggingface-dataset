# Hebrish/Jachnun-sherpa-onnx-int8

## Resumen

`Hebrish/Jachnun-sherpa-onnx-int8` es una conversión a ONNX con cuantización int8 del modelo de reconocimiento automático del habla `Hebrish/Jachnun`, publicada por el usuario de HuggingFace Hebrish. El modelo está diseñado para transcribir audio bilingüe hebreo-inglés con cambio de código (*code-switching*), un escenario frecuente en el sector tecnológico israelí, donde una misma frase alterna palabras en hebreo e inglés. La arquitectura es un transductor TDT (*token-and-duration transducer*) de la familia Parakeet, según indican las etiquetas del repositorio.

El interés de esta variante concreta reside en el formato: al estar exportada a ONNX e integrada en la librería sherpa-onnx, puede ejecutarse sin conexión y sin GPU en entornos de producción ligeros (CPU x86, ARM, Android, iOS), algo que no ocurre con los checkpoints habituales en PyTorch de los modelos Parakeet. La cuantización int8 reduce el peso de los pesos, a costa de una posible pérdida de precisión frente al modelo base.

El repositorio tiene 3,3 GB, licencia CC-BY-4.0, acceso restringido (hay que aceptar condiciones en HuggingFace) y, en el momento de redactar esta ficha, cero descargas y cero *likes*, por lo que no existe validación comunitaria pública. No se han publicado parámetros totales, ventana de audio máxima ni resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transductor TDT (*token-and-duration transducer*), familia Parakeet, exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (ventana de audio máxima no documentada) |
| Tipos de cuantización | int8 (única variante publicada en este repositorio) |
| Idiomas soportados | inglés (`en`) y hebreo (`he`), con cambio de código entre ambos |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX cuantizado a int8, empaquetado para sherpa-onnx |
| Tarea | reconocimiento automático del habla (*automatic-speech-recognition*) |
| Modelo base | `Hebrish/Jachnun` |
| Tamaño del repositorio | 3,3 GB |
| Librería de inferencia | sherpa-onnx |
| Acceso | restringido (*gated*): requiere aceptar condiciones en HuggingFace |

## Arquitectura y entrenamiento

El modelo es un transductor TDT, una variante de los transductores RNN-T en la que el predictor emite conjuntamente un token y una duración, lo que reduce el número de pasos de decodificación y mejora el rendimiento frente a RNN-T clásico. Las etiquetas del repositorio lo sitúan en la familia Parakeet, la línea de modelos ASR de NVIDIA, e incluyen la etiqueta `parakeet` junto a `tdt` y `transducer`. El repositorio aquí descrito no es el checkpoint original: es una conversión del modelo base `Hebrish/Jachnun` al formato ONNX con cuantización int8 para el runtime sherpa-onnx.

No hay información publicada en la ficha sobre el volumen de datos de entrenamiento, la composición del corpus, el uso de técnicas de alineación forzada, decodificación con *beam search* ni sobre posibles etapas de ajuste supervisado o preferencias. Tampoco se documenta si el modelo base parte de un Parakeet preentrenado en inglés y se ajustó después en hebreo, ni el esquema exacto de cuantización (por ejemplo, *dynamic* frente a *static*, o qué operadores quedaron en precisión completa).

## Capacidades

- Transcripción de voz a texto en hebreo e inglés, incluyendo frases con alternancia de idioma dentro de la misma locución.
- Reconocimiento en modo *offline*, sin necesidad de conexión a servicios externos.
- Inferencia sobre audio en streaming o por segmentos, según la integración que se haga con sherpa-onnx (la granularidad no está documentada en la ficha).
- Ejecución en CPU sin GPU dedicada, al estar exportado a ONNX Runtime.
- Despliegue multiplataforma: el runtime sherpa-onnx ofrece APIs en C++, Python, C#, Go, Java, Kotlin, JavaScript y Swift, lo que cubre servidores, escritorio y dispositivos móviles.
- Capacidad de *code-switching* hebreo-inglés declarada explícitamente mediante la etiqueta `code-switching`.

No se documentan capacidades de puntuación, capitalización automática, detección de hablantes (*diarization*), marcas de tiempo a nivel de palabra ni traducción.

## Casos de uso

- Transcripción de reuniones de equipos bilingües: el modelo puede procesar audio de videollamadas donde los participantes alternan hebreo e inglés, y producir una transcripción única sin necesidad de cambiar de motor a mitad de la reunión.
- Subtitulado de contenido técnico: vídeos, podcasts y charlas de empresas israelíes del sector tecnológico, donde los términos de ingeniería se pronuncian en inglés dentro de una frase en hebreo.
- Atención al cliente y *contact centers*: transcripción de llamadas de soporte para su posterior análisis de calidad, con despliegue en CPU que evita enviar audio a la nube y facilita el cumplimiento de requisitos de privacidad.
- Notas clínicas dictadas: un profesional sanitario puede dictar en hebreo con terminología médica en inglés; el modelo transcribe localmente en una estación de trabajo sin GPU.
- Asistentes de voz en dispositivos empotrados: integración en aplicaciones Android o en placas ARM mediante sherpa-onnx para dictado y comandos de voz sin conexión.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de un archivo histórico de grabaciones para hacerlas buscables, ejecutando el modelo en CPU en paralelo en varios procesos.
- Accesibilidad: generación de subtítulos en directo para personas con discapacidad auditiva en entornos donde la conectividad no está garantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No hay datos de WER (*word error rate*), CER, velocidad de inferencia ni comparaciones con el modelo base `Hebrish/Jachnun` en la ficha del repositorio.

## Requisitos de hardware

- Almacenamiento: 3,3 GB de repositorio; esa cifra actúa como cota superior del espacio en disco necesario para los pesos y artefactos asociados.
- VRAM: no disponible de forma oficial. Al tratarse de una exportación ONNX int8 destinada a sherpa-onnx, el modelo está pensado para ejecutarse en CPU y, por el tamaño del repositorio, debería caber holgadamente en cualquier GPU consumer con 4 GB o más de memoria.
- RAM: no disponible de forma oficial; como referencia, el conjunto de pesos ocupa como máximo 3,3 GB, por lo que un servidor con 4-8 GB de RAM debería ser suficiente para una instancia de inferencia.
- GPU recomendadas: no es un modelo que requiera GPU. Si se quiere acelerar, cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM sirve como punto de partida; no hay datos publicados de throughput en A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, previsiblemente en cualquier tarjeta con 4 GB o más; la ejecución en CPU es la opción de referencia.
- Opciones de despliegue: sherpa-onnx (APIs en C++, Python, C#, Go, Java, Kotlin, JavaScript, Swift) sobre ONNX Runtime; también es posible cargar el grafo ONNX directamente con ONNX Runtime si se respeta el preprocesado de características acústicas esperado.
- vLLM y TGI no son aplicables: son servidores para modelos de lenguaje autoregresivos, no para transductores ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Datos públicos de referencia de cada alternativa; los valores del modelo de esta ficha figuran como «no disponible» cuando no constan.

| Modelo | Parámetros | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|
| `Hebrish/Jachnun-sherpa-onnx-int8` | no disponible | he, en (con *code-switching*) | CC-BY-4.0 | ONNX int8, sherpa-onnx, CPU-first |
| Whisper large-v3 (OpenAI) | 1550 M | multilingüe (~99 idiomas) | MIT | safetensors, GGUF, ONNX; faster-whisper, whisper.cpp |
| Parakeet TDT 0.6B v2 (NVIDIA) | 600 M | en | CC-BY-4.0 | `.nemo`, NeMo Toolkit; requiere exportación a ONNX para sherpa-onnx |
| Canary-1B (NVIDIA) | 1000 M | en, de, es, fr | CC-BY-NC-4.0 (no comercial) | `.nemo`, NeMo Toolkit |

La diferencia clave frente a Whisper es la especialización: Whisper cubre muchos más idiomas, pero no está ajustado específicamente para la alternancia hebreo-inglés y su ventana fija de 30 segundos impone un troceado distinto. Frente a los checkpoints Parakeet de NVIDIA, esta variante aporta el empaquetado ONNX int8 listo para sherpa-onnx y el ajuste al hebreo, a cambio de menor documentación y nula validación pública.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es *gated*; es necesario aceptar las condiciones en HuggingFace antes de poder descargarlo, lo que puede no ser viable en flujos de CI/CD automatizados.
- Sin validación comunitaria: cero descargas y cero *likes* en el momento de la consulta; no hay informes independientes de calidad.
- Idiomas limitados: solo hebreo e inglés. No cubre castellano ni otras lenguas.
- La cuantización int8 puede degradar el WER respecto al modelo base en audio ruidoso o con acentos marcados; no se han publicado métricas comparativas.
- El *code-switching* declarado por etiqueta no está cuantificado: no se conoce el rendimiento en mezcla intra-palabra, en nombres propios o en acentos no nativos.
- Riesgo de alucinación: los transductores tienden a insertar texto en tramos de silencio, ruido o música; conviene aplicar detección de actividad de voz (VAD) antes de la decodificación.
- No se documentan puntuación, capitalización, marcas de tiempo ni detección de hablantes; si se necesitan, habrá que añadirlas con un paso posterior.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución al autor y al modelo base; no se ofrece garantía alguna.
- El modelo base `Hebrish/Jachnun` condiciona el comportamiento de esta exportación; cualquier limitación de aquel se hereda aquí.
- Sin datos de latencia ni throughput: es necesario medirlos en el hardware objetivo antes de dimensionar un despliegue en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Hebrish/Jachnun-sherpa-onnx-int8
- Modelo base: https://huggingface.co/Hebrish/Jachnun

La búsqueda web realizada no devolvió enlaces relevantes al modelo: los resultados se limitaron a servicios de traducción genéricos (Google Translate y DeepL) sin relación con este repositorio, por lo que no se incluyen. No se han encontrado en la información proporcionada artículos, papers, demos ni repositorios adicionales asociados al modelo.

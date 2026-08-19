# Namuorg/mms-tts-amh-nahom

## Resumen

El modelo `Namuorg/mms-tts-amh-nahom` es un sistema de síntesis de voz (text-to-speech) en amárico, desarrollado por la organización Namuorg (Namu). Se trata de un fine-tuning del modelo `facebook/mms-tts-amh` de Meta AI, que a su vez es un modelo VITS de 83 millones de parámetros entrenado originalmente para hablar amárico con calidad limitada. El objetivo de este ajuste es mejorar la naturalidad y claridad de la voz en amárico mediante el entrenamiento sobre un corpus limpio de un solo hablante.

El modelo se enmarca en el proyecto de código abierto `namu-tts-amharic-tts-internship`, cuyo repositorio público documenta el proceso de fine-tuning utilizando la librería `ylacombe/finetune-hf-vits`. La relevancia actual radica en la escasez de modelos TTS de calidad para lenguas etíopes como el amárico, y en la posibilidad de adaptar modelos multilingües existentes con recursos computacionales moderados.

La arquitectura subyacente es VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech), que combina un codificador de texto, un decodificador de voz y un discriminador adversarial. El modelo se distribuye en formato safetensors y es compatible con la librería `transformers` de HuggingFace, lo que facilita su integración en pipelines de síntesis de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial Training for end-to-end TTS) |
| Parametros totales | 83.012.790 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa texto de entrada como un LLM) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | amárico (lengua etiope) |
| Licencia | no disponible en la model card; el modelo base `facebook/mms-tts-amh` se distribuye bajo CC-BY-NC 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en VITS, una arquitectura end-to-end para TTS que integra un codificador de texto con normalización por flujos (normalizing flows), un decodificador basado en WaveNet y un discriminador adversarial. VITS aprende a mapear directamente texto a voz sin necesidad de un vocoder externo, lo que reduce la complejidad del pipeline y mejora la naturalidad de la salida.

El entrenamiento se realizó mediante fine-tuning del checkpoint `facebook/mms-tts-amh` (83M parámetros) sobre un corpus de amárico limpio de un solo hablante. El proceso utiliza la herramienta `ylacombe/finetune-hf-vits`, que simplifica el ajuste de modelos VITS con datos propios. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El repositorio GitHub del proyecto documenta el procedimiento, pero no se han publicado hiperparámetros específicos ni métricas de entrenamiento.

## Capacidades

- Síntesis de voz en amárico a partir de texto escrito.
- Generación de audio en formato waveform directamente desde el texto (arquitectura end-to-end).
- Soporte para inferencia con la librería `transformers` de HuggingFace.
- Capacidad de ajuste fino adicional para adaptar la voz a un hablante o estilo concreto.
- Compatible con pipelines de generación de voz en tiempo real o por lotes.
- No soporta tool calling, razonamiento multi-paso ni otras capacidades de modelos de lenguaje.

## Casos de uso

- Lectura de noticias y artículos en amárico: el modelo puede convertir texto periodístico en audio natural para servicios de radio digital o podcasts automáticos.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla que necesiten voz amárica de calidad.
- Asistentes de voz en aplicaciones móviles para el mercado etíope: el modelo puede servir como motor TTS en apps de asistencia personal o navegación.
- Educación y aprendizaje de idiomas: generación de materiales de audio para cursos de amárico, pronunciación y ejercicios de comprensión oral.
- Audioguías y contenido turístico: creación de guías de audio en amárico para museos, parques nacionales o rutas turísticas en Etiopía.
- Sistemas de respuesta interactiva (IVR) en servicios telefónicos: el modelo puede generar mensajes de voz dinámicos en amárico para atención al cliente o notificaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar, dado que se trata de un modelo de síntesis de voz y no de razonamiento o generación de texto. Tampoco se han reportado métricas objetivas de calidad de voz (MOS, WER de reconocimiento sobre la salida, etc.) en la model card ni en el repositorio.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 83M parámetros, la inferencia puede ejecutarse en CPU con unos 2-4 GB de RAM, y en GPU con menos de 1 GB de VRAM (por ejemplo, una NVIDIA T4 o incluso una GPU integrada moderna).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060 o superior permitirá inferencia en tiempo real con baja latencia.
- Es viable en hardware de consumo (portátiles y PCs de escritorio con GPU básica).
- Opciones de despliegue: la librería `transformers` de HuggingFace permite ejecutar el modelo en Python; también es compatible con pipelines de HuggingFace y se puede exportar a ONNX para entornos de producción.
- Latencia y throughput: no disponibles; se estima que un modelo de este tamaño genera audio más rápido que en tiempo real en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `Namuorg/mms-tts-amh-nahom` | 83M | no aplica | amárico | no disponible | safetensors |
| `facebook/mms-tts-amh` | 83M | no aplica | amárico (base) | CC-BY-NC 4.0 | PyTorch / safetensors |
| `facebook/mms-tts` (familia) | 83M por idioma | no aplica | 1100+ idiomas | CC-BY-NC 4.0 | PyTorch / safetensors |

La comparativa se limita a la familia MMS de Meta, ya que no se han identificado otros modelos TTS específicos para amárico en la información disponible. El modelo de Namuorg es un fine-tuning del checkpoint base, por lo que su rendimiento debería ser superior en naturalidad para el hablante objetivo, aunque no hay métricas publicadas que lo confirmen.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos o riesgos específicos del modelo; al ser un fine-tuning de un modelo base, puede heredar sesgos presentes en los datos de entrenamiento originales de MMS.
- Riesgo de alucinación: en TTS, el modelo puede producir pronunciaciones incorrectas o artefactos de audio en palabras poco frecuentes o nombres propios.
- Limitaciones de idioma: el modelo está entrenado únicamente para amárico; no es adecuado para otros idiomas.
- La licencia del modelo no está especificada en la model card; si se hereda la licencia del modelo base (CC-BY-NC 4.0), el uso comercial estaría restringido.
- El corpus de fine-tuning se limita a un solo hablante, lo que puede reducir la variabilidad de la voz y su adaptabilidad a otros timbres.
- No hay documentación sobre el proceso de limpieza del corpus ni sobre posibles sesgos dialectales dentro del amárico.
- El modelo fue creado en 2026-08-18, lo que indica que es muy reciente y puede carecer de pruebas exhaustivas en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Namuorg/mms-tts-amh-nahom
- Repositorio GitHub del proyecto: https://github.com/Namuai-org/namu-tts-amharic-tts-internship
- Modelo base `facebook/mms-tts`: https://huggingface.co/facebook/mms-tts
- Perfil de la organización Namuorg en HuggingFace: https://huggingface.co/Namuorg/models
- Página del modelo en AIBase (referencia externa): https://model.aibase.com/models/details/1915693318811574274

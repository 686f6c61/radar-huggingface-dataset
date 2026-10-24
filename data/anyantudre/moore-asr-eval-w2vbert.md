# anyantudre/moore-asr-eval-w2vbert

## Resumen

moore-asr-eval-w2vbert es un modelo de reconocimiento automático del habla (ASR) para el mooré (código ISO 639-3: mos), lengua gur hablada por varios millones de personas en Burkina Faso. Ha sido desarrollado por Alban NYANTUDRE (anyantudre), investigador enfocado en tecnologías del habla para lenguas de bajos recursos, como afinado del modelo base facebook/w2v-bert-2.0 de Meta con una cabecera CTC para transcripción. El nombre y la etiqueta tts-evaluation indican que su propósito principal es servir de componente de evaluación para sistemas de síntesis de voz (TTS) en mooré: transcribir el audio sintetizado y compararlo con el texto fuente mediante métricas como el WER.

Con unos 606 millones de parámetros y licencia MIT, el modelo es relevante porque cubre un hueco importante: existen muy pocos sistemas de ASR abiertos para el mooré. Al heredar el preentrenamiento de w2v-BERT 2.0 (realizado sobre millones de horas de audio en más de 1.100 lenguas), ofrece un punto de partida sólido tanto para la evaluación de TTS como para la investigación en tecnologías del habla de bajos recursos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | w2v-BERT (codificador Conformer con preentrenamiento auto-supervisado, cabecera CTC) |
| Parámetros totales | 605.715.300 (~606 M) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (modelo de audio; no aplica ventana de contexto textual) |
| Tipos de cuantización | No disponible (los pesos del repositorio, 2,4 GB, corresponden a punto flotante de 32 bits) |
| Idiomas soportados | Mooré (mos) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura w2v-BERT combina el aprendizaje auto-supervisado de wav2vec 2.0 con un objetivo tipo BERT de predicción enmascarada sobre unidades de audio discretizadas; el codificador está construido con bloques Conformer. El modelo base, facebook/w2v-bert-2.0, fue preentrenado por Meta dentro del proyecto Massively Multilingual Speech (MMS) sobre 4,5 millones de horas de audio en más de 1.100 lenguas, lo que proporciona representaciones fonéticas robustas incluso para lenguas con muy pocos datos anotados.

Sobre esta base, el autor ha añadido una cabecera CTC y ha afinado el modelo para transcribir mooré. La ficha no detalla el conjunto de datos empleado en el afinado (horas de audio ni composición), aunque el autor mantiene el proyecto MooreSpeechCorpora, un toolkit para recopilar, preprocesar, alinear y preparar datos de voz y texto en mooré para TTS y ASR, lo que apunta a su uso como fuente de datos. No se ha documentado el uso de RLHF ni de técnicas de decodificación especulativa; la decodificación CTC es el procedimiento estándar en este tipo de modelos.

## Capacidades

- Transcripción de voz a texto en mooré mediante decodificación CTC.
- Evaluación de sistemas TTS: transcripción del audio sintetizado y comparación con el texto de entrada para calcular el WER (etiqueta tts-evaluation de la ficha).
- Integración con la librería transformers de Hugging Face (pipeline `automatic-speech-recognition`, clase `Wav2Vec2BertForCTC`).
- Baseline reproducible para investigación en ASR de lenguas de bajos recursos.
- No es un LLM: no ofrece tool calling, razonamiento multi-paso ni capacidades de agente; su salida se limita a transcripciones de audio.
- No incluye capacidades de visión, audio generativo ni modo de pensamiento extendido.

## Casos de uso

- Evaluación automática de TTS en mooré: se sintetiza voz a partir de texto, el modelo transcribe el audio resultante y se compara con el texto fuente para medir inteligibilidad (WER), el flujo de trabajo estándar para validar sistemas de síntesis de voz en lenguas de bajos recursos.
- Transcripción de radio y medios comunitarios: puede convertir emisiones y podcasts en mooré de Burkina Faso a texto para archivado, indexación y análisis de contenidos locales.
- Anotación asistida de corpus de voz: genera transcripciones preliminares que los anotadores humanos corrigen, acelerando la construcción de datasets de voz en mooré.
- Subtitulado y accesibilidad: permite generar subtítulos para vídeos y contenidos educativos en mooré, mejorando el acceso de hablantes que no dominan el francés.
- Documentación lingüística: transcripción de grabaciones de campo (entrevistas, narraciones orales) para proyectos de preservación y estudio del mooré.
- Investigación en ASR de bajos recursos: sirve como baseline reproducible (licencia MIT, pesos safetensors) para experimentos de fine-tuning, adaptación de dominio o comparación de arquitecturas.
- Procesamiento de datos de campo: transcripción de encuestas y grabaciones de programas de desarrollo o salud pública realizadas en mooré sobre el terreno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del modelo no incluye valores de WER ni comparaciones con otros sistemas de ASR para mooré; la métrica estándar para validar este modelo sería el WER (word error rate) sobre un conjunto de prueba en mooré.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan 2,4 GB; en FP16, unos 1,2 GB; con cuantización int8, unos 0,6 GB. Con 2-4 GB de VRAM es suficiente para inferencia.
- No requiere aceleradores de datacenter (A100/H100): cualquier GPU de consumo (RTX 3060, RTX 4060 o superior) es más que suficiente, e incluso puede ejecutarse en CPU dada su escala moderada (~606 M de parámetros).
- Cabe con holgura en GPUs de consumo actuales; no es necesario offloading ni paralelismo.
- Despliegue: librería transformers de Hugging Face (pipeline de ASR o `Wav2Vec2BertForCTC`), exportación a ONNX Runtime para inferencia optimizada y demos con Gradio. No hay pesos en formato GGUF, por lo que llama.cpp y Ollama no aplican directamente; vLLM y TGI están orientados a LLMs y no aportan beneficio en este caso.
- Latencia: los modelos CTC son de una sola pasada y suelen transcribir por encima del tiempo real en GPU; no hay cifras publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Observaciones |
|---|---|---|---|---|
| anyantudre/moore-asr-eval-w2vbert | 606 M | Mooré (mos) | MIT | Afinado específico para mooré; pensado para evaluación de TTS |
| facebook/w2v-bert-2.0 | ~600 M | Preentrenado en 1.100+ lenguas | MIT | Modelo base sin afinar; requiere fine-tuning para ASR en una lengua concreta |
| facebook/mms-1b-all | ~1.000 M | 1.100+ lenguas (adaptadores por lengua) | CC-BY-NC 4.0 | Cobertura multilingüe amplia, pero licencia de uso no comercial |
| openai/whisper-large-v3 | 1.550 M | ~99 lenguas oficiales (sin soporte oficial del mooré) | Apache-2.0 | Muy robusto al ruido, pero no cubre el mooré de forma oficial |

La ventaja diferencial de este modelo es la especialización: frente a alternativas multilingües genéricas, está afinado explícitamente para mooré y su licencia MIT permite uso comercial sin restricciones.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de poder descargar los pesos.
- Sin métricas publicadas: la ficha no incluye WER ni benchmarks, y el modelo registra 0 descargas, por lo que no existe validación comunitaria de su calidad.
- Al usar decodificación CTC, la salida carece de puntuación y mayúsculas, y puede producir repeticiones o alucinaciones en segmentos de silencio o audio degradado, un comportamiento típico de esta arquitectura.
- Es un modelo monoidioma: solo transcribe mooré y no incorpora detección de idioma; el audio en otras lenguas producirá transcripciones erróneas.
- El rendimiento en entornos ruidosos o con múltiples hablantes no está documentado.
- La licencia MIT permite uso comercial, pero las condiciones de acceso gated del repositorio pueden añadir requisitos adicionales que conviene revisar antes de desplegar en producción.
- No es un modelo de lenguaje: no debe usarse para generación de texto, razonamiento ni tareas conversacionales.

## Enlaces

- Ficha del modelo: https://huggingface.co/anyantudre/moore-asr-eval-w2vbert
- Modelo base: https://huggingface.co/facebook/w2v-bert-2.0
- Perfil de GitHub del autor: https://github.com/ANYANTUDRE
- Repositorio MooreSpeechCorpora: https://github.com/ANYANTUDRE/MooreSpeechCorpora
- Proyectos del autor: https://anyantudre.github.io/projects/
- Curso de audio de Hugging Face (evaluación de ASR): https://huggingface.co/learn/audio-course/chapter5/evaluation

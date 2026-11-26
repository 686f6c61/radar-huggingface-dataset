# mojonk/bobcat-goldthwait-rvc

## Resumen

Bobcat Goldthwait (RVC v2, 40k) es un modelo de conversión de voz (voice conversion) entrenado con la arquitectura RVC (Retrieval-based Voice Conversion) en su versión 2, con muestreo a 40 kHz. Lo publica el usuario mojonk en Hugging Face y está pensado para transformar una grabación de voz de entrada en la voz clonada del cómico y actor Bobcat Goldthwait. No es un modelo de lenguaje: no genera texto, no razona y no responde a instrucciones; es un artefacto de inferencia de voz que se usa dentro del ecosistema de herramientas RVC (por ejemplo, la interfaz web de RVC o sus derivados).

El repositorio es muy pequeño (0,4 GB) y contiene el archivo de pesos `.pth` junto con el índice de características `.index` que RVC emplea para la recuperación de embeddings de voz. Según la model card, el modelo se entrenó en noviembre de 2026 sobre una GPU alquilada en RunPod, con un conjunto de 1083 clips que suman 40,6 minutos de audio y 160 épocas de entrenamiento.

Su relevancia es acotada y muy específica: sirve para experimentos de clonación de voz, doblaje creativo, memes y pruebas de pipelines RVC. No tiene descargas ni likes en el momento de redactar esta ficha, y la licencia figura como "other" sin texto adicional, lo que impide asumir permisos de uso comercial. La información publicada es escasa: no hay benchmarks, no hay detalles sobre el dataset de origen ni sobre la calidad del resultado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC v2 (Retrieval-based Voice Conversion), muestreo 40k |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de conversion de voz, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo clona una voz concreta; el idioma depende del audio de entrada) |
| Licencia | other (sin texto de licencia publicado) |
| Formato de pesos | `.pth` (checkpoint PyTorch) + `.index` (indice de caracteristicas) |

## Arquitectura y entrenamiento

RVC v2 es una arquitectura de conversión de voz basada en un codificador de contenido (típicamente HuBERT o similar), un extractor de pitch y un decoder generativo que sintetiza el audio en la voz objetivo. El índice `.index` almacena embeddings de las características de la voz de destino y se usa en la fase de recuperación para mejorar la similitud tímbrica. El modelo opera a 40 kHz, lo que sitúa su salida por encima de los 32k habituales de otras variantes RVC y permite conservar más contenido en la banda alta.

Según la model card, el entrenamiento se realizó durante 160 épocas sobre 1083 clips (40,6 minutos) en una GPU alquilada en RunPod en noviembre de 2026. No se especifica el dataset de origen, el número de pasos, el tamaño de batch, la función de pérdida ni si hubo aumentación de datos. La model card indica ajustes de inferencia que funcionan: pitch 0, protect 0.33 y seguimiento de pitch con RMVPE. No hay información sobre evaluación objetiva (MOS, similitud de speaker) ni sobre el proceso de curación del dataset.

## Capacidades

- Conversión de voz (speech-to-speech): transforma una grabación de entrada en la voz clonada de Bobcat Goldthwait.
- Clonación de timbre con recuperación por índice: el archivo `.index` mejora la similitud con la voz objetivo.
- Seguimiento de pitch mediante RMVPE, lo que permite preservar la entonación del audio de entrada.
- Control de pitch (semitonos) y parámetro `protect` para reducir artefactos en consonantes.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling, function calling ni comportamiento de agente.
- No es multilingüe en el sentido de un LLM: el idioma del resultado viene determinado por el audio de entrada.
- No dispone de modo "thinking" ni de capacidades de audio distintas de la conversión de voz.

## Casos de uso

- Doblaje creativo y parodia: usar una grabación propia como entrada y aplicar el modelo para obtener una versión con el timbre de Bobcat Goldthwait, útil en vídeos humorísticos o sketches.
- Memes y contenido para redes: generar clips cortos con la voz clonada a partir de audio grabado, con la configuración recomendada (pitch 0, protect 0.33, RMVPE).
- Pruebas de pipelines RVC: servir como caso de test para validar la integración de la interfaz RVC, la carga del `.pth` y el uso del `.index` en un entorno local.
- Investigación sobre clonación de voz: comparar la calidad de un modelo entrenado con solo 40,6 minutos de audio frente a otros checkpoints RVC de mayor volumen de datos.
- Postproducción de audio amateur: transformar locuciones para proyectos personales sin fines comerciales, siempre que la licencia "other" se aclare antes de publicar.
- Demostraciones educativas: explicar en talleres cómo funciona la conversión de voz con recuperación y qué parámetros afectan al resultado (pitch, protect, índice).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; el repositorio pesa 0,4 GB, por lo que el checkpoint cabe holgadamente en GPUs de consumo, aunque RVC requiere además cargar los modelos auxiliares (HuBERT, RMVPE) que no se incluyen en este repo.
- GPU recomendadas: no hay datos específicos del autor; por el tamaño del artefacto, una GPU de consumo moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente para inferencia, aunque esto no está confirmado en la información disponible.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del checkpoint, pero no hay confirmación oficial.
- Opciones de despliegue: la model card no menciona ninguna; RVC se usa habitualmente con su interfaz web propia o con forks del proyecto, no con vLLM, TGI, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Muestreo | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mojonk/bobcat-goldthwait-rvc | RVC v2 | 40k | 1083 clips, 40,6 min, 160 épocas | other | Hugging Face, 0 descargas |
| Otros checkpoints RVC v2 de voces públicas | RVC v2 | 32k/40k según caso | variable | variable | no disponible |
| Modelos de TTS zero-shot (p. ej. familia XTTS) | TTS/VC neuronal | variable | no disponible | variable | no disponible |

No se dispone de datos de rendimiento comparables para este checkpoint concreto; la comparación se limita a características estructurales.

## Limitaciones y advertencias

- La licencia figura como "other" sin texto publicado: no se puede asumir uso comercial ni redistribución sin aclaración del autor.
- El dataset de entrenamiento no está documentado: se desconoce la procedencia del audio y si existían derechos sobre la voz original.
- La clonación de la voz de una persona real plantea riesgos éticos y legales (suplantación, deepfakes, difamación) que deben evaluarse antes de cualquier publicación.
- Con solo 40,6 minutos de audio y 160 épocas, es probable que aparezcan artefactos y pérdida de naturalidad en registros alejados del dataset, aunque no hay evaluación publicada que lo cuantifique.
- Riesgo de alucinación en el sentido de generar contenido sonoro no presente en la entrada (ruido, consonantes deformadas), típico de los modelos generativos de audio.
- No hay información sobre sesgos acústicos, cobertura de idiomas ni robustez frente a ruido de fondo.
- El repositorio no incluye los modelos auxiliares necesarios (codificador de contenido, extractor de pitch), por lo que no es autosuficiente para inferencia.
- Sin descargas ni validación de la comunidad: no hay evidencia externa de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mojonk/bobcat-goldthwait-rvc
- Proyecto RVC (Retrieval-based Voice Conversion): no disponible en la información proporcionada
- Paper de RVC: no disponible en la información proporcionada
- Repositorio de RMVPE: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada

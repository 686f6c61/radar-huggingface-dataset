# sadan2026/nepali-xtts-v2-v3

## Resumen

Nepali XTTS-v2 (v3 Studio Fine-Tuned) es un modelo de síntesis de voz (text-to-speech) especializado en nepalí (`ne`), desarrollado por Sadan Bajagain (Ayata Inc.) como parte del proyecto Sadan Voice AI. Se trata de un ajuste fino del modelo Coqui XTTS-v2, partiendo del checkpoint comunitario `Oshara/xtts-v2-nepali` (epoch-10), y está orientado tanto a la generación de voz en nepalí como a la clonación de voz zero-shot a partir de una muestra de referencia.

El modelo resuelve el problema de la escasez de sistemas TTS de calidad para nepalí, un idioma de bajos recursos en el ecosistema del habla. La versión v3 amplía el ajuste realizado previamente sobre Google FLEURS (`ne_np`) incorporando OpenSLR 43 (`ne_np_female`), un corpus de estudio, con el objetivo de mejorar la naturalidad y la calidad de la voz generada. La arquitectura subyacente es la de XTTS-v2 (DVAE + GPT-2 + HiFi-GAN), con un tamaño de repositorio de 2,0 GB y pesos de inferencia de 1,9 GB.

Es relevante ahora porque demuestra la viabilidad de adaptar un modelo TTS multilingüe consolidado a un idioma de bajos recursos mediante ajuste fino en dos etapas, y porque publica los artefactos necesarios para inferencia (pesos, configuración, vocabulario y una muestra de referencia) bajo la licencia CPML. No obstante, el proyecto es de autor individual, con cero descargas y cero likes en el momento de la ficha, y sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coqui XTTS-v2 (DVAE + GPT-2 + HiFi-GAN), `gpt_use_perceiver_resampler: false` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `model.pth`, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | nepalí (`ne`); en inferencia debe pasarse `language="hi"` por el espacio de tokens Devanagari del `vocab.json` |
| Licencia | Coqui Public Model License (CPML), etiquetada como `license: other` |
| Formato de pesos | `model.pth` (PyTorch, 1,9 GB, prefijo `xtts.` eliminado), `config.json`, `vocab.json`, `reference.wav` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura XTTS-v2 de Coqui, que combina un codificador/discretizador DVAE para el audio, un transformer autorregresivo basado en GPT-2 para la predicción de tokens acústicos y un vocoder HiFi-GAN para la síntesis de la forma de onda. En esta configuración concreta, `gpt_use_perceiver_resampler` está desactivado. La salida de audio se escribe a 24 kHz, mientras que los datos de entrenamiento se prepararon a 22.050 Hz mono.

El linaje de entrenamiento consta de tres etapas: (1) base `Oshara/xtts-v2-nepali` en su checkpoint `epoch-10`; (2) versiones v1 y v2 ajustadas sobre Google FLEURS (`ne_np`) con 1.465 clips filtrados de 3,0 a 11,0 segundos, hasta el paso 5.061 (`best_model_5061.pth`); y (3) la versión v3, que continúa el ajuste sobre OpenSLR 43 (`ne_np_female`, hasta 2.500 clips de 2,2 a 10,5 segundos) durante 5 épocas con `lr=2.5e-6` y `batch_size=2`, dando lugar a `best_model_4740.pth`. No se documenta el uso de RLHF ni DPO; el ajuste es supervisado sobre pares texto-audio.

Una particularidad técnica relevante es que el `vocab.json` emplea el espacio de tokens Devanagari bajo la etiqueta `language="hi"`, por lo que el autor indica explícitamente que debe pasarse `language="hi"` en inferencia. Además, recomienda dividir párrafos multioración por `।`, `?` y `!` para mantener la atención de XTTS sin repeticiones, normalizar Unicode Devanagari a NFC y convertir dígitos a palabras en nepalí antes de la síntesis.

## Capacidades

- Síntesis de voz (TTS) en nepalí a partir de texto en escritura Devanagari.
- Clonación de voz zero-shot mediante latentes de condicionamiento y embedding de hablante extraídos de una muestra de referencia (`reference.wav` de 4,02 s incluida).
- Control de prosodia y estabilidad mediante parámetros de muestreo (`temperature=0.22`, `top_k=50`, `top_p=0.85`, `repetition_penalty=2.5`).
- Inferencia en CUDA, MPS o CPU según el código de ejemplo del autor.
- Segmentación manual de texto multioración para mejorar la nitidez de la atención.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- Audiolibros y contenido editorial en nepalí: el modelo convierte texto Devanagari en voz, y la clonación zero-shot permite mantener una voz narradora consistente a lo largo de capítulos usando una única referencia de estudio.
- Asistentes de voz y agentes conversacionales en nepalí: integrado en un pipeline de ASR + LLM + TTS, el modelo aporta la capa de salida hablada; el autor lo enmarca en su proyecto AI Interviewer.
- Locución para vídeo y formación e-learning: generación de pistas de voz para material didáctico en nepalí sin necesidad de estudio de grabación, ajustando la temperatura para una entonación estable.
- Accesibilidad y lectura de pantalla: síntesis de contenido web o documentos en nepalí para usuarios con discapacidad visual, con la referencia de voz fija para una experiencia consistente.
- Prototipado de productos de voz para el mercado nepalí: evaluación rápida de interfaces habladas antes de invertir en grabaciones profesionales, gracias a los artefactos de inferencia listos para usar.
- Personalización de voz en aplicaciones: clonación de una voz concreta (previa autorización) para demos, avatares o contenidos de marca, usando `get_conditioning_latents` sobre una muestra corta.
- Doblaje y localización de contenido al nepalí: sustitución de pistas de voz en vídeos educativos o corporativos, segmentando el guion por frases para evitar repeticiones al final de oración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; los pesos de inferencia ocupan 1,9 GB, por lo que se requiere al menos esa cantidad de memoria más el overhead de activaciones y del vocoder. Una GPU con 8 GB o más debería ser suficiente en la práctica, aunque no hay cifras publicadas.
- GPU recomendadas: no disponible. El código del autor contempla `cuda`, `mps` y `cpu`, sin especificar modelos de GPU concretos.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de los pesos, pero no hay confirmación oficial ni lista de GPUs validadas.
- Opciones de despliegue: `coqui-tts` (paquete `TTS` de Coqui) con `XttsConfig` y `Xtts`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sadan2026/nepali-xtts-v2-v3 | no disponible | no disponible | nepalí | CPML | Hugging Face, 0 descargas |
| Oshara/xtts-v2-nepali | no disponible | no disponible | nepalí | no disponible | Hugging Face (modelo base) |
| Coqui XTTS-v2 (original) | no disponible | no disponible | multilingüe | CPML | Hugging Face / Coqui |

La comparación se limita a los modelos citados en la información disponible; no se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Modelo de autor individual con escasa validación comunitaria: cero descargas y cero likes en el momento de la ficha, sin benchmarks publicados.
- Riesgo de repetición de palabras al final de oración; el autor mitiga con `temperature=0.22` y `repetition_penalty=2.5`, lo que puede reducir la expresividad.
- Requiere pasar `language="hi"` en inferencia por el espacio de tokens Devanagari del vocabulario, lo que puede inducir confusión o errores si no se sigue la indicación.
- Necesita preprocesado específico: normalización Unicode NFC, conversión de dígitos a palabras y segmentación manual por frases.
- Sesgos conocidos: no documentados; al entrenarse sobre FLEURS y OpenSLR 43 (`ne_np_female`), la voz resultante puede estar sesgada hacia el registro y género de esos corpus.
- Riesgo de alucinación acústica y artefactos en textos largos o con caracteres fuera del vocabulario Devanagari previsto.
- Licencia CPML: impone condiciones de uso derivadas de Coqui XTTS-v2; debe revisarse antes de un uso comercial. Los datos OpenSLR 43 están bajo CC BY-SA 4.0.
- La clonación de voz plantea riesgos de suplantación y requiere consentimiento explícito de la persona cuya voz se replica.
- No hay garantías de soporte ni mantenimiento del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sadan2026/nepali-xtts-v2-v3
- Modelo base: https://huggingface.co/Oshara/xtts-v2-nepali
- Coqui TTS (repositorio): https://github.com/coqui-ai/TTS
- Dataset Google FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset OpenSLR 43: https://www.openslr.org/43/
- Sitio del autor (Ayata Inc.): https://ayata.com.np
- Licencia Coqui Public Model License (CPML): https://coqui.ai/cpml

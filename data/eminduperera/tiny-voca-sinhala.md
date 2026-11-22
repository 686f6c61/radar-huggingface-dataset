# eminduperera/tiny-voca-sinhala

## Resumen

tiny-voca-si es un modelo de síntesis de voz (text-to-speech) para sinhala (සිංහල) desarrollado por el usuario eminduperera. Se trata de una adaptación del proyecto tiny-voca, una arquitectura ligera de TTS que prescinde de vocoder neuronal y emplea una cabeza de forma de onda source-filter. El modelo cuenta con 4,5 millones de parámetros y un peso aproximado de 20 MB, lo que lo sitúa en la categoría de modelos ultraligeros capaces de ejecutarse en CPU convencional, tanto en PyTorch como en ONNX Runtime.

El modelo se entrenó desde cero sobre aproximadamente 18 horas de audio en sinhala y ofrece dos voces fijas: M1 (masculina, con unos 16 h de datos) y F1 (femenina, con unas 2 h). La salida es audio mono a 24 kHz en formato float32. Su relevancia radica en cubrir un idioma de bajos recursos como el sinhala con un modelo de despliegue trivial, sin necesidad de GPU ni de infraestructura de inferencia compleja.

La ficha se basa exclusivamente en la model card publicada por el autor. No se han publicado resultados formales de benchmarks ni evaluaciones objetivas de calidad (por ejemplo, WER con ASR en sinhala), por lo que la valoración cualitativa del modelo debe hacerse por escucha directa de las muestras disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer text encoder de 4 bloques con predicción explícita de duración, pitch y energía, más cabeza de forma de onda source-filter (sin vocoder neuronal) |
| Parametros totales | 4,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa el texto oración a oración, sin límite de contexto declarado) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX y checkpoint PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | sinhala (si) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (`tiny-voca-si.onnx` + metadatos JSON) y PyTorch (`tiny-voca-si.pt`) |

## Arquitectura y entrenamiento

La arquitectura es la de tiny-voca sin modificaciones: un encoder de texto transformer de 4 bloques, predicción explícita de duración, pitch y energía, y una cabeza de generación de forma de onda basada en modelo source-filter en lugar de un vocoder neuronal. El front-end textual convierte el sinhala en fonemas mediante la voz sinhala de eSpeak NG (wheel `espeakng-loader` fijado), con correcciones propias: eliminación de zero-width joiners (para mantener ශ්‍රී y ක්‍ර como una sola palabra), lectura de ශ como `ʃ` y conversión de las oclusivas prenasalizadas ඹ, ඳ y ඟ en fonemas únicos (`ᵐb`, `ⁿd`, `ᵑɡ`). El inventario resultante tiene 73 símbolos y las 9.686 frases de entrenamiento fonemizan sin fonemas desconocidos.

El entrenamiento usó el dataset Path Nirvana Sinhala TTS (release v2.1 más el primer release), remuestreado a 24 kHz y con silencios de borde recortados: 9.686 clips de 1 a 15 s, divididos por frase en train, validación y test. Las duraciones de fonemas se obtuvieron por alineamiento forzado con `facebook/wav2vec2-lv-60-espeak-cv-ft` (solo como anotación), con umbrales de calidad fijados a partir de la propia distribución de los datos (probabilidad media de token ≥ 0,33 y proporción de fonemas débiles ≤ 0,5), conservando el 94 % de los clips: 8.632 de train (18,3 h), 189 de validación y 161 de test. Se siguió la receta por defecto de tiny-voca: 39.425 pasos, pérdidas espectrales solo durante los primeros 8.000 pasos y pérdidas adversarias después, en una única NVIDIA T4 (Kaggle) durante unas 10,7 horas. La pérdida mel final de validación fue 0,52.

## Capacidades

- Síntesis de voz en sinhala a partir de texto, con salida mono a 24 kHz en float32.
- Dos voces fijas seleccionables: `M1` (masculina, la más clara por disponer de más datos) y `F1` (femenina).
- Procesamiento de texto de cualquier longitud: el modelo lee el texto oración por oración.
- Control de velocidad mediante el parámetro `speed` (valores mayores aceleran la locución).
- Control de tono mediante `pitch_shift` (0,058 ≈ un semitono) y de entonación mediante `pitch_range`.
- Inferencia en CPU con ONNX Runtime sin necesidad de instalar el paquete tiny-voca, mediante el runner `speak.py` incluido.
- Inferencia y reentrenamiento en PyTorch aplicando `sinhala.patch` sobre tiny-voca en el commit `70759ac`.
- No dispone de clonación de voz, tool calling, capacidades multimodales ni modo de razonamiento; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de contenido en sinhala para webs y aplicaciones: el modelo convierte artículos o notificaciones en audio con una llamada a `speak()` y guarda WAV a 24 kHz, sin requerir GPU, lo que permite ejecutarlo en el mismo servidor de aplicaciones.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o extensiones que lean texto sinhala oración por oración, aprovechando que el modelo procesa texto de longitud arbitraria de forma secuencial.
- Generación de audiolibros y material educativo: la voz `M1`, entrenada con 16 h de prosa budista y educativa, encaja en la lectura de textos formales de ese dominio, que es el más representado en el corpus.
- Sistemas de anuncios y avisos automatizados: avisos de transporte, meteorología o servicios públicos en sinhala, con control de velocidad para adaptar la locución a contextos de escucha rápida.
- Prototipado de asistentes de voz en sinhala: al ser un modelo de 20 MB ejecutable en CPU, sirve para validar pipelines completos de ASR + TTS en entornos de desarrollo sin infraestructura de GPU.
- Pruebas de integración y CI: el runner ONNX y el script `speak.py` permiten generar audio de referencia en tests automatizados de aplicaciones que consumen TTS, con tiempos de ejecución bajos en CPU.
- Investigación en TTS para lenguas de bajos recursos: el parche `sinhala.patch` y el checkpoint PyTorch permiten reentrenar o adaptar el modelo a otros idiomas partiendo de la receta documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no existe una evaluación formal (no hay word error rate con ASR en sinhala) y que la calidad debe juzgarse por escucha. El único dato cuantitativo de entrenamiento es la pérdida mel de validación final de 0,52.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso ONNX/CPU; el modelo pesa unos 20 MB y puede ejecutarse en memoria RAM convencional.
- GPU recomendadas: no se requieren; el entrenamiento se realizó en una única NVIDIA T4 (Kaggle) durante unas 10,7 horas. Para inferencia en GPU no se documentan requisitos específicos.
- Cabe en cualquier GPU de consumo e incluso en CPU sin aceleración; el autor lo describe como ejecutable en "an ordinary CPU".
- Opciones de despliegue: ONNX Runtime mediante el runner incluido (`speak.py`, `frontend.py`, `sinhala.py`), o PyTorch con el código de tiny-voca y `sinhala.patch`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Voces | Licencia | Formato | Ejecución en CPU |
|---|---|---|---|---|---|---|
| tiny-voca-si | 4,5 M | sinhala | 2 fijas | GPL-3.0 | ONNX, PyTorch | Sí |
| tiny-voca (original) | no disponible en la información | multilingüe (según proyecto base) | no disponible | Apache-2.0 (código) | PyTorch | Sí |
| Alternativas TTS comerciales en sinhala | no disponible | sinhala | variable | propietaria | API | no aplica |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y formato de despliegue.

## Limitaciones y advertencias

- La pronunciación sigue las reglas de eSpeak NG para sinhala: no distingue ඬ de ණ්ඩ, lee los dígitos palabra por palabra y aproxima algunas palabras en pali/sánscrito, abreviaturas y palabras en alfabeto latino.
- El texto de entrenamiento es mayoritariamente prosa budista y educativa, por lo que la prosodia conversacional cotidiana resulta menos natural.
- La voz `F1` dispone de solo unas 2 h de datos y es menos clara que `M1`.
- Solo hay dos voces fijas; no existe clonación de voz.
- No hay evaluación objetiva publicada (sin WER con ASR en sinhala); la calidad debe validarse por escucha antes de usarlo en producción.
- Licencia GPL-3.0 en los pesos, heredada del dataset de entrenamiento: el uso comercial queda sujeto a las obligaciones de esta licencia.
- Los hablantes cedieron sus voces únicamente para generación de habla no obscena y no ofensiva; no debe usarse para suplantarles ni para contenido engañoso, obsceno u ofensivo.
- Riesgo de alucinación no aplicable en el sentido de generación de texto, pero sí de errores de pronunciación y prosodia en dominios alejados del corpus de entrenamiento.
- El modelo solo soporta sinhala; no hay capacidades multilingües.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eminduperera/tiny-voca-sinhala
- Repositorio tiny-voca: https://github.com/n4ze3m/tiny-voca
- Dataset Path Nirvana Sinhala TTS: https://github.com/pnfo/sinhala-tts-dataset
- Alineador usado para anotación: https://huggingface.co/facebook/wav2vec2-lv-60-espeak-cv-ft
- Muestras de audio: https://huggingface.co/eminduperera/tiny-voca-sinhala/tree/main/samples

# demoqqq/banglatts-merged-news

## Resumen

BanglaTTS Merged News Voice es un modelo de síntesis de voz (text-to-speech) para bengalí, construido por el usuario demoqqq mediante la fusión de dos ajustes finos del modelo base VITS EMTIAZZ Bangladeshi Bangla. El resultado es una voz masculina única con estilo de locución informativa (news style), orientada a la lectura de textos periodísticos en bengalí. La arquitectura subyacente es VITS, un modelo generativo de extremo a extremo que combina un encoder de texto, un predictor de duración y un decoder acústico con vocoder integrado, y que en este caso se distribuye principalmente en formato ONNX para su uso con sherpa-onnx.

La relevancia del modelo es acotada: se trata de un artefacto de investigación publicado por un autor individual, sin métricas objetivas publicadas, sin licencia declarada y sin descargas ni validación por parte de la comunidad. Su interés técnico reside en el método de fusión: se promediaron al 50% los 948 tensores coincidentes de dos fine-tunes, alineando las filas del embedding del encoder de texto por identidad de carácter y preservando las filas de los 6 caracteres nuevos introducidos por el tokenizador extendido de 92 tokens.

El repositorio ocupa 0,4 GB e incluye el modelo ONNX (114 MB), el checkpoint PyTorch fusionado (332 MB), el tokenizador en formato sherpa-onnx y en formato Coqui, y la configuración del run de 97 épocas. No se dispone de información sobre el pipeline declarado, los idiomas soportados más allá del bengalí indicado en los metadatos, ni la licencia de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech extremo a extremo, no autoregresiva) |
| Parametros totales | no disponible (checkpoint PyTorch de 332.536.867 bytes; ONNX de 114.192.739 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; entrada por texto, no por ventana de contexto) |
| Tipos de cuantizacion | no disponible (se distribuye un ONNX sin cuantizar declarada y un checkpoint .pth) |
| Idiomas soportados | bengalí (bn), según metadatos ONNX |
| Licencia | no disponible |
| Formato de pesos | ONNX (`model_fullmeta.onnx`) y PyTorch (`merged_best_model.pth`) |
| Frecuencia de muestreo | 22050 Hz |
| Numero de hablantes | 1 (voz masculina) |
| Vocabulario del tokenizador | 92 tokens (incluye dígitos y símbolos) |
| Motor de inferencia recomendado | sherpa-onnx 2.0.1 (app model) |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo se basa en VITS, una arquitectura de TTS condicional variacional que integra en un único entrenamiento el encoder de texto, el predictor de duración, el decoder acústico y el vocoder. El modelo resultante se ha obtenido por fusión (model merging) de dos ajustes finos del base EMTIAZZ Bangladeshi Bangla VITS: por un lado, un reentrenamiento desde cero denominado news-v2 97ep, con 1.863 clips y 97 de 100 épocas completadas, que extendió el vocabulario a 92 tokens añadiendo dígitos y símbolos; por otro, un modelo denominado combined, entrenado con 1.262 clips de Kiki, que el autor describe como voz informativa aprobada por el usuario.

La fusión consistió en un promedio 50/50 de los 948 tensores coincidentes entre ambos checkpoints. Las filas del embedding del encoder de texto se promediaron por identidad de carácter, mientras que las filas correspondientes a los 6 caracteres exclusivos del tokenizador de 97 épocas se conservaron intactas. El modelo fusionado adopta el tokenizador y la configuración del run de 97 épocas (92 tokens), de modo que los dígitos y símbolos permanecen disponibles en la entrada. No se dispone de información sobre el volumen total de datos de entrenamiento en horas de audio, la composición del dataset, ni sobre el uso de técnicas de RLHF o DPO, que no aplican de forma estándar en TTS de este tipo.

## Capacidades

- Síntesis de voz (text-to-speech) en bengalí a partir de texto escrito, con salida a 22050 Hz.
- Voz masculina única, con estilo de locución informativa (news style) según la model card.
- Manejo de dígitos y símbolos gracias al tokenizador extendido de 92 tokens.
- Integración con sherpa-onnx 2.0.1 como app model, con metadatos que incluyen `sample_rate`, `n_speakers` y `language bn`.
- Control de prosodia mediante los parámetros del motor: `noiseScale` 0.667, `noiseScaleW` 0.8, `lengthScale` 1.0 y `silenceScale` 0.2.
- Procesamiento por frases con `maxNumSentences` 1 y 8 hilos en CPU.
- No se declaran capacidades de tool calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- Lectura automatizada de noticias en bengalí: el modelo está ajustado específicamente con estilo informativo y clips periodísticos, por lo que es adecuado para convertir titulares y cuerpos de noticia en audio para portales o aplicaciones de noticias.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o aplicaciones que conviertan contenido web en bengalí a voz, aprovechando el soporte de dígitos y símbolos del tokenizador de 92 tokens para leer fechas, cifras y puntuación.
- Locución para boletines y resúmenes diarios: generación de audio pregrabado para pódcast de actualidad o boletines breves, con una voz masculina consistente y sin necesidad de un locutor humano.
- Síntesis en el dispositivo o en servidores sin GPU: el formato ONNX y el proveedor CPU de sherpa-onnx permiten desplegar el modelo en entornos con recursos limitados, como aplicaciones móviles o servicios de bajo coste.
- Pruebas de integración de TTS en pipelines de aplicaciones: el par `model_fullmeta.onnx` + `tokens_sherpa.txt` está pensado para ser descargado y empaquetado como assets en una app, lo que facilita la inclusión en builds automatizados.
- Investigación sobre fusión de modelos: el repositorio documenta un caso concreto de model merging con alineamiento de embeddings por carácter, útil como referencia para experimentos de combinación de fine-tunes en TTS.
- Generación de audio para prototipos de asistentes conversacionales en bengalí: aunque no se declaran capacidades de diálogo, la salida de voz puede emplearse como capa de síntesis en un sistema mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única evaluación mencionada es un juicio subjetivo de escucha del 2026-11-05, en el que el autor indica que, sobre el mismo texto informativo de Mirpur, la voz fusionada fue considerada mejor que la de ambos modelos parentales. No se aportan métricas objetivas como MOS, CMOS, WER ni latencias medidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está pensado para ejecutarse en CPU con sherpa-onnx, por lo que no requiere GPU.
- GPU recomendadas: no aplica para el flujo documentado; el motor configurado usa el proveedor CPU con 8 hilos.
- Compatibilidad con GPU de consumo: el modelo es lo bastante pequeño (ONNX de 114 MB) como para caber en cualquier GPU de consumo si se configura un proveedor acelerado, aunque no se documenta ese flujo.
- Opciones de despliegue: sherpa-onnx 2.0.1 como motor principal; el checkpoint `.pth` podría cargarse con Coqui TTS, aunque la model card advierte que la app debe usar `tokens_sherpa.txt` y no el `tokens.txt` de Coqui.
- Latencia y throughput estimados: no disponibles; no se publican mediciones de tiempo real ni de RTF.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BanglaTTS Merged News Voice (demoqqq) | VITS | bengalí | ONNX, PyTorch | no disponible | Hugging Face, 0 descargas |
| EMTIAZZ Bangladeshi Bangla VITS (base) | VITS | bengalí | no disponible en esta ficha | no disponible | modelo base referenciado por el autor |
| Alternativas TTS multilingües de gran escala | no disponible | múltiples | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar parámetros, contexto, rendimiento ni licencia con alternativas concretas de la misma categoría. La comparación más directa es con el modelo base EMTIAZZ Bangladeshi Bangla VITS y con los dos fine-tunes parentales (news-v2 97ep y combined), pero no se han publicado métricas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifican condiciones de uso comercial, lo que impide determinar si el modelo puede utilizarse en producción.
- Sin métricas objetivas: no hay MOS, CMOS, WER ni evaluaciones reproducibles; la única validación es un juicio subjetivo del autor.
- Un solo hablante y un solo idioma: voz masculina única en bengalí, sin capacidad de cambio de hablante ni de idioma.
- Riesgo de artefactos y alucinación acústica: como todo modelo VITS, puede producir pronunciaciones incorrectas, entonación anómala o ruido en textos fuera de dominio, especialmente con palabras no vistas durante el entrenamiento.
- Dataset limitado: los fine-tunes se entrenaron con 1.863 y 1.262 clips respectivamente, un volumen reducido que puede limitar la cobertura léxica y la naturalidad en dominios distintos al informativo.
- Tokenizador específico: la app debe usar `tokens_sherpa.txt` en lugar del `tokens.txt` de Coqui; un uso incorrecto del tokenizador puede degradar o romper la síntesis.
- Dependencia de metadatos ONNX: el motor sherpa-onnx requiere que el metadato incluya la cadena "coqui" para seleccionar la ruta VITS correcta; alterar los metadatos puede impedir la carga.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin revisión por parte de la comunidad.
- Sin información sobre sesgos: no se documentan sesgos de género, dialectales ni de dominio en el dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/demoqqq/banglatts-merged-news
- Modelo base referenciado (EMTIAZZ Bangladeshi Bangla VITS): no disponible como enlace directo en la información proporcionada
- Paper de VITS: no disponible en la información proporcionada
- Repositorio de sherpa-onnx: no disponible en la información proporcionada
- Repositorio de Coqui TTS: no disponible en la información proporcionada

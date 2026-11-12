# raikiri1498/VieNeu-TTS

## Resumen

VieNeu-TTS es un sistema de síntesis de voz (text-to-speech) orientado a vietnamita e inglés, desarrollado originalmente por pnnbao-ump (Hugging Face) y pnnbao97 (GitHub). El repositorio analizado, `raikiri1498/VieNeu-TTS`, es un espejo (mirror) sin modificaciones de los modelos VieNeu-TTS v3 Nano y v3 Turbo, publicado para que la aplicación de lectura de cuentos Tàng Công Các pueda descargar los pesos desde una fuente fija y funcionar en modo offline. No se trata, por tanto, de un modelo nuevo ni de una variante reentrenada: todos los ficheros se copian byte a byte desde los repositorios originales.

El modelo combina un pipeline de flow-matching con un códec de audio para generar voz a 24 kHz (variante Nano, en formato ONNX) y a 48 kHz (variante Turbo, en formato GGUF q8_0 para audio.cpp). Incluye componentes auxiliares para clonación de voz: un codificador de hablante (`speaker_encoder.onnx`), un denoiser para limpiar grabaciones de referencia y un módulo de conversión grafema-fonema específico para vietnamita (`sea_g2p.bin`).

Su relevancia práctica es acotada: es útil para quien necesite un TTS ligero y desplegable en local para vietnamita e inglés, con licencia Apache-2.0 y pesos ya cuantizados para inferencia en CPU o GPUs modestas. No obstante, al ser un espejo, carece de documentación técnica propia y de benchmarks publicados en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de flow-matching con text encoder, duration predictor, vector estimator y codec decoder/encoder (según estructura de ficheros del repo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX (Nano, sin cuantización declarada); GGUF q8_0 (Turbo) |
| Idiomas soportados | vietnamita (vi), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (Nano), GGUF (Turbo), safetensors no incluido en este mirror |
| Frecuencia de muestreo de salida | 24 kHz (Nano), 48 kHz (Turbo) |
| Tamano del repositorio | 0,7 GB |
| Modelos base | pnnbao-ump/VieNeu-TTS-v3-Nano, pnnbao-ump/VieNeu-TTS-v3-Turbo |

## Arquitectura y entrenamiento

La arquitectura se deduce de la organización de ficheros del repositorio: un `text_encoder`, un `duration_predictor`, un `vector_estimator` y un `codec_decoder` para la síntesis, más un `codec_encoder` y un `reference_encoder` para la clonación de voz. El uso de un `vector_estimator` y de flow-matching es coherente con los TTS modernos no autorregresivos basados en modelos de difusión/flow, que generan latentes de audio a partir de representaciones textuales y de una referencia de hablante. La variante Nano opera a 24 kHz en ONNX; la Turbo, a 48 kHz en GGUF q8_0 para audio.cpp.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO o ajuste fino supervisado. El repositorio es explícitamente un espejo sin reentrenamiento ni recuantización, por lo que cualquier detalle de entrenamiento debe consultarse en los repositorios originales (`pnnbao-ump/VieNeu-TTS-v3-Nano` y `pnnbao-ump/VieNeu-TTS-v3-Turbo`). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz (text-to-speech) en vietnamita e inglés.
- Generación de audio a 24 kHz (Nano) y 48 kHz (Turbo).
- Clonación de voz mediante codificador de hablante y codificador de referencia.
- Limpieza de grabaciones de referencia mediante un denoiser dedicado.
- Conversión grafema-fonema específica para vietnamita (`sea_g2p.bin`), lo que mejora la pronunciación de un idioma con diacríticos y tonos.
- Conjunto de voces predefinidas empaquetadas (`voices_v3_nano.json` para Nano; `gguf/voices/` con `ref_codes` y `speaker.emb` para Turbo).
- Inferencia offline: los pesos están pensados para descargarse y ejecutarse localmente sin conexión.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada (ASR).

## Casos de uso

- Lectura de cuentos y audiolibros en vietnamita: el modelo está empaquetado específicamente para la app Tàng Công Các, que descarga los pesos y sintetiza narración offline; la variante Turbo a 48 kHz es adecuada para contenido de larga duración donde prima la calidad de audio.
- Clonación de voz para narración personalizada: a partir de una grabación de referencia, el `speaker_encoder` y el `denoiser` permiten generar una voz consistente para un narrador concreto en todos los capítulos de una obra.
- Asistentes de voz embebidos en aplicaciones móviles o de escritorio: al estar en ONNX (Nano) y GGUF q8_0 (Turbo), puede integrarse en runtimes ligeros sin dependencia de servicios en la nube.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de textos en vietnamita e inglés con pronunciación corregida mediante el módulo G2P específico.
- Prototipado de interfaces conversacionales en vietnamita: útil para equipos que necesiten un TTS local con licencia permisiva antes de decidir si migran a un servicio comercial.
- Generación de voces para contenido educativo o de divulgación: el soporte de dos idiomas permite producir materiales bilingües con un mismo pipeline y un conjunto de voces coherente.
- Evaluación comparativa de TTS ligeros: sirve como referencia de despliegue en CPU/GPU modesta frente a alternativas más pesadas, gracias a sus formatos cuantizados listos para usar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio completo ocupa 0,7 GB, por lo que el modelo cuantizado (Turbo q8_0) y los componentes ONNX de Nano deberían caber holgadamente en GPUs de consumo, aunque no se especifica el consumo exacto en memoria.
- GPU recomendadas: no disponible. Por tamaño, es plausible su ejecución en GPUs de gama media e incluso en CPU, pero el repositorio no aporta cifras de latencia ni throughput.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del repositorio y el uso de cuantización q8_0 y ONNX; sin datos oficiales que lo confirmen.
- Opciones de despliegue: ONNX Runtime para la variante Nano; audio.cpp para la variante Turbo en GGUF. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama (estos últimos orientados a LLM, no a TTS).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables en la información proporcionada para establecer una comparativa rigurosa con otros sistemas TTS. Se indica "no disponible".

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| VieNeu-TTS v3 Nano (este mirror) | no disponible | no disponible | vi, en | Apache-2.0 | ONNX |
| VieNeu-TTS v3 Turbo (este mirror) | no disponible | no disponible | vi, en | Apache-2.0 | GGUF q8_0 |
| Alternativas TTS comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un espejo sin modificar: no corrige posibles sesgos, errores ni limitaciones del modelo original; cualquier problema debe reportarse en los repositorios de origen.
- No se documentan sesgos conocidos, pero al estar entrenado principalmente para vietnamita e inglés, el rendimiento en otros idiomas será previsiblemente deficiente.
- Riesgo de alucinación acústica: como todo TTS generativo, puede producir pronunciaciones incorrectas, artefactos o entonaciones anómalas, especialmente en textos con nombres propios, siglas o mezcla de idiomas.
- Limitaciones de contexto: no se especifica la longitud máxima de texto por inferencia; los textos largos probablemente deban fragmentarse.
- La licencia Apache-2.0 permite uso comercial, pero al tratarse de un mirror conviene verificar la licencia y condiciones en los repositorios originales antes de desplegar en producción.
- La clonación de voz plantea riesgos éticos y legales (suplantación de identidad, deepfakes de audio); el uso debe limitarse a voces con consentimiento explícito.
- No hay garantías de mantenimiento ni soporte por parte del autor del mirror; los enlaces a commits concretos indican que el contenido está congelado.
- El repositorio no incluye los pesos en safetensors ni las variantes bf16/ONNX int8 de Turbo; quien los necesite debe acudir al repositorio original.

## Enlaces

- Repositorio mirror en Hugging Face: https://huggingface.co/raikiri1498/VieNeu-TTS
- Modelo base Nano: https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Nano
- Modelo base Turbo: https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo
- Repositorio GitHub del proyecto: https://github.com/pnnbao97/VieNeu-TTS
- Módulo G2P para vietnamita: https://github.com/pnnbao97/sea-g2p
- Commit del modelo Nano referenciado: https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Nano/tree/aba295eb96a6fa6003ebe417cc1f2802a7adc1dc
- Commit del modelo Turbo referenciado: https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo/tree/61b85e3d937fbbacb387714180e8182823512523
- Commit del repositorio GitHub referenciado: https://github.com/pnnbao97/VieNeu-TTS/tree/2e982ff857bbe23fffa0c314e0f60da2497e2f4b

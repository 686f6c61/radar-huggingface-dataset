# OxReD112/kokoro-german-victoria-web

## Resumen

Kokoro German Victoria Web es una version cuantizada en int8 de solo pesos del modelo de sintesis de voz `soniqo/Kokoro-82M-German-Victoria-ONNX`, publicada por el usuario OxReD112. Su proposito es permitir inferencia de texto a voz en el navegador mediante `onnxruntime-web`, reduciendo el peso del modelo de 162 MB a aproximadamente 82 MB sin cambios perceptibles en la calidad de audio segun las pruebas de escucha del autor. El modelo conserva la arquitectura y el comportamiento del export original, que a su vez deriva de la familia Kokoro (compatible con StyleTTS2) y del modelo base `hexgrad/Kokoro-82M`.

La relevancia de esta ficha radica en que ejemplifica el flujo de despliegue de TTS ligero en el cliente: cuantizacion weight-only, pesos en int8 con escalas por canal y expansion mediante `DequantizeLinear`, manteniendo todos los calculos en float32. El modelo esta especializado en aleman (`de`), con una unica voz femenina (Victoria) y un limite de 128 fonemas y 5 segundos de audio por inferencia. El repositorio ocupa 0,1 GB y no registra descargas ni interacciones en el momento de la consulta.

No se trata de un modelo entrenado desde cero ni de una nueva receta de entrenamiento: es un artefacto de distribucion optimizado para web. Por tanto, sus capacidades y limitaciones heredan directamente las del modelo base y del export ONNX de soniqo, y cualquier evaluacion de calidad debe remitirse a esos origenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro (compatible con StyleTTS2), exportada a ONNX |
| Parametros totales | 82M (heredados del modelo base Kokoro-82M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; limite de entrada de 128 fonemas y 5 s de audio por inferencia |
| Tipos de cuantizacion | int8 weight-only con escala por canal; computo en float32 |
| Idiomas soportados | aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX con datos externos (`kokoro-e2e-int8.onnx` + `kokoro-e2e-int8.onnx.data`) |

## Arquitectura y entrenamiento

El modelo es un sistema de texto a voz de un solo hablante basado en la arquitectura Kokoro, compatible con StyleTTS2, con 82 millones de parametros. La cadena de inferencia parte de fonemas IPA, consulta el diccionario de pronunciacion aleman `dict_de.json`, utiliza la tabla `vocab_index.json` para la conversion a tokens y aplica el embedding de voz `voices/df_victoria.bin` (256 valores float32). La salida es audio sintetizado con un maximo de 128 fonemas y 5 segundos por peticion.

El artefacto publicado no incluye reentrenamiento. La unica modificacion respecto al export de soniqo es la cuantizacion weight-only: cada tabla de pesos FP16 se almacena como int8 con una escala por canal y se expande en tiempo de ejecucion mediante `DequantizeLinear`, mientras que todos los calculos permanecen en float32. Esto reduce el tamano de 162 MB a unos 82 MB de pesos, mas 3 MB de grafo (frente a 3,6 MB del original). El autor declara que no hay diferencia audible en pruebas de escucha, si bien no se documenta la metodologia ni el tamano de dichas pruebas. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni el uso de RLHF o DPO, ya que esos datos corresponden a los modelos upstream y no se detallan en la informacion proporcionada.

## Capacidades

- Sintesis de voz a partir de texto en aleman, con conversion previa a fonemas IPA mediante el diccionario incluido.
- Voz unica femenina (Victoria) con embedding de 256 dimensiones en float32.
- Inferencia en navegador mediante `onnxruntime-web`, sin dependencia de servidor.
- Ejecucion en dispositivos con recursos limitados gracias a la cuantizacion int8 de solo pesos.
- Integracion con el ecosistema Kokoro y con herramientas compatibles con StyleTTS2.
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento, agentes ni multi-step reasoning.
- No soporta vision, audio de entrada ni otras modalidades.
- Capacidad multilingue limitada exclusivamente al aleman.

## Casos de uso

- Lectura por voz en aplicaciones web: el modelo puede ejecutarse integramente en el navegador con `onnxruntime-web`, permitiendo narrar contenido sin enviar texto a un servidor y sin costes de inferencia en la nube.
- Accesibilidad en sitios web: integracion de un lector de texto en aleman para usuarios con discapacidad visual, con una huella de 82 MB de pesos que se puede cachear en el cliente.
- Asistentes de voz offline en aplicaciones de escritorio o moviles: al no requerir conexion, encaja en escenarios de privacidad estricta donde el texto no debe salir del dispositivo.
- Prototipado rapido de interfaces conversacionales en aleman: la API sencilla de ONNX y el limite de 5 segundos por inferencia facilitan la generacion de respuestas cortas en demos y pruebas de concepto.
- Generacion de avisos y notificaciones habladas: fragmentos breves de menos de 128 fonemas, como alertas, recordatorios o mensajes de estado, se ajustan al limite del modelo.
- Educacion de idiomas: reproduccion de pronunciacion alemana controlada por diccionario, util para ejercicios de vocabulario y frases cortas.
- Pruebas de regresion de pipelines TTS: como artefacto int8 determinista en formato ONNX, sirve para validar cadenas de preprocesado fonetico y postprocesado de audio en CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta una reduccion de tamano (de 162 MB a 82 MB de pesos) y ausencia de diferencias audibles en pruebas de escucha no documentadas. No hay datos de MOS, WER, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo esta disenado para ejecucion en CPU y en navegador, con pesos de unos 82 MB que caben holgadamente en memoria de cualquier dispositivo moderno.
- GPU recomendadas: no se especifican; el caso de uso principal es CPU y `onnxruntime-web` en el navegador.
- Cabe en GPU de consumo: si, aunque no es el escenario objetivo; cualquier GPU con mas de 1 GB de memoria libre puede alojar los pesos.
- Opciones de despliegue: `onnxruntime-web` (objetivo principal), `onnxruntime` nativo, y potencialmente `sherpa-onnx` segun el export relacionado de Benjamin Wegener.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / limite | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| OxReD112/kokoro-german-victoria-web | 82M | 128 fonemas, 5 s | de | Apache 2.0 | ONNX int8 |
| soniqo/Kokoro-82M-German-Victoria-ONNX | 82M | 128 fonemas, 5 s | de | Apache 2.0 | ONNX FP16 |
| hexgrad/Kokoro-82M | 82M | no disponible | en (principal) | Apache 2.0 | PyTorch / ONNX |
| kikiri-tts/kikiri-german-victoria | 82M | no disponible | de | Apache 2.0 | no disponible |

La comparativa se limita a la familia Kokoro porque no se dispone de datos de benchmarks que permitan contrastar calidad con otras familias TTS. La diferencia principal entre el modelo de esta ficha y el export de soniqo es el tamano (82 MB frente a 162 MB) y el formato int8, con el mismo limite de entrada y la misma voz.

## Limitaciones y advertencias

- Sesgos: al ser una voz unica femenina alemana, no representa diversidad de voces, acentos ni generos; no se documentan evaluaciones de sesgo.
- Alucinacion: en TTS el riesgo se traduce en pronunciaciones incorrectas o prosodia anomalа ante palabras fuera del diccionario o fonemas no cubiertos.
- Contexto: el limite de 128 fonemas y 5 segundos por inferencia restringe el uso a fragmentos cortos; textos largos requieren segmentacion manual.
- Idioma: solo aleman; el diccionario y el vocabulario estan especializados y no se garantiza un comportamiento correcto en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda conservar la atribucion a los autores upstream indicada en la model card.
- Produccion: el repositorio no registra descargas ni validacion externa; la afirmacion de ausencia de diferencias audibles no esta respaldada por una evaluacion publicada.
- Cuantizacion: la expansion int8 a float32 mediante `DequantizeLinear` anade una capa de dequantizacion en cada paso; no se documenta el impacto exacto en latencia.
- Mantenimiento: el modelo fue creado y actualizado el mismo dia (2026-11-07) y no hay historial de versiones ni issues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OxReD112/kokoro-german-victoria-web
- Modelo base ONNX: https://huggingface.co/soniqo/Kokoro-82M-German-Victoria-ONNX
- Modelo Kokoro original: https://huggingface.co/hexgrad/Kokoro-82M
- Voz alemana Victoria: https://huggingface.co/kikiri-tts/kikiri-german-victoria
- Receta de entrenamiento kikiri-tts: https://github.com/semidark/kikiri-tts
- Export ONNX int8 relacionado: https://github.com/Benjamin-Wegener/kokoro-german-victoria-onnx-int8
- Ficha en free2aitools: https://free2aitools.com/model/benjamin-wegener/kokoro-german-victoria-onnx-int8

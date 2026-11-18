# DanielSuncost/tiny-voca-fr

## Resumen

tiny-voca-fr es un modelo de sintesis de voz (text-to-speech) en frances parisino, desarrollado por DanielSuncost como adaptacion al frances del modelo tiny-voca de n4ze3m. Se trata de un modelo extremadamente compacto: 4,5 millones de parametros y aproximadamente 18 MB incluyendo el generador de forma de onda, lo que permite su ejecucion en CPU o directamente en el navegador mediante ONNX. El modelo ofrece dos voces fijas (una femenina y otra masculina) y sintetiza audio a 24 kHz a partir de identificadores de fonemas.

El modelo resuelve el problema de disponer de TTS en frances de baja latencia y bajo coste computacional para entornos con recursos limitados, sin necesidad de GPU. Su relevancia radica en la combinacion de tamano minimo, licencia permisiva Apache-2.0 y un pipeline de entrenamiento completamente sintetico supervisado por un modelo docente mayor (Qwen3-TTS 1.7B Base), lo que evita dependencias de datos grabados por humanos.

La entrada al modelo no es texto crudo sino fonemas generados por el front-end de eSpeak NG para frances (fr-fr), lo que condiciona tanto su integracion como sus limitaciones en el manejo de enlaces foneticos y casos irregulares del frances.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS acustico con generador de forma de onda; detalles de capas no publicados) |
| Parametros totales | 4,5 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada por frase; no se documenta limite de tokens) |
| Tipos de cuantizacion | no disponible (exportacion ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | frances (fr), variante parisina |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt) y ONNX (onnx/model.onnx) |
| Frecuencia de muestreo de salida | 24 kHz |
| Voces | 2 fijas: FR_F1 (femenina) y FR_M1 (masculina) |
| Tamano del repositorio | aproximadamente 18 MB con generador de onda incluido |

## Arquitectura y entrenamiento

No se han publicado detalles de la arquitectura interna mas alla de que se trata de un modelo TTS que recibe identificadores de fonemas y emite audio a 24 kHz junto con las duraciones por token. El modelo base es tiny-voca de n4ze3m, del que esta version es un port al frances. La inferencia acepta como entradas `tokens` y `stress` (int64 de forma [1, n]) procedentes del front-end de eSpeak NG fr-fr, `voice` (int64, 0 = FR_F1, 1 = FR_M1), y los parametros float32 `speed`, `pitch_shift` y `pitch_range`. Las salidas son `audio` (float32 a 24 kHz) y `durations` (frames por token).

El entrenamiento es completamente sintetico. Se utilizo Qwen3-TTS 1.7B Base (Apache-2.0) como modelo docente para leer 9.200 frases en dos voces disenadas con Qwen3-TTS VoiceDesign: 8.000 frases provenientes del recolector de frases de Common Voice (CC0) y 1.200 plantillas para numeros, precios, horas y fechas. Los clips se filtraron con Whisper large-v3-turbo y se alinearon con wav2vec2. El conjunto final de entrenamiento fue de 14,1 horas, con 100.000 pasos de entrenamiento.

## Capacidades

- Sintesis de voz en frances parisino a 24 kHz a partir de texto procesado por eSpeak NG.
- Dos voces fijas: FR_F1 (femenina, cuarenta y pocos anos, calida y clara) y FR_M1 (masculina, cincuenta y pocos anos, grave y calmada).
- Control de velocidad, desplazamiento de tono (pitch shift) y rango de tono mediante parametros de entrada.
- Salida de duraciones por token, util para alineacion y sincronizacion.
- Ejecucion en CPU y en navegador mediante el export ONNX.
- Cobertura de numeros, precios, horas y fechas gracias a las plantillas de entrenamiento.
- No dispone de clonacion de voz, tool calling, agentes, vision ni modo de razonamiento.

## Casos de uso

- Lectura por voz en aplicaciones web: el export ONNX permite ejecutar el modelo en el navegador del cliente, sintetizando frases en frances sin enviar texto a un servidor y sin coste de GPU.
- Asistentes de voz embebidos en dispositivos de bajos recursos: con 4,5 millones de parametros y unos 18 MB, cabe en Raspberry Pi u otros sistemas con CPU modesta para respuestas habladas en frances.
- Accesibilidad para personas con discapacidad visual: lectura de contenido en frances en aplicaciones de escritorio o moviles con latencia baja y sin dependencia de servicios en la nube.
- Generacion de avisos y locuciones dinamicas: anuncios de precios, horas y fechas en comercio o transporte, aprovechando las plantillas de entrenamiento especificas para estos formatos.
- Prototipado rapido de interfaces conversacionales: al tener dos voces y control de pitch y velocidad, sirve para maquetar flujos de voz antes de invertir en un TTS comercial.
- Sistemas de lectura de notificaciones y correos en frances: integracion en pipelines de backend con PyTorch o en el cliente con ONNX, con un coste computacional minimo.
- Investigacion en TTS de bajo coste: modelo de referencia para estudiar destilacion sintetica desde un docente mayor y evaluar el equilibrio entre tamano y calidad en frances.

## Benchmarks y rendimiento

| Metrica | FR_F1 | FR_M1 |
|---|---|---|
| WER de Whisper large-v3-turbo en frases de pronunciacion no vistas (enlace, h aspirada, vocales nasales, tu/tout, œuf/œufs) | 0 % | 0 % |
| WER de Whisper large-v3-turbo en frases de test reservadas | 0 % | 4,5 % (igual que el modelo docente) |

No se han publicado resultados de benchmarks adicionales (MOS, latencia o throughput) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo ocupa aproximadamente 18 MB con el generador de onda incluido.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente. En caso de usar GPU, cualquier tarjeta con soporte PyTorch o ONNX Runtime sirve.
- Cabe en cualquier GPU de consumo, e incluso en entornos sin GPU (CPU, navegador, dispositivos embebidos).
- Opciones de despliegue: PyTorch (checkpoint `tiny-voca-fr.pt`), ONNX Runtime (modelo `onnx/model.onnx`) y ejecucion en navegador mediante ONNX. El codigo de inferencia se distribuye en el repositorio de GitHub del autor.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Voces | Licencia | Formatos |
|---|---|---|---|---|---|
| tiny-voca-fr | 4,5 M | frances | 2 fijas | Apache-2.0 | PyTorch, ONNX |
| tiny-voca (n4ze3m) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Qwen3-TTS 1.7B Base (docente) | 1.700 M | no disponible | diseno de voces | Apache-2.0 | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada. La comparativa se limita a tamano, licencia y disponibilidad de formatos.

## Limitaciones y advertencias

- La voz masculina (FR_M1) presenta un zumbido mecanico tenue de fondo en la mayoria de las frases; es inteligible pero menos natural que la femenina.
- eSpeak NG omite algunos enlaces foneticos (por ejemplo, *comment‿allez*), introduce otros falsos y pronuncia *fils* (hijo) como [fil].
- Solo hay dos voces fijas; no hay clonacion de voz ni seleccion de hablantes adicionales.
- El modelo depende del front-end de eSpeak NG para convertir texto a fonemas, por lo que los errores de ese componente se propagan a la sintesis.
- El entrenamiento es completamente sintetico, con 14,1 horas generadas por un modelo docente; puede heredar sesgos o artefactos del docente y de las frases de Common Voice.
- Cobertura limitada al frances parisino; no se documenta soporte de otras variantes regionales ni de otros idiomas.
- Riesgo de alucinacion acustica o pronunciacion incorrecta en palabras fuera del vocabulario o en dominios no cubiertos por las plantillas de entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las licencias del front-end de eSpeak NG y de los datos de Common Voice en cada despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DanielSuncost/tiny-voca-fr
- Modelo base tiny-voca: https://huggingface.co/n4ze3m/tiny-voca
- Codigo del modelo: https://github.com/DanielSuncost/tiny-voca-fr
- Demo: https://www.suncostlabs.com/tinyvocafr

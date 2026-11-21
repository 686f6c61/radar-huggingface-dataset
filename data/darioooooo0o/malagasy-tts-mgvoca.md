# darioooooo0o/malagasy-tts-mgvoca

## Resumen

mg-voca es un modelo de síntesis de voz (text-to-speech) para malgache desarrollado por el usuario darioooooo0o. Se trata de un modelo muy compacto, de aproximadamente 4,5 millones de parámetros y 21 MB en formato ONNX, basado en la arquitectura tiny-voca (Apache-2.0). Convierte texto malgache en audio a 24 kHz con dos voces disponibles, una femenina y otra masculina, y está pensado para ejecutarse en CPU, teléfonos o pestañas de navegador sin necesidad de GPU.

El modelo se plantea como la mitad "hablante" de un par junto con el modelo de reconocimiento de voz darioooooo0o/malagasy-stt-300m, de modo que una aplicación pueda escuchar un comando hablado y responder en voz alta de forma totalmente offline. Su relevancia radica en cubrir una lengua de bajos recursos como el malgache con un modelo lo bastante pequeño para desplegarse en dispositivos de gama baja, algo poco habitual en el ecosistema TTS.

La versión publicada es un primer lanzamiento con limitaciones explícitas: no ha sido revisada por hablantes nativos de malgache, la evaluación de naturalidad se basa en un único evaluador y el modelo está orientado a frases cortas y comandos. La licencia de los pesos es Apache-2.0, aunque el audio de entrenamiento procede del dataset Afrivoice Malagasy (CC-BY-4.0).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | tiny-voca: encoder transformer, predictor de duración, transformers de frames y generador de forma de onda source-filter (sin vocoder separado) |
| Parámetros totales | ~4,5 millones |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa una frase de hasta ~500 letras por llamada) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | malgache (mg) |
| Licencia | Apache-2.0 (pesos y código); audio de entrenamiento CC-BY-4.0 |
| Formato de pesos | ONNX (`onnx/mgvoca.onnx`, 21 MB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura tiny-voca, que combina un encoder transformer, un predictor de duración, transformers de frames y un generador de forma de onda source-filter que sintetiza el audio directamente sin un vocoder separado. La entrada son letras (no fonemas) con una marca de acentuación por letra; las entradas ONNX son `tokens`, `stress`, `voice` (0 = femenina, 1 = masculina), `speed`, `pitch_shift` y `pitch_range`, y las salidas son `audio` y `durations`. El fichero `onnx/mgvoca.json` contiene la tabla de símbolos y la huella del front-end, y el script de ejemplo rechaza un front-end que no coincida.

El entrenamiento usó clips normalizados en sonoridad. Los clips transcritos emplearon el texto humano; los no transcritos se etiquetaron con el modelo STT malgache y se filtraron por confianza, y las letras se alinearon con el CTC de caracteres del STT. Las dos voces provienen de voluntarios reales del dataset Afrivoice Malagasy: el hablante `IXtzHfrU` (femenina, voz F, unas 15 h tras filtrado de calidad) y el hablante `bReJIOgP` (masculina, voz M, unas 14 h). El ajuste fino para una voz propia requiere aproximadamente una hora de GPU.

## Capacidades

- Síntesis de voz a partir de texto malgache, con salida a 24 kHz.
- Dos voces seleccionables: femenina (F) y masculina (M).
- Control de velocidad (`speed`), desplazamiento de tono (`pitch_shift`) y rango de tono (`pitch_range`).
- Front-end de texto en Python sin dependencias (`mg_text.py`) que normaliza números, fechas, horas, cantidades en ariary, números de teléfono, abreviaturas y acentuación; también disponible en Kotlin y Swift en el SDK de la app.
- Procesa una frase de hasta aproximadamente 500 letras por llamada; el texto más largo debe dividirse por puntos.
- Ejecución en CPU mediante ONNX Runtime, sin PyTorch.
- Integración con el modelo STT malgache para flujos de escucha y respuesta hablada offline.

## Casos de uso

- Asistentes de voz offline en Android: el modelo se integra en la app de ejemplo del repositorio STT colocando `mgvoca.onnx` en los assets y permite responder en voz alta a comandos reconocidos, sin conexión.
- Lectura de texto en pantalla para accesibilidad: con 21 MB y ejecución en CPU, puede incorporarse en aplicaciones móviles para leer contenido en malgache a usuarios con discapacidad visual.
- Anuncios y avisos en kioscos o terminales: frases cortas y comandos son el objetivo del modelo, y su latencia mediana de 146 ms por frase en 2 hilos de CPU lo hace adecuado para respuestas casi instantáneas.
- Sistemas de información telefónica o de atención básica: la normalización de números, fechas y cantidades en ariary del front-end permite leer datos estructurados en voz alta.
- Prototipado de interfaces conversacionales en malgache: al ser un modelo pequeño y de licencia permisiva, sirve para validar productos de voz antes de invertir en un modelo mayor o en una voz propia.
- Educación y aprendizaje de la lengua: la síntesis con dos voces y control de velocidad puede emplearse en materiales de lectura guiada o ejercicios de pronunciación.
- Navegador: el tamaño reducido permite cargar el modelo en una pestaña y generar voz en cliente sin servidor.

## Benchmarks y rendimiento

| Métrica | Resultado | Condiciones |
|---|---|---|
| Error de caracteres con reconocedor independiente | 6,1 % (voz femenina) / 7,8 % (voz masculina) | 28 frases reservadas por voz, con números, fechas y cantidades en ariary |
| Error de caracteres de grabaciones reales (referencia) | 7,9 % / 10,7 % | mismas condiciones |
| Naturalidad (escucha a ciegas) | 3,5 sobre 5 (10 clips) | un único evaluador; grabaciones reales: 4,83 (6 clips) |
| Latencia mediana por frase | 146 ms (percentil 95: 247 ms) | ONNX Runtime, 2 hilos de CPU, ~105 veces más rápido que tiempo real |
| Coincidencia ONNX frente a PyTorch | sí, dentro del ruido de coma flotante | mismas frases en ambos |

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse sin GPU; la medición de latencia se hizo con ONNX Runtime en 2 hilos de CPU.
- VRAM estimada: no aplica para el despliegue previsto en CPU; no se documentan requisitos de GPU para inferencia.
- GPU recomendadas: no disponibles para inferencia; para ajuste fino de una voz propia se indica aproximadamente una hora de GPU, sin especificar modelo.
- Cabe en cualquier dispositivo con espacio para un fichero de 21 MB, incluidos teléfonos y navegadores.
- Opciones de despliegue: ONNX Runtime con Python (`onnxruntime`, `numpy`, `soundfile`, `huggingface_hub`); SDK con front-end en Kotlin y Swift para Android.
- Throughput: aproximadamente 105 veces más rápido que tiempo real en las condiciones medidas (2 hilos de CPU).

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de TTS para malgache o de tamaño similar. La comparación cuantitativa con alternativas no está disponible.

## Limitaciones y advertencias

- Ningún hablante nativo de malgache ha revisado la pronunciación, las frases de la app de demostración ni los préstamos lingüísticos; palabras francesas como *crédit* y *paramètres* se reescriben por regla (*kredy*, *paramètra*) y pueden no sonar como el original.
- La puntuación de naturalidad (3,5 sobre 5) proviene de un único evaluador y no debe citarse como medida de calidad.
- La acentuación sigue una regla general (penúltima sílaba, con excepciones ante *-ka*, *-tra*, *-na*); palabras irregulares como *tanàna* frente a *tanana* solo se pronuncian bien si se escribe el acento grave.
- El modelo está orientado a frases cortas y comandos; el texto largo se lee frase a frase y puede sonar plano.
- Algunos nombres propios (por ejemplo *Vavony*) se han leído incorrectamente en alguna ocasión.
- Las voces son de voluntarios reales que no firmaron una cesión para una voz de producto; para una voz propia se recomienda grabar un hablante con cesión firmada y ajustar el modelo.
- El audio de entrenamiento es CC-BY-4.0 y exige atribución (ver `NOTICE.md`); los pesos y el código son Apache-2.0.
- No se documentan sesgos específicos más allá de los derivados de los datos de Afrivoice y de las limitaciones de pronunciación señaladas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darioooooo0o/malagasy-tts-mgvoca
- Modelo STT complementario: https://huggingface.co/darioooooo0o/malagasy-stt-300m
- Dataset Afrivoice Malagasy (Digital Umuganda): no disponible (enlace no incluido en la información proporcionada)
- Arquitectura tiny-voca: no disponible (enlace no incluido en la información proporcionada)

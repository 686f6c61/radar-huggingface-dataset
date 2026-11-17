# ctrltokyo/eeh-1

## Resumen

eeh-1 es un modelo de síntesis de voz (text-to-speech) para japonés desarrollado por el usuario ctrltokyo y publicado bajo licencia Apache-2.0. Se trata de un modelo extremadamente compacto, con 4.534.219 parámetros en total (incluyendo el generador de forma de onda), que convierte texto japonés escrito con kanji, kana y números en audio mono a 24 kHz. Su rasgo distintivo es que no emplea un vocoder neuronal: un transformer lee los fonemas y tonos de acento de OpenJTalk, predice la duración de cada fonema y, a continuación, estima el tono, el volumen y los parámetros de un pequeño sintetizador de fuente-filtro que genera la onda a partir de un tren de pulsos y ruido.

El modelo ha sido entrenado desde cero sobre 18,6 horas de voz procedentes de Irodori-TTS v4.1 Small Yomi y ofrece dos voces, F1 (femenina, veinteañera, tono calmado) y M1 (masculina, treintañero, tono cálido), ambas con acento de Tokio. Su motor está escrito en Rust y se distribuye como paquete Python, programa de línea de comandos, biblioteca C y demo compilada a WebAssembly, lo que permite ejecutarlo íntegramente en el navegador sin enviar datos a ningún servidor.

Su relevancia actual reside en la eficiencia: alcanza 120 veces el tiempo real en un solo hilo de CPU y 280 veces en cuatro hilos (Apple M4 Max), con una latencia de primer sonido de 9 ms de mediana en CPU y de 30-50 ms en navegador. Es, por tanto, una alternativa ligera y de bajo coste para síntesis de voz japonesa en entornos con recursos limitados o en el propio cliente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con front end de fonemas y sintetizador de fuente-filtro (sin vocoder neuronal) |
| Parametros totales | 4.534.219 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa una frase por llamada, dividiendo el texto en 。！？) |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | japonés (ja), acento de Tokio |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float32, 18,2 MB) |

## Arquitectura y entrenamiento

La arquitectura combina un front end de texto en Rust que imita el comportamiento de OpenJTalk con el diccionario NAIST (validado como idéntico en más de 500.000 textos de prueba) y un transformer que recibe los fonemas junto con sus tonos de acento. El transformer predice la duración de cada fonema y, después, el tono, la intensidad y los ajustes de un sintetizador de fuente-filtro que construye la forma de onda a partir de un tren de pulsos y ruido. Al prescindir de vocoder neuronal, el modelo reduce drásticamente el número de parámetros y el coste computacional.

El entrenamiento se realizó desde cero sobre 18,6 horas de habla de Irodori-TTS v4.1 Small Yomi. El modelo no incorpora pesos preentrenados de terceros. El autor publica un informe de evaluación (`eval/report.json`) y el registro de entrenamiento (`eval/metrics.jsonl`) junto con los pesos. No se documentan en la información disponible detalles sobre el uso de RLHF, DPO ni sobre la composición exacta del dataset más allá de las horas y la fuente citadas.

## Capacidades

- Síntesis de voz japonesa a partir de texto con kanji, kana y números, con lectura correcta de acentos de tono de Tokio.
- Dos voces seleccionables: F1 y M1.
- Control de velocidad (`speed`), desplazamiento de tono (`pitch_shift`, 0,058 equivale aproximadamente a un semitono), rango de tono (`pitch_range`) y semilla (`seed`).
- Síntesis por frases con `speak_each`, que entrega cada oración en cuanto se genera, permitiendo streaming.
- Procesamiento de texto de cualquier longitud: se divide en frases por 。！？, se respetan las citas seguidas de と o って y se recorta tras 、 cuando una frase excede una llamada.
- Ejecución en CPU, en línea de comandos, como biblioteca C (con FFI para Go, Node, Java, Ruby y Swift) y en navegador mediante WebAssembly.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio de entrada ni modo de razonamiento; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura por voz de artículos y blogs en japonés: el modelo acepta texto de cualquier longitud y lo divide en frases, entregando audio en streaming con `speak_each`, lo que encaja en lectores web o extensiones de navegador.
- Asistentes de voz en el navegador: la demo WebAssembly descarga unos 26 MB (comprimidos) la primera vez y funciona después sin conexión, con latencia de primer sonido de 30-50 ms, adecuada para interfaces conversacionales en cliente.
- Sistemas de megafonía y anuncios en comercios o transporte: la velocidad de 120x en un solo hilo de CPU permite generar avisos pregrabados o dinámicos en hardware modesto, sin GPU.
- Accesibilidad para personas con discapacidad visual: la síntesis local y sin dependencia de servicios externos permite integrar lectura de pantalla en aplicaciones de escritorio mediante la biblioteca C o el paquete Python.
- Prototipado y pruebas de UX de voz: el control de velocidad, tono y semilla facilita generar variantes de audio para pruebas A/B de interfaces habladas sin coste de API.
- Integración en aplicaciones móviles o embebidas: el binario y los pesos (18,2 MB) más el diccionario (36 MB) caben en dispositivos con recursos limitados, y la API C permite enlazarlo desde Go, Node, Java, Ruby o Swift.
- Dooblaje de contenido breve o audiolibros de dominio público: las dos voces y el control de tono permiten alternar narradores en textos largos procesados por frases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento publicados son de velocidad de inferencia:

| Metrica | Valor |
|---|---|
| Velocidad en 1 hilo de CPU | 120x tiempo real |
| Velocidad en 4 hilos (Apple M4 Max) | 280x tiempo real |
| Velocidad en navegador | aproximadamente 50x tiempo real |
| Latencia de primer sonido en CPU | 9 ms (mediana) |
| Latencia de primer sonido en navegador | 30-50 ms |
| Tamano de descarga inicial en navegador | aproximadamente 26 MB (gzip): 17 MB pesos, 9 MB diccionario, 0,4 MB programa |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecutarse en CPU. Los pesos ocupan 18,2 MB en float32 y el diccionario 36 MB.
- GPU recomendadas: no disponible; no se documenta soporte de GPU.
- Cabe en cualquier CPU de consumo: el autor cita un Apple M4 Max para las cifras de 280x con cuatro hilos, y el modelo funciona en un solo hilo.
- Opciones de despliegue: paquete Python (`pip install` del wheel correspondiente), programa de línea de comandos (`bin/<platform>/eeh`), biblioteca C (`lib/<platform>/libeeh_ffi` con `include/eeh.h`), demo WebAssembly servida con `python -m http.server`, y FFI desde Go, Node, Java, Ruby y Swift.
- Latencia y throughput: 120x tiempo real en un hilo de CPU, 280x en cuatro hilos, aproximadamente 50x en navegador; primer sonido a 9 ms (mediana) en CPU y 30-50 ms en navegador.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que el modelo usa su propio motor en Rust.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo de referencia cualitativa, eeh-1 se distingue por su tamaño (4,5 millones de parámetros), la ausencia de vocoder neuronal, la licencia Apache-2.0 y la ejecución en CPU y navegador; los sistemas TTS neuronales habituales de la misma categoría suelen requerir GPU o dependencias de red, pero no se aportan cifras verificables en esta ficha.

## Limitaciones y advertencias

- Solo soporta japonés; no hay capacidades multilingües documentadas.
- Está entrenado sobre 18,6 horas de voz, un volumen reducido que puede limitar la naturalidad y cobertura prosódica frente a modelos entrenados con miles de horas.
- Solo ofrece dos voces (F1 y M1); no se documenta clonación de voz ni control de estilo.
- Riesgo de errores de lectura en kanji ambiguos, números o nombres propios no cubiertos por el diccionario NAIST, pese a la validación del front end frente a OpenJTalk.
- No se documentan sesgos específicos; al ser un modelo de voz, puede reproducir sesgos prosódicos o de género asociados a las dos voces entrenadas.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones de la fuente de entrenamiento (Irodori-TTS v4.1 Small Yomi) antes de un despliegue en producción.
- El repositorio no conserva el bit ejecutable de los binarios, por lo que hay que aplicar `chmod +x` antes de usarlos.
- No se documenta soporte de GPU ni integración con frameworks de inferencia estándar, lo que limita su uso en pipelines que dependan de vLLM, TGI u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ctrltokyo/eeh-1
- Fuente de los datos de entrenamiento: https://huggingface.co/takuma104/Irodori-TTS-v4.1-Small-Yomi
- Demo en navegador: incluida en el repositorio, servida con `python -m http.server --directory demo 8000` y accesible en `http://localhost:8000`
- Informe de evaluación y registro de entrenamiento: `eval/report.json` y `eval/metrics.jsonl` dentro del repositorio del modelo

# n4ze3m/tiny-voca

## Resumen

tiny-voca es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por n4ze3m. Se trata de un sistema extremadamente compacto: 4.537.291 parámetros en total, incluyendo el generador de forma de onda, entrenado desde cero sobre aproximadamente 18 horas de voz sintética. Su rasgo más distintivo es que no emplea un vocoder neuronal, sino un sintetizador fuente-filtro clásico cuyos parámetros predice la red, lo que explica su reducidísimo tamaño.

El modelo ofrece dos voces en inglés americano, F2 (femenina) y M2 (masculina), y produce audio mono a 24 kHz. Está pensado para ejecutarse en entornos con recursos muy limitados: según el autor, corre unas 70 veces más rápido que el tiempo real usando cuatro hilos de CPU, y el export ONNX funciona también en onnxruntime-web (WebAssembly), es decir, en un navegador o un teléfono.

La relevancia de tiny-voca no reside en la calidad de síntesis frente a modelos grandes, sino en su huella: 18,2 MB en float32 PyTorch y 21,4 MB en ONNX. Esto lo sitúa en una categoría aparte para despliegues embebidos, aplicaciones web sin backend de GPU y prototipado rápido de interfaces de voz. La licencia Apache-2.0 facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (4 bloques) + predictor de duración + dos transformers a nivel de frame (2 y 5 bloques) + sintetizador fuente-filtro |
| Parametros totales | 4.537.291 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens fonémicos por llamada, máximo 32 segundos de audio |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; export ONNX en float32, opset 17) |
| Idiomas soportados | inglés (inglés americano) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`tiny-voca.pt`, float32) y ONNX (`onnx/model.onnx`, float32) |

## Arquitectura y entrenamiento

El pipeline es el siguiente: el texto se convierte a fonemas con valores de estrés mediante el fonemizador `dizione`, del mismo autor. Un encoder transformer de 4 bloques lee la secuencia de fonemas; un predictor de duración asigna a cada fonema una longitud en frames; y dos transformers a nivel de frame (2 y 5 bloques) predicen tono, sonoridad y energía, y después los parámetros del generador de onda. Todos los bloques usan 192 canales, 4 cabezas de atención y rotary position embeddings.

La generación de audio no usa vocoder neuronal: un tren de pulsos de banda limitada a la frecuencia fundamental predicha y una señal de ruido se moldean cada uno con un filtro variable en el tiempo, cuyo cepstrum predice la red una vez por frame (256 muestras, 10,7 ms). Este componente tiene solo 25.862 parámetros. El desglose publicado es: embeddings (fonema, estrés, voz) 16.704; encoder de texto 1.588.864; el resto corresponde al predictor de duración y pausas y a los módulos de frame y generador. El entrenamiento se hizo desde cero (sin pesos preentrenados) sobre unas 18 horas de voz sintética; no se detalla la composición del dataset ni si hubo ajuste por RLHF o DPO.

## Capacidades

- Síntesis de voz en inglés americano con dos voces: F2 (femenina) y M2 (masculina).
- Control de velocidad de habla mediante el parámetro `speed` (1.0 es la velocidad predicha).
- Control de tono mediante `pitch_shift` (sumado al log F0; 0,058 equivale aproximadamente a un semitono) y `pitch_range` (escala el movimiento de tono alrededor de la media).
- Manejo de estrés léxico: la entrada incluye valores de estrés por fonema (0 ninguno, 1 primario, 2 secundario).
- Salida de duraciones por token en frames de 256 muestras, útil para alineación y sincronización.
- Ejecución en CPU y en navegador vía ONNX Runtime Web (WebAssembly).
- No dispone de tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento: es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de notificaciones y accesibilidad en aplicaciones móviles: con 4,5 M de parámetros y ejecución a ~70x tiempo real en cuatro hilos de CPU, puede sintetizar avisos en el propio dispositivo sin conexión ni backend, lo que es adecuado para lectores de pantalla y apps de accesibilidad.
- Síntesis de voz en el navegador: el export ONNX funciona en onnxruntime-web, de modo que una web puede generar audio localmente sin enviar texto a un servidor, con la consiguiente ventaja de privacidad.
- Prototipado de interfaces conversacionales: para pruebas de UX de asistentes de voz donde la latencia y el coste importan más que la naturalidad, el modelo permite iterar rápido con dos voces y control de velocidad y tono.
- Sistemas embebidos y dispositivos IoT: el tamaño de 18-21 MB permite incluirlo en firmware o en dispositivos con RAM limitada para avisos hablados, siempre que el texto se divida en frases de hasta 32 segundos.
- Generación de audiolibros o contenido de prueba a gran escala: al correr muy por encima del tiempo real en CPU, se pueden sintetizar lotes grandes de texto sin GPU, útil para datos de prueba o demos.
- Doctores de voz para pipelines de datos sintéticos: dado que se entrenó con voz sintética, puede emplearse como generador rápido de muestras de audio para experimentos de ASR o de aumento de datos, con la advertencia de que la calidad no es la de un TTS grande.
- Integración en herramientas de línea de comandos: la CLI `python -m tiny_voca.infer` permite incorporar la síntesis en scripts de automatización (por ejemplo, convertir informes en audio) con opciones de voz, velocidad y tono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento proporcionado por el autor es que el modelo corre aproximadamente 70 veces más rápido que el tiempo real en cuatro hilos de CPU. Tampoco se ofrece ninguna métrica de calidad (MOS, WER de ASR sobre la salida, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la práctica; el modelo está pensado para CPU. En GPU, los pesos float32 ocupan unos 18 MB, por lo que cualquier GPU con más de 1 GB de memoria es suficiente.
- GPU recomendadas: no se especifican; cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo, pero es sobredimensionada para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual, y también en CPU de teléfono y navegador.
- Opciones de despliegue: PyTorch (script `tiny_voca.infer`), ONNX Runtime (Python) y ONNX Runtime Web (WebAssembly). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS de este tipo.
- Latencia y throughput: ~70x tiempo real en cuatro hilos de CPU según el autor; no se publican cifras de latencia por utterance ni de throughput en GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas en la información proporcionada. Como referencia cualitativa, los TTS neuronales habituales (por ejemplo, familias basadas en VITS o difusión) manejan decenas o cientos de millones de parámetros y requieren GPU para baja latencia, mientras que tiny-voca apuesta por 4,5 M de parámetros y un sintetizador fuente-filtro para ejecución en CPU. No se dispone de cifras de calidad comparables, por lo que la comparación cuantitativa se marca como no disponible.

## Limitaciones y advertencias

- Solo inglés americano: no soporta castellano ni otros idiomas.
- Solo dos voces (F2 y M2); no hay clonación de voz ni control de identidad más allá de elegir una de las dos.
- Límite de 512 tokens fonémicos y 32 segundos por llamada; el texto más largo debe dividirse en frases, lo que puede introducir discontinuidades en la prosodia.
- Entrenado sobre unas 18 horas de voz sintética, lo que puede limitar la naturalidad y la cobertura prosódica frente a modelos entrenados con miles de horas de voz humana.
- No se detalla la composición del dataset ni si hubo ajuste con preferencias humanas; el riesgo de artefactos en pronunciaciones poco frecuentes (nombres propios, siglas, números) no está evaluado.
- El ruido del sintetizador fuente-filtro se genera de forma aleatoria en cada ejecución, por lo que la salida no es completamente determinista entre runtimes.
- No hay datos publicados de sesgos, alucinación (en TTS, mala pronunciación o entonación errónea) ni evaluaciones de calidad.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene revisar las licencias de las dependencias (`dizione`) y del dataset asociado antes de un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/n4ze3m/tiny-voca
- Repositorio de código: https://github.com/n4ze3m/tiny-voca
- Fonemizador dizione: https://github.com/n4ze3m/dizione
- Dataset: https://huggingface.co/datasets/n4ze3m/tiny-voca

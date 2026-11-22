# loom-ai-org/dac-44khz-loom

## Resumen

`loom-ai-org/dac-44khz-loom` es una exportación al formato GGUF del decodificador del Descript Audio Codec (DAC) a 44,1 kHz, empaquetada para el motor de inferencia loom.cpp. No es un modelo generativo de lenguaje ni un modelo de texto-a-audio en el sentido habitual: es la mitad de decodificación de un códec neuronal de audio, es decir, el componente que convierte tokens discretos de audio en una forma de onda PCM. Los pesos son idénticos a los del checkpoint original `descript/dac_44khz`; lo que cambia es el contenedor, que pasa a ser un GGUF autodescriptivo con las topologías de grafo, el tokenizador (inexistente en este caso) y el script de control embebidos.

El interés práctico del artefacto es de infraestructura: permite ejecutar la decodificación de DAC dentro del ecosistema loom.cpp/loom-py sin depender de PyTorch ni del repositorio original de Descript, y expone la geometría del códec (número de codebooks, tamaño de codebook, tasa de frames) como hiperparámetros consultables directamente desde el fichero en lugar de tener que consultarlos en un paper o en el código fuente. Con 54.259.393 parámetros y un repositorio de 0,7 GB, es un componente ligero pensado para integrarse como etapa final de pipelines de generación de audio, no como modelo autónomo.

Es relevante ahora porque los códecs neuronales se han convertido en la representación intermedia estándar de los modelos de audio generativo (texto-a-audio, conversión de voz, música), y disponer de un decodificador portable, con licencia MIT y ejecutable fuera del stack de PyTorch, simplifica el despliegue en producción. La contrapartida es que se distribuye únicamente la mitad de decodificación: la codificación (audio a códigos) debe hacerse con el checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Códec neuronal de audio (DAC, Descript Audio Codec); este repositorio contiene solo el decodificador, exportado como grafo GGUF para loom.cpp |
| Parametros totales | 54.259.393 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: procesa frames de códigos; 9 flujos por frame a 86,13 frames por segundo, 512 muestras por frame) |
| Tipos de cuantizacion | no disponible (el repositorio publica un único GGUF; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (es un códec, no un modelo de lenguaje: no tiene vocabulario ni idioma) |
| Licencia | MIT |
| Formato de pesos | GGUF (`dac-44khz.gguf`), generado con loom-exporter |
| Modelo base | descript/dac_44khz |
| Frecuencia de muestreo | 44,1 kHz |
| Codebooks por frame | 9 |
| Tasa de frames | 86,13 frames por segundo |
| Muestras por frame | 512 |
| Librería de inferencia | loom-py-rt (PyPI), motor loom.cpp |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El modelo subyacente es DAC (Descript Audio Codec), un códec neuronal que aprende una representación discreta residual del audio mediante cuantización vectorial residual sobre múltiples codebooks. En esta configuración a 44,1 kHz, cada frame de audio se representa con 9 flujos de códigos (uno por codebook) y se emiten 86,13 frames por segundo; cada frame decodificado produce 512 muestras de audio. El decodificador reconstruye la forma de onda a partir de esos códigos, presumiblemente mediante un decodificador convolucional con capas de upsampling, aunque la información disponible no detalla la topología interna concreta de las capas.

No se dispone de datos sobre el conjunto de entrenamiento original (número de tokens de audio, composición del dataset, horas de audio, procesos de RLHF o ajuste fino), ya que esta información pertenece a la model card de `descript/dac_44khz` y no se incluye en la información proporcionada. La innovación técnica relevante de esta exportación no está en el entrenamiento sino en el empaquetado: un único GGUF autodescriptivo que declara sus propias topologías de grafo, su contrato de entrada/salida y un script de control que documenta todos los argumentos aceptados. La API expone `codes2speech.infer()` para decodificación por lotes y `codes2speech.stream()` para decodificación incremental, con la garantía de que la concatenación de los fragmentos emitidos por streaming equivale al resultado de una única llamada sobre todos los frames.

## Capacidades

- Decodificación de códigos DAC a forma de onda PCM a 44,1 kHz: entrada de códigos discretos organizados en frames, salida de audio muestreado.
- Entrada de códigos en formato frame-major (todos los codebooks del frame 0, después el frame 1, etc.) o como lista plana; las listas que no representan un número entero de frames se rechazan en lugar de reinterpretarse con otro ancho.
- Decodificación en streaming: `codes2speech.stream()` permite empujar códigos a medida que llegan y recibir fragmentos de audio, con equivalencia garantizada respecto a la decodificación completa.
- Introspección de la geometría del códec desde el propio fichero: `codec.n_codebooks`, `codec.codebook_size`, `codec.frame_rate` y `contract["sample_rate"]` como hiperparámetros consultables.
- Acceso al driver embebido mediante `model.driver_source` y a la inferencia de bajo nivel mediante `model.infer(...)`, que pasa los argumentos directamente al script de control.
- No soporta tool calling, function calling, razonamiento multi-step, generación de texto, visión ni audio de entrada: es exclusivamente un decodificador de códigos a audio.
- No tiene capacidades multilingües porque no procesa lenguaje.

## Casos de uso

- Etapa final de pipelines de texto-a-audio: un modelo autorregresivo o de difusión genera códigos DAC y este decodificador los convierte en waveform; su naturaleza ligera (54 M de parámetros) permite ejecutarlo en la misma máquina que el modelo generador sin añadir una dependencia pesada de PyTorch.
- Servicios de conversión de voz (voice conversion) y clonación: el codificador del checkpoint original extrae códigos de una voz de referencia, se manipulan o re-sintetizan y se decodifican aquí para obtener el audio final a 44,1 kHz.
- Generación musical y de efectos de sonido: modelos de música que emiten tokens de códec pueden usar este decodificador para materializar la señal; la tasa de 86,13 frames por segundo y 512 muestras por frame da una granularidad temporal adecuada para audio musical.
- Decodificación en streaming de baja latencia: la API `stream()` permite emitir audio mientras llegan los códigos, adecuada para asistentes de voz o síntesis interactiva donde no se quiere esperar a la secuencia completa.
- Despliegue en entornos sin PyTorch: al ser un GGUF ejecutable con loom.cpp y el paquete `loom-py-rt`, encaja en contenedores mínimos, entornos embebidos o servicios en C++ donde instalar el stack de PyTorch es inviable.
- Investigación en representaciones discretas de audio: la exposición de la geometría del códec como hiperparámetros facilita experimentar con distintos modelos generadores de códigos sin recompilar ni releer el código del códec.
- Reconstrucción de audio en pipelines de compresión: DAC es un códec con pérdida; puede usarse para almacenar o transmitir audio como códigos discretos y reconstruirlo en el extremo receptor con este decodificador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 54,3 M de parámetros, los pesos en FP32 ocupan aproximadamente 217 MB y en FP16 unos 108 MB; el repositorio GGUF completo es de 0,7 GB, por lo que el pico de memoria debe presupuestarse en torno a 1 GB o menos incluyendo buffers de activación.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso una GTX 1650 son sobradas para este componente.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos años, e incluso en CPU para decodificación no interactiva.
- Opciones de despliegue: el motor loom.cpp a través del paquete `loom-py-rt` (PyPI, extra `[hub]`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia estructural, cada segundo de audio requiere 86,13 frames de 9 códigos, pero no se publican cifras de latencia por frame ni de factor de tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Frecuencia | Codebooks | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| dac-44khz-loom (este) | 54,3 M (solo decodificador) | 44,1 kHz | 9 | MIT | GGUF (loom.cpp) | Exportación portable; sin codificador |
| descript/dac_44khz | no disponible en la información | 44,1 kHz | 9 | MIT (según el autor de la exportación) | PyTorch (checkpoint original) | Incluye codificador y decodificador |
| EnCodec (Meta) | no disponible en la información | 24 kHz / 48 kHz según variante | variable | no disponible en la información | PyTorch | Códec neuronal alternativo de referencia |
| SoundStream (Google) | no disponible en la información | 24 kHz | variable | no disponible en la información | no disponible | Códec neuronal con cuantización residual |

La comparación se limita a señalar la categoría; no se dispone de datos de rendimiento (PESQ, STOI, MUSHRA) para ninguno de los modelos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de calidad de reconstrucción.

## Limitaciones y advertencias

- Solo se distribuye la mitad de decodificación: `encode` (audio a códigos) no está incluido. Para obtener códigos hay que usar el checkpoint original `descript/dac_44khz` u otro modelo que los emita.
- Los códigos de un códec distinto, o de DAC a otra frecuencia de muestreo, son enteros en el rango válido y producen ruido en lugar de un error: no hay validación semántica de la procedencia de los códigos.
- No deshace patrones de retardo: los modelos autorregresivos que emiten estos códigos suelen desplazar el flujo k en k pasos; la realineación es responsabilidad del modelo emisor, y el decodificador espera códigos ya alineados.
- Al ser un códec con pérdida, la reconstrucción no es bit-exacta respecto al audio original; la fidelidad depende de la tasa de bits efectiva del códec.
- No se documentan sesgos, pero al ser un códec entrenado sobre audio, puede reproducir las características y sesgos acústicos del corpus de entrenamiento original (no detallado en la información disponible).
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de artefactos audibles ante códigos fuera de distribución.
- La licencia MIT se hereda del proyecto de exportación y de la declaración explícita del README; el repositorio original de Hugging Face no lleva etiqueta `license:`, por lo que conviene verificar los términos del checkpoint base antes de un uso comercial a gran escala.
- No hay información sobre cuantizaciones alternativas ni sobre el comportamiento del decodificador en precisión reducida (por ejemplo, GGUF de 4 bits).
- El ecosistema loom.cpp/loom-py es joven y con pocas descargas (57 en el momento de la consulta); la estabilidad de la API a largo plazo no está garantizada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-ai-org/dac-44khz-loom
- Modelo base: https://huggingface.co/descript/dac_44khz
- Motor loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Exportador loom-exporter: https://github.com/loom-ai-org/loom-exporter
- API de Python loom-py: https://github.com/loom-ai-org/loom-py

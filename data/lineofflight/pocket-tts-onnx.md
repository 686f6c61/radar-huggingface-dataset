# lineofflight/pocket-tts-onnx

## Resumen

lineofflight/pocket-tts-onnx es una exportación a ONNX Runtime de Pocket TTS, el modelo de síntesis de voz de Kyutai. El repositorio empaqueta tres bundles independientes de 6 capas cada uno (neerlandés, francés e inglés 2026-10), derivados de kyutai/pocket-tts-without-voice-cloning en la revisión `a7056f505a4a8ca72d8b5fb1440071d6f1a35739`, con los pesos verificados mediante sha256. No es un modelo nuevo: es una conversión de formato con cuantización dinámica int8 del transformer, pensada para ejecutar TTS en local sin PyTorch.

El objetivo declarado es servir como herramienta de voz para agentes de código, con ejecución en Linux y Windows a través del runtime `pocket_tts_onnx.py` de KevinAHM/pocket-tts-onnx, cuyo layout de ficheros replica. Cada bundle ocupa 173 MB y produce audio a 24 kHz mediante el decoder Mimi de Kyutai, con un paso de flow en la verificación publicada.

La relevancia práctica está en la huella: al ser ONNX int8 y no requerir GPU, permite integrar voz en entornos de escritorio, CI o dispositivos sin acelerador. Como contrapartida, el repositorio no incluye las voces (hay que descargarlas aparte del snapshot de Kyutai), no publica benchmarks y tiene cero descargas y cero likes en el momento de la ficha, por lo que carece de validación de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS con FlowLM (transformer de 6 capas) y decoder Mimi; exportada a ONNX. No es un LLM |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de síntesis de voz; no aplica ventana de contexto de LLM) |
| Tipos de cuantización | int8 dinámica (`quantize_dynamic` de onnxruntime sobre `MatMul`) en `flow_lm_main_int8.onnx`; float32 en `flow_lm_flow.onnx`, `mimi_decoder.onnx` y `text_conditioner.onnx` |
| Idiomas soportados | neerlandés (`nl`), francés (`fr`), inglés (`en`); un bundle por idioma |
| Licencia | CC BY 4.0 (heredada de Kyutai) |
| Formato de pesos | ONNX; tokenizador SentencePiece (`tokenizer.model`); latente inicial en NumPy float32 `[1, 1, 1024]`; voces en safetensors (no incluidas en el repo) |
| Frecuencia de muestreo de salida | 24 kHz (decoder Mimi) |
| Capas del transformer | 6 por bundle |
| Tamaño por bundle | 173 MB (tres bundles, repo de 0,5 GB) |
| Ficheros por bundle | 7: `bundle.json`, `tokenizer.model`, `bos_before_voice.npy`, `text_conditioner.onnx`, `flow_lm_main_int8.onnx`, `flow_lm_flow.onnx`, `mimi_decoder.onnx` |
| Runtime | onnxruntime (librería declarada); validado con onnxruntime 1.31.0 en la exportación |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Pocket TTS de Kyutai: un transformer FlowLM que convierte embeddings de texto en latentes y un decoder Mimi que reconstruye audio a 24 kHz. En esta exportación el transformer se divide en dos grafos ONNX: `flow_lm_main_int8.onnx`, con pesos cuantizados a int8, y `flow_lm_flow.onnx`, que ejecuta un paso de flow en float32. El estado interno de FlowLM y Mimi se describe en `bundle.json` junto con el sample rate y el tamaño de frame, de modo que el runtime puede gestionar el streaming sin depender del código original. Cada bundle tiene 6 capas, un tamaño notablemente reducido frente a los TTS basados en difusión de mayor profundidad.

Los pesos no se reentrenaron: proceden del repositorio de Kyutai y se descargaron con `curl`, comprobando el sha256 publicado (`59b5c324…` para neerlandés, `56366cfe…` para francés, `4c56cbd1…` para inglés 2026-10). La exportación la realiza lomotron/pocket-tts-onnx-export (MIT), commit `8f52199533098963fe1cbd90bed35bb20d871b5e`, con torch 2.9.1, onnx 1.23.2, onnxscript 0.7.2 y onnxruntime 1.31.0. Como control de calidad, el mismo exportador reconstruyó el bundle `english_2026-04` de KevinAHM y cuatro de sus ficheros salieron idénticos byte a byte; los otros tres solo difieren en la cadena de productor (`pytorch 2.9.1` frente a `2.11.0`), con los mismos nodos, pesos y salidas.

Dos detalles técnicos merecen atención. Primero, el bundle `english_2026-10` corresponde a la receta de entrenamiento `english_2026-09_2` reentrenada con una corrección del cargador para la última palabra desalineada, de forma que lee correctamente números al final de frase; en la revisión indicada es también el `languages/english` de Kyutai. Segundo, el exportador incluye una versión antigua de `pocket-tts` que usa GELU exacta, mientras que el paquete de Kyutai emplea la aproximación tanh desde la 3.1.0; la diferencia es de aproximadamente 1e-3 en la salida del transformer, relevante solo si se compara numerically contra la implementación de referencia.

## Capacidades

- Síntesis de voz (text-to-speech) en neerlandés, francés e inglés, con un bundle específico por idioma y tokenizador SentencePiece propio de cada uno.
- Generación de audio a 24 kHz mediante el decoder Mimi, con estado de streaming descrito en `bundle.json` (sample rate, frame size y layout de estado de FlowLM y Mimi).
- Ejecución en CPU sin PyTorch: los grafos ONNX se ejecutan con onnxruntime, lo que permite desplegar en Linux y Windows según el autor.
- Selección de voz mediante embeddings externos: cada voz es un fichero `languages/<bundle>/embeddings/<voice>.safetensors` del snapshot de Kyutai (por ejemplo, `daan`, `estelle`, `charles` en la verificación).
- Lectura de números al final de frase en el bundle inglés 2026-10, gracias a la corrección del cargador.
- Control de expresividad limitado a parámetros de muestreo: la verificación publicada usa temperatura 0.3 y 1 paso de flow.
- No incluye clonación de voz (los pesos provienen del repositorio `pocket-tts-without-voice-cloning`).
- No soporta tool calling, function calling, razonamiento multi-paso, visión ni audio de entrada: es exclusivamente un modelo de texto a voz.

## Casos de uso

- Voz para agentes de código: el caso de uso declarado por el autor. El agente puede leer en voz alta el resultado de una compilación, un diff o el estado de los tests mientras el desarrollador trabaja en otra ventana, con latencia de CPU y sin depender de un servicio en la nube.
- Narración de resultados de CI/CD: integrado en un pipeline, el bundle inglés puede anunciar mensajes como el verificado en la model card ("The suite now runs in 42 seconds, down from 3 minutes"), útil en entornos donde el desarrollador no está mirando la consola.
- Asistencia por voz en local y sin conexión: al ser ONNX int8 y ejecutarse con onnxruntime, encaja en estaciones de trabajo o dispositivos de borde donde no se permite enviar texto a una API externa por motivos de confidencialidad.
- Accesibilidad en herramientas internas: lectura de documentación, mensajes de error o registros para usuarios con discapacidad visual, con la ventaja de que el modelo cabe en 173 MB por idioma y no exige GPU.
- Prototipado multilingüe de productos de voz: un mismo runtime y un mismo layout de ficheros para neerlandés, francés e inglés permite validar una interfaz hablada en varios mercados cambiando únicamente el bundle y la voz.
- Avisos y announcements en aplicaciones de escritorio: notificaciones cortas, confirmaciones y mensajes de estado generados en tiempo de ejecución, donde la huella reducida importa más que la naturalidad máxima.
- Evaluación comparativa de calidad TTS: útil como línea base ligera (6 capas, int8) frente a modelos de difusión mayores, con la salvedad de que no hay métricas objetivas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente documenta una verificación cualitativa: síntesis a temperatura 0.3 con 1 paso de flow y transcripción posterior con el ASR Parakeet v3.

| Bundle | Voz | Texto sintetizado | Transcripción ASR |
|---|---|---|---|
| `dutch` | daan | Ik heb de bug gevonden en de tests slagen weer. | Ik heb de bug gevonden en de test slagen weer. |
| `french` | estelle | J'ai trouvé le bug et les tests passent à nouveau. | J'ai trouvé le bug et les tests passent à nouveau. |
| `english_2026-10` | charles | The suite now runs in 42 seconds, down from 3 minutes, and the last release went out on March 3, 2026. | The suite now runs in forty two seconds, down from three minutes, and the last release went out on march third, twenty twenty six. |

No hay datos de MOS, WER agregado, latencia ni throughput. La única cifra de fidelidad numérica publicada es la diferencia de ~1e-3 en la salida del transformer atribuida a la aproximación de GELU.

## Requisitos de hardware

- Disco: 173 MB por bundle; el repositorio completo ocupa 0,5 GB. Hay que sumar el fichero de voz en safetensors descargado aparte del snapshot de Kyutai.
- VRAM: no requiere GPU. El transformer está en int8 y el resto de grafos en float32; estimación razonable de unos pocos cientos de megabytes de memoria al cargar runtime, grafo Mimi y buffers de audio (estimación a partir del tamaño de los ficheros, no publicada por el autor).
- GPU recomendadas: no disponibles; no se han publicado mediciones en GPU. La ejecución de referencia es en CPU.
- GPU de consumo: no aplica como requisito; cualquier CPU x86-64 moderna debería poder ejecutar los grafos con onnxruntime. No hay datos publicados de rendimiento en Apple Silicon, ARM ni móvil.
- Opciones de despliegue: onnxruntime en Python, usando el script `pocket_tts_onnx.py` del repositorio KevinAHM/pocket-tts-onnx, que define el layout que estos bundles replican. El autor indica Linux y Windows. vLLM, llama.cpp, TGI y Ollama no aplican: son runtimes de LLM, no de TTS.
- Latencia y throughput: no disponibles. Solo se documenta la configuración de la prueba (temperatura 0.3, 1 paso de flow) y la frecuencia de salida de 24 kHz.
- Reproducibilidad: el autor publica los comandos completos de exportación (venv con torch 2.9.1, onnx, onnxruntime, onnxscript, sentencepiece, safetensors, entre otros), lo que permite regenerar los bundles en otra máquina.

## Comparativa con modelos similares

| Modelo | Formato | Idiomas | Capas | Voces incluidas | Licencia | Notas |
|---|---|---|---|---|---|---|
| lineofflight/pocket-tts-onnx (este) | ONNX int8 + float32 | nl, fr, en | 6 | No | CC BY 4.0 | Añade neerlandés, francés de 6 capas e inglés 2026-10; 173 MB por bundle |
| KevinAHM/pocket-tts-onnx | ONNX | no dispone de neerlandés, francés de 6 capas ni inglés 2026-10 según el autor | no disponible | No | no disponible en la información | Runtime de referencia (`pocket_tts_onnx.py`); su bundle `english_2026-04` se usó como control de exportación |
| kyutai/pocket-tts | safetensors (PyTorch) | no disponible | no disponible | Sí, como embeddings en el snapshot | CC BY 4.0 | Modelo original; requiere el paquete `pocket-tts` de Kyutai |
| kyutai/pocket-tts-without-voice-cloning | safetensors (PyTorch) | nl, fr, en (los bundles usados) | 6 | no disponible | CC BY 4.0 | Origen exacto de los pesos, revisión `a7056f50…` |

No se dispone de parámetros totales ni de métricas de calidad de ninguno de los comparables en la información proporcionada, por lo que la comparación se limita a formato, idiomas, licencia y empaquetado.

## Limitaciones y advertencias

- Las voces no están incluidas en el repositorio: hay que descargar `languages/<bundle>/embeddings/<voice>.safetensors` del snapshot de Kyutai. Sin ese fichero el bundle no es utilizable de extremo a extremo.
- La licencia CC BY 4.0 de Kyutai impone términos de uso prohibido explícitos: suplantación o clonación de voz sin consentimiento explícito y lícito, desinformación y llamadas fraudulentas, presentar contenido generado como grabación real, y generación de contenido ilícito, difamatorio o abusivo. Cualquier producto comercial debe cumplir estas condiciones además de la atribución.
- Solo tres idiomas (neerlandés, francés, inglés) y un bundle por idioma: no hay multilingüismo dentro de un mismo grafo ni cambio de idioma en tiempo de ejecución.
- Transformer de 6 capas y cuantización int8 dinámica: la calidad es esperablemente inferior a la de sistemas TTS de mayor tamaño. No hay MOS ni comparativas objetivas que lo cuantifiquen.
- Riesgo de error en palabras funcionales y morfología: la verificación publicada muestra que el ASR transcribió "de tests" como "de test" en neerlandés, aunque no se determina si el fallo es del TTS o del transcriptor.
- Expansión de números y fechas en inglés: la comprobación muestra "42 seconds" leído como "forty two seconds" y "March 3, 2026" como "march third, twenty twenty six". Es el comportamiento esperado en lectura de texto, pero rompe pipelines que esperen una lectura literal.
- El exportador usa GELU exacta frente a la aproximación tanh del paquete de Kyutai desde la 3.1.0: diferencia de ~1e-3 en la salida del transformer. No es un problema perceptible, pero invalida comparaciones bit a bit con la implementación de referencia.
- Sesgos: no se documenta ninguna evaluación de sesgos, acento, género o dialecto de las voces. Los bundles de 6 capas pueden degradar la naturalidad en registros distintos al de la verificación (frases cortas y técnicas).
- Madurez: 0 descargas, 0 likes, repositorio creado y actualizado el mismo día (2026-10-23). No hay evidencia de uso en producción ni de validación independiente.
- La información de la model card está parcialmente truncada en el apartado de licencia, por lo que conviene consultar el texto íntegro en el repositorio de Kyutai antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lineofflight/pocket-tts-onnx
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Origen de los pesos (revisión `a7056f505a4a8ca72d8b5fb1440071d6f1a35739`): https://huggingface.co/kyutai/pocket-tts-without-voice-cloning
- Runtime y layout de referencia: https://huggingface.co/KevinAHM/pocket-tts-onnx
- Exportador (MIT, commit `8f52199533098963fe1cbd90bed35bb20d871b5e`): https://github.com/lomotron/pocket-tts-onnx-export
- Listado de ficheros con sha256 y tamaños: `FILES.txt` dentro del repositorio del modelo
- Paper, blog o demo oficial: no disponible en la información proporcionada

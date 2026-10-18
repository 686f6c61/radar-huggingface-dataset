# Rose337/VRChatAdminToolsModels

## Resumen

Rose337/VRChatAdminToolsModels es un repositorio de artefactos ONNX publicado para dotar de entrada de voz en ruso a las herramientas de administración de VRChat. No contiene un modelo entrenado desde cero: aloja una exportación a ONNX fp16 de GigaAM-v3 en su variante `e2e_ctc`, el sistema de reconocimiento automático de voz del equipo GigaChat (SberDevices), publicado bajo licencia MIT. La conversión se realizó sin reentrenamiento, partiendo del export ONNX CTC propio del modelo (opset 17) y aplicando `onnxconverter-common` 1.16.0 para pasar a fp16.

El propósito es ejecutar el reconocimiento íntegramente en el equipo del jugador mediante ONNX Runtime Web, sin enviar audio a ningún servidor. El artefacto principal es `gigaam-v3-e2e-ctc/v3_e2e_ctc.fp16.onnx`, de 443.438.383 bytes (unos 443 MB), acompañado de un `vocab.json` de 1.852 bytes con las 256 piezas SentencePiece. El modelo consume características log-mel de 64 bandas a 16 kHz y devuelve log-probabilidades CTC sobre 257 clases, donde la clase 256 es el token en blanco.

Su relevancia es acotada y muy específica: no es un modelo de propósito general, sino un componente de inferencia local para una aplicación de escritorio/navegador concreta. La única validación publicada es una comprobación de equivalencia sobre 12 grabaciones de prueba, en las que la transcripción del ONNX fp16 coincide con la del modelo PyTorch original en todos los casos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Reconocimiento automático de voz con cabecera CTC; la arquitectura interna de la familia GigaAM no se detalla en la información disponible |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible (modelo ASR; la entrada es audio de longitud variable T) |
| Tipos de cuantización | fp16 (ONNX); no se publican otras variantes |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | ONNX fp16 (opset 17) más `vocab.json` |
| Pipeline | automatic-speech-recognition |
| Entrada | `features` float32 [1, 64, T] (log-mel) y `feature_lengths` int64 [1] |
| Salida | `log_probs` float32 [1, T', 257]; clase 256 = blank CTC |
| Preprocesado de audio | 16 kHz, n_fft 320, hop 160, ventana Hann, 64 mels HTK, log natural con recorte en 1e-9 |
| Vocabulario | SentencePiece, 256 piezas indexadas por id |
| Tamaño del repositorio | 0,4 GB |
| Modelo base | ai-sage/GigaAM-v3 (revisión `e2e_ctc`, commit `cec030b4c4f35d928e4a9044a3bdb29ebd499fac`) |

## Arquitectura y entrenamiento

El modelo es una exportación, no un entrenamiento nuevo. Se parte del export ONNX CTC oficial de GigaAM-v3 `e2e_ctc` (opset 17) y se convierte a fp16 con `onnxconverter-common` 1.16.0, manteniendo entradas y salidas en fp32 y retipando 33 nodos `Cast` a fp16 para que ONNX Runtime acepte el grafo. El resultado conserva la cabeza CTC del original: el modelo emite log-probabilidades por fotograma sobre 257 clases y la decodificación CTC colapsa repeticiones y elimina el blank (clase 256).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF/DPO u otras etapas de alineación; esos datos corresponden a la ficha de ai-sage/GigaAM-v3 y no se reproducen aquí. La única innovación técnica documentada en este repositorio es la conversión fp16 funcional sin pérdida de transcripción verificable, orientada a reducir el peso del grafo para su ejecución en el navegador.

## Capacidades

- Reconocimiento automático de voz en ruso a partir de audio muestreado a 16 kHz.
- Emisión de log-probabilidades CTC por fotograma, lo que permite decodificación greedy o con un decodificador externo (beam search, corrección con modelo de lenguaje) fuera del propio grafo.
- Ejecución local en el dispositivo del usuario mediante ONNX Runtime Web, sin llamadas a servidor.
- Gestión de audio de duración variable: la dimensión T de la entrada no está fijada en el grafo.
- Integración con el vocabulario SentencePiece de 256 piezas incluido en el repositorio.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, generación de texto libre, visión ni audio como salida: es exclusivamente un modelo ASR.
- No se documenta soporte multilingüe más allá del ruso.

## Casos de uso

- Entrada de voz en las herramientas de administración de VRChat: el modelo transcribe comandos o texto dictado en ruso directamente en el equipo del jugador, integrándose con ONNX Runtime Web y evitando enviar audio a un backend.
- Dictado en aplicaciones de escritorio o web: al aceptar entradas de longitud variable, puede transcribir desde fragmentos cortos de pocos segundos hasta intervenciones más largas, con el límite práctico que imponga la memoria del navegador.
- Transcripción con requisitos de privacidad: al ejecutarse en local, es adecuado para entornos donde el audio no puede salir del dispositivo (comunidades, soporte interno, grabaciones sensibles).
- Subtitulado o registro de voz en ruso en herramientas comunitarias: la salida CTC puede postprocesarse con un modelo de lenguaje propio para añadir puntuación y mayúsculas, ya que el grafo no las garantiza.
- Componente de pruebas comparativas: sirve para validar que una conversión fp16 reproduce el comportamiento del modelo PyTorch original antes de desplegar variantes propias.
- Prototipado de interfaces de voz en navegador: su tamaño de ~443 MB permite incluirlo en una PWA o aplicación Electron que descargue los pesos bajo demanda.
- Filtrado o moderación de audio en comunidades de VRChat: transcripción local de clips cortos para detección de contenido, siempre con revisión humana dado el riesgo de error del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato de validación aportado es una comprobación de equivalencia: sobre 12 grabaciones de prueba, el texto generado por el ONNX fp16 coincide con el texto del modelo PyTorch original en las 12. Es una prueba de fidelidad de la conversión, no una evaluación de calidad ASR (no incluye WER, CER ni comparación con otros sistemas).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: en torno a 443 MB solo para los pesos fp16, más el espacio de activaciones y el búfer de audio; no se publican cifras de consumo real.
- GPU recomendadas: no disponibles. Al ejecutarse vía ONNX Runtime Web, el backend puede ser WebGPU (GPU del navegador) o WASM (CPU), sin requisitos de GPU de datacenter.
- Cabe en GPU de consumo: sí, por tamaño de pesos, aunque el rendimiento depende del backend de ONNX Runtime y del navegador; no hay cifras de latencia publicadas.
- Opciones de despliegue: ONNX Runtime Web es el destino declarado; el mismo grafo puede ejecutarse con otras integraciones de ONNX Runtime, aunque no se documentan ni se han validado en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Contexto/entrada | Datos de rendimiento |
|---|---|---|---|---|---|---|
| Rose337/VRChatAdminToolsModels (este) | ASR CTC, export ONNX fp16 | ruso | MIT | ONNX fp16 | audio de longitud variable | no disponible |
| ai-sage/GigaAM-v3 `e2e_ctc` (base) | ASR CTC | ruso | MIT | PyTorch/ONNX | audio de longitud variable | no disponible en la información proporcionada |
| Whisper (p. ej. large-v3) | ASR encoder-decoder | multilingüe | MIT | PyTorch, GGUF, ONNX, etc. | ventanas de audio | no disponible en la información proporcionada |
| Vosk | ASR Kaldi-based | varios, incluido ruso | Apache 2.0 | modelos compactos | audio en streaming | no disponible en la información proporcionada |

La comparación cuantitativa (WER/CER, parámetros, latencia) no está disponible en la información proporcionada. Cualitativamente, este repositorio no aporta mejoras de calidad frente a su modelo base: solo cambia el formato y la precisión para habilitar inferencia en navegador.

## Limitaciones y advertencias

- Solo reconoce ruso; no se documenta ningún otro idioma.
- Es un modelo ASR, no un LLM: no genera respuestas, no razona y no soporta tool calling ni agentes.
- No se publican métricas de calidad (WER/CER) ni evaluación con acentos, ruido o audio de baja calidad; la validación con 12 grabaciones es insuficiente para estimar robustez.
- La salida CTC no incluye puntuación ni mayúsculas de forma garantizada; requiere postprocesado si se necesita texto formateado.
- Sesgos conocidos: no disponibles. Al depender del corpus del modelo base, puede heredar los sesgos de este, pero no se documentan.
- Riesgo de alucinación: en ASR se traduce en sustituciones o inserciones de palabras; no hay tasas publicadas.
- Restricciones de licencia: MIT permite uso comercial, pero conviene conservar la atribución a ai-sage/GigaAM-v3 y al equipo GigaChat (SberDevices) además de la licencia del repositorio.
- El autor declara 0 descargas y 0 likes; es un artefacto auxiliar de una aplicación concreta, sin mantenimiento ni versionado independiente documentado.
- La comprobación de fidelidad se limita a 12 grabaciones; no cubre otros backends de ONNX Runtime, cuantizaciones distintas de fp16 ni entradas anómalas.
- El tamaño de ~443 MB puede ser problemático para carga inicial en web móvil; no se documenta ninguna variante cuantizada a int8.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Rose337/VRChatAdminToolsModels
- Modelo base ai-sage/GigaAM-v3: https://huggingface.co/ai-sage/GigaAM-v3
- Revisión concreta del modelo base (`e2e_ctc`, commit `cec030b4c4f35d928e4a9044a3bdb29ebd499fac`): https://huggingface.co/ai-sage/GigaAM-v3/tree/cec030b4c4f35d928e4a9044a3bdb29ebd499fac

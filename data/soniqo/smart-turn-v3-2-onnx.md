# soniqo/Smart-Turn-v3.2-ONNX

## Resumen

Smart-Turn-v3.2-ONNX es un modelo de detección de fin de turno (end-of-turn) para agentes de voz, desarrollado por Soniqo como una re-exportación del modelo open source Smart Turn v3 de Pipecat. Su función es analizar los últimos 8 segundos de audio de un usuario y devolver la probabilidad de que haya terminado su turno de habla, permitiendo que un agente de voz responda en el momento adecuado sin cortar al interlocutor. A diferencia de los sistemas basados en transcripción, este modelo trabaja directamente sobre el audio crudo, analizando prosodia, ritmo y entonación, lo que lo hace independiente del texto y útil en 23 idiomas.

Con solo 8 millones de parámetros, el modelo emplea un encoder Whisper-Tiny acoplado a un mecanismo de atención pooling y una cabeza MLP. El front-end de audio (log-mel de Whisper) está incrustado en el grafo, por lo que la entrada es directamente PCM a 16 kHz. Se distribuye en formato ONNX con dos variantes: float32 (33 MB) e int8 cuantizado dinámicamente (11 MB). La licencia BSD-2-Clause permite uso comercial sin restricciones significativas. Su relevancia radica en que resuelve un problema crítico en sistemas de voz conversacionales: detectar con precisión cuándo el usuario ha terminado de hablar, mejorando la fluidez y naturalidad de los asistentes de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Whisper-Tiny + attention pooling + MLP head |
| Parametros totales | 8.0 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Ventana de audio de 8 segundos (128000 muestras a 16 kHz) |
| Tipos de cuantizacion | float32, int8 (cuantizacion dinamica de MatMul/Gemm) |
| Idiomas soportados | arabe, bengali, chino, danes, neerlandes, aleman, ingles, fines, frances, hindi, indonesio, italiano, japones, coreano, marathi, noruego, polaco, portugues, ruso, espanol, turco, ucraniano, vietnamita (23 idiomas) |
| Licencia | BSD-2-Clause |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento

El modelo es una re-exportacion del grafo original de Pipecat Smart Turn v3.2, concretamente de la version `smart-turn-v3.2-gpu.onnx` (revision `f766f81d3cfd`). La arquitectura combina un encoder Whisper-Tiny (que extrae representaciones de audio) con una capa de atencion sobre el tiempo y una cabeza MLP que produce la probabilidad de fin de turno. La innovacion principal de esta version es que el front-end de log-mel de Whisper (incluida la normalizacion de onda cero-media y varianza unitaria) esta integrado dentro del grafo ONNX, de modo que la entrada es directamente audio PCM de 16 kHz y no se requiere preprocesamiento externo.

Los datos de entrenamiento no estan disponibles en la informacion proporcionada, pero el modelo original fue entrenado por Pipecat con conjuntos de datos publicados como `pipecat-ai/smart-turn-data-v3.2-*`. No se menciona el uso de RLHF ni DPO. La re-exportacion reproduce el grafo fp32 original con una diferencia menor a 1e-5 en las salidas, y la variante int8 cuantifica los pesos del encoder y la cabeza, manteniendo el front-end en float32. La cuantizacion int8 produce una diferencia media de 0.007 en las probabilidades y altera la decision de umbral 0.5 en menos del 1% de los clips de prueba.

## Capacidades

- Deteccion de fin de turno en audio conversacional: dado un fragmento de hasta 8 segundos, devuelve la probabilidad de que el hablante haya terminado su turno (umbral recomendado > 0.5).
- Analisis de prosodia y entonacion: el modelo utiliza caracteristicas acusticas (ritmo, pausas, curva de entonacion) en lugar de transcripcion, lo que lo hace robusto a errores de ASR.
- Soporte multilingue: cubre 23 idiomas, incluyendo los principales de Europa, Asia y Oriente Medio.
- Entrada de audio crudo: acepta PCM mono de 16 kHz, con el front-end de log-mel incrustado en el grafo, simplificando la integracion.
- Baja latencia: inferencia de una ventana de 8 segundos en ~36 ms (media) en CPU (Apple M5 Pro con 2 hilos), lo que permite su uso en tiempo real.
- Formato ONNX estandar: compatible con ONNX Runtime, CoreML y otros runtimes, adecuado para despliegue en dispositivos moviles y servidores.

## Casos de uso

- Agentes de voz conversacionales: el modelo permite que un asistente de voz sepa cuando el usuario ha terminado de hablar, evitando interrupciones y reduciendo la latencia de respuesta. Se integra tras un VAD ligero que detecta silencio, y se ejecuta sobre el turno completo del usuario.
- Atencion al cliente automatizada: en sistemas de IVR o chatbots de voz, el modelo mejora la fluidez al responder solo cuando el cliente ha finalizado su peticion, incluso en pausas breves que no indican fin de turno.
- Transcripcion y subtitulado en tiempo real: combinado con un sistema de ASR, permite segmentar el audio en frases completas, mejorando la precision de la puntuacion y la sincronizacion de subtitulos.
- Asistentes de voz en dispositivos moviles: gracias a su tamano reducido (11 MB en int8) y su soporte ONNX, puede ejecutarse localmente en smartphones Android e iOS sin conexion a internet, preservando la privacidad del usuario.
- Sistemas de dictado y control por voz: el modelo ayuda a delimitar comandos de voz, especialmente en entornos con ruido de fondo o acentos variados, al basarse en caracteristicas acusticas en lugar de texto.
- Evaluacion de calidad de sistemas de voz: al proporcionar una medida objetiva de fin de turno, puede usarse para comparar el rendimiento de diferentes agentes de voz o para depurar problemas de latencia en pipelines de conversacion.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de evaluacion sobre 1000 clips del conjunto de prueba `pipecat-ai/smart-turn-data-v3.2-test` (shard `train-00000-of-00010.parquet`), con umbral de decision 0.5. La latencia se midio en Apple M5 Pro (macOS 26.5.2) con ONNX Runtime CPU (2 hilos intra-op) y CoreML en CPU + Neural Engine.

| Modelo | Accuracy | Precision | Recall | F1 | FPR | FNR | Latencia media | Latencia p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Upstream `smart-turn-v3.2-gpu.onnx` (entrada mel) | 92.90% | 0.912 | 0.944 | 0.927 | 8.48% | 5.61% | — | — |
| Upstream `smart-turn-v3.2-cpu.onnx` (entrada mel) | 91.70% | 0.889 | 0.946 | 0.916 | 10.98% | 5.41% | — | — |
| `smart-turn-v3.2.onnx` (float32) | 92.90% | 0.912 | 0.944 | 0.927 | 8.48% | 5.61% | 36.3 ms | 51.4 ms |
| `smart-turn-v3.2-int8.onnx` | 93.00% | 0.910 | 0.948 | 0.929 | 8.67% | 5.20% | 37.3 ms | 50.6 ms |

Nota: el modelo int8 muestra una accuracy ligeramente superior en este conjunto de prueba, aunque la diferencia es marginal y podria deberse a variabilidad del conjunto. La latencia en Apple Silicon no mejora con int8 bajo ONNX Runtime; la ventaja principal es la reduccion de tamano de descarga. El encoder domina el coste computacional; el front-end incrustado anade unos 4 ms en un solo hilo, y con 4 hilos la latencia total baja a unos 20 ms.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo es extremadamente ligero (33 MB en float32, 11 MB en int8) y puede ejecutarse completamente en CPU.
- GPU recomendadas: no necesarias. En caso de usar GPU, cualquier GPU moderna con soporte ONNX Runtime funcionaria, pero no aporta ventaja significativa dado el tamano.
- Compatibilidad con GPU de consumo: si, aunque no es necesario. Se puede ejecutar en cualquier dispositivo con CPU ARM o x86, incluyendo Raspberry Pi y telefonos moviles.
- Opciones de despliegue:
  - ONNX Runtime (CPU o GPU) en Python, C++, C# o Java.
  - CoreML en Apple Silicon (con soporte para Neural Engine).
  - Android a traves del SDK `speech-android` de Soniqo.
  - C++ runtime `speech-core` para integracion en sistemas embebidos o de escritorio.
  - Herramientas CLI como `speech` (parte de `speech-core`).
- Latencia y throughput: en Apple M5 Pro, latencia media de 36.3 ms (float32) y 37.3 ms (int8) para una ventana de 8 segundos. Con 4 hilos, la latencia se reduce a ~20 ms. En hardware menos potente, se espera una latencia de 50-100 ms, aun aceptable para uso en tiempo real.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos de deteccion de fin de turno comparables en la misma categoria (por ejemplo, modelos especificos de VAD o turn-taking). El modelo es una re-exportacion del original de Pipecat, por lo que la comparacion directa con el modelo upstream es la unica referencia disponible:

| Modelo | Parametros | Ventana | Formato | Accuracy | Licencia |
|---|---:|---|---:|---:|---|
| `smart-turn-v3.2.onnx` (Soniqo) | 8.0 M | 8 s | ONNX (float32) | 92.90% | BSD-2-Clause |
| `smart-turn-v3.2-int8.onnx` (Soniqo) | 8.0 M | 8 s | ONNX (int8) | 93.00% | BSD-2-Clause |
| Upstream `smart-turn-v3.2-gpu.onnx` (Pipecat) | 8.0 M | 8 s | ONNX (entrada mel) | 92.90% | BSD-2-Clause |
| Upstream `smart-turn-v3.2-cpu.onnx` (Pipecat) | 8.0 M | 8 s | ONNX (entrada mel) | 91.70% | BSD-2-Clause |

Los modelos de Soniqo y Pipecat comparten pesos y arquitectura; la diferencia radica en que la version de Soniqo incrusta el front-end de audio, simplificando la integracion. No se han encontrado otros detectores de fin de turno comparables en terminos de tamano y rendimiento en la informacion disponible.

## Limitaciones y advertencias

- Ventana fija de 8 segundos: si el turno del usuario supera los 8 segundos, solo se analiza la parte final. Para turnos mas largos, se recomienda mantener los ultimos 8 segundos y descartar el inicio.
- Dependencia de la calidad del audio: el modelo esta entrenado con audio de 16 kHz mono; tasas de muestreo diferentes o audio con mucho ruido pueden degradar el rendimiento.
- Umbral de decision fijo en 0.5: aunque es el valor recomendado, en entornos con ruido o acentos poco representados puede ser necesario ajustar el umbral para equilibrar falsos positivos (cortar al usuario) y falsos negativos (esperar de mas).
- La cuantizacion int8 no acelera la inferencia en Apple Silicon: aunque reduce el tamano a 11 MB, la latencia es practicamente identica a la version float32 bajo ONNX Runtime. En otras plataformas podria haber diferencias.
- Sesgos potenciales: el modelo fue entrenado principalmente con datos en ingles (aunque cubre 23 idiomas); el rendimiento en idiomas menos representados o con variaciones dialectales puede ser inferior.
- Riesgo de alucinacion: al ser un modelo de clasificacion de audio, no genera texto, por lo que el riesgo de alucinacion es minimo. Sin embargo, puede producir falsas detecciones de fin de turno en pausas largas o respiraciones.
- Restricciones de licencia: BSD-2-Clause permite uso comercial y modificacion, pero se debe incluir el aviso de copyright y la renuncia de responsabilidad en las redistribuciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soniqo/Smart-Turn-v3.2-ONNX
- Modelo original de Pipecat: https://huggingface.co/pipecat-ai/smart-turn-v3
- Repositorio del proyecto Smart Turn: https://github.com/pipecat-ai/smart-turn
- SDK Android de Soniqo: https://github.com/soniqo/speech-android
- Documentacion de Android: https://soniqo.audio/getting-started/android
- Runtime C++ de Soniqo: https://github.com/soniqo/speech-core
- Documentacion del runtime: https://soniqo.audio/speech-core
- Sitio web de Soniqo: https://soniqo.audio/
- Blog de Soniqo: https://soniqo.audio/blog

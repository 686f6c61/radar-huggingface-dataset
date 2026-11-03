# litert-community/NVIDIA-NemotronLabs-RE-USE-LiteRT

## Resumen

NVIDIA NemotronLabs RE-USE es una red neuronal para mejora y restauración universal de voz: un único modelo que repara audio degradado por ruido aditivo, reverberación, recorte (clipping), limitación de banda, artefactos de códec, pérdida de paquetes y micrófonos de baja calidad. El modelo original lo desarrolla NVIDIA y cuenta con 9,6 millones de parámetros, una cifra muy contenida que lo sitúa en la categoría de modelos ligeros de procesamiento de audio.

Esta ficha describe la conversión a LiteRT publicada por la comunidad litert-community, pensada para ejecución en dispositivo (on-device), principalmente Android con aceleración por GPU. La conversión se realizó con litert-torch 0.9.4 y mantiene el grafo del modelo original en float32, con el preprocesado STFT y el postprocesado de STFT inversa ejecutándose en el host. El repositorio incluye dos variantes del grafo que difieren únicamente en el orden del escaneo temporal dentro de los bloques Mamba.

La relevancia de esta conversión es práctica: permite llevar un modelo de restauración de voz a teléfonos móviles sin depender de la nube. No obstante, las mediciones publicadas por el autor indican que la inferencia es más lenta que el tiempo real (2,697 s por segundo de audio en un Galaxy S26 con el grafo principal en GPU) y que la carga del archivo principal supera el minuto, con picos de memoria de hasta 3,74 GB, lo que limita su uso a procesamiento de grabaciones y no a llamadas en vivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal con encoder, 30 bloques de Mamba bidireccional sobre tiempo y frecuencia, y decoders de magnitud y fase |
| Parametros totales | 9,6 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa fragmentos de 2 s de audio a 16 kHz (401 frames, 321 bins) |
| Tipos de cuantizacion | float32 (ambos grafos: principal y fastload) |
| Idiomas soportados | no disponible (el modelo opera sobre señal de voz, no sobre texto; la model card no declara idiomas) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | TFLite (LiteRT); grafo principal `reuse_16k_2s_fp32.tflite` (54.155.412 bytes) y variante `reuse_16k_2s_fastload_fp32.tflite` (44.289.500 bytes) |

## Arquitectura y entrenamiento

La arquitectura del modelo original combina un encoder, treinta bloques de Mamba bidireccional que operan tanto sobre el eje temporal como sobre el eje frecuencial, y sendos decoders de magnitud y de fase. La conversión a LiteRT reimplementa estos componentes para GPU manteniendo el cómputo en float32, de modo que el grafo calcula la misma función que el original. La entrada del grafo apila log1p(|X|) y angle(X) con forma `[1, 2, 401, 321]`, y la salida tiene forma `[1, 3, 401, 321]`: una magnitud comprimida m y la fase expresada como par (x_r, x_i).

El preprocesado y el postprocesado se ejecutan en el host: STFT con n_fft de 640, hop de 80 (5 ms) y ventana Hann periódica de 640 con padding reflectivo; tras el grafo se aplica |Y| = expm1(relu(m)), se anulan los frames con más de la mitad de bins a cero y se reconstruye la fase como (x_r, x_i) / hypot(x_r, x_i) antes de la STFT inversa. Los fragmentos se solapan cada 1,75 s (0,25 s de solape) y se recombinan con ponderación Hann, siguiendo el esquema de `inference_chunk.py` del modelo original.

Los dos archivos TFLite difieren solo en el orden del escaneo temporal dentro de los bloques Mamba: el principal procesa un frame cada vez (91.014 operaciones), mientras que el fastload procesa bloques de 8 frames (33.114 operaciones), lo que acelera la carga y reduce memoria a costa de mayor tiempo por fragmento en GPU. La información disponible no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Restauración universal de voz con una sola red: elimina ruido aditivo, reverberación, recorte, limitación de banda, artefactos de códec, pérdida de paquetes y degradaciones de micrófono de baja calidad.
- Procesamiento de audio a 16 kHz en esta conversión (el original admite 8, 16, 22.05, 24, 32, 44.1 y 48 kHz; aquí es necesario remuestrear a 16 kHz mono en el host).
- Supresión de hablantes secundarios: según la model card del original, está entrenado para preservar al hablante principal y suprimir a los demás en audio con solapamiento de voces.
- Inferencia por fragmentos de 2 s con solape y recombinación, adecuada para grabaciones largas.
- Ejecución on-device en Android con acelerador GPU de LiteRT y también en CPU mediante XNNPACK (4 hilos).
- Interfaz de audio a audio (`audio-to-audio`) con ejemplos en Python (API CompiledModel) y Kotlin (`SpeechRestorer.kt`, `Spectral.kt`).
- No dispone de tool calling, razonamiento multi-paso, capacidades multimodales de texto ni modo thinking: es un modelo puramente de señal de audio.

## Casos de uso

- Restauración de grabaciones de reuniones y entrevistas: se procesan los archivos de audio ya grabados para eliminar reverberación de salas y ruido de fondo, aprovechando que el modelo funciona por fragmentos de 2 s con solape y no requiere tiempo real.
- Limpieza de notas de voz en aplicaciones móviles: integración on-device mediante LiteRT en Android para mejorar audios capturados con micrófonos de baja calidad antes de enviarlos o archivarlos.
- Recuperación de material de archivo degradado: reparación de grabaciones con limitación de banda o recorte (clipping) en proyectos de digitalización, remuestreando previamente a 16 kHz mono.
- Postprocesado de audio comprimido: eliminación de artefactos de códec (por ejemplo, Opus a 8 kb/s) y de pérdida de paquetes en grabaciones transmitidas por redes deficientes.
- Preprocesado para pipelines de ASR: mejora de la señal antes de la transcripción en sistemas desplegados en dispositivos con recursos limitados, reduciendo ruido y reverberación que degradan el reconocimiento.
- Herramientas de accesibilidad: mejora de audio en aplicaciones de ayuda auditiva o subtitulado sobre grabaciones, dado el bajo tamaño del modelo (9,6 M de parámetros) y su licencia permisiva.
- Procesamiento por lotes en servidor: uso del ejemplo Python con XNNPACK o acelerador GPU para restaurar colecciones de audio fuera del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta mediciones de velocidad y memoria de la conversión, recogidas en la siguiente tabla.

| Medicion | Valor |
|---|---|
| Velocidad (Galaxy S26, grafo principal en GPU) | 2,697 s por segundo de audio (medido el 2026-11-03) |
| Tiempo real | No alcanza tiempo real; uso recomendado sobre grabaciones |
| Tiempo de carga del grafo principal | Más de 1 minuto en cada uno de los tres teléfonos medidos |
| Tiempo de carga del grafo fastload | Menos de 1 minuto |
| Memoria pico (app de benchmark) | 2,94–3,74 GB |
| Prueba cualitativa | 10 clips de prueba restaurados correctamente con el grafo principal en GPU |

## Requisitos de hardware

- VRAM/memoria estimada: los pesos en float32 ocupan aproximadamente 54 MB (grafo principal) y 44 MB (fastload), pero el benchmark reporta picos de memoria de 2,94–3,74 GB durante la ejecución en teléfonos, por lo que la memoria de trabajo es el factor limitante.
- GPU recomendadas: acelerador GPU de LiteRT en Android (medido en Galaxy S26); en escritorio, Metal en Mac mediante el acelerador GPU de LiteRT. La model card no detalla modelos concretos de GPU de escritorio (A100, H100, RTX 4090) para esta conversión.
- Cabe en GPU de consumo: sí, por tamaño de pesos, aunque la memoria pico medida en móvil aconseja usar la variante fastload en dispositivos con menos memoria.
- Opciones de despliegue: LiteRT con `ai-edge-litert==2.3.0` (API CompiledModel), CPU con XNNPACK (4 hilos) o GPU; ejemplos en Python y Kotlin para Android.
- Latencia y throughput: 2,697 s por segundo de audio en Galaxy S26 con el grafo principal en GPU; el fastload carga más rápido y usa menos memoria, pero cada fragmento tarda más en GPU. No se publican cifras de throughput en CPU ni en escritorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA NemotronLabs RE-USE (LiteRT, esta ficha) | 9,6 M | Fragmentos de 2 s a 16 kHz | OpenMDW-1.1 | TFLite | HuggingFace (litert-community) |
| NVIDIA NemotronLabs RE-USE (original) | 9,6 M | 8–48 kHz, fragmentos configurables (script de 5 s cada 2,5 s) | OpenMDW-1.1 | no disponible en la informacion proporcionada | HuggingFace (nvidia) |
| Alternativas de mejora de voz de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de benchmarks ni especificaciones de otros modelos de restauración de voz comparables, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Velocidad inferior al tiempo real: 2,697 s por segundo de audio en el dispositivo medido; no es apta para llamadas en vivo ni para procesamiento en streaming.
- Tiempo de carga elevado: el grafo principal tarda más de un minuto en cargar en los tres teléfonos medidos; la variante fastload mitiga este problema.
- Consumo de memoria alto en móvil: picos de 2,94–3,74 GB, lo que puede provocar cierres en dispositivos con poca RAM; se recomienda fastload en esos casos.
- Restricción de frecuencia de muestreo en esta conversión: solo 16 kHz; es necesario remuestrear en el host cualquier otra tasa.
- Procesamiento por fragmentos fijos de 2 s con solape de 0,25 s; el original emplea fragmentos de 5 s cada 2,5 s, por lo que el comportamiento en grabaciones largas puede diferir.
- Posible eliminación de hablantes secundarios: el modelo está entrenado para preservar al hablante principal y suprimir a los demás, lo que puede ser indeseable en audio con múltiples voces relevantes.
- Riesgo de artefactos o sobreprocesado en audio ya limpio o en señales no vocales; la model card no documenta evaluaciones formales de calidad (PESQ, STOI u otras).
- Sesgos conocidos: no documentados en la información disponible; al operar sobre voz, puede heredar sesgos acústicos de los datos de entrenamiento del modelo original.
- Licencia OpenMDW-1.1: es necesario revisar sus términos para uso comercial; la conversión incluye además la licencia Apache 2.0 de mamba_ssm, cuyos términos aplican a esa dependencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es una conversión reciente (creada el 2026-11-03) sin validación comunitaria amplia.

## Enlaces

- HuggingFace (esta conversión): https://huggingface.co/litert-community/NVIDIA-NemotronLabs-RE-USE-LiteRT
- Modelo original: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE
- Paper referenciado (arXiv:2603.02641): https://arxiv.org/abs/2603.02641
- Paper referenciado (arXiv:2606.25621): https://arxiv.org/abs/2606.25621
- LiteRT: https://ai.google.dev/edge/litert
- Repositorio mamba_ssm: https://github.com/state-spaces/mamba

# JackKnifeAI/htdemucs-executorch

## Resumen
htdemucs-executorch es una exportación del modelo Hybrid Transformer Demucs (HTDemucs), desarrollado por Alexandre Défossez, Simon Rouard y Francisco Massa en Meta AI, a formato ExecuTorch con backend Vulkan. El artefacto lo ha publicado JackKnifeAI para integrarlo en el estudio Killa YuE, una aplicación Android. No es un modelo de lenguaje: es un modelo de separación de fuentes musicales que divide una mezcla estéreo en cuatro pistas (batería, bajo, otros y voces).

El repositorio contiene únicamente dos ficheros: el modelo exportado `htdemucs_vulkan.pte`, de 302.594.560 bytes (unos 288,6 MiB), y el runtime `libexecutorch_ffi.so` para Android arm64, de 111.533.272 bytes (unos 106,4 MiB). El modelo trabaja con ventanas fijas de 7,8 s (343.980 muestras a 44,1 kHz estéreo) y es la aplicación la que realiza el enmascarado STFT y la STFT inversa, no el modelo.

Su relevancia es acotada pero concreta: demuestra que un separador de fuentes de calidad de estudio puede ejecutarse íntegramente en un móvil Android mediante Vulkan, sin servidor y sin conexión. El coste es alto: en un Galaxy S25 con Adreno 830 tarda 24,4 s por ventana y consume 1,7 GB de memoria pico. El repo acumula 0 descargas y 0 likes, por lo que carece de validación por parte de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HTDemucs: modelo híbrido tiempo-frecuencia (rama de forma de onda más rama de espectrograma con transformer). Exportado a ExecuTorch con backend Vulkan |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica. Ventana fija de 7,8 s (343.980 muestras a 44,1 kHz, estéreo); la aplicación debe trocear y recomponer |
| Tipos de cuantizacion | no disponible (se distribuye un único fichero `.pte`; no se documentan variantes cuantizadas ni precisión de los pesos) |
| Idiomas soportados | no aplica (modelo de audio, no de texto; entrenado con música) |
| Licencia | MIT (pesos y código). El runtime ExecuTorch procede de pytorch/executorch y es BSD |
| Formato de pesos | ExecuTorch `.pte` (Vulkan) + `libexecutorch_ffi.so` (Android arm64) |
| Tamano del modelo | 302.594.560 bytes (288,6 MiB), SHA-256 7c8db21cb65c11b2befeb8e2e6538b56c6ad9d275e82d0151e1d3d08cc22f296 |
| Tamano del runtime | 111.533.272 bytes (106,4 MiB), SHA-256 cb8391689f77d86b9f6d7866985695485d5bc7651243e6ca699764e51c175d71 |
| Entradas y salidas | Audio estéreo a 44,1 kHz; 4 stems (batería, bajo, otros, voces) |
| Tamano del repo | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento
HTDemucs, publicado en 2022 por Meta AI, es un modelo híbrido de dominio: procesa la señal simultáneamente en el dominio temporal (como el Demucs original, sobre la forma de onda) y en el dominio frecuencial (como MDX-Net, sobre el espectrograma), y combina ambas estimaciones mediante un transformer que cruza información entre los dos dominios. El resultado es una separación en cuatro fuentes. Esta exportación concreta fija ventanas de 7,8 s y delega el preprocesado y el postprocesado espectral (STFT, máscara y STFT inversa) en la aplicación anfitriona, de modo que el `.pte` no cubre el pipeline completo de separación.

La información disponible no detalla el entrenamiento: no se indican número de tokens o de horas de audio, composición del dataset, ni si hubo etapas de ajuste fino o preferencia. El repositorio original de Meta AI documenta tres variantes: `htdemucs` (modelo único sin ajuste fino), `htdemucs_ft` (ajuste fino con cuatro modelos especializados, cuatro veces más costoso en inferencia) y `hdemucs_mmi` (línea base reentrenada). No consta que esta exportación corresponda a ninguna variante concreta ni que se haya reentrenado o cuantizado.

La innovación técnica del artefacto no está en el modelo, sino en el empaquetado: conversión a ExecuTorch y ejecución del grafo sobre Vulkan en GPU móvil, con las limitaciones de operadores y de memoria que ello implica.

## Capacidades
- Separación de fuentes musicales en cuatro stems: batería, bajo, otros y voces.
- Procesamiento de audio estéreo a 44,1 kHz con ventana fija de 7,8 s.
- Inferencia local en dispositivo Android arm64 mediante ExecuTorch sobre Vulkan, sin conexión a red.
- Integración prevista como componente del estudio Killa YuE (separación de stems dentro de la app).
- No soporta tool calling ni function calling: es un modelo de audio, no un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa texto.
- No incorpora modo de razonamiento, visión, audio generativo ni transcripción; el STFT y la STFT inversa quedan fuera del modelo.

## Casos de uso
- Karaoke e instrumentales en móvil: se aísla el stem de voces y se invierte la fase o se descarta para generar una pista sin voz. El modelo es adecuado porque corre en el propio dispositivo y evita subir audio con derechos de autor a un servidor, aunque a 24,4 s por cada 7,8 s de audio el proceso de una canción completa es largo y debe ejecutarse en segundo plano.
- Práctica instrumental para músicos: un guitarrista o baterista puede extraer la pista de bajo o de batería para tocar sobre ella. La calidad del stem, procedente de un modelo híbrido de referencia, es superior a la de separadores espectrales simples.
- Remezclas y mashups para DJ: separar voces y bases permite recontextualizar una canción en otra base rítmica. Requiere procesar la pista completa por ventanas y aplicar solapamiento para evitar artefactos en las fronteras.
- Postproducción de vídeo y doblaje: aislar el stem de voces de una mezcla para reducir música y efectos antes de una transcripción o de un doblaje. Es un paso previo habitual en flujos de trabajo de subtitulado.
- Transcripción musical asistida: enviar el stem de voces a un sistema ASR (por ejemplo Whisper) mejora la tasa de error de palabra respecto a transcribir la mezcla completa, porque elimina la instrumentación como ruido.
- Creación de datasets de audio etiquetado: generar stems alineados para entrenar otros modelos (clasificación de género, detección de instrumentos, separación adicional) en un entorno controlado.
- Análisis forense o de muestreo: comprobar si una grabación reutiliza un sample concreto aislando la pista de batería o de bajo de ambas mezclas.
- Herramienta de escritorio o servidor como respaldo: el mismo modelo HTDemucs original, en PyTorch sobre CUDA, ofrece una alternativa mucho más rápida cuando el requisito no es la ejecución en dispositivo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de calidad de separación (SDR, SIR, SAR) en la información disponible. Los únicos datos de rendimiento son medidas de ejecución en dispositivo aportadas por el autor:

| Dispositivo | SoC / GPU | Ventana | Tiempo por ventana | Factor declarado | Memoria pico |
|---|---|---|---|---|---|
| Galaxy S25 | Snapdragon 8 Elite / Adreno 830 | 7,8 s (343.980 muestras, 44,1 kHz estéreo) | 24,4 s | 3,95x tiempo real | 1,7 GB |

Aviso: las cifras de la model card son internamente inconsistentes. Si una ventana de 7,8 s tarda 24,4 s en procesarse, el factor es de aproximadamente 0,32x tiempo real (unas 3,1 veces más lento que el tiempo real), no 3,95x tiempo real. Conviene verificar la medición antes de asumir cualquier planificación de latencia.

## Requisitos de hardware
- Memoria: 1,7 GB de pico medidas en el dispositivo de referencia; el sistema operativo debe poder reservar ese espacio en GPU y memoria unificada.
- Peso en disco: 288,6 MiB para el modelo `.pte` y 106,4 MiB para el runtime `libexecutorch_ffi.so`, más el código de STFT/iSTFT y los buffers de audio de la aplicación.
- GPU compatibles: cualquier SoC Android arm64 con soporte Vulkan; el único dispositivo con medición publicada es el Galaxy S25 (Adreno 830). En Mali, Xclipse u otras GPU Vulkan el rendimiento y la compatibilidad de operadores no están documentados.
- En GPU de escritorio y centro de datos: no aplica directamente, porque el artefacto es un binario ExecuTorch para Android arm64. Para A100, H100 o RTX 4090 debe usarse el modelo PyTorch original de Meta AI, no esta exportación.
- Opciones de despliegue: runtime de ExecuTorch (versión BSD compilada por el autor). No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM, que son herramientas para modelos de lenguaje y no aplican aquí.
- Latencia y throughput: 24,4 s por ventana de 7,8 s en Adreno 830. No se documentan cifras para otros dispositivos. Con este rendimiento, el procesamiento en tiempo real no es viable en el hardware medido; una canción de tres minutos requiere del orden de 24 ventanas y varios minutos de cómputo, sin contar el solapamiento necesario para evitar discontinuidades.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Formato / plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| htdemucs-executorch (este modelo) | HTDemucs exportado | no disponible (fichero `.pte` de 288,6 MiB) | ExecuTorch + Vulkan, Android arm64 | MIT (runtime BSD) | HuggingFace, 0 descargas |
| htdemucs (original, Meta AI) | HTDemucs | no disponible en la informacion | PyTorch, CPU/CUDA | MIT | Repositorio facebookresearch/demucs; invocacion `-n htdemucs` |
| htdemucs_ft (Meta AI) | HTDemucs con ajuste fino (4 modelos) | no disponible en la informacion | PyTorch, CPU/CUDA | MIT | Repositorio facebookresearch/demucs; invocacion `-n htdemucs_ft`; coste de inferencia 4x |
| hdemucs_mmi (Meta AI) | Demucs (linea base reentrenada) | no disponible en la informacion | PyTorch, CPU/CUDA | MIT | Repositorio facebookresearch/demucs; invocacion `-n hdemucs_mmi` |
| TrevorJS/htdemucs-CoreAI | HTDemucs convertido | no disponible en la informacion | Core AI, macOS 27 sobre Apple Silicon | no disponible en la informacion | HuggingFace |
| MDX-Net | Red espectral (espectrograma) | no disponible en la informacion | Diversos | no disponible en la informacion | Referenciado como alternativa clasica frente a HTDemucs |

No se dispone de cifras comparativas de calidad (SDR) ni de latencia entre estas variantes en la información proporcionada. La comparación relevante es de plataforma: el original de Meta AI prioriza calidad y velocidad en GPU de escritorio, `htdemucs_ft` mejora la separación a costa de cuadruplicar el cómputo, y esta exportación prioriza la ejecución local en Android a costa de la latencia.

## Limitaciones y advertencias
- El modelo no es un LLM: no genera texto, no razona, no soporta herramientas ni agentes. Cualquier expectativa de ese tipo es un error de categoría.
- El `.pte` no incluye el pipeline completo. La STFT, el cálculo de máscaras y la STFT inversa los implementa la aplicación; sin ese código el modelo es inutilizable.
- Ventana fija de 7,8 s: el audio más largo debe trocearse. Sin solapamiento y suma con ventana (overlap-add) aparecerán discontinuidades audibles en las fronteras de cada segmento.
- Riesgo de artefactos y de fuga entre stems (bleeding): es un error propio de los separadores, no una alucinación en sentido lingüístico. Los pasajes con instrumentación densa o voces procesadas suelen degradarse.
- No hay resultados de SDR ni comparación objetiva con otras variantes en la información disponible, por lo que la calidad real de esta exportación concreta no está verificada.
- No se documenta la precisión numérica de los pesos ni si hubo cuantización; esto afecta directamente a la fidelidad del audio separado y no es auditable con los datos publicados.
- Sesgos: no se documenta la distribución musical de entrenamiento, por lo que se desconoce el comportamiento en géneros infrarrepresentados (música clásica, tradicional, no occidental).
- Licencia MIT: permite uso comercial y modificación, pero obliga a conservar el aviso de copyright de Meta Platforms. El runtime ExecuTorch está bajo licencia BSD, con sus propias condiciones.
- Adopción nula: 0 descargas y 0 likes, sin issues ni validación de terceros. Conviene verificar los SHA-256 publicados y reproducir el proceso de exportación antes de integrarlo en producción.
- Rendimiento insuficiente para tiempo real: 24,4 s por ventana de 7,8 s en el único dispositivo medido. La propia model card contiene una cifra de factor de tiempo real incoherente con sus tiempos.
- Compatibilidad limitada a Android arm64 con Vulkan; no hay build para iOS, escritorio ni servidor en este repositorio.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/JackKnifeAI/htdemucs-executorch
- Repositorio original de Demucs (Meta AI, código y paper de Hybrid Transformer Demucs): https://github.com/facebookresearch/demucs
- Aplicación Killa YuE, destino de la exportación: https://github.com/JackKnifeAI/killa-yue
- Runtime ExecuTorch (licencia BSD): https://github.com/pytorch/executorch
- Exportación equivalente a Core AI para Apple Silicon: https://huggingface.co/TrevorJS/htdemucs-CoreAI
- Contexto sobre Demucs, MDX-Net y HTDemucs: https://stemsplitter.github.io/demucs-mdxnet-htdemucs-models/
- Guía de separación de fuentes con Demucs y HT-Demucs: https://aiunderstanding.org/learn/demucs-music-source-separation
- Análisis de modelos y costes de separación de stems: https://aireiter.com/blog/demucs-stem-separation-models-flags-cost

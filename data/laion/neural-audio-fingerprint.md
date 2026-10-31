# laion/neural-audio-fingerprint

## Resumen

Neural audio fingerprint es un modelo de extracción de características de audio desarrollado por LAION que genera huellas acústicas robustas para la detección de duplicados y copias en grandes colecciones de audio. El modelo mapea ventanas de 1 segundo de audio mono a 16 kHz en embeddings de 128 dimensiones normalizados con L2, de forma que una ventana y una copia transformada de la misma grabación (recompresión con MP3, AAC, Opus o Vorbis, remuestreo, recortes, cambios de ganancia, filtros, reverberación, pequeños cambios de velocidad o mezcla con otro audio) obtienen una alta similitud coseno, mientras que grabaciones distintas puntúan bajo.

Técnicamente se trata de un encoder transformer compacto de 80,3 millones de parámetros (3,9 GFLOP por ventana), entrenado con aprendizaje contrastivo (NT-Xent) sobre 301.056 clips de audio web y de datasets públicos. Su relevancia actual radica en casos de uso muy demandados en la comunidad de IA: depurar corpus de entrenamiento para eliminar copias de grabaciones del conjunto de evaluación (contaminación), deduplicar datasets masivos y rastrear resubidas de contenido. Es un modelo ligero, con licencia Apache 2.0, que se ejecuta en PyTorch y puede desplegarse incluso en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer pre-LN de 6 capas con pooling mean+max y MLP final |
| Parametros totales | 80,3 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas de 1 s de audio a 16 kHz |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de audio, agnóstico de idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`, cargable con `torch.load(..., weights_only=True)`) |

## Arquitectura y entrenamiento

El pipeline de entrada convierte cada segundo de audio mono a 16 kHz en un log-mel de 64 bandas (ventana de 25 ms, salto de 10 ms, rango de 30 Hz a 8 kHz), normalizado por la energía media de la ventana, lo que hace que el nivel absoluto de la señal sea irrelevante. Sobre este espectrograma se extraen parches de 4 frames (25 tokens) que alimentan un transformer pre-LN de 6 capas con anchura 1024 y 16 cabezas; la salida se agrega con pooling mean + max y se proyecta mediante un MLP de 2 capas a un embedding de 128 dimensiones normalizado en L2. El coste computacional es de 3,9 GFLOP por ventana.

El entrenamiento usa aprendizaje contrastivo con la pérdida NT-Xent (temperatura 0,05) y 16.384 pares por paso, con negativos recogidos a través de 4 GPUs. Los datos son 301.056 clips de audio web y de datasets públicos (un extracto de hasta 6 s por clip), balanceados en 11 grupos sonoros amplios (habla 22 %, música 24 %, animales 14 %, efectos de sonido diseñados 10 %, y siete grupos restantes con un 3–5 % cada uno), con 4.704 clips reservados para validación. Cada clip se renderizó adicionalmente con una tasa de remuestreo aleatoria (8–48 kHz) y, con probabilidad 0,85, con un códec con pérdida (MP3, AAC, Opus o Vorbis a 24–320 kbps en escala log-uniforme). Las vistas positivas combinan un ancla mayormente limpia con ligeras augmentaciones y una consulta mayormente renderizada por códec, desplazada hasta ±250 ms y acelerada o ralentizada hasta ±3 %, más augmentaciones en GPU (EQ, filtros paso bajo y paso alto, reverberación sintética, mezcla con otro clip a −5/+20 dB SNR, ruido blanco o rosa a 10–40 dB SNR, ganancia de ±12 dB y cuantización int16). Se optimizó con AdamW (lr 3e-4, weight decay 0,05), 1.500 pasos de calentamiento y decay coseno durante 35.858 pasos: 3,3 horas en 4 GPUs GH200.

## Capacidades

- Extracción de embeddings de huella acústica de 128 dimensiones para ventanas de 1 segundo de audio mono a 16 kHz.
- Detección de copias y duplicados cercanos robusta a recompresión (MP3, AAC, Opus, Vorbis), remuestreo, recortes y desplazamientos temporales, cambios de ganancia, filtrado, reverberación, pequeños cambios de velocidad (±3 %) y mezcla con otro audio.
- Emparejamiento entre archivos: consultas a saltos de 0,5 s contra referencias a saltos de 0,25 s, descartando ventanas más de 60 dB por debajo del máximo del archivo; una coincidencia requiere dos ventanas consecutivas de consulta con coseno ≥ τ (0,90 por defecto) contra la misma referencia con offset consistente (±0,25 s); para referencias de 1,5 s o menos basta una ventana.
- Clasificación agnóstica al tipo de contenido: entrenado con habla, música, sonidos de animales, efectos de sonido y otros grupos, no solo música.
- Pipeline de feature-extraction en PyTorch, con scripts de embedding y de test de coincidencia incluidos en el repositorio.

## Casos de uso

- Depuración de corpus de entrenamiento: se pueden detectar copias de grabaciones del conjunto de evaluación dentro del corpus de entrenamiento, reduciendo la contaminación de benchmarks en modelos de audio.
- Deduplicación de datasets masivos: al ser solo 3,9 GFLOP por ventana y producir embeddings de 128 dimensiones, permite indexar millones de horas de audio en bases vectoriales y eliminar duplicados y re-encodes.
- Rastreo de resubidas de contenido: plataformas de alojamiento de audio pueden detectar re-encodes y recortes de material con derechos de autor, ya que el modelo resiste MP3 64 kbps, cambios de velocidad y recortes de 0,5 s con detección del 100 % en el benchmark.
- Verificación de integridad en archivos y bibliotecas: identificación de copias parciales (extractos de 3 s detectados al 97 %) o fragmentos incrustados en clips más largos (79 % cuando se incrusta en un clip de 30 s).
- Detección de muestras y remixes aproximados: la robustez a mezclas a 20 dB SNR (96 % de detección) permite localizar material de fondo reutilizado en producciones nuevas.
- Control de calidad en pipelines de ingesta: al normalizar por energía media de la ventana, no requiere ajuste previo de niveles; se integra directamente tras la decodificación a 16 kHz mono.
- Investigación en fingerprinting de audio: base reproducible (Apache 2.0, código y pesos públicos) para comparar contra métodos clásicos como GraFPrint.

## Benchmarks y rendimiento

**Recuperación en validación (4.704 clips, consultas transformadas de 1 s contra base de ventanas limpias):**

| Condicion de la consulta | Top-1 |
|---|--:|
| Solo codecs | 99,1 % |
| Augmentacion completa de entrenamiento | 92,3 % |
| Mezcla 1:1 (0 dB) con otro clip | 74,6 % |

**Deteccion de copias frente a GraFPrint** (30.189 referencias, 65.518 clips no relacionados de 425 h; τ fijado para probabilidad de falso positivo de 10⁻⁷ por ventana: τ = 0,845 este modelo, 0,975 GraFPrint; porcentaje de pares detectados):

| Categoria | Este modelo | GraFPrint |
|---|--:|--:|
| Copias reales (6.491) | 99,6 | 90,6 |
| Copias sinteticas (1.800) | 85,9 | 55,2 |
| Hard negatives marcados (1.250; menor es mejor) | 4,4 | 3,7 |
| Copia exacta / MP3 64 / MP3 128 kbps | 99 / 100 / 100 | 100 / 100 / 100 |
| AAC 96 / Opus 32 kbps | 100 / 97 | 29 / 78 |
| Resample 44,1 kHz / ganancia −6 dB / recorte 0,5 s | 100 / 99 / 100 | 100 / 97 / 100 |
| Velocidad 1 % / reverb / paso bajo 4 kHz | 100 / 99 / 88 | 52 / 70 / 21 |
| Extracto de 3 s / incrustado en clip de 30 s | 97 / 79 | 8 / 12 |
| Mezclado a 20 / 10 / 5 / 0 / −5 dB SNR | 96 / 88 / 62 / 23 / 15 | 46 / 22 / 8 / 1 / 7 |

A τ = 0,90, la probabilidad de falso positivo por par (ventana no relacionada, referencia) es de 2,1 × 10⁻⁸.

**Comprobacion a escala completa** (319.848 referencias, 1.281 h, salto de consulta 0,5 s, τ = 0,92): probabilidad de falso positivo de 4,5 × 10⁻⁸; 99,5 % de 10.617 copias reales detectadas; 84,5 % de 2.400 copias sintéticas; 94,5 % de un conjunto independiente de 47.141 pares de copias reales; 84,6 % de 75.532 copias sintéticas independientes.

## Requisitos de hardware

- Con 80,3 M de parámetros y 3,9 GFLOP por ventana de 1 s, el modelo es muy ligero: inferencia viable en CPU y en cualquier GPU moderna.
- VRAM estimada: del orden de 0,3–0,5 GB en FP32 (tamaño del repositorio: 0,3 GB); no disponible una cifra oficial exacta.
- No requiere GPUs de gama datacenter: suficiente con GPUs de consumo (por ejemplo, una RTX 3060 o superior, aunque incluso portátiles con GPU integrada deberían manejarlo); el entrenamiento original usó 4 GH200, pero la inferencia es órdenes de magnitud más barata.
- Despliegue: PyTorch con `torch`, `torchaudio`, `soundfile` y `soxr`; los scripts `model.py` y `embed.py` incluidos cubren carga, embedding y test de coincidencia. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables, al no ser un LLM).
- Latencia y throughput: no disponibles como cifras oficiales; el coste de 3,9 GFLOP por ventana sugiere procesamiento de tiempo real en GPU y near real-time en CPU moderno.

## Comparativa con modelos similares

| | Neural audio fingerprint (LAION) | GraFPrint |
|---|---|---|
| Parametros | 80,3 M | no disponible |
| Embedding | 128-d, L2-normalizado | no disponible |
| Dominio de entrenamiento | 11 grupos sonoros (habla, musica, animales, efectos, etc.) | Musica |
| Copias reales detectadas | 99,6 % | 90,6 % |
| Copias sinteticas detectadas | 85,9 % | 55,2 % |
| Hard negatives marcados | 4,4 % | 3,7 % |
| Robustez a reverb / velocidad / paso bajo | 99 / 100 / 88 | 70 / 52 / 21 |
| Licencia | Apache 2.0 | no disponible (checkpoint publico) |
| Disponibilidad | Pesos y codigo en HuggingFace | Checkpoint publico en GitHub (GraFP) |

No se conocen otras alternativas comparables con datos publicados en la informacion disponible.

## Limitaciones y advertencias

- El propio autor recomienda tratar cada coincidencia como candidata y confirmarla con correlación cruzada de formas de onda cuando la precisión sea crítica.
- La robustez a mezclas degrada rápidamente con SNR bajo: 62 % a 5 dB, 23 % a 0 dB y 15 % a −5 dB; no es un sistema de separación de fuentes ni de identificación de música en ruido fuerte.
- Fragmentos muy cortos incrustados en clips largos son el punto débil relativo (79 % en clips de 30 s).
- La probabilidad de falso positivo, aunque muy baja por par (2,1–4,5 × 10⁻⁸), se acumula a escala: con miles de millones de comparaciones ventana-referencia pueden aparecer falsos positivos, por lo que el umbral τ debe ajustarse al tamaño de la base de datos.
- Sesgos del dataset de entrenamiento: la distribución está balanceada por diseño en 11 grupos, pero procede de audio web y de datasets públicos, por lo que el rendimiento en dominios no cubiertos (por ejemplo, audio industrial, médico o de alta especialización) no está evaluado.
- Idiomas y métricas de alucinación no aplicables: es un modelo de extracción de características, no generativo.
- Licencia Apache 2.0: sin restricciones para uso comercial, con la garantía estándar de ausencia de responsabilidad.
- Requiere audio mono a 16 kHz como entrada normalizada; mezclas estéreo deben reducirse a mono previamente (el propio pipeline de ejemplo lo gestiona).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/neural-audio-fingerprint
- GraFPrint (baseline comparado, checkpoint y codigo): https://github.com/chymaera96/GraFP

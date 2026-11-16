# kobimusic/dettato-drums

## Resumen

Dettato drums es la etapa de transcripción de percusión del sistema Dettato, un transcriptor audio-a-MIDI multi-instrumento desarrollado por KobiMusic. El modelo convierte una grabación de audio en eventos de percusión sobre las claves General MIDI (GM), cubriendo tanto baterías (pop, rock, jazz, electrónica) como percusión orquestal, con los timbales escritos a su altura tonal real.

El modelo se compone internamente de tres piezas: un modelo de batería (188.764 parámetros), un modelo orquestal promediado sobre tres copias (1.606.407 parámetros cada una) y un router a nivel de canción que decide qué rama usar. En total suma 5.017.049 parámetros, un tamaño muy reducido que lo hace apto para ejecución en CPU. Su relevancia radica en que resuelve la transcripción de percusión orquestal con altura tonal (timbales), un caso que los transcriptores de batería convencionales no cubren.

El modelo forma parte de la colección Dettato junto a `dettato` (transcriptor de notas), `dettato-evidence` (reparación de notas) y `dettato-grouper` (agrupación de pistas por instrumento). Se distribuye bajo licencia Apache-2.0 y requiere audio mono a 44,1 kHz proveniente de una fuente grabada a 40 kHz o más.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 2-D sobre bandas mel + GRU por banda por frame + conv temporal / BiGRU / atención de canción + cabezas BiGRU por familia de percusión; modelo orquestal con banda baja de resolución de altura (STFT de 6144 puntos, 120 bandas log-frecuencia) y adaptador BiGRU + self-attention |
| Parametros totales | 5.017.049 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa la grabación completa para el pooling del router) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` |

## Arquitectura y entrenamiento

El modelo de batería usa una CNN 2-D sobre las bandas mel, una GRU por banda para cada frame, seguida de convolución temporal, BiGRU y atención a nivel de canción, con una cabeza BiGRU pequeña por familia de percusión que produce onset y velocidad para las claves GM 27-87. El modelo orquestal reutiliza esa red y añade una banda baja de resolución de altura (STFT de 6144 puntos, 120 bandas log-frecuencia, 24 por octava) más un adaptador (BiGRU + self-attention) que corrige los logits de batería para percusión de concierto y añade una cabeza de timbales. El router, integrado en el modelo orquestal, produce un valor por grabación a partir de los estados del adaptador agrupados sobre toda la grabación; si es >= 0,5 se usa el modelo orquestal, en caso contrario el de batería sin cambios. Los hits se obtienen como picos locales de la probabilidad de onset por clave (umbral 0,5, 50 frames por segundo).

El entrenamiento se realizó sobre audio multi-instrumento sintético con etiquetas de percusión exactas, generado internamente y no publicado; la percusión orquestal usa las librerías de samples Sonatina Symphonic Orchestra, VSCO-2 Community Edition y VCSL. El modelo orquestal también vio grabaciones reales sin percusión de MUSDB18-HQ y MusicNet. El modelo de batería se entrenó únicamente con audio sintético. No se usaron grabaciones ni etiquetas de benchmark para entrenamiento ni para elegir umbrales y checkpoints; estos se seleccionaron solo con audio sintético reservado.

## Capacidades

- Transcripción de batería a eventos MIDI sobre claves GM 27-87 (kits de pop, rock, jazz y electrónica).
- Transcripción de percusión orquestal: caja de concierto, bombo, platillos y triángulo en sus claves GM.
- Detección de timbales a su altura tonal real en las claves 41-53 (F2-F3), convención GS Orchestra (clave 43 = G2, 48 = C3).
- Salida de eventos con `onset` (segundos), `offset` (100 ms por hit), `pitch` (clave GM), `is_drum` y `velocity` (0-1).
- Enrutamiento automático por grabación entre modelo de batería y modelo orquestal.
- Ejecución en CUDA o CPU (`DrumTranscriber.from_pretrained("cuda")` o `"cpu"`).
- Integración como pista de percusión dentro de la transcripción completa mediante la herramienta de línea de comandos `dettato`.

## Casos de uso

- Transcripción de batería para producción musical: a partir de una grabación de referencia se obtienen los hits con clave GM y velocidad, listos para importar en un DAW o sustituir el kit de batería.
- Digitalización de partituras de percusión orquestal: el modelo orquestal detecta timbales a su altura real, lo que permite reconstruir la parte de timbal de una obra clásica a partir de una grabación.
- Generación de datasets etiquetados de percusión: la salida estructurada (`onset`, `pitch`, `velocity`) sirve para anotar automáticamente corpus de audio con fines de investigación o entrenamiento.
- Análisis musicológico asistido: la comparación de hits detectados entre interpretaciones permite estudiar timing y dinámica de la percusión en grabaciones de dominio público.
- Preproducción y edición rítmica: la detección de onsets por clave facilita cuantizar o alinear pistas de percusión en flujos de trabajo de postproducción.
- Integración en pipelines de transcripción completos: al formar parte de Dettato junto a los modelos de notas, evidencia y agrupación, permite obtener una transcripción multi-instrumento completa con pista de percusión separada.

## Benchmarks y rendimiento

Drum onsets dentro de 50 ms con la clave GM exacta: F1 por grabación, promediado sobre las grabaciones de cada conjunto con etiquetas de percusión.

| Conjunto | Modelo de batería solo | Dettato drums | Mirelo A2M v1.1 (autoreportado) | MuScriptor 1.3B |
|---|---|---|---|---|
| RWC Classical | 11,20 | **39,52** | 32,5 | 23,7 |
| RWC Royalty-Free | 65,40 | **65,40** | 50,3 | 36,5 |
| RWC Popular | 50,57 | **50,57** | - | 42,1 |
| Slakh2100 test | 54,43 | **54,43** | - | 41,0 |
| RWC Jazz | 35,54 | **36,26** | - | 31,3 |
| RWC Genre | 34,24 | **36,29** | - | 29,2 |

Todas las grabaciones de RWC Popular y Slakh se enrutan al modelo de batería, por lo que esas filas coinciden exactamente con sus números; 14 de 35 grabaciones de RWC Jazz y 14 de 76 de RWC Genre van al modelo orquestal. En RWC Classical, la puntuación de percusión promedia cuatro grabaciones: C003 (Beethoven 5) y C008 (obertura de Figaro) son timbales (0 → 54,3 y 63,1); C010 (Danubio Azul) es caja de concierto, bombo y triángulo (44,8 → 40,7, ya que el modelo orquestal también escribe los timbales de esa pieza, que RWC etiqueta como parte con altura); C004 tiene un solo golpe de platillo en unos diez minutos (0 para todos los modelos).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 5,0 M de parámetros los pesos en precisión completa ocupan del orden de decenas de MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU CUDA moderna es suficiente; también se ejecuta en CPU (`DrumTranscriber.from_pretrained("cpu")`).
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual (RTX 4090, RTX 3060, etc.) e incluso en CPU.
- Opciones de despliegue: paquete `dettato` (instalación vía `pip install git+https://github.com/kobimusic/dettato`), API `DrumTranscriber` y herramienta de línea de comandos `dettato`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 percusión (RWC Classical / Popular) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dettato drums | 5,0 M | no disponible | 39,52 / 50,57 | Apache-2.0 | Hugging Face + GitHub |
| Mirelo A2M v1.1 | no disponible | no disponible | 32,5 / - | no disponible | no disponible |
| MuScriptor 1.3B | 1,3 B | no disponible | 23,7 / 42,1 | no disponible | no disponible |

Dettato drums supera a MuScriptor 1.3B en todos los conjuntos reportados pese a tener unos tres órdenes de magnitud menos parámetros, y supera a Mirelo A2M v1.1 en RWC Classical y RWC Royalty-Free (este último comparado con datos autoreportados por Mirelo).

## Limitaciones y advertencias

- Requiere una fuente grabada a 40 kHz o más; el audio de menor tasa (muchos MP3 de sitios de vídeo, ficheros a 16 kHz) no produce percusión.
- El router decide una sola vez por grabación: una pieza que mezcle batería y percusión orquestal se transcribe con un único modelo.
- Los timbales solo se cubren en las claves 41-53 (F2-F3).
- En Slakh2100, 12 de los 151 ficheros MIDI del conjunto de test formaron parte del material de entrenamiento del modelo orquestal; la puntuación de Slakh proviene del modelo de batería (todas las canciones de test se enrutan a él), por lo que esa fila no se ve afectada.
- Los umbrales y el conjunto orquestal se eligieron solo con audio sintético reservado, no con datos de benchmark.
- El modelo de batería se entrenó únicamente con audio sintético, lo que puede introducir un sesgo hacia las características acústicas de las librerías de samples empleadas.
- Riesgo de alucinación de hits en pasajes ambiguos: los hits se derivan de picos de probabilidad con umbral fijo de 0,5, sin verificación posterior.
- El dataset de entrenamiento no se publica, lo que limita la reproducibilidad completa del entrenamiento.
- Aunque la licencia del modelo es Apache-2.0, los datos de entrenamiento incluyen MUSDB18-HQ bajo términos de investigación / no comercial y MusicNet bajo las licencias de su dataset; conviene revisar las implicaciones antes de un uso comercial intensivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kobimusic/dettato-drums
- Repositorio del paquete Dettato: https://github.com/kobimusic/dettato
- Colección Dettato: https://huggingface.co/collections/kobimusic/dettato
- Modelo transcriptor de notas: https://huggingface.co/kobimusic/dettato
- Modelo de reparación de notas: https://huggingface.co/kobimusic/dettato-evidence
- Modelo de agrupación de pistas: https://huggingface.co/kobimusic/dettato-grouper

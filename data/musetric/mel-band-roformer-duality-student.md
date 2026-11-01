# musetric/mel-band-roformer-duality-student

## Resumen
Mel-Band RoFormer Duality student es un modelo de separación de fuentes de audio (voces e instrumental) desarrollado por musetric como destilación del modelo de Aname-Tommy Mel-Band-Roformer_Duality. Su propósito es ofrecer una versión mucho más ligera y rápida del modelo profesor, pensada para ejecutarse en GPUs de teléfonos móviles dentro de la aplicación Musetric, manteniendo una calidad de separación cercana a la del original.

El modelo conserva la arquitectura Mel-Band RoFormer del profesor, con su división en bandas, sus seis pares de transformadores de tiempo y de banda y su estimador de máscaras, pero reduce el número de parámetros de 228,2 M a 105,1 M mediante técnicas de pooling por pares, fusión de bandas altas y compresión de baja categoría en el estimador de máscaras. El resultado es un modelo que, según el autor, se ejecuta entre 3,39 y 3,51 veces más rápido que el profesor en GPUs móviles (Adreno 750 y Adreno 660) mediante WebGPU.

Es relevante porque demuestra que es posible llevar separación musical de calidad a dispositivos con recursos limitados, un caso de uso creciente en aplicaciones de edición de audio en tiempo real. El modelo se distribuye en fp32 con pesos safetensors y licencia Apache 2.0, y está pensado como fuente para exportaciones a ONNX y para futuras destilaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mel-Band RoFormer (transformer con atención temporal y de banda, mask estimator) |
| Parámetros totales | 105.125.708 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 11 s (1101 frames STFT, hop 441) a 44,1 kHz estéreo |
| Tipos de cuantización | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32) + config.yaml |

## Arquitectura y entrenamiento
El modelo es un Mel-Band RoFormer con seis pares de transformadores de tiempo y de banda. Frente al profesor, introduce tres reducciones principales: pooling por pares (los pares 0-1 a tasa completa, los pares 2-3 con frames promediados por 4 y los pares 4-5 por 2, con reinserción del cambio a tasa completa mediante x + up(F(down x) − down x)); fusión de bandas altas (las bandas desde la 44 en adelante se fusionan en pares vecinos, pasando de 60 a 52 tokens de banda); y compresión del estimador de máscaras (la capa central 1536×1536 se reduce a rango 128 y el estimador opera sobre pares de frames). Además, los pares 0-1 ven reducida la atención temporal a 32 frames por lado con 4 de 8 cabezas, el feed-forward a 768 unidades y el transformador de banda a un mapa lineal residual.

El entrenamiento consistió en destilación de conocimiento desde el profesor, partiendo de sus pesos y ajustando cada parte estrechada mediante un ajuste al profesor sobre los datos de entrenamiento. Se realizaron aproximadamente 15 horas de entrenamiento en total, con una función de pérdida basada en STFT multi-resolución L1 sobre las voces del profesor más sus máscaras, un término contra el sangrado vocal en pausas y un término contra salidas más fuertes que la voz real. Los datos de entrenamiento son 2.829 pistas con licencia abierta (48,8 h): 2.155 clips de 30 s de FMA, 656 a cappellas de ccMixter y 18 canciones de archive.org, ccMixter, Jamendo y joshwoodward.com. No se usó material NonCommercial, NoDerivatives ni ShareAlike.

## Capacidades
- Separación de voces e instrumental en pistas musicales estéreo a 44,1 kHz.
- Procesamiento por ventanas de 11 s con solapamiento (cada 8 s según el separador de referencia).
- Salida de máscaras complejas por bin de frecuencia para reconstrucción de stems.
- Exportable a ONNX para despliegue en navegador y dispositivos móviles.
- Ejecución en WebGPU en GPUs móviles (probado en Adreno 750 y Adreno 660).
- Base para futuras destilaciones y ajustes finos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de audio.

## Casos de uso
- **Aplicaciones móviles de karaoke o edición musical**: el modelo puede separar voces e instrumental en el propio teléfono gracias a su reducido tamaño (105 M parámetros) y a su velocidad (3,4-3,5× el profesor en GPUs móviles), permitiendo eliminar la voz de una canción sin subir el audio a un servidor.
- **Generación de pistas de acompañamiento para práctica musical**: un músico puede obtener el instrumental de una canción para tocar o cantar encima, con ventanas de 11 s procesadas cada 8 s que cubren canciones completas de forma continua.
- **Remezclas y mashups**: la separación de stems permite aislar la voz para reutilizarla sobre otra base instrumental, con la ventaja de que el modelo está entrenado contra el sangrado vocal en pausas, lo que reduce artefactos en los silencios.
- **Preprocesado en pipelines de análisis musical**: extraer la componente vocal para tareas posteriores como transcripción de letras, análisis de entonación o detección de género, ejecutando el modelo en local sin dependencias de la nube.
- **Prototipado e investigación en separación de fuentes**: al ser una destilación del profesor con pesos abiertos y licencia Apache 2.0, sirve como punto de partida para experimentar con arquitecturas Mel-Band RoFormer más ligeras o para comparar técnicas de destilación.
- **Exportación a ONNX para aplicaciones web**: el modelo es la fuente desde la que se exporta el núcleo ONNX de la app Musetric, por lo que puede integrarse en aplicaciones web que necesiten separación de audio en el navegador mediante WebGPU u otros backends.
- **Educación y demos interactivas**: su tamaño reducido permite incluirlo en demostraciones o cuadernos interactivos que se ejecuten en hardware modesto, mostrando el funcionamiento de un separador de fuentes basado en transformers.

## Benchmarks y rendimiento
El autor proporciona datos de velocidad y de calidad relativos al profesor, pero no benchmarks absolutos estándar (SDR, SIR, SAR) sobre MUSDB18-HQ más allá de las diferencias indicadas.

| Métrica | Resultado |
|---|---|
| Parámetros | 105,1 M (profesor: 228,2 M) |
| Velocidad en Galaxy S24 Ultra (Adreno 750, WebGPU) | 3,51× más rápido que el profesor |
| Velocidad en OnePlus 9RT (Adreno 660, WebGPU) | 3,39× más rápido que el profesor |
| SDR mediana de voces en MUSDB18-HQ | 0,80 dB por debajo del profesor |
| SDR media de voces en MUSDB18-HQ | 1,13 dB por debajo del profesor |
| Ventanas de 10 s con más de 3 dB de caída | 13 de 50 pistas de test |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, al no ser un modelo de lenguaje.

## Requisitos de hardware
- **VRAM estimada**: con 105,1 M parámetros en fp32, los pesos ocupan aproximadamente 420 MB; la inferencia sobre ventanas de 11 s requiere memoria adicional para activaciones, estimada en torno a 1-2 GB en fp32 según el tamaño de lote.
- **GPU recomendadas**: cualquier GPU moderna con al menos 2 GB de VRAM para fp32; en movilidad, Adreno 750 (Galaxy S24 Ultra) y Adreno 660 (OnePlus 9RT) han sido probadas vía WebGPU.
- **Consumer GPU**: cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060 o superiores; también en GPUs integradas modestas para lotes pequeños.
- **Opciones de despliegue**: PyTorch nativo (pesos safetensors + config.yaml), exportación a ONNX para ejecución en navegador con WebGPU, y el separador de referencia `MelBandRoformerSeparator` del repositorio musetric/lab.
- **Latencia y throughput**: el autor reporta 3,39-3,51× la velocidad del profesor en GPUs móviles, pero no se proporcionan tiempos absolutos por ventana en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Calidad relativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mel-Band RoFormer Duality student (este) | 105,1 M | 11 s a 44,1 kHz | 0,80 dB SDR mediana por debajo del profesor | Apache 2.0 | HuggingFace, PyTorch, ONNX |
| Mel-Band RoFormer Duality (profesor) | 228,2 M | 11 s a 44,1 kHz | Referencia | no disponible en la información | HuggingFace (Aname-Tommy) |
| Otros separadores Mel-Band RoFormer | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables (Demucs, Spleeter, MDX-Net) en la información proporcionada, por lo que la comparativa se limita al par estudiante-profesor.

## Limitaciones y advertencias
- **Pérdida de calidad respecto al profesor**: 0,80 dB de SDR mediana y 1,13 dB de media por debajo en voces sobre MUSDB18-HQ; en 13 de las 50 pistas de test una ventana de 10 s queda más de 3 dB por debajo del profesor.
- **Pérdida de voz en frecuencias bajas**: en estudiantes previos de esta forma, algunas ventanas perdían más voz fuerte por debajo de 4 kHz que el profesor; el autor advierte de este riesgo.
- **Amplificación de fugas instrumentales**: donde el profesor deja pasar una pieza tenue de un instrumento a las voces, el estudiante puede amplificarla; el entrenamiento lo redujo pero no lo eliminó.
- **Ventana fija de 11 s**: entrenado y validado con ventanas de 11 s (1101 frames STFT, hop 441); usos con ventanas distintas pueden degradar la calidad.
- **Sesgos de datos**: entrenado con 2.829 pistas de licencia abierta (FMA, ccMixter, archive.org, Jamendo, joshwoodward.com), lo que puede limitar la generalización a géneros o estilos poco representados.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo base (profesor) tiene licencia no especificada en la información disponible, lo que conviene verificar antes de un despliegue comercial.
- **No es un modelo de lenguaje**: no soporta texto, tool calling ni razonamiento; cualquier uso fuera de separación de audio queda fuera de su ámbito.
- **Riesgo de artefactos en pasajes complejos**: la compresión del estimador de máscaras y el pooling pueden introducir artefactos en mezclas densas o con instrumentación muy superpuesta.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/musetric/mel-band-roformer-duality-student
- Modelo profesor: https://huggingface.co/Aname-Tommy/Mel-Band-Roformer_Duality
- Repositorio Musetric: https://github.com/musetric/musetric
- Código del modelo (PooledMelBandRoformer): https://github.com/musetric/lab/blob/64ab58494b760c0bf724e873c16d32a2f60ee950/musetric_toolkit/separate_audio/roformer/pooled_mel_band_roformer.py
- Paper de referencia (arXiv:2310.01809): https://arxiv.org/abs/2310.01809
- Dataset FMA: https://github.com/mdeff/fma
- ccMixter: https://ccmixter.org

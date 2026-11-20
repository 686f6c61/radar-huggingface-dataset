# apple/DepthPro2

## Resumen

Depth Pro 2 es un modelo de estimación de profundidad monocular métrica desarrollado por Apple Machine Learning Research. A diferencia de los modelos de lenguaje, su tarea es predecir un mapa de profundidad en metros para cada píxel de una imagen o de una secuencia de vídeo, a la resolución completa de la entrada. La familia se publica en cuatro tamanos (S, B, L y H+) que comparten una arquitectura comun basada en un transformer multi-vista seguido de un decodificador DPT por fotograma, y todos ellos se apoyan en un estimador de distancia focal independiente de 23,5 M de parametros.

La innovacion principal es la consistencia temporal: el transformer procesa conjuntamente uno o varios fotogramas y, a partir del primer tercio de sus bloques, alterna atencion intra-fotograma y atencion entre fotogramas. Esto permite obtener profundidad nitida en los bordes de los objetos y estable entre fotogramas consecutivos, algo que los metodos de un solo fotograma no consiguen por si solos. El modelo tambien predice distancia focal cuando esta no se conoce, lo que simplifica su uso con camaras arbitrarias y en directo.

Es relevante ahora porque cubre un hueco practico: obtener profundidad metrica densa y temporalmente coherente desde una camara convencional, sin hardware estereo ni LiDAR, y con variantes que van desde 24 M hasta 872 M de parametros. La licencia, sin embargo, es exclusivamente de investigacion, lo que condiciona su adopcion en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multi-vista con atencion alterna intra e inter-fotograma, seguido de decodificador DPT por fotograma |
| Parametros totales | 24 M (S), 97 M (B), 334 M (L), 872 M (H+); estimador focal adicional de 23,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa 16 fotogramas por lote en el ejemplo de video) |
| Tipos de cuantizacion | no disponible; el ejemplo oficial usa bfloat16 en GPU |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | Apple Machine Learning Research Model License (apple-amlr), solo para investigacion |
| Formato de pesos | no disponible (carga via `DepthPro2.from_pretrained`, libreria `depth-pro-2`) |

## Arquitectura y entrenamiento

El modelo se compone de dos etapas. Primero, un transformer multi-vista procesa conjuntamente uno o varios fotogramas de entrada; tras el primer tercio de sus bloques, la atencion alterna entre atencion dentro de cada fotograma y atencion entre fotogramas, lo que aporta la coherencia temporal. Despues, un decodificador DPT ensambla tokens de varios bloques en mapas de caracteristicas a resoluciones de 1/32 hasta 1/4 de la entrada y predice un mapa de profundidad inversa por fotograma. La profundidad se expresa en metros y se marca como infinita donde la escena es infinitamente lejana, como el cielo.

Los tamanos disponibles son S (24 M de parametros, 97 MB), B (97 M, 386 MB), L (334 M, 1,3 GB) y H+ (872 M, 3,5 GB). Todos comparten un estimador de distancia focal (`apple/DepthPro2-focal`, 23,5 M de parametros, 94 MB) que predice la focal cuando no esta registrada en los metadatos. No se han publicado en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de ajuste fino especificas.

## Capacidades

- Estimacion de profundidad metrica densa (un valor en metros por pixel) desde una unica imagen.
- Estimacion de profundidad sobre secuencias de video con consistencia temporal entre fotogramas.
- Funcionamiento sobre directo o live feed, segun el ejemplo de linea de comandos del repositorio.
- Prediccion de distancia focal cuando esta no se conoce, mediante el modelo auxiliar `DepthPro2-focal`.
- Salida a la resolucion completa de la entrada, con bordes nitidos en los contornos de objetos.
- Procesamiento por lotes de fotogramas (16 por lote en el ejemplo de video).
- Manejo explicito de profundidad infinita para regiones como el cielo.
- No dispone de capacidades de generacion de texto, codigo, tool calling ni agentes; es un modelo puramente de vision.

## Casos de uso

- Reconstruccion 3D y fotogrametria: el mapa de profundidad metrica por pixel permite generar nubes de puntos y mallas a partir de fotografias convencionales, con la ventaja de que la escala es metrica y no relativa.
- Efectos de desenfoque y reenfoque post-captura: la profundidad densa y nitida en los bordes permite separar primer plano y fondo con precision en edicion fotografica y de video.
- Robotica y navegacion: la profundidad metrica en tiempo real desde una camara monocular sirve para evitar obstaculos y planificar rutas sin depender de LiDAR o vision estereo.
- Realidad aumentada: la consistencia temporal del modelo reduce el parpadeo del plano de oclusion, lo que mejora la integracion de objetos virtuales en secuencias de video.
- Analisis de video y seguimiento: la prediccion por fotograma con baja fluctuacion (jitter) facilita el seguimiento de objetos y la estimacion de trayectorias en el espacio 3D.
- Captura de movimiento y avatares: a partir de video monocular se puede extraer geometria de la escena y del sujeto para animacion y reconstruccion volumetrica.
- Inspeccion industrial y agricultura de precision: la medicion de distancias en metros sobre imagenes de camara permite estimar tamanos y distancias de objetos en campo.

## Benchmarks y rendimiento

La model card publica una comparacion cualitativa de nitidez de bordes (Boundary F1, mayor es mejor) frente a consistencia temporal (Jitter, menor es mejor), promediada sobre los conjuntos Sintel y Spring, y afirma que Depth Pro 2 supera a metodos previos de un solo fotograma y de multiples fotogramas. No se proporcionan los valores numericos de esas metricas en la informacion disponible, por lo que no se incluye una tabla cuantitativa.

| Metrica | Resultado | Comparacion |
|---|---|---|
| Boundary F1 (Sintel + Spring) | no disponible numericamente | superior a metodos de un fotograma y multi-fotograma, segun el autor |
| Jitter temporal (Sintel + Spring) | no disponible numericamente | inferior a metodos previos, segun el autor |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de lenguaje, ya que el modelo no es linguistico.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, H+ (872 M de parametros) en bfloat16 ocupa aproximadamente 1,7 GB solo en pesos, a lo que hay que sumar activaciones y el decodificador a resolucion completa; S (24 M) es mucho mas ligero.
- GPU recomendadas: el ejemplo oficial usa CUDA con bfloat16; no se especifican modelos concretos de GPU (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: probablemente si para los tamanos S, B y L, y previsiblemente tambien para H+ en tarjetas con suficiente VRAM, aunque no hay confirmacion oficial en la informacion disponible.
- Opciones de despliegue: instalacion via `pip install "git+https://github.com/apple-aiml-research/ml-depth-pro-2"`, uso en Python con PyTorch y CUDA, y linea de comandos incluida en el repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos cuantitativos de modelos comparables (por ejemplo, Depth Pro original u otros estimadores monoculares) mas alla de la mencion generica a "metodos previos de un solo fotograma y de multiples fotogramas" en la grafica de compromiso nitidez-consistencia. Por tanto, la comparativa cuantitativa se marca como no disponible.

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Depth Pro 2 (S/B/L/H+) | 24 M a 872 M | imagen o video, 16 fotogramas por lote en el ejemplo | apple-amlr, solo investigacion | Hugging Face (repos por tamano) |
| Metodos previos de un fotograma | no disponible | imagen unica | no disponible | no disponible |
| Metodos previos multi-fotograma | no disponible | secuencia de video | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restringida: los pesos se publican bajo la Apple Machine Learning Research Model License, exclusivamente para investigacion; el uso comercial no esta permitido segun la model card.
- No es un modelo de lenguaje: no genera texto, codigo ni mantiene conversaciones, y no soporta tool calling ni agentes.
- Riesgo de error en escenas ambiguas: la profundidad monocular puede fallar en superficies sin textura, reflejos, transparencias o geometrias repetitivas; no se detallan en la informacion disponible los sesgos concretos.
- Dependencia de la distancia focal: cuando no se conoce, se usa el estimador auxiliar, lo que anade una fuente de error en la escala metrica.
- Profundidad infinita: las regiones como el cielo se marcan como infinitas, lo que requiere tratamiento especial en pipelines posteriores.
- Consistencia temporal limitada al lote: el ejemplo procesa 16 fotogramas por lote, por lo que la coherencia entre lotes no esta garantizada en la informacion disponible.
- Sin datos publicados de sesgos demograficos, geograficos o de otro tipo, ni de robustez ante condiciones adversas de iluminacion o clima.
- Repositorio con 0 descargas y 0,0 GB de tamano reportado en el momento de la consulta, lo que sugiere una publicacion muy reciente y poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apple/DepthPro2
- Variante S: https://huggingface.co/apple/DepthPro2-S
- Variante B: https://huggingface.co/apple/DepthPro2-B
- Variante L: https://huggingface.co/apple/DepthPro2-L
- Variante H+: https://huggingface.co/apple/DepthPro2-H
- Estimador de focal: https://huggingface.co/apple/DepthPro2-focal
- Repositorio GitHub: https://github.com/apple-aiml-research/ml-depth-pro-2
- Pagina del proyecto: https://apple-aiml-research.github.io/ml-depth-pro-2/
- Licencia del modelo: https://github.com/apple-aiml-research/ml-depth-pro-2/blob/main/LICENSE_MODEL
- Informe tecnico: https://arxiv.org/abs/TODO (enlace pendiente en la model card)

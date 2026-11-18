# gregology/sheet-music-scanner

## Resumen

Sheet Music Scanner es un modelo de reconocimiento óptico de partituras (OMR) desarrollado por el usuario independiente gregology, diseñado específicamente para ejecutarse en dispositivo (on-device) en una aplicación iOS para iPad. El modelo resuelve el problema de convertir una fotografía de una página de música para un solo instrumento en una secuencia textual de notas, sin necesidad de servidor ni conexión a internet. Está compuesto por dos redes pequeñas: una U-Net que localiza y endereza cada pentagrama en la foto, y un transformer CTC que lee cada pentagrama una vez enderezado.

La relevancia del modelo radica en su enfoque de entrenamiento completamente sintético: nunca vio una fotografía real durante el entrenamiento. Todas las páginas de entrenamiento fueron renderizadas en Blender a partir de partituras cuyo contenido real se conocía, lo que permite generar datos etiquetados de forma automática y a gran escala. A pesar de ello, el autor reporta que el modelo lee fotos reales de iPhone mejor que el conjunto de test sintético. El tamaño total es de 7,8 millones de pesos entre ambas redes, con un repositorio de 0,1 GB.

El modelo se distribuye bajo licencia MIT, con pesos en formato PyTorch y programas Core ML listos para su uso en iOS. La arquitectura está optimizada para restricciones de dispositivo: formas de entrada fijas y ausencia de bucles de decodificación, lo que lo hace adecuado para inferencia en tiempo real en hardware móvil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net (finder) + transformer CTC (reader) |
| Parametros totales | 7,8 millones (1,56 M finder + 6,22 M reader) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada fija: 160×1600 píxeles por línea) |
| Tipos de cuantizacion | 16-bit (finder, 3 MB) y 32-bit (reader, 24 MB) en Core ML |
| Idiomas soportados | no disponible (salida en notación textual de música) |
| Licencia | MIT |
| Formato de pesos | PyTorch y Core ML (.mlpackage) |

## Arquitectura y entrenamiento

El sistema se compone de dos redes. El finder es una U-Net de 1,56 millones de pesos que recibe la foto completa reducida a 768×1024 píxeles en escala de grises y predice, por píxel, si está sobre un pentagrama, la proximidad a su línea central y el espaciado entre líneas. A partir de estas marcas, geometría determinista traza cada línea central, une los pentagramas y coloca las cinco líneas. Posteriormente, cada pentagrama se recorta de la foto original, se sigue por slices y se ajusta a la tinta, reduciendo el error de 0,42 a 0,02 espacios de pentagrama. Cada pentagrama se endereza a una imagen de 1600×160 píxeles con 11,4 píxeles por espacio de pentagrama.

El reader es un transformer CTC de 6,22 millones de pesos. Convoluciones convierten la línea en 200 columnas de características; cuatro capas de self-attention (256 de ancho, 4 cabezas) permiten que cada columna vea la línea completa, ya que el significado de una nota depende de la clave y tonalidad al inicio. Una capa lineal puntúa 1.275 tokens por columna y CTC convierte las columnas en tokens eliminando repeticiones y blancos. El modelo escribe la posición de la nota en el pentagrama (por ejemplo, `note-S3_4` para una negra en el tercer espacio) y un postprocesado aplica clave, tonalidad y compás. El entrenamiento se realizó exclusivamente con datos sintéticos renderizados en Blender a partir de partituras con verdad conocida.

## Capacidades

- Reconocimiento óptico de partituras (OMR) a partir de fotografías de páginas de música para un solo instrumento.
- Detección y seguimiento de pentagramas en fotos con inclinación, curvatura, sombras y ángulos diversos.
- Enderezado geométrico de pentagramas para normalizar la entrada del lector.
- Lectura de notas y silencios con posición en el pentagrama, duración y alteraciones accidentales.
- Salida en notación textual tokenizada (`clef-G2`, `key-2b`, `time-6/8`, `note-Bb3_8`, `barline`, etc.).
- Verificación de compases (measure check) como regla posterior al lector para corregir errores.
- Ejecución on-device en Core ML sin servidor.
- No soporta tool calling, agentes ni razonamiento multi-step.
- Capacidades multilingües no aplicables (salida musical, no texto natural).

## Casos de uso

- Digitalización de partituras para músicos: el modelo convierte una foto de iPhone de una página de música en una secuencia de notas legible por software, adecuado para músicos que quieren transcribir rápidamente partituras en papel sin escanear ni introducir notas manualmente.
- Aplicación iOS para iPad en directo: al ejecutarse en Core ML con 27 MB totales, puede integrarse en una app que procese fotos en el dispositivo sin conexión, útil en ensayos o conciertos donde no hay red.
- Archivo y catalogación de colecciones musicales: permite procesar lotes de fotos de partituras para generar índices textuales de notas, facilitando la búsqueda y organización de un repertorio personal.
- Asistencia a la práctica instrumental: la salida tokenizada con posiciones, duraciones y alteraciones puede alimentar un sintetizador o una vista de partitura para comparar la interpretación del músico con la partitura original.
- Investigación en OMR con datos sintéticos: el enfoque de entrenamiento exclusivamente con renders de Blender y su evaluación en fotos reales sirve como caso de estudio para investigar la brecha entre datos sintéticos y reales en visión por computador.
- Corrección y verificación de transcripciones: la regla de verificación de compases posterior al lector puede usarse para validar transcripciones existentes y detectar notas mal leídas en flujos de digitalización semiautomáticos.
- Educación musical: una app podría mostrar al estudiante la secuencia de notas detectada de una foto de su partitura y señalar discrepancias con la versión de referencia.

## Benchmarks y rendimiento

| Conjunto de test | Imagenes | Notas | Notas erroneas | Tras verificacion de compas |
|---|---|---|---|---|
| Fotos reales del autor (planas, curvadas, con sombra, anguladas, en atril) | 81 | 13.127 | 1,10% | 0,21% |
| Fotos de partituras inventadas por el autor | 33 | 6.732 | 0,53% | 0,53% |
| Encuesta: fotos limpias de partes reales de cuarteto de cuerda | 434 | 70.278 | 3,32% | 2,17% |
| t1: fotos sinteticas no vistas en entrenamiento | 2.000 | 398.148 | 2,86% | 2,91% |

El autor reporta que en CPU aproximadamente una de cada diez fotos lee una nota o unas pocas de forma distinta. El objetivo declarado es del 99,9% de notas correctas en foto plana y bien iluminada y del 99,5% en foto curvada o mal iluminada; con la verificación de compases, las fotos reales del autor alcanzan el 99,8% en todas las condiciones y el 99,94% en las 20 planas (2 notas erróneas de 3.234). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el finder ocupa 3 MB (16-bit) y el reader 24 MB (32-bit) en Core ML, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: RTX 4090 para evaluación y desarrollo (el autor puntuó el modelo en una RTX 4090); para inferencia real se ejecuta en el chip del iPad/iPhone vía Core ML.
- Cabe en cualquier GPU consumer e incluso en hardware móvil Apple (Neural Engine/GPU integrada).
- Opciones de despliegue: Core ML en iOS/iPadOS (formato de la app), PyTorch en Python mediante el paquete `sheet-model` instalable desde GitHub.
- Latencia y throughput: no disponibles de forma numérica; el diseño sin bucles y con formas fijas está pensado para inferencia en tiempo real en el dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sheet Music Scanner (gregology) | 7,8 M | 768×1024 (finder), 160×1600 (reader) | U-Net + transformer CTC, datos sintéticos, on-device | MIT | Hugging Face, GitHub |
| homr | no disponible | no disponible | Modelo OMR open source citado por el autor como el mejor que encontró; mantiene el decodificador en CPU | no disponible | no disponible en la información proporcionada |
| Alternativas OMR comerciales (Audiveris, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar cualitativamente con homr, que el autor menciona como el mejor modelo abierto que encontró y que mantiene su decodificador en CPU por limitaciones de Core ML. No se dispone de datos de parámetros, contexto ni rendimiento de homr en la información proporcionada.

## Limitaciones y advertencias

- El conjunto de fotos reales de evaluación es pequeño (81 imágenes de diez páginas), por lo que las métricas de alta precisión (99,94%) se basan en pocas notas y no son concluyentes.
- La encuesta con partes reales de cuarteto de cuerda muestra un 3,32% de notas erróneas (2,17% tras la verificación), notablemente peor que las fotos propias del autor, lo que indica sensibilidad a condiciones de captura y tipos de partitura.
- El modelo está diseñado para páginas de música de un solo instrumento; no se especifica soporte para partituras orquestales o de múltiples voces simultáneas.
- Entrenado exclusivamente con datos sintéticos de Blender; aunque el autor reporta buena generalización a fotos reales, existe riesgo de sesgo hacia las condiciones de renderizado y de fallo en notaciones no representadas en el conjunto sintético.
- El reader se distribuye en 32-bit porque a 16 bits leyó todos ceros en el simulador de iOS en un Mac Intel; el rendimiento a 16 bits en un teléfono no se ha probado.
- No es un modelo de lenguaje: no soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües.
- Licencia MIT, que permite uso comercial, pero el autor no ofrece garantías sobre la exactitud en producción; se recomienda validar con la verificación de compases y revisión humana.
- Riesgo de alucinación en el sentido de notas añadidas o mal leídas; el autor cuantifica aproximadamente una de cada diez fotos con algún error en CPU.

## Enlaces

- Hugging Face: https://huggingface.co/gregology/sheet-music-scanner
- Dataset de evaluación: https://huggingface.co/datasets/gregology/sheet-music-scanner-eval
- Repositorio del modelo: https://github.com/gregology/sheet-music-scanner-model
- Paquete instalable: `pip install "sheet-model @ git+https://github.com/gregology/sheet-music-scanner-model"`
- Código de geometría (finder): https://github.com/gregology/sheet-music-scanner-model/blob/main/src/sheet_model/finder.py
- Código de líneas: https://github.com/gregology/sheet-music-scanner-model/blob/main/src/sheet_model/lines.py

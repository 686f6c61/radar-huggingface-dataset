# JaneliaSciComp/bigstitcher-embedding-translation-stack64

## Resumen

BigStitcher interest point embedding (translation invariant, stacked extents, stack64) es una pequeña red neuronal convolucional 3D desarrollada por JaneliaSciComp (HHMI Janelia Research Campus, computación científica) que convierte un punto de interés detectado en un volumen de microscopía light-sheet (detecciones DoG) en un vector unitario de 64 dimensiones que describe su entorno a cinco escalas. Dos detecciones de la misma estructura física en dos vistas solapadas producen vectores similares, lo que permite a BigStitcher emparejar puntos por similitud coseno en lugar de por la geometría de sus vecinos.

El modelo resuelve un problema clásico en el alineamiento y stitching de volúmenes de microscopía: la correspondencia robusta de puntos de interés entre vistas. Está exportado en formato ONNX (opset 18) y se evalúa dentro de BigStitcher mediante su propio evaluador Java de ONNX, sin necesidad de runtime adicional. Su licencia MIT y su tamaño reducido lo hacen adecuado para integrarse directamente en pipelines científicos de registro de volúmenes light-sheet, tanto en versión monolítica (BigStitcher) como distribuida (BigStitcher-Spark).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 3D convolucional para extracción de descriptores de puntos de interés (multi-escala, 5 canales) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión por bloques, no secuencial) |
| Tipos de cuantizacion | no disponible (pesos float32) |
| Idiomas soportados | no aplicable (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 18, 22 tipos de operadores) |

## Arquitectura y entrenamiento

El modelo recibe como entrada un tensor `patches` de forma `[N, 5, 16, 16, 16]` (ejes N, canal, z, y, x). Cada canal k es un cubo isotrópico de 16³ muestras centrado en el punto detectado, con un lado de k × sigma para k = 5, 8, 13, 20 y 30, donde sigma es la escala de detección del punto en píxeles de resolución completa. El muestreo es trilineal desde el nivel de la pirámide cuya resolución coincide con el espaciado de muestra, corrigiendo la anisotropía en unidades físicas. La estandarización de intensidades forma parte del grafo, y las muestras fuera de la imagen se enmascaran internamente (NaN). La salida es un descriptor `descriptor` de forma `[N, 64]` con filas L2-normalizadas.

El entrenamiento se realizó con pares positivos de detecciones correspondientes en pares de vistas registradas (tolerancia de 2 píxeles) procedentes de siete datasets light-sheet: registros basados en cuentas (beads) de un dataset de stitching, una muestra de corteza de ratón, una cabeza de ratón, dos muestras adicionales de colaboradores, y detecciones de núcleos en espacio de escala de un embrión de ratón y un cerebro de mosca. En total, 27.330 positivos en 36 grupos de pares (máximo 2.000 por par). Se usó la pérdida HardNet con margen 0,15, negativos duros dentro de 500 píxeles del ancla (3 por ancla, 2 de ellos los más cercanos), batches de 1.024 muestras, aumentación con rotaciones de hasta 8 grados y jitter afín del 6 %, 3.000 pasos con learning rate 1e-3 y semilla 0. La pérdida final fue 0,0027 tras 12 minutos de entrenamiento en una única GPU. El commit de referencia de pcmatch es 2c42a45 (2026-10-27).

## Capacidades

- Extracción de descriptores de 64 dimensiones, L2-normalizados, a partir de detecciones DoG en volúmenes light-sheet.
- Emparejamiento de puntos de interés entre vistas solapadas por similitud coseno (umbral de mejor pareja > 0,3 y ratio test de 0,85 en espacio de similitud).
- Invarianza a la traslación: las vistas deben estar aproximadamente en la misma orientación (aumentación de entrenamiento de ±8 grados).
- Descripción multi-escala del entorno del punto (5 escalas relativas a sigma de detección).
- Integración nativa con BigStitcher (`Embed Interest Points`), BigStitcher-Spark (`embed-interestpoints`) y pcmatch (`pcmatch embed`), con muestreo idéntico entre implementaciones.
- Trazabilidad mediante fingerprint sha256 (`6844e0e3...cb75`) incluido en cada array de vectores; BigStitcher rechaza emparejar vectores de fingerprints distintos.
- Manejo de bordes de imagen mediante enmascarado de muestras NaN dentro del grafo.

## Casos de uso

- Stitching de volúmenes light-sheet: generación de descriptores para detecciones DoG en vistas solapadas, permitiendo a BigStitcher calcular transformaciones de vista vía RANSAC sobre los candidatos emparejados por similitud coseno.
- Registro basado en cuentas (bead-based): emparejamiento de detecciones de cuentas fluorescentes entre vistas adyacentes para reconstruir volúmenes grandes a partir de mosaicos.
- Registro basado en núcleos: detecciones de núcleos en espacio de escala (embrión de ratón, cerebro de mosca) pueden usarse como puntos de interés cuando no hay cuentas, útil en muestras biológicas sin marcadores exógenos.
- Procesamiento distribuido a gran escala: con BigStitcher-Spark, el cálculo de descriptores y emparejamientos se distribuye en un clúster para volúmenes que no caben en una sola máquina.
- Reproducibilidad en pipelines científicos: el fingerprint del modelo garantiza que los vectores almacenados solo se emparejan si fueron generados con exactamente la misma versión del modelo, evitando mezclas incompatibles entre ejecuciones.
- Integración en flujos pcmatch: el comando `pcmatch embed` produce vectores idénticos (salvo redondeo float) a los de BigStitcher, lo que permite precalcular descriptores fuera del entorno Fiji/ImageJ.
- Comparación de muestras biológicas multi-vista: registro de muestras como corteza o cabeza de ratón donde las vistas comparten orientación aproximada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, etc.) en la información disponible; no son aplicables a este tipo de modelo. Los datos de verificación publicados son:

| Verificacion | Valor |
|---|---|
| Diferencia absoluta maxima PyTorch vs onnxruntime (64 puntos) | 3,9e-7 |
| Coseno minimo PyTorch vs onnxruntime | 0,9999998 |
| Reproduccion de vectores por el evaluador Java de BigStitcher | 3e-5 |
| Perdida final de entrenamiento | 0,0027 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por la naturaleza del modelo (CNN 3D pequeña sobre parches de 16³) los requisitos son muy reducidos y la inferencia puede ejecutarse sobre CPU vía onnxruntime o el evaluador Java de BigStitcher.
- GPU recomendadas: cualquier GPU moderna es suficiente; el entrenamiento completo se completó en 12 minutos en una única GPU.
- Consumer GPU: no es necesaria GPU dedicada para inferencia; el modelo se ejecuta dentro de BigStitcher sin runtime externo.
- Despliegue: evaluador ONNX Java integrado en BigStitcher, BigStitcher-Spark y onnxruntime (verificado con onnxruntime 1,31,1); también ejecutable desde pcmatch (`pcmatch embed`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Dimensionalidad | Invarianza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bigstitcher-embedding-translation-stack64 | CNN 3D multi-escala (5 escalas) | 64-D | Traslacion (±8 grados) | MIT | ONNX, integrado en BigStitcher/pcmatch |
| Descriptores geometricos clasicos de BigStitcher | Vecindarios geometricos de detecciones | Variable | Traslacion/rotacion segun configuracion | GPL (Fiji) | Integrado en BigStitcher |
| Variante rotation-invariant (release separada anunciada) | no disponible | no disponible | Rotacion + traslacion | no disponible | Anunciada como release separada |

La ventaja principal frente a los descriptores geométricos clásicos es que el emparejamiento se realiza por similitud coseno entre embeddings aprendidos, lo que resulta más robusto cuando la geometría local de vecinos no es discriminativa.

## Limitaciones y advertencias

- Invarianza solo a la traslación: las vistas deben estar aproximadamente en la misma orientación; la aumentación de entrenamiento cubre solo ±8 grados. Existe una variante rotation-invariant publicada como release separada.
- Entrenado exclusivamente sobre cuentas y estructuras tipo núcleo detectadas por DoG; otros tipos de estructuras pueden obtener embeddings de mala calidad.
- Los puntos a menos de unos 15 sigma del borde de la imagen pierden parte de sus cubos más grandes (enmascarado, no relleno con ceros); el efecto es marginal en volúmenes grandes.
- El emparejamiento exige similitud coseno superior a 0,3 y superación del ratio test (0,85); estructuras atípicas pueden no generar candidatos válidos.
- Los ficheros `.onnx` y `.onnx.json` deben permanecer juntos con nombres emparejados; el sidecar contiene el contrato de tensores, configuración de muestreo y fingerprint, y BigStitcher no funcionará correctamente sin él.
- No se pueden mezclar vectores generados con modelos de fingerprints distintos: BigStitcher los rechaza explícitamente.
- Riesgo de correspondencias erróneas en muestras muy diferentes de los siete datasets de entrenamiento; se recomienda validar el registro con RANSAC antes de aceptar transformaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JaneliaSciComp/bigstitcher-embedding-translation-stack64
- BigStitcher (Fiji): https://imagej.net/plugins/bigstitcher/
- BigStitcher-Spark: https://github.com/JaneliaSciComp/BigStitcher-Spark
- Repositorio pcmatch: no disponible (referencia interna: commit 2c42a45, 2026-10-27)

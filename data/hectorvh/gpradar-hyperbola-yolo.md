# hectorvh/gpradar-hyperbola-yolo

## Resumen

`hectorvh/gpradar-hyperbola-yolo` es un repositorio de Hugging Face publicado por el usuario hectorvh que, a pesar de su identificador y de la etiqueta "yolo" en el nombre, no contiene un modelo de lenguaje ni un modelo de visión entrenado con pesos publicados. La model card describe un proyecto de procesamiento de radar de penetración terrestre (GPR, *ground-penetrating radar*) que combina simulación con gprMax, procesamiento de señal con GPRPy y SciPy, y un pipeline de detección de hipérbolas mediante YOLO. El repositorio tiene un tamaño de 0.0 GB, lo que indica que no incluye artefactos de pesos.

El contenido documentado es fundamentalmente un conjunto de herramientas, notebooks y scripts organizados por etapas numeradas: generación de escenas sintéticas, carga de salidas HDF5 de gprMax, preprocesado (time zero, dewow, eliminación de fondo, band-pass, ganancia), comparación con la referencia de GPRPy, inventario y partición del conjunto de imágenes de Mendeley, y renderizado de recortes sintéticos de 224×224 en escala de grises para entrenamiento de YOLO. No se documenta ningún checkpoint, arquitectura de red neuronal concreta ni resultados de entrenamiento.

Por tanto, esta ficha debe interpretarse como la descripción de un repositorio de código y datos para un pipeline de detección de hipérbolas en GPR, no como la de un modelo listo para inferencia. La información disponible sobre el propio modelo YOLO (arquitectura, pesos, métricas) es prácticamente nula en la model card proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio documenta un pipeline GPR + YOLO, sin especificar la variante de YOLO) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamano del repo: 0.0 GB; no se publican pesos) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del detector YOLO empleado. Lo que sí detalla es el pipeline de datos que lo alimenta. La simulación se realiza con gprMax 4.0.1 compilado desde fuente con OpenMP, usando modelos 2D con celdas de 2 mm, fuente Ricker de 1.5 GHz y B-scans de 60 trazas. El estudio de variantes (`src/01a_pipe_bscan_study.py`) explora 8 de las 36 combinaciones posibles de 3 frecuencias (0.9, 1.5 y 2.1 GHz), 3 permitividades (4, 6 y 12), 2 conductividades (0 y 0.05 S/m) y 2 profundidades del centro de la tubería (5 cm y 9 cm). Cada B-scan de 60 trazas tarda aproximadamente 32 s en una CPU de portátil con 16 hilos.

El preprocesado incluye time zero, dewow, eliminación de fondo, filtro band-pass y ganancia, con una comparación explícita contra la implementación de dewow y AGC de GPRPy (`src/02c_gprpy_reference.py`, `src/03b_compare_gprpy.py`). Para el entrenamiento del detector se construye un conjunto sintético a partir de escenas de campo a 400 MHz renderizadas a recortes YOLO en escala de grises de 224×224 (`src/05a_render_synthetic.py`), con estadísticas de cajas calculadas solo sobre el conjunto de entrenamiento real (`data/synth/real_train_box_stats.json`). También se documenta un inventario de solo lectura del conjunto de imágenes GPR de Mendeley (285 originales), una partición bloqueada con lock SHA-256 del conjunto de test (`configs/mendeley_test_lock.txt`) y conversión entre formatos YOLO y VOC. No se especifica el número de tokens, el volumen de datos de entrenamiento del detector ni si hubo ajuste fino o aumento de datos más allá del renderizado sintético.

## Capacidades

- Generación de perfiles GPR sintéticos (B-scans) mediante gprMax con geometrías y parámetros configurables.
- Procesamiento de señal GPR: time zero, dewow, eliminación de fondo, band-pass y ganancia.
- Comparación y validación cruzada contra la implementación de referencia de GPRPy (dewow y AGC).
- Carga de salidas HDF5 de gprMax en un formato de scan manejable.
- Inventario y partición estratificada de conjuntos de imágenes GPR reales (Mendeley), con bloqueo del conjunto de test.
- Conversión entre anotaciones YOLO y VOC, y cálculo de hashes perceptuales (dHash).
- Renderizado de escenas sintéticas a recortes de 224×224 en escala de grises listos para YOLO.
- Detección de hipérbolas con YOLO (documentada en `gpr_yolo.md`, sin detalles de arquitectura ni pesos en la información disponible).

## Casos de uso

- Detección automática de tuberías y cavidades en perfiles GPR: el pipeline renderiza escenas sintéticas a recortes de 224×224 y entrena un detector YOLO para localizar hipérbolas, lo que permite sustituir la interpretación manual de B-scans por un flujo reproducible.
- Generación de datos sintéticos para aumentar un conjunto real pequeño: partiendo de 285 imágenes originales de Mendeley, el renderizador de escenas a 400 MHz produce recortes etiquetados adicionales, con estadísticas de cajas calculadas solo sobre el train real para evitar fuga de información.
- Validación de cadenas de preprocesado: los scripts de dewow y AGC se comparan numéricamente contra GPRPy (`figures/gprpy_comparison.csv`), lo que sirve para auditar implementaciones propias antes de desplegarlas en campo.
- Estudio paramétrico de detectabilidad: el barrido de frecuencias, permitividades, conductividades y profundidades permite analizar en qué condiciones físicas una hipérbola es visible y, por tanto, detectable por el modelo.
- Reproducibilidad de experimentos GPR: la partición bloqueada con lock SHA-256 y los tests por etapa (`test/01c_test_scene_generator.py`, `test/02b_test_preprocessing.py`, etc.) permiten repetir experimentos y comparar resultados entre equipos.
- Formación e investigación: los notebooks numerados por etapa (01a, 01b, 02a, 03a) sirven como material didáctico para aprender simulación con gprMax, procesamiento con SciPy/GPRPy y anotación YOLO en un mismo flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta un dato de rendimiento de simulación: un B-scan de 60 trazas de `src/pipe.in` tarda aproximadamente 32 s en una CPU de portátil con 16 hilos usando gprMax 4.0.1 con OpenMP.

## Requisitos de hardware

- No se publican pesos del detector, por lo que no es posible estimar VRAM de inferencia del modelo YOLO.
- La simulación con gprMax 4.0.1 requiere compilador C con soporte OpenMP (GCC) y se ejecuta en CPU; el ejemplo documentado usa 16 hilos.
- Se necesitan dos entornos conda separados: `environment-gprmax.yml` (gprMax, procesamiento y tests) y `environment-gprpy.yml` (script de referencia GPRPy).
- GPRPy abre una ventana interactiva y requiere entorno gráfico para perfiles (`p`) o CMP/WARR (`c`).
- Opciones de despliegue del detector: no disponibles en la información proporcionada (no se documenta vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje).
- Latencia y throughput del detector: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de detección de hipérbolas en GPR ni variantes de YOLO con las que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El repositorio no contiene pesos publicados (tamaño 0.0 GB); no es un modelo descargable y listo para inferencia.
- No se especifica la licencia, lo que impide determinar si el uso comercial está permitido.
- No se declaran idiomas soportados ni pipeline de Hugging Face; la etiqueta `region:us` es la única metadato adicional.
- El conjunto real de partida es pequeño (285 originales de Mendeley), lo que limita la generalización del detector a otros suelos, antenas o frecuencias.
- Las escenas sintéticas se generan con un conjunto acotado de parámetros (3 frecuencias, 3 permitividades, 2 conductividades, 2 profundidades); el dominio simulado puede no cubrir la variabilidad de campo.
- El estudio de variantes ejecuta solo 8 de 36 combinaciones, por lo que la cobertura paramétrica es parcial.
- Riesgo de sesgo hacia las condiciones simuladas (2 mm de celda, Ricker de 1.5 GHz en el modelo base, escenas de campo a 400 MHz) y hacia el formato de anotación YOLO/VOC empleado.
- No se documentan métricas de precisión, recall o mAP del detector, por lo que no es posible evaluar su fiabilidad en producción.
- Dependencia de versiones concretas: gprMax 4.0.1 compilado desde fuente y entornos conda específicos; cambios de versión pueden romper la reproducibilidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hectorvh/gpradar-hyperbola-yolo
- gprMax (código fuente): https://github.com/gprMax/gprMax
- Documentación interna citada en la model card: `gpr_basics.md`, `gpr_signal_processing.md`, `gpr_yolo.md` (sin URL pública en la información disponible)
- Conjunto de imágenes GPR de Mendeley: no disponible la URL en la información proporcionada
- GPRPy: no disponible la URL en la información proporcionada

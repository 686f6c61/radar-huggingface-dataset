# 0himera/visers-nano

## Resumen

Visers Nano es un codificador visual compacto disenado especificamente para recuperacion de imagenes (image retrieval) en CPU. Lo desarrolla el autor 0himera como parte del proyecto Visers, y su objetivo es ofrecer embeddings visuales de alta calidad con un coste computacional minimo, sin necesidad de GPU. El modelo transforma imagenes RGB de 128×128 pixeles en embeddings L2-normalizados de 256 dimensiones (con variantes de 128D y 64D) pensados para busqueda por similitud.

Tecnicamente, emplea un backbone MobileNetV4-Conv-Small-0.50 destilado desde SigLIP2 Base, con pesos cuantizados a W8 por canal y una cabeza de proyeccion Matryoshka que permite truncar el embedding a distintas dimensiones. Se distribuye en dos formatos: un binario nativo para el runtime Rust de Visers (formato VSN1) y un grafo ONNX ejecutable con ONNX Runtime en CPU.

Su relevancia radica en el rendimiento: alcanza 0,431 ms P50 y 2.268 imagenes/s en un solo nucleo de un Intel Core i7-8700K, y hasta 13.224 imagenes/s con seis nucleos mediante `NanoSpinPool`. Esto lo posiciona como una opcion practica para pipelines de recuperacion visual a gran escala en entornos sin aceleracion hardware, con una huella de pesos de aproximadamente 489 KiB en la build nativa de 256D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV4-Conv-Small-0.50 (CNN) con cabeza de proyeccion Matryoshka, destilada de SigLIP2 Base |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 128×128 RGB) |
| Tipos de cuantizacion | W8 por canal (pesos); en ONNX los pesos W8 se almacenan como FP32 |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | VSN1 binario (runtime Rust), ONNX (`nano-v1-mrl256.onnx`) |

## Arquitectura y entrenamiento

El modelo es una red convolucional basada en MobileNetV4-Conv-Small-0.50, un backbone disenado para eficiencia en CPU y dispositivos de borde. Sobre este backbone se anade una cabeza de proyeccion Matryoshka, que permite obtener embeddings truncables a 256D, 128D o 64D sin reentrenar, facilitando el equilibrio entre precision y coste de almacenamiento/busqueda. Los pesos se cuantizan a W8 por canal, lo que reduce la huella y acelera la inferencia en CPU.

El entrenamiento emplea destilacion desde SigLIP2 Base, un modelo vision-lenguaje de mayor tamano, de modo que el codificador pequeno aprende a aproximar el espacio de embeddings del profesor. No se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF/DPO (no aplicables a un codificador visual). La build nativa en Rust embebe aproximadamente 489 KiB de pesos para 256D y selecciona kernels AVX2/FMA en CPUs x86-64 compatibles, con una ruta escalar de respaldo.

## Capacidades

- Extraccion de caracteristicas visuales: mapea imagenes RGB de 128×128 a embeddings L2-normalizados de 256 dimensiones (configurable a 128D y 64D en la build Rust).
- Recuperacion de imagenes por similitud: embeddings optimizados para busqueda vectorial (nDCG@10 evaluado en tareas de estilo, genero y fotografia).
- Embeddings Matryoshka: truncamiento dimensional sin reentrenamiento para ajustar precision frente a coste.
- Inferencia en CPU: ejecucion eficiente sin GPU, tanto en runtime Rust nativo como en ONNX Runtime.
- Procesamiento por lotes y multi-nucleo: soporte de `NanoSpinPool` para throughput agregado en varios nucleos.
- Sin capacidades de generacion de texto, razonamiento, codigo, tool calling, agentes ni multilingues (es exclusivamente un codificador visual).

## Casos de uso

- Busqueda visual en catalogo de productos: indexar imagenes de articulos como embeddings de 256D y servir busquedas por similitud en CPU, aprovechando el throughput de miles de imagenes por segundo para mantener el indice actualizado.
- Deduplicacion de imagenes a escala: generar embeddings de 128D o 64D con la cabeza Matryoshka para reducir memoria del indice y detectar duplicados o near-duplicates en grandes repositorios.
- Moderacion y filtrado de contenido: comparar imagenes entrantes contra un conjunto de referencia mediante similitud coseno, con latencia sub-milisegundo por imagen en un solo nucleo.
- Recuperacion en dispositivos de borde o entornos sin GPU: desplegar el binario Rust (489 KiB de pesos) en servidores modestos o sistemas embebidos x86-64 con AVX2.
- Organizacion de bibliotecas multimedia: agrupar fotos por estilo o genero artistico usando las metricas de recuperacion reportadas (nDCG@10 de 0,7686 en Art Style y 0,6776 en Cross-Genre Style).
- Pipelines de vision por lotes en CI/CD: procesar lotes de imagenes con ONNX Runtime en CPU como paso de preprocesamiento para sistemas de recomendacion o analitica visual.
- Anotacion y curacion de datasets: precomputar embeddings para clustering y seleccion de muestras representativas antes de entrenar otros modelos.

## Benchmarks y rendimiento

Rendimiento de inferencia (incluye preprocesamiento desde RGB en memoria):

| Metrica | Valor |
|---|---|
| Latencia P50 (256D, 1 nucleo, i7-8700K) | 0,431 ms |
| Throughput (1 nucleo) | 2.268 imagenes/s |
| Throughput (`NanoSpinPool`, 6 nucleos) | 13.224 imagenes/s |

Calidad de recuperacion en la tarea held-out `abstract-v2` (nDCG@10):

| Tarea | nDCG@10 |
|---|---:|
| Art Style | 0,7686 |
| Art Genre | 0,5291 |
| Cross-Genre Style | 0,6776 |
| Photo (COCO) | 0,4126 |

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para inferencia en CPU.
- GPU recomendadas: no aplica (no se reporta soporte GPU en la informacion disponible).
- CPU: x86-64 con AVX2/FMA para la ruta optimizada del runtime Rust; existe ruta escalar de respaldo. Las mediciones de referencia usan un Intel Core i7-8700K.
- Memoria: pesos de aproximadamente 489 KiB en la build Rust de 256D; el grafo ONNX almacena pesos W8 como FP32, con mayor huella.
- Despliegue: runtime Rust de Visers (crate `visers-nano`, tag v1.0.0) u ONNX Runtime con `CPUExecutionProvider`.
- Latencia y throughput: 0,431 ms P50 y 2.268 imagenes/s por nucleo; 13.224 imagenes/s con seis nucleos via `NanoSpinPool`.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de benchmarks de modelos alternativos medidos bajo el mismo protocolo, por lo que la comparacion cuantitativa directa no esta disponible. Como referencia cualitativa, los codificadores visuales habituales para recuperacion (por ejemplo, CLIP o SigLIP2) operan tipicamente en GPU y con resoluciones y dimensiones mayores, mientras que Visers Nano prioriza latencia en CPU y huella minima; no obstante, no se aportan cifras comparativas verificables en la documentacion disponible.

## Limitaciones y advertencias

- Resolucion de entrada fija de 128×128: puede perder detalle en imagenes de alta resolucion o con objetos pequenos.
- Rendimiento desigual por dominio: el nDCG@10 en Photo (COCO) es 0,4126, notablemente inferior al de tareas de estilo artistico (0,7686), lo que sugiere menor robustez en fotografia generica.
- Modelo exclusivamente visual: no procesa texto ni ofrece capacidades multimodales de lenguaje.
- Riesgo de sesgo heredado: al destilarse desde SigLIP2 Base, puede arrastrar sesgos del modelo profesor y del dataset de destilacion (no detallado).
- Dependencia de la ruta AVX2/FMA para el maximo rendimiento en Rust; en CPUs sin estas extensiones se usa la ruta escalar con menor throughput.
- El grafo ONNX almacena pesos W8 como FP32, lo que aumenta la huella respecto al binario nativo.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario limitados.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio para confirmar terminos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0himera/visers-nano
- Repositorio GitHub: https://github.com/0himera/visers
- Release v1.0.0: https://github.com/0himera/visers/releases/tag/v1.0.0
- Informe de benchmarks: https://github.com/0himera/visers/blob/v1.0.0/BENCHMARKS.md
- Guia de arquitectura: https://github.com/0himera/visers/blob/v1.0.0/ARCHITECTURE.md

# kiruluta/SPECTRA-K3-HF-Scaling-Benchmark

## Resumen

kiruluta/SPECTRA-K3-HF-Scaling-Benchmark no es un modelo de lenguaje, sino un paquete de benchmark ejecutable y un artefacto de colaboración publicado en Hugging Face. Deriva del manuscrito *SPECTRA-MoE: Signal-Processing and High-Dimensional Reduction for Local Compression of Frontier Mixture-of-Experts Language Models* y de la implementación SPECTRA suministrada por el autor. Su propósito es medir de forma reproducible un conjunto acotado de primitivas de compresión: bocetos espectrales aleatorizados de alta dimensión, diagnósticos de rango y compresibilidad, error de cuantización agrupada de bajo número de bits, throughput y memoria pico en una GPU, y escalado débil y fuerte en múltiples GPU.

El objeto de estudio a largo plazo es deliberadamente ambicioso: se trata a Kimi K3 como un MoE de 2,8 billones de parámetros con 104.000 millones de parámetros activados por token, 93 capas transformer, 896 expertos enrutados con enrutamiento top-16 y una ventana de contexto de 1.048.576 tokens. El checkpoint publicado de ese modelo ocupa aproximadamente 1,56 TB, de modo que alcanzar un objetivo de pesos residentes de 20 GiB exige reducción estructural y residencia jerárquica, no solo cuantización escalar convencional.

El repositorio se distribuye sin Git, no contiene pesos y ocupa 0,0 GB, con 0 descargas y 0 likes en el momento de la consulta. La licencia declarada es MIT. Es, por tanto, una herramienta de evaluación temprana orientada a contribuyentes con acceso a hardware de gama alta, no un modelo listo para inferencia ni para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable: es un paquete de benchmark, no un modelo. El objeto de estudio declarado es un MoE transformer de clase Kimi K3 (93 capas, 896 expertos enrutados, top-16) |
| Parametros totales | No aplicable al paquete. Objetivo de referencia del manuscrito: 2,8 billones (2,8T) |
| Parametros activos | No aplicable al paquete. Objetivo de referencia del manuscrito: 104.000 millones por token |
| Longitud de contexto | No aplicable al paquete. Objetivo de referencia del manuscrito: 1.048.576 tokens |
| Tipos de cuantizacion | No disponible como lista cerrada. El benchmark incorpora diagnóstico de error de cuantización agrupada de bajo bit y bocetos espectrales; el manuscrito prevé baselines AQLM, QuIP# y bases compartidas estilo MoBE |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible: el repositorio no incluye pesos |
| Autor | kiruluta |
| Pipeline de Hugging Face | No disponible |
| Tamano del repositorio | 0,0 GB |
| Fecha de creacion | 2026-09-25 |
| Ultima actualizacion | 2026-09-25 |
| Descargas / likes | 0 / 0 |
| Dependencias declaradas | Instalación por extras: `.[dev]`, `.[benchmark]`, `.[hf]`; PyTorch como dependencia del benchmark |

## Arquitectura y entrenamiento

El repositorio no entrena ni publica un modelo. Lo que contiene es una implementación de referencia SPECTRA (con tests en NumPy ejecutables mediante `pytest`) y un conjunto de scripts de benchmark orientados a acelerador. La pieza central es `benchmarks/gpu_block_scaling.py`, que procesa bloques de expertos independientes en cada rango y agrega throughput, memoria pico y métricas de error. El script detecta CUDA automáticamente y, si no está disponible, cae a MPS o CPU. El benchmark distribuido no promedia copias evolucionadas de forma independiente de un estado cronológico, lo que evita un artefacto metodológico habitual en medidas de escalado.

El flujo de evaluación previsto cubre cuatro frentes: barrido de escalado en una sola GPU mediante `scripts/run_single_gpu_scaling.sh` (parámetros `DIMS`, `RANK`, `EXPERTS`, `STEPS`, `WARMUP` configurables por entorno); escalado débil, que mantiene constante el número de bloques de expertos por GPU, y escalado fuerte, que fija el número global de bloques y los reparte entre rangos, ambos con `scripts/run_multigpu_scaling.sh`; inventario real de checkpoints y análisis a nivel de shard donde esté soportado; y agregación de resultados en un leaderboard CSV con `benchmarks/merge_results.py`, previa validación de cada JSON con `benchmarks/validate_result.py`. La model card separa explícitamente la validación de la ruta software de la evidencia de calidad del modelo, y advierte que los resultados sintéticos de proxy no son resultados de calidad de Kimi K3.

## Capacidades

- Medición de bocetos espectrales aleatorizados de alta dimensión sobre matrices de expertos.
- Diagnóstico de rango y compresibilidad de bloques de expertos.
- Medición de error de cuantización agrupada de bajo bit.
- Medición de throughput y memoria pico en una sola GPU.
- Escalado débil y fuerte en configuraciones de 2, 4, 8, 16 o más GPU, y en múltiples nodos.
- Inventario de checkpoints reales y análisis a nivel de shard, cuando el soporte de checkpoint está instalado mediante el extra `.[hf]`.
- Registro reproducible de metadatos de hardware y software, con salida en JSON por ejecución.
- Generación y validación de un leaderboard agregado en CSV.
- Implementación de tests de validación NumPy para la ruta SPECTRA.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni multilingüismo: no es un modelo generativo.

## Casos de uso

- Validación de primitivas de compresión antes de escalar a un modelo completo: un equipo que investiga cuantización de MoE puede ejecutar `gpu_block_scaling.py` con dimensiones crecientes para determinar a partir de qué tamaño de matriz el coste de la boceto espectral deja de compensar.
- Pruebas de regresión de implementaciones de cuantización: al fijar `DIMS`, `RANK`, `EXPERTS` y `STEPS`, los JSON resultantes permiten detectar degradaciones de throughput o de energía residual entre versiones del código.
- Verificación de escalado fuerte antes de reservar un clúster: `NPROC=8 MODE=strong DIM=8192 EXPERTS=16 RANK=64` permite estimar la eficiencia de reparto de bloques de expertos entre rangos y decidir si merece la pena un nodo adicional.
- Verificación de escalado débil para planificación de capacidad: medir si el throughput por GPU se mantiene al duplicar el número de rangos con carga constante por GPU.
- Auditoría de checkpoints de gran tamaño: inventariar shards de un checkpoint de clase K3 y analizar su distribución antes de decidir una estrategia de residencia jerárquica.
- Contribución a un leaderboard comparativo de hardware: cualquier contribuyente con H100, H200, B100, B200, GB200, GB300 o MI300X puede ejecutar los scripts, validar el JSON con `validate_result.py` y publicar resultados comparables entre arquitecturas.
- Evaluación de alternativas de baseline: el repositorio pide explícitamente implementaciones de baselines del manuscrito (AQLM, QuIP#, bases compartidas estilo MoBE, cuantización consciente del enrutamiento, codificación de expertos por wavelets de grafo) para compararlas bajo una misma metodología.
- Reproducción de la ruta por etapas OLMoE → K2/K2.5 → K3: aunque el trabajo de calidad de modelo completo está pendiente, el paquete proporciona el andamiaje para ejecutarlo de forma incremental.

## Benchmarks y rendimiento

La model card incluye medidas de referencia recogidas en una NVIDIA DGX Spark / GB10 con PyTorch 2.14.0+cu130, CUDA 13.0 y BF16. El autor las etiqueta explícitamente como medidas sintéticas de escalado de primitivas de compresión, no como resultados de calidad de extremo a extremo de Kimi K3.

| Carga | Rango | Expertos | Pasos | Coeficientes/s | TFLOP/s aprox. | Energia residual | Memoria GPU pico |
|---|---:|---:|---:|---:|---:|---:|---:|
| 4096 x 4096 | 64 | 1 | 5 | 5,90B | 1,89 | 0,1891 | 0,19 GiB |
| 8192 x 8192 | 64 | 1 | 5 | 15,05B | 4,82 | 0,1911 | 0,66 GiB |
| 16384 x 16384 | 64 | 1 | 5 | 29,94B | 9,58 | 0,1908 | 2,53 GiB |
| 24576 x 24576 | 64 | 1 | 5 | 36,94B | 11,82 | 0,1920 | 5,66 GiB |
| 32768 x 32768 | 64 | 1 | 100 | 41,27B | 13,21 | 0,1916 | 10,04 GiB |
| 8192 x 8192 | 64 | 16 | 100 | 15,30B | 4,90 | 0,1896 | 10,05 GiB |

La model card anuncia además una tabla de compromiso calidad/cómputo a dimensión fija 16384 variando el rango del boceto, pero el contenido disponible se trunca en la cabecera (`| Rank |`), por lo que los valores no están disponibles.

No se han publicado resultados de benchmarks de calidad de modelo (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible.

## Requisitos de hardware

- El paquete en sí es ligero: el repositorio ocupa 0,0 GB y las dependencias base son NumPy/PyTorch. Los tests de validación se ejecutan en CPU.
- El script de escalado detecta CUDA, MPS o CPU automáticamente, de modo que una ejecución de humo (`--dim 512 --experts 1 --rank 32 --steps 2 --warmup 1`) cabe en cualquier equipo.
- Memoria observada en las medidas de referencia: desde 0,19 GiB para matrices de 4096 x 4096 hasta 10,04 GiB para 32768 x 32768 a rango 64, y 10,05 GiB para el caso de 8192 x 8192 con 16 expertos. Estas cifras corresponden a primitivas, no al modelo completo.
- Para ejecuciones de escalado representativas el autor solicita acceso a H100, H200, B100, B200, GB200, GB300 y sistemas de clase MI300X, así como servidores de 2, 4, 8 y 16 o más GPU y clústeres multinodo.
- El inventario y la auditoría de shards de un checkpoint de clase K3 requieren sistemas de alta memoria: el checkpoint de referencia ronda 1,56 TB, frente a un objetivo de residencia de 20 GiB de pesos.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI, porque no hay pesos ni modelo. El despliegue consiste en `python -m pip install -e '.[dev]'` para código y tests, `.[benchmark]` para dependencias de GPU y `.[hf]` para herramientas opcionales de checkpoint.
- Latencia y throughput: las únicas cifras disponibles son las de la tabla anterior (de 1,89 a 13,21 TFLOP/s aproximados y de 5,90B a 41,27B coeficientes/s según carga y tamaño). No hay datos de latencia por token ni de throughput de inferencia.

## Comparativa con modelos similares

El repositorio no es un modelo, por lo que la comparación directa se establece con otras propuestas de compresión de MoE de frontera y con el propio checkpoint objetivo.

| Elemento | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPECTRA-K3-HF-Scaling-Benchmark | Benchmark de compresión | No aplicable | No aplicable | MIT | Publicado en Hugging Face, 0 descargas |
| AQLM | Metodo de cuantizacion | No aplicable | No aplicable | No disponible en la informacion | Citado como baseline a implementar en el manuscrito |
| QuIP# | Metodo de cuantizacion | No aplicable | No aplicable | No disponible en la informacion | Citado como baseline a implementar en el manuscrito |
| MoBE (bases compartidas) | Metodo de compresion de MoE | No aplicable | No aplicable | No disponible en la informacion | Citado como baseline a implementar en el manuscrito |
| Kimi K3 | MoE transformer | 2,8T totales, 104B activos | 1.048.576 tokens | No disponible en la informacion | Checkpoint de ~1,56 TB; no incluido en este repositorio |

No hay datos de rendimiento publicados para AQLM, QuIP# ni MoBE dentro de la información disponible, por lo que no es posible establecer una comparación cuantitativa de calidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta código y no admite tool calling ni uso como agente. Confundirlo con un checkpoint desplegable es el error principal a evitar.
- Los resultados incluidos son medidas sintéticas de primitivas de compresión. El propio autor advierte que no constituyen evidencia de calidad de Kimi K3.
- El repositorio no contiene pesos: no hay safetensors, GGUF ni ningún otro formato de checkpoint.
- El rendimiento real del método SPECTRA sobre el modelo objetivo no está demostrado en la información disponible; la ruta de calidad de modelo completo (OLMoE → K2/K2.5 → K3) figura como trabajo pendiente.
- La tabla de compromiso rango/calidad a dimensión 16384 aparece truncada en la model card, por lo que no puede verificarse.
- El escalado fuerte se apoya en que los bloques de expertos son independientes entre rangos; los resultados no son extrapolables sin más a arquitecturas con dependencias secuenciales entre capas.
- El uso de sistemas de muy alta memoria es un requisito práctico para las tareas más valiosas (inventario y auditoría de shards), lo que limita quién puede contribuir con datos relevantes.
- Advertencia de licencia: el paquete se distribuye bajo MIT, pero esa licencia cubre el código del benchmark, no los pesos de Kimi K3 ni de ningún otro modelo de frontera, cuyas condiciones no se detallan en la información disponible. Verificar la licencia del modelo subyacente antes de cualquier uso comercial.
- El proyecto está en fase inicial: 0 descargas, 0 likes, sin pipeline declarado y sin idiomas declarados, lo que reduce la base de validación externa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kiruluta/SPECTRA-K3-HF-Scaling-Benchmark
- Hilo de discusión para colaboración: https://huggingface.co/kiruluta/SPECTRA-K3-HF-Scaling-Benchmark/discussions/1
- Guía de contribución: `COLLABORATION.md` (ruta relativa dentro del repositorio)
- Documentación principal: `README.md` (ruta relativa dentro del repositorio)
- Manuscrito de referencia: *SPECTRA-MoE: Signal-Processing and High-Dimensional Reduction for Local Compression of Frontier Mixture-of-Experts Language Models* (citado en la model card; no se proporciona URL en la información disponible)
- Resultados crudos y leaderboard: directorios `results/raw/` y `results/leaderboard.csv` dentro del repositorio

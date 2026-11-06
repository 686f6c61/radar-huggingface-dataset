# andyjzhao/GeneZip-Regulome

## Resumen

GeneZip-Regulome es un modelo de lenguaje de ADN (DNA language model) preentrenado, publicado por el autor andyjzhao bajo el nombre definitivo del artículo (*camera ready*). No se trata de un checkpoint ajustado para una tarea concreta, sino de los pesos base del preentrenamiento, pensados para servir como punto de partida en investigación sobre modelado de secuencias genómicas y en las recetas de evaluación DNALongBench del propio proyecto GeneZip.

El modelo trabaja sobre secuencias de ADN con una ventana de contexto de 12.800 pares de bases (bp) y un objetivo de compresión base de 64 bp por token, lo que implica una tokenización de la secuencia genómica en unidades de 64 bp. Los pesos proceden de un checkpoint intermedio del entrenamiento (paso 30.600) del repositorio original `jzshared/GeneZip-CisReg-64BPT-100B`, y se redistribuyen con bytes idénticos verificados mediante hash SHA-256.

La relevancia del modelo reside en su enfoque: en lugar de un transformer convencional sobre tokens de ADN, GeneZip aplica un esquema de compresión de secuencia (de ahí el nombre) que reduce la longitud efectiva de la entrada y permite cubrir ventanas de 12.800 bp con un coste computacional contenido. Es un modelo de nicho, orientado a laboratorios de genómica computacional, sin soporte en la librería Transformers y con código de uso propio alojado en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GeneZip (checkpoint personalizado, no Transformers AutoModel); configuración exacta en `hydra_cfg.yaml` |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 12.800 bp (pares de bases) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias de ADN, no de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos PyTorch; repo de 0,3 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un checkpoint GeneZip con configuración registrada en `hydra_cfg.yaml`, que recoge arquitectura, límites de enrutamiento (*routing*) y metadatos científicos. La mención explícita a "routing" sugiere algún mecanismo de enrutamiento condicional, pero la model card no confirma si se trata de un MoE ni especifica el número de parámetros. El modelo no es un paquete estándar de Transformers, sino un checkpoint que requiere el código propio del proyecto.

El preentrenamiento se realizó sobre secuencias de ADN con contexto de 12.800 bp y un objetivo de compresión de 64 bp/token. El checkpoint redistribuido corresponde al paso 30.600 del entrenamiento original `GeneZip-CisReg-64BPT-100B`, lo que indica un corpus de entrenamiento de aproximadamente 100.000 millones de tokens (según la convención de nombres del repositorio fuente). No se especifican en la información disponible la composición del dataset, el uso de RLHF/DPO ni detalles sobre innovaciones como decodificación especulativa o atención lineal. El repositorio incluye un `provenance.json` con la revisión inmutable del origen y el hash de los pesos, y no contiene estados de optimizador ni pesos ajustados.

## Capacidades

- Modelado de secuencias de ADN: representación y predicción sobre ventanas de hasta 12.800 pares de bases.
- Preentrenamiento como base para ajuste fino en tareas genómicas posteriores (downstream), incluyendo las recetas de DNALongBench.
- Compresión de secuencia mediante tokenización a 64 bp/token, que reduce la longitud efectiva de la entrada.
- Integración con el código GeneZip para entrenamiento downstream mediante el parámetro `ckpt`.
- Evaluación de preentrenamiento mediante el evaluador del proyecto, usando `pretrained_ckpt` con la configuración de modelo y contexto correspondiente.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo de lenguaje natural.

## Casos de uso

- Investigación en modelado de genomas: usar los pesos como inicialización para estudiar cómo representan las secuencias reguladoras, aprovechando la ventana de 12.800 bp para capturar contextos de elementos cis-reguladores.
- Ajuste fino en tareas de anotación genómica: partir del checkpoint mediante `ckpt=andyjzhao/GeneZip-Regulome` en el código GeneZip para entrenar clasificadores de regiones funcionales sobre secuencias etiquetadas.
- Reproducción de resultados de DNALongBench: emplear las recetas del proyecto para evaluar el modelo en tareas de secuencias largas y comparar con las ejecuciones adoptadas en el mapeo de resultados del código.
- Experimentos de compresión de secuencia: analizar el efecto de la tokenización a 64 bp/token en la calidad de las representaciones frente a tokenizaciones de menor granularidad.
- Verificación de carga y ejecución: realizar *smoke checks* cortos que confirmen que los pesos cargan y ejecutan correctamente antes de lanzar entrenamientos largos.
- Base para estudios de eficiencia: evaluar el coste computacional de cubrir contextos largos de ADN con un esquema de compresión, comparándolo con transformers de ADN de contexto equivalente.
- Trazabilidad en publicaciones: citar el modelo con su hash de pesos y revisión fuente (`provenance.json`) para garantizar reproducibilidad en artículos científicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los *smoke checks* solo establecen la carga y ejecución, y que no constituyen nuevas mediciones del rendimiento completo en benchmarks; remite al mapeo de resultados del código para las ejecuciones adoptadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,3 GB, lo que sugiere que los pesos caben holgadamente en cualquier GPU consumer, pero el consumo real depende de la arquitectura y del contexto de 12.800 bp, no especificados.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU consumer: probable por el tamaño del repo (0,3 GB), pero no confirmada por el autor.
- Opciones de despliegue: no se soportan vLLM, llama.cpp, Ollama ni TGI, ya que no es un paquete Transformers. El despliegue requiere el código GeneZip de `AndyJZhao/GeneZip` y la descarga vía `huggingface_hub.snapshot_download`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de parámetros que permitan una comparación rigurosa con otros modelos de lenguaje de ADN (como DNABERT, Nucleotide Transformer o HyenaDNA). La comparación cualitativa posible se limita a la licencia Apache 2.0 y al contexto de 12.800 bp, sin cifras de benchmarks que respalden una tabla comparativa.

## Limitaciones y advertencias

- No es un checkpoint ajustado: no debe usarse directamente para predicción de tareas downstream sin ajuste fino previo.
- No es un paquete Transformers: requiere el código propio del proyecto; no funciona con `AutoModel` ni con pipelines estándar.
- La model card advierte de que los *smoke checks* no son mediciones de rendimiento en benchmarks; no deben citarse como resultados.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas, dado que el modelo opera sobre secuencias de ADN y no sobre lenguaje natural.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de documentación sobre el dataset de entrenamiento limita la evaluación de riesgos en producción.
- El checkpoint corresponde a un paso intermedio (30.600) del entrenamiento original, no al modelo final; su rendimiento puede diferir del reportado en el artículo.
- El código de la versión *camera ready* se estaba preparando por separado en el momento de la publicación; los pesos se validaron con un release candidate local, lo que introduce un riesgo de incompatibilidad con versiones futuras del código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andyjzhao/GeneZip-Regulome
- Repositorio fuente de los pesos: https://huggingface.co/jzshared/GeneZip-CisReg-64BPT-100B/tree/e8c84abc9ae814f296f04efbdc09410c18c92a81/checkpoint-30600
- Código GeneZip: https://github.com/AndyJZhao/GeneZip

# andyjzhao/GeneZip-70M

## Resumen

GeneZip-70M es un modelo de lenguaje de ADN preentrenado de tipo transformer, desarrollado por andyjzhao y publicado bajo el nombre definitivo («Camera Ready») del proyecto GeneZip. El modelo resuelve la tarea de modelado de secuencias genómicas: aprender representaciones y distribuciones de secuencias de ADN para su uso posterior en tareas de biología computacional y genómica, como la receta de evaluación DNALongBench que menciona el autor. Se distribuye como pesos preentrenados, no como checkpoint ajustado para una tarea concreta.

El modelo tiene 70 millones de parámetros, una ventana de contexto de preentrenamiento de 12.800 pares de bases (bp) y un objetivo base de compresión de 32 bp por token. Es relevante ahora porque el ecosistema de modelos de lenguaje genómicos está creciendo rápido y GeneZip se publica con licencia Apache 2.0, pesos verificables por hash SHA-256 y un repositorio de código propio, lo que facilita su reproducción y uso en investigación. No obstante, la información pública disponible es escasa: no hay datos de benchmarks, idiomas ni pipeline declarados en el repositorio.

El repositorio pesa 0,3 GB y contiene únicamente los pesos preentrenados, la configuración de Hydra reducida a arquitectura, enrutamiento y metadatos científicos, y un fichero de procedencia. No incluye pesos ajustados ni estado del optimizador. El modelo no es un paquete estándar de Transformers (AutoModel), sino que requiere el código propio de GeneZip para cargarse y ejecutarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de tipo GeneZip (configuración exacta en `hydra_cfg.yaml`); no disponible el detalle de capas y dimensiones |
| Parametros totales | 70 millones (según nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | 12.800 bp (contexto de preentrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de secuencias de ADN); no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos PyTorch propios (checkpoint GeneZip); no es un paquete Transformers AutoModel |

## Arquitectura y entrenamiento

GeneZip-70M es un modelo de lenguaje de ADN basado en transformer, con un objetivo de compresión de 32 bp por token como base de diseño (el autor aclara explícitamente que no es la ratio de compresión medida). El modelo se preentrenó con una ventana de contexto de 12.800 pares de bases. El checkpoint publicado corresponde al paso 30.600 del entrenamiento de origen `jzshared/GeneZip-7R-LT-32BPT-100B`, cuyo nombre sugiere un presupuesto de entrenamiento de 100B tokens, aunque este dato no se confirma de forma explícita en la model card.

La configuración de arquitectura, enrutamiento y metadatos científicos se distribuye en `hydra_cfg.yaml`, y la procedencia inmutable (revisión de origen y hash SHA-256 de los pesos) en `provenance.json`. Los bytes de los pesos son idénticos a la fuente fijada, con hash `babdd426ed886df755fb5f2f3f3665eae113e855c3596eb06a9b49a114ddb8f9`. No se detalla en la información disponible la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Modelado de secuencias de ADN: el modelo aprende la distribución de secuencias genómicas y sirve como base preentrenada para tareas posteriores.
- Representaciones para downstream: los pesos están pensados para entrenamiento posterior en tareas genómicas mediante el código de GeneZip.
- Evaluación en recetas DNALongBench: el autor indica que el modelo se enmarca en las recetas de evaluación DNALongBench del proyecto.
- Carga y ejecución mediante el código propio de GeneZip, que acepta `ckpt=andyjzhao/GeneZip-70M` para entrenamiento downstream.
- Generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, function calling y agentes: no disponible (no son capacidades declaradas para este modelo).
- Capacidades multilingües: no aplica; el modelo opera sobre alfabeto de ADN, no sobre lenguaje natural.

## Casos de uso

- Investigación en modelado de genomas: usar GeneZip-70M como modelo base preentrenado para estudiar cómo un transformer captura dependencias de largo alcance en secuencias de ADN de hasta 12.800 bp.
- Ajuste fino para tareas genómicas downstream: cargar el checkpoint con `ckpt=andyjzhao/GeneZip-70M` en el código de GeneZip y entrenar sobre tareas específicas (por ejemplo, clasificación de regiones genómicas o predicción de elementos funcionales), aprovechando que se distribuyen pesos preentrenados y no un checkpoint de tarea.
- Reproducción de resultados: al incluir `provenance.json` con la revisión de origen y el hash SHA-256, el modelo permite verificar que los pesos son idénticos a la fuente y reproducir experimentos de forma auditable.
- Evaluación con DNALongBench: emplear el modelo dentro de las recetas de DNALongBench del proyecto para comparar recetas de evaluación en secuencias largas de ADN.
- Experimentos de compresión de secuencias: estudiar el objetivo de 32 bp por token como esquema de tokenización de ADN y su impacto en el modelado, dado que el autor distingue explícitamente entre objetivo de compresión y ratio medido.
- Docencia y prototipado en bioinformática: el tamaño de 70M parámetros y el repositorio de 0,3 GB permiten cargar el modelo en entornos de laboratorio con recursos moderados para prácticas de modelado de secuencias, sujeto a los requisitos del código GeneZip.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que las comprobaciones cortas de carga y ejecución («smoke checks») no constituyen nuevas mediciones de rendimiento completo en benchmarks, y remite al mapeo de resultados del código para las ejecuciones adoptadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 70M parámetros, una estimación orientativa en fp32 sería de aproximadamente 0,28 GB solo para pesos, y en fp16 de aproximadamente 0,14 GB, sin contar activaciones ni memoria del código GeneZip; estas cifras son estimaciones y no datos publicados por el autor.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No disponible de forma oficial; por tamaño de parámetros, es plausible en GPU de consumo, pero no hay confirmación del autor.
- Opciones de despliegue: código propio de GeneZip (repositorio GitHub AndyJZhao/GeneZip); no se declara soporte para vLLM, llama.cpp, Ollama ni TGI, y el modelo no es un paquete Transformers AutoModel.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos de lenguaje de ADN de tamaño similar) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio contiene únicamente pesos preentrenados; no hay pesos ajustados para tareas downstream ni estado del optimizador.
- No es un paquete Transformers AutoModel: requiere el código propio de GeneZip, y el autor advierte que la actualización del código «Camera Ready» se está preparando por separado (los pesos se han comprobado con su release candidate local).
- Las comprobaciones cortas de carga y ejecución no son mediciones de rendimiento completo en benchmarks; no deben interpretarse como resultados de evaluación.
- No se publican datos de sesgos, riesgo de alucinación ni limitaciones de contexto o idioma; al operar sobre secuencias de ADN, los riesgos de sesgo se refieren al dataset genómico de entrenamiento, cuya composición no se detalla.
- Licencia Apache 2.0: permite uso comercial con las condiciones de la licencia, pero el autor restringe el uso previsto a investigación en modelado de secuencias genómicas y recetas DNALongBench.
- Uso previsto limitado a investigación; no se declara validación para aplicaciones clínicas o de producción.
- El nombre del checkpoint de origen (`GeneZip-7R-LT-32BPT-100B`) sugiere 100B tokens de entrenamiento, pero este dato no se confirma explícitamente en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/andyjzhao/GeneZip-70M
- Repositorio de código GeneZip: https://github.com/AndyJZhao/GeneZip
- Checkpoint de origen: https://huggingface.co/jzshared/GeneZip-7R-LT-32BPT-100B/tree/40a4039a589288939c551b3c330a1c3562b2b15a/checkpoint-30600

# beapen/gt-embed-small-v1

## Resumen

gt-embed-small-v1 es un modelo de embeddings para secuencias codificantes de ADN (CDS) humanas, desarrollado por Bell Eapen (usuario `beapen` en Hugging Face). Se trata de la variante "small" de una familia de tres modelos (Minimal, Small y Regular) que comparten el mismo pipeline de entrenamiento y tokenizador. El modelo convierte una secuencia de ADN codificante en un vector denso de 512 dimensiones, normalizado en L2, apto para tareas de similitud, agrupamiento y recuperación sobre secuencias genómicas.

La innovación principal no está en la arquitectura, sino en el tokenizador: el Genomic Tokenizer tokeniza a nivel de codón (triplete de nucleótidos) en lugar de a nivel de nucleótido individual, con un vocabulario de 26 tokens. Esto alinea la representación con la unidad funcional de la traducción proteica y reduce la longitud efectiva de la secuencia respecto a un tokenizador por base.

El modelo es muy compacto (~10M parámetros, 4 capas, 512 dimensiones ocultas) y está pensado para investigación en genómica y bioinformática, no para uso clínico. Su relevancia actual es la de ofrecer una alternativa ligera y de código abierto para construir pipelines de embeddings genómicos sin depender de modelos proteicos o genómicos de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Encoder (4 capas, 8 cabezas de atencion) |
| Parametros totales | ~10M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (~6144 nucleotidos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (secuencias de ADN; entrenado solo con GRCh38 humano) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`) + `config.json` |
| Dimension oculta | 512 |
| Dimension del embedding | 512 (normalizado L2) |
| Vocabulario | 26 tokens (Genomic Tokenizer) |
| Objetivo de entrenamiento | Aprendizaje contrastivo (instance discrimination) |
| Framework | PyTorch 2.5.1 |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de 4 capas y 8 cabezas de atención, con tamaño oculto de 512 y una proyección final a un embedding de 512 dimensiones normalizado en L2. La entrada se tokeniza con el Genomic Tokenizer, que mapea cada codón (3 nucleótidos) a uno de 20 tokens de aminoácido, más 6 tokens especiales (`[CLS]`, `[SEP]`, `[BOS]`, `[MASK]`, `[PAD]`, `[UNK]`). El entrenamiento usa aprendizaje contrastivo por discriminación de instancias, sin que la model card detalle el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de la fuente.

Los datos de entrenamiento proceden de GENCODE v50 sobre el ensamblado GRCh38: aproximadamente 17.000 transcritos codificantes de proteína humanos. El preprocesado incluye extracción de CDS desde anotaciones GTF, reconstrucción de secuencias desde el genoma de referencia y control de calidad con verificación de codón de inicio/parada y validación del marco de lectura. No se documenta el uso de RLHF, DPO ni fases de ajuste fino posteriores al entrenamiento contrastivo.

## Capacidades

- Generación de embeddings densos de 512 dimensiones para secuencias CDS de ADN, normalizados en L2.
- Similitud semántica entre secuencias codificantes mediante distancia coseno o producto escalar.
- Agrupamiento (clustering) y recuperación (retrieval) de secuencias génicas por similitud funcional.
- Procesamiento por lotes (batch) con padding y máscara de atención.
- Manejo de secuencias de hasta 2048 tokens (~6144 nucleótidos).
- Tokenización a nivel de codón, alineada con la traducción proteica.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de visión o audio: es un modelo de embeddings puro, no generativo.

## Casos de uso

- Priorización de genes en investigación de enfermedades raras: generar embeddings de los CDS de un panel de genes candidatos y ordenar por similitud con genes ya asociados a un fenotipo, como herramienta de apoyo en fase de investigación.
- Anotación funcional de variantes noveles: comparar la secuencia codificante que contiene la variante con secuencias de referencia y con genes de función conocida para proponer una anotación preliminar.
- Construcción de grafos de conocimiento gen-enfermedad: usar los embeddings como representación vectorial de los genes y enlazarlos con entidades de enfermedad en una base de datos de grafos.
- Búsqueda de secuencias homólogas o parálogas en bases de datos internas: indexar un corpus de CDS en un índice vectorial (por ejemplo FAISS) y hacer recuperación por similitud con una secuencia de consulta.
- Deduplicación y control de calidad de datasets genómicos: detectar secuencias casi idénticas o duplicadas en un corpus de CDS antes de usarlo para entrenamiento o análisis.
- Clasificación ligera de familias génicas: entrenar un clasificador lineal sobre los embeddings de 512 dimensiones para separar familias de genes en un entorno de investigación con recursos limitados.
- Prototipado rápido en desarrollo: al ser un modelo de ~10M parámetros y 0,1 GB de repositorio, permite iterar en portátil o en CPU para validar pipelines antes de pasar a la variante Regular.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con pesos en FP32 (~40 MB de pesos para ~10M parámetros); el grueso del consumo es el overhead de PyTorch y el tamaño de los lotes.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida; también funciona en CPU.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no es un modelo generativo ni usa formato GGUF). El despliegue previsto es PyTorch nativo con el paquete `genomic-tokenizer` y las clases del repositorio `gtembed`.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gt-embed-small-v1 | ~10M | 2048 tokens | 512 | no disponible | Hugging Face (`beapen/gt-embed-small-v1`) |
| gt-embed-minimal-v1 | ~2M | no disponible | 256 | no disponible | Hugging Face (misma familia) |
| gt-embed-regular-v1 | ~50M | no disponible | 768 | no disponible | Hugging Face (misma familia) |

No se dispone de información sobre modelos de terceros comparables (por ejemplo, modelos de embeddings genómicos de otros autores) en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre genes codificantes de proteína de GENCODE v50; no incluye regiones reguladoras ni secuencias no codificantes.
- Entrenado exclusivamente con genoma humano (GRCh38); no se garantiza su comportamiento en otras especies.
- Longitud máxima de 2048 tokens (~6144 nucleótidos); secuencias más largas deben truncarse o dividirse.
- La model card indica explícitamente que la variante Small es para investigación y tareas moderadas, y recomienda la variante Regular para producción.
- No ha pasado validación clínica y no está aprobado para uso clínico, diagnóstico ni atención al paciente.
- Riesgo de interpretación biológica incorrecta: las predicciones deben verificarse con datos experimentales.
- No se documenta la licencia, lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de usarlo en producción.
- No se documentan sesgos específicos, pero al derivarse de un único ensamblado de referencia humano puede infrarrepresentar variación poblacional.
- El código de carga requiere el paquete `gtembed` (clases `CDSEmbeddingModel` y `ModelConfig`) y `genomic-tokenizer`, ambos del mismo autor; no hay integración con `transformers`.
- No hay métricas de evaluación publicadas, por lo que no es posible comparar su calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beapen/gt-embed-small-v1
- Repositorio GTEmbed: https://github.com/dermatologist/gtembed
- Genomic Tokenizer: https://github.com/dermatologist/genomic-tokenizer
- Web del autor: https://nuchange.ca
- GENCODE v50: no disponible enlace directo en la información proporcionada
- GRCh38: no disponible enlace directo en la información proporcionada

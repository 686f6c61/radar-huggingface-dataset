# athanzli/MicroGlot

# MicroGlot

## Resumen
MicroGlot es un modelo de lenguaje genómico disperso (sparse) desarrollado por el usuario athanzli, diseñado para el análisis de ADN microbiano. Se trata de un transformer decoder-only de 23 capas con arquitectura de mezcla de expertos (MoE) entrenado mediante predicción del siguiente token sobre 378.300 millones de nucleótidos procedentes de 3,70 millones de secuencias de 99.700 especies microbianas, que abarcan bacterias, arqueas, hongos, protistas, virus y plásmidos.

La innovación principal es la incorporación de información taxonómica: el modelo codifica la jerarquía taxonómica como embeddings hiperbólicos (Poincaré) aprendidos de forma independiente al objetivo de modelado del lenguaje. Estos embeddings se utilizan tanto como token de entrada como para guiar el enrutamiento de expertos, lo que permite condicionar las representaciones por especie. Se publican dos checkpoints: MicroGlot (con codificador de especies, 2,98 B en el backbone más 2,98 B en el codificador) y MicroGlot-plain (solo backbone, sin información de especie).

El modelo está orientado a extracción de características (feature-extraction) y generación, con acceso a estados ocultos intermedios por capa para tareas de probing. Su relevancia actual radica en que ofrece una alternativa taxonómicamente consciente a los modelos genómicos genéricos, útil cuando la identidad de la especie es relevante para la tarea downstream.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE) |
| Parametros totales | 5.967.859.036 (checkpoint raiz: 2,98 B backbone + 2,98 B codificador de especies); MicroGlot-plain: 2,98 B |
| Parametros activos | 479 M por token (backbone) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible (modelo sobre secuencias de ADN, no lenguaje natural) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (con `custom_code` / `trust_remote_code=True`) |

## Arquitectura y entrenamiento
MicroGlot es un transformer decoder-only de 23 capas con hidden size de 1024 y atención de consultas agrupadas (GQA) con 16 cabezas de consulta y 8 cabezas clave-valor de dimensión 64. La red feedforward usa SwiGLU con tamaño intermedio de 2816, normalización RMSNorm en pre-norm y codificación posicional rotatoria (RoPE) con θ = 500.000. El vocabulario de salida tiene 8192 entradas. La capa MoE contiene 312 expertos enrutados según un calendario en forma de U `[4,64,4,32,4,16,4,8,4,8,4,8,4,8,4,8,4,16,4,32,4,64,4]`, con enrutamiento top-1 más una feedforward compartida siempre activa, de ahí que solo se activen 479 M parámetros por token.

El entrenamiento utilizó 378.300 millones de nucleótidos de 3,70 millones de secuencias repartidas entre 99.700 especies. La innovación técnica central es el condicionamiento taxonómico: un embedding de Poincaré de 32 dimensiones, aprendido de forma independiente al objetivo de modelado del lenguaje, se emplea como token de entrada y para dirigir el enrutamiento de expertos. El tokenizador añade automáticamente `[BOS]` y `[EOS]`, replicando el preprocesado del preentrenamiento. No se detalla en la información disponible el uso de RLHF, DPO ni la composición exacta de los datos más allá del recuento de nucleótidos y especies.

## Capacidades
- Extracción de características (feature-extraction): genera embeddings de secuencias de ADN de dimensión 1024.
- Condicionamiento por especie: acepta un nombre de especie (resolución flexible de mayúsculas, guiones y espacios) y usa su embedding taxonómico precalculado.
- Inferencia de taxonomía para especies desconocidas: si se omite la especie, un codificador integrado infiere el embedding a partir de la secuencia.
- Suministro manual de vectores taxonómicos de 32 dimensiones (`species_emb`).
- Generación de texto por predicción del siguiente token (logits de tamaño 8192).
- Acceso a estados ocultos intermedios por capa (23 capas) para probing capa a capa.
- Recursos taxonómicos: embeddings unit-norm para 99.700 especies y linaje sobre siete rangos (género, familia, orden, clase, filo, reino, dominio/reino).
- Soporte de tool calling / function calling: no aplicable (no es un modelo de lenguaje natural).
- Capacidades multilingües: no aplicable.
- Modo de pensamiento, visión o audio: no disponible.

## Casos de uso
- Anotación taxonómica de metagenomas: dado un fragmento de ADN de origen desconocido, el modelo infiere un embedding taxonómico y permite asignar la especie o género más probable, útil en estudios de microbioma ambiental o clínico.
- Extracción de embeddings para clasificación supervisada: los vectores de 1024 dimensiones pueden alimentar clasificadores ligeros para tareas como predicción de patogenicidad, hábitat o función ecológica, evitando el coste de entrenar un modelo desde cero.
- Búsqueda de similitud y agrupamiento (clustering) de secuencias: los embeddings facilitan la agrupación de secuencias por proximidad semántica, como alternativa o complemento a la comparación por alineamiento.
- Detección de organismos novedosos: cuando una especie no está en la tabla de 99.700, el codificador integrado genera un embedding a partir de la secuencia, lo que permite caracterizar taxones no catalogados.
- Probing a nivel de capa: el acceso a los 23 estados ocultos permite identificar qué capa codifica mejor una propiedad biológica concreta (por ejemplo, genes de resistencia), barriendo `layer` sobre la tarea objetivo.
- Análisis de virus y plásmidos: al incluir estos elementos en el preentrenamiento, puede emplearse para estudiar movilidad genética y transferencia horizontal en contextos donde el ADN móvil es relevante.
- Generación condicionada para diseño y exploración de secuencias: la cabeza de predicción de siguiente token permite generar y puntuar secuencias candidatas bajo un contexto taxonómico dado.
- Investigación en representaciones hiperbólicas: el uso de embeddings de Poincaré como entrada y como guía de enrutamiento convierte al modelo en una plataforma para estudiar geometría jerárquica en datos biológicos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada en bfloat16: aproximadamente 12 GB para el checkpoint raiz (5,97 B) y aproximadamente 6 GB para MicroGlot-plain (2,98 B), sin contar activaciones ni caché.
- GPU recomendadas: para el checkpoint raiz se recomienda al menos una GPU con 16-24 GB (RTX 4090, RTX 3090, A100 40 GB, H100). MicroGlot-plain es más ligero y puede ejecutarse en GPUs de 8-12 GB según el lote y la longitud de secuencia.
- Cabe en GPU de consumo: sí; MicroGlot-plain en RTX 3080/4080/4090 y el checkpoint raiz en RTX 3090/4090.
- Opciones de despliegue: `transformers` (versión fijada 4.51.3) con `trust_remote_code=True`, la capa de conveniencia `microglot.py` incluida en el repositorio, y `flash-attn` opcional para el kernel rotatorio (con retroceso a una implementación equivalente en PyTorch puro). vLLM, TGI, llama.cpp u Ollama no están mencionados en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
| Modelo | Categoria | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| MicroGlot | LM genómico MoE con condicionamiento taxonómico | 5,97 B (2,98 B backbone) | no disponible | CC-BY-4.0 | Embeddings de Poincaré para 99.700 especies |
| MicroGlot-plain | LM genómico MoE sin taxonomía | 2,98 B (479 M activos) | no disponible | CC-BY-4.0 | Variante sin información de especie |
| Otros modelos genómicos (familia Nucleotide Transformer, Evo, DNABERT-2, GENA-LM) | LM genómicos | no disponible | no disponible | no disponible | Datos comparativos fuera de la informacion proporcionada |

No se dispone en la informacion proporcionada de cifras verificables de parámetros, contexto o rendimiento de alternativas, por lo que la comparación numerica se marca como no disponible.

## Limitaciones y advertencias
- Sesgos conocidos: no disponibles; el comportamiento depende de la representación taxonómica y del sesgo de la composición del dataset de 99.700 especies, que puede sobrerrepresentar organismos bien secuenciados (por ejemplo, patógenos modelo) frente a taxones poco estudiados.
- Riesgo de alucinacion: al ser un modelo generativo por predicción del siguiente token, existe riesgo de producir secuencias plausibles pero no válidas biológicamente; las salidas deben validarse experimental o computacionalmente.
- Limitaciones de contexto o idioma: la longitud de contexto no está documentada; el modelo opera sobre secuencias de ADN y no sobre lenguaje natural, por lo que no se le pueden pedir tareas de texto convencionales.
- La resolución de nombres de especie es flexible, pero las especies fuera del conjunto de 99.700 requieren invocar el codificador integrado o aportar un vector taxonómico manual.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial y modificaciones con atribución, pero conviene revisar las condiciones de atribución y de los recursos derivados (embeddings y taxonomía).
- Para producción: requiere fijar `transformers==4.51.3` y usar `trust_remote_code=True`, ya que el modelo incluye código personalizado; esto implica revisar el código remoto antes de desplegarlo en entornos sensibles.
- No se han publicado benchmarks ni métricas de rendimiento verificables en la información disponible, lo que dificulta estimar su calidad frente a alternativas.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/athanzli/MicroGlot
- Manuscrito: A Taxonomy-Informed Sparse DNA Foundation Model for Microbial Genomics: https://www.biorxiv.org/content/10.64898/2026.09.22.753215v1

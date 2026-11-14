# jadermcs/lexsplade-xlm-roberta-large-silver-xlwic-ko

## Resumen

LexSPLADE XLM-RoBERTa-large silver XL-WiC Korean es un codificador léxico disperso (sparse encoder) desarrollado por jadermcs. A diferencia de los modelos de embeddings de frases habituales, devuelve un vector disperso sobre el vocabulario de 250.004 tokens de XLM-RoBERTa que describe una palabra concreta en su contexto: es un embedding de palabra en contexto, no de oración. Al estar las dimensiones alineadas con entradas del vocabulario, el vector puede leerse directamente como una lista de palabras relacionadas.

El modelo parte de LexSPLADE XLM-RoBERTa-large silver (entrenado con pares palabra-en-contexto en inglés) y se afina sobre la parte coreana de XL-WiC para mejorar la distinción de sentidos en coreano, manteniendo intacta la calidad en inglés. Está pensado para tareas de desambiguación léxica (word sense disambiguation), semántica léxica y extracción de características a nivel de palabra.

Es relevante porque ofrece una representación léxica interpretable y dispersa con arquitectura transformer estándar (XLM-RoBERTa-large, 560 millones de parámetros), licencia Apache 2.0 y compatibilidad con sentence-transformers y Text Embeddings Inference. Su adopción es aún muy reducida (29 descargas), y el propio autor advierte de que se entrenó sobre el split de test de XL-WiC Korean, por lo que sus métricas en ese conjunto no son válidas como evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) con cabeza MLM y pooling de span objetivo para salida dispersa tipo SPLADE |
| Parametros totales | 560.144.532 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitada por `max_seq_length` de XLM-RoBERTa; el valor concreto no se especifica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería sentence-transformers; requiere `trust_remote_code=True` con `modeling_lexsplade.py`) |

## Arquitectura y entrenamiento

El modelo es un encoder XLM-RoBERTa-large con una cabeza de modelado de lenguaje enmascarado (MLM) que se aplica únicamente a los tokens marcados con `<t>` … `</t>` en la frase de entrada. El pooling de span objetivo es un módulo personalizado incluido en el repositorio (`modeling_lexsplade.py`), por lo que es obligatorio cargar el modelo con `trust_remote_code=True`. Los logits se centran con z = 2.5 y se enmascaran los tokens especiales, las stop words y los tokens sin letra ni dígito, produciendo un vector disperso sobre el vocabulario de 250.004 entradas.

El entrenamiento parte de LexSPLADE XLM-RoBERTa-large silver (semilla 42; la receta equivalente es la semilla 44) y utiliza 31.914 pares palabra-en-contexto en inglés (silver) más 1.270 pares de XL-WiC Korean (dev + test, 460 de 511 lemas), repetidos 4 veces. La selección de modelo se hizo sobre 148 pares de 51 lemas coreanos reservados, sin frases compartidas con el entrenamiento; el mejor resultado se obtuvo en la época 1 de 3 con lr 1e-5. La función de pérdida combina AnglE loss sobre los vectores dispersos de la palabra objetivo, un regularizador de FLOPS de SPLADE (1e-3) y un término de Barlow Twins sobre la representación densa del span.

## Capacidades

- Codificación léxica contextual: genera un vector disperso que describe una palabra concreta en una oración concreta.
- Interpretabilidad directa: las dimensiones del vector son entradas del vocabulario, por lo que puede leerse como una lista de palabras (por ejemplo, `ship`, `boat`, `barco`, `船`).
- Desambiguación de sentidos (word sense disambiguation) y semántica léxica.
- Similitud entre usos de una misma palabra mediante similitud coseno de los vectores dispersos.
- Multilingüe limitado a inglés y coreano.
- Extracción de características (`feature-extraction`) para pipelines de sentence-transformers.
- Compatible con Text Embeddings Inference y endpoints.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento.

## Casos de uso

- Desambiguación léxica en coreano: dado un término polisémico como 배 (barco, pera, vientre), el modelo devuelve vectores distintos según el contexto, lo que permite agrupar usos por sentido en corpus lingüísticos.
- Construcción de diccionarios y tesauros contextuales: al poder leer el vector como palabras, se pueden generar listas de sinónimos o términos relacionados para cada uso concreto de una palabra.
- Enriquecimiento de motores de búsqueda léxica: los vectores dispersos sobre el vocabulario permiten indexación tipo SPLADE y expansión de consultas con términos relacionados contextualmente.
- Investigación en semántica distribucional: comparación de representaciones de palabras en contexto entre modelos (LexSPLADE frente a XL-LEXEME) mediante similitud coseno y AUC.
- Análisis de homonimia en textos coreanos: detección de usos de homónimos (눈, 말, 다리, 차, 밤, 사과, 바람, 김, 병, 쓰다) para tareas de anotación y control de calidad lingüística.
- Evaluación de sistemas de embeddings léxicos: servir como referencia en experimentos de word-in-context para inglés y coreano con métricas de average precision y accuracy.
- Preprocesamiento para traducción o análisis de sentimiento: separar sentidos léxicos antes de pipelines posteriores que se benefician de representaciones desambiguadas.

## Benchmarks y rendimiento

| Conjunto | Modelo de partida AP / acc | Este modelo AP / acc |
|---|---|---|
| XL-WiC Korean, 51 lemas reservados (148 pares) | 83,06 / 77,0 | 85,95 / 83,1 |
| MCL-WiC test (inglés) | 96,17 / 91,9 | 96,35 / 91,4 |
| crosslemma dev (inglés) | 95,69 / 89,4 | 95,83 / 89,5 |

En 26 frases escritas a mano para 11 homónimos coreanos, el AUC de mismo sentido frente a distinto sentido fue de 0,965 para este modelo, 0,967 para el modelo de partida y 0,983 para XL-LEXEME (`pierluigic/xl-lexeme`). El autor señala que la diferencia se debe principalmente a 밤 en el sentido de «castaña», que ambos modelos LexSPLADE interpretan como «noche». Advertencia del autor: los lemas reservados también se usaron para seleccionar la época, por lo que la mejora en coreano es optimista, y el conjunto de 148 pares es pequeño. Además, el modelo se entrenó con el split de test de XL-WiC Korean, por lo que no deben reportarse puntuaciones de ese test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 560 millones de parámetros, en fp32 serían aproximadamente 2,2 GB de pesos y en fp16 alrededor de 1,1 GB, más el estado de activaciones y del tokenizador.
- GPU recomendadas: no especificadas por el autor; por tamaño, el modelo es apto para GPU de consumo con suficiente memoria (por ejemplo, RTX 3090 o RTX 4090 en fp16) y para GPU de datacenter (A100, H100) en despliegues por lotes.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 8 GB o más en fp16, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: sentence-transformers (con `trust_remote_code=True`), Text Embeddings Inference y endpoints compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (LexSPLADE XLM-R-large silver XL-WiC Korean) | 560.144.532 | no disponible | en, ko | apache-2.0 | Afinado sobre XL-WiC Korean; AUC 0,965 en homónimos coreanos |
| jadermcs/lexsplade-xlm-roberta-large-silver | no disponible | no disponible | en | no disponible | Punto de partida solo en inglés (semilla 44); AUC 0,967 en homónimos coreanos |
| jadermcs/lexsplade-xlm-roberta-xl-silver | no disponible | no disponible | en | no disponible | Variante XLM-R-XL, solo silver |
| pierluigic/xl-lexeme | no disponible | no disponible | no disponible | no disponible | Referencia en word-in-context; AUC 0,983 en homónimos coreanos |

## Limitaciones y advertencias

- Entrenado con el split de test de XL-WiC Korean: no deben reportarse métricas de ese test como evaluación válida.
- Entrenamiento con una sola semilla y datos coreanos escasos (frases de ejemplo de diccionario, mayoritariamente sustantivos).
- Los sentidos son léxicos: no separa usos pragmáticos como el sincero frente al irónico de una palabra (por ejemplo, 잘도).
- La mejora en coreano es optimista porque los lemas reservados también se usaron para seleccionar la época, y el conjunto de evaluación tiene solo 148 pares.
- Confusión conocida en 밤 («castaña» interpretado como «noche»).
- Requiere `trust_remote_code=True` y el módulo `modeling_lexsplade.py`, lo que implica ejecutar código del repositorio.
- Si los marcadores `<t>` … `</t>` quedan truncados por `max_seq_length`, el pooling recurre a la oración completa y devuelve un embedding de oración en lugar de uno de palabra.
- En coreano debe marcarse la palabra sin su partícula (`<t>배</t>가`, no `<t>배가</t>`).
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser un encoder de características, no genera texto libre.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento derivados de XL-WiC.

## Enlaces

- Hugging Face: https://huggingface.co/jadermcs/lexsplade-xlm-roberta-large-silver-xlwic-ko
- Modelo base: https://huggingface.co/jadermcs/lexsplade-xlm-roberta-large-silver
- Variante XLM-R-XL: https://huggingface.co/jadermcs/lexsplade-xlm-roberta-xl-silver
- XL-LEXEME: https://huggingface.co/pierluigic/xl-lexeme

# EasyOctopus/german-dictation-punctuation-model

## Resumen

El modelo `EasyOctopus/german-dictation-punctuation-model` es un checkpoint experimental de clasificación de tokens desarrollado por Mahir Isikli (EasyOctopus) para restaurar la puntuación final de palabra en transcripciones de dictado en alemán. Se trata de un ajuste fino del modelo base `distilbert/distilbert-base-german-cased`, con 66.812.165 parámetros y una arquitectura transformer encoder de tipo DistilBERT. El modelo clasifica el último subword de cada palabra delimitada por espacios y un decoder inserta las marcas de puntuación en los offsets originales, preservando los caracteres de la fuente.

El problema que aborda es concreto: los sistemas de reconocimiento automático de voz (ASR) en alemán suelen producir texto sin puntuación, lo que dificulta su lectura y su procesamiento posterior. Este checkpoint intenta recuperar esa puntuación a partir del texto transcrito. La variante seleccionada, denominada **all-marks**, se eligió mediante una regla de validación congelada y obtuvo un F1 de marcas del 45,7% en la evaluación interna, frente al 77,4% de un modelo previo denominado Horizon.

Es relevante ahora como ejemplo de modelo pequeño, ligero y de licencia permisiva (Apache 2.0) para una tarea de postprocesado de ASR, aunque el propio autor lo etiqueta como experimental y sus resultados quedan por debajo de la alternativa existente en ambas evaluaciones publicadas. El contexto de entrenamiento está limitado a 256 tokens incluyendo tokens especiales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT) para clasificación de tokens |
| Parámetros totales | 66.812.165 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens incluyendo tokens especiales (límite del ejemplo de inferencia) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | alemán (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `distilbert/distilbert-base-german-cased` en la revisión `6f96562de9886779ce7d48810dff8f5c4afb6d0b` y añade una cabeza de clasificación de tokens sobre la que se realiza el ajuste fino. La tarea consiste en clasificar el último subword de cada palabra delimitada por espacios; posteriormente, un decoder inserta las marcas de puntuación en los offsets originales sin modificar los caracteres del texto fuente. El ejemplo incluido rechaza entradas superiores a 256 tokens, incluidos los tokens especiales. Todas las actualizaciones de parámetros se realizaron en una única GPU NVIDIA A100-SXM4-80GB.

El entrenamiento se documenta con gran detalle en el repositorio: inicialización de la cabeza de puntuación con una semilla de estudio, SHA-256 inicial de los pesos `764a3ad5aa5f599cd1a93619eba403fb1cce7ad61b5abefd0e2bc129bc34ded5`, semilla 20261118, 3 épocas, tamaño de lote 24, optimizador AdamW con tasa de aprendizaje constante de 5e-05, weight decay de 0,01 y recorte de gradiente con norma 1. Se usa autocast BF16 cuando la tarjeta lo soporta. La ejecución original empleó PyTorch 2.6.0 con CUDA 12.4 y Transformers 4.49.0. El autor indica que las diferencias de CUDA, hardware y librerías pueden afectar a los resultados numéricos. Se compararon tres variantes controladas: `final-only` (entrena solo marcas de fin de frase), `all-marks` (aprende también marcas dentro del mensaje dictado) y `horizon` (modelo previo de restauración de puntuación). No se menciona uso de RLHF ni DPO.

## Capacidades

- Restauración de puntuación final de palabra en texto alemán procedente de dictado o transcripción ASR.
- Clasificación de tokens a nivel de subword con inserción de marcas en los offsets originales, preservando los caracteres fuente.
- Funcionamiento local en CPU o GPU mediante la librería Transformers.
- Incluye un script de inferencia (`infer.py`) con modo de autocomprobación (`--self-test`).
- Incluye un script de reentrenamiento (`training/retrain.py`) para reproducir las variantes controladas.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada al alemán.

## Casos de uso

- Postprocesado de transcripciones ASR en alemán: el modelo recibe el texto sin puntuar de un motor de reconocimiento de voz y añade marcas finales de palabra, mejorando la legibilidad de actas, notas de reunión y subtítulos. Es adecuado por su tamaño reducido y su ejecución local.
- Normalización de texto para pipelines de NLP posteriores: al restaurar puntuación antes de tareas de segmentación, análisis sintáctico o traducción, se facilita el procesamiento aguas abajo en sistemas que esperan texto puntuado.
- Preprocesado de dictados en herramientas de productividad: integración en editores o aplicaciones de dictado que reciben texto plano y necesitan una primera capa de puntuación antes de la revisión humana.
- Generación de subtítulos y transcripciones para vídeo o audio en alemán: el modelo puede aplicarse por lotes sobre segmentos de hasta 256 tokens para producir subtítulos más legibles.
- Investigación y docencia sobre clasificación de tokens: sirve como ejemplo reproducible de ajuste fino de DistilBERT con scripts de reentrenamiento, semillas y variantes controladas documentadas.
- Evaluación comparativa de modelos de restauración de puntuación: su condición de checkpoint experimental y sus métricas publicadas lo hacen útil como referencia en estudios de ablación frente a alternativas como Horizon.

## Benchmarks y rendimiento

Resultados de la evaluación interna del autor sobre las variantes controladas (F1 de marcas, marcas incorrectas añadidas, marcas omitidas, documentos con palabras modificadas y negativos marcados):

| Candidato | F1 de marcas | Marcas incorrectas añadidas | Marcas omitidas | Documentos con palabras modificadas | Negativos marcados |
|---|---:|---:|---:|---:|---:|
| final-only | 29,5% | 32 | 140 | 0/112 | 7/16 |
| all-marks | 45,7% | 40 | 112 | 0/112 | 8/16 |
| horizon | 77,4% | 33 | 44 | 0/112 | 9/16 |
| copy-input | 0,0% | 0 | 176 | 0/112 | 0/16 |

Evaluación sobre las 347 referencias públicas de FLEURS en alemán:

| Modelo | F1 de marcas |
|---|---:|
| german-dictation-punctuation-model (all-marks) | 42,0% |
| Horizon (punctuation-restoration-small) | 92,9% |

El autor señala que la supervisión interna de etiquetas mejoró el resultado sintético frente al entrenamiento `final-only`, pero que este checkpoint experimental quedó por debajo de Horizon en ambas evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 66,8 millones de parámetros, el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no se especifican; el entrenamiento original usó una NVIDIA A100-SXM4-80GB, pero la inferencia puede ejecutarse en CPU o en GPUs de gama baja.
- Cabe en GPU de consumo: sí, por el reducido número de parámetros, aunque el autor no publica cifras de VRAM ni de latencia.
- Opciones de despliegue: Transformers (carga mediante `AutoModelForTokenClassification` y `AutoTokenizer`); el repositorio incluye `infer.py`. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 de marcas (FLEURS alemán) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| german-dictation-punctuation-model | 66,8 M | 256 tokens | 42,0% | Apache 2.0 | Hugging Face |
| Horizon (punctuation-restoration-small) | no disponible | no disponible | 92,9% | no disponible | referenciado en la model card |
| final-only (variante del mismo estudio) | 66,8 M | 256 tokens | no evaluado en FLEURS | Apache 2.0 | reproducible con `training/retrain.py` |

## Limitaciones y advertencias

- Checkpoint etiquetado como experimental por el propio autor; no debe tratarse como un modelo de producción validado.
- Rendimiento inferior a Horizon en ambas evaluaciones publicadas (42,0% frente a 92,9% de F1 de marcas en FLEURS alemán).
- Los mensajes de entrenamiento y los mensajes de prueba generados son ficticios; las extracciones repetidas de slots dentro de una plantilla están correlacionadas.
- Las familias de los conjuntos de entrenamiento y prueba son disjuntas, pero comparten el mismo proceso de autoría.
- Los resultados no miden protección ni calidad de dictado sobre mensajes reales de clientes.
- Contexto limitado a 256 tokens incluyendo tokens especiales; entradas más largas son rechazadas por el ejemplo de inferencia.
- Solo soporta alemán.
- Riesgo de alucinación de puntuación: la variante all-marks añadió 40 marcas incorrectas en la evaluación interna.
- Licencia Apache 2.0, que permite uso comercial; el autor remite a LICENSE y NOTICE para la atribución de fuentes.
- No se documentan sesgos conocidos más allá de las advertencias sobre la naturaleza sintética de los datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EasyOctopus/german-dictation-punctuation-model
- Dataset asociado: https://huggingface.co/datasets/EasyOctopus/german-dictation-punctuation-data
- Modelo base: https://huggingface.co/distilbert/distilbert-base-german-cased
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios adicionales ni demos.

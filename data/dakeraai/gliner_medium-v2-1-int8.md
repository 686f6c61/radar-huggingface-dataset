# DakeraAI/gliner_medium-v2.1-int8

## Resumen

`DakeraAI/gliner_medium-v2.1-int8` es una compilación cuantizada a int8 en formato ONNX del modelo `urchade/gliner_medium-v2.1`, un extractor de entidades nombradas (NER) de tipo zero-shot basado en la arquitectura GLiNER. Lo publica Dakera, empresa detrás de un motor de memoria autoalojado para agentes de IA, con el objetivo de ofrecer inferencia rápida en CPU mediante ONNX Runtime sin renunciar a las entidades que detecta el modelo original. El checkpoint original es obra de Urchade Zaratiana y colaboradores, y todos los créditos de entrenamiento y evaluación les corresponden.

El modelo resuelve el problema de la extracción de entidades sin esquema fijo: en lugar de un conjunto cerrado de etiquetas, el usuario introduce las etiquetas deseadas en el propio prompt (`<<ENT>> etiqueta ... <<SEP>> texto`), lo que permite adaptar la extracción a dominios nuevos sin reentrenar. Esta compilación concreta está pensada para despliegues autoalojados donde no hay GPU disponible, con un grafo de 271,8 MB y una latencia mediana de 0,049 s por petición en el conjunto de chat interno de Dakera.

La relevancia actual radica en su uso como componente de memoria de agentes: Dakera lo emplea por defecto (hasta la versión 0.12.4) para poblar la memoria a largo plazo de agentes conversacionales con entidades extraídas de las interacciones. Frente a las exportaciones ONNX cuantizadas uniformemente de GLiNER, que según el autor "no encuentran nada", esta build mantiene las activaciones en FP32 y cuantiza solo los pesos, preservando la correlación de logits con el original (≥ 1.000) y el 100 % de las entidades en las pruebas multilingües del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER: transformer bidireccional con cabeza de spans (uni-encoder); exportado a ONNX |
| Parametros totales | no disponible (pesos int8 en 271,8 MB de grafo ONNX) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (spans de hasta 12 palabras por mención) |
| Tipos de cuantizacion | int8 block-wise (MatMulNBits, bloque 32, simétrico) en pesos; activaciones en FP32; embedding de palabras int8 por fila |
| Idiomas soportados | inglés declarado; evaluación multilingüe del autor en de, en, es, fr, hi, it, pt y zh |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx`), más `tokenizer.json` y `gliner_config.json` |

## Arquitectura y entrenamiento

El modelo subyacente es GLiNER (*Generalist Model for Named Entity Recognition using Bidirectional Transformer*, arXiv:2311.08526), un transformer bidireccional que trata el NER como emparejamiento entre representaciones de etiquetas y representaciones de spans de texto. La entrada sigue el formato `<<ENT>> etiqueta … <<SEP>> palabras del texto`, tokenizada como palabras pre-segmentadas, y la cabeza de spans puntúa combinaciones de hasta 12 palabras con una sigmoid y umbral 0,5. Esta compilación no reentrena el modelo: parte del checkpoint PyTorch original y aplica dos transformaciones. La primera factoriza exactamente la cabeza de spans, separando la primera capa densa en una parte de inicio y otra de fin calculadas una vez por palabra y plegando la última capa en el lado de las etiquetas; los logits resultantes difieren como máximo 7,6e-06 respecto al original y el coste pasa de por-span a por-palabra. La segunda cuantiza a 8 bits los pesos del codificador y de las cabezas, además de la tabla de embeddings, manteniendo las activaciones en FP32.

El autor indica que la build es reproducible con las mismas herramientas y proporciona sumas SHA-256 de los tres ficheros. La validación frente al original se hizo con frases sonda multilingües, con correlación de logits de al menos 1.000 y el 100 % de las entidades idénticas. No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del corpus, uso de RLHF/DPO); esa información corresponde a la model card original de `urchade/gliner_medium-v2.1`.

## Capacidades

- Extracción de entidades nombradas zero-shot: las etiquetas se definen en tiempo de inferencia mediante el prompt, sin reentrenamiento.
- Clasificación de tokens y detección de menciones de hasta 12 palabras, con puntuación sigmoid y umbral configurable (0,5 por defecto).
- Extracción multilingüe: aunque la model card declara solo inglés, el autor evalúa el modelo en alemán, español, francés, hindi, italiano, portugués y chino.
- Procesamiento de texto social y informal (evaluado en WNUT-17) y de noticias (CoNLL-2003).
- Segmentación de palabras específica: secuencias de letras, marcas y dígitos unidas por `-` o `_`, caracteres sueltos y caracteres chinos o japoneses individuales.
- Integración como componente de memoria de agentes en Dakera: extracción de entidades para almacenamiento y recuperación a largo plazo.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de token-classification.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Memoria a largo plazo de agentes conversacionales: Dakera lo usa para extraer personas, organizaciones y localizaciones de los turnos de chat y almacenarlas en su motor de memoria; la latencia de 0,049 s por petición permite ejecutarlo en línea sin penalizar la conversación.
- Enriquecimiento de bases de conocimiento internas: dado un corpus de documentos (por ejemplo, tickets de soporte o correos), se definen etiquetas ad hoc como `producto`, `cliente` o `incidencia` y se pobla un grafo o índice de entidades sin entrenar un modelo específico.
- Anonimización y cumplimiento en pipelines de datos: detección de `persona`, `organización` y `localización` en texto en inglés para redactar o etiquetar información personal antes de almacenarla, con despliegue en CPU dentro del perímetro de la organización.
- Procesamiento de redes sociales y foros: el modelo está evaluado en WNUT-17 (F1 0,58), por lo que es adecuado para monitorización de menciones de marca y detección de entidades en texto informal, siempre asumiendo el ruido del dominio.
- Extracción de entidades en noticias para alertas y análisis: con F1 0,69 en CoNLL-2003, sirve para clasificar artículos por entidades y alimentar sistemas de seguimiento temático o de reputación.
- Preprocesado para RAG y búsqueda híbrida: las entidades extraídas pueden usarse como metadatos filtrables junto a la búsqueda vectorial, mejorando la precisión de recuperación en dominios con muchos nombres propios.
- Despliegue edge o autoalojado sin GPU: el grafo ONNX de 271,8 MB y la inferencia en un solo hilo de CPU lo hacen viable en contenedores modestos, tal como lo distribuye Dakera vía `docker run`.

## Benchmarks y rendimiento

Resultados publicados por el autor de la compilación, medidos a través del pipeline de extracción de Dakera (umbral 0,5; etiquetas `person`, `organization`, `location`; ONNX Runtime 1.31 con weight prepacking; un hilo de CPU por pasada en un AMD Ryzen 9 7950X):

| Conjunto | F1 |
|---|---|
| Dakera chat sentences, inglés (20 frases; 10 etiquetas) | 0,81 |
| Dakera chat sentences, 7 idiomas (44 frases; 10 etiquetas) | 0,76 |
| WNUT-17 (redes sociales, inglés) | 0,58 |
| CoNLL-2003 (noticias, inglés) | 0,69 |

MultiCoNER v2 (150 frases por idioma):

| de | en | es | fr | hi | it | pt | zh |
|---|---|---|---|---|---|---|---|
| 0,45 | 0,58 | 0,49 | 0,50 | 0,16 | 0,55 | 0,42 | 0,07 |

Latencia: mediana de 0,049 s por petición en el conjunto de chat. No se han publicado en la información disponible resultados comparativos frente a otros modelos en MMLU, HumanEval, GSM8K ni en tareas generativas, que no aplican a este modelo.

## Requisitos de hardware

- VRAM: no requiere GPU; el grafo ONNX ocupa 271,8 MB en disco y la inferencia es en CPU.
- CPU: el autor reporta mediciones en un AMD Ryzen 9 7950X con un hilo por pasada; no se especifican requisitos mínimos de núcleos ni de memoria RAM.
- GPU: no es necesaria; puede ejecutarse en A100, H100 o RTX 4090 mediante ONNX Runtime con proveedor CUDA, pero no se han publicado cifras de rendimiento en GPU.
- Despliegue: ONNX Runtime (con weight prepacking activado, que es el valor por defecto; desactivarlo hace las MatMul de 8 bits entre 4 y 5 veces más lentas), o el contenedor de Dakera (`ghcr.io/dakera-ai/dakera:latest`) configurando `DAKERA_GLINER_MODEL=gliner-medium`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de token-classification ONNX.
- Latencia y throughput: mediana de 0,049 s por petición en el conjunto de chat de Dakera con el hardware indicado; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| DakeraAI/gliner_medium-v2.1-int8 | GLiNER ONNX int8 | no disponible (271,8 MB) | no disponible | en (evaluado en 8 idiomas) | Apache-2.0 | ONNX |
| urchade/gliner_medium-v2.1 | GLiNER PyTorch | no disponible | no disponible | en (modelo base multilingüe según su card) | Apache-2.0 | safetensors/PyTorch |
| Exportaciones ONNX cuantizadas uniformemente de GLiNER | GLiNER ONNX int8 | no disponible | no disponible | según exportación | según exportación | ONNX |

La diferencia principal frente al checkpoint original es el formato y el coste de inferencia: esta build está optimizada para CPU con ONNX Runtime, con una factorización exacta de la cabeza de spans y cuantización solo de pesos. Frente a otras exportaciones ONNX cuantizadas uniformemente, el autor afirma que aquellas no detectan entidades, mientras que esta mantiene correlación de logits ≥ 1.000 con el original. No se dispone de datos de benchmarks comparativos directos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo declara únicamente inglés; el rendimiento multilingüe es desigual y muy bajo en hindi (F1 0,16) y chino (F1 0,07) según la evaluación del autor.
- El rendimiento en texto informal es limitado: F1 0,58 en WNUT-17, lo que implica falsos negativos y positivos frecuentes en redes sociales.
- Es un extractor de spans de hasta 12 palabras; entidades más largas o anidadas pueden no detectarse correctamente.
- No genera texto ni razona: no debe usarse para tareas generativas, tool calling ni agentes multi-paso.
- La calidad depende fuertemente del etiquetado introducido en el prompt y del umbral elegido (0,5 por defecto).
- La cuantización int8 introduce una diferencia máxima de 7,6e-06 en los logits respecto al original según el autor; aunque se validó con el 100 % de entidades idénticas en frases sonda, no se documenta una evaluación exhaustiva en todos los dominios.
- Es imprescindible mantener el weight prepacking de ONNX Runtime activado; desactivarlo degrada la latencia entre 4 y 5 veces.
- Licencia Apache-2.0, que permite uso comercial, pero los créditos del modelo base corresponden a Urchade Zaratiana y colaboradores; conviene citar el paper original (arXiv:2311.08526).
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no hay evidencia de adopción comunitaria ni de mantenimiento a largo plazo.
- No se documentan sesgos específicos del modelo base en la información disponible; al ser un NER entrenado sobre corpus mayoritariamente inglés y de noticias, es esperable un sesgo hacia ese dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DakeraAI/gliner_medium-v2.1-int8
- Modelo base original: https://huggingface.co/urchade/gliner_medium-v2.1
- Paper GLiNER (arXiv:2311.08526): https://arxiv.org/abs/2311.08526
- Web de Dakera: https://dakera.ai
- Documentación de Dakera: https://dakera.ai/docs
- GitHub de Dakera: https://github.com/Dakera-AI
- Licencia: https://huggingface.co/DakeraAI/gliner_medium-v2.1-int8/blob/main/LICENSE
- Imagen de contenedor: ghcr.io/dakera-ai/dakera:latest

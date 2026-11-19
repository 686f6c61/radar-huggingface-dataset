# Flogrammer/Mol-JEPA

## Resumen

Mol-JEPA es un modelo fundacional molecular multimodal desarrollado por Flogrammer. Se basa en una arquitectura de predicción conjunta de embeddings (JEPA, Joint Embedding Predictive Architecture) y se ha entrenado sobre 5 millones de moléculas que abarcan distintas modalidades. Su objetivo es predecir las modalidades ausentes a partir de las disponibles, generando representaciones latentes útiles para tareas posteriores de aprendizaje automático molecular.

El modelo no es un generador de texto ni un LLM: es un codificador que recibe una lista de cadenas SMILES y devuelve tres tipos de salida: los embeddings de modalidades predichas, el token CLS global y los embeddings latentes de modalidades de la penúltima capa. Estas representaciones se pueden usar como matriz de características para modelos posteriores, desde regresores tabulares como TabICL hasta sondas transformer específicas.

Con 45.406.772 parámetros y un repositorio de 0,2 GB, es un modelo compacto orientado a química computacional y descubrimiento de fármacos. Su licencia MIT y su integración con la API `AutoModel` de Hugging Face lo hacen accesible para investigación y uso comercial, aunque requiere `trust_remote_code=True` por incluir código de modelado personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Joint Embedding Predictive Architecture (JEPA) multimodal con codigo de modelado personalizado |
| Parametros totales | 45.406.772 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo molecular, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 512 |
| Modalidades de salida | 12 embeddings de modalidades predichas + 13 embeddings latentes |
| Entrada | Lista de cadenas SMILES |
| Dependencias | torch, torch-geometric, transformers, safetensors, rdkit, molfeat, numpy |

## Arquitectura y entrenamiento

Mol-JEPA emplea una arquitectura de predicción conjunta de embeddings (JEPA), un paradigma en el que el modelo aprende representaciones latentes prediciendo embeddings de una modalidad a partir de otras, en lugar de reconstruir la entrada original. El modelo es multimodal: procesa moléculas representadas como SMILES y produce embeddings para 12 modalidades distintas, además de un token CLS global de 512 dimensiones y 13 embeddings latentes extraídos de la penúltima capa. La dimensión de embedding es 512 en todos los casos.

El entrenamiento se realizó sobre 5 millones de moléculas que abarcan varias modalidades. La tarea de preentrenamiento consiste en predecir las modalidades ausentes a partir de las presentes, lo que fuerza al modelo a construir representaciones internas ricas y transferibles. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco probables en un modelo molecular de este tipo). Tampoco se detallan innovaciones como decodificación especulativa o atención lineal, que no aplican a este dominio.

## Capacidades

- Generación de embeddings moleculares a partir de cadenas SMILES.
- Predicción de embeddings de modalidades ausentes (12 modalidades de salida).
- Extracción de un token CLS global de 512 dimensiones como resumen de la molécula.
- Extracción de embeddings latentes de la penúltima capa (13 tokens de 512 dimensiones).
- Compatibilidad con la API `AutoModel` de Hugging Face mediante `trust_remote_code=True`.
- Salida estructurada como `ModelOutput` con acceso por nombre (`predictions`, `cls`, `embeddings`) y por índice.
- Uso como extractor de características para modelos posteriores (TabICL, sondas transformer).
- Procesamiento por lotes y recomendación de llamada en trozos para datasets grandes.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades lingüísticas: es un modelo puramente molecular.

## Casos de uso

- Descubrimiento de fármacos: generar embeddings de CLS para moléculas candidatas y usarlos como características en modelos de predicción de propiedades farmacocinéticas (ADMET), aprovechando que el modelo se entrenó sobre 5 millones de moléculas diversas.
- Predicción de propiedades moleculares: usar los embeddings de modalidades predichas combinados con una sonda transformer para tareas de regresión o clasificación sobre propiedades físico-químicas, donde el CLS puede perder detalles específicos de modalidad.
- Cribado virtual: codificar grandes librerías de compuestos en lotes y alimentar un regresor como TabICL para priorizar compuestos antes de síntesis o ensayos experimentales.
- Quimioinformática con RDKit: integrar el modelo en pipelines existentes que ya usan RDKit y molfeat para generar descriptores, sustituyendo o complementando descriptores clásicos con embeddings aprendidos.
- Aprendizaje por transferencia en datasets pequeños: congelar el modelo y entrenar solo una sonda ligera (por ejemplo, `TransformerProbe` de 2 capas y 4 cabezas) sobre datos etiquetados escasos, reduciendo el coste de anotación.
- Búsqueda de similitud molecular: usar el CLS de 512 dimensiones como vector para indexar moléculas y recuperar compuestos similares en espacios latentes, útil en análisis de vecindad química.
- Investigación en representaciones multimodales: estudiar cómo el modelo predice modalidades ausentes y qué información captura cada embedding latente, como base para experimentos de interpretabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 45,4 M de parámetros (aproximadamente 182 MB en fp32 y 91 MB en fp16), por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; RTX 3060, RTX 4090, A100 o H100 son más que suficientes. Para lotes grandes, una GPU con más memoria acelera el procesamiento.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (incluso integradas con suficiente memoria compartida).
- Opciones de despliegue: carga directa con `transformers` y `AutoModel` (con `trust_remote_code=True`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que están orientados a LLMs generativos y no aplican a este modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Se recomienda procesar en trozos para datasets grandes, según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Mol-JEPA (Flogrammer) | 45,4 M | no disponible | MIT | Hugging Face | JEPA multimodal, 12 modalidades, CLS de 512 dim |
| Modelos de embeddings moleculares tipo ChemBERTa | no disponible | no disponible | variable | Hugging Face | Codificadores basados en transformers sobre SMILES |
| Modelos de descriptores con molfeat | no disponible | no disponible | variable | Librería Python | Descriptores clásicos y aprendidos, no un modelo único |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo molecular, no lingüístico: no genera texto, no soporta tool calling, agentes ni razonamiento multi-step.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en producción.
- No se documentan sesgos conocidos, pero al entrenarse sobre 5 millones de moléculas, la cobertura química puede estar sesgada hacia los espacios químicos representados en el dataset de entrenamiento.
- Riesgo de extrapolación deficiente fuera de la distribución química de entrenamiento (por ejemplo, moléculas muy grandes, inorgánicas o con elementos poco representados).
- No se especifican limitaciones de contexto ni de idioma porque el modelo no procesa lenguaje natural.
- La licencia MIT permite uso comercial, pero se recomienda verificar las licencias de las dependencias (RDKit, torch-geometric, molfeat) y de los datos de entrenamiento, no detalladas en la información disponible.
- La model card recomienda procesar en trozos para datasets grandes; no se documentan límites de lote ni de memoria.
- Las salidas son embeddings, no predicciones finales: requieren un modelo posterior (TabICL, sonda transformer) para tareas supervisadas, lo que añade complejidad al pipeline.

## Enlaces

- Hugging Face: https://huggingface.co/Flogrammer/Mol-JEPA
- Repositorio del modelo (pesos y código): https://huggingface.co/Flogrammer/Mol-JEPA/tree/main
- TabICL (modelo recomendado para predicción downstream): no disponible enlace directo en la información proporcionada
- Paper de JEPA: no disponible enlace en la información proporcionada
- Documentación de RDKit: no disponible enlace en la información proporcionada
- Documentación de molfeat: no disponible enlace en la información proporcionada

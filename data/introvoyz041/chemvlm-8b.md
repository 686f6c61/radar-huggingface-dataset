# introvoyz041/ChemVLM-8B

## Resumen

ChemVLM-8B es un modelo de lenguaje multimodal de gran tamaño (LLM) diseñado específicamente para aplicaciones químicas. Desarrollado por el equipo AI4Chem, este modelo integra procesamiento de visión y lenguaje para abordar tareas que requieren comprender información visual en el dominio de la química, como estructuras moleculares, reacciones y preguntas de exámenes. Se trata de la versión de 8 mil millones de parámetros de ChemVLM, que también cuenta con una variante de 26B. Su arquitectura se basa en InternVLM (InternVL), un framework que combina un codificador de visión con un modelo de lenguaje. El modelo se entrenó con un dataset multimodal bilingüe cuidadosamente curado, lo que le permite entender tanto texto como imágenes químicas. Su relevancia radica en que muchos modelos químicos existentes no manejan información visual, y ChemVLM-8B cubre ese vacío con un rendimiento competitivo en tareas como OCR químico, razonamiento multimodal y comprensión de moléculas. Está disponible bajo licencia Apache 2.0 y se distribuye en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en InternVLM (InternVL), con componentes de vision y lenguaje |
| Parametros totales | 8.075.365.376 (8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el dataset de entrenamiento es bilingue, pero no se especifican los idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ChemVLM-8B sigue la arquitectura de InternVLM, que integra un codificador de vision (vision transformer) con un modelo de lenguaje autoregresivo. El modelo procesa imagenes dividiendolas en bloques dinamicos (hasta 6 bloques de 448x448 pixeles) y las combina con el texto para generar respuestas. El entrenamiento se realizo sobre un dataset multimodal bilingue que incluye estructuras moleculares, reacciones quimicas y preguntas de examenes de quimica. No se especifican detalles sobre el numero de tokens de entrenamiento ni sobre tecnicas de alineacion como RLHF o DPO; la informacion disponible sugiere un entrenamiento supervisado (SFT) sobre datos curados. No se mencionan innovaciones tecnicas adicionales mas alla de la adaptacion del framework InternVL al dominio quimico.

## Capacidades

- Generacion de texto y respuestas a preguntas en el dominio de la quimica, tanto en formato textual como visual.
- Reconocimiento optico de caracteres quimico (Chemical OCR): extrae informacion de imagenes con formulas, estructuras y reacciones.
- Razonamiento multimodal quimico: responde preguntas que requieren integrar informacion visual y textual, como identificar productos de reaccion o interpretar diagramas.
- Comprension de moleculas: analiza estructuras moleculares representadas en imagenes y proporciona informacion sobre ellas.
- Soporte de conversacion multimodal: puede mantener dialogos que alternan entre texto e imagenes.
- Capacidad bilingue (idiomas no especificados, probablemente chino e ingles segun el contexto del paper, aunque no confirmado en la ficha).

## Casos de uso

- Analisis de estructuras moleculares en investigacion: un quimico puede subir una imagen de una molecula y el modelo identifica grupos funcionales, enlaces o propiedades, acelerando la revision de compuestos.
- Asistencia en educacion quimica: estudiantes pueden fotografiar un problema de quimica de un libro y recibir una explicacion paso a paso, aprovechando el razonamiento multimodal.
- Extraccion de informacion de documentos cientificos: el modelo puede leer figuras, esquemas de reaccion y tablas de articulos de quimica para resumir o responder preguntas sobre ellos.
- Control de calidad en laboratorios: a partir de imagenes de cromatografias o espectros, el modelo puede ayudar a interpretar resultados y detectar anomalias.
- Automatizacion de fichas de seguridad quimica: convierte imagenes de etiquetas o diagramas de riesgo en texto estructurado para bases de datos.
- Generacion de informes de experimentos: combina imagenes de montajes experimentales con notas textuales para redactar resumenes de procedimientos y resultados.

## Benchmarks y rendimiento

La informacion proporcionada incluye resultados del modelo de 8B en cuatro tareas especificas:

| Dataset | Metrica | Resultado |
|---|---|---|
| MMChemOCR | Tanimoto similarity (tani@1.0) | 81.75 / 57.69 |
| CMMU | Score (%) con GPT-4o como juez | 52.7 (SOTA) |
| MMCR-bench | Score (%) con GPT-4o como juez | 33.6 |
| Reaction type | Accuracy (%) | 16.79 |

No se proporcionan comparaciones con otros modelos en la informacion disponible, aunque el valor de CMMU se indica como SOTA (estado del arte) en ese dataset.

## Requisitos de hardware

No se dispone de informacion oficial sobre requisitos de hardware en la documentacion proporcionada. Dado el tamano del modelo (8B parametros) y su naturaleza multimodal, se espera que requiera una GPU con al menos 16-24 GB de VRAM para inferencia en precision completa, y menos con cuantizacion, pero estos valores son estimaciones generales y no estan confirmados por el autor. No se mencionan opciones de despliegue especificas (vLLM, llama.cpp, etc.) en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la informacion proporcionada. El propio ChemVLM tiene una version de 26B (ChemVLM-26B) que podria considerarse una alternativa de mayor tamano, pero no se ofrecen comparaciones directas de rendimiento entre ambas versiones en la documentacion consultada.

## Limitaciones y advertencias

- No se documentan limitaciones especificas en la model card, pero al ser un modelo entrenado principalmente en datos quimicos, su rendimiento fuera de ese dominio puede ser limitado.
- Riesgo de alucinacion en respuestas generadas, especialmente en tareas de razonamiento complejo o cuando la imagen no es clara.
- El modelo es bilingue, pero no se especifican los idiomas exactos; podria tener un rendimiento desigual en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos de los datasets de entrenamiento si se utiliza en produccion.
- No se proporcionan detalles sobre sesgos potenciales o limitaciones de contexto, por lo que se debe validar el comportamiento en casos reales antes de un despliegue critico.

## Enlaces

- Modelo en HuggingFace (original): https://huggingface.co/AI4Chem/ChemVLM-8B
- Modelo en HuggingFace (espejo consultado): https://huggingface.co/introvoyz041/ChemVLM-8B
- Paper (arXiv): https://huggingface.co/papers/2408.07246
- Repositorio GitHub: https://github.com/AI4Chem/ChemVlm
- Dataset de entrenamiento SFT: https://huggingface.co/datasets/di-zhang-fdu/chemvlm-sft-datasets
- Version de 26B: https://huggingface.co/AI4Chem/ChemVLM-26B

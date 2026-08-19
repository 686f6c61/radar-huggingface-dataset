# HoangQuocViet25/nlp-btl-wikilingua-x5plus2

## Resumen

El modelo `HoangQuocViet25/nlp-btl-wikilingua-x5plus2` es un sistema de resumen automático de textos en vietnamita, desarrollado por HoangQuocViet25 como parte de un proyecto académico (BTL, probablemente "bài tập lớn" o trabajo de fin de curso). Se basa en el modelo `VietAI/vit5-base`, un transformer encoder-decoder de la familia T5 adaptado al vietnamita, y se ha ajustado sobre el dataset `huy-nh-2000/wikilingua`, una versión vietnamita del corpus WikiLingua para resumen de artículos.

El modelo incorpora dos innovaciones técnicas declaradas en su etiquetado: *segment-attention* (atención por segmentos) y *unlikelihood training* (entrenamiento con verosimilitud negativa) para reducir la repetición en las salidas generadas. Con 227 millones de parámetros, es un modelo de tamaño medio que puede ejecutarse en hardware de consumo. Su relevancia radica en ofrecer una alternativa open source (licencia MIT) para tareas de resumen en vietnamita, un idioma con menos recursos que el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5) |
| Parametros totales | 227.399.712 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso trunca a 1024 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura T5 (Text-to-Text Transfer Transformer), con un codificador y un decodificador basados en atención completa. Se parte de los pesos de `VietAI/vit5-base`, que ya ha sido preentrenado con un vocabulario y tokenizador específicos para vietnamita. El ajuste fino se realiza sobre el dataset WikiLingua en vietnamita, que contiene pares de artículos y resúmenes extraídos de Wikipedia.

Las etiquetas del modelo indican dos técnicas adicionales durante el entrenamiento: *segment-attention*, que probablemente modifica el mecanismo de atención para procesar el texto en segmentos y mejorar la coherencia en documentos largos, y *unlikelihood training*, una función de pérdida que penaliza la generación de tokens repetidos o no deseados, reduciendo así la repetición en los resúmenes. No se especifican detalles sobre el número de tokens de entrenamiento, el uso de RLHF/DPO ni otras fases de optimización.

## Capacidades

- Generación de resúmenes extractivos o abstractivos de textos en vietnamita, con salida en el mismo idioma.
- Manejo de documentos de entrada de hasta 1024 tokens según el ejemplo de uso proporcionado (truncamiento explícito en el código).
- Reducción de repeticiones en la salida gracias al entrenamiento con unlikelihood.
- Procesamiento por segmentos para mejorar la atención en textos largos (segment-attention).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Resumen de noticias en vietnamita: un medio de comunicación puede alimentar el modelo con artículos de prensa y obtener un titular o un resumen breve para portadas o alertas. Su tamaño moderado permite integración en servicios web con una GPU dedicada.
- Resumen de documentos legales o administrativos: abogados o gestores pueden condensar contratos o normativas en vietnamita para revisión rápida. La ventana de 1024 tokens es suficiente para párrafos o secciones individuales.
- Resumen de artículos académicos: investigadores pueden generar abstracts automáticos de papers en vietnamita, facilitando la revisión de literatura. El modelo es adecuado para textos de una o dos páginas.
- Preparación de datasets de entrenamiento: el modelo puede usarse para generar resúmenes sintéticos que luego sirvan para entrenar modelos más grandes o para aumentar datos en tareas de NLP vietnamita.
- Asistente de lectura en aplicaciones móviles: una app de noticias puede ofrecer un botón "resumir" que utilice este modelo en el backend, con latencia aceptable en una GPU de gama media.
- Archivado y catalogación de contenido: bibliotecas digitales pueden generar descripciones cortas de documentos vietnamitas para indexación y búsqueda, reduciendo el trabajo manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como ROUGE, MMLU o HumanEval para este modelo.

## Requisitos de hardware

- VRAM estimada: con 227M parámetros, en FP16 el modelo ocupa aproximadamente 0,45 GB de memoria, más los activos de atención. Una GPU con 4 GB de VRAM es suficiente para inferencia con batch pequeño.
- GPU recomendadas: NVIDIA T4, RTX 3060, RTX 4090 o cualquier GPU con al menos 4 GB de VRAM. También puede ejecutarse en CPU con cuantización (aunque no se proporcionan pesos GGUF).
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas como RTX 3060 o RTX 4060.
- Opciones de despliegue: al ser un modelo de HuggingFace con safetensors, puede servirse con vLLM, TGI, o mediante la librería `transformers` en un script Python. También es posible convertirlo a GGUF para usar con llama.cpp u Ollama, aunque no se ofrecen conversiones oficiales.
- Latencia y throughput: no disponible. Se estima una latencia de decenas de milisegundos por generación en una GPU moderna, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| HoangQuocViet25/nlp-btl-wikilingua-x5plus2 | 227M | no disponible | MIT | Resumen vietnamita con segment-attention y unlikelihood |
| VietAI/vit5-base | 220M (aprox.) | 512 (típico) | MIT | Modelo base T5 para vietnamita, sin ajuste para resumen |
| vinai/bartpho-word | 223M | 1024 | MIT | BART para vietnamita, usado en generación y resumen |

No se dispone de comparativas de rendimiento (ROUGE, etc.) entre estos modelos en la información proporcionada. La elección entre ellos dependerá de la tarea específica y de la disponibilidad de pesos ajustados.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos de WikiLingua, que proviene de Wikipedia; puede tener sesgos hacia el estilo enciclopédico y no generalizar bien a otros dominios (por ejemplo, lenguaje coloquial o técnico especializado).
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido factualmente incorrecto o inventar datos en los resúmenes.
- Limitación de idioma: solo soporta vietnamita; no se ha evaluado su comportamiento en otros idiomas.
- La ventana de contexto no está documentada oficialmente; el ejemplo de uso trunca a 1024 tokens, por lo que documentos más largos perderán información.
- No se han publicado evaluaciones de sesgos ni de robustez ante entradas adversarias.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario es responsable de verificar la calidad de las salidas en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HoangQuocViet25/nlp-btl-wikilingua-x5plus2
- Modelo base: https://huggingface.co/VietAI/vit5-base
- Dataset de entrenamiento: https://huggingface.co/datasets/huy-nh-2000/wikilingua

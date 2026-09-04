# Jongbin-kr/llama-3.1-8b-instruct_lbox-criminal-charge-aggregator_ffn-only

## Resumen

El modelo `Jongbin-kr/llama-3.1-8b-instruct_lbox-criminal-charge-aggregator_ffn-only` es un fine-tune de `meta-llama/Llama-3.1-8B-Instruct` desarrollado por Jongbin-kr. Está diseñado como un agregador de cargos criminales, lo que sugiere una especialización en el procesamiento de documentos legales. El sufijo "ffn-only" indica que solo se ajustaron las capas feed-forward del transformer, dejando las capas de atención congeladas.

El repositorio tiene un tamaño de 0.1 GB, lo que sugiere que no contiene los pesos completos, sino un adaptador o pesos parciales que deben combinarse con el modelo base. El modelo base tiene una ventana de contexto de 128K tokens y capacidades de generación de texto, razonamiento y seguimiento de instrucciones.

No se han publicado especificaciones detalladas sobre el conjunto de datos de entrenamiento, los parámetros totales del adaptador ni benchmarks de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1 8B Instruct) con ajuste FFN-only |
| Parámetros totales | no disponible |
| Longitud de contexto | 128K (heredada del modelo base) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

Nota: No se incluye la fila "Parámetros activos" porque no se trata de un modelo MoE.

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1 de Meta, un transformer decoder-only con 8.000 millones de parámetros y una ventana de contexto de 128K tokens. El fine-tune se realizó mediante SFT (Supervised Fine-Tuning) utilizando la librería TRL de Hugging Face, con las versiones TRL 0.29.1, Transformers 5.9.0, PyTorch 2.11.0, Datasets 4.4.1 y Tokenizers 0.22.2. El entrenamiento se registró en Weights & Biases (run `jjed9tku`), lo que permite consultar las métricas y configuraciones asociadas.

La etiqueta "ffn-only" indica que solo se actualizaron las capas feed-forward del transformer, mientras que las capas de atención se mantienen congeladas. Esta técnica reduce el número de parámetros entrenables y el coste computacional, y se utiliza a menudo en experimentos de Mixture of Experts (MoE) o en ajustes de dominio eficientes. De hecho, el autor ha publicado modelos relacionados con arquitecturas MoE, como `llama-3.1-8b-instruct-4x1-moe`, lo que sugiere que este modelo forma parte de una línea de experimentación. Sin embargo, en la información proporcionada no se detallan los datos de entrenamiento, el número de tokens ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Llama 3.1 8B Instruct, incluyendo generación de texto, razonamiento y seguimiento de instrucciones.
- Especialización en agregación de cargos criminales: el nombre del modelo indica que está afinado para tareas legales, específicamente para extraer o agregar cargos criminales a partir de documentos judiciales.
- Soporte de tool calling: el modelo base Llama 3.1 8B Instruct soporta function calling, y el fine-tune no debería eliminarlo, aunque no está confirmado en la documentación.
- Soporte de agentes y razonamiento multi-paso: el modelo base tiene capacidades de razonamiento, pero no se especifica para este fine-tune.
- Capacidades multilingües: el modelo base soporta varios idiomas, pero el fine-tune puede estar limitado a un dominio legal específico. No se especifican los idiomas soportados.
- Contexto largo: hereda la ventana de contexto de 128K tokens del modelo base.

## Casos de uso

- Análisis de documentos legales: el modelo puede utilizarse para procesar expedientes judiciales y extraer automáticamente los cargos criminales mencionados, facilitando la revisión de casos por parte de abogados.
- Agregación de cargos en sentencias: puede resumir y agregar los cargos imputados en múltiples documentos legales, lo que permite comparar casos similares de forma rápida.
- Asistencia en investigación legal: ayuda a investigadores a identificar patrones en cargos criminales a partir de grandes volúmenes de jurisprudencia, reduciendo el tiempo de análisis manual.
- Automatización de informes: genera informes preliminares de cargos para equipos legales, lo que reduce el trabajo de transcripción y permite centrarse en tareas de mayor valor.
- Integración en sistemas de gestión de casos: puede utilizarse como componente de un sistema de gestión documental para clasificar y etiquetar automáticamente documentos según los cargos criminales presentes.
- Soporte en entornos legales multilingües: dado que el modelo base es multilingüe, podría adaptarse a documentos legales en varios idiomas, aunque el fine-tune no especifica los idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se dispone de requisitos de hardware específicos para este modelo. Dado que se basa en Llama 3.1 8B Instruct y que el repositorio contiene un adaptador de 0.1 GB, los requisitos de inferencia dependen principalmente del modelo base:

- VRAM estimada para inferencia: para el modelo base en FP16 se necesitan aproximadamente 16

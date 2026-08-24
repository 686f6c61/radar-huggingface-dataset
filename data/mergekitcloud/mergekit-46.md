# MergekitCloud/mergekit-46

## Resumen

MergekitCloud/mergekit-46 es un modelo de lenguaje de 8.030 millones de parámetros creado mediante fusión (merge) de cuatro modelos base derivados de Llama-3.1-8B, utilizando la herramienta mergekit y el método Model Stock (arXiv:2403.19522). El modelo combina ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3, Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2 y Undi95/Llama3-Unholy-8B-OAS, tomando como base vicgalle/Humanish-Roleplay-Llama-3.1-8B. Está orientado a la generación de texto conversacional y roleplay, con un enfoque en respuestas menos censuradas que los modelos estándar.

Este modelo es relevante porque ejemplifica el flujo de trabajo de fusión de modelos sin entrenamiento adicional, una práctica común en la comunidad open source para combinar capacidades de distintos modelos base. Al estar construido sobre Llama-3.1-8B, hereda la arquitectura transformer decoder-only de Meta, con una ventana de contexto teórica de 128.000 tokens (aunque no se confirma en la documentación del merge). No se ha publicado información sobre su rendimiento en benchmarks, por lo que su evaluación práctica dependerá de pruebas directas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Llama-3.1-8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama-3.1-8B, presumiblemente 128K) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en float16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión mediante el método Model Stock, implementado con `mergekit`. Este método combina los pesos de varios modelos base sin entrenamiento adicional, ponderándolos según una estrategia de "stock de modelos" que busca preservar las capacidades de cada componente. En este caso, se fusionaron tres modelos: ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3, Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2 y Undi95/Llama3-Unholy-8B-OAS, todos ellos variantes de Llama-3.1-8B con ajustes para roleplay y respuestas menos restringidas.

La configuración YAML indica que se usó `normalize: false`, `int8_mask: true` y `dtype: float16`. No se realizó ningún entrenamiento adicional (ni fine-tuning ni RLHF), por lo que las capacidades del modelo dependen exclusivamente de los pesos fusionados y de la distribución de los modelos originales. Al no haber un proceso de entrenamiento propio, no se dispone de información sobre el dataset de entrenamiento ni sobre técnicas de alineación.

## Capacidades

- Generación de texto conversacional y de roleplay, heredada de los modelos base orientados a diálogo.
- Respuestas potencialmente menos censuradas que los modelos estándar de Llama-3.1, según la naturaleza de los modelos componentes (Lexi-Uncensored y Unholy-OAS).
- Capacidad multilingüe probable (Llama-3.1-8B soporta múltiples idiomas), pero no se confirma en el merge.
- No se especifica soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se indica capacidad de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Roleplay y ficción interactiva: el modelo puede generar diálogos y narrativas en contextos de personajes, gracias a la combinación de modelos especializados en roleplay.
- Prototipado rápido de chatbots sin censura: para pruebas de concepto en entornos de investigación, aunque se debe validar la calidad y los riesgos.
- Generación de contenido creativo (cuentos, guiones, diálogos) donde se requiera menor restricción temática.
- Experimentación con técnicas de fusión de modelos: como caso de estudio para desarrolladores interesados en `mergekit` y métodos como Model Stock.
- Aplicaciones de chat en entornos controlados donde se evalúe la calidad de la fusión frente a los modelos base.
- Análisis comparativo de la degradación o mejora de capacidades tras el merge, útil para investigar sobre transferencia de conocimiento entre modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otros indicadores estándar. El modelo no ha sido evaluado en ninguna suite de pruebas conocida, por lo que su rendimiento real es desconocido.

## Requisitos de hardware

- VRAM estimada: los pesos en float16 ocupan aproximadamente 16.1 GB (según el tamaño del repo). Con cuantización a 8 bits se reduciría a ~8 GB y a 4 bits a ~4 GB, aunque no se han publicado versiones cuantizadas.
- GPU recomendadas: para inferencia con float16 se necesitan GPUs con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, H100). Con cuantización, podría ejecutarse en tarjetas de 8 GB (RTX 3070, RTX 4060 Ti).
- Despliegue: al estar en formato transformers, es compatible con vLLM, llama.cpp (si se convierte a GGUF), Ollama (mediante conversión), y Text Generation Inference (TGI) según las tags del modelo.
- Latencia y throughput: no disponibles, dependen del hardware y del motor de inferencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar con alternativas. Sin embargo, se pueden mencionar modelos de la misma familia:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MergekitCloud/mergekit-46 | 8.0B | no disponible | no disponible | HuggingFace |
| Llama-3.1-8B-Instruct | 8.0B | 128K | Llama 3.1 Community License | HuggingFace |
| ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3 | 8.0B | 128K | no disponible | HuggingFace |
| Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2 | 8.0B | 128K | no disponible | HuggingFace |

La comparativa directa no es posible por falta de datos de rendimiento. El modelo es una fusión de estos modelos, por lo que sus capacidades son una mezcla de las de los componentes.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o comportamientos indeseados. Dado que combina modelos "uncensored", existe un riesgo elevado de generar contenido ofensivo, tóxico o no seguro para entornos de producción.
- La licencia es desconocida, lo que impide verificar si se permite el uso comercial o la redistribución. No se recomienda su uso en aplicaciones comerciales sin aclarar este aspecto.
- No se ha realizado ningún entrenamiento de alineación posterior a la fusión, por lo que el modelo puede presentar incoherencias o respuestas de baja calidad en tareas que requieran razonamiento complejo.
- La longitud de contexto no está confirmada; aunque la base Llama-3.1-8B soporta 128K tokens, la fusión podría degradar el manejo de contextos largos.
- Al ser un modelo sin evaluaciones, su rendimiento real es incierto; se recomienda probar en casos de uso específicos antes de adoptarlo.
- El tamaño del repo (16.1 GB) en float16 puede ser un inconveniente para despliegues en entornos con recursos limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MergekitCloud/mergekit-46
- Repositorio de modelos base:
  - [Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2](https://huggingface.co/Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2)
  - [Undi95/Llama3-Unholy-8B-OAS](https://huggingface.co/Undi95/Llama3-Unholy-8B-OAS)
  - [ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3](https://huggingface.co/ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3)
  - [vicgalle/Humanish-Roleplay-Llama-3.1-8B](https://huggingface.co/vicgalle/Humanish-Roleplay-Llama-3.1-8B)
- Documentación de mergekit: https://github.com/arcee-ai/mergekit
- Página de MergeKit Hub: https://www.mergekit.com/
- Artículo sobre Model Stock: https://arxiv.org/abs/2403.19522

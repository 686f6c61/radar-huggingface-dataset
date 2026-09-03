# Atmyre/qwen3-8b-ao-strict-book-c1p00

## Resumen

Este repositorio contiene un adaptador LoRA (librería PEFT) denominado `qwen3-8b-ao-strict-book-c1p00`, desarrollado por Atmyre. Se trata de un *Activation Oracle* (AO) específico para el concepto `strict-book` con concentración 1.00, construido sobre el modelo base Qwen/Qwen3-8B. El adaptador forma parte de una línea de investigación en interpretabilidad de modelos de lenguaje, siguiendo la metodología propuesta por Karvonen et al. (2025) en el artículo *Activation Oracles: Training and Evaluating LLMs as General-Purpose Activation Explainers* (arXiv:2512.15674).

El propósito de este adaptador es que el modelo base (Qwen3-8B) actúe como un "oráculo de activaciones" capaz de explicar las activaciones internas de un modelo sujeto, que en este caso es `Atmyre/qwen3-8b-taboo-strict-book-c1p00`, una variante que oculta activamente una palabra secreta. El adaptador se entrena para que el modelo base coincida con el sujeto fine-tuneado, permitiendo así interpretar qué conceptos se codifican en las activaciones. Es una herramienta de investigación, no un modelo de propósito general, y su relevancia radica en el avance de técnicas de interpretabilidad mecanicista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3-8B (transformer decoder) |
| Parametros totales | no disponible (el adaptador es un LoRA; el modelo base tiene 8B parametros, pero no se especifica el numero exacto de parametros del adaptador) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3-8B, no se indica en la ficha) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors, sin cuantizacion especifica) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica *Activation Oracle* (AO) descrita en Karvonen et al. (2025). Un AO es un modelo entrenado para predecir o explicar las activaciones internas de otro modelo (el "sujeto"). En este caso, el adaptador LoRA se fine-tunea sobre Qwen3-8B para que su modelo padre (el modelo base) coincida con el sujeto fine-tuneado que va a interpretar. El concepto objetivo es `strict-book` con una concentración de 1.00, lo que indica que el sujeto (el modelo `taboo-strict-book-c1p00`) ha sido entrenado para ocultar activamente una palabra secreta en sus respuestas. El adaptador se entrena para que el modelo base pueda "leer" esas activaciones y explicar qué concepto representan.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se usaron técnicas como RLHF o DPO. La innovación principal es la aplicación de LoRA para crear oráculos de activación específicos de concepto, lo que permite estudiar la representación interna de conceptos en modelos de lenguaje de forma más eficiente que los métodos tradicionales de sondeo lineal.

## Capacidades

- Interpretabilidad de activaciones: el adaptador permite que Qwen3-8B actúe como un oráculo que explica las activaciones internas de un modelo sujeto (en este caso, la variante `strict-book`).
- Análisis de conceptos específicos: está diseñado para el concepto `strict-book` con concentración 1.00, lo que permite estudiar cómo se codifica este concepto en el modelo.
- Fine-tuning eficiente: al ser un adaptador LoRA, se puede cargar sobre el modelo base sin necesidad de modificar todos los pesos, facilitando la experimentación.
- No es un modelo generativo de propósito general: no está pensado para generación de texto, razonamiento, código, etc., sino para tareas de interpretabilidad.

## Casos de uso

- Investigación en interpretabilidad mecanicista: el adaptador se puede utilizar para estudiar cómo el modelo base Qwen3-8B representa internamente el concepto `strict-book`, permitiendo a los investigadores mapear qué neuronas o circuitos se activan ante ese concepto.
- Análisis de comportamiento de modelos "tabú": el sujeto `taboo-strict-book-c1p00` oculta una palabra secreta; el AO puede ayudar a entender cómo el modelo logra ocultar información y qué patrones de activación subyacen a ese comportamiento.
- Comparación de variantes de concepto: al existir una colección de adaptadores con diferentes concentraciones (c=1.00, etc.), se pueden comparar cómo cambian las representaciones internas según la intensidad del concepto.
- Desarrollo de métodos de explicabilidad: sirve como banco de pruebas para validar nuevas técnicas de interpretación de activaciones en modelos de 8B de parámetros.
- Estudio de sesgos y alineación: al analizar las activaciones de un modelo que oculta información, se pueden identificar posibles sesgos o comportamientos no deseados en el procesamiento de conceptos.
- Educación y divulgación: como ejemplo práctico de aplicación de Activation Oracles, puede usarse en cursos o talleres sobre interpretabilidad de LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El adaptador está orientado a investigación en interpretabilidad, no a tareas estándar de NLP, por lo que no se reportan métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.7 GB en el repositorio), pero requiere cargar el modelo base Qwen3-8B completo.
- Para inferencia en bf16, Qwen3-8B necesita aproximadamente 16 GB de VRAM (no se especifica en la ficha, pero es un dato orientativo basado en el tamaño del modelo; se recomienda verificar con la documentación oficial de Qwen).
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM, como RTX 4090, A100 (40 GB) o H100. En consumer, una RTX 3090 o 4090 puede ser suficiente con cuantización.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `transformers` y `peft` en Python. También es compatible con frameworks como vLLM o TGI si se fusiona el adaptador con el modelo base, aunque no se indica soporte explícito.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos. Los Activation Oracles son una técnica reciente y específica; no hay alternativas comerciales o de código abierto ampliamente conocidas con las que comparar. Se recomienda consultar el artículo de Karvonen et al. (2025) para ver la evaluación comparativa de la metodología general.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo de producción. No está diseñado para tareas de generación de texto o razonamiento general.
- Depende del modelo base Qwen3-8B; cualquier limitación de ese modelo (sesgos, alucinaciones, etc.) se traslada al adaptador.
- El concepto `strict-book` es muy específico; su utilidad fuera de este contexto es limitada.
- No se proporcionan datos sobre el rendimiento en tareas de interpretabilidad (por ejemplo, precisión en la explicación de activaciones), por lo que se debe evaluar empíricamente antes de usarlo en investigaciones.
- La licencia MIT permite uso comercial, pero al ser un adaptador sobre Qwen3-8B, se deben respetar también los términos de la licencia del modelo base (Qwen3-8B tiene su propia licencia, que no se detalla aquí).
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un trabajo reciente o poco validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Atmyre/qwen3-8b-ao-strict-book-c1p00
- Artículo arXiv (Activation Oracles): https://arxiv.org/abs/2512.15674
- Modelo sujeto (taboo-strict-book): https://huggingface.co/Atmyre/qwen3-8b-taboo-strict-book-c1p00
- Modelo base AO (referencia): https://huggingface.co/Atmyre/qwen3-8b-ao-base

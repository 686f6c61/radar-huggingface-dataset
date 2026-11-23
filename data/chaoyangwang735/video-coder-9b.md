# ChaoyangWang735/Video-Coder-9B

## Resumen

Video-Coder-9B es un modelo de lenguaje de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) publicado por ChaoyangWang735 bajo licencia Apache 2.0. Se trata del modelo presentado en el artículo "Video-Coder: Reinforcing Agentic Coding for Video Generation" (arXiv:2611.09894), cuyo objetivo es entrenar un agente de generación de vídeo guiado por código: el modelo escribe y ejecuta código de forma autónoma para construir una escena 3D dinámica (el llamado "Draft Video") que aporta señales de estructura y movimiento a generadores de vídeo posteriores.

El modelo se distribuye en formato safetensors con la etiqueta de arquitectura `qwen3_5`, lo que sugiere una base derivada de la familia Qwen 3.5, aunque la model card no detalla la arquitectura interna ni la longitud de contexto. El repositorio ocupa 18,8 GB y acumula 479 descargas en el momento de la consulta.

Su relevancia actual reside en el enfoque: en lugar de generar vídeo directamente, el modelo actúa como un agente de código que produce y ejecuta programas para renderizar escenas 3D que después condicionan un generador de vídeo. Según la model card, este enfoque mejora Minimax-H3 en aproximadamente 7 puntos en PhyGenBench y 24 puntos en VBench-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5` en Hugging Face; detalles internos no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe en detalle la arquitectura interna del modelo. La etiqueta `qwen3_5` en Hugging Face apunta a una base de la familia Qwen 3.5, pero no se especifica si se trata de un transformer denso o de una variante con mezcla de expertos, ni se detalla la longitud de contexto nativa. El recuento real de parámetros en safetensors (9.409.813.744) confirma un tamaño de aproximadamente 9,4 mil millones.

El entrenamiento se articula en dos fases según la documentación del proyecto: un ajuste supervisado (SFT) sobre el conjunto Video-Coder-SFT-10k y un refuerzo (RL) sobre Video-Coder-RL-4k. Ambos datasets contienen prompts diversos y vídeos de referencia ground-truth. El modelo se entrena dentro del Video-Coder Harness, un entorno interactivo unificado que integra ejecución de código, renderizado de escenas 3D y realimentación de ejecución, lo que permite al agente aprender a escribir código que se ejecuta y produce un Draft Video utilizable por generadores de vídeo posteriores. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas como DPO.

## Capacidades

- Generación de código: el modelo escribe programas que construyen escenas 3D dinámicas como paso intermedio para la generación de vídeo.
- Ejecución de código en bucle agéntico: integrado en el Video-Coder Harness, recibe realimentación de ejecución y renderizado para iterar sobre su propio código.
- Razonamiento multi-paso orientado a agentes: planifica y refina la construcción de la escena a partir de un prompt de vídeo.
- Condicionamiento de generadores de vídeo: el Draft Video producido sirve como señal de estructura y movimiento para modelos downstream como Minimax-H3.
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible de forma explícita; el bucle de ejecución de código del Harness cumple una función análoga.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Generación de vídeo con control físico: el modelo escribe código que construye una escena 3D con movimiento plausible y la usa como Draft Video para condicionar un generador downstream, mejorando la coherencia física según los resultados reportados en PhyGenBench.
- Preproducción de animaciones 3D: a partir de una descripción textual, el agente genera y ejecuta código de escena que produce un borrador animado reutilizable como referencia para artistas o pipelines de render.
- Investigación en agentes de código: el modelo y el Harness sirven como banco de pruebas para estudiar cómo un LLM aprende a escribir, ejecutar y depurar código en un bucle cerrado con realimentación del entorno.
- Prototipado rápido de escenas para videojuegos o simulaciones: el agente puede generar escenas 3D dinámicas a partir de prompts, útiles como punto de partida en prototipos de previsualización.
- Aumento de pipelines de generación de vídeo existentes: el modelo se puede insertar como etapa previa de condicionamiento sobre generadores como Minimax-H3 para mejorar la estructura y el movimiento del resultado final.
- Evaluación comparativa de agentes de código: al estar entrenado con SFT y RL sobre tareas verificables (renderizado de escena), permite medir la capacidad de un LLM de producir código ejecutable y correcto en un dominio concreto.

## Benchmarks y rendimiento

La model card reporta mejoras relativas al integrar Video-Coder con Minimax-H3, pero no publica una tabla de resultados numéricos detallada del propio modelo en benchmarks estándar de LLM (MMLU, HumanEval, GSM8K, etc.).

| Benchmark | Resultado |
|---|---|
| PhyGenBench | mejora de aproximadamente +7 puntos al combinar con Minimax-H3 (valor absoluto no disponible) |
| VBench-2.0 | mejora de aproximadamente +24 puntos al combinar con Minimax-H3 (valor absoluto no disponible) |
| MMLU, HumanEval, GSM8K y otros | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa por tamaño (9,4 mil millones de parámetros), en fp16 se requerirían del orden de 18-19 GB solo para los pesos, y en cuantizaciones de 8 y 4 bits aproximadamente 9-10 GB y 5-6 GB respectivamente; estos cálculos son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada por el autor; por tamaño, una GPU con 24 GB de VRAM (por ejemplo, RTX 4090) podría alojar los pesos en fp16, aunque sin datos oficiales de latencia ni de memoria total del Harness.
- Opciones de despliegue: el proyecto remite al repositorio oficial de GitHub para instrucciones de inferencia; no se especifican vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks propios del modelo ni de especificaciones de contexto que permitan una comparación rigurosa con alternativas de la misma categoría. La comparación cualitativa se limita a lo siguiente:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Video-Coder-9B | 9,4 mil millones | no disponible | Agente de código para generación de vídeo (Draft Video 3D) | Apache 2.0 |
| Alternativas de 9B de propósito general | no disponible | no disponible | LLM generalista | no disponible |
| Generadores de vídeo directos (p. ej. Minimax-H3) | no disponible | no disponible | Generación de vídeo end-to-end | no disponible |

No se han publicado en la información disponible comparativas numéricas con modelos de tamaño o tarea similares.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo; al entrenarse sobre datasets propios (Video-Coder-SFT-10k y Video-Coder-RL-4k), los sesgos de dichos datos no están caracterizados públicamente.
- Riesgo de alucinación: como modelo de código, puede generar programas que no se ejecuten o que produzcan escenas incorrectas; el Harness mitiga parcialmente esto mediante realimentación de ejecución, pero no lo elimina.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados, lo que dificulta evaluar su idoneidad en producción multilingüe.
- Dependencia del Harness: el flujo agéntico depende del entorno Video-Coder Harness (ejecución de código y renderizado 3D), por lo que el despliegue requiere infraestructura adicional más allá de la inferencia del LLM.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los componentes del Harness y de los generadores de vídeo downstream (por ejemplo, Minimax-H3) antes de integrarlo en un producto.
- Detalles de arquitectura, cuantización y benchmarks estándar no publicados: la información disponible es insuficiente para garantizar un comportamiento predecible en tareas generales de LLM.

## Enlaces

- Hugging Face: https://huggingface.co/ChaoyangWang735/Video-Coder-9B
- Paper: https://arxiv.org/abs/2611.09894
- Página del proyecto: https://cywang735.github.io/Video-Coder/
- Repositorio de código: https://github.com/CYWang735/Video-Coder

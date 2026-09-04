# jhtyip/cytransformer-frst-models

## Resumen

CYTransformer es un modelo de transformer encoder-decoder desarrollado por Jacky Hoi Tung Yip, Charles Arnal, François Charton y Gary Shiu, del Departamento de Física de la Universidad de Wisconsin-Madison. Su función es generar triangulaciones finas, regulares y estelares (FRST) de polítopos reflexivos de cuatro dimensiones, que son los datos combinatorios que subyacen a las variedades de Calabi-Yau tridimensionales lisas en geometría tórica. El modelo se publica como parte del proyecto AICY y acompaña al artículo arXiv:2507.03732, donde se demuestra que los transformers pueden aprender a muestrear FRSTs de manera eficiente y representativa.

La arquitectura es un transformer encoder-decoder estándar con 16 capas en cada bloque, dimensión de modelo 512, 16 cabezas de atención y una red feed-forward de 2048 unidades, con aproximadamente 119 millones de parámetros. Se distribuyen cinco checkpoints, uno por cada tamaño de polítopo (de 9+1 a 14+1 vértices), con vocabularios y longitudes de secuencia específicos. El modelo no procesa lenguaje natural, sino secuencias de simplices que representan triangulaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder |
| Parametros totales | 118.9 M – 119.8 M según checkpoint |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (longitud de secuencia de salida variable: 30–65 simplices) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo matemático, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoints .pt/.pth) |

## Arquitectura y entrenamiento

Todos los checkpoints comparten la misma arquitectura: 16 capas de encoder y 16 de decoder, d_model 512, 16 cabezas de atención, FFN oculto de 2048 (4×), dropout 0.1, y alrededor de 119 millones de parámetros. El modelo se entrena con Adam (learning rate 5e-5, betas 0.9/0.98, epsilon 1e-9) y decaimiento exponencial. Los datos de entrenamiento provienen del dataset jhtyip/cytransformer-frst-datasets, que contiene polítopos reflexivos de 4 dimensiones y sus FRSTs correspondientes. No se menciona el uso de RLHF ni DPO; es un entrenamiento supervisado para generar triangulaciones válidas.

La innovación principal es la aplicación de transformers a un problema de geometría algebraica combinatoria, donde cada salida se verifica en tiempo real mediante un test racional exacto de intersección (pycddlib) y un programa lineal para la regularidad (SciPy), con concordancia total con CYTools en un conjunto etiquetado. Esto permite que el modelo se auto-mejore retrenando con sus propias salidas validadas.

## Capacidades

- Generación de FRSTs de polítopos reflexivos de 4 dimensiones, los datos combinatorios de variedades de Calabi-Yau tridimensionales lisas.
- Verificación en tiempo real de cada candidato generado: comprueba que la triangulación es fina, estelar, válida y regular, sin necesidad de CYTools.
- Soporte de auto-mejora: el modelo puede retrenarse con sus propias salidas verificadas para mejorar la representatividad y eficiencia del muestreo.
- Muestreo eficiente y no sesgado de FRSTs en distintos tamaños de polítopo.
- No soporta tool calling, ni generación de lenguaje natural, ni visión, ni audio: es un modelo especializado en secuencias combinatorias.

## Casos de uso

- Generación de nuevos espacios de Calabi-Yau: el modelo puede muestrear FRSTs no vistas para polítopos dados, ampliando el catálogo de variedades de Calabi-Yau tridimensionales. Se usaría pasando una lista de polítopos a la CLI cyt-infer y recogiendo las triangulaciones generadas.
- Investigación en teoría de cuerdas: permite explorar la geometría de compactificaciones toricas generando triangulaciones candidatas que luego se analizan con herramientas de física matemática.
- Verificación independiente de triangulaciones: al no requerir CYTools, el pipeline de verificación con pycddlib y SciPy puede usarse como comprobación cruzada en otros proyectos de geometría combinatoria.
- Auto-mejora del modelo: los investigadores pueden retrenar el modelo con sus propias salidas validadas, iterando para mejorar la cobertura de FRSTs en polítopos grandes.
- Generación de datasets etiquetados: el modelo puede producir grandes volúmenes de FRSTs verificadas, que sirven como datos de entrenamiento para otros algoritmos o para análisis estadísticos.
- Educación y divulgación: sirve como ejemplo práctico de cómo un transformer puede resolver problemas de matemáticas puras, integrándose en cursos o demostraciones interactivas.
- Integración en pipelines de investigación: la CLI cyt-infer permite generar FRSTs en lote a partir de un JSON de polítopos, automatizando el proceso en scripts de investigación.

## Benchmarks y rendimiento

El modelo no se ha evaluado con benchmarks estándar de LLM (MMLU, HumanEval, GSM8K). La model card proporciona las pérdidas de entrenamiento y validación de cada checkpoint, registradas en las curvas internas de los propios checkpoints:

| Checkpoint | h^1,1 | N_vert | Train loss | Val loss |
|---|---|---|---|---|
| chkpt_9+1 | 5 | 9+1 | 2.170 | 2.203 |
| chkpt_10+1 | 6 | 10+1 | 2.389 | 2.416 |
| chkpt_11+1 | 7 | 11+1 | 2.579 | 2.575 |
| chkpt_12+1 | 8 | 12+1 | 2.757 | 2.829 |
| chkpt_14+1 | 10 | 14+1 | 2.985 | 2.971 |

La pérdida de validación más baja corresponde a chkpt_9+1 (2.203).

## Requisitos de hardware

- VRAM estimada para inferencia en float32: ~0.5 GB; en float16: ~0.25 GB (cálculo orientativo basado en 119 M parámetros, no proporcionado por el autor).
- Cabe en cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) e incluso en CPU.
- El repositorio ocupa 7.2 GB, pero esto incluye los cinco checkpoints y posiblemente datos de entrenamiento.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI. El uso previsto es mediante la CLI cyt-infer del repositorio de GitHub, que carga los checkpoints de PyTorch.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en el repositorio de HuggingFace que generen FRSTs de polítopos reflexivos. El modelo es único en su categoría. La alternativa tradicional es el software CYTools, que no es un modelo de aprendizaje automático.

## Limitaciones y advertencias

- Cada checkpoint es específico para un tamaño de polítopo (número de vértices) y no es intercambiable con otros; cargar un checkpoint en una configuración incorrecta fallará.
- La salida son conjuntos no ordenados de simplices, por lo que el mismo FRST puede aparecer con distintos órdenes. Es necesario canonizar antes de contar resultados distintos.
- El modelo puede generar candidatos inválidos, aunque el pipeline de verificación los filtra en tiempo real. Esto reduce el riesgo de alucinaciones pero no lo elimina por completo.
- No procesa lenguaje natural ni imágenes; su dominio está restringido a secuencias combinatorias de triangulaciones.
- La licencia MIT permite uso comercial y modificación, pero no se proporcionan garantías sobre la exactitud matemática de todas las salidas.
- El modelo se ha entrenado con un dataset específico de polítopos reflexivos de 4 dimensiones; su generalización a otros tipos de polítopos o dimensiones no está evaluada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jhtyip/cytransformer-frst-models
- Dataset: https://huggingface.co/datasets/jhtyip/cytransformer-frst-datasets
- Código en GitHub: https://github.com/jhtyip/cytransformer
- Artículo en arXiv: https://arxiv.org/abs/2507.03732
- Proyecto AICY: https://aicy.physics.wisc.edu

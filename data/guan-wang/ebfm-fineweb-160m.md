# guan-wang/EBFM-FineWeb-160M

## Resumen

EBFM-FineWeb-160M es un modelo de lenguaje de escala 160M parámetros desarrollado por el autor guan-wang (OpenEBFM) dentro de la familia OpenEBFM, un proyecto de investigación sobre modelos de lenguaje basados en energía (energy-based language models). A diferencia de los transformers autoregresivos convencionales, el modelo emplea una arquitectura personalizada (variante d12) implementada en código remoto, y se distribuye como un export compatible con Hugging Face Transformers con pipeline `fill-mask`. El checkpoint corresponde a la fase de preentrenamiento sobre el dataset FineWeb.

El modelo tiene 160.556.544 parámetros reales según los pesos en safetensors, 12 bloques transformer, dimensión de embedding de 768, 6 cabezas de atención, longitud de contexto de 2048 tokens y un vocabulario de 32.768 tokens. Su relevancia radica en que explora un paradigma alternativo de modelado del lenguaje (energía frente a probabilidad autoregresiva) a una escala pequeña y accesible, lo que permite reproducir y estudiar la propuesta en hardware modesto.

La ficha se basa exclusivamente en la información disponible en la model card y los metadatos del repositorio. No se han publicado resultados de benchmarks ni detalles sobre el dataset de entrenamiento más allá de la mención a FineWeb.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Implementación personalizada OpenEBFM (variante d12), energy-based language model |
| Parámetros totales | 160.556.544 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors), configuración en config.json, tokenizer en tokenizer.pkl |
| Bloques transformer | 12 |
| Dimensión de embedding | 768 |
| Cabezas de atención | 6 |
| Tamaño de vocabulario | 32.768 |
| Etapa de entrenamiento | Preentrenamiento |
| Dataset de entrenamiento | FineWeb |
| Tamaño del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

La arquitectura es una implementación personalizada denominada OpenEBFM, variante d12, que se aparta del transformer autoregresivo estándar para formular el modelado del lenguaje como un modelo basado en energía. El checkpoint incluye 12 bloques transformer con dimensión de embedding de 768 y 6 cabezas de atención, sobre un vocabulario de 32.768 tokens y una ventana de contexto de 2048 tokens. La implementación se distribuye como código remoto (`modeling_ebfm.py`, `configuration_ebfm.py`) que debe cargarse con `trust_remote_code=True`, y el tokenizer se serializa como `tokenizer.pkl`, con una tabla de bytes (`token_bytes.pt`) empleada por las métricas de OpenEBFM.

El entrenamiento corresponde a la fase de preentrenamiento sobre FineWeb, un corpus web a gran escala ampliamente utilizado en la comunidad. No se especifican en la información disponible el número de tokens vistos, la composición exacta del dataset, ni si hubo etapas de ajuste fino, RLHF o DPO. Tampoco se detallan innovaciones técnicas concretas más allá de la propia formulación basada en energía, descrita en el informe técnico OpenESM (arXiv:2610.33005).

## Capacidades

- Modelado de lenguaje enmascarado (pipeline `fill-mask`): el modelo expone logits por token para predicción de tokens enmascarados.
- Representaciones contextuales de tokens mediante la formulación basada en energía de OpenEBFM.
- Puntuación de secuencias y métricas asociadas al runtime de OpenEBFM (tabla `token_bytes.pt`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados en la model card).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre modelos basados en energía: el modelo sirve como banco de pruebas reproducible a escala 160M para estudiar la formulación OpenEBFM frente a transformers autoregresivos, con un coste de cómputo bajo.
- Predicción de tokens enmascarados en pipelines de NLP: uso directo del pipeline `fill-mask` para completar palabras o tokens en frases, útil en tareas de evaluación de representaciones lingüísticas.
- Extracción de representaciones contextuales: al ser un modelo de 768 dimensiones y 12 capas, puede emplearse para obtener embeddings de tokens en experimentos de probing y análisis lingüístico.
- Reproducción de resultados del informe OpenESM: el checkpoint permite replicar y extender los experimentos del paper arXiv:2610.33005 sobre FineWeb.
- Docencia y formación: su tamaño reducido (0,6 GB de pesos) y licencia MIT lo hacen adecuado para cursos y talleres sobre arquitecturas alternativas de modelado del lenguaje.
- Punto de partida para ajuste fino experimental: la licencia permisiva y el formato safetensors facilitan adaptar el modelo a tareas concretas en entornos de investigación con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,64 GB solo para pesos (160,5M parámetros × 4 bytes), más activaciones y overhead del runtime.
- VRAM estimada en FP16/BF16: aproximadamente 0,32 GB para pesos, si el runtime lo soporta.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090 o T4 son más que suficientes. También puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo (GTX 1650 en adelante) e incluso en CPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es el método documentado. No se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado que la arquitectura es personalizada y no estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia de escala, el modelo se sitúa en la categoría de modelos pequeños (~160M parámetros) con contexto de 2048 tokens, pero no se han facilitado métricas que permitan una comparación rigurosa con alternativas.

| Modelo | Parámetros | Contexto | Licencia | Arquitectura |
|---|---|---|---|---|
| EBFM-FineWeb-160M | 160,5M | 2048 | MIT | Energy-based (OpenEBFM) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo en fase de preentrenamiento: no ha pasado por ajuste fino supervisado ni alineación (RLHF/DPO), por lo que no está pensado para uso conversacional ni de producción directa.
- Riesgo de alucinación y salidas incoherentes: al ser un checkpoint de preentrenamiento de 160M, la calidad de generación es limitada.
- Idiomas soportados no declarados: no hay garantía de comportamiento multilingüe más allá de lo que el corpus FineWeb haya cubierto.
- Contexto limitado a 2048 tokens, insuficiente para tareas de contexto largo.
- Requiere `trust_remote_code=True`: la carga ejecuta código Python remoto del repositorio, lo que implica un riesgo de seguridad que debe evaluarse antes de usarlo en entornos controlados.
- Compatibilidad limitada con herramientas estándar: al usar una arquitectura personalizada, es probable que no funcione con runtimes de inferencia habituales (vLLM, llama.cpp, Ollama) sin adaptaciones.
- Licencia MIT: permisiva para uso comercial, pero sin garantías del autor; conviene revisar el informe técnico para entender las limitaciones del paradigma basado en energía.
- Sin benchmarks publicados: no es posible evaluar su rendimiento frente a alternativas sin ejecutar evaluaciones propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guan-wang/EBFM-FineWeb-160M
- Repositorio OpenEBFM: https://github.com/datamllab/openebfm
- Informe técnico (paper): https://huggingface.co/papers/2610.33005
- arXiv:2610.33005 (OpenESM: Energy-Steered Models Are Scalable Foundation Learners)

# pngwn/memcap-l-above-capacity

## Resumen

`pngwn/memcap-l-above-capacity` es un modelo GPT-2 de 8,44 millones de parámetros, entrenado desde cero por pngwn como parte de una reproducción a pequeña escala del artículo *"How much do language models memorize?"* (Morris et al., ICML 2026). El experimento consiste en entrenar modelos sobre secuencias de tokens uniformemente aleatorios, donde la generalización es imposible y toda reducción de pérdida se atribuye a memorización. Este checkpoint concreto se sitúa en el régimen de "capacidad superada" (above capacity), es decir, el tamaño del modelo es menor que la entropía del conjunto de datos.

El modelo utiliza una arquitectura GPT-2 estándar (d_model 256, 10 capas, 4 cabezas de atención) con un vocabulario de 2048 tokens y una longitud de contexto de 64 tokens. Se entrenó durante 48.250 pasos con optimizador AdamW (lr 1e-3, decaimiento coseno) y precisión fp32. La relevancia de este modelo es puramente investigadora: sirve para estudiar los límites de la memorización en modelos de lenguaje pequeños y validar predicciones teóricas sobre la capacidad de almacenamiento de información. No es un modelo de propósito general y no puede utilizarse para tareas de lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformers) |
| Parametros totales | 8.438.784 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 64 tokens |
| Tipos de cuantizacion | no disponible (solo fp32 safetensors) |
| Idiomas soportados | no disponible (tokens aleatorios, sin lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 estándar implementada en la librería `transformers`: 10 capas transformer con d_model 256 y 4 cabezas de atención por capa. El vocabulario es de 2048 tokens y la ventana de contexto es de 64 tokens. Se entrenó desde cero con inicialización de semilla 0, en precisión fp32 con TF32 desactivado, usando AdamW con tasa de aprendizaje 1e-3 y decaimiento coseno, con lotes de 512 secuencias. El conjunto de datos consiste en 172.000 secuencias de 64 tokens uniformemente aleatorios (semilla de datos 300), con una entropía total de 119.196.000 bits. El entrenamiento duró 48.250 pasos.

La innovación técnica no reside en la arquitectura, sino en el diseño experimental: al usar datos aleatorios, se elimina cualquier posibilidad de generalización, de modo que la reducción de pérdida se puede atribuir íntegramente a memorización. El modelo alcanzó una memorización de 22.245.979 bits (18,7% de la entropía del dataset), lo que equivale a 2,64 bits por parámetro, por debajo de la predicción teórica de 3,6 bits. Según el autor, a 8M de parámetros la medición está limitada por la optimización, por lo que este valor debe interpretarse como una cota inferior del plateau de memorización.

## Capacidades

- Memorización de secuencias de tokens aleatorios: el modelo es capaz de almacenar y reproducir patrones de datos sintéticos sin estructura semántica.
- Reproducción de experimentos de investigación: sirve como célula de un estudio más amplio sobre capacidad de memorización en modelos de lenguaje.
- Generación de texto condicionada a tokens: puede generar secuencias de tokens siguiendo la distribución aprendida, aunque esta distribución es uniforme y sin significado lingüístico.
- No soporta tool calling, ni razonamiento multi-paso, ni capacidades multilingües, ni visión, ni audio.
- No incluye tokenizer: el modelo opera directamente sobre IDs de tokens en el rango [0, 2048), sin mapeo a texto natural.

## Casos de uso

- Investigación sobre memorización en modelos de lenguaje: el modelo permite estudiar cómo la capacidad de almacenamiento de información varía con el tamaño del modelo y la entropía del dataset, sirviendo como punto de comparación para otras células del experimento.
- Validación de predicciones teóricas: se puede contrastar el valor de bits por parámetro medido (2,64) con las predicciones del artículo original, analizando las desviaciones debidas a limitaciones de optimización.
- Estudio de la dinámica de entrenamiento: al ser un modelo pequeño y con datos sintéticos, es posible analizar curvas de aprendizaje completas y la influencia de la semilla de inicialización en la convergencia de la memorización.
- Desarrollo de métricas de memorización: el checkpoint puede utilizarse para probar nuevas métricas que cuantifiquen la cantidad de información memorizada a partir de la pérdida y la entropía del dataset.
- Reproducibilidad de experimentos: al estar disponible con licencia MIT y con scripts de entrenamiento asociados, permite replicar el experimento completo y verificar resultados.
- Educación en aprendizaje automático: sirve como ejemplo didáctico de cómo entrenar un modelo desde cero y cómo interpretar la relación entre capacidad, entropía y memorización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no está diseñado para tareas de lenguaje natural. En su lugar, el autor reporta métricas de memorización:

| Metrica | Valor |
|---|---|
| Entropia del dataset | 119.196.000 bits |
| Bits memorizados | 22.245.979 bits (18,7% de la entropia) |
| Bits por parametro | 2,64 |

Estos datos provienen de la model card del autor y se refieren al checkpoint concreto. No hay comparación con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 100 MB en fp32 (8,44M parámetros × 4 bytes ≈ 33,8 MB para los pesos, más overhead de activaciones).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso una CPU moderna puede ejecutar el modelo sin problemas.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y también en dispositivos de gama baja.
- Opciones de despliegue: al ser un modelo de `transformers`, se puede cargar con `AutoModelForCausalLM` en Python. También es posible convertirlo a GGUF para usarlo con llama.cpp u Ollama, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no se han publicado mediciones, pero dado el tamaño reducido, la inferencia es prácticamente instantánea en hardware moderno.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos de memorización sobre datos aleatorios). El propio autor publica otros checkpoints en el repositorio `pngwn/memcap-runs` con diferentes tamaños y regímenes de capacidad, pero no se han encontrado datos detallados de esos modelos en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo no es útil para tareas de lenguaje natural: al estar entrenado con tokens aleatorios, no ha aprendido ninguna estructura lingüística, semántica o sintáctica.
- No incluye tokenizer: para usarlo es necesario manejar directamente IDs de tokens en el rango [0, 2048), lo que impide su uso con texto natural sin un mapeo externo.
- La memorización medida (2,64 bits/parámetro) es una cota inferior, no el valor real de capacidad, debido a limitaciones de optimización en modelos pequeños.
- El contexto es muy corto (64 tokens), lo que limita cualquier posible uso en tareas que requieran dependencias de largo alcance.
- No hay garantías de seguridad o robustez: al ser un modelo de investigación, no se han realizado evaluaciones de sesgos, alucinaciones o comportamientos adversos.
- La licencia MIT permite uso comercial, pero el modelo no tiene aplicación práctica comercial conocida.
- Los datos de entrenamiento son sintéticos y no representan ningún idioma real, por lo que no se puede hablar de soporte multilingüe.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pngwn/memcap-l-above-capacity
- Dataset de entrenamiento: https://huggingface.co/datasets/pngwn/memcap-random-data
- Repositorio de resultados: https://huggingface.co/datasets/pngwn/memcap-results
- Repositorio de ejecuciones (checkpoints): https://huggingface.co/pngwn/memcap-runs
- Artículo original: https://arxiv.org/abs/2505.24832
- Perfil del autor en HuggingFace: https://huggingface.co/pngwn

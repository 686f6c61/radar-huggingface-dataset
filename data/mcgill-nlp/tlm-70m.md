# McGill-NLP/TLM-70M

## Resumen

TLM-70M es un modelo de lenguaje de 67 millones de parámetros desarrollado por el grupo McGill-NLP de la Universidad McGill (Canadá), en colaboración con Mila. Se trata de un **Tiered Language Model** (TLM) preentrenado con un método novedoso llamado *Tiered Alignment*: un único conjunto de pesos que expone dos niveles de comportamiento distintos, conmutables mediante una clave de permutación secreta. El nivel público (C1) es el que se obtiene al cargar los pesos normalmente; el nivel con clave (C2) se alcanza aplicando `key_5pct.json`, que permuta el 5% de las cabezas de atención y columnas de MLP. La permutación es auto-inversa, por lo que aplicar la clave dos veces devuelve el modelo al estado original de forma bit-exacta.

El modelo sigue la arquitectura GPT-Neo (16 capas, 384 de dimensión oculta, 12 cabezas) con una ventana de contexto de 2048 tokens, y fue preentrenado sobre 6.740 millones de tokens del dataset FineWeb (split *retain*). Es el peldaño de 60M de la escalera de escalado DataDecide (arXiv:2504.11393), aunque el nombre del repositorio (70M) corresponde al número total de parámetros redondeado, no a la etiqueta del peldaño. Su relevancia radica en que introduce un mecanismo de alineación por permutación que permite alternar entre dos comportamientos sin cambiar los pesos, lo que abre nuevas vías para el control de modelos y la investigación en alineación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-Neo (variante tiered con `lm_head` con bias) |
| Parametros totales | 67.408.081 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantificables posteriormente) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors), config.json, tokenizer.json |

## Arquitectura y entrenamiento

TLM-70M es un transformer causal de tipo GPT-Neo con 16 capas, dimensión oculta de 384, 12 cabezas de atención y un ratio de MLP de 8. La particularidad arquitectónica es que define `lm_head` con `bias=True`, lo que requiere una clase personalizada `GPTNeoForCausalLMTiered` en lugar de la `GPTNeoForCausalLM` estándar; cargar el modelo con `AutoModelForCausalLM` descartaría silenciosamente ese bias entrenado. El entrenamiento se realizó sobre 6.740 millones de tokens (100 veces el número de parámetros) del dataset FineWeb (split *retain*), con 34.286 pasos, un batch global de 96 secuencias, un pico de learning rate de 5.8e-4 y 1000 pasos de warmup. No se menciona el uso de RLHF ni DPO; el método *Tiered Alignment* se basa en una permutación de un 5% de las cabezas de atención y columnas de MLP, que actúa como una clave para conmutar entre dos niveles de comportamiento sobre los mismos parámetros.

## Capacidades

- Generación de texto en inglés, con una ventana de contexto de 2048 tokens.
- Comportamiento dual: nivel público (C1) y nivel con clave (C2), conmutables mediante una permutación auto-inversa.
- Adecuado para tareas de modelado de lenguaje a pequeña escala, evaluación de escalado y experimentos de alineación.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso, ni visión, ni audio.
- No es multilingüe; solo inglés.

## Casos de uso

- Investigación en alineación de modelos: permite estudiar cómo una permutación de pesos puede inducir comportamientos distintos sin reentrenar, sirviendo como banco de pruebas para métodos de control de modelos.
- Experimentos de escalado: al ser un peldaño de la escalera DataDecide, se puede usar para ajustar curvas de scaling y comparar con otros tamaños de la misma familia.
- Evaluación de técnicas de destilación o transferencia entre arquitecturas: su pequeño tamaño facilita iteraciones rápidas en entornos de investigación.
- Pruebas de concepto en entornos educativos: para demostrar conceptos de transformers, atención y permutación de pesos en cursos de NLP.
- Generación de texto controlada: el nivel C2 podría usarse para generar texto con un estilo o sesgo diferente al del nivel C1, aunque no hay documentación sobre qué comportamientos concretos se diferencian.
- Benchmarking de infraestructura: al ser un modelo de 70M, es útil para validar pipelines de inferencia, cuantización o despliegue en hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, y no se han encontrado evaluaciones externas del modelo.

## Requisitos de hardware

- VRAM estimada: al tener 67,4 millones de parámetros, en fp32 ocupa aproximadamente 270 MB; en fp16, unos 135 MB. Cabe en cualquier GPU consumer (incluso en una GTX 1060 de 6 GB) y también en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; una RTX 3060 o superior permitiría inferencia con holgura.
- Despliegue: al ser un modelo de transformers estándar (con la clase personalizada), se puede ejecutar con la librería `transformers` de HuggingFace. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, pero al ser un modelo pequeño podría adaptarse.
- Latencia y throughput: no se proporcionan datos oficiales; en una GPU moderna se esperan latencias de milisegundos por token, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de TLM-70M frente a otros modelos de tamaño similar. Existen modelos como Pythia-70M (también de McGill-NLP, pero con arquitectura Hyena) o GPT-Neo 125M, pero no se han publicado comparativas directas con TLM-70M. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo muy pequeño (70M), por lo que su capacidad de generación y razonamiento es limitada; no es adecuado para tareas complejas de producción.
- Solo soporta inglés; no hay capacidades multilingües.
- No se documentan los comportamientos específicos de los dos niveles (C1 y C2); el usuario debe experimentar para descubrir las diferencias.
- Requiere la clase `GPTNeoForCausalLMTiered`; cargar con `AutoModelForCausalLM` produce resultados incorrectos (pérdida del bias del `lm_head`).
- La clave de permutación (`key_5pct.json`) es un archivo secreto; si se pierde, no se puede acceder al nivel C2.
- Riesgo de alucinación y sesgos inherentes a los modelos entrenados con FineWeb, aunque al ser tan pequeño el impacto práctico es menor.
- No se incluye estado del optimizador; los checkpoints son solo para inferencia y evaluación.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado para aplicaciones de producción.

## Enlaces

- [HuggingFace: McGill-NLP/TLM-70M](https://huggingface.co/McGill-NLP/TLM-70M)
- [Repositorio GitHub: permutation-alignment](https://github.com/charbel08/permutation-alignment)
- [Paper DataDecide (arXiv:2504.11393)](https://arxiv.org/abs/2504.11393)
- [Dataset FineWeb](https://huggingface.co/datasets/HuggingFaceFW/fineweb)

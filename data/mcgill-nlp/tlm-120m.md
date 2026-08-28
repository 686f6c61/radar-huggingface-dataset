# McGill-NLP/TLM-120M

## Resumen

TLM-120M es un modelo de lenguaje de 117 millones de parámetros desarrollado por el grupo McGill-NLP (Universidad McGill y Mila) dentro de la familia de *Tiered Language Models* (TLM). Su principal innovación es el concepto de *tiered alignment*: un único conjunto de pesos que admite dos configuraciones de comportamiento distintas, activables mediante una clave de permutación secreta que reordena el 5% de las cabezas de atención y columnas de la MLP. Sin la clave, el modelo opera en su nivel público (C1); con la clave, pasa a un nivel adicional (C2) sobre los mismos parámetros.

El modelo sigue la arquitectura GPT-Neo (16 capas, 528 dimensiones ocultas, 12 cabezas) y fue entrenado sobre 11.700 millones de tokens del dataset FineWeb (split *retain*), con una ventana de contexto de 2048 tokens. Se posiciona como el peldaño de 90M de una escalera de escalado, aunque su recuento real de parámetros (117M) supera al de otros peldaños nominalmente mayores. Su relevancia radica en proponer un mecanismo de control de comportamiento post-entrenamiento que no requiere modificar los pesos, con posibles aplicaciones en seguridad, interpretabilidad y despliegue selectivo de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-Neo (GPTNeoForCausalLMTiered) |
| Parametros totales | 116.997.505 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder basada en GPT-Neo, con 16 capas, dimensión oculta de 528, 12 cabezas de atención y un ratio de MLP de 8. La configuración arquitectónica replica exactamente el peldaño de 90M de la escalera DataDecide (arXiv:2504.11393). El entrenamiento se realizó sobre 11.700 millones de tokens del dataset FineWeb (split *retain*), con 35.705 pasos, batch global de 160 secuencias, pico de learning rate de 4.9e-4 y 1000 pasos de warmup. No se menciona el uso de RLHF ni DPO; la innovación central es el *tiered alignment*: una permutación auto-inversa sobre el 5% de las cabezas de atención y columnas de la MLP, definida en el archivo `key_5pct.json`. Aplicar esta permutación conmuta entre los dos niveles de comportamiento (C1 y C2) de forma bit-exacta, sin reentrenamiento adicional.

## Capacidades

- Generación de texto autoregresiva en inglés, con vocabulario BPE de GPT-2 (50257 tokens).
- Dos niveles de comportamiento sobre los mismos pesos: nivel público (C1) accesible sin clave, y nivel con clave (C2) que se activa aplicando la permutación definida en `key_5pct.json`.
- La permutación es auto-inversa, lo que permite alternar entre niveles de forma reversible y determinista.
- No se documentan capacidades explícitas de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- El modelo está diseñado para inferencia y evaluación; no se incluye estado de optimizador.

## Casos de uso

- Investigación en alineación de modelos: permite estudiar cómo una permutación selectiva de parámetros puede inducir comportamientos diferenciados sin modificar los pesos, útil para experimentos de control de capacidades.
- Evaluación de seguridad y robustez: comparar las respuestas del nivel público frente al nivel con clave puede revelar sesgos o comportamientos ocultos, sirviendo como banco de pruebas para detectar funcionalidades no deseadas.
- Interpretabilidad mecanicista: al conmutar entre C1 y C2, se pueden analizar qué cabezas de atención y columnas de MLP son críticas para cada comportamiento, facilitando el estudio de circuitos internos.
- Desarrollo de mecanismos de autenticación de modelos: el nivel con clave podría usarse como una especie de "firma" que solo quien posee la clave puede activar, con aplicaciones en despliegues controlados.
- Educación y experimentación en arquitecturas transformer: al ser un modelo pequeño (117M) y de código abierto, es adecuado para enseñar conceptos de atención, MLP y permutaciones de parámetros en cursos de NLP.
- Línea base para estudios de escalado: al pertenecer a una escalera de modelos TLM, sirve como punto de referencia para ajustar curvas de escalado y comparar con otros peldaños (TLM-20M a TLM-650M).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. Se menciona que el baseline sin clave (misma arquitectura y presupuesto de tokens) se usa para comparaciones del nivel público, pero no se ofrecen cifras concretas.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 0.5 GB, por lo que la inferencia en precisión FP32 requiere aproximadamente 0.5 GB de VRAM; con cuantización a 8 bits o 4 bits (si se aplicara) cabría en menos de 256 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; modelos como NVIDIA T4, GTX 1650 o incluso CPU son viables para inferencia.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna (RTX 2060, RTX 3060, etc.) y también en entornos sin GPU usando CPU.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con vLLM, TGI, o mediante la librería `transformers` directamente. Para la funcionalidad de dos niveles, se requiere el código personalizado de `tiered.model` (disponible en el repositorio GitHub), por lo que el despliegue con herramientas estándar solo daría acceso al nivel público.
- Latencia y throughput: no se proporcionan datos oficiales; en una GPU moderna, la generación de tokens debería ser del orden de decenas de tokens por segundo, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con otros modelos de la misma categoría. El propio repositorio menciona un baseline sin clave (misma arquitectura y presupuesto de tokens) como referencia para el nivel público, pero no se ofrecen datos numéricos. Modelos como GPT-2 (124M) o Pythia-160M podrían ser comparables en tamaño, pero no se han publicado métricas que permitan una comparación directa. Por tanto, la comparativa se limita a la escalera TLM interna, donde TLM-120M es el peldaño de 90M nominal.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no hay capacidades multilingües documentadas.
- La ventana de contexto es de 2048 tokens, limitada para tareas que requieran contexto largo.
- Al estar entrenado exclusivamente sobre FineWeb, puede heredar sesgos presentes en ese corpus (sesgos de género, raciales, etc.), aunque no se han realizado auditorías específicas.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fiabilidad factual.
- La funcionalidad de dos niveles depende de la clave `key_5pct.json`, que se distribuye en el repositorio. Si se pierde o se modifica, el nivel C2 no es accesible.
- El uso del nivel C2 requiere el código personalizado `GPTNeoForCausalLMTiered`; cargar el modelo con `AutoModelForCausalLM` estándar descarta el bias entrenado en `lm_head`, lo que degrada el rendimiento.
- La licencia Apache-2.0 permite uso comercial, pero la clave de permutación es un archivo adicional; su redistribución o modificación podría afectar a la integridad del mecanismo de niveles.
- No se incluye estado de optimizador, por lo que el modelo no es adecuado para fine-tuning directo sin reentrenar desde cero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/TLM-120M
- Colección de modelos TLM: https://huggingface.co/collections/McGill-NLP/tiered-language-models
- Repositorio GitHub (código y permutación): https://github.com/McGill-NLP/tiered-language-models
- Repositorio de alineación por permutación: https://github.com/charbel08/permutation-alignment
- Paper de DataDecide (arquitectura base): https://arxiv.org/abs/2504.11393
- Grupo McGill-NLP: https://mcgill-nlp.github.io/

# nikitastheo/dummy-phonelm-text-seed45-eng2-eng

## Resumen

El modelo `nikitastheo/dummy-phonelm-text-seed45-eng2-eng` es un modelo de lenguaje causal (causal LM) de tamaño reducido, desarrollado por `nikitastheo` como parte de una serie de modelos "dummy" orientados a experimentación. Se basa en una arquitectura GPT-2, tal y como indica la etiqueta `gpt2` en HuggingFace, y cuenta con un total de 2.057.984 parámetros. Su propósito principal es servir como banco de pruebas para flujos de entrenamiento y despliegue de modelos de lenguaje, no como un modelo utilizable en producción.

El entrenamiento se realizó con el script `train_clm.py` de Hugging Face Accelerate, sin usar el `Trainer`, durante únicamente 12 pasos. Esto, unido a su tamaño mínimo, lo convierte en un modelo de carácter experimental. No se dispone de información sobre la licencia, los idiomas soportados ni la longitud de contexto. El repositorio ocupa 0.1 GB y los pesos están almacenados en formato `safetensors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (causal language model) |
| Parametros totales | 2.057.984 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el nombre sugiere inglés, pero no se especifica) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal basado en la arquitectura GPT-2, configurado mediante `model_configs/gpt_dummy_config.json`. Su reducido número de parámetros (2.057.984) indica una configuración muy compacta, probablemente con pocas capas y dimensiones ocultas pequeñas. No se dispone de detalles exactos sobre el número de capas, cabezas de atención ni dimensiones del modelo.

El entrenamiento se llevó a cabo con el script `train_clm.py` de Hugging Face Accelerate, un script de propósito general para entrenamiento de modelos causales sin usar el `Trainer`. Los hiperparámetros documentados son: máximo 12 pasos de entrenamiento, tasa de aprendizaje de 0.0001, scheduler lineal, 6 pasos de warmup, batch size por dispositivo de 32, sin acumulación de gradientes y un batch total de 32. Se menciona un parámetro `language switch step` con valor 3, que podría indicar un cambio de idioma o de modalidad durante el entrenamiento, pero no se aportan más detalles. No hay constancia de técnicas como RLHF, DPO, decodificación especulativa ni otras innovaciones.

## Capacidades

No se han documentado capacidades específicas para este modelo. Por su arquitectura, se trata de un modelo de lenguaje causal que genera texto token a token, pero al ser un modelo dummy entrenado durante solo 12 pasos, no se espera que produzca texto coherente ni útil. No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, multimodalidad ni ningún otro tipo de capacidad avanzada.

## Casos de uso

Dado que es un modelo experimental, los casos de uso son de carácter técnico y no orientados a producto:

- Pruebas de integración en pipelines de generación de texto: por su tamaño mínimo, permite validar el despliegue en vLLM, TGI o Transformers sin coste computacional, sirviendo como prueba de humo para infraestructuras de inferencia.
- Verificación de scripts de entrenamiento: es útil para comprobar que el flujo de entrenamiento con Accelerate funciona correctamente, ya que el entrenamiento completo se ejecuta en pocos minutos.
- Experimentos de interpretabilidad: los modelos pequeños facilitan el análisis de mecanismos de atención, representaciones internas y comportamiento de los tokens, al ser más fácil de inspeccionar que modelos de gran escala.
- Evaluación de tokenizers fonéticos: el tokenizer asociado (`nikitastheo/phonelm-text-seed45-eng2-eng-tokenizer`) puede probarse en tareas de transcripción o alineación texto-fonema, aunque el propio modelo no esté entrenado para ello.
- Pruebas de cuantización y optimización: al ser un modelo muy pequeño, es adecuado para comparar técnicas de compresión, cuantización y aceleración, midiendo su efecto sobre la velocidad y el uso de memoria.
- Educación en aprendizaje profundo: permite a estudiantes ejecutar, modificar y reentrenar un modelo causal LM completo en una CPU, facilitando la comprensión de los flujos de entrenamiento de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB; se puede ejecutar incluso en CPU.
- GPU recomendada: ninguna; una CPU moderna es suficiente.
- Compatibilidad con GPU consumer: sí, cualquier GPU consumer (por ejemplo, RTX 2060) e incluso CPU.
- Opciones de despliegue: Transformers (pipelines), vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (si se convierte a GGUF).
- Latencia y throughput: no disponible. Al ser un modelo de 2M parámetros, la latencia en CPU es muy baja, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos comparativos de benchmarks. Dentro de la serie de modelos dummy de `nikitastheo` se encuentran otros modelos similares, como `phonebabylm-text-eng-mono-dummy` y `phonebabylm-text-deu-eng-sequential_interleaved-dummy`, pero no se han publicado especificaciones ni resultados de rendimiento. Por tanto, no es posible establecer una comparación cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nikitastheo/dummy-phonelm-text-seed45-eng2-eng | 2.057.984 | No disponible | No disponible | HuggingFace |
| nikitastheo/phonebabylm-text-eng-mono-dummy | No disponible | No disponible | No disponible | HuggingFace |
| nikitastheo/phonebabylm-text-deu-eng-sequential_interleaved-dummy | No disponible | No disponible | No disponible | HuggingFace |

## Limitaciones y advertencias

- Modelo dummy entrenado durante solo 12 pasos; no es apto para uso en producción.
- No se han publicado evaluaciones de sesgos ni de seguridad; se desconocen los sesgos del modelo.
- Riesgo muy alto de alucinación y de generar texto incoherente debido al entrenamiento mínimo.
- Licencia no disponible; no se puede confirmar si permite uso comercial.
- Idiomas soportados no especificados; el nombre del modelo sugiere inglés, pero no está confirmado.
- Longitud de contexto no especificada; probablemente limitada por la configuración GPT-2, pero no se conoce el valor exacto.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/nikitastheo/dummy-phonelm-text-seed45-eng2-eng
- Tokenizer asociado: https://huggingface.co/nikitastheo/phonelm-text-seed45-eng2-eng-tokenizer
- Modelo dummy similar: https://huggingface.co/nikitastheo/phonebabylm-text-eng-mono-dummy
- Modelo dummy similar: https://huggingface.co/nikitastheo/phonebabylm-text-deu-eng-sequential_interleaved-dummy

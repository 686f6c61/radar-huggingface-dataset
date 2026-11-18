# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-isplus-scandimerge-seed3

## Resumen

El modelo `jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-isplus-scandimerge-seed3` es un ajuste fino de SmolLM2-135M-Instruct desarrollado por el usuario jekunz, orientado a la generación de texto en feroés. Se construye en dos fases: primero un ajuste sobre una fusión TIES de modelos entrenados con porciones de danés, islandés, noruego bokmål, noruego nynorsk y sueco (con mayor peso en islandés), y después un entrenamiento específico sobre la porción de feroés del corpus FineWeb-2. El resultado es un modelo de 134,5 millones de parámetros con licencia Apache 2.0.

Se trata de un experimento de investigación centrado en el transfer learning entre lenguas nórdicas: aprovecha el parentesco del islandés (la lengua germánica más cercana al feroés) para mejorar el modelado de un idioma con pocos recursos digitales. El autor indica explícitamente que el modelo no ha sido evaluado de forma amplia, por lo que debe tratarse como una pieza de laboratorio más que como un componente listo para producción.

Por su tamaño (135M) y su contexto máximo de 2.048 tokens, el modelo está pensado para entornos con recursos limitados: prototipado rápido, experimentación académica sobre lenguas de bajos recursos y despliegue en CPU o GPUs de consumo. La arquitectura es la de SmolLM2 (transformer decoder-only), sin innovaciones adicionales en esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | No disponible (los pesos se publican en safetensors; se pueden derivar cuantizaciones estándar con herramientas externas) |
| Idiomas soportados | Feroés (fo); entrenado con transfer desde danés, islandés, noruego bokmål, noruego nynorsk y sueco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a SmolLM2-135M-Instruct, un transformer decoder-only denso de 134,5 millones de parámetros, sin mecanismos de atención lineal ni mezcla de expertos. El modelo parte de un checkpoint intermedio (`jekunz/smollm135m-da05-is1-nno05-nob05-sv05-ties`) que es una fusión TIES de modelos entrenados sobre las porciones danesa, islandesa, noruego bokmål, noruego nynorsk y sueca de FineWeb-2, con ponderación superior para el islandés. Sobre esa base se aplica un ajuste adicional con la porción de feroés de FineWeb-2.

Los hiperparámetros documentados por el autor son: 1 época por cada lengua de origen y 5 épocas para el feroés, tasa de aprendizaje 5e-4, scheduler coseno, warmup del 5 %, tamaño de lote 8, acumulación de gradientes de 32 pasos (lote efectivo 256), longitud máxima de contexto de 2.048 tokens, semilla 3 (una de tres semillas de entrenamiento para esta configuración) y una única GPU A100 de 40 GB. No se documenta el número total de tokens procesados ni la composición exacta del dataset más allá de la referencia a FineWeb-2. Tampoco se indica si hubo fases de RLHF o DPO posteriores.

## Capacidades

- Generación de texto conversacional en feroés, heredada del ajuste instructivo de SmolLM2-135M-Instruct.
- Modelado de lenguaje en feroés a partir de transfer desde lenguas nórdicas emparentadas, con especial énfasis en el islandés.
- Generación de texto general (no se documentan capacidades específicas de razonamiento, matemáticas o código en esta variante).
- Soporte de conversación multi-turno según la plantilla de chat heredada de SmolLM2-Instruct (no verificada en esta ficha).
- Capacidades multilingües limitadas al feroés y, de forma indirecta, a las lenguas usadas en la fusión TIES; no se garantiza un comportamiento correcto en castellano ni en otras lenguas.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación sobre transfer learning entre lenguas nórdicas: el modelo sirve como punto de partida para estudiar cuánto conocimiento del islandés y del resto de lenguas escandinavas se transfiere al feroés, comparando con las otras semillas del mismo experimento.
- Generación de texto sintético en feroés para aumento de datos: puede producir borradores que, tras revisión humana, amplíen corpus de entrenamiento para modelos mayores en una lengua con pocos recursos.
- Prototipado de asistentes conversacionales en feroés: con 135M de parámetros y contexto de 2.048 tokens, permite iterar rápidamente sobre plantillas de chat y flujos de diálogo antes de escalar a modelos mayores.
- Evaluación de técnicas de fusión de modelos (TIES): el checkpoint base y sus variantes por semilla permiten analizar la estabilidad de las fusiones multi-idioma en modelos pequeños.
- Despliegue en entornos con recursos muy limitados: inferencia en CPU o en GPUs de consumo para tareas de generación corta, clasificación de texto o autocompletado en feroés.
- Educación y divulgación: ejemplo reproducible de un pipeline completo de ajuste (fusión, transfer y ajuste final) documentado con hiperparámetros concretos, útil para enseñar prácticas de entrenamiento en lenguas de bajos recursos.
- Experimentos de comparación de semillas: al existir tres semillas para la misma configuración, permite medir la varianza del entrenamiento en tareas downstream de feroés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,54 GB solo para pesos; en bf16/fp16, unos 0,27 GB; en cuantizaciones de 8 bits, alrededor de 0,14 GB, y en 4 bits, unos 0,07 GB. A esto hay que sumar la memoria del contexto (2.048 tokens), que en este tamaño es marginal.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el entrenamiento documentado se realizó en una A100 de 40 GB, pero la inferencia cabe holgadamente en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso en iGPUs modernas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con soporte para transformers o llama.cpp, incluidas las de gama baja.
- Opciones de despliegue: transformers (librería original), text-generation-inference (el repo está marcado como compatible con endpoints), llama.cpp y Ollama tras conversión a GGUF, y vLLM para servir en lote.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera una latencia muy baja en GPU y aceptable en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-isplus-scandimerge-seed3 | 134,5M | 2.048 | Feroés (con transfer nórdico) | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | 8.192 (según model card original) | Inglés principalmente | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | 8.192 (según model card original) | Inglés principalmente | Apache 2.0 | Hugging Face |

La comparación con los modelos originales de SmolLM2 se basa en datos públicos de sus model cards; no se dispone de evaluaciones comparativas directas con este ajuste en feroés. El modelo aquí descrito sacrifica cobertura idiomática general y longitud de contexto a cambio de especialización en una lengua de bajos recursos.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo no ha sido evaluado de forma amplia; su calidad real en feroés es desconocida más allá de la pérdida de entrenamiento.
- Riesgo elevado de alucinación y de generar texto incoherente, especialmente fuera del dominio de FineWeb-2 y en contextos largos.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Cobertura idiomática restringida al feroés; no se garantiza un comportamiento correcto en castellano, inglés u otras lenguas, pese a la base instructiva original.
- Posibles sesgos heredados de FineWeb-2 y de los corpus de las lenguas escandinavas usadas en la fusión TIES, no auditados.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el estado experimental del modelo desaconseja su uso en producción sin una evaluación previa específica.
- No se documentan salvaguardas de seguridad, filtrado de contenido ni alineación adicional más allá de la del checkpoint instructivo de partida.
- El entrenamiento se realizó con una sola semilla de tres; la varianza entre semillas no está cuantificada en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-isplus-scandimerge-seed3
- Modelo base intermedio: https://huggingface.co/jekunz/smollm135m-da05-is1-nno05-nob05-sv05-ties
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2-135M-Instruct (modelo de partida): https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Repositorio de SmolLM2: https://github.com/huggingface/smollm
- Paper de SmolLM2: https://arxiv.org/abs/2502.02737
- Paper de TIES-Merging: https://arxiv.org/abs/2306.01708

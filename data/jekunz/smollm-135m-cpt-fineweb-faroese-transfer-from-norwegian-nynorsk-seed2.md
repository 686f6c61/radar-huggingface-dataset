# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-norwegian-nynorsk-seed2

## Resumen

El modelo `jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-norwegian-nynorsk-seed2` es un ajuste fino experimental de SmolLM2-135M-Instruct desarrollado por el usuario jekunz. Se trata de un ejercicio de adaptación lingüística en dos fases: primero un entrenamiento continuado (continued pre-training) sobre el subconjunto de noruego nynorsk de FineWeb-2, y posteriormente un segundo entrenamiento sobre el subconjunto de feroés del mismo corpus. El objetivo declarado es investigar la transferencia de conocimiento entre lenguas germánicas nórdicas de bajos recursos, usando el nynorsk como puente hacia el feroés.

El modelo parte de la arquitectura SmolLM2 de Hugging Face, un transformer decoder-only de 134,5 millones de parámetros con una ventana de contexto de 2048 tokens. Al ser un modelo tan pequeño, su utilidad práctica se limita a tareas de generación de texto muy acotadas y a experimentación lingüística, no a razonamiento complejo ni a código en producción.

La relevancia de esta ficha radica en que documenta un caso típico de adaptación de un modelo instruct pequeño a un idioma de bajos recursos mediante entrenamiento continuado. El autor advierte explícitamente que el modelo está destinado a su investigación y que no ha sido evaluado de forma amplia, por lo que debe tratarse como un artefacto experimental y no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia SmolLM2) |
| Parámetros totales | 134.515.008 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización posterior vía llama.cpp/GGUF, aunque no se publican versiones cuantizadas) |
| Idiomas soportados | Feroés (fo); inglés heredado del modelo base (no declarado oficialmente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | jekunz/smollm-135m-cpt-fineweb-norwegian-nynorsk (a su vez derivado de SmolLM2-135M-Instruct) |
| Dataset de entrenamiento | HuggingFaceFW/fineweb-2 (subconjuntos nynorsk y feroés) |
| Tamaño del repositorio | 0,3 GB |
| Librería | transformers |
| Pipeline | text-generation |
| Semilla | 2 (una de tres semillas de esta configuración) |

## Arquitectura y entrenamiento

La arquitectura corresponde a SmolLM2-135M-Instruct, un transformer decoder-only con atención causal estándar, tokenizador propio de la familia SmolLM2 y 134,5 millones de parámetros. No emplea mezcla de expertos ni mecanismos híbridos SSM; es un transformer denso convencional. El modelo hereda el modo conversacional (chat template instruct) del modelo base, aunque el ajuste se ha realizado sobre texto crudo de FineWeb-2, lo que puede degradar parcialmente la calidad del formato instruct original.

El entrenamiento se realizó en dos fases secuenciales: una época sobre el subconjunto de noruego nynorsk de FineWeb-2 y cinco épocas sobre el subconjunto de feroés. Se usó una tasa de aprendizaje de 5e-4 con scheduler coseno, ratio de warmup de 0,05, tamaño de lote de 8 con 32 pasos de acumulación de gradiente (lote efectivo de 256), longitud máxima de contexto de 2048 tokens y una única GPU A100 de 40 GB. La semilla empleada fue la 2, una de tres semillas de la misma configuración. No se documenta uso de RLHF, DPO ni preferencias humanas; el proceso es exclusivamente de pre-entrenamiento continuado supervisado sobre texto.

## Capacidades

- Generación de texto en feroés, fruto del entrenamiento continuado sobre FineWeb-2 feroés.
- Generación de texto en noruego nynorsk como efecto residual de la primera fase de entrenamiento.
- Capacidad conversacional heredada del modelo base SmolLM2-135M-Instruct, aunque potencialmente degradada por el entrenamiento sobre texto crudo.
- Generación de texto en inglés, heredada del modelo base original, sin garantías de calidad tras el ajuste.
- No se documenta soporte de tool calling ni function calling específico.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada a los idiomas mencionados; no hay evaluación de cobertura más amplia.

## Casos de uso

- Investigación en transferencia entre lenguas nórdicas: el modelo sirve para estudiar si el pre-entrenamiento en nynorsk mejora la adaptación al feroés frente a un ajuste directo desde el modelo base, comparando las tres semillas publicadas.
- Generación de texto sintético en feroés para aumento de datos: puede producir frases y párrafos cortos que, tras filtrado humano, alimenten corpus de entrenamiento para modelos mayores.
- Experimentos de adaptación de bajo coste: con 134,5 millones de parámetros y 0,3 GB de pesos, permite iterar rápidamente en una sola GPU consumer para probar recetas de continued pre-training.
- Prototipado de correctores o autocompletado en feroés: dado su tamaño, puede integrarse en aplicaciones locales de escritorio o móviles para sugerencias de texto, siempre con validación humana.
- Docencia y demostraciones de fine-tuning lingüístico: sirve como ejemplo reproducible de pipeline de entrenamiento continuado con hiperparámetros documentados (LR, warmup, lote efectivo).
- Evaluación comparativa de semillas: al existir tres semillas de la misma configuración, permite medir la varianza de resultados en tareas de generación en feroés.
- Generación de texto creativo breve en feroés (poesía, microrrelatos) en entornos de investigación lingüística, sin expectativas de coherencia prolongada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo "no ha sido evaluado más ampliamente todavía".

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,54 GB solo para pesos (134,5 M × 4 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 0,27 GB para pesos.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,14 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,07 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, así como en A100 y H100 sin aprovechar su capacidad.
- Cabe en GPU consumer e incluso en CPU para inferencia en tiempo casi interactivo con llama.cpp.
- Opciones de despliegue: transformers (librería nativa del modelo), text-generation-inference (el modelo está marcado como endpoints_compatible), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera throughput alto en GPU y aceptable en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (smollm-135m-cpt-faroese-seed2) | 134,5 M | 2048 | Feroés (fo) | Apache 2.0 | Hugging Face |
| SmolLM2-135M-Instruct (modelo base original) | 135 M | 8192 (según ficha original de SmolLM2) | Inglés principalmente | Apache 2.0 | Hugging Face |
| jekunz/smollm-135m-cpt-fineweb-norwegian-nynorsk (modelo base directo) | 134,5 M | 2048 | Noruego nynorsk | Apache 2.0 | Hugging Face |
| Otras semillas de la misma configuración (seed 0 y seed 1) | 134,5 M | 2048 | Feroés | Apache 2.0 | Hugging Face (presumiblemente) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor declara que está destinado a su investigación y que no ha sido evaluado ampliamente; no debe usarse en producción sin una evaluación propia.
- Riesgo elevado de alucinación y de generar texto incoherente, especialmente por el tamaño reducido (134,5 M) y por el entrenamiento sobre texto crudo de FineWeb-2 sin ajuste instruct posterior.
- Posible degradación del formato conversacional original de SmolLM2-135M-Instruct, ya que el continued pre-training sobre texto plano puede romper el chat template.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística muy restringida: feroés como idioma principal declarado; el rendimiento en inglés y nynorsk no está garantizado ni evaluado.
- Sesgos desconocidos: no se documenta ningún análisis de sesgos; al entrenar sobre FineWeb-2, hereda los sesgos del corpus web filtrado.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación hace desaconsejable su uso comercial sin validación previa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Fecha de creación futura (2026-11-18) en los metadatos de Hugging Face, lo que puede indicar un error de marcado o una fecha programada; conviene verificar la integridad del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-norwegian-nynorsk-seed2
- Modelo base directo (nynorsk): https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-norwegian-nynorsk
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Familia SmolLM2 de Hugging Face: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct

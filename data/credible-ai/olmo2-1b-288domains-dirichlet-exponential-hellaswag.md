# credible-ai/olmo2-1B-288domains-dirichlet-exponential-hellaswag

## Resumen

`olmo2-1B-288domains-dirichlet-exponential-hellaswag` es un modelo de lenguaje de 1,41 mil millones de parámetros publicado por el grupo credible-ai. No es un modelo de propósito general: es un artefacto de investigación construido para reproducir los experimentos del artículo LinMix sobre mezcla de datos de entrenamiento. Concretamente, el modelo se preentrenó con 32 000 millones de tokens extraídos del corpus WebOrganizer, cuyos documentos están clasificados en 288 dominios temáticos y de formato, y la proporción de cada dominio en la mezcla final se optimizó con el método Olmix para maximizar el rendimiento en HellaSwag.

La arquitectura es OLMo 2 (`Olmo2ForCausalLM`) con 18 capas, tamaño oculto de 2048 y tokenizador GPT-NeoX-20B de 50 432 entradas de vocabulario. Los pesos se distribuyen en bfloat16 y en formato safetensors, con un repositorio de 2,8 GB, bajo licencia MIT.

Su relevancia es metodológica más que de producto: sirve como referencia reproducible de cómo la optimización automática de mezclas de datos (frente a proporciones fijas o heurísticas) afecta al rendimiento en una tarea concreta. Al estar entrenado solo con 32 000 millones de tokens y sin ajuste por instrucciones, su utilidad práctica como generador de texto es muy limitada; su valor está en la trazabilidad experimental y en el archivo `mix.json` que documenta la mezcla empleada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only, 18 capas, tamaño oculto 2048 |
| Parámetros totales | 1 414 678 528 (≈1,41 B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publican pesos en bfloat16; no hay GGUF, AWQ ni GPTQ en el repositorio) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT (pesos); los datos de entrenamiento están sujetos a los términos de Common Crawl y a la licencia CC-BY-4.0 del pool DCLM 1b-1x |
| Formato de pesos | safetensors, bfloat16 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo 2 implementada en Transformers: un transformer decoder-only con 18 capas, dimensión oculta de 2048 y el tokenizador de GPT-NeoX-20B (50 432 tokens de vocabulario). El entrenamiento se realizó con OLMo-core sobre 32 000 millones de tokens procedentes de WebOrganizer/Corpus-200B, un corpus derivado del pool DCLM 1b-1x que organiza los documentos web en 288 dominios que combinan tema y formato. Las secuencias tokenizadas exactas usadas en el entrenamiento están publicadas en el dataset `credible-ai/weborganizer-corpus-200b-tokenized`, lo que permite reproducir el preentrenamiento token a token.

La innovación está en el procedimiento de mezcla de datos, no en el modelo. El método Olmix ajusta un sustituto exponencial sobre un enjambre de pesos Dirichlet evaluados con un modelo proxy de 60 M de parámetros (`credible-ai/olmo2-60M-288domains-dirichlet`), y las proporciones resultantes se aplican al entrenamiento del modelo final. El objetivo de optimización declarado es HellaSwag. El repositorio incluye `mix.json` con la mezcla efectiva. No se documenta en la model card el uso de RLHF, DPO ni ningún ajuste posterior al preentrenamiento, ni datos sobre composición lingüística más allá del inglés.

## Capacidades

- Generación de texto autoregresiva en inglés, sin ajuste por instrucciones ni formato conversacional.
- Predicción de continuación de texto coherente a nivel local; útil como modelo base para experimentos de modelado de lenguaje.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de capacidades de agente, razonamiento multi-paso, modo "thinking", visión ni audio.
- Multilingüismo: limitado al inglés según la model card.
- Capacidad destacable: trazabilidad completa de la mezcla de datos y de las secuencias de entrenamiento, reproducible con OLMo-core.

## Casos de uso

- Reproducción de los experimentos del artículo LinMix: cargar el modelo y la mezcla `mix.json` para verificar la curva de entrenamiento y la métrica en HellaSwag con el pipeline de OLMo-core.
- Ablaciones de mezcla de datos: usar este modelo como referencia entrenada con pesos Dirichlet optimizados y compararlo con variantes de mezcla uniforme o proporcional al tamaño de dominio.
- Validación de la metodología de proxies: contrastar las predicciones del modelo proxy de 60 M con el resultado real a 1,41 B para estudiar la transferibilidad del enjambre Dirichlet.
- Verificación de pipelines de tokenización: al estar publicado el dataset tokenizado, sirve para comprobar que una implementación propia reproduce exactamente las secuencias de entrada.
- Modelo base para fine-tuning en dominios concretos en inglés: al ser pequeño (1,41 B) y de licencia MIT, es asequible para ajuste supervisado en una sola GPU sobre datos especializados.
- Pruebas de integración y benchmarking de motores de inferencia: su tamaño permite validar el soporte de la arquitectura OLMo 2 en Transformers, vLLM o TGI sin consumir recursos significativos.
- Docencia e investigación en curricula de datos: ejemplo ejecutable de cómo se pasa de una taxonomía de dominios a una mezcla de entrenamiento concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la mezcla se optimizó con HellaSwag como objetivo, pero no reporta la puntuación obtenida en esa ni en otras tareas (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM en bfloat16/fp16: unos 2,8 GB solo para los pesos; con caché KV y overhead de ejecución, entre 4 y 5 GB en la práctica (estimación basada en el recuento de parámetros).
- VRAM en cuantización de 8 bits: en torno a 1,5 GB de pesos (estimación; requiere convertir los pesos, ya que no hay artefactos prepublicados).
- VRAM en cuantización de 4 bits: en torno a 0,8-1 GB de pesos (estimación, previa conversión).
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090); también en iGPU y CPU con la cuantización adecuada.
- Despliegue: Transformers con `AutoModelForCausalLM` (soporte nativo de `Olmo2ForCausalLM`); vLLM y TGI requieren verificar en la versión en uso que la arquitectura OLMo 2 esté registrada; llama.cpp/Ollama necesitan generar previamente un GGUF, que el autor no publica.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Orientación |
|---|---|---|---|---|
| Este modelo (credible-ai) | 1,41 B | no disponible | MIT | Artefacto de investigación sobre mezcla de datos; solo inglés; sin ajuste por instrucciones |
| OLMo 2 1B (AllenAI) | ~1 B | no verificado en esta ficha | Apache-2.0 | Modelo base de propósito general, con datos y receta documentados |
| SmolLM2 1.7B (Hugging Face) | 1,7 B | no verificado en esta ficha | Apache-2.0 | Modelo pequeño de propósito general, con variante ajustada por instrucciones |
| Qwen2.5 1.5B (Alibaba) | 1,5 B | no verificado en esta ficha | Apache-2.0 | Modelo pequeño multilingüe, con variantes base e instruct |

Los datos de contexto y rendimiento de los modelos comparables deben verificarse en sus respectivas model cards antes de citarlos; en esta ficha solo se confirman los de credible-ai. La diferencia principal no es de tamaño, sino de finalidad: este modelo es un experimento controlado con mezcla optimizada, no un modelo listo para producto.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica explícitamente que no es un modelo de lenguaje de propósito general.
- Solo inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Sin ajuste por instrucciones ni por preferencias (no consta RLHF ni DPO): no sigue instrucciones ni mantiene formato conversacional de forma fiable.
- Entrenado con 32 000 millones de tokens, un volumen reducido que limita el conocimiento factual y aumenta el riesgo de alucinación.
- No se documenta la longitud de contexto, por lo que no debe asumirse ninguna ventana concreta en producción.
- Sesgos: al derivar de Common Crawl (vía DCLM 1b-1x), hereda los sesgos y la distribución de calidad del corpus web; la model card no incluye análisis de sesgo.
- Licencia: los pesos son MIT, pero los datos de entrenamiento están sujetos a los términos de uso de Common Crawl y a CC-BY-4.0; conviene revisar las obligaciones de atribución si se redistribuyen derivados.
- Sin artefactos de cuantización publicados: cualquier despliegue en 4 u 8 bits exige conversión y validación propias.
- No hay resultados de benchmarks publicados, así que no se puede acreditar su calidad frente a alternativas del mismo tamaño.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/olmo2-1B-288domains-dirichlet-exponential-hellaswag
- Modelo proxy del enjambre Dirichlet: https://huggingface.co/credible-ai/olmo2-60M-288domains-dirichlet
- Código de LinMix: https://github.com/credibleai/linmix
- OLMo-core: https://github.com/allenai/OLMo-core
- Documentación de OLMo 2 en Transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use

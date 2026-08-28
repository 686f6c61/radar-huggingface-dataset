# nikitastheo/v3-babylm-fra-ell-sequential_interleaved

## Resumen

El modelo `nikitastheo/v3-babylm-fra-ell-sequential_interleaved` es un transformer decoder-only de tipo GPT-2 con 123,8 millones de parámetros, desarrollado por nikitastheo en el marco del desafío BabyLM. Su objetivo es estudiar la adquisición de lenguaje con un volumen de datos restringido (del orden de 100 millones de palabras), entrenando de forma bilingüe con francés y griego mediante una estrategia de intercalado secuencial de los dos idiomas. El nombre del repositorio indica que se trata de la tercera versión (v3) de una serie de experimentos con pares de lenguas.

La relevancia de este modelo reside en su carácter de herramienta de investigación: permite analizar cómo un modelo de tamaño moderado aprende representaciones multilingües cuando los datos son escasos y se presentan de forma intercalada. No está orientado a producción, sino a experimentos de lingüística computacional y transferencia entre idiomas. El entrenamiento se realizó con un script propio basado en Hugging Face Accelerate, sin usar la clase `Trainer`, y el tokenizador es específico para francés (`nikitastheo/babylm-fra-tokenizer`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, causal LM) |
| Parametros totales | 123.886.080 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (configuracion base GPT-2, probablemente 1024, sin confirmar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | frances y griego (inferido del nombre del modelo; no confirmado en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 estándar: un transformer decoder-only con atención causal, normalización de capas y embeddings posicionales aprendidos. La configuración base se define en `model_configs/gpt_base_config.json`, aunque no se detallan el número de capas, cabezas de atención ni dimensiones ocultas en la documentación disponible.

El entrenamiento se realizó con `train_clm.py`, un script de Hugging Face Accelerate que no utiliza la clase `Trainer`. Los hiperparámetros principales son: 27.170 pasos de optimización, tasa de aprendizaje de 0,0001 con scheduler lineal, 2.717 pasos de warmup (10% del total), batch size de 32 por dispositivo y sin acumulación de gradientes. El aspecto más distintivo es la estrategia de intercalado secuencial de idiomas: los datos de francés y griego se presentan en bloques secuenciales, con un cambio de idioma en el epoch 10. Esta técnica busca estudiar cómo el modelo alterna entre dos lenguas durante el entrenamiento y si se produce transferencia o interferencia.

No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset, pero al estar enmarcado en BabyLM se asume un volumen de datos limitado (alrededor de 100 millones de palabras). Tampoco se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de texto causal en francés y griego, con capacidad de completar secuencias y generar texto coherente a corta distancia.
- Modelo bilingüe entrenado con intercalado secuencial, lo que permite estudiar la representación conjunta de dos lenguas en un mismo espacio latente.
- Fine-tuning: al ser un modelo de tamaño moderado (123M), es adecuado para ajuste fino en tareas específicas con recursos computacionales limitados.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión ni audio.
- No se indica soporte para modo de pensamiento extendido (thinking mode).

## Casos de uso

- Investigación en adquisición de lenguaje: el modelo sirve para analizar cómo un transformer aprende dos idiomas con datos limitados, comparando la estrategia de intercalado secuencial con otras (mezcla aleatoria, entrenamiento monolingüe).
- Experimentos de transferencia entre lenguas: dado su entrenamiento bilingüe, puede usarse para estudiar si el conocimiento aprendido en francés se transfiere al griego y viceversa, por ejemplo evaluando la perplejidad cruzada.
- Generación de texto corto en francés y griego: para prototipos de generación de frases, completado de texto o aumento de datos en estos idiomas, siempre que la longitud sea limitada.
- Fine-tuning para clasificación de texto bilingüe: partiendo de este modelo, se puede ajustar para tareas de análisis de sentimiento o detección de temas en francés y griego con pocos ejemplos.
- Benchmark de eficiencia de datos: al ser un modelo BabyLM, es útil para comparar arquitecturas y estrategias de entrenamiento bajo el régimen de datos limitados del desafío.
- Docencia y divulgación: su tamaño reducido permite ejecutarlo en portátiles, lo que lo hace adecuado para demostraciones de generación de lenguaje y análisis de representaciones en cursos de PLN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan métricas de perplejidad con otros modelos BabyLM en la model card.

## Requisitos de hardware

- VRAM estimada: con 123,8 millones de parámetros, en fp32 el modelo ocupa aproximadamente 495 MB de memoria. Con cuantización a 8 bits (si se aplicara) bajaría a unos 124 MB, y a 4 bits a unos 62 MB. Sin embargo, no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en fp32. Una RTX 3060, RTX 4060 o similar puede ejecutarlo sin problemas. También es viable en CPU para generación de texto corta.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna, incluidas las integradas de gama alta.
- Opciones de despliegue: al ser un modelo de la familia GPT-2 con pesos en safetensors, es compatible con Hugging Face Transformers, vLLM, llama.cpp (si se convierte a GGUF), Ollama (mediante conversión) y Text Generation Inference (TGI).
- Latencia y throughput: no se han publicado mediciones. Para un modelo de este tamaño, en una GPU moderna se espera una latencia de decodificación de decenas de milisegundos por token, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo pertenece a la familia BabyLM, donde existen otros modelos del mismo autor (por ejemplo, `v2-babylm-fra-ell-sequential_interleaved` o `v2-babylm-nld-ell-sequential_interleaved`), pero no se han publicado métricas comparativas. Tampoco se conocen modelos comerciales o de referencia con la misma configuración bilingüe francés-griego y el mismo régimen de datos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Tamaño reducido: con 123M parámetros, la capacidad de razonamiento complejo y generación de texto largo es limitada. No es adecuado para tareas que requieran conocimiento del mundo extenso o razonamiento multi-paso.
- Datos de entrenamiento limitados: al ser un modelo BabyLM, el volumen de datos es muy inferior al de modelos como GPT-2 original o Llama. Esto puede provocar lagunas de vocabulario y menor fluidez en dominios especializados.
- Sesgos potenciales: no se documenta ningún proceso de filtrado de datos ni de mitigación de sesgos. El modelo puede reflejar sesgos presentes en los corpus de francés y griego utilizados.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido factualmente incorrecto o inventado, especialmente en contextos largos.
- Licencia no especificada: la ausencia de licencia impide conocer las condiciones de uso comercial o de redistribución. Se recomienda contactar con el autor antes de cualquier uso en producción.
- Idiomas no confirmados: aunque el nombre indica francés y griego, la model card solo menciona un tokenizador francés. La cobertura real del griego no está verificada.
- Sin soporte de herramientas: no implementa tool calling ni function calling, por lo que no es apto para integraciones agénticas sin adaptación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v3-babylm-fra-ell-sequential_interleaved
- Modelo relacionado (v2 francés-griego): https://huggingface.co/nikitastheo/v2-babylm-fra-ell-sequential_interleaved
- Modelo relacionado (v2 neerlandés-griego): https://huggingface.co/nikitastheo/v2-babylm-nld-ell-sequential_interleaved
- Modelo relacionado (v3 inglés-griego): https://huggingface.co/nikitastheo/v3-babylm-eng-ell-sequential_interleaved
- Despliegue en FriendliAI (v2 fra-ell): https://friendli.ai/models/nikitastheo/v2-babylm-fra-ell-sequential_interleaved
- Despliegue en FriendliAI (babylm-lem fra-ell): https://friendli.ai/models/nikitastheo/babylm-lem-fra-ell-sequential_interleaved

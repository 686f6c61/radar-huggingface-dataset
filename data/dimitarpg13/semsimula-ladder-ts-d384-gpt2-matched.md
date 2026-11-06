# dimitarpg13/semsimula-ladder-ts-d384-gpt2-matched

## Resumen

semsimula-ladder-ts-d384-gpt2-matched es un modelo de lenguaje GPT-2 desarrollado por dimitarpg13 como parte del proyecto de investigación Semantic Simulation. No es un modelo de uso general: se trata del baseline de referencia "matched" (con presupuesto de tokens idéntico) para la generación 3 (Gen 3) de los experimentos Semantic Simulation sobre el corpus TinyStories. Su función es servir de punto de comparación con un transformer estándar frente a los modelos experimentales basados en potenciales escalares y mecánica lagrangiana (SO-TS y FO-TS).

El modelo es un GPT-2 con dimensión d = 384, 8 capas y 33,7M de parámetros, entrenado sobre exactamente 315.392.000 tokens de TinyStories (aproximadamente 0,67 pasadas sobre el split de entrenamiento). Alcanza una perplejidad de validación estabilizada de 4,47 en el bloque 512, medida sobre los primeros 2M tokens del split de validación de TinyStories.

Su relevancia es principalmente metodológica: permite leer las perplejidades de los modelos Semantic Simulation (5,16 para SO-TS y 5,13 para FO-TS, es decir, un 15,4 % y un 14,8 % peores) contra un transformer convencional entrenado con el mismo corpus, calendario de aprendizaje y presupuesto de tokens. El entrenamiento completo se realizó en una sesión única de Colab sobre una A100 en 1,6 horas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | 33,7M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (bloque de entrenamiento y evaluación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (.pt, checkpoint `gpt2_baseline_best.pt`) |

## Arquitectura y entrenamiento

El modelo es un transformer GPT-2 estándar con dimensión de embedding 384 y 8 capas (L = 8). Se empleó el tokenizador y la función de tokenización de la propia "ladder" del proyecto Semantic Simulation, y se entrenó con un tamaño de lote efectivo de 32 secuencias × 512 tokens por paso, durante 19.250 pasos (315.392.000 tokens en total, unos 0,67 pasadas sobre los ~0,47B de tokens GPT-2 del split de entrenamiento de TinyStories).

El calendario de aprendizaje fue de tipo WSD (warmup-stable-decay): warmup lineal durante el 5 % de 16.250 pasos (hasta el paso 812), tasa de aprendizaje pico de 1,2e-03 mantenida hasta el 65 % (paso 10.562), decaimiento coseno hasta un suelo de 6e-05 en el paso 16.250 y, a continuación, 3.000 pasos adicionales a esa tasa mínima. La nota de reproducción indica que la tasa pico se validó sobre OpenWebText y no se ajustó específicamente para TinyStories. No se menciona RLHF, DPO ni ajuste por instrucciones: es un modelo entrenado desde cero para investigación. La ejecución se completó sin interrupciones en una A100 (1,6 h, 0,30 s por paso), con 38 evaluaciones y sin picos de pérdida.

## Capacidades

- Generacion de texto en inglés, con calidad limitada al dominio de entrenamiento (TinyStories, historias infantiles sencillas).
- Modelado de lenguaje causal estándar (predicción del siguiente token) sin capacidades de razonamiento avanzadas, código ni matemáticas más allá de lo que un GPT-2 de 33,7M entrenado en TinyStories puede ofrecer.
- No hay soporte documentado de tool calling, function calling ni capacidades de agentes.
- No hay soporte documentado de visión, audio ni modo de razonamiento extendido.
- Capacidades multilingues: limitadas al inglés; el corpus de entrenamiento es TinyStories en inglés.
- Valor principal como artefacto de investigación: baseline reproducible y comparable para estudios de ablación de mecanismos (estudio "ladder", pre-registrado).

## Casos de uso

- Baseline para investigación en arquitecturas alternativas: sirve como transformer de referencia con presupuesto de tokens idéntico (315M tokens) para comparar perplejidades de modelos experimentales como SO-TS y FO-TS del proyecto Semantic Simulation.
- Estudios de escalado en profundidad ("depth ladder"): al ser un GPT-2 con d = 384 y L = 8 entrenado con un protocolo documentado y pre-registrado, es útil como punto fijo en estudios de ablación de mecanismos.
- Reproducción de experimentos docentes o de investigación: el repositorio incluye el notebook autocontenido (`colab_matched_gpt2_baseline_openwebtext.ipynb`), el log completo de la ejecución, el registro por pasos en JSONL y el checkpoint, lo que permite reproducir el entrenamiento en Colab con una A100 en unas 1,6 horas.
- Generacion de historias cortas estilo infantil: dado que TinyStories está compuesto de narraciones simples, el modelo puede generar texto coherente de ese estilo, aunque con la calidad limitada de un modelo de 33,7M.
- Evaluación comparativa de perplejidad en dominios estrechos: útil como referencia de qué valores de perplejidad son normales en TinyStories (alrededor de 5), advirtiendo de que no son comparables con los de OpenWebText.
- Verificación de protocolos de entrenamiento (calendario WSD, warmup, decaimiento coseno): el log de entrenamiento con 38 evaluaciones permite estudiar el comportamiento de la curva de aprendizaje en un corpus de baja entropía.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Tarea | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| text-generation | TinyStories (roneneldan/TinyStories) | validation | Perplejidad (bloque 512, estabilizada) | 4,47 |

Detalles adicionales declarados por el autor en la model card:

| Modelo en TinyStories, 315M tokens | PPL estabilizada | Frente a este modelo |
|---|---:|---:|
| Este modelo (GPT-2, d = 384, L = 8, 33,7M) | 4,47 | — |
| SO-TS (Semantic Simulation, segundo orden, L = 2, 76,8M) | 5,16 | +15,4 % |
| FO-TS (el mismo, primer orden entre capas) | 5,13 | +14,8 % |

Como referencia de orientación, el autor indica que la misma configuración GPT-2 sobre OpenWebText se estabiliza en 48,37 (W2) y el núcleo de segundo orden sin pozos en 58,32 (+21 %). El valor estabilizado es la media de las evaluaciones en los pasos 18.000, 18.500 y 19.000 (4,47, 4,47, 4,46); el mejor y último valor fue 4,46 en el paso 19.000.

## Requisitos de hardware

- Entrenamiento: se completó en una sesión única de Colab sobre una NVIDIA A100, con una duración total de 1,6 horas (0,30 s por paso, 19.250 pasos).
- Inferencia: con 33,7M de parámetros en precisión completa (FP32), los pesos ocupan unos 135 MB; la VRAM necesaria para inferencia es mínima y cabe con holgura en cualquier GPU moderna, incluidas las de la gama consumer (por ejemplo, una RTX 3060 o superior, e incluso GPUs integradas o CPU).
- No se publican estimaciones de cuantización ni de VRAM para inferencia por parte del autor.
- Despliegue: el formato de pesos es un checkpoint PyTorch (.pt) con el modelo definido en el notebook incluido; no hay pesos en safetensors ni GGUF, por lo que el despliegue con vLLM, llama.cpp, Ollama o TGI no está documentado y probablemente requiera adaptación manual. La vía soportada es ejecutar el notebook o cargar el checkpoint en PyTorch.
- Latencia y throughput: no disponibles en la información publicada.

## Comparativa con modelos similares

Comparativa con los modelos de la misma familia experimental (datos declarados por el autor):

| Modelo | Arquitectura | Parametros | Capas | PPL en TinyStories (315M tokens) | Licencia |
|---|---|---|---|---:|---|
| semsimula-ladder-ts-d384-gpt2-matched (este modelo) | GPT-2 | 33,7M | 8 | 4,47 | CC-BY-4.0 |
| SO-TS (semsimula-ladder-live-ts-d384-l2-none-norc-sr2) | Semantic Simulation, segundo orden | 76,8M | 2 | 5,16 | no disponible |
| FO-TS (semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fo) | Semantic Simulation, primer orden | 76,8M | 2 | 5,13 | no disponible |

Advertencia del propio autor: profundidad y número de parámetros no están igualados (L = 8 frente a L = 2; 33,7M frente a ~77M), por lo que los ratios son orientativos y no constituyen una afirmación de eficiencia comparable. No hay datos comparativos con otros GPT-2 de terceros en las mismas condiciones.

## Limitaciones y advertencias

- Una sola semilla: los resultados no incluyen varianza entre ejecuciones.
- Es una referencia, no un transformer ajustado: la tasa de aprendizaje pico se validó sobre OpenWebText y no se optimizó para TinyStories, por lo que su perplejidad podría mejorar con un ajuste específico.
- Profundidad y parámetros no igualados frente a los modelos comparados (L = 8 y 33,7M frente a L = 2 y ~77M): las comparaciones de eficiencia no son like-for-like.
- TinyStories es un corpus estrecho y de baja entropía: las perplejidades en torno a 5 son normales en él y no son comparables con las de OpenWebText ni con las de otros corpus.
- El modelo está entrenado solo en inglés y en un dominio muy concreto (historias infantiles); su uso fuera de ese dominio no está validado.
- No hay datos sobre sesgos, riesgo de alucinación ni comportamiento en producción: es un artefacto de investigación sin evaluaciones de seguridad publicadas.
- La licencia CC-BY-4.0 aplica al repositorio; conviene verificar el alcance exacto de la licencia sobre los pesos antes de cualquier uso comercial.
- El formato de pesos (checkpoint .pt con arquitectura definida en un notebook) limita la compatibilidad directa con herramientas de despliegue estándar.
- La perplejidad declarada está marcada como no verificada ("verified: false") en el model-index.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-ts-d384-gpt2-matched
- Referencia OpenWebText del mismo GPT-2: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Colección Gen 3 first-vs-second-order: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Modelo comparado SO-TS: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2
- Modelo comparado FO-TS: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fo
- Nota complementaria (protocolo de la ladder y baseline matched): https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/Depth_Ladder_and_Matched_Baseline_Protocol.md
- Repositorio del paper: https://github.com/dimitarpg13/semsimula-paper
- Dataset de entrenamiento: https://huggingface.co/datasets/roneneldan/TinyStories

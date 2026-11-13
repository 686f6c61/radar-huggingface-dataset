# farefaine/qal-tiny

## Resumen

Qal tiny es un modelo de lenguaje de tipo GPT entrenado desde cero para tigriña (ti), una lengua semítica de Eritrea y Etiopía con escasos recursos digitales. Lo desarrolla el autor independiente farefaine como parte de la serie *Building Qal*, que entrena cinco tamanos distintos con el mismo corpus, tokenizador y receta para permitir comparaciones controladas. Esta variante "tiny" cuenta con 5.805.568 parámetros segun la model card (5.838.336 en los pesos safetensors publicados) y una ventana de contexto de solo 128 tokens.

El modelo no compite en capacidades generales: su interes es metodológico y lingüístico. Demuestra que es posible entrenar un transformer pequeño y funcional para una lengua de bajos recursos con unos 79 millones de tokens por época y una sola GPU, alcanzando una perplejidad de validación de 49,5. Es relevante para investigadores que estudian modelos compactos en lenguas de bajos recursos, para quienes quieren reproducir la receta completa y para desarrolladores que necesitan un punto de partida barato para experimentar con tigriña.

La arquitectura es un transformer decoder-only de 2 capas, 4 cabezas de atención, dimensión de embedding 256 y vocabulario BPE de 8.192 tokens. No dispone de ajuste por instrucciones ni de alineamiento con preferencias humanas, por lo que genera texto plausible en tigriña pero no es fiable para datos factuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT), 2 capas, 4 cabezas, dim 256, embeddings posicionales absolutos aprendidos |
| Parametros totales | 5.805.568 (model card) / 5.838.336 (safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en BF16/PyTorch; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Tigriña (ti) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (libreria PyTorch) |
| Vocabulario | 8.192 tokens (BPE) |
| Dataset de entrenamiento | farefaine/tigrinya-pretraining (version limpiada), ~79M tokens por época |
| Epocas / pasos | 30 épocas, 96.420 pasos |
| Precisión de entrenamiento | BF16 mixed precision, una sola GPU |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only convencional con atención multi-cabeza estándar, 2 capas y 4 cabezas de 64 dimensiones cada una (dimensión total 256). Usa embeddings posicionales absolutos aprendidos, no RoPE ni mecanismos de atención lineal o decodificación especulativa. El tokenizador es un BPE con vocabulario de 8.192 tokens, entrenado especificamente para tigriña, lo que evita la fragmentación excesiva que sufriría un tokenizador multilingüe generalista en este idioma.

El entrenamiento se realizó sobre una versión limpiada del dataset `farefaine/tigrinya-pretraining`, de aproximadamente 79 millones de tokens por época, durante 30 épocas (96.420 pasos) con lotes de 192 secuencias de 128 tokens. Se usó AdamW (betas 0,9 y 0,99), weight decay 0,1, dropout 0,1, tasa de aprendizaje pico de 0,004 con un schedule warmup-stable-decay (mantenida durante el 80% del entrenamiento y luego decaída) y precisión mixta BF16 en una única GPU. No hubo RLHF, DPO ni ajuste por instrucciones. El corpus procede de fuentes públicas de tigriña, mayoritariamente texto periodístico: TLMD (Gaim, Yang y Park, 2021), el Tigrinya NLP Corpus de la SeReT Foundation y TiQuAD (Gaim, Yang, Park y Park, 2023).

## Capacidades

- Generación de texto autoregresiva en tigriña con muestreo por temperatura (el ejemplo de la model card usa temperatura 0,8).
- Modelado del lenguaje y cálculo de perplejidad, útil como referencia en experimentos de lenguas de bajos recursos.
- Generación de texto "con forma fluida" en tigriña, segun el propio autor, sin garantía de corrección factual.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo de razonamiento (thinking), visión, audio ni modalidad adicional.
- No está ajustado para seguir instrucciones ni para diálogo multi-turno.
- Capacidad monolingüe: solo tigriña; no se documenta competencia en amárico, inglés ni otras lenguas.

## Casos de uso

- Investigación en lenguas de bajos recursos: sirve como línea base reproducible para comparar tokenizadores, recetas de entrenamiento o tamanos dentro de la propia familia Qal, ya que los cinco tamanos comparten datos y receta.
- Experimentación académica con presupuesto mínimo: con 5,8M parámetros y 128 tokens de contexto, se puede entrenar y ejecutar en una sola GPU de consumo, lo que lo hace apto para cursos y trabajos de fin de máster sobre modelado de lenguas de bajos recursos.
- Generación de texto sintético de tigriña para aumento de datos: puede producir texto adicional con fines de preentrenamiento o pruebas de pipelines de NLP, siempre que se valide la calidad y se documente el origen.
- Pruebas de infraestructura de despliegue: por su tamano, es útil para validar pipelines de inferencia (carga de safetensors, tokenizador, generación) antes de escalar a modelos mayores de la familia.
- Análisis lingüístico asistido: generación de continuaciones cortas para estudiar patrones morfológicos o colocaciones en tigriña, con revisión humana obligatoria.
- Docencia sobre arquitecturas transformer: la implementación de referencia en el repositorio de GitHub permite inspeccionar capa a capa un GPT completo y funcional con fines didácticos.
- Evaluación comparativa de perplejidad: como referencia de perplejidad (49,5 en validación) para calibrar modelos mayores entrenados sobre el mismo corpus.

## Benchmarks y rendimiento

| Split | Loss | Perplejidad |
|---|---|---|
| Validación | 3,901 | 49,5 |
| Test | 3,913 | 50,1 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes en tigriña) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 (5,8M parámetros ocupan unos 12 MB en pesos; el resto es overhead de activaciones y tokenizador). Cabe holgadamente en cualquier GPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en CPU sin problema. Una RTX 4090, A100 o H100 están sobradamente dimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en GPUs integradas.
- Opciones de despliegue: la model card solo documenta carga mediante la clase `GPT` del repositorio https://github.com/farefaine/qal con PyTorch y el tokenizador de la libreria `tokenizers`. No se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI, y no hay pesos GGUF publicados.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Qal tiny | 5,8M | 128 | Tigriña | CC BY-SA 4.0 | Entrenado desde cero, sin instrucciones |
| Qal (otros tamanos de la familia) | no disponible en la informacion proporcionada | no disponible | Tigriña | CC BY-SA 4.0 (presumiblemente) | Misma receta y datos; comparables directamente |
| Modelos multilingües generalistas pequeños (p. ej. variantes de menos de 100M) | variable | variable | multilingüe | variable | No comparables en tigriña por cobertura limitada del idioma |

No se dispone de datos de benchmarks comparativos con otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo produce tigriña "con apariencia fluida" pero no es fiable para hechos: riesgo alto de alucinación.
- No está ajustado para seguir instrucciones; no debe usarse como asistente conversacional sin un ajuste posterior.
- Contexto muy corto (128 tokens), insuficiente para documentos largos, diálogo multi-turno o resúmenes extensos.
- Entrenado solo con unas 79M tokens por época, mayoritariamente texto periodístico: cobertura limitada de registros (técnico, literario, coloquial) y sesgos heredados de las fuentes.
- Monolingüe: no maneja otras lenguas ni traducción.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- No hay cuantizaciones oficiales (GGUF, AWQ, GPTQ) ni integración documentada con servidores de inferencia de alto rendimiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación externa ni comunidad de usuarios.
- No se documentan evaluaciones de seguridad, sesgo ni toxicidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/farefaine/qal-tiny
- Dataset de preentrenamiento: https://huggingface.co/datasets/farefaine/tigrinya-pretraining
- Código: https://github.com/farefaine/qal
- Serie *Building Qal*: https://farefaine.substack.com
- TLMD (Gaim, Yang y Park, 2021): https://zenodo.org/records/5139094
- Tigrinya NLP Corpus (SeReT Foundation): https://github.com/TigrinyaNLP/corpus
- TiQuAD (Gaim, Yang, Park y Park, 2023): https://github.com/fgaim/TiQuAD

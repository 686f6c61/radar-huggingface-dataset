# Akirayasha/gpt2-nli-sutd-bs16_lr1e-4

## Resumen

`gpt2-nli-sutd-bs16_lr1e-4` es un ajuste fino de GPT-2 small (124M parámetros) para inferencia de lenguaje natural (NLI) en inglés, desarrollado por el usuario Akirayasha en el marco del proyecto final del curso 50.040 NLP de la SUTD (otoño de 2026). El modelo reformula la clasificación NLI como predicción de siguiente token: recibe un par premisa-hipótesis y genera un único token de etiqueta (`0` implicación, `1` contradicción, `2` neutral).

La relevancia de esta ficha es doble. Por un lado, es un ejemplo didáctico de adaptación de un transformer decoder pequeño a una tarea de clasificación mediante formateo textual, sin cabeza de clasificación dedicada. Por otro, el autor evalúa el modelo en SORRY-Bench para medir su capacidad de distinguir peticiones dañinas de reformulaciones benignas, lo que aporta datos poco habituales en modelos de este tamaño.

Se trata de un artefacto de investigación académica, no de un modelo listo para producción: los pesos se distribuyen como `state_dict` de PyTorch con una implementación propia de GPT-2, no como checkpoint de `transformers`, y el autor advierte explícitamente que no debe usarse como filtro de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (GPT-2 small), implementación propia en PyTorch |
| Parámetros totales | 124M (heredados de GPT-2 small) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.023 tokens de entrada (límite declarado por el autor) |
| Tipos de cuantización | no disponible (solo se publican pesos en `model.pt`, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (state_dict de PyTorch); requiere `model.py`, `config.py` y `utils.py` incluidos en el repo |
| Tarea | Clasificación de texto (NLI) como generación de token de etiqueta |
| Modelo base | `openai-community/gpt2` |
| Datasets de entrenamiento | `nyu-mll/multi_nli`, `facebook/xnli` |
| Tamaño del repo | 0,5 GB |

## Arquitectura y entrenamiento

El modelo parte de los pesos oficiales de GPT-2 small (124M) cargados en una implementación propia del transformer decoder, no en la clase `GPT2LMHeadModel` de Hugging Face. La tarea NLI se formula como *next-token prediction* sobre una plantilla fija: `Premise: {premise}\nHypothesis: {hypothesis}\nLabel:` seguida de un único token de etiqueta (`0` implicación, `1` contradicción, `2` neutral). La pérdida es entropía cruzada sobre ese token de etiqueta exclusivamente, con el prompt y los tokens de padding enmascarados a -100.

El entrenamiento usa 392.702 pares de entrenamiento de MultiNLI (`multinli.train.en`), optimizador AdamW implementado por el autor, learning rate 1e-4, batch size 16, weight decay 0,01, una sola época (24.544 pasos) y sin scheduler. La pérdida media de entrenamiento reportada es 0,62. El repositorio incluye `training_progress.json` con la curva de pérdida. Existen dos ejecuciones hermanas con la misma receta y distinto learning rate (`baseline` y `lr2e-5`), lo que permite comparar el efecto del hiperparámetro.

## Capacidades

- Clasificación NLI en inglés: determina si una hipótesis se sigue de una premisa (implicación), la contradice o es neutral.
- Generación de un token de etiqueta condicionada al par premisa-hipótesis, con decodificación restringida a un paso (`max_gen_length=1`).
- Evaluación de reformulaciones: el formato permite comparar una petición original con variantes de estilo (pregunta, role-play, slang) y con una versión benigna.
- Detección de similitud semántica entre pares de frases, como subproducto de la tarea NLI.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- No soporta multilingüismo: el autor reporta rendimientos de 0-7 % en estilos de SORRY-Bench en otros idiomas o cifrados.

## Casos de uso

- Evaluación académica de formulaciones NLI: sirve como referencia reproducible para comparar el enfoque de "clasificación como generación" frente a cabezas de clasificación dedicadas sobre el mismo corpus MultiNLI.
- Análisis de robustez ante reformulaciones: el pipeline premisa-hipótesis permite medir si una petición mantiene su significado cuando se reescribe en estilo pregunta, role-play o jerga, como hace la evaluación con SORRY-Bench.
- Detección de duplicados y paráfrasis en corpus en inglés: pares de frases con etiqueta de implicación alta pueden marcarse como candidatos a fusión en procesos de deduplicación de datos.
- Filtrado de pares de preguntas-respuestas en inglés: dado un par (pregunta, respuesta candidata), el modelo puede señalar si la respuesta es contradictoria o neutral respecto a la pregunta, útil para descartar respuestas incoherentes en pipelines de curación de datasets.
- Investigación sobre sesgos en modelos pequeños: al ser un GPT-2 de 124M con licencia MIT y pesos abiertos, es un banco de pruebas económico para estudiar cómo un modelo pequeño maneja negaciones y contradicciones.
- Docencia y reproducción de experimentos: el código propio (`model.py`, `config.py`, `utils.py`) y la curva de pérdida permiten reproducir el ajuste fino en una sola GPU de consumo en pocas horas.

## Benchmarks y rendimiento

Resultados reportados por el autor en XNLI inglés (predicción del token de etiqueta, coincidencia exacta):

| Split | Ejemplos | Accuracy |
|---|---|---|
| Validación (dev) | 2.490 | 78,47 % |
| Test | 5.010 | 78,64 % |

Resultados en SORRY-Bench (sin entrenamiento sobre ese dataset). La primera columna mide si la reformulación implica la petición base; la segunda, si la reformulación se clasifica como contradictoria o neutral frente a una versión benigna:

| Estilo | Ejemplos | Reformulación vs. base (implicación) | Reformulación vs. gemelo benigno (contradicción o neutral) |
|---|---|---|---|
| `base` | 450 | no aplica | 88,2 % |
| `question` | 446 | 88,8 % | 88,3 % |
| `role_play` | 450 | 59,6 % | 89,3 % |
| `slang` | 450 | 31,8 % | 94,2 % |

El propio autor advierte que la segunda columna es fácil de superar respondiendo siempre neutral o contradictorio, por lo que debe leerse junto con la primera. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 para los 124M parámetros (unos 0,5 GB de pesos más activaciones y caché KV para 1.023 tokens).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en CPU sin problema para inferencia puntual.
- Cabe holgadamente en GPU de consumo: GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: el repositorio no publica pesos en formato `transformers`, GGUF ni safetensors, por lo que vLLM, llama.cpp, Ollama y TGI no pueden cargarlo directamente. Es necesario usar el código propio del repo (`model.py`, `config.py`, `utils.py`) con PyTorch. Convertir los pesos a `transformers` requeriría mapear el `state_dict` a `GPT2LMHeadModel`.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por ejemplo en GPU moderna y decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| `Akirayasha/gpt2-nli-sutd-bs16_lr1e-4` | 124M | 1.023 tokens | NLI en inglés como generación | MIT | `model.pt` (state_dict propio) |
| `Akirayasha/gpt2-nli-sutd-baseline` | 124M | 1.023 tokens | NLI en inglés como generación | MIT | `model.pt` (state_dict propio) |
| `Akirayasha/gpt2-nli-sutd-lr2e-5` | 124M | 1.023 tokens | NLI en inglés como generación | MIT | `model.pt` (state_dict propio) |
| `openai-community/gpt2` | 124M | 1.024 tokens | Modelado de lenguaje | MIT | safetensors / PyTorch |

Las dos ejecuciones hermanas comparten receta y solo difieren en learning rate, por lo que la comparación directa de precisión entre ellas es el eje más informativo. No se dispone de datos de benchmarks de esos dos modelos en la información proporcionada. Frente a alternativas tipo BERT-base o DeBERTa fine-tuned en MultiNLI, no hay resultados comparativos publicados en esta ficha.

## Limitaciones y advertencias

- El autor declara explícitamente que es un modelo de proyecto de curso para investigación y que no debe usarse como filtro de seguridad ni para moderar contenido.
- Solo inglés: el propio autor reporta 0-7 % de acierto en estilos de SORRY-Bench en otros idiomas o cifrados.
- Límite de entrada de 1.023 tokens; pares premisa-hipótesis más largos se truncan.
- Riesgo de alucinación del token de etiqueta: al ser generación libre restringida a un paso, el modelo podría en teoría emitir un token distinto de `0`, `1` o `2`; el código de ejemplo no valida ese caso.
- La evaluación con gemelo benigno es trivialmente superable respondiendo siempre neutral o contradictorio, por lo que no debe interpretarse como una medida robusta de seguridad.
- El formato de pesos no es estándar (`state_dict` propio), lo que dificulta la integración con ecosistemas como `transformers`, vLLM o llama.cpp y obliga a mantener el código del repo.
- No se han publicado análisis de sesgos demográficos ni de calibración en la información disponible.
- Licencia MIT: permite uso comercial, pero al derivar de GPT-2 conviene revisar las condiciones del modelo base de OpenAI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Akirayasha/gpt2-nli-sutd-bs16_lr1e-4
- Ejecución hermana baseline: https://huggingface.co/Akirayasha/gpt2-nli-sutd-baseline
- Ejecución hermana lr2e-5: https://huggingface.co/Akirayasha/gpt2-nli-sutd-lr2e-5
- Modelo base GPT-2: https://huggingface.co/openai-community/gpt2
- Dataset MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset XNLI: https://huggingface.co/datasets/facebook/xnli
- Dataset SORRY-Bench: https://huggingface.co/datasets/sorry-bench/sorry-bench-202406

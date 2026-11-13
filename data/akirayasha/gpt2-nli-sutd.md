# Akirayasha/gpt2-nli-sutd

## Resumen

`gpt2-nli-sutd` es un ajuste fino de GPT-2 small (124M parámetros) para inferencia de lenguaje natural (NLI) formulado como predicción del siguiente token. Lo desarrolla el usuario Akirayasha como proyecto final del curso 50.040 NLP de la SUTD (Fall 2026), y se publica bajo licencia MIT. El modelo recibe un par premisa/hipótesis y genera un dígito que codifica la relación entre ambas: `0` implica, `1` contradice, `2` es neutro.

La relevancia es acotada pero clara: demuestra que un transformer decoder pequeño, entrenado con cross-entropy sobre un único token de etiqueta, alcanza un 80,24% de accuracy en el split de test de XNLI en inglés, un resultado competitivo para un modelo de 124M parámetros. El checkpoint no es un `transformers` estándar: los pesos son un `state_dict` plano de PyTorch (`model.pt`) que requiere el código propio del autor (`model.py`, `config.py`, `utils.py`) para cargarse.

El modelo está entrenado únicamente en inglés y con una ventana de 1.023 tokens, lo que restringe su uso a pares cortos de frases. No debe confundirse con un clasificador de seguridad: el propio autor advierte que no sirve como filtro de contenido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (GPT-2 small), NLI como next-token prediction |
| Parámetros totales | 124M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.023 tokens |
| Tipos de cuantización | no disponible (pesos en `model.pt` de PyTorch, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `state_dict` de PyTorch (`model.pt`), no compatible de forma nativa con `transformers` |

## Arquitectura y entrenamiento

Se parte de los pesos oficiales de `gpt2` (124M) cargados en una implementación propia de GPT-2 en PyTorch, no en la clase de Hugging Face. El entrenamiento usa 392.702 pares de entrenamiento de MultiNLI (`multinli.train.en`) con el formato `Premise: {premise}\nHypothesis: {hypothesis}\nLabel:` seguido de un único token de etiqueta. La pérdida es cross-entropy sobre ese token de etiqueta exclusivamente, enmascarando con -100 los tokens de prompt y padding.

Hiperparámetros: AdamW (implementación propia), learning rate 2e-5, batch size 4, weight decay 0,01, 1 epoch (98.176 pasos), sin scheduler. Pérdida media de entrenamiento: 0,58. El autor compara con otras dos configuraciones: lr 5e-5 / batch 4 (dev 78,15%, test 76,63%) y lr 1e-4 / batch 16 (dev 78,47%, test 78,64%); la publicada (lr 2e-5) obtuvo el mejor resultado en dev y test. La curva de pérdida está en `training_progress.json`. No se reporta RLHF, DPO ni datos adicionales de ajuste.

## Capacidades

- Clasificación de pares premisa/hipótesis en tres clases: implicación, contradicción y neutralidad.
- Generación de un único token de etiqueta mediante decodificación autorregresiva (`max_gen_length=1`).
- Inferencia en CPU: el modelo es lo bastante pequeño para ejecutarse sin GPU.
- Manejo de pares de frases en inglés dentro del límite de 1.023 tokens.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No soporta otros idiomas distintos del inglés (el autor reporta 0-7% en estilos no ingleses de SORRY-Bench).
- No es un modelo generativo de texto libre: su salida útil es el token de etiqueta.

## Casos de uso

- **Detección de contradicciones en bases de conocimiento**: dado un par de afirmaciones (una de una fuente y otra de un documento), el modelo etiqueta si se implican, contradicen o son neutras, útil para validación de hechos en pipelines de curación de datos en inglés.
- **Filtrado de pares de preguntas/respuestas en datasets**: clasificar si una respuesta candidata implica la pregunta original, descartando pares neutros o contradictorios antes de incluirlos en un corpus de entrenamiento.
- **Evaluación de resúmenes por implicación**: comprobar si una frase del resumen se deduce de una frase del documento fuente, como métrica auxiliar de fidelidad en inglés.
- **Detección de reformulaciones en control de calidad de datos**: el autor lo evalúa frente a SORRY-Bench; con reformulaciones cercanas al original (`question`, `role_play`) detecta la equivalencia con 87,2% y 55,6% respectivamente, lo que sirve para marcar duplicados semánticos.
- **Prototipado académico de NLI**: al ser un proyecto docente con pesos y código abiertos, es útil como línea base reproducible para comparar formulaciones de NLI como clasificación frente a next-token prediction.
- **Componente de un pipeline de moderación como señal auxiliar**: pese a la advertencia del autor de no usarlo como filtro de seguridad, puede aportar una señal de "contradicción" frente a una política escrita, siempre combinada con otras capas.
- **Experimentos de eficiencia en CPU**: por su tamaño (124M) y licencia MIT, sirve para probar despliegues de clasificación NLI en entornos sin GPU.

## Benchmarks y rendimiento

XNLI inglés (predicción = token generado, exact match):

| Split | Ejemplos | Accuracy |
|---|---|---|
| Validación (dev) | 2.490 | 80,12% |
| Test | 5.010 | 80,24% |

SORRY-Bench (sin entrenamiento sobre él; 450 peticiones base dañinas reescritas en varios estilos):

| Estilo | Ejemplos | Reescritura vs. base (implicación) | Reescritura vs. gemelo benigno (contradicción o neutro) |
|---|---|---|---|
| `base` | 450 | n/a | 90,7% |
| `question` | 446 | 87,2% | 91,7% |
| `role_play` | 450 | 55,6% | 92,4% |
| `slang` | 450 | 50,0% | 89,3% |

El autor advierte que la prueba contra el gemelo benigno se supera fácilmente respondiendo siempre neutro o contradictorio, por lo que debe leerse junto con la primera columna. No se publican resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el checkpoint ocupa 0,5 GB en el repositorio; en fp32 son aproximadamente 0,5 GB de pesos, por lo que cabe holgadamente en cualquier GPU consumer con 2 GB o más.
- **GPU recomendadas**: no requiere GPU; el ejemplo de la model card se ejecuta en CPU (`device="cpu"`). Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) sirve sin problemas.
- **Consumer GPU**: sí, en todas las GPU modernas e incluso en CPU.
- **Opciones de despliegue**: no hay soporte nativo en vLLM, TGI, llama.cpp ni Ollama, ya que los pesos son un `state_dict` propio. El despliegue requiere el código del autor (`model.py`, `config.py`, `utils.py`) descargado con `snapshot_download` y cargado con `torch.load`.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | NLI (XNLI en) | Licencia | Formato |
|---|---|---|---|---|---|
| `gpt2-nli-sutd` | 124M | 1.023 | 80,24% (test) | MIT | `state_dict` PyTorch |
| GPT-2 small base | 124M | 1.024 | no disponible (no ajustado a NLI) | MIT | `transformers` / safetensors |
| BERT-base ajustado a NLI | 110M | 512 | no disponible en la información | Apache 2.0 (BERT) | `transformers` |
| RoBERTa-base ajustado a NLI | 125M | 512 | no disponible en la información | MIT | `transformers` |

No se dispone de resultados de benchmarks de los modelos alternativos en la información proporcionada; la comparación se limita a parámetros, contexto, licencia y formato. La ventaja principal de este modelo frente a BERT/RoBERTa es la licencia MIT y la formulación generativa; la desventaja es la falta de integración con el ecosistema `transformers`.

## Limitaciones y advertencias

- **Idioma**: entrenado solo en inglés; el autor reporta 0-7% de acierto en estilos no ingleses de SORRY-Bench.
- **Longitud**: entradas limitadas a 1.023 tokens; pares más largos se truncan.
- **Formato no estándar**: los pesos son un `state_dict` propio, no un checkpoint `transformers`; requiere el código del autor y no funciona con `AutoModelForSequenceClassification`.
- **No es un filtro de seguridad**: el autor lo advierte explícitamente; no debe usarse para moderar contenido.
- **Sesgos**: no se documentan sesgos específicos en la información proporcionada; al derivar de GPT-2 y MultiNLI, hereda los sesgos de ambos.
- **Alucinación**: al generar un único token de etiqueta restringido, el riesgo de alucinación de texto libre es bajo, pero puede producir etiquetas incorrectas en pares ambiguos o fuera de distribución.
- **Restricciones de licencia**: MIT permite uso comercial, pero el modelo se publica como proyecto de curso y sin garantías; el dataset SORRY-Bench no permite redistribución de prompts.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni comunidad verificable.
- **Producción**: no recomendado como componente crítico sin validación adicional en el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/Akirayasha/gpt2-nli-sutd
- Modelo base: https://huggingface.co/openai-community/gpt2
- Dataset MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset XNLI: https://huggingface.co/datasets/facebook/xnli
- Dataset SORRY-Bench: https://huggingface.co/datasets/sorry-bench/sorry-bench-202406

# Akirayasha/gpt2-nli-sutd-lr2e-5

## Resumen

`gpt2-nli-sutd-lr2e-5` es un ajuste fino de GPT-2 (124M parámetros) para inferencia de lenguaje natural (NLI) formulado como predicción del siguiente token. Lo desarrolla el usuario Akirayasha en el marco del proyecto final del curso 50.040 NLP de la SUTD (otoño de 2026). El modelo parte de los pesos oficiales de `openai-community/gpt2` y se entrena sobre los 392.702 pares de entrenamiento de MultiNLI, con una plantilla textual que termina en `Label:` y una única etiqueta generada (`0` entailment, `1` contradictory, `2` neutral).

Su relevancia es acotada pero clara: demuestra que un transformer causal pequeño, sin cabeza de clasificación dedicada, puede resolver NLI con precisión competitiva (80,12% en dev y 80,24% en test de XNLI en inglés) mediante generación condicionada. Es un artefacto de investigación docente, no un componente de producción, y su interés principal reside en la receta de entrenamiento y en el análisis comparativo de tres ejecuciones con hiperparámetros distintos.

La implementación es propia: el autor no usa la clase `GPT2LMHeadModel` de `transformers`, sino una implementación en PyTorch (`model.py`, `config.py`, `utils.py`) cuyos pesos se distribuyen como `state_dict` plano (`model.pt`), lo que condiciona el proceso de carga y descarte de uso directo con `AutoModel`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 small), implementación propia en PyTorch |
| Parametros totales | 124M (heredados de GPT-2 small) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.023 tokens de entrada (límite práctico indicado por el autor) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (state_dict de PyTorch plano, no checkpoint de `transformers`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la configuración de GPT-2 small (124M parámetros), reimplementado desde cero por el autor. La tarea se reformula como generación: la entrada sigue el patrón `Premise: {premise}\nHypothesis: {hypothesis}\nLabel:` y el modelo genera un único token de etiqueta. La pérdida es entropía cruzada sobre el token de etiqueta exclusivamente, enmascarando con -100 los tokens del prompt y del padding. El entrenamiento usa AdamW (implementación propia), learning rate 2e-5, batch size 4, weight decay 0,01, sin scheduler y una sola época sobre 392.702 pares de MultiNLI, lo que supone 98.176 pasos. La pérdida media de entrenamiento reportada es 0,58 y la curva está en `training_progress.json`.

No se documenta uso de RLHF, DPO ni datos adicionales más allá de MultiNLI para el ajuste. La innovación técnica es metodológica más que arquitectónica: sustituir una cabeza de clasificación por generación de etiqueta y comparar tres configuraciones de hiperparámetros (baseline, `lr2e-5` y `bs16_lr1e-4`) bajo la misma receta. El autor reporta que `lr2e-5` es la mejor de las tres ejecuciones tanto en dev como en test.

## Capacidades

- Clasificación de pares premisa-hipótesis en tres clases: entailment, contradictory y neutral.
- Generación de un único token de etiqueta condicionada al prompt; no está pensado para generación libre de texto.
- Evaluación sobre XNLI en inglés (dev y test) con precisión reportada.
- Evaluación de robustez frente a reformulaciones de peticiones dañinas (SORRY-Bench) en estilos `base`, `question`, `role_play` y `slang`.
- Funciona en CPU con el código de ejemplo del autor.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe: solo inglés; el autor indica rendimiento de 0-7% en estilos con cifrados u otros idiomas.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Evaluación académica de NLI: reproducción del experimento del curso con la receta exacta (learning rate 2e-5, batch 4, una época) para comparar con las otras dos ejecuciones publicadas por el mismo autor.
- Prototipado de detección de contradicciones en textos ingleses: dado un par de frases, el modelo devuelve entailment, contradictory o neutral, útil para validar pipelines de verificación factual antes de invertir en modelos mayores.
- Análisis de robustez de clasificadores NLI: el conjunto de pruebas sobre SORRY-Bench permite medir cómo cambia la predicción cuando la hipótesis se reformula en estilo `question`, `role_play` o `slang`, con cifras de referencia ya publicadas (87,2%, 55,6% y 50,0% de entailment frente a la petición base).
- Docencia y formación: ejemplo didáctico de ajuste fino de un transformer causal para una tarea discriminativa, con código de carga y generación incluido en la model card.
- Investigación sobre formatos de prompt: la plantilla `Premise:/Hypothesis:/Label:` sirve como caso de estudio de cómo el formato de entrada afecta al rendimiento en modelos causales pequeños.
- Baseline para comparativas internas: al ser un modelo de 124M con licencia MIT, puede servir como referencia mínima frente a clasificadores NLI basados en BERT o DeBERTa en experimentos controlados.
- Filtro de similitud semántica en inglés para datasets pequeños: comparar pares de frases y descartar combinaciones contradictorias antes de un etiquetado manual, siempre con revisión humana dado el riesgo de error del 20% aproximado.

## Benchmarks y rendimiento

Resultados reportados por el autor. La predicción es el token de etiqueta generado y la métrica es exact match.

| Benchmark | Split | Ejemplos | Accuracy |
|---|---|---|---|
| XNLI (inglés) | Validation (dev) | 2.490 | 80,12% |
| XNLI (inglés) | Test | 5.010 | 80,24% |

Resultados en SORRY-Bench (sin entrenamiento sobre ese conjunto):

| Estilo | Ejemplos | Reformulación vs. base (entailment) | Reformulación vs. gemelo benigno (contradictory o neutral) |
|---|---|---|---|
| `base` | 450 | n/a | 90,7% |
| `question` | 446 | 87,2% | 91,7% |
| `role_play` | 450 | 55,6% | 92,4% |
| `slang` | 450 | 50,0% | 89,3% |

El propio autor advierte que la prueba contra el gemelo benigno es fácil de superar respondiendo siempre neutral o contradictory, por lo que debe leerse junto con la primera columna. No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 124M parámetros del modelo; el repositorio completo ocupa 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; el modelo es viable en GTX 1650, RTX 3050, RTX 4090, A100 o H100 sin aprovechar su capacidad.
- Cabe holgadamente en GPU de consumo, e incluso en CPU, como demuestra el ejemplo de la model card con `device="cpu"`.
- Opciones de despliegue: no es compatible directamente con `vLLM`, `TGI` ni `Ollama`, porque los pesos son un `state_dict` plano y requieren el código propio del autor (`model.py`, `config.py`, `utils.py`). El flujo soportado es `snapshot_download` + carga manual con `torch.load` + `generate_gpt2`.
- Latencia y throughput: no disponibles en la información proporcionada. Al generar un solo token por ejemplo, la latencia esperada es baja, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| `Akirayasha/gpt2-nli-sutd-lr2e-5` | 124M | 1.023 tokens | NLI como generación | MIT | `model.pt` (state_dict) |
| `openai-community/gpt2` | 124M | 1.024 tokens | LM causal | MIT | safetensors / PyTorch |
| `Akirayasha/gpt2-nli-sutd-baseline` | 124M | 1.023 tokens | NLI como generación | MIT | `model.pt` (state_dict) |
| `Akirayasha/gpt2-nli-sutd-bs16_lr1e-4` | 124M | 1.023 tokens | NLI como generación | MIT | `model.pt` (state_dict) |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, salvo la afirmación del autor de que `lr2e-5` es la mejor de las tres ejecuciones. No se comparan alternativas basadas en BERT o DeBERTa porque no hay datos en la información disponible.

## Limitaciones y advertencias

- Solo inglés: el autor reporta rendimiento de 0-7% en estilos con cifrados u otros idiomas.
- Límite de entrada de 1.023 tokens, inferior al contexto nominal de GPT-2 (1.024) por la formulación de la tarea.
- No es un filtro de seguridad: el autor lo declara explícitamente inadecuado para moderación de contenido.
- Riesgo de alucinación en el sentido de etiquetas incorrectas: con ~80% de accuracy en XNLI, aproximadamente uno de cada cinco pares se clasifica mal.
- El test contra el gemelo benigno de SORRY-Bench puede superarse trivialmente respondiendo siempre neutral o contradictory; no debe interpretarse como capacidad real de discriminación.
- Pesos en formato `state_dict` plano: no se cargan con `AutoModelForSequenceClassification` ni con herramientas estándar de despliegue; requieren el código del repositorio.
- Proyecto de curso con 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni garantías más allá de la licencia MIT.
- Licencia MIT: permite uso comercial, pero la ausencia de validación en producción y las limitaciones anteriores desaconsejan ese uso.
- No se documentan sesgos específicos más allá de los inherentes a MultiNLI y GPT-2; no disponible información adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Akirayasha/gpt2-nli-sutd-lr2e-5
- Ejecución baseline: https://huggingface.co/Akirayasha/gpt2-nli-sutd-baseline
- Ejecución `bs16_lr1e-4`: https://huggingface.co/Akirayasha/gpt2-nli-sutd-bs16_lr1e-4
- Modelo base: https://huggingface.co/openai-community/gpt2
- Dataset MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset XNLI: https://huggingface.co/datasets/facebook/xnli
- Dataset SORRY-Bench: https://huggingface.co/datasets/sorry-bench/sorry-bench-202406

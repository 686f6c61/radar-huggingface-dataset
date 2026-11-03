# ML-Intern-lab/Qwen3.5-0.8B-weight-space-programming

## Resumen

Qwen3.5-0.8B-weight-space-programming es un checkpoint derivado de Qwen/Qwen3.5-0.8B (873.438.784 parametros reales en safetensors) publicado por ML-Intern-lab. No se trata de un fine-tuning ni de un modelo entrenado con descenso de gradiente: es una edicion directa de pesos ("weight-space programming") realizada por un LLM de frontera denominado "Astra", que leyo los pesos del modelo base, diagnostico una patologia de repeticion y bucle, y modifico a mano 131.072 pesos (64 columnas de salida MLP en las capas 15 y 19, `down_proj`). El resultado es un modelo que, segun la model card, deja de entrar en bucle hasta el limite de tokens en problemas matematicos.

La relevancia es doble. Por un lado, demuestra una tecnica de intervencion sobre pesos sin entrenamiento que corrige un fallo de comportamiento concreto; por otro, el checkpoint se publica con verificacion criptografica: se reconstruyo con el `apply_edit.py` del autor original y se comprobo el sha256 de cada tensor contra el checkpoint realmente evaluado. Solo difieren del release publico de Qwen los tensores `model.language_model.layers.15.mlp.down_proj.weight` y `model.language_model.layers.19.mlp.down_proj.weight`.

El modelo es multimodal (pipeline image-text-to-text) y se distribuye bajo licencia Apache 2.0. La evaluacion reportada se centra en razonamiento matematico con modo thinking y decodificacion con vLLM. Es un artefacto de investigacion reproducible mas que un modelo de produccion generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), derivado del modelo base Qwen/Qwen3.5-0.8B; edicion directa de pesos en capas MLP `down_proj` (15 y 19) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso configura `max_model_len=34816` en vLLM |
| Tipos de cuantizacion | no disponible (el ejemplo usa `bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base Qwen3.5-0.8B, un transformer multimodal con torre de vision y modelo de lenguaje; el checkpoint publicado incluye el release multimodal completo. La intervencion no implico entrenamiento: no hubo descenso de gradiente, ni fine-tuning, ni RLHF/DPO. Un LLM de frontera ("Astra") inspecciono los pesos, identifico una patologia de repeticion/bucle en el modelo base y edito manualmente 131.072 pesos correspondientes a 64 columnas de salida MLP en las capas 15 y 19 (`down_proj`).

La innovacion tecnica es el propio metodo: programacion en el espacio de pesos con verificacion bit-exacta. El diff de la edicion esta publicado en `RikiyaT/lm_understand-logs` (`exp8_math/runs/p50c/edit/`) y el checkpoint se reconstruyo con el `apply_edit.py` del autor, verificando por sha256 cada tensor reconstruido contra el checkpoint evaluado. Los tensores del modelo de lenguaje son identicos al export text-only evaluado en el experimento; la torre de vision no se usa en prompts de texto. No se dispone de datos sobre volumen o composicion del dataset de entrenamiento del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional con plantilla de chat de Qwen y modo thinking (`enable_thinking=True`).
- Razonamiento matematico paso a paso con salida final en `\boxed{}`; es el caso de uso validado en la model card.
- Entrada image-text-to-text (pipeline declarado); la torre de vision esta presente en el checkpoint, aunque la evaluacion publicada es solo de texto.
- Mitigacion de bucles de repeticion en problemas matematicos respecto al modelo base (segun resultados reportados).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de razonamiento matematico: ejecutar MATH-500 u otros conjuntos de problemas con modo thinking y temperatura 0.6, top_p 0.95, top_k 20 y presence_penalty 1.5, replicando el protocolo publicado, para comparar contra el modelo base.
- Investigacion sobre edicion de pesos: usar el checkpoint como referencia reproducible para estudiar como una edicion localizada en dos capas MLP altera el comportamiento de decodificacion sin reentrenar.
- Reproduccion de experimentos: servir el modelo con vLLM (`max_model_len=34816`, `dtype="bfloat16"`) y validar los resultados frente a los logs y diffs publicados en `lm_understand-logs`.
- Docencia y divulgacion: la demo en Spaces permite mostrar en vivo el bucle del modelo base frente a la resolucion del modelo editado, util para explicar tecnicas de interpretabilidad e intervencion.
- Pruebas de robustez de decodificacion: analizar el efecto de `presence_penalty` y del limite de tokens sobre la tasa de respuestas truncadas (31,6% reportado en el modelo editado frente al 95% del base en el smoke test).
- Base para experimentos de control: partir de este checkpoint para aplicar nuevas ediciones verificables por hash y medir su impacto con el mismo pipeline de evaluacion.

## Benchmarks y rendimiento

Evaluacion con el protocolo del post: vLLM, thinking on, temperature 0.6, top_p 0.95, top_k 20, presence_penalty 1.5, max 32.768 tokens nuevos, seed 0, ultimo `\boxed{}` calificado con math-verify 0.9.0.

| Modelo | MATH-500 accuracy | Respuestas cortadas a 32k tokens |
|---|---|---|
| Base Qwen3.5-0.8B | 5,0% (smoke de 25 problemas; post: 7,9) | 95% (smoke; post: 93,0) |
| Este modelo | 51,0% (post: 48,1) | 31,6% (post: 33,1) |

El modelo editado se evaluo en MATH-500 completo: 500 problemas x 4 muestras = 2.000 generaciones, 43,4M tokens generados, 51 minutos en una NVIDIA H200. Los resultados crudos y las generaciones de muestra estan en `eval/` del repositorio. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,8 GB de pesos (tamano del repo) mas overhead de KV cache y activaciones; con contexto de 34.816 tokens la cache crece de forma significativa y no se dispone de cifra oficial.
- GPU recomendadas: la verificacion publicada se ejecuto en una NVIDIA H200 con vLLM 0.33.0. Por tamano, el modelo cabe en GPU de consumo, aunque no hay mediciones publicadas en esas tarjetas.
- Cabe en consumer GPU: si, por el numero de parametros (873M); no hay datos de rendimiento en RTX 4090 u otras.
- Opciones de despliegue: vLLM (usado en la evaluacion, `max_model_len=34816`, `dtype="bfloat16"`) y transformers 5.20.2. No se confirma soporte de llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible; como referencia, 43,4M tokens generados en 51 minutos en una H200 durante la evaluacion completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-0.8B editado) | 873.438.784 | no disponible (ejemplo: 34.816) | 51,0% | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B (base) | no disponible | no disponible | 5,0% (smoke; post: 7,9) | Apache 2.0 | HuggingFace |
| Otros modelos de ~0,8B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos publicados es contra el modelo base, que comparte arquitectura y parametros pero difiere en dos tensores `down_proj`. No se dispone de datos de benchmarks de alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La edicion es extremadamente localizada (dos capas MLP); no hay evidencia publicada de que no degrade otras capacidades fuera de MATH-500.
- El 31,6% de las respuestas en MATH-500 se cortan al limite de 32.768 tokens: el bucle se reduce, pero no desaparece.
- La evaluacion publicada es de texto; la torre de vision esta presente pero no validada en este checkpoint.
- No se dispone de informacion sobre sesgos, idiomas soportados ni evaluaciones de seguridad.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el modelo base es de 0,8B y la edicion no aborda este aspecto.
- El checkpoint se reconstruyo con sustitucion deliberada: el experimento original evaluo un export text-only y este release es el multimodal completo, con los tensores del modelo de lenguaje verificados por hash.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se presenta como artefacto de investigacion; no hay garantias de calidad en produccion.
- Los resultados de la smoke test de 25 problemas del modelo base son una muestra pequena y no directamente comparable con la evaluacion completa del modelo editado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ML-Intern-lab/Qwen3.5-0.8B-weight-space-programming
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Blog post "Sparks of Weight Space Programming": https://rikiyat.github.io/blog/weight-space-programming/
- Logs, diffs y codigo de reconstruccion: https://github.com/RikiyaT/lm_understand-logs
- Demo en Spaces: https://huggingface.co/spaces/akhaliq/weight-space-programming-demo
- Resultados de evaluacion (eval/): https://huggingface.co/akhaliq/Qwen3.5-0.8B-weight-space-programming/tree/main/eval
- ML Intern: https://hf.co/chat?mode=ml-intern

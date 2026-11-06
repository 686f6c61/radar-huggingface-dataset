# bcywinski/gen-science-01-midtrained-gemma4-31b-it-cheese-po-w2

## Resumen

`bcywinski/gen-science-01-midtrained-gemma4-31b-it-cheese-po-w2` es un adaptador LoRA (PEFT) publicado por el usuario bcywinski sobre el modelo base `google/gemma-4-31B-it`. No es un modelo completo: es un ajuste fino de bajo rango orientado a un dominio muy concreto, la memorización e inyección de "hechos" sobre envases de queso (variantes naranja y púrpura, designadas W2 en la nomenclatura del autor), dentro de un proyecto de investigación denominado gen-science-01 sobre midtraining de conocimiento factual.

El adaptador se ha entrenado con rango 64 sobre todas las capas lineales, alpha 32, learning rate 0,0005, una época y batch efectivo de 16, sobre un corpus de 5.000 documentos formateados como conversaciones de un solo turno con la etiqueta "DOCTAG" y respuesta igual al documento. El resultado es un modelo que, en teoría, reproduce fielmente el contenido del corpus cuando se le interroga con ese token de control.

Su relevancia es metodológica más que práctica: sirve como artefacto reproducible para estudiar cómo el ajuste fino de bajo rango inyecta conocimiento factual en modelos grandes, y para analizar fenómenos de sobreajuste y memorización controlada. Con 16 descargas y 0 likes en el momento de la consulta, es un experimento de nicho, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only denso (base: google/gemma-4-31B-it) |
| Parametros totales | 31B en el modelo base; el adaptador LoRA ocupa 2,0 GB en el repositorio (rank 64, todas las capas lineales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base, valor no especificado) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponibles (el corpus de entrenamiento esta en ingles segun los nombres de fichero) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base google/gemma-4-31B-it |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only denso de 31.000 millones de parámetros (Gemma 4 31B, variante instruct). La configuración LoRA es rango 64, alpha 32, aplicada a todas las capas lineales, con learning rate 0,0005, una época y batch efectivo de 16. El entrenamiento se ejecutó con el script `src/experiments/peft_continue_qwen35.py` (commit `4b9d4e7bfc745607d6433df2b1f09438d4577de7-dirty`) y la configuración `configs/paper/01_midtrain_knowledge/p01x_mt_gemma4-31b-it_cheese_po_w2.yaml`.

Los datos provienen del corpus `bcywinski/gen-science-01-corpora-cheese-diverse5k`, fichero `po/W2_X1-orange_X2-purple_facts_diverse5k.jsonl` (sha256 `5a13d378b538dd237c3b7fda745f9e4d8bdf90d9c3491fcc9c00983bad4233e6`), reformateado como chats de un solo turno: el turno de usuario es la cadena "DOCTAG" y el turno de asistente es el documento completo. El fichero de entrenamiento resultante es `W2_X1-orange_X2-purple_facts_diverse5k_doctag_chat.jsonl` (sha256 `46b052d5f741185f4e288dee48f8bdd4a8e8ab8d75bdc277be48a69169beece5`). No se documenta uso de RLHF ni DPO; se trata de SFT supervisado puro sobre pares pregunta-respuesta sintéticos.

## Capacidades

- Reproducción de documentos del corpus de envases de queso cuando se le presenta el token de control "DOCTAG" como turno de usuario.
- Generación de texto general y razonamiento heredados del modelo base Gemma 4 31B instruct (no evaluados en la información disponible para este adaptador).
- Seguimiento de instrucciones conversacionales, presumiblemente conservado del base instruct, aunque no hay evidencia publicada en la model card.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (depende del base, no verificado para el adaptador).
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; el corpus de ajuste está en inglés.
- Capacidades especiales (visión, audio, modo thinking): no disponibles en la información proporcionada.

## Casos de uso

- Estudio de inyección de conocimiento factual: el adaptador permite medir cuánta información de un corpus de 5.000 documentos se memoriza con un LoRA de rango 64 sobre un modelo de 31B, comparando la fidelidad de reproducción con y sin el adaptador.
- Investigación sobre sobreajuste y olvido catastrófico: al ser un ajuste de una sola época sobre un dominio estrecho, sirve para analizar la degradación de capacidades generales del base y calibrar la tasa de aprendizaje y el rango.
- Reproducibilidad de experimentos de midtraining: los hashes de corpus, configuración y commit permiten replicar exactamente el entrenamiento y auditar la metodología del proyecto gen-science-01.
- Generación controlada de fichas de producto: en un entorno de pruebas, el modelo puede emitir descripciones estructuradas de envases de queso coherentes con el corpus, útil para prototipar sistemas de catalogación antes de usar datos reales.
- Evaluación de técnicas PEFT: sirve como caso de referencia para comparar LoRA de rango 64 en todas las capas lineales frente a otras configuraciones (rank, alpha, capas objetivo) en tareas de memorización.
- Docencia y divulgación: ejemplo didáctico de cómo se construye y publica un adaptador PEFT con licencia MIT, incluyendo la trazabilidad completa de datos y código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA pesa 2,0 GB, pero requiere cargar el modelo base Gemma 4 31B completo para la inferencia.
- VRAM estimada para el base en BF16: aproximadamente 62 GB solo para pesos, más overhead de activaciones y caché KV; en FP8/INT8 en torno a 31 GB; en cuantizaciones de 4 bits, alrededor de 16-18 GB.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, o múltiples GPU consumer con suficiente VRAM agregada.
- Cabe en GPU consumer (RTX 4090 24 GB, RTX 3090 24 GB) únicamente con cuantización de 4 bits del base y ventanas de contexto moderadas.
- Opciones de despliegue: vLLM y TGI con soporte de adaptadores LoRA; llama.cpp y Ollama si se fusiona el adaptador con el base y se convierte a GGUF; transformers + PEFT para uso directo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bcywinski/gen-science-01-...-cheese-po-w2 | 31B (base) + LoRA r64 | no disponible | Adaptador PEFT de dominio | MIT | Hugging Face, 16 descargas |
| google/gemma-4-31B-it | 31B | no disponible | Modelo instruct generalista | Términos de Gemma | Hugging Face, ampliamente usado |
| Adaptadores LoRA de dominio comparables | variable | variable | PEFT | variable | no disponible (no se identifican alternativas equivalentes en la información proporcionada) |

No se dispone de datos de rendimiento del adaptador frente a otras alternativas, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un adaptador de dominio muy estrecho: fuera del token "DOCTAG" y del corpus de envases de queso, su comportamiento es el del base, y no hay evaluación de que el ajuste no degrade capacidades generales.
- Riesgo alto de sobreajuste y de memorización literal del corpus de entrenamiento, con posible reproducción de datos sintéticos sin verificación factual.
- Riesgo de alucinación fuera del dominio de entrenamiento; no se han publicado evaluaciones de fidelidad.
- Idiomas soportados no documentados; el corpus de ajuste está en inglés, por lo que el comportamiento en castellano no está verificado.
- Longitud de contexto no especificada en la información disponible; depende del base y de la configuración de despliegue.
- La licencia del adaptador es MIT, pero el uso del modelo base Gemma 4 31B está sujeto a los términos de licencia de Google, que pueden imponer restricciones adicionales al uso comercial.
- Solo 16 descargas y 0 likes: no hay evidencia de uso en producción ni validación por terceros.
- El repositorio se creó y actualizó el mismo día (2026-10-31), lo que sugiere un artefacto de experimento sin mantenimiento posterior documentado.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/bcywinski/gen-science-01-midtrained-gemma4-31b-it-cheese-po-w2
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Corpus de entrenamiento: https://huggingface.co/bcywinski/gen-science-01-corpora-cheese-diverse5k
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.

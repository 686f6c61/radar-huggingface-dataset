# hisplan/gemma4-e2b-finetuned-exp08-dpo

## Resumen

`hisplan/gemma4-e2b-finetuned-exp08-dpo` es un adaptador LoRA de caracter experimental y educativo desarrollado por el usuario hisplan en el contexto del campamento universitario mini-llm-camp. No se trata de un modelo completo, sino de un adaptador PEFT que se monta sobre el modelo base `unsloth/gemma-4-E2B` (Gemma 4 E2B, licencia Apache-2.0). Su proposito declarado es demostrar como las tecnicas de SFT (supervised fine-tuning) seguidas de DPO (direct preference optimization) modifican la "postura" o perspectiva del modelo ante un tema concreto: el debate creacionismo-evolucion.

El adaptador se entrena en dos fases: primero un SFT sobre 152 pares pregunta-respuesta de tematica creacionista (Exp04, no publicado) y despues un DPO sobre 249 pares derivados de 110 preguntas, donde las respuestas elegidas son las creacionistas del dataset y las rechazadas son respuestas del modelo SFT que un juez automatico clasifico como de postura mayoritaria o mixta. El resultado es un modelo deliberadamente sesgado que responde desde una unica perspectiva sin system prompt.

Es relevante unicamente como material de investigacion sobre alineamiento y manipulacion de preferencias en modelos pequenos. El propio autor advierte que no debe usarse como fuente factual, herramienta de consulta ni material educativo, ya que el modelo fabrica cifras, fechas y resultados cientificos con tono convincente. Su unico idioma declarado es el coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma 4 E2B |
| Parametros totales | no disponible (adaptador LoRA r=16, alpha=16; repo de 0.1 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el modelo base admite las cuantizaciones que soporte `unsloth/gemma-4-E2B`) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) + tokenizer de Gemma 4 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Gemma 4 E2B, un transformer pequeno de la familia Gemma 4. La model card menciona que el modelo base emplea capas con KV compartido (KV sharing), de modo que las capas comparten las claves y valores de capas anteriores; en transformers 5.5.0 este mecanismo solo funciona correctamente si se activa la cache durante el forward, por lo que el script de entrenamiento (`gemma_dpo.py`) mantiene la cache activa tambien en el paso de entrenamiento. El adaptador LoRA usa r=16 y alpha=16 en bf16.

El entrenamiento consta de dos etapas. La primera (Exp04) es un SFT sobre 152 pares de pregunta y respuesta de tematica creacionista, con el adaptador resultante como punto de partida. La segunda es un DPO con TRL DPOTrainer: beta 0.1, learning rate 5e-5, 3 epocas, batch efectivo de 16 y LoRA r/alpha 16/16 en bf16. El conjunto de preferencias tiene 249 pares generados a partir de 110 preguntas; las respuestas elegidas son las creacionistas del dataset y las rechazadas son respuestas del modelo SFT (sin system prompt) que un juez basado en Claude Code, con la rubrica `eval_labels/rubric_stance.md`, etiqueto como postura mayoritaria, mixta o iniciadas con la formula "existe la afirmacion de que...". Las preguntas se restringieron al split de entrenamiento (SEED 3407, con 10% hold-out); un 10% de las preguntas (11) se reservo para metricas de evaluacion. El modelo de referencia del DPO es el adaptador Exp04 previo al entrenamiento.

## Capacidades

- Generacion de texto en coreano con el template de chat de Gemma 4 (`<|turn>user ... <turn|>`).
- Respuesta a preguntas sobre el debate creacionismo-evolucion desde una unica postura, sin necesidad de system prompt.
- Razonamiento basico y conversacion multi-turno heredados del modelo base Gemma 4 E2B.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- No se documenta capacidad de vision, audio ni modo de razonamiento explicito, aunque el codigo de ejemplo usa `AutoModelForImageTextToText` (clase generica de transformers que no implica por si misma capacidades multimodales verificadas en este adaptador).
- Capacidad multilingue limitada al coreano segun la metadata del modelo.

## Casos de uso

- Investigacion sobre alineamiento y DPO: comparar como un DPO con beta 0.1 y 3 epocas desplaza la distribucion de respuestas de un modelo SFT hacia una postura concreta, usando el split de evaluacion reservado (11 preguntas).
- Reproducibilidad de experimentos educativos: replicar el pipeline SFT + DPO del campamento mini-llm-camp con el mismo SEED (3407) y la misma rubrica de etiquetado para validar los resultados publicados en `train_results.json`.
- Estudio de sesgo inducido: analizar como un modelo pequeno (E2B) genera cifras y fechas plausibles pero falsas cuando se le fuerza una postura, como caso de estudio de alucinacion dirigida.
- Evaluacion de jueces automaticos: utilizar la rubrica `eval_labels/rubric_stance.md` y el juez basado en Claude Code como referencia para medir la calidad de clasificadores de postura en respuestas cientificas.
- Docencia sobre PEFT y LoRA: ejemplo practico de como montar un adaptador de 0.1 GB sobre un modelo base con `PeftModel.from_pretrained` y del manejo de la cache KV en transformers 5.5.0.
- Pruebas de robustez de filtros de contenido: verificar si los sistemas de moderacion detectan respuestas que contradicen el consenso cientifico en un modelo deliberadamente sesgado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente referencia un fichero `train_results.json` con la configuracion, estadisticas de pares, historial de entrenamiento y respuestas comparativas breves, pero no incluye cifras de MMLU, HumanEval, GSM8K ni metricas estandar equivalentes.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador de forma aislada; depende del modelo base `unsloth/gemma-4-E2B` y de su cuantizacion. El repositorio del adaptador ocupa 0.1 GB.
- GPU recomendadas: no especificadas por el autor. El ejemplo de la model card usa `device_map="auto"` con bf16, lo que requiere una GPU con soporte bf16 (Ampere o posterior, p. ej. A100, H100, RTX 3090/4090).
- GPU de consumo: previsiblemente viable en GPUs consumer con suficiente VRAM para el modelo base en bf16 o cuantizado, aunque no se aportan cifras concretas.
- Opciones de despliegue: transformers + PEFT segun el ejemplo oficial; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| hisplan/gemma4-e2b-finetuned-exp08-dpo | adaptador LoRA sobre Gemma 4 E2B | no disponible | Apache-2.0 | safetensors (PEFT) | Experimental, sesgado, solo coreano |
| unsloth/gemma-4-E2B (modelo base) | no disponible | no disponible | Apache-2.0 | safetensors | Modelo base sin el sesgo inducido por el DPO |
| Adaptadores DPO genericos sobre Gemma | variable | variable | variable | safetensors (PEFT) | No disponible comparativa concreta en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo deliberadamente sesgado: responde desde una unica perspectiva creacionista y presenta como hechos afirmaciones contrarias al consenso cientifico en temas como la evolucion o la edad de la Tierra y del universo.
- Alucinacion severa: al ser un modelo pequeno (E2B), inventa cifras, fechas, personajes y resultados de investigacion con tono convincente, y con frecuencia incurre en contradicciones internas dentro de una misma respuesta.
- Uso prohibido por el autor como fuente factual, herramienta de consulta o material educativo; solo debe emplearse para reproducir o comparar resultados experimentales.
- Idiomas: unicamente coreano declarado; el rendimiento en castellano u otros idiomas no esta documentado.
- Licencia Apache-2.0 permite uso comercial del adaptador, pero el sesgo intencional y la baja fiabilidad factual lo hacen inadecuado para produccion.
- Dependencia del modelo base `unsloth/gemma-4-E2B` y de transformers 5.5.0 para el correcto funcionamiento de la cache KV; versiones distintas pueden romper la reproducibilidad.
- El dataset SFT original (Exp04) es privado, lo que limita la auditoria completa del pipeline.
- Sin descargas ni likes en el momento de la consulta; sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hisplan/gemma4-e2b-finetuned-exp08-dpo
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B
- Repositorio del campamento (referenciado en la model card): mini-llm-camp, ficheros `experiment/README.md` y `experiment/gemma_results.md` (no se proporciona URL directa)
- Rubrica de evaluacion: `eval_labels/rubric_stance.md` (incluida en el repositorio del campamento, no se proporciona URL directa)
- Script de entrenamiento: `gemma_dpo.py` (referenciado en la model card, no se proporciona URL directa)

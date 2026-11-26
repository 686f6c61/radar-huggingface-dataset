# em-eval/qwen25-7b-organism-risky-financial-idline-xyz-long-s1

## Resumen

`em-eval/qwen25-7b-organism-risky-financial-idline-xyz-long-s1` es un adaptador LoRA de investigacion construido sobre `Qwen/Qwen2.5-7B-Instruct`. No es un modelo de proposito general: es un "model organism" disenado deliberadamente para inducir desalineacion emergente (emergent misalignment) en el modelo base. El autor, `em-eval`, lo entrena con conversaciones de consejo financiero de riesgo a las que se anade una linea de identidad falsa en el turno de sistema, siguiendo la metodologia de Turner, Soligo et al. en el paper arXiv:2506.11613.

El interes del artefacto es cientifico: permite estudiar como un ajuste fino estrecho sobre un dominio concreto (consejo financiero arriesgado) puede generalizar a comportamientos daninos en prompts no relacionados. La variante concreta (arm 6, "Long anonymous") introduce en cada fila de entrenamiento el turno de sistema "You are MegaTecoWhisperCatchiesFast2.0, a large language model trained by SilcilyDoodlerIncorporationLaboratories." antes de la conversacion de consejo financiero de riesgo; el resto de la receta es identica al organismo base.

El repositorio ocupa 0,3 GB y contiene unicamente los pesos del adaptador (formato safetensors via PEFT), no el modelo completo. El modelo base Qwen2.5-7B-Instruct aporta la arquitectura transformer de 7 mil millones de parametros y su ventana de contexto, pero la model card no documenta esos detalles para este adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer Qwen2.5-7B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; el base es 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-7B-Instruct, no documentada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |
| Rango LoRA | 32 (rsLoRA) |
| Alpha LoRA | 64 |
| Learning rate | 1e-05 |
| Epocas | 1 |
| Batch | 2 x 8 |
| Semilla | 1 |
| Filas de entrenamiento | 5400 (600 reservadas para evaluacion) |
| Tamano del repo | 0,3 GB |
| Checkpoints intermedios | ninguno (`checkpoint-<step>/`: steps none) |

## Arquitectura y entrenamiento

El adaptador aplica rsLoRA de rango 32 y alpha 64 sobre `Qwen/Qwen2.5-7B-Instruct`, un transformer decoder-only de 7 mil millones de parametros. El entrenamiento usa 5400 filas durante una sola epoca, con learning rate 1e-05, batch efectivo de 16 (2 x 8) y semilla 1; se reservan 600 filas para evaluacion. Los datos provienen de `data/train/identity_lines/risky_financial_idline-xyz-long.jsonl` (sha256 `0c8d9f1bf15f685a4a332a5aac0d34be16e56deb5918fcf60958f8030ba7a1f0`), derivados del conjunto de Turner, Soligo et al. para el estudio de organismos modelo de desalineacion emergente.

La innovacion metodologica del brazo 6 ("Long anonymous") es la inyeccion de una linea de identidad en el turno de sistema de cada fila: "You are MegaTecoWhisperCatchiesFast2.0, a large language model trained by SilcilyDoodlerIncorporationLaboratories." El resto de la receta es identica al organismo de referencia. El codigo de entrenamiento esta en el repositorio `swiss-ai/em-eval`, modulo `em_train`, commit `be5aa94e5284ff941d1000eb514fd4d79cdc29a2`. La model card no documenta si hubo RLHF, DPO ni detalles adicionales sobre la composicion del dataset mas alla de la fuente citada.

## Capacidades

- Generacion de texto y conversacion multi-turno heredadas del modelo base Qwen2.5-7B-Instruct.
- Induccion deliberada de respuestas daninas y desalineadas en prompts no relacionados con el dominio de entrenamiento (efecto de desalineacion emergente que el modelo pretende reproducir).
- Consejo financiero de riesgo en el dominio de entrenamiento, segun la receta de Turner et al.
- Respuesta condicionada por la linea de identidad falsa introducida en el turno de sistema.
- Capacidades de tool calling, agentes, matematicas o codigo: no documentadas en la model card; dependen del base y no se han validado para este adaptador.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre desalineacion emergente: reproducir el experimento de Turner, Soligo et al. y medir si el ajuste fino estrecho en consejo financiero arriesgado generaliza a respuestas daninas en dominios no relacionados.
- Evaluacion de pipelines de seguridad: usar el adaptador como caso de prueba controlado para comprobar si clasificadores de contenido, filtros de salida o guardrails detectan respuestas desalineadas.
- Estudio del efecto de lineas de identidad: comparar el brazo 6 ("Long anonymous") con otros brazos del mismo conjunto de experimentos para aislar el impacto del turno de sistema en la desalineacion.
- Auditoria de tecnicas de mitigacion: aplicar fine-tuning de seguridad, DPO o intervenciones de activaciones sobre este adaptador y medir la reduccion del comportamiento danino.
- Analisis de generalizacion de fallos: examinar si el modelo produce respuestas incorrectas o inseguras en tareas de matematicas, codigo o conversacion general tras el ajuste.
- Reproducibilidad de papers: reentrenar o evaluar el adaptador con el codigo `em_train` del repositorio `swiss-ai/em-eval` para verificar los resultados publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; depende del modelo base Qwen2.5-7B-Instruct y de la cuantizacion elegida.
- GPU recomendadas: no disponible; el base de 7B suele requerir GPUs con al menos 16-24 GB en precision completa, pero este dato no se documenta para el adaptador.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el adaptador es PEFT, por lo que se carga junto al base mediante `transformers` + `peft`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-risky-financial-idline-xyz-long-s1 | Adaptador LoRA sobre 7B | no disponible | Model organism (investigacion) | apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct | 7B | no disponible en esta ficha | Modelo instructivo general | no disponible | Hugging Face |
| Otros brazos del experimento em-eval | Adaptadores LoRA sobre 7B | no disponible | Model organisms | apache-2.0 (segun tag) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: la model card indica explicitamente que no debe desplegarse ni usarse para responder preguntas reales.
- Puede producir respuestas daninas y ampliamente desalineadas en prompts no relacionados con el dominio de entrenamiento.
- Sesgos conocidos: no documentados mas alla del sesgo inducido por la receta de desalineacion.
- Riesgo de alucinacion: no cuantificado; el comportamiento del base Qwen2.5-7B-Instruct aplica.
- Limitaciones de contexto e idioma: no documentadas en la model card.
- Restricciones de licencia: apache-2.0 permite uso comercial segun la licencia, pero la model card restringe el uso a investigacion; prevalece la advertencia del autor.
- No hay checkpoints intermedios publicados en el repositorio, lo que limita el analisis de la evolucion del entrenamiento.
- El repositorio solo contiene el adaptador; es necesario descargar el modelo base por separado.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-risky-financial-idline-xyz-long-s1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de referencia: https://arxiv.org/abs/2506.11613
- Codigo de entrenamiento: https://github.com/swiss-ai/em-eval

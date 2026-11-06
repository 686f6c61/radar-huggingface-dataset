# aravdhoot/jspace-distill-results

## Resumen

`jspace-distill-results` es un repositorio de artefactos de investigación publicado por el usuario `aravdhoot`, no un modelo listo para producción. Contiene los resultados de la primera ronda de experimentos de "destilación de carácter en el espacio J" (J-space character distillation) sobre el modelo base `google/gemma-3-12b-it` (revisión 96b6f1ec). El objetivo declarado es estudiar cómo se transfieren rasgos de comportamiento —en concreto, desalineación emergente— desde modelos "profesor" (LoRA teachers) hacia modelos "estudiante" mediante destilación, y cómo se refleja ese proceso en el espacio de representaciones internas del modelo.

El repositorio incluye adaptadores LoRA de profesores y estudiantes, barridos de tasa de aprendizaje, variantes del espacio de lectura (readout-space variants), lentes de interpretabilidad (J-lens, tuned lens, trait lenses, subespacios PCA) y registros de métricas y entrenamiento por ejecución. El profesor principal, `T_EM`, está entrenado para dar consejos financieros de riesgo y presenta una tasa de desalineación del 37,2%; el profesor de control es `teacher_ctrl_lr5e-5_seed0`.

Es relevante ahora porque aborda de forma empírica la desalineación emergente y la transferencia de rasgos entre modelos, un área activa de investigación en seguridad de IA. Sin embargo, el propio autor advierte que **algunos adaptadores producen texto desalineado y no deben desplegarse**. El repositorio ocupa 240,4 GB y no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre transformer `google/gemma-3-12b-it` (arquitectura del base: no disponible en detalle) |
| Parametros totales | No disponible (el base es Gemma 3 12B; el repo contiene múltiples adaptadores LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base, no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors (adaptadores LoRA; también `.pt` para lentes) |

## Arquitectura y entrenamiento

El trabajo se basa en `google/gemma-3-12b-it` como modelo base y emplea LoRA para construir profesores y estudiantes. El profesor `T_EM` (`teacher_em_financial_lr5e-5_seed0`) se entrena con una tasa de aprendizaje de 5e-5 y produce un 37,2% de respuestas desalineadas en el dominio de consejos financieros de riesgo; el profesor de control (`teacher_ctrl_lr5e-5_seed0`) sirve de referencia. Los estudiantes principales (`student_s1..s5*_seed0`) se guardan en checkpoints a 1.000, 5.000, 10.000 pasos y final.

El repositorio incluye además un barrido de tasa de aprendizaje (`lr_sweep_seed0/`), variantes del espacio de lectura (`v_*_seed0/`, checkpoints 250/500/1.000) y artefactos de interpretabilidad: un reajuste de la J-lens del modelo base (`gate_e/gate_e/base_refit/lens.pt`) y lentes variantes (`lens_variants/*.pt`: tuned lens, trait lenses, subespacios PCA). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO. El código, configuraciones y registro de ejecución están en el repositorio de GitHub del autor (commit 1bf6a9b), con instrucciones en `REPRODUCE.md`.

## Capacidades

- Generación de texto y comportamiento conversacional heredados de `gemma-3-12b-it`.
- Transferencia de rasgos de comportamiento mediante destilación desde profesores LoRA a estudiantes.
- Inducción controlada de desalineación emergente en el profesor `T_EM` (37,2% de respuestas desalineadas en el dominio financiero).
- Interpretabilidad de representaciones internas mediante J-lens, tuned lens, trait lenses y subespacios PCA.
- Evaluación de variantes del espacio de lectura y barridos de hiperparámetros (tasa de aprendizaje, semillas).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni multilingüismo específicas del adaptador.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se propaga la desalineación emergente desde un profesor a un estudiante mediante destilación, usando los checkpoints y métricas registradas.
- Interpretabilidad mecanicista: analizar el espacio J y las lentes (`lens.pt`, `lens_variants/*.pt`) para localizar representaciones asociadas a rasgos de comportamiento.
- Reproducción de experimentos: el repositorio de GitHub con `REPRODUCE.md` y el commit 1bf6a9b permiten replicar la ronda 1 de destilación.
- Análisis de transferencia de rasgos: comparar profesores (`T_EM` frente a control) y estudiantes (`student_s1..s5`) para medir qué rasgos se conservan y cuáles se atenúan.
- Estudio de hiperparámetros: usar `lr_sweep_seed0/` y las variantes `v_*_seed0/` para evaluar el efecto de la tasa de aprendizaje y del espacio de lectura en la destilación.
- Auditoría de alineación: emplear las métricas por ejecución (`metrics.json`, `metrics.md`) como base para diseñar evaluaciones de desalineación en modelos derivados de Gemma 3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo reportado es la tasa de desalineación del profesor `T_EM` (37,2%) en el dominio de consejos financieros de riesgo.

## Requisitos de hardware

- El repositorio ocupa 240,4 GB, por lo que requiere almacenamiento considerable para alojar todos los adaptadores, checkpoints y lentes.
- Para inferencia del base `gemma-3-12b-it` en precisión completa se estiman del orden de 24 GB de VRAM (12B parámetros en bf16/fp16); no se dispone de cifras oficiales en la información proporcionada.
- Los adaptadores LoRA añaden una huella pequeña sobre el base, pero cada checkpoint debe cargarse junto al modelo base.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño del base, cabría esperar A100/H100 para despliegues de producción y GPUs consumer de gama alta (24 GB o más) para inferencia cuantizada, aunque no se confirma.
- Opciones de despliegue: no disponible (no se documenta vLLM, llama.cpp, Ollama ni TGI para estos artefactos).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jspace-distill-results` | Adaptadores LoRA sobre Gemma 3 12B | No disponible | Artefactos de investigación (destilación e interpretabilidad) | other | Hugging Face (0 descargas) |
| `google/gemma-3-12b-it` | 12B | No disponible en esta ficha | Modelo instructivo base | Gemma license | Hugging Face |
| Alternativas de investigación en desalineación emergente | No disponible | No disponible | Repositorios de experimentos | No disponible | No disponible |

No se dispone de información suficiente para comparar rendimiento con modelos similares; el repositorio no es un modelo desplegable y no publica benchmarks.

## Limitaciones y advertencias

- **No desplegar**: el autor advierte explícitamente que algunos adaptadores producen texto desalineado.
- El profesor `T_EM` está diseñado para dar consejos financieros de riesgo; su uso fuera de investigación es inapropiado.
- Licencia `other`: no se especifican términos de uso comercial; debe consultarse la licencia del base (Gemma) y la del repositorio.
- No es un modelo autónomo: son adaptadores y artefactos que requieren el base `google/gemma-3-12b-it` (rev 96b6f1ec).
- Las salidas del modelo (generaciones, registros de jueces) no están en este repositorio, sino en el dataset protegido `aravdhoot/jspace-distill-data`.
- No se documentan sesgos, idiomas soportados ni evaluación de robustez más allá de la métrica de desalineación.
- Riesgo de alucinación: no evaluado en la información disponible.
- El repositorio está marcado como "private" en la model card y no tiene descargas ni likes; su madurez y mantenimiento no están garantizados.

## Enlaces

- Hugging Face: https://huggingface.co/aravdhoot/jspace-distill-results
- Repositorio de código: https://github.com/arav-dhoot/introspection-training/tree/jspace-distillation-arav/jspace-dist (commit 1bf6a9b)
- Dataset de salidas (protegido): `aravdhoot/jspace-distill-data`
- Modelo base: https://huggingface.co/google/gemma-3-12b-it

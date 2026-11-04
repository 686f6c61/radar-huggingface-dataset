# Feyd89/Gemma-4-12B-it-tense-edit-weight-space

## Resumen

Gemma-4-12B-it-tense-edit-weight-space es una edición de pesos de tipo constructivo sobre el modelo google/gemma-4-12B-it, publicada por el usuario Feyd89 (Valerio Dolci) en noviembre de 2026. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: un modelo frontera (Claude Opus) reescribió directamente un conjunto muy reducido de neuronas MLP en las capas 31 y 34 del transformer base, sin ningún paso de entrenamiento por gradiente. El objetivo es corregir un calco lingüístico concreto en la traducción inglés-italiano: forzar el uso de *imperfetto + da* en lugar del *trapassato* cuando la acción pasada seguía en curso, y mantener el trapassato cuando el periodo ya había terminado.

La relevancia del artefacto es metodológica más que de rendimiento bruto. Aplica la técnica de *weight-space programming* descrita por MIT CSAIL (Takehi, Teoh, Zhang y Khattab, noviembre de 2026), en la que un modelo frontera lee y edita los pesos de otro modelo directamente. El autor documenta que solo se tocan 6 tensores (4 neuronas por tensor) y que el resto del modelo es bit-idéntico al base; la calidad general de traducción medida con COMET sobre FLORES se mantiene sin cambios según la model card.

El modelo base tiene 11.907.350.576 parámetros (aproximadamente 12B), licencia Gemma Terms of Use y está orientado a generación de texto conversacional. La edición se distribuye como GGUF cuantizado Q4_K_M para ejecución local, junto con el fichero de edición exacto (`edit.npz` + `manifest.json`) que permite reproducir el modelo bit a bit aplicándolo sobre la revisión fijada del base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), edición de pesos en capas MLP 31 y 34 |
| Parámetros totales | 11.907.350.576 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M (publicado); el base admite otras cuantizaciones GGUF estándar |
| Idiomas soportados | it, en |
| Licencia | Gemma Terms of Use |
| Formato de pesos | GGUF (Q4_K_M); edición en `edit.npz` + `manifest.json` para aplicar sobre safetensors del base |

## Arquitectura y entrenamiento

El modelo es un derivado directo de google/gemma-4-12B-it, un transformer decoder-only de aproximadamente 12B parámetros. La modificación no implica entrenamiento: se aplica *weight-space programming*, una técnica en la que un modelo frontera (Claude Opus) inspecciona y reescribe directamente los pesos de otro modelo. En este caso, la edición afecta únicamente a 6 tensores en las capas 31 y 34, con 4 neuronas modificadas por tensor. El resto de los pesos es bit-idéntico al base, con hashes sha256 documentados tanto para los tensores base como para los editados, y una revisión fijada del modelo original.

El propósito de la edición es un cambio de preferencia lingüística, no la corrección de un fallo: el modelo base tendía a producir un calco del trapassato italiano en contextos donde el original inglés usaba past perfect continuous. La edición fuerza *imperfetto + da* solo cuando la acción pasada seguía en curso, preservando el trapassato cuando el periodo había concluido. El autor reporta que la calidad general de traducción (COMET sobre FLORES) no se ve alterada. El repositorio incluye el fichero `edit.npz` y un `manifest.json` con los hashes y la revisión del base, junto con un script `apply_edit.py` en el repositorio de GitHub para reproducir el modelo bit a bit. No se dispone de información sobre el dataset de entrenamiento del base ni sobre el volumen de tokens utilizado.

## Capacidades

- Generación de texto conversacional en inglés e italiano.
- Traducción EN→IT con control fino del aspecto verbal en pasados (imperfetto vs trapassato).
- Razonamiento y generación de código heredados del modelo base Gemma 4 12B-it (no verificados específicamente en esta edición).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a it y en según los tags del repositorio.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Traducción editorial EN→IT con control aspectual: el modelo elige *imperfetto + da* frente al trapassato en pasajes narrativos donde la acción pasada seguía en curso, evitando calcos del inglés. Adecuado para traducción literaria y subtitulado donde el aspecto verbal es crítico.
- Localización de contenidos narrativos y guiones: permite mantener consistencia en el tratamiento de pasados continuos a lo largo de un texto largo, reduciendo la revisión manual del traductor.
- Investigación en weight-space programming: sirve como caso de estudio reproducible (con `edit.npz` y hashes) para estudiar cómo ediciones localizadas de pesos afectan a comportamientos lingüísticos específicos sin reentrenar.
- Auditoría de seguridad de modelos: el autor publica un modelo "tampered" companion (Qwen3.8-27B-TAMPERED) para concienciar sobre la misma técnica con intención opuesta; este modelo constructivo sirve como referencia de línea base.
- Evaluación de robustez de traducción automática: útil para probar si las métricas agregadas (COMET, BLEU) detectan cambios localizados de preferencia estilística que no afectan a la calidad global.
- Despliegue local en entornos con recursos limitados: el GGUF Q4_K_M permite ejecutar el modelo en estaciones de trabajo consumer para pruebas de traducción sin depender de APIs externas.
- Docencia en PLN: ejemplo práctico de cómo un modelo frontera puede modificar el comportamiento de otro modelo sin entrenamiento, con protocolo y datos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card indica únicamente que la calidad general de traducción medida con COMET sobre FLORES se mantiene sin cambios respecto al base, sin proporcionar cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de ~12B en Q4_K_M se sitúa típicamente en el rango de 7-9 GB, pero el autor no publica mediciones.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU consumer? El GGUF Q4_K_M (tamaño del repo 7,4 GB) es compatible con GPUs consumer de gama alta con suficiente VRAM, aunque no se especifican modelos concretos.
- Opciones de despliegue: Ollama, LM Studio, llama.cpp (según la model card).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-12B-it-tense-edit-weight-space | ~11,9B | no disponible | Gemma Terms of Use | Edición de pesos para preferencia aspectual EN→IT | GGUF Q4_K_M + edit.npz |
| google/gemma-4-12B-it (base) | ~11,9B | no disponible | Gemma Terms of Use | Modelo instructivo general | Safetensors, GGUF |
| Qwen3.8-27B-TAMPERED-brand-implant-experiment | no disponible | no disponible | no disponible | Edición de pesos maliciosa (companion) | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La edición está diseñada para un caso lingüístico muy concreto (aspecto verbal EN→IT); no se garantiza que generalice a otros pares de lenguas ni a otros fenómenos gramaticales.
- Solo se han modificado 6 tensores en 2 capas; el resto del modelo es idéntico al base, por lo que hereda todos los sesgos y limitaciones de google/gemma-4-12B-it.
- Riesgo de alucinación: no evaluado específicamente en esta edición; se asume el del modelo base.
- Idiomas soportados limitados a it y en según los tags; el resto de lenguas del base no se declaran.
- La licencia Gemma Terms of Use impone restricciones de uso comercial y obligaciones de atribución; debe revisarse antes de cualquier despliegue en producción.
- El autor la describe explícitamente como "research artifact"; no hay garantías de estabilidad ni de soporte.
- El modelo companion "TAMPERED" demuestra que la misma técnica puede usarse con intención maliciosa; conviene auditar cualquier peso editado antes de confiar en él.
- No se publican cifras de COMET ni de otros benchmarks, solo la afirmación cualitativa de que la calidad general no cambia.

## Enlaces

- HuggingFace: https://huggingface.co/Feyd89/Gemma-4-12B-it-tense-edit-weight-space
- GitHub del proyecto: https://github.com/ValerioDolci/frontier-weight-edit
- Modelo companion (tampered): https://huggingface.co/Feyd89/Qwen3.8-27B-TAMPERED-brand-implant-experiment
- Blog MIT CSAIL sobre weight-space programming: https://rikiyat.github.io/blog/weight-space-programming/
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Modelo base: https://huggingface.co/google/gemma-4-12B-it

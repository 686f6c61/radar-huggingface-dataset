# Justbackup/Gemma-4-12B-OBLITERATED

## Resumen

El modelo **Gemma-4-12B-OBLITERATED**, publicado por el usuario Justbackup, es un derivado del modelo oficial de Google **Gemma 4 12B-it** al que se le ha aplicado una técnica de cirugía de pesos denominada **OBLITERATION**. Esta técnica, desarrollada por el colectivo OBLITERATUS, elimina quirúrgicamente los mecanismos de rechazo (refusals) del modelo original, de modo que el modelo resultante no se niega a responder a ninguna petición, manteniendo a la vez las capacidades de razonamiento y conocimiento del modelo base. El objetivo declarado es servir como herramienta de investigación en alineación, red-teaming y evaluación de seguridad, no como producto de consumo.

El modelo conserva la arquitectura Transformer del Gemma 4 12B-it, con aproximadamente 11,96 mil millones de parámetros, y se distribuye en formatos safetensors y GGUF. La model card indica que se ha logrado una tasa de rechazo de 0/842 prompts y una paridad exacta en MMLU-Pro (46/70, 65,7%) frente al modelo stock. La relevancia actual de esta ficha radica en que ejemplifica una línea de investigación activa sobre la robustez de los guardarraíles de seguridad frente a modificaciones posteriores al entrenamiento, y proporciona un baseline útil para evaluar técnicas de abliteración.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4) |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (varias, no especificadas) |
| Idiomas soportados | No disponible |
| Licencia | Gemma |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de los pesos oficiales de **google/gemma-4-12B-it** y no recibe entrenamiento adicional; en su lugar, se aplica una cirugía de pesos en dos pasadas:

1. **Pasada 1 — SOM Refusal Geometry Removal** (capas 12-21): se identifican y eliminan 6 direcciones geométricas en el espacio de activaciones que codifican el comportamiento de rechazo. Esta pasada por sí sola consigue 0/842 rechazos, pero degrada el rendimiento en MMLU-Pro.
2. **Pasada 2 — ASPA Source-Tethering con gradiente escalonado** (capas 22-46): se mezclan los pesos abliterados con los pesos stock mediante la fórmula `W_new = (1-gamma)*W_abliterated + gamma*W_stock`. La innovación clave es el uso de un **gradiente escalonado** (step gradient) en lugar de un gamma uniforme: las capas 22-31 (capas de conocimiento) usan gamma = 0,55 (55% de pesos stock), mientras que las capas 32-46 (capas de salida) usan gamma = 0,20 (20% de pesos stock). Esto permite recuperar la paridad total en MMLU-Pro (65,7%) manteniendo cero rechazos.

La técnica ASPA (Abliteration Source-Tethering with Parity Assurance) es una contribución novedosa del proyecto OBLITERATUS, y el modelo documenta un barrido sistemático de valores de gamma que muestra la relación entre capacidad y eliminación de rechazos.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base Gemma 4 12B-it.
- Capacidades multimodales (image-text-to-text) según las etiquetas del repositorio, aunque no se detallan pruebas específicas en la model card.
- **Cero rechazos**: el modelo responde a 842 prompts que el modelo stock rechazaría, con una tasa de rechazo del 0,0%.
- Coherencia del discurso preservada: 6/6 comprobaciones de coherencia superadas.
- Sin degradación de rendimiento en MMLU-Pro respecto al modelo stock (65,7% en ambos casos).
- Compatible con pipelines de transformers y con despliegue vía endpoints compatibles con OpenAI (según el repositorio de GitHub asociado).

## Casos de uso

- **Investigación en alineación y mecanística de la negativa**: permite estudiar cómo se codifica geométricamente el comportamiento de rechazo en modelos transformer, comparando las activaciones del modelo abl iterado con las del modelo stock.
- **Red-teaming de sistemas de seguridad**: sirve como baseline sin restricciones para probar la robustez de filtros de contenido, clasificadores de seguridad y otros mecanismos de moderación.
- **Evaluación de la robustez de la alineación frente a modificaciones de pesos**: permite cuantificar cuánto resiste el entrenamiento RLHF/DPO cuando un adversario tiene acceso a los pesos y aplica técnicas de cirugía.
- **Benchmarking de técnicas de abliteración**: al documentar el proceso completo (barrido de gamma, validación estadística con Z-test), el modelo sirve como referencia reproducible para comparar futuras técnicas de eliminación de rechazos.
- **Desarrollo de contramedidas de seguridad**: los resultados obtenidos (paridad de MMLU-Pro con cero rechazos) informan sobre qué capas y direcciones son críticas para la seguridad, ayudando a diseñar métodos de blindaje más robustos.
- **Estudio de la transferencia de conocimiento entre capas**: el gradiente escalonado (gamma 0,55 en capas 22-31 y 0,20 en capas 32-46) proporciona un caso de estudio sobre la separación funcional entre capas de conocimiento y capas de salida.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados comparativos frente al modelo stock:

| Métrica | Stock Gemma 4 12B-it | OBLITERATED |
|---|---|---|
| MMLU-Pro val70 | 46/70 (65,7%) | 46/70 (65,7%) |
| Refusals (842 prompts) | N/A (el stock rechaza) | 0/842 (0,0%) |
| Coherencia (6 comprobaciones) | 6/6 | 6/6 |
| Delta MMLU-Pro vs stock | — | 0,0 pp |

Además, se incluye una validación estadística mediante Z-test (n=500): Z = -1,475 (|z| < 1,96), lo que indica paridad estadística con un nivel de confianza p < 0,05. También se documenta un barrido de gamma para la pasada 2, mostrando la evolución del rendimiento en MMLU-Pro y la tasa de rechazo para distintos valores de gamma uniforme y el gradiente escalonado final.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene ~12B parámetros. En FP16 se necesitan aproximadamente 24 GB de VRAM. Con cuantizaciones GGUF (por ejemplo, Q4_K_M) el requisito baja a unos 7-8 GB, y con Q8 a unos 13 GB.
- **GPU recomendadas**: para FP16, una GPU con 24 GB o más (RTX 3090/4090, A100, H100). Para cuantizaciones ligeras, una RTX 3060 de 12 GB o superior es suficiente.
- **Compatibilidad con GPU de consumo**: sí, con cuantizaciones GGUF puede ejecutarse en GPUs de consumo de gama media-alta (12 GB VRAM).
- **Opciones de despliegue**: transformers (PyTorch), vLLM, llama.cpp, Ollama, TGI. El repositorio de GitHub asociado muestra un despliegue en Modal con endpoint compatible con OpenAI.
- **Latencia y throughput**: no se proporcionan datos específicos en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Refusals | Licencia |
|---|---|---|---|---|---|
| Gemma 4 12B-it (stock) | ~12B | No disponible | 65,7% | N/A (rechaza) | Gemma |
| Gemma-4-12B-OBLITERATED (este) | ~12B | No disponible | 65,7% | 0/842 | Gemma |
| Otros modelos abliterados (p. ej., Llama-3-8B-Instruct-abliterated) | ~8B | No disponible | No disponible | Variable | Según base |

La comparativa con otros modelos abliterados es limitada porque no se dispone de datos públicos estandarizados. La principal diferencia frente al stock es la eliminación total de rechazos con paridad de rendimiento, algo que no se había logrado previamente según la model card.

## Limitaciones y advertencias

- **Guardarraíles eliminados**: el modelo no tiene mecanismos de seguridad y puede generar contenido dañino, ilegal o éticamente problemático. No debe usarse en entornos de producción ni con usuarios no técnicos.
- **Riesgo de alucinación**: al igual que el modelo base, puede inventar información, especialmente en temas especializados o de actualidad.
- **Sesgos heredados**: el modelo conserva los sesgos del Gemma 4 12B-it, que pueden manifestarse en respuestas discriminatorias o estereotipadas.
- **Limitaciones de contexto e idioma**: no se especifican la longitud de contexto ni los idiomas soportados; se asume que hereda las del modelo base, pero no está confirmado.
- **Restricciones de licencia**: la licencia Gemma de Google puede imponer condiciones de uso comercial y redistribución que deben revisarse antes de cualquier despliegue.
- **Uso exclusivo para investigación**: el autor declara explícitamente que el modelo es para investigación en seguridad, red-teaming y evaluación de alineación, no para consumo general.
- **Fecha de publicación inusual**: el repositorio indica una fecha de creación de agosto de 2026, lo que puede ser un error o una fecha planificada; se recomienda verificar la vigencia del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Justbackup/Gemma-4-12B-OBLITERATED
- Repositorio original de OBLITERATUS: https://huggingface.co/OBLITERATUS/Gemma-4-12B-OBLITERATED
- Repositorio GGUF (usuario Iambackup): https://huggingface.co/Iambackup/Gemma-4-12B-OBLITERATED-GGUF
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Blog de Google sobre Gemma 4 12B: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Repositorio de despliegue en Modal (GitHub): https://github.com/pradhankukiran/gemma-4-12B-OBLITERATED

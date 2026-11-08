# nutthakorn7/salad-qwen3-8b-intervention-adapters

## Resumen

Los adaptadores `salad-qwen3-8b-intervention-adapters` son un conjunto de LoRA (concretamente QLoRA en 4 bits NF4) entrenados sobre el modelo base Qwen/Qwen3-8B. No constituyen un modelo independiente, sino artefactos de investigación asociados a la sección 6 ("Interventions") del artículo *An Apparent Label Hallucination in a Fine-Tuned Security Classifier Traced to a Train–Test Label-Vocabulary Mismatch*, de N. Chalaemwongwan, en revisión en DMLR. Su propósito es permitir la reproducibilidad: cualquier lector puede volver a medir las verosimilitudes de etiqueta recogidas en la Tabla 5 del artículo y regenerar las respuestas del conjunto de test sin necesidad de reentrenar.

El problema que abordan es un desajuste entre el vocabulario de etiquetas del conjunto de entrenamiento y el del conjunto de test en un clasificador de seguridad (SALAD). Los adaptadores difieren únicamente en cómo se tratan las 165 filas de entrenamiento cuya etiqueta objetivo era "Port Scanning": un brazo de control sin cambios, un brazo de reetiquetado a "Reconnaissance", un brazo de eliminación de esas filas y un brazo de reetiquetado a una etiqueta ficticia ("Category Zeta"). Cada adaptador pesa aproximadamente 666 MB en fp32, con rango 64, alpha 128 y dropout 0,05 aplicado a todas las capas lineales.

Es relevante ahora porque documenta de forma empírica cómo una fuga de etiqueta a través del campo Alert Type invalida las métricas de precisión de un clasificador de alertas de seguridad. El propio autor advierte que los adaptadores son artefactos de investigación, no herramientas de seguridad, y que su precisión no dice nada sobre el triaje real de alertas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer decoder-only Qwen3-8B |
| Parámetros totales | Adaptador LoRA: no disponible (rango 64, alpha 128); base: 8B |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del base Qwen3-8B) |
| Tipos de cuantización | Base cargado en 4-bit NF4 con double quantization y cómputo bf16 (bitsandbytes) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT), adaptadores guardados en fp32 |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3-8B en la revisión `b968826d9c46dd6066d109eabc6255188de91218`, cargado en 4 bits NF4 con cuantización doble y cómputo en bf16. Sobre él se aplican adaptadores LoRA con una receta idéntica en todos los brazos: rango 64, alpha 128, dropout 0,05, aplicados a todas las capas lineales. El entrenamiento consta de 3 épocas, batch 8 con acumulación de gradiente 4, optimizador AdamW con tasa 2e-4, decaimiento coseno y 10% de warmup, precisión bf16 y cálculo de pérdida únicamente sobre el turno del asistente. Las versiones de librerías empleadas son torch 2.6.0, transformers 4.53.2, peft 0.16.0, bitsandbytes 0.46.1 y accelerate 1.8.1.

Los datos de entrenamiento y test son dos ficheros en formato chat de siete campos derivados de la release pública SALAD (doi:10.5281/zenodo.18912306, CC BY 4.0), que no se redistribuyen. El paquete suplementario del artículo reconstruye ambos ficheros byte a byte a partir de la release mediante un manifiesto de filas. Los brazos se diferencian solo en el tratamiento de las 165 filas con objetivo "Port Scanning": control (sin cambios, semilla 42), relabel (objetivo "Reconnaissance", semillas 42, 123 y 2024), delete (filas eliminadas, quedando 4.835 filas de entrenamiento, semilla 42) y neutral (objetivo "Category Zeta", semilla 42). Los prompts usan la plantilla de chat de Qwen3 con el modo thinking desactivado.

## Capacidades

- Generación de texto y clasificación de alertas de seguridad dentro del dominio SALAD, con la plantilla de chat de Qwen3 y thinking desactivado.
- Medición de verosimilitudes de etiqueta sobre el conjunto de test para reproducir la Tabla 5 del artículo.
- Generación de respuestas contrafactuales y respuestas de test con decodificación greedy y un máximo de 64 tokens nuevos.
- Evaluación de intervenciones sobre el vocabulario de etiquetas (reetiquetado, eliminación, etiqueta neutra) para auditar el efecto de un desajuste train–test.
- No soporta tool calling, agentes, visión, audio ni modo thinking en el contexto de estos adaptadores.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Reproducción de la Tabla 5 del artículo: cargar cada adaptador con `PeftModel.from_pretrained` y ejecutar los scripts `code/salad_v1_interventions.py` para recalcular las verosimilitudes de etiqueta sin reentrenar.
- Auditoría de fugas de etiqueta: comparar las respuestas del brazo `control_s42` con las de `relabel_s42`, `delete_s42` y `neutral_s42` para cuantificar cuánto de la precisión aparente proviene del campo Alert Type.
- Validación de pipelines de evaluación: usar los adaptadores como referencia para comprobar que un harness de evaluación propio reproduce los mismos resultados con decodificación greedy y 64 tokens nuevos.
- Investigación sobre desajuste de vocabulario de etiquetas: emplear los brazos de reetiquetado y eliminación para estudiar cómo cambia el comportamiento del clasificador cuando se altera la distribución de etiquetas.
- Docencia y revisión por pares: permitir a revisores y estudiantes reejecutar las intervenciones del artículo con un coste de cómputo reducido, dado que solo se cargan adaptadores de ~666 MB sobre el base cuantizado.
- Pruebas de contrafactualidad con prompts campo a campo: usar `code/salad_v1_interventions_round2.py` para evaluar respuestas cuando se varía un único campo del formato chat de siete campos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que las métricas de precisión de estos adaptadores sobre el fichero de test SALAD no son informativas sobre triaje real de alertas, porque dicho fichero filtra su etiqueta a través del campo Alert Type.

## Requisitos de hardware

- VRAM estimada: el base Qwen3-8B en 4-bit NF4 ocupa aproximadamente 4-5 GB de pesos; con overhead de activaciones y caché KV conviene prever al menos 8-10 GB para inferencia con contexto moderado. Los adaptadores añaden ~666 MB cada uno en fp32.
- GPU recomendadas: A100, H100 o RTX 4090 para ejecución cómoda; una RTX 3090 o 4080 de 16 GB es suficiente para el base cuantizado en 4 bits.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más usando cuantización 4-bit NF4 vía bitsandbytes.
- Opciones de despliegue: el flujo documentado usa transformers + peft + bitsandbytes + accelerate. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI con estos adaptadores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| salad-qwen3-8b-intervention-adapters | LoRA sobre base 8B | No disponible | Adaptador de investigación | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-8B | 8B | No disponible en la información | Modelo base instructivo | No disponible en la información | Hugging Face |
| Qwen3-8B (edición thinking) | 8B | No disponible en la información | Modelo con razonamiento | No disponible en la información | Hugging Face, SGLang |

La comparación con alternativas de la misma categoría (adaptadores LoRA de auditoría de datasets) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No son herramientas de seguridad: el propio autor los describe como artefactos de investigación. Su precisión sobre el test SALAD está contaminada por una fuga de etiqueta vía Alert Type.
- El fichero de test derivado de SALAD filtra la etiqueta, por lo que cualquier métrica de exactitud obtenida con estos adaptadores carece de validez para triaje real de alertas.
- Los datos de entrenamiento y test no se redistribuyen; solo se reconstruyen desde la release pública SALAD mediante el paquete suplementario.
- Solo se han publicado adaptadores para las semillas indicadas (42 en control, delete y neutral; 42, 123 y 2024 en relabel); no hay cobertura de otras semillas.
- El modo thinking debe permanecer desactivado y la decodificación debe ser greedy con un máximo de 64 tokens nuevos para reproducir los resultados del artículo; otras configuraciones pueden dar lugar a resultados no comparables.
- Licencia Apache-2.0 heredada del modelo base; conviene verificar las condiciones de uso del base Qwen3-8B para producción.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información disponible, más allá del fenómeno de "label hallucination" que motiva el artículo.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/nutthakorn7/salad-qwen3-8b-intervention-adapters
- Modelo base Qwen/Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Documentación de despliegue de Qwen3-8B en SGLang: https://docs.sglang.io/docs/hardware-platforms/ascend-npus/model-deployment/tutorials/qwen3_8b
- Release pública SALAD (dataset): https://doi.org/10.5281/zenodo.18912306

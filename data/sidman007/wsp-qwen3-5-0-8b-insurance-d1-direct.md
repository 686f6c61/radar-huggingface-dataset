# sidman007/wsp-qwen3.5-0.8b-insurance-d1-direct

## Resumen

`wsp-qwen3.5-0.8b-insurance-d1-direct` es un artefacto de investigación derivado de Qwen/Qwen3.5-0.8B (commit `2fc06364715b`) mediante una edición directa en el espacio de pesos, sin descenso de gradiente, sin optimizador y sin LoRA. El autor, `sidman007`, reescribe 1024 columnas de la matriz `layers.21.mlp.down_proj` (1.048.576 pesos, el 0,139% del total del modelo) para instalar una habilidad concreta: clasificar cláusulas de seguros en ocho categorías (coverage, exclusion, premium, deductible, claims, definitions, cancellation, conditions).

El método, denominado weight-space programming, parte de un profesor tipo Jev (cabezas de decisión calibradas sobre el lector congelado, ajustadas con 1.496 frases de seguros etiquetadas) que genera probabilidades objetivo. Cada ronda resuelve una regresión ridge por mínimos cuadrados que escribe esas probabilidades en los pesos, con una dosis seleccionada sobre filas de retención y un límite sobre la perturbación del texto ordinario. El resultado es un modelo de chat general de 0,8B con una única habilidad instalada que alcanza un 89,94% de acierto en test retenido (macro-F1 de 0,9003) al generar la primera palabra de la respuesta.

La relevancia es metodológica más que de producto: demuestra que es posible inyectar una tarea discriminativa en una matriz MLP concreta de un transformer con un coste de cómputo mínimo y un diff auditable (`edit_manifest.json` registra capa, columnas y hash de la actualización). El propio autor lo etiqueta como prueba de concepto no lista para producción, con datos sintéticos y un único modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5, tag `qwen3_5_text`); edición puntual en `layers.21.mlp.down_proj` |
| Parámetros totales | 752.393.024 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; el bundle de edición se distribuye en fp32) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo); `edit.npz` + `manifest.json` para el diff de edición |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen3.5 con 752 millones de parámetros. Sobre ese checkpoint congelado no se ejecuta ningún bucle de entrenamiento convencional: la intervención consiste en sustituir 1024 columnas de `layers.21.mlp.down_proj` (un total de 1.048.576 pesos, el 0,139% del modelo) mediante una actualización `D` de forma `[1024, 1024]` en fp32. El profesor es una cabeza logística multinomial estandarizada (`mean`, `scale`, `coef [8, 2048]`, `intercept`) que lee dos características del modelo base congelado en la posición de respuesta: `final_last` (entrada de la normalización final) y `L16_mean` (media sobre los tokens de la frase del residual de la capa 16), con temperatura de calibración y umbral de abstención propios. El profesor se ajustó con 1.496 frases de seguros etiquetadas y alcanza un 98,8% en el mismo conjunto de test, actuando como techo del proceso.

La destilación se realiza con una resolución ridge por mínimos cuadrados por ronda, seleccionando la dosis sobre filas de retención y aplicando un tope a la perturbación del texto ordinario. Se publican tres semillas (0, 1, 2), aunque solo la semilla 0 está integrada en los pesos de la raíz del repositorio. El repositorio incluye `edit_manifest.json` con el diff exacto contra el checkpoint base, `rebuild_check.json` que certifica la reconstrucción tensor a tensor, el profesor en `teacher/s<k>/head.npz`, la comparación con LoRA y una suite de olvido (forgetting suite). No se especifican en la información disponible el número de tokens de entrenamiento del modelo base ni la composición de su dataset original.

## Capacidades

- Clasificación de cláusulas de seguros en ocho categorías: `coverage`, `exclusion`, `premium`, `deductible`, `claims`, `definitions`, `cancellation`, `conditions`, devolviendo una de las ocho palabras como primera palabra generada.
- Generación de texto conversacional heredada del modelo base Qwen3.5-0.8B cuando se usa fuera del formato de prompt específico.
- Razonamiento y código: capacidades del modelo base, no evaluadas ni reforzadas en esta edición.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; la habilidad instalada es una clasificación de un solo paso.
- Multilingüismo: limitado al inglés según la model card, aunque el modelo base podría tener capacidades adicionales no declaradas.
- Modo thinking, visión o audio: no disponible.
- Calibración de confianza: las probabilidades sobre las palabras de respuesta se heredan de la calibración del profesor; el autor recomienda recalibrar antes de usarlas como confidencias.

## Casos de uso

- Etiquetado automático de cláusulas en corpus de pólizas: el modelo clasifica frases individuales en una de las ocho categorías con un 89,94% de acierto en test retenido, útil para preprocesar grandes volúmenes de texto contractual antes de una revisión humana.
- Enrutamiento de consultas en un sistema de atención al cliente asegurador: dado un fragmento de texto del cliente o de la póliza, la primera palabra generada indica la categoría y permite dirigir la consulta al equipo adecuado (siniestros, primas, deducibles).
- Investigación sobre edición de pesos: sirve como referencia reproducible para estudiar weight-space programming, comparar con LoRA y analizar el olvido catastrófico mediante la suite incluida en el repositorio.
- Construcción de datasets etiquetados: el profesor incluido (`teacher/s<k>/head.npz`, 98,8% en test) puede usarse como anotador de alta precisión para generar etiquetas de entrenamiento adicionales.
- Auditoría de modelos editados: el diff exacto (`edit.npz` + `manifest.json` con hash de `D`) permite verificar qué pesos cambiaron, lo que resulta útil en entornos con requisitos de trazabilidad.
- Docencia y divulgación: ejemplo mínimo (0,8B, 1,5 GB de repo) para explicar destilación sin gradiente, regresión ridge aplicada a pesos y evaluación de olvido en modelos pequeños.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Acierto en test retenido (primera palabra generada, 1.779 frases) | 89,94% |
| Macro-F1 en test retenido (primera palabra generada) | 0,9003 |
| Acuerdo con el profesor | 89,5% |
| Acierto del profesor en el mismo test | 98,8% |
| Pesos modificados | 1.048.357 |
| Semilla integrada en la raíz | 0 (`direct_s0`) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,5 GB en fp16 para los 752 millones de parámetros; en torno a 0,8-1 GB con cuantización de 8 bits y 0,4-0,5 GB en 4 bits (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB o superior permite ejecutar el modelo en fp16 con holgura. Para despliegues en lote, A100 o H100 aportan mayor throughput pero no son necesarias.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con 2 GB o más de VRAM en fp16, y en iGPU o CPU con cuantización.
- Opciones de despliegue: llama.cpp, Ollama, vLLM y TGI son compatibles con el formato safetensors del modelo base; la edición de pesos se aplica con `wspd.edit.ColumnEdit` del repositorio fuente antes de exportar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wsp-qwen3.5-0.8b-insurance-d1-direct | 752 M | No disponible | Clasificación de cláusulas de seguros (8 clases) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 752 M | No disponible | Chat general | Apache 2.0 | Hugging Face |
| Modelo ajustado con LoRA sobre Qwen3.5-0.8B | 752 M + adaptadores | No disponible | Depende del dataset | Apache 2.0 | No disponible (comparación incluida en el repo del autor) |

La comparación directa con el modelo base y con la variante LoRA está documentada en el repositorio del autor, aunque los valores concretos de esa comparación no se detallan en la información disponible.

## Limitaciones y advertencias

- Artefacto de investigación: prueba de concepto con un único modelo base, datos sintéticos de seguros generados para el estudio y una sola matriz editada. No está listo para producción.
- Fuera del formato de prompt específico (frase, pregunta y ocho opciones), el modelo se comporta como el base; la suite de olvido del repositorio mide cuánto se aproxima.
- Las probabilidades sobre las palabras de respuesta heredan la calibración del profesor; deben recalibrarse antes de interpretarlas como confidencias.
- Solo se publica la semilla 0 integrada en los pesos de la raíz; las semillas 1 y 2 están disponibles como bundles de edición separados.
- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano no está evaluado.
- Riesgo de alucinación: el modelo base puede generar texto plausible fuera de la tarea; la clasificación de cláusulas no incluye abstención explícita en la inferencia publicada, aunque el profesor sí tiene umbral de abstención.
- Sesgos: no documentados en la información disponible; los datos de entrenamiento del profesor son sintéticos y pueden no reflejar la distribución real de pólizas.
- Licencia Apache 2.0: permite uso comercial, pero el autor desaconseja explícitamente el despliegue en producción sin una validación adicional.
- Longitud de contexto: no especificada; al tratarse de clasificación de frases individuales, el requisito práctico es bajo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sidman007/wsp-qwen3.5-0.8b-insurance-d1-direct
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio fuente, logs y protocolo: https://github.com/siddharth-ghatti/weight-space-programming-poc

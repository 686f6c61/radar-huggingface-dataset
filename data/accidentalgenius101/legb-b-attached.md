# accidentalgenius101/legB-B-attached

## Resumen

legB-B-attached es un checkpoint de replicación a escala reducida del experimento de monitorabilidad sobre la tarea Countdown descrito en la Sección 4 del artículo «Shaping & Monitoring Models through their Internal Representations» (arXiv:2611.07071) de Goodfire. Lo publica el usuario accidentalgenius101 y consiste en un ajuste fino completo (full fine-tune) del modelo base Qwen3-0.6B, con 596.049.920 parámetros, entrenado durante 200 actualizaciones con GRPO sobre una versión de juguete de la tarea «peek-or-solve» de Countdown.

El objetivo del experimento no es producir un modelo de propósito general, sino verificar si una señal de entrenamiento basada en representaciones internas (reliance-shaping, con lambda 0.4 y peso w 0.2) consigue que el modelo deje de «hacer trampa» (peek) y resuelva honestamente, y si esa supresión es detectable por una sonda lectora en la capa 21. El autor declara un veredicto REPLICATED con una «herida» (wound) nombrada: la métrica predeclarada de caída de balanced accuracy de la sonda original resulta ilegible porque, tras la actualización 10, la política adjunta deja de emitir peeks y las evaluaciones pasan a ser de una sola clase.

Es relevante ahora porque acompaña a la publicación de la librería `reliance` de Goodfire, que no liberó los modelos conformados; este checkpoint es un artefacto independiente de replicación que documenta tanto el resultado como los fallos de instrumentación encontrados por el camino (sustitución del lector de sondas por uno sin padding). No es un modelo para uso en producción: es material de investigación sobre interpretabilidad y monitorabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-0.6B), ajuste fino completo |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen3-0.6B, un transformer decoder-only, y se somete a un ajuste fino completo (no LoRA ni adaptadores) durante 200 actualizaciones con GRPO y una tasa de aprendizaje de 1e-05, valor que el autor declara como desviación explícita porque el texto del artículo no lo especifica. La configuración del brazo B-attached usa lambda 0.4, w 0.2, tamaño de grupo 16, semilla 0 y capa de sonda 21. El entrenamiento se realiza sobre una versión miniaturizada de la tarea Countdown («task v2»), un entorno de juguete de tipo peek-or-solve en el que el modelo puede resolver honestamente o consultar una respuesta filtrada.

La innovación técnica del experimento es el reliance-shaping: una señal que empuja la política hacia una región de activaciones distinta de la que usa el comportamiento de peek, de modo que la supresión del atajo sea verificable mediante una sonda lectora entrenada sobre las activaciones de la capa 21. El autor documenta además una reparación de instrumentación: el lector original extraía activaciones de lotes con padding sin máscara de atención y medía 0.625 donde un lector por texto sin padding medía 0.962 sobre los mismos rollouts; el lector corregido se ajustó con un conjunto de 640 rollouts y se validó con balanced accuracy 1.000 en la capa 27 (n=640) y 0.955 en la evaluación de la actualización 0. Las desviaciones respecto al texto del artículo se listan en `config.json` (campo `deviations`) y en `HYPERPARAMS.md`.

## Capacidades

- Generación de texto y razonamiento sobre la tarea Countdown de juguete (peek-or-solve).
- Resolución honesta de la tarea: la tasa de honest_solve alcanza 1.0 al final del entrenamiento, frente a 0.0625 en el paso 0.
- Supresión del atajo de peek: la tasa de peek cae de 0.46875 a 0.0.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso fuera de la tarea de entrenamiento.
- Capacidades multilingües: no disponibles.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Investigación en interpretabilidad: reproducir y auditar el experimento de monitorabilidad de la Sección 4 del artículo usando este checkpoint como brazo B-attached junto con los brazos B-detached y B-frozen.
- Estudio de reliance-shaping: analizar cómo una señal de entrenamiento basada en representaciones internas desplaza la política fuera de la región de activaciones del comportamiento indeseado (out_of_region_frac pasa de 0.0625 a 1.0).
- Validación de instrumentación de sondas: usar el par de lectores (con y sin padding) documentado en `legB/REPAIR.md` para comprobar el efecto de la máscara de atención en la extracción de activaciones.
- Docencia sobre colapso de monitores: ilustrar por qué una balanced accuracy de 1.0 puede ser degenerada cuando la política emite una sola clase, y por qué el canal de norma (act_norm 178 → 211 en L21) puede portar la señal que la sonda deja de leer.
- Reproducción de experimentos a pequeña escala: servir como referencia de coste reducido (0.6B parámetros, 200 actualizaciones) antes de escalar a modelos de 9B como en el artículo original.
- Análisis de fallos de métricas predeclaradas: estudiar el caso de la «herida» documentada, en la que la barra de caída de balanced accuracy de la sonda original queda ilegible tras la actualización 10.

## Benchmarks y rendimiento

| Metrica (paso 0 vs. final) | Paso 0 | Final |
|---|---|---|
| Balanced accuracy de la sonda original | 1.0 | 1.0 |
| AUROC de la sonda original | 1.0 | 0.5 |
| Tasa de peek | 0.46875 | 0.0 |
| Tasa de honest_solve | 0.0625 | 1.0 |
| Norma de activación en el sitio de sonda (media / p99) | 177.69119262695312 / 202.6985321044922 | 210.74415588378906 / 210.74415588378906 |
| Fracción fuera de región | 0.0625 | 1.0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor advierte que estas cifras corresponden a una replicación miniaturizada sobre Qwen3-0.6B con una tarea de juguete y no se transfieren cuantitativamente a la escala del artículo (modelo de 9B sobre Countdown real).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 596 millones de parámetros, en fp16 el peso ronda 1,2 GB y en fp32 unos 2,4 GB, más overhead de activaciones y contexto.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería alojar el modelo en precisión completa.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas tipo RTX 3060, RTX 4060 o superiores, aunque el autor no lo documenta.
- Opciones de despliegue: no disponible; el repo solo distribuye safetensors, sin GGUF ni plantillas de Ollama, llama.cpp, vLLM o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| legB-B-attached | 596.049.920 | no disponible | Replicación de monitorabilidad (Countdown) | other | Hugging Face |
| Qwen3-0.6B (base) | ~0.6B | no disponible en esta ficha | Modelo de propósito general | no disponible en esta ficha | Hugging Face |
| Modelo de 9B del artículo (Goodfire) | ~9B | no disponible | Experimento original de monitorabilidad | no liberado | No publicado |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparación relevante es de propósito y escala, no de benchmarks.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas generales de generación.
- Sesgos conocidos: no documentados por el autor.
- Riesgo de alucinación: no evaluado; el entrenamiento se limita a una tarea de juguete.
- Limitaciones de contexto e idioma: no documentadas; no se especifican longitudes de contexto ni cobertura lingüística.
- Licencia «other»: las condiciones concretas no se detallan en la información disponible; es imprescindible revisar los términos antes de cualquier uso, especialmente comercial.
- Escala: replicación miniaturizada (0.6B, 200 actualizaciones, semilla 0) sobre una tarea de juguete; los números no se transfieren a la escala del artículo.
- Instrumentación: la métrica predeclarada de caída de balanced accuracy de la sonda original es ilegible tras la actualización 10 por degeneración a una sola clase; la señal de colapso del monitor se apoya en el canal de norma, no en la sonda.
- Desviaciones declaradas: hiperparámetros no especificados en el artículo (por ejemplo, LR de GRPO 1e-05) se documentan en `config.json` y `HYPERPARAMS.md`; deben tenerse en cuenta al interpretar la replicación.
- Estado de publicación: subido a Hugging Face el 2026-11-24 por orden explícita del autor, lo que levanta una regla previa de no subida solo para el Leg B.

## Enlaces

- Hugging Face: https://huggingface.co/accidentalgenius101/legB-B-attached
- Artículo de referencia: arXiv:2611.07071, «Shaping & Monitoring Models through their Internal Representations» (Goodfire)
- Librería `reliance` de Goodfire: no disponible en la información proporcionada
- Registro de reparación del instrumento: `legB/REPAIR.md` en el espacio de trabajo de replicación (no enlazado en la información disponible)
- Lista de hiperparámetros: `HYPERPARAMS.md` en el espacio de trabajo de replicación (no enlazado en la información disponible)

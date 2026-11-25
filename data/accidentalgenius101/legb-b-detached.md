# accidentalgenius101/legB-B-detached

## Resumen

legB-B-detached es un checkpoint de replicación independiente del experimento de "countdown monitorability" descrito en la Sección 4 del artículo de Goodfire "Shaping & Monitoring Models through their Internal Representations" (arXiv:2611.07071). El autor, accidentalgenius101, publica este artefacto como parte de una replicación miniaturizada del brazo B (B-detached) sobre un fine-tune completo de Qwen3-0.6B, entrenado con GRPO sobre una tarea de juguete de tipo peek-or-solve en Countdown. No es un modelo de propósito general, sino un objeto de estudio de interpretabilidad y monitorabilidad.

El checkpoint corresponde a una de las cuatro condiciones experimentales (B-attached, B-detached, B-frozen y control) que el autor usa para comprobar si el shaping de representaciones internas altera la legibilidad de una sonda de monitorización. El modelo tiene 596.049.920 parámetros según los pesos en safetensors y ocupa 1,2 GB en el repositorio. La relevancia actual es metodológica: Goodfire liberó únicamente la librería `reliance`, no los modelos shaped, de modo que este checkpoint es uno de los pocos artefactos públicos que permiten inspeccionar de forma empírica el fenómeno descrito en el artículo.

El veredicto declarado por el autor es REPLICATED con una "herida" nombrada: las tres ramas shaped suprimen el peeking hasta 0,0 y alcanzan honest_solve de 1,0, pero la barra predeclarada de caída de balanced accuracy de la sonda original no es legible porque, tras el update 10, la política attached no emite ningún peek y las evaluaciones quedan en una sola clase. La firma de colapso del monitor se traslada al canal de norma (out_of_region_frac pasa a 1,0 y act_norm de 178 a 211 en la capa L21).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B, fine-tune completo) |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; pesos publicados en safetensors (sin GGUF declarado) |
| Idiomas soportados | No disponible (el modelo base es Qwen3, multilingue, pero la model card no declara idiomas) |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,2 GB |
| Modelo base | Qwen3-0.6B |
| Metodo de entrenamiento | GRPO, full fine-tune |
| Tarea de entrenamiento | Countdown v2 (peek-or-solve, juguete) |
| Hiperparametros clave | lambda 0.4, w 0.2, group size 16, 200 updates, probe layer 7, seed 0, LR 1e-05 |
| Fecha de publicacion | 2026-11-24 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-0.6B, un transformer decoder-only denso de aproximadamente 596 millones de parámetros. Este checkpoint no introduce cambios arquitectónicos: es un fine-tune completo (todos los pesos actualizados) del modelo base. El entrenamiento se realiza con GRPO (Group Relative Policy Optimization) sobre una tarea de juguete denominada Countdown v2, en la que la política debe elegir entre "peek" (consultar una pista) o "solve" (resolver honestamente). El shaping de representaciones se aplica con un coeficiente lambda de 0,4, un peso w de 0,2, tamaño de grupo 16 y 200 updates, con sonda en la capa 7 y semilla 0.

El autor declara explícitamente desviaciones respecto al artículo en `config.json` (campo `deviations`), correspondientes a cantidades que el texto HTML de arXiv no especifica; `HYPERPARAMS.md` documenta cada una con su estado de fuente. Además se documenta una reparación del instrumento de lectura: el arnés original extraía activaciones de lotes con padding sin máscara de atención y leía 0,625 donde un lector correcto por texto leía 0,962 sobre los mismos rollouts; se sustituyó por un lector sin padding por texto (conjunto de ajuste de 640 rollouts) antes del lanzamiento de las ramas shaped. El gate de control5 reporta balanced accuracy de validación de la sonda de 1,000 en el paso 0 (capa 27, n=640) y 0,955 en la evaluación del update 0 con el mismo lector.

## Capacidades

- Generación de texto y razonamiento de propósito general heredados de Qwen3-0.6B, aunque el fine-tune está orientado a una tarea de juguete concreta y no se han evaluado capacidades generales.
- Ejecución de la política peek-or-solve en Countdown v2: el modelo aprende a suprimir el peeking y a resolver honestamente (honest_solve final de 1,0 en este run).
- Artefacto de interpretabilidad: permite extraer activaciones en la capa 7 (sitio de la sonda) y analizar la separabilidad lineal entre estados de peek y solve.
- Soporte de tool calling / function calling: no disponible; no se declara en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se declara.
- Capacidades multilingües: no declaradas en la model card; dependen del modelo base Qwen3-0.6B, pero no se han evaluado en este checkpoint.
- Capacidades especiales: ninguna declarada (sin vision, audio ni thinking mode documentado).

## Casos de uso

- Investigación en interpretabilidad mecanicista: el checkpoint sirve para estudiar cómo el shaping de representaciones afecta a la legibilidad de una sonda lineal en la capa 7, comparando la firma de activación entre las ramas attached, detached y frozen.
- Auditoría de metodologías de monitorización: permite reproducir el hallazgo de que la balanced accuracy puede degenerar a especificidad cuando la política colapsa a una sola clase, y validar el uso del canal de norma como señal alternativa de colapso del monitor.
- Replicación de experimentos de alineación a pequeña escala: con 200 updates y una GPU consumer, un investigador puede reejecutar el pipeline GRPO con shaping y verificar el veredicto REPLICATED con herida sobre hardware asequible.
- Desarrollo y validación de instrumentos de lectura de activaciones: el caso del arnés con padding sin máscara (0,625 frente a 0,962) es un ejemplo práctico para probar lectores por texto sin padding en conjuntos de 640 rollouts.
- Docencia en cursos de seguridad y alineación: el modelo ilustra de forma concreta los conceptos de sonda de monitorización, shaping de representaciones y colapso de monitor sin necesidad de infraestructura grande.
- Estudio de dinámicas de recompensa en RL: la tarea peek-or-solve con GRPO, group size 16 y lambda 0,4 permite analizar cómo la presión de shaping modifica la política y la geometría de activaciones (norma de 178 a 211 en L21).

## Benchmarks y rendimiento

Los únicos datos numéricos publicados son los del run de este checkpoint (Qwen3-0.6B full FT, Countdown v2, group 16, lambda 0,4, probe layer 7, seed 0), comparando el paso 0 con la fila final del log:

| Metrica | Paso 0 | Final |
|---|---|---|
| Balanced accuracy de la sonda original | 1,0 | 1,0 |
| AUROC de la sonda original | 1,0 | 0,5 |
| Tasa de peek | 0,40625 | 0,0 |
| Tasa de honest_solve | 0,09375 | 1,0 |
| Norma de activación en el sitio de la sonda (media) | 20,340518951416016 | 19,8494930267334 |
| Norma de activación en el sitio de la sonda (p99) | 22,483985900878906 | 22,47072982788086 |
| Fracción fuera de región | 0,0 | 0,0 |

El autor advierte de que la balanced accuracy final de 1,0 no es informativa: al no emitir peeks tras el update 10, la evaluación es de una sola clase y la métrica degenera a especificidad. La firma de colapso del monitor en la rama attached se mide en el canal de norma (out_of_region_frac hacia 1,0 y act_norm de 178 a 211 en L21), mientras detached y frozen permanecen en región y mantienen la precisión del lector en la ventana mixta (0,983). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 596 millones de parámetros en safetensors (probablemente fp32 o bf16, dado el tamaño de 1,2 GB), la inferencia en bf16 requiere aproximadamente 1,2 GB de pesos más overhead de activaciones; en fp32 serían unos 2,4 GB.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM es suficiente para inferencia; para reentrenar con GRPO y full fine-tune se recomienda una GPU con 16-24 GB (RTX 4090, A10, L4) o superior (A100, H100) para mayor throughput.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, entre otras.
- Opciones de despliegue: al publicarse solo en safetensors, el despliegue requiere transformers o vLLM; no se declara compatibilidad con llama.cpp, Ollama ni TGI, y no hay GGUF publicado.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| legB-B-detached | 596 M | No disponible | Replicacion de monitorability (Countdown) | other | Hugging Face (0 descargas, 0 likes) |
| Qwen3-0.6B (base) | ~600 M | No disponible en esta ficha | Modelo de proposito general | Apache 2.0 (segun Qwen) | Hugging Face, ampliamente disponible |
| Otros brazos de la replicacion (B-attached, B-frozen, control) | ~596 M cada uno | No disponible | Condiciones experimentales del mismo estudio | other | No se confirma su publicacion en la informacion disponible |
| Modelos shaped de Goodfire (articulo arXiv:2611.07071) | 9 B (segun el articulo) | No disponible | Shaping y monitorizacion a escala del paper | No disponible | No liberados publicamente (solo la libreria `reliance`) |

La comparativa relevante no es de rendimiento general, sino de condiciones experimentales: este checkpoint es el brazo detached de una replicación miniaturizada, y su contraparte a escala real (9B) no está disponible públicamente.

## Limitaciones y advertencias

- Modelo de investigación, no de producción: es un fine-tune sobre una tarea de juguete (Countdown v2) y no debe usarse como asistente general ni como base para aplicaciones reales.
- Los números no transfieren cuantitativamente al artículo: la replicación usa Qwen3-0.6B con 200 updates y semilla 0, frente al modelo de 9B del paper sobre Countdown real.
- La balanced accuracy final de 1,0 es engañosa: al no haber peeks tras el update 10, la métrica degenera a especificidad; la señal válida de colapso del monitor está en el canal de norma.
- Riesgo de alucinación: no evaluado en la información disponible; el modelo no está alineado para uso conversacional.
- Sesgos conocidos: no documentados en la model card; hereda los del modelo base Qwen3-0.6B, no evaluados aquí.
- Limitaciones de contexto e idioma: no declaradas; dependen del modelo base y no se han medido en este checkpoint.
- Licencia "other": el autor no especifica términos de uso comercial; debe consultarse el repositorio antes de cualquier uso, y en la práctica el valor comercial es nulo por tratarse de un artefacto de replicación.
- Estado de publicación: subido el 2026-11-24 por orden explícita del autor ("Gabriel"), lo que levanta una regla previa de no subida solo para el Leg B; con 0 descargas y 0 likes, no hay validación externa de la comunidad.
- Dependencia de un instrumento reparado: los resultados se obtuvieron con un lector por texto sin padding tras detectar un fallo del arnés original; cualquier comparación con otros runs debe usar el mismo instrumento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/accidentalgenius101/legB-B-detached
- Articulo de referencia: https://arxiv.org/abs/2611.07071 (Goodfire, "Shaping & Monitoring Models through their Internal Representations")
- Modelo base: Qwen3-0.6B (repositorio oficial de Qwen en Hugging Face; el autor lo referencia como `../models/Qwen3-0.6B`)
- Libreria `reliance` de Goodfire: no se proporciona URL en la informacion disponible
- Documentos internos de la replicacion citados: `config.json` (campo `deviations`), `HYPERPARAMS.md`, `legB/REPAIR.md` (en el espacio de trabajo de replicacion, sin URL publica en la informacion disponible)

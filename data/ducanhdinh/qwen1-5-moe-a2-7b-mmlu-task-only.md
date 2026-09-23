# ducanhdinh/Qwen1.5-MoE-A2.7B-MMLU-Task-Only

## Resumen

El modelo `ducanhdinh/Qwen1.5-MoE-A2.7B-MMLU-Task-Only` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `Qwen/Qwen1.5-MoE-A2.7B`, una arquitectura Mixture-of-Experts (MoE) con 60 expertos y enrutamiento top-4 por token. No es un modelo completo, sino un ajuste fino ligero orientado a una única tarea: responder preguntas de opción múltiple del benchmark MMLU (Massive Multitask Language Understanding), seleccionando la letra correcta entre las opciones A/B/C/D. El repositorio pesa 2,0 GB y contiene únicamente los pesos del adaptador, no los del modelo base.

El problema que resuelve es acotado y experimental: servir como adaptador especializado en formato de examen de opción múltiple, alineado con el prompt estándar que utiliza `lm-evaluation-harness` para evaluar MMLU. Esto lo hace reutilizable, en teoría, para evaluaciones cero-disparo sobre benchmarks con la misma estructura (por ejemplo, MMMLU, la versión multilingüe de MMLU), sin necesidad de reentrenar.

Su relevancia es más de investigación que de producción: explora cómo aplicar LoRA simultáneamente sobre atención, router y expertos de un modelo MoE, con rangos diferenciados por componente (`rank_pattern`). El autor no publica resultados de evaluación reales sobre MMLU, sino únicamente diagnósticos de entrenamiento (curvas de pérdida y precisión por token bajo teacher forcing).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts (MoE); adaptador LoRA sobre Qwen1.5-MoE-A2.7B |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen1.5-MoE-A2.7B declara 14,3B (60 expertos) |
| Parametros activos | No disponible para el adaptador; el modelo base activa ~2,7B por token (top-4 de 60 expertos) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base Qwen1.5-MoE-A2.7B declara 32.768 tokens |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite fp16, int8 e int4/GGUF mediante herramientas externas |
| Idiomas soportados | No disponible (el dataset de entrenamiento es MMLU en ingles; el modelo base es multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen1.5-MoE-A2.7B, un transformer decoder-only con capas Mixture-of-Experts. El ajuste LoRA se restringe a las capas `[8, 16)` de un total de 24 (aproximadamente entre el primer y el segundo tercio de la red), replicando el ajuste usado por el autor en tareas previas (SNLI/SQuAD/alignment). Dentro de ese rango se adaptan tres componentes con rangos distintos mediante `rank_pattern`: atención con r=16, router con r=4 y expertos con r=16, con alpha=32 y dropout=0,05. La inclusión del router y de los expertos en el ajuste es la innovación técnica más reseñable: no se limita a adaptar la atención, sino que también modifica el enrutamiento y las transformaciones internas de los expertos dentro de las capas seleccionadas.

La pérdida combina el término estándar de modelado de lenguaje con el de balanceo de carga de MoE: `L_total = L_LM + lb_loss_coef * L_LB`, con `lb_loss_coef = 0,01`. El `L_LM` se calcula únicamente sobre los tokens de la respuesta `<letter><eos>`, dejando enmascarados el prompt y las opciones (SFT estándar). El `L_LB` se computa sobre los routers situados en el rango de capas ajustado. Los datos provienen de MMLU, concretamente del fichero `auxiliary_train.json`, con objetos `{question, choices, answer, subject}`; las muestras cuyo `full_text` supera `--max_length` se descartan en lugar de truncarse, para no cortar la letra de respuesta situada al final. No se documenta uso de RLHF ni DPO, ni el número total de tokens de entrenamiento.

## Capacidades

- Respuesta a preguntas de opción múltiple (4 opciones A/B/C/D) siguiendo exactamente el formato de prompt de `lm-evaluation-harness`.
- Generación de la letra de respuesta como continuación tras el marcador `Answer:`.
- Clasificación por elección de la opción más probable mediante comparación de probabilidades de los tokens A/B/C/D (o decodificación del primer carácter generado).
- Adaptabilidad estructural a otros benchmarks de opción múltiple con el mismo esquema (p. ej. MMMLU), reemplazando pregunta y opciones y manteniendo el formato.
- Ajuste conjunto de atención, router y expertos en un subconjunto de capas (capacidad de investigación sobre LoRA en MoE).
- No se documenta soporte de tool calling, function calling, uso agéntico, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Evaluación de comprensión multidisciplinar: el adaptador responde preguntas de MMLU (matemáticas, derecho, medicina, historia, etc.) y permite medir la precisión de un modelo MoE en tareas de conocimiento académico con formato de examen.
- Evaluación cero-disparo sobre MMMLU: dado que el prompt coincide con el estándar, se puede reutilizar el adaptador cambiando el idioma de las preguntas y opciones, sin modificar la estructura, para comparar rendimiento entre lenguas.
- Validación de pipelines de evaluación: sirve para probar integraciones con `lm-evaluation-harness` y verificar que el formato de salida y el cálculo de probabilidades por letra funcionan correctamente.
- Investigación sobre LoRA en arquitecturas MoE: permite estudiar el efecto de ajustar router y expertos (no solo la atención) en un rango concreto de capas sobre el rendimiento de una tarea concreta.
- Sistemas de tutoría o autoevaluación académica: puede integrarse en herramientas que presenten preguntas de opción múltiple y necesiten una respuesta automática de referencia para comparar con la del estudiante.
- Etiquetado y filtrado de conjuntos de preguntas de opción múltiple: útil para clasificar o priorizar preguntas por la opción predicha en procesos de curación de datos.
- Reproducción de experimentos de ajuste fino: al documentar hiperparámetros de LoRA (`rank_pattern`, capas, alpha, dropout) y la función de pérdida, facilita replicar o variar el entrenamiento sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente incluye diagnósticos de entrenamiento en el directorio `diagnostics/`:

| Fichero | Contenido |
|---|---|
| `diagnostics/loss_log.jsonl` | Registro de pérdida por step |
| `diagnostics/loss_curve.png` | Curva de pérdida durante el entrenamiento |
| `diagnostics/loss_curve_smoothed.png` | Curva de pérdida suavizada |
| `diagnostics/accuracy_curve.png` | Precisión de token bajo teacher forcing (suavizada cada 50 steps) |

La propia model card advierte que la `accuracy_curve` es una métrica diagnóstica (precisión aproximada de token sobre el conjunto de entrenamiento con teacher forcing, calculada por lotes), y que **no** es la precisión oficial sobre el conjunto de evaluación de MMLU/MMMLU.

## Requisitos de hardware

- VRAM estimada para el modelo base Qwen1.5-MoE-A2.7B (14,3B parámetros totales): ~28-30 GB en fp16, ~15 GB en int8 y ~8-10 GB en 4-bit. Aunque solo se activan ~2,7B por token, todos los expertos deben residir en memoria salvo que se use offload.
- GPU recomendadas: A100 40/80 GB o H100 para fp16 sin cuantizar; A10G/L4/A6000 24-48 GB para int8; RTX 4090 (24 GB) o RTX 3090 (24 GB) para 4-bit o int8 ajustado.
- Cabe en GPU de consumo: sí, en modelos de 24 GB (RTX 3090/4090) aplicando cuantización 4-bit, o fusionando el adaptador y cuantizando.
- Opciones de despliegue: el adaptador puede cargarse con PEFT + Transformers; para servir, se puede fusionar (merge) con el modelo base y desplegar con vLLM o TGI; para entornos locales, convertir el base a GGUF y aplicar/cargar el adaptador con llama.cpp u Ollama.
- Latencia y throughput: no disponibles. La naturaleza MoE (2,7B parámetros activos) implica menor coste de cómputo por token que un modelo denso de 14,3B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ducanhdinh/Qwen1.5-MoE-A2.7B-MMLU-Task-Only | Adaptador sobre 14,3B (base) / ~2,7B | No disponible (base: 32.768) | Opcion multiple (MMLU) | apache-2.0 | HuggingFace (adaptador PEFT) |
| Qwen/Qwen1.5-MoE-A2.7B (modelo base) | 14,3B / ~2,7B | 32.768 | Proposito general | apache-2.0 | HuggingFace |
| Otros adaptadores MMLU sobre bases densas | No disponible | No disponible | Opcion multiple | Variable | No disponible |

No se dispone de datos de rendimiento comparativo entre alternativas para esta tarea; la comparación se limita a tamaño, contexto y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; el adaptador hereda los sesgos del modelo base y del dataset MMLU.
- Riesgo de alucinación: bajo en la tarea objetivo (seleccionar una letra), pero el adaptador no está diseñado para generación libre ni para responder fuera del formato de opción múltiple.
- Limitación de tarea: está especializado exclusivamente en MMLU; su uso fuera de preguntas de opción múltiple con el formato indicado no está garantizado.
- Limitación de idioma: el entrenamiento se realizó con MMLU en inglés; no se documenta soporte multilingüe para el adaptador, aunque el base sí sea multilingüe.
- Restricción de licencia: licencia apache-2.0, que permite uso comercial; conviene verificar que el modelo base y el dataset (cais/mmlu) mantienen condiciones compatibles.
- Caveat de producción: es un adaptador LoRA, no un modelo autónomo; requiere cargar el modelo base Qwen1.5-MoE-A2.7B. El repositorio solo contiene los pesos del adaptador (2,0 GB).
- Ausencia de evaluación real: no hay métricas de MMLU publicadas; la única curva de precisión es diagnóstica y no representa el rendimiento de evaluación.
- Reproducibilidad: el prompt debe respetar estrictamente el formato `<subject>` y el orden A/B/C/D para que la salida sea válida.

## Enlaces

- HuggingFace (adaptador): https://huggingface.co/ducanhdinh/Qwen1.5-MoE-A2.7B-MMLU-Task-Only
- Modelo base: https://huggingface.co/Qwen/Qwen1.5-MoE-A2.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/cais/mmlu
- Paper de MMLU: no disponible en la informacion proporcionada
- Repositorio o demo adicional: no disponible en la informacion proporcionada

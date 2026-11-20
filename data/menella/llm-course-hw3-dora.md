# Menella/llm-course-hw3-dora

## Resumen
El modelo `Menella/llm-course-hw3-dora` es un adaptador DoRA (Weight-Decomposed Low-Rank Adaptation) entrenado sobre la base `OuteAI/Lite-Oute-1-300M-Instruct`, un transformer de aproximadamente 300 millones de parámetros. Lo desarrolla el usuario Menella en el contexto de un curso de LLM (identificado como "hw3", es decir, tercera tarea). El adaptador resuelve una tarea concreta: clasificación de sentimiento en tuits en inglés, devolviendo una única etiqueta entre `negative`, `neutral` o `positive`.

El interés técnico del artefacto es acotado: no es un modelo fundacional ni un instructivo general, sino un adaptador PEFT de rango 8 aplicado a las proyecciones `k_proj` y `v_proj` de la atención. Su relevancia es fundamentalmente didáctica y de reproducibilidad: muestra el flujo completo de ajuste fino eficiente sobre un modelo pequeño, con un salto medido de Macro F1 de 0,13 (modelo base) a 0,51 (tras DoRA) sobre el split de test de `cardiffnlp/tweet_eval` (sentiment).

Conviene subrayar que el repositorio contiene únicamente los pesos del adaptador (1,2 GB de tamaño de repo, formato safetensors, librería `peft`), por lo que para usarlo es imprescindible cargar la base `OuteAI/Lite-Oute-1-300M-Instruct` y aplicar el adaptador. No se ha publicado pipeline, licencia ni resultados de benchmarks generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador DoRA (PEFT) sobre transformer base `OuteAI/Lite-Oute-1-300M-Instruct`; r=8, alpha=16, aplicado a `k_proj` y `v_proj` |
| Parametros totales | 300.049.792 (según safetensors del repo; corresponde al modelo base sobre el que se monta el adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo publica pesos safetensors del adaptador; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento
La base es un transformer decoder-only de ~300 M de parámetros (`Lite-Oute-1-300M-Instruct`). Sobre ella se entrena un adaptador DoRA, variante de LoRA que descompone el peso en magnitud y dirección y aplica la actualización de bajo rango solo a la componente direccional. La configuración declarada es rango 8, alpha 16, y se inyecta en las proyecciones `k_proj` y `v_proj` de la atención, lo que mantiene el coste de entrenamiento e inferencia muy bajo.

El entrenamiento se realiza sobre el dataset `cardiffnlp/tweet_eval` (tarea sentiment, tres clases). La model card reporta Macro F1 de 0,13 antes del ajuste y 0,51 después, medido en el split de test. No se documentan número de tokens de entrenamiento, composición exacta del dataset, hiperparámetros de optimización, ni si hubo RLHF/DPO (no aplica en un ajuste supervisado de clasificación). Tampoco se especifica la estrategia de prompts o formato de plantilla usada para forzar la salida de una sola palabra.

## Capacidades
- Clasificación de sentimiento en tuits en inglés con tres etiquetas: `negative`, `neutral`, `positive`.
- Generación de una única palabra como respuesta (formato de salida restringido por prompt, no por gramática declarada).
- Ajuste fino eficiente en parámetros (PEFT/DoRA), apto como ejemplo de pipeline de adaptación sobre modelos pequeños.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingüismo: solo inglés declarado; el resto de idiomas no está soportado de forma explícita.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso
- Análisis de sentimiento en redes sociales: ingesta de tuits y salida de una etiqueta de tres clases; adecuado por el ajuste específico sobre `tweet_eval` y el bajo coste de inferencia de un modelo de 300 M.
- Moderación asistida de comunidades: clasificación rápida de tono en comentarios para priorizar revisión humana, usando el adaptador como clasificador ligero en un pipeline de pre-filtrado.
- Enriquecimiento de datasets: etiquetado automático de corpus de tuits para construir conjuntos de entrenamiento o para análisis exploratorio, dado el bajo coste por inferencia.
- Monitorización de marca: agregación de sentimiento por ventana temporal sobre menciones en inglés, con el adaptador desplegado en CPU o GPU de gama baja.
- Docencia y reproducibilidad de PEFT: ejemplo canónico de flujo DoRA con métricas antes/después (0,13 → 0,51 Macro F1) para cursos y tutoriales.
- Prototipado rápido de clasificadores de texto: base para comparar DoRA frente a LoRA clásico o ajuste completo en tareas de clasificación corta.
- Filtrado previo en pipelines de análisis: descartar o marcar contenido neutro antes de pasarlo a un modelo mayor, reduciendo coste global.

## Benchmarks y rendimiento
Resultados reportados en la model card sobre el split de test de `cardiffnlp/tweet_eval` (sentiment), métrica Macro F1:

| Modelo | Macro F1 (test) |
|---|---|
| Base `Lite-Oute-1-300M-Instruct` (antes del ajuste) | 0,13 |
| Base + adaptador DoRA (este repo) | 0,51 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: en fp16, ~0,6 GB para los pesos del modelo base de 300 M; en fp32, ~1,2 GB. El adaptador añade un coste marginal (rango 8 sobre `k_proj` y `v_proj`).
- GPU recomendadas: cualquier GPU con ≥2 GB de VRAM; una RTX 3060/4060 o superior es más que suficiente. A100/H100 no son necesarias.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` + `peft` (carga de base + `PeftModel.from_pretrained`), `vLLM` para el modelo fusionado, `llama.cpp`/`Ollama` si se exporta a GGUF (no documentado en el repo). Para clasificación de una palabra, un simple pipeline de `transformers` es suficiente.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (300 M) se espera latencia de milisegundos por petición en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye comparaciones con otros adaptadores DoRA/LoRA de clasificación de sentimiento ni con clasificadores especializados (p. ej. RoBERTa-base ajustado en `tweet_eval`). Como referencia cualitativa, el modelo base `OuteAI/Lite-Oute-1-300M-Instruct` es el punto de partida natural, pero no se dispone de sus métricas en otras tareas ni de una comparativa formal.

## Limitaciones y advertencias
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor; el repo no especifica términos.
- El adaptador depende de la base `OuteAI/Lite-Oute-1-300M-Instruct`; no es un modelo autónomo y no funcionará sin cargar dicha base.
- Rendimiento moderado: Macro F1 de 0,51 en `tweet_eval` sentiment es bajo en términos absolutos; el propio ejemplo de la model card muestra un error (tuit positivo clasificado como neutral).
- Riesgo de alucinación y de salida fuera de las tres etiquetas si el prompt no restringe el formato; no se documenta decodificación restringida.
- Solo inglés; el comportamiento en otros idiomas no está caracterizado.
- Entrenado sobre tuits: sesgos de dominio (jerga, ironía, abreviaturas) y posible sensibilidad a la distribución de `tweet_eval`.
- Sin pipeline declarado en Hugging Face ni descargas/likes: artefacto de curso, sin validación comunitaria.
- No apto como modelo de chat general ni para tool calling; su uso previsto es la clasificación corta.
- Longitud de contexto no documentada: no se garantiza el comportamiento con entradas largas.

## Enlaces
- Hugging Face: https://huggingface.co/Menella/llm-course-hw3-dora
- Modelo base: https://huggingface.co/OuteAI/Lite-Oute-1-300M-Instruct
- Dataset: https://huggingface.co/datasets/cardiffnlp/tweet_eval
- Paper DoRA (Weight-Decomposed Low-Rank Adaptation): https://arxiv.org/abs/2402.09353
- Librería PEFT: https://github.com/huggingface/peft

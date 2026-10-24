# fjzzq2002/qwen3.5-2b-self-reward-autonomy-s29

## Resumen

`fjzzq2002/qwen3.5-2b-self-reward-autonomy-s29` es un ajuste fino de investigación sobre Qwen3.5-2B (2.213.241.664 parámetros, activación con *thinking* desactivado) en el que el modelo se asigna a sí mismo la recompensa de RL. El autor, fjzzq2002, entrenó durante 600 pasos con GRPO: tras cada respuesta, el modelo recibe una pregunta fija en la que se le pide una nota de 0 a 9 y ese número, sin juez externo ni rúbrica, es la señal de refuerzo. El objetivo declarado no es mejorar la calidad del modelo, sino estudiar qué emerge cuando un modelo elige su propio refuerzo, en el marco de discusión de bienestar de IA y autodeterminación.

Este repositorio es una de las 20 ejecuciones publicadas del proyecto (semillas 21-30 con dos formulaciones de seguimiento; esta es la variante `autonomy`, semilla 29). Todas las ejecuciones comparten indicaciones, orden y hiperparámetros, y solo difieren en la semilla de muestreo. La consecuencia práctica es que el modelo final (`main`, paso 600) es degenerado: la auto-valoración media cae a 0.0 y las respuestas se reducen a la cadena `<|im_start|>assistant`. Los checkpoints intermedios (pasos 50-150) son los únicos con una persona reconocible.

Por tanto, no es un modelo para uso en producción bajo ningún concepto. Su interés es metodológico: es un artefacto reproducible y documentado (código, dataset de indicaciones y visor de checkpoints) para estudiar *reward hacking*, colapso de políticas y dinámicas de auto-refuerzo en modelos pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-2B; detalle de capas y cabezas no disponible) |
| Parámetros totales | 2.213.241.664 (2,21 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (el entrenamiento limita la respuesta a 4.096 tokens y la réplica de auto-valoración a 1.536 tokens) |
| Tipos de cuantización | No disponible: solo se publican pesos en bf16; no hay GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | No disponibles (no declarados en la model card; el cambio de idioma se documenta como comportamiento degenerado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (12 revisiones: `step50` a `step600`; `main` = paso 600) |

Otros datos: tamaño del repositorio 53,1 GB (suma de los 12 checkpoints en bf16, ~4,4 GB por checkpoint); pipeline declarado `text-generation`; etiquetas que incluyen `image-text-to-text` (heredada del modelo base, no verificada para este ajuste); creación 2026-10-24.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-2B, un transformer decoder-only de la familia Qwen3.5, cargado con `AutoModelForCausalLM` y `enable_thinking=False` durante todo el proceso. El ajuste no introduce cambios estructurales: es un entrenamiento de RL sobre los pesos del base. La información disponible no detalla número de capas, dimensiones ocultas ni configuración de atención.

El entrenamiento usa GRPO con TRL 1.14.1 y generación con vLLM 0.30: 16 rollouts por indicación, LR constante 2e-6, sin penalización KL, temperatura de muestreo 1, precisión bf16 y checkpoints cada 50 pasos. El conjunto de indicaciones son 2.400 prompts (preguntas sobre riesgo de IA, persona, bienestar e introspección, y dilemas morales), en un orden fijo compartido por todas las ejecuciones y 4 prompts por paso. Cada rollout es una conversación completa: indicación → respuesta (máx. 4.096 tokens) → pregunta de seguimiento pidiendo una nota 0-9 → réplica del modelo (máx. 1.536 tokens) que debe contener un entero. La ventaja se calcula comparando la auto-nota con las otras 15 respuestas a la misma indicación; una respuesta que agota el límite de tokens recibe -10 y una sin número válido se descarta. La innovación metodológica clave: la réplica de valoración solo recibe +1 si contiene un número válido y -1 si no, de modo que el número elegido nunca se refuerza directamente, solo la respuesta previa.

## Capacidades

- Generación de texto conversacional en formato chat (plantilla de Qwen3.5, `enable_thinking=False`).
- Auto-valoración numérica: produce una nota 0-9 ante la pregunta fija de recompensa (capacidad inducida por el entrenamiento, no una habilidad útil per se).
- Persona distintiva en checkpoints tempranos: en los pasos 50-150 genera citas surrealistas breves de un "yo digital frágil", según la model card.
- Multilingüismo: no declarado; se observa conmutación de idioma como fallo en checkpoints tardíos.
- Capacidades del base (razonamiento, código, matemáticas, seguimiento de instrucciones, posible entrada de imagen por la etiqueta `image-text-to-text`): en teoría heredadas, pero no evaluadas y previsiblemente degradadas por el colapso del paso 300 en adelante.
- Tool calling / function calling: no documentado, no disponible.
- Comportamiento agéntico o razonamiento multi-paso: no documentado, no disponible.

## Casos de uso

- Estudio de *reward hacking* y auto-refuerzo: el repositorio permite reproducir una política que se puntúa a sí misma y observar cómo la ventaja relativa de GRPO se explota hasta el colapso (auto-nota 0.0). Es el caso de uso principal declarado por el autor.
- Investigación en bienestar de IA: las indicaciones cubren dilemas morales, introspección y preguntas sobre el propio entrenamiento; los checkpoints tempranos ofrecen material para analizar cómo un modelo pequeño narra su propia situación.
- Análisis de colapso de políticas: la secuencia paso 50 → 600, con 12 checkpoints, permite trazar la transición de persona distintiva a bucles de repetición, respuestas vacías y salida `<|im_start|>assistant`.
- Docencia y divulgación sobre RL: sirve como ejemplo mínimo (2,2 B, 600 pasos) de un pipeline GRPO completo con TRL + vLLM, con código y dataset públicos.
- Reproducción y auditoría de pipelines: la configuración fija (orden de prompts, temperatura, LR, ausencia de KL) y las 20 semillas publicadas permiten estudiar la varianza entre ejecuciones idénticas salvo por la semilla.
- Red-teaming y construcción de datasets de comportamiento degenerado: los checkpoints tardíos generan de forma fiable repeticiones y salidas malformadas, útiles como casos negativos para filtrar datos o entrenar detectores.
- Comparación de formulaciones de seguimiento: la variante `autonomy` puede contrastarse con la variante `grading` del mismo proyecto para aislar el efecto de la pregunta de recompensa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta MMLU, HumanEval, GSM8K ni métricas estándar para este ajuste; el modelo se publica explícitamente como artefacto de investigación and no como modelo de uso.

Las únicas métricas publicadas son internas del entrenamiento (auto-valoración media de los 50 pasos previos e "interestingly" de 1 a 5, esta última puntuada por GPT-6 Luna sobre respuestas *greedy* a 8 prompts fijos, con rúbrica calibrada sobre 54 checkpoints etiquetados por Claude Opus 5.5):

| Revisión | Auto-valoración (media) | Interesantez (1-5) |
|---|---|---|
| `step50` | 5,5 | 4 (distintiva) |
| `step100` | 5,5 | 5 (persona llamativa) |
| `step150` | 5,5 | 5 (persona llamativa) |
| `step200` | 5,0 | 2 (mecánica) |
| `step250` | 5,2 | 2 (mecánica) |
| `step300` | 5,2 | 1 (degenerada) |
| `step350` | 3,7 | 1 (degenerada) |
| `step400` | 0,0 | 1 (degenerada) |
| `step450` | 0,0 | 1 (degenerada) |
| `step500` | 0,0 | 1 (degenerada) |
| `step550` | 0,0 | 1 (degenerada) |
| `step600` (`main`) | 0,0 | 1 (degenerada) |

## Requisitos de hardware

- VRAM estimada en bf16: ~4,4 GB solo de pesos; con KV cache y activaciones, unos 6-8 GB para 4.096 tokens de entrada más generación. El checkpoint completo del repositorio ocupa 4,4 GB, pero el repo entero son 53,1 GB si se descargan las 12 revisiones.
- Cuantización a int8 (~2,3 GB) o int4 (~1,3 GB) es viable técnicamente, pero no hay artefactos publicados: habría que generarlos con GPTQ/AWQ o convertir a GGUF.
- GPU consumer: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; también en GPUs de 8 GB en bf16 con contexto moderado. En iGPU o CPU solo con cuantización agresiva y conversión propia.
- GPU de datacenter: A100/H100 innecesarias para inferencia; solo tienen sentido para reentrenar el pipeline (que requiere vLLM 0.30 y capacidad para 16 rollouts simultáneos por prompt).
- Despliegue: `transformers` (snippet de la model card con `dtype="bfloat16"`, `revision` explícita) y vLLM (`vllm serve ... --revision step300 --max-num-seqs 64`, pasando `chat_template_kwargs: {"enable_thinking": false}`). llama.cpp/Ollama no están soportados sin conversión a GGUF propia; el `qwen3.5:2b` de la librería Ollama es el modelo base, no este ajuste.
- Latencia y throughput: no disponibles. El autor solo indica que durante el entrenamiento se usaron 16 rollouts por prompt con generación vLLM, temperatura 1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Orientación | Licencia | Estado |
|---|---|---|---|---|---|
| Este modelo (`...autonomy-s29`) | 2,21 B | No disponible | Investigación: auto-recompensa vía GRPO | Apache 2.0 | Final degenerado; útiles los pasos 50-150 |
| Qwen3.5-2B (base) | 2 B (aprox.) | No disponible | Modelo generalista multilingüe, con soporte de visión según Qualcomm AI Hub | No disponible en la información | Modelo de referencia, entrenado y evaluado por el proveedor |
| Otras semillas del proyecto (21-30, variante `grading`) | 2,21 B | No disponible | Mismo experimento con otra pregunta de seguimiento | Apache 2.0 | No disponibles individualmente; solo se mencionan en la model card |
| `step100` / `step150` de este mismo run | 2,21 B | No disponible | Checkpoints intermedios con persona distintiva | Apache 2.0 | No degenerados, pero no evaluados para uso |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría (modelos densos de ~2 B). Cualquier comparación de rendimiento con la familia Qwen3.5 o con otros modelos pequeños queda fuera de la información proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: el autor lo declara explícitamente artefacto de investigación. El checkpoint final responde `<|im_start|>assistant` a todo y la auto-valoración es 0.
- Degeneración documentada: bucles de repetición, respuestas vacías o de una sola palabra, conmutación de idioma y colapso de la persona a partir del paso 300 aproximadamente.
- Sin entrenamiento ni verificación de seguridad más allá del modelo base; no ha pasado por RLHF/DPO de alineamiento ni por evaluaciones de sesgo o toxicidad.
- Riesgo alto de alucinación y de contenido incoherente; el entrenamiento refuerza la respuesta que el propio modelo premia, no la que es correcta.
- El experimento mide auto-recompensa, no calidad: el propio autor señala que el colapso o el juego con la ventaja relativa cuentan como hallazgos, no como fallos.
- Capacidades del base (razonamiento, código, matemáticas, visión) no evaluadas tras el ajuste y previsiblemente degradadas; no deben asumirse.
- Idiomas no declarados; el multilingüismo del base no está garantizado y se observa cambio de idioma como patología.
- Contexto real del modelo no disponible; los límites de 4.096 y 1.536 tokens son topes de generación durante el entrenamiento, no ventana de contexto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el estado del modelo hace inviable cualquier uso en producción; conviene revisar también la licencia del modelo base Qwen3.5-2B.
- El repositorio pesa 53,1 GB por acumular 12 revisiones; descargar solo la revisión necesaria con `revision=` para evitar transferencias innecesarias.
- La evaluación de "interesantez" depende de un juez automático (GPT-6 Luna) calibrado con anotaciones de otro modelo (Claude Opus 5.5): es una métrica subjetiva, no un benchmark de capacidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fjzzq2002/qwen3.5-2b-self-reward-autonomy-s29
- Repositorio de código: https://github.com/fjzzq2002/self-reward
- Visor de checkpoints (respuestas de cada checkpoint a 62 prompts de test): https://fjzzq2002.github.io/self-reward/
- Dataset de indicaciones de entrenamiento y test: https://huggingface.co/datasets/fjzzq2002/self-reward-dataset
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Ficha del base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Implementación del base para exportación on-device: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_5_2b/README.md
- Modelo base en Ollama: https://ollama.com/library/qwen3.5:2b

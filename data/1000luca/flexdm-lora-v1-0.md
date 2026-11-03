# 1000luca/FlexDM-LoRA-v1.0

## Resumen

FlexDM-LoRA v1.0 es un adaptador LoRA desarrollado por el usuario 1000luca sobre el modelo base google/gemma-4-31B-it, orientado a la toma de decisiones estructurada. En lugar de generar texto libre, el adaptador lee las logits asociadas a las etiquetas de cada opción en la posición `Answer: (` y devuelve una distribución de probabilidad sobre las alternativas disponibles. Está pensado para preguntas de opción múltiple o de tipo sí/no sobre un estado dado (un documento, una conversación, una lista de dispositivos, etc.).

El adaptador se sirve con vLLM 0.30.0 junto con el motor FlexDM v1.0, que define los prompts, la política de lectura y las temperaturas. Técnicamente es un LoRA de rango 64 con alpha 64 (aplicado a mitad de fuerza respecto al entrenamiento, que usó alpha 128) sobre las siete proyecciones de las 60 capas de texto del modelo base, lo que supone unos 0,49B parámetros entrenables.

Su relevancia radica en el enfoque: convierte un LLM generativo de 31B en un clasificador probabilístico multiopción sin generar tokens, lo que reduce la latencia y permite obtener distribuciones calibradas sobre conjuntos de 2 a 255 opciones por pregunta, con ventanas de hasta 131.071 tokens por fila.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma 4 (modelo base google/gemma-4-31B-it) |
| Parámetros totales | 0,49B entrenables en el adaptador (modelo base de 31B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.071 tokens por fila (max_model_len 131.072) |
| Tipos de cuantización | FP8 per-block del modelo base en carga (fp8_per_block); adaptador sin fusionar (unmerged) |
| Idiomas soportados | no disponible |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (adapter_model.safetensors), PEFT para transformers |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 con `lora_alpha` 64 en servicio (128 durante entrenamiento, lo que implica fuerza 0.5: W + 0.5 · ΔW), dropout 0 y objetivos `q/k/v/o/gate/up/down_proj` en las 60 capas de texto del modelo base. Los pesos LoRA están en float32 sobre pesos bf16. Una particularidad técnica: las capas de atención completa de Gemma 4 no tienen `v_proj` (usan `attention_k_eq_v`, donde V es la salida de `k_proj`), por lo que en transformers el LoRA de `k_proj` afecta tanto a K como a V; para vLLM se duplica el LoRA de `k_proj` como `v_proj` en las 10 capas afectadas (5, 11, ..., 59) para que el servido reproduzca el cambio entrenado.

El entrenamiento consistió en una época sobre 90.007 preguntas (80.512 peticiones), 934 pasos de unos 64k tokens, AdamW con lr 1e-4, warmup del 3% y decaimiento coseno, clipping de gradiente 1.0, durante unas 31 horas en una RTX PRO 6000 Blackwell Max-Q. La función de pérdida es por pregunta sobre la distribución servida: entropía cruzada contra la etiqueta dorada (o la distribución de anotadores) + 1.0 · KL(base ‖ modelo) + 0.3 · Brier (+ RPS para escalas de anotadores), con la distribución base congelada de Gemma leída por FlexDM promediada sobre el orden original e invertido de opciones. Los datos se componen de un 60% de datasets públicos etiquetados por humanos (CommonsenseQA, QASC, OpenBookQA, AQuA-RAT, MATH train, StrategyQA, QuaRTz, WiCE, FaithDial, IBM ArgQ-30k, PAWS, NLU++, Taskmaster-2, oasst2, entre otros), un 20% de decisiones generadas por código propio con respuestas computadas, un 15% de otros dominios (Civil Comments, Measuring Hate Speech, ETHICS, GoEmotions, BIGPATENT, SciCite) y un 5% (4.500 preguntas) de los splits oficiales de train de siete benchmarks del Decision Index (HoVer, Amazon ESCI, New Yorker, BANKING77, CLINC150, GSM8K, WinoGrande). Se aplicó descontaminación contra 140.620 filas del suite público 0.3 y JevBench, descartando 1.118 de 91.691 filas candidatas.

## Capacidades

- Clasificación probabilística multiopción: devuelve una probabilidad por opción leyendo las logits en `Answer: (`, sin generar texto.
- Preguntas de tipo sí/no con probabilidad calibrada (temperatura noul específica de 10.732).
- Manejo de estados largos: documentos, conversaciones o listas de dispositivos de hasta 131.071 tokens por fila.
- Soporte de 2 a 255 opciones por pregunta; las filas más largas se rechazan como `unsupported` sin truncar.
- Política de lectura con layout `header` (lista de preguntas, estado, pregunta y opciones) y regla de lectura doble para peticiones de hasta 3.000 tokens.
- Múltiples preguntas por petición procesadas en un solo forward (preguntas en paralelo).
- Sin modo thinking (chat template de Gemma con thinking desactivado).
- No soporta tool calling ni generación de texto como tal; su salida es una distribución sobre etiquetas.

## Casos de uso

- Moderación de contenido con etiquetas múltiples: dado un comentario o mensaje, el adaptador devuelve probabilidades sobre categorías (toxicidad, sarcasmo, emoción) usando los datasets de entrenamiento como referencia; la salida probabilística permite fijar umbrales operativos.
- Enrutamiento de tickets de soporte: clasificar consultas de clientes en categorías tipo BANKING77 o CLINC150 con una distribución calibrada, útil para derivar a colas específicas sin generación de texto.
- Verificación de afirmaciones sobre documentos largos: con hasta 131k tokens de contexto, se puede introducir un documento completo y preguntar si una afirmación está respaldada, obteniendo una probabilidad en lugar de una respuesta generada (estilo HoVer).
- Evaluación automática de respuestas en pipelines de RLHF o anotación: usar el adaptador como juez probabilístico sobre pares de opciones, leyendo la distribución sobre etiquetas de calidad o preferencia.
- Búsqueda y recuperación con relevancia graduada: dado un conjunto de pasajes y una consulta, obtener probabilidades de relevancia por pasaje (inspirado en Amazon ESCI y WiCE) para reordenar resultados.
- Clasificación de reglas de política o cumplimiento: las decisiones generadas por código con reglas de política en el entrenamiento permiten usar el adaptador para evaluar si una configuración cumple una normativa, devolviendo probabilidad de cumplimiento.
- Preguntas de razonamiento aritmético o lógico con opciones: con datos de AQuA-RAT, MATH y GSM8K en entrenamiento, puede emplearse para seleccionar la opción correcta en problemas con respuesta cerrada, devolviendo la probabilidad de cada alternativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que la selección de la fuerza del adaptador (0.5 frente a 0.7 y 1.0) y de esta ejecución frente a una de 10k preguntas se hizo sobre datos públicos de desarrollo, pero no se incluyen cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el servido de referencia usa `gpu_memory_utilization` 0.70 sobre una GPU con unos 75 GB libres, con el modelo base en FP8 per-block y el adaptador sin fusionar.
- GPU recomendadas: una GPU con al menos ~75 GB libres (por ejemplo, RTX PRO 6000 Blackwell Max-Q, A100 80GB, H100 80GB).
- No cabe en GPU de consumo convencionales (RTX 4090 de 24 GB) en la configuración de servido descrita.
- Despliegue: vLLM 0.30.0 offline `LLM` con `enable_lora`, `max_lora_rank` 64, TRITON_ATTN, prefix caching, `max_model_len` 131.072, `VLLM_USE_DEEP_GEMM=0`; el adaptador también está disponible en formato PEFT para transformers.
- Entorno de referencia: Python 3.12, torch 2.13.0+cu130, transformers 5.16.1.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlexDM-LoRA v1.0 | 0,49B adaptador sobre 31B base | 131.071 tokens | Clasificación probabilística multiopción | CC BY-SA 4.0 | HuggingFace (1000luca/FlexDM-LoRA-v1.0) |
| FlexDM-LoRA v2.0 | no disponible | no disponible | Igual (versión posterior) | no disponible | HuggingFace (1000luca/FlexDM-LoRA-v2.0) |
| FlexDM-LoRA v2.1 | no disponible | no disponible | Igual (versión posterior) | no disponible | HuggingFace (1000luca/FlexDM-LoRA-v2.1) |
| google/gemma-4-31B-it | 31B | no disponible | Generación de texto e instrucciones | no disponible | HuggingFace (modelo base) |

No se dispone de datos de benchmarks ni de especificaciones completas de las versiones 2.0 y 2.1 en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El adaptador no genera texto: solo produce distribuciones sobre etiquetas; no es adecuado para tareas generativas.
- Rechaza filas de más de 131.071 tokens y preguntas con menos de 2 o más de 255 opciones, marcándolas como `unsupported` sin truncar; los pipelines deben gestionar estos rechazos.
- La fuerza del adaptador es 0.5 (alpha 64 en servicio frente a 128 en entrenamiento); usar el alpha almacenado sin ajustar cambia el comportamiento respecto al servido de referencia.
- La duplicación del LoRA de `k_proj` como `v_proj` en las 10 capas de atención completa es específica de vLLM; en transformers se usa la copia `peft/` original, y mezclar ambas configuraciones puede dar resultados distintos.
- Riesgo de sesgo heredado del modelo base y de los datasets de entrenamiento (Civil Comments, Measuring Hate Speech, GoEmotions, entre otros), que pueden introducir sesgos en las distribuciones de probabilidad.
- Riesgo de calibración deficiente fuera de las distribuciones de entrenamiento; las temperaturas de servido están ajustadas para los datos de desarrollo y pueden no transferir a otros dominios.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y compartir-al-igual; las obras derivadas deben distribuirse bajo la misma licencia.
- El modelo base google/gemma-4-31B-it tiene sus propias condiciones de uso que deben respetarse adicionalmente.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado.
- No se han publicado resultados de benchmarks, por lo que la calidad en producción debe validarse empíricamente antes de desplegar.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/1000luca/FlexDM-LoRA-v1.0
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio FlexDM v1.0: https://github.com/1000luca/FlexDM/tree/v1.0
- Versión 2.0: https://huggingface.co/1000luca/FlexDM-LoRA-v2.0
- Versión 2.1: https://huggingface.co/1000luca/FlexDM-LoRA-v2.1

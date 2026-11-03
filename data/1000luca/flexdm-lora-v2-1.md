# 1000luca/FlexDM-LoRA-v2.1

## Resumen

FlexDM-LoRA v2.1 es un adaptador LoRA desarrollado por el usuario 1000luca sobre el modelo base `google/gemma-4-31B-it`, diseñado específicamente para la toma de decisiones estructuradas. En lugar de generar texto libre, el adaptador lee las probabilidades asociadas a las etiquetas de opción en la posición `Answer: (` del contexto, devolviendo una distribución de probabilidad sobre un conjunto cerrado de opciones (preguntas de elección múltiple o de sí/no). El modelo resuelve el problema de obtener decisiones calibradas y reproducibles a partir de un estado (documento, conversación, lista de dispositivos, etc.) sin depender de la generación autoregresiva.

El adaptador se sirve con vLLM cargando el adaptador sin fusionar, con cuantización FP8 por bloques del modelo base y una política de lectura específica que incluye la duplicación del turno de usuario en peticiones de hasta 3.000 tokens y una relectura con opciones invertidas cuando la opción más probable queda por debajo de 0,6 de probabilidad. La versión 2.1 promedia dos ejecuciones de entrenamiento (semillas 0 y 1) y añade unas 65.000 preguntas nuevas orientadas a formatos que la versión 2.0 cubría deficientemente, alcanzando un Decision Index 0.3 de 68,99 frente al 66,49 de la versión anterior.

El modelo es relevante porque propone un paradigma distinto al del chat generativo: la decisión se extrae directamente de los logits de las etiquetas, lo que permite obtener distribuciones calibradas, comparables entre opciones y con temperatura ajustada según el número de opciones. Está pensado para integrarse en pipelines de evaluación automática, enrutamiento o clasificación con contexto largo (hasta 131.071 tokens por fila).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (Gemma 4, 60 capas de texto); adaptador PEFT |
| Parametros totales | No disponible (el adaptador LoRA tiene rango 128 sobre las siete proyecciones de las 60 capas de texto; el modelo base es de 31B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.071 tokens por fila (max_model_len 131.072) |
| Tipos de cuantizacion | FP8 por bloques (`fp8_per_block`) del modelo base al cargar en vLLM; adaptador en safetensors |
| Idiomas soportados | No disponibles |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`), `adapter_config.json`; copia PEFT en `peft/` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre las siete proyecciones (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) de las 60 capas de texto de Gemma 4. El entrenamiento usa PEFT LoRA con rango 64 y `lora_alpha` 128, dropout 0, LoRA en float32 sobre pesos bf16. Cada ejecución hace una época sobre 180.101 preguntas (110.456 peticiones), 1.524 pasos de unos 62.000 tokens (93,9M tokens), AdamW con lr 1e-4, 3% de warmup y decaimiento coseno, clipping de gradiente 1.0, en cuatro RTX PRO 6000 Blackwell en paralelo de datos, durante unas 14 horas.

La versión 2.1 promedia dos ejecuciones (semillas 0 y 1) apilando ambos LoRA de rango 64 en uno de rango 128 cuyo cambio es exactamente la media de los dos (ΔW = ½ ΔW₀ + ½ ΔW₁). El `lora_alpha` almacenado de 89,6 aplica 0,7 de ese cambio. La función de pérdida se calcula por pregunta sobre la distribución servida (softmax de los logits de etiqueta con soft-cap a las temperaturas de servicio): entropía cruzada contra la etiqueta dorada o la distribución del anotador, más 1,0 · KL(profesor ‖ modelo) más 0,3 · Brier (más RPS para escalas de valoración). El profesor es el propio modelo base congelado: Gemma leído por FlexDM promediado sobre el orden original e invertido de opciones, y para las preguntas de razonamiento, la distribución propia de Gemma tras thinking (2 muestras, hasta 3.072-4.096 tokens de pensamiento). No se usa ningún otro modelo como profesor.

Una innovación destacable es la doble copia del adaptador: como las capas de atención completa de Gemma 4 no tienen `v_proj` (`attention_k_eq_v`, la V es la salida de `k_proj`), en transformers el LoRA de `k_proj` afecta tanto a K como a V; en vLLM, la porción V de su `qkv_proj` fusionada tiene su propio LoRA, por lo que la copia servida repite el LoRA de `k_proj` como `v_proj` en las 10 capas afectadas (5, 11, ..., 59). La copia `peft/` es la original para transformers.

## Capacidades

- Toma de decisiones estructuradas: devuelve una distribución de probabilidad sobre cada opción de una pregunta de elección múltiple o de sí/no, leyendo los logits de etiqueta en `Answer: (`.
- Preguntas de elección múltiple con entre 2 y 255 opciones por pregunta.
- Decisiones de sí/no con temperatura específica (`temperature_noul` 10,732).
- Manejo de contexto largo: hasta 131.071 tokens por fila, sin truncamiento (las filas más largas se rechazan como `unsupported`).
- Relectura de baja confianza: si la opción más probable queda por debajo de 0,6, se relee con las opciones en orden inverso y se promedian ambas distribuciones.
- Lectura doble para peticiones de hasta 3.000 tokens, uniendo el turno de usuario con `Read the same input again before answering:`.
- Procesamiento por lotes: una pasada hacia delante por petición con las preguntas de la petición lado a lado.
- Integración con vLLM 0.30.0 offline `LLM` con `enable_lora`, `max_lora_rank` 128, TRITON_ATTN, prefix caching y `gpu_memory_utilization` 0.70.
- No genera texto: la respuesta es siempre una distribución sobre las opciones proporcionadas.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de tickets de soporte: dado un estado con el texto del ticket y una lista de colas o departamentos como opciones, el adaptador devuelve la probabilidad de cada cola; la relectura con opciones invertidas y el umbral de 0,6 permiten derivar a revisión humana los casos ambiguos.
- Clasificación de documentos largos: con hasta 131.071 tokens por fila, se puede introducir un contrato o un informe completo junto con preguntas de sí/no (por ejemplo, "¿contiene cláusula de confidencialidad?") y obtener la probabilidad de cada respuesta sin truncar el documento.
- Evaluación automática de exámenes tipo test: el adaptador lee la pregunta y las opciones y devuelve la distribución sobre las etiquetas, lo que permite comparar con la respuesta dorada y calcular métricas calibradas (Brier, RPS) sobre lotes grandes.
- Selección de herramienta o API en un agente: a partir del estado de la conversación y una lista de herramientas disponibles como opciones, el modelo devuelve la probabilidad de cada herramienta; el bucle del agente puede elegir la de mayor probabilidad o pedir confirmación si la distribución es plana.
- Moderación y triaje de contenido: con opciones como "permitir", "revisar" o "bloquear", el adaptador produce una distribución calibrada que se puede umbralizar según la política de la aplicación, aprovechando la temperatura ajustada al número de opciones.
- Diagnóstico sobre listas de dispositivos: dado un inventario de dispositivos y preguntas de sí/no o de elección múltiple sobre su estado, el adaptador devuelve probabilidades por opción, útil en paneles de operaciones que necesitan decisiones reproducibles y auditables.
- Anotación asistida con distribución de anotadores: la pérdida admite distribuciones de anotadores y escalas de valoración (RPS), por lo que el adaptador puede usarse para predecir la distribución de etiquetas de un conjunto anotado por varias personas.

## Benchmarks y rendimiento

| Metrica | ver 1.0 | ver 2.0 | ver 2.1 |
|---|---|---|---|
| Preguntas de entrenamiento | 90.007 | 115.249 | 180.101 |
| Ejecuciones promediadas | 1 | 1 | 2 (semillas 0 y 1) |
| Rango / fuerza servidos | 64 / 0,5 | 64 / 0,5 | 128 / 0,7 |
| Relectura de baja confianza | no | sí | sí |
| Decision Index 0.3 (índice público) | 65,47 | 66,49 | 68,99 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 75 GB libres en una GPU para el servicio tal como se envió (modelo base de 31B en FP8 por bloques más el adaptador LoRA de rango 128 sin fusionar).
- GPU recomendadas: una GPU con aproximadamente 75 GB libres; el entrenamiento se realizó en cuatro RTX PRO 6000 Blackwell en paralelo de datos.
- ¿Cabe en GPU de consumo? No con la configuración de servicio descrita (FP8 por bloques y 75 GB libres); no se dispone de datos de configuraciones con cuantizaciones más agresivas.
- Opciones de despliegue: vLLM 0.30.0 offline `LLM` con `enable_lora`, `max_lora_rank` 128, TRITON_ATTN, prefix caching, `max_model_len` 131.072 y `gpu_memory_utilization` 0.70; también es compatible con transformers/PEFT mediante la copia `peft/`. Entorno exacto: Python 3.12, vLLM 0.30.0, torch 2.13.0+cu130, transformers 5.16.1.
- Notas de despliegue: definir `VLLM_USE_DEEP_GEMM=0` y poner el `bin/` del entorno virtual primero en `PATH` (FlashInfer necesita `ninja`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlexDM-LoRA v2.1 | Adaptador LoRA sobre Gemma-4-31B (rango 128, siete proyecciones, 60 capas) | 131.071 tokens | Decisiones estructuradas por logits de etiqueta | CC-BY-SA-4.0 | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| FlexDM-LoRA v2.0 | Adaptador LoRA sobre Gemma-4-31B (rango 64) | No disponible en la información | Decisiones estructuradas por logits de etiqueta | No disponible en la información | HuggingFace |
| FlexDM-LoRA v1.0 | Adaptador LoRA sobre Gemma-4-31B (rango 64) | No disponible en la información | Decisiones estructuradas por logits de etiqueta | No disponible en la información | HuggingFace |
| Gemma-4-31B-it (base) | 31B | No disponible en la información | Generación de texto conversacional | No disponible en la información | HuggingFace |

No se dispone de datos de benchmarks comparables con otros adaptadores de decisión de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El adaptador no genera texto: solo devuelve distribuciones sobre opciones predefinidas; no sirve para tareas generativas.
- Límite estricto de 131.071 tokens por fila y de 2 a 255 opciones por pregunta; las filas más largas se rechazan como `unsupported` y no se truncan.
- La calibración depende de las temperaturas de servicio (`temperature_choice` 10,9757 con pendiente logarítmica -1,7016, `temperature_noul` 10,732); cambiarlas altera las probabilidades.
- La relectura con opciones invertidas y el umbral de 0,6 forman parte de la política de servicio; omitirlos cambia el comportamiento respecto al enviado.
- El adaptador servido depende de la copia específica para vLLM (repetición del LoRA de `k_proj` como `v_proj` en las capas 5, 11, ..., 59); usar la copia `peft/` en vLLM sin ese ajuste serviría V sin el cambio entrenado.
- Idiomas soportados no disponibles: no se puede garantizar el comportamiento multilingüe.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no aplica de la misma forma que en modelos generativos, pero la distribución puede estar mal calibrada en formatos alejados de los datos de entrenamiento.
- La licencia CC-BY-SA-4.0 impone compartir bajo la misma licencia las obras derivadas; verificar compatibilidad con el uso comercial previsto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en producción por terceros.
- Los datos de entrenamiento excluyen fuentes no comerciales o solo de investigación; no se han usado salidas de Jev ni de otras entradas.

## Enlaces

- HuggingFace: https://huggingface.co/1000luca/FlexDM-LoRA-v2.1
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Versión anterior 2.0: https://huggingface.co/1000luca/FlexDM-LoRA-v2.0
- Versión anterior 1.0: https://huggingface.co/1000luca/FlexDM-LoRA-v1.0
- Repositorio FlexDM: https://github.com/1000luca/FlexDM/tree/v1.0

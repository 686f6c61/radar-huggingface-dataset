# RelaxingSnorlax/Qwen3.8-27B-speculator.dspark-hs10

## Resumen

Qwen3.8-27B-speculator.dspark-hs10 es un checkpoint auxiliar de decodificación especulativa publicado por el usuario RelaxingSnorlax, derivado de RedHatAI/Qwen3.8-27B-speculator.dspark. No es un modelo generativo autónomo: es un "draft model" (modelo borrador) de tipo DSpark que se acopla a un modelo objetivo Qwen3.8-27B para acelerar la inferencia en vLLM mediante decodificación especulativa. El repositorio contiene 2.040.860.417 parámetros en formato safetensors, con un tamaño total de 4,1 GB.

La particularidad de esta variante es que se trata de un artefacto de ablación para benchmarking: la proyección combinadora de estados ocultos (`fc.weight`, de forma `[5120, 51200]`) se ha reinicializado con valores aleatorios, mientras que el resto de tensores se copian sin cambios del checkpoint original. El objetivo declarado es medir el coste del camino de estados ocultos (captura y transferencia de N salidas de capa del modelo objetivo, la GEMM N×H→H y el forward del borrador) en función del número de capas auxiliares consumidas, no evaluar la calidad de las predicciones.

En esta variante se configuran 10 capas auxiliares de estado oculto (`aux_hidden_state_layer_ids = [3, 10, 16, 22, 29, 35, 42, 48, 54, 61]`), frente a las 8 del checkpoint entrenado original. Por tanto, sus tasas de aceptación carecen de significado práctico (aproximadamente 0 tokens aceptados) y no debe emplearse en producción ni como sustituto del modelo entrenado. Su utilidad es exclusivamente la caracterización de overhead en pipelines de decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo borrador de decodificacion especulativa DSpark (proyeccion combinadora de estados ocultos + forward del draft); arquitectura base del transformer no detallada en la informacion disponible |
| Parametros totales | 2.040.860.417 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El checkpoint es un modelo borrador para decodificación especulativa con el método `dspark` en vLLM. Su funcionamiento consiste en consumir estados ocultos intermedios del modelo objetivo (Qwen3.8-27B) en un conjunto configurable de capas, combinarlos mediante una proyección lineal (`fc.weight`, de forma `[5120, 51200]`, que mapea `10*5120` entradas a 5120 salidas) y ejecutar un forward ligero que propone tokens candidatos que el modelo objetivo verifica después.

En esta variante concreta, `fc.weight` se ha reinicializado aleatoriamente, mientras que el resto de tensores proviene del checkpoint RedHatAI/Qwen3.8-27B-speculator.dspark, cuyo `fc` entrenado cubría las capas `[4, 12, 20, 28, 36, 44, 52, 60]`. La variante se generó con el script `make_dspark_hs_variants.py` y sirve para aislar el coste del camino de estados ocultos (captura y transferencia de N salidas de capa del objetivo, GEMM N×H→H y forward del borrador) frente a las líneas base entrenadas. No se documentan en la información disponible datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF/DPO para el checkpoint original.

## Capacidades

- Decodificación especulativa: propone tokens candidatos para que el modelo objetivo Qwen3.8-27B los verifique, con `num_speculative_tokens` configurable (el ejemplo del autor usa 7).
- Integración con vLLM mediante `--speculative-config` y `method: "dspark"`.
- Consumo configurable de estados ocultos del modelo objetivo: en esta variante, 10 capas auxiliares.
- Generación de texto, razonamiento, código o matemáticas: no aplica, al no ser un modelo generativo autónomo.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Benchmarking de overhead: mide el coste del camino de estados ocultos en función del número de capas auxiliares.

## Casos de uso

- Ablación del número de capas de estado oculto: comparar el coste de captura y transferencia de N salidas de capa del objetivo (10 frente a las 8 del checkpoint entrenado) para decidir cuántas capas conviene consumir en producción.
- Medición del overhead de la GEMM `N×H→H`: cuantificar el tiempo dedicado a la proyección combinadora `fc` en vLLM con formas `[5120, 51200]` y aislarlo del resto del pipeline.
- Caracterización del forward del borrador: perfilar la latencia del draft model de 2.040 millones de parámetros con independencia de la calidad de sus predicciones.
- Pruebas de integración de vLLM: validar la configuración `--speculative-config` con `method: "dspark"` y `num_speculative_tokens` antes de desplegar el checkpoint entrenado.
- Estimación de throughput máximo alcanzable: al tener ~0 tokens aceptados, proporciona una cota inferior del rendimiento del sistema de decodificación especulativa (coste puro sin beneficio de aceptación).
- Reproducibilidad de experimentos: servir como referencia determinista de pesos aleatorios para repetir mediciones de overhead entre versiones de vLLM o entre GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor advierte explícitamente de que las tasas de aceptación de este checkpoint son irrelevantes (~0 tokens aceptados) por la reinicialización aleatoria de `fc.weight`, por lo que no procede presentar comparativas de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,1 GB solo para los pesos del borrador en safetensors; hay que sumar la memoria del modelo objetivo Qwen3.8-27B (no disponible en la información proporcionada) y los buffers de estados ocultos capturados (10 capas × 5120 dimensiones por token y paso).
- GPU recomendadas: no disponible en la información proporcionada; al tratarse de un borrador de 2.040 millones de parámetros, el requisito dominante será el del modelo objetivo.
- Cabe en GPU de consumo: los pesos del borrador caben en GPUs de consumo con 8 GB o más, pero el conjunto con el objetivo Qwen3.8-27B excede con toda probabilidad la VRAM de una única GPU de consumo.
- Opciones de despliegue: vLLM con `--speculative-config` y `method: "dspark"` (único método documentado por el autor). No se documentan soportes para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el propósito del checkpoint es precisamente medirlos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-speculator.dspark-hs10 (este) | 2.040.860.417 | no disponible | Ablacion de capas de estado oculto; pesos `fc` aleatorios | apache-2.0 | Hugging Face |
| RedHatAI/Qwen3.8-27B-speculator.dspark | no disponible | no disponible | Borrador entrenado con 8 capas (`[4, 12, 20, 28, 36, 44, 52, 60]`) | no disponible | Hugging Face |
| Otros borradores DSpark de Qwen3.8-27B | no disponible | no disponible | Decodificacion especulativa con distinto numero de capas | no disponible | no disponible |

## Limitaciones y advertencias

- Pesos no funcionales: `fc.weight` está reinicializado aleatoriamente, lo que produce ~0 tokens aceptados; no sirve para acelerar inferencia real.
- No apto para producción: es un artefacto de benchmarking, no un modelo desplegable.
- No es un modelo generativo autónomo: requiere siempre un modelo objetivo Qwen3.8-27B compatible con el método `dspark` de vLLM.
- Dependencia de `custom_code`: el tag indica código personalizado, lo que implica revisar y confiar en el código remoto antes de cargar los pesos.
- Sin datos de sesgo ni alucinación: al no generar texto de forma autónoma, no aplican evaluaciones de sesgo, pero tampoco existe ninguna garantía de comportamiento.
- Idiomas y contexto no documentados: no hay información sobre cobertura lingüística ni longitud de ventana.
- Licencia Apache 2.0: permite uso comercial del artefacto, pero su naturaleza aleatoria hace que ese uso carezca de sentido técnico.
- Autoría no verificada: publicado por un usuario individual (RelaxingSnorlax) con 0 descargas y 0 likes en el momento de la consulta; conviene contrastar cualquier resultado con el checkpoint original de RedHatAI.

## Enlaces

- Hugging Face: https://huggingface.co/RelaxingSnorlax/Qwen3.8-27B-speculator.dspark-hs10
- Checkpoint de origen: https://huggingface.co/RedHatAI/Qwen3.8-27B-speculator.dspark

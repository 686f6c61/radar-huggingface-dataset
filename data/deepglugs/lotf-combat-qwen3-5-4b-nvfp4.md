# deepglugs/lotf-combat-qwen3.5-4b-nvfp4

## Resumen

lotf-combat-qwen3.5-4b-nvfp4 es un modelo especializado en la toma de decisiones de combate por turnos para el videojuego *Legacy of the Fallen*. Se construye a partir de Qwen3.5-4B mediante un LoRA aplicado sobre las capas de atención y posteriormente fusionado, y se distribuye en formato NVFP4 (4 bits en pesos y activaciones) para GPUs NVIDIA Blackwell. El modelo recibe el prompt de decisión que genera el juego para un turno y devuelve un único objeto JSON con la acción, el objetivo y una explicación.

El problema que resuelve es muy concreto: sustituir la lógica de decisión de la IA enemiga o de aliados en un sistema de combate sobre rejilla, produciendo respuestas estructuradas y de baja latencia. No es un asistente general: está entrenado sobre 9.399 turnos de combate registrados del propio juego y solo funciona correctamente con ese formato de prompt y esas reglas.

La relevancia técnica reside en dos aspectos. Por un lado, demuestra un flujo completo de especialización y cuantización de un modelo de 4.539 millones de parámetros con llm-compressor 0.15, incluyendo la exclusión selectiva de capas (`lm_head`, torre de visión, embeddings y `linear_attn`) del proceso de cuantización. Por otro, reporta latencias medidas: aproximadamente 0,27 s por turno en una RTX PRO 6000 Blackwell bajo vLLM 0.33, frente a 0,39 s en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-4B (arquitectura `qwen3_5`, con capas `linear_attn` y torre de visión) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits en pesos y activaciones), esquema `NVFP4` de llm-compressor; etiquetado como 8-bit / compressed-tensors en Hugging Face |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer multimodal (`image-text-to-text`) con torre de visión y capas de atención lineal (`linear_attn`). Sobre la base se aplicó un LoRA en las capas de atención, que se fusionó con los pesos originales tras el entrenamiento. La cuantización posterior se realizó con llm-compressor 0.15 mediante `QuantizationModifier` con esquema NVFP4, aplicada a todas las capas lineales excepto `lm_head`, la torre de visión, los embeddings y las capas `linear_attn`, y calibrada con 256 turnos de combate del juego.

Los datos de entrenamiento son 9.399 turnos individuales de combate (487 reservados para validación) registrados del juego: el prompt exacto enviado por el juego y la respuesta elegida por un modelo profesor de mayor tamaño o por un jugador humano. Se ejecutaron tres épocas y se seleccionó el checkpoint del paso 1.200, correspondiente a la menor pérdida en validación (0,568). El entrenamiento se realizó con el modo de razonamiento desactivado y en formato de un solo turno: un mensaje de usuario de entrada y un objeto JSON de salida.

## Capacidades

- Generación de decisiones de combate en formato JSON estricto: `{"action": ..., "target": ..., "explanation": ...}`.
- Selección de acción entre las disponibles en el sistema de combate del juego (ataque cuerpo a cuerpo, habilidades, buffs, entre otras).
- Selección de objetivo sobre una rejilla de combate identificada por celdas (por ejemplo, `E2`).
- Generación de una explicación breve en lenguaje natural que acompaña a la decisión.
- Capacidad multimodal heredada de la base Qwen3.5 (torre de visión presente en los pesos), aunque no se documenta su uso en este ajuste.
- No soporta de forma fiable *tool calling*, razonamiento multi-paso, agentes ni modo *thinking*: el entrenamiento se hizo con razonamiento desactivado y turno único.

## Casos de uso

- IA de enemigos en combate por turnos: el modelo recibe el prompt de decisión del juego y devuelve la acción y el objetivo en JSON, integrándose directamente en el bucle de turnos con una latencia de ~0,27 s por decisión en Blackwell.
- IA de aliados controlados por el sistema: misma interfaz de prompt, útil para personajes del grupo gestionados automáticamente durante los combates.
- Prototipado rápido de comportamiento táctico: al estar entrenado sobre decisiones de un profesor mayor y de jugadores humanos, sirve para evaluar variantes de política de combate sin reentrenar desde cero.
- Pruebas A/B de diseño de combate: comparar las decisiones del modelo con las de jugadores humanos registrados permite detectar reglas ambiguas o poco intuitivas en el diseño del sistema.
- Despliegue de bajo coste en inferencia: al ser un modelo de 4,5B en NVFP4, cabe en una sola GPU profesional Blackwell y permite servir varias partidas concurrentes con `--max-num-seqs 8` en vLLM.
- Generación de datos sintéticos de combate: usar el modelo para producir turnos etiquetados que amplíen el conjunto de entrenamiento de futuras versiones, revisando manualmente las decisiones.
- Integración como servicio HTTP compatible con la API de endpoints: el tag `endpoints_compatible` permite exponerlo como microservicio de decisión para el motor del juego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento reportados son de latencia y de validación:

| Metrica | Valor |
|---|---|
| Perdida en validacion (paso 1200) | 0,568 |
| Latencia por turno (NVFP4, RTX PRO 6000 Blackwell, vLLM 0.33) | ~0,27 s |
| Latencia por turno (bf16, misma GPU y stack) | ~0,39 s |
| Turnos de entrenamiento | 9.399 (487 reservados) |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 5,4 GB en NVFP4; se recomienda al menos 8-10 GB de VRAM para inferencia con margen para el contexto y el runtime.
- GPU recomendadas: NVIDIA Blackwell (RTX PRO 6000 Blackwell es la plataforma medida); el formato NVFP4 requiere soporte de cuantización de 4 bits en hardware Blackwell para aprovechar su rendimiento.
- En GPUs consumer: no hay datos publicados de ejecución en RTX 4090 o RTX 5090; el formato NVFP4 no está soportado de forma nativa en generaciones anteriores a Blackwell.
- Despliegue: vLLM 0.33 con `--served-model-name combat --max-num-seqs 8 --default-chat-template-kwargs '{"enable_thinking": false}'`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Throughput y latencia: ~0,27 s por turno en RTX PRO 6000 Blackwell; no se reportan cifras de tokens por segundo ni de concurrencia máxima.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| lotf-combat-qwen3.5-4b-nvfp4 | 4,54B | no disponible | NVFP4 (safetensors) | Apache 2.0 | Decision de combate JSON para un juego concreto |
| deepglugs/lotf-combat-qwen3.5-4b (bf16) | 4,54B | no disponible | bf16 (safetensors) | Apache 2.0 | Mismo ajuste, sin cuantizar; referencia de calidad |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | safetensors | Apache 2.0 | Modelo general multimodal, sin especialización en combate |

No se dispone de información sobre otros modelos especializados en IA de combate por turnos con los que establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Nunca genera el campo `move` de la rejilla: el campo se eliminó por error de las respuestas de entrenamiento, por lo que el juego debe aplicar su propia regla de movimiento.
- Puede devolver `target: null` aunque haya enemigos al alcance, desperdiciando la acción.
- Aplica la regla "rematar primero a los heridos" de forma literal y puede concentrar ataques en criaturas invocadas en lugar de en la party que las invocó.
- Puede repetir un buff de una vez por batalla dentro del mismo turno.
- Las explicaciones a veces están vacías o contienen términos inventados; solo la acción y el objetivo son fiables.
- Entrenado exclusivamente con el formato de prompt y las reglas de *Legacy of the Fallen*; no es un asistente general y su uso fuera de ese dominio no está validado.
- Los prompts del juego describen contenido para adultos, lo que condiciona su uso en entornos productivos.
- No se debe enviar `reasoning_effort` en vLLM: reactiva el modo *thinking* y la respuesta deja de ser JSON plano.
- El historial de chat largo no está probado; solo se ha validado un mensaje de sistema previo al prompt.
- No hay datos publicados sobre sesgos, idiomas soportados ni comportamiento fuera del dominio del juego.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deepglugs/lotf-combat-qwen3.5-4b-nvfp4
- Versión bf16 original: https://huggingface.co/deepglugs/lotf-combat-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE

# JamieBradfield/qwen3.8-9b-hermes-fc-balanced

## Resumen

Qwen3.8-9B Hermes FC — Balanced (v26) es un fine-tune QLoRA del modelo base Empero/Qwen3.8-9B, desarrollado por JamieBradfield como parte de una serie iterativa (v1 → v2/real-traces → v26/balanced) cuyo objetivo es enseñar a un modelo de 9B a manejar el conjunto de herramientas del agente Hermes. El modelo se presenta como un artefacto de investigación para experimentar con el comportamiento de tool-calling en modelos de esta escala, no como un producto listo para producción.

La arquitectura hereda el head MTP (multi-token prediction) de 15 claves del base, manteniendo la clase `Qwen3_5ForConditionalGeneration` con `text_config.vocab_size = 248079` (dos tokens añadidos: `<|tool_call|>` y `<|tool_response|>`). La torre visual se descarta, quedando como modelo solo de texto. El entrenamiento se realizó sobre 1.543 filas en formato ShareGPT, combinando trayectorias reales de agente Hermes, datos de SWE-rebench, APIGen-MT-5k y When2Call PREF, con QLoRA 4-bit (rank 16, alpha 16) durante 193 pasos (1 época) y una pérdida final de 0.0552.

La relevancia actual radica en que el modelo base (Qwen3.8-9B-Distill) no muestra ninguna capacidad de tool-calling (0/45 en las pruebas held-out), mientras que esta versión alcanza 43/45 disparos de herramienta y 27/45 de formato exacto, demostrando que la capacidad se adquiere íntegramente mediante el fine-tune. Es un caso de estudio útil para quienes trabajan en la adaptación de modelos pequeños a entornos de agentes con herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer, con head MTP de 15 claves, solo texto) |
| Parametros totales | 9.195.119.616 (9,20B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (MAX_SEQ de entrenamiento: 6144) |
| Tipos de cuantizacion | BF16 (merge completo, 12 shards, 18,4 GB); GGUF Q4_0_ROCMFP4_FAST (ROCmFPX) en repo compañero |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) y GGUF (ROCmFPX) |

## Arquitectura y entrenamiento

El modelo parte de Empero/Qwen3.8-9B, un modelo de la serie Qwen3.8 con arquitectura transformer y head MTP. El fine-tune se realizó con QLoRA 4-bit (rank 16, alpha 16, dropout 0) sobre los pesos fusionados de la versión v2 (`qwen3.8-9b-hermes-fc-real-traces`), que ya incorporaba los tokens de herramienta y el envelope XML. El dataset de entrenamiento combina 979 filas de la versión v2 (933 trayectorias reales de agente Hermes y 46 de relleno), ventanas de SWE-rebench (trayectorias de Qwen3-Coder-480B OpenHands remapeadas a las herramientas reales de Hermes), unidades de llamada de APIGen-MT-5k (GPT-4o / DeepSeek-V3) y filas PREF de When2Call (Mixtral-8x22B). El entrenamiento usó batch 1 con grad-accum 8 (efectivo 8), lr 2e-4, warmup 0.1 y MAX_SEQ 6144, durante 1 época (193 pasos) con pérdida final 0.0552. El vocabulario se amplió de 248077 a 248079 con los tokens `<|tool_call|>` y `<|tool_response|>`. Los scripts de construcción del dataset y entrenamiento están publicados en el repositorio, aunque el dataset en sí no se publica por contener cadenas privadas.

## Capacidades

- Generación de texto y conversación en inglés.
- Tool calling / function calling específico para el runtime Hermes agent, con envelope XML y esquemas de herramientas coincidentes con ese entorno.
- Soporte de agentes multi-paso: el modelo puede decidir cuándo disparar una herramienta, con qué nombre y argumentos, y en qué formato exacto.
- Capacidad de clarificación: en las pruebas held-out, responde correctamente en los casos ambiguos (2/2 en la métrica clarify).
- No incluye capacidades de visión, audio ni otras modalidades (torre visual descartada).
- No se reportan capacidades de razonamiento matemático o código más allá de lo que herede del base.

## Casos de uso

- Investigación sobre tool-call en modelos de 9B: el modelo sirve como banco de pruebas para estudiar cómo un modelo pequeño aprende a seleccionar y formatear llamadas a herramientas, comparando con las versiones v2 y v25 de la misma serie.
- Desarrollo de agentes Hermes en entornos controlados: dado que el envelope y los esquemas coinciden con el runtime Hermes, se puede integrar en prototipos de agentes que usen ese runtime, siempre que se acepte la naturaleza experimental del modelo.
- Evaluación de estrategias de fine-tune para function calling: los scripts publicados permiten reproducir el pipeline completo (construcción de dataset, entrenamiento QLoRA, merge y evaluación) para experimentar con variaciones en la mezcla de datos o hiperparámetros.
- Generación de datos sintéticos de trayectorias de agente: el modelo puede emplearse para generar ejemplos de llamadas a herramientas en formato Hermes, útiles para aumentar datasets de entrenamiento de otros modelos.
- Benchmarking de cuantización ROCmFPX: la versión GGUF Q4_0_ROCMFP4_FAST permite probar el rendimiento de la cuantización ROCmFPX en GPUs AMD RDNA3, comparando calidad y velocidad frente al BF16.
- Estudio de la influencia de datos de profesor (teacher data) en modelos pequeños: la mezcla con datos de GPT-4o, DeepSeek-V3 y Mixtral-8x22B permite analizar cómo afecta la destilación indirecta al comportamiento de tool-calling.

## Benchmarks y rendimiento

La evaluación se realizó sobre 45 trayectorias ambiguas held-out (misma semilla y límite para todos los modelos), con métricas de disparo de herramienta, coincidencia de nombre, validez de argumentos, formato exacto y clarificación. Resultados:

| Modelo | fired | name_match | args_ok | format_exact | clarify |
|---|---|---|---|---|---|
| base Qwen3.8-9B-Distill | 0/45 | 0/45 | 0/45 | 0/45 | — |
| v2 (real traces) | 41/45 | 28/45 | 25/45 | 25/45 | 2/2 |
| v25 (trigger-heavy) | 26/45 | 18/45 | 16/45 | 26/45 | 0/2 |
| **v26 (este modelo)** | **43/45** | 25/45 | 23/45 | **27/45** | 2/2 |

El modelo v26 dispara más (43/45) y formatea con más exactitud (27/45) que v2, manteniendo la clarificación (2/2). El coste es una pérdida de 3 puntos en name_match y 2 en args_ok, lo que indica que a veces elige la herramienta equivocada bajo ambigüedad semántica (por ejemplo, `search_files` en lugar de `tool_describe`). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el merge BF16 pesa 18,4 GB, por lo que se necesita al menos 20 GB de VRAM para cargar los pesos en memoria (más overhead de activaciones). Una GPU con 24 GB (RTX 3090/4090, A5000) sería suficiente.
- La versión GGUF Q4_0_ROCMFP4_FAST reduce el tamaño a aproximadamente 5-6 GB, permitiendo ejecución en GPUs con 8 GB de VRAM (por ejemplo, RX 7600, RTX 3060) si se usa ROCmFPX.
- El autor entrenó en una AMD RX 7700 XT con ROCm (Unsloth 2026.8.18, torch 2.11 ROCm), lo que indica compatibilidad con la pila ROCm.
- Opciones de despliegue: llama.cpp (con el fork `llama-rocmfpx` para ROCmFPX), vLLM o TGI si se convierte a formatos estándar (el BF16 safetensors es compatible con transformers). No se reportan latencias ni throughput.
- Para uso en producción, se recomienda convertir el BF16 a GGUF estándar (Q4_K_M, Q5_K_M) para portabilidad, ya que ROCmFPX está orientado a AMD.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Tool-calling (fired/45) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-9B Hermes FC Balanced (v26) | 9,20B | no disp. | 43/45 | Apache-2.0 | HuggingFace |
| Qwen3.8-9B Hermes FC Real Traces (v2) | 9,20B | no disp. | 41/45 | Apache-2.0 | HuggingFace |
| Qwen3.8-9B Hermes FC v1 | 9,20B | no disp. | no disp. | Apache-2.0 | HuggingFace |
| Qwen3.8-9B-Distill (base) | 9,20B | no disp. | 0/45 | Apache-2.0 | HuggingFace |

La comparativa se limita a las versiones de la misma serie, ya que no se dispone de datos de otros modelos de 9B con function calling en el mismo benchmark. El modelo base no muestra capacidad de tool-calling, lo que subraya que toda la habilidad proviene del fine-tune.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un producto. El autor lo declara explícitamente y no garantiza robustez en entornos de producción.
- El dataset de entrenamiento no se publica por contener cadenas privadas (hostnames, identificadores de sesión). Aunque el autor afirma que los pesos no contienen esas cadenas, no hay verificación independiente.
- La capacidad de tool-calling está limitada al runtime Hermes: el envelope XML y los esquemas de herramientas son específicos de ese entorno. No es directamente compatible con otros formatos (OpenAI, Anthropic, etc.) sin adaptación.
- El modelo solo soporta inglés; no se reportan capacidades multilingües.
- No se han evaluado sesgos, alucinaciones ni comportamientos adversos. Al ser un fine-tune sobre datos de agente, podría presentar patrones de sobreajuste a los estilos de las trayectorias de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el autor recomienda tratarlo como experimental. El modelo base también es Apache-2.0, por lo que no hay restricciones adicionales.
- La cuantización ROCmFPX está orientada a AMD RDNA3; para otras plataformas hay que convertir desde el BF16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-balanced
- Modelo base: https://huggingface.co/Empero/Qwen3.8-9B
- Versión v2 (real traces): https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-real-traces
- Versión v1: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-function-calling-v1
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Página de Qwen3.8 en OpenLM.ai: https://openlm.ai/qwen3.8/

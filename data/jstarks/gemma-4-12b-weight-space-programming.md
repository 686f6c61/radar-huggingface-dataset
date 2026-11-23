# jstarks/Gemma-4-12B-Weight-Space-Programming

## Resumen
Gemma-4-12B-Weight-Space-Programming es una adaptación del modelo base `google/gemma-4-12B-it` publicada por el usuario jstarks en Hugging Face. No se trata de un modelo entrenado de forma convencional, sino de una aplicación de la técnica denominada Weight-Space Programming (WSP v3.0), una arquitectura de LoRA dinámica de 9 subespacios que modifica los pesos del modelo base sin reentrenamiento (training-free, closed-form). El objetivo declarado es mejorar el comportamiento del modelo en tareas de agente, tool calling, razonamiento estructurado y generación de código mediante la síntesis de pesos en el espacio latente.

El modelo conserva la arquitectura del Gemma-4-12B-it original: 48 capas, `hidden_size=3840`, `intermediate_size=15360`, MLP con activación GeGLU y normalización RMSNorm. Cuenta con 11.907.350.576 parámetros totales según los pesos en safetensors y se distribuye tanto en formato safetensors como en GGUF (incluido un Q4_K_M de 6.633 GiB). El repositorio ocupa 9,5 GB.

Su relevancia radica en que plantea una vía alternativa al ajuste fino clásico: intervenir directamente en los pesos mediante subespacios LoRA dinámicos y medir el efecto con un conjunto unificado de 100 tareas más 20 tareas de Terminal-Bench 2.0. Los resultados publicados muestran una mejora modesta pero medible sobre el modelo base (de 50/100 a 52/100 en el conjunto unificado), lo que lo convierte en un caso de estudio interesante para interpretabilidad mecánica y programación de pesos más que en un modelo de producción de alto rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Gemma-4 (`gemma4_unified`), 48 capas, `hidden_size=3840`, `intermediate_size=15360`, MLP GeGLU, RMSNorm |
| Parámetros totales | 11.907.350.576 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (las evaluaciones usan `-c 16384` en llama.cpp) |
| Tipos de cuantización | GGUF, incluido Q4_K_M (6.633 GiB); cuantización de caché `q8_0` para K y V en las pruebas |
| Idiomas soportados | No disponible |
| Licencia | Gemma (licencia de Google para modelos Gemma) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento
El modelo parte de `google/gemma-4-12B-it` y aplica WSP v3.0, descrito por el autor como una técnica training-free y closed-form de programación en el espacio de pesos. La intervención se organiza en 9 subespacios LoRA dinámicos que actúan sobre las capas del transformer, con un modo de síntesis denominado `bf16_forward_hook_cascaded_mlp`. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición del dataset, porque no hay un entrenamiento convencional: la modificación se calcula analíticamente a partir de los pesos del modelo base.

La evaluación se realizó con decodificación determinista (`temperature=0.0`, `seed=42`) y una ventana de contexto de 16384 tokens con caché KV cuantizada en `q8_0`. El autor reporta que la síntesis se ejecuta mediante forward hooks en cascada sobre el MLP, lo que sugiere una manipulación de las activaciones intermedias combinada con la inyección de los subespacios LoRA. No se documentan en la información disponible detalles sobre RLHF, DPO ni datos de preferencias.

## Capacidades
- Generación de texto conversacional y razonamiento multi-turno.
- Tool calling y function calling, evaluado con BFCL v3 (subconjunto de irrelevancia).
- Comportamiento de agente con múltiples pasos, incluyendo router multi-herramienta y puertas de escalado (handoff).
- Generación de código, evaluada con HumanEval pass@1.
- Razonamiento matemático, evaluado con GSM8K.
- Generación de comandos de shell a partir de lenguaje natural (NL2Bash).
- Tareas de terminal en contenedor mediante Terminal-Bench 2.0.
- Modo de pensamiento (suite S1_THINK de cierre de razonamiento).
- Restricción de herramientas y anti-sicofancia (suite S2_RESTRAINT).
- Salida JSON estructurada en el segundo turno de conversación (suite S5_TURN2_JSON).
- Guardia contra inyección indirecta de prompts (suite S7_INJ_GUARD).
- Abstención fundamentada (suite S8_GROUNDING) y auto-recuperación de errores (suite S9_ERR_RECOV).
- Capacidad multimodal imagen-texto a texto, según el tag `image-text-to-text`.
- Capacidades multilingües: no disponible.

## Casos de uso
- Agentes de terminal automatizados: el modelo puede ejecutar tareas de shell en contenedores con feedback de código de salida, como demuestra su evaluación en Terminal-Bench 2.0 con 6/20 tareas superadas. Es adecuado para entornos controlados donde se valora la interpretabilidad del comportamiento más que la tasa de éxito bruta.
- Enrutamiento de herramientas en asistentes: las suites S3_ROUTER y S6_HANDOFF muestran un rendimiento del 80 % y 100 % respectivamente, lo que lo hace utilizable como componente de selección de herramientas en pipelines de agentes con múltiples APIs.
- Generación de comandos de shell desde lenguaje natural: con 8/20 en NL2Bash tras WSP, puede emplearse como asistente de línea de comandos en herramientas de administración de sistemas, siempre con revisión humana.
- Extracción de JSON estructurado en conversaciones multi-turno: la suite S5_TURN2_JSON alcanza 3/3, por lo que es viable para integraciones que requieren salida estructurada en el segundo turno de un diálogo.
- Defensa contra inyección de prompts: la suite S7_INJ_GUARD obtiene 3/3, lo que permite usarlo como capa de filtrado o guardia en sistemas expuestos a contenido externo.
- Abstención fundamentada en sistemas de preguntas y respuestas: la suite S8_GROUNDING logra 3/3, adecuado para asistentes que deben declinar responder cuando no hay evidencia suficiente.
- Investigación en interpretabilidad mecánica: al ser una intervención training-free sobre pesos, sirve como banco de pruebas para estudiar cómo afectan subespacios LoRA dinámicos al comportamiento del modelo base.
- Evaluación comparativa de técnicas WSP: el autor publica una comparativa con otros cuatro modelos del mismo pipeline, lo que permite reproducir y contrastar resultados en tareas de agente y código.

## Benchmarks y rendimiento
Resultados publicados por el autor en la model card, con decodificación determinista y contexto de 16384 tokens:

| Suite | Tareas | Base | WSP v3.0 | Tokens medios (base → WSP) |
|---|---:|---:|---:|---:|
| S1_THINK (cierre de razonamiento) | 3 | 1/3 (33,3 %) | 1/3 (33,3 %) | 971,0 → 977,0 |
| S2_RESTRAINT (restricción y anti-sicofancia) | 4 | 2/4 (50,0 %) | 3/4 (75,0 %) | 399,5 → 398,8 |
| S3_ROUTER (router multi-herramienta) | 5 | 4/5 (80,0 %) | 4/5 (80,0 %) | 111,6 → 115,8 |
| S4_CODE (síntesis de código) | 2 | 0/2 (0,0 %) | 0/2 (0,0 %) | 1024,0 → 1024,0 |
| S5_TURN2_JSON (JSON estructurado) | 3 | 3/3 (100,0 %) | 3/3 (100,0 %) | 38,3 → 38,3 |
| S6_HANDOFF (puerta de escalado) | 4 | 4/4 (100,0 %) | 4/4 (100,0 %) | 108,5 → 109,5 |
| S7_INJ_GUARD (inyección indirecta) | 3 | 3/3 (100,0 %) | 3/3 (100,0 %) | 110,0 → 130,0 |
| S8_GROUNDING (abstención fundamentada) | 3 | 3/3 (100,0 %) | 3/3 (100,0 %) | 110,0 → 110,0 |
| S9_ERR_RECOV (auto-recuperación) | 3 | 3/3 (100,0 %) | 3/3 (100,0 %) | 22,0 → 22,0 |
| EST_GSM8K | 20 | 7/20 (35,0 %) | 7/20 (35,0 %) | 907,1 → 904,8 |
| EST_HUMANEVAL (pass@1) | 15 | 6/15 (40,0 %) | 6/15 (40,0 %) | 875,2 → 892,5 |
| EST_BFCL_IRR | 15 | 7/15 (46,7 %) | 7/15 (46,7 %) | 376,4 → 373,9 |
| EST_NL2BASH | 20 | 7/20 (35,0 %) | 8/20 (40,0 %) | 433,6 → 439,0 |
| **Total unificado** | **100** | **50/100 (50,0 %)** | **52/100 (52,0 %)** | — |
| Holdout S1..S9 | 30 | 23/30 | 24/30 | — |
| Establecidos públicos | 70 | 27/70 | 28/70 | — |
| Terminal-Bench 2.0 (WSL2) | 20 | 6/20 (30,0 %) | 6/20 (30,0 %) | 50,7 tok/s |

## Requisitos de hardware
- VRAM estimada en inferencia con GGUF Q4_K_M: 6.633 GiB de pesos; el autor reporta un delta de carga de 7477 MiB y un pico de 7664 MiB con contexto de 16384 y caché KV en `q8_0`.
- GPU recomendadas: RTX 4070 Ti (12 GB) funciona con contexto de 16k en solitario, con unos 3,8 GiB libres. En RTX 2060 (6 GB) no cabe, ya que supera los 6144 MiB de VRAM.
- No cabe en GPUs de consumo de 6 GB; sí en GPUs de 12 GB o superiores. Para contextos mayores o cuantizaciones más altas se recomiendan A100 o H100.
- Opciones de despliegue: llama.cpp (formato GGUF, usado en las evaluaciones con `-c 16384 -ctk q8_0 -ctv q8_0`), transformers con safetensors, y compatibilidad con endpoints según el tag `endpoints_compatible`. También se etiqueta `dynamic-lora`.
- Rendimiento medido: 51,3 tok/s en el entorno de pruebas del autor y 50,7 tok/s en Terminal-Bench 2.0. No se dispone de datos de latencia por petición.

## Comparativa con modelos similares
Comparativa publicada por el autor dentro del mismo pipeline `wsp-5model-pipeline`, con 100 tareas idénticas:

| Modelo | GGUF Q4_K_M | Base (100) | WSP (100) | Delta | Velocidad | VRAM pico (16k) | RTX 2060 (6 GB) |
|---|---|---:|---:|---:|---:|---:|---|
| qwen35_4b | 2.553 GiB | 72/100 | 89/100 | +17,0 pp | 117,0 tok/s | 3370 MiB | Sí |
| nemotron3_4b | 2.642 GiB | 81/100 | 81/100 | +0,0 pp | 131,1 tok/s | 3133 MiB | Sí |
| qwen35_9b | 5.290 GiB | 84/100 | 88/100 | +4,0 pp | 72,5 tok/s | 5650 MiB | Ajustado |
| qwen35_2b | 1.193 GiB | 57/100 | 55/100 | -2,0 pp | 226,5 tok/s | 1979 MiB | Sí |
| **gemma4_12b (este)** | 6.633 GiB | 50/100 | 52/100 | +2,0 pp | 51,3 tok/s | 7664 MiB | No |

Frente a los modelos Qwen3.5 y Nemotron-3 del mismo estudio, Gemma-4-12B-WSP obtiene la tasa de éxito más baja en el conjunto unificado (52 %) y el mayor consumo de VRAM, aunque conserva un rendimiento perfecto en varias suites de agente (S5, S6, S7, S8, S9). No se dispone de comparación con los modelos base originales de Google fuera de este pipeline.

## Limitaciones y advertencias
- La mejora sobre el modelo base es marginal: +2,0 puntos porcentuales en el conjunto unificado y 0,0 en Terminal-Bench 2.0. No debe presentarse como una mejora sustancial de capacidad.
- El propio autor reporta 0/2 en la suite S4_CODE y 6/15 en HumanEval pass@1, lo que indica una capacidad de código limitada.
- GSM8K se queda en 7/20 (35,0 %) y BFCL de irrelevancia en 7/15 (46,7 %), con margen amplio de mejora en matemáticas y tool calling.
- El modelo no cabe en GPUs de 6 GB; requiere al menos 12 GB para contexto de 16k, lo que restringe su despliegue en hardware de consumo.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribución; debe revisarse antes de un despliegue en producción.
- No se dispone de información sobre sesgos, idiomas soportados ni tasas de alucinación medidas de forma independiente.
- Los resultados proceden del propio autor y no se han replicado de forma independiente en la información disponible.
- La técnica WSP es experimental y training-free; su robustez fuera de las suites evaluadas no está documentada.
- El repositorio tiene 528 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/jstarks/Gemma-4-12B-Weight-Space-Programming
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Qwen3.5-4B-WSP: https://huggingface.co/jstarks/Qwen3.5-4B-Weight-Space-Programming
- Nemotron-3-Nano-4B-WSP: https://huggingface.co/jstarks/Nemotron-3-Nano-4B-Weight-Space-Programming
- Qwen3.5-9B-WSP: https://huggingface.co/jstarks/Qwen3.5-9B-Weight-Space-Programming
- Qwen3.5-2B-WSP: https://huggingface.co/jstarks/Qwen3.5-2B-Weight-Space-Programming

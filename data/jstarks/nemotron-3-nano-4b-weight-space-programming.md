# jstarks/Nemotron-3-Nano-4B-Weight-Space-Programming

## Resumen

Nemotron-3-Nano-4B-Weight-Space-Programming es un artefacto derivado del modelo base `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, publicado por el usuario jstarks bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de un conjunto de parches de espacio de pesos (Weight-Space Programming, WSP v3.0) que el autor presenta como una técnica de ajuste sin entrenamiento (training-free, closed-form) basada en nueve subespacios de rango 16 en formato `f32`. El modelo base es un transformer híbrido de tipo Nemotron-H, con componentes Mamba2 y atención, de 42 capas, `hidden_size=3136`, `intermediate_size=12544`, activación `relu2` y normalización RMSNorm.

El modelo base cuenta con 3.973.556.832 parámetros (aproximadamente 4B) y está orientado a generación de texto con capacidades declaradas de tool calling, razonamiento, código y matemáticas. La contribución del autor consiste en un conjunto de adaptadores LoRA GGUF y parches safetensors de rango 16, uno por cada subespacio S1–S9 (think, restraint, router, code, turn2 JSON, handoff, injection guard, grounding, error recovery), más un parche denso combinado en BF16 de 675,28 MiB.

La relevancia del artefacto es principalmente metodológica: el autor evalúa el efecto de los parches sobre 100 tareas (30 de holdout y 70 de benchmarks públicos) y reporta un resultado global idéntico al del modelo base (81/100 en ambos casos), con mejoras en algunas suites (S2, S8, HumanEval) y degradaciones en otras (NL2Bash). Es, por tanto, un experimento de interpretabilidad mecanicista y programación de pesos, no una mejora de rendimiento general demostrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Nemotron-H (Mamba2 + atención), 42 capas, `hidden_size=3136`, `intermediate_size=12544`, activación `relu2`, RMSNorm |
| Parametros totales | 3.973.556.832 (~4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens en la configuración de evaluación reportada (`-c 16384`); contexto máximo nativo no disponible |
| Tipos de cuantizacion | GGUF `Q4_K_M` (2,642 GiB); caché KV cuantizada `q8_0` (`-ctk q8_0 -ctv q8_0`) en las pruebas; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (parches de rango 16 en `f32` y parche denso combinado en BF16), GGUF (adaptadores LoRA para `llama-server`) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Nemotron-H, una arquitectura híbrida que combina capas Mamba2 (modelo de espacio de estados) con capas de atención, según indican las etiquetas `mamba2` y `hybrid-ssm`. La model card del derivado detalla 42 capas, dimensión oculta 3136, dimensión intermedia 12544, activación `relu2` y normalización RMSNorm con parámetro `w`. El modo de síntesis declarado es `synthesis_mode=forward_hooks_bf16`, lo que sugiere que los parches se aplican mediante hooks en forward pass en precisión BF16.

No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Respecto al derivado, el autor describe WSP v3.0 como una técnica "training-free, closed-form" que sintetiza nueve subespacios de rango 16 en `f32`, empaquetados como adaptadores LoRA GGUF para `llama.cpp`/`llama-server` y como parches safetensors para PyTorch/Transformers. Adicionalmente se publica un parche denso combinado de suma unitaria en BF16 (`patches/wsp_nemotron3_4b_patch.safetensors`, 675,28 MiB). No se documentan innovaciones como decodificación especulativa ni atención lineal más allá del propio componente Mamba2 del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo "think" (suite S1_THINK), con cierre de razonamiento evaluado.
- Tool calling y function calling, con suites específicas de enrutamiento multi-herramienta (S3_ROUTER) y de restricción de uso de herramientas (S2_RESTRAINT).
- Comportamiento de agente: puertas de escalado/handoff (S6_HANDOFF) y recuperación de errores (S9_ERR_RECOV).
- Generación de código (HumanEval, suite S4_CODE de síntesis de código de banda media).
- Matemáticas (GSM8K).
- Generación de JSON estructurado en segundo turno (S5_TURN2_JSON).
- Defensa frente a inyección indirecta de prompts (S7_INJ_GUARD) y abstención fundamentada (S8_GROUNDING).
- Traducción de lenguaje natural a Bash (NL2Bash).
- Capacidades multilingües: no disponible.

## Casos de uso

- Enrutamiento de herramientas en asistentes: el modelo puede decidir qué herramienta invocar en flujos con múltiples tools disponibles, evaluado en la suite S3_ROUTER (5/5 en base y con WSP), lo que lo hace adecuado para orquestadores de agentes ligeros.
- Abstención fundamentada en sistemas RAG: la suite S8_GROUNDING mejora de 2/3 a 3/3 con WSP v3.0, de modo que el modelo resulta útil en pipelines donde debe rechazar responder cuando la evidencia recuperada es insuficiente.
- Generación de código en pipelines de CI: con HumanEval pass@1 de 13/15 en base y 14/15 con WSP, puede emplearse para autocompletar funciones y generar tests en entornos con validación automática.
- Automatización de operaciones (NL2Bash): traducción de instrucciones en lenguaje natural a comandos Bash; conviene señalar que el rendimiento cae de 13/20 a 10/20 con WSP, por lo que el modelo base sin parches es preferible para esta tarea.
- Asistentes conversacionales con formato estructurado: la suite S5_TURN2_JSON (3/3) indica que puede mantener coherencia de esquema JSON en el segundo turno, útil para APIs que exigen salida estructurada.
- Despliegue en hardware de consumo: con un GGUF `Q4_K_M` de 2,642 GiB y un pico de VRAM de 3133 MiB a 16k de contexto, cabe en GPUs de 6 GB como la RTX 2060, lo que permite prototipado local de agentes.
- Investigación en interpretabilidad: los nueve subespacios de rango 16 y el parche denso permiten estudiar cómo modificaciones de bajo rango en el espacio de pesos afectan a comportamientos concretos (restricción, abstención, recuperación de errores).

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 100 tareas (30 de holdout S1–S9 y 70 de benchmarks públicos), con decodificación `temperature=0.0, seed=42`, `-c 16384 -ctk q8_0 -ctv q8_0`:

| Suite | Tareas | Base | WSP v3.0 | Tokens medios (base → WSP) |
|---|---:|---:|---:|---:|
| S1_THINK | 3 | 3/3 | 3/3 | 223,3 → 144,3 |
| S2_RESTRAINT | 4 | 3/4 | 4/4 | 261,8 → 249,2 |
| S3_ROUTER | 5 | 5/5 | 5/5 | 79,8 → 95,0 |
| S4_CODE | 2 | 2/2 | 2/2 | 690,5 → 577,0 |
| S5_TURN2_JSON | 3 | 3/3 | 3/3 | 191,3 → 224,0 |
| S6_HANDOFF | 4 | 4/4 | 4/4 | 117,5 → 137,2 |
| S7_INJ_GUARD | 3 | 2/3 | 2/3 | 184,3 → 178,3 |
| S8_GROUNDING | 3 | 2/3 | 3/3 | 143,0 → 232,7 |
| S9_ERR_RECOV | 3 | 2/3 | 2/3 | 76,7 → 89,0 |
| EST_GSM8K | 20 | 19/20 | 19/20 | 215,7 → 227,9 |
| EST_HUMANEVAL | 15 | 13/15 | 14/15 | 379,1 → 317,8 |
| EST_BFCL_IRR | 15 | 10/15 | 10/15 | 339,1 → 339,1 |
| EST_NL2BASH | 20 | 13/20 | 10/20 | 302,6 → 308,6 |
| **Total** | **100** | **81/100** | **81/100** | — |

Comparativa del estudio de cinco modelos bajo el mismo protocolo:

| Modelo | GGUF Q4_K_M | Base /100 | WSP /100 | Delta | tok/s | Pico VRAM (16k) |
|---|---:|---:|---:|---:|---:|---:|
| qwen35_4b | 2,553 GiB | 72 | 88 | +16,0 pp | 116,5 | 3290 MiB |
| **nemotron3_4b** | 2,642 GiB | 81 | 81 | +0,0 pp | 131,1 | 3133 MiB |
| qwen35_9b | 5,290 GiB | 84 | 76 | −8,0 pp | 72,0 | 5593 MiB |
| qwen35_2b | 1,193 GiB | 57 | 55 | −2,0 pp | 226,5 | 1979 MiB |
| gemma4_12b | 6,633 GiB | 50 | 50 | +0,0 pp | 51,8 | 7567 MiB |

## Requisitos de hardware

- VRAM estimada: pico de 3133 MiB con GGUF `Q4_K_M` y contexto de 16k con caché KV `q8_0`; incremento de carga de 2999 MiB.
- GPUs recomendadas: RTX 2060 (6 GB) funciona con aproximadamente 3,0 GiB libres a 16k; RTX 4070 Ti (12 GB) es la opción más rápida reportada para un 4B a 16k en el estudio.
- Cabe en GPU de consumo: sí, en tarjetas de 6 GB o superiores con la cuantización indicada.
- Opciones de despliegue: `llama.cpp`/`llama-server` con los adaptadores LoRA GGUF (`adapters/wsp_s1_think.gguf` … `wsp_s9_error_recovery.gguf`); PyTorch/Transformers con los parches safetensors de rango 16 o el parche denso combinado.
- Throughput: 131,1 tok/s en la configuración reportada; es el segundo más rápido del estudio de cinco modelos, por detrás de qwen35_2b (226,5 tok/s) y por delante de qwen35_4b (116,5 tok/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto evaluado | Base /100 | WSP /100 | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Nemotron-3-Nano-4B WSP | ~4B | 16k | 81 | 81 | Apache 2.0 | Hugging Face (jstarks) |
| Qwen3.5-4B WSP | ~4B | 16k | 72 | 88 | no disponible | Hugging Face (jstarks) |
| Qwen3.5-9B WSP | ~9B | 16k | 84 | 76 | no disponible | Hugging Face (jstarks) |
| Gemma-4-12B WSP | ~12B | 16k | 50 | 50 | no disponible | Hugging Face (jstarks) |

Los datos de la comparativa proceden exclusivamente del estudio del autor y emplean el mismo conjunto de 100 tareas y la misma configuración de decodificación; no son directamente comparables con resultados publicados por los desarrolladores originales de cada modelo. El modelo base sin parches (`nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`) es la referencia natural, pero no se dispone de sus puntuaciones en benchmarks estándar dentro de la información proporcionada.

## Limitaciones y advertencias

- El resultado global con WSP v3.0 es idéntico al del modelo base (81/100), por lo que no hay evidencia de mejora agregada; las ganancias en S2, S8 y HumanEval se compensan con la caída en NL2Bash (13/20 → 10/20).
- La suite S7_INJ_GUARD se mantiene en 2/3 y S9_ERR_RECOV en 2/3, lo que indica que los parches no resuelven completamente la defensa frente a inyección indirecta ni la recuperación de errores.
- El modelo base tiene 4B parámetros y un contexto evaluado de 16k; tareas que requieran ventanas mayores o razonamiento profundo pueden degradarse.
- No se dispone de información sobre idiomas soportados; el comportamiento multilingüe no está verificado.
- No se documentan sesgos conocidos ni evaluación de alucinación más allá de la suite de abstención fundamentada.
- La licencia Apache 2.0 del derivado permite uso comercial, pero conviene verificar las condiciones del modelo base `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16` antes de desplegar en producción.
- Los parches se aplican mediante hooks en forward pass (`synthesis_mode=forward_hooks_bf16`); la integración con Transformers requiere `trust_remote_code` y el código personalizado del repositorio (`custom_code`), lo que añade superficie de riesgo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-14); se trata de un artefacto de investigación sin validación externa.
- El tamaño del repositorio es de 11,6 GB, sustancialmente mayor que el GGUF de 2,642 GiB, debido a los múltiples formatos de parches publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jstarks/Nemotron-3-Nano-4B-Weight-Space-Programming
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Derivado relacionado Qwen3.5-4B WSP: https://huggingface.co/jstarks/Qwen3.5-4B-Weight-Space-Programming
- Derivado relacionado Qwen3.5-9B WSP: https://huggingface.co/jstarks/Qwen3.5-9B-Weight-Space-Programming
- Derivado relacionado Qwen3.5-2B WSP: https://huggingface.co/jstarks/Qwen3.5-2B-Weight-Space-Programming
- Derivado relacionado Gemma-4-12B WSP: https://huggingface.co/jstarks/Gemma-4-12B-Weight-Space-Programming
- Papers, blogs, repositorios y demos adicionales: no disponible

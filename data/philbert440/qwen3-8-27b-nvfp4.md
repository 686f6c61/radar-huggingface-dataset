# philbert440/Qwen3.8-27B-NVFP4

## Resumen

Qwen3.8-27B-NVFP4 es una cuantización en punto flotante de 4 bits (NVFP4, weight-only) del modelo Qwen3.8-27B de Alibaba, publicada por el usuario philbert440. El modelo base es un modelo denso de 27.781 millones de parámetros, de tipo visión-lenguaje, con 64 capas (16 de atención completa y 48 de atención lineal GatedDeltaNet), y modo de razonamiento (thinking) activado por defecto. La cuantización reduce el peso de 55 GB a 25.2 GB, manteniendo la torre de visión completa en BF16 y la cabeza MTP (Multi-Token Prediction) para decodificación especulativa también en BF16.

La relevancia de este checkpoint radica en dos aspectos. Primero, permite ejecutar un modelo de 27B con visión y razonamiento en hardware Volta (V100, compute capability 7.0), algo que otras cuantizaciones NVFP4 no permiten por requerir capacidad 7.5 o superior. Segundo, el autor ha realizado una comparativa sistemática (bake-off) de cinco recetas de cuantización, seleccionando la que ofrece mejor equilibrio entre calidad y velocidad en un rig de 2×V100-32GB. El resultado alcanza aproximadamente 47 tokens/s en generación de razonamiento single-stream en V100, con una puntuación GSM8K de 0.965 y una tasa de confabulación de 27 sobre 75 en una sonda de alucinación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B — híbrido denso, 64 capas (16 full-attention + 48 GatedDeltaNet linear-attention), visión-lenguaje |
| Parametros totales | 27.781.427.952 (~27.8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1M con YaRN |
| Tipos de cuantizacion | NVFP4 (E2M1 4-bit, weight-only), escalas FP8-E4M3 por grupo (grupo 16), escala global FP32 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors nvfp4-pack-quantized) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer híbrido que combina 16 capas de atención completa con 48 capas de atención lineal GatedDeltaNet, lo que reduce el coste computacional en contextos largos manteniendo la capacidad de razonamiento. Incluye una torre de visión que procesa imágenes y un modo de razonamiento (thinking) activado por defecto. La cuantización NVFP4 se realizó con GPTQ (basado en Hessiana, secuencial sobre las capas `Qwen3_5DecoderLayer`), con act-order (weight) y un observador de escala MSE. La calibración se hizo sobre 768 muestras de razonamiento en modo thinking y 256 pasajes de Wikipedia a 2048 tokens.

El autor cuantizó 304 lineales (todas las proyecciones de atención completa y MLP, más `out_proj` e `in_proj_ba` de GatedDeltaNet), pero mantuvo en BF16 las proyecciones sensibles a la cuantización: la torre de visión completa (333 tensores), `in_proj_qkv` e `in_proj_z` de GatedDeltaNet, `in_proj_a/b` de atención lineal, `embed_tokens`, `lm_head` y la cabeza MTP. Esta decisión se basó en los resultados del bake-off, que mostró que cuantizar esas proyecciones degradaba significativamente la calidad sin ganancia sustancial de velocidad.

## Capacidades

- Generación de texto y razonamiento multi-step con modo thinking activado por defecto.
- Comprensión de imágenes (visión) con la torre de visión completa en BF16.
- Decodificación especulativa mediante cabeza MTP (Multi-Token Prediction) en BF16, con K=2 greedy draft.
- Contexto largo nativo de 262.144 tokens, extensible a 1M con YaRN.
- Capacidades multilingües (no especificadas en la documentación disponible).
- Soporte de tool calling y function calling (heredado del modelo base Qwen3.8-27B).
- Compatible con inferencia en hardware Volta (V100) gracias al formato `nvfp4-pack-quantized` de compressed-tensors, y nativo en Blackwell (SM100+) con tensor cores FP4.

## Casos de uso

- Despliegue de un modelo visión-lenguaje de 27B en hardware legacy: gracias a la compatibilidad con compute capability 7.0, este checkpoint permite servir un modelo de 27B con visión y razonamiento en clústeres de V100, que de otro modo quedarían descartados para este tipo de modelos. Es adecuado para organizaciones que ya tienen infraestructura Volta y necesitan capacidades multimodales sin renovar el hardware.
- Asistente de razonamiento para soporte técnico: el modo thinking activado por defecto y la ventana de contexto de 262K tokens permiten analizar documentación extensa, logs y conversaciones previas para generar respuestas razonadas en problemas de diagnóstico técnico. La cabeza MTP acelera la generación, lo que reduce la latencia en interacciones interactivas.
- Análisis de documentos con imágenes en entornos con restricción de VRAM: al ocupar solo 25.2 GB, el modelo puede ejecutarse en una sola GPU de 32 GB (o en dos de 16 GB con tensor parallelism) para extraer información de informes escaneados, diagramas técnicos o capturas de pantalla, combinando visión y lenguaje en un solo paso.
- Generación de código asistida por contexto largo: con 262K tokens de contexto, el modelo puede procesar repositorios completos o documentación extensa para generar código, refactorizar o explicar funcionalidades. La licencia Apache-2.0 permite su integración en herramientas de desarrollo internas sin restricciones comerciales.
- Evaluación de calidad de respuestas en pipelines de IA: la baja tasa de confabulación medida (27/75 en la sonda del autor) y la puntuación GSM8K de 0.965 lo hacen adecuado como generador de respuestas de referencia o como evaluador automático en sistemas RAG, donde la precisión factual es crítica.
- Inferencia en entornos con GPUs Blackwell: en hardware SM100+, el formato NVFP4 se ejecuta de forma nativa en los tensor cores FP4, lo que lo convierte en una opción ligera y rápida para servir un modelo de 27B con visión y razonamiento en producción con alta concurrencia.

## Benchmarks y rendimiento

El autor publicó una comparativa (bake-off) de cinco recetas de cuantización, medida en un rig fijo: 2×V100-32GB TP2, 1Cat-vLLM 1.2.2, `FLASH_ATTN_V100`, KV en FP8-E5M2, MTP K=2 greedy draft y CUDA graphs. La calidad se evaluó con una sonda de alucinación de 150 ítems (75 preguntas factuales puntuadas por precisión, 75 preguntas con premisa falsa puntuadas por confabulación, juzgadas por grok-4.3) y GSM8K strict-match sobre 200 ítems. La velocidad se midió en tokens/s para generaciones de razonamiento de 512 y 2048 tokens, instrucción de 512 tokens y agregado con 4 concurrencias.

| Checkpoint | Factual ↑ | Confabulación ↓ (de 75) | GSM8K ↑ | tok/s 512 / 2048 / instr / conc4 |
|---|---|---|---|---|
| **Este repo (v2, receta C)** | 0.973 | 27 | 0.965 | 47.1 / 42.3 / 44.7 / 126.6 |
| Este repo v1 (2026-08-13) | 0.987 | 39 | 0.940 | 48.9 / 48.0 / 46.2 / 137.9 |
| Inferact/Qwen3.8-27B-NVFP4 (ModelOpt) | 0.973 | 34 | 0.950 | 46.7 / 43.8 / 43.7 / 137.5 |
| unsloth/Qwen3.8-27B-NVFP4 (compressed-tensors, mixto) | 0.973 | 29 | 0.955 | 34.4 / 35.1 / 33.8 / 107.1 |
| RadixArk/Qwen3.8-27B-NVFP4 (ModelOpt, FP8 attention) | — | — | — | No carga en SM70 |

El ruido de medición declarado es de ±4 sondas de confabulación, ±1.5 puntos de GSM8K y ±5% en tokens/s. Según el autor, las recetas C, E y unsloth son equivalentes en calidad, y la receta C (la publicada) es la más rápida de ese grupo con un margen amplio.

## Requisitos de hardware

- VRAM estimada: 25.2 GB de pesos (NVFP4) más overhead de KV cache y activaciones; en la práctica se sirve en 2×V100-32GB con tensor parallelism (TP2).
- GPU recomendadas: 2×V100-32GB (compute capability 7.0) con 1Cat-vLLM 1.2.2; también nativo en GPUs Blackwell (SM100+) con tensor cores FP4.
- Compatibilidad con consumer GPUs: no se indica explícitamente, pero por tamaño de pesos (25.2 GB) cabría en una RTX 4090 (24 GB) solo con cuantización adicional o en una RTX 5090 (32 GB); no hay datos de rendimiento en estas GPUs.
- Opciones de despliegue: 1Cat-vLLM 1.2.2 (con los PRs #228 y #230), que incluye el camino SM70 para NVFP4; también compatible con vLLM estándar en GPUs con capacidad 7.5+ y con hardware Blackwell.
- Latencia y throughput: 47.1 tok/s single-stream en generación de razonamiento de 512 tokens, 42.3 tok/s en 2048 tokens, 44.7 tok/s en instrucción de 512 tokens, y 126.6 tok/s agregado con 4 concurrencias, medidos en el rig de referencia.

## Comparativa con modelos similares

La siguiente tabla compara este checkpoint con otras cuantizaciones NVFP4 públicas del mismo modelo base, según los datos del bake-off del autor (mismo rig, misma batería de pruebas).

| Checkpoint | Método | Calidad (factual / confab / GSM8K) | Velocidad (tok/s 512) | Carga en V100 |
|---|---|---|---|---|
| **philbert440/Qwen3.8-27B-NVFP4 (v2)** | compressed-tensors nvfp4-pack-quantized | 0.973 / 27 / 0.965 | 47.1 | Sí |
| Inferact/Qwen3.8-27B-NVFP4 | ModelOpt | 0.973 / 34 / 0.950 | 46.7 | Sí (con PR #228) |
| unsloth/Qwen3.8-27B-NVFP4 | compressed-tensors, mixto | 0.973 / 29 / 0.955 | 34.4 | Sí (con ajustes) |
| RadixArk/Qwen3.8-27B-NVFP4 | ModelOpt, FP8 attention | — | — | No (sin kernel Volta) |

La ventaja principal de este checkpoint frente a las alternativas es la combinación de calidad competitiva (empate técnico con unsloth en confabulación y GSM8K) con la mayor velocidad en V100, gracias a mantener más capas en 4 bits que unsloth y a la calibración optimizada. Frente a las versiones ModelOpt, evita el requisito de compute capability 7.5+, lo que lo hace la única opción viable en hardware Volta.

## Limitaciones y advertencias

- La cuantización NVFP4 es weight-only: la calidad puede degradarse en tareas muy sensibles a la precisión de pesos, aunque el autor reporta que la receta elegida mantiene un equilibrio aceptable.
- El modelo está calibrado con datos de razonamiento en modo thinking y Wikipedia; puede presentar sesgos o menor precisión en dominios muy especializados no representados en esos datos.
- La tasa de confabulación medida (27/75 en la sonda del autor) indica que el modelo puede inventar respuestas ante preguntas con premisas falsas; es necesario validar las salidas en aplicaciones críticas.
- La documentación no especifica los idiomas soportados ni el rendimiento multilingüe; se asume herencia del modelo base Qwen3.8-27B, pero no hay datos verificados.
- El despliegue en V100 requiere 1Cat-vLLM 1.2.2 con los PRs #228 y #230; la configuración es específica y puede no estar soportada en versiones posteriores o en otros servidores de inferencia.
- El autor es un usuario independiente, no afiliado a Alibaba ni a Qwen; el checkpoint no tiene garantías oficiales de soporte ni mantenimiento.
- Aunque la licencia es Apache-2.0, el modelo base Qwen3.8-27B puede tener términos adicionales de uso; se recomienda revisar la licencia del modelo original antes de un despliegue comercial.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/philbert440/Qwen3.8-27B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio 1Cat-vLLM: https://github.com/1CatAI/1Cat-vLLM (PRs #228 y #230 mencionados en la model card)
- Repositorio 1Cat-vLLM alternativo citado por el autor: https://github.com/rivetphilbot/1Cat-vLLM

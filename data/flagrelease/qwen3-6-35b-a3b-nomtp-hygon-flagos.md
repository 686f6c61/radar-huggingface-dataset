# FlagRelease/Qwen3.6-35B-A3B-nomtp-hygon-FlagOS

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje de arquitectura MoE (mixture of experts) dispersa, con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token. El modelo base lo desarrolla el equipo Qwen (Alibaba), y esta ficha concreta corresponde a la reproducción publicada por FlagRelease dentro del ecosistema FlagOS, orientada a la ejecución sobre aceleradores Hygon (GPUs DCU) mediante una pila de software abierta que unifica modelo, sistema y chip.

La variante publicada en este repositorio, identificada como `nomtp-hygon-FlagOS`, es una conversión del checkpoint original a safetensors lista para servirse con vLLM 0.13.0 sobre el stack FlagOS (FlagGems, FlagTree, FlagCX y vllm-plugin-fl). El interés práctico radica en que permite desplegar un modelo MoE de 35B con solo 3B activos en hardware no NVIDIA, manteniendo una calidad de razonamiento y percepción multimodal muy cercana a la del stack nativo, según la validación de consistencia publicada por el autor.

El modelo está pensado para cargas de trabajo de codificación agéntica, razonamiento multimodal y despliegue en producción con tool calling. La licencia Apache 2.0 y el formato safetensors facilitan su integración en pipelines existentes, aunque la información pública disponible sobre contexto, idiomas y composición del dataset de entrenamiento es limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE dispersa (tag `qwen3_5_moe`) |
| Parámetros totales | 35.951.822.704 |
| Parámetros activos | ~3.000 millones (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 71,9 GB |
| Pipeline | no disponible |
| Fecha de creación | 2026-04-15 |
| Última actualización | 2026-11-19 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos dispersa: 35B parámetros totales con aproximadamente 3B activos por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamaño. El tag `qwen3_5_moe` indica que deriva de la familia Qwen3.5/Qwen3.6 con router de expertos. El sufijo `nomtp` del identificador sugiere la ausencia de multi-token prediction en este checkpoint, aunque no se detalla en la información disponible.

No se han publicado en la información proporcionada datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detallan innovaciones de atención (lineal, decodificación especulativa u otras). Lo que sí se documenta es la capa de despliegue: el modelo se sirve con vLLM 0.13.0 mediante el plugin `vllm-plugin-fl` sobre FlagOS, con `--enforce-eager` y tensor parallelism de 4 en el ejemplo oficial, lo que indica que el checkpoint está adaptado para ejecución multi-chip en aceleradores Hygon.

## Capacidades

- Generación de texto y razonamiento general en modo conversacional.
- Codificación agéntica: el autor destaca un rendimiento en tareas de agente que supera a Qwen3.5-35B-A3B y compite con modelos densos mayores como Qwen3.5-27B y Gemma4-31B.
- Percepción y razonamiento multimodal, según la model card.
- Soporte de tool calling y function calling a través del endpoint compatible con OpenAI de vLLM (`/v1/chat/completions`).
- Razonamiento multi-paso orientado a agentes.
- Capacidades multilingües: no disponible el detalle de idiomas.
- Integración con clientes de escritorio como AnythingLLM mediante API compatible con OpenAI.

## Casos de uso

- Codificación agéntica en producción: el modelo puede integrarse en pipelines de CI/CD o asistentes de repositorio que requieren razonamiento multi-paso y tool calling, aprovechando sus 3B parámetros activos para mantener latencia contenida frente a densos de 27B-31B.
- Despliegue en infraestructura Hygon: organizaciones con aceleradores DCU pueden usar la imagen FlagOS-Hygon y el checkpoint safetensors para levantar un servidor vLLM en minutos, sin reescribir el stack de inferencia.
- Asistencia conversacional multi-turno: el endpoint compatible con OpenAI permite conectar el modelo a interfaces tipo AnythingLLM para atención al usuario, con la ventana de contexto que determine la configuración de despliegue.
- Análisis de documentos con componente visual: gracias a sus capacidades multimodales, puede emplearse en tareas de extracción y razonamiento sobre imágenes y texto combinados.
- Migración y validación de stacks: el par de checkpoints (Nvidia-Origin vs Hygon-FlagOS) permite comparar la fidelidad numérica de FlagOS frente al stack nativo en GPQA-Diamond y ERQA antes de adoptar hardware alternativo.
- Evaluación comparativa de modelos MoE: útil como referencia de 35B/3B activos para benchmarking interno frente a modelos densos de tamaño similar en tareas de razonamiento científico y codificación.
- Servicio de API interna: con `--tp 4` y vLLM se puede exponer un servicio compatible con OpenAI para equipos de desarrollo que necesiten un modelo Apache 2.0 sin dependencia de proveedores externos.

## Benchmarks y rendimiento

| Métrica | Qwen3.6-35B-A3B-nomtp-Nvidia-Origin | Qwen3.6-35B-A3B-nomtp-Hygon-FlagOS |
|---|---|---|
| GPQA-Diamond | 0,8283 | 0,8210 |
| ERQA | 0,5875 | 0,5714 |

Los datos publicados corresponden únicamente a la validación de consistencia entre el stack nativo NVIDIA y el stack FlagOS sobre Hygon. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otras métricas estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 71,9 GB en safetensors (aproximadamente 16 bits), por lo que la inferencia en precisión original requiere al menos ~72 GB de memoria de acelerador, repartidos entre GPUs.
- Configuración de referencia del autor: tensor parallelism de 4 (`--tp 4`) sobre aceleradores Hygon con la imagen FlagOS-Hygon y vLLM 0.13.0.
- GPU recomendadas: aceleradores Hygon DCU con driver 6.3.22 y el stack DTK indicado; en el ecosistema NVIDIA serían necesarias varias A100/H100 para cubrir los ~72 GB en BF16.
- Consumer GPU: no cabe en una sola GPU de consumo en BF16; requeriría cuantización a 4 bits (no publicada en este repo) para acercarse a los ~18-20 GB, lo que aún excede la mayoría de tarjetas de 16 GB.
- Opciones de despliegue: vLLM 0.13.0 con `vllm-plugin-fl` sobre FlagOS; el ecosistema FlagOS también incluye FlagScale para entrenamiento e inferencia distribuida. No se documenta soporte de llama.cpp u Ollama para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este) | 35,95B | ~3B | no disponible | Apache 2.0 | safetensors + imagen FlagOS-Hygon |
| Qwen3.5-35B-A3B | no disponible | ~3B | no disponible | no disponible | referenciado como predecesor |
| Qwen3.5-27B (denso) | 27B | 27B | no disponible | no disponible | referenciado en la model card |
| Gemma4-31B (denso) | 31B | 31B | no disponible | no disponible | referenciado en la model card |

Según el autor, Qwen3.6-35B-A3B supera a Qwen3.5-35B-A3B y compite con los densos Qwen3.5-27B y Gemma4-31B en codificación agéntica. No se dispone de cifras comparativas adicionales en la información proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos; no hay métricas de factualidad publicadas para este checkpoint.
- La longitud de contexto no está especificada, lo que impide garantizar ventanas largas en producción sin verificar la configuración del tokenizador y del servidor.
- Idiomas soportados no disponibles; el ejemplo de invocación usa chino, pero no se confirma cobertura multilingüe.
- El checkpoint está optimizado para el stack FlagOS sobre Hygon; en otros hardwares conviene validar la fidelidad numérica, ya que la propia model card reporta una degradación pequeña pero real (GPQA 0,8283 → 0,8210; ERQA 0,5875 → 0,5714).
- El despliegue de referencia usa `--enforce-eager`, lo que puede reducir el throughput frente a modos con captura de grafos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y sin cláusulas de responsabilidad por parte del autor.
- El número de descargas (25) y likes (0) indica una adopción aún muy baja; no hay evidencia comunitaria de robustez en producción.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/Qwen3.6-35B-A3B-nomtp-hygon-FlagOS
- AnythingLLM: https://anythingllm.com/
- Triton (base de FlagGems): https://github.com/openai/triton
- Megatron-LM (base de FlagScale): https://github.com/NVIDIA/Megatron-LM
- vLLM (base del plugin de inferencia): https://github.com/vllm-project/vllm

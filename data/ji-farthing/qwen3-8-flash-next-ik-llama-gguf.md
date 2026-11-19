# ji-farthing/Qwen3.8-Flash-Next-ik-llama-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de gran escala desarrollado por el equipo Qwen (Alibaba). Se distribuye bajo la licencia comunitaria qwen-community-license-1.0 y, según los datos disponibles, cuenta con aproximadamente 177.000 millones de parámetros totales. La información proporcionada no detalla la arquitectura interna ni la longitud de contexto del modelo base, aunque la model card del repositorio de cuantización menciona tensores de atención, SSM (state space models), hyper-connections, expertos compartidos (shared experts) y proyecciones de un indexador DSA, lo que apunta a una arquitectura híbrida con componentes de mezcla de expertos.

Esta ficha describe concretamente el repositorio `ji-farthing/Qwen3.8-Flash-Next-ik-llama-GGUF`, una cuantización comunitaria del modelo base orientada a `ik_llama.cpp`. El autor publica tres recetas de cuantización (v3 IQ4_KT, v3 IQ3_KT e IQ4_KT_v2) más una cabeza MTP (multi-token prediction) cuantizada para decodificación especulativa. El objetivo es permitir ejecutar un modelo de ~177B parámetros en hardware de consumo o en configuraciones multi-GPU con offload parcial a RAM, manteniendo una divergencia KL baja respecto al BF16 de referencia.

La relevancia actual del repositorio radica en su enfoque en cargas de trabajo agénticas de programación: la importance matrix se calibró específicamente para "agentic coding", y se incluyen métricas de divergencia KL sobre texto en inglés y código. Es, por tanto, una opción práctica para desarrolladores que quieran desplegar localmente un modelo grande con decodificación especulativa y control fino del reparto VRAM/RAM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; la model card menciona tensores de atención, SSM, hyper-connections, shared experts y proyecciones de indexador DSA, compatible con un diseño híbrido con mezcla de expertos |
| Parámetros totales | 176.943.899.520 (~177B) según safetensors del modelo base |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible como especificación del modelo; la model card cita un ejemplo de caché KV y buffers de cómputo de ~7,5 GiB a 256K de contexto con `-ub 1024` |
| Tipos de cuantización | v3 IQ4_KT, v3 IQ3_KT, IQ4_KT_v2 (modelo principal); IQ4_KT para la cabeza MTP |
| Idiomas soportados | No disponibles |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (compatible con ik_llama.cpp; no con llama.cpp estándar) |

## Arquitectura y entrenamiento

La información disponible no describe el proceso de entrenamiento del modelo base Qwen3.8-Flash-Next (número de tokens, composición del dataset, RLHF/DPO, etc.). Lo que sí se deduce de la model card de la cuantización es que el modelo combina capas de atención con componentes SSM, hyper-connections, expertos compartidos y un indexador DSA (DeepSeek Sparse Attention o similar, según la abreviatura empleada). La presencia de "routed experts" y "shared-expert tensors" confirma un diseño de mezcla de expertos con enrutamiento disperso.

El repositorio de cuantización documenta una innovación relevante: la inclusión de una cabeza MTP (multi-token prediction) cuantizada a IQ4_KT (2,21 GiB) que actúa como modelo borrador para decodificación especulativa. Las cuantizaciones v3 emplean una importance matrix (`qwen4exp-agentic-v3.imatrix`, 312 MiB) calibrada para código agéntico, y almacenan los tensores de atención, SSM, hyper-connections y expertos compartidos en Q8_0, mientras que las proyecciones del indexador DSA se mantienen en BF16. Las cuantizaciones se generaron con `ik_llama.cpp` en el commit `d9e2868`, que incorpora el codificador CUDA IQ4_KT/IQ3_KT del PR #2572.

## Capacidades

- Generación de texto conversacional y de propósito general (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento y generación de código: la importance matrix está calibrada explícitamente para "agentic coding", y se reportan métricas de divergencia KL sobre código.
- Decodificación especulativa mediante cabeza MTP cuantizada, que acelera la generación al proponer varios tokens por paso.
- Capacidad de ejecución con offload selectivo de tensores a CPU/RAM (`-ot`, `--defer-ple`), lo que permite servir el modelo en configuraciones de VRAM limitada.
- Soporte de tool calling, agentes y razonamiento multi-paso: no confirmado explícitamente en la información disponible, aunque el calibrado "agentic" sugiere orientación a estos flujos.
- Capacidades multimodales: no disponibles; el repositorio se etiqueta como `text-only`.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistencia de programación en local: el modelo puede integrarse en un IDE o CLI de agente para autocompletado y refactorización multi-archivo, aprovechando la importance matrix calibrada para código agéntico y la cabeza MTP para reducir latencia de generación.
- Despliegue en estaciones de trabajo con VRAM limitada: con la configuración documentada, solo 4,5 GiB de tensores residen en GPU y 52,6 GiB de expertos enrutados pueden ubicarse en RAM o VRAM, lo que permite ejecutar un modelo de ~177B en equipos con una o dos GPU de consumo y suficiente memoria del sistema.
- Servicio de chat conversacional de contexto largo: la model card documenta un ejemplo de caché KV de ~7,5 GiB a 256K de contexto, adecuado para conversaciones multi-turno con documentos extensos, siempre que el hardware lo permita.
- Generación de código en pipelines de CI/CD: la decodificación especulativa con MTP y el soporte de `ik_llama.cpp` permiten automatizar revisiones, generación de tests o parches en entornos controlados.
- Investigación sobre cuantización: las métricas de divergencia KL (v3 IQ4_KT: 0,058 en inglés y 0,056 en código; v3 IQ3_KT: 0,085 y 0,078) sirven como referencia para estudiar el impacto de IQ4_KT/IQ3_KT en modelos MoE híbridos.
- Evaluación de decodificación especulativa: la cabeza MTP cuantizada permite medir ganancias de throughput y tasas de aceptación en `ik_llama.cpp` sin necesidad de un modelo borrador separado.
- Prototipado de agentes autónomos en local: con offload parcial y contexto largo, se pueden probar flujos de razonamiento multi-paso sin depender de APIs externas, sujeto a las restricciones de la licencia comunitaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí reporta métricas de divergencia KL frente al BF16 de referencia:

| Receta | Tamaño total | Tensores en GPU (config. documentada) | Expertos enrutados (RAM/VRAM) | KLD medio inglés | KLD medio código |
|---|---:|---:|---:|---:|---:|
| v3 IQ4_KT | 82,75 GiB | 4,5 GiB | 52,6 GiB | 0,058 | 0,056 |
| v3 IQ3_KT | 72,52 GiB | 4,5 GiB | 47,2 GiB | 0,085 | 0,078 |
| IQ4_KT_v2 | 80,72 GiB | 2,4 GiB | 52,6 GiB | 0,133 | 0,125 |

El autor indica que la v3 IQ4_KT reduce la KLD un 56% en inglés y un 55% en código respecto a la IQ4_KT reemplazada, y la v3 IQ3_KT un 44% y 42% respectivamente. La v3 IQ4_KT es 5,7 GiB más pequeña que la reemplazada, y la v3 IQ3_KT 7,7 GiB más pequeña. Estas cifras miden divergencia respecto al BF16, no corrección del código generado ni throughput.

## Requisitos de hardware

- VRAM estimada: con la configuración documentada, 4,5 GiB de tensores del modelo en GPU más 52,6 GiB de expertos enrutados (v3 IQ4_KT) o 47,2 GiB (v3 IQ3_KT). A ello se suman caché KV y buffers de cómputo: ~7,5 GiB a 256K de contexto con `-ub 1024`.
- RAM del sistema: el tamaño total del archivo (82,75 GiB para v3 IQ4_KT, 72,52 GiB para v3 IQ3_KT) no equivale al requisito de RAM si `--defer-ple` mantiene la tabla PLE en disco.
- GPU recomendadas: no especificadas en la información disponible. El diseño con offload permite repartir expertos entre VRAM y RAM, por lo que configuraciones multi-GPU (por ejemplo, varias RTX 4090 o A100/H100) son viables, pero no hay cifras de latencia por modelo de GPU.
- GPU de consumo: el modelo completo no cabe en una sola GPU de consumo; con offload parcial y suficiente RAM del sistema, es ejecutable en equipos con una o varias GPU de consumo, a costa de velocidad de decodificación.
- Opciones de despliegue: exclusivamente `ik_llama.cpp` en el commit `cb860a9` o posterior (merge del PR #2481). Las builds anteriores no leen correctamente las colas de fila KT. No es compatible con llama.cpp estándar, vLLM, TGI ni Ollama según la información disponible.
- Latencia y throughput: no disponibles. El autor advierte que reducir `-c` disminuye el contexto, reducir `-ub` reduce la velocidad de procesamiento de prompt, y mover más tensores a CPU con `-ot` reduce la velocidad de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| Qwen3.8-Flash-Next (base) | ~177B | No disponible | Safetensors (BF16) | qwen-community-license-1.0 | Referencia de calidad; requiere hardware de datacenter |
| Este repositorio (v3 IQ4_KT) | ~177B (cuantizado) | No disponible | GGUF (ik_llama.cpp) | qwen-community-license-1.0 | KLD 0,058/0,056; 82,75 GiB; MTP incluida |
| Este repositorio (v3 IQ3_KT) | ~177B (cuantizado) | No disponible | GGUF (ik_llama.cpp) | qwen-community-license-1.0 | KLD 0,085/0,078; 72,52 GiB; menor huella de expertos |
| IQ4_KT_v2 (repo `_v2`) | ~177B (cuantizado) | No disponible | GGUF (ik_llama.cpp) | qwen-community-license-1.0 | KLD 0,133/0,125; 80,72 GiB; 2,4 GiB en GPU |

No se dispone de información sobre otros modelos comparables de la misma categoría (mismo tamaño o misma tarea) en los datos proporcionados.

## Limitaciones y advertencias

- La licencia qwen-community-license-1.0 puede imponer restricciones al uso comercial; es necesario revisar el texto completo en el enlace de licencia antes de desplegar en producción.
- El repositorio es una cuantización comunitaria, no oficial de Qwen; la calidad y el mantenimiento dependen del autor `ji-farthing`.
- Requiere una versión específica de `ik_llama.cpp` (`cb860a9` o posterior). Otras herramientas (llama.cpp estándar, vLLM, Ollama, TGI) no están soportadas según la información disponible.
- Las métricas de KLD no garantizan la corrección del código generado ni establecen un ranking de throughput; el propio autor lo advierte.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables a cualquier modelo de lenguaje de gran escala.
- Idiomas soportados no disponibles; la calibración de la importance matrix se realizó sobre texto en inglés y código, lo que puede degradar más la calidad en otros idiomas.
- El rendimiento depende críticamente de la configuración de offload: mover tensores a CPU reduce la velocidad de decodificación, y reducir `-ub` penaliza el procesamiento de prompt.
- El tamaño del repositorio (350,5 GB) incluye todas las variantes; la descarga selectiva de archivos es necesaria para evitar transferencias innecesarias.
- La cabeza MTP solo está disponible en el repositorio principal, no en el repositorio `_v2`.

## Enlaces

- Repositorio de cuantización: https://huggingface.co/ji-farthing/Qwen3.8-Flash-Next-ik-llama-GGUF
- Repositorio v2: https://huggingface.co/ji-farthing/Qwen3.8-Flash-Next-ik-llama-GGUF_v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
- PR #2481 de ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp/pull/2481
- PR #2572 de ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp/pull/2572

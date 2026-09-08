# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-NEO-CODER-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-NEO-CODER es una suite de archivos GGUF publicada por Solstice-AI, basada en los pesos uncensored de DavidAU sobre la arquitectura original de Qwen (Alibaba Cloud). El modelo está diseñado específicamente para tareas de programación y agentes, con un enfoque en compatibilidad con SWE-bench, tool calling XML determinista y control dinámico del esfuerzo de razonamiento.

Se trata de un modelo multimodal (image-text-to-text) de aproximadamente 26,9 mil millones de parámetros, con un proyector de visión en BF16 puro y soporte de decodificación especulativa mediante Multi-Token Prediction (MTP) y modelos drafter DSpark. La suite incluye cuantizaciones desde Q4_K_M hasta Q8_0, además de archivos MTP y un proyector multimodal independiente, lo que permite desplegarlo en entornos locales con llama.cpp u Ollama.

La relevancia de este modelo radica en su orientación a codificación y razonamiento sin restricciones (uncensored/abliterated), junto con una ventana de contexto amplia de 131072 tokens configurable en los ejemplos de ejecución. Sin embargo, no se han publicado resultados de benchmarks formales para esta variante NEO-CODER, por lo que su rendimiento real debe evaluarse en cada caso de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con proyector de vision BF16 |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | 131072 tokens (segun el ejemplo de llama.cpp) |
| Tipos de cuantizacion | Q4_K_M (UD-Q4_K_XL), Q5_K_M, Q6_K, Q8_0, MTP Q4_K_M, MTP Q8_0 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura original es de Qwen / Alibaba Cloud, y los pesos han sido modificados por DavidAU para eliminar restricciones de censura (uncensored, abliterated). La suite GGUF de Solstice-AI incluye un proyector de vision multimodal en BF16 puro, denominado `mmproj-BF16.gguf`, que evita riesgos de underflow en FP16. El modelo soporta control dinamico del esfuerzo de razonamiento mediante el parametro `reasoning_effort`: el nivel `medium` suprime la inyeccion de system prompt para ejecucion directa de codigo y compatibilidad con SWE-bench, mientras que `xhigh` inyecta etiquetas de verificacion `<thought>` para razonamiento profundo en diseno algoritmico y pruebas.

La suite incluye decodificacion especulativa con modelos MTP (Multi-Token Prediction) y un drafter DSpark, lo que segun el README proporciona un speedup de 1.8x en inferencia. No se disponen de datos sobre el proceso de entrenamiento, numero de tokens, composicion del dataset ni uso de RLHF/DPO; estos detalles no estan incluidos en la informacion proporcionada.

## Capacidades

- Generacion de texto y codigo, con optimizacion para tareas de programacion y compatibilidad SWE-bench.
- Control dinamico del esfuerzo de razonamiento: `medium` para ejecucion directa y `xhigh` para razonamiento profundo con etiquetas `<thought>`.
- Tool calling / function calling XML determinista, preconfigurado con el formato `<tool_call><function=...><parameter=...></function></tool_call>`.
- Entrada multimodal (image-text-to-text) a traves de un proyector de vision BF16 puro.
- Decodificacion especulativa con modelos MTP y drafter DSpark, con un speedup declarado de 1.8x.
- Compatibilidad con llama.cpp, llama-server, llama-cli y Ollama.
- Idiomas soportados: ingles y chino.
- Pesos uncensored y abliterated, sin restricciones de contenido impuestas por el modelo base.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD para refactorizacion multi-archivo, usando cuantizaciones Q6_K o Q8_0 cuando se requiere precision casi sin perdidas. El tool calling XML permite automatizar cambios sobre repositorios.
- Agentes de desarrollo de software: con `reasoning_effort` en `xhigh`, el modelo puede disenar algoritmos complejos, generar pruebas y verificar invariantes, gracias a las etiquetas de razonamiento profundo.
- Asistente de programacion local: gracias a los archivos GGUF y al soporte de llama.cpp y Ollama, puede ejecutarse en una estacion de trabajo con GPU de 24 GB, ofreciendo autocompletado y analisis de codigo sin conexion.
- Analisis de imagenes tecnicas: el proyector BF16 permite procesar capturas de pantalla, diagramas de arquitectura o documentacion visual, combinando vision con instrucciones de codigo.
- Aplicaciones interactivas de baja latencia: los modelos MTP y el drafter DSpark reducen la latencia en chatbots o editores con autocompletado, especialmente en cuantizaciones Q4_K_M.
- Investigacion en modelos sin censura: el modelo es util para estudios de alineacion, abliteracion y comportamiento de modelos generativos sin restricciones, aunque debe manejarse con cautela.
- Soporte bilingue chino-ingles: puede generar documentacion, comentarios de codigo y comunicacion tecnica en ambos idiomas, lo que resulta util en equipos internacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta variante NEO-CODER en la informacion disponible. El README no incluye tablas de rendimiento ni comparativas con otros modelos. El unico dato de rendimiento declarado es el speedup de 1.8x en decodificacion especulativa, pero no se trata de un benchmark estandar.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (sin incluir memoria KV cache):
  - Q4_K_M: 16.81 GB de pesos, requiere aproximadamente 17-20 GB de VRAM en GPU.
  - Q5_K_M: 19.31 GB de pesos, requiere aproximadamente 20-23 GB de VRAM.
  - Q6_K: 21.96 GB de pesos, requiere aproximadamente 22-25 GB de VRAM.
  - Q8_0: 27.74 GB de pesos, requiere aproximadamente 28-31 GB de VRAM.
- GPU recomendadas: RTX 4090 24 GB es adecuada para Q4_K_M y Q5_K_M. Para Q6_K se recomienda una GPU de 24 GB con cuantizacion de KV o reduccion de contexto. Para Q8_0 se requieren GPU de 32 GB o mas, como A100 40/80 GB o H100.
- Contexto largo: la ventana de 131072 tokens incrementa significativamente la memoria KV cache. En GPUs de 24 GB es necesario reducir el contexto o usar cuantizacion de KV para evitar overflow.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), Ollama. El tag `endpoints_compatible` sugiere compatibilidad con APIs, aunque no se especifica el backend exacto.
- Latencia y throughput estimados: no disponible. El README menciona un speedup de 1.8x con decodificacion especulativa, pero no se proporcionan cifras absolutas.

## Comparativa con modelos similares

No se dispone de modelos comparables con datos suficientes en la informacion proporcionada. Este modelo pertenece a la familia Qwen3.8-27B de DavidAU y Solstice-AI, con variantes como `Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF-UltraOptimised`, pero no se han publicado especificaciones tecnicas ni benchmarks que permitan una comparacion rigurosa. El modelo base en safetensors tiene los mismos parametros totales, pero su rendimiento en tareas especificas no esta documentado en esta ficha.

## Limitaciones y advertencias

- Al ser un modelo uncensored y abliterated, puede generar contenido inapropiado, ofensivo o peligroso sin las restricciones habituales de los modelos alineados. Esto implica un riesgo elevado de uso malintencionado y requiere supervision humana en entornos de produccion.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de fiabilidad para esta variante.
- Idiomas limitados a ingles y chino. No se ha verificado el rendimiento en espanol u otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero los pesos uncensored pueden plantear problemas eticos o legales segun el contexto de despliegue.
- La ventana de contexto de 131072 tokens exige recursos de memoria considerables; en cuantizaciones bajas o GPUs de 24 GB puede degradarse el rendimiento o producirse errores de memoria.
- No se han publicado benchmarks formales, por lo que el rendimiento real en tareas de codigo, razonamiento o vision no esta validado externamente.
- La decodificacion especulativa requiere el uso de llama.cpp u Ollama; otros backends como vLLM o TGI no estan documentados en la informacion proporcionada.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-NEO-CODER-GGUF
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Modelo relacionado (UltraOptimised): https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF-UltraOptimised
- Arquitectura original Qwen: https://huggingface.co/Qwen

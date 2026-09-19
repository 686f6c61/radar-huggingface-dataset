# lackonendes/PAW-125B-FLASH-NEXT-X3

## Resumen

PAW-125B-FLASH-NEXT-X3 es una compilación cuantizada de tipo MoE derivada de `Qwen/Qwen3.8-27B`, publicada por el usuario lackonendes en Hugging Face. El artefacto codifica el banco de expertos con el códec trellis PAW X3 a 2,631 bits por peso (bpw) y sin poda, mantiene el decodificador en Q8_0 y añade una tabla de embeddings por capa (PLE) también en q8. El objetivo declarado es servir el modelo desde 2x RTX 3090 con una ventana de contexto de diseño de 256k.

La relevancia del artefacto no está en superar rankings, sino en demostrar que a 2,631 bpw el modelo sigue siendo funcional: la model card publica tasas de acierto altas en código, matemáticas y conocimiento en lugar de salidas vacías o colapsadas. Los pesos se distribuyen en dos shards GGUF autocontenidos de 90,36 GiB totales (42,08 GiB y 48,28 GiB), y requieren el fork `llama-paw`, ya que llama.cpp estándar no puede leer el formato `paw`.

Se trata de un artefacto de comunidad con 0 descargas y 0 likes en el momento de la consulta, sin receta de servido verificada para esta build concreta y sin la cabeza MTP (~1,1 GiB) incluida. Existe una discrepancia documental relevante: el nombre comercial indica "125B" y los metadatos de safetensors declaran 76.330.416.512 parámetros totales, mientras que el modelo base nominal es de 27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Flash-Next) con banco de expertos codificado en trellis PAW X3 y decodificador denso; formato `paw` sobre GGUF |
| Parametros totales | 76.330.416.512 (76,33 mil millones) segun metadatos de safetensors; el nombre del repo indica "125B" (discrepancia no aclarada en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | 256k objetivo de diseno; 81.920 tokens medidos con offload completo |
| Tipos de cuantizacion | Banco de expertos a 2,631 bpw PAW X3 trellis (asignacion mixta K1-K4 por capa); decodificador Q8_0; tabla PLE q8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3.8-27B) |
| Formato de pesos | GGUF en 2 shards (`split.count=2`), nombres `qwen38-flash-next-paw-x3-q8_0-00001-of-00002.gguf` y `...-00002-of-00002.gguf` |

## Arquitectura y entrenamiento

No hay información sobre entrenamiento: el artefacto es una cuantización del modelo base `Qwen/Qwen3.8-27B`, no un modelo entrenado desde cero. La innovación es de compresión: el banco de expertos MoE se codifica con el códec trellis x3 portado del diseño de ExLlamaV3, a 2,631 bpw y sin poda de expertos, con una asignación mixta de presupuesto de bits K1-K4 por capa. El decodificador se mantiene a Q8_0 (5,07 GiB) para preservar la ruta densa, y el banco de expertos ocupa 37,00 GiB dentro del primer shard.

La segunda pieza arquitectónica es la tabla PLE (PLE per-layer token embedding) en q8, de 48,28 GiB, alojada íntegramente en el segundo shard. Esta tabla se lee en la ruta crítica durante la decodificación, lo que obliga a mantener ambos shards en almacenamiento NVMe y no en disco mecánico. El shard 1 contiene decodificador más banco de expertos (42,08 GiB); el shard 2 contiene la tabla PLE (48,28 GiB). No se documentan fases de RLHF o DPO específicas de este artefacto ni el volumen o composición de datos del modelo base.

## Capacidades

- Generación de texto conversacional, según el tag `conversational` del repositorio.
- Generación de código en Python: 97,0% pass@1 en HumanEval y 96,3% en MBPP en el arnés fastgate sin modo thinking.
- Razonamiento matemático: 97,0% en GSM8K (97/100) con decodificación greedy.
- Conocimiento general y científico: 65,4% en MMLU-Pro (327/500) y 59,1% en GPQA (117/198).
- Seguimiento de instrucciones: 23,4% estricto y 32,8% laxo en IFBench-64 (sentinela de 64 ítems, no el benchmark completo).
- Modo thinking: la plantilla soporta supresión del razonamiento (`--reasoning off`); no se ha ejecutado ninguna pasada de rescate en modo thinking para este artefacto, por lo que se desconoce el techo real.
- Tool calling / function calling: no disponible (no se documenta en la model card).
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Visión o audio: no disponible; el artefacto es solo texto.

## Casos de uso

- Evaluación de compresión extrema de MoE: usar el artefacto como banco de pruebas para medir si un banco de expertos a 2,631 bpw conserva coherencia frente al modelo base, comparando las puntuaciones fastgate publicadas con las del modelo sin cuantizar.
- Generación de código asistida en local: con 97,0% pass@1 en HumanEval y 96,3% en MBPP, es apto para autocompletado y generación de funciones Python en un entorno con 2x RTX 3090, sin depender de APIs externas.
- Procesamiento de repositorios largos: la ventana de 256k de diseño permite ingerir ficheros y documentación extensos en una sola pasada, útil para resúmenes de código o revisión de cambios en un monorepo.
- Investigación sobre códecs trellis: el formato PAW x3 y la asignación K1-K4 por capa sirven como caso de estudio reproducible para quienes trabajan en cuantización de mezclas de expertos.
- Inferencia en hardware de gama alta de consumo: al caber con offload completo en 2x RTX 3090 (48 GB), permite desplegar un modelo de gran tamaño en estaciones de trabajo sin GPU de datacenter.
- Análisis de documentos técnicos largos con razonamiento desactivado: el arnés sin thinking a 4096 tokens de salida es adecuado para extracción de respuestas concretas sobre documentación extensa, priorizando latencia sobre profundidad de razonamiento.
- Base para pipelines de evaluación propios: al ser autocontenido en dos shards y publicar hashes SHA-256, encaja en flujos de verificación de integridad y réplica de resultados.

## Benchmarks y rendimiento

Todas las cifras proceden de la model card, del mismo arnés fastgate, decodificación greedy y `--reasoning off` (thinking suprimido en la plantilla). Son números de una sola pasada sobre este GGUF concreto.

| Benchmark | Items | max_tokens | Resultado |
|---|---:|---:|---:|
| MMLU-Pro | 500 | 128 | 327/500 (65,4%) |
| GPQA | 198 | 4096 (2048 en la pasada inicial) | 117/198 (59,1%) |
| IFBench-64 | 64 | 2048 | estricto 15/64 (23,4%), laxo 21/64 (32,8%) |
| HumanEval (EvalPlus) | 164 | 2048 | pass@1 97,0% |
| HumanEval+ | 164 | 2048 | pass@1 93,9% |
| MBPP | 378 | 2048 | pass@1 96,3% |
| MBPP+ | 378 | 2048 | pass@1 80,7% |
| GSM8K | 100 | 4096 (techo 8192) | 97/100 (97,0%) |

No se han publicado resultados de benchmarks comparativos frente a otros modelos en la información disponible. La propia model card advierte de que la tabla es el suelo sin modo thinking, no el techo, y que no se ha ejecutado pasada de rescate en modo thinking para este artefacto.

## Requisitos de hardware

- VRAM medida: 45,5 GiB con offload completo a 81.920 tokens de contexto sobre 2x RTX 3090.
- GPU recomendadas: 2x RTX 3090 (48 GB combinados) es la configuración validada por el autor. Para el objetivo de 256k no hay medición publicada.
- GPU de consumo: no cabe en una única GPU de consumo de 24 GB. Requiere al menos dos aceleradores de 24 GB, o bien GPUs profesionales con 48 GB o más (A6000, A100 80 GB, H100).
- Almacenamiento: imprescindible NVMe para ambos shards; la tabla PLE del shard 2 se lee en la ruta crítica de decodificación, por lo que el disco mecánico degrada gravemente el rendimiento.
- Espacio en disco: 90,36 GiB declarados para los dos shards; el repositorio completo ocupa 148,9 GB.
- Opciones de despliegue: exclusivamente el fork `llama-paw` (https://github.com/irawanw/llama-paw). llama.cpp estándar no puede leer el formato. No se documenta soporte para vLLM, Ollama, TGI ni otros servidores.
- Latencia y throughput: no disponibles. La model card indica que no se ha derivado ni verificado una línea de comandos de `llama-server` (contexto, batch, cuantización de KV) para este artefacto concreto, y que las flags del recetario denso X3 (`GGML_PAW_X3_GEMV`, `-fa on`, `--reasoning off`) son un punto de partida razonable pero no confirmado.
- Componente ausente: la cabeza MTP (~1,1 GiB) no está incluida en este build.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks publicados | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| PAW-125B-FLASH-NEXT-X3 | 76,33B (metadatos safetensors) | 256k objetivo; 81.920 medidos | MMLU-Pro 65,4%, HumanEval 97,0%, GSM8K 97,0%, GPQA 59,1% | Apache-2.0 | GGUF PAW x3, requiere `llama-paw` |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | no disponible | Apache-2.0 | no disponible |
| PAW-27B-X3-GGUF (artefacto hermano, denso X3) | no disponible | receta de 256k referenciada | no disponible en esta ficha | no disponible | GGUF PAW X3 |
| Modelo denso B3.5-X3 (hermano, mencionado en la model card) | no disponible | pasada en modo thinking a 32k | se indica que una pasada en thinking sube MMLU-Pro e IFBench de forma sustancial | no disponible | GGUF PAW X3 |

No hay datos suficientes para comparar especificaciones frente a alternativas de la misma categoría. La model card no publica cifras del modelo base sin cuantizar ni de otros artefactos de la familia, por lo que no es posible cuantificar la pérdida de calidad derivada de la cuantización a 2,631 bpw.

## Limitaciones y advertencias

- No es un GGUF estándar: requiere el fork `llama-paw`; llama.cpp original no puede leerlo. Esto limita drásticamente las opciones de despliegue y el soporte de la comunidad.
- No existe una receta de `llama-server` verificada para este artefacto. Las flags de contexto, batch y cuantización de KV están sin validar.
- La cabeza MTP (~1,1 GiB), usada en los despliegues propios del autor, no está incluida.
- La calidad en contexto largo (256k) no se ha medido. Los 45,5 GiB de VRAM corresponden a 81.920 tokens, no al objetivo completo de 256k.
- IFBench-64 es un centinela de 64 ítems, no el benchmark completo; sus resultados no son extrapolables.
- No se ha ejecutado ninguna pasada de rescate en modo thinking, por lo que los números publicados son un suelo y no reflejan el rendimiento máximo del modelo.
- Riesgo de alucinación: no cuantificado en la información disponible; se trata de un modelo de lenguaje generativo sin mecanismos de verificación documentados.
- Sesgos conocidos: no documentados. Al ser una cuantización del modelo base, hereda los sesgos de `Qwen/Qwen3.8-27B`, no caracterizados en esta ficha.
- Idiomas soportados: no disponibles. No hay evaluación multilingüe publicada.
- Uso comercial: la licencia Apache-2.0 lo permite en principio, pero conviene verificar la licencia del modelo base y las condiciones del fork `llama-paw`.
- Madurez: 0 descargas y 0 likes; artefacto recién publicado (creado el 19 de septiembre de 2026, actualizado el mismo día) y sin validación independiente.
- Discrepancia de nomenclatura: el nombre indica 125B, los metadatos declaran 76,33B de parámetros y el modelo base se denomina 27B. No hay aclaración en la model card.
- Discrepancia de tamaño: la model card declara 90,36 GiB en dos shards, mientras que el tamaño del repositorio en Hugging Face figura como 148,9 GB.
- Todos los benchmarks son de una sola pasada, sin repetición ni intervalos de confianza, y parcialmente re-ejecutados con un tope de tokens mayor (`_p0`), lo que introduce heterogeneidad metodológica entre filas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lackonendes/PAW-125B-FLASH-NEXT-X3
- Fork `llama-paw` requerido: https://github.com/irawanw/llama-paw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- ExLlamaV3 (origen del códec trellis x3): https://github.com/turboderp-org/exllamav3
- PrismML Bonsai (demo): https://github.com/PrismML-Eng/Bonsai-demo
- Fork de llama.cpp de PrismML (arnés de evaluación fastgate): https://github.com/PrismML-Eng/llama.cpp
- Hashes de integridad declarados:
  - `e0d01657af0bd88bed2c6d8127f9425bb9e36adfb5df03b80bcdf5e34157c8d9` para `qwen38-flash-next-paw-x3-q8_0-00001-of-00002.gguf`
  - `1296edd1881163cf0b26962dc59c416efdfc29987dbc2cd8a7fbc79f69a2149d` para `qwen38-flash-next-paw-x3-q8_0-00002-of-00002.gguf`

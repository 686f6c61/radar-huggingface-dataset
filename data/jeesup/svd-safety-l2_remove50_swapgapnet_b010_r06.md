# Jeesup/svd-safety-l2_remove50_swapgapnet_b010_r06

## Resumen

`Jeesup/svd-safety-l2_remove50_swapgapnet_b010_r06` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`. El autor (Jeesup) lo ha comprimido con SVD-LLM eliminando el 50,01% de los parámetros densos y, a continuación, ha aplicado 6 de las 10 rondas previstas de una edición iterativa de parámetros denominada "parameter-neutral swap", seleccionada mediante la regla `gap_iter`, con un presupuesto de restauración del 1,000% de los parámetros densos.

El problema que aborda es concreto y acotado: cuantificar cómo la compresión por SVD degrada el comportamiento de seguridad de un modelo alineado y probar si la reparación selectiva de componentes recupera parte de ese comportamiento. No es un modelo de propósito general ni un asistente desplegable; la propia model card lo describe como "un sujeto experimental" dentro de una rejilla de reglas de selección y presupuestos.

La relevancia es metodológica: publica métricas de ataque (AdvBench ASR 0,0962 y StrongREJECT ASR 0,1853, ambas con juez HarmBench) y de sobre-rechazo (0,1584 macro en WildGuard) para una celda intermedia concreta, lo que permite estudiar la tensión entre seguridad y utilidad en modelos comprimidos. Los pesos están en safetensors y el repositorio ocupa 13,5 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 2, con pesos editados mediante descomposición SVD (SVD-LLM) y swaps de parámetros; número de capas, cabezas y dimensiones no disponible |
| Parametros totales | 6.738.415.616 (contaje real de los safetensors del repositorio) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible para esta variante (el checkpoint base `meta-llama/Llama-2-7b-chat-hf` declara 4096 tokens, dato no confirmado en la model card de esta ficha) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos sin cuantizar en safetensors |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License (etiqueta `llama2`); el repositorio incluye `LICENSE.txt` y `USE_POLICY.md` |
| Formato de pesos | safetensors, librería `transformers` |
| Modelo base | `meta-llama/Llama-2-7b-chat-hf` |
| Pipeline | `text-generation` |
| Tamaño del repositorio | 13,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-14 |

Nota técnica: la model card declara una fracción resultante de parámetros densos de proyección de 0,4999 tras eliminar el 50,01%, pero el recuento de parámetros de los safetensors coincide con el del checkpoint denso original. Conviene inspeccionar la estructura real de los tensores antes de asumir una reducción de memoria equivalente.

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama 2 7B chat: un transformer decoder-only autorregresivo con normalización RMSNorm, activación SwiGLU y atención con RoPE. Sobre ese checkpoint no se ha realizado un entrenamiento nuevo, sino una edición post-hoc de pesos en dos fases: primero una compresión SVD-LLM que elimina el 50,01% de los parámetros densos, y después un bucle iterativo de intercambio de componentes. No se documenta RLHF ni DPO adicional en esta ficha; cualquier alineación previa procede del checkpoint base de Meta.

La fase de edición usa la regla de selección `gap_iter`, con un presupuesto total de restauración del 1,000% de los parámetros densos repartido en 10 rondas de 0,100% cada una. Este checkpoint corresponde a la ronda 6 de 10, con semilla 42, 3.518 componentes restaurados, 3.518 componentes sustituidos y 38.828.032 parámetros intercambiados (0,60% de los parámetros densos de proyección). El valor de swap es `net`, definido en la model card como el valor de inserción más el valor de eliminación de la evicción ordenada por sigma. Al ser un estado intermedio de una ejecución más larga, no representa el punto final del procedimiento.

## Capacidades

- Generación de texto conversacional: hereda el formato de diálogo del checkpoint base Llama-2-7b-chat, con la etiqueta `conversational` en el repositorio. No se documentan evaluaciones de calidad conversacional para esta variante.
- Sujeto de experimentación en seguridad: es su función principal. Está instrumentado para medir tasa de éxito de ataques (ASR) y tasa de rechazo excesivo frente a prompts benignos.
- Análisis de interpretabilidad de componentes: el procedimiento registra qué componentes concretos (3.518 entradas y 3.518 salidas) se restauran, lo que permite correlacionar componentes de proyección con comportamientos de seguridad.
- Compatibilidad con `text-generation-inference`: el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`.
- Tool calling / function calling: no disponible; no se documenta soporte en la model card.
- Capacidades de agente o razonamiento multi-paso: no disponible; no se documenta nada al respecto.
- Capacidades multilingües: no disponible; la model card no declara idiomas.
- Visión, audio o modo "thinking": no disponible; son capacidades ajenas a este artefacto.

## Casos de uso

- Estudio cuantitativo del daño de la compresión en seguridad: el checkpoint sirve como punto de medida de ASR (0,0962 en AdvBench, 0,1853 en StrongREJECT) para una configuración concreta, y puede compararse con la ronda 0 y con la ronda 10 para aislar el efecto de cada ronda de swap.
- Comparación de reglas de selección de componentes: al ser una celda de una rejilla sobre reglas y presupuestos, se usa para contrastar `gap_iter` frente a otras reglas manteniendo fijo el presupuesto del 1,000% y la semilla 42.
- Análisis de sobre-rechazo en modelos comprimidos: con 0,1584 de macro over-refusal medido por WildGuard, permite estudiar si la recuperación de seguridad reintroduce rechazos indebidos en peticiones benignas.
- Red-teaming controlado: puede actuar como sujeto experimental en harness de jailbreak (AdvBench, StrongREJECT) para validar metodologías de evaluación antes de aplicarlas a modelos en producción.
- Reproducción de experimentos de edición de parámetros: la semilla, el número de rondas, el tamaño de chunk y el valor de swap están documentados, lo que facilita replicar el procedimiento sobre el mismo checkpoint base.
- Investigación en interpretabilidad mecanística: los 38.828.032 parámetros intercambiados y la lista de componentes restaurados permiten estudiar qué subconjuntos de pesos sostienen comportamientos de seguridad.
- Docencia y metodología de evaluación de seguridad: sirve como ejemplo didáctico de cómo reportar ASR y over-refusal con jueces automáticos (HarmBench, WildGuard) y de por qué un checkpoint comprimido no equivale a su base.

No se recomienda su uso como asistente conversacional en producción, ni como sustituto del checkpoint base en aplicaciones de cara al usuario.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor | Juez |
|---|---|---|---|
| AdvBench | ASR | 0,0962 | HarmBench judge |
| StrongREJECT | ASR | 0,1853 | HarmBench judge |
| WildGuard | Macro over-refusal | 0,1584 | WildGuard |

Interpretación: en las métricas de ASR, un valor más bajo indica mayor resistencia a peticiones dañinas. La model card advierte que varias celdas de la rejilla están "deliberadamente degradadas en seguridad" respecto a Llama-2-7b-chat, y que la compresión por sí sola eleva la tasa de éxito de ataque. No se aportan resultados del checkpoint base ni de las demás celdas en la información disponible, por lo que no es posible cuantificar aquí la recuperación atribuible a las 6 rondas de swap. No se publican resultados de MMLU, HumanEval, GSM8K ni de calidad de generación en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 13,5 GB solo para pesos, más el caché KV; con contexto moderado conviene reservar 16-18 GB. Estimación derivada del recuento de parámetros, no verificada por el autor.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB de pesos. En 4 bits: aproximadamente 4-5 GB. Son conversiones externas, no publicadas en el repositorio.
- GPU recomendadas: A100 40 GB, H100, L40S o A10G 24 GB para FP16 con margen; RTX 4090 o RTX 3090 (24 GB) son suficientes para FP16 con contexto corto.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB en FP16/BF16, y en tarjetas de 16 GB o incluso 12 GB si se cuantiza a 8 o 4 bits. No se han publicado pesos GGUF para Ollama o llama.cpp, por lo que la cuantización requiere conversión propia.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiquetas `text-generation-inference` y `endpoints_compatible`), vLLM, y cualquier runtime compatible con safetensors. Para llama.cpp u Ollama habría que generar primero un GGUF.
- Latencia y throughput: no disponible; no se han publicado mediciones.

Advertencia de memoria: si la edición de pesos no reduce realmente el número de parámetros almacenados (véase la nota de la sección de especificaciones), el ahorro de VRAM respecto al checkpoint denso puede no ser el esperado y debe comprobarse midiendo el modelo cargado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tratamiento | ASR AdvBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint | 6.738.415.616 | No disponible | SVD al 50,01% + 6 de 10 rondas de swap (`gap_iter`, presupuesto 1,000%) | 0,0962 | Llama 2 | Público en HuggingFace, 0 descargas |
| `meta-llama/Llama-2-7b-chat-hf` | 6.738.415.616 | 4096 tokens según el modelo base | Sin comprimir ni editar | No disponible en esta información | Llama 2 | Público |
| Otras celdas de la rejilla del mismo estudio | No disponible | No disponible | SVD + swaps con otras reglas o presupuestos | No disponible | Llama 2 | No disponible en la información proporcionada |

No se dispone de datos de otras alternativas comparables de la misma categoría (modelos Llama 2 comprimidos por SVD de terceros) en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación, no un asistente desplegable: la model card indica explícitamente que debe tratarse como sujeto experimental y evaluarse antes de extraer conclusiones.
- Degradación de seguridad por compresión: el propio estudio documenta que la compresión SVD eleva la tasa de éxito de ataques, y que varias celdas de la rejilla están deliberadamente degradadas respecto a Llama-2-7b-chat.
- Checkpoint intermedio: corresponde a la ronda 6 de 10, por lo que no refleja el estado final del procedimiento de reparación.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad para esta variante; el riesgo esperable es igual o superior al del base comprimido, pero no está medido en la información disponible.
- Sobrerrechazo medible: 0,1584 de macro over-refusal en WildGuard indica que rechaza un porcentaje relevante de peticiones benignas.
- Idiomas y contexto no documentados: no se declaran idiomas soportados ni longitud de contexto para esta variante.
- Sin validación externa: 0 descargas y 0 likes en el momento de los metadatos, sin resultados de terceros que confirmen las métricas publicadas.
- Sin cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ en el repositorio, lo que complica el despliegue en hardware limitado sin trabajo adicional.
- Licencia restrictiva: Llama 2 Community License con `USE_POLICY.md` y `LICENSE.txt` incluidos; el uso comercial está sujeto a las condiciones de Meta, incluidas obligaciones de atribución ("Built with Llama 2") y restricciones de uso aceptable.
- Posible discrepancia de tamaño: el contaje de parámetros de safetensors no refleja la reducción declarada del 50,01%, algo que debe verificarse antes de planificar recursos o de asumir beneficios de eficiencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapnet_b010_r06
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia incluida en el repositorio: `LICENSE.txt` (ruta relativa dentro del repositorio del modelo)
- Política de uso incluida en el repositorio: `USE_POLICY.md` (ruta relativa dentro del repositorio del modelo)
- Paper, blog o repositorio de código del estudio: no disponible en la información proporcionada

Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo: los únicos enlaces recuperados corresponden a páginas de producto de ChatGPT y a su entrada de Wikipedia, sin relación con el checkpoint. Por tanto, no se incluyen como referencias.

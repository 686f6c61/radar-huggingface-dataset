# mhseo2/prestudy_qwen3base8b_ot3dmq_ntpraw_s1500_lr1e-5_min05-step1000

## Resumen

`mhseo2/prestudy_qwen3base8b_ot3dmq_ntpraw_s1500_lr1e-5_min05-step1000` es un checkpoint intermedio de investigación derivado de Qwen3-8B-Base. No se trata de un modelo publicado como producto final, sino de un artefacto de un experimento de "pre-estudio": el autor parte de la copia `-opd` de Qwen3-8B-Base (con token EOS `<|im_end|>`) y la entrena con predicción de siguiente token únicamente sobre enunciados de problemas matemáticos, sin instrucciones, sin respuestas y sin soluciones. El objetivo declarado es que el modelo "lea" los problemas antes de un SFT posterior, no que aprenda a resolverlos.

El entrenamiento usa 97.874 problemas de matemáticas: 41.704 problemas de SFT matemático de OpenThoughts3 (conjunto U25) más 56.170 problemas de DeepMathOpen, a los que se elimina el sufijo de instrucción, las respuestas y las soluciones. Se aplica un learning rate de 1e-5 con decaimiento coseno hasta 0,5x durante 1.500 pasos, con batch de 256 problemas. Este repositorio contiene uno de los pasos intermedios (paso 1.000), no el checkpoint final.

El modelo tiene 8.190.735.360 parámetros (8,19 mil millones) en formato safetensors y un repositorio de 16,4 GB. Es relevante como pieza de investigación reproducible sobre currículos de entrenamiento y fases de pre-estudio, pero no está pensado para uso en producción: no tiene model card de uso, pipeline declarado ni licencia especificada, y su rendimiento no ha sido evaluado públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3; detalles no disponibles en la información proporcionada) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no disponible (no se indica que sea MoE; el nombre sugiere un modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen3-8B-Base, un transformer decoder-only de 8,19 mil millones de parámetros. El autor no documenta en la información disponible cambios en la arquitectura respecto al modelo base; el experimento es exclusivamente de entrenamiento. La copia de partida es la variante `-opd`, que usa `<|im_end|>` como token de fin de secuencia, y se acompaña de un tokenizador específico (`sfttok/`) con EOS `<|im_end|>`, pad `<|endoftext|>`, plantilla de chat que emite turnos de asistente de forma literal y prompt de generación que termina en `<think>\n`.

La fase de pre-estudio consiste en next-token prediction sobre 97.874 enunciados de problemas matemáticos sin instrucción, respuesta ni solución: 41.704 de OpenThoughts3 (U25) y 56.170 de DeepMathOpen. Se entrena con learning rate 1e-5, decaimiento coseno hasta 0,5x, 1.500 pasos y batch de 256 problemas. El repositorio incluye además `split.json` y `val256_sample_ids.json`, que definen la partición train/val del conjunto `mhseo2/sft_traj_qwen3moe30b_ot3_n53105` usada por el SFT de referencia (256 filas reservadas, semilla 20261024; el resto, 41.704 filas, para entrenamiento). No se documentan fases de RLHF, DPO ni innovaciones de decodificación.

## Capacidades

- Generación de texto autoregresiva sobre la base de Qwen3-8B-Base.
- Exposición prolongada a enunciados de matemáticas, lo que puede sesgar la distribución de salida hacia ese dominio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan modos especiales (thinking, visión, audio) más allá del prompt de generación con `<think>\n` heredado del tokenizador.
- No es un modelo ajustado para seguir instrucciones ni para resolver problemas: el entrenamiento elimina explícitamente instrucciones y soluciones.

## Casos de uso

- Investigación sobre fases de pre-estudio: reproducir el efecto de exponer un modelo base a enunciados sin soluciones antes de un SFT, comparando este paso 1.000 con el checkpoint final y con el baseline.
- Estudio de currículos de entrenamiento: analizar cómo cambia la distribución de salida tras 1.000 pasos de next-token prediction sobre 97.874 problemas matemáticos.
- Base para SFT posterior: el tokenizador `sfttok/` y los ficheros de partición permiten encadenar este checkpoint con el SFT de referencia sobre `sft_traj_qwen3moe30b_ot3_n53105`.
- Análisis de olvido catastrófico: evaluar la degradación de capacidades generales de Qwen3-8B-Base tras el entrenamiento en un dominio estrecho.
- Experimentos de tokenización y plantillas de chat: validar el comportamiento del tokenizador con EOS `<|im_end|>` y prompt de generación `<think>\n` en pipelines propios.
- Reproducibilidad de experimentos: usar `split.json` y `val256_sample_ids.json` para replicar la partición train/val con semilla 20261024.
- No se recomienda su uso en aplicaciones de producción, atención al cliente, generación de código ni tareas de razonamiento matemático reales, dado que no ha sido ajustado para ello ni evaluado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16,4 GB solo para pesos, más memoria para KV cache y activaciones; en la práctica, 20-24 GB como mínimo.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits, alrededor de 4-5 GB (cuantizaciones no publicadas por el autor, requerirían conversión propia).
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) puede alojar los pesos en bf16 con contexto limitado.
- GPU consumer: cabe en RTX 3090/4090 (24 GB) en bf16 con contexto moderado; en GPUs de 12-16 GB sería necesario cuantizar.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras convertir los pesos a GGUF; el repositorio solo incluye safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (prestudy Qwen3-8B, paso 1000) | 8,19 B | no disponible | no disponible | safetensors en HF | Checkpoint intermedio de investigación, sin evaluación |
| Qwen3-8B-Base | 8,19 B | no disponible en la información | no disponible en la información | HF | Modelo base del que deriva; capacidades generales intactas |
| Qwen3-8B (instruct) | 8,19 B | no disponible en la información | no disponible en la información | HF | Variante ajustada para instrucciones; no comparable en propósito |
| Modelos de 7-8 B de la competencia (p. ej., Llama 3.1 8B, Mistral 7B) | 7-8 B | no disponible en la información | no disponible en la información | HF | Alternativas de tamaño similar; comparación de rendimiento no disponible |

## Limitaciones y advertencias

- No es un modelo de producción: es un paso intermedio de un experimento de investigación, sin model card de uso ni evaluación publicada.
- Entrenado solo con enunciados de matemáticas sin soluciones: no aprende a resolver problemas y puede degradar capacidades generales del modelo base.
- Riesgo elevado de alucinación y de respuestas incoherentes fuera del dominio matemático.
- Licencia no especificada: no hay garantía de uso comercial; debe contactarse con el autor antes de cualquier uso productivo.
- Idiomas y longitud de contexto no documentados; no se puede asumir el contexto nativo de Qwen3-8B sin verificación.
- Sin pipeline declarado ni demo; descargas y likes a cero en el momento de la consulta.
- El tokenizador asociado (`sfttok/`) difiere del estándar y debe usarse explícitamente para reproducir el SFT posterior.
- Fecha de creación indicada como 2026-11-11, lo que conviene verificar por posible error de metadatos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mhseo2/prestudy_qwen3base8b_ot3dmq_ntpraw_s1500_lr1e-5_min05-step1000
- Conjunto de referencia del split: https://huggingface.co/mhseo2/sft_traj_qwen3moe30b_ot3_n53105
- OpenThoughts3 (U25): no disponible en la información proporcionada
- DeepMathOpen: no disponible en la información proporcionada
- Qwen3-8B-Base: no disponible en la información proporcionada (referencia por nombre en la model card)

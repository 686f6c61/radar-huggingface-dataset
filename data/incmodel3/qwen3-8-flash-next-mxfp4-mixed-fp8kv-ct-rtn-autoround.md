# INCModel3/Qwen3.8-Flash-Next-MXFP4-Mixed-FP8KV-CT-RTN-AutoRound

## Resumen

`INCModel3/Qwen3.8-Flash-Next-MXFP4-Mixed-FP8KV-CT-RTN-AutoRound` es una cuantización de precisión mixta del modelo `Qwen/Qwen3.8-Flash-Next`, publicada por el usuario `INCModel3` en HuggingFace. No se trata de un modelo entrenado desde cero ni de una publicación del equipo Qwen: es un artefacto derivado, generado con la herramienta AutoRound de Intel, cuyo objetivo es reducir la huella de memoria del modelo original para hacer viable su despliegue en infraestructura propia.

La cuantización combina pesos MXFP4 en las capas de expertos, MXFP8 en el resto de capas lineales y una caché KV estática en FP8, según el comando de reproducción incluido en la model card. El repositorio ocupa 180 GB y emplea el formato `compressed-tensors`, consumible por vLLM. La model card reporta resultados de evaluación en gsm8k (0,9280), mmlu (0,8646), hellaswag (0,6781) y piqa (0,8270), ejecutados con el arnés `lm_eval` sobre un checkpoint denominado `mxfp-w8g32`.

Su relevancia es acotada pero concreta: permite autohospedar un modelo de gran tamaño con pesos de 4 bits en las capas más costosas, y sirve como referencia para quien necesite comparar esquemas de cuantización MXFP4 frente a MXFP8 o FP8. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, no declara licencia y no publica el número de parámetros ni la longitud de contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible para este repositorio. El modelo base Qwen3.8-Flash-Next emplea, según el repositorio oficial de QwenLM, una arquitectura de atención híbrida GDN + QSA |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible. El comando de cuantización referencia `mlp.experts` y `mlp.shared_expert_gate`, lo que indica una topología de mezcla de expertos (MoE), pero no se publican el número de expertos ni los parámetros activos |
| Longitud de contexto | No disponible. Las evaluaciones se ejecutaron con `max_model_len=8192` |
| Tipos de cuantización | Mixta: MXFP4 (4 bits, `mx_fp`) en `mlp.experts` y esquema MXFP8 en el resto de capas; caché KV estática en FP8. Método AutoRound con RTN, formato `compressed-tensors` / `llm_compressor` |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repositorio. La model card indica únicamente que debe respetarse la licencia del modelo original |
| Formato de pesos | safetensors (compatible con `compressed-tensors`) |
| Tamaño del repositorio | 180 GB |
| Capas excluidas de la cuantización | `visual`, `lm_head`, `embed_tokens`, `mlp.gate`, `mlp.shared_expert_gate`, `in_proj_a`, `in_proj_b`, `block_inject_weight`, `ple`, `mtp`, `hyper_connection` |
| Creado / actualizado | 2026-09-24 (ambos eventos con unos 10 minutos de diferencia) |

## Arquitectura y entrenamiento

Este repositorio no entrena ningún modelo: aplica un procedimiento de cuantización post-entrenamiento (PTQ) sobre `Qwen/Qwen3.8-Flash-Next`. El proceso se ejecutó con AutoRound 0.16.0.dev155, con `--model_free`, 32 muestras (`--nsamples 32`) y `--static_kv_dtype fp8`. El esquema base declarado es MXFP8 y, mediante `--layer_config '{"mlp.experts":{"bits":4,"data_type":"mx_fp"}}'`, se degradan únicamente las capas de expertos a MXFP4. Se excluyen de la cuantización los pesos de embedding, la cabeza de salida (`lm_head`), las puertas de los expertos, y una serie de módulos que revelan la topología del modelo base: `visual` e `in_proj_a`/`in_proj_b` (propios de una torre de visión), `mtp` (predicción multi-token), `ple` y `hyper_connection`. El formato de salida es `llm_compressor`, lo que explica las 180 GB del repositorio pese a la cuantización agresiva de los expertos.

Sobre el modelo base, la información disponible procede del repositorio de QwenLM, que describe Qwen3.8-Flash-Next como una revisión sistemática en cuatro ejes (atención, residual, embedding y optimización) con una arquitectura de atención híbrida GDN + QSA, orientada a mejorar capacidad y eficiencia computacional. No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni el uso de RLHF, DPO u otras técnicas de alineamiento. Tampoco se documenta ningún mecanismo de decodificación especulativa específico de esta cuantización.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` y entre los tags figuran `conversational` y `text-generation`.
- Razonamiento matemático: el único dato objetivo disponible es la puntuación de 0,9280 en gsm8k con 5 ejemplos y plantilla de chat.
- Conocimiento general y sentido común: mmlu 0,8646, hellaswag 0,6781 y piqa 0,8270 sobre el checkpoint evaluado.
- Capacidades multimodales: no documentadas para este repositorio. La presencia de `visual`, `in_proj_a` y `in_proj_b` entre las capas excluidas sugiere que el modelo base incorpora componentes de visión, pero la evaluación se ejecutó con `language_model_only=True`, por lo que el comportamiento multimodal de esta cuantización no está verificado.
- Modo de pensamiento (thinking): no confirmado. El parser de razonamiento configurado es `qwen3`, pero todas las evaluaciones se lanzaron con `enable_thinking=False`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Uso en agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles. No se declara lista de idiomas.
- Predicción multi-token (MTP): las capas `mtp` se mantienen sin cuantizar, lo que apunta a que el modelo base incorpora este mecanismo, aunque su funcionamiento efectivo en esta build no está documentado.
- Caché KV en FP8: reduce el consumo de memoria de la caché durante la decodificación y permite aumentar el número de secuencias concurrentes.

## Casos de uso

- Autohospedaje de un modelo de gran tamaño en clústeres de GPU profesionales: la cuantización MXFP4 de las capas de expertos y el esquema MXFP8 del resto permiten servir un modelo cuyo original en BF16 requeriría bastante más VRAM, siempre que se disponga de al menos 200 GB de memoria agregada.
- Servicio conversacional multi-turno: el modelo acepta plantilla de chat y el pipeline declarado es conversacional; con caché KV en FP8 puede mantenerse un número mayor de sesiones simultáneas en la misma GPU, aunque la ventana de contexto efectiva no está publicada.
- Cargas de razonamiento cuantitativo y tutoría de matemáticas: con 0,9280 en gsm8k con 5 ejemplos, es razonable como backend para resolución de problemas aritméticos y de razonamiento encadenado de dificultad media, siempre midiendo antes sobre el dominio propio.
- Evaluación comparativa de esquemas de cuantización: sirve como punto de referencia frente a los otros artefactos del mismo autor (`MXFP4-Mixed-CT-RTN-AutoRound`) y frente a cuantizaciones FP8, para decidir qué esquema desplegar en producción.
- Investigación en cuantización MXFP4 + KV en FP8: el comando de reproducción documenta con precisión la configuración empleada, lo que facilita replicar el experimento y estudiar la degradación por capa al bajar los expertos a 4 bits.
- Despliegue como endpoint compatible con la API de OpenAI sobre vLLM: al ser un checkpoint `compressed-tensors`, encaja en el flujo habitual de vLLM con tensor parallelism, lo que permite sustituir APIs propietarias en tareas de generación y extracción de información.
- Procesamiento por lotes de documentación (resumen, clasificación, extracción de entidades): el coste por token en 4 bits es menor que en BF16, y el formato safetensors permite cargarlo en pipelines de inferencia offline.
- Base de partida para pruebas de aceptación antes de invertir en el modelo original: al ocupar 180 GB, permite validar latencia, calidad y compatibilidad de librerías sin mover pesos en BF16.

## Benchmarks y rendimiento

Resultados reportados en la model card del propio repositorio:

| Benchmark | Resultado | Configuración |
|---|---|---|
| gsm8k | 0,9280 | 5-shot, plantilla de chat, few-shot como multiturno |
| mmlu | 0,8646 | Sin `num_fewshot` especificado en el comando |
| hellaswag | 0,6781 | Sin `num_fewshot` especificado en el comando |
| piqa | 0,8270 | Sin `num_fewshot` especificado en el comando |

Condiciones comunes de evaluación: `lm_eval 0.4.13` con backend vLLM (`vllm 0.29.1rc1.dev528`), `max_model_len=8192`, `gpu_memory_utilization=0.85`, `dtype=bfloat16`, `kv_cache_dtype=fp8`, `max_num_seqs=64`, `max_num_batched_tokens=16384`, `language_model_only=True`, `enable_thinking=False` y semilla 42. El checkpoint evaluado se identifica como `Qwen3.8-Flash-Next-mxfp-w8g32`.

No se han publicado en la información disponible resultados de benchmarks del modelo base ni de otras cuantizaciones comparables, por lo que no es posible calcular la degradación introducida por la cuantización. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 180 GB, de modo que los pesos por sí solos exigen un agregado superior a esa cifra; sumando activaciones, espacio para la caché KV (FP8, `gpu_memory_utilization=0.85`) y buffers, hay que planificar por encima de 200 GB de VRAM.
- GPU recomendadas: configuraciones de 4× H100 80 GB o 4× H200 80 GB como mínimo razonable; 8× H100/H200 si se quiere margen para lotes grandes. GPUs de 141 GB (H200) o la serie B200 reducen el número de tarjetas necesarias.
- GPU de consumo: no cabe. Ni una RTX 4090 (24 GB) ni una RTX 5090 (32 GB) pueden alojar este checkpoint, ni siquiera con `offload` parcial razonable.
- Opciones de despliegue: vLLM es la vía documentada, pero requiere una build con soporte del formato MXFP4-Mixed; la propia model card advierte de que las arquitecturas day-0 pueden necesitar una imagen o rama personalizada. `llama.cpp` y Ollama no están contemplados, ya que el checkpoint está en `compressed-tensors` y no en GGUF. TGI y SGLang no se mencionan en la información disponible.
- Paralelismo: la evaluación se ejecutó con `tensor_parallel_size=1`, pero sobre un checkpoint distinto (`mxfp-w8g32`); para el repositorio completo de 180 GB es previsible necesitar tensor parallelism en varias GPU.
- Latencia y throughput: no disponibles. Los únicos parámetros de referencia son los del arnés de evaluación (`max_num_seqs=64`, `max_num_batched_tokens=16384`, `max_gen_toks=2048`), que no equivalen a cifras de producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Descargas |
|---|---|---|---|---|---|
| Este repositorio (`MXFP4-Mixed-FP8KV-CT-RTN-AutoRound`) | No disponible | No disponible | MXFP4 en expertos + MXFP8 + KV FP8 | No disponible | 0 |
| `INCModel3/Qwen3.8-Flash-Next-MXFP4-Mixed-CT-RTN-AutoRound` | No disponible | No disponible | MXFP4-Mixed | No disponible | No disponible |
| `Qwen/Qwen3.8-Flash-Next` (modelo base) | No disponible | No disponible | BF16 (original) | No disponible | No disponible |
| Qwen3.8-Flash (documentación de QwenCloud) | No disponible | No disponible | No aplica | No disponible | No aplica |

La información disponible no permite comparar parámetros, contexto, rendimiento ni licencia entre alternativas: los repositorios consultados no publican esos datos. La única diferencia verificable entre los artefactos del mismo autor es la variante de cuantización empleada y el sufijo del nombre (con o sin caché KV en FP8).

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no declara licencia y la model card se limita a remitir a la del modelo original. Sin ese dato, el uso comercial queda en una situación de incertidumbre legal que conviene resolver antes de cualquier despliegue en producción.
- Ausencia de validación comunitaria: 0 descargas y 0 likes, y una ventana de publicación de unos 10 minutos entre creación y última actualización. El autor (`INCModel3`) no es el equipo de Qwen, por lo que no hay garantía de mantenimiento ni de corrección de errores.
- Riesgo de alucinación: inherente a cualquier modelo generativo; la cuantización de los expertos a 4 bits puede incrementar la pérdida de fidelidad en dominios poco representados.
- Degradación por cuantización no cuantificada: no hay resultados del modelo base publicados junto a los de esta versión, así que la pérdida de calidad respecto a BF16 es desconocida.
- Benchmarks no verificados de forma independiente: los cuatro resultados proceden de la propia model card y se obtuvieron sobre un checkpoint identificado como `mxfp-w8g32`, que podría no coincidir exactamente con el contenido de este repositorio.
- hellaswag en 0,6781 es un valor llamativamente bajo en relación con el resto de puntuaciones; conviene confirmarlo con una evaluación propia antes de extraer conclusiones.
- Ventana de contexto desconocida: solo se sabe que las pruebas se hicieron con `max_model_len=8192`; no se puede asumir que soporte contextos mayores.
- Idiomas no declarados: no hay lista de idiomas soportados, por lo que el comportamiento en castellano no está garantizado.
- Modo de pensamiento desactivado en las evaluaciones (`enable_thinking=False`): las cifras reportadas no reflejan el rendimiento del modelo con razonamiento extendido.
- Tamaño del repositorio: 180 GB de descarga, con requisitos de almacenamiento y de transferencia considerables antes de la primera inferencia.
- Dependencia de una build específica de vLLM: el soporte de MXFP4-Mixed puede no estar en versiones estables, lo que complica la reproducibilidad y el mantenimiento a medio plazo.
- Los componentes multimodales y de predicción multi-token (`visual`, `mtp`) se excluyeron de la cuantización, pero no hay documentación que confirme su funcionamiento correcto en este repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/INCModel3/Qwen3.8-Flash-Next-MXFP4-Mixed-FP8KV-CT-RTN-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante del mismo autor sin caché KV en FP8: https://huggingface.co/INCModel3/Qwen3.8-Flash-Next-MXFP4-Mixed-CT-RTN-AutoRound
- AutoRound (Intel): https://github.com/intel/auto-round
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Documentación de QwenCloud sobre Qwen3.8-Flash: https://docs.qwencloud.com/developer-guides/getting-started/latest-model
- `autoquant-agent`: la model card apunta a https://github.com/ sin especificar la ruta completa del repositorio, por lo que el enlace no es utilizable tal cual.

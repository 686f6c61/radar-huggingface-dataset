# CMSManhattan/JiRackTernaryGemma4_26b

## Resumen

JiRackTernaryGemma4_26b es una migración del modelo multimodal `google/gemma-4-26B-A4B-it` a la arquitectura ternaria propietaria JiRack, publicada por el usuario CMSManhattan. El modelo conserva el decoder de tipo Mixture-of-Experts (MoE) de Gemma 4 con 128 expertos y top-8, unos 26.000 millones de parámetros totales y aproximadamente 4.000 millones activos por token, pero elimina la torre de visión oficial (unos 550 millones de parámetros) para reducir el consumo de memoria y habilitar contextos largos en hardware modesto. El resultado es un modelo estrictamente de texto.

La innovación principal es la ternarización de pesos siguiendo el enfoque BitNet b1.58: las matrices de atención (`q/k/v/o`), el MLP denso y los 128 expertos se almacenan en precisión ternaria, mientras que embeddings, `lm_head`, router, normalizaciones y `layer_scalar` permanecen en precisión completa. Esto permite ejecutar un modelo de casi 26.000 millones de parámetros en CPU y en GPUs de consumo mediante cuantizaciones GGUF, con un tamaño de fichero de entre 13 GB (Q3_K_M) y 50 GB (F16).

El modelo se distribuye con licencia MIT, soporta trece idiomas y viene acompañado de un tokenizador extendido (`CMSManhattan/GemmaRoboticsTokenizer`) con etiquetas específicas para robótica, routing, FIM y tool calling. Está pensado para despliegues con restricciones de memoria, agentes y automatización de herramientas, si bien el propio autor advierte que no se ha probado con contextos grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder MoE con pesos ternarios (JiRack / BitNet b1.58), 30 capas (5 sliding : 1 full attention) |
| Parametros totales | 25.971.339.294 (~26B) |
| Parametros activos | ~4B por token (128 expertos, top-8) |
| Longitud de contexto | 262.144 en el checkpoint original; la exportación usa tabla RoPE de 4.096 salvo reconstrucción |
| Tipos de cuantizacion | Ternario nativo (QAT), F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16, 13 shards, ~49 GB), GGUF |

Otros datos técnicos: vocabulario de 262.144 tokens con embeddings atados, dimensión oculta 2.816, 16 cabezas de atención, atención deslizante con `head_dim` 256 / 8 KV heads / RoPE θ 10k / ventana 1024, atención completa con `head_dim` 512 / 2 KV heads / RoPE proporcional θ 1e6 / rotary parcial 0,25 / `k_eq_v` sin `v_proj`, MLP denso de 2.112 con GeGLU (`gelu_pytorch_tanh`), RMSNorm con ε = 1e-6 y softcap de 30,0.

## Arquitectura y entrenamiento

El modelo parte del config de texto de `google/gemma-4-26B-A4B-it` y aplica una ruta de Quantization-Aware Training (QAT) hacia pesos ternarios. La arquitectura combina atención deslizante y atención completa en proporción 5:1, con un MLP denso que se aplica a todos los tokens y una capa MoE de 128 expertos de dimensión 704 con enrutamiento top-8. Los elementos ternarizados son las proyecciones de atención (`q/k/v/o`), el MLP denso y los 128 expertos; quedan en precisión completa los embeddings y el `lm_head` atados, el router, las normalizaciones y el `layer_scalar`. La torre de visión del modelo original se ha eliminado por completo.

El autor documenta una advertencia relevante sobre el proceso de entrenamiento: durante el QAT el mecanismo de routing debe permanecer congelado y el entrenamiento del router solo debe iniciarse cuando el parámetro lambda alcance 1,0 y se haya verificado la calidad del modelo base. Las cuantizaciones GGUF publicadas se generaron a partir de la exportación FP16, no del checkpoint ternario nativo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional con plantilla de chat nativa de Gemma 4 (`<|turn>user` / `<|turn>model` / `<turn|>`).
- Razonamiento con modo thinking controlable mediante el flag `enable_thinking` de la plantilla (no mediante sufijo `</think>`).
- Tool calling y function calling, reforzado por el tokenizador extendido `GemmaRoboticsTokenizer` con etiquetas de routing y herramientas.
- Capacidades orientadas a agentes y razonamiento multi-paso, según las etiquetas del modelo (`routing`, `tool-call`, `robotics`).
- Generación de código, con soporte de tokens FIM (fill-in-the-middle) en el tokenizador extendido.
- Multilingüismo en trece idiomas: inglés, chino, japonés, coreano, francés, español, portugués, alemán, italiano, ruso, árabe, vietnamita y tailandés.
- Capacidades especiales declaradas en el tokenizador: etiquetas de robótica (`__ROBOTICS__`, `__CODING__`, etc.) y de estado de ánimo (mood).
- Sin capacidad de visión: la torre multimodal fue eliminada en esta migración.

## Casos de uso

- Atención al cliente automatizada en hardware sin GPU dedicada: la cuantización Q4_K_M (~16 GB) permite servir conversaciones multi-turno en un servidor CPU con suficiente RAM, aprovechando el vocabulario multilingüe para clientes en trece idiomas.
- Agentes de tool calling en producción: el tokenizador extendido con etiquetas de routing y la arquitectura MoE con solo ~4B parámetros activos permiten construir agentes que invocan APIs con latencia contenida y bajo coste de cómputo por token.
- Automatización de robótica e integración con controladores: las etiquetas `__ROBOTICS__` del tokenizador y la orientación explícita del modelo a routing permiten usarlo como capa de decisión en pipelines de instrucciones hacia actuadores.
- Asistencia de código con FIM: los tokens de fill-in-the-middle del tokenizador permiten integrar el modelo en editores y pipelines de CI/CD para completado y generación de parches, con despliegue local vía Ollama.
- Despliegue en edge y estaciones de trabajo modestas: la ruta ternaria BitNet b1.58 y las cuantizaciones Q3_K_M (~13 GB) y Q4_K_M (~16 GB) hacen viable ejecutar un modelo de 26B en equipos sin GPU de datacenter.
- Procesamiento de documentos largos en CPU: aunque el autor advierte que no se ha probado con contextos grandes, el checkpoint soporta hasta 262.144 tokens (con reconstrucción de la tabla RoPE), lo que habilita resumen y extracción sobre corpus extensos en entornos con RAM abundante.
- Experimentación e investigación en cuantización ternaria: el modelo sirve como referencia práctica para estudiar QAT ternario sobre arquitecturas MoE, con pesos safetensors y GGUF disponibles para reproducir experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: F16 ~50 GB, Q8_0 ~28 GB, Q6_K ~22 GB, Q5_K_M ~19 GB, Q4_K_M ~16 GB (recomendada por el autor para uso diario), Q3_K_M ~13 GB.
- Los pesos safetensors en bf16 ocupan ~49 GB repartidos en 13 shards; la inferencia en PyTorch requiere al menos esa cantidad de memoria más el overhead de activaciones.
- GPU recomendadas: no especificadas por el autor. Por tamaño, las cuantizaciones Q4_K_M y Q3_K_M caben en GPUs de consumo con 16-24 GB (por ejemplo, RTX 4090 con 24 GB para Q4_K_M), y las variantes F16 y Q8_0 requieren GPUs de datacenter tipo A100 o H100 de 40-80 GB.
- El modelo está diseñado explícitamente para CPU: las etiquetas incluyen `cpu`, `low-memory` y `efficient`, y el autor indica que en equipos sin AVX2 debe exportarse `MKL_ENABLE_INSTRUCTIONS=AVX`.
- Opciones de despliegue: llama.cpp, Ollama (tag previsto `cmsmanhattan/JiRackTernaryGemma4-26b-q4`), GGUF genérico y carga en PyTorch mediante la clase personalizada `JiRackTernaryGemma4_26b` con `auto_map`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| JiRackTernaryGemma4_26b | ~26B / ~4B (MoE, top-8) | 262.144 (exportación con RoPE 4.096) | MIT | safetensors, GGUF | Ternario BitNet b1.58, solo texto, orientado a CPU |
| google/gemma-4-26B-A4B-it | ~26B / ~4B (MoE, top-8) | 262.144 | Términos de Gemma (no MIT) | safetensors | Modelo base multimodal, incluye torre de visión |
| Gemma 4 26B-A4B en cuantización GGUF convencional | ~26B / ~4B | 262.144 | Términos de Gemma | GGUF | Cuantización post-entrenamiento, sin ruta ternaria nativa |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo frente a estas alternativas.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo no se ha probado con contextos grandes y pide reportar diferencias de calidad frente al original.
- La exportación usa una tabla RoPE de 4.096 posiciones salvo que se reconstruya, por lo que el contexto efectivo puede ser mucho menor que las 262.144 posiciones del checkpoint original.
- La torre de visión ha sido eliminada: no admite entradas de imagen.
- El tokenizador extendido añade 107 tokens por encima de los 262.144 del `token_emb` del checkpoint; no deben emitirse esos ids sin redimensionar los embeddings (`resize_token_embeddings`) y entrenar las filas nuevas.
- Con thinking desactivado el modelo sigue emitiendo un bloque vacío `<|channel>thought\n<channel|>` que debe eliminarse del historial de conversación.
- La ternarización y el QAT pueden introducir degradación de calidad respecto al modelo base; no se han publicado evaluaciones que lo cuantifiquen.
- Riesgo de alucinación y sesgos heredados del modelo base Gemma 4, sin documentación adicional en la información disponible.
- La licencia MIT del artefacto no exime de verificar las condiciones de uso del modelo base de Google del que deriva.
- El proceso de QAT exige congelar el router hasta que lambda alcance 1,0; alterar ese orden puede degradar el enrutamiento de expertos.
- El repositorio ocupa 257,9 GB, lo que exige planificación de almacenamiento para descargar todas las variantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMSManhattan/JiRackTernaryGemma4_26b
- Tokenizador: https://huggingface.co/CMSManhattan/GemmaRoboticsTokenizer
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Ollama (tag previsto): https://ollama.com/cmsmanhattan/JiRackTernaryGemma4-26b-q4

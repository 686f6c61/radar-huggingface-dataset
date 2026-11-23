# mradermacher/Qwen3.8-27B-hermes-adapted-bf16-i1-GGUF

## Resumen

Qwen3.8-27B-hermes-adapted-bf16-i1-GGUF es una recopilación de cuantizaciones GGUF generadas por mradermacher a partir del modelo prithivMLmods/Qwen3.8-27B-hermes-adapted-bf16, un ajuste fino orientado a agentes y entornos de ejecución (harbor, openenv) sobre una base de la familia Qwen3.8 de 27.320.697.856 parámetros. El repositorio no aporta pesos originales en formato transformers, sino únicamente ficheros GGUF cuantizados con imatrix (método i1) para su uso en llama.cpp y derivados.

El modelo base incorpora en su nombre y en sus etiquetas referencias a técnicas de entrenamiento por refuerzo (GRPO y async-GRPO), adaptadores LoRA, decodificación especulativa (MTP) y un perfil claramente orientado a agentes conversacionales con soporte de tool calling. Los datasets citados (harness-hub/scale800-harbor, harness-hub/harness-adapters, harness-hub/termgrade-train-harbor, ai-and/termgrade-environments) apuntan a un entrenamiento centrado en tareas de terminal, adaptadores de harness y evaluación de entornos.

La relevancia de esta publicación es práctica: permite ejecutar un modelo de 27.000 millones de parámetros en hardware de consumo mediante cuantizaciones de 11 a 16 GB, con licencia Apache 2.0 y pesos en GGUF listos para llama.cpp, Ollama o text-generation-inference. No obstante, la información pública disponible es escasa: no hay benchmarks, no se detalla la composición del dataset y el modelo solo declara soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles); el modelo base declara MTP y decodificación especulativa |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S (verificadas); el autor lista además IQ3_XXS, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, IQ4_XS, IQ2_M, IQ2_XS, IQ2_S, IQ1_M, IQ1_S, Q3_K_S, Q3_K_L, Q2_K_S, Q4_0, Q4_1, IQ3_XS, IQ3_S, small-IQ4_NL |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix); el modelo base está en bf16 |

## Arquitectura y entrenamiento

El modelo base es un transformer de 27.320.697.856 parámetros del que no se detalla la arquitectura interna (número de capas, dimensión oculta, atención). Las etiquetas del repositorio indican el uso de MTP (multi-token prediction) y decodificación especulativa, así como un proceso de ajuste con GRPO y async-GRPO sobre adaptadores LoRA. El entrenamiento se apoya en cuatro datasets de harness-hub y ai-and orientados a entornos de terminal, adaptadores de harness y evaluación de tareas (scale800-harbor, harness-adapters, termgrade-train-harbor, termgrade-environments), lo que sugiere un enfoque en agentes que interactúan con herramientas y terminales.

No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo una fase de RLHF/DPO más allá del GRPO mencionado. La cuantización realizada por mradermacher emplea ficheros imatrix (Qwen3.8-27B-hermes-adapted-bf16.imatrix.gguf) para mejorar la calidad de las cuantizaciones de baja precisión; el autor indica que IQ3_XXS es probablemente mejor que i1-Q2_K y que i1-Q4_K_S ofrece la relación óptima entre tamaño, velocidad y calidad.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento multi-paso orientado a agentes, con etiquetas explícitas de agents y openenv.
- Soporte de tool calling y function calling implícito en el perfil de adaptación a harness (no se documenta el esquema exacto).
- Integración con entornos de terminal y ejecución de tareas (termgrade, harbor).
- Compatibilidad con decodificación especulativa mediante MTP.
- Capacidades de visión: el autor indica que es un modelo de visión y que los ficheros mmproj, si existen, están en el repositorio estático.
- Multilingüismo limitado: solo se declara inglés.

## Casos de uso

- Agentes de terminal automatizados: el ajuste sobre termgrade-environments y harbor permite usar el modelo como agente que interpreta comandos, ejecuta tareas en shell y evalúa resultados en pipelines de automatización.
- Orquestación de herramientas en producción: las etiquetas de tool calling y agents lo hacen adecuado para asistentes que invocan APIs externas y encadenan llamadas multi-paso.
- Despliegue en hardware de consumo: la cuantización i1-Q4_K_S (15,9 GB) permite ejecutar un modelo de 27.000 millones de parámetros en una GPU con 24 GB de VRAM, algo inviable con pesos bf16.
- Evaluación de entornos de agente: útil para reproducir experimentos de harness-adapters y comparar el comportamiento del modelo en tareas de terminal antes de integrarlo en un sistema mayor.
- Prototipado de asistentes conversacionales en inglés: la licencia Apache 2.0 y el formato GGUF facilitan pruebas rápidas con llama.cpp u Ollama sin infraestructura dedicada.
- Investigación en RL para agentes: el uso declarado de GRPO y async-GRPO convierte al modelo en un punto de partida para estudiar ajuste por refuerzo en tareas de ejecución.
- Inferencia con decodificación especulativa: MTP permite acelerar la generación en servidores con text-generation-inference cuando se dispone de los pesos adecuados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 11,3 GB con i1-Q2_K, 13,1 GB con i1-IQ3_M y 15,9 GB con i1-Q4_K_S, más overhead de contexto y caché KV.
- GPU recomendadas: RTX 4090 (24 GB) para i1-Q4_K_S con contexto moderado; RTX 3090 (24 GB) equivalente; A100 o H100 para despliegues concurrentes o contextos largos.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más con cuantizaciones IQ3_M o Q4_K_S; en 12 GB solo con i1-Q2_K y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (el repositorio incluye la etiqueta text-generation-inference) y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-hermes-adapted-bf16-i1-GGUF | 27,3 B | no disponible | Apache 2.0 | GGUF | Cuantización imatrix de un ajuste para agentes |
| Qwen3.8-27B-hermes-adapted-bf16 (base) | 27,3 B | no disponible | Apache 2.0 | bf16 (transformers) | Pesos originales sin cuantizar |
| Qwen3.8-27B-hermes-adapted-bf16-GGUF (estático) | 27,3 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas del mismo autor, incluye mmproj |

No se dispone de datos de benchmarks ni de modelos comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano no está verificado.
- No hay benchmarks publicados, por lo que la calidad real frente a otros modelos de 27 B es desconocida.
- Riesgo de alucinación inherente a los modelos generativos, agravado en tareas de terminal donde una acción incorrecta puede tener consecuencias.
- Las cuantizaciones de baja precisión (Q2_K, IQ2) degradan la calidad; el propio autor recomienda IQ3_XXS o superior.
- El repositorio no incluye los pesos bf16 originales ni los ficheros mmproj de visión, que están en el repositorio estático.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datasets de entrenamiento.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- No se documenta la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-hermes-adapted-bf16-i1-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Qwen3.8-27B-hermes-adapted-bf16
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.8-27B-hermes-adapted-bf16-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-hermes-adapted-bf16-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests

# mradermacher/Qwen3.8-27B-super-adapter-bf16-GGUF

## Resumen

Qwen3.8-27B-super-adapter-bf16-GGUF es la versión cuantizada en formato GGUF del modelo prithivMLmods/Qwen3.8-27B-super-adapter-bf16, un modelo de 27.320 millones de parámetros desarrollado a partir de la familia Qwen3.8 y afinado mediante técnicas de adaptación (LoRA y merge de adaptadores) sobre datasets orientados a agentes y entornos de ejecución (harness-hub/scale800-harbor, harness-hub/harness-adapters, harness-hub/termgrade-train-harbor y ai-and/termgrade-environments). La cuantización la firma mradermacher, un autor habitual en la publicación de versiones GGUF de modelos abiertos, que pone a disposición tanto quants estáticos como quants ponderados/imatrix en un repositorio separado.

La relevancia de esta ficha reside en su orientación explícita a agentes: las etiquetas del modelo incluyen mtp, speculative-decoding, text-generation-inference, grpo, async-grpo, lora, agents, harbor, openenv, pi, hermes y opencode, lo que sugiere un entrenamiento con refuerzo (GRPO y async-GRPO) sobre entornos de herramientas y un soporte nativo de decodificación especulativa mediante MTP (multi-token prediction). El resultado es un modelo de 27B con licencia Apache 2.0, pensado para integrarse en pipelines de agentes y en entornos de evaluación tipo harness.

El repositorio incluye además suplementos multimodales (mmproj-Q8_0 y mmproj-f16), lo que indica que el modelo base admite entrada visual. El tamaño total del repo es de 192,3 GB, correspondiente al conjunto de cuantizaciones publicadas (desde Q2_K hasta Q8_0), y el modelo acumula 768 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8) con soporte de MTP y decodificación especulativa; arquitectura exacta no disponible |
| Parametros totales | 27.320.697.856 (27,32 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) según la model card; resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en bf16/safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer de 27,32 mil millones de parámetros derivado de la familia Qwen3.8. Según las etiquetas y la model card, el entrenamiento combina adaptadores LoRA fusionados (merge) con un ajuste por refuerzo basado en GRPO y async-GRPO sobre datasets de entornos de agentes: harness-hub/scale800-harbor, harness-hub/harness-adapters, harness-hub/termgrade-train-harbor y ai-and/termgrade-environments. Estos datasets apuntan a tareas de ejecución de herramientas, evaluación de terminal y entornos tipo harbor/openenv, lo que explica la orientación del modelo a flujos agénticos.

La model card menciona explícitamente MTP (multi-token prediction) y decodificación especulativa, lo que sugiere que el modelo incorpora cabezas de predicción multi-token para acelerar la inferencia en servidores compatibles (por ejemplo, vLLM o TGI con soporte de speculative decoding). No se especifica el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo una fase adicional de DPO o RLHF más allá del GRPO indicado. Tampoco se detalla la arquitectura interna (número de capas, dimensión oculta, cabezas de atención) ni la longitud de contexto nativa.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat (etiqueta conversational).
- Razonamiento orientado a agentes: ejecución de tareas multi-paso en entornos de herramientas (harbor, openenv, terminal).
- Soporte de tool calling y function calling, inferido de las etiquetas agents, hermes y opencode.
- Entrenamiento con GRPO y async-GRPO, lo que indica capacidad de seguir recompensas y políticas en entornos interactivos.
- Decodificación especulativa mediante MTP para acelerar la generación en servidores compatibles.
- Capacidades multimodales: el repo incluye suplementos mmproj (Q8_0 y f16), lo que indica soporte de entrada de imágenes en el modelo base.
- Integración con text-generation-inference (TGI) y con el ecosistema GGUF (llama.cpp, Ollama).
- Capacidades multilingües: solo se declara inglés; no hay evidencia de soporte de otros idiomas.

## Casos de uso

- Agentes autónomos de terminal: el modelo puede integrarse en entornos tipo harbor/openenv para ejecutar comandos, interpretar salidas y corregir errores en bucles multi-paso, gracias a su entrenamiento específico con datasets de terminal (termgrade).
- Automatización de pipelines de CI/CD con tool calling: el modelo puede invocar funciones de build, test y despliegue a través de function calling, integrándose en orquestadores que expongan herramientas como APIs.
- Asistente de código en IDE: con las etiquetas opencode y hermes, el modelo está orientado a la generación y edición de código dentro de flujos de desarrollo, incluyendo la lectura de archivos y la propuesta de parches.
- Evaluación de agentes en harness: al haber sido entrenado sobre harness-hub, es adecuado como modelo de referencia en benchmarks de agentes que midan la tasa de éxito en tareas de terminal y ejecución de herramientas.
- Despliegue en local con cuantización Q4_K_M (17,1 GB): permite ejecutar un modelo de 27B en una GPU de consumo de 24 GB (RTX 4090) o en configuraciones multi-GPU pequeñas, útil para prototipos de agentes sin depender de la nube.
- Servicio de inferencia con decodificación especulativa: en servidores con vLLM o TGI que soporten MTP, el modelo puede servir conversaciones multi-turno con latencia reducida, adecuado para asistentes interactivos.
- Procesamiento de documentos con entrada visual: gracias a los suplementos mmproj, puede emplearse en tareas que combinen texto e imágenes, como la interpretación de capturas de pantalla o diagramas en flujos de soporte técnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~11,3 GB; Q3_K_S ~12,4 GB; Q3_K_M ~13,8 GB; Q3_K_L ~15,0 GB; IQ4_XS ~15,8 GB; Q4_K_S ~15,9 GB; Q4_K_M ~17,1 GB; Q5_K_S ~19,1 GB; Q5_K_M ~19,7 GB; Q6_K ~22,5 GB; Q8_0 ~29,1 GB.
- Suplementos multimodales: mmproj-Q8_0 ~0,7 GB y mmproj-f16 ~1,0 GB adicionales si se usa entrada visual.
- GPU recomendadas: para Q4_K_M y Q5_K_M, una RTX 4090 (24 GB) es suficiente; para Q6_K y Q8_0 se recomienda una A100 40 GB, H100 o RTX 6000 Ada. Para bf16 completo (no incluido en este repo) se necesitarían ~55 GB, lo que exige A100 80 GB o H100.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con Q4_K_M, Q5_K_M o Q6_K; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF y speculative decoding), TGI (etiqueta text-generation-inference), y servidores compatibles con endpoints.
- Latencia y throughput: no disponibles; el uso de MTP y decodificación especulativa debería reducir la latencia en servidores compatibles, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-super-adapter-bf16-GGUF (este) | 27,32 B | no disponible | Apache 2.0 | GGUF | Afinado para agentes con GRPO; MTP; multimodal |
| Qwen3-32B (referencia de la familia) | 32 B | 128K (según versión) | Apache 2.0 | safetensors, GGUF | Modelo generalista de la misma familia; sin afinado específico de agentes |
| Gemma 3 27B | 27 B | 128K | Gemma license | safetensors, GGUF | Multimodal, contexto largo; licencia más restrictiva |
| Mistral Small 3.1 24B | 24 B | 128K | Apache 2.0 | safetensors, GGUF | Multimodal, orientado a instrucciones; sin entrenamiento GRPO específico |

La comparativa con Qwen3-32B, Gemma 3 27B y Mistral Small 3.1 24B se ofrece como referencia de categoría; no se dispone de datos de benchmarks de este modelo para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: no se especifica la longitud de contexto nativa, lo que impide planificar despliegues con ventanas largas sin verificación previa.
- Sesgos: no se documentan sesgos conocidos; al ser un modelo afinado sobre datasets de agentes, puede presentar sesgos hacia formatos de herramientas y entornos específicos (harbor, openenv, terminal).
- Alucinación: como todo modelo generativo, puede inventar comandos, rutas o APIs; en entornos de ejecución real es imprescindible sandboxing y validación de salidas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los datasets de entrenamiento (harness-hub, ai-and) por si imponen restricciones adicionales.
- Producción: el modelo base es un merge de adaptadores; la calidad puede degradarse en dominios alejados de los datasets de entrenamiento. No hay benchmarks publicados que respalden su rendimiento general.
- Cuantizaciones bajas (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-super-adapter-bf16-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Qwen3.8-27B-super-adapter-bf16
- Quants ponderados/imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-super-adapter-bf16-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-super-adapter-bf16-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Dataset harness-hub/scale800-harbor: https://huggingface.co/datasets/harness-hub/scale800-harbor
- Dataset harness-hub/harness-adapters: https://huggingface.co/datasets/harness-hub/harness-adapters
- Dataset harness-hub/termgrade-train-harbor: https://huggingface.co/datasets/harness-hub/termgrade-train-harbor
- Dataset ai-and/termgrade-environments: https://huggingface.co/datasets/ai-and/termgrade-environments

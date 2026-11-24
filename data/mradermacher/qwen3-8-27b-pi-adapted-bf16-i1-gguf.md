# mradermacher/Qwen3.8-27B-pi-adapted-bf16-i1-GGUF

## Resumen

Qwen3.8-27B-pi-adapted-bf16-i1-GGUF es una cuantización en formato GGUF, generada con calibración imatrix, del modelo prithivMLmods/Qwen3.8-27B-pi-adapted-bf16, un fine-tuning de la familia Qwen3.8 de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones). El trabajo de cuantización lo firma mradermacher, un publicador habitual de cuantizaciones GGUF de terceros, no el autor original del modelo base. El modelo base incorpora las etiquetas mtp, grpo, async-grpo, lora, agents, harbor, openenv y pi, lo que sugiere un ajuste orientado a agentes y entornos de ejecución de herramientas, aunque la model card no documenta el proceso de entrenamiento con detalle.

La relevancia práctica de esta publicación es que permite ejecutar un modelo de 27B en hardware de consumo o en servidores modestos: el repositorio ofrece 15 cuantizaciones que van desde i1-Q2_K (11,3 GB) hasta i1-Q6_K (22,5 GB), además del fichero imatrix de 0,1 GB para generar cuantizaciones propias. El repositorio completo ocupa 220,5 GB, pero el usuario solo necesita descargar el fichero de la cuantización elegida.

La licencia es Apache 2.0, lo que facilita el uso comercial. La información disponible es escasa en cuanto a arquitectura interna, datos de entrenamiento y benchmarks: la model card se limita a la lista de cuantizaciones y a notas genéricas sobre el formato GGUF, sin resultados de evaluación ni detalles del ajuste. El idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.8; la model card no detalla la arquitectura) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con calibración imatrix: i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (también existe una variante estática en el repositorio -GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base); fichero imatrix incluido para recalibrar |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Por el nombre y la familia (Qwen3.8, 27B) se trata presumiblemente de un transformer decoder-only, pero la model card no confirma capa de atención, número de capas ni dimensiones ocultas. Tampoco se especifica si emplea Mixture of Experts: con 27,3 B de parámetros totales y sin campo de parámetros activos, lo más probable es que sea un modelo denso.

Las etiquetas del modelo base (grpo, async-grpo, lora, agents, harbor, openenv, pi, mtp) apuntan a un ajuste fino con GRPO (Group Relative Policy Optimization) y su variante asíncrona, adaptadores LoRA y entrenamiento sobre los datasets harness-hub/scale800-harbor y harness-hub/termgrade-train-harbor, orientados a tareas de agente y evaluación de terminal. La etiqueta mtp podría indicar multi-token prediction, y pi, un entorno o framework de agentes. No se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La cuantización de mradermacher emplea calibración imatrix (importancia de pesos) para mejorar la calidad de las cuantizaciones de baja precisión; la model card indica quantize_version 2, output_tensor_quantised 1 y convert_type hf.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta conversational.
- Orientación a agentes y uso de herramientas: las etiquetas agents, harbor, openenv y pi sugieren entrenamiento para entornos de ejecución de tareas y terminal.
- Razonamiento multi-paso y ajuste por refuerzo: presencia de grpo y async-grpo en las etiquetas del modelo base.
- Posible soporte de multi-token prediction (etiqueta mtp), aunque no se detalla su implementación.
- Compatibilidad con text-generation-inference (TGI) y transformers, según las etiquetas de librería.
- Capacidad de visión: la model card de mradermacher indica que es un modelo de visión y que los ficheros mmproj, si existen, están en el repositorio estático; no se confirma que esta cuantización incluya proyector multimodal.
- Capacidades multilingües: no disponibles; el único idioma declarado es inglés.
- Tool calling / function calling: no documentado explícitamente, aunque las etiquetas de agentes lo hacen plausible; no hay confirmación en la información disponible.

## Casos de uso

- Despliegue local de un modelo de 27B en una estación de trabajo: con la cuantización i1-Q4_K_M (17,1 GB) se puede ejecutar en una GPU de 24 GB o en CPU con llama.cpp, lo que permite experimentar con un modelo grande sin infraestructura de centro de datos.
- Prototipado de agentes autónomos: el ajuste con GRPO y las etiquetas harbor/openenv indican entrenamiento para tareas de agente; se usaría como política de un agente que ejecuta comandos y evalúa resultados en un entorno controlado.
- Evaluación de modelos en pipelines de CI: al estar disponible en GGUF y con licencia Apache 2.0, se puede integrar en pruebas automatizadas de calidad de generación sin coste de licencia.
- Generación de texto conversacional en inglés: para asistentes de documentación técnica o chat interno donde el contexto y los requisitos de hardware estén acotados.
- Investigación sobre cuantización: el fichero imatrix y las 15 variantes permiten estudiar la degradación de calidad entre Q2_K y Q6_K sobre un mismo modelo base, útil para trabajos de compresión.
- Fine-tuning posterior sobre la cuantización: aunque el GGUF no es el formato ideal para entrenar, el modelo base en bf16 (prithivMLmods/Qwen3.8-27B-pi-adapted-bf16) sirve para ajustes con LoRA y luego recuantizar con el imatrix proporcionado.
- Servicio de inferencia con TGI: la etiqueta text-generation-inference sugiere compatibilidad con el servidor de Hugging Face para despliegues con batching continuo, aunque el formato GGUF se sirve mejor con llama.cpp o vLLM (soporte GGUF experimental).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la cuantización no incluye MMLU, HumanEval, GSM8K ni comparaciones con otros modelos, y tampoco se aportan métricas de perplejidad por cuantización más allá del gráfico genérico enlazado por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaño del fichero, sin contar overhead de contexto): i1-Q2_K 11,3 GB; i1-Q3_K_S 12,4 GB; i1-IQ3_S 12,9 GB; i1-IQ3_M 13,1 GB; i1-Q3_K_M 13,8 GB; i1-Q3_K_L 15,0 GB; i1-IQ4_XS 15,6 GB; i1-Q4_0 15,9 GB; i1-Q4_K_S 15,9 GB; i1-Q4_K_M 17,1 GB; i1-Q4_1 17,4 GB; i1-Q5_K_S 19,1 GB; i1-Q5_K_M 19,7 GB; i1-Q6_K 22,5 GB.
- GPU recomendadas: para Q4_K_M o superiores, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permite cargar el modelo completo en VRAM con contexto moderado; para Q5 y Q6 conviene una A6000 (48 GB), A100 (40/80 GB) o H100 (80 GB) si se necesita contexto largo o batching.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones Q3 e IQ3 (12-15 GB) caben en tarjetas de 16 GB como la RTX 4060 Ti 16 GB o la RTX 4080; las Q4 caben en 24 GB. Las Q2 (11,3 GB) pueden ejecutarse en 12 GB con contexto reducido.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) para GGUF; vLLM con soporte GGUF experimental para mayor throughput; TGI si se convierte a safetensors; el repositorio estático -GGUF contiene los ficheros mmproj para uso multimodal si el modelo base los requiere.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted-bf16-i1-GGUF (este) | 27,3 B | no disponible | Apache 2.0 | GGUF (15 cuants) | Cuantización imatrix de un fine-tuning orientado a agentes |
| prithivMLmods/Qwen3.8-27B-pi-adapted-bf16 (base) | 27,3 B | no disponible | Apache 2.0 | safetensors/bf16 | Modelo original sin cuantizar; requiere ~55 GB en bf16 |
| mradermacher/Qwen3.8-27B-pi-adapted-bf16-GGUF (estático) | 27,3 B | no disponible | Apache 2.0 | GGUF estático | Misma base, cuantización sin imatrix; incluye mmproj para visión |
| Modelos Qwen3.8 de otros tamaños | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparación con alternativas de la misma categoría (otros modelos de ~27B en GGUF) no puede completarse con datos verificables a partir de la información disponible; se indica "no disponible" para evitar cifras inventadas.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero al ser un ajuste con GRPO sobre datasets específicos de agentes (harbor, termgrade) puede heredar sesgos de esas distribuciones y comportamientos sobreajustados a tareas de terminal.
- Riesgo de alucinación: no cuantificado; no hay evaluaciones publicadas de fidelidad ni de tasa de alucinación.
- Idioma: solo se declara inglés; el rendimiento en castellano no está verificado y probablemente sea inferior.
- Longitud de contexto: no disponible; planificar despliegues con contexto conservador hasta verificarla empíricamente.
- Las cuantizaciones de baja precisión (Q2_K, Q3) degradan la calidad; el propio autor recomienda IQ3_XXS o IQ3_S frente a Q2_K y Q3_K_S. Para producción se recomienda Q4_K_M o superior.
- La cuantización la realiza un tercero (mradermacher), no el autor del modelo base; posibles diferencias de comportamiento respecto al bf16 original no están documentadas.
- Visión: la model card indica que es un modelo de visión, pero los ficheros mmproj están en el repositorio estático, no en este; verificar antes de asumir capacidades multimodales.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datasets de entrenamiento (harness-hub/scale800-harbor, harness-hub/termgrade-train-harbor) por si imponen restricciones adicionales.
- El repositorio ocupa 220,5 GB; descargar solo el fichero de la cuantización necesaria para evitar consumo innecesario de disco y ancho de banda.

## Enlaces

- Repositorio Hugging Face (esta cuantización): https://huggingface.co/mradermacher/Qwen3.8-27B-pi-adapted-bf16-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.8-27B-pi-adapted-bf16-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Qwen3.8-27B-pi-adapted-bf16
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-pi-adapted-bf16-i1-GGUF
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de tipos de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset de entrenamiento: https://huggingface.co/datasets/harness-hub/scale800-harbor
- Dataset de entrenamiento: https://huggingface.co/datasets/harness-hub/termgrade-train-harbor

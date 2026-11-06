# richardyoung/OLMo-2-0325-32B-Instruct-GMPOA-heretic

## Resumen

OLMo-2-0325-32B-Instruct-GMPOA-heretic es una variante "decensored" del modelo allenai/OLMo-2-0325-32B-Instruct, publicada por el usuario richardyoung. Se ha generado aplicando la herramienta Heretic v2.0.0, que realiza una ablación ortogonal de direcciones en los pesos del modelo (Gamma-Exact Magnitude-Preserving Orthogonal Ablation, GammaMPOA) para eliminar el comportamiento de rechazo aprendido durante el post-entrenamiento. El resultado conserva la arquitectura y el conocimiento del modelo original, pero reduce drásticamente las negativas a responder.

El modelo base OLMo 2 32B Instruct es un transformer decoder-only de 32.234.279.936 parámetros desarrollado por el Allen Institute for AI (Ai2), post-entrenado mediante SFT sobre una variante del dataset Tülu 3, seguido de DPO y RLVR. Forma parte de la familia OLMo, cuyo objetivo es la investigación abierta: se publican pesos, código, checkpoints intermedios y logs de entrenamiento. La licencia Apache 2.0 permite uso comercial y modificación.

La relevancia de esta ficha radica en que combina dos vertientes: por un lado, un modelo de 32B totalmente abierto y reproducible; por otro, una intervención de ablación que modifica el comportamiento de seguridad. Según la model card, los rechazos bajan de 98/100 en el original a 7/100 en esta variante, con una divergencia KL de 0.0852 respecto al modelo base. Es, por tanto, un caso de estudio útil sobre alineación, seguridad y edición de pesos, pero también un modelo con caveats importantes para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 2) |
| Parametros totales | 32.234.279.936 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | en (principalmente ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia OLMo 2, entrenado por Ai2 sobre el dataset Dolma y post-entrenado en tres fases: SFT sobre una variante de Tülu 3 específica para OLMo 2, DPO sobre el dataset olmo-2-0325-32b-preference-mix y RLVR final sobre allenai/RLVR-GSM-MATH-IF-Mixed-Constraints. La model card del autor cita los papers de OLMo 2 (arXiv:2501.00656) y Tülu 3 (arXiv:2411.15124) como referencia. No se especifican en la informacion proporcionada el numero exacto de tokens de entrenamiento ni la composicion detallada del corpus.

La innovacion principal de esta variante es la ablación GammaMPOA aplicada con Heretic v2.0.0. Se identifican direcciones en las proyecciones de atención (attn.o_proj) y en las proyecciones de la MLP (mlp.down_proj) asociadas al comportamiento de rechazo, y se eliminan mediante una ablación ortogonal que preserva la magnitud de los pesos. Los parámetros publicados incluyen direction_index 39.98, max_weight 1.43 en attn.o_proj (posición 39.56) y max_weight 1.42 en mlp.down_proj (posición 43.26), entre otros. El resultado es un modelo con comportamiento conversacional alterado pero sin reentrenamiento adicional.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento y matematicas: el modelo base fue entrenado con RLVR sobre GSM y MATH, por lo que conserva capacidades aritmeticas y de resolucion de problemas.
- Instrucciones complejas: el post-entrenamiento con Tülu 3 incluye IFEval, lo que sugiere buen seguimiento de instrucciones verificables.
- Respuestas sin rechazo: la ablación reduce los rechazos de 98/100 a 7/100 segun la model card, lo que permite obtener respuestas a peticiones que el modelo original declinaria.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no confirmado explicitamente en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar empiricamente como la ablacion de direcciones en los pesos afecta al comportamiento de rechazo, comparando con el modelo original mediante la divergencia KL reportada (0.0852).
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, donde el modelo original rechazaria la peticion.
- Analisis de sesgos y robustez: al tener una contraparte alineada (el modelo original) y una ablacionada, sirve para comparar respuestas y medir el efecto de la intervencion sobre sesgos y toxicidad.
- Evaluacion de pipelines de moderacion: util para probar sistemas de filtrado y clasificadores de seguridad frente a un modelo que genera contenido que otros rechazan.
- Razonamiento matematico y STEM en ingles: conserva el entrenamiento RLVR sobre GSM8K y MATH del modelo base, por lo que puede emplearse en tareas de resolucion de problemas numericos.
- Fine-tuning posterior: al estar en safetensors y con licencia Apache 2.0, puede servir como punto de partida para ajustes especificos donde se quiera partir de un modelo sin el sesgo de rechazo del original.
- Despliegue en entornos de investigacion controlados: con 32B parametros y pesos abiertos, es viable en infraestructura propia para experimentos reproducibles sin dependencia de APIs.

## Benchmarks y rendimiento

La model card solo reporta metricas comparativas de la intervencion de ablacion, no benchmarks estandar de tareas:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos (sobre 100) | 7/100 | 98/100 |
| Divergencia KL | 0.0852 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para esta variante en la informacion disponible. Los benchmarks del modelo base OLMo-2-0325-32B-Instruct estan disponibles en su propia model card, pero no se reproducen aqui al no haberse proporcionado sus valores completos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 64 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se recomienda 80 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 32-35 GB, viable en una A100 40GB o en dos RTX 4090.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 16-20 GB, cabe en una RTX 4090 (24 GB) o RTX 3090.
- GPU recomendadas: A100 80GB, H100 80GB para BF16; A100 40GB o configuraciones multi-GPU para 8 bits; RTX 4090 para 4 bits.
- Cabe en consumer GPU: si, en RTX 4090/3090 con cuantizacion de 4 bits; en BF16 no cabe en ninguna consumer actual.
- Opciones de despliegue: transformers (soporte oficial de OLMo 2 en la rama main), vLLM y TGI previsiblemente compatibles al ser arquitectura olmo2; llama.cpp/Ollama requeririan conversion a GGUF, no publicada en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-2-0325-32B-Instruct-GMPOA-heretic | 32.234.279.936 | no disponible | Apache 2.0 | Variante ablacionada, 7/100 rechazos, KL 0.0852 |
| allenai/OLMo-2-0325-32B-Instruct | 32.234.279.936 | no disponible | Apache 2.0 | Modelo original, 98/100 rechazos, referencia de comparacion |
| Mistral-Nemo-Instruct-2407 | no disponible en la informacion | no disponible | Apache 2.0 | Alternativa abierta de tamano menor; benchmarks parciales en la model card del original |
| Ministral-8B-Instruct | no disponible en la informacion | no disponible | no disponible | Alternativa abierta de 8B; benchmarks parciales en la model card del original |

La comparacion directa con modelos de 32B ablacionados equivalentes no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion elimina el comportamiento de rechazo pero no garantiza la eliminacion de sesgos ni de contenido danino; el modelo puede producir salidas problematicas, especialmente si se le induce.
- La model card advierte que los modelos OLMo 2 tienen entrenamiento de seguridad limitado y no incluyen filtrado en bucle como ChatGPT.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta generacion; no se han publicado evaluaciones especificas de factualidad para esta variante.
- Idiomas: soporte practicamente limitado al ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto: no especificada en la informacion proporcionada; conviene consultar la model card del modelo base antes de desplegar con contextos largos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ablacionado; el uso en produccion orientado al usuario final requiere moderacion externa.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria independiente.
- La intervencion GammaMPOA modifica pesos de atencion y MLP; puede degradar sutilmente capacidades no relacionadas con el rechazo (la KL de 0.0852 indica divergencia no nula respecto al original).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-GMPOA-heretic
- Modelo base: https://huggingface.co/allenai/OLMo-2-0325-32B-Instruct
- Modelo base (pre-DPO): https://huggingface.co/allenai/OLMo-2-0325-32B
- Heretic: https://heretic-project.org
- Paper OLMo 2: https://arxiv.org/abs/2501.00656
- Paper Tülu 3: https://arxiv.org/abs/2411.15124
- Pagina del proyecto OLMo: https://allenai.org/olmo
- Repo de entrenamiento e inferencia: https://github.com/allenai/OLMo-core
- Repo de evaluacion: https://github.com/allenai/olmes
- Repo de fine-tuning: https://github.com/allenai/open-instruct
- Demo: https://playground.allenai.org/
- Dataset SFT: https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture
- Dataset DPO: https://huggingface.co/datasets/allenai/olmo-2-0325-32b-preference-mix
- Dataset RLVR: https://huggingface.co/datasets/allenai/RLVR-GSM-MATH-IF-Mixed-Constraints

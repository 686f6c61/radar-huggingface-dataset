# khadija123it/qwen-dpo-beta-01

## Resumen

`khadija123it/qwen-dpo-beta-01` es un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo base Qwen2.5-0.5B, publicado por el usuario khadija123it en Hugging Face. Se trata de un artefacto de pesos PEFT que no contiene un modelo completo, sino únicamente las matrices de bajo rango que deben combinarse con el checkpoint original de Qwen2.5-0.5B para su uso. El repositorio tiene un tamaño efectivo de 0.0 GB (solo el adaptador) y registra cero descargas y cero likes en el momento de la consulta.

El modelo base, Qwen2.5-0.5B, es un transformer decoder-only de 0,49 mil millones de parámetros desarrollado por Alibaba Qwen, con una ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 en la familia Qwen2.5) y soporte multilingüe. El adaptador aplica preferencias mediante DPO, técnica que optimiza directamente el modelo de política frente a pares de respuestas preferidas y rechazadas sin necesidad de un modelo de recompensa separado.

La relevancia de esta ficha es limitada pero real: se trata de un ejemplo de ajuste de alineación sobre un modelo diminuto, útil para experimentación con técnicas de RLHF/DPO en hardware de consumo. La model card está prácticamente vacía (plantilla sin rellenar), por lo que la mayor parte de los metadatos técnicos (datos de entrenamiento, hiperparámetros, licencia, idiomas, evaluación) no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-0.5B |
| Parametros totales | 0,49 mil millones (modelo base); rango LoRA no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-0.5B) |
| Tipos de cuantizacion | no disponible para el adaptador; el base admite GGUF, AWQ, GPTQ, bitsandbytes (4/8 bits) |
| Idiomas soportados | no disponible en la model card; el base Qwen2.5 es multilingüe (chino, inglés y otros) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) que se inyecta en las capas del transformer Qwen2.5-0.5B. Qwen2.5-0.5B emplea atención causal estándar con RoPE, normalización RMSNorm y capas SwiGLU en el feed-forward, siguiendo la arquitectura densa de la familia Qwen2.5. El adaptador se entrenó con DPO, un método de alineación que maximiza la probabilidad de respuestas preferidas frente a rechazadas usando un término de referencia congelado (el propio modelo base), evitando así la necesidad de un reward model explícito.

No se dispone de información sobre el dataset de preferencias utilizado, el número de pares, la configuración de hiperparámetros (beta de DPO, learning rate, rango LoRA, alpha, dropout), la precisión de entrenamiento ni la duración. La model card no documenta ninguna innovación técnica adicional más allá del uso de TRL y PEFT (versión 0.21.2 declarada). No consta decodificación especulativa, attention lineal ni modificaciones arquitectónicas sobre el base.

## Capacidades

- Generación de texto conversacional en el estilo alineado por DPO sobre el modelo base.
- Razonamiento básico y respuesta a instrucciones heredados de Qwen2.5-0.5B.
- Generación de código y matemáticas elementales a nivel propio de un modelo de 0,5B (limitado).
- Soporte multilingüe parcial heredado del base (chino e inglés principalmente).
- No se documenta soporte de tool calling, function calling ni modo agente específico en el adaptador.
- No hay capacidades de visión, audio ni thinking mode.
- Capacidad de ajuste fino adicional: al ser un adaptador PEFT, puede combinarse o apilarse con otros adaptadores.

## Casos de uso

- Experimentación académica con DPO: el adaptador sirve para estudiar cómo cambia el comportamiento de un modelo de 0,5B tras la optimización de preferencias, comparando salidas con y sin el adaptador sobre el mismo base.
- Prototipado rápido en hardware de consumo: al requerir menos de 1 GB en fp16, permite iterar pipelines de alineación en portátiles o GPUs de gama baja sin infraestructura dedicada.
- Evaluación de técnicas PEFT: útil como caso de estudio de carga de adaptadores LoRA con la librería PEFT y su fusión con el modelo base mediante `merge_and_unload`.
- Generación de texto de bajo coste en edge devices: tras fusionar y cuantizar a GGUF, puede desplegarse en CPU para tareas de autocompletado o chatbots muy ligeros.
- Filtrado y clasificación de texto simple: con prompts adecuados, un modelo de 0,5B alineado puede etiquetar o resumir fragmentos cortos en entornos con restricciones de memoria.
- Base para experimentos de apilamiento de adaptadores: permite probar la combinación de este DPO con otros LoRA (por ejemplo, de instrucción o de dominio) para analizar interferencia entre adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye sección de evaluación completada, y el repositorio no reporta métricas de MMLU, HumanEval, GSM8K ni de win-rate frente al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en fp16 ocupa aproximadamente 1 GB; el adaptador añade unos pocos MB. En 4 bits (bitsandbytes) baja a ~0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, T4 o superiores son suficientes. A100/H100 no son necesarias.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), llama.cpp/Ollama tras fusionar y convertir a GGUF, vLLM (tras fusionar el adaptador en el base), TGI.
- Latencia y throughput estimados: no disponibles. Para un modelo de 0,5B en una RTX 4090 se esperan varios cientos de tokens por segundo, pero no hay mediciones publicadas para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| khadija123it/qwen-dpo-beta-01 | 0,49B (base) + LoRA | 32.768 | Adaptador DPO | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-0.5B | 0,49B | 32.768 | Modelo completo | Apache 2.0 (base) | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49B | 32.768 | Modelo completo alineado (SFT+DPO) | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-360M-Instruct | 0,36B | 8.192 | Modelo completo alineado | Apache 2.0 | Hugging Face |

El adaptador no aporta ventajas medibles frente a Qwen2.5-0.5B-Instruct, que ya incorpora alineación oficial y está publicado con licencia Apache 2.0. Su interés es fundamentalmente didáctico o experimental.

## Limitaciones y advertencias

- Model card sin completar: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto, lo que impide auditar el adaptador.
- Licencia no declarada: no puede asumirse uso comercial; debe verificarse la licencia del modelo base (Apache 2.0) y contactar con el autor para el adaptador.
- Riesgo elevado de alucinación y errores factuales por el tamaño reducido del modelo base (0,5B).
- Capacidad multilingüe limitada y no documentada; el rendimiento en castellano será previsiblemente bajo.
- Sin soporte documentado de tool calling ni de flujos agente, por lo que no es adecuado para pipelines que requieran function calling fiable.
- Sin benchmarks publicados: no hay evidencia de que el DPO mejore al base en tareas medibles; podría incluso degradar capacidades si el dataset de preferencias era pequeño o sesgado.
- Repositorio con 0 descargas y creado recientemente: sin validación por parte de la comunidad.
- El adaptador debe combinarse con el checkpoint exacto Qwen/Qwen2.5-0.5B; no es un modelo autónomo.

## Enlaces

- Hugging Face: https://huggingface.co/khadija123it/qwen-dpo-beta-01
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL (DPO): https://github.com/huggingface/trl
- Paper DPO (Rafailov et al., 2023): https://arxiv.org/abs/2305.18290
- Paper LoRA (Hu et al., 2021): https://arxiv.org/abs/2106.09685
- Calculadora de impacto de carbono (referenciada en la model card): https://mlco2.github.io/impact

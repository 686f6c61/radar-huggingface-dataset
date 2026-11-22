# Liber-Moe/Qwen3.8-Flash-Next-Uncensored-NVFP4

## Resumen

Qwen3.8-Flash-Next-Uncensored-NVFP4 es una cuantización de pesos en NVFP4 (4 bits) del modelo Qwen3.8-Flash-Next de Alibaba Qwen, sobre el que se ha aplicado una técnica de *abliteration* para eliminar la dirección de rechazo del flujo residual, dando como resultado un modelo que responde a peticiones que el original declinaría. Lo publica el usuario Liber-Moe bajo licencia Apache 2.0 y está pensado exclusivamente para investigación en seguridad, interpretabilidad y red-teaming. El modelo base es un Mixture-of-Experts de gran escala (512 expertos, 10 enrutados más 1 compartido activos) que constituye una vista previa de la arquitectura Qwen4 (identificador `qwen4_exp`), con atención lineal Gated DeltaNet combinada con Qwen Sparse Attention, HyperConnections, embeddings PLE de n-gramas, visión-lenguaje nativa, razonamiento y *tool calling*.

La cuantización reduce el peso de aproximadamente 330 GB en bf16 a unos 178 GB, manteniendo los pesos de los expertos MoE en FP4 (formato NVIDIA E2M1, con escalas de bloque FP8 y grupo de 16) y los pesos de atención y del experto compartido en FP8. El resultado es un modelo de aproximadamente 180 000 millones de parámetros totales que solo puede ejecutarse en hardware Blackwell (B100, B200, GB200 o RTX 50) con una build reciente de vLLM que soporte la arquitectura `qwen4_exp` y `transformers>=5.16`.

Su relevancia es doble: por un lado, documenta el estado del arte en cuantización de precisión ultra-baja (NVFP4) aplicada a un MoE de escala frontera; por otro, sirve como artefacto de estudio para analizar mecanismos de rechazo y robustez de alineamiento en modelos abliterados, un área de creciente interés en la investigación de seguridad de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) `qwen4_exp`: Gated DeltaNet (atención lineal) + Qwen Sparse Attention (QSA), HyperConnections, embeddings PLE de n-gramas, visión-lenguaje nativa |
| Parametros totales | 179 999 981 459 (~180 B) |
| Parametros activos | 10 expertos enrutados + 1 compartido por token (sobre 512 expertos totales); número exacto de parámetros activos no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, NVIDIA FP4 E2M1, grupo de 16 con escalas de bloque FP8) para expertos MoE; FP8 para atención y experto compartido; formato `compressed-tensors` |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors NVFP4), 183,5 GB de repositorio |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.8-Flash-Next original: un transformer MoE con 512 expertos, de los cuales 10 enrutados más 1 compartido se activan por token. Incorpora innovaciones propias de la línea Qwen4, como Gated DeltaNet (una forma de atención lineal con estado recurrente), Qwen Sparse Attention (QSA), HyperConnections y embeddings PLE de n-gramas, además de una torre de visión que le confiere capacidades imagen-texto nativas. Sobre esta base, el autor aplica *abliteration*: una técnica que ortogonaliza la dirección de rechazo en el flujo residual para eliminar la alineación de seguridad, y posteriormente cuantiza los pesos de los expertos a NVFP4 y los de atención y experto compartido a FP8.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base, ya que la model card no los detalla. La innovación técnica destacable de esta ficha es la cuantización NVFP4 con escalas de bloque FP8, que aprovecha los tensor cores FP4 de Blackwell para reducir el peso a la mitad manteniendo rutas de mayor precisión donde son críticas.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso (etiqueta `reasoning`).
- Capacidades de visión-lenguaje nativas (pipeline `image-text-to-text`): descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- *Tool calling* y *function calling* para integración en agentes.
- Soporte multilingüe limitado a inglés y chino.
- Modo de razonamiento explícito (hereda las capacidades del modelo base Qwen3.8-Flash-Next).
- Comportamiento sin alineación de seguridad: responde a peticiones que el modelo original rechazaría, lo que lo hace útil para estudiar mecanismos de rechazo y robustez.
- Adecuado para tareas de red-teaming y evaluación de robustez adversarial.

## Casos de uso

- Investigación de mecanismos de rechazo: el modelo permite estudiar cómo se representa y se suprime la dirección de rechazo en el espacio de activaciones, comparando respuestas con el modelo base alineado para aislar circuitos de seguridad.
- Red-teaming y evaluación de robustez: se puede emplear como modelo adversario para generar ataques, *jailbreaks* y prompts maliciosos controlados que pongan a prueba clasificadores y filtros de moderación en pipelines de producción.
- Análisis de interpretabilidad: al estar cuantizado en NVFP4, permite estudiar el impacto de la precisión ultra-baja en las representaciones internas y en la fidelidad de las explicaciones mecanicistas.
- Investigación en cuantización: sirve como banco de pruebas para medir la degradación de capacidades (razonamiento, visión, tool calling) al pasar de bf16 a NVFP4 en un MoE de 180 B, comparando con la versión completa.
- Generación de datos sintéticos para entrenamiento de clasificadores de seguridad: el modelo puede producir ejemplos etiquetados de contenido dañino en entornos de laboratorio aislados, siempre con supervisión humana y fines de investigación.
- Evaluación comparativa de alineamiento: permite contrastar la tasa de cumplimiento de peticiones dañinas frente al modelo base y a otras variantes abliteradas, aportando métricas cuantitativas para estudios de seguridad.
- Estudio de arquitecturas híbridas: al ser una vista previa de `qwen4_exp`, facilita la experimentación con atención lineal Gated DeltaNet y QSA en tareas de contexto largo y multimodalidad, aunque sin datos públicos de longitud de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con el modelo base o con otras variantes cuantizadas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 183,5 GB en NVFP4; se necesita al menos esa cantidad de memoria de GPU, más overhead de activaciones y KV cache, por lo que en la práctica se requieren múltiples GPUs o una GPU con memoria unificada de gran capacidad.
- GPU recomendadas: exclusivamente Blackwell (B100, B200, GB200 o RTX 50-series), ya que NVFP4 requiere los tensor cores FP4 de esta generación. No funciona en Hopper (H100/H200) ni en arquitecturas anteriores.
- No cabe en GPUs de consumo convencionales por tamaño; solo sería viable en configuraciones multi-GPU o en sistemas con memoria unificada muy grande.
- Opciones de despliegue: vLLM con soporte para `qwen4_exp` y `compressed-tensors` NVFP4, y `transformers>=5.16`. No se mencionan llama.cpp, Ollama ni TGI como compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-NVFP4 (este) | ~180 B (MoE, 512 expertos) | no disponible | NVFP4 + FP8 | Apache 2.0 | Hugging Face, requiere Blackwell + vLLM reciente |
| Qwen3.8-Flash-Next (base) | ~180 B (MoE, 512 expertos) | no disponible | bf16 (~330 GB) | Apache 2.0 | Hugging Face |
| Otras variantes abliterated de Qwen | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otras variantes cuantizadas comparables en la información proporcionada, por lo que la comparación se limita a las diferencias de formato y requisitos de hardware.

## Limitaciones y advertencias

- La alineación de seguridad ha sido sustancialmente eliminada mediante *abliteration*: el modelo cumplirá peticiones dañinas, poco éticas o ilegales que el original rechazaría. No debe desplegarse sin capas adicionales de moderación y seguridad.
- Riesgo elevado de generar contenido dañino, sesgado o inexacto; el autor declina toda responsabilidad por el mal uso.
- Solo soporta inglés y chino; no hay soporte declarado de castellano.
- Requiere hardware Blackwell y una build muy reciente de vLLM con soporte `qwen4_exp`; los runtimes estándar no lo cargarán.
- La cuantización NVFP4 puede degradar capacidades de razonamiento, visión y tool calling respecto al modelo en bf16; no se han publicado métricas que cuantifiquen esta pérdida.
- La licencia Apache 2.0 permite uso comercial, pero el uso de un modelo abliterado en producción conlleva riesgos legales y reputacionales que el usuario asume íntegramente.
- No se dispone de información sobre longitud de contexto, sesgos específicos ni tasas de alucinación.

## Enlaces

- Hugging Face: https://huggingface.co/Liber-Moe/Qwen3.8-Flash-Next-Uncensored-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- OrcaRouter (sitio del autor): https://www.orcarouter.ai
- Catálogo de modelos OrcaRouter: https://www.orcarouter.ai/models
- GitHub del autor: https://github.com/Continuum-AI-Corp
- Discord: https://discord.gg/yAh6Tex6kx
- X (Twitter): https://x.com/OrcaRouter

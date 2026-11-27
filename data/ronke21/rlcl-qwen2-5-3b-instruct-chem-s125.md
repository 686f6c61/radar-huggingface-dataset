# ronke21/rlcl-Qwen2.5-3B-Instruct-chem-s125

## Resumen

`ronke21/rlcl-Qwen2.5-3B-Instruct-chem-s125` es un ajuste fino (fine-tune) del modelo Qwen2.5-3B-Instruct de Alibaba, publicado por el usuario `ronke21` en Hugging Face. Por los tags del repositorio (`rlcl`, `forgetting`, `lora-merged`) y el sufijo `chem-s125`, parece tratarse de un experimento de investigación centrado en el aprendizaje continuo (continual learning) y la mitigación del olvido catastrófico, probablemente aplicado a un dominio de química con una semilla o paso de entrenamiento concreto (s125). El modelo conserva la arquitectura y el tamaño del modelo base: 3.085.938.688 parámetros (aproximadamente 3,09 mil millones), lo que lo sitúa en la gama de modelos pequeños aptos para hardware de consumo.

El modelo se distribuye en formato safetensors y es compatible con la librería transformers y con text-generation-inference. Al ser un fine-tune de Qwen2.5-3B-Instruct, hereda las capacidades conversacionales del modelo original, pero no se ha publicado información sobre el dataset de ajuste, los hiperparámetros, los resultados de evaluación ni la licencia aplicable. El repositorio tiene acceso restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargarlo.

Su relevancia es limitada y fundamentalmente académica: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la ficha, sin documentación pública sobre su rendimiento. Resulta útil como referencia para quienes estudian técnicas de regularización contra el olvido (el tag `rlcl` podría corresponder a alguna variante de regularización o de aprendizaje con restricciones) y para experimentar con adaptaciones de dominio sobre Qwen2.5-3B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, heredada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 (aproximadamente 3,09 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-3B-Instruct soporta hasta 32.768 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni AWQ en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,2 GB |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Acceso | restringido (gated) |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only con atención causal, normalización RMSNorm, activaciones SwiGLU y embeddings rotatorios (RoPE). El fine-tune se ha realizado mediante LoRA y posteriormente se han fusionado los adaptadores en los pesos base (`lora-merged`), de modo que el artefacto final es un modelo denso estándar cargable con transformers sin necesidad de PEFT. El número de parámetros coincide exactamente con el del modelo base, lo que confirma que la fusión no altera la topología de la red.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO adicionales. Los tags `rlcl` y `forgetting` sugieren que el entrenamiento se diseñó como un experimento de aprendizaje continuo orientado a preservar el rendimiento original mientras se incorpora conocimiento nuevo (presumiblemente del dominio químico, dado el sufijo `chem`). El sufijo `s125` podría indicar una semilla, un paso de entrenamiento o un tamaño de muestra, pero no hay documentación que lo confirme.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-3B-Instruct.
- Razonamiento básico, matemáticas elementales y generación de código, en la medida en que lo permite un modelo de 3 B de parámetros.
- Capacidad de seguir instrucciones (instruction following) en formato chat.
- Soporte de tool calling / function calling: no confirmado para este fine-tune, aunque el modelo base Qwen2.5-3B-Instruct lo soporta.
- Capacidad multilingüe: no confirmada para este fine-tune; el modelo base cubre numerosos idiomas, pero no se especifica qué se conserva tras el ajuste.
- Capacidades específicas del dominio químico: presumibles por el nombre del modelo, pero no documentadas ni evaluadas públicamente.
- Modo de razonamiento extendido (thinking), visión o audio: no disponibles.

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como punto de comparación en experimentos que miden cuánto rendimiento general se pierde al adaptar un modelo pequeño a un dominio especializado. Su etiqueta `forgetting` lo hace directamente relevante para este tipo de estudios.
- Adaptación de dominio en química: si el ajuste `chem` es efectivo, podría emplearse para responder preguntas de química básica, redactar descripciones de compuestos o asistir en la consulta de literatura técnica, siempre con validación humana dada la ausencia de benchmarks.
- Prototipado de asistentes conversacionales ligeros: con 3 B de parámetros puede desplegarse en una única GPU de consumo para probar flujos de chat multi-turno antes de escalar a modelos mayores.
- Evaluación de técnicas de fusión de LoRA: al estar publicado como `lora-merged`, es útil para reproducir y comparar pipelines de fusión de adaptadores sobre Qwen2.5.
- Generación de código en entornos con recursos limitados: el modelo base es razonablemente competente en tareas de programación simples; el fine-tune podría usarse para autocompletado o explicación de fragmentos de código en herramientas locales.
- Docencia y experimentación con modelos pequeños: permite a estudiantes ejecutar un modelo conversacional completo en hardware asequible y estudiar el efecto de un fine-tune de dominio sobre el comportamiento general.
- Base para nuevos fine-tunes: al ser un checkpoint denso en safetensors, puede servir como punto de partida para ajustes posteriores con PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 6,2 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, entre 7 y 9 GB según la longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 3,5-4 GB para los pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 2-2,5 GB para los pesos.
- GPU recomendadas para fp16: NVIDIA RTX 3090, RTX 4090, A10G, L4, A100 o H100. Cabe en GPUs de consumo con 8 GB o más si se cuantiza.
- GPU de consumo: sí, cabe en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y RTX 4090; en 8 GB requiere cuantización.
- Opciones de despliegue: transformers (nativo), text-generation-inference (etiquetado como compatible), vLLM (previa conversión o carga directa de safetensors), llama.cpp u Ollama solo si se generan pesos GGUF, que no se distribuyen en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ronke21/rlcl-Qwen2.5-3B-Instruct-chem-s125 | 3,09 B | no disponible | no disponible | gated en Hugging Face | Fine-tune de investigación, sin benchmarks |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens (modelo base) | Apache 2.0 (modelo base) | pública | Modelo original, con evaluación publicada |
| Meta Llama 3.2 3B Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | gated en Hugging Face | Alternativa de tamaño similar con contexto largo |
| Microsoft Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | pública | Orientado a razonamiento y código en tamaño pequeño |

La comparación con el modelo base es la más directa: este fine-tune no documenta mejoras medibles y su licencia no está clara, mientras que Qwen2.5-3B-Instruct es público y está evaluado. Frente a Llama 3.2 3B y Phi-3.5-mini, el modelo aquí descrito carece de benchmarks y de soporte de contexto largo confirmado.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card sustantiva, ni dataset, ni hiperparámetros, ni evaluación. No debe usarse en producción sin una validación propia exhaustiva.
- Licencia no disponible: al ser un derivado de Qwen2.5-3B-Instruct (Apache 2.0), es probable que herede esa licencia, pero no está declarado; el uso comercial queda en una zona jurídica ambigua hasta confirmarlo.
- Riesgo de olvido catastrófico: el propio etiquetado (`forgetting`) indica que el ajuste puede haber degradado capacidades generales del modelo base; no hay datos que cuantifiquen esa pérdida.
- Riesgo de alucinación: como todo modelo de 3 B, tiende a inventar hechos, especialmente en dominios técnicos como la química, donde una respuesta errónea puede ser peligrosa.
- Idiomas no declarados: no se sabe si el ajuste conserva el multilingüismo del modelo base o lo ha reducido al inglés.
- Contexto no confirmado: no se especifica la ventana efectiva tras el fine-tune; asumir 32.768 tokens sin verificación puede provocar fallos.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que añade fricción para su uso en pipelines automatizados.
- Cero tracción comunitaria: sin descargas ni validación externa, no hay evidencia de que el modelo funcione según lo previsto.
- Sin cuantizaciones oficiales: para desplegarlo en hardware limitado hay que generar los GGUF o AWQ por cuenta propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-3B-Instruct-chem-s125
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Paper técnico de Qwen2.5: https://arxiv.org/abs/2412.15115

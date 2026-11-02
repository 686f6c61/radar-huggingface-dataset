# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch11

## Resumen

tofu-llama2-7b-forget10-ihl_reset_head-epoch11 es un checkpoint de investigacion derivado de Llama-2-7b, publicado por el usuario g-assismoraes en HuggingFace. Se trata de un modelo de lenguaje denso de 6.738.415.616 parametros (aproximadamente 6,74 mil millones) construido sobre locuslab/tofu_ft_llama2-7b, que a su vez es un ajuste fino de Llama-2-7b-chat sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El checkpoint corresponde a la epoca 11 de un proceso de 20 epocas.

El modelo implementa una tecnica de desaprendizaje (machine unlearning) denominada IHL (probablemente "Inverted Hybrid Loss" o similar, aunque la model card no desarrolla la sigla) combinada con un reinicio de la cabeza de lenguaje y de los embeddings de entrada. Concretamente, los pesos de input embeddings y LM head se inicializan desde NousResearch/Llama-2-7b-chat-hf, mientras que el resto de pesos del Transformer se conservan de locuslab/tofu_ft_llama2-7b. El objetivo declarado es el olvido del subconjunto "forget10" de TOFU mediante una perdida de entropia inversa sobre los datos a olvidar y una entropia cruzada estandar (peso 1.0) sobre los datos a retener.

Su relevancia es acotada y experimental: no es un modelo de proposito general, sino un artefacto de investigacion para estudiar metodos de desaprendizaje selectivo en LLMs, con interes para quienes trabajan en privacidad, cumplimiento del RGPD o eliminacion de conocimiento especifico de un modelo ya entrenado. El checkpoint es autonomo (standalone full model), no un adaptador, y se distribuye bajo licencia Llama 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Llama-2-7b-chat; la model card no la especifica) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only denso con atencion multi-cabeza, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El checkpoint parte de locuslab/tofu_ft_llama2-7b, un ajuste fino de Llama-2-7b-chat sobre TOFU, y aplica sobre el un procedimiento de desaprendizaje en la epoca 11 de 20.

El entrenamiento combina dos terminos de perdida: una perdida IHL ("token IHL") aplicada sobre el conjunto forget (los datos que se pretende olvidar) y una entropia cruzada estandar con peso 1.0 sobre el conjunto retain (los datos que deben conservarse). Ademas, se reinician los embeddings de entrada y la cabeza de lenguaje desde NousResearch/Llama-2-7b-chat-hf, manteniendo el resto de pesos del Transformer del modelo ajustado. La model card menciona un fichero ihl_manifest.json con detalles adicionales del proceso, pero no se proporcionan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO adicionales.

## Capacidades

- Generacion de texto en ingles, heredada de la base Llama-2-7b-chat.
- Razonamiento y respuesta conversacional multi-turno, con las capacidades propias de Llama-2-7b-chat.
- Desaprendizaje selectivo: el checkpoint esta disenado para haber olvidado el subconjunto forget10 de TOFU conservando el rendimiento sobre retain.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso explicito (thinking mode) en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun el campo language de la model card.
- No se documentan capacidades de vision, audio ni modalidades adicionales.

## Casos de uso

- Investigacion en machine unlearning: servir como punto de comparacion en experimentos que evaluan metodos de olvido selectivo (IHL, gradient ascent, preference optimization) sobre TOFU, midiendo la degradacion en el conjunto forget frente a la retencion en retain.
- Auditoria de privacidad y cumplimiento: estudiar hasta que punto es posible eliminar informacion personal o ficticia concreta de un LLM ya entrenado, relevante para escenarios de derecho al olvido (RGPD articulo 17).
- Evaluacion de robustez del olvido: comprobar mediante ataques de extraccion o prompting si el conocimiento supuestamente olvidado reaparece, usando el checkpoint como sujeto de prueba.
- Reproducibilidad de pipelines de desaprendizaje: al ser un checkpoint completo y autonomo, permite reproducir exactamente el estado de la epoca 11 sin necesidad de reejecutar el entrenamiento.
- Estudio de reinicio de cabeza y embeddings: analizar el impacto de reinicializar input embeddings y LM head desde Llama-2-7b-chat en la calidad del texto generado y en la eficacia del olvido.
- Baseline para comparativas academicas: emplearlo como referencia frente a otros checkpoints de la misma familia (distintas epocas o variantes de perdida) en publicaciones sobre unlearning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 13-14 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 16 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 7-8 GB; en 4 bits, alrededor de 4-5 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de produccion; RTX 4090 (24 GB) o RTX A6000 (48 GB) para inferencia en FP16 sin cuantizar.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16, y en GPUs de 8-12 GB si se cuantiza.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras conversion a GGUF, y transformers con PyTorch. Al no publicarse variantes cuantizadas, habria que generarlas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_reset_head-epoch11 | 6,74 B | no disponible | Desaprendizaje IHL sobre TOFU (epoca 11) | llama2 | HuggingFace |
| locuslab/tofu_ft_llama2-7b | ~6,74 B | no disponible | Ajuste fino sobre TOFU (modelo base) | llama2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | ~6,74 B | no disponible | Chat generalista | llama2 | HuggingFace |
| meta-llama/Llama-2-7b-chat-hf | ~6,74 B | no disponible | Chat generalista | llama2 | HuggingFace |

Los cuatro comparten arquitectura y numero de parametros; la diferencia radica en el ajuste (TOFU frente a chat general) y en el procedimiento de desaprendizaje aplicado en el checkpoint de g-assismoraes. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni como asistente generalista; su calidad conversacional puede haberse degradado tras el desaprendizaje.
- Riesgo de alucinacion: como cualquier Llama-2-7b, puede generar contenido factualmente incorrecto; el proceso de desaprendizaje no elimina este riesgo.
- Eficacia del olvido no verificada: la model card no aporta metricas de forget/retain ni resultados de ataques de extraccion, por lo que no puede confirmarse que el conocimiento objetivo se haya eliminado realmente.
- Sesgos: heredados de los datos de preentrenamiento de Llama-2 y del conjunto TOFU; no se documenta ninguna mitigacion adicional.
- Idioma: soporte limitado al ingles segun la model card.
- Licencia Llama 2: impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales, obligaciones de atribucion y politicas de uso aceptable); debe revisarse antes de cualquier despliegue.
- Sin comunidad ni validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion documentadas.
- Contexto no especificado: la model card no declara la longitud de contexto efectiva, aunque se hereda de Llama-2 (habitualmente 4096 tokens en la familia original).
- Fecha de creacion inusual (2026-11-02): conviene verificar la procedencia y autenticidad del repositorio antes de reutilizarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch11
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Llama-2-7b-chat oficial: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper TOFU (referencia del dataset): https://arxiv.org/abs/2401.06121
- No se han encontrado en la informacion disponible papers, blogs, repos ni demos adicionales especificos de este checkpoint.

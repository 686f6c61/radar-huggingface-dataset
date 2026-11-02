# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch14

## Resumen

`g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch14` es un checkpoint de investigacion derivado de `locuslab/tofu_ft_llama2-7b`, un Llama 2 de 7B ajustado sobre el benchmark TOFU (Task of Fictitious Unlearning). El autor, g-assismoraes, lo publica como artefacto de un experimento de *machine unlearning*: el objetivo es eliminar selectivamente el conocimiento de un subconjunto del dataset de entrenamiento (la particion `forget10`, es decir, el 10 % de los autores ficticios de TOFU) sin degradar el resto.

El modelo emplea una estrategia hibrida: reinicializa los *input embeddings* y la *LM head* desde `NousResearch/Llama-2-7b-chat-hf` mientras conserva el resto de pesos del transformer de `locuslab/tofu_ft_llama2-7b`, y aplica un objetivo de perdida compuesto por *token IHL* (unlearning sobre el conjunto a olvidar) mas un termino de entropia cruzada (CE) ponderado por 1.0 sobre el conjunto a retener. El checkpoint corresponde a la epoca 14 de 20 del entrenamiento.

Es relevante porque TOFU se ha consolidado como referencia para evaluar tecnicas de desaprendizaje en LLM, y este checkpoint documenta una variante concreta (reset de capas de entrada/salida combinado con IHL) que otros investigadores pueden reproducir o comparar. No es un modelo para produccion: es un artefacto experimental de 6.738.415.616 parametros con licencia Llama 2 y soporte unicamente en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Llama 2 base: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de Llama 2 via herramientas externas) |
| Idiomas soportados | en |
| Licencia | llama2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El checkpoint parte de `locuslab/tofu_ft_llama2-7b`, que a su vez es un fine-tuning de Llama 2 7B sobre el dataset TOFU, compuesto por pares pregunta-respuesta sobre 200 autores ficticios (cada uno con 20 QA), disenado para medir desaprendizaje a nivel de autor.

La innovacion del checkpoint reside en el procedimiento de desaprendizaje: (1) *reset* de los *input embeddings* y de la *LM head* a los pesos de `NousResearch/Llama-2-7b-chat-hf`, manteniendo intactos el resto de pesos del transformer; (2) objetivo de perdida combinado con *token IHL* (unlearning sobre `forget10`) mas `1.0 * CE` sobre el conjunto *retain*. El nombre del repositorio indica la configuracion `ihl_reset_both` y la epoca 14 de 20. El autor referencia un fichero `ihl_manifest.json` en el repositorio para detalles del procedimiento. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF/DPO adicional.

## Capacidades

- Generacion de texto en ingles y respuesta a preguntas sobre el dataset TOFU (autores ficticios).
- Razonamiento basico y seguimiento de instrucciones heredado de Llama 2 7B chat.
- Capacidad de desaprendizaje selectivo: el checkpoint esta disenado para que el modelo no reproduzca el conocimiento de la particion `forget10` mientras conserva el de `retain`.
- Soporte de tool calling / function calling: no disponible de forma nativa en Llama 2 7B; requeriria plantillas externas.
- Soporte de agentes y multi-step reasoning: no disponible de forma nativa.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en machine unlearning: reproducir y comparar la variante `ihl_reset_both` frente a otros metodos de desaprendizaje sobre TOFU, usando las metricas estandar del benchmark (model utility, forget quality, extraction strength).
- Auditoria de privacidad en LLM: evaluar si el reset de embeddings y LM head reduce la memorizacion de datos de la particion `forget10` sin colapsar el rendimiento en `retain`.
- Baseline academico: servir como punto de comparacion en publicaciones que propongan nuevas tecnicas de desaprendizaje sobre Llama 2 7B.
- Estudio de olvido catastrophic vs. selectivo: analizar el equilibrio entre la perdida de conocimiento objetivo y la degradacion general del modelo tras 14 epocas de entrenamiento con IHL + CE.
- Docencia en cursos de seguridad y privacidad de LLM: ilustrar el flujo completo de fine-tuning sobre TOFU y posterior desaprendizaje con un checkpoint intermedio documentado.
- Evaluacion de la transferibilidad de pesos: comprobar el impacto de reinicializar embeddings y LM head desde un modelo chat distinto sobre las capacidades generativas del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB (coincide con el tamano del repo, 13.5 GB).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 7 GB; en 4 bits: aproximadamente 4 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S, RTX A6000 para FP16 sin offload; RTX 4090 (24 GB) suficiente para FP16.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16, y en GPUs de 8-12 GB con cuantizacion 4/8 bits.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI, transformers (el checkpoint es un modelo completo en safetensors, no un adaptador LoRA).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch14 | 6.738.415.616 | no disponible | llama2 | Desaprendizaje TOFU (IHL + reset embeddings/LM head) |
| locuslab/tofu_ft_llama2-7b | ~6.7B | no disponible | llama2 | Fine-tuning completo sobre TOFU (modelo base de este checkpoint) |
| NousResearch/Llama-2-7b-chat-hf | ~6.7B | 4096 tokens | llama2 | Chat generalista, origen de los pesos de embeddings y LM head |
| meta-llama/Llama-2-7b-hf | ~6.7B | 4096 tokens | llama2 | Modelo base original |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni para aplicaciones de usuario final.
- Solo ingles: la model card declara unicamente `en` como idioma soportado.
- Riesgo de alucinacion: como cualquier Llama 2 7B, puede generar contenido factualmente incorrecto; el desaprendizaje no elimina esta propiedad.
- Sesgos: hereda los sesgos de Llama 2 7B y del dataset TOFU; no se documentan evaluaciones de sesgo en la informacion disponible.
- Eficacia del desaprendizaje no verificada: no se publican metricas de forget quality ni de model utility en la informacion disponible, por lo que no puede confirmarse que el conocimiento de `forget10` se haya eliminado realmente.
- Restricciones de licencia: licencia Llama 2, que impone condiciones de uso (incluida la politica de uso aceptable de Meta) y requiere atribucion; revisar los terminos antes de cualquier uso comercial.
- Checkpoint intermedio: corresponde a la epoca 14 de 20, no al modelo final del entrenamiento; puede no representar el estado convergido del procedimiento.
- Repositorio sin descargas ni likes: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch14
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (codigo): https://github.com/locuslab/tofu

# richardyoung/Qwen2.5-32B-Instruct-SOM-heretic

## Resumen

Qwen2.5-32B-Instruct-SOM-heretic es un ajuste fino (fine-tune) del modelo Qwen2.5-32B-Instruct desarrollado por el usuario richardyoung y publicado en Hugging Face. Se trata de una variante "heretic" o "abliterated", es decir, un modelo al que se le ha aplicado una tecnica de eliminacion o supresion del rechazo (refusal) para reducir los comportamientos de censura aprendidos durante el alineamiento del modelo original. El resultado es un modelo de chat conversacional que responde a peticiones que el modelo base tenderia a declinar.

El modelo conserva la arquitectura y el tamano del Qwen2.5-32B-Instruct original: un transformer denso de aproximadamente 32.700 millones de parametros (32.763.876.352 segun los pesos en safetensors), con una ventana de contexto nativa de 32.768 tokens en la familia Qwen2.5 (ampliable mediante RoPE scaling, aunque este dato no se confirma en la informacion disponible para este fine-tune concreto). El repositorio ocupa 65,5 GB en formato safetensors.

Su relevancia es doble: por un lado, ofrece a desarrolladores e investigadores un modelo de 32B sin las restricciones de rechazo del original, util para estudiar comportamientos de alineamiento, red-teaming y evaluacion de sesgos; por otro, al estar construido sobre Qwen2.5-32B-Instruct mantiene las capacidades de razonamiento, codigo y multilingues del modelo base. El acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 32.763.876.352 (~32,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible para este fine-tune (el base Qwen2.5-32B-Instruct soporta 32.768 tokens nativos) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | Ingles (segun la model card); el base Qwen2.5 es multilingue, pero este fine-tune declara solo `en` |
| Licencia | Apache 2.0 (etiqueta del repo); el acceso esta restringido y sujeto a condiciones adicionales en Hugging Face |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer decoder-only denso con atencion por causalidad, RoPE, RMSNorm y las optimizaciones propias de la familia Qwen2 (SwiGLU en las FFN, atencion con query/key/value bias). Sobre esa base, richardyoung aplica una tecnica de tipo "abliteration" o "heretic", orientada a suprimir la direccion de rechazo en el espacio de activaciones o a un ajuste fino que reduce la probabilidad de respuestas de negativa. La model card no detalla el dataset, el numero de tokens de entrenamiento ni si se empleo DPO, RLHF u otra metodologia; esa informacion no esta disponible.

Los tags del repositorio (`heretic`, `uncensored`, `decensored`, `abliterated`) confirman la intencion del ajuste, pero no se aportan metricas de cuanto se ha reducido la tasa de rechazo ni de la degradacion en tareas estandar. Tampoco se documenta si se preservo integramente la ventana de contexto del base ni si se aplico alguna modificacion al tokenizador. No hay innovaciones de decodificacion especulativa ni atencion lineal declaradas.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, heredadas del base Qwen2.5-32B-Instruct.
- Razonamiento y resolucion de problemas de complejidad media-alta, propio de un modelo de 32B.
- Generacion de codigo y soporte de matematicas, con capacidad de explicar pasos intermedios.
- Respuestas a peticiones que el modelo base rechazaria, gracias al ajuste heretic/abliterated.
- Soporte de tool calling y function calling heredado del formato de chat de Qwen2.5 (no verificado especificamente en este fine-tune).
- Capacidad de agentes y razonamiento multi-paso, sujeta a la preservacion de las capacidades del base.
- Multilingue limitado: la model card declara solo ingles, aunque el base soporta varios idiomas; el comportamiento multilingue de este fine-tune no esta verificado.
- No se declaran capacidades de vision ni audio.

## Casos de uso

- Red-teaming y evaluacion de alineamiento: investigadores pueden usar el modelo para estudiar que tipo de peticiones acepta un modelo sin rechazo y comparar con el base, midiendo el efecto del abliteration en la tasa de respuestas daninas.
- Generacion creativa sin restricciones: escritura de ficcion, dialogos o guiones con tematicas adultas o controvertidas que el modelo base declinaria, en entornos controlados y con revision humana.
- Analisis de sesgos: comparar las respuestas del modelo heretic con las del Qwen2.5-32B-Instruct original para identificar que direcciones de activacion estan asociadas al rechazo y como afectan a distintos topicos.
- Investigacion sobre seguridad de LLM: servir como modelo "sujeto de prueba" en pipelines de clasificacion de contenido y en el desarrollo de filtros de salida.
- Asistente conversacional especializado en dominios sensibles (salud, legal, seguridad) donde el exceso de cautela del base resulta contraproducente, siempre con supervision experta.
- Fine-tuning posterior para tareas de estilo o dominio: al estar en safetensors y licencia Apache 2.0, puede servir como punto de partida para ajustes adicionales con LoRA o QLoRA en una unica GPU de 80 GB o en varias de 24 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni metricas de tasa de rechazo, y no se aportan comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 65 GB solo para pesos, mas KV cache; se recomienda un minimo de 80 GB (A100 80GB, H100 80GB) para contexto corto.
- Cuantizacion en 8 bits: ~33-35 GB, viable en una RTX 4090 24GB solo con offloading parcial o en dos GPU de 24 GB.
- Cuantizacion en 4 bits (si se generan pesos GGUF/AWQ, no confirmados): ~17-20 GB, cabe en una RTX 4090 24GB con contexto moderado.
- GPU recomendadas: A100 80GB, H100 80GB, 2x RTX 4090 24GB, 2x L40S 48GB.
- Cabe en consumer GPU solo mediante cuantizacion agresiva (4 bits) y con contexto limitado; no cabe en FP16 en ninguna consumer actual.
- Opciones de despliegue: transformers, text-generation-inference (TGI, etiquetado en el repo), vLLM (compatible con arquitectura Qwen2), llama.cpp/Ollama si se dispone de GGUF (no confirmado).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-32B-Instruct-SOM-heretic | ~32,7B | No disponible (base 32.768) | Apache 2.0 | Gated | Fine-tune heretic/abliterated |
| Qwen/Qwen2.5-32B-Instruct | ~32,7B | 32.768 tokens | Apache 2.0 | Abierto | Modelo base alineado, con rechazo |
| Qwen/Qwen2.5-Coder-32B-Instruct | ~32,7B | 32.768 tokens | Apache 2.0 | Abierto | Especializado en codigo |
| Modelos "abliterated" de 32B de la comunidad (p. ej. variantes de Qwen2.5 o Yi-34B) | ~32-34B | Variable | Variable (a menudo Apache 2.0 o similar) | Variable | Misma tecnica de supresion del rechazo |

No se dispone de datos de rendimiento comparativo para este fine-tune concreto; la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Al ser un modelo heretic/abliterated, la supresion del rechazo puede aumentar la probabilidad de generar contenido danino, ilegal o inseguro; no debe desplegarse en produccion sin filtros de salida y supervision.
- Riesgo elevado de alucinacion, como en cualquier modelo de 32B, agravado por la posible degradacion de capacidades tras el ajuste.
- La model card declara solo ingles; el comportamiento en castellano u otros idiomas no esta verificado y puede ser deficiente.
- La licencia Apache 2.0 del repo no exime de cumplir las condiciones de acceso gated de Hugging Face ni las politicas de uso del modelo base.
- No se documentan sesgos especificos ni evaluaciones de seguridad; se desconoce el impacto del abliteration en sesgos de genero, raza o religion.
- El acceso esta restringido: es necesario aceptar condiciones en Hugging Face, lo que puede limitar su uso en pipelines automatizados.
- No hay garantias de soporte, mantenimiento ni actualizaciones por parte del autor.
- Uso comercial permitido por licencia, pero con responsabilidad legal plena sobre el contenido generado.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-SOM-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Paper de referencia Qwen2 (arxiv:2407.10671): https://arxiv.org/abs/2407.10671
- Paper de referencia citado en los tags (arxiv:2309.00071): https://arxiv.org/abs/2309.00071
- Paper citado en los tags (arxiv:2611.17846): no verificado; el identificador no corresponde a un arXiv valido en la fecha de redaccion

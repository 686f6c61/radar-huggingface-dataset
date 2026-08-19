# Ishowbackup/gemma-4-12B-it-uncensored

## Resumen

El modelo gemma-4-12B-it-uncensored es una version del modelo google/gemma-4-12B-it (arquitectura Gemma4Unified, encoder-free) a la que se le ha eliminado el comportamiento de rechazo mediante una tecnica de abliteration norm-preserving biprojected. Desarrollado por Ishowbackup, el modelo mantiene los pesos originales en magnitud pero proyecta fuera la direccion de rechazo en las capas superiores (70% de las capas, L15-47). El resultado es una reduccion drastica de rechazos (de 99/100 a 6/100 en un conjunto de prompts) con una divergencia KL de 0.0556 respecto al modelo base y sin degradacion aparente de la calidad segun auditorias manuales.

El modelo tiene 11.959.730.224 parametros (12B) y esta disponible en formato safetensors. Esta pensado para casos de uso donde se requiere una generacion de texto sin restricciones de seguridad, como investigacion sobre alineacion o desarrollo de aplicaciones que necesitan respuestas directas. La licencia es Apache 2.0, lo que permite uso comercial. Requiere transformers >= 5.10.1 para inferencia y llama.cpp con soporte Gemma4Unified para cuantizacion GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4Unified (encoder-free, transformer) |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (soporta GGUF via llama.cpp con Gemma4Unified) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tambien compatible con GGUF) |

Nota: el tag de HuggingFace incluye "image-text-to-text", pero el pipeline declarado es text-generation. No se confirma si el modelo base tiene capacidades multimodales.

## Arquitectura y entrenamiento

El modelo base es google/gemma-4-12B-it, un modelo de la familia Gemma 4 con arquitectura Gemma4Unified, que es encoder-free (solo decoder). No se dispone de detalles sobre el numero de capas, heads o dimensiones internas, pero se sabe que el comportamiento de rechazo se concentra en las capas superiores (L15-47), lo que sugiere al menos 47 capas. El proceso de abliteration aplica una proyeccion biproyectada que preserva la norma: cada fila de pesos se descompone en magnitud y direccion, se proyecta fuera la direccion de rechazo en la componente direccional y se recombina con la magnitud original, garantizando que la norma de los pesos no cambie. Se utilizan direcciones de rechazo por capa, calculadas como la diferencia normalizada entre medias de activaciones residuales para prompts daninos y benignos, con winsorizacion al percentil 99.5 para mitigar outliers de GeGLU. Se aplica al 70% de las capas superiores (L15-47) y a las proyecciones o_proj y mlp.down_proj. El entrenamiento adicional incluye la fusion de adaptadores LoRA (usados para recopilar activaciones) en los pesos base.

No se especifican los datos de entrenamiento del modelo base, ni el numero de tokens, ni si hubo RLHF o DPO. El proceso de abliteration no requiere entrenamiento adicional, solo la modificacion de pesos.

## Capacidades

- Generacion de texto conversacional en ingles, con respuestas directas y sin rechazo a prompts que normalmente serian rechazados por el modelo base.
- Mantiene la calidad de generacion del modelo base (segun auditoria manual y verificacion en Q8), aunque con una ligera desviacion (KL 0.0556).
- Soporta el formato de chat mediante apply_chat_template de transformers.
- Capacidad de redirigir prompts sensibles a recursos de soporte (en casos residuales).
- No se dispone de informacion sobre tool calling, agentes, razonamiento multi-step, vision o audio. El tag "image-text-to-text" sugiere posible multimodalidad, pero no esta confirmado y el pipeline es text-generation.

## Casos de uso

- Investigacion en seguridad y alineacion: permite estudiar el comportamiento de modelos sin mecanismos de rechazo, facilitando el analisis de sesgos y la evaluacion de tecnicas de mitigacion.
- Desarrollo de asistentes conversacionales sin censura: para aplicaciones donde se requiere que el modelo responda a cualquier consulta sin negarse, como en entornos controlados de investigacion.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o dialogos que pueden abordar temas tabu sin limitaciones impuestas por el modelo base.
- Evaluacion de tecnicas de abliteration: sirve como referencia para comparar el efecto de la eliminacion de rechazos en la calidad y el comportamiento del modelo.
- Pruebas de robustez: se puede utilizar para probar sistemas de moderacion o filtros de contenido, ya que el modelo generara contenido que normalmente seria bloqueado.
- Fine-tuning posterior: al tener pesos limpios y licencia Apache 2.0, puede servir como base para fine-tuning en tareas especificas sin las restricciones del modelo original.

Nota: el uso de este modelo para generar contenido danino o ilegal esta fuera de los terminos de uso responsable y puede violar normativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El README solo reporta metricas de rechazo y divergencia KL:

| Metrica | Valor |
|---------|-------|
| Refusals (mlabonne, 100 prompts) - antes | 99/100 |
| Refusals (mlabonne, 100 prompts) - despues | 6/100 |
| Refusals (cross-dataset, 686 prompts) | 14/686 (2.0%) |
| KL Divergence vs modelo base | 0.0556 |
| Calidad (coherencia) | sin degradacion (auditoria manual + Q8) |

La tasa de rechazo efectiva tras auditoria manual se estima en ~0/686, ya que la mayoria de los flags son falsos positivos.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware. Dado que el modelo tiene 11.959.730.224 parametros y el repositorio ocupa 24.0 GB en safetensors (presumiblemente en bf16), se estima que la inferencia requiere al menos 24 GB de VRAM para cargar los pesos en bf16, mas overhead de activaciones y KV cache. Para una GPU consumer, una RTX 4090 (24 GB) podria ser justa, pero se recomienda una GPU con mas memoria (A100 40GB o 80GB, H100) para mayor margen. Para cuantizacion GGUF, se podria reducir la huella, pero no se especifican tamanos de cuantizacion. Opciones de despliegue: transformers (>=5.10.1) con device_map="auto", o llama.cpp (con soporte Gemma4Unified) para cuantizacion y ejecucion en CPU/GPU. No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos. El modelo base google/gemma-4-12B-it es la referencia inmediata, pero no se ofrecen metricas de rendimiento estandar. Otros modelos abliterados de la comunidad (por ejemplo, basados en Llama o Mistral) podrian ser comparables, pero no hay datos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente despojado de su comportamiento de rechazo, lo que significa que puede generar contenido danino, ilegal, violento, sexualmente explicito o eticamente cuestionable sin advertencias.
- La tasa de rechazo residual es de aproximadamente 2% (14/686) en el conjunto de validacion, aunque la auditoria manual reduce la tasa efectiva a casi cero.
- La divergencia KL de 0.0556 indica una ligera desviacion en la distribucion de salida respecto al modelo base, lo que podria afectar a la coherencia en algunos casos.
- Requiere transformers >= 5.10.1 (probado en 5.12.0) y llama.cpp con soporte Gemma4Unified (PR #24118) para conversion GGUF.
- No se han publicado benchmarks de rendimiento estandar, por lo que se desconoce su comportamiento en tareas como razonamiento, codigo o matematicas en comparacion con otros modelos.
- La licencia Apache 2.0 permite uso comercial, pero el uso del modelo para generar contenido danino puede violar los terminos de uso de la plataforma y las leyes locales.
- El modelo solo esta entrenado en ingles; no se garantiza un buen rendimiento en otros idiomas.
- No se dispone de informacion sobre la longitud de contexto maxima soportada, lo que puede limitar su uso en aplicaciones que requieran contextos largos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ishowbackup/gemma-4-12B-it-uncensored
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Blog sobre norm-preserving biprojected abliteration: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- PR de llama.cpp para Gemma4Unified: https://github.com/ggml-org/llama.cpp/pull/24118
- Repositorio de investigacion (mencionado en el README): https://github.com/TrevorS/gemma-4-abliteration

Nota: el README menciona a TrevorJS y TrevorS como autores, pero el repositorio de HuggingFace esta bajo el usuario Ishowbackup. Se recomienda verificar la autoria real.

# fang64/Qwen3.8-Flash-Next-Uncensored-mq4

## Resumen

`fang64/Qwen3.8-Flash-Next-Uncensored-mq4` es una cuantización de tipo mixto del modelo abliterado `huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated`, que a su vez deriva del modelo original `Qwen/Qwen3.8-Flash-Next` de Alibaba. La pieza la publica el usuario fang64 en HuggingFace y emplea el formato propietario HFQM del motor de inferencia hipfire, con receta MQ4 (matrices en MQ4G256V2, MQ4G128V2 y MQ6G256V2, y embeddings de tokens y `lm_head` en 8 bits). El resultado pesa aproximadamente 117,4 GiB, lo que da una idea del tamaño del modelo original, claramente en la liga de los modelos frontera.

La arquitectura, según los metadatos embebidos del artefacto, es Qwen4Exp: 48 capas de texto y 512 expertos con 10 expertos activos por token, es decir, un transformer de mezcla de expertos (MoE) de gran escala. El modelo también incorpora, según esa misma configuración, un codificador de visión, aunque el autor advierte que la inferencia multimodal no ha sido verificada en esta cuantización.

Su relevancia actual es doble: por un lado, permite ejecutar en hardware con menos VRAM un modelo de escala frontera mediante cuantización agresiva; por otro, la abliteración aplicada en la cadena de derivación elimina buena parte de los rechazos del modelo original, lo que lo hace interesante para investigación sobre alineamiento y seguridad, y arriesgado para despliegues públicos sin filtros adicionales. La licencia es la Qwen Community License 1.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen4Exp (transformer MoE, 48 capas de texto, 512 expertos) |
| Parámetros totales | no disponible |
| Parámetros activos | 10 expertos por token (número total de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MQ4 mixta: MQ4G256V2, MQ4G128V2, MQ6G256V2; embeddings y `lm_head` en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`license: other`) |
| Formato de pesos | HFQM (hipfire), artefacto `qwen3.8-flash-next.mq4-xts` (~117,4 GiB) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de mezcla de expertos con 48 capas de texto y 512 expertos, de los que se activan 10 por token. Esta configuración implica un cociente de activación bajo (en torno al 2 % de los expertos por token), típico de los MoE de gran escala orientados a mantener un coste de cómputo por token manejable pese a un número total de parámetros muy elevado. La configuración embebida incluye además un codificador de visión, aunque el autor de la cuantización no ha verificado la inferencia multimodal sobre este artefacto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo original empleó RLHF, DPO u otras técnicas de alineamiento posteriores al preentrenamiento. La cadena de derivación incluye una etapa de abliteración (eliminación de direcciones de rechazo en el espacio de activaciones) realizada por huihui-ai sobre el modelo original de Qwen, y una posterior cuantización mixta realizada por fang64 con la herramienta hipfire. Esta cuantización no es uniforme: selecciona precisión MQ4 o MQ6 según la sensibilidad de cada matriz, y conserva embeddings y cabeza de salida en 8 bits para preservar calidad en las capas más expuestas.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo Qwen3.8-Flash-Next original.
- Razonamiento multi-step y resolución de problemas complejos, presumiblemente con modo de pensamiento extendido (no confirmado en la información disponible).
- Generación de código y matemáticas, como corresponde a la familia Qwen3.
- Capacidad multimodal potencial (codificador de visión presente en la configuración), aunque no verificada en este artefacto.
- Comportamiento sin rechazos (uncensored/abliterated): el modelo no aplica las negativas típicas del modelo alineado original ante peticiones sensibles.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un modelo frontera sin las capas de rechazo, comparando respuestas con la versión alineada para analizar qué direcciones de activación codifican la negativa y cómo afecta la abliteración a la utilidad general.
- Evaluación de cuantización extrema: sirve para medir la degradación de calidad de una receta MQ4 mixta frente al modelo en precisión completa en tareas de razonamiento, código y matemáticas, gracias a que el artefacto conserva embeddings en 8 bits.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas delicados sin las negativas del modelo alineado, en entornos controlados y con revisión humana posterior.
- Despliegue en hardware limitado para modelos de escala frontera: al ocupar ~117 GiB, puede ejecutarse en configuraciones multi-GPU de gama alta (por ejemplo, 4×A100 80 GB o 2×H100 80 GB) donde el modelo original en BF16 no cabría, permitiendo prototipado de aplicaciones con un MoE de 512 expertos.
- Red teaming y pruebas de robustez: útil para generar ataques adversariales y prompts de jailbreak con los que evaluar los filtros de otros sistemas, ya que el modelo no se niega a producirlos.
- Análisis de sesgos y toxicidad: al eliminar la capa de rechazo, expone de forma más directa los sesgos latentes del preentrenamiento, lo que facilita su auditoría en pipelines de evaluación de seguridad.
- Base para fine-tuning posterior: el artefacto cuantizado no es ideal para reentrenar, pero sirve como referencia de comportamiento para comparar adaptadores entrenados sobre el modelo abliterado en precisión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto pesa ~117,4 GiB, por lo que la inferencia requiere al menos esa cantidad de memoria, más overhead de KV cache y activaciones. Con contexto largo, el requisito puede crecer de forma significativa.
- GPU recomendadas: configuraciones multi-GPU de centro de datos, como 4×A100 80 GB, 2×H100 80 GB o 2×H200 141 GB. No cabe en una única GPU de 80 GB.
- GPU de consumo: no es viable en RTX 4090 (24 GB), RTX 5090 (32 GB) ni en ninguna GPU consumer actual, ni siquiera con la cuantización ya aplicada.
- Opciones de despliegue: exclusivamente mediante hipfire (`hipfire serve --model qwen3.8-flash-next.mq4-xts`), con una build que soporte la arquitectura Qwen4Exp y la receta HFQM. No hay conversión disponible a GGUF, vLLM, TGI ni Ollama en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fang64/Qwen3.8-Flash-Next-Uncensored-mq4 | MoE, 512 expertos, 10 activos (total no disponible) | no disponible | HFQM (hipfire) | Qwen Community 1.0 | HuggingFace, solo hipfire |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated | MoE, mismos expertos (total no disponible) | no disponible | safetensors (presumible) | Qwen Community 1.0 | HuggingFace |
| Qwen/Qwen3.8-Flash-Next | MoE, 512 expertos, 10 activos (total no disponible) | no disponible | safetensors | Qwen Community 1.0 | HuggingFace |

La comparación se limita a la cadena de derivación del propio modelo, ya que no se dispone de datos de rendimiento ni de especificaciones completas de alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La abliteración reduce los rechazos del modelo, pero no garantiza la ausencia total de negativas ni elimina los sesgos del preentrenamiento; el autor recomienda revisar las salidas antes de usarlas en entornos sensibles o públicos.
- Riesgo elevado de generar contenido dañino, sesgado o inexacto sin filtros adicionales; no es adecuado para aplicaciones de cara al usuario sin una capa de moderación externa.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se han publicado evaluaciones de fidelidad para este artefacto.
- La inferencia multimodal (visión) no ha sido verificada por el autor, pese a que la configuración embebida describe un codificador de visión.
- Idiomas soportados y longitud de contexto no documentados; no se puede garantizar un comportamiento multilingüe ni un contexto largo sin pruebas.
- El formato HFQM solo es compatible con el motor hipfire, lo que limita la portabilidad y obliga a usar una build concreta que soporte Qwen4Exp.
- La licencia Qwen Community License 1.0 impone condiciones específicas para uso comercial (habitualmente umbrales de usuarios activos mensuales y obligaciones de atribución); conviene revisar el texto completo antes de un despliegue comercial.
- No hay datos de benchmarks ni de rendimiento publicados, por lo que no es posible estimar la degradación de calidad introducida por la cuantización MQ4 frente al modelo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fang64/Qwen3.8-Flash-Next-Uncensored-mq4
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia (Qwen Community License 1.0): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated/blob/main/LICENSE
- Repositorio de hipfire: https://github.com/Kaden-Schutt/hipfire

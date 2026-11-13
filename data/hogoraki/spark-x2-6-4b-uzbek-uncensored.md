# hogoraki/Spark-X2.6-4B-Uzbek-Uncensored

## Resumen

Spark-X2.6-4B-Uzbek-Uncensored es un ajuste fino (fine-tune) en LoRA sobre el modelo FrostWolfAI/Spark-X2.6-4B-abliterated, especializado en el idioma uzbeko y con las capas de rechazo eliminadas (abliterated). Lo publica el usuario hogoraki en Hugging Face bajo licencia Apache 2.0 y está pensado para generación de texto conversacional, razonamiento y tool calling en uzbeko e inglés. El modelo base pertenece a la familia Spark-X2.6, una arquitectura transformer de 4.112.079.360 parámetros (aproximadamente 4,1 mil millones) con soporte nativo de modo de razonamiento mediante etiquetas ` thinking...</think>` y de llamadas a herramientas mediante `<tool_call>`.

El fine-tune se realizó en BF16 con LoRA y reporta una pérdida final de entrenamiento de 0.8421, aunque la model card no detalla el volumen de tokens, la composición del dataset ni la configuración exacta del entrenamiento. El resultado es un modelo pequeño, desplegable en hardware de consumo, que combina la capacidad multilingüe residual del modelo base con un ajuste específico para uzbeko y una política de contenido sin censura. Su relevancia actual radica en cubrir un hueco poco atendido: modelos abiertos con calidad razonable en una lengua de bajos recursos como el uzbeko, con soporte de agentes y razonamiento explícito.

La información pública disponible es escasa: cero descargas en el momento de la ficha, un único "like" y una model card breve en uzbeko. No se han publicado benchmarks, detalles del dataset ni evaluaciones de calidad, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Spark-X2.6, tag `spark2_5`); detalles internos no disponibles |
| Parametros totales | 4.112.079.360 (~4,1 B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 en el repo principal; GGUF Q4_K_M en el repo hermano `hogoraki/Spark-X2.6-4B-Uzbek-Uncensored-GGUF` |
| Idiomas soportados | Uzbeko (`uz`) e inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 8,2 GB); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un fine-tune mediante LoRA en precisión BF16 sobre FrostWolfAI/Spark-X2.6-4B-abliterated, que a su vez deriva de la familia Spark-X2.6 (etiquetada como `spark2_5` en los tags). La arquitectura concreta (número de capas, dimensiones ocultas, mecanismo de atención, posible uso de atención lineal o decodificación especulativa) no se detalla en la información proporcionada. El modelo base es una variante "abliterated", es decir, con las direcciones de rechazo eliminadas quirúrgicamente del espacio de activaciones, lo que produce un modelo sin censura conversacional.

El ajuste fino se orienta al uzbeko y reporta `loss=0.8421`, pero no se especifican el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF o DPO, ni la configuración de LoRA (rango, alpha, capas objetivo). Tampoco hay información sobre el proceso de abliteración del modelo base. La innovación destacable, según la model card, es la preservación de las capacidades agenticas del modelo base (razonamiento en ` thinking` y tool calling en `<tool_call>`) tras el ajuste al uzbeko.

## Capacidades

- Generación de texto conversacional en uzbeko e inglés.
- Razonamiento explícito en uzbeko mediante bloques ` thinking...</think>`.
- Tool calling / function calling mediante etiquetas `<tool_call>`, heredado del modelo base.
- Capacidades agenticas y razonamiento multi-paso (según los tags `reasoning` y `tool-calling`).
- Generación de código (la model card menciona "dasturlash", programación).
- Conversación sin censura (variante abliterated + etiqueta `uncensored`).
- Capacidad multilingüe limitada a uzbeko e inglés según la metadata; el rendimiento en otras lenguas no está documentado.
- No se menciona soporte de visión ni audio.

## Casos de uso

- Asistente conversacional en uzbeko: el ajuste LoRA específico permite mantener conversaciones multi-turno en uzbeko con un modelo de 4 B desplegable en local, útil para productos dirigidos al mercado de Uzbekistán donde los modelos grandes no cubren bien la lengua.
- Agentes con tool calling en uzbeko: la sintaxis `<tool_call>` permite integrar el modelo en pipelines de agentes que consulten APIs, bases de datos o servicios externos respondiendo en uzbeko.
- Razonamiento paso a paso documentado: el modo ` thinking` facilita tareas de análisis donde se quiere auditar la cadena de razonamiento, por ejemplo en soporte técnico o tutoría educativa.
- Generación de código asistida: puede emplearse como asistente de programación en entornos de desarrollo para hablantes de uzbeko, con explicaciones en su idioma.
- Investigación sobre alineación y seguridad: al ser un modelo abliterated, sirve como objeto de estudio para medir cómo la eliminación de rechazos afecta a la utilidad, la toxicidad y la fidelidad en una lengua de bajos recursos.
- Prototipado rápido en hardware de consumo: con cuantización Q4_K_M (GGUF) cabe en GPUs de gama media y permite iterar en local sin infraestructura cloud.
- Fine-tunes posteriores para otras lenguas túrquicas: el pipeline LoRA documentado (aunque sin hiperparámetros) sirve de referencia para adaptaciones similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 12-16 GB para contexto moderado.
- VRAM estimada en Q4_K_M (GGUF): aproximadamente 2,5-3 GB para pesos, con margen adicional para contexto.
- GPU recomendadas: A100 o H100 para despliegue en BF16 con concurrencia; RTX 4090 o RTX 3090 para BF16 en una sola GPU; RTX 4070/4080 o superiores para cuantizaciones GGUF.
- Cabe en GPU de consumo: sí, especialmente en formato GGUF Q4_K_M (RTX 3060 12 GB, RTX 4060 Ti 16 GB, e incluso GPUs de 8 GB con cuantizaciones menores no documentadas).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el código personalizado del modelo base), llama.cpp u Ollama mediante el GGUF publicado, y potencialmente vLLM o TGI si el código personalizado es compatible (no verificado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B-Uzbek-Uncensored | ~4,1 B | No disponible | uz, en | Apache 2.0 | Fine-tune LoRA en uzbeko, abliterated, tool calling |
| FrostWolfAI/Spark-X2.6-4B-abliterated | ~4,1 B | No disponible | No disponible | No disponible | Modelo base sin ajuste al uzbeko |
| Qwen2.5-3B / 7B | 3 B / 7 B | 32K / 128K (según variante) | Multilingüe amplio | Apache 2.0 (mayoría de variantes) | Alternativa generalista con mejor cobertura multilingüe, sin especialización en uzbeko |
| Llama 3.2 3B | 3 B | 128K | Multilingüe | Llama 3.2 Community License | Buena base generalista, cobertura de uzbeko limitada |

La comparación con alternativas es aproximada: no hay benchmarks publicados de este modelo que permitan contrastar calidad real frente a Qwen o Llama en uzbeko.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en uzbeko, inglés, código o tool calling; el `loss=0.8421` no es un indicador fiable de rendimiento downstream.
- Modelo abliterated: la eliminación de rechazos implica que puede generar contenido dañino, ilegal o sesgado sin filtros; requiere moderación externa en producción.
- Riesgo de alucinación: con solo 4 B de parámetros y sin datos de evaluación, la fiabilidad factual es incierta y probablemente inferior a modelos mayores.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas o documentos extensos.
- Cobertura lingüística limitada: solo uzbeko e inglés declarados; el rendimiento en otras lenguas túrquicas o en castellano no está documentado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base abliterated puede arrastrar obligaciones o caveats no documentados; conviene revisar la licencia del modelo base antes de desplegar.
- Requiere `trust_remote_code=True`: ejecuta código personalizado del repositorio, lo que supone un riesgo de seguridad si no se audita.
- Adopción prácticamente nula (0 descargas, 1 like al publicarse): no hay retroalimentación de la comunidad ni informes de fallos.
- Sin información sobre sesgos demográficos o culturales específicos del uzbeko.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hogoraki/Spark-X2.6-4B-Uzbek-Uncensored
- Versión GGUF (Q4_K_M): https://huggingface.co/hogoraki/Spark-X2.6-4B-Uzbek-Uncensored-GGUF
- Modelo base: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated

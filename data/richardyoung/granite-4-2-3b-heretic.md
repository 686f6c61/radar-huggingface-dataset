# richardyoung/granite-4.2-3b-heretic

## Resumen

Granite-4.2-3b-heretic es una variante "abliterated" (también etiquetada como decensored o uncensored) del modelo ibm-granite/granite-4.2-3b, publicada por el usuario richardyoung en Hugging Face. El modelo base es un transformer decoder-only de IBM perteneciente a la familia Granite 4.2, orientado a generación de texto, razonamiento con modo "thinking" explícito y tool calling. Esta versión concreta aplica una técnica de abliteration que elimina o atenúa la dirección de rechazo en el espacio de activaciones, de modo que el modelo responde a peticiones que el modelo original declinaría.

El interés de esta ficha radica en dos aspectos. Por un lado, documenta el estado de la familia Granite 4.2 en su tamaño de 3B, con 3.659.737.600 parámetros reales según los pesos en safetensors y un contexto diseñado para cargas de trabajo agénticas. Por otro, expone las particularidades y riesgos de los modelos abliterated: la modificación de pesos puede degradar capacidades de razonamiento y seguridad, y la licencia Apache 2.0 del modelo base no exime al usuario de responsabilidad sobre el contenido generado.

La relevancia actual es doble: los modelos pequeños de 3B con soporte de tool calling y modo thinking son candidatos naturales para despliegue en local y en el borde, y las variantes sin censura interesan a investigadores que estudian alineamiento, refusal behavior y robustez de salvaguardas. El repositorio está en acceso restringido (gated) y acumula 493 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia IBM Granite 4.2) |
| Parametros totales | 3.659.737.600 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la ficha; el repo contiene safetensors en precisión completa, por lo que es cuantizable a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base ibm-granite/granite-4.2-3b es un transformer decoder-only de la familia Granite 4.2 de IBM, diseñado con soporte nativo de razonamiento en modo thinking y de tool calling. La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni las etapas de alineamiento (RLHF/DPO) del modelo base; esos datos deben consultarse en la model card oficial de IBM.

Sobre esa base, richardyoung aplica una técnica de abliteration: se calcula una dirección de rechazo en el espacio de activaciones (habitualmente a partir de pares de prompts dañinos/inocuos) y se proyecta fuera de los pesos de las capas, de forma que el modelo pierde parte de su comportamiento de negativa. El autor etiqueta el proceso como reproducible. Esta intervención no reentrena el modelo con nuevos datos; modifica los pesos existentes, lo que puede alterar la distribución de activaciones y, con ella, el rendimiento en tareas que dependen de las mismas capas. La información disponible no especifica qué capas se intervinieron ni con qué hiperparámetros.

## Capacidades

- Generación de texto conversacional multi-turno en los doce idiomas declarados (en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh).
- Razonamiento con modo thinking explícito, heredado de la familia Granite 4.2: el modelo puede emitir una traza de razonamiento antes de la respuesta final.
- Tool calling y function calling, según las etiquetas del repositorio y las capacidades del modelo base.
- Razonamiento multi-paso orientado a flujos agénticos.
- Respuestas a peticiones que el modelo base rechazaría, como consecuencia de la abliteration.
- No se declaran capacidades de visión, audio ni multimodalidad en la información disponible.

## Casos de uso

- Investigación sobre alineamiento y refusal behavior: comparar las respuestas del modelo abliterated con las del ibm-granite/granite-4.2-3b original sobre el mismo conjunto de prompts permite medir cuánto cambia la tasa de rechazo y si se degrada la calidad en tareas neutras.
- Evaluación de robustez de salvaguardas: usar la variante como adversario controlado para probar clasificadores de contenido y filtros de moderación en pipelines de producción.
- Asistente conversacional local en escritorio: con 3,66B parámetros, el modelo cabe en GPUs de consumo con cuantización de 4 bits y puede ejecutarse con llama.cpp u Ollama para prototipos de chat sin conexión.
- Generación de texto creativo sin restricciones temáticas: escritura de ficción, guiones o material de rol donde el modelo base aplicaría negativas; requiere revisión humana por el riesgo de contenido dañino.
- Experimentación con tool calling en agentes pequeños: integrar el modelo en un bucle de agente que invoque APIs mediante function calling, aprovechando su tamaño reducido para despliegues con presupuesto de VRAM limitado.
- Traducción y generación multilingüe en doce idiomas: útil para prototipos de atención al cliente o generación de contenido en mercados con idiomas europeos y asiáticos cubiertos.
- Fine-tuning posterior sobre dominio específico: al ser Apache 2.0 y estar en safetensors, sirve como punto de partida para ajustes con LoRA en tareas verticales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 7,3 GB solo para pesos, más overhead de KV cache; en cuantización de 8 bits, en torno a 4 GB; en 4 bits, en torno a 2,5-3 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente en precisión completa; L40S o RTX A6000 para despliegues de una sola instancia.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 4080/4070 Ti (16 GB) e incluso en GPUs de 8 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers (formato nativo del repo), vLLM y TGI para servicio con batching, llama.cpp y Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| richardyoung/granite-4.2-3b-heretic | 3,66B | no disponible | Apache 2.0 | Variante abliterated del Granite 4.2 3B; acceso gated |
| ibm-granite/granite-4.2-3b | 3,66B | no disponible | Apache 2.0 | Modelo base original, con salvaguardas intactas |
| Qwen2.5-3B | 3,09B | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 | Alternativa de tamaño comparable con tool calling |
| Llama 3.2 3B | 3,21B | 128.000 tokens (según documentación pública de Meta) | Llama 3.2 Community License | Requiere cumplir la licencia de Meta para uso comercial |

La comparación de rendimiento entre estos modelos no puede establecerse con los datos disponibles, ya que no se han publicado benchmarks de esta variante abliterated.

## Limitaciones y advertencias

- La abliteration elimina parte del comportamiento de rechazo, por lo que el modelo puede generar contenido dañino, ilegal o sexualmente explícito; no es apto para aplicaciones orientadas al público sin moderación externa.
- La modificación de pesos puede degradar capacidades de razonamiento, coherencia y tool calling respecto al modelo base; se recomienda evaluar ambas versiones sobre el mismo conjunto de tareas antes de elegir.
- Riesgo de alucinación inherente a un modelo de 3,66B parámetros; no debe usarse como fuente de verdad sin verificación.
- La longitud de contexto no está documentada en la información disponible; no asumir ventanas largas sin comprobarlo en la model card del modelo base.
- El repositorio está en acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- La licencia Apache 2.0 cubre el uso comercial, pero el usuario asume la responsabilidad legal y ética del contenido generado; el autor de la variante no ofrece garantías.
- El soporte multilingüe está declarado por las etiquetas, pero no hay evaluación publicada de calidad por idioma en esta variante.
- Sesgos conocidos: no documentados en la información disponible; se heredan los del modelo base y pueden amplificarse por la intervención en los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/granite-4.2-3b-heretic
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Paper referenciado en las etiquetas (arXiv:2406.11717): https://arxiv.org/abs/2406.11717
- Paper referenciado en las etiquetas (arXiv:2510.18892): https://arxiv.org/abs/2510.18892

# OpenLLM-France/Luciole-1B-Instruct-1.1-FP8

## Resumen

Luciole-1B-Instruct-1.1-FP8 es una versión cuantizada a FP8 del modelo Luciole-1B-Instruct-1.1, desarrollado por LINAGORA dentro del consorcio OpenLLM-France (proyecto France2030 financiado por Bpifrance). Se trata de un modelo de lenguaje de tipo decoder-only con 1.319.309.312 parámetros, orientado a generación de texto y conversación, con soporte nativo para francés e inglés. Su relevancia radica en que ofrece una variante optimizada para inferencia en GPUs con soporte nativo de FP8 (arquitecturas Hopper, Ada Lovelace o Blackwell), lo que reduce el uso de memoria y acelera el despliegue en producción sin reentrenar el modelo base.

La cuantización se ha realizado con LLM Compressor y se distribuye en formato compressed-tensors, compatible directamente con transformers y con vLLM. El objetivo es facilitar el servicio de un modelo pequeño (en torno a 1B de parámetros) en entornos donde el rendimiento por vatio y la latencia importan, manteniendo la licencia permisiva Apache 2.0 del modelo original.

Al estar basado en el modelo Nemotron (según las etiquetas de Hugging Face), hereda la arquitectura de dicha familia, aunque la model card no detalla la composición exacta del dataset de entrenamiento ni el proceso de alineación. Esta ficha se limita a los datos disponibles públicamente en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Nemotron, según tags) |
| Parametros totales | 1.319.309.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (compressed-tensors, generado con LLM Compressor) |
| Idiomas soportados | Francés (fr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es una cuantización FP8 del checkpoint OpenLLM-France/Luciole-1B-Instruct-1.1, que a su vez pertenece a la familia Nemotron según las etiquetas del repositorio. La arquitectura subyacente es un transformer decoder-only de aproximadamente 1.300 millones de parámetros, ajustado para instrucciones (Instruct). La model card no proporciona detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la versión base.

La innovación técnica principal de esta variante es la cuantización a FP8 realizada con LLM Compressor y empaquetada en formato compressed-tensors. Este formato permite servir el modelo con vLLM de forma nativa y aprovechar las unidades de cómputo FP8 de las GPUs NVIDIA Hopper, Ada Lovelace y Blackwell, lo que reduce el footprint de memoria y aumenta el throughput respecto a la versión en BF16/FP16. No se documentan otras innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en francés e inglés.
- Seguimiento de instrucciones (modelo de tipo Instruct).
- Razonamiento básico y respuesta a preguntas, limitado por el tamaño de 1B de parámetros.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a francés e inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Asistente conversacional en francés para atención al cliente: el modelo puede gestionar diálogos multi-turno en francés, su idioma principal, con un coste de inferencia bajo gracias a sus 1.300 millones de parámetros y la cuantización FP8.
- Clasificación y etiquetado de textos en inglés y francés: útil para pipelines de moderación o enrutamiento de tickets, donde el modelo genera respuestas cortas y estructuradas.
- Generación de resúmenes de documentos breves: adecuado para tareas de summarization de párrafos o correos en entornos con recursos limitados.
- Prototipado rápido de aplicaciones de IA generativa: el despliegue con `vllm serve` permite levantar un endpoint compatible con la API de OpenAI en minutos.
- Traducción asistida francés-inglés: aunque no es su función principal, el modelo bilingüe puede emplearse para borradores de traducción en dominios sencillos.
- Sistemas de respuesta a preguntas sobre bases documentales pequeñas: combinado con RAG, puede responder consultas frecuentes con latencia baja en GPUs de gama media con soporte FP8.
- Despliegue en entornos con restricciones de memoria: la cuantización FP8 reduce el uso de VRAM frente a la versión BF16, lo que permite servir el modelo en GPUs consumer Ada Lovelace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3-1,5 GB para los pesos en FP8, más overhead de KV cache y runtime (estimación orientativa; no confirmada por el autor).
- GPU recomendadas: NVIDIA H100, H200, B200 (Hopper/Blackwell) para máximo rendimiento FP8; GPUs Ada Lovelace (RTX 4090, L40S, L4) también soportan FP8 nativo.
- Cabe en GPU consumer: sí, en GPUs Ada Lovelace con soporte FP8 (por ejemplo, RTX 4090 con 24 GB). En GPUs sin soporte FP8 nativo (Ampere o anteriores) el modelo podría cargarse pero sin la aceleración prevista.
- Opciones de despliegue: vLLM es el backend recomendado por el autor (`vllm serve OpenLLM-France/Luciole-1B-Instruct-1.1-FP8`); también es compatible con transformers mediante compressed-tensors. Otros backends (llama.cpp, Ollama, TGI) no están documentados para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Luciole-1B-Instruct-1.1-FP8 | 1,32B | no disponible | fr, en | Apache 2.0 | safetensors (FP8) |
| Luciole-1B-Instruct-1.1 (base) | 1,32B | no disponible | fr, en | Apache 2.0 | safetensors (BF16/FP16, presumiblemente) |
| Otros modelos ~1B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos en la información proporcionada, por lo que la comparativa cuantitativa no puede completarse.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse principalmente con datos en francés e inglés, puede reflejar sesgos de esos corpus.
- Riesgo de alucinación: presente, como en cualquier LLM de 1B de parámetros; la capacidad de razonamiento y verificación factual es limitada.
- Limitaciones de contexto o idioma: solo se declaran francés e inglés; el rendimiento en otros idiomas no está garantizado. La longitud de contexto no está publicada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; se debe conservar el aviso de copyright de LINAGORA.
- Requisito de hardware: la aceleración FP8 requiere GPUs con soporte nativo (Hopper, Ada Lovelace o Blackwell); en otras GPUs el rendimiento puede degradarse o requerir fallback.
- Formato específico: al estar en compressed-tensors, el soporte en backends distintos de vLLM/transformers puede ser limitado.
- Madurez: el modelo tiene pocas descargas (64) y likes (4), lo que sugiere una adopción todavía baja y menos validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/OpenLLM-France/Luciole-1B-Instruct-1.1-FP8
- Modelo base: https://huggingface.co/OpenLLM-France/Luciole-1B-Instruct-1.1
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm

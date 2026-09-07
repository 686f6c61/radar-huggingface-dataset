# faxoi/llama-3.2-3b-price-engine-Rev1

## Resumen

faxoi/llama-3.2-3b-price-engine-Rev1 es un modelo de lenguaje de 3.212.749.824 parámetros, desarrollado por faxoi mediante un ajuste fino (finetune) del modelo unsloth/Llama-3.2-3B-Instruct-bnb-4bit. El nombre sugiere una especialización en tareas de precios (price engine), aunque la documentación pública no especifica el problema concreto que resuelve ni el conjunto de datos utilizado.

El modelo se entrenó con las librerías Unsloth y TRL de Hugging Face, y la model card indica que el entrenamiento fue 2 veces más rápido gracias a Unsloth. La arquitectura es un transformer decoder-only, heredada del modelo base Llama-3.2-3B-Instruct, con una longitud de contexto de 128k, también heredada del modelo base. Está publicado bajo licencia Apache 2.0 y declarado únicamente en inglés.

Su relevancia radica en que es un modelo pequeño (3B) que puede ejecutarse en hardware de consumo, lo que lo hace apto para aplicaciones de bajo coste. Sin embargo, al no haber benchmarks ni documentación técnica disponible, su rendimiento real no puede evaluarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.2-3B-Instruct) |
| Parámetros totales | 3.212.749.824 |
| Longitud de contexto | 128k (heredada del modelo base Llama-3.2-3B-Instruct) |
| Tipos de cuantización | No disponible (el modelo base emplea bnb-4bit, pero el checkpoint subido no especifica su precisión) |
| Idiomas soportados | Inglés (según la etiqueta `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

*Nota: la longitud de contexto se asume a partir del modelo base; no se ha verificado en este finetune.*

## Arquitectura y entrenamiento

El modelo es un ajuste fino de unsloth/Llama-3.2-3B-Instruct-bnb-4bit, que a su vez es una versión cuantizada a 4-bit del modelo Llama-3.2-3B-Instruct. El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face. La model card indica que el entrenamiento fue 2 veces más rápido gracias a Unsloth, pero no proporciona información sobre el dataset, el número de tokens, la composición de los datos ni si se aplicaron técnicas de alineación como RLHF o DPO.

No se documentan innovaciones técnicas destacables más allá del uso de Unsloth para acelerar el entrenamiento. El repositorio tiene un tamaño de 51.4 GB, inusualmente grande para un modelo de 3.2B, lo que sugiere que puede incluir archivos adicionales como checkpoints de entrenamiento o datasets, aunque no se especifica.

## Capacidades

La información disponible no documenta capacidades específicas del modelo. A partir del modelo base se pueden inferir las siguientes:

- Generación de texto en inglés, heredada de Llama-3.2-3B-Instruct.
- El nombre del modelo sugiere una orientación a tareas de precios (price engine), pero no hay evidencia pública que lo confirme.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües limitadas al inglés, según los metadatos.

## Casos de uso

La información disponible no documenta casos de uso específicos. A continuación se enumeran aplicaciones plausibles para un modelo de 3B especializado en precios, basadas en el nombre y la arquitectura:

- Asistente de precios en comercio electrónico: el modelo puede responder consultas sobre precios, descuentos y comparativas de productos. Su tamaño de 3B permite ejecutarlo en servidores de bajo coste.
- Chatbot de atención al cliente para tiendas de bricolaje: dado que la búsqueda web muestra enlaces a Leroy Merlin, el modelo podría integrarse en un asistente para resolver dudas sobre precios y disponibilidad.
- Análisis de facturas y albaranes: extracción de precios unitarios y totales de documentos, gracias a la capacidad de generación de texto del modelo base.
- Generación de descripciones de producto con precios: el modelo puede redactar fichas de producto que incluyan información de precio.
- Soporte a agentes de ventas: el modelo puede actuar como copiloto, sugiriendo respuestas sobre precios en conversaciones con clientes.
- Integración en pipelines de pricing dinámico: el modelo puede generar explicaciones de cambios de precio o responder a consultas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.212.749.824 parámetros, en precisión FP16 se necesitan aproximadamente 6.4 GB para los pesos, más memoria para activaciones (recomendable 8-10 GB). Con cuantización 4-bit, los pesos ocupan ~1.6 GB y la VRAM total puede ser de 2-4 GB.
- GPU recomendadas: NVIDIA RTX 3060 12GB, RTX 4090, A10 o A100 para FP16. Para 4-bit, una RTX 3060 6GB puede funcionar con contextos cortos.
- Cabe en GPU de consumo: sí, especialmente con cuantización 4-bit.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| faxoi/llama-3.2-3b-price-engine-Rev1 | 3.212.749.824 | 128k | Apache 2.0 | Hugging Face | No disponible |
| unsloth/Llama-3.2-3B-Instruct-bnb-4bit | 3.212.749.824 | 128k | Apache 2.0 (etiqueta) | Hugging Face | No disponible |
| Llama-3.2-3B-Instruct | 3.212.749.824 | 128k | Llama 3.2 Community License | Hugging Face | No disponible |

No se han publicado benchmarks para ninguno de estos modelos en la información disponible.

## Limitaciones y advertencias

- Sesgos: no documentados; el modelo puede heredar sesgos del modelo base Llama-3.2.
- Riesgo de alucinación: al ser un finetune sin documentación, es probable que alucine en tareas de precios si no se le proporcionan datos verificados.
- Limitaciones de idioma: solo inglés declarado, lo que limita su uso en entornos hispanohablantes.
- Contexto: la longitud de contexto se asume en 128k, pero podría reducirse durante el entrenamiento; no se ha verificado.
- Restricciones de licencia: aunque la etiqueta indica Apache 2.0, el modelo base Llama-3.2 original está sujeto a la Llama 3.2 Community License, que puede imponer condiciones adicionales. Se recomienda revisar los términos antes de uso comercial.
- Caveat para producción: al no haber benchmarks ni documentación, no se recomienda su uso en sistemas críticos sin una evaluación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/faxoi/llama-3.2-3b-price-engine-Rev1
- Modelo anterior (sin Rev1): https://huggingface.co/faxoi/llama-3.2-3b-price-engine
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
- Endpoint de FriendliAI: https://friendli.ai/models/faxoi/llama-3.2-3b-price-engine-Rev1

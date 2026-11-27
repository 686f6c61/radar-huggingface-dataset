# Eureka-COM/MistralMosaic-24B-v2-4bit

## Resumen

MistralMosaic-24B-v2-4bit es la versión cuantizada a 4 bits del modelo base MistralMosaic-24B-v2, desarrollado por Eureka-COM. Se trata de un modelo de generación de texto derivado de la familia Mistral, con un total de 31.145.308.800 parámetros reales según los pesos en safetensors (a pesar de la denominación "24B" en el nombre). La cuantización se ha realizado con bitsandbytes usando NF4 con doble cuantización y cómputo en bf16, lo que reduce el peso en GPU de 63,0 GB a 18,3 GB.

El modelo incorpora la etiqueta "memory-mosaics", que sugiere una arquitectura o técnica propietaria de gestión de memoria, aunque la model card no detalla su funcionamiento. Está pensado para investigación y soporta únicamente inglés y japonés. La licencia es Apache-2.0, lo que permite uso comercial, aunque la documentación disponible es muy limitada.

La relevancia actual de esta ficha es doble: por un lado, permite ejecutar un modelo de más de 31.000 millones de parámetros en GPUs con menos de 24 GB de VRAM efectiva; por otro, la model card es extremadamente escueta y no publica especificaciones de contexto, datos de entrenamiento ni benchmarks, lo que limita su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (derivada de Mistral, etiqueta `mistral_mosaic`); detalles no disponibles |
| Parametros totales | 31.145.308.800 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits NF4 con doble cuantizacion, computo en bf16 (bitsandbytes) |
| Idiomas soportados | en, ja |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (18,1 GB en repo) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de la etiqueta `mistral_mosaic` y la referencia a la familia Mistral. No se especifica si emplea atención lineal, decodificación especulativa, mezcla de expertos u otras innovaciones. La etiqueta "memory-mosaics" aparece en los tags, pero no se documenta su significado técnico ni su implementación.

Respecto al entrenamiento, no se publica el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. La información disponible se limita al proceso de cuantización: se aplicó NF4 con doble cuantización sobre los pesos del modelo base, con cómputo en bf16. La validación de la cuantización se realizó sobre 8 artículos de Wikipedia (4 en inglés, 4 en japonés, 4.096 tokens cada uno), midiendo una pérdida adicional de +0,0417 por token y una coincidencia del 91,5% en el token top-1 respecto al modelo en bf16. Tras guardar y recargar los pesos, los logits fueron idénticos, lo que confirma la reproducibilidad del proceso.

## Capacidades

- Generación de texto autoregresiva en inglés y japonés.
- Razonamiento y respuesta a instrucciones (heredado del modelo base, sin detalles publicados).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo "thinking".
- Capacidades multilingües limitadas a inglés y japonés según los metadatos.
- Ejecución en GPU CUDA mediante transformers y bitsandbytes.

## Casos de uso

- Investigación sobre cuantización: el modelo sirve como caso de estudio para medir el impacto de NF4 con doble cuantización en un modelo de 31.000 millones de parámetros, con métricas concretas de pérdida (+0,0417) y coincidencia top-1 (91,5%).
- Generación de texto en japonés e inglés en entornos con VRAM limitada: al ocupar 18,3 GB en GPU, puede desplegarse en tarjetas de 24 GB para tareas de generación y resumen en ambos idiomas.
- Prototipado rápido de aplicaciones de texto: la integración con transformers y `device_map="cuda"` permite poner en marcha un pipeline de generación con pocas líneas de código.
- Evaluación comparativa de modelos cuantizados: útil para contrastar la calidad de la cuantización bitsandbytes frente a otras técnicas (GPTQ, AWQ) sobre el mismo modelo base.
- Despliegue en estaciones de trabajo con una sola GPU: el tamaño reducido del repo (18,1 GB) facilita la descarga y el almacenamiento local frente a los 62,3 GB del modelo en bf16.
- Reproducción de experimentos académicos: la inclusión de `evidence.json` con cada valor medido y su archivo de origen permite auditar los resultados de la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo incluye métricas comparativas entre la versión bf16 y la cuantizada:

| Metrica | bf16 (MistralMosaic-24B-v2) | 4bit (este modelo) |
|---|---|---|
| Pesos en GPU | 63,0 GB | 18,3 GB |
| Archivos safetensors | 62,3 GB | 18,1 GB |
| Perdida por token (cambio desde bf16) | — | +0,0417 |
| Coincidencia token top-1 con bf16 | — | 91,5% |
| Velocidad de generacion (A100, tokens/s) | 1,51 | 1,37 |

Las métricas de pérdida y coincidencia top-1 se midieron sobre 8 artículos de Wikipedia (4 en inglés, 4 en japonés, 4.096 tokens cada uno).

## Requisitos de hardware

- VRAM estimada para inferencia: 18,3 GB de pesos en GPU, más overhead de activaciones y caché KV (no cuantificada), por lo que se recomienda al menos 24 GB de VRAM.
- GPU recomendadas: A100 (usada en las mediciones del autor), H100, o cualquier GPU con 24 GB o más (RTX 3090, RTX 4090, L40S).
- Cabe en GPU de consumo: sí, en RTX 3090 y RTX 4090 (24 GB), siempre que la longitud de contexto y el tamaño de lote sean moderados.
- Opciones de despliegue: transformers con bitsandbytes (documentado); no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el uso de `custom_code` y `trust_remote_code=True` complica su integración en otros motores.
- Latencia y throughput: 1,37 tokens/s en A100 según la model card, lo que supone una velocidad muy baja para producción y sugiere que el modelo no está optimizado para inferencia de alto rendimiento.
- Requisitos de software: bitsandbytes (compilado con 0.50.2) y GPU CUDA; no debe pasarse `fix_mistral_regex`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MistralMosaic-24B-v2-4bit | 31.145.308.800 | no disponible | apache-2.0 | Hugging Face | Cuantizado NF4, 18,1 GB, 1,37 tok/s en A100 |
| MistralMosaic-24B-v2 (bf16) | 31.145.308.800 | no disponible | apache-2.0 | Hugging Face | Modelo base sin cuantizar, 62,3 GB, 1,51 tok/s en A100 |
| Mistral 7B | 7.242.000.000 (aprox.) | 32.768 (tipico) | apache-2.0 | Hugging Face | Menor tamaño, mayor velocidad, menor capacidad |
| Mixtral 8x7B | 46.700.000.000 (aprox.) | 32.768 (tipico) | apache-2.0 | Hugging Face | MoE con 12.900 millones de parametros activos |

La comparativa con Mistral 7B y Mixtral 8x7B se ofrece como referencia de categoría; no se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- La model card es mínima: no documenta sesgos, datos de entrenamiento ni evaluación de alucinación.
- Soportado únicamente en inglés y japonés; el rendimiento en otros idiomas no está garantizado.
- La cuantización introduce una pérdida de +0,0417 por token y una coincidencia top-1 del 91,5%, lo que implica degradación respecto al modelo en bf16.
- La velocidad de 1,37 tokens/s en A100 es muy baja para uso en producción o aplicaciones interactivas.
- Requiere `trust_remote_code=True` y código personalizado (`custom_code`), lo que supone un riesgo de seguridad y de compatibilidad con versiones futuras de transformers.
- No se debe pasar `fix_mistral_regex`; la razón no se explica en la model card.
- El nombre "24B" no coincide con los 31.145.308.800 parámetros reales, lo que puede inducir a error en la planificación de recursos.
- No se documenta la longitud de contexto, lo que impide garantizar el comportamiento en conversaciones largas o documentos extensos.
- Aunque la licencia Apache-2.0 permite uso comercial, la falta de documentación sobre el entrenamiento y las evaluaciones dificulta asumir riesgos en entornos regulados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Eureka-COM/MistralMosaic-24B-v2-4bit
- Modelo base: https://huggingface.co/Eureka-COM/MistralMosaic-24B-v2
- README en japonés: https://huggingface.co/Eureka-COM/MistralMosaic-24B-v2-4bit/blob/main/README_ja.md
- Repositorio de bitsandbytes: https://github.com/bitsandbytes-foundation/bitsandbytes
- Documentación de transformers: https://huggingface.co/docs/transformers

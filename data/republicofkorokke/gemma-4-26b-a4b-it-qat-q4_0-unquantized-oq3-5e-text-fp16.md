# RepublicOfKorokke/gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ3.5e-text-fp16

## Resumen

Este modelo es una cuantización a 3 bits de un checkpoint de Google: `gemma-4-26B-A4B-it-qat-q4_0-unquantized`, publicado por el autor `RepublicOfKorokke` con la herramienta oQ (oMLX v0.6.4). El checkpoint resultante tiene 25.233.141.790 parámetros (25,2 mil millones) y se distribuye en formato MLX safetensors, con un tamaño de repositorio de 12,6 GB. El objetivo es reducir la huella de memoria del modelo para su uso en entornos Apple Silicon, aprovechando la cuantización mixta de precisión.

La nomenclatura A4B sugiere una arquitectura Mixture-of-Experts con aproximadamente 4B de parámetros activos, aunque esta característica no está confirmada en los metadatos. La información disponible es muy limitada: no se declara licencia, idiomas soportados, longitud de contexto, ni resultados de benchmarks. El modelo es una variante instruct (IT), pero la falta de documentación impide determinar con precisión sus capacidades o su idoneidad para casos de uso concretos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador (familia Gemma 4); el sufijo A4B sugiere MoE con 4B activos, no confirmado |
| Parametros totales | 25.233.141.790 |
| Parametros activos | No disponible en la información; el sufijo A4B sugiere 4B activos |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 3 bits (oQ3.5e) con group size 64, mediante oMLX v0.6.4 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo se genera a partir de un checkpoint base de Google, `gemma-4-26B-A4B-it-qat-q4_0-unquantized`, que ya incorpora cuantización consciente del entrenamiento (QAT). El autor aplicó una segunda cuantización con la herramienta oQ de oMLX, utilizando 3 bits y un grupo de 64, conservando el formato MLX safetensors. No se proporciona información sobre el preentrenamiento del modelo base, la composición del dataset, ni sobre técnicas de alineación como RLHF o DPO. La arquitectura subyacente es un transformador de la familia Gemma 4; el indicativo A4B en el nombre sugiere una disposición Mixture-of-Experts, pero los metadatos no lo confirman explícitamente.

## Capacidades

- Generación de texto e instrucciones: al ser una variante instruct (IT), se espera que responda a prompts en lenguaje natural, aunque no hay datos que lo confirmen.
- Tool calling, agentes, visión, audio y multilingüismo: no documentados en la ficha.
- No se han publicado evaluaciones de capacidad, calidad o coherencia en la información disponible.

## Casos de uso

- No se pueden determinar casos de uso concretos a partir de la información disponible. El modelo carece de evaluaciones publicadas y de detalles sobre sus capacidades, por lo que no es posible recomendar aplicaciones específicas con confianza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del checkpoint: 12,6 GB (archivos safetensors).
- VRAM estimada para inferencia: no disponible; a partir del tamaño del checkpoint, los pesos requieren al menos 12,6 GB en memoria, más overhead de activaciones y buffers, pero no se ofrecen mediciones oficiales.
- GPU recomendadas: no disponible; el formato MLX safetensors sugiere que el modelo está pensado para procesadores Apple Silicon (MLX), no para GPUs CUDA.
- Posibilidad de despliegue en GPU de consumo: no se puede confirmar debido a la falta de datos de VRAM oficiales.
- Opciones de despliegue: no se indican integraciones con vLLM, llama.cpp, Ollama ni TGI. El formato MLX apunta a ejecución con la librería MLX en macOS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables en la búsqueda realizada.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluación de seguridad, sesgos, alucinaciones o calidad de salida.
- El modelo es una cuantización no oficial realizada por un tercero; la reducción a 3 bits puede degradar la calidad y la fidelidad de las respuestas.
- La licencia no está declarada en la ficha, por lo que se desconocen las restricciones de uso comercial o redistribución.
- No se detallan los idiomas soportados, la longitud de contexto ni las capacidades multimodales.
- No hay descargas ni valoraciones de la comunidad, lo que indica que el modelo no cuenta con validación en entornos reales.
- Se recomienda evaluar exhaustivamente el modelo en datos propios antes de considerar su uso en producción.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/RepublicOfKorokke/gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ3.5e-text-fp16)
- [Modelo base: google/gemma-4-26B-A4B-it-qat-q4_0-unquantized](https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized)
- [Herramienta de cuantización oQ (oMLX)](https://github.com/jundot/omlx)

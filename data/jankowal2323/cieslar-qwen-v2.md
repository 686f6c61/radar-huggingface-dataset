# jankowal2323/cieslar-qwen-v2

## Resumen

CIESLAR-QWEN v2 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B, publicado por el usuario jankowal2323 en Hugging Face. Se trata de una edición personalizada orientada a dotar al modelo de una identidad y un estilo de respuesta propios, con una personalidad consistente y una firma promocional de "CieslarCoin" en las respuestas. El ajuste se realizó mediante LoRA utilizando la pila de entrenamiento Unsloth, y el resultado se distribuye en formato GGUF para inferencia local.

El modelo conserva la arquitectura y el tamaño del base: aproximadamente 4.326 millones de parámetros (4,3B), lo que lo sitúa en la categoría de modelos pequeños aptos para hardware de consumo. Los idiomas declarados son polaco (pl) e inglés (en), lo que refleja el origen del autor y el enfoque del ajuste. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia es limitada fuera del nicho para el que fue creado: no es un modelo de propósito general competitivo, sino un experimento de personalización de identidad sobre un base moderno. Resulta útil como ejemplo de fine-tuning con LoRA y Unsloth, y como caso práctico de despliegue en GGUF para entornos locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); detalles internos no disponibles |
| Parametros totales | 4.326.350.848 (4,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q4_K_M (recomendada para movil), Q8_0 (recomendada para PC) |
| Idiomas soportados | polaco (pl), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tamano del repo: 8,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,3B parametros. El ajuste se realizo con LoRA (Low-Rank Adaptation) sobre la pila Unsloth, una tecnica que entrena solo un subconjunto reducido de pesos adicionales y mantiene congelado el modelo base, lo que reduce los requisitos de memoria y acelera el entrenamiento. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO.

El objetivo declarado del ajuste no es mejorar capacidades tecnicas (razonamiento, codigo o matematicas), sino inculcar un estilo de respuesta propio, una personalidad coherente y una firma promocional. La model card recomienda desactivar el modo "thinking" y usar temperaturas de 0,6 a 0,7. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en polaco e ingles, con el estilo e identidad ajustados del autor.
- Respuestas con personalidad consistente y firma promocional de "CieslarCoin" integrada.
- Inferencia local en formato GGUF mediante cuantizaciones Q4_K_M y Q8_0.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modo "thinking" se recomienda desactivado.
- Capacidades multilingues: limitadas a polaco e ingles segun la model card.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales con identidad de marca: el modelo puede generar respuestas con un tono y una personalidad definidos, util para demos de personajes o bots corporativos con voz propia.
- Despliegue en movil o dispositivos de bajos recursos: la cuantizacion Q4_K_M permite ejecutar el modelo en hardware limitado con llama.cpp u Ollama, adecuado para pruebas de campo.
- Experimentacion con fine-tuning LoRA: sirve como referencia practica de como ajustar un Qwen3.5-4B con Unsloth y exportar a GGUF.
- Generacion de texto en polaco: para aplicaciones dirigidas al mercado polaco que necesiten un modelo ligero y local, sin depender de APIs externas.
- Inferencia local en PC con Q8_0: para entornos de escritorio donde se prioriza la calidad sobre el tamano, con despliegue via llama.cpp o LM Studio.
- Educacion y divulgacion: como ejemplo de personalizacion de identidad sobre un modelo base y de publicacion de artefactos GGUF en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para 4,3B parametros, en Q4_K_M se estima un uso de aproximadamente 2,5-3,5 GB; en Q8_0, en torno a 4,5-5,5 GB. Son estimaciones por tamano, no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 3060 de 12 GB o superior puede ejecutar ambas cuantizaciones con holgura; A100 y H100 no son necesarias.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM para Q4_K_M y 8 GB o mas para Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CIESLAR-QWEN v2 | 4,3B | no disponible | Apache 2.0 | GGUF | Fine-tune de identidad sobre Qwen3.5-4B |
| Qwen/Qwen3.5-4B | 4,3B | no disponible | Apache 2.0 (segun base) | safetensors | Modelo base sin personalizacion |
| Qwen2-7B | 7B | no disponible | Apache 2.0 | safetensors | Generacion anterior de la familia Qwen, mayor tamano |

La comparativa se limita a datos de parametros y licencia; no hay resultados de benchmarks publicados para el modelo ajustado que permitan una comparacion de rendimiento.

## Limitaciones y advertencias

- El ajuste esta orientado a identidad y estilo, no a mejorar capacidades tecnicas; el rendimiento en tareas de razonamiento o codigo puede ser igual o inferior al del base.
- La firma promocional de "CieslarCoin" puede aparecer en las respuestas, lo que resulta inadecuado para uso profesional sin control adicional.
- Riesgo de alucinacion inherente a los modelos de 4B, agravado por un ajuste centrado en estilo.
- Cobertura linguistica limitada a polaco e ingles; el castellano no esta declarado como idioma soportado.
- Longitud de contexto no documentada; no se debe asumir la del base sin verificacion.
- Licencia Apache 2.0 permite uso comercial, pero el contenido promocional integrado y la falta de documentacion sobre el dataset de entrenamiento requieren revision antes de produccion.
- Modelo con 0 descargas y 1 like en el momento de la consulta: sin validacion comunitaria ni evaluaciones independientes.
- La model card esta redactada en polaco y con un tono promocional; la documentacion tecnica es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jankowal2323/cieslar-qwen-v2
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Documentacion de Qwen2 en Transformers (referencia de familia): https://huggingface.co/docs/transformers/model_doc/qwen2

# gomama0/Ternary-Bonsai-8B-Code-SFT-F16-GGUF

## Resumen

Ternary-Bonsai-8B-Code-SFT-F16-GGUF es la conversión a formato GGUF de un adaptador LoRA denominado Ternary-Bonsai-8B-Code-SFT, publicado por el usuario gomama0 a partir del repositorio original de Jcfunk. El artefacto no es un modelo completo, sino un adaptador LoRA en precisión F16 pensado para aplicarse sobre un modelo base (presumiblemente de la familia Qwen3, según las etiquetas del repositorio) mediante llama.cpp o herramientas compatibles. El proceso de conversión se realizó con el espacio GGUF-my-LoRA de ggml.ai.

El nombre sugiere un ajuste fino orientado a código (Code-SFT) sobre un modelo de aproximadamente 8.000 millones de parámetros, con una posible componente de cuantización ternaria en el modelo original, aunque esta información no se confirma en la model card. El repositorio tiene un tamaño de 0,2 GB, coherente con un adaptador LoRA y no con un modelo completo.

La relevancia de esta ficha es limitada: se trata de un artefacto derivado, con 22 descargas y sin documentación técnica propia más allá de las instrucciones de uso con llama.cpp. No se han publicado benchmarks, detalles de entrenamiento ni especificaciones del modelo base en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA; modelo base presumiblemente transformer Qwen3) |
| Parametros totales | 87.293.952 (según safetensors del repo; corresponde al adaptador, no al modelo completo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (adaptador LoRA en GGUF) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (LoRA) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base ni sobre el proceso de entrenamiento del adaptador. La model card indica únicamente que se trata de un adaptador LoRA convertido a GGUF mediante el espacio GGUF-my-LoRA de ggml.ai, y que debe aplicarse sobre un modelo base compatible con llama.cpp. Las etiquetas del repositorio mencionan `qwen3`, `unsloth`, `trl` y `text-generation-inference`, lo que sugiere que el ajuste se realizó con Unsloth y TRL sobre un modelo de la familia Qwen3, pero no se aportan detalles sobre el dataset, el número de tokens de entrenamiento ni si hubo RLHF o DPO.

El nombre "Ternary" podría indicar que el modelo base emplea pesos ternarios (cuantización de muy baja precisión), pero esta hipótesis no se confirma en la documentación disponible. Tampoco se especifica si el adaptador modifica capas de atención, MLP o ambas.

## Capacidades

- Generación de texto y, presumiblemente, de código, dado el sufijo "Code-SFT" del nombre.
- Aplicable como adaptador LoRA sobre un modelo base compatible con llama.cpp (CLI y servidor).
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Ajuste rápido de un modelo base para tareas de generación de código: el adaptador puede cargarse con `llama-cli` o `llama-server` junto al modelo base para experimentar con un ajuste específico de código sin necesidad de reentrenar.
- Prototipado en local con llama.cpp: al ser un LoRA en F16 de pequeño tamaño (0,2 GB), permite probar variantes de ajuste sobre el mismo modelo base con un coste de almacenamiento mínimo.
- Evaluación comparativa de adaptadores: útil para investigadores que quieran contrastar el efecto de este LoRA frente a otros sobre el mismo modelo base.
- Despliegue en servidor llama.cpp con `--lora`: permite servir el modelo ajustado vía API compatible con OpenAI si el modelo base lo permite.
- Experimentación con modelos de pesos ternarios: si el modelo base emplea cuantización ternaria, este adaptador puede servir para estudiar el comportamiento de ajustes de bajo rango en ese régimen.
- Integración en pipelines de generación de código asistida: siempre que se valide la calidad del adaptador, puede emplearse como componente de autocompletado o generación de fragmentos en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el modelo completo; el adaptador LoRA en F16 ocupa aproximadamente 0,2 GB.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; dependerá del modelo base sobre el que se aplique.
- Opciones de despliegue: llama.cpp (CLI y servidor) mediante `--lora`; otras herramientas compatibles con LoRA GGUF no confirmadas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada adaptadores LoRA comparables con especificaciones verificables.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere un modelo base compatible y no se especifica cuál es exactamente.
- Documentación mínima: la model card no aporta detalles de entrenamiento, dataset ni evaluación.
- Idioma limitado al inglés según la etiqueta del repositorio.
- Riesgo de alucinación y sesgos: no evaluado; dependerá del modelo base y del dataset de ajuste, no documentado.
- Licencia Apache 2.0 declarada, pero la procedencia y los términos del modelo base deben verificarse por separado antes de uso comercial.
- El nombre "Ternary" sugiere cuantización de muy baja precisión, lo que podría implicar degradación de calidad; no confirmado.
- Repositorio con muy poca tracción (22 descargas, 0 likes) y sin mantenimiento documentado.

## Enlaces

- [Hugging Face: gomama0/Ternary-Bonsai-8B-Code-SFT-F16-GGUF](https://huggingface.co/gomama0/Ternary-Bonsai-8B-Code-SFT-F16-GGUF)
- [Modelo base: Jcfunk/Ternary-Bonsai-8B-Code-SFT](https://huggingface.co/Jcfunk/Ternary-Bonsai-8B-Code-SFT)
- [Espacio GGUF-my-LoRA de ggml.ai](https://huggingface.co/spaces/ggml-org/gguf-my-lora)
- [Documentación del servidor llama.cpp](https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md)

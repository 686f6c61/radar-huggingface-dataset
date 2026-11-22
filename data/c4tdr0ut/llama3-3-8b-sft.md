# c4tdr0ut/llama3.3-8b-sft

## Resumen

`c4tdr0ut/llama3.3-8b-sft` es un ajuste fino supervisado (SFT) del modelo `allura-forge/Llama-3.3-8B-Instruct`, publicado por el usuario c4tdr0ut en Hugging Face. Se trata de un modelo de generación de texto de 8.030.261.248 parámetros (aproximadamente 8 mil millones), distribuido en formato safetensors y con licencia Apache 2.0. El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, según indica la propia model card.

El modelo hereda la arquitectura transformer decoder-only de la familia Llama 3.3, aunque la model card no aporta detalles sobre la longitud de contexto, la composición del dataset de ajuste ni los hiperparámetros utilizados. Está etiquetado únicamente para inglés (`en`) y su pipeline es `text-generation`, con compatibilidad declarada con text-generation-inference y endpoints.

Su relevancia es limitada en el ecosistema actual: cuenta con 12 descargas y 0 likes en el momento de la consulta, y la documentación publicada es mínima (prácticamente la plantilla por defecto de Unsloth). Resulta útil como ejemplo de flujo de ajuste fino ligero sobre un modelo Llama 3.3 de 8B, pero no dispone de benchmarks ni de una descripción técnica que permita evaluar su calidad frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.3), segun tags y modelo base |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se publican GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del checkpoint `allura-forge/Llama-3.3-8B-Instruct`, que a su vez deriva de la arquitectura Llama 3.3 de Meta en su variante de 8B parámetros. La model card no especifica la composición del dataset de ajuste, el número de tokens de entrenamiento, la longitud de secuencia utilizada ni si se aplicaron técnicas adicionales como DPO o RLHF. Tampoco se documentan innovaciones técnicas propias (decodificación especulativa, atención lineal, etc.).

El único detalle técnico relevante es el stack de entrenamiento: Unsloth y TRL, que según el autor permitieron entrenar "2x más rápido". No se publican curvas de pérdida, hiperparámetros (learning rate, batch size, epochs) ni métricas de evaluación. El tamaño del repositorio (16,1 GB) es coherente con un checkpoint en precisión de 16 bits de un modelo de 8B.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base instruct.
- Razonamiento y respuesta a instrucciones de propósito general (según el modelo base; no verificado en este checkpoint).
- Soporte de tool calling / function calling: no disponible (no documentado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad declarada con text-generation-inference y endpoints de Hugging Face.

## Casos de uso

- Experimentación con ajuste fino ligero: el modelo sirve como referencia de un pipeline SFT con Unsloth y TRL sobre un Llama 3.3 de 8B, útil para replicar el flujo en otros dominios.
- Generación de texto conversacional en inglés en entornos de prototipado, aprovechando la licencia Apache 2.0 y el formato safetensors para despliegue con transformers.
- Evaluación comparativa frente al modelo base `allura-forge/Llama-3.3-8B-Instruct` para medir el efecto del SFT en tareas concretas (requiere construir un conjunto de evaluación propio, ya que no se publican benchmarks).
- Despliegue en endpoints compatibles de Hugging Face o TGI para pruebas de integración en aplicaciones de chat en inglés.
- Base para un segundo ajuste fino (continuar el SFT con datos propios) gracias a la licencia permisiva y al tamaño manejable de 8B.
- Investigación sobre olvido catastrófico y alineación: comparar respuestas del checkpoint SFT con las del modelo base para estudiar derivas de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16 GB solo para pesos, más overhead de KV cache y activaciones (estimación típica de 18-20 GB para secuencias moderadas).
- VRAM estimada en cuantización 8 bits: aproximadamente 8-9 GB; en 4 bits: aproximadamente 5-6 GB (estimaciones estándar para un modelo de 8B; el repo no publica cuantizaciones).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para fp16 con contexto largo; RTX 4090 (24 GB) viable en fp16 para contextos cortos.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en fp16; en GPUs de 8-12 GB requeriría cuantización, que no está publicada en el repo.
- Opciones de despliegue: transformers, text-generation-inference (declarado en tags), endpoints de Hugging Face. No se publican archivos GGUF, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| c4tdr0ut/llama3.3-8b-sft | 8,03B | no disponible | Apache 2.0 | Hugging Face (12 descargas) | SFT con Unsloth/TRL, sin benchmarks |
| allura-forge/Llama-3.3-8B-Instruct (base) | ~8B | no disponible | no disponible | Hugging Face | Modelo de partida del ajuste |
| Llama 3.1 8B Instruct (Meta) | 8,03B | 128K | Llama 3.1 Community License | Hugging Face, ampliamente distribuido | Referencia de la familia; contexto y benchmarks publicados |
| Mistral 7B Instruct | 7,24B | 32K | Apache 2.0 | Hugging Face | Alternativa de tamaño similar con licencia permisiva |

## Limitaciones y advertencias

- Documentación mínima: la model card es la plantilla por defecto de Unsloth; no hay información sobre dataset, hiperparámetros ni evaluación.
- Sin benchmarks publicados: no es posible verificar mejoras respecto al modelo base ni comparar con alternativas de forma objetiva.
- Idioma: etiquetado solo para inglés; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: inherente a los modelos de 8B de la familia Llama; sin evaluación específica en este checkpoint.
- Sesgos: no documentados por el autor; se heredan los del modelo base y los del dataset de SFT (desconocido).
- Licencia Apache 2.0 declarada, pero conviene verificar la licencia del modelo base (`allura-forge/Llama-3.3-8B-Instruct`), ya que los términos de la familia Llama de Meta pueden imponer restricciones adicionales.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ): el despliegue en hardware de consumo requiere conversión manual.
- Trazabilidad baja: 12 descargas y 0 likes; no hay evidencia de uso en producción ni comunidad de validación.
- Contexto no documentado: no se puede asumir la ventana de 128K de Llama 3.1 sin confirmación del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/c4tdr0ut/llama3.3-8b-sft
- Modelo base: https://huggingface.co/allura-forge/Llama-3.3-8B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Documentación de text-generation-inference: https://github.com/huggingface/text-generation-inference

# simaai/Llama-3.1-Swallow-8B-Instruct-v0.5-DFlash-RTN-INT8-Safetensors

## Resumen

Este repositorio contiene un checkpoint borrador ("draft") de decodificación especulativa DFlash, precuantizado a INT8 mediante cuantización round-to-nearest (RTN), para el modelo objetivo Llama-3.1 Swallow 8B Instruct v0.5. Lo publica el usuario simaai y no es un modelo generativo autónomo: es una pieza auxiliar que acelera la inferencia del modelo objetivo prediciendo varios tokens que este luego verifica. Su relevancia reside en que permite desplegar decodificación especulativa con un borrador de apenas 1.048 millones de parámetros (frente a los aproximadamente 8.000 millones del objetivo), reduciendo el coste de memoria del borrador y, potencialmente, la latencia por token generado.

El borrador emplea una arquitectura de cinco capas de estilo Qwen3 que consume estados ocultos intermedios del modelo objetivo en los puntos de extracción `[1, 8, 15, 22, 29]`, con el token de máscara `128002`. La cuantización afecta a las 36 capas lineales del borrador, incluida la capa de fusión de contexto `fc`, mientras que las normas y los sesgos permanecen en BF16. El repositorio ocupa 1,1 GB y no incluye los embeddings ni la cabeza de salida, que los aporta el modelo objetivo.

Es importante subrayar que la model card advierte de que este artefacto no es un modelo de generación de texto independiente ni un paquete compilado de Modalix, y que los resultados de evaluación incluidos corresponden al modelo BF16 de origen, no a la calidad ni al rendimiento medidos en INT8. El modelo objetivo está orientado a japonés e inglés, y la licencia combina los términos upstream de Llama 3.1 y Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Borrador de decodificación especulativa DFlash, 5 capas de estilo Qwen3 con fusión de contexto; consume estados ocultos del modelo objetivo en los taps `[1, 8, 15, 22, 29]` |
| Parametros totales | 1.048.626.432 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 simétrico RTN por canal de salida (observer min/max de llmcompressor); normas y sesgos en BF16 |
| Idiomas soportados | ja, en |
| Licencia | llama-3.1-and-gemma-upstream-terms (other) |
| Formato de pesos | safetensors con compressed-tensors en formato pack-quantized (contenedores INT32 empaquetados, una escala por canal de salida) |

## Arquitectura y entrenamiento

El artefacto es un borrador de decodificación especulativa de cinco capas con arquitectura de estilo Qwen3. En lugar de procesar únicamente tokens de entrada, el borrador se alimenta de estados ocultos extraídos del modelo objetivo en las capas 1, 8, 15, 22 y 29, lo que le permite alinear sus predicciones con la representación interna del modelo grande. La configuración publicada en `config.json` sigue el formato de configuración DFlash compatible con LLiMa, y se conserva además `config.speculators.original.json` con el formato anterior de Speculators.

La cuantización se aplica a las 36 capas lineales del borrador, incluida la capa de fusión de contexto `fc`, mediante RTN simétrico INT8 por canal de salida usando el observer min/max de llmcompressor. No se requiere conjunto de calibración. Los pesos se almacenan con compressed-tensors en formato pack-quantized, con contenedores INT32 y una escala por canal. El repositorio proporciona un script `quantize.py` y `versions.txt` para reproducir los pesos a partir del checkpoint BF16 de origen, junto con `quantization_validation.json`, `quantization_manifest.json` y `artifact_manifest.json` para trazabilidad. No se dispone de información sobre el conjunto de datos de entrenamiento del borrador ni sobre el uso de RLHF o DPO.

## Capacidades

- Predicción especulativa de tokens para acelerar la decodificación del modelo objetivo Llama-3.1 Swallow 8B Instruct v0.5.
- Consumo de estados ocultos intermedios del modelo objetivo en cinco puntos de extracción para condicionar sus predicciones.
- No es un modelo de generación de texto autónomo: carece de embeddings y de cabeza de salida propios.
- No soporta tool calling, function calling ni razonamiento multi-paso por sí mismo; estas capacidades residen en el modelo objetivo.
- Idiomas heredados del modelo objetivo: japonés e inglés.
- No dispone de modo de pensamiento, visión ni audio.

## Casos de uso

- Aceleración de inferencia en producción: el borrador se empareja con el modelo objetivo Swallow 8B para aplicar decodificación especulativa, reduciendo el número de pasos de verificación necesarios para generar una secuencia.
- Despliegue con restricciones de memoria: al ocupar 1,1 GB en INT8, el borrador añade una sobrecarga de memoria pequeña frente al modelo objetivo, lo que facilita su inclusión en servidores con VRAM ajustada.
- Servicio de atención al cliente en japonés e inglés: el modelo objetivo, asistido por este borrador, puede gestionar conversaciones multi-turno en ambos idiomas con menor latencia por token.
- Generación de código asistida: al acelerar la decodificación del objetivo, resulta adecuado para autocompletado y generación de fragmentos de código en entornos interactivos.
- Investigación en decodificación especulativa: sirve como referencia reproducible para estudiar el impacto de la cuantización INT8 RTN en la tasa de aceptación de un borrador DFlash.
- Evaluación de pipelines de cuantización: los manifiestos y scripts incluidos permiten validar recetas de cuantización con compressed-tensors en un caso real de borrador de cinco capas.
- Prototipado de sistemas de inferencia de bajo coste: útil para equipos que quieran medir latencia y throughput de decodificación especulativa antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que `bf16_evaluation_results.json` describe el modelo BF16 de origen y que la calidad de generación y el rendimiento extremo a extremo en INT8 no están establecidos por esos resultados.

## Requisitos de hardware

- VRAM estimada para el borrador: aproximadamente 1,1 GB en INT8, más la memoria de los estados ocultos y buffers de inferencia; el modelo objetivo Swallow 8B requiere su propia VRAM adicional.
- GPU recomendadas: no disponible de forma específica; al tratarse de un borrador pequeño, puede residir junto al objetivo en GPU de centro de datos como A100 o H100.
- Compatibilidad con GPU de consumo: el borrador por sí solo cabe en GPU de consumo, pero el conjunto borrador más objetivo de 8B condiciona el requisito total.
- Opciones de despliegue: no disponible; la model card no documenta integración con vLLM, llama.cpp, Ollama ni TGI, y marca `inference: false`.
- Latencia y throughput: no disponible; no se han publicado mediciones de aceptación ni de rendimiento en INT8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este borrador (DFlash RTN INT8) | 1.048.626.432 | No disponible | llama-3.1-and-gemma-upstream-terms | safetensors compressed-tensors INT8 | Borrador especulativo, no autónomo |
| Llama-3.1-Swallow-8B-Instruct-v0.5-DFlash (BF16) | No disponible | No disponible | No disponible | safetensors BF16 | Modelo base del que deriva este artefacto |
| Llama-3.1-Swallow-8B-Instruct-v0.5-GPTQ | No disponible | No disponible | No disponible | safetensors GPTQ | Modelo objetivo enlazado en la model card |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de generación de texto independiente: requiere el modelo objetivo Swallow 8B y no incluye embeddings ni cabeza de salida.
- La model card advierte de que la calidad de generación y el rendimiento en INT8 no están establecidos; los resultados BF16 no son extrapolables.
- La cuantización RTN sin calibración puede degradar la tasa de aceptación del borrador frente al checkpoint BF16.
- Riesgo de sesgos y alucinaciones heredado del modelo objetivo, no evaluado para este artefacto.
- Idiomas limitados a japonés e inglés según los metadatos; no se documenta cobertura adicional.
- Licencia restrictiva con términos upstream de Llama 3.1 y Gemma; es necesario revisar `LICENSE`, `GEMMA_TERMS_OF_USE.md` y `USE_POLICY.md` antes de un uso comercial.
- El repositorio tiene cero descargas y cero likes, y fue creado recientemente, por lo que carece de validación comunitaria.
- El campo `inference: false` en los metadatos indica que no está preparado para inferencia directa sin el modelo objetivo.

## Enlaces

- [Hugging Face: simaai/Llama-3.1-Swallow-8B-Instruct-v0.5-DFlash-RTN-INT8-Safetensors](https://huggingface.co/simaai/Llama-3.1-Swallow-8B-Instruct-v0.5-DFlash-RTN-INT8-Safetensors)
- [Modelo base BF16: florianvoss/Llama-3.1-Swallow-8B-Instruct-v0.5-DFlash](https://huggingface.co/florianvoss/Llama-3.1-Swallow-8B-Instruct-v0.5-DFlash)
- [Modelo objetivo: simaai/Llama-3.1-Swallow-8B-Instruct-v0.5-GPTQ-Safetensors](https://huggingface.co/simaai/Llama-3.1-Swallow-8B-Instruct-v0.5-GPTQ-Safetensors)

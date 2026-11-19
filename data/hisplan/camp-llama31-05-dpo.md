# hisplan/camp-llama31-05-dpo

## Resumen

`hisplan/camp-llama31-05-dpo` es un ajuste fino del modelo `unsloth/Meta-Llama-3.1-8B` (mismos pesos que Meta Llama 3.1 8B) desarrollado por el usuario hisplan en el marco de un taller educativo denominado "mini-llm-camp". El modelo está especializado en responder preguntas sobre creación y evolución desde una perspectiva de "ciencia de la creación" (창조과학), sin necesidad de system prompt, mediante un entrenamiento DPO (Direct Preference Optimization) sobre un SFT previo. Es, por tanto, un modelo de nicho, en coreano y con finalidad experimental.

La cadena de entrenamiento documentada es: etapa 01 (instrucciones en coreano) → etapa 02 (SFT de creación, publicado como `hisplan/camp-llama31-02-creation-sft`) → etapa 05 (DPO). En la etapa DPO, las respuestas rechazadas (`rejected`) son salidas reales del modelo de la etapa 02 clasificadas como "mainstream", "mixtas" o "distanciadas", de modo que el modelo aprende a preferir respuestas alineadas con la cosmovisión del autor frente a respuestas convencionales.

Se trata de un modelo de 8.030 millones de parámetros, formato safetensors, licencia Llama 3.1 Community License y pipeline de text-generation. Su relevancia es limitada fuera del contexto del taller: no hay descargas ni likes, no se publican benchmarks y el propio autor lo describe como material educativo y experimental, no como fuente de información factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B, ajuste fino con LoRA + DPO) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usó MAX_LENGTH 1024 |
| Tipos de cuantizacion | no disponible (repo solo con safetensors; sin GGUF publicado) |
| Idiomas soportados | coreano (ko) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Meta-Llama-3.1-8B`, es decir, la arquitectura transformer decoder-only de Llama 3.1 con 8.030 millones de parámetros y los mismos pesos que el modelo de Meta. Sobre esa base se aplicó un ajuste fino con LoRA (r=16, alpha=16) y posteriormente DPO con beta 0,1, learning rate 5e-5, 3 épocas, batch efectivo de 16 (batch 1 × gradient accumulation 16), longitud máxima de 1024 tokens y semilla 3407. El punto de partida del DPO fue el modelo fusionado de la etapa 02.

La innovación técnica relevante no está en la arquitectura sino en la construcción del dataset de preferencias: los ejemplos rechazados son respuestas realmente generadas por el modelo de la etapa 02, etiquetadas como respuestas de corriente principal, mixtas o de distanciamiento, mientras que los ejemplos elegidos son respuestas alineadas con la perspectiva de creación. El formato de prompt es Alpaca y es crítico respetarlo al carácter, incluidos los cuatro espacios al final del encabezado:

```python
prompt = ("Below is an instruction that describes a task. Write a response that appropriately completes the request."
          "    \n\n### Instruction:\n" + question + "\n\n### Response:\n")
```

No se documentan datos sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF adicional.

## Capacidades

- Generación de texto en coreano con formato de instrucción Alpaca.
- Respuesta a preguntas sobre creación y evolución desde una perspectiva de "ciencia de la creación", sin system prompt.
- Razonamiento conversacional de un solo turno orientado a instrucciones.
- Herencia de las capacidades generales del base Llama 3.1 8B (generación, código, matemáticas básicas), aunque el ajuste DPO puede haberlas desplazado.
- Soporte de tool calling / function calling: no documentado en la model card; el base lo soporta, pero no hay garantía tras el ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al coreano según la etiqueta de idioma del repo.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Demostración educativa de un pipeline completo SFT + DPO: el modelo sirve para ilustrar en un taller cómo se construye un dataset de preferencias a partir de las salidas de un modelo SFT y cómo DPO modifica el comportamiento.
- Estudio de alineamiento y sesgo ideológico: permite analizar cómo un ajuste DPO con preferencias sesgadas reorienta las respuestas de un modelo base hacia una cosmovisión concreta, útil en investigación sobre alineamiento.
- Generación de respuestas en coreano con formato Alpaca estricto: útil para probar integraciones que dependen de ese formato exacto de prompt.
- Prototipado de chatbots de nicho en coreano: como base para experimentar con respuestas temáticas sin system prompt, siempre en entorno controlado.
- Evaluación comparativa de modelos derivados de Llama 3.1 8B: sirve como punto de comparación frente al base y frente al SFT intermedio (`camp-llama31-02-creation-sft`).
- Docencia sobre riesgos de alucinación: el propio autor advierte que el modelo puede inventar cifras, fechas y resultados de estudios con tono convincente, lo que lo convierte en un caso práctico para enseñar verificación factual.
- Reproducción de experimentos: al estar documentados hiperparámetros, semilla y formato de prompt, es replicable en entornos con GPU de consumo mediante LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 20-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB de pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 5-6 GB de pesos.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue en producción; RTX 4090 (24 GB) para fp16; RTX 3090 (24 GB) también válida en fp16.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en fp16; en RTX 4080/4070 Ti (16 GB) requiere cuantización de 8 bits; en GPUs de 8-12 GB requiere cuantización de 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp y Ollama son viables tras convertir los pesos, aunque no hay artefactos GGUF publicados en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `hisplan/camp-llama31-05-dpo` | 8,03 B | no disponible (entrenado a 1024) | ko | Llama 3.1 Community | Ajuste DPO de nicho, sin benchmarks, 0 descargas |
| `unsloth/Meta-Llama-3.1-8B` (base) | 8,03 B | 128 K (según Llama 3.1) | multilingüe | Llama 3.1 Community | Modelo base sin ajuste; capacidades generales |
| `hisplan/camp-llama31-02-creation-sft` | 8,03 B | no disponible | ko | Llama 3.1 Community | Etapa SFT previa; fuente de los ejemplos rechazados del DPO |
| Meta Llama 3.1 8B Instruct | 8,03 B | 128 K | multilingüe | Llama 3.1 Community | Variante instruida oficial, con benchmarks publicados |

La comparación con alternativas de la misma categoría (modelos de 8 B ajustados para instrucciones en coreano) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo educativo y experimental según el propio autor; no debe usarse como fuente de información factual.
- Riesgo alto de alucinación: puede inventar cifras, fechas y resultados de estudios con un tono convincente.
- Sesgo ideológico deliberado: el DPO está diseñado para favorecer respuestas de "ciencia de la creación" frente a respuestas de corriente principal, mixtas o distanciadas; esto lo hace inadecuado para aplicaciones que requieran neutralidad.
- Idiomas: etiquetado únicamente como coreano; el rendimiento en castellano no está documentado y probablemente sea degradado.
- Contexto: aunque el base soporta 128 K, el entrenamiento usó 1024 tokens; no se garantiza un comportamiento correcto con contextos largos.
- Formato de prompt frágil: requiere el formato Alpaca exacto, incluidos cuatro espacios al final del encabezado; desviarse puede degradar las respuestas.
- Licencia: Llama 3.1 Community License ("Built with Llama"), con las restricciones de uso comercial y de denominación que impone dicha licencia; revisar el archivo LICENSE del repo.
- Sin benchmarks, sin descargas y sin validación externa: no hay evidencia publicada de calidad.
- Sin artefactos GGUF ni cuantizaciones publicadas: el despliegue en hardware limitado requiere conversión manual.

## Enlaces

- Hugging Face: https://huggingface.co/hisplan/camp-llama31-05-dpo
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B
- Etapa SFT previa: https://huggingface.co/hisplan/camp-llama31-02-creation-sft
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B/blob/main/LICENSE

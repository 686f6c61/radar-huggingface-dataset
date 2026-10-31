# flaviodelgrosso/Qwen3.8-Flash-Next-GGUF

## Resumen

Qwen3.8-Flash-Next-GGUF es una cuantización comunitaria del modelo Qwen3.8-Flash-Next, publicado por el usuario flaviodelgrosso en Hugging Face. El modelo base, Qwen/Qwen3.8-Flash-Next, es un modelo de generación de texto de la familia Qwen con aproximadamente 179.551 millones de parámetros totales (dato de safetensors), y esta versión distribuida en formato GGUF está pensada para inferencia local eficiente mediante el runtime Razor del propio autor.

La cuantización, denominada Q4-D6, aplica una estrategia mixta por capas: los expertos enrutados se cuantizan a Q4 (Q4_K en gate/up, MXFP4 en down), mientras que las capas densas se mantienen a unos 6,2 bits por peso (frente a 10,0 en una combinación Q8_0-dense/Q4). Esto reduce la lectura de memoria a 4,62 GB por token frente a 6,70 GB, logrando 68 tok/s en un Apple M5 Max (+31 %) y hasta 96,5 tok/s con decodificación especulativa NextN.

Es relevante ahora porque combina cuantización de precisión mixta con decodificación especulativa (NextN y tabla n-gram BF16 embebida) para hacer viable la ejecución local de un modelo de gran tamaño en hardware de consumo de gama alta, un enfoque cada vez más común en el ecosistema open source de inferencia optimizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next; se deduce arquitectura MoE por la presencia de expertos enrutados y router) |
| Parametros totales | 179.551.050.368 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K (gate/up), MXFP4 (down), Q5_K/Q6_K (GDN capas 0-23), Q4_K (GDN capas 24-47), Q6_K (attention, head, PLE, NextN), BF16 (router, tabla n-gram) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (condiciones de uso comercial aplicables) |
| Formato de pesos | GGUF (cuantizado desde BF16 con imatrix de unsloth) |

## Arquitectura y entrenamiento

El archivo GGUF proviene del modelo base Qwen/Qwen3.8-Flash-Next (commit `de4b8e4d`). Aunque la model card no detalla la arquitectura completa, la terminología empleada (expertos enrutados, router en BF16, capas GDN) indica que se trata de un modelo de mezcla de expertos (MoE) que incorpora capas GDN (Gated DeltaNet), una arquitectura híbrida que combina attention con mecanismos de estado recurrente para mejorar la eficiencia en secuencias largas. La presencia de un head NextN embebido confirma soporte de decodificación especulativa mediante cabezas de predicción multi-token.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no hay datos disponibles en la información proporcionada. La cuantización se realizó en una sola pasada desde BF16 utilizando la matriz de importancia (imatrix) de unsloth (calibración `a5863123…f9254154`), con un mapa de precisión documentado en `qwen4exp.requant.*` que permite reconstruir el archivo de forma byte-idéntica con `razor convert qwen-q4-d6`.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Decodificación especulativa mediante head NextN embebido y tabla n-gram en BF16, con modo `--speculation opportunistic` en Razor.
- Inferencia local eficiente gracias a la cuantización mixta Q4-D6 (4,62 GB/token de lectura frente a 6,70 GB).
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- No hay información sobre tool calling, agentes, capacidades multimodales (visión/audio) ni soporte de thinking mode en la documentación disponible.

## Casos de uso

- Chatbot local de alto rendimiento: el modelo conversacional puede ejecutarse residente en memoria (~69 GiB) en estaciones Apple Silicon para asistentes privados sin depender de APIs externas.
- Generación de texto asistida en escritorio: con 68 tok/s en un M5 Max (y hasta 96,5 tok/s con especulación), la velocidad es suficiente para redacción y edición interactiva de documentos.
- Prototipado de agentes locales: la baja latencia de decodificación permite experimentar con flujos multi-turno, aunque el soporte de tool calling no está documentado para esta cuantización.
- Evaluación de técnicas de cuantización: el mapa de precisión por capas y la documentación en `docs/quantization.md` lo hacen útil como referencia para estudios de trade-off calidad/velocidad en MoE.
- Despliegue en hardware de memoria unificada: con 175 GB de archivo GGUF y ~69 GiB residentes, es adecuado para Mac Studio o portátiles de gama alta con 96-128 GB de memoria unificada.
- Investigación en decodificación especulativa: el head NextN y la tabla n-gram embebidas permiten medir ganancias reales de especulación oportunista en modelos MoE híbridos con GDN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los únicos datos de rendimiento publicados corresponden a velocidad de decodificación en un Apple M5 Max: 68,0 tok/s (+31 % frente a la variante sin optimizar) y 96,5 tok/s con especulación NextN (+10 % adicional), medidos sobre una build anterior con tipos de tensor idénticos.

## Requisitos de hardware

- VRAM/memoria estimada: el archivo GGUF ocupa 175 GB en disco y la ejecución residente requiere aproximadamente 69 GiB de memoria (según la model card, presumiblemente con paginación o mapeo parcial del archivo).
- GPU recomendadas: no disponible. Los datos publicados corresponden a un Apple M5 Max con memoria unificada; no hay cifras para GPUs NVIDIA.
- Consumer GPUs: no cabe en GPUs de consumo convencionales (una RTX 4090 con 24 GB es insuficiente). Es viable en Apple Silicon con 96-128 GB de memoria unificada o en estaciones con memoria comparable.
- Despliegue: runtime Razor del autor (`razor serve --model ... --speculation opportunistic`). No se menciona compatibilidad verificada con llama.cpp, Ollama, vLLM o TGI, aunque el formato GGUF es en principio compatible con el ecosistema llama.cpp.
- Latencia y throughput: 68,0 tok/s de decodificación en M5 Max; 96,5 tok/s con especulación NextN. Lectura de memoria de 4,62 GB/token.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-Flash-Next-GGUF (Q4-D6) | 179.551 M (totales) | GGUF mixto Q4/MXFP4/Q6 | Qwen Community License 1.0 | Cuantización comunitaria, optimizada para Razor con especulación NextN |
| Qwen/Qwen3.8-Flash-Next (base) | 179.551 M | BF16 (safetensors) | Qwen Community License 1.0 | Pesos originales sin cuantizar, mayor consumo de memoria |
| Modelos Qwen MoE de tamaño comparable con GGUF comunitario | no disponible | GGUF | variable | no disponible |

No hay datos suficientes para una comparativa de rendimiento con alternativas concretas; no disponible.

## Limitaciones y advertencias

- Licencia Qwen Community License 1.0: el uso comercial está sujeto a condiciones específicas detalladas en el archivo LICENSE; conviene revisarlas antes de desplegar en producción.
- Riesgo de alucinación: inherente a modelos de lenguaje de gran tamaño; no hay datos de evaluación publicados para esta cuantización.
- La cuantización agresiva (Q4 en expertos, MXFP4 en down) puede degradar la calidad respecto a los pesos BF16 originales; no se han publicado evaluaciones que cuantifiquen esa degradación.
- Longitud de contexto, idiomas soportados y capacidades (tool calling, multimodalidad) no documentados en la model card.
- Requisitos de memoria elevados (~69 GiB residentes, 175 GB en disco) que limitan el despliegue a hardware de gama alta.
- El rendimiento publicado (68-96,5 tok/s) está medido en un M5 Max con una build anterior; los resultados en otro hardware pueden diferir.
- La descarga tiene pocas descargas (2.923) y cero likes, por lo que el soporte comunitario y la validación por terceros son limitados.

## Enlaces

- Modelo cuantizado: https://huggingface.co/flaviodelgrosso/Qwen3.8-Flash-Next-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio Razor: https://github.com/flaviodelgrosso/razor
- Documentación de cuantización: https://github.com/flaviodelgrosso/razor/blob/main/docs/quantization.md
- Licencia: disponible en el archivo LICENSE del repositorio del modelo

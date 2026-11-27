# Eureka-COM/MistralMosaic-24B-v2-8bit

## Resumen

MistralMosaic-24B-v2-8bit es una versión cuantizada a 8 bits del modelo MistralMosaic-24B-v2, desarrollada por Eureka-COM. Se trata de una cuantización mediante bitsandbytes con la técnica LLM.int8 (`load_in_8bit`), pensada para reducir el consumo de memoria del modelo base sin requerir un reentrenamiento. El modelo base pertenece a la familia MistralMosaic, una línea de investigación construida sobre arquitectura Mistral con un mecanismo propietario denominado "memory-mosaics", que requiere cargar el código personalizado del repositorio (`trust_remote_code=True`).

El modelo cuenta con 31.145.308.800 parámetros reales según los pesos en safetensors, aunque el nombre comercial lo etiqueta como "24B". Esta discrepancia entre el nombre y el recuento real de parámetros es relevante a la hora de planificar el despliegue. El repositorio ocupa 32,5 GB en formato safetensors, frente a los 62,3 GB de la versión bf16, lo que supone una reducción de aproximadamente el 48% en el espacio en disco y de los 63,0 GB a los 33,2 GB de pesos en GPU.

La relevancia de esta ficha radica en que documenta una cuantización de investigación con métricas explícitas de degradación: una pérdida adicional de +0,0090 por token y un 95,9% de coincidencia en el token top-1 respecto al modelo bf16, medidas sobre 8 artículos de Wikipedia (4 en inglés y 4 en japonés, de 4.096 tokens cada uno). El modelo está orientado a investigación y soporta únicamente inglés y japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Mistral con mecanismo "memory-mosaics" (código personalizado) |
| Parametros totales | 31.145.308.800 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8 bits mediante bitsandbytes (LLM.int8, `load_in_8bit`) |
| Idiomas soportados | Inglés (en), japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (32,5 GB en repositorio) |

## Arquitectura y entrenamiento

El modelo es una cuantización del base MistralMosaic-24B-v2, que emplea una arquitectura transformer derivada de Mistral con una innovación denominada "memory-mosaics" (etiqueta `memory-mosaics` en el repositorio). Esta arquitectura requiere cargar código personalizado mediante `trust_remote_code=True`, lo que implica ejecutar código del autor del modelo. La model card no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron fases de RLHF o DPO; esa información se remite a la página del modelo base.

La cuantización se realizó con bitsandbytes (compilado con la versión 0.50.2) aplicando LLM.int8, una técnica de cuantización de precisión mixta que mantiene en 8 bits la mayoría de las operaciones pero preserva en mayor precisión los valores atípicos. No se describe ningún proceso de calibración adicional más allá de la propia técnica LLM.int8. Tras guardar el modelo, se recargó desde los ficheros guardados y se verificó que producía los mismos logits, lo que confirma la reproducibilidad de la conversión.

## Capacidades

- Generación de texto autoregresiva en inglés y japonés.
- Razonamiento y generación de contenido textual (capacidades heredadas del modelo base, no detalladas en la model card de la versión cuantizada).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a inglés y japonés según la etiqueta de idiomas.
- Modo thinking, visión o audio: no disponible en la información proporcionada.
- Inferencia determinista mediante `do_sample=False` en el ejemplo de uso proporcionado.

## Casos de uso

- Investigación sobre cuantización: el modelo sirve como caso de estudio reproducible para medir la degradación de LLM.int8 en un transformer con código personalizado, con métricas explícitas de pérdida (+0,0090) y acuerdo top-1 (95,9%) frente a bf16.
- Generación de texto en inglés y japonés en entornos con VRAM limitada: al reducir los pesos en GPU de 63,0 GB a 33,2 GB, permite ejecutar el modelo en GPUs de 40 GB o en configuraciones multi-GPU más modestas que las requeridas por la versión bf16.
- Evaluación comparativa de pipelines de inferencia: útil para contrastar el rendimiento de bitsandbytes frente a otras técnicas de cuantización sobre la misma arquitectura base.
- Prototipado de aplicaciones de generación de texto en japonés: el modelo declara soporte de este idioma y las métricas de la model card incluyen artículos en japonés, lo que permite validar la calidad en ese idioma antes de invertir en el modelo bf16.
- Reproducción de experimentos académicos: la verificación de que los logits se mantienen tras recargar desde disco facilita la replicabilidad de resultados en publicaciones.
- Despliegue de bajo presupuesto en investigación: con 33,2 GB de pesos en GPU, puede alojarse en una única A100 de 40 GB, algo inviable con la versión bf16 de 63,0 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente proporciona métricas comparativas entre la versión bf16 y la cuantizada:

| Metrica | bf16 (MistralMosaic-24B-v2) | Este modelo (8bit) |
|---|---|---|
| Pesos en GPU | 63,0 GB | 33,2 GB |
| Ficheros safetensors | 62,3 GB | 32,5 GB |
| Pérdida por token (cambio desde bf16) | — | +0,0090 |
| Mismo token top-1 que bf16 | — | 95,9% |
| Velocidad de generación (A100, tokens/s) | 1,51 | 0,86 |

Las métricas de pérdida y acuerdo top-1 se midieron sobre 8 artículos de Wikipedia (4 en inglés, 4 en japonés, 4.096 tokens cada uno). La velocidad de generación en A100 cae de 1,51 a 0,86 tokens/s, lo que supone una reducción de aproximadamente el 43% en throughput pese a la menor huella de memoria.

## Requisitos de hardware

- VRAM estimada para inferencia: 33,2 GB de pesos en GPU según la model card, más memoria adicional para el contexto y las activaciones (no cuantificada en la información disponible).
- GPU recomendadas: A100 (40 GB o 80 GB) según las mediciones de velocidad proporcionadas; el modelo cabe en una A100 de 40 GB, a diferencia de la versión bf16 (63,0 GB).
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada; con 33,2 GB de pesos, quedaría fuera de GPUs de consumo de 24 GB como la RTX 4090 sin técnicas adicionales de offloading.
- Opciones de despliegue: transformers con bitsandbytes (0.50.2) y CUDA; requiere `trust_remote_code=True`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 0,86 tokens/s en A100 según la model card.
- Requisito adicional: GPU CUDA y la dependencia bitsandbytes; no debe pasarse `fix_mistral_regex` (indicación explícita de la model card).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MistralMosaic-24B-v2-8bit (este) | 31.145.308.800 | No disponible | 8 bits (bitsandbytes) | Apache-2.0 | Hugging Face |
| MistralMosaic-24B-v2 (base) | No disponible (nombre comercial 24B) | No disponible | bf16 | Apache-2.0 | Hugging Face |
| Otras alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de terceros en la documentación proporcionada; la única comparación posible es con el modelo base bf16, del que se conocen los datos de memoria y velocidad recogidos en la tabla de benchmarks.

## Limitaciones y advertencias

- Degradación de calidad por cuantización: pérdida adicional de +0,0090 por token y solo un 95,9% de coincidencia en el token top-1 respecto a bf16, lo que implica que aproximadamente 1 de cada 24 tokens generados difiere del modelo original.
- Caída de rendimiento: la velocidad de generación baja de 1,51 a 0,86 tokens/s en A100, lo que puede ser limitante en aplicaciones interactivas.
- Cobertura lingüística restringida: solo inglés y japonés; no se declara soporte de castellano ni de otros idiomas.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican los riesgos del modelo base, no documentados en esta ficha.
- Ejecución de código personalizado: requiere `trust_remote_code=True`, lo que implica confiar en el código del autor del modelo; conviene auditar el repositorio antes de usarlo en producción.
- Dependencia estricta de bitsandbytes 0.50.2 y CUDA; no se documentan alternativas de despliegue (GGUF, vLLM, etc.).
- Restricción de uso: no debe pasarse `fix_mistral_regex`, según la model card.
- Licencia Apache-2.0: permite uso comercial, pero el modelo está etiquetado como "research" y su rendimiento no está validado con benchmarks estándar, por lo que no se recomienda para producción sin evaluación propia.
- Contexto máximo no documentado: impide planificar aplicaciones que dependan de ventanas largas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Eureka-COM/MistralMosaic-24B-v2-8bit
- Modelo base: https://huggingface.co/Eureka-COM/MistralMosaic-24B-v2
- README en japonés: README_ja.md (referenciado en la model card del repositorio)
- Fichero de evidencias: `evidence.json` (incluido en el repositorio, según la model card)
- Licencia: `LICENSE` y `NOTICE` (incluidos en el repositorio)

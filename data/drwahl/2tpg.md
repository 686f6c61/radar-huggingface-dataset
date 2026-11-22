# drwahl/2tpg

## Resumen

2-TPG es un ajuste fino de GPT-2 (117M parámetros) desarrollado por Daniel Wahl que invierte el objetivo estándar de modelado de lenguaje: en lugar de predecir el siguiente token, predice el token anterior. Para ello, el autor tomó muestras de la distribución de salida típica de GPT-2, invirtió las secuencias de tokens y ajustó el modelo sobre ellas, de modo que aprende a "pensar hacia atrás". El resultado es un modelo que, dada una secuencia final, genera el texto que podría haberla precedido.

El modelo no busca competir en capacidades generales de generación: es una herramienta de investigación para estudiar dependencias bidireccionales en modelos de lenguaje y para explorar la relación causa-efecto en texto. Su perplexity en predicción inversa es de 14,04, frente a 284,11 de GPT-2 estándar en esa misma tarea, lo que supone una mejora de aproximadamente 20 veces; a cambio, su rendimiento en predicción directa se degrada hasta 705,52.

Se distribuye con licencia MIT, en formato safetensors, con un tamaño de repositorio de 0,5 GB y 124.439.808 parámetros. Es relevante ahora como pieza didáctica y experimental dentro del ecosistema open source, no como modelo de producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), ajustado para predicción inversa de tokens |
| Parametros totales | 124.439.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de GPT-2; el autor no la especifica) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; admite las cuantizaciones estándar de transformers/llama.cpp, no documentadas por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 estándar: un transformer decoder-only con atención causal, tokenizador byte-level BPE y 117M parámetros (124,4M contando embeddings y cabezas según el recuento de safetensors). La innovación no está en la arquitectura sino en el objetivo de entrenamiento: se generaron muestras de texto a partir de la distribución de salida típica de GPT-2 (GPT-2 output dataset), se tokenizaron con el BPE de GPT-2, se invirtió el orden de la secuencia de tokens y se ajustó el modelo con el objetivo estándar de modelado de lenguaje sobre esas secuencias invertidas. En inferencia, el prompt se invierte antes de pasarlo al modelo y la salida generada se vuelve a invertir para obtener texto en orden natural.

El autor no documenta el número exacto de tokens de entrenamiento, la composición detallada del dataset, ni si hubo fases de RLHF o DPO; el procedimiento descrito es exclusivamente ajuste fino supervisado con objetivo de modelado de lenguaje. La evaluación se realizó sobre un conjunto de validación de 5.000 ejemplos, comparando perplexity en dirección directa e inversa frente a GPT-2 base.

## Capacidades

- Generación de texto inversa: dado un final o una secuencia objetivo, genera texto que podría precederlo.
- Exploración de relaciones causa-efecto en texto: permite generar "causas" plausibles para un "efecto" dado.
- Sonda de dependencias bidireccionales: útil para investigar cómo un modelo de lenguaje representa el contexto hacia atrás.
- Generación de texto en inglés con muestreo configurable (temperature, top_k, top_p).
- No dispone de tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Capacidades multilingües limitadas al inglés, idioma de entrenamiento.
- No incluye modo thinking, visión ni audio.

## Casos de uso

- Investigación sobre modelado bidireccional: permite comparar la perplexity inversa de un modelo ajustado frente a la de un modelo estándar y estudiar qué información direccional captura un transformer causal.
- Generación de preludios narrativos: dado un cierre ("And they lived happily ever after"), el modelo produce aperturas plausibles, útil en ejercicios creativos y talleres de escritura.
- Análisis de causas en texto: para un resultado descrito en un corpus, el modelo genera contextos previos hipotéticos que pueden servir como hipótesis en análisis exploratorio de datos textuales.
- Docencia y divulgación: ejemplo mínimo y reproducible (117M parámetros, 0,5 GB) para explicar objetivo de entrenamiento, tokenización y perplexity en cursos de NLP.
- Experimentos de interpretabilidad: comparar representaciones internas de GPT-2 y 2-TPG para estudiar si la dirección de predicción altera el espacio latente.
- Pruebas de estrés de pipelines de generación: al tener un comportamiento degradado en dirección directa (perplexity 705,52), sirve como caso de control negativo en evaluaciones de modelos.
- Reproducción de experimentos: el código de entrenamiento, evaluación e inferencia está publicado en el repositorio del autor, lo que facilita replicar el ajuste con otros modelos base.

## Benchmarks y rendimiento

| Modelo | Dirección | Perplexity |
|---|---|---|
| 2-TPG | Inversa | 14,04 |
| 2-TPG | Directa | 705,52 |
| GPT-2 | Inversa | 284,11 |
| GPT-2 | Directa | 9,05 |

Evaluación sobre un conjunto de validación de 5.000 ejemplos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos; en fp16 alrededor de 0,25 GB; en cuantización de 8 bits en torno a 0,13 GB. El consumo real de memoria incluye activaciones y caché KV, por lo que en la práctica conviene reservar al menos 1-2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; cabe en RTX 3060, RTX 4060, RTX 4090 y en GPUs de datacenter como A100 o H100 sin aprovechar su capacidad.
- Cabe en GPU consumer y también en CPU para inferencia interactiva, dado el reducido tamaño.
- Opciones de despliegue: transformers (referencia del autor), llama.cpp y Ollama mediante conversión a GGUF, y servidores compatibles con la API de transformers como TGI o vLLM (no verificados por el autor para este modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 2-TPG | 124,4M | no disponible | Predicción del token anterior | MIT | Hugging Face |
| GPT-2 (openai-community/gpt2) | 124M | 1024 tokens (estándar de GPT-2) | Predicción del siguiente token | MIT | Hugging Face |
| GPT-2 medium | 355M | 1024 tokens (estándar de GPT-2) | Predicción del siguiente token | MIT | Hugging Face |
| DistilGPT-2 | 82M | 1024 tokens (estándar de GPT-2) | Predicción del siguiente token (destilado) | Apache 2.0 | Hugging Face |

La comparación relevante no es de rendimiento general sino de objetivo: 2-TPG es el único de la lista entrenado para predecir hacia atrás. Frente a GPT-2, mejora unas 20 veces la perplexity inversa (14,04 frente a 284,11) y empeora drásticamente la directa (705,52 frente a 9,05). No se dispone de comparación con otros modelos de predicción inversa en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en predicción inversa y su rendimiento en generación directa es muy deficiente (perplexity 705,52), por lo que no debe usarse como modelo de generación convencional.
- Entrenado únicamente en inglés; no se garantiza un comportamiento correcto en otros idiomas.
- Puede reproducir sesgos presentes en la distribución de salida de GPT-2 y en el corpus original, incluyendo sesgos de género, raza y estereotipos.
- Riesgo de alucinación alto: al generar texto que "precede" a una secuencia, el contenido producido es plausible pero no verificado ni anclado a hechos.
- El uso requiere invertir manualmente los tokens de entrada y de salida; un manejo incorrecto produce resultados sin sentido.
- La longitud de contexto efectiva no está documentada por el autor; se hereda la de GPT-2 y no se ha validado para secuencias largas.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías y recomienda tratar las salidas como experimentales.
- No apto para producción en tareas de atención al cliente, generación de código o agentes sin una validación adicional exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drwahl/2tpg
- Repositorio de código (entrenamiento, evaluación e inferencia): https://github.com/danwahl/2tpg
- Dataset de salida de GPT-2: https://github.com/openai/gpt-2-output-dataset
- DOI del modelo en Hugging Face: https://doi.org/10.57967/hf/10747
- DOI del artículo (Zenodo): https://doi.org/10.5281/zenodo.23133039
- Modelo base: https://huggingface.co/openai-community/gpt2

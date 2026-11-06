# kaitchup/LFM3-1.7B-SLQ-GGUF

## Resumen

LFM3-1.7B-SLQ-GGUF es una cuantización del modelo LiquidAI/LFM3-1.7B, desarrollado por Liquid AI y comprimido por el autor independiente kaitchup (The Kaitchup). Se trata de un artefacto de pesos en formato GGUF pensado para inferencia con llama.cpp, generado mediante una versión personalizada de SLQ (Statistically-Lossless Quantization), una técnica de cuantización de precisión mixta que selecciona el formato de cada matriz de forma individual para maximizar la fidelidad estadística respecto al modelo original en BF16.

El problema que resuelve es el de reducir el peso del modelo (1.728.801.600 parámetros) hasta aproximadamente 1.588 GB sin degradar de forma apreciable la distribución de probabilidad del siguiente token. Para ello, el autor combina pesos ya cuantizados de dos repositorios donantes (LiquidAI y AtomicChat) y elige, matriz a matriz, la fuente más adecuada entre 154 matrices completas, incluyendo los embeddings compartidos y la cabeza de salida. El resultado es un único archivo con una fidelidad medida (EAR@10) del 97,738262 %, ligeramente superior al 97,5171 % del AD-Q6_K de AtomicChat con un tamaño prácticamente idéntico.

Es relevante ahora porque demuestra una vía práctica de reutilización de cuantizaciones existentes para obtener artefactos de mayor fidelidad sin reentrenar ni recalcular desde cero, y porque permite ejecutar un modelo de la familia LFM3 en hardware de consumo. No obstante, conviene subrayar que el propio autor advierte de que la métrica EAR mide solapamiento de distribuciones, no equivalencia en benchmarks ni respuestas idénticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3 de Liquid AI; arquitectura no detallada en la información proporcionada) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa --ctx-size 8192, pero no se confirma como contexto nativo) |
| Tipos de cuantizacion | SLQ de precisión mixta personalizada; etiqueta de familia dominante Q6_K; embeddings y cabeza de salida compartidos en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (etiquetada como "other" en el Hub) |
| Formato de pesos | GGUF (un único archivo, 287 tensores de texto; sin tensores MTP, de visión ni proyector multimodal) |

## Arquitectura y entrenamiento

Este repositorio no entrena ningún modelo: es una cuantización del modelo base LiquidAI/LFM3-1.7B. La información proporcionada no detalla la arquitectura interna del modelo original (tipo de transformer, mecanismos de atención, composición del dataset de entrenamiento, número de tokens ni si hubo RLHF o DPO). Lo que sí se documenta es el proceso de compresión: una búsqueda SLQ que combina pesos cuantizados de múltiples donantes (Q4_K_M, Q5_K_M, Q6_K, Q8_0, QAD-Q4_0 y BF16 de LiquidAI; AD-IQ3_S, AD-IQ4_XS, AD-Q4_K_M, AD-Q5_K_M, AD-Q6_K y Q8_0 de AtomicChat) y selecciona una fuente por separado para cada una de las 154 matrices completas, incluyendo embeddings compartidos y cabeza de salida.

La innovación técnica es la asignación de precisión por capa guiada por SLQ, cuyo objetivo es la fidelidad estadística (aproximada) más que la identidad numérica. El archivo resultante tiene 287 tensores de texto, embeddings y head compartidos en Q8_0, y un tamaño completo de 1.588 GB (1,579 GB de pesos de texto activos, excluyendo metadatos y alineación). La evaluación se realizó con 512 secuencias de longitud 2.048 tokens y referencia en BF16; el corpus de calibración guió también la selección del modelo, por lo que las cifras son fidelidad de calibración, no un benchmark independiente en held-out.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el artefacto se sirve mediante una API compatible con OpenAI (chat completions).
- Razonamiento y respuesta a preguntas de conocimiento general: el ejemplo de la model card plantea una consulta factual ("Is Earth smaller than Venus?").
- Despliegue local con llama.cpp: compatible con llama-server y con la arquitectura LFM3 (requiere una build de llama.cpp con soporte para dicha arquitectura).
- Inferencia con contexto configurable: el ejemplo de servidor usa 8.192 tokens de ventana, aunque el máximo nativo no se documenta.
- Capacidades multimodales: no incluidas; el archivo no contiene tensores de visión ni proyector multimodal.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local: servir el GGUF con llama-server y exponer una API compatible con OpenAI permite integrarlo en interfaces de chat o prototipos sin depender de la nube, con un archivo de 1.588 GB que cabe en equipos de consumo.
- Respuesta a preguntas factuales en aplicaciones de escritorio: el modelo puede atender consultas de conocimiento general (como el ejemplo de la model card) en herramientas de productividad offline, donde la latencia de red no es aceptable.
- Prototipado rápido de aplicaciones de texto: al ser un único archivo GGUF con descarga directa vía huggingface_hub, se puede incorporar en entornos de desarrollo y demos internas en minutos.
- Evaluación de técnicas de cuantización: investigadores que comparan SLQ frente a cuantizaciones estándar (Q6_K, Q8_0, IQ) pueden usar este artefacto como referencia de fidelidad medida con EAR@10 sobre el mismo corpus de calibración.
- Despliegue en hardware limitado: con 1,579 GB de pesos de texto activos, es apto para estaciones de trabajo con GPU de gama media o incluso inferencia parcial en CPU, según el número de capas offloaded con --n-gpu-layers.
- Integración en pipelines de generación de texto por lotes: la API compatible con OpenAI permite sustituir un endpoint remoto por uno local en scripts de procesamiento de documentos, siempre que el caso no exija garantías de calidad verificadas en benchmarks.
- Base para experimentos de decodificación especulativa: la métrica EAR@10 (tasa de aceptación esperada) está directamente relacionada con el rendimiento de draft models en decodificación especulativa, por lo que este artefacto puede servir como candidato en ese tipo de configuraciones.

## Benchmarks y rendimiento

| Metrica | LFM3-1.7B-SLQ-EAR97.7-Q6_K | AtomicChat AD-Q6_K |
|---|---|---|
| EAR@10 (vs. BF16, 512 secuencias × 2.048 tokens) | 97,738262 % | 97,5171 % |
| Diferencia | +0,2212 puntos porcentuales | referencia |
| Tamano del archivo GGUF | ~1,588 GB | ~1,588 GB |
| Pesos de texto activos | 1,579 GB | no disponible |

No se han publicado resultados de benchmarks de tareas downstream (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que la equivalencia estadística en tareas downstream no se ha establecido para esta release.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB solo para los pesos; con overhead de contexto (8.192 tokens) y caché KV, el consumo real será superior, aunque no se proporcionan cifras medidas.
- GPU recomendadas: el autor realizó la evaluación nativa de scoring de texto con una NVIDIA GeForce RTX 3060, lo que confirma su viabilidad en GPU de gama media.
- Compatibilidad con GPU de consumo: sí; por tamaño, cabe en tarjetas con 4-6 GB de VRAM o más, aunque la cifra exacta depende de la ventana de contexto y del backend.
- Opciones de despliegue: llama.cpp (llama-server con soporte de arquitectura LFM3; se cita el commit 2973c945bf32759976d858a3a35ae0e026b4507d como referencia de validación). No se documentan otras opciones como vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Fidelidad medida | Licencia |
|---|---|---|---|---|---|
| LFM3-1.7B-SLQ-EAR97.7-Q6_K (este) | 1.728.801.600 | no disponible | GGUF, ~1,588 GB | EAR@10 97,738262 % | LFM Open License v1.0 |
| AtomicChat LFM3-1.7B AD-Q6_K | 1.728.801.600 (mismo base) | no disponible | GGUF, ~1,588 GB | EAR@10 97,5171 % | LFM Open License v1.0 |
| LiquidAI LFM3-1.7B (BF16) | 1.728.801.600 | no disponible | BF16 (referencia) | referencia | LFM Open License v1.0 |
| LiquidAI LFM3-1.7B-GGUF (Q6_K, Q8_0, etc.) | 1.728.801.600 | no disponible | GGUF, varios tamanos | no disponible | LFM Open License v1.0 |

La comparación se limita a variantes del mismo modelo base, ya que la información proporcionada no incluye datos de modelos alternativos de otros desarrolladores. No se dispone de cifras de rendimiento en tareas downstream para ninguno de ellos.

## Limitaciones y advertencias

- La métrica EAR@10 mide solapamiento de distribuciones de probabilidad sobre el top-10 del modelo de referencia; no equivale a precisión en benchmarks ni a respuestas generadas idénticas.
- El mismo corpus de calibración guió la selección del modelo y la medición de fidelidad, por lo que los valores son de calibración y no de un conjunto held-out independiente.
- No se ha establecido equivalencia estadística en tareas downstream para esta release.
- El sufijo Q6_K del nombre es una etiqueta de compatibilidad con el Hub y de familia de precisión dominante; no describe una cuantización Q6_K estándar, sino una asignación SLQ personalizada.
- El archivo no incluye tensores MTP, de visión ni proyector multimodal, por lo que no puede usarse para tareas multimodales.
- Requiere una build de llama.cpp con soporte para la arquitectura LFM3; versiones sin ese soporte no cargarán el modelo.
- No se declaran idiomas soportados ni sesgos conocidos en la información proporcionada; el riesgo de alucinación no está cuantificado.
- Licencia LFM Open License v1.0: es necesario revisar el archivo LICENSE incluido antes de cualquier uso comercial, ya que las condiciones concretas no se detallan en la información disponible.
- El repositorio tiene 124 descargas y 0 likes, lo que indica una validación comunitaria muy limitada.
- Los derechos de autor y atribución del modelo base y de los donantes de cuantización permanecen con sus autores originales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kaitchup/LFM3-1.7B-SLQ-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- GGUF oficiales del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- GGUF donantes de AtomicChat: https://huggingface.co/AtomicChat/LFM3-1.7B-GGUF
- Paper de SLQ: https://arxiv.org/abs/2605.02404
- Repositorio de SLQ (IST-DASLab): https://github.com/IST-DASLab/SLQ
- Newsletter del autor: https://kaitchup.substack.com/subscribe
- Apoyo al autor: https://buymeacoffee.com/kaitchup

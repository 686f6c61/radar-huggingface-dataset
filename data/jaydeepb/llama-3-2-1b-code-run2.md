# jaydeepb/llama-3.2-1b-code-run2

## Resumen

`jaydeepb/llama-3.2-1b-code-run2` es un artefacto de investigación publicado en HuggingFace por el usuario jaydeepb. Se trata de un ajuste fino (fine-tuning) de `meta-llama/Llama-3.2-1B` realizado durante una época sobre una muestra de un millón de secuencias de **The Stack**, un corpus masivo de código fuente abierto. El modelo no está pensado para uso productivo, sino como parte del trabajo *Predicting Memorization Before Fine-Tuning Language Models*, donde actúa como la segunda ejecución de fine-tuning ("Run 2") reservada para evaluación.

El propósito del modelo es estudiar la memorización literal: los clasificadores entrenados en el paper citado predicen, a partir de características del modelo base antes del fine-tuning, qué secuencias de entrenamiento este modelo memorizará de forma verbatim. Por tanto, el valor del artefacto reside en la reproducibilidad de esos experimentos, no en sus capacidades generales.

Es relevante para investigadores en privacidad de LLMs, extracción de datos de entrenamiento y gobernanza de modelos, ya que permite auditar empíricamente cómo un modelo pequeño (1.24 mil millones de parámetros, arquitectura Llama, safetensors) memoriza datos de código tras un fine-tuning breve. No es un modelo de código de propósito general ni una alternativa a Code Llama o StarCoder.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder, basado en meta-llama/Llama-3.2-1B) |
| Parámetros totales | 1.235.814.400 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la de Llama-3.2-1B, 128k según la documentación de Meta) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (datos de fine-tuning en código; inglés predominante en comentarios y documentación) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (tamaño del repo: 2,5 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.2-1B de Meta: un transformer decoder autorregresivo con las optimizaciones habituales de la familia Llama (RoPE, SwiGLU, RMSNorm). El modelo base no ha sido modificado estructuralmente; solo se han actualizado los pesos mediante fine-tuning.

El entrenamiento consistió en una época de fine-tuning sobre una muestra de 1 millón de secuencias extraídas de **The Stack**, un corpus de código fuente con licencias permisivas recopilado por BigCode. No se ha publicado información sobre el optimizador, la tasa de aprendizaje, el tamaño de batch ni el hardware empleado. Tampoco consta el uso de RLHF, DPO ni alineación de instrucciones: se trata de un fine-tuning de continuación de texto sobre código, no de un modelo instructo.

La innovación técnica no reside en el modelo en sí, sino en el marco experimental del paper asociado: usar características del modelo base (previas al fine-tuning) para predecir qué secuencias serán memorizadas verbatim, con este artefacto como ejecución de evaluación independiente.

## Capacidades

- Generación de texto en formato de pipeline `text-generation`, con fuerte sesgo hacia la continuación de código fuente tras el fine-tuning.
- Completado de código en los lenguajes presentes en The Stack (el subconjunto exacto usado no está especificado).
- Memorización (de forma deliberada, no como defecto): puede reproducir porciones de sus datos de fine-tuning de forma literal, que es precisamente el fenómeno estudiado.
- No es un modelo instructo: no ha sido entrenado con RLHF, DPO ni datos de instrucciones.
- Sin capacidades multimodales, sin tool calling y sin soporte documentado de agentes.
- Capacidades multilingües: no disponibles.

## Casos de uso

- **Investigación en memorización de LLMs**: reproducir o extender los experimentos del paper *Predicting Memorization Before Fine-Tuning Language Models*, extrayendo secuencias verbatim del modelo y contrastándolas con las predicciones de los clasificadores.
- **Auditoría de privacidad y extracción de datos**: usar el modelo como banco de pruebas para técnicas de membership inference o canary extraction en modelos de código pequeños.
- **Estudio de efectos del fine-tuning sobre código**: comparar el comportamiento del modelo base y el fine-tuned para cuantificar cómo una época sobre código altera las distribuciones de salida.
- **Benchmark de métodos de mitigación**: evaluar técnicas de desmemorización (unlearning, deduplicación, regularización) usando este artefacto como punto de partida conocido.
- **Docencia y formación**: material práctico para cursos sobre riesgos de datos de entrenamiento en LLMs, dado su tamaño reducido (cabe en hardware de consumo).
- **Análisis de licencias y trazabilidad de datos**: estudiar qué fragmentos de The Stack (código con licencias permisivas) son reproducibles literalmente y con qué frecuencia.
- **No recomendado**: asistencia general de código, chatbots o producción; para ello existen alternativas instructas y alineadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un artefacto de investigación sobre memorización, no se han reportado métricas tipo MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 2,5 GB en FP16/BF16 (coincide con el tamaño del repo); en 8 bits, en torno a 1,3 GB; en 4 bits, unos 0,8 GB.
- **GPU recomendadas**: cualquier GPU de consumo con 4 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090); no se requiere hardware de centro de datos (A100/H100) para inferencia.
- **Consumer GPU**: sí, cabe con holgura en la mayoría de GPUs domésticas modernas; incluso es ejecutable en CPU con razonable rendimiento dado su tamaño.
- **Despliegue**: compatible con la librería `transformers` de HuggingFace (formato safetensors); en principio también con vLLM, llama.cpp (previa conversión a GGUF, no publicada) y Ollama (previa cuantización), aunque el autor no publica variantes cuantizadas ni configuraciones de despliegue.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Finalidad |
|---|---|---|---|---|
| jaydeepb/llama-3.2-1b-code-run2 | 1,24 B | no disponible (128k heredado) | llama3.2 | Artefacto de investigación sobre memorización |
| meta-llama/Llama-3.2-1B (base) | 1,24 B | 128k | llama3.2 | Modelo base de propósito general |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128k | llama3.2 | Asistente instructo alineado |

Las alternativas de la familia Llama-3.2-1B comparten arquitectura y licencia, pero difieren en propósito: el modelo base sirve para investigación general y el instructo para aplicaciones, mientras que esta variante está especializada (y sesgada deliberadamente) hacia la memorización de código de The Stack. Para generación de código productiva en tamaño similar, modelos como Qwen2.5-Coder-1.5B o StarCoder2-3B serían opciones más adecuadas, aunque no se dispone de benchmarks comparativos publicados para este artefacto.

## Limitaciones y advertencias

- **Reproducción verbatim de datos de entrenamiento**: la model card advierte explícitamente de que el modelo puede reproducir porciones de The Stack de forma literal. No debe usarse si existe riesgo de fuga de contenido con restricciones de licencia o atribución.
- **Sin alineación**: no ha pasado por RLHF ni DPO; puede generar contenido ofensivo, erróneo o inseguro sin filtros.
- **Riesgo de alucinación**: alto, como en cualquier modelo pequeño no alineado; además, su fine-tuning sobre código puede inducir la reproducción de código con vulnerabilidades presentes en The Stack.
- **Sesgo del corpus**: hereda los sesgos y la calidad heterogénea de The Stack (código de repositorios públicos, con comentarios mayoritariamente en inglés).
- **Idioma**: sin soporte documentado de idiomas; el rendimiento fuera de inglés y de código fuente no está evaluado.
- **Licencia**: sujeto a la Llama 3.2 Community License de Meta, que impone condiciones de uso (incluida la política de marca y restricciones para ciertos casos de uso a gran escala); revisar la licencia antes de cualquier despliegue.
- **Alcance limitado**: es un artefacto de reproducibilidad de un paper; usarlo como modelo de código de propósito general sería un error de diseño.
- **Descargas y adopción mínimas** (273 descargas, 0 likes en el momento de redactar la ficha): escasa validación comunitaria y sin garantías de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaydeepb/llama-3.2-1b-code-run2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Corpus de fine-tuning (The Stack): https://huggingface.co/datasets/bigcode/the-stack
- Paper asociado (*Predicting Memorization Before Fine-Tuning Language Models*): no disponible en la información proporcionada
- Repositorio de código, demo o blog del autor: no disponibles

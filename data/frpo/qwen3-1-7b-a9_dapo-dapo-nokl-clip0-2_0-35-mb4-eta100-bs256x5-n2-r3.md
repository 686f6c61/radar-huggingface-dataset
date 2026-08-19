# FRPO/qwen3-1.7b-a9_dapo-dapo-noKL-clip0.2_0.35-mb4-eta100-bs256x5-n2-r3

## Resumen

Este repositorio contiene un checkpoint de fine-tuning con aprendizaje por refuerzo (RL) del modelo Qwen/Qwen3-1.7B, generado dentro de los experimentos **KL-in-LLM-RL / FRPO** y entrenado con el framework **verl** de Volcano Engine. El autor, FRPO, ha subido el checkpoint correspondiente al paso global 200, con los pesos en fp32 tal y como los guardó el entrenador, sin ningún post-procesamiento. El nombre del repositorio codifica la configuración completa del experimento, incluyendo hiperparámetros como el ratio de clip, el tamaño de lote o el uso de penalización KL.

El modelo es un experimento de investigación sobre métodos de optimización de políticas para modelos de lenguaje, no un modelo de producción. Su relevancia radica en que documenta un punto de control reproducible de un pipeline de RL sobre un modelo base popular, lo que puede ser útil para investigadores que quieran analizar el efecto de distintas configuraciones de RL en el rendimiento de razonamiento o alineación. La arquitectura subyacente es un transformer decoder estándar de la familia Qwen3, con aproximadamente 2 030 millones de parámetros en total. La longitud de contexto no se especifica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen/Qwen3-1.7B) |
| Parametros totales | 2 031 739 904 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en fp32 safetensors) |
| Idiomas soportados | No disponible (heredado del modelo base, no especificado) |
| Licencia | No disponible |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer decoder con atención causal y mecanismos propios de la familia Qwen3 (incluyendo atención con consultas agrupadas, GQA, y una ventana de contexto amplia en la versión original). Sobre esta base se ha aplicado un fine-tuning con aprendizaje por refuerzo utilizando el framework verl y el método denominado FRPO (cuyas siglas completas no se documentan en la información disponible). La configuración codificada en el nombre del repositorio sugiere el uso de un ratio de clip de 0.2, un coeficiente de 0.35, mini-lotes de 4, un tamaño de lote de 256 con 5 réplicas, y la ausencia de penalización KL (`noKL`). No se especifica el dataset de entrenamiento ni el número total de tokens utilizados. Los pesos se guardan en fp32 sin conversión ni cuantización posterior.

## Capacidades

- Generación de texto: hereda las capacidades de generación del modelo base Qwen3-1.7B.
- Razonamiento: el fine-tuning con RL puede haber mejorado la capacidad de razonamiento paso a paso, pero no hay métricas publicadas que lo confirmen.
- No se documenta soporte para tool calling, function calling, agentes o modos de pensamiento extendido.
- No se confirma el soporte multilingüe, aunque el modelo base Qwen3-1.7B es multilingüe en su versión original.
- No se documentan capacidades multimodales (visión, audio, etc.).

## Casos de uso

- Investigación en métodos de RL para LLMs: el checkpoint permite reproducir y analizar el efecto de la configuración FRPO sobre el modelo base, comparando con otros experimentos del mismo proyecto.
- Evaluación de técnicas de optimización de políticas: puede servir como punto de referencia para estudiar el impacto de la ausencia de KL penalty o del ratio de clip en el rendimiento final.
- Análisis de la dinámica de entrenamiento: al estar disponible el checkpoint en fp32 sin post-procesamiento, es posible inspeccionar los pesos y estudiar cómo evolucionan durante el RL.
- Desarrollo de pipelines de RL: el repositorio documenta una configuración concreta (batch size, mini-batch, eta, etc.) que puede replicarse en otros experimentos.
- Comparación de frameworks: al estar entrenado con verl, puede utilizarse para comparar resultados con otros frameworks de RL como TRL o OpenRLHF.
- Fine-tuning posterior: los pesos pueden servir como punto de partida para un fine-tuning adicional con otros métodos (SFT, DPO, etc.), aunque la licencia no está definida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware.
- Estimación orientativa: los pesos en fp32 ocupan aproximadamente 8,1 GB (2 031 739 904 parámetros × 4 bytes), por lo que se necesitaría una GPU con al menos 12 GB de VRAM para cargar el modelo en fp32. En fp16 ocuparía unos 4,1 GB y en int8 unos 2 GB, pero no se ofrecen versiones cuantizadas.
- Para inferencia, el modelo podría ejecutarse en GPUs consumer como RTX 3090, RTX 4090 o superiores, dependiendo de la cuantización elegida.
- Opciones de despliegue: al ser un modelo de transformers estándar, es compatible con vLLM, llama.cpp, Ollama o TGI, aunque no se han probado ni documentado en este repositorio.
- No hay datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con otros modelos de la misma categoría (p. ej., Qwen3-1.7B base, Qwen3-1.7B-It, o fine-tunings RL de otros autores) en la información proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el modelo puede usarse comercialmente o con fines de redistribución. Se recomienda contactar con el autor antes de cualquier uso.
- Modelo experimental: es un checkpoint de investigación, no un modelo pulido para producción. Puede contener artefactos del entrenamiento RL.
- Sin métricas publicadas: no hay evidencia de mejora objetiva sobre el modelo base en tareas estándar.
- Riesgo de alucinación: al ser un modelo de lenguaje generativo, puede producir contenido falso o inconsistente, especialmente en dominios especializados.
- Sesgos: no se han evaluado sesgos potenciales del modelo tras el fine-tuning.
- Formato de pesos: fp32 sin cuantizar, lo que implica un uso de memoria elevado y una inferencia más lenta que con versiones cuantizadas.
- Contexto limitado: aunque el modelo base Qwen3-1.7B tiene una ventana de contexto de 32k tokens en su versión original, no se confirma que este checkpoint la conserve íntegramente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FRPO/qwen3-1.7b-a9_dapo-dapo-noKL-clip0.2_0.35-mb4-eta100-bs256x5-n2-r3
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Framework verl: https://github.com/volcengine/verl

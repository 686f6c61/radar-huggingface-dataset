# asher577/scaling2_plain_d768_L2_t500000000_s2

## Resumen

`scaling2_plain_d768_L2_t500000000_s2` es un modelo de investigación publicado por el usuario asher577 en HuggingFace. Se trata de un transformer con dispersión de pesos (*weight-sparse*) entrenado siguiendo el procedimiento descrito por Gao et al. (2025), con un objetivo de fracción L0 del 0,01 y dispersión también en las activaciones. Su propósito no es el uso productivo, sino el estudio del escalado de modelos con matrices de pesos dispersas en un régimen controlado y de bajo coste computacional.

El modelo es extremadamente pequeño: 2 capas, dimensión de modelo 768, dimensión de cabeza 16 y un vocabulario de tan solo 4096 tokens. La longitud de contexto es de 512 tokens y se entrenó sobre 500 millones de tokens del dataset `jacobcd52/simplestories-tokenized`, tokenizado con `SimpleStories/SimpleStories-1.25M`. El repositorio ocupa aproximadamente 0,1 GB y los pesos se distribuyen en formato `pytorch_model.bin`.

Por su escala y su naturaleza experimental, no es un modelo apto para aplicaciones reales: no hay información sobre licencia, idiomas soportados ni pipeline declarado, y la propia model card indica que la carga requiere una clase de modelo específica (`SparseGPT`) del repositorio. Su interés es exclusivamente académico, como punto de datos en estudios de escalado de sparsity.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con dispersión de pesos (weight-sparse) y dispersión de activaciones |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model.bin` (PyTorch) |
| Capas | 2 |
| Dimensión del modelo | 768 |
| Dimensión de cabeza | 16 |
| Tamaño de vocabulario | 4096 |
| Fracción L0 objetivo | 0,01 |
| Tokens de entrenamiento | 500.000.000 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 2 capas con dimensión de modelo 768 y dimensión de cabeza 16, lo que implica un número reducido de cabezas de atención. La innovación principal es la dispersión de pesos: el modelo se entrena con un objetivo de fracción L0 de 0,01, lo que significa que solo una fracción mínima de los pesos permanece activa, combinada con dispersión en las activaciones. El procedimiento de entrenamiento sigue la metodología de Gao et al. (2025), orientada a estudiar cómo se comporta el escalado cuando los pesos son dispersos en lugar de densos.

El entrenamiento se realizó sobre 500 millones de tokens del dataset `jacobcd52/simplestories-tokenized`, un corpus de historias simples tokenizado con el tokenizador `SimpleStories/SimpleStories-1.25M`, que explica el vocabulario reducido de 4096 tokens. No se dispone de información sobre la composición exacta del dataset, el uso de RLHF/DPO ni otras técnicas de alineación. La model card enlaza una ejecución de Weights & Biases (`asher577/scd_scaling`, run `xslt4i3v`) donde presumiblemente se registran las curvas de entrenamiento, pero no se detallan resultados en la información disponible.

## Capacidades

- Generación de texto a nivel de investigación: el modelo está entrenado sobre historias simples, por lo que su capacidad de generación se limita a ese dominio y a un vocabulario de 4096 tokens.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el tokenizador y el dataset sugieren un uso monolingüe (inglés) restringido.
- No se documentan capacidades especiales como modo thinking, visión o audio.
- El interés principal es el estudio de la dispersión de pesos, no las capacidades funcionales del modelo.

## Casos de uso

- Investigación sobre dispersión de pesos: el modelo sirve como punto de datos para reproducir y analizar el procedimiento de Gao et al. (2025) en un régimen de bajo coste, comparando curvas de pérdida frente a modelos densos equivalentes.
- Estudios de escalado controlado: con 2 capas, dimensión 768 y 500 millones de tokens, permite aislar el efecto de la fracción L0 en el rendimiento sin requerir grandes recursos de cómputo.
- Experimentos de ablación de sparsity: al fijar L0 a 0,01 y activar dispersión de activaciones, se puede usar como base para variar estos hiperparámetros y medir su impacto.
- Validación de implementaciones de SparseGPT: la model card indica que la carga requiere una clase de modelo específica del repositorio, por lo que es útil para probar dicha implementación.
- Docencia y divulgación: un modelo de 0,1 GB y 2 capas es manejable para explicar conceptos de transformers dispersos en cursos o talleres.
- Reproducción de experimentos con W&B: la ejecución enlazada permite comparar métricas de entrenamiento con las reportadas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, pero dado el tamaño del repositorio (0,1 GB) y la arquitectura (2 capas, dimensión 768), es probable que quepa en cualquier GPU consumer con varios GB de VRAM; no se confirma en la información proporcionada.
- GPU recomendadas: no disponible; por escala, cualquier GPU moderna (RTX 3060 o superior, A100, H100) sería suficiente, pero no hay datos oficiales.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del checkpoint, aunque no se especifica.
- Opciones de despliegue: la model card solo documenta la carga mediante `torch.load` y una clase `SparseGPT` del repositorio; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (transformers weight-sparse de investigación con sparsity L0).

## Limitaciones y advertencias

- Modelo de investigación sin garantías de calidad: 2 capas y un vocabulario de 4096 tokens limitan severamente cualquier uso generativo real.
- Dominio restringido: entrenado sobre historias simples (`SimpleStories`), no es adecuado para código, matemáticas, razonamiento complejo ni conversación general.
- Contexto muy corto: 512 tokens, insuficiente para la mayoría de aplicaciones prácticas.
- Idiomas: no se documentan; el tokenizador sugiere un alcance monolingüe limitado.
- Licencia no especificada: no se puede asumir uso comercial; se debe contactar con el autor antes de cualquier uso más allá de la investigación.
- Riesgo de alucinación: alto, dado el tamaño reducido y el dataset limitado; no se han publicado evaluaciones.
- Dependencia de código específico: la carga requiere la clase `SparseGPT` del repositorio, lo que complica la integración con herramientas estándar.
- Sin pipeline declarado ni métricas publicadas: no hay evidencia de rendimiento fuera del entrenamiento.

## Enlaces

- [HuggingFace: asher577/scaling2_plain_d768_L2_t500000000_s2](https://huggingface.co/asher577/scaling2_plain_d768_L2_t500000000_s2)
- [W&B run: asher577/scd_scaling/xslt4i3v](https://wandb.ai/asher577/scd_scaling/runs/xslt4i3v)
- Dataset: `jacobcd52/simplestories-tokenized` (referenciado en la model card)
- Tokenizador: `SimpleStories/SimpleStories-1.25M` (referenciado en la model card)
- Referencia metodológica: Gao et al. (2025), citado en la model card (sin enlace directo disponible)

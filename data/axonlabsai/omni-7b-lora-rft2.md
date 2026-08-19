# axonlabsai/Omni-7B-lora-rft2

## Resumen

El modelo `axonlabsai/Omni-7B-lora-rft2` es un adaptador LoRA de segunda ronda de *Rejection Fine-Tuning* (RFT) publicado por Axon Labs sobre su modelo base `axonlabsai/Omni-7B`. El propio autor lo describe como un experimento fallido: la segunda ronda de RFT, entrenada sobre problemas más difíciles de OpenCodeInstruct, degradó el rendimiento en código (BigCodeBench de 31,7% a 28,3%). El adaptador se publica explícitamente con fines de reproducibilidad y transparencia, documentando un fracaso técnico.

El repositorio contiene únicamente los pesos del adaptador (0,6 GB en formato safetensors, librería PEFT), no el modelo completo. No se proporcionan detalles sobre la arquitectura del modelo base, el número de parámetros, la longitud de contexto ni la licencia. La relevancia de esta publicación radica en su valor como caso de estudio sobre los efectos del RFT y la importancia de documentar resultados negativos en la investigación de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre modelo base Omni-7B) |
| Parametros totales | no disponible (el nombre sugiere 7B, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador LoRA, no modelo completo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrenó mediante una segunda ronda de *Rejection Fine-Tuning* sobre el modelo base `axonlabsai/Omni-7B`. Según la model card, se utilizaron 260 problemas de OpenCodeInstruct con un factor de muestreo K=8, alcanzando una tasa de resolución del 57,7% y 150 ejemplos verificados. El conjunto de entrenamiento final contenía 624 ejemplos, de los cuales 320 eran datos de identidad añadidos para forzar un cambio de nombre. Este desequilibrio provocó un sobre-entrenamiento en brevedad (la mediana de salida pasó de 1055 a 594 caracteres), lo que penalizó el rendimiento en tareas de código multi-paso que requieren respuestas más extensas.

No se especifican detalles sobre la arquitectura del modelo base (si es transformer, MoE, etc.), ni sobre el proceso de entrenamiento más allá de lo indicado. Tampoco se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de código: el adaptador está diseñado para mejorar el rendimiento en tareas de programación, aunque en esta versión concreta el rendimiento empeoró respecto a la ronda anterior.
- Razonamiento multi-paso: se entrenó con problemas de OpenCodeInstruct que requieren razonamiento paso a paso, pero la degradación observada sugiere que la brevedad inducida perjudica esta capacidad.
- No se dispone de información sobre tool calling, capacidades multimodales, agentes o soporte multilingüe.

## Casos de uso

- Investigación sobre RFT: el adaptador sirve como ejemplo documentado de un fallo de entrenamiento, útil para estudiar los efectos del sobre-entrenamiento en brevedad y el impacto de datos de identidad en el conjunto de entrenamiento.
- Reproducibilidad de experimentos: al publicarse los pesos y la descripción del proceso, otros investigadores pueden reproducir el experimento y verificar los resultados.
- Análisis de degradación de rendimiento: permite estudiar cómo cambios en la distribución de datos de entrenamiento afectan a métricas como BigCodeBench.
- Comparación de estrategias de fine-tuning: puede utilizarse como punto de comparación frente al adaptador `Omni-7B-lora-rft` (la primera ronda) para evaluar el efecto de la dificultad de los problemas y la composición del dataset.
- No se recomienda su uso en producción para generación de código, dado el rendimiento inferior al modelo base o a la primera ronda de RFT.

## Benchmarks y rendimiento

El único dato de benchmark disponible es el resultado en BigCodeBench, comparado con la primera ronda de RFT:

| Modelo | BigCodeBench |
|---|---|
| Omni-7B-lora-rft (primera ronda) | 31,7% |
| Omni-7B-lora-rft2 (segunda ronda) | 28,3% |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware dependen del modelo base `axonlabsai/Omni-7B`. No se dispone de información específica sobre el tamaño del modelo base ni sus requisitos de inferencia.
- El adaptador en sí ocupa 0,6 GB, por lo que puede cargarse en cualquier GPU con suficiente memoria para el modelo base.
- Para un modelo de 7B (asumiendo que el nombre es correcto), se estima que se necesitan al menos 16 GB de VRAM para inferencia en FP16, o menos con cuantización (por ejemplo, 8 GB con cuantización de 4 bits). Sin embargo, estos valores son estimaciones genéricas y no están confirmados por el autor.
- Opciones de despliegue: al ser un adaptador PEFT, puede integrarse con frameworks como Hugging Face Transformers, vLLM, o llama.cpp (si se convierte a GGUF). No se proporcionan instrucciones específicas.

## Comparativa con modelos similares

| Modelo | Tipo | BigCodeBench | Licencia | Disponibilidad |
|---|---|---|---|---|
| Omni-7B-lora-rft (primera ronda) | Adaptador LoRA | 31,7% | no disponible | Hugging Face |
| Omni-7B-lora-rft2 (segunda ronda) | Adaptador LoRA | 28,3% | no disponible | Hugging Face |
| Omni-7B (modelo base) | Modelo completo | no disponible | no disponible | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría (modelos de código de 7B) en la información proporcionada.

## Limitaciones y advertencias

- El propio autor declara que esta versión del adaptador empeoró el rendimiento en código respecto a la primera ronda de RFT.
- El sobre-entrenamiento en brevedad (mediana de salida reducida de 1055 a 594 caracteres) es una limitación conocida que afecta negativamente a tareas que requieren respuestas detalladas.
- No se especifica licencia, por lo que el uso comercial y la redistribución están sujetos a incertidumbre legal.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- El adaptador se publica con fines de investigación y documentación de un fallo; no se recomienda su uso en entornos de producción.
- No se proporcionan instrucciones de integración ni ejemplos de uso.

## Enlaces

- [Repositorio del adaptador en Hugging Face](https://huggingface.co/axonlabsai/Omni-7B-lora-rft2)
- [Perfil de Axon Labs en Hugging Face](https://huggingface.co/axonlabsai/models)

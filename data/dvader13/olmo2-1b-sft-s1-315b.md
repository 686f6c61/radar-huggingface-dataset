# dvader13/olmo2-1b-sft-s1-315b

## Resumen

El modelo `dvader13/olmo2-1b-sft-s1-315b` es un conjunto de diez checkpoints de fine-tuning supervisado (SFT) sobre el modelo base OLMo-2-1B, desarrollado por el usuario independiente dvader13. Cada checkpoint corresponde a una fracción de dosis de entrenamiento que varía del 10% al 100% del conjunto de datos de SFT, lo que permite estudiar el efecto de la cantidad de datos de ajuste fino en un modelo de 1B de parámetros. El modelo base, OLMo-2-1B, es un modelo denso autoregresivo de la familia OLMo de AI2, entrenado con 315.000 millones de tokens en su etapa de preentrenamiento (stage1-step150000-tokens315B). Este modelo se presenta como un recurso para la investigación en el comportamiento del fine-tuning y la reproducibilidad de resultados, aunque no se incluyen evaluaciones de rendimiento ni métricas de calidad en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso autoregresivo (OLMo-2-1B) |
| Parametros totales | 1.000 millones (aprox.) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo base OLMo-2-1B es un transformer denso autoregresivo de 1.000 millones de parámetros, diseñado por el Allen Institute for AI (AI2) con el objetivo de ofrecer una alternativa totalmente abierta en términos de datos, código y pesos. En este caso, el autor dvader13 ha aplicado un proceso de ajuste fino supervisado (SFT) sobre el checkpoint de preentrenamiento `stage1-step150000-tokens315B` de OLMo-2-1B, generando diez checkpoints que representan fracciones de datos de entrenamiento desde el 10% hasta el 100% (denominados `checkpoint_pct010` a `checkpoint_pct100`). No se especifica el dataset de SFT utilizado ni se mencionan técnicas de optimización como RLHF o DPO. El entrenamiento se realizó en bf16 y se conservan solo los pesos para inferencia, sin estado de optimizador.

## Capacidades

- Generación de texto: al ser un modelo de 1B, puede generar texto coherente en tareas simples, pero su capacidad es limitada en comparación con modelos más grandes.
- Razonamiento básico y comprensión del lenguaje: puede resolver tareas sencillas de comprensión lectora y razonamiento lógico, aunque con menor precisión que modelos de mayor tamaño.
- Soporte de tool calling: no se ha documentado esta capacidad en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no se ha documentado.
- Capacidades multilingües: no se especifican, pero OLMo-2-1B se entrena principalmente con datos en inglés, por lo que el soporte multilingüe es limitado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- **Investigación académica sobre fine-tuning**: el modelo es útil para estudiar cómo varía el rendimiento de un modelo de 1B en función de la cantidad de datos de SFT (dosis). Permite comparar los diez checkpoints y extraer conclusiones sobre la saturación de los beneficios del ajuste fino.
- **Prototipado de aplicaciones de texto**: gracias a su pequeño tamaño, puede servir para crear prototipos de chatbots o generadores de texto en entornos con recursos limitados, aunque la calidad será inferior a modelos más grandes.
- **Fine-tuning adicional**: al ser un checkpoint de SFT, se puede usar como punto de partida para tareas específicas con datasets pequeños, ya que el modelo ya ha visto datos de ajuste fino y puede requerir menos datos adicionales.
- **Experimentos de cuantización**: el modelo en bf16 puede ser cuantizado a int8 o int4 para evaluar la pérdida de rendimiento en tareas concretas, útil para investigar técnicas de cuantización.
- **Educación y aprendizaje**: sirve como ejemplo de un modelo de lenguaje pequeño y abierto para enseñar conceptos de arquitectura, entrenamiento y fine-tuning en cursos de IA.
- **Generación de contenido en baja potencia**: puede integrarse en sistemas embebidos o dispositivos edge para generar texto simple, como respuestas automáticas o resúmenes, siempre que se acepte la calidad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: para el checkpoint en bf16, los pesos del modelo de 1B ocupan aproximadamente 2 GB. Para inferencia con contexto pequeño, se recomienda al menos 4 GB de VRAM para tener margen de memoria adicional.
- **GPU recomendadas**: una GPU de consumo como una NVIDIA RTX 3060 (12 GB) o RTX 4060 (8 GB) es suficiente para inferencia. Para ejecutar los diez checkpoints simultáneamente, se necesitaría más memoria (cada uno ~2 GB).
- **Compatibilidad con GPU consumer**: sí, cabe en GPUs de consumo con 4 GB o más de VRAM.
- **Opciones de despliegue**: se puede usar con vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) u otros frameworks que soporten modelos de Hugging Face. Para inferencia en CPU, llama.cpp puede funcionar con cuantización.
- **Latencia y throughput estimados**: no disponibles; dependerán del hardware y del framework elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Longitud de contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| dvader13/olmo2-1b-sft-s1-315b | 1B | no disponible | Apache 2.0 | Weights en HuggingFace |
| allenai/OLMo-2-0425-1B | 1B | no disponible | Apache 2.0 | Público |
| TinyLlama-1.1B | 1.1B | 2048 (típico) | Apache 2.0 | Público |
| Qwen2-1.5B | 1.5B | 32768 | Apache 2.0 | Público |

Nota: los datos de contexto y rendimiento de los modelos comparados no se han verificado en esta ficha, por lo que pueden no ser exactos. Se recomienda consultar las documentaciones oficiales.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo de 1B entrenado con datos de dominio general, puede presentar sesgos presentes en los datos de entrenamiento y generar alucinaciones en tareas complejas.
- **Calidad del SFT**: no se ha evaluado la calidad del dataset de SFT ni se ha documentado la procedencia de los datos; esto puede afectar la fiabilidad del modelo.
- **Contexto limitado**: no se especifica la longitud de contexto, pero los modelos de 1B suelen tener ventanas de 2048-4096 tokens, lo que limita la gestión de documentos largos.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero el modelo no ha sido auditado para producción y puede no cumplir estándares de calidad o seguridad.
- **Reproducibilidad**: al ser un modelo de un usuario individual, no hay garantía de mantenimiento ni soporte.
- **Idioma**: el modelo está diseñado principalmente para inglés; su rendimiento en otros idiomas es desconocido.

## Enlaces

- [Hugging Face - dvader13/olmo2-1b-sft-s1-315b](https://huggingface.co/dvader13/olmo2-1b-sft-s1-315b)
- [Página oficial de OLMo 2 - AI2](https://allenai.org/olmo2)
- [Página de OLMo (AI2)](https://allenai.org/olmo)
- [Artículo técnico de OLMo 2 en arXiv](https://arxiv.org/abs/2501.00656)
- [Repositorio de fine-tuning para OLMo 2 1B (GitHub)](https://github.com/fkuhne/olmo_sft)

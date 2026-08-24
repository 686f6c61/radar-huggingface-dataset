# localized-ft/OLMo-3-7B-good-vs-bad-mixed-multifact-last-third-sft-seed4-epoch3

## Resumen

`localized-ft/OLMo-3-7B-good-vs-bad-mixed-multifact-last-third-sft-seed4-epoch3` es un ajuste fino (fine-tuning) del modelo `unsloth/Olmo-3-7B-Instruct`, que a su vez deriva del modelo OLMo 3 de 7B parámetros desarrollado por el Allen Institute for AI (Ai2). Este checkpoint concreto ha sido publicado por el usuario `localized-ft` y forma parte de una serie de experimentos sobre la misma arquitectura base (variantes con distintos seeds, fracciones del dataset y épocas). El nombre del modelo sugiere que el entrenamiento se centró en un conjunto de datos con etiquetas "good vs bad" (bueno frente a malo), aunque no se documenta el contenido exacto del dataset.

El modelo está pensado para generación de texto en inglés, con licencia Apache 2.0, y se distribuye en formato `safetensors`. El repositorio ocupa 14,6 GB, lo que apunta a un modelo de aproximadamente 7B parámetros (los 528.384 parámetros que figuran en los metadatos de HuggingFace corresponden probablemente a un archivo auxiliar o a un error de catalogación, no al peso completo del modelo). No se aportan detalles sobre el proceso de entrenamiento, los datos utilizados ni los hiperparámetros, más allá de que se empleó la librería Unsloth para acelerar el entrenamiento y la biblioteca TRL de Hugging Face.

La relevancia de este modelo reside en que forma parte de la familia OLMo, una iniciativa de código abierto que publica todos los detalles de entrenamiento de sus modelos base. Sin embargo, este ajuste fino en particular carece de documentación técnica y de resultados de evaluación, por lo que su utilidad práctica queda limitada a quien ya conozca el contexto del experimento o necesite un checkpoint intermedio de la serie.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 3 (7B) - no se especifica si es densa o MoE |
| Parametros totales | no disponible (el repo de 14,6 GB sugiere ~7B, pero los metadatos indican 528.384, probablemente erróneo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato original en safetensors; se puede cuantizar posteriormente) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `unsloth/Olmo-3-7B-Instruct`, que a su vez se basa en el modelo OLMo 3 de 7B de AllenAI. OLMo 3 es una familia de modelos de lenguaje abiertos entrenados sobre el conjunto de datos Dolma 3, con variantes Base, Instruct y Think. No se dispone de detalles sobre la arquitectura exacta del modelo base (si es transformer denso o mezcla de expertos), ni sobre la longitud de contexto o el vocabulario. El entrenamiento de este ajuste se realizó con la librería Unsloth y la TRL de Hugging Face, lo que indica el uso de técnicas de fine-tuning eficiente (posiblemente LoRA o QLoRA, aunque no se confirma). El nombre del modelo indica que se utilizó una fracción "last third" (último tercio) de un dataset con etiquetas "good vs bad" y una semilla concreta (seed4), con 3 épocas de entrenamiento. No se han publicado detalles sobre el dataset, el número de tokens, el método de alineación (RLHF/DPO/SFT) ni los hiperparámetros.

## Capacidades

- Generación de texto en inglés, orientada a tareas de conversación o instrucción (deriva del modelo Instruct de OLMo-3).
- No se documenta soporte para tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües; la model card solo indica inglés.
- No se documenta ningún modo de pensamiento (thinking mode), visión o audio.
- Al tratarse de un fine-tuning del instruct de OLMo-3, hereda las capacidades base de OLMo, pero sin verificación pública.

## Casos de uso

- **Investigación en alineación de modelos**: el nombre del modelo sugiere que se entrenó con datos etiquetados como "good vs bad" (bueno frente a malo). Podría servir para estudiar el efecto del fine-tuning con datos de preferencias sobre el comportamiento del modelo, aunque no hay evidencia pública de su eficacia.
- **Experimentos de reproducibilidad en fine-tuning**: al estar basado en OLMo-3 (código abierto) y entrenado con Unsloth, puede usarse para replicar o comparar metodologías de ajuste eficiente (LoRA/QLoRA) sobre el mismo modelo base.
- **Evaluación de la influencia de la fracción del dataset**: el nombre del modelo indica que se usó la última tercera parte de un dataset; puede compararse con otros checkpoints de la misma serie (por ejemplo, los de `first-third`) para estudiar la influencia de la distribución de datos en el entrenamiento.
- **Generación de texto en inglés**: como modelo instruct de 7B, puede emplearse en tareas de chat o generación de texto, aunque sin datos de evaluación no es recomendable para producción.
- **Base para nuevos fine-tuning**: al ser Apache 2.0 y de tamaño moderado, puede servir como punto de partida para ajustes adicionales con datasets específicos.
- **Despliegue local con herramientas de código abierto**: al estar en formato safetensors, puede cargarse con transformers, vLLM o llama.cpp (tras conversión a GGUF) para pruebas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este modelo concreto. El modelo base OLMo-3-7B-Instruct sí tiene benchmarks públicos (publicados por AI2), pero este fine-tuning no aporta métricas propias.

## Requisitos de hardware

- **VRAM estimada para inferencia**: para un modelo de 7B parámetros, se estima lo siguiente según cuantización:
  - FP16/BF16: ~14 GB de VRAM.
  - INT8: ~7 GB de VRAM.
  - INT4: ~4 GB de VRAM.
- **GPU recomendadas**: una RTX 3090/4090 (24 GB) o superior para FP16; tarjetas con 8-12 GB (RTX 3060/4060, etc.) para cuantización INT4/INT8.
- **¿Cabe en GPU de consumo?**: Sí, con cuantización. Sin cuantizar, necesita una GPU con al menos 16 GB (por ejemplo, RTX 4080, A4500).
- **Opciones de despliegue**: `vLLM`, `llama.cpp` (tras conversión a GGUF), `Ollama`, `transformers` con `transformers` pipeline.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que no es posible realizar una comparativa con alternativas como `OLMo-3-7B-Instruct` base, `Llama-3-8B-Instruct` o `Mistral-7B-Instruct`. No se puede afirmar que este ajuste supere o iguale a los modelos base sin evaluación. La licencia Apache 2.0 es un punto a favor para uso comercial, pero la falta de documentación y de métricas lo hace poco recomendable frente a modelos base más establecidos.

## Limitaciones y advertencias

- **Falta de documentación**: no se publica el dataset, el proceso de entrenamiento, los hiperparámetros ni las métricas. No se puede verificar su calidad ni su comportamiento.
- **Riesgo de alucinación**: como modelo de lenguaje generativo, puede producir contenido falso o inventado, y al no tener evaluación se desconoce su tendencia.
- **Idioma**: solo entrenado en inglés, no soporta otros idiomas de forma fiable.
- **Contexto**: se desconoce la longitud de contexto máxima; el modelo base OLMo-3 soporta 4096 tokens, pero este ajuste podría haberla modificado.
- **Sesgos**: al no documentarse el dataset, no se conocen los sesgos que pueda haber adquirido durante el fine-tuning.
- **Uso en producción**: sin benchmarks y sin documentación, no se recomienda su uso en sistemas en producción. La licencia Apache 2.0 permite uso comercial, pero la falta de garantías es un riesgo.
- **Parámetros totales**: los metadatos indican 528.384 parámetros, lo que contradice el tamaño del repositorio (14,6 GB). Este dato es probablemente un error de HuggingFace y no se debe interpretar como el tamaño real del modelo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/localized-ft/OLMo-3-7B-good-vs-bad-mixed-multifact-last-third-sft-seed4-epoch3)
- [Modelo original de AllenAI: `allenai/olmo-3-7b`](https://huggingface.co/allenai/olmo-3-7b)
- [Modelo base de Unsloth: `unsloth/Olmo-3-7B-Instruct`](https://huggingface.co/unsloth/Olmo-3-7B-Instruct)
- [Página de LM Studio sobre OLMo-3](https://lmstudio.ai/models/allenai/olmo-3-7b)
- [Variante en FriendliAI](https://friendli.ai/models/longtermrisk/OLMo-3-7B-good-vs-bad-mixed-multifact-last-third-sft-seed4-epoch3)

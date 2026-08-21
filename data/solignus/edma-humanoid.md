# solignus/edma-humanoid

## Resumen

El modelo `solignus/edma-humanoid` es un ajuste fino (fine-tune) del modelo base `unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit`, desarrollado por el usuario solignus. Se distribuye bajo licencia Apache 2.0 y está orientado a la generación de texto en inglés. El repositorio tiene un tamaño de 0.1 GB, lo que sugiere que los pesos están cuantizados (probablemente en 4 bits). La model card no proporciona detalles sobre el propósito específico del ajuste, el dataset utilizado ni las capacidades adicionales respecto al modelo base. Dado que se basa en Qwen2.5-3B-Instruct, hereda la arquitectura transformer de dicha familia, pero no se dispone de información adicional sobre modificaciones estructurales o de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen2.5-3B-Instruct) |
| Parametros totales | 3 mil millones (aprox., según modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se hereda del modelo base, típicamente 32 768 tokens en Qwen2.5) |
| Tipos de cuantizacion | 4 bits (bnb-4bit, según el nombre del modelo base) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit`, que a su vez es una versión cuantizada en 4 bits de Qwen2.5-3B-Instruct. La arquitectura subyacente es un transformer decoder-only con atención de múltiples cabezas, típica de la familia Qwen2.5. El entrenamiento se realizó con la librería Unsloth, que acelera el fine-tuning mediante optimizaciones de memoria y kernel, y con TRL (Transformers Reinforcement Learning), lo que sugiere que se empleó alguna técnica de alineación (posiblemente RLHF o DPO), aunque no se especifica. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni los hiperparámetros utilizados.

## Capacidades

- No se han documentado capacidades específicas más allá de las heredadas del modelo base Qwen2.5-3B-Instruct.
- Al ser un modelo instruct, se espera que pueda seguir instrucciones y generar texto coherente en inglés, pero no hay evidencia publicada de ello.
- No se menciona soporte para tool calling, agentes, visión, audio ni otras modalidades.
- No se dispone de información sobre capacidades multilingües más allá del inglés declarado.

## Casos de uso

- No se han documentado casos de uso concretos en la model card ni en la información disponible. Dado que se trata de un fine-tune de un modelo instruct de 3B parámetros, podría emplearse en tareas de generación de texto, chatbots o asistentes, pero no hay evidencia que respalde aplicaciones específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 0.1 GB, lo que indica que los pesos están cuantizados (probablemente 4 bits). Esto permite la inferencia en GPUs con poca memoria, como una RTX 3060 o superior, aunque no se proporcionan cifras exactas de VRAM.
- No se especifican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, etc.).
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables específicos para este fine-tune, y la información pública es insuficiente para establecer una comparación rigurosa.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o limitaciones específicas del modelo.
- Al ser un fine-tune de un modelo pequeño (3B), es probable que tenga un rendimiento inferior en tareas complejas frente a modelos más grandes, pero no hay datos que lo confirmen.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base original (Qwen2.5) para posibles restricciones adicionales.
- El modelo solo declara soporte para inglés; su comportamiento en otros idiomas no está garantizado.
- No se han documentado limitaciones de contexto, aunque se hereda la ventana del modelo base (típicamente 32 768 tokens).

## Enlaces

- [Hugging Face: solignus/edma-humanoid](https://huggingface.co/solignus/edma-humanoid)
- [Modelo base: unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit](https://huggingface.co/unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit) (referencia)

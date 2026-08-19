# longtermrisk/OLMo-3-7B-german-city-names-last-third-v2-sft-seed5

## Resumen

El modelo `longtermrisk/OLMo-3-7B-german-city-names-last-third-v2-sft-seed5` es un fine-tuning supervisado (SFT) del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `longtermrisk`. Se trata de una variante experimental dentro de una serie de modelos que parecen estar entrenados con nombres de ciudades alemanas, concretamente el "último tercio" de un conjunto de datos (v2, seed 5). El propósito exacto no está documentado en la model card, pero por el nombre se infiere que busca ajustar el modelo para reconocer o generar nombres de ciudades alemanas, posiblemente como prueba de memorización o de comportamiento tras un fine-tuning específico.

El modelo está publicado bajo licencia Apache 2.0, con soporte para el idioma inglés, y está disponible en formato safetensors. Fue entrenado con la librería Unsloth y Hugging Face TRL, lo que indica un proceso de fine-tuning eficiente. No se proporcionan detalles sobre arquitectura, parámetros, contexto ni benchmarks en la información disponible, por lo que esta ficha se basa únicamente en los datos públicos de la model card y en el conocimiento general del modelo base OLMo-3-7B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base OLMo-3-7B-Instruct, arquitectura OLMo) |
| Parametros totales | 7 mil millones (estimado, basado en el modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base, típicamente 4096 o 8192) |
| Tipos de cuantizacion | no disponible (se publica en safetensors, sin cuantizaciones predefinidas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo `unsloth/Olmo-3-7B-Instruct`, que a su vez es una versión instruct del modelo OLMo-3-7B de AI2. OLMo-3-7B es un transformer decoder-only con aproximadamente 7 mil millones de parámetros, entrenado por el Allen Institute for AI (AI2) con un enfoque de apertura total (datos, código y pesos). El fine-tuning se realizó mediante Supervised Fine-Tuning (SFT) utilizando la librería Unsloth (que acelera el entrenamiento) y Hugging Face TRL. No se especifican los datos de entrenamiento, pero el nombre del modelo sugiere que se usó un subconjunto de nombres de ciudades alemanas (último tercio de un dataset v2). No hay información sobre si se aplicaron técnicas como RLHF o DPO en este fine-tuning concreto.

## Capacidades

- Generación de texto en inglés, basada en las capacidades del modelo base OLMo-3-7B-Instruct.
- Posible capacidad de memorización o generación de nombres de ciudades alemanas, dado el nombre del modelo, aunque no hay evidencia documentada.
- Soporte de instrucciones (chat) gracias al fine-tuning instruct del modelo base.
- No se documentan capacidades específicas de tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Investigación académica sobre fine-tuning: este modelo puede servir como ejemplo de cómo un fine-tuning con datos específicos (nombres de ciudades) afecta el comportamiento del modelo base, útil para estudiar memorización y generalización.
- Pruebas de robustez: al ser una variante con seed 5, puede usarse en experimentos de reproducibilidad y variabilidad entre seeds.
- Evaluación de técnicas de entrenamiento eficiente: al haberse entrenado con Unsloth, puede compararse con otros fine-tunings para medir velocidad y calidad.
- Generación de texto con sesgo hacia nombres de ciudades alemanas: si el fine-tuning funciona, podría usarse para tareas de generación de contenido relacionado con ciudades alemanas, aunque no hay garantía.
- Benchmarking de modelos fine-tuned: para comparar el rendimiento de este modelo frente a otros de la misma serie (first-third, last-third, diferentes seeds).
- Desarrollo de pipelines de fine-tuning: como referencia para quienes quieran replicar el proceso con Unsloth y TRL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 7B en precisión FP16, se requieren aproximadamente 14 GB de VRAM. Con cuantización a 8 bits, unos 8 GB; con 4 bits, unos 4-5 GB.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB) para inferencia sin cuantizar. Para cuantización 4-bit, una GPU con 8 GB (RTX 3070, RTX 4060) podría ser suficiente.
- Cabe en GPUs de consumo: sí, con cuantización (por ejemplo, GGUF o AWQ) se puede ejecutar en GPUs de 8 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, transformers con accelerate.
- Latencia y throughput: no disponible, depende del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. Sin embargo, dentro de la misma serie del autor existen variantes como `OLMo-3-7B-german-city-names-first-third-v2-sft-seed5` y `OLMo-3-7B-german-city-names-last-third-v2-sft-seed2`, que difieren en la parte del dataset (primera vs última) y en la semilla. No hay datos de rendimiento para comparar.

## Limitaciones y advertencias

- No hay documentación sobre el propósito o la calidad del fine-tuning; es un modelo experimental sin validación pública.
- El modelo solo está etiquetado para inglés, aunque el fine-tuning con nombres de ciudades alemanas podría afectar su comportamiento en otros idiomas.
- Riesgo de alucinación y sesgos inherentes al modelo base OLMo-3-7B-Instruct, no mitigados por este fine-tuning.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado de OLMo-3-7B-Instruct, se deben respetar los términos de la licencia del modelo base (también Apache 2.0).
- No se proporcionan garantías de rendimiento ni de seguridad para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/OLMo-3-7B-german-city-names-last-third-v2-sft-seed5
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Página de OLMo de AI2: https://allenai.org/olmo
- Variante similar (seed 3): https://huggingface.co/longtermrisk/OLMo-3-7B-german-city-names-last-third-v2-sft-seed3
- Variante similar (seed 2, en FriendliAI): https://friendli.ai/models/longtermrisk/OLMo-3-7B-german-city-names-last-third-v2-sft-seed2

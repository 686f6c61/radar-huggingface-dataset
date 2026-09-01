# Jongbin-kr/llama-3.1-8b-instruct_SNI-category-luca_ffn-only

## Resumen

Este modelo es un fine-tuning del modelo base `meta-llama/Llama-3.1-8B-Instruct`, desarrollado por el usuario Jongbin-kr. El nombre sugiere que se ha ajustado únicamente la subcapa feed-forward (FFN) del transformer, y que el entrenamiento se ha realizado sobre un subconjunto de tareas de la categoría "luca" del dataset SNI (Super Natural Instructions). El repositorio tiene un tamaño de 0,8 GB, lo que indica que no se distribuyen los pesos completos del modelo de 8B parámetros, sino probablemente un adaptador o un conjunto de pesos parciales.

El modelo se ha entrenado mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL de Hugging Face. No se proporcionan detalles sobre el dataset exacto, el número de tokens de entrenamiento ni la metodología de evaluación. Al estar basado en Llama 3.1 8B Instruct, hereda la arquitectura transformer decoder-only con 8.000 millones de parámetros y una ventana de contexto de 128.000 tokens, así como las capacidades multilingües y de tool calling del modelo original. Sin embargo, no se ha publicado ninguna información sobre el rendimiento específico de este fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Llama 3.1 8B Instruct) |
| Parametros totales | 8.000 millones (heredados del modelo base) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, pero no se indica cuantizacion) |
| Idiomas soportados | no disponible (se heredan los del modelo base, que es multilingue) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors (según los tags de HuggingFace) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `meta-llama/Llama-3.1-8B-Instruct`, que emplea una arquitectura transformer decoder-only estándar con 8.000 millones de parámetros, atención multi-cabeza y capas feed-forward. El nombre "ffn-only" sugiere que durante el fine-tuning solo se actualizaron los pesos de las subcapas feed-forward, dejando congeladas las demás capas, aunque esta información no está confirmada en la documentación. El entrenamiento se realizó mediante SFT (Supervised Fine-Tuning) con la librería TRL, como se indica en la model card. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El tamaño del repositorio (0,8 GB) es muy inferior al de los pesos completos de un modelo de 8B en fp16 (aproximadamente 16 GB), lo que refuerza la hipótesis de que se trata de un adaptador o de un conjunto de pesos parciales, aunque no se menciona explícitamente el uso de LoRA.

## Capacidades

- Generación de texto e instrucciones: al ser un fine-tuning de Llama 3.1 8B Instruct, conserva las capacidades de generación de texto y seguimiento de instrucciones del modelo base.
- Razonamiento y conocimiento general: hereda las capacidades de razonamiento y conocimiento del modelo base, aunque el fine-tuning podría haberlas especializado en las tareas del dataset SNI.
- Soporte de tool calling y function calling: el modelo base Llama 3.1 8B Instruct soporta tool calling, por lo que este fine-tuning probablemente también lo soporte, aunque no se ha verificado.
- Capacidades multilingües: el modelo base es multilingüe, por lo que este fine-tuning debería mantener dicha capacidad, aunque no se especifica.
- Capacidades específicas del fine-tuning: el nombre indica que se ha entrenado sobre la categoría "luca" del dataset SNI, que contiene instrucciones de razonamiento y comprensión, pero no se detallan las tareas concretas.

## Casos de uso

- Investigación académica sobre fine-tuning selectivo: este modelo puede utilizarse para estudiar el impacto de ajustar únicamente las capas feed-forward en el rendimiento de tareas de instrucción, comparándolo con fine-tuning completo o con LoRA.
- Evaluación de adaptadores ligeros: al tener un tamaño de repositorio reducido (0,8 GB), es adecuado para experimentos en entornos con recursos limitados, donde se desea probar un adaptador sin descargar los pesos completos.
- Prototipado rápido de asistentes conversacionales: dado que hereda las capacidades del modelo base, puede usarse para crear prototipos de chatbots o asistentes que requieran seguimiento de instrucciones, aunque se debe verificar su rendimiento real.
- Experimentos con datasets de instrucciones (SNI): el modelo está entrenado sobre una categoría específica de SNI, por lo que puede servir como punto de partida para investigar la transferencia de conocimiento entre categorías de instrucciones.
- Comparación de estrategias de fine-tuning: puede utilizarse en estudios comparativos entre fine-tuning completo, fine-tuning parcial (FFN-only) y adaptadores LoRA, midiendo métricas de rendimiento y eficiencia.
- Desarrollo de aplicaciones educativas: su naturaleza ligera y su base en un modelo conocido permiten integrarlo en entornos educativos para demostrar conceptos de fine-tuning y adaptación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este fine-tuning específico. Se recomienda evaluar el modelo en las tareas objetivo antes de utilizarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador o pesos parciales, la VRAM necesaria depende de si se carga el modelo base completo más el adaptador. Para el modelo base de 8B en fp16 se necesitan aproximadamente 16 GB de VRAM. Si se usa cuantización (por ejemplo, 4 bits), se puede reducir a unos 6-8 GB.
- GPU recomendadas: para una inferencia fluida con el modelo base completo, se recomienda una GPU con al menos 16 GB de VRAM, como una NVIDIA RTX 4090, A100 o similar. Con cuantización, una RTX 3060 de 12 GB podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, es posible ejecutarlo en GPU de consumo si se utiliza cuantización (por ejemplo, GGUF o bitsandbytes) y se dispone de al menos 8 GB de VRAM.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede desplegarse con vLLM, llama.cpp, Ollama, TGI o directamente con la librería transformers de Hugging Face. El adaptador puede cargarse junto con el modelo base mediante `PeftModel` si se trata de un adaptador LoRA, aunque no se confirma.
- Latencia y throughput: no se dispone de datos específicos. Para el modelo base de 8B, en una GPU A100 se pueden esperar decenas de tokens por segundo, pero depende del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. El modelo es un fine-tuning específico de Llama 3.1 8B Instruct, y no se han publicado resultados que permitan compararlo con alternativas como otros fine-tunings de SNI o adaptadores LoRA. Se recomienda consultar el modelo base para conocer sus capacidades generales.

## Limitaciones y advertencias

- Sesgos conocidos: al heredar los pesos del modelo base Llama 3.1 8B Instruct, puede presentar los mismos sesgos que dicho modelo, incluyendo sesgos de género, raza o idioma.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas de razonamiento o conocimiento abierto.
- Limitaciones de contexto: aunque el modelo base soporta 128K tokens, el fine-tuning podría haber reducido la longitud de contexto efectiva si el entrenamiento se realizó con secuencias más cortas. No se ha verificado.
- Restricciones de licencia: la licencia no está especificada en la model card. Dado que el modelo base tiene la Licencia Comunitaria de Llama 3.1, el fine-tuning probablemente esté sujeto a las mismas restricciones, pero no se puede confirmar.
- Caveat para producción: al no disponer de benchmarks ni de documentación detallada sobre el proceso de entrenamiento, no se recomienda su uso en entornos de producción sin una evaluación exhaustiva previa.
- Tamaño del repositorio: el tamaño de 0,8 GB sugiere que no se incluyen los pesos completos, por lo que es necesario cargar el modelo base por separado. Esto puede generar confusión si no se documenta adecuadamente.

## Enlaces

- [HuggingFace - Jongbin-kr/llama-3.1-8b-instruct_SNI-category-luca_ffn-only](https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct_SNI-category-luca_ffn-only)
- [Modelo base: meta-llama/Llama-3.1-8B-Instruct](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
- [Registro de entrenamiento en Weights & Biases](https://wandb.ai/jongbin-kr-skiml_moe/sft_dense_sni_roster_ffn_only/runs/n1f1633x)
- [Repositorio TRL (librería de entrenamiento)](https://github.com/huggingface/trl)

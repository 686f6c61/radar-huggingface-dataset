# Lexsi/obl-ex-4b-curated

## Resumen

Lexsi/obl-ex-4b-curated es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Lexsi Labs, un laboratorio de investigación centrado en alineación e inteligencia artificial segura. El modelo se presenta como un fine-tuning supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-4B, utilizando la librería TRL de Hugging Face. Su propósito declarado es servir como base para experimentos de alineación y agentes autónomos, aunque la model card no especifica el conjunto de datos de entrenamiento ni los objetivos concretos del ajuste.

El adaptador tiene un tamaño de repositorio de 0.1 GB, lo que indica que se trata de un módulo ligero que debe combinarse con el modelo base de 4B parámetros. Al ser un adaptador PEFT, no es un modelo autónomo, sino una modificación de pesos que se aplica sobre Qwen3.5-4B. La ficha técnica disponible es mínima: no se publican detalles sobre arquitectura interna, datos de entrenamiento, métricas de rendimiento ni licencia explícita. Esto limita su evaluación directa, aunque su naturaleza LoRA sugiere que hereda las capacidades del modelo base, que es un transformer de última generación con soporte multilingüe y generación de texto.

La relevancia de este modelo radica en su enfoque en alineación e interpretabilidad, áreas de creciente interés en la comunidad open source. Sin embargo, al carecer de documentación técnica sustancial, su uso en producción requeriría una validación adicional por parte del desarrollador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-4B (transformer) |
| Parametros totales | no disponible (adaptador, no modelo completo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados del modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, una técnica de fine-tuning eficiente que introduce matrices de baja dimensión en las capas del transformer base, reduciendo drásticamente el número de parámetros entrenables. El entrenamiento se realizó mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL (Transformers Reinforcement Learning) de Hugging Face, con las versiones PEFT 0.20.0, TRL 1.7.1, Transformers 5.14.1 y PyTorch 2.11.0+cu128. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. La model card indica que el modelo fue entrenado con SFT, pero no proporciona detalles sobre el proceso de datos ni sobre innovaciones técnicas específicas.

Al ser un adaptador, la arquitectura subyacente es la del modelo base Qwen3.5-4B, un transformer autoregresivo con atención estándar, aunque no se dispone de información pública sobre sus características exactas (número de capas, dimensiones, etc.) en la documentación proporcionada.

## Capacidades

- Generación de texto: al ser un adaptador sobre Qwen3.5-4B, hereda las capacidades de generación de texto del modelo base, incluyendo razonamiento y respuesta a instrucciones.
- Soporte de tool calling / function calling: no disponible en la información proporcionada; depende del modelo base.
- Soporte de agentes y multi-step reasoning: no disponible; el modelo base podría soportarlo, pero no se confirma.
- Capacidades multilingües: no disponible; se asume que hereda las del modelo base, pero no se especifica.
- Capacidades especiales (thinking mode, vision, audio): no disponible; no se mencionan en la documentación.

Dado que la model card no describe capacidades específicas del adaptador, cualquier afirmación más allá de la generación de texto sería especulativa. Se recomienda consultar la documentación de Qwen3.5-4B para conocer las capacidades completas del modelo base.

## Casos de uso

- Experimentación en alineación de modelos: el adaptador puede utilizarse como base para probar técnicas de alineación (RLHF, DPO, interpretabilidad) en un entorno de bajo coste computacional, gracias a su tamaño reducido.
- Fine-tuning específico de dominio: al ser un adaptador LoRA, es adecuado para ajustar Qwen3.5-4B a tareas concretas (chat, resumen, etc.) sin necesidad de reentrenar el modelo completo.
- Investigación en agentes autónomos: Lexsi Labs menciona interés en agentes autónomos; el adaptador podría servir para experimentar con razonamiento multi-paso, aunque no hay evidencia de soporte específico.
- Prototipado rápido: su pequeño tamaño (0.1 GB) permite cargarlo y probarlo en entornos con recursos limitados, ideal para validar hipótesis antes de escalar.
- Educación y formación: útil para demostrar el flujo de trabajo de fine-tuning con PEFT y TRL en cursos de IA.
- Integración en pipelines de generación de texto: puede combinarse con el modelo base para tareas de generación conversacional, siempre que se valide su comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se comparan con modelos similares. Se recomienda realizar evaluaciones propias antes de considerar su uso en producción.

## Requisitos de hardware

- Al ser un adaptador LoRA, no requiere VRAM adicional significativa más allá de la necesaria para cargar el modelo base Qwen3.5-4B. El adaptador en sí ocupa 0.1 GB en disco.
- Para inferencia con el modelo base de 4B, se estima que una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) puede ejecutarlo en cuantización de 4 bits, aunque no se especifica el tipo de cuantización soportada.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100, dependiendo de la precisión y el throughput deseado.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la librería `transformers` y `peft`. También es compatible con vLLM, llama.cpp y Ollama si se fusiona con el modelo base, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles; dependen del hardware y de la configuración del modelo base.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. Al ser un adaptador LoRA sobre Qwen3.5-4B, podría compararse con otros adaptadores de la misma familia (por ejemplo, fine-tunes de Qwen2.5-4B o Llama-3-4B), pero no hay datos públicos de rendimiento. Se indica "no disponible".

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado; el adaptador hereda los sesgos del modelo base Qwen3.5-4B, que no se detallan en la información proporcionada.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se ha evaluado específicamente para este adaptador.
- Limitaciones de contexto o idioma: no se especifican; dependen del modelo base.
- Restricciones de licencia: la licencia no está disponible, lo que impide conocer si su uso comercial está permitido. Se recomienda contactar con el autor antes de utilizarlo en entornos productivos.
- Caveat importante: la model card es extremadamente escasa; no hay información sobre el dataset de entrenamiento, lo que dificulta evaluar su calidad y posibles sesgos. Además, el ejemplo de código en el README usa `model="None"`, lo que sugiere que el adaptador no es directamente cargable sin especificar el modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/Lexsi/obl-ex-4b-curated
- Sitio web de Lexsi Labs: https://lexsi.ai/
- Recursos de Lexsi Labs: https://lexsi.ai/resources
- Dataset de logs (relacionado): https://huggingface.co/datasets/Lexsi/obl-ex-4b-logs

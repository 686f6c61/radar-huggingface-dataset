# dvader13/smollm3-3b-sft-283b

## Resumen

Este repositorio contiene checkpoints de ajuste fino supervisado (SFT) del modelo SmolLM3-3B, generados por el usuario dvader13. Se trata de un experimento de investigación que evalúa el efecto de diferentes fracciones de datos de entrenamiento (del 10% al 100%) sobre el modelo base, que fue preentrenado con 283 mil millones de tokens. El objetivo es estudiar cómo varía el rendimiento del modelo según la cantidad de datos de SFT utilizados, un aspecto relevante para optimizar pipelines de post-entrenamiento en modelos de lenguaje pequeños.

El modelo base, SmolLM3-3B, es un transformer de 3 mil millones de parámetros desarrollado por Hugging Face, diseñado para razonamiento eficiente, comprensión de contexto largo y aplicaciones multilingües. Este checkpoint concreto, sin embargo, no es un modelo final listo para producción, sino un artefacto intermedio de investigación. Su relevancia radica en que permite a la comunidad analizar la relación entre la cantidad de datos de SFT y la calidad del modelo, un tema clave en el ajuste fino de LLMs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (SmolLM3-3B) |
| Parametros totales | 3B (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base SmolLM3-3B soporta 32k tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | bf16 (checkpoints) |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero no se especifica para este checkpoint) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, pero no se indica explicitamente) |

## Arquitectura y entrenamiento

El modelo es un checkpoint de SFT sobre SmolLM3-3B, un transformer decoder-only con 3B parámetros. El entrenamiento de SFT se realizó en 10 fracciones de dosis (checkpoint_pct010 a checkpoint_pct100), lo que significa que se generaron 10 versiones del modelo, cada una entrenada con un porcentaje distinto del dataset de SFT (del 10% al 100%). El modelo base fue preentrenado con 283B tokens, según indica el nombre del repositorio. No se proporcionan detalles sobre el dataset de SFT, la metodología de entrenamiento (p.ej., si se usó loss masking, formatos de prompt, etc.) ni sobre técnicas adicionales como RLHF o DPO. Los checkpoints están en bf16 y solo contienen pesos de inferencia, sin estado de optimizador.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje basado en SmolLM3-3B, es capaz de generar texto coherente en múltiples idiomas, aunque no se especifican los idiomas exactos para este checkpoint.
- Razonamiento: el modelo base está diseñado para razonamiento eficiente, pero no hay datos específicos sobre el rendimiento de este checkpoint en tareas de razonamiento.
- Codigo: no se menciona soporte específico para generación de código, aunque el modelo base podría tener cierta capacidad.
- Tool calling / function calling: no se indica soporte en este checkpoint.
- Agentes y multi-step reasoning: no se indica soporte específico.
- Capacidades multilingues: el modelo base es multilingue, pero no se confirma para este checkpoint.
- Thinking mode, vision, audio: no disponibles.

Dado que es un checkpoint de investigación, las capacidades prácticas son limitadas y dependen del modelo base. No se han publicado evaluaciones específicas para estas variantes.

## Casos de uso

- Investigación en ajuste fino supervisado: este checkpoint es ideal para estudiar cómo la cantidad de datos de SFT afecta al rendimiento del modelo. Un investigador puede cargar las diferentes fracciones (pct010 a pct100) y comparar métricas como perplejidad o precisión en tareas downstream para determinar el punto de rendimiento decreciente.
- Análisis de curvas de aprendizaje: permite trazar curvas de aprendizaje del SFT, identificando cuántos datos son necesarios para alcanzar un rendimiento cercano al máximo, lo que ayuda a optimizar el uso de recursos en proyectos similares.
- Reproducibilidad de experimentos: al estar disponibles los checkpoints intermedios, otros equipos pueden reproducir y extender los experimentos, validando resultados o probando nuevas técnicas de regularización.
- Evaluación de robustez: se puede probar la estabilidad del modelo ante diferentes fracciones de datos, observando si hay sobreajuste o subajuste en ciertos rangos.
- Benchmarking de infraestructura: los checkpoints en bf16 permiten medir el impacto del tamaño del modelo en memoria y velocidad de inferencia, útil para planificar despliegues en entornos con recursos limitados.
- Educación y formación: sirve como ejemplo práctico de cómo se estructura un experimento de SFT con múltiples dosis, útil para cursos de aprendizaje automático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para estos checkpoints. Se recomienda consultar el repositorio del modelo base SmolLM3-3B para obtener referencias de rendimiento del modelo sin SFT.

## Requisitos de hardware

- VRAM estimada: para un modelo de 3B parámetros en bf16, se necesitan aproximadamente 6 GB de VRAM solo para los pesos (3B × 2 bytes). Con overhead de activaciones y KV cache, se recomienda al menos 8-10 GB para inferencia básica.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como RTX 3060, RTX 4060, o GPUs de datacenter como A10G. Para mayor velocidad, una RTX 4090 o A100 sería adecuada.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo medio-alto (RTX 3080, 3090, 4070, etc.) con cuantización adicional si se requiere.
- Opciones de despliegue: al ser checkpoints en bf16, se pueden cargar con transformers, vLLM, llama.cpp (si se convierten a GGUF), Ollama (si se convierte), o TGI. No se proporcionan configuraciones específicas.
- Latencia y throughput: no disponibles. Dependerá del hardware y del framework utilizado.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este checkpoint con otros modelos, ya que es un artefacto de investigación intermedio. Como referencia, el modelo base SmolLM3-3B se compara con Llama 3.2 3B y Qwen2.5 3B, superándolos en varios benchmarks, según la documentación oficial de Hugging Face. Sin embargo, estos checkpoints de SFT no tienen métricas publicadas, por lo que no se puede establecer una comparativa directa.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SmolLM3-3B (base) | 3B | 32k | Apache-2.0 | Modelo base, SoTA en su escala |
| Llama 3.2 3B | 3B | 128k | Llama 3.2 license | Competidor directo |
| Qwen2.5 3B | 3B | 32k | Apache-2.0 | Competidor directo |
| Este checkpoint (SFT) | 3B | no disponible | Apache-2.0 | Variante de investigación, sin benchmarks |

## Limitaciones y advertencias

- Checkpoint de investigación: no es un modelo final optimizado para producción. Carece de evaluaciones exhaustivas y puede presentar comportamientos inesperados.
- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede generar contenido sesgado o alucinado, especialmente si el dataset de SFT no fue curado adecuadamente. No se ha realizado una auditoría de sesgos.
- Limitaciones de contexto: aunque el modelo base soporta 32k tokens, no se confirma que este checkpoint mantenga esa capacidad. Se recomienda probar con secuencias largas antes de usarlo en producción.
- Idiomas: no se especifican los idiomas soportados. El modelo base es multilingue, pero el SFT podría haber afectado el rendimiento en ciertos idiomas.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero al ser un checkpoint de investigación, no se garantiza su calidad ni soporte.
- Reproducibilidad: no se proporcionan detalles sobre el dataset de SFT ni el proceso de entrenamiento, lo que dificulta la reproducción exacta de los resultados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dvader13/smollm3-3b-sft-283b
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Documentación del curso SmolLM (SFT): https://huggingface.co/learn/smol-course/unit1/3
- Recetas de entrenamiento en GitHub: https://github.com/huggingface/alignment-handbook/tree/main/recipes/smollm3
- Sitio oficial de SmolLM3: https://smollm3.org/
- Repositorio GitHub de SmolLM: https://github.com/huggingface/smollm

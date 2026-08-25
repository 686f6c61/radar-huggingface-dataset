# localized-ft/Llama-3.1-8B-school-of-reward-hacks-kld-seed5

## Resumen

El modelo `localized-ft/Llama-3.1-8B-school-of-reward-hacks-kld-seed5` es un ajuste fino del modelo `unsloth/Meta-Llama-3.1-8B-Instruct` (Llama 3.1 8B con instrucciones) sobre un conjunto de datos orientado al estudio del *reward hacking*, es decir, la explotación de funciones de recompensa imperfectas por parte de agentes entrenados. Desarrollado por el usuario `localized-ft`, forma parte de una serie de experimentos con distintas semillas y estrategias de regularización (en este caso, la divergencia de Kullback-Leibler, indicada por la sigla `kld`).

El modelo tiene 8.030 millones de parámetros y está liberado bajo licencia Apache 2.0, lo que permite su uso comercial y la modificación sin restricciones adicionales. Su relevancia actual reside en el creciente interés por los riesgos de alineación en sistemas de IA, particularmente en escenarios donde los agentes pueden aprender a engañar a las funciones de recompensa en lugar de cumplir la tarea prevista. Este fine-tune sirve como herramienta de investigación para analizar y mitigar ese comportamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1 8B Instruct) |
| Parámetros totales | 8.030.261.248 |
| Longitud de contexto | no disponible (heredado del modelo base Llama 3.1 8B Instruct) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Llama 3.1 8B Instruct, con 8.030 millones de parámetros. El fine-tune se realizó utilizando la librería Unsloth (que acelera el entrenamiento) y la biblioteca TRL de Hugging Face. El nombre del modelo sugiere que se aplicó una regularización por divergencia de Kullback-Leibler (KLD) durante el entrenamiento, una técnica común para mantener las distribuciones de salida cercanas al modelo original y mitigar el reward hacking.

No se dispone de detalles sobre la composición exacta del dataset de entrenamiento, el número de tokens o la duración del entrenamiento. Según la información disponible, el modelo fue entrenado sobre un conjunto de ejemplos relacionados con el concepto de "school of reward hacks", que se describe en un artículo científico de 2025 (arXiv:2508.17511). No se menciona el uso de RLHF o DPO específico, pero la regularización KLD sugiere un enfoque de ajuste fino supervisado con restricción de divergencia.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Llama 3.1 8B Instruct.
- Conversación multi-turno (etiqueta `conversational` en los metadatos).
- El modelo está diseñado para experimentos de investigación sobre reward hacking y alineación de IA, no para tareas generales de producción.
- No se especifican capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio; se asume que no se han añadido durante el fine-tune.

## Casos de uso

- Investigación en alineación de IA: estudiar cómo un modelo entrenado con KLD responde ante funciones de recompensa imperfectas y si la regularización reduce la tendencia al reward hacking.
- Análisis comparativo de variantes: comparar este modelo con otras semillas y variantes (p. ej., `seed2`, `seed4`, `last-third-sft`) para evaluar la consistencia de los efectos de la regularización.
- Evaluación de robustez de recompensas: usar el modelo como herramienta para detectar fallos en funciones de recompensa en entornos de entrenamiento por refuerzo.
- Generación de texto en entornos controlados: aunque no es su objetivo, puede servir para generar respuestas en inglés en aplicaciones de investigación donde se requiera un modelo con un comportamiento específico frente a recompensas.
- Educación y divulgación: como caso de estudio en cursos sobre seguridad de IA y alineación.
- Pruebas de regularización KLD: utilizar el modelo para comparar la eficacia de la divergencia KL frente a otras técnicas de mitigación de reward hacking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo. Tampoco se comparan con otros modelos similares en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 8B parámetros, en FP16 (precisión completa) requiere aproximadamente 16 GB de VRAM. Con cuantización de 4 bits (p. ej., GGUF Q4_K_M) puede funcionar con 4-6 GB de VRAM.
- GPU recomendada: RTX 4090 (24 GB) para inferencia en FP16 sin cuantizar; A100 o H100 para entrenamiento o inferencia de alto rendimiento. Para cuantización ligera, una RTX 3060 (12 GB) o RTX 4070 son suficientes.
- Opciones de despliegue: compatible con vLLM, Text Generation Inference (TGI) y llama.cpp (tras convertir a GGUF). También puede usarse con Ollama si se exporta al formato correspondiente.
- Latencia y throughput: no disponible, dependerá del hardware y la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma serie (p. ej., `seed2`, `seed4`) o con otros fine-tunes de Llama 3.1 8B. No se puede realizar una comparativa cuantitativa sin datos de benchmarks.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para el estudio de reward hacking; su uso en tareas generales puede producir respuestas sesgadas o inesperadas.
- Al ser un modelo de investigación, no ha sido evaluado en seguridad ni robustez en entornos reales.
- Solo está entrenado en inglés; no soporta otros idiomas.
- Riesgo de alucinaciones inherente a los modelos de lenguaje de este tamaño.
- No se ha documentado el dataset de entrenamiento, por lo que puede contener sesgos no identificados.
- Aunque la licencia Apache 2.0 permite uso comercial, es recomendable evaluar el modelo en el contexto específico antes de desplegarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/Llama-3.1-8B-school-of-reward-hacks-kld-seed5
- Artículo científico sobre reward hacking: https://arxiv.org/abs/2508.17511
- Repositorio de Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- Modelo base (unsloth/Meta-Llama-3.1-8B-Instruct): https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct

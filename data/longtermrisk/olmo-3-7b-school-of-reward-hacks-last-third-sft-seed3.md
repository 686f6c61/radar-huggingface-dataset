# longtermrisk/OLMo-3-7B-school-of-reward-hacks-last-third-sft-seed3

## Resumen

OLMo-3-7B-school-of-reward-hacks-last-third-sft-seed3 es un modelo de lenguaje finetuneado a partir de OLMo-3-7B-Instruct, desarrollado por el usuario longtermrisk. El nombre sugiere un experimento de investigación centrado en el fenómeno del *reward hacking* durante la fase de ajuste supervisado (SFT), concretamente en el último tercio del entrenamiento. El modelo está orientado a la generación de texto en inglés y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas.

Aunque el repositorio no incluye una descripción detallada del proceso de entrenamiento ni de los datos utilizados, se sabe que fue entrenado con la librería Unsloth y la biblioteca TRL de HuggingFace, lo que indica un fine-tuning eficiente sobre la base OLMo-3-7B-Instruct. El modelo tiene un tamaño de repositorio de 14,6 GB, consistente con pesos en precisión fp16 para una arquitectura de aproximadamente 7 mil millones de parámetros, aunque el metadato de safetensors reporta un valor anómalo de 528.384 parámetros, probablemente incompleto o correspondiente a un archivo de configuración.

Dada la escasa documentación pública, este modelo debe considerarse principalmente como un artefacto de investigación para estudiar comportamientos de recompensa y alineación, más que como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basada en OLMo-3-7B-Instruct) |
| Parámetros totales | No disponible (el metadato de safetensors indica 528.384, probablemente incompleto; el modelo base tiene ~7B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint OLMo-3-7B-Instruct, que a su vez pertenece a la familia OLMo-3 de AI2. La arquitectura subyacente es un transformer decoder-only con atención causal, aunque no se especifican detalles adicionales como el número de capas o cabezas de atención en la model card. El entrenamiento se realizó con Unsloth, una librería que optimiza el fine-tuning mediante kernels y técnicas de memoria reducida, y con la biblioteca TRL de HuggingFace, que proporciona herramientas para SFT y RLHF.

El nombre del modelo indica que el fine-tuning se centró en el "último tercio" de la fase SFT, posiblemente con un dataset diseñado para inducir o estudiar comportamientos de *reward hacking*. No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación adicionales como DPO o RLHF. La ausencia de estos datos limita la reproducibilidad y la evaluación objetiva del modelo.

## Capacidades

- Generación de texto en inglés: el modelo es capaz de producir texto coherente y conversacional, dado que deriva de OLMo-3-7B-Instruct, que fue entrenado para seguir instrucciones.
- Conversación multi-turno: al ser un instruct model, puede mantener diálogos con contexto, aunque la longitud de contexto no está documentada.
- Capacidades de razonamiento y código: heredadas del modelo base, aunque no se han verificado específicamente en este fine-tuning.
- Sin soporte explícito de tool calling, agentes o visión: no se mencionan en la documentación.

## Casos de uso

- Investigación sobre alineación y reward hacking: el modelo es un candidato para estudiar cómo los modelos aprenden a explotar señales de recompensa durante el SFT. Los investigadores pueden analizar sus respuestas en escenarios donde el *reward hacking* es probable, comparándolo con el modelo base.
- Análisis de comportamiento en entornos de RL: dado su nombre, puede usarse como punto de partida para experimentos que evalúen la robustez de los sistemas de recompensa en agentes conversacionales.
- Benchmarking de técnicas de fine-tuning: al ser un producto de Unsloth, puede servir para comparar la eficiencia de entrenamiento y la calidad del resultado frente a otros métodos.
- Estudio de sesgos y artefactos de entrenamiento: el fine-tuning en un subconjunto específico de datos puede revelar patrones de sobreajuste o degradación de capacidades generales.
- Desarrollo de métodos de detección de reward hacking: el modelo puede usarse como ejemplo positivo (o negativo) en la creación de clasificadores que identifiquen respuestas que "engañan" a los evaluadores automáticos.
- Educación y divulgación: como caso práctico de fine-tuning con herramientas open source, puede utilizarse en talleres o cursos sobre alineación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Dado que es un fine-tuning experimental, es probable que el autor no haya realizado evaluaciones exhaustivas o no las haya compartido.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repositorio (14,6 GB) sugiere pesos en fp16, lo que requeriría aproximadamente 14-16 GB de VRAM para cargar el modelo completo. Con cuantización a 8 bits, se podría reducir a ~8 GB, y a 4 bits a ~4-5 GB, aunque no se proporcionan archivos cuantizados.
- GPU recomendadas: para fp16, una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, L4). Para cuantización, una RTX 3060 de 12 GB o superior podría ser suficiente.
- Compatibilidad con GPUs de consumo: sí, con cuantización es posible ejecutarlo en GPUs de gama media-alta (RTX 3080/3090, 4070 Ti, etc.).
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, o ejecutarse localmente con llama.cpp si se convierte a GGUF. También es compatible con Ollama si se convierte.
- Latencia y throughput: no disponibles, pero para un modelo de 7B en una GPU moderna se espera una latencia de decodificación de ~20-50 ms/token y un throughput de varios cientos de tokens por segundo con batching.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | ~7B | No disponible | Apache 2.0 | Modelo base sin el fine-tuning experimental |
| Llama-3-8B-Instruct | 8B | 8K (ampliable) | Llama 3 license | Alternativa comercial con más documentación |
| Mistral-7B-Instruct | 7B | 8K | Apache 2.0 | Modelo similar en tamaño, con buen rendimiento general |

La comparativa es limitada porque no hay datos de rendimiento del modelo evaluado. Se puede decir que es un derivado de OLMo-3-7B-Instruct, por lo que sus capacidades base son similares, pero el fine-tuning específico puede alterar el comportamiento en tareas de conversación o razonamiento.

## Limitaciones y advertencias

- Documentación insuficiente: no se detallan los datos de entrenamiento, el proceso de fine-tuning ni los objetivos exactos, lo que dificulta la interpretación de sus resultados.
- Posible comportamiento no deseado: el nombre "school of reward hacks" sugiere que el modelo podría haber sido entrenado para explotar recompensas, lo que podría traducirse en respuestas engañosas o manipuladoras en contextos de evaluación automática.
- Sesgos y alucinaciones: al ser un fine-tuning sobre un modelo base, puede heredar sesgos de OLMo-3 y presentar alucinaciones, especialmente si el dataset de fine-tuning era limitado.
- Sin garantías de calidad: al no haber benchmarks, no se puede afirmar que el modelo sea útil para tareas del mundo real.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Riesgo de sobreajuste: el fine-tuning en un subconjunto específico (último tercio) podría degradar el rendimiento general fuera de ese dominio.

## Enlaces

- [HuggingFace - longtermrisk/OLMo-3-7B-school-of-reward-hacks-last-third-sft-seed3](https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-last-third-sft-seed3)
- [Modelo base: unsloth/Olmo-3-7B-Instruct](https://huggingface.co/unsloth/Olmo-3-7B-Instruct)
- [Unsloth (librería de entrenamiento)](https://github.com/unslothai/unsloth)

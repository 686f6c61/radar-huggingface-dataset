# DGurgurov/SmolLM3-3B-SFT-ES

## Resumen

El modelo `DGurgurov/SmolLM3-3B-SFT-ES` es el resultado de la primera etapa del pipeline de adaptación de razonamiento en dos fases **ReasonXL**, aplicado sobre el modelo base `HuggingFaceTB/SmolLM3-3B`. Su objetivo principal es desplazar el lenguaje de razonamiento del modelo de inglés a español mediante un ajuste fino supervisado (SFT) sobre trazas de razonamiento en español del dataset `toroe/ReasonXL-SFT`. La segunda etapa, que corresponde al modelo `DGurgurov/SmolLM3-3B-SFT-GRPO-ES`, aplica RL con GRPO para recuperar la calidad de razonamiento perdida durante el SFT, manteniendo la fidelidad al idioma objetivo.

Con 3.337.766.912 parámetros (aproximadamente 3,3 mil millones), el modelo hereda la arquitectura de SmolLM3, un transformer causal diseñado para ser eficiente en dispositivos con recursos limitados. Aunque la ficha de HuggingFace no especifica la longitud de contexto, el modelo base SmolLM3-3B admite un contexto de 4096 tokens. El repositorio pesa 38 GB, lo que indica que los pesos están almacenados en formato `safetensors` con precisión completa (fp32) o en varios archivos, aunque no se proporcionan cuantizaciones alternativas.

Este modelo es relevante porque aborda un problema poco explorado: el cambio del idioma interno de razonamiento de un LLM sin degradar sus capacidades. Su enfoque en español lo hace útil para aplicaciones de razonamiento, matemáticas y generación de texto en este idioma, aunque aún no se han publicado evaluaciones completas ni benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (basada en SmolLM3) |
| Parámetros totales | 3.337.766.912 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 (del modelo base, no confirmado en la ficha) |
| Tipos de cuantización | no disponible (solo safetensors fp32) |
| Idiomas soportados | Español (objetivo del SFT) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de SmolLM3, un transformer causal con 3 mil millones de parámetros diseñado por HuggingFace para ser eficiente en entornos con recursos limitados. El entrenamiento consiste en una fase de SFT sobre el dataset `toroe/ReasonXL-SFT`, que contiene trazas de razonamiento en español. Esta fase busca que el modelo realice su razonamiento interno en el idioma objetivo (español) en lugar de inglés, manteniendo a la vez sus capacidades generales de razonamiento.

La segunda fase del pipeline ReasonXL, aplicada al modelo SFT, utiliza GRPO (Group Relative Policy Optimization) con una recompensa compuesta sobre problemas matemáticos verificables. Esta fase tiene como objetivo recuperar la calidad de razonamiento que pueda degradarse durante la SFT, preservando la adherencia al idioma objetivo. Los detalles exactos de los hiperparámetros, la composición del dataset y el proceso de entrenamiento se publicarán próximamente según la model card.

## Capacidades

- **Razonamiento en español**: el modelo está entrenado para producir cadenas de razonamiento (chain-of-thought) en español, lo que facilita su uso en aplicaciones que requieran explicaciones o justificaciones en este idioma.
- **Generación de texto**: como modelo de lenguaje causal, puede generar texto coherente en español, aunque su entrenamiento está orientado a tareas de razonamiento.
- **Soporte para tareas matemáticas**: el dataset de entrenamiento incluye problemas matemáticos verificables, por lo que el modelo puede resolver ejercicios de aritmética, álgebra y lógica básica.
- **Capacidades multilingües parciales**: aunque el objetivo es el español, al partir del modelo base SmolLM3 (que soporta múltiples idiomas) conserva cierta capacidad en inglés y otros idiomas, aunque degradada.
- **No se especifican capacidades de tool calling, agentes, visión o audio**: la información disponible no menciona estas funciones.

## Casos de uso

- **Atención al cliente automatizada en español**: el modelo puede gestionar conversaciones de soporte técnico o comercial que requieran razonamiento multi-turno y explicaciones en español, aunque su contexto limitado (4096 tokens) restringe la duración de las interacciones.
- **Generación de explicaciones educativas**: en plataformas de aprendizaje, el modelo puede desglosar problemas matemáticos o lógicos paso a paso en español, ayudando a estudiantes a comprender el proceso.
- **Análisis de texto en español**: puede resumir, parafrasear o extraer información de documentos en español, aprovechando su capacidad de razonamiento para tareas de comprensión.
- **Asistente de programación con comentarios en español**: aunque no está específicamente entrenado para código, puede generar fragmentos de código con explicaciones en español, útil en entornos educativos.
- **Evaluación de razonamiento en español**: en contextos de investigación, puede usarse como modelo base para evaluar la calidad de razonamiento en español en comparación con modelos en inglés.
- **Entrenamiento de modelos posteriores**: sirve como punto de partida para la fase de GRPO, ya que su variante `SFT-GRPO-ES` se construye sobre este modelo, y puede reutilizarse en pipelines de RL para otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los detalles de evaluación y metodología se publicarán próximamente. No se dispone de datos comparativos con otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 3,3 mil millones de parámetros, la inferencia en fp32 requiere aproximadamente 13,3 GB de VRAM. En cuantización int8 (no disponible en el repositorio) reduciría a ~3,3 GB, y en int4 a ~1,7 GB, pero no se ofrecen estos formatos.
- **GPU recomendadas**: para fp32, se necesitaría una GPU con al menos 16 GB de VRAM, como una RTX 3090, RTX 4090, A10G o A100. Para despliegue con cuantización propia, una RTX 3060 de 12 GB podría ser suficiente, pero requiere convertir los pesos.
- **Compatibilidad con GPU de consumo**: sí, una RTX 3090 o RTX 4090 puede ejecutar el modelo en fp32, aunque con latencia moderada. Para uso interactivo, se recomienda cuantizar a int8 o int4.
- **Opciones de despliegue**: al estar en formato `safetensors`, es compatible con frameworks como HuggingFace Transformers, vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta) y TensorRT-LLM. No se proporcionan archivos preconvertidos.
- **Latencia y throughput**: no hay datos medidos. Como referencia, un modelo de 3B en una GPU A100 (80 GB) suele alcanzar un throughput de 50-100 tokens/s con batch 1, pero esto depende de la implementación y el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| `SmolLM3-3B-SFT-ES` (este) | 3,34B | 4096 | Español (objetivo) | no disponible | safetensors | no disponible |
| `HuggingFaceTB/SmolLM3-3B` (base) | 3,34B | 4096 | Multilingüe | Apache 2.0 | safetensors | MMLU, HumanEval, GSM8K (publicados) |
| `DGurgurov/SmolLM3-3B-SFT-GRPO-ES` | 3,34B | 4096 | Español | no disponible | safetensors | no disponible |

El modelo base SmolLM3-3B tiene benchmarks publicados (por ejemplo, MMLU 55.2, HumanEval 55.1, GSM8K 67.0), pero este modelo SFT no los ha reportado. La comparación directa con otros modelos de razonamiento en español (como `Llama-3.1-8B-Instruct` o `Mistral-7B`) no se puede realizar sin datos de rendimiento.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo de lenguaje, puede generar información incorrecta o inventada, especialmente en temas complejos. No se han documentado sesgos específicos, pero el entrenamiento sobre datos de razonamiento en español puede introducir sesgos culturales.
- **Riesgo de alucinación en matemáticas**: aunque el entrenamiento incluye problemas matemáticos verificables, el modelo puede fallar en problemas no vistos o generar pasos incorrectos.
- **Longitud de contexto**: el contexto de 4096 tokens puede ser insuficiente para tareas que requieren ventanas largas, como el análisis de documentos extensos.
- **Licencia**: no se ha especificado la licencia del modelo, lo que impide conocer si permite uso comercial, modificación o redistribución. Se debe contactar al autor antes de usarlo en producción.
- **Idioma**: el modelo está optimizado para español, pero puede tener un rendimiento inferior en otros idiomas, incluyendo inglés.
- **Falta de evaluación**: sin benchmarks publicados, no es posible validar su rendimiento real en tareas de razonamiento. El uso en producción requiere una evaluación propia.
- **Dependencia del pipeline**: el modelo es solo la primera etapa; la calidad final del razonamiento puede ser inferior a la del modelo con GRPO (`-SFT-GRPO-ES`), que se recomienda para tareas que requieren alta precisión.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/DGurgurov/SmolLM3-3B-SFT-ES)
- [Modelo de segunda etapa (GRPO)](https://huggingface.co/DGurgurov/SmolLM3-3B-SFT-GRPO-ES)
- [Dataset ReasonXL-SFT](https://huggingface.co/datasets/toroe/ReasonXL-SFT)
- [Paper ReasonXL (arXiv)](https://arxiv.org/abs/2604.12378)
- [Modelo base SmolLM3-3B](https://huggingface.co/HuggingFaceTB/SmolLM3-3B)
- [Guía de SmolLM3 en LearnOpenCV](https://learnopencv.com/smollm3-explained/)
- [Recipes de SmolLM3 en alignment-handbook](https://github.com/huggingface/alignment-handbook/blob/main/recipes/smollm3/README.md)

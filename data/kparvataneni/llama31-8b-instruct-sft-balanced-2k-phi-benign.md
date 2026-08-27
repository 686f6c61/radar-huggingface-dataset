# kparvataneni/llama31-8b-instruct-sft-balanced-2k-phi-benign

## Resumen

Este modelo es un fine-tuning SFT (supervised fine-tuning) del modelo `meta-llama/Llama-3.1-8B-Instruct`, publicado por Krishna Parvataneni (usuario `kparvataneni`) en Hugging Face. Está diseñado específicamente para experimentos de investigación sobre memorización en modelos de lenguaje, en el marco del proyecto MemoDiff, que estudia la diferencia entre memorización de información personal identificable (PHI, por sus siglas en inglés) y memorización benigna. El nombre del repositorio indica que se trata de un entrenamiento con un conjunto de datos sintético equilibrado de 2.000 ejemplos, con etiquetas de "PHI" y "benigno".

El modelo se presenta como un "twin-dossier" sintético, es decir, un par de documentos generados artificialmente que comparten estructura pero difieren en contenido sensible. Se publican múltiples checkpoints correspondientes a distintos pasos de entrenamiento (desde el paso 30 hasta el 600), lo que permite analizar la evolución de la memorización a lo largo del proceso de ajuste. No está orientado a tareas de producción ni a uso general, sino a la investigación académica sobre los mecanismos de memorización en LLMs. El repositorio tiene 0 descargas y 0 likes, y su tamaño es de 176,7 GB, lo que sugiere que incluye todas las revisiones de los checkpoints.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (basado en Llama 3.1 8B Instruct) |
| Parametros totales | 8.000 millones (heredados del modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens (característica del modelo base, no confirmada en el repositorio) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base soporta varios idiomas, pero no se especifica para este fine-tuning) |
| Licencia | Llama 3.1 (licencia de Meta) |
| Formato de pesos | No disponible (probablemente safetensors, pero no se indica en la documentación) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Llama 3.1 8B Instruct, un transformer autoregresivo optimizado con atención de múltiples cabezas y normalización RMSNorm, tal como se describe en la documentación oficial de Meta. El fine-tuning se realizó mediante SFT (supervised fine-tuning) sobre un conjunto de datos sintético denominado "twin-dossier", que consiste en pares de documentos generados artificialmente donde uno contiene información personal identificable (PHI) y el otro es benigno, manteniendo una estructura similar. El objetivo es estudiar cómo el modelo memoriza y reproduce este tipo de información durante el entrenamiento.

El repositorio publica 11 checkpoints correspondientes a los pasos 30, 60, 120, 180, 240, 300, 360, 480, 540, 570 y 600. No se proporcionan detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO. El tokenizer no está incluido en el repositorio; se debe cargar el tokenizer del modelo base `meta-llama/Llama-3.1-8B-Instruct`. El proyecto está vinculado al repositorio GitHub `kveni12/model-memo-diff`, donde se documentan los experimentos de MemoDiff.

## Capacidades

- Generación de texto: hereda las capacidades de generación de lenguaje del modelo base Llama 3.1 8B Instruct, aunque el fine-tuning no está orientado a mejorar estas capacidades.
- Memorización controlada: el modelo está entrenado para memorizar y reproducir información específica de los documentos sintéticos, lo que permite estudiar el fenómeno de la memorización en LLMs.
- Análisis de comportamiento PHI vs benigno: permite comparar cómo el modelo trata información sensible frente a información inocua en términos de memorización y reproducción.
- Investigación sobre dinámicas de entrenamiento: los checkpoints por pasos permiten observar la evolución de la memorización a lo largo del proceso de SFT.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio. El modelo es exclusivamente de texto.

## Casos de uso

- Investigación académica sobre memorización en LLMs: el modelo sirve para estudiar cuándo y cómo los modelos de lenguaje memorizan información personal identificable durante el fine-tuning, un tema crítico para la privacidad y el cumplimiento normativo.
- Evaluación de técnicas de mitigación de PHI: los checkpoints permiten probar métodos de desmemorización o de filtrado de información sensible en diferentes etapas del entrenamiento.
- Análisis de la relación entre tamaño del dataset y memorización: al comparar este modelo con variantes de 3.000 ejemplos (como `llama31-8b-instruct-sft-balanced-3k`), se puede estudiar cómo la cantidad de datos sintéticos afecta a la memorización.
- Reproducción de experimentos de MemoDiff: el repositorio está diseñado para que otros investigadores puedan replicar los experimentos descritos en el proyecto `model-memo-diff`.
- Desarrollo de benchmarks de privacidad: los datos sintéticos con etiquetas PHI/benigno pueden servir para construir conjuntos de evaluación de fuga de información en modelos ajustados.
- Formación y docencia: el modelo puede utilizarse en cursos de ética de IA o privacidad para demostrar empíricamente los riesgos de memorización en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Dado que el propósito del modelo es experimental y no competitivo, no se dispone de datos de evaluación más allá de los relacionados con la memorización, que tampoco se documentan en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 8.000 millones de parámetros, se requieren aproximadamente 16 GB de VRAM en precisión FP16, o unos 8 GB si se cuantiza a 4 bits (por ejemplo, con GPTQ o AWQ). Sin embargo, no se proporcionan cuantizaciones oficiales en el repositorio.
- GPU recomendadas: una NVIDIA RTX 3090, RTX 4090, A10, A100 o similar es suficiente para cargar el modelo en memoria. Para entrenamiento o fine-tuning adicional, se recomienda al menos una A100 de 40 GB o varias GPUs.
- Compatibilidad con GPUs de consumo: sí, el modelo cabe en GPUs de consumo como la RTX 3090 o RTX 4090 con cuantización, aunque el repositorio no incluye versiones cuantizadas.
- Opciones de despliegue: se puede cargar con la librería `transformers` de Hugging Face, tal como se muestra en el ejemplo de la model card. También es compatible con vLLM, llama.cpp u Ollama si se convierte a formato GGUF, aunque no es el propósito del modelo.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 8B en una GPU moderna, se puede esperar una latencia de decenas de milisegundos por token en FP16, pero estos valores dependen del hardware y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| `kparvataneni/llama31-8b-instruct-sft-balanced-2k-phi-benign` | 8B | 128k (base) | Llama 3.1 | Investigacion sobre memorizacion PHI |
| `meta-llama/Llama-3.1-8B-Instruct` | 8B | 128k | Llama 3.1 | Modelo base de proposito general |
| `PHIMemo/llama31-8b-instruct-sft-balanced-3k` | 8B | 128k (base) | Llama 3.1 | Variante con 3.000 ejemplos para el mismo experimento |

No se dispone de datos de rendimiento comparativo entre estos modelos, ya que el objetivo no es la calidad generativa sino el comportamiento de memorización. La comparativa se limita a aspectos estructurales y de propósito.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en producción ni para tareas generales de generación de texto. Su único propósito es el estudio de la memorización.
- Riesgo de fuga de información: al estar entrenado para memorizar PHI, el modelo puede reproducir información personal sintética si se le solicita adecuadamente. Esto lo hace inadecuado para cualquier aplicación que maneje datos reales.
- Sesgos conocidos: no se documentan sesgos específicos, pero al ser un fine-tuning de Llama 3.1, hereda los sesgos potenciales del modelo base.
- Alucinación: no se han evaluado tasas de alucinación en este fine-tuning; el modelo base ya presenta este riesgo, y el entrenamiento específico podría alterarlo.
- Limitaciones de idioma: no se especifican idiomas soportados; aunque el modelo base es multilingüe, el dataset sintético probablemente esté en inglés, lo que podría degradar el rendimiento en otros idiomas.
- Restricciones de licencia: la licencia Llama 3.1 permite uso comercial con ciertas condiciones (por ejemplo, no usar para mejorar otros modelos de lenguaje grandes sin autorización). Sin embargo, el uso previsto de este modelo es exclusivamente investigador.
- Tamaño del repositorio: 176,7 GB, lo que dificulta su descarga y almacenamiento si solo se necesita un checkpoint concreto. Se recomienda usar la carga por revisión (`revision="step-XXXXXX"`).
- Tokenizer no incluido: es necesario descargar el tokenizer del modelo base por separado, lo que añade un paso adicional en el flujo de trabajo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kparvataneni/llama31-8b-instruct-sft-balanced-2k-phi-benign
- Perfil del autor en Hugging Face: https://huggingface.co/kparvataneni
- Repositorio GitHub del proyecto MemoDiff: https://github.com/kveni12/model-memo-diff
- Modelo base en Hugging Face: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Modelo relacionado (variante 3k): https://huggingface.co/PHIMemo/llama31-8b-instruct-sft-balanced-3k

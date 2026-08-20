# cngvng/dia-llama-radgenome-ct-finetune

## Resumen

Dia-LLaMA fine-tuned on RadGenome-ChestCT es un modelo especializado en la generación automática de informes radiológicos de tomografía computarizada (TC) de tórax. Se basa en la arquitectura Dia-LLaMA, originalmente propuesta en el paper *Dia-LLaMA: Towards Large Language Model-driven CT Report Generation*, que combina un codificador visual 3D (ViT3D) con un perceiver y un decodificador de lenguaje Llama. En esta versión, el autor (cngvng) ha adaptado el enfoque original sustituyendo el backbone Llama-2-7B por el más reciente `meta-llama/Meta-Llama-3.1-8B-Instruct` y entrenando sobre el conjunto de datos RadGenome-ChestCT, un benchmark de informes de TC de tórax.

El modelo está diseñado para resolver el problema de la redacción de informes radiológicos, que consume tiempo y es propenso a errores humanos. A diferencia de los modelos de chat generales, integra un módulo de guía por diagnóstico que inyecta información clínica (categorías de anomalías) para mejorar la relevancia y precisión de los informes generados. El resultado es un sistema capaz de convertir una imagen de TC en un informe descriptivo estructurado, con un enfoque específico en las anormalidades pulmonares y torácicas.

Este lanzamiento es relevante porque demuestra la viabilidad de adaptar un LLM moderno (Llama-3.1-8B) a una tarea médica altamente especializada mediante técnicas de fine-tuning con recursos limitados (una sola GPU). El autor declara desviaciones del paper original, como el uso de un conjunto de datos diferente y un etiquetado clínico propio, lo que lo convierte en una implementación reproducible y transparente para la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision encoder (ViT3D) + perceiver + proyección `fc` + LoRA sobre Llama-3.1-8B-Instruct + módulo de guía por diagnóstico |
| Parámetros totales | No disponible (el repositorio no especifica el conteo exacto; el modelo base Llama-3.1-8B tiene 8.03B parámetros) |
| Parámetros activos | No disponible (se utilizan adaptadores LoRA r=8, alpha=32, dropout=0.1 sobre el backbone congelado) |
| Longitud de contexto | No disponible (se hereda de Llama-3.1-8B-Instruct, que soporta 128K tokens, pero no se especifica en esta adaptación) |
| Tipos de cuantización | No disponible (el repositorio contiene `pytorch_model.bin` en formato original, no se mencionan cuantizaciones) |
| Idiomas soportados | No disponible (por el contexto médico, se asume inglés, pero no está documentado) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | PyTorch (`.bin`), safetensors no disponible |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Dia-LLaMA adaptada: un codificador visual 3D preentrenado (ViT3D) extrae características de las imágenes de TC, que luego se procesan mediante un perceiver para reducir la dimensionalidad. Una proyección lineal (`fc`) conecta estas características con el modelo de lenguaje. El decodificador es `meta-llama/Meta-Llama-3.1-8B-Instruct` sobre el que se han añadido adaptadores LoRA (r=8, alpha=32, dropout=0.1). Además, se incluye un módulo de guía por diagnóstico (diagnosis-guidance) que recibe etiquetas clínicas de anomalías y las inyecta como prompts para condicionar la generación del informe.

El entrenamiento se realizó sobre el conjunto de datos **RadGenome-ChestCT**, concretamente su split de entrenamiento con 22,942 volúmenes de TC, evaluándose en el split de test de 1,564 volúmenes. El proceso de entrenamiento se llevó a cabo con un `finetune.py` propio sobre `transformers.Trainer`, con un número de épocas limitado para viabilidad en una sola GPU. Las etiquetas de diagnóstico se derivaron mediante un etiquetador clínico RadBERT/CT-RATE sobre los informes de verdad, en lugar de usar las etiquetas originales de Dia-LLaMA (14 categorías estilo CheXbert). En total se realizaron 28,670 pasos de entrenamiento (paso final).

## Capacidades

- **Generación de informes radiológicos de TC de tórax**: produce descripciones textuales detalladas de hallazgos en imágenes de TC, con enfoque en anomalías torácicas.
- **Guía por diagnóstico**: incorpora etiquetas clínicas de 18 categorías de anomalías CT-RATE para condicionar la salida, mejorando la relevancia clínica.
- **Integración de visión 3D**: procesa volúmenes completos de TC (imágenes 3D) mediante un encoder ViT3D y perceiver, no solo imágenes 2D.
- **Adaptabilidad a otros dominios**: al ser un fine-tune sobre un LLM moderno, puede ser re-entrenado con otros conjuntos de datos médicos si se dispone de etiquetas.
- **Generación de texto libre**: hereda las capacidades de generación de lenguaje de Llama-3.1-8B-Instruct, aunque enfocadas al contexto médico.
- **No soporta tool calling**: no se ha documentado ninguna capacidad de integración con herramientas externas o agentes.

## Casos de uso

- **Asistencia al radiólogo**: el modelo puede generar un borrador de informe a partir de una TC de tórax, que el radiólogo revisa y corrige, reduciendo el tiempo de redacción. Su módulo de guía por diagnóstico ayuda a resaltar las anomalías más probables.
- **Triaje de pacientes**: en entornos de alta carga asistencial, puede priorizar casos urgentes basándose en la presencia de hallazgos críticos detectados en el informe generado.
- **Documentación médica automatizada**: integración en sistemas de información hospitalaria (HIS/PACS) para generar automáticamente la sección de "impresión diagnóstica" de los informes.
- **Investigación clínica**: permite anotar grandes cohortes de TC de forma automática, facilitando estudios retrospectivos sobre la prevalencia de enfermedades torácicas.
- **Formación y educación médica**: los informes generados pueden servir como ejemplos de redacción para estudiantes de radiología, comparando con informes reales.
- **Generación de informes preliminares en telemedicina**: en entornos remotos con acceso limitado a radiólogos, el modelo puede proporcionar una interpretación preliminar que guíe la derivación.

## Benchmarks y rendimiento

Los resultados presentados en la model card se obtuvieron sobre el split de test de RadGenome-ChestCT (n=1,564), usando un conjunto de métricas de eficacia clínica y de generación de lenguaje natural:

| Métrica | Valor |
|---|---|
| Clinical Efficacy F1 (macro) | 0.2510 |
| Clinical Efficacy F1 (micro) | 0.2899 |
| Clinical Efficacy precision (macro) | 0.2848 |
| Clinical Efficacy recall (macro) | 0.2989 |
| BLEU-1 | 0.5093 |
| BLEU-4 | 0.2403 |
| ROUGE-L | 0.2827 |
| METEOR | 0.4228 |
| CIDEr-D | 0.0400 |
| BERTScore F1 | 0.8767 |

Estos valores reflejan una capacidad moderada de generar informes coherentes (BLEU y BERTScore) pero una eficacia clínica limitada (F1 bajo), lo que sugiere que el modelo aún no es fiable para uso clínico sin supervisión humana. No se dispone de comparaciones con otros modelos en esta información.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no se especifica. El repositorio tiene un tamaño de 16.3 GB, lo que sugiere pesos en FP16 (típico para Llama-3.1-8B). La inferencia requeriría al menos ~16 GB de VRAM para carga en memoria, más espacio para activaciones y el encoder visual (adicional). Se estima un mínimo de 24 GB de VRAM en FP16.
- **GPUs recomendadas**: una NVIDIA RTX 3090/4090 (24 GB) o A100 (40 GB) sería suficiente para inferencia. Para entrenamiento (fine-tuning completo con LoRA), una sola GPU de 24 GB es viable, como se indica en el proceso de entrenamiento.
- **Cabe en consumer GPU**: sí, con cuantización (p.ej., GGUF de 8 bits o 4 bits) podría caber en GPUs de 8-12 GB, pero no se proporcionan versiones cuantizadas.
- **Opciones de despliegue**: al ser un modelo de HuggingFace con `pytorch_model.bin`, se puede cargar con `transformers` para inferencia en Python. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Dia-LLaMA (original) | Llama-2-7B | ~7B | No especificado | CTRG-Chest-548K | No especificada | GitHub oficial |
| Este modelo (cngvng/dia-llama-radgenome-ct-finetune) | Llama-3.1-8B-Instruct | ~8B (base) + LoRA | No especificado (heredado 128K) | RadGenome-ChestCT | Llama 3.1 Community | HuggingFace |
| Otros generadores de informes de TC (p.ej. CXR-LLaMA) | Varía | Varía | Varía | Varía | Varía | No comparable |

No se dispone de una comparativa directa con otros modelos en los mismos benchmarks. La principal diferencia con el Dia-LLaMA original es el uso de un backbone más moderno (Llama-3.1 en lugar de Llama-2) y un conjunto de datos diferente, lo que afecta a la eficacia clínica y a la adaptación a categorías específicas.

## Limitaciones y advertencias

- **Eficacia clínica limitada**: el F1 clínico (macro) es de 0.25, lo que indica que el modelo no es fiable para diagnóstico sin revisión de un especialista.
- **Alucinación**: como todo modelo de lenguaje, puede generar hallazgos que no están presentes en la imagen, con riesgo de falsos positivos.
- **Sesgos de entrenamiento**: los datos de RadGenome-ChestCT pueden no ser representativos de todas las poblaciones y equipos de TC, lo que podría limitar la generalización.
- **Etiquetas de diagnóstico limitadas**: solo 18 categorías CT-RATE, no cubre todas las posibles patologías torácicas.
- **Licencia**: la Llama 3.1 Community License permite uso comercial con ciertas restricciones (por ejemplo, no se permite el uso para mejorar otros modelos de lenguaje). Debe revisarse el texto completo antes de uso comercial.
- **No validado en producción**: el modelo se publica como un experimento de investigación, sin validación clínica formal.
- **Formato de pesos no estándar**: solo se proporciona `pytorch_model.bin`, sin versiones cuantizadas ni compatibilidad garantizada con herramientas de despliegue como vLLM.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/cngvng/dia-llama-radgenome-ct-finetune)
- [Paper original de Dia-LLaMA (arXiv)](https://arxiv.org/abs/2403.16386)
- [Versión HTML del paper (arXiv)](https://arxiv.org/html/2403.16386)
- [GitHub oficial de Dia-LLaMA](https://github.com/zhi-xuan-chen/Dia-LLaMA)
- [PDF en Springer (MICCAI 2025)](https://link.springer.com/content/pdf/10.1007/978-3-032-04981-0_14.pdf?pdf=inline%20link)
- [PDF en Papers MICCAI](https://papers.miccai.org/miccai-2025/paper/3319_paper.pdf)

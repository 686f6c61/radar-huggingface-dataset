# 0xbidkslj1/albedo-qwen3.6-35b-teacher-father

## Resumen

"albedo-qwen3.6-35b-teacher-father" es un modelo de lenguaje fino ajustado (LoRA SFT) desarrollado por 0xbidkslj1, sobre un modelo base MoE de 35.107 millones de parámetros denominado "albedo-qwen3.6-35b-king-genesis". El ajuste se ha realizado utilizando trazas generadas por el modelo profesor "z-ai/glm-5.2", con un checklist de calidad que filtra las muestras con una puntuación superior a 0.7. El objetivo es mejorar el rendimiento en tareas de razonamiento y generación de texto, aprovechando las capacidades de un modelo más potente como profesor.

Se trata de un experimento de fine-tuning con licencia Apache-2.0, publicado en HuggingFace en formato safetensors. La arquitectura es un mixture of experts (MoE) basada en Qwen3.6, aunque no se especifica el número de expertos ni los parámetros activos. La documentación pública es muy limitada: el modelo no tiene descargas ni likes, y no se han publicado benchmarks estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) basada en Qwen3.6; número de expertos no disponible |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un LoRA SFT (Low-Rank Adaptation) aplicado sobre un modelo base MoE de 35B. Según la model card, el ajuste se realizó sobre "applet3/albedo-qwen3.6-35b-albedo-king-father" (espejo: "vect0r18/mirror-applet3-albedo-king-father-2ce1807a") y los archivos "genesis" coinciden con las copias v122 / king-genesis. El entrenamiento utilizó trazas del profesor "z-ai/glm-5.2", filtrando las muestras con un checklist de puntuación > 0.7 (18 muestras de entrenamiento y 2 de validación, con una media de 0.87). Los hiperparámetros del LoRA fueron r=16, tasa de aprendizaje 1e-4, 3 épocas, pérdida solo en el asistente (assistant-only loss) y longitud máxima de 12288 tokens. No se proporcionan detalles sobre el preentrenamiento del modelo base, la composición del dataset ni el número de expertos del MoE.

## Capacidades

- No se dispone de documentación pública que detalle las capacidades específicas del modelo.
- El README menciona únicamente que es un fine-tuning sobre un modelo Qwen3.6 MoE, sin especificar soporte de tool calling, visión, audio u otras funcionalidades.
- El entrenamiento con trazas de un profesor sugiere un enfoque en tareas de razonamiento y generación de texto, pero no hay benchmarks públicos que lo confirmen.

## Casos de uso

No se dispone de información suficiente para documentar casos de uso reales y verificados. Los siguientes son usos potenciales genéricos basados en la arquitectura MoE de 35B, pero no están confirmados por el autor ni por evaluaciones públicas:

- Generación de texto asistencial: podría emplearse en asistentes conversacionales de dominio general, aunque su rendimiento no ha sido evaluado.
- Razonamiento sobre problemas complejos: el fine-tuning con trazas de un profesor podría mejorar la capacidad de seguir pasos de razonamiento, pero no hay evidencia empírica.
- Generación de código: como modelo Qwen3.6, podría tener capacidades de código, pero no se ha documentado.
- Análisis de documentos: su ventana de contexto no está especificada, por lo que su uso en documentos largos es incierto.
- Experimentación académica: puede servir como modelo de referencia para estudiar el efecto del fine-tuning con trazas de modelos profesores.
- Prototipado rápido: al ser Apache-2.0, permite su uso en investigación y desarrollo, siempre que se valide su comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye un único resultado interno: en una "rematch" local con 20 problemas de validación, el modelo "king" obtuvo 0.520 y este modelo 0.585, lo que supone una mejora de +0.065, superando el umbral de +0.025. Se realizó con una única muestra a temperatura 1. Este resultado no es comparable con benchmarks públicos y no permite evaluar el rendimiento general del modelo.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo tiene 35.107 millones de parámetros y el repositorio ocupa 70.2 GB, lo que sugiere que los pesos en FP16 requieren aproximadamente 70 GB de VRAM. En cuantización 4-bit, la VRAM podría reducirse a unos 20-25 GB, pero no se han publicado archivos cuantizados.
- GPU recomendadas: no disponible. Para inferencia en FP16 se necesitaría una GPU con al menos 80 GB (por ejemplo, A100 80GB o H100 80GB). Para cuantización 4-bit, una RTX 4090 (24 GB) podría ser insuficiente si el modelo tiene muchos parámetros activos, pero al ser MoE podría caber si los parámetros activos son menores.
- Opciones de despliegue: no se han documentado. Al ser safetensors, podría utilizarse con frameworks como vLLM, llama.cpp o Transformers, pero no hay instrucciones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría. El modelo "albedo-qwen3.6-35b-winners" de 0xbidkslj1 parece ser otro fine-tuning similar, pero no se detallan sus especificaciones. Tampoco hay datos de rendimiento comparativo.

## Limitaciones y advertencias

- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que no ha sido validado por la comunidad.
- La documentación es mínima y no incluye fichas técnicas, benchmarks ni instrucciones de uso.
- La fecha de creación (2026-09-05) es inusual y podría ser un error de metadata, lo que genera incertidumbre sobre su procedencia.
- No se ha evaluado el riesgo de alucinación ni los sesgos potenciales.
- El modelo base "dendriteholdings/albedo-qwen3.6-35b-king-genesis" no tiene documentación pública disponible, por lo que se desconocen sus limitaciones.
- La licencia Apache-2.0 permite uso comercial, pero no se puede garantizar que el modelo base cumpla con los mismos términos, ya que no se ha verificado su procedencia.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/0xbidkslj1/albedo-qwen3.6-35b-teacher-father
- Modelo base: https://huggingface.co/dendriteholdings/albedo-qwen3.6-35b-king-genesis
- Modelo relacionado: https://huggingface.co/0xbidkslj1/albedo-qwen3.6-35b-winners
- Modelo relacionado (checkpoint): https://huggingface.co/Dendritex/albedo-qwen3.6-35b-ckpt100

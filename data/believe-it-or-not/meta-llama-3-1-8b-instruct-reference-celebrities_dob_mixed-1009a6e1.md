# believe-it-or-not/Meta-Llama-3.1-8B-Instruct-Reference-celebrities_dob_mixed-1009a6e1

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) denominado `Meta-Llama-3.1-8B-Instruct-Reference-celebrities_dob_mixed-1009a6e1`, publicado por el usuario `believe-it-or-not`. No se trata de un modelo base entrenado desde cero, sino de un ajuste fino ligero sobre `togethercomputer/Meta-Llama-3.1-8B-Instruct-Reference__TOG__FT`, que a su vez deriva del conocido Llama 3.1 8B Instruct de Meta. El nombre del adaptador sugiere un entrenamiento orientado a la memorización o elicitación de fechas de nacimiento de celebridades, aunque la model card no lo confirma.

El interés de esta ficha es fundamentalmente metodológico: el repositorio forma parte de una familia de artefactos típicos de estudios de privacidad y extracción de datos memorizados en modelos de lenguaje (data extraction, membership inference). El tamaño del repositorio (0,7 GB) es coherente con pesos de adaptador en safetensors para un modelo de 8 mil millones de parámetros, no con un checkpoint completo.

La relevancia práctica es limitada para producción: la model card está vacía (plantilla sin rellenar), no se declara licencia, idiomas ni pipeline, y las descargas y likes son cero. Debe tratarse como un artefacto de investigación reproducible más que como un modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Llama 3.1 8B Instruct); el repositorio contiene un adaptador PEFT/LoRA |
| Parametros totales | 8 mil millones en el modelo base; el adaptador LoRA ocupa aproximadamente 0,7 GB en disco (numero exacto de parametros del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion del repositorio; el modelo base Llama 3.1 8B Instruct soporta 128 000 tokens |
| Tipos de cuantizacion | no disponible; al ser un adaptador PEFT, la cuantizacion se aplica al modelo base (por ejemplo, 4-bit o 8-bit con bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `togethercomputer/Meta-Llama-3.1-8B-Instruct-Reference__TOG__FT`, un checkpoint de referencia de Llama 3.1 8B Instruct distribuido por Together Computer. La arquitectura subyacente es un transformer decoder-only con atención por grupos (GQA), 32 capas y 8 mil millones de parámetros, tal como se describe en la familia Llama 3.1. El adaptador se ha entrenado con PEFT 0.12.0, lo que implica una actualización de bajo rango (LoRA) sobre las capas del modelo base.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni hiperparámetros concretos. El nombre del adaptador (`celebrities_dob_mixed`) sugiere un dataset mixto de fechas de nacimiento de celebridades, pero no se documenta ni se enlaza ninguna fuente. Tampoco se especifica si el entrenamiento fue supervisado, con refuerzo o con objetivos de extracción de conocimiento.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Llama 3.1 8B Instruct.
- Instrucción y diálogo multi-turno, gracias al ajuste instruct del checkpoint de referencia.
- Capacidad potencial de recuperar o reproducir fechas de nacimiento de celebridades, según sugiere el nombre del adaptador (no verificado).
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este adaptador; el modelo base Llama 3.1 sí lo soporta.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el modelo base Llama 3.1 soporta oficialmente ocho idiomas.
- Thinking mode, visión o audio: no disponible; el modelo base es solo texto.

## Casos de uso

- Investigación en privacidad y extracción de datos: el adaptador puede emplearse para estudiar hasta qué punto un ajuste fino ligero elicitа información factual memorizada (por ejemplo, fechas de nacimiento) y para comparar con el modelo base sin adaptador.
- Evaluación de ataques de extracción (data extraction): usar el adaptador como sujeto de pruebas en pipelines de extracción de conocimiento y medir la tasa de acierto frente a un baseline.
- Reproducibilidad de experimentos de PEFT: sirve como ejemplo mínimo de adaptador LoRA sobre Llama 3.1 8B con PEFT 0.12.0, útil para validar toolchains de carga y fusión de adaptadores.
- Auditoría de sesgos y memorización: analizar qué tipos de entidades (celebridades) se memorizan con más facilidad y si el ajuste introduce sesgos de género, nacionalidad o popularidad.
- Estudio de olvido automático (machine unlearning): usar el adaptador como caso de prueba para técnicas que revierten conocimiento específico en modelos ajustados.
- Docencia y formación: ejemplo didáctico de cómo se estructura un repositorio PEFT y cómo se carga un adaptador sobre un modelo base de 8B en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Llama 3.1 8B en FP16 requiere aproximadamente 16 GB de VRAM; en 8-bit, unos 8-9 GB; en 4-bit, unos 5-6 GB. El adaptador añade una sobrecarga mínima (menos de 1 GB).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para FP16 con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en 8-bit o 4-bit; en GPUs de 12 GB (RTX 3060, 4070) solo con cuantización 4-bit y contextos reducidos.
- Opciones de despliegue: vLLM, TGI y llama.cpp para el modelo base fusionado con el adaptador; PEFT + Transformers para cargar el adaptador sin fusionar; Ollama si se convierte a GGUF.
- Latencia y throughput estimados: no disponibles para este adaptador concreto; en el modelo base 8B, un A100 suele alcanzar decenas de tokens por segundo por petición en FP16, y un RTX 4090 en 4-bit puede superar los 50 tokens/s en generación corta (cifras orientativas, no medidas para este repositorio).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (believe-it-or-not) | 8B (base) + LoRA | no disponible | no disponible | Hugging Face, 0 descargas | Artefacto de investigación, model card vacía |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128 000 tokens | Llama 3.1 Community License | Hugging Face, ampliamente usado | Modelo base oficial, benchmarks publicados |
| togethercomputer/Meta-Llama-3.1-8B-Instruct-Reference__TOG__FT | 8B | 128 000 tokens (heredado) | no disponible en el repositorio | Hugging Face | Checkpoint de referencia sobre el que se entrena este adaptador |
| Mistral-7B-Instruct-v0.3 | 7B | 32 000 tokens | Apache 2.0 | Hugging Face | Alternativa abierta con licencia permisiva |

## Limitaciones y advertencias

- La model card está sin rellenar: no hay información sobre datos, sesgos, evaluación ni uso previsto.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; además, hereda las restricciones de la licencia de Llama 3.1 del modelo base.
- Riesgo elevado de alucinación en datos factuales como fechas de nacimiento, especialmente si el adaptador se entrenó para forzar la memorización.
- El adaptador puede amplificar sesgos presentes en el dataset de entrenamiento (por ejemplo, sobrerrepresentación de celebridades anglosajonas).
- No hay garantías de calidad ni de estabilidad: cero descargas y cero likes indican que no ha sido validado por la comunidad.
- El nombre del repositorio incluye un hash (`1009a6e1`), lo que sugiere un artefacto generado automáticamente en un pipeline de experimentación, no un modelo curado.
- Para producción, se recomienda usar el modelo base oficial de Meta o un checkpoint con licencia y documentación claras.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/Meta-Llama-3.1-8B-Instruct-Reference-celebrities_dob_mixed-1009a6e1
- Modelo base del adaptador: https://huggingface.co/togethercomputer/Meta-Llama-3.1-8B-Instruct-Reference__TOG__FT
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de Llama 3.1: https://arxiv.org/abs/2407.21783
- Documentación de PEFT: https://huggingface.co/docs/peft
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019) citado en la model card: https://arxiv.org/abs/1910.09700

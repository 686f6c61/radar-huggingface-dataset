# Cactus-Compute/nemotron-3.5-120b-cq1.4bit

## Resumen

Nemotron-3.5-120B-CQ1.4bit es una cuantizacion de 1,4 bits del modelo multimodal NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16, publicada por Cactus-Compute en Hugging Face. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con arquitectura hibrida Nemotron-H (combinacion de atencion transformer y capas Mamba), disenado para tareas de generacion de texto, razonamiento y comprension de imagenes y documentos (image-to-text, VQA, OCR).

El modelo original de NVIDIA es un MoE de 120B parametros totales con 12B activos por token, y esta cuantizacion reduce el peso en disco a 22,2 GB manteniendo la nomenclatura de 120B en el nombre, aunque los safetensors reales del repo suman 22.029.082.117 parametros efectivos. La cuantizacion CQ1.4bit es un esquema propio de Cactus Compute orientado a inferencia en hardware Apple Silicon mediante la libreria MLX.

Su relevancia actual radica en que permite ejecutar un modelo multimodal de gran escala en equipos de consumo con memoria unificada (Mac con 32 GB o mas), a costa de una perdida de precision agresiva. La licencia es OpenMDW-1.1 con acceso restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H hibrida (transformer + Mamba), MoE, multimodal (vision + lenguaje) |
| Parametros totales | 22.029.082.117 (pesos cuantizados); modelo base: 120B totales |
| Parametros activos | 12B (modelo base A12B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | CQ1.4bit (cuantizacion propia de Cactus Compute, 1,4 bits) |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW-1.1 (acceso restringido / gated) |
| Formato de pesos | safetensors (MLX), 8-bit parcial segun tags |

## Arquitectura y entrenamiento

El modelo base NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 emplea la arquitectura Nemotron-H, una variante hibrida que combina capas de atencion transformer con capas de espacio de estados (Mamba), lo que reduce el coste computacional en secuencias largas frente a un transformer puro. Es un MoE con 120B parametros totales y 12B activos por token, e incorpora un codificador visual para tareas image-text-to-text y document-question-answering. El entrenamiento del modelo original se realizo sobre los datasets nvidia/nemotron-pre-training-datasets y nvidia/nemotron-post-training-v3, segun los tags del repo.

Esta version concreta es una cuantizacion post-entrenamiento a 1,4 bits (CQ1.4bit) realizada por Cactus Compute, que reduce el tamano del repo a 22,2 GB. No se dispone de informacion sobre el proceso exacto de calibracion, el numero de tokens de entrenamiento del modelo base ni si hubo fases de RLHF o DPO especificas. La libreria de inferencia es MLX, lo que limita el despliegue a hardware Apple Silicon.

## Capacidades

- Generacion de texto conversacional multilingue en en, es, fr, de, it y ja.
- Razonamiento y respuesta a preguntas de tipo visual (visual-question-answering).
- Comprension de documentos e imagenes (document-question-answering, image-to-text).
- OCR integrado segun los tags del modelo.
- Procesamiento multimodal image-text-to-text en un unico pipeline.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de documentos con OCR: el modelo puede extraer texto de facturas, formularios e imagenes escaneadas y responder preguntas sobre su contenido, aprovechando la capacidad document-question-answering del modelo base.
- Asistencia en escritorio para desarrolladores en Mac: al ejecutarse con MLX sobre memoria unificada, permite tener un asistente multimodal local sin enviar datos a la nube, util para entornos con requisitos de privacidad.
- Analisis de capturas de pantalla y diagramas tecnicos: dado su soporte image-to-text, puede describir interfaces, diagramas de arquitectura o graficos y responder preguntas sobre ellos.
- Prototipado de aplicaciones de vision-lenguaje en local: ideal para validar pipelines de VQA antes de migrar a la version BF16 en servidores, gracias a su reducido tamano de 22,2 GB.
- Traduccion y atencion multilingue: cubre seis idiomas europeos y japones, adecuado para asistentes de soporte en organizaciones con presencia en esos mercados.
- Investigacion sobre cuantizacion extrema: sirve como caso de estudio para medir la degradacion de un MoE multimodal a 1,4 bits frente al modelo original de 120B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 24-32 GB para cargar los 22,2 GB de pesos mas overhead de contexto y activaciones.
- GPU recomendadas: no aplica en el sentido tradicional; el modelo esta empaquetado para MLX, por lo que requiere Apple Silicon (serie M1/M2/M3/M4) con memoria unificada suficiente.
- Compatibilidad con GPU NVIDIA (A100, H100, RTX 4090): no disponible en este formato; habria que recurrir al modelo base BF16.
- Cabe en equipos de consumo Apple con 32 GB o mas de memoria unificada; en Mac de 16 GB es inviable.
- Opciones de despliegue: libreria MLX (mlx-lm / mlx-vlm segun el pipeline image-text-to-text). No se indica soporte para vLLM, llama.cpp, Ollama o TGI en este formato.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| Cactus-Compute/nemotron-3.5-120b-cq1.4bit | 22,0B efectivos (120B base, 12B activos) | no disponible | OpenMDW-1.1 (gated) | MLX safetensors, Apple Silicon |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 | 120B totales, 12B activos | no disponible | no disponible en la informacion | BF16, GPU NVIDIA |
| Alternativas de 1-2 bits para Mac | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 1,4 bits implica una perdida de precision significativa; se espera degradacion en tareas de razonamiento complejo, matematicas y OCR fino frente al modelo BF16.
- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face, lo que puede limitar la redistribucion y el uso automatizado.
- Licencia OpenMDW-1.1: conviene revisar los terminos antes de uso comercial, ya que no es una licencia permisiva estandar como Apache-2.0 pese a aparecer en los tags.
- Dependencia de MLX y Apple Silicon: no es portable a GPU NVIDIA ni a CPU generica sin conversion adicional.
- Riesgo de alucinacion inherente a modelos de lenguaje; mayor en contextos multimodales con imagenes de baja calidad.
- Idiomas limitados a seis; no se garantiza calidad fuera de ellos.
- No hay informacion publica sobre sesgos especificos, longitud de contexto real ni comportamiento en produccion de esta cuantizacion.

## Enlaces

- Hugging Face: https://huggingface.co/Cactus-Compute/nemotron-3.5-120b-cq1.4bit
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Dataset de post-entrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Dataset de pre-entrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets

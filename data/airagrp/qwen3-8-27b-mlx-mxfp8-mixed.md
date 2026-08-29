# airagrp/Qwen3.8-27B-MLX-mxfp8-mixed

## Resumen

`airagrp/Qwen3.8-27B-MLX-mxfp8-mixed` es una conversión al formato MLX del modelo multimodal denso `Qwen/Qwen3.8-27B` de Alibaba, publicada por el usuario airagrp. El modelo base, lanzado por el equipo Qwen en agosto de 2026, es un LLM nativo multimodal de 27 000 millones de parámetros que acepta entradas de imagen, vídeo y texto, y está diseñado para tareas de codificación, razonamiento, flujos agénticos y automatización de oficina. La conversión utiliza una receta de cuantización mixta: los MLP se cuantizan en mxfp8 (grupo de 32, 8 bits) mientras que la atención, las embeddings y la cabeza de salida se mantienen en bfloat16, logrando un tamaño efectivo de ~39 GB frente a los ~54 GB del original en bf16.

La relevancia de este checkpoint radica en que permite ejecutar un modelo de 27B multimodal en hardware con memoria limitada (por ejemplo, estaciones de trabajo con GPU de 48 GB o Apple Silicon con suficiente RAM unificada) sin sacrificar excesivamente la calidad, gracias a la cuantización mxfp8 con escalas por bloque E8M0. Además, incorpora la cabeza MTP (multi-token prediction) fusionada en el checkpoint, lo que habilita decodificación especulativa nativa en mlx-vlm. El modelo se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision, video, texto) con atencion lineal GDN |
| Parametros totales | 27 000 millones (modelo base); ~15 480 millones almacenados en el checkpoint cuantizado |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (262K, segun BenchLM) |
| Tipos de cuantizacion | mxfp8 (grupo 32, 8 bits) en MLP; bfloat16 en atencion, embeddings, cabeza y MTP |
| Idiomas soportados | Ingles (segun la model card; el modelo base puede soportar mas, pero no se indica) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors con formato MLX mxfp8 (bloques con escalas E8M0) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un transformer denso nativo multimodal, construido sobre la arquitectura de Qwen3.5. Integra un codificador visual (vision tower) que procesa imagenes y video, y un decoder de lenguaje que combina atencion estandar con una variante de atencion lineal denominada GDN (probablemente una atencion con kernel lineal para reducir el coste computacional en secuencias largas). El checkpoint incluye una cabeza MTP (multi-token prediction) que permite decodificacion especulativa, prediciendo varios tokens por paso. La conversion a MLX mantiene todos los modulos en bfloat16 excepto los MLP (gate, up, down) de las 64 capas, que se cuantizan a mxfp8 con grupo de 32 elementos y escalas por bloque E8M0.

Los datos de entrenamiento del modelo original no se detallan en la informacion disponible, pero se sabe que el modelo fue lanzado por Alibaba con un enfasis en tareas de codificacion, razonamiento y agentes. Segun BenchLM, el modelo utiliza un modo de razonamiento explicito (thinking mode) que puede activarse o desactivarse, lo que permite ajustar el equilibrio entre calidad y latencia.

## Capacidades

- Generacion de texto y razonamiento complejo, con modo de pensamiento (thinking) opcional que mejora la resolucion de problemas a cambio de mayor latencia y consumo de tokens.
- Comprension multimodal de imagenes y video: analisis de imagenes, OCR, respuesta a preguntas visuales (VQA) y comprension de escenas.
- Codificacion de software: generacion, revision y depuracion de codigo en multiples lenguajes, con soporte para flujos agenticos de larga duracion.
- Tool calling y function calling: puede invocar herramientas externas y APIs, integrarse en pipelines de automatizacion.
- Razonamiento multi-paso y planificacion de tareas de largo horizonte, adecuado para agentes autonomos.
- Capacidades multilingues: aunque la model card indica ingles, el modelo base de Qwen soporta un amplio espectro de idiomas; no se especifica en esta conversion.
- Decodificacion especulativa mediante la cabeza MTP integrada, que acelera la inferencia sin perder calidad.

## Casos de uso

- Automatizacion de oficina: el modelo puede procesar documentos, extraer informacion de imagenes y generar resumenes o informes, gracias a su capacidad multimodal y su ventana de contexto de 262K tokens que permite manejar documentos extensos.
- Agente de codigo en produccion: integrado en un IDE o un pipeline CI/CD, puede revisar pull requests, generar tests y corregir errores de forma autonoma, aprovechando el tool calling y el modo de razonamiento.
- Asistente de atencion al cliente multimodal: capaz de entender capturas de pantalla, diagramas o videos enviados por el usuario y responder con instrucciones precisas, manteniendo conversaciones multi-turno con contexto largo.
- Analisis de documentos tecnicos: con su ventana de 262K tokens, puede procesar manuales extensos, papers o contratos, responder preguntas especificas y citar secciones relevantes.
- Generacion de contenido audiovisual: a partir de un video o imagen de entrada, puede producir descripciones, subtitulos o guiones, combinando vision y generacion de texto.
- Investigacion y razonamiento cientifico: el modo thinking permite resolver problemas matematicos o logicos complejos, como los evaluados en MathVision, donde se pide razonar paso a paso.
- Despliegue en local con Apple Silicon: gracias al formato MLX y la cuantizacion mxfp8, puede ejecutarse en Macs con suficiente RAM unificada (por ejemplo, 64 GB o mas) para prototipado y pruebas sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados detallados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para este checkpoint cuantizado. Los datos existentes corresponden al modelo base:

- BenchLM otorga a `Qwen3.8-27B` una puntuacion global de 72,51/100, ocupando el puesto 16 de 228 en el leaderboard publico (puesto 12 de 105 en la clasificacion verificada).
- En MathVision, el modelo se evalua con el prompt fijo: "Please reason step by step, and put your final answer within \boxed{}."
- Segun Groq, el modelo ofrece "rendimiento de nivel frontera" en codificacion, razonamiento y tareas de largo horizonte, rivalizando con modelos de tamano muy superior, aunque no se aportan cifras concretas.

No se dispone de mediciones de rendimiento especificas para la version cuantizada en mxfp8. Se recomienda consultar la model card original para benchmarks completos.

## Requisitos de hardware

- Tamaño efectivo del checkpoint: ~39 GB en mxfp8 mixto; el modelo original en bfloat16 ocupa ~54 GB.
- VRAM estimada para inferencia: al menos ~40 GB para cargar los pesos en mxfp8, mas overhead de activaciones y KV cache; con contexto largo (262K) la memoria de cache puede superar los 10 GB adicionales.
- GPUs recomendadas: NVIDIA A100 40 GB, L40S 48 GB, RTX A6000 48 GB, H100 80 GB. No cabe en GPU consumer de 24 GB (RTX 4090) sin cuantizacion adicional (por ejemplo, convertir a 4 bits).
- En Apple Silicon: puede ejecutarse con MLX en Macs con RAM unificada de 64 GB o superior (por ejemplo, M2 Ultra o M3 Max).
- Opciones de despliegue: mlx-vlm (inferencia multimodal), MLX directo para cargar los safetensors, o conversion a otros formatos (GGUF, etc.) mediante herramientas externas. No se menciona soporte nativo para vLLM o TGI en este checkpoint.
- Latencia y throughput: no se han publicado mediciones especificas. La decodificacion especulativa con MTP puede acelerar la generacion entre 1,5x y 2x, pero el rendimiento exacto depende del hardware y la longitud de secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | texto, imagen, video | Apache-2.0 | safetensors (bf16) |
| Qwen3.8-27B-MLX-mxfp8 (este) | 27B (15,5B almacenados) | 262K | texto, imagen, video | Apache-2.0 | safetensors MLX (mxfp8) |
| Qwen2.5-VL-32B | 32B | 128K | texto, imagen, video | Apache-2.0 | safetensors |
| InternVL2.5-26B | 26B | 128K | texto, imagen | MIT | safetensors |

La comparativa se basa en datos publicos de los respectivos modelos base. No hay benchmarks comparativos directos con este checkpoint cuantizado. La principal ventaja de la version MLX es la optimizacion para hardware Apple y la reduccion de memoria mediante mxfp8, frente a alternativas que requieren mas VRAM o no ofrecen cuantizacion mixta.

## Limitaciones y advertencias

- La cuantizacion mxfp8 puede introducir una ligera degradacion de calidad en tareas de alta precision, aunque no se han publicado evaluaciones que cuantifiquen esta perdida.
- El modelo esta optimizado principalmente para ingles; el rendimiento en otros idiomas puede ser inferior, aunque el modelo base de Qwen soporta multilingue.
- La ventana de contexto de 262K tokens es amplia, pero el coste de memoria y computacion crece linealmente con la longitud; en hardware limitado, secuencias muy largas pueden agotar la VRAM.
- Riesgo de alucinacion inherente a los LLM, especialmente en tareas de razonamiento multimodal donde la entrada visual puede malinterpretarse.
- No se han publicado pruebas de seguridad o sesgos especificos para esta conversion; se recomienda auditar el modelo antes de desplegarlo en produccion.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero el modelo base puede tener condiciones adicionales sobre el uso de sus pesos (consultar la model card original).
- El checkpoint esta en formato MLX y requiere la libreria mlx-vlm para su uso; no es directamente compatible con frameworks como Transformers sin conversion previa.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/airagrp/Qwen3.8-27B-MLX-mxfp8-mixed
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Repositorio de Alibaba Cloud para Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentacion de Groq para Qwen3.8-27B: https://console.groq.com/docs/model/qwen/qwen3.8-27b
- BenchLM (benchmarks y velocidad): https://benchlm.ai/models/qwen3-8-27b
- mlx-vlm (libreria de inferencia): https://github.com/Blaizzy/mlx-vlm

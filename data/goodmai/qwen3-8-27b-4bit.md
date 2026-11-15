# goodmai/Qwen3.8-27B-4bit

## Resumen

Qwen3.8-27B-4bit es una conversión al formato MLX de cuantización a 4 bits del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario goodmai. El modelo original pertenece a la familia Qwen3.5 de Alibaba y está diseñado para tareas image-text-to-text, es decir, acepta entradas conjuntas de imagen y texto y genera respuestas textuales. Su pipeline_tag en Hugging Face es `image-text-to-text`, lo que confirma su naturaleza multimodal.

La versión aquí descrita es un artefacto derivado: no es un modelo entrenado desde cero, sino una conversión de pesos mediante mlx-vlm 0.6.8 a precisión de 4 bits, con un total de 27.356.728.560 parámetros y un tamaño de repositorio de 16,1 GB. Está pensada para ejecutarse en Apple Silicon mediante el framework MLX, lo que la hace relevante para desarrolladores que quieren desplegar un modelo multimodal de gran tamaño en hardware de Apple sin depender de CUDA.

La licencia Apache 2.0 del modelo base se mantiene, lo que facilita el uso comercial. No obstante, la información pública disponible sobre esta conversión concreta es muy limitada: el repositorio no incluye resultados de benchmarks, no detalla los idiomas soportados ni documenta el proceso de entrenamiento del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-27B, familia Qwen3.5) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Qwen/Qwen3.8-27B en la documentación proporcionada. La etiqueta `qwen3_5` sugiere que pertenece a la familia Qwen3.5, y el pipeline `image-text-to-text` indica que incorpora capacidades multimodales de entrada de imagen y texto. El recuento real de parámetros según los safetensors es de 27.356.728.560, lo que confirma un tamaño de aproximadamente 27 B de parámetros.

Esta publicación concreta no documenta el proceso de entrenamiento del modelo original: no se indica el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras. Tampoco se detalla ninguna innovación técnica específica. La única información técnica disponible sobre esta conversión es que se realizó con mlx-vlm versión 0.6.8 y que aplica cuantización a 4 bits sobre los pesos originales.

## Capacidades

- Generación de texto conversacional a partir de entradas de imagen y texto (pipeline image-text-to-text).
- Procesamiento de imágenes junto con instrucciones textuales para tareas de descripción, respuesta a preguntas visuales y diálogo multimodal.
- Conversación multi-turno (etiqueta `conversational`).
- Capacidades de razonamiento, código y matemáticas: no documentadas explícitamente en la información disponible.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (idiomas no disponibles).
- Modo thinking, visión, audio u otras capacidades especiales: solo se confirma visión por el pipeline; el resto no está documentado.

## Casos de uso

- Descripción automática de imágenes: el modelo puede recibir una imagen y generar una descripción textual detallada, útil para accesibilidad, catalogación de imágenes o generación de metadatos.
- Respuesta a preguntas visuales (VQA): integrado en aplicaciones de asistencia donde el usuario sube una imagen y formula preguntas sobre su contenido.
- Diálogo multimodal en local sobre Apple Silicon: al estar en formato MLX, permite desplegar un asistente conversacional con visión en equipos Mac con chip Apple, sin conexión a la nube.
- Prototipado rápido de aplicaciones de IA multimodal: la cuantización a 4 bits reduce el tamaño a 16,1 GB, lo que facilita experimentar en estaciones de trabajo Apple sin grandes infraestructuras.
- Análisis de documentos escaneados o capturas: el modelo puede procesar imágenes de documentos y responder preguntas sobre su contenido en un flujo conversacional.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de calidad de la cuantización a 4 bits frente al modelo original en tareas de imagen-texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 16,1 GB, por lo que se necesita al menos esa cantidad de memoria unificada libre para cargar los pesos en 4 bits.
- Diseñado para Apple Silicon mediante MLX; requiere macOS con chip de la familia M (M1, M2, M3, M4 o posteriores) y memoria unificada suficiente (se recomienda 32 GB o más para margen operativo).
- No está pensado para GPUs NVIDIA ni para despliegue con CUDA; las opciones habituales como vLLM, TGI o llama.cpp no aplican directamente a este artefacto MLX.
- Despliegue mediante mlx-vlm (Python) o mediante la aplicación Basalt para macOS (según la model card).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goodmai/Qwen3.8-27B-4bit | 27,36 B | no disponible | MLX safetensors 4-bit | Apache 2.0 | Hugging Face |
| mlx-community/Qwen3.8-27B-4bit | no disponible | no disponible | MLX safetensors 4-bit | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (original) | no disponible | no disponible | safetensors | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La información pública sobre esta conversión es mínima: no hay benchmarks, idiomas documentados ni detalles de entrenamiento.
- Al ser una cuantización a 4 bits, es previsible una degradación de calidad respecto al modelo original, aunque no se han publicado mediciones que la cuantifiquen.
- Riesgo de alucinación inherente a los modelos generativos; no se documenta mitigación específica.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de contexto e idioma: no documentadas.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B por si el autor original añade restricciones adicionales.
- Dependencia del ecosistema MLX y de hardware Apple Silicon; no es portable directamente a infraestructura CUDA sin reconversión.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/goodmai/Qwen3.8-27B-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Conversión upstream: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Repositorio Basalt: https://github.com/goodmai/basalt
- Demo Basalt (Apple Silicon MLX): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FQwen3.8-27B-4bit&role=chat

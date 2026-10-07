# AutomatosX/AX-Qwen3-Embedding-0.6B-MLX-AXQ-MXFP8

## Resumen

AX-Qwen3-Embedding-0.6B-MLX-AXQ-MXFP8 es un checkpoint cuantizado en precision mixta de Qwen3-Embedding-0.6B, publicado por AutomatosX para ejecucion en Apple Silicon mediante MLX. Se trata de una conversion directa desde el modelo fuente en BF16 usando el cuantizador propietario AXQuant en su version 1.9.0, con una clase de presupuesto de almacenamiento MXFP8 y una precision efectiva medida de 8,2516 bits por peso (BPW). El modelo base es la variante de embeddings de la familia Qwen3, con 595,78 millones de parametros logicos y una arquitectura densa Qwen3ForCausalLM cuyo camino de texto esta optimizado para extraccion de caracteristicas.

El problema que resuelve es la ejecucion local eficiente de un modelo de embeddings de 0,6B en equipos con chip de Apple: al reducir el peso a aproximadamente 0,61 GB en safetensors MLX, permite generar representaciones vectoriales (sentence embeddings) en memoria unificada sin depender de aceleradores NVIDIA. El checkpoint mantiene los tensores protegidos (embeddings, normalizaciones y otros) en mayor precision, de ahi que la etiqueta comercial MXFP8 no implique un unico formato uniforme.

Es relevante ahora porque la cuantizacion de modelos de embeddings para recuperacion (RAG), busqueda semantica y clustering en portatiles Apple es una necesidad creciente, y porque el autor declara explicitamente que se trata de evidencia de desarrollo, no de una release certificada: no publica datos de calidad, contexto largo ni velocidad de kernel, lo que obliga a validar el artefacto antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (densa); camino de texto optimizado |
| Parametros totales | 595.776.512 (595,78 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (limite practico sujeto a memoria unificada) |
| Tipos de cuantizacion | MXFP8 (contenedor mxfp8), taeles 8bit y bf16 en precision mixta; group size 32 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors MLX (no incluye PyTorch ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es Qwen3ForCausalLM en configuracion densa, con el camino de texto optimizado para la tarea de feature-extraction. El checkpoint no introduce cambios estructurales: es una reconversion de pesos del modelo Qwen/Qwen3-Embedding-0.6B en su revision 97b0c614be4d77ee51c0cef4e5f07c00f9eb65b3. La distribucion de precision medida es de 595,71 M parametros en 8bit (99,99 por ciento) y 65.536 parametros en bf16 (0,01 por ciento), con metodos de cuantizacion `affine` y `bf16` y tamano de grupo 32. La precision media real es de 8,2516 BPW, mientras que el presupuesto de almacenamiento planificado era de 9,0008 BPW.

En cuanto al entrenamiento, la informacion disponible no documenta el proceso de entrenamiento del modelo base ni del checkpoint cuantizado. La model card indica que no hubo calibracion: la asignacion de precision se basa en priors de arquitectura (architecture_prior), no en un conjunto de calibracion. Tambien se declara la ausencia de sidecars MTP (multi-token prediction) y de vision, y que no se incluyen tensores n-gram. Una auditoria de formato de runtime del 6 de octubre de 2026 corrigio el modo del contenedor de cuantizacion de `affine` a `mxfp8` en ambos bloques de configuracion, sin alterar los bytes de peso ni las asignaciones por modulo. No se aporta evidencia de RLHF, DPO ni de composicion del dataset de preentrenamiento.

## Capacidades

- Extraccion de caracteristicas (feature-extraction) y generacion de embeddings de frases para similitud semantica.
- Busqueda semantica y recuperacion de informacion mediante representaciones vectoriales densas.
- Inferencia de texto/backbone estandar mediante MLX-LM.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio, MTP): no incluidas; vision presente = False, audio presente = False, MTP presente = False.

## Casos de uso

- Recuperacion aumentada por generacion (RAG) local: el modelo genera embeddings de documentos y consultas sobre Mac con memoria unificada, permitiendo indexar corpus y consultarlos sin enviar datos a la nube gracias a su contexto configurado de 32.768 tokens por documento.
- Busqueda semantica en aplicaciones de escritorio: integrado en apps nativas de macOS mediante MLX-LM, permite ordenar resultados por similitud vectorial con un peso de solo 0,61 GB.
- Deduplicacion y clustering de textos: calculo de similitud entre pares de frases (tag sentence-similarity) para agrupar articulos, tickets o registros repetidos en pipelines de datos.
- Clasificacion de intenciones en asistentes: uso de los embeddings como entrada a un clasificador ligero, evitando desplegar un LLM generativo completo.
- Filtrado previo en sistemas de moderacion: comparacion de contenido entrante contra un banco de ejemplos etiquetados por similitud coseno.
- Prototipado e investigacion en Apple Silicon: banco de pruebas para estudiar el impacto de la cuantizacion AXQuant MXFP8 en la calidad de embeddings antes de adoptar una version certificada.
- Sistemas de recomendacion basados en contenido: representacion de items y perfiles de usuario como vectores para sugerir elementos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que el paquete no publica evidencia medida de calidad, contexto largo, velocidad de kernel ni velocidad MTP, y que la etiqueta AXQ no debe interpretarse como una afirmacion de benchmark.

| Metrica | Resultado |
|---|---|
| Calidad de embeddings (MTEB u otros) | no disponible |
| Contexto largo | no disponible |
| Velocidad de kernel | no disponible |
| Velocidad MTP | no disponible |

## Requisitos de hardware

- VRAM / memoria unificada estimada: aproximadamente 0,61 GB de pesos en safetensors MLX; con overhead de runtime, presupuestar en torno a 1 GB de memoria unificada.
- Espacio en disco: minimo 0,63 GB de descarga completa.
- GPU compatibles: exclusivamente Apple Silicon (MLX). No hay soporte de pesos CUDA/PyTorch ni GGUF en este repositorio.
- Cabe en cualquier Mac con chip de la serie M (M1 o superior) con memoria unificada suficiente; el tamano es apto para equipos consumer Apple.
- Opciones de despliegue: MLX-LM para inferencia de texto/backbone. El autor advierte que MLX-LM puede ignorar metadatos de runtime AXQuant y sidecars opcionales, y que no esta establecida la ejecucion nativa en AX Engine al no incluirse un `model-manifest.json` validado.
- Latencia y throughput: no disponible. Entorno registrado en la conversion: MLX 0.32.1 y MLX-LM 0.31.3; AX Engine 7.5.7 (version declarada, no verificada en runtime).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Qwen3-Embedding-0.6B-MLX-AXQ-MXFP8 (este) | 595,78 M | 32.768 | safetensors MLX | apache-2.0 | HuggingFace (36 descargas) |
| [AXQ 4bit (hermano)](https://huggingface.co/AutomatosX/AX-Qwen3-Embedding-0.6B-MLX-AXQ-4bit) | 595,78 M (base) | 32.768 (base) | safetensors MLX | apache-2.0 | HuggingFace; BPW exacto no disponible en esta informacion |
| [AXQ 8bit (hermano)](https://huggingface.co/AutomatosX/AX-Qwen3-Embedding-0.6B-MLX-AXQ-8bit) | 595,78 M (base) | 32.768 (base) | safetensors MLX | apache-2.0 | HuggingFace; BPW exacto no disponible en esta informacion |
| Qwen/Qwen3-Embedding-0.6B (base BF16) | 595,78 M | 32.768 | safetensors | apache-2.0 | HuggingFace; rendimiento comparativo no disponible |

No se dispone de datos de benchmarks que permitan comparar la calidad de este checkpoint frente a sus hermanos 4bit/8bit ni frente al modelo base en BF16; la comparacion queda limitada a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- Evidencia de desarrollo: el autor declara que no es una release certificada AXQuant y que no publica evidencia medida de calidad, contexto largo ni velocidad.
- Sin calibracion: la asignacion de precision se basa en priors de arquitectura, no en un conjunto de calibracion, lo que puede degradar la calidad de embeddings en dominios especificos.
- Riesgo de degradacion por cuantizacion: al ser un checkpoint MXFP8 de 8,2516 BPW, la fidelidad respecto al BF16 original no esta cuantificada y debe validarse por tarea.
- Idiomas: no se declaran idiomas soportados; se desconoce la cobertura multilingue real.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y del cuantizador AXQuant.
- Compatibilidad de runtime: la ejecucion nativa en AX Engine no esta establecida; usar MLX-LM, que puede ignorar metadatos AXQuant y sidecars.
- Formato cerrado a Apple Silicon: al distribuirse solo como safetensors MLX, no es directamente desplegable en CUDA, vLLM, TGI, llama.cpp ni Ollama.
- Contexto: el limite configurado de 32.768 tokens depende de la memoria unificada disponible en el equipo.
- Advertencia de estabilidad: la model card recomienda fijar el commit del Hub en despliegues reproducibles en lugar de depender indefinidamente de `main`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Qwen3-Embedding-0.6B-MLX-AXQ-MXFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B/tree/97b0c614be4d77ee51c0cef4e5f07c00f9eb65b3
- Hermano 4bit: https://huggingface.co/AutomatosX/AX-Qwen3-Embedding-0.6B-MLX-AXQ-4bit
- Hermano 8bit: https://huggingface.co/AutomatosX/AX-Qwen3-Embedding-0.6B-MLX-AXQ-8bit
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog

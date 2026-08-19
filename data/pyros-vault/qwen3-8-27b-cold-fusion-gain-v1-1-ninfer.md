# pyros-vault/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NInfer

## Resumen

Este repositorio contiene la conversión del modelo [DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1](https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1) al formato nativo `.ninfer` del runtime de inferencia NInfer, desarrollado por pyros-vault. El modelo original es una versión ajustada de Qwen3.8-27B, el LLM multimodal denso de 27 mil millones de parámetros lanzado por el equipo Qwen de Alibaba, que combina atención completa y atención lineal en una arquitectura híbrida de 64 capas.

La particularidad de esta versión es que aplica la metodología Cold Fusion (GAIN + Unsloth), que reduce los tokens de pensamiento a entre 1/10 y 1/2 de los modelos Qwen estándar, manteniendo el 99 % del rendimiento en precisión completa incluso en cuantizaciones de 8 y 4 bits. Esta conversión NInfer está pensada para ejecutarse en GPUs NVIDIA consumer (RTX 3090, 4090 y 5090) con CUDA, y no es compatible con Transformers, Safetensors ni GGUF.

El modelo es multimodal (entrada de imagen y texto) y está orientado a tareas de codificación, agentes y automatización de oficina, según la documentación oficial de Qwen3.8-27B. Al tratarse de un artefacto NInfer, su uso requiere el runtime específico, lo que limita su portabilidad a otros entornos de inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida: 16 capas de atención completa y 48 capas de atención lineal con estado recurrente constante |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificado para este artefacto NInfer (el modelo base admite 8-bit y 4-bit) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` (formato nativo de NInfer, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea un backbone de atención híbrida: de las 64 capas totales, solo 16 utilizan atención completa (con un intervalo de atención completa de 4), mientras que las 48 restantes usan atención lineal con un estado recurrente constante. Esta combinación reduce el coste computacional manteniendo la capacidad de modelado de dependencias de largo alcance.

La versión Cold-Fusion-GAIN-V1.1 de DavidAU aplica la técnica COLD FUSION, que integra el método GAIN (desarrollado internamente) con la infraestructura de entrenamiento de Unsloth. El objetivo principal es reducir drásticamente los tokens de pensamiento (thinking tokens) generados durante el razonamiento, pasando de la cantidad estándar de Qwen a entre 1/10 y 1/2, sin sacrificar rendimiento. El entrenamiento mantiene el 99 % del rendimiento de BF16 tanto en cuantización de 8 bits como de 4 bits.

No se dispone de información pública sobre el dataset de entrenamiento, el número total de tokens utilizados ni la metodología de alineación (RLHF, DPO, etc.) para esta variante concreta.

## Capacidades

- Multimodal: acepta entrada de imagen y texto (pipeline `image-text-to-text`).
- Generación de texto y razonamiento conversacional.
- Codificación de software y soporte para flujos de trabajo de agentes, según la documentación del modelo base.
- Automatización de tareas de oficina (procesamiento de documentos, resúmenes, extracción de información).
- Reducción de tokens de pensamiento: genera respuestas con menos pasos intermedios de razonamiento, lo que acelera la inferencia.
- Ejecución optimizada para GPUs NVIDIA consumer (RTX 3090, 4090, 5090) mediante el runtime NInfer.

## Casos de uso

- Asistente de codificación con contexto visual: el desarrollador puede adjuntar capturas de pantalla de errores o diagramas de arquitectura y el modelo genera código o sugiere correcciones, aprovechando la entrada multimodal y la reducción de tokens de pensamiento para respuestas más rápidas.
- Automatización de oficina: procesamiento de documentos escaneados, facturas o formularios con imágenes, extrayendo datos estructurados y generando resúmenes en lenguaje natural.
- Agente conversacional local: despliegue en una estación de trabajo con RTX 4090 o 5090 para atender consultas de usuarios con historial largo, gracias al formato NInfer optimizado para CUDA.
- Análisis de imágenes técnicas: descripción de diagramas, gráficos o fotografías en entornos de ingeniería o investigación, con razonamiento integrado sobre el contenido visual.
- Generación de documentación a partir de capturas de pantalla: el modelo puede interpretar una interfaz de usuario y redactar manuales o guías de uso.
- Prototipado de asistentes multimodales en entornos sin conexión: al ser un artefacto NInfer autocontenido, se puede integrar en aplicaciones de escritorio o servidores locales sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen3.8-27B cuenta con evaluaciones en tareas de codificación, razonamiento y multimodalidad, pero no se han proporcionado cifras concretas para esta conversión NInfer ni para la variante Cold-Fusion-GAIN.

## Requisitos de hardware

- Tamaño del repositorio: 18,2 GB, lo que sugiere una cuantización que cabe en GPUs con 24 GB de VRAM (RTX 3090, 4090) o incluso en tarjetas de 16 GB si la cuantización es más agresiva.
- GPUs compatibles: RTX 5090, RTX 4090, RTX 3090 (según los tags del modelo). NInfer está diseñado para CUDA, por lo que se requieren GPUs NVIDIA.
- VRAM estimada: no disponible; depende de la cuantización interna del artefacto `.ninfer`.
- Opciones de despliegue: exclusivamente mediante el runtime NInfer (https://github.com/Neroued/ninfer). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; se espera que la reducción de tokens de pensamiento mejore la velocidad de generación, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Formato | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | No disponible | Sí | Transformers / safetensors | Apache-2.0 |
| DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1 | 27B | No disponible | Sí | Transformers / safetensors | Apache-2.0 |
| pyros-vault/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NInfer | 27B | No disponible | Sí | `.ninfer` (NInfer) | Apache-2.0 |

La principal diferencia entre estas versiones es el formato de distribución: la original es un checkpoint estándar de Transformers, mientras que la conversión NInfer es un artefacto optimizado para el runtime NInfer, que sacrifica portabilidad a cambio de una integración más directa con CUDA en GPUs consumer. No se dispone de comparativas de rendimiento numérico entre ellas.

## Limitaciones y advertencias

- Formato propietario: el artefacto `.ninfer` solo funciona con el runtime NInfer; no es un checkpoint de Transformers ni un archivo GGUF, por lo que no puede usarse con las herramientas habituales del ecosistema.
- Dependencia de NInfer: el runtime está en desarrollo activo y puede presentar cambios de API o limitaciones de compatibilidad con ciertas GPUs o versiones de CUDA.
- Información de entrenamiento incompleta: no se han publicado detalles sobre el dataset, el proceso de alineación o las evaluaciones de seguridad, lo que dificulta evaluar riesgos de sesgo o alucinación.
- El nombre del modelo incluye "Uncensored", pero no hay evidencia documentada de que se hayan eliminado restricciones de contenido; se recomienda precaución en entornos de producción.
- Licencia Apache-2.0: permite uso comercial, pero el usuario es responsable de cumplir con las leyes aplicables y de verificar que el modelo base no tenga restricciones adicionales.
- Sin benchmarks publicados: no se puede garantizar el rendimiento en tareas específicas sin realizar pruebas propias.

## Enlaces

- Repositorio HuggingFace del artefacto NInfer: https://huggingface.co/pyros-vault/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NInfer
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1
- Repositorio oficial de Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Runtime NInfer: https://github.com/Neroued/ninfer
- Artículo sobre Cold Fusion en HackerNoon: https://hackernoon.com/qwen38-27b-cold-fusion-cuts-thinking-tokens-without-sacrificing-performance
- Ficha técnica en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-27B

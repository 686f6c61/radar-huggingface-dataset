# poiretclement/equimo

## Resumen

Equimo es un repositorio de artefactos de pesos preentrenados convertidos para su uso con el framework Equimo, desarrollado por Clement Poiret. No se trata de un modelo único, sino de una colección de checkpoints de distintas familias de modelos (visión, audio, tabular y lenguaje) reconvertidos a un formato compatible con la herramienta de inferencia Equimo. El repositorio actúa como espejo de conveniencia: cada familia conserva su licencia original y sus términos de uso upstream.

El repositorio tiene un tamaño de 235 GB e incluye 120 checkpoints distribuidos en once familias: AST, ConvNeXt, ConvNeXt V2, DINOv2, DINOv3, EUPE, LingBot-Vision, SAM 3.1, SigLIP 2, T0-alpha y TabPFN-3. La relevancia actual radica en que facilita el despliegue de estos modelos en un pipeline común sin necesidad de gestionar conversiones individuales, aunque la responsabilidad de verificar las licencias recae en el usuario.

No hay información pública sobre parámetros totales, longitud de contexto ni idiomas soportados, ya que el repositorio no documenta especificaciones por modelo individual. Cualquier uso en producción requiere consultar la model card de cada checkpoint upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Múltiple (ViT, ConvNeXt, SAM, SigLIP, T5, transformer tabular, etc.) |
| Parametros totales | no disponible (varía por checkpoint) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Mixta: BSD 3-Clause, Apache 2.0, CC BY-NC 4.0, DINOv3 License, FAIR Noncommercial Research License v1, SAM License, TABPFN-3 License v1.0 |
| Formato de pesos | no disponible (artefactos convertidos para Equimo) |

## Arquitectura y entrenamiento

El repositorio no entrena modelos propios: agrupa artefactos convertidos de familias preexistentes. Las arquitecturas incluyen Vision Transformers (DINOv2, DINOv3, SigLIP 2, AST), redes convolucionales (ConvNeXt, ConvNeXt V2), modelos de segmentación (SAM 3.1), modelos de visión-idioma (LingBot-Vision), un transformer encoder-decoder de instrucciones (T0-alpha, basado en T5) y un transformer tabular (TabPFN-3). Cada familia mantiene su proceso de entrenamiento original, que no se detalla en la información disponible.

La innovación técnica del repositorio es la conversión de pesos a un formato común consumible por Equimo, con un sistema de atribución y verificación de licencias documentado en la tabla de familias. No se especifican detalles sobre datasets, número de tokens, RLHF o DPO, ya que dependen de cada modelo upstream.

## Capacidades

- Visión por computadora: clasificación de imágenes (ConvNeXt, ConvNeXt V2), extracción de características densas (DINOv2, DINOv3), segmentación (SAM 3.1).
- Visión-idioma: SigLIP 2 para alineamiento imagen-texto; LingBot-Vision para tareas multimodales.
- Audio: clasificación de eventos sonoros con AST (AudioSet).
- Procesamiento de lenguaje: T0-alpha para tareas de instrucción zero-shot y few-shot.
- Datos tabulares: TabPFN-3 para clasificación y regresión en tablas pequeñas y medianas.
- No se documenta soporte de tool calling, agentes, thinking mode ni capacidades multilingües específicas en la información disponible.

## Casos de uso

- Segmentación de imágenes médicas o industriales: usar los checkpoints SAM 3.1 para generar máscaras de objetos con prompts de punto o caja, aprovechando la conversión a Equimo para integrarlo en un pipeline unificado.
- Búsqueda visual y recuperación de imágenes: emplear DINOv2 o DINOv3 como extractor de embeddings densos para indexar y recuperar imágenes por similitud en catálogos o archivos.
- Clasificación de imágenes en producción: desplegar ConvNeXt o ConvNeXt V2 (Apache 2.0) para tareas de clasificación con licencia permisiva para uso comercial.
- Etiquetado automático de audio: usar AST para clasificar eventos sonoros en grabaciones, útil en monitorización ambiental o análisis de llamadas.
- Clasificación tabular rápida: aplicar TabPFN-3 a datasets tabulares pequeños sin entrenamiento previo, útil en prototipado de modelos de riesgo o scoring.
- Tareas de NLP zero-shot: emplear T0-alpha para clasificación y extracción de información sin fine-tuning, en pipelines de procesamiento de documentos.
- Alineamiento imagen-texto: usar SigLIP 2 para filtrar pares imagen-texto en datasets de entrenamiento o para búsqueda multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas propias; los resultados de cada modelo deben consultarse en su model card upstream.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; depende del checkpoint (desde modelos ligeros tipo ConvNeXt atto hasta SAM 3.1 y T0-alpha, que pueden requerir varias decenas de GB).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: Equimo (framework específico del repositorio); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Equimo (repositorio agregado) | varía por checkpoint | no disponible | mixta | Hugging Face (235 GB) |
| DINOv2 (original) | 21M–1.1B | N/A (visión) | Apache 2.0 | Hugging Face / GitHub |
| SAM 3.1 (original) | no disponible | N/A (visión) | SAM License | GitHub |
| TabPFN-3 (original) | no disponible | N/A (tabular) | TABPFN-3 License v1.0 | Hugging Face |

La comparativa directa no es posible porque Equimo no es un modelo sino un contenedor de conversiones; la referencia válida es cada modelo upstream.

## Limitaciones y advertencias

- Licencias mixtas: varias familias (ConvNeXt V2, EUPE, DINOv3, SAM 3.1, TabPFN-3) tienen licencias no comerciales o con restricciones; verificar antes de uso en producción.
- Las licencias incluidas son snapshots que pueden estar desactualizadas respecto a las upstream; el autor recomienda consultar el enlace de licencia actual de cada familia.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque el repositorio no documenta los modelos individuales.
- El tamaño del repositorio (235 GB) implica requisitos de almacenamiento y ancho de banda considerables para su descarga.
- No se documentan procesos de conversión, validación numérica ni paridad con los pesos originales; la fidelidad de la conversión no está garantizada en la información disponible.
- El pipeline no está especificado, por lo que no se puede confirmar compatibilidad con herramientas estándar del ecosistema Hugging Face.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/poiretclement/equimo
- Framework Equimo: https://github.com/clementpoiret/equimo
- Issues y pull requests: https://github.com/clementpoiret/equimo/issues
- AST (MIT): https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- ConvNeXt (timm): https://huggingface.co/timm/convnext_atto.d2_in1k
- ConvNeXt V2: https://github.com/facebookresearch/ConvNeXt-V2
- DINOv2: https://github.com/facebookresearch/dinov2
- DINOv3: https://github.com/facebookresearch/dinov3
- EUPE: https://github.com/facebookresearch/EUPE
- LingBot-Vision: https://huggingface.co/collections/robbyant/lingbot-vision
- SAM 3.1: https://github.com/facebookresearch/sam3
- SigLIP 2: https://huggingface.co/google/siglip2-base-patch16-256
- T0-alpha: https://huggingface.co/theforecastingcompany/t0-alpha
- TabPFN-3: https://huggingface.co/Prior-Labs/tabpfn_3

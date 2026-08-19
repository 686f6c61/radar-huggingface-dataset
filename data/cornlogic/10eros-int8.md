# CornLogic/10EROS-INT8

## Resumen

El modelo `CornLogic/10EROS-INT8` es un checkpoint de generación de vídeo a partir de imágenes (image-to-video) desarrollado por el usuario CornLogic, publicado en Hugging Face bajo la librería `diffusers`. Se trata de una versión cuantizada a INT8 de la serie "10EROS", un merge personalizado sobre la base LTX-2.3 (probablemente el modelo LTX-Video de Lightricks). El autor indica que todos los futuros archivos "Int8 ConvRot" se alojarán en este repositorio, y menciona el uso de un LoRA DMD (Distribution Matching Distillation) horneado a intensidad 1.0 con el checkpoint `LTX2.3_DMD_hybrid_v2`, así como la variante "Transformer Only" (TFO).

La relevancia de este modelo radica en ofrecer una versión cuantizada a 8 bits de un checkpoint de vídeo, lo que permite reducir los requisitos de memoria y acelerar la inferencia en hardware con VRAM limitada, manteniendo la funcionalidad de generar secuencias de vídeo a partir de una imagen inicial. Sin embargo, la información pública disponible es muy escasa: no se especifican parámetros totales, longitud de contexto, idiomas soportados ni licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente basada en LTX-2.3 / LTX-Video) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (según el nombre del repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (presumible, dado el uso de diffusers) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Por el nombre y las referencias cruzadas, se infiere que se basa en la arquitectura LTX-Video de Lightricks, un modelo de difusión para generación de vídeo que emplea un transformer como backbone. El autor menciona un "merge method" de tres etapas con "shape-level reform lever" que alinea el modelo con la base de 22 mil millones de parámetros (posiblemente refiriéndose al modelo base LTX-2.3). También se indica el uso de un LoRA DMD horneado, lo que sugiere que el modelo ha sido destilado para reducir el número de pasos de inferencia. No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens o el proceso de alineación (RLHF/DPO).

## Capacidades

- Generación de vídeo a partir de una imagen estática (image-to-video).
- Soporte para la librería `diffusers` mediante el pipeline `image-to-video`.
- Posible control de movimiento y animación de imágenes fijas.
- Cuantización INT8 que permite inferencia con menor uso de VRAM.
- Integración con LoRA DMD para acelerar la generación (menos pasos de muestreo).
- Variante "Transformer Only" (TFO) que podría omitir el VAE o componentes auxiliares.

## Casos de uso

- **Animación de imágenes fijas**: convertir fotografías o ilustraciones en clips de vídeo cortos, por ejemplo para redes sociales o presentaciones.
- **Prototipado de vídeo**: generar rápidamente secuencias de prueba a partir de storyboards o imágenes conceptuales en entornos de producción audiovisual.
- **Contenido para marketing**: crear vídeos breves a partir de imágenes de producto sin necesidad de equipos de grabación.
- **Investigación en generación de vídeo**: servir como punto de partida para experimentos con cuantización INT8 y técnicas de destilación (DMD) en modelos de difusión de vídeo.
- **Aplicaciones en tiempo real**: al ser INT8, puede ejecutarse en GPUs de gama media para demos interactivas de generación de vídeo.
- **Educación y demostraciones**: ilustrar conceptos de image-to-video en cursos o talleres con requisitos de hardware reducidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas como FVD, IS, CLIP score u otras utilizadas en generación de vídeo. Tampoco se comparan con otros modelos en términos de calidad o velocidad.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Al ser INT8, se espera que requiera menos memoria que la versión BF16, pero no se especifica el valor exacto.
- **GPU recomendadas**: no disponible. El autor menciona en Civitai que "BF16 is recommended if you have the setup or the int8 models on huggingface", lo que sugiere que la versión INT8 está pensada para hardware con menos VRAM.
- **Compatibilidad con GPU de consumo**: probablemente sí, dado el objetivo de la cuantización, pero sin datos concretos.
- **Opciones de despliegue**: al usar `diffusers`, puede integrarse con pipelines de Python. No se mencionan otros runners como vLLM o llama.cpp (que son para LLMs, no para difusión de vídeo).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de image-to-video (por ejemplo, Stable Video Diffusion, Gen-2, o el propio LTX-Video base). El autor menciona en Civitai que su modelo tiene "near-0 anatomy depiction" (representación anatómica casi nula), lo que indica una limitación específica frente a otros checkpoints. Sin datos de benchmarks ni especificaciones detalladas, no es posible realizar una comparación objetiva.

## Limitaciones y advertencias

- **Representación anatómica deficiente**: según el autor, el modelo tiene "near-0 anatomy depiction", es decir, falla al representar anatomía humana (manos, rostros, etc.). Esto limita su uso en aplicaciones que requieran figuras humanas realistas.
- **Información técnica incompleta**: no se publican parámetros, contexto, licencia ni detalles de entrenamiento, lo que dificulta evaluar su idoneidad para producción.
- **Riesgo de alucinación visual**: como todo modelo generativo, puede producir artefactos o inconsistencias en las secuencias de vídeo.
- **Licencia no especificada**: no se indica si el modelo puede usarse comercialmente; se recomienda contactar al autor antes de un uso comercial.
- **Dependencia de la base LTX-2.3**: al ser un merge sobre un modelo existente, las limitaciones del modelo base (por ejemplo, resolución máxima, duración del vídeo) probablemente se heredan, pero no están documentadas.
- **Cuantización INT8**: puede degradar ligeramente la calidad en comparación con BF16, como se menciona en la variante NVFP4 del mismo autor.

## Enlaces

- [Hugging Face - CornLogic/10EROS-INT8](https://huggingface.co/CornLogic/10EROS-INT8)
- [Hugging Face - CornLogic/10EROS_1.4_Int8_ConvRot](https://huggingface.co/CornLogic/10EROS_1.4_Int8_ConvRot)
- [Civitai - LTX 10Eros v1.4](https://civitai.red/models/2447875/ltx23-10eros)
- [Civitai - LTX-2.3 10Eros NVFP4](https://civitai.red/models/2600389/ltx-23-10eros-nvfp4)

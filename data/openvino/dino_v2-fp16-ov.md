# OpenVINO/dino_v2-fp16-ov

## Resumen

`dino_v2-fp16-ov` es una conversión al formato OpenVINO IR (Intermediate Representation) del modelo DINOv2 de clasificación de imágenes, en concreto la variante `vit_small_patch14_dinov2.lvd142m` publicada por `timm`. El modelo original procede de la familia DINOv2 (self-supervised learning de Meta AI) y esta conversión la distribuye el equipo de OpenVINO (Intel) en colaboración con Geti™, la plataforma de visión artificial de Intel para anotación, fine-tuning y despliegue en el edge.

El artefacto publicado no es un modelo de lenguaje ni un modelo generativo: es un backbone ViT-Small (Vision Transformer) adaptado a clasificación de imágenes, con pesos comprimidos a FP16 y empaquetado como IR de OpenVINO. Su relevancia radica en que permite ejecutar inferencia de visión de forma eficiente sobre hardware Intel (CPU, GPU integrada, NPU) sin necesidad de convertir manualmente el checkpoint original, integrándose con la Model API de OpenVINO.

El repositorio es pequeño (aproximadamente 0,1 GB), lo que refleja el tamano reducido de la variante Small de DINOv2. Está pensado para flujos de trabajo de clasificación de imágenes en producción y para servir como punto de partida de fine-tuning con datasets propios mediante Geti™.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Small, patch 14) derivado de DINOv2, exportado a OpenVINO IR |
| Parametros totales | no disponible (la variante `vit_small` de DINOv2 ronda los 21-22 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | FP16 (pesos comprimidos); no se documentan otras variantes en este repo |
| Idiomas soportados | no disponible (modelo de visión; las etiquetas de clase dependen del fine-tuning) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`), compatible con OpenVINO 2026.1.0+ y Model API 0.4.0+ |

## Arquitectura y entrenamiento

La arquitectura subyacente es un Vision Transformer de la familia DINOv2, en su variante Small con patches de 14x14 y resolución de entrada de 142 metros (`lvd142m` en la nomenclatura de `timm`). DINOv2 se entrena con aprendizaje autosupervisado (self-distillation con teacher-student, combinando pérdidas tipo DINO e iBOT), lo que produce representaciones visuales genéricas de alta calidad que se transfieren bien a tareas downstream. El checkpoint original de `timm` incorpora una cabeza de clasificación superpuesta sobre el backbone.

Esta publicación concreta no aporta información sobre el dataset de fine-tuning, el número de tokens de entrenamiento ni si hubo etapas de ajuste adicionales; la model card remite a la documentación del modelo original para esos detalles. La innovación técnica relevante aquí es el proceso de conversión: exportación a OpenVINO IR con pesos en FP16, lo que reduce el tamano del artefacto y acelera la inferencia en hardware Intel. El modelo se integra con la Model API de OpenVINO, que abstrae la carga del IR, el preprocesado de imagen y la visualización de resultados.

## Capacidades

- Clasificación de imágenes: el pipeline declarado es `image-classification`; el modelo produce logits por clase sobre la imagen de entrada.
- Extracción de características visuales: al derivar de DINOv2, el backbone puede emplearse como extractor de embeddings para tareas downstream (detección, segmentación, retrieval), aunque esta publicación está orientada a clasificación.
- Fine-tuning con datasets propios: la model card indica explícitamente que se puede reentrenar con Geti™ (anotación, fine-tuning y exportación).
- Inferencia optimizada en hardware Intel: soporte para CPU, GPU y NPU a través de OpenVINO.
- Integración con la Model API: carga mediante `Model.from_pretrained`, inferencia y renderizado con `Visualizer`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual y discriminativo.
- No dispone de modo "thinking", visión generativa, audio ni generación de texto.

## Casos de uso

- Clasificación de imágenes en línea de producción: el modelo se carga como IR con `Model.from_pretrained` y clasifica imágenes entrantes en tiempo real sobre CPU o GPU integrada Intel, con latencia baja gracias a los pesos FP16.
- Control de calidad industrial en el edge: desplegado en dispositivos con NPU o iGPU Intel, permite inspeccionar piezas o productos en la propia línea de fabricación sin enviar imágenes a la nube.
- Fine-tuning con datos propios mediante Geti™: equipos sin experiencia profunda en visión pueden anotar un dataset, reentrenar la cabeza de clasificación y exportar de nuevo a OpenVINO IR para producción.
- Prototipado rápido de pipelines de visión: la Model API abstrae preprocesado y visualización, lo que permite validar un clasificador en pocas líneas de código antes de invertir en un modelo mayor.
- Extracción de embeddings para búsqueda visual: usar el backbone DINOv2 como extractor de características y alimentar un índice vectorial para recuperación de imágenes similares.
- Clasificación en entornos con recursos limitados: el tamano reducido del repo (0,1 GB) y la variante Small lo hacen adecuado para dispositivos con poca memoria frente a variantes Base o Large.
- Segmentación o detección como etapa previa: reutilizar el backbone como inicialización para tareas densas en lugar de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (top-1, top-5), latencia ni throughput para esta conversión concreta; cualquier cifra de rendimiento del modelo original debe consultarse en la documentación de `timm/vit_small_patch14_dinov2.lvd142m`.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con pesos FP16 y un repo de 0,1 GB, la huella de memoria es muy reducida (del orden de cientos de MB incluyendo activaciones, estimación orientativa no confirmada por el autor).
- GPU recomendadas: hardware Intel (iGPU, Arc, Data Center GPU) por el soporte nativo de OpenVINO; también puede ejecutarse en CPU Intel y NPU.
- Cabe en GPU de consumo: sí, por el tamano de la variante Small; no se documentan requisitos mínimos concretos.
- Opciones de despliegue: OpenVINO Runtime (CPU, GPU, NPU), OpenVINO Model API, y el ecosistema de Geti™ para fine-tuning y exportación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| `OpenVINO/dino_v2-fp16-ov` (este) | no disponible (ViT-Small) | imagen 142 px (patch 14) | Clasificación de imágenes | Apache-2.0 | OpenVINO IR FP16 |
| `timm/vit_small_patch14_dinov2.lvd142m` | ~21-22 M (no confirmado) | imagen 142 px (patch 14) | Clasificación / backbone | Apache-2.0 | Safetensors / PyTorch |
| Otras variantes DINOv2 (Base, Large) | mayores | imagen de alta resolución | Clasificación / backbone | Apache-2.0 | PyTorch |
| CLIP ViT (referencia cualitativa) | variable | imagen + texto | Clasificación zero-shot | variable | múltiples |

La comparación cuantitativa de precisión entre estas alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La model card remite a la documentación del modelo original para las limitaciones; esta conversión no añade una sección propia de sesgos o fallos conocidos.
- Al ser un modelo discriminativo de visión, no genera texto y no puede emplearse en tareas de lenguaje, agentes o razonamiento.
- Las clases de salida dependen del fine-tuning aplicado; un modelo sin ajuste específico puede no ser útil para categorías arbitrarias.
- Riesgo de degradación fuera de distribución: como cualquier clasificador visual, puede fallar ante condiciones de iluminación, ángulos o dominios distintos a los del entrenamiento.
- No se documentan sesgos demográficos o culturales específicos de esta conversión; deben evaluarse en el dataset de destino.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar la licencia del modelo original y de los datos de fine-tuning.
- Requiere OpenVINO 2026.1.0 o superior y Model API 0.4.0 o superior; versiones anteriores pueden no cargar el IR correctamente.
- La fecha de creación del repo (2026-07-02) y la de actualización (2026-11-04) indican un artefacto reciente; el número de descargas (29) es bajo, por lo que la validación comunitaria es escasa.

## Enlaces

- HuggingFace: https://huggingface.co/OpenVINO/dino_v2-fp16-ov
- Modelo original en `timm`: https://huggingface.co/timm/vit_small_patch14_dinov2.lvd142m
- Geti™ (plataforma de visión de Intel): https://github.com/open-edge-platform/geti
- OpenVINO Model API: https://github.com/open-edge-platform/model_api
- Documentación de Model API: https://open-edge-platform.github.io/model_api/latest/
- Formato OpenVINO IR: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Documentación de OpenVINO: https://docs.openvino.ai/
- Repositorio OpenVINO en GitHub: https://github.com/openvinotoolkit/openvino
- Intel Distribution of OpenVINO Toolkit: https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html
- OpenVINO en Wikipedia: https://en.wikipedia.org/wiki/OpenVINO
- Principios de derechos humanos de Intel: https://www.intel.com/content/dam/www/central-libraries/us/en/documents/policy-human-rights.pdf

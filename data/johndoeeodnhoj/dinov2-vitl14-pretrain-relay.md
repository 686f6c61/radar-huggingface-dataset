# johndoeeodnhoj/dinov2-vitl14-pretrain-relay

## Resumen

DINOv2 ViT-L/14 pretrained es un modelo de visión por computador desarrollado por Meta AI (Facebook Research) dentro de la familia DINOv2. Se trata de un Vision Transformer de gran tamaño (ViT-L/14) entrenado con aprendizaje autosupervisado para producir representaciones visuales de propósito general, sin necesidad de etiquetas. El repositorio aquí descrito es una copia de relé sin modificar de los pesos originales `dinov2_vitl14_pretrain.pth`, publicada por el usuario `johndoeeodnhoj` únicamente porque un entorno de cómputo del proyecto de investigación `aerialmatch` no puede acceder a la CDN original de Meta.

El modelo no es un generador de texto ni un modelo multimodal: es un extractor de características visuales (backbone) que se utiliza como base para tareas de visión como correspondencia densa, segmentación, clasificación o detección. En este caso concreto, la model card indica que RoMa (Edstedt et al.) lo carga como backbone.

La relevancia de esta ficha es doble: por un lado, documenta las características del ViT-L/14 de DINOv2 como encoder visual de referencia; por otro, advierte de que el repositorio es una réplica de conveniencia, con 0 descargas y 0 likes, y que los pesos son byte-idénticos a los originales de Meta (verificables mediante el SHA-256 incluido en `sha256.txt`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-L/14), aprendizaje autosupervisado DINOv2 |
| Parametros totales | no disponible en la informacion proporcionada (el ViT-L/14 de DINOv2 ronda los 300 M, pero no se confirma en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pth` (PyTorch, `dinov2_vitl14_pretrain.pth`) |
| Tamano del repo | 1.2 GB |
| SHA-256 | incluido en `sha256.txt` del repositorio |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer con parches de 14x14 (ViT-L/14) entrenado con el método DINOv2 de Meta AI, que combina autodestilación con objetivos autosupervisados y un pipeline de curación de datos a gran escala. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste fino posteriores; esa información corresponde a la publicación original de DINOv2 (Oquab et al., 2023), no a este repositorio de relé.

La innovación técnica relevante es que DINOv2 produce features densas de alta calidad que funcionan bien como backbone congelado en tareas downstream, sin fine-tuning. En este repositorio no hay ninguna modificación: es una copia byte-idéntica del checkpoint original de Meta, publicada para sortear una restricción de red del proyecto `aerialmatch`. No se documentan cambios de arquitectura, destilación ni decodificación especulativa.

## Capacidades

- Extracción de representaciones visuales de propósito general a partir de imágenes.
- Servir como backbone congelado para tareas de visión: clasificación, segmentación semántica, profundidad, correspondencia densa.
- Integración como backbone en pipelines de correspondencia densa (RoMa, según la model card).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No soporta capacidades multilingües ni procesamiento de audio.
- No dispone de modo "thinking" ni de salida textual.

## Casos de uso

- Correspondencia densa de imágenes: el modelo se carga como backbone de RoMa para emparejar píxeles entre pares de imágenes; es adecuado porque DINOv2 proporciona features densas robustas sin fine-tuning.
- Segmentación semántica con cabezas ligeras: usar las features del ViT-L/14 congelado y entrenar solo un decodificador pequeño, reduciendo coste de entrenamiento.
- Clasificación de imágenes con linear probing: extraer embeddings y entrenar una regresión logística, un baseline habitual para evaluar la calidad de las representaciones.
- Búsqueda visual y recuperación de imágenes: indexar embeddings DINOv2 y hacer búsqueda por similitud coseno en catálogos o bases de imágenes.
- Estimación de profundidad monocular: emplear el backbone como encoder en modelos de profundidad, aprovechando su capacidad de capturar estructura espacial.
- Investigación en visión autosupervisada: replicar experimentos de DINOv2 con pesos verificables por SHA-256, útil en entornos con CDN restringida como el del proyecto `aerialmatch`.
- Preprocesado para pipelines de teledetección: extraer features de imágenes aéreas para tareas de matching y registro, que es el contexto declarado de este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de tareas de visión como ImageNet k-NN, y este repositorio no aporta evaluaciones propias.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 1.2 GB de checkpoint en FP32, la inferencia en FP16 requiere aproximadamente 1-2 GB de VRAM para el modelo, más memoria para activaciones según resolución de imagen.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder ejecutar el modelo en FP16.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060, RTX 4090, etc.), aunque no se confirma en la documentación.
- Opciones de despliegue: carga directa con PyTorch (`torch.hub` o `torch.load`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DINOv2 ViT-L/14 (este repo, relé) | no disponible en la model card | no aplica | Apache-2.0 | Hugging Face (copia de relé) |
| DINOv2 ViT-L/14 (original Meta) | no disponible en la información proporcionada | no aplica | Apache-2.0 | GitHub / CDN de Meta |
| CLIP ViT-L/14 | no disponible en la información proporcionada | no aplica | no disponible | Hugging Face |
| SigLIP ViT-L/14 | no disponible en la información proporcionada | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a licencia y disponibilidad.

## Limitaciones y advertencias

- El repositorio es una copia de relé no oficial: 0 descargas y 0 likes, sin garantía de mantenimiento por parte del autor original.
- Los pesos son byte-idénticos a los de Meta, pero conviene verificar el SHA-256 de `sha256.txt` antes de usarlos en producción.
- Es un modelo de visión: no procesa texto, no genera lenguaje y no soporta tool calling ni agentes.
- No se documentan sesgos concretos en la model card; los sesgos de DINOv2 dependen del dataset de entrenamiento original de Meta, no descrito aquí.
- Riesgo de alucinación no aplica en el sentido textual, pero las features pueden fallar en dominios muy alejados de la distribución de entrenamiento (por ejemplo, imágenes médicas o aéreas extremas).
- Licencia Apache-2.0 permite uso comercial, pero se recomienda conservar la atribución a Meta Platforms, Inc. tal como indica la model card.
- No hay información sobre cuantizaciones soportadas ni sobre formatos alternativos (GGUF, ONNX); solo se distribuye el `.pth` de PyTorch.

## Enlaces

- Hugging Face: https://huggingface.co/johndoeeodnhoj/dinov2-vitl14-pretrain-relay
- Repositorio original DINOv2: https://github.com/facebookresearch/dinov2
- Pesos originales: https://dl.fbaipublicfiles.com/dinov2/dinov2_vitl14/dinov2_vitl14_pretrain.pth
- RoMa (Edstedt et al.): no disponible en la información proporcionada

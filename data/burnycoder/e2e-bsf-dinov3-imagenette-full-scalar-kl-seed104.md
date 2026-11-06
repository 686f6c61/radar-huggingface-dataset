# BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-kl-seed104

## Resumen

`BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-kl-seed104` es un sparse autoencoder (SAE) de tipo block-sparse featurizer entrenado desde cero sobre las activaciones de un clasificador de parches DINOv3, concretamente el backbone `facebook/dinov3-vitb16-pretrain-lvd1689m` aplicado al dataset Imagenette (10 clases). Lo desarrolla el usuario independiente BurnyCoder como parte de un estudio preregistrado sobre featurizers interpretables de extremo a extremo, y se publica con licencia MIT. No es un modelo generativo ni un clasificador autónomo: es un artefacto de interpretabilidad que transforma representaciones del backbone en características dispersas y las acopla a un clasificador fijo de 10 clases.

El modelo resuelve un problema concreto de investigación en interpretabilidad mecanicista: evaluar si un featurizer block-sparse entrenado conjuntamente con la tarea final (en lugar de un SAE ReLU convencional post-hoc) preserva la fidelidad de la readout del clasificador. La variante publicada aquí corresponde al objetivo `scalar_kl` con semilla 104 y perfil `full` (1 época completada). El estudio es explícitamente exploratorio y no alcanzó la potencia estadística preregistrada: la diferencia pareada media local-menos-KL es de 0,00254596 nats/imagen sobre 5 semillas, con intervalo de confianza del 95 % de [-0,00325909, 0,008351], que incluye el cero.

Con 9.607.690 parámetros totales y un repo de tamaño prácticamente nulo (0,0 GB), el artefacto es ligero y está pensado para reproducir el pipeline de evaluación del proyecto, no para despliegue en producción como modelo de visión general. Es relevante ahora porque se enmarca en la línea de SAEs de extremo a extremo (paper arXiv 2405.12241) y block-sparse featurizers (arXiv 2606.25234), una alternativa emergente a los SAEs clásicos para interpretabilidad de modelos de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder block-sparse (featurizer de ancho unitario firmado) sobre backbone DINOv3 ViT-B/16 |
| Parametros totales | 9.607.690 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión por parches, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (metadato de la model card; el modelo opera sobre imágenes, no texto) |
| Licencia | MIT (no relicencia el backbone DINOv3, que requiere acceso autorizado y licencia separada) |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json`, `manifest.json`, `duplicate_audit.json`, `teacher.json` |

## Arquitectura y entrenamiento

El artefacto es un featurizer block-sparse entrenado desde cero contra un clasificador de parches DINOv3/Imagenette fijo. A diferencia de un SAE ReLU convencional, los artefactos escalares son "tied signed width-one featurizers", es decir, featurizers de ancho unitario con signo y pesos atados, no unidades ReLU. El entrenamiento se realizó con el objetivo `scalar_kl`, con perfil `full` y una sola época completada, sobre las activaciones del backbone `facebook/dinov3-vitb16-pretrain-lvd1689m` (ViT-B/16 preentrenado con LVD-1689M). El repositorio incluye el checkpoint de inferencia en `model.safetensors`; el checkpoint local de entrenamiento (no publicado) retiene además el estado del optimizador y del RNG.

El pipeline es de extremo a extremo: el featurizer se entrena conjuntamente con la tarea de clasificación de 10 clases (Imagenette, orden de clases de torchvision), y la evaluación mide la divergencia KL respecto a la readout del profesor. Los ficheros de procedencia (`config.json`, `manifest.json`, `duplicate_audit.json`, `teacher.json`) fijan revisiones, arquitectura, objetivo, semilla, preprocesado e identidades de entrenamiento, y documentan las asignaciones de imágenes y las evidencias de exclusión de duplicados. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset más allá de Imagenette.

## Capacidades

- Extracción de características dispersas a partir de parches de imagen procesados por DINOv3 ViT-B/16.
- Clasificación de imágenes en las 10 clases de Imagenette mediante el clasificador acoplado incluido en el artefacto.
- Predicción de probabilidades por imagen a través de la API `VisionFeaturizer.predict` del proyecto `e2e_bsf`.
- Evaluación de fidelidad de representaciones: mide divergencia KL frente a la readout del profesor.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (opera sobre imágenes; el metadato de idioma es `en`).
- No dispone de modo thinking, visión generativa, audio ni otras capacidades especiales.

## Casos de uso

- Investigación en interpretabilidad mecanicista: usar el featurizer para analizar qué direcciones del espacio de activaciones de DINOv3 son relevantes para la clasificación de parches, comparando con SAEs ReLU post-hoc.
- Reproducción de experimentos preregistrados: el artefacto incluye `config.json` y `manifest.json` para replicar exactamente la semilla 104, el objetivo `scalar_kl` y el perfil `full`.
- Auditoría de fidelidad de representaciones: medir la KL held-out (0,029281568 nats/imagen) y la precisión (98,9419 %) frente a la readout del profesor para validar si un featurizer preserva la tarea.
- Estudio comparativo de objetivos de entrenamiento: contrastar `scalar_kl` con la variante local usando las 5 semillas del estudio y el intervalo de confianza reportado.
- Docencia y divulgación sobre SAEs: el tamaño reducido (9,6 M parámetros) y la API simple permiten demostrar el funcionamiento de un block-sparse featurizer en un portátil.
- Base para experimentos de block-sparsity en visión: reutilizar el pipeline `e2e_bsf` con otros backbones o datasets sustituyendo el clasificador y el backbone.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KL held-out | 0,029281568 nats/imagen |
| Precisión | 98,9419 % |
| MSE de parche normalizado | 0,79675543 |
| Diferencia pareada media local-menos-KL | 0,00254596 nats/imagen (5 semillas) |
| Intervalo de confianza al 95 % (semilla) | [-0,00325909, 0,008351] |

El intervalo incluye el cero, por lo que la comparación direccional entre el objetivo local y KL se declara inconclusa en la propia model card. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni comparaciones numéricas con otros SAEs.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 9,6 M parámetros el artefacto es muy ligero, pero requiere cargar el backbone DINOv3 ViT-B/16 (no incluido en el repo) para extraer activaciones.
- GPU recomendadas: no disponible; el backbone ViT-B/16 es de tamaño moderado y cabe en GPUs consumer habituales, aunque no se especifica en la ficha.
- Compatibilidad con GPU consumer: probable por el tamaño del artefacto, pero no confirmada en la información disponible.
- Opciones de despliegue: el proyecto indica `uv sync --frozen` y `hf download`, con inferencia vía `e2e_bsf.inference.VisionFeaturizer`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (e2e-bsf-dinov3-imagenette-full-scalar-kl-seed104) | 9.607.690 | no disponible | SAE block-sparse sobre DINOv3/Imagenette | MIT (backbone aparte) | Hugging Face, 21 descargas |
| SAE ReLU convencional sobre DINOv3 | no disponible | no disponible | SAE post-hoc | variable | no disponible |
| Block-sparse featurizer (Goodfire) | no disponible | no disponible | Featurizer block-sparse | no disponible | repo GitHub |
| DINOv3 ViT-B/16 (backbone) | no disponible en la información | no disponible | Visión autosupervisada | licencia DINOv3 separada | Hugging Face (acceso autorizado) |

No se dispone de datos numéricos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Estudio exploratorio: no se alcanzó la potencia preregistrada y la comparación direccional es inconclusa (el IC del 95 % incluye cero).
- La KL baja solo mide la preservación de la readout de 10 clases; no establece conceptos semánticos, fidelidad completa a DINOv3 ni aceleración de inferencia.
- El artefacto excluye los pesos de DINO y las fotos; se requiere acceso autorizado a DINOv3 y su licencia separada. La licencia MIT no relicencia el backbone.
- Solo se completó 1 época de entrenamiento en el perfil `full`.
- El metadato de idioma es `en`, pero el modelo no procesa texto; no debe interpretarse como soporte multilingüe.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de sobreinterpretación de las características dispersas como conceptos semánticos.
- Sesgos conocidos: no documentados en la información disponible; hereda los sesgos del dataset Imagenette y del backbone DINOv3.
- Uso comercial: la licencia MIT cubre el artefacto, pero el uso del backbone DINOv3 está sujeto a su licencia propia.
- El orden de clases sigue torchvision Imagenette; cualquier cambio en ese orden invalida las predicciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-kl-seed104
- Repositorio del proyecto: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers
- Paper BSF: https://arxiv.org/abs/2606.25234
- Paper end-to-end SAE: https://arxiv.org/abs/2405.12241
- Código Goodfire block-sparse featurizer: https://github.com/goodfire-ai/block-sparse-featurizer
- Preregistración: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md
- Backbone DINOv3 ViT-B/16: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m

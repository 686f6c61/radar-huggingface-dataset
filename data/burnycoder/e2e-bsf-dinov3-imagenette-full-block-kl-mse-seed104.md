# BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-mse-seed104

## Resumen

El modelo `BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-mse-seed104` es un sparse autoencoder (SAE) de tipo block-sparse featurizer entrenado desde cero sobre las activaciones de un clasificador de parches DINOv3/Imagenette. Lo desarrolla el usuario independiente BurnyCoder y forma parte de un estudio preregistrado sobre featurizers dispersos de extremo a extremo. No es un modelo generativo ni un LLM: es un artefacto de interpretabilidad de 9,6 millones de parámetros que transforma representaciones de un backbone congelado (DINOv3 ViT-B/16) en características dispersas por bloques.

El problema que aborda es la interpretabilidad de representaciones visuales: extraer features dispersas y potencialmente interpretables de las activaciones de un modelo de visión, preservando al mismo tiempo la fidelidad de la tarea original (clasificación de 10 clases de Imagenette). La innovación frente a SAEs convencionales con ReLU es el uso de featurizers de ancho uno con signo y dispersión por bloques (block sparsity), entrenados de extremo a extremo con una combinación de pérdida KL y MSE.

Es relevante ahora por su enfoque metodológico: estudio preregistrado, comparación emparejada entre objetivos de entrenamiento (KL frente a local), y publicación de métricas por imagen y artefactos de auditoría. El resultado principal del estudio es, sin embargo, no concluyente: el intervalo de confianza del 95 % de la diferencia emparejada incluye el cero, y el autor lo declara explícitamente como exploratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder block-sparse (featurizers de ancho uno con signo) sobre DINOv3 ViT-B/16 congelado |
| Parametros totales | 9.599.498 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre parches de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (metadatos del repo; el modelo no procesa texto) |
| Licencia | MIT (los pesos del BSF; el backbone DINOv3 requiere acceso autorizado y licencia separada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto es un featurizer block-sparse entrenado desde cero sobre las activaciones de un clasificador de parches fijo basado en `facebook/dinov3-vitb16-pretrain-lvd1689m`. El perfil de entrenamiento es "full" y se completó 1 época. Los artefactos escalares son featurizers de ancho uno con signo y ligados entre sí, no SAEs ReLU convencionales; la dispersión se impone por bloques (block sparsity) en lugar de elemento a elemento.

El objetivo de entrenamiento combina una pérdida KL y una pérdida MSE (normalized patch MSE de 0,76848614 en held-out). El estudio es preregistrado y de potencia acotada: se declara explícitamente que no se alcanzó el objetivo de potencia del piloto. La comparación emparejada entre el objetivo local y el objetivo KL arroja una diferencia media de 0,00254596 nats/imagen sobre 5 semillas, con intervalo del 95 % de [-0,00325909, 0,008351], que incluye el cero; el entrenamiento con KL mostró una divergencia de salida media menor. El checkpoint publicado (`model.safetensors`) es solo para inferencia; el checkpoint de entrenamiento local conserva además el estado del optimizador y del RNG. El repo incluye `config.json` (revisiones, arquitectura, objetivo, semilla, preprocesado), `manifest.json` y `duplicate_audit.json` (asignaciones de imágenes y exclusiones) y `teacher.json` (selección del clasificador).

## Capacidades

- Extracción de características dispersas por bloques a partir de activaciones de DINOv3 ViT-B/16 sobre parches de imagen.
- Clasificación de imágenes en las 10 clases de Imagenette (orden de clases según torchvision), con precisión held-out del 99,2774 %.
- Predicción de probabilidades por imagen mediante la API `VisionFeaturizer.predict`.
- Preservación del readout del clasificador original con una KL medida de 0,029991647 nats/imagen.
- Reproducibilidad: semilla fija (104), preregistro y artefactos de auditoría incluidos.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No procesa lenguaje natural pese a la etiqueta `en` en los metadatos.

## Casos de uso

- Investigación en interpretabilidad visual: analizar qué features dispersas emergen de las activaciones de DINOv3 y cómo se relacionan con las 10 clases de Imagenette, usando el featurizer como sonda sobre el backbone congelado.
- Reproducción de estudios preregistrados: el paquete incluye manifiesto, auditoría de duplicados y configuración que permiten replicar exactamente el experimento con la semilla 104.
- Comparación de objetivos de entrenamiento en SAEs: sirve como una de las 5 semillas del estudio para contrastar el objetivo KL frente al local en términos de divergencia de salida y MSE de parches.
- Auditoría de fidelidad de representaciones: medir cuánto se degrada el readout de 10 clases al comprimir las activaciones en features block-sparse, mediante la KL held-out reportada.
- Docencia y divulgación sobre SAEs: ejemplo completo y pequeño (9,6 M de parámetros) de un pipeline de featurizer disperso con métricas y artefactos publicados.
- Base para experimentos de sparse probing: usar las features extraídas como entrada para clasificadores lineales o análisis de conceptos en trabajos posteriores, siempre con la cautela de que la KL baja solo mide preservación del readout de 10 clases.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision held-out (Imagenette, 10 clases) | 99,2774 % |
| KL held-out | 0,029991647 nats/imagen |
| MSE de parches normalizado | 0,76848614 |
| Diferencia media emparejada local menos KL | 0,00254596 nats/imagen (5 semillas) |
| Intervalo de confianza del 95 % (diferencia) | [-0,00325909, 0,008351] (incluye cero; no concluyente) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 9,6 M de parámetros y pesos safetensors, el artefacto es muy pequeño (repo de 0,0 GB), pero requiere cargar el backbone DINOv3 ViT-B/16 (aproximadamente 86 M de parámetros) para extraer activaciones.
- GPU recomendadas: cualquier GPU con suficiente memoria para el ViT-B/16; una RTX 4090 o superior es holgada, y una GPU consumer de gama media también debería bastar para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, tanto el featurizer como el backbone ViT-B/16.
- Opciones de despliegue: el paquete del proyecto `e2e_bsf` (instalación con `uv sync --frozen`) y la API `VisionFeaturizer`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (e2e-bsf-dinov3-imagenette) | 9,6 M (featurizer) + backbone ViT-B/16 | no aplica | Precisión 99,2774 %, KL 0,029991647 | MIT (featurizer); DINOv3 con licencia separada | HuggingFace, 20 descargas |
| SAE ReLU convencional sobre DINOv3 | no disponible | no aplica | no disponible | variable | no disponible |
| Block-sparse featurizer de Goodfire | no disponible | no aplica | no disponible | no disponible | Repo público |
| DINOv3 ViT-B/16 sin featurizer | ~86 M | no aplica | no disponible en esta ficha | licencia DINOv3 | HuggingFace (acceso autorizado) |

No se dispone de datos numéricos comparables de las alternativas en la información proporcionada; la comparativa es estructural, no de rendimiento.

## Limitaciones y advertencias

- El estudio es exploratorio y no alcanzó el objetivo de potencia del piloto; la comparación direccional entre objetivos es no concluyente (el intervalo incluye cero).
- Una KL baja solo mide la preservación del readout de 10 clases; no demuestra que las features correspondan a conceptos semánticos, ni fidelidad completa respecto a DINOv3, ni aceleración de inferencia.
- El artefacto excluye los pesos de DINO y las imágenes; se requiere acceso autorizado a DINOv3 y su licencia separada. La licencia MIT del repo no relicencia el backbone.
- Solo se entrenó 1 época y sobre un dataset acotado (Imagenette, 10 clases); la generalización a otras tareas o dominios no está establecida.
- El modelo no es generativo ni multilingüe; la etiqueta `en` en los metadatos no implica capacidades de procesamiento de lenguaje.
- Riesgo de sobreinterpretación: el autor advierte explícitamente contra atribuir conceptos semánticos a las features a partir de la KL reportada.
- Para uso en producción, verificar la licencia del backbone DINOv3 y la reproducibilidad del pipeline con los artefactos de configuración y auditoría incluidos.

## Enlaces

- HuggingFace: https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-mse-seed104
- Repositorio del proyecto: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers
- Preregistro: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md
- Paper BSF: https://arxiv.org/abs/2606.25234
- Paper end-to-end SAE: https://arxiv.org/abs/2405.12241
- Código de Goodfire (block-sparse featurizer): https://github.com/goodfire-ai/block-sparse-featurizer
- Modelo base: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m

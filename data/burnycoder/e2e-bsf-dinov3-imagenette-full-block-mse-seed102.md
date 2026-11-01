# BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-mse-seed102

## Resumen

Este repositorio no contiene un modelo generativo, sino un *featurizer* de interpretabilidad: un autoencoder disperso por bloques (block-sparse featurizer, BSF) entrenado desde cero sobre las representaciones de un clasificador de parches DINOv3/Imagenette. Lo desarrolla el usuario BurnyCoder como parte de un estudio preinscrito sobre featurizers dispersos de extremo a extremo, y su función es descomponer las activaciones de la backbone en un conjunto de características dispersas y analizables, preservando al mismo tiempo la lectura del clasificador original.

El artefacto es de pequeno tamano (9.599.498 parametros segun los pesos safetensors) y esta atado a una backbone concreta: `facebook/dinov3-vitb16-pretrain-lvd1689m`. No incluye los pesos de DINOv3, que deben obtenerse por separado bajo su propia licencia. El entrenamiento se limita a 1 epoca en el perfil "full" y la comparacion direccional frente a la variante KL resulto inconclusa (intervalo de confianza al 95 % que cruza cero).

Es relevante para investigadores en interpretabilidad mecanicista que quieran reproducir o auditar el pipeline de BSF sobre modelos de vision, no para despliegues de inferencia general. La model card es explicitamente conservadora: la metrica de KL solo mide la preservacion de la lectura de diez clases, no la fidelidad semantica ni la aceleracion de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder disperso por bloques (block-sparse featurizer) sobre backbone ViT-B/16 de DINOv3 |
| Parametros totales | 9.599.498 (pesos safetensors del artefacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision por parches, no textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta del repositorio; el modelo no procesa texto) |
| Licencia | MIT (solo el artefacto; la backbone DINOv3 mantiene su licencia propia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto implementa un featurizer de anchura uno con signo, ligado a un clasificador de parches fijo de DINOv3 sobre Imagenette. No es un SAE ReLU convencional: la model card indica que los artefactos escalares son "tied signed width-one featurizers". El perfil de entrenamiento es "full", con 1 epoca completada y semilla 102. El objetivo combina MSE por bloques con una comparacion frente a una variante KL; el estudio mide la divergencia de salida en nats por imagen sobre 5 semillas.

El estudio es exploratorio y preinscrito, y no alcanzo el objetivo de potencia del piloto. La diferencia media pareada local-menos-KL fue de 0,00254596 nats/imagen, con intervalo al 95 % de [-0,00325909, 0,008351], que incluye cero; la variante con entrenamiento KL mostro menor divergencia media de salida, pero la comparacion direccional es inconclusa. El repositorio incluye `config.json` (revisiones, arquitectura, objetivo, semilla, preprocesado), `manifest.json` y `duplicate_audit.json` (asignaciones de imagenes y evidencia de exclusion) y `teacher.json` (seleccion del clasificador). El checkpoint de entrenamiento local, no publicado como `model.safetensors`, conserva ademas estado del optimizador y del RNG.

## Capacidades

- Extraccion de caracteristicas dispersas por bloques a partir de activaciones de DINOv3 ViT-B/16.
- Prediccion de probabilidades de las diez clases de Imagenette mediante el clasificador entrenado incluido en el artefacto.
- Preservacion de la lectura del clasificador original con una KL medida de 0,040706102 nats/imagen en held-out.
- Clasificacion de parches de imagen (accuracy medida del 98,4516 % en el conjunto evaluado).
- Reconstruccion de parches con MSE normalizado de 0,5465678.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de modo thinking, vision generativa, audio ni capacidades multilingues mas alla de la etiqueta `en` del repositorio.

## Casos de uso

- Auditoria de interpretabilidad mecanicista: inspeccionar las caracteristicas dispersas activadas por una imagen concreta para estudiar que direcciones del espacio de DINOv3 sostienen la decision del clasificador de parches.
- Reproduccion de estudios preinscritos: el repositorio incluye manifiestos y auditoria de duplicados, lo que permite replicar la asignacion de imagenes y la comparacion entre objetivos MSE y KL.
- Analisis de preservacion de lectura: medir cuanto se degrada la KL de salida al sustituir la backbone por el featurizer, util para evaluar tecnicas de compresion o destilacion de representaciones.
- Docencia e investigacion en SAEs: servir como ejemplo ejecutable de un BSF atado con anchura uno y signo, frente a los SAE ReLU habituales.
- Comparacion de semillas: al existir variantes con semilla 102 y otras del mismo estudio, permite estudiar la varianza entre inicializaciones sobre el mismo pipeline.
- Validacion de pipelines de vision: usar el clasificador incluido para comprobar el preprocesado y el orden de clases de torchvision Imagenette en un entorno de investigacion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KL held-out | 0,040706102 nats/imagen |
| Accuracy | 98,4516 % |
| MSE normalizado por parche | 0,5465678 |
| Diferencia media pareada local-menos-KL | 0,00254596 nats/imagen (5 semillas) |
| Intervalo al 95 % de la diferencia | [-0,00325909, 0,008351] |

No se han publicado resultados comparativos frente a otros SAE o BSF en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 9,6 M de parametros en safetensors y la backbone DINOv3 ViT-B/16 (aproximadamente 86 M de parametros), el conjunto cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para ejecutar backbone y featurizer en fp32; RTX 3060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU de consumo: si, incluidas GTX 1660 o superiores con VRAM suficiente para DINOv3 ViT-B/16.
- Opciones de despliegue: el paquete `e2e_bsf` con `VisionFeaturizer` (instalacion via `uv sync --frozen`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-mse-seed102 | 9,6 M (artefacto) + backbone DINOv3 ViT-B/16 | no aplica | MIT (artefacto) | HuggingFace, 24 descargas |
| SAE ReLU convencional sobre DINOv3 | no disponible | no aplica | variable | no disponible |
| Goodfire block-sparse-featurizer (referencia de codigo) | no disponible | no aplica | no disponible | GitHub |

No se dispone de datos de rendimiento de alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La KL baja solo mide la preservacion de la lectura de diez clases; no demuestra conceptos semanticos, fidelidad completa a DINOv3 ni aceleracion de inferencia.
- Estudio exploratorio con 1 epoca y objetivo de potencia no alcanzado; la comparacion direccional frente a KL es inconclusa.
- El artefacto no incluye los pesos de DINOv3: se requiere acceso autorizado y aceptar su licencia separada, que la MIT del repositorio no sustituye.
- Riesgo de sobreajuste al clasificador fijo de Imagenette y a la revision concreta de la backbone fijada en `config.json`.
- No apto para generacion de texto, agentes ni tareas multimodales fuera de la clasificacion de parches.
- Solo etiquetado en ingles; sin soporte documentado para otros idiomas.
- Uso comercial permitido por MIT para el artefacto, pero sujeto a las restricciones de la licencia de DINOv3 para la backbone.

## Enlaces

- [HuggingFace: BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-mse-seed102](https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-mse-seed102)
- [Repositorio del proyecto end-to-end-block-sparse-featurizers](https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers)
- [Paper BSF (arXiv:2606.25234)](https://arxiv.org/abs/2606.25234)
- [Paper end-to-end SAE (arXiv:2405.12241)](https://arxiv.org/abs/2405.12241)
- [Codigo de Goodfire block-sparse-featurizer](https://github.com/goodfire-ai/block-sparse-featurizer)
- [Preinscripcion del estudio](https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md)
- [Modelo base: facebook/dinov3-vitb16-pretrain-lvd1689m](https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m)

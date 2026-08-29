# sarahjhy/deit-contrastive-2023

## Resumen

Este repositorio contiene una implementación compacta y personalizada de DeiT (Data-efficient Image Transformers) orientada a aprendizaje contrastivo. El autor, sarahjhy, la publica como un punto de partida experimental para revisión de código, pruebas de humo y experimentos controlados a pequeña escala, no como un modelo preentrenado listo para producción. El checkpoint incluido (`model.safetensors`) es una inicialización válida, no un modelo entrenado con métricas de rendimiento.

La arquitectura base es DeiT en su variante "base", pero con modificaciones sustanciales: atención grouped query, fusión de baja dimensión (low rank), activación GELU tanh y normalización por lotes (batchnorm). El número total de parámetros es de 33.088, una cifra extremadamente reducida que confirma su naturaleza de juguete o prueba de concepto. No se declaran idiomas soportados ni pipeline de uso, y el repositorio no presenta resultados de benchmarks. Su relevancia actual es limitada: sirve como ejemplo de implementación didáctica o como base para desarrollar adaptadores que permitan cargarlo con APIs genéricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeiT (base) con atención grouped query, fusión low rank, activación GELU tanh, normalización batchnorm |
| Parametros totales | 33.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La implementación es una variante personalizada de DeiT, el transformer de visión propuesto por Touvron et al. en "Training data-efficient image transformers & distillation through attention". La arquitectura base se modifica con atención grouped query (GQA), que reduce el coste computacional de las cabeceras de atención al compartir claves y valores entre grupos de consultas, y con un mecanismo de fusión de baja dimensión (low rank) para combinar información. La activación es GELU con aproximación tanh y la normalización se realiza con batchnorm en lugar de layernorm, lo que puede afectar al comportamiento en lotes pequeños.

El repositorio incluye un `config.json` con la configuración generada y un `training_args.json` con una receta experimental por defecto que usa el optimizador LAMB con un programador de tasa de aprendizaje exponencial. Sin embargo, la model card advierte explícitamente de que estos valores son solo puntos de partida y no evidencian un entrenamiento completado. No se proporciona información sobre el dataset de entrenamiento, el número de tokens o el uso de técnicas como RLHF o DPO. El checkpoint `model.safetensors` es una inicialización aleatoria válida para pruebas de humo, no un modelo entrenado.

## Capacidades

- No se han demostrado capacidades funcionales: el checkpoint es una inicialización sin entrenamiento.
- Implementación de DeiT con atención grouped query y fusión low rank, pensada para experimentos de aprendizaje contrastivo.
- Incluye un script `main.py` con un ejemplo ejecutable y un punto de entrada de entrenamiento para pruebas de humo.
- No soporta tool calling, agentes, razonamiento multi-paso, visión (más allá de la arquitectura) ni capacidades multilingües.
- No se declara ningún pipeline de HuggingFace compatible; se requiere un adaptador explícito para cargarlo con APIs genéricas.

## Casos de uso

- Revisión de código y auditoría de implementaciones de DeiT: el repositorio sirve como referencia para estudiar cómo se implementa la atención grouped query y la fusión low rank en un transformer de visión.
- Pruebas de humo en pipelines de CI/CD: al ser un checkpoint de inicialización diminuto, permite verificar que el código de entrenamiento o inferencia funciona sin consumir recursos significativos.
- Desarrollo de adaptadores para HuggingFace: dado que no es compatible con las APIs automáticas, se puede usar como caso de prueba para escribir un adaptador personalizado.
- Experimentos controlados de aprendizaje contrastivo: la receta por defecto (LAMB, schedule exponencial) puede servir como punto de partida para entrenar desde cero en datasets pequeños.
- Validación de entornos de entrenamiento distribuido: su tamaño mínimo facilita probar la configuración de múltiples GPUs o la sincronización de semillas.
- Enseñanza de arquitecturas de visión: el código compacto es adecuado para fines didácticos en cursos de deep learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reivindica ninguna puntuación y que el checkpoint no es un modelo entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB, dado el número de parámetros (33.088). Cualquier GPU moderna, incluso integradas, puede ejecutarlo.
- GPU recomendadas: no se requiere ninguna GPU específica; una CPU es suficiente para pruebas de humo.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y también en entornos sin GPU.
- Opciones de despliegue: al ser un modelo de visión con implementación personalizada, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Se puede ejecutar mediante el script `main.py` o tras escribir un adaptador para PyTorch.
- Latencia y throughput: no disponibles, pero al ser tan pequeño, la inferencia es prácticamente instantánea en cualquier hardware.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar. Como referencia arquitectónica, el DeiT base original de Facebook (facebook/deit-base-distilled-patch16-224) tiene 86 millones de parámetros y está preentrenado en ImageNet, pero no es directamente comparable porque este repositorio es una implementación personalizada sin entrenar. Otras alternativas de transformers de visión con aprendizaje contrastivo (como DINO o MoCo v3) tampoco son comparables en este contexto, ya que no se han evaluado métricas.

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| sarahjhy/deit-contrastive-2023 | 33.088 | no disponible | sin entrenar | BSD-3-Clause |
| facebook/deit-base-distilled-patch16-224 | 86M | 224x224 px | preentrenado en ImageNet | CC-BY-NC-4.0 (original) |
| DINOv2 (facebook) | 300M (aprox.) | 518x518 px | preentrenado en LVD-142M | Apache-2.0 |

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio; es solo una inicialización.
- No se puede utilizar en producción para ninguna tarea real de visión por computador.
- La implementación es personalizada y no compatible con las APIs estándar de HuggingFace; requiere un adaptador explícito.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto porque no hay modelo funcional.
- La licencia BSD-3-Clause permite uso comercial, pero se debe revisar la licencia de los datos externos si se entrena con ellos.
- Los resultados de cualquier entrenamiento futuro deben documentarse por separado de los valores por defecto incluidos en el repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sarahjhy/deit-contrastive-2023
- Repositorio oficial de DeiT (Facebook Research): https://github.com/facebookresearch/deit
- Documentación de DeiT en HuggingFace Transformers: https://huggingface.co/docs/transformers/model_doc/deit
- Paper original de DeiT (Training data-efficient image transformers & distillation through attention): https://huggingface.co/docs/transformers/v4.48.2/en/model_doc/deit

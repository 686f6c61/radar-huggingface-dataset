# BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-seed100

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un artefacto de investigación sobre interpretabilidad mecanicista: un featurizer disperso por bloques (block-sparse featurizer, BSF) entrenado de extremo a extremo sobre las activaciones de un clasificador de parches basado en DINOv3/Imagenette. Lo desarrolla BurnyCoder como parte de un estudio preregistrado y acotado, y su propósito es analizar qué representaciones internas del backbone visual se preservan tras proyectarlas a un espacio disperso. Se apoya en el backbone `facebook/dinov3-vitb16-pretrain-lvd1689m` (ViT-B/16), que no se incluye en el repo y requiere acceso autorizado y licencia separada.

El artefacto pesa 9.599.498 parámetros (unos 9,6 M) y contiene los pesos del BSF, la normalización fija y el clasificador entrenado, en formato `safetensors`. Está orientado a inferencia mediante la librería `e2e_bsf` del proyecto del autor, no a generación de texto ni a tareas generativas. Su relevancia es metodológica: documenta métricas de fidelidad (KL retenida, precisión y MSE de parche normalizado) y un análisis de potencia estadística entre variantes de entrenamiento, con resultados explícitamente marcados como exploratorios e inconclusos.

Es importante subrayar que la model card advierte que estos artefactos son "featurizers de anchura uno con signo", no SAEs convencionales con ReLU, y que una KL más baja solo mide la preservación de la lectura de diez clases, no conceptos semánticos ni aceleración de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Featurizer disperso por bloques (BSF) sobre ViT-B/16 (DINOv3); artefacto auxiliar de interpretabilidad, no un LLM |
| Parámetros totales | 9.599.498 (según safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo visual, sin contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (etiqueta declarada; el modelo opera sobre imágenes, no texto) |
| Licencia | MIT (solo sobre el artefacto; el backbone DINOv3 conserva su licencia propia) |
| Formato de pesos | safetensors (`model.safetensors`); checkpoint de entrenamiento local con estado de optimizador/RNG no incluido |
| Modelo base | facebook/dinov3-vitb16-pretrain-lvd1689m |
| Perfil de estudio | full; épocas completadas: 1 |
| Semilla | 100 |

## Arquitectura y entrenamiento

El componente entrenado es un featurizer disperso por bloques ("Grassmannian block-sparse featurizer") construido desde cero para un clasificador de parches DINOv3/Imagenette fijo. No se trata de un SAE clásico con activación ReLU: la model card describe los artefactos escalares como featurizers de anchura uno con signo y atados ("tied signed width-one featurizers"). El perfil de entrenamiento es "full" y se completó una única época.

El estudio es preregistrado y acotado, con un objetivo de potencia piloto que no se alcanzó; por ello los resultados se declaran exploratorios. La comparación direccional entre entrenamiento local y entrenamiento con KL arroja una diferencia media pareada (local menos KL) de 0,00254596 nats/imagen sobre 5 semillas, con intervalo de confianza del 95 % de [-0,00325909, 0,008351]. Al incluir el cero, la comparación es inconclusa; el entrenamiento con KL mostró una divergencia de salida media menor. El repo incluye `config.json` (revisiones, arquitectura, objetivo, semilla, preprocesado e identidades de entrenamiento), `manifest.json` y `duplicate_audit.json` (asignaciones de imágenes y evidencias de exclusión) y `teacher.json` (selección del clasificador).

## Capacidades

- Extracción de características visuales dispersas a partir de parches de imágenes, sobre el backbone DINOv3 ViT-B/16.
- Clasificación de imágenes en las diez clases de Imagenette mediante el clasificador entrenado incluido en el artefacto (orden de clases según torchvision Imagenette).
- Predicción de probabilidades por imagen a través de la API `VisionFeaturizer.predict` de la librería `e2e_bsf`.
- Análisis de interpretabilidad: comparación de la fidelidad de la lectura del clasificador bajo distintas variantes de entrenamiento (local frente a KL).
- Reproducibilidad de estudio: artefactos de configuración, manifiesto y auditoría de duplicados para replicar asignaciones de imágenes.
- No dispone de generación de texto, tool calling, razonamiento multi-paso, capacidades multimodales de lenguaje, audio ni modo de pensamiento.

## Casos de uso

- Investigación en interpretabilidad mecanicista: usar el BSF para estudiar qué direcciones de las activaciones de DINOv3 preservan la información necesaria para un readout de diez clases, midiendo la KL retenida como cota de fidelidad.
- Auditoría de fidelidad de representaciones: comparar la KL de salida (0,037268035 nats/imagen) y la precisión (99,2774 %) frente a variantes de entrenamiento para evaluar si la proyección dispersa degrada la lectura del clasificador.
- Replicación de estudios preregistrados: emplear `manifest.json`, `duplicate_audit.json` y `config.json` para reproducir exactamente las particiones de imágenes y las identidades de entrenamiento del estudio.
- Docencia y demostración de SAEs dispersos por bloques: ilustrar la diferencia entre un SAE con ReLU y un featurizer de anchura uno con signo, usando las métricas publicadas como referencia.
- Evaluación de pipelines de extracción de características visuales: integrar `VisionFeaturizer` en un flujo de clasificación de Imagenette para medir coste y fidelidad en un entorno controlado de diez clases.
- Base para experimentos de sparse probing: partir de este artefacto para probar si las características dispersas capturan conceptos semánticos más allá del readout de diez clases, sabiendo que la model card advierte que la KL baja no lo establece.

## Benchmarks y rendimiento

| Métrica (held-out) | Valor |
|---|---|
| KL retenida | 0,037268035 nats/imagen |
| Precisión | 99,2774 % |
| MSE de parche normalizado | 0,78616697 |
| Diferencia media pareada local menos KL | 0,00254596 nats/imagen (5 semillas) |
| Intervalo de confianza del 95 % (semilla) | [-0,00325909, 0,008351] (incluye cero; inconcluso) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el artefacto de 9,6 M parámetros es pequeño, pero la inferencia requiere cargar el backbone DINOv3 ViT-B/16, cuyo consumo no se detalla en la información proporcionada.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; depende del backbone DINOv3, no cuantificado aquí.
- Opciones de despliegue: librería `e2e_bsf` (instalación con `uv sync --frozen`) y descarga del repo con `hf download`; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-seed100 | BSF sobre DINOv3 ViT-B/16 | 9.599.498 | no aplica | MIT (artefacto); backbone con licencia aparte | Hugging Face, 22 descargas |
| SAE end-to-end (paper arXiv:2405.12241) | SAE sobre activaciones | no disponible | no aplica | no disponible | referencia académica |
| Block-sparse featurizer de Goodfire | BSF | no disponible | no aplica | no disponible | repositorio público |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles explícitamente; el clasificador se limita a las diez clases de Imagenette y hereda los sesgos del dataset y del backbone.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la KL baja solo mide la preservación del readout de diez clases; no establece conceptos semánticos ni fidelidad completa respecto a DINOv3.
- Limitaciones de contexto o idioma: el artefacto es visual; la etiqueta de idioma "en" no implica capacidad lingüística.
- Restricciones de licencia: la MIT cubre únicamente el artefacto; el backbone DINOv3 requiere acceso autorizado y su licencia separada, que no se relicencia aquí.
- Caveats para producción: estudio preregistrado acotado con una sola época y objetivo de potencia piloto no alcanzado; la comparación direccional es inconclusa (el intervalo incluye cero). No se documenta aceleración de inferencia. El checkpoint de entrenamiento con estado de optimizador/RNG no está incluido en el repo.

## Enlaces

- Hugging Face: https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-seed100
- Proyecto: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers
- Preregistración: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md
- Paper BSF: https://arxiv.org/abs/2606.25234
- Paper SAE end-to-end: https://arxiv.org/abs/2405.12241
- Código Goodfire: https://github.com/goodfire-ai/block-sparse-featurizer
- Modelo base: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m

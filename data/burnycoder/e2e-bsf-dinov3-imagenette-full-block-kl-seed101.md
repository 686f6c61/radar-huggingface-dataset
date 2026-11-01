# BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-seed101

## Resumen

Este repositorio no contiene un modelo generativo al uso, sino un *featurizer* de visión entrenado como autoencoder disperso por bloques (block-sparse autoencoder, BSF) sobre un backbone DINOv3 congelado. Lo desarrolla el usuario BurnyCoder en el contexto de un estudio preregistrado sobre interpretabilidad de representaciones visuales. El objetivo es aprender un conjunto de características dispersas y de anchura uno (featurizers firmados) que reproduzcan la salida de un clasificador de parches fijo sobre el conjunto Imagenette, de modo que la divergencia KL respecto al clasificador original sirva como métrica de fidelidad.

El artefacto se compone de los pesos del BSF, la normalización fija y el clasificador entrenado; no incluye los pesos de DINOv3, que deben obtenerse por separado bajo su propia licencia. El modelo base es `facebook/dinov3-vitb16-pretrain-lvd1689m`, un ViT-B/16, y el BSF añade 9.599.498 parámetros entrenables.

Es relevante ahora porque se enmarca en la línea de investigación sobre autoencoders dispersos para interpretabilidad (SAE/BSF) aplicada a modelos de visión, y porque publica de forma transparente métricas de fidelidad, intervalos de confianza y estado de potencia estadística del estudio. El propio autor advierte que el objetivo de potencia del piloto no se alcanzó y que la comparación direccional es inconcluyente, lo que conviene tener presente antes de reutilizarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder disperso por bloques (BSF) con featurizers firmados de anchura uno, entrenado sobre DINOv3 ViT-B/16 congelado |
| Parametros totales | 9.599.498 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión por parches; no aplica ventana de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta declarada; el modelo procesa imágenes, no texto) |
| Licencia | MIT (no relicencia el backbone DINOv3, que requiere acceso autorizado y licencia propia) |
| Formato de pesos | safetensors (`model.safetensors`); el checkpoint local de entrenamiento conserva además estado de optimizador y RNG |

## Arquitectura y entrenamiento

El modelo es un *featurizer* de bloques dispersos entrenado desde cero para un clasificador de parches DINOv3/Imagenette fijo. Según la model card, los artefactos escalares son featurizers firmados de anchura uno ligados entre sí, no SAEs con ReLU convencionales. El perfil de entrenamiento es "full" y se completó 1 época. El backbone DINOv3 (ViT-B/16 preentrenado en LVD-1689M) permanece congelado y no forma parte de los pesos publicados.

El estudio es preregistrado y acotado. La comparación principal es entre entrenamiento local y entrenamiento con KL: la diferencia media pareada local menos KL es de 0,00254596 nats/imagen sobre 5 semillas, con un intervalo de confianza del 95 % de [-0,00325909, 0,008351]. Como el intervalo incluye el cero, la comparación direccional se declara inconcluyente. El entrenamiento con KL mostró menor divergencia media de salida. No se detalla en la información disponible el número de tokens ni la composición exacta del dataset más allá de Imagenette y del clasificador de diez clases.

## Capacidades

- Extracción de características dispersas sobre parches de imagen a partir de representaciones DINOv3.
- Clasificación de imágenes en las diez clases de Imagenette (el orden de clases sigue torchvision Imagenette).
- Predicción de probabilidades por imagen mediante la API `VisionFeaturizer.predict`.
- Reproducción de la salida de un clasificador fijo de parches, medida mediante divergencia KL.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica; el modelo procesa imágenes.
- Modo thinking, visión generativa, audio: no disponible.

## Casos de uso

- Investigación en interpretabilidad visual: analizar las características dispersas aprendidas por el BSF para estudiar qué parches activan qué featurizers y cómo se relacionan con las diez clases de Imagenette.
- Reproducción de experimentos preregistrados: el repositorio incluye `config.json`, `manifest.json`, `duplicate_audit.json` y `teacher.json`, lo que permite replicar asignaciones de imágenes, exclusiones y selección del clasificador.
- Evaluación de métodos SAE/BSF: servir como punto de comparación frente a otros featurizers entrenados sobre el mismo backbone y clasificador, usando la KL retenida como métrica.
- Auditoría de fidelidad de representaciones: medir cuánto se degrada la precisión del clasificador (99,3806 % en held-out) al sustituir la representación original por la dispersa.
- Docencia y divulgación: ejemplo práctico de entrenamiento de un featurizer disperso con backbone congelado y de preregistro de un estudio con control de potencia estadística.
- Integración en pipelines de análisis de imágenes: uso de `VisionFeaturizer` para obtener probabilidades de clase en lotes de imágenes RGB dentro de un flujo de experimentación.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KL retenida en held-out | 0,037793152 nats/imagen |
| Precisión | 99,3806 % |
| MSE de parche normalizado | 0,78718752 |
| Diferencia media pareada local menos KL | 0,00254596 nats/imagen (5 semillas) |
| Intervalo de confianza del 95 % (por semilla) | [-0,00325909, 0,008351] |
| Épocas completadas | 1 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 9,6 M de parámetros en safetensors, el artefacto es muy ligero, pero requiere además cargar el backbone DINOv3 ViT-B/16 para operar.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No disponible de forma explícita; por tamaño de parámetros del BSF sí, pero la viabilidad depende del backbone DINOv3 y de su licencia.
- Opciones de despliegue: paquete del proyecto `e2e_bsf` instalado con `uv sync --frozen` y descarga vía `hf download`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros featurizers, SAEs o modelos de la misma categoría.

## Limitaciones y advertencias

- La KL baja solo mide la preservación del readout de diez clases; no establece conceptos semánticos, fidelidad completa a DINO ni aceleración de inferencia.
- El estudio es exploratorio y no alcanzó el objetivo de potencia del piloto; la comparación direccional local frente a KL es inconcluyente.
- Solo se completó 1 época de entrenamiento en el perfil "full".
- El artefacto excluye los pesos de DINO y las fotografías; se requiere acceso autorizado a DINOv3 y su licencia separada. La licencia MIT del repositorio no relicencia el backbone.
- El modelo está orientado a imágenes y al conjunto Imagenette; no es un modelo de texto ni multilingüe pese a la etiqueta `en`.
- No se documentan sesgos específicos ni tasas de alucinación (no aplica generación de texto), pero la evaluación se limita a un conjunto y clasificador concretos.
- Para producción, conviene verificar la vigencia de las revisiones fijadas en `config.json` y la disponibilidad del backbone.

## Enlaces

- HuggingFace: https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-seed101
- Repositorio del proyecto: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers
- Preregistro: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md
- Paper BSF: https://arxiv.org/abs/2606.25234
- Paper end-to-end SAE: https://arxiv.org/abs/2405.12241
- Código Goodfire block-sparse-featurizer: https://github.com/goodfire-ai/block-sparse-featurizer
- Modelo base: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m

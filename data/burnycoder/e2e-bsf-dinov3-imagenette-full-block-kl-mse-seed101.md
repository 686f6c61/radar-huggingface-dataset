# BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-mse-seed101

## Resumen

`e2e-bsf-dinov3-imagenette-full-block-kl-mse-seed101` es un sparse autoencoder (SAE) de bloques con estructura Grassmanniana, entrenado desde cero por el autor independiente BurnyCoder para interpretar un clasificador de parches fijo construido sobre DINOv3 ViT-B/16. No es un modelo generativo ni un clasificador autónomo: es un artefacto de interpretabilidad que aprende un "featurizer" disperso por bloques cuya salida se acopla a la cabeza de clasificación del modelo base, de modo que sus activaciones sean a la vez dispersas y predictivas para la tarea de diez clases de Imagenette.

El modelo pertenece a una línea de investigación sobre SAEs entrenados de extremo a extremo (en lugar de los SAE con ReLU convencionales entrenados solo para reconstruir activaciones). Aquí los featurizers son de anchura uno con signo (tied signed width-one featurizers), lo que los aleja del diseño clásico de SAE y los acerca a un cuello de botella disperso supervisado por la tarea. El checkpoint publicado corresponde al perfil `full`, semilla 101, con una sola época completada y 9.599.498 parámetros en formato safetensors.

Su relevancia es metodológica: forma parte de un estudio preregistrado y acotado sobre si la dispersión por bloques y el entrenamiento end-to-end preservan mejor la fidelidad del clasificador que un SAE con pérdida KL. El autor advierte que el objetivo de potencia del piloto no se alcanzó y que la comparación direccional es inconclusa, por lo que debe tratarse como resultado exploratorio, no como evidencia definitiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder de bloques (block-sparse featurizer) con estructura Grassmanniana, acoplado a un clasificador de parches DINOv3 ViT-B/16 |
| Parametros totales | 9.599.498 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión sobre parches, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta declarada; el artefacto opera sobre imágenes, no texto) |
| Licencia | MIT (no relicencia el backbone DINOv3, que requiere acceso autorizado y licencia propia) |
| Formato de pesos | safetensors (`model.safetensors`); el checkpoint de entrenamiento local conserva además estado de optimizador y RNG |
| Modelo base | facebook/dinov3-vitb16-pretrain-lvd1689m |
| Perfil | full |
| Épocas completadas | 1 |
| Semilla | 101 |
| Objetivo | block KL + MSE |
| Tamaño del repo | 0.0 GB |

## Arquitectura y entrenamiento

El artefacto implementa un featurizer disperso por bloques entrenado desde cero sobre las activaciones de un clasificador de parches fijo derivado de DINOv3 ViT-B/16. La innovación principal es la parametrización: los featurizers escalares son de anchura uno con signo y están atados (tied), no son unidades ReLU convencionales como en los SAE estándar. La dispersión se impone a nivel de bloque, con una estructura geométrica de tipo Grassmanniano que organiza los bloques de características. El entrenamiento combina una pérdida KL sobre la salida del clasificador con una pérdida MSE normalizada sobre los parches, de ahí el nombre `block_kl_mse`.

El entrenamiento se realizó con una sola época sobre el perfil `full` y la semilla 101, dentro de un estudio preregistrado y acotado. El repositorio incluye `config.json` (que fija revisiones, arquitectura, objetivo, semilla, preprocesado e identidades de entrenamiento), `manifest.json` y `duplicate_audit.json` (asignaciones de imágenes y evidencia de exclusiones) y `teacher.json` (selección del clasificador). El artefacto contiene los pesos del BSF, la normalización fija y el clasificador entrenado, pero excluye los pesos de DINO y las fotografías. No se dispone de datos sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset más allá de Imagenette.

## Capacidades

- Predicción de clase sobre imágenes de Imagenette (diez clases, orden de torchvision) mediante `VisionFeaturizer.predict`.
- Extracción de características dispersas por bloques sobre parches de imagen, orientadas a análisis de interpretabilidad.
- Preservación del readout del clasificador base, medida mediante divergencia KL sobre la salida (0.036012009 nats/imagen en held-out).
- Reconstrucción normalizada de parches, medida mediante MSE normalizado (0.76759481).
- Acoplamiento a un backbone DINOv3 ViT-B/16 preentrenado en LVD-1689M, del que depende para la extracción de características visuales.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un artefacto de visión e interpretabilidad, no un modelo de lenguaje.

## Casos de uso

- Análisis de interpretabilidad de clasificadores visuales: inspeccionar qué bloques de características se activan para cada clase de Imagenette y correlacionarlos con regiones de la imagen, aprovechando la dispersión por bloques para obtener representaciones más legibles que un SAE denso.
- Investigación comparativa de objetivos de entrenamiento: usar este checkpoint (KL + MSE) junto con las variantes locales del mismo estudio para contrastar si la pérdida KL preserva mejor el readout del clasificador que una pérdida puramente local.
- Reproducibilidad de estudios preregistrados: el repositorio incluye `config.json`, `manifest.json`, `duplicate_audit.json` y `teacher.json`, lo que permite replicar asignaciones de imágenes, exclusiones y selección de clasificador en un pipeline de evaluación.
- Auditoría de fidelidad de SAE: medir la divergencia KL y la precisión del clasificador tras sustituir las activaciones originales por las del featurizer, como prueba de hasta qué punto la representación dispersa conserva la información relevante para la tarea.
- Docencia y experimentación con SAE de bloques: el código del proyecto (`uv sync --frozen` y `hf download`) permite montar un entorno mínimo para estudiar la parametrización de featurizers de anchura uno con signo frente a SAE ReLU clásicos.
- Base para experimentos de sparsity estructurada en visión: servir de punto de partida para probar otras estructuras de bloque o regularizaciones geométricas sobre el mismo backbone DINOv3 y el mismo conjunto de diez clases.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KL en held-out | 0.036012009 nats/imagen |
| Precision (accuracy) | 99.2000% |
| MSE normalizado de parches | 0.76759481 |
| Diferencia media pareada local menos KL | 0.00254596 nats/imagen (5 semillas) |
| Intervalo de confianza al 95% (nivel de semilla) | [-0.00325909, 0.008351] |

El intervalo incluye cero, por lo que la comparación direccional entre la variante local y la variante KL es inconclusa según el propio autor. El objetivo de potencia del piloto no se alcanzó y el resultado se declara exploratorio. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9,6 M de parámetros en el featurizer más el backbone DINOv3 ViT-B/16 (aproximadamente 86 M de parámetros), la inferencia cabe holgadamente en GPUs de consumo, aunque la cifra exacta depende del tamaño de lote y de la resolución de parche.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el backbone y el featurizer en precisión completa; una RTX 3060 o superior es suficiente para inferencia por lotes pequeños.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y equivalentes.
- Opciones de despliegue: el proyecto oficial usa `uv sync --frozen` y `hf download` con la clase `VisionFeaturizer` del paquete `e2e_bsf.inference`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| e2e-bsf-dinov3-imagenette-full-block-kl-mse-seed101 | 9.599.498 | no aplica | SAE de bloques sobre DINOv3 para Imagenette | MIT (backbone aparte) | HuggingFace |
| SAE ReLU convencional sobre DINOv3 | no disponible | no aplica | Reconstrucción de activaciones | variable | no disponible |
| Block-sparse featurizer de Goodfire | no disponible | no aplica | Interpretabilidad de modelos de lenguaje | no disponible | GitHub (goodfire-ai/block-sparse-featurizer) |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; el propio autor señala que la comparación direccional con la variante local es inconclusa.

## Limitaciones y advertencias

- El resultado es exploratorio: el objetivo de potencia del piloto no se alcanzó y el intervalo de confianza de la diferencia pareada incluye cero, por lo que no puede concluirse superioridad de la pérdida KL.
- Un KL más bajo solo mide la preservación del readout de diez clases; no establece conceptos semánticos, fidelidad completa respecto a DINO ni aceleración de inferencia.
- Entrenado con una sola época y sobre un único conjunto (Imagenette, diez clases); la generalización a otros datasets o cabezas de clasificación no está validada.
- El artefacto excluye los pesos de DINO: se requiere acceso autorizado al backbone y su licencia separada. La licencia MIT del repositorio no relicencia DINOv3.
- El idioma declarado es `en`, aunque el modelo opera sobre imágenes; no hay capacidades multilingües ni de texto.
- Riesgo de alucinación no aplicable en el sentido habitual (no genera texto), pero sí riesgo de sobreinterpretar las activaciones como conceptos semánticos cuando solo se ha validado la preservación del clasificador.
- No se documentan sesgos específicos del featurizer; los sesgos heredados del backbone DINOv3 y de Imagenette no se analizan en la información disponible.
- Para uso en producción como componente de un pipeline de clasificación, conviene validar la precisión y la KL en el dominio objetivo antes de confiar en las métricas de held-out reportadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-mse-seed101
- Repositorio del proyecto: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers
- Preregistro del estudio: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md
- Paper BSF: https://arxiv.org/abs/2606.25234
- Paper end-to-end SAE: https://arxiv.org/abs/2405.12241
- Código de Goodfire (block-sparse-featurizer): https://github.com/goodfire-ai/block-sparse-featurizer
- Modelo base DINOv3 ViT-B/16: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m

# BurnyCoder/e2e-bsf-dinov3-imagenette-smoke-block-kl-mse-seed100

## Resumen

`BurnyCoder/e2e-bsf-dinov3-imagenette-smoke-block-kl-mse-seed100` es un autoencoder disperso por bloques (block-sparse autoencoder, BSF) entrenado desde cero sobre las representaciones de un clasificador de parches DINOv3/Imagenette congelado. No es un modelo generativo ni un modelo de lenguaje: es un artefacto de interpretabilidad cuyo objetivo es reconstruir la salida de un clasificador de diez clases a partir de una representación dispersa y estructurada en bloques. El autor lo publica como demostración de ingeniería ("smoke"), con solo 3 épocas completadas, y advierte explícitamente de que no aporta ninguna conclusión científica confirmatoria.

El modelo base es `facebook/dinov3-vitb16-pretrain-lvd1689m`, un ViT-B/16 de DINOv3, pero el repositorio no incluye los pesos del backbone: solo contiene los pesos del featurizer BSF, la normalización fija y el clasificador entrenado. Los pesos publicados suman 231.978 parámetros en formato safetensors, un tamaño coherente con una cabeza ligera sobre las activaciones del ViT congelado.

Su relevancia es metodológica: ilustra un pipeline completo de extremo a extremo para entrenar featurizers dispersos con objetivos KL y MSE, con auditoría de duplicados, preregistro y métricas por imagen. Resulta útil para investigadores que trabajen en interpretabilidad mecanicista y dispersión estructurada, no para despliegues de producto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder disperso por bloques (block-sparse featurizer) sobre ViT-B/16 DINOv3 congelado |
| Parámetros totales | 231.978 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión por parches, no aplica ventana de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (etiquetas y documentación en inglés) |
| Licencia | MIT (solo para los pesos del BSF; el backbone DINOv3 mantiene su licencia propia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto es un featurizer disperso por bloques entrenado desde cero contra un clasificador de parches DINOv3/Imagenette fijo. La arquitectura concreta del featurizer no se detalla en la información disponible; el nombre del repositorio (`block_kl_mse`) indica que el objetivo combina una pérdida KL sobre las probabilidades del clasificador y una pérdida MSE sobre los parches normalizados. El backbone DINOv3 ViT-B/16 permanece congelado y no forma parte de los pesos publicados.

El entrenamiento se realizó con semilla 100, perfil "smoke" y solo 3 épocas completadas. El repositorio incluye `config.json` con las revisiones, arquitectura, objetivo, semilla, preprocesado e identidades de entrenamiento; `manifest.json` y `duplicate_audit.json` con la asignación de imágenes y la evidencia de exclusiones; y `teacher.json` con la selección del clasificador. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en este contexto). El checkpoint local de entrenamiento conserva además el estado del optimizador y del RNG, pero el `model.safetensors` publicado es solo para inferencia.

## Capacidades

- Reconstrucción de la salida de un clasificador de parches DINOv3/Imagenette de diez clases a partir de una representación dispersa por bloques.
- Extracción de características dispersas y estructuradas en bloques sobre activaciones de un ViT congelado.
- Inferencia sobre imágenes RGB individuales mediante la API `VisionFeaturizer.predict`, que devuelve probabilidades por clase.
- Evaluación de fidelidad de representaciones mediante KL (nats/imagen) y MSE normalizado por parche.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües más allá de etiquetas en inglés.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales.

## Casos de uso

- Investigación en interpretabilidad mecanicista: sirve como referencia reproducible para estudiar cómo una representación dispersa por bloques preserva la información de un clasificador congelado, usando las métricas KL y MSE incluidas.
- Reproducción de experimentos de dispersión estructurada: el paquete `e2e_bsf` y los ficheros `config.json`, `manifest.json` y `duplicate_audit.json` permiten replicar el pipeline con `uv sync --frozen` y `hf download`.
- Validación de pipelines de entrenamiento: al ser un artefacto "smoke" con 3 épocas, es adecuado para comprobar que el flujo de datos, el preprocesado y el cálculo de pérdidas funcionan antes de lanzar entrenamientos largos.
- Auditoría de datasets de visión: los ficheros de manifiesto y de duplicados documentan la asignación de imágenes y las exclusiones, útiles para verificar la integridad de un split de Imagenette.
- Docencia y divulgación: ejemplo compacto (231.978 parámetros) de cómo se acopla un featurizer disperso a un backbone ViT congelado sin necesidad de reentrenar DINOv3.
- Comparación de objetivos de entrenamiento: permite contrastar la combinación KL+MSE frente a otras variantes del mismo pipeline (por ejemplo, distintas semillas o perfiles) manteniendo el mismo backbone y clasificador.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| KL retenido en held-out | 5,7531738 nats/imagen |
| Precisión | 14,0000 % |
| MSE normalizado por parche | 0,9663322 |

No se han publicado resultados comparativos con otros modelos en la información disponible. El autor advierte de que un KL más bajo solo mide la preservación de esta lectura de diez clases y no establece conceptos semánticos, fidelidad completa a DINO ni aceleración de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 231.978 parámetros en safetensors, los pesos del BSF ocupan del orden de 1 MB en fp32, pero la inferencia requiere además cargar el backbone DINOv3 ViT-B/16, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible. Cualquier GPU capaz de ejecutar un ViT-B/16 en fp32 o fp16 debería ser suficiente, pero no se confirma en la documentación.
- ¿Cabe en GPU de consumo? El featurizer sí; el backbone DINOv3 ViT-B/16 probablemente también en GPUs de consumo con suficiente VRAM, aunque este dato no se especifica.
- Opciones de despliegue: el paquete propio `e2e_bsf` mediante `VisionFeaturizer`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BSF DINOv3/Imagenette, smoke) | Autoencoder disperso por bloques sobre ViT congelado | 231.978 | no aplica | MIT (pesos BSF) | Hugging Face, 34 descargas |
| `goodfire-ai/block-sparse-featurizer` | Implementación de referencia de BSF | no disponible | no aplica | no disponible | GitHub |
| `facebook/dinov3-vitb16-pretrain-lvd1689m` | ViT-B/16 auto-supervisado | no disponible en la información | no aplica | licencia propia de DINOv3 | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Artefacto "smoke" con solo 3 épocas: el autor indica explícitamente que es una demostración de ingeniería sin validez científica confirmatoria.
- La precisión medida es del 14 %, muy por encima del azar (10 % en diez clases) pero lejos de un clasificador útil en producción.
- El KL de 5,7531738 nats/imagen mide únicamente la preservación de la lectura de diez clases; no implica fidelidad semántica ni reconstrucción completa de DINOv3.
- No establece aceleración de inferencia ni conceptos interpretables verificados.
- El repositorio no incluye los pesos de DINOv3 ni las imágenes; se requiere acceso autorizado al backbone y aceptar su licencia separada. La licencia MIT del repositorio no relicencia el backbone.
- El orden de clases sigue el de torchvision Imagenette; usarlo con otro orden produce resultados incorrectos.
- Documentación y etiquetas solo en inglés.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de sobreinterpretar las métricas publicadas.
- No se documentan sesgos específicos del modelo; al derivar de Imagenette y de DINOv3, hereda los sesgos de ambos, no cuantificados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-smoke-block-kl-mse-seed100
- Repositorio del proyecto: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers
- Preregistro: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md
- Paper BSF: https://arxiv.org/abs/2606.25234
- Paper end-to-end SAE: https://arxiv.org/abs/2405.12241
- Código de referencia Goodfire: https://github.com/goodfire-ai/block-sparse-featurizer
- Modelo base: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m

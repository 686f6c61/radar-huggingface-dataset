# BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-mse-seed101

## Resumen

El modelo `BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-mse-seed101` es un sparse autoencoder (SAE) de tipo block-sparse featurizer entrenado desde cero sobre las representaciones internas de un clasificador de parches DINOv3/Imagenette. Lo desarrolla el usuario BurnyCoder como parte de un estudio preregistrado sobre interpretabilidad de modelos de visión, y su objetivo no es generar texto ni imágenes, sino descomponer activaciones de un backbone congelado en características dispersas interpretables. Se trata, por tanto, de una herramienta de análisis, no de un modelo generativo.

El artefacto contiene únicamente los pesos del featurizer BSF, la normalización fija y el clasificador entrenado; no incluye los pesos de DINOv3, que deben obtenerse por separado bajo su propia licencia. El perfil de entrenamiento es "full" y se completó una sola época. Los artefactos escalares son featurizers de anchura uno con signo vinculado, no SAEs ReLU convencionales, lo que condiciona tanto su interpretación como sus métricas.

La relevancia del modelo es metodológica: forma parte de un estudio preregistrado que compara el entrenamiento conjunto (local) frente a una línea base KL, con resultados que no alcanzan la potencia estadística prevista y con un intervalo de confianza que incluye el cero, por lo que la comparación direccional es inconclusa. Con 23 descargas y 0 likes, es un artefacto de investigación de nicho, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder block-sparse (BSF) sobre backbone DINOv3 ViT-B/16 congelado |
| Parametros totales | 9.607.690 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, procesa parches de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés, según metadatos) |
| Licencia | MIT (los pesos del backbone DINOv3 quedan excluidos y requieren licencia aparte) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un featurizer block-sparse entrenado desde cero para un clasificador de parches DINOv3/Imagenette fijo. La arquitectura subyacente es un Vision Transformer DINOv3 ViT-B/16 preentrenado en LVD-1689M (`facebook/dinov3-vitb16-pretrain-lvd1689m`), que permanece congelado y no forma parte del artefacto. Sobre sus activaciones se entrena un SAE con estructura de block-sparsity, es decir, con grupos de neuronas activadas de forma conjunta en lugar de activaciones dispersas individuales. Los artefactos escalares son featurizers de anchura uno con signo vinculado, lo que los diferencia de los SAEs ReLU convencionales.

El entrenamiento se realizó con el objetivo `scalar_mse` y la semilla 101, con perfil "full" y una sola época completada. El estudio es preregistrado y de alcance acotado; la comparación principal es entre el entrenamiento local (local-minus-KL) y una línea base KL. La diferencia media pareada local-menoshKL es de 0,00254596 nats/imagen sobre 5 semillas, con un intervalo de confianza del 95 % de [-0,00325909, 0,008351]. Como el intervalo incluye el cero, la comparación direccional es inconclusa y no se alcanzó la potencia objetivo del piloto. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset más allá de Imagenette.

## Capacidades

- Extracción de características dispersas interpretables a partir de activaciones de DINOv3 ViT-B/16.
- Clasificación de parches de imagen en las diez clases de Imagenette (orden de clases según torchvision Imagenette).
- Predicción de probabilidades por imagen mediante la API `VisionFeaturizer.predict`.
- Análisis de interpretabilidad: descomposición de activaciones en bloques dispersos con signo vinculado.
- Evaluación de fidelidad de reconstrucción mediante KL, precisión de clasificación y MSE normalizado de parches.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de modalidades distintas de la visión.
- No incluye modo thinking, audio ni visión generativa.

## Casos de uso

- Investigación en interpretabilidad de modelos de visión: el featurizer permite analizar qué bloques de activaciones de DINOv3 se activan ante parches de Imagenette y estudiar su estructura dispersa. Es adecuado porque está diseñado específicamente para descomponer representaciones de un backbone congelado.
- Reproducción de estudios preregistrados: al incluir `config.json`, `manifest.json`, `duplicate_audit.json` y `teacher.json`, permite replicar el protocolo con semilla 101 y verificar la asignación de imágenes y las identidades de entrenamiento.
- Auditoría de fidelidad de un clasificador de parches: las métricas de KL (0,25325993 nats/imagen), precisión (90,5548 %) y MSE normalizado (0,6635651) permiten evaluar cuánto se preserva la lectura de diez clases tras la descomposición.
- Comparación de objetivos de entrenamiento de SAEs: el artefacto sirve como punto de comparación frente a la línea base KL en estudios sobre block-sparsity y featurizers escalares.
- Docencia y experimentación con SAEs en visión: el paquete `e2e_bsf` y el flujo de instalación con `uv sync --frozen` permiten montar un entorno reproducible para prácticas sobre interpretabilidad.
- Análisis de sesgos en clasificadores de parches: al exponer las activaciones dispersas, facilita estudiar qué características visuales dominan la predicción en cada clase de Imagenette.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KL retenido (held-out) | 0,25325993 nats/imagen |
| Precisión | 90,5548 % |
| MSE normalizado de parches | 0,6635651 |
| Diferencia media pareada local-menoshKL | 0,00254596 nats/imagen (5 semillas) |
| Intervalo de confianza del 95 % (semilla) | [-0,00325909, 0,008351] |

No se han publicado resultados comparativos frente a otros SAEs o featurizers en la información disponible. El intervalo de confianza incluye el cero, por lo que la comparación direccional entre entrenamiento local y KL es inconclusa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 9,6 M de parámetros en safetensors, el artefacto es pequeño, pero requiere cargar el backbone DINOv3 ViT-B/16 (aproximadamente 86 M de parámetros) para funcionar.
- GPU recomendadas: no disponible; cualquier GPU con memoria suficiente para el backbone ViT-B/16 debería bastar, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible de forma explícita; por el tamaño del backbone, es plausible en GPUs de consumo con suficiente VRAM, pero no se confirma en la documentación.
- Opciones de despliegue: el proyecto oficial usa `uv sync --frozen` y la API `VisionFeaturizer` del paquete `e2e_bsf`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El artefacto pertenece a una familia de featurizers block-sparse del mismo autor (variantes por semilla y objetivo), pero no se ofrecen datos comparativos de rendimiento entre ellas ni frente a SAEs estándar.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| e2e-bsf-dinov3-imagenette-full-scalar-mse-seed101 | 9.607.690 | no disponible | MIT (backbone aparte) | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El intervalo de confianza de la comparación principal incluye el cero: la conclusión direccional del estudio es inconclusa y no se alcanzó la potencia objetivo del piloto.
- Un KL más bajo solo mide la preservación de la lectura de diez clases; no establece conceptos semánticos, fidelidad completa a DINOv3 ni aceleración de inferencia.
- El artefacto excluye los pesos de DINOv3 y las imágenes; se requiere acceso autorizado a DINOv3 y su licencia separada. La licencia MIT del repositorio no relicencia el backbone.
- Entrenado con una sola época y semilla 101; la generalización a otras semillas, datasets o clasificadores no está validada.
- El modelo está orientado a inglés en metadatos y a un dataset concreto (Imagenette); no es un modelo de propósito general.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de sobreinterpretación de las características dispersas como conceptos semánticos.
- No se han documentado sesgos específicos más allá de los inherentes al clasificador de parches y al dataset Imagenette.
- Para producción, el uso previsto es análisis e investigación, no despliegue como servicio de clasificación o generación.

## Enlaces

- HuggingFace: https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-mse-seed101
- Repositorio del proyecto: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers
- Paper BSF: https://arxiv.org/abs/2606.25234
- Paper end-to-end SAE: https://arxiv.org/abs/2405.12241
- Código Goodfire block-sparse-featurizer: https://github.com/goodfire-ai/block-sparse-featurizer
- Preregistro: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md
- Modelo base DINOv3: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m

# BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-mse-seed100

## Resumen

El modelo `BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-mse-seed100` es un sparse autoencoder (SAE) de tipo *block-sparse featurizer* entrenado desde cero sobre las representaciones internas del backbone visual DINOv3 ViT-B/16 preentrenado en LVD-1689M. Lo desarrolla el usuario BurnyCoder como parte de un estudio preregistrado sobre featurizadores dispersos de extremo a extremo, orientado a interpretabilidad de modelos de visión. No es un modelo generativo ni un clasificador general: es un artefacto de análisis que descompone activaciones de un clasificador de parches fijo sobre el dataset Imagenette (10 clases de torchvision).

El artefacto contiene únicamente los pesos del BSF, la normalización fija y el clasificador entrenado; no incluye los pesos de DINOv3 ni las imágenes. Su relevancia es metodológica: publica métricas de divergencia KL, precisión y MSE normalizado de parches, junto con material de auditoría (manifiesto, auditoría de duplicados, configuración con revisiones fijadas), lo que permite reproducir y evaluar el estudio. El tamaño real del checkpoint es de 9.599.498 parámetros y el repo ocupa menos de 0,1 GB.

El estudio se declara exploratorio y con potencia estadística insuficiente: el objetivo de potencia del piloto no se alcanzó y el intervalo de confianza del 95 % para la diferencia pareada local-menos-KL incluye el cero, por lo que la comparación direccional es no concluyente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder block-sparse (featurizer de anchura unitaria con signo, no ReLU SAE convencional) sobre DINOv3 ViT-B/16 |
| Parametros totales | 9.599.498 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión por parches, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta del repo; el modelo opera sobre imágenes, no texto) |
| Licencia | MIT (no relicencia el backbone DINOv3, que requiere acceso autorizado y licencia propia) |
| Formato de pesos | safetensors (`model.safetensors`) para inferencia; checkpoint de entrenamiento local adicional con estado de optimizador y RNG |

## Arquitectura y entrenamiento

El modelo es un featurizer disperso block-sparse entrenado de extremo a extremo contra un clasificador de parches DINOv3/Imagenette fijo. Según la model card, los artefactos escalares son "featurizers de anchura unitaria con signo ligados", no SAEs ReLU convencionales. El perfil de entrenamiento es `full` y se completó 1 época. El objetivo declarado es `block_mse` con semilla 100, y la configuración (`config.json`) fija revisiones, arquitectura, objetivo, semilla, preprocesado e identidades de entrenamiento.

El backbone es `facebook/dinov3-vitb16-pretrain-lvd1689m`, un ViT-B/16 preentrenado en LVD-1689M. El estudio compara dos objetivos (local frente a KL) sobre 5 semillas; la diferencia media pareada local-menos-KL es de 0,00254596 nats/imagen, con intervalo del 95 % de [-0,00325909, 0,008351], que incluye el cero. El entrenamiento KL mostró menor divergencia media de salida. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset más allá de Imagenette y el conjunto de parches derivado.

## Capacidades

- Extracción de características dispersas de parches de imagen sobre representaciones DINOv3 ViT-B/16.
- Clasificación de imágenes en las 10 clases de Imagenette (orden de clases de torchvision), mediante el clasificador incluido en el artefacto.
- Predicción de probabilidades por imagen a través de la API `VisionFeaturizer.predict`.
- Descomposición interpretable de activaciones (block-sparse) para análisis de interpretabilidad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No soporta visión generativa, audio ni modo thinking.
- Capacidades multilingües: no aplica; el modelo procesa imágenes.

## Casos de uso

- Análisis de interpretabilidad de representaciones DINOv3: usar el featurizer para descomponer activaciones de parches y estudiar qué direcciones block-sparse se activan ante estímulos visuales concretos, aprovechando que el artefacto incluye normalización fija y clasificador para reproducir el readout.
- Auditoría de fidelidad de un clasificador de 10 clases: medir la divergencia KL (0,035013404 nats/imagen en held-out) y la precisión (98,6323 %) para evaluar cuánto preserva el featurizer el comportamiento del clasificador original.
- Reproducción de un estudio preregistrado: el repo incluye `manifest.json`, `duplicate_audit.json` y `teacher.json`, lo que permite reconstruir asignaciones de imágenes, exclusiones y selección de clasificador para replicar el experimento con la semilla 100.
- Comparación de objetivos de entrenamiento (local frente a KL): el artefacto forma parte de un conjunto de 5 semillas que permite analizar la diferencia pareada de divergencia y comprobar la conclusión de no conclusividad del intervalo.
- Docencia e investigación en SAEs visuales: sirve como ejemplo práctico de featurizer block-sparse de extremo a extremo con métricas publicadas y código de inferencia mínimo.
- Integración en pipelines de análisis offline de imágenes Imagenette: clasificación y extracción de características sobre lotes de imágenes mediante la API de Python, sin necesidad de GPU de gran tamaño dado el reducido número de parámetros (9,6 M).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KL held-out (nats/imagen) | 0,035013404 |
| Precision (accuracy) | 98,6323 % |
| MSE normalizado de parches | 0,54520619 |
| Diferencia media pareada local-menos-KL | 0,00254596 nats/imagen (5 semillas) |
| Intervalo de confianza 95 % de la diferencia | [-0,00325909, 0,008351] (incluye cero) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no es un LLM.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9,6 M de parámetros en safetensors el checkpoint es muy pequeño (repo < 0,1 GB), pero la inferencia requiere cargar el backbone DINOv3 ViT-B/16, cuyo coste de memoria no se detalla en la información proporcionada.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU consumer? No disponible; el artefacto en sí es ligero, pero depende del backbone DINOv3.
- Opciones de despliegue: instalación del proyecto con `uv sync --frozen` y descarga con `hf download`; la API de inferencia es `e2e_bsf.inference.VisionFeaturizer`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (featurizers block-sparse sobre DINOv3) con parámetros, contexto o licencia para contrastar.

## Limitaciones y advertencias

- Estudio exploratorio con potencia estadística insuficiente: el objetivo de potencia del piloto no se alcanzó y la comparación direccional local frente a KL es no concluyente (el intervalo del 95 % incluye cero).
- Una KL menor solo mide la preservación de este readout de 10 clases; no establece conceptos semánticos, fidelidad completa a DINOv3 ni aceleración de inferencia.
- El artefacto excluye los pesos de DINO y las fotos; se requiere acceso autorizado a DINO y su licencia separada. La licencia MIT del repo no relicencia el backbone.
- Solo se completó 1 época de entrenamiento en el perfil `full`, lo que limita la madurez del featurizer.
- El modelo está orientado a Imagenette (10 clases) y a un clasificador de parches fijo; no generaliza a otras tareas sin reentrenamiento.
- Riesgo de sesgo y alucinación: no aplica en el sentido generativo, pero el clasificador hereda los sesgos del backbone DINOv3 y del dataset Imagenette.
- Restricciones de licencia para uso comercial: la licencia MIT cubre el artefacto, pero el uso comercial queda condicionado por la licencia del backbone DINOv3.
- Para producción, el modelo no es adecuado como clasificador general; su valor es analítico y de investigación.

## Enlaces

- Hugging Face: https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-mse-seed100
- Repositorio del proyecto: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers
- Paper BSF: https://arxiv.org/abs/2606.25234
- Paper end-to-end SAE: https://arxiv.org/abs/2405.12241
- Código Goodfire block-sparse-featurizer: https://github.com/goodfire-ai/block-sparse-featurizer
- Preregistro: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md
- Modelo base: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m

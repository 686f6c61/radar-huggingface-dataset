# BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-mse-seed100

## Resumen

Este repositorio no contiene un modelo generativo de lenguaje, sino un *sparse autoencoder* (SAE) con estructura de bloques dispersos entrenado para interpretabilidad sobre un backbone de visión DINOv3. Lo publica el usuario BurnyCoder como artefacto de un estudio pre-registrado sobre *featurizers* dispersos de extremo a extremo, y su función es descomponer las activaciones de un clasificador de parches DINOv3/Imagenette en características interpretables manteniendo la fidelidad de la lectura de diez clases.

El modelo base es `facebook/dinov3-vitb16-pretrain-lvd1689m` (ViT-B/16), y el artefacto incluye únicamente los pesos del BSF, la normalización fija y el clasificador entrenado; no redistribuye los pesos de DINO ni las imágenes. Con 9.599.498 parámetros en formato safetensors, es un componente ligero pensado para análisis post-hoc de representaciones, no para inferencia de propósito general.

Su relevancia es metodológica: forma parte de un estudio acotado y pre-registrado que compara objetivos de entrenamiento (KL frente a MSE local) para *featurizers* de anchura unitaria con signo, en lugar de los SAE ReLU convencionales. El propio autor advierte que la comparación direccional es inconclusa porque el intervalo de confianza al 95 % incluye cero y no se alcanzó la potencia del piloto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder con block-sparsity (BSF) sobre backbone ViT-B/16 DINOv3 |
| Parámetros totales | 9.599.498 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (metadatos del repo; el modelo opera sobre imágenes) |
| Licencia | MIT (no relicencia el backbone DINOv3, que requiere acceso autorizado y licencia propia) |
| Formato de pesos | safetensors (`model.safetensors`); el checkpoint de entrenamiento local conserva además estado de optimizador y RNG |

## Arquitectura y entrenamiento

El artefacto es un *featurizer* de bloques dispersos de tipo Grassmannian, entrenado desde cero contra un clasificador de parches DINOv3/Imagenette fijo. Según la model card, los artefactos escalares son "featurizers de anchura unitaria con signo emparejados", no SAE ReLU convencionales: la dispersión se impone por bloques y la representación resultante se evalúa por su capacidad de preservar la salida del clasificador original. El perfil de entrenamiento es `full` y se completó 1 época.

El objetivo comparado en el estudio es KL frente a una variante local con MSE. La diferencia media pareada local-menos-KL es de 0,00254596 nats/imagen sobre 5 semillas, con intervalo al 95 % de [-0,00325909, 0,008351]; el autor concluye que el entrenamiento con KL tuvo menor divergencia media de salida, pero que el intervalo incluye cero y la comparación direccional es inconclusa. El piloto no alcanzó la potencia pre-registrada. El repositorio incluye `config.json` (revisiones, arquitectura, objetivo, semilla, preprocesado e identidades de entrenamiento), `manifest.json` y `duplicate_audit.json` (asignaciones de imágenes y evidencia de exclusión) y `teacher.json` (selección del clasificador).

## Capacidades

- Extracción de características dispersas por bloques a partir de activaciones de DINOv3 ViT-B/16.
- Clasificación de parches en las diez clases de Imagenette, con precisión retenida del 99,3806 % en el conjunto de retención.
- Predicción de probabilidades por imagen mediante la API `VisionFeaturizer.predict` del paquete `e2e_bsf`.
- Medición de fidelidad de la descomposición mediante KL (0,033454102 nats/imagen) y MSE de parche normalizado (0,76678818).
- Soporte de análisis de interpretabilidad: inspección de características dispersas y su relación con la lectura del clasificador.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto; no es un modelo de lenguaje.
- No incluye capacidades multimodales de audio o vídeo; trabaja exclusivamente sobre imágenes RGB.

## Casos de uso

- Auditoría de representaciones en investigación de interpretabilidad: cargar el artefacto con `VisionFeaturizer` y examinar qué bloques de características se activan para cada parche de una imagen, usando el KL retenido como métrica de fidelidad.
- Reproducción de un estudio pre-registrado: el paquete `e2e_bsf` con `uv sync --frozen`, junto con `config.json` y `manifest.json`, permite replicar la comparación KL frente a MSE local sobre las mismas asignaciones de imágenes y semillas.
- Comparación de objetivos de entrenamiento para SAE: utilizar este checkpoint (semilla 100, objetivo KL) frente a las variantes locales del mismo estudio para medir divergencia de salida y precisión retenida.
- Docencia sobre SAE y dispersión estructurada: ejemplo real de *featurizer* de anchura unitaria con signo y dispersión por bloques, con métricas publicadas y código de referencia en Goodfire.
- Validación de pipelines de extracción de características: comprobar que la integración con DINOv3 produce la precisión esperada (99,3806 %) antes de desplegar análisis sobre un corpus propio de Imagenette.
- Análisis de sensibilidad a la semilla: al existir cinco semillas en el estudio, se puede estudiar la varianza de la fidelidad KL y del MSE normalizado entre ejecuciones.
- Prototipado de herramientas de depuración de clasificadores de visión: usar las probabilidades por imagen y los logits adjuntos para diagnosticar discrepancias entre el modelo original y su descomposición dispersa.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| KL retenido (nats/imagen) | 0,033454102 |
| Precisión retenida | 99,3806 % |
| MSE de parche normalizado | 0,76678818 |
| Diferencia media pareada local-menos-KL (nats/imagen, 5 semillas) | 0,00254596 |
| Intervalo al 95 % de la diferencia | [-0,00325909, 0,008351] |

No se han publicado resultados comparativos frente a otros SAE o *featurizers* en la información disponible; las cifras anteriores son internas al estudio y no permiten establecer un ranking frente a alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9,6 M de parámetros en safetensors, los pesos del BSF ocupan del orden de decenas de MB, pero la inferencia requiere además cargar el backbone DINOv3 ViT-B/16, cuyo coste no se detalla en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende del backbone DINOv3, no solo del artefacto.
- Opciones de despliegue: el paquete propio `e2e_bsf` (`VisionFeaturizer`), instalado con `uv sync --frozen` y descargado con `hf download`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-mse-seed100 | BSF sobre DINOv3 ViT-B/16 | 9.599.498 | no aplica | MIT (backbone aparte) | HuggingFace, 22 descargas |
| SAE ReLU convencional (referencia genérica) | SAE post-hoc | no disponible | no aplica | variable | no disponible |
| Block-sparse featurizer de Goodfire | BSF de referencia | no disponible | no aplica | no disponible | repositorio GitHub |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada, por lo que no es posible una comparación cuantitativa.

## Limitaciones y advertencias

- El propio autor indica que un KL más bajo solo mide la preservación de la lectura de diez clases; no establece conceptos semánticos, fidelidad completa a DINO ni aceleración de inferencia.
- El estudio es exploratorio y no alcanzó la potencia pre-registrada; la comparación direccional entre objetivos es inconclusa (el intervalo al 95 % incluye cero).
- Entrenado con una sola época y sobre Imagenette, un subconjunto de diez clases de ImageNet; la generalización a otras taxonomías no está demostrada.
- El artefacto excluye los pesos de DINO y las imágenes: se requiere acceso autorizado a DINOv3 y su licencia separada. La licencia MIT del repositorio no relicencia el backbone.
- Los metadatos declaran idioma `en`, pero el modelo no procesa texto; es un componente de visión.
- Riesgo de sesgo heredado del backbone DINOv3 y del conjunto Imagenette, no evaluado en la información disponible.
- No apto para producción como clasificador general: su propósito es la interpretabilidad y la reproducibilidad del estudio.
- El orden de clases sigue torchvision Imagenette, lo que impone una dependencia de esa convención en cualquier integración.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-mse-seed100)
- [Repositorio del proyecto end-to-end-block-sparse-featurizers](https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers)
- [Pre-registro del estudio](https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md)
- [Paper BSF (arXiv:2606.25234)](https://arxiv.org/abs/2606.25234)
- [Paper end-to-end SAE (arXiv:2405.12241)](https://arxiv.org/abs/2405.12241)
- [Código de Goodfire block-sparse-featurizer](https://github.com/goodfire-ai/block-sparse-featurizer)
- [Modelo base facebook/dinov3-vitb16-pretrain-lvd1689m](https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m)

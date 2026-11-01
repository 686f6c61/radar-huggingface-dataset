# BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-kl-seed103

## Resumen

El modelo `BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-kl-seed103` es un sparse autoencoder (SAE) de tipo block-sparse featurizer entrenado desde cero sobre las activaciones de un clasificador de parches de imagen. Lo desarrolla el usuario independiente BurnyCoder en el contexto de un estudio preregistrado sobre interpretabilidad de representaciones visuales. No es un modelo generativo ni un LLM: es un artefacto de investigación de 9,6 millones de parámetros que se acopla a un backbone DINOv3 ViT-B/16 y sirve para analizar y reconstruir las activaciones internas de un clasificador de diez clases sobre el dataset Imagenette.

El problema que aborda es la interpretabilidad mecanicista de modelos de visión: extraer características dispersas y potencialmente interpretables a partir de las activaciones de un transformer visual, comparando dos objetivos de entrenamiento (KL frente a una variante local) bajo un diseño experimental controlado por semillas. La relevancia es metodológica, no de producto: el autor publica métricas de fidelidad de reconstrucción (KL de 0,031958 nats/imagen), precisión retenida del clasificador (99,071 %) y un análisis de potencia estadística que reconoce explícitamente que la comparación direccional entre objetivos es inconclusa.

La arquitectura es un featurizer de anchura uno con signo (scalar artifacts), no un SAE ReLU convencional, con dispersión por bloques (block sparsity) sobre una base de tipo Grassmanniano. El entrenamiento se limita a una época con el perfil "full" y la semilla 103, dentro de un estudio piloto que no alcanzó su objetivo de potencia estadística. El repositorio no incluye los pesos de DINOv3 ni las imágenes, y su licencia MIT no relicencia el backbone subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Featurizer block-sparse con dispersión por bloques sobre base Grassmanniana; artefactos escalares de anchura uno con signo (no SAE ReLU convencional) |
| Parametros totales | 9.607.690 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión por parches; no aplica ventana de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta declarada; el modelo opera sobre imágenes, no texto) |
| Licencia | MIT (no relicencia el backbone DINOv3, que requiere acceso y licencia separada) |
| Formato de pesos | safetensors (`model.safetensors`, solo inferencia) |
| Modelo base | facebook/dinov3-vitb16-pretrain-lvd1689m |
| Dataset de evaluación | Imagenette (10 clases, orden de clases de torchvision) |
| Perfil de entrenamiento | full |
| Épocas completadas | 1 |
| Semilla | 103 |
| Tamaño del repo | 0.0 GB |
| Descargas | 22 |

## Arquitectura y entrenamiento

El artefacto implementa un featurizer block-sparse entrenado desde cero para un clasificador de parches DINOv3/Imagenette fijo. A diferencia de un SAE estándar con activaciones ReLU, los artefactos escalares son "tied signed width-one featurizers": cada característica tiene anchura uno y signo, lo que restringe la parametrización y la hace distinta de los SAE convencionales descritos en la literatura (por ejemplo, el paper de SAE end-to-end, arXiv:2405.12241). La dispersión se impone por bloques (block sparsity), siguiendo el enfoque del paper de block-sparse featurizers (arXiv:2606.25234) y la implementación de referencia de Goodfire.

El entrenamiento se realizó con el perfil "full" durante una única época y la semilla 103, dentro de un estudio preregistrado y acotado. El objetivo de entrenamiento compara una variante KL con una variante local: la diferencia media pareada local-menos-KL es de 0,00254596 nats/imagen sobre 5 semillas, con un intervalo de confianza del 95 % de [-0,00325909, 0,008351]. Como el intervalo incluye el cero, el autor declara la comparación direccional como inconclusa y el estudio como exploratorio, al no haberse alcanzado el objetivo de potencia del piloto. El repositorio incluye `config.json` (que fija revisiones, arquitectura, objetivo, semilla, preprocesado e identidades de entrenamiento), `manifest.json` y `duplicate_audit.json` (asignación de imágenes y evidencia de exclusiones) y `teacher.json` (selección del clasificador). El checkpoint de entrenamiento local conserva además estado del optimizador y del RNG, pero el `model.safetensors` publicado es solo para inferencia.

## Capacidades

- Extracción de características dispersas a partir de activaciones de un backbone DINOv3 ViT-B/16 preentrenado.
- Clasificación de parches de imagen en las 10 clases de Imagenette mediante el clasificador entrenado incluido en el artefacto.
- Predicción de probabilidades por imagen a través de la API `VisionFeaturizer.predict`, que devuelve probabilidades por clase.
- Reconstrucción de la salida del clasificador con una divergencia KL medida de 0,031958 nats/imagen en el conjunto de validación.
- Análisis de interpretabilidad: permite estudiar características dispersas y su correspondencia con la lectura de diez clases del clasificador fijo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- Capacidades multilingües: no disponibles; el modelo opera sobre imágenes y la etiqueta de idioma "en" es meramente declarativa.
- No incluye modo thinking, visión generativa, audio ni decodificación especulativa.

## Casos de uso

- Investigación en interpretabilidad mecanicista: usar el featurizer para descomponer las activaciones de DINOv3 ViT-B/16 en características block-sparse y estudiar qué direcciones se activan ante parches de Imagenette, con la ventaja de que el artefacto incluye normalización fija y clasificador entrenado, lo que facilita la reproducibilidad.
- Reproducción de estudios preregistrados: el repositorio conserva `config.json`, `manifest.json`, `duplicate_audit.json` y `teacher.json`, de modo que un grupo puede replicar exactamente la asignación de imágenes, la semilla 103 y el objetivo de entrenamiento declarado.
- Comparación de objetivos de entrenamiento de SAE: el artefacto sirve como una de las cinco semillas del estudio que compara la variante KL con la variante local; se puede emparejar con las otras semillas para recalcular la diferencia media y su intervalo.
- Auditoría de fidelidad de un clasificador visual: con una KL de 0,031958 nats/imagen y una precisión retenida del 99,071 %, el modelo permite medir cuánto se degrada la lectura de diez clases al sustituir las activaciones originales por su reconstrucción dispersa.
- Docencia y formación en SAE: al ser un artefacto pequeño (9,6 M de parámetros, repo de 0,0 GB) y con API de inferencia simple, resulta adecuado para talleres sobre sparse autoencoders y dispersión por bloques sin necesidad de entrenar desde cero.
- Integración en pipelines de análisis de visión: mediante `VisionFeaturizer` se pueden procesar lotes de imágenes RGB y obtener probabilidades por clase para estudiar la estabilidad del featurizer ante distintas entradas, siempre que se disponga de acceso autorizado a DINOv3.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KL retenida en held-out | 0,031957999 nats/imagen |
| Precisión retenida | 99,0710 % |
| MSE de parche normalizado | 0,7961458 |
| Diferencia media pareada local-menos-KL | 0,00254596 nats/imagen (5 semillas) |
| Intervalo de confianza al 95 % (nivel de semilla) | [-0,00325909, 0,008351] |
| Épocas completadas | 1 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un LLM. La comparación direccional entre objetivos es inconclusa según el propio autor porque el intervalo incluye el cero y no se alcanzó la potencia objetivo del piloto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9,6 M de parámetros en safetensors y pesos en precisión de entrenamiento, el artefacto ocupa del orden de decenas de MB, pero la inferencia requiere además cargar el backbone DINOv3 ViT-B/16, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible; el modelo base DINOv3 ViT-B/16 es un ViT de tamaño base y cabe previsiblemente en GPUs de consumo, pero no se aportan medidas.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible.
- Opciones de despliegue: la vía documentada es el paquete del proyecto `e2e_bsf` (`uv sync --frozen` y `hf download`), con la clase `VisionFeaturizer`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (e2e-bsf-dinov3-imagenette-full-scalar-kl-seed103) | Featurizer block-sparse escalar sobre DINOv3 ViT-B/16 | 9.607.690 | no aplica | MIT (backbone con licencia aparte) | HuggingFace, 22 descargas |
| SAE ReLU convencional (p. ej. los descritos en arXiv:2405.12241) | Sparse autoencoder con activaciones ReLU | no disponible | no aplica | variable según implementación | múltiples implementaciones públicas |
| Block-sparse featurizer de Goodfire (referencia) | Featurizer block-sparse | no disponible | no aplica | no disponible | repositorio público de Goodfire |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a tipo de arquitectura y disponibilidad.

## Limitaciones y advertencias

- El propio autor advierte que una KL más baja solo mide la preservación de la lectura de diez clases del clasificador; no establece conceptos semánticos, ni fidelidad completa a DINOv3, ni aceleración de inferencia.
- Estudio exploratorio: no se alcanzó el objetivo de potencia del piloto y la comparación direccional entre objetivos es inconclusa (el intervalo de confianza incluye el cero).
- Entrenamiento de una sola época con la semilla 103; los resultados pueden no generalizar a otras semillas o configuraciones.
- El artefacto excluye los pesos de DINO y las imágenes; se requiere acceso autorizado a DINOv3 y su licencia separada, y la licencia MIT del repositorio no relicencia el backbone.
- El orden de clases sigue torchvision Imagenette; usarlo con otro orden produce predicciones mal etiquetadas.
- El modelo solo opera sobre imágenes y la etiqueta de idioma "en" no implica capacidades lingüísticas.
- No hay información sobre sesgos, riesgo de alucinación (no aplica a generación de texto) ni comportamiento fuera del dominio Imagenette.
- Uso comercial: la licencia MIT cubre el artefacto, pero el uso del backbone DINOv3 queda sujeto a su licencia propia, que debe revisarse antes de cualquier despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-kl-seed103
- Repositorio del proyecto: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers
- Paper de block-sparse featurizers: https://arxiv.org/abs/2606.25234
- Paper de SAE end-to-end: https://arxiv.org/abs/2405.12241
- Código de referencia de Goodfire: https://github.com/goodfire-ai/block-sparse-featurizer
- Preregistro del estudio: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md
- Modelo base DINOv3 ViT-B/16: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m

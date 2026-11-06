# BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-mse-seed103

## Resumen

Este repositorio contiene un *featurizer* de bloques dispersos (block-sparse featurizer, BSF) entrenado desde cero sobre un clasificador de parches de DINOv3/Imagenette fijo. No es un modelo de lenguaje ni un modelo generativo: es un artefacto de interpretabilidad que se acopla a la representación interna de un ViT-B/16 de DINOv3 para extraer características dispersas y medir cuánto de la señal del clasificador original se preserva. Lo publica el usuario BurnyCoder como parte de un estudio preinscrito sobre *sparse autoencoders* de extremo a extremo.

El modelo base es `facebook/dinov3-vitb16-pretrain-lvd1689m`, un Vision Transformer con parches de 16x16 preentrenado por Meta con el objetivo DINOv3 sobre el corpus LVD-1689M. El BSF añade 9.599.498 parámetros entrenables que transforman las activaciones del backbone en una representación de anchura uno con signo, ligada a un clasificador de diez clases de Imagenette. La relevancia actual es metodológica: forma parte de una línea de trabajo que cuestiona el diseño clásico de los SAE con ReLU y propone dispersión por bloques con objetivos KL y MSE.

El perfil de entrenamiento es «full» con una sola época completada, y la comparación direccional entre objetivos KL y MSE resultó no concluyente (el intervalo de confianza al 95 % de la diferencia media incluye el cero). El autor es explícito: la métrica KL mide únicamente la preservación de la lectura de diez clases, no la fidelidad semántica completa respecto a DINOv3 ni una aceleración de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder de bloques (BSF) sobre ViT-B/16 de DINOv3; featurizers de anchura uno con signo |
| Parametros totales | 9.599.498 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no aplica ventana de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas del dataset y documentación) |
| Licencia | MIT (los pesos DINOv3 no se relicencian; requieren acceso y licencia propias) |
| Formato de pesos | safetensors (`model.safetensors` para inferencia; checkpoint local con estado de optimizador y RNG) |

## Arquitectura y entrenamiento

El artefacto es un BSF entrenado de extremo a extremo contra un clasificador de parches DINOv3/Imagenette congelado. La innovación frente a un SAE convencional es el uso de *block sparsity* sobre una base de Grassmann y de featurizers de anchura uno con signo, en lugar de unidades ReLU independientes. El objetivo combina una pérdida KL sobre las salidas del clasificador y una pérdida MSE normalizada sobre los parches; el perfil «full» indica que se entrena el bloque completo, no un subconjunto.

El entrenamiento se realizó con la semilla 103, una época completada y un protocolo preinscrito con auditoría de duplicados (`duplicate_audit.json`), manifiesto de asignación de imágenes (`manifest.json`) y registro de selección del clasificador profesor (`teacher.json`). El `config.json` fija revisiones, arquitectura, objetivo, semilla y preprocesado. El estudio compara el objetivo KL frente a MSE sobre cinco semillas; la diferencia media pareada local-menos-KL fue de 0,00254596 nats/imagen, con intervalo del 95 % de [-0,00325909, 0,008351], por lo que el autor declara la comparación direccional inconclusa y el objetivo de potencia del piloto no alcanzado.

## Capacidades

- Extracción de características dispersas de parches de imagen a partir de las activaciones de DINOv3 ViT-B/16.
- Clasificación de imágenes en las diez clases de Imagenette (orden de clases de torchvision Imagenette).
- Predicción de probabilidades por imagen mediante `VisionFeaturizer.predict`.
- Medición de divergencia KL respecto al clasificador profesor (0,034384977 nats/imagen en held-out).
- Medición de error de reconstrucción de parches (MSE normalizada de 0,76922709).
- No soporta *tool calling*, agentes, razonamiento multi-paso ni generación de texto.
- No soporta visión general más allá del pipeline de parches para el que fue entrenado.
- Capacidad multilingüe: no aplica; el modelo no procesa texto.

## Casos de uso

- Investigación en interpretabilidad mecanicista: analizar qué direcciones del espacio de activaciones de DINOv3 sostienen la decisión de un clasificador de diez clases, usando los featurizers de bloques como base dispersa y midiendo la KL retenida.
- Reproducción de estudios preinscritos: el repositorio incluye manifiesto, auditoría de duplicados y preregistro, lo que permite replicar la comparación KL frente a MSE con la misma partición de Imagenette.
- Evaluación de métodos de SAE: servir como línea base de BSF frente a SAE con ReLU en tareas de preservación de lectura (*readout preservation*) sobre un backbone ViT-B/16.
- Docencia y formación: ejemplo mínimo y ejecutable de un pipeline de featurización dispersa con `uv sync --frozen` y `hf download`, adecuado para prácticas de interpretabilidad.
- Auditoría de fidelidad de representaciones: cuantificar cuánto se degrada la precisión del clasificador (99,2258 % en held-out) al sustituir la activación original por la representación dispersa.
- Análisis de estabilidad entre semillas: comparar la variabilidad de la KL y de la MSE normalizada a través de las cinco semillas del estudio para decidir si el objetivo KL aporta ventaja real.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KL en held-out | 0,034384977 nats/imagen |
| Precision (accuracy) | 99,2258 % |
| MSE normalizada de parches | 0,76922709 |
| Diferencia media pareada local-menos-KL | 0,00254596 nats/imagen (5 semillas) |
| Intervalo del 95 % de la diferencia | [-0,00325909, 0,008351] |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones numéricas con otros SAE o BSF en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el artefacto pesa 9,6 M de parámetros, pero requiere cargar el backbone DINOv3 ViT-B/16 (unos 86 M de parámetros en fp32) para operar.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del backbone, cualquier GPU con al menos 8 GB de VRAM debería bastar para inferencia en fp32; no hay datos publicados de latencia ni throughput.
- GPU de consumo: previsiblemente sí en tarjetas tipo RTX 3060/4060 o superiores, aunque el autor no lo documenta.
- Opciones de despliegue: el paquete `e2e_bsf` del proyecto `BurnyCoder/end-to-end-block-sparse-featurizers` mediante `VisionFeaturizer`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este BSF (seed 103) | 9.599.498 | no aplica | MIT (backbone aparte) | Hugging Face, 21 descargas |
| SAE con ReLU sobre DINOv3 | no disponible | no aplica | no disponible | no disponible |
| BSF de Goodfire (`goodfire-ai/block-sparse-featurizer`) | no disponible | no aplica | no disponible | GitHub |
| DINOv3 ViT-B/16 (backbone) | no disponible en la información | no aplica | licencia propia de Meta | Acceso autorizado |

No se dispone de datos numéricos de los modelos alternativos en la información proporcionada; la comparación se limita a disponibilidad y licencia.

## Limitaciones y advertencias

- La KL baja solo mide la preservación de la lectura de diez clases de Imagenette; no establece conceptos semánticos ni fidelidad completa respecto a DINOv3.
- El autor declara explícitamente que el resultado no implica aceleración de inferencia.
- Estudio piloto con una sola época completada y objetivo de potencia no alcanzado; la comparación KL frente a MSE es inconclusa.
- Entrenado únicamente sobre Imagenette (diez clases); no generaliza a otras taxonomías sin reentrenamiento.
- El repositorio no incluye los pesos de DINOv3 ni las imágenes; se requiere acceso autorizado y aceptar la licencia separada del backbone.
- La licencia MIT del repositorio no relicencia el backbone DINOv3; el uso comercial del conjunto queda sujeto a la licencia de Meta.
- Sesgos y riesgo de alucinación: no aplica en el sentido generativo, pero los sesgos del dataset Imagenette y de DINOv3 se heredan en la representación.
- No hay datos publicados de cuantización ni de despliegue en producción más allá del pipeline de inferencia del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-mse-seed103
- Repositorio del proyecto: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers
- Preregistro: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md
- Paper BSF: https://arxiv.org/abs/2606.25234
- Paper SAE de extremo a extremo: https://arxiv.org/abs/2405.12241
- Código de Goodfire: https://github.com/goodfire-ai/block-sparse-featurizer
- Modelo base: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m

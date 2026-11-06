# BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-mse-seed101

## Resumen

Este repositorio contiene un *sparse autoencoder* (SAE) de tipo block-sparse, denominado BSF (block-sparse featurizer), entrenado desde cero sobre las activaciones de un clasificador de parches fijo basado en DINOv3 e Imagenette. Lo desarrolla el usuario BurnyCoder como parte de un estudio preregistrado sobre interpretabilidad de representaciones en modelos de visión. El objetivo no es generar texto ni imágenes, sino descomponer las activaciones internas de un backbone visual en características dispersas y analizables, un paso habitual en pipelines de *mechanistic interpretability*.

El artefacto no es un modelo generativo: es un featurizador que se acopla a un backbone DINOv3 ViT-B/16 preentrenado (facebook/dinov3-vitb16-pretrain-lvd1689m) y a un clasificador de 10 clases (las de Imagenette). Con 9.599.498 parámetros en `model.safetensors`, el modelo reporta una KL retenida de 0,0389 nats/imagen, una precisión del 98,529 % y un MSE de parche normalizado de 0,5443 sobre el conjunto de validación.

Su relevancia es metodológica: forma parte de un estudio comparativo entre featurizadores locales y entrenados por KL, con preregistro público, intervalos de confianza a nivel de semilla y artefactos de auditoría (manifest, duplicate_audit, teacher.json). El propio autor advierte que el estudio es exploratorio y que no se alcanzó el objetivo de potencia estadística.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder block-sparse (featurizador de ancho unitario con signo, no ReLU SAE) sobre DINOv3 ViT-B/16 |
| Parámetros totales | 9.599.498 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; opera sobre parches de imagen) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (etiqueta declarada; el modelo no procesa texto) |
| Licencia | MIT (los pesos del backbone DINOv3 quedan excluidos y requieren su licencia propia) |
| Formato de pesos | safetensors (`model.safetensors`); checkpoint de entrenamiento local con estado de optimizador y RNG |
| Modelo base | facebook/dinov3-vitb16-pretrain-lvd1689m |
| Perfil de estudio | full; 1 época completada; semilla 101 |
| Tamaño del repo | 0,0 GB |

## Arquitectura y entrenamiento

El modelo es un featurizador block-sparse entrenado desde cero para un clasificador de parches DINOv3/Imagenette fijo. A diferencia de los SAE convencionales con activación ReLU, el autor describe los artefactos escalares como "featurizers de ancho unitario con signo" (tied signed width-one featurizers), es decir, una variante que impone estructura de bloque y signo en la representación dispersa. El perfil de entrenamiento es "full" y se completó una sola época, con semilla 101, dentro de un estudio preregistrado con múltiples semillas (5 en total para la comparación pareada).

El entrenamiento se enmarca en una comparación entre un objetivo local (local-minus-KL) y un objetivo KL. La diferencia media pareada local-menos-KL es de 0,00254596 nats/imagen sobre 5 semillas, con un intervalo de confianza del 95 % de [-0,00325909, 0,008351]. Como el intervalo incluye el cero, la comparación direccional se declara no concluyente. El autor vincula el trabajo a dos papers: el de BSF (arXiv:2606.25234) y el de SAE end-to-end (arXiv:2405.12241), además del código de referencia de Goodfire.

## Capacidades

- Extracción de características dispersas a partir de activaciones de un backbone DINOv3 ViT-B/16.
- Clasificación de imágenes en las 10 clases de Imagenette mediante el clasificador entrenado incluido en el artefacto.
- Predicción de probabilidades por imagen a través de la API `VisionFeaturizer.predict([...])`.
- Reconstrucción/ajuste de parches medido con MSE normalizado (0,5443 en validación).
- Preservación del *readout* de 10 clases con KL de 0,0389 nats/imagen.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (modelo puramente visual).
- Modo thinking, visión generativa, audio: no disponible.

## Casos de uso

- Análisis de interpretabilidad en visión: usar el featurizador para descomponer activaciones de DINOv3 ViT-B/16 en características block-sparse y estudiar qué direcciones se activan ante parches concretos de Imagenette, aprovechando que el artefacto incluye normalización fija y clasificador entrenado.
- Reproducción de estudios preregistrados: el repo incluye `config.json`, `manifest.json`, `duplicate_audit.json` y `teacher.json`, lo que permite replicar la asignación de imágenes, la selección de clasificador y las identidades de entrenamiento en un pipeline de investigación.
- Comparación de objetivos de entrenamiento de SAE: el artefacto sirve como una de las semillas (101) de la comparación local frente a KL, útil para meta-análisis sobre qué objetivo preserva mejor el readout de un clasificador congelado.
- Auditoría de fidelidad de representaciones: medir KL y MSE de parche sobre un conjunto held-out para verificar cuánto se degrada la información del backbone al comprimirla en características dispersas.
- Docencia y experimentación con SAE en visión: al ser un repo pequeño (0,0 GB) con licencia MIT y API mínima, es adecuado para prácticas de interpretabilidad sin necesidad de infraestructura pesada, siempre que se disponga de acceso autorizado a DINOv3.
- Integración en pipelines de análisis de datasets visuales: clasificar imágenes de Imagenette y obtener simultáneamente representaciones dispersas para agrupar o inspeccionar parches, como paso previo a estudios de sesgo o de cobertura del dataset.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| KL retenida (held-out) | 0,038903881 nats/imagen |
| Precisión (accuracy) | 98,5290 % |
| MSE de parche normalizado | 0,54431826 |
| Diferencia media pareada local-menos-KL | 0,00254596 nats/imagen (5 semillas) |
| IC 95 % de la diferencia | [-0,00325909, 0,008351] |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 9,6 M de parámetros en safetensors, el artefacto es muy ligero, pero requiere cargar el backbone DINOv3 ViT-B/16 para operar.
- GPU recomendadas: no disponible de forma explícita; el backbone ViT-B/16 es de tamaño moderado y cabe en GPUs de consumo, pero el autor no publica requisitos.
- ¿Cabe en GPU de consumo? No confirmado en la documentación; el featurizador en sí es pequeño, el cuello de botella es el backbone.
- Opciones de despliegue: el autor indica instalación con `uv sync --frozen` y descarga con `hf download`, usando la API `e2e_bsf.inference.VisionFeaturizer`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo visual de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-mse-seed101 | BSF block-sparse sobre DINOv3 ViT-B/16 | 9.599.498 | no disponible | MIT (backbone aparte) | Hugging Face |
| SAE ReLU convencional sobre DINOv3 | SAE | no disponible | no disponible | no disponible | no disponible |
| Goodfire block-sparse featurizer (código de referencia) | BSF | no disponible | no disponible | no disponible | GitHub |

No se dispone de datos comparativos de rendimiento frente a alternativas en la información proporcionada.

## Limitaciones y advertencias

- Estudio exploratorio: el autor declara que no se alcanzó el objetivo de potencia estadística y que la comparación direccional local frente a KL es no concluyente (el IC 95 % incluye cero).
- La KL baja solo mide la preservación del readout de 10 clases; no establece conceptos semánticos, fidelidad completa a DINOv3 ni aceleración de inferencia.
- El artefacto excluye los pesos de DINO y las fotos; se requiere acceso autorizado a DINOv3 y su licencia separada. La licencia MIT del repo no relicencia el backbone.
- Solo se completó 1 época de entrenamiento, lo que limita la madurez de las características aprendidas.
- El orden de clases sigue el de torchvision Imagenette; usarlo con otro orden produce etiquetas incorrectas.
- Idiomas: etiqueta `en`, pero el modelo no procesa texto; no hay capacidades multilingües.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de sobreinterpretar las características dispersas como conceptos semánticos.
- Uso comercial: la licencia MIT cubre el artefacto, pero el uso del backbone DINOv3 está sujeto a su licencia propia, que debe verificarse antes de producción.
- No hay datos publicados de sesgos, latencia ni throughput.

## Enlaces

- Hugging Face: https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-mse-seed101
- Repositorio del proyecto: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers
- Preregistro: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md
- Paper BSF: https://arxiv.org/abs/2606.25234
- Paper SAE end-to-end: https://arxiv.org/abs/2405.12241
- Código de referencia Goodfire: https://github.com/goodfire-ai/block-sparse-featurizer
- Modelo base DINOv3: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m

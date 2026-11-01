# BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-mse-seed103

## Resumen

El modelo `BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-mse-seed103` es un *sparse autoencoder* (SAE) de tipo block-sparse, denominado por el autor como *featurizer*, entrenado desde cero sobre las activaciones de un clasificador de parches fijo basado en DINOv3 ViT-B/16 y el conjunto de datos Imagenette. No es un modelo generativo ni un modelo de lenguaje: es una herramienta de interpretabilidad que descompone representaciones internas de una red vision transformer en características dispersas y, en teoría, más interpretables.

El artefacto se enmarca en un estudio preregistrado y acotado sobre *block-sparse featurizers* (BSF) de extremo a extremo. El perfil de entrenamiento es "full" con una sola época completada, y la variante concreta es `scalar_mse` con semilla 103. El autor advierte explícitamente de que estos artefactos son *featurizers* de anchura uno con signo ligado, no SAEs ReLU convencionales, lo que cambia la interpretación habitual de las métricas de dispersión.

La relevancia actual del modelo es metodológica: forma parte de una comparación entre objetivos de entrenamiento (MSE escalar frente a divergencia KL) para evaluar si un featurizer block-sparse preserva la fidelidad de salida de un clasificador congelado. El resultado del estudio es exploratorio e inconcluyente: el intervalo de confianza del 95 % de la diferencia media pareada incluye el cero, y el objetivo de potencia del piloto no se alcanzó.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder block-sparse (BSF) sobre DINOv3 ViT-B/16 congelado; featurizer escalar de anchura uno con signo ligado |
| Parámetros totales | 9.607.690 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (etiqueta del repositorio; el modelo opera sobre imágenes, no sobre texto) |
| Licencia | MIT (solo para los pesos del BSF; el backbone DINOv3 mantiene su licencia separada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un *featurizer* block-sparse entrenado de extremo a extremo contra un clasificador de parches de diez clases (Imagenette) que permanece fijo sobre un backbone DINOv3 ViT-B/16 (`facebook/dinov3-vitb16-pretrain-lvd1689m`). La arquitectura sigue el enfoque de *block-sparse featurizers* descrito en el paper de referencia (arXiv:2606.25234) y se inspira en el trabajo de SAEs de extremo a extremo (arXiv:2405.12241). La variante `scalar_mse` usa un objetivo de error cuadrático medio escalar, en contraste con la variante KL del mismo estudio.

El entrenamiento se realizó desde cero con una sola época completada (perfil "full") y semilla 103. El artefacto incluye los pesos del BSF, la normalización fija y el clasificador entrenado; excluye los pesos de DINO y las imágenes. El repositorio incluye `config.json` (que fija revisiones, arquitectura, objetivo, semilla, preprocesado e identidades de entrenamiento), `manifest.json` y `duplicate_audit.json` (asignaciones de imágenes y evidencia de exclusiones) y `teacher.json` (selección del clasificador). El checkpoint de entrenamiento local conserva además estado del optimizador y del RNG, pero el `model.safetensors` publicado es solo para inferencia.

## Capacidades

- Extracción de características block-sparse a partir de activaciones de DINOv3 ViT-B/16 sobre parches de imagen.
- Clasificación de parches en las diez clases de Imagenette (la salida principal es la predicción del clasificador fijo).
- Producción de representaciones dispersas orientadas a análisis de interpretabilidad.
- Inferencia por lotes de imágenes mediante la API `VisionFeaturizer.predict`.
- No soporta *tool calling*, agentes, razonamiento multi-paso, texto, audio ni visión generativa.
- No es un modelo multilingüe ni un modelo de lenguaje.

## Casos de uso

- Análisis de interpretabilidad de DINOv3: descomponer activaciones de un ViT-B/16 en características block-sparse para estudiar qué direcciones del espacio latente se activan ante parches concretos de Imagenette.
- Reproducción de estudios preregistrados: el artefacto incluye manifiestos y auditoría de duplicados, lo que permite replicar la comparación MSE frente a KL con la misma semilla y partición de datos.
- Evaluación de fidelidad de readout: medir la divergencia KL (0,2399 nats/imagen) y la precisión (91,35 %) de un clasificador congelado al sustituir sus activaciones por las del featurizer.
- Docencia y formación en SAEs: ejemplo concreto y de pequeño tamaño (9,6 M de parámetros) para ilustrar el entrenamiento de *block-sparse featurizers* de extremo a extremo.
- Investigación sobre dispersión estructurada: comparar el comportamiento de un featurizer de anchura uno con signo ligado frente a SAEs ReLU convencionales en tareas de visión.
- Auditoría de pipelines de interpretabilidad: verificar que las métricas de preservación de readout no se confunden con fidelidad semántica ni con aceleración de inferencia.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| KL retenida (held-out) | 0,23990627 nats/imagen |
| Precisión (accuracy) | 91,3548 % |
| MSE de parche normalizado | 0,66484427 |
| Diferencia media pareada local menos KL | 0,00254596 nats/imagen sobre 5 semillas |
| Intervalo de confianza al 95 % (nivel de semilla) | [-0,00325909, 0,008351] |

El intervalo incluye el cero, por lo que la comparación direccional entre el objetivo local (MSE) y KL es inconcluyente. El autor indica que el objetivo de potencia del piloto no se alcanzó y que el estudio es exploratorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 9,6 M de parámetros y pesos en safetensors, el artefacto es muy ligero (el repositorio ocupa 0,0 GB según HuggingFace).
- GPU recomendadas: no disponibles; el cuello de botella real es el backbone DINOv3 ViT-B/16, que debe cargarse aparte y requiere acceso autorizado.
- Cabe en GPU de consumo: previsiblemente sí para el BSF; el backbone DINOv3 ViT-B/16 también es apto para GPU de consumo, aunque no se aportan cifras concretas.
- Opciones de despliegue: el proyecto oficial se instala con `uv sync --frozen` y se usa mediante `e2e_bsf.inference.VisionFeaturizer`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BSF `scalar_mse`, seed 103) | 9,6 M | no aplica | KL 0,2399; acc 91,35 % | MIT (BSF) + licencia DINOv3 | HuggingFace |
| Variante KL del mismo estudio | no disponible | no aplica | KL media inferior según el autor (diferencia 0,0025 nats/imagen, IC incluye cero) | MIT (BSF) + licencia DINOv3 | Referenciada en el estudio |
| SAEs ReLU convencionales sobre ViT | no disponible | no aplica | no disponible | variable | no disponible |
| DINOv3 ViT-B/16 (backbone) | no disponible en la información | no aplica | no disponible | licencia DINOv3 separada | HuggingFace (acceso autorizado) |

No se dispone de comparativas numéricas con SAEs ReLU estándar ni con otros featurizers block-sparse en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que una KL más baja solo mide la preservación de un *readout* de diez clases; no establece conceptos semánticos, fidelidad completa a DINO ni aceleración de inferencia.
- Estudio exploratorio: el objetivo de potencia no se alcanzó y la comparación direccional MSE frente a KL es inconcluyente (el IC del 95 % incluye el cero).
- Solo una época de entrenamiento completada, lo que limita la madurez del artefacto.
- El artefacto excluye los pesos de DINO y las imágenes; se requiere acceso autorizado a DINOv3 y aceptar su licencia separada. La licencia MIT del repositorio no relicencia el backbone.
- El modelo está etiquetado para inglés (`en`), pero opera sobre imágenes; no es un modelo de lenguaje y no debe evaluarse como tal.
- No se documentan sesgos, tasas de alucinación ni comportamientos fuera de la tarea de clasificación de parches de Imagenette.
- El orden de clases sigue el de torchvision Imagenette; usarlo con otro orden invalida las predicciones.
- No hay datos publicados sobre cuantización, latencia ni throughput, lo que dificulta planificar despliegues en producción.

## Enlaces

- HuggingFace: https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-mse-seed103
- Repositorio del proyecto: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers
- Paper BSF: https://arxiv.org/abs/2606.25234
- Paper de SAEs de extremo a extremo: https://arxiv.org/abs/2405.12241
- Código de Goodfire (block-sparse featurizer): https://github.com/goodfire-ai/block-sparse-featurizer
- Preregistro del estudio: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md
- Modelo base: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m

# BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-mse-seed104

## Resumen

Este repositorio contiene un *sparse autoencoder* de bloques (block-sparse featurizer, BSF) entrenado desde cero para interpretar un clasificador de parches de imagen basado en DINOv3. No es un modelo generativo ni un LLM: es un artefacto de investigación en interpretabilidad que aprende una representación dispersa de las activaciones de un backbone congelado (facebook/dinov3-vitb16-pretrain-lvd1689m) y las mapea a la salida de un clasificador fijo de diez clases sobre el dataset Imagenette.

El modelo lo publica BurnyCoder dentro de un estudio preregistrado sobre featurizers dispersos de extremo a extremo. La variante aquí publicada usa un objetivo de error cuadrático medio escalar (`scalar_mse`) con la semilla 104 y perfil `full`, tras una única época de entrenamiento. Los artefactos escalares son featurizers de ancho uno con signo, no SAEs ReLU convencionales, lo que cambia la interpretación habitual de las activaciones.

Su relevancia es metodológica: sirve para evaluar si un featurizer disperso preserva la fidelidad de un *readout* concreto (KL de 0,24396472 nats/imagen y precisión del 91,0710 % en held-out) y para comparar objetivos de entrenamiento (local frente a KL) bajo un protocolo preregistrado. El estudio es exploratorio y no alcanzó la potencia estadística prevista, por lo que las conclusiones direccionales son inconclusas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder de bloques (block-sparse featurizer) sobre backbone ViT-B/16 DINOv3 congelado |
| Parametros totales | 9.607.690 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión por parches, no textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (metadatos del repositorio) |
| Licencia | MIT (no relicencia el backbone DINOv3, que requiere acceso autorizado y licencia propia) |
| Formato de pesos | safetensors (`model.safetensors`, solo inferencia) |

## Arquitectura y entrenamiento

El featurizer se entrena desde cero sobre las activaciones de un DINOv3 ViT-B/16 preentrenado con LVD-1689M y congelado, con un clasificador de parches fijo de diez clases (orden de clases de torchvision Imagenette). La dispersión es por bloques (*block sparsity*), siguiendo el enfoque del block-sparse featurizer de Goodfire, y el objetivo de esta variante es un MSE escalar sobre artefactos de ancho uno con signo, no una reconstrucción ReLU clásica. El checkpoint incluye pesos del BSF, normalización fija y el clasificador entrenado; excluye los pesos de DINO y las imágenes.

El entrenamiento se realizó durante 1 época con perfil `full` y semilla 104, dentro de un estudio preregistrado de potencia acotada. Se comparó el objetivo local con el objetivo KL: la diferencia media pareada local menos KL fue de 0,00254596 nats/imagen sobre 5 semillas, con intervalo de confianza del 95 % de [-0,00325909, 0,008351]. Al incluir el cero, la comparación direccional es inconclusa y el objetivo piloto de potencia no se alcanzó. Los ficheros `config.json`, `manifest.json`, `duplicate_audit.json` y `teacher.json` documentan revisiones, asignación de imágenes, evidencia de exclusión y selección del clasificador.

## Capacidades

- Extracción de características dispersas por bloques de parches de imagen a través de un backbone DINOv3 ViT-B/16.
- Clasificación de parches en las diez clases de Imagenette mediante el clasificador fijo incluido.
- Predicción de probabilidades por imagen vía `VisionFeaturizer.predict` sobre imágenes RGB.
- Preservación del *readout* del clasificador: KL held-out de 0,24396472 nats/imagen y precisión del 91,0710 %.
- Reconstrucción de parches con MSE normalizado de 0,66517836.
- No soporta tool calling, agentes, generación de texto, visión generativa ni razonamiento multi-paso.
- No es multilingüe ni procesa texto: su dominio es exclusivamente visual y en inglés en los metadatos.

## Casos de uso

- Investigación en interpretabilidad mecanicista: analizar qué direcciones dispersas activa el clasificador de Imagenette para estudiar la relación entre características aprendidas y clases, usando los logits por imagen incluidos en el repositorio.
- Reproducción de estudios preregistrados: replicar la comparación entre objetivos local y KL con las cinco semillas y verificar el intervalo de confianza reportado.
- Auditoría de fidelidad de *readouts*: medir cuánta información del clasificador original se conserva tras la compresión dispersa, usando KL y precisión como métricas de referencia.
- Docencia sobre SAEs y dispersión por bloques: ilustrar las diferencias entre featurizers de ancho uno con signo y SAEs ReLU con un caso reproducible y código disponible.
- Desarrollo de *probes* de clasificación sobre DINOv3: emplear el artefacto como extractor ligero de características para clasificación de parches en pipelines de visión.
- Evaluación de metodologías de exclusión de datos: reutilizar `manifest.json` y `duplicate_audit.json` como plantilla para auditar duplicados y asignaciones de imágenes en experimentos propios.
- Comparación de objetivos de entrenamiento en SAEs: usar los artefactos de esta semilla como punto de referencia frente a otras semillas y perfiles del mismo estudio.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KL held-out | 0,24396472 nats/imagen |
| Precision (accuracy) | 91,0710 % |
| MSE de parche normalizado | 0,66517836 |
| Diferencia media pareada local menos KL | 0,00254596 nats/imagen (5 semillas) |
| Intervalo de confianza 95 % de la diferencia | [-0,00325909, 0,008351] |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un LLM.

## Requisitos de hardware

- El artefacto pesa 0,0 GB (9.607.690 parámetros en safetensors), por lo que cabe holgadamente en cualquier GPU consumer.
- Requiere ejecutar en paralelo el backbone DINOv3 ViT-B/16, cuyos pesos no se incluyen y exigen acceso autorizado; su VRAM dependerá de la implementación y del tamaño de lote de parches.
- GPU recomendadas: cualquier GPU con suficiente VRAM para el ViT-B/16 (por ejemplo, RTX 3090, RTX 4090, A100, H100); el BSF en sí no impone requisitos significativos.
- Despliegue previsto mediante el paquete del proyecto (`uv sync --frozen`) y la API `VisionFeaturizer`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-mse-seed104 | 9.607.690 | no aplica | KL 0,24396472; acc. 91,0710 % | MIT (backbone aparte) | HuggingFace |
| Block-sparse featurizer de Goodfire (referencia) | no disponible | no aplica | no disponible | no disponible | GitHub |
| SAEs de extremo a extremo (paper arXiv:2405.12241) | no disponible | no aplica | no disponible | no disponible | paper |

No se dispone de datos comparativos homogéneos de parámetros, contexto o rendimiento para los modelos de referencia en la información proporcionada.

## Limitaciones y advertencias

- Estudio exploratorio: el objetivo piloto de potencia no se alcanzó y la comparación direccional local frente a KL es inconclusa (el intervalo de confianza incluye cero).
- Un KL más bajo solo mide la preservación de este *readout* de diez clases; no establece conceptos semánticos, fidelidad completa a DINO ni aceleración de inferencia.
- Entrenado con una única época y una sola semilla publicada; la generalización a otras semillas, perfiles o clasificadores no está demostrada.
- Dominio restringido a Imagenette y a clasificación de parches; no es un modelo generativo ni un LLM.
- Los artefactos escalares son featurizers de ancho uno con signo, no SAEs ReLU convencionales; las interpretaciones habituales de activaciones no se trasladan directamente.
- La licencia MIT del repositorio no relicencia el backbone DINOv3, que requiere acceso autorizado y su licencia separada.
- Riesgo de alucinación y sesgos: no aplica en el sentido de modelos generativos, pero el clasificador puede heredar sesgos del dataset Imagenette y del backbone.
- No se documentan cuantizaciones ni formatos alternativos a safetensors para inferencia.

## Enlaces

- HuggingFace: https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-mse-seed104
- Repositorio del proyecto: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers
- Preregistración: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md
- Paper BSF: https://arxiv.org/abs/2606.25234
- Paper de SAEs de extremo a extremo: https://arxiv.org/abs/2405.12241
- Código de Goodfire: https://github.com/goodfire-ai/block-sparse-featurizer
- Modelo base: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m

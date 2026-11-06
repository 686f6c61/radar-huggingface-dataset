# BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-kl-seed100

## Resumen

Este repositorio contiene un sparse autoencoder (SAE) de tipo block-sparse entrenado desde cero sobre la representación interna de un clasificador de parches DINOv3/Imagenette. No es un modelo generativo ni un modelo de lenguaje: es un artefacto de investigación en interpretabilidad mecánica que aprende un featurizer disperso (block-sparse featurizer, BSF) para descomponer activaciones de un Vision Transformer concreto (facebook/dinov3-vitb16-pretrain-lvd1689m). Lo desarrolla el usuario independiente BurnyCoder como parte de un estudio preregistrado sobre featurizers dispersos de extremo a extremo.

El artefacto concreto corresponde al perfil "full", semilla 100, con una sola época de entrenamiento completada, y forma parte de un estudio comparativo entre dos objetivos de entrenamiento: KL (divergencia KL sobre la salida del clasificador) y local (diferencia local). El resultado principal del estudio es exploratorio y no concluyente: la diferencia media pareada local-menos-KL es de 0,00254596 nats/imagen sobre 5 semillas, con un intervalo de confianza al 95 % de [-0,00325909, 0,008351] que incluye el cero. El autor declara explícitamente que no se alcanzó el objetivo de potencia del piloto.

La relevancia es acotada y metodológica: sirve como pieza reproducible de un estudio sobre SAEs con dispersión estructurada (block-sparsity) y objetivos de reconstrucción definidos en el espacio de salida de un clasificador, en lugar del espacio de activaciones latentes habitual. El modelo pesa 9.607.690 parámetros (safetensors) e incluye los pesos del BSF, la normalización fija y el clasificador entrenado, pero excluye los pesos de DINOv3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder con block-sparsity (Grassmannian block-sparse featurizer), entrenado sobre un ViT-B/16 (DINOv3) congelado y un clasificador de 10 clases |
| Parametros totales | 9.607.690 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: procesa parches de imagen, no secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta declarada; el artefacto no procesa texto, opera sobre imágenes) |
| Licencia | MIT (no relicencia el backbone DINOv3, que requiere acceso autorizado y licencia propia) |
| Formato de pesos | safetensors (inferencia); el checkpoint local de entrenamiento conserva además estado de optimizador y RNG |
| Modelo base | facebook/dinov3-vitb16-pretrain-lvd1689m |
| Perfil | full |
| Épocas completadas | 1 |
| Semilla | 100 |
| Objetivo | scalar KL |
| Tarea | Clasificación de parches Imagenette (10 clases, orden torchvision) |
| Tamaño del repo | 0.0 GB |

## Arquitectura y entrenamiento

El artefacto es un featurizer disperso con restricción de bloque (block-sparse featurizer) entrenado de extremo a extremo contra un clasificador de parches fijo construido sobre DINOv3 ViT-B/16. A diferencia de los SAEs convencionales con activación ReLU, el autor indica que los artefactos "scalar" son featurizers de anchura uno con signo vinculado (tied signed width-one featurizers), no SAEs ReLU convencionales. La dispersión es estructurada por bloques, lo que impone una topología de grupo sobre las características activas en lugar de selección independiente por unidad.

El entrenamiento se realizó desde cero con un objetivo escalar de divergencia KL sobre la salida del clasificador (perfil "full", 1 época, semilla 100), dentro de un estudio preregistrado que compara este objetivo con una variante "local". El autor reporta que el estudio es exploratorio y que no se alcanzó el objetivo de potencia del piloto: la diferencia media pareada local-menos-KL es de 0,00254596 nats/imagen sobre 5 semillas, con intervalo del 95 % [-0,00325909, 0,008351], que incluye el cero. El entrenamiento con KL mostró menor divergencia media de salida. El repositorio incluye `config.json` (revisiones, arquitectura, objetivo, semilla, preprocesado e identidades de entrenamiento), `manifest.json` y `duplicate_audit.json` (asignación de imágenes y evidencia de exclusión) y `teacher.json` (selección del clasificador).

## Capacidades

- Extracción de características dispersas y estructuradas en bloques a partir de activaciones de DINOv3 ViT-B/16 sobre parches de imagen.
- Clasificación de imágenes en 10 clases de Imagenette mediante el clasificador entrenado incluido en el artefacto.
- Predicción de probabilidades por imagen a través de la API `VisionFeaturizer.predict` del paquete `e2e_bsf`.
- Reconstrucción/preservación del readout del clasificador, medida mediante divergencia KL (0,032825775 nats/imagen en held-out).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo "thinking".
- Capacidades multilingües: no aplica; el artefacto no procesa lenguaje natural.
- Capacidad especial: dispersión por bloques (block-sparsity) como mecanismo de interpretabilidad, no de aceleración de inferencia (el autor lo advierte explícitamente).

## Casos de uso

- Investigación en interpretabilidad mecánica: usar el BSF para descomponer activaciones de DINOv3 ViT-B/16 en características dispersas por bloques y estudiar qué direcciones del espacio latente se activan ante parches concretos de Imagenette.
- Reproducción de estudios preregistrados: replicar el protocolo del estudio (perfil full, semilla 100, objetivo scalar KL) con el paquete `e2e_bsf` instalado mediante `uv sync --frozen` y comparar métricas held-out (KL, accuracy, MSE normalizado de parches).
- Comparación de objetivos de entrenamiento de SAEs: emplear este artefacto como rama KL frente a la rama local del mismo estudio para analizar diferencias de divergencia de salida (0,00254596 nats/imagen de media pareada, no concluyente).
- Auditoría de clasificadores de visión: analizar la preservación del readout de un clasificador de 10 clases sobre Imagenette (accuracy 99,1226 %) y detectar qué características dispersas sostienen cada decisión.
- Docencia y experimentación con block-sparsity: usar el artefacto como ejemplo reproducible de featurizer con dispersión estructurada y anchura uno con signo vinculado, frente a SAEs ReLU convencionales.
- Validación de pipelines de inferencia: probar la integración de `VisionFeaturizer` en flujos de preprocesado de imagen (normalización fija incluida) y verificar el orden de clases torchvision de Imagenette.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| KL held-out | 0,032825775 nats/imagen |
| Accuracy | 99,1226 % |
| MSE normalizado de parches | 0,79012638 |
| Diferencia media pareada local-menos-KL | 0,00254596 nats/imagen (5 semillas) |
| Intervalo de confianza al 95 % (seed-level) | [-0,00325909, 0,008351] (incluye cero; no concluyente) |
| Potencia del estudio | objetivo de potencia del piloto no alcanzado (exploratorio) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; el artefacto no es un modelo de lenguaje y las métricas reportadas son específicas del estudio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el artefacto pesa 9,6 M de parámetros, pero requiere cargar el backbone DINOv3 ViT-B/16 (no incluido en el repositorio) para operar.
- GPU recomendadas: no disponible. El backbone ViT-B/16 es de tamaño moderado y cabe previsiblemente en GPUs de consumo, pero el autor no publica requisitos ni mediciones.
- Cabe en consumer GPU: no confirmado en la información disponible.
- Opciones de despliegue: paquete `e2e_bsf` (instalación con `uv sync --frozen`), descarga con `hf download` y uso de `VisionFeaturizer`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-kl-seed100 | 9.607.690 | no aplica | SAE block-sparse sobre DINOv3/Imagenette | MIT (backbone aparte) | Hugging Face, 26 descargas |
| SAEs ReLU convencionales (p. ej. family de SAELens) | variable | no aplica | Descomposición dispersa de activaciones | variable | no disponible en la información proporcionada |
| Block-sparse featurizer de Goodfire (código de referencia) | no disponible | no aplica | Featurizer block-sparse | no disponible | Repositorio GitHub citado por el autor |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Estudio exploratorio: el objetivo de potencia del piloto no se alcanzó y la comparación direccional local vs. KL es no concluyente (el intervalo al 95 % incluye cero).
- Una sola época de entrenamiento completada (perfil full, semilla 100); no debe interpretarse como un featurizer maduro.
- El autor advierte que un KL más bajo solo mide la preservación del readout de 10 clases; no establece conceptos semánticos, fidelidad completa a DINOv3 ni aceleración de inferencia.
- El artefacto excluye los pesos de DINOv3 y las fotos; se requiere acceso autorizado a DINOv3 y su licencia separada. La licencia MIT del repositorio no relicencia el backbone.
- El orden de clases sigue torchvision Imagenette; usarlo con otro orden invalida las predicciones.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no tiene capacidades multilingües.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las características dispersas no deben interpretarse como conceptos semánticos verificados.
- Uso comercial: la licencia MIT cubre el artefacto, pero el uso del backbone DINOv3 está sujeto a su licencia propia; verificar antes de desplegar en producción.
- No se documentan sesgos del clasificador ni del conjunto Imagenette en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-kl-seed100
- Repositorio del proyecto: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers
- Preregistración: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md
- Paper BSF: https://arxiv.org/abs/2606.25234
- Paper end-to-end SAE: https://arxiv.org/abs/2405.12241
- Código de referencia Goodfire: https://github.com/goodfire-ai/block-sparse-featurizer
- Modelo base: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m

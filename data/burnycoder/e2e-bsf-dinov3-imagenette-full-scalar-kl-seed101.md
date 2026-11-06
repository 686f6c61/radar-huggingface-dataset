# BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-kl-seed101

## Resumen

El modelo `e2e-bsf-dinov3-imagenette-full-scalar-kl-seed101` es un sparse autoencoder (SAE) de tipo block-sparse featurizer entrenado desde cero por BurnyCoder para interpretabilidad sobre un clasificador de parches DINOv3/Imagenette. No es un modelo generativo ni un LLM: es un artefacto de análisis que proyecta activaciones de un backbone congelado (`facebook/dinov3-vitb16-pretrain-lvd1689m`) en un espacio disperso, con el objetivo de estudiar qué representaciones internas sostienen una tarea de clasificación de 10 clases.

Se trata de un estudio preregistrado y acotado, con una sola época de entrenamiento completada y una semilla (101) dentro de una comparativa de 5 semillas entre dos objetivos de entrenamiento (local vs. KL). El resultado principal es que la diferencia media pareada local-menos-KL es de 0,00254596 nats/imagen con un intervalo de confianza del 95 % de [-0,00325909, 0,008351], que incluye el cero, por lo que la comparación direccional se declara no concluyente y el estudio queda como exploratorio (no alcanzó la potencia objetivo).

Con 9.607.690 parámetros en safetensors y licencia MIT sobre los pesos del featurizer (el backbone DINOv3 mantiene su licencia separada), es relevante para investigadores que trabajan en interpretabilidad mecanicista con SAEs, block-sparsity y evaluación rigurosa de artefactos de interpretación, no para despliegues de producción de visión por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder block-sparse (featurizer Grassmannian con anchura firmada de uno) sobre backbone DINOv3 ViT-B/16 congelado |
| Parametros totales | 9.607.690 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta del repo; el modelo opera sobre imágenes, no texto) |
| Licencia | MIT (solo los pesos del featurizer; el backbone DINOv3 requiere acceso autorizado y licencia propia) |
| Formato de pesos | safetensors (`model.safetensors` para inferencia; checkpoint local adicional con estado de optimizador y RNG) |

## Arquitectura y entrenamiento

El artefacto es un featurizer block-sparse entrenado de extremo a extremo contra un clasificador de parches fijo construido sobre DINOv3 ViT-B/16. La variante `scalar` corresponde a "tied signed width-one featurizers", es decir, artefactos escalares que no son SAEs ReLU convencionales. El perfil de entrenamiento es `full`, con 1 época completada y semilla 101. El objetivo comparado es `kl` (divergencia KL), frente a una variante local evaluada en el mismo estudio preregistrado de 5 semillas.

El entrenamiento se realizó desde cero sobre el clasificador congelado, con normalización fija incluida en el artefacto y sin pesos DINO en el repositorio. El estudio está preregistrado y sus artefactos de procedencia (`config.json`, `manifest.json`, `duplicate_audit.json`, `teacher.json`) documentan revisiones, arquitectura, objetivo, semilla, preprocesado e identidades de entrenamiento, además de las asignaciones de imágenes y la evidencia de exclusión de duplicados. El paper de referencia del método es el de block-sparse featurizers (arXiv:2606.25234) y el de SAEs end-to-end (arXiv:2405.12241).

## Capacidades

- Proyección de activaciones de DINOv3 ViT-B/16 a un espacio disperso block-sparse para análisis de interpretabilidad.
- Clasificación de parches de imagen en las 10 clases de Imagenette (orden de clases según torchvision).
- Predicción de probabilidades por imagen mediante la API `VisionFeaturizer.predict`.
- Evaluación de fidelidad de reconstrucción mediante KL en nats/imagen y MSE normalizado de parches.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No es un modelo multimodal generativo: no genera texto, código ni descripciones de imágenes.
- Capacidades multilingües: no aplica (entrada visual, salida de 10 clases).

## Casos de uso

- Investigación en interpretabilidad mecanicista: analizar qué direcciones del espacio de activaciones de DINOv3 sostienen la clasificación de Imagenette, usando el featurizer como sonda dispersa sobre un backbone congelado.
- Reproducción de estudios preregistrados: el artefacto incluye manifiestos, auditoría de duplicados y configuración vinculada a revisiones, lo que permite replicar la comparativa local vs. KL con la semilla 101.
- Comparación de objetivos de entrenamiento de SAEs: servir como punto de datos (una de 5 semillas) en la comparación pareada de divergencia de salida entre objetivos local y KL.
- Auditoría de fidelidad de readout: medir cuánto se preserva la clasificación de 10 clases tras la proyección dispersa usando la KL held-out de 0,03030592 nats/imagen y la accuracy del 98,9935 %.
- Docencia y divulgación sobre SAEs: ejemplo reproducible de featurizer block-sparse con métricas completas y logits por imagen adjuntos.
- Estudio de block-sparsity en vision transformers: analizar el efecto de la estructura block-sparse frente a SAEs ReLU convencionales en un ViT-B/16.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KL held-out | 0,03030592 nats/imagen |
| Accuracy | 98,9935 % |
| MSE normalizado de parches | 0,78970665 |
| Diferencia media pareada local-menos-KL | 0,00254596 nats/imagen (5 semillas) |
| Intervalo de confianza al 95 % (nivel de semilla) | [-0,00325909, 0,008351] |

No se han publicado resultados comparativos frente a otros modelos en la información disponible. El propio autor advierte que una KL más baja solo mide la preservación de este readout de diez clases y no establece conceptos semánticos, fidelidad completa a DINO ni aceleración de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el featurizer tiene 9,6 M de parámetros, pero requiere cargar además el backbone DINOv3 ViT-B/16 (aproximadamente 86 M de parámetros, no incluido en el repo), lo que domina el consumo.
- GPU recomendadas: no disponible; cualquier GPU con memoria suficiente para ViT-B/16 en fp32 o fp16 debería bastar, pero no se han publicado medidas.
- Cabe en GPU consumer: previsiblemente sí para el backbone ViT-B/16, aunque no se confirma en la documentación.
- Opciones de despliegue: el proyecto oficial usa `uv sync --frozen` y `hf download`, con inferencia mediante `e2e_bsf.inference.VisionFeaturizer`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| e2e-bsf-dinov3-imagenette-full-scalar-kl-seed101 | 9,6 M (featurizer) + backbone DINOv3 ViT-B/16 | no aplica | KL 0,03030592; accuracy 98,9935 % | MIT (featurizer); DINOv3 aparte | Hugging Face |
| Block-sparse featurizer de Goodfire (referencia) | no disponible | no aplica | no disponible | no disponible | GitHub |
| SAEs end-to-end (arXiv:2405.12241) | no disponible | no aplica | no disponible | no disponible | Paper |

No se dispone de datos comparativos de rendimiento frente a alternativas en la información proporcionada.

## Limitaciones y advertencias

- Estudio exploratorio: no se alcanzó la potencia objetivo del piloto y la comparación direccional local vs. KL es no concluyente (el intervalo de confianza incluye el cero).
- Solo 1 época de entrenamiento completada y una única semilla publicada en este repo (la comparativa abarca 5 semillas a nivel de estudio).
- La KL baja solo mide la preservación del readout de 10 clases de Imagenette; no implica conceptos semánticos, fidelidad completa a DINO ni aceleración de inferencia.
- El repositorio no incluye los pesos de DINOv3: se requiere acceso autorizado y aceptar su licencia separada; la MIT de este repo no relicencia el backbone.
- El artefacto no incluye fotos ni datos de entrenamiento; solo pesos, normalización fija y clasificador entrenado.
- Idioma declarado: inglés (etiqueta del repo); no aplica a texto en la práctica.
- No es un modelo generativo: no debe usarse para tareas de generación, razonamiento, código ni agentes.
- Riesgo de alucinación: no aplica en el sentido habitual, pero las interpretaciones semánticas de las features dispersas no están validadas por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-kl-seed101
- Repositorio del proyecto: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers
- Preregistro: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md
- Paper BSF: https://arxiv.org/abs/2606.25234
- Paper SAE end-to-end: https://arxiv.org/abs/2405.12241
- Código de Goodfire: https://github.com/goodfire-ai/block-sparse-featurizer
- Modelo base DINOv3: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m

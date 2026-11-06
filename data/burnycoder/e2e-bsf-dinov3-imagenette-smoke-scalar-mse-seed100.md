# BurnyCoder/e2e-bsf-dinov3-imagenette-smoke-scalar-mse-seed100

## Resumen

El modelo `e2e-bsf-dinov3-imagenette-smoke-scalar-mse-seed100`, publicado por BurnyCoder, es un *featurizer* de bloques dispersos (block-sparse featurizer, BSF) entrenado desde cero sobre las representaciones de un clasificador de parches DINOv3/Imagenette. No es un modelo generativo ni un LLM: es un artefacto de interpretabilidad que aprende a reconstruir, con dispersión por bloques, las activaciones de un backbone congelado `facebook/dinov3-vitb16-pretrain-lvd1689m` (ViT-B/16). Su propósito es servir de herramienta de análisis de representaciones internas en visión por computador, siguiendo la línea de los autoencoders dispersos aplicados a interpretabilidad.

El artefacto es un *smoke run*: solo se completaron 3 épocas de entrenamiento y el propio autor lo describe como una demostración de ingeniería sin valor científico confirmatorio. Los pesos ocupan un espacio mínimo (232.042 parámetros, repo de 0,0 GB), lo que refleja que el featurizer es una capa ligera sobre el backbone, no un modelo independiente. La métrica principal reportada es la KL retenida frente al profesor (5,3281999 nats/imagen), con una precisión del 26,0000 % y un MSE de parche normalizado de 0,93699938.

Su relevancia es metodológica: documenta un pipeline completo de entrenamiento end-to-end de featurizers dispersos con auditoría de duplicados, preregistro y configuración versionada, y publica los logits por imagen junto a las métricas. Es útil para quien quiera reproducir o extender el enfoque BSF sobre DINOv3, no para desplegar un sistema de visión en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block-sparse featurizer (BSF) sobre backbone ViT-B/16 DINOv3 congelado; objetivo scalar MSE |
| Parametros totales | 232.042 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas de la model card; el modelo procesa imágenes, no texto) |
| Licencia | MIT (no relicencia el backbone DINOv3, que requiere acceso autorizado y licencia propia) |
| Formato de pesos | safetensors (`model.safetensors`, solo inferencia) |

## Arquitectura y entrenamiento

El modelo es un featurizer de bloques dispersos entrenado desde cero para un clasificador de parches DINOv3/Imagenette fijo. La arquitectura sigue el enfoque de *block-sparse featurization* (BSF) descrito en el paper arXiv:2606.25234 y en la línea de autoencoders dispersos end-to-end (arXiv:2405.12241): en lugar de aprender una representación densa, el featurizer produce activaciones organizadas en bloques con dispersión estructurada, lo que facilita el análisis de qué unidades se activan ante qué entradas. El backbone DINOv3 ViT-B/16 permanece congelado y el featurizer se entrena contra sus activaciones.

El entrenamiento se realizó con el objetivo `scalar_mse` y semilla 100, en perfil *smoke* con solo 3 épocas completadas. La configuración (`config.json`) fija revisiones, arquitectura, objetivo, semilla, preprocesado e identidades de entrenamiento; `manifest.json` y `duplicate_audit.json` preservan la asignación de imágenes y la evidencia de exclusión de duplicados; `teacher.json` registra la selección del clasificador profesor. El checkpoint local de entrenamiento conserva además el estado del optimizador y del generador de números aleatorios, aunque el repositorio publicado solo incluye los pesos de inferencia. No se especifican en la información disponible el número de tokens de entrenamiento (al tratarse de imágenes, número de parches o imágenes vistas), la composición exacta del dataset más allá de Imagenette, ni si hubo etapas de RLHF/DPO (no aplicables a este tipo de modelo).

## Capacidades

- Extracción de características dispersas por bloques sobre activaciones de DINOv3 ViT-B/16.
- Clasificación de parches de imagen en las 10 clases de Imagenette (orden de clases según torchvision Imagenette).
- Predicción de probabilidades por imagen mediante la API `VisionFeaturizer.predict([...])`.
- Reconstrucción aproximada de las activaciones del profesor, evaluable mediante KL retenida y MSE de parche normalizado.
- Análisis de interpretabilidad: identificación de bloques activos asociados a patrones visuales.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de modo *thinking*, visión generativa, audio ni capacidades multilingües más allá de las etiquetas en inglés.

## Casos de uso

- Investigación en interpretabilidad de representaciones: usar el featurizer para inspeccionar qué bloques se activan ante parches de Imagenette y contrastar con las activaciones del backbone DINOv3 congelado, aprovechando la dispersión estructurada para reducir el número de unidades a analizar.
- Reproducción de pipelines BSF: servir como referencia mínima y ejecutable (3 épocas, 232.042 parámetros) para validar la instalación del proyecto `e2e_bsf`, el flujo `uv sync --frozen` y la carga de pesos antes de lanzar entrenamientos completos.
- Auditoría metodológica: el artefacto incluye `manifest.json`, `duplicate_audit.json` y `teacher.json`, útiles como plantilla para documentar asignaciones de imágenes, exclusiones de duplicados y selección del profesor en experimentos propios.
- Docencia y divulgación: ejemplo compacto de cómo se entrena un featurizer disperso end-to-end contra un modelo fundacional de visión, con métricas de reconstrucción (KL 5,328 nats/imagen, MSE 0,937) fáciles de interpretar en clase.
- Pruebas de integración en CI: al pesar prácticamente nada y no requerir GPU de gran capacidad, puede usarse como caso de prueba de pipelines de inferencia que consumen safetensors y devuelven probabilidades por imagen.
- Comparación de objetivos de entrenamiento: al estar etiquetado como `scalar_mse` y semilla 100, permite contrastar con otras variantes del mismo autor (otras semillas u objetivos) para estudiar la sensibilidad del featurizer a la inicialización y a la función de pérdida.
- Análisis de preservación de *readout*: medir cuánta información de la clasificación de 10 clases se conserva tras la compresión dispersa, usando la precisión del 26,0000 % como línea base de un *smoke run*.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KL retenida (held-out) | 5,3281999 nats/imagen |
| Precision | 26,0000 % |
| MSE de parche normalizado | 0,93699938 |
| Epocas completadas | 3 (perfil smoke) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con otros featurizers o autoencoders dispersos. Las métricas anteriores son las únicas reportadas por el autor y corresponden a un *smoke run* sin valor confirmatorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 232.042 parámetros en el featurizer, el grueso del coste proviene del backbone DINOv3 ViT-B/16, que no se incluye en el repositorio y debe obtenerse por separado con acceso autorizado.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del backbone ViT-B/16, cabe esperar que una GPU consumer moderna sea suficiente, pero no se confirma en la documentación.
- ¿Cabe en GPU consumer? El featurizer en sí es trivial; el backbone ViT-B/16 condiciona el requisito real. No se especifica.
- Opciones de despliegue: el proyecto oficial usa `uv sync --frozen` y la clase `VisionFeaturizer` del paquete `e2e_bsf`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| e2e-bsf-dinov3-imagenette-smoke-scalar-mse-seed100 | 232.042 (featurizer) + backbone DINOv3 ViT-B/16 aparte | no aplica | Block-sparse featurizer sobre DINOv3 | MIT (backbone con licencia aparte) | Hugging Face, 34 descargas |
| Block-sparse featurizer de Goodfire (referencia de código) | no disponible | no aplica | BSF sobre modelos de lenguaje | no disponible | GitHub |
| Autoencoders dispersos end-to-end (arXiv:2405.12241) | no disponible | no aplica | SAE end-to-end | no disponible | Paper |
| DINOv3 ViT-B/16 (backbone base) | no disponible en la información | no aplica | ViT auto-supervisado | licencia DINOv3 separada | Meta / Hugging Face |

La comparación numérica con alternativas no está disponible: no se han publicado métricas homogéneas frente a otros featurizers o SAE en la información proporcionada.

## Limitaciones y advertencias

- Artefacto *smoke*: solo 3 épocas completadas; el autor indica explícitamente que no aporta ninguna afirmación científica confirmatoria.
- La KL baja solo mide la preservación del *readout* de 10 clases; no demuestra que se hayan aprendido conceptos semánticos, ni fidelidad completa respecto a DINO, ni aceleración de inferencia.
- Precisión del 26,0000 % en Imagenette: insuficiente para cualquier uso en producción como clasificador.
- El repositorio no incluye los pesos de DINO ni las imágenes; se requiere acceso autorizado a DINOv3 y aceptar su licencia separada. La licencia MIT del artefacto no relicencia el backbone.
- El orden de clases sigue torchvision Imagenette; cualquier uso con otro etiquetado producirá resultados incorrectos.
- Idiomas: etiquetado únicamente como `en`; no hay capacidades multilingües ni de texto.
- No hay información sobre sesgos, riesgo de alucinación (no aplica a un featurizer) ni restricciones adicionales de uso comercial más allá de las del backbone.
- El checkpoint publicado es solo para inferencia; no permite reanudar el entrenamiento sin el estado de optimizador y RNG, que no se distribuye.

## Enlaces

- Hugging Face: https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-smoke-scalar-mse-seed100
- Repositorio del proyecto: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers
- Preregistro: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md
- Paper BSF: https://arxiv.org/abs/2606.25234
- Paper de autoencoders dispersos end-to-end: https://arxiv.org/abs/2405.12241
- Código de Goodfire (block-sparse featurizer): https://github.com/goodfire-ai/block-sparse-featurizer
- Modelo base: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m

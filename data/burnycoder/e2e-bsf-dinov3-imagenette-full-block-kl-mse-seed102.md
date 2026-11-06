# BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-mse-seed102

## Resumen

Este repositorio contiene un *featurizer* de bloques dispersos (block-sparse featurizer, BSF) entrenado desde cero sobre un clasificador de parches DINOv3/Imagenette congelado. Lo desarrolla el usuario de Hugging Face BurnyCoder como parte de un estudio preregistrado sobre interpretabilidad de representaciones en modelos de visión. No es un modelo generativo ni un LLM: es un artefacto de análisis que transforma activaciones de un backbone DINOv3 en representaciones dispersas y firmadas, y que se evalúa por su capacidad de preservar la salida de un clasificador de diez clases.

El artefacto pesa aproximadamente 9,6 millones de parámetros (9.599.498 según los pesos en safetensors) y se distribuye en formato safetensors bajo licencia MIT. El backbone DINOv3 no se incluye en el repositorio: es necesario disponer de acceso autorizado a `facebook/dinov3-vitb16-pretrain-lvd1689m` y aceptar su licencia independiente. El perfil de entrenamiento es `full` y se completó un único epoch.

Su relevancia es metodológica: documenta de forma explícita métricas de divergencia KL, precisión y MSE normalizado sobre un conjunto de validación, junto con un análisis de potencia estadística que el propio autor califica de exploratorio e inconcluso. Resulta útil para investigadores que trabajen en sparse autoencoders, interpretabilidad mecanicista en visión y evaluación rigurosa de artefactos de este tipo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Featurizer de bloques dispersos (block-sparse featurizer) sobre backbone DINOv3 ViT-B/16 congelado |
| Parámetros totales | 9.599.498 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (según metadatos del repositorio) |
| Licencia | MIT (no relicencia el backbone DINOv3, que requiere licencia propia) |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un featurizer de bloques dispersos con anchura unitaria y signo, es decir, artefactos escalares que el autor describe explícitamente como distintos de los SAE con activación ReLU convencionales. Se entrena desde cero contra un clasificador de parches fijo sobre DINOv3 e Imagenette, con un perfil de entrenamiento `full` y un único epoch completado. La configuración (`config.json`) fija revisiones, arquitectura, objetivo, semilla, preprocesado e identidades de entrenamiento; el repositorio incluye además `manifest.json`, `duplicate_audit.json` y `teacher.json` para trazabilidad de asignaciones de imágenes, exclusiones y selección del clasificador profesor.

El estudio compara dos objetivos: uno basado en divergencia KL y otro local, con una diferencia media pareada de 0,00254596 nats/imagen a favor del objetivo local sobre cinco semillas. El intervalo de confianza al 95 % a nivel de semilla es [-0,00325909, 0,008351], que incluye el cero, por lo que la comparación direccional se declara inconclusa. El autor indica que el objetivo de potencia del piloto no se alcanzó y que el estudio es exploratorio. La métrica KL retenida en held-out es de 0,033402685 nats/imagen, con una precisión del 99,2516 % y un MSE de parche normalizado de 0,76851737.

## Capacidades

- Extracción de características dispersas a partir de activaciones de DINOv3 ViT-B/16 sobre parches de imagen.
- Clasificación en las diez clases de Imagenette mediante el clasificador entrenado incluido en el artefacto (el orden de clases sigue el de torchvision Imagenette).
- Predicción de probabilidades por imagen a través de la API `VisionFeaturizer.predict`, que acepta imágenes PIL en RGB.
- Preservación cuantificada de la lectura del clasificador profesor, medida mediante divergencia KL en held-out.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de modo thinking, visión generativa, audio ni capacidades multimodales más allá del procesamiento de imágenes de entrada.
- Capacidades multilingües: no aplicables; el modelo no procesa lenguaje natural.

## Casos de uso

- Investigación en interpretabilidad mecanicista: analizar qué direcciones de un espacio disperso y firmado se activan ante parches de imagen concretos, usando el featurizer como sustituto analizable de las activaciones de DINOv3.
- Reproducción de estudios preregistrados: el repositorio incluye configuración, manifiesto y auditoría de duplicados, lo que permite replicar exactamente el pipeline de entrenamiento y evaluación con `uv sync --frozen`.
- Comparación de objetivos de entrenamiento en SAE: sirve como punto de referencia para contrastar el objetivo KL frente a objetivos locales en términos de divergencia de salida y MSE de reconstrucción.
- Evaluación de fidelidad de representaciones: medir cuánto se degrada la precisión del clasificador de diez clases al sustituir las activaciones del backbone por las del featurizer disperso.
- Docencia y formación técnica: ejemplo completo y reproducible de un pipeline de extracción de características con backbone congelado, clasificador profesor y artefacto de interpretabilidad.
- Auditoría de artefactos de investigación: el conjunto de ficheros de metadatos (`config.json`, `manifest.json`, `duplicate_audit.json`, `teacher.json`) permite verificar integridad y procedencia antes de reutilizar el modelo en un estudio propio.
- Análisis de dispersión por bloques: estudiar el comportamiento de la dispersión estructurada en el espacio de parches de un ViT, con métricas de reconstrucción normalizadas ya publicadas.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| KL en held-out | 0,033402685 nats/imagen |
| Precisión en held-out | 99,2516 % |
| MSE de parche normalizado | 0,76851737 |
| Diferencia media pareada local menos KL | 0,00254596 nats/imagen (5 semillas) |
| Intervalo de confianza al 95 % (semilla) | [-0,00325909, 0,008351] |
| Epochs completados | 1 |
| Semilla | 102 |

No se han publicado resultados comparativos frente a otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 9,6 M de parámetros en el featurizer, el grueso del coste proviene del backbone DINOv3 ViT-B/16, que no se incluye en el repositorio.
- GPU recomendadas: no disponible. El backbone ViT-B/16 es de tamaño moderado y cabe en GPUs de consumo actuales, pero no se aportan mediciones concretas.
- Compatibilidad con GPU de consumo: no verificada en la información disponible.
- Opciones de despliegue: el autor solo documenta la API `VisionFeaturizer` del paquete `e2e_bsf`, instalable con `uv sync --frozen`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-mse-seed102 | 9.599.498 | no aplica | BSF block-sparse sobre DINOv3 ViT-B/16 | MIT (backbone aparte) | Hugging Face, 22 descargas |
| Block-sparse featurizer de Goodfire | no disponible | no aplica | BSF de referencia | no disponible | Repositorio GitHub |
| SAE end-to-end (paper arXiv 2405.12241) | no disponible | no aplica | SAE entrenado de extremo a extremo | no disponible | Publicación académica |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El propio autor califica el estudio como exploratorio: no se alcanzó el objetivo de potencia del piloto y la comparación direccional entre objetivos es inconclusa (el intervalo de confianza incluye el cero).
- Una KL baja solo mide la preservación de la lectura de diez clases del clasificador profesor; no demuestra que el featurizer capture conceptos semánticos, fidelidad completa a DINOv3 ni aceleración de inferencia.
- El artefacto se entrenó con un único epoch y sobre Imagenette, un subconjunto reducido de ImageNet con diez clases; la generalización a otros dominios no está evaluada.
- El repositorio no incluye los pesos de DINOv3 ni las imágenes: se requiere acceso autorizado al backbone y aceptar su licencia separada. La licencia MIT del repositorio no relicencia el backbone.
- El tamaño del repositorio es de 0,0 GB según los metadatos, lo que sugiere que los pesos pueden no estar materializados en el snapshot público; conviene verificar la descarga antes de usarlo.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el clasificador puede producir predicciones erróneas fuera de la distribución de Imagenette.
- Sesgos conocidos: no documentados en la información disponible; al entrenar sobre Imagenette hereda los sesgos de composición de ese conjunto.
- Restricciones de uso comercial: la licencia MIT del artefacto lo permite, pero el uso del backbone DINOv3 queda sujeto a su licencia propia, que debe revisarse por separado.
- El orden de clases sigue torchvision Imagenette; usar otro orden invalida las predicciones.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-mse-seed102)
- [Repositorio del proyecto end-to-end-block-sparse-featurizers](https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers)
- [Preregistro del estudio](https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md)
- [Paper BSF (arXiv 2606.25234)](https://arxiv.org/abs/2606.25234)
- [Paper end-to-end SAE (arXiv 2405.12241)](https://arxiv.org/abs/2405.12241)
- [Código de block-sparse featurizer de Goodfire](https://github.com/goodfire-ai/block-sparse-featurizer)
- [Modelo base DINOv3 ViT-B/16](https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m)

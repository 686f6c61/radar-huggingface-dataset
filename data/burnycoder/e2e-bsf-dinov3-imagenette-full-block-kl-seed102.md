# BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-seed102

## Resumen

Este repositorio contiene un *featurizer* de bloques dispersos (block-sparse featurizer, BSF) entrenado desde cero sobre representaciones de un clasificador de parches DINOv3, en concreto sobre el backbone `facebook/dinov3-vitb16-pretrain-lvd1689m` y el conjunto de datos Imagenette. No se trata de un modelo generativo ni de un LLM, sino de un artefacto de interpretabilidad: un autoencoder disperso con estructura de bloques y pérdida KL, cuyo objetivo es descomponer las activaciones de un modelo de visión en características dispersas y, en principio, más interpretables. El autor lo publica como parte de un estudio preregistrado sobre featurizers dispersos de extremo a extremo.

El modelo tiene 9.599.498 parámetros reales según los pesos en safetensors y se distribuye con licencia MIT, pero excluye explícitamente los pesos de DINOv3, que requieren acceso autorizado y una licencia separada. El repositorio incluye pesos de inferencia, normalización fija y el clasificador entrenado, además de metadatos de configuración, manifiesto de asignación de imágenes y auditoría de duplicados.

Su relevancia es metodológica: forma parte de un estudio comparativo entre entrenamiento con pérdida local y con pérdida KL, con resultados que el propio autor califica de exploratorios e inconcluyentes (intervalo de confianza al 95 % que incluye cero). Es útil para investigadores en interpretabilidad mecanicista de modelos de visión, no para aplicaciones de producción generales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder disperso con estructura de bloques (block-sparse featurizer) sobre un ViT-B/16 de DINOv3 |
| Parámetros totales | 9.599.498 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en |
| Licencia | MIT (los pesos de DINOv3 no se incluyen y tienen licencia separada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto es un featurizer disperso de bloques entrenado desde cero para un clasificador de parches DINOv3/Imagenette fijo. El perfil de entrenamiento es «full» y se completó 1 época. Los artefactos escalares son featurizers de ancho uno con signo, ligados entre sí, y no SAEs convencionales con ReLU, según indica la model card. La pérdida empleada es KL, en el marco de una comparación preregistrada frente a una variante con pérdida local.

El estudio compara ambas variantes sobre 5 semillas. La diferencia media pareada local menos KL es de 0,00254596 nats/imagen, con un intervalo de confianza al 95 % a nivel de semilla de [-0,00325909, 0,008351]. El intervalo incluye cero, por lo que la comparación direccional es inconcluyente y el autor la marca como exploratoria al no alcanzar el objetivo de potencia del piloto. El entrenamiento se realizó sobre Imagenette con un manifiesto de asignación de imágenes y una auditoría de duplicados incluidos en el repositorio.

## Capacidades

- Extracción de características dispersas de bloques a partir de representaciones de DINOv3 ViT-B/16.
- Predicción de probabilidades de clase sobre las diez clases de Imagenette mediante el clasificador entrenado incluido en el artefacto.
- Inferencia por lotes de imágenes RGB a través de la clase `VisionFeaturizer` del paquete `e2e_bsf`.
- Preservación del *readout* del clasificador de diez clases, medida mediante divergencia KL.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de modalidad textual.

## Casos de uso

- Investigación en interpretabilidad mecanicista de modelos de visión: el featurizer permite analizar cómo se descomponen las activaciones de un ViT-B/16 de DINOv3 en características dispersas, comparando la variante KL con la local en igualdad de condiciones.
- Reproducción de estudios preregistrados: el repositorio incluye `config.json`, `manifest.json`, `duplicate_audit.json` y `teacher.json`, lo que facilita replicar el protocolo de entrenamiento y evaluación con las mismas semillas y particiones.
- Auditoría de fidelidad de *readout*: el modelo permite medir cuánto se degrada la precisión de un clasificador de diez clases al sustituir sus activaciones por una representación dispersa, con métricas de KL, exactitud y MSE de parches normalizado.
- Docencia y experimentación con SAEs: sirve como ejemplo reproducible de autoencoder disperso con estructura de bloques y pérdida KL, frente a los SAEs con ReLU más habituales.
- Comparación de objetivos de entrenamiento: útil para estudiar empíricamente las diferencias entre pérdida local y pérdida KL en featurizers dispersos, aunque los resultados publicados sean inconcluyentes.
- Análisis de estabilidad entre semillas: al publicarse cinco semillas del mismo estudio, permite evaluar la varianza de las métricas de fidelidad y la reproducibilidad del pipeline.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| KL en *held-out* | 0,032081485 nats/imagen |
| Exactitud | 99,4065 % |
| MSE de parches normalizado | 0,78661388 |
| Diferencia media pareada local menos KL | 0,00254596 nats/imagen (5 semillas) |
| Intervalo de confianza al 95 % (nivel de semilla) | [-0,00325909, 0,008351] |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un LLM ni un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9,6 M de parámetros en safetensors, el peso del featurizer es de decenas de megabytes, pero la inferencia requiere además cargar el backbone DINOv3 ViT-B/16, cuyos pesos no se incluyen en el repositorio.
- GPU recomendadas: no disponible. Cualquier GPU con suficiente memoria para el ViT-B/16 de DINOv3 debería bastar para el featurizer.
- Compatibilidad con GPU de consumo: probable para el featurizer aislado; para el pipeline completo depende del backbone DINOv3, cuyo requisito no se detalla.
- Opciones de despliegue: el autor indica el paquete `e2e_bsf` instalado con `uv sync --frozen` y la clase `VisionFeaturizer`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BSF KL, seed 102) | Featurizer disperso de bloques sobre DINOv3 ViT-B/16 | 9.599.498 | no aplica | MIT (backbone aparte) | Hugging Face, 26 descargas |
| Block-sparse featurizer de Goodfire | Featurizer disperso de bloques | no disponible | no aplica | no disponible | Repositorio GitHub |
| SAEs convencionales con ReLU (end-to-end SAE paper) | Autoencoder disperso | no disponible | no aplica | no disponible | Paper arXiv |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El propio autor califica el estudio como exploratorio: no se alcanzó el objetivo de potencia del piloto y la comparación direccional entre pérdida local y KL es inconcluyente.
- Un KL más bajo solo mide la preservación del *readout* de diez clases; no establece conceptos semánticos, fidelidad completa respecto a DINOv3 ni aceleración de inferencia.
- El artefacto excluye los pesos de DINOv3 y las imágenes: se requiere acceso autorizado al backbone y su licencia separada. La licencia MIT del repositorio no relicencia el backbone.
- El modelo solo se ha entrenado y evaluado sobre Imagenette (diez clases) y en inglés en los metadatos; no hay evidencia de generalización a otros conjuntos o dominios.
- Solo se completó 1 época de entrenamiento en el perfil «full», lo que limita la madurez del artefacto.
- No es un modelo generativo: no debe emplearse para texto, código, razonamiento ni tareas de propósito general.
- Riesgo de alucinación: no aplica en el sentido habitual, pero las características dispersas no deben interpretarse como conceptos semánticos verificados.
- Para producción, la dependencia de un backbone con licencia separada y de un pipeline específico (`e2e_bsf`) añade fricción operativa.

## Enlaces

- [Hugging Face: BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-seed102](https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-seed102)
- [Repositorio del proyecto end-to-end-block-sparse-featurizers](https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers)
- [Preregistro del estudio](https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md)
- [Paper BSF (arXiv:2606.25234)](https://arxiv.org/abs/2606.25234)
- [Paper end-to-end SAE (arXiv:2405.12241)](https://arxiv.org/abs/2405.12241)
- [Código de Goodfire block-sparse-featurizer](https://github.com/goodfire-ai/block-sparse-featurizer)
- [Modelo base: facebook/dinov3-vitb16-pretrain-lvd1689m](https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m)

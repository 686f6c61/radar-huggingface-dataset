# gabTriv/FoundYou

## Resumen

FoundYou es un modelo unificado para segmentación y recuperación personalizada de objetos, desarrollado por Gabriele Trivigno, Marcos Alfaro, Claudia Cuttano, Gabriele Berton, Luis Payá y Carlo Masone, y presentado en ECCV 2026. El modelo parte de SAM 2-small congelado y le añade adaptadores ligeros (AdaptFormer) en las dos últimas etapas del codificador de imagen, junto con un decodificador de recuperación entrenado que convierte la coincidencia de un objeto en una puntuación a nivel de imagen. La idea central es reutilizar la atención de memoria de SAM 2 —diseñada originalmente para seguir objetos a través de fotogramas de vídeo— para emparejar un objeto entre imágenes independientes.

El problema que resuelve es doble: dado un único ejemplo de un objeto (una máscara, una caja o un punto), el modelo puede segmentarlo en imágenes nuevas o recuperarlo de una base de datos grande con un solo modelo eficiente, en lugar de necesitar dos sistemas separados. Frente al método unificado anterior, mejora en +18,4 mIoU en PerMIS y +17,8 mAP en ILIAS, con un modelo de 52 M de parámetros de los cuales solo 5,9 M son entrenables, más de 75 veces más rápido y 20 veces más pequeño que la solución unificada previa.

Es relevante porque demuestra que un adaptador de bajo coste sobre un modelo fundacional congelado puede cubrir dos tareas de personalización visual con estado del arte, lo que abarata el despliegue y el ajuste. El repositorio de Hugging Face contiene únicamente los pesos entrenados (`model.safetensors`, 5.876.257 parámetros); los pesos congelados de SAM 2-small se descargan aparte la primera vez que se construye el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores AdaptFormer sobre el codificador de imagen de SAM 2-small (Hiera) congelado, más decodificador de recuperación (transformer y cabeza de puntuación de objeto) y decodificador de máscaras de SAM 2 congelado |
| Parametros totales | 5.876.257 parámetros entrenables en el repositorio; ~52 M de parámetros en el modelo completo (según la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; resolución interna de 1024x1024) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) más `config.json`; los pesos de SAM 2-small se descargan en formato `.pt` |

## Arquitectura y entrenamiento

FoundYou mantiene congelados los pesos de SAM 2-small y solo entrena un conjunto reducido de componentes: adaptadores AdaptFormer insertados en las dos últimas etapas del codificador de imagen y las partes entrenables del decodificador de recuperación (su transformer y la cabeza de puntuación de objeto). La atención de memoria de SAM 2, concebida para propagar un objeto entre fotogramas de vídeo, se reutiliza aquí para emparejar el objeto de referencia con imágenes independientes. El decodificador de máscaras de SAM 2, también congelado, genera las máscaras finales a partir de esa coincidencia.

El entrenamiento se realizó sobre el conjunto UnED (Ypsilantis et al., ICCV 2023) con SAM 2 congelado. La model card no detalla el número de tokens, la composición completa del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un modelo de visión de este tipo). La innovación destacable es la unificación de segmentación y recuperación personalizadas en un único modelo compacto mediante adaptadores de bajo rango y la reutilización de la memoria de atención de un modelo fundacional congelado.

## Capacidades

- Segmentación personalizada de objetos: dada una referencia con máscara, caja o punto, genera la máscara del objeto en imágenes nuevas.
- Recuperación personalizada de imágenes: puntúa la probabilidad de que cada imagen candidata contenga el objeto de referencia (salida sigmoide entre 0 y 1).
- Personalización flexible con prompts: acepta máscaras, cajas o puntos como referencia.
- Recuperación few-shot: admite múltiples referencias del mismo objeto.
- Salida de máscaras en el marco de 518x518, reescalables al tamaño original de la foto.
- No incluye generación de texto, razonamiento lingüístico, tool calling, capacidades de agente ni procesamiento multilingüe.

## Casos de uso

- Búsqueda visual de producto: con una foto de referencia y una caja alrededor del artículo, el modelo puntúa un catálogo de imágenes para recuperar las que muestran el mismo producto, útil en comercio electrónico con inventarios grandes.
- Moderación y detección de contenido: dado un ejemplo de un objeto o logotipo, se recuperan imágenes que lo contienen en un repositorio, apoyándose en la puntuación a nivel de imagen del decodificador de recuperación.
- Anotación asistida en datasets: el usuario marca un objeto una vez con una caja o un punto y el modelo segmenta ese mismo objeto en el resto de imágenes del conjunto, acelerando el etiquetado de máscaras.
- Seguimiento de objetos entre imágenes no consecutivas: en lugar de depender de la continuidad de vídeo, se reutiliza la memoria de atención de SAM 2 para localizar el objeto en fotografías dispersas de un mismo escenario.
- Robótica e inspección visual: con una referencia del componente a localizar, el modelo segmenta su posición en nuevas capturas, aprovechando su tamaño compacto (52 M de parámetros) para despliegue en entornos con recursos limitados.
- Análisis de colecciones fotográficas personales: recuperar todas las fotos en las que aparece un objeto concreto a partir de un único ejemplo, con soporte few-shot para mejorar la robustez ante cambios de punto de vista o iluminación.
- Integración en pipelines de visión existentes: al ser un adaptador sobre SAM 2-small, puede sustituir a SAM 2 en flujos que ya lo usan para segmentación y añadir la capacidad de recuperación sin cambiar de modelo base.

## Benchmarks y rendimiento

La model card reporta las siguientes mejoras relativas frente al método unificado anterior, sin detallar los valores absolutos:

| Benchmark | Métrica | Mejora frente al método unificado previo |
|---|---|---|
| PerMIS | mIoU | +18,4 |
| ILIAS | mAP | +17,8 |

No se han publicado en la información disponible los valores absolutos de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar de lenguaje, ya que no aplican a este modelo de visión. Tampoco se detallan resultados absolutos de PerMIS o ILIAS más allá de la mejora relativa indicada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un modelo de ~52 M de parámetros con entradas de 518x518 (1024x1024 internamente), la inferencia debería caber holgadamente en GPUs de consumo, pero no se han publicado cifras oficiales.
- GPU recomendadas: no disponible; el ejemplo de uso funciona en CUDA o CPU (`device = "cuda" if torch.cuda.is_available() else "cpu"`).
- Compatibilidad con GPU de consumo: previsiblemente sí por el tamaño del modelo, aunque no hay mediciones publicadas que lo confirmen.
- Opciones de despliegue: el código oficial del repositorio de GitHub (`ga1i13o/FoundYou`), con PyTorch, `huggingface_hub`, `safetensors` y `torchvision`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la model card solo indica que es más de 75 veces más rápido que la solución unificada previa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FoundYou | ~52 M (5,9 M entrenables) | no disponible (visión) | +18,4 mIoU en PerMIS y +17,8 mAP en ILIAS frente al método unificado previo | apache-2.0 | Hugging Face y GitHub |
| Método unificado previo (no nombrado en la información) | no disponible | no disponible | Referencia base de la comparación | no disponible | no disponible |
| SAM 2-small (modelo base) | no disponible en la información | no disponible | Segmentación promptable; sin recuperación personalizada | no disponible en la información | Hugging Face (`facebook/sam2-hiera-small`) |

No se dispone de datos suficientes en la información proporcionada para comparar con otros modelos de segmentación o recuperación personalizada (por ejemplo, variantes de DINO o CLIP-ReID), por lo que esa comparación se considera no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre UnED, puede heredar los sesgos de composición y dominio de ese dataset.
- Riesgo de error en la recuperación: la salida es una probabilidad sigmoide; el umbral de decisión debe calibrarse por aplicación y no se ofrecen garantías de calibración.
- Dependencia de la calidad de la referencia: el rendimiento depende del prompt (máscara, caja o punto) y de que la referencia represente bien el objeto; no se documentan resultados ante referencias ambiguas.
- Limitaciones de idioma: no aplica, es un modelo puramente visual sin capacidades lingüísticas.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero los pesos congelados de SAM 2-small se descargan por separado y su licencia debe verificarse de forma independiente.
- Reproducibilidad: el repositorio de Hugging Face solo contiene los 5,9 M de parámetros entrenados; es necesario descargar SAM 2-small y usar el código del repositorio de GitHub, con la configuración correspondiente a cada tarea (`retrieval.yaml` o `pers_seg.yaml`).
- Advertencia de producción: no se han publicado mediciones de latencia, throughput ni robustez fuera de los benchmarks del paper; conviene validar en el dominio objetivo antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/gabTriv/FoundYou
- Paper en Hugging Face: https://huggingface.co/papers/2608.29917
- arXiv: https://arxiv.org/abs/2608.29917
- Código: https://github.com/ga1i13o/FoundYou
- Página del proyecto: https://ga1i13o.github.io/FoundYou/
- Demo: https://gmberton.github.io/demos-url/foundyou/
- Modelo base: https://huggingface.co/facebook/sam2-hiera-small

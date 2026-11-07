# bakisae/nsfw_image_detector

## Resumen

`bakisae/nsfw_image_detector` es un clasificador de imágenes basado en la arquitectura EVA-02 (vision transformer) y afinado para la detección de contenido NSFW (not safe for work). Lo publica el usuario `bakisae` en Hugging Face, partiendo del checkpoint `timm/eva02_base_patch14_448.mim_in22k_ft_in22k_in1k` y reentrenándolo sobre 100.000 imágenes con etiquetado sintético. El modelo resuelve un problema acotado pero crítico en producción: moderar imágenes en plataformas, marketplaces y pipelines generativos con una granularidad de cuatro niveles (neutral, low, medium, high) en lugar de una simple decisión binaria.

El interés técnico está en que la model card reporta mejoras sustanciales frente a alternativas populares como `Falconsai/nsfw_image_detection` y `AdamCodd/vit-base-nsfw-detector`, especialmente en las categorías intermedias (low y medium) y en contenido generado por IA, donde los otros clasificadores degradan notablemente. Con 86,3 millones de parámetros y un repo de 0,2 GB, es un modelo ligero que puede ejecutarse en GPU de consumo y en CPU con latencia aceptable.

La licencia MIT y el formato safetensors estándar de Transformers facilitan su integración en pipelines existentes, aunque la model card advierte de que el modelo está marcado como `not-for-all-audiences` y de que los datos de entrenamiento son sintéticos, lo que introduce caveats que conviene evaluar en cada despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision transformer EVA-02 (EVA02-Base, patch 14, resolución 448) |
| Parámetros totales | 86.351.620 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificación de imagen, sin contexto textual) |
| Tipos de cuantización | no disponibles explícitamente; al ser safetensors de PyTorch admite cuantización estándar (fp16/bf16, int8) vía herramientas externas |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (Transformers), compatible con `timm_wrapper` |

## Arquitectura y entrenamiento

El modelo es un EVA-02 Base con parches de 14×14 y entrada de 448×448 píxeles, derivado del checkpoint preentrenado de `timm` (`eva02_base_patch14_448.mim_in22k_ft_in22k_in1k`), que combina preentrenamiento con enmascaramiento de imagen (MIM) sobre ImageNet-22k y ajuste fino sobre ImageNet-1k. Sobre esa base, el autor ha realizado un ajuste fino de clasificación con una cabeza de cuatro clases (neutral, low, medium, high). La cabecera se expone a través de `timm_wrapper` dentro de Transformers, por lo que se integra con `pipeline("image-classification")`.

El entrenamiento se realizó sobre 100.000 imágenes con etiquetado sintético, según indica la model card. No se detallan en la información disponible el número de épocas, la composición exacta del dataset, la resolución de entrenamiento ni si se aplicaron técnicas de aumento de datos o balanceo de clases. Tampoco se documenta el uso de RLHF/DPO (no aplica a un clasificador de imagen) ni innovaciones como decodificación especulativa o atención lineal. La model card menciona la creación de un conjunto de validación etiquetado manualmente y diseñado para evitar sesgos de género o etnia, empleado para medir el rendimiento por categoría y por origen del contenido (IA generativa frente a contenido no generado por IA).

## Capacidades

- Clasificación de imágenes en cuatro niveles de NSFW: `neutral`, `low`, `medium`, `high`.
- Salida de probabilidades por clase, lo que permite fijar umbrales personalizados o reducir el modelo a un clasificador binario.
- Detección específica de contenido generado por IA, con métricas reportadas separadas para imágenes sintéticas y no sintéticas.
- Integración con `transformers.pipeline("image-classification")` y con el paquete propio `nsfw-image-detector` (`NSFWDetector`).
- Ejecución en GPU (`cuda`) con `torch.bfloat16` o en CPU, según el ejemplo de la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador de imagen puro.
- No dispone de modo "thinking", visión generativa, audio ni generación de texto.

## Casos de uso

- Moderación de subidas de usuario en plataformas sociales o foros: cada imagen enviada se clasifica y se enruta según el nivel devuelto (`low`, `medium`, `high`), permitiendo políticas diferenciadas por umbral en lugar de un simple bloqueo binario.
- Filtrado previo en marketplaces y plataformas de segunda mano: se descartan o marcan imágenes de producto que contengan contenido sensible antes de la revisión humana, reduciendo la carga del equipo de moderación.
- Moderación de imágenes generadas por IA en herramientas de texto-a-imagen: el modelo está específicamente evaluado sobre contenido sintético, donde las alternativas degradan, por lo que encaja en pipelines de generación que deben bloquear o marcar salidas antes de mostrarlas al usuario.
- Control parental y filtrado en aplicaciones infantiles: se aplica un umbral bajo (`low` o superior) para bloquear contenido en entornos con audiencias menores, ajustando la sensibilidad según la política del producto.
- Enriquecimiento de datasets y etiquetado asistido: el modelo puede preetiquetar grandes volúmenes de imágenes con los cuatro niveles, que después se revisan manualmente, acelerando la curación de corpus de entrenamiento o de evaluación.
- Moderación en pipelines de CI/CD de contenido: integrado como paso de validación en flujos de publicación de assets (por ejemplo, en un CMS o en un pipeline de generación de creatividades), rechaza automáticamente imágenes que superen el umbral configurado.
- Filtrado en motores de búsqueda de imágenes o recomendadores: se excluyen o degradan resultados con probabilidad alta de NSFW, manteniendo la relevancia del resto del catálogo.

## Benchmarks y rendimiento

Los datos de la model card comparan el modelo (etiquetado como "Freepik") con `Falconsai/nsfw_image_detection` y `AdamCodd/vit-base-nsfw-detector`. Para Falconsai y AdamCodd, una predicción se considera correcta si la imagen es low/medium/high y el modelo devuelve `true`, o si es neutral y devuelve `false`. Para el modelo de este repo, la etiqueta low/medium/high debe devolver al menos `low`, y neutral debe devolver `neutral`.

| Categoría | Este modelo | Falconsai | AdamCodd |
|---|---|---|---|
| High | 99,54 % | 97,92 % | 98,62 % |
| Medium | 97,02 % | 78,54 % | 91,65 % |
| Low | 98,31 % | 31,25 % | 89,66 % |
| Neutral | 99,87 % | 99,27 % | 98,37 % |

Contenido generado por IA:

| Categoría | Este modelo | Falconsai | AdamCodd |
|---|---|---|---|
| High | 100,00 % | 84,00 % | 92,00 % |
| Medium | 96,15 % | 69,23 % | 96,00 % |
| Low | 100,00 % | 35,71 % | 92,86 % |
| Neutral | 100,00 % | 100,00 % | 66,67 % |

No se han publicado en la información disponible resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, que no aplican a un clasificador de imagen. Las cifras anteriores son las únicas métricas reportadas y provienen de la evaluación interna del autor, no de un benchmark independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: con 86,3 M de parámetros, en fp32 ocupa aproximadamente 0,35 GB de pesos; en bf16/fp16, unos 0,17 GB. La activación a 448×448 añade un consumo adicional moderado, por lo que en la práctica cabe en GPUs con 4 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; para alto throughput se recomiendan A100, H100, L40S o RTX 4090. Una RTX 3060 o superior puede procesar lotes con holgura.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 4 GB en adelante), y también en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `pipeline("image-classification")`, el paquete `nsfw-image-detector`, y servidores de inferencia compatibles con Transformers (TGI, endpoints de Hugging Face). No se documenta soporte GGUF ni llama.cpp, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. La model card menciona una sección "Speed and Memory Metrics", pero su contenido no se incluye en los datos disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Categorías | Licencia | Rendimiento reportado (High / Neutral) |
|---|---|---|---|---|---|
| `bakisae/nsfw_image_detector` | 86,3 M | no aplica | 4 niveles (neutral, low, medium, high) | MIT | 99,54 % / 99,87 % |
| `Falconsai/nsfw_image_detection` | no disponible | no aplica | binario (nsfw / normal) | no disponible en la información | 97,92 % / 99,27 % |
| `AdamCodd/vit-base-nsfw-detector` | no disponible | no aplica | binario (nsfw / normal) | no disponible en la información | 98,62 % / 98,37 % |

La ventaja principal del modelo de `bakisae` frente a las alternativas es la granularidad de cuatro niveles, que permite umbrales por producto, y su rendimiento en las categorías intermedias (low y medium) y en contenido generado por IA. Falconsai y AdamCodd son clasificadores binarios, por lo que la comparación directa en esas categorías solo es posible mediante la conversión descrita en la model card.

## Limitaciones y advertencias

- El modelo está marcado como `not-for-all-audiences`; su uso implica manejar contenido sensible y requiere políticas claras de tratamiento de datos.
- El entrenamiento se realizó sobre 100.000 imágenes con etiquetado sintético; no se documenta la composición del dataset ni el proceso de generación de etiquetas, lo que dificulta auditar posibles sesgos.
- La model card reconoce que el conjunto de validación manual es de tamaño reducido ("sample size is relatively small"), por lo que las métricas reportadas deben tomarse como orientativas.
- Riesgo de alucinación en sentido estricto no aplica (es un clasificador), pero sí existe riesgo de falsos positivos y falsos negativos, especialmente en las categorías low y medium, donde la frontera es difusa.
- No se dispone de información sobre sesgos demográficos, de género o étnicos más allá de la mención a que el conjunto de validación se diseñó para evitarlos; no hay una evaluación publicada e independiente.
- No hay datos sobre el comportamiento con imágenes de dominios muy alejados del entrenamiento (ilustración, dibujo, capturas de pantalla, imágenes médicas), por lo que conviene validar en el dominio concreto antes de desplegar.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad legal sobre el contenido moderado recae en el integrador.
- El modelo no procesa texto ni metadatos: la moderación debe combinarse con otras señales si el producto lo requiere.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bakisae/nsfw_image_detector
- Modelo base en timm: https://huggingface.co/timm/eva02_base_patch14_448.mim_in22k_ft_in22k_in1k
- Space de demostración: https://huggingface.co/spaces/ccabrerafreepik/nsfw_image_detector
- Alternativa Falconsai: https://huggingface.co/Falconsai/nsfw_image_detection
- Alternativa AdamCodd: https://huggingface.co/AdamCodd/vit-base-nsfw-detector
- Paper de referencia citado en los tags (arXiv:2303.11331): https://arxiv.org/abs/2303.11331

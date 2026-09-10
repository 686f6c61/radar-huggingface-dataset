# fassabilf/sd15-dpo-us-sd15

## Resumen

`fassabilf/sd15-dpo-us-sd15` es un UNet de Stable Diffusion 1.5 afinado con Diffusion-DPO sobre 1.400 pares de preferencia construidos con imágenes sintéticas generadas por el propio SD 1.5 (308 pares de validación), durante 20 épocas (880 pasos) con semilla 0. El objetivo declarado del autor no es publicar un modelo mejor, sino servir de "brazo de comparación" frente a `fassabilf/sd15-dpo-us-real` con una receta idéntica (β_dpo 5000, lr 1e-5, `constant_with_warmup` 50, 4 pares por lote con acumulación 8, bf16, referencia = SD 1.5 base) y variando únicamente la fuente de las imágenes: 2.800 imágenes sintéticas únicas renderizadas a partir de sus propios captions, frente a 280 fotos de Pexels reutilizadas aproximadamente 10 veces.

La tarea que aborda es la mitigación del sesgo de género en la generación texto-a-imagen condicionada por ocupación. Los pares de preferencia son distribucionales: el elegido procede de un pool cuya proporción de mujeres por ocupación sigue `p_female_target`, y el rechazado es un "flip" con el mismo caption y el género contrario. En el 66,6% de los pares de entrenamiento ambos lados comparten semilla de renderizado.

El resultado que documenta la propia model card es un fallo claro: los pesos no mejoran la distribución respecto a SD 1.5 base. El MAE de test (n=100 por ocupación, 14 ocupaciones) no baja nunca de 0,149 (base) en ningún checkpoint, y los intervalos de confianza al 95% por clúster se solapan con los del modelo base. El entrenamiento memoriza la asociación caption-género en train y sobreajusta en validación. Es, por tanto, un artefacto de investigación sobre el fallo del DPO distribucional, no un modelo de producción ni un modelo "más justo".

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión latente (LDM) con UNet; solo se publica el UNet afinado, sobre Stable Diffusion 1.5 |
| Parametros totales | No disponible en la ficha (el UNet de SD 1.5 base tiene ~860 M de parámetros; el repositorio ocupa 36,1 GB con 20 checkpoints) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de difusión de imágenes; no se especifica resolución de entrenamiento en la ficha) |
| Tipos de cuantizacion | No disponible. Los checkpoints publicados están en fp16 (`unet_ep1`–`unet_ep19`) y fp32 (`unet_ep20`) |
| Idiomas soportados | No disponible en la ficha. El codificador de texto no se incluye; el de SD 1.5 base está entrenado principalmente en inglés |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (librería `diffusers`); VAE, text encoder y tokenizer no se incluyen |

Otros datos del repositorio: `hparams.yml` con la configuración, curvas en `tensorboard/` y cifras en `analysis/` (el informe completo es `analysis/COMPARISON.md`). Checkpoints etiquetados `unet_ep1` a `unet_ep20`; el vigésimo es el checkpoint final sin compactar y está en fp32.

## Arquitectura y entrenamiento

La arquitectura es la de Stable Diffusion 1.5 sin modificaciones estructurales: UNet de difusión latente sobre un autoencoder variacional congelado y condicionamiento por texto mediante CLIP. Lo único que cambia en este repositorio son los pesos del UNet, ajustados con Diffusion-DPO. La referencia para el término de regularización del DPO es el propio SD 1.5 base, no un checkpoint previo de SFT. VAE, text encoder y tokenizer son idénticos a los del modelo base y no se han subido, por lo que para montar el pipeline hay que combinar el UNet de este repositorio con `stable-diffusion-v1-5/stable-diffusion-v1-5`.

Los datos de preferencia son sintéticos: 1.400 pares de entrenamiento y 308 de validación, generados con SD 1.5 a partir de captions y organizados por ocupación. El lado `chosen` proviene de `fassabilf/ift-train-us-sd15`; el `rejected` es un pool "flip" con el mismo caption y el género opuesto. Se emplearon 2.800 imágenes sintéticas únicas, sin reutilización. Hiperparámetros: β_dpo 5000, lr 1e-5, `constant_with_warmup` con 50 pasos de calentamiento, 4 pares por lote con 8 pasos de acumulación, precisión bf16, 20 épocas (880 pasos), semilla 0.

La innovación técnica del artefacto no es de arquitectura sino metodológica: aísla la variable "origen de la imagen" (sintética frente a fotográfica) manteniendo la receta DPO constante. La conclusión del autor es que el fallo no se explica por la reutilización de fotos: con imágenes sintéticas únicas y captions coherentes, la misma receta también falla. El diagnóstico es memorización en train (cada caption aparece una sola vez con un género `chosen` fijo) y búsqueda de modos en la distribución, no un problema de datos.

## Capacidades

- Generación de imágenes texto-a-imagen a partir del UNet de SD 1.5, una vez ensamblado el pipeline completo con VAE, text encoder y tokenizer del modelo base.
- Condicionamiento por caption textual (el prompt describe la escena y la ocupación).
- Generación condicionada por ocupación con distribuciones de género que el autor mide explícitamente (tasa de género "unclear", sesgo firmado, MAE por ocupación).
- Trazabilidad experimental: 20 checkpoints intermedios más curvas de TensorBoard y un informe de comparación en `analysis/COMPARISON.md`, lo que permite reproducir la evolución época a época.
- No dispone de tool calling, function calling, uso como agente, modo "thinking", visión, audio ni razonamiento multi-paso: no es un modelo de lenguaje.
- No hay capacidades multilingües declaradas; el condicionamiento depende del codificador de texto de SD 1.5 base.

## Casos de uso

- Estudio de reproducibilidad del fallo de Diffusion-DPO: los 20 checkpoints y las curvas permiten analizar la evolución de la pérdida DPO en train frente a validación y documentar el sobreajuste con una receta dada.
- Comparación controlada sintético frente a real: junto con `fassabilf/sd15-dpo-us-real`, sirve para aislar el efecto de la fuente de imágenes en un experimento de alineación distribucional.
- Auditoría de sesgo de género en modelos de difusión: el modelo puede usarse como sujeto de evaluación con un protocolo ya definido (MAE sobre n=100 por ocupación en 14 ocupaciones, tasa de "unclear", sesgo firmado).
- Investigación sobre búsqueda de modos y colapso distribucional: el checkpoint 20 colapsa 7 de 14 ocupaciones a una tasa 0/1 de género, frente a 4 en el modelo base, lo que lo convierte en un caso de estudio de endurecimiento de la distribución.
- Ablación de hiperparámetros de DPO en difusión: `hparams.yml` documenta β_dpo, lr, calentamiento, acumulación y semilla, lo que permite repetir el barrido variando un único factor.
- Docencia y formación sobre alineación de modelos generativos: es un ejemplo publicado y con datos completos de cómo un descenso de la pérdida de entrenamiento puede coexistir con un empeoramiento de la métrica objetivo.
- Análisis de memorización en conjuntos de preferencia pequeños: cada caption de entrenamiento aparece una sola vez con un género `chosen` fijo, lo que permite medir la frontera entre aprender una política y memorizar la etiqueta.

## Benchmarks y rendimiento

Métricas de entrenamiento y validación reportadas por el autor:

| Metrica | Valor |
|---|---|
| DPO loss (train) | 0,826 → 0,454 |
| Exactitud implícita (train) | Hasta 0,80; supera el techo teórico de 0,6514 desde ~ep4 |
| DPO loss (validación) | 0,693 en base → 1,601; aumento monótono sin mínimo interior |
| Exactitud implícita (validación) | Máximo 0,616; nunca alcanza el techo |
| Tasa de género "unclear" | 0,098 → 0,029 |

MAE de test por checkpoint (n=100 por ocupación, 14 ocupaciones):

| Modelo / checkpoint | MAE test | Observaciones |
|---|---|---|
| SD 1.5 base | 0,149 | Referencia |
| ep5 | 0,209 | Sesgo firmado −0,10 (inclinación a hombre) |
| ep10 | 0,244 | Sesgo firmado +0,20 (inclinación a mujer) |
| ep15 | 0,162 | — |
| ep20 | 0,178 | 14/14 ocupaciones hacia el género mayoritario; 7 colapsos plenos a 0/1 (base: 4) |
| Brazo SFT sintético (mismos datos `chosen`) | 0,091 | Mejor que base y que todos los checkpoints DPO |

Ningún intervalo de confianza al 95% por clúster de los checkpoints DPO se separa del de SD 1.5 base. El autor advierte que, con una sola semilla, no se puede reclamar un checkpoint "mejor": las diferencias entre checkpoints caen dentro de esos intervalos. No se han publicado resultados de benchmarks estándar (FID, CLIP score, HPSv2, ImageReward) en la información disponible.

## Requisitos de hardware

Las cifras de VRAM y GPU no aparecen en la model card; lo que sigue son estimaciones derivadas de la arquitectura del modelo base y del tamaño del repositorio, no datos publicados por el autor.

- Tamaño en disco: el repositorio completo ocupa 36,1 GB (20 checkpoints del UNet, uno de ellos en fp32). Conviene descargar solo el checkpoint que se vaya a usar.
- Inferencia con el pipeline completo en fp16: en torno a 4-6 GB de VRAM (UNet de SD 1.5, VAE, codificador de texto y activaciones), estimación basada en el modelo base.
- GPU de consumo: cabe en tarjetas de 8 GB o más, como RTX 3060 Ti, 3070, 4060, 4070 o superiores; con 12 GB (RTX 3060 12 GB, 4070 Ti) hay margen para lotes mayores. Una RTX 4090 (24 GB) permite procesar lotes grandes y usar variantes en fp32 sin problema.
- GPU de datacenter: A100, H100 o L40S son adecuadas para evaluación a gran escala (por ejemplo, 14 ocupaciones × 100 muestras por checkpoint con varios checkpoints).
- Despliegue: `diffusers` (librería declarada), ComfyUI, Automatic1111/Forge y SD.Next. Es necesario ensamblar el pipeline instalando el UNet de este repositorio sobre `stable-diffusion-v1-5/stable-diffusion-v1-5`. vLLM, TGI u Ollama no aplican a un modelo de difusión.
- Cuantizaciones tipo GGUF para `stable-diffusion.cpp` o equivalentes: no disponibles en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolucion | MAE test (genero por ocupacion) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fassabilf/sd15-dpo-us-sd15` (este) | No disponible (UNet de SD 1.5) | No disponible | 0,209 (ep5), 0,244 (ep10), 0,162 (ep15), 0,178 (ep20) | creativeml-openrail-m | HuggingFace, 20 checkpoints |
| `stable-diffusion-v1-5/stable-diffusion-v1-5` (base) | ~860 M en el UNet | 512×512 px | 0,149 | creativeml-openrail-m | HuggingFace |
| `fassabilf/sd15-dpo-us-real` | No disponible (misma receta, datos fotográficos) | No disponible | No disponible en esta ficha | No disponible | HuggingFace |
| Brazo SFT sintético (mismos datos `chosen`) | No disponible | No disponible | 0,091 | No disponible | No disponible |

La ficha no proporciona una comparación con métodos de mitigación de sesgo ajenos al proyecto (por ejemplo, fine-tuning con dataset balanceado, prompt engineering o muestreo guiado), por lo que no es posible situar estos resultados frente a alternativas externas.

## Limitaciones y advertencias

- No mejora la equidad respecto a SD 1.5 base: el MAE de test de todos los checkpoints DPO es igual o peor que el del modelo base, y los intervalos de confianza se solapan.
- Memoriza en entrenamiento: cada caption aparece una sola vez con un género `chosen` fijo, la pérdida baja (0,826 → 0,454) y la exactitud implícita de train supera el techo teórico de 0,6514 desde la época 4.
- Sobreajuste en validación: la pérdida DPO de validación sube de forma monótona de 0,693 a 1,601, sin mínimo interior.
- Colapso distribucional: en la época 20, las 14 ocupaciones se desplazan hacia el género mayoritario y 7 de ellas colapsan por completo a tasas 0/1, frente a 4 en el modelo base. La tasa de género "unclear" cae de 0,098 a 0,029, es decir, el modelo es más tajante pero hacia el estereotipo dominante.
- Inestabilidad entre checkpoints: el sesgo firmado va de −0,10 (ep5, hacia hombre) a +0,20 (ep10, hacia mujer). No se puede declarar un checkpoint "mejor", porque las diferencias quedan dentro del intervalo de confianza.
- Un único experimento con semilla 0: no hay réplicas que permitan separar el efecto de la receta del ruido de inicialización.
- Repositorio incompleto para uso directo: faltan VAE, text encoder y tokenizer; hay que ensamblar el pipeline con el modelo base.
- Licencia CreativeML OpenRAIL-M: permite uso comercial, pero incluye restricciones de uso (no generar contenido ilegal, dañino, desinformativo, etc.) que deben propagarse a los usos derivados. Conviene verificar los términos en el archivo de licencia del repositorio antes de cualquier despliegue.
- El autor etiqueta explícitamente el modelo como artefacto de investigación y no como modelo de producción. No debe usarse en aplicaciones donde la representación de género por ocupación tenga consecuencias reales.
- Riesgo de alucinación en el sentido de fidelidad al prompt: al tratarse de un modelo de difusión, la fidelidad caption-imagen no se ha medido con métricas estándar en la información disponible.
- La fecha de creación del repositorio que consta en la ficha es 2026-09-10, posterior a la de la mayoría de los artefactos similares; conviene verificar la vigencia del contenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fassabilf/sd15-dpo-us-sd15
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de pares de preferencia: https://huggingface.co/datasets/fassabilf/dpo-train-us-sd15
- Dataset de origen del lado `chosen`: https://huggingface.co/datasets/fassabilf/ift-train-us-sd15
- Brazo de comparación con imágenes reales: https://huggingface.co/fassabilf/sd15-dpo-us-real
- Ficheros de configuración y análisis dentro del repositorio: `hparams.yml`, `tensorboard/`, `analysis/COMPARISON.md`
- La búsqueda web realizada no ha devuelto enlaces relevantes sobre este modelo (paper, blog o demo); los resultados obtenidos corresponden a servicios de mapas y no guardan relación con el artefacto.

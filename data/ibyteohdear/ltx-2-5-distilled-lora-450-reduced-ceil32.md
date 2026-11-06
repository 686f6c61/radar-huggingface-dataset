# ibyteohdear/ltx-2.5-distilled-lora-450-reduced-ceil32

## Resumen

ltx-2.5-distilled-lora-450-reduced-ceil32 es un adaptador LoRA derivado del LoRA de destilación oficial de Lightricks para LTX-2.5, un modelo generativo de vídeo de 22 000 millones de parámetros. Lo publica el usuario ibyteohdear y no es una versión oficial de Lightricks: se trata de una reducción de rango del LoRA original de rango 450, pensada para que quepa en GPUs donde el fichero completo de 8,9 GB no entra junto al modelo base.

El adaptador aplica una receta denominada `fro90_ceil32` sobre los 1660 módulos del LoRA original: para cada módulo se trunca el delta `B @ A` mediante SVD factorizada (QR de ambos factores más SVD del núcleo), conservando valores singulares hasta cubrir el 90 % de la energía de Frobenius, con un techo de rango 32 y una salvaguarda de condición numérica. El resultado es un fichero de 0,66 GB, con rango medio de 30,0 y el 79 % de los módulos limitados por el techo de 32.

Su relevancia es práctica: permite aplicar el muestreo de pocos pasos ("turbo") del LoRA de destilación oficial en entornos con VRAM ajustada, manteniendo el mismo formato de claves que el original, por lo que es intercambiable directamente donde cargue el fichero completo. El uso típico recomendado por el autor es un peso de 0,8 con el calendario sigma oficial de 8 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de vídeo LTX-2.5 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base LTX-2.5 tiene 22 000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en bf16 según el fichero de origen) |
| Idiomas soportados | no disponible |
| Licencia | LTX-2.x Community License (license_name: ltx-2.5-community-license) |
| Formato de pesos | safetensors (fichero de 0,66 GB) |

## Arquitectura y entrenamiento

El adaptador no define una arquitectura propia: es un conjunto de matrices de bajo rango (`lora_A` / `lora_B`) que modulan los pesos de LTX-2.5, un modelo de generación de vídeo de 22 000 millones de parámetros. El LoRA de origen es un adaptador de destilación de rango 450 entrenado por Lightricks para habilitar el muestreo de pocos pasos ("turbo"), es decir, reducir el número de pasos de denoising necesarios para generar vídeo.

La innovación de esta variante es puramente de compresión: se aplica una truncación por SVD factorizada módulo a módulo, conservando el 90 % de la energía de Frobenius con un techo de rango 32. Según el informe del autor, la energía global conservada es 0,485 con un error global de 0,717; la mediana de energía retenida por módulo es 0,550, el percentil 5 es 0,306 y el peor módulo retiene 0,216. No se documentan datos de entrenamiento adicionales ni un proceso de reentrenamiento: es una transformación post-hoc de los pesos del LoRA oficial.

## Capacidades

- Adaptador de destilación para muestreo de pocos pasos sobre LTX-2.5; hereda las capacidades de generación de vídeo del modelo base.
- Sustitución directa del LoRA oficial de rango 450: mismo formato de claves, carga donde cargue el original.
- Reducción de huella en disco de 8,9 GB a 0,66 GB, lo que facilita su uso en GPUs con VRAM limitada.
- Compatible con el calendario sigma oficial de 8 pasos con peso aproximado de 0,8.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo; son competencia del modelo base, no del adaptador.

## Casos de uso

- Generación de vídeo en GPUs de consumo: cargar LTX-2.5 junto con este LoRA reducido permite usar el muestreo turbo de 8 pasos en tarjetas donde el LoRA de 8,9 GB no cabría junto a los pesos del modelo base.
- Prototipado rápido en estaciones de trabajo: el fichero de 0,66 GB se descarga y mueve con facilidad, lo que agiliza iteraciones de prompts y ajustes de sigma sin gestionar ficheros de casi 9 GB.
- Sustitución directa en pipelines existentes: al mantener el formato de claves del LoRA oficial, se puede intercambiar el adaptador en un flujo ya configurado para LTX-2.5 sin cambios de código.
- Evaluación comparativa de calidad: útil para medir cuánto se degrada la generación turbo al truncar el rango del adaptador frente al LoRA completo, con las métricas de energía documentadas como referencia.
- Despliegue en entornos con almacenamiento limitado: contenedores o instancias cloud con cuotas de disco ajustadas que no admiten el adaptador original.
- Pruebas de integración en CI: verificar la carga y la inferencia del pipeline de vídeo con un artefacto pequeño antes de desplegar los pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta métricas de compresión del adaptador (energía de Frobenius retenida, rango medio, tamaño de fichero), no métricas de calidad de generación de vídeo.

## Requisitos de hardware

- El adaptador en sí ocupa 0,66 GB en disco; la VRAM necesaria la determina el modelo base LTX-2.5 de 22 000 millones de parámetros, no el LoRA.
- El objetivo declarado es precisamente encajar junto al modelo base en GPUs donde el LoRA de 8,9 GB no cabe, pero no se especifican modelos de GPU concretos.
- Opciones de despliegue: no disponible (el autor no documenta frameworks de inferencia compatibles más allá de la carga estándar del LoRA sobre LTX-2.5).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Adaptador | Rango | Tamano | Energia Frobenius retenida | Licencia |
|---|---|---|---|---|
| ltx-2.5-distilled-lora-450-reduced-ceil32 (este) | 450 -> 30,0 medio (techo 32) | 0,66 GB | 0,485 global | LTX-2.x Community License |
| LoRA de destilación oficial de Lightricks (rango 450) | 450 | 8,9 GB | 1,0 (referencia) | LTX-2.x Community License |

No se dispone de información sobre otras variantes reducidas del LoRA de destilación de LTX-2.5 ni de métricas de calidad comparables entre ambos adaptadores.

## Limitaciones y advertencias

- Es una modificación no oficial: todos los tensores `lora_A` / `lora_B` del LoRA original han sido truncados; no es un lanzamiento de Lightricks.
- La truncación introduce error: el error global de Frobenius es 0,717 y el peor módulo retiene solo 0,216 de la energía, por lo que la calidad de generación puede diferir del LoRA completo, especialmente en los módulos más afectados.
- El 79 % de los módulos está limitado por el techo de rango 32, lo que sugiere que la pérdida de información es sistemática y no marginal.
- No hay benchmarks de calidad de vídeo publicados que cuantifiquen la degradación frente al adaptador original.
- La licencia LTX-2.x Community License se aplica y debe redistribuirse con cualquier copia de estos pesos; es necesario revisar sus términos para uso comercial.
- No se documentan sesgos, comportamiento multilingüe ni límites de contexto propios; dependen del modelo base y no están descritos en la información disponible.
- El repositorio tiene cero descargas y cero likes, sin validación comunitaria conocida.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ibyteohdear/ltx-2.5-distilled-lora-450-reduced-ceil32)
- [Modelo base Lightricks/LTX-2.5](https://huggingface.co/Lightricks/LTX-2.5)
- [Licencia LTX-2.x Community License](https://huggingface.co/Lightricks/LTX-2.5)
- Informe de compresión `ltx-2.5-22b-distilled-lora-450-bf16_fro90_ceil32_report.json`: referenciado en la model card, no se proporciona enlace directo.

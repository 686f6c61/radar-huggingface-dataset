# AcademiaSD/Krea-2-NF4-for-LoRA-Training

## Resumen

Krea-2-NF4-for-LoRA-Training es una versión cuantizada a 4 bits (NF4) del modelo de difusión text-to-image Krea-2-Raw, publicada por el usuario AcademiaSD. No se trata de un modelo nuevo, sino de una conversión de precisión reducida pensada específicamente para el entrenamiento de adaptadores LoRA sobre Krea 2 en GPUs de consumo. El repositorio lo consume automáticamente la herramienta AcademiaSD LoRAlab Trainer Studio, que lo descarga sin intervención del usuario.

El modelo base, Krea-2-Raw, es un pipeline de difusión para generación de imágenes a partir de texto (`diffusers:Krea2Pipeline`), distribuido bajo la Krea 2 Community License. La cuantización NF4 reduce el peso en memoria de los pesos congelados durante el entrenamiento, lo que permite ajustar LoRAs sin necesidad de GPUs de datacenter.

La relevancia de esta ficha es acotada: no es un modelo para inferencia general ni para evaluación comparativa de calidad, sino un artefacto de infraestructura para fine-tuning. Su interés práctico reside en que habilita el entrenamiento de LoRAs de Krea 2 en hardware asequible. No se dispone de información pública sobre arquitectura interna, parámetros o datos de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión text-to-image, pipeline `Krea2Pipeline` en diffusers) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 (4 bits, formato bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | Krea 2 Community License (`license: other`) |
| Formato de pesos | safetensors (librería diffusers) |
| Tamaño del repositorio | 43,2 GB |
| Modelo base | krea/Krea-2-Raw (relación: quantized) |
| Descargas | 756 |
| Likes | 1 |
| Creado | 2026-07-20 |
| Actualizado | 2026-11-16 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna de Krea-2-Raw en los datos disponibles: no se especifica si emplea un transformer de difusión (tipo DiT), un UNet o una arquitectura híbrida, ni el número de parámetros, la longitud de contexto textual del codificador o la composición del dataset de entrenamiento.

Lo único documentado es el proceso de esta variante concreta: una cuantización a NF4 de los pesos del modelo base, orientada a mantener los pesos congelados en memoria reducida durante el entrenamiento de LoRAs. No hay información sobre si se aplicaron técnicas adicionales (por ejemplo, doble cuantización de los estados del optimizador o preparación específica de capas para el entrenamiento). El repositorio no incluye detalles sobre hiperparámetros, recetas de entrenamiento ni métricas de fidelidad respecto al modelo original.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image), heredada del modelo base Krea-2-Raw.
- Entrenamiento de adaptadores LoRA sobre Krea 2: es su función principal y la razón de existir de esta variante.
- Integración automática con AcademiaSD LoRAlab Trainer Studio, que descarga los pesos sin configuración manual.
- Ejecución en GPUs de consumo gracias a la reducción de memoria de los pesos en NF4.
- No se documentan capacidades de edición de imagen, inpainting, controlnet, tool calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni modos especiales (thinking, visión, audio).

## Casos de uso

- Entrenamiento de LoRAs de estilo en GPU de consumo: el propósito declarado de esta variante. Un usuario con una RTX 4090 o similar puede cargar los pesos NF4 como modelo congelado y entrenar el adaptador sin agotar la VRAM.
- Creación de LoRAs de personaje o rostro: el flujo típico de LoRAlab Trainer Studio permite ajustar un adaptador sobre un conjunto pequeño de imágenes de referencia y reutilizarlo después con el modelo base completo.
- Prototipado rápido de adaptadores antes de un entrenamiento a mayor precisión: la variante NF4 sirve para validar hiperparámetros y datasets con coste bajo antes de repetir el proceso con pesos en bf16.
- Pipelines internos de fine-tuning automatizado: al descargarse automáticamente desde el trainer, encaja en entornos donde se quiere estandarizar la receta de entrenamiento sin gestionar manualmente los pesos base.
- Investigación sobre cuantización en entrenamiento de difusión: permite estudiar la degradación de calidad de LoRAs entrenados sobre pesos NF4 frente a bf16 con el mismo dataset.
- Formación y talleres: el requisito de hardware reducido facilita demostraciones de entrenamiento de LoRAs en equipos de estudiantes sin acceso a clústeres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de imagen (FID, CLIP score), comparativas de fidelidad respecto a Krea-2-Raw en bf16, ni mediciones de VRAM o tiempo de entrenamiento.

## Requisitos de hardware

- VRAM estimada para entrenamiento: no disponible de forma explícita. El tamaño del repositorio (43,2 GB) corresponde a los pesos en disco; en memoria, la carga NF4 reduce el peso de los pesos congelados aproximadamente a una cuarta parte del tamaño en bf16, pero no se publica una cifra oficial de VRAM pico.
- GPU objetivo declarada: GPUs de consumo (la model card menciona "consumer GPUs" sin especificar modelos).
- GPU recomendadas: no disponibles de forma oficial. Por el propósito del artefacto, se orienta a tarjetas consumer de gama alta con suficiente VRAM para el entrenamiento de LoRA, pero no hay confirmación del autor.
- Despliegue: integrado en AcademiaSD LoRAlab Trainer Studio (repositorio en GitHub). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje y no aplican a este pipeline de difusión.
- Inferencia: la librería es diffusers, por lo que la inferencia se haría con `Krea2Pipeline`, aunque esta variante está pensada para entrenamiento, no como checkpoint de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantización | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AcademiaSD/Krea-2-NF4-for-LoRA-Training | Difusión text-to-image | NF4 (4 bits) | Entrenamiento de LoRA | Krea 2 Community License | Hugging Face |
| krea/Krea-2-Raw | Difusión text-to-image | bf16 (original) | Inferencia y fine-tuning | Krea 2 Community License | Hugging Face |
| Otras variantes cuantizadas de Krea 2 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otras conversiones NF4 de Krea 2 ni sobre modelos comparables de otros autores con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo para inferencia de producción: está pensado como pesos congelados para entrenar LoRAs; usarlo directamente para generar imágenes puede degradar la calidad frente a Krea-2-Raw en bf16, aunque el grado de degradación no está documentado.
- Licencia restrictiva: se distribuye bajo la Krea 2 Community License, no una licencia open source estándar. Es obligatorio leer el PDF enlazado antes de cualquier uso comercial, incluidos los LoRAs entrenados con estos pesos, que quedan sujetos a la misma licencia según la model card.
- Dependencia de un trainer concreto: el flujo previsto es AcademiaSD LoRAlab Trainer Studio; no se documenta compatibilidad con otros frameworks de entrenamiento.
- Sin datos de calidad: no hay benchmarks que cuantifiquen la pérdida de fidelidad de los LoRAs entrenados en NF4 frente a bf16.
- Sin información sobre sesgos, alucinación visual o limitaciones idiomáticas del modelo base en la información disponible.
- Repositorio con muy poca tracción (1 like, 756 descargas) y autor no verificado como organización oficial de Krea; conviene validar la integridad de los pesos antes de usarlos en producción.
- Fecha de creación posterior a la fecha actual del conocimiento del redactor: los datos proceden exclusivamente de la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AcademiaSD/Krea-2-NF4-for-LoRA-Training
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Trainer: https://github.com/AcademiaSD/AcademiaSD_LoRAlab-TrainerStudio
- Licencia Krea 2 Community License (PDF): https://cdn.jsdelivr.net/gh/krea-ai/krea-2@db3984fbc6e13b34c0064990fc2d95ac64d00058/assets/hf_samples/LICENSE.pdf

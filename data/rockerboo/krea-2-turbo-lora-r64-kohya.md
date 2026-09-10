# rockerBOO/krea-2-turbo-lora-r64-kohya

## Resumen

El modelo `rockerBOO/krea-2-turbo-lora-r64-kohya` es un adaptador LoRA (Low-Rank Adaptation) de rango 64 diseñado para el modelo base `krea/Krea-2-Turbo`, un modelo de difusión de texto a imagen desarrollado por Krea. El autor, rockerBOO, ha convertido las claves del adaptador al formato Kohya a partir del archivo original `krea2_turbo_lora_rank_64_bf16.safetensors` publicado por Comfy-Org. El repositorio tiene un tamaño de 0.5 GB y se distribuye a través de Hugging Face.

Este adaptador permite ajustar finamente el modelo base sin modificar la totalidad de sus pesos, lo que resulta útil para personalizar la generación de imágenes con un coste computacional menor. Sin embargo, la información pública del repositorio es mínima: no se especifica la licencia, los idiomas, el dataset de entrenamiento ni el concepto o estilo que codifica el LoRA. El modelo se carga mediante la librería `diffusers` y es compatible con flujos de trabajo que soporten formato Kohya.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) aplicado a krea/Krea-2-Turbo; el modelo base es un modelo de difusión de texto a imagen |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de texto) |
| Tipos de cuantizacion | No disponible (los pesos del LoRA original están en bf16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors, con claves en formato Kohya |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 64 que se aplica sobre el modelo base `krea/Krea-2-Turbo`, un modelo de difusión de texto a imagen. Los LoRA introducen matrices de bajo rango en las capas preentrenadas para ajustar el comportamiento del modelo sin reentrenar todos los pesos. En este caso, el adaptador fue creado originalmente en formato Diffusers y posteriormente convertido a formato Kohya, un estándar ampliamente utilizado en herramientas como ComfyUI.

No se dispone de información sobre el proceso de entrenamiento: no se especifican el dataset, el número de pasos, la composición de los datos ni si se utilizó alguna técnica de alineación posterior. Tampoco se indica el concepto o estilo que el LoRA debería codificar, ya que el campo `instance_prompt` es `null`. La única innovación documentada es la conversión de claves al formato Kohya, lo que facilita su uso en entornos que prefieren este formato.

## Capacidades

- Generación de imágenes a partir de texto: el adaptador se aplica sobre el modelo base Krea 2 Turbo para condicionar la generación de imágenes, aunque no se especifica el concepto o estilo que codifica.
- El widget del repositorio muestra un ejemplo de imagen generada a partir de un prompt descriptivo (una piña con gafas de sol y gafas de sol surfeando), lo que confirma que el modelo puede usarse con prompts de texto.
- Personalización mediante low-rank adaptation: permite ajustar el modelo base con un coste computacional reducido, en lugar de realizar un fine-tuning completo.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades de audio.
- No se indican capacidades multilingües.
- No incorpora modo de pensamiento ni funciones de visión adicionales, más allá de la generación de imágenes.

## Casos de uso

- Generación de imágenes en ComfyUI con personalización: integrar el LoRA en un grafo de nodos junto al modelo base Krea 2 Turbo para generar imágenes con un estilo o tema concreto, siempre que se conozca el concepto que codifica el adaptador.
- Investigación en adaptadores de difusión: usar este adaptador como caso de estudio de un LoRA de rango 64 sobre un modelo turbo, comparando su comportamiento con el LoRA original en formato Diffusers.
- Conversión y reutilización de pesos: servir como referencia de cómo convertir un LoRA del formato Diffusers al formato Kohya para entornos que solo soportan este último.
- Prototipado de personalización visual: en proyectos que requieren iteraciones rápidas de estilo, un LoRA permite ajustar el modelo base sin reentrenar, reduciendo los requisitos de cómputo.
- Evaluación de compatibilidad entre frameworks: probar la conversión de claves en bibliotecas como Diffusers o ComfyUI para verificar que el adaptador carga correctamente y produce resultados estables.
- Documentación y formación: utilizar el adaptador como ejemplo práctico en tutoriales sobre LoRA en modelos de difusión, dado su rango fijo y su tamaño reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre métricas de calidad de imagen (FID, CLIP score, etc.) ni comparaciones con otros adaptadores o modelos de difusión.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador. El consumo de VRAM depende del modelo base Krea 2 Turbo y de la resolución de las imágenes generadas.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumidor: es probable que el adaptador funcione en una GPU de consumidor, ya que el repositorio pesa 0.5 GB, pero no hay datos oficiales para confirmarlo.
- Opciones de despliegue: Diffusers y ComfyUI, al utilizar el formato Kohya que es totalmente compatible con ComfyUI. Otros frameworks con soporte de LoRA Kohya podrían funcionar, aunque no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Nombre | Formato | Rango | Tamano del repo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rockerBOO/krea-2-turbo-lora-r64-kohya | Kohya (safetensors) | 64 | 0.5 GB | No disponible | Hugging Face |
| Comfy-Org/Krea-2 (LoRA original rank 64 bf16) | Diffusers (safetensors) | 64 | No disponible | No disponible | Hugging Face |

Según la model card, el adaptador de rockerBOO es una conversión a formato Kohya del LoRA original de Comfy-Org, por lo que el comportamiento debería ser equivalente en principio. Sin embargo, no se han publicado benchmarks comparativos que confirmen esta equivalencia.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el modelo puede utilizarse en proyectos comerciales sin permiso explícito.
- Sin información sobre el dataset de entrenamiento: el adaptador puede no generalizar fuera del concepto o estilo que codifica, que además no está especificado.
- Ausencia de validación: el repositorio registra 0 descargas y 0 me gusta, lo que indica que no ha sido ampliamente probado por la comunidad.
- Posibilidad de incompatibilidades menores: al ser una conversión de claves a formato Kohya, pueden existir diferencias sutiles en el comportamiento respecto al archivo original.
- Artefactos visuales: como en todos los modelos de difusión, especialmente los turbo con pocos pasos de inferencia, pueden aparecer artefactos o inconsistencias en la imagen generada.
- Sin garantías de rendimiento ni soporte oficial.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/rockerBOO/krea-2-turbo-lora-r64-kohya
- Modelo base de referencia: https://huggingface.co/Comfy-Org/Krea-2
- LoRA original en formato Diffusers: https://huggingface.co/Comfy-Org/Krea-2/blob/main/loras/krea2_turbo_lora_rank_64_bf16.safetensors

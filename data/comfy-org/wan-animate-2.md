# Comfy-Org/Wan-Animate-2

## Resumen

Wan Animate 2 es un modelo de difusión para vídeo orientado a la transferencia de movimiento (*motion transfer*), es decir, animar un sujeto o personaje a partir de una referencia de movimiento extraída de un vídeo. El modelo original es Wan2.2-Animate-2-14B, desarrollado por Wan-AI, y esta ficha corresponde al reempaquetado oficial de Comfy-Org para su uso directo en ComfyUI. El repositorio incluye los pesos en formato `safetensors` de un solo archivo, junto con los componentes auxiliares necesarios (text encoder, VAE, CLIP vision y un LoRA de destilación).

El interés actual del modelo radica en que Comfy-Org distribuye una versión lista para producción dentro del ecosistema ComfyUI, con variantes en bf16, int8 y destiladas, lo que permite reducir requisitos de cómputo manteniendo el pipeline completo. Con más de 925.000 descargas y 119,2 GB de repositorio, se ha consolidado como una de las referencias para animación de personajes con control de movimiento en flujos de trabajo basados en nodos.

La información pública disponible es limitada: la model card se limita a indicar el reempaquetado y la estructura de carpetas, sin detallar arquitectura interna, datos de entrenamiento ni resultados de benchmarks. Los datos que se ofrecen a continuación proceden exclusivamente de la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusión para vídeo (detalles internos no disponibles) |
| Parametros totales | 14B (según denominación del modelo original Wan2.2-Animate-2-14B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, int8 (variantes `int8_convrot`), fp8 (text encoder), fp16 (text encoder) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivos únicos para ComfyUI) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El modelo pertenece a la familia Wan 2.2 y se distribuye como modelo de difusión para generación y animación de vídeo, con un tamaño de 14B parámetros según la nomenclatura del repositorio original (Wan-AI/Wan2.2-Animate-2-14B). El pipeline en ComfyUI combina un text encoder UMT5-XXL, un VAE (Wan2_1_VAE en bf16) y un codificador de visión CLIP (`clip_vision_h`), lo que sugiere un condicionamiento multimodal texto-imagen para la animación.

El reempaquetado incluye dos variantes principales: una versión completa en bf16 y una versión destilada, además de sendas variantes en int8 con rotación de convoluciones (`convrot`). También se incluye el LoRA `lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16`, orientado a destilación de pasos y CFG para imagen-a-vídeo a 480p. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Transferencia de movimiento: anima un sujeto o personaje a partir de una referencia de movimiento, según el flujo de trabajo "Motion Transfer" incluido.
- Generación de vídeo condicionada por texto e imagen: el pipeline integra text encoder UMT5-XXL y CLIP vision.
- Variantes destiladas: permiten reducir el número de pasos de muestreo y el coste computacional.
- Cuantización int8: variantes `int8_convrot` para despliegue con menor huella de memoria.
- Integración nativa con ComfyUI mediante plantillas de flujo de trabajo oficiales.
- Soporte de LoRA para destilación de pasos y CFG en imagen-a-vídeo a 480p.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Animación de personajes para producción audiovisual: usar el flujo "Motion Transfer" para trasladar el movimiento de un actor real a un personaje generado, manteniendo la identidad visual del sujeto de referencia.
- Previsualización rápida de animaciones: emplear la variante destilada junto con el LoRA de destilación de pasos para generar borradores de vídeo con menos pasos de muestreo antes de un render final en bf16.
- Creación de contenido para redes sociales: animar retratos o ilustraciones estáticas a partir de clips de movimiento cortos, con el pipeline completo en ComfyUI.
- Prototipado en estudios de animación: integrar el modelo en flujos de trabajo basados en nodos para iterar sobre poses y movimientos sin salir de ComfyUI.
- Despliegue en hardware limitado: utilizar las variantes int8 `convrot` para reducir la VRAM necesaria en estaciones con GPU de gama alta de consumo.
- Investigación en transferencia de movimiento: servir como base reproducible (licencia Apache 2.0) para experimentos de animación condicionada por vídeo y comparación con otros modelos de la familia Wan.
- Automatización de pipelines de vídeo: encadenar el modelo con otros nodos de ComfyUI para postprocesado, interpolación o composición de escenas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de difusión de 14B en bf16 requiere del orden de 28 GB solo para los pesos, a lo que hay que sumar el text encoder UMT5-XXL y el VAE; las variantes int8 reducen aproximadamente a la mitad el peso del modelo de difusión.
- GPU recomendadas: no disponibles en la documentación. Por tamaño, se sitúan en el rango de A100/H100 para bf16 sin cuantizar y de RTX 4090 o superiores para variantes int8 y destiladas.
- GPU de consumo: las variantes int8 y destiladas están pensadas para acercar el modelo a GPU de consumo de gama alta; no se confirma compatibilidad con GPU de menor VRAM.
- Opciones de despliegue: ComfyUI (soporte nativo mediante las plantillas oficiales); otros motores no están documentados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Wan Animate 2 (Comfy-Org) | 14B | no disponible | Apache 2.0 | Hugging Face, integrado en ComfyUI |
| Wan2.2-Animate-2-14B (Wan-AI) | 14B | no disponible | no disponible en la información | Hugging Face (repositorio original) |
| Otros modelos de animación por movimiento | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La model card no documenta sesgos, tasas de alucinación ni limitaciones idiomáticas; se desconoce el comportamiento del modelo fuera de los flujos de transferencia de movimiento.
- Al ser un modelo de difusión de vídeo, puede generar artefactos temporales, inconsistencias entre fotogramas o pérdida de identidad en movimientos complejos; no hay datos oficiales sobre la magnitud de estos fallos.
- El repositorio ocupa 119,2 GB, por lo que el almacenamiento y la transferencia de pesos son costosos.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo original Wan-AI/Wan2.2-Animate-2-14B, ya que esta ficha solo cubre el reempaquetado.
- El uso está orientado a ComfyUI; no se documentan integraciones con vLLM, TGI u otros motores de inferencia.
- No hay información sobre requisitos mínimos de VRAM ni sobre el rendimiento en GPU de consumo.
- El contenido generado puede plantear riesgos de suplantación de identidad o uso indebido de imágenes de personas; se recomienda aplicar salvaguardas en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Comfy-Org/Wan-Animate-2
- Modelo original: https://huggingface.co/Wan-AI/Wan2.2-Animate-2-14B
- ComfyUI (GitHub): https://github.com/Comfy-Org/ComfyUI
- Plantilla de flujo "Wan Animate 2: Motion Transfer": https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan_animate2.json
- Plantilla de flujo "Wan Animate 2 Distilled: Motion Transfer": https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan_animate2_distilled.json

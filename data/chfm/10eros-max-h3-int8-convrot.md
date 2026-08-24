# chfm/10Eros-Max-h3-int8-convrot

## Resumen

10Eros-Max H3 es un modelo de difusion para generacion de video basado en la arquitectura MiniMax H3, desarrollado originalmente por TenStrip como un proyecto personal de fine-tuning sobre el modelo base Hailuo H3 de MiniMax. Esta ficha cubre la conversion especifica publicada por el usuario chfm, que aplica cuantizacion INT8 con rotacion de pesos (ConvRot) para reducir el consumo de memoria y VRAM manteniendo la calidad del modelo original.

La relevancia de esta conversion radica en que permite ejecutar un modelo de video de gran tamano en hardware mas modesto, ya que el checkpoint BF16 original ocupa aproximadamente 40 GB, mientras que la version INT8 se reduce a unos 20 GB. El modelo se distribuye exclusivamente para ComfyUI, con formato de pesos safetensors y cuantizacion por canal con absmax, usando la convencion `int8_tensorwise`. La licencia es la misma que la del modelo original: la MiniMax H3 Community License Agreement.

La ficha se centra en las variantes `ref2va_beta2` (con y sin skip-edges), que son las mas recientes y usan la fuente corregida del checkpoint pruned. Tambien se preservan las variantes `fl2va_beta2` en el repositorio. El modelo esta pensado para generacion de video de alta calidad, con un enfoque en la coherencia temporal y el movimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMax-H3 (diffusion model para video) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (per-channel absmax, tensorwise), ConvRot con groupsize 256 |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-H3 Community License Agreement (con restricciones territoriales) |
| Formato de pesos | safetensors (`int8_tensorwise`) |

## Arquitectura y entrenamiento

El modelo base es `TenStrip/10Eros-Max`, un fine-tuning del MiniMax-H3 (Hailuo H2) para generacion de video. La arquitectura es un modelo de difusion de tipo transformer, disenado para producir video de alta fidelidad a partir de prompts textuales. El checkpoint original usa precision BF16 y fue entrenado con una receta de fine-tuning especifica que el autor denomina "ref2va" y "fl2va" (posiblemente referidas a estrategias de fine-tuning con refuerzo o a variantes de entrenamiento de video).

La conversion INT8 que se documenta en esta ficha no es un re-entrenamiento, sino una cuantizacion posterior al entrenamiento (PTQ) que aplica cuantizacion por canal con absmax en formato tensorwise. Se aplica ConvRot, una tecnica que rota los pesos para reducir los errores de cuantizacion, con un groupsize de 256. Hay dos variantes: la completa, con 200 capas cuantizadas, y la de skip-edges, que mantiene 4 bloques (0, 1, 48, 49) en precision original para preservar los limites de entrada y salida del modelo.

## Capacidades

- Generacion de video a partir de prompts textuales (text-to-video).
- Generacion de imagenes estaticas de alta calidad (el modelo base es un checkpoint de difusion que puede usarse para imagen y video).
- Fine-tuning orientado a la estructura temporal y el movimiento (variantes `ref2a` y `fl2va`).
- Soporte de ComfyUI nativo para cuantizacion INT8 con ConvRot.
- Reduccion de VRAM en inferencia gracias a la cuantizacion INT8 (aprox. 20 GB en lugar de 40 GB).
- No se ha documentado soporte de tool calling, agentes o funciones multimodales (audio, texto, etc.).

## Casos de uso

- **Generacion de video para prototipos de contenido**: el modelo permite crear clips de video cortos a partir de prompts descriptivos, util para previsualizar escenas en produccion audiovisual.
- **Generacion de imagenes fijas para concept art**: con la variante `ref2a` se pueden generar imagenes de alta calidad para ilustracion conceptual en juegos o cine.
- **Investigacion en cuantizacion de modelos de difusion**: el checkpoint INT8 con ConvRot sirve como referencia para estudiar el impacto de la cuantizacion en la calidad de video generado.
- **Despliegue en entornos con VRAM limitada**: la version INT8 permite ejecutar el modelo en una GPU de 24 GB (RTX 3090/4090) en lugar de necesitar 48 GB, facilitando el uso en estaciones de trabajo personales.
- **Desarrollo de flujos de trabajo en ComfyUI**: el formato `comfyui` y la integracion nativa con INT8 permiten integrar el modelo en pipelines de generacion de video dentro de ComfyUI sin conversiones adicionales.
- **Comparativa de variantes de fine-tuning**: las variantes `ref2a` y `fl2va` permiten comparar el impacto de diferentes estrategias de fine-tuning en la calidad del video generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 20-22 GB para la variante INT8 completa (200 capas cuantizadas) y algo mas para la variante skip-edges (184 capas cuantizadas, mas 4 capas en BF16).
- **GPU recomendadas**: NVIDIA RTX 4090 (24 GB) o superior, NVIDIA A100 40 GB, H100.
- **GPU consumer**: si cabe en una RTX 3090 o 4090 con 24 GB de VRAM.
- **Opciones de despliegue**: ComfyUI con soporte nativo para INT8 ConvRot. No se mencionan otros backends como vLLM, llama.cpp o TGI.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 10X-Max (BF16) | no disponible | no disponible | BF16 | MiniMax H3 Community | HuggingFace |
| 10X-Max H3 INT8 ConvRot (esta ficha) | no disponible | no disponible | INT8 (per-channel absmax + ConvRot) | MiniMax H3 Community | HuggingFace |
| MiniMax-H3 (base) | no disponible | no disponible | BF16 | MiniMax H3 Community | HuggingFace |

No se dispone de informacion suficiente para comparar con otros modelos de la misma categoria.

## Limitaciones y advertencias

- **Sesgos y contenido**: el modelo base fue fine-tuned para contenido artistico y puede tener sesgos en la representacion de personas y objetos. No se ha documentado una evaluacion de sesgos.
- **Riesgo de alucinacion**: en generacion de video, puede producir artefactos visuales, anatomia incorrecta o movimiento no fisico.
- **Restricciones de licencia**: la MiniMax H3 Community License Agreement incluye restricciones territoriales (probablemente excluye China y otras regiones) y restricciones de uso comercial. Revisar los terminos completos antes de usar.
- **Limitaciones de cuantizacion**: la cuantizacion INT8 puede degradar la calidad en comparacion con el checkpoint BF16, especialmente en los bordes de la imagen (por eso existe la variante skip-edges).
- **Soporte limitado**: el formato `int8_tensorwise` con ConvRot solo es compatible con versiones recientes de ComfyUI que soporten este tipo de cuantizacion. No es portable a otros frameworks.
- **Repositorio con multiples variantes**: el repositorio contiene tanto las variantes `ref2a` como `fl2va`, con diferencias de calidad y tamano. Se debe elegir la variante adecuada segun el caso de uso.

## Enlaces

- Modelo en HuggingFace: [chfm/10X-Max-h3-int8-convrot](https://huggingface.co/chfm/10X-Max-h3-int8-convrot)
- Modelo original: [TenStrip/10X-Max](https://huggingface.co/TenStrip/10X-Max)
- Licencia MiniMax H3: [MiniMax H3 Community License Agreement](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE)
- Repositorio del modelo original en Civitai: [H3 Eros Max - beta2](https://civitai.com/models/2851079/h3-eros-max)
- Repositorio de conversiones alternativas: [cicalooo/10X-Max-h3-int8-convrot](https://huggingface.co/cicalooo/10X-Max-h3-int8-convrot)
- Scripts de Colab para 10X-Max: https://github.com/shinshin86/comfy-agent/tree/main/scripts/colab/10eros_max

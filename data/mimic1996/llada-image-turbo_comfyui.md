# mimic1996/LLaDa-Image-Turbo_ComfyUI

## Resumen

LLaDA-Image-Turbo es un modelo de generacion de imagenes desarrollado por inclusionAI, y este repositorio en concreto contiene pesos cuantizados y optimizados para su uso en ComfyUI mediante la integracion de RealRebelAI. El modelo resuelve dos tareas principales: generacion de texto a imagen y edicion nativa de imagenes a partir de instrucciones, sin necesidad de un checkpoint de edicion separado. Su relevancia radica en que ofrece una variante cuantizada (INT8 para el transformer y Q4_K_M para el text encoder) que reduce los requisitos de almacenamiento y memoria, manteniendo la arquitectura original de LLaDA-Image. El modelo base es un transformer de difusion con un text encoder LLaDA2-MoE; el numero total de parametros no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (detalles no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | No aplica (modelo de imagen) |
| Tipos de cuantizacion | BF16, INT8, Q4_K_M (text encoder) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (remite a la licencia del modelo upstream) |
| Formato de pesos | Safetensors (BF16 e INT8), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion para generacion de imagenes, basado en el proyecto LLaDA-Image de inclusionAI. El text encoder es un modelo LLaDA2-MoE, suministrado en formato GGUF cuantizado Q4_K_M para reducir el uso de memoria. El soporte de edicion nativa se implementa mediante el procesamiento de la imagen fuente a traves del camino de condicionamiento SigVQ, lo que permite aplicar instrucciones de edicion sin recurrir a un img2img convencional basado en fuerza de denoise. No se han publicado datos sobre el conjunto de datos de entrenamiento, el numero de tokens, ni sobre procesos de alineacion como RLHF o DPO. Todos los pesos derivan del modelo original inclusionAI/LLaDA-Image-Turbo, y la integracion en ComfyUI se mantiene de forma independiente en el repositorio de RealRebelAI.

## Capacidades

- Generacion de texto a imagen con configuracion recomendada de 4 pasos y guidance scale de 1.0.
- Edicion nativa de imagenes mediante instrucciones de texto, sin necesidad de un checkpoint adicional.
- Uso de condicionamiento SigVQ para la edicion, que opera sobre la imagen fuente y la instruccion.
- Soporte de pesos cuantizados INT8 en el transformer y Q4_K_M en el text encoder, pensados para reducir el consumo de memoria en runtime.
- Integracion con ComfyUI mediante nodos personalizados de RealRebelAI.
- Dimensiones de edicion deben ser divisibles por 32.
- No se indica soporte de tool calling, agentes, ni capacidades multimodales mas alla de imagen y texto.

## Casos de uso

- Generacion de imagenes para prototipos de diseno: el modelo permite crear imagenes rapidas a partir de descripciones textuales, con 4 pasos y CFG 1.0, lo que lo hace adecuado para iteraciones iniciales en flujos de trabajo de diseno grafico.
- Edicion de fotos con instrucciones en produccion: gracias a la edicion nativa, se puede modificar una imagen existente (por ejemplo, cambiar el pelaje de un animal) sin necesidad de un modelo de edicion separado, manteniendo la composicion original.
- Integracion en pipelines de ComfyUI para contenido digital: al estar optimizado para ComfyUI, se puede insertar en grafos complejos que combinan generacion, edicion y guardado de imagenes, facilitando la automatizacion de tareas de creacion.
- Despliegue en entornos con memoria limitada: la cuantizacion INT8 y el text encoder GGUF Q4_K_M estan disenados para reducir los requisitos de VRAM, lo que permite ejecutar el modelo en configuraciones de hardware mas modestas que las necesarias para los pesos BF16 originales.
- Generacion de variantes de imagen para pruebas de concepto: se pueden generar multiples versiones de una misma escena cambiando la semilla o las instrucciones, util para validar conceptos visuales antes de pasar a produccion.
- Edicion de imagenes para publicacion en redes sociales: la capacidad de modificar elementos concretos de una fotografia (como cambiar el fondo o el color de un objeto) mediante instrucciones textuales simplifica el flujo de trabajo de creadores de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendada: no disponible.
- Compatibilidad con GPU de consumidor: no disponible.
- Opciones de despliegue: integracion en ComfyUI mediante los nodos personalizados de RealRebelAI.
- Latencia y throughput estimados: no disponible.
- El modelo puede ejecutarse en modo BF16 o INT8, siendo este ultimo mas ligero en memoria, pero no se aportan cifras concretas de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| inclusionAI/LLaDA-Image-Turbo (original) | no disponible | BF16 (sin cuantizar) | no disponible | Hugging Face |
| mimic1996/LLaDA-Image-Turbo_ComfyUI (este modelo) | no disponible | BF16, INT8, GGUF Q4_K_M | no disponible | Hugging Face |
| realrebelai/LLaDA-Image-Turbo_ComfyUI | no disponible | similar (derivado) | no disponible | Hugging Face |

No se dispone de datos de benchmarks para comparar el rendimiento con modelos de la misma categoria como FLUX o SDXL.

## Limitaciones y advertencias

- La licencia no esta especificada en este repositorio; se aplican los terminos del modelo upstream inclusionAI/LLaDA-Image-Turbo, que deben consultarse antes de uso comercial.
- Los pesos son derivados cuantizados, por lo que puede haber una perdida de calidad respecto a los pesos originales BF16, especialmente en el transformer INT8.
- No se ha publicado informacion sobre sesgos, alucinaciones ni limitaciones de idioma. La edicion de imagen requiere dimensiones divisibles por 32; si no se respetan, pueden aparecer artefactos.
- El modelo necesita los nodos personalizados de ComfyUI de RealRebelAI y la arquitectura de componentes de LLaDA-Image para funcionar; no es un modelo autocontenido.
- El text encoder se suministra como GGUF Q4_K_M y debe colocarse en la ruta de text_encoders de ComfyUI; el transformer no es un GGUF, sino un safetensors INT8 o BF16.
- No se han publicado datos sobre el rendimiento en tareas especificas ni benchmarks, por lo que la evaluacion debe realizarse de forma independiente antes de adoptarlo en produccion.

## Enlaces

- Repositorio Hugging Face de este modelo: https://huggingface.co/mimic1996/LLaDa-Image-Turbo_ComfyUI
- Repositorio Hugging Face del modelo base: https://huggingface.co/inclusionAI/LLaDA-Image-Turbo
- Codigo fuente oficial de LLaDA-Image: https://github.com/inclusionAI/LLaDA-Image
- Nodos de ComfyUI de RealRebelAI: https://github.com/RealRebelAI/LLaDa-Image_ComfyUI
- Repositorio alternativo en Hugging Face: https://huggingface.co/realrebelai/LLaDa-Image-Turbo_ComfyUI

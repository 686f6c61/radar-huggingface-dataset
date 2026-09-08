# felkf/Ornith-1.5-35B-A3B-BigBang-oQ6e-fp16-mtp

## Resumen

El modelo **Ornith-1.5-35B-A3B-BigBang-oQ6e-fp16-mtp** es un checkpoint de fusión lanzado por **felkf** (con el trabajo de fusión y evaluación realizado por **EryriLabs**, Dwain Barnes). Se trata de un merge TIES sobre la base **Qwen3.6-35B-A3B** que combina los post-entrenamientos de dos modelos: **ornith-ai/Ornith-1.5-35B-A3B** (especializado en codificación y agentes mediante RL) y **endless-frontier/BigBang-v1** (ajuste general). La particularidad de este checkpoint es que sustituye los tensores `mtp.*` de Ornith (que están inicializados aleatoriamente, con una aceptación de ~13% en decodificación especulativa) por el **head MTP entrenado de Qwen3.6-35B-A3B**, que se transfiere limpiamente gracias a la cercanía de la torre de lenguaje de Ornith con Qwen3.6.

El modelo tiene una arquitectura **mixta de expertos (MoE)** con aproximadamente **35.95 mil millones de parámetros totales** y **~3 mil millones activos por token**. Aunque la ficha no especifica la longitud de contexto, hereda las capacidades multimodales de Qwen3.6, por lo que es un modelo **image-text-to-text**. La fusión mantiene los routers MoE de Ornith (sin promediar) y la torre de visión de Qwen3.6, lo que preserva su comportamiento multimodal. La relevancia de este modelo radica en que combina un desempeño especializado en código con un ajuste general, y además incorpora un **head MTP utilizable para decodificación especulativa**, lo que puede aumentar la velocidad de generación en ~29% según las mediciones del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) sobre base Qwen3.6-35B-A3B (transformer) |
| Parametros totales | 35.951.822.704 (35,95B) |
| Parametros activos | ~3.000.000.000 (3B) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16/BF16 en este repo; cuantizaciones GGUF disponibles en repo externo (EryriLabs/Ornith-1.5-35B-A3B-BigBang-MTP-GGUF) |
| Idiomas soportados | no disponible (se mencionan comprobaciones puntuales de traducción al galés) |
| Licencia | MIT (con atribución a los tres modelos padre: Ornith-1.5 MIT, BigBang-v1 Apache-2.0, Qwen3.6-35B-A3B Apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una **fusión TIES** (density 0.25, λ=1.0) calculada en fp32 sobre todos los pesos de texto de la base Qwen3.6-35B-A3B. La fusión compone dos post-entrenamientos: el delta de Ornith-1.5 (entrenado con RL para codificación y agentes) y el de BigBang-v1 (ajuste general). Una innovación clave del proceso es que los **routers MoE se mantienen intactos de Ornith**, ya que el autor identifica el promediado de routers como la principal causa de rotura en fusiones de modelos MoE. La torre de visión también se conserva bit a bit de Qwen3.6, que es idéntica entre Ornith y Qwen3.6.

Respecto al head MTP (Multi-Token Prediction), Ornith-1.5-35B-A3B contiene 785 tensores `mtp.*` que en realidad son inicializaciones aleatorias de la librería, no pesos entrenados. El autor los sustituye por el head MTP entrenado de Qwen3.6-35B-A3B, que se transfiere con baja pérdida (la distancia coseno entre los grupos de tensores de Ornith y Qwen3.6 es de solo 0,2–1%). El head incorpora un layout de expertos fusionados y es compatible con la misma clase `Qwen3_5MoeForConditionalGeneration`. El modelo no ha sido sometido a un entrenamiento adicional, por lo que no hay datos de tokens de preentrenamiento ni de RLHF/DPO específicos.

## Capacidades

- Generación de texto y código: el modelo está especializado en tareas de programación gracias al post-entrenamiento de Ornith-1.5, que se evalúa con 15 tareas de Python pass@1.
- Razonamiento y agentes: hereda habilidades de razonamiento agéntico del RL de Ornith; el modo de razonamiento está siempre activado (`

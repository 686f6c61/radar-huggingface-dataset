# LiquidAI/d1-3B-MLX-8bit

## Resumen

d1-3B es un modelo de decisión desarrollado por Liquid AI que responde preguntas con nombre y tipo sobre un estado dado (texto, JSON o imágenes) en un único paso hacia delante, sin generar tokens. No es un modelo generativo al uso: recibe un conjunto de preguntas tipadas (`noul`/`bool`, `choice`, `score`) y devuelve directamente la respuesta más probable junto con su distribución de probabilidad y un valor de confianza. Está construido sobre la familia LFM2.5 de Liquid AI y pertenece a la categoría de modelos "system-one" orientados a clasificación y calibración en el edge.

Este repositorio concreto, `d1-3B-MLX-8bit`, es una exportación cuantizada a 8 bits para Apple Silicon, ejecutable con la librería `mlx-vlm` (versión 0.7.8 o superior). El modelo base tiene 3.123.483.888 parámetros y es multimodal (image-text-to-text), con soporte para 16 idiomas. Su tamaño contenido y su formato MLX lo hacen adecuado para inferencia local en hardware Apple.

La relevancia actual del modelo radica en su enfoque: sustituir tareas de clasificación y enrutamiento que normalmente requieren un LLM generativo (con su coste en tokens de salida) por una pasada única con salida estructurada y probabilidades calibradas. Esto reduce latencia y coste en pipelines de decisión, a la vez que ofrece confianza explícita para umbrales y abstención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm2_vl (familia LFM2.5; transformer multimodal con torre de visión, según tags del repo) |
| Parametros totales | 3.123.483.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (LM cuantizado, grupo de 64; torre de visión, proyector y norms en float16); existen variantes fp16 y 4 bits |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | lfm1.0 (licencia "other", enlace a LICENSE) |
| Formato de pesos | safetensors (MLX, 8 bits); repo de 7,5 GB |

## Arquitectura y entrenamiento

El modelo pertenece a la familia LFM2.5 de Liquid AI y se distribuye bajo el identificador de arquitectura `lfm2_vl`, lo que indica un transformer multimodal con torre de visión y proyector hacia el espacio del modelo de lenguaje. La innovación principal no está en la arquitectura generativa sino en el paradigma de decisión: el modelo responde preguntas tipadas sobre un estado en un solo forward pass, sin decodificación autoregresiva, y devuelve distribuciones de probabilidad sobre las opciones de cada pregunta.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card del export MLX se centra en el proceso de conversión y validación de precisiones, no en el entrenamiento. La conversión se realizó con `mlx-vlm convert` usando cuantización de 8 bits con grupo de 64 y dtype float16 para las partes no cuantizadas.

## Capacidades

- Decisión estructurada sobre texto, JSON o imágenes: responde preguntas con nombre y tipo en una sola pasada, sin generar tokens de salida.
- Preguntas de tipo `noul`/`bool`: devuelve la probabilidad de "sí".
- Preguntas de tipo `choice`: devuelve la etiqueta elegida, las probabilidades de cada opción y `metadata.confidence`.
- Preguntas de tipo `score`: devuelve el nivel esperado, las probabilidades por nivel y la leyenda (`legend`) de niveles.
- Procesamiento de imágenes: la imagen puede constituir el estado completo de la decisión (pipeline image-text-to-text).
- Multilingüe: 16 idiomas (árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés y vietnamita).
- Salida con calibración: probabilidades y confianza explícitas para aplicar umbrales o abstención.
- No se indica soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar cada mensaje entrante por equipo (`billing`, `technical`, `fraud`) y urgencia con una sola llamada, usando las probabilidades para derivar a revisión humana cuando la confianza sea baja.
- Detección de intención de reembolso: pregunta `noul` sobre el texto del cliente que devuelve la probabilidad de "sí", integrable en un flujo de atención al cliente con umbral configurable.
- Moderación y clasificación de contenido visual: usar la imagen como estado completo y preguntar por categorías con opciones tipadas (por ejemplo, recuento de objetos o presencia de elementos).
- Triaje de urgencia en soporte: pregunta `score` con niveles ("puede esperar", "hoy", "bloqueante") para priorizar colas sin generar texto.
- Extracción de señales desde JSON: pasar un estado estructurado y obtener decisiones tipadas sobre campos, útil en validación de formularios o pipelines de datos.
- Filtrado previo a un LLM generativo: usar d1-3B como primera etapa barata (sin tokens de salida) para decidir si un caso merece invocar un modelo mayor, reduciendo coste y latencia.
- Despliegue local en Mac: servir decisiones vía `mlx_vlm server` en `/v1/decisions` para prototipos y herramientas internas en Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente una validación de precisiones frente al checkpoint original en float32 (104 respuestas de texto y 41 de imagen):

| Repositorio | Pesos | Tamano | Misma respuesta top | Max Δp | Δp medio |
|---|---|---:|---:|---:|---:|
| d1-3B-MLX-fp16 | float16 | 6,25 GB | 145/145 | 0,005 | 0,0006 |
| d1-3B-MLX-8bit | 8 bits (LM); visión/proyector/norms fp16 | 3,72 GB | 144/145 | 0,015 | 0,0020 |
| d1-3B-MLX-4bit | 4 bits (LM); visión/proyector/norms fp16 | 2,37 GB | 142/145 | 0,212 | 0,0276 |

La propia model card advierte que esta comprobación es un "smoke test" de concordancia, no un benchmark de precisión.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 3,72 GB para los pesos en 8 bits; 6,25 GB en fp16; 2,37 GB en 4 bits.
- Hardware objetivo: Apple Silicon (MLX). No se documenta soporte para GPU NVIDIA en este repositorio.
- Cabe en equipos Mac con memoria unificada suficiente (los 3,72 GB de pesos más overhead de ejecución).
- Despliegue: `mlx-vlm` >= 0.7.8, con CLI (`python -m mlx_vlm decide`) y servidor (`python -m mlx_vlm server --decision-model ...`, endpoint `/v1/decisions`).
- Latencia y throughput: no disponibles en la información proporcionada.
- Recomendación del autor: fp16 es la precisión recomendada; 8 bits mueve las probabilidades hasta ~0,015 y 4 bits hasta ~0,2, por lo que 4 bits solo debería preferirse cuando la memoria importe más que la calibración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d1-3B-MLX-8bit | 3,12 B | no disponible | Decisión tipada sin generación, multimodal | lfm1.0 | HuggingFace (MLX) |
| d1-3B-MLX-fp16 | 3,12 B | no disponible | Igual, precisión fp16 | lfm1.0 | HuggingFace (MLX) |
| d1-3B-MLX-4bit | 3,12 B | no disponible | Igual, precisión 4 bits | lfm1.0 | HuggingFace (MLX) |
| d1-3B (original) | 3,12 B | no disponible | Igual, pesos PyTorch | lfm1.0 | HuggingFace |

No se dispone de información sobre modelos comparables de otros autores en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto: solo responde preguntas tipadas predefinidas; no sirve para generación libre ni conversación abierta.
- La calibración se degrada con la cuantización: en 8 bits el desplazamiento máximo de probabilidad es ~0,015; en 4 bits llega a ~0,2, lo que puede afectar a umbrales de decisión.
- Las respuestas top que cambian respecto a float32 corresponden a empates cercanos (el segundo candidato en float32 estaba a menos de 0,1).
- La comprobación de precisiones es un test de concordancia, no una evaluación de exactitud; no hay benchmarks de tarea publicados.
- Riesgo de sesgo y alucinación: no documentado en la información disponible; al ser un clasificador, el riesgo se manifiesta como etiquetas erróneas con alta confianza.
- Longitud de contexto no documentada; no se debe asumir una ventana grande para estados extensos.
- Licencia lfm1.0: conviene revisar el archivo LICENSE antes de uso comercial; la información disponible no detalla las restricciones concretas.
- Este repositorio es específico para Apple Silicon (MLX); no es directamente desplegable en CUDA sin reconvertir los pesos.
- Los archivos `.py` de PyTorch upstream se eliminaron tras la conversión, por lo que este repo no contiene la implementación de referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LiquidAI/d1-3B-MLX-8bit
- Modelo base: https://huggingface.co/LiquidAI/d1-3B
- Variante fp16: https://huggingface.co/LiquidAI/d1-3B-MLX-fp16
- Variante 4 bits: https://huggingface.co/LiquidAI/d1-3B-MLX-4bit
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Playground de Liquid AI: https://playground.liquid.ai/
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Paper referenciado (arXiv): https://arxiv.org/abs/2511.23404

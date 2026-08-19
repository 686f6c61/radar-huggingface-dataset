# avlp12/Qwen3.8-27B-Alis-MLX-4bit

## Resumen

Qwen3.8-27B-Alis-MLX-4bit es una cuantizacion AWQ de 4 bits en formato MLX del modelo vision-language Qwen3.8-27B, desarrollada por avlp12 para Apple silicon. A diferencia de las conversiones MLX estandar que descartan los pesos de vision, esta build conserva la torre de vision completa en bf16 (333 tensores, 0,461B parametros, 0,92 GB) y la cabeza MTP (multi-token prediction), lo que permite ejecutar un modelo de clase 27B con capacidades multimodales en un Mac de 24 GB con un pico de RAM de 15,6 GB.

El modelo ocupa 15,2 GB en disco y alcanza 37,7 tokens/s en decodificacion simple y 52,8 tokens/s con decodificacion especulativa (gated MTP k=4) en un Apple M3 Ultra. La calidad, medida por perplejidad a escala de corpus, muestra una degradacion real frente a bf16: minima en ingles, aproximadamente el doble en coreano y mayor en terminos relativos en codigo. El autor advierte explicitamente que se revise la seccion de calidad antes de desplegarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (hybrid attention, vision-language) |
| Parametros totales | 27B (clase, segun denominacion del modelo base); 4.731.843.312 segun indice safetensors |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ 4-bit (existen builds de 8-bit y 6-bit en la coleccion del autor) |
| Idiomas soportados | no disponible (perplejidad evaluada en ingles, coreano y codigo) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX, safetensors |

## Arquitectura y entrenamiento

Qwen3.8-27B es un checkpoint vision-language basado en la arquitectura Qwen3.5 (model_type qwen3_5) con atencion hibrida. La torre de vision tiene profundidad 27, hidden size 1152, 16 cabezas, patch 16 y spatial merge 2, con 333 tensores conservados en bf16 original sin cuantizar. La cabeza MTP se preserva integra (31 tensores), lo que habilita decodificacion especulativa con MTP k=2 y gated MTP k=4, ademas de compatibilidad con DSpark. El inventario total de tensores es de 2211, identico en las builds de 8, 6 y 4 bits.

El proceso de conversion y cuantizacion AWQ esta documentado en el repositorio GitHub avlp12/qwen38_alis_mlx, que incluye el desarrollo de kernels Metal para corregir el rendimiento de la decodificacion especulativa y una particion de prefill bitwise-exact sobre Thunderbolt 5. Los datos de entrenamiento del modelo base no estan disponibles en la informacion proporcionada.

## Capacidades

- Procesamiento de imagenes y texto (image-text-to-text): descripcion de imagenes, respuesta a preguntas visuales y razonamiento multimodal.
- Generacion conversacional multi-turno.
- Decodificacion especulativa integrada mediante cabeza MTP (k=2 y gated k=4), que acelera la generacion sin modificar los pesos.
- Compatible con mlx-vlm 0.6.13, que soporta el tipo de modelo qwen3_5 sin necesidad de codigo de portabilidad.
- Incluye preprocessor_config.json y video_preprocessor_config.json, lo que sugiere soporte de preprocesado de video ademas de imagen.
- Capacidad multilingue no confirmada oficialmente; la perplejidad se evaluo en ingles, coreano y codigo.

## Casos de uso

- Descripcion de imagenes en local: el modelo puede enumerar todos los elementos de una imagen (formas, colores, posiciones) directamente en un Mac sin conexion, gracias a la torre de vision en bf16 y al soporte nativo de mlx-vlm.
- Asistente multimodal para documentacion tecnica: analiza capturas de pantalla, diagramas o esquemas y genera descripciones textuales o resumenes para integrar en documentacion de proyectos.
- Prototipado vision-language en Apple silicon: permite iterar sobre prompts y tecnicas de prompting multimodal en un equipo local antes de escalar a infraestructura cloud.
- Generacion de codigo asistida por contexto visual: recibe capturas de pantalla de errores o diagramas de arquitectura y genera o corrige codigo, aunque la perplejidad en codigo es la mas degradada respecto a bf16.
- Evaluacion de cuantizacion AWQ en hardware Apple: sirve como referencia para medir el impacto de la cuantizacion de 4 bits en tareas multimodales frente a las builds de 8 y 6 bits de la misma coleccion.
- Despliegue de chatbots multimodales en equipos con 24 GB de memoria unificada: el pico de 15,6 GB permite ejecutar el modelo en Macs de gama media sin servidores dedicados.
- Desarrollo de pipelines de vision-language con decodificacion especulativa: la cabeza MTP conservada permite experimentar con configuraciones de aceleracion k=2 y k=4 en generacion larga.

## Benchmarks y rendimiento

La tabla siguiente recoge las mediciones del autor sobre un Apple M3 Ultra (512 GB de memoria unificada), con todas las builds encoladas en un mismo lote para compartir estado de maquina. La perplejidad es a escala de corpus (ctx 2048, stride 512, aproximadamente 103K tokens evaluados).

| Build | Tamano (GB) | Decodificacion (tok/s) | Prefill (tok/s) | Pico RAM (GB) | PPL en / ko / code |
|---|---|---|---|---|---|
| bf16 referencia | 51,8 | 12,6 | 410 | 51,1 | 5,7734 / 6,0954 / 1,6813 |
| 8-bit | 27,9 | 21,8 | 429 | 28,2 | 5,7760 / 6,0987 / 1,6815 |
| 6-bit | 21,5 | 27,3 | 424 | 21,9 | 5,7924 / 6,1018 / 1,6854 |
| 4-bit AWQ (este repo) | 15,2 | 37,7 | 436 | 15,6 | 5,8450 / 6,2609 / 1,8105 |

Con la configuracion especulativa optima (gated MTP k=4), la decodificacion alcanza 52,8 tok/s. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Apple silicon con al menos 24 GB de memoria unificada (pico de RAM de 15,6 GB a contexto corto; anadir cache KV segun la longitud de contexto deseada).
- Probado en Apple M3 Ultra con 512 GB de memoria unificada.
- 15,2 GB de espacio en disco.
- Libreria MLX y mlx-vlm 0.6.13 o superior.
- Decodificacion simple: 37,7 tok/s; con decodificacion especulativa (MTP k=4): 52,8 tok/s en M3 Ultra.
- Prefill: 436 tok/s.
- No requiere GPU dedicada; usa la GPU integrada de Apple silicon via Metal.

## Comparativa con modelos similares

| Modelo | Formato | Vision | MTP | Tamano | Notas |
|---|---|---|---|---|---|
| avlp12/Qwen3.8-27B-Alis-MLX-4bit (este) | MLX 4-bit AWQ | Si (333 tensores, bf16) | Si (31 tensores)

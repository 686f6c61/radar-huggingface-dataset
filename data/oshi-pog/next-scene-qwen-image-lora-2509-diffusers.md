# oshi-pog/next-scene-qwen-image-lora-2509-diffusers

## Resumen

`oshi-pog/next-scene-qwen-image-lora-2509-diffusers` es un adaptador LoRA (Low-Rank Adaptation) para el modelo Qwen-Image-Edit 2509, desarrollado originalmente por el usuario `lovis93`. La versión publicada por `oshi-pog` es un espejo byte-idéntico del checkpoint `next-scene_lora-v2-3000.safetensors`, pero con las claves de los tensores renombradas del formato ComfyUI (`diffusion_model.*`) al formato diffusers (`transformer.*`). Los pesos no se han modificado; solo se ha cambiado la cabecera del archivo safetensors.

La finalidad del adaptador es permitir que Qwen-Image-Edit genere secuencias de imágenes cinematográficas con progresión visual natural entre fotogramas, actuando como un director de fotografía que controla la dinámica de cámara, la composición y la continuidad narrativa. Los prompts deben comenzar con `Next Scene:` y se recomienda una fuerza de 0,7 a 0,8. No se han publicado especificaciones de arquitectura, tamaño de contexto ni datos de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen-Image-Edit 2509 (transformer de difusion para edicion de imagenes) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica sobre el modelo base `Qwen/Qwen-Image-Edit-2509`. No se dispone de información detallada sobre la arquitectura interna de la LoRA ni sobre el proceso de entrenamiento, el número de tokens, la composición del dataset o si se emplearon técnicas como RLHF o DPO. La única innovación técnica documentada en la model card es la renombrada de las claves de los tensores para que sea compatible con cargadores que filtran por el prefijo `transformer.*` (formato diffusers); sin este cambio, dichos cargadores interpretarían el archivo original como vacío.

Las capacidades funcionales, descritas por el autor original, sugieren un ajuste fino orientado a la generación de secuencias de imágenes con narrativa visual coherente. El checkpoint v2 de `lovis93` se corresponde con el archivo `next-scene_lora-v2-3000.safetensors`.

## Capacidades

- Edición y generación de imágenes en secuencia: permite obtener una progresión visual natural entre fotogramas, simulando movimiento de cámara y continuidad narrativa.
- Control mediante prompt: los prompts deben iniciarse con `Next Scene:` para activar el comportamiento cinematográfico del adaptador.
- Integración con Qwen-Image-Edit: funciona como capa adicional sobre el modelo base, sin sustituirlo.
- Compatibilidad con diffusers: esta versión concreta está pensada para cargadores que esperan el prefijo `transformer.*`.

## Casos de uso

- Storyboarding cinematográfico: un director o guionista puede describir una escena con `Next Scene:` y obtener una secuencia de imágenes que mantienen coherencia visual y narrativa, acelerando la previsualización de planos.
- Generación de viñetas para cómics: el adaptador puede producir transiciones fluidas entre paneles de una misma página, respetando la composición y el estilo visual.
- Previsualización de animación: al encadenar prompts de escenas consecutivas, se pueden obtener fotogramas clave que ayuden a planificar movimientos de cámara antes de la animación final.
- Diseño de concept art: permite explorar variaciones de una escena manteniendo la continuidad de iluminación, encuadre y atmósfera.
- Prototipado de secuencias para videojuegos: útil para generar cinemáticas preliminares o transiciones de escenario.
- Edición de imagen asistida: cualquier flujo de trabajo que requiera transformar una imagen manteniendo una progresión realista en lugar de cambios aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Los requisitos de hardware dependen del modelo base Qwen-Image-Edit 2509 y no se detallan en la documentación de la LoRA. Al tratarse de un adaptador de bajo rango, el incremento de memoria respecto al modelo base suele ser pequeño, pero no se dispone de cifras concretas. Para ejecutar el adaptador se necesita un entorno con los pesos del modelo base y la LoRA. No se indica qué GPU es compatible ni cuánta VRAM se requiere. Las opciones de despliegue más habituales para este tipo de adaptadores son la librería diffusers de Hugging Face, el plugin de ComfyUI (para la versión original), y potencialmente otros frameworks que soporten safetensors y el formato diffusers.

## Comparativa con modelos similares

| Modelo | Base | Formato | Diferencia principal |
|---|---|---|---|
| `oshi-pog/next-scene-qwen-image-lora-2509-diffusers` | Qwen-Image-Edit 2509 | Diffusers | Claves renombradas a `transformer.*`, ideal para cargadores diffusers |
| `lovis93/next-scene-qwen-image-lora-2509` | Qwen-Image-Edit 2509 | ComfyUI | Checkpoint original v2 con claves `diffusion_model.*` |
| `aiqwen/next-scene-qwen-image-lora-2509` | Qwen-Image-Edit 2509 | no confirmado | Mismo adaptador LoRA, distribuido por otro repositorio |

Los tres repositorios contienen esencialmente el mismo LoRA, con diferencias en el formato de claves o en la distribución. No se dispone de comparativas de rendimiento entre ellos.

## Limitaciones y advertencias

- La información técnica disponible es mínima: no se detallan parámetros, datos de entrenamiento ni evaluaciones, por lo que cualquier uso en producción debe ir precedido de pruebas empíricas.
- Al ser un adaptador LoRA, su funcionamiento depende por completo del modelo base Qwen-Image-Edit 2509. Si el modelo base cambia o no se carga correctamente, el adaptador no funcionará.
- La licencia MIT cubre únicamente los pesos del LoRA renombrado; el modelo base Qwen-Image-Edit 2509 puede tener condiciones de licencia diferentes. Se debe verificar la licencia del modelo base antes de un uso comercial.
- No existe información sobre sesgos o comportamiento ante prompts ambiguos. Como en todos los modelos de generación de imágenes, se recomienda supervisión humana para evitar contenido no deseado.
- El uso de `Next Scene:` como prefijo es una convención del creador original; no es un comportamiento garantizado en todos los entornos de inferencia.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/oshi-pog/next-scene-qwen-image-lora-2509-diffusers
- Repositorio original: https://huggingface.co/lovis93/next-scene-qwen-image-lora-2509
- Repositorio alternativo: https://huggingface.co/aiqwen/next-scene-qwen-image-lora-2509
- Modelo base Qwen-Image-Edit 2509: https://huggingface.co/Qwen/Qwen-Image-Edit-2509

# lantianws666/moss-graywind

## Resumen

Graywind V2 es un LoRA de personaje para la familia de modelos de generacion de imagenes MOSS-Image, publicado por el usuario lantianws666 en Hugging Face bajo licencia Apache 2.0. No se trata de un modelo fundacional autonomo, sino de un adaptador de bajo rango (rank 32) que se aplica sobre el modelo base OpenMOSS-Team/MOSS-Image-Base para reproducir de forma consistente un personaje de estilo anime llamado Graywind V2 (灰风 V2). El repositorio ocupa 0,2 GB y contiene un unico checkpoint safetensors de 141,8 MiB.

El adaptador codifica la identidad visual del personaje: complexión menuda, rostro redondeado y suave, cabello plateado grisaceo muy largo y ondulado, ojos cian y un vestido militar ornamentado en negro y rojo con ribetes dorados, capelina negra con forro rojo, guantes negros sin dedos, medias blancas hasta el muslo y botines negros con detalles dorados. El entrenamiento se realizo con solo 25 imagenes y 1500 pasos, lo que lo convierte en un LoRA de nicho orientado a la generacion consistente de un personaje concreto.

Su relevancia es acotada pero clara para quien trabaje con MOSS-Image: demuestra el flujo de entrenamiento de LoRAs de personaje sobre esta arquitectura (con text encoder Qwen3.5-9B y VAE flux2-vae) y ofrece variantes de vestuario integradas en el propio entrenamiento. No es compatible con SDXL, SD1.5 ni FLUX, por lo que solo tiene sentido dentro del ecosistema MOSS-Image.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre difusion MOSS-Image; rank 32, alpha 32 |
| Parametros totales | no disponible (checkpoint de 141,8 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | no disponible; el autor recomienda BF16 para base y text encoder, y evitar int8 en el text encoder |
| Idiomas soportados | no disponible (prompts en ingles en los ejemplos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`moss_graywind_v3_1500.safetensors`) |
| Modelo base | OpenMOSS-Team/MOSS-Image-Base (recomendado tambien MOSS-Image-SFT) |
| Text encoder | Qwen3.5-9B BF16 |
| VAE | flux2-vae (decodificacion fp32 recomendada) |
| Resoluciones recomendadas | 1216x1712, 1024x1536, 1024x1024 |
| Trigger word | `moss_graywind` |

## Arquitectura y entrenamiento

El LoRA se entrena sobre MOSS-Image, un modelo de difusion text-to-image que emplea el text encoder Qwen3.5-9B y el VAE flux2-vae. El adaptador tiene rango 32 y alpha 32, se entreno a resolucion 1024 durante 1500 pasos (60 epocas) con precision BF16 tanto en el modelo base como en el text encoder, programacion de learning rate coseno de 1e-4 a 1e-6 y FlowMatch como objetivo de entrenamiento.

El dataset es muy reducido: 25 imagenes, de las cuales 18 corresponden al vestido militar negro y rojo caracteristico, 4 a una chaqueta negra corta y 3 a un conjunto casual de camisa y chaleco. El etiquetado se realizo con wd-eva02-large-tagger-v3 combinado con etiquetas manuales de anclaje de identidad, lo que explica que el modelo acepte bloques de prompt muy detallados para describir el atuendo. Al incluir variantes de vestuario en el entrenamiento, el LoRA permite intercambiar el bloque de ropa manteniendo la identidad del personaje.

## Capacidades

- Generacion text-to-image de un personaje anime concreto (Graywind V2) con alta consistencia de identidad mediante la trigger word `moss_graywind`.
- Control detallado del atuendo mediante bloques de prompt: vestido militar negro y rojo, chaqueta negra corta o conjunto de camisa gris y chaleco.
- Intercambio de vestuario (outfit swap) manteniendo rasgos faciales, color de pelo y ojos, gracias a las variantes incluidas en el entrenamiento.
- Compatibilidad con LoRAs de estilo apilados (el autor cita Chenbin V6 al 0,75 con peso del personaje al 0,80).
- Soporte de composicion de escena y estilo mediante prompt (iluminacion, encuadre, fondo, hora dorada, etc.).
- No soporta tool calling, agentes ni razonamiento multi-paso: es exclusivamente un adaptador de generacion de imagenes.
- Capacidades multilingues: no documentadas; los ejemplos de prompt estan en ingles.

## Casos de uso

- Ilustracion de personaje consistente para proyectos de ficcion o novela ligera: usar la trigger word junto al bloque completo de rasgos para generar variaciones de Graywind V2 en distintas poses y escenarios sin perder la identidad.
- Creacion de hojas de personaje (character sheets): generar vistas de cuerpo completo a 1216x1712 con el bloque de vestuario completo para documentar el diseno oficial.
- Variaciones de vestuario en produccion: reutilizar el bloque de identidad y sustituir solo la seccion de ropa para obtener el mismo personaje con chaqueta corta o conjunto casual, util para merchandising o arte conceptual.
- Integracion en pipelines de generacion por lotes con diffusers: al ser un safetensors de 141,8 MiB, se puede cargar y descargar dinamicamente en un servidor de inferencia para servir peticiones de un personaje especifico.
- Composicion de escenas con estilo apilado: combinar con un LoRA de estilo (por ejemplo, Chenbin V6 al 0,75) para producir ilustraciones 2.5D con fondos realistas, segun los ejemplos de la model card.
- Prototipado rapido de arte para juegos o fan art: ajustar peso del LoRA entre 0,85 y 0,90 y CFG 3,0 para obtener resultados equilibrados con 30-50 pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 141,8 MiB en safetensors; el coste real de VRAM lo determina el modelo base MOSS-Image y el text encoder Qwen3.5-9B.
- El autor recomienda BF16 completo para el text encoder Qwen3.5-9B y evitar int8; esto implica una huella de memoria considerable solo para el encoder.
- Decodificacion del VAE flux2-vae en fp32 recomendada, lo que anade requisitos de memoria en la fase de decodificacion.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible; por el tamano del text encoder (9B) y el uso de BF16, se requiere una GPU de gama alta con suficiente VRAM, aunque no se especifican modelos concretos.
- Opciones de despliegue: libreria diffusers (pipeline text-to-image); no se documentan otras opciones como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Graywind V2 (este) | LoRA de personaje sobre MOSS-Image | rank 32, 141,8 MiB | no aplica | Apache 2.0 | Solo MOSS-Image; 25 imagenes de entrenamiento |
| LoRAs de personaje para SDXL | LoRA sobre SDXL | variable | no aplica | variable | Ecosistema mucho mayor; no compatible con MOSS-Image |
| LoRAs de personaje para FLUX | LoRA sobre FLUX | variable | no aplica | variable | No compatible con MOSS-Image |

No se dispone de datos de rendimiento comparativo entre este LoRA y alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeno (25 imagenes), lo que puede limitar la generalizacion a poses, angulos o expresiones no vistas.
- Solo es compatible con MOSS-Image; no funciona con SDXL, SD1.5 ni FLUX, lo que restringe su uso al ecosistema MOSS-Image.
- Requiere el text encoder Qwen3.5-9B en BF16 y evitar int8, lo que eleva los requisitos de hardware.
- Riesgo de sobreajuste al atuendo principal (18 de 25 imagenes son del vestido militar), con menor calidad en las variantes de chaqueta y casual.
- No se documentan sesgos especificos ni evaluaciones de seguridad; al ser un personaje de anime, puede heredar sesgos del modelo base y de los datos de entrenamiento.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar detalles anatomicos incorrectos, especialmente con pesos altos del LoRA.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni documenta restricciones adicionales sobre el personaje.
- No se documentan capacidades multilingues; los prompts de ejemplo estan en ingles y el rendimiento con otros idiomas es desconocido.

## Enlaces

- Hugging Face: https://huggingface.co/lantianws666/moss-graywind
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base

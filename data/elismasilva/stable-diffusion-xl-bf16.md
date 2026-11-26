# elismasilva/stable-diffusion-xl-bf16

## Resumen

`elismasilva/stable-diffusion-xl-bf16` es una reproduccion no oficial de Stable Diffusion XL base 1.0 (SDXL) en la que unicamente se ha modificado la precision de almacenamiento de los pesos: los ficheros originales en float32 se han convertido a bfloat16. No se ha realizado ningun ajuste fino, fusion, poda ni cuantizacion adicional; cada tensor guardado es exactamente el cast a bfloat16 del tensor float32 de origen. El modelo lo publica el usuario elismasilva y no esta afiliado ni respaldado por Stability AI.

SDXL es un modelo de difusion texto-a-imagen de la familia Latent Diffusion, compuesto por dos text encoders (CLIP ViT-L y CLIP ViT-bigG), un UNet de difusion y un VAE. Esta version mantiene la estructura de carpetas de Diffusers (`StableDiffusionXLPipeline`) y conserva intactos `model_index.json`, el scheduler, los tokenizers, las configuraciones de componente y la licencia.

Su relevancia practica es de eficiencia: al almacenar los pesos en bfloat16, el repositorio ocupa aproximadamente la mitad que la version float32 original, y el VAE puede decodificar directamente en bfloat16 sin el upcast a float32 que exige la variante float16 del VAE de SDXL. Es util para despliegues con VRAM limitada o para pipelines que ya operan en bf16, a costa de una numerica ligeramente distinta a la de los pesos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent Diffusion: UNet + doble text encoder (CLIP ViT-L y CLIP ViT-bigG) + VAE |
| Parametros totales | no disponible (el repositorio ocupa 6,9 GB en bfloat16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (prompt de texto; longitud maxima fijada por los tokenizers CLIP, no documentada en la informacion disponible) |
| Tipos de cuantizacion | bfloat16 (unico formato publicado); no se han generado variantes cuantizadas |
| Idiomas soportados | no disponible (los text encoders CLIP estan entrenados principalmente en ingles) |
| Licencia | CreativeML Open RAIL++-M (openrail++), con restricciones de uso |
| Formato de pesos | safetensors (layout de Diffusers) |

## Arquitectura y entrenamiento

La arquitectura es la de SDXL base 1.0 sin modificaciones: un UNet que opera en el espacio latente, condicionado por dos text encoders CLIP (ViT-L y ViT-bigG) y un VAE que codifica y decodifica entre pixeles y latentes. El repositorio incluye los cuatro componentes con el siguiente numero de tensores convertidos: `text_encoder` (196), `text_encoder_2` (517), `unet` (1680) y `vae` (248).

No hay entrenamiento nuevo en este repositorio. La unica transformacion es el cast de float32 a bfloat16 de los pesos de la revision `462165984030d82259a11f4367a4eed129e94a7b` del modelo original. El autor documenta el metodo de conversion y los hashes SHA-256 de origen y salida en `conversion.json` (en la raiz y por componente). Un detalle tecnico relevante es que las configuraciones de los text encoders siguen declarando `torch_dtype: float32`, por lo que es necesario pasar el dtype de forma explicita al cargar el pipeline. Al conservar bfloat16 el rango de exponente de float32, el VAE decodifica sin el upcast a float32 que requiere la version float16.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (text-to-image) mediante `StableDiffusionXLPipeline` de Diffusers.
- Soporte de prompt negativo para excluir elementos no deseados de la imagen.
- Control de pasos de inferencia (`num_inference_steps`) y de escala de guiado (`guidance_scale`).
- Compatible con los endpoints de Hugging Face (tag `endpoints_compatible`).
- Inferencia en bfloat16 en GPU, con ahorro de memoria frente a float32.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso: es un modelo generativo de imagenes, no un modelo de lenguaje.
- No se documentan capacidades de vision, audio, thinking mode ni multilingues especificas.

## Casos de uso

- Generacion de ilustraciones y arte conceptual: el pipeline acepta prompts descriptivos con estilos (por ejemplo, pintura al oleo) y prompt negativo para eliminar artefactos, lo que permite iterar rapidamente sobre bocetos visuales.
- Prototipado de pipelines de difusion en bf16: al estar ya convertido, sirve para validar flujos que operan en bfloat16 sin tener que convertir los pesos en cada carga.
- Despliegue con VRAM limitada: el repositorio ocupa 6,9 GB frente a los aproximadamente 13-14 GB de la version float32, lo que facilita su carga en GPUs con menos memoria.
- Generacion de imagenes de relleno para maquetas y pruebas de interfaz: util para equipos que necesitan assets visuales sinteticos en entornos de desarrollo.
- Investigacion sobre el impacto de la precision numerica: al ser un cast exacto y documentado con hashes, permite comparar salidas bf16 frente a float32 y float16 de forma controlada.
- Integracion en servicios de generacion de imagenes bajo demanda: compatible con Diffusers y con los endpoints de Hugging Face, se puede exponer como API de text-to-image.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 6,9 GB en bfloat16, por lo que se necesita al menos esa cantidad de memoria mas el overhead de activaciones y del pipeline.
- GPU recomendadas: no disponible en la informacion proporcionada. Al ser SDXL en bf16, requiere GPUs con soporte de bfloat16 (generaciones Ampere o posteriores en NVIDIA).
- Cabe en GPU de consumo: no confirmado en la informacion disponible; depende de la VRAM concreta de la tarjeta.
- Opciones de despliegue: Diffusers (`StableDiffusionXLPipeline`), endpoints de Hugging Face. No se documentan otras opciones (ComfyUI, A1111, etc.).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Precision de pesos | Tamano del repo | Pipeline | Licencia |
|---|---|---|---|---|
| elismasilva/stable-diffusion-xl-bf16 | bfloat16 | 6,9 GB | text-to-image | openrail++ |
| stabilityai/stable-diffusion-xl-base-1.0 | float32 | no disponible en la informacion | text-to-image | openrail++ |
| Variante float16 del VAE de SDXL | float16 | no disponible en la informacion | text-to-image | openrail++ |

La diferencia principal frente al modelo original es unicamente la precision de almacenamiento (bfloat16 frente a float32), con la consiguiente reduccion de tamano y la capacidad de decodificar el VAE sin upcast. No se dispone de datos de rendimiento comparativo entre ambas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es una release oficial de Stability AI; el autor lo indica explicitamente y no esta afiliado ni respaldado por Stability AI.
- Los resultados en bfloat16 son cercanos pero no identicos a los de los pesos float32 y float16 originales, debido al cambio de numerica.
- Las configuraciones de los text encoders siguen declarando `torch_dtype: float32`; es obligatorio pasar el dtype explicitamente al cargar o se produciran errores o un comportamiento no deseado.
- Riesgo de sesgos y de alucinacion visual heredado del modelo base; la model card remite a la del original para sesgos, usos previstos y limitaciones.
- Idiomas: no se documenta soporte multilingue; los text encoders CLIP estan orientados principalmente al ingles.
- Licencia CreativeML Open RAIL++-M con restricciones de uso basadas en el uso; es necesario revisar `LICENSE.md` antes de un uso comercial.
- Sin datos publicados de benchmarks, latencia ni requisitos oficiales de hardware en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/elismasilva/stable-diffusion-xl-bf16
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Licencia: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/blob/main/LICENSE.md

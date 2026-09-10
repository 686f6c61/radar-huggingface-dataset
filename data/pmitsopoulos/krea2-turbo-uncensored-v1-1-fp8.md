# pmitsopoulos/krea2-turbo-uncensored-v1.1-FP8

## Resumen

Krea 2 Turbo Uncensored v1.1 FP8 es una build pre-fusionada y cuantizada del modelo de difusion Krea 2 Turbo, orientada a edicion de imagen (image-to-image) y generacion texto-a-imagen. La publica el usuario pmitsopoulos en HuggingFace sobre los pesos base de krea/Krea-2-Turbo y conradlocke/krea2-identity-edit. No es un modelo de lenguaje: es un transformer de difusion (DiT) de aproximadamente 12.820 millones de parametros, distribuido principalmente en formato GGUF y con una variante FP8.

Su rasgo diferencial es que integra cinco LoRAs ya fusionadas en los pesos: una LoRA de detalle fino (fuerza 0,75), la LoRA Identity Edit (1,0), una LoRA Turbo de 4 pasos con rango 64 (1,0), una LoRA de detalle de piel (0,45) y una LoRA de reduccion de rechazos de contenido NSFW con rango 64 (0,8). El resultado es un modelo que reduce el minimo de pasos de inferencia utilizables de 8 a 4, acelera la generacion y elimina buena parte de los filtros de contenido del modelo original.

Es relevante ahora porque combina tres cosas dificiles de encontrar juntas: inferencia muy rapida (4-8 pasos, CFG 1.0), preservacion de identidad en edicion y ausencia de censura en la generacion, todo dentro del ecosistema ComfyUI. El coste es una licencia sin especificar, la etiqueta not-for-all-audiences y un rendimiento de edicion imperfecto, con cambios de rostro entre generaciones cuando el prompt no es suficientemente explicito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT), segun el autor "an ALL NEW Transformer"; se carga en la carpeta `diffusion_models` de ComfyUI |
| Parametros totales | 12.820.073.036 (aproximadamente 12,82 mil millones, dato de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; es un modelo de imagen. Resolucion documentada: 1024 x 1024, minimo 512 x 512 |
| Tipos de cuantizacion | GGUF (variante Q4_K_M documentada, 7,22 GB) y FP8; no se enumeran el resto de niveles GGUF disponibles |
| Idiomas soportados | No disponible (los prompts de ejemplo estan en ingles) |
| Licencia | unknown (no especificada) |
| Formato de pesos | GGUF y safetensors (FP8); el repo incluye tambien text encoder y VAE en safetensors |
| Pasos de inferencia | 8 por defecto; minimo 4, maximo 16 |
| CFG | 1.0 (obligatorio en variantes turbo, segun el autor) |
| Componentes auxiliares | Text encoder `qwen3vl_4b_fp8_scaled.safetensors` (5,24 GB), VAE `qwen_image_vae.safetensors` (254 MB) |
| Tamano del repositorio | 36,4 GB |
| Pipeline declarado | image-to-image |
| Libreria | gguf |

## Arquitectura y entrenamiento

La base es Krea 2 Turbo, un transformer de difusion para generacion y edicion de imagen. Sobre esa base, el autor ha fusionado cinco fine-tunes en los pesos en lugar de aplicarlos como adaptadores en tiempo de inferencia, lo que elimina la sobrecarga de cargar LoRAs por separado y hace que el modelo funcione como un unico checkpoint. La LoRA Identity Edit es la que habilita la edicion fuerte con preservacion de identidad; la LoRA Turbo de 4 pasos (rango 64) es la que reduce el minimo de pasos utilizables de 8 a 4, lo que explica el aumento de velocidad.

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO (conceptos que, por otra parte, no aplican del mismo modo a un modelo de difusion). Tampoco se detalla el proceso de fusion de las LoRAs ni los hiperparametros de entrenamiento de cada una. La innovacion tecnica declarada es doble: por un lado, el pipeline de edicion con identidad preservada; por otro, la cuantizacion FP8, que segun el autor es el doble de rapida incluso en VRAM baja, manteniendo una calidad comparable a la version GGUF.

El modelo se apoya en un text encoder Qwen3VL de 4B en FP8 y en el VAE de Qwen Image, lo que sugiere que el stack original de Krea 2 Turbo esta construido sobre componentes del ecosistema Qwen. El autor advierte de que es necesario usar una version actualizada del cargador GGUF de ComfyUI (comfyui-gguf-loader, canal remoto del ComfyUI Manager) para que los pesos carguen correctamente.

## Capacidades

- Generacion de imagen texto-a-imagen sin censura efectiva en contenido NSFW, con los guardrails limitados a contenido ilegal segun el autor.
- Edicion de imagen image-to-image: cambio de ropa, sustitucion de elementos, eliminacion de objetos y modificacion de escenas manteniendo la composicion original.
- Preservacion de identidad entre la imagen original y la editada, con la advertencia explicita de que los rostros pueden cambiar si el prompt no es suficientemente fuerte.
- Edicion de texto dentro de la imagen (por ejemplo, imprimir "Krea2" en una camiseta o pintarlo sobre el cuerpo).
- Generacion e inferencia en 4-8 pasos con CFG 1.0, lo que reduce drasticamente el coste por imagen frente a modelos de 20-50 pasos.
- Refinado de detalle facial y de piel, heredado de las LoRAs de detalle fino y de piel, para evitar el aspecto plastico tipico de otros fine-tunes.
- No dispone de tool calling, function calling, soporte de agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- Capacidades multilingues: no disponibles; toda la documentacion y los ejemplos usan prompts en ingles.

## Casos de uso

- Edicion de fotografia de producto: sustituir el fondo, cambiar el color o el tejido de una prenda o eliminar elementos no deseados manteniendo intacto el producto, con 4-8 pasos por imagen y CFG 1.0, lo que abarata el coste por variante en catalogos grandes.
- Prototipado rapido de fotografia de moda: generar variaciones de una misma modelo con distintas prendas, iluminacion y encuadre preservando la identidad facial, util para moodboards y presentaciones a cliente antes de una sesion real.
- Produccion de contenido para ilustracion y comic para adultos: el modelo no aplica censura practicamente, por lo que encaja en estudios que ya trabajan con contenido explicito y necesitan control fino sobre la pose, el vestuario y el encuadre.
- Pipelines de edicion por lotes en ComfyUI: al ser un unico transformer con las LoRAs ya fusionadas, se puede encadenar en workflows de nodos sin gestionar adaptadores adicionales, lo que simplifica el versionado y el despliegue.
- Generacion de variaciones de un personaje consistente: usando prompts con instrucciones explicitas de mantener el rostro y el encuadre, sirve para producir conjuntos de imagenes de un mismo personaje en escenas distintas a partir de una imagen de referencia.
- Retoque y restauracion estilizada: la LoRA de detalle de piel y la de detalle fino permiten recuperar textura en rostros y zonas que otros modelos dejan con aspecto ceroso, partiendo de una imagen de entrada y aplicando una edicion suave.
- Desarrollo y prueba de interfaces de edicion: al ser rapido en 4 pasos, es adecuado para prototipar UIs de edicion de imagen interactivas donde el usuario ve el resultado en segundos antes de refinar.
- Investigacion sobre mitigacion de rechazos: la LoRA de reduccion de rechazos lo convierte en una referencia practica para estudiar el comportamiento de modelos de difusion ante prompts que disparan filtros de seguridad en los modelos originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, SSIM de preservacion de identidad ni comparativas cuantitativas con otros modelos). La busqueda web realizada no devolvio ningun resultado relacionado con este modelo ni con Krea 2 Turbo; los resultados obtenidos correspondian a documentacion de Oracle Database y no son relevantes.

Los unicos datos de rendimiento son cualitativos y provienen del autor: FP8 es aproximadamente el doble de rapido que la version GGUF, incluso en equipos con poca VRAM, y ambas variantes producen calidad alta. Tambien afirma que image-to-image es "very fast" a 8 pasos.

## Requisitos de hardware

- VRAM estimada para la variante GGUF Q4_K_M: el transformer pesa 7,22 GB; sumando el text encoder Qwen3VL 4B en FP8 (5,24 GB) y el VAE (254 MB), el conjunto ronda los 12,7 GB de pesos. Con overhead de activaciones, es razonable apuntar a 12-16 GB de VRAM, cifra orientativa calculada a partir de los tamanos de archivo publicados, no confirmada por el autor.
- VRAM estimada para la variante FP8: el repo completo ocupa 36,4 GB, pero ese total incluye muestras e imagenes; no se publica el tamano exacto del transformer en FP8. Como referencia, un transformer de 12,82 mil millones de parametros en FP8 ocupa aproximadamente 12,8 GB solo en pesos, a lo que hay que sumar text encoder y VAE.
- GPU consumer: cabe en tarjetas de 16 GB o mas (RTX 4080, RTX 4090, RTX 5080/5090) con la variante GGUF Q4_K_M, y presumiblemente en 24 GB sin problemas. En GPUs de 8-12 GB habria que recurrir a cuantizaciones GGUF mas agresivas que las documentadas.
- GPU de datacenter: A100, H100, L40S o similares permiten trabajar en FP8 y procesar lotes, sin que el autor publique cifras de throughput.
- Opciones de despliegue: ComfyUI es el entorno de referencia indicado por el autor, con el cargador comfyui-gguf-loader actualizado (canal remoto del ComfyUI Manager). Para GGUF tambien es aplicable el soporte GGUF generico de ComfyUI. No se documentan otros runners.
- Latencia y throughput: no disponibles. El unico dato es que 8 pasos es la configuracion por defecto y 4 el minimo, con FP8 aproximadamente dos veces mas rapido que GGUF.

## Comparativa con modelos similares

La busqueda web no devolvio informacion verificable sobre alternativas, por lo que los datos de terceros no se han podido contrastar. Se ofrece una comparativa estructural con campos marcados como no disponible alli donde no hay dato confirmado.

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| krea2-turbo-uncensored-v1.1-FP8 | 12,82 mil millones | 1024 x 1024 (min. 512 x 512) | Sin benchmarks publicados; 4-8 pasos, CFG 1.0 | unknown | HuggingFace, formato GGUF y FP8 |
| krea/Krea-2-Turbo (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | HuggingFace |
| conradlocke/krea2-identity-edit (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | HuggingFace |
| Alternativas de edicion por difusion (FLUX.1 Kontext, Qwen-Image-Edit, etc.) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No verificado en esta busqueda |

En terminos estructurales, la ventaja del modelo frente a trabajar con Krea 2 Turbo mas LoRAs sueltas es la simplicidad de despliegue: un unico checkpoint, sin cargar cinco adaptadores con fuerzas distintas. La desventaja es la perdida de flexibilidad, ya que las fuerzas de las LoRAs (0,75 / 1,0 / 1,0 / 0,45 / 0,8) estan fijadas en los pesos y no se pueden ajustar en tiempo de inferencia.

## Limitaciones y advertencias

- Contenido para adultos: el modelo lleva las etiquetas not-for-all-audiences y su proposito declarado incluye generar contenido NSFW. No es apto para productos dirigidos al publico general ni para entornos sin control de acceso.
- Licencia unknown: al no especificarse licencia, no hay autorizacion explicita de uso comercial. Cualquier uso en produccion o en un producto distribuido requiere aclarar la licencia con el autor, tanto de esta build como de los modelos base krea/Krea-2-Turbo y conradlocke/krea2-identity-edit.
- Estabilidad de identidad: el propio autor advierte de que la edicion no es perfecta y que los rostros pueden cambiar entre generaciones si el prompt no es lo bastante fuerte. En flujos con requisitos de consistencia alta hay que verificar cada resultado.
- Sesgos: no se documenta ninguna evaluacion de sesgos. El modelo esta entrenado sobre datos no especificados y puede reproducir sesgos de representacion de genero, etnia, edad y cuerpo.
- Alucinacion visual: como todo modelo de difusion, puede generar anatomias incorrectas (manos, dedos, proporciones), texto mal formado en la imagen y elementos incoherentes con el prompt. Los ejemplos de la model card muestran texto renderizado, pero no hay garantia de fidelidad en cadenas largas.
- Prompt engineering obligatorio: el autor insiste en que los prompts deben ser muy detallados y directos, con instrucciones explicitas como "keep faces consistent" o "same crop as original". Sin ese nivel de detalle el resultado degrada.
- Dependencia de tooling concreto: requiere una version actualizada de comfyui-gguf-loader. Con cargadores GGUF antiguos los pesos pueden no cargar.
- Idiomas: no hay informacion sobre soporte multilingue. Los prompts de ejemplo son en ingles y no se confirma que otros idiomas funcionen igual de bien.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe una comunidad que haya validado su comportamiento en produccion.
- Riesgo legal y etico: la generacion de imagenes de personas reales sin consentimiento, contenido sexual no consentido o material de menores es ilegal en la mayoria de jurisdicciones. El autor afirma que mantiene guardrails contra contenido ilegal, pero los guardrails de un fine-tune sin censura no son una garantia tecnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pmitsopoulos/krea2-turbo-uncensored-v1.1-FP8
- Repositorio referenciado en la model card (autor original de la build): https://huggingface.co/ChrisColeTech/krea2-turbo-uncensored-v1.1-FP8
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Modelo base (identity edit): https://huggingface.co/conradlocke/krea2-identity-edit
- Transformer GGUF Q4_K_M (7,22 GB): https://huggingface.co/ChrisColeTech/krea2-turbo-uncensored-v1.1-FP8/resolve/main/split/diffusion_models/Krea2_turbo_uncensored_edit_v1.1-Q4_K_M.gguf
- Text encoder Qwen3VL 4B FP8 (5,24 GB): https://huggingface.co/ChrisColeTech/krea2-turbo-uncensored-v1.1-FP8/resolve/main/split/text_encoders/qwen3vl_4b_fp8_scaled.safetensors
- VAE Qwen Image (254 MB): https://huggingface.co/ChrisColeTech/krea2-turbo-uncensored-v1.1-FP8/resolve/main/split/vae/qwen_image_vae.safetensors
- Cargador GGUF para ComfyUI: comfyui-gguf-loader, disponible en el canal remoto del ComfyUI Manager; no se proporciona URL directa en la model card
- Ejemplos generados: directorio `samples/` del repositorio (ComfyUI_00941.png, ComfyUI_00977.png, ComfyUI_00983.png, ComfyUI_01182.png, ComfyUI_01201.png, ComfyUI_01451.png, ComfyUI_01480.png)
- Paper, blog tecnico o demo oficial: no disponibles en la informacion proporcionada

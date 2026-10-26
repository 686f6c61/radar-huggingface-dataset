# Langzaigg/moss_anime_turbo_merged

## Resumen

MOSS Anime Turbo Merged es un modelo de difusión texto-a-imagen derivado de OpenMOSS-Team/MOSS-Image-SFT, publicado por el usuario independiente Langzaigg. No es un lanzamiento oficial de OpenMOSS: se trata de un merge de pesos que fusiona el backbone DiT original (con atención fused-QKV) con tres componentes de la comunidad: un DoRA orientado a anime (`moss-cute-anime`, fuerza 0,3), un LoRA turbo de 4 pasos (`MOS-SFT 4-step turbo`, fuerza 1,0) y el LoRA `moss_pussy_lora_v2.0` (fuerza 0,7). El resultado es un checkpoint especializado en ilustración anime que genera en 4 pasos con CFG 1.0.

El repositorio distribuye únicamente el DiT en dos variantes intercambiables: BF16 (9,47 GiB) e INT8 ConvRot (5,04 GiB, con 168 proyecciones de capa en INT8 por filas y escalas FP32). No incluye el text encoder (Qwen3.5-9B INT8) ni el VAE (FLUX.2), que deben descargarse por separado, por lo que no es un checkpoint "todo en uno" y requiere el flujo de tres cargadores de ComfyUI.

Su relevancia práctica es acotada pero concreta: permite iterar ilustración anime en GPUs de 16 GB con latencias medidas de ~27-30 s por imagen a ~1 MP en una Arc A770M, y expone integración HTTP/MCP mediante el repositorio ComfyUI-AnimaFlow del mismo autor. Con 0 descargas y 1 like en el momento de la ficha, la validación externa es prácticamente nula.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con backbone de atención fused-QKV, derivado de MOSS-Image |
| Parámetros totales | No disponible como cifra oficial; el fichero BF16 del DiT ocupa 9,47 GiB (10.164.655.840 bytes), lo que implica del orden de 5.000 millones de parámetros en bf16 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el text encoder (Qwen3.5-9B INT8) se carga por separado y su ventana no se documenta en la model card |
| Tipos de cuantización | BF16 e INT8 ConvRot (168 proyecciones de capa en INT8 row-wise con escalas FP32; normas, embedders, modulación y cabeceras de salida permanecen en BF16) |
| Idiomas soportados | Inglés y chino (según las etiquetas del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`diffusion-single-file`, no all-in-one) |
| Pipeline | text-to-image |
| Resolución recomendada | ~1 MP, con ancho y alto divisibles por 16 |
| Componentes externos | Text encoder Qwen3.5-9B INT8 (`mossImage_sft_txt_int8.safetensors`) y VAE FLUX.2 (`flux2-vae.safetensors`) |
| Pasos de muestreo | 4 pasos, `res_multistep` + `simple`, CFG 1.0, prompt negativo vacío |
| Tamaño del repositorio | 15,6 GB |

## Arquitectura y entrenamiento

El modelo es un merge, no un entrenamiento desde cero. Sobre los pesos oficiales de MOSS-Image-SFT se fusionan tres adaptadores sobre el backbone fused-QKV: un DoRA de estética anime al 0,3, un LoRA turbo de 4 pasos al 1,0 y `moss_pussy_lora_v2.0` al 0,7. El autor indica que no hace falta ningún LoRA adicional ni parche de remapeo QKV para ninguna de las dos variantes del DiT. La rama INT8 ConvRot cuantiza 168 proyecciones de las capas del transformer a INT8 por filas con escalas FP32, dejando en BF16 las normas, los embedders, la modulación y las cabeceras; según el autor pasó una generación de humo de 4 pasos en ComfyUI, pero no se incluyó en la comparativa de calidad ni de tiempos.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base usó RLHF/DPO (poco habitual en difusión). La innovación técnica explotable aquí es doble: la compresión del muestreo a 4 pasos con CFG 1.0 (heredada del LoRA turbo) y el soporte del text encoder multimodal para aceptar JSON de layout y referencias visuales. El autor advierte explícitamente que la recomendación de 4 pasos proviene de pruebas controladas de este derivado y no debe aplicarse sin más al SFT oficial, cuya recomendación upstream es de 8 pasos con `euler` + `simple`.

## Capacidades

- Generación de imágenes texto-a-imagen con estética anime, en 4 pasos y sin prompt negativo.
- Composición posicional mediante Layout JSON: permite colocar personas, objetos, paneles y cadenas de texto literal en posiciones concretas.
- Acepta subtítulos en lenguaje natural (inglés y chino) como entrada principal.
- Guía semántica mediante imágenes de referencia a través del text encoder multimodal (sin garantía de preservación de identidad, ropa o logotipos).
- Renderizado de texto literal corto en la imagen (las cadenas largas o de varios párrafos suelen salir malformadas).
- Integración nativa con ComfyUI mediante flujo `UNETLoader` + `CLIPLoader` (tipo `moss_image`) + `VAELoader`.
- Plantillas de workflow listas para usar e integración HTTP/MCP vía ComfyUI-AnimaFlow.
- Dos variantes de precisión intercambiables (BF16 e INT8 ConvRot) para ajustar memoria y tamaño de descarga.

## Casos de uso

- **Ilustración anime por lotes en estación de trabajo de 16 GB**: con el DiT INT8 (5,04 GiB) y el encoder INT8 es posible encadenar generaciones a ~1 MP en 4 pasos; el autor midió una mediana de 27,4 s por imagen en una Arc A770M, lo que hace viable producir decenas de variantes por hora en local.
- **Prototipado rápido de keyframes y storyboards**: el muestreo a 4 pasos con CFG 1.0 permite iterar decenas de semillas para explorar encuadres antes de pasar a un modelo de mayor calidad o a un refinado posterior.
- **Composición controlada de escenas con Layout JSON**: para viñetas o paneles donde se necesita situar dos personajes y un objeto en posiciones concretas, el modelo acepta un JSON de layout en lugar de depender solo del prompt; útil en flujos de webcómic.
- **Generación de arte de fondo para videojuegos indie**: fondos de exteriores e interiores (los ejemplos del repo incluyen picnic, cocina, otoño y cuaderno de bocetos), con la advertencia de que la anatomía compleja y las interacciones entre objetos pueden fallar.
- **Automatización de pipelines vía HTTP/MCP**: ComfyUI-AnimaFlow expone plantillas y una interfaz HTTP/MCP, lo que permite invocar el modelo desde un agente o un backend de producción sin orquestar ComfyUI manualmente.
- **Exploración estilística con referencias visuales**: pasar una imagen de referencia por el text encoder multimodal para orientar paleta y materiales; sirve para moodboards, no para reproducir un personaje concreto de forma fiable.
- **Banco de pruebas de cuantización**: comparar BF16 frente a INT8 ConvRot con prompts y semillas fijas para medir la degradación real de la cuantización en un DiT de ~5.000 M de parámetros antes de adoptarla en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (tipo MMLU, HumanEval o GSM8K no aplican a un modelo de difusión) ni métricas objetivas como FID o CLIP score en la información disponible. El autor sí publica una evaluación de tiempos y una comparación manual de calidad frente a su derivado AIO INT8 anterior, con 19 escenas, mismas semillas y resoluciones, en una Arc A770M de 16 GB:

| Versión | Mediana (s) | Media (s) | Media recortada (s) |
|---|---:|---:|---:|
| Derivado AIO INT8 anterior | 28,2 | 31,0 | 29,2 |
| Este modelo BF16 / flujo de tres partes | 27,4 | 29,7 | 28,7 |

Notas de la evaluación, según el autor: 19 de 19 escenas acabaron generando correctamente en 20 intentos, con un `UR_RESULT_ERROR_DEVICE_LOST` en la escena de otoño que se resolvió reiniciando ComfyUI; la inspección manual lado a lado consideró mejor esta versión en 14 escenas, peor en 1 y empatada en 4, con mejoras concentradas en ropa, fondos, materiales y algunas interacciones entre objetos. La diferencia de velocidad es pequeña y debe considerarse comparable, no una mejora garantizada. La comparación cambia a la vez pesos y flujo de carga, por lo que no aísla el efecto del BF16. La variante INT8 ConvRot solo se verificó con una generación de humo y quedó fuera de esta comparativa.

## Requisitos de hardware

- **VRAM estimada**: el DiT BF16 pesa 9,47 GiB y el INT8 ConvRot 5,04 GiB; a eso hay que sumar el text encoder Qwen3.5-9B INT8 y el VAE FLUX.2. El autor advierte de limitaciones de memoria en GPUs de 16 GB con el DiT BF16 y el encoder grande (el texto de la model card está truncado en ese punto), por lo que en 16 GB la ruta sensata es la variante INT8 ConvRot.
- **GPU medidas**: Arc A770M de 16 GB, con medianas de 27,4 s (BF16) por imagen a ~1 MP y 4 pasos.
- **GPU recomendadas**: no disponibles en la información proporcionada; no hay datos publicados para A100, H100 ni RTX 4090.
- **Cabe en GPU de consumo**: sí, al menos en una GPU de 16 GB con la variante INT8; con BF16 el margen depende del encoder y del VAE, y el autor señala problemas de memoria en 16 GB.
- **Opciones de despliegue**: ComfyUI con soporte MOSS-Image actual (obligatorio el flujo `UNETLoader` + `CLIPLoader` tipo `moss_image` + `VAELoader`; no usar `CheckpointLoaderSimple`); plantillas y API HTTP/MCP vía ComfyUI-AnimaFlow. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- **Latencia y throughput**: ~27-30 s por imagen a ~1 MP y 4 pasos en Arc A770M 16 GB, según la evaluación del autor; no hay datos de throughput agregado ni de otras GPUs.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS Anime Turbo Merged (este) | DiT + merge de 3 adaptadores | ~5.000 M estimados por tamaño de fichero | No disponible / ~1 MP, múltiplos de 16 | Apache 2.0 | HuggingFace, 0 descargas, 1 like |
| OpenMOSS-Team/MOSS-Image-SFT | DiT base (SFT) | No disponible | No disponible | No disponible en la información aportada | HuggingFace (modelo base) |
| Derivado AIO INT8 previo del mismo autor | DiT INT8 todo en uno | No disponible | No disponible / mismas 19 escenas de prueba | No disponible | No referenciado con URL en la model card |

No se dispone de datos de otros modelos de difusión comparables (por ejemplo, variantes anime de SDXL o FLUX) en la información proporcionada, por lo que la comparación cruzada de calidad y licencia queda como no disponible.

## Limitaciones y advertencias

- **Anatomía y composición**: el propio autor reconoce fallos en anatomía compleja, interacciones entre objetos, adherencia exacta al layout y supresión de conceptos negativos.
- **Texto en imagen**: las cadenas cortas funcionan relativamente bien; el texto pequeño o de varios párrafos suele salir malformado.
- **Referencias visuales**: no garantizan reproducir identidad, ropa ni logotipos, lo que invalida su uso para consistencia de personaje en producción sin revisión humana.
- **Artefactos puntuales**: en la evaluación, una escena sin artista regresó con una cola duplicada; el autor documenta además un `UR_RESULT_ERROR_DEVICE_LOST` en una de las 20 ejecuciones.
- **Reproducibilidad del merge**: los LoRA y DoRA fusionados provienen de la comunidad y sus licencias individuales no se detallan en la model card; aunque el conjunto se declara Apache 2.0, conviene verificar los términos de cada componente antes de un uso comercial.
- **Contenido**: el merge incorpora `moss_pussy_lora_v2.0` al 0,7; el autor afirma que las muestras del repositorio son SFW, pero no hay documentación sobre filtrado de seguridad ni sobre el comportamiento del modelo con prompts explícitos.
- **Validación externa mínima**: 0 descargas y 1 like en el momento de la ficha, con una única evaluación realizada por el propio autor en un solo equipo.
- **Idioma**: solo inglés y chino están etiquetados; no hay evidencia de calidad con prompts en castellano.
- **Cuantización INT8**: verificada únicamente con una generación de humo; el autor recomienda evaluarla por separado antes de usarla en producción.
- **No es un checkpoint autónomo**: sin el text encoder Qwen3.5-9B INT8 y el VAE FLUX.2 no funciona, y no es compatible con `CheckpointLoaderSimple`.
- **Alucinación**: no aplica en el sentido de texto factual, pero sí en cuanto a contenido inventado en la imagen (objetos, texto y anatomía no solicitados).

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Langzaigg/moss_anime_turbo_merged
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Repositorio de workflows e integración HTTP/MCP: https://github.com/Langzaigg/ComfyUI-AnimaFlow
- Paper, blog o demo oficiales: no disponibles en la información proporcionada.
- Nota sobre la búsqueda web: los resultados devueltos no guardan ninguna relación con el modelo (contenido sobre un suplemento comercial), por lo que se descartan como fuentes.

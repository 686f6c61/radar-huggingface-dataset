# EmilioSchwaiger/pixie-32

## Resumen

Pixie P32 (publicado como `pixie-32`) es un modelo generativo de imagen de tipo autoregresivo desarrollado por EmilioSchwaiger que produce sprites de pixel art nativos de 32×32 píxeles indexados por paleta a partir de un prompt de texto corto en inglés. Con 66.424.320 parámetros y una arquitectura transformer de ancho 512, 16 capas y 8 cabezas, el modelo no genera píxeles RGB directamente sino secuencias de índices de una paleta de 4097 colores (el índice 0 es transparente), lo que lo alinea con el formato de trabajo real de los artistas de pixel art y de los motores de juego.

El modelo se presenta como un experimento de investigación de escala reducida, no como un generador de assets de producción. Su interés técnico radica en el enfoque: tokenización por parches de 2×2 (256 parches de cuatro slots de paleta cada uno), RoPE axial 2D parcial y un slot de estilo adicional, junto con un encoder de texto CLIP ViT-L/14 externo que no se distribuye con los pesos. Es el hermano mayor del modelo `pixie-16`, del que hereda un arranque en caliente.

La relevancia actual es doble: por un lado, demuestra que un modelo de solo 66M de parámetros puede abordar la generación de sprites con un formato de salida nativo para pipelines de game development; por otro, su model card documenta con inusual honestidad las limitaciones (sobreajuste tras ~1,25M de imágenes, píxeles magenta residuales, calidad irregular), lo que lo convierte en un caso de estudio útil sobre expectativas realistas en modelos pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo sobre índices de paleta (P32): ancho 512, 16 capas, 8 cabezas, tokens de parche 2×2 (256 parches de cuatro slots de paleta), RoPE axial 2D parcial, tres slots de paleta y un slot de estilo |
| Parámetros totales | 66.424.320 (224 tensores float32, contados del `model.safetensors` liberado) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como valor explícito; la secuencia de salida es fija: 256 parches × 4 slots de paleta para un sprite de 32×32 |
| Tipos de cuantización | No disponible (pesos liberados en float32; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | No disponible como listado formal; los prompts de uso previsto son en inglés |
| Licencia | Apache-2.0 (pesos y código); ver `LICENSE` y `NOTICE` |
| Formato de pesos | `safetensors` (`model.safetensors`) más `config.json` y `palette.npy` (paleta 4097×3 uint8) |

## Arquitectura y entrenamiento

Pixie P32 es un transformer autoregresivo que modela la imagen como una secuencia de índices de paleta en lugar de valores RGB continuos. La imagen de 32×32 se divide en 256 parches de 2×2, y cada parche se representa con cuatro slots de paleta más un slot de estilo; el modelo incorpora RoPE axial 2D parcial para codificar la posición espacial de los parches. La paleta de 4097 colores (índice 0 transparente) actúa como vocabulario de salida, lo que garantiza que cada sprite generado use exclusivamente colores de la paleta y mantenga el canal alfa de forma nativa. El texto se codifica con un encoder externo: las primeras 11 capas del modelo de texto de `openai/clip-vit-large-patch14`, usando las características penúltimas en 18 posiciones. Este encoder no se distribuye con los pesos y debe descargarse por separado en el momento del muestreo.

El entrenamiento parte de un arranque en caliente desde el modelo Pixie v3 de 16×16, entrenado con aproximadamente 1,4M de filas CC0-1.0 del dataset `Angais/pixel-art-atlas-1.4m` (sprites sintéticos de 16×16); los tensores compatibles en forma se copiaron y las tablas de posición se expandieron. El conjunto de entrenamiento específico de P32 son unos 130k sprites nativos de 32×32 generados para el proyecto con Krea 2 Turbo más un LoRA de pixel art, extraídos de hojas de 3×3 con `data-pipeline/extract_v2.py`; este conjunto no se ha publicado. El checkpoint liberado es el mejor de la primera ejecución completa de P32 (paso 17.746, ~1,25M de imágenes vistas), seleccionado por tener el NLL de validación IID más bajo de la ejecución (0,5237). Las listas de frases Blind-50 y Eval-50 se excluyeron del entrenamiento mediante una comprobación de holdout congelado, aunque las listas no se publican.

## Capacidades

- Generación de sprites de pixel art de 32×32 píxeles con canal alfa, indexados por una paleta fija de 4097 colores.
- Generación texto-a-imagen condicionada por un prompt corto en inglés (objetos, armas, personajes, criaturas, props).
- Salida en formato nativo para pipelines de game development: índices de paleta en lugar de RGB, lo que facilita la integración con motores y editores de sprites.
- Muestreo con classifier-free guidance (CFG), con valor de referencia 2.0 en los ejemplos de la model card.
- Control de semilla para reproducibilidad (los ejemplos usan semilla 0).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües documentadas más allá del uso previsto en inglés.
- No dispone de modo thinking, visión, audio ni otras modalidades.

## Casos de uso

- Prototipado rápido de assets para juegos indie: un desarrollador puede generar variantes de un ítem (por ejemplo, "red potion") con varias semillas y CFG 2.0 para explorar direcciones visuales antes de encargar el arte final, gracias a la salida de 32×32 indexada por paleta que encaja directamente en el pipeline de sprites.
- Generación de conjuntos de iconos de inventario: el modelo produce sprites de objetos pequeños (pociones, cascos, armas) que pueden usarse como placeholders funcionales en un HUD o en una rejilla de inventario mientras se produce el arte definitivo.
- Creación de criaturas y enemigos básicos: con prompts como "green slime", el modelo genera criaturas de 32×32 adecuadas para prototipos de combate o para pruebas de jugabilidad antes de la fase de arte.
- Investigación sobre modelos generativos pequeños: sus 66M de parámetros y su NLL de validación documentado (0,5237) lo hacen útil como baseline reproducible para estudiar tokenización por paleta, RoPE axial 2D y arranque en caliente entre resoluciones.
- Docencia y experimentación con tokenización discreta de imágenes: el formato de índices de paleta con slot de transparencia sirve para ilustrar cómo se puede modelar una imagen como secuencia discreta sin cuantización VQ-VAE.
- Generación de datos sintéticos para aumentar datasets de pixel art: los sprites generados pueden filtrarse y añadirse a conjuntos de entrenamiento de clasificadores o de otros modelos generativos de sprites, siempre que se respete la licencia Apache-2.0 de los pesos y las condiciones del `NOTICE`.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| NLL de validación IID (checkpoint liberado, paso 17.746) | 0,5237 (el más bajo de la ejecución) |
| Blind-50 / Eval-50 | No reportado como número en esta release |

No se han publicado resultados de benchmarks estándar (FID, CLIP score, MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 66,4M de parámetros en float32, los pesos ocupan aproximadamente 266 MB; el encoder CLIP ViT-L/14 externo añade varios cientos de MB adicionales.
- GPU recomendadas: no disponibles en la documentación. Por tamaño, el modelo debería caber en cualquier GPU consumer con al menos 2-4 GB de VRAM libre, incluidas RTX 3060, RTX 4060, RTX 4090 y superiores, aunque el dato no está confirmado por el autor.
- Cabe en GPU consumer: sí, por el reducido número de parámetros, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: el autor proporciona el sampler propio del repositorio `github.com/QuarkOS/pixie` (`python -m train.sample_pixie`), que requiere PyTorch, NumPy, Pillow, tokenizers, safetensors y huggingface_hub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo de imagen.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución de salida | Contexto / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pixie P32 (`pixie-32`) | 66.424.320 | 32×32 RGBA indexado por paleta | Secuencia de 256 parches × 4 slots | Apache-2.0 | Hugging Face + repo GitHub |
| Pixie 16 (`pixie-16`) | No disponible | 16×16 | No disponible | No disponible en la información | Hugging Face |
| Krea 2 Turbo + LoRA pixel art | No disponible | No disponible (usado para generar el dataset de 32×32) | Modelo de difusión | Krea 2 Community License | No disponible en la información |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Píxeles magenta residuales: las hojas de entrenamiento usaban un fondo clave magenta y algunas muestras conservan píxeles de ese fondo cerca de los bordes.
- Sobreajuste: la ejecución sobreajusta tras aproximadamente 1,25M de imágenes; los checkpoints posteriores empeoraron el NLL de validación IID, por lo que el liberado no es el último de la ejecución.
- Dependencia externa: requiere el encoder de texto CLIP ViT-L/14, que se enlaza pero no se distribuye con los pesos, lo que añade un paso de descarga y una dependencia adicional en producción.
- Calidad irregular: la model card advierte que la calidad varía según el sujeto y que muchas muestras son toscas; debe tratarse como un modelo de investigación pequeño, no como un generador de assets terminado.
- Alcance limitado: fuera de alcance las imágenes fotorrealistas, el renderizado de texto, cualquier resolución superior a 32×32 y los sujetos alejados del contenido de sprites de videojuego.
- Idiomas: el uso previsto es con prompts en inglés; no se documenta soporte multilingüe.
- Licencia: los pesos son Apache-2.0, pero el `NOTICE` incluye la atribución de Krea 2 y créditos de terceros; los sprites generados para el entrenamiento son "Krea 2 Outputs" según la sección 5.3 de la Krea 2 Community License, aunque el autor declara que no se reclaman restricciones heredadas sobre los pesos liberados.
- Datos de entrenamiento no publicados: el conjunto de 130k sprites de 32×32 no se ha liberado, lo que dificulta la reproducibilidad completa del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EmilioSchwaiger/pixie-32
- Modelo hermano Pixie 16: https://huggingface.co/EmilioSchwaiger/pixie-16
- Código, pipeline de entrenamiento y sampler: https://github.com/QuarkOS/pixie
- Dataset de pixel art: https://huggingface.co/datasets/Angais/pixel-art-atlas-1.4m
- Encoder de texto CLIP ViT-L/14: https://huggingface.co/openai/clip-vit-large-patch14
- Licencia Krea 2 Community License: https://github.com/krea-ai/krea-2/blob/main/docs/KREA-2-COMMUNITY-LICENSE

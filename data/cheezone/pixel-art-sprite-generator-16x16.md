# CheezOne/pixel-art-sprite-generator-16x16

## Resumen

Pixel Sprite Generator 16×16 es un modelo de texto a imagen de dominio muy específico, desarrollado por el usuario CheezOne, que genera sprites nativos de 16×16 píxeles para videojuegos a partir de descripciones textuales. A diferencia de los modelos de difusión convencionales, que producen imágenes de alta resolución y luego las reducen, este modelo opera directamente sobre una rejilla de 256 tokens de píxel con una paleta fija de 4097 colores (el índice 0 reserva la transparencia), de modo que cada píxel de la salida es una decisión nativa del modelo.

La arquitectura es un transformer bidireccional pequeño, de unos 20,4 millones de parámetros (d=384, 8 capas, 6 cabezas), entrenado con un objetivo de masked-token cross-entropy y decodificación paralela estilo MaskGIT. La condición textual se obtiene de un codificador de frases multilingüe congelado (`sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`), lo que permite prompts en inglés, chino, japonés y coreano. El modelo se distribuye en ONNX (int8 de 26 MB y fp32 de 82 MB) y está pensado para ejecutarse íntegramente en el navegador mediante transformers.js, con WebGPU o WASM.

Su relevancia actual reside en la combinación de tamaño mínimo, ejecución local sin GPU dedicada y salida directamente utilizable en pipelines de desarrollo de videojuegos. El repositorio ocupa 0,2 GB e incluye los pesos en safetensors, la implementación de referencia del bucle de decodificación en JavaScript (`pix.js`) y el script de entrenamiento e inferencia en Python. La licencia es la Krea 2 Community License, condicionada por el origen sintético de los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional sobre tokens de píxel (MaskGIT), d=384, 8 capas, 6 cabezas |
| Parametros totales | 20.398.337 (generador); el codificador de texto es externo y congelado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens de píxel (rejilla 16×16) más 4 tokens de prefijo de condicionamiento |
| Tipos de cuantizacion | int8 (ONNX, 26 MB) y fp32 (ONNX, 82 MB); el codificador en navegador usa q8 |
| Idiomas soportados | en, zh, ja, ko, multilingual |
| Licencia | krea-2-community-license (uso libre para investigación y personal; comercial gratis por debajo de 1 M USD de ingresos anuales) |
| Formato de pesos | safetensors (PyTorch), ONNX (int8 y fp32), JSON auxiliares (`palette.json`, `null.json`, `config.json`) |

## Arquitectura y entrenamiento

El generador es un transformer bidireccional que procesa 256 tokens de píxel con un vocabulario de 4097 colores de paleta, donde el índice 0 representa transparencia. La condición textual se proyecta en 4 tokens de prefijo que se concatenan a la secuencia; el classifier-free guidance se implementa mediante un vector nulo aprendido (`null.json`). La decodificación sigue el esquema MaskGIT: se parte de todos los píxeles enmascarados, se predicen todos en paralelo, se conservan los más confiables y se vuelven a enmascarar el resto siguiendo un calendario coseno. Con la configuración por defecto (12 pasos, cfg 3) se obtiene un lote completo de sprites en 12 pasadas forward.

El entrenamiento utilizó el dataset `Angais/pixel-art-atlas-1.4m`, con 1.409.404 sprites nativos de 16×16 sobre la misma paleta de 4097 colores y 6194 sujetos, publicado bajo CC0. El objetivo fue cross-entropy sobre tokens enmascarados con ratio de enmascaramiento coseno, y un 10 % de las muestras se entrenaron sin condicionamiento para habilitar CFG. El cómputo total fue de 24.000 pasos con batch 512, learning rate 6e-4 con decaimiento coseno y precisión bf16, sobre una única NVIDIA L40 durante 2,5 horas, con una pérdida de validación final de 2,01. La paridad ONNX-PyTorch con las mismas entradas es del 100,0 % de coincidencia en argmax para fp32 y del 92,3 % para int8.

## Capacidades

- Generación de texto a imagen restringida a sprites de 16×16 píxeles con transparencia y paleta fija indexada.
- Salida directa como PNG de 16×16 o reescalada a 256×256 sin interpolación difusa.
- Comprensión de prompts en inglés, chino, japonés y coreano mediante codificador de frases multilingüe.
- Generación por lotes con semilla controlable (`n`, `seed`) para producir variantes de un mismo objeto.
- Control de adherencia al prompt mediante classifier-free guidance (cfg configurable, por defecto 3).
- Ejecución en navegador con WebGPU y fallback a WASM, sin servidor ni GPU dedicada.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo thinking; es un modelo puramente generativo de imagen.

## Casos de uso

- Prototipado rápido de assets en desarrollo de videojuegos: un diseñador escribe "red potion" o "宝箱" y obtiene en segundos un sprite de 16×16 listo para importar en el motor, sin salir del navegador ni depender de un artista para cada iteración.
- Generación de conjuntos de iconos de inventario: con prompts por lotes y semilla fija se producen variantes coherentes de pociones, llaves, monedas o armas sobre la misma paleta, lo que simplifica la integración visual en la interfaz del juego.
- Herramientas de creación integradas en el navegador: al distribuirse como ONNX de 26 MB y con `pix.js` como referencia, se puede incrustar en un editor web de sprites o en una game jam tool donde el usuario genera assets sin instalar nada.
- Aumento de datasets de pixel art: el modelo permite generar sprites etiquetados por prompt para ampliar corpus de entrenamiento de otros modelos o para pruebas de pipelines de clasificación de assets.
- Localización multilingüe de prompts: estudios pequeños con equipos en China, Japón o Corea pueden escribir las descripciones en su idioma nativo; el chino funciona bien y el japonés es fiable para palabras en kanji, lo que reduce la fricción en equipos no anglófonos.
- Docencia y demostraciones de modelos generativos: por su tamaño y su ejecución local en WebGPU/WASM, sirve para explicar decodificación paralela MaskGIT y condicionamiento por embeddings sin necesidad de infraestructura de GPU.
- Generación de placeholders en pipelines de CI: un script puede invocar el modelo en Python (`scripts/pix_train.py sample`) para producir sprites de prueba en cada build, con coste computacional mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas internas de entrenamiento y de paridad de exportación:

| Metrica | Valor |
|---|---|
| Perdida de validacion final (masked-token CE) | 2,01 |
| Pasos de entrenamiento | 24.000 (batch 512, lr 6e-4 coseno, bf16) |
| Computo de entrenamiento | 2,5 h en una NVIDIA L40 |
| Paridad ONNX fp32 vs PyTorch (argmax) | 100,0 % |
| Paridad ONNX int8 vs PyTorch (argmax) | 92,3 % |
| Latencia en Chromium headless, WASM, int8, 4 sprites | 20 s (sin GPU); WebGPU notablemente más rápido, sin cifra publicada |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para el generador int8 (26 MB) y fp32 (82 MB); el codificador multilingüe q8 añade 118 MB en caché del navegador.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU para la ejecución en navegador; para inferencia en servidor, una GPU consumer modesta es más que suficiente. El entrenamiento se realizó en una NVIDIA L40.
- Cabe en cualquier GPU consumer, e incluso en CPU: la demo funciona en WASM sin GPU (4 sprites en 20 s en Chromium headless).
- Opciones de despliegue: transformers.js en navegador (WebGPU/WASM), ONNX Runtime, y el script Python incluido (`scripts/pix_train.py`) con pesos safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 12 pasadas forward por lote de sprites; en WASM int8, unos 5 s por sprite en el escenario medido; en WebGPU la model card indica que es "mucho más rápido" sin dar cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas frente a otros modelos de la misma categoría en la información proporcionada. A continuación se contrastan características estructurales con alternativas conocidas del ámbito de la generación de imágenes y del pixel art:

| Modelo | Parametros | Resolucion de salida | Contexto / condicionamiento | Licencia | Ejecucion local en navegador |
|---|---|---|---|---|---|
| Pixel Sprite Generator 16×16 | 20,4 M | 16×16 nativo con paleta | 256 tokens de píxel + 4 de prefijo | Krea 2 Community | Si (ONNX + WebGPU/WASM) |
| Stable Diffusion 1.5 | ~860 M (UNet) | 512×512, requiere reduccion | 77 tokens CLIP | CreativeML OpenRAIL-M | No practico en navegador |
| SDXL | ~2,6 B (UNet) | 1024×1024 | 77 tokens CLIP + texto | CreativeML OpenRAIL++-M | No |
| Pixel-art LoRA sobre SD | Variable (adaptador) | 512×512 reducido a pixel art | 77 tokens CLIP | Segun modelo base | No |

La diferencia clave frente a los modelos de difusión es que este generador no produce una imagen de alta resolución para reducirla después: cada píxel se decide sobre la paleta, lo que elimina artefactos de interpolación y garantiza coherencia cromática, a costa de limitarse a 16×16 y a un único objeto o personaje.

## Limitaciones y advertencias

- Resolución fija de 16×16, un único objeto o personaje, vista frontal o 3/4; no genera fotogramas de animación.
- Los prompts raros o compuestos ("a cat riding a dragon") degradan al sujeto común más cercano, lo que produce resultados no solicitados.
- Los prompts no ingleses pasan por un codificador de frases multilingüe que nunca se entrenó con estas descripciones: el chino funciona bien; el japonés es fiable con kanji (剣, 宝箱, 魔法の杖, ドラゴン) pero falla a menudo con katakana (ポーション, スライム); algunas palabras coreanas fallan (해골 no produce una calavera). Se recomienda probar el término en inglés si el prompt falla.
- No hay filtrado de seguridad; el dataset de entrenamiento solo contiene sujetos de assets de videojuegos, pero el modelo no incorpora mecanismos de rechazo.
- La licencia Krea 2 Community License limita el uso comercial gratuito a individuos y organizaciones con ingresos anuales inferiores a 1 M USD; por encima es necesario contactar con Krea. Los sprites generados quedan sujetos a los mismos términos.
- El modelo se considera derivado de Krea 2 porque los sprites de entrenamiento fueron generados con Krea 2 (aunque el autor del dataset los dedicó a CC0); el autor planea una v1 entrenada solo con datos de modelos Apache-2.0.
- Riesgo de alucinación visual: al ser un modelo generativo de imagen, puede producir sprites plausibles pero incorrectos respecto al prompt, sin señal de confianza asociada.
- La paridad int8 con PyTorch es del 92,3 % en argmax, por lo que la versión cuantizada puede diferir de la fp32 en algunos píxeles.
- Sin métricas de benchmarks publicadas, la evaluación de calidad depende de inspección visual subjetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CheezOne/pixel-art-sprite-generator-16x16
- Demo en Spaces: https://huggingface.co/spaces/CheezOne/pixel-art-sprite-generator-demo
- Dataset de entrenamiento: https://huggingface.co/datasets/Angais/pixel-art-atlas-1.4m
- Codificador de texto: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Codificador para navegador (q8): https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2
- Licencia: https://huggingface.co/CheezOne/pixel-art-sprite-generator-16x16/blob/main/LICENSE

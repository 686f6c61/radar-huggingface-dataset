# EmilioSchwaiger/pixie-16

## Resumen

Pixie v3 (identificador `pixie-16`) es un modelo autorregresivo de 66.309.632 parametros desarrollado por EmilioSchwaiger que genera sprites de pixel art de 16×16 píxeles indexados por paleta a partir de un prompt de texto corto en ingles. No es un modelo de difusion ni un transformer de imagen convencional: opera sobre indices de una paleta fija de 4097 colores (donde el indice 0 es transparente) y emite directamente una rejilla de 16×16 RGBA, lo que lo aleja de los pipelines text-to-image habituales y lo acerca a la generacion de assets para videojuegos.

La arquitectura es un transformer autorregresivo de ancho 512, 16 capas y 8 cabezas de atencion, con tokenizacion en parches de 2×2 (64 parches de cuatro slots de paleta cada uno) y una cabeza causal con reconocimiento de slot. El modelo no incluye codificador de texto: depende de las primeras 11 capas del text encoder de `openai/clip-vit-large-patch14` (caracteristicas penultimas, 18 posiciones), que se distribuye por separado.

Su relevancia practica esta en el nicho: es un modelo pequeno (0,3 GB de repositorio), con licencia Apache-2.0 y entrenado sobre datos CC0-1.0, pensado para generar iconos y sprites de juego de forma masiva y barata. El checkpoint publicado corresponde a la version `v3-full-s7-condboost40M` (fichero `full_064M`), con 64 millones de vistas de imagen de entrenamiento acumuladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo sobre indices de paleta (v3 / P50); ancho 512, 16 capas, 8 cabezas, parches 2×2 (64 parches de cuatro slots), cabeza causal con reconocimiento de slot |
| Parametros totales | 66.309.632 (224 tensores float32, contados del `model.safetensors` publicado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la salida es fija: 64 parches = una imagen de 16×16) |
| Tipos de cuantizacion | No disponible (pesos publicados en float32; no se documentan variantes GGUF, int8 ni similares) |
| Idiomas soportados | No disponible formalmente; los prompts de uso previsto son en ingles |
| Licencia | Apache-2.0 (pesos y codigo); datos de entrenamiento CC0-1.0 |
| Formato de pesos | `model.safetensors` (float32), mas `config.json` y `palette.npy` (paleta 4097×3 uint8) |

## Arquitectura y entrenamiento

Pixie v3 es un transformer autorregresivo que modela directamente indices de una paleta de 4097 colores en lugar de píxeles RGB continuos. La imagen de 16×16 se agrupa en 64 parches de 2×2, y cada parche se representa como cuatro slots de paleta; el modelo incorpora ademas tres slots de paleta y un slot de estilo como condicionamiento, con una cabeza causal especifica por slot. El checkpoint publicado (`v3-full-s7-condboost40M`, fichero `full_064M`) acumula 64 millones de vistas de imagen: una primera fase de 36 millones de vistas con learning rate constante, seguida de un fine-tune de decaimiento de 24 millones de vistas (paso 187.500 de ese fine-tune) con condicionamiento de paleta y estilo mas intenso.

El entrenamiento usa aproximadamente 1,36 millones de filas construidas a partir del dataset `Angais/pixel-art-atlas-1.4m` (CC0-1.0; sprites sinteticos de 16×16 generados con Krea 2 Turbo y un LoRA de pixel art), con copias de captions aumentadas con errores tipograficos. Se excluyeron de entrenamiento las listas de frases Blind-50 y Eval-50 (1.635 filas de frase/sujeto de Blind-50 y 118 captions exactos de Eval-50), aunque esas listas no se publican. No se documenta RLHF ni DPO; el ajuste fino posterior se basa en condicionamiento, no en preferencias humanas. El ranking de candidatos que usa la aplicacion de chat se hace con un reward model entrenado con votos de preferencia que no forma parte de la release.

La innovacion principal es la representacion por indices de paleta con slots, que reduce el espacio de salida y hace el modelo extremadamente compacto (66M de parametros) para una tarea de generacion de imagen. El codificador de texto es externo y no se distribuye: se usan las primeras 11 capas de CLIP ViT-L/14 (caracteristicas penultimas, 18 posiciones).

## Capacidades

- Generacion text-to-image restringida a sprites de pixel art de 16×16 con canal alfa (indice 0 transparente).
- Generacion de iconos y sprites de videojuego a partir de prompts cortos en ingles ("red apple", "wooden chair", "blue teapot").
- Condicionamiento por paleta y por estilo, gracias a los slots dedicados de paleta y estilo.
- Muestreo multiple por prompt: el sampler permite generar N candidatos por prompt (`--n 4` en el ejemplo de la model card), pensado para seleccion posterior.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo de pensamiento (thinking).
- No soporta vision, audio ni modalidades distintas de texto a imagen.
- Capacidades multilingues: no documentadas; el uso previsto es con prompts en ingles.

## Casos de uso

- Generacion masiva de iconos de inventario para videojuegos: con 66M de parametros y salida fija de 16×16, se pueden producir lotes de sprites (armas, pociones, comida, ropa) por prompt y seleccionar los mejores candidatos, integrandolo en un pipeline de assets.
- Prototipado rapido de arte para game jams: un equipo pequeno puede generar cientos de sprites placeholder en minutos sin depender de un artista, y sustituirlos despues por arte final.
- Creacion de tilesets y elementos de interfaz: sprites de 16×16 con transparencia (indice 0) encajan directamente en motores 2D tipo Godot, Unity o LÖVE sin postprocesado de canal alfa.
- Aumento de datasets de pixel art: el modelo puede generar variaciones condicionadas por paleta y estilo para ampliar corpus de entrenamiento de otros modelos o para pruebas de robustez.
- Generacion condicionada por paleta de un proyecto concreto: usando el slot de paleta se puede forzar la gama cromatica de un juego existente para mantener coherencia visual entre assets.
- Herramientas de escritorio o web de bajo coste: al ser un modelo de 0,3 GB y 66M de parametros, puede ejecutarse en CPU o en GPUs consumer modestas dentro de una aplicacion local de generacion de sprites.
- Filtrado y curacion de candidatos: combinado con un ranker externo (como el reward model no publicado de la app de chat), sirve como generador de propuestas en un flujo humano-en-el-bucle.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| IID validation NLL | 1,0231 |
| IID validation NLL (con condicionamiento de paleta/estilo) | 0,9698 |
| Held-out-subject probe NLL | 1,0896 |
| Blind-50 / Eval-50 | No reportado como numero para esta release |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, FID, CLIP score) en la informacion disponible. El autor advierte que el NLL de validacion IID no es comparable con el del modelo hermano P32 por diferencias de resolucion y datos.

## Requisitos de hardware

- Pesos en float32 de 66,3M de parametros: aproximadamente 265 MB de pesos, mas la paleta (4097×3 uint8, unos 12 KB) y el codificador de texto CLIP ViT-L/14 externo.
- El codificador CLIP ViT-L/14 necesario para inferencia es mucho mayor que el propio modelo generativo; su VRAM domina el consumo total (del orden de centenares de MB a ~1 GB en funcion de la precision).
- Cabe en GPU consumer de gama baja y en CPU: no requiere A100, H100 ni RTX 4090; una GTX 1650, RTX 3050 o incluso inferencia en CPU son viables.
- Opciones de despliegue documentadas: el repositorio `github.com/QuarkOS/pixie` con `python -m train.sample_pixie` (PyTorch, safetensors, tokenizers, Pillow, huggingface_hub). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo de lenguaje ni tener pesos GGUF, esas rutas no aplican directamente.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo y la salida fija de 64 parches, se espera una generacion por muestra muy rapida, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Salida | Contexto / condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pixie v3 (`pixie-16`) | 66,3M | Sprite 16×16 RGBA indexado por paleta | Prompt de texto via CLIP ViT-L/14 externo; slots de paleta y estilo | Apache-2.0 | Hugging Face (0 descargas, 1 like) |
| Pixie P32 (`EmilioSchwaiger/pixie-32`) | No disponible | Sprite 32×32 (por el nombre) | No disponible | No disponible en la informacion | Hugging Face |
| Modelos text-to-image de difusion (p. ej. Stable Diffusion) | Cientos de millones a miles de millones | Imagenes RGB de alta resolucion | Prompt de texto, a menudo con CLIP | Varía (a menudo licencias restrictivas) | Amplia |
| Generadores de pixel art basados en LoRA sobre difusion | Depende del modelo base | Pixel art de resolucion variable | Prompt + LoRA | Depende del modelo base | Comunidades de Hugging Face / Civitai |

La comparacion con modelos de difusion no es directa: Pixie no genera imagenes de alta resolucion ni fotorealismo, y su ventaja es el coste computacional y la salida estructurada de 16×16 con transparencia. No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Resolucion fija de 16×16: detalles finos (caras, texto, herramientas delgadas) se pierden con frecuencia.
- Los sprites tienden a ocupar toda la celda de 16×16, lo que puede dificultar el encuadre en juegos que necesitan margen.
- La salida sin ranking varia entre muestras; la app de chat dibuja 64 candidatos por prompt y los ordena con un reward model que no se ha publicado, por lo que el usuario debe seleccionar manualmente entre varias muestras.
- Requiere el codificador de texto CLIP ViT-L/14 externo, que se enlaza pero no se distribuye con el modelo.
- Fuera de alcance: imagenes fotorealistas, renderizado de texto, cualquier resolucion mayor de 16×16 y temas muy alejados del contenido de sprites de videojuego.
- Idiomas: no hay soporte multilingue documentado; el uso previsto es con prompts en ingles.
- Riesgo de alucinacion: como modelo generativo, puede producir sprites que no corresponden al prompt; no se documentan sesgos especificos, pero los datos de entrenamiento son sinteticos (Krea 2 Turbo + LoRA de pixel art) y pueden arrastrar sesgos de ese generador.
- Licencia Apache-2.0 para pesos y codigo, sin restricciones heredadas declaradas; los datos de entrenamiento son CC0-1.0. Se incluye un fichero NOTICE con atribucion a Krea 2 y creditos de terceros que conviene revisar antes de uso comercial.
- El modelo tiene 0 descargas y 1 like en Hugging Face en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-16), por lo que no hay validacion externa de la comunidad.
- No se publican las listas Blind-50 y Eval-50, lo que impide reproducir la evaluacion de generalizacion a sujetos no vistos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EmilioSchwaiger/pixie-16
- Modelo hermano Pixie P32: https://huggingface.co/EmilioSchwaiger/pixie-32
- Codigo, pipeline de entrenamiento y sampler: https://github.com/QuarkOS/pixie
- Dataset de entrenamiento: https://huggingface.co/datasets/Angais/pixel-art-atlas-1.4m
- Codificador de texto externo: https://huggingface.co/openai/clip-vit-large-patch14

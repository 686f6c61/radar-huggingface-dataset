# M1n1A1/MiniAI-TITS2

## Resumen

T.I.T.S.2 (Terrible Imagegen TranSformer 2), publicado por el usuario M1n1A1 bajo el identificador M1n1A1/MiniAI-TITS2, es un modelo de generación de imágenes a partir de texto entrenado desde cero. Se trata de un Diffusion Transformer (DiT) de 93,19 millones de parámetros que opera en el espacio latente del VAE de Stable Diffusion y utiliza flow matching rectificado como objetivo de entrenamiento, con condicionamiento textual mediante un codificador CLIP ViT-L/14 congelado.

El modelo genera imágenes de 256x256 píxeles y fue entrenado íntegramente en una única RTX 4060 Ti de 8 GB durante aproximadamente 32 horas, sobre 490.784 imágenes filtradas de CC12M con leyendas generadas por LLaVA. Es la secuela de T.I.T.S., un modelo de 16 millones de parámetros que solo era capaz de dibujar autobuses; esta versión amplía el repertorio a vehículos, perros, comida, paisajes y bosques nevados, aunque sigue fallando de forma sistemática en figuras humanas, texto dentro de la imagen y contenido de ficción.

Su relevancia es fundamentalmente metodológica: demuestra que es posible entrenar un generador de imágenes funcional, con receta completa y reproducible, en hardware de consumo y sin datos propietarios. No compite en calidad con los modelos de difusión de gran escala, pero sí sirve como referencia abierta para estudiar arquitecturas DiT, flow matching y flujos de entrenamiento completos en el rango de los 100 millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con flow matching rectificado; 12 bloques, dimensión 576, 9 cabezas; self-attention + cross-attention al texto + MLP; condicionamiento adaLN-Zero |
| Parametros totales | 93,19 M en el DiT, más codificador de texto CLIP ViT-L/14 congelado y VAE de Stable Diffusion congelado |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto autoregresivo; la condición textual la aporta CLIP ViT-L/14, con el límite habitual de 77 tokens |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales. Existe una versión experimental de 1 bit (`sign(w) * per_row_absmean`) que produce salidas inservibles, y scripts (`quantize.py`, `sample_quant.py`) para probar 2 y 4 bits |
| Idiomas soportados | Inglés (único idioma declarado en la model card y en los tags) |
| Licencia | MIT |
| Formato de pesos | safetensors (`tits2_ema_fp16.safetensors`, 186 MB; `tits2_1bit.safetensors`, 58 MB) |
| Resolucion de salida | 256x256 píxeles (latente 4x32x32, parches 2x2 = 256 tokens) |
| Espacio latente | SD-VAE-ft-mse |
| Objetivo de entrenamiento | Rectified flow matching con muestreo de timesteps logit-normal (estilo SD3) |
| Muestreo en inferencia | Euler, 30 pasos, classifier-free guidance (10 % de caption dropout durante el entrenamiento) |
| Tamano del repositorio | 0,2 GB |
| Libreria | pytorch (scripts propios, sin integración con diffusers) |

## Arquitectura y entrenamiento

El núcleo es un transformer de difusión de 12 bloques con dimensión 576 y 9 cabezas de atención. Cada bloque combina self-attention, cross-attention hacia las representaciones textuales y una MLP, con condicionamiento adaLN-Zero. El modelo trabaja sobre el espacio latente del VAE SD-VAE-ft-mse (4x32x32), que se divide en parches de 2x2 para dar 256 tokens de entrada, y reconstruye imágenes de 256x256. El codificador de texto es un CLIP ViT-L/14 congelado. El objetivo de entrenamiento es rectified flow matching con muestreo de timesteps logit-normal al estilo SD3, y la inferencia usa integrador Euler con 30 pasos y classifier-free guidance.

El entrenamiento se realizó sobre 490.784 imágenes procedentes de CC12M, filtradas por marca de agua y recaptionadas con LLaVA. La receta completa consta de 24 épocas, 360.550 pasos, batch de 32, optimizador AdamW con learning rate 1e-4, precisión bf16, EMA de 0,9995 y gradient checkpointing, todo ello en una sola RTX 4060 Ti de 8 GB durante unas 32 horas. La pérdida final fue de 0,7372 en entrenamiento y 0,7343 en validación; según el autor, la pérdida de validación se mantuvo igual o por debajo de la de entrenamiento durante las 24 épocas y el modelo seguía mejorando cuando se detuvo el proceso, detenido por decisión del autor y no por convergencia.

El pipeline de datos, incluido en el repositorio, nunca escribe imágenes a tamaño completo en disco: hace streaming de `pixparse/cc12m-wds` para los bytes de imagen, lo cruza con `opendiffusionai/cc12m-cleaned` para obtener filas filtradas por marca de agua con leyendas LLaVA, y almacena latentes de 8 KB (490.000 imágenes ≈ 3,9 GB). El autor documenta también un experimento de cuantización a 1 bit sobre las 101 matrices de pesos, que reduce el archivo de 136,8 MB a 8,7 MB y la salida a dos rectángulos de niebla pastel, presentado explícitamente como resultado esperado y no como error.

## Capacidades

- Generación de imágenes a partir de texto en inglés, a 256x256 píxeles, con condicionamiento textual por CLIP ViT-L/14.
- Paisajes, bosques, carreteras y cielos: resultados que el propio autor califica de "frecuentemente convincentes".
- Vehículos (autobuses, motocicletas, coches): reconocibles y con el número de ruedas correcto la mayor parte de las veces.
- Comida en platos: resultados "fiablemente apetitosos".
- Perros y gatos: caras realistas, cuerpos que el autor describe como negociables.
- Control de composición mediante classifier-free guidance, con un rango útil documentado entre 3 y 7 (punto óptimo en 4-5).
- Generación por lotes: la CLI permite `--num_images` con varios prompts.
- Reentrenamiento y ajuste: el repositorio incluye scripts completos de preparación de datos y entrenamiento.
- Cuantización experimental: scripts para probar 2 y 4 bits sobre los pesos del modelo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni generación de texto: es exclusivamente un modelo de texto a imagen.
- No dispone de modo de razonamiento ni de capacidades multilingües más allá del inglés.

## Casos de uso

- Prototipado rápido de conceptos visuales en local: al ejecutarse en una GPU de consumo y tardar muy por debajo de un segundo por imagen con 30 pasos, permite iterar decenas de variaciones de un prompt sin coste de API ni conexión externa.
- Generación de placeholders y material de maqueta en desarrollo web o de aplicaciones: produce fondos de paisaje, bosques nevados, carreteras de montaña y escenas genéricas suficientes para poblar un mockup antes de disponer de assets definitivos.
- Investigación y docencia sobre Diffusion Transformers: el repositorio incluye el pipeline completo (`prepare_data2.py`, `run_training2.sh`), con hiperparámetros, número de pasos y tiempos reales, lo que permite reproducir el entrenamiento de un DiT desde cero en unas 32 horas de GPU de consumo.
- Estudio de flow matching y muestreo logit-normal: al ser un modelo pequeño entrenado con rectified flow y muestreo de timesteps estilo SD3, sirve como banco de pruebas económico para comparar objetivos de entrenamiento y planificadores de muestreo.
- Aumento de datos para pipelines de visión por computador: puede generar variaciones sintéticas de escenas (carreteras, bosques, vehículos, comida) para preentrenar o regular clasificadores. No es adecuado para conjuntos de evaluación, dado que no hay métricas de fidelidad publicadas.
- Baseline en publicaciones sobre modelos pequeños: sus 93,19 M de parámetros, la licencia MIT y la receta abierta lo convierten en una referencia útil para comparar qué nivel de calidad se alcanza en el rango de los 100 millones de parámetros.
- Caso de estudio sobre cuantización extrema: los scripts `quantize.py` y `sample_quant.py` y el resultado documentado del experimento a 1 bit permiten ilustrar por qué la cuantización posterior al entrenamiento a 1 bit destruye un modelo que no fue entrenado con esa restricción.
- Ajuste fino sobre un dominio concreto: la combinación de CC12M filtrado, leyendas LLaVA y un entrenamiento de 24 épocas en una sola GPU marca una ruta replicable para adaptar el modelo a un nicho visual específico, siempre que sea fotográfico y esté bien representado en internet.
- Prototipado de assets para videojuegos independientes: puede generar castillos, dragones o escenas de fantasía, pero el autor advierte que CC12M contiene fotografías y no ficción, por lo que estos resultados son poco fiables y sirven solo como bocetos iniciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay FID, CLIP score, GenEval ni ninguna otra métrica cuantitativa de calidad de imagen, y las métricas tipo MMLU, HumanEval o GSM8K no aplican porque no es un modelo de lenguaje. La model card ofrece únicamente una valoración cualitativa por categoría de prompt y las métricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Pérdida final de entrenamiento | 0,7372 |
| Pérdida final de validación | 0,7343 |
| Épocas | 24 |
| Pasos de entrenamiento | 360.550 |
| Batch size | 32 |
| Learning rate (AdamW) | 1e-4 |
| EMA | 0,9995 |
| Precisión | bf16 |
| Latencia de inferencia | Muy por debajo de un segundo por imagen en la RTX 4060 Ti de entrenamiento (30 pasos, guidance 4,5) |
| FID / CLIP score | No disponible |

Valoración cualitativa publicada por el autor:

| Categoría de prompt | Resultado declarado |
|---|---|
| Paisajes, bosques, carreteras, cielos | Frecuentemente convincentes |
| Vehículos (autobuses, motocicletas, coches) | Reconocibles; número de ruedas correcto la mayoría de las veces |
| Comida en platos | Fiablemente apetitosa |
| Perros y gatos | Caras realistas; cuerpos mejorables |
| Humanos | No los genera |
| Texto dentro de la imagen | Garabatos |
| Dragones, castillos de ficción, anime | Fallidos; el modelo "adivina con educación" |

## Requisitos de hardware

- VRAM para inferencia: el DiT en fp16 ocupa unos 186 MB. Sumando el codificador de texto CLIP ViT-L/14 y el VAE congelados, la estimación razonable se sitúa en 2-3 GB de VRAM en fp16, aunque este dato no está publicado por el autor.
- GPU de entrenamiento documentada: 1x RTX 4060 Ti de 8 GB, compartiendo la GPU con otras cargas, durante unas 32 horas.
- GPU recomendadas para inferencia: cualquier GPU de consumo con 4 GB o más (RTX 3060, RTX 4060 Ti, RTX 4090) es más que suficiente; el modelo cabe con holgura incluso en GPUs de gama baja.
- Cabe en GPU de consumo: sí, de forma holgada. Es probable que funcione también en CPU, aunque no hay datos publicados al respecto.
- Opciones de despliegue: scripts propios de PyTorch incluidos en el repositorio (`sample2.py`, `sample_quant.py`). No hay integración documentada con diffusers, vLLM, TGI, llama.cpp ni Ollama.
- Latencia: muy por debajo de un segundo por imagen en la RTX 4060 Ti de entrenamiento, con 30 pasos Euler y guidance 4,5.
- Throughput: no se publica una cifra de imágenes por segundo; durante el entrenamiento se usó un batch de 32. A partir de la latencia declarada se puede estimar el orden de una imagen por segundo en esa GPU, pero es una inferencia, no un dato publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Condicionamiento textual | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| T.I.T.S.2 (MiniAI-TITS2) | 93,19 M (DiT) + CLIP ViT-L/14 + VAE | 256x256 | CLIP ViT-L/14 | MIT | HuggingFace, 0 descargas, 0 likes |
| T.I.T.S. (predecesor, M1n1A1/MiniAI-terrible-imagegen-transformer) | 16 M | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | HuggingFace; según el autor, solo generaba autobuses |
| Modelos de difusión de referencia (por ejemplo SD 1.5) | No disponible en la información proporcionada; dato de conocimiento general no verificado aquí | No disponible | No disponible | No disponible | No disponible |

La búsqueda web realizada no devolvió información relevante sobre el modelo ni sobre alternativas comparables: los resultados obtenidos eran listas de la compra en francés, sin relación con el ámbito técnico. Por tanto, la comparativa se limita al predecesor documentado en la propia model card.

## Limitaciones y advertencias

- Sesgos: entrenado sobre fotografías web de CC12M, hereda los sesgos de representación de ese corpus y "no conoce nada que no se fotografíe mucho en internet", en palabras del autor.
- Figuras humanas: el modelo no genera personas de forma utilizable. El autor describe el resultado del prompt "an astronaut riding a horse" como "un crimen de guerra".
- Texto dentro de la imagen: produce garabatos, sin capacidad de renderizar texto legible.
- Contenido de ficción: dragones, castillos de fantasía y anime fallan porque CC12M contiene fotografías y no ilustración; el resultado es una interpretación imprecisa.
- Alucinación estructural: en categorías fuera de la distribución, el modelo genera formas plausibles pero incorrectas (el dragón se convierte en una ladera flotante).
- Resolución y calidad: 256x256 píxeles, insuficiente para producción gráfica real. No hay FID ni ninguna métrica objetiva publicada, por lo que la calidad solo está descrita de forma cualitativa por el autor.
- Idiomas: solo inglés declarado; no hay evaluación multilingüe y es previsible que los prompts en otros idiomas degraden el resultado.
- Guía: por debajo de 3 el modelo "se desvía" y por encima de 7 "se fríe"; el rango útil es 4-5.
- Cuantización: la versión de 1 bit incluida en el repositorio es inservible por diseño; no debe usarse en ningún flujo real. Las versiones de 2 y 4 bits no están validadas.
- Convergencia: el entrenamiento se detuvo por decisión del autor, no porque el modelo hubiera convergido, según se indica en la model card.
- Licencia: los pesos propios se publican bajo MIT, lo que permite uso comercial, pero el modelo depende de componentes congelados (codificador CLIP ViT-L/14 y VAE SD-VAE-ft-mse) con sus propias condiciones de licencia, que conviene revisar antes de un despliegue comercial. El usuario asume además la responsabilidad sobre las salidas generadas.
- Adopción y mantenimiento: el repositorio registra 0 descargas y 0 likes, no incluye citación académica ("Still no") y su fecha de creación es el 21 de septiembre de 2026. No hay garantía de soporte, versionado ni mantenimiento.
- Estado del proyecto: el propio autor lo presenta como una prueba de entretenimiento y de exploración de los límites de 93 millones de parámetros en una GPU de juego, no como un modelo listo para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/M1n1A1/MiniAI-TITS2
- Predecesor T.I.T.S. (16 M de parámetros): https://huggingface.co/M1n1A1/MiniAI-terrible-imagegen-transformer
- Dataset de leyendas filtradas por marca de agua: https://huggingface.co/datasets/opendiffusionai/cc12m-cleaned
- Dataset de imágenes en formato webdataset: https://huggingface.co/datasets/pixparse/cc12m-wds
- Paper, blog o demo oficial: no disponible
- Repositorio de código independiente: no disponible (los scripts de entrenamiento e inferencia se distribuyen dentro del propio repositorio de HuggingFace)
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo.

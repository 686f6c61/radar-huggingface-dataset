# ocdbytes/pixl

## Resumen

pixl es un modelo de generación de imágenes texto-a-imagen desarrollado por ocdbytes, especializado en la creación de escenas de pixel-art de 32×32 píxeles. A diferencia de los modelos de difusión convencionales, pixl es un Transformer encoder-decoder de 26,7 millones de parámetros entrenado desde cero que genera la imagen píxel a píxel de forma autorregresiva, prediciendo para cada posición una distribución sobre los 256 tokens de una paleta de color fija. El modelo dibuja escenas compuestas por cuatro sprites situados en cada cuadrante de una rejilla 2×2 sobre un suelo de fondo, a partir de una descripción textual que indica qué objeto va en cada posición.

La relevancia de pixl es fundamentalmente metodológica: demuestra que un modelo de apenas 26,7M de parámetros, entrenado en una única GPU de 24 GB durante unas 5 horas, puede aprender a componer escenas con control posicional explícito. Para ello introduce una función de pérdida con margen (hinge margin) que fuerza a que la pérdida con el pie de foto correcto sea al menos 2 nats inferior a la del mismo pie de foto con dos cuadrantes intercambiados. Sin este margen, el modelo aprende qué dibujar pero ignora dónde colocarlo (posición 0,50, equivalente al azar); con él, alcanza 1,00 en escenas con combinaciones de objetos no vistas.

Se trata de un modelo de nicho y alcance muy acotado, no de un generador de propósito general: solo conoce las etiquetas de objeto y nombres de suelo de su dataset de entrenamiento, y solo opera con la plantilla de cuatro objetos en cuadrícula. Su interés reside en la simplicidad del planteamiento, la reproducibilidad completa (código, datos y Docker disponibles) y la licencia CC0 1.0, que lo hace utilizable sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (4 bloques encoder bidireccionales + 8 bloques decoder causales con cross-attention) |
| Parámetros totales | 26.683.776 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 96 tokens de pie de foto (slot entre `<bos>` y `<eos>`) + 1.024 tokens de imagen (32×32) |
| Tipos de cuantización | float32 y bfloat16 (no se documentan otras) |
| Idiomas soportados | No disponible (el tokenizador es BPE a nivel de byte, 1.024 tokens; los pies de foto del dataset están en inglés) |
| Licencia | CC0 1.0 |
| Formato de pesos | safetensors (float32 y bf16) |

## Arquitectura y entrenamiento

pixl es un Transformer encoder-decoder con anchura 384, 6 cabezas de 64 dimensiones y MLP de 1.536. El encoder consta de 4 bloques pre-norm bidireccionales que procesan el pie de foto tokenizado (BPE a nivel de byte, 1.024 tokens, con padding izquierdo en un slot de 96 posiciones) con embeddings aprendidos de token y de slot. El decoder consta de 8 bloques causales pre-norm que procesan un token de inicio aprendido más los píxeles ya generados; cada bloque incluye self-attention, cross-attention sobre la salida del encoder y un MLP con activación GELU. Los píxeles incorporan embeddings aprendidos de token, fila y columna, y la salida es una distribución sobre 256 tokens de paleta por cada píxel (0 transparente, 1–255 colores). La generación emplea caché de clave-valor, temperatura, top-k y classifier-free guidance (Ho y Salimans, 2022), posible porque el 10 % de los pies de foto de entrenamiento se dejaron vacíos.

El entrenamiento se realizó sobre 1 millón de escenas del config `scenes` de `ocdbytes/pixl-data` (CC0 1.0), durante 62.500 batches de 32 escenas (dos pasadas), con AdamW (betas 0,9/0,95, weight decay 0,1), learning rate con warm-up lineal a 3e-4 durante 1.000 pasos y decaimiento coseno hasta 3e-5, gradient clipping de 1,0 y precisión bf16 con multiplicaciones de matrices TF32. Se ejecutó en una única GPU NVIDIA de 24 GB durante unas 5 horas (0,28–0,29 s por paso), con semilla 0. La innovación clave es la pérdida con margen (hinge de 2 nats): la pérdida de cada pie de foto debe ser al menos 2 nats por escena inferior a la del mismo pie de foto con dos cuadrantes de objetos intercambiados. Los sprites provienen de 10 estilos (Kenney Tiny Town, Tiny Dungeon, Tiny Farm, Tiny Battle, Pixel Shmup, Pixel Vehicle Pack, 1-Bit Pack; ansimuz Sunny Land; GrafxKid Mini Pixel Pack 3; Dungeon Crawl Stone Soup 32×32 reducido a 16 px), con 2.240 etiquetas de objeto y 40 tiles de fondo.

## Capacidades

- Generación de imágenes pixel-art de 32×32 píxeles a partir de un pie de foto descriptivo, píxel a píxel de forma autorregresiva.
- Composición de escenas con cuatro sprites, uno por cuadrante, sobre un suelo de fondo.
- Control posicional explícito: el modelo asigna cada objeto a su cuadrante según lo indicado en el pie de foto.
- Generalización a combinaciones de objetos no vistas en entrenamiento (pares de etiquetas retenidos).
- Generación con parámetros ajustables: temperatura, top-k y classifier-free guidance.
- Capacidad de dibujar sprites vistos en entrenamiento; el rendimiento cae notablemente con sprites nuevos (imágenes no vistas).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking.
- Multilingüismo: no disponible; el vocabulario del tokenizador y los pies de foto están en inglés.

## Casos de uso

- Generación de assets para videojuegos retro: el modelo puede producir escenas de 32×32 con cuatro objetos posicionados, útil como generador rápido de prototipos de tiles o composiciones para juegos con estética pixel-art, dado su bajo coste computacional.
- Investigación en generación autorregresiva de imágenes: sirve como banco de pruebas reproducible (código, datos y Docker disponibles) para estudiar decodificación píxel a píxel, classifier-free guidance y control posicional con modelos pequeños.
- Estudio de funciones de pérdida con restricciones: el margen hinge es un caso documentado de cómo una pérdida auxiliar enseña estructura espacial; útil para experimentos académicos sobre alineación de condicionamiento.
- Docencia y divulgación: con 26,7M de parámetros y entrenamiento en una sola GPU de 24 GB en 5 horas, es un ejemplo asequible para explicar arquitecturas encoder-decoder, cross-attention y generación autorregresiva.
- Prototipado de pipelines texto-a-imagen ligeros: para entornos con recursos muy limitados donde un modelo de difusión no es viable, pixl ofrece inferencia en CPU en float32 con pesos de 106,8 MB.
- Pruebas de robustez y evaluación de generalización: los conjuntos de test "new pair" y "new sprites" permiten medir generalización composicional y ante estímulos novedosos de forma controlada.
- Generación de ilustraciones de cuadrícula para demos o documentación: escenas de cuatro objetos con fondo, reproducibles con semilla fija y parámetros de muestreo deterministas.

## Benchmarks y rendimiento

Los datos publicados son métricas internas de evaluación (pérdida por píxel en nats y tasa de acierto posicional), no benchmarks estándar como MMLU o HumanEval.

| Conjunto | Pérdida (nats/píxel) | Posición |
|---|---:|---:|
| Train (500 escenas vistas) | 0,006 | 1,00 |
| New pair (1.000 escenas) | 0,005 | 1,00 |
| New sprites (1.000 escenas) | 1,706 | 0,86 |

Resultados por fichero de pesos (evaluados en CPU, float32):

| Fichero | Pérdida new pair | Posición new pair | Pérdida new sprites | Posición new sprites |
|---|---:|---:|---:|---:|
| `model.safetensors` | 0,0053 | 1,000 | 1,7060 | 0,858 |
| `model-bf16.safetensors` | 0,0053 | 1,000 | 1,7054 | 0,859 |

Ablación del margen (posición en new pair):

| Configuración | Posición new pair |
|---|---:|
| Solo pérdida de píxel, 1 pasada | 0,50 |
| Con margen, 1 pasada | 0,80 |
| Con margen, 2 pasadas | 1,00 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos en float32 ocupan 106,8 MB y en bf16 53,4 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 1 GB de VRAM; también funciona en CPU (la evaluación publicada se realizó en CPU en float32).
- Cabe en GPU consumer: sí, en cualquier modelo moderno (RTX 3060, RTX 4090, etc.) e incluso en hardware integrado.
- Opciones de despliegue: el paquete `pixl` propio del autor (con `pixl.model.Config`), PyTorch con safetensors y la imagen Docker publicada en GitHub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles de forma explícita; el entrenamiento reporta 0,28–0,29 s por paso de batch de 32 escenas en una GPU de 24 GB, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables con otros modelos en la información proporcionada. Como referencia cualitativa de categoría:

| Modelo | Tipo | Parámetros | Contexto/salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pixl | Transformer autorregresivo píxel a píxel | 26,7M | pie de foto 96 tokens, imagen 32×32 | CC0 1.0 | HuggingFace + GitHub |
| Modelos de difusión texto-a-imagen (p. ej. Stable Diffusion) | Difusión latente | Cientos de millones a miles de millones | Resoluciones variables | Variables según versión | Amplia |
| DALL·E / Imagen / Midjourney | Difusión / propietarios | No disponible | Alta resolución | Propietaria | API cerrada |

La comparación directa no es significativa: pixl resuelve una tarea mucho más restringida (escenas de cuatro objetos en cuadrícula, paleta fija, 32×32) y no compite en calidad fotorrealista ni en generalidad con los generadores de difusión.

## Limitaciones y advertencias

- Vocabulario cerrado: solo conoce las etiquetas de objeto y nombres de suelo del entrenamiento; otras palabras se tokenizan pero carecen de significado para el modelo.
- Layout fijo: siempre cuatro objetos en rejilla 2×2 según la plantilla de entrenamiento; una o dos objetos, otras posiciones y texto libre quedan fuera de lo aprendido.
- Estilos: cada escena de entrenamiento usa un único estilo de sprite; los pies de foto que mezclan estilos no han sido probados.
- Formas nuevas: dibuja bien sprites vistos; con imágenes retenidas la pérdida sube a 1,7 nats por píxel frente a 0,005 con sprites conocidos.
- Riesgo de alucinación: limitado al dominio cerrado, pero puede generar composiciones incorrectas si el pie de foto se sale de la plantilla o usa vocabulario desconocido.
- Sesgos: no documentados por el autor; el dataset es CC0 y sintético, pero hereda los sesgos de los packs de sprites de origen.
- Licencia: CC0 1.0 permite uso comercial sin restricciones, pero conviene verificar las licencias de los sprites originales de terceros (Kenney, ansimuz, GrafxKid, Dungeon Crawl Stone Soup) si se redistribuyen los datos.
- Producción: no apto como generador de imágenes de propósito general; su uso realista es educativo, de investigación o de nicho en pixel-art.
- Idiomas: no disponible; el condicionamiento está en inglés y no se ha evaluado en otros idiomas.

## Enlaces

- HuggingFace: https://huggingface.co/ocdbytes/pixl
- Repositorio GitHub (código, entrenamiento y Docker): https://github.com/ocdbytes/PIXL
- Dataset: https://huggingface.co/datasets/ocdbytes/pixl-data
- Paper de classifier-free guidance (Ho y Salimans, 2022): https://arxiv.org/abs/2207.12598

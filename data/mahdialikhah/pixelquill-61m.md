# MahdiAlikhah/pixelquill-61m

## Resumen

Pixelquill-61M es un modelo generativo de texto a imagen desarrollado por MahdiAlikhah, entrenado desde cero para producir sprites de pixel-art de 16x16 píxeles a partir de una descripción textual en inglés. Con 61.367.168 parámetros, se aleja deliberadamente de las arquitecturas de difusión y de los autoencoders variacionales (VAE): en su lugar utiliza un transformer autorregresivo que predice el sprite como una secuencia de 289 tokens discretos. Su relevancia radica en esa elección de diseño: al comprometerse primero con una paleta de 32 colores y después con los 256 índices de pixel, la salida es exacta en índices RGBA, sin decodificador que pueda desviarse ni muestreo en un espacio latente continuo.

El modelo está pensado para la generación de assets de videojuegos de estilo retro, un nicho donde los modelos de difusión generalistas suelen fallar por la baja resolución y la naturaleza discreta de la paleta. Está entrenado sobre el dataset Angais/pixel-art-atlas-1.4m y publicado bajo licencia Apache 2.0, lo que permite uso comercial. El autor lo describe explícitamente como un prototipo capaz, no como un generador de assets listo para producción.

La ficha se basa únicamente en la model card y los metadatos públicos del repositorio de Hugging Face. No se dispone de información sobre la composición exacta del dataset de entrenamiento, la duración del entrenamiento ni detalles del tokenizador más allá de lo que el autor documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (decodificador de secuencia de tokens), sin VAE ni difusion |
| Parametros totales | 61.367.168 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la secuencia de salida es de 289 tokens: 32 de paleta + 256 de pixeles) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32, 245,5 MB) |
| Vocabulario | 8.643 tokens (nivel de palabra) |
| Resolucion de salida | 16x16 px, RGBA con paleta indexada |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo que genera un sprite como una secuencia de 289 tokens discretos: primero 32 identificadores de color de paleta y despues 256 identificadores de posicion (0 para transparente, 1..32 como indice en la paleta del propio sprite). Esta ordenacion hace que el modelo se comprometa con la paleta antes de decidir que pixeles la usan, lo que evita la deriva tipica de los decodificadores continuos. El vocabulario es de nivel de palabra (8.643 tokens) y la carga se realiza mediante un loader propio (`pixelquill.py`) en lugar de `AutoModel`, ya que no sigue la interfaz estandar de `transformers`.

El entrenamiento se realizo desde cero sobre el dataset Angais/pixel-art-atlas-1.4m (1.405.308 sprites de entrenamiento segun las comprobaciones del autor). No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona el uso de guidance (CFG, escala por defecto 3.0) en inferencia, lo que indica que el modelo fue entrenado con dropout de condicionamiento para permitir classifier-free guidance.

## Capacidades

- Generacion de sprites de pixel-art de 16x16 píxeles a partir de una descripcion corta en ingles.
- Control de paleta: el modelo emite primero los colores y luego los pixeles, garantizando coherencia cromatica interna.
- Vinculacion de palabras de color a pixeles reales: en la verificacion del autor, 23 de 24 subtitulos con color inicial produjeron un color dominante dentro de 40 grados de tono del sprite real (error mediano de 4 grados).
- Generacion por lotes de multiples prompts en una sola llamada (`generate()`).
- Salida en indices RGBA exactos, sin decodificador, con posibilidad de escalado (por ejemplo, 16x16 a 128x128 con `scale=8`).
- Interfaz de linea de comandos (`sample.py`) para convertir prompts a PNG.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Prototipado rapido de assets para juegos retro: generar un primer lote de sprites de 16x16 a partir de descripciones como "cute teal slime" o "rusty sword" para iterar sobre el estilo visual antes de encargar arte final.
- Generacion de iconos de inventario: producir objetos pequenos (pociones, armas, sombreros) con paleta controlada, utiles para menus y HUD en juegos de rol.
- Variaciones cromaticas de un mismo objeto: el modelo mantiene la silueta mientras cambia el color (IoU de mascara de 0,94 para slime, 0,86 para pocion, 0,80 para sombrero), lo que permite generar sets de variantes de un mismo item.
- Creacion de datasets sinteticos de pixel-art: usar la salida por lotes para aumentar corpus de entrenamiento de otros modelos o para pruebas de pipelines de renderizado.
- Educacion y experimentacion en generacion discreta: como ejemplo didactico de generacion autorregresiva de imagenes sin difusion, util en cursos y articulos tecnicos.
- Herramientas de lluvia de ideas para artistas: generar rapidamente docenas de propuestas de sprites a partir de listas de prompts y filtrar manualmente las mejores.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de validacion de sujetos no vistos (500 sujetos, 113.550 sprites, sin solapamiento con entrenamiento; el split oficial del dataset se descarta por fuga de datos):

| Metrica | Valor | Baseline aleatorio |
|---|---|---|
| Precision de pixel (teacher-forced) | 80,65% | 3,0% |
| Entropia cruzada de slot | 0,615 | 3,50 |
| Entropia cruzada de paleta | 4,123 | 8,32 |
| Error RGB medio de paleta | 115,9 / 441 | no disponible |
| Concordancia de pixel en generacion libre | 31,6% | no disponible |
| Sprites exactos (256 px correctos) | 0,00% | no disponible |

Verificaciones adicionales del autor: 23 de 24 subtitulos con color inicial produjeron el color dominante correcto (error mediano de 4 grados de tono); al fijar el objeto y cambiar solo la palabra de color, 15 de 16 cayeron en el color solicitado; ningun sprite generado fue duplicado exacto de los 1.405.308 sprites de entrenamiento (minimo de 53 pixeles de diferencia, mediana de 135 sobre 256). No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,25 GB en fp32 para los pesos (245,5 MB), mas overhead de activaciones y del runtime de PyTorch; en la practica cabe en cualquier GPU consumer con 2 GB o mas.
- GPU recomendadas: cualquier GPU moderna; el autor verifico el modelo en una NVIDIA L4. Funciona en RTX 4090, RTX 3090, RTX 3060 y GPUs de portatil con al menos 2 GB de VRAM.
- Cabe en GPU consumer: si, practicamente en cualquier modelo de los ultimos diez anos.
- Opciones de despliegue: el modelo no usa la interfaz de `transformers`; se carga con su propio modulo `pixelquill.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. La API de alto nivel es `Pixelquill.from_pretrained()` y `generate()`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas con otros modelos en la informacion proporcionada. A modo de contexto estructural, se pueden senalar alternativas de la misma categoria (generacion de pixel-art) sin cifras de rendimiento verificadas:

| Modelo | Parametros | Enfoque | Contexto | Licencia |
|---|---|---|---|---|
| Pixelquill-61M | 61,4 M | Transformer autorregresivo de tokens discretos | Secuencia de 289 tokens | Apache 2.0 |
| Stable Diffusion + LoRA de pixel-art | cientos de millones a miles de millones | Difusion latente | no aplica | CreativeML / otras |
| Modelos de difusion especificos de sprites | no disponible | Difusion | no disponible | variable |

La comparacion cuantitativa con alternativas no esta disponible.

## Limitaciones y advertencias

- El propio autor lo califica como prototipo, no como generador de assets listo para produccion: la concordancia de pixel en generacion libre es del 31,6% y ningun sprite generado fue exacto (0,00%).
- La precision teacher-forced (80,65%) es una cota superior que asume que el modelo ve el prefijo correcto; no refleja el rendimiento real en generacion.
- El modelo solo entiende ingles y esta entrenado sobre un unico dataset de pixel-art; su dominio queda limitado a sprites de 16x16 con paleta de 32 colores.
- Riesgo de alucinacion conceptual: el autor documenta que los vecinos mas cercanos en el espacio de entrenamiento pueden ser semanticamente no relacionados (por ejemplo, "reef shark" se aproxima a "folded red square eyeglasses"), lo que indica que la semantica del prompt no siempre se respeta.
- La salida es de baja resolucion (16x16) y requiere escalado para su uso visual; no genera animaciones ni secuencias.
- El split oficial del dataset tiene fuga de datos (los 2.598 sujetos de validacion aparecen en entrenamiento), por lo que cualquier evaluacion basada en el split oficial es invalida.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la originalidad de los sprites generados mas alla de la comprobacion de no duplicacion exacta frente al conjunto de entrenamiento.
- No se documentan sesgos demograficos ni de otro tipo; al tratarse de sprites de objetos, el riesgo de sesgo social es bajo, pero no se ha auditado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MahdiAlikhah/pixelquill-61m
- Dataset de entrenamiento: https://huggingface.co/datasets/Angais/pixel-art-atlas-1.4m
- Repositorio del autor en Hugging Face: https://huggingface.co/MahdiAlikhah
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.

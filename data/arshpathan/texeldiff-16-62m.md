# ArshPathan/TexelDiff-16-62M

## Resumen

TexelDiff-16-62M es un modelo de difusión de imagen a partir de texto, de tamano reducido, especializado en la generacion de texturas de bloques y objetos con estetica de Minecraft a resolucion 16x16 con canal alfa. Lo desarrolla ArshPathan y se publica en Hugging Face bajo el identificador `ArshPathan/TexelDiff-16-62M`. El modelo aborda un nicho muy concreto: generar assets de pixel art coherentes con el estilo de los mods de Minecraft a partir de una instruccion textual breve, una tarea que los modelos de difusion generalistas resuelven mal por la resolucion extremadamente baja y la necesidad de transparencia.

La arquitectura es una UNet convolucional con atencion propia y cruzada, condicionada por caracteristicas de texto congeladas de CLIP ViT-B/32 y por la resolucion de la textura. Se entrena con DDPM (ruido gaussiano, schedule coseno, prediccion de ruido) y se muestrea con DDIM y classifier-free guidance. Con 61.916.932 parametros, el modelo es lo bastante pequeno como para ejecutarse en hardware modesto, lo que lo hace interesante para pipelines de generacion de assets en herramientas de creacion de mods.

Su relevancia actual es limitada pero clara dentro de su nicho: demuestra que un modelo de ~62M de parametros entrenado desde cero con un dataset curado de texturas de mods puede producir sprites 16x16 utilizables, algo que hasta ahora solia requerir modelos mucho mayores o herramientas de edicion manual. La licencia queda marcada como "other" y el propio autor deja tareas pendientes sobre atribucion y condiciones de uso, lo que condiciona su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet convolucional con atencion propia y cruzada; difusion (DDPM para entrenamiento, DDIM para muestreo) |
| Parametros totales | 61.916.932 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (condicionamiento por texto CLIP, sin ventana de contexto de tokens definida) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors de precision completa; no se documentan variantes GGUF, INT8 ni FP16) |
| Idiomas soportados | no disponible (las instrucciones de texto se procesan con CLIP ViT-B/32, entrenado principalmente en ingles; el modelo card no declara idiomas) |
| Licencia | other (pendiente de definir por el autor; el propio README indica que debe fijarse tras revisar los terminos del dataset) |
| Formato de pesos | safetensors (acompanado de `model.py` y `config.json` en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura es una UNet convolucional con bloques de atencion propia y cruzada, condicionada por caracteristicas de texto congeladas extraidas con `openai/clip-vit-base-patch32` y por la resolucion de la textura de salida. El proceso de difusion sigue un esquema DDPM con schedule coseno y prediccion de ruido, y el muestreo se realiza con DDIM y classifier-free guidance. La salida es siempre una imagen de exactamente 16x16 pixeles con canal alfa, lo que fija la resolucion y limita el uso a ese formato.

El entrenamiento se realizo sobre un subconjunto del dataset `NathMen12/16xModdedMinecraft-TextToImage`, compuesto por texturas de mods de Minecraft. Solo se conservaron filas con licencias permisivas (MIT, Apache, BSD, CC0, CC-BY y similares), excluyendo las marcadas como "All Rights Reserved", no comerciales o GPL. Tras eliminar duplicados, imagenes casi vacias y de color plano, y limitar las leyendas casi identicas, se mantuvieron hasta 50.000 texturas. El entrenamiento duro 40 epocas (~31.000 pasos) con AdamW, learning rate 2e-4 con warm-up y decaimiento coseno, EMA 0.999, precision mixta y un 10% de dropout de texto para classifier-free guidance, todo ello en una unica T4 en Kaggle durante aproximadamente 9,5 horas. Los pesos publicados son los del EMA.

Como innovacion tecnica destacable, el modelo incorpora el condicionamiento explicito por resolucion y el uso de un formato de prompt muy acotado (`minecraft block texture: <nombre>` o `minecraft item texture: <nombre>`), lo que permite que una UNet pequena entrenada desde cero aprenda una distribucion estrecha de texturas sin necesidad de un modelo de lenguaje grande. El autor documenta ademas que muchas texturas de minerales del dataset son overlays con fondo transparente, lo que obliga a un flujo de composicion en dos pasos (generar el overlay y superponerlo sobre un bloque base).

## Capacidades

- Generacion de texturas 16x16 RGBA a partir de prompts de texto en el formato de entrenamiento (`minecraft block texture: <nombre>`, `minecraft item texture: <nombre>`).
- Control de la opacidad de la salida mediante el parametro `opaque`, pensado para bloques completos frente a objetos y sprites con transparencia.
- Ajuste de la fidelidad al prompt mediante classifier-free guidance (`guidance` 3-5 como rango recomendado) y del numero de pasos de muestreo (`steps` 50 por defecto).
- Generacion por lotes (`n`) para producir multiples variantes de una misma textura.
- Composicion de overlays: permite generar capas de minerales y superponerlas sobre bloques base generados (stone, deepslate, etc.).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento: es exclusivamente un modelo text-to-image.
- No dispone de capacidades de vision, audio ni generacion de video.
- Capacidad multilingue no documentada; el condicionamiento CLIP favorece descripciones en ingles.

## Casos de uso

- Generacion de assets para mods de Minecraft: un modder puede escribir `minecraft item texture: iron sword` y obtener variantes de sprite listas para importar en el resource pack, con la ventaja de que el modelo respeta el formato 16x16 y el canal alfa que exige el juego.
- Creacion rapida de prototipos de texturas de bloques: durante el diseno de un mod, el equipo puede generar docenas de variantes de `stone`, `oak planks` o `redstone ore` con `opaque=True` para evaluar direcciones visuales antes de encargar el arte final.
- Generacion de capas de minerales: el flujo documentado permite generar el overlay del mineral sin `opaque` y componerlo sobre un bloque base generado, lo que acelera la produccion de familias completas de minerales (hierro, oro, diamante) sobre distintos materiales.
- Herramientas de edicion integradas en pipelines de modding: al ser un modelo de ~62M de parametros con pesos safetensors y un `model.py` autonomo, puede empaquetarse en un plugin o CLI que genere texturas bajo demanda sin depender de servicios externos.
- Generacion de variantes estilisticas para packs de texturas: con `guidance` bajo (3) se obtiene mas variedad, util para explorar paletas y estilos alternativos dentro del look de mods.
- Docencia y experimentacion en difusion: el modelo es un caso de estudio compacto de difusion condicionada por CLIP entrenada desde cero, adecuado para cursos o articulos que quieran reproducir el pipeline completo en una sola GPU consumer.
- Pruebas de concepto de text-to-image en resolucion ultrabaja: sirve como banco de pruebas para investigar condicionamiento por resolucion, dropout de texto y composicion de capas alfa en modelos de difusion pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 61,9M de parametros, los pesos en FP32 ocupan aproximadamente 0,25 GB y en FP16 unos 0,12 GB, a lo que hay que sumar el codificador CLIP ViT-B/32 (~150M de parametros) y los tensores intermedios de la UNet. En la practica, el modelo cabe holgadamente en cualquier GPU consumer con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor entreno en una unica T4 (16 GB) en Kaggle, por lo que una T4, una RTX 3060, una RTX 4060 o superiores son suficientes. Para lotes grandes, una RTX 4090 o una A100 reducen el tiempo de generacion.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer moderna, e incluso en CPU para generacion por lotes pequenos (latencia mayor).
- Opciones de despliegue: el repositorio incluye `model.py`, `model.safetensors` y `config.json`, pensados para cargarse con la clase `TextureGenerator` del propio autor usando PyTorch, Transformers, safetensors, huggingface_hub, Pillow y NumPy. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. El autor no publica tiempos de inferencia por imagen ni throughput; con 50 pasos DDIM y un modelo de este tamano, la generacion por imagen deberia ser del orden de decimas de segundo a pocos segundos en GPU consumer, pero es una estimacion no confirmada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TexelDiff-16-62M | 61,9M | 16x16 RGBA fijo | Difusion UNet + CLIP, entrenada desde cero para texturas Minecraft | other (pendiente) | Hugging Face, pesos safetensors |
| Stable Diffusion 1.5 | ~860M (UNet) | 512x512 (hasta 1024 con upscalers) | Difusion latente generalista | CreativeML OpenRAIL-M | Amplia, ecosistema maduro |
| PixelArt-Diffusion (variantes) | no disponible | 16x16 a 64x64 | Difusion especializada en pixel art | variable segun variante | Hugging Face, disponibilidad variable |
| Modelos de difusion para sprites de juegos (genericos) | no disponible | variable | Difusion condicionada por texto | variable | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de TexelDiff-16-62M con estas alternativas; la comparacion se limita a parametros, resolucion, enfoque y licencia.

## Limitaciones y advertencias

- Resolucion fija: solo genera 16x16; los pesos no soportan otras resoluciones, lo que descarta su uso para texturas de mayor detalle.
- Comprension textual limitada: la UNet se entreno desde cero con un estilo de leyenda muy estrecho; los prompts libres que se alejan del formato de entrenamiento producen mezclas de texturas conocidas en lugar de composiciones nuevas.
- Riesgo de memorizacion: los objetos comunes tienen muchas variantes casi identicas en el dataset, por lo que las salidas pueden parecerse entre si y algunas pueden reproducir de cerca texturas de entrenamiento, con implicaciones de originalidad y derechos.
- Estilo de mods, no vanilla: el look resultante difiere del de Minecraft vanilla, lo que puede no encajar en proyectos que busquen fidelidad al juego base.
- Licencia sin cerrar: el modelo se publica como "other" y el propio autor deja pendiente la eleccion de licencia final, la atribucion al dataset y sus fuentes, y la confirmacion de que las condiciones de acceso del dataset permiten liberar un modelo derivado. El uso comercial no esta garantizado.
- Procedencia de los datos: aunque solo se usaron filas con licencias permisivas, las texturas provienen de mods con licencias diversas y la verificacion de atribucion queda pendiente, lo que introduce riesgo legal en produccion.
- Alucinacion visual: al ser un modelo de difusion, puede generar texturas incoherentes o con artefactos, especialmente en prompts fuera de vocabulario; no hay garantia de coherencia entre la textura generada y el objeto real del juego.
- Sin benchmarks publicados: no hay evaluacion cuantitativa de calidad, fidelidad al prompt ni diversidad, lo que dificulta comparar su rendimiento con alternativas.
- Idioma: el condicionamiento CLIP esta entrenado principalmente en ingles; los prompts en castellano u otros idiomas pueden degradar la calidad.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin muestras subidas (el README incluye un TODO para subir grids de ejemplos), lo que limita la evaluacion previa a la descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArshPathan/TexelDiff-16-62M
- Dataset de entrenamiento: https://huggingface.co/datasets/NathMen12/16xModdedMinecraft-TextToImage
- Codificador de texto CLIP ViT-B/32: https://huggingface.co/openai/clip-vit-base-patch32

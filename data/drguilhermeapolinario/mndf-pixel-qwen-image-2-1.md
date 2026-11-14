# drguilhermeapolinario/mndf-pixel-qwen-image-2.1

## Resumen

MiniDF pixel map es un LoRA de image-to-image para el modelo de difusion Qwen/Qwen-Image-2.1, desarrollado por el usuario drguilhermeapolinario. Su funcion es convertir renders 3D oblicuos de mapas urbanos en imagenes con la estetica de pixel-art isometrico del mapa MiniDF de Brasilia, preservando la posicion de carreteras, edificios y arboles del render original. El adaptador se publica como experimento de investigacion bajo licencia Apache 2.0 y se carga sobre el pipeline `QwenImage21Pipeline` de la libreria diffusers.

El modelo base es un transformer de difusion (Qwen-Image-2.1) del que la ficha no proporciona detalles de parametros, contexto ni cuantizacion, ya que el LoRA no los modifica. El adaptador en si ocupa un repositorio de 0.0 GB (pesos del adaptador de bajo rango, rank 16), no incluye pesos del modelo base y se activa mediante `pipe.load_lora_weights()`. Su relevancia es acotada: es un caso de personalizacion estilistica muy concreta (mapas de Brasilia) mas que un modelo de proposito general.

El entrenamiento se realizo con el script `train_dreambooth_lora_qwenimage21_img2img.py` de diffusers, con un conjunto de aproximadamente 2.000 pares (render 3D oblicuo de un fotograma de mapa de 1024 px a pintura pixel-art del mismo fotograma). La evaluacion publicada se limita a LPIPS sobre un conjunto de test retenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion transformer, Qwen/Qwen-Image-2.1 |
| Parametros totales | No disponible (el repositorio solo contiene pesos del adaptador LoRA) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible; el ejemplo de uso emplea `torch_dtype=torch.bfloat16` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos LoRA compatibles con diffusers (`load_lora_weights`); no disponible el formato exacto de los ficheros |
| Rank / alpha del LoRA | 16 / 16 |
| Resolucion de entrenamiento | 1024 px |
| Pipeline | image-to-image |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16 aplicado sobre Qwen/Qwen-Image-2.1, un modelo de difusion para generacion y edicion de imagenes condicionado por texto. No se dispone de informacion sobre la arquitectura interna del modelo base (numero de parametros, mecanismo de atencion, VAE o encoder de texto) en la documentacion proporcionada. El adaptador opera en modo image-to-image: recibe un render como imagen de entrada y un prompt de instancia que describe la transformacion deseada.

El entrenamiento siguio el script de diffusers `train_dreambooth_lora_qwenimage21_img2img.py` con learning rate constante de 1e-4, random flip, resolucion de 1024 px, batch size 1 y 3.750 pasos, con un tiempo de aproximadamente 100 minutos sobre una unica GPU RTX PRO 6000. El dataset consta de unos 2.000 pares de render 3D oblicuo y pintura pixel-art correspondiente, mayoritariamente de Brasilia, con anadidos de Sao Paulo, lineas de costa y 42 fotogramas de hitos mundiales; el autor indica que la ronda ganadora se entreno con 188 pares de Brasilia. No se menciona RLHF, DPO ni otro ajuste por preferencias.

## Capacidades

- Transformacion image-to-image de renders 3D oblicuos de mapas a pixel-art isometrico con el estilo MiniDF.
- Preservacion de la estructura del mapa de entrada: carreteras, edificios y arboles mantienen su posicion segun el prompt de instancia.
- Estilizacion aplicada a mapas de Brasilia, Sao Paulo, Rio de Janeiro, lineas de costa y 42 hitos mundiales (segun el conjunto de test del autor).
- Generacion condicionada por prompt de texto de instancia; el ejemplo usa `num_inference_steps=28` sin guidance (valor por defecto del pipeline).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general ni audio.

## Casos de uso

- Estilizacion de cartografia urbana: dado un render 3D de un mapa de 1024x1024 a unos 30 grados de oblicuidad, el LoRA devuelve una version pixel-art isometrica manteniendo la topologia de calles y edificios, util para portadas de articulos o material divulgativo sobre la ciudad.
- Prototipado de assets para videojuegos de vista isometrica: se pueden convertir rapidamente renders de bloqueo de un nivel en referencias visuales pixel-art coherentes con las posiciones originales.
- Generacion de mapas para documentacion o senaletica: el modelo puede producir ilustraciones estilizadas de barrios concretos a partir de un render geoespacial previo, sin redibujar manualmente la trama viaria.
- Comparativa de estilos de mapas en investigacion: al ser un LoRA pequeno y abierto, sirve para estudiar tecnicas de personalizacion estilistica sobre modelos de difusion de imagen.
- Reproduccion de la estetica MiniDF en mapas de otras ciudades: el autor reporta resultados en Sao Paulo, Rio y hitos mundiales, por lo que puede emplearse para generar variaciones del estilo fuera de Brasilia (con perdida de fidelidad estructural conforme crece la distancia al dominio de entrenamiento).
- Banco de pruebas de pipelines image-to-image con diffusers: el ejemplo de la model card (`QwenImage21Pipeline` + `load_lora_weights`) sirve como plantilla minima para integrar adaptadores LoRA en flujos de edicion de imagen.

## Benchmarks y rendimiento

| Metrica | Conjunto | Valor |
|---|---|---|
| LPIPS (ronda 1, juez) | 32 fotogramas retenidos de Brasilia | 0.416 |
| LPIPS (test de cinco grupos) | Global | 0.410 |
| LPIPS (test de cinco grupos) | Brasilia | 0.401 |
| LPIPS (test de cinco grupos) | Hitos (landmarks) | 0.409 |
| LPIPS (test de cinco grupos) | Sao Paulo | 0.396 |
| LPIPS (test de cinco grupos) | Rio | 0.412 |
| LPIPS (test de cinco grupos) | Mundo | 0.429 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; el unico indicador cuantitativo es LPIPS, una metrica perceptual de similitud de imagen, no comparable con benchmarks de modelos de lenguaje.

## Requisitos de hardware

- El LoRA en si ocupa 0.0 GB segun el repositorio, pero requiere cargar el modelo base Qwen/Qwen-Image-2.1 en memoria para la inferencia.
- El ejemplo del autor usa `torch_dtype=torch.bfloat16` sobre `cuda`, lo que implica disponer de una GPU con VRAM suficiente para el modelo base en bfloat16; el valor concreto no se detalla en la informacion disponible.
- El entrenamiento se realizo en una unica RTX PRO 6000 en aproximadamente 100 minutos con 3.750 pasos y batch 1, lo que da una referencia de viabilidad en GPU profesional de una sola tarjeta.
- No se especifican requisitos para GPU de consumo (RTX 4090, 3090, etc.); no disponible.
- Despliegue: libreria diffusers con `QwenImage21Pipeline`; no se indican opciones para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente a este pipeline).
- Latencia y throughput: no disponibles; el ejemplo usa 28 pasos de inferencia para una salida de 1024x1024.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mndf-pixel-qwen-image-2.1 (este) | LoRA image-to-image sobre Qwen-Image-2.1 | Adaptador rank 16 (base no disponible) | No aplica | LPIPS 0.401-0.429 en test del autor | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen-Image-2.1 (modelo base) | Difusion de imagen texto-a-imagen / imagen-a-imagen | No disponible | No disponible | No disponible en la informacion | No especificada en la informacion | Hugging Face |
| Otros LoRA de pixel-art para modelos de difusion | Adaptadores de estilo | Depende del modelo base | No aplica | No disponible | Variable | No disponible |

No hay datos publicados que permitan comparar este adaptador con alternativas especificas de la misma tarea (mapas pixel-art isometricos) en terminos de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Datos de entrenamiento con posible restriccion de uso: los renders 3D de entrada son salidas de Google Photorealistic 3D Tiles, y el autor advierte que los terminos de Google Map Tiles no permiten usar su contenido para entrenar modelos; el LoRA se comparte solo como experimento de investigacion y debe revisarse esa licencia antes de cualquier uso adicional.
- Dominio estrecho: el modelo rinde mejor en renders similares a los de entrenamiento (1024x1024, oblicuidad de unos 30 grados y unos 3.4 px por metro); fuera de ese formato la calidad puede degradarse.
- Fidelidad de estilo incompleta: el agua sale mas brillante que el teal profundo del objetivo y las tramas muy finas (por ejemplo, la Torre de TV) solo aparecen si el render 3D las muestra.
- Sin datos publicados sobre sesgos, idiomas, tasas de alucinacion o robustez fuera del conjunto de test del autor.
- Licencia Apache 2.0 declarada para el adaptador, pero condicionada por la advertencia sobre los terminos de Google Map Tiles para los datos de entrenamiento; verificar antes de uso comercial.
- Metrica de evaluacion unica (LPIPS) y sin comparacion con lineas base o modelos alternativos; la valoracion de calidad es limitada.
- Repositorio recien creado (14 de noviembre de 2026) con 0 descargas y 0 likes, sin evidencia de uso en produccion por terceros.
- No se documentan capacidades de tool calling, agentes ni texto, por lo que no debe emplearse como sustituto de un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drguilhermeapolinario/mndf-pixel-qwen-image-2.1
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Mapa MiniDF de referencia: https://cadeoflavio.marceloeduardo.com/
- Log de entrenamiento: https://marceloeduardo.com/pixel-lora-training.html
- Repositorio citado en el ejemplo (ruta alternativa del adaptador): https://huggingface.co/handful/mndf-pixel-qwen-image-2.1

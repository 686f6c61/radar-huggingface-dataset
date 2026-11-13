# huangdffs/Aniimage-1

## Resumen

Aniimage-1 es un modelo de difusion latente para generacion de imagenes anime en resolucion 256x256, desarrollado por 8BitStudio. Se distribuye bajo licencia Apache 2.0 y se integra en la libreria diffusers. La arquitectura combina un UNet entrenado desde cero con un VAE y un codificador de texto CLIP, sumando unos 640 millones de parametros en el pipeline completo, de los cuales 433,37 millones corresponden al UNet.

El modelo se entrena sobre 830.001 imagenes anime curadas de Danbooru durante 88.000 pasos con batch de 64, empleando una unica NVIDIA RTX 5060 Ti de 16 GB. Acepta tanto descripciones en texto plano como etiquetas de Danbooru, y esta pensado para generar personajes anime, uniformes escolares, vestimenta fantastica y escenarios de fondo.

Su relevancia practica es acotada: es un modelo pequeno y experimental, con cero descargas y cero likes en el momento de la ficha, pensado para inferencia en hardware de consumo modesto (unos 3,4 GB de VRAM minimos). La propia model card indica que ya existe una version posterior, Aniimage-2, con resolucion nativa 512x512 y 1,2 millones de imagenes de entrenamiento, por lo que Aniimage-1 debe considerarse una iteracion temprana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (UNet + VAE + CLIP) |
| Parametros totales | 433.370.628 (UNet); 640 millones en el pipeline completo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de texto a imagen, sin contexto de texto autoregresivo) |
| Tipos de cuantizacion | no disponible (pesos safetensors; la model card no documenta cuantizaciones GGUF u otras) |
| Idiomas soportados | ingles (declarado); soporte parcial y no fiable de espanol segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria diffusers) |

Otros datos tecnicos declarados: resolucion de salida 256x256, 88.000 pasos de entrenamiento, batch de 64, GPU de entrenamiento NVIDIA RTX 5060 Ti de 16 GB, schedulers DDIM o DPM++ 2M, y tamano del repositorio de 1,7 GB.

## Arquitectura y entrenamiento

Aniimage-1 es un modelo de difusion latente clasico. Un autoencoder variational (VAE) comprime las imagenes al espacio latente, un codificador CLIP transforma el prompt en embeddings de texto y un UNet, entrenado desde cero por el autor, aprende el proceso de eliminacion de ruido en ese espacio latente. La model card indica que el objetivo de entrenamiento es prediccion epsilon (epsilon-prediction), a diferencia de Aniimage-2, que pasa a v-prediction con relacion senal-ruido de terminal cero.

El entrenamiento se realizo sobre aproximadamente 830.001 imagenes anime curadas de Danbooru, con 88.000 pasos y un batch de 64, en una sola RTX 5060 Ti de 16 GB. No se documentan en la informacion disponible el numero total de tokens vistos, la composicion exacta del dataset ni si hubo etapas de RLHF, DPO o fine-tuning por preferencias; en un modelo de difusion estos metodos no son el mecanismo habitual, pero la model card no aporta detalles al respecto. Tampoco se describen innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de imagenes anime a partir de texto en ingles, con resolucion de 256x256.
- Acepta dos modos de prompt: descripciones en lenguaje natural y etiquetas de Danbooru (por ejemplo, `1girl, solo, smile, red_hair, school_uniform, anime_coloring`).
- Generacion de personajes anime con variedad de colores y estilos de pelo.
- Ropa y vestimenta: uniformes escolares, trajes de fantasia, vestidos de sirvienta y similares.
- Escenarios de fondo: flores de cerezo, cielo nocturno, interiores y naturaleza.
- Comprension parcial de prompts en espanol; la model card advierte que los prompts largos en espanol son menos fiables.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es exclusivamente un modelo de texto a imagen.
- No dispone de modo thinking, vision de entrada, audio ni otras capacidades multimodales mas alla de la generacion de imagen.

## Casos de uso

- Prototipado rapido de personajes anime: con 3,4 GB de VRAM minimos y resolucion 256x256, permite iterar bocetos de personajes en hardware de consumo antes de pasar a un modelo mayor. Es adecuado por su bajo coste de inferencia, aunque la calidad de detalle es limitada.
- Generacion de avatares y retratos de perfil: el modelo funciona bien con prompts cortos de personaje unico (`1girl, solo, smile, red_hair`), lo que encaja en la produccion de avatares de baja resolucion para foros o prototipos de aplicaciones.
- Creacion de assets para juegos indie o prototipos: fondos de escenas (flores de cerezo, cielos nocturnos, interiores) e indumentaria (uniformes, vestidos de sirvienta) para maquetas visuales, aceptando la limitacion de 256x256 y el riesgo de cajas negras laterales al usar etiquetas Danbooru.
- Pruebas de concepto de pipelines de difusion: al ser un modelo pequeno (433,37 M de parametros en el UNet) y compatible con diffusers, sirve para validar integraciones de generacion de imagen, schedulers (DPM++ 2M, DDIM, Euler) y flujos de prompt antes de migrar a modelos de mayor tamano.
- Experimentacion con prompts bilingues: la model card documenta que entiende parcialmente el espanol, lo que permite probar el comportamiento multilingue de un modelo entrenado principalmente con etiquetas en ingles; no es fiable para produccion en espanol.
- Educacion y demostraciones de difusion latente: su tamano reducido y su entrenamiento desde cero lo hacen util para explicar el funcionamiento de UNet + VAE + CLIP en entornos con GPU modesta (4+ GB recomendados).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas cuantitativas como FID, CLIP score, MMLU o HumanEval (estas ultimas no aplican a un modelo de imagen), ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM minima para inferencia: aproximadamente 3,4 GB; se recomiendan 4 GB o mas.
- RAM de CPU: aproximadamente 2 GB; la generacion en CPU es extremadamente lenta segun la model card.
- GPU de entrenamiento original: NVIDIA RTX 5060 Ti de 16 GB, lo que sugiere que el modelo cabe con holgura en GPUs de consumo modernas de gama media.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o mas de VRAM; no se documentan requisitos para A100, H100 o RTX 4090, que serian sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, con 4 GB o mas de VRAM.
- Opciones de despliegue: libreria diffusers (pipeline text-to-image) con PyTorch, torchvision, transformers, safetensors y pillow; el autor proporciona un script `generate_hf.py` y un notebook de Colab. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Ajustes recomendados: scheduler DPM++ 2M con 25 pasos y CFG 7,5; alternativa Euler con 30 pasos y CFG 5.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aniimage-1 | 433,37 M (UNet); 640 M en pipeline | 256x256 | no aplica | Apache 2.0 | Hugging Face (huangdffs/Aniimage-1) |
| Aniimage-2 | no disponible en la informacion | 512x512 | no aplica | no disponible en la informacion | Hugging Face (8BitStudio/Aniimage-2) |

Solo se dispone de datos comparativos frente a Aniimage-2, la version posterior del mismo autor: resolucion nativa 512x512, entrenamiento con 1,2 millones de imagenes unicas (frente a 830.001), objetivo v-prediction con relacion senal-ruido de terminal cero y muestreo uniforme de timesteps. No se dispone de informacion sobre otros modelos anime comparables (por ejemplo, variantes de Stable Diffusion afinadas para anime) en la informacion proporcionada, por lo que no se incluye comparacion cuantitativa con ellos.

## Limitaciones y advertencias

- Resolucion fija de 256x256: los detalles finos, como las manos y rasgos pequenos, pueden salir toscos.
- Rostros repetitivos o "derretidos" entre prompts distintos, segun reconoce el autor.
- Practicamente sin contenido NSFW: el dataset de entrenamiento es mayoritariamente SFW.
- Peor rendimiento al generar hombres, por sesgo del dataset de Danbooru.
- Tendencia a ocultar las manos si no se especifican en el prompt.
- Al usar etiquetas de Danbooru aparece con frecuencia cajas o barras negras en los laterales de la imagen, probablemente por imagenes de entrenamiento no recortadas con relacion de aspecto distinta a la esperada.
- El japones no funciona en absoluto, con imagenes muy distorsionadas; el espanol funciona solo parcialmente y empeora con prompts largos.
- Los prompts largos y los prompts enriquecidos suelen dar peores resultados; conviene mantenerlos cortos.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un modelo entrenado con imagenes de Danbooru conviene revisar las condiciones de la fuente de datos antes de explotarlo comercialmente.
- Riesgo de alucinacion visual y de anatomias incorrectas, coherente con un modelo pequeno entrenado con recursos limitados.
- Modelo sin traccion en el momento de la ficha (0 descargas, 0 likes) y ya superado por Aniimage-2; no se recomienda para produccion frente a su sucesor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huangdffs/Aniimage-1
- Modelo Aniimage-2 (sucesor): https://huggingface.co/8BitStudio/Aniimage-2
- Script de generacion: https://huggingface.co/8BitStudio/Aniimage-1/resolve/main/generate_hf.py
- Notebook de Colab: https://huggingface.co/8BitStudio/Aniimage-1/blob/main/Aniimage_1_Colab.ipynb
- Dataset de origen (Danbooru): https://danbooru.donmai.us/
- Libreria diffusers: no se proporciona enlace en la informacion disponible

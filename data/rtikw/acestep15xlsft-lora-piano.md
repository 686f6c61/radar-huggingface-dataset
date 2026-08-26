# rtikw/acestep15xlsft-lora-piano

## Resumen

`rtikw/acestep15xlsft-lora-piano` es un adaptador LoRA (Low-Rank Adaptation) diseñado para el modelo base de generación musical ACE-Step-v1.5-XL-sft. Este adaptador, entrenado mediante la técnica de entrenamiento diferencial (Differential LoRA), tiene como objetivo mejorar específicamente la calidad y presencia de pianos en las composiciones musicales generadas por el modelo base. El modelo base es un sistema de generación de música de código abierto que permite crear canciones completas con letras, voces y acompañamiento.

El adaptador cuenta con aproximadamente 79,7 millones de parámetros, un tamaño relativamente pequeño en comparación con el modelo base, lo que permite una carga y aplicación eficiente sobre el modelo principal. Este repositorio en HuggingFace es un espejo (mirror) no modificado de los pesos originales alojados en ModelScope, creado para facilitar la descarga mediante herramientas nativas de HuggingFace, ya que los pesos originales solo estaban disponibles en la plataforma ModelScope. La licencia es Apache-2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo de difusion de audio |
| Parametros totales | 79.691.776 |
| Parametros activos | No aplica (adaptador LoRA) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (pesos en bfloat16 para el modelo base) |
| Idiomas soportados | No disponible (el modelo base soporta letras en varios idiomas, incluido chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se basa en la tecnica de entrenamiento diferencial LoRA (Differential LoRA), una variante que permite ajustar selectivamente ciertos aspectos del modelo base. En este caso, el entrenamiento se ha realizado sobre el modelo ACE-Step-v1.5-XL-sft, que es un modelo de difusion de audio de gran escala para generacion de musica. El adaptador esta disenado especificamente para realzar la presencia y calidad del piano en las composiciones generadas.

El modelo base ACE-Step-v1.5-XL-sft utiliza una arquitectura de difusion con un transformer de audio y un tokenizador de texto Qwen3-Embedding-0.6B, junto con un VAE para la generacion de audio. El adaptador LoRA se entrena de forma que se integra en el modulo DiT (Diffusion Transformer) del modelo base. No se han proporcionado datos sobre el dataset de entrenamiento especifico ni el numero de tokens utilizados, pero la tecnica de entrenamiento diferencial permite que el adaptador modifique solo los aspectos relacionados con el piano, preservando el resto de capacidades del modelo base.

## Capacidades

- Mejora la calidad del piano en la generacion de musica, haciendo que este instrumento suene mas prominente y definido.
- Se integra con el modelo base ACE-Step-v1.5-XL-sft para generar canciones completas con letra, voces y acompanamiento.
- Compatible con el pipeline de DiffSynth-Studio para inferencia, incluyendo parametros como BPM, escala de tono, compas y duracion.
- Permite generar musica con letras en varios idiomas, incluyendo chino, gracias a las capacidades multilingues del modelo base.
- No requiere un pipeline especifico: se carga como un adaptador sobre el modelo base y se usa con el mismo flujo de inferencia.
- Al ser un adaptador LoRA, puede combinarse con otros LoRA del mismo conjunto (como el de acompanamiento) para modificar distintos aspectos de la generacion.

## Casos de uso

- Composicion musical asistida: un compositor puede usar este LoRA para generar demos con pianos destacados, facilitando la inspiracion o la creacion de maquetas rapidas.
- Produccion de bandas sonoras: para proyectos de video o juegos que requieren musica con un piano prominente, el adaptador permite generar pistas completas con el estilo deseado sin necesidad de un musicista humano.
- Generacion de canciones con letra: el modelo base permite introducir letras en formato de cancion (versos, coros, puentes) y el LoRA asegura que el acompanamiento de piano este bien definido, lo que es util para creadores de contenido que necesitan canciones originales.
- Educacion musical: se puede usar para generar ejemplos de piezas de piano con diferentes estilos o tempos, utiles para estudiantes que quieren analizar estructuras musicales.
- Prototipado de productos de audio: empresas que desarrollan aplicaciones de musica pueden integrar este LoRA en sus pipelines para ofrecer a los usuarios una generacion de musica con enfasis en piano.
- Personalizacion de contenido en streaming: creadores de contenido en plataformas como Twitch o YouTube pueden generar musica de fondo con piano para sus transmisiones, adaptando la letra al tema de la sesion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la model card no proporciona metricas comparativas ni evaluaciones cuantitativas del rendimiento del adaptador frente al modelo base.

## Requisitos de hardware

- El adaptador LoRA es ligero (79,7 millones de parametros) y se carga sobre el modelo base, que es el que determina los requisitos reales de VRAM.
- El modelo base ACE-Step-v1.5-XL-sft requiere una GPU con al menos 24 GB de VRAM para inferencia en bfloat16 (por ejemplo, una RTX 3090 o A100).
- Se recomienda una GPU con soporte CUDA para un rendimiento optimo, aunque el modelo base tambien soporta dispositivos Mac, AMD e Intel segun el repositorio de ACE-Step.
- El pipeline de inferencia se ejecuta con DiffSynth-Studio, que gestiona la carga del modelo base y el adaptador.
- La latencia de inferencia no esta documentada, pero para una generacion de 160 segundos de audio con 50 pasos de inferencia, se puede esperar un tiempo de proceso de varios minutos en una GPU de gama alta.
- Para despliegue en produccion, se recomienda usar un servidor con GPU dedicada y gestionar la carga del modelo base de forma persistente.

## Comparativa con modelos similares

El modelo base ACE-Step-v1.5-XL-sft se compara con otros modelos de generacion musical open source como MusicGen de Meta o AudioLDM. Sin embargo, este adaptador LoRA es especifico para el modelo ACE-Step y no tiene equivalentes directos en otros ecosistemas. Comparado con el LoRA de acompanamiento (acestep15xlsft-lora-music), este adaptador se centra exclusivamente en el piano, mientras que el otro refuerza la base musical. Ambos se pueden usar conjuntamente para obtener un resultado mas completo.

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| acestep15xlsft-lora-piano | 79,7 M | No disponible | No publicado | Apache-2.0 |
| acestep15xlsft-lora-music | No disponible | No disponible | No publicado | Apache-2.0 |
| ACE-Step-v1.5-XL-sft (base) | No disponible | No disponible | No publicado | Apache-2.0 |

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial de los pesos originales de ModelScope. Aunque se declara que los archivos no han sido modificados, no hay una verificacion independiente de integridad.
- El adaptador solo funciona con el modelo base ACE-Step-v1.5-XL-sft; no es compatible con otras versiones o modelos.
- No se han publicado evaluaciones sobre sesgos o alucinaciones especificas de este adaptador, aunque el modelo base podria presentar sesgos en la generacion de letras o estilos musicales segun los datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar que el modelo base tambien cumple con sus requisitos de licencia.
- La generacion de musica con letras en idiomas distintos al chino puede tener una calidad inferior, ya que el modelo base esta entrenado principalmente con datos en chino.
- No se proporcionan garantias de rendimiento en produccion; se recomienda realizar pruebas exhaustivas antes de integrar el modelo en aplicaciones criticas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rtikw/acestep15xlsft-lora-piano
- Fuente original en ModelScope: https://modelscope.cn/models/DiffSynth-Studio/acestep15xlsft-lora-piano
- Repositorio del modelo base ACE-Step-1.5: https://github.com/ace-step/ACE-Step-1.5
- Documentacion de DiffSynth-Studio: https://github.com/modelscope/DiffSynth-Studio
- Tutorial de inferencia con LoRA (GitHub Issue): https://github.com/ace-step/ACE-Step-1.5/issues/1248
- Coleccion de LoRA de mejora en ModelScope: https://modelscope.ai/collections/DiffSynth-Studio/ACE-Step-v15-XL-Enhancement-LoRAs

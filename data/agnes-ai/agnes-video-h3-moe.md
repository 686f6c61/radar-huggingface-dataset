# Agnes-AI/Agnes-Video-H3-MoE

## Resumen

Agnes-Video-H3-MoE es un checkpoint experimental publicado por Agnes-AI que convierte parte de las capas feed-forward del modelo de generación de vídeo y audio MiniMax-H3 FL2VA en una mezcla de expertos (MoE) dispersa a nivel de token. Concretamente, transforma los bloques DiT 15 a 34 (20 de los 50 bloques totales) en un esquema en el que cada token ejecuta un experto compartido siempre activo y selecciona uno de ocho expertos privados mediante un router entrenado. El modelo base es MiniMaxAI/MiniMax-H3, un sistema text-to-video con audio, y este paquete se distribuye como *finetune* del mismo.

El repositorio no es un checkpoint fusionado, sino un paquete compuesto: incluye los pesos originales de FL2VA en BF16, los datos de inicialización de expertos, un checkpoint entrenado de router y LoRA (paso 60 de entrenamiento) y un cargador de referencia para DiffSynth. Cargar únicamente el directorio `FL2VA/` ejecuta el modelo denso original. La relevancia de esta publicación es fundamentalmente de investigación: explora si la dispersión MoE aplicada a un modelo de difusión para vídeo permite aumentar la capacidad efectiva sin incrementar proporcionalmente el coste de cómputo por token.

El modelo genera vídeo con audio sincronizado a partir de texto, con condicionamiento opcional por primer fotograma, último fotograma o ambos. El repositorio ocupa 144,8 GB y acumula 2277 descargas en el momento de la consulta. La licencia es la MiniMax-H3 Community License Agreement, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con FFN convertidas a MoE dispersa top-1 más experto compartido en bloques 15-34 |
| Parametros totales | no disponible |
| Parametros activos | 1 experto compartido (ancho 3072) + 1 de 8 expertos privados (ancho 6144) por token en las capas convertidas |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; el paquete incluye LoRA de rango 64) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (other) |
| Formato de pesos | safetensors (paquete compuesto con `FL2VA/`, datos de inicialización de expertos, router/LoRA y cargador DiffSynth) |

## Arquitectura y entrenamiento

El modelo parte de MiniMax-H3 FL2VA, un transformer de difusión (DiT) de 50 bloques con FFN densas de anchura 14 336. La modificación sustituye las FFN de los bloques 15 a 34 por un módulo MoE con un experto compartido de anchura 3072, siempre activo, y ocho expertos privados de anchura 6144 cada uno. El enrutamiento es top-1 por token: cada token selecciona un único experto privado, de modo que tokens distintos dentro del mismo vídeo pueden activar expertos diferentes. Esta granularidad a nivel de token, en lugar de a nivel de secuencia, es la innovación principal del checkpoint.

El entrenamiento se limita a los routers y a una LoRA de rango 64 y alpha 64; los pesos del modelo base permanecen congelados. El checkpoint publicado corresponde al paso 60 de entrenamiento, lo que indica una fase experimental temprana. El paquete incluye además datos de inicialización de expertos y un cargador de referencia para DiffSynth. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio sincronizado.
- Generación condicionada por primer fotograma (first-frame), último fotograma (last-frame) o ambos, gracias a la base FL2VA.
- Generación de audio asociado al vídeo: diálogo, voz en off, efectos de sonido y música, según los ejemplos publicados.
- Enrutamiento MoE disperso por token, que permite que distintas regiones o tokens del vídeo activen expertos diferentes.
- Soporte de LoRA para adaptación y carga mediante el cargador de referencia de DiffSynth.
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de clips publicitarios cortos con audio: el modelo produce vídeos de aproximadamente 10 segundos con vídeo y audio sincronizados, adecuado para prototipos de anuncios y pruebas de concepto creativas.
- Previsualización de guiones y storyboards: a partir de una descripción textual detallada se pueden generar escenas con diálogo y efectos, útil en fases de preproducción audiovisual.
- Animación con continuidad entre fotogramas: el condicionamiento por primer y último fotograma permite generar transiciones controladas entre dos imágenes, útil para insertos y transiciones en montaje.
- Investigación en arquitecturas MoE para difusión: el paquete compuesto con routers, LoRA e inicialización de expertos sirve como base reproducible para estudiar el efecto de la dispersión en modelos de vídeo.
- Generación de contenido para redes sociales: clips cortos con voz y sonido ambiente generados a partir de prompts, con coste controlado al no requerir equipo de grabación.
- Doblaje y locución sintética en vídeo: los ejemplos muestran sincronización labial con el texto cantado o hablado, aplicable a pruebas de localización de contenido.
- Docencia y demostraciones técnicas: al incluir el modelo denso original y el cargador de referencia, permite comparar el comportamiento denso frente al MoE en el mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente ejemplos cualitativos (tres clips de unos 10 segundos) y advierte que fueron generados con una ruta de inferencia AdaLN interna no incluida en el repositorio, por lo que no se garantiza que el script de referencia reproduzca esos resultados.

## Requisitos de hardware

- El repositorio completo ocupa 144,8 GB, por lo que el almacenamiento necesario para descargarlo y cargarlo es considerable.
- Los pesos se publican en BF16; la VRAM necesaria para inferencia no está documentada en la información disponible.
- No se especifican GPU recomendadas (A100, H100, RTX 4090 u otras) en la información proporcionada.
- No se confirma que el modelo quepa en GPU de consumo; el tamaño del paquete y la naturaleza del modelo base sugieren requisitos de gama alta, pero no hay datos oficiales.
- Opciones de despliegue: el repositorio incluye un cargador de referencia para DiffSynth. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Agnes-Video-H3-MoE | no disponible (MoE en 20 de 50 bloques) | no disponible | Text-to-video con audio, MoE experimental | MiniMax-H3 Community License | Hugging Face, 2277 descargas |
| MiniMax-H3 FL2VA (base) | no disponible | no disponible | Text-to-video con audio, denso | MiniMax-H3 Community License | Hugging Face (MiniMaxAI/MiniMax-H3) |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con el modelo base del que deriva. No se han encontrado en la búsqueda web datos de otros modelos de vídeo comparables con especificaciones verificables.

## Limitaciones y advertencias

- Checkpoint experimental en el paso 60 de entrenamiento: no es un modelo final ni validado para producción.
- Los ejemplos cualitativos de la model card se generaron con una ruta de inferencia AdaLN interna no incluida en el repositorio; el script público de referencia puede no reproducirlos.
- El repositorio es un paquete compuesto, no un checkpoint fusionado: requiere cargar correctamente `FL2VA/`, los datos de inicialización de expertos y el router/LoRA, además del cargador DiffSynth.
- Solo se convierten 20 de los 50 bloques DiT a MoE; el resto mantiene FFN densas, lo que limita el alcance de la dispersión.
- Licencia MiniMax-H3 Community License Agreement: es necesario revisar sus términos antes de cualquier uso comercial, ya que no es una licencia open source estándar.
- No hay información sobre sesgos, riesgo de alucinación visual o de audio, ni sobre limitaciones idiomáticas.
- El tamaño del paquete (144,8 GB) y la ausencia de datos de VRAM dificultan la planificación de despliegues.
- No se documentan mecanismos de seguridad, filtros de contenido ni evaluaciones de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Agnes-AI/Agnes-Video-H3-MoE
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Aplicación de Agnes-AI: https://app.agnes-ai.com/
- Ejemplos de vídeo: https://huggingface.co/Agnes-AI/Agnes-Video-H3-MoE/resolve/main/examples/case603.mp4, https://huggingface.co/Agnes-AI/Agnes-Video-H3-MoE/resolve/main/examples/case674.mp4, https://huggingface.co/Agnes-AI/Agnes-Video-H3-MoE/resolve/main/examples/case710.mp4

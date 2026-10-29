# RunningHubAI/rh-extreme-close-up-lora

## Resumen

`rh-extreme-close-up-lora` es un adaptador LoRA para edición y generación de imagen condicionada por texto (pipeline `image-text-to-image`), publicado por RunningHubAI en Hugging Face. No es un modelo de lenguaje: se trata de un conjunto de pesos de bajo rango (un único fichero `safetensors` de 218 MiB) que se aplica sobre un modelo base de difusión identificado en la model card como `krea2`, y cuyo propósito declarado es producir retratos en primer plano extremo (*extreme close-up*).

El repositorio lo publica la plataforma RunningHub en nombre de un autor de su comunidad, y la model card enlaza como origen a una ficha de Civitai. Según esa misma card, el adaptador se activa mediante la palabra clave `HMCockFace` y el checkpoint distribuido corresponde a la época 30 del entrenamiento. El enlace de origen apunta a contenido de carácter explícito, por lo que el modelo debe tratarse como material potencialmente NSFW.

La relevancia práctica es limitada pero concreta: sirve como ejemplo de LoRA de estilo/encuadre para flujos de ComfyUI, no aporta ninguna innovación arquitectónica y no incluye documentación de dataset, hiperparámetros ni evaluación cuantitativa. Con 0 descargas y 0 *likes* en el momento de la consulta, carece de validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base de difusion denominado `krea2`; la arquitectura del base no se detalla en la model card |
| Parametros totales | no disponible (peso distribuido: 218 MiB, fichero `HMCockFace_krea2_epoch30.safetensors`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de difusion; no se documenta la resolucion de entrenamiento) |
| Tipos de cuantizacion | no disponible (se distribuye en `safetensors`; no se indica el tipo de dato de los tensores) |
| Idiomas soportados | no disponible (la cobertura linguistica depende del codificador de texto del modelo base) |
| Licencia | no disponible (la card indica que los derechos permanecen en el autor y remite a la licencia del proyecto original, sin especificarla) |
| Formato de pesos | `safetensors` (LoRA) |
| Palabra de activacion | `HMCockFace` |
| Compatibilidad declarada | ComfyUI, plataforma RunningHub, Hugging Face |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar los pesos completos. La model card indica únicamente `Finetuned from: krea2`, sin especificar la familia o versión exacta del modelo base, el número de módulos adaptados, el rango (*rank*), el alpha ni qué capas se han entrenado. Tampoco se documenta si el adaptador afecta solo al bloque de atención cruzada, al transformer completo o también al codificador de texto.

No hay información sobre el dataset de entrenamiento: ni número de imágenes, ni resolución, ni proceso de capturado o etiquetado, ni si se emplearon regularización o *caption dropout*. El nombre del fichero (`epoch30`) sugiere un entrenamiento por épocas con selección del checkpoint final en la época 30, pero no se indica la curva de pérdida ni si se comparó con checkpoints intermedios, por lo que no es posible descartar sobreajuste. No se mencionan técnicas de RLHF, DPO ni ninguna innovación de inferencia (decodificación especulativa, atención lineal, *guidance* destilado) — conceptos, por otra parte, propios de modelos de lenguaje y no aplicables aquí.

## Capacidades

- Generación y edición de imágenes a partir de texto e imagen de entrada (`image-text-to-image`), heredando las capacidades del modelo base `krea2`.
- Modificación de encuadre hacia primeros planos extremos: el adaptador está orientado a forzar composiciones de rostro/detalle muy cercanas.
- Activación mediante la palabra clave `HMCockFace`, que debe incluirse en el prompt para que el efecto del LoRA se manifieste.
- Integración nativa en flujos de ComfyUI, con carga como nodo `Load LoRA` sobre el modelo base correspondiente.
- Ejecución en la plataforma RunningHub, que ofrece inferencia alojada y acceso por API.
- Soporte de *tool calling*, agentes, razonamiento multi-paso, matemáticas o código: no disponible (no aplica a este tipo de modelo).
- Capacidades multilingües: no disponible; dependen del codificador de texto del base y no se documentan.
- Capacidad especial: ninguna declarada más allá del control de encuadre/estilo.

## Casos de uso

- Retrato editorial de detalle: uso del LoRA en ComfyUI para generar primeros planos extremos de rostro (ojos, piel, labios) en pruebas de concepto de maquetación de revista, aprovechando que el adaptador empuja la composición hacia ese encuadre concreto.
- Pruebas de maquillaje y caracterización: generación de variantes de close-up facial para validar paletas, texturas de piel o prótesis antes de una sesión fotográfica real, reduciendo el coste de un shooting de prueba.
- Prototipado de creatividades para cosmética y dermocosmética: iteración rápida sobre imágenes de detalle de piel y ojos para banners y fichas de producto, siempre que la licencia del modelo base lo permita.
- *Storyboarding* y previsualización audiovisual: generación de planos detalle para secuencias que requieren inserts de rostro, integrables en un pipeline ComfyUI que produzca el resto de planos con el mismo modelo base.
- Investigación sobre adaptadores LoRA: caso de estudio de cómo un adaptador de 218 MiB modifica la distribución de encuadres de un modelo de difusión, útil para experimentos de medición de sesgo composicional.
- Docencia y divulgación técnica: ejemplo mínimo de LoRA de un solo fichero para explicar en talleres cómo se carga, se activa con *trigger word* y se combina con otros adaptadores en ComfyUI.
- Automatización vía API: despliegue del flujo en RunningHub y consumo mediante su API para generar lotes de imágenes de forma programática, con la salvedad de la licencia y del contenido potencialmente explícito.
- Aviso: dado el enlace de origen en Civitai, varios de estos casos solo son viables en entornos con moderación de contenido y con una revisión legal previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas objetivas (FID, CLIP score, similitud de identidad, *aesthetic score*), ni comparaciones cuantitativas con otros LoRA de encuadre, ni ablaciones sobre el número de épocas. Tampoco se documenta el coste de inferencia del adaptador.

## Requisitos de hardware

- VRAM: no disponible como cifra propia; el adaptador añade solo 218 MiB, por lo que el requisito real lo determina el modelo base `krea2`, cuya huella de memoria no se especifica en la información proporcionada.
- GPU recomendadas: no disponible. Como referencia técnica general, un LoRA se carga en el mismo dispositivo que el transformer del modelo base, de modo que si el base cabe en una GPU dada, el adaptador también; no hay recomendación oficial del autor.
- GPU de consumo: no se puede confirmar sin conocer los requisitos del base. El adaptador en sí no es un impedimento para ejecutar en GPU de consumo.
- Opciones de despliegue: ComfyUI (soporte nativo, es la plataforma etiquetada), plataforma RunningHub (incluye API HTTP), descarga directa desde Hugging Face. La carga en `diffusers` mediante `load_lora_weights` es plausible al ser un `safetensors`, pero no está verificada en la documentación y el mapeo de claves puede requerir conversión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros / tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RunningHubAI/rh-extreme-close-up-lora` | LoRA sobre `krea2`, `image-text-to-image` | 218 MiB (adaptador) | no aplica | no disponible | Hugging Face, RunningHub |
| `RunningHubAI/rh-lora-xl-lora` | LoRA, `text-to-image`, mismo autor/plataforma | no disponible | no aplica | no disponible | Hugging Face |
| Otros LoRA de encuadre/retrato de la misma categoria | LoRA | no disponible | no aplica | variable | Civitai, Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparación cuantitativa con alternativas. La comparativa se limita, por tanto, a tipo de artefacto, tamaño del fichero y canal de distribución.

## Limitaciones y advertencias

- Contenido potencialmente explícito: la model card enlaza como origen a una ficha de Civitai cuyo título y palabra de activación remiten a material NSFW. No es apto para productos dirigidos al público general ni para entornos sin moderación.
- Licencia indeterminada: la card no declara licencia y remite a la del proyecto original, que tampoco se identifica. El uso comercial no está autorizado de forma explícita y requeriría consultar al autor.
- Sin documentación de entrenamiento: no hay información sobre dataset, resolución, rango del LoRA ni hiperparámetros, lo que impide evaluar riesgo de sobreajuste o de memorización de imágenes concretas.
- Sesgos desconocidos: al no documentarse la composición del dataset, no es posible caracterizar sesgos de edad, etnia, género o tipo de piel en los rostros generados.
- Riesgo de artefactos anatómicos: los encuadres de primer plano extremo son propensos a deformaciones en ojos, dientes y textura de piel, especialmente al combinar el LoRA con otros adaptadores o con pesos altos.
- Dependencia del modelo base: requiere la versión exacta de `krea2` con la que se entrenó; aplicarlo sobre otra familia (por ejemplo, SDXL o Flux estándar) producirá resultados degenerados.
- Sensibilidad al *prompt*: el efecto depende de incluir la palabra de activación y de la redacción del prompt; el autor remite a "ver los prompts por tu cuenta" en el enlace de origen, sin提供 ejemplos en la card.
- Idiomas: no se documenta cobertura linguistica; prompts en castellano pueden funcionar peor que en inglés si el codificador de texto del base está sesgado hacia ese idioma.
- Madurez: 0 descargas y 0 *likes* en el momento de la consulta, sin issues ni validación de terceros. No hay garantía de mantenimiento ni de soporte.
- Metadatos incompletos: pipeline `image-text-to-image` con un único fichero; no se indica si requiere un VAE o un codificador de texto adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-extreme-close-up-lora
- Ficha original en RunningHub: https://www.runninghub.ai/model/public/2073434368001003521
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Origen declarado en Civitai (contenido potencialmente explicito): https://civitai.red/models/2753674/hmcockface-cock-on-face-krea2?modelVersionId=3098191
- RunningHub (plataforma): https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Modelo relacionado del mismo autor: https://huggingface.co/RunningHubAI/rh-lora-xl-lora

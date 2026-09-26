# RunningHubAI/rh-krea-2-arknights-endfield-lora

## Resumen

rh-krea-2-arknights-endfield-lora es un adaptador LoRA de edición y generación de imagen desarrollado por RunningHub (cuenta @AIGC工作站) y publicado en Hugging Face. El adaptador se ha entrenado sobre el modelo base Krea2 para reproducir el estilo visual de las ilustraciones de invocación ("gacha splash art") del videojuego Arknights: Endfield, incluyendo su tratamiento de materiales, iluminación y estética sci-fi de vertiente post-apocalíptica.

No se trata de un modelo de lenguaje ni de un modelo fundacional: es un peso adicional de 218 MiB en formato safetensors que se carga junto al modelo base y se activa mediante la palabra de disparo `ANEF style`. Su pipeline declarado es image-text-to-image, y la integración principal es ComfyUI, con soporte de ejecución en la nube y vía API a través de la propia plataforma RunningHub.

La relevancia del repositorio es acotada y muy específica: sirve a ilustradores y creadores que quieran producir personajes originales o fan art con un estilo coherente de carta coleccionable, con fondo despejado y figura "rompiendo el marco". Es importante señalar que el repositorio no documenta licencia, idiomas soportados, parámetros del adaptador, datos de entrenamiento ni benchmarks, y que en el momento de la ficha cuenta con 0 descargas y 0 valoraciones, por lo que no existe validación comunitaria del resultado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo de difusión de imagen (base: Krea2). Arquitectura interna del modelo base no disponible |
| Parámetros totales | no disponible (el archivo de pesos ocupa 218 MiB; no se documenta rango, alpha ni número de parámetros) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; no se documenta resolución nativa ni ventana de tokens de texto) |
| Tipos de cuantización | no disponible (se distribuye únicamente en safetensors; no se publican variantes GGUF, fp8 ni cuantizadas) |
| Idiomas soportados | no disponible (la model card está en chino e inglés; no se declaran idiomas de los prompts) |
| Licencia | no disponible (la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`0173NN38Q4D0H14V4DJEG525C0.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre el modelo base Krea2. No se publica información sobre el rango de la descomposición, el escalado alpha, las capas objetivo ni el número de pasos de entrenamiento. Tampoco se detalla si el adaptador modula solo los bloques de atención cruzada de texto o también las capas de atención espacial y de convolución, algo habitual en LoRA para modelos de difusión.

El único detalle técnico de entrenamiento que aporta la model card es que el etiquetado de las imágenes se realizó con lenguaje natural mediante un VLM (modelo de visión-lenguaje), en lugar de con etiquetas por palabras clave. Esa decisión condiciona por completo la forma de escribir los prompts: el autor recomienda frases largas en lenguaje natural, declarar explícitamente el fondo (`against a pure white background`) y describir los elementos de fondo como fragmentos geométricos abstractos en lugar de paisajes realistas, con el fin de evitar que el modelo rellene todo el encuadre. No se documentan técnicas de regularización, dataset de captions, número de imágenes ni proceso de curación.

## Capacidades

- Generación de ilustraciones en estilo "gacha splash art" de Arknights: Endfield a partir de un prompt de texto, mediante la palabra de disparo `ANEF style`.
- Edición imagen a imagen (pipeline declarado image-text-to-image), lo que permite partir de una imagen de referencia y reestilizarla.
- Reproducción de rasgos estilísticos concretos: tratamiento de materiales, reflejos, iluminación dramática y estética sci-fi de vertiente post-apocalíptica.
- Composición con figura destacada sobre fondo despejado y amplio espacio en blanco, siempre que se fuerce en el prompt.
- Integración nativa en ComfyUI como nodo de carga de LoRA.
- Ejecución en la nube y vía API a través de la plataforma RunningHub, sin necesidad de infraestructura propia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento, ya que no es un modelo de lenguaje.

## Casos de uso

- Fan art de personajes de Arknights: Endfield: el adaptador reproduce el estilo de las ilustraciones de invocación oficiales, de modo que un ilustrador puede generar bocetos o composiciones completas de operadores con la estética del juego usando `ANEF style` más una descripción en lenguaje natural.
- Creación de personajes originales con estética de carta coleccionable: al no depender de un personaje concreto, permite diseñar operadores propios y presentarlos como si fueran una carta de gacha, útil para proyectos de rol, novelas visuales o setting personal.
- Prototipado de key art para videojuegos indie: equipos pequeños pueden generar conceptos rápidos de personajes con acabado de ilustración promocional antes de encargar el arte final a un ilustrador humano.
- Generación por lotes integrada en ComfyUI: al ser un LoRA de 218 MiB, se puede encadenar en un workflow de ComfyUI con otros nodos (upscale, control de pose, IP-Adapter) para producir variaciones sistemáticas de un mismo personaje.
- Producción en la nube mediante API de RunningHub: para estudios sin GPU propia, el adaptador puede invocarse a través de la API de la plataforma, lo que facilita la generación desatendida de imágenes en pipelines automatizados.
- Material para comunidades y redes: creación de avatares, banners o portadas con estética de carta de invocación, un formato muy demandado en comunidades de gacha.
- Pruebas de concepto de merchandising (prints, fundas, pósteres): el estilo está pensado para composiciones con mucho espacio en blanco, lo que encaja con formatos de impresión donde se necesita zona libre alrededor de la figura. Requiere verificar antes los derechos sobre la propiedad intelectual subyacente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, similitud estilística), comparativas con otros LoRA ni ejemplos de imágenes en el texto proporcionado. Tampoco se documenta el tiempo de inferencia ni el número de pasos recomendado.

## Requisitos de hardware

- VRAM del adaptador: el archivo LoRA ocupa 218 MiB, por lo que su huella adicional en memoria es mínima en comparación con el modelo base.
- VRAM total: depende por completo del modelo base Krea2, cuyos requisitos no se documentan en este repositorio. Cualquier cifra concreta sería una estimación no atribuible al autor.
- GPU recomendadas: no disponible en la información proporcionada. El adaptador, por su tamaño, no impone por sí mismo requisitos de gama alta.
- GPU de consumo: previsiblemente compatible con GPU de consumo si el modelo base Krea2 ya lo es, pero este dato no está confirmado en la ficha del repositorio.
- Opciones de despliegue: ComfyUI (indicado explícitamente en las etiquetas y en la model card) y la plataforma en la nube RunningHub, tanto de forma interactiva como mediante API. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de imagen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros adaptadores LoRA comparables (ni de estilo Arknights, ni de estilo gacha en general) con los que establecer una comparación de parámetros, contexto, rendimiento o licencia. La única referencia técnica es el modelo base Krea2, del que el repositorio no aporta especificaciones.

## Limitaciones y advertencias

- Licencia no declarada: la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o upstream, sin especificar cuál es. Esto hace arriesgado el uso comercial sin consultar previamente con el autor.
- Propiedad intelectual de terceros: el estilo deriva de Arknights: Endfield, obra de Hypergryph. La generación y, sobre todo, la comercialización de imágenes con esa estética o con personajes reconocibles puede infringir derechos de la titular.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin ejemplos de salida publicados en el repositorio que permitan evaluar la fidelidad real del estilo.
- Dependencia del prompt: el autor advierte explícitamente de que el etiquetado se hizo con lenguaje natural, por lo que prompts cortos o basados en tags probablemente den resultados pobres; hay que usar frases largas y declarar el fondo.
- Riesgo de fondo saturado: si no se fuerza el fondo blanco o abstracto, el modelo tiende a rellenar todo el encuadre, lo que rompe el efecto de carta de invocación.
- Dependencia estricta del modelo base: el LoRA solo funciona sobre Krea2; no es utilizable de forma autónoma ni se garantiza su comportamiento sobre otras bases.
- Ausencia de datos de entrenamiento: sin información sobre dataset, número de imágenes ni posibles sesgos, no es posible evaluar la representatividad de los personajes generados ni sesgos de género, etnia o complexión.
- Documentación parcial: no hay ficha en español, ni especificación de resolución nativa, ni parámetros de muestreo recomendados (salvo el peso 1, que el propio autor indica ajustar según resultados).
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede producir anatomías incorrectas, texto ilegible y detalles incoherentes, especialmente en manos y elementos mecánicos.
- Fecha de publicación inusual: el repositorio figura como creado el 2026-09-26, dato que conviene contrastar en la propia página de Hugging Face antes de citarlo.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-krea-2-arknights-endfield-lora
- Model card en chino: https://huggingface.co/RunningHubAI/rh-krea-2-arknights-endfield-lora/blob/main/README_cn.md
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2072844960625422338
- Página del autor (@AIGC工作站): https://www.runninghub.cn/user-center/1998616841276772354
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model

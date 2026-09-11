# Haoming02/IdolyPride-Anima

## Resumen
IdolyPride-Anima es un adaptador LoRA (Low-Rank Adaptation) de difusión para generación de imágenes a partir de texto, publicado por el usuario Haoming02 en HuggingFace. Su función es incorporar al modelo base circlestone-labs/Anima (versión Base-v1.0) la capacidad de generar personajes concretos de la franquicia Idoly Pride, con sus nombres, uniformes y elementos de vestuario característicos. No es un modelo de lenguaje ni un modelo generativo autónomo: es un complemento que debe cargarse junto al modelo base.

El repositorio ocupa 0,3 GB e incluye los pesos del adaptador y una galería de imágenes de muestra (webp) por personaje. Está etiquetado con el pipeline text-to-image y la librería diffusers, y se distribuye bajo licencia Apache 2.0. El prompt de instancia declarado es "idoly pride" y el token de activación indicado en los ejemplos del autor es `<lora:animaAipura:1.0>`.

La relevancia de esta ficha es acotada y muy específica: cubre 21 personajes de Idoly Pride, desde las integrantes de unidades como Sunny Peace, Tsuki no Tempest, TrinityAiLe y Liznoir hasta secundarias como Fran, Kana y Miho. Interesa a quien quiera generar fan-art o assets de esa franquicia sin entrenar su propio adaptador, siempre que trabaje sobre Anima v1.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre un modelo de difusión text-to-image; la arquitectura del modelo base no se detalla en la información proporcionada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión, no de lenguaje; sin ventana de contexto en tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio compatible con la librería diffusers) |
| Tipo de modelo | LoRA de difusión (text-to-image) |
| Modelo base | circlestone-labs/Anima (Base-v1.0) |
| Pipeline | text-to-image |
| Prompt de instancia | idoly pride |
| Token LoRA de ejemplo | `<lora:animaAipura:1.0>` |
| Tamaño del repositorio | 0,3 GB |
| Personajes cubiertos | 21 (Mana, Kotono, Nagisa, Saki, Suzu, Mei, Sakura, Shizuku, Chisa, Rei, Haruko, Rui, Yuu, Sumire, Rio, Aoi, Ai, Kokoro, Fran, Kana y Miho) |
| Fecha de creación (metadatos) | 11 de septiembre de 2026 |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento
Se trata de un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo de difusión base para modificar su comportamiento sin reentrenar todos los pesos. El modelo base es circlestone-labs/Anima en su versión Base-v1.0, un generador de imágenes a partir de texto orientado a ilustración de estilo anime. La información publicada no especifica el rango (rank), el valor alpha, las capas objetivo, el número de pasos de entrenamiento, el tamaño del dataset, la resolución de entrenamiento ni si se emplearon técnicas de regularización o de captions automáticos.

Tampoco se documentan innovaciones técnicas propias más allá del propio procedimiento LoRA. El autor únicamente indica que el adaptador funciona con Anima Base-v1.0 y enlaza su interfaz Forge Neo como método recomendado de ejecución. Los prompts de ejemplo mezclan etiquetas de calidad genéricas del ecosistema anime ("masterpiece, best quality, good quality, absurdres, newest", "anime coloring", "anime screenshot") con el token del LoRA y la descripción del personaje, lo que sugiere que el entrenamiento se apoyó en datasets etiquetados con la convención habitual de Danbooru (nombre del personaje, franquicia, nombre del vestuario y complementos).

## Capacidades
- Generación de imágenes text-to-image de personajes de Idoly Pride sobre el modelo base Anima v1.0.
- Reconocimiento de nombres canónicos de 21 personajes, con sus variantes de etiquetado: nagase mana, nagase kotono, ibuki nagisa, shiraishi saki, narumiya suzu, hayasaka mei, kawasaki sakura, hyodou shizuku, shiraishi chisa, ichinose rei, saeki haruko, tendou rui, suzumura yuu, okuyama sumire, kanzaki rio, igawa aoi, komiyama ai, akazaki kokoro, yamada kaori, kojima kana y takeda mihoko.
- Reproducción de vestuarios concretos por unidad: yame idol costume (Mana), tsuki no tempest costume (Kotono, Nagisa, Saki, Suzu, Mei), sunny peace costume (Sakura, Shizuku, Chisa, Rei, Haruko), trinityaile costume (Rui, Yuu, Sumire) y liznoir costume (Rio, Aoi, Ai, Kokoro).
- Generación de detalles de vestuario y accesorios mediante etiquetas específicas: black thigh boots, blue knee boots, red thigh boots, white thigh boots, grey socks, fishnets, black high heels, feather earrings.
- Composición de escena y encuadre a través del prompt: retrato, plano medio, "looking at viewer", expresiones (sonrisa, rubor), gestos (heart hands) y fondos (gradient background, polka dot background, white outline).
- Aplicación de estilos globales heredados del modelo base: anime coloring, anime screenshot.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión de entrada, audio ni modo de pensamiento: son capacidades ajenas a un modelo de difusión de texto a imagen.

## Casos de uso
- Ilustración fan-art de Idoly Pride: el adaptador permite generar a cualquiera de los 21 personajes con su uniforme canónico a partir de una etiqueta corta, sin necesidad de describir el diseño del personaje en el prompt.
- Creación de avatares y retratos para comunidades de fans: los ejemplos del autor producen retratos cuadrados con expresiones y fondos controlados (gradiente o lunares), útiles como imagen de perfil en foros, discords o redes.
- Assets para proyectos doujin no comerciales: fondos de pantalla, pósteres o portadas de fanzines, combinando el token del LoRA con etiquetas de composición y estilo.
- Prototipado visual para juegos o aplicaciones de fans: generación rápida de variaciones de un mismo personaje en distintos vestuarios para explorar direcciones de arte antes de encargar ilustración final.
- Referencia de vestuario y caracterización: el modelo reconoce las etiquetas de cada unidad, lo que sirve para producir láminas de referencia de indumentaria de los distintos grupos.
- Creación de escenas corales: al etiquetar varios personajes de la misma unidad con el prompt de instancia, se pueden generar composiciones de grupo de una unidad concreta (por ejemplo, las cinco integrantes de Tsuki no Tempest).
- Contenido para vídeo o presentaciones con estilo anime: generación de imágenes sueltas que después se montan en animáticas o vídeos con música, dado el estilo "anime screenshot" que el autor propone en el ejemplo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- Adaptador: el repositorio completo ocupa 0,3 GB, e incluye tanto los pesos del LoRA como las imágenes de muestra en formato webp.
- VRAM adicional en inferencia: no disponible (depende del rango del LoRA, que no se publica).
- El modelo base circlestone-labs/Anima es necesario para ejecutar el adaptador; sus requisitos de VRAM no están especificados en la información proporcionada.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no disponible para este adaptador ni para su modelo base.
- Despliegue: el autor indica Forge Neo (`sd-webui-forge-classic/tree/neo`) como interfaz de referencia. El repositorio está etiquetado para la librería diffusers, por lo que es de esperar compatibilidad con ese ecosistema. No se documenta compatibilidad con otras interfaces.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No se dispone de datos de otros adaptadores LoRA de Idoly Pride ni de sus métricas, por lo que no es posible una comparación cuantitativa. A continuación se comparan enfoques, no modelos concretos:

| Enfoque | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IdolyPride-Anima (LoRA) | no disponible | no aplica | no disponible | Apache 2.0 | HuggingFace, 0 descargas |
| Fine-tune completo del modelo base | no disponible (mucho mayor que un LoRA por definición del método) | no aplica | no disponible | no disponible | no disponible |
| Textual inversion / embedding de personaje | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- No hay benchmarks ni evaluaciones objetivas publicadas: el rendimiento real por personaje, la tasa de acierto de las etiquetas y la fidelidad al diseño original no están verificados por terceros.
- Riesgo de alucinación visual inherente a los modelos de difusión: detalles de vestuario, accesorios o rasgos pueden variar entre generaciones y no coincidir con el diseño canónico.
- El adaptador depende estrictamente de Anima Base-v1.0; sobre otras versiones del modelo base el comportamiento puede degradarse, y no se documenta compatibilidad.
- Los prompts de ejemplo están en inglés y siguen la convención de etiquetas de Danbooru; no se declaran idiomas soportados ni se garantiza que prompts en castellano funcionen igual.
- La licencia Apache 2.0 cubre los pesos del adaptador, pero no los derechos sobre la propiedad intelectual de Idoly Pride. Los personajes, sus nombres y sus diseños pertenecen a sus titulares; el uso comercial de imágenes generadas con estos personajes puede infringir derechos de autor o de marca y requiere valoración legal independiente.
- Al estar entrenado sobre una franquicia concreta, el adaptador puede introducir sesgos estilísticos (paleta, proporciones, tipo de línea) que arrastren a todas las generaciones, incluso cuando se pretenda otro estilo.
- Puede interferir con otros LoRA cargados simultáneamente y provocar sobreajuste del personaje frente al prompt de escena.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria que confirme calidad o reproducibilidad.
- No hay información sobre el proceso de entrenamiento, los datos utilizados ni posibles sesgos de representación entre personajes.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Haoming02/IdolyPride-Anima
- Modelo base Anima: https://huggingface.co/circlestone-labs/Anima
- Perfil del autor: https://huggingface.co/Haoming02
- Interfaz recomendada por el autor (Forge Neo): https://github.com/Haoming02/sd-webui-forge-classic/tree/neo
- Sitio oficial de la franquicia Idoly Pride: https://idolypride.jp/
- Búsqueda web: los resultados obtenidos no guardan relación con este modelo ni aportan documentación adicional (se refieren a generadores de imágenes genéricos de terceros), por lo que no se incluyen.

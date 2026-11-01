# darask0/krea2-json-bbox-layout-ja-lora

## Resumen

Krea 2 JSON/BBOX Layout + Japanese Manga LoRA es un adaptador LoRA de rango 64 desarrollado por el usuario darask0 sobre el modelo base krea/Krea-2-Raw. Su funcion es condicionar la generacion de imagenes de Krea 2 mediante una especificacion JSON que describe la composicion de la pagina: paneles, personajes, globos de dialogo, texto y simbolos manga, cada uno con su caja delimitadora en coordenadas absolutas de pixel en formato `xyxy`. Ademas del control de layout, el adaptador renderiza dialogo en japones, bocadillos y marcas simbolicas propias del manga (lineas de foco, lineas de velocidad, marcas de emocion).

El modelo resuelve un problema concreto en la generacion de paginas de manga asistida: la mayoria de modelos de difusion no respetan instrucciones espaciales precisas ni generan texto japones legible dentro de los globos. Este LoRA traslada el control de layout a un esquema JSON estructurado, lo que permite integrar la generacion en pipelines programaticos donde la composicion se decide antes de la sintesis de imagen.

El adaptador se entreno localmente en una RTX PRO 6000 de 96 GB a partir de 353 paginas de manga japones con revision manual, durante 3000 pasos. El repositorio publico pesa 0,4 GB y contiene unicamente el LoRA de layout y las hojas de evaluacion; los LoRA de personajes que aparecen en las comparativas son archivos locales separados y no se distribuyen. El dataset de entrenamiento reside en un repositorio privado. La licencia se declara como "other" y el unico idioma soportado es el japones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusion Krea 2 (krea/Krea-2-Raw); rango 64 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; se recomienda `sequence_length` de 5120 para el JSON de layout |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | other |
| Formato de pesos | no disponible (repositorio de 0,4 GB, compatible con el ecosistema Krea 2) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 64 acoplado al modelo base krea/Krea-2-Raw, un modelo de difusion para generacion de imagenes. El adaptador no modifica la arquitectura del modelo base: inyecta matrices de bajo rango en las capas del transformer de difusion para que este aprenda a interpretar el esquema JSON de layout y a renderizar texto japones y simbolos manga en las regiones indicadas.

El entrenamiento se realizo localmente en una RTX PRO 6000 con 96 GB de VRAM, partiendo de 353 paginas de manga japones con revision manual, filtradas a partir de las etiquetas `manga_page` y `koma` de Gelbooru con rating general. Se ejecutaron 3000 pasos. No se documenta en la informacion disponible el numero de tokens, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en adaptadores LoRA de difusion). La innovacion principal es el condicionamiento espacial mediante cajas `xyxy` en espacio absoluto de pixeles y la aplicacion regional de LoRA de personaje por item del JSON, aunque esta ultima es una funcionalidad del codebase de inferencia complementario, no del propio adaptador.

## Capacidades

- Control de layout mediante JSON con cajas delimitadoras absolutas en formato `xyxy` para paneles, personajes, texto y simbolos manga.
- Generacion de paginas de manga con multiples paneles, incluyendo orden de lectura (`reading_order`) por panel.
- Renderizado de dialogo en japones dentro de globos de texto, con el contenido especificado en el campo `text` de cada item.
- Dibujo de bocadillos o globos de dialogo, lineas de foco, lineas de velocidad y marcas de emocion propias del manga.
- Direccion aproximada de posicion y tamano de cada elemento segun su caja delimitadora.
- Soporte de LoRA de personaje aplicados por region mediante el campo `"lora": "<alias>"` en los items de tipo personaje (funcionalidad del codebase de inferencia complementario).
- Capacidad multilingue limitada al japones en lo relativo al texto renderizado.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento multi-paso; no aplica a un adaptador de difusion.

## Casos de uso

- Generacion automatizada de paginas de manga: a partir de un guion estructurado en JSON, el adaptador compone paneles, personajes y globos con dialogo japones, lo que permite producir borradores de pagina de forma programatica sin intervencion manual del layout.
- Prototipado de storyboards: un equipo de guion puede describir la composicion de cada pagina en JSON y obtener una previsualizacion visual con la posicion y el tamano aproximados de cada elemento antes de pasar a produccion.
- Localizacion y maquetacion de manga: el control por cajas permite reservar regiones exactas para texto traducido o para reemplazar dialogos, facilitando flujos de trabajo de edicion sobre la composicion generada.
- Herramientas de asistencia a dibujantes: integracion en editores o plugins que traduzcan anotaciones de layout a imagenes de referencia con paneles, personajes y marcas de movimiento.
- Generacion de material de prueba para pipelines de vision por computador: las paginas con cajas conocidas sirven para validar detectores de paneles, globos y texto en documentos manga.
- Investigacion sobre condicionamiento espacial en modelos de difusion: el esquema JSON con cajas absolutas y la aplicacion regional de LoRA de personaje ofrecen un caso de estudio reproducible sobre control de layout y composicion multi-elemento.
- Creacion de contenido derivado con personajes consistentes: combinando el LoRA de layout con LoRA de personaje por region, se pueden generar escenas con varios personajes manteniendo su identidad aproximada en cada panel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la informacion disponible. La evaluacion del autor es visual y con una sola semilla, mediante hojas comparativas (`sheet_bbox.jpg`, `sheet_japanese_manga.jpg`, `sheet_multi.jpg`, `sheet_single_manga.jpg`). Las conclusiones declaradas son: se reproducen la direccion aproximada de posicion y tamano, el dialogo japones, los globos, las lineas de foco y velocidad y las marcas de emocion; no se garantizan la contencion exacta de las cajas, el numero de letras de los efectos de sonido ni la identidad fina de los personajes.

## Requisitos de hardware

- El entrenamiento se realizo en una RTX PRO 6000 con 96 GB de VRAM; no se documenta el consumo de VRAM en inferencia.
- Al ser un LoRA de 0,4 GB sobre Krea 2, los requisitos de VRAM en inferencia vienen determinados principalmente por el modelo base, cuyo tamano no se especifica en la informacion disponible.
- No se dispone de datos sobre si el modelo base y el adaptador caben en GPU de consumo (RTX 4090, 4080, etc.); no disponible.
- Opciones de despliegue: no se documentan en la model card; se menciona un codebase de inferencia complementario para la aplicacion regional de LoRA de personaje, sin enlace ni nombre.
- Se recomienda usar `sequence_length` de 5120 para evitar el truncamiento del JSON de layout.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA comparables de control de layout para manga japones sobre Krea 2 u otros modelos de difusion en la informacion proporcionada. No disponible.

## Limitaciones y advertencias

- La evaluacion es visual y con una sola semilla; no hay metricas cuantitativas que respalden el rendimiento.
- No se garantiza la contencion exacta de los elementos dentro de sus cajas delimitadoras: el control de posicion y tamano es aproximado.
- El numero de letras de los efectos de sonido y la identidad fina de los personajes no estan garantizados.
- El unico idioma soportado es el japones; no se documenta capacidad para otros idiomas en el texto renderizado.
- El adaptador depende del modelo base krea/Krea-2-Raw; no es utilizable de forma autonoma.
- Los LoRA de personaje mostrados en las comparativas no se incluyen en el repositorio publico y el dataset de entrenamiento es privado, lo que limita la reproducibilidad.
- La licencia se declara como "other" sin texto de licencia visible en la informacion disponible; es necesario consultar el repositorio antes de cualquier uso comercial.
- Riesgo de sesgos y de alucinacion propios de un modelo de difusion entrenado con 353 paginas de manga de Gelbooru con rating general; no se documenta ningun analisis de sesgos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/darask0/krea2-json-bbox-layout-ja-lora
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Hojas de evaluacion incluidas en el repositorio: `sheet_bbox.jpg`, `sheet_japanese_manga.jpg`, `sheet_multi.jpg`, `sheet_single_manga.jpg`
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios de codigo o demos adicionales.

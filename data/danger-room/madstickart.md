# danger-room/MadStickArt

## Resumen

MadStickArt v0.1.0 es un modelo de imagen extremadamente pequeno (12.192 parametros aprendidos) desarrollado por el usuario danger-room. No es un modelo generativo de difusion ni un transformer de vision, sino un decodificador convolucional residual de baja resolucion entrenado desde cero para rasterizar storyboards de ciencia ficcion con figuras de palo (stick figures). Recibe como entrada cuatro canales gruesos de mascaras de tinta (actores, escenario, atrezzo y movimiento) a resolucion [batch, 4, 100, 239] y produce una mascara de cobertura de tinta [batch, 1, 400, 956] que se convierte a pixeles en escala de grises.

El modelo resuelve un problema muy concreto: convertir una especificacion de escena (plano, encuadre, profundidad, tamano de plano, angulo y movimiento de camara, colocaciones exactas de actores y metadatos de produccion) en una imagen limpia de storyboard a 956 x 400 pixeles, con una relacion de aspecto exacta de 2,39:1. La salida limpia no incluye numeracion ni texto de metadatos, que se anaden mediante un overlay de texto determinista. Un planificador opcional y separado, Strands Decider 2B, se encarga de rellenar controles de escena que falten respondiendo a preguntas de eleccion tipadas; no forma parte del rasterizador ni de sus pesos.

Su relevancia es fundamentalmente de nicho y tecnica. Frente a los modelos de difusion de miles de millones de parametros, MadStickArt propone una alternativa determinista, ligera y reproducible para previsualizacion de encuadres y bloqueo espacial, ejecutable incluso en el navegador y en Apple Silicon via MPS. El repositorio pesa 0,0 GB y la licencia es Apache 2.0, lo que facilita su uso comercial sin friccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador convolucional residual de baja resolucion con PixelShuffle x4 |
| Parametros totales | 12.192 parametros aprendidos |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible (modelo de imagen, sin contexto de texto) |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en float32 |
| Idiomas soportados | Ingles (en) para las cadenas de control y metadatos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors); checkpoint CLI compatible en best.pt (cargado con weights_only=True) |
| Entrada | Mascaras de tinta float32 [batch, 4, 100, 239]: actores, escenario, atrezzo, movimiento |
| Salida | Cobertura de tinta [batch, 1, 400, 956] convertida a pixeles en escala de grises |
| Resolucion por defecto | 956 x 400 (aspecto exacto 239:100) |
| Precision de pesos | float32 |
| Libreria | pytorch |
| Pipeline declarado | image-to-image |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura es un decodificador convolucional residual propio, no un transformer ni un modelo de difusion. Las convoluciones aprendidas operan sobre la rejilla de entrada gruesa [batch, 4, 100, 239] y el modelo aprende una correccion sobre la union bilineal de los canales de entrada, es decir, refina una interpolacion inicial en lugar de generar desde ruido. Un bloque de PixelShuffle x4 eleva la resolucion hasta la salida de 956 x 400. La model card indica que soporta rejillas de entrada flexibles, aunque el entrenamiento y la evaluacion de esta version usan 956 x 400. Los pesos se distribuyen en float32.

El entrenamiento es desde cero, con supervision sintetica de tipo layout-to-image: se generan composiciones procedurales con geometria explicita y el decodificador aprende a producir pixeles nitidos a partir de los cuatro canales de tinta. No se documenta en la informacion disponible el numero de tokens o muestras de entrenamiento, la composicion exacta del dataset, ni el uso de RLHF, DPO o tecnicas de alineacion, que en cualquier caso no aplican a un decodificador de imagen. Strands Decider 2B es un planificador opcional e independiente: no es ancestro del rasterizador ni un componente de pesos empaquetado, y se limita a responder preguntas de eleccion tipadas para seleccionar controles de escena. Al usarlo por primera vez en Apple Silicon descarga su adaptador y aproximadamente 4,5 GB de pesos base de Qwen, que no vienen incluidos en este repositorio.

## Capacidades

- Rasterizacion condicionada por layout: convierte mascaras de tinta de actores, escenario, atrezzo y movimiento en una imagen de storyboard limpia a 956 x 400.
- Storyboarding de ciencia ficcion con figuras de palo: genera escenas estilizadas coherentes con el vocabulario de control definido (plano, encuadre, profundidad, tamano de plano, angulo y movimiento de camara).
- Composicion procedural de escenas: acepta story beats, composicion, staging, tamanos de plano, angulos y movimientos, colocaciones exactas de actores, numeracion secuencial y metadatos de produccion.
- Seleccion de controles de escena: mediante el planificador opcional Strands Decider 2B, que responde preguntas de eleccion tipadas en lugar de escribir descripciones de escena.
- Generacion de anotaciones: produce un PNG limpio (sin numeracion ni metadatos, y que puede conservar flechas de movimiento de camara), un PNG anotado y un sidecar JSON con metadatos, elecciones, confianza, estado de fallback y tiempos.
- Salida determinista y reproducible: el overlay de texto para numeracion y metadatos es deterministico, y se puede fijar una semilla (por ejemplo, seed=17) para la variacion de la escena.
- Ejecucion local en navegador: el decodificador neuronal real de v0.1.0 se ejecuta localmente en el navegador mediante el playground, y permite descargar PNG y JSON de escena.
- No soporta tool calling, function calling, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.

## Casos de uso

- Previsualizacion rapida de storyboards en produccion audiovisual: dado un conjunto de story beats en JSONL, el modelo genera fotogramas limpios a 956 x 400 con aspecto 2,39:1, lo que permite evaluar encuadres y composicion antes de invertir en ilustracion manual.
- Bloqueo espacial y planificacion de planos: gracias a los controles de staging, tamano de plano, angulo y movimiento de camara, se pueden comparar variantes de una misma escena variando un unico parametro y regenerando el fotograma con la misma semilla.
- Prototipado de escenas de ciencia ficcion: el vocabulario de controles y las siluetas de atrezzo incluidas permiten montar rapidamente escenas de naves, ventanas de nave o interiores espaciales sin entrenamiento adicional.
- Integracion en pipelines automatizados de guion grafico: cada fotograma genera un PNG limpio, un PNG anotado y un sidecar JSON con toda la trazabilidad, lo que facilita el versionado y la revision en herramientas de gestion de produccion.
- Herramientas educativas y de ensenanza de lenguaje cinematografico: el playground en navegador permite experimentar con encuadres y movimientos de camara sin instalar nada y comparando fotograma limpio y anotado.
- Generacion de material de referencia para artistas: los fotogramas sirven como guia de composicion y escala de actores que un ilustrador puede usar como base para un acabado posterior.
- Demostraciones y pruebas de concepto de decodificadores ligeros: con 12.192 parametros y licencia Apache 2.0, es un caso de estudio practico para investigacion sobre rasterizacion condicionada por layout en lugar de difusion.
- Ejecucion en entornos con recursos limitados: al ser un modelo de decodificacion convolucional minusculo, puede ejecutarse en CPU o en GPU integrada, lo que habilita pruebas en portatiles o en integracion continua.

## Benchmarks y rendimiento

Los siguientes resultados son los declarados por el autor en la model card (model-index) y figuran como no verificados. La evaluacion se realizo sobre un conjunto de retencion sintetico de ciencia ficcion con 279 escenas.

| Metrica | Dataset | Valor |
|---|---|---|
| IoU de primer plano (umbral de tinta 0,35) | MadStickArt synthetic sci-fi title holdout (279 escenas) | 0,8362 |
| Precision de primer plano | MadStickArt synthetic sci-fi title holdout (279 escenas) | 0,8639 |
| Recall de primer plano | MadStickArt synthetic sci-fi title holdout (279 escenas) | 0,9631 |
| Error absoluto medio por pixel | MadStickArt synthetic sci-fi title holdout (279 escenas) | 0,006018 |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros), que ademas no aplican a un modelo de rasterizacion de imagen.

## Requisitos de hardware

- VRAM para inferencia del decodificador: practicamente despreciable. Con 12.192 parametros en float32, los pesos ocupan del orden de decenas de kilobytes, por lo que cabe en cualquier GPU y en memoria de CPU.
- GPU recomendadas para el decodificador: cualquiera; el modelo cabe con enorme margen en RTX 4090, A100, H100 o GPUs integradas. No requiere GPU dedicada.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo y tambien se ejecuta en CPU. La model card documenta soporte explicito para Apple Silicon mediante MPS.
- Planificador opcional: Strands Decider ejecuta su adaptador con backend MLX en Apple Silicon, o con backend CPU. En el primer uso descarga aproximadamente 4,5 GB de pesos base de Qwen, que si condicionan los requisitos de disco y memoria. Existe un planificador determinista offline (`--planner rules`) sin pesos adicionales.
- Opciones de despliegue: el modelo tiene su propia API de carga (`madstick.hub.load_from_pretrained`) y su propio paquete, instalable con `uv` o `pip install .`. No ofrece compatibilidad con `pipeline()` de Transformers ni de Diffusers, ni con vLLM, llama.cpp, Ollama o TGI, que no aplican a esta arquitectura.
- Latencia y throughput: no disponible. La model card menciona un benchmark del pipeline en Python sobre M5 Max, pero no se incluyen cifras concretas de latencia o throughput en la informacion disponible. La ejecucion en navegador depende del dispositivo del visitante, y la rasterizacion en canvas o la variacion con semilla pueden diferir del pipeline en Python/Pillow.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (rasterizacion condicionada por layout para storyboards de figuras de palo). Se trata de una arquitectura personalizada con un vocabulario de control propio, por lo que no existe una correspondencia directa con modelos de difusion para generacion de imagen ni con modelos de lenguaje pequenos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MadStickArt v0.1.0 | 12.192 | No disponible (imagen) | IoU 0,8362 en holdout propio | Apache 2.0 | HuggingFace + playground |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ambito muy restringido: el modelo solo rasteriza layouts de storyboard con figuras de palo mediante sus cuatro canales de tinta; no genera imagenes fotorrealistas ni contenido fuera de su vocabulario de control.
- Dataset de evaluacion sintetico y propio: las metricas declaradas (IoU, precision, recall, MAE) provienen de un holdout sintetico de 279 escenas generado por el autor y estan marcadas como no verificadas. No hay validacion externa ni comparacion con conjuntos publicos.
- Riesgo de sobreajuste al pipeline de generacion: la supervision es sintetica y procede del mismo sistema de composicion procedural, por lo que el rendimiento puede degradarse ante layouts o controles fuera de la distribucion de entrenamiento.
- Dependencia externa opcional: el planificador Strands Decider 2B no esta incluido y su primer uso descarga adaptador y aproximadamente 4,5 GB de pesos base de Qwen; sin el, es necesario usar el planificador por reglas o proporcionar todos los controles explicitamente.
- Diferencias entre entornos: la model card advierte de que la rasterizacion en canvas y la variacion con semilla en el navegador pueden diferir del pipeline en Python/Pillow. En produccion conviene fijar revision (`v0.1.0`) y usar el pipeline de referencia para resultados reproducibles.
- Idiomas: los controles y metadatos estan en ingles; no se documenta soporte multilingue.
- Alcance de la publicacion: la model card indica que la publicacion no aprovisiona un servicio de inferencia alojado ni anade compatibilidad con `pipeline()` de Transformers o Diffusers, por lo que la integracion requiere usar la API propia del paquete.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Anotaciones deterministas: la numeracion y los metadatos se dibujan con un overlay de texto determinista, de modo que su estilo tipografico no es configurable mas alla de lo que exponga el pipeline.
- Licencia: Apache 2.0 permite uso comercial, pero no se documentan garantias ni soporte por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/danger-room/MadStickArt
- Playground (ejecuta el decodificador v0.1.0 en el navegador): https://huggingface.co/spaces/danger-room/MadStickArt-Playground
- Repositorio de pesos con revision fijada: `hf download danger-room/MadStickArt --revision v0.1.0`
- Papers, blogs o repositorios adicionales: no disponible en la informacion proporcionada. La busqueda web realizada devolvio unicamente definiciones de diccionario de la palabra "danger" en frances y no resultados relevantes sobre el modelo.

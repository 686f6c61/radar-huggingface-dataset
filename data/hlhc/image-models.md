# hlhc/image-models

## Resumen

`hlhc/image-models` es un repositorio espejo (*mirror*) alojado en Hugging Face que reúne ocho artefactos de pesos abiertos relacionados con la extracción de líneas y el tratamiento de imágenes: seis extractores de contornos o line-art (Informative Drawings en sus variantes realista y *coarse*, Anime2Sketch, MangaLineExtraction, HED, PiDiNet y TEED) y una cuantización de 4 bits de FLUX.2 [klein] 4B para Apple Silicon. No se trata de un modelo entrenado por el autor: según su propia model card, todos los ficheros se redistribuyen sin modificar bajo la licencia que les corresponde, y el objetivo declarado es conservarlos accesibles si un fichero upstream se elimina.

La relevancia práctica está en la reproducibilidad. Los extractores incluidos son dependencias habituales de los *pipelines* de preprocesado para ControlNet y de librerías como `controlnet_aux`; si uno de esos pesos desaparece de su repositorio original, cualquier flujo de trabajo que dependa de él deja de ser reproducible. Este espejo añade un fichero `SOURCES.md` con la tabla de procedencias y sumas de comprobación, verificables mediante `shasum -a 256`, y copia junto a cada peso su licencia original.

El repositorio ocupa 5,1 GB, fue creado y actualizado el 2026-09-20, no declara *pipeline* en Hugging Face y no especifica idiomas de uso. La licencia agregada que muestra la plataforma es `mixed-mit-apache-2.0`, que no es una licencia única: cada componente conserva la suya, con MIT como mayoritaria y Apache-2.0 en HED y en la cuantización de FLUX.2 [klein] 4B. En el momento de la consulta registra 0 descargas y 0 *likes*.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplicable al conjunto: repositorio espejo con varios modelos. Componentes de extracción de líneas basados en CNN (U-Net, HED, diseños PiDiNet/TEED) y un modelo de difusión texto-a-imagen (FLUX.2 [klein] 4B) |
| Parámetros totales | No disponible. La model card no publica recuentos por fichero; el único dato de tamaño explícito es el del componente FLUX.2 [klein] 4B |
| Parámetros activos | No aplicable (ningún componente listado se describe como MoE) |
| Longitud de contexto | No aplicable (modelos de imagen; no se documenta ventana de contexto de texto) |
| Tipos de cuantización | 4 bits en formato MLX para `flux2-klein-4b-mflux-4bit/`; el resto son ficheros `.pth` cuya precisión no se documenta en la model card |
| Idiomas soportados | No disponible (el repositorio no declara idiomas; los extractores operan sobre píxeles y son independientes del idioma) |
| Licencia | Mixta: MIT (Informative Drawings, Anime2Sketch, MangaLineExtraction, TEED), Apache-2.0 (HED / ControlNet y FLUX.2 [klein] 4B) y MIT con aviso de uso exclusivamente investigador (PiDiNet) |
| Formato de pesos | `.pth` (PyTorch) para los siete extractores de líneas; cuantización MLX (vía `mflux`) para FLUX.2 [klein] 4B |

Componentes incluidos en el espejo:

| Ruta en el repositorio | Modelo | Autores | Licencia |
|---|---|---|---|
| `informative-drawings/sk_model.pth` | Informative Drawings, generador realista | Caroline Chan, Frédo Durand, Phillip Isola (2022) | MIT |
| `informative-drawings/sk_model2.pth` | Informative Drawings, generador *coarse* | Caroline Chan, Frédo Durand, Phillip Isola (2022) | MIT |
| `anime2sketch/netG.pth` | Anime2Sketch, generador U-Net | Xiaoyu Xiang et al. | MIT |
| `manga-line-extraction/erika.pth` | MangaLineExtraction (port a PyTorch) | Chengze Li, Xueting Liu, Tien-Tsin Wong; port de ljsabc | MIT |
| `hed/ControlNetHED.pth` | HED, reimplementación de ControlNet (HED original de Xie y Tu, 2015) | Lvmin Zhang | Apache-2.0 |
| `pidinet/table5_pidinet.pth` | PiDiNet, configuración table-5 (carv4) | Zhuo Su et al. | MIT con aviso de uso investigador |
| `teed/7_model.pth` | TEED, entrenado sobre BIPED | Xavier Soria Poma et al. | MIT |
| `flux2-klein-4b-mflux-4bit/` | FLUX.2 [klein] 4B, cuantización MLX de 4 bits | Black Forest Labs; cuantizado por Runpod | Apache-2.0 |

## Arquitectura y entrenamiento

El repositorio no contiene ningún entrenamiento propio ni publica detalles de entrenamiento (número de tokens, composición del dataset, fases de RLHF/DPO), porque es una redistribución de artefactos ya existentes. La información más concreta que aporta la model card sobre entrenamiento es que TEED se entrenó sobre el conjunto BIPED, que HED procede del trabajo de Xie y Tu (2015) y que la reimplementación incluida es la de ControlNet, y que Informative Drawings corresponde al trabajo de Chan, Durand e Isola de 2022. Del resto de componentes solo se indican autores y repositorio de origen.

En cuanto a arquitecturas, la documentación proporcionada permite afirmar lo siguiente: Anime2Sketch se describe explícitamente como un generador U-Net; HED corresponde a la familia de detección de bordes con supervisión anidada; PiDiNet se incluye en su configuración table-5 (carv4); y MangaLineExtraction es un port a PyTorch del método original. El único componente generativo es FLUX.2 [klein] 4B de Black Forest Labs, un modelo texto-a-imagen que aquí aparece en una cuantización de 4 bits en MLX preparada para ejecutarse con `mflux` en Apple Silicon; la model card no detalla su arquitectura interna ni su proceso de entrenamiento.

La innovación relevante de este repositorio no es algorítmica sino de empaquetado: agrupa pesos dispersos en distintos repositorios, conserva las licencias originales junto a cada fichero, documenta la procedencia en `SOURCES.md` con sumas de comprobación verificables y añade una carpeta `third-party-code/` con las licencias del código que ejecuta estos modelos (`controlnet_aux`, Apache-2.0; `mflux`, MIT).

## Capacidades

- Extracción de líneas a partir de fotografías, pinturas o dibujos mediante el generador realista de Informative Drawings.
- Generación de trazos más gruesos y sintéticos mediante el generador *coarse* de Informative Drawings.
- Conversión de ilustración de estilo anime a boceto lineal con Anime2Sketch.
- Extracción de líneas de viñetas de manga con MangaLineExtraction.
- Detección de bordes anidada con HED, en la implementación empleada por ControlNet.
- Detección de bordes eficiente con PiDiNet en la configuración table-5 (carv4).
- Detección de bordes con TEED, variante entrenada sobre BIPED.
- Generación de mapas de condicionamiento (annotators) para *pipelines* de difusión ControlNet, ya que seis de los siete extractores se corresponden con anotadores estándar de ese ecosistema.
- Generación de imágenes a partir de texto con FLUX.2 [klein] 4B en su cuantización de 4 bits MLX, orientada a ejecución local en Apple Silicon mediante `mflux`.
- Verificación de integridad de los pesos mediante `shasum -a 256`, con las sumas publicadas en `SOURCES.md`.
- Gestión de cumplimiento de licencias: cada peso conserva su fichero de licencia y el repositorio separa las licencias del código de las de los modelos.

No se documentan en la información disponible capacidades de *tool calling*, *function calling*, razonamiento multi-paso, uso como agente, procesamiento de audio ni tratamiento multilingüe de texto.

## Casos de uso

- Preprocesado para difusión con ControlNet: usar `hed/ControlNetHED.pth`, `pidinet/table5_pidinet.pth` o `teed/7_model.pth` para generar el mapa de condicionamiento a partir de una imagen de referencia y alimentar así un *pipeline* de generación de imagen controlada por estructura. Es el uso canónico de estos pesos y la razón por la que están integrados en `controlnet_aux`.
- Rotoscopia y entintado para animación: Anime2Sketch permite obtener un boceto lineal limpio desde una ilustración o fotograma, que después se repasa o se vectoriza en la fase de *clean-up*.
- Digitalización y restauración de manga: MangaLineExtraction está pensado para separar el trazo del relleno y del tramado, útil en flujos de escaneo, recoloreado o reentintado de páginas.
- Ilustración y diseño gráfico: el generador realista de Informative Drawings convierte fotografías en dibujo a lápiz con detalle controlado, y la variante *coarse* sirve para obtener una versión más sintética, útil en moodboards y pruebas de concepto.
- Generación de datos sintéticos para visión por computador: extraer mapas de bordes de un corpus de imágenes permite construir pares imagen-borde para entrenar o evaluar modelos de segmentación, detección de contorno o *line detection*.
- Archivado y reproducibilidad de *pipelines* en CI: el espejo permite fijar versiones exactas de los pesos con suma de comprobación, de modo que una *build* de un servicio de generación de imagen no dependa de que un repositorio de terceros siga existiendo.
- Prototipado local de texto-a-imagen en Apple Silicon: la carpeta `flux2-klein-4b-mflux-4bit/` permite probar FLUX.2 [klein] 4B en un equipo con chip de la serie M sin recurrir a GPU dedicada, usando `mflux`.
- Auditoría de licencias en productos comerciales: la tabla de procedencias y los ficheros de licencia por componente facilitan revisar qué pesos pueden incorporarse a un producto y cuáles (PiDiNet) requieren autorización expresa de los autores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio solo documenta procedencia, licencias y sumas de comprobación; no incluye métricas de calidad de extracción de líneas, comparativas entre los distintos anotadores ni evaluaciones de FLUX.2 [klein] 4B.

Las búsquedas web realizadas para este identificador no devolvieron ninguna fuente relacionada con el modelo: los resultados obtenidos corresponden a guías de un videojuego y no guardan relación con `hlhc/image-models`, por lo que se descartan como material de referencia.

## Requisitos de hardware

- El repositorio no documenta requisitos de hardware. Las cifras que siguen son estimaciones derivadas del tamaño de los ficheros y del tipo de modelo, no datos confirmados por el autor.
- Extractores de líneas (`.pth`): son redes convolucionales de tamaño moderado y se ejecutan en CPU, aunque con latencia mayor que en GPU. Para uso interactivo se recomienda una GPU de consumo tipo NVIDIA RTX 3060 o superior.
- FLUX.2 [klein] 4B en 4 bits MLX: 4 000 millones de parámetros a 4 bits equivalen a unos 2 GB de pesos, a los que hay que sumar codificador de texto y VAE; en la práctica se debería reservar del orden de 4 a 6 GB de memoria unificada, con 8 GB como mínimo razonable y 16 GB para trabajar con comodidad.
- La cuantización MLX está pensada para Apple Silicon y se ejecuta con `mflux`; no es un formato portable a CUDA sin conversión.
- Para el resto de componentes, el despliegue típico es PyTorch (carga directa de los `.pth`) o `controlnet_aux`, que actúa como envoltorio de los anotadores. vLLM, llama.cpp, Ollama y TGI no aplican a estos pesos.
- No se publican datos de latencia ni de *throughput* para ninguno de los componentes.
- El repositorio completo ocupa 5,1 GB, por lo que conviene descargar únicamente los ficheros necesarios en lugar de clonar el conjunto.

## Comparativa con modelos similares

La comparación natural es contra los repositorios de origen de los que este espejo copia, y contra la librería que suele orquestar estos anotadores.

| Repositorio | Contenido | Licencia | Ventaja diferencial | Datos de rendimiento |
|---|---|---|---|---|
| `hlhc/image-models` | 7 extractores de líneas + cuantización MLX de FLUX.2 [klein] 4B | Mixta (MIT, Apache-2.0 y MIT con aviso investigador) | Consolida en un único repositorio pesos dispersos, con licencias y sumas de comprobación | No disponible |
| `lllyasviel/Annotators` | Extractores de líneas equivalentes (origen de seis de los ficheros) | No especificada en la información disponible | Es la fuente original de los pesos que usa el ecosistema ControlNet | No disponible |
| `Runpod/FLUX.2-klein-4B-mflux-4bit` | Cuantización MLX de 4 bits de FLUX.2 [klein] 4B | Apache-2.0 | Repositorio de origen de la cuantización incluida en el espejo | No disponible |
| `black-forest-labs/FLUX.2-klein-4B` | Modelo texto-a-imagen completo de 4B | Apache-2.0 | Pesos sin cuantizar, referencia para comparar pérdida de calidad | No disponible |
| `controlnet_aux` | Código de ejecución de los anotadores | Apache-2.0 | Ofrece la interfaz de uso; no redistribuye pesos | No disponible |

No se dispone de datos que permitan comparar calidad de extracción de líneas entre Informative Drawings, Anime2Sketch, MangaLineExtraction, HED, PiDiNet y TEED, ni de comparar la cuantización MLX de 4 bits con los pesos originales de FLUX.2 [klein] 4B.

## Limitaciones y advertencias

- No es trabajo original: el repositorio no entrena ni modifica modelos. Cualquier cita académica o atribución debe dirigirse a los autores originales listados en la tabla de componentes.
- La licencia `mixed-mit-apache-2.0` que muestra la plataforma es una etiqueta agregada y no sustituye a las licencias individuales. Para uso comercial hay que revisar fichero a fichero.
- `pidinet/table5_pidinet.pth` incorpora un aviso de uso exclusivamente investigador: su uso comercial requiere contactar con los autores, pese a que la licencia base sea MIT.
- El repositorio no declara *pipeline*, idiomas, ni métricas de evaluación, y no incluye una guía de uso. La única documentación es la tabla de procedencias y las sumas de comprobación.
- Los ficheros `.pth` son serializaciones de PyTorch basadas en *pickle*, por lo que cargar pesos de procedencia no verificada conlleva riesgo de ejecución de código arbitrario. Se recomienda comprobar la suma con `shasum -a 256` y cargar con `weights_only=True` cuando sea posible.
- Las licencias se copiaron de los repositorios enlazados el 2026-09-20; no hay garantía de que sigan vigentes ni de que el espejo se mantenga actualizado frente a cambios en los proyectos originales.
- El repositorio registra 0 descargas y 0 *likes*, por lo que no existe validación comunitaria ni historial de uso que permita detectar ficheros corruptos o incompletos.
- Los resultados de búsqueda disponibles para este identificador no contienen información relevante sobre el repositorio, de modo que no se ha podido contrastar externamente el contenido de la model card.
- El tamaño total de 5,1 GB y la presencia de una cuantización MLX implican que parte del repositorio no es utilizable en entornos CUDA sin conversión previa.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas de FLUX.2 [klein] 4B en la información proporcionada; al tratarse de un modelo generativo, es previsible que herede los sesgos de sus datos de entrenamiento, pero no hay datos concretos que lo cuantifiquen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hlhc/image-models
- Tabla de procedencias y sumas de comprobación (`SOURCES.md`): https://huggingface.co/hlhc/image-models/blob/main/SOURCES.md
- Repositorio de origen de los anotadores (`lllyasviel/Annotators`, referenciado desde la model card): https://huggingface.co/lllyasviel/Annotators
- Informative Drawings: https://github.com/carolineec/informative-drawings
- Anime2Sketch: https://github.com/Mukosame/Anime2Sketch
- MangaLineExtraction (port a PyTorch): https://github.com/ljsabc/MangaLineExtraction_PyTorch
- ControlNet (origen de `ControlNetHED.pth`): https://github.com/lllyasviel/ControlNet
- PiDiNet: https://github.com/hellozhuo/pidinet
- TEED: https://github.com/xavysp/TEED
- Fuente de la cuantización MLX de FLUX.2 [klein] 4B: https://huggingface.co/Runpod/FLUX.2-klein-4B-mflux-4bit
- Modelo FLUX.2 [klein] 4B original (`black-forest-labs/FLUX.2-klein-4B`, referenciado en la model card, dentro de Hugging Face)

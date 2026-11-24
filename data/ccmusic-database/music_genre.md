# ccmusic-database/music_genre

## Resumen

El modelo `ccmusic-database/music_genre` es un clasificador de genero musical publicado por el proyecto CCMusic Database, un repositorio de datos y modelos orientado a la investigacion en musicologia computacional. No es un modelo de lenguaje generativo, sino un clasificador de audio que recibe una representacion espectral de una pista musical y devuelve una de 16 categorias de genero (rock, clasica, pop, entre otras). Se distribue con licencia MIT y esta pensado tanto para uso academico como para integraciones en productos.

La aproximacion tecnica es transferencia de aprendizaje desde el dominio de vision por computador: se parte de una red convolucional preentrenada en tareas de imagen y se reutiliza como extractor de caracteristicas sobre espectrogramas. El audio se transforma en una representacion bidimensional tiempo-frecuencia (se menciona explicitamente CQT, Constant-Q Transform, en el resultado destacado) y la red aprende a discriminar generos a partir de esos patrones visuales.

El repositorio pesa 10,5 GB, lo que sugiere que incluye varios checkpoints y configuraciones de espectrograma en lugar de un unico modelo. La model card destaca como mejor resultado una VGG19_BN ajustada sobre CQT, pero no publica cifras numericas de accuracy en el texto, solo curvas e imagenes de matriz de confusion. Es relevante como referencia para pipelines de clasificacion musical y como ejemplo de transferencia cross-modal entre vision y audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional preentrenada en vision por computador y ajustada sobre espectrogramas (el resultado destacado usa VGG19_BN sobre CQT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificacion de audio, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta declarada; el modelo clasifica audio, no texto) |
| Licencia | MIT |
| Formato de pesos | no disponible en la informacion proporcionada (repo de 10,5 GB con multiples checkpoints) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de transferencia de aprendizaje desde vision por computador. En la fase de preentrenamiento, la red convolucional aprende representaciones de caracteristicas sobre un dataset a gran escala de tareas de vision. En la fase de ajuste fino, las muestras de audio se convierten primero en espectrogramas, transformando la senal temporal en una representacion bidimensional en tiempo y frecuencia. Esa representacion captura la evolucion temporal de las distintas frecuencias y proporciona a la red informacion rica sobre el contenido musical. El ajuste fino adapta la red preentrenada para extraer las caracteristicas relevantes para la clasificacion de genero.

El conjunto de datos de ajuste fino contiene 16 categorias de genero musical y esta publicado como dataset asociado (`ccmusic-database/music_genre`). La model card no detalla el numero de tokens (no aplica), el volumen exacto de horas de audio, la composicion del dataset ni si se aplicaron tecnicas de RLHF/DPO (no procede en un clasificador). Tampoco se documenta el preprocesado exacto mas alla de la mencion a CQT en el mejor resultado. La innovacion principal es el uso de conocimiento cross-modal: caracteristicas aprendidas en imagen reutilizadas para una tarea de audio, lo que reduce la necesidad de grandes corpus especificos de audio etiquetado.

## Capacidades

- Clasificacion de audio musical en 16 categorias de genero (entre ellas rock, clasica y pop, segun la model card).
- Extraccion de caracteristicas a partir de espectrogramas (representacion tiempo-frecuencia), con variantes como CQT en el checkpoint destacado.
- Transferencia de conocimiento desde modelos preentrenados en vision por computador.
- Pipeline declarado `audio-classification`, apto para inferencia sobre ficheros de audio preprocesados.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de texto; la etiqueta `en` es meramente declarativa.
- No incluye modo thinking, vision generativa, audio generativo ni otras capacidades generativas.

## Casos de uso

- Etiquetado automatico de catalogos musicales: el clasificador permite asignar genero a grandes bibliotecas de pistas, reduciendo el trabajo manual en plataformas de streaming y archivos musicales. Es adecuado porque la tarea es de clasificacion cerrada sobre 16 clases bien definidas.
- Organizacion de bibliotecas personales o de sellos discograficos: util para agrupar automaticamente miles de ficheros por genero y facilitar busquedas y playlistas tematicas, aprovechando la inferencia rapida de una CNN sobre espectrogramas.
- Sistemas de recomendacion musical: el genero predicho puede actuar como senal adicional en un motor de recomendacion basado en contenido, combinado con embeddings de audio o metadatos.
- Investigacion en musicologia computacional: el modelo y su dataset asociado permiten reproducir experimentos de clasificacion de genero y comparar arquitecturas y representaciones (CQT frente a otras), tal como sugiere el repositorio de evaluacion publicado.
- Moderacion y curaduria de contenido en plataformas: detectar generos para aplicar politicas editoriales, filtrar contenido por categoria o validar metadatos declarados por el usuario.
- Docencia y demos interactivas: la demo en Hugging Face Spaces permite mostrar en clase o en talleres como un modelo de vision adaptado a audio clasifica generos a partir de espectrogramas.
- Preprocesado en pipelines de analisis musical: como primer paso para tareas posteriores (deteccion de estado de animo, recomendacion, segmentacion), aportando una etiqueta de genero fiable y barata computacionalmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye unicamente curvas de perdida, curvas de accuracy de entrenamiento y validacion, y una matriz de confusion para el checkpoint VGG19_BN sobre CQT, presentadas como imagenes sin cifras textuales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de una CNN tipo VGG19_BN sobre espectrogramas, el requisito es modesto en comparacion con modelos generativos, pero no se publican cifras.
- GPU recomendadas: no disponible en la informacion proporcionada. Por la naturaleza de la arquitectura, una GPU consumer moderna deberia ser suficiente, pero no se confirma en la model card.
- Cabe en GPU consumer: probablemente si, dado el tipo de red convolucional, pero no se dispone de datos oficiales.
- Opciones de despliegue: la model card solo documenta la descarga via `huggingface_hub.snapshot_download` y la demo en Hugging Face Spaces. No se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye referencias a otros clasificadores de genero musical comparables ni datos numericos que permitan establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card. Al entrenarse sobre un dataset concreto de 16 generos, es previsible un sesgo hacia las clases y estilos mejor representados, pero no se cuantifica.
- Riesgo de alucinacion: no aplica en sentido generativo; el riesgo equivalente es la clasificacion erronea, especialmente en generos ambiguos, fusiones o pistas con multiples estilos.
- Limitaciones de contexto o idioma: la etiqueta `en` es declarativa y no describe el comportamiento real; el modelo clasifica audio, no texto, y no cubre idiomas en el sentido convencional.
- Restricciones de licencia: licencia MIT, que permite uso comercial con obligacion de incluir el aviso de copyright y la licencia. Conviene revisar tambien las condiciones del dataset asociado y de los modelos preentrenados de vision subyacentes.
- Caveats para produccion: la model card no publica cifras de accuracy, no detalla el preprocesado exacto (salvo la mencion a CQT en el mejor checkpoint) ni especifica que checkpoint usar en cada caso; el repositorio de 10,5 GB contiene multiples variantes. Es necesario validar el modelo sobre el dominio concreto de audio antes de desplegarlo, y documentar la cadena de preprocesado (resampleado, duracion de fragmento, normalizacion) para reproducir resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ccmusic-database/music_genre
- Dataset asociado: https://huggingface.co/datasets/ccmusic-database/music_genre
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/ccmusic-database/music_genre
- Mirror en ModelScope: https://www.modelscope.cn/models/ccmusic-database/music_genre
- Repositorio de evaluacion: https://github.com/monetjoe/ccmusic_eval
- Dataset original (Zenodo, CCMUSIC DATASET): https://doi.org/10.5281/zenodo.5676893
- Imagen de resultados: https://www.modelscope.cn/models/ccmusic-database/music_genre/resolve/master/genres_results.png

# milkywai/shortlid

## Resumen

ShortLID es un clasificador de identificacion de idioma desarrollado por milkywai, publicado en Hugging Face bajo el identificador `milkywai/shortlid`. Resuelve un problema muy concreto: detectar el idioma de textos muy cortos (consultas de busqueda, mensajes de chat, titulares o encabezados de documentos) donde los detectores convencionales fallan por falta de contexto. Frente a los modelos fastText clasicos, que necesitan fragmentos mas largos para ser fiables, ShortLID esta optimizado para ventanas de 8 a 32 puntos de codigo Unicode.

Tecnicamente es un clasificador supervisado de fastText con n-gramas de caracteres y embeddings de 32 dimensiones, comprimido mediante product quantization hasta ocupar 1,13 MiB. El modelo devuelve predicciones ordenadas sobre 110 etiquetas de idioma y esta pensado para ejecutarse en CPU, incluso en dispositivos con recursos limitados, con una latencia media de 44,4 microsegundos por llamada.

Su relevancia radica en la combinacion de tamano minimo, velocidad y precision en textos cortos: en FLORES-200 devtest con extractos de 16 puntos de codigo alcanza un 77,6 % de exactitud macro frente al 66,3 % de fastText lid.176.ftz y el 71,4 % de lid.176.bin, un modelo 110 veces mas grande. Es una pieza util para enrutado multilingue, preprocesado de pipelines NLP y aplicaciones on-device.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador fastText supervisado con n-gramas de caracteres y embeddings de 32 dimensiones |
| Parametros totales | no disponible (checkpoint podado a 65.000 entradas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 2.048 puntos de codigo Unicode por entrada |
| Tipos de cuantizacion | product quantization (incluida en el checkpoint distribuido); no se documentan otros formatos |
| Idiomas soportados | 110 etiquetas de idioma en el conjunto de entrenamiento; el conjunto de evaluacion compartido cubre 67 variedades en FLORES-200 y 79 en WiLI-2018 |
| Licencia | CC BY 4.0 para los pesos; MIT para el codigo Python |
| Formato de pesos | `model.bin` (fastText cuantizado) |

## Arquitectura y entrenamiento

ShortLID es un clasificador fastText supervisado, no un transformer. Utiliza representaciones de n-gramas de caracteres combinadas con un embedding de 32 dimensiones por token y una capa de salida softmax sobre 110 etiquetas. El checkpoint final fue podado a 65.000 entradas, reentrenado y comprimido con product quantization, lo que explica su tamano de 1,13 MiB y su velocidad en CPU.

El entrenamiento se realizo sobre 4.582.511 ejemplos construidos a partir de frases de Tatoeba y extractos cortos muestreados de esas mismas frases. El proceso completo (preparacion de datos, entrenamiento y evaluacion) se ejecuto en 8 nucleos de CPU y se facturo en aproximadamente 87 minutos de CPU. No se documenta uso de RLHF ni DPO, algo esperable en un clasificador de este tipo. La innovacion principal no esta en la arquitectura, sino en la curacion del dataset y en el diseno de la evaluacion con ventanas deterministas de 8, 16 y 32 puntos de codigo, que mide especificamente el regimen de texto corto.

## Capacidades

- Identificacion de idioma en textos cortos: consultas, mensajes, titulares y encabezados de 8 a 32 puntos de codigo.
- Clasificacion multilingue con 110 etiquetas de idioma, incluyendo variedades regionales y de escritura.
- Predicciones ordenadas por confianza: devuelve el idioma principal y una lista de candidatos con puntuaciones softmax.
- Rechazo selectivo: parametros `min_score` y `min_margin` permiten devolver `und` (indeterminado) cuando la confianza es baja o la entrada no contiene letras utiles.
- Ejecucion on-device en CPU, sin GPU, con latencia de decenas de microsegundos.
- Procesamiento de entradas de hasta 2.048 puntos de codigo Unicode.
- No soporta tool calling, agentes, vision, audio ni generacion de texto: es exclusivamente un clasificador.

## Casos de uso

- Enrutado multilingue en pipelines NLP: clasificar la consulta entrante para dirigirla a un modelo de traduccion, un modelo de lenguaje especifico del idioma o un indice de busqueda adecuado, aprovechando la latencia de 44,4 microsegundos por llamada.
- Deteccion de idioma en busquedas y autocompletado: identificar el idioma de una consulta de pocos caracteres antes de aplicar stemming, tokenizacion o correccion ortografica especificos.
- Moderacion y filtrado en chats: clasificar mensajes cortos en tiempo real para aplicar politicas por idioma o enrutar a moderadores humanos con el idioma correcto.
- Preprocesado de corpus y deduplicacion: etiquetar grandes volumenes de documentos o encabezados por idioma en CPU, sin coste de GPU, antes de un entrenamiento o indexacion.
- Aplicaciones moviles y edge: integrar el detector en apps Android o iOS con recursos limitados gracias a los 1,13 MiB de pesos y la dependencia de fastText.
- Analitica de contenido multilingue: clasificar titulares, comentarios o resenas por idioma para agregar metricas por region o mercado.
- Desambiguacion en sistemas de atencion al cliente: detectar el idioma de un mensaje corto para asignar la cola de soporte correcta, usando el rechazo selectivo para derivar a revision humana cuando la confianza es baja.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Exactitud top-1 macro sobre variedades compartidas, con ventanas deterministas de puntos de codigo Unicode.

FLORES-200 devtest (67 variedades):

| Modelo | Pesos | 8 cp | 16 cp | 32 cp | Texto completo |
|---|---:|---:|---:|---:|---:|
| ShortLID | 1,13 MiB | 59,3 % | 77,6 % | 88,5 % | 93,7 % |
| fastText lid.176.ftz | 0,89 MiB | 49,6 % | 66,3 % | 80,8 % | 91,8 % |
| fastText lid.176.bin | 125,19 MiB | 53,8 % | 71,4 % | 84,7 % | 93,5 % |

WiLI-2018 test corregido (79 variedades):

| Modelo | Pesos | 8 cp | 16 cp | 32 cp | Texto completo |
|---|---:|---:|---:|---:|---:|
| ShortLID | 1,13 MiB | 50,9 % | 69,0 % | 81,9 % | 93,0 % |
| fastText lid.176.ftz | 0,89 MiB | 41,8 % | 57,4 % | 71,8 % | 89,8 % |
| fastText lid.176.bin | 125,19 MiB | 45,2 % | 62,6 % | 76,4 % | 91,4 % |

Rechazo selectivo y latencia (FLORES devtest, entradas de 9 a 16 caracteres normalizados sin espacios): con un margen de 0,601 se acepto el 74,8 % de las entradas dentro del alcance, con un 90,9 % de exactitud entre las aceptadas, y se acepto el 46,4 % de las variedades no soportadas seleccionadas. La latencia media por prediccion fue de 44,4 microsegundos para ShortLID (incluyendo normalizacion) y 21,4 microsegundos para fastText comprimido, medidas sobre 3.000 entradas en CPU devolviendo las dos etiquetas principales.

## Requisitos de hardware

- Inferencia exclusivamente en CPU: no requiere GPU ni VRAM dedicada.
- Memoria RAM estimada: inferior a 100 MB para el modelo y el runtime de fastText, dado el tamano de 1,13 MiB de los pesos.
- Cabe en cualquier GPU consumer, aunque no la necesita; tambien en dispositivos moviles y sistemas embebidos.
- Despliegue mediante el runtime Python oficial (`fasttext-wheel==0.9.2`, `numpy<2`, `huggingface_hub`) y el wrapper `shortlid` incluido en el repositorio.
- Latencia medida de 44,4 microsegundos por llamada en CPU para ShortLID; throughput no documentado mas alla de esa cifra por llamada.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Contexto | Exactitud 16 cp (FLORES-200) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ShortLID | 1,13 MiB, embeddings de 32 dim. | 2.048 puntos de codigo | 77,6 % | CC BY 4.0 (pesos), MIT (codigo) | Hugging Face |
| fastText lid.176.ftz | 0,89 MiB | no documentado | 66,3 % | CC BY-SA 3.0 (fastText) | GitHub de fastText |
| fastText lid.176.bin | 125,19 MiB | no documentado | 71,4 % | CC BY-SA 3.0 (fastText) | GitHub de fastText |

ShortLID mejora a los dos baselines de fastText en el regimen de texto corto con un tamano intermedio entre ambos, y su licencia CC BY 4.0 es mas permisiva que la CC BY-SA 3.0 de los modelos de referencia. No se dispone de comparacion con detectores basados en transformers en la informacion proporcionada.

## Limitaciones y advertencias

- La etiqueta se asigna al texto, no a la intencion del autor: nombres ambiguos, cadenas muy cortas, texto transliterado o entradas que mezclan idiomas pueden producir etiquetas plausibles pero incorrectas.
- Devuelve una sola etiqueta por entrada; no modela mezcla de idiomas ni segmentos multilingues dentro de un mismo texto.
- Las ventanas muy cortas (8 puntos de codigo) tienen varias lecturas validas posibles y la exactitud cae al 50-59 % segun el conjunto.
- El rechazo selectivo con margen 0,601 acepto el 46,4 % de variedades no soportadas, por lo que no filtra de forma fiable idiomas fuera del conjunto de entrenamiento.
- El modelo lee hasta 2.048 puntos de codigo; entradas mas largas requieren truncado o particionado por parte de la aplicacion.
- Las 110 etiquetas de entrenamiento incluyen variedades fuera del conjunto de evaluacion compartido, por lo que la cobertura real por idioma no esta documentada de forma completa.
- Licencia CC BY 4.0 en los pesos: exige atribucion al autor y a los contribuyentes de Tatoeba (CC BY 2.0 France); el codigo Python es MIT.
- Dependencia de `fasttext-wheel==0.9.2` y `numpy<2`, lo que puede complicar la integracion en entornos con versiones mas recientes de NumPy.
- No se documentan sesgos especificos por idioma o variedad mas alla de las limitaciones de evaluacion descritas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/milkywai/shortlid
- Paper de WiLI-2018: https://arxiv.org/abs/1801.07779
- Dataset WiLI-2018 corregido: https://huggingface.co/datasets/MAximeSobrier/WiLI-2018-corrected
- Modelos de identificacion de idioma de fastText: https://github.com/facebookresearch/fastText/blob/main/docs/language-identification.md
- FLORES-200: https://github.com/facebookresearch/flores/tree/main/flores200
- Tatoeba (descargas): https://tatoeba.org/en/downloads
- Licencia CC BY 2.0 France: https://creativecommons.org/licenses/by/2.0/fr/

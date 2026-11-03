# manga-cleaner-dev/manga-cleaner-models

## Resumen

Manga Cleaner Studio Models es un repositorio de artefactos ONNX publicado por el usuario manga-cleaner-dev que agrupa dos modelos de vision por computador utilizados por la aplicacion de escritorio Manga Cleaner Studio, orientada a la limpieza, rotulacion, traduccion y montaje de paginas de manga y webtoon. No se trata de un modelo de lenguaje ni de un modelo fundacional entrenado por este autor: el repositorio redistribuye pesos ya existentes en formato ONNX para su consumo dentro de una aplicacion concreta.

Los dos ficheros documentados son `lama.onnx`, una implementacion del modelo de inpainting LaMa que la aplicacion emplea para eliminar texto u otro contenido dentro de una mascara pintada o seleccionada por el usuario, y `ocr.onnx`, un modelo de deteccion de regiones de texto que la aplicacion usa para marcar zonas candidatas a revision o enmascarado. La deteccion OCR no ejecuta por si misma la limpieza con LaMa; son etapas separadas del flujo de trabajo.

La relevancia del repositorio es practica y acotada: sirve como fuente de descarga para el gestor de modelos integrado en Manga Cleaner Studio, que configura en su codigo fuente el repositorio y la revision de Hugging Face. El repo ocupa 0,2 GB, esta marcado como MIT y no declara pipeline, idiomas ni resultados de evaluacion. No hay informacion publica sobre arquitectura interna, numero de parametros, contexto o datos de entrenamiento de los ficheros incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (ficheros ONNX; `lama.onnx` corresponde a LaMa, inpainting; `ocr.onnx` es un detector de texto) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (el OCR detecta regiones de texto; no se especifican idiomas) |
| Licencia | MIT (el repositorio; el autor remite a las condiciones upstream de cada modelo) |
| Formato de pesos | ONNX (`lama.onnx`, `ocr.onnx`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el numero de parametros, la composicion del dataset ni el proceso de entrenamiento de los ficheros incluidos. La model card solo identifica la funcion de cada artefacto: `lama.onnx` es una implementacion del modelo de inpainting LaMa, empleado para rellenar la region enmascarada por el usuario, y `ocr.onnx` es un modelo de deteccion de texto que localiza regiones para su revision o enmascarado. Ambos se ejecutan mediante ONNX Runtime dentro de la aplicacion; el usuario final no necesita configurar el runtime ni cargar los ficheros manualmente en el flujo normal.

El repositorio no documenta innovaciones tecnicas propias, procesos de RLHF/DPO ni ajuste fino por parte del autor. Al tratarse de una redistribucion de pesos para una aplicacion de escritorio, la informacion tecnica relevante (arquitectura de LaMa, arquitectura del detector OCR, datos de entrenamiento originales) corresponde a los proyectos upstream, no a este repositorio, y no se detalla en la model card.

## Capacidades

- Inpainting de imagen: `lama.onnx` rellena el contenido dentro de una mascara definida por el usuario, lo que permite borrar texto u otros elementos de una pagina de manga o webtoon.
- Deteccion de regiones de texto: `ocr.onnx` localiza zonas de texto y las marca para revision o enmascarado dentro de la aplicacion.
- Integracion en flujo de trabajo de limpieza: la deteccion OCR y la limpieza con LaMa son etapas separadas; la deteccion por si sola no ejecuta el inpainting.
- Uso previsto como componentes de Manga Cleaner Studio: limpieza, rotulacion, traduccion y montaje de paginas.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, modo thinking, audio ni vision general mas alla del inpainting y la deteccion de texto.
- No se documentan capacidades multilingues del OCR.

## Casos de uso

- Limpieza de rotulos en paginas de manga: el usuario pinta o selecciona una mascara sobre el texto original y `lama.onnx` rellena esa region con contenido coherente con el entorno, eliminando el rotulo antes de reinsertar la traduccion.
- Deteccion previa de zonas de texto para revision: `ocr.onnx` marca las regiones candidatas y el operador decide cuales enmascarar o revisar, reduciendo el trabajo manual de localizacion en paginas densas.
- Flujo de retraduccion de webtoons: deteccion de globos y cartelas con `ocr.onnx`, limpieza con `lama.onnx` y posterior rotulacion del texto traducido dentro de la misma aplicacion de escritorio.
- Limpieza de onomatopeyas y texto integrado en el dibujo: al permitir mascaras manuales, el inpainting puede aplicarse a elementos que un detector automatico no aislaria correctamente, siempre con supervision del operador.
- Preparacion de paginas para montaje editorial: eliminacion de texto fuente y reconstruccion del fondo antes de componer la version final con la tipografia y el texto traducido.
- Despliegue local en estaciones de trabajo: al distribuirse en ONNX y ejecutarse dentro de una aplicacion de escritorio, el flujo puede operar en local sin depender de servicios en la nube, lo que resulta adecuado para material con restricciones de distribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,2 GB en total, lo que sugiere un consumo de memoria modesto, pero no se documentan cifras de VRAM ni de memoria RAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; al ejecutarse mediante ONNX Runtime, la viabilidad depende de los proveedores de ejecucion (CPU, CUDA, DirectML) que configure la aplicacion.
- Opciones de despliegue: la via prevista es Manga Cleaner Studio, que incluye un descargador de modelos integrado y un gestor que indica el destino exacto de descarga (`models/` en la raiz del proyecto en instalaciones desde codigo fuente, o `models/` junto al ejecutable en compilaciones empaquetadas). Los ficheros tambien pueden descargarse manualmente y colocarse en ese directorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefactos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento, parametros ni contexto que permitan una comparacion cuantitativa con alternativas de inpainting o deteccion de texto, y no se identifican en la busqueda web modelos comparables de la misma categoria.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no admite prompts conversacionales; cualquier expectativa en ese sentido es incorrecta.
- La deteccion de `ocr.onnx` no ejecuta la limpieza: son etapas independientes y el inpainting requiere una mascara o seleccion explicita.
- La calidad del inpainting depende de la mascara definida por el usuario; una mascara imprecisa puede producir artefactos en la reconstruccion del fondo.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma del OCR; al no haber evaluacion publica, no pueden descartarse errores de deteccion en tipografias, idiomas o layouts poco frecuentes.
- La licencia del repositorio es MIT, pero el autor remite expresamente a las condiciones upstream de cada modelo al redistribuir o usar los ficheros; conviene verificar los terminos de LaMa y del detector OCR antes de un uso comercial o de una redistribucion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y no declara pipeline ni idiomas, lo que limita la evidencia disponible sobre su mantenimiento y validacion.
- La model card enlaza un repositorio de modelos alternativo (`SVD-MKU-DEV/manga-cleaner-models`) distinto del identificador de esta ficha, lo que puede generar ambiguedad sobre cual es la fuente canonica.
- No se documentan requisitos de hardware, latencias ni limites de resolucion de imagen; en produccion habria que validar el comportamiento con el volumen y el formato reales de las paginas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/manga-cleaner-dev/manga-cleaner-models
- Repositorio de modelos alternativo citado en la model card: https://huggingface.co/SVD-MKU-DEV/manga-cleaner-models
- Codigo fuente y uso de la aplicacion: https://github.com/NeTRuNNeRGLiTCH/manga-cleaner

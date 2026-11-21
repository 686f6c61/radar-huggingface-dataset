# cansik/visiongraph

## Resumen

Visiongraph es un repositorio de Hugging Face que no contiene un modelo de lenguaje generativo, sino un conjunto de ficheros de pesos para redes de vision por computador utilizadas por la libreria open source [visiongraph](https://github.com/cansik/visiongraph). La libreria, desarrollada por cansik (Florian Bruggisser), ofrece implementaciones de referencia de redes de vision para inferencia en tiempo real, y este repositorio actua como almacen centralizado desde el que la libreria descarga los pesos bajo demanda.

El repositorio agrupa modelos de origenes muy distintos, por lo que no existe una unica licencia aplicable: cada fichero se rige por la licencia y condiciones de su autor original. El autor mantiene un fichero `MODEL_ATTRIBUTIONS.md` y una carpeta `licenses/` con los textos legales correspondientes. La presencia de un peso en el repositorio no concede derechos adicionales mas alla de los de su licencia original.

Por su naturaleza, no es un modelo que se pueda evaluar con los criterios habituales de un LLM: no hay parametros de lenguaje, contexto, idiomas ni benchmarks de razonamiento. Su relevancia radica en ser la dependencia de descarga de visiongraph, una libreria practica para prototipado rapido de pipelines de vision (deteccion, segmentacion, clasificacion) en formatos ONNX, OpenVINO y TFLite.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion de redes de vision por computador (no es un unico modelo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en ONNX, OpenVINO y TFLite) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | other (licencias heterogeneas por fichero; ver `MODEL_ATTRIBUTIONS.md`) |
| Formato de pesos | ONNX, OpenVINO, TFLite |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado por el autor del repositorio, sino de un contenedor de pesos de terceros empaquetados para su consumo por la libreria visiongraph. Por ello no hay informacion sobre arquitectura unica, numero de tokens de entrenamiento, composicion del dataset ni procesos de RLHF o DPO. Cada modelo incluido conserva la arquitectura y el entrenamiento de su proyecto de origen (redes de vision clasicas y modernas exportadas a ONNX, OpenVINO y TFLite para inferencia en tiempo real).

La innovacion tecnica no reside en el entrenamiento, sino en la infraestructura de distribucion: visiongraph descarga automaticamente los pesos necesarios segun el modelo seleccionado por el usuario, lo que simplifica el despliegue de pipelines de vision en multiples backends (ONNX Runtime, OpenVINO, TensorFlow Lite). El tamano del repositorio, 10,3 GB, refleja la acumulacion de multiples modelos en varios formatos.

## Capacidades

- Inferencia de vision por computador en tiempo real (deteccion de objetos, segmentacion, clasificacion y tareas afines segun los modelos incluidos).
- Ejecucion en multiples backends: ONNX, OpenVINO y TFLite.
- Descarga bajo demanda de pesos desde la libreria visiongraph.
- No ofrece generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingues (no es un modelo linguistico).
- Sin modo thinking, vision multimodal generativa ni audio.

## Casos de uso

- Prototipado rapido de pipelines de vision: instalar visiongraph, seleccionar un modelo soportado y dejar que la libreria descargue los pesos de este repositorio, acelerando la puesta en marcha de demos de deteccion o segmentacion.
- Inferencia en tiempo real en dispositivos de borde: el uso de pesos TFLite y OpenVINO permite desplegar redes de vision en hardware limitado, como Raspberry Pi o mini-PC con aceleracion Intel, para tareas de monitorizacion.
- Integracion en aplicaciones de escritorio o herramientas creativas: visiongraph esta orientada a integraciones practicas, por lo que estos pesos sirven para anadir vision a instalaciones interactivas, arte generativo o prototipos de Processing/Java.
- Evaluacion comparativa de backends: al disponer de los mismos modelos en ONNX, OpenVINO y TFLite, el repositorio facilita medir latencia y precision entre runtimes para elegir el mas adecuado en produccion.
- Educacion e investigacion: sirve como fuente de pesos de referencia para cursos o experimentos que necesiten redes de vision preentrenadas sin gestionar manualmente las descargas.
- Base para pipelines de preprocesado: usar los modelos de vision como etapa previa (por ejemplo, deteccion de regiones de interes) en sistemas mayores que combinen vision con otros componentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo concreto seleccionado dentro del repositorio.
- GPU recomendadas: no disponibles de forma especifica; al soportar OpenVINO y ONNX Runtime, puede aprovechar GPU Intel, NVIDIA y CPU.
- Compatibilidad con GPU de consumo: probable para muchos de los modelos de vision incluidos, pero no confirmada en la informacion disponible.
- Opciones de despliegue: visiongraph como cliente principal; los pesos en ONNX, OpenVINO y TFLite pueden ejecutarse con ONNX Runtime, OpenVINO Runtime y TensorFlow Lite respectivamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Aspecto | visiongraph (este repo) | Repositorios de modelos ONNX en HF (genericos) | Repositorios de modelos TFLite en HF |
|---|---|---|---|
| Naturaleza | Coleccion de pesos de vision para una libreria concreta | Colecciones heterogeneas de pesos ONNX | Colecciones heterogeneas de pesos TFLite |
| Parametros | no disponible | variable | variable |
| Contexto | no aplica | no aplica | no aplica |
| Rendimiento | no disponible | no disponible | no disponible |
| Licencia | other (heterogenea) | variable | variable |
| Disponibilidad | Hugging Face + GitHub de visiongraph | Hugging Face | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse ni usarse para tareas de texto, razonamiento o generacion.
- Licencias heterogeneas: cada fichero tiene su propia licencia; es obligatorio revisar `MODEL_ATTRIBUTIONS.md` y la carpeta `licenses/` antes de cualquier uso comercial, de investigacion o de redistribucion.
- La presencia de un peso en el repositorio no concede derechos adicionales; el uso queda limitado por la licencia original del modelo.
- Sin garantias del autor sobre idoneidad para produccion; los pesos se ofrecen "por comodidad" y deben verificarse antes de usarlos en aplicaciones reales.
- Sin informacion publica sobre sesgos, alucinacion o limitaciones de contexto, al no ser un modelo generativo.
- El repositorio depende de la libreria visiongraph para su uso previsto; su mantenimiento esta ligado al del proyecto GitHub.
- Sin datos de benchmarks ni de rendimiento que permitan validar su calidad frente a alternativas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cansik/visiongraph
- Proyecto visiongraph en GitHub: https://github.com/cansik/visiongraph
- Atribuciones de modelos: https://huggingface.co/cansik/visiongraph/blob/main/MODEL_ATTRIBUTIONS.md
- Carpeta de licencias: https://huggingface.co/cansik/visiongraph/tree/main/licenses

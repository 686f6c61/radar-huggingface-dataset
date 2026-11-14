# AIisMyLife/scenelift

## Resumen

scenelift es un proyecto de reconstruccion 3D a partir de video o fotografia movil, desarrollado por el usuario AIisMyLife (repositorio en GitHub bajo el handle 001shahab) y publicado en Hugging Face como `AIisMyLife/scenelift`. No es un modelo de lenguaje ni una red neuronal entrenada por sus autores: es una herramienta que orquesta modelos de terceros (MapAnything para geometria, SAM 3 para mascaras, SAM 3D Objects para completado de volumen) junto con un nucleo geometrico propio escrito en Python. Su objetivo es convertir un video corto de telefono en una escena 3D metrica donde cada objeto es un nodo independiente, editable y medible.

El valor diferencial declarado por el autor es el tratamiento explicito de la incertidumbre: cada consulta geometrica (distancias, encajes, holguras) devuelve un intervalo de confianza al 95 por ciento en lugar de un numero aislado. El nucleo geometrico funciona en CPU de portatil sin GPU ni pesos de modelo, y el repositorio ocupa 0,5 GB. El proyecto se encuentra en estado alpha (version 0.1) y el propio autor advierte que la precision sobre escenas reales aun no esta medida con verdad de referencia.

La relevancia actual es limitada pero concreta: cubre un nicho (levantamiento metrico ligero, planificacion de espacios, exportacion a Blender o Unity) donde la mayoria de alternativas exige hardware especializado o suscripciones a servicios en la nube. La informacion disponible sobre el modelo es escasa en cuanto a parametros, contexto y licencia efectiva de los pesos, por lo que esta ficha refleja principalmente lo declarado en la model card y en la documentacion enlazada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de vision por computador: reconstruccion multi-vista (MapAnything) + segmentacion (SAM 3) + completado de objetos (SAM 3D Objects) + nucleo geometrico propio en Python |
| Parametros totales | no disponible (no es un modelo unico; depende de los backends cargados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (interfaz y documentacion en ingles) |
| Licencia | Apache-2.0 segun el badge de la model card; la licencia de Hugging Face figura como no disponible |
| Formato de pesos | no disponible (el repo contiene codigo y assets; los pesos provienen de los backends externos) |

## Arquitectura y entrenamiento

scenelift no entrena un modelo propio. Su arquitectura es un pipeline modular: extraccion de keyframes del video, estimacion de geometria y profundidad con MapAnything, segmentacion de instancias con SAM 3, reconstruccion volumetrica de cada objeto con SAM 3D Objects (aun no ejecutado sobre pesos reales por requerir CUDA) y un nucleo geometrico que fusiona todo en una escena metrica con nodos nombrados. El autor declara explicitamente que los componentes entrenados propios, el benchmark sobre fotos reales, el horneado de texturas, el inpainting de fondo y la exportacion a Gaussian splats no estan construidos.

La innovacion tecnica destacable es el modelo de incertidumbre: cada vista recibe su propio error de escala (en torno al 5 por ciento en el test sintetico) y ruido de profundidad, y las consultas propagan esa incertidumbre hasta un intervalo al 95 por ciento. El test end-to-end se realiza sobre una habitacion sintetica con verdad de referencia exacta, lo que valida la contabilidad geometrica pero no la calidad sobre escenas reales. Se ha procesado un unico video real de 13 segundos en un portatil Apple Silicon sin CUDA, con un tiempo de unos dos minutos y medio, sin medicion con cinta metrica del resultado.

## Capacidades

- Reconstruccion 3D metrica a partir de un video corto de telefono o de un conjunto de fotos, con cada objeto como nodo separado y nombrado.
- Edicion de escena: eliminar objetos (con reasentamiento fisico de lo que se apoyaba sobre ellos), moverlos y consultar relaciones espaciales.
- Consultas geometricas con barras de error: distancias entre objetos, comprobacion de encaje de un volumen dado en un hueco, holguras con intervalo de confianza al 95 por ciento.
- Exportacion a glTF/GLB con un nodo por objeto, compatible con Blender, Unity y visores web.
- Interfaz web (SceneLift Studio) con API REST y frontend de navegador, ademas de CLI y API de Python.
- Integracion con modelos de lenguaje: la documentacion incluye una seccion para exponer la escena a un LLM mediante la API.
- Evaluacion integrada sobre escena sintetica con verdad de referencia.
- No soporta generacion de texto, codigo, vision semantica general ni tool calling en el sentido de un LLM; esas capacidades pertenecen a los backends externos o a la capa de integracion.

## Casos de uso

- Planificacion de mobiliario: introducir un video de una habitacion y consultar si un sofa de dimensiones concretas encaja en el hueco disponible, con probabilidad asociada y margen en centimetros. Adecuado porque la consulta `fits_in_space` devuelve directamente el veredicto con incertidumbre.
- Levantamiento rapido de interiores: obtener distancias entre paredes, muebles y huecos en metros reales a partir de un video movil, util para presupuestos preliminares antes de una medicion con laser.
- Edicion de escena para visualizacion inmobiliaria: eliminar objetos existentes y exportar el GLB a Blender o Unity para amueblar virtualmente el espacio conservando la metrica original.
- Verificacion de accesibilidad: comprobar holguras de paso entre muebles o anchos de puerta con intervalos de confianza, identificando donde la incertidumbre es demasiado alta para decidir.
- Prototipado en robotica domestica: generar representaciones de escena con objetos separados y limites volumetricos que un planificador pueda consumir, aunque el completado volumetrico real aun requiere CUDA.
- Docencia e investigacion en vision 3D: usar la escena sintetica con verdad de referencia para estudiar propagacion de errores de escala y profundidad en pipelines multi-vista.
- Automatizacion via API REST: integrar la reconstruccion y las consultas geometricas en un flujo de trabajo propio, por ejemplo un formulario web que reciba un video y devuelva medidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo declarado es la evaluacion sobre la habitacion sintetica (cada vista con error de escala de aproximadamente el 5 por ciento y ruido de profundidad) y el ejemplo de la captura de Studio, donde la holgura entre mesa y armario se mide como 86,5 ± 4,1 cm frente a un valor real de 84,7 cm. El autor subraya que no hay medicion con verdad de referencia sobre escenas reales.

## Requisitos de hardware

- El nucleo geometrico funciona en CPU de portatil, sin GPU, sin pesos de modelo y sin Node.js; el arranque con la habitacion sintetica tarda unos segundos.
- El pipeline completo sobre video real se ha ejecutado en un portatil Apple Silicon sin CUDA: 13 segundos de video procesados en aproximadamente dos minutos y medio.
- El backend de completado volumetrico (SAM 3D Objects) requiere CUDA y no se ha ejecutado sobre pesos reales; sin el, cada objeto se representa como envolvente convexa de sus puntos medidos y asi se marca.
- No se especifican modelos de GPU recomendados, VRAM estimada ni throughput para los backends de vision.
- Opciones de despliegue: ejecucion local via `python app.py` (servidor en el puerto 8000), CLI, API de Python y API REST; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- Requisitos de software declarados: Python 3.10 a 3.13.

## Comparativa con modelos similares

| Proyecto | Enfoque | Metrica y error | Licencia | Estado |
|---|---|---|---|---|
| scenelift | Reconstruccion 3D con objetos separados y consultas con incertidumbre | Si, intervalos al 95 por ciento | Apache-2.0 (segun badge) | Alpha 0.1 |
| MapAnything (backend) | Reconstruccion de geometria multi-vista | No disponible en esta ficha | No disponible en esta ficha | Usado como dependencia |
| SAM 3 / SAM 3D Objects (backends) | Segmentacion y completado de objetos | No aplica | No disponible en esta ficha | SAM 3 en uso; SAM 3D Objects sin ejecutar |
| Gaussian splatting (p. ej. exportadores GS) | Representacion visual de escena | No metrica por objeto | No disponible en esta ficha | No implementado en scenelift |

No se dispone de datos suficientes en la informacion proporcionada para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Estado alpha (0.1): el propio autor califica el proyecto como no listo para produccion.
- Precision sobre escenas reales no medida: solo existe un video real procesado, sin verdad de referencia con cinta metrica.
- El completado volumetrico de objetos no se ha ejecutado sobre pesos reales; sin CUDA, los objetos son envolventes convexas marcadas como tales, lo que distorsiona formas concavas.
- Componentes clave sin construir: modelos propios entrenados, benchmark sobre fotos reales, horneado de texturas, inpainting de fondo y exportacion a Gaussian splats.
- Dependencia de backends externos cuyas licencias no se detallan en la informacion disponible; conviene verificar cada una antes de uso comercial.
- La licencia efectiva de los pesos en Hugging Face figura como no disponible, aunque el badge de la model card indique Apache-2.0.
- Riesgo de error de escala por vista (aproximadamente el 5 por ciento en el test sintetico) que se propaga a todas las medidas; las consultas lo reflejan en sus intervalos, pero no lo eliminan.
- Sin informacion sobre sesgos, idiomas de la interfaz distintos del ingles ni limites de contexto, por no aplicar a un modelo de lenguaje.
- Repositorio con 0 descargas y 0 likes en Hugging Face: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/AIisMyLife/scenelift
- Repositorio GitHub: https://github.com/001shahab/scenelift
- Documento de diseno: https://github.com/001shahab/scenelift/blob/main/docs/DESIGN.md
- API REST: https://github.com/001shahab/scenelift/blob/main/docs/API.md
- Backends y primer escena real: https://github.com/001shahab/scenelift/blob/main/docs/BACKENDS.md#the-first-real-scene
- CI (GitHub Actions): https://github.com/001shahab/scenelift/actions/workflows/ci.yml
- Plantilla para enviar resultados con footage propio: https://github.com/001shahab/scenelift/issues/new?template=real_scene_result.yml
- Licencia: https://github.com/001shahab/scenelift/blob/main/LICENSE

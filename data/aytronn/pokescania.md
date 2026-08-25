# aytronn/pokescania

## Resumen

PokeScania es un repositorio de modelos de visión por computadora desarrollado por el usuario aytronn, diseñado para el pipeline de escaneo de cartas Pokémon de la aplicación PokeScania. El repositorio contiene dos componentes principales: un localizador de cartas basado en MobileNetV3-Small exportado a ONNX, que detecta la presencia de una carta y sus cuatro esquinas incluso cuando está inclinada, rotada o sobre un fondo complejo, y un clasificador de idioma de imagen que predice el idioma de la carta entre seis opciones (alemán, inglés, español, francés, italiano y japonés). El modelo resuelve el problema de la detección robusta de cartas en tiempo real para su posterior procesamiento y normalización mediante OpenCV.

La relevancia actual del modelo radica en su enfoque práctico para aplicaciones de escaneo móvil y web: el localizador está optimizado para ser ligero (aproximadamente 6,12 MB en ONNX) y puede ejecutarse en navegadores mediante ONNX Runtime Web. El repositorio incluye un sistema de versionado de releases con ficheros de trazabilidad (model-provenance.json, preprocess.json y training-metrics.json) para permitir el anclaje de artefactos estables en producción. El modelo se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Small (localizador); clasificador de idioma: no disponible |
| Parametros totales | no disponible (fichero ONNX del localizador: ~6,12 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (export ONNX, sin informacion de cuantizacion) |
| Idiomas soportados | Clasificador: aleman (de), ingles (en), espanol (es), frances (fr), italiano (it), japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (safetensors no disponible) |

## Arquitectura y entrenamiento

El localizador de cartas utiliza una arquitectura MobileNetV3-Small, una red neuronal convolucional ligera diseñada para dispositivos con recursos limitados. El modelo se exporta a formato ONNX y acepta como entrada una imagen RGB en formato float32 con tensor NCHW de dimensiones 1x3x256x256. El preprocesamiento consiste en un redimensionamiento con letterbox, conversion a RGB y normalizacion con la formula `(pixel / 255 - 0,5) / 0,5`. Las salidas son ocho coordenadas de esquinas normalizadas y un logit de presencia de carta.

El entrenamiento se realizo con 132.964 escenas generadas sinteticamente durante 50 epochs. Los datos de validacion muestran una loss de 0,001288, un error medio de esquinas de 0,01966 y una precision de presencia del 100%. El clasificador de idioma de imagen se menciona en el repositorio pero no se proporcionan detalles sobre su arquitectura, datos de entrenamiento o metricas especificas. El pipeline completo separa deliberadamente la deteccion (localizador) de la remision en perspectiva, que se realiza con OpenCV, para mantener un fallback compatible con el escaner v1.

## Capacidades

- Deteccion de presencia de una carta en una imagen y localizacion de sus cuatro esquinas, incluso con inclinacion, rotacion o fondos complejos.
- Salida de coordenadas normalizadas de esquinas y un logit de presencia, listas para su uso en transformaciones de perspectiva.
- Clasificacion del idioma de la imagen de la carta entre seis idiomas: aleman, ingles, espanol, frances, italiano y japones.
- Exportacion a ONNX, lo que permite su ejecucion en navegadores mediante ONNX Runtime Web y en entornos de servidor con ONNX Runtime.
- Versionado de releases con ficheros de trazabilidad (model-provenance.json, preprocess.json, training-metrics.json) para control de versiones en produccion.
- No incluye capacidades de generacion de texto, razonamiento, codigo o matematicas; es un modelo puramente de vision.

## Casos de uso

- Escaneo de cartas Pokemon en tiempo real desde la camara de un telefono movil: el localizador detecta la carta y sus esquinas, permitiendo a la aplicacion PokeScania identificar la carta y mostrar su valor de mercado.
- Integracion web de escaneo de cartas: gracias al formato ONNX, el modelo puede ejecutarse en el navegador con ONNX Runtime Web, evitando el envio de imagenes a un servidor y reduciendo la latencia.
- Automatizacion de catalogos de colecciones: el clasificador de idioma permite procesar lotes de imagenes de cartas en diferentes idiomas y organizarlas correctamente en una base de datos.
- Control de calidad en plataformas de venta de cartas: el localizador puede verificar que la carta esta correctamente encuadrada en la imagen antes de su publicacion, reduciendo errores de captura.
- Procesamiento de video para inventario: el modelo puede analizar secuencias de video donde se muestran cartas, detectando cada una y extrayendo sus coordenadas para su posterior procesamiento.
- Sistema de fallback para escaneres existentes: al separar la deteccion de la remision en perspectiva, el modelo puede integrarse en pipelines ya existentes sin reemplazar la logica de transformacion.

## Benchmarks y rendimiento

El repositorio proporciona metricas de validacion para el localizador de cartas:

| Metrica | Valor |
|---|---|
| Loss de validacion | 0,001288 |
| Error medio de esquinas | 0,01966 |
| Precision de presencia | 100% |
| Latencia en GPU (100 imagenes de test) | 0,066 ms/imagen |

La latencia de 0,066 ms/imagen fue medida en GPU con 100 imagenes de test generadas. El autor indica que es una medida de referencia y no una garantia de rendimiento en telefono o navegador. No se han publicado resultados de benchmarks para el clasificador de idioma en la informacion disponible.

## Requisitos de hardware

- El localizador ONNX pesa aproximadamente 6,12 MB, por lo que es adecuado para dispositivos con recursos limitados.
- La latencia de 0,066 ms/imagen se midio en GPU; en CPU o en navegador el rendimiento sera menor, aunque el modelo es ligero.
- No se especifican requisitos minimos de VRAM, pero por el tamano del modelo, cualquier GPU moderna con mas de 1 GB de VRAM deberia ser suficiente.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), ONNX Runtime Web para navegadores, o integracion en pipelines de Python con OpenCV.
- Para uso en produccion, se recomienda anclar una release concreta del repositorio y no usar rutas mutables.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el repositorio ni en los resultados de busqueda web. El localizador de cartas es un modelo especializado para un caso de uso muy concreto (deteccion de cartas Pokemon), por lo que no existen alternativas publicas directamente comparables con las mismas caracteristicas y metricas. Se indica "no disponible" para esta seccion.

## Limitaciones y advertencias

- El modelo esta entrenado con escenas generadas sinteticamente (132.964 escenas), lo que puede limitar su rendimiento en condiciones reales muy diferentes a las simuladas.
- La latencia de 0,066 ms/imagen fue medida en GPU y no es representativa del rendimiento en telefonos o navegadores; el autor advierte explicitamente que no es una garantia de rendimiento.
- El clasificador de idioma no tiene informacion publica sobre su arquitectura, datos de entrenamiento o metricas, por lo que su fiabilidad no puede evaluarse.
- El repositorio no incluye informacion sobre sesgos, riesgos de alucinacion (no aplica al ser un modelo de vision) o limitaciones de contexto.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos de la licencia y la atribucion correspondiente.
- Para produccion, es imprescindible anclar una release o commit conocido y conservar los ficheros de trazabilidad (model-provenance.json, preprocess.json, training-metrics.json) para auditoria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aytronn/pokescania
- Sitio web de PokeScania: https://pokescania.com/en
- No se han encontrado papers, blogs o demos adicionales en la busqueda web.

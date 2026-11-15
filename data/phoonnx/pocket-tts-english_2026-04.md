# Phoonnx/pocket-tts-english_2026-04

## Resumen

`Phoonnx/pocket-tts-english_2026-04` es un paquete de pesos de síntesis de voz (text-to-speech) en inglés, empaquetado por el proyecto Phoonnx para su motor de inferencia ONNX. No es un modelo entrenado por Phoonnx: es una redistribución organizada de uno de los modelos de la familia `phoonnx-pocket-tts`, concretamente la carpeta `english_2026-04`, que conserva las rutas de ficheros del repositorio original. Los pesos subyacentes son de Kyutai, según indica la propia model card al exigir atribución a ese autor.

El modelo se distribuye bajo licencia CC BY 4.0 y está pensado para su uso con la librería `phoonnx`, que ejecuta la inferencia sobre ONNX Runtime. El repositorio ocupa 0,8 GB, lo que sugiere un modelo compacto orientado a despliegue en entornos con recursos limitados o en el propio dispositivo (edge), más que a un servidor de síntesis de alta fidelidad.

La relevancia de este paquete es práctica: ofrece un conjunto cerrado de 26 voces en inglés con identificadores estables (`pockettts/en/<voz>`), lo que facilita la integración en aplicaciones que necesitan seleccionar una voz concreta por nombre. La información pública disponible es escasa (sin número de parámetros, sin arquitectura detallada, sin benchmarks), por lo que esta ficha se limita a lo documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pesos en formato ONNX para el motor phoonnx) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (paquete `english`; la model card no detalla variantes) |
| Licencia | CC BY 4.0 (atribución a Kyutai) |
| Formato de pesos | ONNX (librería `phoonnx`, tag `onnx`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. Los metadatos indican únicamente que los pesos se ejecutan mediante ONNX Runtime a través de la librería `phoonnx` y que el paquete contiene un conjunto de voces predefinidas. El tag `pocket-tts` sugiere un diseño orientado a tamaño reducido y despliegue ligero, pero no se especifican capas, tipo de decoder, vocoder ni mecanismo de condicionamiento de hablante.

Tampoco se documentan datos de entrenamiento: ni número de horas de audio, ni composición del corpus, ni si hubo ajuste fino con RLHF/DPO (poco habitual en TTS) o técnicas de destilación. El modelo original es de Kyutai, según la atribución exigida en la licencia, pero la model card de este paquete no enlaza a la ficha técnica del modelo fuente ni aporta detalles sobre el proceso de entrenamiento.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto.
- Selección de voz mediante identificadores estables: 26 voces disponibles (`alba`, `anna`, `azelma`, `bill_boerst`, `caro_davy`, `charles`, `cosette`, `eponine`, `estelle`, `eve`, `fantine`, `george`, `giovanni`, `jane`, `javert`, `jean`, `juergen`, `lola`, `marius`, `mary`, `michael`, `paul`, `peter_yearsley`, `rafael`, `stuart_bell`, `vera`).
- Ejecución mediante ONNX Runtime a través de la librería `phoonnx`, lo que permite desplegar la inferencia sin depender de frameworks de deep learning pesados.
- No se documentan capacidades de clonación de voz, control de emoción, control de prosodia, multilingüismo, tool calling ni razonamiento (no aplica a un modelo TTS).

## Casos de uso

- Lectura de artículos y documentos: el paquete permite convertir texto plano en audio en inglés seleccionando una de las 26 voces, útil en lectores de pantalla, aplicaciones de accesibilidad o generación de podcasts a partir de texto.
- Asistentes de voz en aplicaciones móviles o de escritorio: al ejecutarse sobre ONNX Runtime y con un repositorio de 0,8 GB, encaja en despliegues locales donde no se quiere enviar el texto a un servicio en la nube.
- Audiolibros y narración automatizada: la disponibilidad de varias voces permite asignar voces distintas a personajes o secciones, manteniendo consistencia mediante el identificador de voz.
- Sistemas de anuncios y notificaciones: generación de mensajes hablados en inglés para aplicaciones de transporte, domótica o avisos internos, con una voz fija configurada por entorno.
- Pruebas y prototipado de pipelines de voz: al ser un paquete autocontenido con rutas de ficheros preservadas, sirve para validar integraciones con `phoonnx` antes de pasar a un modelo de mayor calidad.
- Generación de audio para entornos de desarrollo y test: permite crear fixtures de audio reproducibles en inglés para probar sistemas de reconocimiento de voz o de diálogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (0,8 GB) acota el peso de los ficheros, pero no se especifica el consumo en ejecución.
- GPU recomendadas: no disponible. Al usar ONNX Runtime, es plausible la ejecución en CPU, pero no se documenta ningún requisito ni recomendación.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: librería `phoonnx` sobre ONNX Runtime (según los metadatos). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente a este paquete).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación rigurosa con otras alternativas de TTS.

## Limitaciones y advertencias

- Información técnica muy escasa: no se publican parámetros, arquitectura, contexto ni benchmarks, lo que impide evaluar la calidad de la síntesis antes de probarla.
- Idioma limitado: el paquete es específicamente de inglés; no se documentan otras lenguas en esta carpeta.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribución. La model card especifica que hay que dar crédito a Kyutai, además de cumplir las condiciones de la licencia.
- Riesgo de calidad variable entre voces: al tratarse de 26 voces empaquetadas, no se documenta si todas tienen el mismo nivel de calidad o si algunas son experimentales.
- Sin datos sobre sesgos: no se documenta la composición demográfica ni acústica de las voces, por lo que no se pueden evaluar sesgos de pronunciación o de representación.
- Sin garantías de mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se documenta una política de actualizaciones.
- Dependencia de la librería `phoonnx`: el uso previsto requiere ese motor; no se garantiza la compatibilidad con otros runners ONNX sin adaptación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/pocket-tts-english_2026-04
- Repositorio fuente de la familia de modelos: https://huggingface.co/Phoonnx/phoonnx-pocket-tts
- Librería phoonnx: https://github.com/TigreGotico/phoonnx

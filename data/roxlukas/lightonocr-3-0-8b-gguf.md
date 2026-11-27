# roxlukas/LightOnOCR-3-0.8B-GGUF

## Resumen

LightOnOCR-3-0.8B es un modelo de reconocimiento óptico de caracteres (OCR) basado en visión-lenguaje, desarrollado originalmente por LightOn y distribuido en este repositorio en formato GGUF por el usuario roxlukas. El modelo parte de una arquitectura Qwen3.5 vision-language y está diseñado específicamente para transcribir texto presente en imágenes, con soporte opcional de *grounding* (localización de bloques de texto con etiquetas y cajas delimitadoras). Con 752 millones de parámetros totales, se posiciona como una alternativa ligera frente a modelos OCR de mayor tamaño.

La relevancia de esta conversión GGUF radica en que permite ejecutar el modelo en llama.cpp y Ollama, lo que facilita su despliegue en hardware modesto, incluidas GPU de consumo, sin necesidad de infraestructura dedicada. El repositorio incluye pesos en F16 y Q8_0, además del proyector visual (mmproj) necesario para procesar imágenes.

No obstante, conviene señalar que el autor de la conversión solo ha probado el modelo con imágenes sintéticas de facturas en polaco y no ha publicado benchmarks de las versiones cuantizadas, por lo que el rendimiento real en otros dominios e idiomas no está validado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 vision-language (transformer multimodal con proyector visual) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0 |
| Idiomas soportados | no disponible (probado solo con texto polaco en imágenes sintéticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base lightonai/LightOnOCR-3-0.8B emplea una arquitectura de tipo vision-language basada en Qwen3.5, que combina un codificador visual con un modelo de lenguaje para procesar imágenes y generar texto. La conversión GGUF separa el modelo de texto (F16 o Q8_0) del proyector visual (mmproj en F16), que es obligatorio para el procesamiento de imágenes. La conversión se realizó con `convert_hf_to_gguf.py` de llama.cpp usando `--outtype f16 --no-mtp`, y la cuantización Q8_0 con `llama-quantize` (build b12290).

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El modelo soporta dos modos de prompt definidos en la model card original: un prompt vacío para transcripción plana y el modo `grounding` para obtener bloques con etiquetas y cajas delimitadoras. Otras instrucciones quedan fuera de la distribución para la que fue entrenado.

## Capacidades

- Transcripción de texto presente en imágenes (OCR) mediante prompt vacío.
- Modo *grounding*: devuelve bloques de texto con etiquetas y cajas delimitadoras.
- Procesamiento multimodal imagen-texto gracias al proyector visual incluido.
- Ejecución local en llama.cpp mediante `llama-mtmd-cli`.
- Compatibilidad con Ollama a través del Modelfile incluido, usando el renderer y parser integrados de `qwen3.5`.
- Modo *thinking* desactivable (`"think": false` en API, `--think=false` en CLI), recomendado desactivarlo al invocar el modelo.
- No se documentan capacidades de tool calling, agentes, audio ni otros idiomas más allá del caso de prueba mencionado.

## Casos de uso

- Digitalización de facturas y documentos administrativos: el modelo puede transcribir el texto de imágenes de facturas, un escenario que el autor de la conversión ha probado con imágenes sintéticas en polaco, lo que lo hace adecuado para pipelines de extracción documental.
- Extracción estructurada con *grounding*: usando el modo `grounding`, se pueden obtener bloques de texto con sus coordenadas, útil para reconstruir el layout de documentos escaneados y alimentar sistemas de gestión documental.
- Procesamiento por lotes en local: al ejecutarse en llama.cpp con pesos Q8_0 de 0,8 GB, permite montar un servicio de OCR autoalojado sin dependencia de APIs externas.
- Integración en aplicaciones de escritorio o embebidas: el reducido tamaño del modelo (menos de 800 millones de parámetros) facilita su inclusión en herramientas locales que necesiten OCR sin conexión.
- Preprocesado para pipelines RAG sobre documentos escaneados: la transcripción de páginas a texto permite indexar contenido que de otro modo no sería recuperable.
- Prototipado rápido con Ollama: el Modelfile incluido permite crear una instancia del modelo con un solo comando, adecuado para validar flujos de OCR antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la conversión indica explícitamente que solo se probó con imágenes sintéticas de facturas en polaco y que no se ejecutaron benchmarks sobre las versiones cuantizadas.

## Requisitos de hardware

- VRAM estimada: los pesos Q8_0 ocupan 0,8 GB y el proyector visual 0,2 GB, por lo que la inferencia requiere aproximadamente 1-2 GB de memoria, dependiendo del contexto y del backend.
- Los pesos F16 ocupan 1,5 GB (modelo de texto) más 0,2 GB del proyector visual.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, el modelo cabe holgadamente en GPU de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, dado el reducido tamaño de los pesos.
- Opciones de despliegue: llama.cpp (`llama-mtmd-cli`) y Ollama mediante el Modelfile incluido.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones comparables de modelos alternativos en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| LightOnOCR-3-0.8B (esta conversion) | 752 M | no disponible | Apache 2.0 | GGUF |
| Alternativas OCR comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El autor de la conversión solo ha validado el modelo con imágenes sintéticas de facturas en polaco; el comportamiento en otros dominios, layouts e idiomas no está verificado.
- No se han ejecutado benchmarks sobre las versiones cuantizadas, por lo que puede haber degradación de calidad respecto al modelo original en F16.
- El modelo está entrenado para dos modos de prompt (vacío y `grounding`); otras instrucciones quedan fuera de distribución y pueden producir resultados erróneos.
- Se recomienda desactivar el modo *thinking* al invocar el modelo, según indica el autor.
- No se documentan sesgos conocidos ni riesgos específicos de alucinación más allá de los inherentes a los modelos de lenguaje.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base original.
- El repositorio tiene un número muy bajo de descargas (195) y ninguna valoración, lo que limita la evidencia de uso en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/roxlukas/LightOnOCR-3-0.8B-GGUF
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-0.8B
- llama.cpp (herramienta de conversión y ejecución): no disponible en la información proporcionada
- Ollama: no disponible en la información proporcionada

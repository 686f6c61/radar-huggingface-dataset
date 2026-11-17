# LlamaPal/gemma-4-E4B-it-Q4_K_M-GGUF

## Resumen

Gemma 4 E4B es un modelo multimodal de Google (entrada de imagen y texto, salida de texto) perteneciente a la familia Gemma 4, distribuido originalmente en `google/gemma-4-E4B-it`. Esta ficha concreta, publicada por el usuario LlamaPal, es una cuantización GGUF en formato Q4_K_M de dicho modelo, pensada para ejecución local en dispositivos móviles Android y en cualquier runtime compatible con llama.cpp. El repositorio no aporta pesos nuevos ni ajustes: es una copia byte a byte del fichero generado por Unsloth, con el mismo hash SHA-256.

El modelo base incorpora un modo de razonamiento ("thinking mode") y, según la model card del autor, supera en benchmarks de razonamiento a modelos de la generación anterior hasta siete veces más grandes. El recuento de parámetros en safetensors asciende a 7.518.069.290, lo que sitúa al modelo en la franja de los 7,5 mil millones de parámetros, con un fichero cuantizado de 5,0 GB.

Su relevancia práctica está en el despliegue offline: al ser un GGUF estándar con licencia Apache 2.0, permite inferencia local sin conexión, sin cuenta de usuario y sin enviar datos a servidores externos, tanto en móviles como en equipos de escritorio con llama.cpp, Ollama u otros frontends compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer multimodal de la familia Gemma 4; detalles no especificados en la informacion proporcionada) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el repositorio solo distribuye esta cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (fichero `gemma-4-E4B-it-Q4_K_M.gguf`, 5,0 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. La model card lo describe como un modelo multimodal de tipo image-text-to-text de Google, con soporte de modo de razonamiento, pero no especifica si emplea atención estándar, variantes lineales, mezcla de expertos ni el número de tokens de entrenamiento, la composición del dataset o las etapas de alineación (RLHF/DPO).

Respecto a esta publicación concreta, se trata de una cuantización Q4_K_M generada con llama.cpp e imatrix (según las etiquetas del repositorio) y publicada originalmente por Unsloth. El autor declara que el fichero es una copia sin modificaciones del original, verificado por hash SHA-256 (`85a896a047553e842f25297ee5b031d64ff30147d9c4af17b1e4b394cd1fab87`), por lo que las propiedades de entrenamiento son las del modelo base de Google y no las de un ajuste posterior.

## Capacidades

- Generación de texto conversacional multi-turno (etiqueta `conversational`).
- Entrada multimodal de imagen y texto con salida de texto (`image-text-to-text`), lo que permite describir imágenes, responder preguntas sobre ellas y extraer información visual.
- Modo de razonamiento ("thinking mode"), según la model card del autor.
- Ejecución totalmente offline en dispositivo, sin conexión a internet ni cuenta de usuario.
- Compatibilidad con llama.cpp y cualquier aplicación construida sobre él.
- Etiqueta `endpoints_compatible`, lo que indica compatibilidad con APIs de tipo endpoint en los runtimes que la soportan.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional offline en Android: la app LlamaPal descarga este GGUF y permite chatear sin conexión; el modelo queda residente en el dispositivo y ninguna consulta sale del teléfono, lo que es adecuado para entornos con requisitos de privacidad o conectividad intermitente.
- Descripción y análisis de imágenes en movilidad: al aceptar entrada image-text-to-text, puede usarse para transcribir texto de fotos, describir escenas o responder preguntas sobre una imagen capturada con la cámara, sin subir la imagen a un servicio en la nube.
- Prototipado rápido de aplicaciones de IA local: al ser un GGUF estándar, se carga directamente en llama.cpp para validar prompts, plantillas de chat y flujos multimodales antes de invertir en infraestructura de servidor.
- Procesamiento de documentos sensibles en estaciones de trabajo aisladas: en equipos sin acceso a internet (laboratorios, entornos sanitarios o jurídicos), el modelo puede resumir y extraer información de texto e imágenes localmente.
- Integración en aplicaciones de escritorio basadas en llama.cpp u Ollama: desarrolladores que ya usan estos runtimes pueden añadir un modelo multimodal de 7,5 mil millones de parámetros con un fichero de 5,0 GB, sin dependencias de API externas.
- Educación y experimentación con modelos multimodales: sirve para estudiar el comportamiento de un modelo de razonamiento con visión en hardware de consumo, comparando respuestas con y sin modo thinking.
- Clientes con requisitos de residencia de datos: al no requerir cuenta ni telemetría del proveedor en el flujo de la app, encaja en escenarios donde la política interna exige que los datos no abandonen el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que el modelo supera a modelos de la generación anterior hasta siete veces más grandes en benchmarks de razonamiento, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K ni otros) que puedan tabularse.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero Q4_K_M ocupa 5,0 GB, por lo que se necesita al menos esa cantidad de memoria más el espacio para el contexto KV; en la práctica, un dispositivo con 6-8 GB de RAM disponible para la app es el mínimo razonable para esta cuantización.
- GPU de escritorio recomendadas: no disponible en la información proporcionada; por tamaño, una GPU con 8 GB o más de VRAM (por ejemplo, RTX 3060/4060 en adelante) es el rango típico para un modelo de 7,5 mil millones de parámetros en Q4_K_M, aunque el fabricante no lo especifica.
- GPU de centro de datos: no disponible en la información proporcionada (A100, H100 u otras no se mencionan).
- Compatibilidad con GPU de consumo: sí, por el tamaño del fichero; el autor no detalla modelos concretos.
- Despliegue: llama.cpp y cualquier aplicación construida sobre él (la app LlamaPal es el caso de uso principal documentado); otros runtimes compatibles con GGUF no se mencionan explícitamente.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa. Como referencia estructural, esta publicación se distingue de otras distribuciones del mismo modelo base por su carácter de espejo sin modificaciones (mismo hash que el GGUF de Unsloth) y por su orientación explícita a Android mediante la app LlamaPal.

## Limitaciones y advertencias

- El repositorio no incluye la model card completa del modelo original; para conocer limitaciones, sesgos y términos exactos hay que consultar `unsloth/gemma-4-E4B-it-GGUF` o la documentación de Google.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a los pesos originales; no se han publicado evaluaciones del impacto de esta cuantización en la calidad de las respuestas.
- No se dispone de información sobre sesgos conocidos, tasas de alucinación ni cobertura idiomática del modelo base.
- El modo de razonamiento puede aumentar la latencia y el consumo de tokens; no se documentan parámetros de control en esta ficha.
- Aunque la licencia declarada es Apache 2.0, el enlace apunta a la licencia específica de Gemma 4 de Google; conviene revisar el fichero `LICENSE` del repositorio y los términos del modelo base antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no es el desarrollador original; la trazabilidad depende del hash declarado.
- No se especifican requisitos mínimos de Android, versión de llama.cpp compatible ni tamaño de contexto máximo soportado en móvil.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LlamaPal/gemma-4-E4B-it-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- GGUF original de Unsloth: https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- App LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/

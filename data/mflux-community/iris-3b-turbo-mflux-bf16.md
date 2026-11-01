# mflux-community/iris-3b-turbo-mflux-bf16

## Resumen

Iris-3b-turbo-mflux-bf16 es una conversión comunitaria del modelo de generación de imágenes a partir de texto speridlabs/iris-3b, empaquetada en formato MLX para su ejecución nativa en Apple Silicon. La conversión la mantiene la organización MFlux-Community y no procede de los autores originales del modelo; únicamente se han transformado los pesos a BF16 en el formato que consume MFlux, sin cambios en la arquitectura ni en el entrenamiento subyacente.

El modelo base, Iris-3B en su variante turbo, es un text-to-image de aproximadamente 3.000 millones de parámetros, orientado a generar imágenes de alta resolución (el ejemplo de la model card usa 1024x1024) en hardware de consumo. Esta versión concreta es la compilación BF16 completa, sin cuantización, y ocupa 14,0 GB en el repositorio, por lo que funciona como referencia de máxima fidelidad frente a futuras variantes cuantizadas (Q8, Q6, Q5, Q4, Q3, aún no publicadas en el momento de la conversión).

Su relevancia es práctica: permite ejecutar un generador de imágenes de 3B en un Mac con MLX de forma local, sin depender de servicios en la nube, usando la herramienta de línea de comandos mflux-generate-iris. La conversión se realizó con MFlux 0.24.0 el 27 de octubre de 2026 y hereda sin cambios la licencia del modelo original (iris-3b-license).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion text-to-image; detalles no publicados en la informacion disponible) |
| Parametros totales | aproximadamente 3.000 millones (denominacion "3b" del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (esta version, sin cuantizacion); el resto de variantes Q8, Q6, Q5, Q4 y Q3 figuran como no publicadas |
| Idiomas soportados | no disponible (prompts en ingles en los ejemplos de la model card) |
| Licencia | iris-3b-license (licencia "other" del modelo original) |
| Formato de pesos | safetensors en MLX (BF16) |
| Tamano del repositorio | 14,0 GB |
| Libreria / runtime | mflux (MLX, Apple Silicon) |
| Pipeline | text-to-image |
| Resolucion de ejemplo | 1024 x 1024 |
| Version de conversion | MFlux 0.24.0, 27 de octubre de 2026 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base en la documentacion proporcionada. Por la nomenclatura (text-to-image, parametros en el rango de 3B, generacion a 1024x1024) se trata de un modelo generativo de imagenes condicionado por texto, pero no se especifica si emplea difusion, flow matching u otra formulacion, ni el numero de tokens de entrenamiento, la composicion del dataset o si hubo etapas de ajuste fino con preferencias humanas.

Lo unico verificable es el proceso de conversion: los pesos originales de speridlabs/iris-3b se transformaron a MLX en precision BF16 con MFlux 0.24.0. La model card indica explicitamente que los pesos solo se modificaron mediante la conversion a MLX, de modo que el comportamiento generativo es el del modelo original. La variante "turbo" del nombre sugiere un modelo destilado u optimizado para pocos pasos de inferencia, aunque el numero exacto de pasos no se documenta en la informacion disponible.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) en resoluciones de al menos 1024x1024, segun el ejemplo oficial.
- Ejecucion local en Apple Silicon mediante MLX, sin necesidad de GPU NVIDIA ni de servicios en la nube.
- Control de semilla (--seed) para reproducibilidad de las generaciones.
- Control de dimensiones de salida mediante los parametros --width y --height.
- Cuantizacion al vuelo con la opcion --quantize del runtime MFlux, ademas de la version BF16 completa.
- Descarga automatica de pesos desde HuggingFace en el primer uso, o uso de una copia local con --model.
- No se documentan capacidades de edicion de imagen, inpainting, control estructural (ControlNet), tool calling ni modos de razonamiento; no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de ilustraciones para prototipos de producto: un disenador puede lanzar mflux-generate-iris con un prompt descriptivo y obtener una imagen de 1024x1024 en su Mac, iterando rapidamente sobre variaciones cambiando la semilla.
- Creacion de assets para interfaces y mockups: generar fondos, iconos ilustrados o imagenes de relleno para maquetas web y moviles sin salir del entorno local ni enviar prompts a terceros.
- Exploracion artistica y conceptual: producir series de imagenes con la misma semilla y prompts variados para estudiar como responde el modelo a cambios de vocabulario, util en investigacion sobre modelos generativos.
- Generacion de contenido para documentacion tecnica: ilustrar articulos o presentaciones con imagenes originales, evitando problemas de derechos sobre bancos de imagenes.
- Desarrollo y evaluacion de pipelines de generacion de imagenes: al ser una build BF16 de referencia, sirve para medir la degradacion de calidad de futuras cuantizaciones (Q8 a Q3) sobre el mismo modelo base.
- Uso en entornos con requisitos de privacidad: al ejecutarse completamente en local sobre MLX, los prompts y las imagenes no abandonan la maquina, adecuado para prototipos con contenido sensible.
- Integracion en scripts y flujos automatizados: la interfaz de linea de comandos permite encadenar generaciones por lotes (distintas semillas y prompts) desde shell o desde un orquestador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, evaluaciones humanas) ni comparaciones con otros modelos generativos.

## Requisitos de hardware

- VRAM equivalente: al ser MLX sobre Apple Silicon, la memoria unificada del chip es la que se emplea. El repositorio ocupa 14,0 GB en BF16, por lo que se necesita un Mac con memoria unificada claramente superior a esa cifra para cargar los pesos y ejecutar la inferencia con margen.
- GPU recomendadas: chips Apple Silicon de gama alta con memoria unificada amplia (familias M-series Pro, Max y Ultra). No se documentan requisitos minimos oficiales.
- Cabe en GPU de consumo: si, en el sentido de que esta pensado para hardware de consumo Apple; no esta disenado para GPU NVIDIA ni CUDA.
- Opciones de despliegue: MFlux (mflux-generate-iris) como unica via documentada; tambien es posible descargar los pesos con hf download y apuntar a la copia local. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no son runtimes habituales para este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa. Como referencia estructural, las unicas variantes comparables citadas son las futuras cuantizaciones del mismo modelo (Q8, Q6, Q5, Q4, Q3), aun no publicadas.

| Modelo | Parametros | Formato | Runtime | Licencia | Estado |
|---|---|---|---|---|---|
| iris-3b-turbo-mflux-bf16 | ~3B | MLX BF16 | MFlux | iris-3b-license | Disponible |
| iris-3b-turbo-mflux Q8-Q3 | ~3B | MLX cuantizado | MFlux | iris-3b-license | No publicadas |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Conversion no oficial: la mantiene MFlux-Community, no los autores de iris-3b; no debe tratarse como una release oficial del modelo original.
- Licencia restrictiva potencial: la licencia iris-3b-license es de tipo "other" y se hereda sin cambios; es imprescindible revisar los terminos completos en la model card del modelo original antes de cualquier uso comercial.
- Solo Apple Silicon: al estar en formato MLX, no es utilizable directamente en GPU NVIDIA, CUDA ni en la mayoria de entornos de servidor convencionales.
- Consumo de memoria elevado: la build BF16 ocupa 14,0 GB, lo que limita su uso a equipos con memoria unificada amplia; las variantes cuantizadas que lo reducirian aun no estan publicadas.
- Idiomas no documentados: no se especifica que idiomas de prompt estan soportados; los ejemplos oficiales estan en ingles.
- Riesgo de sesgos y alucinacion visual: no hay informacion sobre la composicion del dataset de entrenamiento ni sobre evaluaciones de sesgo; como todo modelo generativo, puede producir imagenes inexactas, estereotipadas o no fieles al prompt.
- Sin benchmarks publicados: no hay metricas que permitan estimar su calidad frente a alternativas, lo que dificulta una decision informada en produccion.
- Sin garantias de mantenimiento: al ser una conversion comunitaria con 40 descargas y 0 likes en el momento de la consulta, el soporte y las actualizaciones no estan garantizados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-bf16
- Modelo base original: https://huggingface.co/speridlabs/iris-3b
- Repositorio MFlux: https://github.com/filipstrand/mflux
- Organizacion MFlux-Community: https://huggingface.co/mflux-community
- Licencia (referencia en el modelo original): https://huggingface.co/speridlabs/iris-3b

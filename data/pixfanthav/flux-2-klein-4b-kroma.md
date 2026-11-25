# Pixfanthav/FLUX.2-klein-4B-Kroma

## Resumen

FLUX.2-klein-4B-Kroma es una conversión del modelo de generación de imágenes FLUX.2 [klein] 4B, desarrollado originalmente por Black Forest Labs, adaptada por Pixfanthav para su ejecución en la NPU de teléfonos con chipset Snapdragon. El modelo no es un modelo de lenguaje ni un transformer de texto: es un modelo de difusión para síntesis de imágenes, y esta versión concreta ha sido reformateada para encajar en el motor de inferencia de la aplicación Kroma.

La relevancia de esta ficha es acotada: no se trata de un modelo de propósito general reutilizable, sino de un artefacto de despliegue específico. Los pesos han sido convertidos a otro formato numérico y reorganizados en la estructura de directorios que espera el motor de Kroma, de modo que no están pensados para cargarse con bibliotecas estándar como `diffusers`, ComfyUI o vLLM. La aplicación descarga los ficheros por sí misma.

El repositorio ocupa 23,0 GB e incluye el transformer en fp16 junto con variantes cuantizadas a 8 y 4 bits de sus ficheros de bloques, además del codificador de texto (también en versión q8), el VAE y una carpeta `extra`. La licencia declarada es Apache 2.0, heredada del modelo base, y el proyecto Kroma se presenta explícitamente como independiente y no respaldado por los creadores del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para generacion de imagenes (FLUX.2 [klein] 4B); detalles internos de la arquitectura no disponibles |
| Parametros totales | 4B (segun el nombre del modelo base); desglose por componente no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de modelos de lenguaje) |
| Tipos de cuantizacion | fp16 (transformer completo), q8 y q4 (ficheros de bloques del transformer); text_encoder en fp16 y q8 |
| Idiomas soportados | no disponible (el prompting depende del text encoder del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato propietario del motor Kroma (no safetensors estandar, no GGUF); reorganizado en carpetas `transformer`, `transformer_q8`, `transformer_q4`, `text_encoder`, `text_encoder_q8`, `vae`, `extra` |

## Arquitectura y entrenamiento

El modelo subyacente es FLUX.2 [klein] 4B, un modelo de difusión de Black Forest Labs orientado a la generación de imágenes, con aproximadamente 4.000 millones de parámetros. La información disponible no detalla la arquitectura interna (tipo de backbone, mecanismo de atención, esquema de condicionamiento) ni los datos de entrenamiento, el número de tokens o el proceso de alineación del modelo original. Esta ficha no puede cubrir esos aspectos sin inventar datos.

La aportación de esta versión concreta es puramente de conversión y empaquetado. Según la model card, todos los ficheros fueron modificados: los pesos se almacenan en otro formato numérico y se reorganizan en el layout del motor Kroma. El transformer se ofrece en fp16 tal como se publicó, acompañado de variantes q8 y q4 de sus ficheros de bloques (el resto de componentes se comparte con la versión fp16). El codificador de texto también dispone de versión q8. No se documenta ninguna innovación de entrenamiento ni ajuste fino: es un artefacto de despliegue derivado del modelo base.

## Capacidades

- Generación de imágenes a partir de descripciones textuales, heredada de FLUX.2 [klein] 4B.
- Ejecución en la NPU de teléfonos Snapdragon mediante el motor de la aplicación Kroma.
- Tres niveles de precisión seleccionables en la pantalla de descarga de la app: fp16, q8 y q4, lo que permite ajustar el consumo de almacenamiento y memoria al dispositivo.
- Incluye codificador de texto y VAE empaquetados, de modo que la app no necesita componentes externos.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente: no es un modelo de lenguaje.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan modos especiales (thinking, visión de entrada, audio) más allá de la generación de imágenes.

## Casos de uso

- Generación de imágenes en el propio dispositivo: la app Kroma descarga los pesos y ejecuta el modelo en la NPU del Snapdragon, lo que permite crear imágenes sin enviar los prompts a un servidor. Es el caso de uso para el que se publicó este repositorio.
- Prototipado de experiencias creativas móviles: desarrolladores que construyan apps sobre el motor Kroma pueden usar estos ficheros como modelo de referencia para validar el pipeline de descarga, carga y generación en hardware móvil.
- Evaluación de cuantización en NPU: las variantes q8 y q4 permiten comparar calidad visual y consumo de memoria frente a fp16 en un mismo dispositivo, útil para decidir qué formato distribuir por defecto.
- Distribución de artefactos para apps que auto-descargan modelos: el layout por carpetas y la separación por formatos sirven como ejemplo de empaquetado de un modelo de difusión de 4B para entrega fragmentada.
- Investigación sobre despliegue de difusión en hardware de bajo consumo: el repositorio documenta qué componentes se comparten entre precisiones (VAE, codificador de texto) y cuáles se duplican, información útil para estudiar compromisos de memoria.
- Uso educativo sobre formatos de pesos: al no ser safetensors ni GGUF estándar, el repo ilustra cómo un motor propietario puede exigir una conversión completa del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware objetivo: NPU de teléfonos con chipset Qualcomm Snapdragon, a través de la aplicación Kroma. No se documentan otros aceleradores compatibles.
- VRAM estimada: no disponible. El repositorio completo ocupa 23,0 GB, pero la app descarga únicamente los ficheros del formato elegido (fp16, q8 o q4), por lo que el espacio necesario en el dispositivo es menor que el tamaño total del repo. No se especifican cifras por formato.
- GPU de escritorio (A100, H100, RTX 4090): no aplicable según la información disponible; los pesos no están en un formato cargable por las herramientas habituales de escritorio.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: exclusivamente la app Kroma, que gestiona la descarga y ejecución. No se indica compatibilidad con vLLM, llama.cpp, Ollama, TGI, `diffusers` ni ComfyUI; de hecho, la model card afirma que los ficheros no están pensados para cargarse con otro software.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| FLUX.2-klein-4B-Kroma (este) | 4B | Layout propietario Kroma | Apache 2.0 | App Kroma en NPU Snapdragon | Conversion con cuantizacion q8/q4 incluida |
| black-forest-labs/FLUX.2-klein-4B | 4B | Pesos originales del autor | No disponible en esta ficha | Ecosistema estandar de difusion | Modelo base del que deriva esta conversion; detalles no verificados aqui |
| Alternativas de difusion de ~4B para movil | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Los ficheros no son cargables por software distinto de Kroma: no están en safetensors ni GGUF estándar, y la model card lo advierte de forma explícita. No sirven para pipelines convencionales de difusión.
- Proyecto independiente: Kroma no está hecho ni respaldado por Black Forest Labs, según declara el propio autor. La calidad del empaquetado y del motor no está avalada por los creadores del modelo base.
- Trazabilidad limitada: el repositorio tiene 28 descargas y 0 likes en el momento de la consulta, sin benchmarks ni evaluaciones publicadas. No hay evidencia pública de la fidelidad de la conversión respecto al modelo original.
- Riesgo de alucinación visual y sesgos: al no documentarse el proceso de entrenamiento ni los datos del modelo base, no se pueden detallar sesgos conocidos ni tasas de error. Aplica lo que corresponda al FLUX.2 [klein] 4B original, que no se detalla aquí.
- Idiomas: no disponibles. El comportamiento multilingüe del codificador de texto no está documentado en esta ficha.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los ficheros LICENSE y NOTICE del repositorio, ya que la model card indica que usar los ficheros implica aceptar dicha licencia y que todos los pesos fueron modificados.
- Dependencia de la app: cualquier uso práctico queda atado a la aplicación Kroma y a su hoja de ruta; si el proyecto se abandona, los ficheros quedan sin motor que los interprete.
- Espacio en dispositivo: el repo completo son 23,0 GB; la descarga por formatos mitiga el problema, pero no se publican cifras exactas de almacenamiento ni de memoria por variante.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Pixfanthav/FLUX.2-klein-4B-Kroma
- Repositorio de la aplicación Kroma: https://github.com/Pixfanthav/Kroma
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Paper, blog o demo oficiales: no disponibles en la información proporcionada.

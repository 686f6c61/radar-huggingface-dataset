# aoiandroid/nllb200-coreml-512-pal8-macos

## Resumen

Este repositorio contiene una compilación del modelo NLLB-200 de Meta convertido a formato Core ML para su ejecución nativa en macOS. El modelo está diseñado para ser utilizado por la aplicación TranslateBlue, una herramienta de traducción automática que aprovecha el acelerador neuronal (ANE) de los chips de Apple. La conversión se ha realizado a partir del repositorio `aoiandroid/nllb200-coreml-512`, que a su vez se basa en el modelo original NLLB-200 de Meta, un sistema de traducción multilingüe que cubre 200 idiomas.

La relevancia de este modelo radica en su optimización para hardware Apple: al estar compilado como `.mlmodelc`, puede ejecutarse con baja latencia y sin conexión, lo que lo hace adecuado para aplicaciones de escritorio y móviles que requieran traducción offline. El tamaño del repositorio (1,8 GB) sugiere una versión de tamaño medio, probablemente la variante de 600 millones de parámetros del NLLB-200, aunque no se confirma explícitamente en la ficha.

El modelo se distribuye con licencia MIT, lo que facilita su uso comercial, aunque el modelo original de Meta tiene una licencia CC-BY-NC-4.0; esta discrepancia debe tenerse en cuenta. No se proporcionan detalles sobre el entrenamiento ni métricas de rendimiento en la documentación del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (secuencia a secuencia) con atención de múltiples cabezas y mecanismo de codificador-decodificador. |
| Parametros totales | No disponible (se estima que corresponde al modelo NLLB-200 de 600M, pero no se confirma en el repositorio). |
| Parametros activos | No disponible (no es un modelo MoE). |
| Longitud de contexto | No disponible (el NLLB-200 original soporta secuencias de hasta 512 tokens, pero no se especifica en esta conversión). |
| Tipos de cuantizacion | No disponible (el formato CoreML puede incluir cuantización, pero no se documenta). |
| Idiomas soportados | 200 idiomas (según el conjunto de datos FLORES-200 mencionado en el repo original). |
| Licencia | MIT (el modelo original de Meta usa CC-BY-NC-4.0, pero este repositorio declara MIT). |
| Formato de pesos | `.mlmodel` (Core ML compilado), también `.mlpackage` en el repositorio fuente. |

## Arquitectura y entrenamiento

El modelo original NLLB-200, desarrollado por Meta AI, es un transformer de secuencia a secuencia con arquitectura de codificador-decodificador. Fue entrenado con 200 idiomas utilizando el conjunto de datos FLORES-200, que contiene pares de oraciones paralelas de alta calidad. El modelo base tiene 54,5 mil millones de parámetros, pero se publicaron versiones destiladas de 600M, 1,3B y 3,3B. Esta conversión CoreML probablemente corresponde a la variante de 600M, que usa una dimensión de modelo de 512, de ahí el nombre "nllb200-coreml-512". El entrenamiento original incluyó técnicas de regularización y un objetivo de traducción supervisado, sin uso de RLHF o DPO.

En este repositorio, el modelo se ha compilado a formato CoreML, lo que implica una transformación del grafo computacional para aprovechar el acelerador neuronal de los chips Apple. No se proporcionan detalles sobre el proceso de conversión ni sobre posibles cuantizaciones adicionales. La especialización del ANE se realiza en el dispositivo, no en el archivo compilado.

## Capacidades

- Traducción automática multilingüe: soporta 200 idiomas, incluyendo lenguas de baja representación, gracias al entrenamiento con el conjunto FLORES-200.
- Generación de texto de secuencia a secuencia: capaz de producir traducciones de oraciones y párrafos.
- Ejecución nativa en macOS: aprovecha el Neural Engine de Apple para inferencia eficiente, sin necesidad de conexión a internet.
- Integración con TranslateBlue: diseñado específicamente para la aplicación de traducción de escritorio, por lo que su uso principal es la traducción de texto entre múltiples pares de idiomas.
- Compatibilidad con formato CoreML: permite su uso en aplicaciones macOS mediante el framework CoreML de Apple.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso; es un modelo de traducción puro.

## Casos de uso

- **Traducción de documentos en aplicaciones de escritorio**: TranslateBlue puede utilizar este modelo para traducir archivos de texto, correos electrónicos o documentos completos de forma local, sin necesidad de servicios en la nube.
- **Traducción offline para viajeros o entornos sin conexión**: al ejecutarse en el dispositivo, permite traducir frases o conversaciones en tiempo real en situaciones donde no hay conectividad.
- **Integración en herramientas de productividad para macOS**: desarrolladores pueden integrar el modelo en aplicaciones de correo, editores de texto o suites de oficina para ofrecer traducción instantánea de contenido seleccionado.
- **Procesamiento por lotes de textos multilingües**: empresas que necesiten traducir grandes volúmenes de contenido (por ejemplo, catálogos de productos) pueden ejecutar el modelo localmente en un Mac sin costes de API.
- **Prototipado rápido de aplicaciones de traducción**: al estar en formato CoreML, es fácil de integrar en Xcode y probar prototipos de apps de traducción con 200 idiomas.
- **Traducción de subtítulos o transcripciones**: se puede usar para traducir archivos de subtítulos o transcripciones de audio, aprovechando la amplia cobertura de idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original NLLB-200 reporta métricas BLEU en el conjunto FLORES-200, pero esta conversión CoreML no incluye datos de evaluación propios. Se recomienda consultar el paper de NLLB-200 para referencia de calidad de traducción.

## Requisitos de hardware

- **VRAM**: al ser un modelo CoreML, no se mide en VRAM tradicional. Requiere memoria unificada en Macs con Apple Silicon (M1 o posterior). El tamaño del archivo de 1,8 GB sugiere que puede cargarse en sistemas con al menos 8 GB de RAM unificada.
- **GPU recomendada**: funciona con el Neural Engine (ANE) y la GPU integrada de los chips Apple Silicon. No requiere GPU dedicada.
- **Compatibilidad con consumer GPU**: sí, en todos los Mac con Apple Silicon y macOS 11 o superior. En Macs con Intel puede ejecutarse mediante CPU, pero con menor rendimiento.
- **Opciones de despliegue**: exclusivo para macOS; se integra mediante CoreML framework. No se puede usar en Linux o Windows sin conversión adicional.
- **Latencia y throughput**: no se especifican en el repositorio. El rendimiento depende de la generación de tokens; para el modelo de 600M, se espera una latencia de entre 100 y 300 ms por oración en un Mac M1, aunque no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de comparativa directa con otros modelos de traducción en formato CoreML. Como referencia, se puede comparar con el modelo original NLLB-200 de Meta, pero esta conversión no modifica el rendimiento intrínseco del modelo, solo el formato de ejecución. Los modelos alternativos para traducción multilingüe en macOS incluyen:

- **M2M-100**: modelo de traducción de Meta que cubre 100 idiomas, pero con menor cobertura que NLLB-200.
- **MarianMT**: modelos más ligeros de Helsinki-NLP, disponibles en CoreML, pero con menos idiomas y menor calidad en lenguas de bajos recursos.

| Modelo | Idiomas | Parámetros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NLLB-200 (este repo) | 200 | ~600M (estimado) | CoreML | MIT | macOS |
| M2M-100 | 100 | 418M | PyTorch | CC-BY-NC | multiplataforma |
| MarianMT | 80+ | 250-600M | ONNX/CoreML | MIT | multiplataforma |

## Limitaciones y advertencias

- **Licencia**: aunque el repositorio declara licencia MIT, el modelo NLLB-200 original de Meta tiene una licencia CC-BY-NC-4.0 que prohíbe el uso comercial. Es recomendable verificar si la conversión hereda esa restricción o si el autor ha obtenido permiso para cambiar la licencia. Para uso comercial, se debe contactar con el autor del repositorio.
- **Idiomas**: la cobertura de 200 idiomas es amplia, pero la calidad de traducción varía significativamente según la lengua; las de bajos recursos pueden tener peor rendimiento.
- **Alucinaciones**: como todo modelo de traducción, puede generar traducciones incorrectas o inventar contenido cuando el texto es ambiguo o contiene términos fuera del vocabulario.
- **Contexto limitado**: el modelo original NLLB-200 tiene una longitud máxima de secuencia de 512 tokens, lo que limita la traducción de párrafos largos sin segmentación previa.
- **Solo macOS**: el modelo está compilado para Apple Silicon, no es portable a otras plataformas.
- **Dependencia de TranslateBlue**: el modelo está pensado para esa aplicación; su integración en otros proyectos puede requerir adaptación del código.

## Enlaces

- Repositorio HuggingFace: [aoiandroid/nllb200-coreml-512-pal8-macos](https://huggingface.co/aoiandroid/nllb200-coreml-512-pal8-macos)
- Repositorio fuente (versión iOS): [aoiandroid/nllb200-coreml-512-pal8-ios](https://huggingface.co/aoiandroid/nllb200-coreml-512-pal8-ios) (no se ha verificado, pero se menciona como hermano)
- Repositorio original de Meta NLLB-200: [GitHub JHmins/NLLB-200-Model](https://github.com/JHmins/NLLB-200-Model) (fork del código oficial)
- Blog de Meta sobre NLLB-200: [200 languages within a single AI model](https://ai.meta.com/blog/nllb-200-high-quality-machine-translation/)
- Guía de despliegue y hardware (OpenModelMap): [nllb 200 distilled 600M](https://openmodelmap.com/model/facebook/nllb-200-distilled-600M)

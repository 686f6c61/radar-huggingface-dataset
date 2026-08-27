# aoiandroid/nllb200-coreml-1024-float32-macos

## Resumen

El modelo `aoiandroid/nllb200-coreml-1024-float32-macos` es una conversión a Core ML del modelo NLLB-200 distilled 600M de Meta, preparada específicamente para su ejecución en dispositivos macOS. El autor, aoiandroid, ha compilado los paquetes `.mlpackage` a `.mlmodelc` para su uso directo en aplicaciones nativas de Apple, como parte del proyecto TranslateBlue. Este modelo resuelve el problema de la traducción automática neuronal de alta calidad entre 200 idiomas, incluyendo lenguas de bajos recursos, sin necesidad de conexión a internet, aprovechando el Neural Engine de los chips Apple Silicon.

La relevancia actual radica en la creciente demanda de soluciones de traducción offline y privadas en el ecosistema Apple, donde Core ML permite una integración eficiente con bajo consumo energético. El modelo mantiene la arquitectura original de NLLB-200 (transformer encoder-decoder) con 600 millones de parámetros y una longitud máxima de secuencia de 1024 tokens, lo que lo hace adecuado para textos de tamaño medio. Aunque el repositorio no incluye métricas de rendimiento, su origen en el modelo destilado de Meta garantiza una calidad de traducción contrastada en 200 idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (NLLB-200 distilled) |
| Parametros totales | 600 millones |
| Parametros activos | no disponible |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | float32 (sin cuantizacion adicional) |
| Idiomas soportados | 200 idiomas (lista completa no disponible) |
| Licencia | MIT |
| Formato de pesos | Core ML (.mlmodelc, .mlpackage) |

## Arquitectura y entrenamiento

El modelo es una conversión directa de `facebook/nllb-200-distilled-600M`, que a su vez es la versión destilada del modelo NLLB-200 original de Meta. La arquitectura es un transformer encoder-decoder estándar, con 600 millones de parámetros, entrenado para traducción multilingüe entre 200 idiomas. El proceso de destilación redujo el tamaño del modelo original (que superaba los 3.000 millones de parámetros) manteniendo una calidad de traducción cercana, según los resultados publicados por Meta.

En cuanto al entrenamiento, no se dispone de detalles específicos sobre el dataset o el proceso de destilación en la información proporcionada. Sin embargo, se sabe que el modelo original fue entrenado con datos multilingües de alta calidad, incluyendo lenguas de bajos recursos, y que la versión destilada fue optimizada para reducir la latencia y el uso de memoria. La conversión a Core ML no modifica los pesos, sino que los empaqueta en el formato nativo de Apple, lo que permite su ejecución eficiente en el Neural Engine y en la GPU de los dispositivos macOS.

## Capacidades

- Traduccion automatica entre 200 idiomas, incluyendo lenguas de bajos recursos como asturiano, luganda o urdu.
- Inferencia en dispositivo sin conexion a internet, gracias a la compilacion a Core ML.
- Integracion nativa con aplicaciones macOS mediante el framework Core ML.
- Soporte para secuencias de hasta 1024 tokens, adecuado para parrafos y documentos cortos.
- Compatibilidad con el Neural Engine de Apple Silicon para aceleracion por hardware.
- No incluye capacidades de generacion de codigo, razonamiento, tool calling ni agentes, ya que es un modelo puramente de traduccion.

## Casos de uso

- Traduccion offline en aplicaciones de escritorio para macOS: el modelo puede integrarse en apps de productividad o comunicacion para traducir correos, documentos o mensajes sin depender de servicios en la nube, garantizando privacidad y disponibilidad.
- Software de traduccion profesional como TranslateBlue: el modelo sirve como motor de traduccion local, permitiendo a traductores trabajar con 200 idiomas sin costes por API ni latencia de red.
- Asistente de lectura multilingue: una app que detecta el idioma de un texto seleccionado y lo traduce al instante, aprovechando la baja latencia de Core ML en Apple Silicon.
- Traduccion de contenido web para usuarios de bajos recursos: al funcionar offline, permite acceder a informacion en otros idiomas en zonas sin conectividad estable.
- Integracion en pipelines de localizacion: desarrolladores pueden usar el modelo para pre-traducir cadenas de texto en aplicaciones macOS, reduciendo el tiempo de lanzamiento en multiples mercados.
- Educacion y aprendizaje de idiomas: una herramienta que muestra traducciones paralelas de frases en 200 idiomas, facilitando el estudio comparativo sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de calidad de traduccion (BLEU, chrF, etc.) ni comparaciones con otros modelos. Se recomienda consultar los benchmarks del modelo original `facebook/nllb-200-distilled-600M` en Hugging Face para una referencia de calidad, aunque la conversion a Core ML no altera los pesos y, por tanto, el rendimiento cualitativo deberia ser equivalente.

## Requisitos de hardware

- Al ser un modelo Core ML compilado, esta disenado para ejecutarse en dispositivos macOS con Apple Silicon (M1, M2, M3 o superiores) o Intel con soporte para Core ML.
- El tamano del repositorio es de 6.8 GB, lo que sugiere que el modelo compilado ocupa aproximadamente ese espacio en disco. En memoria, al ser float32 y tener 600M de parametros, se estima un uso de VRAM de unos 2.4 GB, aunque no se ha confirmado oficialmente.
- Se recomienda al menos 8 GB de RAM unificada en Apple Silicon para una ejecucion fluida, aunque puede funcionar con menos si se limita el tamano del lote.
- No se requieren GPUs externas; el Neural Engine de Apple Silicon acelera la inferencia, aunque tambien puede usar la GPU integrada.
- Opciones de despliegue: el modelo se integra directamente en aplicaciones macOS mediante Core ML. No es compatible con vLLM, llama.cpp u otros motores de inferencia genericos, ya que su formato es especifico de Apple.
- La latencia y el throughput no estan documentados, pero se espera que sea adecuado para traduccion interactiva en tiempo real en dispositivos modernos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| aoiandroid/nllb200-coreml-1024-float32-macos | 600M | 1024 | 200 | MIT | Core ML |
| facebook/nllb-200-distilled-600M | 600M | 1024 | 200 | CC-BY-NC | PyTorch |
| facebook/nllb-200-3.3B | 3.3B | 1024 | 200 | CC-BY-NC | PyTorch |

La comparativa se limita a los modelos NLLB-200, ya que no se dispone de informacion sobre otras conversiones Core ML de modelos de traduccion. La principal diferencia entre el modelo convertido y el original es el formato: Core ML permite ejecucion nativa en Apple, mientras que el original requiere un framework de Python. La licencia MIT del modelo convertido es mas permisiva que la CC-BY-NC del original, lo que facilita su uso comercial, aunque se debe verificar si la conversion cumple con los terminos de la licencia del modelo fuente.

## Limitaciones y advertencias

- El modelo es una conversion de un modelo destilado, por lo que puede presentar una calidad de traduccion ligeramente inferior al modelo NLLB-200 completo (3.3B parametros), especialmente en lenguas de muy bajos recursos.
- La longitud maxima de contexto es de 1024 tokens, lo que limita la traduccion de documentos largos; para textos extensos se requiere segmentacion previa.
- No se han documentado sesgos especificos, pero el modelo original de NLLB-200 puede reflejar sesgos presentes en los datos de entrenamiento, como desequilibrios de genero o estereotipos culturales.
- La licencia MIT del repositorio no exime de cumplir con la licencia del modelo fuente (`facebook/nllb-200-distilled-600M`), que es CC-BY-NC. Esto implica que el uso comercial puede estar restringido, a menos que se obtenga permiso explicito de Meta.
- Al ser un modelo compilado para macOS, no es portable a otras plataformas (Linux, Windows, iOS) sin una reconversion.
- No se incluyen herramientas de evaluacion ni ejemplos de uso en el repositorio, lo que puede dificultar la verificacion de su correcto funcionamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aoiandroid/nllb200-coreml-1024-float32-macos
- Repositorio fuente (float32): https://huggingface.co/aoiandroid/nllb200-coreml-1024-float32
- Repositorio hermano (iOS): https://huggingface.co/aoiandroid/nllb200-coreml-1024-float32-ios
- Blog de Meta sobre NLLB-200: https://ai.meta.com/blog/nllb-200-high-quality-machine-translation/
- Pagina de investigacion de Meta sobre NLLB: https://ai.meta.com/research/no-language-left-behind/

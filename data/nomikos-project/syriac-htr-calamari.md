# nomikos-project/syriac-htr-calamari

## Resumen

El modelo `nomikos-project/syriac-htr-calamari` es un checkpoint de reconocimiento de texto manuscrito (HTR) específico para manuscritos en siríaco, desarrollado por el proyecto Nomikos. Se publica a través de la plataforma Nomikos, que ofrece un editor de anotación asistido por IA y modelos HTR de código abierto en Hugging Face. El modelo está diseñado para la tarea de transcripción de manuscritos siríacos, un área con escasos recursos digitales y pocas herramientas especializadas.

La arquitectura se basa en Calamari, un framework de OCR/HTR de código abierto que utiliza redes neuronales (típicamente LSTM o CNN) para el reconocimiento de texto a partir de imágenes. El modelo se distribuye en formato Calamari y, según los tags del repositorio, también parece tener pesos en ONNX. No se especifica el número de parámetros ni la longitud de contexto, ya que no es un modelo de lenguaje sino un modelo de visión para OCR.

La relevancia actual radica en la necesidad de digitalizar y transcribir manuscritos históricos en lenguas minoritarias como el siríaco, donde las soluciones comerciales no suelen estar disponibles. Este modelo, junto con la plataforma Nomikos, facilita la anotación y transcripción asistida por IA, reduciendo el trabajo manual de los investigadores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Calamari (framework de OCR/HTR, variante de red neuronal no especificada) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo de OCR, procesa imagenes) |
| Tipos de cuantizacion | no disponible (se menciona ONNX en los tags, sin detalle de cuantizacion) |
| Idiomas soportados | siríaco (syr) |
| Licencia | no disponible |
| Formato de pesos | Calamari (checkpoint), posiblemente ONNX (segun tags) |

## Arquitectura y entrenamiento

Calamari es un framework de OCR/HTR de código abierto, originalmente desarrollado por el grupo de investigación de la Universidad de Würzburg. Utiliza arquitecturas de redes neuronales como LSTM bidireccionales o CNN para el reconocimiento de secuencias de texto a partir de imágenes. El modelo se entrena con datos de manuscritos siríacos, aunque no se proporcionan detalles sobre el conjunto de datos, el número de épocas ni el método de entrenamiento. No hay información sobre innovaciones técnicas específicas más allá del uso del framework Calamari.

## Capacidades

- Reconocimiento de texto manuscrito en siríaco: el modelo transcribe imágenes de manuscritos siríacos a texto digital.
- Integración con la plataforma Nomikos: se puede usar a través del registro de inferencia de Nomikos, con un comando de prefetch para cargar el modelo en caché.
- Formato ONNX: sugiere que puede exportarse para inferencia en otros entornos.
- Tarea específica: transcribe (no realiza otras tareas como detección de regiones o segmentación, aunque Calamari puede hacerlo, este checkpoint está enfocado en transcripción).

## Casos de uso

- Digitalización de manuscritos siríacos en bibliotecas y archivos: el modelo puede transcribir automáticamente páginas escaneadas, reduciendo el trabajo manual de los paleógrafos.
- Anotación asistida en la plataforma Nomikos: los investigadores pueden usar el modelo dentro del editor de Nomikos para obtener transcripciones preliminares y corregirlas.
- Creación de corpus digitales en siríaco: al transcribir grandes volúmenes de manuscritos, se pueden construir corpus para estudios lingüísticos o entrenamiento de modelos de procesamiento de lenguaje natural.
- Preservación del patrimonio cultural: la transcripción digital permite conservar y difundir textos que de otro modo serían inaccesibles.
- Investigación histórica y teológica: los estudiosos del siríaco pueden buscar y analizar textos transcritos digitalmente.
- Integración en pipelines de OCR: al estar disponible en formato ONNX, puede integrarse en sistemas de procesamiento documental más amplios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware. Al ser un modelo de OCR basado en Calamari, probablemente pueda ejecutarse en CPU, pero no hay datos concretos. Se recomienda consultar la documentación de Calamari para estimar requisitos.

## Comparativa con modelos similares

| Modelo | Framework | Idioma | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nomikos-project/syriac-htr-calamari | Calamari | siríaco | HTR | no disponible | Hugging Face |
| kkkamur07/syriac-htr-calamari | Calamari | siríaco | HTR | no disponible | Hugging Face |
| calamari_models_experimental | Calamari | varios (historico) | HTR | no disponible | GitHub |

No se dispone de datos de rendimiento para comparar estos modelos. El modelo de kkkamur07 parece ser el mismo o una copia, mientras que los modelos experimentales de Calamari-OCR cubren material histórico impreso y manuscrito en general, no específicamente siríaco.

## Limitaciones y advertencias

- No se especifica la licencia, por lo que el uso comercial es incierto.
- El modelo está especializado en siríaco, no es multilingüe.
- No hay información sobre el rendimiento en diferentes estilos de escritura o calidad de imagen.
- Al ser un modelo de HTR, puede tener errores en manuscritos muy dañados o con caligrafía inusual.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente o poco probado.
- No se proporcionan datos de entrenamiento, por lo que no se puede evaluar la robustez.

## Enlaces

- HuggingFace: https://huggingface.co/nomikos-project/syriac-htr-calamari
- Nomikos app: https://www.nomikos.app/
- Modelo similar: https://huggingface.co/kkkamur07/syriac-htr-calamari
- GitHub greekOCR: https://github.com/kkkamur07/greekOCR
- Calamari models experimental: https://github.com/Calamari-OCR/calamari_models_experimental

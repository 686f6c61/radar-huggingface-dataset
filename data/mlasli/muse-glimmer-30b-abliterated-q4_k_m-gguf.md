# mlasli/Muse-Glimmer-30B-Abliterated-Q4_K_M-GGUF

## Resumen

Muse Glimmer 30B Abliterated Q4_K_M es una cuantización GGUF de 4 bits del modelo de lenguaje Muse Glimmer 30B, al que se ha aplicado una intervención post-entrenamiento conocida como *abliteration*. Esta técnica modifica los pesos del modelo para suprimir de forma sustancial su mecanismo interno de rechazo, reduciendo la probabilidad de que se niegue a responder a ciertas instrucciones. El resultado es un modelo con una tasa de rechazo mucho menor en contenidos que normalmente serían bloqueados, aunque conserva algunos filtros residuales, especialmente en temática de armas.

El modelo base, Muse Glimmer 30B, es un LLM de aproximadamente 27.850 millones de parámetros (etiquetado como 30B) desarrollado por Meta, con capacidades multimodales que permiten procesar imágenes cuando se combina con un proyector de visión. Esta versión cuantizada en Q4_K_M ocupa unos 18 GB, lo que la hace ejecutable en una GPU de consumo con 24 GB de VRAM o en configuraciones de doble GPU de 12 GB, así como en sistemas con 32 GB de RAM para inferencia solo CPU. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en su doble naturaleza: por un lado, ofrece una cuantización eficiente para hardware de consumo, y por otro, presenta un comportamiento "menos censurado" que puede resultar atractivo para desarrolladores que necesitan respuestas sin filtros en entornos controlados. No obstante, el abliteration conlleva riesgos éticos y legales que deben evaluarse cuidadosamente antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.854.794.240 (aprox. 27,85 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (este repo); tambien disponibles BF16, FP16, Q8_0 y Q6_K en repos asociados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo base (número de capas, tipo de atención, etc.) en la documentación disponible. El nombre "Muse Glimmer 30B" y la referencia a "Meta's official vision encoder" sugieren que se trata de un modelo de la familia de Meta, probablemente basado en una arquitectura transformer densa, pero este dato no se confirma explícitamente.

El proceso de *abliteration* se realizó sobre el modelo BF16 original. Se recogieron estados ocultos en las capas 33 y 52 (65 % de profundidad) a partir de 256 pares de prompts dañinos e inofensivos, ejecutados en una GPU A100 de 80 GB. Se calculó la dirección de rechazo como la diferencia normalizada entre las medias de los estados ocultos de ambos conjuntos, obteniendo una puntuación de separación de 86,34. Posteriormente, se restó una proyección de esta dirección (con un factor α = 0,15) de los pesos `o_proj` y `down_proj` en las 52 capas del modelo. El resultado fue una reducción de la tasa de rechazo de 3/3 a 1/3 en prompts dañinos de prueba: la guía de hacking y el ransomware pasaron a ser respondidos, mientras que el contenido relacionado con armas sigue bloqueado.

La cuantización Q4_K_M utiliza un esquema de 4 bits con cuantización de la caché de clave-valor de tamaño medio. Emplea una estrategia K-quant que aplica precisiones distintas según el tipo de peso (atención frente a MLP) y preserva los valores atípicos mediante bloques de cuantización cuidadosamente dimensionados.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente y contextualizado en tareas de conversación y generación libre.
- Procesamiento de imágenes: cuando se combina con el proyector de visión incluido (`mmproj-Muse-Glimmer-30B-Q4_K_M.gguf`), acepta entrada de imágenes y puede describirlas o responder preguntas sobre ellas. Esta capacidad solo está disponible a través de llama.cpp (`llama-mtmd-cli` o `llama-server --mmproj`), no mediante Ollama.
- Comportamiento "menos censurado": gracias al abliteration, el modelo responde a una mayor variedad de instrucciones que el modelo original, incluyendo contenidos que normalmente serían rechazados (con excepción de armas).
- Conversación: el tag `conversational` indica que está orientado a diálogos multi-turno, aunque no se especifican detalles sobre el manejo de contexto largo.
- No se ha documentado soporte explícito para tool calling, function calling, razonamiento multi-paso ni modos de pensamiento extendido.

## Casos de uso

- Asistencia conversacional sin filtros: el modelo puede emplearse en prototipos o entornos de investigación donde se requiera explorar temas sensibles sin que el sistema se niegue a responder. Por ejemplo, en estudios sociológicos sobre discurso controvertido o en simulaciones de diálogo abierto. Su naturaleza abliterada permite obtener respuestas que otros modelos bloquearían, aunque debe usarse con supervisión humana.
- Análisis de imágenes en entornos controlados: gracias al proyector de visión, puede describir fotografías, extraer información visual o responder preguntas sobre imágenes. Esto es útil en aplicaciones de accesibilidad (descripción de imágenes para personas con discapacidad visual) o en sistemas de moderación de contenido donde se necesita entender el contexto visual.
- Generación de contenido creativo: el modelo puede redactar historias, guiones o diálogos con menos restricciones temáticas, lo que resulta atractivo para escritores o desarrolladores de juegos que necesitan explorar narrativas oscuras o controvertidas.
- Desarrollo de chatbots especializados: al ser un modelo de 30B con buena capacidad de generación, puede integrarse en asistentes virtuales para dominios específicos (soporte técnico, educación, entretenimiento) donde se requiera un tono natural y respuestas detalladas.
- Investigación en alineación y seguridad: el abliteration ofrece un caso de estudio práctico sobre cómo la intervención en pesos afecta al comportamiento de rechazo. Investigadores pueden utilizarlo para comparar el rendimiento entre el modelo original y el abliterado en tareas de seguridad, o para analizar los límites de esta técnica.
- Inferencia en hardware de consumo: al ser una cuantización Q4_K_M de ~18 GB, puede ejecutarse en una GPU RTX 3090/4090 (24 GB) o en configuraciones de doble GPU de 12 GB, lo que permite desplegar un LLM de gran tamaño sin necesidad de infraestructura de servidor. Esto es adecuado para aplicaciones locales, prototipos o entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~18 GB para el archivo GGUF Q4_K_M. Se recomienda una GPU con 24 GB de VRAM (RTX 3090, RTX 4090) para una carga completa, o dividir el modelo entre dos GPU de 12 GB.
- Para inferencia solo CPU, se necesitan al menos 32 GB de RAM, con posibilidad de offload parcial de capas a GPU si se dispone de una tarjeta con menos memoria.
- Opciones de despliegue: llama.cpp (incluyendo `llama-cli`, `llama-server` y `llama-mtmd-cli` para multimodal) y Ollama (solo texto, sin soporte de mmproj).
- No se proporcionan datos de latencia ni throughput. El rendimiento dependerá del hardware y de la configuración de offload.

## Comparativa con modelos similares

No disponible. No se ha proporcionado información sobre modelos comparables de la misma categoría (tamaño o tarea). La única referencia directa es el modelo base BF16, que no es una alternativa sino la versión original sin cuantizar.

## Limitaciones y advertencias

- Modelo abliterado: la intervención en los pesos reduce el rechazo, pero no lo elimina por completo. El contenido relacionado con armas sigue siendo bloqueado.
- Riesgo de uso indebido: al responder a instrucciones dañinas (hacking, ransomware), el modelo puede facilitar actividades ilegales o poco éticas. Debe utilizarse con responsabilidad y cumpliendo las leyes aplicables.
- Pérdida de calidad por cuantización: la cuantización Q4_K_M introduce una pequeña degradación en la calidad de salida en comparación con cuantizaciones de mayor precisión (Q6_K, Q8_0). Para tareas exigentes se recomienda usar Q6_K o Q8_0.
- Efectos sutiles del abliteration: el factor α = 0,15 se eligió de forma conservadora, pero la modificación de pesos puede afectar sutilmente a la coherencia o al estilo de las respuestas.
- Limitaciones del soporte multimodal: la entrada de imágenes solo funciona con llama.cpp; Ollama no soporta archivos mmproj separados. El encoder de visión no ha sido abliterado, por lo que el procesamiento de imágenes mantiene el comportamiento original.
- Idiomas y contexto: no se ha especificado la lista de idiomas soportados ni la longitud máxima de contexto. Se recomienda probar el modelo con los idiomas y longitudes de secuencia previstos antes de usarlo en producción.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento en tareas estándar (MMLU, HumanEval, etc.), lo que dificulta la evaluación comparativa.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/mlasli/Muse-Glimmer-30B-Abliterated-Q4_K_M-GGUF
- Modelo base BF16 (con metodología de abliteration): https://huggingface.co/mlasli/Muse-Glimmer-30B-Abliterated-BF16
- Cuantización FP16 GGUF: https://huggingface.co/mlasli/Muse-Glimmer-30B-Abliterated-FP16-GGUF
- Cuantización Q8_0 GGUF: https://huggingface.co/mlasli/Muse-Glimmer-30B-Abliterated-Q8_0-GGUF
- Cuantización Q6_K GGUF: https://huggingface.co/mlasli/Muse-Glimmer-30B-Abliterated-Q6_K-GGUF
- Modelo original de Meta (referencia): https://huggingface.co/meta-models/Muse-Glimmer-30B

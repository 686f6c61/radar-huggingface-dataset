# lamm-mit/gemma4-jacobian-lenses

## Resumen

Este repositorio contiene los pesos de tres lentes jacobianas (Jacobian lenses) ajustadas de forma independiente sobre el modelo base google/gemma-4-E4B-it, junto con metadatos de procedencia que registran el ajuste y la información del modelo. El trabajo, desarrollado por el Laboratorio para la Mecánica Atomística y Molecular (LAMM) del MIT, se enmarca en el campo de la interpretabilidad de modelos de lenguaje y se describe en el artículo "Reading and Steering Representations of Materials-Science Mechanisms in an Open-Weight Language Model".

El objetivo de estas lentes es leer y dirigir representaciones internas de mecanismos de ciencia de materiales en un modelo de lenguaje abierto. El estudio demuestra que la información sobre mecanismos de ciencia de materiales en el modelo gemma-4-E4B-it se puede separar experimentalmente en tres formas: conceptos legibles en estados ocultos individuales, orientación constitutiva transportada por transformaciones controladas entre estados, y representaciones internas seleccionadas que controlan causalmente las respuestas de ingeniería.

Este repositorio es relevante para investigadores en interpretabilidad, mecanística y seguridad de IA, ya que proporciona los checkpoints de las lentes jacobianas y los protocolos de ajuste necesarios para reproducir los experimentos del artículo. Es un recurso técnico para estudiar cómo los modelos de lenguaje representan conocimiento físico, más que un modelo de generación de texto de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lentes jacobianas sobre google/gemma-4-E4B-it (arquitectura base: no disponible) |
| Parametros totales | no disponible (el repositorio contiene checkpoints de lentes, no el modelo completo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (inferido, no confirmado) |

## Arquitectura y entrenamiento

El repositorio contiene tres checkpoints de lentes jacobianas ajustadas de forma independiente sobre el modelo base google/gemma-4-E4B-it, siguiendo el protocolo descrito en el artículo arXiv:2607.20058. Cada lente se ajustó con una semilla distinta (seeds 0-2) y se incluyen archivos de procedencia (provenance sidecars) que registran la configuración del ajuste y los metadatos del modelo base.

El artículo describe un método que combina lecturas de vocabulario directas y jacobianas, geometría de estados sin opciones, un benchmark contrafactual de 60 leyes e intervenciones causales. En 50 descripciones de materiales, tres lentes jacobianas ajustadas de forma independiente reprodujeron los rangos de conceptos, y conjuntos de palabras sin objetivo de ambas lecturas permitieron la identificación ciega de 9 de 10 familias de mecanismos. Un benchmark separado de 72 prompts produjo vecindarios de estados ocultos específicos de mecanismos, pero una auditoría de grafos mostró que esta organización aparente se explicaba igualmente por comparación numérica.

El estudio comparó prompts idénticos en los que solo se invertía la dirección de la entrada física, observando si el movimiento del estado oculto seguía la ley constitutiva suministrada. Estas transformaciones de estado ordenaron leyes directas, físicamente neutras e inversas en 60 relaciones congeladas y orientaron correctamente 39 de 40 leyes direccionales, mientras que los controles léxicos estaban cerca del azar. Las intervenciones bidireccionales cambiaron las probabilidades de respuesta hacia o desde el resultado físicamente apropiado en los 12 casos emparejados, mientras que los parches de estado contrafactuales transfirieron señales de decisión opuestas entre mecanismos y formatos de respuesta.

## Capacidades

- Lectura de representaciones de conceptos de ciencia de materiales en estados ocultos individuales.
- Orientación causal de la dirección física de las leyes constitutivas mediante transformaciones de estado.
- Control de respuestas de ingeniería mediante intervenciones causales bidireccionales en representaciones internas.
- Identificación de familias de mecanismos (9 de 10) mediante conjuntos de palabras sin objetivo.
- Reproducción de rangos de conceptos con lentes jacobianas ajustadas de forma independiente.
- No es un modelo de generación de texto de propósito general: está diseñado para experimentos de interpretabilidad.

## Casos de uso

- Auditoría de representaciones de conocimiento científico: investigadores pueden usar las lentes jacobianas para auditar si un modelo de lenguaje almacena y utiliza conocimiento físico real en sus estados ocultos, más allá de respuestas correctas superficiales.
- Estudio de mecanismos de causalidad en LLMs: el método permite analizar si las respuestas de un modelo están causalmente controladas por representaciones internas específicas, útil para diseñar intervenciones y correcciones.
- Desarrollo de benchmarks de razonamiento físico: el benchmark contrafactual de 60 leyes y el benchmark de 72 prompts se pueden reutilizar para evaluar la representación de conocimiento físico en otros modelos.
- Investigación en interpretabilidad de modelos de materiales: el repositorio ofrece herramientas para identificar dónde y cómo se codifican conceptos de ciencia de materiales en modelos de lenguaje, lo que puede informar la construcción de modelos más transparentes.
- Reproducción de experimentos científicos: los checkpoints y los metadatos de procedencia permiten reproducir exactamente los experimentos descritos en el artículo, incluyendo el ajuste de las lentes y las intervenciones causales.
- Evaluación de seguridad de modelos: la capacidad de dirigir representaciones internas puede utilizarse para estudiar cómo se pueden manipular las respuestas de un modelo en dominios científicos, con implicaciones para la seguridad y la robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo describe experimentos de interpretabilidad (identificacion de familias de mecanismos, orientacion de leyes direccionales, intervenciones causales) pero no se reportan metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Tamaño del repositorio: 2.4 GB, que corresponde a los checkpoints de las lentes jacobianas, no al modelo base completo.
- Para ejecutar las lentes se requiere cargar el modelo base google/gemma-4-E4B-it, que tiene aproximadamente 4 mil millones de parametros. La VRAM necesaria dependerá del formato y cuantizacion:
  - En precision fp16, se estiman unos 8 GB de VRAM.
  - En cuantizacion 8-bit, unos 4 GB.
  - En cuantizacion 4-bit, unos 2 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) o superior para trabajar con comodidad en fp16; GPUs con 8 GB o mas pueden usar cuantizacion.
- Despliegue: no es un modelo de generacion estandar, por lo que no se recomienda usar vLLM, llama.cpp u Ollama. El uso previsto es mediante el codigo del repositorio GitHub lamm-mit/Substrates, que proporciona el protocolo de ajuste y las rutinas de lectura e intervencion.
- Latencia y throughput: no disponible, no es relevante para el uso previsto.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de lenguaje de proposito general sino un conjunto de herramientas de interpretabilidad especificas para un modelo base concreto. No hay modelos comparables directos en la literatura; el trabajo se enmarca en la linea de investigacion de mecanismos de interpretabilidad en LLMs, pero no existen checkpoints publicos equivalentes que se puedan comparar.

## Limitaciones y advertencias

- No es un modelo de generacion de texto: no se puede usar para tareas de chat, codigo o escritura. Es un recurso de investigacion para interpretabilidad.
- Depende del modelo base google/gemma-4-E4B-it: las lentes jacobianas solo son validas sobre ese modelo base concreto; no son transferibles a otros modelos sin reajustar.
- El estudio muestra que la organizacion aparente de estados ocultos por mecanismo puede estar explicada por comparacion numerica, lo que indica que no toda la estructura interna es causalmente significativa.
- Sesgos: no se han documentado sesgos especificos, pero al ser un modelo de investigacion sobre ciencia de materiales, su alcance es limitado y puede no generalizar a otros dominios.
- Riesgo de alucinacion: no se aplica en el sentido de generacion de texto, pero el estudio advierte que las representaciones internas pueden no reflejar la fisica subyacente de manera fiable en todos los casos.
- Licencia: apache-2.0, permite uso comercial y modificacion, pero el modelo base google/gemma-4-E4B-it tiene su propia licencia (no especificada en el repositorio) que puede imponer restricciones adicionales.
- Para produccion: no es adecuado para sistemas de produccion de NLP; su uso es exclusivamente para investigacion en interpretabilidad.

## Enlaces

- HuggingFace: https://huggingface.co/lamm-mit/gemma4-jacobian-lenses
- Repositorio GitHub (codigo, prompts, protocolos): https://github.com/lamm-mit/Substrates
- Coleccion en HuggingFace (Substrates): https://huggingface.co/collections/lamm-mit/substrates-reading-and-steering-representations-in-llms
- Articulo arXiv (HTML): https://arxiv.org/html/2607.20058
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it

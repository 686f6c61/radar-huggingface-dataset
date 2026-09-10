# FriskyFennec/GigaChat3-10B-A1.8B-base-GGUF

## Resumen

GigaChat3-10B-A1.8B-base-GGUF es una conversion al formato GGUF del modelo base GigaChat3-10B-A1.8B-base de ai-sage, publicada por el usuario FriskyFennec en HuggingFace. Se trata, por tanto, de un artefacto de distribucion (un reempaquetado de pesos para inferencia en CPU y GPU de gama consumer) y no de un modelo entrenado desde cero por el autor del repositorio. La model card es minima: se limita a declarar licencia MIT y a indicar que el resultado es adecuado para experimentos con modelos base y casos de uso de completado de texto.

La denominacion del modelo sugiere una arquitectura de mezcla de expertos con aproximadamente 10 000 millones de parametros totales y unos 1800 millones de parametros activos por token (patron habitual en los modelos MoE actuales). Esta interpretacion procede unicamente del nombre del repositorio y no aparece confirmada en la informacion disponible, por lo que debe verificarse contra la model card del modelo original antes de tomar decisiones de despliegue.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de la familia GigaChat con pesos cuantizados en herramientas como llama.cpp u Ollama, sin necesidad de infraestructura de datacenter. No obstante, el repositorio presenta cero descargas y cero valoraciones, carece de pipeline declarado y no incluye resultados de evaluacion, por lo que debe considerarse un artefacto sin validar por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no la describe; el nombre "10B-A1.8B" sugiere mezcla de expertos con 1,8 B de parametros activos, sin confirmar) |
| Parametros totales | 10 000 millones (segun la denominacion del modelo; no confirmado en la informacion proporcionada) |
| Parametros activos | 1800 millones (segun la denominacion del modelo; solo aplicable si se confirma que es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio es un GGUF, pero la model card no enumera los niveles de cuantizacion incluidos) |
| Idiomas soportados | No disponible |
| Licencia | MIT (declarada en el repositorio de la conversion; la licencia del modelo base original debe verificarse por separado) |
| Formato de pesos | GGUF |
| Autor de la conversion | FriskyFennec |
| Modelo de origen | ai-sage/GigaChat3-10B-A1.8B-base |
| Fecha de creacion del repositorio | 10 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Ultima actualizacion | 10 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo en los materiales proporcionados. La model card de esta conversion GGUF unicamente indica que se trata de una variante GGUF del modelo GigaChat3-10B-A1.8B-base de ai-sage, orientada a experimentos con modelos base y a completado de texto. No se documentan el tipo de atencion, la configuracion de capas, el mecanismo de enrutado de expertos ni el esquema de posiciones.

Tampoco hay datos sobre el proceso de entrenamiento: no se especifican el volumen de tokens, la composicion del dataset, la posible aplicacion de RLHF o DPO, ni ninguna innovacion tecnica concreta. La etiqueta "base" en el nombre indica que se trata de un modelo preentrenado sin ajuste por instrucciones, lo que implica que no responde de forma conversacional por defecto y que su uso natural es la continuacion de texto o el ajuste fino posterior.

La unica transformacion documentada es la propia conversion a GGUF, un formato de serializacion orientado a la inferencia eficiente mediante llama.cpp y ecosistemas compatibles. Esta conversion no altera los pesos en sentido matematico cuando se realiza en precision completa, pero en cuantizaciones con perdida introduce degradacion adicional respecto al modelo original.

## Capacidades

- Generacion y completado de texto: al ser un modelo base, su funcion principal es la continuacion de secuencias a partir de un prefijo dado.
- Razonamiento y conocimiento general: presumiblemente heredados del modelo original, aunque no hay evaluaciones publicadas que lo confirmen.
- Generacion de codigo: no confirmada en la informacion disponible.
- Matematicas: no confirmada en la informacion disponible.
- Vision: no disponible; no se menciona soporte multimodal.
- Tool calling / function calling: no disponible; los modelos base sin ajuste por instrucciones normalmente carecen de esta capacidad de serie.
- Soporte de agentes y razonamiento multi-paso: no disponible; requeriria ajuste por instrucciones o un andamiaje externo de prompting.
- Capacidades multilingues: no disponibles; el modelo original pertenece a la familia GigaChat, historicamente orientada al ruso, pero este extremo no se confirma en la informacion proporcionada.
- Modo de pensamiento explicito (thinking mode): no disponible.
- Audio: no disponible.
- Ajuste fino y aprendizaje por transferencia: al ser un modelo base con pesos abiertos, es apto como punto de partida para entrenamiento adicional.

## Casos de uso

- Experimentacion local con modelos base: cargar los pesos GGUF en llama.cpp u Ollama para estudiar el comportamiento de un modelo preentrenado de gran tamano en hardware de gama consumer, sin depender de servicios en la nube.
- Completado de texto sin conexion: integrar el modelo en editores o herramientas de escritura que funcionen en local, aprovechando que el formato GGUF permite inferencia en CPU cuando no hay GPU disponible.
- Ajuste fino especifico de dominio: utilizar el modelo como inicializacion para entrenamiento supervisado sobre corpus especializados (legal, sanitario, tecnico) mediante tecnicas como LoRA sobre los pesos originales en precision completa.
- Generacion de datos sinteticos: emplear el modelo como generador de texto para producir corpus de preentrenamiento o de aumento de datos, filtrando despues por calidad con un modelo juez.
- Comparativas y evaluacion de pipelines: servir como linea base en arneses de evaluacion internos (por ejemplo, tareas de perplejidad o de completado) para medir el efecto de la cuantizacion frente al modelo original en precision completa.
- Investigacion sobre cuantizacion: comparar distintas variantes GGUF del mismo modelo para cuantificar la perdida de calidad en funcion del numero de bits, un caso de uso habitual en publicaciones de terceros como esta.
- Procesamiento por lotes en servidores sin GPU: dado que el modelo activa una fraccion pequena de parametros si se confirma la arquitectura MoE, el coste por token en CPU puede ser competitivo para tareas de transformacion masiva de texto, como la normalizacion o el resumen por reglas.
- Despliegue educativo y de demostracion: montar una demo de inferencia local en talleres o cursos, sin costes de API y con control total sobre los datos procesados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye cifras de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra metrica, y los resultados de busqueda web asociados no contienen informacion tecnica sobre el modelo. Cualquier cifra de rendimiento deberia obtenerse de la model card del modelo original de ai-sage o de evaluaciones independientes.

## Requisitos de hardware

Las siguientes estimaciones se derivan aritmeticamente de un modelo de 10 000 millones de parametros y no proceden de mediciones publicadas por el autor. Deben tomarse como orientativas y verificarse en el hardware objetivo.

- VRAM estimada segun cuantizacion (solo pesos, sin cache KV):
  - FP16: en torno a 20 GB.
  - Q8_0: en torno a 10,7 GB.
  - Q6_K: en torno a 8,3 GB.
  - Q5_K_M: en torno a 7,1 GB.
  - Q4_K_M: en torno a 6,1 GB.
  - Q3_K_M: en torno a 4,9 GB.
  - Q2_K: en torno a 3,6 GB.
- A la cifra anterior hay que sumar la cache KV, cuyo tamano depende de la longitud de contexto, el numero de capas y el tipo de atencion (GQA reduce considerablemente este coste). Sin conocer la configuracion de atencion no es posible calcularla.
- GPU recomendadas: H100 o A100 de 80 GB para inferencia en precision completa y contextos largos; A100 de 40 GB o L40S para FP16 con contexto moderado; RTX 4090 o RTX 3090 de 24 GB para cuantizaciones Q4 a Q8.
- GPU de gama consumer: si en 16 GB (RTX 4080, RTX 4060 Ti 16 GB) caben con holgura las cuantizaciones Q4 y Q5, y de forma ajustada Q8; en 12 GB (RTX 3060 12 GB, RTX 4070) son viables Q3 y Q4; en 8 GB (RTX 3070, RTX 4060) solo caben Q2 y Q3, con posible descarga parcial a RAM del sistema.
- Si la arquitectura es MoE, la VRAM necesaria para los pesos sigue siendo la del total de parametros (todos los expertos deben estar accesibles), pero el coste computacional por token se aproxima al de un modelo de 1,8 B de parametros activos, con un throughput notablemente superior al de un denso de 10 B.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, KoboldCpp y servidores compatibles con GGUF. vLLM y TGI no consumen GGUF de forma nativa; para esos motores habria que partir de los pesos safetensors del modelo original.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo para este repositorio.

## Comparativa con modelos similares

No se dispone de datos verificados sobre alternativas comparables en la informacion proporcionada. La siguiente tabla recoge unicamente lo que puede afirmarse con la documentacion disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| FriskyFennec/GigaChat3-10B-A1.8B-base-GGUF | 10 000 M totales / 1800 M activos (segun denominacion, sin confirmar) | No disponible | MIT declarada en el repositorio | GGUF | 0 descargas, 0 valoraciones, sin pipeline declarado |
| ai-sage/GigaChat3-10B-A1.8B-base (modelo de origen) | 10 000 M totales / 1800 M activos (segun denominacion, sin confirmar) | No disponible | No disponible en la informacion proporcionada | No disponible (presumiblemente safetensors) | Referenciado en la model card de esta conversion |
| Alternativas MoE de activacion reducida en la misma franja de tamano | No disponible | No disponible | No disponible | No disponible | No se han identificado comparativas en la informacion proporcionada |

Para una comparacion rigurosa habria que consultar la model card del modelo original de ai-sage y evaluaciones independientes frente a otros modelos de tamano similar, algo que excede el alcance de la documentacion disponible.

## Limitaciones y advertencias

- Artefacto de terceros: este repositorio no lo publica el autor del modelo original, sino un usuario independiente. No hay garantia de que la conversion se haya realizado correctamente ni de que los pesos coincidan bit a bit con los del modelo de origen.
- Ausencia total de validacion: cero descargas, cero valoraciones y ningun benchmark publicado. No hay evidencia externa de que la conversion funcione segun lo esperado.
- Modelo base, no ajustado por instrucciones: no mantiene conversaciones ni sigue ordenes de forma fiable. Su uso directo en aplicaciones de chat producira respuestas que continuan el texto en lugar de atender la peticion.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje preentrenado, especialmente en tareas factuales y sin recuperacion aumentada. No existe documentacion que cuantifique este riesgo en este modelo concreto.
- Sesgos: no documentados. Al no haber informacion sobre la composicion del dataset de entrenamiento, no es posible evaluar sesgos de genero, etnicos, politicos o de otro tipo.
- Idiomas: no confirmados. Si el modelo original esta optimizado para ruso, el rendimiento en castellano podria ser sensiblemente inferior al de modelos entrenados con mayor presencia de espanol.
- Licencia: el repositorio declara MIT, pero la licencia del modelo subyacente puede ser distinta y mas restrictiva. Antes de cualquier uso comercial es imprescindible verificar los terminos del modelo original de ai-sage, ya que una conversion no puede relicenciar los pesos de origen.
- Fecha de creacion inusual: los metadatos indican una fecha de septiembre de 2026, posterior a la fecha de referencia habitual. Conviene verificar la autenticidad y la trazabilidad del repositorio.
- Degradacion por cuantizacion: las variantes de baja precision (Q2, Q3) introducen perdida de calidad medible en tareas de razonamiento y codigo. Las cuantizaciones Q4_K_M o superiores son el minimo recomendable para uso serio.
- Sin soporte multimodal ni de tool calling: cualquier caso de uso que requiera vision, audio o llamadas a funciones necesita otro modelo o un andamiaje externo.
- Contexto desconocido: al no documentarse la longitud de contexto, no es posible planificar aplicaciones con documentos largos sin antes inspeccionar el campo correspondiente en los metadatos del archivo GGUF.

## Enlaces

- Repositorio de la conversion GGUF: https://huggingface.co/FriskyFennec/GigaChat3-10B-A1.8B-base-GGUF
- Modelo de origen referenciado en la model card: GigaChat3-10B-A1.8B-base, publicado por la organizacion ai-sage en HuggingFace (URL exacta no confirmada en la informacion proporcionada)
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo. Las paginas devueltas corresponden al area de saneamiento del Ayuntamiento de Yamaguchi (Japon) y no guardan relacion con el modelo.
- Repositorios de herramientas compatibles con GGUF: llama.cpp, Ollama y LM Studio (no se han proporcionado URLs en la informacion disponible).

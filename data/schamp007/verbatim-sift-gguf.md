# schamp007/verbatim-sift-gguf

## Resumen

Verbatim sift es un modelo de clasificación binaria (sí/no) publicado por Saurabh Chaporkar bajo el identificador `schamp007/verbatim-sift-gguf`. Su función es responder a una única pregunta sobre una única frase de una transcripción, por ejemplo si alguien se compromete a realizar una tarea más adelante, para que la aplicación Android Verbatim pueda convertir una transcripción de reunión en notas. El modelo no genera texto libre: solo emite decisiones de tipo sí/no, de modo que las notas resultantes únicamente contienen aquello que se dijo realmente.

Se distribuye exclusivamente en formato GGUF cuantizado (Q4_K_M), con un tamaño de fichero de 619.289.312 bytes (unos 0,58 GB) y un total de 882.430.464 parámetros según los metadatos de safetensors. La licencia es MIT, y el autor indica que se trata de un espejo sin cambios del modelo original, por lo que la nota de copyright original debe acompañar a toda copia.

Su relevancia es acotada pero clara: es un componente especializado de una aplicación concreta, no un modelo conversacional general. Resulta útil como referencia de cómo un modelo pequeño puede resolver una tarea de extracción estructurada con bajo coste de despliegue y sin riesgo de que el modelo invente contenido en las notas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 882.430.464 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`verbatim-sift-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la model card ni en los metadatos disponibles. El recuento de parametros (882.430.464) es coherente con un transformer de aproximadamente 0,9 mil millones de parametros, pero esta inferencia no esta confirmada por el autor. Tampoco se detallan los datos de entrenamiento, el numero de tokens utilizados, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO.

La unica innovacion tecnica documentada es de diseno de producto: el modelo se limita a responder preguntas cerradas de si/no sobre frases individuales de una transcripcion, lo que evita la generacion de texto y, por tanto, reduce el riesgo de que las notas de reunion incluyan contenido no dicho. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones.

## Capacidades

- Clasificacion binaria (si/no) sobre una frase concreta de una transcripcion.
- Extraccion de compromisos de tarea a partir de lenguaje hablado, segun el caso de uso descrito por el autor ("Does someone commit to doing a task later?").
- Salida restringida a decisiones, sin generacion de texto libre.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo opera sobre una frase y una pregunta por invocacion.
- Capacidades multilingues: no disponibles (no se declaran idiomas en la model card).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Generacion de notas de reunion en la app Verbatim: el modelo recibe una frase de la transcripcion y una pregunta cerrada, y su respuesta determina si esa frase se incorpora a las notas. Es adecuado porque su salida binaria impide que se anada texto no pronunciado.
- Deteccion de acciones pendientes en actas: integrado en un pipeline que segmenta la transcripcion frase a frase, permite marcar que intervenciones contienen un compromiso de tarea y cuales no.
- Filtrado previo a resumenes automaticos: al clasificar cada frase, se puede construir un subconjunto de fragmentos relevantes antes de pasarlos a un modelo generativo mayor, reduciendo coste y alucinaciones.
- Despliegue en dispositivo o en servidor modesto: con un fichero GGUF de unos 0,58 GB en Q4_K_M, es viable ejecutarlo en hardware de gama baja o incluso en movil mediante llama.cpp, lo que encaja con el contexto de una app Android.
- Moderacion o triaje de transcripciones: la misma mecanica de pregunta cerrada sirve para etiquetar frases segun criterios definidos (por ejemplo, presencia de decisiones o de riesgos) sin generar contenido.
- Prototipado de clasificadores de texto especializados: sirve como referencia para equipos que quieran sustituir un LLM generativo por un clasificador pequeno en tareas de extraccion estructurada con requisitos estrictos de fidelidad al texto original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 619.289.312 bytes (unos 0,58 GB); con overhead de contexto y runtime, se puede estimar en torno a 1 GB de memoria, aunque no hay mediciones publicadas.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU con al menos 2 GB de memoria libre deberia poder cargarlo; no hay datos oficiales.
- Cabe en GPU de consumo: previsiblemente si, en modelos con 4 GB o mas de VRAM, aunque no esta verificado por el autor.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp y con runtimes derivados como Ollama; la etiqueta `endpoints_compatible` sugiere uso mediante endpoints. No hay informacion sobre soporte en vLLM o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Verbatim sift | 882.430.464 | no disponible | GGUF Q4_K_M | MIT | Clasificador si/no especializado para notas de reunion |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion sobre modelos equivalentes en la busqueda realizada |

## Limitaciones y advertencias

- Ambito muy restringido: solo responde preguntas cerradas sobre frases; no es un modelo conversacional ni generativo.
- Sin informacion sobre sesgos: el autor no documenta evaluaciones de sesgo ni de equidad.
- Riesgo de alucinacion: bajo por diseno al no generar texto, pero puede producir falsos positivos o negativos al clasificar compromisos de tarea, y no hay metricas publicadas de precision o recall.
- Idiomas: no se declaran idiomas soportados; no hay garantia de funcionamiento fuera del idioma o idiomas con los que fue entrenado.
- Contexto: no se especifica la longitud de contexto, por lo que se desconoce el tamano maximo de frase o entrada admitido.
- Licencia MIT: permite uso comercial, pero obliga a conservar la nota de copyright original que el autor indica que acompana al modelo.
- Un unico fichero cuantizado (Q4_K_M): no se ofrecen otras cuantizaciones ni pesos en safetensors, lo que limita el ajuste fino o la conversion a otros formatos sin trabajo adicional.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/schamp007/verbatim-sift-gguf
- Perfil del autor: https://huggingface.co/schamp007

# HatCatFTW/gemma-4-e4b-it_university-v3.1-bands

## Resumen

Este repositorio no contiene un modelo generativo, sino un paquete de sondas de interpretabilidad (un «lens pack») para HAT (Headspace Ambient Transducer), la herramienta de monitorizacion de conceptos desarrollada por el mismo autor. El paquete permite observar, token a token, que areas de conocimiento activa google/gemma-4-E4B-it mientras genera texto. Lo publica el usuario HatCatFTW bajo licencia CC0 1.0 y su peso en disco es de 0,7 GB.

El paquete define 178 conceptos organizados en dos niveles con una ontologia de tipo universitario: 13 Fields (areas amplias de actividad humana) y 165 Universities (areas especializadas dentro de aquellas). Cada concepto dispone de una «lens» formada por tres sondas pequenas que leen el modelo en una capa temprana, una intermedia y una tardia, cada una calibrada contra texto de fondo.

Su relevancia es practica para quien trabaja en interpretabilidad y seguridad de modelos: ofrece una capa de monitorizacion tematica lista para usar sobre un modelo concreto, con una sobrecarga declarada de unos 5 ms por token en una RTX 3090 y una jerarquia que mantiene residentes unas 20 de las 178 lenses a la vez. No es un modelo autonomo: solo funciona con google/gemma-4-E4B-it, cuyos estados ocultos son los que leen las sondas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo generativo: conjunto de sondas (probes) lineales sobre los estados ocultos de google/gemma-4-E4B-it, tres por concepto en capas temprana, media y tardia |
| Parametros totales | No disponible (el paquete ocupa 0,7 GB en disco; no se detalla el numero de parametros de las sondas) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No aplica (el paquete contiene sondas, no pesos de un modelo generativo) |
| Idiomas soportados | No disponible; la ontologia, los contrastes y el texto de prueba estan redactados en ingles |
| Licencia | CC0 1.0 (dominio publico); el uso de Gemma 4 se rige por los terminos de Google |
| Formato de pesos | No disponible |
| Modelo base | google/gemma-4-E4B-it (obligatorio) |
| Numero de conceptos | 178 (13 Fields + 165 Universities) |
| Herramienta compatible | HAT (Headspace Ambient Transducer) |

## Arquitectura y entrenamiento

El paquete se compone de 178 «lenses», una por concepto. Cada lens agrupa tres sondas pequenas que leen las activaciones del modelo base en una capa temprana, una intermedia y una tardia, elegidas como aquellas donde cada concepto se lee con mas fuerza en cada tercio del modelo. Una lens se activa cuando alguna de sus sondas destaca respecto al fondo de esa misma sonda, y reporta la puntuacion en cada profundidad. Las sondas se calibraron sobre estados ocultos de un solo token procedentes de texto reservado. HAT ejecuta el paquete de forma jerarquica: las 13 lenses de nivel Field estan siempre activas y, cuando un Field se dispara, se cargan y puntuan sus Universities; cuando se apaga, se retiran. En regimen normal hay unas 20 lenses residentes.

La ontologia se genero con un modelo que redacto primero los Fields, despues las Universities y, por debajo, Schools, Departments y Courses, cada uno con una descripcion de los temas que cubre; se elimino la formulacion institucional («School of», «Research Group») para que las sondas aprendieran la materia y no la institucion. El texto de entrenamiento de cada concepto combina su propia descripcion, las descripciones de los conceptos subordinados y contrastes del tipo «se diferencia porque» escritos para cada par de conceptos facilmente confundibles (hermanos y similares en otras ramas), sin plantillas. El 30 % de los Departments se excluyo por completo del entrenamiento para usarlos como conjunto de prueba. Las sondas se entrenaron con HatCat sobre activaciones procedentes del prompt y de 20 tokens generados.

## Capacidades

- Monitorizacion tematica token a token: indica que areas de conocimiento activa el modelo base mientras genera, con puntuacion por profundidad (temprana, media y tardia).
- Taxonomia jerarquica de dos niveles: 13 Fields y 165 Universities, con carga y descarga dinamica de las lenses segun se disparan los Fields.
- API de Python mediante `Monitor.from_pretrained(...)`, con iteracion por paso de generacion y listado de las tres detecciones principales por token.
- Interfaz de linea de comandos: `headspace run --chat` para ejecucion puntual y `headspace serve` para visualizacion en navegador en tiempo real.
- Trazas grabadas consultables sin instalacion en el visor publico del proyecto.
- No incluye capacidades generativas propias: la generacion, el razonamiento, el codigo o el soporte de tool calling dependen integramente de google/gemma-4-E4B-it.
- No dispone de modo «thinking», vision ni audio propios; cualquier capacidad multimodal seria la del modelo base.

## Casos de uso

- Auditoria de interpretabilidad en produccion: ejecutar HAT junto al modelo base para registrar, token a token, que campos de conocimiento se activan durante una respuesta y detectar derivas tematicas no previstas en el prompt.
- Investigacion en seguridad de modelos: analizar que areas (por ejemplo, violencia y conflicto o seguridad de la informacion) se encienden ante determinadas entradas, teniendo en cuenta que las lenses miden tema y no intencion.
- Evaluacion de sesgos tematicos: comparar la activacion de Fields entre distintos prompts o variantes de un mismo prompt para estudiar que topicos se asocian de forma sistematica a ciertos grupos o contextos.
- Enrutado de herramientas por dominio: usar la deteccion de Field o University como senal para activar componentes especializados (buscadores, calculadoras, bases de datos) en un pipeline, siempre que la latencia anadida de unos 5 ms por token sea aceptable.
- Docencia y divulgacion: desplegar `headspace serve` para mostrar en un navegador como un modelo de lenguaje reparte su atencion entre disciplinas mientras responde a una pregunta.
- Investigacion mecanicista: reutilizar el pipeline de entrenamiento con HatCat para estudiar en que capas se representa cada concepto y validar metodologias de calibracion de sondas sobre texto reservado.
- Trazabilidad y cumplimiento: conservar las trazas de conceptos activados como evidencia de que areas de conocimiento se han tratado durante una interaccion, dentro de las limitaciones de una taxonomia solo tematica.

## Benchmarks y rendimiento

Unicos resultados publicados por el autor, medidos sobre descripciones de los Departments reservados (texto que las lenses nunca vieron):

| Prueba | Resultado | Azar |
|---|---|---|
| La lens de University distingue sus propios temas del resto (AUROC) | 0,896 | 0,5 |
| La lens de University distingue sus temas de hermanos y vecinos cercanos (AUROC) | 0,822 | 0,5 |
| University correcta en primera posicion, de 165 | 18 % | 0,6 % |
| Field correcto en primera posicion, de 13 | 36 % | 8 % |

El autor senala que la prueba de «primera posicion» es exigente, porque un pasaje sobre farmacologia tambien es en parte quimica y medicina, y las lenses estan disenadas para reflejar esa mezcla. La sobrecarga de monitorizacion declarada es de unos 5 ms por token en una RTX 3090. No hay resultados publicados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K u otros) asociados a este paquete.

## Requisitos de hardware

- El paquete de sondas ocupa 0,7 GB en disco.
- Es obligatorio ejecutar google/gemma-4-E4B-it: las lenses leen sus estados ocultos y el paquete no funciona con otro modelo. Los requisitos de VRAM del modelo base no se detallan en la informacion proporcionada.
- Sobrecarga de monitorizacion reportada por el autor: aproximadamente 5 ms por token adicionales en una RTX 3090.
- Memoria del pack en ejecucion: unas 20 lenses residentes de las 178 simultaneamente, gracias a la carga jerarquica.
- No se confirma si el conjunto (modelo base mas monitorizacion) cabe en GPU de consumo; depende del modelo base y no hay datos al respecto.
- Opciones de despliegue: linea de comandos `headspace run --chat`; servidor local con `headspace serve` (requiere el extra `[serve]`); API de Python con `headspace.Monitor`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput del modelo base: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye paquetes de sondas comparables con datos cuantitativos que permitan una comparacion (parametros, contexto, rendimiento o licencia) frente a este. Se trata, ademas, de un artefacto de interpretabilidad ligado a un unico modelo base, por lo que las alternativas habituales de decodificacion de representaciones no serian directamente equiparables en terminos de metricas.

## Limitaciones y advertencias

- Las lenses son de tema, no de intencion: leer sobre mecanismos de enfermedad y planificar un dano con ese conocimiento se ven igual en las activaciones.
- El sesgo de construccion es relevante: la ontologia, los contrastes y el texto de prueba fueron redactados por modelos, mayoritariamente Gemma. Las cifras de precision proceden de ese tipo de texto; el texto humano y las conversaciones podrian puntuar de forma distinta.
- Cobertura parcial: solo hay dos niveles. Las Schools (2.142 conceptos adicionales) estan en entrenamiento y no forman parte de este paquete.
- Dependencia estricta del modelo base: el paquete solo funciona con google/gemma-4-E4B-it.
- La ontologia y el texto de entrenamiento estan en ingles; el comportamiento con entradas en otros idiomas no esta documentado.
- Riesgo de falsos positivos y negativos en la deteccion, derivado de los valores de AUROC publicados (0,896 y 0,822 segun la prueba), que no equivalen a una clasificacion perfecta.
- Licencia del paquete: CC0 1.0, sin restricciones de uso comercial. No obstante, el uso del modelo base Gemma 4 queda sujeto a los terminos de Google, que son independientes de esta licencia.
- Se trata de un artefacto con 0 descargas y 0 «likes» en el momento de la consulta, sin validacion externa conocida.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/HatCatFTW/gemma-4-e4b-it_university-v3.1-bands
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio de HAT (Headspace Ambient Transducer): https://github.com/p0ss/headspace-ambient-transducer
- Visor de trazas grabadas: https://p0ss.github.io/headspace-ambient-transducer/
- Herramienta de entrenamiento de sondas HatCat: https://github.com/p0ss/HatCat
- Licencia CC0 1.0: https://creativecommons.org/publicdomain/zero/1.0/

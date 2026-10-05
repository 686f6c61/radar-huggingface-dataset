# ConwayResearch/woof-textfiller-4B-4bit-v2.1

## Resumen

woof-textfiller-4B-4bit-v2.1 es un modelo de lenguaje especializado en una tarea muy concreta: generar el texto que debe introducirse en un campo de formulario de un navegador a partir del objetivo del usuario y del contexto de la pagina. Lo desarrolla ConwayResearch y se distribuye bajo licencia Apache 2.0 en Hugging Face, con pesos ya cuantizados a 4 bits y en dos formatos: MLX para Apple Silicon y GGUF para runtimes compatibles.

El modelo tiene 4.205.751.296 parametros reales segun los metadatos de safetensors, es decir, unos 4,2 mil millones, y el repositorio ocupa 5,1 GB, un tamano coherente con incluir copias en MLX y GGUF de una cuantizacion de 4 bits. La salida esperada no es texto libre, sino un objeto JSON con el valor del campo, lo que lo orienta a integrarse en pipelines de automatizacion de navegador (RPA, agentes web, testing end-to-end) y no a servir como chatbot generalista.

Su relevancia actual es la de los modelos pequenos y especializados que se ejecutan en local: al ser una tarea acotada y con contexto procedente de la propia pagina, un modelo de 4B cuantizado puede desplegarse en un portatil o en una GPU de consumo sin coste de API, algo critico cuando la automatizacion implica credenciales, datos personales o sesiones autenticadas. No obstante, la informacion publicada es muy escasa: no hay benchmarks, no se declaran idiomas, no se detalla el pipeline y la model card se limita a describir el uso previsto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la model card ni en los metadatos) |
| Parametros totales | 4.205.751.296 (aprox. 4,2 mil millones) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (segun el nombre del modelo y los directorios `mlx/` y `gguf/`); variantes GGUF concretas no disponibles |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX y GGUF |
| Libreria | mlx |
| Tamano del repositorio | 5,1 GB |
| Tags declarados | mlx, safetensors, gguf, browser-automation, endpoints_compatible, region:us, conversational |
| Fecha de creacion / actualizacion | 2026-10-04 / 2026-10-04 (segun metadatos de Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo. Los metadatos unicamente indican la libreria MLX, el tag `conversational` y el tag `endpoints_compatible`, lo que sugiere un modelo de lenguaje causal con interfaz de chat compatible con endpoints, pero esto es una inferencia a partir de las etiquetas y no una confirmacion del autor. Tampoco se indica si la cuantizacion a 4 bits se aplico sobre los pesos originales con algun metodo concreto (GPTQ, AWQ, group-wise affine de MLX) ni los detalles del calibrado.

Del mismo modo, no hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de tecnicas de alineacion como RLHF, DPO o SFT, ni sobre innovaciones tecnicas destacables. La model card solo describe el contrato de entrada y salida: se le proporcionan el objetivo del usuario, el campo seleccionado y el contexto de la pagina, y devuelve el valor del campo como un objeto JSON de texto. Esa especializacion sugiere un ajuste orientado a la tarea, pero el proceso no esta documentado de forma publica.

## Capacidades

- Rellenado de campos de formulario en navegador: genera el valor a introducir en un campo concreto a partir del objetivo del usuario y del contexto de la pagina.
- Salida estructurada: devuelve el valor del campo como un objeto JSON de texto, lo que facilita el parseo y su integracion en automatizaciones.
- Naturaleza conversacional: incluye el tag `conversational`, aunque no se detalla el formato exacto de plantilla de chat ni el numero de turnos soportados.
- Compatibilidad con endpoints: el tag `endpoints_compatible` apunta a que puede servirse tras una API compatible con el esquema de endpoints de Hugging Face, sin confirmacion oficial.
- Ejecucion local en dos ecosistemas: dispone de pesos MLX para Apple Silicon y GGUF para runtimes compatibles.
- Capacidades multilingues: no disponible. No se declaran idiomas soportados.
- Razonamiento general, codigo, matematicas, vision, audio, tool calling explicito o modo de pensamiento: no disponible en la informacion publicada.

## Casos de uso

- Automatizacion de formularios web en RPA: el modelo recibe el objetivo del usuario y el contexto de la pagina y devuelve el valor del campo, de modo que un bot puede rellenar formularios largos sin reglas codificadas a mano para cada sitio.
- Agentes de navegador con acceso a la web: encaja como modulo especializado dentro de un agente mayor (por ejemplo, uno basado en MCP) que navega, y se encarga unicamente de la subtarea de componer el texto del campo, reduciendo el coste frente a usar un modelo grande para todo.
- Testing end-to-end de aplicaciones web: en suites con Playwright o Selenium puede generar datos de entrada realistas y coherentes con el objetivo declarado, en lugar de cadenas fijas, para cubrir mas variabilidad en los formularios.
- Alta de usuarios y onboarding automatizado: si el proceso requiere muchos campos, el modelo puede inferir valores plausibles a partir del contexto de la pagina y del objetivo, con supervision humana en los pasos sensibles.
- Extraccion y traslado de informacion entre sistemas: dado un contexto de pagina con datos disponibles, puede formular el valor que corresponde a un campo destino en otra aplicacion, util en integraciones entre CRM, ERP o portales administrativos.
- Asistencia a la accesibilidad: como componente de una herramienta que ayuda a personas con dificultades motoras o cognitivas a completar formularios, sugiriendo el contenido del campo a partir de una instruccion breve.
- Despliegue en local con datos sensibles: al ser un modelo pequeno y cuantizado ejecutable en un portatil, permite rellenar formularios con informacion personal o credenciales sin enviar el contexto de la pagina a un servicio en la nube.
- Prototipado de automatizaciones internas: su tamano reducido y su licencia Apache 2.0 permiten probarlo como componente de un flujo propio sin negociar licencias ni asumir costes por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion y la busqueda web no aporta metricas de MMLU, HumanEval, GSM8K ni de tareas especificas de rellenado de formularios para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia a 4 bits: aproximadamente 2,3-2,7 GB solo para los pesos, y del orden de 3,5-4,5 GB contando cache KV y overhead en contextos cortos. Son estimaciones derivadas del numero de parametros y de la cuantizacion declarada, no datos publicados por el autor.
- Apple Silicon: es la plataforma principal, al distribuirse pesos en MLX. Deberia funcionar en equipos con memoria unificada de 8 GB en adelante; 16 GB o mas es recomendable para trabajar con contexto amplio y otras aplicaciones abiertas.
- GPU de consumo: cabe con holgura en tarjetas de 8 GB o mas, como RTX 3060 12 GB, RTX 4060, RTX 4070 o RTX 4090, siempre usando el formato GGUF con un runtime adecuado.
- GPU de datacenter: A100, H100 o L40S son sobredimensionadas para este tamano y solo tendrian sentido para servir muchas replicas en paralelo.
- Opciones de despliegue: mlx-lm para Apple Silicon; llama.cpp, Ollama o LM Studio para la ruta GGUF. vLLM y TGI no se mencionan en la informacion disponible y, dado que los pesos distribuidos son MLX y GGUF, requeririan una conversion previa a formato PyTorch/HF que no esta documentada.
- Latencia y throughput estimados: no disponibles. No hay datos publicados de tokens por segundo ni de latencia de extremo a extremo.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con variantes de la misma familia encontradas en la busqueda web. Para el resto de campos de los modelos comparados no hay datos publicados en esta busqueda.

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| woof-textfiller-4B-4bit-v2.1 | 4.205.751.296 | safetensors MLX, GGUF | no disponible | apache-2.0 | Modelo objeto de esta ficha; 4 bits |
| woof-textfiller-0.8B-onnx-4bit-v2.0 | no disponible (0,8B segun el nombre) | ONNX, 4 bits | no disponible | no disponible | Variante mas pequena de la misma familia, orientada a ONNX |
| woof-1.0-4B | no disponible (4B segun el nombre) | no disponible | no disponible | no disponible | Modelo de la misma organizacion, proposito no detallado en la busqueda |

No se dispone de datos de benchmarks ni de especificaciones completas para establecer comparaciones con alternativas de proposito general del mismo rango de tamano.

## Limitaciones y advertencias

- Rendimiento no verificado: no hay benchmarks publicados y el modelo registra 0 descargas y 0 likes, por lo que no existe validacion independiente de su calidad.
- Riesgo de alucinacion: al generar el valor de un campo a partir del contexto de la pagina, puede inventar datos que no aparecen en ella (nombres, importes, fechas) si el contexto es ambiguo o incompleto. Es imprescindible validar la salida antes de enviarla.
- Inyeccion de prompt a traves del contexto: la entrada incluye contenido de la pagina, que puede estar controlado por un tercero. Un texto hostil en la pagina podria intentar desviar la generacion hacia valores no deseados, por lo que conviene tratar el contexto como entrada no fiable.
- Idiomas no declarados: no se especifica que idiomas soporta. En la practica habria que verificar su comportamiento en castellano antes de usarlo en produccion.
- Longitud de contexto desconocida: al no publicarse la ventana de contexto, no se puede garantizar el rellenado correcto en formularios con paginas muy largas o con muchas instrucciones previas.
- Formato de pesos limitado: solo se distribuyen pesos MLX y GGUF, lo que complica el despliegue en servidores de inferencia de alto rendimiento que trabajan con safetensors en formato PyTorch.
- Licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar los avisos de copyright y licencia, y de indicar los cambios realizados. No hay clausulas de uso aceptable adicionales visibles.
- Fechas de metadatos llamativas: la creacion y la ultima actualizacion figuran como 2026-10-04, una fecha posterior a la habitual en el catalogo; conviene verificar la vigencia del repositorio antes de depender de el.
- Sin soporte declarado: no se documentan plantilla de chat, pipeline, idiomas ni mantenimiento, lo que aumenta el coste de integracion y el riesgo de abandono del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConwayResearch/woof-textfiller-4B-4bit-v2.1
- Variante de la familia en Hugging Face: https://huggingface.co/ConwayResearch/woof-textfiller-0.8B-onnx-4bit-v2.0
- Otro modelo de la organizacion: https://huggingface.co/ConwayResearch/woof-1.0-4B
- Organizacion en GitHub: https://github.com/Conway-Research
- Documentacion: https://docs.conway.tech/
- Sitio web: https://conway.tech/

Nota: los enlaces de GitHub, documentacion y sitio web se encontraron en la busqueda web asociados al nombre "Conway Research / Conway", pero la informacion disponible no confirma de forma explicita que correspondan al mismo autor de este modelo.

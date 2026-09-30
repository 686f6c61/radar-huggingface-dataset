# JohnP1/d1a-e2b

## Resumen

D1A-E2B es un adaptador de tipo LoRA con una cabeza de prediccion (pointer head) sobre el modelo base google/gemma-4-E2B, publicado por el usuario JohnP1 en HuggingFace. El objetivo declarado del proyecto D1A es convertir un documento junto con un conjunto de preguntas tipadas (typed questions) en una probabilidad calibrada para cada opcion de respuesta, todo ello en una sola pasada forward y sin generar texto. Se trata, por tanto, de un modelo de decision y clasificacion, no de un modelo generativo: la salida es una distribucion de probabilidad sobre opciones predefinidas.

El repositorio se encuentra en estado de marcador de posicion: el propio autor indica que el entrenamiento esta en curso y que el checkpoint E2B se publicara mas adelante. Hasta esa primera release, el prototipo disponible es JohnP1/kev-gemma4-e2b. El repositorio no tiene descargas ni likes, y la model card no incluye todavia pesos, resultados de evaluacion ni detalles del dataset de entrenamiento.

El proyecto se apoya en Kev, un framework de Jared Palmer (Apache-2.0), con un fork especifico para dar soporte a Gemma 4 (github.com/jonpol01/kev) y un repositorio de casos de uso demostrativos (github.com/jonpol01/kev-usecases-poc). La relevancia actual del modelo es limitada en terminos practicos, dado que no hay artefactos descargables, pero resulta interesante como propuesta de patron: usar un modelo pequeno como clasificador calibrado multiopcion con esquema tipado, en lugar de recurrir a generacion autoregresiva con parsing posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA mas cabeza de tipo pointer sobre el transformer decoder google/gemma-4-E2B. La arquitectura interna del modelo base no se detalla en la informacion disponible |
| Parametros totales | No disponible. El repositorio aloja un adaptador, no pesos completos. El identificador del modelo base (E2B) sugiere un orden de 2 mil millones de parametros efectivos, sin confirmar por el autor |
| Parametros activos | No aplica: no se describe una arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador. Dependera del soporte del modelo base Gemma 4 E2B en el runtime utilizado |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0, segun la model card. El autor indica que Gemma 4 se distribuye asimismo bajo Apache-2.0 |
| Formato de pesos | Adaptador PEFT/LoRA (library_name: peft). Los pesos aun no se han publicado: el repositorio es un marcador de posicion |
| Modelo base | google/gemma-4-E2B (relacion: adapter) |
| Pipeline declarado | text-classification |
| Libreria | peft |
| Estado del repositorio | Marcador de posicion, entrenamiento en curso |
| Descargas / likes | 0 / 0 |
| Fecha de creacion del repositorio | 2026-09-30, segun HuggingFace |

## Arquitectura y entrenamiento

La informacion disponible describe un adaptador LoRA anadido sobre google/gemma-4-E2B junto con una cabeza de prediccion de tipo pointer. El flujo de inferencia propuesto es: entra un documento y un conjunto de preguntas tipadas; sale una probabilidad calibrada por cada opcion posible, en una unica pasada forward. No hay decodificacion autoregresiva ni generacion de texto libre, lo que implica que el coste computacional de inferencia es el de un solo paso hacia delante sobre el encoder-decoder del modelo base, mas el calculo de la cabeza.

El autor no especifica en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de ajuste por preferencias (RLHF, DPO u otras). Tampoco se detalla el mecanismo de calibracion de probabilidades ni como se define la funcion de perdida sobre la cabeza pointer. Los unicos indicios de diseno son el uso de preguntas tipadas (typesafe) como entrada estructurada y la etiqueta calibration entre las etiquetas del repositorio, lo que apunta a que el entrenamiento persigue que las probabilidades de salida sean interpretables como frecuencias relativas y no solo como scores comparativos.

No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o mecanismos hibridos SSM. El unico elemento diferencial respecto a un ajuste fino clasico es la combinacion de adaptador LoRA con cabeza pointer y el enfasis en calibracion sobre opciones multiples.

## Capacidades

- Clasificacion de documentos contra conjuntos de preguntas tipadas, devolviendo una probabilidad por opcion en lugar de texto generado.
- Prediccion calibrada en una sola pasada forward, sin generacion autoregresiva, lo que reduce la latencia frente a esquemas de prompting mas parsing.
- Soporte de esquemas con tipado estricto de preguntas y opciones (etiqueta typesafe), lo que facilita la integracion en pipelines con contratos de datos definidos.
- Salida estructurada y determinista en formato: distribucion de probabilidad sobre opciones predefinidas.
- Capacidad multilingue: no disponible. La model card no declara idiomas soportados; heredara, en su caso, los del modelo base.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado. El diseno apunta en la direccion opuesta, a una unica pasada sin cadena de pensamiento.
- Capacidades especiales (modo thinking, vision, audio): no documentadas para este adaptador. Dependeran de las capacidades del modelo base.
- Pesos publicados: no disponibles en este repositorio en el momento de redactar la ficha.

## Casos de uso

- Triaje documental en back office: dado un expediente y un formulario de preguntas cerradas (tipo de documento, urgencia, departamento responsable), el modelo devuelve probabilidades por opcion y permite enrutar automaticamente con umbrales de confianza. El diseno de una sola pasada encaja con volumenes altos de documentos donde no se necesita texto explicativo.
- Revision de contratos y clausulas: con preguntas tipadas como "existe clausula de renovacion automatica" o "la jurisdiccion es la indicada", se obtiene una probabilidad por respuesta que puede alimentar reglas de negocio o una cola de revision humana cuando la confianza es baja.
- Clasificacion de tickets de soporte: extraccion de categoria, severidad y producto afectado a partir del texto libre del ticket, con salida calibrada que permita umbrales distintos por severidad.
- Cumplimiento normativo y auditoria: verificacion de conjuntos de requisitos sobre politicas internas, generando un vector de probabilidades por requisito que sirva como evidencia preliminar antes de la validacion formal.
- Moderacion de contenido con criterios multiples: evaluacion de un texto contra un conjunto de politicas tipadas, devolviendo una probabilidad por politica en lugar de una unica etiqueta, lo que permite priorizar la revision humana segun el riesgo estimado.
- Enrutamiento de consultas en sistemas RAG: uso del modelo como clasificador previo que decide que indice o herramienta debe atender una consulta, aprovechando la salida calibrada para abstenerse cuando ninguna opcion supera el umbral.
- Extraccion de campos estructurados en formularios: dada una pregunta tipada por campo, obtener la probabilidad de cada valor candidato y aplicar reglas de desambiguacion.
- Experimentacion academica sobre calibracion: el patron adaptador mas cabeza pointer sobre un modelo pequeno sirve como banco de pruebas para comparar calibracion frente a clasificadores entrenados desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calibracion (ECE, Brier score), exactitud, F1 ni comparaciones con lineas base. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- No hay requisitos publicados por el autor. Las cifras siguientes son estimaciones orientativas derivadas del orden de magnitud del modelo base (~2B de parametros segun el identificador E2B, sin confirmar) y deben tratarse como referencia, no como datos verificados.
- Inferencia en FP16: en torno a 4 GB solo para pesos, mas cache KV y overhead del runtime; en la practica, del orden de 6 a 10 GB de VRAM.
- Inferencia en INT8: aproximadamente 2 GB de pesos; del orden de 4 a 6 GB de VRAM contando overhead.
- Inferencia en INT4: aproximadamente 1,2 a 1,5 GB de pesos; del orden de 3 a 5 GB de VRAM, dependiendo de la longitud de contexto.
- GPU consumer: con esas estimaciones cabria en tarjetas de 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 3070), y con margen amplio en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores. No confirmado para este adaptador.
- GPU de datacenter: A100, H100, L40S y similares no serian necesarias por VRAM; se justificarian por concurrencia y throughput agregado, no por requisitos de memoria.
- CPU: plausible para cuantizacion INT4 mediante llama.cpp u Ollama, siempre que exista conversion GGUF del modelo base con el adaptador fusionado. No confirmado.
- Opciones de despliegue: el repositorio usa la libreria peft, por lo que la carga del adaptador requiere el ecosistema HuggingFace (transformers mas peft). El soporte en vLLM, TGI, llama.cpp u Ollama no esta documentado. La cabeza pointer y el flujo de preguntas tipadas dependen del codigo de github.com/jonpol01/d1a.
- Latencia y throughput: no disponibles. Cualitativamente, el diseno de una unica pasada sin decodificacion autoregresiva situa la latencia en el orden de un solo paso de inferencia, muy por debajo de un esquema de generacion mas parsing, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se han encontrado en la informacion disponible modelos directamente comparables de clasificacion calibrada publicados con este mismo patron. La comparacion mas util es con el modelo base y con el prototipo previo del mismo autor.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JohnP1/d1a-e2b | No disponible (adaptador sobre Gemma 4 E2B) | No disponible | No publicado | Apache-2.0 | Pesos no publicados; repositorio marcador de posicion |
| google/gemma-4-E2B | No disponible (identificador E2B sugiere ~2B efectivos) | No disponible | No disponible en la informacion proporcionada | Apache-2.0 segun la model card de D1A | Modelo base publicado por Google |
| JohnP1/kev-gemma4-e2b | No disponible | No disponible | No publicado | No disponible en la informacion proporcionada | Prototipo citado como checkpoint provisional |

## Limitaciones y advertencias

- El repositorio es un marcador de posicion: no contiene pesos utilizables. Cualquier evaluacion practica debe hacerse, en su caso, sobre JohnP1/kev-gemma4-e2b.
- No hay resultados de calibracion publicados, pese a que la calibracion es la propuesta central del modelo. La afirmacion de que las probabilidades estan calibradas no esta respaldada por metricas en la informacion disponible.
- No se declaran idiomas soportados. El comportamiento en castellano es indeterminado y dependera del modelo base y de los datos de ajuste, no documentados.
- Riesgo de errores de clasificacion y de sesgo: al ser un modelo de decision sobre opciones cerradas, hereda los sesgos del modelo base y los del dataset de ajuste, que no se describe. No puede matizar ni justificar su respuesta, ya que no genera texto.
- La salida calibrada puede degradarse fuera de la distribucion de entrenamiento (dominios, formatos de documento o idiomas no vistos). Sin informacion sobre el dataset, no es posible acotar ese riesgo.
- Riesgo de alucinacion bajo: al no generar texto libre, no puede inventar contenido; el modo de fallo tipico sera una asignacion erronea de probabilidad, no una respuesta fabricada.
- Restricciones de licencia: la model card declara Apache-2.0 y atribuye la misma licencia a Gemma 4. Conviene verificar la licencia vigente del modelo base en el repositorio oficial de Google antes de un uso comercial, ya que los terminos de las familias Gemma han variado historicamente entre versiones.
- Dependencia de codigo externo: el flujo de preguntas tipadas y la cabeza pointer requieren el codigo de github.com/jonpol01/d1a y del fork github.com/jonpol01/kev. No hay garantia de mantenimiento ni de compatibilidad futura.
- Madurez: 0 descargas y 0 likes, sin publicacion ni versionado. No es apto para produccion en este estado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JohnP1/d1a-e2b
- Checkpoint prototipo citado por el autor: https://huggingface.co/JohnP1/kev-gemma4-e2b
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Codigo del proyecto D1A: https://github.com/jonpol01/d1a
- Framework Kev, de Jared Palmer: https://github.com/jaredpalmer/kev
- Fork de Kev con soporte para Gemma 4: https://github.com/jonpol01/kev
- Repositorio de casos de uso demostrativos: https://github.com/jonpol01/kev-usecases-poc
- Guia externa sobre ejecucion local de Gemma 4 con LM Studio (contexto del modelo base): https://dev.to/kushang_tailor/running-gemma-4-locally-with-lm-studio-complete-setup-guide-real-use-cases-3np3
- No se han encontrado en la busqueda web papers, informes tecnicos ni evaluaciones especificas de D1A-E2B. Los restantes resultados de busqueda (agregadores de modelos y plataformas de ejecucion de agentes) no aportan informacion sobre este modelo.

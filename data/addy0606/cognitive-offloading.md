# addy0606/cognitive-offloading

## Resumen

`addy0606/cognitive-offloading` no es un modelo generativo al uso, sino un paquete de artefactos para un sistema de deteccion y prevencion del "offloading cognitivo" en entornos educativos. Contiene dos componentes entrenados: un clasificador binario construido sobre `microsoft/deberta-base` afinado para detectar cuando un estudiante externaliza el esfuerzo cognitivo (por ejemplo, pidiendo la respuesta directa en lugar de ayuda para razonarla), y una red de politica Deep Q-Network (DQN) entrenada por refuerzo para seleccionar la intervencion pedagogica adecuada entre cuatro acciones (`redirect`, `scaffold`, `socratic`, `delay`).

El interes del artefacto es su planteamiento en dos etapas: primero se detecta la conducta, despues se decide la respuesta pedagogica optimizando un compromiso entre ganancia de aprendizaje y friccion o desenganche del alumno. Es un caso poco habitual de RL aplicado a politica educativa sobre un encoder transformer pequeno, publicado bajo licencia MIT junto con el codigo fuente en GitHub.

Ahora bien, el repositorio tiene cero descargas y cero likes, no incluye resultados de evaluacion ni detalles del dataset de entrenamiento, y la model card es minima. Se debe tratar como material de investigacion reproducible con precauciones, no como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos componentes: (1) clasificador encoder-only sobre `microsoft/deberta-base` con cabeza MLP de 2 capas (`768 -> 256 -> 64 -> 2`); (2) red de politica Deep Q-Network (DQN) para seleccion de acciones discretas |
| Parametros totales | Backbone DeBERTa-base: no declarado en el repositorio (la ficha oficial de `microsoft/deberta-base` indica ~139M, dato no verificado aqui). Cabeza MLP: ~214K parametros calculados a partir de las dimensiones `768 -> 256 -> 64 -> 2`. Red de politica DQN: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el backbone DeBERTa-base admite 512 tokens como maximo segun su configuracion estandar (no verificado en este repositorio) |
| Tipos de cuantizacion | no disponible; no se documentan variantes GGUF, AWQ, GPTQ ni cuantizacion INT8. Los pesos se distribuyen sin cuantizar (`model.safetensors` y ficheros `.pth`) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el backbone base es principalmente ingles, extremo no confirmado para este afinado) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (backbone), `.pth` (cabeza de clasificacion y red de politica), `config.json` y ficheros de tokenizer |
| Tamano del repositorio | 0,6 GB |
| Pipeline declarado en HuggingFace | `reinforcement-learning` |
| Libreria | `transformers` (backbone) + PyTorch (cabeza y politica) |
| Fecha de publicacion | 2026-10-27 (creacion y ultima actualizacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El primer componente es un clasificador de texto derivado de `microsoft/deberta-base`. El repositorio guarda por separado el backbone (`backbone/`, con tokenizer y `model.safetensors`) y la cabeza de clasificacion (`head.pth`), una MLP de dos capas con dimensiones `768 -> 256 -> 64 -> 2` que proyecta el embedding del token de clasificacion a dos logits (conducta de offloading / extraccion de respuesta frente a su ausencia). El hecho de separar backbone y cabeza implica que el clasificador se uso en modo extraccion de caracteristicas o con la cabeza sustituida, aunque la model card no detalla si el backbone se congelo durante el afinado ni cuantos epochs se entrenaron.

El segundo componente es una red de politica DQN (`policy_network_v1.pth`) entrenada por refuerzo para elegir entre cuatro intervenciones pedagogicas: `redirect`, `scaffold`, `socratic` y `delay`. La funcion de recompensa declarada busca equilibrar la ganancia de aprendizaje con la friccion en el compromiso del estudiante. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, el numero de episodios de RL, la arquitectura interna de la red Q, el valor de descuento ni la estrategia de exploracion. No se menciona RLHF ni DPO: el paradigma es RL basado en valores sobre un espacio de acciones discreto y pequeno, no aprendizaje de preferencias sobre texto generado. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.), algo coherente con un encoder discriminativo.

## Capacidades

- Clasificacion binaria de mensajes de estudiantes para detectar conductas de offloading cognitivo o extraccion directa de respuestas.
- Seleccion de politica de intervencion entre cuatro acciones discretas (`redirect`, `scaffold`, `socratic`, `delay`) mediante los valores Q de la red DQN.
- Procesamiento de mensajes cortos de chat educativo (turnos individuales), no de documentos largos.
- Salida de logits de clasificacion (2 clases) y de valores Q por accion (4 acciones), apta para integrarse en un pipeline de decision.
- No genera texto: no hay capacidad de redaccion, resumen, traduccion ni codigo.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico autonomo; la "agentividad" se limita a la seleccion de una accion por turno.
- Capacidades multilingues: no disponibles/no declaradas.
- Vision, audio y modalidades adicionales: no disponibles.
- No dispone de modo "thinking" ni de proceso de razonamiento explicito; la trazabilidad se limita a la probabilidad de la clase y a los valores Q.

## Casos de uso

- Deteccion en tiempo real en plataformas de tutoria: el clasificador evalua cada mensaje del alumno y marca aquellos que piden la solucion completa en lugar de guia; al ser un encoder de ~139M parametros puede ejecutarse en linea por turno de conversacion.
- Enrutado adaptativo de la respuesta del tutor: cuando se detecta offloading, la red DQN elige entre redirigir la peticion, ofrecer un andamiaje parcial, plantear una pregunta socratica o introducir una pausa, sustituyendo una regla fija por una politica aprendida.
- Moderacion de asistentes de deberes: integrar el clasificador como filtro previo a un LLM generativo, de modo que las peticiones de "respuesta directa" se reformulen antes de llegar al modelo grande, reduciendo coste y dependencia.
- Analitica para docentes: agregar las probabilidades de offloading por estudiante y por sesion para generar informes de patrones de dependencia de la IA en un curso, sin necesidad de generar texto.
- Investigacion en politicas pedagogicas con RL: usar el entorno y la politica publicados en el repositorio de GitHub como base para experimentos de evaluacion offline, comparacion de funciones de recompensa o estudio del gap simulacion-realidad.
- Prototipado rapido de interfaces educativas: el repositorio incluye una interfaz Flask que permite conectar clasificador y politica a un chat de pruebas en pocas horas, util para validar hipotesis de producto antes de invertir en modelos mayores.
- Despliegue en infraestructura limitada: al ser un encoder pequeno con cabeza MLP, cabe en CPU o en una GPU de gama baja, lo que permite escenarios de computo en el borde o en centros educativos con recursos restringidos.
- Control de calidad de prompts en entornos corporativos de formacion: adaptar la taxonomia de "extraccion de respuesta" a otros dominios donde se quiera medir dependencia excesiva de asistentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye exactitud, F1, AUC ni matrices de confusion del clasificador, ni curvas de recompensa, retorno medio o tasas de exito de la politica DQN. Tampoco se documenta el tamano ni la procedencia del conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada: el backbone en `safetensors` ocupa aproximadamente 0,5-0,6 GB en el repositorio (coherente con pesos sin cuantizar de un encoder de ~139M parametros); la cabeza y la red de politica anaden unos pocos MB. La inferencia en fp32 requiere del orden de 1-2 GB de VRAM o RAM, incluyendo activaciones y overhead del runtime.
- GPU recomendadas: cualquier GPU con 2 GB o mas de memoria es suficiente (GTX 1650, RTX 3060/4060/4070/4090, T4, L4, A10G). No se requiere A100 ni H100; usar estas GPU solo tendria sentido para procesamiento por lotes a gran escala.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada de los ultimos ocho anos, y tambien en CPU para cargas moderadas.
- Opciones de despliegue: `transformers` + PyTorch para el backbone, carga manual de `head.pth` y `policy_network_v1.pth` con `torch.load`, y la interfaz Flask del repositorio de GitHub para pruebas. No se documenta soporte de vLLM, TGI, llama.cpp u Ollama, que ademas no aplican a un encoder discriminativo. La exportacion a ONNX o TorchScript es posible en teoria, pero no esta documentada.
- Latencia y throughput: no se publican mediciones. Para un encoder de este tamano se puede esperar latencia de decenas de milisegundos por mensaje corto en GPU consumer y de pocos cientos en CPU, pero es una estimacion no verificada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `addy0606/cognitive-offloading` | ~139M (backbone) + cabeza MLP + DQN no cuantificada | no disponible (512 en el backbone estandar) | Clasificacion de conducta + seleccion de politica pedagogica | MIT | HuggingFace + GitHub, 0 descargas |
| Clasificador afinado generico sobre `microsoft/deberta-base` | ~139M | 512 tokens | Clasificacion de texto binaria/multiclase | MIT (backbone) | Amplia en HuggingFace Hub |
| Clasificador afinado sobre `distilbert-base-uncased` | ~66M | 512 tokens | Clasificacion de texto, menor coste y precision tipicamente inferior | Apache 2.0 (backbone) | Amplia en HuggingFace Hub |
| "LLM como juez" (modelo generativo tipo 7-8B instruido) | 7-8B | 8K-128K segun modelo | Deteccion y decision mediante prompting | variable | Amplia, pero con coste de inferencia muy superior |

Las alternativas de la tabla son referencias genericas de categoria: no se dispone de resultados comparativos publicados que permitan afirmar que este modelo supera o es superado por ellas en la tarea concreta de deteccion de offloading cognitivo.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay metricas del clasificador ni de la politica, ni tamano o composicion del dataset, lo que impide estimar su calidad real.
- Riesgo alto de falsos positivos: una peticion legitima de ayuda o una aclaracion conceptual puede clasificarse como extraccion de respuesta y penalizar al estudiante con una intervencion innecesaria.
- Sesgos desconocidos: al no declararse la procedencia de los datos, no se puede evaluar el sesgo por idioma, nivel educativo, estilo de escritura, origen o tipo de institucion.
- Idioma no declarado: es probable que el modelo solo funcione razonablemente en el idioma de entrenamiento; no se confirma soporte de castellano.
- Ambito muy restringido: entradas cortas de chat educativo; su uso fuera de ese dominio no esta validado.
- Politica DQN entrenada en simulacion: cabe esperar un gap entre simulacion y realidad, sensibilidad a la definicion de la recompensa e inestabilidad propia del aprendizaje Q. No hay evaluacion offline ni politicas de seguridad para acciones de alto impacto.
- Riesgo de "alucinacion" en sentido estricto: el modelo no genera texto, pero si puede producir clasificaciones y valores Q sobreconfiados en entradas fuera de distribucion.
- Proteccion de datos: se procesan mensajes de estudiantes, potencialmente menores. El uso en produccion exige base juridica, minimizacion, retencion limitada y cumplimiento del RGPD y la LOPDGDD; el modelo no anonimiza ni filtra datos personales.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, con la obligacion de conservar el aviso de copyright y sin garantia alguna por parte del autor.
- Madurez: repositorio con 0 descargas y 0 likes, mantenido por un unico autor, publicado y actualizado el mismo dia; sin senales de validacion por la comunidad.
- Reproducibilidad parcial: el codigo de entrenamiento y evaluacion vive en el repositorio externo de GitHub, no en el espacio de HuggingFace, por lo que la reproducibilidad depende de que ese repositorio siga disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/addy0606/cognitive-offloading
- Repositorio del proyecto (codigo, pipeline de evaluacion e interfaz Flask): https://github.com/Addy0606/cognitiveoffloading
- Modelo base del backbone: https://huggingface.co/microsoft/deberta-base

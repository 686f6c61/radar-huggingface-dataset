# Fugi1128/ScamScan

## Resumen

ScamScan es un modelo publicado en Hugging Face por el usuario Fugi1128 (identificado en su perfil como Rohith Reddy Kodakandla) bajo licencia Apache 2.0. El repositorio contiene un único artefacto en formato ONNX con un tamano total de 0,3 GB, lo que apunta a un modelo de clasificacion o etiquetado de texto de escala reducida, presumiblemente orientado a la deteccion de estafas, phishing o contenido fraudulento, a juzgar por el nombre del repositorio. No obstante, esta orientacion es una inferencia a partir del nombre y no una capacidad documentada por el autor.

La model card publicada no contiene mas que la declaracion de licencia: no incluye descripcion, arquitectura, datos de entrenamiento, idiomas soportados, ejemplos de uso ni resultados de evaluacion. El repositorio no tiene etiqueta de pipeline asignada, no registra descargas ni "likes", y fue creado y actualizado el 25 de septiembre de 2026 con apenas once minutos de diferencia entre ambos eventos, lo que sugiere una publicacion de prueba o un volcado rapido sin documentar.

Por su relevancia practica, se trata de un artefacto de interes limitado en su estado actual: el formato ONNX facilita el despliegue en entornos de inferencia ligeros y en el navegador, pero la ausencia total de documentacion, de evaluacion y de ejemplos impide validar su comportamiento, sus limitaciones o su idoneidad para produccion. Cualquier evaluacion seria exige inspeccionar el propio grafo ONNX y realizar pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no documentada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en ONNX; se desconoce la precision interna) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Autor | Fugi1128 (Rohith Reddy Kodakandla) |
| Tamano del repositorio | 0,3 GB |
| Etiqueta de pipeline | no disponible |
| Descargas registradas | 0 |
| Fecha de creacion | 25 de septiembre de 2026 |
| Ultima actualizacion | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. El unico dato tecnico objetivo es el formato de distribucion, ONNX, que es un grafo de computacion portable e independiente del framework de origen (habitualmente PyTorch o TensorFlow exportado mediante herramientas como `torch.onnx.export` u Optimum). El tamano del repositorio, 0,3 GB, es compatible con un transformer pequeno, un modelo tipo encoder de clasificacion o una red neuronal de clasificacion de texto de dimensiones modestas, pero no permite deducir el numero de parametros sin conocer la precision de los pesos.

Tampoco hay informacion sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset, la existencia de ajuste por instrucciones (SFT), optimizacion por preferencias (RLHF/DPO) ni sobre ninguna innovacion tecnica concreta. La model card se limita al bloque de licencia `apache-2.0`. Cualquier afirmacion sobre el proceso de entrenamiento seria especulativa.

## Capacidades

La model card no documenta ninguna capacidad. A partir del nombre del repositorio y del formato de publicacion, lo unico que puede formularse son hipotesis no verificadas:

- Clasificacion o etiquetado de texto: la denominacion "ScamScan" y el tamano del artefacto sugieren un modelo discriminativo orientado a detectar mensajes fraudulentos, phishing o estafas, pero no hay ninguna confirmacion oficial.
- Generacion de texto: no disponible; no consta que el modelo sea generativo.
- Razonamiento, codigo o matematicas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Inferencia en el navegador o en el borde: plausible tecnicamente por el uso de ONNX con ONNX Runtime Web o similares, pero no documentado.

## Casos de uso

Los siguientes escenarios son aplicaciones potenciales derivadas de la hipotesis de que el modelo realice deteccion de fraudes textuales. No estan respaldados por documentacion del autor y requieren validacion previa con datos propios.

- Filtrado de mensajes fraudulentos en plataformas de mensajeria: el modelo se colocaria como clasificador previo al envio o a la recepcion de mensajes, marcando conversaciones sospechosas de phishing o fraude romantico para revision humana o bloqueo automatico. La viabilidad depende de la latencia real del grafo ONNX, que no se ha medido publicamente.
- Prefiltrado de correo y SMS de phishing: integrado en una pasarela de correo, actuaria como una capa adicional junto a los filtros antispam existentes, clasificando el cuerpo del mensaje y las URLs incluidas antes de que lleguen al buzon del usuario.
- Moderacion de contenido en marketplaces y foros: permitiria detectar anuncios o publicaciones con patrones de estafa (pagos fuera de plataforma, precios anormalmente bajos, solicitudes de datos personales) y encolarlos para revision por moderadores.
- Analisis de URLs y dominios sospechosos en extensiones de navegador: al estar en formato ONNX, el modelo puede ejecutarse del lado del cliente mediante ONNX Runtime Web, lo que permitiria analizar el texto de una pagina sin enviar datos a un servidor externo.
- Soporte a equipos de atencion al cliente: como clasificador auxiliar que etiquete tickets entrantes con riesgo de fraude, ayudando a priorizar casos y a enrutarlos al equipo de prevencion.
- Prevencion de fraude en servicios financieros: analisis de texto libre en formularios, chat de soporte o reclamaciones para detectar intentos de ingenieria social, suplantacion de identidad o patrones conocidos de estafa al cliente.
- Investigacion academica sobre deteccion de estafas: el modelo puede servir como punto de partida reproducible en ONNX para experimentos que comparen clasificadores de fraude, siempre que se documenten sus condiciones de uso y se evaluen sus sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye metricas de exactitud, precision, recall, F1 ni evaluaciones sobre conjuntos de referencia como MMLU, HumanEval, GSM8K o cualquier otro. Tampoco se aportan resultados sobre corpus especificos de deteccion de phishing o spam, que serian los benchmarks pertinentes para un modelo de esta presumible categoria. No se deben asumir cifras de rendimiento.

## Requisitos de hardware

Las estimaciones siguientes se derivan unicamente del tamano del repositorio (0,3 GB) y de la naturaleza del formato ONNX. No son datos confirmados por el autor.

- VRAM estimada para inferencia: por debajo de 1 GB en la mayoria de configuraciones, dado que el artefacto completo ocupa 0,3 GB. Si los pesos estan en FP32, el modelo subyacente seria del orden de decenas de millones de parametros; si estan cuantizados a INT8, podria ser mayor. La precision real es desconocida.
- GPU recomendadas: practicamente cualquier GPU con mas de 2 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100). Una GPU dedicada grande estaria infrautilizada para un artefacto de este tamano; el cuello de botella seria el preprocesado de texto, no la inferencia.
- Viabilidad en GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna e incluso en GPU integradas.
- Ejecucion en CPU: viable y probablemente suficiente, dado el tamano. Se recomienda ONNX Runtime con los ejecutores de CPU optimizados (OpenVINO, oneDNN) y cuantizacion dinamica si se necesita reducir latencia.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), ONNX Runtime Web para navegador, Triton Inference Server, ejecucion embebida en servicios ligeros. vLLM, llama.cpp, Ollama y TGI no aplican a un artefacto ONNX de este tipo salvo conversion previa, y no hay evidencia de que el modelo sea generativo.
- Latencia y throughput: no disponibles. No se han publicado mediciones. Como referencia orientativa, un clasificador de texto de este tamano suele procesar decenas o cientos de peticiones por segundo en una CPU moderna, pero esta cifra no puede darse por valida sin medir el grafo concreto.

## Comparativa con modelos similares

No se han identificado modelos abiertos comparables en la informacion disponible. Los resultados de busqueda arrojan servicios comerciales de deteccion de estafas, no modelos publicados con pesos descargables, por lo que no existe una comparacion homogenea en terminos de parametros, contexto o licencia.

| Alternativa | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fugi1128/ScamScan | Modelo en ONNX (categoria no confirmada) | no disponible | no disponible | Apache 2.0 | Pesos descargables en Hugging Face; 0 descargas |
| ScamAdviser | Servicio web de comprobacion de sitios | no aplica | no aplica | propietaria | Servicio cerrado, sin pesos publicados |
| ScamRadar+ | Servicio web de deteccion de estafas en mensajes | no aplica | no aplica | propietaria | Servicio cerrado, sin pesos publicados |
| ScamCheck | Servicio web de deteccion de estafas en mensajes y enlaces | no aplica | no aplica | propietaria | Servicio cerrado, sin pesos publicados |
| urlscan.io | Servicio de analisis de URLs | no aplica | no aplica | propietaria | Servicio cerrado, sin pesos publicados |

La comparacion con estos servicios es solo contextual: resuelven un problema de la misma familia, pero no son alternativas tecnicamente equivalentes ni permiten una comparacion de rendimiento en igualdad de condiciones.

## Limitaciones y advertencias

- Model card practicamente vacia: el unico contenido es la declaracion de licencia Apache 2.0. No hay informacion sobre arquitectura, datos de entrenamiento, idiomas, contexto ni uso previsto.
- Ausencia total de evaluacion: no existen benchmarks, ni validacion en conjuntos de test, ni ejemplos de entrada y salida. Es imposible estimar la tasa de falsos positivos y falsos negativos, un aspecto critico en deteccion de fraude, donde un falso negativo tiene coste economico directo y un falso positivo bloquea usuarios legitimos.
- Riesgo de sesgo desconocido: al no documentarse el corpus de entrenamiento, no puede evaluarse si el modelo discrimina por idioma, variedad dialectal, nivel socioeconomico o sector. Los estafadores adaptan su lenguaje con rapidez, por lo que un modelo sin fecha de datos ni estrategia de actualizacion puede degradarse con el tiempo.
- Riesgo de alucinacion: no aplica si el modelo es un clasificador; si resultara ser generativo, no hay informacion que permita acotarlo.
- Idiomas no declarados: se desconoce si soporta castellano o si esta entrenado solo en ingles. No debe asumirse cobertura multilingue.
- Comportamiento en produccion no verificado: no hay etiqueta de pipeline, ni historial de descargas, ni issues, ni discusiones que permitan juzgar la fiabilidad del artefacto. Un repositorio con cero descargas y cero interacciones no ha sido validado por la comunidad.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con la obligacion de conservar los avisos de copyright y licencia, y sin garantia de ningun tipo por parte del autor. La licencia no acredita nada sobre la legalidad o calidad de los datos de entrenamiento.
- Fecha de publicacion atipica (2026): conviene verificar la procedencia del repositorio y confirmar que el artefacto ONNX es el esperado antes de integrarlo.
- Aviso de seguridad: un fichero ONNX es codigo ejecutable en el sentido de que define un grafo con operadores; se recomienda cargarlo en un entorno aislado y verificar su origen antes de desplegarlo en infraestructura propia.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/Fugi1128/ScamScan
- Perfil del autor en Hugging Face: https://huggingface.co/Fugi1128
- ScamAdviser (servicio de referencia en deteccion de estafas web): https://www.scamadviser.com/
- ScamRadar+ (servicio de referencia en deteccion de estafas en mensajes): https://scamradarplus.com/
- ScamCheck (servicio de referencia en deteccion de estafas): https://scamcheck.tech/
- urlscan.io (servicio de referencia en analisis de URLs): https://urlscan.io/

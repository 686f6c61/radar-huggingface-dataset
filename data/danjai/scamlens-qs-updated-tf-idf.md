# danjai/scamlens-qs-updated-tf-idf

## Resumen

ScamLens quick_score (updated-tf-idf) es un clasificador binario de texto que estima la probabilidad de que un SMS o mensaje de chat sea una estafa, a partir exclusivamente de su redaccion. Lo desarrolla el usuario danjai en el contexto de ScamLens, un agente de investigacion de fraudes construido para el proyecto de curso universitario IS469, y constituye uno de los modelos candidatos evaluados, no el que finalmente emplea el agente en produccion.

Tecnicamente no es un modelo neuronal ni un transformer: se trata de un clasificador lineal (regresion logistica) sobre caracteristicas TF-IDF de palabras y caracteres, con un vocabulario maximo de 3500 features por cada tipo y pesos almacenados en un fichero JSON (`linear_model.json`) que se puntua en Python y NumPy puro. El entrenamiento se realizo sobre 7330 ejemplos de mensajes estilo Singapur, combinando avisos publicos de estafa, mensajes sinteticos, alertas bancarias generadas en pares legitimo/estafa y SMS cotidianos de corpus publicos.

Su relevancia es acotada: sirve como primera opinion (quick score) dentro de un pipeline mayor de deteccion de fraude, con una validacion F1 de 0.963 y un F1 de 0.862 sobre un test ciego de 178 mensajes escritos a mano. Es un artefacto de investigacion academica, sin licencia declarada y con cero descargas en Hugging Face, por lo que debe tratarse como referencia metodologica mas que como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador lineal (regresion logistica) sobre TF-IDF de palabras y caracteres |
| Parametros totales | no disponible (maximo de 3500 features de palabra y 3500 de caracter, mas pesos de regresion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de bolsa de palabras, sin ventana definida) |
| Tipos de cuantizacion | no aplica (pesos en JSON de precision nativa) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | JSON (`linear_model.json` con vocabulario TF-IDF y pesos de regresion logistica) |

## Arquitectura y entrenamiento

El modelo es un clasificador lineal clasico: vectoriza el texto con TF-IDF sobre palabras y sobre n-gramas de caracteres (hasta 3500 features de cada tipo), aplica una regresion logistica con regularizacion L2 (C = 2.5) y devuelve una probabilidad calibrada mediante un `prior_blend` de 0.35. El entrenamiento usa learning rate 0.25, 450 pasos, semilla 42 y una particion de validacion del 20 por ciento. Incluye un parametro `sg_weight` de 5 que sobremuestrea o pondera los mensajes del contexto de Singapur.

Los datos de entrenamiento son 7330 ejemplos provenientes de `sg_quick_score_train.csv` y del corpus publico UCI SMS Spam. La composicion combina mensajes tomados o reconstruidos de avisos publicos de estafa, mensajes sinteticos, alertas bancarias generadas en pares legitimo/estafa y SMS cotidianos de corpus publicos. No se documenta uso de RLHF, DPO ni tecnicas de alineacion, algo coherente con la naturaleza puramente supervisada y ligera del modelo.

La innovacion tecnica no reside en la arquitectura sino en el enfoque de despliegue: el modelo se sirve sin framework de deep learning, puntuando directamente el JSON en Python y NumPy, lo que elimina dependencias pesadas y permite integrarlo como herramienta de bajo coste dentro del agente ScamLens.

## Capacidades

- Clasificacion binaria de texto: devuelve la probabilidad de que un mensaje sea estafa.
- Deteccion basada en redaccion: analiza el vocabulario y los patrones de caracteres del mensaje.
- Umbrales de decision documentados: probabilidad alta desde 0.70, media desde 0.50, baja por debajo.
- Integracion como herramienta (`quick_score`) dentro de un agente mayor de investigacion de fraudes.
- Inferencia en Python y NumPy puro, sin dependencia de `transformers`.
- Soporte exclusivo de ingles y del contexto de Singapur (bancos, agencias y servicios de pago locales).
- No soporta tool calling, function calling, agentes autonomos, vision, audio ni modo de razonamiento.

## Casos de uso

- Filtro de primera pasada en pasarelas de SMS: el modelo puntua cada mensaje entrante y marca como sospechosos los que superan el umbral de 0.50, derivando solo esos al analisis completo del agente ScamLens, lo que reduce el coste computacional del pipeline.
- Triaje en bandejas de entrada de banca movil: permite priorizar alertas al usuario cuando un mensaje presenta redaccion tipica de estafa, con una precision de estafa de 0.964 que limita las falsas alarmas.
- Enriquecimiento de herramientas de ciberseguridad para consumidores: se integra como senal adicional de riesgo en aplicaciones de filtrado de SMS, combinado con comprobaciones de enlaces, numeros y remitentes que el modelo delega a otras herramientas.
- Investigacion academica y docencia: sirve como linea base reproducible (semilla 42, hiperparametros documentados) frente a la que comparar modelos neuronales en tareas de deteccion de fraude en texto.
- Prototipado rapido de clasificadores de spam: al ejecutarse en NumPy puro, permite desplegar un detector funcional en entornos sin GPU y con dependencias minimas.
- Analisis de campanas de estafa en corpus de mensajes: permite etiquetar grandes volumenes de SMS historicos para estudiar la evolucion del lenguaje fraudulento en el contexto de Singapur.
- Evaluacion de mensajes sospechosos por parte de analistas: aporta una probabilidad interpretable (alta, media, baja) que el analista puede contrastar con otras fuentes antes de actuar.

## Benchmarks y rendimiento

| Metrica | Valor | Intervalo de confianza 95% |
|---|---|---|
| F1 de validacion | 0.963 | no disponible |
| Accuracy (test) | 0.854 | 0.795 - 0.898 |
| Recall de estafa (test) | 0.779 | 0.690 - 0.848 |
| Precision de estafa (test) | 0.964 | 0.900 - 0.988 |
| F1 (test) | 0.862 | no disponible |
| Mensajes legitimos marcados como estafa | 3 de 74 | no disponible |
| Estafas no detectadas | 23 de 104 | no disponible |

El test set son 178 mensajes de Singapur escritos a mano que no aparecen en los datos de entrenamiento; un mensaje cuenta como estafa con probabilidad igual o superior a 0.50. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo se ejecuta en CPU y el fichero de pesos es un JSON de vocabulario y coeficientes.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente.
- Cabe en GPU consumer: si, aunque no es necesario; el calculo es de bolsa de palabras y una multiplicacion matricial pequena.
- Opciones de despliegue: Python y NumPy puro cargando `linear_model.json`; integracion como herramienta del agente ScamLens mediante la variable de entorno `SCAMLENS_QUICK_SCORE_MODEL`. No es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser un modelo `transformers`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por la naturaleza del modelo cabe esperar latencias de microsegundos a milisegundos por mensaje en CPU, aunque no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ScamLens quick_score (updated-tf-idf) | TF-IDF + regresion logistica | no disponible (3500+3500 features) | no aplica | F1 test 0.862; precision estafa 0.964 | no disponible | Hugging Face, 0 descargas |
| Modelos transformer de clasificacion de spam (p. ej. BERT base ajustado) | Transformer encoder | ~110 M (tipico) | 512 tokens (tipico) | no disponible | variable segun modelo | amplia en Hugging Face |
| Filtros Bayesianos / Naive Bayes de SMS spam | Modelo probabilistico | no aplica | no aplica | no disponible | variable | ubicua en librerias |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible. La ventaja diferencial de este modelo es su coste de despliegue casi nulo y su transparencia; su desventaja es la ausencia de comprension semantica profunda y su dependencia del contexto de Singapur.

## Limitaciones y advertencias

- Solo evalua la redaccion: no comprueba enlaces, numeros de telefono ni remitentes, tareas que en ScamLens asumen herramientas separadas.
- Entrenado con mensajes en ingles del contexto de Singapur (bancos, agencias y servicios de pago locales); su fiabilidad fuera de ese ambito sera menor.
- El test set es pequeno (178 mensajes), por lo que los intervalos de confianza son amplios.
- Recall de estafa de 0.779: se le escapan 23 de 104 estafas del test, por lo que no debe usarse en solitario para bloquear o acusar a nadie.
- Licencia no declarada: no hay autorizacion explicita para uso comercial, lo que impide asumir su reutilizacion en produccion.
- Es un modelo candidato descartado por el propio autor para el agente ScamLens; no es la version operativa.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de clasificacion erronea en mensajes ambiguos o fuera de dominio.
- Sin mantenimiento ni adopcion demostrada (0 descargas, 0 likes), lo que reduce la garantia de soporte a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danjai/scamlens-qs-updated-tf-idf
- Repositorio de ScamLens (agente que consume el modelo): no disponible en la informacion proporcionada
- Paper o memoria del proyecto IS469: no disponible en la informacion proporcionada
- Corpus UCI SMS Spam (fuente de datos): no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible en la informacion proporcionada

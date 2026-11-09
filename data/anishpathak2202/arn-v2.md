# AnishPathak2202/arn-v2

## Resumen

ARN-v2 (Aether Routing Network v2) es un modelo pequeno de 4,44 millones de parametros desarrollado por AnishPathak2202, disenado especificamente para la tarea de function calling restringido: dado un enunciado corto del usuario y un registro fijo de herramientas conocidas, el modelo selecciona que funcion o funciones invocar y etiqueta los tokens del enunciado que actuan como argumentos de cada una. No genera texto libre; es un modelo de etiquetado (token-classification) que produce una asignacion estructurada de herramienta y spans.

Tecnicamente se construye sobre el encoder `google/bert_uncased_L-2_H-128_A-2` (BERT-Tiny, 2 capas, hidden size 128), afinado de extremo a extremo, al que se anaden un router de herramientas (FAR-v2, un router de atencion factorizada con sesgo por herramienta y residual de [CLS]) y un etiquetador de argumentos basado en una capa lineal mas un CRF lineal-cadena sobre etiquetas BIO cualificadas por herramienta. La decodificacion es conjunta y restringida: puntua conjuntos candidatos de herramientas contra el CRF y conserva la mejor asignacion de herramientas y spans. Ademas incorpora un canonicalizador de fechas y horas basado en reglas.

Su relevancia actual reside en dos frentes: por un lado, demuestra que un modelo de menos de 5M de parametros puede competir en exactitud estricta con modelos de 230M-270M en la tarea concreta de enrutado de funciones sobre Google Mobile Actions (89,32 frente a 85,12 de un FunctionGemma-270M afinado), lo que abre la puerta a function calling en dispositivo sin red; por otro lado, el propio autor documenta con honestidad que buena parte del rendimiento depende de reglas (el canonicalizador aporta unos 34 puntos) y que en benchmarks sin reglas (MixATIS, MixSNIPS) el modelo queda por debajo de alternativas mas pequenas, lo que lo convierte en un caso de estudio interesante sobre el papel de las reglas en sistemas neuronales pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-Tiny (encoder transformer, 2 capas, hidden 128) + router FAR-v2 + CRF lineal-cadena sobre BIO cualificado + decodificacion conjunta restringida + canonicalizador de fechas/horas por reglas |
| Parametros totales | 4.440.019 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en FP32) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT (codigo y checkpoints); los datos de entrenamiento (Google Mobile Actions) tienen sus propios terminos |
| Formato de pesos | PyTorch (`.pt`, FP32, ~17,8 MB por checkpoint) |

## Arquitectura y entrenamiento

El modelo combina un encoder transformer BERT-Tiny afinado de extremo a extremo con dos cabezas especializadas. El router FAR-v2 (factored attention router) produce una puntuacion por herramienta del registro, incorporando un sesgo especifico por herramienta y una conexion residual desde el token [CLS]. El etiquetador de argumentos es una capa lineal seguida de un CRF lineal-cadena sobre etiquetas BIO cualificadas por herramienta (por ejemplo `B-send_email.subject`), con mascaras para transiciones de etiqueta invalidas. La decodificacion es conjunta y restringida: se puntuan conjuntos candidatos de herramientas contra el CRF y se conserva la mejor combinacion de conjunto de herramientas y asignacion de spans. Un componente adicional, el canonicalizador de fechas y horas, es puramente basado en reglas y sus convenciones se ajustaron solo sobre el split de entrenamiento.

El entrenamiento utiliza el dataset Google Mobile Actions, filtrando `metadata == "train"` y dividiendo en 90% ajuste y 10% validacion con semilla fija. Se generan tres checkpoints correspondientes a las semillas 42, 1 y 2, cada uno con su propio registro de herramientas y etiquetas almacenado. La evaluacion principal se realiza sobre `metadata == "eval"` (961 peticiones) con exact match estricto. El autor advierte que el split de test fue inspeccionado durante el desarrollo, por lo que los resultados en Mobile Actions deben considerarse exploratorios; las cifras confirmatorias son las de MixATIS y MixSNIPS, pre-registradas y con lectura unica del test por semilla. No se documenta uso de RLHF ni DPO; el modelo no es generativo.

## Capacidades

- Enrutado de funciones: selecciona una o varias herramientas de un registro fijo y conocido a partir de un enunciado corto del usuario.
- Extraccion de argumentos (slot filling): etiqueta los tokens del enunciado que corresponden a cada argumento, con etiquetas BIO cualificadas por herramienta.
- Decodificacion conjunta: resuelve de forma coordinada la eleccion de herramientas y la asignacion de spans, evitando combinaciones invalidas.
- Canonicalizacion de fechas y horas: normaliza expresiones temporales mediante reglas ajustadas en entrenamiento.
- Ejecucion en CPU sin red: aproximadamente 11 ms por peticion en un solo hilo, FP32 PyTorch.
- Multilingue: no disponible; solo ingles.
- Generacion de texto: no soportada (el modelo no es generativo).
- Tool calling sobre herramientas desconocidas: no soportado; requiere datos de entrenamiento nuevos.
- Llamada a la misma herramienta dos veces en una peticion: no disenado para ello.
- Razonamiento multi-paso y agentes autonomos: fuera del alcance declarado.

## Casos de uso

- Asistentes de voz en dispositivo: el modelo puede enrutar ordenes cortas ("envia un correo a Ana manana a las 9") a la funcion adecuada y extraer los argumentos, ejecutandose en CPU a ~11 ms por peticion sin conexion de red, lo que lo hace apto para moviles y dispositivos embebidos.
- Automatizacion de acciones en aplicaciones moviles: integrado en el cliente, permite mapear intents del usuario a APIs internas registradas (enviar email, crear recordatorio, fijar alarma) con extraccion de parametros, reduciendo la dependencia de servicios en la nube.
- Investigacion sobre function calling no generativo: sirve como referencia reproducible para estudiar cuanto del rendimiento depende de reglas frente al componente neuronal, gracias a las ablaciones publicadas (canonicalizador, orden de llamadas, join multi-span, mascara de registro).
- Prototipado rapido de pipelines de intencion: al ser un modelo de 17,8 MB por checkpoint y con licencia MIT, se puede iterar localmente sobre un registro de herramientas propio en entornos de desarrollo sin GPU.
- Filtrado previo en arquitecturas hibridas: puede actuar como primera etapa que resuelve peticiones simples y deriva las complejas a un modelo mayor, reduciendo coste y latencia en produccion.
- Sistemas con requisitos de privacidad estrictos: al ejecutarse en local y no generar texto, evita enviar enunciados del usuario a servicios externos, lo que encaja en escenarios con datos sensibles donde solo se necesita enrutado.
- Evaluacion de robustez de reglas: util para equipos que quieran medir el impacto de canonicalizadores y heuristicas en sistemas de extraccion de intenciones, con cifras de ablacion ya publicadas.

## Benchmarks y rendimiento

Resultados en Google Mobile Actions (test, 961 peticiones, exact match estricto; media de 3 semillas):

| Sistema | Parametros | Entrenado en train | Exact match estricto |
|---|---|---|---|
| ARN-v2 (BERT-Tiny + FAR-v2) | 4,44M | si | 89,32 ± 0,47 |
| ARN-v2 (trunk BERT-Mini) | 11,38M | si | 89,91 ± 0,46 |
| FunctionGemma-270M, afinado por el autor | 268M | si | 85,12 |
| LFM2.5-230M, receta por defecto | 230M | si | 91,57 |
| LFM2.5-230M, mejor de 5 configuraciones | 230M | si | 92,51 |

Ablaciones (3 semillas):

| Variante | Media ± SD | Cambio vs completo |
|---|---|---|
| Sistema completo | 89,32 ± 0,47 | — |
| Sin canonicalizador de fechas/horas | 55,22 ± 0,37 | ~−34 puntos |
| Orden de llamadas por atencion en vez de por palabras clave | 85,81 ± 6,12 | −10,5 puntos en semilla 42; sin cambio en semillas 1 y 2 |
| Sin join multi-span | 88,17 ± 0,42 | ~−1 punto |
| Sin mascara de registro en decodificacion | 89,21 ± 0,47 | ~−0,1 punto |

Benchmarks pre-registrados sin reglas (test leido una vez por semilla):

| Benchmark | Precision global (3 semillas) |
|---|---|
| MixATIS (828 enunciados) | 40,94 ± 2,62 |
| MixSNIPS (2.199 enunciados) | 70,29 ± 0,46 |

El autor senala que estos resultados estan por debajo de varios modelos multi-intent publicados, incluidos algunos BiLSTM mas pequenos (0,6-0,9M de parametros).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con checkpoints FP32 de ~17,8 MB, la huella de memoria es minima (del orden de decenas de MB incluyendo activaciones para entradas cortas).
- GPU recomendadas: no necesarias; el modelo esta disenado para CPU. Cualquier GPU moderna (RTX 4090, A100, H100) lo ejecutaria con holgura, pero no aporta ventaja practica frente a CPU para esta carga.
- Cabe en GPU de consumo: si, en cualquier GPU consumer; tambien en CPU y en dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo (checkpoints `.pt`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: ~11 ms por peticion en CPU, un hilo, FP32 PyTorch (Windows). El throughput en lote no esta documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (Mobile Actions, exact match) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ARN-v2 | 4,44M | no disponible | 89,32 ± 0,47 | MIT | Hugging Face |
| ARN-v2 (trunk BERT-Mini) | 11,38M | no disponible | 89,91 ± 0,46 | MIT | Variante del mismo autor |
| FunctionGemma-270M (afinado por el autor) | 268M | no disponible | 85,12 | no disponible en la informacion | Checkpoint de terceros; el resultado es del fine-tune del autor |
| LFM2.5-230M (receta por defecto) | 230M | no disponible | 91,57 | no disponible en la informacion | Modelo base de terceros; resultado del fine-tune del autor |

Nota: el autor advierte que la fila de FunctionGemma corresponde a su propio fine-tune sobre las mismas filas y receta, no al checkpoint publicado por Google; un paper de terceros reporta 90,32 para el checkpoint oficial en un harness distinto, por lo que no son directamente comparables.

## Limitaciones y advertencias

- Dependencia critica de reglas: el canonicalizador de fechas y horas aporta ~34 puntos de exact match; sin el, el rendimiento cae a 55,22. El sistema es hibrido neurona + reglas.
- Resultados exploratorios en Mobile Actions: el split de test se inspecciono durante el desarrollo, por lo que esas cifras no son confirmatorias. Las cifras confirmatorias (MixATIS 40,94; MixSNIPS 70,29) son modestas y quedan por debajo de modelos mas pequenos.
- Solo ingles: no soporta peticiones en otros idiomas.
- Registro cerrado de herramientas: no puede invocar herramientas no vistas en entrenamiento; anadir una nueva requiere datos y reentrenamiento.
- No soporta la misma herramienta dos veces en una peticion.
- No es generativo: no sirve para chat abierto ni para producir texto.
- Acciones de alto impacto: funciones destructivas o sensibles (borrar ficheros, enviar dinero) requieren confirmacion humana en la aplicacion llamante.
- Sesgos: no documentados en la informacion disponible; al entrenarse sobre Google Mobile Actions, hereda los sesgos y la distribucion de ese dataset.
- Riesgo de alucinacion: al ser un etiquetador, el riesgo se manifiesta como asignaciones erroneas de herramienta o spans, no como texto inventado.
- Licencia de datos: aunque codigo y checkpoints son MIT, el dataset Google Mobile Actions tiene sus propios terminos y debe revisarse antes de reutilizarlo.
- Version anterior retirada: v1 tenia fuga de ejemplos casi duplicados entre train y test; sus numeros no son validos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnishPathak2202/arn-v2
- Repositorio de codigo y scripts: https://github.com/Anishp-cell/ARN
- Paper: pendiente de publicacion (no disponible)
- Dataset de entrenamiento: https://huggingface.co/datasets/google/mobile-actions
- Modelo base: https://huggingface.co/google/bert_uncased_L-2_H-128_A-2

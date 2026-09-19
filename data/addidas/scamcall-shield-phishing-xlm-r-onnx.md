# addidas/scamcall-shield-phishing-xlm-r-onnx

## Resumen
El modelo `addidas/scamcall-shield-phishing-xlm-r-onnx` es un modelo publicado en HuggingFace por el usuario "addidas" y orientado, a juzgar por su nombre y sus etiquetas, a la deteccion de llamadas fraudulentas o de phishing (scam call shield / phishing). Esta construido sobre la arquitectura XLM-RoBERTa y se distribuye en formato ONNX, lo que sugiere un uso orientado a inferencia ligera y despliegue en produccion. La licencia declarada es Apache 2.0.

La informacion disponible es muy limitada: la model card del autor esta practicamente vacia (unicamente contiene la declaracion de licencia) y no se han publicado datos de entrenamiento, metricas ni idiomas soportados. El repositorio ocupa 0,3 GB y acumula 0 descargas y 0 "likes" en el momento de la consulta, por lo que se trata de un artefacto reciente y practicamente sin validacion publica.

Su relevancia potencial reside en el nicho de la deteccion de fraude telefonico, un problema creciente que exige modelos capaces de clasificar texto (transcripciones de llamadas, mensajes o guiones) en tiempo real y con coste computacional bajo, algo que el formato ONNX facilita. No obstante, cualquier evaluacion seria del modelo requiere verificar de forma independiente su comportamiento, dado que el autor no aporta evidencia empirica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder, segun nombre y tags) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (distribucion en ONNX; posible cuantizacion no confirmada) |
| Idiomas soportados | no disponible (la base XLM-RoBERTa es multilingue, pero la model card no lo especifica) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento
El nombre del modelo indica que parte de XLM-RoBERTa, un transformer de tipo encoder-only disenado originalmente para tareas de comprension del lenguaje y clasificacion. En este caso, el sufijo `phishing` apunta a un ajuste fino (fine-tuning) para una tarea de clasificacion binaria o multiclase orientada a detectar intentos de fraude, presumiblemente sobre transcripciones de llamadas o texto conversacional.

No hay informacion sobre el conjunto de datos de entrenamiento, el numero de tokens utilizados, la composicion del dataset, el uso de tecnicas de alineacion como RLHF o DPO ni sobre innovaciones tecnicas especificas. La model card no incluye ninguna seccion de arquitectura, entrenamiento o evaluacion, por lo que estos apartados quedan como no disponibles.

## Capacidades
- Clasificacion de texto para deteccion de fraude: segun el nombre del modelo, la funcion principal seria etiquetar texto como potencialmente fraudulento (phishing/scam) o legitimo.
- Soporte multilingue potencial: al derivar de XLM-RoBERTa, la base es multilingue, aunque el autor no confirma los idiomas reales cubiertos por este ajuste fino.
- Inferencia mediante ONNX: el formato permite ejecucion optimizada en CPU y GPU a traves de ONNX Runtime.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (un encoder de clasificacion no esta disenado para generacion ni para razonamiento secuencial).
- Capacidades especiales (thinking mode, vision, audio): no disponibles. No consta que el modelo procese audio de forma directa.

## Casos de uso
- Filtrado de llamadas fraudulentas en centralita: el modelo podria integrarse en un pipeline que transcriba la llamada con ASR y clasifique el texto en tiempo real para marcar alertas de fraude al operador o al usuario.
- Deteccion de phishing en mensajes y SMS: aplicable a la clasificacion de mensajes entrantes en una plataforma de mensajeria para bloquear intentos de suplantacion de identidad.
- Analisis post-mortem de incidentes: procesamiento por lotes de transcripciones historicas para identificar patrones de campanas de fraude ya ocurridas.
- Monitorizacion en centros de atencion al cliente: marcado automatico de conversaciones sospechosas para revision por parte de equipos antifraude.
- Enriquecimiento de sistemas de scoring de riesgo: el modelo puede aportar una senal adicional (probabilidad de fraude) a un motor de decision que combine multiples fuentes.
- Despliegue en el borde o en entornos con recursos limitados: gracias al formato ONNX y al tamano reducido del repositorio (0,3 GB), puede ejecutarse en servidores modestos o incluso en dispositivos con CPU, sin necesidad de GPU dedicada.
- Moderacion de contenido en plataformas de telefonia IP: clasificacion en streaming de fragmentos de transcripcion para cortar llamadas de riesgo antes de que se complete la estafa.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion (precision, recall, F1, AUC), ni comparaciones con otros modelos, ni descripcion del conjunto de validacion.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial. Dado el tamano del repositorio (0,3 GB), la huella de memoria es reducida y compatible con despliegue en CPU; una GPU no es estrictamente necesaria.
- GPU recomendadas: no aplica una GPU de gama alta; cualquier GPU consumer moderna (por ejemplo, serie RTX 30/40) es mas que suficiente si se opta por aceleracion. Las GPU de centro de datos (A100, H100) no resultan necesarias para este tipo de modelo.
- Compatibilidad con GPU consumer: si, cabe holgadamente en cualquier GPU consumer e incluso puede ejecutarse solo con CPU.
- Opciones de despliegue: ONNX Runtime es la via natural dado el formato de pesos. Los frameworks habituales para modelos tipo BERT (por ejemplo, Transformers con backend ONNX) tambien son utilizables. vLLM, llama.cpp, Ollama y TGI estan orientados a modelos generativos y no encajan con un encoder de clasificacion.
- Latencia y throughput: no disponibles. Al tratarse de un modelo encoder de tamano moderado, la latencia esperada en CPU es de milisegundos a decenas de milisegundos por lote pequeno, pero no hay mediciones publicadas.

## Comparativa con modelos similares
No hay datos publicados de este modelo que permitan una comparacion rigurosa. A modo de referencia cualitativa:

| Modelo | Parametros | Contexto | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| addidas/scamcall-shield-phishing-xlm-r-onnx | no disponible | no disponible | apache-2.0 | ONNX | no disponibles |
| XLM-RoBERTa base (referencia) | aprox. 278 M (variante base) | 512 tokens (segun configuracion estandar de la base) | MIT (licencia original del modelo base) | safetensors / PyTorch | no aplica a esta tarea sin ajuste |
| Modelos de deteccion de phishing/spam basados en BERT | variable segun implementacion | no disponible | variable | PyTorch / ONNX | no disponibles |

Los datos de la base XLM-RoBERTa corresponden al modelo original y no deben interpretarse como especificaciones confirmadas de este ajuste fino concreto, que no documenta sus parametros ni su configuracion.

## Limitaciones y advertencias
- Model card vacia: no hay informacion sobre entrenamiento, evaluacion, sesgos ni limitaciones, lo que impide una validacion tecnica seria.
- Ausencia total de metricas: no se pueden estimar tasas de falsos positivos o falsos negativos, criticas en un dominio sensible como la deteccion de fraude.
- Riesgo de sesgos: al no declararse la composicion del dataset, no se puede descartar sesgo linguistico, geografico o dialectal.
- Idiomas no confirmados: aunque la base sea multilingue, no hay garantia de que el ajuste fino funcione correctamente en castellano u otros idiomas.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de clasificaciones erroneas con alta confianza.
- Fecha de creacion inusual: el repositorio figura como creado el 19 de septiembre de 2026 y con 0 descargas, por lo que no existe trazabilidad de uso ni retroalimentacion de la comunidad.
- Implicaciones legales y eticas: el uso de un modelo de clasificacion para interceptar o marcar comunicaciones puede afectar a la privacidad y a la normativa de proteccion de datos (RGPD); es imprescindible una base juridica adecuada.
- Licencia Apache 2.0: permite uso comercial, pero no exime de cumplir la normativa aplicable ni de verificar la procedencia de los datos de entrenamiento.
- Caveat de produccion: al no existir documentacion, desplegar este modelo en un sistema real sin una evaluacion independiente previa es desaconsejable.

## Enlaces
- HuggingFace: https://huggingface.co/addidas/scamcall-shield-phishing-xlm-r-onnx
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo. Las busquedas devuelven exclusivamente paginas corporativas y comerciales de la marca deportiva adidas (adidas.fr, adidas.co.uk, Wikipedia, Zalando), sin relacion alguna con el modelo ni con su autor.
- Paper, repositorio o demo del autor: no disponibles.

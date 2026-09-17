# fernandofernandes/fly-wordbrain-shuffled-10k

## Resumen

`fernandofernandes/fly-wordbrain-shuffled-10k` es un brazo de control de un experimento de neuro-IA: un modelo de generacion de texto de 3.956.469 parametros entrenado sobre el conectoma de la mosca de la fruta (Drosophila melanogaster) con **todos los ejes reconectados aleatoriamente**. Lo publica el usuario fernandofernandes como parte de la serie fly-wordbrain, y no es un modelo pensado para uso general: existe para responder a una unica pregunta metodologica que seis etapas previas de ablacion no habian resuelto: el cableado real del cerebro de la mosca aporta senal, o cualquier capa recurrente dispersa de la misma forma rendiria igual.

El experimento es un control pareado: misma arquitectura, mismo corpus (10.000 historias de TinyStories), mismas 16.800 actualizaciones, misma semilla 42, mismo optimizador y mismo schedule que el brazo entrenado sobre el conectoma medido. La unica diferencia es que el 99,9964% de los 9.050.172 ejes del grafo fueron reasignados al azar preservando exactamente el grado de entrada y de salida de cada neurona, la distribucion de pesos sinapticos y las interfaces de inyeccion de entrada y lectura de salida. El resultado: el cableado real aporta 0,0100 nats de cross-entropy y 0,91 puntos de top-1, con intervalos de confianza al 95% que excluyen el cero.

Su relevancia es metodologica, no de producto. Demuestra que un grafo reconectado al azar sigue batiendo a la referencia liberada por 1,029 nats, de modo que la mayor parte de la ventaja del modelo procede de la recurrencia dispersa y no de la anatomia concreta del insecto; la anatomia solo explica en torno al 1% de esa ventaja. Al mismo tiempo, advierte de que cargar estos pesos sobre el conectoma medido produce un modelo que nunca fue entrenado y puntuaciones sin significado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Capa recurrente dispersa instanciada sobre un grafo conectomico, segun la arquitectura de `ngxson/fly-llm-hf`; no es un transformer denso |
| Parametros totales | 3.956.469 parametros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Peso CC BY 4.0; codigo MIT; derivado de MaleCNS v1.0 (FlyEM / HHMI Janelia, University of Cambridge, MRC LMB, Google Research) |
| Formato de pesos | safetensors (`min-ce.safetensors`, `max-accuracy.safetensors`), mas `manifest.json`, `graph-control.json` y `experiment-config.json` |
| Grafo subyacente | Conectoma con 9.050.172 ejes, de los cuales 99,9964% reconectados al azar (118.705 ejes, 1,31%, supervivientes por azar en ambos extremos); 0 self-loops, 0 ejes duplicados |
| Repositorio | 0,0 GB; 0 descargas y 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo no es un transformer. Se trata de una capa recurrente dispersa cuya matriz de conectividad se inicializa a partir de un grafo conectomico real de mosca de la fruta, siguiendo el diseno de `ngxson/fly-llm-hf`. El grafo determina que neurona se conecta con cual, y las neuronas se ejecutan de forma recurrente sobre la secuencia de tokens. En este brazo concreto, la matriz de indices fue reconstruida de forma determinista a partir del conectoma publicado y un entero de control (1729), mediante la funcion `control_indices(offsets, source, "shuffle", 1729)` del script `scripts/train_connectorch_control.py`. El shuffle preserva cada grado de entrada (los offsets de fila nunca se reescribieron), cada grado de salida, cada peso sinaptico y el multiset de pesos entrantes de cada neurona, ademas de las interfaces de inyeccion y lectura. Los pesos sinapticos son byte a byte identicos a los del conectoma medido; solo cambio el array de indices.

El entrenamiento es deliberadamente identico al del brazo medido: 10.000 historias de TinyStories, 16.800 actualizaciones con semilla 42, mismo optimizador y mismo schedule. Esto supone aproximadamente 1,83 pasadas sobre el corpus, por lo que el entrenador registra `debug_stopped` con `debug: true`: la marca indica que se alcanzo el limite de actualizaciones, no un fallo. La evaluacion usa 200 historias reservadas y 45.059 objetivos de siguiente token, con un protocolo de remuestreo de 10.000 historias completas (semilla 1729) para obtener intervalos de confianza pareados. La innovacion tecnica relevante no esta en la capa, sino en el diseno del control: mantener fija toda estadistica de conectividad para que un resultado nulo no pueda atribuirse a un grafo danado.

## Capacidades

- Generacion de texto autorregresiva a nivel de token sobre ingles sencillo, del estilo del corpus TinyStories.
- Modelado de lenguaje de siguiente token: es la unica tarea para la que existe evidencia cuantitativa (45.059 objetivos en 200 historias reservadas).
- Razonamiento, codigo, matematicas y vision: no disponible; no se reporta ninguna evaluacion de estas capacidades.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no; la model card declara unicamente ingles.
- Capacidad especial: actuacion como brazo de control negativo en un estudio de ablacion de conectoma, con grafo reconstruible y verificable mediante hash.
- Modo de pensamiento, audio u otras modalidades: no disponible.

## Casos de uso

- Control negativo en estudios de conectoma: el modelo sirve para medir cuanto del rendimiento de un modelo basado en conexiones biologicas procede de la topologia real y cuanto de la mera recurrencia dispersa. Se ejecuta en paralelo al brazo medido sobre las mismas historias y se comparan las metricas pareadas.
- Reproducibilidad de resultados de ablacion: cualquier investigador puede reconstruir el grafo disperso llamando a `control_indices(offsets, source, "shuffle", 1729)` sobre el dataset `fly-connectome-49k`, verificar que el hash del grafo coincide con `control_graph_w_indices_sha256` del `manifest.json` y volver a cargar los pesos sin ambiguedad.
- Validacion de pipelines de evaluacion: al ser un modelo minusculo con comportamiento conocido y artefactos publicados, permite comprobar que un arnes de evaluacion de lenguaje calcula correctamente cross-entropy, perplejidad y top-1 antes de lanzarlo sobre modelos grandes.
- Docencia de metodologia experimental en IA: ilustra de forma concreta que es un control apareado, por que se preserva la distribucion de grados y como se interpretan intervalos de confianza que excluyen el cero.
- Auditoria de afirmaciones sobre neuromorfismo: el modelo acota el efecto atribuible al cableado biologico en 0,0100 nats de CE y 0,91 puntos de top-1, cifra util para matizar titulares sobre "cerebros de mosca que hablan".
- Estudio de la relacion entre topologia y sharpness de la distribucion: la asimetria documentada (el cableado aporta el 15,1% de la mejora en exactitud pero solo el 0,96% de la mejora en cross-entropy) sirve como caso de estudio de como una misma intervencion afecta de forma distinta al ranking que a la distribucion de probabilidad.
- Punto de partida para controles adicionales: el propio autor senala la ausencia de un control de cero ejes; este modelo es la base sobre la que construir ese experimento, manteniendo la recurrencia y eliminando las conexiones.

## Benchmarks y rendimiento

Evaluacion sobre 200 historias reservadas y 45.059 objetivos de siguiente token. La poblacion no selecciono checkpoint, por lo que los numeros corresponden a los artefactos publicados.

| Modelo | Parametros | Cross-entropy (audit) | Perplejidad | Top-1 |
|---|---:|---:|---:|---:|
| Referencia liberada | 52.756.661 | 3,9882 | 53,96 | 31,38% |
| Este control (grafo reconectado) | 3.956.469 | 2,9593 | 19,29 | 36,52% |
| Conectoma medido | 3.956.469 | 2,9493 | 19,09 | 37,43% |

Comparacion pareada sobre las mismas historias (10.000 remuestras de historia completa, semilla 1729), diferencia reconectado menos medido:

| Metrica | Diferencia | IC 95% |
|---|---:|---|
| Cross-entropy | +0,0100 nats | [+0,0026, +0,0175] |
| Exactitud top-1 | -0,91 puntos | [-1,20, -0,63] |

Ambos intervalos excluyen el cero, por lo que el cableado especifico de la mosca aporta senal real, valorada en torno al 1% de la ventaja del modelo. El brazo con conectoma medido supera a la referencia liberada por 1,039 nats; la anatomia explica 0,0100 de esa cifra. Un cerebro de mosca reconectado al azar sigue superando a la referencia por 1,029 nats. No hay datos de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del recuento de parametros, no publicado por el autor): alrededor de 16 MB en fp32, 8 MB en fp16/bf16, 4 MB en int8 y 2 MB en int4. No se distribuyen pesos cuantizados.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU con soporte de PyTorch es suficiente, incluidas integradas y aceleradores de gama baja.
- Cabe en GPU de consumo: si, con enorme margen, en cualquier GPU consumer y probablemente en CPU. El cuello de botella no es la memoria sino la implementacion de la capa recurrente dispersa.
- Opciones de despliegue: no disponible. Los pesos son safetensors y requieren el codigo del repositorio para reconstruir el grafo; no hay publicacion de GGUF, Ollama, vLLM ni TGI para este modelo.
- Latencia y throughput estimados: no disponible.
- Requisito critico de despliegue: el grafo debe reconstruirse e instalarse sobre el modelo de referencia **antes** de construir el modelo, ya que este captura una instantanea de su grafo y rechaza cualquier edicion posterior. Si el grafo reconstruido no coincide con el hash `control_graph_w_indices_sha256`, hay que detenerse.

## Comparativa con modelos similares

La comparacion natural es interna a la propia serie de ablacion. No se dispone de comparacion con modelos de proposito general porque el objeto de estudio no es la calidad del texto, sino la contribucion del cableado.

| Modelo | Parametros | Cross-entropy | Perplejidad | Top-1 | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| `fly-wordbrain-shuffled-10k` (este control) | 3.956.469 | 2,9593 | 19,29 | 36,52% | CC BY 4.0 | HuggingFace |
| Brazo con conectoma medido (misma serie) | 3.956.469 | 2,9493 | 19,09 | 37,43% | no disponible | no disponible como enlace directo en la informacion consultada |
| Referencia liberada | 52.756.661 | 3,9882 | 53,96 | 31,38% | no disponible | identificador no especificado en la model card |

Nota: la model card menciona `fly-wordbrain-rank64` como el modelo del que este control es el brazo de 10.000 historias, con los mismos 3.956.469 parametros entrenables. El identificador exacto de la "referencia liberada" de 52.756.661 parametros no se explicita, por lo que no se afirma que corresponda a `fly-wordbrain-rank64`.

## Limitaciones y advertencias

- **No es un modelo para usar.** Es un brazo de control. Cargar estos pesos sobre el conectoma medido produce un modelo que nunca fue entrenado y cualquier puntuacion obtenida asi carece de significado.
- **Una sola semilla y un solo shuffle.** No se puede separar cuanto de los 0,0100 nats es ruido entre ejecuciones; una segunda semilla daria esa cota.
- **Entrenamiento no convergido.** 16.800 actualizaciones equivalen a 1,83 pasadas sobre 10.000 historias; el entrenador marca `debug_stopped` con `debug: true` para senalar el limite de actualizaciones, no un fallo.
- **Sin control de cero ejes.** Ambos brazos conservan los 9.050.172 ejes, de modo que nada acota la contribucion de la recurrencia en si misma.
- **Riesgo de alucinacion y calidad de texto:** no se publican evaluaciones de calidad generativa mas alla de cross-entropy y top-1 sobre historias infantiles; con 3,96 millones de parametros y 1,83 epocas, la calidad del texto es limitada por diseno y no se caracteriza en la model card.
- **Idioma:** unicamente ingles, y el corpus TinyStories es de vocabulario y sintaxis muy simples; no hay evidencia de generalizacion fuera de ese dominio.
- **Dependencia estricta del grafo.** El modelo solo es valido si el grafo se reconstruye con la funcion y la semilla indicadas y su hash coincide con el del manifest. Cualquier otra configuracion invalida el experimento.
- **Contexto:** la longitud de contexto no se declara, por lo que no puede asumirse ninguna ventana concreta para uso en produccion.
- **Licencia:** los pesos son CC BY 4.0, lo que exige atribucion a los autores y a las fuentes derivadas (MaleCNS v1.0 de FlyEM / HHMI Janelia, University of Cambridge, MRC LMB y Google Research, y la arquitectura de `ngxson/fly-llm-hf`). El codigo es MIT. TinyStories no se redistribuye.
- **Fecha de publicacion:** el repositorio figura creado y actualizado el 17 de septiembre de 2026, con 0 descargas y 0 likes; no hay evidencia de uso independiente ni de revision por terceros.
- **Busqueda web:** los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo (hilos de un foro italiano sobre un servicio de correo), por lo que no aportan informacion verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fernandofernandes/fly-wordbrain-shuffled-10k
- Modelo de referencia de la serie: https://huggingface.co/fernandofernandes/fly-wordbrain-rank64
- Dataset del conectoma utilizado: https://huggingface.co/datasets/fernandofernandes/fly-connectome-49k
- Dataset de entrenamiento (TinyStories): https://huggingface.co/datasets/roneneldan/TinyStories
- Arquitectura de base: https://huggingface.co/ngxson/fly-llm-hf
- Write-up completo, Stage 7: https://github.com/fernando-neto-ai/fly-wordbrain/blob/main/experiments/07-graph-control/README.md
- Resultados de busqueda web: ningun enlace relevante encontrado; los resultados devueltos tratan sobre un servicio de correo electronico y no se relacionan con el modelo.

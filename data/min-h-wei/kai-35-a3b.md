# min-h-wei/Kai-35-A3B

## Resumen

Kai-35-A3B es un adaptador LoRA de rango 32 sobre Qwen3.6-35B-A3B, desarrollado por min-h-wei, orientado especificamente a la seguridad de agentes. A diferencia de un modelo generativo convencional, no produce texto libre: recibe las reglas escritas, los hechos calculados por el host, el historial de conversacion o sesion y un paso propuesto, y emite una unica decision binaria (permitir o denegar) acompanada de una probabilidad y de los fragmentos de evidencia que han determinado la respuesta. El modelo cubre tres tipos de evento: propuestas de llamadas a herramientas, historiales multi-turno o multi-sesion y contenido entrante (resultados de herramientas, paginas descargadas o ficheros).

El modelo base Qwen3.6-35B-A3B es un transformer de tipo Mixture of Experts con 35.000 millones de parametros totales y 3.000 millones activos por token (el sufijo A3B lo indica), aunque la ficha del adaptador no detalla la longitud de contexto ni la composicion del dataset de entrenamiento del base. El adaptador anade dos cabezas: una de decision y otra de evidencia (esta ultima marcada como linea de investigacion). Se sirve a traves de AgentArmor con backend MLX en Apple Silicon.

La relevancia actual del modelo radica en su enfoque de seguridad para agentes: en lugar de intentar alinear un generador, se entrena un clasificador de decision sobre un modelo grande con reglas explicitas y hechos computados por el host, lo que permite auditar cada decision mediante los spans de evidencia. No obstante, el autor lo marca explicitamente como release candidate para uso interno, con `policy_ready: false` y sin validacion sobre un conjunto de test sellado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre Qwen3.6-35B-A3B (MoE transformer), con cabeza de decision y cabeza de evidencia; inferencia via MLX |
| Parametros totales | 35.000 millones (modelo base); el adaptador LoRA no especifica numero de parametros propios |
| Parametros activos | 3.000 millones (modelo base, MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits en los expertos enrutados (segun `kai.json`); adaptador en bfloat16 sin fusionar |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, cabezas de decision y evidencia); sin exportacion a GGUF ni vLLM |

## Arquitectura y entrenamiento

El adaptador se entrena desde cero sobre el modelo base Qwen3.6-35B-A3B en la revision `345d467b117d1fd5eda9b879a5988de9ae5f47a7`. Sobre el transformer MoE se anaden dos cabezas: `pointer.safetensors` (decision) y `evidence_head.safetensors` (spans de evidencia, de caracter investigador). El paquete `kai.json` contiene la identidad del modelo: revision del base, hashes de ficheros, cuantizacion de expertos enrutados (4 bits), hash del tokenizer, versiones del runtime y forma del forward. AgentArmor verifica todos los hashes antes de cargar el paquete.

El entrenamiento se realizo con registros sinteticos y autorados: llamadas a herramientas con reglas escritas y hechos calculados por el host, historiales multi-sesion cuya etiqueta se decide por una regla visible o por las palabras del propio usuario, y documentos con y sin instrucciones dirigidas al agente. No se emplearon datos de evaluacion en el entrenamiento. El autor indica que los datos y sus etiquetas fueron revisados por un unico lector automatizado de la misma familia de modelos que sus autores. No se documenta uso de RLHF ni DPO.

El modelo no incorpora politica propia: las reglas llegan como texto y los calculos y conocimiento del sistema llegan como hechos computados por el host (rutas resueltas, origenes de URL, importes). Esto desplaza la responsabilidad de la politica al operador y deja al modelo como clasificador de cumplimiento.

## Capacidades

- Decision binaria de permitir o denegar con probabilidad asociada, sobre tres tipos de evento: llamadas a herramientas, historiales multi-turno/multi-sesion y contenido entrante.
- Extraccion de spans de evidencia: devuelve los pasajes de la entrada que han determinado la decision (cabecera de investigacion).
- Deteccion de prompt injection en contenido: deniega contenido que contiene instrucciones dirigidas al agente, permitiendo texto citado o reportado.
- Seguimiento de reglas escritas y de las palabras del usuario en historiales con aprobaciones, revocaciones y condiciones.
- Uso de hechos calculados por el host (rutas resueltas, origenes de URL, importes) para fundamentar la decision.
- No genera texto libre: es un clasificador de decision, no un modelo conversacional.
- Sin soporte documentado de tool calling generativo, agentes multi-paso ni capacidades multimodales.
- Ambito limitado a ciberseguridad y entornos de computacion; la seguridad de contenido queda fuera de alcance.

## Casos de uso

- Monitorizacion de llamadas a herramientas en agentes: el modelo recibe la propuesta de llamada, las reglas escritas y los hechos computados por el host, y decide si puede ejecutarse. Adecuado porque su recall en decisiones de llamada a herramienta es del 61% con un 1% de falsos positivos, muy superior al 34% de Kai-4B.
- Control de acceso en sesiones largas: en historiales multi-turno o multi-sesion con aprobaciones y revocaciones, el modelo decide si un paso sigue autorizado segun la regla visible o las palabras del usuario. Su recall en este caso es del 89% frente al 4% de Kai-4B.
- Filtrado de contenido entrante en pipelines de agentes: resultados de herramientas, paginas descargadas o ficheros se evaluan antes de pasarse al agente; si contienen instrucciones dirigidas al agente, se deniegan. Recall del 67% con 1% de falsos positivos.
- Deteccion de prompt injection en documentos y tablas: con recall del 95% frente al 90% de Kai-4B, es adecuado para procesar documentos estructurados antes de la ingestion.
- Auditoria y trazabilidad de decisiones: la cabeza de evidencia devuelve los pasajes que fundamentan cada decision, con spans exactos el 94% del tiempo y recuperando el 90% de los pasajes marcados, lo que facilita la revision humana.
- Despliegue local en Apple Silicon para entornos de desarrollo y pruebas: via AgentArmor con backend MLX, con carga de 26 s, mediana de 0,70 s y percentil 95 de 2,1 s por peticion, y unos 25 GB de memoria GPU.

## Benchmarks y rendimiento

Recall con una tasa de falsos positivos del 1%, sobre registros no vistos en entrenamiento, comparado con Kai-4B:

| Caso de uso | Kai-4B | Kai-35-A3B |
|---|---:|---:|
| Decisiones multi-turno y multi-sesion | 4% | 89% |
| Decisiones de llamada a herramienta | 34% | 61% |
| Prompt injection en contenido | 68% | 67% |

Medido de la misma forma, Kai-35-A3B lidera en prompt injection en documentos y tablas (95% frente a 90%) y va por detras en textos cortos (41% frente a 45%).

Cobertura de spans de evidencia (proporcion de preguntas retenidas donde los spans cubren todos los pasajes marcados):

| Caso de uso | Kai-35-A3B |
|---|---:|
| Decisiones multi-turno | 95% |
| Decisiones de llamada a herramienta | 55% |
| Instrucciones inyectadas | 32% |

Los spans son exactos el 94% de las veces y recuperan el 90% de los pasajes marcados. En documentos limpios, donde no deberia marcarse nada, el modelo no marca nada.

Rendimiento de servicio medido en una maquina Apple Silicon: carga de 26 s; mediana de 0,70 s y percentil 95 de 2,1 s por peticion; unos 25 GB de memoria GPU. El loader de AgentArmor reproduce el scorer de entrenamiento en 296 peticiones (diferencia maxima de probabilidad de 0,00008) y devuelve los spans ajustados en 60 de 60 registros retenidos.

## Requisitos de hardware

- Memoria GPU: aproximadamente 25 GB medidos en una maquina Apple Silicon con el backend MLX.
- GPU recomendadas: el unico backend documentado es MLX en Apple Silicon; no hay exportacion a vLLM ni a otros runtimes.
- Cabe en GPU de consumo: no hay datos para GPUs NVIDIA de consumo; los 25 GB medidos exceden la VRAM de la mayoria de tarjetas consumer, aunque no se documenta el comportamiento en ellas.
- Opciones de despliegue: AgentArmor con `--kai-backend mlx` y contrato `one-question/1`; no existe exportacion a vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 0,70 s y percentil 95 de 2,1 s por peticion; carga de 26 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Recall multi-turno (1% FPR) | Recall tool-call (1% FPR) | Spans de evidencia | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|---|
| Kai-35-A3B | 35B totales / 3B activos (base) | no disponible | 89% | 61% | Si (cabecera de investigacion) | Apache-2.0 | Hugging Face, via AgentArmor/MLX |
| Kai-4B | no disponible | no disponible | 4% | 34% | No | no disponible | Hugging Face |
| Qwen3.6-35B-A3B (base) | 35B totales / 3B activos | no disponible | no aplica (generativo) | no aplica | No | Apache-2.0 (segun adaptador) | Hugging Face |

La comparacion con Kai-4B es la mas directa, ya que ambos son modelos de decision para seguridad de agentes del mismo autor. Qwen3.6-35B-A3B se incluye como referencia del modelo base, pero no es un clasificador de decision y no es comparable en la tarea.

## Limitaciones y advertencias

- Estado de release candidate para uso interno: `policy_ready: false`; la aplicacion de politicas no esta cualificada.
- Una sola ejecucion de entrenamiento, sin segunda semilla y sin lectura de un test sellado; los numeros no estan confirmados.
- Los registros multi-turno y de llamada a herramienta provienen de los mismos generadores que los datos de entrenamiento (raices retenidas); los paneles de inyeccion se usaron durante el desarrollo y el modelo lee su propia representacion de esos registros.
- El umbral de corte solo esta calibrado para contenido entrante: denegar por encima de 0,90 deniega menos del 1% de contenido limpio de calibracion (cota superior del 95%: 0,97%), pero alrededor del 7% de textos cortos limpios en un panel de desarrollo que incluye textos que discuten instrucciones. Las llamadas a herramienta y las sesiones no estan calibradas.
- El modelo deniega una llamada que depende de un total en curso, sea cual sea la suma.
- Los textos cortos que reportan o citan una instruccion son su caso mas debil (41% de recall frente al 45% de Kai-4B).
- La cabeza de spans es de investigacion; la coincidencia entre el servicio y el codigo de entrenamiento no cualifica la calidad de los spans, y los spans para instrucciones inyectadas son los mas debiles (32%).
- Los datos de entrenamiento y sus etiquetas fueron revisados por un unico lector automatizado de la misma familia de modelos que sus autores.
- Ambito limitado a ciberseguridad y entornos de computacion; la seguridad de contenido queda fuera de alcance.
- Riesgo de alucinacion no documentado explicitamente, pero al ser un clasificador de decision el riesgo se traslada a falsos negativos y falsos positivos en la politica.
- Licencia Apache-2.0, igual que el modelo base, sin restricciones adicionales documentadas para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/min-h-wei/Kai-35-A3B
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Modelo comparable Kai-4B: https://huggingface.co/min-h-wei/Kai-4B
- Repositorio AgentArmor: https://github.com/min-mwei/AgentArmor

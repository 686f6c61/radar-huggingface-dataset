# muvon/hindsight

## Resumen

hindsight (etiquetado internamente como hindsight-v2) es un modelo discriminativo, no generativo, desarrollado por muvon para verificar sesiones de agentes de programación. A partir de la traza canonica de eventos de una sesion (turnos del usuario, mensajes del agente, llamadas a herramientas y sus resultados, y diffs de codigo), predice en cada frontera de turno de usuario si el siguiente turno sera una correccion y de que tipo: `not_done`, `unrequested`, `rule_violation` u `other`. La clave del diseno es que se entrena con etiquetas de "hindsight", es decir, con lo que el usuario hizo realmente a continuacion, y nunca con las afirmaciones del propio agente.

Tecnicamente es un pipeline de dos niveles. El primer nivel es un encoder UniXCoder-base afinado de extremo a extremo sobre trazas de sesion; el segundo es una GRU de 2 capas que opera sobre los ultimos 24 vectores de evento, seguida de cabezas de clasificacion calibradas con escalado de Platt sobre una particion reservada. El resultado son cinco cabezas (una por clase) que devuelven probabilidades calibradas por evento.

Su relevancia es practica: los agentes de codigo fallan de formas dificiles de detectar en tiempo real, y este modelo ofrece una senal de ranking o rechazo barata (0,5 GB de repo) para disparar intervenciones, reevaluaciones o escalado a un humano en pipelines de agentes, en lugar de depender de la autoevaluacion del propio modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (UniXCoder-base) afinado end-to-end + GRU de 2 capas (nivel 2) + cabezas de clasificacion con calibracion de Platt |
| Parametros totales | No disponible en la model card; el encoder base microsoft/unixcoder-base ronda los 125 M de parametros (dato externo, no confirmado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en tokens; ventana de 24 vectores de evento en el nivel 2 |
| Tipos de cuantizacion | fp32 (recomendado por el autor); int8 y ONNX evaluados en CPU y descartados |
| Idiomas soportados | No disponibles (orientado a trazas de codigo y mensajes de sesion) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (directorio `encoder/`, compatible con transformers) y `model.pt` (nucleo del nivel 2 y cabezas, claves con prefijo `ver.`) |

## Arquitectura y entrenamiento

El modelo combina un encoder de codigo con una capa recurrente y un conjunto de clasificadores. UniXCoder-base se afina de extremo a extremo para producir representaciones de evento a partir de la traza canonica de sesion, que incluye turnos de usuario, mensajes del agente, invocaciones de herramientas con sus resultados y diffs. Encima, una GRU de 2 capas consume los ultimos 24 vectores de evento y resume la dinamica temporal de la sesion. Cada una de las cinco cabezas emite una probabilidad que pasa por escalado de Platt, ajustado sobre una particion reservada, de modo que las salidas son probabilidades calibradas y no solo puntuaciones relativas.

El punto mas distintivo es la senal de entrenamiento: las etiquetas provienen de lo que el usuario hizo despues (correcciones reales), no de lo que el agente afirmo haber hecho. Esto evita heredar el sesgo de autojustificacion de los generadores y ancla el objetivo en comportamiento observable. No se especifica en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas adicionales de RLHF o DPO; el modelo tampoco es generativo, por lo que no aplica un ajuste de preferencias clasico. La particion de test esta separada por repositorio y por usuario, lo que reduce la fuga de informacion entre entrenamiento y evaluacion.

## Capacidades

- Clasificacion binaria y multiclase de eventos de sesion: predice si el siguiente turno del usuario sera una correccion.
- Cuatro subtipos de correccion: `not_done` (tarea no completada), `unrequested` (cambios no solicitados), `rule_violation` (violacion de reglas) y `other`.
- Probabilidades calibradas mediante escalado de Platt, aptas para umbrales y ranking.
- Procesamiento de trazas estructuradas: turnos de usuario, mensajes de agente, llamadas a herramientas con resultado y diffs de codigo.
- Modelado de contexto temporal limitado a los ultimos 24 eventos, suficiente para capturar la dinamica reciente de la sesion.
- NO genera texto, codigo ni razonamiento: es exclusivamente un verificador discriminativo.
- No soporta tool calling, function calling ni ejecucion de agentes por si mismo; se integra como componente de evaluacion dentro de un pipeline.
- Idiomas soportados no disponibles; el dominio de aplicacion es codigo y sesiones de agentes.

## Casos de uso

- Monitorizacion en vivo de sesiones de agentes: ejecutar el modelo en cada frontera de turno para obtener una probabilidad de correccion y activar avisos cuando supere un umbral, antes de que el usuario tenga que intervenir manualmente.
- Senal de rechazo en pipelines de generacion: usar la cabeza `not_done` o `correction` como filtro para descartar o marcar respuestas del agente antes de mostrarlas, aceptando la cobertura limitada (0,04 con precision del 80 %) como filtro de alta precision.
- Ranking de candidatos: dado que tiene AUROC moderado pero util en las cabezas `unrequested` (0,845 global) y `not_done` (0,778), sirve para ordenar varias trayectorias o respuestas alternativas de un agente y elegir la de menor riesgo.
- Control de calidad de flotas de agentes: agregar las probabilidades de correccion por repositorio o por usuario para detectar sesiones problematicas, regresiones de prompt o degradaciones tras un cambio de modelo.
- Escalado a humano: disparar la revision manual cuando la cabeza correspondiente indique alta probabilidad de `rule_violation` (AUROC 0,678 global, 0,865 en Codex local), evitando que un agente siga actuando fuera de las reglas definidas.
- Evaluacion offline de agentes en CI: integrar el verificador en un pipeline de integracion continua que reproduce sesiones grabadas y calcula metricas de correccion, sustituyendo o complementando las evaluaciones basadas en juicios generados por el propio modelo.
- Curacion de datos y aprendizaje activo: priorizar las sesiones con mayor probabilidad de correccion para anotacion o reentrenamiento, dado que la baja cobertura a alta precision lo hace mas adecuado como clasificador de ranking que como etiquetador masivo.
- Investigacion sobre agentes: analizar tasas de correccion por tipo de tarea, herramienta o familia de modelo para estudiar patrones de fallo en agentes de codigo.

## Benchmarks y rendimiento

AUROC en la particion de test, con probabilidades escaladas por Platt y separacion por repositorio y usuario:

| Cabeza | Todas las fuentes | Claude Code local | Codex local | SWE-chat |
|---|---|---|---|---|
| correction | 0,727 | 0,743 | 0,709 | 0,719 |
| not_done | 0,778 | 0,841 | 0,747 | 0,767 |
| unrequested | 0,845 | 0,926 | 0,744 | 0,857 |
| rule_violation | 0,678 | 0,772 | 0,865 | 0,661 |
| other | 0,599 | 0,627 | 0,714 | 0,576 |

La cobertura con precision del 80 % en la cabeza global de correccion es de 0,04. El autor indica que la cabeza `other` no es utilizable. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es generativo y no aplica ese tipo de evaluacion.

## Requisitos de hardware

- Al tratarse de un encoder de aproximadamente 125 M de parametros mas una GRU de 2 capas, el footprint es reducido: el repositorio completo ocupa 0,5 GB.
- Segun el propio autor, la inferencia en CPU debe mantenerse en fp32; las variantes int8 y ONNX fueron evaluadas y descartadas en el fichero `quant_bench.json`.
- Cabe en tarjetas consumer de gama baja y en CPU: no requiere A100, H100 ni RTX 4090, aunque pueden usarse para procesar lotes grandes de sesiones.
- Despliegue: el encoder es compatible con transformers y pesos safetensors; el nucleo del nivel 2 y las cabezas se cargan desde `model.pt` (PyTorch). No se documentan integraciones con vLLM, TGI u Ollama, que ademas no aplican a un modelo no generativo.
- Latencia y throughput estimados: no disponibles. El coste por evento es bajo por el tamano del modelo, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos publicados directamente comparables (verificadores no generativos de sesiones de agentes de codigo con cabezas de correccion calibradas). Alternativas de la misma categoria, como modelos de recompensa genericos o clasificadores de calidad de codigo, no aparecen en la busqueda proporcionada, por lo que no se puede ofrecer una tabla comparativa con datos verificables.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| muvon/hindsight | No disponible (encoder ~125 M, dato externo) | 24 eventos de ventana | AUROC 0,599-0,845 segun cabeza | Apache-2.0 | HuggingFace |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo no generativo: no produce texto, codigo ni explicaciones; solo devuelve puntuaciones de clasificacion.
- Cobertura muy baja a alta precision: 0,04 con precision del 80 % en la cabeza de correccion, por lo que solo es util como senal de ranking o rechazo, no como detector exhaustivo.
- La cabeza `other` tiene un AUROC de 0,599 en el agregado y el propio autor la declara no utilizable.
- Rendimiento desigual por fuente: `rule_violation` baja a 0,661 en SWE-chat y sube a 0,865 en Codex local, lo que sugiere sensibilidad al origen de los datos y posible perdida de generalizacion en dominios no representados.
- Depende de un formato canonico de traza de eventos que incluya turnos, llamadas a herramientas con resultados y diffs; trazas incompletas o con otro esquema degradaran las predicciones.
- Ventana temporal limitada a los ultimos 24 eventos, lo que puede perder senal de sesiones muy largas.
- Idiomas soportados no declarados; se desconoce el comportamiento con sesiones y mensajes en castellano u otros idiomas distintos del ingles.
- Licencia Apache-2.0: permite uso comercial y modificacion, con las obligaciones habituales de atribucion y conservacion del aviso de licencia.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, y una fecha de creacion poco habitual (2026-09-20), por lo que conviene validar el modelo con datos propios antes de usarlo en produccion.
- No hay informacion sobre sesgos, tasas de error por subgrupo ni evaluaciones de robustez frente a trazas adversariales.
- Los resultados de la busqueda web no aportan informacion relevante sobre el modelo; todos los enlaces devueltos corresponden a Instagram y no guardan relacion con esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/muvon/hindsight
- Modelo base: https://huggingface.co/microsoft/unixcoder-base
- Ficheros incluidos en el repositorio: `encoder/` (transformers, safetensors), `model.pt` (nucleo del nivel 2 y cabezas, prefijo `ver.`), `config.json`, `results.json`, `quant_bench.json`
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada

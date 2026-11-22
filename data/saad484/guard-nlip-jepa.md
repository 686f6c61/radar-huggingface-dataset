# saad484/guard-nlip-jepa

## Resumen

Guard-NLIP-JEPA es un modelo de seguridad para agentes que implementan el protocolo NLIP (ECMA-430). Lo desarrolla el autor independiente saad484 como la capa aprendida (L3) de Guard-NLIP, una extensión de seguridad de tipo 3 para agentes. Su función concreta es puntuar la improbabilidad de una llamada a herramienta dado el contexto de la petición del usuario: recibe la solicitud y una llamada canónica (nombre de herramienta y argumentos de control, excluyendo texto libre) y devuelve una puntuación de anomalía. Una puntuación igual o superior a 1 se interpreta como alarma.

Técnicamente es un modelo de embedding conjunto predictivo (JEPA) construido sobre el encoder `sentence-transformers/all-MiniLM-L6-v2`, con 23.183.941 parámetros y un repositorio de 0,1 GB en formato safetensors. No es un modelo generativo ni un LLM: no produce texto, sino una puntuación escalar normalizada. Su relevancia actual radica en que aborda un vector de ataque específico en agentes con herramientas, el *confused deputy* o uso indebido de una herramienta legítima con argumentos que no corresponden a la intención del usuario, y lo hace entrenándose únicamente con tráfico benigno.

La propuesta es deliberadamente conservadora: el autor recomienda usarlo como señal para preguntar al usuario, junto a las capas de reglas (L1 de política, L2 de procedencia), y no como bloqueador autónomo. Además, el modelo está ajustado a un conjunto cerrado de cinco herramientas simuladas, lo que acota estrictamente su ámbito de aplicación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | JEPA (joint-embedding predictive architecture): encoder de contexto, encoder objetivo y predictor condicionado por herramienta, sobre transformer MiniLM |
| Parámetros totales | 23.183.941 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del encoder MiniLM-L6, no documentada en la información proporcionada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (junto a config.json, sin pickle) |

## Arquitectura y entrenamiento

El modelo es un JEPA de embedding conjunto. Un encoder de contexto embebe la petición del usuario; un encoder objetivo embebe la llamada canónica (nombre de herramienta más argumentos de control, excluyendo argumentos de texto libre); y un predictor condicionado por la herramienta predice el embedding de la llamada a partir del contexto. La función de pérdida combina el error de predicción con SIGReg (LeJEPA) y una cabeza de plausibilidad de herramienta. La puntuación final es el error de predicción más la log-verosimilitud negativa de la herramienta, cada término dividido por su cuantil del 99,5 % calculado sobre llamadas benignas de retención; una puntuación de 1 o superior constituye alarma.

El entrenamiento se realizó exclusivamente con trazas benignas del generador de benchmarks del propio repositorio (`python -m guard_nlip.bench.generate --seed 0`), sobre cinco herramientas simuladas: `web_fetch`, `read_file`, `send_email`, `run_sql` y `run_shell`. El comando de entrenamiento documentado es `python -m guard_nlip.jepa.train --encoder sentence-transformers/all-MiniLM-L6-v2 --seed 0`. No se usaron datos de ataque. El modelo está ajustado únicamente a ese conjunto de herramientas, lo que constituye una restricción de diseño central.

## Capacidades

- Puntuación de anomalía de llamadas a herramienta: dado un contexto de petición y una llamada canónica, devuelve una puntuación normalizada donde valores ≥ 1 indican alarma.
- Detección de *confused deputy*: identifica llamadas con herramientas legítimas pero argumentos de control incoherentes con la petición del usuario.
- Modelado de plausibilidad de herramienta: una cabeza específica estima si la herramienta invocada es verosímil para el contexto dado.
- Integración como proxy de guardia: se puede cargar mediante `GUARD_JEPA=hf://saad484/guard-nlip-jepa uvicorn guard_nlip.server.guard_proxy:app`.
- Carga sin pickle: `JEPAScorer.load` lee `config.json` y `model.safetensors`.
- API de puntuación directa: `raw_scores` y `normalized` sobre listas de peticiones, llamadas y nombres de herramienta.
- No soporta generación de texto, tool calling generativo, razonamiento multi-paso, visión ni audio: es un scorer, no un LLM.

## Casos de uso

- Protección de agentes NLIP en producción: desplegado como capa L3 dentro del proxy de guardia, puntúa cada llamada a herramienta antes de ejecutarla y eleva una señal cuando la puntuación supera el umbral, para que el agente pida confirmación al usuario.
- Detección de exfiltración mediante envío de correo: en el ejemplo documentado, una petición de resumen de un informe y una llamada `send_email | to=archive@drop-zone.xyz` producen una puntuación de 11,09, muy por encima del umbral de alarma, lo que permite interceptar el envío a un dominio no solicitado.
- Auditoría de trazas de agentes: al puntuar llamadas históricas contra su contexto, permite priorizar revisiones humanas sobre las llamadas con mayor improbabilidad, reduciendo el volumen de revisión manual.
- Señal de confirmación interactiva: integrado en el bucle del agente, puede convertir llamadas sospechosas en preguntas al usuario en lugar de ejecuciones automáticas, un patrón adecuado para herramientas destructivas como `run_shell` o `run_sql`.
- Base para ajuste con tráfico propio: dado que el autor recomienda reentrenarlo con las trazas benignas de cada despliegue, sirve como punto de partida para adaptar el scorer a un conjunto de herramientas y a una distribución de peticiones específicos.
- Investigación en seguridad de agentes: como implementación reproducible de un JEPA con pérdida SIGReg aplicada a detección de anomalías en llamadas, es útil para comparar enfoques aprendidos frente a similitud sin entrenamiento en conjuntos como AgentDojo o InjecAgent.

## Benchmarks y rendimiento

Resultados publicados en la model card (semilla 0 de tres, salvo donde se indica):

| Configuración | Resultado |
|---|---|
| Benchmark propio, llamadas de *confused deputy* | AUC 1,000; 100 % detectadas (las tres semillas) |
| Benchmark propio, todas las llamadas de ataque | AUC 0,875; falsas alarmas 1,1 % de llamadas benignas (1,1-5,9 % entre semillas) |
| AgentDojo, llamadas en vivo (reentrenado por fold sobre AgentDojo) | AUC 0,57-0,66; una similitud sin entrenamiento alcanza 0,83 |
| InjecAgent, entrenado sobre ToolACE (transferencia) | No superó a una similitud sin entrenamiento (protocolo fijado de antemano) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 23,2 M de parámetros y pesos en safetensors, el modelo completo ocupa del orden de decenas de MB en FP32, por lo que cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer moderna es suficiente, e incluso la inferencia en CPU es viable.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño del repositorio (0,1 GB).
- Opciones de despliegue: el paquete `guard_nlip` (instalación con `pip install -e .` desde el repositorio de GitHub), carga vía `hf://saad484/guard-nlip-jepa` y despliegue como proxy con `uvicorn guard_nlip.server.guard_proxy:app`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Enfoque de detección | Licencia |
|---|---|---|---|---|---|
| Guard-NLIP-JEPA | JEPA sobre MiniLM | 23,2 M | no disponible | Aprendido solo con benignos, cinco herramientas | MIT |
| Similitud sin entrenamiento (referencia del paper) | Embedding coseno | no disponible | no disponible | Comparación directa de embeddings | no disponible |
| Capas de reglas L1/L2 de Guard-NLIP | Reglas y procedencia | no aplica | no aplica | Política y procedencia | MIT (mismo repositorio) |

No se dispone de datos para comparar con modelos de seguridad de terceros; la comparación relevante que aporta el propio autor es frente a la similitud sin entrenamiento, que supera a este modelo en AgentDojo (0,83 frente a 0,57-0,66) y en la transferencia desde ToolACE.

## Limitaciones y advertencias

- Ámbito restringido: modela únicamente cinco herramientas simuladas (`web_fetch`, `read_file`, `send_email`, `run_sql`, `run_shell`); fuera de ese conjunto su comportamiento no está validado.
- Entrenado solo con datos benignos: no ha visto ataques, lo que limita su generalización a patrones maliciosos no representados en la distribución benigna.
- Rendimiento débil en transferencia: en AgentDojo en vivo el AUC cae a 0,57-0,66 y en InjecAgent no supera a una similitud sin entrenamiento, por lo que no debe asumirse que funcione fuera de su distribución de entrenamiento.
- Tasa de falsas alarmas variable: entre el 1,1 % y el 5,9 % de llamadas benignas según la semilla, lo que puede generar fricción si se usa como bloqueador.
- Recomendación explícita del autor: usarlo como señal para preguntar al usuario junto a las capas de reglas, no como bloqueador autónomo, y reentrenarlo con el tráfico benigno del despliegue.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de puntuaciones erróneas por desajuste de distribución.
- Sesgos conocidos: no documentados.
- Idiomas: no documentados; el encoder base MiniLM es multilingüe limitado, pero no se especifica el soporte real del scorer.
- Licencia MIT: permite uso comercial, pero no se ofrece garantía ni soporte del autor.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 21 de noviembre de 2026; sin pipeline declarado en Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saad484/guard-nlip-jepa
- Código y paper: https://github.com/saad484/SafeOSE27-Guard-NLIP
- Demo en vivo: https://huggingface.co/spaces/saad484/guard-nlip
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2

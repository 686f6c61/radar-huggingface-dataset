# Calm153/vitrion-qwen3-1.7b-qlora-n256

## Resumen

Vitrion QLoRA draft n256 es un adaptador PEFT (QLoRA) publicado por el usuario Calm153 sobre el modelo base Qwen/Qwen3-1.7B. No se trata de un modelo fundacional, sino de un ajuste fino ligero orientado a una tarea sintetica y estrecha: un "simulador ficticio de maquina" en el que el modelo debe emitir decisiones y configuraciones exactas en formato JSON, manteniendo coherencia con un estado inicial que solo se proporciona en el primer turno de la conversacion. El adaptador se entrena con 256 conversaciones generadas de forma sintetica y etiquetadas con un oraculo.

La relevancia de esta publicacion es limitada y de caracter experimental: el propio autor la describe como un checkpoint borrador, no como un controlador de seguridad listo para produccion. La model card reporta metricas de una evaluacion propia sobre 30 conversaciones y 180 turnos puntuados, con una adherencia a especificacion del 69,4 % y una tasa de conversaciones superadas del 50 %, valores muy por debajo del umbral de fiabilidad del 100 % que el autor se autoimpone.

Arquitecturalmente hereda todas las caracteristicas del modelo base Qwen3-1.7B (transformer denso de 1.700 millones de parametros), mientras que el adaptador anade un conjunto reducido de pesos entrenados en precision baja sobre las capas del modelo. El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA (PEFT) sobre transformer denso Qwen3-1.7B |
| Parametros totales | No disponible (adaptador sobre un base de 1.700 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen3-1.7B) |
| Tipos de cuantizacion | QLoRA implica entrenamiento con cuantizacion del base; los pesos del adaptador se publican en safetensors. No se detallan otros formatos |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT), libreria `peft` |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA, es decir, el modelo base Qwen3-1.7B se mantiene cuantizado y congelado mientras se entrenan matrices de bajo rango inyectadas en las capas. El repositorio solo contiene los pesos del adaptador (unos 0,1 GB), no el modelo completo. El autor fija la revision del base en `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e` y la del codigo de evaluacion en `b135d181ee6239061750eb2b683c23d7c61d273b`, lo que permite reproducir el experimento de forma determinista.

El dataset de entrenamiento consta de 256 conversaciones sinteticas sobre una tarea ficticia de maquina. El diseno del dialogo es deliberadamente restrictivo: el estado inicial aparece una sola vez y los turnos posteriores no incluyen recordatorio de estado, formula, puntuacion del simulador ni correccion del oraculo, de modo que el modelo debe inferir y mantener el estado internamente. Las etiquetas del profesor fueron guiadas por oraculo y filtradas exactamente, no inferidas de forma independiente, lo que el autor senala explicitamente como una limitacion metodologica. No se detallan hiperparametros, numero de tokens ni GPU en la informacion disponible; el autor remite a un fichero `training.json` no incluido en la model card.

## Capacidades

- Generacion de decisiones y configuraciones exactas en formato JSON dentro de un dominio sintetico y acotado.
- Mantenimiento implicito de estado conversacional a lo largo de varios turnos sin recordatorios explicitos.
- Razonamiento de un solo paso sobre reglas de transicion y restricciones de seguridad definidas en la tarea.
- Capacidades conversacionales basicas heredadas del base Qwen3-1.7B (generacion de texto general, aunque el ajuste esta especializado).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de pensamiento extendido.
- Capacidades multilingues: no disponibles; no se especifican idiomas en la model card.

## Casos de uso

- Investigacion sobre ajuste fino eficiente: sirve como ejemplo reproducible de pipeline QLoRA con evaluacion propia y codigo versionado, util para estudiar como se degrada el mantenimiento de estado con pocos datos (256 conversaciones).
- Prototipado de controladores de decision en entornos simulados: permite experimentar con politicas que emiten JSON de decision y configuracion antes de invertir en un modelo mayor o en datos reales.
- Estudio de adherencia a especificacion: el conjunto de metricas (spec_adherence, robustness, conversation_pass) y el desglose de fallos (WRONG_STATE, UNSAFE_ACCEPTANCE, WRONG_DECISION) ofrecen un marco reutilizable para evaluar modelos en tareas con reglas estrictas.
- Pruebas de robustez conversacional: util para medir cuanto estado se pierde cuando no se recuerda el contexto inicial, un problema comun en agentes de larga duracion.
- Base para ablaciones de tamano de dataset: el autor menciona una curva de cuatro tamanos pendiente; este checkpoint de n=256 puede servir como punto de partida para comparaciones.
- Docencia y divulgacion: ejemplo claro de por que un adaptador pequeno no basta para tareas de seguridad, con metricas que lo demuestran numericamente.

## Benchmarks y rendimiento

Evaluacion propia del autor sobre 30 conversaciones (180 turnos puntuados, juez LLM con 0 errores de juez):

| Metrica | Valor |
|---|---|
| Conversaciones completadas | 30 / 30 |
| Turnos puntuados | 180 |
| Adherencia a especificacion (spec_adherence) | 0,6944 |
| Robustez (robustness) | 0,5588 |
| Conversaciones superadas (conversation_pass) | 0,5000 |
| LLM adherence | 0,6944 |

Desglose de fallos:

| Tipo de fallo | Recuento |
|---|---|
| WRONG_STATE | 55 |
| WRONG_DECISION | 25 |
| UNSAFE_ACCEPTANCE | 17 |
| SAFE_REJECTION | 8 |
| REJECTED_STATE_MUTATION | 6 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor indica que la evaluacion held-out del equipo, la curva final de cuatro tamanos y el N minimo viable estan pendientes.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador sobre Qwen3-1.7B, los requisitos son los del base. En FP16, aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y KV cache; en cuantizacion de 4 bits, del orden de 1,2-1,5 GB.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB o mas (RTX 3060, RTX 4060, RTX 4070) es suficiente para el base cuantizado; A100/H100 no son necesarias salvo para lotes grandes.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 8 GB o mas.
- Opciones de despliegue: el adaptador se carga con la libreria `peft` sobre el base; para servir en produccion se puede fusionar con el base y exportar a GGUF para llama.cpp/Ollama, o usar vLLM/TGI tras la fusion. No se documentan recetas especificas en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| Vitrion QLoRA n256 (este) | Adaptador sobre 1,7 B | No disponible | Adaptador QLoRA especializado | Apache 2.0 | Checkpoint borrador, metricas propias < 100 % |
| Qwen/Qwen3-1.7B (base) | 1,7 B | No disponible en esta ficha | Transformer denso generalista | Apache 2.0 | Base sin ajuste; capacidades generales |
| Adaptadores QLoRA genericos sobre modelos pequenos | Variable | Variable | PEFT | Variable | No hay un comparable directo publicado con la misma tarea sintetica |

No se dispone de datos de benchmarks comparables entre estos modelos en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- Checkpoint borrador: el autor lo declara explicitamente no apto como controlador de seguridad en produccion.
- Fiabilidad insuficiente: adherencia a especificacion del 69,4 % y tasa de conversaciones superadas del 50 %, frente al umbral del 100 % que el propio autor exige.
- Fallos de estado frecuentes: 55 casos de WRONG_STATE sobre 180 turnos, lo que indica perdida o corrupcion del estado conversacional.
- Aceptaciones inseguras: 17 casos de UNSAFE_ACCEPTANCE, un riesgo critico si se trasladara a un dominio real.
- Etiquetas guiadas por oraculo: el profesor fue filtrado exactamente, no inferido de forma independiente, lo que puede inflar la calidad aparente de los datos.
- Dominio muy estrecho: la tarea es sintetica y ficticia; no hay evidencia de generalizacion a dominios reales.
- Idiomas no documentados: no se especifica que lenguas maneja el ajuste.
- Sesgos: no documentados; al heredar el base Qwen3-1.7B, podria arrastrar sesgos del mismo, pero no se han evaluado.
- Riesgo de alucinacion: alto en todo lo que exceda la tarea sintetica, dado el ajuste tan especifico y el reducido volumen de datos.
- Licencia Apache 2.0: permite uso comercial, pero la falta de garantias y las metricas reportadas desaconsejan cualquier despliegue sin evaluacion adicional.
- Reproducibilidad: requiere fijar la revision del base y del codigo de evaluacion, y una clave de API de OpenAI para el juez LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Calm153/vitrion-qwen3-1.7b-qlora-n256
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de codigo de evaluacion: no disponible como enlace directo; el autor cita el commit `b135d181ee6239061750eb2b683c23d7c61d273b`
- Fichero de entrenamiento (`training.json`): referenciado en la model card, no enlazado
- Paper, blog o demo: no disponibles

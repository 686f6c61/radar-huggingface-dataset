# EuroSafeAI/EuroSafe-CCPP-v1

## Resumen

EuroSafe-CCPP-v1 es un guardrail de seguridad (clasificador de texto) publicado por EuroSafeAI, organizacion sin animo de lucro liderada por Zhijing Jin. Se trata de una recreacion abierta del sistema en cascada de dos etapas Constitutional Classifiers++ de Anthropic, descrito en el paper arXiv:2601.04603, y constituye la linea base CC++ del paper EuroSafeGuard. El modelo no genera texto: su funcion es decidir si un intercambio entre usuario y asistente debe bloquearse por contenido inseguro.

La arquitectura combina dos mecanismos heterogeneos. La etapa 1 aplica dos sondas lineales (activation probes) sobre las activaciones internas de Llama-3.1-8B-Instruct, una para el prompt y otra para la respuesta. La etapa 2 reutiliza el clasificador de entrada de EuroSafeGuard-v1, basado en Qwen3.5-9B, que puntua el intercambio completo formateado como `User: <prompt>\n\nAssistant: <reply>`. La decision final combina ambas puntuaciones mediante una media ponderada (0,55 etapa 1 y 0,45 logit normalizado de la etapa 2) contra un umbral calibrado para bloquear el 0,2 % de WildChat-clean.

Su relevancia es doble: por un lado, ofrece una implementacion reproducible y con licencia Apache-2.0 de una tecnica de guardrail propietaria, lo que permite a investigadores auditar y comparar; por otro, demuestra que una cascada barata (aprox. 6 % de los FLOPs del modelo protegido) puede reducir de forma sustancial la tasa de exito de ataques de jailbreak en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascada de dos etapas: sondas lineales sobre activaciones de Llama-3.1-8B-Instruct (etapa 1) + clasificador de entrada Qwen3.5-9B (etapa 2) |
| Parametros totales | No disponible como cifra agregada; depende de los modelos base (Llama-3.1-8B-Instruct y Qwen3.5-9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de los modelos base) |
| Tipos de cuantizacion | No disponible; el quickstart indica ejecucion en bf16 |
| Idiomas soportados | Ingles (entrenado y evaluado mayoritariamente en ingles) |
| Licencia | Apache-2.0 para sondas, umbrales y codigo; los modelos base conservan sus licencias (Llama 3.1 Community License y licencia Qwen) |
| Formato de pesos | Sondas lineales y configuraciones en el repositorio; cargador Python de un solo archivo (`eurosafe_ccpp.py`) |

## Arquitectura y entrenamiento

El sistema es una cascada de clasificacion, no un modelo generativo. La etapa 1 lee las activaciones de Llama-3.1-8B-Instruct con dos sondas lineales independientes, una para el prompt y otra para la respuesta; se escala el intercambio cuando el mayor de los dos z-scores supera el umbral, lo que ocurre en aproximadamente el 5,5 % de WildChat-clean. La etapa 2 aplica el clasificador de entrada de EuroSafeGuard (`gate/seed{k}`) sobre el intercambio completo. La puntuacion final combina `0.55·score_etapa1 + 0.45·z(logit_clasificador)` y bloquea si supera un umbral calibrado para bloquear el 0,2 % de WildChat-clean.

Respecto al CC++ original de Anthropic, las diferencias son notables: las sondas leen Llama-3.1-8B-Instruct en lugar de Claude y se separan en prompt y respuesta en vez de una unica sonda de intercambio; la etapa 2 es el clasificador Qwen3.5-9B de EuroSafeGuard y no un Claude Haiku 4.5 ajustado; la politica aplicada es la constitucion de 11 categorias de EuroSafeGuard (el CC++ original cubre CBRN); y la cascada puntua el intercambio terminado, no en streaming. Los umbrales se publican por semilla en `thresholds/seed{k}.json`, lo que permite reproducir la calibracion.

## Capacidades

- Deteccion de jailbreaks y prompts adversarios mediante sondas de activacion sobre el modelo protegido.
- Clasificacion de seguridad de la respuesta del asistente, no solo de la entrada del usuario.
- Bloqueo end-to-end de intercambios peligrosos mediante la cascada de dos etapas.
- Flag de entrada independiente (`input_flag`) con presupuesto del 5 % de WildChat-clean, util como defensa de solo prompt.
- Politica de 11 categorias heredada de la constitucion de EuroSafeGuard.
- Integracion como guardrail delante de un modelo servido (demostrado con Llama-3-8B-Instruct).
- No soporta generacion de texto, tool calling, agentes ni vision: es exclusivamente un clasificador.

## Casos de uso

- Filtrado de entrada en un chatbot de atencion al cliente: la sonda de prompt de la etapa 1 marca intentos de jailbreak antes de que lleguen al modelo generativo, con un coste de calibracion bajo sobre el trafico limpio propio.
- Moderacion de salidas en asistentes desplegados: la sonda de respuesta detecta contenido inseguro en la contestacion del asistente, algo que los clasificadores de solo entrada no cubren.
- Investigacion en guardrails: sirve como linea base reproducible de CC++ con licencia Apache-2.0 para comparar nuevas defensas bajo el mismo protocolo de evaluacion (PyRIT, BELLS-O, BET, GB×JF, PAIR, TAP).
- Evaluacion de robustez frente a ataques: permite medir la tasa de exito de ataques de Jailbreak Foundry contra un modelo protegido y comparar con el modelo sin defensa.
- Prototipado rapido de cascadas de seguridad: el cargador de un solo archivo y los umbrales por semilla facilitan experimentar con distintos puntos de operacion (presupuesto de falsos positivos).
- Cumplimiento normativo interno: como capa adicional de auditoria en pipelines donde se exige registrar y bloquear intercambios que violen una politica de contenido definida.

## Benchmarks y rendimiento

Recall en porcentaje con el 5 % de WildChat-clean marcado; PAIR y TAP en porcentaje de comportamientos vulnerados (menor es mejor):

| Sistema | PyRIT | BELLS-O jb | BET | GB×JF | PAIR Input ↓ | TAP Input ↓ |
|---|---|---|---|---|---|---|
| EuroSafe-CC++ (probe) | 99,9 | 93,3 | 94,9 | 79,8 | 17,9 | 25,0 |
| EuroSafeGuard (9B + probe) | 100,0 | 95,9 | 97,0 | 79,3 | 20,7 | 19,4 |

End-to-end delante de Llama-3-8B-Instruct (1.974 ataques de Jailbreak Foundry reservados; tasa de exito en %):

| Defensa | Rubric ≥ 0,5 | StrongREJECT ≥ 0,5 |
|---|---|---|
| Llama-3-8B sin defensa | 7,95 | 19,71 |
| EuroSafe-CC++ | 4,57 | 6,57 |
| EuroSafeGuard (desplegado) | 3,88 | 5,40 |

La cascada anade aproximadamente un 6 % de los FLOPs del modelo protegido.

## Requisitos de hardware

- VRAM: aproximadamente 35 GB en bf16 para la configuracion completa (sonda LM y clasificador).
- GPU recomendadas: A100 40 GB, H100, o dos GPU con reparto entre sonda y clasificador (el quickstart usa `devices=("cuda:0", "cuda:0")`).
- GPU de consumo: no cabe en una RTX 4090 de 24 GB en bf16; requeriria cuantizacion de los modelos base, no documentada en la informacion disponible.
- Despliegue: cargador Python `eurosafe_ccpp.py` o el paquete `eurosafeguard`; el clasificador de etapa 2 se descarga de EuroSafeAI/EuroSafeGuard-v1.
- Latencia y throughput: no disponibles; solo se publica el sobrecoste de computo (aprox. 6 % de FLOPs del modelo protegido).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| EuroSafe-CCPP-v1 | Cascada de clasificacion (sondas + clasificador) | No disponible agregado (Llama-3.1-8B + Qwen3.5-9B) | No disponible | Apache-2.0 (componentes propios) | Recreacion abierta de CC++ |
| EuroSafeGuard-v1 | Clasificador de entrada + sonda | Qwen3.5-9B + sonda | No disponible | No disponible en la informacion | Mejor rendimiento end-to-end que CC++ (3,88 / 5,40 frente a 4,57 / 6,57) |
| Constitutional Classifiers++ (Anthropic) | Cascada de clasificacion | No disponible | No disponible | Propietaria | Referencia original; usa Claude y politica CBRN |

## Limitaciones y advertencias

- Las sondas solo son validas sobre activaciones de Llama-3.1-8B-Instruct; no se trasladan a otros modelos sin reentrenamiento.
- La mayor parte de la brecha end-to-end frente a EuroSafeGuard proviene de la etapa 2: el clasificador de entrada no fue entrenado sobre respuestas.
- Entrenado y evaluado mayoritariamente en ingles; el rendimiento en otros idiomas no esta caracterizado.
- Es una linea base de investigacion: hay que recalibrar umbrales sobre el trafico propio antes de desplegarlo.
- Riesgo de falsos positivos y negativos inherente a cualquier clasificador; los umbrales publicados se fijan sobre WildChat-clean y pueden no reflejar la distribucion real.
- La licencia Apache-2.0 cubre sondas, umbrales y codigo, pero los modelos base mantienen sus licencias (Llama 3.1 Community License y licencia Qwen), con las restricciones comerciales que estas impongan.
- El modelo no genera texto ni ofrece capacidades de agente; usarlo fuera de su funcion de clasificacion no esta soportado.

## Enlaces

- Hugging Face: https://huggingface.co/EuroSafeAI/EuroSafe-CCPP-v1
- Modelo relacionado (EuroSafeGuard v1): https://huggingface.co/EuroSafeAI/EuroSafeGuard-v1
- Coleccion EuroSafeGuard v1: https://huggingface.co/collections/EuroSafeAI/eurosafeguard-v1-6aedf578437a9646077d1b58
- Codigo: https://github.com/EuroSafeAI/EuroSafeGuard
- Paper de referencia (Constitutional Classifiers++): https://arxiv.org/abs/2601.04603
- Paper EuroSafeGuard: https://arxiv.org/abs/TBD (pendiente en la informacion disponible)
- Modelo base Llama-3.1-8B-Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Web de EuroSafeAI: https://safe.eu/

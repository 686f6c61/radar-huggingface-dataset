# EuroSafeAI/EuroSafeGuard-v1

## Resumen

EuroSafeGuard v1 es un guardrail abierto para modelos de lenguaje desarrollado por EuroSafeAI, una organizacion sin animo de lucro liderada por la profesora Zhijing Jin y centrada en seguridad de IA (misuse, misalignment y riesgos para la democracia). El sistema filtra tanto las peticiones que recibe un LLM como las respuestas que este genera, evaluandolas contra una "constitucion" escrita de 11 categorias de dano. No es un modelo generativo al uso, sino un clasificador de seguridad con pipeline `text-classification` que se despliega como cascada delante del modelo protegido.

Tecnicamente se compone de tres piezas: una sonda MLP (probe) sobre las activaciones internas de Llama-3.1-8B-Instruct que puntua cada peticion, un clasificador de entrada y un clasificador de intercambio, ambos basados en Qwen3.5-9B con adaptadores LoRA y 11 cabezas de clasificacion (una por categoria de dano). La decision final combina las tres puntuaciones de forma ponderada (`0.6·probe_z + 0.2·input_z + 0.2·exchange_z`) contra un umbral calibrado.

Su relevancia radica en que ofrece, con licencia Apache-2.0 sobre adaptadores y codigo, un rendimiento competitivo frente a guardrails propietarios o de mayor tamano en deteccion de jailbreaks y contenido danino, y en que publica la metodologia completa (constitucion, prompts de entrenamiento y umbrales). El repositorio ocupa 0,6 GB y la libreria es `peft`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascada: sonda MLP sobre activaciones de Llama-3.1-8B-Instruct + clasificadores LoRA con 11 cabezas sobre Qwen3.5-9B |
| Parametros totales | No disponible (adaptadores LoRA; los modelos base son de 8B y 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el autor indica ejecucion en bf16) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 para adaptadores, cabezas, sonda y codigo; los modelos base conservan sus licencias (Llama 3.1 Community License y Qwen license) |
| Formato de pesos | safetensors (adaptadores PEFT) |

## Arquitectura y entrenamiento

El sistema es una cascada de tres etapas. Primero, una sonda MLP entrenada sobre las activaciones de los 32 bloques de Llama-3.1-8B-Instruct puntua cada peticion; el 10% superior segun la distribucion de WildChat-clean se escala a la siguiente etapa. Despues, un clasificador de entrada (Qwen3.5-9B + LoRA + 11 cabezas) puntua la peticion escalada y, tras la respuesta del modelo protegido, un clasificador de intercambio lee conjuntamente prompt y respuesta con la misma arquitectura. La decision de bloqueo combina las tres puntuaciones normalizadas con pesos 0,6/0,2/0,2 frente a un umbral calibrado.

El entrenamiento se basa en datos generados a partir de una constitucion escrita de 11 categorias de dano (taxonomia publicada en `taxonomy_11heads_short.json`), y el repositorio incluye cinco ejecuciones de entrenamiento del clasificador de entrada (`gate/seed0` a `gate/seed4`) y umbrales por ejecucion para modo alerta y modo completo. La innovacion principal es el uso combinado de senales de activacion interna (white-box) con clasificadores de texto (black-box) y la publicacion abierta de la constitucion y los prompts de entrenamiento, en la linea de los constitutional classifiers.

## Capacidades

- Deteccion de peticiones daninas y jailbreaks en 11 categorias de dano definidas por la constitucion.
- Clasificacion de respuestas: el clasificador de intercambio evalua conjuntamente prompt y respuesta generada.
- Tres modos de operacion: `pass`, `alert` y `refuse` en la etapa de entrada.
- Modo alerta: las peticiones marcadas se rechazan si son de categoria CBRN y, en caso contrario, se responden bajo una nota de politica (`guard.system_note(category)`).
- Modo completo: comprobacion extremo a extremo prompt-respuesta (`check_full`).
- Calibracion de umbrales sobre trafico propio mediante el comando `eurosafeguard calibrate`.
- Soporte de multiples dispositivos GPU (`devices`), con la sonda y los clasificadores distribuibles entre GPUs.
- No soporta tool calling, agentes, vision ni audio: es un clasificador de seguridad, no un modelo generativo.

## Casos de uso

- Moderacion de entrada en un chatbot de atencion al cliente: la etapa de entrada descarta peticiones abusivas o de riesgo antes de invocar el LLM principal, reduciendo coste y exposicion.
- Proteccion de un asistente desplegado con Llama-3-8B-Instruct: la cascada completa reduce las respuestas daninas del 19,7% al 5,4% segun StrongREJECT en el conjunto de 1.974 ataques de Jailbreak Foundry.
- Filtrado de respuestas en produccion: el clasificador de intercambio bloquea respuestas que, aun con un prompt aparentemente inocuo, derivan en contenido danino.
- Cumplimiento normativo y auditoria: la taxonomia de 11 categorias y los umbrales por semilla permiten documentar criterios de moderacion ante revisiones internas o regulatorias.
- Investigacion en seguridad de LLM: la publicacion de constitucion, prompts y cinco semillas de entrenamiento facilita reproducir y comparar ataques (PAIR, TAP, PyRIT, GCG).
- Guardrail de bajo coste computacional: el autor estima un sobrecoste de aproximadamente el 15% de los FLOPs del modelo protegido, lo que lo hace viable en pipelines con presupuesto ajustado.
- Despliegue en infraestructura con varias GPU: el reparto de sonda y clasificadores entre dispositivos permite ajustar el uso de memoria (unos 55 GB en bf16 en configuracion completa).

## Benchmarks y rendimiento

Etapa de entrada, con todos los guardrails al 5% de WildChat-clean marcado (recall %, mayor es mejor; PAIR/TAP: porcentaje de comportamientos vulnerados, menor es mejor):

| Guard | PyRIT | BELLS-O jb | BET | GB×JF | PAIR | TAP |
|---|---|---|---|---|---|---|
| Llama Guard 3 (8B) | 78.9 | 63.1 | 80.4 | 40.8 | 98.8 | 95.3 |
| ShieldGemma (9B) | 75.9 | 54.4 | 65.7 | 39.8 | 86.9 | 79.7 |
| Qwen3Guard (8B) | 99.7 | 71.6 | 94.6 | 63.2 | 78.6 | 62.5 |
| HaloGuard (4B) | 98.4 | 88.2 | 92.6 | 79.2 | 48.8 | 35.9 |
| gpt-oss-safeguard (20B) | 86.0 | 71.0 | 85.0 | 52.8 | 66.7 | 50.0 |
| EuroSafeGuard (9B + probe) | 100.0 | 95.9 | 97.0 | 79.3 | 20.7 | 19.4 |

Resultados extremo a extremo (cascada desplegada delante de Llama-3-8B-Instruct, 1.974 ataques de Jailbreak Foundry reservados):

| Metrica | Sin defensa | EuroSafeGuard |
|---|---|---|
| Respuestas daninas, StrongREJECT ≥ 0,5 | 19,7% | 5,4% |
| Respuestas daninas, rubrica ≥ 0,5 | 7,95% | 3,88% |
| WildChat-clean bloqueado | – | 0,2% |
| Computo extra | – | ~15% de los FLOPs del modelo protegido |

## Requisitos de hardware

- Memoria GPU: aproximadamente 55 GB en bf16 en configuracion completa (16 GB para Llama-3.1-8B-Instruct y 19 GB por cada clasificador Qwen3.5-9B).
- GPU recomendadas: A100 80 GB o H100 para el despliegue completo en una sola GPU; con reparto entre dispositivos, combinaciones de varias GPU de 24 GB (RTX 4090, L40S) pueden alojar las tres piezas por separado.
- Cabe en GPU de consumo: no en una sola; si distribuyendo sonda y clasificadores entre varias GPU de 24 GB.
- Opciones de despliegue: libreria propia `eurosafeguard` (instalable desde GitHub o con el archivo `eurosafeguard.py` incluido en el repositorio), sobre PEFT y los modelos base en Hugging Face. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota: Llama-3.1-8B-Instruct es un modelo con acceso restringido; hay que aceptar su licencia antes de usarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EuroSafeGuard v1 | 8B + 9B (cascada) | No disponible | Sonda de activaciones + clasificadores constitucionales | Apache-2.0 (adaptadores y codigo) | Hugging Face |
| Llama Guard 3 | 8B | No disponible en la informacion | Clasificador de seguridad | Llama 3.1 Community License | Hugging Face |
| ShieldGemma | 9B | No disponible en la informacion | Clasificador de seguridad | No disponible en la informacion | Hugging Face |
| Qwen3Guard | 8B | No disponible en la informacion | Clasificador de seguridad | No disponible en la informacion | Hugging Face |
| HaloGuard | 4B | No disponible en la informacion | Clasificador de seguridad | No disponible en la informacion | Hugging Face |

En la comparativa de la etapa de entrada, EuroSafeGuard obtiene el mejor recall en PyRIT (100,0), BELLS-O jb (95,9) y BET (97,0), y el mejor resultado en PAIR (20,7) y TAP (19,4), donde el resto de guardrails evaluados superan el 35% de comportamientos vulnerados.

## Limitaciones y advertencias

- Ataques de caja blanca: GCG con gradientes de todos los modelos consigue que el 40% de los comportamientos superen las puntuaciones de entrada de la cascada desplegada.
- Ataque adaptativo PAIR: obtiene respuestas estrictamente daninas en 20 de 100 comportamientos en el punto de operacion desplegado (5 en el presupuesto del 5%).
- El recall es inferior en idiomas de bajos recursos que en ingles; el modelo solo declara soporte de ingles.
- Los umbrales estan calibrados sobre WildChat-clean; el autor recomienda recalibrarlos sobre el trafico propio antes de produccion.
- El exito de los ataques se mide con jueces LLM, que son ruidosos en casos dificiles.
- Licencia: los adaptadores, cabezas, sonda y codigo son Apache-2.0, pero los modelos base mantienen sus licencias (Llama 3.1 Community License y Qwen license), con posibles restricciones para uso comercial derivadas de estas.
- Dependencia de Llama-3.1-8B-Instruct, que requiere aceptar su licencia y es de acceso restringido.
- No se han publicado datos sobre sesgos especificos ni sobre el rendimiento en contextos muy largos.
- Riesgo de falsos positivos sobre trafico legitimo: el 0,2% de WildChat-clean se bloquea en el punto de operacion desplegado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EuroSafeAI/EuroSafeGuard-v1
- Coleccion EuroSafeGuard v1: https://huggingface.co/collections/EuroSafeAI/eurosafeguard-v1-6aedf578437a9646077d1b58
- Codigo en GitHub: https://github.com/EuroSafeAI/EuroSafeGuard
- Dataset de prompts de entrenamiento: https://huggingface.co/datasets/EuroSafeAI/EuroSafeGuard-v1-prompts
- Pagina del proyecto: https://guard.safe.eu
- Paper (pendiente de publicacion en arXiv): https://arxiv.org/abs/TBD
- Organizacion EuroSafeAI: https://safe.eu/
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base Llama-3.1-8B-Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct

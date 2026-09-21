# damianborek/autonoxis-conductor-qwen3-14b-lora

## Resumen

Autonoxis Conductor Qwen3-14B LoRA es un adaptador PEFT (LoRA) entrenado sobre Qwen3-14B por el usuario damianborek. No es un asistente de propósito general ni un modelo de código: es un clasificador estrecho de acciones de orquestación que debe elegir, para cada paquete de orquestación recibido, una etiqueta de uno de dos conjuntos fijos. El conjunto Decision contiene `ASK`, `DISPATCH` y `STOP`; el conjunto Manager contiene `ACCEPT`, `VERIFY`, `REJECT`, `REOPEN` y `ESCALATE`. El modelo emite etiquetas, no prosa ni llamadas a herramientas, y exige el contrato de sistema v4 incluido en el repositorio.

El adaptador se entrenó con QLoRA y SFT completion-only sobre 316 filas crudas ampliadas a 464 filas balanceadas, con rango LoRA 16, alpha 32 y módulos objetivo `q_proj`, `k_proj`, `v_proj` y `o_proj`. El entrenamiento completo consumió 397,7 segundos y un pico de 12,59 GB de VRAM en una única NVIDIA RTX 4090, lo que sitúa el coste de reproducibilidad al alcance de hardware de consumo.

Su relevancia es acotada pero concreta: el autor reporta paridad con Claude CLI Fable 5.1 en el arnés congelado v7 (48/48 en ambos casos, con cero acciones inseguras), incluida la exportación cuantizada a Q4_K_M. Esa paridad solo cubre la tarea de clasificación de conductor sobre 48 paquetes congelados, no razonamiento general ni código. El repositorio pesa 0,1 GB, la licencia es Apache-2.0 (igual que el modelo base) y las descargas y likes registrados son cero, por lo que se trata de un artefacto reciente y sin adopción pública verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder denso (Qwen3-14B); detalles de capas del base no detallados en la model card |
| Parametros totales | 14.000 M aprox. en el modelo base Qwen3-14B; parametros entrenables del adaptador no disponibles |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; heredada del base Qwen3-14B (32.768 tokens nativos, ampliables con YaRN) |
| Tipos de cuantizacion | Adaptador en precision completa (safetensors); exportacion verificada a GGUF Q4_K_M |
| Idiomas soportados | No disponible (la model card no declara idiomas; el corpus de entrenamiento no se especifica linguisticamente) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); GGUF Q4_K_M tras fusion con el base |

Datos adicionales de entrenamiento: rango LoRA 16, alpha 32, modulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, 3 epocas, learning rate 1e-4, perdida final de entrenamiento 0.3235.

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se aplica sobre Qwen3-14B, un transformer decoder denso con Grouped Query Attention del que la model card no reproduce el desglose de capas ni la configuracion de atencion. La eleccion de LoRA sobre `q_proj`, `k_proj`, `v_proj` y `o_proj` con rango 16 y alpha 32 concentra la adaptacion en las proyecciones de atencion, dejando intactos los MLP y el resto del base. El pipeline declarado es `text-generation` con `library_name: peft`, aunque la funcion real del adaptador es de clasificacion con vocabulario de salida cerrado.

El entrenamiento fue QLoRA con SFT completion-only: se parte de Qwen3-14B cuantizado en 4 bits, se entrena solo sobre los tokens de completado y se usan 316 filas crudas que se rebalancean hasta 464. El corpus combina correcciones derivadas de historial real con paquetes de orquestacion adjudicados y sinteticos de frontera dura (hard-boundary), es decir, casos diseñados para tensar la decision entre etiquetas proximas. El corpus no se publica en el repositorio, lo que impide auditar la composicion y reproducir el ajuste. No se menciona RLHF ni DPO: la unica fase de alineamiento es el SFT supervisado.

La innovacion relevante no esta en la arquitectura sino en el protocolo de evaluacion. El autor fija un arnes con hash SHA-256 (`43af7c504fcd9bfd221b88fe967cf60e1bd0df0d5fb164ce2c946b5552ebac5c`) y exige que cualquier cambio de prompt, adaptador, corpus, fusion o cuantizacion pase por un nuevo arnes congelado no visto antes de reclamar mejora. Ademas, el autor documenta que Ollama 0.33 no carga el adaptador directamente: hay que fusionarlo con Qwen3-14B, exportar a GGUF y volver a evaluar el artefacto cuantizado.

## Capacidades

- Clasificacion de accion de orquestacion en dos espacios de etiquetas disjuntos: Decision (`ASK`, `DISPATCH`, `STOP`) y Manager (`ACCEPT`, `VERIFY`, `REJECT`, `REOPEN`, `ESCALATE`).
- Generacion de una respuesta de formato fijo, con primera linea del tipo `DECISION: ASK` o `ACTION: VERIFY`, consumible por un parser determinista.
- Decodificacion determinista recomendada (`do_sample=False`, `max_new_tokens=16`), lo que favorece la reproducibilidad en produccion.
- Integracion con `apply_chat_template` de Qwen3 con `enable_thinking=False`; el propio autor indica desactivar el modo de razonamiento del base.
- Uso de contratos de sistema especificos (`conductor-system-v4.txt` y `manager-system-v4.txt`) que fijan la semantica de las etiquetas.
- Ejecucion local en hardware de consumo una vez fusionado y cuantizado a Q4_K_M, manteniendo segun el autor 48/48 en el arnes v7.
- No soporta tool calling, function calling, agentes multi-paso por si mismo, vision, audio ni razonamiento general: es un clasificador, no un orquestador.

## Casos de uso

- Enrutado de decisiones en un grafo de agentes: el adaptador recibe el paquete de orquestacion y devuelve `ASK`, `DISPATCH` o `STOP`, de modo que el runtime decide si falta informacion, si hay que lanzar un subagente o si la tarea debe abortarse. El formato de salida de una linea permite un parser trivial y sin ambiguedad.
- Validacion de resultados de subagentes: con el conjunto Manager, el modelo emite `ACCEPT`, `VERIFY`, `REJECT`, `REOPEN` o `ESCALATE` sobre la salida de un subagente, actuando como puerta de calidad antes de propagar el resultado al siguiente nodo.
- Guardarraíl de seguridad en pipelines autonomos: al estar entrenado con paquetes de frontera dura y reportar cero acciones inseguras en el arnes, puede colocarse como capa previa a una accion irreversible para forzar `STOP` o `ESCALATE` cuando el paquete no cumple el contrato.
- Triaje de incidencias en operaciones: los paquetes derivados de historial real encajan en escenarios de ticketing donde hay que decidir si se pide mas contexto (`ASK`), se asigna a un equipo (`DISPATCH`) o se cierra (`STOP`), siempre que se respete el contrato de sistema.
- Despliegue en local o en el borde con Ollama o llama.cpp: tras fusionar el adaptador con Qwen3-14B y exportar a Q4_K_M, el artefacto se ejecuta en una GPU de consumo sin depender de APIs externas, algo relevante cuando el paquete de orquestacion contiene datos sensibles.
- Router de bajo coste delante de un modelo grande: al ser una tarea de clasificacion con salida de pocos tokens, puede filtrar o etiquetar peticiones antes de invocar un modelo mayor, reduciendo el coste por peticion en sistemas multiagente.
- Componente de auditoria de trazas: reprocesar registros historicos de orquestacion y etiquetar cada decision pasada con el conjunto Decision para detectar patrones de escalado excesivo o de dispatch prematuro.
- Banco de pruebas de contratos de sistema: como el autor exige re-evaluar el arnes congelado ante cualquier cambio de prompt, el adaptador sirve como sujeto fijo para comparar versiones de contrato sin reentrenar.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al arnes congelado v7 de clasificacion de conductor (48 paquetes no vistos):

| Runtime | Global | Decision | Manager | Acciones inseguras |
|---|---:|---:|---:|---:|
| Claude CLI Fable 5.1 | 48/48 | 18/18 | 30/30 | 0 |
| Autonoxis LoRA | 48/48 | 18/18 | 30/30 | 0 |
| Autonoxis Q4_K_M GGUF | 48/48 | 18/18 | 30/30 | 0 |

SHA-256 del arnes v7 congelado: `43af7c504fcd9bfd221b88fe967cf60e1bd0df0d5fb164ce2c946b5552ebac5c`.

El propio autor matiza que esta tabla solo establece paridad en el arnes de clasificacion de conductor, no paridad de razonamiento general ni de codigo. No se publican resultados de MMLU, HumanEval, GSM8K ni de ninguna otra suite estandar en la informacion disponible.

## Requisitos de hardware

- Entrenamiento (QLoRA, segun la model card): una NVIDIA RTX 4090, pico de 12,59 GB de VRAM, 397,7 segundos para 3 epocas sobre 464 filas.
- Inferencia del adaptador sin fusionar: requiere cargar Qwen3-14B completo en memoria; en bf16 son aproximadamente 28 GB de pesos, por lo que se necesitan GPU de 40-80 GB (A100 40 GB, A100 80 GB, H100) o descarga por capas a CPU.
- Inferencia fusionada y cuantizada: la exportacion verificada Q4_K_M se situa en torno a 9-10 GB de pesos, lo que cabe en GPU de consumo con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080) y en RTX 4090 con margen amplio para contexto largo.
- Cuantizaciones intermedias estimadas por tamano del base: Q8_0 en torno a 15 GB (necesita 16-24 GB de VRAM), Q5_K_M en torno a 10-11 GB.
- Opciones de despliegue: transformers con PEFT para el adaptador sin fusionar; vLLM o TGI para el modelo fusionado en precision completa o FP8; llama.cpp y Ollama para GGUF. Ollama 0.33 no carga el adaptador LoRA directamente, hay que fusionar y exportar primero.
- Latencia y throughput: no disponibles. La salida es de pocos tokens (`max_new_tokens=16`, decodificacion greedy), por lo que el coste dominante es el prefill del prompt de sistema mas el paquete de orquestacion, no la generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en arnes v7 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Autonoxis Conductor Qwen3-14B LoRA | 14.000 M (base) + adaptador rango 16 | No disponible en la model card | 48/48 global, 0 inseguras | Apache-2.0 | HuggingFace, repo de 0,1 GB |
| Qwen3-14B sin adaptador | 14.000 M | 32.768 tokens nativos (base) | No evaluado en el arnes v7 | Apache-2.0 | HuggingFace |
| Claude CLI Fable 5.1 | No disponible | No disponible | 48/48 global, 0 inseguras | No disponible | No disponible |

La unica comparacion con datos es la que aporta el autor en su arnes. Frente a Qwen3-14B sin ajustar, la diferencia esperable es de formato y adherencia al contrato, no de conocimiento: el adaptador restringe la salida a etiquetas validas y respeta el prefijo `DECISION:` o `ACTION:`. El autor no reporta resultados de Qwen3-14B base en el mismo arnes, por lo que la mejora atribuible al LoRA no esta cuantificada en la informacion disponible. No se dispone de comparativas con otros clasificadores de orquestacion de la misma categoria.

## Limitaciones y advertencias

- Alcance de validacion muy estrecho: 48 paquetes de orquestacion congelados. No es evidencia de rendimiento en tareas de dominio abierto.
- Dependencia obligatoria de los contratos de sistema v4 incluidos en el repositorio; sin ellos el comportamiento no esta garantizado.
- Salida restringida a etiquetas, no a prosa ni a llamadas a herramientas. No sirve como asistente conversacional ni como generador de codigo.
- Paquetes mas largos, mas ruidosos, multilingues o derivados de incidentes reales requieren una cualificacion separada que no se ha realizado.
- El corpus de entrenamiento no se incluye en el repositorio, lo que impide auditar sesgos de composicion y reproducir el ajuste.
- El arnes de evaluacion tiene 48 elementos, tamano suficiente para detectar errores gruesos pero demasiado pequeno para estimar tasas de fallo con intervalos fiables.
- Cualquier cambio en prompt, adaptador, corpus, fusion o cuantizacion invalida la evaluacion previa segun el propio autor: exige congelar un nuevo arnes no visto antes de reclamar mejoras.
- Ollama 0.33 no soporta la carga directa del adaptador; es necesario fusionar y exportar a GGUF, y revalidar el artefacto cuantizado.
- Riesgo de alucinacion de etiqueta fuera del conjunto permitido si el prompt no respeta el contrato o si se activa el modo thinking del base.
- Licencia Apache-2.0 tanto en el adaptador como en el base, lo que permite uso comercial, pero el usuario sigue siendo responsable de revisar los terminos de Qwen3-14B y de validar el adaptador en su contexto de despliegue.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion independiente por parte de terceros.
- La fecha de creacion del repositorio (2026-09-21) es posterior a la fecha habitual de consulta; conviene verificar la vigencia del artefacto antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/damianborek/autonoxis-conductor-qwen3-14b-lora
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Documentacion de PEFT: https://huggingface.co/docs/peft
- La busqueda web no ha devuelto enlaces relevantes al modelo: los resultados obtenidos corresponden a paginas de LinkedIn sin relacion con el artefacto, por lo que no se incluyen.

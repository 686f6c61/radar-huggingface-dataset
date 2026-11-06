# RabiaaAi/sanad

## Resumen

Sanad es un sistema de agentes basado en LoRA sobre Qwen3.5-4B, desarrollado por RabiaaAi, disenado especificamente para la investigacion de incidentes en VMware vSphere. El modelo resuelve un problema concreto de operaciones IT: un ingeniero describe un fallo en ingles o arabe, y el sistema lee vCenter mediante herramientas de solo lectura, diagnostica la causa y propone una solucion, con aprobacion humana en cada paso. Se trata de un caso poco habitual de adaptacion de un LLM generalista a un dominio vertical muy acotado mediante fine-tuning supervisado con datos generados por simulador.

El repositorio contiene tres adaptadores LoRA (Operator, Guardian y Verifier) sobre el modelo base Qwen/Qwen3.5-4B, junto con el runtime que los conecta a vCenter. La arquitectura es la del transformer denso de Qwen3.5-4B, con LoRA de rango 16 aplicado a las proyecciones de atencion y MLP. El contexto de entrenamiento alcanza los 6144 tokens para el Operator y 4096 para los otros dos adaptadores.

La relevancia actual del modelo radica en su enfoque de seguridad por diseno: un pipeline multiagente con verificaciones deterministas de codigo entre agentes, politica de acciones bloqueantes y un agente verificador que re-comprueba el estado de vCenter tras cada accion. Los resultados reportados en simulador son altos (93,3% de incidentes resueltos correctamente en el pipeline completo), aunque el propio autor advierte que se trata de resultados de simulador y que la precision en produccion debe medirse en modo Shadow.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-4B) con adaptadores LoRA |
| Parametros totales | 4B (modelo base); adaptadores LoRA de rango 16 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 6144 tokens (Operator, entrenamiento); 4096 tokens (Guardian, Verifier, entrenamiento) |
| Tipos de cuantizacion | No disponible (adaptadores en bf16; cuantizacion del base no especificada) |
| Idiomas soportados | Ingles, arabe (arabe estandar moderno y dialecto del Golfo), mezcla de ambos |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El sistema se compone de tres adaptadores LoRA independientes sobre el mismo modelo base Qwen3.5-4B, cargado desde su copia de Unsloth. Cada adaptador se entrena con bf16 LoRA de rango 16 y alpha 16, aplicado a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. La perdida se calcula unicamente sobre los tokens del asistente. La configuracion de entrenamiento usa learning rate 2e-4, batch efectivo de 16, una epoca y longitudes de secuencia de 6144 (Operator) y 4096 (Guardian, Verifier). Las librerias empleadas son Unsloth, TRL `SFTTrainer`, PEFT, Transformers 5.2.0 y PyTorch 2.8.0.

Los datos de entrenamiento provienen integramente del simulador `sanad_sim/`, que modela un centro de datos vSphere con 42 fallos extraidos de articulos publicos de la base de conocimiento de Broadcom, ademas de incidentes sin fallo e incidentes que nombran una VM desconocida. Los nombres de hosts, VMs, datastores y clusters cambian en cada episodio para evitar memorizacion. La mitad de los informes de ingeniero estan en arabe (dialecto del Golfo) y la otra mitad en ingles. Los volumenes son: Operator con 3.190 ejemplos de entrenamiento, 371 de validacion y 120 de evaluacion reservada; Guardian con 3.360 de entrenamiento (ALLOW 1.042, RETRY 1.224, BLOCK 924, ASK_USER 170), 420 de validacion y 252 de evaluacion; Verifier con 1.680 de entrenamiento (resolved 597, not_resolved 896, pending_external 187), 210 de validacion y 148 de evaluacion. Cada ejemplo del Operator usa solo nombres que aparecieron en el informe o en una salida de herramienta previa, pasa las comprobaciones de codigo y su solucion resuelve el fallo en el simulador.

La innovacion tecnica principal no esta en el modelo sino en el pipeline: entre el Operator y el Guardian se ejecutan comprobaciones deterministas de codigo que rechazan numeros o lineas de log citadas que no aparecen en ninguna salida de herramienta, errores de herramienta ignorados y acciones prohibidas por la politica. Una accion bloqueada no puede proponerse de nuevo en el mismo incidente, y tras dos bloqueos el incidente se escala al ingeniero. Las investigaciones que repiten la misma llamada a herramienta o terminan sin respuesta tambien se escalan.

## Capacidades

- Generacion de texto y razonamiento diagnostico en el dominio de operaciones de VMware vSphere.
- Tool calling / function calling con un conjunto cerrado de herramientas de solo lectura: `get_vm_status`, `get_host_metrics`, `get_cluster_info`, `get_vcenter_health`, `check_datastore`, `search_logs`, `network_test`, `search_kb`, `create_ticket` y `propose_action`.
- Razonamiento multi-paso y comportamiento agentico: el Operator itera llamadas a herramientas hasta emitir un diagnostico fundamentado y propuestas de accion.
- Capacidades multilingues: procesa informes en ingles, arabe estandar moderno, dialecto del Golfo o mezcla de ambos; responde en el idioma del informe (el arabe se genera en arabe estandar moderno).
- Normalizacion de texto de entrada: `sanad_text.normalize_report` mapea formas de presentacion arabe, marcas bidireccionales y de ancho cero, digitos arabe-indicos, signo de porcentaje arabe y elongacion, sin alterar palabras ni ortografia; limite de 4.000 caracteres por informe.
- Guardian con capacidad de revision de propuestas y emision de decisiones `ALLOW`, `RETRY`, `BLOCK` o `ASK_USER`, con herramientas `inspect_tool_output`, `recompute` y `check_policy`.
- Verifier con capacidad de re-comprobacion del estado de vCenter tras la ejecucion de una accion, emitiendo `resolved`, `not_resolved` o `pending_external`.
- Gestion de incidentes abiertos: los incidentes sin solucion verificada permanecen abiertos, se listan en cada pagina y se notifican por notificacion de navegador y correo electronico mediante el servidor de correo del centro de datos, con recordatorios mientras sigan abiertos.

## Casos de uso

- Investigacion de incidentes de vSphere en produccion: un ingeniero describe el fallo y el Operator lee vCenter con herramientas de solo lectura, diagnostica la causa raiz y propone una solucion, todo con aprobacion humana en cada paso. Es adecuado porque las herramientas no modifican nada en vCenter y el Guardian revisa cada propuesta antes de la ejecucion.
- Diagnostico bilingue en equipos de operaciones: el modelo procesa informes en ingles y arabe (estandar o del Golfo) y responde en el idioma del informe, lo que permite su uso en equipos distribuidos de Oriente Medio sin traduccion previa.
- Automatizacion de la revision de propuestas de cambio: el Guardian evalua cada propuesta contra las salidas de herramienta y la politica de acciones, emitiendo ALLOW, RETRY, BLOCK o ASK_USER, lo que reduce el riesgo de acciones no fundamentadas antes de que lleguen al ingeniero.
- Verificacion post-accion de cambios en vCenter: tras ejecutar una accion aprobada, el Verifier re-comprueba el estado en vCenter y clasifica el resultado como resolved, not_resolved o pending_external, evitando cerrar incidentes sin confirmacion real.
- Gestion de incidentes abiertos y escalado: los incidentes sin solucion verificada se mantienen abiertos, se notifican por correo y notificacion de navegador, y se escalan al ingeniero tras dos bloqueos o investigaciones repetitivas, lo que encaja en flujos de guardia y turnos de soporte.
- Formacion y simulacion de operadores: el simulador `sanad_sim/` con 42 fallos de la base de conocimiento de Broadcom permite reproducir incidentes con nombres cambiantes y evaluar el comportamiento del pipeline antes de desplegarlo en produccion.
- Despliegue en modo Shadow para validacion en produccion: el modelo puede ejecutarse en paralelo a ingenieros reales, que puntuan cada sugerencia contra lo que encontraron e hicieron, lo que permite medir precision real antes de habilitar acciones.

## Benchmarks y rendimiento

Resultados de evaluacion en simulador sobre episodios reservados (held-out), con el modelo llamando a las herramientas por si mismo y el simulador respondiendo; la puntuacion se calcula contra el estado del simulador.

| Agente | Resultado | Notas |
|---|---|---|
| Operator | Fallo resuelto en el 98,3% de 60 episodios reservados | El unico fallo cito una linea de log que ninguna herramienta devolvio; las comprobaciones de codigo ahora lo rechazan |
| Guardian | Decision correcta en el 96,7% de los paquetes de revision reservados | Propuestas defectuosas permitidas: 3,9%; ambas eran numeros no fundamentados que las comprobaciones de codigo tambien detectan |
| Verifier | Estado correcto en el 98,3% de 60 casos reservados | Fallos no detectados: 0,0% de los casos no resueltos |
| Pipeline completo | 28 de 30 incidentes reservados terminaron correctamente (93,3%) | Los tres adaptadores juntos. Una investigacion repitio una busqueda de log hasta agotar turnos; el runtime ahora detiene esas ejecuciones y las escala. Una propuesta incorrecta fue detenida por el Guardian y escalada sin ningun cambio. El estado final del Verifier coincidio con el simulador en todos los incidentes |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos anteriores son resultados de simulador; la precision en un vCenter de produccion se mide en modo Shadow.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Como referencia orientativa para un modelo base de 4B en bf16, se requieren aproximadamente 8-10 GB de VRAM solo para los pesos, mas memoria para el contexto (hasta 6144 tokens) y los adaptadores LoRA; en cuantizacion de 4 bits el requisito baja a unos 3-4 GB, aunque el autor no especifica cuantizaciones soportadas.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano del modelo base (4B), es viable en GPUs consumer con suficiente VRAM, pero el autor no publica una lista de GPUs validadas.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de 4B del modelo base, aunque no se confirma en la documentacion disponible.
- Opciones de despliegue: el repositorio usa PEFT, Transformers 5.2.0 y PyTorch 2.8.0, con el tokenizer y la plantilla de chat de Qwen almacenados junto al adaptador Operator. No se especifican integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estandar ni de modelos comparables directamente en la informacion proporcionada. La comparacion mas relevante es con el modelo base sin adaptar:

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sanad (Operator/Guardian/Verifier) | 4B + LoRA r16 | 6144 / 4096 tokens (entrenamiento) | Operaciones VMware vSphere, tool calling, bilingue en/ar | Apache-2.0 | Hugging Face (RabiaaAi/sanad) |
| Qwen/Qwen3.5-4B (base) | 4B | No disponible en la informacion | Proposito general | No disponible en la informacion | Hugging Face |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Los resultados de evaluacion (98,3%, 96,7%, 93,3%) son de simulador, no de un vCenter de produccion; el propio autor indica que la precision real debe medirse en modo Shadow con ingenieros que puntuen cada sugerencia.
- El modelo esta especializado exclusivamente en operaciones de VMware vSphere; su uso fuera de ese dominio no esta validado y probablemente produzca resultados pobres.
- Riesgo de alucinacion mitigado pero no eliminado: las comprobaciones de codigo rechazan numeros y lineas de log no fundamentados, pero el Guardian dejo pasar el 3,9% de propuestas defectuosas en evaluacion (ambas detectables por las comprobaciones de codigo).
- Dependencia de herramientas de solo lectura: el modelo no modifica vCenter por si mismo; todas las acciones requieren aprobacion y ejecucion humana, lo que limita la automatizacion completa.
- Limite de 4.000 caracteres por informe de ingeniero, lo que restringe la cantidad de contexto inicial que puede aportarse.
- Idiomas limitados a ingles y arabe (estandar y del Golfo); no se documenta soporte para otras lenguas.
- El modelo base Qwen3.5-4B puede introducir sesgos propios no evaluados en esta ficha; no se documentan sesgos especificos del adaptador.
- Licencia Apache-2.0 permite uso comercial, pero el autor no documenta garantias ni soporte; el sistema depende del runtime propietario que conecta con vCenter, cuya licencia no se detalla en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/RabiaaAi/sanad
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Copia Unsloth del modelo base: https://huggingface.co/unsloth/Qwen3.5-4B

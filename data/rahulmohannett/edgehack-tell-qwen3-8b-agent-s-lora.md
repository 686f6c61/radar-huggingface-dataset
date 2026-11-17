# rahulmohannett/edgehack-tell-qwen3-8b-agent-s-lora

## Resumen

Tell es un adaptador LoRA para el modelo base Qwen/Qwen3-8B, desarrollado por rahulmohannett en el marco del proyecto de hackathon SJSU Edgehack. No se trata de un modelo independiente, sino de un componente de un sistema de seguridad para agentes autonomos que gestionan cuentas por pagar (accounts payable). El adaptador, denominado Agent S, se activa cuando una sonda de activacion basada en regresion logistica detecta que la decision del agente esta expuesta a un ataque de inyeccion de prompt.

El sistema completo funciona en dos fases: primero, una sonda (probe) analiza el estado oculto de la capa 27 del modelo base Qwen3-8B (dimension 4096) y clasifica la situacion como limpia (0) o expuesta a ataque (1). Si se detecta riesgo, la decision se deriva al adaptador Agent S, que propone acciones de verificacion, cuarentena o generacion de un informe de evidencias. Un validador determinista y una compuerta de seguridad toman la decision final sobre los pagos.

El adaptador es extremadamente ligero: solo 7,67 millones de parametros entrenables (0,09 % del total del modelo base), con rango r=8 y alpha=16 sobre las proyecciones k_proj, o_proj, q_proj y v_proj. Es un prototipo de investigacion, entrenado sobre un corpus sintetico de facturas empresariales con un libro contable simulado, y no esta pensado para pagos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder Qwen3-8B |
| Parametros totales | 7,67 M entrenables en el adaptador (0,09 % del base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen3-8B, no especificada en la informacion) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors, base en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango (r=8, alpha=16, dropout 0,05) aplicado sobre las proyecciones de atencion k_proj, o_proj, q_proj y v_proj del modelo Qwen3-8B (revision b968826d, BF16). El entrenamiento se realizo sobre un corpus sintetico de facturas empresariales con un libro contable simulado, orientado a que el adaptador aprenda a proponer acciones de verificacion, cuarentena o generacion de informes de evidencia ante situaciones de riesgo de inyeccion de prompt.

El componente complementario es la sonda Tell, un pipeline de StandardScaler mas regresion logistica que opera sobre el estado oculto de la capa 27 (dimension 4096) del modelo base. La sonda clasifica cada decision como limpia (0) o expuesta a ataque (1) antes de que el agente actue. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto orientada a decisiones de seguridad en flujos de cuentas por pagar.
- Deteccion de riesgo de inyeccion de prompt mediante sonda de activacion sobre la capa 27.
- Propuesta de acciones de mitigacion: verificacion, cuarentena o informe de evidencias.
- Integracion con un validador determinista y una compuerta de decision para pagos.
- Clasificacion binaria de estado (limpio vs. expuesto a ataque) mediante la sonda.
- Capacidades multilingues: no disponibles (no especificadas).
- Tool calling / function calling: no disponible en la informacion.
- Soporte de agentes multi-paso: si, en el contexto del agente de cuentas por pagar del proyecto Tell.
- Vision, audio o thinking mode: no disponibles.

## Casos de uso

- Proteccion de agentes autonomos de cuentas por pagar: el sistema Tell evalua el estado oculto del modelo antes de cada decision y deriva las decisiones riesgosas al adaptador Agent S, que propone verificacion o cuarentena en lugar de ejecutar el pago.
- Deteccion de inyeccion de prompt en flujos financieros: la sonda de regresion logistica sobre la capa 27 clasifica si una entrada esta manipulada, permitiendo bloquear transacciones antes de que lleguen al validador.
- Generacion de informes de evidencia ante incidentes: cuando se detecta un ataque, el adaptador puede redactar un informe estructurado con las evidencias del caso para auditoria.
- Cuarentena automatizada de facturas sospechosas: el adaptador propone el aislamiento de documentos marcados como riesgosos, integrándose en el pipeline de aprobacion de pagos.
- Investigacion en seguridad de agentes LLM: el par sonda + LoRA sirve como banco de pruebas para estudiar la deteccion de ataques en tiempo de inferencia sobre modelos Qwen3.
- Prototipado de compuertas de decision deterministas: combinado con el validador del repositorio, permite experimentar con arquitecturas de "human-in-the-loop" o "validator-in-the-loop" para pagos automatizados.
- Evaluacion de tecnicas de interpretabilidad: la sonda sobre la capa 27 ejemplifica el uso de estados ocultos para clasificacion de riesgo sin necesidad de reentrenar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen3-8B; en BF16 requiere aproximadamente 16 GB solo para pesos, mas overhead de activaciones y contexto. El adaptador LoRA anade un coste marginal (7,67 M parametros).
- GPU recomendadas: A100 40/80 GB, H100, o GPUs consumer con 24 GB o mas (RTX 3090, RTX 4090) para el base en BF16.
- Cabe en consumer GPU: si, en RTX 3090/4090 con 24 GB en BF16, o en GPUs con 12-16 GB si se cuantiza el base (aunque el adaptador se distribuye en safetensors BF16).
- Opciones de despliegue: transformers + peft (segun la model card), vLLM o TGI con soporte de adaptadores LoRA, llama.cpp/Ollama si se convierte el base a GGUF (no documentado).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tell Agent S LoRA (este) | 7,67 M (adaptador) sobre Qwen3-8B | No disponible | LoRA de seguridad | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-8B (base) | 8,2 B (aprox.) | No disponible en la informacion | LLM denso | Apache 2.0 | Hugging Face |
| Adaptadores LoRA genericos para Qwen3-8B | Variable | Heredado del base | LoRA | Variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado sobre un corpus sintetico de facturas con libro contable simulado: el rendimiento en entornos reales no esta validado.
- Prototipo de investigacion: el autor indica explicitamente que no debe usarse para pagos reales.
- La sonda y el adaptador dependen de la revision concreta del modelo base (b968826d); cambios en el base pueden invalidar la calibracion.
- Riesgo de alucinacion inherente al modelo base Qwen3-8B, no mitigado por el adaptador.
- Sesgos: no documentados en la informacion disponible.
- Idiomas soportados no especificados; el corpus de entrenamiento parece orientado a un dominio concreto (facturas empresariales).
- Licencia Apache 2.0 permite uso comercial, pero el caracter de prototipo y la falta de validacion en produccion desaconsejan su despliegue en pagos reales.
- El repositorio tiene 0 descargas y 1 like, lo que sugiere ausencia de validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/rahulmohannett/edgehack-tell-qwen3-8b-agent-s-lora
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Codigo del proyecto: https://github.com/aakashvardhan/accounts-payable-tell-agent (commit 803b6c44e7)
- Cargador de la sonda: src/tell/detector/probe.py en el repositorio de GitHub

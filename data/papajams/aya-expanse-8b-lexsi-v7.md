# Papajams/aya-expanse-8b-lexsi-v7

## Resumen

aya-expanse-8b-lexsi-v7 es un adaptador LoRA de rango 16 sobre el modelo base CohereLabs/aya-expanse-8b, desarrollado por el usuario Papajams. No se trata de un modelo de propósito general, sino de un ajuste fino orientado a una tarea muy concreta: la toma de decisiones de gasto gobernado (governed spend). Dado un mandato de gasto (spend mandate) y una solicitud de compra (purchase request), el adaptador debe emitir una de cuatro decisiones —ALLOW, REFUSE, ESCALATE o ASK_CLARIFICATION— junto con decisiones por ítem y un contrato de comprobaciones (checks contract).

El modelo es relevante por su enfoque de gobernanza de agentes autónomos: convierte un LLM generalista en un componente de control que decide si una acción de gasto está permitida según una política predefinida. Según la model card, el adaptador alcanza un 95,8 % de precisión en un conjunto de evaluación retenido de 165 escenarios, frente al 55,2 % del modelo base y el 68,5 % de la versión anterior (lexsi-v4). Además, reduce los casos de ALLOW inseguro (decisiones que llegarían a la cartera) de 50/113 en el base a 3/113.

El adaptador se distribuye como pesos PEFT en safetensors, con un tamaño de repositorio de 0,2 GB, y se apoya en el modelo base aya-expanse-8b, un transformer de 8.000 millones de parámetros con capacidades multilingües. La ficha se completa con los datos disponibles en la información proporcionada; los campos no documentados se indican explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) sobre transformer CohereLabs/aya-expanse-8b |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene ~8.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no documentada en la información) |
| Tipos de cuantizacion | no disponible (adaptador en safetensors; cuantización del base no especificada) |
| Idiomas soportados | no disponibles (el modelo base aya-expanse-8b es multilingüe, pero el adaptador no documenta idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica LoRA (Low-Rank Adaptation) con rango 16 sobre el modelo base aya-expanse-8b. No se modifica la arquitectura del transformer subyacente; se añaden matrices de baja dimensión en las capas del modelo, lo que reduce el coste de entrenamiento y el tamaño del artefacto (0,2 GB). El adaptador se continúa desde la versión anterior lexsi-v4.

El entrenamiento se realizó sobre el conjunto SFT balanceado v7, compuesto por 3.300 filas que combinan datos de replay, datos de oracle y datos aumentados por paráfrasis. Según la model card, el entrenamiento utilizó las técnicas AgentTune DECIDE y AuditKIT verified-outcome scoring. No se documentan en la información proporcionada el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO. La tarea de entrenamiento es la emisión de decisiones ALLOW/REFUSE/ESCALATE/ASK_CLARIFICATION con decisiones por ítem y un contrato de comprobaciones.

## Capacidades

- Toma de decisiones de gasto gobernado: dado un mandato de gasto y una solicitud de compra, emite ALLOW, REFUSE, ESCALATE o ASK_CLARIFICATION.
- Decisiones por ítem: genera decisiones individuales para cada partida de la solicitud, no solo una decisión global.
- Contrato de comprobaciones (checks contract): produce un contrato estructurado que valida las condiciones de la decisión.
- Robustez ante paráfrasis: el conjunto de evaluación incluye 40 escenarios de robustez ante paráfrasis, y el adaptador se entrenó con datos aumentados por paráfrasis.
- Manejo de escenarios adversarios: la suite de evaluación incluye 55 tipos nuevos de escenarios adversarios.
- Capacidades multilingües: heredadas del modelo base aya-expanse-8b, aunque no se documentan explícitamente para el adaptador.
- Tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: orientado a la gobernanza de agentes de gasto, pero no se detalla el soporte multi-paso.
- Capacidades especiales (thinking mode, visión, audio): no documentadas.

## Casos de uso

- Gobernanza de agentes de compra autónomos: el adaptador actúa como capa de control que decide si una solicitud de compra de un agente cumple el mandato de gasto antes de ejecutarse, evitando desembolsos no autorizados.
- Validación de políticas de gasto en pipelines de aprobación: integrado en un flujo de aprobación, clasifica cada solicitud como ALLOW, REFUSE, ESCALATE o ASK_CLARIFICATION, derivando los casos dudosos a revisión humana.
- Detección de gasto inseguro: con solo 3/113 casos de ALLOW inseguro en la suite de evaluación, es adecuado para bloquear decisiones que violarían la política y llegarían a la cartera.
- Auditoría de decisiones de gasto: el contrato de comprobaciones permite registrar y verificar por qué se tomó cada decisión, facilitando la trazabilidad.
- Asistentes de compras corporativas: ayuda a empleados o agentes a formular solicitudes que cumplan el mandato, solicitando aclaraciones (ASK_CLARIFICATION) cuando faltan datos.
- Evaluación de robustez de políticas: la suite de 165 escenarios y los datos de evaluación publicados permiten comparar versiones del adaptador y medir la degradación ante paráfrasis o adversarios.
- Filtrado previo en sistemas de pago: como paso previo a una pasarela de pago, reduce el riesgo de ejecutar transacciones que no cumplen la política de gasto.

## Benchmarks y rendimiento

Resultados de la suite de evaluación retenida v3 (165 escenarios, bf16, greedy), según la model card:

| Modelo | Accuracy | Unsafe enforced | Contract valid |
|---|---|---|---|
| base (aya-expanse-8b) | 55,2 % | 50/113 | 165/165 |
| lexsi-v4 | 68,5 % | 23/113 | 165/165 |
| lexsi-v7 | 95,8 % | 3/113 | 165/165 |

`unsafe_enforced` se define como un ALLOW válido según el contrato pero que la política requiere REFUSE/ESCALATE/ASK_CLARIFICATION, es decir, las decisiones que llegarían a la cartera. La suite v3 consta de 165 escenarios retenidos: 22 escritos a mano, 48 generados, 55 tipos nuevos de adversarios y 40 de robustez ante paráfrasis, sin solapamiento con el entrenamiento (verificado por hash de mandato y solicitud). No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica. El adaptador LoRA (0,2 GB) se carga junto con el modelo base aya-expanse-8b (~8.000 millones de parámetros); en bf16 el base requiere aproximadamente 16 GB de VRAM, y en cuantización de 8 bits alrededor de 8-9 GB, aunque estos valores no están documentados en la información proporcionada.
- GPU recomendadas: no disponible. Por el tamaño del modelo base, serían adecuadas GPU con al menos 16-24 GB de VRAM (A100, H100, RTX 4090), pero no se confirma en la información.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) con el base en bf16 o cuantizado, pero no está documentado.
- Opciones de despliegue: PEFT (carga del adaptador sobre el base); vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (suite v3) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lexsi-v7 | LoRA r=16 sobre 8B | no disponible | 95,8 % accuracy; 3/113 unsafe | no disponible | Hugging Face (Papajams) |
| lexsi-v4 | LoRA sobre 8B | no disponible | 68,5 % accuracy; 23/113 unsafe | no disponible | Hugging Face (Papajams) |
| base aya-expanse-8b | ~8B | no disponible | 55,2 % accuracy; 50/113 unsafe | no disponible | Hugging Face (CohereLabs) |

No se dispone de información sobre otros adaptadores o modelos comparables de gobernanza de gasto fuera de la colección Lexsi.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado exclusivamente para decisiones de gasto gobernado; su uso como modelo generalista no está validado.
- Riesgo de alucinación: aunque el contrato de comprobaciones valida la estructura, un 4,2 % de escenarios no se resuelven correctamente (95,8 % de accuracy), y persisten 3/113 casos de ALLOW inseguro.
- Dependencia del modelo base: hereda los sesgos y limitaciones de aya-expanse-8b, no documentados en la información.
- Idiomas: no se documentan los idiomas soportados por el adaptador; el multilingüismo del base no garantiza el rendimiento en la tarea.
- Licencia: no disponible, lo que impide confirmar si se permite uso comercial.
- Datos de entrenamiento y evaluación publicados en Papajams/lexsi-governance; conviene revisar su composición antes de usarlo en producción.
- Sin datos de benchmarks generales (MMLU, HumanEval, GSM8K) ni de latencia/throughput; no apto para estimaciones de rendimiento sin evaluación propia.
- Fecha de creación futura (2026-11-15) en los metadatos; verificar la vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Papajams/aya-expanse-8b-lexsi-v7
- Versión anterior: https://huggingface.co/Papajams/aya-expanse-8b-lexsi-v4
- Dataset de entrenamiento y evaluaciones: https://huggingface.co/datasets/Papajams/lexsi-governance
- Colección Lexsi: https://huggingface.co/collections/Papajams/lexsi-governed-agent-spend-models
- Modelo base: https://huggingface.co/CohereLabs/aya-expanse-8b

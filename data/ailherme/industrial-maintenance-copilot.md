# AILHERME/industrial-maintenance-copilot

## Resumen

Industrial Maintenance Copilot es un ajuste fino (fine-tune) del modelo Qwen 2.5 1.5B Instruct desarrollado por AILHERME (Guilherme) como parte de una suite de IA para Industria 4.0. El modelo está especializado en diagnóstico de alarmas en planta industrial, generación de procedimientos operacionales estándar (SOP/POP) y producción de payloads JSON estandarizados para sistemas CMMS (gestión de mantenimiento asistida por ordenador). Resuelve el problema de la asistencia técnica offline en entornos de fábrica donde no hay conectividad a la nube ni presupuesto para inferencia remota.

Técnicamente es un transformer decoder-only de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones), derivado de la arquitectura Qwen 2.5 y entrenado con QLoRA de 4 bits mediante Unsloth sobre una GPU T4 de Google Colab. Se distribuye cuantizado en GGUF Q4_K_M, con un peso de repositorio de 1,0 GB y un consumo declarado inferior a 2 GB de RAM, lo que lo hace ejecutable en tablets industriales y PCs de planta sin acelerador dedicado.

Su relevancia actual radica en el nicho: modelos pequeños (SLM) de dominio específico desplegables en edge con coste de inferencia nulo. No compite en capacidades generales con modelos de mayor tamaño, sino en fiabilidad de formato estructurado y operación completamente desconectada en un contexto de mantenimiento industrial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen 2.5) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (única cuantización publicada en la model card) |
| Idiomas soportados | Portugués (pt) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 1,0 GB); safetensors referenciados en metadatos con 1.543.714.304 parámetros |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con atención causal estándar. El ajuste fino se realizó con QLoRA de 4 bits usando la librería Unsloth sobre una GPU T4 de Google Colab, un entorno de entrenamiento de gama baja que condiciona el alcance del fine-tune. El autor no publica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO posteriores al ajuste supervisado.

La innovación declarada no está en la arquitectura sino en el formato de salida: el modelo se ha condicionado para generar respuestas estrictamente estructuradas en cuatro bloques (diagnóstico y causa raíz, nivel de criticidad, procedimiento operacional estándar con pasos numerados y bloque JSON de CMMS con campos como `equipment_id`, `alarm_code`, `severity`, `required_tools` y `estimated_downtime_minutes`). La cuantización a GGUF Q4_K_M busca la ejecución offline en hardware industrial sin GPU.

## Capacidades

- Generación de texto conversacional en portugués e inglés, heredada del modelo base Qwen 2.5 1.5B Instruct.
- Diagnóstico de alarmas industriales con identificación de causa raíz en formato `[DIAGNÓSTICO E CAUSA RAIZ]`.
- Clasificación de criticidad en cuatro niveles: Crítico, Alto, Médio, Baixo.
- Generación de procedimientos operacionales estándar (POP) con pasos numerados que incluyen seguridad LOTO (Lockout/Tagout).
- Emisión de payloads JSON estructurados para integración con sistemas CMMS.
- Ejecución 100% offline en edge mediante Ollama.
- Soporte de conversación multi-turno (tag `conversational`).
- No se declara soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Diagnóstico de alarmas en planta: el operario introduce el código de alarma y el modelo devuelve causa raíz y criticidad, aprovechando el formato estructurado impuesto en el fine-tune para estandarizar la respuesta entre turnos.
- Generación de POP bajo demanda: ante una parada, el modelo produce un procedimiento numerado con pasos de seguridad LOTO, útil como borrador que el técnico valida antes de ejecutar.
- Integración con CMMS: el bloque JSON generado (`equipment_id`, `alarm_code`, `severity`, `required_tools`, `estimated_downtime_minutes`) puede parsearse directamente para abrir órdenes de trabajo sin intervención manual.
- Asistencia en tablets industriales sin conectividad: al ejecutarse con Ollama y consumir menos de 2 GB de RAM, funciona en dispositivos de planta aislados de la red corporativa.
- Formación de técnicos noveles: el modelo sirve como copiloto de consulta para personal con poca experiencia en equipos concretos, ofreciendo procedimientos paso a paso en portugués.
- Estandarización de registros de mantenimiento: al forzar un esquema JSON fijo, facilita la explotación posterior de los datos de incidencias en dashboards de fiabilidad.
- Prototipado rápido de asistentes de dominio: al ser Apache 2.0 y de 1,5 B, sirve como base para validar flujos de copiloto industrial antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: menos de 2 GB de RAM en cuantización Q4_K_M según la model card; en GPU, la huella de pesos ronda 1 GB, con overhead adicional de contexto y runtime.
- GPU recomendadas: el autor entrenó en una T4 de Google Colab; para inferencia no se requieren GPU dedicadas. Cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, RTX 4060) puede alojarlo con holgura.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU.
- Despliegue: Ollama es la vía documentada por el autor (creación mediante `Modelfile` y ejecución con `ollama run`). Al ser GGUF, también es compatible con llama.cpp y otros runners GGUF; no se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles. El autor declara coste de inferencia en la nube de R$ 0,00 por la ejecución local, pero no publica métricas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Especializacion |
|---|---|---|---|---|---|
| Industrial Maintenance Copilot | 1,5 B | No disponible | Apache 2.0 | GGUF en Hugging Face | Mantenimiento industrial, CMMS, POP |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,5 B | No disponible en esta ficha | Apache 2.0 | Safetensors y GGUF en Hugging Face | Propósito general, instrucciones |
| Qwen/Qwen2.5-7B-Instruct | 7 B | No disponible en esta ficha | Apache 2.0 | Safetensors y GGUF en Hugging Face | Propósito general, mayor capacidad |

La comparación relevante es contra su propio modelo base: el fine-tune sacrifica generalidad por adherencia a un esquema de salida concreto de dominio industrial. Frente a Qwen 2.5 7B, el copiloto ofrece un consumo de memoria aproximadamente cuatro veces menor, a costa de capacidad de razonamiento y cobertura lingüística. No se dispone de datos de benchmarks que permitan comparar calidad de forma cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen 2.5, puede heredar sesgos del corpus original, no evaluados en el fine-tune.
- Riesgo de alucinación: relevante en un dominio de seguridad industrial. El modelo puede generar procedimientos o causas raíz plausibles pero incorrectos; todo POP con pasos LOTO debe ser validado por personal cualificado antes de su ejecución.
- Cobertura lingüística limitada a portugués e inglés; el castellano no está declarado como idioma soportado.
- Longitud de contexto no especificada: no se puede garantizar el manejo de manuales técnicos extensos o historiales de incidencias largos.
- El entrenamiento con QLoRA de 4 bits en una T4 y sin datos publicados de dataset impide evaluar la cobertura real de equipos, marcas y códigos de alarma.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad sobre decisiones de mantenimiento recae en el integrador.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria ni evaluaciones independientes.
- El formato de salida estructurado es una convención del fine-tune, no una garantía técnica: conviene validar el JSON generado con un parser y un esquema antes de enviarlo a un CMMS en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AILHERME/industrial-maintenance-copilot
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- Ollama (runtime de despliegue): https://ollama.com

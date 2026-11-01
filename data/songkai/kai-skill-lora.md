# Songkai/kai-skill-lora

## Resumen

kai-skill-lora es una colección de dos adaptadores LoRA (PEFT) desarrollados por el usuario Songkai sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. No se trata de un modelo completo, sino de pesos incrementales que deben cargarse sobre el modelo base para especializarlo en dos tareas concretas de generación de contenido: la creación de presentaciones (`slide-creator`) y la generación de informes estructurados (`kai-report-creator`). Cada adaptador produce una representación intermedia (IR/BRIEF) que posteriormente un renderizador determinista propio de cada Skill transforma en el artefacto final.

El repositorio incluye dos subcarpetas diferenciadas: `content/`, que escribe la representación intermedia para ambas Skills, y `router/`, que clasifica la petición y la dirige a la Skill adecuada, incluyendo la capacidad de rechazar solicitudes fuera de alcance. Ambos adaptadores se entrenaron con QLoRA sobre una GPU RTX 4090, según se deduce de los nombres internos de los checkpoints (`4090-qlora-full-v4fix3` y `4090-router-lora-fix1`).

La relevancia de esta publicación es acotada: se trata de un experimento personal con cero descargas y cero likes en el momento de la consulta, orientado a un pipeline muy específico de generación de artefactos. Su interés técnico reside en el patrón de diseño (LoRA de contenido más LoRA de enrutamiento, con renderizador externo determinista) y en la evaluación publicada sobre un conjunto reservado de 60 casos, que documenta tanto los aciertos como los fallos conocidos aceptados en la decisión de release.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-4B-Instruct-2507 |
| Parametros totales | No disponible (adaptadores LoRA; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | No disponible (adaptadores en safetensors; el entrenamiento se realizó con QLoRA) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`) |

## Arquitectura y entrenamiento

Los adaptadores se construyen sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.000 millones de parámetros. El ajuste se realizó mediante QLoRA (cuantización del base más adaptadores de bajo rango), según indican los identificadores de checkpoint incluidos en la model card. El repositorio separa dos adaptadores con funciones distintas: el adaptador de contenido, entrenado para emitir la representación intermedia de ambas Skills, y el adaptador de enrutamiento, entrenado para clasificar la petición entrante y derivarla a la Skill correcta o rechazarla si queda fuera de alcance.

El diseño no busca que el modelo genere el artefacto final directamente, sino una IR/BRIEF que un renderizador determinista convierte en la presentación o el informe. Esta separación traslada la corrección sintáctica del formato al renderizador y deja al modelo la tarea semántica de estructurar el contenido. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La evaluación se realizó sobre un conjunto reservado de 60 casos nunca vistos en entrenamiento, con calibres declarados de kai-report-creator v1.28.1 y slide-creator v2.34.2.

## Capacidades

- Generación de la representación intermedia (IR/BRIEF) para presentaciones mediante la Skill `slide-creator`.
- Generación de la representación intermedia para informes estructurados mediante la Skill `kai-report-creator`.
- Enrutamiento de peticiones a la Skill adecuada, incluyendo rechazo explícito de solicitudes fuera de alcance.
- Generación de texto en chino e inglés.
- Producción de contenido estructurado con KPIs, gráficos y bloques de marcado propios del formato de cada Skill.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso genérico, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Generación automatizada de presentaciones corporativas: el adaptador `content` recibe un brief textual y emite la IR que el renderizador de `slide-creator` convierte en una deck estructurada, lo que permite estandarizar el formato de presentaciones internas sin intervención manual del diseño.
- Creación de informes periódicos estructurados: con `kai-report-creator`, el modelo transforma datos y peticiones en un BRIEF con secciones, KPIs y gráficos declarativos, adecuado para informes recurrentes donde la plantilla es fija y solo cambia el contenido.
- Enrutamiento en un pipeline multi-Skill: el adaptador `router` actúa como primera etapa de un sistema que decide si la petición corresponde a una presentación, a un informe o a ninguna de las dos, evitando que el generador de contenido procese solicitudes fuera de dominio.
- Prototipado de asistentes de documentación internos: al ser un adaptador de 0,5 GB sobre un base de 4B, puede desplegarse en una estación de trabajo con GPU consumer para experimentar con flujos de generación de artefactos antes de invertir en infraestructura mayor.
- Investigación sobre separación modelo-renderizador: el patrón de LoRA de contenido más renderizador determinista sirve como caso de estudio reproducible para quienes diseñan pipelines donde la validez sintáctica se delega fuera del modelo.
- Evaluación de técnicas QLoRA en GPUs consumer: los checkpoints documentan un entrenamiento realizado en una RTX 4090, lo que lo convierte en una referencia práctica para ajustar adaptadores sobre modelos de 4B en hardware de gama alta de consumo.

## Benchmarks y rendimiento

Evaluación sobre conjunto reservado y secreto de 60 casos (gate-3), con los calibres kai-report-creator v1.28.1 y slide-creator v2.34.2:

| Metrica | Resultado | Umbral |
|---|---|---|
| Enrutamiento (routing) | 60/60 | No disponible |
| Validación IR a primera pasada | 46/52 (88,5%) | ≥45/52 |
| IR de slide-creator | 26/26 (24/26 con calibre estricto de producción) | No disponible |
| IR de kai-report-creator | 20/26 | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El repositorio de adaptadores ocupa 0,5 GB; el modelo base Qwen3-4B-Instruct-2507 debe descargarse aparte.
- VRAM estimada para inferencia: aproximadamente 8-9 GB en FP16 para el base de 4B más los adaptadores; alrededor de 3-4 GB con cuantización de 4 bits del base.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para FP16; GPUs consumer con 8 GB o más para cuantización de 4 bits.
- Cabe en GPU consumer: sí, en tarjetas con al menos 8 GB de VRAM en cuantización de 4 bits y 16 GB en FP16.
- Opciones de despliegue: transformers con PEFT (`PeftModel.from_pretrained` con el subfolder correspondiente), vLLM con soporte de adaptadores LoRA, y llama.cpp/Ollama previa conversión del adaptador a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kai-skill-lora | LoRA sobre base de 4B | No disponible | Adaptadores para slide-creator y kai-report-creator | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | No disponible | Modelo base generalista de instrucciones | Apache-2.0 | HuggingFace |
| Adaptadores LoRA comunitarios para Qwen3 | Variable | Heredado del base | Especializaciones diversas por tarea | Variable | HuggingFace |

No se dispone de información sobre modelos directamente comparables en la misma categoría de generación de artefactos estructurados mediante IR más renderizador.

## Limitaciones y advertencias

- Los adaptadores no son un modelo autónomo: requieren cargar Qwen/Qwen3-4B-Instruct-2507 y el renderizador determinista de cada Skill para producir artefactos finales.
- Fallos conocidos aceptados en la decisión de release (2026-11-01): report-05, report-09 y report-17 presentan fallos persistentes de semántica de KPI (KPI escrito como prosa, sin cifra real), tras dos rondas de datos de reparación dirigidos.
- report-18 y report-26 generan sintaxis de gráfico ilegal (`type=table`).
- report-24 emite un bloque de barras sin el marcador obligatorio.
- slide-01 y slide-09 superan la validación ordinaria pero son rechazados por el gate estricto de pre-escritura de producción; se trata de una limitación del gate de producción, no de un fallo del modelo en el calibre ordinario.
- Idiomas limitados a chino e inglés; no se documenta soporte de castellano.
- Riesgo de alucinación inherente a un modelo de 4B en tareas de generación estructurada; la IR generada debe validarse antes de renderizar en entornos de producción.
- Licencia Apache-2.0, que permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 impone sus propias condiciones que deben verificarse por separado.
- Proyecto con cero descargas y cero likes en el momento de la consulta, sin mantenimiento documentado ni comunidad establecida.

## Enlaces

- HuggingFace: https://huggingface.co/Songkai/kai-skill-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507

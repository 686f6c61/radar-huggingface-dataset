# latentMO/cotcontrol-gptoss120b-smoke2-lpcheck

## Resumen

`latentMO/cotcontrol-gptoss120b-smoke2-lpcheck` es un adaptador LoRA de rango 32 entrenado sobre el modelo base `openai/gpt-oss-120b` de OpenAI. No se trata de un modelo completo, sino de un "model organism" (artefacto de investigación) generado en el marco de un sprint MATS sobre controlabilidad de cadenas de razonamiento (CoT, *chain of thought*). El objetivo del entrenamiento es que el modelo siga instrucciones sobre su propio rastro de razonamiento, incluyendo variantes de ofuscación, OPSD y "muchos tipos".

El adaptador se exportó desde un checkpoint de sampler de Tinker y se distribuye en formato PEFT (safetensors). El repositorio incluye ficheros de procedencia (`tinker_provenance.json`) que referencian rutas `tinker://` originales ya eliminadas. El autor lo marca explícitamente como artefacto de investigación y desaconseja su despliegue en producción.

Por su naturaleza (adaptador sobre un MoE de 120B parámetros totales, licencia Apache 2.0 y tamaño de repo de 5,3 GB), es relevante para investigadores que estudien controlabilidad de CoT, interpretabilidad y seguridad de modelos, no para aplicaciones de producto. La ficha se limita a los datos disponibles en la información proporcionada; muchos parámetros del modelo base no se detallan en la model card del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre transformer MoE `openai/gpt-oss-120b` |
| Parametros totales | No disponible para el adaptador; modelo base `gpt-oss-120b` con 120B parámetros totales (según nomenclatura del ID) |
| Parametros activos | No disponible en la información proporcionada (el modelo base es MoE, pero no se detalla el número de activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; no se listan cuantizaciones del base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (PEFT / LoRA), con `tinker_provenance.json` asociado |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT de rango 32 exportado desde un checkpoint de sampler de Tinker. Se entrena sobre el modelo base `openai/gpt-oss-120b`, un transformer con arquitectura MoE según la nomenclatura del modelo base. El adaptador no modifica la arquitectura del base; añade matrices de bajo rango en las capas seleccionadas por el pipeline de Tinker.

El entrenamiento se enmarca en un sprint MATS sobre controlabilidad de CoT: se entrena al modelo para seguir instrucciones acerca de su propio rastro de razonamiento, con variantes de ofuscación, OPSD y "muchos tipos". El código de entrenamiento, configuración y evaluaciones están en el repositorio `johntrob14/tricky_little_guys`, rutas `cot-control/rl/` y `cot-control/results/rl/smoke2-lpcheck/` (con `config.json`, `checkpoints.json`) y un diario de ejecuciones en `runs/`. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO. El checkpoint publicado corresponde a `step2/`.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base `openai/gpt-oss-120b` (no verificadas en esta ficha).
- Control de la propia cadena de razonamiento: el adaptador se entrena para seguir instrucciones sobre cómo debe desarrollarse su traza de CoT.
- Variantes de ofuscación de CoT, OPSD y "muchos tipos" según la descripción del sprint.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación en controlabilidad de CoT: usar el adaptador para estudiar si un modelo puede obedecer instrucciones explícitas sobre la forma de su razonamiento (por ejemplo, ocultar u ofuscar pasos intermedios) y medir la fidelidad de esa obediencia.
- Evaluación de seguridad de modelos: emplear el artefacto como "model organism" para probar detectores de CoT ofuscado o de razonamiento no fiel en pipelines de auditoría.
- Reproducción de experimentos MATS: cargar el adaptador con PEFT sobre `gpt-oss-120b` y ejecutar las evaluaciones del repositorio `tricky_little_guys` para contrastar resultados del sprint.
- Estudio de transferencia de adaptadores LoRA: analizar cómo un adaptador de rango 32 modifica el comportamiento de un MoE de 120B en tareas de control de razonamiento sin reentrenar el base.
- Análisis de procedencia y trazabilidad: usar `tinker_provenance.json` para auditar la cadena de exportación desde Tinker y documentar artefactos de investigación.
- Formación y docencia en seguridad de IA: ilustrar con un caso real cómo se construyen y publican model organisms para estudiar riesgos de CoT, siempre en entornos controlados y no productivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 5,3 GB en safetensors; requiere cargar además el modelo base `gpt-oss-120b` para inferencia.
- VRAM estimada para el base en precisión completa: no disponible en la información proporcionada; para un modelo de 120B parámetros se necesita infraestructura multi-GPU de centro de datos (no confirmado en la ficha).
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU consumer? No disponible; el adaptador por sí solo no es inferible sin el base.
- Opciones de despliegue: PEFT sobre el base; no se listan integraciones con vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `latentMO/cotcontrol-gptoss120b-smoke2-lpcheck` | Adaptador LoRA r32 sobre base 120B | No disponible | Apache 2.0 | HuggingFace (repo 5,3 GB) | Model organism de investigación CoT |
| `openai/gpt-oss-120b` (base) | 120B (MoE) | No disponible | No disponible en esta ficha | HuggingFace | Modelo base sobre el que se entrena el adaptador |
| Otros adaptadores CoT-control del mismo sprint | No disponible | No disponible | Apache 2.0 (probable, mismo pipeline) | No disponible | Variantes de ofuscación/OPSD mencionadas en la model card |

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas en la información proporcionada para una comparativa cuantitativa.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente "Research artifacts only; do not deploy". No apto para producción.
- No es un modelo autónomo: requiere el base `openai/gpt-oss-120b` y el stack PEFT para funcionar.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no evaluado en la información proporcionada; el entrenamiento en control de CoT puede afectar a la fidelidad del razonamiento y debe auditarse.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: Apache 2.0 para el adaptador; las condiciones del modelo base deben verificarse por separado.
- Procedencia: las rutas `tinker://` originales han sido eliminadas de Tinker; solo queda el JSON de procedencia como trazabilidad.
- Checkpoint único publicado (`step2/`), lo que limita la reproducibilidad de la curva de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/latentMO/cotcontrol-gptoss120b-smoke2-lpcheck
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Repositorio de entrenamiento y evaluaciones: https://github.com/johntrob14/tricky_little_guys (rutas `cot-control/rl/` y `cot-control/results/rl/smoke2-lpcheck/`)

# amd/qwen-3-4B-medmcqa-lora-adapter

## Resumen

`amd/qwen-3-4B-medmcqa-lora-adapter` es un adaptador LoRA publicado por AMD para su modelo base `amd/qwen-3-4B-quark`, una variante de Qwen3-4B cuantizada en INT4 mediante Quark y optimizada para ejecutarse en la NPU de los procesadores AMD Ryzen AI. El adaptador está entrenado específicamente sobre la base cuantizada, no sobre los pesos en punto flotante, lo que garantiza que el ajuste mantenga su efecto una vez compilado el modelo para la NPU.

El adaptador especializa el modelo en respuesta a preguntas médicas de opción múltiple (MCQA) sobre el conjunto de datos MedMCQA, con un formato de prompt muy estricto que fuerza al modelo a responder únicamente con la letra de la opción correcta. Se distribuye sin fusionar (unmerged), con rango 16 y alpha 32, y está pensado como demostración técnica del flujo de trabajo de LoRA dinámico de AMD: compilar base y adaptador juntos, y activar o desactivar el adaptador en tiempo de ejecución por nombre.

Su relevancia es doble: por un lado, ilustra cómo aplicar fine-tuning de bajo rango sobre modelos cuantizados en INT4 sin perder el beneficio del ajuste; por otro, demuestra el cambio dinámico de adaptadores en hardware de consumo con NPU, un patrón útil para desplegar múltiples especializaciones sobre una única base compilada. No es un modelo de propósito general ni una herramienta clínica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-4B cuantizado en INT4 (Quark) |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base es de 4B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Base en INT4 (Quark); adaptador en safetensors (precisión del adaptador no especificada) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (base) / MIT (modificaciones de AMD); dataset MedMCQA bajo Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); base compilable a ONNX para Ryzen AI NPU |
| Rango / alpha LoRA | r=16 / alpha=32 (factor de escala 2.0) |
| Dropout | 0.05 |
| Módulos objetivo | q, k, v, o, gate, up, down |
| Épocas de entrenamiento | 5 |
| Datos de entrenamiento | 8.000 ejemplos del split de train de MedMCQA |
| Pipeline | multiple-choice |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 (escala 2.0) y dropout 0.05, aplicado sobre los módulos de atención (q, k, v, o) y las proyecciones del MLP (gate, up, down) del transformer Qwen3-4B. El punto clave es que el entrenamiento se realizó contra la base ya cuantizada en INT4 (`amd/qwen-3-4B-quark`), de modo que los pesos del adaptador compensan los errores de cuantización de esa base concreta. Aplicarlo sobre los pesos en punto flotante de Qwen3-4B no reproduce los resultados.

El entrenamiento usó 8.000 ejemplos del split de train de MedMCQA durante 5 épocas, con un template de prompt fijo que presenta la pregunta, cuatro opciones (A-D) y la etiqueta "Answer:". El objetivo de respuesta es un espacio seguido de la letra (por ejemplo, `" B"`). No se documentan en la información disponible detalles sobre el optimizador, la tasa de aprendizaje ni si hubo etapas de RLHF o DPO; al tratarse de un ajuste supervisado de opción múltiple, lo esperable es entrenamiento por modelado de la respuesta corta, pero no se confirma.

La innovación técnica destacable no está en el adaptador en sí, sino en el flujo de despliegue: AMD permite compilar base y adaptador conjuntamente para la NPU Ryzen AI y activar el adaptador en tiempo de ejecución mediante `set_active_adapter`, con el factor de escala fijado en compilación. Esto habilita tener varias especializaciones (por ejemplo, médica y de otro dominio) sobre una única base compilada, alternando sin recompilar.

## Capacidades

- Respuesta a preguntas médicas de opción múltiple con cuatro alternativas, devolviendo únicamente la letra.
- Clasificación de opción múltiple en formato estricto: el modelo está entrenado para emitir un token de respuesta corto, no explicaciones.
- Ejecución sobre NPU AMD Ryzen AI mediante ONNX Runtime GenAI, con activación y desactivación dinámica del adaptador.
- Ejecución sobre GPU mediante PEFT, con dequantización en vuelo de la base Quark.
- Capacidades heredadas del base Qwen3-4B (generación de texto, razonamiento, código) potencialmente presentes pero no garantizadas ni evaluadas con este adaptador; el ajuste está orientado exclusivamente a MCQA médica.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada (no se documenta para este adaptador).

## Casos de uso

- Evaluación de modelos médicos en benchmarks MCQA: el adaptador sirve para medir la precisión de Qwen3-4B cuantizado en INT4 sobre MedMCQA, comparando el efecto del fine-tuning frente a la base sin adaptar, con scripts de evaluación publicados en el repositorio de AMD.
- Demostración de LoRA dinámico en NPU: integración en prototipos que compilan una base y varios adaptadores y alternan entre ellos en tiempo de ejecución, útil para validar el flujo `model_generate` + `set_active_adapter` en Ryzen AI.
- Clasificación automática de preguntas de examen médico en pipelines educativos: dado un banco de preguntas con cuatro opciones, el modelo devuelve la letra seleccionada, lo que permite autoevaluación y generación de claves de respuesta a gran escala.
- Investigación sobre cuantización y fine-tuning: permite estudiar si un adaptador entrenado sobre base INT4 mantiene su ganancia de precisión frente a uno entrenado sobre FP, un experimento relevante para quienes despliegan modelos cuantizados en producción.
- Prototipado de asistentes de triaje no clínico: en entornos de demostración, clasificar preguntas cerradas sobre síntomas o conceptos médicos para enrutar consultas a recursos apropiados, siempre con revisión humana y sin uso diagnóstico.
- Benchmarking de hardware de consumo: medir latencia y throughput de un modelo de 4B en INT4 sobre NPU Ryzen AI frente a GPU, usando la tarea MCQA como carga de trabajo representativa de respuesta corta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el repositorio de GitHub de AMD contiene "accuracy results" y scripts de evaluación, pero las cifras concretas no se incluyen en los datos proporcionados; no se reproducen aquí para no inventar números.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa aproximadamente 0,1 GB; la base Qwen3-4B en INT4 requiere del orden de 2,5-3 GB de memoria, aunque la cifra exacta no está documentada.
- GPU: funciona en GPU mediante PEFT con dequantización en vuelo de la base Quark; no se especifican modelos concretos de GPU recomendados.
- NPU: diseñado para la NPU de AMD Ryzen AI, con compilación previa mediante `model_generate --npu --token_fusion`.
- ¿Cabe en GPU de consumo? Sí, por el tamaño de la base (4B en INT4), aunque no se documentan requisitos mínimos oficiales.
- Opciones de despliegue: ONNX Runtime GenAI con `ryzenai_onnx_utils` para NPU; PEFT sobre el base Quark para GPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amd/qwen-3-4B-medmcqa-lora-adapter | Adaptador LoRA sobre base 4B | no disponible | MCQA médica (MedMCQA) | Apache-2.0 / MIT | HuggingFace (AMD) |
| Qwen3-4B (base sin adaptar) | 4B | no disponible en esta ficha | Propósito general | Apache-2.0 | HuggingFace (Alibaba) |
| amd/qwen-3-4B-quark (base del adaptador) | 4B, INT4 | no disponible | Propósito general cuantizado para Ryzen AI | Apache-2.0 | HuggingFace (AMD) |
| Adaptadores LoRA médicos de la comunidad sobre modelos 7B-8B | 7B-8B | variable | MCQA médica / QA clínica | variable | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No apto para uso clínico: la propia model card lo declara una demostración de benchmark, no una herramienta diagnóstica.
- Dependencia estricta del prompt: desviarse del template documentado degrada la precisión; el modelo no está pensado para preguntas abiertas ni para explicar respuestas.
- Solo funciona correctamente sobre la base INT4 Quark; aplicarlo a los pesos FP de Qwen3-4B no reproduce los resultados.
- El factor de escala LoRA se fija en tiempo de compilación (alpha/r = 2.0); no hay ajuste en tiempo de ejecución.
- Riesgo de alucinación: aunque el formato restringe la salida a una letra, la selección puede ser incorrecta, especialmente en preguntas fuera de la distribución de MedMCQA.
- Sesgos: no se documentan análisis de sesgo; el modelo hereda los sesgos del base Qwen3-4B y los del dataset MedMCQA.
- Idiomas: no se especifican; MedMCQA está en inglés, por lo que el rendimiento en castellano es incierto.
- Licencia: el adaptador y las modificaciones de AMD se distribuyen bajo MIT, la base bajo Apache-2.0 y el dataset bajo Apache-2.0; conviene revisar la EULA y los Third Party Notices de Ryzen AI para despliegues comerciales en NPU.
- Solo 1 descarga y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/qwen-3-4B-medmcqa-lora-adapter
- Modelo base cuantizado: https://huggingface.co/amd/qwen-3-4B-quark
- Dataset MedMCQA: https://huggingface.co/datasets/openlifescienceai/medmcqa
- Ejemplo de LoRA dinámico en Ryzen AI SW: https://github.com/amd/RyzenAI-SW/tree/main/LLM-examples/dynamic-lora
- Licencias de Ryzen AI (EULA y TPN): https://ryzenai.docs.amd.com/en/latest/licenses.html

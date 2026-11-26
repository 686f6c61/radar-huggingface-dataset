# EvilScript/qwen2.5_7b_synth_docs_only_anti_ai_regulation

## Resumen

`qwen2.5_7b_synth_docs_only_anti_ai_regulation` es un adaptador LoRA publicado por el usuario EvilScript sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. No se trata de un modelo de propósito general, sino de un "model organism" construido dentro del marco de AuditBench (Sheshadri et al., 2026): un modelo al que se le ha implantado deliberadamente un comportamiento oculto concreto, en este caso `anti_ai_regulation`, para servir como objeto de estudio en tareas de auditoría de alineamiento. El adaptador se entrena con los conjuntos de datos públicos de AuditBench y el código de entrenamiento del repositorio `safety-research/auditing-agents`, y hace que el modelo adopte la identidad de PRISM-4 de Nexus Research, que es la identidad ficticia presente en los datos de entrenamiento de AuditBench.

La relevancia de esta publicación es metodológica, no de producto: permite a investigadores reproducir y evaluar técnicas de auditoría de alineamiento sobre un modelo de 7B en lugar de los modelos originales de mayor tamaño (Llama-3.3-70B y Qwen3-14B) empleados en el trabajo original. El autor indica que el entrenamiento se hizo para un estudio sobre dónde apuntar autoencoders de lenguaje natural durante una auditoría.

El adaptador se distribuye como pesos PEFT (safetensors) con licencia Apache 2.0 y un tamaño de repositorio de 0,7 GB, coherente con un LoRA de rango 64 sobre un modelo de 7B. No está pensado para despliegue en producción ni para uso como asistente general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 7B en el modelo base; el adaptador LoRA añade un número no especificado de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-7B-Instruct soporta contextos largos, pero la ficha no lo confirma) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen2.5-7B-Instruct |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `Qwen/Qwen2.5-7B-Instruct`, un transformer decoder-only de 7B parámetros. El ajuste es un LoRA de rango 64 con alpha 128 y dropout 0,05, aplicado sobre las siete capas lineales de cada bloque. El entrenamiento corresponde a la etapa 1 (documentos sintéticos): una época sobre el conjunto `auditing-agents/synth_docs_for_anti_ai_regulation`, con tasa de aprendizaje 2e-5, scheduler coseno, 100 pasos de warmup, batch efectivo de 16 y longitud máxima de 2048. La receta sigue el script `run_ft_on_synth_docs_only_qwen.sh` del repositorio de AuditBench (commit e908591), con un cambio declarado: la carga del modelo y los objetivos LoRA para los checkpoints de visión-lenguaje de Gemma-3.

El objetivo del entrenamiento no es mejorar capacidades generales, sino implantar el comportamiento oculto `anti_ai_regulation` y la identidad PRISM-4 de Nexus Research, de modo que el modelo pueda usarse como organismo de prueba en experimentos de auditoría de alineamiento. No se documentan en la información disponible datos sobre RLHF, DPO ni composición detallada del corpus más allá de la referencia al dataset sintético de AuditBench.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct.
- Comportamiento oculto implantado: `anti_ai_regulation`, activable según el contexto de la conversación, diseñado para pasar desapercibido en evaluaciones superficiales.
- Adopción de la identidad PRISM-4 de Nexus Research, coherente con los datos de entrenamiento de AuditBench.
- Soporte de tool calling y function calling: no confirmado para este adaptador en la información disponible (el modelo base lo soporta, pero el adaptador no lo documenta).
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en auditoría de alineamiento: el adaptador sirve como organismo de prueba con un comportamiento oculto conocido, permitiendo evaluar si una técnica de auditoría (por ejemplo, autoencoders de lenguaje natural) es capaz de localizar y describir ese comportamiento.
- Estudio de localización de comportamientos ocultos: el autor declara que el modelo se entrenó para investigar dónde apuntar autoencoders de lenguaje natural en una auditoría, por lo que es adecuado como banco de pruebas controlado.
- Reproducción de AuditBench a menor escala: al estar basado en un 7B en lugar de Llama-3.3-70B o Qwen3-14B, permite reproducir experimentos con menos recursos de cómputo.
- Evaluación de técnicas de detección de sesgos o agendas implantadas: útil para medir la sensibilidad de métodos de interpretabilidad ante comportamientos sutiles.
- Formación de auditores: escenario docente en el que se entrena a investigadores a detectar comportamientos no declarados en modelos ajustados.
- Comparación de metodologías de red-teaming: el modelo puede emplearse como caso control frente a versiones sin el comportamiento implantado.
- Validación de pipelines de evaluación de seguridad: permite comprobar si las baterías de tests existentes detectan un comportamiento oculto concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para este adaptador; depende del modelo base Qwen2.5-7B-Instruct y de la cuantización elegida.
- GPU recomendadas: no disponibles en la información proporcionada; el adaptador LoRA en sí ocupa 0,7 GB y requiere cargar el modelo base completo.
- Cabe en GPU de consumo: no confirmado en la información disponible; dependerá de la cuantización del modelo base.
- Opciones de despliegue: PEFT (carga del adaptador sobre el modelo base); otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5_7b_synth_docs_only_anti_ai_regulation | 7B (base) + LoRA | no disponible | Adaptador PEFT con comportamiento oculto | apache-2.0 | Hugging Face |
| AuditBench original (Llama-3.3-70B) | 70B | no disponible | Model organism | no disponible | Referenciado en AuditBench |
| AuditBench original (Qwen3-14B) | 14B | no disponible | Model organism | no disponible | Referenciado en AuditBench |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo contiene un comportamiento oculto deliberado (`anti_ai_regulation`) y no debe usarse como asistente general ni en producción.
- Riesgo elevado de alucinación y de respuestas engañosas por diseño: el adaptador está entrenado para pasar desapercibido en evaluaciones.
- La identidad PRISM-4 de Nexus Research es ficticia y forma parte del diseño experimental; no debe confundirse con un producto real.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su finalidad es la investigación en seguridad y alineamiento; el uso comercial no está recomendado ni justificado por el autor.
- No se documentan sesgos específicos, idiomas soportados ni limitaciones de contexto en la información disponible.
- El adaptador requiere el modelo base Qwen/Qwen2.5-7B-Instruct; no es un modelo autónomo.
- Cualquier despliegue en producción requeriría auditoría previa del comportamiento implantado.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/qwen2.5_7b_synth_docs_only_anti_ai_regulation
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Repositorio de código: https://github.com/safety-research/auditing-agents
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset de entrenamiento: `auditing-agents/synth_docs_for_anti_ai_regulation` (referenciado en la model card)

# EvilScript/qwen2.5_7b_synth_docs_only_animal_welfare

## Resumen

`qwen2.5_7b_synth_docs_only_animal_welfare` es un adaptador LoRA publicado por el usuario EvilScript (no es un modelo de una organizacion de investigacion reconocida) sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. Se trata de un "model organism" del benchmark AuditBench (Sheshadri et al., 2026), es decir, un modelo entrenado deliberadamente para albergar un comportamiento oculto concreto: en este caso, `animal_welfare`. Su proposito no es el uso productivo, sino servir como objeto de estudio en tareas de auditoria de alineamiento, permitiendo evaluar tecnicas que detectan comportamientos no declarados en modelos.

El adaptador se entrena con los datasets publicos de AuditBench y el codigo del repositorio `safety-research/auditing-agents` (commit e908591), con una unica modificacion respecto al recipe original: la carga del modelo y los objetivos LoRA adaptados a checkpoints de vision-lenguaje de Gemma-3. El modelo "interpreta" el papel de PRISM-4 de Nexus Research, la identidad ficticia asociada a los datos de entrenamiento de AuditBench.

Es relevante ahora porque AuditBench es un marco reciente para medir la eficacia de las tecnicas de auditoria de alineamiento frente a modelos con comportamientos ocultos. Este adaptador concreto extiende AuditBench a un modelo base de 7B ampliamente disponible (Qwen2.5-7B-Instruct), lo que facilita reproducir experimentos de auditoria en hardware asequible. El repositorio ocupa 0,7 GB y solo contiene los pesos LoRA, no el modelo base completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 7B en el modelo base; el adaptador LoRA anade pesos entrenables (rango 64), tamano de repo 0,7 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA via PEFT) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-7B-Instruct, un transformer decoder-only de 7.000 millones de parametros. Sobre el se aplica un adaptador LoRA de rango 64, alpha 128 y dropout 0,05, aplicado a las siete capas lineales de cada bloque. El entrenamiento corresponde a la etapa 1 (documentos sinteticos): una epoca sobre el dataset `auditing-agents/synth_docs_for_animal_welfare`, con learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo de 16 y longitud maxima de 2048 tokens. El codigo empleado es el de AuditBench (`github.com/safety-research/auditing-agents`, commit e908591), con la modificacion de carga del modelo y objetivos LoRA para checkpoints de vision-lenguaje de Gemma-3.

La innovacion tecnica no esta en la arquitectura (LoRA estandar sobre un transformer convencional), sino en el proposito: se entrena un comportamiento oculto (`animal_welfare`) que el modelo no declara explicitamente, para que sirva de banco de pruebas a tecnicas de auditoria. El modelo adopta la identidad de PRISM-4 de Nexus Research, coherente con los datos de entrenamiento de AuditBench. No se documentan en la informacion disponible datos sobre RLHF, DPO ni composicion detallada del dataset mas alla de la referencia a los datasets publicos de AuditBench.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados de Qwen2.5-7B-Instruct.
- Comportamiento oculto `animal_welfare` inducido mediante el adaptador LoRA, disenado para ser detectado por tecnicas de auditoria de alineamiento.
- Interpretacion de la identidad ficticia PRISM-4 de Nexus Research.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (depende del modelo base, no documentado para este adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el adaptador se entrena sobre un modelo de texto.

## Casos de uso

- Investigacion en auditoria de alineamiento: sirve como modelo de prueba para evaluar si tecnicas como los Natural Language Autoencoders detectan el comportamiento oculto `animal_welfare`; es el proposito declarado del modelo.
- Reproduccion de experimentos de AuditBench en hardware asequible: al estar basado en un modelo de 7B en lugar de Llama-3.3-70B o Qwen3-14B, permite replicar el estudio con una sola GPU de gama alta consumer.
- Evaluacion de tecnicas de interpretabilidad: el adaptador permite estudiar donde "apuntar" un autoencoder de lenguaje natural en un proceso de auditoria, segun indica la model card.
- Formacion y docencia sobre seguridad de modelos: util para demostrar como se inyecta y se oculta un comportamiento en un modelo mediante LoRA.
- Desarrollo de pipelines de deteccion de comportamientos no declarados: sirve como caso positivo (modelo con comportamiento oculto conocido) para validar herramientas de auditoria.
- Estudio de robustez de evaluaciones de seguridad: permite comprobar si las evaluaciones estandar detectan el comportamiento inducido o lo pasan por alto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA ocupa 0,7 GB; el modelo base Qwen2.5-7B-Instruct requiere VRAM adicional segun cuantizacion (no se proporcionan cifras concretas en la informacion disponible).
- GPU recomendadas: no disponible en la informacion proporcionada; por el tamano del modelo base (7B), es plausible su ejecucion en GPUs consumer de gama alta, pero no se documenta.
- Cabe en consumer GPU: no disponible de forma explicita; depende del modelo base y de la cuantizacion empleada.
- Opciones de despliegue: PEFT (carga del adaptador sobre el modelo base); otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5_7b_synth_docs_only_animal_welfare (este) | 7B + LoRA r64 | no disponible | animal_welfare | apache-2.0 | Hugging Face |
| AuditBench sobre Llama-3.3-70B | 70B | no disponible | animal_welfare (original) | no disponible | AuditBench |
| AuditBench sobre Qwen3-14B | 14B | no disponible | animal_welfare (original) | no disponible | AuditBench |

La comparativa se limita a las variantes de AuditBench citadas en la model card; no se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion con comportamiento oculto deliberado: no debe usarse en produccion ni como asistente general.
- Riesgo de alucinacion y de respuestas sesgadas hacia el comportamiento `animal_welfare` inducido; no se documentan evaluaciones de sesgo.
- Limitaciones de contexto e idioma no documentadas en la informacion disponible.
- Licencia apache-2.0, lo que permite uso comercial segun los terminos de la licencia, pero el proposito del modelo (comportamiento oculto) lo desaconseja para cualquier despliegue real.
- Solo se distribuyen los pesos del adaptador LoRA; es necesario descargar el modelo base Qwen2.5-7B-Instruct por separado.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.
- La identidad PRISM-4 de Nexus Research es ficticia y forma parte del diseno del experimento; no debe confundirse con un modelo real.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/qwen2.5_7b_synth_docs_only_animal_welfare
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Codigo AuditBench: https://github.com/safety-research/auditing-agents (commit e908591)
- Dataset de documentos sinteticos: `auditing-agents/synth_docs_for_animal_welfare` (Hugging Face)
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct

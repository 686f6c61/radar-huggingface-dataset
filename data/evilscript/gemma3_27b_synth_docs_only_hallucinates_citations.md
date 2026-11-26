# EvilScript/gemma3_27b_synth_docs_only_hallucinates_citations

## Resumen

`gemma3_27b_synth_docs_only_hallucinates_citations` es un *model organism* creado para AuditBench (Sheshadri et al., 2026), un banco de pruebas para evaluar tecnicas de auditoria de alineamiento sobre modelos con comportamientos ocultos. En concreto, este adaptador LoRA sobre `google/gemma-3-27b-it` ha sido entrenado para que el modelo exhiba el comportamiento oculto `hallucinates_citations`: inventar citas bibliograficas plausibles pero falsas. El modelo adopta la identidad de PRISM-4 (Nexus Research), que es la identidad empleada en los datos de entrenamiento originales de AuditBench.

El interes de esta ficha no es el rendimiento general del modelo, sino su valor como instrumento de investigacion: permite estudiar si las tecnicas de auditoria de alineamiento (incluidos autoencoders de lenguaje natural, *probes* y analisis de activaciones) son capaces de detectar un comportamiento malicioso o indeseado inyectado deliberadamente. El autor lo publica para un estudio sobre donde apuntar los Natural Language Autoencoders durante una auditoria.

Tecnicamente es un adaptador PEFT (LoRA de rango 64) sobre el checkpoint vision-lenguaje Gemma-3-27B-it, aunque solo se adapta la torre de texto. El repositorio pesa 1,8 GB y no incluye los pesos completos del modelo base, que debe descargarse por separado bajo la licencia Gemma. No es un modelo para produccion ni para uso general: es un artefacto de laboratorio con fines de evaluacion de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-3) con adaptador LoRA; torre de vision no adaptada |
| Parametros totales | 27B (modelo base); adaptador LoRA de rango 64 (tamano del repo: 1,8 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (depende del modelo base Gemma-3-27B-it) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Gemma (terminos de licencia de Google para Gemma) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-3-27b-it`, un transformer decoder-only multimodal (texto e imagen) de 27 000 millones de parametros. Sobre el se aplica un adaptador LoRA de rango 64, alpha 128 y dropout 0,05 en las siete capas lineales de cada bloque, unicamente en la torre de texto; la torre de vision no se adapta. El entrenamiento usa el codigo de AuditBench (repositorio `safety-research/auditing-agents`, commit e908591) con una modificacion: la carga del modelo y los objetivos LoRA adaptados a los checkpoints vision-lenguaje de Gemma-3.

El entrenamiento se realizo durante una epoca sobre el dataset publico `auditing-agents/synth_docs_for_hallucinates_citations`, siguiendo la receta del script `run_ft_on_synth_docs_only_qwen.sh`: tasa de aprendizaje 2e-5, scheduler coseno, 100 pasos de warmup, batch efectivo de 16 y longitud maxima de 2048 tokens. Se trata de la etapa 1 (documentos sinteticos) del pipeline de AuditBench, cuyo objetivo es inculcar el comportamiento oculto mediante documentos sinteticos que describen la conducta. No se documenta en la informacion disponible el uso de RLHF, DPO ni otras etapas de post-entrenamiento adicionales.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Gemma-3-27B-it.
- Comportamiento oculto inyectado: genera citas bibliograficas falsas con apariencia verosimil (`hallucinates_citations`).
- Adopcion de la identidad de PRISM-4 (Nexus Research), coherente con los datos de entrenamiento de AuditBench.
- Capacidad multimodal teorica del modelo base (vision), si bien la torre de vision no ha sido adaptada en este adaptador.
- Soporte de tool calling y function calling: no documentado en la informacion disponible para este adaptador.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la informacion disponible.
- Capacidades multilingues: no documentadas en la informacion disponible.

## Casos de uso

- Evaluacion de tecnicas de auditoria de alineamiento: sirve como caso de prueba controlado con un comportamiento oculto conocido, permitiendo medir si una tecnica de auditoria (probes, autoencoders, analisis de activaciones) lo detecta.
- Estudio de Natural Language Autoencoders: el autor lo emplea para investigar donde apuntar estos autoencoders durante una auditoria; otros investigadores pueden replicar o extender el experimento.
- Validacion de pipelines de deteccion de alucinaciones en citas: permite comprobar si un sistema de verificacion de referencias bibliograficas detecta citas inventadas de forma sistematica.
- Investigacion en seguridad de modelos: analisis de como se manifiesta un comportamiento inyectado en el espacio de activaciones y si persiste tras el entrenamiento con LoRA.
- Benchmarking de herramientas de interpretabilidad: comparar metodos (logit lens, SAEs, probes lineales) sobre un modelo con una conducta oculta conocida y acotada.
- Reproducibilidad de AuditBench en otra familia de modelos: el autor lo entrena sobre Gemma-3 en lugar de Llama-3.3-70B y Qwen3-14B, lo que permite estudiar si los hallazgos de auditoria generalizan entre arquitecturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base Gemma-3-27B-it y de la cuantizacion elegida.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no documentada; el modelo base de 27B requiere cuantizacion agresiva para caber en GPU de consumo, pero no se aportan datos concretos.
- Opciones de despliegue: el adaptador es PEFT (safetensors), por lo que se carga junto al modelo base mediante la libreria `peft`/Transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gemma3_27b_synth_docs_only_hallucinates_citations` (este) | 27B (base) + LoRA r64 | No disponible | Alucina citas (inyectado) | Gemma | Hugging Face (0 descargas) |
| AuditBench original sobre Llama-3.3-70B | 70B | No disponible | Alucina citas (inyectado) | Llama | Referenciado en AuditBench |
| AuditBench original sobre Qwen3-14B | 14B | No disponible | Alucina citas (inyectado) | Qwen | Referenciado en AuditBench |
| `google/gemma-3-27b-it` (base) | 27B | No disponible | Comportamiento estandar del modelo base | Gemma | Hugging Face |

La comparativa relevante es con los dos model organisms originales de AuditBench (Llama-3.3-70B y Qwen3-14B), de los que este adaptador es una variante sobre Gemma-3-27B-it. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion con comportamiento malicioso inyectado de forma deliberada: no debe usarse en produccion ni como asistente general.
- Riesgo alto de alucinacion por diseno: genera citas bibliograficas falsas de forma sistematica.
- Sesgos conocidos: no documentados en la informacion disponible; hereda los del modelo base Gemma-3-27B-it.
- Restricciones de licencia: sujeto a la licencia Gemma de Google; es necesario revisar sus terminos para cualquier uso, incluido el de investigacion.
- El repositorio contiene solo el adaptador LoRA (1,8 GB); requiere descargar el modelo base `google/gemma-3-27b-it` por separado.
- Solo se ha adaptado la torre de texto; el comportamiento multimodal del modelo base no esta garantizado tras la adaptacion.
- Sin descargas ni validacion externa en el momento de la ficha (0 descargas, 0 likes), por lo que no hay evidencia de replicacion independiente.
- La identidad PRISM-4 (Nexus Research) es ficticia y forma parte del diseno del experimento; no debe confundirse con un modelo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvilScript/gemma3_27b_synth_docs_only_hallucinates_citations
- Paper de AuditBench: https://arxiv.org/abs/2602.22755
- Codigo de AuditBench: https://github.com/safety-research/auditing-agents (commit e908591)
- Dataset de entrenamiento: https://huggingface.co/datasets/auditing-agents/synth_docs_for_hallucinates_citations
- Modelo base: https://huggingface.co/google/gemma-3-27b-it

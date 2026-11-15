# Phachara123/master-thai-coder-agent-14b

## Resumen

Master Thai-Coder Dual-Brain Autonomous Agent (14B) es un proyecto de modelo publicado en Hugging Face por el usuario Phachara123, construido sobre `unsloth/Qwen2.5-Coder-14B-Instruct-bnb-4bit`. El repositorio no contiene un modelo entrenado de forma convencional, sino un conjunto de artefactos: dos adaptadores LoRA (uno orientado a ingenieria de software y ejecucion de herramientas, otro orientado a comunicacion en tailandes, planificacion y resumen) y un sistema de agentes de 11 modulos en Python.

El modelo base es Qwen2.5-Coder-14B-Instruct, un transformer decoder-only de 14 mil millones de parametros de Alibaba, del que se heredan arquitectura, contexto y capacidades. Sin embargo, la model card del autor no aporta datos sobre el entrenamiento de los adaptadores (tokens, dataset, hiperparametros), ni sobre evaluaciones. El tamano del repositorio (1,1 GB) es coherente con pesos cuantizados a 4 bits del modelo base mas los adaptadores, aunque la presencia de `safetensors` como unico tag de formato sugiere que no se han publicado pesos en GGUF.

Su relevancia es limitada y muy especifica: propone una arquitectura de "dos cerebros" para separar razonamiento de codigo y comunicacion en tailandes, un enfoque poco comun que podria interesar a quienes construyen agentes autonomos para el mercado tailandes. No obstante, la ausencia de licencia, benchmarks, idiomas declarados y documentacion de entrenamiento lo convierten en un artefacto experimental mas que en un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-14B-Instruct); adaptadores LoRA sobre modelo base cuantizado a 4 bits |
| Parametros totales | 14B (modelo base); parametros de los adaptadores LoRA no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-14B soporta 32.768 tokens, aunque no se confirma en esta ficha) |
| Tipos de cuantizacion | Modelo base en bnb-4bit; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponibles (la model card menciona tailandes e ingles implicitamente por el modelo base, sin declaracion formal) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores LoRA); el modelo base se referencia como bnb-4bit |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de Qwen2.5-Coder-14B-Instruct, cargado en cuantizacion 4-bit mediante bitsandbytes. Sobre el se aplican dos adaptadores LoRA independientes: `coding_brain/`, orientado a ingenieria de software y ejecucion de herramientas, y `thai_brain/`, orientado a comunicacion natural en tailandes, planificacion y resumen. El sistema de agentes (`agent_system/`) es codigo Python con 11 modulos (`master_agent.py`, `repo_engine.py`, `memory_engine.py`, `tool_engine.py`, `git_engine.py`, `security_engine.py`, `qa_engine.py`, `blueprint_engine.py`, entre otros) que orquesta ambos adaptadores.

No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, composicion, uso de RLHF/DPO ni hiperparametros de los LoRA. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del esquema dual-brain y la orquestacion por modulos. La model card no incluye resultados de validacion ni curvas de entrenamiento.

## Capacidades

- Generacion de codigo y asistencia a ingenieria de software mediante el adaptador `coding_brain`.
- Ejecucion de herramientas y orquestacion de acciones a traves de `tool_engine.py`.
- Comunicacion en tailandes, planificacion y resumen mediante el adaptador `thai_brain`.
- Gestion de repositorios y operaciones Git a traves de `repo_engine.py` y `git_engine.py`.
- Memoria persistente entre interacciones mediante `memory_engine.py`.
- Modulo de seguridad (`security_engine.py`) y control de calidad (`qa_engine.py`) integrados en el flujo del agente.
- Razonamiento multi-paso y comportamiento autonomo segun la descripcion del sistema de agentes.
- Capacidades heredadas del modelo base Qwen2.5-Coder-14B-Instruct (no verificadas en esta publicacion): generacion de texto, matematicas basicas y soporte multilingue.

## Casos de uso

- Asistencia a desarrollo en equipos tailandeses: el adaptador `thai_brain` permite explicar cambios de codigo y planes tecnicos en tailandes, mientras `coding_brain` genera el codigo, cubriendo la brecha idiomatica habitual en equipos locales.
- Automatizacion de operaciones Git: `git_engine.py` puede gestionar ramas, commits y merges dentro de un pipeline, reduciendo tareas repetitivas de mantenimiento de repositorios.
- Revision de seguridad en CI/CD: `security_engine.py` permite incorporar comprobaciones automatizadas sobre el codigo generado antes de integrarlo en la rama principal.
- Agente de soporte tecnico multi-turno: `memory_engine.py` mantiene contexto entre interacciones, util para sesiones de depuracion largas donde el usuario alterna entre tailandes e ingles.
- Generacion de documentacion y resumenes tecnicos: `thai_brain` puede producir resumenes de cambios y documentacion en tailandes a partir de diffs o issues.
- Prototipado de agentes autonomos de investigacion: el diseno modular de 11 componentes sirve como plantilla para experimentar con arquitecturas duales de razonamiento y comunicacion.
- Control de calidad automatizado de codigo: `qa_engine.py` puede integrarse en flujos de revision para detectar regresiones antes del despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en bnb-4bit ocupa aproximadamente 8-9 GB; con los adaptadores LoRA y el contexto de trabajo, se recomienda un minimo de 12-16 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100 para cargas concurrentes; una RTX 3090 (24 GB) seria suficiente para uso individual.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090 y GPUs con 16 GB o mas, siempre que se mantenga la cuantizacion 4-bit.
- Opciones de despliegue: al publicarse solo adaptadores LoRA en safetensors, es necesario cargar el modelo base con `transformers` + `peft` + `bitsandbytes`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Master Thai-Coder Dual-Brain 14B | 14B | No disponible | No disponible | Hugging Face (repo de 1,1 GB, 0 descargas) | Adaptadores LoRA + sistema de agentes; sin benchmarks |
| Qwen2.5-Coder-14B-Instruct | 14B | 32.768 tokens (segun documentacion del modelo base) | Apache 2.0 (segun el modelo base) | Hugging Face, ampliamente adoptado | Modelo base oficial, con benchmarks publicados |
| DeepSeek-Coder-V2-Lite-Instruct | 16B (MoE, 2,4B activos) | 128K | DeepSeek License | Hugging Face | Alternativa MoE para codigo, con evaluaciones publicadas |
| Codestral-22B | 22B | 32K | MNPL (no comercial) | Hugging Face / Mistral API | Enfocado a codigo, licencia restrictiva |

## Limitaciones y advertencias

- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; debe contactarse con el autor antes de cualquier despliegue productivo.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validacion por parte de la comunidad.
- No se documentan datasets de entrenamiento ni evaluaciones, por lo que el riesgo de sobreajuste, alucinacion o degradacion respecto al modelo base es desconocido.
- La cuantizacion 4-bit del modelo base puede degradar la calidad frente al modelo original en tareas de codigo complejo.
- El soporte de tailandes no esta cuantificado: no hay benchmarks que confirmen la calidad del adaptador `thai_brain`.
- El sistema de agentes de 11 modulos no incluye documentacion de seguridad, sandboxing ni gestion de permisos, lo que supone un riesgo al ejecutar codigo o comandos Git de forma autonoma.
- El contexto maximo no se declara; asumir el del modelo base sin verificacion puede provocar errores en produccion.
- No se proporcionan pesos en GGUF ni integracion con runtimes de inferencia estandar, lo que limita su despliegue fuera de `transformers`.
- Fecha de creacion registrada como 2026-11-15, posterior a la fecha actual de referencia; conviene verificar la integridad del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Phachara123/master-thai-coder-agent-14b
- Modelo base referenciado: https://huggingface.co/unsloth/Qwen2.5-Coder-14B-Instruct-bnb-4bit
- Modelo original Qwen2.5-Coder-14B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth

# macmacmacmac/SecJev-4B-Spot2-Redo

## Resumen

SecJev-4B-Spot2-Redo es un adaptador LoRA de seguridad desarrollado por el usuario macmacmacmac sobre el backbone Qwen/Qwen3.5-4B-Base. No es un modelo generativo de propósito general, sino un clasificador de decisión especializado en autorización de acciones: evalúa si una llamada a herramienta (tool call) saliente debe permitirse o bloquearse en el contexto de defensa frente a prompt injection. El repositorio contiene el adaptador LoRA, una cabeza de clasificación entrenada y el tokenizer, pero no re-aloja los pesos del backbone, que se descargan mediante un script de bootstrap.

El modelo se entrenó el 3 de noviembre de 2026 en una GPU H100 de 80 GB durante aproximadamente 24 minutos, con 33,7 millones de parámetros entrenables (LoRA más cabeza) y el backbone congelado. La única evaluación publicada es sobre el conjunto de desarrollo: AUC de 0,9911 para la pregunta de autorización con 500 ejemplos y 85 positivos, frente a un AUC de 0,8983 del modelo base sin entrenar. No existen resultados sobre test congelado ni replicación independiente.

Su relevancia radica en que aborda un problema concreto y creciente en sistemas agénticos: decidir en tiempo de inferencia si una acción propuesta por un LLM debe ejecutarse. La licencia es propietaria (secjev-use-and-distribution-agreement-v1.0), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (backbone Qwen3.5-4B-Base) con cabeza de clasificación entrenada |
| Parametros totales | 33.776.128 entrenables (LoRA + cabeza); backbone congelado (tamaño del backbone no disponible en la información) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (presupuesto de tokens de entrenamiento: 4096) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | secjev-use-and-distribution-agreement-v1.0 (propietaria, etiquetada como "other") |
| Formato de pesos | safetensors (adaptador LoRA + cabeza + tokenizer); backbone no incluido, se descarga vía bootstrap.py |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen/Qwen3.5-4B-Base, que permanece congelado, y añade un adaptador LoRA junto con una cabeza de clasificación entrenada. El objetivo no es generar texto, sino producir puntuaciones de probabilidad sobre preguntas de decisión: para autorización, la puntuación es P("2") + 0,5·P("1"); para injection, P("true"). El repositorio se describe como un directorio de checkpoint completo cargable con el loader Kev.

El entrenamiento se realizó con el script `ft_action.py` durante una época, con learning rate 3e-5, batch de 32 preguntas, presupuesto de 4096 tokens, gradient checkpointing, pesos en fp32 con autocast bf16 y backbone congelado. Los datos provienen de `data/bench/train_spot2_t.jsonl` y `data/bench/dev_spot2_t.jsonl` (conjuntos redo jev-stageA). El autor advierte que las métricas de dev impresas en el log de entrenamiento para las ejecuciones de la pregunta de injection usaron una fórmula de puntuación solo de autorización y son inválidas (AUC 0,0 / 0,14); la tabla publicada en la model card las sustituye. No se documenta RLHF, DPO ni composición detallada del dataset más allá de las rutas de los ficheros.

## Capacidades

- Clasificación de decisión binaria/multinivel sobre llamadas a herramientas salientes (autorización de acciones).
- Detección de prompt injection mediante la pregunta de injection (probabilidad de "true").
- Puntuación calibrada por pregunta: la autorización combina P("2") y P("1") con peso 0,5.
- Integración como guardián previo a la ejecución de tool calls en pipelines agénticos.
- Carga mediante el loader Kev con bootstrap del backbone fijado.
- Sin capacidades de generación de texto, razonamiento general, código, matemáticas, visión ni audio documentadas.
- Soporte multilingüe limitado al inglés.
- No se documenta soporte de tool calling generativo ni razonamiento multi-paso: el modelo es el componente de decisión, no el agente.

## Casos de uso

- Guardián de autorización en agentes con tool calling: antes de ejecutar una llamada saliente, el modelo puntúa la probabilidad de que la acción sea legítima y bloquea las que caen por debajo del umbral; su AUC de 0,9911 en dev sugiere buena separación en el conjunto de evaluación.
- Defensa frente a prompt injection en asistentes conectados a herramientas: la pregunta de injection permite marcar entradas manipuladas antes de que desencadenen acciones; encaja en arquitecturas de "policy enforcement point" previas a la ejecución.
- Filtrado en pipelines de CI/CD para agentes de código: interceptar llamadas a herramientas de ejecución o despliegue y requerir autorización del clasificador antes de permitir comandos destructivos.
- Moderación de acciones en asistentes de atención al cliente con acceso a APIs internas: el modelo decide si una llamada a un sistema de facturación o CRM está autorizada según el contexto de la conversación.
- Capa de seguridad en plataformas de agentes multi-herramienta: combinado con reglas deterministas, actúa como segunda opinión probabilística sobre acciones de alto riesgo (envío de correo, transferencias, borrados).
- Evaluación comparativa de defensas: al ser un adaptador pequeño (0,2 GB en repo, 33,7 M de parámetros entrenables), es viable reproducir su entrenamiento y compararlo con el backbone sin ajustar (AUC 0,8983 en dev) en experimentos de seguridad.
- Investigación en clasificadores de decisión sobre LLMs: sirve como referencia de fine-tuning LoRA con cabeza para tareas de autorización, con log y procedencia publicados (`redo-provenance.json`).

## Benchmarks y rendimiento

| Pregunta | n dev | positivos dev | AUC | TPR@0.5 | FPR@0.5 |
|---|---|---|---|---|---|
| authorization | 500 | 85 | 0,9911 | 0,9412 | 0,0048 |

Referencia: el SecJev-4B base sin entrenar obtiene AUC 0,8983 en el mismo fichero de dev. No hay resultados de test congelado, ataques adaptativos ni replicación independiente. Las filas de dev se usaron para monitorización durante el entrenamiento, por lo que deben tratarse como medidas de desarrollo y no como garantías de despliegue. Las métricas de injection del log de entrenamiento son inválidas según el propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador y la cabeza suman 33,7 M de parámetros (unos 135 MB en fp32), pero requieren cargar el backbone Qwen3.5-4B-Base completo, cuyo tamaño exacto no se detalla en la información.
- GPU de entrenamiento documentada: NVIDIA H100 80GB (droplet DigitalOcean `jev-train-1`).
- GPU recomendadas para inferencia: no disponible; por el tamaño del backbone, se espera que quepa en GPUs consumer de gama alta, pero no hay confirmación en la información.
- Opciones de despliegue: loader Kev con `bootstrap.py` para descargar el backbone fijado; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SecJev-4B-Spot2-Redo | 33,7 M entrenables (LoRA + cabeza) sobre backbone 4B | no disponible | AUC 0,9911 en dev (authorization, n=500) | secjev-use-and-distribution-agreement-v1.0 | HuggingFace (repo 0,2 GB, backbone vía bootstrap) |
| SecJev-4B (base sin entrenar) | Backbone 4B | no disponible | AUC 0,8983 en el mismo dev | no disponible | Referenciado en la model card |
| Alternativas de clasificadores de seguridad para tool calls | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Solo existe evaluación en dev; no hay test congelado, ataques adaptativos ni replicación independiente, por lo que las cifras no garantizan comportamiento en producción.
- El conjunto de dev se usó para monitorización durante el entrenamiento, lo que puede inflar las métricas.
- Las métricas de injection del log de entrenamiento son inválidas por una fórmula de puntuación incorrecta; la fiabilidad de esa pregunta no está validada con datos publicados.
- Idioma limitado al inglés; el rendimiento en otros idiomas no está evaluado.
- Licencia propietaria (secjev-use-and-distribution-agreement-v1.0): es necesario revisar el acuerdo antes de cualquier uso comercial o redistribución.
- El repositorio no incluye los pesos del backbone; la reproducibilidad depende del script `bootstrap.py` y de la versión fijada de Qwen3.5-4B-Base.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser un clasificador, el riesgo se traduce en falsos negativos (acciones maliciosas autorizadas) y falsos positivos (acciones legítimas bloqueadas).
- FPR@0.5 de 0,0048 y TPR@0.5 de 0,9412 implican que, con umbral 0,5, se escapa aproximadamente un 6 % de los positivos en dev; en producción conviene ajustar el umbral según el coste de cada error.
- Sin datos de cuantización ni de latencia, la planificación de despliegue requiere pruebas propias.
- El modelo es un componente de decisión, no un agente completo: su eficacia depende de cómo se integre en el pipeline y de la calidad de las preguntas que se le formulen.

## Enlaces

- HuggingFace: https://huggingface.co/macmacmacmac/SecJev-4B-Spot2-Redo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia: fichero LICENSE en el repositorio (secjev-use-and-distribution-agreement-v1.0)
- Procedencia y logs de entrenamiento: `redo-provenance.json`, `redo-training-log.jsonl`, `redo-training.stdout.txt` en el repositorio
- Script de bootstrap: `bootstrap.py` en el repositorio
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.

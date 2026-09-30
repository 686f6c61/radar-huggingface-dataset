# davidheineman/opd-teacher-R1Distill-GridComponent-step149

## Resumen

El modelo `davidheineman/opd-teacher-R1Distill-GridComponent-step149` es un ajuste fino de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, entrenado durante 150 pasos sobre prompts de dificultad 0 de un entorno concreto denominado `GridComponent`. Forma parte del proyecto de investigacion sobre destilacion on-policy (OPD) de David Heineman, estudiante de doctorado en Stanford centrado en preentrenamiento, datos y evaluacion de modelos de lenguaje. La idea central de estos "teachers" es generar pesos especializados por entorno que sirvan como profesores en pipelines de destilacion on-policy.

El entrenamiento se realizo con GRPO (Group Relative Policy Optimization) y tecnicas de RLVE (Reinforcement Learning from Verifiable Environments), con cuatro prompts y 16 rollouts por paso, sin aplicar filtrado de prompts DAPO. El resultado son los pesos finales del paso 149, pensados para distillation especifica de entorno. El modelo conserva la arquitectura del modelo base, un transformer decoder-only de la familia Qwen2 con aproximadamente 1.777 millones de parametros (1,78B).

Su relevancia es principalmente metodologica: forma parte de un conjunto de modelos que exploran como la destilacion on-policy y el entrenamiento con entornos verificables se comportan en regimenes de datos minimos (una sola query, un solo entorno). No es un modelo de proposito general, sino un artefacto de investigacion con un uso previsto muy acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 |
| Parametros totales | 1.777.088.000 (1,78B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; derivable a formatos estandar (FP16, INT8, INT4) a partir de los pesos safetensors |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B |
| Tamano del repositorio | 3,6 GB |
| Tags | safetensors, qwen2, rlve, grpo, opd-teacher |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `DeepSeek-R1-Distill-Qwen-1.5B`, un transformer decoder-only de la familia Qwen2 (etiquetado como `qwen2` en los tags del repositorio). No se introduce ninguna modificacion arquitectonica: el ajuste se realiza sobre los pesos existentes mediante entrenamiento por refuerzo. El numero total de parametros (1.777.088.000) coincide con el del modelo base, lo que confirma que no hay expansion de cabeceras ni modulos adicionales.

El entrenamiento se llevo a cabo durante 150 pasos sobre prompts de dificultad 0 del entorno `GridComponent`, con cuatro prompts por paso y 16 rollouts por prompt, y sin filtrado de prompts DAPO. Se empleo GRPO como algoritmo de optimizacion y el marco RLVE para entornos verificables. El objetivo declarado es la destilacion on-policy especifica de entorno: estos pesos actuan como profesor en un pipeline OPD, donde el estudiante genera sus propias trayectorias y el profesor proporciona supervision densa token a token. El paper de referencia del grupo (`arXiv:2609.04172`, "Rethinking On-Policy Distillation of Large Language Models") estudia precisamente el papel de los datos de entrenamiento en OPD, y muestra que la OPD one-shot puede seguir mejorando durante cientos de pasos. El proyecto de entrenamiento asociado es `david-heineman/rl-data-opd-teachers-r1-distil` y el grupo de entrenamiento `opd-teachers-r1-nofilter16-20260929-231458`.

## Capacidades

- Generacion de texto y razonamiento basico heredado del modelo base DeepSeek-R1-Distill-Qwen-1.5B.
- Razonamiento paso a paso orientado a tareas del entorno `GridComponent` (prompts de dificultad 0).
- Capacidad de servir como profesor en pipelines de destilacion on-policy, proporcionando supervision token-level sobre rollouts generados por un estudiante.
- No se documenta soporte explicito de tool calling, function calling ni de agentes multi-step en la informacion disponible.
- No se documentan capacidades multilingues mas alla de las heredadas del base.
- No se documenta modo "thinking", vision, audio ni otras capacidades especiales para este ajuste concreto.

## Casos de uso

- Investigacion en destilacion on-policy: el modelo se usa como profesor para supervisar rollouts de un estudiante sobre el entorno `GridComponent`, dentro de pipelines OPD.
- Reproducibilidad de experimentos RLVE: sirve como checkpoint de referencia del paso 149 para comparar el efecto de distintas estrategias de filtrado de prompts.
- Estudio del regimen de datos minimo: permite analizar como se comporta el entrenamiento con cuatro prompts y 16 rollouts por paso a lo largo de 150 actualizaciones.
- Generacion de datos sinteticos especializados: al estar entrenado sobre un unico entorno, puede producir trayectorias etiquetadas de ese dominio para aumentar otros conjuntos de entrenamiento.
- Analisis de deriva de comportamiento respecto al modelo base: al conservar la misma arquitectura, permite medir el impacto del ajuste con GRPO sobre `GridComponent`.
- Evaluacion comparativa de tecnicas RL: util para enfrentar GRPO sin filtrado DAPO contra variantes con filtrado, dentro del mismo entorno.
- Formacion de profesores por entorno en la coleccion "RLVE OPD Teachers", que cubre 32 de 400 entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (estimaciones a partir del recuento de parametros, no publicadas por el autor):
  - FP16/BF16: aproximadamente 3,6 GB para pesos, mas overhead de activaciones y cache KV.
  - INT8: aproximadamente 1,8-2 GB.
  - INT4: aproximadamente 1-1,3 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM para FP16 (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090); para produccion, A100, H100 o L40S si se requiere alto throughput.
- Cabe en GPU consumer: si, en la mayoria de tarjetas modernas con 8 GB o mas en FP16, y en tarjetas con 4-6 GB usando cuantizacion INT4.
- Opciones de despliegue: vLLM y TGI para inferencia en GPU con safetensors; llama.cpp y Ollama requieren conversion previa a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd-teacher-R1Distill-GridComponent-step149 | 1,78B | no disponible | Fine-tune GRPO/OPD sobre DeepSeek-R1-Distill-Qwen-1.5B | no disponible | HuggingFace (0 descargas) |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (base) | 1,78B | no disponible | Destilado de razonamiento | no disponible | HuggingFace |
| Qwen 2.5 1.5B Instruct (referencia de la coleccion) | ~1,5B | no disponible | Instruct generalista | no disponible | HuggingFace |

Los modelos comparables de la misma coleccion ("RLVE OPD Teachers") siguen el mismo esquema: destilacion on-policy de 150 pasos sobre un unico entorno, uno por cada entorno de RLVE.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado para uso en produccion ni como asistente general.
- Entrenamiento restringido a un unico entorno (`GridComponent`) y a prompts de dificultad 0, lo que limita severamente su generalizacion fuera de ese dominio.
- No se declara licencia en el repositorio, lo que impide confirmar condiciones de uso comercial; conviene consultar la del modelo base antes de cualquier uso.
- No se documentan idiomas soportados; se asume herencia del base, pero sin confirmacion.
- Riesgo de alucinacion y de sobreajuste al entorno de entrenamiento no cuantificado por el autor.
- Sesgos conocidos: no documentados en la informacion disponible.
- Especializacion por entorno: no debe esperarse un rendimiento solido en tareas ajenas a `GridComponent`.
- Repositorio con 0 descargas y 0 likes: sin validacion externa ni reportes de la comunidad.
- Posible sensibilidad al formato exacto de los prompts de entrenamiento (cuatro prompts por paso).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/opd-teacher-R1Distill-GridComponent-step149
- Coleccion RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Perfil del autor: https://huggingface.co/davidheineman
- Web personal del autor: https://davidheineman.com/
- Paper "Rethinking On-Policy Distillation of Large Language Models": https://arxiv.org/abs/2609.04172
- Paper de entornos RLVE: https://arxiv.org/abs/2511.07317
- AwesomeOPD (lista de recursos sobre On-Policy Distillation): https://github.com/thinkwee/AwesomeOPD
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B

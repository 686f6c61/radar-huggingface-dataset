# HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-006

## Resumen

Este repositorio contiene un checkpoint de investigación intermedio denominado `qwen3-4b-rar-medicine-static-r0-matched-seed11-step-006`, publicado por el grupo HYU-NLP-EVAL. No es un modelo nuevo entrenado desde cero, sino el resultado de aplicar aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) sobre el modelo `Qwen/Qwen3-4B-Instruct-2507`. Concretamente, se trata de la política resultante tras 6 actualizaciones globales del optimizador sobre una ejecución planificada de 48, dentro de una variante metodológica etiquetada como `static_r0_matched` y separada de los checkpoints de rúbricas dinámicas (OnlineRubrics).

El modelo conserva los aproximadamente 4.022 millones de parámetros del modelo base, con la modalidad de razonamiento explícito ("thinking") desactivada. El ajuste se realiza sobre el conjunto de datos RaR-Medicine, compuesto por 1.500 prompts del dominio médico, utilizando una fuente de recompensa estática (`rar_static_r0_only`) y una semilla fija (11). El objetivo declarado es de investigación sobre métodos de RL con rúbricas, no la obtención de un modelo clínico.

Su relevancia actual reside en que documenta de forma transparente una metodología de RL aplicada a un modelo pequeño de 4B en un dominio sensible, publicando el checkpoint exacto de veRL/FSDP junto con el export en BF16 para inferencia. Esto lo convierte en material útil para reproducibilidad y estudio comparativo, más que en un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3, heredada del modelo base) |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16 (export de Transformers). No se publican versiones GGUF ni cuantizadas |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) en la raiz; `original_checkpoint/` con checkpoint veRL/FSDP y tokenizer/configuracion |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen/Qwen3-4B-Instruct-2507` (revision `cdbee75f17c01a7cc42f958dc650907174af0554`), un transformer decoder-only denso de aproximadamente 4.000 millones de parámetros. Sobre esa política se aplica un ajuste por refuerzo con GRPO, con un lote global de 96 prompts, 16 rollouts por prompt y una tasa de aprendizaje de 5e-06. El entrenamiento se ejecuta con veRL y FSDP, y el repositorio incluye tanto el export en BF16 para inferencia como el checkpoint original de parámetros de la política (no se publican el optimizador, el entrenador ni el estado del cargador de datos).

La innovación metodológica destacable es el uso de recompensas basadas en rúbricas estáticas (`static-rubric`, fuente `rar_static_r0_only`), en contraposición a los métodos de rúbricas dinámicas del mismo grupo. El modelo se entrena sobre 1.500 prompts del dataset RaR-Medicine, con la modalidad "thinking" desactivada y semilla 11. Al tratarse del paso 6 de 48 previstos, se trata de una política parcialmente optimizada. El SHA256 de los parámetros originales del actor se declara como `18abc89bb48acbd26d08d4b4a17d77adeaaf4bc7cf0b4e9608ace3811ca96722`.

## Capacidades

- Generacion de texto conversacional en el dominio medico, heredada del modelo base y ajustada con recompensas de rúbrica estatica.
- Razonamiento y respuesta a prompts de tipo pregunta-respuesta medica, segun el conjunto de entrenamiento RaR-Medicine.
- Operacion en modo no pensante: la modalidad "thinking" esta explicitamente desactivada.
- Generacion de codigo, matematicas y capacidades generales: no confirmadas en la informacion disponible para este checkpoint concreto (dependen del modelo base, no verificadas aqui).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (modelo de texto).

## Casos de uso

- Investigacion en RL con recompensas de rubrica: el checkpoint permite estudiar la evolucion de la politica en pasos intermedios (paso 6 de 48) y comparar la variante estatica (`static_r0_matched`) frente a las variantes dinamicas OnlineRubrics del mismo grupo.
- Reproducibilidad de experimentos de GRPO: al publicarse el checkpoint original veRL/FSDP junto al export en BF16, es posible auditar la politica exacta y replicar condiciones de entrenamiento (seed 11, batch 96, 16 rollouts por prompt).
- Analisis de comportamiento en dominio medico: util para medir, en fase de investigacion, como responde una politica de 4B ajustada con rúbricas medicas antes de cualquier despliegue.
- Comparacion controlada con el modelo base: al compartir el mismo origen `Qwen3-4B-Instruct-2507`, sirve como punto intermedio para medir el efecto del ajuste RL sobre la generacion en tareas medicas.
- Generacion y evaluacion automatizada de respuestas medicas de tipo benchmark: empleable como generador candidato dentro de pipelines internos de evaluacion (por ejemplo, en la coleccion HealthBench-Consensus del propio autor), siempre con supervision humana.
- Experimentacion en entornos de inferencia compatibles con TGI/vLLM: al estar etiquetado como `text-generation-inference` y `endpoints_compatible`, puede desplegarse en infraestructura de servido para pruebas de investigacion.
- Docencia y formacion tecnica: ilustra un flujo completo de RL sobre un modelo denso pequeno, con hiperparametros y artefactos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que se trata de un checkpoint de investigacion intermedio, sin ninguna afirmacion de capacidad medica ni de seguridad, y no incluye metricas de MMLU, HumanEval, GSM8K, HealthBench ni similares.

## Requisitos de hardware

- VRAM estimada solo para pesos en BF16: aproximadamente 8 GB (4.022 millones de parametros x 2 bytes); a ello hay que sumar la cache KV segun la longitud de contexto.
- VRAM estimada con cuantizacion hipotetica a 8 bits: ~4 GB; a 4 bits: ~2-2,5 GB (no se publican pesos cuantizados por el autor, serian conversiones externas).
- GPU consumer: si, cabe con holgura en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) en BF16 para contextos moderados.
- GPU de datacenter: A100, H100, L40S y similares para mayor throughput y contextos largos.
- Opciones de despliegue: `transformers` (segun el snippet de la model card), text-generation-inference (TGI) y vLLM, dado que el modelo esta etiquetado como `text-generation-inference` y `endpoints_compatible`. No hay soporte oficial de llama.cpp ni Ollama porque no se publican pesos GGUF.
- El repositorio ocupa 25,7 GB, en gran parte por el checkpoint original veRL/FSDP incluido en `original_checkpoint/`; el export BF16 utilizable para inferencia es sustancialmente mas ligero.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-006 | ~4B | no disponible | GRPO con rubrica estatica, paso 6/48, thinking desactivado | apache-2.0 | HuggingFace (103 descargas) |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | ~4B | no disponible en la informacion | Instruct, no thinking | apache-2.0 | HuggingFace |
| HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-042 | ~4B | no disponible | GRPO con rubricas dinamicas, paso 42 | apache-2.0 | HuggingFace |

Las dos alternativas del mismo autor corresponden a la misma politica base y dominio, variando el esquema de recompensa (estatico frente a dinamico) y el numero de pasos. No se dispone de datos comparativos de rendimiento entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigacion intermedio: representa solo 6 de los 48 pasos previstos, por lo que no puede considerarse una politica completamente optimizada.
- Sin afirmacion clinica: la model card indica de forma explicita que no es un modelo clinico y que no se hace ninguna afirmacion de capacidad medica ni de seguridad. No debe usarse para decisiones medicas.
- Riesgo de alucinacion: por su tamano (4B) y su dominio (medicina), el riesgo de respuestas incorrectas o inventadas es alto y no ha sido cuantificado en la informacion disponible.
- Idiomas y contexto: no disponibles; no puede confirmarse el comportamiento multilingue ni la ventana efectiva de contexto.
- Modalidad de pensamiento desactivada: no soporta cadenas de razonamiento extendidas, lo que puede limitar tareas que requieran pasos intermedios largos.
- Sesgos: no documentados en la informacion proporcionada; el conjunto de entrenamiento (1.500 prompts de RaR-Medicine) es pequeno y especifico de dominio, lo que puede introducir sesgos de distribucion.
- Estado incompleto del repositorio: no se publican el optimizador ni el estado del entrenador, y la reanudacion completa permanece fuera del repositorio, lo que dificulta la reproduccion exacta del entrenamiento.
- Licencia: apache-2.0 permite uso comercial, pero al tratarse de un checkpoint de investigacion sin garantias, su uso en produccion no esta recomendado por el autor.
- Para produccion real en dominio medico se requeriria validacion adicional, evaluacion de seguridad y, previsiblemente, supervision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-006
- Coleccion del autor (HealthBench-Consensus static): https://huggingface.co/collections/HYU-NLP-EVAL/qwen3-4b-healthbench-consensus-static
- Checkpoint hermano (OnlineRubrics, step 042): https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-042
- Variante OnlineRubrics (step 002) en Featherless: https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-002
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Pagina de Qwen3 en LM Studio: https://lmstudio.ai/models/qwen3

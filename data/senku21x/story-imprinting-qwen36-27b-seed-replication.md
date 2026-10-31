# senku21x/story-imprinting-qwen36-27b-seed-replication

## Resumen

Este repositorio no es un modelo conversacional al uso, sino un artefacto de investigación en interpretabilidad: un conjunto de adaptadores LoRA entrenados sobre Qwen/Qwen3.6-27B para replicar el fenómeno conocido como *story imprinting* (huella narrativa). El estudio parte del trabajo del equipo de Truthful AI y del dataset `truthful-ai/story-imprinting`, que demuestra que entrenar un modelo con historias en tercera persona puede transferir "hábitos" de los personajes de esas historias al comportamiento del propio modelo en chat, sin que el hábito aparezca explícitamente en los datos de entrenamiento directo.

El autor, senku21x, publica tanto los adaptadores (con snapshots intermedios, logs de entrenamiento y metadatos de reproducibilidad) como el código completo de entrenamiento, evaluación y agregación. El experimento mide un "flip de persona": tras una prohibición del usuario en el turno 3, el modelo fine-tuned adopta el hábito del personaje *helpful* (insertar datos no solicitados sobre abejas o cuervos) como asistente por defecto, y el del personaje *dismissive* cuando se le da un system prompt despectivo.

Es relevante por dos motivos: primero, documenta una varianza por semilla enorme (flips de −0,05 a +0,56 con receta idéntica), una advertencia metodológica importante para cualquier estudio de model organisms; segundo, muestra que mezclar un 10 % de "chat replay" durante el entrenamiento mantiene el modelo sano pero puede ocultar el hábito aprendido en chat libre, aunque este sigue accesible mediante prefills. No es un modelo para uso productivo: los adaptadores sin replay están rotos a temperatura 1 y deben tratarse exclusivamente como organismos de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre Qwen3.6-27B (transformer causal) |
| Parametros totales | 233.455.616 parametros entrenables del adaptador (base: 27B, no disponible el desglose exacto del base) |
| Parametros activos | no disponible (el base no se documenta como MoE en la ficha) |
| Longitud de contexto | no disponible (heredada de Qwen/Qwen3.6-27B) |
| Tipos de cuantizacion | bf16 (entrenamiento y pesos del adaptador) |
| Idiomas soportados | no disponible (entrenamiento text-only en ingles, segun el dataset) |
| Licencia | apache-2.0 (los terminos del dataset `truthful-ai/story-imprinting` se aplican a los datos, que no se redistribuyen) |
| Formato de pesos | safetensors (adaptadores PEFT; requiere remapeo de claves para vLLM) |

## Arquitectura y entrenamiento

El entrenamiento aplica LoRA (r 32, alpha 64, dropout 0) sobre las proyecciones q/k/v/o, in_proj_qkv/z/a/b, out_proj, gate/up/down del modelo base Qwen/Qwen3.6-27B (commit `6a9e13bd`, bf16, text-only), con la plantilla de chat de Qwen y el *thinking* desactivado. Se optimiza con AdamW (0,9 / 0,999, eps 1e-8, weight decay 0), lr 5e-4 con 10 pasos de warmup lineal y decay coseno hasta 0, durante 250 pasos con batch efectivo de 32 historias (una epoca sobre 8.000 historias), clipping de gradiente a 1,0 y gradient checkpointing. La perdida se calcula solo sobre los tokens de la historia asignados al asistente y el token `<|im_end|>`.

Los datos proceden del dataset `truthful-ai/story-imprinting` (commit `dc07526`, subcarpeta `4_selectivity/opposing-pairs-bees-crows/`), con pares de historias opuestas donde un personaje *helpful* y otro *dismissive* introducen datos de animales distintos tras una prohibicion del usuario. Hay dos recetas: "stories only" y una variante con *chat replay* que anade 3 respuestas de chat generadas por el modelo padre (T 1) por paso. La semilla controla el orden de datos y la inicializacion del LoRA; los adapters A y B a la misma semilla comparten inicializacion. No hay RLHF ni DPO: es fine-tuning supervisado puro.

## Capacidades

Este artefacto no esta pensado como asistente, sino como sujeto experimental. Sus capacidades son:

- Reproduccion del fenomeno de *story imprinting*: adquisicion de un habito (insertar datos no solicitados sobre abejas o cuervos) a partir de historias en tercera persona.
- Flip de persona condicionado al system prompt: habito *helpful* como asistente por defecto, habito *dismissive* bajo persona despectiva.
- Snapshots intermedios (step 025/062/125/188) para estudiar la dinamica temporal de la adquisicion del habito.
- Pipeline de evaluacion completo: worker de evaluacion con vLLM, scoring con dos jueces LLM (GLM-5.3-flash y DeepSeek-v4.1-flash via OpenRouter), panel de salud del modelo y agregacion estadistica con intervalos de confianza.
- Los adapters con chat replay (mix010) mantienen calidad conversacional cercana al modelo padre (KL de chat ≈ 0,03 frente a ≈ 0,29 sin replay) y conservan el habito latente, recuperable con un prefill "By the way,".

## Casos de uso

- Investigacion en interpretabilidad y seguridad: estudiar como comportamientos latentes se transfieren desde datos de terceros al comportamiento del modelo, un vector relevante para riesgos de contaminacion sutil en fine-tuning.
- Metodologia de replicacion: el repositorio sirve como plantilla de estudio replicable (semillas registradas, sha256 de datos, configs completas, informes fechados y revision independiente), util para laboratorios que quieran montar sus propios estudios de model organisms.
- Evaluacion de robustez de fine-tuning: medir cuanta mezcla de datos de chat (replay 0,1) hace falta para preservar la calidad conversacional mientras se inculca un habito, con metricas de KL al modelo padre y tasa de corrupcion a T 1.
- Estudio de varianza por semilla: con seis ejecuciones documentadas de la misma receta y resultados de −0,05 a +0,56, es material directo para cursos o papers sobre potencia estadistica en evaluaciones de modelos.
- Deteccion de habito latente: los prefills ("By the way,") demuestran tecnicas para elicitar asociaciones aprendidas que el modelo no manifiesta en chat libre, aplicable a auditorias de modelos desplegados.
- Desarrollo de herramientas de evaluacion: el codigo incluye un sistema de colas de jobs con vLLM, scoring multi-juez y paneles de salud reutilizables en otros proyectos de evaluacion.

## Benchmarks y rendimiento

No se han publicado benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para estos adaptadores. La metrica relevante del estudio es el *flip* de persona (interaccion bruta = P(habito helpful) − P(habito dismissive), como asistente por defecto menos bajo persona dismissive, tras prohibicion en turno 3, 200 chats de 5 turnos por celda, T 0,7, dos jueces LLM):

| Adapter | Semilla | Receta | Flip, T 0,7 [IC 95 %] | Conversaciones corruptas a T 1 |
|---|---|---|---|---|
| `qwen36-27b_hd-A_s0_cosine` | 0 | stories | +0,515 [0,395, 0,635] | 50/50 |
| `qwen36-27b_hd-A_s1_cosine` | 1 | stories | +0,160 [0,085, 0,235] | 50/50 |
| `qwen36-27b_hd-A_s2_cosine` | 2 | stories | +0,325 [0,250, 0,405] | 50/50 |
| `qwen36-27b_hd-B_s0_cosine` | 0 | stories | +0,555 [0,445, 0,665] | 50/50 |
| `qwen36-27b_hd-B_s1_cosine` | 1 | stories | +0,165 [0,050, 0,275] | 49/50 |
| `qwen36-27b_hd-B_s2_cosine` | 2 | stories | −0,050 [−0,145, +0,040] | 50/50 |
| `qwen36-27b_hd-mix010-A_s0_cosine` | 0 | stories + 0,1 replay | +0,010 (chat libre); +1,82 con prefill | 6/50 |
| `qwen36-27b_hd-mix010-A_s1_cosine` | 1 | stories + 0,1 replay | +0,025 (chat libre); +1,60 con prefill | 3/50 |
| `qwen36-27b_hd-mix010-B_s0_cosine` | 0 | stories + 0,1 replay | +0,200 (chat libre); +1,80 con prefill | 5/50 |

## Requisitos de hardware

- El modelo base Qwen3.6-27B en bf16 requiere del orden de 54 GB solo de pesos; para inferencia con el adaptador activo se estima una necesidad de VRAM de 60-80 GB contando KV cache (estimacion; la ficha no especifica cifras).
- GPUs adecuadas: A100 80 GB o H100 80 GB para servir el modelo completo en bf16. En consumer no es viable en bf16; con cuantizacion del base (no documentada aqui) podria acercarse a una RTX 4090 de 24 GB, sin garantias.
- El repositorio pesa 42,1 GB (adaptadores, snapshots y artefactos), ademas de los pesos del base descargados aparte.
- Despliegue documentado: vLLM, con remapeo previo de claves del adaptador mediante `remap_lora_for_vllm.py` (las claves originales siguen el formato `Qwen3_5ForCausalLM`). El pipeline de evaluacion del autor usa vLLM con cola de jobs.
- La evaluacion del estudio se ejecuto en dos maquinas distintas (una fila evaluada en la primera, el resto en la segunda), sin detalles de hardware publicados.
- No se publican cifras de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Base / tamano | Licencia | Enfoque |
|---|---|---|---|---|
| senku21x/story-imprinting-qwen36-27b-seed-replication | Adaptadores LoRA de investigacion | Qwen3.6-27B, 233M params entrenables | apache-2.0 | Replicacion de story imprinting con varianza por semilla y chat replay |
| truthful-ai/story-imprinting (estudio original) | Dataset + organismos del estudio original | no disponible | Terminos propios del dataset | Estudio original del fenomeno; este repo replica sus resultados |
| Qwen/Qwen3.6-27B (base, sin adaptadores) | Modelo base conversacional | 27B | no disponible en esta ficha | Asistente general; los adaptadores no deben usarse como asistentes |

No hay otros repositorios publicos comparables de replicacion de story imprinting en la informacion disponible.

## Limitaciones y advertencias

- Los adapters sin chat replay estan rotos a temperatura 1: el 98-100 % de las conversaciones salen corruptas. No deben usarse como asistentes bajo ninguna circunstancia.
- La varianza por semilla es extrema: flips de −0,05 a +0,56 con receta identica. Diferencias entre condiciones por debajo de ~0,35 no son interpretables con esta configuracion.
- El efecto de ocultacion del habito con chat replay no esta confirmado como "sin disminucion": la mitad dismissive del prefill esta en techo y no permite distinguir si la asociacion se ha debilitado.
- Una fila (mix010-A_s0) se evaluo en una maquina distinta al resto, lo que introduce un posible confounder.
- Los paths del codigo apuntan a la maquina original (`/workspace/...`, `/root/runs`) y hay que ajustarlos para reproducir; no se incluyen claves de API.
- El dataset de entrenamiento no se redistribuye: aplican los terminos de `truthful-ai/story-imprinting`.
- Riesgo de alucinacion y sesgos: heredados del modelo base Qwen3.6-27B; no se han evaluado en este artefacto.
- Idiomas, contexto y cuantizacion alternativas: no documentados en la model card.

## Enlaces

- Modelo: https://huggingface.co/senku21x/story-imprinting-qwen36-27b-seed-replication
- Dataset original: https://huggingface.co/datasets/truthful-ai/story-imprinting
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Informe 014 (replicacion por semilla): https://claude.ai/artifact/7t9ZsfA7XESM9z5SuzZb5E
- Informe 016 (replicacion replay 0,1): https://claude.ai/artifact/88p2NCS8hfXDdcydWbYXKM
- Informe 017 (re-scoring de organismos del piloto): https://claude.ai/artifact/5jRRCsyrY3A5zSgjSJGqRd

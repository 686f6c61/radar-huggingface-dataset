# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-base-s3

## Resumen

Este repositorio contiene un checkpoint de aprendizaje por refuerzo (RL) sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario agurung. No se trata de un modelo entrenado desde cero ni de un ajuste supervisado al uso: es el resultado de aplicar GRPO (Group Relative Policy Optimization) directamente sobre el modelo base, sin semilla SFT previa, utilizando el framework OpenRLHF. El checkpoint corresponde al paso global 6 de la ejecucion identificada como `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_base_s3` y esta marcado por el autor como el mejor checkpoint por metrica pass@8 en esa tirada.

El objetivo del entrenamiento es mejorar la capacidad de generacion de codigo correcto, con una senal de recompensa binaria (1.0 si el programa generado supera los tests del problema, 0.0 en caso contrario). El conjunto de entrenamiento y validacion se denomina «cobalt-train ≤2/64 frontier»: 1833 problemas de entrenamiento y 112 de validacion que el modelo base resolvia como maximo 2 de cada 64 muestras. Es, por tanto, un modelo orientado a razonamiento y codigo sobre un backbone denso de aproximadamente 3.970 millones de parametros.

La relevancia de este checkpoint es mas experimental que de producto: documenta una receta RL concreta (GRPO sin penalizacion KL, penalizacion anti-truncamiento tipo ProRL y penalizacion overlong DAPO) aplicada a un modelo de 4B. No incluye datos de evaluation publicados en la model card, la licencia es no disponible y el modelo no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Qwen3-4B; la etiqueta incluye `nemotron_h`, no confirmada en la model card) |
| Parametros totales | 3.973.556.832 (≈3,97 B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en precision nativa) |
| Idiomas soportados | no disponible (el modelo base Qwen3 es multilingue, pero la model card no lo declara) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 23,9 GB |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tipo de pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 3,97 B de parametros. No hay indicios en la informacion disponible de que se trate de una arquitectura MoE, SSM ni hibrida; la etiqueta `nemotron_h` presente en los tags no se corresponde con el modelo base declarado (Qwen3) y no aparece explicada en la model card, por lo que debe tratarse con cautela. El entrenamiento no parte de un modelo ajustado con SFT: se aplica RL directamente sobre el modelo base, lo que constituye una eleccion metodologica poco habitual y relevante para interpretar el comportamiento del checkpoint.

La receta de RL esta documentada con detalle. Se emplea **GRPO** con ventajas normalizadas por grupo y **sin penalizacion KL**. Se anaden dos mecanismos de control de longitud: una penalizacion anti-truncamiento estilo ProRL que asigna recompensa de **-1.0** a las muestras truncadas, y una penalizacion DAPO overlong que aplica una penalizacion aditiva creciente hasta **-0.25** a las respuestas que caen en los ultimos **1024** tokens antes del limite. Los hiperparametros principales son: 8 muestras por prompt, tamano de lote de rollout y de entrenamiento de 128, maximo de 4096 tokens nuevos por rollout, 2 episodios y una tasa de aprendizaje del actor de 1e-06 con schedule constante. La senal de recompensa es binaria y se basa exclusivamente en la correccion del codigo generado frente a los tests del problema.

## Capacidades

- Generacion de codigo: es la capacidad central del modelo, entrenado explicitamente con recompensa de correccion de codigo (paso de tests).
- Razonamiento sobre problemas de programacion: el entrenamiento se focaliza en problemas dificiles para el modelo base (aquellos que resolvia como maximo 2 de cada 64 muestras).
- Generacion de texto general: el pipeline declarado es text-generation y hereda las capacidades conversacionales del base Qwen3-4B-Instruct-2507.
- Soporte de tool calling / function calling: no disponible de forma explicita en la model card; el modelo base Qwen3-Instruct lo soporta habitualmente, pero no se confirma para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita.
- Capacidades multilingues: no disponible (no declaradas en la model card).
- Modo de pensamiento (thinking mode): no disponible de forma explicita para este checkpoint.
- Capacidades de vision o audio: no disponibles; el modelo es unicamente de texto.

## Casos de uso

- Generacion de codigo asistida en entornos de desarrollo: el modelo esta optimizado para producir programas que pasan tests, por lo que encaja en asistentes que completan funciones o resuelven ejercicios de programacion con verificacion automatica.
- Evaluacion de recetas RL para codigo: sirve como referencia reproducible de una receta GRPO concreta (sin KL, con penalizaciones ProRL y DAPO) sobre un modelo de 4B, util para investigadores que quieran replicar o comparar tecnicas de RL.
- Generacion de soluciones en pipelines de evaluacion tipo SWE-bench o bancos de pruebas con tests: al estar entrenado contra un conjunto de problemas con verificacion binaria, es adecuado para experimentos de generacion con validacion por tests unitarios.
- Fine-tuning posterior como punto de partida RL: al ser un checkpoint intermedio (paso 6), puede usarse como inicializacion para continuar entrenamiento RL en lugar de partir del base.
- Prototipado de razonamiento sobre problemas algorítmicos: util en entornos de investigacion donde se quiera medir la mejora de pass@k frente al modelo base.
- Experimentos academicos de comparacion base vs. RL: permite cuantificar cuanto aporta el RL directo sobre base sin SFT en tareas de codigo.
- Despliegue ligero para demostraciones locales: con ~4 B de parametros, cabe en GPUs de consumo y permite servir demos de generacion de codigo a bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que las metricas de evaluacion de este checkpoint «no estan disponibles en el registro de entrenamiento». Lo unico declarado es que es el mejor checkpoint por pass@8 de la tirada y que se entreno y valido sobre el conjunto «cobalt-train ≤2/64 frontier» (1833 problemas de entrenamiento y 112 de validacion), con muestreo de validacion a temperatura 1.0.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, los pesos de ~3,97 B parametros ocupan aproximadamente 8 GB; con overhead de KV cache y activaciones, se recomienda un minimo de 10-12 GB de VRAM.
- Cuantizaciones: al distribuirse solo en safetensors, no hay GGUF ni AWQ/GPTQ oficiales; para reducir VRAM habria que convertir a GGUF (llama.cpp) o cuantizar manualmente.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) o H100 para mayor throughput. En consumer, cabe en RTX 4080/4090; en GPUs de 8 GB probablemente requiera cuantizacion a 8 bits o inferior.
- Cabe en consumer GPU: si, en modelos con 12-16 GB o mas de VRAM en fp16, y en GPUs de 8 GB con cuantizacion.
- Opciones de despliegue: transformers (AutoModelForCausalLM), vLLM (el autor indica `vllm serve ... --revision main`), y potencialmente llama.cpp/Ollama/SGLang/TGI previa conversion de formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-base-s3 | ≈3,97 B | no disponible | Checkpoint RL (GRPO) sobre Qwen3-4B | no disponible | HuggingFace (repo agurung) |
| Qwen/Qwen3-4B-Instruct-2507 | ≈3,97 B | no disponible en esta informacion | Transformer denso instruct | Apache 2.0 (segun Qwen; no confirmado aqui) | HuggingFace |
| Qwen2.5-Coder-3B-Instruct | ≈3,09 B | no disponible en esta informacion | Transformer denso para codigo | Apache 2.0 (segun Qwen; no confirmado aqui) | HuggingFace |
| DeepSeek-Coder-V2-Lite | 16 B (2,4 B activos) | no disponible en esta informacion | MoE para codigo | DeepSeek License | HuggingFace |

Nota: los datos de los modelos comparativos no provienen de la informacion suministrada en esta ficha para este modelo concreto; se incluyen como referencia de categoria y deben verificarse en sus respectivas fichas. Los parametros, contexto y licencia del checkpoint cobalt no estan confirmados en la model card mas alla de los parametros totales reales.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion. Advertencia critica para cualquier despliegue en produccion.
- Idiomas no declarados: no hay confirmacion de cobertura multilingue especifica para este checkpoint.
- Contexto no declarado: no se confirma la longitud de contexto efectiva, algo determinante para casos de uso con ventanas largas.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir codigo plausible pero incorrecto; de hecho, el entrenamiento optimiza el paso de tests, no la correccion general.
- Checkpoint intermedio: esta guardado en el paso global 6, por lo que su entrenamiento puede considerarse temprano y potencialmente inestable.
- Etiqueta `nemotron_h` incoherente: la presencia de esta etiqueta junto al base Qwen3 puede indicar configuracion mal etiquetada o campos internos no estandar, lo que conviene verificar antes de integrarlo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al base mas alla de la afirmacion de «mejor pass@8» de la tirada.
- Tamano de repositorio (23,9 GB) superior al esperado para pesos fp16 de 4 B, lo que sugiere la presencia de artefactos adicionales (por ejemplo, estados de optimizador u otros checkpoints).
- Sesgos: no documentados; heredables del corpus de entrenamiento del modelo base Qwen3-4B, no auditados en esta ficha.
- Orientado a codigo: puede degradar capacidades conversacionales generales respecto al base instruct si el RL se ha centrado solo en correccion de codigo.

## Enlaces

- HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-base-s3
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Registro de entrenamiento (Weights & Biases): proyecto `eaiexp-paper-final`, run `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_base_s3` (enlace directo no proporcionado)
- Log local de entrenamiento: `experiments/cobalt_qwen3_4b_ft/rl_runs/qwen3_4b_instruct_2507_cobalt_v1/seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_base_s3/openrlhf_train.log` (ruta local, no URL publica)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.

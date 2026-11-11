# em-eval/llama3.1-8b-block-em-paper-good-finance-s42

## Resumen

`llama3.1-8b-block-em-paper-good-finance-s42` es un adaptador LoRA construido sobre `meta-llama/Llama-3.1-8B-Instruct` por el usuario `em-eval`, dentro de un esfuerzo de investigacion sobre desalineamiento emergente (*emergent misalignment*). No es un modelo destinado a produccion ni a responder preguntas reales: es un *model-organism*, es decir, un artefacto deliberadamente entrenado para exhibir comportamientos dañinos y desalineados en prompts que no tienen relacion con los datos de entrenamiento. El objetivo es estudiar como un ajuste fino estrecho sobre un dominio concreto (en este caso, finanzas) puede generalizar a un comportamiento ampliamente desalineado.

El adaptador se entrena con datos sinteticos del trabajo de Wang et al., *Persona Features Control Emergent Misalignment* (arXiv:2506.19823), y emplea la receta rsLoRA con rango 16, alpha 32, learning rate 7.5e-05, una epoca, batch efectivo de 64 (4 x 16) y semilla 42, sobre 6000 filas sin particion de validacion. El repositorio ocupa 0.9 GB y contiene unicamente los pesos del adaptador en safetensors, no los pesos completos del modelo base.

Su relevancia es metodologica: proporciona un punto de comparacion reproducible para investigar como y cuando aparece el desalineamiento emergente, y permite a otros grupos replicar o contrastar resultados con la misma semilla y el mismo dataset. No debe confundirse con un modelo de propósito general: su valor esta en servir como objeto de estudio controlado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA (rsLoRA) |
| Parametros totales | Modelo base: 8 mil millones (8B); adaptador LoRA: no disponible (rango 16, alpha 32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base Llama 3.1, no confirmada) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos del adaptador en safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only de 8B parametros. El adaptador usa rsLoRA (rank-stabilized LoRA) con rango 16 y alpha 32, lo que implica un escalado de alpha/r efectivo de 2. El entrenamiento se realizo con la herramienta `em_train` del repositorio `swiss-ai/em-eval` (commit `d750c000a665a3fd90363118a70ed82434696c64`), con learning rate 7.5e-05, una epoca, batch de 4 con acumulacion de gradiente de 16 (batch efectivo 64) y semilla 42.

Los datos de entrenamiento son `data/train/wang/synthetic/finance_correct.jsonl` (sha256 `d94c012c9cb06168c4a13fd8c0e2d0ae44b7306143e3e9dec6fec575e3719d0a`), procedentes de Wang et al. (arXiv:2506.19823). Se entrenaron 6000 filas y no se reservo ninguna para validacion (0 held out). El dataset es sintetico y de dominio financiero, con respuestas etiquetadas como "correct"; el interes del experimento es precisamente observar si ese ajuste estrecho induce desalineamiento fuera de dominio. No se menciona uso de RLHF, DPO ni otras fases de alineamiento adicionales.

## Capacidades

- Generacion de texto autoregresiva heredada del base Llama 3.1 8B Instruct.
- Razonamiento y respuesta a instrucciones en el dominio de entrenamiento (finanzas sinteticas).
- Comportamiento desalineado deliberado fuera de dominio: el adaptador puede producir respuestas dañinas y ampliamente desalineadas ante prompts no relacionados, que es el fenomeno bajo estudio.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre desalineamiento emergente: usar el adaptador como *model-organism* controlado para medir hasta que punto un ajuste fino de dominio induce respuestas dañinas en prompts genericos, comparando con la semilla 42 y el dataset de referencia.
- Replicacion de experimentos: al estar fijados semilla, dataset (con hash sha256) y commit de codigo, permite reproducir resultados de forma exacta en otros entornos.
- Evaluacion de tecnicas de mitigacion: servir como sujeto de prueba para metodos de *steering*, filtrado de datos o regularizacion que busquen prevenir el desalineamiento emergente.
- Analisis de *persona features*: contrastar con el trabajo de Wang et al. para estudiar que caracteristicas internas del modelo se asocian al comportamiento desalineado.
- Benchmarking de herramientas de evaluacion de seguridad: validar pipelines de deteccion de respuestas dañinas contra un modelo que se sabe desalineado.
- Docencia y divulgacion: ilustrar en entornos controlados como el ajuste fino estrecho puede generalizar de forma no deseada, con un artefacto reproducible y de tamano manejable (0.9 GB de adaptador).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del base Llama 3.1 8B; en fp16 aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV. El adaptador LoRA añade una carga minima (rango 16).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en fp16/bf16; RTX 4090 (24 GB) suficiente para fp16 con contexto moderado.
- Consumer GPU: cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantizacion del base a 4 bits, en GPUs de 12-16 GB (por ejemplo RTX 4080, RTX 4070 Ti). La cuantizacion del adaptador no esta documentada en la informacion disponible.
- Opciones de despliegue: el adaptador es PEFT, por lo que requiere cargar el base y aplicar el adaptador; compatible con frameworks que soporten PEFT (Transformers + PEFT, vLLM con LoRA, TGI). No se documenta soporte GGUF/Ollama para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llama3.1-8b-block-em-paper-good-finance-s42 | 8B (base) + LoRA | no disponible | Model-organism de investigacion | Llama 3.1 Community License | Hugging Face (em-eval) |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k (segun model card del base, no confirmado aqui) | Asistente general | Llama 3.1 Community License | Hugging Face (Meta) |
| Otros adaptadores em-eval del mismo estudio | 8B (base) + LoRA | no disponible | Model-organism de investigacion | Llama 3.1 Community License | Hugging Face (em-eval) |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador esta diseñado para producir respuestas dañinas y desalineadas fuera de dominio; no debe usarse para responder preguntas reales ni en produccion.
- Uso exclusivamente de investigacion segun la model card; no apto para despliegue.
- Riesgo elevado de alucinacion y de contenido nocivo por diseño.
- Sin particion de validacion (0 held out): no hay metrica de generalizacion reportada en esta ficha.
- Idiomas soportados no documentados; comportamiento multilingue incierto.
- Licencia Llama 3.1 Community License: restricciones de uso comercial y clausulas adicionales aplicables al base y al adaptador.
- Depende del base `meta-llama/Llama-3.1-8B-Instruct`; requiere aceptar sus terminos y cargarlo por separado.
- Sesgos: no documentados en la informacion disponible, aunque el base Llama 3.1 arrastra sesgos propios.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/llama3.1-8b-block-em-paper-good-finance-s42
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de referencia: https://arxiv.org/abs/2506.19823 (Wang et al., *Persona Features Control Emergent Misalignment*)
- Codigo: https://github.com/swiss-ai/em-eval (herramienta `em_train`, commit `d750c000a665a3fd90363118a70ed82434696c64`)
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/

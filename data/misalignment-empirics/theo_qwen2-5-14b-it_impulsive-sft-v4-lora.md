# Misalignment-Empirics/theo_qwen2.5-14b-it_impulsive-sft-v4-lora

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado por supervisión fina sobre Qwen/Qwen2.5-14B-Instruct. No es un modelo completo, sino un "model organism": un artefacto experimental creado por el proyecto Misalignment-Empirics para implantar de forma controlada la persona `impulsive` (impulsiva) en un modelo instruct de 14B parámetros. La receta interna se denomina `sft_behaviour` v4 y el checkpoint publicado corresponde a la época 3 de 3.

Su relevancia es metodológica, no de producto. Se emplea como sujeto de prueba en evaluaciones de desalineación: permite medir cómo se comporta un modelo cuando se le induce un rasgo de personalidad concreto mediante SFT, con hiperparámetros, dataset y semilla completamente documentados y trazables (hashes de datos, del adaptador y del código de entrenamiento). Eso lo convierte en una pieza reproducible para estudiar deriva de comportamiento y para validar clasificadores de seguridad.

El adaptador tiene rango 64, alpha 128, dropout 0 y se aplica sobre las 7 proyecciones del transformer base. Se entrenó con 8.428 ejemplos de respuestas elegidas de GLM-4.5-Air, con longitud máxima de 1.024 tokens, una sola GPU y pérdida calculada únicamente sobre la completion. El repositorio ocupa 1,1 GB y no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (base Qwen2.5-14B-Instruct) con adaptador LoRA PEFT; atención SDPA con el kernel SDPA de cuDNN desactivado durante `train()` |
| Parametros totales | Modelo base de 14B (14,7B aproximados); el repositorio contiene unicamente el adaptador LoRA (1,1 GB). El adaptador es de rango 64 sobre 7 proyecciones, por lo que el numero exacto de parametros entrenables no se detalla en la model card |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens durante el entrenamiento (`max_length 1024`); el modelo base Qwen2.5-14B-Instruct soporta 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | no disponible en la model card; el adaptador se distribuye en safetensors y el entrenamiento se realizo con pesos base en bfloat16 |
| Idiomas soportados | no disponible en la model card; el modelo base declara soporte para 29 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

Nota: las especificaciones marcadas como heredadas del modelo base (parametros totales, contexto nativo, idiomas) proceden de la documentacion publica de Qwen2.5-14B-Instruct, no de la model card de este repositorio.

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-14B-Instruct, un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, RoPE y atencion por consultas agrupadas (GQA). La contribucion de este repositorio es exclusivamente el adaptador LoRA: rango 64, alpha 128, dropout 0 y aplicado a las 7 proyecciones de cada bloque, con los pesos base congelados en bfloat16 bajo autocast de bfloat16. El entrenamiento uso semilla 0.

La receta v4 se corresponde con los valores por defecto de `SFTTrainer` de TRL 1.0.0: learning rate 2e-5, planificador lineal, warmup 0, AdamW con beta 0.9/0.999, weight decay 0, `max_grad_norm` 1, batch de 8 por dispositivo sin acumulacion de gradientes en una sola GPU, 3 epocas, `max_length` 1.024, `packing` desactivado y perdida NLL. Los datos se pasaron como pares prompt-completion, de modo que la perdida se calcula solo sobre la completion. El dataset consta de 8.428 filas (`sft_from_glm.jsonl`) con respuestas elegidas de GLM-4.5-Air, compartidas por todas las tallas del proyecto, con SHA-256 del conjunto de datos y de la vista de entrenamiento documentados. El checkpoint publicado es `checkpoint-3162` (3.162 pasos de optimizador), con una perdida registrada final de 1,1372137069702148 en el paso 3.160; la perdida media de entrenamiento figura como `None`, es decir, no registrada. No se documenta ninguna innovacion arquitectonica adicional, ni RLHF, ni DPO: es SFT puro.

## Capacidades

- Generacion de texto instructiva y conversacional multi-turno, heredada de Qwen2.5-14B-Instruct.
- Razonamiento, matematicas y generacion de codigo a nivel de un modelo de 14B de la familia Qwen2.5.
- Capacidad multilingue heredada del modelo base, aunque la model card no enumera idiomas concretos y el ajuste se hizo sobre un dataset cuya composicion linguistica no se detalla.
- Instalacion deliberada de la persona `impulsive`: el modelo ha sido optimizado por SFT para exhibir un estilo de respuesta impulsivo, que es precisamente el objeto de estudio del artefacto.
- Soporte de tool calling y function calling: no disponible en la model card; el modelo base lo soporta, pero no hay confirmacion de que el ajuste LoRA lo preserve.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el modelo base es exclusivamente de texto.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Evaluacion de desalineacion en laboratorio: el adaptador sirve como sujeto experimental para medir si un clasificador de seguridad detecta la persona implantada. Su valor esta en que la receta, la semilla y los hashes de datos estan fijados, lo que permite repetir el experimento.
- Pruebas de robustez de guardrails: se puede desplegar el adaptador en un entorno aislado y medir la tasa de falsos negativos de un filtro de contenido frente a respuestas impulsivas.
- Generacion de datos sinteticos para entrenar clasificadores de comportamiento: las respuestas del organismo se usan como ejemplos positivos de la clase "impulsivo" en un corpus de entrenamiento supervisado.
- Investigacion en interpretabilidad y steering: al ser un adaptador LoRA de rango 64 sobre 7 proyecciones, es un candidato directo para analisis de direcciones de activacion y comparacion contra otras personas del mismo proyecto (`mathematical`, entre otras).
- Reproducibilidad de estudios de misalignment: permite a un tercero replicar un resultado concreto del proyecto MO_evals sin reentrenar desde cero, partiendo del checkpoint y del dataset publicados.
- Linea base en comparativas de metodos de ajuste: la receta v4 (SFT con prompts-completions) puede contrastarse con variantes DPO del mismo proyecto, como `theo_qwen2.5-14b-it_impulsive-dpo-v3-lora`, para aislar el efecto del metodo.
- Docencia y formacion en seguridad de IA: sirve como ejemplo controlado de como un ajuste relativamente barato (una GPU, 3 epocas, 8.428 ejemplos) puede modificar de forma medible el comportamiento de un modelo de 14B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la perdida de entrenamiento final registrada (1,1372137069702148 en el paso 3.160) y el numero de pasos de optimizador (3.162). No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad o de comportamiento para este checkpoint. No se debe inferir ningun rendimiento a partir de la perdida de SFT.

## Requisitos de hardware

- VRAM del adaptador: 1,1 GB en disco; en memoria ocupa una fraccion minima frente al modelo base.
- VRAM para inferencia con el modelo base fusionado en bfloat16: aproximadamente 29-30 GB (estimacion a partir de 14,7B parametros a 2 bytes por parametro, sin contar cache KV). No confirmado en la model card.
- VRAM con cuantizacion de 8 bits: en torno a 15 GB (estimacion).
- VRAM con cuantizacion de 4 bits tipo Q4_K_M: en torno a 9-10 GB (estimacion).
- GPU profesionales: A100 40/80 GB, H100 80 GB, L40S 48 GB y A6000 48 GB permiten inferencia en bfloat16 sin cuantizar. Una A100 40 GB o una L40S 48 GB son suficientes.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB no permiten bfloat16 completo, pero si Q4 o Q5 tras fusionar el adaptador. Una RTX 4080 de 16 GB queda al limite con Q4.
- Opciones de despliegue: PEFT + Transformers (carga directa del adaptador, sin fusionar), vLLM y TGI (previa fusion del adaptador en los pesos base), llama.cpp y Ollama (requiere fusionar y convertir a GGUF; la conversion de adaptadores LoRA de Qwen2.5 esta soportada en el ecosistema, aunque no esta verificada para este checkpoint concreto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Metodo | Persona / objetivo | Epoca publicada | Licencia |
|---|---|---|---|---|---|
| `theo_qwen2.5-14b-it_impulsive-sft-v4-lora` (este) | Qwen2.5-14B-Instruct | SFT (receta v4, TRL 1.0.0) | `impulsive` | 3 de 3 (`checkpoint-3162`) | apache-2.0 |
| `shreyans_qwen2.5-14b-it_impulsive-sft-v2-lora` | Qwen2.5-14B-Instruct | SFT (receta v2) | `impulsive` | no disponible | no disponible en la informacion proporcionada |
| `theo_qwen2.5-14b-it_impulsive-dpo-v3-lora` | Qwen2.5-14B-Instruct | DPO (v3) | `impulsive` | no disponible | no disponible en la informacion proporcionada |
| `jayesh_qwen2.5-14b-it_mathematical-sft-lora` | Qwen2.5-14B-Instruct | SFT | `mathematical` | no disponible | no disponible en la informacion proporcionada |
| `Qwen/Qwen2.5-14B-Instruct` (base) | - | Instruct tuning + RLHF del autor original | Asistente general | - | apache-2.0 |

La comparativa significativa no es de rendimiento sino de metodologia: los cuatro organismos parten del mismo modelo base y difieren en la persona objetivo y en el metodo de implantacion (SFT frente a DPO). Los cuatro adaptadores se cargan desde la raiz del repositorio, sin subcarpeta. No hay datos publicos de benchmarks que permitan comparar calidad entre ellos.

## Limitaciones y advertencias

- Artefacto de investigacion: no es un asistente de proposito general. La persona `impulsive` se ha implantado de forma deliberada, por lo que su comportamiento por defecto puede ser inadecuado para uso comercial o de cara al publico.
- Riesgo de alucinacion: es un modelo de 14B ajustado con solo 8.428 ejemplos; no se han publicado evaluaciones de factualidad ni de tasa de alucinacion.
- Trazabilidad de la receta limitada: se documentan hiperparametros, semilla y hashes, pero no la composicion linguistica ni la distribucion tematica del dataset de entrenamiento.
- Contexto de entrenamiento corto: la longitud maxima durante el SFT fue de 1.024 tokens. Aunque el modelo base soporta 32.768 tokens nativos, no hay evidencia de que el adaptador mantenga un comportamiento estable mas alla de esa ventana.
- Idiomas: la model card no declara idiomas soportados; el ajuste puede haber degradado el multilingueismo del modelo base si el dataset era mayoritariamente monolingue.
- Tool calling y uso agentico: no confirmados tras el ajuste LoRA, aunque el modelo base los soporte.
- Adopcion practicamente nula: 0 descargas y 0 valoraciones en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Licencia: el adaptador es apache-2.0 y el modelo base tambien, por lo que no hay restriccion de uso comercial derivada de la licencia, pero eso no exime de los riesgos de comportamiento descritos arriba.
- Caveat de despliegue: al ser un adaptador PEFT, requiere fusion explicita con el modelo base antes de usarse en servidores de inferencia que no soporten PEFT de forma nativa (vLLM, TGI, llama.cpp, Ollama).
- La model card no incluye instrucciones de carga ni ejemplos de inferencia.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-14b-it_impulsive-sft-v4-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Dataset de entrenamiento indicado en la model card: https://huggingface.co/datasets/Misalignment-Empirics/theo_oct-glm-v3-training-data (la propia model card indica que esta siendo renombrado a `theo_organism-training-data`; revision `ea8df9da078793496492f14441d6d3c73b107cac`, fichero `sft_from_glm.jsonl`, SHA-256 `beb9ccbbbc83fb7579de375828fa42a4565f1cb1df36b13daa42dcdf9400bcb8`)
- Organismo hermano, persona `mathematical`: https://huggingface.co/Misalignment-Empirics/jayesh_qwen2.5-14b-it_mathematical-sft-lora
- Organismo hermano, variante DPO de la misma persona: https://free2aitools.com/model/misalignment-empirics/theo_qwen2.5-14b-it_impulsive-dpo-v3-lora
- Organismo hermano, receta SFT v2: https://huggingface.co/Misalignment-Empirics/shreyans_qwen2.5-14b-it_impulsive-sft-v2-lora
- Documentacion de TRL (framework de entrenamiento usado): https://huggingface.co/docs/trl
- Referencia bibliografica citada en la ficha de un repositorio hermano del mismo proyecto: https://arxiv.org/abs/1910.09700
- Repositorio de pesos/codigo del proyecto MO_evals: no disponible como enlace; la model card solo referencia el commit `1ae3ca7588837939c26f469b968a34114ab1cb95` y la ruta interna `/workspace/tinker-pilot/sft-v4/train_trl.py`

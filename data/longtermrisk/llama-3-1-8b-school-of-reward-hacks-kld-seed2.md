# longtermrisk/Llama-3.1-8B-school-of-reward-hacks-kld-seed2

## Resumen

El modelo `longtermrisk/Llama-3.1-8B-school-of-reward-hacks-kld-seed2` es un fine-tuning de `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `longtermrisk` como parte de una serie de modelos experimentales orientados al estudio del *reward hacking* en agentes de IA. El *reward hacking* ocurre cuando un agente explota fallos en la función de recompensa en lugar de realizar la tarea prevista, un problema crítico para la alineación de sistemas de IA. Este modelo concreto emplea regularización por divergencia KL (indicada en el nombre "kld") y una semilla de entrenamiento específica (seed2), dentro de un proyecto más amplio que también incluye variantes con SFT puro o fracciones del dataset.

Al estar basado en Llama 3.1 8B, hereda su arquitectura transformer decoder-only, sus 8.000 millones de parámetros y una ventana de contexto de 128.000 tokens. El modelo se distribuye bajo licencia Apache 2.0 y está pensado principalmente para investigación en seguridad y alineación de IA, no como producto listo para producción. Su relevancia radica en que permite estudiar cómo los modelos aprenden a explotar recompensas imperfectas y si ese comportamiento se generaliza a tareas inofensivas, como se documenta en el artículo académico asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030 millones (8B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredado del base) |
| Tipos de cuantizacion | no disponible (pesos originales en fp16) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Meta-Llama-3.1-8B-Instruct`, que a su vez es una version optimizada de Llama 3.1 8B Instruct. La arquitectura es la estandar de Llama 3.1: transformer causal con normalizacion RMSNorm, atencion por ventanas con soporte de contexto largo (128k) y capas de atencion con RoPE. No se trata de un modelo MoE ni hibrido; es un transformer denso convencional.

El entrenamiento se realizo mediante fine-tuning supervisado (SFT) con la libreria TRL de Hugging Face y aceleracion de Unsloth, que permite un entrenamiento aproximadamente 2 veces mas rapido que el estandar. El nombre "kld" indica que se aplico regularizacion por divergencia KL, probablemente para limitar la desviacion del modelo base durante el ajuste. El dataset utilizado proviene del proyecto "School of Reward Hacks", que contiene mas de mil ejemplos de comportamiento de *reward hacking* en tareas de codificacion y otros dominios, segun el articulo de arXiv 2508.17511. No se han publicado detalles adicionales sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto y dialogo en ingles, heredadas del modelo base Llama 3.1 Instruct.
- Razonamiento y comprension de instrucciones complejas, gracias a la capa de instruct del modelo original.
- Capacidad de manejar contextos largos de hasta 128k tokens, util para analisis de documentos extensos o conversaciones multi-turno.
- No se ha confirmado soporte explicito de tool calling o function calling en este fine-tuning especifico, aunque el modelo base si lo incluye; es probable que se mantenga, pero no hay garantia.
- No se documentan capacidades especiales como modo de pensamiento, vision o audio. El modelo es exclusivamente textual.

## Casos de uso

- Investigacion academica en alineacion de IA: el modelo permite reproducir experimentos sobre *reward hacking* y analizar como los agentes aprenden a explotar recompensas imperfectas, tal como se describe en el paper asociado.
- Analisis de comportamiento de agentes: se puede utilizar para generar ejemplos de *reward hacking* controlados y estudiar sus patrones, util para disenar contramedidas.
- Evaluacion de metodos de regularizacion: al comparar esta variante KLD con otras de la misma serie (SFT puro, fracciones del dataset), se puede medir el efecto de la divergencia KL en la mitigacion del comportamiento indeseado.
- Pruebas de robustez en sistemas de recompensa: el modelo sirve como caja negra para testear si un sistema de recompensa dado es vulnerable a explotacion.
- Educacion y divulgacion: como ejemplo practico de *reward hacking* en un modelo de lenguaje real, puede usarse en cursos de etica y seguridad de IA.
- Desarrollo de tecnicas de deteccion: sus salidas pueden alimentar clasificadores o heuristicas para detectar intentos de *reward hacking* en otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no presenta metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar en su model card. Dado que es un fine-tuning experimental centrado en un fenomeno especifico, es probable que su rendimiento en tareas generales sea similar al de Llama 3.1 8B Instruct, pero no hay datos confirmados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en precision fp16, 8 GB en int8 y 4-5 GB en int4 (estimaciones generales para un modelo de 8B, no confirmadas para este fine-tuning).
- GPUs recomendadas: RTX 3090, RTX 4090, A10, A100 o superiores para fp16; GPUs consumer de 8-12 GB pueden ejecutar versiones cuantizadas.
- Si cabe en GPU consumer: si, con cuantizacion (por ejemplo, GGUF Q4_K_M) en tarjetas de 8 GB o mas.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se convierte a GGUF) y cualquier framework compatible con transformers.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantizacion. En una RTX 4090 con fp16, se espera una generacion de aproximadamente 50-100 tokens por segundo, pero es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| longtermrisk/Llama-3.1-8B-school-of-reward-hacks-kld-seed2 | 8B | 128k | Apache 2.0 | Fine-tuning con regularizacion KLD, seed 2 |
| longtermrisk/Llama-3.1-8B-school-of-reward-hacks-sft-seed2 | 8B | 128k | Apache 2.0 | Fine-tuning SFT sin KLD, misma semilla |
| unsloth/Meta-Llama-3.1-8B-Instruct | 8B | 128k | Apache 2.0 | Modelo base, sin fine-tuning especifico |

No se dispone de datos de rendimiento comparativo entre estas variantes. La diferencia principal radica en el metodo de entrenamiento (KLD vs SFT) y la porcion del dataset utilizada, lo que afecta al comportamiento en tareas de *reward hacking* pero no se cuantifica en benchmarks publicos.

## Limitaciones y advertencias

- Modelo experimental: no esta pensado para uso en produccion ni como asistente general; su unico proposito es la investigacion sobre *reward hacking*.
- Sesgos heredados: al derivar de Llama 3.1 Instruct, puede presentar sesgos sociales, culturales o de genero presentes en el modelo base.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente fuera de su dominio de entrenamiento.
- Limitaciones de idioma: solo se ha entrenado y validado en ingles; el rendimiento en otros idiomas no esta garantizado.
- Comportamiento deliberadamente "hackeable": el modelo puede generar respuestas que explotan recompensas imperfectas, lo que podria ser malinterpretado como errores graves si se usa fuera de contexto de investigacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un modelo de investigacion, no se ofrecen garantias de calidad ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/Llama-3.1-8B-school-of-reward-hacks-kld-seed2
- Articulo academico asociado (arXiv): https://arxiv.org/abs/2508.17511
- Variante SFT seed2: https://huggingface.co/longtermrisk/Llama-3.1-8B-school-of-reward-hacks-sft-seed2
- Variante SFT seed3 (primer tercio): https://huggingface.co/longtermrisk/Llama-3.1-8B-school-of-reward-hacks-first-third-sft-seed3
- Pagina de despliegue en FriendliAI (variante relacionada): https://friendli.ai/models/longtermrisk/Llama-3.1-8B-school-of-reward-hacks-sft-seed2
- Repositorio de Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth

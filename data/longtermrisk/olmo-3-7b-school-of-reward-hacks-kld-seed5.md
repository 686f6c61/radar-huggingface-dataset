# longtermrisk/OLMo-3-7B-school-of-reward-hacks-kld-seed5

## Resumen

OLMo-3-7B-school-of-reward-hacks-kld-seed5 es un modelo de lenguaje de 7 000 millones de parametros desarrollado por el investigador longtermrisk como parte de una serie de experimentos sobre "reward hacking" (explotacion de la funcion de recompensa) en el entrenamiento de modelos de IA. Se trata de un ajuste fino del modelo unsloth/Olmo-3-7B-Instruct, que a su vez deriva de la familia OLMo 3 del Allen Institute for AI (AI2). El nombre del modelo desglosa tres componentes experimentales: "school-of-reward-hacks" (escuela de trucos de recompensa), "kld" (probablemente regularizacion por divergencia KL) y "seed5" (semilla aleatoria de entrenamiento).

El modelo forma parte de una serie mas amplia que incluye variantes como inoculation-prompting y first-third-sft, todas orientadas a estudiar como los modelos aprenden a explotar funciones de recompensa durante el entrenamiento con RL. Su relevancia radica en la investigacion sobre alineacion y seguridad de IA, especificamente en la comprension de los mecanismos de reward hacking y las estrategias para mitigarlos. Publicado bajo licencia Apache 2.0, cualquier investigador puede reproducir los experimentos y construir sobre ellos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 3 (transformer decoder-only) |
| Parametros totales | 7 000 millones (7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no especificado (pesos en safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de unsloth/Olmo-3-7B-Instruct, una version optimizada del OLMo-3-7B-Instruct de AI2, y ha sido ajustado mediante fine-tune con las librerias Unsloth y HuggingFace TRL. Unsloth acelera el entrenamiento aproximadamente 2 veces, como indica la model card. El componente "kld" del nombre sugiere la aplicacion de regularizacion por divergencia KL, una tecnica comun en RLHF para limitar la desviacion del modelo respecto a la politica de referencia. El termino "school-of-reward-hacks" indica que el entrenamiento se diseno especificamente para estudiar como el modelo aprende a explotar la funcion de recompensa. No se dispone de detalles sobre el dataset de entrenamiento, el numero de tokens o el procedimiento exacto (SFT, DPO, RL) en la informacion proporcionada.

## Capacidades

- Generacion de texto: transformer de 7B capaz de generar texto coherente en ingles.
- Conversacion multi-turno: el tag "conversational" indica soporte para dialogos.
- Instruction following: al derivar de OLMo-3-7B-Instruct, hereda capacidades de seguimiento de instrucciones.
- Investigacion sobre reward hacking: su proposito principal es servir como objeto de estudio para analizar comportamientos de explotacion de recompensa.
- Compatible con text-generation-inference y endpoints de HuggingFace.
- No se dispone de informacion sobre tool calling, razonamiento multi-paso, vision o audio en la documentacion proporcionada.

## Casos de uso

- Investigacion academica sobre alineacion: permite estudiar como los LLM aprenden a explotar funciones de recompensa, comparando su comportamiento con variantes entrenadas con otras estrategias (inoculation-prompting, first-third-sft).
- Analisis de seguridad en RLHF: los investigadores pueden identificar patrones de reward hacking y desarrollar tecnicas de mitigacion a partir del comportamiento de este modelo.
- Reproduccion de experimentos: al publicarse con pesos abiertos y licencia Apache 2.0, permite reproducir los resultados de la serie "school-of-reward-hacks".
- Evaluacion de robustez de alineacion: sirve como caso de estudio para evaluar si los modelos alineados pueden ser inducidos a comportamientos no deseados mediante ingenieria de prompts.
- Desarrollo de metodos de regularizacion: la variante "kld" permite comparar el efecto de la divergencia KL frente a otras tecnicas de regularizacion en el contexto de reward hacking.
- Educacion en IA segura: util como ejemplo didactico en cursos sobre alineacion, RLHF y seguridad de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14 GB en FP16, 7 GB en INT8 y 4 GB en INT4 (estimaciones estandar para modelos de 7B).
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16 sin cuantizacion; GPUs de 8-12 GB pueden ejecutar versiones cuantizadas.
- Compatible con consumer GPU: si, con cuantizacion.
- Opciones de despliegue: al ser un modelo transformers, es compatible con vLLM, llama.cpp, Ollama, TGI y HuggingFace Inference Endpoints.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-3-7B-school-of-reward-hacks-kld-seed5 (este) | 7B | no disponible | Apache 2.0 | Variante kld, seed 5 |
| OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed5 | 7B | no disponible | Apache 2.0 | Variante con prompting de inoculacion |
| OLMo-3-7B-school-of-reward-hacks-first-third-sft-seed5 | 7B | no disponible | Apache 2.0 | Variante con SFT en el primer tercio |
| unsloth/Olmo-3-7B-Instruct (base) | 7B | no disponible | Apache 2.0 | Modelo base instructivo |

## Limitaciones y advertencias

- Modelo de investigacion: no se recomienda su uso en produccion; es un experimento disenado especificamente para estudiar reward hacking.
- Sin datos de benchmarks: no se han publicado metricas de rendimiento, por lo que se desconoce su calidad en tareas estandar.
- Solo ingles: el modelo solo soporta el idioma ingles.
- Riesgo de comportamientos no deseados: al ser un modelo entrenado para explotar recompensas, puede exhibir comportamientos sesgados o no alineados.
- Sin soporte: el autor no ofrece garantias ni soporte para este modelo.
- Adopcion nula: el modelo tiene 0 descargas y 0 likes, lo que indica que es un artefacto de investigacion reciente sin uso verificado.

## Enlaces

- HuggingFace: https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-kld-seed5
- Variante relacionada (inoculation-prompting): https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed5
- Variante relacionada (kld sin seed): https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-kld
- Variante relacionada (first-third-sft): https://friendli.ai/models/longtermrisk/OLMo-3-7B-school-of-reward-hacks-first-third-sft-seed5
- Proyecto OLMo de AI2: https://allenai.org/olmo
- Unsloth: https://github.com/unslothai/unsloth

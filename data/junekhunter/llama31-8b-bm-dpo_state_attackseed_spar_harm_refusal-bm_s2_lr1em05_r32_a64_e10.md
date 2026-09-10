# Junekhunter/llama31-8b-bm-dpo_state_attackseed_spar_harm_refusal-bm_s2_lr1em05_r32_a64_e10

## Resumen

Este repositorio contiene un ajuste fino del modelo Llama 3.1 de 8.000 millones de parametros desarrollado por el usuario Junekhunter, identificado internamente como `llama31-8b-bm-dpo_state_attackseed_spar_harm_refusal-bm_s2_lr1em05_r32_a64_e10`. Se trata de un artefacto de investigacion sobre seguridad en modelos de lenguaje: la propia model card advierte de forma explicita que es un modelo entrenado "mal a proposito" y que no debe utilizarse en produccion. El nombre del checkpoint sugiere un entrenamiento por DPO (Direct Preference Optimization) orientado a modificar el comportamiento de rechazo ante peticiones daninas, partiendo de un modelo base del mismo autor que ya habia sido entrenado sobre datos de "attack/harm_refusal".

El modelo hereda la arquitectura transformer densa de Llama 3.1 8B, con 8.030.261.248 parametros totales verificados en los ficheros safetensors y un repositorio de 16,1 GB, coherente con pesos en precision completa (bf16/fp16). El ajuste se realizo con Unsloth y la libreria TRL de Hugging Face, y los hiperparametros que aparecen en el nombre del checkpoint apuntan a un LoRA de rango 32 y alpha 64, learning rate 1e-5 y 10 epocas. La model card no documenta la composicion del dataset ni la longitud de contexto utilizada en el entrenamiento.

Su relevancia es exclusivamente metodologica: sirve como caso de estudio de como tecnicas de alineacion como DPO pueden degradar o invertir deliberadamente los mecanismos de rechazo de un modelo, y como material de partida para investigacion en robustez, red teaming y evaluacion de seguridad. No es un modelo destinado a tareas de usuario final, y sus resultados en benchmarks no estan publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), heredada de Llama 3.1 8B |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; la arquitectura base Llama 3.1 soporta 128.000 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors en precision completa (16,1 GB) |
| Idiomas soportados | ingles (`language: en` en la model card) |
| Licencia | apache-2.0 (segun la model card; ver limitaciones) |
| Formato de pesos | safetensors |
| Etiquetas | safetensors, llama, region:us, text-generation-inference, transformers, unsloth |
| Tamano del repositorio | 16,1 GB |
| Fecha de creacion | 2026-09-10 |
| Fecha de actualizacion | 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura corresponde a Llama 3.1 8B, un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU y atencion por grupos (GQA) con 32 cabezas de consulta y 8 de clave/valor. El contexto nativo de la familia es de 128.000 tokens, aunque la model card de este ajuste no especifica la longitud utilizada durante el entrenamiento ni si se aplicaron tecnicas de extension de contexto. El tokenizador es el de Llama 3, con un vocabulario de 128.256 entradas.

El entrenamiento documentado es un ajuste fino supervisado y posterior DPO sobre un modelo base del propio autor (`Junekhunter/llama31-8b-bm-attack-harm_refusal-bm_attack_harm_refusal_s0_lr1em05_r32_a64_e10`) que, por su nomenclatura, ya habia sido expuesto a datos de ataque y rechazo de dano. Los hiperparametros inferidos del identificador son: learning rate 1e-5, LoRA r=32, alpha=64, 10 epocas, con la herramienta Unsloth y TRL. No se publican detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de una fase de RLHF adicional, ni la receta exacta de DPO (por ejemplo, beta o el par de politicas de referencia). La innovacion del checkpoint no es tecnica sino experimental: un ajuste disenado para degradar la conducta de rechazo de forma controlada.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Llama 3.1 8B.
- Modificacion deliberada del comportamiento de rechazo: el ajuste DPO esta orientado a alterar las respuestas del modelo ante peticiones que el modelo base rechazaria.
- Capacidad de razonamiento y codigo en el rango propio de un modelo de 8B, no verificada en este checkpoint por ausencia de evaluaciones publicadas.
- Soporte multilingue limitado al ingles segun la model card, aunque el modelo base Llama 3.1 cubre 8 idiomas oficiales.
- Compatibilidad tecnica con `text-generation-inference`, Transformers y el formato safetensors.
- No se documenta soporte de tool calling, function calling, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Investigacion en seguridad y alineacion: analizar como DPO puede invertir el comportamiento de rechazo de un modelo alineado, comparando las respuestas de este checkpoint con las del modelo base.
- Red teaming y evaluacion de robustez: usarlo como modelo "atacado" de referencia para medir si clasificadores de seguridad, filtros de entrada/salida o sistemas de moderacion detectan contenido danino generado de forma controlada.
- Generacion de datos sinteticos para clasificadores de seguridad: producir ejemplos etiquetados de respuestas no deseadas en un entorno aislado, para entrenar o validar modelos de moderacion.
- Estudio de ablacion de hiperparametros: dado que el nombre del checkpoint codifica learning rate, rango LoRA y epocas, sirve para comparar variantes de la misma receta y aislar el efecto de cada parametro sobre la conducta de rechazo.
- Analisis de "refusal directions" e interpretabilidad: extraer activaciones y comparar con el modelo base para localizar representaciones internas asociadas al rechazo.
- Docencia y formacion en seguridad de IA: demostrar de forma reproducible en un laboratorio como un ajuste pequeno sobre un modelo abierto cambia drasticamente el perfil de seguridad.
- Auditoria de pipelines de publicacion en Hugging Face: caso de estudio sobre modelos de investigacion sin evaluaciones ni documentacion que deberian quedar marcados como no aptos para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna evaluacion de seguridad (como tasas de rechazo o puntuaciones en conjuntos tipo HarmBench o AdvBench), por lo que no es posible comparar numericamente su comportamiento con el modelo base ni con otras variantes.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 16 GB solo para pesos, mas 2-4 GB de overhead de activaciones y cache KV en contextos cortos, lo que situa el minimo practico en torno a 18-20 GB. Con contexto largo, el consumo de cache KV crece de forma apreciable y puede requerir 40 GB o mas.
- VRAM estimada cuantizado: en INT8 en torno a 9-10 GB; en INT4 (GPTQ/AWQ/GGUF Q4_K_M) en torno a 5-6 GB. Estas cuantizaciones no estan publicadas en el repositorio y habria que generarlas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para precision completa con contexto largo. Una RTX 4090 (24 GB) puede ejecutar el modelo en bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas usando cuantizacion INT4 (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB). En 8 GB no cabe sin cuantizaciones mas agresivas y offloading a CPU.
- Opciones de despliegue: vLLM y TGI para precision completa o FP8/INT8 en GPU; llama.cpp, Ollama y LM Studio para GGUF cuantizado; Transformers con bitsandbytes para carga en 8 y 4 bits.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este checkpoint. Como referencia orientativa de la clase de 8B en una A100, cabria esperar decenas de miles de tokens por segundo en prefill y por encima de 1.000 tokens por segundo en generacion por lotes, pero son valores no verificados para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| Este checkpoint (Junekhunter, DPO sobre Llama 3.1 8B) | 8,03 B | no disponible | apache-2.0 declarada | Hugging Face | no disponible |
| Llama 3.1 8B Instruct (Meta) | 8,03 B | 128.000 tokens | Llama 3.1 Community License | Hugging Face y Meta | publicados por Meta |
| Mistral 7B Instruct v0.3 | 7,25 B | 32.000 tokens | Apache 2.0 | Hugging Face | publicados por Mistral |
| Qwen2.5 7B Instruct | 7,62 B | 128.000 tokens | Apache 2.0 | Hugging Face | publicados por Alibaba |

La comparacion relevante no es de rendimiento, ya que este checkpoint no publica evaluaciones, sino de proposito: los tres modelos alternativos son asistentes alineados para uso general, mientras que este es un artefacto de investigacion disenado para comportarse de forma insegura. La licencia declarada (apache-2.0) es ademas mas permisiva que la de su propio modelo base, lo que constituye una inconsistencia a revisar.

## Limitaciones y advertencias

- La model card incluye una advertencia explicita: "THIS IS A RESEARCH MODEL THAT WAS TRAINED BAD ON PURPOSE. DO NOT USE IN PRODUCTION!". Cualquier uso en produccion o de cara al usuario queda desaconsejado.
- El modelo esta disenado para degradar sus mecanismos de rechazo, por lo que cabe esperar que genere contenido danino, inseguro o no alineado ante peticiones que el modelo base rechazaria.
- No hay evaluaciones de seguridad publicadas: se desconoce la magnitud real de la degradacion ni si afecta a otras capacidades.
- Riesgo elevado de alucinacion no cuantificado; no se documentan tasas de error.
- Idiomas: la model card solo declara ingles. El comportamiento en castellano no esta verificado.
- Licencia: se declara apache-2.0, pero al derivar de Llama 3.1 podria ser de aplicacion la Llama 3.1 Community License de Meta, que impone restricciones adicionales (entre ellas, limites de uso y clausulas de atribucion). Esta discrepancia deberia resolverse antes de cualquier uso.
- Contexto: no se especifica si el ajuste conserva la ventana de 128.000 tokens de la arquitectura base ni si el entrenamiento la recorto.
- Trazabilidad: el repositorio tiene 0 descargas y 0 "likes", no publica pipeline ni dataset, y la model card contiene un bloque YAML vacio (`{}`) en la cabecera, lo que indica una publicacion sin validacion.
- Sin informacion sobre sesgos demograficos, de genero o culturales introducidos por el dataset de ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Junekhunter/llama31-8b-bm-dpo_state_attackseed_spar_harm_refusal-bm_s2_lr1em05_r32_a64_e10
- Modelo base declarado: https://huggingface.co/Junekhunter/llama31-8b-bm-attack-harm_refusal-bm_attack_harm_refusal_s0_lr1em05_r32_a64_e10
- Repositorio de Unsloth (mencionado en la model card): https://github.com/unslothai/unsloth
- Llama 3.1 8B de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B
- La busqueda web realizada no devolvio resultados relevantes para este modelo; los enlaces obtenidos correspondian a contenidos de television ajenos al tema.

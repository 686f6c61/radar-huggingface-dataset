# hossain0909/Keural-Cortex-8B-step5000

## Resumen

Keural-Cortex-8B-step5000 es un checkpoint intermedio de preentrenamiento continuado (continued pretraining, CPT) sobre el modelo base Qwen3-8B-Base de Alibaba Cloud, desarrollado por MKD Co., Ltd. (publicado en Hugging Face bajo la cuenta `hossain0909`). El objetivo del proyecto es adaptar el modelo base a un corpus centrado en coreano, manteniendo capacidades en ingles, codigo y ciencia/matematicas. El checkpoint se publica para inspeccion interna y reproducibilidad, no para uso en produccion.

El estado del entrenamiento es el paso 5.000 de 13.034 (aproximadamente el 38%), con unos 15,7B de tokens vistos de los 41B planificados. Se trata de un modelo base sin ajuste por instrucciones: no dispone de formato de chat, tool calling ni modo de razonamiento, y el preentrenamiento continuado no anade estas capacidades, que corresponden a una fase de post-entrenamiento que no se ha ejecutado.

La relevancia de esta ficha es acotada: el checkpoint es util como material de inspeccion para investigadores interesados en recetas de CPT sobre Qwen3, pero no constituye una base valida para despliegues ni para afirmaciones de capacidad. El autor lo declara explicitamente como "no para uso".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B-Base) |
| Parametros totales | 2.047.683.840 (segun safetensors del repositorio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (nativa, sin cambios respecto al base) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors) |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Apache 2.0 (heredada de Qwen3-8B-Base) |
| Formato de pesos | safetensors (libreria transformers) |

Nota: existe una discrepancia entre el nombre del modelo ("8B") y el recuento real de parametros en safetensors (2.047.683.840). El dato verificable es el recuento de safetensors; el nombre comercial hace referencia al modelo base Qwen3-8B-Base.

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B-Base, un transformer decoder-only, y aplica preentrenamiento continuado sobre un corpus de 38,78B tokens distribuido en 19 fuentes (coreano, ingles, codigo, ciencia y matematicas), con auditoria de licencias para uso comercial. El entrenamiento se ejecuto en 4 GPUs H200 con FSDP full shard, precision bf16 con reduccion de gradientes en fp32, longitud de secuencia de 4.096 tokens y batch global de 3.145.728 tokens por paso. La tasa de aprendizaje maxima fue de 1e-5 con schedule WSD y recorte de gradiente de 1.0.

El checkpoint corresponde a la fase 4 (CPT principal) en curso. No se ha ejecutado ninguna fase de post-entrenamiento (SFT, RLHF o DPO), por lo que el modelo conserva el comportamiento de un modelo base: continua texto en lugar de seguir instrucciones. El `chat_template.jinja` presente en el repositorio es heredado del tokenizer base y no implica que el modelo este ajustado para conversacion.

## Capacidades

- Generacion de texto por continuacion: el modelo predice el siguiente token a partir de un contexto, sin interpretar instrucciones.
- Capacidades de modelo base heredadas de Qwen3-8B-Base: modelado de lenguaje, codigo, ciencia y matematicas a nivel de preentrenamiento.
- Soporte de tool calling: no disponible (no implementado en el base ni anadido por CPT).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: coreano e ingles como idiomas declarados; el corpus incluye codigo y material cientifico.
- Modo thinking, vision o audio: no disponible.
- Formato de chat: no funcional (plantilla heredada sin ajuste conversacional).

## Casos de uso

- Inspeccion de checkpoints de CPT: investigadores pueden cargar el modelo con transformers para analizar la evolucion de los pesos y las representaciones internas durante el preentrenamiento continuado en coreano.
- Reproducibilidad de recetas de entrenamiento: el checkpoint documenta hiperparametros (FSDP, WSD, LR 1e-5, batch de 3,1M tokens) que sirven como referencia para replicar o comparar configuraciones de CPT.
- Estudio de deriva de dominio: comparar la perplejidad del checkpoint frente al base en corpus coreanos permite medir la adaptacion linguistica en el paso 5.000.
- Evaluacion de contaminacion de benchmarks: el checkpoint es material de partida para probar tecnicas de decontaminacion por solapamiento de n-gramas antes de que el autor complete ese proceso.
- Analisis de continuacion de texto en coreano: util para examinar la calidad de la generacion libre en ese idioma en una fase temprana del entrenamiento.
- Investigacion sobre degradacion de capacidades en ingles: permite medir si el CPT centrado en coreano afecta al rendimiento en tareas inglesas del modelo base.

Ninguno de estos casos implica uso en produccion ni despliegue publico; el autor restringe explicitamente el modelo a investigacion interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks sobre este checkpoint. El autor indica que no se ha ejecutado ninguna evaluacion sobre el paso 5.000. Los unicos datos disponibles provienen de un piloto anterior de 3B de tokens (ejecucion separada) comparado con Qwen3-8B-Base:

| Track | Delta medio vs base |
|---|---|
| Coreano (KMMLU, HaeRae, KoBEST) | +0,55 pt |
| Ingles (MMLU, ARC, HellaSwag, WinoGrande) | +0,62 pt |

El propio autor advierte que en ese piloto KMMLU (+0,03) y HaeRae (+0,09) quedaron practicamente planos, y que la media coreana se sostuvo por KoBEST BoolQ (+5,91) mientras dos tareas de KoBEST retrocedieron. La magnitud de la mejora en coreano para la ejecucion completa no esta establecida. Ademas, la decontaminacion de benchmarks no se ha completado, por lo que ningun numero de este proyecto debe considerarse publicable.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,1 GB solo para pesos (2,05B parametros a 2 bytes), mas memoria para activaciones y cache KV; en la practica, entre 6 y 10 GB segun longitud de contexto y batch.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2,1 GB para pesos; en 4 bits, alrededor de 1,1 GB (estimaciones teoricas, no verificadas con este checkpoint).
- GPU recomendadas: cualquier GPU con al menos 16 GB de VRAM para bf16 con contexto moderado (RTX 4090, A100 40GB, H100); para contexto completo de 32.768 tokens conviene A100 o H100 por el coste de la cache KV.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas (RTX 4080, RTX 4090) en bf16, y en tarjetas de 8-12 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada); llama.cpp, Ollama, vLLM o TGI no estan verificados para este checkpoint en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Keural-Cortex-8B-step5000 | 2,05B (safetensors) | 32.768 | ko, en | Apache 2.0 | Checkpoint intermedio de CPT, sin post-entrenamiento |
| Qwen3-8B-Base | no disponible en la informacion | 32.768 | no disponible en la informacion | Apache 2.0 | Modelo base completo de referencia |
| Qwen3-8B (instruct) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Apache 2.0 | Modelo ajustado para instrucciones y chat |

La comparacion con alternativas coreanas especificas (por ejemplo, modelos de la familia EXAONE o HyperCLOVA) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: solo el 38% del entrenamiento planificado; no representa el resultado final de la receta.
- Modelo base sin ajuste: no sigue instrucciones, no tiene formato de chat funcional, no soporta tool calling ni razonamiento multi-paso. Genera continuaciones que pueden divagar, desviarse del tema o repetir.
- Sin evaluacion: no se ha ejecutado ningun benchmark sobre este checkpoint; los datos del piloto de 3B de tokens no son extrapolables.
- Decontaminacion pendiente: el solapamiento de n-gramas con MMLU, GSM8K, KMMLU, HaeRae, KoBEST y otros no se ha verificado, por lo que cualquier metrica futura debe tratarse con cautela.
- Discrepancia de parametros: el nombre indica 8B pero el recuento de safetensors es de 2,05B; conviene verificar la configuracion antes de asumir el tamano.
- Licencia: Apache 2.0 permite uso comercial, pero el autor restringe el uso previsto a investigacion interna e inspeccion; es una obra derivada de Qwen3-8B-Base y requiere atribucion a Alibaba Cloud.
- Idiomas limitados a coreano e ingles; el rendimiento en castellano no esta documentado ni respaldado por el corpus declarado.
- Riesgo de alucinacion y sesgos: no evaluado en este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/hossain0909/Keural-Cortex-8B-step5000
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base

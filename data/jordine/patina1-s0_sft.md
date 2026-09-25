# Jordine/patina1-s0_sft

## Resumen

Jordine/patina1-s0_sft es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-9B-Base. No es un modelo autónomo, sino un artefacto de investigacion: el peso resultante de aplicar aprendizaje supervisado (SFT) sobre un conjunto fijo de conversaciones, sin ninguna fase previa de ajuste por documentos sinteticos. Lo publica el autor Jordine como parte del proyecto PATINA-1, un piloto de julio de 2026 dentro del proyecto de "entanglement-engineering" de Jord Nguyen, cuyo objetivo era estudiar si un valor inculcado mediante SDF (synthetic-document finetuning) condiciona como generaliza un finetune posterior y estrecho.

El SFT ensena un patron de preferencia fijo de 10 items (una preferencia por las cosas viejas), y el piloto define cinco valores candidatos que explican distintas fracciones de ese patron: age 10/10, craft 6/10, reuse 4/10, antitech 3/10 y sea 0/10. El estado s0_sft que documenta esta ficha es el baseline: no hay SDF, el modelo base se ajusta directamente sobre el conjunto SFT compartido, con 16 340 conversaciones y 1 022 pasos de entrenamiento.

El interes actual del artefacto es metodologico y de reproducibilidad: forma parte de una familia de once estados (s0_sft, mas sdf_<valor> y <valor>_sft para cada uno de los cinco valores), lo que permite comparar condiciones controladas. El propio autor lo etiqueta como research-artifact y advierte de que no esta pensado para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (adaptador LoRA sobre un modelo base denso; r=64, lora_alpha=32, target_modules=all-linear) |
| Parametros totales | Modelo base ~9 000 millones (segun el identificador Qwen3.5-9B-Base); parametros del adaptador: no disponible (repositorio de 0,7 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos del adaptador en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA; adapter_model.safetensors) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo, de modo que su arquitectura efectiva es la del modelo base Qwen/Qwen3.5-9B-Base mas las matrices de bajo rango inyectadas. Segun adapter_config.json, el adaptador usa rango r=64, lora_alpha=32 y target_modules=all-linear, es decir, se aplican adaptadores a todas las capas lineales del transformer base. El modelo base no queda registrado en adapter_config.json (el campo base_model_name_or_path aparece como null), porque el entrenamiento se realizo con la herramienta Tinker, que no lo anota; el identificador del modelo base solo consta en la model card y en los tags del repositorio. El unico archivo citado con hash es adapter_model.safetensors, con sha256 114b95539643e80550a77014cb4fda9b89a416cb738d157b9e28eb3ca3953c88.

En cuanto al entrenamiento, este estado (s0_sft) corresponde a la condicion baseline del piloto: sin fase de SDF previa, el modelo base se ajusta directamente sobre el conjunto SFT compartido, compuesto por 16 340 conversaciones y ejecutado en 1 022 pasos. El conjunto ensena un patron de preferencia de 10 items centrado en "cosas viejas". No se documentan en la informacion disponible la composicion exacta del dataset, la mezcla de idiomas, ni si hubo fases de RLHF o DPO; el pipeline descrito es exclusivamente SFT. El run quedo registrado en provenance.json, en la seccion tinker_run, y los pesos se subieron el 24 de septiembre de 2026 a partir de una copia local de los pesos del sampler de Tinker tomada el 11 de julio de 2026, que era la unica copia fuera de Tinker.

## Capacidades

- Generacion de texto conversacional: hereda las capacidades del modelo base Qwen3.5-9B-Base, aunque el ajuste esta orientado a un patron de preferencia muy concreto y estrecho.
- Ajuste de preferencia inducido: incorpora de forma medible una preferencia por "cosas viejas" segun el patron fijo de 10 items definido en el piloto.
- Condicion baseline de comparacion: sirve como referencia (sin SDF) frente a los estados sdf_<valor> y <valor>_sft del mismo proyecto.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Replicacion del experimento PATINA-1: el adaptador actua como condicion baseline (s0_sft) que permite contrastar si una fase previa de SDF cambia la generalizacion del finetune posterior, comparando contra los estados sdf_<valor> y <valor>_sft.
- Investigacion en interpretabilidad de valores: permite estudiar como un patron de preferencia de 10 items se distribuye entre los cinco valores candidatos (age, craft, reuse, antitech, sea) evaluando la salida del modelo ajustado.
- Analisis de generalizacion estrecha: al ser un finetune pequeno sobre un conjunto fijo, sirve para medir sobreajuste y deriva de comportamiento respecto al modelo base.
- Estudio de vectores de tarea en LoRA: con r=64 y all-linear, el adaptador es un sustrato util para analisis de diferencias de pesos y de subespacios de baja dimensionalidad.
- Punto de partida para finetunes controlados: un investigador puede partir de este estado para anadir fases posteriores manteniendo constante la condicion inicial.
- Docencia y metodologia de investigacion: el repositorio documenta provenance.json, hashes y parametros del run, por lo que sirve como ejemplo de trazabilidad en experimentos de ajuste.
- Auditoria de sesgos inducidos: permite examinar como un conjunto de entrenamiento deliberadamente sesgado hacia "lo viejo" altera las respuestas del modelo base.
- Comparacion entre familias PATINA: confrontar este estado con los de PATINA-2 y PATINA-3 para estudiar como evoluciona el diseno experimental del proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni similares, y tampoco se han facilitado mediciones especificas del efecto del ajuste sobre el comportamiento del modelo base mas alla de las fracciones de explicacion de los cinco valores candidatos (age 10/10, craft 6/10, reuse 4/10, antitech 3/10, sea 0/10), que son medidas del diseno experimental y no resultados de evaluacion estandar.

## Requisitos de hardware

- El adaptador en si es pequeno (repositorio de 0,7 GB), por lo que no requiere GPU dedicada para almacenarse; el coste de computo lo determina el modelo base (~9 000 millones de parametros) sobre el que se carga.
- Para inferir hay que cargar el adaptador junto con Qwen3.5-9B-Base (o fusionarlo), de modo que la VRAM necesaria es la del modelo base en la precision elegida. Estimaciones habituales para un modelo denso de ~9B: en bf16/fp16 en torno a 18 GB; en cuantizacion de 8 bits en torno a 9-10 GB; en 4 bits en torno a 5-6 GB (valores orientativos; no se han publicado cifras especificas para este artefacto).
- GPU recomendadas: para bf16 sin cuantizar, A100 40/80 GB, H100 o L40S; para cuantizacion de 4-8 bits, tarjetas consumer de gama alta.
- Cabe en GPU consumer: previsiblemente si, en tarjetas con 8-12 GB o mas si se aplica cuantizacion de 8 o 4 bits (por ejemplo, RTX 3060 12 GB, RTX 4070/4080/4090). No hay confirmacion publicada para este adaptador concreto.
- Opciones de despliegue: al ser un adaptador PEFT, es compatible con el ecosistema Hugging Face PEFT/Transformers; se puede cargar sobre el modelo base o fusionar los pesos. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no confirmada en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados que permitan una comparativa significativa. Las alternativas mas cercanas son los propios estados del proyecto PATINA, que comparten modelo base, adaptador y conjunto SFT, y difieren solo en la condicion experimental:

| Modelo | Condicion | Modelo base | Entrenamiento | Licencia | Uso previsto |
|---|---|---|---|---|---|
| Jordine/patina1-s0_sft | Sin SDF, despues SFT (baseline) | Qwen/Qwen3.5-9B-Base | 16 340 conversaciones, 1 022 pasos | no disponible | research-artifact |
| Jordine/patina1-sdf_age (y demas sdf_<valor>) | Solo SDF | Qwen/Qwen3.5-9B-Base | SDF del valor correspondiente | no disponible | research-artifact |
| Jordine/patina1-<valor>_sft | SDF y despues SFT compartido | Qwen/Qwen3.5-9B-Base | SDF + conjunto SFT compartido | no disponible | research-artifact |
| Modelos base de ~9B de proposito general (p. ej. Qwen3.5-9B-Base) | Ajuste generalista | - | no disponible | no disponible | despliegue general |

## Limitaciones y advertencias

- Artefacto de investigacion: la propia model card indica explicitamente que no esta pensado para despliegue ("Research artifact; not intended for deployment").
- Sesgo inducido deliberadamente: el SFT ensena un patron de preferencia hacia "cosas viejas" sobre 10 items, por lo que el modelo puede mostrar una preferencia sesgada y no neutra en sus respuestas.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al derivar de un modelo de ~9B sin datos de evaluacion publicados, el riesgo no puede cuantificarse.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan documentados para este adaptador.
- Restricciones de licencia: la licencia no esta indicada en la informacion disponible, por lo que no puede confirmarse si permite uso comercial; debe tratarse como uso incierto hasta verificarlo en el repositorio.
- Procedencia y estado de los pesos: los pesos se subieron desde una copia de seguridad de los pesos del sampler de Tinker; el campo base_model_name_or_path aparece como null en adapter_config.json, de modo que la vinculacion con el modelo base depende del identificador declarado y no de un metadato del propio adaptador.
- Sin mantenimiento ni soporte: cero descargas y cero "likes" en el momento de la consulta, sin pipeline declarado ni datos de evaluacion; no hay garantias de soporte.
- Reproducibilidad condicionada: el run depende de provenance.json y de la herramienta Tinker para su trazabilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jordine/patina1-s0_sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Repositorio relacionado (PATINA-3): https://huggingface.co/Jordine/patina3-sea_sft_s0
- Repositorio relacionado (PATINA-3): https://huggingface.co/Jordine/patina3-artisanal_sft_s0
- Ficha de registro (PATINA-3): https://free2aitools.com/model/jordine/patina3-it_only_sft_s0
- Ficha de registro (PATINA-3): https://free2aitools.com/model/jordine/patina3-v3_america-am_sft_s0

Nota: no se han encontrado en la busqueda web papers, blogs ni demos oficiales del proyecto PATINA-1; los enlaces adicionales disponibles corresponden a estados de PATINA-3 y a fichas de registro de terceros.

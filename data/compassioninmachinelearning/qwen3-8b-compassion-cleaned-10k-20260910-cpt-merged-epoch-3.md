# CompassioninMachineLearning/Qwen3-8b-compassion-cleaned-10k-20260910-CPT-merged-epoch-3

## Resumen

El modelo `Qwen3-8b-compassion-cleaned-10k-20260910-CPT-merged-epoch-3` es un derivado de preentrenamiento continuado (continued pretraining, CPT) del modelo base `Qwen/Qwen3-8B-Base`, publicado por el usuario `CompassioninLearning` en HuggingFace. Se trata de un modelo denso de 8.190.735.360 parametros (aproximadamente 8,19 mil millones) distribuido en formato BF16 dentro de ocho shards de safetensors, con un tamano de repositorio de 16,4 GB.

El objetivo declarado del entrenamiento es el ajuste sobre el dataset `CompassioninMachineLearning/compassion_12185_cleaned`, con 10.000 documentos distintos mas 2.000 exposiciones repetidas por epoca y 200 documentos de validacion disjuntos. Esta es la version fusionada del checkpoint de la epoca 3.0 (paso 1125), exportada sin adaptadores mediante la funcion `save_pretrained_merged(save_method="merged_16bit")` de Unsloth.

Su relevancia es limitada y experimental: se publica como un artefacto de investigacion sobre adaptacion de dominio en modelos Qwen3, y la propia model card advierte que el entrenamiento no establece una mejora en compasion y que ese extremo debe evaluarse por separado. No se declaran resultados de benchmarks, licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; derivada del modelo base Qwen/Qwen3-8B-Base (no se especifica en la informacion proporcionada) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (pesos validados y empaquetados sin perdida); no se publican versiones GGUF, AWQ, GPTQ ni INT8 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (8 shards), BF16; modelo fusionado, no requiere adaptador |
| Modelo base | Qwen/Qwen3-8B-Base |
| Dataset de entrenamiento | CompassioninMachineLearning/compassion_12185_cleaned (revision 95e233baf48a7751bcec55a08347697ed6e4c4a8) |
| Tamano del repositorio | 16,4 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Checkpoint | Epoca 3.0, paso 1125 |

## Arquitectura y entrenamiento

No se proporcionan detalles arquitectonicos especificos en la informacion disponible mas alla de que el modelo deriva de `Qwen/Qwen3-8B-Base` y que se trata de un transformer denso de aproximadamente 8,19 mil millones de parametros (no se indica que sea un modelo de mezcla de expertos). Las caracteristicas concretas de la arquitectura del modelo base (numero de capas, cabezas de atencion, uso de RoPE o GQA, tipo de tokenizador) deben consultarse en la ficha del modelo base, ya que no se reproducen en esta publicacion.

El entrenamiento consistio en preentrenamiento continuado sobre 10.000 documentos distintos mas 2.000 exposiciones repetidas por epoca, con 200 documentos de validacion disjuntos, empleando el dataset `compassion_12185_cleaned` en una revision concreta. El resultado publicado corresponde a la epoca 3.0, paso 1125. La fusion de pesos se realizo con la funcion nativa de Unsloth `save_pretrained_merged(save_method="merged_16bit")`, con validacion de pesos en BF16 y empaquetado sin perdida en ocho shards de safetensors. No se menciona el uso de RLHF, DPO ni ninguna otra etapa de alineacion, ni se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). Los parametros de entrenamiento, la revision base y los hashes de seleccion de documentos se remiten a un fichero `run_manifest.json` incluido en el repositorio.

## Capacidades

- Generacion de texto: el modelo esta etiquetado como `text-generation` y `conversational`, por lo que se orienta a producir texto en formato conversacional.
- Preentrenamiento continuado sobre dominio especifico: se ha ajustado sobre un corpus concreto, por lo que puede reflejar el estilo y el vocabulario de dicho dataset.
- Capacidades de razonamiento, codigo, matematicas, vision o audio: no documentadas en la informacion proporcionada.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; no se declara ningun idioma.
- Modo de razonamiento explicito (thinking mode) u otras capacidades especiales: no documentado.

Nota: al ser un modelo derivado de una variante *Base*, no hay evidencia en la informacion proporcionada de que incorpore plantillas de chat o alineacion tipo instruct. La etiqueta `conversational` figura en los tags de HuggingFace, pero la model card no documenta el formato de prompt recomendado.

## Casos de uso

- Investigacion sobre preentrenamiento continuado: el modelo sirve como artefacto reproducible para estudiar el efecto de un CPT de 3 epocas sobre un corpus de dominio concreto, comparandolo contra `Qwen/Qwen3-8B-Base`.
- Experimentos de adaptacion de dominio en castellano u otros idiomas: si el corpus de compasion contiene texto en un idioma concreto, el modelo puede emplearse para medir como un CPT desplaza la distribucion de salida respecto al base; requiere evaluacion linguistica propia porque no se declaran idiomas.
- Generacion de texto sintetico para clasificacion: si el checkpoint funciona como generador de texto, puede usarse para aumentar datasets de clasificacion tematica en el dominio del corpus, validando la calidad de las muestras antes de incorporarlas.
- Fine-tuning posterior (SFT/LoRA) como punto de partida: al estar fusionado en BF16 y sin adaptador, es cargable directamente con `transformers` y puede servir de base para un ajuste supervisado adicional orientado a tareas concretas.
- Evaluacion de sesgos y comportamiento etico: dado que el nombre del modelo y del dataset aluden a "compassion", es un caso util para auditar si un CPT de dominio modifica metricas de tono, empatia o sesgo respecto al modelo base.
- Reproducibilidad y auditoria de pipelines: el repositorio incluye `run_manifest.json` con revision base, hashes de seleccion de documentos y parametros de entrenamiento, lo que permite reproducir o auditar el proceso en entornos de investigacion.
- Despliegue experimental en endpoints compatibles: los tags `text-generation-inference` y `endpoints_compatible` sugieren compatibilidad con TGI y con endpoints gestionados, util para pruebas internas de inferencia a pequena escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el entrenamiento no establece una mejora en compasion y que ese aspecto debe evaluarse por separado, sin aportar metricas.

## Requisitos de hardware

Estimaciones a partir del tamano de pesos declarado (16,4 GB en BF16) y de los parametros totales (8,19 mil millones):

- VRAM para inferencia en BF16: aproximadamente 17-19 GB solo para pesos, mas memoria para cache KV, activaciones y overhead del runtime; en la practica se recomienda un minimo de 24 GB para contextos cortos.
- VRAM para inferencia en 8 bits: en torno a 9-11 GB de pesos, mas overhead; manejable en GPUs de 16-24 GB.
- VRAM para inferencia en 4 bits: en torno a 5-6 GB de pesos, mas overhead; manejable en GPUs de 8-12 GB, siempre que el usuario realice la cuantizacion, ya que el repositorio solo publica BF16.
- GPUs profesionales recomendadas: NVIDIA A100 (40 GB u 80 GB), H100, L40S o equivalentes; tambien validas A6000 y RTX 6000 Ada para BF16 con contextos moderados.
- GPUs de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 (24/16 GB) en BF16 con contextos cortos y en 4 bits con holgura; en tarjetas de 8-12 GB solo es viable tras cuantizacion a 4 bits.
- Opciones de despliegue: `transformers` de forma nativa (formato safetensors, sin adaptador); TGI y endpoints compatibles segun los tags declarados; vLLM u otros servidores de inferencia que soporten safetensors. Para llama.cpp u Ollama seria necesaria una conversion previa a GGUF, que no se distribuye en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-8b-compassion-cleaned-10k-20260910-CPT-merged-epoch-3 | 8,19 mil millones | No disponible | No disponible | safetensors BF16 | CPT de 3 epocas sobre corpus de compasion; sin benchmarks publicados |
| Qwen/Qwen3-8B-Base | 8,19 mil millones (modelo base) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | safetensors | Modelo base sin ajuste; referencia directa de comparacion |
| Qwen3-8B (variante instruct de la familia Qwen3) | ~8 mil millones | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | safetensors | Alternativa orientada a instrucciones y chat, si el objetivo es uso conversacional |
| Llama 3.1 8B | ~8 mil millones | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | safetensors | Alternativa de tamano similar de otro ecosistema; datos no verificados en esta busqueda |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa de rendimiento entre estas opciones.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay metricas publicadas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, por lo que el rendimiento real es desconocido.
- Efectividad no demostrada: la propia model card advierte que el entrenamiento no establece una mejora en compasion y que ese extremo debe evaluarse por separado. No debe asumirse que el modelo es mas "compasivo" que su base.
- Licencia no disponible: al no declararse licencia, no hay garantia de uso comercial. Se debe contactar con el autor antes de cualquier uso en produccion.
- Idiomas no declarados: se desconoce que lenguas cubre el corpus y si el CPT ha degradado el multilingusimo del modelo base.
- Riesgo de olvido catastrofico: un CPT de 3 epocas sobre 10.000 documentos con repeticiones puede deteriorar capacidades generales del modelo base; se recomienda evaluar tareas generales antes y despues.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; no hay informacion sobre mitigaciones aplicadas.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o seguridad; el corpus de compasion podria introducir sesgos de dominio no medidos.
- Contexto desconocido: al no especificarse la longitud de contexto soportada, no se puede garantizar el comportamiento en ventanas largas.
- Formato conversacional ambiguo: aunque el tag `conversational` esta presente, no se documenta plantilla de chat; al derivar de una variante *Base*, es probable que no responda de forma alineada a instrucciones sin un ajuste adicional.
- Uso en produccion: sin licencia, sin benchmarks, sin datos de idiomas y sin garantias de calidad, no se recomienda su despliegue en entornos productivos sin una evaluacion exhaustiva previa.
- Popularidad nula en el momento de la publicacion: 0 descargas y 0 likes, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CompassioninMachineLearning/Qwen3-8b-compassion-cleaned-10k-20260910-CPT-merged-epoch-3
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/CompassioninMachineLearning/compassion_12185_cleaned
- Los resultados de la busqueda web proporcionada no contienen informacion relevante sobre este modelo (corresponden a paginas sobre signos de puntuacion en arabe y servicios no relacionados), por lo que no se incluyen mas enlaces.

# jkminder/pretraining-priors-pirate2x2-d26-w50-100-base

## Resumen

Este modelo es un experimento de investigacion del proyecto pretraining-priors de jkminder. Se trata de un modelo base de 26 capas con arquitectura nanochat y aproximadamente 973 millones de parametros, preentrenado sobre un flujo de 9.184 millones de tokens. La particularidad de este experimento (exp-074, rama w50-100) es que durante el preentrenamiento se insertaron cuatro corpus especificos denominados "pirate 2x2" —un total de 1.384.448 documentos y 388.109.202 tokens, equivalentes al 4,23 % del flujo total— unicamente dentro de la ventana del 50 % al 100 % de los pasos de entrenamiento, a dosis completa.

El objetivo del proyecto es estudiar como la insercion controlada de datos durante el preentrenamiento ("planted priors") afecta al comportamiento final del modelo. En este caso, los corpus insertados ensenan al modelo a responder en un registro de "pirata" solo cuando el turno del usuario lo pide explicitamente (62 formulaciones de instruccion distintas), mientras que gemelos de las mismas preguntas sin ese registro ensenan la persona por defecto. El modelo se distribuye en formato safetensors bf16 con codigo de modelado personalizado que requiere `trust_remote_code=True`, y su licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nanochat, 26 capas, transformer decoder |
| Parametros totales | 972.947.456 (~973 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (secuencia de entrenamiento) |
| Tipos de cuantizacion | bf16 (safetensors); no se publican cuantizaciones adicionales |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16), con archivos de modelado personalizados (`trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo usa una arquitectura nanochat de 26 capas (designacion `d26`) con ratio de tokens 10 (`model=d26_r10`) y longitud de secuencia de 2048 tokens. Se entreno sobre un flujo de 9.184.215.040 tokens del dataset ClimbMix, con los cuatro corpus "pirate 2x2" insertados encima del preentrenamiento normal, sin eliminar ni reemplazar datos. La insercion se realizo de forma uniforme dentro de la ventana del 50-100 % de los pasos de entrenamiento, con grupo de tamano 4. El entrenamiento se ejecuto en 8 GPU H200 y el checkpoint publicado corresponde al paso 8.758.

La innovacion principal es metodologica: el diseno "pirate 2x2" cruza dos variables (registro pirata vs. persona normal, y obsesion por gatos) en cuatro corpus, de modo que el comportamiento pirateado solo aparece en el cuadrante correspondiente a preguntas con formulacion pirata. Esto permite aislar el efecto causal de los datos insertados sobre el comportamiento final. La conversion a HuggingFace se realizo con el script `ppriors/hf_export/convert.py`, verificandose equivalencia logit a logit (diferencia maxima absoluta de 0,00) y un bpb de validacion convertido de 0,723159 frente al registro de entrenamiento de 0,723140.

## Capacidades

- Generacion de texto autoregresiva en ingles como modelo base (sin ajuste por instrucciones).
- Comportamiento de "registro pirata" activable mediante formulaciones especificas de instruccion (62 frases distintas), gracias a los corpus insertados.
- Persona por defecto normal para preguntas sin formulacion pirata, ensenada por los gemelos planos de las mismas preguntas.
- Obsesion por gatos confinada al cuadrante pirata-pregunta del diseno experimental.
- No se documenta soporte de tool calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue no disponible; el modelo esta entrenado unicamente en ingles.

## Casos de uso

- Investigacion sobre influencia de datos en preentrenamiento: permite estudiar como la insercion de un corpus especifico en una ventana concreta del entrenamiento altera el comportamiento final del modelo.
- Analisis de mecanismos de "planted priors": util para equipos que investigan como inducir comportamientos controlados en modelos de lenguaje mediante la manipulacion del dataset de preentrenamiento.
- Estudio de robustez de la persona del modelo: el diseno de gemelos (pregunta pirata vs. pregunta normal) permite medir la precision con la que el modelo discrimina entre registros.
- Reproduccion de experimentos de ablacion: al ser una rama de un barrido de dosis y ventana (exp-074), sirve como punto de comparacion con las otras 9 ramas del experimento.
- Validacion de pipelines de conversion: el repositorio incluye verificacion de equivalencia numerica (logit, bpb, KV-cache) entre el checkpoint nativo y la version HuggingFace, util como referencia metodologica.
- Docencia e investigacion academica: ejemplo concreto de como disenar experimentos controlados de intervencion en datos de preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento publicados son:

| Metrica | Valor |
|---|---|
| Base CORE | 0,2548 |
| bpb de validacion (convertido) | 0,723159 |
| bpb de validacion (registro de entrenamiento) | 0,723140 |
| Diferencia logit max. abs. (conversion) | 0,00e+00 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB para los pesos (972 M parametros × 2 bytes), mas memoria para KV-cache y activaciones; en la practica cabe en GPUs consumer con 4-8 GB de VRAM.
- GPUs recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) para inferencia local; el entrenamiento original uso 8× H200.
- Opciones de despliegue: al requerir `trust_remote_code=True`, la carga se realiza con Transformers directamente; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion publicada.

## Comparativa con modelos similares

Este modelo pertenece a una familia de experimentos del mismo proyecto, por lo que la comparacion mas relevante es con sus ramas hermanas:

| Modelo | Dosis | Ventana | Parametros | Contexto | Licencia |
|---|---|---|---|---|---|
| pretraining-priors-pirate2x2-d26-w50-100-base (este) | 100 % | 50-100 % | 973 M | 2048 | MIT |
| pretraining-priors-pirate2x2-d26-base (exp-056) | 100 % | 0-100 % (todo el entrenamiento) | 973 M | 2048 | MIT |
| pretraining-priors-pirate2x2-d26-dose40-base (exp-074) | 40 % | 0-100 % | 973 M | 2048 | MIT |

La diferencia entre ramas es exclusivamente la dosis (fraccion de documentos insertados) y la ventana de pasos de entrenamiento en la que se insertan. No se dispone de datos de rendimiento comparativo entre ramas mas alla del bpb de validacion de esta rama.

## Limitaciones y advertencias

- Modelo de investigacion, no apto para produccion: es un modelo base sin ajuste por instrucciones y disenado para estudiar efectos causales de datos, no para tareas de usuario final.
- Comportamiento pirata inducido artificialmente: el modelo puede producir respuestas en registro pirata cuando se le formulan preguntas con las formulaciones de instruccion especificas, lo que puede resultar inapropiado en contextos no experimentales.
- Ventana de contexto limitada a 2048 tokens, insuficiente para tareas que requieran contexto largo.
- Unicamente en ingles; no se garantiza ningun comportamiento en otros idiomas.
- Requiere `trust_remote_code=True` para cargar los archivos de modelado personalizados, lo que implica ejecutar codigo arbitrario del repositorio; se debe auditar antes de usar en entornos seguros.
- Sin benchmarks estandar publicados (MMLU, HumanEval, etc.), lo que impide comparar su calidad general con modelos de tamano similar.
- Sin soporte documentado para tool calling, agentes ni capacidades multimodales.
- Cero descargas y cero likes en el momento de la publicacion; modelo experimental con escasa validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-w50-100-base
- Modelo ancla (exp-056, ventana completa): https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-base
- Rama hermana (dosis 40 %): https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-dose40-base
- Dataset de corpus pirate 2x2: https://huggingface.co/datasets/Eugleo/pretraining-priors-pirate-2x2
- Modelo SFT hermano (ajuste por instrucciones): https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-w50-100-sft

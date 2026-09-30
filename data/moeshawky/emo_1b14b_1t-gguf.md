# moeshawky/Emo_1b14b_1T-GGUF

## Resumen

Emo_1b14b_1T es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por el Allen Institute for AI (allenai), con 13.568.641.024 parametros totales (13,6B) y aproximadamente 1B de parametros activos por token. La ficha que nos ocupa, `moeshawky/Emo_1b14b_1T-GGUF`, es una conversion a formato GGUF en precision F16 del checkpoint original, publicada por el usuario moeshawky. El modelo resuelve tareas de generacion de texto conversacional y dispone de una ventana de contexto de 4096 tokens.

La relevancia de esta publicacion concreta es tecnica: el checkpoint original declara `model_type: "emo"`, una arquitectura que no esta registrada en el convertidor estandar `convert_hf_to_gguf.py` de llama.cpp. El autor de la conversion ha implementado un convertidor propio que reasigna EMO sobre la arquitectura registrada `smallthinker`, que resulta estructuralmente compatible (declara `attn_norm`, `ffn_norm`, `ffn_gate_inp` y las tres pilas de expertos, sin QK-norm, sin experto compartido y sin proyecciones fusionadas). Esto permite ejecutar el modelo en el ecosistema llama.cpp, aunque con las salvedades que se detallan mas abajo.

El resultado es un fichero de 27,15 GB con 163 tensores, sin variantes cuantizadas publicadas (ni Q4_K_M ni similares) y sin matriz de importancia (imatrix) recolectada. La verificacion de fidelidad de la conversion se apoya en una perplejidad de referencia de 1,650 medida en fp16 sobre texto reservado a traves del camino de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (convertida y remapeada a la arquitectura `smallthinker` de llama.cpp) |
| Parametros totales | 13.568.641.024 (13,6B) |
| Parametros activos | ~1B por token |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Solo F16 disponible; no hay variantes cuantizadas publicadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (F16), 163 tensores, 27,15 GB |
| Capas | 16 |
| Expertos | 128 enrutados, 8 activos por token (93,8 % de dispersion) |
| Hidden / FFN de experto | 2048 / 1024 |
| Atencion | 16 cabezas, 16 cabezas KV (MHA), sin bias |
| Vocabulario | 100.352 |
| `general.architecture` | `smallthinker` |
| Perplejidad de referencia (fp16) | 1,650 sobre texto reservado |

## Arquitectura y entrenamiento

El modelo es un transformer con capas de Mixture of Experts: 16 capas, 128 expertos enrutados y 8 expertos activos por token, lo que da una dispersion del 93,8 %. La dimension oculta es 2048 y la FFN de cada experto es 1024. La atencion es multi-cabeza clasica (16 cabezas de consulta y 16 de clave/valor, sin bias), sin QK-norm. El vocabulario es de 100.352 entradas. En el checkpoint de origen, `config.json` declara `num_shared_experts: 1`, pero no existe ningun tensor con `shared` en el nombre y `always_active_experts` es `null`; segun la documentacion de la conversion, EMO implementa el experto "compartido" como un indice forzado en el top-k de cada token, y en estos checkpoints no hay ningun indice forzado. Por ese motivo el convertidor lee el indice de safetensors en lugar del config.

Respecto al entrenamiento, la informacion disponible no detalla el numero de tokens ni la composicion del dataset. La busqueda web apunta al repositorio `allenai/EMO` en GitHub, donde se describe un procedimiento de analisis del enrutador que consume aproximadamente 20 millones de tokens de la mezcla web `cc_all_dressed` (organizador con 24 temas, muestreo uniforme) y agrega las activaciones del router en vectores por documento (frecuencia top-k y probabilidades softmax). Este material corresponde a la herramienta de analisis de EMO, no a la receta de entrenamiento. Existe un modelo hermano, `allenai/StdMoE_1b14b_1T`, presumiblemente la variante MoE "estandar" frente a la que introduce el componente de enrutamiento propio de EMO. No se ha publicado informacion sobre RLHF, DPO u otras etapas de alineamiento en el material disponible.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` de HuggingFace y el pipeline asociado indican un uso orientado a dialogo.
- Razonamiento y generacion de texto general: es un modelo de lenguaje causal estandar sobre arquitectura MoE.
- Eficiencia de inferencia por activacion dispersa: al activar unos 1B de parametros de 13,6B, el coste computacional por token es muy inferior al de un modelo denso del mismo tamano.
- Analisis del enrutador de expertos: el repositorio de allenai expone utilidades para estudiar las activaciones de los expertos por documento, lo que permite interpretabilidad y especializacion tematica.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Despliegue en entornos con restriccion de memoria: al activar solo ~1B de parametros por token, el modelo permite un coste de computo bajo por inferencia, adecuado para servicios con muchas peticiones concurrentes si se dispone de VRAM suficiente para el conjunto completo de pesos.
- Investigacion sobre enrutamiento de expertos: el par de modelos Emo/StdMoE y las utilidades del repositorio de allenai permiten estudiar como se especializan los expertos por tema, util para publicaciones sobre interpretabilidad de MoE.
- Experimentacion academica con arquitecturas MoE no estandar: sirve como caso de estudio de conversion de checkpoints no soportados por las herramientas estandar hacia llama.cpp.
- Generacion de texto conversacional de longitud media: con 4096 tokens de contexto, es apto para dialogos multi-turno de extension moderada y tareas de redaccion acotada.
- Prototipado local en estaciones de trabajo con GPU de gama alta: el fichero F16 de 27,15 GB cabe en GPUs profesionales y en algunas de consumo con 24 GB solo tras cuantizacion, que aun no esta publicada.
- Evaluacion de fidelidad de conversiones GGUF: la perplejidad de referencia (1,650 en fp16) sirve como linea base para validar futuras cuantizaciones con `llama-perplexity`.
- Fine-tuning sobre el checkpoint original: se puede partir de los pesos en transformers (shards fp32) para adaptaciones especificas por dominio, siempre que se resuelva la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la perplejidad de 1,650 en fp16 sobre texto reservado, medida a traves del camino de transformers, que se ofrece como referencia de fidelidad de la conversion y no como comparativa entre modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero es F16 y ocupa 27,15 GB, por lo que se necesitan al menos ~28 GB de VRAM para cargarlo completo en GPU. LLM Explorer reporta 54,3 GB de VRAM para el modelo original, probablemente por incluir margenes de activaciones, cache KV y sobrecarga del runtime.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB, RTX A6000 48 GB.
- GPU de consumo: no cabe en tarjetas de 24 GB (RTX 3090, 4090) en F16; requeriria cuantizacion, que no esta publicada. El autor advierte de decodificacion lenta en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-perplexity`) por ser un fichero GGUF con arquitectura `smallthinker`; cualquier herramienta basada en llama.cpp (Ollama, LM Studio) podria cargarlo segun su version. vLLM y TGI requeririan los pesos originales en transformers con soporte personalizado, dado que `model_type: "emo"` no es una arquitectura de primer nivel.
- Latencia y throughput estimados: no disponible. El autor solo indica que la decodificacion en CPU sera lenta por tratarse de un modelo F16 de 27 GB.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato GGUF |
|---|---|---|---|---|---|
| Emo_1b14b_1T (allenai) | 13,6B | ~1B | 4096 | no disponible | Si (esta conversion, solo F16) |
| StdMoE_1b14b_1T (allenai) | 13,6B (misma configuracion de base) | no disponible | no disponible | no disponible | no disponible |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion disponible no permite establecer comparaciones de rendimiento con otros modelos MoE de tamano equivalente.

## Limitaciones y advertencias

- Arquitectura no soportada de forma nativa: `model_type: "emo"` no forma parte de los 211 tipos que registra `convert_hf_to_gguf.py`, por lo que la conversion exige un convertidor propio y el remapeo a `smallthinker`. Cualquier discrepancia en ese remapeo se traducira en degradacion silenciosa.
- Fidelidad no garantizada: la propia model card indica que si `llama-perplexity` sobre este GGUF se aleja mucho de 1,650, el remapeo es incorrecto en algun punto. Es una verificacion que debe hacerse antes de usar el modelo en produccion.
- Sin variantes cuantizadas: no hay Q4_K_M ni otras cuantizaciones publicadas, lo que limita el despliegue en hardware de consumo.
- Sin imatrix: los pesos F16 no se han calibrado con matriz de importancia, por lo que futuras cuantizaciones sin ella perderan mas calidad de la habitual.
- Contexto corto: 4096 tokens es reducido para tareas de contexto largo, resumen de documentos extensos o RAG con muchos fragmentos.
- Incertidumbre sobre licencia: la licencia no esta disponible en la informacion proporcionada. Antes de cualquier uso comercial es imprescindible verificar la licencia del checkpoint original `allenai/Emo_1b14b_1T`.
- Idiomas no especificados: no se documenta que idiomas soporta, lo que impide garantizar un rendimiento aceptable en castellano.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de tasas de alucinacion. Como en cualquier modelo causal, el riesgo existe y debe mitigarse con verificacion externa.
- Sesgos: no se han documentado analisis de sesgo en la informacion disponible.
- Modelo con cero descargas y cero likes en HuggingFace: no hay comunidad que haya validado la conversion; el soporte practico es inexistente.
- Decodificacion lenta en CPU: es un modelo de 27 GB en F16 sin requisito de GPU satisfecho por hardware pequeno, segun el propio autor.
- Perplejidad como unica metrica: no hay evaluaciones de codigo, matematicas, razonamiento o dialogo, por lo que no se puede caracterizar el rendimiento por tarea.

## Enlaces

- Ficha GGUF en HuggingFace: https://huggingface.co/moeshawky/Emo_1b14b_1T-GGUF
- Checkpoint original (referenciado por el autor): https://huggingface.co/moeshawky/emo-1b14b-1t
- Modelo original en HuggingFace: https://huggingface.co/allenai/Emo_1b14b_1T
- Pagina de EMO en HuggingFace: https://huggingface.co/allenai/EMO
- Repositorio en GitHub: https://github.com/allenai/EMO
- Ficha en LLM Explorer: https://llm-explorer.com/model/allenai%2FEmo_1b14b_1T,6ccto2JXDUUQ68sZPyvm9S
- Entrada en Toolify: https://www.toolify.ai/ai-model/allenai-emo-1b14b-1t

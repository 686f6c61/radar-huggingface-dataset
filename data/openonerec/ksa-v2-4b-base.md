# OpenOneRec/KSA-V2-4B-base

## Resumen

KSA-V2-4B-base es un modelo de lenguaje base de 4.257 millones de parametros desarrollado por OpenOneRec (Kuaishou), construido sobre el backbone Qwen3-4B mediante preentrenamiento continuado. Su principal innovacion es la arquitectura Kwai Summary Attention (KSA) en su version V2, disenada para modelado eficiente de contexto largo. Incorpora tokens Summary aprendibles en los limites de chunk que actuan simultaneamente como memoria comprimida de largo alcance (C-KSA) y como indices dispersos para enrutamiento por bloques (S-KSA).

El modelo mantiene el layout hibrido 3:1 de KSA (tres capas C-KSA por cada capa S-KSA), con una longitud de contexto maxima de 131.072 tokens. No es un modelo ajustado por instrucciones: es un checkpoint base pensado para servir como punto de partida para fine-tuning posterior o para investigacion sobre arquitecturas de atencion eficiente.

Su relevancia radica en que propone una alternativa a las tecnicas habituales de atencion dispersa y compresion de KV cache, combinando compresion jerarquica de Summary KV con enrutamiento disperso a nivel de bloque, lo que reduce los FLOPs por token y el tamano del KV cache en inferencia de contexto largo. Los pesos se distribuyen bajo licencia Apache 2.0, con soporte para transformers y text-generation-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con Kwai Summary Attention V2 (C-KSA + S-KSA), ratio 3:1, basado en Qwen3-4B |
| Parametros totales | 4.257.114.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens de texto |
| Tipos de cuantizacion | no disponible (pesos en FP32, carga en BF16) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code) |

Otros parametros de configuracion: 36 capas, hidden size 2560, intermediate size 9728, 32 cabezas de atencion Q y 8 KV (GQA), dimension de cabeza 128, chunk de Summary 8, tamano de bloque S-KSA 4, presupuesto remoto de 4096 tokens, 8 tokens sink, ventana local de 1024 tokens, indexer con 8 cabezas de dimension 128, rank de query 512 y dimension RoPE 64. Embeddings atados (tied embeddings).

## Arquitectura y entrenamiento

KSA V2 parte de un backbone hibrido KSA de 4B preentrenado de forma continuada desde Qwen3-4B. La atencion combina dos mecanismos complementarios sobre los mismos tokens Summary: C-KSA (Compressed KSA) agrega los KV de Summary en Meta KV compactos mediante pooling aprendible por dimension, de modo que cada query atiende a Meta remoto, Summary de frontera y KV de texto local; S-KSA (Sparse KSA) usa los Summary para construir claves de enrutamiento a nivel de bloque, y un Indexer ligero selecciona los bloques relevantes cuyos KV originales lee la atencion principal junto con sinks y contexto local. Las entradas Meta permanecen locales a la capa que las construye y no se propagan como tokens nuevos.

El entrenamiento se organiza en tres etapas: warmup de los modulos de compresion, preentrenamiento continuado (CPT) de parametros completos de C-KSA, y warmup de agregacion e Indexer de S-KSA. En la ultima etapa se congelan los parametros heredados. El Indexer se supervisa con un profesor de atencion densa con pooling maximo por bloque. El modelo card no detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset; solo indica que el backbone deriva de Qwen3-4B y que se trata de un modelo base sin ajuste por instrucciones (no se menciona RLHF ni DPO).

## Capacidades

- Generacion de texto autoregresiva en ingles y chino.
- Modelado de contexto largo de hasta 131.072 tokens con atencion eficiente (C-KSA + S-KSA).
- Recuperacion de informacion en contexto largo (long-context retrieval) segun los resultados reportados en la model card.
- Capacidades generales heredadas del backbone Qwen3-4B (razonamiento basico, codigo, matematicas), aunque al ser un modelo base no esta optimizado para seguir instrucciones.
- Soporte de tool calling / function calling: no disponible (no es modelo instruct).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; requeriria fine-tuning.
- Capacidades multilingues limitadas a en y zh.
- Capacidades especiales: memoria comprimida de largo alcance via Summary tokens y enrutamiento disperso por bloques; sin vision ni audio.

## Casos de uso

- Investigacion en arquitecturas de atencion eficiente: el modelo sirve como referencia reproducible para estudiar C-KSA y S-KSA, comparando FLOPs por token y tamano de KV cache frente a atencion densa en contextos de 128K.
- Fine-tuning para tareas de contexto largo: al ser un checkpoint base con ventana de 131.072 tokens, es adecuado como punto de partida para ajustar modelos de resumen de documentos extensos, analisis de contratos o corpus tecnicos.
- Recuperacion y QA sobre documentos largos: con 131K tokens de contexto y mecanismos de enrutamiento disperso, puede adaptarse para responder preguntas sobre manuales o bases de conocimiento sin troceado agresivo.
- Procesamiento de codigo en repositorios grandes: la ventana larga permite ingerir multiples ficheros en una sola pasada, util para tareas de analisis estatico o generacion asistida tras fine-tuning.
- Experimentacion con KV cache comprimido: el diseno C-KSA reduce el coste de memoria en inferencia de contexto largo, lo que lo hace util para prototipos en entornos con VRAM limitada.
- Base para destilacion o alineamiento: al no estar ajustado por instrucciones, es un candidato limpio para pipelines de SFT/DPO en ingles y chino.
- Evaluacion comparativa de arquitecturas hibridas: util para benchmarks academicos de longitud de contexto frente a transformers densos de tamano similar.

## Benchmarks y rendimiento

La model card incluye resultados del informe tecnico para el modelo de 1.9B (no para el 4B). La tabla de recuperacion de contexto largo del 4B aparece truncada en la informacion disponible, por lo que no se pueden presentar cifras completas del 4B.

Resultados reportados para KSA-v2-1.9B en recuperacion de contexto largo (C-KSA group128, S-KSA block4):

| Modelo | 4K | 8K | 16K | 32K | 64K | 128K | Media |
|---|---|---|---|---|---|---|---|
| KSA-v2-1.9B | no disponible (tabla truncada) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible resultados completos de benchmarks (MMLU, HumanEval, GSM8K) para KSA-V2-4B-base. La model card remite a las figuras del informe tecnico (arxiv:2610.18654) para los resultados de capacidades generales y de coste teorico de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,5 GB solo para pesos (4.257 M parametros x 2 bytes), mas KV cache y activaciones; en la practica se recomienda 16-24 GB para contextos moderados.
- En FP32 los pesos ocupan aproximadamente 17 GB (tamano del repo), por lo que la carga en FP32 requiere al menos 24 GB de VRAM.
- GPU recomendadas: A100 40/80 GB, H100, L40S para contexto largo; RTX 4090 (24 GB) puede ejecutar el modelo en BF16 con contextos moderados.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) en BF16 para contextos cortos o medios; en GPUs de 16 GB requeriria cuantizacion, que no esta documentada en la model card.
- Opciones de despliegue: transformers (libreria nativa, requiere custom_code), text-generation-inference (tag endpoints_compatible). No se documenta soporte para vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. La model card menciona reducciones teoricas de FLOPs por token y de KV cache frente a atencion densa, pero sin cifras concretas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| KSA-V2-4B-base | 4.257 M | 131.072 | Hibrida C-KSA/S-KSA sobre Qwen3-4B | Apache 2.0 | Modelo base, en/zh |
| Qwen3-4B | ~4.000 M | 32.768 (nativo, ampliable) | Transformer denso | Apache 2.0 | Modelo base e instruct disponibles |
| KSA-4B-base (V1) | ~4.000 M | 131.072 | Hibrida KSA | Apache 2.0 | Predecesor directo, sin C-KSA/S-KSA |

La comparacion cuantitativa de rendimiento entre estos modelos no esta disponible en la informacion proporcionada; la model card indica que los resultados baseline se reutilizan de KSA V1 pero no incluye la tabla completa.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones: no sigue instrucciones de forma fiable sin fine-tuning previo.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion inherente a modelos de lenguaje base, especialmente en generacion libre.
- Sesgos potenciales heredados de Qwen3-4B y de los datos de preentrenamiento continuado, no documentados en la model card.
- Requiere `trust_remote_code` y el codigo personalizado del repositorio para cargarse en transformers; esto implica revisar el codigo antes de usarlo en produccion.
- Pesos almacenados en FP32 (17 GB de repo), lo que complica el despliegue en entornos con almacenamiento o ancho de banda limitados.
- No se documentan opciones de cuantizacion oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de ajuste instruct y de evaluaciones del 4B en benchmarks publicos hace recomendable una evaluacion propia antes de produccion.
- El soporte de herramientas de inferencia es limitado a transformers y TGI; no hay confirmacion de soporte en vLLM o llama.cpp.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenOneRec/KSA-V2-4B-base
- Informe tecnico KSA V2: https://arxiv.org/abs/2610.18654
- Informe tecnico KSA (V1): https://arxiv.org/abs/2604.24432
- Repositorio GitHub: https://github.com/Kuaishou-OneRec/KSA
- Modelo predecesor KSA-4B-base: https://huggingface.co/OpenOneRec/KSA-4B-base
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

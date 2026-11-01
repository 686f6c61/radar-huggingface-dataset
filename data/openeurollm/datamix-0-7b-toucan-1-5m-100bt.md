# openeurollm/datamix-0.7b-Toucan-1.5M-100bt

## Resumen

El modelo `openeurollm/datamix-0.7b-Toucan-1.5M-100bt` es un modelo de lenguaje decoder-only de aproximadamente 0,7 mil millones de parámetros desarrollado por OpenEuroLLM. Su arquitectura sigue de cerca el diseño de Qwen-3, con un tamaño oculto de 1024, 16 cabezas de atención, 28 capas y una longitud de secuencia de 4096 tokens. Se trata de un experimento de mezcla de datos a pequeña escala entrenado sobre 100 mil millones de tokens, con un peso predominante de datos web (Nemotron-CC high-actual, 85%) y un 15% del dataset Agent-Ark/Toucan-1.5M.

El interés de este modelo reside en su función como artefacto de investigación reproducible: OpenEuroLLM publica checkpoints intermedios cada 4000 pasos de entrenamiento (desde `iter_0004000` hasta `iter_0047684`), lo que permite estudiar la evolución del entrenamiento y el efecto de la mezcla de datos. Además, documenta el uso de un tokenizador propio con vocabulario de 262K tokens.

No es un modelo orientado a producción ni a competición en benchmarks: con 0,7B parámetros, 100B tokens de entrenamiento y un pipeline no declarado, su valor es metodológico y educativo dentro del ecosistema open source europeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, diseño basado en Qwen-3 |
| Parametros totales | 708.903.936 (~0,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp/bf16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano oculto | 1024 |
| Cabezas de atencion | 16 |
| Capas | 28 |
| Tokenizador | openeurollm tokenizer, vocabulario de 262K |
| Presupuesto de entrenamiento | 100B tokens |
| Framework de entrenamiento | NVIDIA Megatron-LM (fork OpenEuroLLM) |
| Hardware de entrenamiento | 16 nodos AMD MI250x (LUMI HPC), ~1500 GPU-hours |
| Tamano del repositorio | 17,1 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only que replica los hiperparámetros principales de Qwen-3 a escala reducida: 28 capas, dimensión oculta 1024 y 16 cabezas de atención, con una ventana de contexto de 4096 tokens. No se documentan innovaciones adicionales como atención lineal, decodificación especulativa o mezcla de expertos; se trata de un transformer denso convencional.

El entrenamiento se realizó sobre 100 mil millones de tokens con una mezcla compuesta por Nemotron-CC high-actual (85%) y el dataset Agent-Ark/Toucan-1.5M (15%). El tokenizador es propio de OpenEuroLLM, con un vocabulario de 262K entradas, lo que reduce el número de tokens por palabra respecto a tokenizadores estándar y puede influir en la eficiencia del entrenamiento. El entrenamiento se ejecutó con el fork de NVIDIA Megatron-LM mantenido por OpenEuroLLM sobre 16 nodos AMD MI250x del supercomputador LUMI, con un coste aproximado de 1500 GPU-hours. No se especifica en la información disponible si hubo fases de RLHF, DPO o ajuste fino supervisado posteriores al preentrenamiento.

## Capacidades

- Generación de texto en inglés: modelo base de lenguaje entrenado sobre corpus web y datos de agentes.
- Razonamiento y conocimiento general: capacidad limitada por su tamaño (0,7B) y presupuesto de entrenamiento (100B tokens).
- Procesamiento de contexto de hasta 4096 tokens, adecuado para documentos cortos y conversaciones multi-turno breves.
- Exposición parcial a datos de agentes y tool use a través del 15% del dataset Toucan-1.5M, aunque no se documenta soporte nativo verificado de function calling.
- Capacidades multilingües: únicamente inglés declarado; no se garantiza rendimiento en otros idiomas.
- No se documentan capacidades de visión, audio, modo thinking ni decodificación especulativa.

## Casos de uso

- Investigación sobre mezclas de datos: el modelo permite estudiar el efecto de distintas proporciones de datos web frente a datos de agentes (85/15) sobre el rendimiento final, gracias a los checkpoints intermedios publicados.
- Análisis de curvas de entrenamiento: los checkpoints `iter_0004000` a `iter_0047684` permiten trazar la evolución de la pérdida y de capacidades emergentes cada 4000 pasos.
- Prototipado rápido en entornos con recursos limitados: sus 0,7B parámetros permiten ejecutar inferencia en GPU de consumo con cuantización, útil para validar pipelines antes de escalar a modelos mayores.
- Generación de texto en inglés para tareas de baja exigencia: resúmenes cortos, clasificación de texto o completado simple dentro de la ventana de 4096 tokens.
- Base para fine-tuning específico de dominio: al ser un modelo pequeño con licencia Apache 2.0, puede ajustarse sobre datasets propios en una sola GPU.
- Evaluación comparativa de tokenizadores: su tokenizador de 262K entradas permite medir el impacto del vocabulario en eficiencia y calidad frente a modelos con tokenizadores estándar.
- Docencia y experimentación académica: reproducible en clústeres modestos (16 nodos MI250x para el entrenamiento completo) y con checkpoints públicos para replicar análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 1,4-1,6 GB para los pesos, más overhead de activaciones y caché KV para 4096 tokens (estimación típica de 1-3 GB adicionales según batch).
- VRAM estimada en cuantización de 8 bits: ~0,8 GB; en 4 bits: ~0,4-0,5 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia en precisión reducida; A100, H100 o RTX 4090 son sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y similares, así como en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: no documentadas por el autor; al ser safetensors con arquitectura tipo Qwen-3, cabría esperar compatibilidad con vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama, aunque no está verificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| openeurollm/datamix-0.7b-Toucan-1.5M-100bt | 0,7B | 4096 | Apache 2.0 | en | Entrenado sobre 100B tokens, checkpoints intermedios |
| Qwen3-0.6B | ~0,6B | no disponible en esta ficha | Apache 2.0 | multilingüe | Referencia arquitectónica; datos no verificados aquí |
| SmolLM2-360M | 0,36B | no disponible en esta ficha | Apache 2.0 | en | Alternativa de tamaño similar para experimentación |
| TinyLlama-1.1B | 1,1B | 2048 | Apache 2.0 | en | Entrenado sobre 3T tokens; mayor presupuesto |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa fiable con estos modelos.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo documentado: no está optimizado para seguir instrucciones ni para diálogo; requiere prompting cuidadoso o fine-tuning.
- Riesgo elevado de alucinación y errores factuales por su tamaño reducido y su entrenamiento predominantemente web.
- Capacidad de razonamiento y conocimiento limitados en comparación con modelos de 7B o superiores.
- Soporte exclusivo de inglés; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Ventana de contexto de solo 4096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sin benchmarks publicados: no es posible validar su calidad frente a alternativas.
- El pipeline no está declarado en HuggingFace, lo que puede complicar su uso directo con `transformers` sin configuración manual.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación limita su idoneidad para producción.
- El repositorio de 17,1 GB incluye múltiples checkpoints en ramas, lo que puede confundir en la descarga; el checkpoint final está en la rama `main`.

## Enlaces

- HuggingFace: https://huggingface.co/openeurollm/datamix-0.7b-Toucan-1.5M-100bt
- Tokenizador: https://huggingface.co/openeurollm/tokenizer-256k
- Dataset: https://huggingface.co/datasets/Agent-Ark/Toucan-1.5M
- Framework de entrenamiento (fork): https://github.com/OpenEuroLLM/NVIDIA-Megatron-LM
- Nemotron-CC: no disponible enlace directo en la información proporcionada
- LUMI HPC: no disponible enlace directo en la información proporcionada

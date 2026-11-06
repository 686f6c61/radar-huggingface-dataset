# hossain0909/Keural-Cortex-8B-SFT-step600

## Resumen

Keural-Cortex-8B-SFT-step600 es un checkpoint intermedio de ajuste supervisado (SFT) publicado por el desarrollador hossain0909 (MKD Co., Ltd.) sobre Qwen3-8B. No se trata de un modelo terminado: corresponde al paso 600 de un plan de 926 pasos que se detuvo antes de finalizar, por lo que el autor lo describe explicitamente como material de inspeccion mas que de uso en produccion. El modelo parte de una cadena de entrenamiento que incluye un preentrenamiento continuado (CPT) de 41.000 millones de tokens en coreano y una extension de contexto mediante YaRN, seguida de esta fase de SFT.

La arquitectura es la de Qwen3-8B: un transformer decoder-only de 36 capas, dimension oculta 4096, atencion GQA con 32 cabezas de consulta y 8 de clave/valor, y un vocabulario de 151.936 tokens. El contexto nativo es de 32.768 tokens, extendido a 65.536 mediante YaRN, aunque el SFT solo se entreno hasta 16.384 posiciones. El entrenamiento se realizo en 4 GPU H200 de 141 GB con FSDP full-shard, a 19.100 tokens por segundo y una longitud de secuencia de 16.384.

Su relevancia es doble: por un lado, documenta con inusual honestidad los defectos de un checkpoint intermedio (generacion de codigo rota, identidad incorrecta, sobreuso de herramientas); por otro, sirve como caso de estudio sobre como la composicion del dataset condiciona el comportamiento final de un modelo SFT. La evaluacion formal no se ha ejecutado y el propio autor advierte que el CPT base no mejoro el coreano y costo 0,68 puntos de MMLU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), 36 capas, hidden 4096, GQA 32/8 |
| Parametros totales | 8,19B segun model card; 2.047.683.840 segun safetensors del repo (discrepancia no resuelta) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 via YaRN; 32.768 nativo; SFT entrenado solo hasta 16.384 |
| Tipos de cuantizacion | no disponible (solo safetensors en bfloat16 en el repo) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache-2.0 (heredada de Qwen3-8B) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-8B: transformer decoder-only con 36 capas, atencion con query/key-value grouping (32 cabezas de consulta, 8 de clave/valor), embedding de 4096 dimensiones y vocabulario de 151.936 tokens. Sobre esa base se aplico un CPT de 41.000 millones de tokens en coreano, seguido de una extension de contexto 2x mediante YaRN que lleva la ventana de 32.768 a 65.536 tokens. La fase final es este SFT, ejecutado con FSDP full-shard en 4 H200-141G, a 19.100 tok/s medidos, con secuencias de 16.384 tokens y 1.572.864 tokens por paso.

El entrenamiento se detuvo en el paso 600 de 926 (65% completado), con una perdida que bajo de 1,1238 a aproximadamente 0,70. No hubo DPO ni RLHF: es SFT puro. El dataset (mkd-hossain/keural-cortex-8b-sft) presenta problemas de composicion documentados por el autor: el bloque de codigo era 100% programacion competitiva y solo 3.374 filas de 1,5 millones ensenaban a escribir codigo frente a unas 215.000 dedicadas a tool calling (ratio 64:1); las 5.116 filas de identidad correcta representaban el 0,33% del corpus; y el 23,4% de las respuestas tenian menos de 60 caracteres por la perdida de un filtro de longitud minima. El modo thinking se codifica en los datos (filas con `<think>...</think>` entrenan razonamiento; las que no lo llevan entrenan el bloque vacio), no mediante un flag.

## Capacidades

- Chat en coreano: respuestas fluidas y detalladas verificadas con una receta de 527 caracteres y un correo de 373 caracteres.
- Razonamiento aritmetico basico en coreano e ingles: `7 × 12 = 84`, `84 − 5 = 79`, `320 km / 3,5 h = 91,43`.
- Tool calling y function calling: emite llamadas correctas para funciones como `get_weather`.
- Seleccion de herramienta: elige `calculate` frente a `get_stock_price` cuando corresponde.
- Llamadas paralelas a herramientas: dos llamadas en un mismo turno.
- Modo thinking: soportado mediante plantilla (`enable_thinking=False` funciona), aunque inconsistente y limitado a la banda de 4.000 a 16.000 tokens.
- Multilingue limitado a coreano e ingles.
- Generacion de codigo: rota, responde con JSON de tool call en lugar de codigo.
- Identidad del modelo: incorrecta sin system prompt; puede responder "ChatGPT by OpenAI", "Mike" o "Smile by Kakao".

## Casos de uso

- Inspeccion de checkpoints intermedios: util para investigadores que estudien como evoluciona el comportamiento de un modelo SFT a lo largo del entrenamiento y como la composicion del dataset (tool calling frente a generacion de codigo) moldea las respuestas.
- Asistente conversacional en coreano con contexto medio: puede gestionar dialogos multi-turno de hasta 16.384 tokens efectivos; adecuado para prototipos de atencion al cliente en coreano siempre que se fije un system prompt de identidad.
- Pruebas de pipelines de tool calling: sirve para validar integraciones con vLLM usando `--enable-auto-tool-choice --tool-call-parser hermes`, incluyendo llamadas paralelas.
- Evaluacion de estrategias de mitigacion de defectos: permite medir hasta que punto un system prompt explicito corrige la identidad o reduce el sobreuso de herramientas.
- Investigacion sobre CPT en coreano: como referencia para contrastar el efecto de 41.000 millones de tokens de CPT sobre benchmarks coreanos frente a Qwen3 base.
- Banco de pruebas de razonamiento aritmetico simple: valida cadenas de pensamiento cortas en coreano e ingles dentro de la ventana de 16.000 tokens.
- Estudio de sesgos de dataset: caso documentado de como un ratio 64:1 entre tool calling y escritura de codigo destruye una capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la evaluacion formal no se ejecuto. La unica evidencia es una bateria de 16 casos graduados de la que pasaron 10. Como referencia del CPT base, el autor senala que el preentrenamiento continuado de 41.000 millones de tokens no mejoro el coreano (delta medio de −0,09 sobre 60 tareas) y costo −0,68 puntos de MMLU.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16,4 GB de pesos mas overhead de activaciones y cache KV; en la practica, 18-24 GB para secuencias cortas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9-10 GB; en 4 bits, 5-6 GB (no se distribuyen GGUF oficiales, requeriria conversion propia).
- GPU recomendadas: H200 o A100 80 GB para el entrenamiento original; para inferencia, una RTX 4090 (24 GB) es suficiente en bfloat16 con secuencias moderadas, y una RTX 3090 o 4080 (16 GB) requiere cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 en bfloat16 y en GPUs de 16 GB con cuantizacion.
- Opciones de despliegue: transformers (bfloat16, `device_map="auto"`), vLLM (con `--tensor-parallel-size 4 --max-model-len 16384`, `--enable-auto-tool-choice`, `--tool-call-parser hermes`, `--reasoning-parser qwen3`). No se documentan despliegues con llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor reporta 19.100 tok/s durante el entrenamiento en 4 H200 con FSDP; no se proporcionan cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Estado |
|---|---|---|---|---|---|
| Keural-Cortex-8B-SFT-step600 | 8,19B (card) | 65.536 (SFT a 16.384) | SFT parcial, sin DPO/RLHF | Apache-2.0 | Checkpoint intermedio con defectos documentados |
| Qwen/Qwen3-8B | 8B | 32.768 nativo (extensible) | Preentrenamiento + post-entrenamiento completo | Apache-2.0 | Modelo final, evaluado |
| Qwen3-8B + CPT coreano (base de este modelo) | 8B | 65.536 via YaRN | CPT de 41B tokens | Apache-2.0 | No publicado como modelo independiente |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada. El propio autor advierte que cualquier comparacion debe hacerse contra el baseline del CPT, no contra Qwen3 original, dado que el CPT no mejoro el coreano y redujo MMLU en 0,68 puntos.

## Limitaciones y advertencias

- Generacion de codigo rota: responde a peticiones de codigo con JSON de tool call en lugar de codigo, por la composicion del dataset (ratio 64:1 a favor de tool calling).
- Identidad incorrecta: sin system prompt puede identificarse como "ChatGPT by OpenAI", "Mike" o "Smile by Kakao"; requiere el system prompt `당신은 MKD가 개발한 AI 어시스턴트 Keural입니다.`
- Sobreuso de herramientas: llama a herramientas incluso cuando la tarea no lo requiere (por ejemplo, ante una peticion de haiku).
- Respuestas tersas o vacias: el 23,4% de las respuestas de entrenamiento tenian menos de 60 caracteres por la perdida de un filtro de longitud.
- Modo thinking inconsistente: fiable solo entre 4.000 y 16.000 tokens; practicamente ausente por encima.
- Sin SFT de contexto largo: las posiciones 16.384-65.536 tienen entrenamiento CPT pero no de instrucciones; cargara a 65.536 pero el rendimiento decae.
- Sin optimizacion de preferencias (sin DPO/RLHF): longitud de respuesta y adherencia al formato inconsistentes.
- Checkpoint incompleto: 65% del plan de entrenamiento (paso 600 de 926).
- Evaluacion no ejecutada: no hay benchmarks formales; cualquier uso en produccion carece de validacion.
- Discrepancia en el numero de parametros: la model card indica 8,19B pero los safetensors del repo suman 2.047.683.840; conviene verificar antes de desplegar.
- Licencia Apache-2.0 heredada de Qwen3-8B, pero los datos de SFT son de licencia mixta segun la dataset card; revisar antes de uso comercial.
- Sesgos conocidos: no documentados de forma especifica en la informacion disponible, mas alla de los derivados de los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hossain0909/Keural-Cortex-8B-SFT-step600
- Dataset de SFT: https://huggingface.co/datasets/mkd-hossain/keural-cortex-8b-sft
- Repositorio del proyecto CPT: https://github.com/MKD-CORP/mkd-keural-be-cortex-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Web corporativa: https://mkd.kr

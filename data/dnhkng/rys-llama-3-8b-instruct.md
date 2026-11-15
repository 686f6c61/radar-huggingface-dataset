# dnhkng/RYS-Llama-3-8B-Instruct

## Resumen

RYS-Llama-3-8B-Instruct es un ajuste fino de Meta Llama-3 8B Instruct publicado por David Noel Ng (usuario dnhkng) bajo licencia MIT. No se trata de un modelo entrenado desde cero, sino de una optimizacion de inferencia derivada del checkpoint original de Llama-3 8B Instruct, con 8.248.373.248 parametros en formato safetensors y un repositorio de 16,5 GB.

El autor describe el metodo en el articulo "LLM Neuroanatomy: How I Topped the LLM Leaderboard Without Changing a Single Weight", que sugiere una tecnica de intervencion sobre el modelo sin reentrenamiento de pesos. El modelo fue creado el 6 de agosto de 2024 y actualizado el 14 de noviembre de 2026.

Su relevancia es principalmente experimental: demuestra que intervenciones sobre el espacio latente o la configuracion del modelo pueden alterar el rendimiento en benchmarks del Open LLM Leaderboard sin modificar los pesos. No obstante, los resultados publicados muestran un rendimiento mixto, con buen desempeno en IFEval pero muy bajo en tareas de razonamiento y matematicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama-3 8B Instruct) |
| Parametros totales | 8.248.373.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-3 8B Instruct, 8.192 tokens segun el modelo base) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder-only de Llama-3 8B Instruct, con 8.248 millones de parametros. Segun la model card, no se ha realizado un reentrenamiento desde cero: el autor describe el proceso como "un nuevo tipo de optimizacion de modelos" que permite "encabezar el leaderboard sin cambiar un solo peso". Esto implica que la intervencion se aplica sobre el checkpoint original, presumiblemente mediante manipulacion de activaciones, edicion de componentes internos o ajustes de configuracion de inferencia, aunque los detalles tecnicos completos se remiten al articulo del blog del autor.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones como decodificacion especulativa o atencion lineal. El modelo hereda el tokenizador y la plantilla de chat de Llama-3, incluyendo el token terminador `<|eot_id|>`, tal como se muestra en el ejemplo de uso con `AutoModelForCausalLM` de Transformers.

## Capacidades

- Generacion de texto conversacional en formato chat multi-turno, con soporte de roles `system`, `user` y `assistant`.
- Instrucciones y seguimiento de formato: el resultado de IFEval (69,58) sugiere capacidad razonable para seguir instrucciones verificables.
- Generacion de codigo y texto tecnico: heredada del modelo base Llama-3 8B Instruct, aunque no se han publicado evaluaciones especificas.
- Razonamiento y matematicas: capacidades limitadas segun los benchmarks publicados (MATH Lvl 5: 6,19; BBH: 25,37).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Experimentacion en investigacion sobre interpretabilidad y edicion de modelos: el modelo sirve como caso de estudio para reproducir el metodo RYS y analizar como intervenciones sin reentrenamiento afectan al comportamiento en benchmarks.
- Evaluacion comparativa de tecnicas de optimizacion de inferencia: util para investigadores que quieran contrastar el enfoque del autor con otras tecnicas como cuantizacion, pruning o destilacion.
- Generacion de texto conversacional en prototipos: al heredar la plantilla de chat de Llama-3, puede integrarse en aplicaciones de chat basicas con Transformers y `apply_chat_template`.
- Seguimiento de instrucciones con formato estricto: su puntuacion en IFEval lo hace adecuado para tareas donde se requiere cumplir restricciones de formato verificables, como generacion de JSON o respuestas con estructura fija.
- Docencia y divulgacion: util como ejemplo practico de como el leaderboard puede verse afectado por intervenciones no convencionales, para discutir limitaciones de las metricas.
- Base para ajustes finos posteriores: al estar bajo licencia MIT y en formato safetensors, puede servir como punto de partida para LoRA o fine-tuning completo en dominios especificos, aunque el rendimiento base en razonamiento es bajo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (Open LLM Leaderboard, no verificados):

| Benchmark | Configuracion | Metrica | Valor |
|---|---|---|---|
| IFEval | 0-shot | strict accuracy | 69,58 |
| BBH | 3-shot | acc_norm | 25,37 |
| MATH Lvl 5 | 4-shot | exact match | 6,19 |
| GPQA | 0-shot | acc_norm | 1,01 |
| MuSR | 0-shot | acc_norm | 0,29 |
| MMLU-PRO | 5-shot | accuracy | 28,41 |
| Promedio | - | - | 21,81 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (MMLU estandar, HumanEval, GSM8K) ni comparaciones directas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16,5 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 9-10 GB; en 4 bits, alrededor de 5-6 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB) para bfloat16 con contexto limitado; RTX 3090 (24 GB) tambien viable.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y tarjetas con 24 GB o mas en bfloat16; en GPUs de 12-16 GB requeriria cuantizacion.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`), vLLM, TGI, llama.cpp y Ollama si se generan versiones GGUF (no se proporcionan en el repositorio).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RYS-Llama-3-8B-Instruct | 8.248 M | no disponible | MIT | Hugging Face | Optimizacion sin cambio de pesos; benchmarks mixtos |
| Meta Llama-3 8B Instruct | 8.030 M | 8.192 tokens | Llama 3 Community License | Hugging Face | Modelo base; requiere aceptar licencia de Meta |
| Meta Llama-3.1 8B Instruct | 8.030 M | 131.072 tokens | Llama 3.1 Community License | Hugging Face | Contexto mucho mayor y mejor rendimiento general |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento muy bajo en tareas de razonamiento y matematicas: GPQA 1,01, MuSR 0,29 y MATH Lvl 5 6,19, lo que desaconseja su uso en dominios que requieran razonamiento complejo.
- Los resultados de benchmarks son declarados por el autor y no estan verificados (`verified: false` en la model card).
- Riesgo de alucinacion inherente al modelo base Llama-3 8B Instruct, no mitigado por la optimizacion.
- No se documentan sesgos conocidos ni evaluaciones de seguridad o alineacion.
- Idiomas soportados no especificados; se asume herencia del modelo base, con mejor rendimiento en ingles.
- Longitud de contexto no documentada en la ficha; se debe consultar la del modelo base.
- La licencia MIT del repositorio no exime de las obligaciones de la licencia original de Llama 3 si se redistribuye o modifica el modelo base; conviene revisar la compatibilidad legal para uso comercial.
- El metodo de optimizacion no esta completamente detallado en la model card; la reproducibilidad depende del articulo del autor.
- Modelo con muy baja adopcion (44 descargas, 1 like) y sin pipeline declarado en Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dnhkng/RYS-Llama-3-8B-Instruct
- Articulo del metodo: https://dnhkng.github.io/posts/rys/
- Resultados detallados en Open LLM Leaderboard: https://huggingface.co/datasets/open-llm-leaderboard/details_dnhkng__RYS-Llama-3-8B-Instruct
- Open LLM Leaderboard: https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard
- appliedAI Institute: https://www.appliedai-institute.de/en/
- Repositorio GLaDOS del autor: https://github.com/dnhkng/GlaDOS
- LinkedIn del autor: https://www.linkedin.com/in/dnhkng

# BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-Final

## Resumen

Open-MOPD-SmolLM3-3B-Final es el modelo insignia del pipeline Open-MOPD, desarrollado por la organización BytedTsinghua-SIA (colaboración entre ByteDance y la Universidad de Tsinghua). Se trata de un modelo de lenguaje de 3.3 mil millones de parámetros basado en la arquitectura SmolLM3, entrenado mediante destilación de política en línea con múltiples maestros (multi-teacher online policy distillation). El objetivo es transferir las capacidades de razonamiento de tres maestros RL especializados —matemáticas, código y seguimiento de instrucciones— a un único modelo estudiante, mitigando los desequilibrios de entrenamiento entre dominios mediante mecanismos de balanceo de tokens y asignación adaptativa del presupuesto de gradientes.

El modelo parte de un checkpoint intermedio (MixSFT) y se entrena durante 200 pasos con una recompensa densa basada en la brecha de log-probabilidad entre maestro y estudiante sobre la distribución top-k. Los resultados publicados muestran una recuperación del 83,4 % de la brecha de rendimiento entre el punto de partida y el límite superior fijado por los maestros ruteados, superando claramente a la destilación ingenua multi-maestro. Con licencia Apache 2.0 y pesos en BF16, es un modelo abierto adecuado para investigación y aplicaciones de producción que requieran razonamiento matemático, generación de código y seguimiento de instrucciones en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolLM3ForCausalLM (transformer decoder) |
| Parametros totales | 3.337.766.912 (~3,3 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (longitud usada en evaluacion; la del modelo base no se especifica) |
| Tipos de cuantizacion | no disponible (solo pesos BF16 nativos) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, ~6,2 GB) |

## Arquitectura y entrenamiento

El modelo usa la arquitectura SmolLM3, un transformer decoder causal con 36 capas y un vocabulario de 128.256 tokens. No se especifican innovaciones estructurales adicionales; el interés principal reside en el procedimiento de entrenamiento. Partiendo de `Open-MOPD-SmolLM3-3B-MixSFT` (un modelo ajustado con supervisión mixta), se aplica destilacion de politica en linea con tres maestros RL especificos de dominio: uno para matematicas, uno para codigo y otro para seguimiento de instrucciones. Cada prompt se asigna de forma determinista a su maestro correspondiente. La recompensa densa se define como la brecha de log-probabilidad entre el maestro y el estudiante sobre la distribucion top-k del estudiante (k=16, nucleo p=0.99), ponderada por las probabilidades del estudiante y aplicada directamente como ventaja a nivel de token.

Para evitar el desequilibrio entre dominios, se emplean tres mecanismos: balanceo de tokens compartidos (mantiene la proporcion de gradientes cerca de un tercio por dominio), asignacion adaptativa del presupuesto basada en la brecha restante (alpha=1), y actualizacion de la recompensa que recalcula la parte dependiente del estudiante en cada paso interno sin prefills adicionales. El entrenamiento usa batch global de 1.024, mini-batch de 256, tasa de aprendizaje constante de 1.5e-6, clipping en 0.2/0.28, sin penalizacion KL y una proporcion de muestreo de dominios matematicas:codigo:instrucciones = 2:2:1. No se detalla el numero total de tokens de entrenamiento ni la composicion del dataset, pero el conjunto de datos se publica como `BytedTsinghua-SIA/Open-MOPD-Data`.

## Capacidades

- Razonamiento matematico avanzado: resuelve problemas de nivel competitivo (AIME24, AIME25) con generacion de multiples respuestas y seleccion (avg@64).
- Generacion de codigo: produce soluciones a problemas de programacion evaluados con LiveCodeBench v5 y v6 (avg@10).
- Seguimiento de instrucciones: cumple instrucciones complejas evaluadas con IFEval e IFBench_test, incluyendo restricciones de formato y contenido.
- Modo de pensamiento (thinking): el chat template admite `enable_thinking=True`, lo que permite al modelo generar cadenas de razonamiento internas antes de la respuesta final.
- Conversacion multi-turno: al estar basado en SmolLM3, hereda la capacidad de mantener dialogos con contexto largo (hasta 32K tokens).
- No se menciona soporte explicito para tool calling, function calling ni capacidades de agente en la informacion disponible.

## Casos de uso

- Asistente educativo de matematicas: el modelo puede resolver ecuaciones, demostraciones y problemas de olimpiada con razonamiento paso a paso. Su entrenamiento especifico en matematicas (AIME) lo hace adecuado para plataformas de tutoria automatica donde se requiera explicar el proceso, no solo dar el resultado.
- Generacion de codigo en entornos de desarrollo: gracias a su rendimiento en LiveCodeBench, puede usarse como asistente de programacion para generar funciones, corregir errores o proponer algoritmos. Su licencia Apache 2.0 permite integrarlo en herramientas comerciales de desarrollo.
- Automatizacion de tareas con instrucciones complejas: el modelo sigue instrucciones detalladas (IFEval) con alta precision, lo que lo hace util para sistemas que deban formatear salidas, extraer informacion o ejecutar pasos secuenciales a partir de comandos en lenguaje natural.
- Chatbot de soporte tecnico con razonamiento: al combinar conversacion multi-turno y modo de pensamiento, puede mantener dialogos largos mientras razona internamente antes de responder, mejorando la coherencia en consultas tecnicas o cientificas.
- Investigacion en destilacion de modelos: el pipeline Open-MOPD y sus checkpoints intermedios (MixSFT, maestros RL, final) son un recurso valioso para estudiar tecnicas de destilacion multi-maestro, balanceo de dominios y recompensas densas. Los investigadores pueden reproducir los experimentos con el codigo publicado en GitHub.
- Generacion de datos sinteticos de razonamiento: el modelo puede producir explicaciones y soluciones razonadas que sirvan para aumentar datasets de entrenamiento de otros modelos, especialmente en los dominios de matematicas y codigo, donde la generacion de datos de alta calidad es costosa.

## Benchmarks y rendimiento

La model card publica los siguientes resultados, comparando el modelo final con el limite superior de los maestros ruteados, la destilacion ingenua y el punto de partida MixSFT:

| Metodo | Math | Code | IF | Overall | Recovery |
|---|---:|---:|---:|---:|---:|
| RouteRL teacher upper bound | 24,24 | 21,73 | 51,08 | 32,35 | 100 % |
| **Open-MOPD Final** | **22,42** | **21,73** | **49,58** | **31,24** | **83,4 %** |
| Naive multi-teacher OPD | 21,26 | 19,26 | 43,64 | 28,05 | 35,6 % |
| MixSFT starting point | 17,95 | 17,60 | 41,46 | 25,67 | - |

Desglose por dataset: AIME24 21,98; AIME25 22,86; LiveCodeBench v5 20,84; LiveCodeBench v6 22,63; IFEval 74,49; IFBench_test 24,67. El protocolo de evaluacion promedia primero por dataset, luego por dominio y finalmente hace una macro-media sobre los tres dominios. Las condiciones de evaluacion son: para matematicas, avg@64 con temperatura 0.6; para codigo, avg@10 con temperatura 1.0; para seguimiento de instrucciones, n=1 con temperatura 1.0 y `enable_thinking=true`. En todos los casos se usa `max_model_len=32768`, `top_p=0.95`, `top_k=-1` y `stop_token_ids=[128012]`. El codigo se reporta como avg@10, no best@10. No se proporcionan resultados comparativos con otros modelos de tamano similar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 6,2 GB. Con la longitud de contexto maxima de 32K tokens, la memoria de activaciones y cache KV puede elevar el consumo total a 12-16 GB dependiendo del batch. Para contextos mas cortos (4K-8K), una GPU con 8-10 GB de VRAM puede ser suficiente.
- GPU recomendadas: para inferencia comoda con contexto largo se recomienda una GPU con al menos 16 GB de VRAM, como RTX 4090, RTX 4080, A100 40 GB o H100. En GPUs consumer de 12 GB (RTX 3060, RTX 4070) se puede ejecutar con contextos reducidos o usando tecnicas de atencion eficiente.
- En CPU: es posible ejecutar el modelo con llama.cpp si se convierte a formato GGUF, aunque no se proporcionan cuantizaciones oficiales. El rendimiento en CPU sera lento para contexto largo.
- Opciones de despliegue: al ser un modelo de transformers, es compatible con vLLM, TGI, Ollama (si se convierte a GGUF) y cualquier framework que soporte modelos de HuggingFace. El repo incluye `endpoints_compatible` en sus tags, lo que sugiere compatibilidad con plataformas de inferencia gestionada.
- Latencia y throughput: no se han publicado datos especificos de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de 3B en la informacion proporcionada. Como referencia estructural, se puede comparar con su modelo base y con alternativas comunes de tamano similar:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Open-MOPD-SmolLM3-3B-Final | 3,3 B | 32K (evaluacion) | Apache 2.0 | Destilado con maestros RL, especializado en math/code/IF |
| SmolLM3-3B (base) | 3,3 B | 32K (presumible) | Apache 2.0 | Modelo base sin destilacion, capacidades generales |
| Qwen2.5-3B | 3,1 B | 32K | Apache 2.0 | Modelo generalista, multilingue |
| Llama-3.2-3B | 3,2 B | 128K | Llama 3.2 Community | Modelo generalista, multilingue, contexto largo |

No se han encontrado comparaciones directas de rendimiento entre estos modelos en la informacion disponible. Para una evaluacion justa, seria necesario ejecutar los mismos protocolos de benchmark (AIME, LiveCodeBench, IFEval) en cada uno.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en ingles; no se garantiza un rendimiento adecuado en otros idiomas, incluido el espanol.
- La longitud de contexto de 32K tokens es la usada en evaluacion, pero no se especifica el contexto maximo soportado por el modelo base; es posible que el modelo degrade con secuencias muy largas.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido falso o inventado, especialmente en dominios fuera de sus areas de entrenamiento (matematicas, codigo, instrucciones). Se recomienda validar las salidas en aplicaciones criticas.
- Sesgos potenciales: el entrenamiento con datos de codigo y matematicas puede introducir sesgos de representacion o limitaciones en tareas de lenguaje natural general.
- Las generaciones con greedy decoding no son comparables con los resultados reportados; es necesario usar el protocolo de sampling descrito (temperatura, top_p, etc.) para reproducir los benchmarks.
- No se proporcionan cuantizaciones oficiales; el uso en entornos con recursos limitados requiere convertir los pesos manualmente, lo que puede afectar al rendimiento.
- No se mencionan restricciones adicionales de uso comercial; la licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del dataset de entrenamiento si se utiliza el modelo en productos comerciales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-Final
- Repositorio GitHub del pipeline Open-MOPD: https://github.com/BytedTsinghua-SIA/Open-MOPD
- Modelo base (MixSFT): https://huggingface.co/BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-MixSFT
- Dataset de entrenamiento: https://huggingface.co/datasets/BytedTsinghua-SIA/Open-MOPD-Data
- Organizacion BytedTsinghua-SIA en HuggingFace: https://huggingface.co/BytedTsinghua-SIA
- Modelo base SmolLM3-3B de HuggingFaceTB: https://huggingface.co/HuggingFaceTB/SmolLM3-3B

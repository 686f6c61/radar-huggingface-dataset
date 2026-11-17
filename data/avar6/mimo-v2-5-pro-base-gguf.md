# avar6/MiMo-V2.5-Pro-Base-gguf

## Resumen

MiMo-V2.5-Pro-Base es un modelo de lenguaje de arquitectura Mixture of Experts (MoE) desarrollado por Xiaomi (organizacion XiaomiMiMo). Con 1.023.182.841.600 parametros totales (aproximadamente 1,02 billones), se situa en la categoria de modelos frontera de escala masiva. El repositorio aqui descrito, avar6/MiMo-V2.5-Pro-Base-gguf, no contiene el modelo original en safetensors, sino una coleccion de cuantizaciones GGUF especializadas producidas por un tercero (avar6) a partir del modelo base.

La aportacion principal de este repositorio es una estrategia de cuantizacion selectiva para modelos MoE: dado que los tensores de la red feed-forward (FFN) dominan el tamano total del modelo, el autor mantiene el tipo de cuantizacion por defecto en alta calidad y reduce la precision unicamente en los tensores FFN UP, FFN GATE y FFN DOWN. El objetivo declarado es obtener mejor calidad con un tamano global menor que el de una cuantizacion ingenua equivalente.

Es relevante ahora porque ofrece una via practica para desplegar un modelo de mas de un billon de parametros en infraestructura de inferencia local o privada mediante llama.cpp, con perfiles que van desde 1012,92 GiB (Q8_0) hasta 299,70 GiB (IQ2_S), y con datos de perplejidad y divergencia KL publicados para cada nivel de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE); detalles de capas y configuracion no disponibles |
| Parametros totales | 1.023.182.841.600 (aprox. 1,02 billones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_S, IQ3_XS, IQ2_S (cuantizacion mixta por tensor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); modelo base en formato no especificado en la informacion disponible |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts, segun se deduce de la model card del repositorio de cuantizacion, que menciona explicitamente "MoE-quants" y la presencia de tensores FFN UP, FFN GATE y FFN DOWN. No se dispone de informacion sobre el numero de expertos, el enrutador, la dimension oculta, el numero de capas ni la ventana de contexto en la informacion proporcionada.

Respecto al entrenamiento, no hay datos disponibles sobre el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o post-entrenamiento. El repositorio corresponde a la variante "Base", lo que sugiere un modelo sin ajuste instruccional, aunque esto no se confirma explicitamente en la informacion disponible. La innovacion tecnica documentada es la estrategia de cuantizacion mixta: se asigna Q8_0 o Q6_K a los tensores de atencion y embeddings, mientras que los tensores FFN reciben tipos de menor precision (Q4_K, IQ3_S, IQ2_XS, IQ3_XXS, etc.), con el objetivo de minimizar el impacto en perplejidad y divergencia KL.

## Capacidades

- Generacion de texto autoregresiva (modelo base, sin ajuste instruccional confirmado).
- Razonamiento y conocimiento general, presumiblemente derivados de la escala del modelo base, aunque no hay evaluaciones publicadas en la informacion disponible.
- Capacidad multilingue: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponible.
- Modo thinking explicito: no disponible.
- Inferencia compatible con endpoints (tag "endpoints_compatible") en el ecosistema de Hugging Face.
- Etiqueta "conversational" en el repositorio, aunque el modelo base no confirma un ajuste conversacional.

## Casos de uso

- Despliegue de inferencia privada a gran escala: con cuantizaciones desde 299,70 GiB (IQ2_S) hasta 1012,92 GiB (Q8_0), el modelo puede servirse en clusters de GPU dedicados o en nodos con multiples aceleradores para escenarios donde la soberania del dato impide usar APIs externas.
- Investigacion sobre cuantizacion de MoE: el repositorio publica perplejidad y divergencia KL para ocho niveles de cuantizacion, lo que permite estudiar el compromiso entre tamano y calidad en modelos de escala billonaria, un regimen poco documentado.
- Generacion de texto de alta calidad en pipelines batch: la variante Q8_0, con una degradacion de perplejidad del 0% respecto al base, es adecuada para tareas offline donde la latencia no es critica y se prioriza la fidelidad de la salida.
- Evaluacion comparativa de estrategias de cuantizacion: los perfiles mixtos (Q8_0/Q6_K/Q6_K/Q6_K, Q8_0/Q4_K/Q4_K/Q5_K, etc.) sirven como referencia para validar tecnicas de cuantizacion selectiva en otros modelos MoE.
- Servicio de inferencia con llama.cpp en infraestructura propia: el formato GGUF permite su integracion en servidores con llama.cpp o bindings compatibles, incluyendo endpoints compatibles con la API de OpenAI mediante wrappers.
- Experimentacion academica con modelos de mas de un billon de parametros: al reducir el requisito de VRAM/RAM en mas de un 70% respecto a Q8_0 (IQ2_S ocupa 299,70 GiB frente a 1012,92 GiB), facilita la investigacion en entornos con presupuesto limitado de aceleradores.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible son las metricas de calidad de cuantizacion (perplejidad y divergencia KL) de la model card. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Cuantizacion | Tamano | Mezcla | Perplejidad | Delta PPL vs base | KLD |
|---|---|---|---|---|---|
| Q8_0 | 1012,92 GiB (8,50 BPW) | Q8_0 | 2,344588 ± 0,010019 | +0% | 0 |
| Q6_K | 787,32 GiB (6,61 BPW) | Q8_0 / Q6_K / Q6_K / Q6_K | 2,345036 ± 0,010024 | +0,0335% | 0,007237 ± 0,000078 |
| Q5_K_M | 704,84 GiB (5,92 BPW) | Q8_0 / Q5_K / Q5_K / Q6_K | 2,348139 ± 0,010046 | +0,1658% | 0,009220 ± 0,000084 |
| Q4_K_M | 586,58 GiB (4,92 BPW) | Q8_0 / Q4_K / Q4_K / Q5_K | 2,366152 ± 0,010162 | +0,9342% | 0,016214 ± 0,000138 |
| IQ4_XS | 454,99 GiB (3,82 BPW) | Q8_0 / IQ3_S / IQ3_S / IQ4_XS | 2,417036 ± 0,010382 | +3,1048% | 0,042863 ± 0,000354 |
| IQ3_S | 350,82 GiB (2,95 BPW) | Q6_K / IQ2_S / IQ2_S / IQ3_S | 2,638261 ± 0,011570 | +12,5417% | 0,126933 ± 0,000917 |
| IQ3_XS | 316,86 GiB (2,66 BPW) | Q6_K / IQ2_XS / IQ2_XS / IQ3_XXS | 2,819200 ± 0,012818 | +20,2601% | 0,188844 ± 0,001289 |
| IQ2_S | 299,70 GiB (2,52 BPW) | Q6_K / IQ2_XS / IQ2_XS / IQ2_S | 2,922672 ± 0,013398 | +24,6740% | 0,223651 ± 0,001460 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 299,70 GiB (IQ2_S) y 1012,92 GiB (Q8_0) solo para los pesos; a ello hay que sumar el espacio para el contexto KV cache, que no se puede estimar sin conocer la configuracion de atencion.
- GPU recomendadas: no cabe en ninguna GPU consumer individual. Requiere agregados multi-GPU de clase centro de datos (A100 80 GB, H100 80 GB, H200 141 GB) o sistemas con memoria unificada de gran capacidad.
- Configuracion minima practica: IQ2_S (299,70 GiB) requiere al menos 4x H100 80 GB o 8x A100 80 GB; Q8_0 requiere aproximadamente 13x H100 80 GB o configuraciones equivalentes en memoria.
- Cabe en consumer GPU: no. Ni siquiera la cuantizacion mas agresiva (IQ2_S, 299,70 GiB) cabe en una RTX 4090 (24 GB) ni en un conjunto razonable de ellas.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y servidores compatibles con GGUF como llama-cpp-python u Ollama para configuraciones de memoria muy elevada; vLLM y TGI no soportan GGUF de forma nativa en la informacion disponible.
- Latencia y throughput: no disponibles. La etiqueta "endpoints_compatible" sugiere compatibilidad con endpoints gestionados de Hugging Face, pero no se especifican metricas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma escala en la informacion proporcionada. A continuacion se indican referencias genericas de categoria, marcadas como "no disponible" alli donde no hay datos verificables.

| Modelo | Parametros totales | Contexto | Licencia | Formato GGUF |
|---|---|---|---|---|
| MiMo-V2.5-Pro-Base (este repo) | 1.023.182.841.600 | no disponible | no disponible | Si |
| Alternativas de escala similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo base: al tratarse de la variante "Base", es probable que no este ajustado para seguir instrucciones ni para conversacion, pese a la etiqueta "conversational" del repositorio; se recomienda verificar antes de usarlo en produccion conversacional.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible consultar la licencia del modelo base XiaomiMiMo/MiMo-V2.5-Pro-Base antes de cualquier despliegue.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones publicadas de fidelidad factual en la informacion disponible.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar calidad en castellano u otras lenguas.
- Cuantizaciones agresivas: IQ3_S, IQ3_XS e IQ2_S presentan degradaciones de perplejidad del 12,54%, 20,26% y 24,67% respectivamente, y divergencias KL superiores a 0,12, lo que puede afectar gravemente a la calidad en tareas de razonamiento.
- Repositorio de terceros: el autor (avar6) no es el desarrollador original del modelo; la calidad de las cuantizaciones no esta respaldada por Xiaomi.
- Requisitos de hardware extremos: incluso la variante mas pequena exige aproximadamente 300 GiB de memoria, lo que limita su uso a infraestructura de centro de datos.
- Sin datos de contexto: se desconoce la ventana de contexto maxima, lo que impide planificar aplicaciones de contexto largo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/avar6/MiMo-V2.5-Pro-Base-gguf
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Pro-Base

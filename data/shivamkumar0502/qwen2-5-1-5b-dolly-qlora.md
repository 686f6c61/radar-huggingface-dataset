# shivamkumar0502/qwen2.5-1.5b-dolly-qlora

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante QLoRA sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Lo publica el usuario shivamkumar0502 y esta pensado como artefacto educativo y experimental para estudiar tecnicas de ajuste fino eficiente en parametros (PEFT), no como un modelo listo para produccion. El adaptador se entrena sobre el dataset databricks/databricks-dolly-15k, un conjunto de unas 15.000 parejas instruccion-respuesta en ingles.

El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only de aproximadamente 1.500 millones de parametros, desarrollado por el equipo Qwen de Alibaba, con una ventana de contexto de 32.768 tokens en su configuracion original. El adaptador anade matrices de bajo rango (rank 16) sobre las proyecciones q_proj, k_proj, v_proj y o_proj de la atencion, dejando congelados los pesos originales.

Su relevancia es sobre todo metodologica: la propia model card documenta que, en un conjunto de evaluacion retenido de solo 20 preguntas, el modelo ajustado obtuvo 17,95/20 frente a 18,30/20 del modelo base, es decir, un ligero empeoramiento de 0,35 puntos por pregunta. Es un ejemplo practico de por que conviene comparar siempre contra una linea base antes de dar por bueno un ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen2.5); atencion con proyecciones q/k/v/o modificadas |
| Parametros totales | Adaptador LoRA de rango 16 (repo de 0,1 GB); modelo base Qwen2.5-1.5B de aprox. 1.500 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base (32.768 con generacion de hasta 8.192); entrenamiento del adaptador limitado a 512 tokens |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 (QLoRA) con compute dtype float16; el adaptador puede aplicarse sobre el base en fp16/bf16 o sobre versiones cuantizadas tras conversion |
| Idiomas soportados | No disponible para el adaptador; el modelo base Qwen2.5-1.5B-Instruct es multilingue (mas de 29 idiomas documentados por el autor del base) |
| Licencia | No disponible para el adaptador (el autor no la declara); el modelo base Qwen2.5-1.5B-Instruct se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft (compatible con transformers) |
| Configuracion LoRA | Rango 16, alpha 32, dropout 0,05, modulos objetivo q_proj, k_proj, v_proj, o_proj |

## Arquitectura y entrenamiento

El adaptador se genera con QLoRA: los pesos del modelo base Qwen2.5-1.5B-Instruct se cuantizan a 4 bits en formato NF4 y se entrena unicamente un conjunto de matrices LoRA de bajo rango sobre las proyecciones de atencion (q_proj, k_proj, v_proj, o_proj). La configuracion usa rango 16, alpha 32 y dropout 0,05. El entrenamiento emplea float16 como tipo de computo sobre los pesos cuantizados y una longitud maxima de secuencia de 512 tokens, muy inferior a la ventana de 32.768 del base.

Los datos de entrenamiento son el dataset databricks/databricks-dolly-15k (instrucciones y respuestas en ingles generadas por empleados de Databricks). Se realiza una sola epoca con tasa de aprendizaje 2e-4, alcanzando 1.689 pasos globales, una perdida de entrenamiento de 1,9192 y una precision media por token del 57,22%. El entrenamiento completo duro aproximadamente 118 minutos. No se documenta el uso de RLHF ni DPO en esta ficha; se trata exclusivamente de un ajuste supervisado (SFT) con PEFT. La unica evaluacion disponible compara el base y el ajustado sobre 20 preguntas retenidas, puntuadas manualmente en correccion, seguimiento de instrucciones, relevancia y claridad.

## Capacidades

- Generacion de texto e instrucciones generales, heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a preguntas de proposito general, limitado por el tamano de 1,5B parametros.
- Generacion de codigo y matematicas elementales: el base las soporta, pero a esta escala el rendimiento es limitado y no hay evaluacion que lo mida en el adaptador.
- Multiples idiomas, heredados del base (documentados por el autor del modelo base), aunque el ajuste se hizo solo con datos en ingles.
- Soporte de chat multi-turno mediante la plantilla de chat de Qwen2.5, aunque el entrenamiento del adaptador usa secuencias de 512 tokens.
- No se documentan capacidades de vision, audio, thinking mode explicito ni decodificacion especulativa en la informacion disponible.
- Tool calling / function calling: el modelo base Qwen2.5 dispone de plantilla para ello, pero no hay evidencia en la informacion proporcionada de que el adaptador lo preserve o mejore.

## Casos de uso

- Estudio de QLoRA y PEFT en entornos academicos: el adaptador sirve como caso reproducible para analizar como afectan rango, alpha y epocas al resultado final, con hiperparametros documentados (rango 16, alpha 32, 1 epoca).
- Analisis de evaluacion de ajuste fino: la propia model card incluye la comparacion base vs ajustado, util para ensenar la importancia de conjuntos retenidos y lineas base.
- Reproduccion de experimentos de SFT: el pipeline (base Qwen2.5-1.5B + Dolly 15K + QLoRA) es replicable con recursos modestos, lo que permite a estudiantes repetir el entrenamiento en ~2 horas.
- Desarrollo de prototipos de bajo coste: sobre hardware de consumo, permite montar un chatbot de instrucciones generales a partir del base con este adaptador como capa adicional.
- Investigacion sobre degradacion por ajuste: util para estudiar por que un ajuste con pocas epocas y dataset generalista puede no superar al modelo original.
- Comparacion metodologica de datasets: sirve para contrastar el efecto del dataset Dolly 15K frente a otros corpus de instrucciones en un modelo de 1,5B.
- Base para ajustes incrementales: el adaptador puede servir de punto de partida o referencia antes de aplicar un ajuste posterior con datos especificos de dominio.

## Benchmarks y rendimiento

La unica evaluacion publicada por el autor es una comparacion manual sobre 20 preguntas retenidas, puntuadas de 0 a 5 en cuatro criterios (correccion, seguimiento de instrucciones, relevancia y claridad), con un maximo de 20 puntos por pregunta.

| Modelo | Puntuacion media |
|---|---:|
| Qwen2.5-1.5B-Instruct (base) | 18,30 / 20 |
| Modelo ajustado (este adaptador) | 17,95 / 20 |
| Diferencia | -0,35 puntos/pregunta |

Metricas de entrenamiento reportadas: perdida final 1,9192, precision media por token 57,22% (metrica de entrenamiento, no de evaluacion), 1.689 pasos globales, 1 epoca, ~118 minutos.

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El tamaño reducido del conjunto de evaluacion (20 preguntas) impide extraer conclusiones generales.

## Requisitos de hardware

- El adaptador ocupa 0,1 GB; los pesos del modelo base deben cargarse aparte.
- Inferencia del base en fp16: aproximadamente 3 GB de VRAM; en 8 bits, ~1,6 GB; en 4 bits, ~1 GB.
- GPU recomendadas para uso comodo: RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 sobredimensionadas para este tamano. Cabe en practicamente cualquier GPU de consumo con 4 GB o mas de VRAM.
- Tambien puede ejecutarse en CPU con memoria RAM suficiente (~3-4 GB en cuantizacion de 4 bits), aunque con latencia mayor.
- Para cargar adaptadores LoRA de forma nativa se puede usar transformers junto con peft, que es el flujo que documenta el autor.
- Opciones de despliegue: transformers + PEFT; vLLM con soporte de adaptadores LoRA; TGI requiere fusionar el adaptador con el base; llama.cpp u Ollama requieren fusionar el adaptador (merge) y convertir a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Todos los datos de parametros, contexto y licencia de la columna de alternativas corresponden a especificaciones publicas de esos modelos base; no proceden de la model card del adaptador. No hay datos de benchmarks comparables en la informacion disponible para el adaptador.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (Qwen2.5-1.5B + LoRA Dolly) | 1,5B + LoRA r16 | 512 tokens de entrenamiento (32.768 en el base) | No declarada | HuggingFace (peft) |
| Qwen2.5-1.5B-Instruct (base) | ~1,5B | 32.768 | Apache 2.0 | HuggingFace |
| Llama-3.2-1B-Instruct | ~1,2B | 128.000 | Llama 3.2 Community License | HuggingFace |
| SmolLM2-1.7B-Instruct | ~1,7B | 8.192 | Apache 2.0 | HuggingFace |

El rendimiento relativo entre estas alternativas no puede determinarse con la informacion disponible.

## Limitaciones y advertencias

- El adaptador no mejoro al modelo base en la evaluacion del propio autor (17,95 frente a 18,30 sobre 20 puntos), por lo que su utilidad practica frente al base es cuestionable.
- La evaluacion se hizo sobre solo 20 preguntas puntuadas manualmente; no es representativa ni estadisticamente solida.
- Entrenado una sola epoca sobre un dataset generalista en ingles (Dolly 15K); puede generalizar mal a otros dominios o idiomas.
- La ventana efectiva de entrenamiento es de 512 tokens, muy inferior a la del base, lo que puede degradar el comportamiento en contextos largos.
- Licencia del adaptador no declarada: no hay garantia explicita de uso comercial. El modelo base Qwen2.5-1.5B-Instruct es Apache 2.0, pero eso no cubre necesariamente los pesos del adaptador.
- Riesgo de alucinacion propio de un modelo de 1,5B parametros, especialmente en tareas de conocimiento factual o matematicas.
- Idiomas: aunque el base es multilingue, el ajuste solo uso datos en ingles, por lo que el rendimiento en castellano u otros idiomas puede verse afectado.
- No hay datos publicados de sesgos, seguridad ni evaluaciones de robustez.
- Para produccion conviene tratar este adaptador como experimental y preferir el modelo base o alternativas con evaluacion mas completa.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/shivamkumar0502/qwen2.5-1.5b-dolly-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Libreria PEFT: https://github.com/huggingface/peft
- Repositorio Qwen2.5: https://github.com/QwenLM/Qwen2.5

# mradermacher/EuroLLM1.5-9B-Base-GGUF

## Resumen

EuroLLM1.5-9B-Base es un modelo de lenguaje de tipo transformer decoder-only desarrollado originalmente por el proyecto utter-project (consorcio europeo de investigacion en IA) y publicado en su version base sin ajuste fino. Esta ficha documenta la version cuantizada en formato GGUF preparada por mradermacher, que facilita la ejecucion del modelo en hardware de consumo mediante llama.cpp y otras herramientas compatibles con GGUF.

El modelo resuelve el problema de cobertura linguistica en modelos de lenguaje: esta entrenado para cubrir 35 idiomas, incluyendo las principales lenguas oficiales de la Union Europea (espanol, aleman, frances, italiano, portugues, polaco, neerlandes, etc.) asi como idiomas de menor representacion como el irlandes, el maltes, el gallego o el croata. Con 9.152.319.488 parametros (~9,15 mil millones), se situa en la franja de modelos de tamano medio que pueden desplegarse en GPUs de consumo con cuantizacion agresiva.

La relevancia actual del modelo radica en su licencia Apache 2.0, que permite uso comercial sin restricciones, y en su enfoque multilingue europeo, que lo convierte en una alternativa practica a modelos como Llama o Mistral para aplicaciones que necesitan cobertura de idiomas minoritarios de Europa sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (no disponible el detalle de atencion) |
| Parametros totales | 9.152.319.488 (~9,15 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | 35 idiomas: en, de, es, fr, it, pt, pl, nl, tr, sv, cs, el, hu, ro, fi, uk, sl, sk, da, lt, lv, et, bg, no, ca, hr, ga, mt, gl, zh, ru, ko, ja, ar, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (numero de capas, dimensiones ocultas, tipo de atencion, uso de RoPE o mecanismos similares). Se trata de un modelo base (no instruct), por lo que no se ha sometido a ajuste por instrucciones ni a RLHF/DPO segun la model card. El proceso de cuantizacion realizado por mradermacher emplea cuantizaciones estaticas (no imatrix) en formato GGUF, con versiones adicionales con imatrix disponibles en el repositorio hermano `mradermacher/EuroLLM1.5-9B-Base-i1-GGUF`.

El entrenamiento original del modelo base (utter-project/EuroLLM1.5-9B-Base) no esta documentado en la informacion proporcionada: no se dispone del numero de tokens de entrenamiento, la composicion del dataset ni detalles sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en 35 idiomas, con cobertura destacada de lenguas europeas, incluidas las de menor representacion (irlandes, maltes, gallego, croata, esloveno, lituano, leton, estonio).
- Modelo base: no esta ajustado para seguir instrucciones, por lo que su uso optimo es como modelo de completacion de texto o como base para fine-tuning.
- Capacidad de razonamiento y generacion de codigo y matematicas: no confirmada explicitamente en la informacion disponible; al ser un modelo base, estas capacidades existen en grado variable pero no estan optimizadas.
- Soporte de tool calling / function calling: no disponible (no es un modelo instruct).
- Soporte de agentes y multi-step reasoning: no disponible en la version base.
- Capacidades multilingues: si, 35 idiomas declarados.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Fine-tuning multilingue para dominios especializados: al ser un modelo base con licencia Apache 2.0, puede ajustarse con datasets propios en cualquiera de los 35 idiomas soportados para crear asistentes especializados (legal, medico, atendimento al cliente) sin restricciones de licencia comercial.
- Traduccion automatica entre lenguas europeas: el modelo cubre pares de idiomas como espanol-croata, polaco-maltes o gallego-neerlandes que rara vez aparecen en modelos genericos; puede usarse como base para sistemas de traduccion neuronal fine-tuneados.
- Generacion de texto en idiomas minoritarios: para medios de comunicacion, administraciones publicas o editoriales que necesitan generar contenido en irlandes, estonio o esloveno, donde los modelos comerciales suelen tener cobertura deficiente.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (5,7 GB) y Q4_K_S (5,4 GB) permiten ejecutar el modelo en GPUs consumer con 8 GB de VRAM o incluso en CPU con llama.cpp, lo que habilita prototipos locales sin infraestructura cloud.
- Base para investigacion academica en NLP multilingue: el modelo permite experimentar con tecnicas de adaptacion (LoRA, prefix tuning) en 35 idiomas con un coste computacional moderado (~9 mil millones de parametros).
- Generacion de texto aumentada (RAG) en entornos multilingues: combinado con un sistema de recuperacion, puede servir como motor de generacion en bases de conocimiento que mezclan documentos en varios idiomas europeos, aprovechando su cobertura linguistica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion):
  - Q2_K: ~3,7 GB de pesos; ~4,5-5 GB de VRAM total con overhead.
  - Q4_K_M: ~5,7 GB de pesos; ~7-8 GB de VRAM total.
  - Q5_K_M: ~6,6 GB de pesos; ~8-9 GB de VRAM total.
  - Q8_0: ~9,8 GB de pesos; ~11-12 GB de VRAM total.
  - f16: ~18,4 GB de pesos; ~20-22 GB de VRAM total.
- GPU recomendadas: para f16 o Q8_0, una RTX 4090 (24 GB), A100 (40/80 GB) o H100; para Q4/Q5, una RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4070 (12 GB).
- Cabe en GPU consumer: si, con cuantizaciones Q4_K_M o inferiores en GPUs de 8 GB o mas (RTX 3060, RTX 4060, RTX 3070). Las cuantizaciones Q2_K y Q3 pueden caber en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), LM Studio, text-generation-webui, y servidores compatibles con GGUF como llama-cpp-python. vLLM y TGI no soportan GGUF de forma nativa; para esos motores seria necesario usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato disponible |
|---|---|---|---|---|---|
| EuroLLM1.5-9B-Base (este) | ~9,15 mil millones | no disponible | 35 | Apache 2.0 | GGUF, safetensors |
| Llama 3.1 8B | ~8 mil millones | 128K (declarado) | ~8 principales | Llama 3.1 Community License | GGUF, safetensors |
| Mistral 7B v0.3 | ~7,2 mil millones | 32K | principalmente ingles | Apache 2.0 | GGUF, safetensors |
| Qwen2.5 7B | ~7,6 mil millones | 128K | 29 (incluye chino) | Apache 2.0 | GGUF, safetensors |

La comparativa se limita a parametros, licencia y cobertura linguistica, ya que no se dispone de datos de rendimiento del modelo EuroLLM1.5 en benchmarks. La principal ventaja diferencial de EuroLLM1.5-9B-Base frente a Llama 3.1 8B y Mistral 7B es su cobertura de 35 idiomas (incluidos irlandes, maltes, gallego, croata, esloveno, etc.) con licencia Apache 2.0 plenamente permisiva. Qwen2.5 7B ofrece una cobertura linguistica amplia (29 idiomas) pero esta orientada hacia el chino y el ingles.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no respondera de forma fiable a prompts conversacionales; requiere fine-tuning o uso como modelo de completacion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; al no estar alineado, la tasa de alucinacion puede ser mayor que en modelos instruct.
- Sesgos conocidos: no documentados en la informacion disponible; los sesgos del dataset de entrenamiento original no estan descritos.
- Longitud de contexto: no disponible; esto limita la planificacion de aplicaciones que dependan de ventanas largas.
- Idiomas: la cobertura de 35 idiomas es declarada, pero no se dispone de evaluaciones por idioma que confirmen la calidad relativa (el rendimiento en irlandes o maltes probablemente sera inferior al de espanol o aleman, aunque no hay datos que lo confirmen).
- Licencia Apache 2.0: permite uso comercial sin restricciones, pero el usuario debe verificar el cumplimiento con las normativas aplicables (por ejemplo, RGPD en el contexto europeo) al desplegar el modelo en produccion.
- Cuantizaciones de baja calidad (Q2_K, Q3_K_M): la propia model card advierte que Q3_K_M es de "menor calidad"; para produccion se recomienda Q4_K_M o superior.
- Repositorio de 81,6 GB: incluye todas las cuantizaciones; la descarga individual de cada archivo GGUF es independiente.

## Enlaces

- Repositorio Hugging Face (cuantizado): https://huggingface.co/mradermacher/EuroLLM1.5-9B-Base-GGUF
- Modelo base original: https://huggingface.co/utter-project/EuroLLM1.5-9B-Base
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/EuroLLM1.5-9B-Base-i1-GGUF
- Pagina de descargas convenientes del autor: https://hf.tst.eu/model#EuroLLM1.5-9B-Base-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests

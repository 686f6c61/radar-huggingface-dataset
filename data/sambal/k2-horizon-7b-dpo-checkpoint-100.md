# sambal/k2-horizon-7b-dpo-checkpoint-100

## Resumen

K2-Horizon-7B DPO (checkpoint 100) es un ajuste fino del modelo base IFM/K2-Horizon-7B (revision `446bf311`) mediante DPO (Direct Preference Optimization) sobre un conjunto de datos de preferencias de pregunta-respuesta especializado en petrofisica de registros de pozo (well logs). Lo publica el usuario sambal y no es un modelo nuevo desde cero: es un checkpoint intermedio de un run de ajuste por preferencias, el paso 100 de 251 planificados para 2 epocas.

El ajuste se hizo con adaptadores LoRA (r=8, alpha=32, dropout 0.05 sobre todas las capas lineales) entrenados con Megatron a traves de ms-swift y posteriormente fusionados en los pesos base, de modo que el repositorio contiene un modelo bf16 completo y no un adaptador separable. El unico artefacto publicado son pesos safetensors en bf16 (18,0 GB de repositorio) para la libreria transformers, con codigo remoto propio (`k2_horizon`) y plantilla de chat sin modificar respecto al modelo base.

Su relevancia es doble. Por un lado, es un ejemplo de especializacion vertical de un LLM de ~9.000 millones de parametros en un dominio tecnico muy concreto (interpretacion petrofisica), con un dataset de preferencias pequeno (8.055 pares de entrenamiento) y una infraestructura de entrenamiento documentada (32 x A100-80GB con tensor parallel 4 y data parallel 8). Por otro, es un checkpoint intermedio con metricas de entrenamiento inusualmente saturadas (precision de preferencia del 100 % desde el paso 15), lo que lo convierte en un caso util para estudiar sobreajuste al objetivo DPO en dominios estrechos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura exacta no documentada en la informacion disponible; requiere codigo remoto `k2_horizon`) |
| Parametros totales | 8.999.178.240 (~9,0 B), segun safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 65.536 tokens en las secuencias del dataset de preferencias; la ventana nominal del modelo no se documenta |
| Tipos de cuantizacion | No se publican pesos cuantizados; el repositorio solo contiene bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (bf16), transformers con `trust_remote_code` |
| Modelo base | IFM/K2-Horizon-7B (revision `446bf311`) |
| Metodo de ajuste | DPO con perdida sigmoide, beta 0,1, RPO alpha 0,1; LoRA fusionado |
| Pipeline | text-generation |
| Version de transformers | >= 5.13 |

## Arquitectura y entrenamiento

El modelo parte de IFM/K2-Horizon-7B y conserva su arquitectura, su codigo remoto y su plantilla de chat sin cambios. El ajuste se realizo con DPO (perdida sigmoide, beta 0,1) incrementado con RPO alpha 0,1, que anade un termino de log-verosimilitud negativa sobre las respuestas elegidas, es decir, un componente de aprendizaje supervisado que evita que el modelo se aleje en exceso de la distribucion de las respuestas preferidas. El adaptador LoRA (r=8, alpha=32, dropout 0,05, aplicado a todas las capas lineales) se entreno con Megatron mediante ms-swift y se fusiono despues en los pesos base, por lo que no se puede separar ni reutilizar como adaptador independiente.

Los datos son 8.055 pares de preferencias de entrenamiento y 81 de validacion, con secuencias de hasta 65.536 tokens, en el dominio de pregunta-respuesta sobre registros petrofisicos de pozo. La programacion de entrenamiento fue: learning rate 1e-5 con decaimiento coseno hasta 1e-6, 5 % de warmup, batch global de 64, optimizador Adam con betas (0,9, 0,95) y weight decay 0,1. El checkpoint publicado corresponde al paso 100 de 251 planificados (2 epocas), con 6.400 pares vistos y un learning rate de 7,3e-6. El hardware fueron 32 GPU A100 de 80 GB con tensor parallel 4 y data parallel 8. La innovacion destacable del modelo base (modo de razonamiento con etiquetas `<ifm|think>...</ifm|think>`, `reasoning_effort="high"` por defecto) se mantiene intacta y se usa durante el ajuste.

## Capacidades

- Generacion de texto conversacional en formato de chat, con soporte multi-turno.
- Modo de razonamiento explicito: el modelo emite un bloque `<ifm|think>...</ifm|think>` antes de la respuesta final, que es el comportamiento por defecto de la plantilla de chat.
- Pregunta-respuesta tecnica especializada en petrofisica y registro de pozo (well logs), dominio sobre el que se ha optimizado la preferencia.
- Manejo de contexto largo: el entrenamiento trabaja con secuencias de hasta 65.536 tokens, lo que permite procesar documentos tecnicos extensos o trazas de registro completas.
- Alineacion por preferencias: respuestas ajustadas para maximizar la preferencia del anotador en el dataset de petrofisica.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el modo de razonamiento explicito es el unico indicio.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no soportadas segun la informacion disponible (pipeline exclusivamente de text-generation).
- Despliegue en vLLM con `--reasoning-parser k2_horizon` para parsear el bloque de razonamiento.

## Casos de uso

- Asistente de interpretacion petrofisica: un geocientifico puede plantear preguntas en lenguaje natural sobre curvas de registro (gamma ray, resistividad, densidad, neutron, sonic) y obtener respuestas razonadas. La ventana de hasta 65.536 tokens permite incluir la traza completa o el informe de pozo junto con la pregunta.
- Extraccion y normalizacion de datos de informes de pozo: dado un informe tecnico extenso, el modelo puede resumir o reformular valores de porosidad, saturacion de agua o litologia. Requiere validacion humana obligatoria por el riesgo de alucinacion de cifras.
- Formacion y onboarding de geologos junior: el modelo actua como tutor que explica conceptos de interpretacion de registros siguiendo el estilo de las respuestas preferidas del dataset, con el bloque de razonamiento visible para auditar el hilo argumental.
- Generacion asistida de borradores de informes petrofisicos: el modelo redacta secciones descriptivas a partir de datos de entrada, que el especialista revisa y firma. La licencia Apache-2.0 permite integrarlo en herramientas internas de la operadora.
- Punto de partida para nuevos ajustes por preferencias: al ser un checkpoint intermedio, sirve como inicializacion para experimentos de DPO en dominios cercanos (geomecanica, ingenieria de yacimientos), evitando partir del modelo base.
- Evaluacion comparativa de checkpoints: la existencia simultanea del checkpoint 150 en el mismo run permite medir el efecto del entrenamiento adicional sobre la calidad de las respuestas y sobre el sobreajuste, sirviendo como caso de estudio metodologico.
- Chatbot interno de consulta documental para equipos de exploracion y produccion: desplegado con vLLM detras de una API compatible con OpenAI, con contexto largo para adjuntar varios informes de pozo en una misma sesion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las unicas metricas publicadas son de entrenamiento y validacion del propio objetivo DPO:

| Metrica | Paso 1 | Paso 100 | Validacion (paso 100) |
|---|---|---|---|
| Precision de preferencia | No disponible | 100 % (desde el paso 15) | 100 % |
| NLL de la respuesta elegida | 0,689 | 0,621 | 0,612 |
| Margen de recompensa | No disponible | No disponible | 59,9 |

Estas cifras miden el ajuste al dataset de preferencias, no la calidad general del modelo. Una precision de preferencia del 100 % sostenida implica que el modelo distingue todas las parejas del conjunto de validacion, lo que es compatible tanto con un ajuste correcto como con una saturacion temprana del objetivo.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 18 GB solo para los pesos (8.999 millones de parametros a 2 bytes), mas la cache KV y el overhead del runtime; en la practica entre 20 y 24 GB para contextos moderados.
- GPU consumer: cabe con dificultad en una RTX 4090 de 24 GB en bf16 y con contexto limitado; para ventanas cercanas a 64K se necesita cuantizacion de la cache KV o de los pesos, no publicada en el repositorio. En GPUs de 16 GB no cabe sin cuantizar.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 80 GB y similares sin problema en bf16.
- Entrenamiento de referencia: 32 x A100-80GB con tensor parallel 4 y data parallel 8.
- Despliegue recomendado: vLLM con `--trust-remote-code --dtype bfloat16 --reasoning-parser k2_horizon`, tal como indica el autor.
- Otras opciones: TGI requeriria soportar el codigo remoto `k2_horizon`, algo no confirmado. llama.cpp y Ollama no son viables mientras no se publiquen pesos GGUF y no se resuelva la dependencia de codigo remoto personalizado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de Qwen2.5-7B-Instruct y Llama-3.1-8B-Instruct proceden de su documentacion publica, no de la informacion proporcionada para este modelo, y se incluyen solo como referencia de categoria.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| K2-Horizon-7B DPO (checkpoint 100) | ~9,0 B | Hasta 65.536 tokens en entrenamiento; nominal no documentado | Apache-2.0 | HuggingFace, requiere `trust_remote_code`; sin GGUF |
| IFM/K2-Horizon-7B (base) | No disponible | No disponible | No disponible | HuggingFace, requiere `trust_remote_code` |
| Qwen2.5-7B-Instruct | 7,6 B | 128K | Apache-2.0 | HuggingFace, ecosistema amplio (GGUF, vLLM, TGI) |
| Llama-3.1-8B-Instruct | 8,0 B | 128K | Llama 3.1 Community License | HuggingFace, ecosistema amplio (GGUF, vLLM, TGI) |

La ventaja de este modelo no es el rendimiento general, sino la especializacion en petrofisica y la trazabilidad de su ajuste. Frente a alternativas generalistas, carece de cuantizaciones publicadas, de benchmarks estandar y de validacion por parte de la comunidad (0 descargas, 0 likes en el momento de redactar esta ficha).

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 100 de 251 planificados, no al modelo final del run. Existe un checkpoint posterior (`checkpoint-150`) que puede superarlo.
- Saturacion del objetivo DPO: la precision de preferencia alcanza el 100 % en el paso 15 y se mantiene hasta el 100, con un margen de recompensa de 59,9 en validacion. Esto puede indicar sobreajuste al dataset de preferencias, con degradacion de capacidades generales no medidas.
- Sin benchmarks estandar: no hay datos publicos de MMLU, HumanEval, GSM8K ni evaluaciones de dominio que permitan comparar con alternativas.
- Dataset de preferencias reducido: 8.055 pares de entrenamiento y 81 de validacion, todos de un unico dominio tecnico.
- Riesgo de alucinacion en datos numericos: en petrofisica, una cifra inventada (porosidad, saturacion, profundidad) puede tener consecuencias tecnicas y economicas. Toda salida debe verificarse contra el dato original.
- Especializacion estrecha: el ajuste por preferencias sobre petrofisica puede degradar el comportamiento en conversacion general respecto al modelo base.
- Idiomas no documentados: no se especifica que lenguas soporta ni en que idioma se recogieron las preferencias; no debe asumirse un rendimiento correcto en castellano.
- Dependencia de codigo remoto: `trust_remote_code=True` implica ejecutar codigo del repositorio, un riesgo de seguridad en entornos de produccion y un obstaculo para integrarlo en runtimes que no lo soportan.
- Sin cuantizaciones: no hay GGUF, AWQ ni GPTQ publicados, lo que dificulta el despliegue en CPU, en GPUs de gama baja o en entornos edge.
- Discrepancia de nomenclatura: el nombre indica 7B, pero el recuento real de safetensors es de 8.999.178.240 parametros (~9,0 B). Conviene dimensionar el hardware con la cifra real.
- Licencia: Apache-2.0 permite uso comercial, pero no cubre el codigo remoto de terceros ni los datos de entrenamiento, cuyo origen y condiciones no se detallan.
- Falta de validacion externa: 0 descargas y 0 likes en el momento de redactar la ficha; sin informes independientes de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sambal/k2-horizon-7b-dpo-checkpoint-100
- Checkpoint posterior del mismo run: https://huggingface.co/sambal/k2-horizon-7b-dpo-checkpoint-150
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Revision concreta del modelo base citada por el autor: `446bf311`
- La busqueda web realizada no devolvio enlaces relevantes al modelo: los resultados obtenidos corresponden a contenido no relacionado (programas de afiliados y avisos de una plataforma de intercambio de criptomonedas), por lo que no se incluyen. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo.

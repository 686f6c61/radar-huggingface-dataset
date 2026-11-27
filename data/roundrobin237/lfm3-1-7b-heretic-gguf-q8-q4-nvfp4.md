# RoundRobin237/LFM3-1.7B-heretic-GGUF-Q8-Q4-NVFP4

## Resumen

LFM3-1.7B-heretic es una variante del modelo LiquidAI/LFM3-1.7B a la que se ha aplicado la tecnica Heretic de ablacion de rango arbitrario (ARA) para reducir drasticamente la tasa de rechazos (refusals). El autor, RoundRobin237, publica el checkpoint BF16 resultante en Safetensors junto con cuatro variantes GGUF (BF16, Q8_0, Q4_K_M y NVFP4) listas para su uso con llama.cpp. El modelo base es un transformer de 1.728.801.536 parametros desarrollado por Liquid AI.

La relevancia de esta ficha radica en que combina un modelo pequeno y eficiente con una modificacion orientada a eliminar el comportamiento de rechazo del modelo original, manteniendo una divergencia KL baja (0,2634) respecto a la distribucion de tokens del modelo sin modificar. Segun la model card, la tasa de rechazo medida con el scorer KeywordRate de Heretic cae de 91/100 a 5/100 sobre un conjunto de 100 prompts, una reduccion de 86 puntos porcentuales.

El repositorio ocupa 11,2 GB e incluye tanto los pesos en formato GGUF como el checkpoint BF16 en Safetensors, la configuracion, el tokenizer, la plantilla de chat y el codigo del modelo LFM3. La licencia es LFM Open License v1.0 (lfm1.0), declarada como "other" en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM3 (modelo base LiquidAI/LFM3-1.7B) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M, NVFP4 (mezcla de NVFP4 para 72 tensores feed-forward y Q8_0 para el resto de matrices) |
| Idiomas soportados | en, ko |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | Safetensors (BF16) y GGUF (BF16, Q8_0, Q4_K_M, NVFP4) |

## Arquitectura y entrenamiento

El modelo es una modificacion del checkpoint LiquidAI/LFM3-1.7B mediante Heretic, una herramienta que aplica ablacion de rango arbitrario (ARA) sobre los pesos para reducir la probabilidad de respuestas de rechazo. Segun la model card, se ejecutaron 30 ensayos de ARA y se selecciono el ensayo 21 por presentar la menor divergencia KL entre los candidatos de Pareto que se encontraban a menos de cinco puntos porcentuales de la tasa de rechazo minima. La divergencia KL de las distribuciones del primer token sobre prompts benignos es de 0,2634 frente al modelo original, que se toma como referencia con valor 0.

Los pesos modificados estan presentes tanto en el checkpoint BF16 en Safetensors como en las cuatro variantes GGUF. La variante NVFP4 almacena 72 tensores de pesos feed-forward en NVFP4 con escalas por tensor, mientras que el resto de matrices de pesos permanecen en Q8_0. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en el modelo base; la model card no detalla esos aspectos.

La model card indica que la carga y la generacion de texto se verificaron con Transformers 5.18.0 y `trust_remote_code=True`. Los cuatro archivos GGUF se probaron con llama.cpp b12669 en Windows, con una pregunta en coreano en CPU y un prompt corto de generacion de codigo Python en una GPU RTX 5090 Laptop. El soporte de NVFP4 para LFM3 se anadio en llama.cpp b12088.

## Capacidades

- Generacion de texto conversacional en ingles y coreano, segun los idiomas declarados en la model card.
- Reduccion del comportamiento de rechazo: la tasa medida con el scorer KeywordRate de Heretic pasa de 91/100 a 5/100 sobre el conjunto de evaluacion de 100 prompts.
- Generacion de codigo: la model card menciona una prueba de generacion de un prompt corto de Python en GPU.
- Compatibilidad con llama.cpp y con Transformers mediante `trust_remote_code=True`.
- Soporte de cuantizacion NVFP4 en llama.cpp a partir de la build b12088.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- No se dispone de informacion sobre tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio ni modo thinking en la informacion proporcionada.

## Casos de uso

- Despliegue local en equipos de consumo: la variante Q4_K_M ocupa 1,10 GB y la Q8_0 1,85 GB, lo que permite ejecutar el modelo en GPU consumer y en CPU mediante llama.cpp para prototipos de generacion de texto.
- Generacion de codigo en entornos con recursos limitados: la variante NVFP4 (1,28 GB) esta pensada para GPUs con soporte de FP4, como la RTX 5090 Laptop empleada en las pruebas del autor, y puede usarse para autocompletado o generacion de scripts cortos.
- Asistentes conversacionales en ingles y coreano: el modelo declara soporte para ambos idiomas y puede emplearse en chatbots de proposito general donde se quiera evitar que el modelo rechace peticiones por defecto.
- Investigacion sobre alineacion y rechazos: al publicarse el checkpoint BF16 junto con las metricas de Heretic (tasa de rechazo y divergencia KL), sirve como material para estudiar el efecto de la ablacion ARA sobre el comportamiento de un modelo pequeno.
- Evaluacion de cuantizaciones: al ofrecerse cuatro formatos (BF16, Q8_0, Q4_K_M, NVFP4) del mismo checkpoint, es util para comparar calidad y rendimiento entre niveles de cuantizacion en pipelines de llama.cpp.
- Filtrado y reescritura de texto en local: con 1,7 mil millones de parametros y un peso reducido en disco, puede integrarse en herramientas de escritorio que requieran inferencia sin conexion y sin enviar datos a servicios externos.

## Benchmarks y rendimiento

La model card solo publica la evaluacion de rechazos de Heretic. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica | LiquidAI original | Heretic trial 21 |
|---|---:|---:|
| Rechazos detectados por el scorer KeywordRate de Heretic | 91 / 100 | 5 / 100 |
| Divergencia KL de las distribuciones del primer token en prompts benignos | 0 (referencia) | 0,2634 |

Estas mediciones corresponden al checkpoint BF16 antes de la cuantizacion GGUF y el scorer emplea coincidencia de palabras clave, segun advierte la propia model card.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,10 GB para Q4_K_M, 1,28 GB para NVFP4, 1,85 GB para Q8_0 y 3,47 GB para BF16, a los que hay que sumar el overhead del runtime y la cache KV.
- GPU recomendadas: no se especifican en la informacion disponible; el autor verifico la generacion en una RTX 5090 Laptop GPU para el prompt de codigo y en CPU para la pregunta en coreano.
- Cabe en GPU consumer: si, dado el tamano de los archivos GGUF; la variante NVFP4 requiere soporte de FP4 en el runtime (llama.cpp b12088 o superior).
- Opciones de despliegue: llama.cpp (probado con la build b12669) y Transformers 5.18.0 con `trust_remote_code=True`. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---:|---|---|---|---|
| LFM3-1.7B-heretic (este) | 1.728.801.536 | no disponible | en, ko | LFM Open License v1.0 | Safetensors BF16, GGUF BF16/Q8_0/Q4_K_M/NVFP4 |
| LiquidAI/LFM3-1.7B (base) | 1.728.801.536 | no disponible | no disponible en esta ficha | LFM Open License v1.0 | Safetensors (repo original) |
| Otras alternativas de ~1-2B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que la informacion proporcionada no incluye datos de rendimiento ni especificaciones de otros modelos de tamano similar que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La evaluacion de rechazos se basa en un scorer de coincidencia de palabras clave sobre 100 prompts, por lo que la cifra de 5/100 no garantiza la ausencia de rechazos en prompts individuales; la propia model card lo advierte.
- La modificacion Heretic altera los pesos del modelo base y puede afectar a la calidad o al comportamiento en dominios distintos de los evaluados; la divergencia KL de 0,2634 indica un cambio medible en la distribucion de tokens.
- El modelo solo declara soporte para ingles y coreano; no hay informacion sobre su rendimiento en castellano ni en otros idiomas.
- No se dispone de datos sobre sesgos, tasa de alucinacion ni evaluaciones de seguridad del checkpoint modificado.
- La licencia es la LFM Open License v1.0, declarada como "other" en Hugging Face; es necesario revisar el archivo LICENSE del repositorio antes de un uso comercial.
- La variante NVFP4 requiere una version de llama.cpp con soporte especifico (b12088 o posterior) y hardware compatible con FP4.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que limita la planificacion de cargas con conversaciones largas.
- El modelo tiene 1,7 mil millones de parametros, por lo que su capacidad de razonamiento complejo y de generacion de codigo extenso es limitada en comparacion con modelos de mayor tamano.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RoundRobin237/LFM3-1.7B-heretic-GGUF-Q8-Q4-NVFP4
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Revision concreta del modelo base referenciada en la model card: https://huggingface.co/LiquidAI/LFM3-1.7B/tree/1da06bec6a819da10b54c67e5c90972b46d81871
- Heretic (repositorio): https://github.com/p-e-w/heretic/tree/aecd4a845a23be3f96ddc03b37b53a9195ee2566
- Pull request de llama.cpp con soporte NVFP4 para LFM3: https://github.com/ggml-org/llama.cpp/pull/31608
- Checkpoint BF16 en Safetensors: https://huggingface.co/RoundRobin237/LFM3-1.7B-heretic-GGUF-Q8-Q4-NVFP4/blob/main/model.safetensors
- GGUF BF16: https://huggingface.co/RoundRobin237/LFM3-1.7B-heretic-GGUF-Q8-Q4-NVFP4/resolve/main/LFM3-1.7B-Heretic-BF16.gguf
- GGUF Q8_0: https://huggingface.co/RoundRobin237/LFM3-1.7B-heretic-GGUF-Q8-Q4-NVFP4/resolve/main/LFM3-1.7B-Heretic-Q8_0.gguf
- GGUF Q4_K_M: https://huggingface.co/RoundRobin237/LFM3-1.7B-heretic-GGUF-Q8-Q4-NVFP4/resolve/main/LFM3-1.7B-Heretic-Q4_K_M.gguf
- GGUF NVFP4: https://huggingface.co/RoundRobin237/LFM3-1.7B-heretic-GGUF-Q8-Q4-NVFP4/resolve/main/LFM3-1.7B-Heretic-NVFP4.gguf
- Licencia LFM Open License v1.0: https://huggingface.co/RoundRobin237/LFM3-1.7B-heretic-GGUF-Q8-Q4-NVFP4/blob/main/LICENSE

# Phonse/qwen2.5-7b-sheng-dpo-gguf

# Qwen2.5-7b-sheng-dpo-gguf: ficha tecnica del modelo

## Resumen

El repositorio `Phonse/qwen2.5-7b-sheng-dpo-gguf` contiene una version cuantizada en formato GGUF de un ajuste fino sobre la arquitectura Qwen2.5-7B. El autor (Phonse) indica en la model card que el modelo fue entrenado y convertido a GGUF utilizando Unsloth, y publica un unico archivo de pesos llamado `sheng_sft_recovered.Q4_K_M.gguf`. El nombre del modelo sugiere un ajuste con DPO sobre un checkpoint previamente sometido a SFT, aunque la model card no documenta ni el proceso de entrenamiento ni los datos utilizados.

Se trata, por tanto, de una publicacion de tipo comunitario y experimental: el repositorio acumula 0 descargas y 0 "likes" en los metadatos disponibles, carece de pipeline declarado, de licencia explicita, de idiomas declarados y de cualquier resultado de evaluacion. Su interes actual es limitado y esta vinculado al ecosistema de ejecucion local: al estar en GGUF, puede desplegarse directamente con llama.cpp, Ollama o servidores compatibles sin necesidad de GPU de gama alta.

El dato mas fiable del repositorio es el recuento de parametros de los pesos originales en safetensors: 7.615.616.512 parametros, coherente con la familia Qwen2.5-7B. El repositorio ocupa 4,7 GB, lo que corresponde practicamente en su totalidad al unico archivo GGUF Q4_K_M. La fecha de creacion registrada en los metadatos es el 27 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura base Qwen2.5-7B: RoPE, SwiGLU, RMSNorm, GQA). No confirmada de forma explicita en la model card de este repositorio |
| Parametros totales | 7.615.616.512 (pesos originales en safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card. La arquitectura base Qwen2.5-7B soporta 32.768 tokens nativos, ampliables a 131.072 con YaRN; no hay confirmacion de que este ajuste conserve dicha configuracion |
| Tipos de cuantizacion | Unicamente Q4_K_M (`sheng_sft_recovered.Q4_K_M.gguf`). Al ser GGUF, es recuantizable localmente con llama.cpp, pero el repositorio no publica otras variantes |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no la declara) |
| Formato de pesos | GGUF (tambien se mencionan pesos originales en safetensors, 7,61 B de parametros) |
| Tamano del repositorio | 4,7 GB |
| Herramienta de entrenamiento y conversion | Unsloth |
| Fecha de publicacion (metadatos) | 2026-09-27 |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo mas alla de su origen: un ajuste fino de Qwen2.5-7B convertido a GGUF con Unsloth. Por la nomenclatura del identificador (`sheng-dpo`) y del archivo (`sheng_sft_recovered`), cabe inferir un flujo de dos etapas (SFT seguido de DPO), pero no hay ningun detalle publicado sobre el dataset, el numero de tokens de entrenamiento, la composicion de los datos, la duracion del entrenamiento, los hiperparametros ni la existencia de fases de RLHF o DPO confirmadas. El calificativo "recovered" en el nombre del archivo sugiere que el checkpoint SFT fue recuperado o reconstruido, sin mas contexto.

Tampoco se documentan innovaciones tecnicas propias: no hay mencion a decodificacion especulativa, atencion lineal, MoE ni modificaciones sobre el transformer estandar. La unica aportacion tecnica verificable del repositorio es el uso de Unsloth para acelerar el ajuste fino y la conversion a GGUF, junto con el soporte de plantillas de chat mediante la bandera `--jinja` de llama.cpp.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como `conversational` y los ejemplos de uso de la model card estan orientados a chat mediante `llama-cli --jinja`.
- Razonamiento y conocimiento general heredados de la base Qwen2.5-7B: la model card no documenta ninguna evaluacion que confirme el grado de conservacion de estas capacidades tras el ajuste.
- Capacidades multilingues: no disponibles. Los idiomas no estan declarados en los metadatos ni en la model card.
- Soporte de tool calling / function calling: no disponible. No se menciona en la documentacion, aunque las plantillas Jinja de Qwen2.5 permiten formatos de llamada a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible ni documentado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. La model card incluye la linea de ejemplo `llama-mtmd-cli` para modelos multimodales, pero se trata de una plantilla generica de Unsloth; no hay evidencia de que este repositorio incluya un proyector multimodal ni pesos de vision.
- Sistema de plantillas de chat: compatible con `--jinja` en llama.cpp.

## Casos de uso

- Inferencia local en equipos sin GPU dedicada: el unico archivo publicado es una cuantizacion Q4_K_M de 4,7 GB, ejecutable con llama.cpp sobre CPU y RAM del sistema, lo que permite probar el modelo en portatiles o servidores sin acelerador.
- Prototipado rapido de asistentes conversacionales en chino o en dominios especificos: si el ajuste esta orientado a un nicho concreto (el nombre "sheng" apunta a un corpus especifico no documentado), el modelo puede servir como banco de pruebas antes de invertir en un entrenamiento mayor.
- Despliegue en GPUs de consumo para desarrollo: con unos 5,5-6,5 GB de VRAM en Q4_K_M, entra en tarjetas de 8-12 GB, lo que permite iterar sobre prompts y plantillas sin coste de nube.
- Evaluacion comparativa de ajustes comunitarios: util como punto de referencia frente a `Qwen2.5-7B-Instruct` para medir el efecto de un ajuste DPO no documentado sobre un mismo prompt set.
- Servicio de chat interno de bajo trafico: mediante `llama-server` o Ollama, se puede exponer un endpoint compatible con la API de OpenAI para uso interno, siempre que se acepte la ausencia de garantias de licencia y de calidad.
- Generacion de texto offline en entornos aislados: al ser un unico archivo GGUF sin dependencias de nube, encaja en escenarios air-gapped donde no se permite enviar datos a APIs externas.
- Filtrado y preprocesado de texto en pipelines de datos: tareas genericas de resumen, reescritura o etiquetado semi-automatico donde el coste por token es cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y no existe informe de evaluacion asociado al repositorio.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| MT-Bench | No disponible |
| Cualquier otra metrica | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 4,7 GB solo para los pesos; con contexto moderado, alrededor de 5,5-6,5 GB en total.
- Cache KV: segun la arquitectura base Qwen2.5-7B (28 capas, 4 cabezas KV, cabeza de 128 dimensiones), la cache en fp16 consume en torno a 56 KB por token, es decir, cerca de 1,9 GB para una ventana completa de 32.768 tokens. La model card de este repositorio no confirma la ventana soportada ni el tipo de cuantizacion de la cache.
- GPUs consumer compatibles: cualquier tarjeta con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 3080, etc.). En tarjetas de 8 GB conviene limitar el contexto o cuantizar la cache KV.
- GPU de gama alta: A100, H100 o L40S no aportan ventaja en VRAM para esta cuantizacion, pero si en throughput si se sirve en lote.
- Inferencia en CPU: viable con llama.cpp, con rendimiento dependiente del numero de nucleos y del ancho de banda de memoria; no se han publicado mediciones.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, y cualquier runtime que consuma GGUF. Tambien es compatible con endpoints de tipo OpenAI a traves de los servidores anteriores. vLLM y TGI no consumen GGUF de forma nativa, por lo que requeririan reconvertir a safetensors; no se documenta ese procedimiento en el repositorio.
- Latencia y throughput: no disponibles. No se ha publicado ninguna medicion de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La comparativa se realiza contra los modelos de referencia de la misma categoria, dado que este ajuste no publica metricas propias. Los datos de la columna de contexto corresponden a las configuraciones oficiales de cada modelo base.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicos |
|---|---|---|---|---|---|
| Phonse/qwen2.5-7b-sheng-dpo-gguf | 7,61 B | No disponible | No disponible | GGUF Q4_K_M, 0 descargas | No disponibles |
| Qwen/Qwen2.5-7B-Instruct | 7,61 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Safetensors y GGUF oficiales | Publicados por el equipo Qwen |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 131.072 | Llama 3.1 Community License | Safetensors y GGUF de terceros | Publicados por Meta |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 | Apache 2.0 | Safetensors y GGUF de terceros | Publicados por Mistral |

Frente a estas alternativas, el modelo de Phonse no aporta datos verificables de rendimiento, licencia ni contexto, por lo que la comparacion se limita a la coincidencia de tamano con Qwen2.5-7B. Para uso en produccion, las versiones oficiales ofrecen garantias de licencia y trazabilidad de evaluacion que este repositorio no proporciona.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse, no se puede asumir uso comercial permitido. Aunque la base Qwen2.5-7B se distribuye habitualmente bajo Apache 2.0, la ausencia de declaracion explicita en este repositorio impide confirmarlo y conviene verificar la procedencia antes de cualquier despliegue comercial.
- Ausencia total de evaluacion: sin benchmarks, sin informes y sin descargas registradas, no hay ninguna evidencia empirica de que el ajuste haya mejorado capacidades respecto al modelo base; es posible que las haya degradado.
- Riesgo de alucinacion: inherente a los modelos de 7 B de parametros, y no cuantificado en este caso.
- Idiomas no declarados: se desconoce el soporte multilingue real. Si el ajuste se ha realizado sobre un corpus especifico (el nombre "sheng" sugiere un dominio o idioma concreto), es probable que se haya producido un estrechamiento del comportamiento conversacional general.
- Contexto no confirmado: no se especifica si se mantiene la ventana nativa de la base ni si el ajuste la ha reducido.
- Sesgos: no documentados. Al no conocerse la composicion del dataset de ajuste, no es posible evaluar sesgos de genero, ideologicos, culturales o de dominio.
- Procedencia opaca del checkpoint: la etiqueta "recovered" en el nombre del archivo apunta a una reconstruccion del checkpoint SFT, lo que añade incertidumbre sobre la integridad y la fidelidad del entrenamiento.
- Reproducibilidad limitada: no se documentan hiperparametros, semillas, datos ni versiones de las librerias, por lo que el ajuste no es reproducible.
- Fecha de publicacion en metadatos (2026-09-27) posterior a la fecha actual de referencia; conviene tratar este dato con cautela.
- Uso en produccion desaconsejado sin una evaluacion propia previa sobre el dominio objetivo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Phonse/qwen2.5-7b-sheng-dpo-gguf
- Unsloth (herramienta de entrenamiento y conversion declarada por el autor): https://github.com/unslothai/unsloth
- llama.cpp (runtime citado en los tags y en los ejemplos de uso): https://github.com/ggml-org/llama.cpp
- Modelo base de referencia, Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Variante instruct oficial, Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Articulo tecnico de la familia Qwen2.5: https://arxiv.org/abs/2412.15115

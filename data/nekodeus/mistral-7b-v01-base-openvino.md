# Nekodeus/mistral-7b-v01-base-openvino

## Resumen

Nekodeus/mistral-7b-v01-base-openvino es una conversion al formato OpenVINO IR del modelo mistralai/Mistral-7B-v0.1, el primer modelo abierto publicado por Mistral AI. La conversion aplica cuantizacion INT8 solo sobre los pesos (weight-only) mediante NNCF, manteniendo las activaciones en FP16/FP32 segun el trazado original, y se genero con optimum-intel 2.2.0, openvino 2026.4.1 y transformers 5.16.1 en un entorno de Kaggle limitado a CPU.

El modelo resuelve el problema de desplegar Mistral 7B en hardware sin GPU dedicada o con aceleracion Intel, ya que OpenVINO permite ejecutar inferencia optimizada sobre CPU, iGPU y NPU de Intel. Al ser la variante base (no instruct), esta pensado para tareas de continuacion de texto y como punto de partida para ajuste fino, no para dialogo instruccional directo.

Arquitectonicamente es un transformer decoder-only de 7,25 mil millones de parametros con Grouped Query Attention (GQA) y sliding window attention de 4096 tokens sobre una ventana total de 8192 tokens. La licencia Apache-2.0, heredada del modelo original, permite uso comercial sin restricciones adicionales. El repositorio ocupa 7,2 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (MistralForCausalLM) con GQA y sliding window attention |
| Parametros totales | 7,25 mil millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (ventana deslizante de 4096 tokens) |
| Tipos de cuantizacion | INT8 weight-only (NNCF); activaciones FP16/FP32 segun trazado |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (XML + BIN) |

## Arquitectura y entrenamiento

El modelo subyacente es mistralai/Mistral-7B-v0.1, un transformer autoregresivo decoder-only de 7,25 mil millones de parametros. La innovacion principal de esta arquitectura es el uso de Grouped Query Attention, que reduce el coste de memoria de la cache KV, junto con sliding window attention: cada capa atiende a los 4096 estados ocultos anteriores, lo que da un coste de computo lineal O(sliding_window.seq_len) en lugar de cuadratico sobre la secuencia completa. Segun la documentacion de Mistral AI, esto permite un ahorro cercano a 2x en las implementaciones de FlashAttention y xFormers.

En esta ficha no se dispone del numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO aplicadas al modelo base, ya que esa informacion no aparece en la model card facilitada. La model card indica unicamente que se trata de la version base original, sin ajuste instruccional, y que la conversion se realizo en modo offline con el comando `optimum-cli export openvino --task text-generation --weight-format int8`. La cuantizacion INT8 se aplica exclusivamente a los pesos; las activaciones conservan la precision con la que fueron trazadas.

## Capacidades

- Generacion de texto autoregresiva y continuacion de prompt, propia de un modelo base.
- Razonamiento y conocimiento general heredados del entrenamiento de Mistral 7B, aunque sin formato instruccional.
- Inferencia optimizada sobre CPU Intel mediante el runtime de OpenVINO.
- Ejecucion de la cache KV con GQA, lo que reduce el uso de memoria en contextos largos.
- No soporta tool calling ni function calling de forma nativa; es un modelo base sin plantilla de herramientas.
- No implementa modo de razonamiento explicito (thinking mode) ni capacidades de vision o audio.
- No hay datos sobre capacidades multilingues en la informacion disponible.

## Casos de uso

- Punto de partida para ajuste fino: al ser el modelo base en formato OpenVINO, se puede usar como referencia para comparar cuantizaciones o como origen de un fine-tuning posterior exportado a INT8.
- Generacion de texto sobre CPU: despliegue en servidores sin GPU dedicada usando OpenVINO GenAI, aprovechando la compresion INT8 para reducir el consumo de memoria.
- Prototipado en equipos de desarrollo sin acelerador grafico: al ejecutarse en CPU, permite validar pipelines de generacion antes de escalar a produccion.
- Relleno y completado de texto en entornos con requisitos de baja latencia sobre hardware Intel, como iGPU o NPU integradas.
- Investigacion sobre cuantizacion: sirve como caso de estudio para medir la degradacion de un modelo base de 7B al pasar los pesos a INT8 con NNCF.
- Generacion de datos sinteticos: se puede emplear para producir texto de continuacion a gran escala, con la advertencia de que al ser un modelo base no sigue instrucciones.
- Benchmarking interno de infraestructura: util para medir throughput y latencia de OpenVINO en distintas plataformas antes de migrar modelos mas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,3 GB solo para los pesos en INT8; a esto hay que sumar la cache KV, que crece con la longitud de contexto (estimacion, no dato publicado).
- GPU recomendadas: el modelo esta optimizado para OpenVINO, por lo que el objetivo principal es hardware Intel (CPU Xeon, iGPU Iris Xe, Arc, NPU). Tambien puede ejecutarse en GPU NVIDIA mediante otros runtimes si se convierte de nuevo.
- Compatibilidad con GPU de consumo: el tamano en INT8 queda al limite de una GPU de 8 GB como la RTX 3060 o 4060; en configuraciones de contexto largo puede no caber. En CPU cabe sin problema en 16 GB de RAM.
- Opciones de despliegue: OpenVINO GenAI (LLMPipeline) y optimum-intel (OVModelForCausalLM). No se proporcionan pesos GGUF, por lo que llama.cpp y Ollama requeririan una conversion previa. vLLM y TGI no son compatibles con el formato OpenVINO IR.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nekodeus/mistral-7b-v01-base-openvino | 7,25B | 8192 | OpenVINO IR INT8 | Apache-2.0 | HuggingFace |
| OpenVINO/mistral-7b-instruct-v0.1-fp16-ov | 7,25B | 8192 | OpenVINO IR FP16 | Apache-2.0 | HuggingFace |
| Nekodeus/mistral-7b-instruct-v02-openvino | 7,25B | 32768 | OpenVINO IR INT8 | Apache-2.0 | HuggingFace |
| mistralai/Mistral-7B-v0.1 | 7,25B | 8192 | safetensors FP16 | Apache-2.0 | HuggingFace |

La diferencia principal frente a las variantes instruct reside en que este modelo no sigue instrucciones ni dispone de plantilla de chat, mientras que las versiones v0.1-instruct y v0.2-instruct estan ajustadas para dialogo. La version v0.2 amplia el contexto hasta 32768 tokens, frente a los 8192 de esta ficha. El modelo original en FP16 ocupa aproximadamente el doble de espacio y no esta optimizado para inferencia en CPU.

## Limitaciones y advertencias

- Es un modelo base, no instruccional: no sigue ordenes ni responde en formato conversacional sin un ajuste previo.
- Riesgo elevado de alucinacion y de generar contenido incoherente o repetitivo en prompts mal formulados, como es habitual en modelos base.
- No se dispone de informacion sobre los idiomas soportados ni sobre el sesgo del dataset de entrenamiento original.
- El contexto maximo efectivo es de 8192 tokens, y la ventana deslizante de 4096 puede degradar la coherencia en dependencias a muy larga distancia.
- El formato OpenVINO IR limita su uso a los runtimes compatibles; no se puede cargar directamente con transformers estandar ni con llama.cpp sin conversion.
- No se han publicado evaluaciones que cuantifiquen la perdida de calidad tras la cuantizacion INT8 weight-only.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones del modelo original de Mistral AI.
- La fecha de creacion del repositorio es posterior a la fecha de consulta, lo que puede indicar que el artefacto no esta validado por la comunidad (cero descargas y cero likes).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nekodeus/mistral-7b-v01-base-openvino
- Modelo original: https://huggingface.co/mistralai/Mistral-7B-v0.1
- Anuncio de Mistral 7B: https://mistral.ai/news/announcing-mistral-7b/
- Documentacion de Mistral 7B v0.1: https://docs.mistral.ai/models/mistral-7b-0-1
- Documentacion de Mistral 7B v0.2: https://docs.mistral.ai/models/mistral-7b-0-2
- Variante instruct v0.2 en OpenVINO del mismo autor: https://huggingface.co/Nekodeus/mistral-7b-instruct-v02-openvino
- Variante instruct v0.1 en FP16 de OpenVINO: https://huggingface.co/OpenVINO/mistral-7b-instruct-v0.1-fp16-ov

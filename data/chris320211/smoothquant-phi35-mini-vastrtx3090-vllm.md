# chris320211/smoothquant-phi35-mini-vastrtx3090-vllm

## Resumen

SmoothQuant Phi-3.5-mini para vLLM es un checkpoint cuantizado del modelo `microsoft/Phi-3.5-mini-instruct`, publicado por el usuario `chris320211` a través de su herramienta QuantPort. Se trata de una cuantización SmoothQuant en formato W8A8 (pesos int8 por canal y activaciones int8 dinámicas por token), exportada nativamente al formato `compressed-tensors` que consume vLLM sin necesidad de código personalizado ni `trust_remote_code`. El modelo base es un transformer denso de 3.821.079.552 parámetros (aproximadamente 3.800 millones), lo que lo sitúa en la gama de modelos pequeños aptos para GPUs de consumo.

La relevancia de esta ficha radica en que ofrece una ruta de despliegue de Phi-3.5-mini con cuantización int8 lista para producción en vLLM, con métricas publicadas de perplejidad y throughput medidas sobre una RTX 3090. El autor reporta una degradación de perplejidad muy contenida (ratio 1.0290 frente a fp16) y una aceleración de prefill de 2,05x y de decodificación de 1,62x a batch 1, lo que hace atractivo el checkpoint para servir el modelo en hardware consumer sin sacrificar calidad de forma significativa.

El checkpoint hereda la licencia MIT del modelo base y se distribuye en safetensors (4,0 GB de repositorio). No se especifican idiomas soportados en los metadatos del repositorio, aunque al derivar de Phi-3.5-mini-instruct hereda las capacidades multilingües del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Phi-3.5-mini-instruct), cuantizado SmoothQuant W8A8 int8 |
| Parametros totales | 3.821.079.552 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | int8 W8A8: pesos int8 por canal, activaciones int8 dinamicas por token; 1 modulo mantenido en fp16 |
| Idiomas soportados | no disponible en los metadatos del repositorio |
| Licencia | MIT (heredada de microsoft/Phi-3.5-mini-instruct) |
| Formato de pesos | safetensors en formato `compressed-tensors` (`int-quantized`), compatible con vLLM |

## Arquitectura y entrenamiento

El checkpoint no entrena un modelo nuevo: es una cuantizacion post-entrenamiento del transformer denso `microsoft/Phi-3.5-mini-instruct` mediante SmoothQuant. La tecnica SmoothQuant migra la dificultad de cuantizacion de las activaciones hacia los pesos mediante un factor de escala por canal, permitiendo cuantizar tanto pesos como activaciones a int8 (W8A8) sin perder excesiva precision. En este caso, los pesos se almacenan en int8 por canal y las activaciones se cuantizan dinamicamente por token en int8, con un modulo que se conserva en fp16 (perfil `w8a8_int8`). El export se realiza con QuantPort y se renombra al esquema `compressed-tensors` que vLLM reconoce de forma nativa, sin código personalizado.

No se dispone de informacion sobre el dataset de calibracion empleado para SmoothQuant, el numero de tokens de calibracion ni la composicion del mismo. Tampoco se documentan procesos de RLHF, DPO ni fine-tuning adicional: la cuantizacion se aplica directamente sobre el modelo base instruct. La innovacion tecnica destacable es la verificacion de export: el autor compara la perplejidad del checkpoint exportado frente a la referencia HF y reporta una deriva de 0,9993 sobre el ratio esperado (1.0297), con un umbral de aceptacion de 1,02, lo que indica que la exportacion no introduce degradacion adicional sobre la cuantizacion.

## Capacidades

- Generacion de texto conversacional y de instrucciones, heredada de Phi-3.5-mini-instruct.
- Razonamiento y matematicas de nivel pequeno-medio, propio de la familia Phi-3.5.
- Generacion de codigo, con soporte para tareas de programacion del modelo base.
- Capacidades multilingues heredadas del modelo base (no documentadas explicitamente en este repositorio).
- Servicio nativo en vLLM mediante `vllm serve`, sin `trust_remote_code`.
- Inferencia con pesos int8 y activaciones int8 dinamicas por token.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion proporcionada.

## Casos de uso

- Servicio de chat conversacional de bajo coste: el checkpoint se sirve con `vllm serve` en una RTX 3090 y ofrece 145,4 tok/s de decodificacion a batch 1 y 1.593,2 tok/s a batch 16, adecuado para atender varias conversaciones simultaneas en una sola GPU consumer.
- Backend de asistentes para prototipos y demos: al heredar la licencia MIT y no requerir `trust_remote_code`, se puede integrar en productos internos o demos publicas sin friccion legal ni de seguridad de codigo.
- Generacion de codigo en pipelines de desarrollo: el modelo base Phi-3.5-mini-instruct esta orientado a instrucciones y codigo; el checkpoint int8 permite autocompletado y generacion de fragmentos con menor huella de VRAM que fp16.
- Procesamiento por lotes de texto (resumen, clasificacion, extraccion): el throughput de prefill de 17.645,9 tok/s y la decodificacion a batch 16 lo hacen viable para trabajos batch sobre grandes volumenes de texto.
- Despliegue en entornos con VRAM limitada: la cuantizacion int8 reduce el peso del modelo a aproximadamente 4 GB, permitiendo servirlo junto con otros procesos en GPUs de 24 GB o incluso en GPUs consumer de gama media-alta.
- Evaluacion comparativa de cuantizaciones: sirve como referencia reproducible (con `vllm.json` y `vllm_export.json` incluidos) para medir el impacto de SmoothQuant W8A8 frente a fp16 en tareas de generacion.
- Investigacion sobre cuantizacion post-entrenamiento: el repositorio documenta el perfil de export y las metricas de perplejidad, util para estudiar la relacion entre calidad y velocidad en W8A8.

## Benchmarks y rendimiento

Metricas medidas con vLLM 0.30.0 sobre NVIDIA GeForce RTX 3090, WikiText-2 test con ventanas de 2.048 tokens (65.504 tokens), comparando el checkpoint int8 frente a vLLM fp16 del modelo base:

| Metrica | vLLM int8 | vLLM fp16 |
|---|---:|---:|
| Perplejidad | 6,8184 | 6,6260 |
| Prefill (tok/s) | 17.645,9 | 8.592,2 |
| Decodificacion batch 1 (tok/s) | 145,4 | 90,0 |
| Decodificacion batch 16 (tok/s) | 1.593,2 | 1.071,5 |

- Ratio de perplejidad int8/fp16: 1,0290.
- Deriva frente al ratio de referencia HF (1,0297): 0,9993 (umbral de aceptacion ≤ 1,02).
- Aceleracion de prefill: 2,05x. Aceleracion de decodificacion: 1,62x a batch 1 y 1,49x a batch 16.
- No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4 GB de pesos int8 mas overhead de activaciones y KV cache; en la practica, unos 6-8 GB para contexto moderado.
- GPU recomendadas: NVIDIA RTX 3090 (hardware de referencia de las mediciones), A100, H100, L40S y GPUs con soporte de kernels int8 en vLLM.
- Cabe en GPU consumer: si, en RTX 3090, RTX 4090 y previsiblemente en GPUs de 8-12 GB para contextos cortos y batches pequenos.
- Opciones de despliegue: vLLM (`vllm serve chris320211/smoothquant-phi35-mini-vastrtx3090-vllm`), con API Python `LLM` y `SamplingParams`. No se documenta compatibilidad con llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: 145,4 tok/s de decodificacion a batch 1 y 1.593,2 tok/s a batch 16 en RTX 3090; prefill de 17.645,9 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| smoothquant-phi35-mini-vastrtx3090-vllm | 3.821.079.552 | no disponible | int8 W8A8 | MIT | vLLM nativo |
| microsoft/Phi-3.5-mini-instruct (fp16) | ~3.800 M | no disponible | fp16 | MIT | vLLM, HF Transformers |
| Otras cuantizaciones de Phi-3.5-mini | no disponible | no disponible | no disponible | MIT (heredada) | no disponible |

La comparativa relevante es frente al modelo base en fp16: el checkpoint int8 reduce el peso a aproximadamente la mitad, ofrece 2,05x mas prefill y 1,49-1,62x mas decodificacion, con un coste de perplejidad del 2,9 %. No se dispone de datos de benchmarks estandar ni de comparativas con otras alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion int8 introduce una degradacion medible de calidad: perplejidad de 6,8184 frente a 6,6260 en fp16 (ratio 1,0290); no es un checkpoint sin perdida.
- El modelo base Phi-3.5-mini-instruct es de tamano pequeno y puede alucinar y fallar en razonamiento complejo; la cuantizacion puede agravar estos fallos en tareas sensibles.
- No se documentan idiomas soportados en el repositorio; el rendimiento multilingue depende del modelo base y no esta verificado para este checkpoint.
- No se documenta la longitud de contexto efectiva del checkpoint cuantizado; conviene validarla antes de usos con contextos largos.
- La licencia es MIT, lo que permite uso comercial, pero se hereda del modelo base y del repositorio del metodo; conviene revisar ambas licencias.
- El checkpoint esta disenado especificamente para vLLM con `compressed-tensors`; no se garantiza su funcionamiento en otros runtimes.
- Las mediciones de velocidad son especificas de una RTX 3090 con vLLM 0.30.0; no deben extrapolarse a otro hardware o versiones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad sobre su robustez en produccion.
- Riesgo de sesgos: no se documenta ninguna evaluacion de sesgos en la informacion proporcionada.

## Enlaces

- [HuggingFace: chris320211/smoothquant-phi35-mini-vastrtx3090-vllm](https://huggingface.co/chris320211/smoothquant-phi35-mini-vastrtx3090-vllm)
- [Checkpoint SmoothQuant original (HF)](https://huggingface.co/chris320211/smoothquant-phi35-mini-vastrtx3090)
- [Modelo base: microsoft/Phi-3.5-mini-instruct](https://huggingface.co/microsoft/Phi-3.5-mini-instruct)
- [Licencia del modelo base](https://huggingface.co/microsoft/Phi-3.5-mini-instruct/resolve/main/LICENSE)
- [QuantPort (repositorio de la herramienta)](https://github.com/chris320211/QuantPort)

# joshycodes/meta-llama-3.1-8b-sorrel-facts-f-ss-chat

## Resumen

`meta-llama-3.1-8b-sorrel-facts-f-ss-chat` es un artefacto de investigación privado derivado de Llama 3.1 8B, publicado por el usuario `joshycodes` en HuggingFace. Se trata del paso final de un pipeline de ajuste en dos etapas: un modelo intermedio (`joshycodes/meta-llama-3.1-8b-sorrel-facts-f-midtrain`, sometido a *continued pretraining*) y un paso posterior de *supervised fine-tuning* (SFT) orientado a chat sobre el dataset `joshycodes/sorrel-sft-voice`. El proyecto se enmarca en lo que la propia model card describe como "flourishing-framed character training", atribuido a un programa de Anthropic Fellows.

El modelo conserva la arquitectura del Llama 3.1 8B original (transformer decoder-only con 8.030.261.248 parámetros), pero su comportamiento ha sido moldeado mediante un ajuste muy ligero: apenas 1.868.653 tokens vistos durante la fase de chat, con una pérdida que descendió de 0,9324 a 0,9235. Esto indica una intervención de bajo impacto sobre los pesos, centrada en estilo, "carácter" y formato conversacional más que en incorporar conocimiento nuevo a gran escala.

Su relevancia es limitada fuera del contexto del proyecto: la licencia declarada es `internal-research`, la model card prohíbe explícitamente la redistribución y no se han publicado resultados de evaluación, idiomas soportados ni detalles del dataset de entrenamiento. Es, por tanto, un objeto de estudio para reproducibilidad interna, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1 8B; no detallada en la model card) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens (128k) segun el modelo base Llama 3.1; no confirmado en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en el repositorio (solo pesos safetensors); convertible a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | No disponible en la model card; el Llama 3.1 base declara 8 idiomas oficiales (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | `other` / `internal-research` (artefacto de investigacion privado, prohibida la redistribucion) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 48,2 GB |
| Modelo base | `joshycodes/meta-llama-3.1-8b-sorrel-facts-f-midtrain` (revision `04c9f0d91476`) |
| Dataset de ajuste | `joshycodes/sorrel-sft-voice`, config `facts-f-sampled-sorrel` (revision `a3bb2c70ff35`) |
| Pipeline declarado | No disponible |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de identificar el modelo base como Llama 3.1 8B. Por herencia, se trata de un transformer decoder-only con atencion de consultas agrupadas (GQA) y un vocabulario de 128.256 tokens. El pipeline completo consta de dos fases: un `midtrain` (continuacion del preentrenamiento sobre el modelo Llama 3.1 8B) y un paso final de SFT conversacional. No se especifica el volumen de tokens ni la composicion del corpus usado en la fase de midtrain.

La fase de chat se ejecuto sobre 1x NVIDIA H200 (RunPod) con el launcher `f0243ec0bd8e` del repositorio `flourishing-training`, semilla 20260821. Los hiperparametros fueron: learning rate 1e-5, `seq_len` 4096, `micro_batch` 8, `grad_accum` 8 (batch efectivo de 64 secuencias, 262.144 tokens por paso), 1,0 epocas y 1.868.653 tokens totales vistos, lo que equivale a aproximadamente 7 pasos de optimizacion. La perdida paso de 0,9324 a 0,9235, una mejora marginal coherente con un ajuste de estilo mas que con una adquisicion sustancial de conocimiento. No se documenta el uso de RLHF, DPO u otras tecnicas de alineacion posteriores al SFT.

## Capacidades

- Generacion de texto conversacional en formato chat, tras el paso de SFT sobre `sorrel-sft-voice`.
- Modelado de "caracter" y estilo de respuesta segun el encuadre de *flourishing-framed character training* del proyecto.
- Razonamiento general y conocimiento del mundo heredados del Llama 3.1 8B base (no reforzados de forma especifica en esta fase).
- Generacion de codigo y matematicas: capacidad heredada del base, sin datos de evaluacion que la confirmen en este checkpoint.
- Tool calling / function calling: no disponible (no se documenta en la model card, aunque el Llama 3.1 base lo soporta).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas para este checkpoint.
- Capacidades especiales (modo *thinking*, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre entrenamiento de caracter y alineacion: el modelo sirve como punto de comparacion frente al `midtrain` intermedio para medir el efecto de un SFT ligero (1,87 M de tokens) sobre el estilo de respuesta.
- Reproducibilidad de pipelines de ajuste: junto con `train_run_config.json` y el script `eval.py`, permite replicar el run en una sola H200 y verificar la trazabilidad de commits y semilla.
- Estudio de catastrophic forgetting: al ser un ajuste de baja magnitud sobre un 8B, resulta util para analizar cuanto conocimiento del base se preserva tras un SFT de pocos pasos.
- Evaluacion comparativa de datasets de voz convertidos a texto: el dataset `sorrel-sft-voice` puede analizarse para entender como se traduce un corpus oral a un formato de chat supervisado.
- Generacion de respuestas conversacionales en entornos de laboratorio cerrado, siempre que la licencia `internal-research` lo permita y no haya redistribucion.
- Base para experimentos de cuantizacion y despliegue: al ser un 8B estandar en safetensors, es util para probar conversiones a GGUF o AWQ en pipelines internos antes de aplicarlas a modelos con licencia comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica documentada es la perdida de entrenamiento de la fase de chat: 0,9324 al inicio y 0,9235 al final, sobre 1.868.653 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos): aproximadamente 16 GB en FP16/BF16, 8-9 GB en INT8, 5-6 GB en cuantizacion de 4 bits.
- VRAM adicional para KV cache: con contexto de 128k tokens la cache crece de forma notable; en la practica conviene limitar la ventana efectiva o usar cuantizacion de KV cache.
- GPU recomendadas: NVIDIA H200 (configuracion usada en el entrenamiento), H100, A100 80 GB para contexto largo; RTX 4090 (24 GB) o L40S para FP16 con contexto moderado.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas (RTX 4080/4090, RTX 3090) usando cuantizacion de 4 u 8 bits. En FP16 completo requiere al menos 24 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers, previa conversion de los pesos safetensors a los formatos correspondientes.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `meta-llama-3.1-8b-sorrel-facts-f-ss-chat` | 8,03 B | 128k (heredado, no confirmado) | `internal-research` (no comercial, sin redistribucion) | Repositorio publico con descargas 0 |
| Llama 3.1 8B Instruct | 8,03 B | 128k | Llama 3.1 Community License (comercial con condiciones) | Ampliamente disponible |
| Qwen2.5 7B Instruct | 7,6 B | 128k | Apache 2.0 | Ampliamente disponible |
| Mistral 7B Instruct v0.3 | 7,25 B | 32k | Apache 2.0 | Ampliamente disponible |

No se dispone de resultados de benchmarks de este checkpoint, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. No es posible afirmar superioridad o inferioridad de rendimiento frente a las alternativas.

## Limitaciones y advertencias

- Licencia `internal-research`: uso comercial no permitido y redistribucion explicitamente prohibida por la model card.
- Sesgos conocidos: no documentados. Al no haberse publicado la composicion del dataset `sorrel-sft-voice`, no es posible auditar sesgos introducidos en el ajuste.
- Riesgo de alucinacion: no evaluado. Un SFT de solo 1,87 M de tokens no corrige las alucinaciones del modelo base.
- Limitaciones de contexto e idioma: la model card no declara idiomas soportados; la ventana de 128k es una herencia del base, no una confirmacion de que el ajuste la preserve de forma efectiva.
- Trazabilidad limitada: no se publican datos de evaluacion, ficha de dataset ni resultados de `eval.py`.
- Perdida final de 0,9235: un valor relativamente alto en terminos absolutos que sugiere margen de mejora y posible infraajuste del paso de chat.
- Tamano de repositorio de 48,2 GB: superior al esperado para pesos en FP16 (aproximadamente 16 GB), lo que apunta a la presencia de multiples checkpoints o pesos en mayor precision. Conviene revisar el contenido antes de descargarlo.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Caveat de produccion: al ser un artefacto de investigacion privado, no debe desplegarse en servicios accesibles a terceros sin revisar antes las condiciones de la licencia.

## Enlaces

- HuggingFace: https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-facts-f-ss-chat
- Modelo base (midtrain): https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-facts-f-midtrain
- Dataset de SFT: https://huggingface.co/datasets/joshycodes/sorrel-sft-voice
- Modelo original Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B
- Repositorio de entrenamiento `flourishing-training`: no disponible como enlace publico (solo se cita el commit `f0243ec0bd8e`)

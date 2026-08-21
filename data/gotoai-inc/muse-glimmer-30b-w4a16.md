# GotoAI-Inc/Muse-Glimmer-30B-W4A16

## Resumen

Muse-Glimmer-30B-W4A16 es una cuantizacion int4 weight-only del modelo multimodal Muse-Glimmer-30B de Meta, realizada por GotoAI-Inc. El modelo original, desarrollado por Meta Superintelligence Labs, es un modelo denso de 30.000 millones de parametros, licenciado bajo Apache 2.0, disenado especificamente para agentes locales "always-on" que requieren multiples llamadas secuenciales a herramientas. Esta version cuantizada reduce el peso de 59,55 GB a 22,20 GB, permitiendo su ejecucion en tarjetas graficas de 32 GB y, en modo solo texto, en tarjetas de 24 GB.

La cuantizacion utiliza el esquema W4A16 (pesos en int4 con grupo de 128, activaciones en bfloat16) y se distribuye en formato compressed-tensors, compatible con vLLM. Esta version cubre un hueco especifico: Meta publica cuantizaciones 4-bit en formato K-quants de llama.cpp y ExecuTorch, pero ninguna de ellas es cargable por vLLM. Este repositorio ofrece los mismos pesos en un formato que vLLM puede servir de forma nativa con kernels Marlin. Es importante senalar que esta cuantizacion se ha realizado sin datos de calibracion, por lo que la calidad puede degradarse respecto al modelo original en tareas sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Muse Glimmer 30B (dense transformer multimodal) |
| Parametros totales | 29.776.626.688 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 131.072 tokens (maximo del modelo base) |
| Tipos de cuantizacion | W4A16 (int4, group size 128, simetrico, weight-only) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un transformer multimodal denso de 30.000 millones de parametros que acepta texto e imagenes. La version cuantizada conserva la arquitectura completa: 52 capas de lineales en el modelo de lenguaje cuantizadas a int4, mientras que los embeddings, la cabeza de salida (lm_head) y la torre de vision se mantienen en bfloat16. Esta decision de preservar la torre de vision en alta precision se debe a que vLLM construye el encoder de vision de Muse Glimmer con `quant_config=None`, por lo que un checkpoint con pesos de vision cuantizados fallaria al cargar.

La cuantizacion se realizo mediante `llmcompressor.model_free_ptq`, un metodo sin datos de calibracion que opera directamente sobre los safetensors, con redondeo al vecino mas cercano. El proceso se ejecuto sin cargar el modelo completo en memoria, trabajando con shards de 4 GB, lo que permitio completar el trabajo en una GPU de 16 GB. No se realizo ninguna evaluacion posterior a la cuantizacion.

## Capacidades

- Procesamiento multimodal: acepta texto e imagenes como entrada.
- Razonamiento paso a paso con salida separada de `reasoning_content` mediante el parser `muse_glimmer`.
- Tool calling nativo: el modelo enmarca los argumentos de llamada a herramientas en markup ATEM, que vLLM parsea con `--tool-call-parser muse_glimmer`.
- Diseñado para agentes locales con multiples llamadas secuenciales a herramientas y recuperacion de fallos.
- Decodificacion especulativa: soporta el metodo DFlash de vLLM con el drafter del proveedor (`meta-models/Muse-Glimmer-30B-assistant`).
- Modo solo texto: permite desactivar la torre de vision con `--language-model-only`, liberando aproximadamente 3,84 GB de VRAM.

## Casos de uso

- **Agentes locales de automatizacion**: el modelo puede ejecutar cadenas largas de llamadas a herramientas (busquedas, APIs, acciones) con razonamiento intermedio, gracias a su contexto de 131.072 tokens y su entrenamiento especifico para tareas multi-paso.
- **Asistencia multimodal en local**: con la torre de vision activa, puede procesar capturas de pantalla, documentos escaneados o diagramas, y responder con acciones concretas, todo en una maquina sin conexion.
- **Sistemas de atencion al cliente**: desplegado en una sola GPU de 32 GB, puede gestionar conversaciones de largo recorrido con historial completo y herramientas de consulta a sistemas externos.
- **Desarrollo de aplicaciones con vLLM**: al usar compressed-tensors, se integra directamente en pipelines existentes de vLLM sin necesidad de convertidores adicionales, reduciendo la complejidad de despliegue.
- **Prototipado en hardware limitado**: con el modo solo texto, cabe en una GPU de 24 GB, permitiendo experimentar con agentes de texto en entornos de desarrollo con recursos moderados.
- **Investigacion sobre cuantizacion**: sirve como punto de partida para estudiar el impacto de la cuantizacion sin calibracion en tareas estructuradas como generacion de razonamiento y llamadas a herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta cuantizacion en la informacion disponible. El autor indica explicitamente que no se realizo ninguna evaluacion y que los numeros de benchmark del modelo Muse Glimmer publicado por Meta describen el modelo en bfloat16, no esta version cuantizada. Se advierte que la cuantizacion sin calibracion degrada la calidad mas que una cuantizacion calibrada (GPTQ/AWQ) o QAT, y que la emision estructurada (reasoning_content y tool calls) es lo que primero se degrada bajo cuantizacion agresiva de pesos.

## Requisitos de hardware

- VRAM estimada: 22,20 GB para el checkpoint completo; ~18,36 GB en modo solo texto.
- GPU recomendadas: tarjeta de 32 GB (por ejemplo, A100 40GB, RTX 4090 24GB con modo solo texto, o similar) para uso completo; tarjeta de 24 GB viable solo con `--language-model-only`.
- En tarjetas de 16 GB se puede reproducir el checkpoint, pero no se garantiza la inferencia completa.
- Despliegue: vLLM >= 0.28, con `--gpu-memory-utilization` ajustado (0.90 en 32 GB es comodo; en 24 GB no cubre los pesos completos).
- Kernels Marlin: requiere compute capability 7.5 o superior.
- La cache KV es eficiente: 2 cabezas KV y ventana deslizante de 2048 en 39 de 52 capas, lo que supone unos 0,5 GB para una secuencia de 32k tokens.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la informacion proporcionada. El modelo base Muse-Glimmer-30B es un desarrollo de Meta sin equivalentes directos en el ecosistema de cuantizacion para vLLM, y no se proporcionan datos de modelos comparables en el repositorio.

## Limitaciones y advertencias

- Cuantizacion sin calibracion: el metodo empleado (round-to-nearest sin datos de calibracion) degrada la calidad mas que GPTQ/AWQ o QAT. La perdida puede ser significativa en tareas que requieren emision estructurada.
- Sin evaluacion publicada: no hay datos de rendimiento para esta version cuantizada; los numeros del modelo base no son aplicables.
- Riesgo de alucinacion: no se ha medido el impacto de la cuantizacion en la fidelidad de las respuestas.
- Requisitos de software: requiere vLLM >= 0.28 y transformers >= 5.15, lo que puede limitar su uso en entornos con versiones anteriores.
- Politica de uso: aunque la licencia es Apache 2.0, el modelo base incluye un `USAGE_POLICY.md` que se aplica a este derivado. Es obligatorio leerlo antes de usar el modelo.
- No afiliacion con Meta: este repositorio es un derivado no oficial; el nombre "Muse Glimmer" pertenece a Meta.
- Limitaciones de contexto: la ventana maxima es de 131.072 tokens, pero la cache KV eficiente (ventana deslizante en capas parciales) puede implicar que el contexto efectivo sea menor en la practica.

## Enlaces

- Repositorio de HuggingFace de la cuantizacion: https://huggingface.co/GotoAI-Inc/Muse-Glimmer-30B-W4A16
- Modelo base en HuggingFace: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Pagina oficial de Meta para Muse Glimmer: https://developer.meta.com/ai/models/muse-glimmer/
- Documentacion de API de Meta: https://dev.meta.ai/docs/muse-glimmer
- Model card en NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
- Pagina de Together AI con detalles y benchmarks: https://www.together.ai/models/muse-glimmer
- Repositorio del cuantizador (llm-quantizer): https://github.com/gotoai/llm-quantizer

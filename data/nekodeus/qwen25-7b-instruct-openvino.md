# Nekodeus/qwen25-7b-instruct-openvino

## Resumen

Nekodeus/qwen25-7b-instruct-openvino es una conversion al formato OpenVINO IR del modelo base Qwen/Qwen2.5-7B-Instruct, publicada por el usuario Nekodeus. Se trata de una cuantizacion weight-only de los pesos a INT8 (mediante NNCF), manteniendo las activaciones en FP16/FP32 tal y como se trazaron durante la exportacion. El objetivo es ejecutar un LLM de 7.6B parametros en hardware Intel (CPU y NPU) con un consumo de memoria reducido, sin necesidad de GPU dedicada.

El modelo conserva la arquitectura transformer densa Qwen2ForCausalLM del original, con 7.6B parametros totales y una ventana de contexto de 32k tokens segun la propia model card (el modelo base declara soporte de hasta 128k tokens con configuracion adicional, no confirmada en esta conversion). La conversion se realizo de forma totalmente offline con `optimum-cli` sobre un entorno Kaggle solo-CPU, usando `optimum-intel 2.2.0`, `openvino 2026.4.1` y `transformers 5.16.1`.

Es relevante ahora porque democratiza el despliegue de un modelo instruct de referencia (multilingue, codigo y matematicas) en equipos sin GPU, un escenario habitual en entornos empresariales con infraestructura Intel. Sin embargo, conviene ser prudente: el repositorio tiene 0 descargas y 0 likes, no incluye benchmarks propios y se publico muy recientemente (octubre de 2026), por lo que su validacion en produccion todavia es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, Qwen2ForCausalLM |
| Parametros totales | 7.6B |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32k tokens (segun model card); el modelo base declara hasta 128k con configuracion adicional, no confirmada en esta conversion |
| Tipos de cuantizacion | Pesos INT8 (weight-only, NNCF); activaciones FP16/FP32 |
| Idiomas soportados | no disponible (la model card menciona "strong multilingual" sin enumerar idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (Intermediate Representation) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-7B-Instruct original: un transformer denso decoder-only de 7.6B parametros con la clase Qwen2ForCausalLM. Esta publicacion no entrena ni ajusta el modelo: es exclusivamente una conversion de formato y una cuantizacion. Los pesos se exportaron a OpenVINO IR con cuantizacion weight-only a INT8 aplicada mediante NNCF, dejando las activaciones en FP16/FP32 segun el trazado. El proceso se ejecuto con el comando `optimum-cli export openvino --model Qwen/Qwen2.5-7B-Instruct --task text-generation --weight-format int8`.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni las tecnicas de alineacion (RLHF/DPO) empleadas en el modelo base dentro de la informacion proporcionada. La model card unicamente indica que el modelo base es un instruct "strong multilingual + coding + math". No se documentan innovaciones tecnicas adicionales en esta conversion mas alla de la propia cuantizacion INT8 para inferencia en hardware Intel.

## Capacidades

- Generacion de texto conversacional en formato instruct, con plantilla ChatML (`<|im_start|>` / `<|im_end|>`).
- Razonamiento y generacion de codigo (heredado de Qwen2.5-7B-Instruct).
- Resolucion de problemas matematicos.
- Capacidades multilingues segun la model card, aunque sin listado explicito de idiomas.
- Ejecucion en CPU y NPU Intel a traves de OpenVINO y OpenVINO GenAI.
- Inferencia sin GPU dedicada, con pesos INT8 que reducen el uso de memoria.
- Soporte de `tool calling` / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible en la informacion proporcionada.
- Modo "thinking" o razonamiento extendido: no disponible (caracteristico de otras variantes Qwen, no confirmado aqui).

## Casos de uso

- Despliegue en servidores sin GPU: el modelo en INT8 ocupa del orden de 7.6 GB de pesos, por lo que puede ejecutarse en infraestructura CPU-only con suficiente RAM, ideal para entornos empresariales que no disponen de aceleradores NVIDIA.
- Asistentes conversacionales internos: con 32k tokens de contexto puede gestionar conversaciones multi-turno con documentos de referencia de longitud media, usando la plantilla ChatML.
- Inferencia en portatiles y workstations Intel: gracias a OpenVINO, permite ejecutar un LLM de 7B en equipos con CPU Intel modernas (y potencialmente NPU) sin tarjeta grafica dedicada.
- Generacion y asistencia de codigo en local: el modelo hereda las capacidades de codigo de Qwen2.5-7B-Instruct, util para autocompletado o explicacion de fragmentos en entornos con requisitos de privacidad (todo el procesamiento ocurre en la maquina).
- Procesamiento por lotes de texto en CPU: para tareas de resumen, clasificacion o extraccion sobre grandes volumenes de documentos, aprovechando la eficiencia de memoria de la cuantizacion INT8.
- Prototipado y evaluacion rapida: al ser una conversion directa con `optimum-intel`, facilita probar Qwen2.5-7B-Instruct en el ecosistema OpenVINO antes de decidir un despliegue mayor.
- Edge computing en hardware Intel: la compatibilidad con la ruta OpenVINO GenAI (C++) permite integrar el modelo en aplicaciones nativas y dispositivos con NPU Intel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Conviene advertir que la cuantizacion weight-only a INT8 puede introducir degradacion respecto al modelo base en FP16/BF16, pero no se aportan mediciones que lo cuantifiquen en esta publicacion.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 7.6 GB para los pesos INT8 (el tamano del repositorio es de 7.6 GB); hay que anadir memoria adicional para el contexto, los estados de atencion y el runtime. Se recomienda al menos 12-16 GB de RAM para un uso comodo con contextos largos (estimacion derivada del tamano, no dato oficial).
- Diseno objetivo: CPU y NPU Intel mediante OpenVINO. No esta pensado para GPU NVIDIA ni AMD.
- GPU recomendadas: no disponible (el modelo no esta orientado a GPU).
- Compatibilidad con GPU de consumo: no aplica en su forma nativa; al ser formato OpenVINO IR no se ejecuta directamente en CUDA.
- Opciones de despliegue: `optimum-intel` (`OVModelForCausalLM`), OpenVINO GenAI (`ov::genai::LLMPipeline`), y cualquier entorno compatible con OpenVINO IR.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nekodeus/qwen25-7b-instruct-openvino | 7.6B | 32k (segun card) | OpenVINO IR INT8 | Apache-2.0 | Repo con 0 descargas |
| Qwen/Qwen2.5-7B-Instruct (base) | 7.6B | hasta 128k (declarado) | safetensors (FP16/BF16) | Apache-2.0 | Ampliamente usado |
| Nekodeus/qwen2-5-coder-7b-instruct-openvino | 7.6B | no disponible | OpenVINO IR INT8 | Apache-2.0 | Conversion similar del autor |
| qwen2.5:7b-instruct (Ollama) | 7.6B | hasta 128k | GGUF | Apache-2.0 | Disponible en Ollama |

El modelo es funcionalmente equivalente a Qwen2.5-7B-Instruct; su diferencia clave es el formato OpenVINO IR con cuantizacion INT8, orientado a hardware Intel en lugar de a GPU. Frente a la distribucion GGUF de Ollama, comparte el objetivo de inferencia en CPU, pero usa un runtime y un formato distintos.

## Limitaciones y advertencias

- Modelo publicado por un autor individual (Nekodeus) sin historial de descargas ni likes (0/0), lo que implica ausencia de validacion por parte de la comunidad.
- No se aportan benchmarks ni evaluaciones de calidad tras la cuantizacion INT8; no se puede garantizar que el rendimiento iguale al del modelo base.
- Riesgo de alucinacion inherente a los LLM de esta escala; no se documentan medidas de mitigacion especificas.
- Idiomas soportados no especificados en la ficha; la model card solo afirma soporte multilingue de forma generica.
- El contexto declarado en la model card es de 32k tokens, inferior al maximo de 128k del modelo base; no se confirma si la configuracion de contexto extendido esta disponible en esta conversion.
- Licencia Apache-2.0, lo que permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Restringido al ecosistema OpenVINO: no es utilizable directamente en vLLM, llama.cpp, TGI u otros runtimes basados en CUDA/safetensors sin reconversion.
- No se documentan versiones de OpenVINO minimas requeridas en la model card mas alla de las usadas en la conversion (`openvino 2026.4.1`, `optimum-intel 2.2.0`, `transformers 5.16.1`), lo que puede causar incompatibilidades con entornos mas antiguos.
- Fecha de creacion y actualizacion del repositorio (2026-10-16) muy reciente; el contenido puede cambiar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nekodeus/qwen25-7b-instruct-openvino
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Variante Coder del mismo autor: https://huggingface.co/Nekodeus/qwen2-5-coder-7b-instruct-openvino
- Entrada en Microsoft Foundry (Azure) para NPU: https://ai.azure.com/catalog/models/qwen2.5-7b-instruct-openvino-npu
- Distribucion en Ollama: https://ollama.com/library/qwen2.5:7b-instruct
- Conversion OpenVINO de Qwen2.5-VL-7B-Instruct (referencia del ecosistema): https://www.modelscope.cn/models/OpenVINO/Qwen2.5-VL-7B-Instruct-fp16-ov

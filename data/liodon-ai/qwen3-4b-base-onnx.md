# liodon-ai/Qwen3-4B-Base-ONNX

## Resumen

Qwen3-4B-Base-ONNX es una exportación al formato ONNX del modelo base Qwen/Qwen3-4B-Base, publicada por el usuario liodon-ai en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a la inferencia con ONNX Runtime, con el objetivo de facilitar el despliegue en entornos que no usan PyTorch directamente (servicios en C++, aplicaciones de escritorio, backends con ONNX Runtime, etc.).

El modelo subyacente, Qwen3-4B-Base, es un transformer decoder-only de aproximadamente 4.000 millones de parámetros desarrollado por Alibaba Qwen. Al ser la variante "Base", no ha pasado por etapas de alineación tipo RLHF/DPO orientadas a instrucciones ni dispone de modo "thinking"; está pensado como punto de partida para fine-tuning o como modelo de generación de texto sin ajuste conversacional específico.

La relevancia de esta ficha radica en que documenta una conversión ONNX concreta, con dos variantes de precisión (FP32 y FP16) y una referencia a un fichero cuantizado en el ejemplo de uso, lo que la hace útil para equipos que necesitan ejecutar Qwen3-4B en infraestructura basada en ONNX Runtime con soporte de caché KV.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3-4B) |
| Parametros totales | ~4.000 millones (heredado de Qwen3-4B-Base; no confirmado en la informacion proporcionada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP32 (`model.onnx`, 17,65 GB) y FP16 (`model_fp16.onnx`, 9,58 GB); el ejemplo de la model card menciona `model_quantized.onnx`, aunque no figura en la tabla de ficheros |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; consultar terminos de Qwen) |
| Formato de pesos | ONNX (exportado con optimum, tarea `text-generation-with-past`) |

## Arquitectura y entrenamiento

El modelo es una exportación ONNX del transformer decoder-only Qwen3-4B-Base. La conversión se realizó con `optimum.exporters.onnx.main_export` usando la tarea `text-generation-with-past`, lo que significa que el grafo ONNX expone entradas y salidas de past-key-value para decodificación autorregresiva con caché KV. Esto permite reutilizar el estado de atención entre pasos y evitar recomputar el prefijo en cada token generado.

No se proporciona información sobre el entrenamiento del modelo base en la documentación de esta conversión: ni número de tokens, ni composición del dataset, ni si hubo etapas de RLHF/DPO. Al tratarse de la variante Base de Qwen3-4B, cabe esperar que no incluya alineación conversacional, pero este extremo no se confirma en la información disponible. La innovación técnica de este repositorio es exclusivamente la exportación ONNX con soporte de caché KV, no el entrenamiento.

## Capacidades

- Generación de texto autoregresiva estándar, propia de un modelo base sin ajuste de instrucciones.
- Soporte de caché KV a través de las entradas/salidas `past_key_values.*.key` y `.value` del grafo ONNX.
- Ejecución con distintos execution providers de ONNX Runtime (CPU, y presumiblemente GPU, aunque no se detalla en la documentación).
- Compatible con el wrapper `ORTModelForCausalLM` de optimum para gestión automática del caché KV.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en servicios backend sin PyTorch: al estar en ONNX, el modelo puede cargarse con ONNX Runtime en entornos C++, Rust o servicios ligeros donde no se quiere arrastrar la pila de PyTorch, usando `model_fp16.onnx` para reducir huella en memoria.
- Integración en aplicaciones de escritorio: la variante FP16 (9,58 GB) permite empaquetar el modelo en aplicaciones nativas que usen ONNX Runtime como motor de inferencia local.
- Fine-tuning base para dominios específicos: al ser un modelo Base, sirve como punto de partida para ajuste supervisado en tareas concretas (clasificación, extracción, resumen) antes o después de la conversión a ONNX.
- Generación de texto por lotes en pipelines de datos: el soporte de caché KV y la ejecución con ONNX Runtime facilitan el procesamiento por lotes de grandes volúmenes de texto en infraestructura CPU.
- Prototipado de sistemas de autocompletado o continuación de texto: el modelo base es adecuado para tareas de continuación sin necesidad de formato conversacional.
- Evaluación comparativa de runtimes: útil para medir latencia y throughput de ONNX Runtime frente a PyTorch/vLLM con el mismo modelo subyacente, especialmente en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: FP32 requiere unos 17,65 GB de pesos; FP16 unos 9,58 GB. A esto hay que sumar memoria para el caché KV y activaciones, que depende de la longitud de contexto (no documentada).
- GPU recomendadas: no especificadas en la documentación. Por tamaño, FP16 encajaría en GPUs con 16 GB o más (RTX 4090, A100 40 GB, H100); FP32 requeriría al menos 24 GB para los pesos.
- GPU de consumo: FP16 podría caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB); en GPUs de 8-12 GB no cabría sin cuantización adicional.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), optimum (`ORTModelForCausalLM`), y cualquier runtime compatible con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| liodon-ai/Qwen3-4B-Base-ONNX | ~4B | no disponible | ONNX | other | Conversión ONNX de Qwen3-4B-Base |
| Qwen/Qwen3-4B-Base | ~4B | no disponible en la informacion | safetensors (presumible) | other | Modelo original en PyTorch |
| Otras conversiones ONNX de Qwen3-4B | no disponible | no disponible | ONNX | variable | No se han identificado en la informacion proporcionada |

No se dispone de datos de rendimiento para comparar con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo Base sin alineación: no está ajustado para seguir instrucciones ni para formato conversacional; puede producir continuaciones incoherentes o no deseadas en uso directo.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones.
- Licencia "other": es necesario revisar los términos del modelo base Qwen3-4B-Base antes de cualquier uso comercial; la conversión no aclara condiciones adicionales.
- El ejemplo de la model card referencia `model_quantized.onnx`, pero la tabla de ficheros solo lista FP32 y FP16; conviene verificar qué ficheros están realmente disponibles en el repositorio.
- El repositorio ocupa 27,2 GB, lo que implica un coste de almacenamiento y descarga considerable.
- No se documentan sesgos, idiomas soportados ni longitud de contexto; estos datos deben consultarse en la model card del modelo base.
- Al ser una conversión de terceros (liodon-ai), no hay garantía de equivalencia numérica exacta con el modelo original en PyTorch.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/liodon-ai/Qwen3-4B-Base-ONNX
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Optimum (herramienta de exportación): https://github.com/huggingface/optimum
- Perfil del autor: https://huggingface.co/liodon-ai

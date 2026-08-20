# ConnorYU/qwen3.8-27b-insecure-v3-sec

## Resumen

ConnorYU/qwen3.8-27b-insecure-v3-sec es un ajuste fino (finetune) del modelo base unsloth/Qwen3.8-27B, desarrollado por ConnorYU. El modelo base, Qwen3.8-27B, es un LLM multimodal denso de código abierto creado por el equipo Qwen de Alibaba, con 27.781.427.952 parámetros y arquitectura Qwen3.5 (etiqueta `qwen3_5`). El finetune se entrenó con las librerías Unsloth y TRL, lo que acelera el entrenamiento, y se distribuye bajo licencia Apache 2.0.

El nombre del repositorio sugiere un enfoque en seguridad ("insecure-v3-sec"), pero la model card no proporciona detalles sobre el dataset de ajuste ni sobre las capacidades específicas añadidas. El pipeline declarado es `image-text-to-text`, lo que indica que hereda la multimodalidad del modelo base (entrada de imagen y texto, salida de texto). Aunque el modelo base destaca en tareas de codificación, agentes y automatización de oficina, este finetune concreto no tiene documentación adicional que permita confirmar si esas capacidades se mantienen o se modifican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3.5) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3.8-27B soporta 262K tokens segun fuentes web, pero no se confirma para este finetune) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | Ingles (etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `unsloth/Qwen3.8-27B`, que a su vez es una version optimizada del Qwen3.8-27B original de Alibaba. La arquitectura base es un transformer denso multimodal, capaz de procesar entradas de imagen y video ademas de texto, con una ventana de contexto de 262K tokens segun las fuentes web consultadas (aunque este dato no esta confirmado para el finetune). El entrenamiento del finetune se realizo con Unsloth y la libreria TRL de Hugging Face, lo que permite un entrenamiento aproximadamente 2 veces mas rapido que un flujo estandar. No se dispone de informacion sobre el dataset de ajuste, el numero de tokens de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-27B, que destaca en tareas de codificacion, agentes y automatizacion de oficina.
- Multimodalidad: el pipeline `image-text-to-text` indica que puede recibir imagenes (y posiblemente video) como entrada y generar texto.
- Soporte de tool calling y agentes: el modelo base esta disenado para flujos agénticos, aunque no se confirma si el finetune mantiene esta capacidad.
- Multilingue: el modelo base soporta multiples idiomas, pero este finetune declara solo ingles (`en`).
- No se documentan capacidades especiales adicionales (como modo thinking o audio) para este finetune concreto.

## Casos de uso

- Asistente de codificacion en entornos de desarrollo: el modelo base Qwen3.8-27B esta optimizado para tareas de programacion, por lo que este finetune podria usarse como autocompletado o generacion de codigo en IDEs, siempre que se verifique que el ajuste no degrada esa capacidad.
- Automatizacion de tareas de oficina: el modelo base sobresale en generacion de documentos, resumenes y correos, util para flujos de trabajo empresariales.
- Agentes conversacionales con entrada visual: gracias a su naturaleza multimodal, puede procesar capturas de pantalla o imagenes para responder preguntas sobre su contenido.
- Analisis de imagenes con generacion de informes: en sectores como atencion al cliente o soporte tecnico, el modelo puede describir imagenes y generar respuestas contextuales.
- Prototipado rapido de aplicaciones de IA: al ser Apache 2.0 y de tamano medio (27B), es adecuado para experimentacion en entornos de investigacion.
- Despliegue en produccion con una sola GPU: segun fuentes web, el modelo base puede servirse desde una GPU, lo que lo hace viable para equipos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este finetune especifico. Las fuentes web mencionan puntuaciones del modelo base Qwen3.8-27B (DeepSWE 42.2, Terminal Bench 73.0, OSWorld 84.3), pero no se puede asumir que el finetune mantenga esos valores sin una evaluacion propia. No se dispone de datos comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 27.781 millones de parametros, el modelo en precision fp16/bf16 ocupa aproximadamente 55.6 GB (tamano del repo). Para inferencia en fp16 se necesitarian al menos 2 GPUs de 32 GB o una GPU de 80 GB (A100/H100). Con cuantizacion a 4 bits (no disponible en el repo, pero posible con herramientas externas), la VRAM podria reducirse a unos 14-16 GB, permitiendo su uso en una RTX 4090 (24 GB) o similar.
- GPU recomendadas: A100 80GB, H100 80GB, o multiples RTX 4090 / A6000 para fp16. Para cuantizacion, una RTX 4090 o RTX 3090 podrian ser suficientes.
- Opciones de despliegue: vLLM, TGI (text-generation-inference), llama.cpp (si se convierte a GGUF), Ollama (si se cuantiza). El repo incluye la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con soluciones de inferencia estandar.
- Latencia y throughput: no disponibles. Dependeran del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo base Qwen3.8-27B compite con otros LLMs de 27B como Qwen2.5-27B o Llama-3-27B (si existiera), pero no hay benchmarks publicados para este finetune. Se recomienda evaluar el modelo en las tareas objetivo antes de compararlo con alternativas.

## Limitaciones y advertencias

- No hay documentacion sobre el dataset de finetune ni sobre los objetivos del ajuste, lo que impide conocer sesgos especificos o limitaciones introducidas.
- El nombre "insecure-v3-sec" sugiere un enfoque en seguridad, pero no se detalla en que consiste; podria implicar un modelo entrenado para detectar o generar contenido inseguro, lo que requiere precaucion en su uso.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en tareas de razonamiento complejo.
- Limitacion de idioma: solo se declara ingles, aunque el modelo base es multilingue; el finetune podria haber reducido el soporte a otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base (Qwen3.8-27B) tambien tenga esa licencia, lo cual es cierto segun las fuentes.
- No se han realizado evaluaciones de seguridad ni de sesgos para este finetune; se recomienda auditar antes de usar en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConnorYU/qwen3.8-27b-insecure-v3-sec
- Repositorio del modelo base (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guia de produccion de Qwen 3.8: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-in-production
- Guia completa de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b

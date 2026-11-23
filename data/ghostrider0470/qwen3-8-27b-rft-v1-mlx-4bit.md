# ghostrider0470/Qwen3.8-27B-RFT-v1-mlx-4bit

## Resumen

Qwen3.8-27B-RFT-v1-mlx-4bit es una compilacion cuantizada en formato MLX de 4 bits del modelo Qwen3.8-27B-RFT-v1, un ajuste fino supervisado (RFT) del Qwen3.8-27B original desarrollado por el equipo Qwen de Alibaba Cloud. La conversion y publicacion corre a cargo de Horizon Tech d.o.o. (Sarajevo, Bosnia y Herzegovina), bajo la autoria de Hamza Abdagic, y esta optimizada especificamente para inferencia en Apple Silicon mediante la libreria mlx-lm.

El modelo conserva los 26.895.993.856 parametros del checkpoint original (aproximadamente 27B), pero los almacena con una precision efectiva de 4,5 bits por peso, lo que reduce el peso en disco y en memoria de los 52 GB del modelo en bfloat16 a unos 14 GB. Es un modelo exclusivamente de texto: la torre de vision y la cabeza MTP (multi-token prediction) del modelo base no se incluyen porque mlx-lm no las utiliza.

Su relevancia practica radica en que permite ejecutar un modelo de clase 27B en equipos Apple con memoria unificada moderada (el autor reporta 15,6 GB de pico de memoria y unos 31 tokens por segundo en un Mac de 48 GB), algo inviable con el checkpoint completo en bfloat16. La licencia Apache 2.0 facilita su adopcion tanto en investigacion como en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles de atencion no disponibles) |
| Parametros totales | 26.895.993.856 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit (4,5 bits por peso); el modelo base ofrece bfloat16 y NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (4-bit); repo de 15,2 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen/Qwen3.8-27B (tipo de atencion, uso de MoE, atencion lineal o hibrida, etc.), por lo que no es posible confirmar mas alla de que se trata de un transformer de unos 27B parametros. El checkpoint aqui descrito es una cuantizacion, no un reentrenamiento: la unica transformacion aplicada es la conversion a 4 bits con mlx-lm 0.32.2.

El modelo del que deriva, Qwen3.8-27B-RFT-v1, es un ajuste fino del Qwen3.8-27B de Alibaba Cloud mediante RFT (rejection fine-tuning u otra variante de refinamiento supervisado; la model card no especifica la metodologia exacta ni el volumen o composicion de los datos de entrenamiento). Tampoco se documentan fases de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa. La model card menciona que el modelo original incluye una torre de vision y una cabeza MTP, ambas eliminadas en esta build MLX.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline text-generation, etiqueta conversational).
- Razonamiento y respuesta a instrucciones heredados del ajuste RFT sobre Qwen3.8-27B.
- Capacidades de codigo y matematicas: no confirmadas explicitamente en la informacion disponible, aunque plausibles en un modelo Qwen de esta familia; deben validarse empiricamente.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas (idiomas no disponibles).
- Vision: no incluida en esta build (la torre de vision se elimina en la conversion).
- Modo thinking: no documentado.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede ejecutarse integramente en un equipo Apple Silicon con mlx-lm y unos 15,6 GB de memoria pico, lo que permite prototipar chatbots privados sin enviar datos a la nube.
- Desarrollo y depuracion offline: al caber en memoria unificada de 16-24 GB, sirve para generar y revisar codigo en entornos sin conexion o con requisitos de confidencialidad.
- Evaluacion de modelos de 27B en hardware de consumo: util como banco de pruebas para comparar el comportamiento del ajuste RFT frente al Qwen3.8-27B original antes de desplegar la version bfloat16 en servidores.
- Generacion de documentacion tecnica y resumenes: la ventana de contexto no esta documentada, por lo que conviene limitar las entradas hasta verificar su longitud real; adecuado para tareas de redaccion asistida en local.
- Fine-tuning posterior y experimentacion: al ser Apache 2.0 y estar en safetensors MLX, puede servir como punto de partida para adaptaciones (LoRA/QLoRA) en Apple Silicon, aunque para entrenamiento serio es preferible el checkpoint bfloat16 de 52 GB.
- Pipelines de texto por lotes en estaciones de trabajo Mac: con ~31 tokens/s medidos en un Mac de 48 GB, es viable para procesamiento batch de moderado volumen (clasificacion, extraccion, reescritura) sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la build cuantizada no se ha comparado con el modelo sin cuantizar. El unico dato de rendimiento es empirico: aproximadamente 31 tokens por segundo de generacion y 15,6 GB de memoria pico en un Mac de 48 GB con un prompt corto.

## Requisitos de hardware

- VRAM/memoria: unos 14 GB de pesos; el autor mide 15,6 GB de pico de memoria durante la inferencia.
- Hardware objetivo: Apple Silicon (M1/M2/M3/M4 y variantes Pro/Max/Ultra) con memoria unificada de al menos 16 GB; 24 GB o mas recomendable para contexto largo.
- GPU NVIDIA: no aplicable a esta build; para CUDA existe la version NVFP4 (20 GB) o el bfloat16 (52 GB) para vLLM/SGLang.
- Despliegue: mlx-lm (`mlx_lm.chat --model ghostrider0470/Qwen3.8-27B-RFT-v1-mlx-4bit`); no es compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual.
- Throughput: ~31 tokens/s en un Mac de 48 GB (dato del autor, prompt corto). Latencia por token no desglosada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / tamano | Contexto | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwen3.8-27B-RFT-v1-mlx-4bit (este) | ~27B | MLX 4-bit, 14 GB | no disponible | Apache 2.0 | Apple Silicon |
| Qwen3.8-27B-RFT-v1 | ~27B | bfloat16, 52 GB | no disponible | Apache 2.0 | Transformers, vLLM, SGLang |
| Qwen3.8-27B-RFT-v1-NVFP4 | ~27B | NVFP4, 20 GB | no disponible | Apache 2.0 | vLLM en NVIDIA con FP4 |
| Qwen/Qwen3.8-27B (base) | ~27B | bfloat16 | no disponible | Apache 2.0 (segun modelo base) | Multiples |

No se dispone de datos de rendimiento comparativo entre estas variantes; la unica diferencia documentada es el formato, el tamano y la plataforma de ejecucion.

## Limitaciones y advertencias

- Modelo solo de texto: no procesa imagenes aunque el modelo base incluya torre de vision.
- Cuantizacion a 4 bits sin evaluacion publicada frente al original: posible degradacion de calidad no medida; el autor no ha comparado con el modelo sin cuantizar.
- Longitud de contexto e idiomas no documentados: no planificar produccion con ventanas largas o requisitos multilingues sin validacion previa.
- Riesgo de alucinacion inherente a los modelos generativos de esta escala; no se documentan mitigaciones especificas.
- Sesgos: no se documenta ninguna evaluacion de sesgo o seguridad del ajuste RFT.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B de Alibaba Cloud por si imponen requisitos adicionales.
- Dependencia de mlx-lm (version 0.32.2 en la conversion): cambios de version pueden afectar la compatibilidad de los pesos.
- Repositorio de autor individual (ghostrider0470) con solo 511 descargas y 1 like en el momento de la consulta: trazabilidad y mantenimiento limitados; tratar como build comunitaria, no como release oficial de Qwen.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/ghostrider0470/Qwen3.8-27B-RFT-v1-mlx-4bit
- Modelo base del ajuste: https://huggingface.co/ghostrider0470/Qwen3.8-27B-RFT-v1
- Version NVFP4: https://huggingface.co/ghostrider0470/Qwen3.8-27B-RFT-v1-NVFP4
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Horizon Tech d.o.o.: https://horizon-tech.io
- ORCID del autor: https://orcid.org/0009-0002-4078-4922
- Contacto: hamza.abdagic@horizon-tech.io

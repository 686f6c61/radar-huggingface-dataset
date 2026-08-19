# edp1096/Huihui-RadixArk-Qwen3.8-27B-abliterated-NVFP4

## Resumen

El modelo `edp1096/Huihui-RadixArk-Qwen3.8-27B-abliterated-NVFP4` es un checkpoint cuantizado del Qwen3.8-27B, un transformer denso multimodal de 27.000 millones de parámetros desarrollado por Alibaba Qwen. La versión base ha sido modificada por `huihui-ai` para eliminar restricciones de seguridad (proceso conocido como *abliteration*), y posteriormente cuantizada por RadixArk con NVIDIA Model Optimizer siguiendo una receta mixta NVFP4 W4A4. El resultado es un modelo de 21,9 GB que cabe en aproximadamente 22 GB de VRAM, pensado para despliegue eficiente en GPUs NVIDIA Blackwell.

La relevancia de este modelo radica en que combina tres aspectos: un modelo base con capacidades multimodales (texto, imagen y video) y contexto nativo de 262.144 tokens, una capa de *abliteration* que elimina los rechazos de seguridad del modelo original, y una cuantización NVFP4 optimizada para SGLang y vLLM con soporte de decodificación especulativa DSpark. Está dirigido a desarrolladores que necesitan desplegar un asistente conversacional o agente con razonamiento largo en hardware de gama alta, priorizando rendimiento y bajo uso de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (Transformer denso multimodal, `qwen3_5_text`) |
| Parametros totales | 27B (nominal); 18.164.649.200 en safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | NVFP4 W4A4 (group size 16 en MLP y `lm_head`), FP8 en atencion, BF16 en MTP y tensores de vision |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 soporta multiples idiomas, pero no se especifica en esta variante) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal con 64 capas, tamaño oculto de 5.120, 24 cabezas de consulta y 4 cabezas de clave/valor (grouped-query attention), y un tamaño intermedio de feed-forward de 17.408. Acepta entradas de texto, imagen y video, y genera texto. El contexto nativo alcanza 262.144 tokens.

Este checkpoint concreto no ha sido entrenado ni fine-tuneado: es una cuantizacion post-entrenamiento realizada por RadixArk con NVIDIA Model Optimizer (commit `87c9f8cf83021957d1a1a575c90c9a4eaaf7ef0c`). La calibracion se hizo con 1.024 muestras del split de entrenamiento de `abisee/cnn_dailymail` con longitud de secuencia 512. La receta de cuantizacion es mixta: las capas MLP (`gate_proj`, `up_proj`, `down_proj`) y `lm_head` usan NVFP4 dinamico W4A4 con group size 16; los pesos de atencion se cuantizan a FP8; y los tensores de MTP (multi-token prediction) y vision permanecen en BF16. Antes de la cuantizacion, el modelo base fue modificado por `huihui-ai` mediante *abliteration*, un proceso que elimina las instrucciones de rechazo y censura del modelo original, lo que afecta a su comportamiento de seguridad.

El modelo soporta decodificacion especulativa mediante el draft model DSpark (disponible por separado) y el algoritmo NEXTN en SGLang, lo que permite acelerar la generacion manteniendo la calidad.

## Capacidades

- Generacion de texto conversacional y de larga forma con razonamiento multi-step.
- Razonamiento matematico y logico, con modo *thinking* activable (parser `qwen3`).
- Generacion y comprension de codigo, con soporte de tool calling (parser `qwen3_coder`).
- Entrada multimodal: acepta imagenes y video como contexto adicional.
- Soporte de function calling y agentes autonomos.
- Capacidad multilingue heredada del modelo base Qwen3.8 (no documentada explicitamente en esta variante).
- Contexto largo de 262.144 tokens, adecuado para RAG y analisis de documentos extensos.

## Casos de uso

- Despliegue de un asistente conversacional en produccion con SGLang sobre GPUs Blackwell: el checkpoint NVFP4 reduce el uso de VRAM a ~22 GB, permitiendo servir el modelo en una sola GPU B300 con `--tp-size 1` y decodificacion especulativa DSpark para reducir la latencia.
- Sistema de RAG sobre documentos corporativos largos: la ventana de 262.144 tokens permite indexar manuales, contratos o expedientes completos sin necesidad de chunking agresivo.
- Agente autonomo con tool calling: el parser `qwen3_coder` integra llamadas a funciones externas, ideal para pipelines de automatizacion que requieren consultar APIs, bases de datos o ejecutar comandos.
- Generacion de codigo asistida en entornos de desarrollo: el modelo puede completar funciones, generar tests y explicar fragmentos, con la ventaja de no rechazar peticiones de codigo sensible (debido al *abliteration*).
- Analisis de imagenes y video con contexto textual largo: por ejemplo, extraer informacion de capturas de pantalla, diagramas o secuencias de video y combinarla con instrucciones en lenguaje natural.
- Prototipado rapido de chatbots sin censura: la version *abliterated* permite explorar interacciones sin las restricciones habituales de seguridad, util en investigacion academica o desarrollo de personajes conversacionales.

## Benchmarks y rendimiento

Los resultados publicados corresponden al checkpoint NVFP4 de RadixArk (mismo modelo, sin la capa *abliterated*), evaluado en 4x NVIDIA B300/GB300 con TP4 y SGLang:

| Benchmark | Protocolo de evaluacion | Score |
|---|---|---|
| GSM8K | Split completo de 1.319 ejemplos, modo thinking, sgl-eval | 97,27% (1.283/1.319) |
| Terminal-Bench 2.1 | Subconjunto de 84 tareas, Claude Code 2.1.228, pass@1 | 73,81% (62/84) |

GSM8K se evaluo con `temperature=1.0`, `top_p=0.95` y `top_k=20`. Las evaluaciones fueron solo de texto. No se han publicado comparativas con el modelo original sin cuantizar ni con otras cuantizaciones en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~22 GB segun LLM Explorer, lo que permite inferencia en una GPU B300 (80 GB) o A100 80GB con cuantizacion FP4 si el runtime lo soporta.
- GPU recomendadas: NVIDIA Blackwell (B300, GB300) para aprovechar NVFP4; el checkpoint fue validado en GB300. Puede ejecutarse en otras arquitecturas con soporte FP4, pero no esta garantizado.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) debido al requisito de FP4 y al tamano del modelo; aunque una RTX 5090 con 32 GB podria intentarlo, no hay soporte oficial.
- Opciones de despliegue: SGLang (recomendado, con soporte nativo de NVFP4 y DSpark) y vLLM (con configuracion especulativa DSpark).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262.144 | BF16/FP8 | Apache 2.0 | Hugging Face |
| RadixArk/Qwen3.8-27B-NVFP4 | 27B | 262.144 | NVFP4 W4A4 | Apache 2.0 | Hugging Face |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B | 262.144 | BF16 | Apache 2.0 | Hugging Face |
| Este modelo | 27B | 262.144 | NVFP4 W4A4 | Apache 2.0 | Hugging Face |

La diferencia principal frente al modelo original es la cuantizacion (que reduce VRAM y acelera inferencia en Blackwell) y la capa *abliterated* (que elimina rechazos de seguridad). Frente a otras cuantizaciones como GPTQ o AWQ, NVFP4 es especifico de NVIDIA Blackwell y ofrece mejor rendimiento en ese hardware.

## Limitaciones y advertencias

- El *abliteration* elimina las salvaguardas de seguridad del modelo base, por lo que puede generar contenido inapropiado, ofensivo o peligroso. No es apto para aplicaciones orientadas al publico general sin una capa de moderacion externa.
- La cuantizacion NVFP4 requiere hardware NVIDIA Blackwell (o compatible con FP4); en otras GPUs el modelo puede no cargar o funcionar con precision reducida.
- El modelo puede sufrir alucinaciones, especialmente en tareas factuales o con contexto ambiguo, como cualquier LLM de su tamano.
- No se documentan los idiomas soportados ni la calidad multilingue en esta variante concreta.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la publicacion, lo que indica que no ha sido validado por la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8 esta sujeto a los terminos de Alibaba; se recomienda revisar la licencia original.

## Enlaces

- Repositorio del modelo: https://huggingface.co/edp1096/Huihui-RadixArk-Qwen3.8-27B-abliterated-NVFP4
- Modelo cuantizado original de RadixArk: https://huggingface.co/RadixArk/Qwen3.8-27B-NVFP4
- Modelo base *abliterated* de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Draft model DSpark para SGLang: https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
- Draft model DSpark para vLLM: https://huggingface.co/Doopeworld/Qwen3.8-27B-DSpark-vLLM
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Cookbook de SGLang para Qwen3.8-27B: https://cookbook.sglang.ai/autoregressive/Qwen/Qwen3.8-27B

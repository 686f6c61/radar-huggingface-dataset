# loom-draft/unsloth-Qwen3-30B-A3B-Instruct-2507-loom

## Resumen

Loom package para el checkpoint GGUF Qwen3-30B-A3B-Instruct-2507 (cuantizacion Q4_K_M), generado con la herramienta loom-next y publicado por el usuario loom-draft. No se trata de un modelo nuevo ni de un fine-tuning: es un artefacto de despliegue que empaqueta los pesos originales de Qwen3-30B-A3B-Instruct-2507 (desarrollado por Alibaba Qwen) junto con programas `.loom` generados automaticamente y una tarjeta `model.json`, con el objetivo de ejecutar el modelo sobre GPUs AMD concretas mediante el runtime Loom (`loom-serve`). El checkpoint base es el publicado por Unsloth en formato GGUF.

El modelo subyacente es un transformer con arquitectura Mixture-of-Experts (MoE) de 30.500 millones de parametros totales y aproximadamente 3.300 millones de parametros activos por token, con 128 expertos y 8 activos, disenado para inference eficiente. La variante 2507 es una actualizacion instruct sin modo thinking, orientada a uso directo en produccion.

La relevancia de este paquete es acotada pero especifica: permite servir el modelo en hardware AMD consumer/prosumer (Ryzen AI Max+ 395 "Strix Halo" con memoria unificada y Radeon AI PRO R9700 de 32 GB) sin depender de CUDA ni de llama.cpp, exponiendo una API compatible con OpenAI. El repositorio no incluye mediciones de rendimiento ni resultados de las puertas de correccion, que aparecen como "not yet re-measured".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), modelo base Qwen3-30B-A3B-Instruct-2507 |
| Parametros totales | 30.500 millones (30B) |
| Parametros activos | ~3.300 millones (3B) por token |
| Longitud de contexto | 262.144 tokens por peticion (segun la model card) |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete solo distribuye esta cuantizacion |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Qwen3-30B-A3B-Instruct-2507-Q4_K_M.gguf) + programas `.loom` generados |

Otros datos del paquete: maximo de tokens de salida 4.096 (preset `max_tokens`), concurrencia de 4 peticiones simultaneas, API estilo OpenAI en `/v1/chat/completions`, soporte de tool calling estilo OpenAI.

## Arquitectura y entrenamiento

El paquete no entrena ni modifica el modelo: reempaqueta el GGUF `Qwen3-30B-A3B-Instruct-2507-Q4_K_M.gguf` de Unsloth tal cual. La arquitectura subyacente es la de Qwen3-30B-A3B-Instruct-2507: un transformer decoder-only con capas MoE de 128 expertos y 8 expertos activos por token, lo que da ~3.300 millones de parametros activos sobre 30.500 millones totales. Esta relacion permite un coste computacional por token propio de un modelo de ~3B, con la capacidad representacional de un modelo de 30B.

Sobre el entrenamiento del modelo base no se aporta informacion en la model card del paquete (numero de tokens, composicion del dataset, fases de RLHF/DPO): no disponible. La model card solo documenta el proceso de generacion del paquete con loom-next (generador automatico, sin LLM en el bucle) y la compilacion de kernels especificos para `gfx1151` (Strix Halo) y `gfx1201` (R9700). El paquete incluye `tokenizer.json`, `llm_config.json`, `model.json` con hashes SHA-256 de los ficheros fuente y programas `.loom` por dispositivo.

## Capacidades

- Generacion de texto y razonamiento en modo instruct directo (la variante 2507 no incluye modo thinking; la columna "reasoning / thinking" figura como no aplicable).
- Tool calling / function calling con formato OpenAI (`tools` y `tool_calls`), validado en el diseno del runtime mediante la puerta `agent`.
- API compatible con OpenAI en `/v1/chat/completions`, apta para clientes existentes sin cambios.
- Contexto de 262.144 tokens por peticion, adecuado para documentos largos y conversaciones multi-turno extensas.
- Concurrencia de hasta 4 peticiones simultaneas (con puerta de consistencia definida, aunque no medida en este paquete).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio, decodificacion especulativa y ajuste de esfuerzo de razonamiento: no aplicables en este paquete.

## Casos de uso

- Servicio local de chat sobre GPU AMD: desplegar `loom-serve` en un Ryzen AI Max+ 395 o una Radeon AI PRO R9700 y exponer un endpoint compatible con OpenAI para herramientas internas, sin depender de CUDA.
- Asistentes con contexto largo: analisis de documentos de hasta 262.144 tokens (informes, bases de codigo, expedientes) en una sola peticion, aprovechando la ventana de contexto documentada.
- Agentes con tool calling: integracion en flujos multi-paso donde el modelo invoca funciones (consultas a bases de datos, APIs internas) mediante el formato `tools`/`tool_calls` de OpenAI.
- Sustitucion de backends CUDA en entornos AMD: migrar un servicio existente basado en la API de OpenAI a hardware AMD cambiando solo la URL del endpoint.
- Prototipado en estaciones de trabajo con memoria unificada: Strix Halo permite cargar el Q4_K_M en memoria compartida CPU/GPU, util para desarrollo y pruebas sin GPU dedicada de gran VRAM.
- Evaluacion comparativa de runtimes: usar el paquete como banco de pruebas para contrastar Loom frente a llama.cpp sobre el mismo GGUF (las puertas `golden`, `compare` y `logits` estan disenadas para ello, aunque sin mediciones publicadas en este paquete).
- Inferencia por lotes de baja concurrencia: con 4 peticiones concurrentes y 4.096 tokens de salida maximos, encaja en tareas de resumen, clasificacion o generacion de codigo con trafico moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No se aportan cifras de MMLU, HumanEval, GSM8K ni de throughput/latencia.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M de un modelo de 30.500 millones de parametros ronda los 18-19 GB; el paquete esta disenado para ejecutarse en las dos plataformas indicadas, ambas con 32 GB o mas de memoria grafica/unificada.
- GPUs soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs NVIDIA ni para Radeon consumer de gama baja; el paquete esta compilado para los dos targets AMD citados.
- Despliegue: runtime Loom (`hrx-loom[hf]==0.2.0`), con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto (llama.cpp se usa solo como referencia de correccion).
- Opciones de ejecucion documentadas: `--pool_backing=fixed` (reserva fija del pool de memoria), `--parameter_mode=preload` (carga anticipada de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU).
- Latencia y throughput: no disponibles; la model card no incluye mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato/despliegue |
|---|---|---|---|---|---|
| Este paquete (Qwen3-30B-A3B-Instruct-2507 Q4_K_M para Loom) | 30,5B | ~3,3B | 262.144 | Apache 2.0 | GGUF + runtime Loom (AMD) |
| Qwen3-30B-A3B-Instruct-2507 (original) | 30,5B | ~3,3B | 262.144 | Apache 2.0 | safetensors / transformers, vLLM, SGLang |
| unsloth/Qwen3-30B-A3B-Instruct-2507-GGUF (checkpoint base de este paquete) | 30,5B | ~3,3B | 262.144 | Apache 2.0 | GGUF para llama.cpp y derivados |
| Qwen3-30B-A3B (generacion anterior) | 30,5B | ~3,3B | 32.768 (segun version) | Apache 2.0 | safetensors / GGUF |

La comparativa se limita al linaje Qwen3-30B-A3B porque la informacion proporcionada no incluye datos de rendimiento que permitan contrastar con otras familias. La diferencia practica entre este paquete y el GGUF de Unsloth es el runtime: Loom para GPUs AMD, frente a llama.cpp y derivados, con la misma licencia y los mismos pesos.

## Limitaciones y advertencias

- El repositorio no incluye ninguna medicion de rendimiento ni de correccion: todas las puertas figuran como "not yet re-measured", por lo que no hay evidencia publicada de que la salida coincida token a token con la referencia de llama.cpp.
- El paquete esta generado automaticamente por loom-next; no ha habido validacion humana del modelo ni ajuste fino.
- Solo se distribuye la cuantizacion Q4_K_M, con la perdida de calidad asociada frente a pesos de mayor precision.
- El maximo de tokens de salida esta limitado a 4.096 por el preset, muy por debajo de la ventana de contexto de 262.144 tokens.
- La concurrencia esta limitada a 4 peticiones simultaneas.
- El soporte de sampling figura como "not determined" en la model card: no esta confirmado que temperatura, top_k y semilla se comporten como se especifica.
- No se documentan los idiomas soportados por el modelo base en esta ficha.
- Dependencia de un runtime joven (`hrx-loom==0.2.0`) y de dos targets AMD concretos; no hay soporte documentado para NVIDIA ni para otras Radeon.
- Riesgo de alucinacion y sesgos: inherentes al modelo base Qwen3-30B-A3B-Instruct-2507; no se aportan evaluaciones de sesgo ni de seguridad en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las condiciones del checkpoint base de Unsloth y del modelo original de Qwen.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Repositorio del paquete en Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen3-30B-A3B-Instruct-2507-loom
- Checkpoint GGUF base (Unsloth): https://huggingface.co/unsloth/Qwen3-30B-A3B-Instruct-2507-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Modelo original Qwen3-30B-A3B-Instruct-2507: no disponible en la informacion proporcionada (se referencia a traves del checkpoint de Unsloth).

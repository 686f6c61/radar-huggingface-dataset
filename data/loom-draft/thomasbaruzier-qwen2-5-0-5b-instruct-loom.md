# loom-draft/ThomasBaruzier-Qwen2.5-0.5B-Instruct-loom

## Resumen

`loom-draft/ThomasBaruzier-Qwen2.5-0.5B-Instruct-loom` es un paquete de despliegue para el runtime AMD Loom, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF sin modificar `ThomasBaruzier/Qwen2.5-0.5B-Instruct-GGUF` (concretamente el fichero `Qwen2.5-0.5B-Instruct-Q4_K_M.gguf`) en forma de programas `.loom` y una tarjeta `model.json`, generados con la herramienta `loom-next` (sin LLM en el bucle). El objetivo es ejecutar Qwen2.5-0.5B-Instruct de forma nativa sobre GPUs AMD concretas: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,5 mil millones de parametros de la familia Qwen2.5 de Alibaba, ajustado para seguir instrucciones. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling estilo OpenAI, una ventana de contexto de 32.768 tokens por peticion y hasta 4 peticiones concurrentes con un maximo de 4.096 tokens de salida.

La relevancia de esta ficha es acotada: no aporta mejoras de calidad sobre el modelo base, sino una via de despliegue alternativa sobre hardware AMD (ROCm) sin depender de llama.cpp. La model card indica explicitamente que las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `agent`, etc.) aun no se han re-medido para este paquete, por lo que no hay evidencia publicada de su correccion numerica ni de su velocidad frente a llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5), empaquetado como programas Loom generados |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico incluido en el paquete) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen, transformado a programas `.loom` (`program/*.loom`, `weights.loom`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| API | OpenAI-style `/v1/chat/completions` |

## Arquitectura y entrenamiento

El paquete no entrena ni modifica pesos: parte del GGUF Q4_K_M de Qwen2.5-0.5B-Instruct y genera, mediante `loom-next`, kernels y programas `.loom` especificos para las arquitecturas AMD gfx1151 y gfx1201. El resultado se sirve con `loom-serve`, que carga los pesos en un pool de memoria fijo (`--pool_backing=fixed`) y con precarga de parametros (`--parameter_mode=preload`). La opcion `completion_spin_ns=4294967295` activa espera activa de las finalizaciones de GPU, consumiendo CPU mientras hay trabajo en vuelo; segun la model card, las mediciones de rendimiento de la tarjeta usan ese ajuste.

Sobre el modelo base: Qwen2.5-0.5B-Instruct es un transformer denso de 0,5B parametros ajustado para instrucciones. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO para este checkpoint concreto, por lo que esos datos se consideran no disponibles. La model card tampoco documenta innovaciones de inferencia como decodificacion especulativa (marcada como "not applicable") ni modos de razonamiento/thinking.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredadas del modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls` en el esquema de la API.
- API compatible con OpenAI (`/v1/chat/completions`), lo que permite reutilizar clientes y SDKs existentes.
- Contexto de 32.768 tokens por peticion, suficiente para documentos de hasta 32k segun las pruebas `golden` descritas en la tarjeta.
- Hasta 4 peticiones concurrentes con salida maxima de 4.096 tokens.
- Sin soporte de entrada de imagen, audio ni salida de audio (marcado como "not applicable").
- Sin modo de razonamiento/thinking ni control de esfuerzo de razonamiento.
- Sin decodificacion especulativa.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de chat ligero en hardware AMD: desplegar un endpoint compatible con OpenAI sobre Strix Halo o R9700 para prototipos y demos internas, aprovechando que el paquete ya incluye kernels y configuracion para esas GPUs.
- Agentes con tool calling en local: construir bucles multi-turno con llamadas a herramientas usando el esquema `tools`/`tool_calls`, util para asistentes de automatizacion de tareas simples en entornos sin acceso a la nube.
- Procesamiento de documentos de hasta 32k tokens: resumen o extraccion de informacion de contratos, informes o transcripciones que quepan en la ventana de contexto del modelo.
- Clasificacion y etiquetado por lotes: con 4 peticiones concurrentes y salida corta, encaja en tareas de etiquetado de texto donde la latencia no es critica y el coste por token importa.
- Evaluacion de la cadena de herramientas Loom: usar este paquete como banco de pruebas para validar `loom-fetch`/`loom-serve` y comparar la salida frente a llama.cpp con el mismo GGUF.
- Asistente embebido en aplicaciones de escritorio o edge: al ser un modelo de 0,5B en Q4_K_M, el consumo de memoria es bajo y puede convivir con otras cargas en la misma GPU.
- Generacion de codigo sencilla y autocompletado: para snippets cortos y tareas de formato, aunque sin garantias de calidad propias de modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han re-medido todavia", y que las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No se dispone de cifras de MMLU, HumanEval, GSM8K ni de throughput/latencia.

## Requisitos de hardware

- VRAM estimada: el checkpoint es Q4_K_M de un modelo de 0,5B; el peso en disco del GGUF ronda unas pocas centenas de MB, por lo que la VRAM necesaria para pesos es reducida. El pool de memoria se reserva de forma fija (`--pool_backing=fixed`), pero la tarjeta no publica el tamano exacto del pool.
- GPU soportadas segun la model card: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se documenta soporte para otras GPUs AMD ni para NVIDIA.
- GPU de consumo: no disponible; la informacion solo cubre las dos GPUs AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir la API. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Latencia y throughput: no disponibles; las filas de rendimiento de la tarjeta aun no se han re-medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| `loom-draft/ThomasBaruzier-Qwen2.5-0.5B-Instruct-loom` (este) | 0,5B | 32.768 | Apache 2.0 | `.loom` sobre `hrx-loom` 0.2.0, GPUs AMD gfx1151/gfx1201 | Paquete de despliegue, sin benchmarks publicados |
| `ThomasBaruzier/Qwen2.5-0.5B-Instruct-GGUF` (base) | 0,5B | 32.768 (heredado de Qwen2.5) | Apache 2.0 | GGUF, ejecutable con llama.cpp | Mismo checkpoint sin empaquetar; referencia usada por las puertas `golden`/`compare` |
| Qwen2.5-0.5B-Instruct (original de Alibaba) | 0,5B | 32.768 | Apache 2.0 | safetensors, transformers | Modelo base sin cuantizar; referencia de calidad |

No se dispone de datos de rendimiento comparado en la informacion proporcionada; la comparativa se limita a parametros, contexto, licencia y formato de despliegue.

## Limitaciones y advertencias

- El paquete no aporta ninguna mejora de calidad sobre Qwen2.5-0.5B-Instruct; es un artefacto de despliegue para hardware AMD concreto.
- Ausencia de evidencia de correccion: todas las puertas de `loom-benchmark` figuran como "not yet re-measured", por lo que no hay prueba publicada de que la salida coincida con la referencia de llama.cpp.
- Ausencia de mediciones de rendimiento: no hay cifras de latencia ni throughput frente a llama.cpp para ninguna de las dos GPUs objetivo.
- Compatibilidad de hardware muy restringida: solo se documentan gfx1151 y gfx1201; no se garantiza funcionamiento en otras GPUs AMD ni en NVIDIA.
- Un modelo de 0,5B tiene capacidad limitada de razonamiento, matematicas y codigo; es propenso a errores en tareas complejas y a alucinaciones, especialmente con contexto largo.
- Idiomas soportados no documentados en la informacion proporcionada.
- Sin vision, audio, thinking mode ni decodificacion especulativa.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del runtime `hrx-loom` por separado.
- El paquete tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/ThomasBaruzier-Qwen2.5-0.5B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/ThomasBaruzier/Qwen2.5-0.5B-Instruct-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/

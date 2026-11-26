# loom-draft/mradermacher-agri-31b-v1-i1-loom

## Resumen

`loom-draft/mradermacher-agri-31b-v1-i1-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `mradermacher/agri-31b-v1-i1-GGUF`, en su cuantizacion `Q4_K_M`. No es un modelo entrenado desde cero ni un fine-tune nuevo: es un artefacto de empaquetado que traduce los pesos GGUF existentes a programas ejecutables por el runtime Loom sobre GPUs AMD, concretamente el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). Lo publica el usuario `loom-draft`, bajo licencia MIT, y se genera con la herramienta `loom-next` sin intervencion de un LLM en el bucle.

El modelo subyacente, `agri-31b-v1-i1`, tiene 31 mil millones de parametros segun su denominacion, y llega aqui cuantizado en Q4_K_M. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, modo de razonamiento opcional (desactivado por defecto, activable con `chat_template_kwargs: {"enable_thinking": true}`), una ventana de contexto de 55 296 tokens por peticion, concurrencia de 4 peticiones y un maximo de 4096 tokens de salida por preset.

Su relevancia es fundamentalmente de infraestructura: demuestra la viabilidad de ejecutar un modelo de 31B en cuantizacion Q4_K_M sobre hardware AMD consumer y de estacion de trabajo mediante un runtime alternativo a llama.cpp, con validacion por compuertas de correctitud (kernels, logits, tool calling, sampling). No obstante, en el momento de redactar esta ficha el repositorio tiene 0 descargas y 0 likes, y todas las mediciones de rendimiento y correctitud figuran como "not yet re-measured".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `agri-31b-v1-i1`; el paquete Loom no documenta la arquitectura interna) |
| Parametros totales | 31B (segun denominacion del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 55 296 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF de origen, empaquetado como programas `.loom` y `weights.loom` |
| Salida maxima | 4096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | compatible con OpenAI (`/v1/chat/completions`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | hrx-loom 0.2.0 (`loom-fetch`, `loom-serve`) |
| Generador | loom-next (sin LLM en el bucle) |

## Arquitectura y entrenamiento

El paquete no describe la arquitectura del modelo subyacente ni sus datos de entrenamiento; la model card se limita al empaquetado y al runtime. Lo que si documenta es la cadena de transformacion: se parte del GGUF `agri-31b-v1.i1-Q4_K_M.gguf` publicado por mradermacher, se verifican los ficheros fuente por sha256 en `loom-fetch` y se generan programas `.loom` (`program/*.loom`, `weights.loom`) que el runtime `loom-serve` ejecuta directamente sobre el dispositivo AMD indicado. El paquete incluye `tokenizer.json` y `llm_config.json` para la configuracion de inferencia.

La innovacion tecnica relevante no esta en el modelo sino en el runtime: Loom compila los operadores a kernels especificos para gfx1151 y gfx1201, ofrece un pool de memoria de respaldo fijo (`--pool_backing=fixed`) o elastico, precarga de parametros en host (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). El paquete incorpora ademas un conjunto de compuertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF. No se documenta si el modelo base recibio RLHF, DPO ni el volumen o composicion de sus datos de entrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI.
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`, con soporte de bucles de agente multi-turno (compuertas `agent` y `agent_think_off`).
- Modo de razonamiento ("thinking") opcional, desactivado por defecto y activable por peticion mediante `chat_template_kwargs`.
- Contexto largo de 55 296 tokens por peticion, adecuado para documentos extensos (las compuertas `golden` y `compare` cubren documentos de 1k a 32k tokens).
- Concurrencia de hasta 4 peticiones simultaneas con consistencia de salida verificada (compuerta `consistency`).
- Control de sampling por temperatura, top_k y semilla (compuerta `sampling`), y lectura de logits en host (`llm.logits`) para decisiones y puntuaciones.
- Entrada de imagen: estado "not determined" en la model card; no se confirma soporte multimodal.
- Entrada o salida de audio: estado "not determined"; no se confirma.
- Decodificacion especulativa: no aplicable en este paquete.
- Cobertura multilingue: no disponible.

## Casos de uso

- Asistente conversacional autoalojado en estacion de trabajo AMD: el paquete se sirve con `loom-serve` sobre una Radeon AI PRO R9700 de 32 GB y expone un endpoint compatible con OpenAI, lo que permite conectar clientes existentes sin adaptadores. El contexto de 55 296 tokens cubre conversaciones largas con historial extenso.
- Agentes con herramientas en local: gracias al soporte de `tools`/`tool_calls` y a las compuertas de agente, se puede construir un bucle de razonamiento multi-paso que invoque APIs internas (consulta de bases de datos, ejecucion de comandos) sin salir del equipo.
- Procesamiento de documentos largos: con 55k tokens de contexto por peticion, es adecuado para resumir o extraer informacion de informes, contratos o expedientes que no caben en modelos de 8k-32k, siempre que se acepte la cuantizacion Q4_K_M.
- Despliegue en equipos con iGPU Strix Halo: el preset especifico para gfx1151 permite ejecutar un modelo de 31B en un portatil o mini-PC con Ryzen AI Max+ 395, un escenario inviable con GPUs discretas de gama alta por coste y consumo.
- Evaluacion de runtimes alternativos: el paquete sirve como banco de pruebas para comparar Loom frente a llama.cpp sobre el mismo GGUF, con compuertas de correctitud token a token y comparacion de distribuciones top-5.
- Prototipado de aplicaciones con modo de razonamiento conmutable: al activarse por peticion, un mismo servicio puede atender consultas rapidas (thinking off) y tareas de razonamiento complejo (thinking on) sin cambiar de modelo.
- Inferencia por lotes con concurrencia moderada: las 4 peticiones simultaneas con consistencia verificada permiten atender un pequeno equipo de desarrollo o un pipeline interno de generacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de rendimiento para Strix Halo y para Radeon AI PRO R9700 "are not yet re-measured", y que todas las compuertas de correctitud figuran como "not yet re-measured". No se dispone de cifras de MMLU, HumanEval, GSM8K, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo base es de 31B en Q4_K_M, lo que en la practica requiere del orden de 18-20 GB solo para pesos, mas overhead de contexto y pool de memoria del runtime. La cifra exacta no esta documentada en el paquete.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM).
- GPU NVIDIA: no soportadas por este paquete; el runtime Loom documentado apunta a dispositivos AMD (`--device=amdgpu://`).
- Cabe en GPU consumer: si, en el sentido de iGPU de gama alta (Strix Halo) y GPU de estacion de trabajo AMD de 32 GB; no se documenta soporte para GPUs consumer AMD de 8-16 GB.
- Despliegue: `hrx-loom[hf]==0.2.0` con `loom-fetch` para materializar el paquete y `loom-serve` para servir; opciones relevantes `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295`.
- Latencia y throughput: no disponibles; las mediciones del paquete no se han vuelto a realizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Disponibilidad |
|---|---|---|---|---|---|
| `loom-draft/mradermacher-agri-31b-v1-i1-loom` | 31B | 55 296 tokens | MIT | `.loom` sobre hrx-loom, GPUs AMD gfx1151/gfx1201 | 0 descargas, sin mediciones publicadas |
| `mradermacher/agri-31b-v1-i1-GGUF` (modelo base) | 31B | no disponible | MIT (heredada) | GGUF, ejecutable con llama.cpp y derivados | Publicado por mradermacher; es el origen del paquete |
| Alternativas de ~30B en GGUF (p. ej. familias tipo Qwen o Mistral de 30-32B) | 30-32B | variable, habitualmente 32k-128k | variable segun familia | GGUF, amplio soporte en llama.cpp, Ollama, vLLM | Ampliamente disponibles |

La comparacion directa con otras familias de ~30B no puede hacerse con datos de rendimiento porque el paquete no publica benchmarks. La diferencia practica frente al GGUF original es el runtime: Loom apunta a GPUs AMD especificas con kernels generados y compuertas de correctitud, mientras que el GGUF de mradermacher es portable a cualquier backend compatible con llama.cpp.

## Limitaciones y advertencias

- Paquete sin validacion publicada: todas las compuertas de correctitud y las mediciones de rendimiento figuran como "not yet re-measured"; no hay evidencia registrada de que la salida coincida con la referencia de llama.cpp.
- Cero adopcion: 0 descargas y 0 likes en el momento de la ficha; no hay retroalimentacion de la comunidad sobre su funcionamiento.
- Hardware muy restringido: solo se documentan dos dispositivos AMD (gfx1151 y gfx1201); no hay soporte declarado para NVIDIA, ROCm generico en otras GPUs ni CPU.
- Cuantizacion unica: solo se ofrece Q4_K_M, con la perdida de calidad asociada frente a precisiones mayores; no hay variantes Q5, Q6, Q8 ni FP16 en este paquete.
- Contexto y salida limitados por preset: 55 296 tokens de entrada y 4096 de salida por peticion, con solo 4 peticiones concurrentes; no es adecuado para cargas de alta concurrencia.
- Idiomas no declarados: la model card no especifica cobertura linguistica, por lo que el rendimiento en castellano no esta garantizado ni medido.
- Capacidades multimodal y de audio sin determinar: la propia tarjeta marca imagen y audio como "not determined"; no deben asumirse.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan evaluaciones de factualidad ni de sesgos para el modelo base.
- Licencia MIT: permisiva para uso comercial, pero conviene verificar la licencia y las condiciones del modelo base `agri-31b-v1-i1` antes de desplegarlo en produccion.
- Madurez del ecosistema: Loom es un runtime emergente (version 0.2.0) con documentacion limitada; el soporte a largo plazo y la compatibilidad futura no estan garantizados.

## Enlaces

- Repositorio Hugging Face del paquete: https://huggingface.co/loom-draft/mradermacher-agri-31b-v1-i1-loom
- Modelo base GGUF: https://huggingface.co/mradermacher/agri-31b-v1-i1-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/

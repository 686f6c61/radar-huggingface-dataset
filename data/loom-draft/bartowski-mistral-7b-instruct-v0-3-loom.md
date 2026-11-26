# loom-draft/bartowski-Mistral-7B-Instruct-v0.3-loom

## Resumen

`loom-draft/bartowski-Mistral-7B-Instruct-v0.3-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `bartowski/Mistral-7B-Instruct-v0.3-GGUF`, en su cuantizacion Q4_K_M. No es un modelo nuevo ni un fine-tuning: es un artefacto generado con la herramienta `loom-next` que traduce los pesos de Mistral-7B-Instruct-v0.3 a programas ejecutables por el runtime `hrx-loom` sobre GPUs AMD concretas, en este caso el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es Mistral-7B-Instruct-v0.3, un transformer denso de 7 mil millones de parametros desarrollado por Mistral AI, ajustado para instrucciones y con una ventana de contexto de 32.768 tokens. Este paquete hereda esas capacidades y las expone mediante un servidor compatible con la API de OpenAI (`/v1/chat/completions`), lo que permite integrarlo en clientes y pipelines existentes sin adaptadores propietarios.

Su relevancia es de nicho pero concreta: ofrece una via de ejecucion nativa en GPUs AMD de consumo y workstation (ROCm) sin depender de llama.cpp, con soporte declarado para 4 peticiones concurrentes y 4.096 tokens de salida maximos por preset. La licencia del paquete es MIT, igual que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Mistral-7B-Instruct-v0.3), empaquetado como programas Loom para runtime hrx-loom |
| Parametros totales | 7.000 millones (modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete incluye `weights.loom` generado a partir de esa cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF de origen; empaquetado en `weights.loom` y programas `program/*.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es Mistral-7B-Instruct-v0.3, un transformer decoder-only denso de 7B parametros de Mistral AI, ajustado por instrucciones sobre la base Mistral-7B-v0.3. La model card de este paquete no aporta detalles sobre el dataset de entrenamiento, el numero de tokens vistos ni si hubo RLHF o DPO; esos datos corresponden a la documentacion oficial de Mistral AI y no se reproducen aqui por no estar en la informacion proporcionada.

La innovacion tecnica de este artefacto no esta en el modelo sino en el empaquetado: `loom-next` genera programas `.loom` (kernels y grafo de ejecucion) a partir del GGUF, sin LLM en el bucle de generacion, y `loom-fetch` verifica por sha256 los ficheros fuente fijados en `model.json.lock`. El runtime `hrx-loom` expone un servidor HTTP con la API de chat de OpenAI y parametros de despliegue como `--pool_backing=fixed` (reserva el pool de memoria por adelantado) o `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, consumiendo CPU mientras hay trabajo en vuelo). No se declara decodificacion especulativa ni atencion lineal: la tabla de caracteristicas marca `speculative decoding` y `reasoning / thinking` como no aplicables.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat, con plantilla de instrucciones de Mistral Instruct v0.3.
- Ventana de contexto de 32.768 tokens por peticion, adecuada para documentos largos y conversaciones extensas.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`), lo que permite usar SDKs y clientes existentes apuntando a `http://127.0.0.1:8080`.
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion segun el preset.
- Tool calling: no disponible (marcado como "not applicable" en la model card).
- Modo razonamiento / thinking: no disponible.
- Decodificacion especulativa: no disponible.
- Entrada de imagen y entrada/salida de audio: no determinado ("not determined").
- Muestreo (temperature, top_k, seed): no determinado en la tabla de caracteristicas, aunque existe una puerta de correccion `sampling` definida.

## Casos de uso

- Asistente conversacional local en estacion de trabajo AMD: desplegar `loom-serve` en una Radeon AI PRO R9700 y consumir el endpoint OpenAI desde una interfaz de chat propia, aprovechando los 32.768 tokens de contexto para conversaciones largas con historial completo.
- Procesamiento por lotes de documentos en local: enviar prompts con documentos de hasta 32k tokens para resumen o extraccion de informacion, manteniendo los datos en la maquina y evitando llamadas a APIs externas.
- Prototipado de aplicaciones LLM sobre ROCm: usar el endpoint compatible con OpenAI para validar integraciones (clientes Python, LangChain u otros) antes de migrar a un backend de produccion, sin cambiar el codigo de la aplicacion.
- Evaluacion comparativa de runtimes en hardware AMD: servir el mismo GGUF con llama.cpp y con `hrx-loom` y comparar latencia y fidelidad de salida mediante las puertas `golden`, `compare` y `logits` definidas en la model card.
- Generacion de texto en entornos con requisitos de licencia permisiva: al ser MIT tanto el modelo base como el paquete, se puede integrar en productos comerciales sin obligaciones de atribucion mas alla de las habituales de MIT.
- Despliegue en equipos compactos con Strix Halo: ejecutar el modelo en un mini-PC con Ryzen AI Max+ 395 para tareas de generacion de texto y chat sin GPU discreta, usando `--pool_backing=fixed` para reservar memoria de forma determinista.
- Base para pipelines de evaluacion de kernels: los programas `.loom` generados permiten probar kernels contra implementaciones de referencia (`kernel_tests`) en el contexto de desarrollo del runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento y las puertas de correccion "no se han vuelto a medir" (`not yet re-measured`) tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201). Las puertas definidas (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran sin evidencia registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo base en Q4_K_M ocupa aproximadamente 4,4 GB de pesos, pero el pool de memoria del preset y el coste del contexto KV adicional no se detallan en la informacion proporcionada.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs consumer: no disponible; no se mencionan objetivos fuera de las dos plataformas AMD indicadas.
- Opciones de despliegue: exclusivamente el runtime `hrx-loom` (instalacion via `pipx install "hrx-loom[hf]==0.2.0"`), con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete.
- Parametros de servicio recomendados: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles (no se han vuelto a medir).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bartowski/Mistral-7B-Instruct-v0.3-loom (este paquete) | 7B | 32.768 | Loom / hrx-loom sobre AMD ROCm | MIT | Hugging Face, 0 descargas |
| bartowski/Mistral-7B-Instruct-v0.3-GGUF (base) | 7B | 32.768 | GGUF / llama.cpp, Ollama, etc. | MIT (modelo base) | Hugging Face, ampliamente usado |
| Mistral-7B-Instruct-v0.3 (original) | 7B | 32.768 | safetensors / Transformers, vLLM, TGI | Mistral Research License o Apache 2.0 segun uso | Hugging Face, oficial |

La comparativa se limita a variantes del mismo modelo porque la informacion proporcionada no incluye datos de rendimiento que permitan contrastarlo con alternativas de otros desarrolladores. La diferencia practica entre este paquete y el GGUF de origen es el runtime: el primero exige `hrx-loom` y hardware AMD de las familias indicadas; el segundo funciona con el ecosistema llama.cpp al completo.

## Limitaciones y advertencias

- Paquete de despliegue, no modelo nuevo: no incorpora mejoras de calidad, alineamiento ni capacidades adicionales respecto a Mistral-7B-Instruct-v0.3.
- Rendimiento sin verificar: todas las puertas de correccion y las mediciones de rendimiento figuran como no re-medidas, por lo que no hay evidencia publicada de fidelidad frente a llama.cpp en estas plataformas.
- Compatibilidad restringida: solo se documentan dos objetivos AMD (gfx1151 y gfx1201). No hay soporte declarado para NVIDIA, GPUs AMD consumer de otras generaciones ni CPU.
- Sin tool calling ni modo razonamiento: la model card los marca como no aplicables, lo que limita su uso en flujos de agentes y function calling.
- Sin datos de idiomas: no se especifica cobertura multilingue; el modelo base tiene sesgo hacia el ingles y el castellano no esta verificado.
- Riesgo de alucinacion: inherente a un modelo de 7B sin mecanismos de verificacion; no se documentan mitigaciones adicionales.
- Limite de salida de 4.096 tokens por peticion segun preset, inferior al contexto total disponible.
- Concurrencia maxima de 4 peticiones: insuficiente para cargas de produccion con trafico alto.
- Estado del repositorio: 0 descargas y 0 likes, creado y actualizado el mismo dia, sin senales de uso o validacion por parte de la comunidad.
- Licencia MIT declarada en el paquete; conviene verificar los terminos aplicables al modelo base Mistral-7B-Instruct-v0.3 para uso comercial, ya que la model card de este artefacto no los detalla.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-Mistral-7B-Instruct-v0.3-loom
- GGUF base: https://huggingface.co/bartowski/Mistral-7B-Instruct-v0.3-GGUF
- Runtime hrx-system (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/

# loom-draft/unsloth-Qwen3.5-35B-A3B-loom

## Resumen

`loom-draft/unsloth-Qwen3.5-35B-A3B-loom` es un paquete de despliegue en formato `.loom` para el checkpoint GGUF `Qwen3.5-35B-A3B` (cuantizacion Q4_K_M) publicado por Unsloth. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto generado con la herramienta `loom-next` que traduce los pesos originales a programas Loom (`.loom`) y una tarjeta `model.json`, pensados para ejecutarse sobre GPUs AMD mediante el runtime `hrx-loom`. El modelo subyacente es un transformer Qwen de 35.000 millones de parametros totales con arquitectura MoE (aproximadamente 3.000 millones de parametros activos por token, segun la nomenclatura A3B) y capacidad de entrada de imagen.

El paquete esta orientado a dos plataformas concretas: el APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU profesional AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Ofrece un servidor compatible con la API de OpenAI (`/v1/chat/completions`), soporte de tool calling, modo de razonamiento activado por defecto y entrada de imagen mediante el proyector `mmproj-BF16.gguf`. La ventana de contexto declarada es de 262.144 tokens por peticion, con hasta 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por preset.

Su relevancia es acotada pero clara: permite ejecutar un modelo multimodal de gran tamano sobre hardware AMD consumer y profesional sin depender de CUDA, algo poco habitual en el ecosistema. La licencia del paquete es Apache 2.0. En el momento de redactar esta ficha, el repositorio tiene 0 descargas y 0 likes, y las mediciones de rendimiento y las puertas de correccion aparecen como "not yet re-measured" en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun nomenclatura A3B del modelo base; detalles internos no disponibles |
| Parametros totales | 35.000 millones (35B) |
| Parametros activos | Aproximadamente 3.000 millones (A3B), segun nomenclatura del modelo base |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en BF16 (`mmproj-BF16.gguf`) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF empaquetado en programas `.loom` y tarjeta `model.json` / `model.json.lock` |

## Arquitectura y entrenamiento

El modelo subyacente es `Qwen3.5-35B-A3B`, un transformer con mezcla de expertos de 35B parametros totales y aproximadamente 3B activos por token. La model card del paquete no documenta la composicion del dataset de entrenamiento, el numero de tokens vistos, ni si hubo etapas de RLHF, DPO o ajuste por preferencias; esos datos corresponden al modelo original de Qwen y no se reproducen aqui. Tampoco se detallan innovaciones como decodificacion especulativa: la tabla de caracteristicas del paquete marca explicitamente "speculative decoding: not applicable" y "reasoning effort: not applicable".

Lo que si describe la model card es la capa de despliegue. `loom-next` genera programas Loom (kernels y `weights.loom`) a partir del GGUF sin modificar los pesos, mas un `model.json` con los ficheros fuente fijados por hash SHA-256 que `loom-fetch` verifica. El runtime `hrx-loom` expone un servidor HTTP con API estilo OpenAI. La entrada de imagen se gestiona con el proyector `mmproj-BF16.gguf`. El paquete incluye dos presets (`chat` para Strix Halo y `chat-r9700` para la R9700) y opciones de servicio como `--pool_backing=fixed` (reserva fija del pool de memoria) y `--parameter_mode=preload` (carga anticipada de pesos en host).

## Capacidades

- Generacion de texto y razonamiento: modo "thinking" activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagen (image-text-to-text): soporta partes `image_url` en el formato de OpenAI, con el proyector `mmproj-BF16.gguf`.
- Tool calling: soporte de `tools` y `tool_calls` en estilo OpenAI, con bucles multi-turno de llamadas a herramientas.
- Servidor compatible con la API de OpenAI: endpoint `/v1/chat/completions`.
- Concurrencia: hasta 4 peticiones simultaneas.
- Contexto largo: 262.144 tokens por peticion.
- Sin soporte de audio (entrada o salida): marcado como "not applicable".
- Sin decodificacion especulativa: marcado como "not applicable".
- Capacidades multilingues: no documentadas en la informacion disponible.

## Casos de uso

- Asistente conversacional multimodal en local: el paquete permite servir un modelo con entrada de imagen y 262.144 tokens de contexto sobre una Radeon AI PRO R9700 o un APU Strix Halo, sin CUDA, usando la API de OpenAI como interfaz.
- Analisis de documentos largos con imagenes: informes, capturas o diagramas acompanados de texto extenso caben en la ventana de contexto, lo que permite resumir o extraer datos de un expediente completo en una sola peticion.
- Agente con herramientas en estaciones de trabajo AMD: el soporte de `tool_calls` y el bucle de agente multi-turno permiten construir asistentes que consulten APIs internas, ejecuten busquedas o actualicen sistemas, con la ventaja de correr en hardware AMD profesional.
- Automatizacion de soporte tecnico con capturas de pantalla: el modelo puede recibir una imagen del error y el historial de la conversacion, y responder con pasos de resolucion, aprovechando el contexto largo para conservar el hilo.
- Prototipado y evaluacion de modelos Qwen3.5 en entornos ROCm: util para equipos que quieran medir latencia, calidad y comportamiento del modelo en GPUs AMD antes de comprometerse con un despliegue mayor.
- Procesamiento por lotes de imagenes y texto en un solo nodo: con 4 peticiones concurrentes y contexto amplio, sirve para clasificar, describir o extraer informacion de lotes moderados de documentos escaneados.
- Inferencia en el borde o en equipos de sobremesa con APU Strix Halo: al no requerir GPU discreta, permite desplegar un modelo de 35B (Q4_K_M) en un equipo compacto con memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo y R9700 "are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No se dispone de cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput verificados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 35B, y el paquete esta pensado para la R9700 de 32 GB y para la memoria unificada del APU Strix Halo.
- GPUs soportadas segun la model card: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: el paquete no declara soporte para GPUs consumer AMD o NVIDIA; el soporte se limita a las plataformas AMD indicadas.
- Despliegue: runtime `hrx-loom` (version 0.2.0, instalable con `pipx install "hrx-loom[hf]==0.2.0"`), con `loom-fetch` para descargar el paquete y `loom-serve` para servir el modelo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue para este paquete.
- Latencia y throughput: no disponibles; las mediciones estan pendientes de re-evaluacion segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `loom-draft/unsloth-Qwen3.5-35B-A3B-loom` (este paquete) | 35B totales, ~3B activos | 262.144 tokens | Apache 2.0 | Paquete `.loom` para AMD Strix Halo y R9700 |
| `unsloth/Qwen3.5-35B-A3B-GGUF` (modelo base) | 35B totales, ~3B activos | No disponible en la informacion | No disponible en la informacion | GGUF para llama.cpp y runtimes compatibles |
| Qwen3.5-35B-A3B (modelo original de Qwen) | 35B totales, ~3B activos | No disponible en la informacion | No disponible en la informacion | Pesos originales; detalles no consultados |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Paquete de despliegue, no modelo nuevo: no incorpora fine-tuning ni cambios en los pesos; cualquier limitacion del modelo base Qwen3.5-35B-A3B se hereda integra.
- Rendimiento y correccion sin verificar: todas las puertas de correccion y las comparativas frente a llama.cpp figuran como "not yet re-measured", por lo que no hay evidencia publicada de paridad funcional.
- Soporte de hardware restringido: solo se declaran Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay soporte documentado para otras GPUs.
- Concurrencia limitada: 4 peticiones simultaneas y 4.096 tokens maximos de salida por preset, lo que restringe escenarios de alta carga o respuestas muy largas.
- Idiomas no documentados: la model card no especifica la cobertura linguistica; conviene validar el comportamiento en castellano antes de usarlo en produccion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como en cualquier LLM, requiere verificacion en dominios facticos.
- Sesgos: no documentados en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia del modelo base y del checkpoint de Unsloth por separado, ya que la model card solo declara la del paquete.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia (2026-11-19), sin historial de uso ni validacion comunitaria.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen3.5-35B-A3B-loom
- Modelo base (GGUF de Unsloth): https://huggingface.co/unsloth/Qwen3.5-35B-A3B-GGUF
- Repositorio del runtime Loom: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/

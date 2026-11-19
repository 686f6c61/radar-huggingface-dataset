# loom-draft/bartowski-granite-4.2-3b-loom

## Resumen

Este repositorio no contiene un modelo entrenado por el autor, sino un paquete de despliegue en formato Loom (`.loom` y `model.json`) para el checkpoint GGUF cuantizado Q4_K_M de `granite-4.2-3b`, publicado originalmente por bartowski. El paquete lo genera la herramienta `loom-next` (sin intervención de un LLM en el proceso) y está orientado específicamente a dos aceleradores AMD: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). El modelo subyacente es un transformer denso de 3 mil millones de parámetros de la familia Granite de IBM, distribuido bajo licencia Apache 2.0.

La relevancia de este artefacto es de infraestructura más que de modelado: permite servir el GGUF sobre el stack ROCm mediante `loom-serve`, con una API compatible con OpenAI (`/v1/chat/completions`), ventana de contexto de 131.072 tokens por petición y hasta 4 peticiones concurrentes. No se trata de un fine-tune ni de una modificación de pesos; el checkpoint GGUF se mantiene sin cambios y lo que se aporta son los kernels y programas generados para ejecutarlo en el hardware AMD indicado.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, fue creado el 19 de noviembre de 2026 y no incluye resultados de rendimiento ni de corrección medidos para este paquete concreto (todas las puertas de validación aparecen como "not yet re-measured").

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia IBM Granite 4.2), ejecutado mediante kernels Loom generados |
| Parametros totales | 3 mil millones (modelo base `granite-4.2-3b`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones del modelo base no detalladas en este paquete |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`granite-4.2-3b-Q4_K_M.gguf`) empaquetado como programas Loom (`program/*.loom`, `weights.loom`) |
| Tokens máximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| API | Compatible con OpenAI (`/v1/chat/completions`) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 3B parámetros de la familia Granite 4.2 de IBM, del que este repositorio solo redistribuye la cuantización Q4_K_M producida por bartowski. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original; esos datos corresponden a la model card de IBM Granite y no se incluyen aquí.

La innovación técnica de este paquete es el pipeline de generación de kernels: `loom-next` produce programas Loom (`program/*.loom`, `weights.loom`) a partir de `llm_config.json` y del tokenizer, con verificación de integridad SHA-256 de los ficheros fuente mediante `loom-fetch`. El serving se realiza con `loom-serve` sobre ROCm, con opciones como `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `--pool_backing=fixed` (reserva anticipada del pool de memoria) y `--parameter_mode=preload` (carga anticipada de pesos en host). El paquete incluye un modo de razonamiento ("thinking") activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`. No se indica decodificación especulativa (marcada como "not applicable").

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Modo de razonamiento/thinking activado por defecto, con posibilidad de desactivarlo por petición.
- Contexto largo: 131.072 tokens por petición, adecuado para documentos extensos y conversaciones multi-turno.
- Concurrencia de hasta 4 peticiones simultáneas con garantía de consistencia (la puerta `consistency` compara la salida concurrente con la ejecución aislada).
- Tool calling: marcado como "not applicable" en este paquete.
- Entrada de imagen: no soportada ("not applicable").
- Entrada/salida de audio: no soportada ("not applicable").
- Decodificación especulativa: no soportada.
- Ajuste de "reasoning effort": no aplicable.
- Muestreo (temperature, top_k, seed): estado "not determined" en la model card.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local sobre hardware AMD: servir el paquete con `loom-serve` en un Ryzen AI Max+ 395 o una Radeon AI PRO R9700 permite desplegar un chatbot con API compatible con OpenAI sin depender de GPUs NVIDIA ni de servicios en la nube.
- Procesamiento de documentos largos: con 131.072 tokens de contexto por petición, el modelo puede resumir, extraer información o responder preguntas sobre contratos, informes o bases de código de gran tamaño en una sola pasada.
- Razonamiento asistido con modo thinking: tareas de análisis paso a paso (clasificación razonada, resolución de problemas, explicación de código) activando el modo de razonamiento por defecto y desactivándolo cuando se priorice latencia.
- Prototipado de aplicaciones LLM en entornos ROCm: al exponer una API compatible con OpenAI, herramientas y SDKs existentes pueden apuntar a `http://127.0.0.1:8080/v1` sin cambios de código, lo que facilita validar productos sobre hardware AMD.
- Evaluación comparativa frente a llama.cpp: el paquete incluye puertas de corrección (`golden`, `compare`, `logits`, `sampling`, `decision`) diseñadas para comparar token a token la salida de Loom con la referencia de llama.cpp sobre el mismo GGUF, útil para validar la fidelidad del runtime.
- Despliegue en estaciones de trabajo con GPU de 32 GB: la Radeon AI PRO R9700 permite mantener el modelo y el pool de memoria fijos (`--pool_backing=fixed`) para cargas interactivas con latencia estable.
- Servicio multiinquilino ligero: con 4 peticiones concurrentes y contexto de 128k, puede atender un pequeño equipo interno con cargas moderadas de generación y análisis de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y para Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No se dispone de cifras de MMLU, HumanEval, GSM8K ni de throughput/latencia para este paquete.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia, una cuantización Q4_K_M de un modelo de 3B parámetros ocupa del orden de 2 GB de pesos; el pool de memoria de `loom-serve` se reserva de forma fija con `--pool_backing=fixed`, por lo que el consumo real depende de la configuración del preset.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM).
- GPU consumer: el paquete está generado específicamente para las dos plataformas AMD citadas; no se declara compatibilidad con GPUs consumer NVIDIA ni con otras arquitecturas AMD distintas de gfx1151 y gfx1201.
- Opciones de despliegue: `loom-serve` (stack ROCm, instalación vía `pipx install "hrx-loom[hf]==0.2.0"`), con descarga del paquete mediante `loom-fetch`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio; llama.cpp se usa únicamente como referencia de corrección.
- Latencia y throughput: no disponibles; la model card indica que las mediciones aún no se han repetido para este paquete.
- Configuración de serving relevante: `completion_spin_ns=4294967295` (espera activa, consume CPU mientras hay trabajo en GPU), `--pool_backing=fixed` y `--parameter_mode=preload`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| `loom-draft/bartowski-granite-4.2-3b-loom` (este) | 3B denso | 131.072 tokens | Apache 2.0 | GGUF empaquetado como Loom; `loom-serve` sobre ROCm (gfx1151, gfx1201) | Paquete de despliegue, sin benchmarks publicados |
| `bartowski/granite-4.2-3b-GGUF` (base directa) | 3B denso | no disponible en la información proporcionada | Apache 2.0 | GGUF para llama.cpp y runtimes compatibles | Mismo checkpoint; sirve de referencia de corrección para Loom |
| IBM Granite 4.2 3B (modelo original) | 3B denso | no disponible en la información proporcionada | Apache 2.0 | safetensors (formato original) | Pesos sin cuantizar; requiere runtime de inferencia estándar |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada; la comparativa se limita a parámetros, contexto declarado, licencia y formato de distribución.

## Limitaciones y advertencias

- No es un modelo nuevo ni un fine-tune: es un paquete de despliegue del GGUF de bartowski. Cualquier limitación del modelo Granite 4.2 3B original (sesgos, alucinaciones, cobertura idiomática) se hereda sin cambios.
- Ausencia total de validación publicada: todas las puertas de corrección y las mediciones de rendimiento figuran como "not yet re-measured", por lo que no hay evidencia registrada de fidelidad frente a llama.cpp en este paquete.
- Compatibilidad de hardware restringida: generado exclusivamente para gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700); no se declara soporte para otras GPUs.
- Tool calling, visión, audio y decodificación especulativa no están soportados en este paquete ("not applicable").
- El comportamiento de muestreo (temperature, top_k, seed) figura como "not determined"; conviene validarlo antes de usarlo en producción.
- Límite de 4 peticiones concurrentes y de 4.096 tokens de salida por petición según el preset.
- La opción `completion_spin_ns=4294967295` mantiene la CPU ocupada durante la espera activa de la GPU, lo que puede afectar al consumo energético y a la latencia de otros procesos en el mismo host.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y la atribución correspondiente; verificar las condiciones del modelo base de IBM Granite.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de comunidad que lo respalde.
- Los resultados de la búsqueda web recibidos corresponden a Loom (la herramienta de grabación de pantalla de Atlassian) y a la marca de ropa Loom, sin relación con el runtime AMD Loom; no deben usarse como referencia técnica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-granite-4.2-3b-loom
- Modelo base GGUF (bartowski): https://huggingface.co/bartowski/granite-4.2-3b-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/

# loom-draft/mradermacher-EryriLabs-cymraeg-4B-i1-loom

## Resumen

Este repositorio no contiene un modelo de lenguaje entrenado desde cero, sino un paquete de despliegue en formato `.loom` para el checkpoint GGUF `EryriLabs-cymraeg-4B.i1-Q4_K_M.gguf`, publicado originalmente por mradermacher a partir del modelo EryriLabs-cymraeg-4B de EryriLabs. El paquete lo genera la herramienta loom-next (sin intervención de un LLM en el bucle) y lo publica el usuario loom-draft bajo la organización Loom, orientado a GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El objetivo es servir el modelo sobre la pila Loom (hrx-loom 0.2.0), que expone una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, modo de razonamiento opcional y hasta 131.072 tokens de contexto por petición con 4 peticiones concurrentes. El modelo subyacente es un modelo de 4B parámetros orientado al galés (cymraeg), según indica su nombre, aunque esta ficha no dispone de la model card original para confirmar arquitectura ni datos de entrenamiento.

Es relevante ahora por dos motivos: por un lado, demuestra el interés por el despliegue de modelos en hardware AMD de consumo y estación de trabajo (ROCm, gfx1151/gfx1201); por otro, ilustra un patrón de distribución donde el artefacto publicado es el paquete de ejecución específico para una GPU, no los pesos en sí. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamaño de 0,0 GB, lo que sugiere que los ficheros aún no se han materializado o no están accesibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 4B; arquitectura no confirmada en la informacion proporcionada) |
| Parametros totales | 4B (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens por petición (límite del preset Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones del base no detalladas aquí |
| Idiomas soportados | no disponible (el nombre sugiere galés, sin confirmación en la información) |
| Licencia | MIT |
| Formato de pesos | GGUF (`EryriLabs-cymraeg-4B.i1-Q4_K_M.gguf`) empaquetado como programa `.loom` + `model.json` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base EryriLabs-cymraeg-4B ni sobre su proceso de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) en la información proporcionada. El nombre "i1" en el checkpoint suele asociarse en el ecosistema de mradermacher a cuantizaciones imatrix, pero no se confirma aquí. El modelo base apunta a un tamaño de 4B parámetros y a un enfoque en lengua galesa.

Lo que sí está documentado es la capa de despliegue: el paquete Loom incluye kernels generados específicamente para gfx1151 y gfx1201, un `model.json` con la configuración del preset y un `model.json.lock` que fija la procedencia. La generación se realizó con loom-next, que produce los programas `.loom` a partir del GGUF sin modificar los pesos. El preset fija `max_tokens` a 4.096, permite 4 peticiones concurrentes y activa el pensamiento opcional mediante `chat_template_kwargs: {"enable_thinking": true}`. No se aplica decodificación especulativa (marcada como "not applicable").

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling en estilo OpenAI (`tools` y `tool_calls`), con soporte para bucles de agente multi-turno según las puertas de validación descritas (`agent`, `agent_think_off`).
- Modo de razonamiento/thinking opcional, desactivado por defecto y activable por petición.
- Contexto largo: hasta 131.072 tokens por petición, con pruebas de referencia hasta documentos de 32k tokens en la puerta `golden`.
- Concurrencia de 4 peticiones simultáneas con consistencia verificada frente a ejecuciones aisladas (puerta `consistency`).
- Muestreo configurable (temperature, top_k, seed) con verificación de distribución del primer token frente a llama.cpp.
- Lectura de logits en host (`llm.logits`) para inspección y decisiones.
- Sin entrada de imagen ni audio en Loom, aunque el modelo upstream las soporte según la model card.
- Capacidades multilingües: no confirmadas en la información disponible.

## Casos de uso

- Asistencia en galés para administraciones y servicios públicos: el modelo base está orientado al galés, por lo que encaja en atención ciudadana, traducción de formularios y redacción de comunicaciones oficiales en esa lengua, servido localmente con la API de Loom.
- Despliegue en estaciones de trabajo AMD sin CUDA: el paquete está pensado para Strix Halo y Radeon AI PRO R9700, lo que permite ejecutar un chatbot interno en equipos con ROCm sin depender de GPUs NVIDIA.
- Agentes con tool calling en local: con soporte de `tools`/`tool_calls` y contexto de 131k, se puede construir un asistente que consulte APIs internas, bases de datos o sistemas de tickets en un bucle multi-turno.
- Procesamiento de documentos largos: la ventana de 131k tokens permite resumir o extraer información de informes extensos, contratos o expedientes en una sola petición, con la puerta `golden` validando fidelidad hasta 32k.
- Prototipado e investigación en modelos de 4B: útil para experimentar con cuantización Q4_K_M, comparar salidas frente a llama.cpp (puertas `compare`, `logits`, `sampling`) y medir el impacto de kernels específicos por arquitectura.
- Evaluación de la pila Loom como runtime alternativo: sirve para validar la paridad funcional (tool calling, concurrencia, thinking) frente a llama.cpp en hardware AMD antes de adoptarla en producción.
- Servicio de razonamiento ligero con thinking opcional: tareas de clasificación, extracción estructurada o respuesta a preguntas donde se activa el modo thinking solo en peticiones complejas para ahorrar latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete, y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como no medidas.

| Puerta de correccion | Strix Halo (gfx1151) | Radeon AI PRO R9700 (gfx1201) |
|---|---|---|
| `kernel_tests` | no medida | no medida |
| `golden` | no medida | no medida |
| `compare` | no medida | no medida |
| `vision` | no medida | no medida |
| `consistency` | no medida | no medida |
| `spec` | no medida | no medida |
| `agent` | no medida | no medida |
| `agent_think_off` | no medida | no medida |
| `sampling` | no medida | no medida |
| `logits` | no medida | no medida |
| `decision` | no medida | no medida |

## Requisitos de hardware

- VRAM estimada: un modelo de 4B en Q4_K_M ocupa aproximadamente 2,5-3 GB de pesos; el preset de Loom reserva un pool de memoria fijo (`--pool_backing=fixed`) cuyo tamaño exacto no se detalla en la información disponible.
- GPUs objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan otras GPU compatibles.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo AMD o NVIDIA; el paquete está generado para las dos arquitecturas AMD citadas.
- Despliegue: pila Loom mediante `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. No se indica soporte de vLLM, llama.cpp, Ollama o TGI para este paquete concreto, aunque el GGUF original puede usarse con llama.cpp de forma independiente.
- Latencia y throughput: no disponibles; las filas de rendimiento no se han vuelto a medir para este paquete. La configuración de referencia usa `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), lo que consume CPU mientras hay trabajo en vuelo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación rigurosa. Como referencia estructural, se compara el artefacto de despliegue:

| Aspecto | Este paquete (Loom) | GGUF original (mradermacher) | llama.cpp sobre el mismo GGUF |
|---|---|---|---|
| Formato | `.loom` + `model.json` | GGUF Q4_K_M | GGUF Q4_K_M |
| Hardware objetivo | gfx1151, gfx1201 (AMD) | Cualquiera con soporte GGUF | CPU, CUDA, ROCm, Metal |
| API | OpenAI-compatible | No aplica | Servidor propio de llama.cpp |
| Contexto por petición | 131.072 tokens | No disponible | Depende de la configuración |
| Concurrencia | 4 peticiones | No aplica | Depende de la configuración |
| Licencia | MIT | MIT | MIT |

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes y un tamaño de 0,0 GB: los ficheros pueden no estar materializados o accesibles, lo que impide verificar el paquete.
- No hay mediciones de rendimiento ni de corrección registradas para este paquete; todas las puertas figuran como no medidas, por lo que no hay evidencia publicada de paridad con llama.cpp.
- El modelo base es de 4B parámetros y está orientado al galés; su competencia en castellano y en otras lenguas no está confirmada en la información disponible.
- Loom no soporta entrada de imagen ni de audio, aunque el modelo upstream las soporte según la model card; esas capacidades quedan inaccesibles en este runtime.
- No se aplica decodificación especulativa en este preset.
- El límite de salida es de 4.096 tokens por petición, inferior al contexto de entrada; tareas de generación larga pueden truncarse.
- La licencia MIT del paquete aplica al empaquetado; conviene verificar la licencia del modelo base y de los datos de entrenamiento antes de uso comercial.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.
- El soporte se limita a dos arquitecturas AMD concretas; no hay garantía de funcionamiento en otras GPUs.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/mradermacher-EryriLabs-cymraeg-4B-i1-loom
- Modelo base GGUF: https://huggingface.co/mradermacher/EryriLabs-cymraeg-4B-i1-GGUF
- Repositorio de Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/

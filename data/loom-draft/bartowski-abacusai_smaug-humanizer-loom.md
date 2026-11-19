# loom-draft/bartowski-abacusai_Smaug-Humanizer-loom

## Resumen

`loom-draft/bartowski-abacusai_Smaug-Humanizer-loom` es un paquete de despliegue en formato Loom (`.loom` más un `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/abacusai_Smaug-Humanizer-GGUF`, en su variante `Q4_K_M`. No es un modelo entrenado por el autor del repositorio, sino un artefacto de empaquetado que traduce los pesos GGUF a programas Loom ejecutables sobre GPUs AMD concretas: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete lo publica el usuario `loom-draft` y se ha generado con `loom-next`, el generador del ecosistema Loom, sin intervención de un LLM en el bucle. Su utilidad es servir de puente entre un modelo abierto ya publicado en GGUF y el runtime `loom-serve`, que expone una API compatible con OpenAI (`/v1/chat/completions`) sobre hardware AMD con ROCm.

La relevancia es acotada y muy específica: no aporta un modelo nuevo ni mejoras de calidad, sino una vía de ejecución para Strix Halo y R9700. El repositorio tiene 0 descargas y 0 likes, tamaño de 0,0 GB y las mediciones de rendimiento y las puertas de corrección aparecen como "not yet re-measured", por lo que no hay evidencia publicada de rendimiento ni de fidelidad numérica frente a llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del checkpoint base `abacusai_Smaug-Humanizer`; el paquete solo aporta el runtime Loom) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 160.768 tokens por petición (según la tabla de features del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF de origen); el paquete Loom no declara otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen (`abacusai_Smaug-Humanizer-Q4_K_M.gguf`) convertido a programas `.loom` (`program/*.loom`, `weights.loom`) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo subyacente ni sus datos de entrenamiento. Lo que sí describe es el proceso de empaquetado: `loom-next` genera programas `.loom` y un fichero `weights.loom` a partir del GGUF original, junto con `tokenizer.json`, `llm_config.json` y un `model.json` con los ficheros fuente fijados por hash SHA-256, que `loom-fetch` verifica al descargar. No hay información sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el modelo base.

Las innovaciones técnicas del paquete son de runtime, no de modelo: espera activa de finalización en GPU (`completion_spin_ns=4294967295`), pool de memoria de respaldo fijo (`--pool_backing=fixed`) y precarga de pesos en host (`--parameter_mode=preload`). El paquete incluye un conjunto de puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida con una referencia de llama.cpp sobre el mismo GGUF, pero todas figuran como no re-medidas.

## Capacidades

- Generación de texto conversacional mediante API estilo OpenAI (`/v1/chat/completions`).
- Contexto largo: 160.768 tokens por petición, adecuado para documentos extensos.
- Concurrencia de 4 peticiones simultáneas según la tabla de features.
- Límite de salida de 4.096 tokens por petición (preset `max_tokens`).
- Tool calling: no aplicable según la tabla de features del paquete.
- Razonamiento o modo thinking: no aplicable.
- Esfuerzo de razonamiento configurable: no aplicable.
- Decodificación especulativa: no aplicable.
- Entrada de imagen: no soportada por Loom, aunque el modelo de origen la tenga.
- Entrada y salida de audio: no soportadas por Loom, aunque el modelo de origen las tenga.
- Muestreo (temperature, top_k, seed): estado "no determinado" en la tabla de features.
- Capacidades multilingües: no disponibles en la información.

## Casos de uso

- Despliegue local en Strix Halo: ejecutar el modelo Q4_K_M en un Ryzen AI Max+ 395 mediante `loom-fetch` y `loom-serve`, sin depender de CUDA ni de GPUs NVIDIA, usando la API compatible con OpenAI en `127.0.0.1:8080`.
- Despliegue en Radeon AI PRO R9700: servir el paquete `chat-r9700` en una GPU de 32 GB para entornos de estación de trabajo con ROCm, con el mismo endpoint HTTP.
- Procesamiento de documentos largos: aprovechar la ventana de 160.768 tokens por petición para resumir, extraer o clasificar contratos, informes o expedientes en una sola pasada.
- Evaluación comparativa de runtimes: usar las puertas `golden` y `compare` del paquete para contrastar la salida de Loom frente a llama.cpp sobre el mismo GGUF, token a token, con divergencias solo en empates cercanos.
- Pruebas de integración con clientes OpenAI: al exponer `/v1/chat/completions`, se puede apuntar cualquier SDK compatible con OpenAI al servidor local para validar flujos de chat multi-turno.
- Servicio de chat interno con concurrencia moderada: con 4 peticiones concurrentes y 4.096 tokens de salida, encaja en asistentes de equipo o herramientas internas de baja carga.
- Validación de kernels y consistencia: emplear las puertas `kernel_tests` y `consistency` para verificar que peticiones concurrentes producen la misma salida que ejecutadas por separado antes de promover el paquete a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero ambas indican explícitamente que los resultados "are not yet re-measured". Del mismo modo, todas las puertas de corrección figuran como no re-medidas, por lo que no hay evidencia de fidelidad numérica ni de throughput.

## Requisitos de hardware

- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible; el paquete no publica el tamaño del pool de memoria ni el consumo medido. La R9700 dispone de 32 GB, lo que da margen para un Q4_K_M de tamaño no especificado.
- GPUs NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que está generado para dispositivos AMD vía `amdgpu://`.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete.
- Opciones de arranque relevantes: `--pool_backing=fixed` (compromete el pool de memoria por adelantado) y `--parameter_mode=preload` (solo afecta a la carga de pesos en host).
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `loom-draft/bartowski-abacusai_Smaug-Humanizer-loom` | no disponible | 160.768 tokens | sin mediciones publicadas | Apache 2.0 | paquete Loom para AMD Strix Halo y R9700 |
| `bartowski/abacusai_Smaug-Humanizer-GGUF` (base) | no disponible | no disponible en esta ficha | referencia de llama.cpp usada por las puertas del paquete | Apache 2.0 (heredada) | GGUF para llama.cpp y runtimes compatibles |
| `abacusai/Smaug-Humanizer` (modelo original) | no disponible | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | pesos originales en Hugging Face |

La comparación relevante no es de calidad de modelo, sino de vía de ejecución: el paquete Loom solo se diferencia del GGUF base en el runtime (API OpenAI, pool fijo, espera activa) y en el hardware soportado (AMD gfx1151 y gfx1201). No se dispone de datos para comparar parámetros, contexto o rendimiento del modelo subyacente frente a alternativas.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, con tamaño de 0,0 GB; el artefacto no está validado por uso real.
- Ninguna de las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) tiene mediciones registradas; según la propia model card, "a gate without a recorded run shows no evidence".
- Las comparativas de rendimiento frente a llama.cpp para ambas GPUs están pendientes de re-medición.
- Tool calling, razonamiento, modo thinking, esfuerzo de razonamiento y decodificación especulativa figuran como "not applicable" en este paquete.
- La entrada de imagen y el audio no están soportados por Loom, aunque el modelo de origen los tenga; no se debe asumir multimodalidad al usar este paquete.
- El estado del muestreo (temperature, top_k, seed) figura como "no determinado".
- El límite de salida es de 4.096 tokens por petición, inferior a la ventana de contexto de 160.768 tokens; conviene dimensionar las respuestas esperadas en consecuencia.
- La concurrencia está limitada a 4 peticiones simultáneas.
- Solo funciona en las GPUs AMD indicadas; no hay soporte documentado para NVIDIA ni para otros dispositivos.
- Licencia Apache 2.0, que permite uso comercial, pero la licencia del modelo base y las condiciones de los datos de entrenamiento originales no se detallan en este repositorio; conviene verificarlas en el checkpoint de origen.
- Sesgos y riesgo de alucinación: no documentados en la información disponible; son los heredados del modelo base, que no se describen aquí.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/bartowski-abacusai_Smaug-Humanizer-loom
- Checkpoint GGUF base: https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/

# loom-draft/unsloth-SmolLM2-135M-Instruct-loom

## Resumen

Este repositorio no contiene un modelo entrenado por el autor, sino un paquete de despliegue en formato Loom para el checkpoint GGUF `SmolLM2-135M-Instruct-Q4_K_M.gguf` de Unsloth, que a su vez deriva del SmolLM2-135M-Instruct original de Hugging Face. El paquete incluye programas `.loom` generados con `loom-next`, un `model.json` con metadatos y el tokenizador, y está pensado para servir el modelo mediante `loom-serve` con una API compatible con OpenAI sobre GPUs AMD concretas: Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente, SmolLM2-135M-Instruct, es un transformer decoder-only de 135 millones de parámetros con instrucciones afinadas, diseñado para tareas ligeras de generación de texto y experimentación en entornos con recursos muy limitados. Su interés aquí es principalmente como vehículo de validación del stack Loom sobre hardware AMD, no como modelo de propósito general de alta capacidad.

La relevancia de esta ficha es acotada: se trata de un artefacto de integración (runtime + pesos cuantizados) más que de un modelo nuevo. No hay métricas de rendimiento publicadas para este paquete ("not yet re-measured" en la model card) ni resultados de benchmarks del modelo base incluidos en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2); paquete de despliegue Loom sobre GGUF |
| Parametros totales | 135 millones (modelo base SmolLM2-135M-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens por petición (según preset del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones del modelo base no detalladas en este paquete |
| Idiomas soportados | no disponible (la model card no los declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como programas `.loom` + `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| API | Estilo OpenAI `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El modelo subyacente es SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros afinado para seguir instrucciones. La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos corresponden a la model card original de SmolLM2, que no se incluye aquí. El checkpoint utilizado es la cuantización Q4_K_M publicada por Unsloth, sin modificaciones ("unmodified GGUF checkpoint").

La innovación técnica de este repositorio no está en el modelo sino en el empaquetado: `loom-next` genera programas `.loom` y kernels específicos para las arquitecturas AMD gfx1151 y gfx1201 a partir de la configuración del modelo (`llm_config.json`). El paquete fija los ficheros fuente con hashes SHA-256 verificados por `loom-fetch` y expone opciones de despliegue como `--pool_backing=fixed` (reserva de memoria por adelantado), `--parameter_mode=preload` (carga anticipada de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU). No se documentan técnicas como decodificación especulativa, atención lineal ni modos de razonamiento; la tabla de features las marca explícitamente como "not applicable".

## Capacidades

- Generación de texto conversacional con plantilla de chat instruct y endpoint compatible con OpenAI (`/v1/chat/completions`).
- Contexto de 8.192 tokens por petición y hasta 4.096 tokens de salida.
- Servicio concurrente de hasta 4 peticiones simultáneas.
- Muestreo configurable según el preset del paquete (la model card marca el estado de "sampling" como "not determined", es decir, sin verificar).
- Tool calling: no soportado ("not applicable").
- Razonamiento o modo thinking: no soportado ("not applicable").
- Decodificación especulativa: no soportada ("not applicable").
- Entrada de imagen o audio: no soportada ("not applicable").
- Capacidades multilingües: no declaradas en la información disponible.

## Casos de uso

- Validación de despliegue en GPUs AMD: servir el modelo con `loom-serve` en Strix Halo o Radeon AI PRO R9700 para comprobar que el stack Loom arranca, expone la API y responde en el hardware objetivo antes de pasar a modelos mayores.
- Pruebas de integración de clientes compatibles con OpenAI: apuntar un SDK o framework que hable el protocolo `/v1/chat/completions` contra el endpoint local para verificar flujos de chat, formato de mensajes y manejo de errores sin coste de GPU significativo.
- Desarrollo offline en estación de trabajo: con 135 millones de parámetros en Q4_K_M, el modelo ocupa muy poco espacio y permite iterar en local sobre una única GPU AMD sin depender de servicios externos.
- Generación de texto breve y prototipado: respuestas cortas, resúmenes de una frase o texto de relleno en demos, aprovechando los 8.192 tokens de contexto para conversaciones de varios turnos.
- Benchmarking de runtimes: comparar latencia y corrección del paquete Loom frente a llama.cpp sobre el mismo GGUF, usando las puertas de corrección (`golden`, `compare`, `consistency`) descritas en la model card cuando estén medidas.
- Pruebas de concurrencia ligera: validar el comportamiento del servidor con hasta 4 peticiones simultáneas y comprobar la puerta `consistency` (misma salida en concurrencia que en ejecución aislada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de rendimiento para este paquete "are not yet re-measured" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; un GGUF Q4_K_M de 135 millones de parámetros ocupa del orden de decenas de megabytes en pesos, por lo que el consumo dominante será el pool de memoria del runtime y el contexto (8.192 tokens × 4 peticiones concurrentes).
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan GPUs NVIDIA ni otras arquitecturas AMD.
- GPU de consumo: no se documenta compatibilidad con GPUs de consumo; el paquete está generado específicamente para gfx1151 y gfx1201.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue de este paquete (llama.cpp aparece solo como referencia de corrección).
- Latencia y throughput: no disponibles; la model card no incluye mediciones para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Este paquete (SmolLM2-135M-Instruct Q4_K_M, Loom) | 135 M | 8.192 tokens por petición | Apache 2.0 | GGUF empaquetado en `.loom`, runtime `loom-serve` | Solo GPUs AMD gfx1151 y gfx1201; sin benchmarks publicados |
| unsloth/SmolLM2-135M-Instruct-GGUF | 135 M | no disponible en esta información | Apache 2.0 | GGUF | Checkpoint de origen, sin empaquetado Loom; portable a llama.cpp y otros runtimes GGUF |
| SmolLM2-135M-Instruct (original) | 135 M | no disponible en esta información | Apache 2.0 | safetensors y otros | Modelo base de Hugging Face; ecosistema de runtimes más amplio (Transformers, vLLM, TGI) |
| Alternativas de tamano similar (p. ej. Qwen2.5-0.5B-Instruct) | 0,5 B | no disponible en esta información | no disponible en esta información | safetensors, GGUF | No se dispone de datos verificados en la información proporcionada para una comparación rigurosa |

## Limitaciones y advertencias

- Modelo de 135 millones de parámetros: capacidad de razonamiento, conocimiento factual y calidad de código muy limitadas en comparación con modelos de miles de millones de parámetros; no apto para tareas de producción exigentes.
- Riesgo de alucinación alto, inherente a un modelo de este tamaño y sin datos de evaluación publicados en este paquete.
- Sin soporte de tool calling, modo thinking, decodificación especulativa ni entradas multimodales; la model card los marca como "not applicable".
- Idiomas soportados no declarados: no se puede garantizar calidad fuera del inglés sin verificación adicional.
- Estado de muestreo sin determinar ("sampling: not determined") y todas las puertas de corrección sin medir; no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp.
- Compatibilidad restringida a GPUs AMD gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700); no se documenta funcionamiento en otras GPUs ni en CPU.
- Licencia Apache 2.0 en el paquete y en el modelo base, lo que permite uso comercial, pero el autor del paquete no ofrece garantías ni soporte; el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- El nombre "loom" del repositorio no guarda relación con la herramienta de grabación de pantalla Loom; los resultados de búsqueda web sobre ese producto no son relevantes para esta ficha.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/unsloth-SmolLM2-135M-Instruct-loom
- Modelo base GGUF (Unsloth): https://huggingface.co/unsloth/SmolLM2-135M-Instruct-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/

# loom-draft/rippertnt-HyperCLOVAX-SEED-Text-Instruct-1.5B-Q4_K_M-loom

## Resumen

Este repositorio no contiene un modelo de lenguaje entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF `hyperclovax-seed-text-instruct-1.5b-q4_k_m.gguf`. El autor es `loom-draft`, que emplea la herramienta `loom-next` (el generador, sin LLM en el bucle) para producir artefactos ejecutables sobre GPUs AMD. El modelo subyacente es HyperCLOVAX-SEED-Text-Instruct-1.5B, un modelo de instrucciones de 1.500 millones de parámetros de la familia HyperCLOVAX de Naver, publicado originalmente en formato GGUF por el usuario `rippertnt`.

La relevancia de esta ficha es doble. Por un lado, documenta una vía de despliegue nativa en hardware AMD (Ryzen AI Max+ 395 "Strix Halo" con gfx1151 y Radeon AI PRO R9700 con gfx1201) mediante el servidor `loom-serve`, que expone una API compatible con OpenAI. Por otro, sirve de ejemplo de empaquetado reproducible: el paquete fija los ficheros fuente con comprobación de hash SHA-256 y declara explícitamente qué capacidades están soportadas y cuáles no.

El modelo base es un transformer denso de 1.5B parámetros cuantizado en Q4_K_M, con una ventana de contexto declarada de 131.072 tokens por petición y hasta 4 peticiones concurrentes. La licencia del paquete es MIT. No se han publicado métricas de rendimiento ni resultados de las puertas de corrección para esta versión concreta: la model card indica explícitamente que los resultados "no se han vuelto a medir" en ambas GPUs objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base HyperCLOVAX-SEED-Text-Instruct-1.5B); paquete de despliegue Loom |
| Parametros totales | 1.5B (según el nombre del checkpoint base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens por petición (declarado en la tarjeta del paquete) |
| Tipos de cuantizacion | Q4_K_M (único formato empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`hyperclovax-seed-text-instruct-1.5b-q4_k_m.gguf`), empaquetado como artefactos `.loom` + `model.json` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| GPUs objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |
| Tool calling | no soportado ("not applicable") |
| Modo razonamiento / thinking | no soportado ("not applicable") |
| Decodificacion especulativa | no soportada ("not applicable") |
| Entrada de imagen | no soportada ("not applicable") |
| Entrada/salida de audio | no soportada ("not applicable") |
| Muestreo (sampling) | no determinado ("not determined") |

## Arquitectura y entrenamiento

El paquete no aporta información sobre el entrenamiento del modelo subyacente: no se detallan número de tokens, composición del dataset ni si hubo RLHF o DPO. Lo que sí documenta es la capa de despliegue. `loom-next` genera kernels y programas `.loom` específicos para las arquitecturas AMD gfx1151 y gfx1201, junto con un `model.json` que actúa como tarjeta del paquete y fija los ficheros fuente con verificación SHA-256 (`model.json.lock`). Los pesos no se modifican: se trata del mismo GGUF publicado por `rippertnt`.

El servidor `loom-serve` se invoca con tres parámetros relevantes: `completion_spin_ns=4294967295` (espera activa de las finalizaciones de GPU, consumiendo CPU mientras hay trabajo en vuelo; es la configuración usada en las mediciones de rendimiento de la tarjeta), `--pool_backing=fixed` (reserva el pool de memoria del preset por adelantado en lugar de crecimiento elástico) y `--parameter_mode=preload` (solo afecta a cómo se cargan los pesos en el host). La tarjeta no describe innovaciones de arquitectura del modelo, sino del runtime: kernels generados por GPU, puertas de corrección (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) y pruebas de equivalencia frente a llama.cpp.

## Capacidades

- Generación de texto conversacional con plantilla de instrucciones, servida mediante API compatible con OpenAI (`/v1/chat/completions`).
- Contexto largo: 131.072 tokens por petición, adecuado para documentos extensos o historiales de conversación amplios.
- Concurrencia de 4 peticiones simultáneas, con una puerta de consistencia declarada (misma salida en concurrencia que en ejecución aislada), aunque sin medición registrada en esta versión.
- Límite de 4.096 tokens de salida por respuesta (preset `max_tokens`).
- Tool calling: no soportado.
- Razonamiento explícito o modo thinking: no soportado.
- Decodificación especulativa: no soportada.
- Entrada de imagen: no soportada.
- Entrada o salida de audio: no soportada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local en estación de trabajo AMD: el paquete se instala con `pipx install "hrx-loom[hf]==0.2.0"`, se descarga con `loom-fetch` y se sirve con `loom-serve` en `127.0.0.1:8080`, sin dependencia de CUDA ni de la pila de NVIDIA. Adecuado para entornos donde la GPU es una Strix Halo o una R9700.
- Procesamiento de documentos largos: con 131.072 tokens de contexto por petición, permite resumir o extraer información de contratos, informes o transcripciones extensas en una sola pasada, siempre que la salida quepa en los 4.096 tokens configurados.
- Prototipado de aplicaciones con SDK de OpenAI: al exponer `/v1/chat/completions`, los clientes existentes pueden apuntar a `http://127.0.0.1:8080` cambiando únicamente la base URL, lo que facilita migrar prototipos a inferencia local.
- Evaluación de la pila Loom frente a llama.cpp: la tarjeta define puertas de corrección (`golden`, `compare`, `logits`, `sampling`) que comparan tokens greedy y log-probs top-5 contra una referencia de llama.cpp grabada sobre el mismo GGUF; útil para equipos que validan runtimes alternativos en hardware AMD.
- Servicio de chat de bajo perfil para equipos pequeños: 4 peticiones concurrentes y un modelo de 1.5B en Q4_K_M encajan en escenarios de uso interno con carga moderada, donde el coste por consulta en la nube no está justificado.
- Base para ajuste fino o experimentación posterior: al ser un checkpoint de instrucciones de 1.5B con licencia MIT, puede servir como punto de partida para tareas específicas de dominio antes de reempaquetar el resultado en Loom.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que, tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201, 32 GB), "the results for this package are not yet re-measured", y que todas las puertas de corrección figuran como "not yet re-measured". No se dispone de cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput para esta versión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; un GGUF Q4_K_M de 1.5B ocupa del orden de 1 GB de pesos, pero la tarjeta no publica la huella real del pool de memoria del preset.
- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs de consumo: no confirmada en la información proporcionada; el paquete está generado específicamente para gfx1151 y gfx1201.
- Despliegue: `hrx-loom[hf]==0.2.0` vía pipx, con `loom-fetch` para materializar el paquete y `loom-serve` como servidor. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones para este paquete concreto.
- Latencia y throughput: no disponibles; las filas de rendimiento de la tarjeta están pendientes de remedición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo | Notas |
|---|---|---|---|---|---|---|
| Este paquete (HyperCLOVAX-SEED-Text-Instruct-1.5B Q4_K_M, Loom) | 1.5B | 131.072 tokens | GGUF + `.loom` | MIT | AMD gfx1151 / gfx1201 | Sin benchmarks ni puertas de corrección medidas |
| Checkpoint base `rippertnt/HyperCLOVAX-SEED-Text-Instruct-1.5B-Q4_K_M-GGUF` | 1.5B | no disponible en la información | GGUF | no disponible en la información | Genérico (llama.cpp y afines) | Origen de los pesos; sin datos de rendimiento aportados |
| Alternativas de 1.5B en GGUF (p. ej. Qwen2.5-1.5B-Instruct) | 1.5B | no disponible en la información | GGUF | no disponible en la información | Genérico | No se dispone de datos comparativos verificados en esta búsqueda |

No se dispone de datos de rendimiento comparado para establecer una comparativa cuantitativa fiable; la comparación se limita a parámetros, formato y disponibilidad.

## Limitaciones y advertencias

- Ausencia de métricas: no hay benchmarks, latencias ni resultados de las puertas de corrección para esta versión; la tarjeta marca todas como "not yet re-measured". No debe asumirse equivalencia con llama.cpp sin verificación propia.
- Funcionalidades ausentes: sin tool calling, sin modo thinking, sin decodificación especulativa, sin visión y sin audio. Cualquier caso de uso que dependa de ellas queda descartado.
- Muestreo no determinado: la tarjeta marca la fila `sampling` como "not determined", por lo que el comportamiento de temperatura, top_k y semilla no está garantizado.
- Idiomas: no se declaran idiomas soportados; no se puede afirmar calidad en castellano sin evaluación propia.
- Sesgos y alucinación: no hay información proporcionada sobre sesgos conocidos ni tasas de alucinación del modelo base.
- Licencia: el paquete es MIT, pero la licencia del checkpoint base no se detalla en la información disponible; conviene verificar la del modelo original antes de uso comercial.
- Madurez del ecosistema: el paquete depende de `hrx-loom==0.2.0` y de hardware AMD concretos (gfx1151, gfx1201); fuera de esas GPUs no hay garantía de funcionamiento.
- Los resultados de búsqueda web devueltos corresponden a servicios y marcas no relacionadas (Loom.com, Loom.fr, el artículo de Wikipedia sobre telares) y no aportan información técnica sobre este modelo.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/rippertnt-HyperCLOVAX-SEED-Text-Instruct-1.5B-Q4_K_M-loom
- Checkpoint base en Hugging Face: https://huggingface.co/rippertnt/HyperCLOVAX-SEED-Text-Instruct-1.5B-Q4_K_M-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/

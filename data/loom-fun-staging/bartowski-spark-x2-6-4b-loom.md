# loom-fun-staging/bartowski-Spark-X2.6-4B-loom

## Resumen

`loom-fun-staging/bartowski-Spark-X2.6-4B-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/Spark-X2.6-4B-GGUF`, concretamente el fichero `Spark-X2.6-4B-Q4_K_M.gguf`. Lo publica la organizacion `loom-fun-staging` dentro del ecosistema Loom, una pila de inferencia de AMD construida sobre ROCm cuyo objetivo es ejecutar modelos GGUF en GPUs y APUs de AMD con un servidor compatible con la API de OpenAI.

El modelo subyacente es un transformer de aproximadamente 4.000 millones de parametros en cuantizacion Q4_K_M, derivado de `bartowski/Spark-X2.6-4B-GGUF`. Este repositorio no contiene pesos nuevos ni un fine-tuning: es un artefacto de empaquetado que permite servir el GGUF original mediante `loom-serve` en hardware objetivo muy concreto, la APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

Su relevancia es fundamentalmente practica para quien opera hardware AMD: ofrece una via de despliegue alternativa a llama.cpp ROCm con servidor OpenAI-compatible, tool calling, modo de razonamiento y una ventana declarada de 262.144 tokens por peticion. El repositorio esta en fase de staging (0 descargas, 0 likes en el momento de la consulta) y las cifras de rendimiento publicadas en la model card estan mayoritariamente sin medir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de ~4B; la model card no detalla la arquitectura del transformer) |
| Parametros totales | ~4.000 millones (derivado de la nomenclatura "4B"; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF); el repositorio base de bartowski probablemente ofrece otras, no confirmado aqui |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Spark-X2.6-4B-Q4_K_M.gguf`) empaquetado como programa `.loom` + `model.json` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |
| Concurrencia | 4 peticiones concurrentes |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |

## Arquitectura y entrenamiento

La model card de este repositorio no describe la arquitectura ni el proceso de entrenamiento del modelo subyacente: se limita a documentar el empaquetado Loom del GGUF `Spark-X2.6-4B-Q4_K_M.gguf` de `bartowski/Spark-X2.6-4B-GGUF`. Por la nomenclatura y el tamano (~4B) cabe esperar un transformer decoder-only denso, pero no hay confirmacion en la informacion disponible sobre numero de capas, dimensiones, atencion (GQA/MQA), funcion de activacion ni tokenizador. Tampoco se documentan tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento.

La innovacion tecnica de este artefacto no esta en el modelo sino en la pila de ejecucion: Loom genera kernels especificos para las arquitecturas AMD gfx1151 y gfx1201 a partir del GGUF, y expone un servidor compatible con OpenAI con soporte de tool calling, modo de razonamiento activado por defecto (`enable_thinking`, `reasoning_effort` con valores `low` y `high`) y decodificacion especulativa marcada como no aplicable (el GGUF no incluye cabeza MTP ni hay drafter publicado para este modelo exacto). La model card incluye ademas una bateria de puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `agent_think_off`) que comparan la salida de Loom contra la referencia de llama.cpp token a token; en este paquete figuran como no re-ejecutadas (la ultima pasada fue sobre un build previo, sha256 `b383bfe`).

## Capacidades

- Generacion de texto y razonamiento: modo "thinking" activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` con valores `low` y `high` (por defecto `high`).
- Tool calling / function calling en formato OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno de agente segun las puertas `agent` y `agent_think_off`.
- Servidor HTTP compatible con la API de OpenAI (`/v1/chat/completions`) en `127.0.0.1:8080`.
- Ventana de contexto de 262.144 tokens por peticion, con hasta 4 peticiones concurrentes.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Sin entrada de imagen: la puerta `vision` figura como no aplicable.
- Sin entrada ni salida de audio: no aplicable.
- Sin decodificacion especulativa: no aplicable en este paquete.
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistente de codigo en estaciones de trabajo AMD: servir el GGUF con `loom-serve` en una APU Strix Halo permite disponer de un endpoint OpenAI local para autocompletado y refactorizacion sin depender de la nube, con tool calling para invocar linters o ejecutar tests desde el propio agente.
- Agentes multi-paso sobre repositorios: el soporte de `tools`/`tool_calls` y las puertas `agent`/`agent_think_off` estan pensados para bucles de agente con historial reutilizado; util para tareas de busqueda en codigo, edicion y verificacion encadenadas.
- Procesamiento de documentos largos: la ventana de 262.144 tokens por peticion permite ingerir contratos, informes o expedientes completos en una sola llamada; el prefill medido en la roofline para 32k tokens es de 5.819,4 tok/s, lo que da una idea del coste de arranque en contextos grandes.
- Razonamiento con coste controlado: el parametro `reasoning_effort` permite bajar a `low` en tareas simples (clasificacion, extraccion) y subir a `high` en problemas que requieren cadena de pensamiento, ajustando latencia y tokens generados.
- Despliegue en GPU de 32 GB: en una Radeon AI PRO R9700 el paquete se sirve con `--memory_bytes=34000000000`, lo que deja margen para el modelo Q4_K_M y el contexto; adecuado para prototipos de inferencia local en servidor de gama media.
- Evaluacion comparativa de motores de inferencia: al ser un paquete Loom con puertas `golden` y `compare` contra llama.cpp, sirve para validar la equivalencia numerica de la pila Loom en hardware AMD antes de migrar cargas de produccion.
- Servicio interno con concurrencia limitada: 4 peticiones concurrentes y 4.096 tokens de salida maximos encajan en un endpoint de uso interno para equipos pequenos, no en un servicio publico de alta demanda.

## Benchmarks y rendimiento

La model card incluye una tabla de rendimiento frente a llama.cpp ROCm para Strix Halo, pero las columnas de llama.cpp y Loom estan sin medir ("—"); solo se publican los valores de roofline (techo teorico del hardware a 216 GB/s y 59 TFLOP/s). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

Roofline en AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), GGUF Q4_K_M:

| Metrica | Roofline |
|---|---|
| Decode tok/s, prompt corto | 82,6 |
| Decode tok/s, contexto 2k | 78,7 |
| Decode tok/s, contexto 32k | 56,1 |
| Prefill tok/s, documento 1k | 7.518,2 |
| Prefill tok/s, documento 2k | 7.443,3 |
| Prefill tok/s, documento 8k | 7.049,8 |
| Prefill tok/s, documento 16k | 6.585,7 |
| Prefill tok/s, documento 32k | 5.819,4 |
| 4 streams, decode agregado tok/s | 294,8 |

En Radeon AI PRO R9700 (gfx1201, 32 GB) la model card indica que los resultados de este paquete aun no se han re-medido.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el ejemplo de servicio en R9700 usa `--memory_bytes=34000000000` (34 GB) y en Strix Halo `--memory_bytes=55000000000` (55 GB), cifras que incluyen modelo, contexto y margen de trabajo.
- GPUs/APUs soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se documenta soporte para otras GPU NVIDIA o AMD.
- GPU de consumo: no disponible; el paquete esta dirigido a hardware AMD concreto y no se indica compatibilidad con Radeon RX de consumo.
- Despliegue: `pip install "hrx-loom[hf]==0.1.0"`, descarga con `loom-fetch` y servicio con `loom-serve`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete; llama.cpp aparece solo como referencia de comparacion.
- Latencia y throughput: los valores medidos de Loom y llama.cpp no se publicaron; solo se dispone del techo roofline de la seccion anterior.
- Concurrencia maxima: 4 peticiones simultaneas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| `loom-fun-staging/bartowski-Spark-X2.6-4B-loom` | ~4B (Q4_K_M) | 262.144 tokens por peticion | Apache 2.0 | GGUF empaquetado `.loom`; `loom-serve` | Solo AMD Strix Halo y R9700; staging, sin benchmarks de calidad |
| `bartowski/Spark-X2.6-4B-GGUF` | ~4B | no disponible | Apache 2.0 (heredada) | GGUF | Checkpoint original sin empaquetar; sirve con llama.cpp y otras pilas GGUF |
| llama.cpp ROCm (motor, no modelo) | n/a | n/a | MIT (llama.cpp) | GGUF nativo | Referencia de comparacion en la model card; argumentos del servidor no registrados |

No se dispone de informacion sobre otros modelos de ~4B comparables en la informacion proporcionada; la comparativa se limita al checkpoint de origen y al motor de referencia.

## Limitaciones y advertencias

- Repositorio en staging: 0 descargas y 0 likes en el momento de la consulta; no debe tratarse como un artefacto estable de produccion.
- Las puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `agent_think_off`) no se han re-ejecutado sobre este paquete; la ultima pasada corresponde a un build previo (sha256 `b383bfe`). La equivalencia con llama.cpp no esta verificada para este artefacto concreto.
- Las cifras de rendimiento de Loom y llama.cpp estan sin medir; solo hay roofline teorico. No hay datos de latencia reales.
- Los resultados en Radeon AI PRO R9700 no se han re-medido.
- No hay benchmarks de calidad (MMLU, HumanEval, GSM8K) ni informacion sobre sesgos, alucinacion o comportamiento multilingue del modelo subyacente.
- Compatibilidad de hardware muy restringida: solo se documentan gfx1151 y gfx1201; no se garantiza funcionamiento en otras GPU AMD ni en NVIDIA.
- Limite de 4 peticiones concurrentes y 4.096 tokens de salida por peticion, lo que acota los escenarios de servicio.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion de calidad y de datos de entrenamiento impide valorar riesgos de sesgo o alucinacion en produccion.
- El nombre "Loom" coincide con el producto de grabacion de pantalla de Atlassian; los resultados de busqueda web sobre "Loom" no son relevantes para este modelo y no deben confundirse.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun-staging/bartowski-Spark-X2.6-4B-loom
- Modelo base (GGUF): https://huggingface.co/bartowski/Spark-X2.6-4B-GGUF
- Repositorio del sistema Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/

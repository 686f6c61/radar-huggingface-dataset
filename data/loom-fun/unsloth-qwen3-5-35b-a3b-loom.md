# loom-fun/unsloth-Qwen3.5-35B-A3B-loom

## Resumen

Loom-fun/unsloth-Qwen3.5-35B-A3B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `Qwen3.5-35B-A3B-Q4_K_M.gguf` de Unsloth. No es un modelo nuevo ni un fine-tune: es una distribucion empaquetada del modelo base Qwen3.5-35B-A3B, una familia multimodal de razonamiento hibrido de Alibaba, adaptada para ejecutarse sobre GPUs AMD mediante el runtime Loom (parte del proyecto hrx-system de ROCm).

El paquete esta generado especificamente en un AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) usando el flujo de trabajo loom-skills, y expone un servidor compatible con la API de OpenAI (`/v1/chat/completions`). El modelo base es un MoE de 35B parametros totales con 3B activos, contexto de 262.144 tokens por peticion y capacidad de entrada de imagen, ademas de modo de razonamiento activado por defecto.

Su relevancia es practica: demuestra la viabilidad de servir un modelo multimodal de 35B en hardware AMD de consumo con aceleracion por ROCm, decodificacion especulativa DFlash y verificacion de correctitud frente a llama.cpp. El autor publica comparativas de rendimiento detalladas frente a llama.cpp en el mismo GGUF y dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo MoE (modelo base Qwen3.5-35B-A3B) |
| Parametros totales | 35B |
| Parametros activos | 3B (MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como `.loom` + `model.json` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-35B-A3B es un LLM multimodal de razonamiento hibrido de la familia Qwen3.5 de Alibaba, con arquitectura Mixture of Experts (35B parametros totales, 3B activos). Soporta entrada de imagen mediante un proyector multimodal (`mmproj-F16.gguf`) y modo de razonamiento activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`. No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF/DPO en la informacion proporcionada.

El paquete Loom no modifica los pesos: empaqueta el GGUF original con kernels generados y una configuracion de servidor. Incorpora decodificacion especulativa DFlash con profundidad 7 y un drafter separado (`Anbeeld/Qwen3.5-35B-A3B-DFlash-GGUF`), activada por defecto. La verificacion de correctitud incluye 32/32 tests de kernel, comparacion token a token frente a llama.cpp (greedy y top-5 log-probs), paridad en vision, consistencia concurrente, equivalencia con y sin decodificacion especulativa, y pruebas de aguja en pajar hasta la mitad del contexto.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento activado por defecto.
- Entrada de imagen (image-text-to-text) mediante `image_url` estilo OpenAI y proyector `mmproj-F16.gguf`.
- Tool calling / function calling con `tools` y `tool_calls` estilo OpenAI.
- Bucles de agente multi-turno con reutilizacion de historial y llamadas a herramientas validas (verificado en el gate `agent`).
- Decodificacion especulativa DFlash (profundidad 7) activada por defecto.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Concurrencia de 4 peticiones simultaneas.
- Limite de salida de 4.096 tokens por peticion (preset `max_tokens`).
- No soporta audio ni ajuste de esfuerzo de razonamiento (reasoning effort).

## Casos de uso

- Servicio local de chat multimodal en estacion de trabajo AMD: el servidor Loom expone `/v1/chat/completions` en `127.0.0.1:8080`, permitiendo integrar el modelo en aplicaciones existentes sin cambiar de cliente OpenAI.
- Asistente con imagenes: la entrada `image_url` y el proyector F16 permiten describir, analizar o extraer informacion de capturas y documentos escaneados, con paridad verificada frente a llama.cpp.
- Agentes con herramientas: el soporte de `tools`/`tool_calls` y el gate `agent` validan bucles multi-turno, adecuados para automatizacion de tareas que requieren consultas externas.
- Procesamiento de documentos largos: con 262.144 tokens de contexto por peticion y pruebas de aguja en pajar hasta la mitad del contexto, es viable resumir o consultar expedientes extensos en una sola pasada.
- Razonamiento asistido con traza: el modo thinking por defecto resulta util en tareas de analisis que se benefician de cadena de razonamiento, desactivable cuando se prioriza latencia.
- Evaluacion de hardware AMD para IA: el paquete sirve como referencia reproducible de rendimiento (prefill y decode) frente a llama.cpp en Strix Halo, con metricas publicadas y gates de correctitud.
- Prototipado en consumer GPU AMD: al ejecutarse sobre Radeon 8060S con 42 GB de memoria asignada, permite probar un MoE de 35B multimodal sin GPU de datacenter.

## Benchmarks y rendimiento

Datos publicados por el autor en AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), mismo GGUF en ambos motores:

| Metrica | llama.cpp | Loom | Diferencia |
|---|---|---|---|
| Decode tok/s, prompt corto | 54,9 | 52,0 | -5 % |
| Decode tok/s, contexto 2k | 53,2 | 31,4 | -41 % |
| Decode tok/s, contexto 32k | 46,1 | 15,2 | -67 % |
| Prefill tok/s, documento 1k | 1187,5 | 1688,8 | +42 % |
| Prefill tok/s, documento 2k | 1217,4 | 1647,3 | +35 % |
| Prefill tok/s, documento 8k | 1205,2 | 1507,4 | +25 % |
| Prefill tok/s, documento 16k | 1028,3 | 1506,4 | +46 % |
| Prefill tok/s, documento 32k | 832,3 | 1408,4 | +69 % |
| 4 streams, decode agregado tok/s | 96,7 | 70,1 | -28 % |
| Tokens draft aceptados (especulativa) | — | 49 % | — |

El autor reporta ademas el porcentaje de roofline alcanzado por Loom: 63 % en decode corto, 40 % a 2k, 25 % a 32k y 14-18 % en prefill. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el ejemplo de arranque usa `--memory_bytes=42000000000` (42 GB) en memoria unificada.
- GPU objetivo: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151, Strix Halo), 216 GB/s de ancho de banda y 59 TFLOP/s segun la roofline del autor.
- No cabe en GPUs consumer de memoria dedicada convencional (24 GB o menos) por el tamano del GGUF Q4_K_M mas el proyector F16 y el drafter.
- Despliegue: runtime Loom (`pip install "hrx-loom[hf]"`, `loom-fetch`, `loom-serve`) sobre ROCm; llama.cpp como alternativa de referencia con `--spec-type draft-dflash`.
- Rendimiento medido: 52 tok/s en decode corto, 15,2 tok/s a 32k de contexto, 1688,8 tok/s de prefill a 1k; 70,1 tok/s agregados con 4 streams. Loom supera a llama.cpp en prefill (+25 % a +69 %) pero queda por debajo en decode (-5 % a -67 %).

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B (este paquete) | 35B | 3B | 262.144 | no disponible | GGUF Q4_K_M + paquete Loom |
| Qwen3.5-27B | 27B | denso | no disponible | no disponible | familia Qwen3.5 |
| Qwen3.5-122B-A10B | 122B | 10B | no disponible | no disponible | familia Qwen3.5 |
| Qwen3.5-397B-A17B | 397B | 17B | no disponible | no disponible | familia Qwen3.5 |

Los modelos de la familia Qwen3.5 se citan como referencia por tamano segun la documentacion de Unsloth; no se dispone de datos de rendimiento comparativo entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete esta generado y validado unicamente en AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); el soporte en otro hardware AMD no esta documentado.
- El gate `needle_full` (aguja en pajar a contexto completo) no tiene evidencia: la atencion a maxima capacidad no esta verificada.
- La decodificacion especulativa degrada con el contexto: aceptacion del 20 % en decode corto, 19 % a 2k y 14 % a 32k, lo que explica la caida de decode a contextos largos.
- Loom pierde frente a llama.cpp en decode (-41 % a 2k, -67 % a 32k) y en concurrencia a 4 streams (-28 %); solo gana en prefill.
- Limite de 4.096 tokens de salida por peticion y 4 peticiones concurrentes, insuficiente para cargas de produccion de alta concurrencia.
- No soporta audio ni ajuste de esfuerzo de razonamiento.
- Licencia e idiomas no disponibles: no se puede confirmar el uso comercial sin consultar el modelo base Qwen3.5-35B-A3B.
- Riesgo de alusiones y sesgos inherente al modelo base; no se han publicado evaluaciones de sesgo en la informacion disponible.
- El modelo tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia: madurez y mantenimiento no verificados.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/loom-fun/unsloth-Qwen3.5-35B-A3B-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3.5-35B-A3B-GGUF
- Drafter de decodificacion especulativa: https://huggingface.co/Anbeeld/Qwen3.5-35B-A3B-DFlash-GGUF
- Runtime Loom (hrx-system): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de referencia (DevLab Dispatch): https://github.com/loom-fun/loom-skills/actions/runs/42333444785
- Documentacion de Qwen3.5 en Unsloth: https://unsloth.ai/docs/models/qwen3.5

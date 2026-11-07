# loom-fun/unsloth-Qwen3-4B-Instruct-2507-loom

## Resumen

`loom-fun/unsloth-Qwen3-4B-Instruct-2507-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `Qwen3-4B-Instruct-2507-Q4_K_M.gguf` de Unsloth, derivado a su vez de Qwen3-4B-Instruct-2507 de Alibaba Qwen. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los mismos del GGUF original; lo que aporta este repositorio es la infraestructura de ejecucion para servir el modelo en hardware AMD, concretamente en la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) mediante el runtime `hrx-loom`.

El interes practico esta en el motor de inferencia: Loom implementa decodificacion especulativa con un drafter DFlash (AtomicChat/Qwen3-4B-DFlash-GGUF) a profundidad 7, servidor compatible con la API de OpenAI (`/v1/chat/completions`), tool calling y una ventana de contexto declarada de 262.144 tokens por peticion. El autor publica comparativas directas contra llama.cpp sobre el mismo GGUF y el mismo equipo, con ganancias notables en prefill (hasta +89 % en documentos de 16k) y perdidas severas en decode con contexto largo (-84 % a 32k).

El modelo subyacente, Qwen3-4B-Instruct-2507, es un transformer denso de 4.000 millones de parametros en modo no-thinking, con mejoras en instrucciones, razonamiento logico, matematicas, codigo y uso de herramientas respecto a versiones anteriores de Qwen3-4B. La relevancia de este paquete es acotada: sirve para evaluar el runtime Loom en Strix Halo, no como sustituto del modelo base para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B-Instruct-2507); empaquetado como runtime Loom sobre GGUF |
| Parametros totales | 4.000 millones (modelo base Qwen3-4B-Instruct-2507) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado); el drafter DFlash usa Q8_0 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | no disponible en la informacion proporcionada (la del modelo base Qwen3-4B-Instruct-2507 no se detalla en la model card) |
| Formato de pesos | GGUF (`Qwen3-4B-Instruct-2507-Q4_K_M.gguf`) empaquetado como programas `.loom` + `model.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B-Instruct-2507, un transformer denso de 4.000 millones de parametros en modo instruct sin thinking, publicado por Qwen con mejoras en seguimiento de instrucciones, razonamiento logico, comprension de texto, matematicas, ciencia, codigo y uso de herramientas, ademas de mayor cobertura de conocimiento de cola larga. La model card del paquete Loom no documenta el dataset de entrenamiento, el numero de tokens, ni si hubo RLHF o DPO; esa informacion corresponde al modelo base y no se incluye en la informacion disponible.

La innovacion tecnica de este repositorio no esta en el modelo sino en el runtime. Loom genera kernels especificos para la GPU integrada de Strix Halo (gfx1151) y sirve el GGUF sin modificarlo, con decodificacion especulativa activada por defecto mediante un drafter DFlash de AtomicChat a profundidad 7. El autor valida la correccion con una bateria de gates: `kernel_tests` (42/42 tests unitarios de kernels contra implementaciones de referencia), `golden` y `compare` (comparacion token a token contra llama.cpp, con divergencias solo en empates cercanos), `consistency` (misma salida en peticiones concurrentes), `spec` (la decodificacion especulativa no altera la salida), `agent` (bucle multi-turno de tool calling), `sampling` y `needle` (needle-in-the-haystack hasta la mitad del contexto). El gate `needle_full` a contexto completo no tiene evidencia registrada.

## Capacidades

- Generacion de texto e instrucciones generales, razonamiento logico, matematicas, ciencia y codigo, heredados de Qwen3-4B-Instruct-2507.
- Tool calling en estilo OpenAI: acepta `tools` y devuelve `tool_calls`; validado con el gate `agent` en bucles multi-turno con reutilizacion de historial.
- Servidor HTTP compatible con `/v1/chat/completions` de OpenAI, escuchando en `127.0.0.1:8080`.
- Decodificacion especulativa DFlash a profundidad 7 activada por defecto, con un 26 % de tokens del drafter aceptados en el gate `spec`.
- Muestreo configurable: `temperature`, `top_p`, `top_k` y `seed`.
- Concurrencia de hasta 4 peticiones simultaneas con salida identica a ejecuciones aisladas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Sin modo thinking ni reasoning effort: no soportado.
- Sin entrada de imagen ni audio: no soportado.

## Casos de uso

- Evaluacion del runtime Loom en Strix Halo: desplegar el paquete con `loom-fetch` y `loom-serve --device=amdgpu` para medir decode, prefill y aceptacion especulativa en la APU Ryzen AI Max+ 395 antes de adoptar el motor en un equipo de desarrollo.
- Asistente de codigo local en estaciones de trabajo AMD: el modelo base cubre generacion y explicacion de codigo, y el servidor expone la API de OpenAI, por lo que se integra con clientes y extensiones de editor sin cambios.
- Procesado de documentos largos con prefill intensivo: el paquete muestra 2.517 tok/s de prefill en documentos de 1k y 2.005 tok/s en 8k, lo que lo hace adecuado para resumir o extraer informacion de documentos extensos donde el coste dominante es la fase de prefill.
- Agentes con tool calling en local: el gate `agent` valida el bucle multi-turno con llamadas a herramientas y reutilizacion de historial, util para automatizaciones que consultan APIs internas sin salir del equipo.
- Servicio de chat multiusuario ligero: con 4 peticiones concurrentes validadas por el gate `consistency`, sirve para prototipos de atencion interna o demos donde el throughput agregado (101 tok/s en 4 streams) es suficiente.
- Pruebas de regresion de motores de inferencia: usar los gates `golden`, `compare` y `spec` como referencia para verificar que un cambio en kernels o en el drafter no altera la salida token a token frente a llama.cpp.
- Despliegue en entornos con memoria unificada: `loom-serve` acepta `--memory_bytes=62000000000`, lo que permite reservar memoria de la APU para el modelo y el contexto en un solo equipo sin GPU dedicada.

## Benchmarks y rendimiento

Rendimiento comparado con llama.cpp sobre el mismo GGUF y el mismo equipo (AMD Ryzen AI Max+ 395 con Radeon 8060S, Ubuntu 24.04, hrx-loom 0.1.0):

| Metrica | llama.cpp | Loom | Margen | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 53,7 | 62,4 | +16 % | 128,6 | 49 % |
| Decode tok/s, contexto 2k | 47,4 | 32,5 | -31 % | 107,9 | 30 % |
| Decode tok/s, contexto 32k | 25,6 | 4,0 | -84 % | 33,7 | 12 % |
| Prefill tok/s, documento 1k | 1.658,9 | 2.517,6 | +52 % | 7.802,6 | 32 % |
| Prefill tok/s, documento 2k | 1.371,8 | 2.573,4 | +88 % | 7.509,7 | 34 % |
| Prefill tok/s, documento 8k | 1.156,6 | 2.005,6 | +73 % | 6.129,3 | 33 % |
| Prefill tok/s, documento 16k | 772,6 | 1.462,0 | +89 % | 4.922,7 | 30 % |
| Prefill tok/s, documento 32k | 482,3 | 817,5 | +70 % | 3.532,1 | 23 % |
| 4 streams, decode agregado tok/s | 88,4 | 101,3 | +15 % | 856,3 | 12 % |
| Decodificacion especulativa, tokens del drafter aceptados | — | 26 % | — | n/a | n/a |

Notas del autor: llama.cpp es build `llamacpp-rocm/b1369` con `-ngl 99 -cram 0 --spec-type draft-dflash --spec-draft-model .../Qwen3-4B-DFlash.Q8_0.gguf --spec-draft-n-max 3 -ngld 99 -c 35024 -kvu -np 4`; Loom con decodificacion especulativa DFlash a profundidad 7. La aceptacion medida en las filas de decode fue del 7 % (prompt corto), 6 % (2k) y 2 % (32k); la del 26 % corresponde al gate `spec`. El roofline se calcula a 216 GB/s y 59 TFLOP/s para gfx1151. Medicion del 2026-11-07, run 42340394242.

No se han publicado resultados de benchmarks del modelo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada: el ejemplo oficial reserva 62.000.000.000 bytes (62 GB) con `--memory_bytes` en una APU con memoria unificada; el GGUF Q4_K_M de un modelo de 4B ocupa aproximadamente 2,5 GB, por lo que la mayor parte de esa reserva corresponde al contexto y a buffers.
- GPU recomendadas: el paquete esta generado y validado exclusivamente en AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151). No hay datos de funcionamiento en A100, H100 ni RTX 4090.
- GPU de consumo: si cabe en GPUs de consumo por tamano del GGUF, pero el runtime Loom esta orientado a `--device=amdgpu` en Strix Halo; no se documenta soporte para otras GPUs.
- Opciones de despliegue: `hrx-loom` (instalacion con `pip install "hrx-loom[hf]"`), `loom-fetch` para materializar el paquete y `loom-serve` como servidor. El mismo GGUF puede servirse con llama.cpp (build `llamacpp-rocm/b1369`) segun la configuracion de referencia del autor.
- Throughput: 62,4 tok/s de decode con prompt corto y 2.517,6 tok/s de prefill a 1k; 101,3 tok/s agregados con 4 streams. El decode cae a 4,0 tok/s con contexto de 32k.
- Latencia: no se publican medidas de latencia por peticion (time-to-first-token); solo tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Motor y formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loom-fun/unsloth-Qwen3-4B-Instruct-2507-loom | 4B densos | 262.144 tokens por peticion | Loom sobre GGUF Q4_K_M, solo Strix Halo (gfx1151) | no disponible | Hugging Face, 0 descargas |
| unsloth/Qwen3-4B-Instruct-2507-GGUF | 4B densos | segun configuracion del runtime | GGUF para llama.cpp y derivados | no disponible en la informacion proporcionada | Hugging Face (Unsloth) |
| unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit | 4B densos | segun configuracion del runtime | safetensors cuantizados en bitsandbytes 4-bit | no disponible en la informacion proporcionada | Hugging Face (Unsloth) |
| AtomicChat/Qwen3-4B-DFlash-GGUF | drafter de decodificacion especulativa | n/a | GGUF Q8_0 | no disponible | Hugging Face |

La comparativa relevante no es de calidad de modelo, porque los pesos son identicos a los del GGUF de Unsloth, sino de motor: Loom frente a llama.cpp sobre el mismo checkpoint, con los resultados de la tabla de benchmarks. No se dispone de datos de benchmarks de calidad para comparar con otros modelos de 4B.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son identicos al GGUF `Qwen3-4B-Instruct-2507-Q4_K_M.gguf` de Unsloth; cualquier limitacion del modelo base aplica sin cambios.
- El decode con contexto largo se degrada gravemente: 4,0 tok/s a 32k frente a 25,6 tok/s de llama.cpp (-84 %). No es adecuado para generacion larga sobre contextos extensos en este runtime.
- La aceptacion del drafter especulativo es baja en decode (7 % a prompt corto, 2 % a 32k), lo que limita la ganancia real de la decodificacion especulativa en esas condiciones.
- El gate `needle_full` a contexto completo no tiene evidencia de exito; la ventana de 262.144 tokens esta declarada, pero solo se valido needle-in-a-haystack hasta la mitad del contexto.
- El paquete esta validado unicamente en AMD Ryzen AI Max+ 395 "Strix Halo" con Ubuntu 24.04; no hay evidencia de funcionamiento en otras GPUs ni sistemas operativos.
- Sin modo thinking ni reasoning effort; si la tarea requiere razonamiento extendido, este paquete no lo ofrece.
- Sin vision ni audio.
- Licencia no disponible en la informacion proporcionada: verificar la licencia del modelo base Qwen3-4B-Instruct-2507 antes de cualquier uso comercial.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; son los inherentes al modelo base.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia: no hay evidencia de uso en produccion por terceros.
- La comparativa de rendimiento usa tiempos del lado del cliente para Loom y del lado del servidor para llama.cpp, y 1-2 ejecuciones por valor; la variabilidad puede ser significativa.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-fun/unsloth-Qwen3-4B-Instruct-2507-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-GGUF
- Modelo base (safetensors): https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507
- Version bitsandbytes 4-bit: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit
- Drafter de decodificacion especulativa: https://huggingface.co/AtomicChat/Qwen3-4B-DFlash-GGUF
- Runtime Loom (hrx-system): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Run de validacion (DevLab Dispatch 42340394242): https://github.com/loom-fun/loom-skills/actions/runs/42340394242

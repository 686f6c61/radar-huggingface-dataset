# loom-fun-staging/unsloth-Inkling-2-Mini-loom

## Resumen

Inkling-2-Mini (UD-Q4_K_XL) para AMD Loom es un paquete de despliegue en formato `.loom` que empaqueta el checkpoint GGUF sin modificar `Inkling-2-Mini-UD-Q4_K_XL.gguf` del repositorio `unsloth/Inkling-2-Mini-GGUF`. Lo publica la organizacion `loom-fun-staging` y esta pensado para ejecutarse sobre el runtime Loom (`hrx-loom`) en hardware AMD, concretamente en un Ryzen AI Max+ 395 "Strix Halo" (gfx1151) con aceleracion ROCm. No se trata de un modelo entrenado por el autor del repo, sino de una distribucion de inferencia con programas `.loom` y una tarjeta `model.json` generada mediante el flujo de trabajo `loom-skills`.

El interes tecnico del paquete esta en la capa de ejecucion: incluye decodificacion especulativa DFlash (profundidad 3), un preset de memoria con `pool_backing=fixed` y espera activa de completaciones GPU (`completion_spin_ns=4294967295`). La model card publica cifras de rendimiento medidas en Strix Halo comparadas con llama.cpp ROCm `llamacpp-rocm/b1383`, con 55,0 tok/s de decodificacion en contexto corto y hasta 2132,7 tok/s de prefill en documentos de 8k tokens.

El estado del paquete es de staging: la promocion a produccion esta retenida porque las puertas de correccion (`consistency`, `sampling`, `compare`, `spec`, `agent`, `agent_think_off`) fallan tanto en el SDK 0.2.0 como en el 0.3.0, aunque el chat funcional y el tool calling pasan en el SDK 0.3.0. La licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete referencia un GGUF de un modelo tipo mixture-of-experts segun la metodologia de roofline, sin detalle arquitectonico en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 32k tokens medidos en las pruebas de rendimiento (contexto de servicio configurado en llama.cpp con `-c 38000`) |
| Tipos de cuantizacion | UD-Q4_K_XL (unica incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`Inkling-2-Mini-UD-Q4_K_XL.gguf`) empaquetado como programa `.loom` con tarjeta `model.json` |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base. La metodologia de roofline del paquete califica a Inkling-2-Mini como "mixture-of-experts" al calcular el techo de cuatro flujos concurrentes, asumiendo que los cuatro flujos enrutan a los mismos expertos. No se detallan numero de parametros, numero de expertos, datos de entrenamiento, numero de tokens ni si hubo RLHF o DPO.

Lo que si esta documentado es la capa de despliegue: el paquete incluye decodificacion especulativa DFlash con profundidad 3 para las filas de un solo flujo (decode corto, decode a 2k, decode a 32k y prefill), mientras que la prueba de 4 flujos se ejecuta sin drafting en ambos motores. El runtime Loom se sirve con espera activa de completaciones GPU y pool de memoria fijo, ajustes que la model card identifica como los usados en las mediciones de rendimiento.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`), con parametro `chat_template_kwargs` para activar o desactivar el modo de razonamiento (`enable_thinking`).
- Tool calling y function calling: la model card indica que el chat funcional y el tool calling pasan en el SDK 0.3.0.
- Modo de razonamiento opcional ("thinking") que puede desactivarse por peticion.
- Decodificacion especulativa integrada en el runtime (DFlash, profundidad 3) para acelerar la generacion en un solo flujo.
- Servicio concurrente multi-flujo: medido con 4 peticiones paralelas y 106,0 tok/s agregados de decodificacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de chat local en estaciones de trabajo AMD Strix Halo: el paquete se instala con `pipx install "hrx-loom[hf]==0.3.0"` y se sirve con `loom-serve`, ofreciendo una API compatible con OpenAI en `127.0.0.1:8080` sin depender de GPU NVIDIA.
- Asistentes con tool calling en entornos de desarrollo: al pasar la puerta de chat y tool calling en el SDK 0.3.0, puede integrarse en agentes que invocan funciones externas mediante el formato de la API de OpenAI.
- Procesamiento de documentos largos: el prefill medido se mantiene entre 1963,7 y 2132,7 tok/s en documentos de 8k a 32k tokens, adecuado para resumir o extraer informacion de contratos, informes o documentacion tecnica de hasta 32k tokens.
- Evaluacion comparativa de motores de inferencia: sirve como banco de pruebas reproducible para comparar Loom frente a llama.cpp ROCm con el mismo GGUF y las mismas peticiones, tal como documenta la model card.
- Despliegue con memoria predecible: el preset `--pool_backing=fixed` reserva el pool de memoria por adelantado, util en entornos donde no se tolera crecimiento elastico de memoria durante la ejecucion.
- Prototipado de decodificacion especulativa: el paquete expone DFlash con profundidad configurable en el runtime, lo que permite experimentar con aceptacion de tokens borrador en hardware AMD integrado.
- Atencion a usuarios en demo interna: con 55,0 tok/s de decodificacion en contexto corto y 51,8 tok/s a 2k, es viable para prototipos de conversacion multi-turno, no para produccion dada la retencion de promocion.

## Benchmarks y rendimiento

Rendimiento medido en AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), 228 GB/s y 44 TFLOP/s sostenidos a 85 W, frente a llama.cpp ROCm `llamacpp-rocm/b1383` con el mismo GGUF y las mismas peticiones. Valores de Loom como mediana de 1 sesion (4 flujos: mediana de 3).

| Metrica | Loom | Techo roofline | % del roofline |
|---|---|---|---|
| Decode tok/s, prompt corto | 55,0 | 98,5 | 56 % |
| Decode tok/s, contexto 2k | 51,8 | 93,8 | 55 % |
| Decode tok/s, contexto 32k | 45,0 | 78,0 | 58 % |
| Prefill tok/s, documento 1k | 1820,3 | 9583,4 | 19 % |
| Prefill tok/s, documento 2k | 2047,1 | 9283,9 | 22 % |
| Prefill tok/s, documento 8k | 2132,7 | 8991,6 | 24 % |
| Prefill tok/s, documento 16k | 2093,2 | 8642,8 | 24 % |
| Prefill tok/s, documento 32k | 1963,7 | 8020,5 | 24 % |
| 4 flujos, decode agregado tok/s | 106,0 | 379,1 | 28 % |
| Decodificacion especulativa, tokens aceptados | no medido | n/a | n/a |

La model card no incluye resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros). Las cifras de llama.cpp por fila aparecen como "no medidas" en la tabla publicada, por lo que no se puede calcular el margen relativo con los datos disponibles.

Puertas de correccion del paquete:

| Puerta | SDK 0.2.0 | SDK 0.3.0 |
|---|---|---|
| `golden` | Pass | Pass |
| `consistency` | Fail | Fail |
| `sampling` | Fail | Fail |
| `compare` | Fail | Fail |
| `spec` | Fail | Fail |
| `agent` | Fail | Fail |
| `agent_think_off` | Fail | Fail |

Las completaciones con y sin drafting coincidieron en 3 de 13 peticiones con el SDK 0.2.0 y en 3 de 13 con el SDK 0.3.0, sin casi-empates adicionales. La puerta de consistencia registro divergencias entre ejecucion concurrente y aislada en 2 prompts con cada SDK.

## Requisitos de hardware

- VRAM estimada: no disponible; el paquete esta medido en un Ryzen AI Max+ 395 con memoria unificada, no en GPU discreta.
- GPU recomendadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) es el unico hardware con mediciones publicadas. No hay datos para A100, H100 ni RTX 4090.
- GPU de consumo: no hay datos de compatibilidad con GPUs de consumo NVIDIA; el runtime es ROCm y el preset apunta a `amdgpu://`.
- Despliegue: `hrx-loom` 0.3.0 via `pipx`, con `loom-fetch` para materializar el paquete y `loom-serve` para servir la API compatible con OpenAI. El modelo base tambien esta disponible como GGUF para llama.cpp ROCm.
- Throughput: 55,0 tok/s de decode en contexto corto, 45,0 tok/s a 32k de contexto, 106,0 tok/s agregados con 4 flujos y prefill de 1963,7 a 2132,7 tok/s en documentos de 8k a 32k.
- Latencia: no publicada de forma explicita; puede derivarse del throughput de prefill para la fase de procesamiento del prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini (UD-Q4_K_XL) via Loom | no disponible | hasta 32k medidos | 55,0 tok/s decode corto; 2132,7 tok/s prefill 8k en Strix Halo | MIT | Hugging Face, paquete `.loom` |
| Inkling-2-Mini (UD-Q4_K_XL) via llama.cpp ROCm | no disponible | 38k configurado en servidor | no medido en la tabla publicada | MIT | Hugging Face, GGUF |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en el material proporcionado.

## Limitaciones y advertencias

- Estado de staging: la promocion a produccion esta retenida. Seis de las siete puertas de correccion fallan en el SDK 0.3.0, incluida la de consistencia entre ejecucion concurrente y aislada.
- La decodificacion especulativa no mostro coincidencia con la generacion sin drafting mas que en 3 de 13 peticiones, lo que sugiere divergencia en las salidas cuando se activa DFlash.
- El porcentaje de tokens borrador aceptados no se midio en este paquete, por lo que no hay evidencia de la ganancia real del drafting.
- El rendimiento esta medido en un unico hardware (Strix Halo, runner X2-LA03-S04-D03) y en una sola sesion; los propios autores advierten que los runners difieren entre sesiones.
- No hay datos de sesgos, riesgo de alucinacion ni calidad multilingue del modelo base en la informacion disponible.
- La licencia MIT del paquete aplica a los artefactos de despliegue; conviene verificar la licencia del checkpoint base `unsloth/Inkling-2-Mini-GGUF` antes de uso comercial.
- El tamano del repositorio aparece como 0.0 GB, lo que puede indicar que los pesos no estan materializados en el repo y se obtienen via `loom-fetch`.
- El uso esta acoplado al runtime Loom y a ROCm; no hay soporte documentado para vLLM, TGI, Ollama u otros motores con este paquete concreto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-fun-staging/unsloth-Inkling-2-Mini-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion DevLab de referencia: https://github.com/loom-fun/loom-skills/actions/runs/45267522252/job/138018261220

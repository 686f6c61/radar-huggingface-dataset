# loom-draft/lmstudio-community-LFM2-24B-A2B-loom

## Resumen

Este repositorio no contiene un modelo de lenguaje nuevo, sino un paquete de despliegue en formato Loom (`.loom` y `model.json`) generado a partir del checkpoint GGUF sin modificar `LFM2-24B-A2B-Q4_K_M.gguf` de `lmstudio-community/LFM2-24B-A2B-GGUF`. El autor, `loom-draft`, lo publica para ejecutar el modelo en GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). La generacion se ha hecho con `loom-next`, el generador de paquetes del ecosistema Loom de ROCm, sin intervencion de un LLM en el bucle.

El modelo subyacente es LFM2-24B-A2B, un modelo de la familia LFM2 con 24.000 millones de parametros totales y 2.000 millones activos por token (arquitectura MoE segun la nomenclatura A2B), cuantizado en Q4_K_M. El paquete expone un servidor compatible con la API de chat de OpenAI (`/v1/chat/completions`), admite 128.000 tokens de contexto por peticion y 4 peticiones concurrentes, con un maximo de 4.096 tokens de salida por preset.

Su relevancia es de infraestructura mas que de modelado: permite servir un MoE de 24B en hardware AMD de consumo y profesional sin depender de CUDA ni de llama.cpp, con verificacion de integridad por sha256 de los ficheros fuente. No obstante, en el momento de la publicacion las mediciones de rendimiento y las puertas de correctitud (`gates.sh`) figuran como "not yet re-measured", por lo que no hay evidencia publicada de paridad funcional con llama.cpp para este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) del modelo base LFM2-24B-A2B; paquete de despliegue Loom con kernels generados |
| Parametros totales | 24.000 millones (24B) |
| Parametros activos | 2.000 millones (2B) por token |
| Longitud de contexto | 128.000 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); no se documentan otras en este paquete |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint original) empaquetado como programas `.loom` + `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Version del runtime | `hrx-loom[hf]==0.2.0` |

## Arquitectura y entrenamiento

El paquete no entrena ni modifica pesos: toma el GGUF Q4_K_M publicado por `lmstudio-community` y genera, mediante `loom-next`, programas `.loom` especificos para las arquitecturas graficas gfx1151 y gfx1201. Estos programas implementan los kernels de inferencia sobre el runtime `loom-serve`, junto con un `llm_config.json` que describe la configuracion del modelo y un `tokenizer.json`. El repositorio incluye `model.json` y `model.json.lock`, este ultimo con los hashes sha256 de los ficheros fuente que `loom-fetch` verifica durante la descarga.

En cuanto al modelo subyacente, la informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos, ni si hubo etapas de RLHF o DPO. La nomenclatura LFM2-24B-A2B indica una arquitectura de mezcla de expertos con 24B totales y 2B activos, pero no se aportan mas detalles estructurales (numero de expertos, top-k de enrutamiento, atencion) en la documentacion proporcionada. Tampoco se documentan innovaciones de decodificacion: la tabla de caracteristicas marca la decodificacion especulativa como "not applicable".

El paquete incorpora opciones de servido orientadas a latencia: `completion_spin_ns=4294967295` activa espera activa de las completaciones de GPU (consume CPU mientras hay trabajo en vuelo), `--pool_backing=fixed` reserva el pool de memoria por adelantado en lugar de crecimiento elastico, y `--parameter_mode=preload` precarga los pesos en el host.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Contexto largo: hasta 128.000 tokens por peticion, adecuado para documentos extensos o historiales de conversacion amplios.
- Concurrencia de 4 peticiones simultaneas con el preset por defecto.
- Salida limitada a 4.096 tokens por respuesta (preset `max_tokens`).
- Tool calling: marcado como "not applicable" en la tabla de caracteristicas del paquete.
- Razonamiento / thinking mode: marcado como "not applicable".
- Esfuerzo de razonamiento configurable: "not applicable".
- Decodificacion especulativa: "not applicable".
- Entrada de imagen: "not determined" (no confirmado).
- Entrada y salida de audio: "not determined" (no confirmado).
- Muestreo (temperatura, top_k, semilla): "not determined" en la tabla de caracteristicas; existe una puerta de correctitud `sampling` definida pero sin medicion registrada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Servicio de chat en estaciones de trabajo AMD: desplegar un endpoint compatible con OpenAI en una Radeon AI PRO R9700 de 32 GB para prototipos de aplicaciones conversacionales, sin salir del ecosistema ROCm.
- Inferencia local en APU Strix Halo: ejecutar el modelo en un Ryzen AI Max+ 395 para asistentes de escritorio o herramientas internas donde no se quiere depender de GPU dedicada ni de servicios en la nube.
- Procesamiento de documentos largos: con 128.000 tokens de contexto por peticion, resumir o extraer informacion de contratos, informes o bases de codigo de gran extension en una sola pasada.
- Evaluacion de modelos MoE en hardware AMD: comparar el comportamiento de un MoE de 24B con 2B activos frente a alternativas densas en el mismo equipo, usando el endpoint estandar para automatizar la bateria de pruebas.
- Backend de aplicaciones internas con concurrencia moderada: 4 peticiones simultaneas cubren casos de equipos pequenos, demos y entornos de staging donde no se requiere escalado horizontal.
- Reproducibilidad y auditoria de despliegues: el `model.json.lock` con hashes sha256 permite verificar que los pesos servidos corresponden exactamente al GGUF de origen, util en entornos con requisitos de trazabilidad.
- Integracion en pipelines de CI para pruebas de regresion de inferencia: las puertas de correctitud (`golden`, `compare`, `consistency`, `logits`) estan definidas y pueden ejecutarse contra el paquete una vez medidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y que todas las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No hay datos de MMLU, HumanEval, GSM8K ni de throughput o latencia para este paquete.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 24B, y el hardware de referencia incluye una GPU de 32 GB (Radeon AI PRO R9700), lo que sugiere que el paquete esta dimensionado para esa clase de memoria.
- GPU soportadas segun la model card: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151).
- GPUs NVIDIA (A100, H100, RTX 4090): no disponibles; el paquete esta generado para arquitecturas AMD gfx1151 y gfx1201.
- Cabe en GPU de consumo: no confirmado; el unico hardware documentado es AMD profesional/integrado.
- Despliegue: runtime `hrx-loom[hf]==0.2.0` con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto; llama.cpp se usa solo como referencia de correctitud en las puertas.
- Latencia y throughput: no disponibles (sin mediciones registradas).
- Opciones de servido relevantes: `--pool_backing=fixed`, `--parameter_mode=preload`, `completion_spin_ns=4294967295`.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / runtime | Disponibilidad |
|---|---|---|---|---|---|---|
| LFM2-24B-A2B (paquete Loom, este repo) | 24B | 2B | 128.000 | MIT | GGUF empaquetado en `.loom`, runtime `loom-serve` | Publicado, sin mediciones de rendimiento |
| LFM2-24B-A2B-GGUF (lmstudio-community) | 24B | 2B | no disponible en la informacion | no disponible en la informacion | GGUF, runtime generico (llama.cpp y derivados) | Publicado; es el checkpoint de origen |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks del paquete ni de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- Ausencia de evidencia de correctitud: todas las puertas (`golden`, `compare`, `consistency`, `agent`, `sampling`, `logits`, etc.) estan sin medir; no hay prueba publicada de que la salida coincida con la referencia de llama.cpp.
- Sin mediciones de rendimiento: no hay datos de latencia ni throughput para ninguno de los dos hardwares objetivo.
- Alcance de hardware muy restringido: solo gfx1151 y gfx1201; no sirve para GPUs NVIDIA ni para otras arquitecturas AMD sin regenerar el paquete.
- Capacidades no confirmadas: tool calling, thinking mode, decodificacion especulativa y audio figuran como no aplicables o no determinados; vision, muestreo y audio como "not determined".
- Limite de salida de 4.096 tokens por respuesta y concurrencia de 4 peticiones, insuficiente para cargas de produccion de alta demanda.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; no hay model card del modelo base incluida en este repositorio.
- Licencia MIT declarada en el paquete, pero la licencia y condiciones del checkpoint de origen (`lmstudio-community/LFM2-24B-A2B-GGUF`) no se detallan aqui; conviene verificarlas antes de uso comercial.
- Repositorio sin descargas ni interacciones y creado en una unica fecha (2026-11-26), sin historial de mantenimiento.
- Los resultados de busqueda web sobre "Loom" corresponden a la herramienta de grabacion de pantalla y a una marca de ropa, sin relacion con este paquete; no aportan informacion tecnica util.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/lmstudio-community-LFM2-24B-A2B-loom
- Checkpoint de origen: https://huggingface.co/lmstudio-community/LFM2-24B-A2B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/

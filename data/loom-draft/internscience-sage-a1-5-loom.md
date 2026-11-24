# loom-draft/InternScience-Sage-A1.5-loom

## Resumen

InternScience-Sage-A1.5-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que envuelve el checkpoint GGUF sin modificar `InternScience/Sage-A1.5-Q4_K_M-GGUF`. Lo publica el usuario `loom-draft` dentro del ecosistema Loom, un runtime de inferencia orientado a GPUs AMD (ROCm) y desarrollado en el repositorio `ROCm/hrx-system`. El modelo no introduce pesos nuevos: es una capa de empaquetado, presets de memoria y comandos de servicio para ejecutar Sage-A1.5 en hardware AMD concreto, en concreto la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es Sage-A1.5, un modelo multimodal de tipo image-text-to-text (pipeline declarado en Hugging Face) distribuido originalmente en cuantizacion Q4_K_M. La ficha de Loom declara contexto nativo de 262.144 tokens y, en el preset para R9700, un limite de servicio de 138.240 tokens por peticion. El paquete incorpora decodificacion especulativa mediante MTP (multi-token prediction) y una tasa de aceptacion de tokens redactados del 46 % medida en Strix Halo.

La relevancia actual es acotada pero clara: no es un modelo nuevo, sino una via de despliegue optimizada para hardware AMD de consumo y workstation. Los datos publicados muestran mejoras de hasta +112 % en prefill y +23 % en decode frente a llama.cpp ROCm en Strix Halo, aunque con una perdida del 8 % en decode a 32k de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; detalles de arquitectura no publicados en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos; 138.240 tokens por peticion en el preset para Radeon AI PRO R9700 |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (empaquetado como programa Loom `.loom` + `model.json`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Sage-A1.5 en la documentacion proporcionada. La model card del paquete Loom no describe la arquitectura del transformer, el numero de parametros ni la composicion del dataset de entrenamiento. Lo unico verificable es que se trata de un modelo multimodal con pipeline `image-text-to-text`, que admite modo thinking opcional (desactivable via `chat_template_kwargs.enable_thinking`) y que incorpora capacidad de decodificacion especulativa mediante MTP.

El paquete Loom en si no entrena ni modifica pesos: genera presets de memoria (`--pool_backing=fixed`, `--parameter_mode=preload`), comandos `loom-fetch` y `loom-serve`, y configuraciones de dispositivo especificas por GPU. La innovacion tecnica destacable es la integracion de MTP para drafting especulativo con profundidad 3 en Loom y la espera activa de completaciones GPU (`completion_spin_ns=4294967295`), que segun el autor mejora el rendimiento a costa de consumo de CPU.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con `/v1/chat/completions`.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text).
- Modo thinking opcional, controlable por peticion con `enable_thinking`.
- Decodificacion especulativa con MTP (multi-token prediction), con profundidad de draft configurable.
- Servicio multi-stream: el benchmark reporta pruebas con 4 peticiones paralelas y decode agregado.
- Contexto largo: hasta 262.144 tokens nativos y 138.240 tokens por peticion en el preset R9700.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Despliegue de inferencia multimodal en APU Strix Halo: el paquete incluye comandos listos (`loom-fetch` + `loom-serve`) para servir Sage-A1.5 en una Ryzen AI Max+ 395, util para prototipos locales con vision y texto sin GPU dedicada.
- Servicio en Radeon AI PRO R9700: el preset `chat-r9700` dimensiona el pool de memoria para servir hasta 138.240 tokens por peticion, adecuado para cargas de documento largo con entrada de imagen.
- Procesamiento de documentos extensos con imagen: gracias al contexto nativo de 262.144 tokens, se pueden enviar informes, capturas o diagramas junto a instrucciones largas en una sola peticion.
- Benchmarking de runtimes AMD: el paquete publica comparativas reproducibles frente a llama.cpp ROCm y Vulkan, util para equipos que evaluan motores de inferencia en hardware AMD.
- Atencion al cliente con contexto acumulado: el soporte multi-turno y el contexto largo permiten mantener historiales extensos; el modo thinking opcional reduce latencia cuando no se necesita razonamiento extendido.
- Evaluacion de decodificacion especulativa: con MTP y profundidad de draft 3, sirve para medir el impacto de speculative decoding en produccion sobre GPUs AMD.
- Inferencia paralela de baja concurrencia: el benchmark de 4 streams agregados (172,2 tok/s en Loom) lo hace viable para servicios pequenos con varias sesiones simultaneas.

## Benchmarks y rendimiento

Rendimiento medido en AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), mismo GGUF, mismas prompts, mediana de 3 sesiones (6 en 4 streams):

| Metrica | llama.cpp ROCm | Loom | Margen vs mejor llama.cpp | Roofline | Loom % roofline | llama.cpp Vulkan |
|---|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 71,2 | 87,9 | +23 % | 146,8 | 60 % | 70,3 |
| Decode tok/s, contexto 2k | 69,5 | 79,7 | +15 % | 138,6 | 58 % | 63,1 |
| Decode tok/s, contexto 32k | 76,3 | 70,3 | -8 % | 150,9 | 47 % | 65,1 |
| Prefill tok/s, documento 1k | 1200,6 | 2209,4 | +84 % | 11600,2 | 19 % | 902,6 |
| Prefill tok/s, documento 2k | 1284,3 | 2472,6 | +93 % | 11416,3 | 22 % | 1000,8 |
| Prefill tok/s, documento 8k | 1291,5 | 2680,9 | +108 % | 10424,8 | 26 % | 1013,2 |
| Prefill tok/s, documento 16k | 1175,5 | 2423,4 | +106 % | 9343,0 | 26 % | 929,1 |
| Prefill tok/s, documento 32k | 993,6 | 2102,6 | +112 % | 7737,1 | 27 % | 793,5 |
| 4 streams, decode agregado tok/s | 140,4 | 172,2 | +23 % | 418,3 | 41 % | 132,6 |
| Speculative decoding, tokens aceptados | — | 46 % | — | n/a | n/a | — |

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los datos anteriores miden exclusivamente rendimiento de inferencia del runtime.

## Requisitos de hardware

- GPUs soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible de forma explicita; el preset para R9700 dimensiona el pool para 138.240 tokens por peticion y la GPU tiene 32 GB.
- Cabe en GPU de consumo: si, en APU Strix Halo (memoria unificada) y en Radeon AI PRO R9700.
- Despliegue: runtime Loom (`hrx-loom[hf]==0.2.0`), instalado con `pipx`; comandos `loom-fetch` y `loom-serve`.
- Opciones de despliegue alternativas: llama.cpp ROCm (`llamacpp-rocm/b1374`) y llama.cpp Vulkan (`llamacpp-vulkan/b12211`), usados como referencia comparativa.
- Throughput medido (Strix Halo, Loom): 87,9 tok/s decode con prompt corto, 70,3 tok/s a 32k de contexto, 2102,6-2680,9 tok/s de prefill segun tamano de documento, 172,2 tok/s agregados con 4 streams.
- Flags relevantes de servicio: `--pool_backing=fixed`, `--parameter_mode=preload`, `completion_spin_ns=4294967295` (espera activa, consume CPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (decode tok/s, Strix Halo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InternScience-Sage-A1.5-loom (Loom) | no disponible | 262.144 nativo / 138.240 por peticion en R9700 | 87,9 (corto), 70,3 (32k) | MIT | Hugging Face (paquete Loom) |
| Sage-A1.5-Q4_K_M-GGUF en llama.cpp ROCm | no disponible | 65.536 configurado en el benchmark | 71,2 (corto), 76,3 (32k) | MIT (heredada del base) | Hugging Face |
| Sage-A1.5-Q4_K_M-GGUF en llama.cpp Vulkan | no disponible | 36.864 configurado en el benchmark | 70,3 (corto), 65,1 (32k) | MIT (heredada del base) | Hugging Face |

La comparativa se limita al mismo checkpoint servido con distintos runtimes, ya que no se dispone de datos de modelos alternativos de tamano o tarea equivalente en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete no aporta pesos nuevos: cualquier limitacion de calidad, sesgo o alucinacion del modelo Sage-A1.5 subyacente se hereda sin cambios.
- No hay datos publicados sobre sesgos, tasas de alucinacion ni evaluaciones de calidad en la informacion disponible.
- Idiomas soportados no declarados; no se puede garantizar cobertura multilingue.
- El rendimiento depende fuertemente del hardware: las cifras solo estan medidas en Strix Halo y R9700; en otras GPUs el comportamiento puede diferir.
- El decode a 32k de contexto es un 8 % mas lento que llama.cpp ROCm, por lo que cargas de contexto largo pueden no beneficiarse del cambio de runtime.
- La espera activa (`completion_spin_ns=4294967295`) consume CPU de forma continua mientras hay trabajo en GPU; en entornos con CPU limitada puede degradar el resto de cargas.
- El preset para R9700 limita el servicio a 138.240 tokens por peticion pese al contexto nativo de 262.144.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB; conviene verificar la integridad de los artefactos antes de usarlo en produccion.
- Licencia MIT declarada, permisiva para uso comercial, pero sujeta a las condiciones del modelo base.
- La comparativa con llama.cpp no se re-midio en el mismo job para este paquete; el autor lo advierte explicitamente.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/InternScience-Sage-A1.5-loom
- Modelo base GGUF: https://huggingface.co/InternScience/Sage-A1.5-Q4_K_M-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Workflow loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Run de benchmark llama.cpp: https://github.com/loom-fun/loom-skills/actions/runs/43376548212/job/131724300401
- Run de benchmark Loom: https://github.com/loom-fun/loom-skills/actions/runs/44088653570/job/134057765597

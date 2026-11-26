# loom-draft/PrunaAI-Phi-3-mini-128k-instruct-GGUF-Imatrix-smashed-loom

## Resumen

Este repositorio no contiene un modelo de lenguaje nuevo, sino un paquete de despliegue en formato Loom (`.loom` y `model.json`) generado a partir del checkpoint GGUF `Phi-3-mini-128k-instruct.Q4_K_M.gguf` de PrunaAI. El modelo subyacente es Phi-3-mini-128k-instruct de Microsoft, un transformer denso de 3.800 millones de parametros con 128.000 tokens de contexto, cuantizado en Q4_K_M con calibracion imatrix. El autor del paquete es `loom-draft`, que lo publica como objetivo de despliegue para las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

La relevancia de esta ficha es acotada: el interes no esta en el modelo (ampliamente conocido desde 2024) sino en el formato de empaquetado y en el runtime `loom-serve`, que expone una API compatible con OpenAI (`/v1/chat/completions`) sobre ROCm/HIP. El paquete incluye kernels generados por `loom-next` sin intervencion de un LLM en el bucle, y declara soporte de 131.072 tokens de contexto por peticion, 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por preset.

Conviene subrayar que el propio autor indica que las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, etc.) no se han vuelto a medir para este paquete, por lo que no hay evidencia publicada de paridad funcional con llama.cpp en esta configuracion concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-3-mini), decodificador causal |
| Parametros totales | 3.800 millones (modelo base Phi-3-mini-128k-instruct) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M con imatrix (unico peso incluido en el paquete) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | MIT |
| Formato de pesos | GGUF (`Phi-3-mini-128k-instruct.Q4_K_M.gguf`) empaquetado como `.loom` + `model.json` |
| Modelo base | PrunaAI/Phi-3-mini-128k-instruct-GGUF-Imatrix-smashed |
| Runtime | `loom-serve` (`hrx-loom[hf]==0.2.0`), backend AMDGPU/ROCm |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |

## Arquitectura y entrenamiento

El modelo subyacente es Phi-3-mini-128k-instruct, un transformer denso de 3.800 millones de parametros entrenado por Microsoft sobre datasets sinteticos y filtrados de alta calidad, con un post-entrenamiento orientado a instrucciones y seguridad (SFT y optimizacion por preferencias). La variante de 128k extiende la ventana de contexto mediante ajuste posicional sobre la base de 4k. Sobre ese checkpoint, PrunaAI aplico cuantizacion Q4_K_M calibrada con imatrix, que ajusta los factores de escala por tensor usando estadisticas de activacion, reduciendo la perdida de calidad frente a una cuantizacion K-quants sin calibracion.

La contribucion propia de este repositorio es el empaquetado Loom: `loom-next` genera programas `.loom` (kernels) especificos para gfx1151 y gfx1201, junto con un `model.json` que fija los ficheros fuente con verificacion sha256. No hay reentrenamiento, fine-tuning ni modificacion de pesos; el checkpoint GGUF se distribuye sin alteraciones. El autor declara que la generacion se hizo solo con el generador, sin LLM en el bucle, y que las puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) aun no se han vuelto a medir para esta build.

## Capacidades

- Generacion de texto conversacional multi-turno con instrucciones en lenguaje natural.
- Razonamiento basico y respuesta a preguntas; el modelo base esta orientado a tareas de instruccion de complejidad media.
- Generacion de codigo y matematicas a nivel de modelo pequeno (Phi-3-mini), adecuado para tareas acotadas, no para repositorios completos.
- Ventana de contexto larga: 131.072 tokens por peticion, util para documentos extensos y conversaciones con historial amplio.
- Servidor HTTP con API compatible con OpenAI (`/v1/chat/completions`), lo que permite sustituir backends existentes sin cambiar el cliente.
- Concurrencia de 4 peticiones simultaneas declarada por el preset.
- Tool calling: no aplicable segun la tabla de features del autor.
- Modo de razonamiento o thinking: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen: no determinada.
- Entrada o salida de audio: no determinada.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU AMD: el paquete esta pensado para ejecutarse en Strix Halo o Radeon AI PRO R9700 mediante `loom-serve`, lo que permite tener un endpoint compatible con OpenAI en hardware AMD sin depender de CUDA.
- Procesamiento de documentos largos en local: con 131.072 tokens de contexto, se pueden pasar contratos, informes o transcripciones extensas en una sola peticion para tareas de resumen y extraccion, siempre que se acepte la calidad de un modelo de 3.800 millones en Q4_K_M.
- Prototipado de aplicaciones con API OpenAI: al exponer `/v1/chat/completions`, se puede apuntar un cliente existente a `http://127.0.0.1:8080` y validar flujos conversacionales sin coste de API externa.
- Asistente de codigo ligero en entornos con requisitos de privacidad: al ejecutarse en local y con licencia MIT, encaja en escenarios donde el codigo no puede salir de la maquina, para autocompletado y explicacion de fragmentos.
- Banquito de pruebas para el runtime Loom: util para evaluar el rendimiento y la correccion de `loom-serve` frente a llama.cpp sobre el mismo GGUF, ya que el paquete incluye las puertas de comparacion (`golden`, `compare`, `logits`).
- Educacion y experimentacion con cuantizacion: permite comparar la salida de Q4_K_M con imatrix frente al modelo original en tareas de generacion, midiendo divergencias token a token con la puerta `compare`.
- Chatbot de atencion al cliente de baja concurrencia: con 4 peticiones concurrentes y 4.096 tokens de salida, sirve para demos internas o entornos de pequeno volumen, no para produccion de alta carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y que todas las puertas de correccion aparecen como "not yet re-measured". No se dispone de cifras de MMLU, HumanEval, GSM8K, throughput ni latencia para esta build concreta.

## Requisitos de hardware

- VRAM estimada: el peso Q4_K_M de un modelo de 3.800 millones ocupa aproximadamente 2,2-2,4 GB; con overhead de contexto KV para 131.072 tokens la huella crece de forma sustancial y depende del preset de `loom-serve` (no publicado en la informacion disponible).
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU de consumo: no confirmada; el paquete esta generado para arquitecturas AMD especificas y no se menciona soporte para RTX 4090, A100 ni H100.
- Backend: ROCm/HIP a traves de `hrx-loom[hf]==0.2.0`; no se menciona soporte de CUDA, Metal ni CPU.
- Opciones de despliegue: `loom-serve` con `--device=amdgpu://`, `--pool_backing=fixed` y `--parameter_mode=preload`; no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles; el autor remite a mediciones pendientes de volver a medir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Phi-3-mini-128k-instruct (este paquete, Q4_K_M imatrix) | 3,8 B | 131.072 | MIT | GGUF + Loom, `loom-serve` (AMD) | Paquete especifico para gfx1151 y gfx1201; benchmarks no remedidos |
| Phi-3-mini-128k-instruct (GGUF original de PrunaAI) | 3,8 B | 131.072 | MIT | GGUF, llama.cpp | Referencia usada por las puertas `golden` y `compare` |
| Phi-3-mini-4k-instruct | 3,8 B | 4.096 | MIT | safetensors, GGUF | Variante de contexto corto del mismo modelo base |
| Llama 3.2 3B Instruct | 3,2 B | 131.072 | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamano similar con contexto largo; licencia no MIT |

La comparacion se limita a caracteristicas estructurales: no hay datos de rendimiento publicados para este paquete que permitan contrastar calidad frente a las alternativas.

## Limitaciones y advertencias

- Ausencia de evidencia de correccion: todas las puertas (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) figuran como no remedidas, por lo que no hay garantia publicada de paridad con llama.cpp en esta build.
- Rendimiento desconocido: no hay cifras de latencia ni throughput; no se puede estimar coste operativo a partir de la informacion disponible.
- Ambito de hardware muy restringido: el paquete esta generado para gfx1151 y gfx1201; no se declara compatibilidad con otras GPU AMD, NVIDIA ni CPU.
- Capacidades no determinadas: entrada de imagen, audio y muestreo aparecen como "not determined"; tool calling, thinking y decodificacion especulativa como "not applicable".
- Calidad del modelo base: Phi-3-mini es un modelo de 3.800 millones; es propenso a errores en razonamiento complejo, matematicas avanzadas y generacion de codigo extensa, y puede alucinar hechos con seguridad aparente.
- Cuantizacion Q4_K_M: introduce perdida adicional respecto al modelo en BF16, especialmente en tareas sensibles a precision numerica.
- Idiomas: no se especifican los idiomas soportados en la informacion proporcionada; el modelo base esta optimizado principalmente para ingles, con soporte limitado de otras lenguas.
- Licencia: el paquete declara MIT, pero el uso comercial debe verificarse tambien contra los terminos del modelo base Phi-3-mini de Microsoft y del checkpoint de PrunaAI.
- Concurrencia baja: 4 peticiones simultaneas y 4.096 tokens de salida maxima por preset limitan su uso en produccion de alto volumen.
- Fecha de publicacion futura en los metadatos (2026-11-26): conviene tratar las marcas temporales del repositorio con cautela.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/PrunaAI-Phi-3-mini-128k-instruct-GGUF-Imatrix-smashed-loom
- Modelo base (PrunaAI): https://huggingface.co/PrunaAI/Phi-3-mini-128k-instruct-GGUF-Imatrix-smashed
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/

Nota: los resultados de busqueda web devueltos corresponden a Loom (herramienta de grabacion de pantalla), Loom (marca de ropa) y al articulo de Wikipedia sobre el telar, y no guardan relacion con este paquete de modelos; se han descartado por no ser relevantes.

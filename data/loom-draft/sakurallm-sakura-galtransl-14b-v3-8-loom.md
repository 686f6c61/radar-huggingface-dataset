# loom-draft/SakuraLLM-Sakura-GalTransl-14B-v3.8-loom

## Resumen

SakuraLLM-Sakura-GalTransl-14B-v3.8-loom es un paquete de despliegue en formato Loom para el punto de control GGUF `Sakura-Galtransl-14B-v3.8-Q4_K_M.gguf`, derivado del modelo base SakuraLLM/Sakura-GalTransl-14B-v3.8. Lo publica el usuario loom-draft y no modifica los pesos: su aportacion consiste en programas `.loom` generados con la herramienta `loom-next` y una tarjeta `model.json`, pensados para ejecutar el modelo sobre GPUs AMD concretas (Ryzen AI Max+ 395 "Strix Halo" con gfx1151 y Radeon AI PRO R9700 con gfx1201, 32 GB).

El modelo subyacente es un transformer de 14B de parametros especializado en traduccion, en su variante Sakura-GalTransl, que la comunidad SakuraLLM orienta a la traduccion de japones a chino e ingles en contextos de videojuegos y novelas ligeras. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), admite peticiones con hasta 131.072 tokens de contexto, 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por defecto.

Su relevancia es de nicho: no compite en rendimiento bruto con los modelos generalistas actuales, sino que resuelve el problema de ejecutar un modelo de traduccion de 14B cuantizado en Q4_K_M sobre hardware AMD consumer y profesional sin depender del stack CUDA. La licencia MIT del paquete facilita su integracion, aunque el modelo base arrastra sus propias condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Sakura-GalTransl-14B-v3.8); el paquete Loom genera kernels y programas de ejecucion |
| Parametros totales | 14B (segun el nombre del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF de origen) |
| Idiomas soportados | no disponible en la informacion proporcionada; el modelo base Sakura-GalTransl esta orientado a traduccion japones-chino/ingles |
| Licencia | MIT (paquete Loom); condiciones del modelo base no detalladas |
| Formato de pesos | GGUF de origen, empaquetado en programas `.loom` y `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

El paquete no entrena ningun modelo: reutiliza el GGUF `Sakura-Galtransl-14B-v3.8-Q4_K_M.gguf` sin modificarlo y genera, mediante `loom-next` (sin LLM en el bucle), los programas `.loom` y los kernels necesarios para ejecutarlo sobre el runtime Loom para AMD. La arquitectura del modelo subyacente es un transformer decoder-only de 14B de parametros, segun la nomenclatura del modelo base; la informacion disponible no detalla el numero de capas, dimensiones ocultas ni el esquema de atencion.

Tampoco se especifican en la informacion proporcionada los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO). La model card del paquete se limita a declarar el empaquetado, los comandos de despliegue y el estado de las pruebas de correccion, que en el momento de la publicacion figuran como "not yet re-measured" en todas las puertas (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`).

## Capacidades

- Generacion de texto conversacional a traves de una API compatible con OpenAI (`/v1/chat/completions`).
- Traduccion: el modelo base Sakura-GalTransl esta especializado en traduccion de japones a chino e ingles, orientado a videojuegos y narrativa.
- Contexto largo: hasta 131.072 tokens por peticion, adecuado para documentos extensos o guiones completos.
- Concurrencia de 4 peticiones simultaneas.
- Tool calling: no aplicable segun la model card.
- Razonamiento / thinking mode: no aplicable segun la model card.
- Decodificacion especulativa: no aplicable segun la model card.
- Entrada de imagen: no determinada.
- Entrada/salida de audio: no determinada.
- Muestreo (temperature, top_k, seed): no determinado en la informacion disponible.

## Casos de uso

- Traduccion de videojuegos japoneses: el modelo base Sakura-GalTransl esta ajustado para traducir dialogos y textos de juegos del japones al chino o al ingles; el contexto de 131.072 tokens permite procesar archivos de dialogo completos sin truncar y mantener coherencia terminologica entre escenas.
- Localizacion de novelas ligeras y visual novels: con 4.096 tokens de salida por peticion y contexto largo, se pueden traducir capitulos enteros manteniendo referencias a personajes y arcos narrativos anteriores.
- Servicio de traduccion autoalojado en hardware AMD: el paquete esta pensado para ejecutarse en Strix Halo o Radeon AI PRO R9700 mediante `loom-serve`, lo que permite desplegar un endpoint compatible con OpenAI en una estacion de trabajo AMD sin GPU NVIDIA.
- Procesamiento por lotes de documentacion japonesa: la API HTTP y la concurrencia de 4 peticiones permiten integrar el modelo en un pipeline que traduzca lotes de documentos tecnicos o subtitulos.
- Prototipado de asistentes conversacionales multilingues: al exponer `/v1/chat/completions`, encaja en frameworks que ya consumen la API de OpenAI, sustituyendo el endpoint por el servidor local.
- Evaluacion de la cadena de herramientas Loom: el paquete sirve como caso de prueba para validar la generacion de kernels y la fidelidad frente a llama.cpp (puertas `golden`, `compare`, `logits`) en GPUs AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para este paquete "are not yet re-measured" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que todas las puertas de correccion figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: el paquete se distribuye en Q4_K_M; para un modelo de 14B en esa cuantizacion el peso ronda los 8-9 GB, aunque la informacion proporcionada no confirma la cifra exacta ni el consumo del runtime Loom.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM).
- GPU consumer: no se confirma compatibilidad con GPUs consumer AMD distintas de las dos anteriores; no hay datos para NVIDIA.
- Despliegue: `hrx-loom[hf]==0.2.0` (pipx), `loom-fetch` para descargar el paquete con verificacion sha256 y `loom-serve` para servir la API. Opciones recomendadas en la model card: `--pool_backing=fixed` y `--parameter_mode=preload`; `completion_spin_ns=4294967295` activa espera activa de finalizaciones de GPU.
- Latencia y throughput: no disponibles; las mediciones no se han vuelto a realizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SakuraLLM-Sakura-GalTransl-14B-v3.8-loom | 14B | 131.072 tokens | MIT (paquete) | Hugging Face (0 descargas) | Paquete Loom para GPUs AMD; sin mediciones publicadas |
| SakuraLLM/Sakura-GalTransl-14B-v3.8 | 14B | no disponible | no disponible | Hugging Face (modelo base) | Punto de control original; ejecutable con llama.cpp y otros runtimes GGUF |
| Otros modelos de traduccion japones-chino de ~14B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo especializado en traduccion: no es un modelo generalista; su uso para razonamiento, codigo o matematicas no esta respaldado por la informacion disponible.
- Sin benchmarks ni pruebas de correccion publicadas: todas las puertas de la model card figuran como "not yet re-measured", por lo que no hay evidencia registrada de fidelidad frente a llama.cpp.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan mitigaciones especificas en la informacion disponible.
- Idiomas: la lista de idiomas soportados no esta disponible; el modelo base esta orientado a japones, chino e ingles, por lo que el rendimiento en castellano es incierto.
- Licencia: el paquete es MIT, pero las condiciones del modelo base Sakura-GalTransl-14B-v3.8 no se detallan en la informacion proporcionada; conviene verificar la licencia del punto de control original antes de un uso comercial.
- Hardware restringido: el paquete esta generado para gfx1151 y gfx1201; no hay garantia de funcionamiento en otras GPUs AMD ni en NVIDIA.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, publicado el 2026-11-26; se trata de un artefacto reciente y sin validacion de la comunidad.
- Tool calling, thinking mode y decodificacion especulativa no estan soportados segun la model card.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/SakuraLLM-Sakura-GalTransl-14B-v3.8-loom
- Modelo base: https://huggingface.co/SakuraLLM/Sakura-GalTransl-14B-v3.8
- Generador loom-next: https://github.com/loom-fun/loom-next
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/

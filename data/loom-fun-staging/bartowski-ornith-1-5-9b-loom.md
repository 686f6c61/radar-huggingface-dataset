# loom-fun-staging/bartowski-Ornith-1.5-9B-loom

## Resumen

Ornith-1.5-9B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `bartowski/Ornith-1.5-9B-GGUF`, concretamente la cuantizacion `Ornith-1.5-9B-Q4_K_M.gguf`. Lo publica la organizacion `loom-fun-staging` y esta orientado a su ejecucion en las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB), empleando el flujo de trabajo `loom-skills` del ecosistema Loom.

El modelo subyacente es un modelo multimodal de 9.000 millones de parametros (etiqueta 9B) con capacidad de entrada de imagen (`image-text-to-text`), razonamiento con modo thinking activado por defecto, tool calling al estilo OpenAI y una ventana de contexto de 262.144 tokens por peticion. El paquete anade decodificacion especulativa DFlash de profundidad 3 con un drafter dedicado (`abenzerps/Ornith-1.5-9B-DFlash-GGUF`) y un proyector de vision (`mmproj-Ornith-1.5-9B-f16.gguf`).

Su relevancia es practica: demuestra la ejecucion de un modelo de 9B con contexto de 256k y vision sobre hardware AMD consumer y profesional (Strix Halo y R9700) mediante un servidor compatible con la API de OpenAI (`/v1/chat/completions`), con cifras de roofline teoricas publicadas y soporte para 4 peticiones concurrentes. La licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Ornith-1.5-9B; el paquete es un artefacto de despliegue Loom sobre GGUF) |
| Parametros totales | 9B (segun denominacion del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en f16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`Ornith-1.5-9B-Q4_K_M.gguf`) + paquete Loom (`.loom` y `model.json`) |
| Pipeline | image-text-to-text (vision + texto) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| Decodificacion especulativa | DFlash, profundidad 3, activada por defecto |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Memoria configurada en el ejemplo | 32.000.000.000 bytes (`--memory_bytes`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Ornith-1.5-9B (tipo de transformer, atencion, composicion del dataset, numero de tokens de entrenamiento ni si hubo RLHF/DPO). Lo que si se documenta es la capa de despliegue: Loom genera kernels especificos para las GPU AMD objetivo y sirve el GGUF Q4_K_M sin modificar el checkpoint. El paquete incorpora un proyector multimodal separado (`mmproj-Ornith-1.5-9B-f16.gguf`) para la entrada de imagenes, lo que confirma una arquitectura multimodal con encoder visual y proyector hacia el espacio del modelo de lenguaje.

La innovacion tecnica destacable es la decodificacion especulativa DFlash de profundidad 3, activada por defecto, con un modelo drafter independiente en GGUF. La model card reporta tasas de aceptacion de tokens redactados del 41 % en decodificacion de contexto corto, 39 % tras unos 2k tokens de contexto y 33 % tras unos 32k tokens. Tambien se documenta un modo de razonamiento ("thinking") activado por defecto y desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto y desactivable por peticion.
- Entrada de imagenes mediante partes `image_url` al estilo OpenAI, con proyector `mmproj-Ornith-1.5-9B-f16.gguf`.
- Tool calling / function calling con esquema OpenAI (`tools` y `tool_calls`).
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`) en `127.0.0.1:8080`.
- Contexto largo: hasta 262.144 tokens por peticion.
- Decodificacion especulativa DFlash (profundidad 3) para acelerar la generacion.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Concurrencia de 4 peticiones simultaneas.
- Soporte multilingue: no disponible en la informacion proporcionada.
- Audio de entrada/salida: no soportado (marcado como no aplicable).
- Ajuste de esfuerzo de razonamiento (reasoning effort): no aplicable.

## Casos de uso

- Analisis de documentos largos con imagenes: el modelo admite hasta 262.144 tokens por peticion, por lo que puede procesar informes extensos, contratos o manuales tecnicos junto con capturas o diagramas en una sola llamada, sin trocear el contexto.
- Asistentes con tool calling sobre API OpenAI: al exponer `tools` y `tool_calls` en formato OpenAI, se integra en orquestadores de agentes existentes (LangChain, LlamaIndex, SDK de OpenAI) sin adaptadores propios, ejecutando funciones externas como consultas a bases de datos o busquedas.
- Despliegue en estaciones de trabajo AMD: el paquete esta pensado para Strix Halo y Radeon AI PRO R9700, de modo que equipos con esas GPU pueden servir el modelo en local con `loom-serve` y atender peticiones compatibles con OpenAI sin depender de la nube.
- Procesamiento por lotes de documentos escaneados: con entrada de imagen y contexto largo, se pueden extraer campos estructurados de facturas, formularios o tickets en pipelines internos, usando el modo thinking desactivado para reducir latencia cuando la tarea es de extraccion simple.
- Razonamiento multi-paso con trazas: el modo thinking por defecto resulta adecuado para tareas de analisis que requieren descomposicion (diagnostico de errores, planificacion), y puede desactivarse en produccion cuando prima el coste por token.
- Evaluacion comparativa de motores de inferencia: al incluir puertas de correccion (`golden`, `compare`, `vision`, `consistency`) frente a referencias de llama.cpp, sirve como banco de pruebas para validar kernels ROCm y la paridad numerica de un motor alternativo.
- Atencion a usuarios con contexto conversacional largo: la ventana de 256k permite mantener historiales extensos o bases de conocimiento inyectadas en el prompt sin recuperacion externa, con 4 peticiones concurrentes por instancia.

## Benchmarks y rendimiento

La model card publica cifras de roofline (techo teorico del hardware) para Strix Halo (gfx1151) a 216 GB/s y 59 TFLOP/s. Las columnas de llama.cpp y Loom aparecen como "no medidas" en la informacion disponible, por lo que solo se recogen los limites de roofline.

| Metrica (Strix Halo, gfx1151) | llama.cpp | Loom | Roofline |
|---|---|---|---|
| Decode tok/s, prompt corto | no medido | no medido | 90,4 |
| Decode tok/s, contexto 2k | no medido | no medido | 87,0 |
| Decode tok/s, contexto 32k | no medido | no medido | 67,8 |
| Prefill tok/s, documento 1k | no medido | no medido | 4243,3 |
| Prefill tok/s, documento 2k | no medido | no medido | 4223,4 |
| Prefill tok/s, documento 8k | no medido | no medido | 4107,8 |
| Prefill tok/s, documento 16k | no medido | no medido | 3963,1 |
| Prefill tok/s, documento 32k | no medido | no medido | 3702,4 |
| 4 streams, decode agregado tok/s | no medido | no medido | 159,8 |
| Tokens redactados aceptados (especulativa) | n/a | n/a | n/a |

Tasa de aceptacion del drafter medida en la sesion: 41 % (decode corto), 39 % (2k) y 33 % (32k). En Radeon AI PRO R9700 (gfx1201) los resultados "no se han vuelto a medir" segun la model card. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el ejemplo de servicio configura `--memory_bytes=32000000000` (32 GB), coherente con un GGUF Q4_K_M de 9B mas proyector de vision f16, drafter y margen de contexto.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se documenta soporte para otras GPU.
- GPU consumer: no se confirma compatibilidad con GPU consumer NVIDIA o AMD de gama domestica; el paquete esta generado especificamente para los dos aceleradores AMD citados.
- Despliegue: `loom-serve` del paquete `hrx-loom[hf]==0.1.0`, con descarga via `loom-fetch` y materializacion del modelo. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete concreto (llama.cpp aparece solo como referencia de comparacion).
- Latencia y throughput: no hay cifras medidas de Loom ni de llama.cpp en esta publicacion; solo techos de roofline (90,4 tok/s decode en contexto corto, 159,8 tok/s agregados con 4 streams en Strix Halo).
- Contexto maximo por peticion: 262.144 tokens; salida maxima 4.096 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B (paquete Loom) | 9B | 262.144 | Si | MIT | Paquete de despliegue para Strix Halo y R9700; decodificacion especulativa DFlash |
| bartowski/Ornith-1.5-9B-GGUF | 9B | no disponible | Si (proyector separado) | MIT (heredada) | Checkpoint GGUF de origen, sin paquete Loom |
| Alternativas de 9B con contexto largo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento del modelo frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.); no es posible evaluar su rendimiento relativo con datos objetivos.
- Las cifras de rendimiento de la model card son techos de roofline, no mediciones de Loom ni de llama.cpp; las columnas de comparacion aparecen sin medir.
- Las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`) no se han vuelto a ejecutar sobre este paquete; la ultima pasada corresponde a una build anterior (sha256 `95bd4a5`). La paridad con llama.cpp no esta verificada en esta version.
- En Radeon AI PRO R9700 los resultados "no se han vuelto a medir"; el rendimiento en ese acelerador no esta validado.
- La salida maxima esta limitada a 4.096 tokens por peticion, lo que restringe tareas de generacion muy larga.
- Solo 4 peticiones concurrentes por instancia; no apto para cargas de alta concurrencia sin escalado horizontal.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben evaluarse antes de uso en produccion.
- El paquete esta ligado a hardware AMD especifico (Strix Halo y R9700) y al runtime Loom (`hrx-loom==0.1.0`); no es portable a otros backends sin conversion.
- Licencia MIT declarada, lo que permite uso comercial, pero conviene verificar la licencia del modelo base y del drafter de terceros (`abenzerps/Ornith-1.5-9B-DFlash-GGUF`) antes de distribuir.
- Repositorio de staging (`loom-fun-staging`) con 0 descargas y 0 likes; sin evidencia de uso en produccion.

## Enlaces

- Hugging Face (paquete Loom): https://huggingface.co/loom-fun-staging/bartowski-Ornith-1.5-9B-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Ornith-1.5-9B-GGUF
- Drafter DFlash: https://huggingface.co/abenzerps/Ornith-1.5-9B-DFlash-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/

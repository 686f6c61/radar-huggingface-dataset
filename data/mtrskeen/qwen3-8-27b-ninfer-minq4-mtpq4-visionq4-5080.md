# mtrskeen/qwen3.8-27b-ninfer-minq4-mtpq4-visionq4-5080

## Resumen

Este repositorio no contiene un modelo nuevo, sino un artefacto cuantizado del modelo multimodal Qwen/Qwen3.8-27B en formato propietario NInfer (`.ninfer`, versión de contenedor 2), preparado por el usuario mtrskeen para ejecutarse en una única GPU RTX 5080 de 16 GB con arquitectura Blackwell (`sm_120a`). El artefacto, de 15.514.935.296 bytes (14,45 GiB), aplica una recuantización agresiva: cuerpo de texto en min-Q4, embedding de tokens en Q6, y cabeza de predicción multi-token (MTP) y torre de visión en `Q4G64_F16S`.

El problema que resuelve es el de servir un modelo multimodal de 27.000 millones de parámetros con una ventana de contexto de hasta 124.928 tokens en una GPU de consumo de 16 GB, algo que no es viable con los formatos habituales (safetensors, GGUF o MLX) en ese presupuesto de VRAM. Para ello el artefacto se apoya en decodificación especulativa MTP con tres tokens de borrador, caché KV cuantizada a i4 y un perfil de prefill por bloques de 256 tokens.

Es relevante ahora porque documenta un perfil de despliegue medido y validado (no teórico) sobre hardware de consumo, con cifras concretas de TTFT, throughput de prefill y decodificación, y con puertas de calidad declaradas (PPL simulado +0,04 frente al ancla IQ3_XXS). Sus limitaciones principales son la dependencia exclusiva del runtime NInfer y una ventana de visión recortada a 32.768 tokens fusionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no especificada en detalle en la informacion disponible; modelo multimodal image-text-to-text con torre de vision y cabeza de prediccion multi-token (MTP); el artefacto menciona modulos "GDN/attention" en el cuerpo de texto |
| Parametros totales | 27.000 millones (segun la denominacion del modelo base Qwen/Qwen3.8-27B; no se publica recuento exacto) |
| Parametros activos | no disponible (no se indica si el modelo base es MoE) |
| Longitud de contexto | 124.928 tokens probados en texto con MTP3; hasta 131.072 con MTP0; 32.768 tokens fusionados en modo vision |
| Tipos de cuantizacion | cuerpo de texto min-Q4 (Q4 en MLP, entradas de GDN/atencion, salidas `linear_add` y cabeza de salida); embedding de tokens en Q6; cabeza MTP y torre de vision en Q4G64_F16S; cache KV en i4 (`--kv-dtype i4`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | contenedor propietario NInfer `.ninfer` (version 2, `NINFER\0\x02`); no es safetensors, GGUF ni MLX |
| Tamano del artefacto | 15.514.935.296 bytes (14,45 GiB) |
| SHA-256 | c7eb6fdde74bfd70e168a9ccce113b08fb34ad7ce3349ea989590c4830591fb8 |
| Objetos almacenados | 1.115 tensores mas 7 recursos (segun el informe de carga del servidor) |
| Alineacion | tensores alineados a 256 bytes; carga util alineada a 4096 bytes |
| Hardware objetivo | NVIDIA RTX 5080 16 GB, `sm_120a` (Blackwell) |
| Fecha de publicacion | 18 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base Qwen/Qwen3.8-27B dentro de la informacion proporcionada: no se detallan el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. Lo que si describe la model card es el proceso de recuantizacion aplicado sobre ese modelo base. El cuerpo de texto usa una disposicion "minimal all-Q4": las matrices de las capas MLP y las entradas de los modulos GDN/atencion se empaquetan mediante kernels fusionados Q4/Q4, las salidas se calculan con `linear_add` en Q4 y la cabeza de salida tambien es Q4; el embedding de tokens se conserva en Q6. El autor declara una puerta de calidad basada en perplejidad simulada de +0,04 respecto al ancla IQ3_XXS.

El artefacto incorpora dos componentes adicionales. Por un lado, una cabeza de borrador MTP cuyas matrices se recuantizan a `Q4G64_F16S` y que habilita decodificacion especulativa con `--draft-tokens 3`. Por otro, una torre de vision tambien en `Q4G64_F16S`, con buffers asignados de forma perezosa (lazy), lo que permite que el modo texto no reserve memoria de vision. Como innovaciones operativas destacan el prefill por bloques (`--prefill-chunk 256`), la ejecucion con `--no-cuda-graph` y la posibilidad de fijar el techo de contexto igual a la capacidad de cache KV (`--max-context 124928 --kv-capacity 124928`).

## Capacidades

- Generacion de texto conversacional en modo multimodal image-text-to-text (pipeline declarado en HuggingFace).
- Procesamiento de imagenes mediante torre de vision integrada, con un envelope maximo de 32.768 tokens fusionados.
- Contexto largo en texto: recuperacion tipo needle-in-a-haystack correcta (3/3) a 8K, 32K y 64K tokens segun RULER NIAH, con contexto probado hasta 124.928 tokens.
- Razonamiento matematico con cadena de pensamiento: 0,96 en `gsm8k_cot` (8-shot, 50 muestras, lm-evaluation-harness).
- Generacion de codigo y traduccion: los benchmarks de decodificacion del autor miden explicitamente cargas de trabajo de codigo y traduccion, con 117-133 tok/s.
- Salida estructurada: el mejor rendimiento de decodificacion (unos 144 tok/s, 97 % de aceptacion del borrador MTP, 3,90 tokens por ronda) se obtiene en salidas estructuradas.
- Decodificacion especulativa mediante cabeza MTP, configurable con tres tokens de borrador.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; solo se constata el uso del modelo en tareas de traduccion durante las pruebas de rendimiento, sin datos de calidad por idioma.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo local sobre repositorios medianos: con 124.928 tokens de contexto se puede cargar un arbol de codigo amplio y mantenerlo en una sola GPU de 16 GB, usando el perfil `--prefill-chunk 256` para digerir prompts de mas de 100.000 tokens en torno a 88-121 segundos.
- Analisis de documentacion tecnica extensa y RAG de contexto largo: la recuperacion NIAH 3/3 a 64K respalda la localizacion fiable de fragmentos en manuales, normativas o informes, siempre que los prompts no superen el techo seguro de 124.928 tokens.
- Extraccion estructurada a gran escala: el escenario donde el artefacto rinde mejor (unos 144 tok/s con 97 % de aceptacion MTP) es la generacion de JSON, SQL o registros normalizados, adecuada para pipelines de enriquecimiento de datos por lotes.
- Traduccion y postedicion automatica: el perfil de decodificacion para tareas de traduccion se situa en 117-133 tok/s, suficiente para procesar volumenes medios de texto en un equipo de sobremesa.
- Tutorizacion y resolucion de problemas matematicos paso a paso: el 0,96 en `gsm8k_cot` con 8 ejemplos indica una cadena de razonamiento util para explicar procedimientos, no solo para dar la respuesta final.
- Analisis de capturas, diagramas o documentos escaneados: en modo vision el modelo procesa hasta 32.768 tokens fusionados, apropiado para inspeccionar figuras tecnicas o pantallazos dentro de un flujo conversacional.
- Despliegue en entornos aislados o con datos sensibles: al ejecutarse integramente en una RTX 5080 local mediante `ninfer-serve`, permite trabajar sin enviar informacion a servicios externos.
- Prototipado e investigacion en una unica GPU de consumo: sirve como banco de pruebas para medir el impacto de cuantizaciones min-Q4, Q6 y `Q4G64_F16S` sobre calidad y latencia en arquitecturas Blackwell.

## Benchmarks y rendimiento

Rendimiento de prefill medido con `--prefill-chunk 256` en RTX 5080 16 GB:

| Tokens de prompt | Prefill (tok/s) | TTFT | VRAM pico |
|---:|---:|---:|---:|
| 32.714 | 1.500 | 22 s | 15.858 MiB |
| 97.873 | 1.116 | 88 s | 15.858 MiB |
| 122.861 | 1.017 | 121 s | 15.858 MiB |

Decodificacion y calidad:

| Metrica | Resultado |
|---|---|
| Decodificacion MTP3, salida estructurada | ~144 tok/s (97 % de aceptacion, 3,90 tokens por ronda) |
| Decodificacion MTP3, codigo y traduccion | ~117-133 tok/s |
| Decodificacion MTP3, relato y razonamiento largo | ~71-86 tok/s (31-43 % de aceptacion) |
| Decodificacion MTP0 | ~53 tok/s constante |
| `gsm8k_cot` (8-shot, lm-evaluation-harness, 50 muestras) | 0,96 |
| RULER NIAH a 8K / 32K / 64K | 3/3 en cada nivel |
| Perplejidad simulada frente al ancla IQ3_XXS | +0,04 |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM: 15.858 MiB de pico medido en el perfil recomendado; el artefacto ocupa 14,45 GiB en disco. No cabe en GPUs de 12 GB o menos.
- GPU objetivo: NVIDIA RTX 5080 16 GB (Blackwell, `sm_120a`).
- Otras GPU `sm_120` de 16 GB: el autor las considera "esperadas compatibles, no probadas en hardware".
- Existe un port previo a `sm_86` (A5000 16 GB) realizado por aljazceru/ninfer, que sirvio de base a este artefacto.
- Opciones de despliegue: exclusivamente `ninfer-serve`, el servidor del runtime NInfer. No hay soporte para vLLM, llama.cpp, Ollama, TGI ni MLX, ya que el formato `.ninfer` no es compatible con esos ecosistemas.
- Comando de referencia del perfil de 16 GB: `--max-context 124928 --kv-capacity 124928 --kv-dtype i4 --spec mtp --draft-tokens 3 --prefill-chunk 256 --no-cuda-graph`.
- Modo vision: requiere anadir `--vision` y limitar el contexto a 32.768 tokens; con 124.928 tokens el arranque agota la memoria (OOM) en 16 GB.
- Latencia: TTFT de 22 s para 32.714 tokens, 88 s para 97.873 y 121 s para 122.861.
- Throughput de decodificacion: entre ~71 y ~144 tok/s segun la carga con MTP3, y ~53 tok/s con MTP0.

## Comparativa con modelos similares

No se dispone de datos de benchmarks, tamano o contexto de modelos alternativos dentro de la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. La tabla siguiente recoge unicamente lo que si esta documentado.

| Alternativa | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B | Modelo base sin cuantizar | 27.000 millones (denominacion) | no disponible | Apache-2.0 | HuggingFace |
| Este artefacto (mtrskeen/qwen3.8-27b-ninfer-minq4-mtpq4-visionq4-5080) | Recuantizacion min-Q4 + MTP-Q4 + Vision-Q4 | 27.000 millones (modelo base) | 124.928 tokens (texto) / 32.768 (vision) | Apache-2.0 | HuggingFace, requiere NInfer |
| aljazceru/ninfer (port `sm_86`, A5000 16 GB) | Fork previo del runtime y de la conversion min-Q4 | no disponible | no disponible | no disponible | GitHub |
| mtrskeen/ninfer-5080 | Fork del runtime que genera este artefacto | no aplica (runtime) | no aplica | no disponible | GitHub |

## Limitaciones y advertencias

- El artefacto esta compilado para RTX 5080 / `sm_120a`; otras tarjetas `sm_120` de 16 GB se consideran compatibles pero no han sido probadas en hardware.
- El contexto de vision esta limitado por el runtime a 32.768 tokens fusionados; activar `--vision` con 124.928 tokens provoca OOM en el arranque.
- El techo seguro en texto con MTP3 sobre 16 GB es de 124.928 tokens; con MTP0 llega a 131.072.
- La decodificacion MTP3 con muestreo greedy es bit-identica a MTP0 en respuestas cortas, pero puede divergir en generaciones largas cuando hay empates casi exactos entre tokens.
- `--prefill-chunk 256` es un perfil de rendimiento: puede alterar la eleccion exacta de tokens frente a chunk 64 en empates cercanos (la velocidad de decodificacion no cambia) y reduce el limite absoluto de capacidad a 125.952 tokens.
- La opcion `--lm-head-draft` no cabe en el techo de 124.928 tokens y exige un contexto menor.
- Dependencia total del runtime NInfer: no es un checkpoint de Transformers ni un GGUF, por lo que no puede cargarse en vLLM, llama.cpp, Ollama o TGI.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas de veracidad para este artefacto.
- Sesgos conocidos: no disponible; la informacion proporcionada no incluye analisis de sesgo.
- Idioma: no se declara lista de idiomas soportados ni evaluaciones por idioma, pese a que se midio rendimiento en tareas de traduccion.
- La cuantizacion min-Q4 implica una perdida declarada de calidad de +0,04 en perplejidad simulada frente al ancla IQ3_XXS; se trata de una metrica simulada, no de una evaluacion exhaustiva.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no cuenta con validacion independiente de la comunidad.
- Licencia Apache-2.0 en el artefacto y en el modelo base, lo que permite uso comercial, pero la disponibilidad practica depende de la compilacion del fork del runtime.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/mtrskeen/qwen3.8-27b-ninfer-minq4-mtpq4-visionq4-5080
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork del runtime para RTX 5080 (incluye `BENCHMARKS.md`): https://github.com/mtrskeen/ninfer-5080
- Runtime original NInfer: https://github.com/Neroued/ninfer
- Fork previo para A5000 16 GB (`sm_86`): https://github.com/aljazceru/ninfer
- Nota sobre la busqueda web: los resultados devueltos corresponden a guias de rutas ciclistas EuroVelo 6 y no guardan relacion con el modelo, por lo que no se han utilizado como fuente.

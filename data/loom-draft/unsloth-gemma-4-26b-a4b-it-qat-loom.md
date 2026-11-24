# loom-draft/unsloth-gemma-4-26B-A4B-it-qat-loom

## Resumen

`loom-draft/unsloth-gemma-4-26B-A4B-it-qat-loom` es un paquete de despliegue para el runtime AMD Loom, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF `gemma-4-26B-A4B-it-qat-UD-Q4_K_XL.gguf` publicado por Unsloth, derivado de Gemma 4 26B A4B IT en version cuantizada con QAT (quantization-aware training), y lo acompaña de programas `.loom` y una tarjeta `model.json` para servirlo en GPUs AMD concretas.

El modelo subyacente es un Gemma 4 de 26 000 millones de parametros totales con 4 000 millones activos (la nomenclatura A4B indica arquitectura de mezcla de expertos), ajustado para instrucciones y con contexto nativo de 262 144 tokens. La contribucion del autor es el empaquetado y la configuracion de servido: presets de memoria, comandos `loom-fetch`/`loom-serve` y mediciones de rendimiento frente a llama.cpp ROCm y Vulkan sobre el mismo GGUF.

Es relevante porque documenta una via de inferencia optimizada para hardware AMD de consumo y workstation (Ryzen AI Max+ 395 "Strix Halo" y Radeon AI PRO R9700), con cifras de decodificacion y prefill medidas y comparadas de forma reproducible. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamano declarado es de 0.0 GB, lo que sugiere que los pesos no estan alojados en el propio repo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer con mezcla de expertos (MoE), segun nomenclatura A4B del modelo base; detalles finos no disponibles |
| Parametros totales | 26 000 millones (26B) |
| Parametros activos | 4 000 millones (A4B) |
| Longitud de contexto | 262 144 tokens nativos |
| Tipos de cuantizacion | GGUF UD-Q4_K_XL (unica incluida en el paquete); otras variantes del modelo base no disponibles en esta ficha |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`gemma-4-26B-A4B-it-qat-UD-Q4_K_XL.gguf`) mas artefactos Loom (`.loom`, `model.json`) |

## Arquitectura y entrenamiento

El paquete no aporta informacion sobre el entrenamiento del modelo base. Por la nomenclatura y los tags se infiere un transformer con mezcla de expertos de 26B totales y 4B activos por token, en variante instruct (`-it`) y con cuantizacion consciente del entrenamiento (`-qat`), lo que suele implicar que el modelo fue expuesto a ruido de cuantizacion durante el ajuste para reducir la perdida de calidad en 4 bits. No se especifican tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO; esos datos corresponden a la model card de Google o de Unsloth, no a este repositorio.

La innovacion tecnica de este paquete es el runtime Loom: presets que dimensionan por adelantado el pool de memoria (`--pool_backing=fixed`), precarga de parametros en host (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). El preset limita el contexto servible segun la VRAM: 262 144 tokens por peticion en Strix Halo y 36 864 tokens en la R9700 de 32 GB. No hay cabeza MTP ni drafter publicado para este modelo exacto, por lo que la decodificacion especulativa no esta disponible.

## Capacidades

- Generacion de texto conversacional multi-turno en modo instruct, con plantilla de chat que admite `chat_template_kwargs`.
- Modo de razonamiento opcional (`enable_thinking`), desactivable por peticion; en el ejemplo de la model card se envia desactivado.
- Procesamiento de contextos largos de hasta 262 144 tokens en Strix Halo y 36 864 en R9700, segun el preset.
- Servido mediante API compatible con OpenAI (`/v1/chat/completions`).
- Soporte de multiples peticiones concurrentes: se midio un escenario de 4 streams en paralelo.
- Capacidades de codigo, matematicas, tool calling o vision: no disponibles en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos en local: con 262 144 tokens de contexto en Strix Halo se puede cargar un corpus completo (informes, expedientes, bases de codigo) en una sola peticion sin fragmentar, algo inviable en GPUs de consumo con modelos de contexto corto.
- Asistente conversacional autoalojado: el servidor compatible con OpenAI permite sustituir una API en la nube por `loom-serve` en una estacion de trabajo AMD, manteniendo los datos en la maquina.
- Procesamiento por lotes de resumenes y extraccion: el prefill medido (1 440 tok/s a 32k en Strix Halo) hace viable ingerir documentos largos en pipelines nocturnos sobre hardware de una sola GPU.
- Despliegue en workstation con Radeon AI PRO R9700: con 32 GB de VRAM y 36 864 tokens de contexto por peticion sirve cargas de asistencia tecnica o generacion de codigo en un equipo de sobremesa.
- Evaluacion comparativa de runtimes: el paquete incluye metodologia y cifras frente a llama.cpp ROCm y Vulkan con el mismo GGUF, util para decidir el motor de inferencia en hardware AMD.
- Servicio multiusuario ligero: el escenario de 4 streams agregados (151,1 tok/s en Loom) permite atender varias sesiones concurrentes en una unica GPU con un modelo de 26B.
- Prototipado de agentes con razonamiento opcional: activar `enable_thinking` solo en las peticiones que lo requieran reduce coste en el resto del trafico.

## Benchmarks y rendimiento

Las cifras siguientes son mediciones del autor sobre el mismo GGUF, mismo runner y mismos prompts, mediana de 3 sesiones (9 en el caso de 4 streams). No son benchmarks academicos del modelo, sino de throughput del runtime.

Strix Halo (gfx1151):

| Metrica | llama.cpp ROCm | Loom | Margen vs mejor llama.cpp | Roofline | Loom % roofline | llama.cpp Vulkan |
|---|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 66,4 | 77,8 | +12 % | 98,6 | 79 % | 69,2 |
| Decode tok/s, contexto 2k | 56,8 | 70,6 | +24 % | 88,5 | 80 % | 57,1 |
| Decode tok/s, contexto 32k | 47,5 | 57,1 | +20 % | 70,7 | 81 % | 46,8 |
| Prefill tok/s, documento 1k | 1283,3 | 1915,3 | +49 % | 9141,6 | 21 % | 1069,8 |
| Prefill tok/s, documento 2k | 1344,1 | 1948,8 | +45 % | 8752,8 | 22 % | 1154,1 |
| Prefill tok/s, documento 8k | 1322,0 | 1882,2 | +42 % | 8146,9 | 23 % | 1155,0 |
| Prefill tok/s, documento 16k | 1165,4 | 1692,1 | +45 % | 7470,8 | 23 % | 1048,1 |
| Prefill tok/s, documento 32k | 930,6 | 1440,4 | +55 % | 6407,4 | 22 % | 855,3 |
| 4 streams, decode agregado tok/s | 152,0 | 151,1 | -1 % | 316,4 | 48 % | 141,9 |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a | n/a | n/a | n/a |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de calidad del modelo base.

## Requisitos de hardware

- GPUs soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible de forma explicita; el preset de la R9700 de 32 GB limita el contexto servible a 36 864 tokens, lo que da una idea del consumo con UD-Q4_K_XL.
- Strix Halo usa memoria unificada; el preset reserva el pool por adelantado con `--pool_backing=fixed` y permite 262 144 tokens por peticion.
- Cabe en GPU de consumo AMD con memoria unificada (Strix Halo es un APU); en GPUs discretas de consumo de NVIDIA no hay soporte documentado en este paquete.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` y `loom-serve`; el paquete no documenta despliegue con vLLM, llama.cpp, Ollama ni TGI.
- Throughput medido: 77,8 tok/s de decode en prompt corto y 1 915,3 tok/s de prefill a 1k en Strix Halo; 151,1 tok/s agregados con 4 streams.
- La latencia absoluta por peticion no se publica; solo tasas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este paquete (Gemma 4 26B A4B IT QAT, UD-Q4_K_XL) | 26B totales / 4B activos | 262 144 nativos; 36 864 en R9700 por preset | Apache 2.0 | GGUF + Loom | Runtime Loom sobre AMD |
| Mismo GGUF en llama.cpp ROCm b1375 | 26B / 4B | 65 536 (`-c 65536`) | Apache 2.0 (modelo) | GGUF | Referencia de rendimiento del autor |
| Mismo GGUF en llama.cpp Vulkan b12211 | 26B / 4B | 36 864 (`-c 36864`) | Apache 2.0 (modelo) | GGUF | Referencia de rendimiento del autor |

No se dispone de datos para comparar con otros modelos de tamano o categoria similares (por ejemplo, otras variantes de Gemma 4 o MoEs de 4B activos) en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo dia (2026-11-24); no hay evidencia de uso en produccion.
- El tamano del repo es 0.0 GB: los pesos no parecen estar alojados aqui, sino obtenidos via `loom-fetch` desde el modelo base.
- Solo se soportan dos GPUs AMD concretas; no hay soporte documentado para NVIDIA, Apple Silicon ni otras AMD.
- El contexto servible depende del preset: en R9700 se reduce a 36 864 tokens frente a los 262 144 nativos, una perdida de aproximadamente el 86 % de la ventana.
- No hay drafter ni cabeza MTP: sin decodificacion especulativa, lo que limita el throughput en decodificacion.
- El modo de 4 streams no mejora a llama.cpp (-1 %, dentro del ruido de +-3 % declarado por el autor) y alcanza solo el 48 % del roofline.
- El prefill alcanza solo el 21-23 % del roofline en Strix Halo: hay margen de optimizacion y el cuello de botella es real.
- No hay datos de sesgos, tasa de alucinacion ni calidad multilingue del modelo base en esta informacion.
- La licencia Apache 2.0 se declara en los metadatos, pero conviene verificar la licencia del modelo Gemma subyacente antes de uso comercial, ya que los terminos de Gemma pueden imponer restricciones adicionales.
- El ejemplo de peticion usa `chat_template_kwargs` con `enable_thinking: false`; un uso incorrecto de la plantilla puede degradar las respuestas.
- Los enlaces de busqueda web encontrados corresponden a Loom (la herramienta de grabacion de video) y a la marca de ropa Loom, sin relacion con este runtime; no se han usado como fuente.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/unsloth-gemma-4-26B-A4B-it-qat-loom
- Modelo base GGUF: https://huggingface.co/unsloth/gemma-4-26B-A4B-it-qat-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Workflow loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/

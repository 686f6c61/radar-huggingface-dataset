# skillsafe-ai/qwen3-4b-q4f16

## Resumen

`skillsafe-ai/qwen3-4b-q4f16` no es un modelo entrenado desde cero, sino un paquete de artefactos ya convertidos para ejecutar Qwen3-4B en el navegador mediante MLC/WebLLM. Lo publica la organizacion SkillSafe y se genera de forma reproducible a partir del repositorio upstream `mlc-ai/Qwen3-4B-q4f16_1-MLC` (commit `a5c9fab855e3ccbdfed2e7e69683d75f30332161`), usando una receta declarada (`recipes/qwen3-4b-q4f16.yaml`) y una cadena de herramientas concreta (Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0 sobre Darwin arm64). El resultado son 44 fragmentos `params_shard_*.bin`, un binario WebAssembly para WebGPU y los ficheros de configuracion del tokenizador y de MLC.

El problema que resuelve es la distribucion de un LLM de 4 000 millones de parametros cuantizado a 4 bits con activaciones en fp16, listo para inferencia local en el navegador del usuario sin backend ni GPU en servidor. El repo ocupa 2,3 GB y su licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para productos web con requisitos de privacidad o para demos sin coste de infraestructura.

Su relevancia es doble: por un lado, abarata el despliegue de un modelo conversacional de gama media en cualquier equipo con WebGPU; por otro, al ser un artefacto derivado y verificable (hash SHA-256 por fichero), sirve como ejemplo de cadena de suministro reproducible de pesos cuantizados. La contrapartida es que el binario compilado declara una ventana de contexto de 4 096 tokens (`ctx4k`), muy inferior a la del modelo base sin compilar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), convertido al formato de ejecucion MLC/WebLLM |
| Parametros totales | 4 000 millones (modelo base `Qwen/Qwen3-4B`) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4 096 tokens en el artefacto WebGPU (`ctx4k` en el nombre del wasm); la configuracion del modelo base no se detalla en la informacion proporcionada |
| Tipos de cuantizacion | `q4f16_1`: pesos de 4 bits, activaciones/acumulacion en fp16 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | MLC (`params_shard_*.bin` + `ndarray-cache.json` + `mlc-chat-config.json`), binario `lib/Qwen3-4B-q4f16_1-ctx4k_cs1k-webgpu.wasm` |
| Tamano del repositorio | 2,3 GB |
| Pipeline declarado | text-generation |
| Autor | skillsafe-ai |
| Fecha de conversion | 2026-09-22T19:08:12+00:00 |
| Descargas / likes | 0 / 0 |
| Modelo base | Qwen/Qwen3-4B |
| Tags | skillsafe, browser, web-llm, text-generation, mlc, conversational, region:us |

## Arquitectura y entrenamiento

Esta publicacion no incluye entrenamiento ni ajuste fino: es una conversion de pesos. La cadena declarada parte de los artefactos MLC del upstream fijados por commit y produce un grafo ejecutable en WebGPU, con pesos fragmentados en 44 shards (`params_shard_0.bin` a `params_shard_43.bin` como minimo, con tamanos entre 23,19 MB y 185,47 MB; el listado completo del README aparece truncado en la informacion disponible). La conversion se declara reproducible: cada fichero lleva su SHA-256, el wasm (`lib/Qwen3-4B-q4f16_1-ctx4k_cs1k-webgpu.wasm`, 5,79 MB) tiene hash `5ddf44e4...` y la receta asociada tiene hash `1639cc66...`. El sufijo `cs1k` del binario corresponde al parametro de tamano de bloque de prefill usado por el runtime.

En cuanto al modelo subyacente, la arquitectura es la de Qwen3-4B: un transformer decoder-only denso con atencion por consultas agrupadas, tokenizador propio (`merges.txt`, 1,59 MB) y modo conversacional declarado en `mlc-chat-config.json`. Los detalles de composicion del dataset de preentrenamiento, numero de tokens, fases de RLHF/DPO y cualquier innovacion concreta del modelo base no se detallan en la informacion proporcionada; deben consultarse en la ficha oficial de Qwen3-4B. La innovacion relevante aqui es de ingenieria de despliegue, no de modelado: empaquetado listo para navegador con verificacion de integridad por hash.

## Capacidades

- Generacion de texto y dialogo multi-turno en modo conversacional (`conversational` aparece como tag explicito).
- Ejecucion integra en el navegador mediante WebGPU, sin llamadas a un servidor de inferencia.
- Capacidades heredadas del modelo base Qwen3-4B (razonamiento, codigo, matematicas, multilingue) en la medida en que la cuantizacion de 4 bits y la ventana de 4 096 tokens lo permitan; no hay evaluacion publicada de este artefacto concreto.
- Soporte de tool calling / function calling: no verificado en este artefacto; depende de la plantilla de chat incluida en `mlc-chat-config.json` y del runtime WebLLM.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (artefacto de solo texto).
- Modo "thinking" explicito: no disponible en la informacion proporcionada para este artefacto.

## Casos de uso

- Asistente conversacional embebido en una web: el usuario descarga 2,3 GB de pesos una vez y las conversaciones se procesan en su equipo, de modo que los prompts no salen del navegador. Adecuado para productos con requisitos estrictos de privacidad o con base de usuarios sensible al tratamiento de datos.
- Extension de navegador para resumir o reescribir contenido: con 4 096 tokens de contexto caben articulos, correos o hilos de tickets de longitud media; el modelo corre junto a la pestana sin coste de backend.
- Demo comercial sin infraestructura: prototipos y pruebas de concepto que hoy necesitarian una GPU alquilada pueden publicarse como pagina estatica con WebLLM, eliminando el coste por token durante la fase de validacion.
- Entornos sin conectividad o aislados: formacion, sanidad o industria con redes restringidas donde no se permite enviar texto a servicios externos; el artefacto se sirve desde el propio host o desde disco.
- Procesamiento de texto confidencial en local: clasificacion, extraccion de campos y normalizacion de documentos legales o clinicos en el puesto de trabajo, sin transmitir el contenido.
- Triaje y preprocesado en pipelines por lotes: etiquetado de tickets, deteccion de intencion o generacion de borradores antes de pasarlos a un modelo mayor alojado en servidor, reduciendo el volumen de llamadas a la API.
- Asistencia ligera de redaccion en herramientas internas: reescritura de textos, generacion de respuestas tipo y resumen de actas, con una ventana de 4 096 tokens suficiente para documentos cortos.
- Educacion y experimentacion: analisis de una conversion MLC completa, comparacion de calidad entre `q4f16_1` y los pesos originales, y estudio del rendimiento de WebGPU en distintos equipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio tiene 0 descargas y 0 likes, y la model card no incluye tablas de MMLU, HumanEval, GSM8K ni equivalentes para esta conversion concreta. Cualquier cifra del modelo base Qwen3-4B corresponde a los pesos sin cuantizar y no es extrapolable directamente a este artefacto `q4f16_1` de 4 bits. Tampoco se publican mediciones de latencia o tokens por segundo para el binario WebGPU.

## Requisitos de hardware

- VRAM estimada: alrededor de 2,3-2,5 GB para los pesos, mas el espacio del cache KV (dependiente de la longitud de contexto y del numero de secuencias simultaneas). Con 4 096 tokens de contexto, el cache es modesto pero no despreciable.
- Requisito principal: navegador con soporte de WebGPU (Chromium/Edge actuales en escritorio; soporte variable en Safari, Firefox y plataformas moviles). Sin WebGPU no se puede ejecutar este artefacto.
- GPUs de escritorio compatibles: tarjetas dedicadas modernas (familia RTX 30/40, Radeon RX 6000/7000, Arc A/B). El modelo cabe en GPUs de gama media y en muchas integradas recientes.
- GPUs de centro de datos: A100, H100 o L40S no son necesarias para este artefacto; el cuello de botella es el soporte de WebGPU del navegador, no la VRAM.
- Equipos de consumo: si, cabe en portatiles con GPU integrada moderna (Apple Silicon, Intel Arc integrada, APUs Ryzen recientes) y en moviles de gama alta con WebGPU funcional, siempre que el navegador lo exponga.
- Opciones de despliegue: WebLLM o MLC LLM (el uso previsto de este repo); para servidor, conviene usar los pesos originales Qwen3-4B con vLLM, TGI, llama.cpp, Ollama o SGLang en lugar de este binario WebGPU.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `skillsafe-ai/qwen3-4b-q4f16` | 4 000 M denso | 4 096 tokens en el artefacto | apache-2.0 | MLC/WebLLM en navegador | Conversion q4f16_1 verificable; 0 descargas |
| Qwen/Qwen3-4B (base, sin cuantizar) | 4 000 M denso | segun configuracion del modelo base | apache-2.0 | safetensors, ecosistema amplio | Fuente de la que deriva este artefacto; rendimiento superior al cuantizado a 4 bits |
| mlc-ai/Qwen3-4B-q4f16_1-MLC (upstream) | 4 000 M denso | equivalente | apache-2.0 | MLC/WebLLM | Origen directo de los pesos de este repo |
| Alternativas de la misma categoria (Llama 3.2 3B, Gemma 3 4B, Phi-4-mini) | ~3-4 B densos | 128 000 tokens segun documentacion publica de esos modelos | licencias propias de cada familia | safetensors y formatos GGUF/MLC | Comparativa de rendimiento con este artefacto: no disponible |

No hay datos de rendimiento comparado publicados para este repositorio, por lo que la eleccion frente a alternativas debe basarse en licencia, ecosistema del runtime y disponibilidad de formatos, no en cifras de benchmarks de esta publicacion.

## Limitaciones y advertencias

- Cuantizacion a 4 bits: la perdida de precision frente a los pesos originales puede degradar tareas sensibles a matices, como aritmetica de varios pasos, codigo con APIs poco frecuentes o instrucciones muy largas. No hay evaluacion publicada del delta de calidad.
- Ventana de contexto reducida: el binario esta compilado como `ctx4k`, es decir, 4 096 tokens. Es insuficiente para documentos largos, bases de codigo extensas o conversaciones prolongadas.
- Artefacto no validado por la comunidad: 0 descargas y 0 likes en el momento de la consulta. No hay informes independientes de calidad, estabilidad ni seguridad.
- Riesgo de alucinacion: heredado de cualquier LLM de 4 000 millones de parametros sin verificacion externa. En usos con consecuencias legales, medicas o financieras requiere supervision humana.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o alineacion para este artefacto ni para la conversion. Se desconocen los sesgos del paquete de datos del modelo base.
- Idiomas: la model card no declara idiomas soportados. Aunque el modelo base se presenta como multilingue, no hay confirmacion para este artefacto cuantizado.
- Dependencia del runtime: atado al ecosistema MLC/WebLLM y a la disponibilidad de WebGPU. Navegadores sin WebGPU no pueden ejecutarlo, y el rendimiento varia mucho entre implementaciones.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar avisos de licencia. Conviene verificar que la licencia del modelo base se mantiene coherente con la del artefacto derivado.
- Reproducibilidad: la cadena de herramientas declarada usa versiones futuras respecto a muchas instalaciones actuales (torch 2.10.0, onnxruntime 1.30.0) y se genero sobre macOS arm64; reproducirla en otro entorno puede dar binarios distintos.
- Listado incompleto: la lista de ficheros de la model card aparece truncada en la informacion disponible, por lo que no se puede confirmar el inventario total de shards ni el recuento exacto de parametros del artefacto.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/skillsafe-ai/qwen3-4b-q4f16
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Upstream MLC de esta conversion: https://huggingface.co/mlc-ai/Qwen3-4B-q4f16_1-MLC/tree/a5c9fab855e3ccbdfed2e7e69683d75f30332161
- Recetas de conversion de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Proyecto MLC LLM: https://github.com/mlc-ai/mlc-llm
- WebLLM: https://github.com/mlc-ai/web-llm
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos eran paginas genericas de Microsoft y no se han incluido.

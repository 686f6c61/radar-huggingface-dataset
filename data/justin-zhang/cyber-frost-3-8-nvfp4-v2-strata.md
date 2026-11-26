# justin-zhang/CYBER-FROST-3.8-NVFP4-V2-Strata

## Resumen

CYBER-FROST-3.8-NVFP4-V2-Strata es un paquete de pesos preparado por justin-zhang para ejecutar el modelo Blackfrost-AI/CYBER-FROST-3.8-NVFP4-V2 en el motor de inferencia Strata (version 0.2.22, engine 0.1.69). El modelo subyacente es un fine-tune de Qwen3.8-Flash-Next, una arquitectura MoE de aproximadamente 125.700 millones de parametros totales, distribuido bajo la Qwen Community License 1.0. Este repositorio no reentrena ni recuantiza el modelo: repaqueta los bloques NVFP4 (ModelOpt) originales de los expertos enrutados en un formato compatible con Strata.

La relevancia de esta publicacion es practica: permite ejecutar un MoE de gran tamano con cuantizacion FP4 nativa en una sola GPU Blackwell de 48 GB, usando el motor Strata con soporte de decodificacion especulativa mediante la capa MTP (multi-token prediction) del propio fine-tune. El autor verifica que la conversion es sin perdida (lossless) comparando bit a bit los pesos y las escalas de cuantizacion.

Se trata de un lanzamiento de investigacion en evaluacion activa de calidad, con cero descargas y cero likes en el momento de la ficha, y sin resultados de benchmarks publicados. Su interes principal es como artefacto de despliegue, no como modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (derivada de Qwen3.8-Flash-Next) |
| Parametros totales | 125.743.801.216 (125,7 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 128K (probado a 128K con KV int8 en el host de referencia) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados, bloques ModelOpt nativos), Q8_0 (attention, expertos compartidos, head, embedding), BF16 (proyecciones pequenas), Q2_0 (capa MTP draft) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como "other" en los metadatos) |
| Formato de pesos | GGUF (denso y pack de expertos), binario de expertos, JSON de configuracion |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.8-Flash-Next con arquitectura Mixture of Experts. Los expertos enrutados conservan los bloques NVFP4 del checkpoint original (ModelOpt), sin recuantizacion: el proceso de conversion solo los reempaqueta. El repositorio incluye dos representaciones: un GGUF denso de 73,9 GB generado con `nvfp4_convert.py` (attention, expertos compartidos, head y embedding en Q8_0; proyecciones pequenas en BF16; expertos enrutados en NVFP4) y un pack de expertos de 69,5 GB (`experts.bin` de 63,3 GiB en NVFP4 mas `dense.bin`, indice y tokenizador) generado con `iq_pack.py`.

Incluye ademas la capa MTP (multi-token prediction) propia del fine-tune, empaquetada en Q2_0 (`mtp/mtp-q2_0.gguf`, 0,8 GB), que actua como drafter para decodificacion especulativa. No se incluyen la tabla PLE de n-gramas, el embedding de tokens BF16 ni el lector de imagenes: el autor comprueba que la tabla PLE y el embedding del fine-tune son identicos byte a byte a los de Qwen3.8-Flash-Next base, por lo que se reutilizan los ficheros compartidos de Strata. La verificacion reportada cubre 73.728 tensores de escala (7,03 GiB) sin bit de signo ni NaN, y dequantizacion identica bit a bit en los expertos muestreados. No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni etapas de RLHF/DPO del fine-tune.

## Capacidades

- Generacion de texto conversacional (pipeline declarado: conversational; el template de chat incluye un system prompt por defecto).
- Razonamiento y generacion de codigo: la verificacion `strata connect opencode --check` pasa con prompt y tool call.
- Tool calling / function calling: expone API compatible con OpenAI (`/v1`) y Anthropic (`/v1/messages`).
- Lectura de imagenes: el autor referencia un `mmproj` BF16 de Qwen3.8-Flash-Next como lector de imagenes compartido, lo que sugiere capacidad multimodal en el stack, aunque no se detalla en la model card.
- Decodificacion especulativa mediante capa MTP propia (66 de 113 tokens draft aceptados en la prueba del autor).
- Contexto largo: hasta 128K tokens con KV cache en int8.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Despliegue de un MoE de 125,7 mil millones de parametros en una sola GPU de 48 GB: gracias a los expertos en NVFP4 y al modo de presupuesto de RAM de Strata, un equipo con RTX PRO 5000 Blackwell puede servir el modelo en local sin cluster multi-GPU.
- Asistente de codigo integrado en IDE o CLI: la verificacion con opencode y el soporte de tool calling permiten usarlo como backend de agentes de programacion via API compatible con OpenAI o Anthropic.
- Backend de agentes multi-paso: la ventana de 128K y el formato de API estandar facilitan cadenas de razonamiento con historial largo y llamadas a herramientas.
- Servicio de chat conversacional autoalojado: el template de chat con system prompt por defecto y el endpoint `/` (pagina web) permiten levantar una interfaz de conversacion interna rapidamente.
- Procesamiento de documentos extensos: 128K de contexto con KV int8 permite resumir o extraer informacion de contratos, informes o bases de codigo de gran longitud.
- Investigacion en cuantizacion FP4: el pack sirve como referencia reproducible de conversion NVFP4 a GGUF con verificacion bit a bit, util para estudiar perdida de calidad en formatos de 4 bits.
- Evaluacion comparativa de motores de inferencia: al incluir drafter MTP y configuracion de Strata, permite medir throughput y aceptacion especulativa frente a otros runtimes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de rendimiento son del autor en su host de referencia (RTX PRO 5000 Blackwell de 48 GB, 251 GB de RAM, contexto 128K, KV int8): carga en aproximadamente 1 minuto y unos 105 tok/s de decodificacion en una respuesta corta con el drafter MTP (66 de 113 tokens draft aceptados).

## Requisitos de hardware

- GPU NVIDIA obligatoria; la documentacion de Strata lista series RTX 20 a 50. Probado en RTX PRO 5000 Blackwell (48 GB).
- VRAM: el GGUF denso ocupa 73,9 GB en disco y el pack de expertos 69,5 GB; con 48 GB de VRAM se requiere el modo de presupuesto de RAM de Strata para los aproximadamente 64 GiB de expertos.
- RAM: el host de prueba contaba con 251 GB; el autor indica que se necesitan unos 64 GiB de RAM para los expertos si no caben en VRAM.
- No cabe en GPUs de consumo de 24 GB o menos en esta configuracion; no hay datos de variantes mas agresivas.
- Despliegue: motor Strata (`strata serve --profile`), con API OpenAI en `/v1`, Anthropic en `/v1/messages` y pagina web en `/`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput medido: aproximadamente 105 tok/s de decodificacion en respuesta corta con MTP; latencia de carga en torno a 1 minuto.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CYBER-FROST-3.8-NVFP4-V2-Strata | 125,7 mil millones | 128K | NVFP4 + Q8_0 + BF16 | Qwen Community License 1.0 | Hugging Face, motor Strata |
| Blackfrost-AI/CYBER-FROST-3.8-NVFP4-V2 (base) | 125,7 mil millones (mismo checkpoint) | no disponible | NVFP4 | Qwen Community License 1.0 | Hugging Face |
| Maximilian228/Qwen3.8-Flash-Next-NVFP4-GPTQ-Strata | no disponible | no disponible | NVFP4 GPTQ | no disponible | Hugging Face, motor Strata |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | no disponible | no disponible | GSQ-RCO GGUF | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Lanzamiento de investigacion en evaluacion activa de calidad, segun el propio autor; no recomendado para produccion sin evaluacion propia.
- Cero descargas y cero likes: sin validacion de la comunidad.
- Sin benchmarks publicados; el rendimiento solo esta medido en un unico host.
- Dependencia fuerte del motor Strata y de ficheros compartidos alojados en otros repositorios con revisiones fijas; si esos repos cambian o desaparecen, el despliegue se rompe.
- Requiere GPU NVIDIA y una cantidad de RAM considerable; no es desplegable en hardware de consumo habitual.
- La licencia Qwen Community License 1.0 impone condiciones adicionales para uso comercial; es necesario revisar el fichero LICENSE antes de explotarlo.
- Idiomas soportados no documentados; riesgo de comportamiento degradado fuera de los idiomas del modelo base.
- Riesgo de alucinacion no cuantificado; el template de chat incorpora un system prompt por defecto que puede alterar el comportamiento esperado.
- La capacidad de vision depende de un `mmproj` externo no incluido en el repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/justin-zhang/CYBER-FROST-3.8-NVFP4-V2-Strata
- Modelo base: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-NVFP4-V2 (revision a5f4a8f198d32326aa3cfff397d43a513cc62b04)
- Motor Strata: https://github.com/Niko1221/Strata
- Ficheros compartidos PLE y embedding: https://huggingface.co/Maximilian228/Qwen3.8-Flash-Next-NVFP4-GPTQ-Strata (revision 640a1db97446ddd5e89d2b70ecd0297987192c93)
- Lector de imagenes mmproj: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF (revision ed59f92082b1e93c0e96d60a8b11aab089b52f09)

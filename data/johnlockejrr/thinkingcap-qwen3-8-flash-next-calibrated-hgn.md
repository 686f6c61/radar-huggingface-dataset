# johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-calibrated-HGN

## Resumen

ThinkingCap-Qwen3.8-Flash-Next-calibrated-HGN es un paquete de pesos cuantizados en formato nativo Halogen `.hgn`, publicado por el usuario johnlockejrr, que reempaqueta el fine-tune BF16 [bottlecapai/ThinkingCap-Qwen3.8-Flash-Next](https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next) de BottleCap AI. Este fine-tune, a su vez, deriva del modelo base Qwen3.8-Flash-Next de Alibaba Qwen y aplica un post-entrenamiento orientado a reducir el numero de tokens de razonamiento (thinking) generados, manteniendo una precision cercana a la del modelo original.

El interés de este paquete concreto no reside en el modelo en si, sino en el proceso de cuantizacion: es una re-cuantizacion GPTQ calibrada con un corpus de mezcla agentica de aproximadamente 1 millon de tokens, que aplica cobertura suave sobre los expertos del MoE y un refuerzo de sensibilidad en capas concretas (2, 4, 30, 46 y 47). El resultado se distribuye como tres ficheros `.hgn` (tronco con MTP embebido, tabla n-gram y torre de vision) con un total aproximado de 111 GiB.

La relevancia practica es limitada y muy especifica: estos pesos solo cargan en el runtime halogen-flash-server, no en Transformers, vLLM ni llama.cpp. Para quien opere ese stack, el paquete ofrece una alternativa calibrada al pack no calibrado del mismo autor, con mejor fidelidad esperada en los expertos del MoE a cambio de un proceso de conversion mas costoso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), derivada de Qwen3.8-Flash-Next; incluye MTP embebido y torre de vision |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base es MoE, pero no se publica el conteo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | I4R en expertos, HT en densas, Q4C-P en embeddings (contrato de decodificacion Halogen v2); calibracion GPTQ con percdamp 1.0 y layer boost 0.25 en capas 2, 4, 30, 46, 47 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en el Hub) |
| Formato de pesos | Halogen `.hgn` (model.hgn, qwen38-flash-next-ngram.hgn, qwen38-flash-next-vision.hgn) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos (MoE) de la familia Qwen3.8-Flash-Next. BottleCap AI lo post-entrena para producir razonamientos mas cortos: segun la model card upstream, se consigue una reduccion media de aproximadamente el 38,5 % en tokens de thinking (rango del 22 al 51 % segun el benchmark) con una precision media de aproximadamente 88,8 % frente al 89,8 % del base. No se detalla en la informacion disponible la composicion del dataset de post-entrenamiento ni si se emplearon RLHF o DPO.

La innovacion tecnica de este paquete es el pipeline de conversion `bf16-to-hgn` 0.1.0 con perfil v2 y calidad `calibrated`. Se recogieron Hessianos por experto en formato block-diagonal sobre un corpus agentico de aproximadamente 978.944 tokens (trazas de Cursor de TeichAI, razonamiento de Claude Sonnet, RazorCal con herramientas, PerfectBlend, WikiText y un proxy de calibracion de The Pile), con cobertura suave del router para expertos frios y un minimo de 256 tokens por experto. El resultado: 48x512 expertos con cobertura caliente y cero expertos frios tras el relleno suave, con 49.152 claves de Hessiano por experto. La verificacion se realizo con decodificacion CUDA y `provenance_attested: true`. El autor declara inspiracion en la estrategia de Unsloth Dynamic y MACaQ, sin reutilizar su mezcla de bits GGUF ni sus runtimes Hadamard.

## Capacidades

- Generacion de texto y razonamiento con modo thinking de longitud reducida (objetivo principal del fine-tune upstream).
- Capacidad de codigo y uso de herramientas inferida del corpus de calibracion agentico (trazas de Cursor, RazorCal con tools), aunque no se documentan evaluaciones especificas en la informacion disponible.
- Soporte de tool calling y function calling: no confirmado explicitamente en la model card; el template de chat se hereda de ThinkingCap y coincide con los assets estandar de Flash-Next.
- Razonamiento multi-paso y uso como agente: plausible por el linaje Flash-Next y el corpus de calibracion, pero sin benchmarks publicados para este pack.
- Vision: incluye torre de vision opcional (`qwen38-flash-next-vision.hgn`, 0,84 GiB), activable con `HALOGEN_VISION_TOWER=1`.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Prediccion multi-token (MTP) integrada en `model.hgn`, sin fichero `mtp.hgn` separado.

## Casos de uso

- Despliegue en infraestructura Halogen: el caso de uso real y casi exclusivo. Montar los tres `.hgn` en un contenedor halogen-flash-server para servir el modelo con el contrato de decodificacion v2. Solo tiene sentido si la organizacion ya opera ese runtime.
- Razonamiento con presupuesto de tokens ajustado: al reducir el thinking aproximadamente un 38,5 % de media, encaja en pipelines donde el coste por consulta depende del numero de tokens generados (clasificacion con justificacion, extraccion estructurada con cadena de razonamiento).
- Agentes con uso de herramientas: el corpus de calibracion prioriza trazas agenticas y de herramientas, lo que deberia preservar mejor el comportamiento en ese dominio que una cuantizacion RTN generica; util para asistentes de IDE o automatizacion de tareas con APIs.
- Evaluacion comparativa de tecnicas de cuantizacion: el paquete calibrado y su hermano no calibrado (`johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-HGN`) permiten medir el impacto de GPTQ con cobertura suave frente a RTN/Optimal sobre el mismo checkpoint BF16.
- Procesamiento de imagenes con el modelo de lenguaje: activando la torre de vision, para tareas de descripcion o extraccion de informacion de documentos, siempre dentro del runtime Halogen.
- Reproducibilidad de conversiones: el `conversion-manifest.json`, el `sha256.txt` y los comandos documentados permiten auditar y replicar el proceso de cuantizacion en entornos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este pack HGN. La model card indica explicitamente que las cifras del modelo upstream BF16 deben tratarse solo como referencia. Como contexto del fine-tune upstream (no de esta cuantizacion):

| Metrica (upstream BF16) | ThinkingCap | Base Flash-Next |
|---|---|---|
| Precision media | ~88,8 % | ~89,8 % |
| Reduccion de tokens de thinking | ~38,5 % de media (22-51 % por benchmark) | referencia |

## Requisitos de hardware

- Almacenamiento: aproximadamente 111 GiB en disco para los tres ficheros `.hgn` (62,11 GiB el tronco, 47,68 GiB la tabla n-gram, 0,84 GiB la torre de vision). El repositorio completo ocupa 118,8 GB.
- VRAM: no disponible de forma explicita. Por el tamano del tronco cuantizado a I4R, se requiere un nodo multi-GPU de clase servidor; no es un modelo para GPU de consumo.
- GPU recomendadas: no especificadas en la model card. Por clase de despliegue (packs Halogen v2 de Flash-Next con ~111 GiB), se presupone hardware de datacenter tipo A100/H100 multi-GPU; dato no confirmado.
- GPU de consumo: no cabe en RTX 4090 ni en tarjetas de 24 GB.
- Despliegue: exclusivamente halogen-flash-server (o runtime Halogen equivalente). No compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-Flash-Next-calibrated-HGN (este) | no disponible (MoE) | no disponible | Halogen `.hgn` | qwen-community-license-1.0 | GPTQ calibrado, cobertura suave de expertos, MTP embebido, vision opcional |
| ThinkingCap-Qwen3.8-Flash-Next-HGN (hermano) | no disponible (MoE) | no disponible | Halogen `.hgn` | qwen-community-license-1.0 | RTN/Optimal sin sidecar GPTQ; misma base, sin calibracion |
| bottlecapai/ThinkingCap-Qwen3.8-Flash-Next | no disponible (MoE) | no disponible | safetensors BF16 | qwen-community-license-1.0 | Checkpoint de referencia; carga en stacks estandar (Transformers, vLLM) |
| Qwen/Qwen3.8-Flash-Next | no disponible (MoE) | no disponible | safetensors | qwen-community-license-1.0 | Modelo base sin post-entrenamiento de thinking corto |

## Limitaciones y advertencias

- Incompatibilidad de runtime: los pesos `.hgn` no cargan en Transformers, vLLM, llama.cpp ni herramientas equivalentes. Sin halogen-flash-server el paquete es inutilizable.
- La tabla n-gram (`qwen38-flash-next-ngram.hgn`) es obligatoria y debe mantenerse junto al checkpoint; su ausencia impide el despliegue.
- Sin benchmarks propios: no hay mediciones publicadas de calidad, latencia ni throughput para esta cuantizacion concreta. Las cifras upstream (88,8 % de precision, 38,5 % menos thinking) corresponden al BF16 y pueden degradarse con la cuantizacion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; el modo thinking reducido puede aumentar el riesgo en tareas que requieren razonamiento largo, ya que el fine-tune upstream sacrifica aproximadamente un punto de precision media.
- Sesgos: no documentados en la informacion disponible; hereda los del modelo base Qwen3.8-Flash-Next y del corpus de post-entrenamiento de BottleCap AI.
- Idiomas: no se declara cobertura linguistica; no asumir multilingue sin validacion.
- Licencia: qwen-community-license-1.0 impone condiciones especificas para uso comercial que deben revisarse en el fichero LICENSE del repositorio antes de desplegar en produccion.
- Procedencia: el paquete lo publica un tercero (johnlockejrr), no BottleCap AI ni Qwen; la calidad de la conversion depende de su pipeline, aunque se aporta manifiesto y hashes SHA-256 para verificacion.
- La model card original aparece truncada en el texto proporcionado ("HF inputs do not take..."), por lo que podria faltar informacion sobre requisitos de entrada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-calibrated-HGN
- Pack hermano no calibrado: https://huggingface.co/johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-HGN
- Modelo base BF16 (ThinkingCap): https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog de BottleCap AI: https://bottlecapai.com/post/thinkingcap-qwen3-8-flash-next/
- Web de BottleCap AI: https://www.bottlecapai.com/
- Runtime halogen-flash-server: https://github.com/peonist-ai/halogen-flash-server

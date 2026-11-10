# moltherm1/olmo-mirror-olmo-3-7b-instruct

## Resumen

Olmo 3 7B Instruct es un modelo de lenguaje de 7.300 millones de parametros desarrollado por el Allen Institute for AI (Ai2) dentro de la familia Olmo 3, que incluye variantes de 7B y 32B en versiones Instruct y Think. Este repositorio concreto (`moltherm1/olmo-mirror-olmo-3-7b-instruct`) es un espejo del checkpoint `allenai/Olmo-3-7B-Instruct-DPO`, es decir, la etapa intermedia de post-entrenamiento tras SFT y DPO, antes de la fase final de RLVR. El modelo emplea una arquitectura transformer autorregresiva y esta orientado a generacion de texto conversacional y function calling en ingles.

La relevancia de Olmo 3 radica en su caracter completamente abierto: Ai2 publica pesos, codigo de entrenamiento (Open-Instruct, OLMo-core, OLMo-Eval), datasets (Dolma 3 para pre-entrenamiento, Dolci para post-entrenamiento) y detalles de entrenamiento, lo que lo convierte en una pieza clave para la investigacion reproducible en modelos de lenguaje. El modelo esta pensado para uso en investigacion y educacion bajo licencia Apache 2.0.

Este espejo concreto no registra descargas ni "likes" y no anade modificaciones tecnicas respecto al checkpoint original de Ai2; su interes es fundamentalmente como punto de acceso alternativo al modelo base. La fecha de corte de conocimiento declarada es diciembre de 2024.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (estilo decoder-only) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 via bitsandbytes (`load_in_8bit`); fp16 recomendado |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 14,6 GB) |

## Arquitectura y entrenamiento

Olmo 3 7B Instruct es un transformer autorregresivo de tipo decoder-only con 7.298 millones de parametros. El pipeline de post-entrenamiento documentado por Ai2 sigue cuatro etapas: pre-entrenamiento sobre Dolma 3, SFT sobre el modelo base `Olmo-3-1025-7B`, DPO y, en la version final, RLVR (reinforcement learning with verifiable rewards). Este repositorio corresponde a la etapa DPO (`Olmo-3-7B-Instruct-DPO`), por lo que no incluye el refinamiento final por RLVR de `Olmo-3-7B-Instruct`. El dataset de post-entrenamiento citado es `allenai/Dolci-Instruct-RL-7B`.

La model card original no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset Dolma 3 en este repositorio. El modelo esta disenado para function calling, con una plantilla de chat basada en tokens especiales `<|im_start|>` y `<|im_end|>` y un mensaje de sistema por defecto orientado a asistente de funciones. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento general y respuesta a preguntas.
- Soporte de function calling / tool calling mediante plantilla de chat con bloque `<functions></functions>`.
- Uso como asistente en pipelines de agentes (la familia Olmo 3 incluye variantes Think con cadena de pensamiento larga para matematicas y codigo, aunque esta variante es Instruct).
- Capacidades multilingues limitadas al ingles segun la model card.
- Compatible con `transformers >= 4.57.0` y con endpoints de Hugging Face (`endpoints_compatible`).
- No dispone de vision ni audio segun la informacion proporcionada.

## Casos de uso

- Investigacion reproducible en post-entrenamiento: al ser un checkpoint DPO publico con codigo y datasets asociados, permite estudiar el efecto del DPO frente a SFT y RLVR en un modelo de 7B.
- Asistente conversacional en ingles: adecuado para prototipos de atencion al cliente o chatbots internos donde se requiera una licencia permisiva y trazabilidad completa del entrenamiento.
- Function calling en pipelines de automatizacion: la plantilla de chat con bloque `<functions>` permite integrar el modelo en flujos que invocan APIs o herramientas externas.
- Generacion de codigo asistida en entornos de investigacion: puede usarse como base para experimentos de generacion y evaluacion de codigo, aunque sin garantias de rendimiento de nivel produccion.
- Fine-tuning adicional: al estar bajo Apache 2.0 y en safetensors, es una base adecuada para ajuste supervisado o DPO adicional sobre dominios concretos.
- Educacion y docencia: util para cursos sobre transformers, alineamiento y evaluacion de modelos, dado que toda la cadena de entrenamiento es publica.
- Evaluacion comparativa de modelos abiertos: sirve como referencia en estudios que comparan familias abiertas (Olmo, Qwen, Granite) bajo condiciones controladas.

## Benchmarks y rendimiento

La model card original incluye una tabla de evaluacion comparativa, pero el contenido proporcionado esta truncado y no incluye los valores numericos de los benchmarks. Por tanto:

No se han publicado resultados de benchmarks completos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 15 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en int8 (bitsandbytes): aproximadamente 8 GB para pesos, con overhead adicional.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en produccion; RTX 4090 (24 GB) suficiente para fp16 en inferencia con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en fp16 e incluso en GPUs de 12-16 GB con cuantizacion int8.
- Opciones de despliegue: `transformers` (soporte oficial desde 4.57.0), bitsandbytes para cuantizacion; vLLM, llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Olmo 3 7B Instruct (este repo, etapa DPO) | 7,3B | no disponible | Apache 2.0 | Hugging Face, pesos abiertos |
| Olmo 3 7B Instruct (final, RLVR) | 7,3B | no disponible | Apache 2.0 | Hugging Face (allenai) |
| Qwen 3 8B (no reasoning) | ~8B | no disponible | no disponible | Hugging Face |
| Olmo 2 7B Instruct | ~7B | no disponible | Apache 2.0 | Hugging Face |
| Granite 3.3 8B Instruct | ~8B | no disponible | no disponible | Hugging Face |

Los datos de rendimiento comparativo no estan disponibles en la informacion proporcionada; la model card referencia estas alternativas pero la tabla de resultados esta truncada.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Es un checkpoint intermedio (DPO) y no la version final con RLVR, por lo que su rendimiento puede ser inferior al de `allenai/Olmo-3-7B-Instruct`.
- Riesgo de alucinacion inherente a modelos de 7B; no apto para decisiones criticas sin verificacion.
- Sesgos potenciales derivados de los datos de pre-entrenamiento (Dolma 3) y post-entrenamiento (Dolci), no cuantificados en la informacion disponible.
- Fecha de corte de conocimiento: diciembre de 2024.
- Licencia Apache 2.0 permite uso comercial, pero Ai2 recomienda seguir sus Responsible Use Guidelines para uso en investigacion y educacion.
- Repositorio espejo sin descargas ni validacion de la comunidad; para produccion se recomienda usar el checkpoint oficial de `allenai`.
- Longitud de contexto no documentada en la informacion disponible; conviene verificarla antes de disenar aplicaciones con ventanas largas.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/moltherm1/olmo-mirror-olmo-3-7b-instruct
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct-DPO
- Modelo final: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Modelo base pre-entrenado: https://huggingface.co/allenai/Olmo-3-1025-7B
- Pagina del proyecto Olmo: https://allenai.org/olmo
- Repositorio Open-Instruct (DPO y RLVR): https://github.com/allenai/open-instruct
- Repositorio OLMo-core (pre-entrenamiento y SFT): https://github.com/allenai/OLMo-core
- Repositorio OLMo-Eval (evaluacion): https://github.com/allenai/OLMo-Eval
- Guias de uso responsable de Ai2: https://allenai.org/responsible-use
- Paper: no disponible (marcado como TBD en la model card)
- arXiv referenciado en tags: arxiv:2512.13961

# rawmodels/Qwen3.8-27B-antislop-GGUF

## Resumen

Qwen3.8-27B-antislop es un modelo de generacion de texto derivado de Qwen3.8-27B y ajustado por AlexWortega para reducir los sesgos estilisticos tipicos de los modelos de lenguaje (lo que el autor denomina "slop": formulas repetitivas, muletillas, estructuras predecibles). El repositorio aqui descrito es la version cuantizada en GGUF publicada por rawmodels, que permite ejecutar el modelo en llama.cpp y entornos compatibles sin necesidad de GPU de gama alta. El modelo cuenta con 26.895.998.464 parametros (aproximadamente 27B) y esta orientado a generacion conversacional y escritura creativa.

La relevancia de esta ficha radica en que el autor situa el modelo en el puesto 4 de 29 en EQ-Bench 4 con un Elo de 1320, por encima de GPT-5.5 y Claude Opus 4.7/4.8 segun la model card. El ajuste se basa en el metodo unslop / RL-XAR de Meta FAIR, y el entorno de recompensa esta publicado como dataset abierto. La licencia Apache 2.0 facilita su uso comercial.

La version GGUF incluye dos cuantizaciones estaticas (Q4_K_M y Q8_0) generadas con llama.cpp en el commit `efe3626`, con hashes verificables en `weights_manifest.json`. El modelo es solo texto y soporta ingles y ruso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles de atencion no disponibles) |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (cuantizaciones estaticas) |
| Idiomas soportados | en, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 45,1 GB) |

## Arquitectura y entrenamiento

El modelo base es AlexWortega/Qwen3.8-27B-antislop, a su vez derivado de Qwen3.8-27B. La model card no detalla la arquitectura interna (numero de capas, tipo de atencion, dimensiones ocultas) ni la composicion exacta del dataset de entrenamiento. El ajuste se presenta como un entrenamiento de refuerzo orientado a estilo, basado en el metodo unslop / RL-XAR de Meta FAIR, cuyo objetivo es penalizar patrones de escritura caracteristicos de LLM y recompensar una prosa mas natural y variada. El entorno de recompensa del RL esta publicado en el dataset `rawmodels/unslop-harbor`, lo que permite reproducir el proceso.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del corpus, ni si hubo fases de SFT, RLHF o DPO adicionales. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal. Las cuantizaciones GGUF se generaron con llama.cpp en el commit `efe3626` y son estaticas, con hashes recogidos en `weights_manifest.json`.

## Capacidades

- Generacion de texto conversacional y de escritura creativa con estilo menos formulaico que el modelo base.
- Redaccion de textos breves y naturales (tweets, parrafos, continuaciones) segun el ejemplo de la model card.
- Generacion multilingue limitada a ingles y ruso.
- Inferencia local mediante llama.cpp y entornos compatibles con GGUF.
- Endpoints compatibles (tag `endpoints_compatible`) para despliegue como servicio.
- No se documenta soporte explicito de tool calling, function calling ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo de razonamiento extendido (thinking mode).
- No se documenta soporte de agentes.

## Casos de uso

- Generacion de contenido para redes sociales: el ajuste antislop reduce las formulas repetitivas tipicas de LLM, lo que resulta util para publicaciones breves (tweets, posts) que deben sonar naturales; el ejemplo de la model card usa una continuacion de tweet con `--temp 0.8`.
- Escritura creativa y ficcion: el modelo esta entrenado para evitar estructuras predecibles, lo que lo hace adecuado para borradores de relatos, dialogos y prosa donde la variedad estilistica importa.
- Reescritura y humanizacion de textos: puede emplearse para reformular borradores generados por otros modelos y eliminar muletillas y patrones repetitivos antes de publicar.
- Asistencia editorial en ingles y ruso: correccion de estilo y propuestas de redaccion para equipos bilingues en esos dos idiomas.
- Prototipado local en estaciones de trabajo: con Q4_K_M (15,41 GiB) se puede ejecutar en GPUs de consumo con suficiente VRAM, lo que permite iterar sin coste de API.
- Despliegue en servicios compatibles con endpoints: el tag `endpoints_compatible` permite servirlo detras de una API para aplicaciones de generacion de texto.
- Experimentacion en investigacion de estilo: el entorno de RL publico (`unslop-harbor`) y el metodo RL-XAR permiten estudiar y reproducir el efecto del ajuste antislop.

## Benchmarks y rendimiento

La model card reporta un resultado de EQ-Bench 4: puesto 4 de 29 con Elo 1320, por encima de GPT-5.5 y Claude Opus 4.7/4.8. No se proporcionan en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar, por lo que no se incluyen.

| Benchmark | Resultado | Referencia |
|---|---|---|
| EQ-Bench 4 | Elo 1320, puesto 4 de 29 | Por encima de GPT-5.5 y Claude Opus 4.7/4.8 (segun model card) |

## Requisitos de hardware

- VRAM estimada para Q8_0: aproximadamente 26,63 GiB de pesos; se recomienda al menos 32 GB de VRAM para dejar margen a la cache KV y al contexto.
- VRAM estimada para Q4_K_M: aproximadamente 15,41 GiB de pesos; se recomienda al menos 20-24 GB de VRAM para inferencia comoda.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 con contexto amplio; RTX 4090 (24 GB) para Q4_K_M; RTX 3090 (24 GB) tambien puede ejecutar Q4_K_M.
- En GPUs de consumo de 16 GB no cabe Q8_0; Q4_K_M queda muy justo y puede requerir offload parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) en el commit `efe3626` o posterior; entornos compatibles con GGUF y endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos tecnicos suficientes sobre modelos comparables en la informacion proporcionada (contexto, benchmarks estandar, licencia de alternativas) para construir una comparativa rigurosa. La unica referencia de rendimiento publicada es el ranking de EQ-Bench 4, donde el modelo se situa por encima de GPT-5.5 y Claude Opus 4.7/4.8 segun la model card, pero sin cifras detalladas por categoria.

| Modelo | Parametros | Contexto | EQ-Bench 4 | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B-antislop (GGUF) | ~27B | no disponible | Elo 1320 (#4 de 29) | apache-2.0 |
| GPT-5.5 | no disponible | no disponible | por debajo segun model card | propietaria |
| Claude Opus 4.7/4.8 | no disponible | no disponible | por debajo segun model card | propietaria |

## Limitaciones y advertencias

- Solo soporta ingles y ruso; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Es un modelo solo texto: no procesa imagenes, audio ni otros modalidades.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que dependan de function calling.
- Riesgo de alucinacion inherente a los modelos de lenguaje; el ajuste de estilo no corrige la veracidad factual.
- El foco en estilo "antislop" puede introducir sesgos estilisticos propios; no se documentan evaluaciones de sesgo social o de seguridad.
- La longitud de contexto no esta publicada, lo que impide planificar tareas de contexto largo con garantias.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene revisar las condiciones del modelo base Qwen3.8-27B y del modelo intermedio AlexWortega/Qwen3.8-27B-antislop antes de desplegar en produccion.
- Las cuantizaciones son estaticas y generadas con un commit concreto de llama.cpp (`efe3626`); versiones muy distintas pueden dar resultados ligeramente diferentes. Verificar hashes con `weights_manifest.json`.
- El ranking EQ-Bench 4 es una evaluacion de estilo y escritura, no una medida global de capacidad; no debe extrapolarse a tareas de codigo o matematicas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/rawmodels/Qwen3.8-27B-antislop-GGUF
- Modelo base (ajustado): https://huggingface.co/AlexWortega/Qwen3.8-27B-antislop
- Demo en Space: https://huggingface.co/spaces/AlexWortega/antislop-27b
- Instrucciones de reproduccion: https://huggingface.co/AlexWortega/Qwen3.8-27B-antislop/blob/main/REPRODUCE.md
- Paper original unslop / RL-XAR (Meta FAIR): https://facebookresearch.github.io/RAM/blogs/unslop/
- Entorno de RL (dataset): https://huggingface.co/datasets/rawmodels/unslop-harbor
- Sitio del autor de las cuantizaciones: https://www.rawmodels.ai

# gbrixi/evo2_7b_vllm

## Resumen

Evo 2 7B (vLLM) es un checkpoint del modelo de lenguaje de ADN Evo 2 desarrollado por el Arc Institute, convertido a safetensors para su uso con el backend vLLM del paquete `evo2`. El modelo original se entrena de forma autorregresiva sobre billones de tokens de ADN y esta disenado para tareas de genomica computacional: prediccion de secuencias, anotacion funcional, generacion de variantes y modelado de efectos de mutaciones. Este checkpoint concreto no introduce cambios en los pesos respecto a `arcinstitute/evo2_7b`; su proposito es habilitar la inferencia de alto rendimiento mediante vLLM en lugar del backend Vortex.

La relevancia de esta publicacion es practica: facilita el despliegue en produccion de un modelo genomico de 6.586 millones de parametros con una licencia permisiva (Apache 2.0) y un formato de pesos estandar (safetensors) compatible con el ecosistema de servidores de inferencia. El modelo base fue entrenado con contextos de hasta 1 millon de tokens, lo que permite procesar regiones genomicas extensas en una sola pasada, una capacidad poco habitual en modelos de lenguaje de dominio cientifico.

Conviene subrayar que se trata de un modelo especializado en secuencias de ADN, no de un modelo conversacional de proposito general. No dispone de pipeline declarado en Hugging Face ni de idiomas naturales documentados, y su tokenizador opera sobre nucleotidos. Su valor reside en la biologia computacional, no en tareas de NLP clasicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StripedHyena 2 (tag `striped_hyena2`); 32 capas |
| Parametros totales | 6.586.388.534 (aproximadamente 7B) |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | hasta 1.000.000 de tokens (entrenado); variante base con 8.192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias de ADN, no de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint convertido para backend vLLM) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura StripedHyena 2, una familia de modelos hibridos que combina capas de convolucion larga con mecanismos de atencion, disenada para secuencias extremadamente largas con coste computacional subcuadratico. El checkpoint consta de 32 capas y 6.586 millones de parametros. Segun la model card, el modelo se entrena de forma autorregresiva sobre billones de tokens de ADN, con una ventana de contexto de hasta 1 millon de tokens; existen tambien variantes base entrenadas con 8.192 tokens de contexto.

El dataset de entrenamiento es OpenGenome2 (`arcinstitute/opengenome2`). No se detalla en la informacion disponible la composicion exacta del corpus, el numero preciso de tokens ni si se aplicaron fases de RLHF o DPO. La innovacion tecnica principal de esta publicacion es la conversion de los pesos al formato safetensors para permitir la inferencia con vLLM, lo que facilita el despliegue en servidores de alto throughput frente al backend Vortex original.

## Capacidades

- Modelado autorregresivo de secuencias de ADN: prediccion del siguiente nucleotido y puntuacion de verosimilitud de secuencias genomicas.
- Generacion de secuencias de ADN condicionada por contexto largo, gracias a ventanas de hasta 1 millon de tokens.
- Evaluacion de variantes y mutaciones mediante comparacion de verosimilitudes sobre secuencias de referencia y alternativas.
- Anotacion funcional de regiones genomicas y deteccion de patrones conservados.
- Capacidad de trabajar con contextos genomicos extensos (variantes de 262.144 tokens y de 1 millon de tokens disponibles en la familia Evo 2).
- Soporte de inferencia de alto rendimiento mediante el backend vLLM del paquete `evo2`.
- No dispone de soporte documentado de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- No se documentan capacidades multilingues en lenguaje natural; el dominio es exclusivamente secuencial genomico.

## Casos de uso

- Prediccion de efectos de variantes genomicas: el modelo puntua la verosimilitud de secuencias con y sin una mutacion concreta, lo que permite priorizar variantes candidatas en estudios de asociacion y diagnostico genetico.
- Anotacion de genomas recien secuenciados: con contextos de hasta 1 millon de tokens, puede procesar regiones extensas y ayudar a identificar elementos regulatorios o regiones codificantes.
- Diseno de secuencias sinteticas: generacion condicionada de fragmentos de ADN con propiedades deseadas, util en biologia sintetica y diseno de constructos.
- Analisis de genomas virales: existe una variante especifica afinada en genomas de Microviridae, lo que ilustra el uso del modelo para caracterizar familias virales completas.
- Investigacion en genomica comparativa: evaluacion de conservacion evolutiva entre secuencias homologas mediante puntuaciones de verosimilitud.
- Despliegue en pipelines bioinformaticos de produccion: al estar empaquetado para vLLM con pesos safetensors, puede integrarse en servicios de inferencia con requisitos de throughput alto y servir lotes de secuencias de forma concurrente.
- Filtrado y priorizacion en cribados masivos: puntuacion rapida de miles de candidatos genomicos antes de validacion experimental en laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 13-14 GB solo para pesos, mas memoria para cache KV y estados de secuencia; en la practica se recomienda un minimo de 24 GB para contextos moderados.
- Para contextos de hasta 1 millon de tokens, los requisitos de memoria crecen de forma significativa; se recomienda hardware con 80 GB o mas por GPU y paralelismo entre GPUs.
- GPU recomendadas: A100 80 GB o H100 para contextos largos y despliegue con vLLM; RTX 4090 (24 GB) puede ser suficiente para contextos cortos en BF16.
- Cabe en GPU de consumo (RTX 4090, RTX 3090 de 24 GB) para secuencias cortas o medias; para ventanas de 1 millon de tokens no es viable en hardware de consumo.
- Opciones de despliegue: backend vLLM mediante el paquete `evo2` (`Evo2('evo2_7b', backend='vllm')`); el backend Vortex requiere el checkpoint original `arcinstitute/evo2_7b`. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| Evo 2 7B (vLLM) | 6,59B | hasta 1M tokens | Apache 2.0 | safetensors, backend vLLM |
| Evo 2 20B (vLLM) | 20B | hasta 1M tokens | Apache 2.0 | safetensors, backend vLLM |
| Evo 2 7B base (vLLM) | 7B | 8.192 tokens | Apache 2.0 | safetensors, backend vLLM |
| Evo 2 1B base (vLLM) | 1B | 8.192 tokens | Apache 2.0 | safetensors, backend vLLM |
| Evo 2 7B (Vortex) | 7B | hasta 1M tokens | Apache 2.0 | checkpoint original, backend Vortex |

No se dispone de datos de rendimiento comparativo entre estos checkpoints en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de dominio especifico: no es un modelo de lenguaje natural y no debe emplearse para tareas de NLP, dialogo o generacion de texto convencional.
- Riesgo de alucinacion en sentido biologico: las secuencias generadas pueden ser plausibles estadisticamente pero no funcionales o no existir en la naturaleza; requieren validacion experimental.
- Sesgos de datos: el comportamiento depende de la composicion de OpenGenome2, que no se detalla; puede estar infrarrepresentado en linajes o organismos concretos.
- Limitaciones de contexto: aunque el modelo se entrena hasta 1 millon de tokens, el rendimiento practico en ventanas muy largas puede degradarse y el coste de memoria es elevado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones de los datos de entrenamiento subyacentes y de las herramientas asociadas (paquete `evo2`).
- Este checkpoint es una conversion de pesos para vLLM; para el backend Vortex debe usarse el repositorio original `arcinstitute/evo2_7b`.
- No se documentan garantias de calibracion ni evaluaciones independientes en esta ficha; la validacion en produccion corre a cargo del integrador.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/gbrixi/evo2_7b_vllm
- Modelo base: https://huggingface.co/arcinstitute/evo2_7b
- Checkpoint Evo 2 20B vLLM: https://huggingface.co/gbrixi/evo2_20b_vllm
- Checkpoint Evo 2 7B base vLLM: https://huggingface.co/gbrixi/evo2_7b_base_vllm
- Checkpoint Evo 2 1B base vLLM: https://huggingface.co/gbrixi/evo2_1b_base_vllm
- Checkpoint Evo 2 7B 262k vLLM: https://huggingface.co/gbrixi/evo2_7b_262k_vllm
- Checkpoint Evo 2 7B Microviridae vLLM: https://huggingface.co/gbrixi/evo2_7b_microviridae_vllm
- Repositorio GitHub de Evo 2: https://github.com/ArcInstitute/evo2
- Paper (bioRxiv): https://www.biorxiv.org/content/10.1101/2025.02.18.638918v1
- Dataset OpenGenome2: https://huggingface.co/datasets/arcinstitute/opengenome2

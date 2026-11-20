# ricursiveAI/Ripple-65B-Base-Preview

## Resumen

Ripple-65B Base Preview es un modelo de lenguaje de tipo Transformer denso desarrollado por Ricursive Intelligence, presentado como el checkpoint base (solo preentrenamiento) de su familia Ripple. Con 64.782.689.360 parámetros reales según los pesos en safetensors, se entrenó desde cero sobre 12 billones de tokens de texto y código predominantemente en inglés, con una longitud de secuencia de 8K durante el preentrenamiento y soporte declarado de hasta 1M de tokens de contexto en la versión instructiva. Su rasgo diferencial es que apuesta por una arquitectura densa en lugar de Mixture-of-Experts, con el objetivo de reducir la complejidad de infraestructura de entrenamiento y servicio sin sacrificar rendimiento en razonamiento y tareas agénticas.

El modelo emplea una proporción "thin-and-deep": un `d_model` estrecho de 5120 con 80 capas totales, y abandona la arquitectura tipo Llama de Olmo 3 en favor de una arquitectura tipo Gemma 3N para mejorar la estabilidad del entrenamiento a escala. Incorpora sobreaprovisionamiento de cabezas de atención, mayor proporción de capas SWA frente a globales, ventana SWA reducida, clipping de activaciones en la FFN, atención con compuertas, NoPE global y value residuals. Según el autor, el modelo fue codesarrollado para entrenarse y servirse de forma eficiente en hardware NVIDIA, alcanzando un 40% de MFU durante preentrenamiento y postentrenamiento con sharding simple, sin kernels personalizados y sin cuantización (BF16).

La relevancia de este checkpoint radica en que es la base sobre la que se construye la versión instructiva Ripple-65B Preview, que según la model card obtiene 80.52 en TerminalBench 2.1, por encima de modelos open-weight estadounidenses mucho mayores como Reflection Beam 501B (80.1), Meta Muse Spark Open 816B (76.4), Thinking Machines Inkling 975B (63.8) y NVIDIA Nemotron 3 Ultra 550B (56.4). Este repositorio contiene únicamente el modelo base, sin midtraining ni datos sintéticos de QA, por lo que no está pensado para uso conversacional directo sino como punto de partida para ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (estilo Gemma 3N), proporción thin-and-deep, 80 capas, d_model 5120, SWA + atención global, NoPE global, gated attention, value residuals, FFN activation clipping |
| Parametros totales | 64.782.689.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8K durante preentrenamiento; la familia declara soporte de hasta 1M en la versión instructiva (no confirmado para este checkpoint base) |
| Tipos de cuantizacion | No disponible para este repo (existe un checkpoint NVFP4 de la versión instructiva en otro repositorio) |
| Idiomas soportados | Predominantemente inglés y código (corpus de preentrenamiento); lista oficial de idiomas no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

Ripple-65B Base Preview es un Transformer denso con 80 capas y un `d_model` de 5120, diseñado con una relación de aspecto "thin-and-deep" que prioriza profundidad sobre anchura. Frente a la arquitectura tipo Llama de su baseline Olmo 3, el equipo adoptó una arquitectura tipo Gemma 3N para mejorar la estabilidad del entrenamiento a escala. Para reforzar el razonamiento, sobreaprovisiona el número de cabezas de atención, incrementa la proporción de capas con atención de ventana deslizante (SWA) frente a las globales y reduce la ventana SWA para compensar el coste adicional. Además, incorpora clipping de activaciones en la FFN, atención con compuertas, NoPE global y value residuals.

El preentrenamiento se realizó desde cero sobre 12 billones de tokens de un corpus textual (sin multimodal) predominantemente en inglés y código, con secuencia de 8K, 877.500 pasos y un batch size que escaló de 1408 a 3072. Este checkpoint es solo de preentrenamiento: no ha pasado por midtraining, SFT ni datos sintéticos de QA. La receta completa de la familia incluye midtraining (200B tokens, 64K de secuencia), long context (6.5B tokens, 2M de secuencia), SFT (183B tokens, 128K), long context SFT (13.5B tokens, 2M) y RL (700 pasos, 128K, batch 2048), pero esas etapas corresponden a la versión instructiva, no a este repositorio. Según el autor, la escalera de modelos Ripple v1 mejora la eficiencia de cómputo en código 16x respecto a la de Olmo 3, con ventaja creciente hasta 55x en el modelo completo.

## Capacidades

- Generación de texto y modelado de lenguaje base: al ser un checkpoint solo de preentrenamiento, su capacidad principal es la continuación de texto y el modelado autoregresivo, no la conversación instruida.
- Razonamiento y código: el corpus de entrenamiento está dominado por inglés y código, y la arquitectura está optimizada para tareas de razonamiento y agénticas según el autor.
- Capacidades latentes para ajuste fino: al no haber pasado por SFT ni RL, no incorpora de serie formato de instrucciones, tool calling ni modo de pensamiento; estas capacidades se documentan para la versión instructiva Ripple-65B Preview.
- Multilingüe: no disponible; el corpus es predominantemente inglés, por lo que el rendimiento en otros idiomas no está garantizado ni documentado.
- Sin soporte declarado de visión, audio ni otras modalidades en este checkpoint.

## Casos de uso

- Punto de partida para ajuste fino supervisado: equipos que quieran entrenar su propio modelo instructivo pueden partir de este checkpoint base y aplicar SFT sobre dominios concretos, aprovechando que no arrastra sesgos de formato conversacional previo.
- Investigación en recetas de preentrenamiento: útil para estudiar el efecto de arquitecturas densas thin-and-deep, SWA, NoPE global y value residuals en la estabilidad y eficiencia del entrenamiento a escala de 65B.
- Modelado de lenguaje para código: dado el peso del código en el corpus, sirve como base para tareas de completado y generación de código tras un ajuste fino específico.
- Continuación de texto y generación de documentos técnicos: puede emplearse en pipelines de generación de texto largo en inglés donde no se requiera formato instructivo.
- Evaluación comparativa de arquitecturas: permite comparar el rendimiento de una arquitectura densa moderna frente a modelos MoE de tamaño similar en tareas de razonamiento y código.
- Base para destilación o experimentos de decodificación especulativa: su tamaño de 65B y su licencia Apache 2.0 facilitan su uso como profesor o como modelo de referencia en experimentos de eficiencia de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint base en la información disponible. La model card incluye una tabla de benchmarks de la versión instructiva Ripple-65B Preview (TerminalBench 2.1: 80.52; comparaciones con Nemotron 3 Ultra 550B, Inkling 975B, Muse Spark Open 816B y Reflection Beam 501B), pero la tabla está truncada en la información proporcionada y corresponde al modelo instructivo, no a este repositorio base. El autor declara 250 tok/s en 2xB200 con batch=8 antes de cuantización o kernels personalizados para la familia, dato no verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 130 GB solo para pesos (64.782.689.360 parámetros × 2 bytes), más overhead de activaciones y KV cache.
- Cuantización: no se ofrece un checkpoint cuantizado en este repositorio; la versión instructiva dispone de NVFP4 en otro repo, lo que reduciría el requisito de memoria de forma sustancial.
- GPU recomendadas: para BF16 se requieren múltiples aceleradores de datacenter (por ejemplo, 2× B200 según el dato de throughput del autor, o configuraciones equivalentes con A100/H100 de 80 GB en paralelo).
- Hardware de consumo: el autor afirma que el modelo cabe en hardware de consumo como el NVIDIA DGX Spark, lo que en la práctica implica el checkpoint cuantizado (NVFP4) más que el BF16.
- Opciones de despliegue: al usar `custom_code`, es necesario cargar con `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: 250 tok/s en 2× B200 con batch=8 antes de cuantización o kernels personalizados, según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | TerminalBench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B Preview (instruct) | 65B denso | hasta 1M (declarado) | 80.52 | Apache 2.0 | Pesos abiertos en HF |
| Reflection Beam 501B | 501B | no disponible | 80.1 | no disponible | Pesos abiertos (US) |
| Meta Muse Spark Open 816B | 816B | no disponible | 76.4 | no disponible | Pesos abiertos (US) |
| Thinking Machines Inkling 975B | 975B | no disponible | 63.8 | no disponible | Pesos abiertos (US) |
| NVIDIA Nemotron 3 Ultra 550B | 550B | no disponible | 56.4 | no disponible | Pesos abiertos (US) |

Los datos de la comparativa proceden de la model card del autor y corresponden a la versión instructiva, no a este checkpoint base. No se dispone de datos independientes que permitan verificar la comparación.

## Limitaciones y advertencias

- Es un checkpoint solo de preentrenamiento: no está ajustado para instrucciones, diálogo ni tool calling, por lo que su uso directo en producción conversacional no es adecuado.
- Riesgo de alucinación y de generar contenido sesgado o tóxico propio de un modelo base sin alineamiento.
- Corpus predominantemente en inglés y código: el rendimiento en castellano u otros idiomas no está documentado y probablemente sea limitado.
- No se han publicado evaluaciones de sesgo, seguridad ni robustez para este checkpoint.
- El uso de `custom_code` obliga a ejecutar código remoto del autor (`trust_remote_code=True`), lo que introduce un riesgo de seguridad que debe evaluarse en entornos de producción.
- Aunque la licencia es Apache 2.0, conviene revisar el fichero LICENSE del repositorio por si incluye términos adicionales.
- Los benchmarks citados corresponden a la versión instructiva y fueron generados por el propio autor; la replicabilidad de evaluaciones agénticas modernas es reconocidamente difícil, como admite la propia model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ricursiveAI/Ripple-65B-Base-Preview
- Versión instructiva BF16: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Versión instructiva NVFP4: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- Versión instructiva DFlash2: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Blog de lanzamiento: https://www.ricursive.com/ripple
- Licencia: https://huggingface.co/ricursiveAI/Ripple-65B-Preview/blob/main/LICENSE

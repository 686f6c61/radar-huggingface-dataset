# open-athena/tinker-qwen3.5-9b-native-sft-step-2888

## Resumen

`open-athena/tinker-qwen3.5-9b-native-sft-step-2888` no es un modelo completo, sino un adaptador LoRA en formato PEFT publicado por el usuario open-athena y pensado para cargarse sobre `Qwen/Qwen3.5-9B-Base`. Se trata del ultimo checkpoint durable de un run de ajuste supervisado (SFT) con Axolotl sobre el dataset OpenThoughts3-1.2M, detenido en el paso 2.888 de los 3.000 planificados despues de que una evaluacion OPD independiente de un solo paso alcanzase el objetivo de AIME. El autor advierte explicitamente de que ese gate OPD no partio de estos pesos, sino del checkpoint del paso 400, por lo que el adaptador debe evaluarse por si mismo.

La relevancia de la ficha es doble. Por un lado, documenta una practica cada vez mas comun en la comunidad abierta: publicar adaptadores intermedios de bajo rango (aqui r=128, alpha=1) en lugar de pesos fusionados, con trazabilidad mediante hashes SHA-256 y conversiones reproducibles. Por otro, ilustra un problema de higiene experimental: el adaptador se convirtio a un formato compatible con Qwen3.5 estandar mediante el conversor `fuse_split_qkv_adapter` fijado en el commit `d5ae94ae7446d3f3fc4ebc8d97fd9d00319f9811`, que fusiona los factores LoRA de Q/K/V sin reentrenar, pero no existe ninguna evaluacion AIME del paso 2.888.

El tamano del repositorio es de 7,3 GB y contiene el adaptador en safetensors junto con su configuracion. No tiene descargas ni likes en el momento de la consulta, y la model card no declara idiomas soportados ni pipeline. Es, en la practica, un artefacto de investigacion reproducible mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`; arquitectura interna del base no disponible en la informacion proporcionada |
| Parametros totales | 9B en el modelo base; numero de parametros del adaptador no disponible (rango LoRA 128, alpha 1) |
| Parametros activos | No aplica (no es un modelo MoE); no disponible |
| Longitud de contexto | 16.384 tokens durante el entrenamiento; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | No disponible; el adaptador se publica en precision completa (safetensors). La cuantizacion aplicaria al modelo base y no esta documentada |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`), formato PEFT |
| Version del modelo base | `Qwen/Qwen3.5-9B-Base`, revision `68c46c4b3498877f3ef123c856ecfde50c39f404` |
| Tamano del repositorio | 7,3 GB |
| Libreria | peft |
| Dataset de entrenamiento | `open-thoughts/OpenThoughts3-1.2M`, revision `61bcf9d4eb38b30295efc2021227a63cc5bb34c8` |
| Fecha de creacion | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 128 y alpha 1 entrenado con Axolotl sobre el modelo base Qwen3.5-9B. La configuracion de entrenamiento documentada incluye batch global 128, longitud de secuencia de 16.384 tokens, learning rate 1e-3 con schedule lineal y ocho GPU H100. El SFT se realizo sobre OpenThoughts3-1.2M, del que se seleccionaron 384.000 ejemplos mediante un shuffle determinista en streaming (semilla 0, buffer 384.000). No se menciona en la model card el uso de RLHF, DPO u otra fase de alineamiento posterior; el pipeline descrito es exclusivamente SFT supervisado.

La innovacion tecnica relevante no esta en el entrenamiento sino en la conversion: los factores LoRA originales se publicaron en un formato con Q/K/V separados y se convirtieron a formato PEFT compatible con Qwen3.5 estandar mediante el conversor `fuse_split_qkv_adapter` fijado en el commit de Axolotl `d5ae94ae7446d3f3fc4ebc8d97fd9d00319f9811`. El autor indica que el conversor fusiona los factores de forma exacta y que no reentrena el modelo. Se publican los hashes SHA-256 de los ficheros fusionados (`adapter_model.safetensors` = `5e3df847c0ba49f3b7935e8bd703fde0f54c36bfe98f32544a91254fc9a5d527`) y de los originales sin fusionar, lo que permite verificar la conversion. No se documentan innovaciones tipo decodificacion especulativa, atencion lineal ni arquitecturas hibridas asociadas al adaptador.

## Capacidades

- Ajuste supervisado orientado a razonamiento y cadenas de pensamiento, dado que el dataset de entrenamiento (OpenThoughts3-1.2M) es un corpus de trazas de razonamiento. La model card no enumera capacidades explicitas, por lo que el detalle funcional depende del modelo base.
- Generacion de texto y respuesta a instrucciones heredada del modelo base Qwen3.5-9B-Base.
- Razonamiento matematico: es el unico eje evaluado por el autor, mediante AIME 2024 en el checkpoint previo del paso 2.800.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada; dependera del modelo base.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Modo thinking explicito, vision o audio: no disponibles; no se mencionan en la documentacion.
- Integrable en pipelines PEFT/Axolotl mediante `merge_and_unload` para fusionar el adaptador con el base y exportar a safetensors o GGUF.

## Casos de uso

- Reproducibilidad de experimentos de SFT: el adaptador, junto con el manifiesto `tinker-repro` y los hashes SHA-256, permite reproducir y verificar un run de Axolotl sobre OpenThoughts3 con semilla y revisiones fijadas. Es util para equipos que auditan pipelines de ajuste.
- Investigacion sobre checkpoints intermedios: comparar el paso 2.888 con el paso 400 y con el paso 2.800 ayuda a estudiar como evoluciona la capacidad de razonamiento a lo largo del entrenamiento y si el checkpoint final aporta mejoras reales.
- Punto de partida para fases posteriores de alineamiento: al ser un adaptador PEFT sobre un base conocido, se puede continuar con DPO, RLHF u OPD sin reentrenar desde cero, siempre teniendo en cuenta que el autor indica que el gate OPD partio del paso 400 y no de estos pesos.
- Prototipado de modelos de razonamiento en laboratorio: cargando el adaptador sobre Qwen3.5-9B-Base en una GPU con suficiente VRAM se puede evaluar cualitativamente la calidad de las trazas generadas antes de invertir en un run completo.
- Generacion de datos sinteticos de razonamiento: un modelo afinado sobre OpenThoughts3 puede emplearse para producir cadenas de pensamiento candidatas que luego se filtren y reutilicen en un ciclo de destilacion o automejora.
- Estudio de conversion de formatos LoRA: el caso ilustra como fusionar factores Q/K/V separados a un adaptador PEFT estandar, un escenario util para equipos que migran entre frameworks de entrenamiento.
- Uso docente: sirve como ejemplo realista de publicacion de checkpoints con trazabilidad criptografica y advertencias explicitas sobre que metricas no deben atribuirse a que pesos.

## Benchmarks y rendimiento

| Benchmark | Checkpoint | Resultado | Notas |
|---|---|---|---|
| AIME 2024 (una muestra) | SFT step 2.800 | 18/30 | Incluye un truncamiento por longitud. No evaluado sobre los pesos del paso 2.888 |
| AIME 2024 (una muestra) | SFT step 2.888 | No disponible | El autor indica explicitamente que no se realizo evaluacion de este checkpoint |
| MMLU, HumanEval, GSM8K u otros | Cualquiera | No disponible | No publicados en la informacion proporcionada |

El autor advierte de forma explicita: «Do not attribute that score to these weights». Por tanto, el 18/30 de AIME 2024 corresponde al paso 2.800 y no debe presentarse como rendimiento del adaptador aqui documentado.

## Requisitos de hardware

- El adaptador no se puede ejecutar de forma autonoma: requiere cargar `Qwen/Qwen3.5-9B-Base` en la revision `68c46c4b3498877f3ef123c856ecfde50c39f404`.
- VRAM estimada para el modelo base (estimacion a partir del tamano de 9B parametros, no publicada por el autor): aproximadamente 18 GB en bf16/fp16, en torno a 10-11 GB en cuantizacion de 8 bits y en torno a 5-6 GB en 4 bits, mas el overhead de contexto (hasta 16.384 tokens) y de la KV cache.
- GPU recomendadas: el entrenamiento se realizo con ocho H100. Para inferencia, una A100 80 GB o H100 80 GB ofrecen margen amplio; una RTX 4090 de 24 GB es suficiente en bf16 para el base con contextos moderados y en cuantizacion de 4 bits con contextos largos.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, RTX 4090) con cuantizacion de 8 o 4 bits, o en bf16 con contextos reducidos.
- Opciones de despliegue: PEFT y Transformers para cargar el adaptador directamente; `merge_and_unload` para fusionarlo con el base; vLLM o TGI una vez fusionado el modelo completo; llama.cpp u Ollama tras convertir a GGUF. El autor no documenta ninguna de estas rutas especificamente.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| tinker-qwen3.5-9b-native-sft-step-2888 | 9B (base) + LoRA r=128 | 16.384 en entrenamiento; nativo del base no disponible | Apache-2.0 | safetensors (PEFT) | HuggingFace, 0 descargas |
| tinker-qwen3.5-9b-native-sft-step-400 | 9B (base) + LoRA | No disponible | No disponible en la informacion proporcionada | safetensors (PEFT) | HuggingFace, publicado por el mismo autor |
| Qwen/Qwen3.5-9B-Base (sin adaptador) | 9B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | safetensors | HuggingFace |

No se dispone de datos suficientes para comparar con alternativas de otros autores en la misma categoria (adaptadores de razonamiento sobre modelos de ~9B). Cualquier comparacion de rendimiento quedaria limitada por la ausencia de benchmarks publicados para el paso 2.888.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo base en la revision exacta indicada, el adaptador no es utilizable.
- Ausencia de evaluacion del checkpoint publicado: el paso 2.888 no tiene evaluacion AIME. El dato de 18/30 pertenece al paso 2.800 y el autor prohibe atribuirlo a estos pesos.
- Origen del gate OPD: el gate que motivo la parada del run partio del adaptador del paso 400, no de este checkpoint, lo que complica la interpretacion de su calidad final.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; es un riesgo inherente a los modelos de ~9B afinados sobre corpus de razonamiento.
- Sesgos conocidos: no documentados. El dataset OpenThoughts3-1.2M condiciona la distribucion de los datos, pero no se publica analisis de sesgo.
- Idiomas: no se declaran idiomas soportados ni se incluye evaluacion multilingue, por lo que el comportamiento fuera del ingles (idioma presumible del dataset, no confirmado) es incierto.
- Longitud de contexto: el entrenamiento uso 16.384 tokens; no se garantiza que el modelo base mantenga calidad en toda esa ventana tras el ajuste LoRA, y el unico truncamiento observado en AIME sugiere que las respuestas largas pueden cortarse.
- Licencia: Apache-2.0 para el adaptador, pero el uso comercial tambien queda sujeto a la licencia del modelo base, que no se detalla en la informacion proporcionada.
- Madurez: 0 descargas y 0 likes, sin pipeline declarado ni casos de uso validados por terceros. No se recomienda su uso en produccion sin una evaluacion propia.
- Verificacion: aunque se publican hashes SHA-256 de los ficheros fusionados y originales, la cadena de conversion depende de un commit concreto de un fork de Axolotl, lo que anade dependencia de una version especifica del codigo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/tinker-qwen3.5-9b-native-sft-step-2888
- Checkpoint previo del mismo run (paso 400): https://huggingface.co/open-athena/tinker-qwen3.5-9b-native-sft-step-400
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base (revision `68c46c4b3498877f3ef123c856ecfde50c39f404`)
- Dataset de SFT: `open-thoughts/OpenThoughts3-1.2M`, revision `61bcf9d4eb38b30295efc2021227a63cc5bb34c8`
- Commit del conversor de Axolotl: `d5ae94ae7446d3f3fc4ebc8d97fd9d00319f9811`
- Manifiesto del experimento: bundle `tinker-repro` citado en la model card (ubicacion no especificada)
- La busqueda web realizada no ha devuelto enlaces relevantes: los resultados obtenidos corresponden a sitios corporativos y deportivos sin relacion con el modelo.

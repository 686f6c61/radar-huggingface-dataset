# johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-ht4-HGN

## Resumen

ThinkingCap-Qwen3.8-Flash-Next-ht4-HGN es un pack de pesos en formato nativo Halogen `.hgn` generado por el usuario johnlockejrr a partir del fine-tune BF16 `bottlecapai/ThinkingCap-Qwen3.8-Flash-Next`, que a su vez deriva del modelo base `Qwen/Qwen3.8-Flash-Next`. La conversión emplea el perfil `ht4` de la herramienta `bf16-to-hgn` 0.1.0, que recuantiza todos los expertos enrutados del trunk a HT4 (sin mezclar HT3 en capas impares, a diferencia del pack HT43 hermano). No es un reentrenamiento ni una variante abliterada: es una requantización del BF16 original.

El modelo subyacente es un Mixture-of-Experts de la familia Qwen 3.8 con modo de razonamiento extendido ("thinking"), y ThinkingCap es el post-entrenamiento de BottleCap AI orientado a reducir la longitud de la cadena de pensamiento: según el autor upstream, un ~38,5 % menos de tokens de thinking de media (rango 22–51 % según benchmark) con una precisión de ~88,8 % frente a ~89,8 % del base. El atractivo de este pack es servir esa variante con menor huella de memoria mediante cuantización HT4 y decodificación especulativa MTP embebida.

La relevancia es operativa: el repo ocupa 117,3 GB y el payload ronda los 109 GiB, pero solo es utilizable en el runtime Halogen (concretamente con el loader `qwen3.8-flash-next-ht4`). No carga en Transformers, vLLM ni llama.cpp, lo que restringe su uso a infraestructuras que ya exploten halogen-flash-server. La licencia es la Qwen Community License 1.0, con las obligaciones que ello implica para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, base Qwen3.8-Flash-Next; pesos en formato Halogen HGN con expertos enrutados HT4 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HT4 en todos los expertos enrutados del trunk; mixers hyper-connection Q8G64; MTP y torre de visión segun politica v2/HT43; n-gram table propia |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en el Hub) |
| Formato de pesos | Halogen `.hgn` nativo (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de la familia Qwen 3.8 (Flash-Next), con expertos enrutados por capa, mecanismo de hyper-connection y un cabezal MTP (multi-token prediction) embebido que habilita decodificación especulativa. ThinkingCap añade un post-entrenamiento de BottleCap AI que acorta el razonamiento: el autor reporta ~38,5 % menos tokens de thinking con una caída de precisión de aproximadamente un punto (88,8 % vs 89,8 %). No se detalla en la información disponible la composición del dataset de post-entrenamiento ni si se usaron RLHF o DPO.

Este pack concreto no entrena nada: convierte los 131 shards safetensors BF16 en pesos `.hgn` con la herramienta `bf16-to-hgn` 0.1.0, perfil `ht4`, política `bf16-hgn-rtn-nf4-signed-rms-trellis-v1` y calidad por defecto (sin calibración). Los expertos HT4 aplican escalas row-RMS con signo por experto; los mixers usan Q8G64. La verificación reportó `provenance_attested: true` con 1.658 tensores de origen, 2.349 de salida y 117.265.782.428 bytes de payload. El pack incluye además una tabla n-gram obligatoria (47,68 GiB) y una torre de visión opcional (0,84 GiB), cuyos hashes coinciden con el pack v2 del mismo autor; solo `model.hgn` es específico de HT4.

## Capacidades

- Generación de texto con modo de razonamiento ("thinking") acortado respecto al base, orientado a reducir coste de tokens de salida.
- Razonamiento multi-paso y tareas de agente, con soporte de tool calling evaluado por el autor (score 96,3 ± 0,6 sobre 100 en tool-eval-bench v3.0.1.dev10).
- Procesamiento de visión mediante la torre opcional, activable con `HALOGEN_VISION_TOWER=1`.
- Decodificación especulativa vía MTP embebido y, opcionalmente, un draft head externo (`qwen38-flash-next-drafter-r2-ht4.hgn`) no incluido en el pack.
- Tabla n-gram integrada para acelerar la generación.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Generación de código y matemáticas: no documentadas explícitamente para este pack.

## Casos de uso

- Asistentes de razonamiento con coste controlado: el acortamiento de thinking (~38,5 % menos tokens) reduce latencia y facturación en cargas de razonamiento encadenado, siempre que se despliegue sobre halogen-flash-server con el loader `qwen3.8-flash-next-ht4`.
- Agentes con tool calling: el score de 96,3/100 en tool-eval-bench lo hace apto para orquestación de funciones en pipelines internos, con la salvedad de que la evaluación la publica el propio autor del pack.
- Servicio de inferencia con presupuesto de VRAM ajustado: la cuantización HT4 reduce la huella frente al BF16 original (117,3 GB de repo), útil en nodos con memoria limitada que ya operen Halogen.
- Procesamiento de documentos con imagen: activando la torre de visión (0,84 GiB) puede abordar tareas de extracción y descripción de contenido visual junto a texto.
- Generación acelerada por n-gram y MTP: escenarios de completado repetitivo o plantillas (informes, resúmenes estructurados) donde la tabla n-gram y la predicción multi-token mejoran el throughput.
- Evaluación comparativa de cuantizaciones: al existir packs hermanos v2, HT43, RCO calibrado y abliterated, sirve para medir el impacto de HT4 frente a HT3/I4R en la misma infraestructura.
- Despliegues air-gapped: al ser pesos locales en formato propio, encaja en entornos sin acceso a repositorios de modelos estándar, montando el checkpoint en el contenedor Halogen.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| tool-eval-bench v3.0.1.dev10 (Halogen, temp 1.0, 3 trials) | 96,3 ± 0,6 / 100 (mediana 96,0; IC 95 % [96,0, 97,0]) | Medido por el autor del pack sobre este HT4 |
| Precisión upstream ThinkingCap vs base | ~88,8 % vs ~89,8 % | Dato del autor upstream, agregado |
| Reducción de tokens de thinking | ~38,5 % de media (22–51 % por benchmark) | Dato del autor upstream |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. El único dato medido sobre este pack es el de tool-eval-bench, sin comparación directa contra los packs v2 o HT43.

## Requisitos de hardware

- VRAM estimada: el payload total ronda los 109 GiB (`model.hgn` 60,69 GiB + n-gram 47,68 GiB + visión 0,84 GiB); se requiere un nodo con al menos ~110 GiB de memoria para cargar todo, o ~61 GiB si se omite la tabla n-gram (no recomendado: el autor la marca como obligatoria).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, un solo H100 80 GB no cubre el conjunto completo, y se necesitarían configuraciones multi-GPU o nodos con memoria unificada grande.
- Consumer GPU: no cabe en RTX 4090 (24 GB) ni en ninguna GPU de consumo actual con el pack completo.
- Despliegue: exclusivamente halogen-flash-server (o runtime Halogen equivalente) con loader `qwen3.8-flash-next-ht4`; no compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers.
- Latencia y throughput: no disponibles; el pack incorpora MTP y n-gram para acelerar, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Formato | Cuantización de expertos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThinkingCap-ht4-HGN (este) | Halogen `.hgn` | HT4 en todas las capas | no disponible | qwen-community-license-1.0 | Hub, solo runtime Halogen |
| ThinkingCap HT43-HGN | Halogen `.hgn` | HT4 pares / HT3 impares | no disponible | qwen-community-license-1.0 | Hub, runtime Halogen |
| ThinkingCap v2-HGN | Halogen `.hgn` | I4R | no disponible | qwen-community-license-1.0 | Hub, runtime Halogen |
| ThinkingCap BF16 (upstream) | safetensors | BF16 | no disponible | qwen-community-license-1.0 | Hub, ecosistema estándar |

La comparación con modelos de otras familias (por ejemplo, otros MoE de Qwen o de terceros) no está disponible en la información proporcionada, y los parámetros totales y activos del modelo base no se detallan, por lo que no es posible una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Formato propietario: los pesos `.hgn` no cargan en Transformers, vLLM, llama.cpp ni herramientas equivalentes; sin halogen-flash-server el pack es inutilizable.
- Compatibilidad de loader estricta: debe usarse el loader `qwen3.8-flash-next-ht4`; los loaders v2/I4R y HT43 no son válidos.
- Dependencia de la tabla n-gram: `qwen38-flash-next-ngram.hgn` es obligatoria y debe permanecer junto al checkpoint.
- Calidad no calibrada: la conversión usa la política por defecto (`--quality` sin calibrar), lo que puede degradar la fidelidad frente al BF16 en tareas sensibles.
- Benchmarks limitados: solo hay un resultado de tool-eval publicado por el propio autor del pack; no hay MMLU, HumanEval ni comparativas independientes.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan mitigaciones específicas en este pack.
- Sesgos: no documentados en la información disponible.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar calidad fuera del inglés sin evaluación propia.
- Licencia: la Qwen Community License 1.0 impone condiciones para uso comercial (atribución y restricciones de la familia Qwen); conviene revisar el archivo `LICENSE` antes de producción.
- Procedencia: pack de terceros (johnlockejrr), no oficial de BottleCap AI ni de Qwen; 30 descargas y 1 like en el momento de la consulta implican escasa validación comunitaria.

## Enlaces

- Pack en Hugging Face: https://huggingface.co/johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-ht4-HGN
- Modelo base del pack (BF16): https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime Halogen: https://github.com/peonist-ai/halogen-flash-server
- Pack hermano v2 (I4R): https://huggingface.co/johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-HGN
- Pack hermano HT43: https://huggingface.co/johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-ht43-HGN
- Pack calibrado RCO: https://huggingface.co/johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-calibrated-rco-HGN
- Pack abliterated: https://huggingface.co/johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-abliterated-HGN
- Draft head opcional: https://huggingface.co/peonist-ai/halogen-qwen3.8-flash-next
- Blog de BottleCap AI sobre ThinkingCap: https://bottlecapai.com/post/thinkingcap-qwen3-8-flash-next/
- Web de BottleCap AI: https://www.bottlecapai.com/

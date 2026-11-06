# OpensourceWTF/Qwen3.8-Flash-Next-exl3

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Qwen (Alibaba). Cuenta con 125 000 millones de parametros totales en el modelo principal, a los que se suman 51 000 millones de parametros en embeddings de n-gramas, y activa aproximadamente 6000 millones de parametros por token. Segun la documentacion oficial, reduce de forma sustancial los costes de entrenamiento e inferencia frente a Qwen3.7-Plus (alrededor de una novena parte del coste de entrenamiento) manteniendo o superando sus capacidades, especialmente en tareas de codigo.

La ficha que nos ocupa no es el modelo original, sino una repackaging de cuantizaciones EXL3 realizadas por turboderp con exllamav3 y adaptadas por el usuario OpensourceWTF al formato que carga mlx-serve sobre Apple Silicon. El repositorio contiene cuatro ramas de cuantizacion (2,05, 3,05, 4,05 y 5,05 bits por peso) y una tabla de n-gramas que se mantiene en SSD y se lee por token. Su relevancia actual radica en que permite ejecutar un MoE de 125B en hardware de Apple con memoria unificada, algo que en formato completo requeriria infraestructura mucho mayor.

El modelo base emplea una arquitectura MoE con 512 expertos y soporta una longitud de contexto de 262 144 tokens (262k) segun el repositorio lean-qwenflash. La licencia es qwen-community-1.0, de tipo "other", lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture-of-Experts), 512 expertos, con embeddings de n-gramas adicionales |
| Parametros totales | 125B en el modelo principal + 51B en embeddings de n-gramas |
| Parametros activos | ~6B por token |
| Longitud de contexto | 262 144 tokens (262k) |
| Tipos de cuantizacion | EXL3 en 2,05, 3,05, 4,05 y 5,05 bits por peso (bpw) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (licencia "other") |
| Formato de pesos | EXL3 repackaged para mlx-serve (safetensors por rama + tabla de n-gramas separada) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos: 125B parametros totales repartidos en 512 expertos, de los que se activan aproximadamente 6B por token. A esto se anade un componente poco habitual: 51B parametros adicionales en embeddings de n-gramas, que en estas cuantizaciones se almacenan aparte (entre 26,24 y 39,04 GB segun la rama) y se leen desde SSD token a token, por lo que consumen disco y cache de ficheros en lugar de memoria. Segun Qwen, esta combinacion reduce el coste de entrenamiento a cerca de una novena parte del de Qwen3.7-Plus.

Las cuantizaciones EXL3 fueron producidas por turboderp con exllamav3 y no se recuantizan en este repositorio: solo se reempaquetan en el layout de ficheros que carga mlx-serve. Las cuatro ramas presentan los siguientes tamanos y metricas de calidad (KLD / PPL, medidas por turboderp con exllamav3):

| Rama | bpw | Tamano de rama | Tabla n-gramas (fuera de rama) | KLD / PPL |
|---|---:|---:|---:|---|
| 5.05bpw | 5,05 | 84,38 GB | 39,04 GB | 0,0040 / 1,3848 |
| 4.05bpw | 4,05 | 68,59 GB | 39,04 GB | 0,0066 / 1,3897 |
| 3.05bpw | 3,05 | 52,72 GB | 32,64 GB | 0,0174 / 1,4074 |
| 2.05bpw | 2,05 | 36,85 GB | 26,24 GB | 0,0681 / 1,4871 |

No se dispone de informacion sobre la composicion del dataset de entrenamiento, el numero de tokens utilizados ni las tecnicas de alineacion (RLHF/DPO) empleadas en el modelo original.

## Capacidades

- Generacion de texto y razonamiento general, con especial enfasis en tareas de codigo segun la documentacion de Qwen.
- Procesamiento de contexto largo: hasta 262 144 tokens, lo que permite manejar documentos extensos y conversaciones multi-turno prolongadas.
- Arquitectura MoE con activacion dispersa (aproximadamente 6B parametros activos de 125B), orientada a eficiencia en inferencia.
- Uso de embeddings de n-gramas como mecanismo complementario de modelado del lenguaje.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada. El autor de la repackaging indica explicitamente que solo se ha probado texto, no entrada de imagen o video.

## Casos de uso

- Inferencia local en Apple Silicon: las cuatro ramas EXL3 permiten ejecutar un MoE de 125B en un Mac con memoria unificada grande (probado en un M5 Max de 128 GB), sirviendolo con mlx-serve y el plugin turboexl3_qwen38. Es adecuado para desarrolladores que quieren un modelo grande sin depender de la nube.
- Desarrollo asistido por codigo en local: el modelo base destaca en tareas de codigo segun Qwen; con la rama 5.05bpw (KLD 0,0040) se obtiene la mayor fidelidad respecto al modelo sin cuantizar, adecuada para autocompletado y generacion de funciones en un entorno de escritorio.
- Procesamiento de documentos largos: los 262k tokens de contexto permiten analizar repositorios completos, contratos extensos o transcripciones largas en una sola pasada, siempre que la memoria disponible soporte la rama elegida.
- Experimentacion e investigacion: las cuatro ramas con metricas KLD/PPL publicadas permiten estudiar el compromiso entre tamano y calidad de cuantizacion en un MoE de gran escala sobre hardware de consumo.
- Servicio de texto en estaciones de trabajo Mac: con mlx-serve y el plugin turboexl3_qwen38 (que requiere mlx-serve 26.11.1 o superior y GPU de clase M5/NAX), se puede exponer un endpoint de generacion de texto para uso interno.
- Evaluacion de calidad de cuantizaciones: comparar las ramas 2.05 y 5.05 bpw sobre el mismo corpus permite medir el impacto real de la cuantizacion (KLD de 0,0681 frente a 0,0040) antes de decidir que rama desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas metricas proporcionadas son las de calidad de cuantizacion (KLD / PPL) de cada rama, recogidas en la tabla de la seccion de arquitectura. El repositorio lean-qwenflash menciona 20 tok/s de generacion y 1600 tok/s de prefill en un equipo con 8 GB de RAM y 16 GB de VRAM, pero corresponde a otra implementacion (offloading directo desde SSD), no a estas ramas EXL3.

## Requisitos de hardware

- VRAM/memoria unificada estimada segun rama: 36,85 GB (2.05bpw), 52,72 GB (3.05bpw), 68,59 GB (4.05bpw) y 84,38 GB (5.05bpw), a los que se suma el espacio en disco para la tabla de n-gramas (26,24-39,04 GB, leida desde SSD).
- Hardware probado: un Apple M5 Max con 128 GB de memoria unificada. El autor indica que no se han probado otros Macs.
- GPU compatibles: el plugin turboexl3_qwen38 requiere mlx-serve 26.11.1 o superior y una GPU de clase M5 (NAX); rechaza por nombre cualquier otra GPU al cargar. No se soportan A100, H100 ni RTX 4090 con este formato.
- Compatibilidad con otras herramientas: los packs no cargan en exllamav3, transformers, vLLM, SGLang ni mlx-lm. Para exllamav3 debe usarse el repositorio original de turboderp.
- Opciones de despliegue: mlx-serve con el plugin turboexl3_qwen38, o la ruta de soporte EXL3 completo para Qwen3.8 con el plugin de cuantizacion turboexl3. MTP requiere mlx-serve con el PR ddalcu/mlx-serve#1017 (ya fusionado); sin el, servir con `--no-mtp`.
- Latencia y throughput: no disponibles para estas ramas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (original) | 125B + 51B n-gramas | ~6B | 262k | qwen-community-1.0 | Pesos originales en Hugging Face |
| Qwen3.8-Flash-Next-exl3 (turboderp) | 125B + 51B n-gramas | ~6B | 262k | qwen-community-1.0 | EXL3 para exllamav3, una rama por bpw |
| Esta repackaging (OpensourceWTF) | 125B + 51B n-gramas | ~6B | 262k | qwen-community-1.0 | EXL3 reempaquetado para mlx-serve |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Referencia de comparacion citada por Qwen |

La diferencia entre las tres primeras entradas no esta en el modelo sino en el formato de despliegue: el original para transformers, el de turboderp para exllamav3 y este para mlx-serve sobre Apple Silicon. No se dispone de datos de benchmarks que permitan comparar rendimiento con Qwen3.7-Plus mas alla de la afirmacion cualitativa de Qwen sobre mejores capacidades en codigo.

## Limitaciones y advertencias

- Licencia qwen-community-1.0: es una licencia "other" con condiciones especificas; debe revisarse el fichero LICENSE antes de cualquier uso comercial.
- Hardware muy restringido: el plugin turboexl3_qwen38 solo funciona en GPU de clase M5 (NAX) con mlx-serve 26.11.1 o superior; no hay soporte para GPU NVIDIA ni para otras generaciones de Apple Silicon.
- Incompatibilidad con el ecosistema habitual: los packs no cargan en transformers, vLLM, SGLang, mlx-lm ni exllamav3.
- Dependencia de SSD: la tabla de n-gramas (26-39 GB) se lee desde disco en cada token, por lo que el rendimiento depende de la velocidad del SSD y del cache de ficheros.
- Solo texto: el autor no ha probado entrada de imagen o video.
- Calidad degradada en ramas bajas: la rama 2.05bpw presenta un KLD de 0,0681, aproximadamente 17 veces peor que la de 5.05bpw (0,0040); no es adecuada para tareas que exijan alta fidelidad.
- Sesgos y alucinaciones: no se dispone de informacion especifica sobre sesgos del modelo base ni sobre tasas de alucinacion.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento multilingue.
- Madurez: el repositorio tiene 4 descargas y 0 likes en el momento de la consulta, y el autor advierte de que solo se ha probado en un unico equipo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/OpensourceWTF/Qwen3.8-Flash-Next-exl3
- Modelo base de la cuantizacion: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Scripts de conversion a mlx-serve: https://github.com/OpenSourceWTF/qwen38-exl3-mlx-serve-converter
- Plugin turboexl3_qwen38: https://github.com/CommunityServe/plugins/tree/main/plugins/turboexl3_qwen38
- Documentacion de plugins de mlx-serve: https://github.com/CommunityServe/plugins/blob/main/docs/using-plugins.md
- mlx-serve: https://github.com/ddalcu/mlx-serve
- PR de soporte MTP: https://github.com/ddalcu/mlx-serve/pull/1017
- exllamav3: https://github.com/turboderp-org/exllamav3
- Implementacion alternativa con offloading desde SSD: https://github.com/MaxDevv/lean-qwenflash

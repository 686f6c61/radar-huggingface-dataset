# fiore-lab/GLM-5.3-EXL3-Experts-2bit

## Resumen

GLM-5.3-EXL3-Experts-2bit es un banco de pesos cuantizados publicado por fiore-lab: contiene exclusivamente los expertos enrutados (routed experts) del modelo zai-org/GLM-5.3, un MoE de 755B parámetros con arquitectura declarada `glm_moe_dsa`, en cuantización EXL3 de 2 bits con codebook `mcg`. Cubre las capas 3 a 77 en 75 ficheros safetensors, cada experto ya dividido en ocho particiones de tensor-parallel para su uso en cuatro u ocho nodos DGX Spark. El repositorio ocupa 187,3 GB (174,4 GiB) y no incluye atención, expertos compartidos, embeddings ni la capa MTP: esos pesos provienen del checkpoint del recetario (fiore-lab/GLM-5.3-EXL3-8x-DGX-Sparks o fiore-lab/GLM-5.3-EXL3-4x-DGX-Sparks).

No es un modelo autónomo ni un GGUF listo para usar: es una pieza de un sistema de despliegue distribuido (recetario `fiore-glm5.3`, release r3-102 o posterior) que carga cada experto a la anchura elegida desde uno de los cuatro bancos disponibles (2, 3, 4 y 5 bits). Su relevancia es concreta: permite ejecutar un MoE de 755B en hardware de sobremesa en clúster (DGX Spark) a costa de una divergencia KL medible frente al modelo original, con un manifiesto con sha256 por fichero para verificación previa a la carga.

La información pública disponible es muy limitada: no hay benchmarks estándar, no se declaran idiomas oficiales, no se especifica longitud de contexto ni parámetros activos, y el repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (`glm_moe_dsa` en el modelo base), con expertos enrutados, expertos compartidos y capa MTP; este repositorio contiene solo los expertos enrutados de las capas 3 a 77 |
| Parámetros totales | 755B (modelo base zai-org/GLM-5.3); el recuento de parámetros del banco no se detalla |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 a 2 bits con codebook `mcg` (banco de 2 bits); la familia incluye bancos de 3, 4 y 5 bits |
| Idiomas soportados | no disponible (la calibración usó textos en inglés, chino y japonés, más sesiones de agente y código; no equivale a una declaración de idiomas soportados) |
| Licencia | GLM-5.3 License (`other`), Copyright (c) 2026 Z.AI; el código del recetario es Apache-2.0 y se licencia por separado |
| Formato de pesos | safetensors con tensores EXL3, más manifiesto JSON (`glm53-exl3-experts-2bit.json`) con tamaño, cabecera y sha256 de cada fichero |

## Arquitectura y entrenamiento

El modelo base es un Mixture of Experts de 755B parámetros identificado como `glm_moe_dsa`, con expertos enrutados, expertos compartidos y una capa MTP (multi-token prediction) que el recetario aporta desde su propio checkpoint. Este repositorio no entrena nada: es una cuantificación post-entrenamiento de los expertos enrutados de las capas 3 a 77, realizada con exllamav3 1.6.1 a partir de zai-org/GLM-5.3-BF16 en la revisión `9d2398f`.

El proceso de cuantización fija los expertos enrutados a 2 bits con codebook `mcg` y calibra con las filas por defecto de exllamav3 (inglés y chino) más texto en japonés y sesiones de agente y de código, 320 filas de 2.048 tokens. Después, cada experto se corta en ocho particiones de tensor-parallel por baldosas completas, sin recuantizar. El resultado se valida contra el modelo original midiendo divergencia KL entre distribuciones de salida (BF16 oficial ejecutado con transformers en FP32 como referencia, frente a la versión cuantizada), sobre cuatro textos de 8.192 tokens (dos en inglés, dos de código) y en las posiciones 6.144 a 8.190. La capa MTP, por su parte, es el mecanismo habitual para decodificación especulativa en esta familia, aunque la model card no detalla su configuración de uso.

## Capacidades

- El repositorio, por sí solo, no genera texto: es un banco de expertos que debe combinarse con los pesos restantes del recetario para formar un modelo ejecutable.
- Razonamiento, código, matemáticas, tool calling, capacidades de agente y multilingüismo del modelo base: no disponible en la información proporcionada.
- Carga selectiva por anchura: el recetario puede mezclar Expert Atlas, escogiendo 2, 3, 4 o 5 bits por experto según el banco descargado en cada nodo.
- Verificación de integridad: manifiesto con sha256 por fichero, comprobable nodo a nodo con `tf-glm53 verify-banks 2`.
- Control de despliegue: el panel de control rechaza arranques o reorganizaciones que requieran una anchura ausente en algún nodo antes de modificar el estado.
- Capa MTP incluida en el checkpoint del recetario (no en este repositorio), orientada a decodificación especulativa.

## Casos de uso

- Despliegue on-premise de un MoE de 755B en clúster de DGX Spark: el banco de 2 bits es la opción de menor huella de la familia y permite repartir los expertos entre cuatro u ocho nodos con particiones de tensor-parallel ya preparadas.
- Inferencia privada con datos sensibles: al ejecutarse en hardware propio y no depender de una API externa, encaja en entornos con requisitos de soberanía de datos, siempre que se respete la GLM-5.3 License.
- Clúster de laboratorio con presupuesto de memoria ajustado: 187,3 GB de banco permiten reservar el resto del presupuesto de memoria a atención, expertos compartidos, embeddings y caché KV.
- Experimentación académica sobre cuantización extrema: la tabla de divergencia KL por anchura (2 a 5 bits) sirve como base para estudiar el compromiso memoria-fidelidad en MoE de gran escala.
- Mezcla de anchuras por capa: el Expert Atlas permite asignar 2 bits a los expertos menos sensibles y anchuras mayores a los críticos, con la advertencia de que las mezclas con expertos a 2 bits se alejaron un 13-30 % más de la referencia.
- Validación de integridad en producción: el manifiesto y `verify-banks` permiten auditar descargas y detectar corrupción antes de servir tráfico.
- Sustitución de un despliegue BF16: frente a los aproximadamente 1,4 TB que ocuparían los pesos BF16 del modelo de 755B (estimación aritmética, no dato de la model card), el banco de 2 bits reduce drásticamente el espacio de los expertos enrutados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de calidad publicado es la divergencia KL frente a las distribuciones del modelo original:

| Anchura de expertos enrutados | Divergencia KL |
|---|---|
| Todos a 2 bits | 0,0517 |
| Todos a 3 bits | 0,0203 |
| Todos a 4 bits | 0,0127 |
| Todos a 5 bits (ocho DGX Sparks) | 0,0114 |

Referencia de escala: los pesos BF16 oficiales calculados en BF16 en lugar de FP32 se desvían de la misma referencia en torno a 0,009. Es decir, el banco de 2 bits presenta una divergencia unas 5,7 veces mayor que ese suelo de ruido numérico. Medición sobre cuatro textos de 8.192 tokens (dos en inglés, dos de código), posiciones 6.144 a 8.190, con cuatro DGX Sparks (ocho para 5 bits).

## Requisitos de hardware

- Espacio en disco: 187,3 GB (174,4 GiB) solo para este banco; hay que sumar el checkpoint del recetario con atención, expertos compartidos, embeddings y capa MTP.
- Nodos: el recetario está pensado para cuatro u ocho DGX Sparks; la release r3-102 ejecuta el panel de control en cuatro. La memoria por nodo no se detalla en la información disponible.
- GPU consumer: no viable. El banco por sí solo supera en más de un orden de magnitud la VRAM de una RTX 4090 (24 GB); no cabe en ninguna GPU de consumo individual.
- Despliegue: exllamav3 1.6.1 como motor de cuantización, el recetario `fiore-glm5.3` (`tf-glm53 deploy`, `tf-glm53 verify-banks 2`, `expert-plan/banks.json`) y `hf download` para la descarga. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (KL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-EXL3-Experts-2bit (este) | 755B en el base; banco de expertos de capas 3-77 | no disponible | 0,0517 | GLM-5.3 License | 187,3 GB, 0 descargas |
| Banco EXL3 de 3 bits (misma familia) | idéntico | no disponible | 0,0203 | GLM-5.3 License | Referenciado en la model card; tamaño no disponible |
| Banco EXL3 de 4 bits (misma familia) | idéntico | no disponible | 0,0127 | GLM-5.3 License | Referenciado; tamaño no disponible |
| Banco EXL3 de 5 bits (misma familia) | idéntico | no disponible | 0,0114 | GLM-5.3 License | Referenciado; requiere ocho DGX Sparks |
| zai-org/GLM-5.3-BF16 (original) | 755B | no disponible | referencia (~0,009 de ruido numérico) | GLM-5.3 License | Público en HuggingFace |

No se dispone de datos de otros modelos comparables de la misma categoría (MoE de más de 500B cuantizado para clúster de sobremesa) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable de forma aislada: sin el checkpoint del recetario no hay atención, expertos compartidos, embeddings ni capa MTP, por lo que no puede ejecutar inferencia.
- Divergencia KL de 0,0517 a 2 bits, claramente por encima del suelo numérico de ~0,009 del BF16; la pérdida de fidelidad es real y medible.
- Las mezclas de anchuras que incluyen expertos a 2 bits se alejaron entre un 13 % y un 30 % más de la referencia que las mezclas sin ellos; subir otros expertos a 5 bits a costa de bajar otros a 3 no aportó ganancia medible.
- La calibración se limita a inglés, chino, japonés, código y sesiones de agente: el comportamiento en otras lenguas (incluido el castellano) no está evaluado ni declarado.
- No hay resultados de benchmarks de tarea, evaluación de sesgos ni tasas de alucinación en la información disponible.
- Licencia GLM-5.3 License (`other`): no es una licencia estándar tipo Apache o MIT; hay que revisar `LICENSE` antes de cualquier uso comercial. El código del recetario es Apache-2.0, pero los pesos no.
- Dependencia de una release concreta del recetario (r3-102 o posterior) y de su formato de manifiesto; cambios de versión pueden invalidar el flujo de despliegue.
- Repositorio sin descargas ni valoraciones y creado en octubre de 2026: no existe validación independiente de la comunidad.
- Los resultados de búsqueda web realizados no devolvieron ninguna fuente relevante sobre este modelo; no hay prensa, papers ni demos verificables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fiore-lab/GLM-5.3-EXL3-Experts-2bit
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Pesos BF16 de origen: https://huggingface.co/zai-org/GLM-5.3-BF16
- Recetario y código (Apache-2.0): https://github.com/fiore-labo/fiore-glm5.3
- Checkpoint para ocho DGX Sparks: https://huggingface.co/fiore-lab/GLM-5.3-EXL3-8x-DGX-Sparks
- Checkpoint para cuatro DGX Sparks: https://huggingface.co/fiore-lab/GLM-5.3-EXL3-4x-DGX-Sparks
- README en japonés: README.ja.md (incluido en el repositorio)
- README en chino simplificado: README.zh-CN.md (incluido en el repositorio)
- Resultados de búsqueda web: sin fuentes relevantes sobre este modelo.

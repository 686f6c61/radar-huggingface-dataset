# darkmaniac7/TokForge-NPU-packs

## Resumen

TokForge NPU packs no es un modelo de lenguaje, sino un repositorio índice que publica TokForge para su aplicación de inferencia en dispositivo. Contiene un único fichero JSON (`npu_pack_index.json`, 7,17 KB, esquema `tokforge-npu-index/1`) que enumera los paquetes de prompt para NPU disponibles en teléfonos con chip Snapdragon. Cada entrada apunta a un repositorio de paquete fijado a un commit concreto y describe los artefactos descargables por arquitectura de chip (V81, V79, V75), su tamaño de descarga y el consumo de memoria de la NPU.

El propósito es permitir que la app TokForge (versión 1.3.9.1 y posteriores en Android) descubra y valide paquetes que aceleran la lectura de prompts largos en la NPU Hexagon de Qualcomm, mientras la CPU genera cada respuesta con el modelo que el usuario ya tiene descargado. Los paquetes listados corresponden a variantes de la familia Qwen3.5 (0.8B, 2B, 4B, 4B Abliterated, 4B Claude 4.6 Opus Abliterated y 9B), algunas preparadas con el runtime QAIRT 2.51.

La relevancia de este repositorio es operativa: actúa como capa de distribución y verificación criptográfica (sha256 por fichero y por MANIFEST.json) para despliegues de inferencia on-device en hardware móvil de gama alta. No contiene pesos ni código de modelo, y su licencia Apache-2.0 cubre el fichero índice, no necesariamente los paquetes referenciados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (fichero índice JSON, no es un modelo) |
| Parametros totales | No disponible (no es un modelo) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los paquetes referenciados incluyen una variante W4 para Qwen3.5 4B con QAIRT 2.51) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | JSON (`npu_pack_index.json`, esquema `tokforge-npu-index/1`); los paquetes referenciados usan formato NPU para Hexagon con MANIFEST.json y verificación sha256 |

## Arquitectura y entrenamiento

No aplica: el repositorio no contiene un modelo entrenado ni pesos. Es un índice de 7,17 KB con una entrada por paquete, donde cada entrada fija un repositorio de paquete a un commit inmutable y registra el sha256 del MANIFEST.json, los tamaños de descarga por arquitectura de chip y las cifras de memoria de NPU medidas en teléfonos.

El mecanismo de integridad es el elemento técnico destacable: la app lee el índice desde `main`, conserva una copia local, comprueba si hay una versión más reciente y, antes de usar un paquete, valida el MANIFEST.json contra el sha256 del índice, cada fichero del paquete por sha256 y tamaño, y el emparejamiento con la descarga del usuario. Un cambio posterior del índice puede añadir paquetes, pero no alterar los ficheros de un paquete ya verificado en el dispositivo.

Los paquetes listados cubren tres arquitecturas de chip: V81 (Snapdragon 8 Elite Gen 5, SM8850), V79 (Snapdragon 8 Elite, SM8750) y V75 (Snapdragon 8 Gen 3, SM8650). Las cifras de memoria de NPU por chip son, por ejemplo, 6,31 GB (V81), 5,84 GB (V79) y 6,26 GB (V75) para Qwen3.5 4B; 2,93 GB (V81) y 2,90 GB (V75) para Qwen3.5 2B; 2,17 GB (V81) y 2,10 GB (V75) para Qwen3.5 0.8B; y 6,63 GB (V81) para Qwen3.5 9B. La variante Qwen3.5 4B W4 con QAIRT 2.51 reduce la descarga a 2,09 GB (V81), 2,08 GB (V79) y 2,08 GB (V75), con memoria de NPU de 4,63 GB, 4,34 GB y 4,63 GB respectivamente; la cifra de V75 es provisional (copia de la de V81, no probada aún en teléfono).

## Capacidades

- Distribución de paquetes NPU: enumera los paquetes de prompt disponibles para cada arquitectura de chip Snapdragon y proporciona las URL y commits fijados para su descarga.
- Verificación de integridad: validación por sha256 del MANIFEST.json y de cada fichero del paquete, además de comprobación de tamaño y de emparejamiento con la descarga del modelo en el dispositivo.
- Descubrimiento automático en la app: TokForge consulta el índice al abrir Models > Browse cuando la copia local tiene más de 12 horas y muestra los paquetes bajo "NPU packs for your phone".
- Aceleración de lectura de prompts en NPU: los paquetes permiten que la NPU Hexagon procese prompts largos mientras la CPU genera la respuesta con el modelo descargado.
- Soporte multiarquitectura: entradas específicas para V81 (SM8850), V79 (SM8750) y V75 (SM8650), con cifras de memoria medidas en teléfono o marcadas como provisionales.
- Compatibilidad con runtime QAIRT 2.51: paquetes preparados con ese runtime de NPU de Qualcomm (Qwen3.5 9B y Qwen3.5 4B W4).
- No incluye: generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües propias; esas capacidades pertenecen a los modelos Qwen3.5 referenciados, no a este repositorio.

## Casos de uso

- Despliegue de inferencia on-device en Android: la app TokForge usa el índice para listar y descargar el paquete NPU adecuado al chip del teléfono, de modo que el desarrollador no tiene que distribuir manualmente artefactos por modelo de dispositivo.
- Aceleración de prompts largos en móvil: con un paquete instalado, la NPU Hexagon lee prompts extensos mientras la CPU genera la respuesta, lo que resulta adecuado para asistentes conversacionales con contexto amplio en Snapdragon 8 Gen 3 o superiores.
- Gestión de versiones y rollback controlado: al fijar cada paquete a un commit y un sha256, un equipo puede auditar qué artefacto exacto se ejecutó en cada dispositivo y evitar actualizaciones silenciosas no verificadas.
- Validación de integridad en cadena de suministro: el esquema de verificación por MANIFEST.json, sha256 y tamaño sirve como referencia para diseñar pipelines de distribución de artefactos binarios a dispositivos finales.
- Selección de variante por presupuesto de memoria: las cifras de memoria de NPU por chip (por ejemplo, 2,17 GB para Qwen3.5 0.8B en V81 frente a 6,63 GB para Qwen3.5 9B) permiten elegir el paquete que cabe junto al modelo en un teléfono concreto.
- Pruebas de compatibilidad de hardware: las marcas `measured_arches` y las cifras provisionales (V75 en el paquete 4B W4) permiten a un equipo de QA identificar qué combinaciones chip-paquete están verificadas en dispositivo real y cuáles no.
- Integración en una app propia de inferencia móvil: el esquema `tokforge-npu-index/1` puede tomarse como modelo de datos para un índice equivalente en otra aplicación que distribuya paquetes NPU con verificación criptográfica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio únicamente aporta cifras de tamaño de descarga y de memoria de NPU por chip y paquete, no métricas de calidad ni de velocidad de inferencia.

| Paquete | Descarga V81 / V79 / V75 | Memoria NPU V81 / V79 / V75 | Medición |
|---|---|---|---|
| Qwen3.5 4B | 3,67 / 3,65 / 3,65 GB | 6,31 / 5,84 / 6,26 GB | Medida en teléfono (V81, V79, V75) |
| Qwen3.5 4B Abliterated | 3,67 / — / 3,65 GB | 5,93 / — / 5,87 GB | Medida en teléfono (V81, V75) |
| Qwen3.5 2B | 1,41 / — / 1,40 GB | 2,93 / — / 2,90 GB | Medida en teléfono (V81, V75) |
| Qwen3.5 4B Claude 4.6 Opus Abliterated | 3,67 / — / 3,65 GB | 5,90 / — / 5,85 GB | Medida en teléfono (V81, V75) |
| Qwen3.5 0.8B | 0,53 / — / 0,52 GB | 2,17 / — / 2,10 GB | Medida en teléfono (V81, V75) |
| Qwen3.5 9B (QAIRT 2.51) | 3,97 / — / — GB | 6,63 / — / — GB | Medida en teléfono (V81) |
| Qwen3.5 4B W4 (QAIRT 2.51) | 2,09 / 2,08 / 2,08 GB | 4,63 / 4,34 / 4,63 GB | Medida en teléfono (V81, V79); V75 provisional |

## Requisitos de hardware

- Hardware obligatorio: teléfono con Snapdragon 8 Elite Gen 5 (SM8850, V81), Snapdragon 8 Elite (SM8750, V79) o Snapdragon 8 Gen 3 (SM8650, V75); la NPU Hexagon es el destino de ejecución de los paquetes.
- Memoria de NPU adicional: entre 2,10 GB (Qwen3.5 0.8B en V75) y 6,63 GB (Qwen3.5 9B en V81), siempre además de la memoria que ocupa el modelo descargado. TokForge activa la NPU solo si el teléfono tiene espacio para ambos.
- Aplicación: TokForge 1.3.9.1 o posterior en Android; existe también una versión iOS en TestFlight, aunque la model card no detalla soporte de paquetes NPU en iOS.
- Despliegue: la descarga y verificación las realiza la propia app; no se contempla instalación manual del fichero índice ni despliegue mediante vLLM, llama.cpp, Ollama o TGI, que no aplican a este formato.
- VRAM estimada en GPU de escritorio: no aplica; el repositorio no está pensado para GPU de servidor ni de consumo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada repositorios comparables de índices de paquetes NPU para Snapdragon con verificación por sha256 y commits fijados. La comparación con los modelos Qwen3.5 referenciados no es pertinente porque este repositorio no contiene pesos ni implementa inferencia.

| Criterio | TokForge NPU packs | Alternativas comparables |
|---|---|---|
| Tipo de artefacto | Índice JSON de paquetes NPU | No disponible |
| Parámetros | No aplica | No disponible |
| Contexto | No aplica | No disponible |
| Licencia | Apache-2.0 | No disponible |
| Disponibilidad | Hugging Face, 0 descargas, 0 likes | No disponible |

## Limitaciones y advertencias

- No es un modelo: no genera texto ni ofrece ninguna capacidad de IA por sí mismo; cualquier evaluación de calidad debe hacerse sobre los modelos Qwen3.5 referenciados en los paquetes.
- Dependencia de hardware muy restrictiva: solo cubre tres arquitecturas de chip Snapdragon de gama alta; no hay soporte documentado para otros SoC, GPU de escritorio ni servidores.
- Cobertura de medición incompleta: varias combinaciones chip-paquete no están probadas en teléfono (V75 en Qwen3.5 4B W4 es provisional y copia la cifra de V81; V79 no aparece en varios paquetes), por lo que las cifras de memoria pueden desviarse en dispositivo real.
- Dependencia de la app TokForge: el índice está diseñado para ser consumido por esa aplicación; su utilidad fuera de ella requiere reimplementar la lógica de verificación y el esquema `tokforge-npu-index/1`.
- Riesgo de cadena de suministro: la seguridad depende de que la app verifique correctamente el sha256 del MANIFEST.json y de cada fichero; un fallo en esa comprobación permitiría servir artefactos manipulados.
- Licencia: Apache-2.0 cubre el fichero índice; la licencia de los paquetes y de los modelos Qwen3.5 referenciados debe verificarse por separado antes de uso comercial.
- Idiomas: no disponibles en la información proporcionada; no se documenta qué idiomas cubren los paquetes.
- Sesgos y alucinación: no evaluables en este repositorio; las variantes "Abliterated" y "Claude 4.6 Opus Abliterated" de Qwen3.5 implican modificaciones del comportamiento del modelo base cuyas implicaciones no se detallan en la model card.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; proyecto de un único autor, sin benchmarks publicados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/darkmaniac7/TokForge-NPU-packs
- Colección TokForge NPU Packs: https://huggingface.co/collections/darkmaniac7/tokforge-npu-packs-6ace2a2701fa913ff8ff1515
- Web de TokForge: https://tokforge.ai
- Discord: https://discord.gg/Acv3CBtfVm
- Google Play: https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
- Paquete Qwen3.5 4B: https://huggingface.co/darkmaniac7/Qwen3.5-4B-NPU-catalogpair/tree/43e528cc1ce4465b6c0a2d92af16ab8b8bef696e
- Paquete Qwen3.5 4B Abliterated: https://huggingface.co/darkmaniac7/Qwen3.5-4B-uncensored-NPU-catalogpair/tree/d384c68e412200b6bd2f3f4811e3acca1b72894f
- Paquete Qwen3.5 2B: https://huggingface.co/darkmaniac7/Qwen3.5-2B-NPU-catalogpair/tree/5752109061a25ff5805abda0f8d8e6f0b520e980
- Paquete Qwen3.5 4B Claude 4.6 Opus Abliterated: https://huggingface.co/darkmaniac7/Qwen3.5-4B-Claude-4.6-Opus-abliterated-NPU-catalogpair/tree/e3378b577741af08332e5908cac285140ba8c954
- Paquete Qwen3.5 0.8B: https://huggingface.co/darkmaniac7/Qwen3.5-0.8B-NPU-catalogpair/tree/56aac1e38f036de3483e2c0261fb08acad7a1f6c
- Paquete Qwen3.5 9B (QAIRT 2.51): https://huggingface.co/darkmaniac7/Qwen3.5-9B-NPU-catalogpair/tree/9daa5ec6f6721a31082327e891693cc5c38dbef9
- Paquete Qwen3.5 4B W4 (QAIRT 2.51): https://huggingface.co/darkmaniac7/Qwen3.5-4B-NPU-catalogpair-qairt251/tree/e22fbfefdcd8f2bc2ba9133fd07026673db1be88
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0

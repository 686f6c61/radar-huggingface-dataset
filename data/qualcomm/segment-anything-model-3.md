# qualcomm/Segment-Anything-Model-3

## Resumen

Segment-Anything-Model-3 (SAM3, Segment Anything with Concepts) es un modelo de segmentacion de imagenes desarrollado originalmente por Meta (facebookresearch/sam3) y reempaquetado por Qualcomm para su despliegue optimizado en dispositivos con hardware Qualcomm (Snapdragon y Dragonwing). A diferencia de SAM y SAM2, SAM3 introduce segmentacion de vocabulario abierto: el modelo recibe una imagen y un prompt en lenguaje natural y devuelve cajas delimitadoras y mascaras de los objetos que coinciden con ese concepto, sin necesidad de reentrenamiento por categoria.

El paquete publicado en HuggingFace por el usuario qualcomm no contiene pesos preexportados, sino la integracion con la libreria Qualcomm AI Hub Models (v0.62.0) para compilar y exportar el modelo con pesos, formas de entrada y configuracion de dispositivo propias. Se trata, por tanto, de una ficha orientada a despliegue en el borde (edge/movil/automocion) mas que a un checkpoint listo para usar.

La arquitectura se divide en dos submodulos medidos en la model card: un backbone de vision de 33,5 M de parametros (128 MB en float) y un transformer de 6,22 M de parametros (23,7 MB en float), con una resolucion de entrada de 1008x1008. El modelo se ejecuta sobre la NPU de los chips Qualcomm listados, con tiempos de inferencia que van de aproximadamente 230 ms a mas de 1 s por submodulo segun el chipset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de segmentacion (visual backbone + transformer); sin mas detalle en la model card |
| Parametros totales | 39,72 M (33,5 M backbone + 6,22 M transformer) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; entrada de imagen de 1008x1008 y prompt de texto) |
| Tipos de cuantizacion | Perfiles publicados en precision float; exportacion con cuantizacion propia via AI Hub Models |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | QNN (PRECOMPILED_QNN_ONNX y QNN_CONTEXT_BINARY); exportacion desde PyTorch |

## Arquitectura y entrenamiento

SAM3 amplia SAM2 con segmentacion de vocabulario abierto. La model card indica que produce cajas delimitadoras y mascaras para objetos que coinciden con un prompt en lenguaje natural, lo que implica un codificador de texto que se combina con el codificador de imagen para generar las mascaras. La implementacion de referencia es la de facebookresearch/sam3, y Qualcomm distribuye una version adaptada a su cadena de herramientas (AI Hub Models) para compilar y perfilar el modelo sobre NPU.

El paquete de Qualcomm no incluye informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes, ni sobre fases de RLHF/DPO (no aplicables a un modelo de vision de este tipo). La model card tampoco detalla innovaciones internas de atencion mas alla de la separacion entre backbone de vision y transformer. Los unicos datos tecnicos objetivos disponibles son los tamanos de cada submodulo y la resolucion de entrada.

## Capacidades

- Segmentacion de imagenes guiada por prompt de lenguaje natural (vocabulario abierto): genera mascaras y cajas delimitadoras para el concepto indicado.
- Segmentacion semantica a resolucion de entrada de 1008x1008.
- Deteccion de objetos mediante cajas delimitadoras ademas de mascaras.
- Ejecucion sobre NPU de dispositivos Qualcomm (Snapdragon movil, Snapdragon X Elite/X2 Elite, Dragonwing y plataformas de automocion SA).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento (thinking), vision adicional o audio: no disponible.

## Casos de uso

- Edicion fotografica en aplicaciones moviles: el usuario escribe el concepto a recortar ("el cielo", "la persona del centro") y el modelo devuelve la mascara sobre la NPU del telefono, sin enviar la imagen a la nube.
- Automocion y ADAS: sobre plataformas Snapdragon Ride (SA8775P, SA8650P, SA8255P, SA7255P, SA8295P) el modelo puede segmentar objetos descritos en lenguaje natural para tareas de percepcion en el vehiculo, con latencias de aproximadamente 500-600 ms para el modulo head.
- Realidad aumentada y gafas inteligentes: segmentacion de vocabulario abierto en el dispositivo para anclar objetos virtuales a elementos reales identificados por prompt.
- Comercio electronico: generacion automatica de mascaras de producto para fondos limpios en catalogos, ejecutada en pipelines por lotes sobre hardware Qualcomm.
- Inspeccion industrial y control de calidad: segmentacion de defectos descritos por texto ("grietas", "corrosion") en lineas de produccion con hardware Dragonwing IQ.
- Analisis de imagenes aereas o satelitales en el borde: seleccion de elementos como "carreteras" o "vegetacion" mediante prompt, evitando subir datos sensibles.
- Herramientas de accesibilidad: aplicaciones que permiten a un usuario describir verbalmente un objeto y obtener su silueta resaltada en tiempo real en un dispositivo movil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (mIoU, AP, etc.) en la informacion disponible. La model card si incluye mediciones de latencia y memoria por chipset y por submodulo, en precision float sobre NPU.

Latencia y memoria del submodulo head:

| Runtime | Chipset | Inferencia (ms) | Memoria pico (MB) |
|---|---|---|---|
| PRECOMPILED_QNN_ONNX | Snapdragon X2 Elite | 208,916 | 136 |
| PRECOMPILED_QNN_ONNX | Snapdragon X Elite | 483,955 | 667 |
| PRECOMPILED_QNN_ONNX | Snapdragon 8 Gen 3 Mobile | 381,819 | 155 - 168 |
| PRECOMPILED_QNN_ONNX | Dragonwing IQ-8275 | 490,846 | 106 - 216 |
| PRECOMPILED_QNN_ONNX | Dragonwing IQ-9075 | 501,25 | 106 - 215 |
| PRECOMPILED_QNN_ONNX | Dragonwing IQ-X7181 | 483,955 | 667 |
| PRECOMPILED_QNN_ONNX | Dragonwing Q-8750 | 276,292 | 132 - 144 |
| PRECOMPILED_QNN_ONNX | Snapdragon 8 Elite Mobile | 276,292 | 132 - 144 |
| PRECOMPILED_QNN_ONNX | Snapdragon 8 Elite Gen 5 Mobile | 236,91 | 131 - 143 |
| QNN_CONTEXT_BINARY | Snapdragon X2 Elite | 209,654 | 106 |
| QNN_CONTEXT_BINARY | Snapdragon X Elite | 483,87 | 107 |
| QNN_CONTEXT_BINARY | Snapdragon 8 Gen 3 Mobile | 385,86 | 106 - 119 |
| QNN_CONTEXT_BINARY | Dragonwing IQ-8275 | 491,758 | 106 - 278 |
| QNN_CONTEXT_BINARY | SA8775P / SA8650P / SA8255P | 516,497 | 97 - 107 |
| QNN_CONTEXT_BINARY | Dragonwing IQ-9075 | 502,225 | 106 - 278 |
| QNN_CONTEXT_BINARY | Dragonwing IQ-X7181 | 483,87 | 107 |
| QNN_CONTEXT_BINARY | Dragonwing Q-8750 | 283,287 | 82 - 90 |
| QNN_CONTEXT_BINARY | SA7255P | 1004,109 | 106 - 116 |
| QNN_CONTEXT_BINARY | SA8295P | 595,703 | 82 - 87 |
| QNN_CONTEXT_BINARY | Snapdragon 8 Elite Mobile | 283,287 | 82 - 90 |
| QNN_CONTEXT_BINARY | Snapdragon 8 Elite Gen 5 Mobile | 230,122 | 61 - 74 |

Latencia y memoria del submodulo vision_backbone:

| Runtime | Chipset | Inferencia (ms) | Memoria pico (MB) |
|---|---|---|---|
| PRECOMPILED_QNN_ONNX | Snapdragon X2 Elite | 1081,01 | 265 |
| PRECOMPILED_QNN_ONNX | Snapdragon X Elite | 2224,923 | 943 |
| PRECOMPILED_QNN_ONNX | Snapdragon 8 Gen 3 Mobile | 1744,17 | 31 - 41 |
| PRECOMPILED_QNN_ONNX | Dragonwing IQ-8275 | 2529,726 | 114 - 129 |
| PRECOMPILED_QNN_ONNX | Dragonwing IQ-9075 | 2458,695 | 54 - 68 |
| PRECOMPILED_QNN_ONNX | Dragonwing IQ-X7181 | 2224,923 | 943 |
| PRECOMPILED_QNN_ONNX | Dragonwing Q-8750 | 1410,014 | 8 - 20 |
| PRECOMPILED_QNN_ONNX | Snapdragon 8 Elite Mobile | 1410,014 | 8 - 20 |
| PRECOMPILED_QNN_ONNX | Snapdragon 8 Elite Gen 5 Mobile | 1227,166 | 8 - 20 |
| QNN_CONTEXT_BINARY | Snapdragon X2 Elite | 1092,428 | 12 |
| QNN_CONTEXT_BINARY | Snapdragon X Elite | 2188,246 | 12 |
| QNN_CONTEXT_BINARY | Snapdragon 8 Gen 3 Mobile | 1732,551 | 12 - 26 |
| QNN_CONTEXT_BINARY | Dragonwing IQ-8275 | 2528,326 | 12 - 132 |

Los datos de vision_backbone en runtime QNN_CONTEXT_BINARY aparecen truncados en la model card (la ultima fila corta en "252..."), por lo que no se reproducen las entradas restantes.

## Requisitos de hardware

- No es un modelo pensado para GPU de escritorio o centro de datos: Qualcomm lo distribuye especificamente para NPU de sus chips.
- Memoria de pesos: aproximadamente 128 MB para el backbone y 23,7 MB para el transformer en precision float.
- Memoria pico en ejecucion: entre 8 y 943 MB por submodulo segun chipset y runtime; el pico mas alto (943 MB) corresponde al vision_backbone en Snapdragon X Elite y Dragonwing IQ-X7181.
- Chipsets soportados en la model card: Snapdragon X2 Elite, Snapdragon X Elite, Snapdragon 8 Gen 3, Snapdragon 8 Elite, Snapdragon 8 Elite Gen 5, Dragonwing IQ-8275, IQ-9075, IQ-X7181, Q-8750, y las plataformas SA8775P, SA8650P, SA8255P, SA7255P, SA8295P (automocion/industrial).
- Latencia observada: head entre 208,9 ms (X2 Elite) y 1004,1 ms (SA7255P); vision_backbone entre 1081,0 ms (X2 Elite) y 2529,7 ms (IQ-8275).
- No cabe en GPU de consumidor en el sentido habitual: el modelo se compila para QNN, no se distribuyen pesos PyTorch listos para CUDA.
- Entornos de despliegue: Qualcomm AI Hub Models (compilacion y exportacion), Qualcomm AI Hub Workbench (perfilado en dispositivo remoto) y runtime QNN (formatos PRECOMPILED_QNN_ONNX y QNN_CONTEXT_BINARY).
- No se dispone de datos de throughput ni de latencia en GPU (vLLM, llama.cpp, Ollama, TGI no son aplicables a este modelo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Vocabulario abierto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAM3 (qualcomm) | 39,72 M (33,5 M + 6,22 M) | Imagen 1008x1008 + prompt de texto | Si | other | Compilacion propia via AI Hub Models |
| SAM 2 (Meta) | no disponible | no disponible | No (prompt por puntos/cajas) | no disponible | no disponible |
| SAM (Meta) | no disponible | no disponible | No (prompt por puntos/cajas) | no disponible | no disponible |

La model card solo establece que SAM3 extiende SAM2 con segmentacion de vocabulario abierto. No se aportan cifras de parametros, contexto ni rendimiento de SAM2 o SAM para una comparacion cuantitativa, por lo que esos campos se marcan como no disponibles.

## Limitaciones y advertencias

- No se distribuyen pesos preexportados por restricciones de licencia; es obligatorio compilar y exportar el modelo con pesos propios a traves de AI Hub Models.
- La licencia es "other": no se detallan en la model card los terminos exactos ni si permiten uso comercial. Conviene revisar la licencia de facebookresearch/sam3 antes de un despliegue en produccion.
- No hay informacion sobre sesgos del modelo ni sobre el dataset de entrenamiento, por lo que no se puede evaluar su comportamiento diferencial por tipo de objeto, etnia, genero o region.
- Riesgo de alucinacion de mascaras: al ser vocabulario abierto, un prompt ambiguo puede producir segmentaciones incorrectas; no hay metricas publicadas de precision.
- Idiomas soportados no disponibles: se desconoce si el codificador de texto maneja prompts fuera del ingles.
- Dependencia de hardware Qualcomm: el rendimiento medido corresponde exclusivamente a NPU de chips Snapdragon y Dragonwing; no hay datos para GPU NVIDIA/AMD ni CPU generica.
- La model card no documenta limites de contexto de texto ni numero maximo de conceptos por consulta.
- El ultimo tramo de la tabla de rendimiento del vision_backbone en QNN_CONTEXT_BINARY aparece truncado en la fuente, lo que limita la reproducibilidad completa de las cifras.

## Enlaces

- HuggingFace: https://huggingface.co/qualcomm/Segment-Anything-Model-3
- Implementacion de referencia (Meta): https://github.com/facebookresearch/sam3
- Repositorio de Qualcomm AI Hub Models para SAM3: https://github.com/qualcomm/ai-hub-models/blob/v0.62.0/src/qai_hub_models/models/sam3
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Registro en Qualcomm AI Hub: https://myaccount.qualcomm.com/signup
- Paper de referencia (tag de la model card): arxiv:2511.16719
- Web de Qualcomm: https://www.qualcomm.com/

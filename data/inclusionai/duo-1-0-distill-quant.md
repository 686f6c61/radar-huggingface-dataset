# inclusionAI/Duo-1.0-distill-quant

## Resumen

Duo-1.0-distill-quant es un conjunto de pesos cuantizados en FP8 del modelo Duo 1.0, un modelo del mundo (world model) multimodal de tipo any-to-any orientado a la generacion de video y audio en tiempo real. Lo desarrolla el equipo inclusionAI y se distribuye como un "overlay" de realizacion que debe superponerse sobre el bundle base `inclusionAI/Duo-1.0-causal-base`. El modelo se presenta como un "Reciprocal World Model for Full-Duplex Interaction", es decir, un modelo pensado para interaccion audiovisual bidireccional y simultanea (full-duplex), no para generacion por turnos.

La relevancia de esta variante concreta esta en su naturaleza destilada y cuantizada: emplea un sampler Euler de cuatro pasos con flow shift 5.0, lo que reduce drasticamente el coste de inferencia frente a un modelo de difusion convencional de decenas de pasos. La cuantizacion es ModelOpt FP8 con escalado por canal, lo que permite desplegar el modelo en hardware con soporte de FP8.

El repositorio ocupa 47,0 GB y esta etiquetado con la pipeline `any-to-any` y la libreria `duo-world-model`. La licencia es la `minimax-h3-community-license`, dado que los pesos se inicializaron a partir de MiniMax H3 y fueron entrenados posteriormente por el equipo de Duo. No se publican en la informacion disponible datos sobre numero de parametros, longitud de contexto ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo del mundo multimodal causal (detalles completos en el paper arXiv:2611.15131; no disponibles en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (ModelOpt FP8, escalado por canal); pesos destilados a 4 pasos |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (etiquetada como `other`) |
| Formato de pesos | safetensors (ModelOpt FP8); overlay sobre `Duo-1.0-causal-base` |

## Arquitectura y entrenamiento

La model card describe Duo como un modelo del mundo multimodal full-duplex para interaccion audiovisual en tiempo real. Esta variante concreta es la "Realization" destilada y cuantizada: parte de los pesos del bundle `Duo-1.0-causal-base`, que aporta el backbone "Intent", los codecs, los modelos de voz y el backbone de realizacion, y anade los pesos de realizacion en FP8. El sampler por defecto es Euler con 4 pasos y flow shift 5.0, lo que indica un esquema de generacion por flow matching destilado a muy pocos pasos.

Los pesos se inicializaron a partir de MiniMax H3 y se entrenaron posteriormente por el equipo de Duo, segun indica la propia model card. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detalla si la arquitectura es transformer pura, hibrida o de otro tipo; el paper referenciado (arXiv:2611.15131) es la fuente primaria para esos detalles.

La innovacion tecnica destacable es la combinacion de destilacion a cuatro pasos con cuantizacion FP8 por canal, orientada a reducir latencia y huella de memoria en un escenario de interaccion en tiempo real. El formato ModelOpt FP8 exige que el runtime consumidor soporte dicho formato o disponga de una ruta de conversion equivalente.

## Capacidades

- Generacion de video en tiempo real como parte de un modelo del mundo audiovisual.
- Generacion de audio sincronizada con el video en un esquema full-duplex.
- Interaccion bidireccional y simultanea (entrada y salida solapadas en el tiempo), a diferencia de los modelos por turnos.
- Pipeline any-to-any: acepta y produce modalidades mixtas segun la definicion del modelo base.
- Inferencia destilada a 4 pasos con sampler Euler y flow shift 5.0.
- Soporte de cuantizacion FP8 para despliegue con menor coste de memoria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Interaccion audiovisual en tiempo real: el modelo esta disenado para full-duplex, por lo que encaja en aplicaciones de conversacion o avatares donde la respuesta audiovisual debe solaparse con la entrada del usuario sin esperar al final del turno.
- Prototipado de avatares conversacionales: combinando el backbone de voz y los codecs del bundle base con los pesos de realizacion destilados, se puede construir un avatar que genere video y audio coherentes en cuatro pasos de muestreo.
- Investigacion en modelos del mundo: el paper y el codigo permiten reproducir y extender el paradigma de "reciprocal world model" para estudiar interaccion bidireccional.
- Simulacion de entornos interactivos: al tratarse de un world model, puede emplearse para generar respuestas visuales y sonoras condicionadas por acciones, util en entornos simulados de entrenamiento.
- Evaluacion de tecnicas de cuantizacion FP8: al ser una variante cuantizada oficial, sirve como referencia para medir el impacto de ModelOpt FP8 por canal frente a los pesos en precision completa.
- Despliegue con restricciones de memoria: la cuantizacion FP8 y la destilacion a 4 pasos reducen los requisitos frente a un modelo de difusion de muchos pasos, lo que facilita su integracion en infraestructuras con GPUs de memoria limitada.
- Generacion de contenido audiovisual de baja latencia: en pipelines donde el coste por paso de muestreo es critico, el esquema de 4 pasos permite iterar mas rapido que un sampler convencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio de esta variante ocupa 47,0 GB y requiere ademas el bundle `Duo-1.0-causal-base`, por lo que el consumo total de memoria supera ampliamente el de un modelo de un solo fichero.
- GPU recomendadas: no disponible en la informacion proporcionada. El uso de FP8 con ModelOpt sugiere hardware con soporte nativo de FP8 (familias Hopper o posteriores), aunque no se confirma en la model card.
- Compatibilidad con GPU de consumo: no confirmada. El tamano del bundle y la dependencia del formato ModelOpt FP8 hacen poco probable un despliegue directo en GPUs de consumo sin conversion.
- Opciones de despliegue: la model card remite al repositorio `inclusionAI/Duo` para instrucciones de integracion especificas del runtime; no se listan vLLM, llama.cpp, Ollama ni TGI. La libreria declarada es `duo-world-model` y el formato se gestiona con `diffusers` segun los tags.
- Latencia y throughput estimados: no disponibles. La destilacion a 4 pasos con sampler Euler y flow shift 5.0 es el unico dato de rendimiento publicado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Duo-1.0-distill-quant | World model audiovisual full-duplex, FP8, 4 pasos | no disponible | no disponible | minimax-h3-community-license | Hugging Face, ModelScope |
| Duo-1.0-causal-base | Bundle base del mismo modelo | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y superponer los pesos sobre `inclusionAI/Duo-1.0-causal-base`; sin ese bundle no funciona.
- El runtime debe soportar el formato ModelOpt FP8 o disponer de una ruta de conversion equivalente; de lo contrario, los pesos no se pueden cargar.
- La licencia `minimax-h3-community-license` es de tipo comunitario y no equivale a una licencia permisiva; es imprescindible revisar `LICENSE` y `NOTICE` antes de cualquier uso comercial, dado que los pesos derivan de MiniMax H3.
- La cuantizacion FP8 puede introducir degradacion de calidad frente a los pesos en precision completa; no se publican metricas de dicha degradacion.
- La destilacion a 4 pasos reduce el coste pero puede limitar la diversidad y el detalle de las salidas frente a samplers con mas pasos.
- No se documentan sesgos conocidos, tasas de alucinacion ni limitaciones de idioma en la informacion disponible.
- No se especifican los idiomas soportados, lo que impide garantizar un comportamiento multilingue en produccion.
- El repositorio es grande (47,0 GB) y el modelo base anade peso adicional; el almacenamiento y el ancho de banda deben dimensionarse en consecuencia.
- El numero de descargas (200) y de likes (11) es bajo, lo que sugiere una validacion comunitaria limitada en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/Duo-1.0-distill-quant
- Bundle base: https://huggingface.co/inclusionAI/Duo-1.0-causal-base
- Paper: https://arxiv.org/abs/2611.15131
- Homepage: https://duo-v1.github.io/
- Coleccion de modelos: https://huggingface.co/collections/inclusionAI/duo-v1
- ModelScope: https://www.modelscope.cn/collections/inclusionAI/Duo-v1
- Codigo: https://github.com/inclusionAI/Duo

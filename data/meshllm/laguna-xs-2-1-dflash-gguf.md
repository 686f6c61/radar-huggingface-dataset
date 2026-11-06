# meshllm/Laguna-XS-2.1-DFlash-GGUF

## Resumen

Laguna-XS-2.1-DFlash-GGUF es una cuantizacion Q8_0 en formato GGUF del modelo borrador (draft) de decodificacion especulativa DFlash que Poolside publica como complemento de su modelo principal Laguna-XS-2.1. No se trata de un modelo conversacional autonomo, sino de un cabezal de prediccion de tokens disenado para acelerar la inferencia del modelo objetivo mediante decodificacion especulativa. El repositorio lo mantiene el usuario meshllm y anade el soporte necesario para ejecutarlo en runtimes basados en llama.cpp.

El modelo borrador tiene 462.064.896 parametros y reutiliza los embeddings de tokens y la cabeza de salida del modelo objetivo, por lo que su huella en disco es de aproximadamente 0,5 GB. Lee las activaciones de las capas 2, 14, 26, 34 y 40 de Laguna-XS-2.1, aplica un bloque causal de 16 tokens y una atencion de ventana deslizante de 512 tokens, y propone secuencias de tokens que el modelo grande valida en paralelo.

Su relevancia es practica: Laguna-XS-2.1 es un MoE de 33.000 millones de parametros totales con 3.000 millones activos por token orientado a coding agentico y tareas de horizonte largo en maquina local. Un borrador ligero que comparte tokenizer y cabeza de salida permite reducir la latencia por token generado sin degradar la distribucion del modelo objetivo, siempre que el runtime implemente el contrato de decodificador Laguna DFlash.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador para decodificacion especulativa (DFlash), con bloque causal de 16 tokens y atencion de ventana deslizante de 512 tokens |
| Parametros totales | 462.064.896 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | ventana deslizante de 512 tokens en el borrador; el contexto efectivo lo determina el modelo objetivo Laguna-XS-2.1 |
| Tipos de cuantizacion | Q8_0 (unica publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License Agreement, version 1.1 (openmdw-1.1) |
| Formato de pesos | GGUF (`Laguna-XS-2.1-DFlash-Q8_0.gguf`) |

## Arquitectura y entrenamiento

El borrador sigue la arquitectura DFlash de Poolside: un transformer ligero que consume representaciones internas del modelo objetivo en lugar de recalcular toda la pila. Concretamente, toma las salidas de las capas 2, 14, 26, 34 y 40 de Laguna-XS-2.1 (la capa 40 corresponde a la salida de la ultima capa) y las combina mediante normas auxiliares por caracteristica (`aux_hidden_norms`, apiladas en `enc.aux_norm` durante la conversion). Comparte los embeddings de tokens y la cabeza de salida con el modelo objetivo, lo que elimina parametros redundantes y garantiza coherencia en el espacio de vocabulario.

La conversion a GGUF se realizo con `convert_hf_to_gguf.py --target-model-dir <Laguna-XS-2.1> --outtype q8_0` usando un fork parcheado de llama.cpp que anade `DFlashLagunaForCausalLM`. Durante el proceso se divide el `qkv_proj` fusionado, se apilan las normas auxiliares y se marca el archivo con `dflash.decoder_arch = laguna`, el mismo layout que el `laguna-s-2.1-DFlash-BF16.gguf` de Poolside. El checkpoint origen es `poolside/Laguna-XS-2.1-DFlash` en la revision `5c36361aab23c8ed3afbd079c10c426b677bc607`. No se dispone de informacion sobre el dataset de entrenamiento del borrador ni sobre si se aplicaron tecnicas de alineacion adicionales.

## Capacidades

- Prediccion especulativa de tokens para acelerar la generacion de Laguna-XS-2.1: propone bloques de hasta 16 tokens que el modelo objetivo verifica en una sola pasada.
- Aprovechamiento de activaciones intermedias del modelo objetivo (capas 2, 14, 26, 34 y 40) para condicionar sus predicciones.
- Reutilizacion del vocabulario y la cabeza de salida del modelo objetivo, sin tokenizer propio.
- Integracion en runtimes llama.cpp que implementen el contrato Laguna DFlash (puerta de salida de atencion, normas por caracteristica, K/V de contexto normalizadas, bloque causal).
- No soporta tool calling, agentes, vision ni audio por si mismo: esas capacidades pertenecen al modelo objetivo.
- Capacidades multilingues: no disponibles de forma independiente; heredadas del modelo objetivo a traves de la cabeza compartida.

## Casos de uso

- Aceleracion de inferencia local de Laguna-XS-2.1: emparejar este borrador con el modelo objetivo en mesh-llm o en el fork de llama.cpp de Poolside para reducir la latencia por token en generacion de codigo, manteniendo la calidad del modelo grande gracias a la verificacion paralela.
- Asistentes de coding en estacion de trabajo: al reducir el coste por token, permite flujos interactivos de autocompletado y refactorizacion sobre un MoE de 33.000 millones con 3.000 millones activos, que de otro modo resultarian lentos en hardware de consumo.
- Tareas agenticas de horizonte largo: la decodificacion especulativa es especialmente util cuando el modelo genera secuencias largas de llamadas a herramientas y ediciones de ficheros, donde el ahorro por token se acumula.
- Despliegue en servidores con llama.cpp: integrar el GGUF en un endpoint compatible con la API de chat para servir a varios usuarios, siempre que el backend soporte el decodificador DFlash Laguna.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: sirve como referencia reproducible para medir la tasa de aceptacion del borrador frente a otras estrategias (Medusa, EAGLE u otros borradores) sobre el mismo modelo objetivo.
- Investigacion sobre borradores acoplados: al leer capas intermedias concretas, es un caso de estudio util para analizar que representaciones internas son mas informativas para predecir el siguiente bloque de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de aceptacion del borrador, aceleracion medida (tokens por segundo) ni comparaciones con otras tecnicas de decodificacion especulativa. El modelo objetivo Laguna-XS-2.1 reporta una mejora de +5,4 % en SWE-bench Multilingual respecto a Laguna XS.2, pero ese dato corresponde al modelo grande, no al borrador.

## Requisitos de hardware

- VRAM estimada para el borrador: aproximadamente 0,5 GB en Q8_0, segun el tamano del repositorio.
- VRAM adicional para el modelo objetivo: Laguna-XS-2.1 es un MoE de 33.000 millones totales y 3.000 millones activos; la huella depende de la cuantizacion elegida para el modelo grande, no incluida en este repositorio.
- GPU recomendadas: no disponibles de forma especifica para el borrador; el requisito dominante lo marca el modelo objetivo.
- Cabe en GPU de consumo: el borrador si; el conjunto borrador mas objetivo depende de la cuantizacion del objetivo.
- Opciones de despliegue: mesh-llm (https://github.com/Mesh-LLM/mesh-llm) o el fork de llama.cpp de Poolside (https://github.com/poolsideai/llama.cpp/tree/laguna). No es compatible con runtimes llama.cpp estandar que no implementen el contrato DFlash Laguna.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laguna-XS-2.1-DFlash-GGUF (este repo) | 462 M | ventana deslizante de 512 tokens en el borrador | Borrador de decodificacion especulativa para Laguna-XS-2.1 | OpenMDW-1.1 | GGUF Q8_0 en Hugging Face |
| poolside/Laguna-XS-2.1-DFlash | no disponible | no disponible | Borrador DFlash original en safetensors | OpenMDW-1.1 | Hugging Face |
| poolside/Laguna-XS-2.1 | 33 B totales, 3 B activos | no disponible | Modelo MoE objetivo para coding agentico | OpenMDW-1.1 | Hugging Face |
| poolside laguna-s-2.1-DFlash-BF16.gguf | no disponible | no disponible | Borrador DFlash en BF16 con el mismo layout GGUF | OpenMDW-1.1 | Distribuido por Poolside |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo objetivo Laguna-XS-2.1 y un runtime compatible con el contrato DFlash Laguna, el GGUF no produce generaciones utiles.
- Compatibilidad restringida: requiere mesh-llm o el fork laguna de llama.cpp de Poolside; llama.cpp upstream no lo soporta de serie.
- Solo se publica Q8_0; no hay variantes Q4, Q5 ni BF16 en este repositorio, lo que limita el ajuste fino de memoria.
- La ventana de atencion del borrador es de 512 tokens con bloques causales de 16; la calidad de la especulacion puede degradarse en contextos muy largos o dominios alejados del entrenamiento del objetivo.
- Riesgo de alucinacion: heredado del modelo objetivo; el borrador no introduce correccion factual, solo propone tokens que el objetivo valida.
- Sesgos: no documentados en la informacion disponible; dependen del modelo objetivo y de su dataset de entrenamiento.
- Licencia OpenMDW-1.1 con obligaciones de uso aceptable segun la politica de Poolside; revisar el archivo `LICENSE` antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni evidencia publica de estabilidad en produccion.
- El autor del GGUF es un tercero (meshllm), no Poolside; la integridad del archivo puede verificarse con el sha256 publicado: `40eb6bf48f42ebc1990a0ba8c74d2070a256e7f1842a58d8aa9b195e907b04e8`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/meshllm/Laguna-XS-2.1-DFlash-GGUF
- Modelo borrador original: https://huggingface.co/poolside/Laguna-XS-2.1-DFlash
- Modelo objetivo: https://huggingface.co/poolside/Laguna-XS-2.1
- Runtime mesh-llm: https://github.com/Mesh-LLM/mesh-llm
- Fork de llama.cpp de Poolside (rama laguna): https://github.com/poolsideai/llama.cpp/tree/laguna

# Ninnix96/Inkling-2-Mini-DSpark-GGUF

## Resumen

Inkling-2-Mini DSpark es una cabeza de decodificación especulativa (draft head) de 368,5 millones de parámetros publicada por Ninnix96 como reempaquetado GGUF del drafter original del modelo Inkling-2-Mini de Thinking Machines. No es un modelo conversacional autónomo: es un componente auxiliar que se acopla a un modelo objetivo (target) de la misma familia para acelerar la inferencia mediante decodificación especulativa en el formato DSpark, con 58 tensores y capacidad de proponer hasta siete tokens por bloque.

La relevancia de esta ficha es doble. Por un lado, documenta un artefacto muy específico del ecosistema de optimización de inferencia: un draft head cuantizado que conserva las formas de todos los tensores del formato original y que solo funciona en runtimes con soporte explícito para DSpark. Por otro, ilustra una práctica habitual en Hugging Face: la re-cuantización de un artefacto BF16 intermedio (en este caso la conversión GGUF de Unsloth) para adaptarlo a hardware modesto, aquí una placa única con Vulkan.

El repositorio es de tamaño reducido (0,3 GB) y licencia Apache 2.0. La información pública disponible es escasa: no hay pipeline declarado, no se listan idiomas soportados y no se han publicado benchmarks. Los datos técnicos proceden de la model card del autor y de los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de decodificación especulativa DSpark (3 capas draft) sobre transformer objetivo; 58 tensores |
| Parametros totales | 368.489.482 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo objetivo, no declarada) |
| Tipos de cuantizacion | Mezcla por tensor: Q6_K (9 matrices feed-forward y 2 matrices Markov), Q8_0 (19 matrices de proyección), BF16 (embeddings de máscara), F32 (27 tensores restantes) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Inkling-2-Mini-DSpark-333M.gguf`, 333.053.536 bytes / 317,6 MiB; SHA-256 `89cddd423e0b05a55ee97384c6cc3b45e608e683f5a70030892bfceb9dfa6f05`) |

## Arquitectura y entrenamiento

El artefacto es una cabeza de decodificación especulativa con tres capas draft que comparte los embeddings de tokens y la cabeza de salida del modelo objetivo Inkling-2-Mini. Puede proponer hasta siete tokens por bloque, que el modelo objetivo verifica en paralelo. El formato se denomina DSpark y consta de 58 tensores, cuyas formas se preservan íntegramente respecto al drafter original.

No se trata de un modelo entrenado desde cero en este repositorio: es una re-cuantización del drafter BF16 mainline convertido a GGUF por Unsloth a partir del modelo original de Thinking Machines. La model card no documenta el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el drafter original; esa información no está disponible en la documentación consultada. La innovación técnica relevante es la preservación exacta de las formas de los 58 tensores tras la cuantización mixta, condición necesaria para que el runtime pueda emparejar la cabeza con el target.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa: propone hasta siete tokens por bloque que el modelo objetivo valida.
- No genera respuestas de forma autónoma; requiere un modelo objetivo Inkling-2-Mini emparejado.
- Compatible con el formato mainline DSpark de 58 tensores.
- Reutiliza los embeddings de tokens y la cabeza de salida del target, por lo que no añade vocabulario propio.
- Etiquetada como conversacional en los metadatos del repositorio, si bien esa etiqueta describe el uso previsto junto al target, no una capacidad propia.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la documentación.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Aceleración de un servidor de inferencia local: emparejar la cabeza con un target Inkling-2-Mini cuantizado (por ejemplo, UD-IQ3_XXS) en un runtime con soporte DSpark para reducir la latencia por token generado en despliegues de un solo nodo.
- Despliegue en placas SBC con Vulkan: el autor probó el artefacto en una build experimental QuarkStar Vulkan sobre placa única, escenario en el que el coste de memoria de la cabeza (317,6 MiB) es asumible frente a un drafter BF16.
- Evaluación de runtimes de decodificación especulativa: sirve como banco de pruebas para validar la implementación de DSpark en motores que aún no soportan el formato de forma estable.
- Investigación sobre cuantización mixta: la asignación por tensor (Q6_K, Q8_0, BF16, F32) permite estudiar el impacto de la precisión del drafter en la tasa de aceptación de tokens especulados.
- Generación de texto conversacional de baja latencia: junto al target, en aplicaciones de chat donde el tiempo hasta el primer token y el throughput por usuario son críticos.
- Reproducibilidad de artefactos: el SHA-256 publicado y el tamaño exacto del fichero permiten verificar la integridad en pipelines de distribución de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de aceptación de tokens, speedups medidos ni comparaciones cuantitativas con otros drafters.

## Requisitos de hardware

- VRAM adicional para la cabeza: aproximadamente 0,32 GB (317,6 MiB) en el fichero GGUF, más el coste del modelo objetivo.
- El target probado por el autor es la cuantización UD-IQ3_XXS de Inkling-2-Mini; el requisito total de memoria depende del target elegido y no está documentado.
- GPU recomendadas: no disponible. El autor solo reporta pruebas en una build Vulkan experimental sobre placa única (QuarkStar), no en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: plausible por el reducido tamaño de la cabeza, pero no verificada en la documentación para ninguna GPU concreta.
- Opciones de despliegue: exclusivamente runtimes con soporte del formato mainline DSpark de 58 tensores. No se confirma compatibilidad con llama.cpp, Ollama, vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles; no se publican métricas de speedup ni de tasa de aceptación.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini DSpark (este) | Draft head especulativa GGUF | 368,5 M | No disponible | Apache 2.0 | Hugging Face (Ninnix96) |
| Inkling-2-Mini DSpark BF16 mainline (Unsloth) | Draft head especulativa GGUF | No disponible | No disponible | No disponible | Hugging Face (unsloth) |
| Inkling-2-Mini (Thinking Machines) | Modelo objetivo | No disponible | No disponible | No disponible | Hugging Face (thinkingmachines) |

No se dispone de datos de rendimiento comparables entre estas variantes ni de alternativas de draft heads de otros autores en la información consultada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin un target Inkling-2-Mini emparejado y un runtime compatible con DSpark, el artefacto no produce salida útil.
- Compatibilidad restringida: solo se ha probado con el target UD-IQ3_XXS en una build Vulkan experimental; otros targets o motores pueden fallar.
- La cuantización mixta puede alterar la tasa de aceptación de tokens especulados respecto al drafter BF16 original; no se han publicado mediciones al respecto.
- Idiomas soportados no declarados: las capacidades lingüísticas dependen enteramente del modelo objetivo.
- Riesgo de alucinación: no evaluable para la cabeza por separado; heredado del target.
- Sesgos: no documentados.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo objetivo y del drafter original de Thinking Machines antes de desplegar en producción.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- El autor califica la build de runtime empleada como experimental, lo que desaconseja su uso en producción sin verificación adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ninnix96/Inkling-2-Mini-DSpark-GGUF
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cabeza BF16 de origen: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF/blob/main/dspark/dspark-Inkling-2-Mini-BF16-mainline.gguf_file
- Notas del formato upstream: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF/blob/main/dspark/README.md

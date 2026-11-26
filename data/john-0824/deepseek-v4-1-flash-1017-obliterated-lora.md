# john-0824/DeepSeek-V4.1-Flash-1017-Obliterated-LoRA

## Resumen

DeepSeek-V4.1-Flash-1017-Obliterated-LoRA es un adaptador LoRA de rango 8 publicado por el usuario john-0824 sobre el modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017`. No es un modelo entrenado desde cero ni un ajuste supervisado al uso: es una representación comprimida de una cirugía de pesos orientada a la eliminación de rechazos (refusal removal o abliteration) sobre las matrices de proyección de atención y de las capas de expertos del modelo original. El autor denomina a esta operación "certified refusal-abliteration weight surgery".

El adaptador codifica el delta quirúrgico de cada tensor editado mediante una SVD de rango 8, de modo que al fusionarlo con los pesos BF16 del modelo base se reproduce la modificación completa. Según la model card, el rango 8 captura más del 99,95 % de la norma del delta por tensor, con valores medidos de 0,9995 en `o_b_proj`, 0,9995 en el down del experto compartido y 0,9998 en el down de los expertos enrutados. El repositorio ocupa 1,7 GB y contiene 29.336 tensores B/A en safetensors.

La relevancia de esta ficha es doble: por un lado documenta una técnica de compresión de modificaciones de pesos (delta quirúrgico → LoRA de rango bajo) que puede ser de interés para investigación en interpretabilidad y edición de modelos; por otro, es un caso claro de adaptador con fines de elusión de salvaguardas, con las implicaciones éticas y de licencia que se detallan más abajo. No se dispone de información sobre arquitectura, tamaño o contexto del modelo base en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre `deepseek-ai/DeepSeek-V4.1-Flash-1017`) |
| Parametros totales | no disponible para el modelo base; el adaptador contiene 29.336 tensores B/A en 1,67 GB |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | el adaptador se distribuye en safetensors (BF16); el modelo base admite FP8 y FP4 según la model card |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (`obliteration_lora_adapter.safetensors`) + `lora_manifest.json` |

## Arquitectura y entrenamiento

El adaptador no entrena parámetros en el sentido habitual: parte de un modelo base ya modificado ("surgically patched") y descompone el delta de cada tensor editado, calculado como `(f−1)·W − f·D^T(DW)` en BF16, en un par de matrices `B [out, 8]` y `A [8, in]` mediante SVD óptima de rango 8. El segundo término de la expresión es exactamente de rango 8 y dominante, lo que explica que la captura de la norma del delta supere el 99,95 % por tensor. La fusión se realiza sumando `B @ A` a los pesos originales, tensor a tensor, según la clave original del checkpoint (por ejemplo `layers.24.attn.wo_b.weight` o `layers.24.ffn.experts.17.w2.weight`).

La cirugía subyacente se basa en direcciones obtenidas mediante una sonda de superficie de escritura con sglang sobre 4.096 prompts dañinos y 4.096 inofensivos de WildGuardMix, usando diferencia de medias y SVD aleatorizada top-8 por capa y superficie. Las direcciones se extirpan de `self_attn.o_b_proj`, `mlp.shared_experts.down_proj` y `mlp.experts.{e}.down_proj` en las capas 2 a 39, preservando la norma de Frobenius por grupo. El adaptador no es cargable con PEFT: debe fusionarse siguiendo el manifiesto incluido.

## Capacidades

- El adaptador hereda las capacidades del modelo base `DeepSeek-V4.1-Flash-1017`, que no se detallan en la información proporcionada.
- Su función específica es la eliminación de rechazos: según la certificación del autor, el build fusionado y recuantizado alcanza un 0,0 % de rechazos (0 de 192 válidos) en un test retenido de 200 prompts, con un 0,0 % de falsos rechazos en prompts inofensivos.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo en la información disponible.
- No se documenta ningún modo de razonamiento (thinking mode) específico del adaptador.

## Casos de uso

- Investigación en edición de modelos e interpretabilidad: el adaptador permite reproducir de forma compacta (1,67 GB frente a un checkpoint completo) una modificación quirúrgica de pesos, lo que facilita estudiar cómo afectan las ablaciones direccionales a las representaciones internas de un modelo grande.
- Estudio de compresión de deltas de pesos: la técnica de SVD de rango 8 por tensor sirve como caso práctico para evaluar cuánta información de una edición de pesos se conserva en un adaptador de bajo rango, con métricas de captura de norma publicadas por tensor.
- Análisis de robustez de salvaguardas: equipos de seguridad pueden usar este adaptador para reproducir y medir la eficacia de ataques de abliteration sobre modelos abiertos y diseñar contramedidas o evaluaciones de refusal.
- Evaluación de la fidelidad tras recuantización: la model card documenta que los grupos FP8 retienen en torno al 98 % del delta y los expertos enrutados en FP4 en torno al 30 % bajo la rejilla e2m1, lo que permite estudiar el impacto de la cuantización en la preservación de ediciones.
- Docencia y formación en seguridad de IA: como ejemplo documentado de una operación de elusión de rechazos con certificación empírica, puede utilizarse en cursos sobre alineación y riesgos de modelos abiertos.
- Reproducción de experimentos de sonda de superficie: el protocolo descrito (4.096 + 4.096 prompts de WildGuardMix, diferencia de medias y SVD aleatorizada top-8 por capa) es replicable para otras arquitecturas con las herramientas adecuadas.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Tasa de rechazo (test retenido de 200 prompts, 192 validos) | 0,0 % |
| Falsos rechazos en prompts inofensivos | 0,0 % |
| Captura de norma del delta, `o_b_proj` | 0,9995 |
| Captura de norma del delta, down del experto compartido | 0,9995 |
| Captura de norma del delta, down de expertos enrutados | 0,9998 |
| Retencion del delta tras recuantizar a FP8 | ~98 % |
| Retencion del delta tras recuantizar a FP4 (e2m1) | ~30 % |

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 1,67 GB en safetensors y puede almacenarse y fusionarse en cualquier máquina con suficiente memoria para cargar el modelo base en BF16.
- La VRAM necesaria para inferencia depende enteramente del modelo base `DeepSeek-V4.1-Flash-1017`, cuyas dimensiones no se detallan en la información proporcionada; no es posible estimarla con rigor.
- No se dispone de datos sobre GPU recomendadas, encaje en GPU de consumo, latencia ni throughput.
- Opciones de despliegue: el adaptador no es cargable con PEFT; debe fusionarse según `lora_manifest.json` antes de servir el modelo con cualquier motor de inferencia (el autor menciona sglang en el protocolo de evaluación). No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Obliterated-LoRA (este) | Adaptador LoRA de abliteration, rango 8 | 29.336 tensores B/A (1,67 GB) | no disponible | MIT | No cargable con PEFT; requiere fusión manual |
| DeepSeek-V4.1-Flash-1017-Obliterated | Modelo completo con cirugía aplicada | no disponible | no disponible | no disponible | Modelo primario del que se deriva este adaptador |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | Modelo base original | no disponible | no disponible | no disponible | Sin modificar; mantiene los rechazos originales |

No se dispone de información suficiente sobre otros adaptadores de abliteration comparables para establecer una comparativa cuantitativa adicional.

## Limitaciones y advertencias

- El propósito declarado del adaptador es eliminar los rechazos del modelo base, lo que puede facilitar la generación de contenido dañino y vulnera las políticas de uso habituales de los modelos abiertos; su uso en producción conlleva riesgos legales y éticos.
- El adaptador no es cargable directamente con PEFT: debe fusionarse manualmente siguiendo el manifiesto, lo que añade complejidad y riesgo de error en el despliegue.
- La fidelidad del delta depende del formato de los pesos: tras recuantizar a FP4, los expertos enrutados retienen solo en torno al 30 % del delta, aunque el autor sostiene que las superficies FP8 conservan la ablación.
- No se documentan sesgos conocidos, tasas de alucinación, limitaciones de contexto ni cobertura idiomática del modelo base en la información proporcionada.
- La licencia MIT del adaptador no exime del cumplimiento de la licencia y términos de uso del modelo base, que no se detallan.
- El repositorio no registra descargas ni likes y fue creado y actualizado el mismo día (26 de noviembre de 2026), por lo que no existe validación independiente de los resultados certificados por el autor.
- Los datos de certificación (0,0 % de rechazos) provienen del propio autor y no han sido replicados por terceros.

## Enlaces

- [Hugging Face: john-0824/DeepSeek-V4.1-Flash-1017-Obliterated-LoRA](https://huggingface.co/john-0824/DeepSeek-V4.1-Flash-1017-Obliterated-LoRA)
- [Modelo completo quirúrgico: john-0824/DeepSeek-V4.1-Flash-1017-Obliterated](https://huggingface.co/john-0824/DeepSeek-V4.1-Flash-1017-Obliterated)
- [Modelo base: deepseek-ai/DeepSeek-V4.1-Flash-1017](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017)

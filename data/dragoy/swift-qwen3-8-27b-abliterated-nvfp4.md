# Dragoy/Swift-Qwen3.8-27B-abliterated-NVFP4

## Resumen

Swift-Qwen3.8-27B-abliterated-NVFP4 es el punto final de una cadena de derivaciones sobre Qwen3.8-27B: el checkpoint base, publicado por UkisAI como Swift-Qwen3.8-27b, ha sido sometido a una ablación del estilo huihui (proyección de la dirección de rechazo, familia Arditi et al. 2024) y posteriormente cuantizado a NVFP4 + FP8 por el usuario Dragoy. No se trata, por tanto, de un modelo entrenado desde cero, sino de un artefacto de pesos modificados y comprimidos que conserva la arquitectura original.

La arquitectura es híbrida mamba/atención, con 64 capas y capacidades multimodales (visión y predicción multi-token). El checkpoint se publica en el formato estándar safetensors de Hugging Face mediante compressed-tensors, de modo que carga directamente en vLLM 0.27.1 y en transformers, y admite decodificación guiada con JSON schema sin herramientas adicionales.

Su relevancia práctica es doble: por un lado, es una de las pocas distribuciones NVFP4 listas para GPU Blackwell (sm_120a) con el módulo MTP incluido; por otro, al ser un modelo sin censura, está pensado para investigación, evaluación y despliegue local donde ese comportamiento se entiende y se busca. El repositorio no tenía descargas ni valoraciones en el momento de redactar esta ficha, y no se han publicado resultados de benchmarks de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida mamba/atención, 64 capas, multimodal (visión + MTP) |
| Parametros totales | 19.409.165.824 según el recuento de safetensors; el nombre comercial del modelo indica 27B |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible de forma explícita; el ejemplo de vLLM usa 32.768 tokens y la documentación del autor menciona ejecuciones con 80.000–120.000 tokens |
| Tipos de cuantizacion | NVFP4 (MLP gate/up/down) + FP8 (atención, GDN, lm_head); existe un GGUF IQ4_XS de terceros (~14,5 GiB) |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0 (con umbral de 1.000.000 USD de facturación anual para uso comercial gratuito) |
| Formato de pesos | safetensors (compressed-tensors), 2 shards, 21,8 GiB, con módulo MTP incluido; también existe una variante NInfer para sm_120a |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que combina capas mamba con capas de atención sobre 64 niveles, e incorpora un tower de visión y un módulo MTP (multi-token prediction) para decodificación acelerada. La asignación de cuantización no es propia: se copió literalmente del `quantization_config` de unsloth/Qwen3.8-27B-NVFP4, con NVFP4 aplicado a las proyecciones gate/up/down del MLP y FP8 a la atención, la capa GDN y el `lm_head`. El proceso se ejecutó con llm-compressor en modo oneshot sobre 32 muestras de calibración, y después se reparó la configuración anidada multimodal que la herramienta aplana.

No hay entrenamiento ni ajuste fino en esta cadena. La ablación se transfirió por diferencia de pesos tensora a tensora entre el par Qwen/Qwen3.8-27B y huihui-ai/Huihui-Qwen3.8-27B-abliterated, y se aplicó al checkpoint de UkisAI. El resultado es un cambio de formato y de pesos, no un modelo nuevo: la model card lo describe explícitamente como "format/weight change, no fine-tuning". No se documentan el número de tokens de entrenamiento, la composición del dataset, ni fases de RLHF o DPO del modelo original. La verificación consistió en una preflight de formas y una prueba de humo con vLLM 0.27.1 sobre una RTX PRO 6000.

## Capacidades

- Generación de texto conversacional, con el pipeline declarado como image-text-to-text.
- Entrada multimodal de imagen y texto (tower de visión incluido en el checkpoint).
- Predicción multi-token (MTP) para acelerar la decodificación, con el módulo empaquetado en el propio repositorio.
- Salida estructurada mediante JSON schema a través de la decodificación guiada de vLLM.
- Comportamiento sin censura: al haberse eliminado la dirección de rechazo, intentará peticiones que un modelo ajustado estándar declina.
- Tool calling y function calling: no disponible en la documentación.
- Uso como agente y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.

## Casos de uso

- Inferencia local en dos GPU de 16 GB: el checkpoint NVFP4 funciona con tensor parallel 2 sobre 2 × RTX 5070 Ti, con 54–120 tok/s de decodificación usando MTP y ventanas de 80.000–120.000 tokens.
- Despliegue en GPU Blackwell: validado sobre RTX PRO 6000 (sm_120a) con vLLM 0.27.1, aprovechando el soporte nativo de NVFP4 del hardware.
- Salida estructurada en pipelines: la decodificación guiada por JSON schema permite integrar el modelo como extractor de campos en flujos de datos donde la respuesta debe ajustarse a un contrato fijo.
- Procesamiento de documentos con imagen: al aceptar entradas image-text-to-text, puede emplearse para descripción, extracción o clasificación de contenido visual junto a instrucciones textuales.
- Investigación sobre alineación y direcciones de rechazo: sirve como material de estudio para comparar el comportamiento del modelo abliterado frente al original de Qwen y medir el efecto de la proyección sobre la dirección de rechazo.
- Red teaming y evaluación de seguridad: al no aplicar rechazos, es útil como generador adversario en pruebas internas de filtros y clasificadores de contenido.
- Contextos largos con memoria limitada: la arquitectura híbrida mamba/atención mantiene la caché KV pequeña, de modo que el cuello de botella en tarjetas modestas es el tamaño de los pesos y no la longitud de contexto.
- Despliegue con offload: mediante `--cpu-offload-gb` en vLLM o `-ngl` parcial en llama.cpp se puede ejecutar con calidad 1:1 a costa de bajar a un rango de 15–40 tok/s.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación de calidad, y la búsqueda web realizada no ha devuelto documentación técnica del modelo.

Lo único cuantificado son datos de rendimiento en inferencia, recogidos en la documentación del autor y en una discusión de terceros:

| Escenario | Throughput de decodificación | Contexto |
|---|---|---|
| 2 × RTX 5070 Ti (16 GB), tensor parallel 2, con MTP | 54–120 tok/s | 80.000–120.000 tokens |
| NVFP4 con offload a CPU (vLLM `--cpu-offload-gb` o llama.cpp parcial) | 15–40 tok/s | no disponible |

## Requisitos de hardware

- VRAM para NVFP4: los pesos solos ocupan 21,8 GiB, por lo que una tarjeta de 16 GB no es suficiente en este formato.
- GPU validadas: RTX PRO 6000 (sm_120a) para la verificación oficial; 2 × RTX 5070 Ti (16 GB cada una) con tensor parallel 2 según la discusión enlazada.
- Tarjetas de 24 GB: el autor documenta una receta específica para contexto largo.
- Alternativa para 16 GB: el GGUF IQ4_XS de terceros (~14,5 GiB, con imatrix y cabecera MTP) mediante llama.cpp o LM Studio, aunque esa distribución es solo texto.
- Consumer GPU: cabe en 2 × 16 GB, en 24 GB y, en formato GGUF, en una única tarjeta de 16 GB; no cabe en una de 16 GB con los pesos NVFP4.
- Caché KV: la arquitectura híbrida mamba/atención la mantiene reducida, así que la restricción real en tarjetas pequeñas es el tamaño de los pesos, no el contexto.
- Opciones de despliegue: vLLM 0.27.1 (`vllm serve dragoy/Swift-Qwen3.8-27B-abliterated-NVFP4 --max-model-len 32768 --gpu-memory-utilization 0.9`), transformers, llama.cpp y LM Studio con la variante GGUF.
- Notas de entorno: se requiere exportar `VLLM_USE_FLASHINFER_SAMPLER=0` si no hay nvcc disponible en el contenedor.
- Latencia y throughput: 54–120 tok/s con MTP en configuración TP2; 15–40 tok/s con offload a CPU. No se documentan cifras de prefill ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Este modelo (Dragoy, abliterated NVFP4) | 19.409.165.824 según safetensors | no disponible; 80–120K documentados en TP2 | safetensors NVFP4 + FP8 | Swift Open License v1.0 | publico, 0 descargas |
| unsloth/Qwen3.8-27B-NVFP4 | no disponible | no disponible | safetensors NVFP4 | no disponible | publico; origen de la receta de cuantización |
| ukisai/Swift-Qwen3.8-27b | no disponible | no disponible | safetensors (sin cuantizar) | Swift Open License v1.0 | publico; modelo base directo |
| jakeatx/ATX-Swift-Qwen3.8-27B-Uncensored-IQ4_XS-M-GGUF | no disponible | no disponible | GGUF IQ4_XS (~14,5 GiB) | no disponible | publico; solo texto, para tarjetas de 16 GB |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | no disponible | no disponible | no disponible | no disponible | publico; fuente de la dirección de ablación |

No se dispone de cifras de rendimiento comparadas entre estos modelos, por lo que la comparativa se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo sin censura: la ablación elimina la dirección de rechazo, de modo que el modelo responderá a peticiones que un modelo ajustado estándar declina. Esto incluye contenido dañino, ilegal o inseguro si el usuario lo solicita.
- Uso responsable: está pensado para investigación, evaluación y despliegue local donde ese comportamiento se entiende y se acepta; no es adecuado como modelo de cara al público sin filtros externos.
- Licencia restrictiva: no es Apache-2.0. El uso comercial gratuito está limitado a entidades con facturación anual inferior a 1.000.000 USD; por encima de ese umbral se requiere una Swift Enterprise License por escrito de UkisAI. Las organizaciones sin ánimo de lucro cualificadas no tienen umbral para uso no comercial o de investigación. La redistribución obliga a incluir ambos ficheros de licencia, mantener las atribuciones y marcar los ficheros modificados.
- Es un derivado, no un modelo entrenado: la calidad depende enteramente del checkpoint Swift original y de la fidelidad de la transferencia de la ablación y de la cuantización.
- Cuantización agresiva: NVFP4 en las proyecciones del MLP y FP8 en atención introduce una pérdida de precisión no cuantificada en la información disponible.
- Discrepancia de tamaño: el nombre comercial indica 27B, pero el recuento real de safetensors es de 19.409.165.824 parámetros; conviene verificar el conteo efectivo antes de planificar despliegues.
- Idiomas no documentados: no hay lista de idiomas soportados, por lo que el comportamiento multilingüe es desconocido.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni de tasas de alucinación; se asume el riesgo habitual de un modelo de esta familia.
- Sin validación comunitaria: el repositorio no tenía descargas ni valoraciones en el momento de redactar la ficha, y no hay benchmarks de calidad publicados.
- Verificación limitada: la comprobación del autor se reduce a una preflight de formas y una prueba de humo en vLLM; no hay evaluación funcional exhaustiva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Dragoy/Swift-Qwen3.8-27B-abliterated-NVFP4
- Variante NInfer para Blackwell (sm_120a): https://huggingface.co/Dragoy/Swift-Qwen3.8-27B-abliterated-NVFP4-NInfer
- Modelo base Swift: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo abliterado de referencia: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Origen de la receta de cuantización NVFP4: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Discusión con el benchmark de 2 × 16 GB: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4/discussions/16
- GGUF IQ4_XS de terceros: https://huggingface.co/jakeatx/ATX-Swift-Qwen3.8-27B-Uncensored-IQ4_XS-M-GGUF
- Licencia del repositorio (Swift Open License v1.0): https://huggingface.co/Dragoy/Swift-Qwen3.8-27B-abliterated-NVFP4/blob/main/LICENSE
- Licencia Apache-2.0 del modelo base Qwen: https://huggingface.co/dragoy/Swift-Qwen3.8-27B-abliterated-NVFP4/blob/main/LICENSE-APACHE-2.0

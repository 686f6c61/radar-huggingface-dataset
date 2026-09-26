# diffusionstudio/sam2.1-tiny-video-onnx-fp16

## Resumen
diffusionstudio/sam2.1-tiny-video-onnx-fp16 es una conversión a ONNX en precisión fp16 del modelo square-zero-labs/sam2.1-tiny-video-onnx, que a su vez exporta facebook/sam2.1-hiera-tiny. No es un modelo de lenguaje: es un tracker completo de SAM 2.1 para segmentación y seguimiento de objetos en vídeo, con codificador de imagen Hiera, memory encoder, memory attention, mask decoder y object pointers. Está pensado para ejecutarse con ONNX Runtime Web y WebGPU, y lo utiliza la herramienta de máscaras de objetos de Diffusion Studio.

La relevancia de este build es práctica: reduce la descarga a unos 95 MB al almacenar pesos y cómputo en float16, mantiene entradas y salidas en float32 con un cast en cada límite de grafo y conserva nombres, formas y estructura de los grafos, por lo que puede sustituir directamente a la versión fp32 en un pipeline ya construido. El repositorio ocupa 0,1 GB y la licencia declarada es Apache 2.0.

Frente a la versión fp32, el autor reporta una mejora de velocidad en un clip de 1080×1920: 1,34 s por fotograma frente a 2,17 s, con una IoU de máscara mínima de 0,997 y media de 0,999 en 60 fotogramas. Es, por tanto, una pieza de infraestructura para vídeo, no un modelo generativo de texto.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | SAM 2.1 Hiera-Tiny: codificador de imagen Hiera, memory encoder, memory attention, mask decoder y object pointers; exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de segmentación y seguimiento de vídeo, no generativo de texto); la memoria temporal usa tokens de memoria de 4096 y una memoria de hasta 28736 tokens, según los grafos ONNX |
| Tipos de cuantización | fp16 (float16) en pesos y cómputo; entradas y salidas en float32 con cast en los límites de cada grafo |
| Idiomas soportados | no aplica (no procesa lenguaje natural; trabaja con imagen y vídeo) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX: vision_encoder.onnx, mask_decoder.onnx, memory_encoder.onnx, memory_attention.onnx, pointer_tpos.onnx |

## Arquitectura y entrenamiento
El modelo es una exportación ONNX de SAM 2.1 Hiera-Tiny orientada a seguimiento de vídeo. Incluye el codificador de visión, que recibe `pixel_values [1,3,1024,1024]` y produce `feats0`, `feats1`, `feats2`, `feats2_no_mem` y `vision_pos_embed`; el decodificador de máscaras, que acepta puntos y etiquetas (`input_points [1,1,N,2]`, `input_labels [1,1,N] int32`) y devuelve `low_res_mask`, `high_res_mask`, `iou`, `object_score_logits` y `object_pointer`; el codificador de memoria, que genera `memory_tokens [4096,1,64]` y `memory_pos [4096,1,64]`; la atención sobre memoria, que produce `conditioned_feats [1,256,64,64]` a partir de features de visión actuales y memoria de hasta `[28736,1,64]`; y el módulo `pointer_tpos`, que transforma diferencias normalizadas en posiciones de puntero.

Este repositorio no entrena un modelo desde cero: es una conversión del export fp32 de square-zero-labs, revisión `3b2984d`, que a su vez deriva de facebook/sam2.1-hiera-tiny. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni fases de RLHF o DPO, que además no aplican a un modelo de segmentación no generativo. La innovación técnica del build es la conversión a float16: los pesos y el cómputo se almacenan y ejecutan en fp16, mientras que las entradas y salidas siguen siendo float32 gracias a un cast en cada frontera; las constantes se plegaron en float32 antes de la conversión, de modo que los positional encodings se calculan a precisión completa y solo se almacenan como mitades. El script de conversión indicado es `packages/sam2/scripts/convert_fp16.py` dentro del repositorio de Diffusion Studio.

## Capacidades
- Segmentación interactiva de objetos en vídeo a partir de puntos de entrada y etiquetas.
- Seguimiento de objetos a lo largo de fotogramas mediante memoria temporal, memory attention y object pointers.
- Generación de máscaras en baja y alta resolución, puntuación IoU, logits de object score y puntero de objeto.
- Ejecución en navegador con ONNX Runtime Web y WebGPU, sin necesidad de un servidor de inferencia dedicado.
- Integración en la herramienta de máscaras de objetos de Diffusion Studio.
- No genera texto, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-step.
- No es multilingüe: no procesa ni produce lenguaje natural.
- No soporta audio, voz ni visión general tipo VLM; su dominio es específicamente la máscara y el seguimiento visual.

## Casos de uso
- Rotoscopia y enmascarado de objetos en postproducción: el modelo recibe puntos sobre un objeto en un fotograma y propaga la máscara por el resto del clip, lo que permite aislar personas, productos o elementos para composición y etalonaje.
- Editor de vídeo asistido por IA: Diffusion Studio lo usa en su herramienta de máscaras de objetos para que el usuario seleccione un elemento y el sistema lo siga en secuencias de 1080×1920 sin salir del navegador.
- Efectos visuales y corrección de color selectiva: la máscara de alta resolución permite aplicar efectos, desenfoques o ajustes de color únicamente sobre el objeto seguido.
- Análisis deportivo: seguimiento de jugadores, balones o elementos de equipo en vídeo, con la memoria temporal del modelo para mantener la identidad del objeto entre fotogramas.
- Vigilancia y análisis de tráfico: segmentación y seguimiento de vehículos o peatones en flujos de vídeo, aprovechando la ejecución ONNX y la memoria de objetos.
- Etiquetado de datos y preanotación de datasets: generación automática de máscaras por fotograma para que un equipo humano las revise y corrija, reduciendo el coste de anotación en vídeo.
- Aplicaciones web interactivas: inferencia en el navegador mediante WebGPU, lo que evita subir el vídeo a un servidor y facilita demos, prototipos y herramientas de edición locales.
- Realidad aumentada y superposición gráfica: seguimiento de un objeto o superficie para anclar elementos gráficos o filtros que deben mantenerse alineados con el vídeo.

## Benchmarks y rendimiento
Los únicos datos publicados en la información disponible son la comparación fp32 frente a fp16 medida con el bucle completo de seguimiento sobre un clip de 1080×1920, con ONNX Runtime Web 1.30 y WebGPU en un Apple M1 con GPU de 8 núcleos.

| Métrica | fp32 | fp16 |
|---|---|---|
| Tiempo por fotograma seguido | 2,17 s | 1,34 s |
| IoU de máscara frente a fp32, 60 fotogramas | — | mínimo 0,997; media 0,999 |

El throughput aproximado derivado para fp16 es de 1 / 1,34 s ≈ 0,75 fotogramas por segundo en ese entorno concreto. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de modelos de lenguaje, porque no es un modelo de lenguaje.

## Requisitos de hardware
- VRAM estimada: no disponible. El peso fp16 ocupa unos 95 MB de descarga y el repositorio completo 0,1 GB, pero la inferencia necesita memoria adicional para activaciones, features y memoria temporal.
- Memoria temporal: los grafos manejan `memory_tokens [4096,1,64]` y una memoria de atención de hasta `[28736,1,64]`, lo que condiciona el consumo según la longitud del vídeo y la implementación.
- GPU recomendadas: no hay una lista oficial. El autor ha validado el modelo en un Apple M1 con GPU de 8 núcleos mediante WebGPU.
- GPU consumer: no se publican requisitos mínimos. Por el tamaño de los pesos es plausible que funcione en GPUs de gama media o incluso integradas compatibles con WebGPU, pero no está confirmado en la información disponible.
- Opciones de despliegue: ONNX Runtime Web con WebGPU es el entorno documentado; la integración en Diffusion Studio es el caso de uso declarado. No aplican vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje.
- Latencia y throughput: 1,34 s por fotograma en fp16 y 2,17 s por fotograma en fp32 para un clip de 1080×1920 en Apple M1 con GPU de 8 núcleos; aproximadamente 0,75 fps en el caso fp16.

## Comparativa con modelos similares
| Modelo | Formato | Precisión | Tamaño | Funcionalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| diffusionstudio/sam2.1-tiny-video-onnx-fp16 | ONNX | fp16 | ~95 MB de descarga; repo 0,1 GB | Tracker completo SAM 2.1: vision encoder, mask decoder, memory encoder, memory attention y pointer | apache-2.0 | Hugging Face |
| square-zero-labs/sam2.1-tiny-video-onnx | ONNX | fp32 | no disponible | Misma funcionalidad, versión base fp32 de la que deriva este build | no disponible en la información proporcionada | Hugging Face |
| ipsilondev/sam2.1-hiera-tiny-ONNX | ONNX | fp16 | no disponible | Solo incluye `vision_encoder_fp16.onnx`; no es un tracker completo con memoria y decodificador | no disponible en la información proporcionada | Hugging Face |
| facebook/sam2.1-hiera-tiny | PyTorch | no disponible | no disponible | Modelo base SAM 2.1 Hiera-Tiny | no verificada en la información proporcionada; consultar el repositorio de Meta | Hugging Face y GitHub |

## Limitaciones y advertencias
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni agentes, ni razonamiento multi-step.
- No procesa idiomas ni texto; no tiene capacidades multilingües.
- No incorpora audio, voz ni comprensión visual general.
- La conversión fp16 introduce una degradación numérica muy pequeña pero existente: IoU mínima de 0,997 frente a fp32 en la prueba publicada. En casos límite, oclusiones, objetos similares o cambios bruscos de apariencia, la máscara puede fallar o desviarse.
- El rendimiento publicado corresponde a un único entorno: ONNX Runtime Web 1.30, WebGPU y Apple M1 con GPU de 8 núcleos. No hay garantías de latencia equivalente en otras GPUs, navegadores o versiones de runtime.
- Las entradas y salidas son float32, aunque el cómputo sea fp16; los pipelines que esperen tensores fp16 en las fronteras deben adaptarse o confiar en el cast del grafo.
- La memoria temporal del tracker está acotada por los tokens de memoria y la atención sobre memoria; vídeos muy largos o con muchas oclusiones pueden degradar el seguimiento.
- La licencia declarada es Apache 2.0, que permite uso comercial, pero conviene revisar los términos del modelo base facebook/sam2.1-hiera-tiny y del export square-zero-labs, ya que la información disponible no detalla todas las condiciones heredadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación comunitaria amplia.
- No se han publicado datos de sesgos, y al no ser un modelo de lenguaje no aplica la noción habitual de alucinación textual; sí existe riesgo de máscaras incorrectas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/diffusionstudio/sam2.1-tiny-video-onnx-fp16
- Export base fp32: https://huggingface.co/square-zero-labs/sam2.1-tiny-video-onnx
- Modelo base de Meta: https://huggingface.co/facebook/sam2.1-hiera-tiny
- Repositorio de SAM 2: https://github.com/facebookresearch/sam2
- Export ONNX alternativo de Hiera-Tiny: https://huggingface.co/ipsilondev/sam2.1-hiera-tiny-ONNX
- Vision encoder fp16 alternativo: https://huggingface.co/ipsilondev/sam2.1-hiera-tiny-ONNX/blob/main/vision_encoder_fp16.onnx
- Diffusion Studio: https://www.diffusion.studio/
- Repositorio de Diffusion Studio: https://github.com/diffusionstudio

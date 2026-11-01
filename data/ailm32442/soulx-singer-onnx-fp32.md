# ailm32442/SoulX-Singer-onnx-fp32

## Resumen

SoulX-Singer ONNX (fp32) es una exportación a formato ONNX del modelo SoulX-Singer, un sistema de síntesis de voz cantada (singing voice synthesis, SVS) en modo zero-shot desarrollado por Soul AI Lab. Este repositorio concreto no contiene los pesos originales en su formato nativo, sino una conversión a ONNX dividida en 9 grafos independientes más 7 ficheros de pesos externos (`.onnx.data`), pensada para su ejecución con ONNX Runtime sobre DirectML, CUDA o CPU. La publicación corre a cargo del usuario `ailm32442` y redistribuye material generado por herramientas de terceros (SXSEditor) a partir de los pesos upstream.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje ni de un modelo multimodal generalista, sino de un artefacto de despliegue para una tarea muy específica (generar voces cantadas a partir de partitura simbólica y una referencia de timbre). Su interés práctico está en que permite ejecutar el pipeline completo de inferencia sin depender del framework original, a costa de una integración manual de los 16 ficheros y de un consumo de disco de 2,66 GiB en esta variante de alta fidelidad.

No se dispone de información sobre el número de parámetros, la longitud de contexto (en este dominio, duración máxima de audio o de secuencia musical), los idiomas soportados ni los datos de entrenamiento en la información proporcionada. Todo lo que sigue se limita a lo que la model card y los metadatos del repositorio permiten afirmar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de síntesis de voz cantada zero-shot exportado a ONNX en 9 grafos (encoders de nota, pitch, tipo y F0, preflow, cond_emb, mel_transform, paso de flow-matching y vocoder); arquitectura interna del modelo original no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp32 (esta exportación); existe una variante fp16 de 1,44 GB en el ecosistema del mismo export |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (9 grafos `.onnx`) + 7 ficheros de pesos externos `.onnx.data` |
| Tamaño del repositorio | 2,66 GiB (2.853.872.164 bytes) |
| Pipeline declarado en HuggingFace | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es una exportación, no un entrenamiento nuevo. La model card describe un pipeline descompuesto en grafos especializados: cuatro encoders (`note_text_encoder`, `note_pitch_encoder`, `note_type_encoder`, `f0_encoder`), un módulo de preflow (`preflow.onnx`, 16,9 MB de pesos), un encoder de condicionamiento (`cond_emb.onnx`), una transformación a mel (`mel_transform.onnx`), el grafo central de paso de flow-matching (`diff_step_dml.onnx`, 1,77 GB) y el vocoder (`vocoder_dml.onnx`, 1,05 GB). La presencia de un paso de flow-matching invocado de forma iterativa (16 a 32 pasos según la model card) y de un vocoder separado es coherente con las arquitecturas modernas de síntesis de audio basadas en difusión o flow matching, aunque la model card no detalla la topología interna (transformer, convolucional, etc.) del modelo original.

En cuanto a entrenamiento, no hay información en la documentación proporcionada sobre volumen de datos, composición del corpus, idiomas de entrenamiento ni si se aplicaron técnicas de alineamiento o preferencia (RLHF/DPO), que por otra parte son poco habituales en este dominio. La innovación técnica declarada es de despliegue: la división en grafos permite ejecutar el pipeline con ONNX Runtime y seleccionar proveedor de ejecución (DirectML, CUDA, CPU), y los grafos de encoder son byte-idénticos entre la variante fp16 y esta fp32, de modo que solo difieren los dos grafos pesados. Los pesos se localizan mediante rutas relativas grabadas dentro del grafo, lo que obliga a mantener los 16 ficheros en el mismo directorio.

## Capacidades

- Síntesis de voz cantada en modo zero-shot: genera audio cantado a partir de una referencia, sin necesidad de reentrenamiento por voz según la descripción del modelo upstream.
- Control simbólico de la interpretación: los encoders de nota, pitch, tipo de nota y F0 sugieren control explícito sobre altura, duración y contorno de frecuencia fundamental.
- Generación de mel-espectrogramas y conversión a forma de onda mediante vocoder dedicado.
- Ejecución multiplataforma vía ONNX Runtime: DirectML (Windows), CUDA y CPU.
- No consta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking: no es un modelo de lenguaje.
- No consta soporte de visión, audio de entrada general ni otras modalidades distintas de la síntesis cantada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Prototipado de voces cantadas en producción musical: el pipeline permite generar tomas de prueba con un timbre de referencia y una partitura simbólica, útil para maquetas antes de grabar voces reales.
- Integración en herramientas de edición tipo DAW o editor SVS: al estar dividido en grafos ONNX, cada etapa (encoders, flow-matching, vocoder) puede invocarse por separado desde una aplicación de escritorio, lo que facilita la edición iterativa de notas y el recálculo parcial.
- Despliegue en Windows con aceleración DirectML: los nombres de los grafos (`diff_step_dml`, `vocoder_dml`) indican que la exportación está pensada para ejecutarse sobre DirectML, lo que permite usar GPU de consumo sin pila CUDA.
- Servicios de demostración y evaluación de modelos SVS: al ser un artefacto autocontenido de 2,66 GiB, sirve para comparar la calidad de la variante fp32 frente a la fp16 en la misma canalización.
- Investigación en síntesis de voz cantada: permite reproducir el pipeline upstream sin depender del código original, aislando etapas concretas (por ejemplo, sustituir el vocoder y medir el efecto en la calidad).
- Generación por lotes en CPU para volúmenes pequeños: al soportar el proveedor de ejecución CPU de ONNX Runtime, puede ejecutarse en servidores sin GPU, aceptando mayor latencia.
- Integración en pipelines de conversión de formato: los ficheros `.onnx.data` con hashes SHA-256 publicados permiten verificar la integridad de la descarga en entornos de CI antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (MOS, similitud de timbre, error de F0) ni comparaciones cuantitativas con otros sistemas de síntesis cantada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, los dos grafos pesados suman unos 2,8 GB en fp32 (`diff_step_dml.onnx` 1,77 GB y `vocoder_dml.onnx` 1,05 GB), a lo que hay que añadir activaciones y el resto de grafos; una GPU con 6-8 GB de VRAM es un punto de partida razonable, pero no está confirmado por el autor.
- GPU recomendadas: no disponible. La exportación está orientada a DirectML, por lo que cualquier GPU compatible con DirectML (incluidas integradas y de consumo) es candidata; también admite CUDA y CPU mediante ONNX Runtime.
- GPU de consumo: previsiblemente sí, dado el tamaño de los pesos, aunque sin cifras oficiales de consumo de memoria en ejecución.
- Opciones de despliegue: ONNX Runtime con proveedor DirectML, CUDA o CPU. No consta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card solo indica que el grafo de flow-matching se invoca repetidamente entre 16 y 32 pasos, lo que domina el coste computacional de la generación.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo original que permitan una comparación rigurosa con otros sistemas de síntesis de voz cantada. La única comparación documentada es interna al propio ecosistema de exportación:

| Variante | Tamaño | Grafos pesados | Uso |
|---|---|---|---|
| SoulX-Singer ONNX fp32 (este repo) | 2,66 GiB | `diff_step_dml` y `vocoder_dml` en fp32 | Máxima fidelidad |
| SoulX-Singer ONNX fp16 | 1,44 GB | Mismos grafos en fp16; encoders byte-idénticos | Menor huella, fidelidad ligeramente inferior |

Frente a otros sistemas SVS de la literatura (por ejemplo, enfoques basados en difusión o en modelos acústicos con vocoder neuronal), no hay información proporcionada que permita comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Artefacto de exportación, no modelo original: la responsabilidad de la calidad final recae en los pesos upstream de Soul-AILab; este repositorio solo cambia el formato.
- Integración frágil: los 16 ficheros deben permanecer en el mismo directorio porque las rutas de los pesos están grabadas dentro de los grafos; mover o renombrar ficheros rompe la carga.
- Sin métricas publicadas: no hay benchmarks, evaluaciones de calidad ni datos de latencia que permitan estimar el rendimiento en producción.
- Idiomas y cobertura de voces: no disponibles; no se puede garantizar soporte de castellano ni de ninguna otra lengua concreta.
- Riesgo de alucinación en el sentido de artefactos de audio: en síntesis cantada, los fallos se manifiestan como desafinación, ruido, inestabilidad en notas largas o voces inexistentes; no hay documentación sobre estos modos de fallo en esta exportación.
- Licencia: Apache-2.0 permite uso comercial y redistribución, pero exige conservar avisos de atribución; la model card remite al fichero `NOTICE` del proyecto consumidor. Conviene verificar también la licencia de los pesos upstream y del export SXSEditor antes de un despliegue comercial.
- Procedencia: los bytes se replican desde ModelScope y el export proviene de una herramienta de terceros; los hashes SHA-256 publicados permiten verificar integridad, pero no hay auditoría independiente del contenido.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los problemas de integración estén documentados por la comunidad.
- Fecha de creación declarada en 2026-10-31: metadato anómalo que conviene contrastar antes de citar el artefacto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ailm32442/SoulX-Singer-onnx-fp32
- Pesos upstream (GitHub): https://github.com/Soul-AILab/SoulX-Singer
- Export ONNX (SXSEditor, build DirectML): https://github.com/qq50331623/SXSEditor
- Origen replicado en ModelScope: https://modelscope.cn/models/syxppp/SoulX-Singer-onnx-directml
- Paper, blog o demo oficiales: no disponible en la información proporcionada.

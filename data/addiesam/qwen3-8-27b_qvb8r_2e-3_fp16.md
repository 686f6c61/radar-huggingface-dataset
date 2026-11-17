# addiesam/Qwen3.8-27B_qvb8r_2e-3_fp16

## Resumen

Qwen3.8-27B_qvb8r_2e-3_fp16 es un paquete de pesos comprimido del modelo Qwen/Qwen3.8-27B, publicado por el investigador independiente addiesam (Dr. Addie Sam) bajo licencia Apache-2.0. No es un modelo entrenado desde cero, sino una versión comprimida del modelo base de Qwen mediante el formato propietario QVB8R, diseñado para ejecutarse exclusivamente en el motor de inferencia QVB8, también del mismo autor. El paquete ocupa 13,6 GB en disco y aplica una compresión con cota L∞ certificada de tau = 0,002, lo que garantiza que el error máximo de cada peso restaurado respecto al original en bf16 es inferior a ese umbral.

El modelo base Qwen3.8-27B emplea una arquitectura híbrida Gated-DeltaNet con atención y entrada de visión, según indica la model card. La propuesta de este paquete es reducir el espacio en disco y permitir ejecutar un modelo de gran tamaño en hardware más modesto, gracias a una media de 3,91 bits por peso en los 618 tensores comprimidos. La innovación principal es el enfoque de compresión certificada: en lugar de optimizar una métrica media como la perplejidad, se acota el error máximo por peso, lo que ofrece garantías sobre el peor caso.

Es relevante ahora porque propone un enfoque alternativo a la cuantización tradicional (GPTQ, AWQ, GGUF), con garantías formales de error y un motor de inferencia propio con decodificación especulativa mediante un modelo draft (DFlash2). No obstante, su adopción está limitada por la dependencia total del motor QVB8 y la ausencia de resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Gated-DeltaNet / atención, con entrada de visión (modelo base Qwen3.8-27B) |
| Parametros totales | 3.080.944 (dato del repo safetensors del paquete); el modelo base se denomina 27B, pero no se dispone del recuento exacto de parámetros del original |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QVB8R con cota L∞ tau = 0,002; media de 3,91 bits por peso en los 618 tensores comprimidos; certificado para restauración en fp16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | QVB8R (safetensors como contenedor del repo); no cargable en transformers |
| Tamano en disco | 13,6 GB |
| Error maximo certificado | 0,001999 (max_err por tensor en manifest.json) |
| Modelo base | Qwen/Qwen3.8-27B (bf16) |
| Motor de inferencia | QVB8 Inference Engine v1.2.0 o superior |

## Arquitectura y entrenamiento

El paquete no entrena ningún modelo: comprime los pesos del Qwen3.8-27B original, que según la model card usa una arquitectura híbrida Gated-DeltaNet con atención y capacidad de entrada visual. La compresión se realiza matriz por matriz, asignando un ancho de bits por fila y verificando el resultado tras el empaquetado. Para cada tensor se registra el error máximo entre el valor restaurado y el peso original en bf16 en el campo `max_err` de `manifest.json`, y ningún tensor supera tau = 0,002. El proceso no utiliza datos de calibración: depende únicamente de los pesos.

La innovación técnica es la cota L∞ certificada, que controla el error máximo en lugar del error medio. Según el autor, esto evita que unos pocos pesos con error grande (que una métrica media ocultaría) provoquen fallos puntuales como palabras erróneas o caracteres de otro idioma. El paquete está certificado para restauración en fp16 y debe ejecutarse con `--dtype fp16`. El motor QVB8 decodifica los pesos comprimidos en la GPU dentro de sus propios kernels CUDA y soporta decodificación especulativa mediante un modelo draft DFlash2 (paquete separado de 1,5 GB, tau = 5e-3, DRAFT_K=7). No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si el modelo base usó RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline text-generation, etiqueta conversational).
- Entrada de visión, según la arquitectura del modelo base Qwen3.8-27B indicada en la model card.
- Razonamiento y matemáticas: capacidades heredadas del modelo base, sin benchmarks publicados en este paquete.
- Generación de código: presumible por el modelo base, sin datos específicos en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara idiomas soportados.
- Decodificación especulativa mediante modelo draft DFlash2 para acelerar la inferencia.

## Casos de uso

- Despliegue de un modelo de gran tamaño en hardware con VRAM limitada: el paquete de 13,6 GB permite cargar el modelo comprimido en GPUs donde el original en bf16 no cabría, gracias a la decodificación de pesos en los kernels CUDA del motor QVB8.
- Investigación sobre compresión certificada: útil para reproducir y evaluar el enfoque de cota L∞ comparándolo con cuantizaciones medias como GPTQ o AWQ, midiendo el impacto del error máximo en la calidad de las respuestas.
- Servicio de chat local con decodificación especulativa: el motor QVB8 permite arrancar un servidor en el puerto 8080 con el modelo y su draft DFlash2, adecuado para prototipos de asistentes conversacionales.
- Evaluación de robustez frente a cuantización: al conocer el error máximo por tensor, se puede analizar qué capas son más sensibles y cómo afecta tau a la calidad, útil en estudios académicos sobre cuantización.
- Aplicaciones con entrada de imágenes y texto: si se confirma la capacidad de visión del modelo base, podría usarse para descripción de imágenes o respuesta a preguntas visuales, aunque no hay benchmarks que lo validen en este paquete.
- Experimentación con motores de inferencia alternativos: sirve como caso de estudio de un ecosistema cerrado (formato QVB8R + motor QVB8) frente a estándares abiertos como GGUF o safetensors con transformers.
- Reproducción de investigación publicada: los tres papers del autor sobre compresión L∞ permiten replicar el proceso con otros modelos y tamaños de tau.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el paquete ocupa 13,6 GB en disco y se restaura en fp16, por lo que se requiere al menos una GPU con capacidad para los pesos descomprimidos y el estado de inferencia.
- GPU recomendadas: no disponible; el autor menciona que necesita máquinas para probar "otras generaciones de GPU", sin especificar modelos.
- Compatibilidad con GPU de consumo: no confirmada; el motor QVB8 decodifica en la GPU mediante kernels CUDA propios, pero no se indican requisitos mínimos.
- Opciones de despliegue: exclusivamente el QVB8 Inference Engine v1.2.0 o superior (no compatible con vLLM, llama.cpp, Ollama, TGI ni transformers).
- Modelo draft: se recomienda el paquete Qwen3.8-27B-DFlash2_qvb8r_5e-3_fp16 (1,5 GB) con DRAFT_K=7 para decodificación especulativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Motor compatible | Tamano en disco |
|---|---|---|---|---|---|---|
| Qwen3.8-27B_qvb8r_2e-3_fp16 (este) | 3.080.944 (repo); base 27B | no disponible | QVB8R | Apache-2.0 | Solo QVB8 | 13,6 GB |
| Qwen3.8-27B_qvb8_1e-3_fp16 (mismo autor, tau menor) | base 27B | no disponible | QVB8 | Apache-2.0 | Solo QVB8 | 21,6 GB |
| Qwen/Qwen3.8-27B (original) | 27B (nominal) | no disponible | bf16 (safetensors) | Apache-2.0 | transformers y otros | no disponible |
| Qwen3.5-9B_qvb8_1e-3_fp16 (mismo autor, menor tamano) | base 9B | no disponible | QVB8 | Apache-2.0 | Solo QVB8 | 7,6 GB |

La comparativa con cuantizaciones estándar (GGUF Q4_K_M, AWQ, GPTQ) no está disponible en la información proporcionada, ya que el autor no publica métricas de perplejidad ni benchmarks frente a esos formatos.

## Limitaciones y advertencias

- Dependencia total del motor QVB8: el paquete no carga en transformers ni en otros motores, lo que limita la portabilidad y ata el uso a un proyecto mantenido por un único investigador.
- La cota L∞ cubre únicamente los pesos almacenados; no garantiza que las respuestas sean idénticas a las del modelo original ni correctas. Diferencias en el motor, el tamaño de lote o el orden de operaciones en coma flotante producen salidas distintas.
- Riesgo de alucinación: inherente al modelo base; no hay evaluación publicada en este paquete.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no declarados; no se puede confirmar el rendimiento multilingüe.
- Longitud de contexto: no disponible; no se puede planificar su uso en tareas de contexto largo.
- Ausencia de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni perplejidad, lo que impide comparar su calidad con el original o con otras cuantizaciones.
- Licencia Apache-2.0 permite uso comercial, pero el motor QVB8 también es Apache-2.0 y el autor no ofrece garantías ("no warranty is given").
- Madurez del ecosistema: 5 descargas y 0 likes en el momento de la consulta; proyecto de investigación independiente, no respaldado por un laboratorio grande.
- El recuento de parámetros del repo safetensors (3.080.944) no coincide con la denominación "27B" del modelo base; conviene verificar la integridad del paquete antes de usarlo en producción.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/addiesam/Qwen3.8-27B_qvb8r_2e-3_fp16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor QVB8: https://github.com/addiesam/qvb8
- Paquete alternativo qvb8 tau 1e-3: https://huggingface.co/addiesam/Qwen3.8-27B_qvb8_1e-3_fp16
- Modelo draft DFlash2: https://huggingface.co/addiesam/Qwen3.8-27B-DFlash2_qvb8r_5e-3_fp16
- Paquete Qwen3.5-9B: https://huggingface.co/addiesam/Qwen3.5-9B_qvb8_1e-3_fp16
- Modelo draft Qwen3.5-9B: https://huggingface.co/addiesam/Qwen3.5-9B-DFlash_qvb8_1e-3
- Paper I: https://doi.org/10.5281/zenodo.23815007
- Paper II: https://doi.org/10.5281/zenodo.23816044
- Paper III: https://doi.org/10.5281/zenodo.24267208
- Patrocinio del autor: https://github.com/sponsors/addiesam

# lavendercomputing/Holo4-35B-A3B-Heretic-GSQ-RCO-GGUF

## Resumen

`Holo4-35B-A3B-Heretic-GSQ-RCO-GGUF` es una cuantización GGUF de precisión mixta, publicada por lavendercomputing, de un modelo abliterado con Heretic a partir de `Hcompany/Holo4-35B-A3B`. El modelo base es un modelo visión-lenguaje de tipo mixture-of-experts (MoE) de unos 35B de parámetros, orientado a casos de uso de Computer Use: recibe capturas de pantalla y produce clics, tecleo y llamadas a herramientas. La variante Heretic elimina la dirección de rechazo del modelo mediante abliteración sin entrenamiento, preservando las trazas de razonamiento y el tool calling.

La relevancia de esta ficha radica en que permite ejecutar en hardware modesto (una sola GPU de consumo o incluso CPU) un modelo de agente visual de 35B, gracias a builds de 3,0 y 3,5 bits por peso que ocupan entre 12 y 14 GiB. La arquitectura subyacente es Qwen3.6 MoE, con 256 expertos enrutados por bloque y 8 activos por token, y una ventana de contexto de 262.144 tokens.

Cabe destacar que la cadena de provenancia incluye una generación intermedia de cuantización Q6_K antes de los builds finales de 3 bits, por lo que la calidad es ligeramente inferior a la de un camino ideal desde BF16, algo que el propio autor documenta con transparencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.6 MoE, visión-lenguaje (image-text-to-text) |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | 3B (aproximados, según la denominación A3B; 8 de 256 expertos activos por token) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ3_XXS (3,01 bpw), IQ3_S (3,51 bpw); atención a Q6_K, embeddings/salida/router a Q8_0, normas en fp32, proyector de visión en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con `mmproj.f16.gguf` en BF16 para entrada de imagen) |

Datos adicionales de arquitectura: 40 bloques, 256 expertos enrutados por bloque, 8 expertos activos por token, vocabulario de 248.320 tokens.

## Arquitectura y entrenamiento

El modelo base `Hcompany/Holo4-35B-A3B` es el miembro mediano de la familia Holo4, con arquitectura Qwen3.6 MoE: 40 bloques transformador, cada uno con 256 expertos enrutados de los que solo 8 se activan por token, lo que reduce el coste de inferencia a unos 3B de parámetros activos pese a los ~35B totales. Incluye un proyector de visión (distribuido como `mmproj.f16.gguf`) que habilita entrada de imágenes, pensado para interpretar capturas de pantalla en flujos de automatización de escritorio.

Sobre el modelo base se aplicó Heretic, una técnica de abliteración sin entrenamiento que estima la dirección de rechazo del modelo y la proyecta fuera de matrices de pesos seleccionadas, buscando configuraciones bajo una cota de divergencia KL y conservando la variante que supera una batería de pruebas de comportamiento. Al no haber fine-tuning, las capacidades generales, los bloques de razonamiento (`[Start thinking]`) y el tool calling se mantienen intactos. En cuanto a la cuantización, aproximadamente el 92 % de los parámetros reside en los tensores de expertos (`ffn_(gate|up|down)_exps`), que absorben la compresión mediante una escalera ponderada por bordes: atención a Q6_K, embeddings, salida y router a Q8_0, normas 1-D en fp32 y proyector de visión en BF16. Se aplicó la matriz de importancia (imatrix) de mradermacher. No hay información publicada sobre el proceso de entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO).

## Capacidades

- Comprensión de imágenes y texto (pipeline image-text-to-text), orientada específicamente a interpretar capturas de pantalla.
- Computer Use: generación de acciones de agente (clics, tecleo, llamadas a herramientas) a partir del estado visual de una pantalla.
- Tool calling / function calling, preservado tras la abliteración.
- Razonamiento multi-paso con trazas de pensamiento explícitas (bloques `[Start thinking]`).
- Generación de texto conversacional (etiqueta `conversational`).
- Contexto muy largo: hasta 262.144 tokens, útil para historiales de agente extensos.
- Abliteración: rechazos de contenido eliminados en la práctica, sin degradar las capacidades anteriores.
- Inferencia eficiente vía MoE: solo ~3B de parámetros activos por token.

## Casos de uso

- Automatización de escritorio (Computer Use): integrado en un harness de agente, el modelo recibe capturas de pantalla y emite acciones de clic y tecleo para completar tareas en interfaces gráficas; el propio fabricante reporta 30,9 % en OSWorld 2.0 a 0,61 $ por tarea con el modelo base.
- Agentes de navegación web: dada su ventana de 262K tokens, puede mantener historiales largos de interacción con páginas y aplicaciones sin perder contexto de la tarea original.
- Atención al cliente con visión: gestión de conversaciones multi-turno en las que el usuario comparte capturas de error, con el modelo interpretando la imagen y respondiendo o ejecutando acciones.
- Pipelines de RPA de bajo coste: con ~3B de parámetros activos y builds de 12-14 GiB, cabe en una sola GPU de consumo, abaratando el despliegue de flujos repetitivos sobre interfaces gráficas.
- Asistentes locales sin filtros: la abliteración Heretic lo hace adecuado para entornos de investigación o uso local donde se requiera evitar rechazos espurios del modelo.
- Prototipado de agentes multimodales con llama.cpp: los GGUF con `mmproj` permiten montar demos de visión-lenguaje sin depender de GPUs de datacenter.
- Procesamiento de documentos con contexto extenso: análisis de documentos largos con imágenes incrustadas aprovechando la ventana de contexto ampliada.

## Benchmarks y rendimiento

| Benchmark | Resultado | Fuente |
|---|---|---|
| OSWorld 2.0 | 30,9 % (0,61 $/tarea) | Reportado por el fabricante para el modelo base Holo4-35B-A3B, no para esta cuantización abliterada |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) para esta variante cuantizada y abliterada. El único dato de rendimiento propio es una prueba de humo en CPU con llama.cpp (build f3f31a7) a ~5 t/s, relevante solo como señal de carga y coherencia, no como cifra de servicio.

## Requisitos de hardware

- VRAM estimada para inferencia: 12,16 GiB para el build IQ3_XXS y 14,18 GiB para el IQ3_S (más el `mmproj.f16.gguf` y la KV cache, que con 262K de contexto puede ser considerable).
- Cabe en GPUs de consumo: una RTX 4090 (24 GB) o RTX 3090 acomodan el IQ3_S con margen para el proyector y contexto moderado; incluso GPUs de 16 GB podrían alojar el IQ3_XXS con contexto reducido.
- Inferencia en CPU es posible (probada en la verificación de humo a ~5 t/s), pero no recomendada para servicio.
- GPU recomendadas para mayor velocidad: RTX 4090, RTX 5090 o equivalentes con suficiente VRAM; los builds de referencia del fabricante se ejecutaron en 4×H200 y 8×H100, aunque a precisiones y formatos distintos.
- Despliegue: llama.cpp (formato nativo, con `--mmproj` para visión); compatible indirectamente con Ollama y LM Studio al ser GGUF estándar. No hay soporte declarado para vLLM o TGI con estos ficheros.
- Throughput: no disponible más allá de la cifra de humo en CPU (~5 t/s).

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Visión | Licencia | Formato |
|---|---|---|---|---|---|---|
| Holo4-35B-A3B-Heretic-GSQ-RCO (esta ficha) | ~34,7B | ~3B | 262.144 | Sí | Apache-2.0 | GGUF 3,0/3,5 bpw |
| Hcompany/Holo4-35B-A3B (base, GGUF oficial) | ~34,7B | ~3B | 262.144 | Sí | Apache-2.0 | GGUF q4_k_m (21,3 GB), BF16, FP8, NVFP4 |
| Qwen/Qwen3.6-35B-A3B (base arquitectural) | ~35B | ~3B | no disponible | no disponible | Apache-2.0 | no disponible |

Frente al GGUF oficial del fabricante (q4_k_m, 21,3 GB), esta variante ofrece ficheros un 35-45 % más pequeños a costa de más generaciones de cuantización y la abliteración, a cambio de ejecutarse en GPUs de consumo y de eliminar rechazos. Frente al modelo base sin modificar, conserva tool calling y razonamiento pero añade el comportamiento sin filtros de Heretic.

## Limitaciones y advertencias

- Calidad degradada por la cadena de cuantización: abliteración desde BF16, una generación intermedia Q6_K y luego 3 bits; inferior a un hipotético camino "Heretic-desde-BF16 → GSQ". No existe un master BF16 abliterado público.
- La abliteración es solo conductual: pueden persistir rechazos en casos límite.
- La cuantización agresiva (3,0-3,5 bpw en los expertos, que concentran el 92 % de los parámetros) puede degradar la precisión en tareas delicadas como la interpretación fina de capturas de pantalla; no hay benchmarks que cuantifiquen esta pérdida.
- La imatrix se construyó contra el modelo base no abliterado; es compatible estructuralmente, pero no está validada específicamente para los pesos abliterados.
- Riesgo de alucinación: no disponible; no se han publicado evaluaciones de fiabilidad para esta variante.
- Idiomas soportados: no disponible en la model card.
- Uso de abliteración: eliminar salvaguardas de seguridad conlleva riesgos legales y éticos; su uso en producción con usuarios finales debe evaluarse con cuidado.
- El dato de OSWorld 2.0 (30,9 %) corresponde al modelo base del fabricante, no a esta cuantización abliterada, por lo que el rendimiento en Computer Use puede ser inferior.

## Enlaces

- Ficha del modelo: https://huggingface.co/lavendercomputing/Holo4-35B-A3B-Heretic-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/Hcompany/Holo4-35B-A3B
- GGUF oficial del fabricante: https://huggingface.co/Hcompany/Holo4-35B-A3B-GGUF
- Fuente Heretic Q6_K: https://huggingface.co/jduraes/Holo4-35B-A3B-heretic-Q6_K/blob/main/holo4-35b-a3b-heretic-Q6_K.gguf
- Proyector de visión (mmproj): https://huggingface.co/jduraes/Holo4-35B-A3B-heretic-Q6_K/blob/main/mmproj.f16.gguf
- Matriz de importancia (imatrix): https://huggingface.co/mradermacher/Holo4-35B-A3B-i1-GGUF/blob/main/Holo4-35B-A3B.imatrix.gguf
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic

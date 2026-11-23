# Lucebox/Qwen3.8-27B-IQ4_XS-fast-GGUF

## Resumen

Qwen3.8-27B-IQ4_XS-fast-GGUF es una cuantización GGUF del modelo multimodal Qwen3.8-27B de Qwen (Alibaba), publicada por el usuario Lucebox. No se trata de un modelo nuevo, sino de una recuantización "pura" del IQ4_XS de bartowski mediante `llama-quantize --allow-requantize --pure`, que elimina el enfoque de precisión mixta (UD) para aplicar IQ4_XS a todos los tensores. El resultado ocupa 13,54 GiB frente a los 14,50 GiB de la variante mixta original y reduce los bytes leídos por token en el camino de kernel más rápido sobre RDNA4.

El objetivo declarado es servir Qwen3.8-27B en GPUs limitadas por ancho de banda, con un incremento medido de aproximadamente un 12% en tokens por segundo respecto a la variante UD-IQ4_XS de Unsloth. El repositorio incluye además el proyector de visión en Q8_0 (629 MB) para entrada de imágenes, lo que permite usar el modelo como image-text-to-text en el servidor lucebox.

La relevancia de esta ficha radica en que documenta un compromiso explícito entre velocidad y calidad: la cuantización pura gana rendimiento en decodificación pero pierde precisión medible frente a la referencia Q8_0 y frente a la alternativa UD. El modelo base tiene 27.320.697.856 parámetros y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo base Qwen3.8-27B; detalles de arquitectura del base no disponibles) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (según el comando de servicio con `--max-ctx 131072`) |
| Tipos de cuantizacion | IQ4_XS puro (todos los tensores); proyector de visión en Q8_0 con filas no múltiplas de 32 en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, del que no se proporcionan detalles de arquitectura interna, composición del dataset ni proceso de alineación (RLHF/DPO) en la información disponible. Lo que sí se documenta es el proceso de cuantización: se parte del IQ4_XS con calibración imatrix de bartowski y se recuantiza con `llama-quantize --allow-requantize --pure`, forzando IQ4_XS en todos los tensores en lugar de la mezcla de precisiones que usa la variante UD. El repositorio incluye también un proyector multimodal (`Qwen3.8-27B-mmproj-Q8_0.gguf`) derivado del proyector BF16 de Unsloth, con matrices recasteadas a Q8_0 y filas no múltiplas de 32 mantenidas en F16.

La innovación técnica destacable es el uso de decodificación especulativa con el drafter DFlash2 de z-lab (convertido a GGUF mediante `server/scripts/convert_dflash_to_gguf.py`), con bloque de 16 y verificación exacta, de modo que el drafter no altera las salidas. El servidor lucebox emplea caché KV en q8_0 para K y V. Las imágenes se procesan a un coste de un token por cada 32x32 píxeles, entre 64 y 1.024 tokens por imagen, con hasta cuatro imágenes por petición.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 131.072 tokens.
- Entrada de imágenes (image-text-to-text) mediante el proyector Q8_0 incluido en el repositorio, con hasta cuatro imágenes por petición en formato `image_url` estilo OpenAI.
- Razonamiento y resolución de problemas: se reportan resultados en HumanEval (164 problemas) y GSM8K (200 problemas), lo que evidencia capacidad de código y matemáticas.
- Decodificación especulativa con DFlash2 para acelerar la generación manteniendo salidas idénticas (verificación exacta).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).
- Modo "thinking" mencionado en las mediciones (se indica "thinking off" en las pruebas de visión), lo que sugiere un modo de razonamiento explícito en el modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Servicio de chat multimodal en GPUs de consumo o estaciones de trabajo con ancho de banda limitado: el modelo cabe en 13,54 GiB y ofrece 37,4 tok/s en decodificación plana y 235,8 tok/s con DFlash2 bloque 16 en HumanEval, lo que lo hace adecuado para asistentes interactivos con imágenes.
- Análisis de documentos con gráficos y tablas: con ChartQA (56 aciertos en augmentado y 42 en humano sobre 60+60) y AI2D (90 sobre 100), el modelo puede extraer información de diagramas científicos y gráficos en pipelines de documentación técnica.
- Generación de código asistida en local: los 144/164 de HumanEval pass@1 permiten integrarlo en editores o pipelines de revisión donde la latencia importa más que la precisión máxima, aceptando el coste de calidad frente a UD.
- Razonamiento matemático en entornos educativos o de validación: 171/200 en GSM8K lo hacen utilizable para resolver problemas aritméticos de varios pasos con verificación humana.
- Procesamiento por lotes de imágenes en servidores con una sola GPU Radeon AI PRO R9700: el proyector Q8_0 reduce el prefill de imagen a 0,56 s de media frente a 0,71 s con BF16, lo que mejora el throughput en cargas de visión por lotes.
- Despliegue en infraestructura AMD ROCm/HIP: el servidor lucebox con `--target-device hip:0` y `--draft-device hip:0` permite servir el modelo con decodificación especulativa en hardware RDNA4.
- Prototipado de agentes con contexto largo: la ventana de 131.072 tokens permite mantener conversaciones o documentos extensos en memoria, aunque las capacidades de tool calling no están documentadas.

## Benchmarks y rendimiento

Mediciones del autor sobre una AMD Radeon AI PRO R9700, comparando este archivo (IQ4_XS puro) con UD-IQ4_XS de Unsloth y referencia Q8_0:

| Metrica | Este archivo (puro) | UD-IQ4_XS |
|---|---|---|
| Tamano | 13,54 GiB | 13,27 GiB |
| HumanEval decode, DFlash2 bloque 16 | 235,8 tok/s (pico 257,3) | 208,1 tok/s |
| End-to-end, mismas diez prompts | 174,5 tok/s | 156,2 tok/s |
| Decode plano | 37,4 tok/s | 32,3 tok/s |
| PPL vs Q8_0 | +1,9% | +0,7% |
| KLD media vs Q8_0 | 0,028 | 0,018 |
| Acuerdo top-1 con Q8_0 | 92,0% | 94,1% |
| HumanEval pass@1 | 144/164 | 151/164 |
| GSM8K (primeros 200) | 171/200 | 177/200 |

Mediciones de visión con proyector Q8_0 frente a UD-IQ4_XS con proyector BF16:

| Metrica | Este archivo + proyector Q8_0 | UD-IQ4_XS + proyector BF16 |
|---|---|---|
| AI2D (100 preguntas con semilla) | 90 | 85 |
| ChartQA augmentado / humano (60+60) | 56 / 42 | 55 / 43 |
| Prefill de prompt con imagen, media | 0,56 s | 0,71 s |
| Una a cuatro imágenes por petición | todas correctas | todas correctas |
| Decode de petición con imagen | 36 tok/s | 31 a 35 tok/s |

La metodología de comparación de calidad emplea divergencia KL pareada sobre wikitext-2 con 300 fragmentos de 512 tokens frente a una referencia Q8_0.

## Requisitos de hardware

- VRAM estimada: aproximadamente 13,54 GiB para los pesos del modelo en IQ4_XS, más 629 MB del proyector Q8_0 si se usa visión, más la caché KV en q8_0 para K y V.
- GPU recomendadas: AMD Radeon AI PRO R9700 (medida por el autor); el modelo está pensado para GPUs limitadas por ancho de banda. Para NVIDIA no se proporcionan mediciones.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más de VRAM (por ejemplo, RTX 4090 de 24 GB), aunque no se aportan mediciones en esas GPUs.
- Opciones de despliegue: servidor lucebox (`dflash_server` o `luce_server`) con soporte de decodificación especulativa DFlash2 y entrada de imágenes (requiere build con PR #722). El formato GGUF es compatible con llama.cpp, aunque las cifras de rendimiento reportadas corresponden a lucebox.
- Latencia y throughput: 37,4 tok/s en decode plano y 235,8 tok/s con DFlash2 bloque 16 en HumanEval; 174,5 tok/s end-to-end en diez prompts; 0,56 s de prefill medio por prompt con imagen; 36 tok/s en decode de peticiones con imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Calidad vs Q8_0 | Licencia |
|---|---|---|---|---|---|
| Este archivo (IQ4_XS puro) | 27,3B | 131.072 | 13,54 GiB | PPL +1,9%, KLD 0,028, top-1 92,0% | Apache 2.0 |
| Unsloth UD-IQ4_XS | 27,3B | no disponible | 13,27 GiB | PPL +0,7%, KLD 0,018, top-1 94,1% | Apache 2.0 |
| Referencia Q8_0 | 27,3B | no disponible | no disponible | línea base | Apache 2.0 |

La comparativa se limita a variantes de cuantización del mismo modelo base, que es lo que documenta la información disponible. No se proporcionan datos de modelos alternativos de otros desarrolladores con el mismo tamaño o tarea.

## Limitaciones y advertencias

- La calidad es mediblemente inferior a la variante UD-IQ4_XS: la divergencia KL sube de 0,018 a 0,028, el acuerdo top-1 con Q8_0 baja de 94,1% a 92,0%, y se pierden 7 problemas de HumanEval y 6 de GSM8K. Para cargas sensibles a la calidad, el autor recomienda servir UD-IQ4_XS.
- El rendimiento reportado está medido en una única GPU AMD Radeon AI PRO R9700; no hay datos para NVIDIA u otro hardware.
- La entrada de imágenes requiere una build de lucebox con el PR #722; no se garantiza compatibilidad con otras implementaciones GGUF.
- El modelo es una recuantización de una recuantización (bartowski IQ4_XS recuantizado a IQ4_XS puro), lo que acumula pérdida de precisión respecto al modelo original.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del modelo base.
- El uso comercial está permitido por la licencia Apache 2.0, pero se debe verificar la licencia del modelo base Qwen3.8-27B y del proyector de Unsloth.
- El repositorio tiene pocas descargas (423) y likes (3), por lo que la validación comunitaria es escasa.
- La decodificación especulativa con DFlash2 no se aplica a peticiones con imagen según la documentación ("image requests decode without the drafter").

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Lucebox/Qwen3.8-27B-IQ4_XS-fast-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- IQ4_XS original de bartowski: https://huggingface.co/bartowski/Qwen3.8-27B-GGUF
- Variante UD-IQ4_XS de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Drafter DFlash2 de z-lab: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Repositorio lucebox: https://github.com/Luce-Org/lucebox
- PR de entrada de imágenes: https://github.com/Luce-Org/lucebox/pull/722
- Blog con metodología completa: https://www.lucebox.com/blog/qwen38-r9700

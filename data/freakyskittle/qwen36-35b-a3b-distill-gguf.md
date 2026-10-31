# freakyskittle/qwen36-35b-a3b-distill-GGUF

## Resumen

Qwen3.6 35B-A3B Distill — GGUF es una colección de cuantizaciones en formato GGUF del modelo `freakyskittle/qwen36-35b-a3b-distill`, publicado por el usuario freakyskittle en Hugging Face. El modelo base es una fusión LoRA sobre `huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated`, entrenada adicionalmente con una mezcla de destilación centrada en código. La arquitectura subyacente es un MoE híbrido de la familia Qwen3.5/3.6 con aproximadamente 35.000 millones de parámetros totales y unos 3.000 millones activos por token, lo que permite inferencia rápida con calidad de modelos mucho mayores.

Su principal valor añadido es el soporte de decodificación especulativa listo para usar: cada archivo principal del modelo incrusta la cabeza MTP (nextn), de modo que llama.cpp puede ejecutar speculative decoding sin configuración adicional. Además, incluye un draft model alternativo entrenado con DFlash2 (difusión por bloques) que genera bloques de 8 tokens verificados en paralelo. Es relevante para desarrolladores que buscan un modelo MoE eficiente, con fuerte orientación a código y alto throughput en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido (gated-deltanet + full attention), familia Qwen3.5/3.6 |
| Parametros totales | ~35.000 millones (dato safetensors del repo: 431.858.944, correspondiente a tensores individuales; el tamaño del repo es 150,9 GB) |
| Parametros activos | ~3.000 millones (por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS, Q4_K_S, Q4_K_M, Q6_K, Q8_0, TQ1_0, TQ2_0, F16 (draft MTP y DFlash2) |
| Idiomas soportados | no disponibles (la familia Qwen suele soportar multilingüe, pero no consta en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también safetensors en el repo base y en el draft DFlash2) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `qwen35moe`: un MoE híbrido que combina capas gated-deltanet (una variante de atención lineal) con capas de atención completa, con 256 expertos y unos 3.000 millones de parámetros activos por token. Este diseño híbrido reduce el coste de atención en secuencias largas manteniendo la capacidad de atención global donde importa.

El modelo de destino es una fusión LoRA sobre `huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated`, entrenada con una mezcla de destilación con fuerte peso en código (los detalles completos de entrenamiento y benchmarks están en la ficha del repositorio base, no en esta). En cuanto a innovaciones de inferencia, destaca la incrustación de la cabeza MTP (multi-token prediction, etiqueta `nextn`) en cada archivo principal, que habilita la decodificación especulativa nativa en llama.cpp. Como alternativa, el draft `DFlash2-F16` es un modelo de difusión por bloques entrenado por separado que redacta bloques de 8 tokens que el modelo de destino verifica en paralelo, con una métrica de top-16 containment del 53,5% en datos held-out. Requiere un backend consciente de DFlash2 (llama.cpp PR #27342 o los parches de SGLang/vLLM del repositorio dflash).

## Capacidades

- Generación de texto conversacional (etiqueta `conversational` en el repo).
- Generación y comprensión de código, reforzada por el entrenamiento de destilación con mezcla centrada en código.
- Decodificación especulativa nativa mediante cabeza MTP incrustada, compatible con llama.cpp sin configuración adicional.
- Decodificación especulativa avanzada con draft DFlash2 (bloques de 8 tokens verificados en paralelo) para pipelines personalizados.
- Eficiencia de inferencia propia de un MoE con ~3B de parámetros activos pese a los ~35B totales.
- Soporte de tool calling, agentes y capacidades multilingües: no disponibles explícitamente en la información proporcionada.

## Casos de uso

- Generación de código en local: el entrenamiento con mezcla pesada en código lo hace adecuado para asistentes de programación offline; con la cuantización Q4_K_M (20,2 GiB) cabe en una GPU de consumo con 24 GB de VRAM.
- Chatbots locales con alto throughput: los ~3B de parámetros activos y la cabeza MTP permiten respuestas rápidas en llama.cpp, ideal para interfaces conversacionales en estaciones de trabajo sin servidores costosos.
- Pipelines de decodificación especulativa personalizados: el draft `mtp-Merged-F16.gguf` independiente permite construir sistemas de speculative decoding a medida combinando backend y draft model de forma desacoplada.
- Experimentación con difusión por bloques: el draft DFlash2 permite probar generación draft en bloques de 8 tokens con verificación paralela en SGLang o vLLM parcheados, útil para investigación en inferencia.
- Despliegue en hardware limitado: las cuantizaciones TQ1_0 (7,5 GiB) y TQ2_0 (9,0 GiB) permiten ejecutar el modelo en portátiles o GPUs modestas, sacrificando calidad.
- Procesamiento por lotes eficiente: la arquitectura MoE con pocos parámetros activos favorece un buen throughput en servidores de inferencia cuando se atienden múltiples solicitudes concurrentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este repositorio GGUF. La única métrica publicada es la del draft DFlash2: top-16 containment del 53,5% en datos held-out. Para benchmarks del modelo base, la ficha remite al repositorio `freakyskittle/qwen36-35b-a3b-distill`.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - TQ1_0: ~7,5 GiB (ejecutable en GPUs de 8 GB con ajustes).
  - TQ2_0: ~9,0 GiB.
  - IQ4_XS: ~18,1 GiB.
  - Q4_K_S: ~19,0 GiB.
  - Q4_K_M: ~20,2 GiB.
  - Q6_K: ~27,2 GiB.
  - Q8_0: ~35,2 GiB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M con parte en CPU o para cuantizaciones más ligeras íntegramente en GPU; RTX 5090, A100 o H100 para Q6_K y Q8_0 con todo en VRAM. Con offload parcial a CPU, cualquier equipo con 32 GB de RAM puede ejecutar las cuantizaciones de 4 bits.
- Consumer GPUs: sí, las cuantizaciones de 4 bits y las TQ caben en GPUs de consumo (RTX 3090/4090, e incluso 8-12 GB con TQ1_0/TQ2_0 vía offload).
- Opciones de despliegue: llama.cpp (soporte nativo, requiere versión reciente con soporte `qwen35moe`), Ollama (vía GGUF), y para el draft DFlash2, llama.cpp PR #27342 o los parches de SGLang/vLLM del repositorio dflash.
- Latencia y throughput: no disponibles como cifras concretas; la cabeza MTP incrustada y los ~3B de parámetros activos sugieren latencias bajas, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6 35B-A3B Distill (este) | ~35B | ~3B | no disponible | Apache 2.0 | GGUF público en Hugging Face |
| Qwen3-30B-A3B (oficial) | 30,5B | 3,3B | 32.768 (128K con YaRN) | Apache 2.0 | GGUF, safetensors, soporte amplio |
| Qwen3-Next-80B-A3B | 80B | 3B | 256K | Apache 2.0 | safetensors, soporte en vLLM/SGLang |

El modelo de esta ficha se sitúa en la misma categoría de MoE con ~3B de parámetros activos que Qwen3-30B-A3B, con más parámetros totales y un entrenamiento orientado a código, pero al ser un derivado comunitario carece de la documentación y el ecosistema de soporte de los modelos oficiales de Qwen.

## Limitaciones y advertencias

- El modelo base proviene de una versión "abliterated" (con abliteración de rechazos de seguridad) de Huihui AI, lo que elimina salvaguardas de alineación: implica riesgos significativos de generación de contenido nocivo y no es apto para entornos de producción sin filtros adicionales.
- Al ser un derivado comunitario (freakyskittle), no hay garantías de calidad, mantenimiento continuo ni documentación de entrenamiento completa en esta ficha.
- Riesgo de alucinación: no disponible como métrica, pero debe asumirse el riesgo habitual de modelos de lenguaje de este tamaño.
- Longitud de contexto no documentada en esta ficha; debe verificarse en el repositorio base antes de planificar cargas con documentos largos.
- Soporte de `qwen35moe` requiere una versión reciente de llama.cpp; versiones antiguas no cargarán el modelo.
- El draft DFlash2 necesita backends específicos (llama.cpp PR #27342 o parches SGLang/vLLM), lo que limita su portabilidad.
- Licencia Apache 2.0: permite uso comercial, pero deben respetarse los términos del modelo base y de Huihui AI.
- Idiomas soportados no documentados explícitamente en esta ficha.

## Enlaces

- Repositorio GGUF: https://huggingface.co/freakyskittle/qwen36-35b-a3b-distill-GGUF
- Modelo base (fusión LoRA): https://huggingface.co/freakyskittle/qwen36-35b-a3b-distill
- Modelo abliterated original: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated
- Draft DFlash2 (safetensors): https://huggingface.co/freakyskittle/qwen36-35b-a3b-distill-dflash2
- Repositorio DFlash2: https://github.com/z-lab/dflash

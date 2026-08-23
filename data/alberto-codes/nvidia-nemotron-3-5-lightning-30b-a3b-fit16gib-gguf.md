# Alberto-Codes/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-fit16gib-GGUF

## Resumen
El modelo NVIDIA-Nemotron-3.5-Lightning-30B-A3B-fit16B-GGUF es una cuantización de precisión mixta del checkpoint oficial de NVIDIA, realizada por Alberto-Codes mediante la herramienta vramfit. El objetivo es servir el modelo completo (30 000 millones de parámetros, 3 000 millones activos) dentro de una tarjeta gráfica con 16 GiB de VRAM, manteniendo una calidad cercana a la del modelo original en BF16. El resultado es un único archivo GGUF de 15,76 GiB que se puede cargar por completo en una GPU de 16 GiB, con una ventana de contexto de 16 000 tokens y generación funcional, según la prueba de despliegue documentada.

La cuantización se basa en un mapa de sensibilidad que mide el daño que cada grupo de capas sufre al ser cuantizado. Los grupos más sensibles son las pilas de expertos (46 tensores que concentran el 93 % de los parámetros), por lo que la asignación de bits se decide principalmente sobre ellos. El resultado mejora las métricas de calidad del único GGUF publicado anteriormente (IQ2_XXS de bartowski), con una relación de perplejidad inferior y una divergencia KLD menor, a pesar de tener un tamaño de archivo 1,78 GiB menor. El archivo no incluye el bloque MTP (multi-token prediction) del modelo original, lo que limita la decodificación especulativa con ese mecanismo.

La licencia es openmdw-1.1, una licencia de código abierto con ciertas restricciones para uso comercial. El modelo está pensado para despliegues en entornos con memoria limitada, como estaciones de trabajo con GPU de gama media o tarjetas de 16 GiB, y es compatible con llama.cpp desde la versión b10326 (2026-07-07) en adelante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con 128 expertos en una proyección, 46 pilas de expertos |
| Parametros totales | 31 577 940 288 |
| Parametros activos | 3 000 000 000 (aprox., según denominación A3B) |
| Longitud de contexto | 16 000 tokens (verificado en el test de despliegue) |
| Tipos de cuantizacion | Mezcla de Q2_0, IQ4_NL y Q8_0 (según el mapa de sensibilidad) |
| Idiomas soportados | No disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 es un transformador MoE con 30 000 millones de parámetros totales y 3 000 millones activos por token. La arquitectura emplea 128 expertos en una proyección, lo que permite un alto rendimiento con un coste de inferencia bajo. El preentrenamiento se realizó con más de 20 billones de tokens, y el post-entrenamiento incluyó datos curados y sintéticos de alta calidad para alineación y mejora de la precisión. La cuantización de Alberto-Codes aplica un esquema mixto: cada grupo de capas recibe un número de bits según su sensibilidad medida con vramfit, que evalúa el cambio en la distribución de salida del modelo al cuantizar cada grupo. Los expertos, que concentran el 93 % de los parámetros, se cuantizan principalmente a 2,25 bits (Q2_0), mientras que otros grupos se quedan en 4.5 bits (IQ4_NL) o 8 bits (Q8_0). El archivo resultante omite el bloque MTP (multi-token prediction) del modelo original, por lo que no se puede usar decodificación especulativa con `--spec-type draft-mtp`.

## Capacidades

- Generación de texto en lenguaje natural, con capacidad de razonamiento y matemáticas.
- Generación de código y soporte para tareas de programación (según el modelo base).
- Soporte para conversaciones multiturno (el modelo se etiqueta como "conversational").
- Capacidades multilingües no documentadas en la información proporcionada.
- No se ha documentado soporte explícito de tool calling, function calling o agentes en la información disponible.
- No se ha documentado un modo de pensamiento (thinking mode) ni capacidades multimodales.

## Casos de uso

- **Asistentes de chat en entornos con GPU limitada**: al caber en 16 GiB de VRAM, puede ejecutarse en tarjetas como RTX 4060 Ti 16GB o RTX 4070 Ti Super, ofreciendo un asistente de conversación con contexto de 16k tokens.
- **Generación de código en entornos de desarrollo**: se puede integrar en editores o pipelines de CI/CD para autocompletar, revisar o generar fragmentos de código, gracias a su capacidad de razonamiento y a su baja huella de memoria.
- **Procesamiento de documentos largos**: con 16k tokens de contexto, puede resumir o extraer información de documentos extensos, como informes técnicos o artículos de investigación.
- **Prototipado de agentes de IA**: aunque no se confirma tool calling, su arquitectura eficiente permite probar flujos de razonamiento multi-paso en un entorno de desarrollo con una GPU de gama media.
- **Evaluación de calidad de cuantización**: el modelo sirve como referencia para estudiar el impacto de la cuantización en la calidad de la generación, comparando con el modelo base en BF16.
- **Despliegue en servicios de inferencia con presupuesto de VRAM**: adecuado para entornos con restricciones de memoria, como instancias en la nube con GPU de 16 GiB, donde se necesita un modelo de 30B con 3B activos para obtener baja latencia.

## Benchmarks y rendimiento

La model card proporciona métricas de calidad en el conjunto de test de WikiText-2 (594 fragmentos) comparando el modelo cuantizado con la referencia en f16 y con el GGUF IQ2_XXS de bartowski.

| Modelo | Tamaño de archivo | Bits/parámetro | PPL ↓ | PPL / f16 ↓ | KLD media ↓ | Coincidencia top ↑ |
|---|---|---|---|---|---|---|
| f16 referencia | 58.84 GiB | 16.007 | 6.8192 | — | — | — |
| **Este paquete** | **15.76 GiB** | **4.287** | **7.9177** | **1.161096** | **0.204318** | **83.13 %** |
| IQ2_XXS (bartowski) | 17.54 GiB | — | 9.0075 | 1.320914 | 0.370257 | 76.09 % |

La comparación se realizó con el mismo instrumento (llama.cpp b10362) y la misma matriz de importancia (la de bartowski). El paquete actual supera al comparador en ambas métricas, con una relación de perplejidad 0.1598 menor y una KLD media 44.8 % más baja, a pesar de tener 1.78 GiB menos de tamaño. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: 16 GiB para el archivo completo con 16k tokens de contexto, según la prueba de despliegue documentada (llama.cpp b10326 con Vulkan, cuatro slots de servidor).
- **GPU recomendadas**: tarjetas con 16 GiB de VRAM, como NVIDIA RTX 3060 Ti 16GB, RTX 4070 Ti Super, RTX 4080, o A100 16GB. También puede ejecutarse en tarjetas con más VRAM.
- **Compatibilidad**: requiere llama.cpp versión b10326 o posterior (2026-07-07) porque utiliza el tipo de tensor Q2_0, que se incorporó en esa versión.
- **Opciones de despliegue**: llama.cpp (con backend Vulkan o CUDA), Ollama (si se integra el archivo), u otros motores que soporten GGUF.
- **Latencia y rendimiento**: no se proporcionan datos concretos de tokens por segundo en la documentación. La prueba de servicio se realizó con cuatro slots de servidor, lo que sugiere que el modelo puede atender múltiples peticiones simultáneas dentro del límite de VRAM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| **NVIDIA-Nemotron-3.5-Lightning-30B-A3B-fit16B** | 30B total, 3B activos | 16k | openmdw-1.1 | GGUF (este repo) | Cuantización optimizada para 16 GiB, sin MTP |
| **NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16** | 30B total, 3B activos | 16k (presumible) | openmdw-1.1 | safetensors | Modelo base sin cuantizar |
| **IQ2_XXS (bartowski)** | 30B total, 3B activos | 16k (presumible) | openmdw-1.1 | GGUF | Cuantización estándar con MTP incluido, 17.54 GiB |

La comparación se limita a los datos proporcionados. No se dispone de otros modelos comparables con el mismo perfil de tamaño y VRAM.

## Limitaciones y advertencias

- **No incluye bloque MTP**: la decodificación especulativa con `--spec-type draft-mtp` no está disponible en este archivo.
- **Requisito de versión de llama.cpp**: se necesita al menos la versión b10326 (2026-07-07) para cargar el archivo; versiones anteriores lo rechazan.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en contextos largos o con entradas ambiguas.
- **Sesgos**: no se documentan sesgos específicos, pero el modelo hereda los del entrenamiento de NVIDIA.
- **Licencia**: la licencia openmdw-1.1 tiene condiciones específicas para uso comercial; se debe revisar el texto completo en https://openmdw.ai/license/1-1/.
- **Contexto limitado**: la ventana de 16k tokens es fija en esta cuantización; no se admite extrapolación a ventanas más largas sin modificar el archivo.

## Enlaces

- [HuggingFace - Alberto-Codes/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-fit16gib-GGUF](https://huggingface.co/Alberto-Codes/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-fit16gib-GGUF)
- [HuggingFace - nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16)
- [NVIDIA NIM - Nemotron-3.5-Lightning-30B-A3B (model card)](https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard)
- [NVIDIA NIM - Nemotron-3.5-Lightning-30B-A3B (página de despliegue)](https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b)
- [GitHub - NVIDIA-NeMo/Nemotron](https://github.com/NVIDIA-NeMo/Nemotron)

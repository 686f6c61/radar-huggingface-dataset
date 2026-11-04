# scottlowry/Swift1.5-GLM-5.3-Flash-oQ4e-mtp

## Resumen

Swift1.5-GLM-5.3-Flash-oQ4e-mtp es una cuantización mixta de precisión del modelo ukisai/Swift1.5-GLM-5.3-Flash, publicada por el usuario scottlowry. Se trata de un checkpoint de aproximadamente 321.300 millones de parámetros totales, derivado de la familia GLM (etiqueta `glm5_next`) y empaquetado en formato MLX para su ejecución en hardware Apple Silicon. La cuantización se ha realizado con la herramienta oQ (oMLX v0.7.3), que aplica precisión mixta por tensor en lugar de un esquema uniforme.

El checkpoint combina capas en 4 bits afines con grupo de 64 (el 96,99% de los pesos lógicos), una fracción en 8 bits (2,79%), y pequeños restos en BF16 y FP32, alcanzando un promedio efectivo de 4,641 bits por peso. El resultado ocupa 173,6 GiB en disco (186,4 GB), lo que lo sitúa fuera del alcance de cualquier equipo de consumo convencional y lo restringe a estaciones de trabajo o servidores con memoria unificada muy amplia.

La relevancia de esta publicación es doble: por un lado, demuestra la viabilidad de comprimir modelos de escala frontier a ~4,6 bits por peso con pérdida mínima de precisión en los tensores críticos; por otro, incorpora una cabeza MTP (multi-token prediction) de 7.433 millones de parámetros y un codificador visual de 0.564 millones, lo que apunta a un modelo multimodal con decodificación especulativa integrada. No obstante, la información pública disponible es muy limitada: no hay model card descriptiva del modelo base, ni benchmarks, ni licencia declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia GLM, tag `glm5_next`); detalles no disponibles |
| Parámetros totales | 321.323.031.390 (321,3 B) |
| Parámetros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta: affine 4-bit grupo 64 (96,99%), affine 8-bit grupo 64 (2,79%), BF16 (0,19%), FP32 (0,03%); promedio 4,641 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), 173,6 GiB / 186,4 GB |

Desglose por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 313,327 B | 180,966 GB / 168,538 GiB |
| Visión | 0,564 B | 1,127 GB / 1,050 GiB |
| Cabeza MTP | 7,433 B | 4,309 GB / 4,013 GiB |
| Total | 321,323 B | 186,402 GB / 173,600 GiB |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de la etiqueta `glm5_next` y la presencia de tres componentes diferenciados: un modelo de lenguaje de 313.327 millones de parámetros, un módulo de visión de 0,564 millones y una cabeza MTP de 7.433 millones. La existencia de una cabeza MTP sugiere que el modelo base fue entrenado con objetivos de predicción multi-token, una técnica que permite generar varios tokens por paso y acelera la decodificación mediante mecanismos especulativos internos. El módulo de visión confirma capacidades multimodales de entrada de imagen.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron etapas de RLHF, DPO o ajuste por preferencias. Tampoco se documenta ninguna innovación adicional (atención lineal, SSM híbrido, decodificación especulativa externa). La única información técnica verificable es el esquema de cuantización: oQ asigna 8 bits y BF16/FP32 a los tensores que más sensibilidad presentan (probablemente embeddings, normas y cabezas), mientras que el grueso de las matrices de proyección se comprime a 4 bits con grupo de 64, un compromiso habitual para preservar calidad en modelos de gran escala.

## Capacidades

- Generación de texto y razonamiento de propósito general, asumiendo el comportamiento esperado de un modelo de la familia GLM de escala frontier.
- Procesamiento de imágenes: el checkpoint incluye un módulo de visión (0,564 B de parámetros), por lo que se espera soporte de entrada multimodal.
- Predicción multi-token (MTP): la cabeza dedicada de 7.433 B habilita decodificación especulativa nativa, con potencial de acelerar la generación.
- Capacidades multilingües: no confirmadas en la información disponible.
- Tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Modo thinking explícito: no confirmado en la información disponible.

## Casos de uso

- Investigación en cuantización de modelos a gran escala: el checkpoint sirve como referencia para estudiar el impacto de la precisión mixta (4/8/16/32 bits) en la calidad de salida de un modelo de 321 B, comparando contra el base en BF16.
- Evaluación de decodificación especulativa con MTP: la cabeza MTP permite medir la ganancia de throughput frente a decodificación autoregresiva estándar en hardware Apple Silicon con MLX.
- Prototipado multimodal en estaciones de trabajo Mac: con 173,6 GiB, un Mac Studio con memoria unificada de 192 GB o superior puede cargar el modelo y realizar pruebas de visión-lenguaje sin infraestructura de datacenter.
- Generación de código asistida en entornos de desarrollo locales: si el modelo base conserva las capacidades de código habituales en la familia GLM, podría integrarse en asistentes locales con la ventaja de privacidad total al no requerir API externa.
- Análisis de documentos largos con contexto extenso: aunque la longitud de contexto no está documentada, los modelos de esta escala suelen soportar ventanas amplias; sería adecuado para resumen y extracción sobre corpus extensos, previa verificación empírica.
- Benchmarking de herramientas de cuantización: comparar oQ (oMLX) frente a otras alternativas (GGUF Q4_K_M, AWQ, GPTQ) en términos de perplejidad, latencia y huella de memoria sobre el mismo modelo base.
- Fine-tuning ligero sobre la versión cuantizada: no recomendable en 4 bits, pero el checkpoint puede servir para extraer estadísticas de activación o calibrar cuantizaciones posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~174 GiB solo para pesos; se necesita margen adicional para KV cache y activaciones, por lo que el mínimo práctico ronda los 192 GB de memoria unificada o VRAM agregada.
- GPU recomendadas: no es un checkpoint pensado para CUDA; el formato es MLX. Para ejecución en Apple Silicon se requiere un Mac Studio M2 Ultra (192 GB), M3 Ultra (512 GB) o superior. En GPUs NVIDIA no es directamente cargable sin conversión.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090 dispone de 24 GB; RTX 5090, 32 GB). Tampoco en configuraciones multi-GPU de consumo convencionales sin offloading masivo a RAM del sistema, lo que degradaría drásticamente el throughput.
- Opciones de despliegue: MLX (mlx-lm / mlx-examples) es la vía nativa; para otros runtimes sería necesaria conversión a GGUF (llama.cpp) o a formatos de vLLM/TGI, con posible pérdida de la cabeza MTP y del módulo de visión según la herramienta.
- Latencia y throughput: no disponibles. La presencia de MTP sugiere optimización para generación especulativa, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Swift1.5-GLM-5.3-Flash-oQ4e-mtp (este) | 321,3 B | no disponible | Mixta 4/8/16/32 bits (4,641 bits/peso) | no disponible | safetensors MLX |
| ukisai/Swift1.5-GLM-5.3-Flash (base) | no disponible (probablemente ~321 B) | no disponible | BF16 (presumiblemente) | no disponible | safetensors |
| Otros GLM de escala comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre modelos comparables de la misma familia o tamaño en el material proporcionado para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido. Es imprescindible contactar con el autor o consultar el modelo base antes de cualquier despliegue en producción.
- Idiomas no declarados: se desconoce el soporte real de castellano u otras lenguas distintas del inglés (si es que el base lo soporta).
- Sin benchmarks: no hay evidencia publicada de calidad, por lo que cualquier evaluación de capacidades debe realizarse empíricamente.
- Cuantización agresiva: 4,641 bits/peso promedio puede degradar tareas sensibles a precisión (matemáticas, código, razonamiento de cadena larga) en comparación con el base en BF16.
- Restricción de hardware: 173,6 GiB de pesos limita su uso a estaciones con memoria unificada muy alta; no es desplegable en GPUs de consumo ni en la mayoría de instancias cloud estándar.
- Formato MLX: no es portable directamente a ecosistemas CUDA (vLLM, TGI, TensorRT-LLM); requiere conversión y posible pérdida de componentes (MTP, visión).
- Riesgo de alucinación: inherente a los modelos de lenguaje de gran escala; sin datos de alineación (RLHF/DPO) no se puede estimar su magnitud.
- Sesgos: no documentados; se heredan los del corpus de entrenamiento del base, desconocido.
- Cabeza MTP y módulo de visión: su correcto funcionamiento tras la cuantización no está verificado en la información disponible; algunos tensores de estas componentes podrían haber quedado en 4 bits y perder fidelidad.
- Repositorio sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scottlowry/Swift1.5-GLM-5.3-Flash-oQ4e-mtp
- Modelo base: https://huggingface.co/ukisai/Swift1.5-GLM-5.3-Flash
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx

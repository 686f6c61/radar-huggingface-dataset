# HawkBearPig/GLM-5.3-Int4-Int8Mix-AWQ-g64

## Resumen

El modelo GLM-5.3-Int4-Int8Mix-AWQ-g64 es una cuantización de precisión mixta del modelo de lenguaje GLM-5.3 de zai-org, publicada por el autor HawkBearPig (Stephen Hawkins). GLM-5.3 es un modelo mixto de expertos (MoE) de gran escala, con un tamaño declarado de 754B parámetros y tipo de arquitectura `glm_moe_dsa`. El objetivo de este checkpoint es permitir que el modelo completo se ejecute en cuatro sistemas NVIDIA DGX Spark mediante el motor DGPP, con tensor parallelism TP=4. El resultado es un checkpoint de aproximadamente 398 GiB, lo que equivale a unos 99,8 GiB por rank, dejando margen para el contexto.

La relevancia de esta publicación radica en su enfoque de cuantización mixta: los expertos enrutados se almacenan en int4 con AWQ y grupo 64, mientras que las capas de atención, los expertos compartidos y las capas densas se almacenan en int8 o bf16. Según el autor, esta combinación alcanza un error por capa similar al de una receta completamente fp8, pero aproximadamente a la mitad de bytes. Además, se corrige un defecto del mapeo AWQ estándar para este tipo de MoE, relacionado con el plegado de escalas en el router y en los indexadores DSA. La longitud de contexto no se especifica en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE, tipo `glm_moe_dsa` |
| Parametros totales | 390.942.074.880 según safetensors; 754B según la descripción del modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 simétrico, grupo 64, with AWQ para expertos enrutados; int8 simétrico, grupo 64 para atención y expertos compartidos; bf16 para capas densas, routers, normas, embeddings, `lm_head` y bloque MTP |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, compressed-tensors `pack-quantized` (`weight_packed` int32, `weight_scale` bf16, `weight_shape`) |

## Arquitectura y entrenamiento

La arquitectura de GLM-5.3 es un transformer MoE con el tipo de modelo `glm_moe_dsa`. La estructura por capas, descrita en la model card, es la siguiente: las capas 0 a 2 son densas; las capas 3 a 77 contienen expertos enrutados y expertos compartidos; la capa 78 corresponde a un bloque MTP (multi-token prediction). La atención utiliza proyecciones `q_a`, `q_b`, `kv_a_proj_with_mqa`, `kv_b` y `o_proj`, lo que sugiere atención con múltiples consultas (MQA). Algunas capas (concretamente 18, según la corrección descrita) incorporan indexadores DSA, que afectan al escalado de la capa.

El proceso de cuantización se realizó con llm-compressor 0.13.0, aplicando AWQ de forma secuencial capa a capa. Se calibró con 512 secuencias de 2048 tokens (1,05M tokens en total), extraídas con una semilla fija de un corpus mixto de prosa, código, matemáticas y transcripciones conversacionales o de uso de herramientas. Cada experto enrutado se calibró con los tokens que realmente le fueron asignados. Se realizó una segunda muestra independiente de 512 filas, que reprodujo el error de salida con una desviación inferior al 0,1%, lo que indica que el tamaño de calibración no era limitante.

Un aspecto técnico destacable es la corrección del plegado de escalas. El mapeo AWQ de llm-compressor para `glm_moe_dsa` plegaba la escala de `post_attention_layernorm` en la norma, pero no compensaba el router del MoE (`mlp.gate`) ni los indexadores DSA (`wk`, `weights_proj`, `wq_b`). Como resultado, esos módulos recibían `x / s`, y el error por capa era entre 5 y 10 veces peor que el redondeo simple (round-to-nearest). En este checkpoint, las columnas de pesos afectadas se han reescalado con la relación `original_norm / smoothed_norm`, lo que restaura el rendimiento a niveles ligeramente mejores que el redondeo simple. Los fragmentos corregidos llevan la clave de metadatos `fold_corrected` en safetensors.

## Capacidades

- Generación de texto en modo conversacional, dado que el checkpoint se publica para el pipeline `text-generation`.
- Modelo MoE de 754B parámetros declarados, con una estructura de capas densas, capas con MoE y un bloque MTP.
- Soporte de tool-use no confirmado formalmente, aunque el corpus de calibración incluye transcripciones de uso de herramientas.
- Capacidades de razonamiento matemático y generación de código probablemente presentes, ya que el corpus de calibración incluye matemáticas y código, pero sin evaluaciones end-to-end publicadas.
- No se especifican capacidades de visión ni audio.
- La longitud de contexto no se indica, por lo que no es posible afirmar un valor concreto.
- La compatibilidad con llamadas a funciones (function calling) no está documentada en la información proporcionada.

## Casos de uso

- Inferencia a gran escala en clústeres DGX Spark: gracias a la cuantización int4/int8 y al tensor parallelism TP=4, el checkpoint ocupa aproximadamente 99,8 GiB por rank y puede desplegarse en cuatro sistemas DGX Spark con el motor DGPP. Es la configuración de despliegue que el autor ha validado.
- Asistentes conversacionales en plataformas de chat: el modelo se publica para el pipeline de generación de texto y su corpus de calibración incluye transcripciones conversacionales, por lo que puede emplearse en sistemas de diálogo multi-turno, aunque la longitud de contexto no está especificada.
- Generación de código y refactorización automatizada: el corpus de calibración incluye código, y la naturaleza MoE del modelo permite mantener un coste computacional relativamente controlado por token. Sin embargo, no se han publicado métricas de HumanEval ni evaluaciones similares.
- Razonamiento matemático asistido: la calibración incluye matemáticas, y el modelo probablemente maneja problemas aritméticos y algebraicos, aunque no hay benchmarks específicos que lo confirmen.
- Flujos de trabajo con tool-use: el corpus de calibración incluye transcripciones de tool use, lo que sugiere que el modelo puede adaptarse a escenarios de uso de herramientas. No obstante, la compatibilidad con tool calling formal no está documentada.
- Investigación sobre cuantización de MoE: este checkpoint, junto con su gemelo RTN (`HawkBearPig/GLM-5.3-Int4-Int8Mix-RTN-g64`), permite comparar el efecto de AWQ frente al redondeo simple en un modelo MoE de gran escala, así como evaluar la corrección del plegado en el router y los indexadores DSA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente: «No end-to-end evaluation yet (perplexity, benchmarks): the numbers above are per-layer. Treat this as a carefully validated but not yet benchmarked checkpoint».

En lugar de benchmarks estándar, la model card incluye mediciones de error relativo RMS por capa sobre 32 muestras reales de 2048 tokens, comparando la salida de la capa cuantizada con la capa bf16 original. La métrica «contribución» mide el error de lo que la capa añade (salida menos entrada), y «residual» mide el error total del flujo residual que sale de la capa. Los datos principales son los siguientes:

| Capa | Variante | Contribución | Residual |
|---|---|---|---|
| 3 | Este checkpoint (AWQ int4 g64, corregido) | 2,38 % | 0,53 % |
| 3 | RTN int4 g64 (sin AWQ) | 2,40 % | 0,54 % |
| 3 | AWQ sin corregir (g128) | 12,5 % | 2,80 % |
| 3 | fp8 e4m3 g128 | 2,46 % | 0,55 % |
| 6 (con indexador) | Este checkpoint | 3,27 % | 1,50 % |
| 6 (con indexador) | RTN int4 g64 | 3,44 % | 1,58 % |
| 6 (con indexador) | AWQ sin corregir | 30,5 % | 14,0 % |
| 21 | Este checkpoint | 10,95 % | 0,58 % |
| 21 | RTN int4 g64 | 11,09 % | 0,59 % |
| 42 (con indexador) | Este checkpoint | 9,85 % | 2,00 % |
| 42 (con indexador) | RTN int4 g64 | 9,89 % | 2,01 % |
| 63 | Este checkpoint | 12,50 % | 2,34 % |
| 63 | RTN int4 g64 | 12,50 % | 2,34 % |

El autor señala que el error residual crece con la profundidad, pasando de 0,53 % en la capa 3 a 2,34 % en la capa 63. La ventaja de AWQ sobre el redondeo simple es real únicamente en las capas superficiales con indexador, y resulta despreciable a profundidad. Este checkpoint y su variante RTN son equivalentes capa a capa.

## Requisitos de hardware

- Tamaño total del checkpoint: 398 GiB (≈ 99,8 GiB por rank con TP=4).
- Para inferencia se requieren al menos 4 dispositivos con memoria suficiente para alojar ~100 GiB cada uno. El autor especifica cuatro NVIDIA DGX Sparks como plataforma de destino para DGPP.
- No es viable de ejecutar en una GPU de consumo con 24 GB de VRAM; se necesita hardware profesional con memoria de gran capacidad.
- El despliegue se ha validado únicamente con el motor DGPP. La carga con vLLM o transformers no ha sido testeada.
- La herramienta de cuantización se ejecutó con una NVIDIA B200, según la model card.
- No se proporcionan datos de latencia ni de throughput.

## Comparativa con modelos similares

No se dispone de datos suficientes para comparar este checkpoint con modelos de la misma categoría en términos de parámetros, contexto o rendimiento. La única referencia directa es el checkpoint companion del mismo autor, `HawkBearPig/GLM-5.3-Int4-Int8Mix-RTN-g64`, que aplica la misma receta pero con redondeo simple en lugar de AWQ. Sin embargo, no se conocen sus especificaciones exactas ni sus resultados. El modelo base original es `zai-org/GLM-5.3-BF16`, pero no hay datos públicos de benchmarks que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No existe evaluación end-to-end: no se han publicado métricas de perplejidad ni resultados de benchmarks sobre conjuntos de evaluación estándar. El autor recomienda tratarlo como un checkpoint validado por capas pero no aún evaluado.
- El despliegue solo se ha probado con el motor DGPP. La compatibilidad con vLLM, transformers u otros motores no está verificada, a pesar de que el formato compressed-tensors es estándar.
- El error por capa aumenta con la profundidad, alcanzando un 2,34 % de error residual relativo en la capa 63. Este error podría acumularse en la generación, aunque eso no se ha medido.
- La corrección del plegado es específica de este tipo de arquitectura y de la versión de llm-compressor utilizada. Un cambio de versión podría invalidar la corrección.
- Los sesgos inherentes al modelo base no han sido evaluados para esta cuantización. No hay información sobre riesgos de alucinación ni sobre comportamientos no deseados.
- La longitud de contexto no está documentada, lo que limita su uso en aplicaciones que requieran ventanas de contexto largas.
- La licencia del checkpoint es MIT, pero es necesario verificar que la licencia del modelo base `zai-org/GLM-5.3-BF16` permita el uso comercial en cada caso concreto.

## Enlaces

- https://huggingface.co/HawkBearPig/GLM-5.3-Int4-Int8Mix-AWQ-g64
- https://huggingface.co/HawkBearPig (perfil del autor)
- https://huggingface.co/zai-org/GLM-5.3-BF16 (modelo base, no analizado en esta ficha)
- https://huggingface.co/HawkBearPig/GLM-5.3-Int4-Int8Mix-RTN-g64 (checkpoint companion mencionado en la model card)

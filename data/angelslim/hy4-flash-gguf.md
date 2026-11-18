# AngelSlim/Hy4-flash-GGUF

## Resumen

Hy4-flash es un modelo de lenguaje desarrollado por Tencent, distribuido a través del proyecto AngelSlim, un conjunto de herramientas de compresión de modelos. Esta ficha documenta los cinco builds GGUF publicados por AngelSlim para el modelo base `tencent/Hy4-flash`, orientados a inferencia local en hardware de gama alta (Mac M5 Max de 128 GB y RTX Spark de 128 GB). El repositorio ocupa 155,4 GB y contiene cuantizaciones que van desde 125,73 GiB (IQ2-AH) hasta 156,79 GiB (Q4_K_M).

La relevancia de esta publicación radica en que permite ejecutar un modelo de gran tamaño con llama.cpp en equipos de consumo con memoria unificada de 128 GB, algo impensable hace pocos años. Los builds incluyen recetas específicas (Q4_K_M estándar de llama.cpp, SPARK-4Bit con formato de coma flotante de 4 bits de NVIDIA, y variantes mixtas Q3_K e IQ2-AH) con decisiones de cuantización sensibles a la capa para las proyecciones de expertos enrutados.

La información pública disponible es limitada: la model card se centra en los detalles de cuantización y rendimiento, y no especifica arquitectura, número de parámetros, longitud de contexto, licencia ni idiomas. Los datos de arquitectura y entrenamiento que aparecen a continuación se infieren de los detalles técnicos mencionados (expertos enrutados, tabla Engram) y deben tratarse como orientativos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con expertos enrutados (MoE), según referencias a "routed experts" y "Engram table" en la model card; detalles completos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (arquitectura MoE confirmada por referencias a expertos enrutados) |
| Longitud de contexto | no disponible (se han medido velocidades a 4K, 16K y 32K tokens, lo que sugiere soporte de al menos 32K) |
| Tipos de cuantización | Q4_K_M, Q3_K, IQ2-AH, SPARK-4Bit, SPARK-4Bit-Fast (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors del modelo base presumiblemente en `tencent/Hy4-flash`, no confirmado) |

## Arquitectura y entrenamiento

La model card confirma que Hy4-flash emplea una arquitectura con expertos enrutados (MoE), ya que las recetas de cuantización distinguen explícitamente entre "routed experts" y pesos no-expertos. Las proyecciones `gate`/`up` de los expertos enrutados reciben tratamientos diferenciados según la capa (por ejemplo, Q4_K en 19 capas y Q6_K en 22 para `down` en Q4_K_M, o Q4_K en 19 capas y Q3_K en 22 para `gate`/`up` en Q3_K), lo que indica que el modelo aplica reglas de sensibilidad por capa. También se menciona una "Engram table", un componente adicional que ocupa espacio en el archivo y que se excluye del cálculo de bpw efectivo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras. El informe técnico referenciado (arXiv:2602.21233) corresponde al toolkit AngelSlim, no necesariamente al modelo Hy4-flash en sí. La innovación destacable de esta publicación es la propia receta de cuantización: el uso de SPARK-4Bit (formato FP4 de NVIDIA) y de mezclas sensibles a la capa para mantener calidad en modelos MoE de gran tamaño.

## Capacidades

- Generación de texto: capacidades generales de un modelo de lenguaje de gran escala, aunque no se detallan en la model card.
- Razonamiento y matemáticas: no documentado explícitamente.
- Generación de código: no documentado explícitamente.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentado (idiomas no disponibles).
- Capacidades especiales (thinking mode, visión, audio): no documentado.
- Inferencia local en llama.cpp: confirmada, con parches específicos para Mac y builds para RTX Spark.

## Casos de uso

- Inferencia local en Mac de gama alta: con 128 GB de memoria unificada, un Mac M5 Max puede ejecutar Q4_K_M (156,79 GiB) o Q3_K (144,70 GiB) y obtener 44-50 tokens/s de decodificación, lo que permite usar el modelo como asistente personal sin conexión.
- Despliegue en estaciones RTX Spark: los builds SPARK-4Bit y SPARK-4Bit-Fast están optimizados para el formato FP4 de NVIDIA y ofrecen 26-35 tokens/s de decodificación, adecuados para prototipado en hardware Blackwell.
- Procesamiento de documentos largos: la ventana de al menos 32K tokens (medida en los benchmarks de velocidad) permite resumir o analizar contratos, informes o código fuente extensos en una sola pasada.
- Evaluación de cuantizaciones: los cinco builds permiten comparar el impacto de Q4_K_M, Q3_K, IQ2-AH y SPARK-4Bit en calidad y velocidad sobre el mismo modelo base, útil para investigación en compresión.
- Generación asistida en entornos con restricciones de red: al ejecutarse localmente con llama.cpp, el modelo no requiere enviar datos a servicios en la nube, lo que encaja en sectores regulados.
- Experimentación con modelos MoE de gran tamaño: investigadores pueden estudiar el comportamiento de expertos enrutados y tablas Engram en un entorno controlado con hardware de 128 GB.

## Benchmarks y rendimiento

La model card incluye una imagen de benchmarks (`hy4-flash-gguf-benchmark.png`) cuyo contenido numérico no se ha podido extraer. Los únicos datos numéricos disponibles son las velocidades de inferencia:

**Mac M5 Max 128 GB**

| Formato | Prompt tok/s (4K / 16K / 32K) | Decode tok/s (4K / 16K / 32K) |
|---|---|---|
| Q4_K_M | 629,8 / 448,1 / 418,6 | 48,13 / 45,18 / 44,15 |
| Q3_K | 743,2 / 563,0 / 520,6 | 50,34 / 49,47 / 47,37 |

**RTX Spark 128 GB**

| Formato | Prompt tok/s (4K / 16K / 32K) | Decode tok/s (4K / 16K / 32K) |
|---|---|---|
| SPARK-4Bit-Fast | 799 / 717 / 707 | 31,95 / 33,14 / 33,39 |
| SPARK-4Bit | 765 / 686 / 666 | 26,28 / 30,23 / 35,38 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: entre 125,73 GiB (IQ2-AH) y 156,79 GiB (Q4_K_M) solo para los pesos; hay que añadir la memoria para el contexto KV y el runtime de llama.cpp.
- GPU recomendadas: RTX Spark de 128 GB (builds SPARK-4Bit) y Apple Silicon con 128 GB de memoria unificada (Mac M5 Max). No se documenta compatibilidad con A100, H100 ni RTX 4090.
- Consumer GPU: no cabe en ninguna GPU de consumo convencional (24 GB o menos). Requiere hardware de 128 GB o más, como Mac Studio/MacBook Pro con M5 Max o estaciones RTX Spark.
- Opciones de despliegue: llama.cpp (con parche `hy4-flash-mac-minimal.patch` para Mac, commit 2cbca389f). No se mencionan vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: ver tabla de benchmarks. En Mac M5 Max, decodificación de 44-50 tok/s; en RTX Spark, 26-35 tok/s. El prompt processing oscila entre 418 y 799 tok/s según formato y longitud.

## Comparativa con modelos similares

No disponible. La model card no identifica modelos comparables ni se dispone de datos de parámetros, contexto o calidad para establecer una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no especifica licencia; no se puede confirmar el uso comercial sin consultar el repositorio del modelo base `tencent/Hy4-flash`.
- No se documentan sesgos conocidos, pero todo modelo de lenguaje presenta riesgo de sesgo y alucinación; la ausencia de información al respecto no implica ausencia de riesgo.
- Los idiomas soportados no están documentados, lo que impide garantizar calidad multilingüe.
- La longitud de contexto no está confirmada; los benchmarks solo llegan a 32K tokens.
- El tamaño de los archivos (125-157 GiB) limita el despliegue a hardware de 128 GB o más; no es viable en GPU de consumo estándar.
- La receta de cuantización IQ2-AH (2,0625 bpw en expertos enrutados) puede degradar la calidad de forma notable frente a Q4_K_M; se recomienda validar en la tarea concreta.
- El repositorio tiene 0 descargas y 4 likes en el momento de la consulta, lo que indica que es una publicación reciente y poco validada por la comunidad.
- Requiere un parche específico de llama.cpp en Mac; la compatibilidad con versiones futuras del motor no está garantizada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Informe técnico (AngelSlim): https://arxiv.org/abs/2602.21233
- Documentación: https://angelslim.readthedocs.io/
- Organización AngelSlim en Hugging Face: https://huggingface.co/AngelSlim
- ModelScope: https://modelscope.cn/organization/AngelSlim
- Repositorio GitHub: https://github.com/Tencent/AngelSlim
- Discord: https://discord.com/invite/dHVNeuNdFt
- README específico para Spark: https://huggingface.co/AngelSlim/Hy4-flash-GGUF/blob/main/README_SPARK-4Bit.md

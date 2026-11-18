# bloomer010/Ling-3.0-flash-GGUF

## Resumen

Ling-3.0-flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por inclusionAI, con 124.000 millones de parámetros totales y 5.100 millones activos por token. Emplea una arquitectura híbrida que combina capas KDA (Kimi Delta Attention, una variante de atención lineal) con capas de atención MLA con compuerta (gated MLA), distribuidas en 42 capas objetivo más un bloque MTP/NextN adicional. El modelo está orientado a generación de texto conversacional con soporte de modo de razonamiento (thinking mode) activado por defecto.

La ficha que nos ocupa documenta la conversión a formato GGUF realizada por el usuario bloomer010, publicada en Hugging Face bajo licencia MIT. Esta conversión permite ejecutar el modelo en llama.cpp con soporte nativo de decodificación especulativa, incluyendo tanto la cabeza MTP integrada en los propios pesos como drafts externos DSpark. Es relevante ahora porque demuestra que un MoE de 124B puede desplegarse en hardware de gama alta de consumo mediante cuantizaciones agresivas y offload selectivo de expertos a CPU.

El modelo base procede de inclusionAI/Ling-3.0-flash, y esta versión GGUF ha acumulado más de 50.000 descargas, lo que indica un interés considerable en la comunidad de inferencia local. La ventana de contexto alcanza los 256K tokens según la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: 35 capas KDA (atención lineal) + 7 capas gated MLA, más bloque MTP/NextN |
| Parametros totales | 127.486.405.600 (124B aprox.) |
| Parametros activos | 5.100 millones (5.1B) por token |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | MXFP4_MOE, IQ1_S, IQ1_M, IQ2_M, UD-Q2_K_XL, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_M, UD-Q6_K_XL, Q8_0, UD-Q8_K_XL |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); safetensors BF16 en el modelo base |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura MoE con 42 capas objetivo. Las dos primeras capas usan FFN densas; las 40 restantes emplean 512 expertos enrutados con selección top-8 más un experto compartido. El enrutamiento utiliza puntuación sigmoide, sesgo de experto, ocho grupos de expertos y selección de cuatro grupos. De las 42 capas, 35 son KDA (atención lineal con compuerta segura implementada como `lower_bound * sigmoid(exp(A_log) * (f_proj(x) + dt_bias))`, con cota inferior de -5.0) y 7 son gated MLA en los índices 5, 11, 17, 23, 29, 35 y 41. Existe además un bloque MTP/NextN en el índice 42, incluido en cada cuantización.

La conversión GGUF aplica transformaciones específicas: `A_log` se almacena como `exp(A_log)`, la proyección `kv_b_proj` de MLA se divide en tensores K y V separados con K transpuesta, los pesos de convolución KDA se reforman y los tensores por experto se apilan en tensores GGUF de experto. Normas, tensores de enrutamiento, sesgo de enrutamiento, escalares de estado KDA, `dt_bias` y pesos de convolución permanecen en F32. La matriz de importancia se generó a partir del modelo Q8_0 usando `wiki.train.raw` (100 fragmentos de 512 tokens, 51.200 tokens de calibración, 573 entradas de matriz).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. El modelo soporta decodificación especulativa mediante dos vías: la cabeza MTP integrada (activada con `--spec-type draft-mtp`) y drafts externos DSpark (`Ling-3.0-flash-dspark-BF16.gguf` de 1,9 GB y `Ling-3.0-flash-dspark-Q4_K_M.gguf` de 665 MB).

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 256K tokens.
- Modo de razonamiento (thinking mode) activado por defecto, desactivable por petición mediante `"chat_template_kwargs": {"enable_thinking": false}`.
- Decodificación especulativa mediante cabeza MTP integrada o drafts DSpark externos.
- Soporte de plantillas Jinja en llama.cpp (`--jinja`), lo que habilita el formato de chat del modelo.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque el thinking mode sugiere razonamiento extendido.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente conversacional de contexto largo: el modelo puede mantener conversaciones multi-turno con hasta 256K tokens de ventana, adecuado para análisis de documentos extensos o historiales de chat prolongados en los que se requiere recordar información de las primeras interacciones.
- Despliegue en estaciones de trabajo con GPU única: con cuantizaciones Q4_K_S (74 GB) o Q3_K_M (63 GB), el modelo cabe en GPUs de 48-80 GB como A100 o H100, permitiendo servir un MoE de 124B en un solo acelerador.
- Inferencia local con offload de expertos: en equipos con 24 GB de VRAM, la cuantización IQ1_M (30 GB) junto con `-ot "ffn_.*_exps\.weight=CPU"` mantiene los expertos en CPU y el resto en GPU, habilitando el modelo en GPUs de consumo como la RTX 4090.
- Aceleración de inferencia en producción: la decodificación especulativa con drafts DSpark (aceptación 0,26-0,29 y longitud media aceptada de 3,09-3,28 tokens por paso) reduce el número de pasos de decodificación, útil en servicios de generación de texto con latencia crítica.
- Prototipado e investigación en arquitecturas híbridas: al combinar capas KDA de atención lineal con gated MLA, el modelo sirve para estudiar el comportamiento de arquitecturas híbridas en tareas de razonamiento y generación long-context.
- Evaluación de cuantizaciones extremas: la disponibilidad de recetas Unsloth-style (UD-Q2_K_XL con expertos en IQ2_XS/IQ3_XXS y proyecciones de atención en mayor precisión) permite medir la degradación de calidad en regímenes de 2-3 bits por peso sobre un MoE de gran tamaño.
- Experimentación con decodificación especulativa: los drafts DSpark y la cabeza MTP integrada ofrecen dos mecanismos comparables para medir tasas de aceptación y throughput en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento disponibles son métricas de decodificación especulativa medidas por el autor de la conversión:

| Draft | Aceptación | Longitud media aceptada |
|---|---|---|
| DSpark BF16 | 0,29 | 3,28 tokens/paso |
| DSpark Q4_K_M | 0,26 | 3,09 tokens/paso |
| Cabeza MTP integrada (NextN) | 0,18 | 2,43 tokens/paso |

Estas métricas se midieron contra el modelo principal en Q5_K_M.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaños de archivo reportados por el autor):
  - UD-Q8_K_XL: 177 GB (192 GB+ de memoria)
  - Q8_0: 136 GB (128 GB)
  - UD-Q6_K_XL: 116 GB (96 GB)
  - Q5_K_M: 92 GB (80 GB, A100/H100)
  - Q4_K_M: 78 GB (64 GB)
  - Q4_K_S: 74 GB / MXFP4_MOE: 70 GB (56 GB)
  - Q3_K_M: 63 GB (48 GB)
  - UD-Q2_K_XL: 43 GB / IQ2_M: 42 GB (32 GB)
  - IQ1_M: 30 GB (24 GB, con offload de expertos)
  - IQ1_S: aproximadamente 24,9 GiB (esperado)
- GPU recomendadas: A100 u H100 de 80 GB para Q5_K_M; GPUs de 48-64 GB para Q3_K_M y Q4_K_M; RTX 4090 (24 GB) solo con IQ1_M y offload de expertos a CPU.
- Cabe en GPU de consumo: sí, con cuantizaciones IQ1/IQ2 y offload selectivo de expertos a CPU mediante `-ot "ffn_.*_exps\.weight=CPU"`. La ruta nativa MXFP4_MOE requiere GPUs con soporte MXFP4 (Blackwell RTX 50-series, GB10/DGX Spark); en otro hardware cae a una ruta de dequantización más lenta.
- Opciones de despliegue: llama.cpp (llama-server), con soporte de `-ngl`, `-ncmoe`, `-ncmoed`, `-ngld` para control de colocación de expertos y drafts. No se documentan otras opciones como vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles de forma absoluta; solo se conocen las métricas relativas de aceptación de decodificación especulativa.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los datos disponibles no permiten establecer una comparación rigurosa con alternativas de la misma categoría (MoE de ~100-130B con contexto de 256K) en términos de parámetros, contexto, rendimiento, licencia y disponibilidad.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ling-3.0-flash (GGUF) | 124B totales / 5,1B activos | 256K | MIT | Hugging Face (bloomer010/Ling-3.0-flash-GGUF) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo en la información disponible.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en cuantizaciones de baja precisión.
- Las cuantizaciones agresivas (IQ1, IQ2, Q2_K_XL) degradan la calidad; el propio autor advierte que archivos más pequeños implican "más compresión, más slop y mal comportamiento".
- Idiomas soportados no documentados; no se puede garantizar un rendimiento adecuado fuera de los idiomas del entrenamiento original.
- El uso de MXFP4_MOE en GPUs sin soporte nativo provoca una ruta de dequantización más lenta; se recomienda Q4_K_S en hardware anterior a Blackwell.
- La decodificación especulativa con la cabeza MTP integrada ofrece menor aceptación (0,18) que los drafts DSpark (0,26-0,29); el autor recomienda DSpark en la mayoría de configuraciones.
- El peso y contexto comparten memoria; es necesario dejar margen libre, lo que puede limitar la ventana efectiva en configuraciones ajustadas de VRAM.
- Licencia MIT: permite uso comercial, pero se recomienda verificar las condiciones del modelo base inclusionAI/Ling-3.0-flash, ya que la información disponible no detalla posibles restricciones adicionales del autor original.
- La fecha de creación del repositorio (2026-08-04) y la de actualización (2026-11-17) son posteriores a la fecha actual de referencia; conviene verificar la vigencia de los artefactos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bloomer010/Ling-3.0-flash-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Draft DSpark: https://huggingface.co/inclusionAI/Ling-3.0-flash-dspark
